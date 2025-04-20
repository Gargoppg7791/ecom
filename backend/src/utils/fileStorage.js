const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Upload a file to the server
 * @param {Object} file - The file object from multer
 * @param {string} destination - The destination directory
 * @returns {Promise<string>} - The path to the uploaded file
 */
const uploadFile = async (file, destination) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create destination directory if it doesn't exist
    await fs.mkdir(destination, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    const filepath = path.join(destination, filename);

    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    return filepath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from the server
 * @param {string} filepath - The path to the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (filepath) => {
  try {
    if (!filepath) {
      throw new Error('No filepath provided');
    }

    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile
}; 