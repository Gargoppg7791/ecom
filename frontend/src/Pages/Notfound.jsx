import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="textSecondary" gutterBottom>
        Page Not Found
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go Back Home
      </Button>
    </Box>
  );
};

export default NotFound;
