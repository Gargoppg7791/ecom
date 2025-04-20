import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCustomers } from '../../../Redux/Admin/Customers/Action';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

const CustomerList = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.adminCustomers);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest to oldest, 'asc' for oldest to newest
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const handleSortToggle = (order) => {
    setSortOrder(order);
    setAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setAnchorEl(null);
  };

    // Filter and sort customers based on search term and sort order
    const filteredCustomers = (customers || []).filter((customer) => {
      const searchTermLower = searchTerm.toLowerCase();
      const fullName = `${customer?.firstName || ''} ${customer?.lastName || ''}`.toLowerCase();
      
      return fullName.includes(searchTermLower) ||
        (customer?.email || '').toLowerCase().includes(searchTermLower) ||
        (customer?.mobile || '').toLowerCase().includes(searchTermLower);
    });
  
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return sortOrder === 'desc'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });
  return (
    <Box>
      <Card className="p-3">
        <CardHeader
          title="Customers"
          sx={{
            pt: 0,
            alignItems: "center",
            "& .MuiCardHeader-action": { mt: 0.6 },
          }}
          action={
            <Box display="flex" alignItems="center">
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ marginRight: 2 }}
              />
              <IconButton onClick={handleSortMenuClick}>
                <SortIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleSortMenuClose}
              >
                <MenuItem onClick={() => handleSortToggle('desc')}>Newest to Oldest</MenuItem>
                <MenuItem onClick={() => handleSortToggle('asc')}>Oldest to Newest</MenuItem>
              </Menu>
            </Box>
          }
        />
        {loading && <Typography>Loading...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label="customer table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Mobile</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.role}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default CustomerList;