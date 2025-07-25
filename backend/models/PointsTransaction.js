const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsTransaction = sequelize.define('PointsTransaction', {
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
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('earned', 'spent', 'purchased', 'withdrawn', 'received', 'sent'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  related_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  related_video_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'videos',
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'completed'
  }
}, {
  tableName: 'points_transactions',
  indexes: [
    { fields: ['user_id', 'created_at'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['related_user_id'] }
  ]
});

module.exports = PointsTransaction;