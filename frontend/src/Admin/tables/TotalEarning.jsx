import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Grid, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, People, AttachMoney, Info } from '@mui/icons-material';
import ReactApexCharts from 'react-apexcharts';
import api from '../../config/api';

const TotalEarning = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalUsers: 0,
    earningsGrowth: 0,
    usersGrowth: 0,
    currentMonthEarnings: 0,
    previousMonthEarnings: 0,
    currentMonthUsers: 0,
    previousMonthUsers: 0,
    monthlyEarningsData: Array(12).fill(0),
    monthlyUsersData: Array(12).fill(0),
    loading: true,
    error: null
  });

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#3A49F9', '#4CAF50'],
    stroke: {
      curve: 'smooth',
      width: 2,
      lineCap: 'round'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 6
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yaxis: {
      show: true,
      labels: {
        formatter: function (val) {
          return val + '%';
        },
        style: {
          fontSize: '10px'
        }
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return val + '% growth';
        }
      },
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit'
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all orders
        const ordersResponse = await api.get('/api/admin/orders');
        const orders = ordersResponse.data;

        // Calculate total earnings from completed orders
        const completedOrders = orders.filter(order => order.orderStatus === 'PLACED');
        
        // Initialize arrays for monthly data
        const monthlyEarnings = Array(12).fill(0);
        const monthlyUsers = Array(12).fill(0);
        
        // Calculate earnings for each month
        completedOrders.forEach(order => {
          const orderDate = new Date(order.orderDate);
          const month = orderDate.getMonth();
          monthlyEarnings[month] += order.totalDiscountedPrice;
        });

        // Calculate current and previous month earnings
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        const currentMonthEarnings = monthlyEarnings[currentMonth];
        const previousMonthEarnings = monthlyEarnings[previousMonth];
        const earningsGrowth = previousMonthEarnings === 0 ? 100 : 
          ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;

        // Fetch users
        const usersResponse = await api.get('/api/users');
        const users = usersResponse.data;
        
        // Calculate users for each month
        users.forEach(user => {
          const userDate = new Date(user.createdAt);
          const month = userDate.getMonth();
          monthlyUsers[month]++;
        });

        const currentMonthUsers = monthlyUsers[currentMonth];
        const previousMonthUsers = monthlyUsers[previousMonth];
        const usersGrowth = previousMonthUsers === 0 ? 100 :
          ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;

        // Calculate growth percentages for each month
        const earningsGrowthData = monthlyEarnings.map((earnings, index) => {
          const prevMonth = index === 0 ? monthlyEarnings[11] : monthlyEarnings[index - 1];
          return prevMonth === 0 ? 0 : ((earnings - prevMonth) / prevMonth) * 100;
        });

        const usersGrowthData = monthlyUsers.map((users, index) => {
          const prevMonth = index === 0 ? monthlyUsers[11] : monthlyUsers[index - 1];
          return prevMonth === 0 ? 0 : ((users - prevMonth) / prevMonth) * 100;
        });

        setStats({
          totalEarnings: currentMonthEarnings,
          totalUsers: users.length,
          earningsGrowth,
          usersGrowth,
          currentMonthEarnings,
          previousMonthEarnings,
          currentMonthUsers,
          previousMonthUsers,
          monthlyEarningsData: earningsGrowthData,
          monthlyUsersData: usersGrowthData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch statistics'
        }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (stats.error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{stats.error}</Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      <Grid container spacing={2}>
        {/* Main Stats Section */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Earnings Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
                  color: '#1A237E',
                  position: 'relative',
                  overflow: 'hidden',
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                    Total Earnings
                  </Typography>
                  <Tooltip title="Total revenue from completed orders this month">
                    <Info sx={{ ml: 1, fontSize: 16, opacity: 0.8 }} />
                  </Tooltip>
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.5rem' }}>
                  ₹{stats.totalEarnings.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stats.earningsGrowth >= 0 ? (
                    <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: '#F44336', fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, fontWeight: 500, fontSize: '0.8rem' }}
                  >
                    {stats.earningsGrowth >= 0 ? '+' : ''}{stats.earningsGrowth.toFixed(1)}% from last month
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      This Month
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{stats.currentMonthEarnings.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Last Month
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{stats.previousMonthEarnings.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Users Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                  color: '#1B5E20',
                  position: 'relative',
                  overflow: 'hidden',
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                    Total Users
                  </Typography>
                  <Tooltip title="Total number of registered users">
                    <Info sx={{ ml: 1, fontSize: 16, opacity: 0.8 }} />
                  </Tooltip>
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.5rem' }}>
                  {stats.totalUsers}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stats.usersGrowth >= 0 ? (
                    <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: '#F44336', fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, fontWeight: 500, fontSize: '0.8rem' }}
                  >
                    {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth.toFixed(1)}% from last month
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      This Month
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {stats.currentMonthUsers}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Last Month
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {stats.previousMonthUsers}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Growth Charts Section */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Earnings Growth Trend
                  </Typography>
                  <Tooltip title="Monthly growth trend in earnings">
                    <Info sx={{ ml: 1, color: 'text.secondary', fontSize: 16 }} />
                  </Tooltip>
                </Box>
                <Box sx={{ width: '100%', height: '300px' }}>
                  <ReactApexCharts
                    options={chartOptions}
                    series={[{
                      name: 'Earnings Growth',
                      data: stats.monthlyEarningsData
                    }]}
                    type="area"
                    height={300}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    User Growth Trend
                  </Typography>
                  <Tooltip title="Monthly growth trend in user base">
                    <Info sx={{ ml: 1, color: 'text.secondary', fontSize: 16 }} />
                  </Tooltip>
                </Box>
                <Box sx={{ width: '100%', height: '300px' }}>
                  <ReactApexCharts
                    options={chartOptions}
                    series={[{
                      name: 'User Growth',
                      data: stats.monthlyUsersData
                    }]}
                    type="area"
                    height={300}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TotalEarning;
