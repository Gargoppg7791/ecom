const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parentCategory: true,
          Product: true
        }
      });
      res.json(categories);
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: {
          parentCategory: true,
          Product: true
        }
      });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async getChildCategories(req, res) {
    try {
      const { id } = req.params;
      const childCategories = await prisma.category.findMany({
        where: { parentCategoryId: parseInt(id) },
        include: {
          parentCategory: true,
          Product: true
        }
      });
      res.json(childCategories);
    } catch (error) {
      console.error('Error in getChildCategories:', error);
      res.status(500).json({ error: 'Failed to fetch child categories' });
    }
  },

  async createCategory(req, res) {
    try {
      const { name, parentCategoryId, level, imageUrl } = req.body;
      const category = await prisma.category.create({
        data: {
          name,
          parentCategoryId: parentCategoryId ? parseInt(parentCategoryId) : null,
          level: parseInt(level),
          imageUrl
        }
      });
      res.status(201).json(category);
    } catch (error) {
      console.error('Error in createCategory:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, parentCategoryId, level, imageUrl } = req.body;
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: {
          name,
          parentCategoryId: parentCategoryId ? parseInt(parentCategoryId) : null,
          level: level ? parseInt(level) : undefined,
          imageUrl
        }
      });
      res.json(category);
    } catch (error) {
      console.error('Error in updateCategory:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await prisma.category.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  },

  async updateCategoryImage(req, res) {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { imageUrl }
      });
      
      res.json({ success: true, data: category });
    } catch (error) {
      console.error('Error in updateCategoryImage:', error);
      res.status(500).json({ success: false, error: 'Failed to update category image' });
    }
  },

  async deleteCategoryImage(req, res) {
    try {
      const { id } = req.params;
      
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { imageUrl: null }
      });
      
      res.json({ success: true, data: category });
    } catch (error) {
      console.error('Error in deleteCategoryImage:', error);
      res.status(500).json({ success: false, error: 'Failed to delete category image' });
    }
  }
};

module.exports = categoryController; 
