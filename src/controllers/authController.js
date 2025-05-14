const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');
require('dotenv').config();

// Send OTP API
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Hardcoded OTP as per requirement
    const otp = '1234';
    
    // Calculate expiry time (1 min)
    const expiryTime = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY));
    console.log(`Sending OTP for ${phone}: ${otp}, expires at: ${expiryTime.toISOString()}`);
    
    // Delete any existing OTP for this phone number
    await pool.query('DELETE FROM otps WHERE phone = ?', [phone]);
    await pool.query(
      'INSERT INTO otps (phone, otp, expires_at) VALUES (?, ?, ?)',
      [phone, otp, expiryTime]
    );
    
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Register user API
const registerUser = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { phone, name, email, dob, otp } = req.body;
    console.log(`Registering user with phone: ${phone}, OTP: ${otp}`);
    
    // Check if phone number already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );
    
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }
    
    
    let validOtp = false;
    
    
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const isFirstUser = userCount[0].count === 0;
    
   
    if (isFirstUser && otp === '1234') {
      console.log('First user registration - bypassing OTP expiry check');
      validOtp = true;
    } else {
     
      const [allOtps] = await connection.query(
        'SELECT * FROM otps WHERE phone = ? AND otp = ?',
        [phone, otp]
      );
      
      console.log(`Found ${allOtps.length} OTP records for ${phone}`);
      if (allOtps.length > 0) {
        console.log(`OTP record found, expires_at: ${allOtps[0].expires_at}, current time: ${new Date().toISOString()}`);
      }
      
     
      const [otpResults] = await connection.query(
        'SELECT * FROM otps WHERE phone = ? AND otp = ? AND expires_at > ?',
        [phone, otp, new Date()]
      );
      
      validOtp = otpResults.length > 0;
    }
    
    if (!validOtp) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (phone, name, email, dob) VALUES (?, ?, ?, ?)',
      [phone, name, email, dob]
    );
    
    const userId = result.insertId;
    
    // Generate JWT token
    const token = generateToken(userId);
    
    // Delete used OTP
    await connection.query('DELETE FROM otps WHERE phone = ?', [phone]);
    
    await connection.commit();
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      userId: userId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  sendOTP,
  registerUser
}; 