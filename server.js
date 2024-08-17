const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors'); // Import the cors package

// Parse the JSON string from the environment variable
const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!serviceAccountKey) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const app = express();
// Use CORS middleware to enable CORS
app.use(cors());
app.use(bodyParser.json());

app.post('/send-notification', async (req, res) => {
  const { token, message } = req.body;

  // Log the received data to check its type
  console.log('Received token:', token);
  console.log('Received message:', message);
  console.log('Type of message:', typeof message);

  // Ensure the message is a string and not undefined
  if (typeof message !== 'string' || !message) {
    return res.status(400).send('Invalid message format');
  }

  const payload = {
    notification: {
      title: 'New Message',
      body: message,
      icon: '/icon.png', // Specify your icon path
      sound: 'default',
    },
  };

  try {
    await admin.messaging().sendToDevice(token, payload);
    res.status(200).send('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Failed to send notification');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
