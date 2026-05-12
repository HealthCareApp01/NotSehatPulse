import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Import images (assuming they are in assets/doctors)
import doctor1 from '../assets/doctors/doctor1.png';
import doctor2 from '../assets/doctors/doctor2.png';

const ContactUs = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [doctor1, doctor2];
  const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-[40px] shadow-2xl shadow-primary/10 overflow-hidden border border-secondary">
          
          {/* Left Side: Dynamic Image Carousel */}
          <div className="lg:w-1/2 relative h-[400px] lg:h-auto min-h-[500px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Expert Doctor"
              />
            </AnimatePresence>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-4xl font-bold mb-4">Dedicated to Your Well-being</h2>
                <p className="text-white/80 text-lg max-w-md">
                  Our team of expert doctors is available 24/7 to provide you with the best medical care and guidance.
                </p>
                
                <div className="mt-8 flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <span className="font-medium">Verified Experts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <span className="font-medium">24/7 Support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="text-primary font-bold tracking-wider uppercase text-sm">Contact Us</span>
                <h1 className="text-4xl font-black text-text mt-2 mb-8">Get in Touch</h1>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-text/60 ml-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-secondary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-text/60 ml-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-secondary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-bold text-text/60 ml-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-secondary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-bold text-text/60 ml-1">Message</label>
                    <textarea
                      id="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message here..."
                      className="w-full px-6 py-4 rounded-2xl bg-secondary/50 border border-secondary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus !== 'idle'}
                    className={`w-full py-5 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                      formStatus === 'success' ? 'bg-green-500' : 'bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 hover:shadow-2xl'
                    }`}
                  >
                    {formStatus === 'idle' && (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                    {formStatus === 'sending' && (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    {formStatus === 'success' && (
                      <>
                        <CheckCircle size={20} />
                        Message Sent!
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-12 grid grid-cols-2 gap-8 pt-8 border-t border-secondary">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text/40 uppercase">Email Us</span>
                    <a href="mailto:support@healthcare.com" className="text-sm font-bold hover:text-primary transition-colors">support@healthcare.com</a>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text/40 uppercase">Call Us</span>
                    <a href="tel:+911800123456" className="text-sm font-bold hover:text-primary transition-colors">+91 1800-123-456</a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
