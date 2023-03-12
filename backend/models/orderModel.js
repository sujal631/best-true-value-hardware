// Importing Mongoose module for creating MongoDB schema
import mongoose from 'mongoose';

// Destructuring the schema and model classes from the mongoose module
const { Schema, model } = mongoose;

// Defining a new Mongoose schema for Order
const orderSchema = Schema(
  {
    // Order items with their details
    orderItems: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    // Shipping details of the order
    shippingInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      region: { type: String, required: true },
      zip: { type: String, required: true },
    },

    // Payment method details of the order
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    // Price details of the order
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // User details and payment result of the order
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isPickupReady: { type: Boolean, default: false },
  },
  // Enabling timestamps for order creation and updates
  {
    timestamps: true,
  }
);

// Creating a new Mongoose model named 'Order' from the schema and exporting it
const Order = model('Order', orderSchema);
export default Order;
