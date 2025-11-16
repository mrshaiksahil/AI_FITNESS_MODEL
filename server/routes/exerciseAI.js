const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/analyze', auth, upload.single('file'), async (req, res) => {
  try {
    const { exercise } = req.body;

    // TODO: Integrate with your friend's ML model here
    // For now, return mock data
    const mockResult = {
      exercise,
      reps: Math.floor(Math.random() * 20) + 5,
      calories: Math.floor(Math.random() * 100) + 20,
      feedback: 'Great form! Keep it up!'
    };

    // Log the analysis for debugging
    console.log('Exercise analysis requested:', {
      user: req.user._id,
      exercise,
      hasFile: !!req.file
    });

    res.json(mockResult);
  } catch (error) {
    console.error('Exercise analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
