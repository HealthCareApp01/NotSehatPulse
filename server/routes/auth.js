import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';

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

export default router;
