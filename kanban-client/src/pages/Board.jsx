import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { listAPI, cardAPI } from "../utils/api";

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, due-soon, overdue

  useEffect(() => {
    const loadLists = async () => {
      if (boardId) {
        try {
          setLoading(true);
          const response = await listAPI.getByBoard(boardId);
          const listsData = response.data;

          // Fetch cards for each list
          const listsWithCards = await Promise.all(
            listsData.map(async (list) => {
              try {
                const cardsResponse = await cardAPI.getByList(list._id);
                return { ...list, cards: cardsResponse.data };
              } catch (error) {
                console.error(
                  `Error fetching cards for list ${list._id}:`,
                  error
                );
                return { ...list, cards: [] };
              }
            })
          );

          setLists(listsWithCards);
        } catch (error) {
          console.error("Error fetching lists:", error);
          setError("Failed to fetch board data");
        } finally {
          setLoading(false);
        }
      }
    };

    loadLists();
  }, [boardId]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await listAPI.getByBoard(boardId);
      const listsData = response.data;

      // Fetch cards for each list
      const listsWithCards = await Promise.all(
        listsData.map(async (list) => {
          try {
            const cardsResponse = await cardAPI.getByList(list._id);
            return { ...list, cards: cardsResponse.data };
          } catch (error) {
            console.error(`Error fetching cards for list ${list._id}:`, error);
            return { ...list, cards: [] };
          }
        })
      );

      setLists(listsWithCards);
    } catch (error) {
      console.error("Error fetching lists:", error);
      setError("Failed to fetch board data");
    } finally {
      setLoading(false);
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const response = await listAPI.create(newListTitle.trim(), boardId);
      const newList = { ...response.data, cards: [] };
      setLists([...lists, newList]);
      setNewListTitle("");
      setShowCreateList(false);
    } catch (error) {
      console.error("Error creating list:", error);
      setError("Failed to create list");
    }
  };

  const createCard = async (listId, title) => {
    try {
      const response = await cardAPI.create({
        title,
        listId,
      });

      // Update the lists state to include the new card
      setLists(
        lists.map((list) =>
          list._id === listId
            ? { ...list, cards: [...list.cards, response.data] }
            : list
        )
      );
    } catch (error) {
      console.error("Error creating card:", error);
      setError("Failed to create card");
    }
  };

  const editCard = (card) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const updateCard = async (cardId, updates) => {
    try {
      const response = await cardAPI.update(cardId, updates);

      // Update the lists state
      setLists(
        lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card._id === cardId ? response.data : card
          ),
        }))
      );

      setShowCardModal(false);
      setEditingCard(null);
    } catch (error) {
      console.error("Error updating card:", error);
      setError("Failed to update card");
    }
  };

  const deleteCard = async (cardId, listId) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await cardAPI.delete(cardId);

        // Update the lists state to remove the card
        setLists(
          lists.map((list) =>
            list._id === listId
              ? {
                  ...list,
                  cards: list.cards.filter((card) => card._id !== cardId),
                }
              : list
          )
        );
      } catch (error) {
        console.error("Error deleting card:", error);
        setError("Failed to delete card");
      }
    }
  };

  const deleteList = async (listId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this list? This will also delete all cards in the list."
      )
    ) {
      try {
        await listAPI.delete(listId);

        // Update the lists state to remove the list
        setLists(lists.filter((list) => list._id !== listId));
      } catch (error) {
        console.error("Error deleting list:", error);
        setError("Failed to delete list");
      }
    }
  };

  const moveCard = async (cardId, sourceListId, targetListId, targetIndex) => {
    try {
      // Update the card's listId on the backend
      await cardAPI.update(cardId, { listId: targetListId });

      // Optimistically update the UI
      setLists((prevLists) => {
        const newLists = [...prevLists];

        // Find source and target lists
        const sourceList = newLists.find((list) => list._id === sourceListId);
        const targetList = newLists.find((list) => list._id === targetListId);

        // Find and remove the card from source list
        const cardIndex = sourceList.cards.findIndex(
          (card) => card._id === cardId
        );
        const [movedCard] = sourceList.cards.splice(cardIndex, 1);

        // Update the card's listId
        movedCard.listId = targetListId;

        // Insert the card into target list at the specified index
        targetList.cards.splice(targetIndex, 0, movedCard);

        return newLists;
      });
    } catch (error) {
      console.error("Error moving card:", error);
      setError("Failed to move card");
      // Refresh the board to restore correct state
      fetchLists();
    }
  };

  // Filter and search logic
  const filterCards = (cards) => {
    let filteredCards = cards;

    // Apply search filter
    if (searchTerm) {
      filteredCards = filteredCards.filter(
        (card) =>
          card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.description &&
            card.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter
    if (filterBy !== "all") {
      const now = new Date();
      const threeDaysFromNow = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      );

      filteredCards = filteredCards.filter((card) => {
        if (!card.dueDate) return false;
        const dueDate = new Date(card.dueDate);

        if (filterBy === "overdue") {
          return dueDate < now;
        } else if (filterBy === "due-soon") {
          return dueDate >= now && dueDate <= threeDaysFromNow;
        }
        return true;
      });
    }

    return filteredCards;
  };

  const filteredLists = lists.map((list) => ({
    ...list,
    cards: filterCards(list.cards),
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading board...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Board View
                </h1>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Cards</option>
                  <option value="due-soon">Due Soon</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Board Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {/* Existing Lists */}
            {filteredLists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                onCreateCard={createCard}
                onMoveCard={moveCard}
                onEditCard={editCard}
                onDeleteCard={deleteCard}
                onDeleteList={deleteList}
              />
            ))}

            {/* Add List Column */}
            <div className="flex-shrink-0 w-80">
              {showCreateList ? (
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <form onSubmit={createList}>
                    <input
                      type="text"
                      placeholder="Enter list title"
                      className="input-field mb-3"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button type="submit" className="btn-primary text-sm">
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateList(false);
                          setNewListTitle("");
                        }}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateList(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-dashed border-gray-300"
                >
                  + Add another list
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Card Modal */}
      <CardModal
        card={editingCard}
        isOpen={showCardModal}
        onClose={() => {
          setShowCardModal(false);
          setEditingCard(null);
        }}
        onSave={updateCard}
      />
    </DndProvider>
  );
};

// Draggable Card Component
const DraggableCard = ({ card, listId, index, onEditCard, onDeleteCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: { id: card._id, listId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Determine card status color based on due date
  const getCardStatusColor = () => {
    if (!card.dueDate) return "";

    const now = new Date();
    const dueDate = new Date(card.dueDate);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    if (dueDate < now) {
      return "border-l-4 border-red-500"; // Overdue
    } else if (dueDate <= threeDaysFromNow) {
      return "border-l-4 border-yellow-500"; // Due soon
    } else {
      return "border-l-4 border-green-500"; // Future
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-white p-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow duration-200 group ${
        isDragging ? "opacity-50" : ""
      } ${getCardStatusColor()}`}
      onClick={() => onEditCard(card)}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900 flex-1">{card.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCard(card._id, listId);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200"
        >
          ×
        </button>
      </div>
      {card.description && (
        <p className="text-gray-600 text-sm mt-1">{card.description}</p>
      )}
      {card.dueDate && (
        <p
          className={`text-xs mt-2 ${
            new Date(card.dueDate) < new Date()
              ? "text-red-600 font-medium"
              : new Date(card.dueDate) <=
                new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
              ? "text-yellow-600 font-medium"
              : "text-gray-500"
          }`}
        >
          Due: {new Date(card.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

// Drop Zone Component for precise card positioning
const DropZone = ({ listId, index, onMoveCard }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "card",
    drop: (item) => {
      if (item.listId !== listId || item.index !== index) {
        onMoveCard(item.id, item.listId, listId, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`transition-all duration-200 ${
        isOver && canDrop
          ? "h-8 bg-blue-100 border-2 border-blue-300 border-dashed rounded-lg"
          : "h-2"
      }`}
    />
  );
};

// List Column Component
const ListColumn = ({
  list,
  onCreateCard,
  onMoveCard,
  onEditCard,
  onDeleteCard,
  onDeleteList,
}) => {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const [{ isOver }, drop] = useDrop({
    accept: "card",
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      if (item.listId !== list._id) {
        onMoveCard(item.id, item.listId, list._id, list.cards.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await onCreateCard(list._id, newCardTitle.trim());
    setNewCardTitle("");
    setShowCreateCard(false);
  };

  return (
    <div ref={drop} className="flex-shrink-0 w-80">
      <div
        className={`bg-gray-100 rounded-lg p-4 ${
          isOver ? "bg-blue-50 border-2 border-blue-300 border-dashed" : ""
        }`}
      >
        {/* List Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">{list.title}</h3>
          <button
            onClick={() => onDeleteList(list._id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-1 mb-4">
          <DropZone listId={list._id} index={0} onMoveCard={onMoveCard} />
          {list.cards.map((card, index) => (
            <React.Fragment key={card._id}>
              <DraggableCard
                card={card}
                listId={list._id}
                index={index}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
              />
              <DropZone
                listId={list._id}
                index={index + 1}
                onMoveCard={onMoveCard}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Add Card */}
        {showCreateCard ? (
          <form onSubmit={handleCreateCard}>
            <textarea
              placeholder="Enter a title for this card..."
              className="input-field mb-2 resize-none"
              rows="3"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              autoFocus
            />
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary text-sm">
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateCard(false);
                  setNewCardTitle("");
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateCard(true)}
            className="w-full text-left text-gray-600 hover:text-gray-800 py-2 px-3 rounded hover:bg-gray-200 transition-colors duration-200"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};

// Card Modal Component for editing cards
const CardModal = ({ card, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [dueDate, setDueDate] = useState(
    card?.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
  );

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
      );
    }
  }, [card]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(card._id, {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Card</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows="4"
              placeholder="Add a description..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex space-x-3">
            <button type="submit" className="btn-primary flex-1">
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Board;
