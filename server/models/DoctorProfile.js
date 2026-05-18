import mongoose from 'mongoose';

const DoctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String },
  degree: { type: String },
  experience: { type: Number },
  consultationFee: { type: Number },
  rating: { type: Number, default: 0 },
  bio: { type: String },
  availability: [
    {
      day: String,
      slots: [String]
    }
  ],
  verified: { type: Boolean, default: false } // Toggle manually via DB
});

export default mongoose.model('DoctorProfile', DoctorProfileSchema);
