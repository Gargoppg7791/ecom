import React, { useState, useEffect } from "react";
import { Modal, Box, Alert } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginUserForm from "./Login";
import RegisterUserForm from "./Register";
import ForgotPassword from "./ForgotPassword";
import { useLocation } from "react-router-dom";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    maxWidth: "90%"
};

const AuthModal = ({ open, handleClose, type = 'register' }) => {
    const [currentType, setCurrentType] = useState(type);
    const [googleError, setGoogleError] = useState(null);
    const location = useLocation();

    // Update currentType when type prop changes
    useEffect(() => {
        console.log("Modal type changed:", type);
        setCurrentType(type);
    }, [type]);

    // Debug log for open state
    useEffect(() => {
        console.log("Modal open state:", open);
    }, [open]);

    const handleSwitchToLogin = () => {
        setCurrentType('login');
        setGoogleError(null);
    };

    const handleSwitchToRegister = () => {
        setCurrentType('register');
        setGoogleError(null);
    };

    const handleSwitchToForgotPassword = () => {
        setCurrentType('forgot');
        setGoogleError(null);
    };

    const handleGoogleError = (error) => {
        console.error("Google Sign-In error:", error);
        setGoogleError("Google Sign-In is currently unavailable. Please use email login instead.");
    };

    // Get Google Client ID from environment variables
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <Modal 
            open={open} 
            onClose={handleClose}
            aria-labelledby="auth-modal"
            aria-describedby="authentication-modal"
        >
            <Box sx={style}>
                {googleError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {googleError}
                    </Alert>
                )}
                
                {googleClientId ? (
                    <GoogleOAuthProvider 
                        clientId={googleClientId}
                        onError={handleGoogleError}
                        auto_select={false}
                        cancel_on_tap_outside={true}
                        context="signin"
                    >
                        {currentType === 'login' && (
                            <LoginUserForm 
                                onSwitchToRegister={handleSwitchToRegister}
                                onSwitchToForgotPassword={handleSwitchToForgotPassword}
                            />
                        )}
                        {currentType === 'register' && (
                            <RegisterUserForm 
                                onSwitchToLogin={handleSwitchToLogin}
                                onSwitchToForgotPassword={handleSwitchToForgotPassword}
                            />
                        )}
                        {currentType === 'forgot' && (
                            <ForgotPassword 
                                onSwitchToLogin={handleSwitchToLogin}
                            />
                        )}
                    </GoogleOAuthProvider>
                ) : (
                    <>
                        {currentType === 'login' && (
                            <LoginUserForm 
                                onSwitchToRegister={handleSwitchToRegister}
                                onSwitchToForgotPassword={handleSwitchToForgotPassword}
                            />
                        )}
                        {currentType === 'register' && (
                            <RegisterUserForm 
                                onSwitchToLogin={handleSwitchToLogin}
                                onSwitchToForgotPassword={handleSwitchToForgotPassword}
                            />
                        )}
                        {currentType === 'forgot' && (
                            <ForgotPassword 
                                onSwitchToLogin={handleSwitchToLogin}
                            />
                        )}
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default AuthModal;