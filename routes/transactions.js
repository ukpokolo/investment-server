const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/invest', transactionController.createInvestment);
router.post('/withdraw', transactionController.requestWithdrawal);
router.get('/', transactionController.getTransactions);

module.exports = router; 