const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrcodeLib = require('qrcode');
const fs = require('fs');
const path = require('path');

let client;
let isReady = false;
let currentQrCode = null;
let connectionStatus = 'INITIALIZING'; // INITIALIZING, NEEDS_SCAN, AUTHENTICATED, READY, DISCONNECTED

function initWhatsApp() {
  console.log('Initializing WhatsApp client...');
  
  // Clean, standard Puppeteer configuration without conflicting flags
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', async (qr) => {
    // Print directly to terminal (so you can scan from terminal like before)
    console.log('SCAN THE QR CODE BELOW WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
    
    // Also provide data URL for the web UI
    try {
      currentQrCode = await qrcodeLib.toDataURL(qr);
      connectionStatus = 'NEEDS_SCAN';
    } catch (err) {
      console.error('Failed to generate QR data URL', err);
    }
  });

  client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
    connectionStatus = 'READY';
    currentQrCode = null;
  });

  client.on('authenticated', () => {
    console.log('WhatsApp Client authenticated successfully.');
    connectionStatus = 'AUTHENTICATED';
    currentQrCode = null;

    // Fast-path ready fallback: marks ready after 5s if ready event is skipped by WA Web
    setTimeout(() => {
      if (!isReady) {
        console.log('WhatsApp Client is ready! (Bypassed)');
        isReady = true;
        connectionStatus = 'READY';
      }
    }, 5000);
  });

  client.on('auth_failure', msg => {
    console.error('WhatsApp authentication failure:', msg);
    isReady = false;
    connectionStatus = 'DISCONNECTED';
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`Syncing WhatsApp... ${percent}% : ${message}`);
    if (connectionStatus !== 'READY') {
      connectionStatus = 'INITIALIZING';
    }
  });
  
  client.on('disconnected', (reason) => {
    console.log('WhatsApp Client was logged out', reason);
    isReady = false;
    currentQrCode = null;
    connectionStatus = 'DISCONNECTED';
  });

  client.initialize().catch(err => {
    console.error('Error during WhatsApp client initialize:', err);
    connectionStatus = 'DISCONNECTED';
  });
}

async function restartWhatsApp() {
  console.log('Restarting WhatsApp client...');
  try {
    if (client) {
      await client.destroy();
    }
  } catch (err) {
    console.error('Error destroying previous WhatsApp client:', err);
  }

  // Clear stale auth directory if needed
  try {
    const authDir = path.join(process.cwd(), '.wwebjs_auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
      console.log('Cleaned stale .wwebjs_auth directory');
    }
  } catch (err) {
    console.warn('Could not remove auth directory:', err.message);
  }

  isReady = false;
  currentQrCode = null;
  connectionStatus = 'INITIALIZING';
  initWhatsApp();
}

function getWhatsAppStatus() {
  let status = connectionStatus;
  if (isReady) {
    status = 'READY';
  } else if (currentQrCode && status !== 'INITIALIZING') {
    status = 'NEEDS_SCAN';
  }
  return {
    status,
    qr: currentQrCode
  };
}

function formatPhoneNumber(number) {
  let cleanNumber = String(number || '').replace(/\D/g, '');
  if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
    cleanNumber = '91' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 10) {
    cleanNumber = '91' + cleanNumber;
  }
  return cleanNumber;
}

/**
 * Sends a message to a specific number, optionally with an image
 * @param {string} number - The phone number (e.g., '919876543210' or '9876543210')
 * @param {string} text - The message content (or caption if image is provided)
 * @param {string} [imageUrl] - Optional URL of the image to send
 */
async function sendMessage(number, text, imageUrl = null) {
  if (!isReady) {
    throw new Error('WhatsApp client is not ready yet. Please wait or scan the QR code.');
  }

  try {
    const cleanNumber = formatPhoneNumber(number);
    let chatId = `${cleanNumber}@c.us`;

    // Attempt getNumberId with a 4s cap to populate WA Web's internal contact cache
    try {
      const numberDetails = await Promise.race([
        client.getNumberId(cleanNumber),
        new Promise((_, reject) => setTimeout(() => reject(new Error('lookup timeout')), 4000))
      ]);
      if (numberDetails && numberDetails._serialized) {
        chatId = numberDetails._serialized;
      }
    } catch (lookupErr) {
      console.log(`[WA] Using standard chatId ${chatId} (${lookupErr.message})`);
    }

    let finalPayload = text;
    if (imageUrl) {
      finalPayload = `[Promotional Image]\n${imageUrl}\n\n${text}`;
    }

    console.log(`[WA] Sending message to ${chatId}...`);
    await client.sendMessage(chatId, finalPayload);
    console.log(`[WA] Message successfully sent to ${cleanNumber}`);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${number}:`, error.message || error);
    throw error;
  }
}

module.exports = { initWhatsApp, restartWhatsApp, sendMessage, getWhatsAppStatus, formatPhoneNumber };
