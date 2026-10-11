require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const { initWhatsApp } = require('./services/whatsapp');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.get('/api/whatsapp/status', (req, res) => {
  const { getWhatsAppStatus } = require('./services/whatsapp');
  res.status(200).json(getWhatsAppStatus());
});

app.post('/api/whatsapp/restart', async (req, res) => {
  const { restartWhatsApp } = require('./services/whatsapp');
  try {
    await restartWhatsApp();
    res.status(200).json({ message: 'WhatsApp client restarting...' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Database and Services, then start server
async function startServer() {
  console.log("Starting server initialization...");
  
  // 1. Init DB
  await initDB();

  // 2. Init WhatsApp
  // Note: This starts asynchronously, so we don't await it to block server startup
  initWhatsApp();

  // 3. Start listening
  const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  process.exit(0);
});

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
