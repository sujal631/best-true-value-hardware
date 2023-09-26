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
import routeStripe from './routes/routeStripe.js';
import routeTwilio from './routes/routeTwilio.js';
import routeSendGrid from './routes/routeSendGrid.js';
import twilio from 'twilio';
import sendgrid from 'sendgrid';
import path from 'path';

// Load environment variables from .env file
config();
//Load twilio and SendGrid credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const sendgridKey = process.env.SENDGRID_API_KEY;

// Create Twilio client
const client = new twilio(accountSid, authToken);

//Create SendGrid Clienr
const client1 = new sendgrid(sendgridKey);

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

// Function to test SendGrid connection by checking the account
async function testSendGridConnection() {
  try {
    console.log(`Successfully connected to SendGrid.`);
  } catch (error) {
    console.log(`Error connecting to SendGrid: ${error.message}`);
  }
}

// Call the testTwilioConnection and MongoDB
connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    return testTwilioConnection() && testSendGridConnection();
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

// Use routes for seed, cloudinary, products, slider images, users, orders, stripe, twilio and sending email
app.use('/api/seed', routeSeed);
app.use('/api/upload', routeCloudinary);
app.use('/api/products', routeProduct);
app.use('/api/sliderImages', routeSliderImage);
app.use('/api/users', routeUser);
app.use('/api/orders', routeOrder);
app.use('/api/stripe', routeStripe);
app.use('/api/twilio', routeTwilio);
app.use('/api/sendgrid', routeSendGrid);

// get the directory name of the current module, i.e., the directory where the current JavaScript file resides
const __dirname = path.resolve();
// tells Express to serve static files (like HTML, CSS, and JavaScript files) from the frontend/build directory
app.use(express.static(path.join(__dirname, '/frontend/build')));
// catch-all route that directs any GET requests that don't match any of the other routes to the index.html file in the frontend/build directory
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

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
