import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [whiteboards, setWhiteboards] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState('');

  // Load whiteboards from localStorage on component mount
  useEffect(() => {
    const savedWhiteboards = localStorage.getItem('whiteboards');
    if (savedWhiteboards) {
      setWhiteboards(JSON.parse(savedWhiteboards));
    } else {
      // Initialize with some sample whiteboards for demo
      const sampleWhiteboards = [
        {
          id: 'wb-1',
          name: 'Project Architecture',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-20').toISOString(),
          nodeCount: 8,
          thumbnail: '🏗️',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-2',
          name: 'User Flow Diagram',
          createdAt: new Date('2024-01-10').toISOString(),
          updatedAt: new Date('2024-01-18').toISOString(),
          nodeCount: 12,
          thumbnail: '👤',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-3',
          name: 'Database Schema',
          createdAt: new Date('2024-01-05').toISOString(),
          updatedAt: new Date('2024-01-16').toISOString(),
          nodeCount: 6,
          thumbnail: '🗄️',
          data: { nodes: [], edges: [] }
        }
      ];
      setWhiteboards(sampleWhiteboards);
      localStorage.setItem('whiteboards', JSON.stringify(sampleWhiteboards));
    }
  }, []);

  // Save whiteboards to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('whiteboards', JSON.stringify(whiteboards));
  }, [whiteboards]);

  const handleCreateWhiteboard = () => {
    if (newWhiteboardName.trim()) {
      const newWhiteboard = {
        id: `wb-${Date.now()}`,
        name: newWhiteboardName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodeCount: 0,
        thumbnail: '📋',
        data: { nodes: [], edges: [] }
      };
      
      setWhiteboards(prev => [newWhiteboard, ...prev]);
      setNewWhiteboardName('');
      setShowCreateModal(false);
      
      // Navigate to the new whiteboard
      navigate(`/whiteboard/${newWhiteboard.id}`);
    }
  };

  const handleOpenWhiteboard = (whiteboardId) => {
    navigate(`/whiteboard/${whiteboardId}`);
  };

  const handleDeleteWhiteboard = (whiteboardId, e) => {
    e.stopPropagation(); // Prevent opening the whiteboard
    if (window.confirm('Are you sure you want to delete this whiteboard?')) {
      setWhiteboards(prev => prev.filter(wb => wb.id !== whiteboardId));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return formatDate(dateString);
  };

  const handleLogout = () => {
    auth.removeUser();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">My Whiteboards</h1>
              <p className="dashboard-subtitle">
                Create and manage your AI-powered diagrams
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="create-button"
                onClick={() => setShowCreateModal(true)}
              >
                <svg className="create-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Whiteboard
              </button>
              <button 
                className="logout-button"
                onClick={handleLogout}
                style={{
                  marginLeft: '12px',
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Whiteboards Grid */}
        <main className="dashboard-main">
          {whiteboards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No whiteboards yet</h3>
              <p>Create your first whiteboard to get started with AI-powered diagramming</p>
              <button 
                className="create-button primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Whiteboard
              </button>
            </div>
          ) : (
            <div className="whiteboards-grid">
              {whiteboards.map((whiteboard) => (
                <div 
                  key={whiteboard.id}
                  className="whiteboard-card"
                  onClick={() => handleOpenWhiteboard(whiteboard.id)}
                >
                  <div className="card-header">
                    <div className="card-thumbnail">{whiteboard.thumbnail}</div>
                    <button 
                      className="delete-button"
                      onClick={(e) => handleDeleteWhiteboard(whiteboard.id, e)}
                      title="Delete whiteboard"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{whiteboard.name}</h3>
                    <div className="card-meta">
                      <span className="node-count">
                        <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                        </svg>
                        {whiteboard.nodeCount} nodes
                      </span>
                      <span className="last-updated">
                        Updated {getTimeAgo(whiteboard.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="created-date">
                      Created {formatDate(whiteboard.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Whiteboard</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="whiteboard-name">Whiteboard Name</label>
                <input
                  id="whiteboard-name"
                  type="text"
                  value={newWhiteboardName}
                  onChange={(e) => setNewWhiteboardName(e.target.value)}
                  placeholder="Enter whiteboard name..."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateWhiteboard();
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="button secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="button primary"
                onClick={handleCreateWhiteboard}
                disabled={!newWhiteboardName.trim()}
              >
                Create Whiteboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
