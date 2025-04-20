import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box } from '@mui/material';
import { Edit as EditIcon, PhotoCamera, DeleteForever } from '@mui/icons-material';
import CategoryImageForm from './CategoryImageForm';
import api from '../../../config/api';
import { getImageUrl } from '../../../utils/imageUtils';

const CategoryCard = ({ category, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageClick = () => {
    setShowImageForm(true);
  };

  const handleImageUpdate = (updatedCategory) => {
    onUpdate(updatedCategory);
    setShowImageForm(false);
  };

  const handleDeleteImage = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/categories/${category.id}/image`);
      onUpdate(response.data);
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={getImageUrl(category.imageUrl)}
          alt={category.name}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
          {category.imageUrl && (
            <IconButton
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: 'error.main'
                },
              }}
              onClick={handleDeleteImage}
              disabled={loading}
            >
              <DeleteForever />
            </IconButton>
          )}
          <IconButton
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            onClick={handleImageClick}
            disabled={loading}
          >
            <PhotoCamera />
          </IconButton>
        </Box>
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {category.name}
        </Typography>
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={() => setIsEditing(true)}>
          <EditIcon />
        </IconButton>
      </Box>
      {showImageForm && (
        <CategoryImageForm
          category={category}
          onUpdate={handleImageUpdate}
        />
      )}
    </Card>
  );
};

export default CategoryCard; 