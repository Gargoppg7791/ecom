const express = require("express");
const passport = require("passport");

const router = express.Router();
const authController = require("../controllers/auth.controller.js");

router.post("/signup", authController.register);
router.post("/signin", authController.login);

// Add this route to handle the POST request for Google login
router.post("/google", authController.googleSignIn);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), authController.googleAuthCallback);

router.get("/verify/:token", authController.verifyEmail); // Add this line

// Import forgotPassword and resetPassword functions from auth.controller.js
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Admin login route
router.post('/admin/login', authController.adminLogin);

module.exports = router;