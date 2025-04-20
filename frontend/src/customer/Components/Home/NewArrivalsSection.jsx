import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import AliceCarousel from 'react-alice-carousel';
import HomeProductCard from './HomeProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/api';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const NewArrivalsSection = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const carouselRef = React.useRef(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products', {
          params: {
            sort: 'newest',
            pageSize: 10
          }
        });
        setNewArrivals(response.data.content || []);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

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

  const handleViewAll = () => {
    navigate('/products?sort=newest');
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

  const items = loading 
    ? Array(5).fill(null).map((_, index) => (
        <div className="px-3" key={`skeleton-${index}`}>
          <ProductCardSkeleton />
        </div>
      ))
    : newArrivals?.map((item, index) => (
        <div
          key={item.id}
          className="px-3"
          style={{ 
            padding: "8px 0",
            width: "100%"
          }}
        >
          <HomeProductCard product={item} />
        </div>
      )) || [];

  const renderPrevButton = ({ isDisabled }) => {
    return (
      <IconButton
        className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white ${
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
        className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white ${
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

  return (
    <Box className="relative py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <Box className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Box className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <Box className="text-center sm:text-left">
            <Typography
              variant="h4"
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900"
              sx={{
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '3px',
                  backgroundColor: '#8B4513',
                  borderRadius: '2px',
                  '@media (min-width: 640px)': {
                    bottom: '-10px',
                    width: '100px',
                    height: '4px',
                  }
                }
              }}
            >
              New Arrivals
            </Typography>
          </Box>
          <Button
            className="text-black hover:text-gray-600 text-sm sm:text-base"
            onClick={handleViewAll}
            endIcon={<span className="text-base sm:text-lg">→</span>}
          >
            View All
          </Button>
        </Box>
        
        <Box 
          className="relative"
          sx={{
            '& .alice-carousel__stage-item': {
              padding: '4px 0',
              width: '100% !important',
              '@media (min-width: 640px)': {
                padding: '8px 0',
              }
            },
            '& .alice-carousel__stage': {
              padding: '4px 0',
              display: 'flex',
              gap: '8px',
              '@media (min-width: 640px)': {
                padding: '8px 0',
                gap: '16px',
              }
            },
            '& .alice-carousel__wrapper': {
              padding: '0 16px',
              '@media (min-width: 640px)': {
                padding: '0 24px',
              }
            }
          }}
        >
          <AliceCarousel
            ref={carouselRef}
            disableButtonsControls={false}
            disableDotsControls
            items={items}
            responsive={responsive}
            animationType="fadeout"
            animationDuration={400}
            infinite={false}
            autoPlay={false}
            controlsStrategy="alternate"
            touchTracking={true}
            mouseTracking={true}
            swipeDelta={5}
            paddingLeft={0}
            paddingRight={0}
            renderPrevButton={renderPrevButton}
            renderNextButton={renderNextButton}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default NewArrivalsSection; 