import React, { useCallback, useMemo } from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItemToCart } from "../../../../Redux/Customers/Cart/Action";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const calculateDiscountPercent = useCallback(() => {
    if (product?.discountPercent) return product.discountPercent;
    
    if (product?.price && product?.discountedPrice) {
      return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
    }
    
    return 0;
  }, [product?.price, product?.discountedPrice, product?.discountPercent]);

  const imageUrl = useMemo(() => {
    const baseUrl = '/api/images';
    const defaultImage = 'default.jpg';
  
    try {
      // Get the first photo from the first color if available
      if (product?.color?.[0]?.photos?.[0]) {
        return `${baseUrl}/${product.color[0].photos[0]}`;
      }
      
      return `${baseUrl}/${defaultImage}`;
    } catch (error) {
      console.error('Error getting product image:', error);
      return `${baseUrl}/${defaultImage}`;
    }
  }, [product?.color]);

  const handleProductClick = useCallback(() => {
    if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  }, [product?.id, navigate]);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
      return;
    }
    const reqData = {
      data: {
        productId: product.id,
        quantity: 1
      },
      jwt: jwt
    };
    dispatch(addItemToCart(reqData));
  }, [product?.id, dispatch, navigate]);

  const handleImageError = useCallback((e) => {
    const baseUrl = '/api/images';
    const defaultImage = 'default.jpg';
    e.target.src = `${baseUrl}/${defaultImage}`;
    e.target.onerror = null; // Prevent infinite loop
  }, []);

  const discountPercent = calculateDiscountPercent();

  if (!product) {
    return null;
  }

  const {
    title,
    price,
    discountedPrice,
    brand,
    rating,
    ratingCount
  } = product;

  return (
    <div 
      onClick={handleProductClick}
      className="cursor-pointer bg-white rounded-lg overflow-hidden group relative"
    >
      {/* Product Image with Add to Cart Overlay */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <img
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          src={imageUrl}
          alt={title || 'Product Image'}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-[#b87d3b] text-white py-2 px-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#a06c2a]"
        >
          Add to Cart
        </button>
      </div>

      {/* Product Details */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
          {title || 'Untitled Product'}
        </h3>
        <p className="text-xs text-gray-500 mb-1">{brand || 'Unknown Brand'}</p>

        {/* Price Section */}
        <div className="flex items-baseline gap-1">
          <span className="text-base font-semibold text-gray-900">₹{discountedPrice || price || 0}</span>
          {discountedPrice && price && discountedPrice !== price && (
            <>
              <span className="text-xs line-through text-gray-500">₹{price}</span>
              {discountPercent && Number(discountPercent) > 0 && (
                <span className="text-xs font-medium text-green-600">{discountPercent}% off</span>
              )}
            </>
          )}
        </div>

        {/* Ratings Section */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center px-1 py-0.5 bg-green-50 rounded">
              <span className="text-xs font-medium text-green-700">{rating}</span>
              <span className="text-xs text-green-700 ml-0.5">★</span>
            </div>
            <span className="text-xs text-gray-500">({ratingCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
