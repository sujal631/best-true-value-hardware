import express from 'express';
import data from './data.js';
import images from './images.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Succeeded to connect to MongoDB');
  })
  .catch((error) => {
    console.log(error.message);
  });

const app = express();

app.get('/api/sliderImages', (req, res) => {
  res.send(images.sliderImages);
});

app.get('/api/products', (req, res) => {
  res.send(data.products);
});

app.get('/api/products/slug/:slug', (req, res) => {
  const product = data.products.find((p) => p.slug === req.params.slug);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Sorry, product can not be found.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Best True Value Hardware app listening at http://localhost:${port}`
  );
});
