const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Routes
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api/auth', authRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
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
    socket.to(data.roomId).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data.candidate);
  });

  // Real-time Chat
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
