// Import required modules and files
import express from 'express';
import sgMail from '@sendgrid/mail'; // Change this line
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Create a new express router
const routeSendGrid = express.Router();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Handle sending email
routeSendGrid.post('/sendEmail', async (req, res) => {
  const { to, subject, text } = req.body;

  const email = {
    to: to,
    from: process.env.SENDER_EMAIL,
    subject: subject,
    text: text,
  };

  try {
    // Use SendGrid API client to send email
    await sgMail.send(email);
    // Return success status
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('SendGrid error: ', error);
    // Return error status and message
    res.status(500).send({ success: false, error: error.message });
  }
});

// Export the express router
export default routeSendGrid;
