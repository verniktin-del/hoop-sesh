// Simple API endpoint to send push notifications
// This can be deployed to Vercel, Netlify, or any serverless platform

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Add your Firebase service account credentials here
      projectId: "hoops-165ec",
      clientEmail: "your-service-account@hoops-165ec.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
    })
  });
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, reservationId, type } = JSON.parse(event.body);
    
    // Get all users with FCM tokens
    const usersSnapshot = await admin.firestore().collection('users').get();
    const tokens = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken);
      }
    });
    
    if (tokens.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No FCM tokens found' })
      };
    }
    
    const notification = {
      notification: {
        title: type === 'game' ? 'Nova igra' : 'Nova rezervacija',
        body: message
      },
      data: {
        reservationId: reservationId || '',
        type: type || 'reservation'
      },
      tokens: tokens
    };
    
    const response = await admin.messaging().sendMulticast(notification);
    console.log('Successfully sent message:', response);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        sentCount: response.successCount,
        message: 'Notifications sent successfully' 
      })
    };
    
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notifications' })
    };
  }
};
