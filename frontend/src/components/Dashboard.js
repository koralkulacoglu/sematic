import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { 
  Container, AppBar, Toolbar, Typography, Button, TextField, Grid, Card, 
  CardActionArea, CardMedia, CardContent, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, InputAdornment, Chip, Box 
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Delete as DeleteIcon, 
  Save as SaveIcon, Logout as LogoutIcon, FileUpload as FileUploadIcon,
  Sort as SortIcon 
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e53e3e',
      light: '#f87171',
      dark: '#dc2626',
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#374151',
    },
    background: {
      default: '#fefcfc',
      paper: '#ffffff'
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280'
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
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#ef4444',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ef4444',
              boxShadow: 'none',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none',
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&:hover .MuiCardActionArea-focusHighlight': {
            opacity: 0,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: 'none',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          border: '1px solid #f3f4f6',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 25px 60px rgba(220, 38, 38, 0.18), 0 12px 30px rgba(220, 38, 38, 0.12)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
          }
        },
      },
    },
  },
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [filteredWhiteboards, setFilteredWhiteboards] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' or 'name'
  const [sortReverse, setSortReverse] = useState(false);

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

  // Filter and sort whiteboards based on search query and sort option
  useEffect(() => {
    let filtered = whiteboards;
    
    if (searchQuery.trim() !== '') {
      filtered = whiteboards.filter(wb => 
        wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wb.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let result;
      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name);
      } else {
        // Sort by updated date (newest first)
        result = new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      return sortReverse ? -result : result;
    });
    
    setFilteredWhiteboards(sorted);
  }, [whiteboards, searchQuery, sortBy, sortReverse]);

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

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.nodes && data.edges) {
            const newWhiteboard = {
              id: `wb-${Date.now()}`,
              name: file.name.replace(/\.json$/, ''),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              nodeCount: data.nodes.length,
              previewImage: 'https://via.placeholder.com/300x200/6b7280/ffffff?text=Imported',
              category: 'Imported',
              data: data
            };

            const updatedWhiteboards = [newWhiteboard, ...whiteboards];
            setWhiteboards(updatedWhiteboards);
            navigate(`/whiteboard/${newWhiteboard.id}`);
          } else {
            alert('Invalid whiteboard JSON file.');
          }
        } catch (error) {
          alert('Error parsing JSON file.');
        }
      };
      reader.readAsText(file);
    }
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
        backgroundColor: '#fefcfc', 
        minHeight: '100vh', 
        overflowY: 'auto' 
      }}>
        <AppBar position="sticky" elevation={0} sx={{ 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e5e7eb',
          color: '#111827'
        }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <img 
                src="/sematic_2.png" 
                alt="Sematic Logo" 
                style={{ 
                  height: '32px', 
                  width: 'auto', 
                  marginRight: '12px' 
                }} 
              />
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  color: '#374151',
                  fontFamily: '"Inter", "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: '1.5rem'
                }}
              >
                Sematic
              </Typography>
            </Box>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setNewWhiteboardName('');
                setShowCreateModal(true);
              }}
              sx={{
                backgroundColor: '#e53e3e',
                color: 'white',
                fontWeight: 600,
                borderRadius: '12px',
                px: 3,
                '&:hover': {
                  backgroundColor: '#dc2626',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              New
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
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  borderRadius: '12px',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    color: '#ef4444'
                  }
                }}
                component="span"
              >
                Import
              </Button>
            </label>
            <Button 
              startIcon={<LogoutIcon />}
              sx={{ 
                ml: 2,
                color: '#6b7280',
                fontWeight: 600,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151'
                }
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 0, pb: 0, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 1, position: 'relative', zIndex: 10 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  flexGrow: 1,
                  '&:focus-within': {
                    borderColor: '#e5e7eb'
                  }
                }}
              >
                <SearchIcon sx={{ color: '#6b7280', mr: 2 }} />
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
                    color: '#111827',
                    boxShadow: 'none'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = 'none'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={() => setSortBy(sortBy === 'updated' ? 'name' : 'updated')}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    borderRadius: '12px',
                    fontWeight: 600,
                    minWidth: '120px',
                    '&:hover': {
                      borderColor: '#e53e3e',
                      backgroundColor: 'rgba(229, 62, 62, 0.05)',
                      color: '#e53e3e'
                    }
                  }}
                >
                  {sortBy === 'updated' ? 'Updated' : 'Name'}
                </Button>
                <Button
                  variant={sortReverse ? 'contained' : 'outlined'}
                  onClick={() => setSortReverse(!sortReverse)}
                  sx={{
                    borderColor: sortReverse ? '#e53e3e' : '#d1d5db',
                    backgroundColor: sortReverse ? '#e53e3e' : 'transparent',
                    color: sortReverse ? 'white' : '#6b7280',
                    borderRadius: '12px',
                    fontWeight: 600,
                    minWidth: '80px',
                    '&:hover': {
                      borderColor: '#e53e3e',
                      backgroundColor: sortReverse ? '#dc2626' : 'rgba(229, 62, 62, 0.05)',
                      color: sortReverse ? 'white' : '#e53e3e'
                    }
                  }}
                >
                  {sortReverse ? '↓' : '↑'}
                </Button>
              </Box>
            </Box>
          </Box>

          {filteredWhiteboards.length === 0 ? (
            <Box textAlign="center" mt={10}>
              <Typography variant="h5" color="textSecondary" gutterBottom>
                {searchQuery ? 'No whiteboards found 😢' : 'No whiteboards yet'}
              </Typography>
              <Typography color="textSecondary">
                {searchQuery ? 'Typo perhaps? 🤔' : 'Create your first whiteboard to get started.'}
              </Typography>
              {!searchQuery && (
                <Button 
                  variant="outlined" 
                  sx={{
                    mt: 2,
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.05)'
                    }
                  }} 
                  onClick={handleLoadSamples}
                >
                  Load sample whiteboards
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              maxHeight: 'calc(100vh - 200px)',
              pt: 3,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(229, 62, 62, 0.3)',
                borderRadius: '20px',
                border: 'none',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(229, 62, 62, 0.5)',
              }
            }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                justifyItems: 'center',
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '0 16px'
              }}>
                {filteredWhiteboards.map((whiteboard) => (
                  <Card key={whiteboard.id} sx={{ 
                    width: '200px',
                    height: '260px', 
                    display: 'flex', 
                    flexDirection: 'column'
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
                          borderBottom: '2px solid #e5e7eb',
                          objectFit: 'cover',
                          minHeight: '130px',
                          maxHeight: '130px'
                        }}
                      />
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '90px',
                        maxHeight: '90px',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden'
                      }}>
                        <Box>
                          <Typography 
                            gutterBottom 
                            variant="h6" 
                            component="div" 
                            noWrap
                            sx={{ 
                              fontSize: '0.85rem',
                              lineHeight: 1.2,
                              mb: 2
                            }}
                          >
                            {whiteboard.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                          <Box sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            mr: 1
                          }}>
                            👤
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Created by You
                          </Typography>
                        </Box>
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
                ))}
              </Box>
            </Box>
          )}
        </Container>

        <Dialog 
          open={showCreateModal} 
          onClose={() => {
            setNewWhiteboardName('');
            setShowCreateModal(false);
          }}
          PaperProps={{
            sx: {
              borderRadius: '16px'
            }
          }}
        >
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
                  '&.Mui-focused': {
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  },
                  '&.Mui-focused fieldset': { 
                    outline: 'none !important', 
                    boxShadow: 'none !important',
                    borderColor: 'rgba(229, 62, 62, 0.3) !important'
                  },
                  '& fieldset': {
                    border: '1px solid #e0e0e0'
                  },
                  '&:hover fieldset': {
                    border: '1px solid rgba(229, 62, 62, 0.3)'
                  },
                  '& input': {
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  },
                  '& input:focus': {
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  }
                } 
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setNewWhiteboardName('');
                setShowCreateModal(false);
              }}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: 'rgba(107, 114, 128, 0.1)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWhiteboard} 
              disabled={!newWhiteboardName.trim()}
              variant="contained"
              sx={{
                backgroundColor: '#e53e3e',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#dc2626'
                },
                '&:disabled': {
                  backgroundColor: '#d1d5db',
                  color: '#9ca3af'
                }
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
