const jwtProvider = require("../config/jwtProvider")
const userService = require("../services/user.service")

const authenticate = async (req, res, next) => {
    try {
        console.log("Authentication - Request headers:", req.headers);
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log("Authentication - No authorization header found");
            return res.status(401).json({ 
                success: false,
                message: "Authorization header not found" 
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log("Authentication - No token found in authorization header");
            return res.status(401).json({ 
                success: false,
                message: "Token not found" 
            });
        }

        console.log("Authentication - Verifying token");
        let userId;
        try {
            userId = jwtProvider.getUserIdFromToken(token);
        } catch (tokenError) {
            console.error("Authentication - Token verification failed:", tokenError);
            return res.status(401).json({ 
                success: false,
                message: tokenError.message || "Invalid token" 
            });
        }

        if (!userId) {
            console.log("Authentication - No user ID from token");
            return res.status(401).json({ 
                success: false,
                message: "Invalid token - no user ID" 
            });
        }

        console.log("Authentication - Finding user with ID:", userId);
        let user;
        try {
            user = await userService.findUserById(userId);
        } catch (userError) {
            console.error("Authentication - Error finding user:", userError);
            return res.status(500).json({ 
                success: false,
                message: "Error finding user",
                error: userError.message 
            });
        }

        if (!user) {
            console.log("Authentication - User not found for ID:", userId);
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Remove sensitive data from user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        console.log("Authentication - User authenticated successfully:", { id: user.id, email: user.email });
        next();
    } catch (error) {
        console.error("Authentication - Unexpected error:", error);
        console.error("Authentication - Error stack:", error.stack);
        return res.status(500).json({ 
            success: false,
            message: "Authentication failed",
            error: error.message 
        });
    }
}

module.exports = { authenticate };
