import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';

dotenv.config();

const dummyDoctors = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah@notsehatpulse.com',
    password: 'Password123!',
    role: 'Doctor',
    profile: {
      specialization: 'Cardiologist',
      degree: 'M.B.B.S, M.D. (Cardiology)',
      experience: 15,
      consultationFee: 800,
      rating: 4.9,
      bio: 'Senior cardiologist specializing in interventional cardiology, heart failure management, and advanced preventative vascular therapies.',
      availability: [
        { day: 'Mon', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'] },
        { day: 'Wed', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'] },
        { day: 'Fri', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 4:00 PM'] }
      ],
      verified: true
    }
  },
  {
    name: 'Dr. Rohan Sharma',
    email: 'dr.rohan@notsehatpulse.com',
    password: 'Password123!',
    role: 'Doctor',
    profile: {
      specialization: 'Dermatologist',
      degree: 'M.B.B.S, D.D.V.L (Dermatology)',
      experience: 9,
      consultationFee: 600,
      rating: 4.7,
      bio: 'Consultant dermatologist focused on clinical dermatology, skin cancer screenings, advanced acne care, and laser cosmetic procedures.',
      availability: [
        { day: 'Tue', slots: ['11:00 AM - 3:00 PM', '4:00 PM - 6:00 PM'] },
        { day: 'Thu', slots: ['11:00 AM - 3:00 PM', '4:00 PM - 6:00 PM'] }
      ],
      verified: true
    }
  },
  {
    name: 'Dr. Priya Nair',
    email: 'dr.priya@notsehatpulse.com',
    password: 'Password123!',
    role: 'Doctor',
    profile: {
      specialization: 'Pediatrician',
      degree: 'M.B.B.S, M.D. (Pediatrics)',
      experience: 12,
      consultationFee: 500,
      rating: 4.8,
      bio: 'Compassionate pediatrician dedicated to pediatric acute care, developmental health tracking, child immunizations, and asthma care.',
      availability: [
        { day: 'Mon', slots: ['9:00 AM - 1:00 PM'] },
        { day: 'Wed', slots: ['9:00 AM - 1:00 PM'] },
        { day: 'Fri', slots: ['9:00 AM - 1:00 PM'] }
      ],
      verified: true
    }
  },
  {
    name: 'Dr. Amit Verma',
    email: 'dr.amit@notsehatpulse.com',
    password: 'Password123!',
    role: 'Doctor',
    profile: {
      specialization: 'Neurologist',
      degree: 'M.B.B.S, D.M. (Neurology)',
      experience: 18,
      consultationFee: 1000,
      rating: 4.9,
      bio: 'Renowned neurologist specialized in post-stroke rehabilitation, epilepsy management, migraine syndromes, and cognitive neuro-wellness.',
      availability: [
        { day: 'Mon', slots: ['1:00 PM - 5:00 PM'] },
        { day: 'Wed', slots: ['1:00 PM - 5:00 PM'] },
        { day: 'Fri', slots: ['1:00 PM - 5:00 PM'] }
      ],
      verified: true
    }
  },
  {
    name: 'Dr. Elena Rostova',
    email: 'dr.elena@notsehatpulse.com',
    password: 'Password123!',
    role: 'Doctor',
    profile: {
      specialization: 'Dermatologist',
      degree: 'M.D. (Dermatology & Venereology)',
      experience: 14,
      consultationFee: 750,
      rating: 4.8,
      bio: 'Expert clinical dermatologist specializing in chronic eczema, anti-aging therapies, pediatric dermatology, and allergy diagnostics.',
      availability: [
        { day: 'Wed', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Fri', slots: ['10:00 AM - 4:00 PM'] }
      ],
      verified: true
    }
  }
];

async function seedDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
  
  console.log('🔌 Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database successfully.');

    for (const docData of dummyDoctors) {
      console.log(`\nProcessing doctor: ${docData.name} (${docData.email})`);
      
      let user = await User.findOne({ email: docData.email });
      
      if (!user) {
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(docData.password, salt);

        user = new User({
          name: docData.name,
          email: docData.email,
          password: hashedPassword,
          role: docData.role,
          isVerified: true
        });

        await user.save();
        console.log(`  ➕ User record created successfully! UserID: ${user._id}`);
      } else {
        console.log(`  ℹ️ User record already exists. UserID: ${user._id}`);
        // Ensure name matches seeder
        user.name = docData.name;
        await user.save();
      }

      // Check doctor profile
      let profile = await DoctorProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = new DoctorProfile({
          userId: user._id,
          ...docData.profile
        });
        await profile.save();
        console.log(`  ➕ Profile record initialized successfully! ProfileID: ${profile._id}`);
      } else {
        console.log(`  🔄 Profile record exists. Updating description fields...`);
        profile.specialization = docData.profile.specialization;
        profile.degree = docData.profile.degree;
        profile.experience = docData.profile.experience;
        profile.consultationFee = docData.profile.consultationFee;
        profile.rating = docData.profile.rating;
        profile.bio = docData.profile.bio;
        profile.availability = docData.profile.availability;
        profile.verified = docData.profile.verified;
        
        await profile.save();
        console.log(`  ✅ Profile description updated!`);
      }
    }

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  }
}

seedDB();
