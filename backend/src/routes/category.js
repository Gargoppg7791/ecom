const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { isAdmin } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        description,
        imageUrl
      }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        imageUrl
      }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 