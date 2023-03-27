// Import required modules
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import { isAuth, isAdmin } from '../utils.js';

// Create a new router instance
const routeOrder = express.Router();

routeOrder.route('/').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ isPaid: true })
      .populate('user', 'firstName lastName')
      .sort({ paidAt: -1 });
    res.send(orders);
  })
);

const PAGE_SIZE = 10;
routeOrder.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.limit) || PAGE_SIZE;
    const searchTerm = query.searchTerm || '';
    const isPickupReadyFilter = query.isPickupReadyFilter;

    const searchFilter = searchTerm
      ? {
          $or: [
            { 'user.firstName': { $regex: searchTerm, $options: 'i' } },
            { 'user.lastName': { $regex: searchTerm, $options: 'i' } },
          ],
        }
      : {};

    const isPickupReadyFilterObj = isPickupReadyFilter
      ? { isPickupReady: isPickupReadyFilter === 'true' }
      : {};

    const finalFilter = {
      ...searchFilter,
      ...isPickupReadyFilterObj,
      isPaid: true,
    };

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: finalFilter },
      { $sort: { _id: -1 } },
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize },
      { $project: { 'user.password': 0 } },
    ]);

    const countOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: finalFilter },
      { $count: 'countOrders' },
    ]);

    res.send({
      orders,
      countOrders: countOrders.length > 0 ? countOrders[0].countOrders : 0,
      page,
      pages: Math.ceil(
        (countOrders.length > 0 ? countOrders[0].countOrders : 0) / pageSize
      ),
    });
  })
);

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
          isPaid: true, //filter paid orders only
        },
      },
      {
        $match: {
          paidAt: { $gte: dateBoundary },
        },
      },
      {
        $addFields: {
          convertedDate: {
            $switch: {
              branches: [
                {
                  case: { $eq: [timeRange, 'yearly'] },
                  then: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
                },
                {
                  case: { $eq: [timeRange, 'monthly'] },
                  then: {
                    $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
                  },
                },
                {
                  case: { $eq: [timeRange, 'weekly'] },
                  then: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: {
                        $subtract: [
                          '$paidAt',
                          {
                            $multiply: [
                              86400000,
                              { $mod: [{ $dayOfWeek: '$paidAt' }, 7] },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  case: { $eq: [timeRange, 'all'] },
                  then: {
                    $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
                  },
                },
              ],
              default: {
                $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
              },
            },
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
          isPaid: true, //filter paid orders only
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
      {
        $match: {
          isPaid: true, //filter paid orders only
        },
      },
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

    const newReturningCustomers = await Order.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $match: {
          paidAt: { $gte: dateBoundary },
        },
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$count', 1] },
              'New Customer',
              'Returning Customer',
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    res.send({
      users: users.length ? users : [{ numUsers: 0 }],
      orders: orders.length ? orders : [{ numOrders: 0, totalSales: 0 }],
      dailyOrders,
      productDepartments,
      revenueByDepartment,
      newReturningCustomers,
    });
  })
);

routeOrder.route('/top-selling-products').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          isPaid: true, //filter paid orders only
        },
      },
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
    const page = parseInt(req.query.page) || 1;
    const limit = PAGE_SIZE;

    // Find all orders with user ID from the request
    const orders = await Order.find({ user: req.user._id })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Order.countDocuments({ user: req.user._id });

    // Send success response with the orders array, current page, and total pages
    res.send({
      orders,
      page,
      pages: Math.ceil(count / PAGE_SIZE),
    });
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

routeOrder.route('/:id/pickupReady').put(
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPickupReady = true;
      await order.save();
      res.send({ message: 'Ready for PICK UP' });
    } else {
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
