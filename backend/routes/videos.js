const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { Video, User, VideoLike, VideoComment, VideoShare } = require('../models');
const auth = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');
const router = express.Router();

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Get feed videos (infinite scroll)
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const videos = await Video.findAll({
      where: { 
        is_active: true,
        privacy: ['public', 'followers']
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'display_name', 'avatar', 'is_verified']
        },
        {
          model: VideoLike,
          as: 'likes',
          attributes: ['user_id']
        },
        {
          model: VideoComment,
          as: 'comments',
          attributes: ['id']
        },
        {
          model: VideoShare,
          as: 'shares',
          attributes: ['id']
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    // Add interaction status for current user
    const videosWithStatus = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      hashtags: video.hashtags,
      music: video.music,
      views: video.views,
      location: video.location,
      created_at: video.created_at,
      user: video.user,
      is_liked: video.likes.some(like => like.user_id === req.user.id),
      like_count: video.likes.length,
      comment_count: video.comments.length,
      share_count: video.shares.length
    }));

    res.json({
      videos: videosWithStatus,
      has_more: videos.length === limit
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload video
router.post('/upload', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 500 }).trim(),
  body('hashtags').optional().isArray(),
  body('privacy').optional().isIn(['public', 'followers', 'private'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ message: 'Video and thumbnail are required' });
    }

    const { title, description, hashtags, privacy, music, location } = req.body;

    // Upload video and thumbnail to Cloudinary
    const videoUpload = await uploadToCloudinary(req.files.video[0].buffer, 'video');
    const thumbnailUpload = await uploadToCloudinary(req.files.thumbnail[0].buffer, 'image');

    // Create video record
    const video = await Video.create({
      user_id: req.user.id,
      title,
      description,
      video_url: videoUpload.secure_url,
      thumbnail_url: thumbnailUpload.secure_url,
      duration: videoUpload.duration || 30, // Get from video metadata
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      music: music ? JSON.parse(music) : null,
      privacy: privacy || 'public',
      location
    });

    // Award points for uploading
    const user = await User.findByPk(req.user.id);
    await user.addPoints(10, 'Video upload', null, video.id);

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video.id,
        title: video.title,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike video
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const existingLike = await VideoLike.findOne({
      where: {
        user_id: req.user.id,
        video_id: req.params.id
      }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
    } else {
      // Like
      await VideoLike.create({
        user_id: req.user.id,
        video_id: req.params.id
      });
      
      // Award points to video owner
      if (video.user_id !== req.user.id) {
        const videoOwner = await User.findByPk(video.user_id);
        await videoOwner.addPoints(1, 'Video liked', req.user.id, video.id);
      }
    }

    const likeCount = await VideoLike.count({ where: { video_id: req.params.id } });

    res.json({
      message: existingLike ? 'Video unliked' : 'Video liked',
      like_count: likeCount,
      is_liked: !existingLike
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, [
  body('text').isLength({ min: 1, max: 200 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comment = await VideoComment.create({
      user_id: req.user.id,
      video_id: req.params.id,
      text: req.body.text
    });

    // Award points to video owner
    if (video.user_id !== req.user.id) {
      const videoOwner = await User.findByPk(video.user_id);
      await videoOwner.addPoints(2, 'Video commented', req.user.id, video.id);
    }

    // Get comment with user info
    const commentWithUser = await VideoComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'display_name', 'avatar']
      }]
    });

    res.status(201).json({
      message: 'Comment added',
      comment: commentWithUser
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share video
router.post('/:id/share', auth, [
  body('platform').isIn(['internal', 'whatsapp', 'facebook', 'twitter', 'instagram'])
], async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await VideoShare.create({
      user_id: req.user.id,
      video_id: req.params.id,
      platform: req.body.platform
    });

    // Award points to video owner
    if (video.user_id !== req.user.id) {
      const videoOwner = await User.findByPk(video.user_id);
      await videoOwner.addPoints(5, 'Video shared', req.user.id, video.id);
    }

    const shareCount = await VideoShare.count({ where: { video_id: req.params.id } });

    res.json({
      message: 'Video shared',
      share_count: shareCount
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record video view
router.post('/:id/view', auth, async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const watchTime = req.body.watchTime || 0;
    await video.addView(req.user.id, watchTime);

    res.json({ message: 'View recorded' });
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get video comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const comments = await VideoComment.findAll({
      where: { 
        video_id: req.params.id,
        is_deleted: false
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'display_name', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      comments,
      has_more: comments.length === limit
    });
  } catch (error) {
    console.error('Comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search videos
router.get('/search', auth, async (req, res) => {
  try {
    const { q, hashtag, user } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = { is_active: true, privacy: 'public' };
    let includeClause = [{
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'display_name', 'avatar', 'is_verified']
    }];

    if (q) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.like]: `%${q}%` } },
        { description: { [require('sequelize').Op.like]: `%${q}%` } }
      ];
    }

    if (hashtag) {
      whereClause.hashtags = { [require('sequelize').Op.contains]: [hashtag.toLowerCase()] };
    }

    if (user) {
      includeClause[0].where = { username: user };
    }

    const videos = await Video.findAll({
      where: whereClause,
      include: includeClause,
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      videos,
      has_more: videos.length === limit
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;