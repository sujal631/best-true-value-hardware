import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';

const routeSeed = express.Router();

routeSeed.get('/', async (req, res) => {
  await Product.remove({});

  const createdProducts = await Product.insertMany(data.products);
  res.send({ createdProducts });
});

export default routeSeed;
