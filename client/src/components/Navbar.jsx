import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    dispatch(logout());
    navigate('/', { replace: true });
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Doctors', href: '/find-doctors' },
    { name: 'Medicines', href: '/pharmacy' },
    { name: 'Lab Tests', href: '/labs' },
    { name: 'Contact Us', href: '/contact-us' },
  ];

  return (
    <>
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
              <Link
                key={link.name}
                to={link.href}
                className='text-text hover:text-primary font-medium transition-colors'
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 border-l pl-8 border-secondary">
                <Link to="/medicines" className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                  <ShoppingCart size={22} />
                  {cart?.items?.length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                </Link>
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
                  onClick={() => setShowLogoutConfirm(true)}
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
              <Link
                key={link.name}
                to={link.href}
                className='text-text font-medium text-lg'
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
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
                  onClick={() => setShowLogoutConfirm(true)}
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

    {/* Logout Confirmation Modal */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center relative border border-secondary">
          <button 
            onClick={() => setShowLogoutConfirm(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
            <LogOut size={40} />
          </div>
          <h2 className="text-2xl font-black text-text mb-2">Confirm Logout</h2>
          <p className="text-slate-500 font-medium mb-8">Are you sure you want to log out of your account?</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowLogoutConfirm(false)} 
              className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button 
              onClick={confirmLogout} 
              className="flex-1 bg-rose-500 text-white font-bold py-3 rounded-2xl hover:bg-rose-600 transition shadow-lg shadow-rose-500/30"
            >
              Log Out
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </>
);
};

export default Navbar;
