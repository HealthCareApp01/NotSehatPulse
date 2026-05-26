import express from 'express';
import Subscription from '../models/Subscription.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { protect } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sd7HXWLedK9qh5',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'iQDFb0ou7FKbi0xmuERWI6VQ'
});

// @desc    Create Razorpay Order for Platform Chat Subscription
// @route   POST /api/subscriptions/pay/create-order
router.post('/pay/create-order', protect, async (req, res) => {
  try {
    const fee = 299; // Fixed platform subscription fee

    const options = {
      amount: Math.round(fee * 100), // in paise
      currency: 'INR',
      receipt: `receipt_sub_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sd7HXWLedK9qh5',
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order for subscription:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Subscribe to platform health chat
// @route   POST /api/subscriptions/subscribe
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All subscription and payment details are required.' });
    }

    // Cryptographic Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'iQDFb0ou7FKbi0xmuERWI6VQ')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    const fee = 299;

    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    // Check if an active platform subscription already exists to extend it
    let subscription = await Subscription.findOne({
      patientId: req.user.userId,
      planType: 'Platform',
      status: 'Active',
      endDate: { $gt: new Date() }
    });

    if (subscription) {
      // Extend the active subscription by 30 days
      subscription.endDate = new Date(subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      subscription.paymentId = razorpay_payment_id;
      subscription.amountPaid = subscription.amountPaid + fee;
      await subscription.save();
    } else {
      // Create a brand new subscription
      subscription = new Subscription({
        patientId: req.user.userId,
        planType: 'Platform',
        startDate,
        endDate,
        status: 'Active',
        paymentStatus: 'Completed',
        paymentId: razorpay_payment_id,
        amountPaid: fee
      });
      await subscription.save();
    }

    console.log(`✅ Platform Subscription created/extended successfully! ID: ${subscription._id}`);

    res.status(201).json({
      success: true,
      message: 'Subscribed to Health Chat successfully.',
      data: subscription
    });
  } catch (error) {
    console.error('Error in subscription confirmation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user's subscriptions
// @route   GET /api/subscriptions/my
router.get('/my', protect, async (req, res) => {
  try {
    const query = {
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ]
    };

    // Auto-update expired subscriptions status
    await Subscription.updateMany(
      { status: 'Active', endDate: { $lt: new Date() } },
      { $set: { status: 'Expired' } }
    );

    const subscriptions = await Subscription.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Check active platform subscription
// @route   GET /api/subscriptions/check/active
router.get('/check/active', protect, async (req, res) => {
  try {
    // Auto-update expired subscriptions status first
    await Subscription.updateMany(
      { status: 'Active', endDate: { $lt: new Date() } },
      { $set: { status: 'Expired' } }
    );

    const subscription = await Subscription.findOne({
      patientId: req.user.userId,
      planType: 'Platform',
      status: 'Active',
      endDate: { $gt: new Date() }
    });

    res.json({
      success: true,
      hasActiveSubscription: !!subscription,
      subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
