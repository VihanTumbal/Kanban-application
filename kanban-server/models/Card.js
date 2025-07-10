const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Card title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    dueDate: {
      type: Date,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: [
      {
        filename: String,
        path: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
