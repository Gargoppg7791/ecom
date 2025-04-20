const userService = require("../services/user.service.js");
const jwtProvider = require("../config/jwtProvider.js");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendEmail = require("../config/sendEmail");
const crypto = require("crypto");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        const { user, verificationToken } = await userService.createUser(req.body);
        
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        
        // Updated email content with better formatting
        const emailSubject = "Welcome to E-Commerce - Verify Your Email";
        const emailText = `
Hello ${user.firstName},

Thank you for registering with our E-Commerce platform! To complete your registration and start shopping, please verify your email address by clicking the link below:

${verifyUrl}

This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.

If you didn't create an account with us, you can safely ignore this email.

For security reasons, this link can only be used once. If you need to verify your email again, please request a new verification link from the login page.

Best regards,
Your E-Commerce Team

Note: This is an automated email. Please do not reply to this message.`;

        await sendEmail(user.email, emailSubject, emailText);

        return res.status(200).send({ message: "Registration successful! Please verify your email." });
    } catch (error) {
        if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
            return res.status(400).send({ message: `User already exists with email: ${req.body.email}` });
        }
        console.error(`error - ${error.message}`);
        return res.status(500).send({ error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log("Verifying token:", token);
        
        const user = await userService.verifyUser(token);

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired verification token. Please request a new one." 
            });
        }

        // Generate JWT
        const jwt = jwtProvider.generateToken(user.id);

        // Send complete user data with the response
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            verified: user.verified,
            addresses: user.addresses,
            cart: user.cart,
            cartItems: user.cartItems,
            orders: user.orders,
            payments: user.payments,
            ratings: user.ratings,
            reviews: user.reviews
        };

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: userData,
            jwt: jwt
        });
    } catch (error) {
        console.error("Error verifying user:", error);
        return res.status(400).json({
            success: false,
            message: "Verification failed",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    const { password, email } = req.body;
    try {
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found with email: ' + email });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const jwt = jwtProvider.generateToken(user.id);

        return res.status(200).send({ jwt, message: "login success" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const googleSignIn = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        let user = await userService.findOrCreateGoogleUser({ googleId, email, displayName: name });
        const jwt = jwtProvider.generateToken(user.id);

        return res.status(200).send({ jwt, message: "Google authentication successful" });
    } catch (error) {
        return res.status (500).send({ error: error.message });
    }
}

const googleAuthCallback = async (req, res) => {
    try {
        const { id: googleId, displayName, emails } = req.user;
        const user = await userService.findOrCreateGoogleUser({ googleId, displayName, email: emails[0].value });
        const jwt = jwtProvider.generateToken(user.id);
        return res.status(200).send({ jwt, message: "Google authentication successful" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).send({ message: 'User not found with email: ' + email });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        await userService.savePasswordResetToken(user.id, resetToken);

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        
        // Updated email content with better formatting
        const emailSubject = "Password Reset Request - Your E-Commerce Account";
        const emailText = `
Hello ${user.firstName},

We received a request to reset the password for your E-Commerce account associated with ${email}. 

Click here to reset your password: ${resetUrl}

If you didn't request this password reset, you can safely ignore this email. The link will expire in 24 hours.

For security reasons, this link can only be used once. If you need to reset your password again, please request another reset link.

Best regards,
Your E-Commerce Team

Note: This is an automated email. Please do not reply to this message.`;

        await sendEmail(user.email, emailSubject, emailText);

        return res.status(200).send({ message: "Password reset email sent!" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        console.log('Reset password request received:', {
            token,
            hasToken: !!token,
            tokenLength: token?.length
        });

        if (!token) {
            return res.status(400).send({ 
                message: "Invalid password reset token.",
                details: "No token provided in the request."
            });
        }

        const userId = await userService.verifyPasswordResetToken(token);

        if (!userId) {
            return res.status(400).send({ 
                message: "Invalid or expired password reset token. Please request a new password reset link.",
                details: "The link you clicked may have expired or already been used. Password reset links are valid for 24 hours and can only be used once.",
                help: "Please try requesting a new password reset link from the login page."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await userService.updatePassword(userId, hashedPassword);

        return res.status(200).send({ 
            message: "Password reset successfully! Please login with your new password."
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).send({ 
            message: "Error resetting password",
            details: error.message
        });
    }
};

// Update the resendVerification function
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        await userService.updateVerificationToken(user.id, verificationToken);

        // Send new verification email
        const verifyUrl = `${process.env.BASE_URL}/auth/verify/${verificationToken}`;
        await sendEmail(
            user.email,
            "Verify Your Email",
            `Click here to verify your email: ${verifyUrl}`
        );

        res.status(200).json({ message: "Verification email sent successfully!" });
    } catch (error) {
        console.error("Error resending verification:", error);
        res.status(500).json({ message: "Failed to send verification email" });
    }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        email,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate JWT with admin role
    const token = jwt.sign(
      { 
        userId: admin.id,
        userType: 'admin',
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { register, verifyEmail, login, googleSignIn, googleAuthCallback, forgotPassword, resetPassword, resendVerification, adminLogin };