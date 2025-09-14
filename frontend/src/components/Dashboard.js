import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleCreateDiagram = () => {
    navigate('/editor');
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
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
              Welcome back, User!
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
              Ready to create amazing diagrams?
            </p>
          </div>
          <button
            onClick={handleSignOut}
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
      </div>
    </div>
  );
}

export default Dashboard;