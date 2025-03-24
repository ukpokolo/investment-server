// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Add this import


// Login user or admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT payload with role information
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign and return token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user (by default role is 'user')
    user = new User({
      name,
      email,
      password,
      // Only allow setting role to admin if explicitly specified
      role: role === 'admin' ? 'admin' : 'user'
    });

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign and return token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with that email address exists'
      });
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set code expiration (10 minutes from now)
    const resetCodeExpires = Date.now() + 10 * 60 * 1000;

    // Save the code and expiration to the user document
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save();

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Set up email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Code',
      text: `You are receiving this because you (or someone else) requested a password reset for your account.\n\n
      Your verification code is: ${resetCode}\n\n
      This code will expire in 10 minutes.\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email',
      error: err.message
    });
  }
};

// Step 2: Verify the reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset code'
      });
    }

    // Generate a temporary token for the password reset
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;

    // The code has been verified, but keep the expiration time for the token
    user.resetPasswordCode = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Code verified successfully',
      resetToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error verifying reset code',
      error: err.message
    });
  }
};

// Step 3: Reset password using the verified token
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token and check expiration
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Set the new password
    user.password = newPassword;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password has been successfully reset'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: err.message
    });
  }
};
