import express from "express";
import Report from "../models/Report.js";

const router = express.Router();

// Create a new emergency report
router.post("/", async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch all reports (Admin Dashboard)
router.get("/", async (req, res) => {
  const reports = await Report.find().sort({ timestamp: -1 });
  res.json(reports);
});

export default router;
