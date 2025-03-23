const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Apply auth middleware to all routes
router.use(auth);

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });  // Wrap the user object
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
router.get('/profile', userController.getUserProfile);

// Edit user profile
router.put('/profile', userController.editUserProfile);

// Edit user password
router.put('/password', userController.editUserPassword);

// Send verification email
router.post('/verify-email', userController.sendVerificationEmail);

// Verify email
router.get('/verify-email', userController.verifyEmail);

// Get account overview
router.get('/account-overview', userController.getAccountOverview);
router.put('/balance', userController.updateBalance);

module.exports = router;