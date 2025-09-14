import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import whiteboardService from '../services/whiteboardService';

function Dashboard() {
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [filteredWhiteboards, setFilteredWhiteboards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState('');

  useEffect(() => {
    loadWhiteboards();
  }, []);

  useEffect(() => {
    // Filter whiteboards based on search term
    const filtered = whiteboards.filter(wb => 
      wb.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWhiteboards(filtered);
  }, [whiteboards, searchTerm]);

  const loadWhiteboards = async () => {
    try {
      setLoading(true);
      const userWhiteboards = await whiteboardService.getUserWhiteboards();
      setWhiteboards(userWhiteboards);
    } catch (error) {
      console.error('Error loading whiteboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWhiteboard = async () => {
    if (!newWhiteboardName.trim()) return;
    
    try {
      const newWhiteboard = await whiteboardService.createWhiteboard(newWhiteboardName);
      if (newWhiteboard) {
        setWhiteboards([...whiteboards, newWhiteboard]);
        setNewWhiteboardName('');
        setShowCreateModal(false);
        navigate(`/editor?id=${newWhiteboard.id}`);
      }
    } catch (error) {
      console.error('Error creating whiteboard:', error);
    }
  };

  const handleOpenWhiteboard = (whiteboardId) => {
    navigate(`/editor?id=${whiteboardId}`);
  };

  const handleDeleteWhiteboard = async (whiteboardId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this whiteboard?')) {
      try {
        const success = await whiteboardService.deleteWhiteboard(whiteboardId);
        if (success) {
          setWhiteboards(whiteboards.filter(wb => wb.id !== whiteboardId));
        }
      } catch (error) {
        console.error('Error deleting whiteboard:', error);
      }
    }
  };

  const handleCreateDiagram = () => {
    setShowCreateModal(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          background: 'white',
          padding: '1.5rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>
              Welcome back, Development User!
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
              Ready to create amazing diagrams?
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              navigate('/');
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search whiteboards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + New Whiteboard
            </button>
          </div>
        </div>

        {/* Whiteboards Grid */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Your Whiteboards</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p style={{ color: '#666', marginTop: '1rem' }}>Loading whiteboards...</p>
            </div>
          ) : filteredWhiteboards.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredWhiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  onClick={() => handleOpenWhiteboard(whiteboard.id)}
                  style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e9ecef',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ color: '#333', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
                      {whiteboard.name}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteWhiteboard(whiteboard.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem'
                      }}
                      title="Delete whiteboard"
                    >
                      ×
                    </button>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                    Owner: {whiteboard.ownerEmail}
                  </p>
                  <p style={{ color: '#999', fontSize: '0.8rem', margin: 0 }}>
                    Last modified: {new Date(whiteboard.updatedAt).toLocaleDateString()}
                  </p>
                  {whiteboard.editors && whiteboard.editors.length > 0 && (
                    <p style={{ color: '#28a745', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>
                      Shared with {whiteboard.editors.length} editor{whiteboard.editors.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>No whiteboards found</h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first whiteboard to get started!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Your First Whiteboard
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          onClick={handleCreateDiagram}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>🎨</div>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Create New Diagram</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Start building your diagram with AI assistance
            </p>
            <button style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </div>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>📊</div>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Recent Diagrams</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Your diagram history will appear here
            </p>
            <button style={{
              background: '#f8f9fa',
              color: '#666',
              border: '1px solid #ddd',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'not-allowed'
            }}
            disabled>
              Coming Soon
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '2rem', textAlign: 'center' }}>
            What You Can Do
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎤</div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Voice Commands</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Speak naturally to create and modify your diagrams
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Real-time Updates</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Watch your diagrams update instantly as you speak
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💾</div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Export & Share</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Export your diagrams in multiple formats
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>AI-Powered</h4>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Advanced AI understands your requirements perfectly
              </p>
            </div>
          </div>
        </div>

        {/* Create Whiteboard Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Create New Whiteboard</h3>
              <input
                type="text"
                placeholder="Enter whiteboard name..."
                value={newWhiteboardName}
                onChange={(e) => setNewWhiteboardName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateWhiteboard()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '1.5rem'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWhiteboardName('');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWhiteboard}
                  disabled={!newWhiteboardName.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: newWhiteboardName.trim() ? '#667eea' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newWhiteboardName.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;