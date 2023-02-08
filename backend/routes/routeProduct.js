import express from 'express';
import Product from '../models/productModel.js';

const productRouter = express.Router();

// Route handler to fetch all products from the database
productRouter.get('/', async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    // Send the list of products back to the client as a response
    res.status(200).send(products);
  } catch (error) {
    // If there was an error while retrieving products, send a server error response
    res.status(500).send({
      message: 'Error occured while fetching products. Please try again later',
    });
  }
});

// Route handler to fetch a specific product by its slug
productRouter.get('/slug/:slug', async (req, res) => {
  try {
    // Retrieve the product with the matching slug from the database
    const product = await Product.findOne({ slug: req.params.slug });

    // If the product exists, send it as a response
    if (product) {
      res.status(200).send(product);
    } else {
      // If the product does not exist, send a not found response
      res.status(404).send({
        message: 'Sorry, the product you are looking for cannot be found.',
      });
    }
  } catch (error) {
    // If there was an error while retrieving the product details, send a server error response
    res.status(500).send({
      message:
        'Error occured while fetching product details. Please try again later',
    });
  }
});

export default productRouter;
