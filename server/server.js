import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicineRoutes.js';
import labTestRoutes from './routes/labTestRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Message from './models/Message.js';
import cron from 'node-cron';
import Appointment from './models/Appointment.js';
import DoctorProfile from './models/DoctorProfile.js';
import { assignDoctor } from './utils/keywordRouter.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected', MONGO_URI))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Initial Route
app.get('/', (req, res) => {
  res.json({ success: true, message: "Healthcare API is running..." });
});

// Socket.io Signaling & Chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    console.log(`[Socket] Offer sent to room ${data.roomId}`);
    socket.to(data.roomId).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    console.log(`[Socket] Answer sent to room ${data.roomId}`);
    socket.to(data.roomId).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    // Too noisy to log every candidate
    socket.to(data.roomId).emit('ice-candidate', data.candidate);
  });

  // WebRTC Consultation Queue Signaling
  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    console.log(`[Socket] User ${userId} joined their personal room`);
  });

  socket.on('doctor-calling', (data) => {
    console.log(`[Socket] Doctor calling patient ${data.patientId} in room ${data.roomId}`);
    socket.to(data.patientId).emit('incoming-call', data);
  });

  socket.on('patient-joined', (data) => {
    console.log(`[Socket] Patient joined room ${data.roomId}`);
    socket.to(data.roomId).emit('patient-joined-room', data);
  });

  socket.on('new-appointment', (doctorId) => {
    socket.to(doctorId).emit('new-appointment-booked');
  });

  socket.on('end-call', (data) => {
    console.log(`[Socket] End call emitted for room ${data.roomId}`);
    socket.to(data.roomId).emit('call-ended');
  });

  socket.on('call-declined', (data) => {
    console.log(`[Socket] Call declined by patient for room ${data.roomId}`);
    socket.to(data.roomId).emit('call-declined');
  });

// Real-time Chat
  socket.on('send-message', async (data) => {
    try {
      let { senderId, receiverId, content, roomId, senderRole, selectedSpecialization } = data;
      
      let isSubscriptionChat = roomId.startsWith('sub_chat_');

      if (isSubscriptionChat) {
        if (senderRole === 'Patient') {
          // Find Admin user
          const adminUser = await User.findOne({ role: 'Admin' });
          if (adminUser) {
            receiverId = adminUser._id;
          }
          if (!selectedSpecialization) {
            const parts = roomId.split('_');
            if (parts.length > 3) {
              selectedSpecialization = parts[3];
            }
          }
        } else if (senderRole === 'Admin') {
          const parts = roomId.split('_');
          if (parts.length > 2) {
            receiverId = parts[2]; // patientId
          }
          if (parts.length > 3) {
            selectedSpecialization = parts[3];
          }
        }
      }

      if (senderId && receiverId && content && roomId) {
        const newMessage = new Message({ 
          senderId, 
          receiverId, 
          content, 
          roomId,
          detectedSpecialization: selectedSpecialization || null,
          isSubscriptionChat
        });
        await newMessage.save();
        console.log(`[Socket] Message saved to DB: ${content.substring(0, 30)}...`);

        // If it's a subscription chat, also emit to the receiver's personal room to notify them in real-time
        if (isSubscriptionChat && receiverId) {
          socket.to(receiverId.toString()).emit('receive-message', {
            ...data,
            _id: newMessage._id,
            timestamp: newMessage.timestamp
          });
        }
      }
    } catch (err) {
      console.error("[Socket] Message save error:", err);
    }
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Midnight Cron Job for Rescheduling
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Running midnight check for doctor-requested reschedules...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingReschedules = await Appointment.find({
      doctorRequestedReschedule: true,
      status: { $in: ['Confirmed', 'Pending'] },
      date: { $lte: today }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const apt of pendingReschedules) {
      const doctorProfile = await DoctorProfile.findOne({ userId: apt.doctorId });
      let rescheduled = false;

      const availability = doctorProfile?.availability || [];
      const docAvailability = availability.length > 0 ? availability : [
        { day: 'Mon', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Tue', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Wed', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Thu', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Fri', slots: ['10:00 AM - 4:00 PM'] }
      ];

      // Anchor the 6-day window to the ORIGINAL booking date, not the current (rescheduled) date
      const anchorDate = new Date(apt.originalBookingDate || apt.date);

      for (let offset = 1; offset <= 6; offset++) {
        const checkDate = new Date(anchorDate);
        checkDate.setDate(anchorDate.getDate() + offset);

        if (checkDate.getDay() === 0) continue; // Skip Sunday

        // Skip dates that are already in the past
        if (checkDate < today) continue;

        const checkDayName = dayNames[checkDate.getDay()];
        const slotForDay = docAvailability.find(a => a.day === checkDayName);

        if (slotForDay && slotForDay.slots && slotForDay.slots.length > 0) {
          const chosenSlot = slotForDay.slots[0];

          apt.rescheduleHistory.push({
            originalDate: apt.date,
            originalTimeSlot: apt.timeSlot,
            reason: 'Auto-rescheduled at midnight'
          });

          apt.date = checkDate;
          apt.timeSlot = `${checkDayName} (${chosenSlot})`;
          apt.doctorRequestedReschedule = false;
          apt.status = 'Postponed';
          await apt.save();
          rescheduled = true;
          break;
        }
      }

      if (!rescheduled) {
        apt.status = 'Cancelled';
        apt.rescheduleHistory.push({
          originalDate: apt.date,
          originalTimeSlot: apt.timeSlot,
          reason: 'Auto-reschedule failed (no availability within original 6-day window)'
        });
        await apt.save();
      }
    }
    console.log(`[Cron] Auto-rescheduled ${pendingReschedules.length} appointments.`);
  } catch (err) {
    console.error('[Cron] Error running reschedule job:', err);
  }
}, { timezone: 'Asia/Kolkata' });

// 6 PM IST Cron Job for Unattended Appointments
cron.schedule('0 18 * * *', async () => {
  console.log('[Cron] Running 6 PM check for leftover appointments...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leftoverApts = await Appointment.find({
      status: 'Confirmed',
      date: { $gte: today, $lt: tomorrow },
      doctorRequestedReschedule: false
    });

    for (const apt of leftoverApts) {
      apt.doctorRequestedReschedule = true;
      await apt.save();
    }
    console.log(`[Cron] Flagged ${leftoverApts.length} leftover appointments for reschedule.`);
  } catch (err) {
    console.error('[Cron] Error running 6 PM leftover job:', err);
  }
}, { timezone: 'Asia/Kolkata' });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
