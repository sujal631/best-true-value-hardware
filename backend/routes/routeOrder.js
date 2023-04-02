// Import required modules
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import { isAuth, isAdmin } from '../utils.js';

// Create a new router instance
const routeOrder = express.Router();

// Route for getting all paid orders
routeOrder.route('/').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Find all paid orders and populate the user field with the firstName and lastName fields
    const orders = await Order.find({ isPaid: true })
      .populate('user', 'firstName lastName')
      .sort({ paidAt: -1 });
    res.send(orders);
  })
);

const PAGE_SIZE = 10;
// Route for getting orders for the admin dashboard
routeOrder.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = parseInt(query.page) || 1;
    // The number of orders to show per page
    const pageSize = parseInt(query.limit) || PAGE_SIZE;
    // The search term used to filter orders
    const searchTerm = query.searchTerm || '';
    // Filter to show only pickup-ready orders
    const isPickupReadyFilter = query.isPickupReadyFilter;

    // If a search term is provided, add it to the search filter
    const searchFilter = searchTerm
      ? {
          $or: [
            { 'user.firstName': { $regex: searchTerm, $options: 'i' } },
            { 'user.lastName': { $regex: searchTerm, $options: 'i' } },
          ],
        }
      : {};

    // If the pickup-ready filter is provided, add it to the filter
    const isPickupReadyFilterObj = isPickupReadyFilter
      ? { isPickupReady: isPickupReadyFilter === 'true' }
      : {};

    // Combine all filters
    const finalFilter = {
      ...searchFilter,
      ...isPickupReadyFilterObj,
      isPaid: true,
    };

    // Get the orders, populate the user field with the firstName and lastName fields, and exclude the user password field
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
      { $sort: { isPickupReady: 1, paidAt: -1 } },
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize },
      { $project: { 'user.password': 0 } },
    ]);

    // Get the count of orders that match the filters
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

    // Response with an array of orders that meet the specified search criteria and are sorted by descending order of '_id'
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

// Route for handling order-related requests
// Create a new order
routeOrder.route('/').post(
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // Create a new order from the request body
    const order = await Order.create({
      ...req.body,
      user: req.user._id,
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
    });
    // Send success response with status code 201 and the new order object
    res.status(201).send({ message: 'Order added successfully', order });
  })
);

//Route for the dashboard
routeOrder.route('/dashboard').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Get the time range for the dashboard, default is 'daily'
    const timeRange = req.query.timeRange || 'daily';

    // Function to calculate the date boundary based on the time range
    const getDateBoundary = (timeRange) => {
      const now = new Date();
      const boundary = new Date(now);

      let dateFormat;
      // Adjust the boundary date based on the time range
      switch (timeRange) {
        case 'daily':
          boundary.setDate(now.getDate() - 3);
          break;
        case 'weekly':
          boundary.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          boundary.setMonth(now.getMonth() - 1);
          boundary.setDate(1);
          break;
        case 'yearly':
          boundary.setFullYear(now.getFullYear() - 1);
          break;
        default:
          boundary.setFullYear(2023);
          boundary.setMonth(1);
          boundary.setDate(1);
          break;
      }

      return boundary;
    };

    // Get the date boundary based on the time range
    const dateBoundary = getDateBoundary(timeRange);

    // Aggregation pipeline to get daily orders within the date boundary
    const dailyOrders = await Order.aggregate([
      {
        // Filter only paid orders
        $match: {
          isPaid: true,
        },
      },
      {
        // Filter orders within the date boundary
        $match: {
          paidAt: { $gte: dateBoundary },
        },
      },
      {
        // Add a field with the converted date based on the time range
        $addFields: {
          convertedDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
          },
        },
      },

      {
        // Group by the converted date and sum the orders and sales
        $group: {
          _id: '$convertedDate',
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      // Sort by date
      { $sort: { _id: 1 } },
    ]);

    // After sorting, fill in the missing dates with zero sales and orders
    let currentDate = new Date(dateBoundary);
    let filledDailyOrders = [];
    dailyOrders.forEach((dailyOrder) => {
      while (currentDate.toISOString().slice(0, 10) !== dailyOrder._id) {
        filledDailyOrders.push({
          _id: currentDate.toISOString().slice(0, 10),
          orders: 0,
          sales: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      filledDailyOrders.push(dailyOrder);
      currentDate.setDate(currentDate.getDate() + 1);
    });

    while (currentDate <= new Date()) {
      filledDailyOrders.push({
        _id: currentDate.toISOString().slice(0, 10),
        orders: 0,
        sales: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregation pipeline to get total orders and sales
    const orders = await Order.aggregate([
      {
        $match: {
          isPaid: true, //filter paid orders only
        },
      },
      {
        // Group and sum the number of orders and total sales
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
      {
        // Add default values if no data is available
        $addFields: {
          numOrders: { $ifNull: ['$numOrders', 0] },
          totalSales: { $ifNull: ['$totalSales', 0] },
        },
      },
    ]);

    // Aggregation pipeline to get the total number of users
    const users = await User.aggregate([
      {
        // Group and sum the number of users
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
      {
        // Add default value if no data is available
        $addFields: {
          numUsers: { $ifNull: ['$numUsers', 0] },
        },
      },
    ]);

    // Aggregation pipeline to get the product count by department
    const productDepartments = await Product.aggregate([
      {
        // Group by department and count products
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregation pipeline to get the revenue by department
    const revenueByDepartment = await Order.aggregate([
      // Filter only paid orders
      {
        $match: {
          isPaid: true,
        },
      },
      {
        // Unwind the order items array
        $unwind: '$orderItems',
      },
      {
        // Lookup product information
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
        // Group by department and sum the revenue
        $group: {
          _id: '$productInfo.department',
          revenue: {
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
          },
        },
      },
      {
        // Sort by revenue in descending order
        $sort: { revenue: -1 },
      },
    ]);

    // Aggregation pipeline to get the new and returning customers
    const newReturningCustomers = await Order.aggregate([
      {
        // Filter only paid orders
        $match: {
          isPaid: true,
        },
      },
      {
        // Filter orders within the date boundary
        $match: {
          paidAt: { $gte: dateBoundary },
        },
      },
      {
        // Group by user and count orders
        $group: {
          _id: '$user',
          count: { $sum: 1 },
        },
      },
      {
        // Lookup customer information
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        // Filter only valid customers
        $match: {
          customer: { $ne: [] },
        },
      },
      {
        // Group by new or returning customer and count
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
      dailyOrders: filledDailyOrders,
      productDepartments,
      revenueByDepartment,
      newReturningCustomers,
    });
  })
);

//Route for displaying top selling products
routeOrder.route('/top-selling-products').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Aggregate pipeline for fetching top-selling products
    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          isPaid: true, //filter paid orders only
        },
      },
      {
        // Unwind the order items array
        $unwind: '$orderItems',
      },
      {
        // Group by product ID and sum the quantities and total revenues
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
        // Lookup product information
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        // Project the desired fields
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

// Route to get orders of the authenticated user
routeOrder.route('/mine').get(
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = PAGE_SIZE;

    // Find all orders with user ID from the request
    const orders = await Order.find({ user: req.user._id })
      .sort({ isPaid: 1, isPickupReady: 1, createdAt: -1 })
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

// Route to get a specific order by ID
routeOrder.route('/:id').get(
  isAuth,
  expressAsyncHandler(async (req, res) => {
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

//Route to update pickup status of a specific order by ID
routeOrder.route('/:id/pickupReady').put(
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPickupReady = true;
      await order.save();
      // If order is ready for pickup, send success response
      res.send({ message: 'Ready for PICK UP' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

// Route to update payment status of a specific order by ID
routeOrder.route('/:id/pay').put(
  isAuth,
  expressAsyncHandler(async (req, res) => {
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

export default routeOrder;
