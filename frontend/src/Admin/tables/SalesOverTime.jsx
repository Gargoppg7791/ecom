import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardHeader,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactApexCharts from 'react-apexcharts';
import api from '../../config/api';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const SalesOverTime = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({
    averageWeeklySales: 0,
    growthPercentage: 0,
    weeklyData: {
      days: [],
      sales: []
    }
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const jwt = localStorage.getItem('jwt');
        const response = await api.get('/api/admin/sales-over-time', {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setSalesData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: [theme.palette.primary.main],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100],
        colorStops: [
          {
            offset: 0,
            color: theme.palette.primary.main,
            opacity: 0.5
          },
          {
            offset: 100,
            color: theme.palette.primary.main,
            opacity: 0
          }
        ]
      }
    },
    grid: {
      show: true,
      borderColor: theme.palette.divider,
      strokeDashArray: 5,
      xaxis: {
        lines: { show: false }
      },
      yaxis: {
        lines: { show: true }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    dataLabels: { enabled: false },
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: salesData.weeklyData.days,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        },
        formatter: (value) => `₹${value.toLocaleString()}`
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `₹${value.toLocaleString()}`
      }
    }
  };

  const chartSeries = [
    {
      name: 'Sales',
      data: salesData.weeklyData.sales
    }
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
    <Card elevation={0}>
      <CardHeader
        title="Sales Over Time"
        titleTypographyProps={{
          variant: 'h6',
          sx: { mb: 2, color: theme.palette.text.primary }
        }}
        action={
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" color="text.primary" sx={{ mb: 1 }}>
              ₹{salesData.averageWeeklySales.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {salesData.growthPercentage >= 0 ? (
                <TrendingUpIcon color="success" />
              ) : (
                <TrendingDownIcon color="error" />
              )}
              <Typography
                variant="body2"
                color={salesData.growthPercentage >= 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(salesData.growthPercentage)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last week
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ height: '300px', width: '100%', minWidth: '1000px' }}>
          <ReactApexCharts
            type="area"
            height="100%"
            width="100%"
            options={chartOptions}
            series={chartSeries}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default SalesOverTime;