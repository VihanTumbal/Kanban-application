const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;
