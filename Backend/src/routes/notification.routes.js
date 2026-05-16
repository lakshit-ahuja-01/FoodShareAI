import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ GET ALL NOTIFICATIONS for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ✅ GET UNREAD COUNT (for Navbar badge)
router.get("/count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, unread: true });
    res.json({ count });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// ✅ MARK ALL AS READ
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, unread: true }, { unread: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

// ✅ MARK SINGLE AS READ
router.patch("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { unread: false }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

// ✅ DELETE A NOTIFICATION
router.delete("/:id", protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification" });
  }
});

export default router;