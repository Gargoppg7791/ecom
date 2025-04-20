import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import { DEFAULT_CATEGORY_IMAGE } from "../../../utils/imageUtils";

const HomeProductCard = ({ product, fallbackImage = DEFAULT_CATEGORY_IMAGE }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  const calculateDiscountPercent = useCallback(() => {
    if (product?.discountPercent) return product.discountPercent;
    
    if (product?.price && product?.discountedPrice) {
      return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
    }
    
    return 0;
  }, [product?.price, product?.discountedPrice, product?.discountPercent]);

  const getProductImage = useCallback((product) => {
    const baseUrl = 'http://localhost:5454';
    const defaultImage = '75935968-3778-47b2-82b1-b3a6438c6781-1741861299849.jpg';
    const defaultImageUrl = `${baseUrl}/images/${defaultImage}`;
  
    if (!product) return fallbackImage;

    try {
      // Check for direct imageUrl
      if (product.imageUrl?.trim()) {
        return product.imageUrl.startsWith('http') 
          ? product.imageUrl 
          : `${baseUrl}/images/${product.imageUrl}`;
      }

      // Check for color photos
      if (product.color?.[0]?.photos?.[0]?.trim()) {
        const photoName = product.color[0].photos[0];
        return photoName.startsWith('http') 
          ? photoName 
          : `${baseUrl}/images/${photoName}`;
      }
      
      return fallbackImage;
    } catch (error) {
      console.error('Error getting product image:', error);
      return fallbackImage;
    }
  }, [fallbackImage]);

  useEffect(() => {
    if (product) {
      const imageUrl = getProductImage(product);
      setImageSrc(imageUrl);
      
      // Preload image
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        console.error('Failed to load product image:', {
          productId: product.id,
          imageUrl: imageUrl
        });
        setImageError(true);
        setImageLoaded(true);
        setImageSrc(fallbackImage);
      };
      img.src = imageUrl;
    }
  }, [product, getProductImage, fallbackImage]);

  const handleProductClick = useCallback(() => {
    if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  }, [product?.id, navigate]);

  const discountPercent = calculateDiscountPercent();

  return (
    <div
      onClick={handleProductClick}
      className="cursor-pointer flex flex-col items-center bg-white overflow-hidden w-[20rem] mx-3 transition-transform hover:scale-105"
    >
      {/* Product Image with Loading State */}
      <div className="w-full h-[300px] overflow-hidden relative bg-gray-100">
        {!imageLoaded && !imageError && (
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%" 
            animation="wave"
          />
        )}
        {imageSrc && (
          <img
            className={`object-cover w-full h-full hover:scale-110 transition-transform duration-300 absolute top-0 left-0 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            src={imageSrc}
            alt={product?.title || 'Product Image'}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 w-full">
        <h3 className="text-lg font-medium text-gray-900 truncate">{product?.title}</h3>
        <p className="mt-1 text-sm text-gray-500 truncate">{product?.brand}</p>

        {/* Ratings Section */}
        {product?.rating && (
          <div className="flex items-center mt-2">
            <span className="text-sm font-semibold text-gray-800">{product?.rating} ⭐</span>
            <span className="ml-2 text-xs text-gray-500">({product?.ratingCount} reviews)</span>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-black">₹{product?.discountedPrice}</span>
          <span className="text-sm line-through text-gray-500">₹{product?.price}</span>
          <span className="text-sm text-green-600">({discountPercent}% off)</span>
        </div>

        {/* EMI Details */}
        {product?.emi && (
          <p className="text-xs text-gray-600 mt-1">
            EMI starting from ₹{5656}/month
          </p>
        )}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(HomeProductCard);