// Import required modules and files
import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { isAuth, isAdmin, generateToken } from '../utils.js';
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

routeUser.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';
    const filter = query.filter || '';
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(search, 'i');

    let filterObject = {};
    if (filter === 'admin') {
      filterObject.isAdmin = true;
    } else if (filter === 'user') {
      filterObject.isAdmin = false;
    }

    const users = await User.find({
      ...filterObject,
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
    })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      ...filterObject,
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
    });

    res.send({ users, totalUsers });
  })
);

// Handle user login
routeUser.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.password)) {
      res.send(extractUserData(user));
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

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

// Handle updating user admin status
routeUser.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      const { isAdmin } = req.body;
      if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

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
