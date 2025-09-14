import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DiagramApp from '../DiagramApp';
import whiteboardService from '../services/whiteboardService';

function WhiteboardEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const whiteboardId = searchParams.get('id');
  const [whiteboard, setWhiteboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [canUseAI, setCanUseAI] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (whiteboardId) {
      loadWhiteboard();
    } else {
      // Create new whiteboard if no ID provided
      createNewWhiteboard();
    }
  }, [whiteboardId]);

  const loadWhiteboard = async () => {
    try {
      setLoading(true);
      const wb = await whiteboardService.getWhiteboard(whiteboardId);
      if (wb) {
        setWhiteboard(wb);
        const editPermission = await whiteboardService.canUserEdit(whiteboardId);
        const aiPermission = await whiteboardService.canUserUseAI(whiteboardId);
        setCanEdit(editPermission);
        setCanUseAI(aiPermission);
      } else {
        setError('Whiteboard not found');
      }
    } catch (err) {
      console.error('Error loading whiteboard:', err);
      setError('Failed to load whiteboard');
    } finally {
      setLoading(false);
    }
  };

  const createNewWhiteboard = async () => {
    try {
      setLoading(true);
      const newWhiteboard = await whiteboardService.createWhiteboard('Untitled Whiteboard');
      if (newWhiteboard) {
        setWhiteboard(newWhiteboard);
        setCanEdit(true);
        setCanUseAI(true);
        // Update URL to include the new whiteboard ID
        navigate(`/editor?id=${newWhiteboard.id}`, { replace: true });
      } else {
        setError('Failed to create whiteboard');
      }
    } catch (err) {
      console.error('Error creating whiteboard:', err);
      setError('Failed to create whiteboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhiteboard = async (diagramData) => {
    if (!whiteboard || !canEdit) return;
    
    try {
      await whiteboardService.updateWhiteboard(whiteboard.id, {
        data: diagramData
      });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
    }
  };

  const handleRenameWhiteboard = async (newName) => {
    if (!whiteboard || !canEdit) return;
    
    try {
      const updated = await whiteboardService.updateWhiteboard(whiteboard.id, {
        name: newName
      });
      if (updated) {
        setWhiteboard(updated);
      }
    } catch (error) {
      console.error('Error renaming whiteboard:', error);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading whiteboard...</p>
        </div>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <div style={{
        height: '60px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              value={whiteboard?.name || 'Untitled Whiteboard'}
              onChange={(e) => handleRenameWhiteboard(e.target.value)}
              disabled={!canEdit}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                outline: 'none',
                minWidth: '200px'
              }}
              placeholder="Whiteboard name"
            />
            {!canUseAI && (
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                opacity: 0.8
              }}>
                View Only
              </span>
            )}
            {canEdit && !canUseAI && (
              <span style={{
                background: 'rgba(40,167,69,0.8)',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem'
              }}>
                Editor
              </span>
            )}
            {canUseAI && (
              <span style={{
                background: 'rgba(255,193,7,0.8)',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem'
              }}>
                Owner
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            // Clear local authentication
            localStorage.removeItem('isAuthenticated');
            navigate('/');
          }}
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
        <DiagramApp 
          whiteboardId={whiteboard?.id}
          initialData={whiteboard?.data}
          canEdit={canEdit}
          canUseAI={canUseAI}
          onSave={handleSaveWhiteboard}
        />
      </div>
    </div>
  );
}

export default WhiteboardEditor;