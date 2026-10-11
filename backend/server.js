require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const { initWhatsApp } = require('./services/whatsapp');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);

// Direct image upload endpoint for promotions & products
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = (filename && path.extname(filename)) || '.png';
    const safeName = `promo-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const publicUrl = `${protocol}://${host}/uploads/${safeName}`;

    console.log(`[Upload] Image saved: ${publicUrl}`);
    res.status(200).json({ success: true, imageUrl: publicUrl });
  } catch (err) {
    console.error('[Upload] Error saving image:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
