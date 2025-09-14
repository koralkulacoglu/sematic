import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import WhiteboardEditor from './components/WhiteboardEditor';
import DiagramApp from './DiagramApp';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signedIn':
          setIsLoading(false);
          setError(null);
          break;
        case 'signedOut':
          setIsLoading(false);
          setError(null);
          break;
        case 'tokenRefresh_failure':
          setError('Token refresh failed');
          setIsLoading(false);
          break;
        default:
          break;
      }
    });

    // Initial loading check
    if (authStatus !== 'configuring') {
      setIsLoading(false);
    }

    return unsubscribe;
  }, [authStatus]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'red'
      }}>
        Authentication error: {error}
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/whiteboard/:whiteboardId" 
            element={
              <ProtectedRoute>
                <WhiteboardEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DiagramApp />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
