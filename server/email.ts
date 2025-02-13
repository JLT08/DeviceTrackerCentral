import nodemailer from 'nodemailer';
import { User, Device } from "@shared/schema";

// Initialize the email transporter with Gmail SMTP using less secure app access
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'johnlennarttimbal24@gmail.com', // Your Gmail address
    pass: process.env.GMAIL_PASSWORD // Regular Gmail password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection
transporter.verify((error) => {
  if (error) {
    console.error('Email configuration error:', error);
    console.log('Note: Make sure to enable "Less secure app access" in Gmail settings');
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

export class EmailService {
  static async sendDeviceStatusNotification(
    user: User,
    device: Device,
    isOnline: boolean
  ) {
    if (!user.notificationsEnabled) return;

    const subject = `Device Status Change: ${device.name}`;
    const status = isOnline ? "Online" : "Offline";
    const html = `
      <h2>Device Status Update</h2>
      <p>Device: ${device.name}</p>
      <p>Status: <strong>${status}</strong></p>
      <p>IP Address: ${device.ipAddress}</p>
      <p>Last Seen: ${device.lastSeen?.toLocaleString()}</p>
      <hr>
      <p><small>You can disable these notifications in your account settings.</small></p>
    `;

    try {
      await transporter.sendMail({
        from: 'johnlennarttimbal24@gmail.com', // Your Gmail address
        to: user.email,
        subject,
        html,
      });

      console.log(`Email notification sent to ${user.email} for device ${device.name}`);
    } catch (error) {
      console.error("Failed to send email notification:", error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
  }
}