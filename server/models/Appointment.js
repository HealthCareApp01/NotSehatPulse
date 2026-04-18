import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Postponed', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  paymentId: { type: String }, // Razorpay Payment ID
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Appointment', AppointmentSchema);
