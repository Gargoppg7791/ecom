import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Stack,
  IconButton,
  Box,
  Divider,
  Paper,
  Tooltip,
} from "@mui/material";

import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import './EditProductModal.css';

const EditProductModal = ({ open, handleClose, product, onSave }) => {
  // Initial State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discountedPrice: "",
    discountPercent: "",
    brand: "",
    category: "",
    color: [],
    sizes: [],
  });

  // Effect Hooks
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        color: product.color?.map(color => ({
          name: color.name,
          photos: Array.isArray(color.photos) ? color.photos : [],
        })) || [],
        sizes: product.sizes || [],
        category: product.category?.name || ""
      });
    }
  }, [product]);

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Size Management
  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: "", quantity: "" }]
    }));
  };

  const handleRemoveSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleSizeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  // Color Management
  const handleAddColor = () => {
    setFormData(prev => ({
      ...prev,
      color: [...prev.color, { name: "", photos: [] }]
    }));
  };

  const handleRemoveColor = (index) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.filter((_, i) => i !== index)
    }));
  };

  const handleColorChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      )
    }));
  };

  const handleDeleteColor = (index) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.filter((_, i) => i !== index)
    }));
  };

  // Photo Management
  const handlePhotoUpload = (colorIndex, files) => {
    console.log('Uploading files:', files);
    setFormData(prev => ({
      ...prev,
      color: prev.color.map((color, i) =>
        i === colorIndex ? {
          ...color,
          photos: [...(color.photos || []), ...Array.from(files)]
        } : color
      )
    }));
  };

  const handleRemovePhoto = (colorIndex, photoIndex) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.map((color, i) =>
        i === colorIndex ? {
          ...color,
          photos: color.photos.filter((_, pI) => pI !== photoIndex)
        } : color
      )
    }));
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Append product ID
    formDataToSend.append('id', product.id);

    // Append basic fields
    Object.keys(formData).forEach(key => {
      if (key !== 'color' && key !== 'sizes' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append colors and photos
    formData.color.forEach((color, index) => {
      formDataToSend.append(`color[${index}][name]`, color.name);
      
      // Append all photos
      if (color.photos) {
        color.photos.forEach((photo, photoIndex) => {
          if (photo instanceof File) {
            formDataToSend.append(`color[${index}][photos][${photoIndex}]`, photo);
          } else {
            formDataToSend.append(`color[${index}][photos][${photoIndex}]`, photo);
          }
        });
      }
    });

    // Append sizes
    formData.sizes.forEach((size, index) => {
      formDataToSend.append(`sizes[${index}][name]`, size.name);
      formDataToSend.append(`sizes[${index}][quantity]`, size.quantity);
    });

    // Log the form data for debugging
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    onSave(formDataToSend);
  };

  // Render Component
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: 'dialog-paper' }}
    >
      <DialogTitle className="dialog-title">
        Edit Product Details
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="dialog-content">
          <Stack spacing={3}>
            {/* Basic Information */}
            <Paper elevation={0} className="paper">
              <Typography variant="h6" className="section-title">
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-field"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    className="form-field"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="form-field"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="form-field"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Pricing */}
            <Paper elevation={0} className="paper">
              <Typography variant="h6" className="section-title">
                Pricing Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: "₹",
                    }}
                    className="form-field"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Discounted Price"
                    name="discountedPrice"
                    type="number"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: "₹",
                    }}
                    className="form-field"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Discount Percentage"
                    name="discountPercent"
                    type="number"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: "%",
                    }}
                    className="form-field"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Sizes */}
            <Paper elevation={0} className="paper">
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" className="section-title">
                  Available Sizes
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddSize}
                  className="add-button"
                >
                  Add Size
                </Button>
              </Stack>
              <Stack spacing={2}>
                {formData.sizes.map((size, index) => (
                  <Box key={index} className="size-item">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        label="Size"
                        value={size.name}
                        onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                        required
                        className="form-field"
                      />
                      <TextField
                        label="Quantity"
                        type="number"
                        value={size.quantity}
                        onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                        required
                        className="form-field"
                      />
                      
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Colors */}
            <Paper elevation={0} className="paper">
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" className="section-title">
                  Color Variants
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddColor}
                  className="add-button"
                >
                  Add Color
                </Button>
              </Stack>
              <Stack spacing={2}>
                {formData.color?.map((color, colorIndex) => (
                  <Box key={colorIndex} className="color-item">
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          fullWidth
                          label="Color Name"
                          value={color.name}
                          onChange={(e) => handleColorChange(colorIndex, 'name', e.target.value)}
                          required
                          className="form-field"
                        />
                        <Button
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          className="upload-button"
                        >
                          Upload Photos
                          <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(colorIndex, e.target.files)}
                          />
                        </Button>
                        {/* <IconButton
                          onClick={() => handleDeleteColorClick(colorIndex)}
                          className="delete-button"
                        >
                          <DeleteIcon />
                        </IconButton> */}
                        <IconButton
                      onClick={() => handleDeleteColor(colorIndex)}
                      className="delete-button"
                      color="error"
                      sx={{ 
                        '&:hover': {
                          backgroundColor: 'error.light',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                      </Stack>

                      {/* Photo Preview */}
                      <Box className="photo-preview">
                        {color.photos?.map((photo, photoIndex) => (
                          <Box key={photoIndex} className="photo-box">
                            <img
                              src={photo instanceof File ? URL.createObjectURL(photo) :
                                photo.startsWith('http') ? photo : `http://localhost:5454/images/${photo}`}
                              alt={`Color ${colorIndex} - Photo ${photoIndex}`}
                              className="photo-image"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemovePhoto(colorIndex, photoIndex)}
                              className="delete-button"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            onClick={handleClose}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="save-button"
          >
            Save Changes
          </Button>
        </DialogActions>
      </form >
    </Dialog >
  );
};

export default EditProductModal;