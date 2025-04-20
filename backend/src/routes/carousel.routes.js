const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carousel.controller');
const { authenticate } = require('../middleware/authenticate');
const { isAdmin } = require('../middleware/isAdmin');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/carousel');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/active', carouselController.getActiveCarousels);

// Protected admin routes
router.get('/admin', authenticate, isAdmin, carouselController.getAdminCarousels);
router.post('/admin', authenticate, isAdmin, upload.single('image'), carouselController.createCarousel);
router.put('/:id', authenticate, isAdmin, upload.single('image'), carouselController.updateCarousel);
router.delete('/:id', authenticate, isAdmin, carouselController.deleteCarousel);

module.exports = router; 