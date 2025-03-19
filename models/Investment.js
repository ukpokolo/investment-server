const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  interest: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  durationUnit: {
    type: String,
    enum: ['Day', 'Days', 'Week', 'Weeks', 'Month', 'Months'],
    required: true
  },
  minimumAmount: {
    type: Number,
    required: true,
    min: 0
  },
  maximumAmount: {
    type: Number,
    required: true,
    min: 0
  },
  tradingCommission: {
    type: Number,
    required: true,
    min: 0
  },
  referralBonus: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    default: 'Standard'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Ongoing'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);