// Import express module
import express from 'express';

// Import SliderImage model
import SliderImage from '../models/sliderImageModel.js';

// Initialize the router
const routeSliderImage = express.Router();

// Handle GET request to retrieve all slider images
routeSliderImage.get('/', async (req, res) => {
  // Fetch all slider images from the database
  const sliderImages = await SliderImage.find({});

  // Return the retrieved slider images in the response
  res.send(sliderImages);
});

// Export the router
export default routeSliderImage;
