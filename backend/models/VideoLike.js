const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoLike = sequelize.define('VideoLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  video_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'videos',
      key: 'id'
    }
  }
}, {
  tableName: 'video_likes',
  indexes: [
    { fields: ['user_id', 'video_id'], unique: true },
    { fields: ['video_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = VideoLike;