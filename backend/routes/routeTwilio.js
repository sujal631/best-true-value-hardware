import express from 'express';
import twilio from 'twilio';
import { config } from 'dotenv';

config();

const routeTwilio = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = new twilio(accountSid, authToken);

routeTwilio.post('/sendSms', async (req, res) => {
  const { to, message } = req.body;

  try {
    const sms = await client.messages.create({
      body: message,
      to,
      from: phoneNumber,
    });

    res.status(200).send({ success: true, messageSid: sms.sid });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

export default routeTwilio;
