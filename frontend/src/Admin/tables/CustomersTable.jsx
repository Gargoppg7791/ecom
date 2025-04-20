import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Chip,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCustomers } from '../../Redux/Admin/Customers/Action';

const CustomersTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.adminCustomers);

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  // Sort customers by creation date in descending order
  const sortedCustomers = [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Card>
      <CardHeader
        title='New Customers'
        sx={{ pt: 2, alignItems: 'center', '& .MuiCardHeader-action': { mt: 0.6 } }}
        action={<Typography onClick={() => navigate("/admin/customers")} variant='caption' sx={{ color: "blue", cursor: "pointer", paddingRight: ".8rem" }}>View All</Typography>}
        titleTypographyProps={{
          variant: 'h5',
          sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' }
        }}
      />
      <TableContainer>
        <Table sx={{ minWidth: 390 }} aria-label='table in dashboard'>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={3}><Typography>Loading...</Typography></TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={3}><Typography color="error">{error}</Typography></TableCell></TableRow>}
            {sortedCustomers.slice(0, 5).map((customer) => (
              <TableRow hover key={customer.id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                <TableCell><Avatar alt={customer.firstName} src={customer.imageUrl} /></TableCell>
                <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                <TableCell>{customer.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CustomersTable;