const express = require('express');
const router = express.Router();
const auth = require('../config/authMiddleware');
const User = require('../models/User');
const Event = require('../models/Event');

/**
 * GET /api/users/me
 * Returns:
 * {
 *   user: { ... , wishlist: [events...] },
 *   myEvents: [events created by this user]
 * }
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Logged-in user + populate wishlist
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'wishlist',
        select:
          'title startDate location description registrationLink isOnline type customType',
      })
      .lean();

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Events created by this user
    const myEvents = await Event.find({ postedBy: req.user.id })
      .select(
        'title startDate location description registrationLink isOnline type customType'
      )
      .lean();

    return res.json({ user, myEvents });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

/**
 * OPTIONAL – public profile by user id (if you still need it)
 */
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const events = await Event.find({ postedBy: user._id })
      .select(
        'title startDate location description registrationLink isOnline type customType'
      )
      .lean();

    // hide personal info from public
    events.forEach((e) => {
      if (e.postedBy) e.postedBy = undefined;
    });

    res.json({
      user: {
        name: user.name,
        college: user.college,
        year: user.year,
      },
      events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
