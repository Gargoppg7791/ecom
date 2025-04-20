import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Paper, Typography, useTheme, useMediaQuery, CircularProgress, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats, getSalesOverTime } from '../../Redux/Admin/AdminAction';
import { getRecentProducts } from '../../Redux/Admin/Products/Action';
import RecentOrders from '../tables/RecentOrders';
import RecentlyAddedProducts from '../tables/RecentlyAddedProducts';
import SalesChart from '../charts/SalesChart';
import TotalEarning from '../tables/TotalEarning';
import MonthlyOverview from '../tables/MonthlyOverView';
import WeeklyOverview from '../tables/WeeklyOverview';
import CustomersTable from '../tables/CustomersTable';
import TotalStats from '../tables/TotalStats';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Admin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  
  // Properly access the admin state
  const { dashboardStats, salesOverTime, loading, error } = useSelector((state) => ({
    dashboardStats: state.admin?.dashboardStats || null,
    salesOverTime: state.admin?.salesOverTime || [],
    loading: state.admin?.loading || false,
    error: state.admin?.error || null
  }));

  const { recentProducts } = useSelector((state) => ({
    recentProducts: state.products?.recentProducts || []
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getDashboardStats()),
          dispatch(getSalesOverTime()),
          dispatch(getRecentProducts())
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Stats Cards Row */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={10}>
              <TotalStats type="sales" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TotalStats type="orders" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TotalStats type="products" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TotalStats type="customers" />
            </Grid>
          </Grid>
        </Grid>

        {/* Sales Overview and Monthly Overview Row */}
        <Grid item xs={12} container spacing={4}>
          {/* Sales Overview */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'white',
                borderRadius: '7px',
              }}
            >
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 500 }}>
                Sales Overview
              </Typography>
              <Box sx={{ height: 500 }}>
                <SalesChart data={salesOverTime} />
              </Box>
            </Paper>
          </Grid>

          {/* Monthly Overview */}
          <Grid item xs={12} md={10}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'white',
                borderRadius: '7px',
                height: '100%'
              }}
            >
              <MonthlyOverview />
            </Paper>
          </Grid>
        </Grid>

        {/* Total Earnings Row */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: 'white',
              borderRadius: '7px',
            }}  
          >
            <TotalEarning />
          </Paper>
        </Grid>

        {/* Weekly Overview and Recent Orders Row */}
        <Grid item xs={12} container spacing={2}>
          {/* Weekly Overview */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                backgroundColor: 'white',
                borderRadius: '7px',
                height: '100%'
              }}
            >
              <WeeklyOverview />
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                backgroundColor: 'white',
                borderRadius: '7px',
                height: '100%'
              }}
            >
              <RecentOrders />
            </Paper>
          </Grid>
        </Grid>

        {/* Customers Table and Recently Added Products Row */}
        <Grid item xs={12} container spacing={3}>
          {/* Customers Table */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                backgroundColor: 'white',
                borderRadius: '7px',
              }}
            >
              <CustomersTable />
            </Paper>
          </Grid>

          {/* Recently Added Products */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                backgroundColor: 'white',
                borderRadius: '7px',
              }}
            >
              <RecentlyAddedProducts products={recentProducts} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}