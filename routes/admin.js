// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const walletController = require('../controllers/walletController');
const investmentController = require('../controllers/investmentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Notification = require('../models/Notification');

// Apply both auth and admin middleware to all routes except /system-wallets
router.use(auth);

// Admin routes
router.get('/users', admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/investments', admin, async (req, res) => {
  try {
    const investments = await Investment.find().populate('user', 'name email');
    res.json({
      success: true,
      count: investments.length,
      investments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/total-investments', admin, async (req, res) => {
  try {
    const totalInvestments = await Transaction.aggregate([
      { $match: { type: 'INVESTMENT', status: 'APPROVED' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      totalAmount: totalInvestments[0]?.totalAmount || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.delete('/users/:id', admin, async (req, res) => {
  try {
    // Find the user by the ID provided in the URL
    const user = await User.findById(req.params.id);

    // If the user doesn’t exist, return a 404 error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user being deleted is the same as the admin making the request
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete the user’s investments
    await Investment.deleteMany({ user: req.params.id });

    // Delete the user
    await user.deleteOne();

    // Return success response
    res.json({
      success: true,
      message: 'User and associated investments removed'
    });
  } catch (err) {
    // Handle any server errors
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin notifications route
router.get('/notifications', admin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/notifications/mark-as-read', admin, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin wallet routes
router.post('/system-wallet', admin, walletController.createSystemWallet);
router.put('/system-wallet/:walletId', admin, walletController.updateSystemWallet);
router.delete('/system-wallet/:walletId', admin, walletController.deleteSystemWallet);

// Approve pending investment
router.put('/approve-investment/:transactionId', admin, investmentController.approveInvestment);

// Approve pending withdrawal
router.put('/approve-withdrawal/:transactionId', admin, walletController.approveWithdrawal);

// Allow users to access this endpoint
router.get('/system-wallets', walletController.getSystemWallets);

module.exports = router;