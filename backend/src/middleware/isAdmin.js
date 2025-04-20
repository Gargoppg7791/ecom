const isAdmin = async (req, res, next) => {
    try {
        console.log("Admin check - Starting admin verification");
        console.log("Admin check - User:", req.user ? { id: req.user.id, email: req.user.email, role: req.user.role } : null);
        
        if (!req.user) {
            console.log("Admin check - No user found in request");
            return res.status(401).json({ 
                success: false,
                message: "User not authenticated" 
            });
        }

        if (!req.user.role) {
            console.log("Admin check - User has no role defined");
            return res.status(403).json({ 
                success: false,
                message: "User role not defined" 
            });
        }

        if (req.user.role !== 'ADMIN') {
            console.log("Admin check - User is not an admin. Role:", req.user.role);
            return res.status(403).json({ 
                success: false,
                message: "User is not an admin" 
            });
        }

        console.log("Admin check - User is an admin, proceeding to next middleware");
        next();
    } catch (error) {
        console.error("Admin check - Unexpected error:", error);
        console.error("Admin check - Error stack:", error.stack);
        return res.status(500).json({ 
            success: false,
            message: "Admin check failed",
            error: error.message 
        });
    }
}

module.exports = { isAdmin }; 