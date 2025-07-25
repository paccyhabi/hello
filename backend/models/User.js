const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  display_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  level: {
    type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'),
    defaultValue: 'Bronze'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_seen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  device_tokens: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      privacy: {
        profile_visibility: 'public',
        allow_messages: 'everyone'
      },
      notifications: {
        likes: true,
        comments: true,
        follows: true,
        messages: true
      }
    }
  },
  achievements: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['points'] }
  ]
});

// Hash password before saving
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.updateLevel = function() {
  if (this.points >= 100000) this.level = 'Diamond';
  else if (this.points >= 50000) this.level = 'Platinum';
  else if (this.points >= 20000) this.level = 'Gold';
  else if (this.points >= 5000) this.level = 'Silver';
  else this.level = 'Bronze';
};

User.prototype.addPoints = async function(amount, reason, relatedUserId = null, relatedVideoId = null) {
  const PointsTransaction = require('./PointsTransaction');
  
  this.points += amount;
  this.updateLevel();
  await this.save();
  
  // Create transaction record
  await PointsTransaction.create({
    user_id: this.id,
    amount,
    type: 'earned',
    reason,
    related_user_id: relatedUserId,
    related_video_id: relatedVideoId,
    balance: this.points
  });
};

module.exports = User;