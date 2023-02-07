import mongoose from 'mongoose';

const sliderImageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

const SliderImage = mongoose.model('SliderImage', sliderImageSchema);

export default SliderImage;
