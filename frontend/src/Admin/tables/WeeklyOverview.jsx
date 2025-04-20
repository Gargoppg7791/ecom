import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactApexCharts from 'react-apexcharts';
import api from '../../config/api';

const WeeklyOverview = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState({
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    earnings: [0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const jwt = localStorage.getItem('jwt');
        const response = await api.get('/api/admin/weekly-earnings', {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Initialize earnings array with zeros for all days
        const earningsByDay = {
          Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
        };

        // Update earnings for days that have data
        if (Array.isArray(response.data)) {
          response.data.forEach(item => {
            if (item.day && typeof item.earnings === 'number') {
              earningsByDay[item.day] = item.earnings;
            }
          });
        }

        setWeeklyData({
          days: Object.keys(earningsByDay),
          earnings: Object.values(earningsByDay)
        });
      } catch (err) {
        console.error('Error fetching weekly data:', err);
        setError(err.message || 'Failed to fetch weekly data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
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
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%',
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: weeklyData.days,
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
    fill: {
      opacity: 1,
      colors: [theme.palette.primary.main],
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
      data: weeklyData.earnings,
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={350} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const totalWeeklyEarnings = weeklyData.earnings.reduce((sum, amount) => sum + amount, 0);
  const averageDailyEarnings = totalWeeklyEarnings / 7;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Weekly Overview
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Total Weekly Earnings: ₹{totalWeeklyEarnings.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average Daily: ₹{averageDailyEarnings.toLocaleString()}
          </Typography>
        </Box>
        <ReactApexCharts
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default WeeklyOverview;