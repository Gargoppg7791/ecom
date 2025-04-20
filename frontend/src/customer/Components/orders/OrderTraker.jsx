import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const steps = [
  "Pending",
  "Placed",
  "Confirmed",
  "Shipped",
  "Delivered"
];

const OrderTraker = ({ activeStep }) => {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{
          '& .MuiStepLabel-root': {
            '& .MuiStepLabel-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
              color: (theme) => theme.palette.text.secondary,
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: '#9155FD',
              fontWeight: 600,
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: '#9155FD',
            },
          },
          '& .MuiStepIcon-root': {
            color: '#e0e0e0',
            '&.Mui-active': {
              color: '#9155FD',
            },
            '&.Mui-completed': {
              color: '#9155FD',
            },
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel 
              StepIconProps={{
                icon: index < activeStep ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />,
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default OrderTraker;
