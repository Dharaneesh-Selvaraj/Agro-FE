const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrcodeLib = require('qrcode');

let client;
let isReady = false;
let currentQrCode = null;
let connectionStatus = 'INITIALIZING'; // INITIALIZING, NEEDS_SCAN, AUTHENTICATED, READY, DISCONNECTED

function initWhatsApp() {
  console.log('Initializing WhatsApp client...');
  
  // LocalAuth saves the session locally so you don't have to scan QR every time
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      protocolTimeout: 300000, // 5 min timeout to prevent Runtime.callFunctionOn timed out
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', async (qr) => {
    // Generate and scan this code with your phone
    console.log('SCAN THE QR CODE BELOW WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
    
    // Also generate a Base64 image for the frontend
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
    
    // Workaround for whatsapp-web.js bug where 'ready' event is skipped
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
    connectionStatus = 'DISCONNECTED';
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`Syncing WhatsApp... ${percent}% : ${message}`);
    if (connectionStatus !== 'READY' && connectionStatus !== 'NEEDS_SCAN') {
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
  isReady = false;
  currentQrCode = null;
  connectionStatus = 'INITIALIZING';
  initWhatsApp();
}

function getWhatsAppStatus() {
  let status = connectionStatus;
  if (isReady) {
    status = 'READY';
  } else if (currentQrCode) {
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
    const chatId = `${cleanNumber}@c.us`;
    
    // Instead of using MessageMedia (which is currently broken in this whatsapp-web.js version 
    // due to a Meta update), we simply append the image link to the text. 
    // WhatsApp automatically generates a beautiful rich preview for the image!
    let finalPayload = text;
    if (imageUrl) {
      finalPayload = `[Promotional Image]\n${imageUrl}\n\n${text}`;
    }

    console.log(`Sending WhatsApp message to ${chatId}...`);
    await client.sendMessage(chatId, finalPayload);
    
    console.log(`Message successfully sent to ${cleanNumber} (${chatId})`);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${number}:`, error.message || error);
    throw error;
  }
}

module.exports = { initWhatsApp, restartWhatsApp, sendMessage, getWhatsAppStatus, formatPhoneNumber };
