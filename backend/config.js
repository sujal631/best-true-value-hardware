import dotenv from 'dotenv';

dotenv.config();

const config = {
  MONGODB_URI: `${process.env.MONGODB_URI}`,
  JWT_SECRET: `${process.env.JWT_SECRET}`,
  PAYPAL_CLIENT_ID: `${process.env.PAYPAL_CLIENT_ID}`,
  STRIPE_SECRET_KEY: `${process.env.STRIPE_SECRET_KEY}`,
  STRIPE_PUBLISHABLE_KEY: `${process.env.STRIPE_PUBLISHABLE_KEY}`,
};

export default config;
