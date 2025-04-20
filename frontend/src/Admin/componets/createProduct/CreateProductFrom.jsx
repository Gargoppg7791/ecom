import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  Paper,
  IconButton,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const Product = () => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    discountedPrice: "",
    discountPercent: "",
    brand: "",
    colors: [],
    sizes: [],
    topLevelCategory: "",
    secondLevelCategory: "",
    thirdLevelCategory: "",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const alertRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(""); // Clear previous messages
  
    const formData = new FormData();
  
    for (const key in newProduct) {
      if (key !== "sizes" && key !== "colors") {
        formData.append(key, newProduct[key]);
      }
    }
  
    newProduct.colors.forEach((color, index) => {
      color.photos.forEach((photo) => {
        formData.append(`color_photos_${index}`, photo);
      });
    });
  
    formData.append("sizes", JSON.stringify(newProduct.sizes));
    formData.append("colors", JSON.stringify(newProduct.colors.map(color => ({
      ...color,
      photos: color.photos.map(photo => photo.name || photo)
    }))));
  
    axios
      .post("http://localhost:5454/api/admin/products/", formData)
      .then((res) => {
        setLoading(false);
        if (res.data && res.data.id) {
          setAlertMessage("Product created successfully!");
          setAlertSeverity("success");
          setNewProduct({
            title: "",
            description: "",
            price: "",
            discountedPrice: "",
            discountPercent: "",
            brand: "",
            colors: [],
            sizes: [],
            topLevelCategory: "",
            secondLevelCategory: "",
            thirdLevelCategory: "",
          });
  
          // Fully scroll to the top
          setTimeout(() => {
            window.scrollTo(0, 0); // Instantly moves to top
          }, 100);
        } else {
          setAlertMessage("Failed to create the product. Please try again.");
          setAlertSeverity("error");
        }
  
        // Clear alert after 5 seconds
        setTimeout(() => {
          setAlertMessage("");
        }, 5000);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        setAlertMessage("An error occurred while creating the product.");
        setAlertSeverity("error");
  
        // Fully scroll to the top
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
  
        // Clear alert after 5 seconds
        setTimeout(() => {
          setAlertMessage("");
        }, 5000);
      });
  };
  
  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleSizeChange = (e, index) => {
    const updatedSizes = [...newProduct.sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [e.target.name]: e.target.value,
    };
    setNewProduct({ ...newProduct, sizes: updatedSizes });
  };

  const addSizeInput = () => {
    setNewProduct({
      ...newProduct,
      sizes: [...newProduct.sizes, { name: "", quantity: "" }],
    });
  };

  const handleColorChange = (e, index) => {
    const updatedColors = [...newProduct.colors];
    updatedColors[index] = {
      ...updatedColors[index],
      [e.target.name]: e.target.value,
    };
    setNewProduct({ ...newProduct, colors: updatedColors });
  };

  const handleColorPhotos = (e, index) => {
    const updatedColors = [...newProduct.colors];
    updatedColors[index] = {
      ...updatedColors[index],
      photos: Array.from(e.target.files),
    };
    setNewProduct({ ...newProduct, colors: updatedColors });
  };

  const addColorInput = () => {
    setNewProduct({
      ...newProduct,
      colors: [...newProduct.colors, { name: "", photos: [] }],
    });
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Product
        </Typography>
        {alertMessage && (
          <Box ref={alertRef} mb={2}>
            <Alert
              severity={alertSeverity}
              sx={{
                backgroundColor: "white",
                color: alertSeverity === "success" ? "darkgreen" : "darkred",
              }}
            >
              {alertMessage}
            </Alert>
          </Box>
        )}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(5px)' }}
          open={loading}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress color="inherit" />
            <Typography variant="h6" mt={2}>
              Product is being created...
            </Typography>
          </Box>
        </Backdrop>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Product Title"
              name="title"
              value={newProduct.title}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Product Description"
              name="description"
              value={newProduct.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Product Price"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                required
                type="number"
              />
              <TextField
                fullWidth
                label="Discounted Price"
                name="discountedPrice"
                value={newProduct.discountedPrice}
                onChange={handleChange}
                required
                type="number"
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Discount Percent"
                name="discountPercent"
                value={newProduct.discountPercent}
                onChange={handleChange}
                required
                type="number"
              />
            </Stack>
            <TextField
              fullWidth
              label="Brand"
              name="brand"
              value={newProduct.brand}
              onChange={handleChange}
              required
            />
            <Typography variant="h6">Category:</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Top Level Category"
                name="topLevelCategory"
                value={newProduct.topLevelCategory}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Second Level Category"
                name="secondLevelCategory"
                value={newProduct.secondLevelCategory}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Third Level Category"
                name="thirdLevelCategory"
                value={newProduct.thirdLevelCategory}
                onChange={handleChange}
                required
              />
            </Stack>
            <Typography variant="h6">Sizes:</Typography>
            {newProduct.sizes.map((size, index) => (
              <Stack direction="row" spacing={2} key={index} alignItems="center">
                <TextField
                  fullWidth
                  label="Size Name"
                  name="name"
                  value={size.name}
                  onChange={(e) => handleSizeChange(e, index)}
                  required
                />
                <TextField
                  fullWidth
                  label="Size Quantity"
                  name="quantity"
                  value={size.quantity}
                  onChange={(e) => handleSizeChange(e, index)}
                  required
                  type="number"
                />
                <IconButton
                  color="secondary"
                  onClick={() => {
                    const updatedSizes = newProduct.sizes.filter(
                      (_, i) => i !== index
                    );
                    setNewProduct({ ...newProduct, sizes: updatedSizes });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              variant="contained"
              onClick={addSizeInput}
              startIcon={<AddIcon />}
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Add Size
            </Button>
            <Typography variant="h6">Colors:</Typography>
            {newProduct.colors.map((color, index) => (
              <Stack direction="column" spacing={2} key={index} alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  <TextField
                    fullWidth
                    label="Color Name"
                    name="name"
                    value={color.name}
                    onChange={(e) => handleColorChange(e, index)}
                    required
                  />
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                  >
                    Upload Color Images
                    <input
                      type="file"
                      accept=".png, .jpg, .jpeg, .gif, .mp4"
                      multiple
                      hidden
                      onChange={(e) => handleColorPhotos(e, index)}
                    />
                  </Button>
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      const updatedColors = newProduct.colors.filter(
                        (_, i) => i !== index
                      );
                      setNewProduct({ ...newProduct, colors: updatedColors });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                {color.photos.length > 0 && (
                  <Box mt={2} display="flex" flexWrap="wrap" width="100%">
                    {color.photos.map((photo, photoIndex) => (
                      <Box key={photoIndex} mr={1} mb={1}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Color ${index} - ${photoIndex}`}
                          style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Stack>
            ))}
            <Button
              variant="contained"
              onClick={addColorInput}
              startIcon={<AddIcon />}
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Add Color
            </Button>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Upload
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Product;
