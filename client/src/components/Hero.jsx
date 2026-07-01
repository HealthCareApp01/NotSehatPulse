import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-secondary/30 rounded-l-[100px] hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Video Banner running as a GIF */}
        <div className="w-full mb-10 rounded-[32px] overflow-hidden shadow-xl border border-secondary relative h-64 sm:h-[400px] lg:h-[480px] bg-slate-950 group">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90"
          >
            <source src="https://res.cloudinary.com/uwv2e0xt/video/upload/v1782895777/healthcare_assets/ilaqkeatpbivq59ehlid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center p-8 sm:p-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="max-w-md space-y-2">
              <span className="inline-block bg-primary text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full">
                Introducing heAlthI
              </span>
              <h2 className="text-white text-2xl sm:text-4xl font-black leading-tight">Advanced Care at Your Fingertips</h2>
            </div>
          </div>
        </div>

        <div className="lg:flex items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-secondary text-primary-dark px-4 py-1.5 rounded-full font-bold text-sm mb-4">
                ⭐ Rated 4.9/5 by 2M+ Users
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-text leading-tight">
                Your Health, Our <span className="text-primary">Priority.</span>
                <br /> Anytime, Anywhere.
              </h1>
              <p className="text-lg text-slate-500 max-w-lg mt-6">
                Consult top specialists online, buy medicines, and book lab tests from the comfort of your home.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary-dark text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate('/medicines')}
                  className="bg-white border-2 border-secondary hover:border-primary text-text font-bold px-8 py-4 rounded-2xl transition-all"
                >
                  Find Medicines
                </button>
              </div>
            </motion.div>

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-white shadow-sm border border-secondary">
                <Shield className="text-primary mb-2" size={24} />
                <span className="text-xs font-bold text-center">Verified Doctors</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-white shadow-sm border border-secondary">
                <Clock className="text-primary mb-2" size={24} />
                <span className="text-xs font-bold text-center">24/7 Access</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-white shadow-sm border border-secondary">
                <Award className="text-primary mb-2" size={24} />
                <span className="text-xs font-bold text-center">Quality Care</span>
              </div>
            </div>
          </div>

          {/* Right Section: Promotional Banners */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="group relative h-80 rounded-[32px] overflow-hidden medical-gradient p-8 text-white flex flex-col justify-end"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                <Shield size={160} />
              </div>
              <h3 className="text-2xl font-bold mb-2">General Consultation</h3>
              <p className="text-white/80 text-sm mb-4">Get professional advice at discounted prices.</p>
              <div className="text-3xl font-black mb-4">₹199 <span className="text-sm font-normal line-through opacity-60">₹500</span></div>
              <button
                onClick={() => navigate('/chat')}
                className="bg-white text-primary w-full py-3 rounded-xl font-bold group-hover:bg-secondary transition-colors"
              >
                Consult Now
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="group relative h-80 rounded-[32px] overflow-hidden bg-text p-8 text-white flex flex-col justify-end"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                <Clock size={160} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Lab Package</h3>
              <p className="text-white/80 text-sm mb-4">Complete body checkup for you and your family.</p>
              <div className="text-3xl font-black mb-4">₹999 <span className="text-sm font-normal line-through opacity-60">₹2499</span></div>
              <button
                onClick={() => navigate('/labs')}
                className="bg-primary text-white w-full py-3 rounded-xl font-bold group-hover:bg-primary-dark transition-colors border border-primary"
              >
                Book Test
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
