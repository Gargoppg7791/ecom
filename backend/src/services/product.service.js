const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
const notificationService = require("./notification.service");

/**
 * Create a new product
 * @param {Object} reqData - The product data to create
 * @returns {Object} - The created product
 */
async function createProduct(reqData) {
    try {
        // Find or create top-level category
        let topLevel = await prisma.category.findFirst({
            where: {
                name: reqData.topLevelCategory,
                parentCategoryId: null,
            },
        });

        if (!topLevel) {
            topLevel = await prisma.category.create({
                data: {
                    name: reqData.topLevelCategory,
                    level: 1,
                    parentCategoryId: null,
                },
            });
        }

        // Find or create second-level category
        let secondLevel = await prisma.category.findFirst({
            where: {
                name: reqData.secondLevelCategory,
                parentCategoryId: topLevel.id,
            },
        });

        if (!secondLevel) {
            secondLevel = await prisma.category.create({
                data: {
                    name: reqData.secondLevelCategory,
                    parentCategoryId: topLevel.id,
                    level: 2,
                },
            });
        }

        // Find or create third-level category
        let thirdLevel = await prisma.category.findFirst({
            where: {
                name: reqData.thirdLevelCategory,
                parentCategoryId: secondLevel.id,
            },
        });

        if (!thirdLevel) {
            thirdLevel = await prisma.category.create({
                data: {
                    name: reqData.thirdLevelCategory,
                    parentCategoryId: secondLevel.id,
                    level: 3,
                },
            });
        }

        // Ensure colors and sizes are arrays
        const colors = reqData.colors || [];
        const sizes = reqData.sizes || [];

        // Create the product
        const product = await prisma.product.create({
            data: {
                title: reqData.title,
                description: reqData.description,
                price: parseInt(reqData.price, 10),
                discountedPrice: parseInt(reqData.discountedPrice, 10),
                discountPercent: parseInt(reqData.discountPercent, 10),
                brand: reqData.brand,
                categoryId: thirdLevel.id,
                sizes: {
                    create: sizes.map((size) => ({
                        name: size.name,
                        quantity: parseInt(size.quantity, 10),
                    })),
                },
                color: {
                    create: colors.map((color) => ({
                        name: color.name,
                        photos: color.photos,
                    })),
                },
            },
            include: {
                sizes: true,
                color: true,
            },
        });

        return product;
    } catch (error) {
        throw new Error("Failed to create product: " + error.message);
    }
}

/**
 * Find a product by ID
 * @param {Number} id - The product ID to find
 * @returns {Object} - The found product
 */
async function findProductById(id) {
    try {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new Error("Invalid product ID");
        }

        const product = await prisma.product.findUnique({
            where: {
                id: parsedId,
            },
            include: {
                category: true,
                sizes: true,
                color: true,
                ratings: true,
                reviews: true,
            },
        });

        if (!product) {
            throw new Error("Product not found with id " + id);
        }

        return product;
    } catch (error) {
        console.error("Error finding product: ", error.message);
        throw new Error("Failed to find product: " + error.message);
    }
}

/**
 * Delete a product by ID
 * @param {Number} productId - The product ID to delete
 * @returns {String} - Deletion message
 */
async function deleteProduct(productId) {
    try {
        const product = await findProductById(productId);

        if (!product) {
            throw new Error("Product not found with id " + productId);
        }

        // Use transaction to ensure all deletions succeed or none do
        await prisma.$transaction(async (tx) => {
            // 1. Delete CartItems (has foreign key to Product)
            await tx.cartItem.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // 2. Delete OrderItems (has foreign key to Product)
            await tx.orderItem.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // 3. Delete Reviews (has foreign key to Product)
            await tx.review.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // 4. Delete Ratings (has foreign key to Product)
            await tx.rating.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // 5. Delete Sizes (has foreign key to Product)
            await tx.size.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // 6. Delete Colors (has foreign key to Product)
            await tx.color.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // 7. Finally delete the Product
            await tx.product.delete({
                where: {
                    id: parseInt(productId)
                }
            });
        });

        return "Product deleted successfully";
    } catch (error) {
        console.error("Error deleting product: ", error.message);
        throw new Error("Failed to delete product: " + error.message);
    }
}

/**
 * Update a product by ID
 * @param {Number} productId - The product ID to update
 * @param {Object} reqData - The product data to update
 * @returns {Object} - The updated product
 */
async function updateProduct(productId, reqData) {
    try {
        console.log('Starting product update for ID:', productId);
        console.log('Request data:', JSON.stringify(reqData, null, 2));

        // Build the data object dynamically
        const data = {};

        if (reqData.title !== undefined) data.title = reqData.title;
        if (reqData.description !== undefined) data.description = reqData.description;
        if (reqData.price !== undefined) data.price = parseFloat(reqData.price);
        if (reqData.discountedPrice !== undefined) data.discountedPrice = parseFloat(reqData.discountedPrice);
        if (reqData.discountPercent !== undefined) data.discountPercent = parseFloat(reqData.discountPercent);
        if (reqData.brand !== undefined) data.brand = reqData.brand;
        if (reqData.categoryId !== undefined) data.categoryId = reqData.categoryId;

        // Handle sizes update
        if (reqData.sizes !== undefined) {
            console.log('Updating sizes...');
            // First delete all existing sizes
            await prisma.size.deleteMany({
                where: {
                    productId: parseInt(productId)
                }
            });

            // Then create new sizes
            data.sizes = {
                create: reqData.sizes.map(size => ({
                    name: size.name,
                    quantity: parseInt(size.quantity, 10)
                }))
            };
            console.log('New sizes data:', data.sizes);
        }

        // Handle color update
        if (reqData.colors !== undefined) {
            console.log('Updating colors...');
            // First get existing colors to handle photo deletion
            const existingColors = await prisma.color.findMany({
                where: {
                    productId: parseInt(productId)
                }
            });
            console.log('Existing colors:', JSON.stringify(existingColors, null, 2));

            // Process each color update
            for (const color of reqData.colors) {
                console.log('Processing color:', color);
                console.log('Color photos:', color.photos);
                console.log('Type of color.photos:', typeof color.photos);
                if (Array.isArray(color.photos)) {
                    console.log('Number of photos:', color.photos.length);
                    console.log('Photos content:', JSON.stringify(color.photos, null, 2));
                }

                // Find matching existing color by name
                const existingColor = existingColors.find(ec => ec.name === color.name);

                if (existingColor) {
                    console.log('Updating existing color. Current photos:', existingColor.photos);
                    console.log('New photos to be set:', color.photos);
                    // Update existing color
                    await prisma.color.update({
                        where: { id: existingColor.id },
                        data: {
                            name: color.name,
                            photos: color.photos || []
                        }
                    });
                } else {
                    console.log('Creating new color with photos:', color.photos);
                    // Create new color
                    await prisma.color.create({
                        data: {
                            name: color.name,
                            photos: color.photos || [],
                            productId: parseInt(productId)
                        }
                    });
                }
            }

            // Delete colors that are no longer present
            const newColorNames = reqData.colors.map(c => c.name);
            await prisma.color.deleteMany({
                where: {
                    productId: parseInt(productId),
                    name: {
                        notIn: newColorNames
                    }
                }
            });
        }

        const updatedProduct = await prisma.product.update({
            where: {
                id: parseInt(productId),
            },
            data: data,
            include: {
                sizes: true,
                color: true,
            },
        });

        console.log('Updated product:', JSON.stringify(updatedProduct, null, 2));
        return updatedProduct;
    } catch (error) {
        console.error("Error updating product: ", error.message);
        throw new Error("Failed to update product: " + error.message);
    }
}

/**
 * Get all products with filtering and pagination
 * @param {Object} reqQuery - The query parameters for filtering and pagination
 * @returns {Object} - The filtered and paginated products
 */
async function getAllProducts(reqQuery) {
    try {
        let {
            category,
            topLevelCategory,
            secondLevelCategory,
            thirdLevelCategory,
            color,
            sizes,
            minPrice,
            maxPrice,
            minDiscount,
            sort,
            stock,
            pageNumber,
            pageSize,
            search
        } = reqQuery;

        // Set default pagination
        pageSize = parseInt(pageSize) || 10;
        pageNumber = parseInt(pageNumber) || 1;

        // Base where clause
        let whereClause = {};

        // Add search functionality
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } }
            ];
        }

        // Simplified category filtering
        if (topLevelCategory) {
            whereClause.category = {
                parentCategory: {
                    parentCategory: {
                        name: topLevelCategory
                    }
                }
            };
        }

        // Price filtering
        if (minPrice || maxPrice) {
            whereClause.discountedPrice = {};
            if (minPrice) whereClause.discountedPrice.gte = parseFloat(minPrice);
            if (maxPrice) whereClause.discountedPrice.lte = parseFloat(maxPrice);
        }

        // Discount filtering
        if (minDiscount) {
            whereClause.discountPercent = { gt: parseFloat(minDiscount) };
        }

        // Stock filtering
        if (stock !== undefined) {
            if (stock === true) {
                whereClause.sizes = {
                    some: {
                        quantity: { gt: 0 }
                    }
                };
            } else if (stock === false) {
                whereClause.sizes = {
                    every: {
                        quantity: { equals: 0 }
                    }
                };
            }
        }

        // Sorting
        let orderByClause = [{ createdAt: "desc" }];
        if (sort) {
            switch (sort) {
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

        // Execute query with pagination and optimized includes
        const [products, totalProducts] = await prisma.$transaction([
            prisma.product.findMany({
                where: whereClause,
                include: {
                    category: {
                        include: {
                            parentCategory: {
                                include: {
                                    parentCategory: {
                                        select: {
                                            id: true,
                                            name: true,
                                            level: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    sizes: {
                        select: {
                            id: true,
                            name: true,
                            quantity: true
                        }
                    },
                    color: {
                        select: {
                            id: true,
                            name: true,
                            photos: true
                        }
                    },
                },
                orderBy: orderByClause,
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where: whereClause })
        ]);

        // Return paginated results
        return {
            content: products,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalProducts / pageSize),
            totalElements: totalProducts
        };

    } catch (error) {
        console.error("Error getting all products: ", error.message);
        throw new Error("Failed to get products: " + error.message);
    }
}

/**
 * Search products by query
 * @param {String} query - The search query
 * @param {Object} filters - The filters to apply
 * @returns {Object} - The found products
 */
async function searchProduct(query, filters = {}) {
    try {
        console.log("Searching products with query:", query);
        console.log("Applied filters:", filters);

        // Build the where clause
        let whereClause = {
            OR: []
        };

        // Clean and prepare the search query
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        // Add product field search conditions for each term
        searchTerms.forEach(term => {
            whereClause.OR.push(
                {
                    title: {
                        contains: term,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: term,
                        mode: "insensitive"
                    }
                },
                {
                    brand: {
                        contains: term,
                        mode: "insensitive"
                    }
                }
            );
        });

        // Search in categories
        const matchingCategories = await prisma.category.findMany({
            where: {
                OR: searchTerms.map(term => ({
                    name: {
                        contains: term,
                        mode: "insensitive"
                    }
                }))
            },
            include: {
                Category: {
                    include: {
                        Category: true
                    }
                }
            }
        });

        if (matchingCategories.length > 0) {
            const categoryIds = new Set();
            
            matchingCategories.forEach(category => {
                categoryIds.add(category.id);
                
                // Add subcategories
                if (category.Category) {
                    category.Category.forEach(secondLevel => {
                        categoryIds.add(secondLevel.id);
                        if (secondLevel.Category) {
                            secondLevel.Category.forEach(thirdLevel => {
                                categoryIds.add(thirdLevel.id);
                            });
                        }
                    });
                }
            });

            whereClause.OR.push({
                categoryId: {
                    in: Array.from(categoryIds)
                }
            });
        }

        // Apply filters
        const conditions = {};
        
        if (filters.minPrice || filters.maxPrice) {
            conditions.discountedPrice = {};
            if (filters.minPrice) conditions.discountedPrice.gte = parseFloat(filters.minPrice);
            if (filters.maxPrice) conditions.discountedPrice.lte = parseFloat(filters.maxPrice);
        }

        if (filters.minDiscount) {
            conditions.discountPercent = { gt: parseFloat(filters.minDiscount) };
        }

        if (filters.stock) {
            conditions.sizes = {
                some: {
                    quantity: filters.stock === "in_stock" ? { gt: 0 } : { lte: 0 }
                }
            };
        }

        // Combine search conditions with filters
        const finalWhereClause = {
            AND: [
                whereClause,
                conditions
            ]
        };

        // Execute query with pagination
        const pageSize = parseInt(filters.pageSize) || 12;
        const pageNumber = parseInt(filters.pageNumber) || 1;

        const [products, totalProducts] = await prisma.$transaction([
            prisma.product.findMany({
                where: finalWhereClause,
                include: {
                    category: true,
                    reviews: true,
                    ratings: true,
                    color: true,
                    sizes: true
                },
                orderBy: filters.sort ? getSortOrder(filters.sort) : [{ createdAt: "desc" }],
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where: finalWhereClause })
        ]);

        // console.log(Found ${products.length} products matching search and filters);
        // console.log("Search query results:", products.map(p => p.title));
        
        return {
            content: products,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalProducts / pageSize),
            totalElements: totalProducts
        };
    } catch (error) {
        console.error("Error searching products:", error);
        throw new Error("Failed to search products: " + error.message);
    }
}

function getSortOrder(sort) {
    switch (sort) {
        case "price_high":
            return [{ discountedPrice: "desc" }];
        case "price_low":
            return [{ discountedPrice: "asc" }];
        case "newest":
            return [{ createdAt: "desc" }];
        case "oldest":
            return [{ createdAt: "asc" }];
        default:
            return [{ createdAt: "desc" }];
    }
}

/**
 * Create multiple products
 * @param {Array} products - The array of product data to create
 */
async function createMultipleProduct(products) {
    try {
        for (let product of products) {
            await createProduct(product);
        }
    } catch (error) {
        console.error("Error creating multiple products: ", error.message);
        throw new Error("Failed to create multiple products: " + error.message);
    }
}

async function updateProductSize(productId, sizeId, quantity) {
    try {
        const size = await prisma.size.update({
            where: { id: sizeId },
            data: { quantity },
            include: {
                product: true
            }
        });

        // Check if stock is low (less than 5) and create notification
        if (quantity <= 5) {
            await notificationService.createLowStockNotification(size.product, size);
        }

        return size;
    } catch (error) {
        throw new Error("Failed to update product size: " + error.message);
    }
}

module.exports = {
    createProduct,
    findProductById,
    deleteProduct,
    updateProduct,
    getAllProducts,
    searchProduct,
    createMultipleProduct,
    updateProductSize
};