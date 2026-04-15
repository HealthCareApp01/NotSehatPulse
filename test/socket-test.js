const { io } = require('socket.io-client');

const SOCKET_URL = 'http://localhost:5000';

function testSignaling() {
  console.log('--- Testing Socket.io Signaling ---');
  
  const socket = io(SOCKET_URL);

  socket.on('connect', () => {
    console.log('✅ Connected to server with ID:', socket.id);
    
    const roomId = 'test-room-123';
    socket.emit('join-room', roomId);

    // Simulate sending an offer
    console.log('Sending mock WebRTC offer...');
    socket.emit('offer', {
      roomId,
      offer: { type: 'offer', sdp: 'dummy-sdp-content' }
    });
  });

  socket.on('offer', (offer) => {
    console.log('✅ Received offer from server:', offer);
    console.log('Signaling test successful.');
    socket.disconnect();
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error (Is the server running?):', err.message);
    process.exit(1);
  });
}

testSignaling();
