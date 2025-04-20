import { Avatar, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Card, CardHeader, Skeleton } from '@mui/material'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { findProducts } from '../../Redux/Customers/Product/Action'

const RecentlyAddedProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customersProduct } = useSelector((store) => store);

  useEffect(() => {
    dispatch(findProducts({
      pageNumber: 1,
      pageSize: 5,
      sort: 'newest'
    }));
  }, [dispatch]);

  const getProductImage = (product) => {
    const baseUrl = 'http://localhost:5454/images/';
    const defaultImage = '75935968-3778-47b2-82b1-b3a6438c6781-1741861299849.jpg';
  
    try {
      if (product?.color?.[0]?.photos?.[0]) {
        const photoName = product.color[0].photos[0];
        return photoName.startsWith('http') ? photoName : `${baseUrl}${photoName}`;
      }
      return `${baseUrl}${defaultImage}`;
    } catch (error) {
      return `${baseUrl}${defaultImage}`;
    }
  };

  const calculateTotalQuantity = (product) => {
    if (!product?.sizes) return 0;
    
    return product.sizes.reduce((total, size) => {
      return total + (size.quantity || 0);
    }, 0);
  };

  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton variant="circular" width={45} height={45} />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={80} height={20} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={60} height={20} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={40} height={20} />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader
        title='Recently Added Products'
        sx={{ pt: 2, alignItems: 'center', '& .MuiCardHeader-action': { mt: 0.6 } }}
        action={<Typography onClick={() => navigate("/admin/products")} variant='caption' sx={{ color: "blue", cursor: "pointer", paddingRight: ".8rem" }}>View All</Typography>}
        titleTypographyProps={{
          variant: 'h5',
          sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' }
        }}
      />
      <TableContainer>
        <Table size="medium" sx={{ minWidth: 700 }} aria-label='recently added products'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 2, fontSize: '0.95rem', fontWeight: 600, width: '35%' }}>Image</TableCell>
              <TableCell sx={{ py: 2, fontSize: '0.95rem', fontWeight: 600, width: '15%' }}>Title</TableCell>
              <TableCell sx={{ py: 2, fontSize: '0.95rem', fontWeight: 600, width: '20%' }}>Category</TableCell>
              <TableCell sx={{ py: 2, fontSize: '0.95rem', fontWeight: 600, width: '15%' }}>Price</TableCell>
              <TableCell sx={{ py: 2, fontSize: '0.95rem', fontWeight: 600, width: '15%' }}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!customersProduct?.products?.content ? (
              renderSkeletonRows()
            ) : (
              customersProduct.products.content.slice(0, 5).map(item => (
                <TableRow 
                  hover 
                  key={item.id} 
                  sx={{ 
                    '&:last-of-type td, &:last-of-type th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => navigate(`/admin/product/${item.id}`)}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Avatar 
                      alt={item.title} 
                      src={getProductImage(item)}
                      sx={{ width: 45, height: 45, border: '1px solid #e0e0e0' }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                        {item.title}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {item.brand}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>
                    {item.category?.name || "N/A"}
                  </TableCell>
                  <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>
                    ₹{item.discountedPrice}
                  </TableCell>
                  <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>
                    {calculateTotalQuantity(item)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default RecentlyAddedProducts;