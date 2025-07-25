const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, PointsTransaction } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's points balance and transactions
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(req.user.id, {
      attributes: ['points', 'level']
    });
    
    const transactions = await PointsTransaction.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        as: 'relatedUser',
        attributes: ['id', 'username', 'display_name', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      balance: user.points,
      level: user.level,
      transactions,
      has_more: transactions.length === limit
    });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send points to another user
router.post('/send', auth, [
  body('recipient_id').isInt(),
  body('amount').isInt({ min: 1, max: 10000 }),
  body('message').optional().isLength({ max: 200 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipient_id, amount, message } = req.body;

    if (recipient_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot send points to yourself' });
    }

    const sender = await User.findByPk(req.user.id);
    const recipient = await User.findByPk(recipient_id);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (sender.points < amount) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Deduct points from sender
    sender.points -= amount;
    await sender.save();

    // Add points to recipient
    await recipient.addPoints(amount, `Points received from ${sender.username}`, sender.id);

    // Create transaction records
    const senderTransaction = await PointsTransaction.create({
      user_id: sender.id,
      amount: -amount,
      type: 'sent',
      reason: message || `Points sent to ${recipient.username}`,
      related_user_id: recipient.id,
      balance: sender.points
    });

    const recipientTransaction = await PointsTransaction.create({
      user_id: recipient.id,
      amount: amount,
      type: 'received',
      reason: message || `Points received from ${sender.username}`,
      related_user_id: sender.id,
      balance: recipient.points
    });

    res.json({
      message: 'Points sent successfully',
      new_balance: sender.points,
      transaction: senderTransaction
    });
  } catch (error) {
    console.error('Send points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get points leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const timeframe = req.query.timeframe || 'all'; // all, week, month

    let users;
    if (timeframe === 'all') {
      users = await User.findAll({
        where: { is_active: true },
        attributes: ['id', 'username', 'display_name', 'avatar', 'points', 'level', 'is_verified'],
        order: [['points', 'DESC']],
        limit
      });
    } else {
      // For weekly/monthly, aggregate points earned in timeframe
      const dateFilter = timeframe === 'week' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const results = await PointsTransaction.findAll({
        where: {
          type: 'earned',
          created_at: { [require('sequelize').Op.gte]: dateFilter }
        },
        attributes: [
          'user_id',
          [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total_points']
        ],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'display_name', 'avatar', 'level', 'is_verified']
        }],
        group: ['user_id'],
        order: [[require('sequelize').literal('total_points'), 'DESC']],
        limit
      });

      users = results.map(result => ({
        ...result.user.toJSON(),
        points: parseInt(result.dataValues.total_points)
      }));
    }

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      is_verified: user.is_verified
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get points earning opportunities
router.get('/opportunities', auth, async (req, res) => {
  try {
    const opportunities = [
      {
        id: 'upload_video',
        title: 'Upload Video',
        description: 'Earn 10 points for each video upload',
        points: 10,
        icon: '📹',
        category: 'content'
      },
      {
        id: 'get_like',
        title: 'Get Video Liked',
        description: 'Earn 1 point for each like on your videos',
        points: 1,
        icon: '❤️',
        category: 'engagement'
      },
      {
        id: 'get_comment',
        title: 'Get Video Comment',
        description: 'Earn 2 points for each comment on your videos',
        points: 2,
        icon: '💬',
        category: 'engagement'
      },
      {
        id: 'get_share',
        title: 'Get Video Shared',
        description: 'Earn 5 points for each share of your videos',
        points: 5,
        icon: '🔄',
        category: 'engagement'
      },
      {
        id: 'get_follower',
        title: 'Gain Follower',
        description: 'Earn 10 points for each new follower',
        points: 10,
        icon: '👥',
        category: 'growth'
      },
      {
        id: 'daily_login',
        title: 'Daily Login',
        description: 'Earn 5 points for logging in daily',
        points: 5,
        icon: '📅',
        category: 'activity'
      },
      {
        id: 'complete_profile',
        title: 'Complete Profile',
        description: 'Earn 50 points for completing your profile',
        points: 50,
        icon: '✅',
        category: 'profile'
      }
    ];

    res.json({ opportunities });
  } catch (error) {
    console.error('Opportunities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's points statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get total points earned and spent
    const stats = await PointsTransaction.findAll({
      where: { user_id: userId },
      attributes: [
        'type',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['type']
    });

    // Get points earned in last 30 days
    const recentEarnings = await PointsTransaction.findAll({
      where: {
        user_id: userId,
        type: 'earned',
        created_at: { [require('sequelize').Op.gte]: thirtyDaysAgo }
      },
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'date'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'points']
      ],
      group: [require('sequelize').fn('DATE', require('sequelize').col('created_at'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'ASC']]
    });

    // Get breakdown by reason
    const breakdown = await PointsTransaction.findAll({
      where: { user_id: userId, type: 'earned' },
      attributes: [
        'reason',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['reason'],
      order: [[require('sequelize').literal('total'), 'DESC']]
    });

    const user = await User.findByPk(userId, {
      attributes: ['points', 'level']
    });

    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat.type] = {
        total: parseInt(stat.dataValues.total),
        count: parseInt(stat.dataValues.count)
      };
    });

    res.json({
      current_balance: user.points,
      level: user.level,
      total_earned: statsMap.earned?.total || 0,
      total_spent: Math.abs(statsMap.spent?.total || 0),
      total_sent: Math.abs(statsMap.sent?.total || 0),
      total_received: statsMap.received?.total || 0,
      recent_earnings: recentEarnings.map(earning => ({
        date: earning.dataValues.date,
        points: parseInt(earning.dataValues.points)
      })),
      breakdown: breakdown.map(item => ({
        reason: item.reason,
        total: parseInt(item.dataValues.total),
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('Points stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;