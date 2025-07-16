const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const Card = require("../models/Card");
const List = require("../models/List");
const Board = require("../models/Board");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Get all cards for a list
router.get("/list/:listId", auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
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

    const cards = await Card.find({ listId: req.params.listId })
      .populate("assignee", "name email")
      .sort("order");
    res.json(cards);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cards", error: error.message });
  }
});

// Create a new card
router.post("/", auth, upload.array("attachments"), async (req, res) => {
  try {
    const { title, description, listId, dueDate, assignee } = req.body;

    const list = await List.findById(listId);
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

    // Get max order
    const maxOrderCard = await Card.findOne({ listId }).sort("-order");
    const order = maxOrderCard ? maxOrderCard.order + 1 : 0;

    // Process attachments
    const attachments =
      req.files?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })) || [];

    const card = new Card({
      title,
      description,
      listId,
      order,
      dueDate,
      assignee,
      attachments,
    });

    await card.save();
    res.status(201).json(card);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating card", error: error.message });
  }
});

// Update card
router.patch("/:id", auth, upload.array("attachments"), async (req, res) => {
  try {
    const { title, description, listId, order, dueDate, assignee } = req.body;
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const list = await List.findById(card.listId);
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

    // Update fields if provided
    if (title) card.title = title;
    if (description) card.description = description;
    if (listId) card.listId = listId;
    if (typeof order === "number") card.order = order;
    if (dueDate) card.dueDate = dueDate;
    if (assignee) card.assignee = assignee;

    // Add new attachments if any
    if (req.files?.length) {
      const newAttachments = req.files.map((file) => ({
        filename: file.originalname,
        path: file.path,
      }));
      card.attachments.push(...newAttachments);
    }

    await card.save();
    res.json(card);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating card", error: error.message });
  }
});

// Delete card
router.delete("/:id", auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const list = await List.findById(card.listId);
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

    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: "Card deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting card", error: error.message });
  }
});

module.exports = router;
