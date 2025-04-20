import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "../Pages/Homepage";
import About from "../Pages/About";
import PrivacyPolicy from "../Pages/PrivacyPolicy";
import TermsCondition from "../Pages/TermsCondition";
import Contact from "../Pages/Contact";
import Product from "../customer/Components/Product/Product/Product";
import ProductDetails from "../customer/Components/Product/ProductDetails/ProductDetails";
import Cart from "../customer/Components/Cart/Cart";

import AdminPannel from "../Admin/AdminPannel";
import Navigation from "../customer/Components/Navbar/Navigation";

const Routers = () => {
  return (
    <>
      {/* ✅ Navigation Component - Always Visible */}
      <Navigation />

      {/* ✅ Main Routes */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/men" element={<Product />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* ✅ Admin Routes */}
        <Route path="/admin" element={<AdminPannel />} />
      </Routes>
    </>
  );
};

export default Routers;
