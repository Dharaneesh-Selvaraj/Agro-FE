const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// POST /api/customers/register
router.post('/register', customerController.registerCustomer);

// POST /api/customers/login
router.post('/login', customerController.loginCustomer);

// POST /api/customers/notify
router.post('/notify', customerController.notifyCustomers);

module.exports = router;
