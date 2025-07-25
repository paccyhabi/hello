const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoShare = sequelize.define('VideoShare', {
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
  },
  platform: {
    type: DataTypes.ENUM('internal', 'whatsapp', 'facebook', 'twitter', 'instagram'),
    allowNull: false
  }
}, {
  tableName: 'video_shares',
  indexes: [
    { fields: ['video_id', 'created_at'] },
    { fields: ['user_id'] },
    { fields: ['platform'] }
  ]
});

module.exports = VideoShare;