import React, { useState, useEffect } from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { useNavigate } from "react-router-dom";
import api from "../../../config/api";
import { getImageUrl } from "../../../utils/imageUtils";
import { Button } from "@mui/material";

const handleDragStart = (e) => e.preventDefault();

const HomeCarousel = () => {
  const navigate = useNavigate();
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        console.log('🎠 Fetching carousel items...');
        setLoading(true);
        const response = await api.get("/api/carousel/active");
        console.log('🎠 Carousel API response:', response.data);
        
        if (!response.data || response.data.length === 0) {
          console.log('🎠 No carousel items found');
        } else {
          console.log(`🎠 Found ${response.data.length} carousel items`);
          response.data.forEach((item, index) => {
            console.log(`🎠 Item ${index + 1}:`, {
              id: item.id,
              image: item.image,
              title: item.title,
              active: item.active
            });
          });
        }
        
        setCarouselItems(response.data);
        setError(null);
      } catch (err) {
        console.error("🎠 Error fetching carousel items:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        setError("Failed to load carousel items. Please try again later.");
      } finally {
        setLoading(false);
        console.log('🎠 Carousel fetch completed');
      }
    };

    fetchCarouselItems();
  }, []);

  const renderDotsItem = ({ isActive }) => (
    <button
      className={`w-2 h-2 rounded-full transition-all duration-500 mx-1 ${
        isActive ? 'bg-white scale-125 w-4' : 'bg-white/50 hover:bg-white/70'
      }`}
    />
  );

  const items = carouselItems.map((item, index) => {
    console.log(`🎠 Rendering carousel item ${index + 1}:`, {
      imageUrl: item.imageUrl,
      title: item.title
    });
    
    const imageUrl = getImageUrl(item.imageUrl);

    return (
      <div key={index} className="relative w-full h-[300px] md:h-[400px] group overflow-hidden bg-[#FFF9E5]">
        <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16">
          {/* Left side content */}
          <div className="w-1/2 space-y-4 z-[2]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500 font-bold">LIMITED TIME</span>
              <span className="bg-red-500 text-white px-2 py-1 rounded">OFFER</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 transform translate-y-0 transition-all duration-1000">
              {item.title || "Biggest Festive Sale"}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-500 text-white text-lg md:text-2xl font-bold px-4 py-2 rounded-full">
                UPTO 75% OFF
              </span>
              <div className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-sm font-semibold">
                +EXTRA 20% OFF
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Use Coupon Code</p>
              <div className="bg-red-500 text-white px-4 py-2 inline-block rounded font-bold">
                FESTIVE20
              </div>
            </div>
            <Button
              variant="contained"
              className="mt-4 bg-[#8B4513] hover:bg-[#6B3410] text-white px-6 py-2 rounded-md transform translate-y-0 transition-all duration-1000"
              onClick={() => navigate('/products')}
            >
              Shop Now
            </Button>
          </div>

          {/* Right side image */}
          <div className="w-1/2 h-full relative">
            <img
              className="w-full h-full object-contain transform scale-100 transition-transform duration-[2000ms]"
              src={imageUrl}
              alt={item.title || `Carousel item ${index + 1}`}
              onDragStart={handleDragStart}
              role="presentation"
              onError={(e) => {
                console.error(`🎠 Failed to load image for item ${index + 1}:`, imageUrl);
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
              }}
              onLoad={() => {
                console.log(`🎠 Successfully loaded image for item ${index + 1}:`, imageUrl);
              }}
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 opacity-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-100 opacity-50 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    );
  });

  if (loading) {
    console.log('🎠 Carousel is loading...');
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    console.log('🎠 Carousel encountered an error:', error);
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (carouselItems.length === 0) {
    console.log('🎠 No carousel items to display');
    return null;
  }

  return (
    <div className="relative w-full bg-[#FFF9E5] rounded-lg overflow-hidden shadow-lg">
      <AliceCarousel
        mouseTracking={false}
        touchTracking={false}
        items={items}
        disableButtonsControls
        renderDotsItem={renderDotsItem}
        infinite
        autoPlay
        autoPlayInterval={3000}
        animationDuration={1000}
        autoPlayStrategy="all"
        paddingLeft={0}
        paddingRight={0}
      />
    </div>
  );
};

export default HomeCarousel;