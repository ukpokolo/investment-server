const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REJECTED'],
    default: 'PENDING'
  },
  amount: {
    type: Number,
    required: true
  },
  cryptoType: {
    type: String,
    required: true,
    enum: ['BTC', 'ETH', 'USDT']
  },
  walletAddress: {
    type: String,
    required: true
  },
  investmentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPlan'
  },
  expectedProfit: {
    type: Number
  },
  maturityDate: {
    type: Date
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

module.exports = mongoose.model('Transaction', transactionSchema);