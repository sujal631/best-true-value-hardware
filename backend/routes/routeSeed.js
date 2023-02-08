// Import necessary modules
import express from 'express';
import data from '../data.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// Create express router instance
const routeSeed = express.Router();

// Route handler for the seed route
routeSeed.get('/', async (req, res) => {
  try {
    // Remove all existing products from the database
    await Product.deleteMany({});

    // Insert the products from the data file into the database
    const createdProducts = await Product.insertMany(data.products);

    // Remove all existing users from the database
    await User.deleteMany({});

    // Insert the users from the data file into the database
    const createdUsers = await User.insertMany(data.users);

    // Return the newly created products and users
    res.send({ createdProducts, createdUsers });
  } catch (error) {
    // Catch and log any errors that occur during seed creation
    console.error(error);
    res.status(500).send({ error: 'Error seeding database' });
  }
});

// Export the routeSeed router
export default routeSeed;
