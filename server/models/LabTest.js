import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  brand: { type: String }
}, { timestamps: true });

export default mongoose.model('LabTest', labTestSchema);
