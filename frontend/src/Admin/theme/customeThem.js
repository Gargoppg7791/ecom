import { createTheme } from "@mui/material/styles";

const customTheme = createTheme({
  palette: {
    mode: "light", // Set the custom color mode to light
    primary: {
      main: '#1e88e5', // Blue color for primary elements
    },
    secondary: {
      main: '#f48fb1', // Secondary color
    },
    white: {
      main: "#fff" // White color
    },
    orange: {
      main: "#ffdb0f" // Orange color
    },
    background: {
      default: '#f5f5f5', // Light background color
      paper: "#ffffff" // White background color for paper elements
    },
    text: {
      primary: '#000000', // Dark text color
      secondary: '#9e9e9e' // Secondary text color
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9155FD',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

const customerTheme = createTheme({
  palette: {
    mode: "light", // Set the custom color mode to light
    primary: {
      main: '#1e88e5', // Blue color for primary elements
    },
    secondary: {
      main: '#f48fb1', // Secondary color
    },
    white: {
      main: "#fff" // White color
    },
    orange: {
      main: "#ffdb0f" // Orange color
    },
    background: {
      default: '#f5f5f5', // Light background color
      paper: "#ffffff" // White background color for paper elements
    },
    text: {
      primary: '#000000', // Dark text color
      secondary: '#9e9e9e' // Secondary text color
    },
  },
});

export { customTheme, darkTheme, customerTheme };