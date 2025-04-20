import * as React from "react";
import { Box, Typography, Container, Paper, CircularProgress, Button, Snackbar, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../Redux/Auth/Action";
import { useState, useEffect } from "react";
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { toast } from 'react-hot-toast';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const { token } = useParams();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('checking');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        } else {
            setStatus('error');
            setMessage('Invalid verification link');
            setTimeout(() => navigate('/'), 2000);
        }
    }, [token, navigate]);

    const verifyEmail = async (token) => {
        try {
            console.log("Verifying email with token:", token);
            const response = await axios.get(`${API_BASE_URL}/auth/verify/${token}`);
            console.log("Verification response:", response.data);
            
            if (response.data.success) {
                // Store user data and JWT
                localStorage.setItem("jwt", response.data.jwt);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                
                // Update Redux store with user data
                dispatch(loginSuccess(response.data.user));
                
                setStatus('success');
                setMessage('Email verified successfully! Welcome to our platform.');
                
                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
            setTimeout(() => {
                navigate('/register', { replace: true });
            }, 2000);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        Email Verification
                    </Typography>

                    {status === 'checking' && (
                        <>
                            <CircularProgress sx={{ my: 2 }} />
                            <Typography>
                                Verifying your email...
                            </Typography>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <Typography variant="h6" color="success.main" sx={{ my: 2 }}>
                                Verification Successful!
                            </Typography>
                            <Typography>
                                {message}
                            </Typography>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <Typography variant="h6" color="error" sx={{ my: 2 }}>
                                Verification Failed
                            </Typography>
                            <Typography>
                                {message}
                            </Typography>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}