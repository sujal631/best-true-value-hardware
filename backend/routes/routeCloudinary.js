// Import necessary modules
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { isAuth, isAdmin } from '../utils.js';
import multer from 'multer';

// Configure multer for handling file uploads
const upload = multer();

// Create express router instance
const routeCloudinary = express.Router();

// Function to handle file upload to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  try {
    // Use a Promise to handle the async upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      // Define the callback function for the upload_stream method
      const uploadCallback = (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };

      // Create a stream for uploading the file to Cloudinary
      const stream = cloudinary.uploader.upload_stream(uploadCallback);
      // Pipe the file buffer into the stream
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });

    // Return the result of the upload
    return result;
  } catch (error) {
    throw error;
  }
};

// Route handler for the seed route
routeCloudinary.post(
  '/',
  isAuth,
  isAdmin,
  upload.single('image_file'),
  async (req, res) => {
    try {
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: 'dxhtxjfae',
        api_key: '119923214892155',
        api_secret: 'NvhtmRlD91kKkTcue4HJTbSK2p0',
      });

      // Upload file to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer);

      // Send the result back to the client
      res.send(result);
    } catch (error) {
      console.error('Error uploading image:', error);

      res.status(500).send({ message: 'Internal Server Error', error });
    }
  }
);

export default routeCloudinary;
