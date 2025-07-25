const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { sendSMS, sendEmail } = require('../utils/notifications');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).trim().isAlphanumeric(),
  body('display_name').isLength({ min: 1, max: 50 }).trim(),
  body('password').isLength({ min: 6 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, phone, password, display_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      phone,
      password,
      display_name
    });

    // Generate token
    const token = generateToken(user.id);

    // Send welcome notification
    if (email) {
      await sendEmail(email, 'Welcome to Hello!', 'Welcome to our community!');
    } else if (phone) {
      await sendSMS(phone, 'Welcome to Hello! Start creating amazing videos.');
    }

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('identifier').notEmpty().trim(), // email, phone, or username
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // Find user by email, phone, or username
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: identifier },
          { phone: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last seen
    user.last_seen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    // Get follower and following counts
    const { Follow } = require('../models');
    const followerCount = await Follow.count({ where: { following_id: user.id } });
    const followingCount = await Follow.count({ where: { follower_id: user.id } });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        follower_count: followerCount,
        following_count: followingCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get follower and following counts
    const { Follow } = require('../models');
    const followerCount = await Follow.count({ where: { following_id: user.id } });
    const followingCount = await Follow.count({ where: { follower_id: user.id } });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        follower_count: followerCount,
        following_count: followingCount
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('identifier').notEmpty().trim()
], async (req, res) => {
  try {
    const { identifier } = req.body;

    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token (in production, store this in database with expiry)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Send reset link/code
    if (user.email) {
      await sendEmail(
        user.email,
        'Password Reset',
        `Reset your password: ${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
      );
    } else if (user.phone) {
      // In production, send a shorter code via SMS
      await sendSMS(user.phone, `Your password reset code: ${resetToken.slice(-6)}`);
    }

    res.json({ message: 'Password reset instructions sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;