const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for categories
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'categories');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Configure storage for carousel
const carouselStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'carousel');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Configure multer for categories
const categoryUpload = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      console.error('Invalid file type:', file.originalname);
      return cb(new Error('Only image files are allowed!'), false);
    }
    console.log('File accepted:', file.originalname);
    cb(null, true);
  }
});

// Configure multer for carousel
const carouselUpload = multer({
  storage: carouselStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      console.error('Invalid file type:', file.originalname);
      return cb(new Error('Only image files are allowed!'), false);
    }
    console.log('File accepted:', file.originalname);
    cb(null, true);
  }
});

// Upload middleware for categories
const categoryUploadMiddleware = categoryUpload.single('image');

// Upload middleware for carousel
const carouselUploadMiddleware = carouselUpload.single('image');

// Controller function for category uploads
const uploadFile = (req, res) => {
  categoryUploadMiddleware(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file path
    const relativePath = path.relative(
      path.join(__dirname, '..', '..', 'uploads'),
      req.file.path
    );

    // Convert Windows path separators to forward slashes
    const normalizedPath = relativePath.split(path.sep).join('/');
    
    console.log('File upload successful:', {
      originalName: req.file.originalname,
      savedPath: req.file.path,
      relativePath: relativePath,
      normalizedPath: normalizedPath,
      url: `/uploads/${normalizedPath}`
    });
    
    res.json({
      url: `/uploads/${normalizedPath}`
    });
  });
};

// Controller function for carousel uploads
const uploadCarouselImage = (req, res) => {
  carouselUploadMiddleware(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file path
    const relativePath = path.relative(
      path.join(__dirname, '..', '..', 'uploads'),
      req.file.path
    );

    // Convert Windows path separators to forward slashes
    const normalizedPath = relativePath.split(path.sep).join('/');
    
    console.log('Carousel image upload successful:', {
      originalName: req.file.originalname,
      savedPath: req.file.path,
      relativePath: relativePath,
      normalizedPath: normalizedPath,
      url: `/uploads/${normalizedPath}`
    });
    
    res.json({
      url: `/uploads/${normalizedPath}`
    });
  });
};

module.exports = {
  uploadFile,
  uploadCarouselImage,
  carouselUpload
}; 