import React, { useState } from 'react';
import { Rating, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const ProductReviewCard = ({ item }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const formatImagePath = (image) => {
    if (!image) return '/api/images/default.jpg';
    return image.startsWith('/') ? `/api/images${image}` : `/api/images/${image}`;
  };

  const handleImageError = (e) => {
    e.target.src = '/api/images/default.jpg';
    e.target.onerror = null; // Prevent infinite loop
  };

  const handleNext = () => {
    if (selectedImageIndex < item.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  return (
    <>
      <div className="border-b pb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="font-semibold">
            {item.user?.firstName} {item.user?.lastName}
          </div>
          <div className="flex items-center gap-2">
            <Rating 
              value={item.rating || 0} 
              readOnly 
              size="small"
              precision={0.5}
              className="text-[#b87d3b]"
            />
            <span className="text-sm text-gray-600">
              ({item.rating || 0})
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-3">{item.review}</p>

        {/* Review Images */}
        {item.images && item.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {item.images.map((image, index) => (
              <div 
                key={index} 
                className="w-14 h-14 relative cursor-pointer"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={formatImagePath(image)}
                  alt={`Review ${index + 1}`}
                  className="w-full h-full object-cover rounded-md hover:opacity-75 transition-opacity"
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-2">
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog
        open={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        maxWidth="lg"
        fullWidth
      >
        <div className="relative">
          <IconButton
            onClick={() => setSelectedImageIndex(null)}
            className="absolute right-2 top-2 z-10 bg-white/80 hover:bg-white"
          >
            <CloseIcon />
          </IconButton>
          
          {selectedImageIndex !== null && item.images && (
            <div className="relative">
              <img
                src={formatImagePath(item.images[selectedImageIndex])}
                alt={`Review ${selectedImageIndex + 1}`}
                className="w-full max-h-[80vh] object-contain"
                onError={handleImageError}
              />
              
              {/* Navigation Buttons */}
              {selectedImageIndex > 0 && (
                <IconButton
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                >
                  <NavigateBeforeIcon />
                </IconButton>
              )}
              {selectedImageIndex < item.images.length - 1 && (
                <IconButton
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                >
                  <NavigateNextIcon />
                </IconButton>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} / {item.images.length}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default ProductReviewCard;
