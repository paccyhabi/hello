const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoComment = sequelize.define('VideoComment', {
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
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'video_comments',
      key: 'id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  likes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'video_comments',
  indexes: [
    { fields: ['video_id', 'created_at'] },
    { fields: ['user_id'] },
    { fields: ['parent_id'] }
  ]
});

module.exports = VideoComment;