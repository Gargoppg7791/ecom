import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';

const Profile = () => {
  const auth = useSelector((store) => store.auth);
  const [formData, setFormData] = useState({
    firstName: auth?.user?.firstName || '',
    lastName: auth?.user?.lastName || '',
    email: auth?.user?.email || '',
    phone: auth?.user?.phone || '',
    address: auth?.user?.address || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    console.log('Profile update:', formData);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: deepPurple[500],
              fontSize: '2rem',
            }}
            src={auth?.user?.avatar}
          >
            {!auth?.user?.avatar && auth?.user?.firstName?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4" component="h1">
              {auth?.user?.firstName} {auth?.user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Member since {new Date(auth?.user?.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 