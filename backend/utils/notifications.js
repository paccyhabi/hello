const nodemailer = require('nodemailer');
const twilio = require('twilio');


// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// // SMS configuration
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@hello-app.com',
      to,
      subject,
      text,
      html: html || text
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// const sendSMS = async (to, message) => {
//   try {
//     const result = await twilioClient.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to
//     });

//     console.log('SMS sent:', result.sid);
//     return result;
//   } catch (error) {
//     console.error('SMS error:', error);
//     throw error;
//   }
// };

const sendPushNotification = async (deviceTokens, title, body, data = {}) => {
  // Implement with Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)
  // This is a placeholder for push notification implementation
  
  try {
    // Example FCM implementation:
    /*
    const admin = require('firebase-admin');
    
    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens: deviceTokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Push notifications sent:', response.successCount);
    return response;
    */
    
    console.log('Push notification would be sent:', { title, body, deviceTokens });
  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  // sendSMS,
  sendPushNotification
};