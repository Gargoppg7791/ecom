import React, { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import HomeCarousel from "../customer/Components/Carousel/HomeCarousel";
import HomeProductSection from "../customer/Components/Home/HomeProductSection";
import NewArrivalsSection from "../customer/Components/Home/NewArrivalsSection";
import { findProducts } from "../Redux/Customers/Product/Action";
import api from "../config/api";
import { Button, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getImageUrl, DEFAULT_CATEGORY_IMAGE } from "../utils/imageUtils";

// Lazy load the product card component
const HomeProductCard = lazy(() => import("../customer/Components/Home/HomeProductCard"));

// Loading placeholder for product card
const ProductCardSkeleton = () => (
  <div className="flex flex-col bg-white overflow-hidden w-[30rem] mx-3">
    <Skeleton variant="rectangular" width="100%" height={350} />
    <div className="p-4 w-full space-y-3">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex gap-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  </div>
);

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [categoryHierarchy, setCategoryHierarchy] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [productsLoaded, setProductsLoaded] = useState(false);

  const products = useSelector((store) => store.customersProduct.products?.content || []);
  const loading = useSelector((store) => store.customersProduct.loading);
  const error = useSelector((store) => store.customersProduct.error);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.dataset.category]));
          }
        });
      },
      { rootMargin: "100px" }
    );

    document.querySelectorAll("[data-category]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categoryHierarchy]);

  useEffect(() => {
    const fetchCategoryHierarchy = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get("/api/categories");
        const topLevelCategories = response.data.filter((cat) => cat.level === 1);
        console.log("Top level categories:", topLevelCategories);

        // Preload category images
        const preloadedCategories = await Promise.all(
          topLevelCategories.map(async (category) => {
            if (category.imageUrl) {
              try {
                const fullImageUrl = getImageUrl(category.imageUrl);
                await new Promise((resolve, reject) => {
                  const img = new Image();
                  img.onload = () => {
                    console.log(`Image loaded successfully for ${category.name}`);
                    category.imageLoaded = true;
                    resolve();
                  };
                  img.onerror = () => {
                    console.error(`Image failed to load for ${category.name}`, {
                      imageUrl: category.imageUrl,
                      fullUrl: fullImageUrl,
                    });
                    category.imageLoaded = false;
                    category.fallbackImage = DEFAULT_CATEGORY_IMAGE;
                    resolve();
                  };
                  img.src = fullImageUrl;
                });
              } catch (error) {
                console.error(`Error preloading image for ${category.name}:`, error);
                category.imageLoaded = false;
                category.fallbackImage = DEFAULT_CATEGORY_IMAGE;
              }
            }
            return category;
          })
        );

        setCategoryHierarchy(preloadedCategories);
      } catch (error) {
        console.error("Error fetching category hierarchy:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoryHierarchy();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await dispatch(
          findProducts({
            pageSize: 30,
            sort: "newest",
          })
        );
        setProductsLoaded(true);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [dispatch]);

  const categorizedProducts = useMemo(() => {
    const productList = products || [];
    const categorized = {};

    categoryHierarchy.forEach((topCategory) => {
      categorized[topCategory.name] = productList
        .filter(
          (p) =>
            p.category?.level === 3 &&
            p.category?.parentCategory?.parentCategory?.name === topCategory.name
        )
        .slice(0, 10);
    });

    productList.forEach((product) => {
      if (!product.category) return;

      let categoryName = "Featured Products";
      if (product.category.level === 3) {
        categoryName =
          product.category.parentCategory?.parentCategory?.name || "Featured Products";
      } else if (product.category.level === 2) {
        categoryName = product.category.parentCategory?.name || "Featured Products";
      } else if (product.category.level === 1) {
        categoryName = product.category.name || "Featured Products";
      }

      if (!categorized[categoryName]) {
        categorized[categoryName] = [];
      }
      if (!categorized[categoryName].includes(product)) {
        categorized[categoryName].push(product);
      }
    });

    Object.keys(categorized).forEach((category) => {
      categorized[category] = categorized[category].slice(0, 10);
    });

    return categorized;
  }, [products, categoryHierarchy]);

  if (loadingCategories) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="w-full h-[400px] bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {[1, 2, 3, 4, 5, 6, 8].map((item) => (
            <div key={item} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Carousel */}
      <div className="w-full">
        <HomeCarousel />
      </div>

      {/* Featured Categories Grid */}
      <div className="px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Shop By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryHierarchy.map((category) => (
            <div
              key={category.id}
              className="relative cursor-pointer group"
              onClick={() => navigate(`/category/${category.id}`)}
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={category.imageLoaded ? getImageUrl(category.imageUrl) : category.fallbackImage || DEFAULT_CATEGORY_IMAGE}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width={300}
                  height={300}
                  onError={(e) => {
                    console.error("Image load error for category:", category.name, {
                      imageUrl: category.imageUrl,
                      fullUrl: e.target.src,
                      error: e,
                    });
                    e.target.src = category.fallbackImage || DEFAULT_CATEGORY_IMAGE;
                    e.target.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold px-4 py-2 rounded bg-black/50">
                    {category.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals Section */}
      <NewArrivalsSection />

      {/* Featured Collections */}
      <div className="px-4 py-12 bg-[#F8F8F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 inline-block relative"
              style={{
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '4px',
                  backgroundColor: '#8B4513',
                  borderRadius: '2px',
                }
              }}
            >
              Featured Collections
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-lg overflow-hidden cursor-pointer group">
              <img 
                src="/images/living-room-collection.jpg" 
                alt="Living Room" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-3xl font-bold mb-2">Living Room Collection</h3>
                  <Button 
                    variant="outlined" 
                    className="text-white border-white hover:bg-white hover:text-[#8B4513]"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden cursor-pointer group">
              <img 
                src="/images/bedroom-collection.jpg" 
                alt="Bedroom" 
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-3xl font-bold mb-2">Bedroom Collection</h3>
                  <Button 
                    variant="outlined" 
                    className="text-white border-white hover:bg-white hover:text-[#8B4513]"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sections */}
      <div className="space-y-12 py-12">
        {Object.entries(categorizedProducts).map(([categoryName, products]) => (
          <div key={categoryName} className="px-4" data-category={categoryName}>
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-[#8B4513]">{categoryName}</h2>
                <div className="flex justify-center mb-8">
                  <Button
                    className="text-black hover:text-gray-600"
                    onClick={() => navigate(`/category/${categoryName.toLowerCase()}`)}
                    endIcon={<span className="text-lg">→</span>}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {!productsLoaded ? (
                  Array(3)
                    .fill(0)
                    .map((_, index) => <ProductCardSkeleton key={index} />)
                ) : (
                  products?.map((product) => (
                    product && (
                      <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
                        <HomeProductCard
                          product={product}
                          fallbackImage={DEFAULT_CATEGORY_IMAGE}
                        />
                      </Suspense>
                    )
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Store Locations */}
      <div className="bg-[#F8F8F8] px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 inline-block relative"
              style={{
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '4px',
                  backgroundColor: '#8B4513',
                  borderRadius: '2px',
                }
              }}
            >
              Our Stores
            </h2>
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
