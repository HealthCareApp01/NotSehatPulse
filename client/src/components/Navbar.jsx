import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Find Doctors', href: '#' },
    { name: 'Medicines', href: '#' },
    { name: 'Lab Tests', href: '#' },
    { name: 'Contact Us', href: '#' },
  ];

  return (
    <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          <div className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center medical-gradient transform rotate-3'>
              <span className='text-white font-bold text-xl'>H</span>
            </div>
            <span className='text-2xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent'>
              HealthCare
            </span>
          </div>

          <div className='hidden md:flex items-center space-x-8'>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className='text-text hover:text-primary font-medium transition-colors'
              >
                {link.name}
              </a>
            ))}
            <Link
              to='/login'
              className='flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 hover:shadow-lg'
            >
              <User size={18} />
              Login / Signup
            </Link>
          </div>

          <div className='md:hidden'>
            <button onClick={() => setIsOpen(!isOpen)} className='text-text'>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='md:hidden bg-white border-b border-secondary px-4 py-6 flex flex-col gap-4'
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className='text-text font-medium text-lg'
            >
              {link.name}
            </a>
          ))}
          <button className='w-full bg-primary text-white py-3 rounded-xl font-bold'>
            Login / Signup
          </button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
