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

routeSliderImage.post('/', async (req, res) => {
  console.log('Slider image route called');

  try {
    const { imageUrl, publicId, index } = req.body;
 
    // Find the slider image by index
    let sliderImage = await SliderImage.findOne().skip(index);

    if (!sliderImage) {
      // If the slider image doesn't exist, create a new one
      sliderImage = new SliderImage();
    }

    // Update the slider image properties
    sliderImage.name = publicId;
    sliderImage.url = imageUrl;

    // Save the updated slider image
    const savedSliderImage = await sliderImage.save();
    console.log('Saved slider image:', savedSliderImage);

    res.status(201).send(savedSliderImage);
  } catch (error) {
    console.error('Error saving slider image:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});

// Export the router
export default routeSliderImage;
