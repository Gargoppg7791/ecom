import React, { useState, useMemo } from "react";
import { Button, IconButton, Typography, CircularProgress, Skeleton } from "@mui/material";
import { useDispatch } from "react-redux";
import { removeCartItem, updateCartItem, getCart } from "../../../Redux/Customers/Cart/Action";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";

// Fallback image as a data URL
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

const CartItem = ({ item, showButton = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const jwt = localStorage.getItem("jwt");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item?.quantity || 1);
  const [hasChanges, setHasChanges] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = useMemo(() => {
    if (!item?.product) return '';
    try {
      const baseUrl = 'http://localhost:5454/images';
      if (item.product.imageUrl) {
        return `${baseUrl}/${item.product.imageUrl}`;
      }
      if (item.product.color?.[0]?.photos?.[0]) {
        return `${baseUrl}/${item.product.color[0].photos[0]}`;
      }
      return '';
    } catch (error) {
      console.error('Error getting product image:', error);
      return '';
    }
  }, [item?.product]);

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setImageError(false);
    setImageLoading(false);
  };

  const handleRemoveItemFromCart = async () => {
    try {
      setIsRemoving(true);
      const cartItemId = parseInt(item?.id || item?._id);
      if (!cartItemId) {
        console.error("Invalid cart item ID");
        return;
      }
      await dispatch(removeCartItem({ cartItemId, jwt }));
      await dispatch(getCart(jwt));
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleQuantityChange = (num) => {
    if (!item) return;
    const newQuantity = localQuantity + num;
    if (newQuantity < 1 || newQuantity > 10) return;
    if (num > 0 && localQuantity >= (item.size?.quantity || 10)) return;
    setLocalQuantity(newQuantity);
    setHasChanges(true);
  };

  const handleUpdateQuantity = async () => {
    if (!item || !hasChanges) return;
    try {
      setIsUpdating(true);
      const cartItemId = parseInt(item?.id || item?._id);
      if (!cartItemId) {
        console.error("Invalid cart item ID");
        return;
      }
      await dispatch(updateCartItem({
        cartItemId,
        data: { quantity: localQuantity },
        jwt
      }));
      await dispatch(getCart(jwt));
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProductClick = () => {
    if (item?.product?.id) {
      navigate(`/product/${item.product.id}`);
    }
  };

  if (!item) return null;

  return (
    <div className="p-5 shadow-lg border rounded-md bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center">
        <div 
          className="w-[5rem] h-[5rem] lg:w-[9rem] lg:h-[9rem] cursor-pointer relative overflow-hidden rounded-md"
          onClick={handleProductClick}
        >
          {imageLoading && !imageError && (
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%" 
              className="absolute inset-0"
            />
          )}
          <img
            src={imageUrl || null}
            alt="Product"
            onError={handleImageError}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover"
          />
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Typography variant="caption" color="textSecondary">
                Image not available
              </Typography>
            </div>
          )}
        </div>
        <div className="ml-5 space-y-1 flex-grow">
          <Typography 
            variant="h6" 
            className="font-semibold cursor-pointer hover:text-blue-600"
            onClick={handleProductClick}
          >
            {item?.product?.title || 'Product Not Available'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Size: {item?.size?.name || 'N/A'}, {item?.color || 'Default'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Seller: {item?.product?.brand || 'Unknown'}
          </Typography>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Typography 
                variant="body1" 
                className="text-gray-400 line-through"
              >
                ₹{((item?.product?.price || 0) * (item?.quantity || 1)).toLocaleString()}
              </Typography>
              <Typography 
                variant="h6" 
                className="font-semibold text-lg text-gray-900"
              >
                ₹{((item?.product?.discountedPrice || 0) * (item?.quantity || 1)).toLocaleString()}
              </Typography>
            </div>
            <div className="px-2 py-1 bg-green-100 rounded-md">
              <Typography 
                variant="body2" 
                className="text-green-700 font-medium"
              >
                {Math.round(((item?.product?.price || 0) - (item?.product?.discountedPrice || 0)) / (item?.product?.price || 1) * 100) || 0}% off
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-grow min-w-0">
        <div onClick={handleProductClick} className="cursor-pointer">
          <h3 className="text-base font-medium text-gray-900 hover:text-[#b87d3b] truncate">
            {item.product?.title || "Unknown Product"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {item.product?.brand || "Unknown Brand"}
          </p>
          <p className="text-sm text-gray-500">
            Size: {item.size?.name || "Standard"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              ₹{item.discountedPrice || item.price || 0}
            </span>
            {item.price && item.discountedPrice && item.price !== item.discountedPrice && (
              <>
                <span className="text-sm line-through text-gray-500">
                  ₹{item.price}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% off
                </span>
              </>
            )}
          </div>

          {/* Quantity Controls */}
          {showButton && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isUpdating || localQuantity <= 1}
                  className="text-gray-600 hover:text-[#b87d3b]"
                >
                  <RemoveCircleOutlineIcon fontSize="small" />
                </IconButton>
                <span className="w-8 text-center text-sm font-medium">
                  {localQuantity}
                </span>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={isUpdating || localQuantity >= (item.size?.quantity || 10)}
                  className="text-gray-600 hover:text-[#b87d3b]"
                >
                  <AddCircleOutlineIcon fontSize="small" />
                </IconButton>
              </div>

              {hasChanges && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUpdateQuantity}
                  disabled={isUpdating}
                  sx={{
                    bgcolor: '#b87d3b',
                    '&:hover': {
                      bgcolor: '#a06c2a',
                    },
                    minWidth: 'auto',
                  }}
                >
                  {isUpdating ? <CircularProgress size={20} /> : "Update"}
                </Button>
              )}

              <IconButton
                onClick={handleRemoveItemFromCart}
                disabled={isRemoving}
                className="text-gray-500 hover:text-red-500"
              >
                {isRemoving ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteOutlineIcon fontSize="small" />
                )}
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
