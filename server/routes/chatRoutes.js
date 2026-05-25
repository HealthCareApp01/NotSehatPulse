import express from 'express';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Subscription from '../models/Subscription.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';

const router = express.Router();

// @desc    Get active chat rooms/connections for the logged-in user
// @route   GET /api/chat/rooms
router.get('/rooms', protect, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const roomsMap = new Map();

    if (user.role === 'Patient') {
      // 1. Get doctors with active subscriptions
      // Ensure expired subscriptions are updated first
      await Subscription.updateMany(
        { status: 'Active', endDate: { $lt: new Date() } },
        { $set: { status: 'Expired' } }
      );

      const activeSubscriptions = await Subscription.find({
        patientId: userId,
        status: 'Active',
        endDate: { $gt: new Date() }
      }).populate('doctorId', 'name email role');

      for (const sub of activeSubscriptions) {
        if (sub.doctorId) {
          const docIdStr = sub.doctorId._id.toString();
          const docProfile = await DoctorProfile.findOne({ userId: sub.doctorId._id });
          roomsMap.set(docIdStr, {
            partner: {
              _id: sub.doctorId._id,
              name: sub.doctorId.name,
              email: sub.doctorId.email,
              role: sub.doctorId.role,
              specialization: docProfile?.specialization || 'Specialist',
              bio: docProfile?.bio || '',
              experience: docProfile?.experience || 0,
              consultationFee: docProfile?.consultationFee || 500,
              subscriptionFee: docProfile?.subscriptionFee || 999
            },
            type: 'Subscription',
            endDate: sub.endDate,
            roomId: `chat_${userId}_${docIdStr}`
          });
        }
      }

      // 2. Get doctors with confirmed appointments
      const confirmedAppointments = await Appointment.find({
        patientId: userId,
        status: 'Confirmed'
      }).populate('doctorId', 'name email role');

      for (const apt of confirmedAppointments) {
        if (apt.doctorId) {
          const docIdStr = apt.doctorId._id.toString();
          // If they already have an active subscription room, keep it as Subscription (more privileged)
          if (!roomsMap.has(docIdStr)) {
            const docProfile = await DoctorProfile.findOne({ userId: apt.doctorId._id });
            roomsMap.set(docIdStr, {
              partner: {
                _id: apt.doctorId._id,
                name: apt.doctorId.name,
                email: apt.doctorId.email,
                role: apt.doctorId.role,
                specialization: docProfile?.specialization || 'Specialist',
                bio: docProfile?.bio || '',
                experience: docProfile?.experience || 0,
                consultationFee: docProfile?.consultationFee || 500,
                subscriptionFee: docProfile?.subscriptionFee || 999
              },
              type: 'Appointment',
              roomId: `chat_${userId}_${docIdStr}`
            });
          }
        }
      }

    } else if (user.role === 'Doctor') {
      // 1. Get patients with active subscriptions
      await Subscription.updateMany(
        { status: 'Active', endDate: { $lt: new Date() } },
        { $set: { status: 'Expired' } }
      );

      const activeSubscriptions = await Subscription.find({
        doctorId: userId,
        status: 'Active',
        endDate: { $gt: new Date() }
      }).populate('patientId', 'name email role');

      for (const sub of activeSubscriptions) {
        if (sub.patientId) {
          const patIdStr = sub.patientId._id.toString();
          roomsMap.set(patIdStr, {
            partner: {
              _id: sub.patientId._id,
              name: sub.patientId.name,
              email: sub.patientId.email,
              role: sub.patientId.role,
              age: 30, // Default placeholders for demographic details
              history: 'Subscribed Patient'
            },
            type: 'Subscription',
            endDate: sub.endDate,
            roomId: `chat_${patIdStr}_${userId}`
          });
        }
      }

      // 2. Get patients with confirmed appointments
      const confirmedAppointments = await Appointment.find({
        doctorId: userId,
        status: 'Confirmed'
      }).populate('patientId', 'name email role');

      for (const apt of confirmedAppointments) {
        if (apt.patientId) {
          const patIdStr = apt.patientId._id.toString();
          if (!roomsMap.has(patIdStr)) {
            roomsMap.set(patIdStr, {
              partner: {
                _id: apt.patientId._id,
                name: apt.patientId.name,
                email: apt.patientId.email,
                role: apt.patientId.role,
                age: 30,
                history: 'Appointment Patient'
              },
              type: 'Appointment',
              roomId: `chat_${patIdStr}_${userId}`
            });
          }
        }
      }
    }

    // Convert Map values to array
    const roomsList = Array.from(roomsMap.values());

    // Fetch the last message in each room to provide sidebar previews
    const results = [];
    for (const rm of roomsList) {
      const lastMessage = await Message.findOne({ roomId: rm.roomId })
        .sort({ timestamp: -1 })
        .select('content timestamp senderId');
      
      results.push({
        ...rm,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
          senderId: lastMessage.senderId
        } : null
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get message history for a specific room
// @route   GET /api/chat/messages/:roomId
router.get('/messages/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name email role');

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
