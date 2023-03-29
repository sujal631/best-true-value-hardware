// Import required modules and files
import express from 'express';
import twilio from 'twilio';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Create a new express router
const routeTwilio = express.Router();

// Set up Twilio API client using account SID and auth token from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = new twilio(accountSid, authToken);

// Handle sending SMS message
routeTwilio.post('/sendSms', async (req, res) => {
  const { to, message } = req.body;

  try {
    // Use Twilio API client to send SMS message
    const sms = await client.messages.create({
      body: message,
      to,
      from: phoneNumber,
    });

    // Return success status and message SID
    res.status(200).send({ success: true, messageSid: sms.sid });
  } catch (error) {
    // Return error status and message
    res.status(500).send({ success: false, error: error.message });
  }
});

// Export the express router
export default routeTwilio;
