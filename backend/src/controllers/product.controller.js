const productService = require("../services/product.service.js");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ensure the images directory exists
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/mp4'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ storage, fileFilter }).any();

// Create a new product with color photos
async function createProduct(req, res) {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const { title, description, price, discountedPrice, discountPercent, quantity, brand, topLevelCategory, secondLevelCategory, thirdLevelCategory } = req.body;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json('Error: No files uploaded');
        }

        const colorPhotos = req.files.reduce((acc, file) => {
            const index = file.fieldname.split('_')[2];
            if (!acc[index]) {
                acc[index] = [];
            }
            acc[index].push(file.filename);
            return acc;
        }, {});

        // Parse sizes from the request body
        let sizes = [];
        if (req.body.sizes) {
            try {
                const sizesArray = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
                for (let i = 0; i < sizesArray.length; i++) {
                    sizes.push({
                        name: sizesArray[i].name,
                        quantity: parseInt(sizesArray[i].quantity, 10)
                    });
                }
            } catch (parseError) {
                return res.status(400).json({ error: 'Invalid sizes format' });
            }
        }

        // Parse colors from the request body
        let colors = [];
        if (req.body.colors) {
            try {
                const colorsArray = typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors;
                for (let i = 0; i < colorsArray.length; i++) {
                    colors.push({
                        name: colorsArray[i].name,
                        photos: colorPhotos[i] || []
                    });
                }
            } catch (parseError) {
                return res.status(400).json({ error: 'Invalid colors format' });
            }
        }

        try {
            const productData = { title, description, price, discountedPrice, discountPercent, quantity, brand, colors, sizes, topLevelCategory, secondLevelCategory, thirdLevelCategory };
            const product = await productService.createProduct(productData);
            return res.status(201).json(product);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
}

// Delete a product by ID
async function deleteProduct(req, res) {
    try {
        const productId = req.params.id;
        const message = await productService.deleteProduct(productId);
        return res.json({ message });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Update a product by ID
async function updateProduct(req, res) {
    upload(req, res, async function (err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ error: err.message });
        }

        console.log('Received files:', req.files);
        console.log('Received body:', req.body);

        const { title, description, price, discountedPrice, discountPercent, quantity, brand, topLevelCategory, secondLevelCategory, thirdLevelCategory } = req.body;

        // Parse sizes from the request body
        let sizes = undefined;
        if (req.body.sizes) {
            try {
                const sizesArray = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
                console.log('Parsed sizes:', sizesArray);
                sizes = sizesArray.map(size => ({
                    name: size.name,
                    quantity: parseInt(size.quantity, 10)
                }));
            } catch (parseError) {
                console.error('Size parsing error:', parseError);
                return res.status(400).json({ error: 'Invalid sizes format' });
            }
        }

        // Parse colors and handle file uploads
        let colors = undefined;
        if (req.body.color) {
            try {
                const colorsArray = typeof req.body.color === 'string' ? JSON.parse(req.body.color) : req.body.color;
                console.log('Initial colors array:', colorsArray);

                // Group uploaded files by color index
                const colorPhotos = {};
                if (req.files && req.files.length > 0) {
                    console.log('Processing uploaded files...');
                    req.files.forEach(file => {
                        const matches = file.fieldname.match(/color\[(\d+)\]/);
                        if (matches) {
                            const colorIndex = matches[1];
                            if (!colorPhotos[colorIndex]) {
                                colorPhotos[colorIndex] = [];
                            }
                            colorPhotos[colorIndex].push(file.filename);
                        }
                    });
                }
                console.log('Grouped color photos:', colorPhotos);

                // Process each color
                colors = colorsArray.map((color, index) => {
                    const existingPhotos = Array.isArray(color.photos) ? color.photos : [];
                    const newPhotos = colorPhotos[index] || [];
                    console.log(`Color ${index} - Existing photos:`, existingPhotos);
                    console.log(`Color ${index} - New photos:`, newPhotos);
                    
                    return {
                        name: color.name,
                        photos: [...existingPhotos, ...newPhotos]
                    };
                });

                console.log('Final colors data:', colors);
            } catch (parseError) {
                console.error('Color parsing error:', parseError);
                return res.status(400).json({ error: 'Invalid colors format', details: parseError.message });
            }
        }

        try {
            const productData = {
                title: title,
                description: description,
                price: price !== undefined ? parseFloat(price) : undefined,
                discountedPrice: discountedPrice !== undefined ? parseFloat(discountedPrice) : undefined,
                discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : undefined,
                quantity: quantity !== undefined ? parseInt(quantity, 10) : undefined,
                brand: brand,
                topLevelCategory: topLevelCategory,
                secondLevelCategory: secondLevelCategory,
                thirdLevelCategory: thirdLevelCategory,
                colors: colors,
                sizes: sizes
            };

            console.log('Final product data:', JSON.stringify(productData, null, 2));
            const product = await productService.updateProduct(req.params.id, productData);
            return res.status(200).json(product);
        } catch (err) {
            console.error('Error updating product:', err.message);
            return res.status(500).json({ error: err.message });
        }
    });
}

// Get all products with filtering and pagination
async function getAllProducts(req, res) {
    try {
        const reqQuery = req.query;
        const products = await productService.getAllProducts(reqQuery);
        return res.status(200).send(products);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Find a product by ID
async function findProductById(req, res) {
    try {
        const productId = req.params.id;
        const product = await productService.findProductById(productId);
        return res.status(200).send(product);
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
}

// Find products by category
async function findProductByCategory(req, res) {
    try {
        const category = req.params.category;
        const products = await productService.findProductByCategory(category);
        return res.json(products);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Search products
async function searchProduct(req, res) {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        // Extract filters from query parameters
        const filters = {
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            minDiscount: req.query.minDiscount,
            stock: req.query.stock,
            color: req.query.color,
            size: req.query.size,
            sort: req.query.sort,
            pageSize: req.query.pageSize,
            pageNumber: req.query.pageNumber
        };

        console.log("Searching products with query:", query);
        console.log("Applied filters:", filters);
        
        const result = await productService.searchProduct(query, filters);
        console.log(`Found ${result.content.length} products matching query and filters`);
        
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error in product search:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

// Create multiple products
async function createMultipleProduct(req, res) {
    try {
        await productService.createMultipleProduct(req.body);
        return res.status(202).json({ message: "Products Created Successfully", success: true });
    } catch (err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
}

module.exports = {
    createProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    findProductById,
    findProductByCategory,
    searchProduct,
    createMultipleProduct
};