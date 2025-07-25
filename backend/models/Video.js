const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  video_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      max: 60 // 60 seconds max
    }
  },
  hashtags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  music: {
    type: DataTypes.JSON,
    allowNull: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  view_history: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  privacy: {
    type: DataTypes.ENUM('public', 'followers', 'private'),
    defaultValue: 'public'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  report_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'videos',
  indexes: [
    { fields: ['user_id', 'created_at'] },
    { fields: ['created_at'] },
    { fields: ['views'] },
    { fields: ['is_active'] }
  ]
});

// Instance methods
Video.prototype.addView = async function(userId, watchTime = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const viewHistory = this.view_history || [];
  const existingView = viewHistory.find(view => 
    view.user_id === userId && 
    new Date(view.viewed_at) >= today
  );
  
  if (!existingView) {
    this.views += 1;
    viewHistory.push({
      user_id: userId,
      viewed_at: new Date(),
      watch_time: watchTime
    });
    this.view_history = viewHistory;
    await this.save();
  }
};

module.exports = Video;