import express from 'express';
import SliderImage from '../models/sliderImageModel.js';

const routeSliderImage = express.Router();

routeSliderImage.get('/', async (req, res) => {
  const sliderImages = await SliderImage.find();
  res.send(sliderImages);
});

export default routeSliderImage;
