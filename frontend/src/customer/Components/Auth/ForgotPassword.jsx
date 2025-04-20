import * as React from "react";
import { TextField, Button, Box, Snackbar, Alert, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../../Redux/Auth/Action";
import { useState } from "react";

export default function ForgotPassword(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("error");
  const auth = useSelector((store) => store.auth);
  const handleCloseSnackBar = () => setOpenSnackBar(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await dispatch(forgotPassword(email));
      if (response?.payload) {
        setSnackBarMessage(response.payload);
        setSnackBarSeverity("success");
        setOpenSnackBar(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      // Handle specific error messages
      let errorMessage = "Something went wrong. Please try again.";
      if (error.message.includes("user not found")) {
        errorMessage = "No account found with this email. Please check your email or register.";
      }
      setSnackBarMessage(errorMessage);
      setSnackBarSeverity("error");
      setOpenSnackBar(true);
    }
  };

  const handleBackToLogin = () => {
    if (props.onSwitchToLogin) {
      props.onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  return (
    <Box p={3} display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h5" mb={2}>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      <form className="w-full" onSubmit={handleSubmit}>
        <Box mb={2} display="flex" flexDirection="column" alignItems="center" width="100%">
          <TextField
            required
            id="email"
            name="email"
            label="Email"
            fullWidth
            autoComplete="email"
            margin="normal"
            sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1.2rem', padding: '12px' } }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>
        <Button
          className="bg-[#9155FD] w-full"
          type="submit"
          variant="contained"
          size="large"
          sx={{ padding: ".8rem 0" }}
        >
          Send Reset Link
        </Button>
      </form>
      <Button 
        onClick={handleBackToLogin} 
        sx={{ mt: 2 }}
      >
        Back to Login
      </Button>
      <Snackbar open={openSnackBar} autoHideDuration={6000} onClose={handleCloseSnackBar}>
        <Alert onClose={handleCloseSnackBar} severity={snackBarSeverity} sx={{ width: '100%' }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}