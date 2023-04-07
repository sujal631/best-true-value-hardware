// Import the mongoose library
import mongoose from 'mongoose';
import User from '../models/userModel.js';
// Define the product schema using the mongoose schema constructor
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    title: { type: String, required: false },
    comment: { type: String, required: false },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Define the product schema using the mongoose schema constructor
const productSchema = new mongoose.Schema(
  {
    name: {
      // Define the name field with a string type, and set it as a required field
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      // Define the slug field with a string type, and set it as a required field
      type: String,
      required: true,
      unique: true,
    },
    image: {
      // Define the image field with a string type, and set it as a required field
      type: String,
      required: true,
    },
    brand: {
      // Define the brand field with a string type, and set it as a required field
      type: String,
      required: true,
    },
    department: {
      // Define the department field with a string type, and set it as a required field
      type: String,
      required: true,
    },
    description: {
      // Define the description field with a string type, and set it as a required field
      type: String,
      required: true,
    },
    price: {
      // Define the price field with a number type, and set it as a required field
      type: Number,
      required: true,
    },
    countInStock: {
      // Define the countInStock field with a number type, and set it as a required field
      type: Number,
      required: true,
    },
    rating: {
      // Define the rating field with a number type, and set it as a required field
      type: Number,
      required: true,
    },
    numReviews: {
      // Define the numReviews field with a number type, and set it as a required field
      type: Number,
      required: true,
    },
    reviews: [reviewSchema],
  },
  {
    // Enable timestamps for the schema
    timestamps: true,
  }
);

// Create the product model using the defined schema
const Product = mongoose.model('Product', productSchema);

// Export the product model
export default Product;
