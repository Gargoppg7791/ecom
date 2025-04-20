const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

/**
 * Get all categories
 * @returns {Promise<Array>} List of categories
 */
async function getAllCategories() {
    return await prisma.category.findMany({
        where: {
            parentCategoryId: null
        },
        include: {
            Category: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    level: true,
                    parentCategoryId: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });
}

/**
 * Get children categories of a specific category
 * @param {number} parentId - The ID of the parent category
 * @returns {Promise<Array>} List of child categories
 */
async function getChildCategories(parentId) {
    try {
        const parsedId = parseInt(parentId, 10);
        if (isNaN(parsedId)) {
            throw new Error("Invalid category ID");
        }

        const childCategories = await prisma.category.findMany({
            where: {
                parentCategoryId: parsedId
            },
            include: {
                parentCategory: true
            }
        });

        return childCategories;
    } catch (error) {
        console.error("Error getting child categories:", error);
        throw new Error("Failed to get child categories: " + error.message);
    }
}

/**
 * Get a category by ID
 * @param {number} id - The category ID
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} The category object
 */
async function getCategoryById(id, filters = {}) {
    try {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new Error("Invalid category ID");
        }

        // First, get the category and its hierarchy
        const category = await prisma.category.findUnique({
            where: {
                id: parsedId
            },
            include: {
                parentCategory: true,
                Category: {
                    include: {
                        Category: true
                    }
                }
            }
        });

        if (!category) {
            throw new Error("Category not found");
        }

        // Get category IDs based on the category level
        let categoryIds = [];
        
        if (category.level === 1) {
            // Top level: include all subcategories
            categoryIds = [category.id];
            if (category.Category) {
                category.Category.forEach(secondLevel => {
                    categoryIds.push(secondLevel.id);
                    if (secondLevel.Category) {
                        secondLevel.Category.forEach(thirdLevel => {
                            categoryIds.push(thirdLevel.id);
                        });
                    }
                });
            }
        } else if (category.level === 2) {
            // Second level: include only this category and its third-level subcategories
            categoryIds = [category.id];
            if (category.Category) {
                category.Category.forEach(thirdLevel => {
                    categoryIds.push(thirdLevel.id);
                });
            }
        } else if (category.level === 3) {
            // Third level: include only this category
            categoryIds = [category.id];
        }

        // Build where clause for products
        const whereClause = {
            categoryId: {
                in: categoryIds
            }
        };

        // Apply filters
        if (filters.minPrice || filters.maxPrice) {
            whereClause.discountedPrice = {};
            if (filters.minPrice) whereClause.discountedPrice.gte = parseFloat(filters.minPrice);
            if (filters.maxPrice) whereClause.discountedPrice.lte = parseFloat(filters.maxPrice);
        }

        if (filters.minDiscount) {
            whereClause.discountPercent = { gte: parseFloat(filters.minDiscount) };
        }

        if (filters.stock === "in_stock") {
            whereClause.sizes = {
                some: {
                    quantity: { gt: 0 }
                }
            };
        }

        if (filters.color) {
            whereClause.color = {
                some: {
                    name: filters.color
                }
            };
        }

        if (filters.size) {
            whereClause.sizes = {
                some: {
                    name: filters.size
                }
            };
        }

        // Apply sorting
        let orderByClause = [{ createdAt: "desc" }];
        if (filters.sort) {
            switch (filters.sort) {
                case "price_high":
                    orderByClause = [{ discountedPrice: "desc" }];
                    break;
                case "price_low":
                    orderByClause = [{ discountedPrice: "asc" }];
                    break;
                case "newest":
                    orderByClause = [{ createdAt: "desc" }];
                    break;
                case "oldest":
                    orderByClause = [{ createdAt: "asc" }];
                    break;
            }
        }

        // Get products with filters and sorting
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                category: true,
                ratings: true,
                color: true,
                sizes: true
            },
            orderBy: orderByClause
        });

        // Process products to include the first color's first photo as the default image
        const processedProducts = products.map(product => ({
            ...product,
            imageUrl: product.color?.[0]?.photos?.[0] || null
        }));

        // Return the category with its filtered products
        return {
            ...category,
            products: processedProducts
        };
    } catch (error) {
        console.error("Error getting category:", error);
        throw new Error("Failed to get category: " + error.message);
    }
}

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
 */
async function createCategory(categoryData) {
    return await prisma.category.create({
        data: categoryData
    });
}

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category
 */
async function updateCategory(id, categoryData) {
    const category = await prisma.category.findUnique({
        where: { id: parseInt(id) }
    });
    
    if (!category) {
        throw new Error('Category not found');
    }
    
    return await prisma.category.update({
        where: { id: parseInt(id) },
        data: categoryData
    });
}

/**
 * Update category image
 * @param {number} id - The category ID
 * @param {string} imageUrl - The image URL
 * @returns {Promise<Object>} The updated category
 */
async function updateCategoryImage(id, imageUrl) {
    try {
        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { imageUrl }
        });
        return category;
    } catch (error) {
        console.error("Error updating category image:", error);
        throw new Error("Failed to update category image: " + error.message);
    }
}

/**
 * Delete a category
 * @param {number} id - The category ID
 * @returns {Promise<void>}
 */
async function deleteCategory(id) {
    try {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new Error("Invalid category ID");
        }

        // First check if category exists
        const category = await prisma.category.findUnique({
            where: { id: parsedId }
        });

        if (!category) {
            throw new Error("Category not found");
        }

        // Check if category has children
        const hasChildren = await prisma.category.findFirst({
            where: { parentCategoryId: parsedId }
        });

        if (hasChildren) {
            throw new Error("Cannot delete category with subcategories");
        }

        // Check if category has products
        const hasProducts = await prisma.product.findFirst({
            where: { categoryId: parsedId }
        });

        if (hasProducts) {
            throw new Error("Cannot delete category with associated products");
        }

        // Delete the category
        await prisma.category.delete({
            where: { id: parsedId }
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("Failed to delete category: " + error.message);
    }
}

module.exports = {
    getAllCategories,
    getChildCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    updateCategoryImage,
    deleteCategory
}; 