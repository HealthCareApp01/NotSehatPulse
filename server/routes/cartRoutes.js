import express from 'express';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) {
      // Return a virtual empty cart structure without saving it to MongoDB
      cart = { user: req.user.userId, items: [] };
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity, itemModel } = req.body; // Expect itemModel ('Medicine' or 'LabTest')
    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = await Cart.create({ 
        user: req.user.userId, 
        items: [{ product: productId, quantity: quantity || 1, itemModel }] 
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += (quantity || 1);
      } else {
        cart.items.push({ product: productId, quantity: quantity || 1, itemModel });
      }
      await cart.save();
    }

    const populatedCart = await cart.populate('items.product');
    res.json({ success: true, data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update item quantity
// @route   PUT /api/cart/update
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        const populatedCart = await cart.populate('items.product');
        return res.json({ success: true, data: populatedCart });
      }
    }
    res.status(404).json({ success: false, message: 'Item not found in cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });

    if (cart) {
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
      await cart.save();
      const populatedCart = await cart.populate('items.product');
      return res.json({ success: true, data: populatedCart });
    }
    res.status(404).json({ success: false, message: 'Cart not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Clear user cart
// @route   DELETE /api/cart/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.userId });
    res.json({ success: true, message: 'Cart cleared successfully', data: { items: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
