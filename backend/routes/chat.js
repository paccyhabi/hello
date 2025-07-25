const express = require('express');
const { body, validationResult } = require('express-validator');
const { Chat, Message, User, ChatParticipant } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          through: {
            where: { is_active: true }
          },
          attributes: ['id', 'username', 'display_name', 'avatar', 'last_seen']
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'display_name', 'avatar']
          }]
        }
      ],
      where: {
        '$participants.id$': req.user.id,
        is_active: true
      },
      order: [['last_activity', 'DESC']]
    });

    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
      const otherParticipants = chat.participants.filter(
        p => p.id !== req.user.id
      );
      
      // Get unread count
      const unreadCount = await Message.count({
        where: {
          chat_id: chat.id,
          sender_id: { [require('sequelize').Op.ne]: req.user.id },
          read_by: { [require('sequelize').Op.not]: { [require('sequelize').Op.contains]: [req.user.id] } }
        }
      });
      
      return {
        id: chat.id,
        type: chat.type,
        name: chat.type === 'group' ? chat.name : otherParticipants[0]?.display_name,
        avatar: chat.type === 'group' ? chat.avatar : otherParticipants[0]?.avatar,
        participants: otherParticipants,
        last_message: chat.messages.length > 0 ? {
          content: chat.messages[0].content,
          sender: chat.messages[0].sender,
          created_at: chat.messages[0].created_at,
          type: chat.messages[0].type
        } : null,
        unread_count: unreadCount,
        last_activity: chat.last_activity,
        is_online: chat.type === 'private' ? 
          (Date.now() - new Date(otherParticipants[0]?.last_seen).getTime() < 5 * 60 * 1000) : 
          false
      };
    }));

    res.json({ chats: chatsWithUnread });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get private chat
router.post('/private', auth, [
  body('user_id').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id } = req.body;

    if (user_id === req.user.id) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    // Check if user exists
    const otherUser = await User.findByPk(user_id);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      where: { type: 'private' },
      include: [{
        model: User,
        as: 'participants',
        where: { id: [req.user.id, user_id] },
        through: { where: { is_active: true } }
      }],
      having: require('sequelize').literal('COUNT(participants.id) = 2')
    });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        type: 'private',
        created_by: req.user.id
      });

      // Add participants
      await ChatParticipant.bulkCreate([
        { chat_id: chat.id, user_id: req.user.id },
        { chat_id: chat.id, user_id: user_id }
      ]);

      // Reload with participants
      chat = await Chat.findByPk(chat.id, {
        include: [{
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'display_name', 'avatar', 'last_seen']
        }]
      });
    }

    const otherParticipant = chat.participants.find(
      p => p.id !== req.user.id
    );

    res.json({
      chat: {
        id: chat.id,
        type: chat.type,
        name: otherParticipant.display_name,
        avatar: otherParticipant.avatar,
        participant: otherParticipant,
        messages: [],
        is_online: Date.now() - new Date(otherParticipant.last_seen).getTime() < 5 * 60 * 1000
      }
    });
  } catch (error) {
    console.error('Create private chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create group chat
router.post('/group', auth, [
  body('name').isLength({ min: 1, max: 50 }).trim(),
  body('participants').isArray({ min: 1 }),
  body('description').optional().isLength({ max: 200 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, participants, description, avatar } = req.body;

    // Validate participants
    const validParticipants = await User.findAll({
      where: {
        id: participants,
        is_active: true
      }
    });

    if (validParticipants.length !== participants.length) {
      return res.status(400).json({ message: 'Some participants are invalid' });
    }

    // Create chat
    const chat = await Chat.create({
      type: 'group',
      name,
      description,
      avatar,
      created_by: req.user.id
    });

    // Add participants (including creator)
    const allParticipants = [...new Set([req.user.id, ...participants])];
    const participantData = allParticipants.map(userId => ({
      chat_id: chat.id,
      user_id: userId,
      role: userId === req.user.id ? 'admin' : 'member'
    }));

    await ChatParticipant.bulkCreate(participantData);

    // Reload with participants
    const chatWithParticipants = await Chat.findByPk(chat.id, {
      include: [{
        model: User,
        as: 'participants',
        attributes: ['id', 'username', 'display_name', 'avatar']
      }]
    });

    res.status(201).json({
      message: 'Group created successfully',
      chat: {
        id: chatWithParticipants.id,
        type: chatWithParticipants.type,
        name: chatWithParticipants.name,
        description: chatWithParticipants.description,
        avatar: chatWithParticipants.avatar,
        participants: chatWithParticipants.participants,
        created_by: chatWithParticipants.created_by
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user is participant
    const participant = await ChatParticipant.findOne({
      where: {
        chat_id: req.params.chatId,
        user_id: req.user.id,
        is_active: true
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.findAll({
      where: { 
        chat_id: req.params.chatId,
        is_deleted: false
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'display_name', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      has_more: messages.length === limit
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:chatId/messages', auth, [
  body('content').isLength({ min: 1, max: 1000 }).trim(),
  body('type').optional().isIn(['text', 'image', 'video', 'audio', 'points', 'sticker'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, type, media_url, points_amount } = req.body;

    // Verify user is participant
    const participant = await ChatParticipant.findOne({
      where: {
        chat_id: req.params.chatId,
        user_id: req.user.id,
        is_active: true
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Handle points transfer
    if (type === 'points' && points_amount) {
      const sender = await User.findByPk(req.user.id);
      if (sender.points < points_amount) {
        return res.status(400).json({ message: 'Insufficient points' });
      }

      // Get chat to check if it's private
      const chat = await Chat.findByPk(req.params.chatId, {
        include: [{
          model: User,
          as: 'participants',
          through: { where: { is_active: true } }
        }]
      });

      // Deduct points from sender
      sender.points -= points_amount;
      await sender.save();

      // Add points to recipients (for private chat)
      if (chat.type === 'private') {
        const recipientId = chat.participants.find(
          p => p.id !== req.user.id
        ).id;
        const recipient = await User.findByPk(recipientId);
        await recipient.addPoints(points_amount, `Points received from ${sender.username}`, req.user.id);
      }
    }

    // Create message
    const message = await Message.create({
      chat_id: req.params.chatId,
      sender_id: req.user.id,
      content,
      type: type || 'text',
      media_url,
      points_amount
    });

    // Update chat last activity
    await Chat.update(
      { last_activity: new Date() },
      { where: { id: req.params.chatId } }
    );

    // Get message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'display_name', 'avatar']
      }]
    });

    res.status(201).json({
      message: 'Message sent',
      data: messageWithSender
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    // Verify user is participant
    const participant = await ChatParticipant.findOne({
      where: {
        chat_id: req.params.chatId,
        user_id: req.user.id,
        is_active: true
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Update all unread messages
    await Message.update(
      {
        read_by: require('sequelize').fn(
          'JSON_ARRAY_APPEND',
          require('sequelize').col('read_by'),
          '$',
          req.user.id
        )
      },
      {
        where: {
          chat_id: req.params.chatId,
          sender_id: { [require('sequelize').Op.ne]: req.user.id },
          read_by: { [require('sequelize').Op.not]: { [require('sequelize').Op.contains]: [req.user.id] } }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave group chat
router.post('/:chatId/leave', auth, async (req, res) => {
  try {
    const participant = await ChatParticipant.findOne({
      where: {
        chat_id: req.params.chatId,
        user_id: req.user.id,
        is_active: true
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    const chat = await Chat.findByPk(req.params.chatId);
    if (chat.type !== 'group') {
      return res.status(400).json({ message: 'Can only leave group chats' });
    }

    // Remove user from participants
    await participant.update({ is_active: false, left_at: new Date() });

    // If admin leaves, assign new admin
    if (participant.role === 'admin') {
      const newAdmin = await ChatParticipant.findOne({
        where: {
          chat_id: req.params.chatId,
          is_active: true,
          role: 'member'
        }
      });

      if (newAdmin) {
        await newAdmin.update({ role: 'admin' });
      }
    }

    // Check if any participants left
    const activeParticipants = await ChatParticipant.count({
      where: {
        chat_id: req.params.chatId,
        is_active: true
      }
    });

    // If no participants left, deactivate chat
    if (activeParticipants === 0) {
      await chat.update({ is_active: false });
    }

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;