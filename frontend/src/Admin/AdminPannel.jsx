import * as React from "react";
import { Box, CssBaseline, Drawer, Toolbar, ThemeProvider, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Route, Routes, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logout } from "../Redux/Auth/Action";

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';

// Components
import AdminNavbar from "./Navigation/AdminNavbar";
import Dashboard from "./Views/Admin";
import CreateProductForm from "./componets/createProduct/CreateProductFrom";
import ProductsTable from "./componets/Products/ProductsTable";
import OrdersTable from "./componets/Orders/OrdersTable";
import Customers from "./componets/customers/customers";
import TotalEarning from "./tables/TotalEarning";
import WeeklyOverview from "./tables/WeeklyOverview";
import MonthlyOverview from "./tables/MonthlyOverView";
import { customTheme } from "./theme/customeThem";
import HomeManagement from './Components/Home/HomeManagement';
import './AdminPannel.css';

const drawerWidth = 250;

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
  { name: "Home", path: "/admin/home", icon: <HomeIcon /> },
  { name: "Products", path: "/admin/products", icon: <InventoryIcon /> },
  { name: "Customers", path: "/admin/customers", icon: <PeopleIcon /> },
  { name: "Orders", path: "/admin/orders", icon: <ShoppingCartIcon /> },
  { type: 'divider' },
  { name: "Total Earnings", path: "/admin/earnings", icon: <AttachMoneyIcon /> },
  { name: "Weekly Overview", path: "/admin/weekly", icon: <TimelineIcon /> },
  { name: "Monthly Overview", path: "/admin/monthly", icon: <CalendarMonthIcon /> },
  { type: 'divider' },
  { name: "Add Product", path: "/admin/product/create", icon: <AddCircleIcon /> },
];

export default function AdminPanel() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [sideBarVisible, setSideBarVisible] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // Get user from localStorage if not in Redux state
  const userFromStorage = localStorage.getItem('user');
  const currentUser = auth.user || (userFromStorage ? JSON.parse(userFromStorage) : null);

  // Debug logging
  console.log('Auth state:', auth);
  console.log('Current user:', currentUser);
  console.log('User role:', currentUser?.role);
  console.log('JWT token:', localStorage.getItem('jwt'));

  const handleSideBarViewInMobile = () => setSideBarVisible(!sideBarVisible);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  React.useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(getUser(jwt));
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  // Check if user is authenticated and has admin role
  if (!currentUser) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'ADMIN') {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  const DrawerContent = () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      {isLargeScreen && (
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.primary.main,
              letterSpacing: '0.5px'
            }}
          >
            Admin Panel
          </Typography>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          item.type === 'divider' ? (
            <Divider key={index} sx={{ my: 1.5 }} />
          ) : (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                  backgroundColor: location.pathname === item.path ? 
                    `${theme.palette.primary.main}08` : "transparent",
                  color: location.pathname === item.path ? 
                    theme.palette.primary.main : theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: location.pathname === item.path ? 
                      theme.palette.primary.main : theme.palette.text.secondary 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: location.pathname === item.path ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>

      {/* User Profile */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            "&:hover": {
              backgroundColor: `${theme.palette.error.main}08`,
            }
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 32,
              height: 32,
            }}
          >
            {currentUser?.firstName?.[0].toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
          <LogoutIcon 
            sx={{ 
              color: theme.palette.error.main,
              opacity: 0.7,
              fontSize: 20
            }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />
        <AdminNavbar
          handleSideBarViewInMobile={handleSideBarViewInMobile}
          drawerWidth={drawerWidth}
        />
        <Drawer
          variant={isLargeScreen ? "permanent" : "temporary"}
          open={isLargeScreen ? true : sideBarVisible}
          onClose={handleSideBarViewInMobile}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              boxShadow: "none",
            },
          }}
        >
          <DrawerContent />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { lg: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/home" element={<HomeManagement />} />
            <Route path="/product/create" element={<CreateProductForm />} />
            <Route path="/products" element={<ProductsTable />} />
            <Route path="/orders" element={<OrdersTable />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/earnings" element={<TotalEarning />} />
            <Route path="/weekly" element={<WeeklyOverview />} />
            <Route path="/monthly" element={<MonthlyOverview />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}