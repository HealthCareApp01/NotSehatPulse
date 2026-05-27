import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';

const router = express.Router();

// @desc    Get current user profile (including separate profile collection data)
// @route   GET /api/profile/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;

    if (user.role === 'Doctor') {
      profile = await DoctorProfile.findOne({ userId: user._id });
      // Self-healing: if no profile document exists, create one
      if (!profile) {
        profile = new DoctorProfile({ userId: user._id });
        await profile.save();
      }
    } else if (user.role === 'Patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
      // Self-healing: if no profile document exists, create one
      if (!profile) {
        profile = new PatientProfile({ userId: user._id });
        await profile.save();
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        profile
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update current user profile
// @route   PUT /api/profile/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, specialization, degree, experience, consultationFee, subscriptionFee, bio, availability, medicalHistory, age, height, weight, disease, allergy } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update base User model if name is provided
    if (name) {
      user.name = name;
      await user.save();
    }

    let profile = null;

    if (user.role === 'Doctor') {
      const updateData = {};
      if (specialization !== undefined) updateData.specialization = specialization;
      if (degree !== undefined) updateData.degree = degree;
      if (experience !== undefined) updateData.experience = experience;
      if (consultationFee !== undefined) updateData.consultationFee = consultationFee;
      if (subscriptionFee !== undefined) updateData.subscriptionFee = subscriptionFee;
      if (bio !== undefined) updateData.bio = bio;
      if (availability !== undefined) updateData.availability = availability;

      // Mark profile as completed on any update
      updateData.hasFilledProfile = true;

      profile = await DoctorProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: updateData },
        { new: true, runValidators: true, upsert: true }
      );
    } else if (user.role === 'Patient') {
      const updateData = {};
      if (age !== undefined) updateData.age = age ? age.toString().trim() : 'NA';
      if (height !== undefined) updateData.height = height ? height.toString().trim() : 'NA';
      if (weight !== undefined) updateData.weight = weight ? weight.toString().trim() : 'NA';
      if (disease !== undefined) updateData.disease = disease ? disease.toString().trim() : 'NA';
      if (allergy !== undefined) updateData.allergy = allergy ? allergy.toString().trim() : 'NA';
      if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory ? medicalHistory.toString().trim() : 'NA';
      
      // Mark as completed
      updateData.hasFilledProfile = true;

      profile = await PatientProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: updateData },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        profile
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all doctor profiles with user details (supports search & filters)
// @route   GET /api/profile/doctors
// @access  Private
router.get('/doctors', protect, async (req, res) => {
  try {
    const { search } = req.query;

    // Fetch all doctor profiles and populate user details
    let doctorProfiles = await DoctorProfile.find().populate({
      path: 'userId',
      select: 'name email role isVerified'
    });

    // Filter out if the linked user was deleted or is not a doctor
    doctorProfiles = doctorProfiles.filter(profile => profile.userId && profile.userId.role === 'Doctor');

    // Filter dynamically by name, specialization, or degree if search is provided
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      doctorProfiles = doctorProfiles.filter(profile => {
        const userName = profile.userId?.name || '';
        const spec = profile.specialization || '';
        const degree = profile.degree || '';
        return searchRegex.test(userName) || searchRegex.test(spec) || searchRegex.test(degree);
      });
    }

    // Limit to top 15 doctors
    const limitedDoctors = doctorProfiles.slice(0, 15);

    res.json({
      success: true,
      data: limitedDoctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
