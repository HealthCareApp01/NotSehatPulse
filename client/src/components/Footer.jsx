import React from 'react';
import { Heart, Globe, Share2, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-text text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center medical-gradient">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold">HealthCare</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Premium telemedicine platform providing 24/7 access to top-rated verified doctors. 
              Your health is our priority.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Heart size={20} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Globe size={20} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Share2 size={20} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li className="hover:text-primary cursor-pointer transition-colors">Find Doctors</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Medical Pharmacy</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Lab Tests</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Health Packages</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li className="hover:text-primary cursor-pointer transition-colors">My Appointments</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Terms of Use</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary" />
                +91 1800-HEALTH-00
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                support@healthcare-app.com
              </li>
              <li className="pt-4">
                <span className="block text-xs uppercase font-bold text-white/40 mb-2">Total Managed Users</span>
                <span className="text-2xl font-black text-primary">2,481,002+</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} HealthCare Telemedicine. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
