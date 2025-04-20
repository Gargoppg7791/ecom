const express = require("express");

const router = express.Router();
const userController = require("../controllers/user.controller.js")
const userService = require("../services/user.service.js")
const jwtProvider = require("../config/jwtProvider.js")
const { authenticate } = require("../middleware/authenticat.js")

// Get all users (admin only)
router.get("/", authenticate, userController.getAllUsers)

// Get user profile
router.get("/profile", authenticate, userController.getUserProfile)

// Update user profile
router.put("/profile", authenticate, userController.updateUserProfile)

// Delete user account
router.delete("/profile", authenticate, userController.deleteUserAccount)

// Email route
router.get("/email/:email", async (req, res) => {
    try {
        const user = await userService.getUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const jwt = jwtProvider.generateToken(user.id);
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            jwt: jwt
        };
        return res.status(200).json(userData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;