import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, Skeleton } from '@mui/material';
import { ShoppingCart, Inventory, People, LocalOffer, Refresh, MoreVert, TrendingUp, TrendingDown, AttachMoney } from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, growth, icon, color, gradient, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Ensure value and growth are numbers, default to 0 if undefined
  const displayValue = typeof value === 'number' ? value : 0;
  const displayGrowth = typeof growth === 'number' ? growth : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        background: gradient,
        color: color,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '280px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontSize: '1rem' }}>
            {title}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{ 
                color: color,
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Refresh sx={{ 
                fontSize: 18,
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.5s ease-in-out'
              }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton
              size="small"
              sx={{ 
                color: color,
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <MoreVert sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.5rem' }}>
        {title.includes('Earnings') ? `₹${displayValue.toLocaleString()}` : displayValue.toLocaleString()}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {displayGrowth >= 0 ? (
          <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
        ) : (
          <TrendingDown sx={{ color: '#F44336', fontSize: 20 }} />
        )}
        <Typography
          variant="body2"
          sx={{ ml: 1, fontWeight: 500, fontSize: '0.8rem' }}
        >
          {displayGrowth >= 0 ? '+' : ''}{displayGrowth.toFixed(1)}% from last month
        </Typography>
      </Box>
    </Paper>
  );
};

const TotalStats = ({ type }) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalEarnings: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0,
    earningsGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const jwt = localStorage.getItem('jwt');
      const response = await axios.get('/api/admin/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      
      const data = response.data || {};
      setStats({
        totalSales: Number(data.totalSales) || 0,
        totalOrders: Number(data.totalOrders) || 0,
        totalProducts: Number(data.totalProducts) || 0,
        totalCustomers: Number(data.totalCustomers) || 0,
        totalEarnings: Number(data.totalEarnings) || 0,
        salesGrowth: Number(data.salesGrowth) || 0,
        ordersGrowth: Number(data.ordersGrowth) || 0,
        productsGrowth: Number(data.productsGrowth) || 0,
        customersGrowth: Number(data.customersGrowth) || 0,
        earningsGrowth: Number(data.earningsGrowth) || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
        <Skeleton variant="text" width="60%" height={30} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="80%" height={40} sx={{ mt: 2 }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        backgroundColor: 'white',
        borderRadius: 2,
        color: 'error.main'
      }}>
        <Typography>{error}</Typography>
        <IconButton onClick={fetchStats} sx={{ ml: 2 }}>
          <Refresh />
        </IconButton>
      </Box>
    );
  }

  const cardProps = {
    sales: {
      title: "Total Sales",
      value: stats.totalSales,
      growth: stats.salesGrowth,
      icon: <LocalOffer sx={{ fontSize: 24 }} />,
      color: "#1A237E",
      gradient: "linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)"
    },
    orders: {
      title: "Total Orders",
      value: stats.totalOrders,
      growth: stats.ordersGrowth,
      icon: <ShoppingCart sx={{ fontSize: 24 }} />,
      color: "#1B5E20",
      gradient: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)"
    },
    products: {
      title: "Total Products",
      value: stats.totalProducts,
      growth: stats.productsGrowth,
      icon: <Inventory sx={{ fontSize: 24 }} />,
      color: "#BF360C",
      gradient: "linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 100%)"
    },
    customers: {
      title: "Total Customers",
      value: stats.totalCustomers,
      growth: stats.customersGrowth,
      icon: <People sx={{ fontSize: 24 }} />,
      color: "#4A148C",
      gradient: "linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%)"
    },
    earnings: {
      title: "Total Earnings",
      value: stats.totalEarnings,
      growth: stats.earningsGrowth,
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      color: "#006064",
      gradient: "linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)"
    }
  };

  return <StatCard {...cardProps[type]} onRefresh={fetchStats} />;
};

export default TotalStats; 