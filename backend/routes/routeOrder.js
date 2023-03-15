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

routeOrder.route('/summary').get(
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
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
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
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
