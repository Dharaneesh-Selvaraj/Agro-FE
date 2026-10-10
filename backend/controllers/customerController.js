const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');
const whatsappService = require('../services/whatsapp');

// Register a new customer
exports.registerCustomer = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const pool = getPool();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query(query, [name, email, phone, hashedPassword]);

    res.status(201).json({ 
      message: 'Customer registered successfully.',
      customerId: result.insertId 
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    // Basic error handling for duplicates
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email or phone number already exists.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Send product updates to all customers via WhatsApp
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Hardcoded Admin check
  if (email === 'admin@agro.com' && password === 'admin123') {
    return res.status(200).json({
      message: 'Login successful',
      user: { role: 'admin', username: 'Admin', email }
    });
  }

  try {
    const pool = getPool();
    
    // Check customers table
    const [rows] = await pool.query(`SELECT * FROM customers WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: { role: 'user', username: customer.name, email: customer.email }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.notifyCustomers = async (req, res) => {
  const { message, link, imageUrl } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    const pool = getPool();
    const [customers] = await pool.query(`SELECT name, phone FROM customers`);

    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customers found to notify.' });
    }

    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      let finalMessage = `Hello ${customer.name},\n\n${message}`;
      if (link) {
        finalMessage += `\n\nLink: ${link}`;
      }
      
      try {
        await whatsappService.sendMessage(customer.phone, finalMessage, imageUrl);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`Failed to notify ${customer.phone}:`, err.message || err);
        failCount++;
      }
    }

    res.status(200).json({ 
      message: 'Notification process completed.', 
      success: successCount, 
      failed: failCount 
    });
  } catch (error) {
    console.error("Error notifying customers:", error);
    res.status(500).json({ error: 'Server error' });
  }
};
