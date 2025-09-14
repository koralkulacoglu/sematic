import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './amplify-config'; // Initialize Amplify

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import WhiteboardEditor from './components/WhiteboardEditor';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public route - Landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <WhiteboardEditor />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
