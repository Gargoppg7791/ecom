import { Box, Grid, Typography, Chip, Paper } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AdjustIcon from "@mui/icons-material/Adjust";
import React from "react";
import { useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const getStatusColor = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'SHIPPED':
      return 'info';
    case 'CANCELLED':
      return 'error';
    case 'PENDING':
      return 'warning';
    case 'PLACED':
      return 'primary';
    default:
      return 'default';
  }
};

const getDeliveryDate = (order) => {
  if (order.orderStatus === "DELIVERED" && order.deliveryDate) {
    return `Delivered on ${new Date(order.deliveryDate).toLocaleDateString()}`;
  } else if (order.orderStatus === "SHIPPED") {
    // Estimate delivery date as 3 days from order date
    const estimatedDate = new Date(order.orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + 3);
    return `Expected delivery by ${estimatedDate.toLocaleDateString()}`;
  } else if (order.orderStatus === "CANCELLED") {
    return "Order Cancelled";
  } else if (order.orderStatus === "PENDING") {
    return "Order Pending";
  } else if (order.orderStatus === "PLACED") {
    return "Order Placed";
  }
  return "";
};

const OrderCard = ({ item, order }) => {
  const navigate = useNavigate();

  return (
    <Box className="p-5 shadow-lg hover:shadow-2xl border">
      <Grid spacing={2} container sx={{ justifyContent: "space-between" }}>
        <Grid item xs={6}>
          <div
            onClick={() => navigate(`/account/order/${order?.id}`)}
            className="flex cursor-pointer"
          >
            <img
              className="w-[5rem] h-[5rem] object-cover object-top"
              src={item?.product?.color?.[0]?.photos?.[0] 
                ? `http://localhost:5454/images/${item.product.color[0].photos[0]}`
                : 'https://imgs.search.brave.com/H62eOYkeSCLy13VEoyCVEe10bv0d9apbSuWCjmOheZE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE5/MzM4NTAzNy9waG90/by9tb3ZpbmctaG91/c2UuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPVoxUE1EZ2Nq/ZmhkbEd1cjhfd0dF/NWExcHN4dkFWUWY4/X0ZmUTZHR3lIQlU9'}
              alt={item?.product?.title || "Product"}
              onError={(e) => {
                if (item?.product?.color?.[0]?.photos?.[1]) {
                  e.target.src = `http://localhost:5454/images/${item.product.color[0].photos[1]}`;
                } else {
                  e.target.src = 'https://imgs.search.brave.com/H62eOYkeSCLy13VEoyCVEe10bv0d9apbSuWCjmOheZE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE5/MzM4NTAzNy9waG90/by9tb3ZpbmctaG91/c2UuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPVoxUE1EZ2Nq/ZmhkbEd1cjhfd0dF/NWExcHN4dkFWUWY4/X0ZmUTZHR3lIQlU9';
                }
              }}
            />
            <div className="ml-5">
              <Typography variant="subtitle1" className="mb-2">
                {item?.product?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="space-x-5">
                <span>Size: {item?.size}</span>
                {item?.product?.color?.[0]?.name && (
                  <span>Color: {item.product.color[0].name}</span>
                )}
              </Typography>
            </div>
          </div>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="subtitle1">₹{item?.discountedPrice}</Typography>
          {item.price !== item.discountedPrice && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              ₹{item?.price}
            </Typography>
          )}
        </Grid>

        <Grid item xs={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip
              label={order?.orderStatus}
              color={getStatusColor(order?.orderStatus)}
              size="small"
              icon={order?.orderStatus === "DELIVERED" ? <FiberManualRecordIcon /> : <AdjustIcon />}
            />
            <Typography variant="body2" color="text.secondary">
              {getDeliveryDate(order)}
            </Typography>
            {order?.orderStatus === "DELIVERED" && (
              <div
                onClick={() => navigate(`/account/rate/${item.product.id}`)}
                className="flex items-center text-blue-600 cursor-pointer"
              >
                <StarIcon sx={{ fontSize: "2rem" }} className="px-2 text-5xl" />
                <span>Rate & Review Product</span>
              </div>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderCard;
