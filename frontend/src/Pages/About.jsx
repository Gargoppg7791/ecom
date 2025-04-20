import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";

const About = () => {
  const navigate = useNavigate();

  return (
    <Box p={3} textAlign="center">
      <Typography variant="h4" gutterBottom>
        About Us
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to our website! We aim to provide the best services and products to our customers.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Box>
  );
};

export default About;
