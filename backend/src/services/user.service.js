const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const jwtProvider = require("../config/jwtProvider");
const crypto = require("crypto");

const createUser = async (userData) => {
    try {
        let { firstName, lastName, email, password, role, mobile } = userData;

        const isUserExist = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (isUserExist) {
            throw new Error("user already exists with email: " + email);
        }

        if (password) {
            password = await bcrypt.hash(password, 8);
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password,
                role,
                mobile,
                verified: false,
                verificationToken: {
                    create: [{
                        token: verificationToken
                    }]
                }
            }
        });

        console.log("user ", user);

        return { user, verificationToken };
    } catch (error) {
        console.log("error - ", error.message);
        throw new Error(error.message);
    }
}

const saveVerificationToken = async (userId, token) => {
    await prisma.user.update({
        where: { id: userId },
        data: { verificationToken: token }
    });
};

const verifyUser = async (token) => {
    try {
        console.log("Verifying token in service:", token);
        
        // Find the verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        });

        if (!verificationToken) {
            console.log("Token not found");
            throw new Error("Invalid verification token");
        }

        // Update the user to set verified to true and delete the token
        const user = await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { 
                verified: true,
                verificationToken: {
                    delete: {
                        token: token
                    }
                }
            },
            include: {
                addresses: true,
                cart: true,
                cartItems: true,
                orders: true,
                payments: true,
                ratings: true,
                reviews: true
            }
        });

        console.log("User verified successfully:", user.id);
        return user;
    } catch (error) {
        console.log("Error verifying user:", error.message);
        throw new Error(error.message);
    }
};

const findUserById = async (userId) => {
    try {
        console.log("Finding user by ID:", userId);
        
        if (!userId) {
            console.log("No user ID provided");
            throw new Error("User ID is required");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                cart: true,
                cartItems: true,
                addresses: true,
                orders: true,
                payments: true,
                ratings: true,
                reviews: true
            }
        });

        if (!user) {
            console.log("User not found with ID:", userId);
            throw new Error("User not found with id: " + userId);
        }

        console.log("User found successfully:", { id: user.id, email: user.email });
        return user;
    } catch (error) {
        console.error("Error finding user by ID:", error);
        if (error.code === 'P2023') {
            throw new Error("Invalid user ID format");
        }
        throw new Error(error.message);
    }
}

const getUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getUserProfileByToken = async (token) => {
    try {
        const userId = jwtProvider.getUserIdFromToken(token);

        console.log("user id", userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                ratings: true,
                reviews: true,
                orderItems: true,
                addresses: true,
                cart: true,
                cartItems: true,
                payments: true,
                orders: true
            }
        });

        if (!user) {
            throw new Error("user not exist with id: " + userId);
        } else {
            user.password = null;
        }

        return user;
    } catch (error) {
        if (error.message === 'jwt expired') {
            console.log("JWT expired");
            throw new Error('jwt expired');
        }
        console.log("error ----- ", error.message);
        throw new Error(error.message);
    }
}

const getAllUsers = async () => {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        console.log("error - ", error);
        throw new Error(error.message);
    }
}

const findOrCreateGoogleUser = async (profile) => {
    try {
        const { googleId, displayName, email } = profile;

        let user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId,
                    firstName: displayName,
                    email,
                    password: null,
                    mobile: ''
                }
            });
        }

        return user;
    } catch (error) {
        console.log("error - ", error.message);
        throw new Error(error.message);
    }
}

const savePasswordResetToken = async (userId, token) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Saving reset token:', { 
        userId, 
        originalToken: token,
        hashedToken,
        expiresAt: new Date(Date.now() + 24 * 3600000)
    });
    
    // First, delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
        where: { userId }
    });
    
    await prisma.passwordResetToken.create({
        data: {
            userId,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 24 * 3600000) // 24 hours
        },
    });
};

const verifyPasswordResetToken = async (token) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Verifying reset token:', { 
        originalToken: token,
        hashedToken,
        currentTime: new Date()
    });
    
    const resetToken = await prisma.passwordResetToken.findUnique({ 
        where: { token: hashedToken } 
    });
    
    if (!resetToken) {
        console.log('Token not found in database');
        return null;
    }
    
    console.log('Found token in database:', {
        userId: resetToken.userId,
        expiresAt: resetToken.expiresAt,
        isExpired: resetToken.expiresAt < new Date()
    });
    
    if (resetToken.expiresAt < new Date()) {
        console.log('Token has expired');
        return null;
    }

    await prisma.passwordResetToken.delete({ where: { token: hashedToken } });
    console.log('Token verified successfully, returning userId:', resetToken.userId);
    return resetToken.userId;
};

const updatePassword = async (userId, hashedPassword) => {
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
};

const updateVerificationToken = async (userId, token) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { verificationToken: token }
    });
};

const updateUserProfile = async (userId, userData) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                address: userData.address
            }
        });
        return user;
    } catch (error) {
        console.log("error updating profile:", error.message);
        throw new Error(error.message);
    }
};

const deleteUser = async (userId) => {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        return true;
    } catch (error) {
        console.log("Error deleting user:", error.message);
        throw new Error("Failed to delete user account");
    }
};

module.exports = {
    createUser,
    findUserById,
    getUserProfileByToken,
    getUserByEmail,
    getAllUsers,
    findOrCreateGoogleUser,
    saveVerificationToken,
    verifyUser,
    savePasswordResetToken,
    verifyPasswordResetToken,
    updatePassword,
    updateVerificationToken,
    updateUserProfile,
    deleteUser
};