import { Fragment, useEffect, useState, memo } from "react";
import { Dialog, Popover, Tab, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Divider, Collapse } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { deepPurple } from "@mui/material/colors";
import { getUser, logout } from "../../../Redux/Auth/Action";
import { getCart } from "../../../Redux/Customers/Cart/Action";
import api from "../../../config/api";
import AuthModal from "../Auth/AuthModal";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { fetchCategories } from "../../../Redux/Customers/Category/Action";
import axios from "axios";
import React from "react";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const SearchBar = memo(({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hidden md:block flex-grow max-w-xl mx-4">
      <div className="relative w-full">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full border border-gray-300 rounded-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          placeholder="Search for products..."
        />
        <button type="submit" className="absolute inset-y-0 left-0 flex items-center justify-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400 hover:text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.716 14.966A7.25 7.25 0 1114.35 8.33a7.25 7.25 0 01-6.634 6.635zM15.5 9.75a5.75 5.75 0 10-11.5 0 5.75 5.75 0 0011.5 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  );
});

const CategoryDropdown = memo(({ category, onCategoryClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [thirdLevelCategories, setThirdLevelCategories] = useState({});
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await api.get(`/api/categories/${category.id}/children`);
        setSubCategories(response.data);
        
        const thirdLevelPromises = response.data.map(async (subCategory) => {
          try {
            const thirdLevelResponse = await api.get(`/api/categories/${subCategory.id}/children`);
            return {
              [subCategory.id]: thirdLevelResponse.data
            };
          } catch (error) {
            console.error(`Error fetching third level categories for ${subCategory.id}:`, error);
            return { [subCategory.id]: [] };
          }
        });

        const thirdLevelResults = await Promise.all(thirdLevelPromises);
        const combinedThirdLevel = thirdLevelResults.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        setThirdLevelCategories(combinedThirdLevel);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    if (isHovered) {
      fetchSubCategories();
    }
  }, [category.id, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = (e) => {
    if (dropdownRef.current && e.relatedTarget instanceof Node) {
      if (!dropdownRef.current.contains(e.relatedTarget)) {
        setIsHovered(false);
      }
    } else {
      setIsHovered(false);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="font-medium text-gray-800 hover:text-[#8B4513] transition-colors flex items-center py-4 px-3 uppercase text-sm tracking-wide"
        onClick={() => onCategoryClick(category)}
      >
        {category.name}
      </button>
      
      {isHovered && subCategories.length > 0 && (
        <div 
          className="fixed left-0 bg-white shadow-lg border-t border-[#8B4513] z-50"
          style={{ 
            width: '100%',
            maxWidth: '1215px',
            top: '115px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 py-8">
              {subCategories.map((subCategory, index) => (
                <div key={subCategory.id} className="min-w-[200px] relative">
                  {index > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className="px-4 sm:px-8">
                    <button
                      type="button"
                      className="text-left font-semibold text-gray-900 hover:text-[#8B4513] transition-colors mb-4 text-base w-full uppercase tracking-wide"
                      onClick={() => onCategoryClick(subCategory)}
                    >
                      {subCategory.name}
                    </button>
                    
                    {thirdLevelCategories[subCategory.id]?.length > 0 && (
                      <ul className="space-y-3">
                        {thirdLevelCategories[subCategory.id].map((thirdCategory) => (
                          <li key={thirdCategory.id}>
                            <button
                              type="button"
                              className="text-left text-sm text-gray-600 hover:text-[#8B4513] transition-colors w-full py-1.5 uppercase tracking-wide"
                              onClick={() => onCategoryClick(thirdCategory)}
                            >
                              {thirdCategory.name}
                            </button>
                          </li>
                        ))}
                      </ul> 
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const MobileDrawer = memo(({ open, onClose, categories = [], onCategoryClick }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const [thirdLevelCategories, setThirdLevelCategories] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categories || categories.length === 0) return;
      
      setLoading(true);
      const subCategoriesData = {};
      const thirdLevelData = {};

      try {
        for (const category of categories) {
          if (!category?.id) continue;

          try {
            const response = await api.get(`/api/categories/${category.id}/children`);
            subCategoriesData[category.id] = response.data || [];

            // Fetch third level categories for each subcategory
            for (const subCategory of response.data || []) {
              if (!subCategory?.id) continue;

              try {
                const thirdLevelResponse = await api.get(`/api/categories/${subCategory.id}/children`);
                thirdLevelData[subCategory.id] = thirdLevelResponse.data || [];
              } catch (error) {
                console.error(`Error fetching third level categories for ${subCategory.id}:`, error);
                thirdLevelData[subCategory.id] = [];
              }
            }
          } catch (error) {
            console.error(`Error fetching subcategories for ${category.id}:`, error);
            subCategoriesData[category.id] = [];
          }
        }
      } finally {
        setLoading(false);
      }

      setSubCategories(subCategoriesData);
      setThirdLevelCategories(thirdLevelData);
    };

    fetchSubCategories();
  }, [categories]);

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryClick = (category) => {
    if (!category?.id) return;
    onCategoryClick(category);
    onClose();
  };

  const renderCategoryItem = (category, level = 0) => {
    if (!category?.id) return null;

    const hasChildren = Array.isArray(subCategories[category.id]) && subCategories[category.id].length > 0;
    const isExpanded = expandedCategories[category.id];
    const paddingLeft = `${level * 12}px`;

    return (
      <React.Fragment key={category.id}>
        <ListItem 
          button 
          onClick={() => hasChildren ? handleCategoryToggle(category.id) : handleCategoryClick(category)}
          className={`group hover:bg-gray-50 py-0.5 transition-all duration-200 ${
            level > 0 ? 'border-l border-gray-200' : ''
          }`}
          style={{ paddingLeft }}
        >
          <ListItemText 
            primary={category.name || 'Unnamed Category'} 
            primaryTypographyProps={{
              className: `text-[7px] uppercase tracking-wider transition-colors duration-200 ${
                level === 0 
                  ? 'font-semibold text-gray-900 group-hover:text-[#8B4513]' 
                  : 'font-medium text-gray-700 group-hover:text-[#8B4513]'
              }`
            }}
          />
          {hasChildren && (
            <KeyboardArrowDownIcon 
              className={`transform transition-all duration-300 ${
                isExpanded ? 'rotate-180' : ''
              } text-gray-400 group-hover:text-[#8B4513]`}
              style={{ fontSize: '0.6rem' }}
            />
          )}
        </ListItem>

        <Collapse 
          in={isExpanded && hasChildren} 
          timeout="auto" 
          unmountOnExit
          className="bg-gray-50/20"
        >
          <List component="div" disablePadding>
            {(subCategories[category.id] || []).map((subCategory) => (
              <React.Fragment key={subCategory.id}>
                {renderCategoryItem(subCategory, level + 1)}
                {Array.isArray(thirdLevelCategories[subCategory.id]) && thirdLevelCategories[subCategory.id].length > 0 && (
                  <List component="div" disablePadding className="bg-gray-100/20">
                    {thirdLevelCategories[subCategory.id].map((thirdCategory) => (
                      renderCategoryItem(thirdCategory, level + 2)
                    ))}
                  </List>
                )}
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '85%',
          maxWidth: '400px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '& .MuiDrawer-paper': {
            backgroundColor: 'white',
            backgroundImage: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
          }
        }
      }}
      SlideProps={{
        timeout: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center p-3 border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-[#8B4513] mr-3 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/ddkso1wxi/image/upload/v1675919455/Logo/Copy_of_Zosh_Academy_nblljp.png"
              alt="Ecom"
              className="h-6 w-6 mr-2"
            />
            <span className="font-bold text-gray-800 text-sm">
              E-comm
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#8B4513] border-t-transparent"></div>
            </div>
          ) : (
            <List className="py-0">
              {Array.isArray(categories) && categories.map((category) => (
                <React.Fragment key={category.id}>
                  {renderCategoryItem(category)}
                  {category !== categories[categories.length - 1] && (
                    <Divider className="my-0 opacity-20" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </div>
      </div>
    </Drawer>
  );
});

const UserMenu = memo(({ user, anchorEl, onClose, onLogout, onMyOrders }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Avatar
        className="text-white"
        onClick={(e) => e.currentTarget && onClose(e)}
        aria-controls={Boolean(anchorEl) ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? "true" : undefined}
        sx={{
          bgcolor: deepPurple[500],
          color: "white",
          cursor: "pointer",
        }}
        src={user?.avatar}
      >
        {!user?.avatar && user?.firstName?.[0]?.toUpperCase()}
      </Avatar>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => onClose(null)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => onClose(null)}>Profile</MenuItem>
      <MenuItem onClick={onMyOrders}>My Orders</MenuItem>
      <MenuItem onClick={onLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
});

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((store) => store.auth) || {};
  const { cart } = useSelector((store) => store.cart) || {};
  const { categories, loading: categoriesLoading } = useSelector((store) => store.category) || {};
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const jwt = localStorage.getItem("jwt");
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (jwt) {
      dispatch(getUser(jwt));
      dispatch(getCart(jwt));
    }
  }, [jwt, dispatch]);

  useEffect(() => {
    if (auth?.user) {
      setOpenAuthModal(false);
    }
    if (auth?.user?.role !== "ADMIN" && (location.pathname === "/login" || location.pathname === "/register")) {
      navigate(-1);
    }
  }, [auth?.user, location.pathname, navigate]);

  const handleUserClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleOpen = () => {
    navigate('/login');
  };

  const handleClose = () => {
    setOpenAuthModal(false);
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.id}`);
    setShowMenu(false);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    dispatch(logout());
    navigate("/");
  };

  const handleProfileClick = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        navigate("/login");
        return;
      }
      await dispatch(getUser(jwt));
      navigate("/account/profile");
    } catch (error) {
      console.error("Error navigating to profile:", error);
      dispatch(logout());
      navigate("/login");
    }
  };

  const handleMyOrderClick = () => {
    handleCloseUserMenu();
    navigate("/account/order");
  };

  const handleShowMenu = () => {
    setShowMenu(prev => !prev);
  };

  return (
    <Fragment>
      <nav className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={handleShowMenu} 
                className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8B4513]"
                aria-label="Toggle menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center">
                <img
                  src="/Logo.png"
                  alt="Omkar Wood"
                  className="h-10 w-10 mr-2"
                />
                <span className="font-bold text-gray-800 text-lg">
                  Omkar Wood
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <SearchBar />

              <div className="hidden md:flex items-center space-x-6">
                {auth?.user ? (
                  <>
                    <button onClick={handleProfileClick}>
                      <Avatar
                        sx={{
                          bgcolor: deepPurple[500],
                          color: "white",
                          width: 32,
                          height: 32,
                          cursor: "pointer"
                        }}
                        src={auth.user.avatar}
                      >
                        {!auth.user.avatar && auth.user.firstName?.[0]?.toUpperCase()}
                      </Avatar>
                    </button>
                    <Link to="/account/order" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                      <span>Orders</span>
                    </Link>
                    <button onClick={handleLogout} className="text-gray-700 hover:text-[#8B4513] transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <button onClick={handleOpen} className="text-gray-700 hover:text-[#8B4513] transition-colors">
                    Login
                  </button>
                )}
                <Link to="/cart" className="text-gray-700 hover:text-[#8B4513] transition-colors flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-1" />
                  <span>Cart</span>
                  {cart?.cart?.totalItem > 0 && (
                    <span className="ml-1 bg-[#8B4513] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.cart.totalItem}
                    </span>
                  )}
                </Link>
              </div>

              <div className="md:hidden flex items-center space-x-4">
                {auth?.user ? (
                  <Link to="/account/profile" className="text-gray-700 hover:text-[#8B4513] p-2">
                    <PersonIcon className="h-6 w-6" />
                  </Link>
                ) : (
                  <button onClick={handleOpen} className="text-gray-700 hover:text-[#8B4513] p-2">
                    <PersonIcon className="h-6 w-6" />
                  </button>
                )}
                <Link to="/cart" className="text-gray-700 hover:text-[#8B4513] p-2 relative">
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cart?.cart?.totalItem > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.cart.totalItem}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Categories Section */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-start space-x-8">
            {!categoriesLoading && categories?.map((category) => (
              <li key={category.id} className="relative">
                <CategoryDropdown 
                  category={category} 
                  onCategoryClick={handleCategoryClick}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <MobileDrawer 
        open={showMenu} 
        onClose={() => setShowMenu(false)} 
        categories={categories || []} 
        onCategoryClick={handleCategoryClick}
      />
      <AuthModal open={openAuthModal} handleClose={handleClose} />
    </Fragment>
  );
};

export default memo(Navigation);