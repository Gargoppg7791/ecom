import api from '../config/api';

// Default category image
export const DEFAULT_CATEGORY_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXRlZ29yeTwvdGV4dD48L3N2Zz4=';

/**
 * Constructs a full image URL from a relative path
 * @param {string} imageUrl - The relative path of the image
 * @param {string} fallbackImage - The fallback image URL
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imageUrl, fallbackImage = DEFAULT_CATEGORY_IMAGE) => {
  if (!imageUrl) return fallbackImage;
  
  try {
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend the base URL from environment variables
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5454';
    return `${baseUrl}${imageUrl}`;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return fallbackImage;
  }
}; 