import express from 'express';
import images from './images.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routeSeed from './routes/routeSeed.js';
import routeProduct from './routes/routeProduct.js';
import routeSliderImage from './routes/routeSliderImage.js';

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

app.use('/api/seed', routeSeed);
app.use('/api/products', routeProduct);
app.use('/api/sliderImages', routeSliderImage);

/* app.get('/api/sliderImages', (req, res) => {
  res.send(images.sliderImages);
}); */

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Best True Value Hardware app listening at http://localhost:${port}`
  );
});
