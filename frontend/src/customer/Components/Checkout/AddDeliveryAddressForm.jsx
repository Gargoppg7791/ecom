import React, { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  Typography,
  Radio,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../../Redux/Customers/Order/Action";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function AddDeliveryAddressForm({ handleNext }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const { auth } = useSelector((store) => store);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    mobile: "",
  });

  const theme = useTheme();

  const addressCardStyle = {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '12px',
    mb: 2,
    position: 'relative',
    overflow: 'hidden',
  };

  const selectedAddressStyle = {
    ...addressCardStyle,
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      borderWidth: '0 40px 40px 0',
      borderStyle: 'solid',
      borderColor: `${theme.palette.primary.main} transparent`,
    },
  };

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        firstName: "",
        lastName: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        mobile: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
    setFormData({
      firstName: "",
      lastName: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      mobile: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrder = async (address) => {
    setIsLoading(true);
    try {
      await dispatch(createOrder({ address, jwt, navigate }));
      handleNext();
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);
    try {
      await dispatch(createOrder({ address: formData, jwt, navigate }));
      handleCloseDialog();
      handleNext();
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          borderRadius: '16px',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LocalShippingIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Delivery Address
            </Typography>
            <Typography variant="subtitle1">
              Choose where you want your items delivered
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Add New Address Button */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              p: 2, 
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: 'primary.main',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => handleOpenDialog()}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              py: 2,
            }}>
              <AddIcon color="primary" sx={{ fontSize: 30 }} />
              <Typography variant="h6" color="primary">
                Add New Delivery Address
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Saved Addresses Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon />
            Saved Addresses
          </Typography>
          
          {auth.user?.addresses?.map((address, index) => (
            <Card 
              key={address.id}
              sx={selectedAddress?.id === address.id ? selectedAddressStyle : addressCardStyle}
              onClick={() => setSelectedAddress(address)}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <LocationOnIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        {address.firstName} {address.lastName}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      📱 {address.mobile}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
                      {address.streetAddress}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {address.city}, {address.state} {address.zipCode}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'action.selected' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(address);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        sx={{ 
                          bgcolor: 'error.light',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {selectedAddress?.id === address.id && (
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateOrder(address);
                        }}
                        sx={{
                          mt: 'auto',
                          py: 1.5,
                          borderRadius: 2,
                          boxShadow: 2,
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        {isLoading ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            <span>Processing...</span>
                          </Box>
                        ) : (
                          "Deliver Here"
                        )}
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Address Form Dialog - Enhanced */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          py: 2,
        }}>
          <Typography variant="h5" fontWeight="bold">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isFormLoading}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              '&:not(:disabled):hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {isFormLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Processing...</span>
              </Box>
            ) : (
              editingAddress ? "Update Address" : "Add Address"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 