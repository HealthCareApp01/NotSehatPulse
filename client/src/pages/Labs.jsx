import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  Loader2,
  Search,
  Bot
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLabTests, setSearchTerm } from '../store/slices/productSlice';
import { fetchCart, addToCart, updateCartQuantity, removeFromCart, placeOrder, resetOrderSuccess } from '../store/slices/cartSlice';
import AuthModal from '../components/AuthModal';
import axios from 'axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Labs = () => {
  const dispatch = useDispatch();
  const { labTests, loading: productsLoading, searchTerm } = useSelector((state) => state.products);
  const { cart, loading: cartLoading, orderSuccess } = useSelector((state) => state.cart);
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    dispatch(fetchLabTests(searchTerm));
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, searchTerm, isAuthenticated]);

  // Clear search on unmount
  useEffect(() => {
    return () => dispatch(setSearchTerm(''));
  }, [dispatch]);

  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetOrderSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, dispatch]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setPendingAction(() => () => dispatch(addToCart({ productId: product._id, quantity: 1, itemModel: 'LabTest' })));
      setShowAuthModal(true);
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1, itemModel: 'LabTest' }));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartQuantity({ productId, quantity }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;

    setPaymentError('');
    setPaymentLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaymentError('Failed to load Razorpay SDK. Please check your connection.');
        setPaymentLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/orders/pay/create-order',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { order, keyId } = response.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'NotSehatPulse Pharmacy',
        description: 'Medicine & Labs Purchase',
        image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=300&h=300',
        order_id: order.id,
        handler: async function (paymentResponse) {
          try {
            setPaymentLoading(true);

            const orderData = {
              items: cart.items.map(item => ({
                name: item.product?.name,
                price: item.product?.price,
                quantity: item.quantity,
                itemType: item.itemModel
              })),
              totalAmount: cartTotal,
              address: 'Default Delivery Address',
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            };

            await dispatch(placeOrder(orderData)).unwrap();
          } catch (err) {
            console.error('Order placement failed:', err);
            setPaymentError(err || 'Failed to verify payment and place order.');
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user?.name || 'Patient',
          email: user?.email || 'patient@example.com'
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: function () {
            setPaymentError('Payment cancelled. Items are still in your cart for retry.');
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (resp) {
        setPaymentError(`Payment failed: ${resp.error.description || 'Reason unknown'}`);
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Error in cart checkout payment flow:', err);
      setPaymentError(err.response?.data?.message || 'Failed to initiate payment.');
      setPaymentLoading(false);
    }
  };

  const cartTotal = cart.items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="space-y-10">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          if (pendingAction) pendingAction();
          setPendingAction(null);
        }}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-text">Lab Tests</h1>
          <p className="text-slate-500 mt-2">Book comprehensive health checkups and tests.</p>
        </div>
        <Link 
          to="/ai-symptom-checker"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
        >
          <Bot size={20} className="animate-pulse" />
          Summarize Lab Report
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-10">
          {productsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : labTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic">
              <Search size={48} className="mb-4 opacity-20" />
              <p>No lab tests found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {labTests.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-[32px] border border-secondary shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-secondary/30">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                      {product.brand}
                    </div>
                  </div>
                  <h4 className="font-bold text-text mb-1 truncate">{product.name}</h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-text">₹{product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm sticky top-0 h-fit">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-text">Your Cart</h3>
              <div className="relative">
                <ShoppingCart className="text-primary" />
                {cart.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {orderSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full mx-auto flex items-center justify-center text-green-500">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="font-bold text-text">Order Placed!</h4>
                  <p className="text-slate-400 text-sm italic">Your tests have been scheduled.</p>
                </motion.div>
              ) : cart.items.length === 0 ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-300">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-slate-400 font-medium italic">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {cart.items.map((item) => (
                    <div key={item.product?._id} className="flex gap-4 group">
                      <div className="w-16 h-16 rounded-xl bg-secondary/30 overflow-hidden flex-shrink-0">
                        <img src={item.product?.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-text text-sm truncate">{item.product?.name}</h5>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-2 py-1">
                            <button 
                              onClick={() => handleUpdateQuantity(item.product?._id, item.quantity - 1)}
                              className="text-primary hover:bg-white rounded-md p-0.5 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.product?._id, item.quantity + 1)}
                              className="text-primary hover:bg-white rounded-md p-0.5 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => handleRemove(item.product?._id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {cart.items.length > 0 && !orderSuccess && (
              <div className="mt-8 pt-8 border-t border-secondary space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Amount</span>
                  <span className="text-2xl font-black text-text">₹{cartTotal}</span>
                </div>

                {paymentError && (
                  <div className="bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-2xl font-bold text-xs text-center animate-shake">
                    ⚠️ {paymentError}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={cartLoading || paymentLoading}
                  className="w-full py-4 bg-primary disabled:bg-slate-300 text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:bg-primary-dark flex items-center justify-center gap-2 cursor-pointer"
                >
                  {cartLoading || paymentLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labs;