// Import the JSON Web Token library
import jwt from 'jsonwebtoken';

// Store the secret key in a variable
const secretKey = `${process.env.JWT_SECRET_KEY}`;

// Create a function to generate a token based on a user's information
export const generateToken = ({ _id, name, email, isAdmin }) =>
  // Use the sign() method to create a token
  jwt.sign({ _id, name, email, isAdmin }, secretKey, { expiresIn: '30d' });

// Create a middleware function to authenticate user requests
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  // Check if there is an authorization header
  if (!authorization) {
    return res.status(401).send({ message: 'No Token' });
  }

  // Extract the token from the authorization header
  const token = authorization.slice(7);
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
