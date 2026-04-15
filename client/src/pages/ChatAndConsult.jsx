import React, { useState } from 'react';
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
  MoreVertical
} from 'lucide-react';

const ChatAndConsult = ({ role = 'doctor' }) => {
  const [activePatient, setActivePatient] = useState({ name: 'John Smith', age: 34, history: 'Type 2 Diabetes' });
  const [showProfile, setShowProfile] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'patient', text: 'Doctor, I have been feeling a bit dizzy since morning.', time: '10:05 AM' },
    { role: 'doctor', text: 'Have you taken your insulin shot today?', time: '10:07 AM' },
  ]);

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Patient List (Doctor View) */}
      {role === 'doctor' && (
        <div className="w-80 bg-white border border-secondary rounded-[40px] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-secondary">
             <div className="bg-secondary/50 px-4 py-2.5 rounded-2xl flex items-center gap-2">
               <Search size={18} className="text-slate-400" />
               <input placeholder="Search patients..." className="bg-transparent outline-none text-xs font-bold" />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className={`p-6 flex items-center gap-4 cursor-pointer hover:bg-secondary/20 transition-all ${i === 1 ? 'border-l-4 border-primary bg-primary/5' : ''}`}>
                 <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center font-bold text-primary">JS</div>
                 <div>
                   <span className="block font-bold text-text text-sm">John Smith</span>
                   <span className="text-[10px] text-slate-400">Offline • 2h ago</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Main Container: Chat or Video */}
      <div className="flex-1 flex flex-col bg-white border border-secondary rounded-[40px] overflow-hidden">
        {inCall ? (
          <div className="flex-1 bg-text relative">
            {/* Main Video (Remote) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <User size={120} className="text-white/10" />
              <span className="absolute bottom-10 text-white font-bold bg-black/40 px-6 py-2 rounded-full">Remote Participant</span>
            </div>
            
            {/* PiP (Local) */}
            <div className="absolute top-6 right-6 w-48 h-32 bg-slate-800 rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden">
               <div className="w-full h-full flex items-center justify-center text-white/20 uppercase text-[10px] font-bold">You</div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
               <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all"><Mic size={24} /></button>
               <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all"><Video size={24} /></button>
               <button onClick={() => setInCall(false)} className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"><PhoneOff size={24} /></button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">JS</div>
                <div>
                  <h3 className="font-bold text-text">John Smith</h3>
                  <span className="text-xs text-green-500 font-bold">• Active Now</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className={`p-3 rounded-xl transition-all ${showProfile ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-primary'}`}
                >
                  <FileText size={20} />
                </button>
                <button 
                  onClick={() => setInCall(true)}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/10 transition-all"
                >
                  <Video size={18} /> Call Patient
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-6">
               {messages.map((m, idx) => (
                 <div key={idx} className={`flex ${m.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-md p-5 rounded-[24px] text-sm font-medium ${m.role === 'doctor' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-secondary/50 text-text'}`}>
                     {m.text}
                     <span className={`block text-[10px] mt-2 ${m.role === 'doctor' ? 'text-white/60' : 'text-slate-400'}`}>{m.time}</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-secondary">
               <div className="bg-white border-2 border-secondary focus-within:border-primary px-6 py-2 rounded-2xl flex items-center gap-4 transition-all">
                  <input placeholder="Type your message..." className="flex-1 bg-transparent outline-none font-medium text-text py-2" />
                  <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                    <Send size={20} />
                  </button>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Split-Screen Medical Profile */}
      <AnimatePresence>
        {showProfile && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border border-secondary rounded-[40px] overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-secondary">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-text">Patient Profile</h3>
                <button className="text-slate-300 hover:text-text"><MoreVertical size={20} /></button>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-secondary rounded-[24px] flex items-center justify-center text-primary text-2xl font-black">JS</div>
                <div>
                   <h4 className="text-2xl font-black text-text">John Smith</h4>
                   <span className="text-slate-500 font-bold">34 Yrs • Male • O+</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
               <div>
                 <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Core Medical History</h4>
                 <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/10">
                   <p className="text-sm text-text font-medium leading-relaxed italic">
                     "Diagnosed with Type 2 Diabetes in 2021. History of hypertension. Allergic to Penicillin."
                   </p>
                 </div>
               </div>

               <div>
                 <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Past Records</h4>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAndConsult;
