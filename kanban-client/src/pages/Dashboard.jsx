import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { boardAPI } from "../utils/api";

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Filter boards based on search query
  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardAPI.getAll();
      setBoards(response.data);
    } catch (error) {
      console.error("Error fetching boards:", error);
      setError("Failed to fetch boards");
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      setCreating(true);
      const response = await boardAPI.create({
        title: newBoardTitle.trim(),
      });

      setBoards([...boards, response.data]);
      setNewBoardTitle("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating board:", error);
      setError("Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

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
            Loading your boards...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-card/60 backdrop-blur-lg border-r border-border shadow-2xl z-40">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-textPrimary to-primary-500 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-xs text-textSecondary">Project Management</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-card/80 rounded-xl p-4 mb-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-textPrimary truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-textSecondary truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-textPrimary">Total Boards</span>
              </div>
              <span className="text-lg font-bold text-primary-500">{boards.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-sm text-textPrimary">Active Projects</span>
              </div>
              <span className="text-lg font-bold text-accent">{boards.filter(board => board.status !== 'completed').length}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 p-3 bg-primary-500/10 text-primary-500 rounded-lg border border-primary-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 text-textSecondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all duration-200 border border-border hover:border-danger/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-card/40 backdrop-blur-sm border-b border-border sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-textPrimary">Dashboard</h2>
                <p className="text-textSecondary text-sm mt-1">Manage your projects and boards</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search boards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 py-2 w-64 bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 placeholder-textSecondary text-textPrimary"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 h-5 w-5 text-textSecondary hover:text-textPrimary transition-colors"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {error && (
            <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-xl shadow-sm animate-slide-down mb-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Welcome & Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Welcome Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-primary-500/10 to-accent/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-textPrimary mb-2">
                    Welcome back, {user?.name}! �
                  </h3>
                  <p className="text-textSecondary">
                    Ready to boost your productivity? You have {boards.length} projects to manage.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border">
              <h4 className="text-lg font-semibold text-textPrimary mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center space-x-3 p-3 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">New Board</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">Invite Team</span>
                </button>
              </div>
            </div>
          </div>

          {/* Boards Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-textPrimary">Your Boards</h3>
              <p className="text-textSecondary text-sm mt-1">
                Organize and track your projects
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-card/60 rounded-lg border border-border">
                <span className="text-sm text-textSecondary">View:</span>
                <select className="bg-transparent text-textPrimary text-sm ml-2 focus:outline-none">
                  <option>Grid</option>
                  <option>List</option>
                </select>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent text-white rounded-xl shadow-lg hover:from-primary-600 hover:to-accent/90 transform hover:scale-105 transition-all duration-200 font-medium"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Board</span>
                </div>
              </button>
            </div>
          </div>

          {/* Create Board Form */}
          {showCreateForm && (
            <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border mb-8 animate-slide-down">
              <form onSubmit={createBoard} className="space-y-5">
                <div>
                  <label htmlFor="boardTitle" className="block text-sm font-semibold text-textPrimary mb-2">
                    Board Title
                  </label>
                  <input
                    id="boardTitle"
                    type="text"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 placeholder-textSecondary text-textPrimary"
                    placeholder="Enter board title"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent text-white rounded-xl shadow-md hover:from-primary-600 hover:to-accent/90 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Board"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewBoardTitle("");
                    }}
                    className="px-6 py-3 bg-card/60 backdrop-blur-sm border border-border rounded-xl text-textPrimary hover:text-textPrimary hover:bg-hover transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Boards Grid */}
          {filteredBoards.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-card/40 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-border shadow-lg">
                <div className="text-textSecondary mb-6">
                  {boards.length === 0 ? (
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  ) : (
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-textPrimary mb-3">
                  {boards.length === 0 ? "No boards yet" : "No boards found"}
                </h3>
                <p className="text-textSecondary mb-6">
                  {boards.length === 0 
                    ? "Get started by creating your first Kanban board to organize your tasks and projects."
                    : `No boards match "${searchQuery}". Try adjusting your search or create a new board.`
                  }
                </p>
                {boards.length === 0 ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent text-white rounded-xl shadow-lg hover:from-primary-600 hover:to-accent/90 hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Create Your First Board
                  </button>
                ) : (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent text-white rounded-xl shadow-lg hover:from-primary-600 hover:to-accent/90 hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBoards.map((board, index) => (
                <div
                  key={board._id}
                  className="group bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:bg-hover transition-all duration-300 cursor-pointer transform hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/boards/${board._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-textSecondary group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-textPrimary mb-2 group-hover:text-primary-500 transition-colors">
                    {board.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-textSecondary text-sm flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                    </p>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-textSecondary">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
