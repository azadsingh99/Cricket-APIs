const express = require('express');
const router = express.Router();
const { sendOTP, registerUser } = require('../controllers/authController');
const { sendOtpValidator, registerValidator } = require('../middlewares/validators');


router.post('/send-otp', sendOtpValidator, sendOTP);
router.post('/register', registerValidator, registerUser);

module.exports = router; 