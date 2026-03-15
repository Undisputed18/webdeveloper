const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug: Check if Environment Variables are present
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing!');
} else {
  console.log('Environment variables loaded successfully.');
}

// Improved SMTP Configuration for Cloud Hosting
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps avoid SSL handshake issues on some cloud providers
  }
});

// Root route to verify server is alive
app.get('/', (req, res) => {
  res.send('Sydney Portfolio Backend is Running! Reach out at /send-email via POST.');
});

app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Missing required fields');
  }

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Portfolio Message from ${name}`,
    text: `You have a new message from your portfolio:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // FULL error logging for Render troubleshooting
      console.error('NODEMAILER ERROR:', error);
      return res.status(500).json({ 
        message: 'Error sending email', 
        error: error.message 
      });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).send('Email sent successfully');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
