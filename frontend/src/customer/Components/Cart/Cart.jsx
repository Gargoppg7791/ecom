import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CartItem from './CartItem';
import { Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../../../Redux/Customers/Cart/Action';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((state) => state.cart);
  const auth = useSelector((store) => store.auth);
  const jwt = localStorage.getItem("jwt");

  // Ensure cart is loaded when component mounts if user is authenticated
  useEffect(() => {
    if (auth?.user && jwt && (!cart || !cart.cartItems)) {
      console.log("Loading cart for authenticated user");
      dispatch(getCart(jwt));
    }
  }, [auth?.user, jwt, cart, dispatch]);

  const calculateTotal = () => {
    if (!cart?.cartItems) return { price: 0, discount: 0, total: 0 };
    
    const price = cart.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    const discountedTotal = cart.cartItems.reduce((total, item) => 
      total + (item.discountedPrice * item.quantity), 0);
    
    return {
      price,
      discount: price - discountedTotal,
      total: discountedTotal
    };
  };

  const { price, discount, total } = calculateTotal();

  const handleProceedToCheckout = () => {
    console.log("Navigating to /checkout");
    console.log("Authentication state:", auth);
    navigate('/checkout?step=2');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <CircularProgress sx={{ color: '#b87d3b' }} />
      </div>
    );
  }

  if (!cart?.cartItems?.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <img
          src="/empty-cart.svg"
          alt="Empty Cart"
          className="w-64 h-64 mb-6 opacity-75"
        />
        <Typography variant="h6" className="text-gray-600 mb-4">
          Your cart is empty
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{
            bgcolor: '#b87d3b',
            '&:hover': {
              bgcolor: '#a06c2a',
            },
          }}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Typography variant="h5" className="font-medium text-gray-900 mb-8">
        Shopping Cart ({cart.cartItems.length} {cart.cartItems.length === 1 ? 'item' : 'items'})
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {cart.cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Price Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <Typography variant="h6" className="font-medium text-gray-900 mb-4">
              Price Details
            </Typography>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price ({cart.cartItems.length} items)</span>
                <span>₹{price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{discount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="text-green-600">Free</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center text-base font-medium">
                  <span>Total Amount</span>
                  <span className="text-lg">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleProceedToCheckout}
              sx={{
                bgcolor: '#b87d3b',
                '&:hover': {
                  bgcolor: '#a06c2a',
                },
                mt: 3,
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
