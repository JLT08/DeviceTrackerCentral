import nodemailer from 'nodemailer';
import { User, Device } from "@shared/schema";

// Initialize the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'johnlennarttimbal24@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD // This needs to be an App Password, not your regular Gmail password
  }
});

// Test the connection
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
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
        from: process.env.GMAIL_USER || 'johnlennarttimbal24@gmail.com',
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