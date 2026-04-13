const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = users[0];
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (user.status !== 'verified') {
            return res.status(403).json({ error: 'Account is not verified. Please register or contact support.' });
        }

        // Determine redirect based on role
        let redirectUrl = '/patient-portal'; // Fallback
        if (user.role === 'admin') redirectUrl = '/staff-portal';
        if (user.role === 'clinician') redirectUrl = '/clinician';

        // BYPASS OTP: Immediate login
        return res.json({ 
            success: true, 
            redirectUrl: redirectUrl,
            user: { role: user.role, name: user.name, id: user.id }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

router.post('/verify', async (req, res) => {
    const { email, otp, internalRedirectData } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ error: 'Please provide email and verification code.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid user.' });
        }

        const user = users[0];

        if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
            return res.status(401).json({ error: 'Invalid or expired verification code.' });
        }

        // Clear OTP upon success
        await pool.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?', [user.id]);

        return res.json({
            success: true,
            redirectUrl: internalRedirectData.redirectUrl,
            user: internalRedirectData.user
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Server error during verify.' });
    }
});

// Register new patient
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Immediate Verficaition 
        const [result] = await pool.query(
            'INSERT INTO users (email, password, role, name, status) VALUES (?, ?, ?, ?, ?)',
            [email, password, 'patient', name, 'verified']
        );

        res.json({ success: true, message: 'Account created successfully! You may now log in using your email and password.' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Verify Registration
router.post('/verify-registration', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP required.' });
    }
    
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        const user = users[0];
        if (user.status === 'verified') {
            return res.status(400).json({ error: 'User is already verified.' });
        }
        
        if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
            return res.status(401).json({ error: 'Invalid or expired OTP.' });
        }
        
        await pool.query("UPDATE users SET status = 'verified', otp = NULL, otp_expiry = NULL WHERE id = ?", [user.id]);
        
        res.json({ success: true, message: 'Account verified successfully. You may now log in.' });
    } catch (error) {
        console.error('Verify registration error:', error);
        res.status(500).json({ error: 'Server error during verification.' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.json({ success: true, message: 'If the email exists, an OTP has been sent.' });
        }
        
        const user = users[0];
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000);
        
        await pool.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, otpExpiry, user.id]);

        console.log(`\n=== FORGOT PASSWORD OTP DEV MODE ===`);
        console.log(`Email: ${email}`);
        console.log(`Your OTP: ${otp}`);
        console.log(`====================================\n`);
        
        console.log(`\n=== FORGOT PASSWORD OTP DEV MODE ===`);
        console.log(`Email: ${email}`);
        console.log(`Your OTP: ${otp}`);
        console.log(`====================================\n`);
        
        // SMTP sending removed
        res.json({ success: true, message: 'If the email exists, an OTP has been sent. Check your terminal!' });
    } catch (error) {
         console.error('Forgot password error:', error);
         res.status(500).json({ error: 'Server error.' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Invalid operation.' });
        }
        
        const user = users[0];
        if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
            return res.status(401).json({ error: 'Invalid or expired OTP.' });
        }
        
        await pool.query('UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE id = ?', [newPassword, user.id]);
        
        res.json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
         console.error('Reset password error:', error);
         res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
