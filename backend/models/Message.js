const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chat_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chats',
      key: 'id'
    }
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000]
    }
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'points', 'sticker'),
    defaultValue: 'text'
  },
  media_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  points_amount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  read_by: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'messages',
  indexes: [
    { fields: ['chat_id', 'created_at'] },
    { fields: ['sender_id'] },
    { fields: ['type'] }
  ]
});

module.exports = Message;