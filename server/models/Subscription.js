import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Expired'], 
    default: 'Active' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  paymentId: { type: String }, // Razorpay Payment ID
  amountPaid: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Subscription', SubscriptionSchema);
