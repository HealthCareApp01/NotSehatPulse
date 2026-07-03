import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import admin from '../utils/firebaseAdmin.js';

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Auto-initialize profile document in separate collection based on role
    let effectiveRole = user.role;
    if (user.role === 'Doctor') {
      const doctorProfile = new DoctorProfile({
        userId: user._id,
        specialization: 'General Physician',
        degree: 'M.B.B.S.',
        experience: 5,
        consultationFee: 500,
        bio: 'Dedicated healthcare professional providing comprehensive medical services.',
        availability: [
          { day: 'Mon', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'] },
          { day: 'Wed', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'] },
          { day: 'Fri', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 4:00 PM'] }
        ],
        verified: false,
        hasFilledProfile: false
      });
      await doctorProfile.save();
      // An unverified doctor acts as a patient initially
      effectiveRole = 'Patient';
    } else if (user.role === 'Patient') {
      const patientProfile = new PatientProfile({ userId: user._id });
      await patientProfile.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: effectiveRole },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: effectiveRole,
          profilePicture: user.profilePicture || ''
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User doesn't exist. Please sign up." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // A doctor cannot login as a Doctor until verified; they must act as a Patient.
    let effectiveRole = user.role;
    if (user.role === 'Doctor' && !user.isVerified) {
      effectiveRole = 'Patient';
    }

    const token = jwt.sign(
      { userId: user._id, role: effectiveRole },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: effectiveRole,
          profilePicture: user.profilePicture || ''
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Google Login Route
router.post('/google-login', async (req, res) => {
  try {
    const { idToken, role = 'Patient' } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "Firebase ID Token is required" });
    }

    // 1. Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    // 2. Check if user exists in your MongoDB
    let user = await User.findOne({ email });

    let effectiveRole = role;

    // 3. If new user, create them in MongoDB
    if (!user) {
      // If no role provided by frontend, ask them for it
      if (!role) {
        return res.status(202).json({ success: true, requireRole: true, message: "Please select a role to complete registration." });
      }

      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Random password since Google handles auth
        role: role,
        isVerified: role === 'Patient' ? true : false, 
        profilePicture: picture || ''
      });
      await user.save();

      // Auto-initialize profile document
      if (user.role === 'Doctor') {
        const doctorProfile = new DoctorProfile({
          userId: user._id,
          specialization: 'General Physician',
          degree: 'M.B.B.S.',
          experience: 5,
          consultationFee: 500,
          verified: false,
          hasFilledProfile: false
        });
        await doctorProfile.save();
        
        // Also create a patient profile for the doctor
        const patientProfile = new PatientProfile({ userId: user._id });
        await patientProfile.save();
        
        effectiveRole = 'Patient'; // Unverified doctors act as patients
      } else {
        const patientProfile = new PatientProfile({ userId: user._id });
        await patientProfile.save();
      }
    } else {
       // Existing user logic for effective role
       effectiveRole = user.role;
       if (user.role === 'Doctor' && !user.isVerified) {
         effectiveRole = 'Patient';
       }
    }

    // 4. Generate App JWT
    const token = jwt.sign(
      { userId: user._id, role: effectiveRole },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: effectiveRole,
          profilePicture: user.profilePicture || ''
        }
      }
    });

  } catch (error) {
    console.error("Firebase Auth Error:", error);
    res.status(401).json({ success: false, message: error.message || 'Unauthorized / Invalid Firebase Token' });
  }
});

export default router;
