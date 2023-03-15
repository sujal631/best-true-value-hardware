// Import required modules and files
import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { isAuth, generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

// Create a new express router
const routeUser = express.Router();

// Handle user login
routeUser.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    // Get user input from request body
    const { email, password } = req.body;
    // Find the user with matching email
    const user = await User.findOne({ email });
    // If the user exists and the provided password matches the stored password
    if (user && bcrypt.compareSync(password, user.password)) {
      // Extract relevant user data
      const { _id, firstName, lastName, email: userEmail, isAdmin } = user;
      // Send a response with user data and a generated token
      res.send({
        _id,
        firstName,
        lastName,
        email: userEmail,
        isAdmin,
        token: generateToken(user),
      });
    } else {
      // Send an error response
      res.status(401).send({ message: 'Invalid email or password' });
    }
  })
);

// Handle user registration
routeUser.post(
  '/registration',
  expressAsyncHandler(async (req, res) => {
    // Get user input from request body
    const { firstName, lastName, email, password } = req.body;
    // Create a new user with the provided data
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password),
    });
    // Extract relevant user data
    const {
      _id,
      firstName: userFirstName,
      lastName: userLastName,
      email: userEmail,
      isAdmin,
    } = user;
    // Send a response with user data and a generated token
    res.send({
      _id,
      firstName: userFirstName,
      lastName: userLastName,
      email: userEmail,
      isAdmin,
      token: generateToken(user),
    });
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
      } = req.body;
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;

      const updatedUser = await user.save();
      const {
        _id,
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        isAdmin,
      } = updatedUser;
      res.send({
        _id,
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        isAdmin,
        token: generateToken(updatedUser),
      });
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
      const {
        _id,
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        isAdmin,
      } = updatedUser;
      res.send({
        _id,
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

// Export the express router
export default routeUser;
