const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
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
  
  // LocalAuth saves the session locally so you don't have to scan QR every time
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      protocolTimeout: 180000, // 3 min protocol timeout
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--no-zygote',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-background-networking',
        '--js-flags=--max-old-space-size=256'
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

  client.on('ready', async () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
    connectionStatus = 'READY';
    currentQrCode = null;

    // Inject runtime patches to prevent LID errors and getChat hangs
    await ensureSafeChatPatches(client);
  });

  client.on('authenticated', () => {
    console.log('WhatsApp Client authenticated successfully. Syncing chats...');
    connectionStatus = 'SYNCING';
    isReady = false;
    currentQrCode = null;
  });

  client.on('auth_failure', msg => {
    console.error('WhatsApp authentication failure:', msg);
    isReady = false;
    connectionStatus = 'DISCONNECTED';
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`Syncing WhatsApp... ${percent}% : ${message}`);
    if (connectionStatus !== 'READY') {
      connectionStatus = 'SYNCING';
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

/**
 * Injects patches into the WhatsApp Web context to handle LID migration
 * and prevent findOrCreateLatestChat from hanging on unsaved contacts.
 */
async function ensureSafeChatPatches(waClient) {
  if (!waClient || !waClient.pupPage) return;
  try {
    await waClient.pupPage.evaluate(() => {
      // 1. Guard LID 1x1 migration check to prevent crashes/hangs
      try {
        if (window.WWebJS && window.WWebJS.injectToFunction) {
          window.WWebJS.injectToFunction(
            { module: 'WAWebLid1X1MigrationGating', function: 'isLidMigrated' },
            (module, func, ...args) => {
              try { return func(...args); } catch { return false; }
            }
          );
        }
      } catch (e) {
        console.warn('[Patch] LID gating patch error:', e);
      }

      // 2. Wrap window.WWebJS.getChat to never hang indefinitely
      if (window.WWebJS && !window.WWebJS._safeGetChatInstalled) {
        window.WWebJS._safeGetChatInstalled = true;
        const origGetChat = window.WWebJS.getChat;

        window.WWebJS.getChat = async (chatId, options = {}) => {
          const isChannel = /@\w*newsletter\b/.test(chatId);
          if (isChannel) {
            return origGetChat(chatId, options);
          }

          let chatWid;
          try {
            chatWid = window.require('WAWebWidFactory').createWid(chatId);
          } catch (e) {
            return origGetChat(chatId, options);
          }

          // A. Synchronous check in cached chats
          let chat = null;
          try {
            chat = window.require('WAWebCollections').Chat.get(chatWid);
          } catch (e) {}

          if (chat) {
            return options.getAsModel ? await window.WWebJS.getChatModel(chat, { isChannel }) : chat;
          }

          // B. Asynchronous lookup via Chat.find (safe database query)
          try {
            const findPromise = window.require('WAWebCollections').Chat.find(chatWid);
            chat = await Promise.race([
              findPromise,
              new Promise(r => setTimeout(() => r(null), 3000))
            ]);
            if (chat) {
              return options.getAsModel ? await window.WWebJS.getChatModel(chat, { isChannel }) : chat;
            }
          } catch (e) {}

          // C. Native findOrCreateLatestChat with a strict 4-second timeout so it never hangs
          try {
            const findActionPromise = window.require('WAWebFindChatAction').findOrCreateLatestChat(chatWid);
            const res = await Promise.race([
              findActionPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('findOrCreateLatestChat timeout')), 4000))
            ]);
            if (res && res.chat) {
              return options.getAsModel ? await window.WWebJS.getChatModel(res.chat, { isChannel }) : res.chat;
            }
          } catch (e) {
            console.warn('[Patch] findOrCreateLatestChat timed out/failed, falling back to Chat creation:', e.message);
          }

          // D. Fallback: create Chat model instance directly for new unsaved contact
          try {
            const ChatColl = window.require('WAWebCollections').Chat;
            if (ChatColl && ChatColl.modelClass) {
              chat = new ChatColl.modelClass({ id: chatWid });
              ChatColl.add(chat);
              return options.getAsModel ? await window.WWebJS.getChatModel(chat, { isChannel }) : chat;
            }
          } catch (e) {
            console.warn('[Patch] Ephemeral Chat creation warning:', e);
          }

          return null;
        };
        console.log('[Patch] Safe getChat and LID hooks successfully installed in WhatsApp Web context');
      }
    });
  } catch (err) {
    console.warn('[WA] Could not apply safe chat patches:', err.message);
  }
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

  // Clear stale auth directory to ensure fresh QR linking handshake
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
  } else if (currentQrCode && status !== 'SYNCING') {
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
    throw new Error('WhatsApp client is still synchronizing or not ready. Please wait a moment until status shows Ready.');
  }

  try {
    const cleanNumber = formatPhoneNumber(number);
    let chatId = `${cleanNumber}@c.us`;

    // If recipient is the logged-in user themselves, use their exact registered wid
    if (client.info && client.info.wid && client.info.wid.user === cleanNumber) {
      chatId = client.info.wid._serialized;
      console.log(`[WA] Sending to logged-in user self-chat: ${chatId}`);
    }
    
    // Instead of using MessageMedia (which is currently broken in this whatsapp-web.js version 
    // due to a Meta update), we simply append the image link to the text. 
    // WhatsApp automatically generates a beautiful rich preview for the image!
    let finalPayload = text;
    if (imageUrl) {
      finalPayload = `[Promotional Image]\n${imageUrl}\n\n${text}`;
    }

    // Ensure the safe getChat and LID patches are applied to the active page
    await ensureSafeChatPatches(client);

    console.log(`[WA] Sending WhatsApp message to ${chatId}...`);
    
    // Pass options to disable link preview fetch and read receipt on new chats
    const sendPromise = client.sendMessage(chatId, finalPayload, {
      linkPreview: false,
      sendSeen: false
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('WhatsApp message delivery timed out after 45s. WhatsApp may be slow or connection busy. Please retry.')), 45000)
    );

    await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`[WA] Message successfully sent to ${cleanNumber} (${chatId})`);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${number}:`, error.message || error);
    throw error;
  }
}

module.exports = { initWhatsApp, restartWhatsApp, sendMessage, getWhatsAppStatus, formatPhoneNumber };
