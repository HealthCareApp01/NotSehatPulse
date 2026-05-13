import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Place an order and clear cart
// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const order = await Order.create({
      user: req.user.userId,
      items,
      totalAmount,
      address
    });

    console.log('Order created:', order._id);
    console.log('Clearing cart for user:', req.user.userId);

    // Delete the cart in database
    await Cart.findOneAndDelete({ user: req.user.userId });
    console.log('Cart deleted successfully');

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
