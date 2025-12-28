import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: Number,
    long: Number
  },
  timestamp: { type: Date, default: Date.now },
  mediaURL: String,
  reportedBy: String,
  severityAI: String,
  status: { type: String, default: "Pending" },
  assignedTo: { type: String, default: "Not Assigned" }
});

export default mongoose.model("Report", reportSchema);
