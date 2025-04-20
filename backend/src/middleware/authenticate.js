const { getUserIdFromToken } = require('../config/jwtProvider');
const { findUserById } = require('../services/user.service');

const authenticate = async (req, res, next) => {
    try {
        console.log('Authentication - Starting authentication check');
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('Authentication - No authorization header found');
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        console.log('Authentication - Verifying token');
        const userId = await getUserIdFromToken(authHeader);
        
        if (!userId) {
            console.log('Authentication - Invalid token');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }

        console.log('Authentication - Finding user with ID:', userId);
        const user = await findUserById(userId);
        
        if (!user) {
            console.log('Authentication - User not found');
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Remove sensitive data
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        
        console.log('Authentication - User authenticated successfully:', { 
            id: user.id, 
            email: user.email 
        });
        next();
    } catch (error) {
        console.error('Authentication - Error:', error);
        return res.status(401).json({ 
            success: false,
            message: 'Authentication failed',
            error: error.message 
        });
    }
};

module.exports = { authenticate }; 
