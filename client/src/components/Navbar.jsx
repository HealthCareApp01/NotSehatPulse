import { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Doctors', href: '#' },
    { name: 'Medicines', href: '#' },
    { name: 'Lab Tests', href: '#' },
    { name: 'Contact Us', href: '#' },
  ];

  return (
    <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          <Link to="/" className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center medical-gradient transform rotate-3'>
              <span className='text-white font-bold text-xl'>H</span>
            </div>
            <span className='text-2xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent'>
              HealthCare
            </span>
          </Link>

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

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 border-l pl-8 border-secondary">
                <Link
                  to={user.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard'}
                  className="flex items-center gap-2 text-text font-bold hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">
                    {user?.name?.charAt(0)}
                  </div>
                  {user?.name?.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to='/login'
                className='flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 hover:shadow-lg'
              >
                <User size={18} />
                Login / Signup
              </Link>
            )}
          </div>

          <div className='md:hidden'>
            <button onClick={() => setIsOpen(!isOpen)} className='text-text'>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden bg-white border-b border-secondary px-4 py-6 flex flex-col gap-4 overflow-hidden'
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className='text-text font-medium text-lg'
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to={user.role === 'Doctor' ? '/doctor-dashboard' : '/patient-dashboard'}
                  onClick={() => setIsOpen(false)}
                  className='flex items-center gap-2 bg-secondary text-text py-3 px-4 rounded-xl font-bold'
                >
                  <LayoutDashboard size={20} /> Dashboard ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className='w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold'
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to='/login'
                onClick={() => setIsOpen(false)}
                className='w-full bg-primary text-white py-3 rounded-xl font-bold text-center'
              >
                Login / Signup
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
