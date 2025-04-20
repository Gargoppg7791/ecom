const { CarouselService } = require('../services/carousel.service');
const carouselService = new CarouselService();
const { uploadFile, deleteFile } = require("../utils/fileStorage");

const carouselController = {
  /**
   * Get active carousel items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getActiveCarousels(req, res) {
    try {
      const carouselItems = await carouselService.getActiveCarousels();
      res.json(carouselItems);
    } catch (error) {
      console.error('Error in getActiveCarousels:', error);
      res.status(500).json({ error: 'Failed to fetch active carousel items' });
    }
  },

  /**
   * Get all carousel items
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  async getAllCarousels(req, res) {
    try {
      const carouselItems = await carouselService.getAllCarousels();
      res.json(carouselItems);
    } catch (error) {
      console.error('Error in getAllCarousels:', error);
      res.status(500).json({ error: 'Failed to fetch carousel items' });
    }
  },

  /**
   * Get all carousel items for admin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAdminCarousels(req, res) {
    try {
      const carouselItems = await carouselService.getAllCarousels();
      res.json(carouselItems);
    } catch (error) {
      console.error('Error in getAdminCarousels:', error);
      res.status(500).json({ error: 'Failed to fetch carousel items' });
    }
  },

  /**
   * Create a new carousel item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCarousel(req, res) {
    try {
      const { title, active } = req.body;
      const imageUrl = req.file ? req.file.filename : null;

      if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'Image is required' });
      }

      const carouselItem = await carouselService.createCarousel({
        title,
        imageUrl,
        active: active === 'true'
      });

      res.status(201).json({ success: true, data: carouselItem });
    } catch (error) {
      console.error('Error in createCarousel:', error);
      res.status(500).json({ success: false, error: 'Failed to create carousel item' });
    }
  },

  /**
   * Update a carousel item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCarousel(req, res) {
    try {
      const { id } = req.params;
      const { title, active } = req.body;
      const imageUrl = req.file ? req.file.filename : null;

      const updateData = {
        title,
        active: active === 'true'
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      const carouselItem = await carouselService.updateCarousel(id, updateData);
      res.json({ success: true, data: carouselItem });
    } catch (error) {
      console.error('Error in updateCarousel:', error);
      res.status(500).json({ success: false, error: 'Failed to update carousel item' });
    }
  },

  /**
   * Delete a carousel item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCarousel(req, res) {
    try {
      const { id } = req.params;
      await carouselService.deleteCarousel(id);
      res.json({ success: true, message: 'Carousel item deleted successfully' });
    } catch (error) {
      console.error('Error in deleteCarousel:', error);
      res.status(500).json({ success: false, error: 'Failed to delete carousel item' });
    }
  },

  /**
   * Reorder carousel items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reorderCarousels(req, res) {
    try {
      const { ids } = req.body;
      await carouselService.reorderCarousels(ids);
      res.json({ success: true, message: 'Carousel items reordered successfully' });
    } catch (error) {
      console.error('Error in reorderCarousels:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder carousel items' });
    }
  }
};

module.exports = carouselController; 