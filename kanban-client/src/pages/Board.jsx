import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listAPI, cardAPI } from '../utils/api';

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    if (boardId) {
      fetchLists();
    }
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
      console.error('Error fetching lists:', error);
      setError('Failed to fetch board data');
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
      setNewListTitle('');
      setShowCreateList(false);
    } catch (error) {
      console.error('Error creating list:', error);
      setError('Failed to create list');
    }
  };

  const createCard = async (listId, title) => {
    try {
      const response = await cardAPI.create({
        title,
        listId,
      });
      
      // Update the lists state to include the new card
      setLists(lists.map(list => 
        list._id === listId 
          ? { ...list, cards: [...list.cards, response.data] }
          : list
      ));
    } catch (error) {
      console.error('Error creating card:', error);
      setError('Failed to create card');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Board View</h1>
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
          {lists.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              onCreateCard={createCard}
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
                        setNewListTitle('');
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
  );
};

// List Column Component
const ListColumn = ({ list, onCreateCard }) => {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await onCreateCard(list._id, newCardTitle.trim());
    setNewCardTitle('');
    setShowCreateCard(false);
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        {/* List Header */}
        <h3 className="font-medium text-gray-900 mb-4">{list.title}</h3>

        {/* Cards */}
        <div className="space-y-3 mb-4">
          {list.cards.map((card) => (
            <div
              key={card._id}
              className="bg-white p-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <h4 className="font-medium text-gray-900">{card.title}</h4>
              {card.description && (
                <p className="text-gray-600 text-sm mt-1">{card.description}</p>
              )}
              {card.dueDate && (
                <p className="text-gray-500 text-xs mt-2">
                  Due: {new Date(card.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
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
                  setNewCardTitle('');
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

export default Board;
