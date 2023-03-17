// Import necessary modules
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { isAuth, isAdmin } from '../utils.js';
import multer from 'multer';

const upload = multer();

// Create express router instance
const routeCloudinary = express.Router();

// Function to handle file upload to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadCallback = (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };

      const stream = cloudinary.uploader.upload_stream(uploadCallback);
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });

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
      res.status(500).send({ message: 'Internal Server Error', error });
    }
  }
);

export default routeCloudinary;
