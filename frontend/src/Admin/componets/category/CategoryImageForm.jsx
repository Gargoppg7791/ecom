import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  IconButton,
  Paper,
  Alert,
  Fade
} from '@mui/material';
import { PhotoCamera, CloudUpload } from '@mui/icons-material';
import api from '../../../config/api';
import { getImageUrl } from '../../../utils/imageUtils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const CategoryImageForm = ({ category, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState(getImageUrl(category.imageUrl));
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Cleanup preview URL when component unmounts
    return () => {
      if (previewUrl && !previewUrl.includes(api.defaults.baseURL)) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    if (!file) return 'Please select an image file';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 5MB';
    return null;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        setPreviewUrl(getImageUrl(category.imageUrl));
        return;
      }

      setError('');
      setSuccess('');
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadResponse = await fetch(`${api.defaults.baseURL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.url) {
        throw new Error('Failed to get image URL from upload response');
      }

      const response = await api.put(`/api/categories/${category.id}/image`, {
        imageUrl: uploadData.url
      });

      onUpdate(response.data);
      setPreviewUrl(getImageUrl(response.data.imageUrl));
      setSelectedFile(null);
      setSuccess('Image uploaded successfully!');
      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          backgroundColor: 'background.default',
          borderRadius: 2
        }}
      >
        {(error || success) && (
          <Fade in={!!(error || success)}>
            <Box mb={2}>
              {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
            </Box>
          </Fade>
        )}

        <Box 
          sx={{ 
            position: 'relative',
            mb: 3,
            '&:hover .upload-overlay': {
              opacity: 1
            }
          }}
        >
          {previewUrl ? (
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: 'grey.100'
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box
                className="upload-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                <label htmlFor={`icon-button-file-${category.id}`}>
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                height: 200,
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'grey.100'
                }
              }}
            >
              <label htmlFor={`icon-button-file-${category.id}`} style={{ cursor: 'pointer' }}>
                <CloudUpload sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Click or drag to upload image
                </Typography>
              </label>
            </Box>
          )}
        </Box>

        <input
          accept={ALLOWED_TYPES.join(',')}
          style={{ display: 'none' }}
          id={`icon-button-file-${category.id}`}
          type="file"
          onChange={handleFileChange}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !selectedFile}
          fullWidth
          sx={{
            py: 1,
            textTransform: 'none',
            position: 'relative'
          }}
        >
          {loading ? (
            <>
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  marginLeft: '-12px'
                }}
              />
              <span style={{ opacity: 0 }}>Upload Image</span>
            </>
          ) : (
            'Upload Image'
          )}
        </Button>
      </Paper>
    </Box>
  );
};

export default CategoryImageForm; 