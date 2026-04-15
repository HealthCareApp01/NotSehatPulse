const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  role: { 
    type: String, 
    enum: ['Patient', 'Doctor', 'Admin'], 
    default: 'Patient' 
  },
  isVerified: { type: Boolean, default: false }, // For Dummy medical verification
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
