require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function testEmail() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    
    // Try sending a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from KTVC System',
      html: '<h1>Email Test</h1><p>If you receive this, your email configuration is working!</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if 2FA is enabled on your Gmail account');
    console.log('2. Verify the app password is correct');
    console.log('3. Make sure there are no extra spaces in .env file');
  }
}

testEmail(); 