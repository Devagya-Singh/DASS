const express = require("express");
const router = express.Router();
const Conference = require("../models/Conference");
const Publication = require("../models/Publication");
const { authenticateToken } = require("../middleware/auth");

// @route   POST /conferences
// @desc    Admin creates a conference
// @access  Private (Admin only)
router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create conferences" });
    }
    try {
      const { name, date, location, description } = req.body;

      const newConference = new Conference({
        name,
        date,
        location,
        description,
        createdBy: req.user.id,
      });

      const savedConference = await newConference.save();
      res.status(201).json(savedConference);
    } catch (err) {
      console.error("Error creating conference:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ UPDATED: GET /conferences - now includes submission data
// @route   GET /conferences
// @desc    Get all conferences (for authors and admins)
// @access  Private (Any logged-in user)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const conferences = await Conference.find()
      .populate("submissions.paperId", "title status")
      .populate("submissions.authorId", "name email")
      .sort({ date: 1 });

    res.json(conferences);
  } catch (err) {
    console.error("Error fetching conferences:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /conferences/submit
// @desc    Author submits an approved paper to a conference
// @access  Private (Author only)
router.post(
  "/submit",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "author") {
      return res.status(403).json({ message: "Only authors can submit papers" });
    }
    try {
      const { paperId, conferenceId } = req.body;

      if (!paperId || !conferenceId) {
        return res
          .status(400)
          .json({ message: "Paper ID and Conference ID are required" });
      }

      const paper = await Publication.findOne({
        _id: paperId,
        author: req.user.id,
        status: "approved",
      });

      if (!paper) {
        return res
          .status(403)
          .json({ message: "Only your own approved papers can be submitted." });
      }

      const conference = await Conference.findById(conferenceId);
      if (!conference) {
        return res.status(404).json({ message: "Conference not found" });
      }

      const alreadySubmitted = conference.submissions.some(
        (s) => s.paperId.toString() === paperId.toString()
      );

      if (alreadySubmitted) {
        return res
          .status(409)
          .json({ message: "You have already submitted this paper to the conference." });
      }

      conference.submissions.push({
        paperId,
        authorId: req.user.id,
        submittedAt: new Date(),
      });

      await conference.save();

      res.status(200).json({ message: "Approved paper submitted successfully!" });
    } catch (err) {
      console.error("Error submitting paper:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /conferences/submissions
// @desc    Admin views all paper submissions to conferences
// @access  Private (Admin only)
router.get(
  "/submissions",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view submissions" });
    }
    try {
      const conferences = await Conference.find()
        .populate("submissions.paperId", "title status")
        .populate("submissions.authorId", "name email")
        .sort({ date: -1 });

      const submissions = conferences.flatMap((conf) =>
        conf.submissions.map((submission) => ({
          conferenceName: conf.name,
          conferenceDate: conf.date,
          conferenceId: conf._id,
          ...submission._doc,
        }))
      );

      res.status(200).json(submissions);
    } catch (err) {
      console.error("Error fetching submissions:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /conferences/my-submissions
// @desc    Author views their own submissions to conferences
// @access  Private (Author only)
router.get(
  "/my-submissions",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "author") {
      return res.status(403).json({ message: "Only authors can view their submissions" });
    }
    try {
      const conferences = await Conference.find({ "submissions.authorId": req.user.id })
        .populate("submissions.paperId", "title status")
        .sort({ date: 1 });

      const mySubmissions = conferences.flatMap((conf) =>
        conf.submissions
          .filter((sub) => sub.authorId.toString() === req.user.id)
          .map((submission) => ({
            conferenceId: conf._id,
            conferenceName: conf.name,
            conferenceDate: conf.date,
            location: conf.location,
            description: conf.description,
            paperTitle: submission.paperId?.title,
            paperStatus: submission.paperId?.status,
            submittedAt: submission.submittedAt,
          }))
      );

      res.status(200).json(mySubmissions);
    } catch (err) {
      console.error("Error fetching author's submissions:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
