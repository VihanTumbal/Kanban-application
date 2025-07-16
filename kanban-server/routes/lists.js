const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const List = require("../models/List");
const Board = require("../models/Board");

// Get all lists for a board
router.get("/board/:boardId", auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      userId: req.user._id,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const lists = await List.find({ boardId: req.params.boardId }).sort(
      "order"
    );
    res.json(lists);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching lists", error: error.message });
  }
});

// Create a new list
router.post("/", auth, async (req, res) => {
  try {
    const { title, boardId } = req.body;

    // Verify board belongs to user
    const board = await Board.findOne({ _id: boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Get max order
    const maxOrderList = await List.findOne({ boardId }).sort("-order");
    const order = maxOrderList ? maxOrderList.order + 1 : 0;

    const list = new List({
      title,
      boardId,
      order,
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating list", error: error.message });
  }
});

// Update list
router.patch("/:id", auth, async (req, res) => {
  try {
    const { title, order } = req.body;
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Verify board belongs to user
    const board = await Board.findOne({
      _id: list.boardId,
      userId: req.user._id,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (title) list.title = title;
    if (typeof order === "number") list.order = order;

    await list.save();
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating list", error: error.message });
  }
});

// Delete list
router.delete("/:id", auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Verify board belongs to user
    const board = await Board.findOne({
      _id: list.boardId,
      userId: req.user._id,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    await List.findByIdAndDelete(req.params.id);
    res.json({ message: "List deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting list", error: error.message });
  }
});

module.exports = router;
