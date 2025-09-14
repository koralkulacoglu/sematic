import React from 'react';
import { useNavigate } from 'react-router-dom';
import DiagramApp from '../DiagramApp';

function WhiteboardEditor() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <div style={{
        height: '50px',
        background: '#667eea',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 1001
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Dashboard
          </button>
          <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Diagram Editor
          </span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Diagram App */}
      <div style={{ flex: 1 }}>
        <DiagramApp />
      </div>
    </div>
  );
}

export default WhiteboardEditor;