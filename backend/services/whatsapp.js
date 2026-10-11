const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const qrcodeLib = require('qrcode');
const fs = require('fs');
const path = require('path');

let sock = null;
let isReady = false;
let currentQrCode = null;
let connectionStatus = 'INITIALIZING'; // INITIALIZING, NEEDS_SCAN, AUTHENTICATED, READY, DISCONNECTED
const AUTH_DIR = path.join(process.cwd(), 'baileys_auth');

async function initWhatsApp() {
  console.log('[Baileys] Initializing WhatsApp engine (Browserless, direct WebSocket)...');
  connectionStatus = 'INITIALIZING';
  isReady = false;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307], isLatest: true }));
    console.log(`[Baileys] Using WA Web v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Sri Venkateswara Traders', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('SCAN THE QR CODE BELOW WITH WHATSAPP:');
        qrcode.generate(qr, { small: true });

        try {
          currentQrCode = await qrcodeLib.toDataURL(qr);
          connectionStatus = 'NEEDS_SCAN';
          isReady = false;
        } catch (err) {
          console.error('[Baileys] Failed to generate QR data URL:', err);
        }
      }

      if (connection === 'connecting') {
        console.log('[Baileys] Connecting to WhatsApp network...');
        if (!currentQrCode) {
          connectionStatus = 'INITIALIZING';
        }
      }

      if (connection === 'open') {
        console.log('[Baileys] ✅ WhatsApp Client is connected and READY to send!');
        isReady = true;
        connectionStatus = 'READY';
        currentQrCode = null;
      }

      if (connection === 'close') {
        isReady = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[Baileys] Connection closed (code: ${statusCode}). Reconnect: ${shouldReconnect}`);

        if (shouldReconnect) {
          connectionStatus = 'INITIALIZING';
          setTimeout(() => {
            initWhatsApp();
          }, 3000);
        } else {
          console.log('[Baileys] Session logged out. Wiping credentials for clean QR...');
          connectionStatus = 'DISCONNECTED';
          currentQrCode = null;
          try {
            if (fs.existsSync(AUTH_DIR)) {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            }
          } catch (e) {}
          setTimeout(() => {
            initWhatsApp();
          }, 2000);
        }
      }
    });

  } catch (err) {
    console.error('[Baileys] Initialization error:', err);
    connectionStatus = 'DISCONNECTED';
  }
}

async function restartWhatsApp() {
  console.log('[Baileys] Restarting WhatsApp client...');
  try {
    if (sock) {
      sock.end();
      sock = null;
    }
  } catch (e) {
    console.warn('[Baileys] Socket close warning:', e.message);
  }

  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log('[Baileys] Removed stale session data');
    }
  } catch (err) {
    console.warn('[Baileys] Could not remove auth directory:', err.message);
  }

  isReady = false;
  currentQrCode = null;
  connectionStatus = 'INITIALIZING';
  await initWhatsApp();
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
  if (!sock || !isReady) {
    throw new Error('WhatsApp client is not connected. Please scan the QR code first.');
  }

  try {
    const cleanNumber = formatPhoneNumber(number);
    const jid = `${cleanNumber}@s.whatsapp.net`;

    console.log(`[Baileys] Sending message to ${jid}...`);

    let response;
    if (imageUrl && imageUrl.trim()) {
      // Send real native image with caption
      response = await sock.sendMessage(jid, {
        image: { url: imageUrl.trim() },
        caption: text
      });
    } else {
      // Send text message
      response = await sock.sendMessage(jid, {
        text: text
      });
    }

    console.log(`[Baileys] ✅ Message successfully delivered to ${cleanNumber}! Key:`, response?.key?.id);
    return true;
  } catch (error) {
    console.error(`[Baileys] Failed to send message to ${number}:`, error.message || error);
    throw error;
  }
}

module.exports = { initWhatsApp, restartWhatsApp, sendMessage, getWhatsAppStatus, formatPhoneNumber };
