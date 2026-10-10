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
    // Puppeteer args to help it run on some environments
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
    if (connectionStatus !== 'READY') {
      connectionStatus = 'INITIALIZING';
    }
  });
  
  client.on('disconnected', (reason) => {
      console.log('WhatsApp Client was logged out', reason);
      isReady = false;
      connectionStatus = 'DISCONNECTED';
  });

  client.initialize();
}

function getWhatsAppStatus() {
  return {
    status: connectionStatus,
    qr: currentQrCode
  };
}

/**
 * Sends a message to a specific number, optionally with an image
 * @param {string} number - The phone number (e.g., '919876543210')
 * @param {string} text - The message content (or caption if image is provided)
 * @param {string} [imageUrl] - Optional URL of the image to send
 */
async function sendMessage(number, text, imageUrl = null) {
  if (!isReady) {
    throw new Error('WhatsApp client is not ready yet. Please wait or scan the QR code.');
  }

  try {
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if the number is registered on WhatsApp first.
    // This also populates the local WhatsApp cache to prevent the "Data passed to getter" error.
    const numberDetails = await client.getNumberId(cleanNumber);
    if (!numberDetails) {
      throw new Error(`Number ${cleanNumber} is not registered on WhatsApp.`);
    }

    const chatId = numberDetails._serialized;
    
    // Instead of using MessageMedia (which is currently broken in this whatsapp-web.js version 
    // due to a Meta update), we simply append the image link to the text. 
    // WhatsApp automatically generates a beautiful rich preview for the image!
    let finalPayload = text;
    if (imageUrl) {
      finalPayload = `[Promotional Image]\n${imageUrl}\n\n${text}`;
    }

    await client.sendMessage(chatId, finalPayload);
    
    console.log(`Message sent to ${cleanNumber}`);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${number}:`, error.message || error);
    throw error;
  }
}

module.exports = { initWhatsApp, sendMessage, getWhatsAppStatus };
