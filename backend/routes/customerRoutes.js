const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET /api/customers - List all customers
router.get('/', customerController.getAllCustomers);

// POST /api/customers/bulk-upload - Bulk upload customers
router.post('/bulk-upload', customerController.bulkUploadCustomers);

// DELETE /api/customers/:id - Delete single customer
router.delete('/:id', customerController.deleteCustomer);

// WhatsApp OTP Verification (No password required for customers)
// POST /api/customers/send-otp
router.post('/send-otp', customerController.sendOtp);

// POST /api/customers/verify-otp
router.post('/verify-otp', customerController.verifyOtp);

// POST /api/customers/register
router.post('/register', customerController.registerCustomer);

// POST /api/customers/login (For Admin)
router.post('/login', customerController.loginCustomer);

// POST /api/customers/notify
router.post('/notify', customerController.notifyCustomers);

module.exports = router;
