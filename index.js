// Firebase Cloud Functions for Hoops - Send OneSignal Notifications
// File: functions/index.js

const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {onRequest} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const axios = require('axios');

initializeApp();

// OneSignal Configuration - YOUR KEYS
const ONESIGNAL_REST_API_KEY = 'os_v2_app_iwd5mfiy4rb7bbgdvr7fd7vp6yokbuit3eceknep2o6lalcjyu75ocmohoftonv2f7druceqtqrlvypvmeaxksdoxdp3wotpuesa6tq';
const ONESIGNAL_APP_ID = '4587d615-18e4-43f0-84c3-ac7e51feaff6';
const APP_URL = 'https://verniktin-del.github.io';

// Helper function to send OneSignal notification
async function sendOneSignalNotification(title, message) {
  try {
    const notification = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'], // Send to all subscribed users
      headings: { en: title },
      contents: { en: message },
      url: APP_URL,
      chrome_web_icon: `${APP_URL}/assets/icon-192.png`,
      chrome_web_badge: `${APP_URL}/assets/icon-192.png`,
    };

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      notification,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
        }
      }
    );

    console.log('OneSignal notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('OneSignal API error:', error.response?.data || error.message);
    throw error;
  }
}

// Listen for new reservations and send notifications
exports.onReservationCreated = onDocumentCreated('reservations/{reservationId}', async (event) => {
  try {
    const reservation = event.data.data();
    const name = reservation.name || 'Netko';
    const teren = reservation.teren || 'teren';
    
    const timestamp = reservation.timestamp;
    let dateStr = 'uskoro';
    let timeStr = '';
    
    if (timestamp && timestamp.toDate) {
      const date = timestamp.toDate();
      dateStr = date.toLocaleDateString('hr-HR');
      timeStr = date.toLocaleTimeString('hr-HR', {hour: '2-digit', minute: '2-digit'});
    }
    
    const message = `${name} je rezervirao teren ${teren} za ${dateStr} u ${timeStr}`;
    
    await sendOneSignalNotification(
      'Hoops - Nova Rezervacija 📅',
      message
    );
    
    console.log('Reservation notification sent:', message);
    return null;
  } catch (error) {
    console.error('Error sending reservation notification:', error);
    return null;
  }
});

// Listen for new 1v1 games
exports.on1v1GameCreated = onDocumentCreated('games_1v1/{gameId}', async (event) => {
  try {
    const game = event.data.data();
    const team1 = game.team1Display || game.team1 || 'Team 1';
    const team2 = game.team2Display || game.team2 || 'Team 2';
    const score1 = game.score1 || 0;
    const score2 = game.score2 || 0;
    
    const message = `Nova 1v1 igra: ${team1} ${score1} - ${score2} ${team2}`;
    
    await sendOneSignalNotification(
      'Hoops - Nova 1v1 Igra 🏀',
      message
    );
    
    console.log('1v1 game notification sent:', message);
    return null;
  } catch (error) {
    console.error('Error sending 1v1 game notification:', error);
    return null;
  }
});

// Listen for new 2v2 games
exports.on2v2GameCreated = onDocumentCreated('games_2v2/{gameId}', async (event) => {
  try {
    const game = event.data.data();
    const team1 = game.team1Display || 'Team 1';
    const team2 = game.team2Display || 'Team 2';
    const score1 = game.score1 || 0;
    const score2 = game.score2 || 0;
    
    const message = `Nova 2v2 igra: ${team1} ${score1} - ${score2} ${team2}`;
    
    await sendOneSignalNotification(
      'Hoops - Nova 2v2 Igra 👥',
      message
    );
    
    console.log('2v2 game notification sent:', message);
    return null;
  } catch (error) {
    console.error('Error sending 2v2 game notification:', error);
    return null;
  }
});

// Listen for new 3v3 games
exports.on3v3GameCreated = onDocumentCreated('games_3v3/{gameId}', async (event) => {
  try {
    const game = event.data.data();
    const team1 = game.team1Display || 'Team 1';
    const team2 = game.team2Display || 'Team 2';
    const score1 = game.score1 || 0;
    const score2 = game.score2 || 0;
    
    const message = `Nova 3v3 igra: ${team1} ${score1} - ${score2} ${team2}`;
    
    await sendOneSignalNotification(
      'Hoops - Nova 3v3 Igra 💪',
      message
    );
    
    console.log('3v3 game notification sent:', message);
    return null;
  } catch (error) {
    console.error('Error sending 3v3 game notification:', error);
    return null;
  }
});

// HTTP function to manually send test notifications
exports.sendTestNotification = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
  try {
    await sendOneSignalNotification(
      'Test Notification 🧪',
      'This is a test notification from Hoops! If you see this, notifications are working! 🎉'
    );
    res.json({ 
      success: true, 
      message: 'Test notification sent successfully!',
      info: 'Check your devices - all subscribed users should receive this notification.'
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data
    });
  }
});