// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Investment = require('../models/Investment');
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Apply both auth and admin middleware to all routes
router.use(auth, admin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
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

// @route   GET /api/admin/investments
// @desc    Get all investments
// @access  Admin
router.get('/investments', async (req, res) => {
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

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user's investments
    await Investment.deleteMany({ user: req.params.id });
    
    // Delete user
    await user.remove();
    
    res.json({
      success: true,
      message: 'User and associated investments removed'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin wallet routes
router.post('/system-wallet', walletController.createSystemWallet);
router.get('/system-wallets', walletController.getSystemWallets);

module.exports = router;