import mongoose from 'mongoose';

const PatientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  age: { type: String, default: 'NA' },
  height: { type: String, default: 'NA' },
  weight: { type: String, default: 'NA' },
  disease: { type: String, default: 'NA' },
  allergy: { type: String, default: 'NA' },
  medicalHistory: { type: String, default: 'NA' },
  hasFilledProfile: { type: Boolean, default: false },
  uploadedPrescriptions: [{ type: String }], // URLs to S3 or similar
  pastReports: [{ type: String }]
});

export default mongoose.model('PatientProfile', PatientProfileSchema);
