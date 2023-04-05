// Import the JSON Web Token library
import jwt from 'jsonwebtoken';

// Store the secret key in a variable
const secretKey = `${process.env.JWT_SECRET_KEY}`;

// Create a function to generate a token based on a user's information
export const generateToken = ({ _id, firstName, lastName, email, isAdmin }) =>
  // Use the sign() method to create a token
  jwt.sign({ _id, firstName, lastName, email, isAdmin }, secretKey, {
    expiresIn: '30d',
  });

// Create a middleware function to authenticate user requests
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  // Check if there is an authorization header
  if (!authorization) {
    return res.status(401).send({ message: 'No Token' });
  }

  // Extract the token from the authorization header
  const token = authorization.slice(7, authorization.length);
  // Verify the token using the secret key
  jwt.verify(token, secretKey, (error, decode) => {
    if (error) {
      return res.status(401).send({ message: 'Invalid Token' });
    }

    // If the token is valid, attach the decoded user information to the request object and proceed to the next middleware
    req.user = decode;
    next();
  });
};

/**
 * Middleware function to check if user is an admin.
 * If user is an admin, proceed to the next middleware.
 * If not, send an error response with a 401 status code and a message.
 */
export const isAdmin = (req, res, next) => {
  // Check if user is logged in and isAdmin property is true
  req.user && req.user.isAdmin
    ? next()
    : // If user is not an admin, send an error response
      res.status(401).send({ message: 'User is not authorized as an Admin' });
};
