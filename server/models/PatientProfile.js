import mongoose from 'mongoose';

const PatientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalHistory: { type: String },
  uploadedPrescriptions: [{ type: String }], // URLs to S3 or similar
  pastReports: [{ type: String }]
});

export default mongoose.model('PatientProfile', PatientProfileSchema);
