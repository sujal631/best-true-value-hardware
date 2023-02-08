// Import the mongoose library
import mongoose from 'mongoose';

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
    category: {
      // Define the category field with a string type, and set it as a required field
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
