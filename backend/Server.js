// Import necessary modules
import express from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import routeSeed from './routes/routeSeed.js';
import routeProduct from './routes/routeProduct.js';
import routeSliderImage from './routes/routeSliderImage.js';
import routeUser from './routes/routeUser.js';
import routeOrder from './routes/routeOrder.js';

// Load environment variables from .env file
config();

// Connect to MongoDB
connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB: ', error.message);
  });

// Create Express application
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/api/keys/paypal', (req, res) => {
  res.send(`${process.env.PAYPAL_CLIENT_ID}` || 'sb');
});

// Use routes for seed, products, and slider images
app.use('/api/seed', routeSeed);
app.use('/api/products', routeProduct);
app.use('/api/sliderImages', routeSliderImage);
app.use('/api/users', routeUser);
app.use('/api/orders', routeOrder);

app.use((error, req, res, next) => {
  res.status(500).send({ message: error.message });
});

// Start the Express application
// Listen on the specified port or 3000 if none is provided
// Log a message on the console to indicate the server is running and on which port.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Best True Value Hardware app listening at http://localhost:${port}`
  );
});
