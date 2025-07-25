const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('private', 'group'),
    defaultValue: 'private'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  last_message_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  last_activity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      mute_notifications: [],
      allow_invites: true
    }
  }
}, {
  tableName: 'chats',
  indexes: [
    { fields: ['created_by'] },
    { fields: ['last_activity'] },
    { fields: ['type'] }
  ]
});

module.exports = Chat;