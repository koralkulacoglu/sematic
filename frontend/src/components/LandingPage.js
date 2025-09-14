import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator, Authenticator } from '@aws-amplify/ui-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [showAuth, setShowAuth] = React.useState(false);

  React.useEffect(() => {
    // Only redirect if user just completed authentication (check for recent sign-in)
    if (authStatus === 'authenticated' && showAuth) {
      navigate('/dashboard');
    }
  }, [authStatus, navigate, showAuth]);

  const handleGetStarted = () => {
    if (authStatus === 'authenticated') {
      navigate('/dashboard');
    } else {
      setShowAuth(true);
    }
  };

  const handleLogin = () => {
    setShowAuth(true);
  };

  if (showAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Authenticator 
            hideSignUp={false}
            components={{
              Header() {
                return (
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2>Welcome to Diagram Builder</h2>
                    <button 
                      onClick={() => setShowAuth(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ← Back to Home
                    </button>
                  </div>
                );
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          marginBottom: '40px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Diagram Builder
          </div>
          <button 
            className="login-button"
            onClick={authStatus === 'authenticated' ? () => navigate('/dashboard') : handleLogin}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {authStatus === 'authenticated' ? 'Go to Dashboard' : 'Login'}
          </button>
        </header>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              AI-Powered
              <span className="gradient-text"> Diagram Builder</span>
            </h1>
            <p className="hero-description">
              Create beautiful, interactive diagrams with the power of AI. 
              Simply describe what you want, and watch your ideas come to life 
              in real-time with intelligent node and edge generation.
            </p>
            <div className="hero-buttons">
              <button className="primary-button" onClick={handleGetStarted}>
                Start Building
                <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="diagram-preview">
              <div className="preview-node node-1">
                <div className="node-content">
                  <div className="node-icon">📊</div>
                  <span>Data Source</span>
                </div>
              </div>
              <div className="preview-node node-2">
                <div className="node-content">
                  <div className="node-icon">⚙️</div>
                  <span>Processing</span>
                </div>
              </div>
              <div className="preview-node node-3">
                <div className="node-content">
                  <div className="node-icon">📈</div>
                  <span>Analytics</span>
                </div>
              </div>
              <div className="preview-node node-4">
                <div className="node-content">
                  <div className="node-icon">🎯</div>
                  <span>Output</span>
                </div>
              </div>
              <svg className="preview-edges" viewBox="0 0 400 300">
                <path d="M100 100 Q200 50 300 100" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M300 100 Q350 150 300 200" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M200 200 Q250 150 300 200" stroke="#6366f1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">Why Choose Our Diagram Builder?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Generation</h3>
              <p>Describe your diagram in natural language and let AI create the perfect visualization for you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Updates</h3>
              <p>See your diagrams update instantly as you refine your ideas with streaming AI responses.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Interactive Design</h3>
              <p>Drag, drop, and customize your diagrams with an intuitive interface built for creators.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <h3>Easy Export</h3>
              <p>Export your diagrams in multiple formats and integrate them into your workflow seamlessly.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Build Amazing Diagrams?</h2>
            <p>Join thousands of users who are already creating stunning visualizations with AI assistance.</p>
            <button className="primary-button large" onClick={handleGetStarted}>
              Get Started Now
              <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
