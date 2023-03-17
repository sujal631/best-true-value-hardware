import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const routeProduct = express.Router();

// Route handler to fetch all products from the database
routeProduct.get('/', async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    // Send the list of products back to the client as a response
    res.status(200).send(products);
  } catch (error) {
    // If there was an error while retrieving products, send a server error response
    res.status(500).send({
      message: 'Error occurred while fetching products. Please try again later',
    });
  }
});

routeProduct.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: 'Product' + Date.now(),
      slug: 'slug-' + Date.now(),
      image: '/images/p1.png',
      brand: 'Brand' + Date.now(),
      department: 'Department' + Date.now(),
      description: 'Description' + Date.now(),
      price: 0,
      countInStock: 0,
      rating: 0,
      numReviews: 0,
    });
    const product = await newProduct.save();
    res.send({ message: 'New Product Created', product });
  })
);

routeProduct.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.image = req.body.image;
      product.brand = req.body.brand;
      product.department = req.body.department;
      product.description = req.body.description;
      product.price = req.body.price;
      product.countInStock = req.body.countInStock;
      await product.save();
      res.send({ message: 'Update Successful' });
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  })
);

const PAGE_SIZE = 10;
routeProduct.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.limit || PAGE_SIZE;
    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// Route handler to fetch a specific product by its slug
routeProduct.get('/slug/:slug', async (req, res) => {
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
        'Error occurred while fetching product details. Please try again later',
    });
  }
});

routeProduct.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.send(product);
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
        'Error occurred while fetching product details. Please try again later',
    });
  }
});

export default routeProduct;
