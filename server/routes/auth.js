const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock OTP Database
const otps = {};

// Send OTP (Mock)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number required" });

  // Mock OTP Generation
  const otp = "123456"; 
  otps[phone] = otp;

  console.log(`[MOCK OTP] Sent ${otp} to ${phone}`);
  
  res.json({ 
    success: true, 
    message: "OTP sent successfully (Check server console for mock code: 123456)" 
  });
});

// Verify OTP & Login/Signup
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, role } = req.body;

  if (otps[phone] !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  try {
    let user = await User.findOne({ phone });

    if (!user) {
      if (!name || !role) {
        return res.status(400).json({ success: false, message: "Complete registration details required for new users" });
      }
      user = new User({ name, phone, role });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
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
          role: user.role,
          phone: user.phone
        }
      }
    });

    // Clear OTP after use
    delete otps[phone];

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
