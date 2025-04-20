import * as React from "react";
import { TextField, Button, Box, Snackbar, Alert, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, login, googleLogin } from "../../../Redux/Auth/Action";
import { useEffect, useState } from "react";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginUserForm({ onSwitchToRegister, onSwitchToForgotPassword }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("error");
  const auth = useSelector((store) => store.auth);
  const handleCloseSnakbar = () => setOpenSnackBar(false);

  useEffect(() => {
    if (jwt) {
      dispatch(getUser(jwt));
    }
  }, [jwt, dispatch]);

  useEffect(() => {
    if (auth.user) {
      const redirectPath = localStorage.getItem('redirectPath') || '/';
      localStorage.removeItem('redirectPath');
      navigate(redirectPath);
    }
  }, [auth.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const userData = {
      email: data.get("email"),
      password: data.get("password"),
    }
    try {
      const response = await dispatch(login(userData));
      if (response?.jwt) {
        setSnackBarSeverity("success");
        setSnackBarMessage("Login successful!");
        setOpenSnackBar(true);
        navigate("/");
      }
    } catch (error) {
      setSnackBarSeverity("error");
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setSnackBarMessage("Incorrect email or password. Please try again.");
            break;
          case 404:
            setSnackBarMessage("Account not found. Please check your email or register.");
            break;
          case 403:
            setSnackBarMessage("Your account is not verified. Please check your email for verification link.");
            break;
          default:
            setSnackBarMessage("Login failed. Please try again later.");
        }
      } else if (error.message) {
        setSnackBarMessage(error.message);
      } else {
        setSnackBarMessage("Something went wrong. Please try again.");
      }
      setOpenSnackBar(true);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const result = await dispatch(googleLogin(response.credential));
      if (result?.jwt) {
        setSnackBarMessage("Google login successful!");
        setOpenSnackBar(true);
        navigate("/");
      }
    } catch (error) {
      setSnackBarMessage(error.message || "Google login failed");
      setOpenSnackBar(true);
    }
  };

  const handleGoogleLoginFailure = () => {
    setSnackBarMessage("Google Login Failed");
    setOpenSnackBar(true);
  };

  const handleRegisterClick = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate("/register");
    }
  };

  const handleForgotPasswordClick = () => {
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    } else {
      navigate("/forgot-password");
    }
  };

  return (
    <Box p={3} display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h5" mb={2}>
        Login to Your Account
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
          />
          <TextField
            required
            id="password"
            name="password"
            label="Password"
            fullWidth
            autoComplete="current-password"
            type="password"
            margin="normal"
            sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1.2rem', padding: '12px' } }}
          />
        </Box>
        <Button
          className="bg-[#9155FD] w-full"
          type="submit"
          variant="contained"
          size="large"
          sx={{ padding: ".8rem 0" }}
        >
          Login
        </Button>
      </form>
      <Box display="flex" alignItems="center" mt={2}>
        <Typography variant="body2">If you don't have an account?</Typography>
        <Button onClick={handleRegisterClick} size="small" className="ml-5">
          Register
        </Button>
      </Box>

      <Box display="flex" alignItems="center" mt={2}>
        <Button onClick={handleForgotPasswordClick} size="small" className="ml-5">
          Forgot Password?
        </Button>
      </Box>

      <Typography mt={2} textAlign="center">
        Or
      </Typography>
      <Typography fontWeight="bold" textAlign="center">
        Continue with
      </Typography>

      <Box mt={2}>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginFailure}
          useOneTap={false}
          theme="outline"
          size="large"
          width="300"
          shape="rectangular"
        />
      </Box>

      <Snackbar 
        open={openSnackBar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnakbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnakbar} 
          severity={snackBarSeverity}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
          elevation={6}
          variant="filled"
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}