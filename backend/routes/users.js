const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Video, Follow, VideoLike, VideoComment } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's videos
    const videos = await Video.findAll({
      where: { 
        user_id: user.id, 
        is_active: true,
        privacy: ['public', 'followers']
      },
      attributes: ['id', 'thumbnail_url', 'views', 'created_at'],
      include: [
        {
          model: VideoLike,
          as: 'likes',
          attributes: ['id']
        },
        {
          model: VideoComment,
          as: 'comments',
          attributes: ['id']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    // Get follower and following counts
    const followerCount = await Follow.count({ where: { following_id: user.id } });
    const followingCount = await Follow.count({ where: { follower_id: user.id } });

    // Check if current user follows this user
    const isFollowing = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: user.id
      }
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        bio: user.bio,
        follower_count: followerCount,
        following_count: followingCount,
        points: user.points,
        level: user.level,
        achievements: user.achievements,
        is_verified: user.is_verified,
        is_following: !!isFollowing
      },
      videos: videos.map(video => ({
        id: video.id,
        thumbnail_url: video.thumbnail_url,
        views: video.views,
        like_count: video.likes.length,
        comment_count: video.comments.length,
        created_at: video.created_at
      }))
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findByPk(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: req.params.id
      }
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
    } else {
      // Follow
      await Follow.create({
        follower_id: req.user.id,
        following_id: req.params.id
      });
      
      // Award points to followed user
      await userToFollow.addPoints(10, 'New follower', req.user.id);
    }

    const followerCount = await Follow.count({ where: { following_id: req.params.id } });

    res.json({
      message: existingFollow ? 'Unfollowed successfully' : 'Followed successfully',
      is_following: !existingFollow,
      follower_count: followerCount
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, [
  body('display_name').optional().isLength({ min: 1, max: 50 }).trim(),
  body('bio').optional().isLength({ max: 200 }).trim(),
  body('avatar').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { display_name, bio, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    const updateData = {};
    if (display_name) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    await user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/users', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = await User.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { username: { [require('sequelize').Op.like]: `%${q}%` } },
          { display_name: { [require('sequelize').Op.like]: `%${q}%` } }
        ],
        is_active: true
      },
      attributes: ['id', 'username', 'display_name', 'avatar', 'is_verified', 'points', 'level'],
      offset,
      limit
    });

    // Get follower counts and following status
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const followerCount = await Follow.count({ where: { following_id: user.id } });
      const isFollowing = await Follow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: user.id
        }
      });

      return {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        is_verified: user.is_verified,
        follower_count: followerCount,
        points: user.points,
        level: user.level,
        is_following: !!isFollowing
      };
    }));

    res.json({
      users: usersWithStats,
      has_more: users.length === limit
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending users
router.get('/trending/users', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get users with most followers
    const users = await User.findAll({
      where: { is_active: true },
      attributes: ['id', 'username', 'display_name', 'avatar', 'is_verified', 'points', 'level'],
      limit
    });

    // Get follower counts and following status
    const trendingUsers = await Promise.all(users.map(async (user) => {
      const followerCount = await Follow.count({ where: { following_id: user.id } });
      const isFollowing = await Follow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: user.id
        }
      });

      return {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        is_verified: user.is_verified,
        follower_count: followerCount,
        points: user.points,
        level: user.level,
        is_following: !!isFollowing
      };
    }));

    // Sort by follower count
    trendingUsers.sort((a, b) => b.follower_count - a.follower_count);

    res.json({ users: trendingUsers });
  } catch (error) {
    console.error('Trending users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const follows = await Follow.findAll({
      where: { following_id: req.params.id },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'username', 'display_name', 'avatar', 'is_verified']
      }],
      offset,
      limit
    });

    const followers = follows.map(follow => follow.follower);

    res.json({
      followers,
      has_more: followers.length === limit
    });
  } catch (error) {
    console.error('Followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:id/following', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const follows = await Follow.findAll({
      where: { follower_id: req.params.id },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'username', 'display_name', 'avatar', 'is_verified']
      }],
      offset,
      limit
    });

    const following = follows.map(follow => follow.following);

    res.json({
      following,
      has_more: following.length === limit
    });
  } catch (error) {
    console.error('Following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;