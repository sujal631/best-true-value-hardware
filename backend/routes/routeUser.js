// Import required modules and files
import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { isAuth, generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

// Create a new express router
const routeUser = express.Router();

// Helper function to extract user data
const extractUserData = ({
  _id,
  firstName,
  lastName,
  email,
  phoneNumber,
  isAdmin,
}) => ({
  _id,
  firstName,
  lastName,
  email,
  phoneNumber,
  isAdmin,
  token: generateToken({
    _id,
    firstName,
    lastName,
    email,
    phoneNumber,
    isAdmin,
  }),
});

// Handle user login
routeUser.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      res.send(extractUserData(user));
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  })
);

// Handle user registration
routeUser.post(
  '/registration',
  expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password),
      phoneNumber,
    });

    res.send(extractUserData(user));
  })
);

// Handle updating user info
routeUser.put(
  '/profile/info',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      const {
        firstName = user.firstName,
        lastName = user.lastName,
        email = user.email,
        phoneNumber = user.phoneNumber,
      } = req.body;
      Object.assign(user, { firstName, lastName, email, phoneNumber });

      const updatedUser = await user.save();
      res.send(extractUserData(updatedUser));
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

// Handle updating user password
routeUser.put(
  '/profile/password',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      const { password } = req.body;
      if (password) user.password = bcrypt.hashSync(password, 8);

      const updatedUser = await user.save();
      res.send(extractUserData(updatedUser));
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

// Handle verifying old password
routeUser.post(
  '/profile/verify-password',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      const { password } = req.body;

      if (bcrypt.compareSync(password, user.password)) {
        res.send({ message: 'Old password verified successfully' });
      } else {
        res.status(401).send({ message: 'Old password is incorrect' });
      }
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

// Export the express router
export default routeUser;
