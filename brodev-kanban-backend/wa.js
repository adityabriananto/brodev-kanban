const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const AUTH_PATH = process.env.WA_AUTH_PATH || path.join(__dirname, '..', 'wa_auth_info');

let sock = null;
let latestQrBase64 = null;
let connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED', 'CONNECTING', 'QR_READY', 'CONNECTED'

const logger = pino({ level: 'silent' });

async function initWaClient() {
  connectionStatus = 'CONNECTING';
  latestQrBase64 = null;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Also print to terminal for dev convenience
    logger: logger
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionStatus = 'QR_READY';
      try {
        // Convert the QR string to a base64 Data URL so the frontend can easily render it
        latestQrBase64 = await QRCode.toDataURL(qr);
      } catch (err) {
        console.error('Failed to generate QR Data URL:', err);
      }
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('WhatsApp connection closed. Reconnecting:', shouldReconnect);
      connectionStatus = 'DISCONNECTED';
      latestQrBase64 = null;

      if (shouldReconnect) {
        setTimeout(initWaClient, 5000);
      } else {
        // Logged out: clean up credentials directory so we start fresh next time
        logoutWa();
      }
    } else if (connection === 'open') {
      console.log('WhatsApp connection opened successfully!');
      connectionStatus = 'CONNECTED';
      latestQrBase64 = null;
    }
  });
}

function getWaStatus() {
  return {
    status: connectionStatus,
    qr: latestQrBase64
  };
}

async function sendWaMessage(phoneNumber, message) {
  if (connectionStatus !== 'CONNECTED' || !sock) {
    console.warn('Cannot send WA message: client is not connected.');
    return false;
  }

  try {
    // Format phone number: strip spaces, dashes, lead 0/+, and append whatsapp domain
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.slice(1);
    }
    
    const jid = `${formattedNumber}@s.whatsapp.net`;
    console.log(`Sending WhatsApp message to ${jid}:`, message);
    
    await sock.sendMessage(jid, { text: message });
    return true;
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err);
    return false;
  }
}

async function logoutWa() {
  console.log('Logging out from WhatsApp...');
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (e) {}

  sock = null;
  latestQrBase64 = null;
  connectionStatus = 'DISCONNECTED';

  // Delete credentials directory
  if (fs.existsSync(AUTH_PATH)) {
    fs.rmSync(AUTH_PATH, { recursive: true, force: true });
    console.log('WhatsApp credentials directory deleted.');
  }

  // Restart client to generate new QR code
  setTimeout(initWaClient, 2000);
}

module.exports = {
  initWaClient,
  getWaStatus,
  sendWaMessage,
  logoutWa
};
