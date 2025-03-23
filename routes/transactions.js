const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth);

router.post('/invest', transactionController.createInvestment);
router.post('/withdraw', transactionController.requestWithdrawal);
// router.post('/withdraw', auth, transactionController.createWithdrawal);
router.get('/', transactionController.getTransactions);

// // Admin routes
// router.put('/approve-payment/:transactionId', admin, transactionController.approvePayment);
// router.put('/approve-transaction/:transactionId', admin, transactionController.approveTransaction);

// // Add this route for admin to get all transactions
router.get('/all', admin, transactionController.getAllTransactions);

module.exports = router;