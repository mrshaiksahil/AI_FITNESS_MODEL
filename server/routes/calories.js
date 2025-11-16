const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { exercise, calories } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { totalCalories: calories } },
      { new: true }
    );
    res.json({ totalCalories: user.totalCalories });
  } catch (error) {
    console.error('Add calories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/total', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ totalCalories: user.totalCalories });
  } catch (error) {
    console.error('Get total calories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
