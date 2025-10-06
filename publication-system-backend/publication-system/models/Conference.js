// models/Conference.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: "Publication" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  submittedAt: { type: Date, default: Date.now },
});
const conferenceSchema = new mongoose.Schema(
    {
      name: String,
      date: Date,
      location: String,
      description: String,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submissions: [submissionSchema],
    },
    { timestamps: true } // adds createdAt and updatedAt fields
  );
  
module.exports = mongoose.model("Conference", conferenceSchema);
