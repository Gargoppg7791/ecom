import React, { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CircularProgress } from "@mui/material";
import Navigation from "../customer/Components/Navbar/Navigation";
import Footer from "../customer/Components/footer/Footer";
import AuthModal from "../customer/Components/Auth/AuthModal";
import VerifyEmail from "../customer/Components/Auth/VerifyEmail";
import ResetPassword from "../customer/Components/Auth/ResetPassword";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../Redux/Auth/Action";
import { getCart } from "../Redux/Customers/Cart/Action";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { customTheme, customerTheme } from "../Admin/theme/customeThem";
import Login from "../customer/Components/Auth/Login";
import Register from "../customer/Components/Auth/Register";
import ForgotPassword from "../customer/Components/Auth/ForgotPassword";

// Preload critical components
const preloadComponent = (importFn) => {
  const component = lazy(importFn);
  importFn().then(); // Start loading the component
  return component;
};

// Lazy load components with preloading
const Homepage = preloadComponent(() => import("../Pages/Homepage"));
const Cart = preloadComponent(() => import("../customer/Components/Cart/Cart"));
const Order = preloadComponent(() => import("../customer/Components/orders/Order"));
const OrderConfirm = lazy(() => import("../customer/Components/paymentSuccess/OrderConfirm"));
const PaymentSuccess = preloadComponent(() => import("../customer/Components/paymentSuccess/PaymentSuccess"));
const ProductDetails = preloadComponent(() => import("../customer/Components/Product/ProductDetails/ProductDetails"));
const ProductPage = preloadComponent(() => import("../Pages/ProductPage"));
const Checkout = lazy(() => import("../customer/Components/Checkout/Checkout"));
const AddressForm = lazy(() => import("../customer/Components/Checkout/AddressForm"));
const OrderTrack = lazy(() => import("../customer/Components/orders/OrderTrack"));
const Profile = lazy(() => import("../customer/Components/Profile/Profile"));
const SearchResults = preloadComponent(() => import("../Pages/SearchResults"));
const CategoryPage = preloadComponent(() => import("../Pages/CategoryPage"));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
        <CircularProgress size={60} />
        <div className="mt-4 text-gray-600">Loading...</div>
    </div>
);

// Auth Route Component
const AuthRoute = ({ type }) => {
    const navigate = useNavigate();
    const auth = useSelector((store) => store.auth);
    const jwt = localStorage.getItem("jwt");
  
    useEffect(() => {
      if (auth?.user && jwt) {
        navigate("/");
      }
    }, [auth, jwt, navigate]);
  
    return (
      <>
        <Homepage />
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            {type === 'login' && <Login />}
            {type === 'register' && <Register />}
            {type === 'forgot' && <ForgotPassword />}
          </div>
        </div>
      </>
    );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const jwt = localStorage.getItem("jwt");
    const auth = useSelector((store) => store.auth);
    const location = useLocation();

    useEffect(() => {
        if (!jwt || !auth?.user) {
            // Store the current path to redirect back after login
            localStorage.setItem('redirectPath', location.pathname);
            navigate('/login');
        }
    }, [jwt, auth, navigate, location.pathname]);

    if (!jwt || !auth?.user) {
        return <LoadingFallback />;
    }

    return children;
};

const CustomerRoutes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector((store) => store.auth);
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [authModalType, setAuthModalType] = useState('register');
    const jwt = localStorage.getItem("jwt");
    const hideNavFooter = ["/checkout", "/order-confirm", "/payment-success"];

    useEffect(() => {
        if (jwt) {
            dispatch(getUser(jwt));
            dispatch(getCart(jwt));
        }
    }, [jwt, dispatch]);

    // Add this useEffect to handle URL-based modal opening
    useEffect(() => {
        console.log("Current path:", location.pathname); // Debug log
        if (location.pathname === '/login') {
            console.log("Opening login modal"); // Debug log
            setAuthModalType('login');
            setOpenAuthModal(true);
        } else if (location.pathname === '/register') {
            console.log("Opening register modal"); // Debug log
            setAuthModalType('register');
            setOpenAuthModal(true);
        } else if (location.pathname === '/forgot-password') {
            setAuthModalType('forgot');
            setOpenAuthModal(true);
        }
    }, [location.pathname]);

    const handleCloseModal = () => {
        setOpenAuthModal(false);
        // Navigate to home only if we're on an auth route
        if (['/login', '/register', '/forgot-password'].includes(location.pathname)) {
            navigate('/');
        }
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="min-h-screen flex flex-col">
                <ThemeProvider theme={customerTheme}>
                    {!hideNavFooter.includes(location.pathname) && <Navigation />}
                    <div className="flex-grow">
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                <Route path="/" element={<Homepage />} />
                                {/* Use AuthRoute for auth routes */}
                                <Route path="/login" element={<AuthRoute type="login" />} />
                                <Route path="/register" element={<AuthRoute type="register" />} />
                                <Route path="/forgot-password" element={<AuthRoute type="forgot" />} />
                                {/* Other routes */}
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/account/order" element={<Order />} />
                                <Route path="/order-confirm" element={<OrderConfirm />} />
                                <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />
                                <Route path="/product/:productId" element={<ProductDetails />} />
                                <Route path="/products" element={<ProductPage />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/account/address" element={<AddressForm />} />
                                <Route path="/account/order/:orderId" element={<OrderTrack />} />
                                <Route path="/account/profile" element={<Profile />} />
                                <Route path="/search" element={<SearchResults />} />
                                <Route path="/category/:categoryId" element={<CategoryPage />} />
                                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                                <Route path="/verify-success" element={<VerifyEmail />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                            </Routes>
                        </Suspense>
                    </div>
                    {!hideNavFooter.includes(location.pathname) && <Footer />}

                    {/* Auth Modal */}
                    <AuthModal 
                        open={openAuthModal}
                        handleClose={handleCloseModal}
                        type={authModalType}
                    />
                </ThemeProvider>
            </div>
        </GoogleOAuthProvider>
    );
};

export default CustomerRoutes;