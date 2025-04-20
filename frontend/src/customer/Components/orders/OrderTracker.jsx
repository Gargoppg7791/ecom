import { Box, Step, StepLabel, Stepper } from '@mui/material';

const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const OrderTracker = ({ activeStep }) => {
  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Stepper activeStep={steps.indexOf(activeStep)} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default OrderTracker; 