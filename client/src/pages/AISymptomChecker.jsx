import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, AlertCircle, Stethoscope, ArrowRight } from 'lucide-react';

const mockDoctors = [
  { name: 'Dr. Sarah Johnson', spec: 'Cardiologist', img: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=100&h=100' },
  { name: 'Dr. Michael Chen', spec: 'Dermatologist', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100' },
];

const AISymptomChecker = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: "Hello! I'm your AI Health Assistant. Please describe your symptoms in detail, and I'll help you find the right specialist." 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Mock AI response after 1.5s
    setTimeout(() => {
      const botMessage = { 
        role: 'bot', 
        content: "Based on your description, it seems like you might need to consult a Cardiologist. Here are some verified specialists you can book right now:",
        doctors: mockDoctors 
      };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Disclaimer */}
      <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-3xl mb-6 flex gap-3 items-center">
        <AlertCircle className="text-orange-500 shrink-0" size={24} />
        <p className="text-orange-800 text-xs font-bold leading-tight">
          DISCLAIMER: This AI Assistant is a machine and can make mistakes. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a verified doctor.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-secondary shadow-sm overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center medical-gradient text-white">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-black text-text">AI Symptom Checker</h3>
              <span className="text-xs text-primary font-bold">Powered by Cohere LLM</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-secondary text-primary' : 'bg-primary text-white'}`}>
                  {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`max-w-[80%] space-y-4`}>
                  <div className={`p-5 rounded-3xl font-medium leading-relaxed ${msg.role === 'bot' ? 'bg-secondary/30 text-text' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                    {msg.content}
                  </div>
                  
                  {msg.doctors && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {msg.doctors.map((doc, dIdx) => (
                        <div key={dIdx} className="bg-white border border-secondary p-4 rounded-3xl flex items-center gap-4 hover:border-primary transition-all cursor-pointer group">
                          <img src={doc.img} alt={doc.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-text">{doc.name}</h4>
                            <p className="text-[10px] text-primary font-bold uppercase">{doc.spec}</p>
                          </div>
                          <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Bot size={20} className="animate-pulse" />
              </div>
              <div className="bg-secondary/30 px-6 py-4 rounded-3xl flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-slate-50 border-t border-secondary">
          <div className="bg-white border-2 border-secondary focus-within:border-primary px-6 py-2 rounded-2xl flex items-center gap-4 transition-all shadow-sm">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g., I have a sharp pain in my chest and difficulty breathing..."
              className="flex-1 bg-transparent outline-none font-medium text-text py-2"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISymptomChecker;
