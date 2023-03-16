// Import required modules
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import { isAuth, isAdmin } from '../utils.js';

// Create a new router instance
const routeOrder = express.Router();

// Define routes for handling order-related requests
// Create a new order
routeOrder.route('/').post(
  isAuth, // Middleware for checking if user is authenticated
  expressAsyncHandler(async (req, res) => {
    // Async function to handle the request
    // Create a new order from the request body
    const order = await Order.create({
      ...req.body,
      user: req.user._id, // Add user ID from request to the new order
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })), // Add product ID to each order item
    });
    // Send success response with status code 201 and the new order object
    res.status(201).send({ message: 'Order added successfully', order });
  })
);

routeOrder.route('/dashboard').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const timeRange = req.query.timeRange || 'daily';

    const getDateBoundary = (timeRange) => {
      const now = new Date();
      const boundary = new Date(now);

      switch (timeRange) {
        case 'weekly':
          boundary.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          boundary.setMonth(now.getMonth() - 1);
          break;
        case 'yearly':
          boundary.setFullYear(now.getFullYear() - 1);
          break;
        default:
          boundary.setFullYear(1970); // Set to the Unix epoch to include all records
      }

      return boundary;
    };

    const dateBoundary = getDateBoundary(timeRange);

    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateBoundary },
        },
      },
      {
        $addFields: {
          convertedDate: {
            $cond: [
              { $eq: [timeRange, 'yearly'] },
              { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$convertedDate',
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const orders = await Order.aggregate([
      {
        $match: {
          isPaid: true, // Add this line to filter paid orders only
        },
      },
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
      {
        $addFields: {
          numOrders: { $ifNull: ['$numOrders', 0] },
          totalSales: { $ifNull: ['$totalSales', 0] },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
      {
        $addFields: {
          numUsers: { $ifNull: ['$numUsers', 0] },
        },
      },
    ]);

    const productDepartments = await Product.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    const revenueByDepartment = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $group: {
          _id: '$productInfo.department',
          revenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const highestRevenueCustomer = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateBoundary },
        },
      },
      {
        $group: {
          _id: '$user',
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 0,
          user: { $arrayElemAt: ['$user', 0] },
          revenue: 1,
        },
      },
    ]);

    res.send({
      users: users.length ? users : [{ numUsers: 0 }],
      orders: orders.length ? orders : [{ numOrders: 0, totalSales: 0 }],
      dailyOrders,
      productDepartments,

      revenueByDepartment,
      highestRevenueCustomer: highestRevenueCustomer.length
        ? highestRevenueCustomer
        : [{ user: null, revenue: 0 }],
    });
  })
);

routeOrder.route('/top-selling-products').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } }, // Sort by descending revenue, change to totalQuantity to sort by quantity
      { $limit: 10 }, // Limit the results to the top 10 products
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $project: {
          _id: 0,
          product: { $arrayElemAt: ['$product', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Send the fetched top-selling products in the response object
    res.send(topSellingProducts);
  })
);
// Get orders of the authenticated user
routeOrder.route('/mine').get(
  isAuth, // Middleware for checking if user is authenticated
  expressAsyncHandler(async (req, res) => {
    // Async function to handle the request
    // Find all orders with user ID from the request
    const orders = await Order.find({ user: req.user._id });
    // Send success response with the orders array
    res.send(orders);
  })
);

// Get a specific order by ID
routeOrder.route('/:id').get(
  isAuth, // Middleware for checking if user is authenticated
  expressAsyncHandler(async (req, res) => {
    // Async function to handle the request
    // Find order with ID from the request
    const order = await Order.findById(req.params.id);
    if (order) {
      // If order exists, send success response with the order object
      res.send(order);
    } else {
      // If order does not exist, send error response with status code 404 and error message
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// Update payment status of a specific order by ID
routeOrder.route('/:id/pay').put(
  isAuth, // Middleware for checking if user is authenticated
  expressAsyncHandler(async (req, res) => {
    // Async function to handle the request
    // Find order with ID from the request
    const order = await Order.findById(req.params.id);
    if (order) {
      // If order exists, update payment status and payment details
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();
      // Send success response with updated order object
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      // If order does not exist, send error response with status code 404 and error message
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// Export the router instance
export default routeOrder;
