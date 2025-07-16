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

      // Immediately open the edit modal for the newly created card
      setEditingCard(response.data);
      setShowCardModal(true);
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

  const moveCard = async (
    cardId,
    sourceListId,
    targetListId,
    targetCardId = null
  ) => {
    try {
      // First, update the card's listId on the backend
      await cardAPI.update(cardId, { listId: targetListId });

      // Optimistically update the UI
      setLists((prevLists) => {
        const newLists = prevLists.map((list) => ({
          ...list,
          cards: [...list.cards],
        }));

        // Find source and target lists
        const sourceListIndex = newLists.findIndex(
          (list) => list._id === sourceListId
        );
        const targetListIndex = newLists.findIndex(
          (list) => list._id === targetListId
        );

        if (sourceListIndex === -1 || targetListIndex === -1) {
          console.error("Source or target list not found");
          return prevLists;
        }

        const sourceList = newLists[sourceListIndex];
        const targetList = newLists[targetListIndex];

        // Find and remove the card from source list
        const cardIndex = sourceList.cards.findIndex(
          (card) => card._id === cardId
        );

        if (cardIndex === -1) {
          console.error("Card not found in source list");
          return prevLists;
        }

        const [movedCard] = sourceList.cards.splice(cardIndex, 1);

        // Update the card's listId
        movedCard.listId = targetListId;

        // Find target position
        let targetIndex;
        if (targetCardId) {
          // Insert before the target card
          targetIndex = targetList.cards.findIndex(
            (card) => card._id === targetCardId
          );
          if (targetIndex === -1) {
            targetIndex = targetList.cards.length; // Add to end if target card not found
          }
        } else {
          // Add to end of list
          targetIndex = targetList.cards.length;
        }

        // Insert the card into target list at the calculated position
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-accent rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <div className="text-textSecondary font-medium">
            Loading your board...
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="backdrop-blur-md bg-card/80 border-b border-border shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="group flex items-center space-x-2 px-3 py-2 text-textSecondary hover:text-textPrimary hover:bg-hover rounded-lg transition-all duration-200 ease-in-out"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span className="font-medium">Dashboard</span>
                </button>
                <div className="h-6 w-px bg-border"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-textPrimary to-textSecondary bg-clip-text text-transparent">
                  Board View
                </h1>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative group flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-card backdrop-blur-sm border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 ease-in-out placeholder-textSecondary text-textPrimary"
                  />
                  <svg
                    className="absolute left-3 top-3 h-5 w-5 text-textSecondary transition-colors group-focus-within:text-primary-500"
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
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-3 h-5 w-5 text-textSecondary hover:text-textPrimary transition-colors"
                    >
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-4 py-2.5 bg-card backdrop-blur-sm border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 ease-in-out text-textPrimary"
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
            <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-xl shadow-sm animate-slide-down">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Board Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex space-x-6 overflow-x-auto pb-6 min-h-[calc(100vh-200px)] scrollbar-thin">
            {/* Existing Lists */}
            {filteredLists.map((list, index) => (
              <div
                key={list._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ListColumn
                  list={list}
                  onCreateCard={createCard}
                  onMoveCard={moveCard}
                  onEditCard={editCard}
                  onDeleteCard={deleteCard}
                  onDeleteList={deleteList}
                />
              </div>
            ))}

            {/* Add List Column */}
            <div
              className="flex-shrink-0 w-80 animate-fade-in-up"
              style={{ animationDelay: `${filteredLists.length * 100}ms` }}
            >
              {showCreateList ? (
                <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300">
                  <form onSubmit={createList}>
                    <input
                      type="text"
                      placeholder="Enter list title"
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 placeholder-textSecondary text-textPrimary"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-textPrimary rounded-xl shadow-md hover:from-primary-600 hover:to-primary-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                      >
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateList(false);
                          setNewListTitle("");
                        }}
                        className="px-4 py-2 text-textSecondary hover:text-textPrimary hover:bg-hover rounded-xl transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateList(true)}
                  className="w-full p-6 bg-card/40 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl text-textSecondary hover:text-textPrimary hover:border-primary-500 hover:bg-hover transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5 transition-transform group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="font-medium">Add another list</span>
                  </div>
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
const DraggableCard = ({ card, listId, onEditCard, onDeleteCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: { id: card._id, listId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Determine card status color based on due date
  const getCardStatusColor = () => {
    if (!card.dueDate) return "border-l-4 border-border";

    const now = new Date();
    const dueDate = new Date(card.dueDate);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    if (dueDate < now) {
      return "border-l-4 border-danger bg-gradient-to-r from-danger/10 to-card"; // Overdue
    } else if (dueDate <= threeDaysFromNow) {
      return "border-l-4 border-accent bg-gradient-to-r from-accent/10 to-card"; // Due soon
    } else {
      return "border-l-4 border-success bg-gradient-to-r from-success/10 to-card"; // Future
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-card backdrop-blur-sm p-4 rounded-xl shadow-md border border-border cursor-pointer hover:shadow-xl transition-all duration-300 group transform hover:scale-105 ${
        isDragging ? "opacity-40 rotate-2 scale-105 shadow-2xl z-50" : ""
      } ${getCardStatusColor()}`}
      onClick={() => onEditCard(card)}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-textPrimary flex-1 leading-tight">
          {card.title}
        </h4>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCard(card);
            }}
            className="opacity-0 group-hover:opacity-100 text-textSecondary hover:text-primary-500 hover:bg-primary-500/10 p-1 rounded-lg transition-all duration-200"
            title="Edit card"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCard(card._id, listId);
            }}
            className="opacity-0 group-hover:opacity-100 text-textSecondary hover:text-danger hover:bg-danger/10 p-1 rounded-lg transition-all duration-200"
            title="Delete card"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      {card.description && (
        <p className="text-textSecondary text-sm mt-2 line-clamp-2">
          {card.description}
        </p>
      )}
      {card.dueDate && (
        <div className="flex items-center space-x-2 mt-3">
          <svg
            className="w-4 h-4 text-textSecondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              new Date(card.dueDate) < new Date()
                ? "text-danger bg-danger/20"
                : new Date(card.dueDate) <=
                  new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
                ? "text-accent bg-accent/20"
                : "text-success bg-success/20"
            }`}
          >
            {new Date(card.dueDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

// Drop Zone Component for precise card positioning
const DropZone = ({ listId, beforeCardId, onMoveCard }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "card",
    drop: (item) => {
      if (item.listId !== listId || item.beforeCardId !== beforeCardId) {
        onMoveCard(item.id, item.listId, listId, beforeCardId);
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
      className={`transition-all duration-300 ease-out ${
        isOver && canDrop
          ? "h-8 bg-gradient-to-r from-primary-100 to-accent/20 border-2 border-primary-500 border-dashed rounded-xl shadow-lg transform scale-105"
          : "h-2 hover:h-4 bg-transparent hover:bg-hover/50 rounded-lg"
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
        // Move to end of list (no beforeCardId)
        onMoveCard(item.id, item.listId, list._id, null);
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
        className={`bg-card/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-border transition-all duration-300 hover:shadow-xl ${
          isOver
            ? "bg-gradient-to-br from-primary-50/80 to-accent/20 border-primary-500 shadow-2xl transform scale-105"
            : ""
        }`}
      >
        {/* List Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-accent rounded-full"></div>
            <h3 className="font-semibold text-textPrimary text-lg">
              {list.title}
            </h3>
            <span className="bg-background text-textSecondary text-xs px-2 py-1 rounded-full font-medium">
              {list.cards.length}
            </span>
          </div>
          <button
            onClick={() => onDeleteList(list._id)}
            className="text-textSecondary hover:text-danger hover:bg-danger/10 p-1 rounded-lg transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cards */}
        <div className="space-y-2 mb-5 min-h-[100px]">
          <DropZone
            listId={list._id}
            beforeCardId={null}
            onMoveCard={onMoveCard}
          />
          {list.cards.map((card, index) => (
            <React.Fragment key={card._id}>
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DraggableCard
                  card={card}
                  listId={list._id}
                  onEditCard={onEditCard}
                  onDeleteCard={onDeleteCard}
                />
              </div>
              <DropZone
                listId={list._id}
                beforeCardId={list.cards[index + 1]?._id || null}
                onMoveCard={onMoveCard}
              />
            </React.Fragment>
          ))}
          {list.cards.length === 0 && (
            <div className="text-center py-8 text-textSecondary">
              <svg
                className="w-12 h-12 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-sm">No cards yet</p>
            </div>
          )}
        </div>

        {/* Add Card */}
        {showCreateCard ? (
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border shadow-sm">
            <form onSubmit={handleCreateCard}>
              <textarea
                placeholder="Enter a title for this card..."
                className="w-full px-3 py-2 bg-card/60 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none transition-all duration-300 placeholder-textSecondary text-textPrimary"
                rows="3"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                autoFocus
              />
              <div className="flex space-x-2 mt-3">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-500 to-accent text-white rounded-lg shadow-md hover:from-primary-600 hover:to-accent/90 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm"
                >
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCard(false);
                    setNewCardTitle("");
                  }}
                  className="px-3 py-2 text-textSecondary hover:text-textPrimary hover:bg-hover rounded-lg transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateCard(true)}
            className="w-full p-3 text-textSecondary hover:text-textPrimary hover:bg-hover rounded-xl transition-all duration-200 group border border-dashed border-border hover:border-primary-500"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="font-medium text-sm">Add a card</span>
            </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-textPrimary">Edit Card</h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary p-2 hover:bg-hover rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-textPrimary mb-2">
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
            <label className="block text-sm font-medium text-textPrimary mb-2">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Assign to User (Optional)
            </label>
            <input
              type="email"
              placeholder="Enter user email to assign"
              className="input-field"
            />
            <p className="text-xs text-textSecondary mt-1">
              Feature coming soon - user assignment
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => {
                // Handle file selection
                console.log("Files selected:", e.target.files);
              }}
              className="input-field"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            <p className="text-xs text-textSecondary mt-1">
              Supported formats: Images, PDF, Word documents
            </p>
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
