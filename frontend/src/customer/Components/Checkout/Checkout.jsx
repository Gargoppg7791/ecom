import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddDeliveryAddressForm from "./AddAddress";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSummary from "./OrderSummary";
import Navigation from "../Navbar/Navigation";

const steps = [
  "Login",
  "Delivery Adress",
  "Order Summary",
  "Payment",
];

export default function Checkout() {
  const [activeStep, setActiveStep] = React.useState(1);
  const [skipped, setSkipped] = React.useState(new Set());
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const step = parseInt(queryParams.get('step')) || 1;
  const orderId = queryParams.get('order_id');
  const navigate = useNavigate();

  const handleNext = () => {
    let newSkipped = skipped;
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    navigate(`/checkout?step=${step-1}${orderId ? `&order_id=${orderId}` : ''}`);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handlePayment = () => {
    console.log("handle payment")
  }

  return (
    <div>
      <Navigation />
      <Box className="px-5 lg:px-32 mt-8" sx={{ width: "100%" }}>
        <Stepper activeStep={step - 1}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
           
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Box sx={{ flex: "1 1 auto" }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                color="inherit"
                disabled={step === 1}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
            </Box>

            <div className="my-5">
              {step === 2 ? (
                <AddDeliveryAddressForm handleNext={handleNext} />
              ) : step === 3 ? (
                <OrderSummary orderId={orderId} />
              ) : (
                <Typography>Please complete the previous steps first.</Typography>
              )}
            </div>
          </React.Fragment>
        )}
      </Box>
    </div>
  );
}
