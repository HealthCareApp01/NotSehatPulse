import mongoose from 'mongoose';

const DoctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String },
  degree: { type: String },
  experience: { type: Number },
  consultationFee: { type: Number },
  subscriptionFee: { type: Number, default: 999 },
  rating: { type: Number, default: 0 },
  bio: { type: String },
  availability: [
    {
      day: String,
      slots: [String]
    }
  ],
  // ❌ REMOVED: age, height, weight, disease, allergy
  // Note: You already have `isVerified` in your User schema, 
  // but if you want this specific to medical license verification, keep it here:
  verified: { type: Boolean, default: false }, 
  hasFilledProfile: { type: Boolean, default: false }
});

export default mongoose.model('DoctorProfile', DoctorProfileSchema);