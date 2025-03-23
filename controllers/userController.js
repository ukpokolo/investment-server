const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.getAccountOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('activeCapital returnOnInvestment dormantFunds tradingStatus');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching account overview',
      error: err.message
    });
  }
};

exports.updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Find the requesting user by ID
    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ success: false, message: 'Requesting user not found' });
    }

    // Check if the requesting user is an admin
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find the target user by ID (assuming the target user ID is passed in the request body)
    const targetUserId = req.body.targetUserId;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // Update the target user's dormant funds balance
    targetUser.dormantFunds += amount;
    await targetUser.save();

    res.json({ success: true, user: targetUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating balance', error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.editUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${process.env.FRONTEND_URL}/verify-email?token=${token}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};