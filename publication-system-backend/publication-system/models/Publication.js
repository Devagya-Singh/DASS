const mongoose = require("mongoose");

const PublicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  publicationDate: { type: Date, required: true },

  // This stores the name/path of the uploaded PDF
  pdfPath: { type: String, required: true },

  // Author reference
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Status: pending by default
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // For future download link support
  downloadLinks: {
    pdf: { type: String, default: "" },
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model("Publication", PublicationSchema);
