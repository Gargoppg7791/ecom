import { Box, Typography, Divider } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

const OrderTimeLine = ({ orderStatus }) => {
  const getDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '16px',
        width: '2px',
        bgcolor: 'primary.main',
        opacity: 0.2
      }
    }}>
      {orderStatus.map((status, index) => (
        <Box key={index} sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          mb: 2,
          position: 'relative'
        }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mr: 2
          }}>
            <FiberManualRecord 
              sx={{ 
                color: 'primary.main',
                fontSize: '1.5rem',
                position: 'relative',
                zIndex: 1
              }} 
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{status.status}</Typography>
            <Typography variant="body2" color="text.secondary">
              {getDate(status.date)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default OrderTimeLine;