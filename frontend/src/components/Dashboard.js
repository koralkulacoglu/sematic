import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [filteredWhiteboards, setFilteredWhiteboards] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load whiteboards from localStorage on component mount
  useEffect(() => {
    const savedWhiteboards = localStorage.getItem('whiteboards');
    let parsed = null;
    if (savedWhiteboards) {
      try {
        parsed = JSON.parse(savedWhiteboards);
      } catch (e) {
        parsed = null;
      }
    }

    // Initialize with professional sample whiteboards for demo when empty/invalid
    const seedIfNeeded = () => {
      const sampleWhiteboards = [
        {
          id: 'wb-1',
          name: 'System Architecture Overview',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-20').toISOString(),
          nodeCount: 12,
          previewImage: 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=System+Architecture',
          category: 'Architecture',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-2',
          name: 'User Journey Mapping',
          createdAt: new Date('2024-01-18').toISOString(),
          updatedAt: new Date('2024-01-22').toISOString(),
          nodeCount: 15,
          previewImage: 'https://via.placeholder.com/300x200/059669/ffffff?text=User+Journey',
          category: 'UX Design',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-3',
          name: 'Database Schema Design',
          createdAt: new Date('2024-01-12').toISOString(),
          updatedAt: new Date('2024-01-19').toISOString(),
          nodeCount: 8,
          previewImage: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Database+Schema',
          category: 'Database',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-4',
          name: 'API Flow Documentation',
          createdAt: new Date('2024-01-10').toISOString(),
          updatedAt: new Date('2024-01-17').toISOString(),
          nodeCount: 10,
          previewImage: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=API+Flow',
          category: 'Documentation',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-5',
          name: 'Marketing Funnel Strategy',
          createdAt: new Date('2024-01-08').toISOString(),
          updatedAt: new Date('2024-01-16').toISOString(),
          nodeCount: 7,
          previewImage: 'https://via.placeholder.com/300x200/ea580c/ffffff?text=Marketing+Funnel',
          category: 'Marketing',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-6',
          name: 'DevOps Pipeline',
          createdAt: new Date('2024-01-14').toISOString(),
          updatedAt: new Date('2024-01-21').toISOString(),
          nodeCount: 9,
          previewImage: 'https://via.placeholder.com/300x200/0891b2/ffffff?text=DevOps+Pipeline',
          category: 'DevOps',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-7',
          name: 'Product Roadmap Q1',
          createdAt: new Date('2024-01-06').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString(),
          nodeCount: 14,
          previewImage: 'https://via.placeholder.com/300x200/be185d/ffffff?text=Product+Roadmap',
          category: 'Planning',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-8',
          name: 'Security Framework',
          createdAt: new Date('2024-01-11').toISOString(),
          updatedAt: new Date('2024-01-18').toISOString(),
          nodeCount: 11,
          previewImage: 'https://via.placeholder.com/300x200/b91c1c/ffffff?text=Security+Framework',
          category: 'Security',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-9',
          name: 'Team Organization Chart',
          createdAt: new Date('2024-01-09').toISOString(),
          updatedAt: new Date('2024-01-16').toISOString(),
          nodeCount: 6,
          previewImage: 'https://via.placeholder.com/300x200/0d9488/ffffff?text=Org+Chart',
          category: 'HR',
          data: { nodes: [], edges: [] }
        },
        {
          id: 'wb-10',
          name: 'Mobile App Wireframes',
          createdAt: new Date('2024-01-13').toISOString(),
          updatedAt: new Date('2024-01-20').toISOString(),
          nodeCount: 13,
          previewImage: 'https://via.placeholder.com/300x200/7c2d12/ffffff?text=Mobile+Wireframes',
          category: 'Design',
          data: { nodes: [], edges: [] }
        }
      ];
      setWhiteboards(sampleWhiteboards);
      setFilteredWhiteboards(sampleWhiteboards);
      localStorage.setItem('whiteboards', JSON.stringify(sampleWhiteboards));
    };

    if (Array.isArray(parsed) && parsed.length > 0) {
      setWhiteboards(parsed);
      setFilteredWhiteboards(parsed);
    } else {
      seedIfNeeded();
    }
  }, []);

  // Save whiteboards to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('whiteboards', JSON.stringify(whiteboards));
  }, [whiteboards]);

  // Filter whiteboards based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWhiteboards(whiteboards);
    } else {
      const filtered = whiteboards.filter(wb => 
        wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wb.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWhiteboards(filtered);
    }
  }, [whiteboards, searchQuery]);

  const handleCreateWhiteboard = () => {
    if (newWhiteboardName.trim()) {
      const newWhiteboard = {
        id: `wb-${Date.now()}`,
        name: newWhiteboardName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodeCount: 0,
        previewImage: 'https://via.placeholder.com/300x200/6b7280/ffffff?text=New+Whiteboard',
        category: 'Personal',
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

  // Manually load sample whiteboards (useful if nothing shows up)
  const handleLoadSamples = () => {
    const samples = [
      {
        id: 'wb-1',
        name: 'System Architecture Overview',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
        nodeCount: 12,
        previewImage: 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=System+Architecture',
        category: 'Architecture',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-2',
        name: 'User Journey Mapping',
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-22').toISOString(),
        nodeCount: 15,
        previewImage: 'https://via.placeholder.com/300x200/059669/ffffff?text=User+Journey',
        category: 'UX Design',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-3',
        name: 'Database Schema Design',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-19').toISOString(),
        nodeCount: 8,
        previewImage: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Database+Schema',
        category: 'Database',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-4',
        name: 'API Flow Documentation',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-17').toISOString(),
        nodeCount: 10,
        previewImage: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=API+Flow',
        category: 'Documentation',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-5',
        name: 'Marketing Funnel Strategy',
        createdAt: new Date('2024-01-08').toISOString(),
        updatedAt: new Date('2024-01-16').toISOString(),
        nodeCount: 7,
        previewImage: 'https://via.placeholder.com/300x200/ea580c/ffffff?text=Marketing+Funnel',
        category: 'Marketing',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-6',
        name: 'DevOps Pipeline',
        createdAt: new Date('2024-01-14').toISOString(),
        updatedAt: new Date('2024-01-21').toISOString(),
        nodeCount: 9,
        previewImage: 'https://via.placeholder.com/300x200/0891b2/ffffff?text=DevOps+Pipeline',
        category: 'DevOps',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-7',
        name: 'Product Roadmap Q1',
        createdAt: new Date('2024-01-06').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
        nodeCount: 14,
        previewImage: 'https://via.placeholder.com/300x200/be185d/ffffff?text=Product+Roadmap',
        category: 'Planning',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-8',
        name: 'Security Framework',
        createdAt: new Date('2024-01-11').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
        nodeCount: 11,
        previewImage: 'https://via.placeholder.com/300x200/b91c1c/ffffff?text=Security+Framework',
        category: 'Security',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-9',
        name: 'Team Organization Chart',
        createdAt: new Date('2024-01-09').toISOString(),
        updatedAt: new Date('2024-01-16').toISOString(),
        nodeCount: 6,
        previewImage: 'https://via.placeholder.com/300x200/0d9488/ffffff?text=Org+Chart',
        category: 'HR',
        data: { nodes: [], edges: [] }
      },
      {
        id: 'wb-10',
        name: 'Mobile App Wireframes',
        createdAt: new Date('2024-01-13').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
        nodeCount: 13,
        previewImage: 'https://via.placeholder.com/300x200/7c2d12/ffffff?text=Mobile+Wireframes',
        category: 'Design',
        data: { nodes: [], edges: [] }
      }
    ];
    setWhiteboards(samples);
    setFilteredWhiteboards(samples);
    localStorage.setItem('whiteboards', JSON.stringify(samples));
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

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">Whiteboards</h1>
            </div>
            <div className="header-actions">
              <button 
                className="create-button"
                onClick={() => setShowCreateModal(true)}
              >
                <svg className="create-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-bar">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search whiteboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Whiteboards Grid */}
        <main className="dashboard-main">
          {filteredWhiteboards.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <div className="empty-icon">🔍</div>
                  <h3>No whiteboards found</h3>
                  <p>Try adjusting your search terms or create a new whiteboard</p>
                </>
              ) : (
                <>
                  <div className="empty-icon">📋</div>
                  <h3>No whiteboards yet</h3>
                  <p>Create your first whiteboard to get started with AI-powered diagramming</p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                      className="create-button"
                      onClick={() => setShowCreateModal(true)}
                    >
                      New
                    </button>
                    <button 
                      className="create-button primary"
                      onClick={handleLoadSamples}
                    >
                      Load sample whiteboards
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="whiteboards-grid">
              {filteredWhiteboards.map((whiteboard) => (
                <div 
                  key={whiteboard.id}
                  className="whiteboard-card"
                  onClick={() => handleOpenWhiteboard(whiteboard.id)}
                >
                  <div className="card-preview">
                    <img 
                      src={whiteboard.previewImage} 
                      alt={whiteboard.name}
                      className="preview-image"
                    />
                    <div className="card-overlay">
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
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{whiteboard.name}</h3>
                    <div className="card-meta">
                      <span className="category-badge">{whiteboard.category}</span>
                      <span className="node-count">{whiteboard.nodeCount} elements</span>
                    </div>
                    <div className="card-footer">
                      <span className="last-updated">
                        {getTimeAgo(whiteboard.updatedAt)}
                      </span>
                    </div>
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
