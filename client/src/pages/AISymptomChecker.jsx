import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  Paperclip,
  X,
  Trash2,
  RotateCcw,
  ShoppingCart,
  FileText,
  Check,
  Loader2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../store/slices/cartSlice';
import axios from 'axios';

const AISymptomChecker = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auth state to authenticate API calls
  const { token } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        'Hello! I am your AI Doctor Chatbot. I can answer your questions about symptoms, health issues, diseases, and medicines. You can also upload a lab report to get its summary, or a prescription to extract medicines and add them directly to your cart. (Required file size limit: Less than 5 MB)',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [addingToCartState, setAddingToCartState] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from database on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chatbot/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success && response.data.data.length > 0) {
          const loadedMessages = response.data.data.map(msg => ({
            role: msg.role === 'assistant' ? 'bot' : msg.role,
            content: msg.content,
            file: msg.file,
            extractedMedicines: msg.extractedMedicines,
            summary: msg.summary
          }));
          setMessages([
            {
              role: 'bot',
              content:
                'Hello! I am your AI Doctor Chatbot. I can answer your questions about symptoms, health issues, diseases, and medicines. You can also upload a lab report to get its summary, or a prescription to extract medicines and add them directly to your cart. (Required file size limit: Less than 5 MB)',
            },
            ...loadedMessages
          ]);
        }
      } catch (error) {
        console.error("❌ Failed to load chat history:", error);
      }
    };

    if (token) {
      loadChatHistory();
    }
  }, [token]);

  // Global clipboard paste event listener for files
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, []);

  // Process File attachment (used by Input file selector, Paste, and Drag & Drop)
  const processFile = (file) => {
    if (!file) return;

    // Enforce 5MB file size limit
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const limitMsg = {
        role: 'bot',
        content: `⚠️ File size limit exceeded. The uploaded file "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB, which exceeds the required limit of ${MAX_SIZE_MB} MB. Please upload a smaller file.`,
      };
      setMessages((prev) => [...prev, limitMsg]);
      return;
    }

    const reader = new FileReader();

    // For text files, read as plain text
    if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.json')
    ) {
      reader.onload = (event) => {
        const fileObj = {
          name: file.name,
          type: file.type || 'text/plain',
          size: (file.size / 1024).toFixed(1) + ' KB',
          content: event.target.result,
        };
        setAttachedFile(fileObj);
        setLastUploadedFile(fileObj);
      };
      reader.readAsText(file);
    } else {
      // For images/PDFs, read as base64
      reader.onload = (event) => {
        const fileObj = {
          name: file.name,
          type: file.type || 'application/pdf',
          size: (file.size / 1024).toFixed(1) + ' KB',
          content: event.target.result, // base64 / data URL
        };
        setAttachedFile(fileObj);
        setLastUploadedFile(fileObj);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle File attachment from standard input selector
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    // Reset file input so same file can be uploaded again
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Remove attached file before sending
  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  // Send message to the backend
  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userMsgContent = input.trim() || `Uploaded file: ${attachedFile.name}`;
    const userMessage = { 
      role: 'user', 
      content: userMsgContent,
      file: attachedFile ? { name: attachedFile.name, type: attachedFile.type, size: attachedFile.size } : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const filePayload = attachedFile;
    setAttachedFile(null); // Clear preview

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsgContent,
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
          file: filePayload
        })
      });

      if (!response.ok) {
        let errorMsg = "An error occurred in the chat while processing your request. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error("No response body available for streaming.");
      }

      // Add blank placeholder message
      const botPlaceholder = {
        role: 'bot',
        content: '',
        extractedMedicines: [],
        summary: ''
      };
      setMessages(prev => [...prev, botPlaceholder]);
      setLoading(false); // Stop standard loading spinner since stream has initialized

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botReply = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botReply += parsed.text;
              }
              
              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.role === 'bot') {
                  if (botReply) {
                    lastMsg.content = botReply;
                  }
                  if (parsed.extractedMedicines && parsed.extractedMedicines.length > 0) {
                    lastMsg.extractedMedicines = parsed.extractedMedicines;
                  }
                  if (parsed.summary) {
                    lastMsg.summary = parsed.summary;
                  }
                }
                return updated;
              });
            } catch (e) {
              // Ignore partial chunk syntax errors
            }
          }
        }
      }

    } catch (error) {
      console.error("❌ Error sending message to chatbot:", error);
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'bot') {
          lastMsg.content = lastMsg.content 
            ? `${lastMsg.content}\n\n⚠️ An error occurred in the chat: ${error.message || "Please try again later."}`
            : `⚠️ An error occurred in the chat: ${error.message || "Please try again later."}`;
          return updated;
        } else {
          return [
            ...updated,
            { 
              role: 'bot', 
              content: `⚠️ An error occurred in the chat: ${error.message || "Please try again later."}` 
            }
          ];
        }
      });
      setLoading(false);
    }
  };

  // Action 1: Add Extracted Medicines to Cart (Only Available Ones)
  const handleAddToCart = async (medicinesList) => {
    if (!medicinesList || medicinesList.length === 0) return;

    // Filter to only include available (matched) medicines
    const availableMeds = medicinesList.filter(med => !med.unmatched);
    const hasUnavailable = medicinesList.some(med => med.unmatched);

    if (availableMeds.length === 0) {
      alert("None of the extracted medicines are currently available in our pharmacy.");
      return;
    }

    setAddingToCartState(true);

    try {
      // Loop over and dispatch addToCart for each available medicine
      const promises = availableMeds.map(med => 
        dispatch(addToCart({
          productId: med.productId,
          quantity: med.quantity,
          itemModel: 'Medicine'
        })).unwrap()
      );

      await Promise.all(promises);
      
      if (hasUnavailable) {
        alert("Adding available medicines to your cart. Unavailable items were skipped.");
      }

      // Redirect to Pharmacy Page
      navigate('/pharmacy');
    } catch (error) {
      console.error("❌ Error adding medicines to cart:", error);
      alert("Failed to add some medicines to cart. Please check your pharmacy inventory.");
    } finally {
      setAddingToCartState(false);
    }
  };

  // Action 2: Cancel (Clear only the result of the prescription parsing)
  const handleCancelMedicines = () => {
    setMessages(prev => {
      const updated = [...prev];
      // Find the last bot message that has extracted medicines and clear it
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'bot' && updated[i].extractedMedicines && updated[i].extractedMedicines.length > 0) {
          updated[i].extractedMedicines = [];
          updated[i].content = "Prescription extraction cancelled.";
          break;
        }
      }
      return updated;
    });
    setAttachedFile(null);
    setLastUploadedFile(null);
  };

  // Action 3: Retry Medicine Extraction with feedback
  const handleRetryMedicines = async () => {
    if (!lastUploadedFile) {
      alert("No file was previously uploaded to retry extraction.");
      return;
    }

    const feedbackPrompt = input.trim();
    if (!feedbackPrompt) {
      alert("Please type feedback in the message bar first to guide the retry extraction (e.g., 'Make Amoxicillin quantity 5 tablets').");
      return;
    }

    const userRetryMessage = { 
      role: 'user', 
      content: `Retry extracting medicines. Feedback: "${feedbackPrompt}"`
    };

    setMessages(prev => [...prev, userRetryMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `Retry extracting medicines with feedback.`,
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
          file: lastUploadedFile,
          feedback: feedbackPrompt
        })
      });

      if (!response.ok) {
        let errorMsg = "An error occurred in the chat while processing your request. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error("No response body available for streaming.");
      }

      // Add placeholder bot message
      const botPlaceholder = {
        role: 'bot',
        content: '',
        extractedMedicines: [],
        summary: ''
      };
      setMessages(prev => [...prev, botPlaceholder]);
      setLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botReply = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botReply += parsed.text;
              }
              
              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg && lastMsg.role === 'bot') {
                  if (botReply) {
                    lastMsg.content = botReply;
                  }
                  if (parsed.extractedMedicines && parsed.extractedMedicines.length > 0) {
                    lastMsg.extractedMedicines = parsed.extractedMedicines;
                  }
                  if (parsed.summary) {
                    lastMsg.summary = parsed.summary;
                  }
                }
                return updated;
              });
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }

    } catch (error) {
      console.error("❌ Error retrying extraction:", error);
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'bot') {
          lastMsg.content = `⚠️ An error occurred in the chat: ${error.message || "Please try uploading the prescription again."}`;
          return updated;
        } else {
          return [
            ...updated,
            { 
              role: 'bot', 
              content: `⚠️ An error occurred in the chat: ${error.message || "Please try uploading the prescription again."}` 
            }
          ];
        }
      });
      setLoading(false);
    }
  };

  return (
    <div className='h-full flex flex-col max-w-4xl mx-auto space-y-4'>
      {/* Warning Disclaimer */}
      <div className='bg-orange-50 border-2 border-orange-100 p-4 rounded-3xl flex gap-3 items-center'>
        <AlertCircle className='text-orange-500 shrink-0' size={24} />
        <p className='text-orange-800 text-xs font-bold leading-tight'>
          DISCLAIMER: This AI Assistant is a machine and can make mistakes. It
          is NOT a substitute for professional medical advice, diagnosis, or
          treatment. Always consult a verified doctor.
        </p>
      </div>

      {/* Main Chat Container */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className='relative flex-1 bg-white rounded-[40px] border border-secondary shadow-sm overflow-hidden flex flex-col h-[70vh]'
      >
        {/* Beautiful glassmorphism Drag & Drop visual overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white pointer-events-none'
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='bg-white/10 p-8 rounded-[32px] border-2 border-dashed border-white/30 flex flex-col items-center gap-4 shadow-2xl'
              >
                <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce'>
                  <Paperclip size={32} />
                </div>
                <div className='text-center'>
                  <h3 className='font-black text-lg'>Drop your file here</h3>
                  <p className='text-xs text-white/70 mt-1 font-semibold'>
                    Prescription, Lab Report, or medical images (Max 5MB)
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Header */}
        <div className='p-6 border-b border-secondary flex items-center justify-between bg-slate-50/50'>
          <div className='flex items-center gap-3'>
            <div className='relative w-12 h-12 bg-primary rounded-xl flex items-center justify-center medical-gradient text-white shadow-md'>
              <Bot size={24} />
              <span className='absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse' />
            </div>
            <div>
              <h3 className='font-black text-text text-lg'>
                AI Doctor Chatbot
              </h3>
              <span className='text-xs text-primary font-bold'>
                Experienced Medical Agent • LangGraph & Cohere
              </span>
            </div>
          </div>
        </div>

        {/* Messaging Area */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20'>
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'bot'
                      ? 'bg-secondary text-primary'
                      : 'bg-primary text-white'
                  }`}
                >
                  {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                </div>

                {/* Message Body */}
                <div className='max-w-[80%] space-y-4'>
                  <div
                    className={`p-5 rounded-3xl font-medium leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.role === 'bot'
                        ? 'bg-white text-text border border-secondary'
                        : 'bg-primary text-white shadow-lg shadow-primary/10'
                    }`}
                  >
                    {msg.content}

                    {/* Render attachment details in user bubbles */}
                    {msg.file && (
                      <div className='mt-3 bg-white/20 p-2.5 rounded-2xl flex items-center gap-2 border border-white/10 text-xs'>
                        <FileText size={16} />
                        <div className='truncate'>
                          <p className='font-bold truncate'>{msg.file.name}</p>
                          <p className='opacity-80'>{msg.file.size}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Structured Prescription Medicines Card */}
                  {msg.extractedMedicines &&
                    msg.extractedMedicines.length > 0 && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className='bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-lg space-y-4'
                      >
                        <div className='flex items-center gap-2 text-emerald-700 font-bold border-b border-emerald-100 pb-3'>
                          <FileText
                            className='text-emerald-500 animate-pulse'
                            size={20}
                          />
                          <h4 className='text-sm tracking-wide uppercase'>
                            📋 Extracted Medicines
                          </h4>
                        </div>

                        <div className='divide-y divide-slate-100'>
                          {msg.extractedMedicines.map((med, mIdx) => (
                            <div
                              key={mIdx}
                              className='py-3 flex justify-between items-center text-sm gap-2'
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className='font-bold text-text'>
                                    {med.name}
                                  </p>
                                  {med.unmatched ? (
                                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-full font-bold text-[8px] uppercase tracking-wide">
                                      Unavailable
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full font-bold text-[8px] uppercase tracking-wide">
                                      Available
                                    </span>
                                  )}
                                </div>
                                <p className='text-[11px] text-slate-400 font-semibold'>
                                  {med.unmatched ? "Not stocked in local pharmacy" : `${med.brand} • ${med.description}`}
                                </p>
                                <p className='text-[10px] text-slate-400 font-bold mt-0.5'>
                                  Prescribed: {med.prescribedTablets} tablet{med.prescribedTablets > 1 ? 's' : ''} • {med.tabletsPerPacket} per pack
                                </p>
                              </div>
                              <div className='text-right shrink-0'>
                                <span className='font-black text-text'>
                                  {med.unmatched ? "—" : `₹${med.price}/pack`}
                                </span>
                                <p className={`text-[10px] font-bold mt-0.5 ${med.unmatched ? 'text-rose-500' : 'text-emerald-600'}`}>
                                  {med.unmatched ? "Cannot Order" : `Order: ${med.quantity} pack${med.quantity > 1 ? 's' : ''}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary Row */}
                        <div className='pt-3 border-t border-slate-100 flex justify-between items-center'>
                          <span className='text-xs text-slate-400 font-bold uppercase'>
                            Estimated Total
                          </span>
                          <span className='text-lg font-black text-emerald-600'>
                            ₹
                            {msg.extractedMedicines.reduce(
                              (acc, med) => acc + med.price * med.quantity,
                              0,
                            )}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className='grid grid-cols-3 gap-2.5 pt-2'>
                          <button
                            onClick={handleCancelMedicines}
                            className='flex items-center justify-center gap-1.5 py-2.5 px-2 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 border border-rose-100 font-bold text-xs transition-all cursor-pointer'
                          >
                            <Trash2 size={14} />
                            Cancel
                          </button>
                          <button
                            onClick={handleRetryMedicines}
                            className='flex items-center justify-center gap-1.5 py-2.5 px-2 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 border border-indigo-100 font-bold text-xs transition-all cursor-pointer'
                            title='Type instructions in the text bar first as human feedback'
                          >
                            <RotateCcw size={14} />
                            Retry
                          </button>
                          <button
                            onClick={() =>
                              handleAddToCart(msg.extractedMedicines)
                            }
                            disabled={addingToCartState}
                            className='flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/10 font-bold text-xs transition-all cursor-pointer disabled:opacity-50'
                          >
                            {addingToCartState ? (
                              <Loader2 size={14} className='animate-spin' />
                            ) : (
                              <ShoppingCart size={14} />
                            )}
                            Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Loading Indicator */}
          {loading && (
            <div className='flex gap-4'>
              <div className='w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shadow-sm'>
                <Bot size={20} className='animate-pulse' />
              </div>
              <div className='bg-white border border-secondary px-6 py-4 rounded-3xl flex gap-1 shadow-sm items-center h-12'>
                <div className='w-1.5 h-1.5 bg-primary rounded-full animate-bounce' />
                <div className='w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]' />
                <div className='w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]' />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached File Preview Banner */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className='bg-emerald-50/80 border-t border-emerald-100 px-6 py-3 flex justify-between items-center'
            >
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-emerald-100 text-emerald-700 rounded-xl'>
                  <FileText size={18} />
                </div>
                <div className='min-w-0'>
                  <p className='font-bold text-slate-800 text-xs truncate max-w-md'>
                    {attachedFile.name}
                  </p>
                  <p className='text-[10px] text-slate-400 font-bold uppercase'>
                    {attachedFile.size}
                  </p>
                </div>
              </div>
              <button
                onClick={removeAttachedFile}
                className='w-7 h-7 bg-white text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center border border-emerald-100 hover:scale-105 transition-all cursor-pointer shadow-sm'
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input Controls */}
        <div className='p-6 bg-slate-50/50 border-t border-secondary'>
          <div className='bg-white border-2 border-secondary focus-within:border-primary px-4 py-2 rounded-2xl flex items-center gap-3 transition-all shadow-sm'>
            {/* hidden file selector */}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='.txt,.csv,.json,.pdf,.png,.jpg,.jpeg'
              className='hidden'
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className='w-10 h-10 bg-secondary text-primary hover:bg-primary hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105'
              title='Attach Prescription or Lab Report'
            >
              <Paperclip size={18} />
            </button>

            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                attachedFile
                  ? 'Add details or instructions...'
                  : 'e.g., I have a sharp pain in my chest, or type retry feedback...'
              }
              className='flex-1 bg-transparent outline-none font-medium text-text py-2 text-sm'
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() && !attachedFile}
              className='w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:shadow-none'
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISymptomChecker;
