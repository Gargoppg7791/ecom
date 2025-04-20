import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactApexCharts from 'react-apexcharts';
import api from '../../config/api';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const MonthlyOverview = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState({
    days: [],
    earnings: [],
    totalEarnings: 0,
    totalOrders: 0,
    totalCustomers: 0,
    growth: 0,
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const jwt = localStorage.getItem('jwt');
        const response = await api.get('/api/admin/monthly-earnings', {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setMonthlyData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch monthly data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    markers: {
      size: 5,
    },
    xaxis: {
      categories: monthlyData.days,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      title: {
        text: 'Earnings (₹)',
        style: {
          color: theme.palette.text.secondary,
        },
      },
      labels: {
        formatter: (value) => `₹${value.toLocaleString()}`,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `₹${value.toLocaleString()}`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
    },
  };

  const chartSeries = [
    {
      name: 'Earnings',
      data: monthlyData.earnings,
    },
  ];

  const stats = [
    {
      title: 'Total Earnings',
      value: `₹${monthlyData.totalEarnings.toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Total Orders',
      value: monthlyData.totalOrders.toLocaleString(),
      icon: <ShoppingCartIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Customers',
      value: monthlyData.totalCustomers.toLocaleString(),
      icon: <PeopleIcon />,
      color: theme.palette.info.main,
    },
    {
      title: 'Growth',
      value: `${monthlyData.growth}%`,
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main,
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Monthly Overview
        </Typography>
        
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                }}
              >
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor: stat.color,
                    color: 'white',
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h6">{stat.value}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Chart */}
        <ReactApexCharts
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default MonthlyOverview;