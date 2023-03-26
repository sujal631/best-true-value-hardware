// Import necessary modules
import express from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import routeSeed from './routes/routeSeed.js';
import routeProduct from './routes/routeProduct.js';
import routeSliderImage from './routes/routeSliderImage.js';
import routeUser from './routes/routeUser.js';
import routeOrder from './routes/routeOrder.js';
import routeCloudinary from './routes/routeCloudinary.js';
import routeTwilio from './routes/routeTwilio.js';
import twilio from 'twilio';

// Load environment variables from .env file
config();
//Load twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Create Twilio client
const client = new twilio(accountSid, authToken);

// Function to test Twilio connection by checking the account balance
async function testTwilioConnection() {
  try {
    const balanceData = await client.balance.fetch();
    console.log(
      `Successfully connected to Twilio. Balance: $${balanceData.balance}`
    );
  } catch (error) {
    console.log(`Error connecting to Twilio: ${error.message}`);
  }
}

// Call the testTwilioConnection and MongoDB
connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    return testTwilioConnection(); // Make sure this line is present and correct
  })
  .catch((error) =>
    console.log(`Error connecting to MongoDB: ${error.message}`)
  );

// Create Express application
const app = express();

app.use(express.json(), express.urlencoded({ extended: true }));

// Route to retrieve PayPal client ID
app.get('/api/keys/paypal', (req, res) =>
  res.send(`${process.env.PAYPAL_CLIENT_ID || 'sb'}`)
);

// Use routes for seed, products, slider images, users, and orders
app.use('/api/seed', routeSeed);
app.use('/api/upload', routeCloudinary);
app.use('/api/products', routeProduct);
app.use('/api/sliderImages', routeSliderImage);
app.use('/api/users', routeUser);
app.use('/api/orders', routeOrder);
app.use('/api/twilio', routeTwilio);

// Error handling middleware
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
