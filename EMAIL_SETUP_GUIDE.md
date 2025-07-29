# 📧 Email Configuration Setup Guide

## Overview
Your school management system uses email for:
- Student registration verification
- Password reset functionality
- System notifications
- Announcements

## Step-by-Step Setup

### 1. Create `.env` file in the `backend` directory

Create a file named `.env` in your `backend` folder with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/school_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Hugging Face API (for Ask Dave chatbot)
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
```

### 2. Email Provider Options

#### Option A: Gmail (Recommended for Development)

1. **Use your Gmail account:**
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_app_password`

2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password

3. **Example:**
   ```env
   EMAIL_USER=mycollege@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop
   ```

#### Option B: Outlook/Hotmail

1. **Use your Outlook account:**
   - `EMAIL_USER=your_email@outlook.com`
   - `EMAIL_PASS=your_app_password`

2. **Generate App Password:**
   - Go to [Microsoft Account Security](https://account.microsoft.com/security)
   - Advanced security options → App passwords
   - Generate new app password

#### Option C: Custom SMTP Server

If you have your own email server:

```env
EMAIL_USER=admin@yourcollege.com
EMAIL_PASS=your_email_password
```

### 3. Security Best Practices

1. **Never commit `.env` to version control**
2. **Use strong, unique passwords**
3. **Enable 2-factor authentication on your email account**
4. **Use app passwords instead of your main password**

### 4. Testing Email Configuration

After setting up, test the email functionality:

1. Start your backend server: `cd backend && npm run dev`
2. Try registering a new student account
3. Check if verification email is received
4. Test password reset functionality

### 5. Troubleshooting

#### Common Issues:

1. **"Invalid credentials" error:**
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure no extra spaces in password

2. **"Less secure app access" error:**
   - Use app passwords instead of regular password
   - Enable 2-factor authentication

3. **"Connection timeout" error:**
   - Check internet connection
   - Verify email provider settings
   - Try different email provider

### 6. Production Considerations

For production deployment:

1. **Use dedicated email service:**
   - SendGrid
   - Mailgun
   - Amazon SES
   - Resend

2. **Environment-specific configurations:**
   ```env
   # Development
   EMAIL_USER=dev@yourcollege.com
   
   # Production
   EMAIL_USER=admin@yourcollege.com
   ```

### 7. Example Complete Setup

```env
# Database
MONGO_URI=mongodb://localhost:27017/school_management

# JWT (generate a random 32+ character string)
JWT_SECRET=my_super_secret_jwt_key_for_school_management_2024

# Email (Gmail example)
EMAIL_USER=kandara.technical@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop

# Server
PORT=5000
NODE_ENV=development

# Optional: Hugging Face API
HUGGING_FACE_API_KEY=hf_your_api_key_here
```

## Next Steps

1. Create the `.env` file with your email credentials
2. Restart your backend server
3. Test email functionality by registering a new user
4. Check your email for verification messages

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your email credentials
3. Test with a different email provider
4. Ensure your email account allows SMTP access 