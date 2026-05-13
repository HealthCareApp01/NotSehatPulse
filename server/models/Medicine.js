import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, default: 10 },
  brand: { type: String },
  category: { type: String }
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
