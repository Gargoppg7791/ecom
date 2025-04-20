import React from 'react';
import AliceCarousel from "react-alice-carousel";
import HomeProductCard from "./HomeProductCard";
import "./HomeProductSection.css";
import { Button } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRef } from "react";
import ProductCardSkeleton from './ProductCardSkeleton';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomeProductSection = ({ section, data, loading, categoryId }) => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const slidePrev = () => carouselRef.current?.slidePrev();
  const slideNext = () => carouselRef.current?.slideNext();

  const handleViewAll = () => {
    if (id) {
      navigate(`/category/${id}`);
    } else {
      navigate('/products');
    }
  };

  const responsive = {
    0: { items: 2, itemsFit: "contain" },
    568: { items: 3, itemsFit: "contain" },
    1024: { items: 5.5, itemsFit: "contain" },
  };

  const items = loading 
    ? Array(5).fill(null).map((_, index) => (
        <div className="px-4" key={`skeleton-${index}`}>
          <ProductCardSkeleton />
        </div>
      ))
    : data?.slice(0, 10).map((item, index) => (
        <div
          key={item.id}
          className="px-4"
          style={{ marginRight: index !== data.length - 1 ? "20px" : "0px" }}
        >
          <HomeProductCard product={item} />
        </div>
      )) || [];

  const renderPrevButton = ({ isDisabled }) => {
    return (
      <button
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
        disabled={isDisabled}
        onClick={slidePrev}
      >
        <ChevronLeftIcon />
      </button>
    );
  };

  const renderNextButton = ({ isDisabled }) => {
    return (
      <button
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
        disabled={isDisabled}
        onClick={slideNext}
      >
        <ChevronRightIcon />
      </button>
    );
  };

  return (
    <div className="relative px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-5">
        <h2 className="text-2xl font-extrabold text-gray-900">{section}</h2>
        <Button
          variant="outlined"
          className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>
      <div className="relative border p-5">
        <AliceCarousel
          ref={carouselRef}
          disableButtonsControls
          disableDotsControls
          items={items}
          responsive={responsive}
          animationType="fadeout"
          animationDuration={400}
          infinite={false}
          autoPlay={false}
          controlsStrategy="alternate"
          touchTracking={false}
          swipeDelta={5}
          paddingLeft={20}
          paddingRight={20}
          renderPrevButton={renderPrevButton}
          renderNextButton={renderNextButton}
        />
      </div>
    </div>
  );
};

export default HomeProductSection;