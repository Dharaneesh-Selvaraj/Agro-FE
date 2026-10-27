const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');
const whatsappService = require('../services/whatsapp');

// In-memory OTP storage: phone -> { otp, expiresAt, name }
const otpStore = new Map();

// Periodic cleanup of expired OTPs every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 60000);

/**
 * Sends a 6-digit verification OTP to the customer's WhatsApp number.
 * Verifies if the phone number is active on WhatsApp before sending.
 */
exports.sendOtp = async (req, res) => {
  const { phone, name } = req.body;

  if (!phone || String(phone).replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit phone number.' });
  }

  const cleanNumber = whatsappService.formatPhoneNumber(phone);

  try {
    const waStatus = whatsappService.getWhatsAppStatus();
    if (waStatus.status !== 'READY') {
      return res.status(503).json({
        error: 'WhatsApp service is currently offline or synchronizing. Please check the Admin WhatsApp panel to ensure the QR code is scanned.'
      });
    }

    // Check if the number exists on WhatsApp
    const check = await whatsappService.checkIsWhatsApp(cleanNumber);
    if (check.exists === false) {
      return res.status(400).json({
        error: `The phone number +${cleanNumber} is NOT registered on WhatsApp. Please provide an active WhatsApp number.`
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory with 5-minute expiry
    otpStore.set(cleanNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      name: (name && name.trim()) || ''
    });

    console.log(`[OTP] Generated OTP for +${cleanNumber}: ${otp}`);

    const otpMessage = `🌾 *SRI VENKATESWARA TRADERS*\n\nYour WhatsApp verification code is: *${otp}*\n\nEnter this code to verify your WhatsApp number. Valid for 5 minutes. Do not share this OTP with anyone.`;

    await whatsappService.sendMessage(cleanNumber, otpMessage);

    res.status(200).json({
      success: true,
      message: `Verification code sent to WhatsApp (+${cleanNumber})!`,
      phone: cleanNumber
    });
  } catch (error) {
    console.error(`[OTP] Error sending OTP to ${cleanNumber}:`, error.message || error);
    res.status(500).json({
      error: error.message || 'Failed to send WhatsApp verification code. Please make sure the number is valid and on WhatsApp.'
    });
  }
};

/**
 * Verifies the WhatsApp OTP and registers/logs in the customer without passwords.
 */
exports.verifyOtp = async (req, res) => {
  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and verification OTP are required.' });
  }

  const cleanNumber = whatsappService.formatPhoneNumber(phone);
  const record = otpStore.get(cleanNumber);

  if (!record) {
    return res.status(400).json({
      error: 'No active OTP request found for this number or it has expired. Please click "Send OTP" to request a new code.'
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanNumber);
    return res.status(400).json({
      error: 'The OTP code has expired. Please request a new code.'
    });
  }

  if (String(record.otp).trim() !== String(otp).trim()) {
    return res.status(400).json({
      error: 'Incorrect verification code. Please check the 6-digit code received on WhatsApp.'
    });
  }

  // OTP is correct! Clear it from store
  otpStore.delete(cleanNumber);

  try {
    const pool = getPool();
    const customerName = (name && name.trim()) || record.name || 'Valued Customer';

    // Check if customer already exists
    const [existing] = await pool.query('SELECT * FROM customers WHERE phone = ?', [cleanNumber]);

    let customer;
    if (existing.length > 0) {
      customer = existing[0];
      // Update name if a non-empty name was provided
      if (name && name.trim() && customer.name !== name.trim()) {
        await pool.query('UPDATE customers SET name = ?, is_verified = 1 WHERE id = ?', [name.trim(), customer.id]);
        customer.name = name.trim();
      } else {
        await pool.query('UPDATE customers SET is_verified = 1 WHERE id = ?', [customer.id]);
      }
    } else {
      // Insert new verified customer (no password needed)
      const [insertResult] = await pool.query(
        'INSERT INTO customers (name, phone, is_verified) VALUES (?, ?, 1)',
        [customerName, cleanNumber]
      );
      customer = {
        id: insertResult.insertId,
        name: customerName,
        phone: cleanNumber,
        is_verified: 1
      };
    }

    // Send confirmation welcome message via WhatsApp in background
    try {
      const welcomeMsg = `🌾 *SRI VENKATESWARA TRADERS*\n\n✅ *Verification Successful!*\n\nYour WhatsApp number (+${cleanNumber}) is now verified. You will receive direct updates on coconut farming nutrients, new arrivals, and special seasonal offers.\n\nThank you for choosing Sri Venkateswara Traders!`;
      whatsappService.sendMessage(cleanNumber, welcomeMsg).catch(e => {
        console.warn('[Baileys] Welcome message send warning:', e.message);
      });
    } catch (e) {}

    res.status(200).json({
      success: true,
      message: 'WhatsApp number verified successfully!',
      user: {
        role: 'user',
        username: customer.name || 'Customer',
        phone: cleanNumber
      }
    });
  } catch (error) {
    console.error('[OTP] Error during OTP verification:', error);
    res.status(500).json({ error: 'Server error during verification. Please try again.' });
  }
};

// Customer Registration (fallback / direct without password)
exports.registerCustomer = async (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and WhatsApp phone number are required.' });
  }

  const cleanNumber = whatsappService.formatPhoneNumber(phone);

  try {
    const pool = getPool();

    // Check if customer exists
    const [existing] = await pool.query('SELECT * FROM customers WHERE phone = ?', [cleanNumber]);
    if (existing.length > 0) {
      return res.status(200).json({
        message: 'Customer is already registered.',
        customerId: existing[0].id
      });
    }

    const query = `INSERT INTO customers (name, email, phone, is_verified) VALUES (?, ?, ?, 1)`;
    const [result] = await pool.query(query, [name, email || null, cleanNumber]);

    res.status(201).json({ 
      message: 'Customer registered successfully.',
      customerId: result.insertId 
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This phone number is already registered.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin Login (Preserves admin credentials admin@agro.com / admin123)
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Hardcoded Admin check
  if (email.trim().toLowerCase() === 'admin@agro.com' && password === 'admin123') {
    return res.status(200).json({
      message: 'Admin login successful',
      user: { role: 'admin', username: 'Admin', email }
    });
  }

  return res.status(401).json({ 
    error: 'Invalid admin credentials. Customers can sign in directly using WhatsApp verification without a password.' 
  });
};

// Send product updates to all customers via WhatsApp
exports.notifyCustomers = async (req, res) => {
  const { message, link, imageUrl, targetPhone } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    let targets = [];

    if (targetPhone && targetPhone.trim()) {
      targets = [{ name: 'Customer', phone: targetPhone.trim() }];
    } else {
      const pool = getPool();
      const [customers] = await pool.query(`SELECT name, phone FROM customers`);
      targets = customers;
    }

    if (targets.length === 0) {
      return res.status(404).json({ message: 'No recipients found to notify.' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const customer of targets) {
      let finalMessage = `Hello ${customer.name},\n\n${message}`;
      if (link) {
        finalMessage += `\n\nLink: ${link}`;
      }
      
      try {
        await whatsappService.sendMessage(customer.phone, finalMessage, imageUrl);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.error(`Failed to notify ${customer.phone}:`, err.message || err);
        errors.push({ phone: customer.phone, error: err.message || 'Send failed' });
        failCount++;
      }
    }

    res.status(200).json({ 
      message: 'Notification process completed.', 
      success: successCount, 
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error notifying customers:", error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
