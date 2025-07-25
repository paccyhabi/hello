const jwt = require('jsonwebtoken');
const { User, Chat, Message, ChatParticipant } = require('../models');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.username} connected`);

    // Update user's online status
    User.update({ last_seen: new Date() }, { where: { id: socket.userId } });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join user's chat rooms
    socket.on('join_chats', async () => {
      try {
        const chats = await Chat.findAll({
          include: [{
            model: User,
            as: 'participants',
            where: { id: socket.userId },
            through: { where: { is_active: true } }
          }],
          where: { is_active: true }
        });

        chats.forEach(chat => {
          socket.join(`chat_${chat.id}`);
        });
      } catch (error) {
        console.error('Join chats error:', error);
      }
    });

    // Handle joining specific chat
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    // Handle leaving specific chat
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type, mediaUrl } = data;

        // Verify user is participant
        const participant = await ChatParticipant.findOne({
          where: {
            chat_id: chatId,
            user_id: socket.userId,
            is_active: true
          }
        });

        if (!participant) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Create message
        const message = await Message.create({
          chat_id: chatId,
          sender_id: socket.userId,
          content,
          type: type || 'text',
          media_url: mediaUrl
        });

        // Update chat last activity
        await Chat.update(
          { last_activity: new Date() },
          { where: { id: chatId } }
        );

        // Get message with sender info
        const messageWithSender = await Message.findByPk(message.id, {
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'display_name', 'avatar']
          }]
        });

        // Emit to all chat participants
        io.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: messageWithSender
        });

        // TODO: Send push notifications to offline users
        
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
        chatId,
        userId: socket.userId
      });
    });

    // Handle video call signaling
    socket.on('call_user', (data) => {
      const { targetUserId, offer, callType } = data;
      socket.to(`user_${targetUserId}`).emit('incoming_call', {
        callerId: socket.userId,
        callerName: socket.username,
        offer,
        callType
      });
    });

    socket.on('answer_call', (data) => {
      const { callerId, answer } = data;
      socket.to(`user_${callerId}`).emit('call_answered', {
        answer,
        answeredBy: socket.userId
      });
    });

    socket.on('reject_call', (data) => {
      const { callerId } = data;
      socket.to(`user_${callerId}`).emit('call_rejected', {
        rejectedBy: socket.userId
      });
    });

    socket.on('end_call', (data) => {
      const { targetUserId } = data;
      socket.to(`user_${targetUserId}`).emit('call_ended', {
        endedBy: socket.userId
      });
    });

    // Handle ICE candidates for WebRTC
    socket.on('ice_candidate', (data) => {
      const { targetUserId, candidate } = data;
      socket.to(`user_${targetUserId}`).emit('ice_candidate', {
        candidate,
        from: socket.userId
      });
    });

    // Handle live streaming
    socket.on('start_live_stream', (data) => {
      const { streamTitle, streamDescription } = data;
      
      // Create live stream room
      const streamRoom = `live_${socket.userId}`;
      socket.join(streamRoom);
      
      // Notify followers about live stream
      socket.broadcast.emit('live_stream_started', {
        streamerId: socket.userId,
        streamerName: socket.username,
        streamTitle,
        streamDescription,
        streamRoom
      });
    });

    socket.on('join_live_stream', (streamRoom) => {
      socket.join(streamRoom);
      socket.to(streamRoom).emit('viewer_joined', {
        viewerId: socket.userId,
        viewerName: socket.username
      });
    });

    socket.on('leave_live_stream', (streamRoom) => {
      socket.leave(streamRoom);
      socket.to(streamRoom).emit('viewer_left', {
        viewerId: socket.userId
      });
    });

    socket.on('live_stream_comment', (data) => {
      const { streamRoom, comment } = data;
      io.to(streamRoom).emit('live_comment', {
        userId: socket.userId,
        username: socket.username,
        comment,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`);
      
      // Update user's last seen
      User.update({ last_seen: new Date() }, { where: { id: socket.userId } });
      
      // Notify chat participants that user is offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.username
      });
    });
  });
};

module.exports = socketHandler;