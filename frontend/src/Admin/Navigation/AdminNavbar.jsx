// ** MUI Imports
import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Redux/Auth/Action';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getNotifications, markNotificationAsRead } from '../../Redux/Notification/Action';
import { Tooltip } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import MailIcon from '@mui/icons-material/Mail';

const { useState, useEffect } = React;

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const getNotificationIcon = (type) => {
  switch (type) {
    case 'order':
      return <ShoppingCartIcon sx={{ color: 'primary.main' }} />;
    case 'stock':
      return <WarningIcon sx={{ color: 'error.main' }} />;
    case 'review':
      return <StarIcon sx={{ color: 'warning.main' }} />;
    default:
      return <NotificationsIcon sx={{ color: 'text.secondary' }} />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'order':
      return 'primary.main';
    case 'stock':
      return 'error.main';
    case 'review':
      return 'warning.main';
    default:
      return 'text.secondary';
  }
};

export default function AdminNavbar({ handleSideBarViewInMobile }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const jwt = localStorage.getItem("jwt");

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);

  React.useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationRead = async (notificationIds) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/mark-read`, 
        { notificationIds },
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationAction = (notification) => {
    // Mark the notification as read
    handleNotificationRead([notification.id]);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'ORDER':
        navigate(`/admin/orders/${notification.metadata.orderId}`);
        break;
      case 'REVIEW':
        navigate(`/admin/products/${notification.metadata.productId}`);
        break;
      case 'STOCK':
        navigate(`/admin/products/${notification.metadata.productId}`);
        break;
      default:
        break;
    }
    handleNotificationClose();
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
        },
      }}
    >
      <MenuItem onClick={handleMenuClose}>
        <Avatar /> Profile
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const notificationMenuId = 'notification-menu';
  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={notificationMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isNotificationMenuOpen}
      onClose={handleNotificationMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          width: 320,
        },
      }}
    >
      <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <MenuItem sx={{ py: 2, justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </MenuItem>
      ) : (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => {
              handleMarkAsRead(notification.id);
              handleNotificationMenuClose();
              if (notification.type === 'order') {
                navigate('/admin/orders');
              } else if (notification.type === 'stock') {
                navigate('/admin/products');
              } else if (notification.type === 'review') {
                navigate(`/product/${notification.productId}`);
              }
            }}
            sx={{
              py: 1.5,
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              backgroundColor: notification.read ? 'inherit' : 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: `${getNotificationColor(notification.type)}20`,
                mr: 2
              }}>
                {getNotificationIcon(notification.type)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: notification.read ? 'normal' : 'bold',
                    color: getNotificationColor(notification.type)
                  }}
                >
                  {notification.type === 'review' 
                    ? `New review for ${notification.productName}`
                    : notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))
      )}
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
        },
      }}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem onClick={handleNotificationClick}>
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
        >
          <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle sx={{ color: 'text.secondary' }} />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          {!isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              onClick={handleSideBarViewInMobile}
            >
              <MenuIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              alt="Omkar Wood" 
              src="/Logo.png" 
              sx={{ 
                width: 40, 
                height: 40, 
                marginRight: 2 
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: '#8B4513',
                fontWeight: 600,
                letterSpacing: '.5px'
              }}
            >
              Omkar Wood
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
                onClick={handleNotificationMenuOpen}
              >
                <StyledBadge badgeContent={Math.max(0, unreadCount)} color="error">
                  <NotificationsIcon sx={{ color: 'text.secondary' }} />
                </StyledBadge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderNotificationMenu}
    </Box>
  );
}
