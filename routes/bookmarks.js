const express = require('express');
const router = express.Router();
const auth = require('../config/authMiddleware');
const User = require('../models/User');

// POST /api/bookmarks/:eventId  toggle
router.post('/:eventId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const evId = req.params.eventId;
    const exists = user.wishlist.find(id => id.toString() === evId);
    if (exists) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== evId);
    } else {
      user.wishlist.push(evId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/bookmarks  fetch user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist').lean();
    res.json(user.wishlist || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
