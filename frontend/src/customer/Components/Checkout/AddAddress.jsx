import * as React from "react";
import { Grid, TextField, Button, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../../Redux/Customers/Order/Action";
import userEvent from "@testing-library/user-event";
import AddressCard from "../adreess/AdreessCard";
import { useState } from "react";
import { createSelector } from 'reselect';

const selectAuth = (state) => state.auth;
const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export default function AddDeliveryAddressForm({ handleNext }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const user = useSelector(selectUser);
  const [selectedAddress, setSelectedAdress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // console.log("auth", user);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsFormLoading(true);
    const data = new FormData(event.currentTarget);

    const address = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      streetAddress: data.get("address"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zip"),
      mobile: data.get("phoneNumber"),
    };

    try {
      await dispatch(createOrder({ address, jwt, navigate }));
      handleNext();
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCreateOrder = async (item) => {
    setIsLoading(true);
    try {
      await dispatch(createOrder({ address: item, jwt, navigate }));
      handleNext();
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} lg={5}>
        <Box className="border rounded-md shadow-md h-[30.5rem] overflow-y-scroll ">
          {user?.addresses?.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAdress(item)}
              className="p-5 py-7 border-b cursor-pointer"
            >
              <AddressCard address={item} />
              {selectedAddress?.id === item.id && (
                <Button
                  sx={{ mt: 2 }}
                  size="large"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateOrder(item);
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Deliver Here"
                  )}
                </Button>
              )}
            </div>
          ))}
        </Box>
      </Grid>
      <Grid item xs={12} lg={7}>
        <Box className="border rounded-md shadow-md p-5">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  fullWidth
                  autoComplete="given-name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  autoComplete="given-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="address"
                  name="address"
                  label="Address"
                  fullWidth
                  autoComplete="shipping address"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="city"
                  name="city"
                  label="City"
                  fullWidth
                  autoComplete="shipping address-level2"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="state"
                  name="state"
                  label="State/Province/Region"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="zip"
                  name="zip"
                  label="Zip / Postal code"
                  fullWidth
                  autoComplete="shipping postal-code"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Phone Number"
                  fullWidth
                  autoComplete="tel"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  sx={{ padding: ".9rem 1.5rem" }}
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isFormLoading}
                >
                  {isFormLoading ? (
                    <div className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Delivered Here"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
}
