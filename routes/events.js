const express = require('express');
const router = express.Router();
const auth = require('../config/authMiddleware');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');

/* -------------------------------------------------------
   GET EVENTS (with auto-delete + filters + ongoing)
-------------------------------------------------------- */
router.get('/', async (req, res) => {
  try {
    // 🔹 Work with DATE ONLY (midnight)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // 🔹 Delete events strictly before TODAY (yesterday and older)
    await Event.deleteMany({ startDate: { $lt: startOfToday } });

    const { type, mode, timeline, q } = req.query;
    let filter = {};

    // ---------- TYPE ----------
    if (type) filter.type = type;

    // ---------- MODE ----------
    if (mode === 'Online') filter.isOnline = true;
    if (mode === 'Offline') filter.isOnline = false;

    // ---------- SEARCH ----------
    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }

    // ---------- UPCOMING MONTHS: next1, next2, next3 ----------
    if (timeline && timeline.startsWith('next')) {
      const m = Number(timeline.replace('next', '')); // months
      const startRange = startOfToday;               // from today
      const endRange = new Date(startOfToday);
      endRange.setMonth(endRange.getMonth() + m);    // +m months
      filter.startDate = { $gte: startRange, $lte: endRange };
    }

    // 🔹 ONGOING = events happening TODAY
    if (timeline === 'ongoing') {
      filter.startDate = { $gte: startOfToday, $lt: endOfToday };
    }

    const events = await Event.find(filter).sort({ startDate: 1 }).lean();
    res.json(events);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/* -------------------------------------------------------
   CREATE EVENT (duplicate check)
-------------------------------------------------------- */
router.post(
  '/',
  [
    auth,
    body('title').notEmpty(),
    body('startDate').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const data = req.body;

      const start = new Date(data.startDate);
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);

      const dup = await Event.findOne({
        title: data.title,
        postedBy: req.user.id,
        startDate: { $gte: monthStart, $lt: monthEnd }
      });

      if (dup) {
        return res.status(400).json({ msg: 'Duplicate event in same month' });
      }

      let eventType = data.type;
      let customType = null;

      if (data.type === 'Other' && data.customType) {
        customType = data.customType;
      }

      const ev = new Event({
        ...data,
        type: eventType,
        customType,
        postedBy: req.user.id
      });

      await ev.save();
      res.json({ msg: 'Event added successfully', event: ev });

    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

/* -------------------------------------------------------
   GET SINGLE EVENT
-------------------------------------------------------- */
router.get('/:id', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id).lean();
    if (!ev) return res.status(404).json({ msg: 'Event not found' });

    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/* -------------------------------------------------------
   DELETE EVENT (OWNER ONLY — Simplified)
-------------------------------------------------------- */
router.delete('/:id', auth, async (req, res) => {
  try {
    const ev = await Event.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });

    if (!ev) {
      return res.status(404).json({ msg: 'Event not found or not allowed' });
    }

    res.json({ msg: 'Event removed' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
