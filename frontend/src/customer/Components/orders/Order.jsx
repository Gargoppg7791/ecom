import { Box, Grid, Checkbox, FormControlLabel, Typography, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import OrderCard from "./OrderCard";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../../Redux/Customers/Order/Action";
import BackdropComponent from "../BackDrop/Backdrop";

const orderStatus = [
  { label: "On The Way", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Pending", value: "PENDING" },
  { label: "Placed", value: "PLACED" },
];

const Order = () => {
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const { orders = [], loading } = useSelector((store) => store.order);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  console.log("Orders from Redux:", orders); // Debug log

  useEffect(() => {
    if (jwt) {
      dispatch(getOrderHistory({ jwt }));
    }
  }, [jwt, dispatch]);

  const handleStatusChange = (status) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => 
        selectedStatuses.length === 0 || selectedStatuses.includes(order.orderStatus)
      )
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!jwt) {
    return (
      <Box className="px-4 lg:px-10 py-5">
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Please login to view your orders
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="px-4 lg:px-10 py-5">
      <Grid container spacing={3}>
        {/* Filter Section */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              position: 'sticky', 
              top: 20,
              height: 'fit-content',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: 'primary.main'
            }}>
              Filters
            </Typography>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 500,
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                ORDER STATUS
              </Typography>
              {orderStatus.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={selectedStatuses.includes(option.value)}
                      onChange={() => handleStatusChange(option.value)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      {option.label}
                    </Typography>
                  }
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Orders Section */}
        <Grid item xs={12} md={9}>
          <Box className="space-y-4">
            {loading ? (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <Typography color="text.secondary">
                  Loading orders...
                </Typography>
              </Paper>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order?.id || Math.random()} className="space-y-4">
                  {Array.isArray(order?.orderItems) && order.orderItems.map((item) => (
                    <OrderCard 
                      key={`${order.id}-${item.id}` || Math.random()} 
                      item={item} 
                      order={order}
                      formatDate={formatDate} 
                    />
                  ))}
                </div>
              ))
            ) : (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography color="text.secondary">
                  {selectedStatuses.length > 0 
                    ? "No orders found with selected filters" 
                    : "No orders found"}
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Order;
