const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

// GET all investment plans
router.get('/', investmentController.getAllPlans);

// GET a specific investment plan
router.get('/:id', investmentController.getPlanById);

// CREATE a new investment plan
router.post('/', investmentController.createPlan);

// UPDATE an investment plan
router.put('/:id', investmentController.updatePlan);

// DELETE an investment plan
router.delete('/:id', investmentController.deletePlan);

module.exports = router;