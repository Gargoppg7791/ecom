import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Filter for top-level categories (level 1)
      const topLevelCategories = Array.isArray(response.data) 
        ? response.data.filter(category => category.level === 1)
        : [];
      setCategories(topLevelCategories);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      showSnackbar('Error fetching categories', 'error');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (category) => {
    setEditCategory(category);
    setFormData(category);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCategory(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwt');
      await axios.put(`${API_BASE_URL}/categories/${editCategory.id || editCategory._id}`, {
        name: formData.name
      }, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      showSnackbar('Category updated successfully');
      handleClose();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('Error saving category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('jwt');
        await axios.delete(`${API_BASE_URL}/categories/${id}`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        showSnackbar('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        showSnackbar('Error deleting category', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleImageUpload = async (event, categoryId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('jwt');
      const response = await axios.post(`${API_BASE_URL}/categories/${categoryId}/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update only the specific category in the state
      setCategories(prevCategories => 
        prevCategories.map(category => 
          (category.id || category._id) === categoryId 
            ? { ...category, imageUrl: response.data.imageUrl }
            : category
        )
      );

      showSnackbar('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Category Management</Typography>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography>Loading...</Typography>
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        ) : categories.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No categories found</Typography>
          </Grid>
        ) : (
          categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id || category._id || Math.random()}>
              <Card>
                <CardContent>
                  <Box sx={{ position: 'relative', mb: 2, height: 140, overflow: 'hidden' }}>
                    {category.imageUrl ? (
                      <img 
                        src={`http://localhost:5454${category.imageUrl}`} 
                        alt={category.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('Image load error:', e.target.src);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}
                      >
                        <Typography color="text.secondary">No Image</Typography>
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`image-upload-${category.id || category._id}`}
                        type="file"
                        onChange={(e) => handleImageUpload(e, category.id || category._id)}
                        disabled={uploading}
                      />
                      <label htmlFor={`image-upload-${category.id || category._id}`}>
                        <IconButton
                          component="span"
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                          }}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <CircularProgress size={24} />
                          ) : (
                            <AddPhotoIcon />
                          )}
                        </IconButton>
                      </label>
                    </Box>
                  </Box>
                  <Typography variant="h6" noWrap>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {category.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={() => handleOpen(category)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id || category._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Category
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement; 