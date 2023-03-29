import Stripe from 'stripe';
import express from 'express';
import config from '../config.js';
import Order from '../models/orderModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';

const stripe = Stripe(config.STRIPE_SECRET_KEY);

const routeStripe = express.Router();
routeStripe.get('/secret/:id', async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    '_id name email'
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // Round the amount to the nearest integer
    currency: 'usd',
    // Verify your integration in this guide by including this parameter
    metadata: { integration_check: 'accept_a_payment' },
  });
  res.send({ order, client_secret: paymentIntent.client_secret });
});

routeStripe.put('/:id/secret', async (req, res) => {
  const { id, status, update_time, email_address } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isPaid: true,
        paidAt: Date.now(),
        paymentResult: { id, status, update_time, email_address },
      },
      { new: true }
    );
    if (updatedOrder) {
      res.send(updatedOrder);
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

routeStripe.get('/key', (req, res) => {
  res.send(config.STRIPE_PUBLISHABLE_KEY);
});

export default routeStripe;
