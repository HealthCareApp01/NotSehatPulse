import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  FileText, 
  Search,
  MessageSquare,
  User,
  MoreVertical,
  Sparkles,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react';

const ChatAndConsult = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const filterType = searchParams.get('filter'); // 'appointment' or 'subscription'
  const preSelectedDoctorId = location.state?.preSelectedDoctorId;

  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showProfile, setShowProfile] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeRoomRef = useRef(null);
  const filterTypeRef = useRef(filterType);

  useEffect(() => {
    filterTypeRef.current = filterType;
  }, [filterType]);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
    if (activeRoom) {
      if (activeRoom.type === 'Subscription') {
        setSelectedSpecialization(activeRoom.specialization || '');
      }
      setUnreadCounts(prev => ({
        ...prev,
        [activeRoom.roomId]: 0
      }));
    }
  }, [activeRoom]);

  const role = user?.role?.toLowerCase() || 'patient';

  // 1. Initialize Socket.io Connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('receive-message', (data) => {
      const currentActiveRoom = activeRoomRef.current;
      // If message is in the currently active room, append it
      if (currentActiveRoom && data.roomId === currentActiveRoom.roomId) {
        setMessages((prev) => {
          // Avoid duplicate appends if we sent it locally
          const exists = prev.some(
            (m) => m._id === data._id || 
            (m.content === data.content && m.senderId?._id === data.senderId && Math.abs(new Date(m.timestamp) - new Date()) < 2000)
          );
          if (exists) return prev;

          return [...prev, {
            _id: data._id || Date.now().toString(),
            senderId: { _id: data.senderId, name: data.senderName, role: data.senderRole },
            content: data.content,
            roomId: data.roomId,
            timestamp: new Date()
          }];
        });
      } else {
        setUnreadCounts(prev => ({
          ...prev,
          [data.roomId]: (prev[data.roomId] || 0) + 1
        }));
      }

      // Refresh room list to update sidebar previews
      fetchChatRooms();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 2. Fetch Chat Rooms / Active Contacts
  const fetchChatRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setChatRooms(response.data.data);

        const currentFilterType = filterTypeRef.current;
        const availableRooms = currentFilterType 
           ? response.data.data.filter(r => currentFilterType === 'subscription' ? r.type === 'Subscription' : r.type !== 'Subscription')
           : response.data.data;

        // Handle redirection pre-selection if coming from FindDoctors
        if (preSelectedDoctorId) {
          const matchingRoom = availableRooms.find(
            (room) => room.partner?._id === preSelectedDoctorId
          );
          if (matchingRoom) {
            setActiveRoom(matchingRoom);
          }
        } else if (activeRoomRef.current) {
          const currentActive = availableRooms.find(
            (room) => room.roomId === activeRoomRef.current.roomId
          );
          if (currentActive) {
            setActiveRoom(currentActive);
          } else if (activeRoomRef.current.type === 'Subscription') {
            // Keep the selected subscription room even if it has no messages in backend list yet
          } else if (availableRooms.length > 0) {
            setActiveRoom(availableRooms[0]);
          } else {
            setActiveRoom(null);
          }
        } else if (availableRooms.length > 0) {
          // Default select the first room
          setActiveRoom(availableRooms[0]);
        } else {
          setActiveRoom(null);
        }
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchChatRooms();
    }
  }, [token, filterType]); // Refetch and re-evaluate when filter changes

  // 3. Join Socket Room and Load Messages on selecting a chat room
  useEffect(() => {
    if (activeRoom && socketRef.current) {
      // Join Room
      socketRef.current.emit('join-room', activeRoom.roomId);

      // Load Messages History
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/chat/messages/${activeRoom.roomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setMessages(response.data.data);
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
        } finally {
          setLoadingMessages(false);
        }
      };

      fetchMessages();
    }
  }, [activeRoom?.roomId]);

  // Reset disclaimer every time user opens a new chat room
  useEffect(() => {
    if (activeRoom) {
      setShowDisclaimer(true);
    }
  }, [activeRoom?._id]);

  // 4. Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeRoom || !socketRef.current) return;

    if (activeRoom.type === 'Subscription' && user.role === 'Patient' && !selectedSpecialization) {
      alert("Please select a specialization before sending a message in the Subscription Chat.");
      return;
    }

    const messageData = {
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId: activeRoom.partner?._id,
      content: inputMessage,
      roomId: activeRoom.roomId,
      selectedSpecialization
    };

    // Emit via socket (which auto-saves to backend Message DB)
    socketRef.current.emit('send-message', messageData);

    // Render locally immediately for responsive feedback
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        senderId: { _id: user.id, name: user.name, role: user.role },
        content: inputMessage,
        roomId: activeRoom.roomId,
        timestamp: new Date()
      }
    ]);

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Filter rooms based on filter type
  const filteredRooms = chatRooms
    .filter(room => {
      if (filterType === 'subscription') return room.type === 'Subscription';
      if (filterType === 'appointment') return room.type !== 'Subscription';
      return true;
    });

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Sidebar: Chat Channels List */}
      <div className="w-80 bg-white border border-secondary rounded-[40px] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-secondary">
          {filterType === 'subscription' && role === 'patient' ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border-2 border-slate-200 focus:border-primary hover:border-primary px-4 py-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer font-bold text-xs text-slate-700 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                  {selectedSpecialization || 'Select Specialization...'}
                </span>
                <span className="text-[10px] text-slate-400">{isDropdownOpen ? '▲' : '▼'}</span>
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Psychiatrist'].map((spec) => (
                      <div
                        key={spec}
                        onClick={() => {
                          setSelectedSpecialization(spec);
                          setIsDropdownOpen(false);
                          const targetRoomId = `sub_chat_${user.id || user._id}_${spec}`;
                          const existing = chatRooms.find(r => r.roomId === targetRoomId);
                          if (existing) {
                            setActiveRoom(existing);
                          } else {
                            setActiveRoom({
                              roomId: targetRoomId,
                              type: 'Subscription',
                              partner: {
                                _id: 'system_health_chat',
                                name: `Health Chat - ${spec}`,
                                role: 'System',
                                specialization: spec,
                                bio: `Smart chat that routes your queries to the right specialist based on your symptoms.`,
                              },
                              specialization: spec
                            });
                          }
                        }}
                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors flex items-center gap-2 border-b border-slate-50 last:border-0"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        {spec}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-1">
              <MessageSquare size={18} className="text-primary" />
              <span className="text-sm font-extrabold text-text">
                {filterType === 'subscription' ? 'Subscribed Chats' : 'Consultations'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-4">
              <MessageSquare size={36} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold">No active {filterType === 'subscription' ? 'subscribed chats' : filterType === 'appointment' ? 'consultations' : 'conversations'} found.</p>
              {role === 'Patient' && (
                <div className="pt-2">
                  <p className="text-[10px] mb-3">Book an appointment or subscribe to the Health Chat plan to start messaging!</p>
                  {filterType !== 'appointment' && (
                    <button 
                      onClick={() => navigate('/find-doctors')}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full flex items-center justify-center gap-1"
                    >
                      <Sparkles size={14} /> Subscribe to Health Chat
                    </button>
                  )}
                  {filterType !== 'subscription' && (
                    <button 
                      onClick={() => navigate('/find-doctors')}
                      className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full mt-2 flex items-center justify-center gap-1"
                    >
                      <Calendar size={14} /> Book a Consultation
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom && activeRoom.roomId === room.roomId;
              const initials = room.partner?.name
                ? room.partner.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'U';
              
              return (
                <div 
                  key={room.roomId} 
                  onClick={() => setActiveRoom(room)}
                  className={`p-5 flex items-center gap-4 cursor-pointer hover:bg-secondary/20 transition-all ${
                    isActive ? 'border-l-4 border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary relative">
                    {initials}
                    {room.type === 'Subscription' && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5" title="Subscribed Chat">
                        <Sparkles size={10} />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="block font-bold text-text text-sm truncate">{room.partner?.name}</span>
                      {room.type === 'Subscription' ? (
                        <span className="text-[9px] bg-yellow-100 text-yellow-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase scale-90">Sub</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase scale-90">Appt</span>
                      )}
                    </div>
                    {room.specialization && (
                      <div className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-md w-max mt-1 uppercase scale-90 origin-left">
                        {room.specialization}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[10px] text-slate-400 truncate block">
                        {room.lastMessage ? room.lastMessage.content : 'No messages yet'}
                      </span>
                      {unreadCounts[room.roomId] > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-2 scale-90 flex-shrink-0 animate-pulse">
                          {unreadCounts[room.roomId]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Container: Selected Chat Room or Placeholder */}
      <div className="flex-1 flex flex-col bg-white border border-secondary rounded-[40px] overflow-hidden">
        {activeRoom ? (
            <>
              {/* Room Header */}
              <div className="p-6 border-b border-secondary flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                    {activeRoom.partner?.name?.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text">{activeRoom.partner?.name}</h3>
                      {activeRoom.type === 'Subscription' && <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />}
                      {activeRoom.specialization && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase ml-2">
                          {activeRoom.specialization}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-green-500 font-bold">• Active Now</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowProfile(!showProfile)}
                    className={`p-3 rounded-xl transition-all cursor-pointer ${
                      showProfile ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-primary'
                    }`}
                  >
                    <FileText size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Emergency Disclaimer Banner */}
                <AnimatePresence>
                  {showDisclaimer && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3 items-start shadow-sm flex-shrink-0"
                    >
                      <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">⚠️ Medical Disclaimer</p>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          This chat is for <strong>minor health advice and follow-ups only</strong>. If you are facing a medical emergency, please <strong>visit the nearest hospital immediately</strong> or call emergency services.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDisclaimer(false)}
                        title="I have read and understood the disclaimer"
                        className="flex-shrink-0 flex flex-col items-center gap-1 text-amber-500 hover:text-amber-800 hover:bg-amber-100 px-2 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        <X size={14} />
                        <span className="text-[9px] font-black uppercase leading-none">Got it</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages List */}
                <div className="flex-1 p-8 overflow-y-auto space-y-6">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-slate-400 space-y-3">
                      <MessageSquare size={48} className="text-slate-300" />
                      <p className="font-bold text-sm">Send your first message to start the consultation!</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isSystem = m.senderId === 'system' || m.senderId?._id === 'system';
                      if (isSystem) {
                        return (
                          <div key={m._id} className="flex justify-center my-4">
                            <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold text-center max-w-sm shadow-sm">
                              {m.content}
                            </div>
                          </div>
                        );
                      }

                      const isCurrentUser = m.senderId?._id === user.id;
                      const msgTime = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={m._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md p-5 rounded-[24px] text-sm font-medium ${
                            isCurrentUser 
                              ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                              : 'bg-secondary/50 text-text'
                          }`}>
                            {!isCurrentUser && m.assignedDoctorId && m.assignedDoctorId.name && (
                              <div className="text-xs font-black text-primary mb-2 border-b border-primary/20 pb-1 flex items-center gap-1.5">
                                {m.assignedDoctorId.name} 
                                <span className="text-[10px] text-slate-500 font-bold bg-white/50 px-1.5 py-0.5 rounded-md">
                                  {m.assignedDoctorId.specialization}
                                </span>
                              </div>
                            )}
                            {m.content}
                            <span className={`block text-[10px] mt-2 ${isCurrentUser ? 'text-white/60' : 'text-slate-400'}`}>
                              {msgTime}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Messaging Input Box */}
              <div className="p-6 bg-slate-50 border-t border-secondary flex flex-col gap-3">
                <div className="bg-white border-2 border-secondary focus-within:border-primary px-6 py-2 rounded-2xl flex items-center gap-4 transition-all">
                  <input 
                    placeholder="Type your message..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent outline-none font-medium text-text py-2" 
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4">
            <MessageSquare size={64} className="text-slate-300 animate-pulse" />
            <h3 className="text-xl font-black text-text">No Conversation Selected</h3>
            <p className="text-sm font-medium text-slate-500 text-center max-w-sm">
              Choose a channel from the left sidebar to start messaging. Active channels include verified chat subscriptions and confirmed appointments.
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar: Profile Context Split-Screen */}
      <AnimatePresence>
        {activeRoom && showProfile && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border border-secondary rounded-[40px] overflow-hidden flex flex-col"
          >
            {role === 'Patient' ? (
              /* Patient viewing Doctor details */
              <>
                <div className="p-8 border-b border-secondary">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-text">Doctor Profile</h3>
                    <button className="text-slate-300 hover:text-text"><MoreVertical size={20} /></button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-secondary rounded-[24px] flex items-center justify-center text-primary text-2xl font-black">
                      {activeRoom.partner?.name?.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-text">{activeRoom.partner?.name}</h4>
                      <span className="text-slate-500 font-bold">{activeRoom.partner?.specialization}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Doctor Bio</h4>
                    <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/10">
                      <p className="text-sm text-text font-medium leading-relaxed italic">
                        "{activeRoom.partner?.bio || 'Experienced specialist dedicated to providing comprehensive and compassionate patient care.'}"
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Subscription Plan</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white border border-secondary p-4 rounded-2xl">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Sparkles size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="block font-bold text-sm text-text">
                            {activeRoom.type === 'Subscription' ? '30-Day Chat Subscription' : 'Single Appointment Session'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {activeRoom.type === 'Subscription' 
                              ? `Valid until ${new Date(activeRoom.endDate).toLocaleDateString()}` 
                              : 'Expires upon appointment completion'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Doctor viewing Patient details */
              <>
                <div className="p-8 border-b border-secondary">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-text">Patient File</h3>
                    <button className="text-slate-300 hover:text-text"><MoreVertical size={20} /></button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-secondary rounded-[24px] flex items-center justify-center text-primary text-2xl font-black">
                      {activeRoom.partner?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-text">{activeRoom.partner?.name}</h4>
                      <span className="text-slate-500 font-bold">
                        {activeRoom.partner?.age && activeRoom.partner.age !== 'NA' ? `${activeRoom.partner.age} Yrs` : 'Age NA'} • Patient
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                  {/* Medical Stats (Height, Weight, Allergy, Disease) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-secondary">
                      <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Height</span>
                      <span className="text-sm font-black text-text">
                        {activeRoom.partner?.height && activeRoom.partner.height !== 'NA' ? `${activeRoom.partner.height} cm` : 'NA'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-secondary">
                      <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Weight</span>
                      <span className="text-sm font-black text-text">
                        {activeRoom.partner?.weight && activeRoom.partner.weight !== 'NA' ? `${activeRoom.partner.weight} kg` : 'NA'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-secondary col-span-2">
                      <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Known Diseases</span>
                      <span className="text-sm font-bold text-text truncate block" title={activeRoom.partner?.disease || 'None'}>
                        {activeRoom.partner?.disease || 'NA'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-secondary col-span-2">
                      <span className="block text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Allergies</span>
                      <span className="text-sm font-bold text-text truncate block" title={activeRoom.partner?.allergy || 'None'}>
                        {activeRoom.partner?.allergy || 'NA'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Core Medical History</h4>
                    <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/10">
                      <p className="text-sm text-text font-medium leading-relaxed italic">
                        "{activeRoom.partner?.history || 'No recorded history. Standard consultation in progress.'}"
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Past Reports</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white border border-secondary p-4 rounded-2xl hover:border-primary transition-all cursor-pointer group">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="block font-bold text-sm text-text">Blood Test Report</span>
                          <span className="text-[10px] text-slate-400">Sept 12, 2026</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white border border-secondary p-4 rounded-2xl hover:border-primary transition-all cursor-pointer group">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <span className="block font-bold text-sm text-text">ECG Scan</span>
                          <span className="text-[10px] text-slate-400">Aug 24, 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAndConsult;
