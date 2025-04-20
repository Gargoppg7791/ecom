const userService = require('../services/user.service');
const jwtProvider = require('../config/jwtProvider');

const getUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const user = await userService.getUserProfileByToken(token);
        res.status(200).json(user);
    } catch (error) {
        if (error.message === 'jwt expired') {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        res.status(500).json({ error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = jwtProvider.getUserIdFromToken(token);
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = jwtProvider.getUserIdFromToken(token);
        await userService.deleteUser(userId);
        res.status(200).json({ message: "User account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUserAccount
};