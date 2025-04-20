import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Rating,
  TextField,
  IconButton,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';

const ReviewModal = ({ open, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    review: '',
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRatingChange = (_, newValue) => {
    console.log("New rating value:", newValue); // Debug log
    setFormData(prev => ({
      ...prev,
      rating: Number(newValue) || 0
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Preview images
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    // Add to form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRemoveImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData); // Debug log
    onSubmit({
      ...formData,
      rating: Number(formData.rating)
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px'
        }
      }}
    >
      <DialogTitle className="bg-[#faf9f8] border-b">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" className="font-medium">Write A Review</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className="bg-[#faf9f8]">
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Box className="space-y-2">
            <Typography variant="subtitle1" className="font-medium">Overall Rating</Typography>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#b87d3b] flex items-center justify-center">
                <span className="text-xl font-semibold text-white">
                  {localStorage.getItem('firstName')?.[0]?.toUpperCase() || localStorage.getItem('email')?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Rating
                    name="rating"
                    value={Number(formData.rating)}
                    onChange={handleRatingChange}
                    size="large"
                    precision={1}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#b87d3b',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#a06c2a',
                      }
                    }}
                  />
                  {formData.rating > 0 && (
                    <Typography variant="body1" className="text-gray-600">
                      ({Number(formData.rating).toFixed(1)} out of 5)
                    </Typography>
                  )}
                </div>
                <Typography variant="body2" className="text-gray-600">
                  {localStorage.getItem('firstName') ? 
                    `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName') || ''}` : 
                    'Anonymous User'}
                </Typography>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#b87d3b] rounded-full transition-all duration-300"
                style={{ width: `${(parseFloat(formData.rating) / 5) * 100}%` }}
              />
            </div>
          </Box>

          <Box className="space-y-2">
            <Typography variant="subtitle1" className="font-medium">Review</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Share your experience with this product..."
              value={formData.review}
              onChange={handleChange('review')}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white'
                }
              }}
            />
          </Box>

          <Box className="space-y-2">
            <Typography variant="subtitle1" className="font-medium">Photos</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#b87d3b] transition-colors">
                <ImageIcon className="text-gray-400 text-4xl mb-2" />
                <Typography variant="body1" color="textSecondary">
                  Drop your images here or click to upload
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  (Maximum 5 images)
                </Typography>
              </div>
            </label>

            {/* Image previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-6 gap-2 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative aspect-square w-16 h-16">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <IconButton
                      size="small"
                      className="absolute -top-1 -right-1 bg-white shadow-md hover:bg-gray-100 w-4 h-4"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </Box>

          <button
            type="submit"
            disabled={loading || !formData.rating || !formData.review}
            className="w-full bg-[#b87d3b] text-white py-3 px-6 rounded hover:bg-[#a06c2a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "SUBMIT REVIEW"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal; 