require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Debug logging
console.log('JWT Provider - JWT_SECRET:', JWT_SECRET ? 'Present' : 'Missing');
console.log('JWT Provider - Environment variables:', Object.keys(process.env));

const generateToken = (userId) => {
    try {
        if (!JWT_SECRET) {
            console.error('JWT Provider - JWT_SECRET is not defined in environment variables');
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        if (!userId) {
            console.error('JWT Provider - No userId provided for token generation');
            throw new Error('User ID is required for token generation');
        }

        console.log('JWT Provider - Generating token for user:', userId);
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
        console.log('JWT Provider - Token generated successfully for user:', userId);
        return token;
    } catch (error) {
        console.error('JWT Provider - Error generating token:', error);
        throw new Error(`Failed to generate token: ${error.message}`);
    }
}

const getUserIdFromToken = (token) => {
    try {
        if (!JWT_SECRET) {
            console.error('JWT Provider - JWT_SECRET is not defined in environment variables');
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        if (!token) {
            console.error('JWT Provider - No token provided for verification');
            throw new Error('Token is required for verification');
        }

        // Remove 'Bearer ' prefix if present
        token = token.replace('Bearer ', '');

        console.log('JWT Provider - Verifying token:', token.substring(0, 10) + '...');
        console.log('JWT Provider - Using secret:', JWT_SECRET.substring(0, 5) + '...');
        
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        if (!decodedToken || !decodedToken.userId) {
            console.error('JWT Provider - Invalid token structure');
            throw new Error('Invalid token structure');
        }

        console.log('JWT Provider - Token verified successfully for user:', decodedToken.userId);
        return decodedToken.userId;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('JWT Provider - Token has expired');
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            console.error('JWT Provider - Invalid token:', error.message);
            throw new Error('Invalid token');
        }
        console.error('JWT Provider - Error verifying token:', error);
        throw new Error(`Failed to verify token: ${error.message}`);
    }
}

module.exports = { generateToken, getUserIdFromToken };