import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import PatientProfile from '../models/PatientProfile.js';

const MONGO_URI = 'mongodb+srv://eshankochar06_db_user:NQ1jnzyyZANPEtEc@cluster0.mb416dq.mongodb.net/healthcare?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  // 1. Create or Find Admin
  let admin = await User.findOne({ role: 'Admin' });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  if (!admin) {
    admin = new User({
      name: 'System Admin',
      email: 'admin@healthpulse.com',
      password: hashedPassword,
      role: 'Admin',
      isVerified: true
    });
    await admin.save();
    console.log('Created Admin:', admin.email);
  } else {
    admin.password = hashedPassword;
    await admin.save();
    console.log('Found Admin and reset password to admin123:', admin.email);
  }

  // 2. Create or Find Patient
  let patient = await User.findOne({ email: 'patient@healthpulse.com' });
  if (!patient) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('patient123', salt);
    patient = new User({
      name: 'John Patient',
      email: 'patient@healthpulse.com',
      password: hashedPassword,
      role: 'Patient',
      isVerified: true
    });
    await patient.save();
    console.log('Created Patient:', patient.email);

    const patProfile = new PatientProfile({
      userId: patient._id,
      age: 28,
      height: 178,
      weight: 75,
      disease: 'None',
      allergy: 'None',
      medicalHistory: 'Healthy',
      hasFilledProfile: true
    });
    await patProfile.save();
  } else {
    console.log('Found Patient:', patient.email);
  }

  // 3. Ensure active subscription for Patient
  let sub = await Subscription.findOne({ patientId: patient._id, status: 'Active' });
  if (!sub) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    sub = new Subscription({
      patientId: patient._id,
      planType: 'Platform',
      startDate: start,
      endDate: end,
      status: 'Active',
      amountPaid: 999,
      paymentStatus: 'Completed'
    });
    await sub.save();
    console.log('Created active Platform subscription for patient');
  } else {
    console.log('Found active subscription for patient');
  }

  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch(console.error);
