import express from 'express';
import Product from '../models/productModel.js';

const routeProduct = express.Router();

routeProduct.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

routeProduct.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({
      message: 'Sorry, product you are looking for can not be found.',
    });
  }
});

export default routeProduct;
