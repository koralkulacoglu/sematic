import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleSignIn = () => {
    setShowAuth(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, just navigate to dashboard
    // In a real app, this would authenticate with AWS Amplify
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
  };

  if (showAuth) {
    return (
      <div className="landing-page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ color: '#333', marginBottom: '2rem', textAlign: 'center' }}>Sign In</h2>
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Email:</label>
                <input 
                  type="email" 
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Password:</label>
                <input 
                  type="password" 
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setShowAuth(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'transparent',
                  color: '#667eea',
                  border: '1px solid #667eea',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">AI-Powered Diagram Builder</h1>
          <p className="hero-subtitle">
            Create beautiful diagrams with natural language and voice commands.
            Let AI transform your ideas into visual representations instantly.
          </p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="cta-secondary" onClick={handleSignIn}>
              Sign In
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="diagram-preview">
            <div className="preview-node">Start Here</div>
            <div className="preview-arrow">→</div>
            <div className="preview-node">AI Processing</div>
            <div className="preview-arrow">→</div>
            <div className="preview-node">Beautiful Diagram</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose Our Diagram Builder?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🎤 Voice Commands</h3>
              <p>Speak naturally to create and modify diagrams. No complex syntax required.</p>
            </div>
            <div className="feature-card">
              <h3>🤖 AI-Powered</h3>
              <p>Advanced AI understands your intent and creates professional diagrams automatically.</p>
            </div>
            <div className="feature-card">
              <h3>📱 Real-time Editing</h3>
              <p>See your diagrams update in real-time as you speak or type your requirements.</p>
            </div>
            <div className="feature-card">
              <h3>💾 Export Options</h3>
              <p>Export your diagrams in multiple formats for presentations and documentation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;