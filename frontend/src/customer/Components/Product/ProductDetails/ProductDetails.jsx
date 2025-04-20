import { React, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductReviewCard from "./ProductReviewCard";
import { Button, Rating, Typography, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HomeProductCard from "../../Home/HomeProductCard";
import { useDispatch, useSelector } from "react-redux";
import { findProductById } from "../../../../Redux/Customers/Product/Action";
import { addItemToCart } from "../../../../Redux/Customers/Cart/Action";
import { getAllReviews, createReview } from "../../../../Redux/Customers/Review/Action";
import api from "../../../../config/api";
import ReviewModal from './ReviewModal';
import EMIInfo from './EMIInfo';
import AliceCarousel from 'react-alice-carousel';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ProductDetails = () => {
  const [selectedSize, setSelectedSize] = useState();
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use specific selectors instead of the entire store
  const selectedProduct = useSelector((store) => store.customersProduct?.selectedProduct) || null;
  const reviews = useSelector((store) => store.review?.reviews) || [];
  const { productId } = useParams();
  const jwt = localStorage.getItem("jwt");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
    images: []
  });
  const [productRating, setProductRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const carouselRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: {
      1: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      5: { count: 0, percentage: 0 }
    }
  });
  const [showFullImage, setShowFullImage] = useState(false);

  const getProductImage = (product) => {
    const baseUrl = '/api/images';
  
    try {
      // First check if product has colors and photos
      if (product.color && product.color.length > 0) {
        const firstColor = product.color[0];
        if (firstColor.photos && firstColor.photos.length > 0) {
          const photoName = firstColor.photos[0];
          if (photoName.startsWith('http')) {
            return photoName;
          }
          return `${baseUrl}/${photoName}`;
        }
      }

      // Then check if product has images array
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        if (firstImage.startsWith('http')) {
          return firstImage;
        }
        return `${baseUrl}/${firstImage}`;
      }

      // Finally check if product has a direct imageUrl
      if (product.imageUrl) {
        return product.imageUrl.startsWith('http') ? product.imageUrl : `${baseUrl}/${product.imageUrl}`;
      }
      
      // If no images found, return empty string
      return '';
    } catch (error) {
      console.error('Error getting product image:', error);
      return '';
    }
  };

  const handleSetActiveImage = (image) => {
    setActiveImage(image);
  };

  const handleQuantityChange = (newQuantity) => {
    if (!selectedSize) {
      setError("Please select a size first");
      return;
    }

    const maxQuantity = Math.min(selectedSize.quantity, 10);
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async () => {
    if (!jwt) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      setError("Please select a size");
      return;
    }

    if (!selectedColor) {
      setError("Please select a color");
      return;
    }

    try {
      setLoading(true);
      const data = { 
        productId, 
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
      };
      await dispatch(addItemToCart({ data, jwt }));
      setSuccess("Item added to cart successfully!");
      setTimeout(() => {
        setSuccess(null);
      }, 1500);
    } catch (error) {
      setError("Failed to add item to cart. Please try again.");
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (formData) => {
    if (!jwt) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData object
      const reviewFormData = new FormData();
      reviewFormData.append('productId', parseInt(productId, 10));
      reviewFormData.append('review', formData.review);
      const rating = Number(formData.rating);
      reviewFormData.append('rating', rating);
      
      console.log("Submitting review with rating:", rating); // Debug log
      
      // Append each image
      formData.images.forEach((image) => {
        reviewFormData.append('images', image);
      });
      
      const response = await api.post('/api/reviews/create', 
        reviewFormData,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log("Review submission response:", response.data); // Debug log
      
      // Update the user's rating
      setUserRating(rating);
      
      // Refresh both reviews and ratings
      await Promise.all([
        dispatch(getAllReviews(productId)),
        fetchProductRatings(),
        dispatch(findProductById(productId))
      ]);
      
      setSuccess("Review submitted successfully!");
      setReviewModalOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error.response?.data?.error || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch product ratings
  const fetchProductRatings = async () => {
    try {
      console.log("Fetching ratings for product:", productId);
      const response = await api.get(`/api/ratings/product/${productId}`);
      
      console.log("Raw rating response:", response.data);

      if (response.data) {
        // Calculate distribution manually from raw ratings
        const ratings = response.data.ratings || [];
        const total = ratings.length;
        const distribution = {
          1: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 },
          3: { count: 0, percentage: 0 },
          4: { count: 0, percentage: 0 },
          5: { count: 0, percentage: 0 }
        };

        // Count ratings only if there are any
        let totalRatingSum = 0;
        if (total > 0) {
          ratings.forEach(rating => {
            const ratingValue = Math.round(Number(rating.rating));
            if (distribution[ratingValue]) {
              distribution[ratingValue].count++;
              totalRatingSum += Number(rating.rating);
            }
          });
        }

        // Calculate percentages
        Object.keys(distribution).forEach(rating => {
          distribution[rating].percentage = total > 0 
            ? Math.round((distribution[rating].count / total) * 100) 
            : 0;
        });

        // Calculate average with proper rounding
        const average = total > 0 ? totalRatingSum / total : 0;
        const roundedAverage = Number(average.toFixed(1));

        const stats = {
          average: roundedAverage,
          total,
          distribution
        };

        console.log("Processed rating stats:", stats);
        setRatingStats(stats);
        setProductRating(roundedAverage);

        // Set user rating if exists
        if (jwt) {
          const userRating = ratings.find(r => r.userId === parseInt(localStorage.getItem("userId")));
          setUserRating(userRating ? Number(userRating.rating) : null);
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      // Set default values when there's an error
      setRatingStats({
        average: 0,
        total: 0,
        distribution: {
          1: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 },
          3: { count: 0, percentage: 0 },
          4: { count: 0, percentage: 0 },
          5: { count: 0, percentage: 0 }
        }
      });
      setProductRating(0);
      setUserRating(null);
    }
  };

  // Function to submit rating
  const handleRatingSubmit = async (newValue) => {
    if (!jwt) {
      navigate('/login');
      return;
    }

    try {
      setRatingLoading(true);
      console.log("Submitting rating:", { productId, rating: newValue });
      
      const response = await api.post('/api/ratings/create', {
        productId: parseInt(productId, 10),
        rating: parseFloat(newValue)
      }, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setProductRating(response.data.averageRating);
      setUserRating(newValue);
        await fetchProductRatings(); // Refresh all rating data
        setSuccess("Rating submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError(error.response?.data?.error || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  // First useEffect for initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [productRes, reviewsRes, ratingsRes] = await Promise.all([
          dispatch(findProductById(productId)),
          dispatch(getAllReviews(productId)),
          fetchProductRatings()
        ]);
        
        console.log("Fetched data:", { // Debug log
          product: productRes,
          reviews: reviewsRes,
          ratings: ratingsRes
        });
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Error loading product details");
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId, dispatch]);

  // Third useEffect for similar products
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!selectedProduct?.category?.id) {
        console.log('No valid category information available');
        setSimilarProducts([]);
        return;
      }

      setLoadingSimilar(true);
      try {
        console.log('Fetching similar products for category:', selectedProduct.category);
        
        const response = await api.get('/api/products', {
          params: {
            pageSize: 10,
            pageNumber: 0,
            sort: "newest",
            categoryId: selectedProduct.category.id,
            excludeProductId: selectedProduct.id
          }
        });

        // Process the products to include rating information
        const processedProducts = response.data.content.map(product => ({
          ...product,
          imageUrl: getProductImage(product),
          rating: product.ratings?.length > 0 
            ? (product.ratings.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / product.ratings.length).toFixed(1)
            : 0,
          ratingCount: product.ratings?.length || 0
        }));

        console.log('Similar products found:', processedProducts.length);
        setSimilarProducts(processedProducts);
      } catch (error) {
        console.error("Error fetching similar products:", error);
        setSimilarProducts([]);
      } finally {
        setLoadingSimilar(false);
      }
    };

    if (selectedProduct?.id && selectedProduct?.category?.id) {
      fetchSimilarProducts();
    }
  }, [selectedProduct?.id, selectedProduct?.category?.id]);

  // Update selectedColor when product changes
  useEffect(() => {
    if (selectedProduct?.color?.length > 0) {
      setSelectedColor(selectedProduct.color[0]);
    }
  }, [selectedProduct]);

  const handleColorSelect = (color) => {
    console.log("Selecting color:", color);
    setSelectedColor(color);
    if (color.photos && color.photos.length > 0) {
      const baseUrl = '/api/images';
      const photoUrl = color.photos[0].startsWith('http') ? color.photos[0] : `${baseUrl}/${color.photos[0]}`;
      console.log("Setting active image to:", photoUrl);
      setActiveImage({ src: photoUrl });
    }
  };

  const slidePrev = () => {
    if (carouselRef.current && carouselRef.current.slidePrev) {
      carouselRef.current.slidePrev();
    }
  };

  const slideNext = () => {
    if (carouselRef.current && carouselRef.current.slideNext) {
      carouselRef.current.slideNext();
    }
  };

  const responsive = {
    0: { 
      items: 1,
      itemsFit: "contain",
      stagePadding: {
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    480: { 
      items: 2,
      itemsFit: "contain",
      stagePadding: {
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    768: { 
      items: 3,
      itemsFit: "contain",
      stagePadding: {
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    1024: { 
      items: 4,
      itemsFit: "contain",
      stagePadding: {
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    1280: { 
      items: 5,
      itemsFit: "contain",
      stagePadding: {
        paddingLeft: 0,
        paddingRight: 0
      }
    }
  };

  const renderPrevButton = ({ isDisabled }) => {
    return (
      <IconButton
        className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isDisabled}
        onClick={slidePrev}
        sx={{
          '&:hover': {
            backgroundColor: 'white',
            transform: 'translateY(-50%) scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
          width: '32px',
          height: '32px',
          '@media (min-width: 768px)': {
            width: '40px',
            height: '40px',
            left: '-6px'
          }
        }}
      >
        <ChevronLeftIcon className="text-black" sx={{ fontSize: '1.25rem' }} />
      </IconButton>
    );
  };

  const renderNextButton = ({ isDisabled }) => {
    return (
      <IconButton
        className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isDisabled}
        onClick={slideNext}
        sx={{
          '&:hover': {
            backgroundColor: 'white',
            transform: 'translateY(-50%) scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
          width: '32px',
          height: '32px',
          '@media (min-width: 768px)': {
            width: '40px',
            height: '40px',
            right: '-6px'
          }
        }}
      >
        <ChevronRightIcon className="text-black" sx={{ fontSize: '1.25rem' }} />
      </IconButton>
    );
  };

  // Function to handle image click in review images section
  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
  };

  const handleNext = () => {
    if (selectedImageIndex < selectedImages.length - 1) {
      setSelectedImageIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
    }
  };

  // Update the review display section
  const renderReview = (item, i) => {
    console.log("Review item:", item);
    const reviewRating = item.rating !== undefined ? Number(item.rating) : 0;
    console.log("Parsed review rating:", reviewRating);
    const isUserReview = item.user?.id === parseInt(localStorage.getItem("userId"));
    
    return (
      <div key={i} className="py-6 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#b87d3b] flex items-center justify-center">
            <span className="text-xl font-semibold text-white">
              {item.user?.firstName?.[0]?.toUpperCase() || item.user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {item.user?.firstName ? `${item.user.firstName} ${item.user.lastName || ''}` : 'Anonymous User'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Rating
                    value={reviewRating}
                    readOnly
                    size="small"
                    precision={0.5}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#b87d3b',
                      },
                      '& .MuiRating-iconEmpty': {
                        color: '#d4d4d4',
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-[#b87d3b]">
                    {reviewRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              {isUserReview && (
                <div className="text-sm text-[#b87d3b] font-medium">
                  Your Review
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-700">{item.review}</p>
        {item.images && item.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.images.map((image, idx) => (
              <img
                key={idx}
                src={`http://localhost:5454${image}`}
                alt={`Review ${i + 1} image ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => handleImageClick(item.images, idx)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'http://localhost:5454/images/default.jpg';
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  // Update handleImageError to handle empty image case
  const handleImageError = (e) => {
    const baseUrl = '/api/images';
    console.error('Image failed to load:', e.target.src);
    e.target.src = ''; // Set to empty string instead of default image
    e.target.onerror = null; // Prevent infinite loop
  };

  // Similar Products Skeleton
  const SimilarProductsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-60 w-full"></div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </a>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                {selectedProduct?.category?.name || 'Category'}
              </a>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li className="text-gray-700 font-medium">
              {selectedProduct?.title}
            </li>
          </ol>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div 
              className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
              onClick={() => setShowFullImage(true)}
            >
              <img
                src={activeImage?.src || (selectedColor?.photos?.[0] ? 
                  `/api/images/${selectedColor.photos[0]}` : 
                  getProductImage(selectedProduct))}
                alt={selectedProduct?.title}
                className="h-full w-full object-contain object-center hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              {selectedColor?.photos?.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => handleSetActiveImage({ src: getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] }) })}
                  className={`relative aspect-w-1 aspect-h-1 overflow-hidden rounded-lg cursor-pointer ${
                    activeImage?.src === getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] })
                      ? 'ring-2 ring-[#b87d3b]'
                      : 'hover:ring-2 hover:ring-gray-200'
                  }`}
                >
                  <img
                    src={getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] })}
                    alt={`${selectedProduct?.title} - ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Brand */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedProduct?.title}
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                {selectedProduct?.brand}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <p className="text-3xl font-bold text-gray-900">
                ₹{selectedProduct?.discountedPrice}
              </p>
              <p className="text-xl text-gray-500 line-through">
                ₹{selectedProduct?.price}
              </p>
              <p className="text-lg font-medium text-green-600">
                {selectedProduct?.discountPercent}% Off
                </p>
              </div>

            {/* EMI Information */}
              <EMIInfo price={selectedProduct?.discountedPrice} />

            {/* Rating */}
            <div className="flex items-center space-x-4">
                  <Rating
                    name="product-rating"
                value={userRating || ratingStats.average || 0}
                    precision={0.5}
                    onChange={(event, newValue) => {
                      if (!ratingLoading) {
                        handleRatingSubmit(newValue);
                      }
                    }}
                    disabled={ratingLoading}
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#b87d3b',
                  },
                  '& .MuiRating-iconHover': {
                    color: '#a06c2a',
                  }
                }}
              />
              <span className="text-gray-600">
                {ratingStats.total || 0} Ratings
              </span>
              <span className="text-gray-600">
                {reviews.length || 0} Reviews
              </span>
              </div>

            {/* Size Selection with improved UI */}
            {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Size Option</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedProduct.sizes.map((size) => (
                        <button
                          key={size.name}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          disabled={size.quantity <= 0}
                          className={`
                        relative flex items-center justify-center rounded-md border py-2.5 px-3 text-sm font-medium uppercase
                        transition-all duration-200
                            ${
                              size.quantity > 0
                            ? "cursor-pointer bg-white text-gray-900 hover:bg-gray-50"
                                : "cursor-not-allowed bg-gray-50 text-gray-200"
                            }
                            ${
                              selectedSize?.name === size.name
                            ? "border-[#b87d3b] ring-1 ring-[#b87d3b]"
                            : "border-gray-300 hover:border-gray-400"
                            }
                          `}
                        >
                            {size.name}
                          {size.quantity <= 0 && (
                        <span className="absolute inset-0 flex items-center justify-center">
                              <svg
                            className="h-full w-full stroke-2 text-gray-200"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                stroke="currentColor"
                              >
                            <line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
            )}

            {/* Color Selection with improved UI */}
            {selectedProduct?.color && selectedProduct.color.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Color Option</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedProduct.color.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color)}
                      className={`
                        relative flex items-center p-1.5 rounded-md border transition-all duration-200
                        ${selectedColor?.id === color.id 
                          ? 'border-[#b87d3b] ring-1 ring-[#b87d3b]' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={color.photos && color.photos.length > 0 ? 
                              `/api/images/${color.photos[0]}` : 
                              getProductImage(selectedProduct)}
                            alt={color.name}
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                </div>
                        <span className="text-sm font-medium text-gray-900">
                          {color.name} Finish
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center">
                <div className="flex items-center border border-gray-300 rounded-md">
                      <IconButton 
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || loading}
                        size="small"
                    sx={{ 
                      color: '#666',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                      >
                        <RemoveIcon />
                      </IconButton>
                  <span className="px-6 py-1 text-gray-900 font-medium">QTY {quantity}</span>
                      <IconButton 
                        onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10 || loading}
                        size="small"
                    sx={{ 
                      color: '#666',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                      >
                        <AddIcon />
                      </IconButton>
                    </div>
              </div>
                  </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                disabled={!selectedSize || loading}
                    sx={{ 
                  py: 2,
                  backgroundColor: '#b87d3b',
                  '&:hover': {
                    backgroundColor: '#a06c2a',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                  },
                  fontWeight: 600,
                  fontSize: '1rem'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : !selectedSize ? (
                      "Select a Size"
                    ) : (
                      "Add To Cart"
                    )}
                  </Button>
                </div>
          </div>
            </div>

        {/* Description and Details */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {selectedProduct?.description}
                  </p>
                </div>
              </div>

        {/* Similar Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Similar Products</h2>
          
          {loadingSimilar ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress sx={{ color: '#b87d3b' }} />
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="relative px-8">
              <div className="overflow-hidden">
                <AliceCarousel
                  mouseTracking
                  items={similarProducts.map((product) => (
                    <div key={product.id} className="px-2" onClick={() => navigate(`/product/${product.id}`)}>
                      <div className="w-full max-w-[280px] mx-auto cursor-pointer">
                        <div className="aspect-square relative group overflow-hidden rounded-lg">
                          <img
                            src={getProductImage(product)}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={handleImageError}
                          />
                          {product.discountPercent > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                              {product.discountPercent}% OFF
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <h3 className="text-lg font-medium text-gray-900 truncate hover:text-[#b87d3b]">
                            {product.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="text-lg font-semibold text-gray-900">
                              ₹{product.discountedPrice}
                            </span>
                            {product.discountPercent > 0 && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Rating 
                              value={product.rating || 0} 
                              readOnly 
                              precision={0.5}
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#b87d3b',
                                },
                              }}
                            />
                            <span className="ml-1 text-sm text-gray-500">
                              ({product.reviews?.length || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  responsive={{
                    0: { items: 1 },
                    640: { items: 2 },
                    1024: { items: 3 },
                    1280: { items: 4 },
                  }}
                  controlsStrategy="responsive"
                  disableDotsControls
                  renderPrevButton={({ isDisabled }) => (
                    <button
                      className={`absolute -left-4 top-[140px] z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      disabled={isDisabled}
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  )}
                  renderNextButton={({ isDisabled }) => (
                    <button
                      className={`absolute -right-4 top-[140px] z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      disabled={isDisabled}
                    >
                      <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No similar products found
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>
          
          <div className="bg-[#faf9f8] p-8 rounded-lg">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left side - Overall Rating */}
              <div className="md:w-1/3 flex flex-col items-center justify-center border-r border-gray-200">
                <div className="text-6xl font-medium mb-2">
                  {ratingStats.average?.toFixed(1) || "0.0"}
                </div>
                <div className="flex mb-2">
                  <Rating
                    name="read-only"
                    value={ratingStats.average || 0}
                    precision={0.5}
                    readOnly
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#b87d3b',
                      }
                    }}
                  />
                </div>
                <p className="text-gray-600">{ratingStats.total || 0} Ratings</p>
                <p className="text-gray-600">{reviews?.length || 0} Reviews</p>
                </div>

              {/* Right side - Rating Distribution */}
              <div className="md:w-2/3">
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const { count, percentage } = ratingStats.distribution[rating];
                    return (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="w-12 text-sm">{rating} ★</div>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#b87d3b] transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                          />
                          </div>
                        <div className="w-24 text-sm text-right">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                    onClick={() => setReviewModalOpen(true)}
                  className="mt-8 w-full bg-[#b87d3b] text-white py-3 px-6 rounded hover:bg-[#a06c2a] transition-colors"
                  >
                  WRITE A REVIEW
                </button>
              </div>
            </div>
          </div>

          {/* Review Images Section */}
          {reviews.some(review => review.images && review.images.length > 0) && (
            <div className="mt-10">
              <h3 className="text-xl font-medium mb-4">Review images</h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {reviews
                  .reduce((acc, review) => {
                    if (review.images && review.images.length > 0) {
                      acc.push(...review.images.map(img => img.startsWith('/') ? img : `/${img}`));
                    }
                    return acc;
                  }, [])
                  .slice(0, 23)
                  .map((image, index, allImages) => (
                    <div 
                      key={index} 
                      className="w-14 h-14 relative cursor-pointer"
                      onClick={() => handleImageClick(allImages, index)}
                    >
                      <img
                        src={`http://localhost:5454${image}`}
                        alt={`Review ${index + 1}`}
                        className="w-full h-full object-cover rounded-md hover:opacity-75 transition-opacity"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'http://localhost:5454/images/default.jpg';
                        }}
                      />
                    </div>
                  ))}
                {reviews.reduce((count, review) => count + (review.images?.length || 0), 0) > 23 && (
                  <div className="w-14 h-14 bg-black/60 rounded-md flex items-center justify-center text-white cursor-pointer hover:bg-black/70 transition-colors">
                    <span className="text-xs">+{reviews.reduce((count, review) => count + (review.images?.length || 0), 0) - 23}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Individual Reviews */}
          <div className="mt-10">
            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {reviews.map((item, i) => renderReview(item, i))}
            </div>
          ) : (
              <div className="text-center py-8">
                <Typography variant="body1" color="textSecondary">
                  No reviews yet. Be the first to review this product!
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      <Dialog
        open={showFullImage}
        onClose={() => setShowFullImage(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '100vh',
            margin: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: 'none',
            position: 'relative'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }
        }}
      >
        <div className="relative h-full w-full flex items-center justify-center backdrop-blur-md bg-white/30">
          <IconButton
            onClick={() => setShowFullImage(false)}
            className="absolute right-4 top-4 z-10"
            sx={{
              color: '#666',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          <div className="relative w-full h-full flex items-center justify-center p-8">
            {selectedColor?.photos?.length > 1 && (
              <>
                <IconButton
                  className="absolute left-4 z-10"
                  onClick={() => {
                    const currentIndex = selectedColor.photos.findIndex(
                      photo => getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] }) === activeImage?.src
                    );
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : selectedColor.photos.length - 1;
                    handleSetActiveImage({ 
                      src: getProductImage({ ...selectedProduct, color: [{ photos: [selectedColor.photos[newIndex]] }] })
                    });
                  }}
                  sx={{
                    color: '#666',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <NavigateBeforeIcon sx={{ fontSize: 40 }} />
                </IconButton>
                <IconButton
                  className="absolute right-4 z-10"
                  onClick={() => {
                    const currentIndex = selectedColor.photos.findIndex(
                      photo => getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] }) === activeImage?.src
                    );
                    const newIndex = currentIndex < selectedColor.photos.length - 1 ? currentIndex + 1 : 0;
                    handleSetActiveImage({ 
                      src: getProductImage({ ...selectedProduct, color: [{ photos: [selectedColor.photos[newIndex]] }] })
                    });
                  }}
                  sx={{
                    color: '#666',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <NavigateNextIcon sx={{ fontSize: 40 }} />
                </IconButton>
              </>
            )}
            
            <img
              src={activeImage?.src || (selectedColor?.photos?.[0] ? 
                `/api/images/${selectedColor.photos[0]}` : 
                getProductImage(selectedProduct))}
              alt={selectedProduct?.title}
              className="max-h-full max-w-full object-contain"
              style={{ 
                transform: 'scale(1.1)',
                transition: 'transform 0.3s ease-in-out'
              }}
              onError={handleImageError}
            />
          </div>

          {/* Thumbnail strip at bottom */}
          {selectedColor?.photos?.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex justify-center gap-2 px-4">
                {selectedColor.photos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => handleSetActiveImage({ 
                      src: getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] })
                    })}
                    className={`
                      w-16 h-16 rounded-lg overflow-hidden cursor-pointer
                      ${activeImage?.src === getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] })
                        ? 'ring-2 ring-[#b87d3b] bg-white/80'
                        : 'opacity-70 hover:opacity-100 bg-white/60'
                      }
                      transition-all duration-200
                    `}
                  >
                    <img
                      src={getProductImage({ ...selectedProduct, color: [{ photos: [photo] }] })}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={!!error || !!success} 
        autoHideDuration={6000} 
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert 
          onClose={() => {
            setError(null);
            setSuccess(null);
          }} 
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ProductDetails;
