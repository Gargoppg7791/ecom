import * as React from "react";
import { TextField, Button, Box, Snackbar, Alert, Typography, CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, googleLogin, getUser, verifyEmail } from "../../../Redux/Auth/Action";
import { useEffect, useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { toast } from "react-hot-toast";

export default function RegisterUserForm(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const auth = useSelector((store) => store.auth);
  const handleCloseSnakbar = () => setOpenSnackBar(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const [registrationStatus, setRegistrationStatus] = useState('idle'); // 'idle' | 'submitting' | 'verification_sent' | 'verified'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (jwt) {
      dispatch(getUser(jwt));
    }
  }, [jwt, dispatch]);

  useEffect(() => {
    if (auth.user || auth.error) setOpenSnackBar(true);
  }, [auth]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyUserEmail(token);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userData = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      password: data.get("password"),
    };
    
    setIsLoading(true);
    setRegistrationStatus('submitting');
    
    try {
      const response = await dispatch(register(userData));
      if (response && response.payload) {
        localStorage.setItem('userEmail', userData.email);
        setRegistrationStatus('verification_sent');
        setVerificationMessage(
          "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
        );
        toast.success("We have sent a verification link! Please check your email for verification.");
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      setRegistrationStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = (response) => {
    console.log("Google Login Success", response);
    const token = response.credential;
    dispatch(googleLogin(token));
  };

  const handleGoogleLoginFailure = () => {
    console.log("Google Login Failed");
    setOpenSnackBar(true);
  };

  const verifyUserEmail = async (token) => {
    setIsLoading(true);
    try {
      const response = await dispatch(verifyEmail(token));
      if (response.payload) {
        setRegistrationStatus('verified');
        toast.success('Email verified successfully!');
        // Wait for 2 seconds to show success message
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/');
      }
    } catch (error) {
      toast.error('Email verification failed. Please try again.');
      navigate('/register');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth.user) {
      navigate('/');
    }
  }, [auth.user, navigate]);

  const handleLoginClick = () => {
    if (props.onSwitchToLogin) {
      props.onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  const handleForgotPasswordClick = () => {
    if (props.onSwitchToForgotPassword) {
      props.onSwitchToForgotPassword();
    } else {
      navigate('/forgot-password');
    }
  };

  return (
    <Box p={3} display="flex" flexDirection="column" alignItems="center">
      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress />
          <Typography variant="h6" textAlign="center">
            {registrationStatus === 'submitting' ? 'Registering your account...' : 'Verifying your email...'}
          </Typography>
        </Box>
      ) : registrationStatus === 'verification_sent' ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h5" textAlign="center">
            Check Your Email
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary">
            {verificationMessage}
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Didn't receive the email? Check your spam folder or
          </Typography>
          <Button 
            onClick={() => setRegistrationStatus('idle')} 
            variant="outlined" 
            color="primary"
          >
            Try Again
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h5" mb={2}>
            Register Your Account
          </Typography>
          <form className="w-full" onSubmit={handleSubmit}>
            <Box mb={2} display="flex" flexDirection="column" alignItems="center" width="100%">
              <TextField
                required
                id="firstName"
                name="firstName"
                label="First Name"
                fullWidth
                autoComplete="given-name"
                margin="normal"
                sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1.2rem', padding: '12px' } }}
              />
              <TextField
                required
                id="lastName"
                name="lastName"
                label="Last Name"
                fullWidth
                autoComplete="family-name"
                margin="normal"
                sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1.2rem', padding: '12px' } }}
              />
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
                autoComplete="new-password"
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
              Register
            </Button>
          </form>
          <Box display="flex" alignItems="center" mt={2}>
            <Typography variant="body2">Already have an account?</Typography>
            <Button 
              onClick={handleLoginClick}
              size="small" 
              sx={{ ml: 1, textTransform: 'none' }}
            >
              Login
            </Button>
          </Box>
          <Box display="flex" alignItems="center" mt={2}>
            <Button 
              onClick={handleForgotPasswordClick}
              size="small" 
              sx={{ ml: 1, textTransform: 'none' }}
            >
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
        </>
      )}
      <Snackbar open={openSnackBar} autoHideDuration={6000} onClose={handleCloseSnakbar}>
        <Alert onClose={handleCloseSnakbar} severity={auth.error ? "error" : "info"} sx={{ width: '100%' }}>
          {auth.error ? auth.error : verificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}