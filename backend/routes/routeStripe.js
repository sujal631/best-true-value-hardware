//Import necessary modules
import Stripe from 'stripe';
import express from 'express';
import config from '../config.js';
import Order from '../models/orderModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';

// Initialize Stripe with the Stripe secret key from the configuration file
const stripe = Stripe(config.STRIPE_SECRET_KEY);

// Create a new Express router
const routeStripe = express.Router();

// Route to retrieve the client secret for a payment intent for a given order ID
routeStripe.get('/secret/:id', async (req, res) => {
  // Find the order with the given ID and populate its user field with their _id, name, and email
  const order = await Order.findById(req.params.id).populate(
    'user',
    '_id name email'
  );

  // Create a new payment intent with the order's total price and USD currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // Round the amount to the nearest integer
    currency: 'usd',
    // Verify your integration in this guide by including this parameter
    metadata: { integration_check: 'accept_a_payment' },
  });
  // Return the order and the client secret for the payment intent to the client
  res.send({ order, client_secret: paymentIntent.client_secret });
});

// Route to update an order's payment status with the details of a Stripe payment
routeStripe.put('/:id/secret', async (req, res) => {
  // Extract the payment details from the request body
  const { id, status, update_time, email_address } = req.body;

  try {
    // Update the order with the given ID to be marked as paid, and add the payment details
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isPaid: true,
        paidAt: Date.now(),
        paymentResult: { id, status, update_time, email_address },
      },
      { new: true }
    );
    // If the order was successfully updated, send it back to the client
    if (updatedOrder) {
      res.send(updatedOrder);
    } else {
      // If the order was not found, return a 404 error
      res.status(404).send({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Route to retrieve the Stripe publishable key
routeStripe.get('/key', (req, res) => {
  res.send(config.STRIPE_PUBLISHABLE_KEY);
});

export default routeStripe;
