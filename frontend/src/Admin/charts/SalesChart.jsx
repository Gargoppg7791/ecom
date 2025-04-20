import React, { useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import ReactApexCharts from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

const SalesChart = ({ data }) => {
  const theme = useTheme();

  // Debug the incoming data
  useEffect(() => {
    console.log('Raw data received:', JSON.stringify(data, null, 2));
    if (data?.weeklyData) {
      console.log('Weekly Data Details:', {
        days: data.weeklyData.days,
        sales: data.weeklyData.sales,
        daysLength: data.weeklyData.days.length,
        salesLength: data.weeklyData.sales.length,
        fullDays: JSON.stringify(data.weeklyData.days, null, 2),
        fullSales: JSON.stringify(data.weeklyData.sales, null, 2)
      });
    }
  }, [data]);

  // Transform data to match chart requirements
  const chartData = React.useMemo(() => {
    console.log('Transforming data...');
    
    if (!data) {
      console.log('No data provided');
      return { days: [], earnings: [] };
    }

    // Handle the weeklyData structure with days and sales arrays
    if (data.weeklyData && data.weeklyData.days && data.weeklyData.sales) {
      console.log('Processing weeklyData:', {
        days: data.weeklyData.days,
        sales: data.weeklyData.sales,
        fullDays: JSON.stringify(data.weeklyData.days, null, 2),
        fullSales: JSON.stringify(data.weeklyData.sales, null, 2)
      });
      
      const transformedData = {
        days: data.weeklyData.days,
        earnings: data.weeklyData.sales.map((amount, index) => {
          const num = Number(amount || 0);
          console.log(`Converting amount at index ${index}: ${amount} (type: ${typeof amount}) to ${num}`);
          return num;
        })
      };

      console.log('Transformed data details:', {
        days: transformedData.days,
        earnings: transformedData.earnings,
        daysLength: transformedData.days.length,
        earningsLength: transformedData.earnings.length,
        fullDays: JSON.stringify(transformedData.days, null, 2),
        fullEarnings: JSON.stringify(transformedData.earnings, null, 2)
      });

      return transformedData;
    }

    // If data is already in the correct format
    if (data.days && data.earnings) {
      console.log('Data already in correct format:', data);
      return {
        days: data.days,
        earnings: data.earnings.map(amount => Number(amount || 0))
      };
    }

    // If data is an array of objects
    if (Array.isArray(data)) {
      console.log('Data is an array, transforming...');
      const days = [];
      const earnings = [];
      
      data.forEach(item => {
        if (item.date) {
          const date = new Date(item.date);
          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          days.push(formattedDate);
          earnings.push(Number(item.earnings || item.amount || 0));
        }
      });

      console.log('Transformed data:', { days, earnings });
      return { days, earnings };
    }

    console.log('Data format not recognized:', data);
    return { days: [], earnings: [] };
  }, [data]);

  // Debug the final chart data
  useEffect(() => {
    console.log('Final chart data:', {
      days: chartData.days,
      earnings: chartData.earnings,
      daysLength: chartData.days.length,
      earningsLength: chartData.earnings.length,
      fullDays: JSON.stringify(chartData.days, null, 2),
      fullEarnings: JSON.stringify(chartData.earnings, null, 2)
    });
  }, [chartData]);

  if (!data) {
    return (
      <Box sx={{ minWidth: '300px', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Loading sales data...
        </Typography>
      </Box>
    );
  }

  // Check if all sales are zero
  const allSalesZero = chartData.earnings.every(amount => amount === 0);

  if (allSalesZero) {
    return (
      <Box sx={{ minWidth: '300px', height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">
          No Sales Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          There are no sales recorded for this week.
          <br />
          Average Weekly Sales: ₹0
          <br />
          Growth: -100%
        </Typography>
      </Box>
    );
  }

  if (chartData.days.length === 0 || chartData.earnings.length === 0) {
    return (
      <Box sx={{ minWidth: '300px', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No sales data available
        </Typography>
      </Box>
    );
  }

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
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
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
    },
    xaxis: {
      categories: chartData.days,
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
      theme: theme.palette.mode,
      y: {
        formatter: (value) => value === 0 ? 'No sales' : `₹${value.toLocaleString()}`,
      },
    },
    colors: [theme.palette.primary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
  };

  const chartSeries = [
    {
      name: 'Earnings',
      data: chartData.earnings,
    },
  ];

  return (
    <Box sx={{ minWidth: '600px', height: '500px' }}>
      <ReactApexCharts
        options={chartOptions}
        series={chartSeries}
        type="line"
        height="100%"
      />
    </Box>
  );
};

export default SalesChart; 