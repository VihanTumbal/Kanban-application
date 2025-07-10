const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Board = require("../models/Board");

// Get all boards for current user
router.get("/", auth, async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user._id });
    res.json(boards);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching boards", error: error.message });
  }
});

// Create a new board
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const board = new Board({
      title,
      userId: req.user._id,
    });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating board", error: error.message });
  }
});

// Get single board
router.get("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json(board);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching board", error: error.message });
  }
});

// Update board
router.patch("/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json(board);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating board", error: error.message });
  }
});

// Delete board
router.delete("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting board", error: error.message });
  }
});

module.exports = router;
