import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { isAuth, generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const routeUser = express.Router();

routeUser.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.password)) {
      const { _id, firstName, lastName, email: userEmail, isAdmin } = user;
      res.send({
        _id,
        firstName,
        lastName,
        email: userEmail,
        isAdmin,
        token: generateToken(user),
      });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  })
);

routeUser.post(
  '/registration',
  expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password),
    });
    const {
      _id,
      firstName: userFirstName,
      lastName: userLastName,
      email: userEmail,
      isAdmin,
    } = user;
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

routeUser.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      const {
        firstName = user.firstName,
        lastName = user.lastName,
        email = user.email,
        password,
      } = req.body;
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
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

export default routeUser;
