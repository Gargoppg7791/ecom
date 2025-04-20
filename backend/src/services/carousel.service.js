const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CarouselService {
  async getActiveCarousels() {
    try {
      const items = await prisma.carousel.findMany({
        where: {
          active: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return items.map(item => ({
        ...item,
        imageUrl: item.imageUrl.startsWith('http') 
          ? item.imageUrl 
          : `${process.env.API_BASE_URL || 'http://localhost:5454'}/uploads/carousel/${item.imageUrl}`
      }));
    } catch (error) {
      console.error('Error in getActiveCarousels:', error);
      throw error;
    }
  }

  async getAllCarousels() {
    try {
      const items = await prisma.carousel.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      return items.map(item => ({
        ...item,
        imageUrl: item.imageUrl.startsWith('http') 
          ? item.imageUrl 
          : `${process.env.API_BASE_URL || 'http://localhost:5454'}/uploads/carousel/${item.imageUrl}`
      }));
    } catch (error) {
      console.error('Error in getAllCarousels:', error);
      throw error;
    }
  }

  async createCarousel(data) {
    try {
      const carousel = await prisma.carousel.create({
        data: {
          title: data.title || '',
          imageUrl: data.imageUrl,
          active: data.active || true
        }
      });

      return {
        ...carousel,
        imageUrl: carousel.imageUrl.startsWith('http') 
          ? carousel.imageUrl 
          : `${process.env.API_BASE_URL || 'http://localhost:5454'}/uploads/carousel/${carousel.imageUrl}`
      };
    } catch (error) {
      console.error('Error in createCarousel:', error);
      throw error;
    }
  }

  async updateCarousel(id, data) {
    try {
      const carousel = await prisma.carousel.update({
        where: { id: parseInt(id) },
        data: {
          title: data.title,
          imageUrl: data.imageUrl,
          active: data.active
        }
      });

      return {
        ...carousel,
        imageUrl: carousel.imageUrl.startsWith('http') 
          ? carousel.imageUrl 
          : `${process.env.API_BASE_URL || 'http://localhost:5454'}/uploads/carousel/${carousel.imageUrl}`
      };
    } catch (error) {
      console.error('Error in updateCarousel:', error);
      throw error;
    }
  }

  async deleteCarousel(id) {
    try {
      return await prisma.carousel.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error in deleteCarousel:', error);
      throw error;
    }
  }
}

module.exports = { CarouselService }; 