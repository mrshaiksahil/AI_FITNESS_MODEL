const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${req.user._id}-${unique}${ext}`);
  }
});
const uploadAvatar = multer({ storage: avatarStorage });

router.get('/', auth, async (req, res) => {
  try {
    res.json({
      name: req.user.name,
      email: req.user.email,
      organization: req.user.organization,
      age: req.user.age,
      weight: req.user.weight,
      height: req.user.height,
      profilePic: req.user.profilePic,
      bmr: req.user.bmr
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'organization', 'age', 'weight', 'height', 'profilePic'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/bmr', auth, async (req, res) => {
  try {
    const { bmr } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { bmr }, { new: true });
    res.json({ bmr: user.bmr });
  } catch (error) {
    console.error('Update BMR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const publicPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: publicPath },
      { new: true }
    );
    res.json({ profilePic: user.profilePic, user });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
