// models/User.js
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  activeCapital: {
    type: Number,
    default: 0
  },
  returnOnInvestment: {
    type: Number,
    default: 0
  },
  dormantFunds: {
    type: Number,
    default: 0
  },
  dormantBalance: {
    type: Number,
    default: 0
  },
  tradingStatus: {
    type: String,
    enum: ['DORMANT', 'ACTIVE'],
    default: 'DORMANT'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);