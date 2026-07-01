const express = require('express');
const router = express.Router();
const auth = require('../config/authMiddleware');
const Report = require('../models/Report');
const Event = require('../models/Event');

/* ----------------------------------------------------
   POST /api/reports  → Submit a broken link report
----------------------------------------------------- */
router.post('/', auth, async (req, res) => {
  try {
    const { eventId, message } = req.body;

    // Safety check
    if (!eventId) {
      return res.status(400).json({ msg: "Missing eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Prevent duplicate pending reports by same user
    const exists = await Report.findOne({
      event: eventId,
      reportedBy: req.user.id,
      status: 'Pending'
    });

    if (exists) {
      return res.status(400).json({ msg: "You already reported this event" });
    }

    // Create report
    const report = new Report({
      event: eventId,
      reportedBy: req.user.id,
      message: message || "Broken registration link"
    });

    await report.save();

    res.json({ msg: "Report submitted successfully", report });

  } catch (err) {
    console.error("REPORT ERROR:", err.message);
    res.status(500).json({ msg: "Server error while reporting" });
  }
});


/* ----------------------------------------------------
   GET /api/reports/for-owner  → Fetch reports for event owner
----------------------------------------------------- */
router.get('/for-owner', auth, async (req, res) => {
  try {
    const ownerEvents = await Event.find({ postedBy: req.user.id })
      .select("_id title")
      .lean();

    const eventIds = ownerEvents.map(ev => ev._id);

    const reports = await Report.find({
      event: { $in: eventIds },
      status: 'Pending'
    })
      .populate('event', 'title')
      .populate('reportedBy', 'name email')
      .lean();

    res.json({ events: ownerEvents, reports });

  } catch (err) {
    console.error("FETCH REPORTS ERROR:", err.message);
    res.status(500).json({ msg: "Server error while loading reports" });
  }
});


/* ----------------------------------------------------
   PUT /api/reports/:id/resolve  → Resolve report
----------------------------------------------------- */
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('event');

    if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    // Only event owner can resolve
    if (report.event.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    report.status = "Resolved";
    report.resolvedAt = new Date();
    await report.save();

    res.json({ msg: "Report resolved", report });

  } catch (err) {
    console.error("RESOLVE REPORT ERROR:", err.message);
    res.status(500).json({ msg: "Server error while resolving report" });
  }
});

module.exports = router;
