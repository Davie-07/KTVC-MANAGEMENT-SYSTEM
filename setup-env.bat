@echo off
echo ========================================
echo    School Management System Setup
echo ========================================
echo.

echo Creating .env file in backend directory...
echo.

cd backend

echo # Database Configuration > .env
echo MONGO_URI=mongodb://localhost:27017/school_management >> .env
echo. >> .env
echo # JWT Configuration >> .env
echo JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random >> .env
echo. >> .env
echo # Email Configuration >> .env
echo EMAIL_USER=your_email@gmail.com >> .env
echo EMAIL_PASS=your_app_password_here >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # Hugging Face API (for Ask Dave chatbot) >> .env
echo HUGGING_FACE_API_KEY=your_hugging_face_api_key_here >> .env

echo ✅ .env file created successfully!
echo.
echo 📝 Next steps:
echo 1. Edit the .env file with your actual credentials
echo 2. For Gmail: Enable 2FA and generate an App Password
echo 3. Replace EMAIL_USER with your email address
echo 4. Replace EMAIL_PASS with your app password
echo 5. Generate a random JWT_SECRET
echo.
echo 📖 See EMAIL_SETUP_GUIDE.md for detailed instructions
echo.
pause 