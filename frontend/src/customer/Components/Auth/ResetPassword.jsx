import * as React from "react";
import { TextField, Button, Box, Snackbar, Alert, Typography, Container, Paper } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../../Redux/Auth/Action";
import { useState } from "react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const dispatch = useDispatch();
  const [newPassword, setNewPassword] = useState("");
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("error");
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await dispatch(resetPassword(token, newPassword));
      console.log("Reset password response:", response); // Debug log
      
      // Check for response.message instead of response.payload
      if (response && response.message) {
        setSnackBarMessage(response.message);
        setSnackBarSeverity("success");
        setOpenSnackBar(true);

        // Force navigation to login page
        setTimeout(() => {
          navigate("/login", { replace: true, state: { openLogin: true } });
        }, 2000);
      } else {
        throw new Error("Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setSnackBarMessage(error.message || "Failed to reset password. Please try again.");
      setSnackBarSeverity("error");
      setOpenSnackBar(true);
    }
};

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Subtract header height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            bgcolor: 'white',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: '#1a237e',
              fontWeight: 600,
              mb: 3
            }}
          >
            Reset Password
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            mb={4} 
            textAlign="center"
          >
            Please enter your new password below.
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              sx={{
                mb: 4,
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  padding: '16px'
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 3,
                bgcolor: '#9155FD',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#804BDF'
                }
              }}
            >
              Reset Password
            </Button>
          </form>
        </Paper>
        <Snackbar 
          open={openSnackBar} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackBar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackBar} 
            severity={snackBarSeverity} 
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {snackBarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}