import mongoose from 'mongoose';

// Define the schema for slider images with two required fields, name and url
const sliderImageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

// Create a mongoose model from the schema and name it SliderImage
const SliderImage = mongoose.model('SliderImage', sliderImageSchema);

// Export the SliderImage model
export default SliderImage;
