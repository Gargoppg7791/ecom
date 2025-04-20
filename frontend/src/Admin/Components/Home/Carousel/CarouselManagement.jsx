import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454/api';

const CarouselManagement = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_BASE_URL}/carousel/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCarouselItems(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      setError('Failed to load carousel items');
      showSnackbar('Error fetching carousel items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate each file
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please select only image files', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Each image size should be less than 5MB', 'error');
        return;
      }
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('jwt');
        try {
          const response = await axios.post(`${API_BASE_URL}/carousel/admin`, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          setCarouselItems(prevItems => [...prevItems, response.data.data]);
          successCount++;
        } catch (error) {
          console.error('Error uploading image:', error);
          failCount++;
        }
      }

      if (successCount > 0) {
        showSnackbar(`Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        showSnackbar(`Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`, 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this carousel item?')) {
      try {
        const token = localStorage.getItem('jwt');
        await axios.delete(`${API_BASE_URL}/carousel/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCarouselItems(prevItems => prevItems.filter(item => item.id !== id));
        showSnackbar('Carousel item deleted successfully');
      } catch (error) {
        console.error('Error deleting carousel item:', error);
        showSnackbar('Failed to delete carousel item', 'error');
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Carousel Management</Typography>
        <Box>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="carousel-image-upload"
            type="file"
            onChange={handleImageUpload}
            disabled={uploading}
            multiple
          />
          <label htmlFor="carousel-image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <AddPhotoIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          </label>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        ) : carouselItems.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No carousel items found</Typography>
          </Grid>
        ) : (
          carouselItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt="Carousel item"
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{item.title}</Typography>
                    <IconButton 
                      onClick={() => handleDelete(item.id)} 
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

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

export default CarouselManagement; 