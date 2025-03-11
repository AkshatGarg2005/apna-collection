// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import ProductPage from './pages/ProductPage/ProductPage';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import Search from './pages/Search/Search';
import Shop from './pages/Shop/Shop';
import Cart from './pages/Cart/Cart';
import Offers from './pages/Offers/Offers';
import AboutUs from './pages/AboutUs/AboutUs';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/productpage" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/search" element={<Search />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
