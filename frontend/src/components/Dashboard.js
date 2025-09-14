import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { 
  Container, AppBar, Toolbar, Typography, Button, TextField, Grid, Card, 
  CardActionArea, CardMedia, CardContent, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, InputAdornment, Chip, Box 
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Delete as DeleteIcon, 
  Save as SaveIcon, Logout as LogoutIcon, FileUpload as FileUploadIcon 
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e53e3e',
      light: '#fc8181',
      dark: '#c53030',
    },
    secondary: {
      main: '#ffffff',
      light: '#f7fafc',
      dark: '#edf2f7',
    },
    background: {
      default: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
      paper: '#ffffff'
    },
    error: {
      main: '#e53e3e',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e53e3e',
          },
          backgroundColor: 'white',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          '& fieldset': {
            border: 'none',
            outline: 'none',
          },
          '&:hover fieldset': {
            border: 'none',
            outline: 'none',
          },
          '&.Mui-focused fieldset': {
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          },
          '&:hover': {
            backgroundColor: 'white',
            outline: 'none',
            boxShadow: 'none',
          },
          '&.Mui-focused': {
            backgroundColor: 'white',
            outline: 'none',
            boxShadow: 'none',
          },
          '& input': {
            outline: 'none',
            boxShadow: 'none',
            '&:focus': {
              outline: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
              outline: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
            },
            '&:hover': {
              backgroundColor: 'white',
              outline: 'none',
              boxShadow: 'none',
            },
            '&.Mui-focused': {
              backgroundColor: 'white',
              outline: 'none',
              boxShadow: 'none',
            },
            '& input': {
              outline: 'none',
              boxShadow: 'none',
              '&:focus': {
                outline: 'none',
                boxShadow: 'none',
              }
            }
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 6px 20px rgba(229, 62, 62, 0.15)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          border: '2px solid transparent',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 16px 32px rgba(229, 62, 62, 0.25)',
            border: '2px solid #fc8181',
          }
        },
      },
    },
  },
});
import { signOut } from 'aws-amplify/auth';
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

    return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        flexGrow: 1, 
        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 50%, #fbb6ce 100%)', 
        minHeight: '100vh', 
        overflowY: 'auto' 
      }}>
        <AppBar position="sticky" color="default" elevation={0} sx={{ 
          background: 'linear-gradient(90deg, #e53e3e 0%, #fc8181 100%)', 
          backdropFilter: 'blur(10px)' 
        }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
              🎨 Whiteboards
            </Typography>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
              sx={{
                backgroundColor: 'white',
                color: '#e53e3e',
                fontWeight: 600,
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  backgroundColor: '#f7fafc',
                  transform: 'scale(1.05)'
                }
              }}
            >
              ✨ New
            </Button>
            <input
              type="file"
              id="import-file"
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImport}
            />
            <label htmlFor="import-file">
              <Button 
                variant="outlined"
                startIcon={<FileUploadIcon />}
                sx={{ 
                  ml: 2,
                  borderColor: 'white',
                  color: 'white',
                  borderRadius: '25px',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#f7fafc',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.05)'
                  }
                }}
                component="span"
              >
                📁 Import
              </Button>
            </label>
            <Button 
              startIcon={<LogoutIcon />}
              sx={{ 
                ml: 2,
                color: 'white',
                fontWeight: 600,
                borderRadius: '25px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)'
                }
              }}
              onClick={handleLogout}
            >
              👋 Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 4, position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '50px',
                padding: '12px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: 'none',
                outline: 'none',
                '&:focus-within': {
                  boxShadow: '0 4px 20px rgba(229, 62, 62, 0.2)',
                  outline: 'none',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <SearchIcon sx={{ color: '#e53e3e', mr: 2 }} />
              <input
                type="text"
                placeholder="Search whiteboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '16px',
                  fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
                  width: '100%',
                  color: '#333',
                  '::placeholder': {
                    color: '#9e9e9e'
                  }
                }}
              />
            </Box>
          </Box>

          {filteredWhiteboards.length === 0 ? (
            <Box textAlign="center" mt={10}>
              <Typography variant="h5" color="textSecondary" gutterBottom>
                {searchQuery ? 'No whiteboards found' : 'No whiteboards yet'}
              </Typography>
              <Typography color="textSecondary">
                {searchQuery ? 'Try adjusting your search terms.' : 'Create your first whiteboard to get started.'}
              </Typography>
              {!searchQuery && (
                <Button variant="outlined" sx={{mt: 2}} onClick={handleLoadSamples}>Load sample whiteboards</Button>
              )}
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
              <Grid container spacing={4}>
                {filteredWhiteboards.map((whiteboard) => (
                <Grid item key={whiteboard.id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ 
                    width: '100%',
                    height: '340px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    minHeight: '340px',
                    maxHeight: '340px',
                    minWidth: '280px',
                    maxWidth: '280px'
                  }}>
                    <CardActionArea onClick={() => handleOpenWhiteboard(whiteboard.id)} sx={{ 
                      height: '100%',
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={whiteboard.previewImage}
                        alt={whiteboard.name}
                        sx={{ 
                          borderBottom: '3px solid #fc8181',
                          objectFit: 'cover',
                          minHeight: '180px',
                          maxHeight: '180px'
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '120px',
                        maxHeight: '120px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)',
                        overflow: 'hidden'
                      }}>
                        <Box>
                          <Typography 
                            gutterBottom 
                            variant="h6" 
                            component="div" 
                            noWrap
                            sx={{ 
                              fontSize: '1rem',
                              lineHeight: 1.2,
                              mb: 1
                            }}
                          >
                            {whiteboard.name}
                          </Typography>
                          <Chip 
                            label={whiteboard.category} 
                            size="small" 
                            sx={{ 
                              mb: 1, 
                              fontWeight: 600, 
                              fontSize: '0.75rem',
                              backgroundColor: '#fed7d7',
                              color: '#c53030',
                              border: '1px solid #fc8181'
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                          {whiteboard.nodeCount} elements
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <Box sx={{ p: 1, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Updated {getTimeAgo(whiteboard.updatedAt)}
                      </Typography>
                      <IconButton size="small" onClick={(e) => handleDeleteWhiteboard(whiteboard.id, e)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>

        <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <DialogTitle>Create New Whiteboard</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              placeholder="Enter whiteboard name..."
              type="text"
              fullWidth
              variant="outlined"
              value={newWhiteboardName}
              onChange={(e) => setNewWhiteboardName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newWhiteboardName.trim()) {
                  handleCreateWhiteboard();
                }
              }}
              sx={{ 
                mt: 2, 
                '& .MuiOutlinedInput-root': { 
                  '&.Mui-focused fieldset': { 
                    outline: 'none', 
                    boxShadow: 'none',
                    border: 'none'
                  },
                  '& fieldset': {
                    border: '1px solid #e0e0e0'
                  },
                  '&:hover fieldset': {
                    border: '1px solid #e53e3e'
                  }
                } 
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateWhiteboard} disabled={!newWhiteboardName.trim()}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
