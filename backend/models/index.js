const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Video = require('./Video');
const Chat = require('./Chat');
const Message = require('./Message');
const PointsTransaction = require('./PointsTransaction');
const VideoLike = require('./VideoLike');
const VideoComment = require('./VideoComment');
const VideoShare = require('./VideoShare');
const Follow = require('./Follow');
const ChatParticipant = require('./ChatParticipant');

// Define associations
User.hasMany(Video, { foreignKey: 'user_id', as: 'videos' });
Video.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(VideoLike, { foreignKey: 'user_id', as: 'likes' });
VideoLike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Video.hasMany(VideoLike, { foreignKey: 'video_id', as: 'likes' });
VideoLike.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

User.hasMany(VideoComment, { foreignKey: 'user_id', as: 'comments' });
VideoComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Video.hasMany(VideoComment, { foreignKey: 'video_id', as: 'comments' });
VideoComment.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

User.hasMany(VideoShare, { foreignKey: 'user_id', as: 'shares' });
VideoShare.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Video.hasMany(VideoShare, { foreignKey: 'video_id', as: 'shares' });
VideoShare.belongsTo(Video, { foreignKey: 'video_id', as: 'video' });

// Follow relationships
User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'follower_id',
  otherKey: 'following_id'
});

// Chat relationships
User.hasMany(Chat, { foreignKey: 'created_by', as: 'createdChats' });
Chat.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.belongsToMany(Chat, {
  through: ChatParticipant,
  as: 'chats',
  foreignKey: 'user_id',
  otherKey: 'chat_id'
});

Chat.belongsToMany(User, {
  through: ChatParticipant,
  as: 'participants',
  foreignKey: 'chat_id',
  otherKey: 'user_id'
});

Chat.hasMany(Message, { foreignKey: 'chat_id', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Points transactions
User.hasMany(PointsTransaction, { foreignKey: 'user_id', as: 'transactions' });
PointsTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(PointsTransaction, { foreignKey: 'related_user_id', as: 'relatedTransactions' });
PointsTransaction.belongsTo(User, { foreignKey: 'related_user_id', as: 'relatedUser' });

Video.hasMany(PointsTransaction, { foreignKey: 'related_video_id', as: 'transactions' });
PointsTransaction.belongsTo(Video, { foreignKey: 'related_video_id', as: 'relatedVideo' });

module.exports = {
  sequelize,
  User,
  Video,
  Chat,
  Message,
  PointsTransaction,
  VideoLike,
  VideoComment,
  VideoShare,
  Follow,
  ChatParticipant
};