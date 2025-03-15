import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/auth/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';

// Import your existing components
import Header from './components/Header';
import Footer from './components/Footer';
import SearchOverlay from './components/SearchOverlay';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Shop from './pages/Shop/Shop';
import ProductPage from './pages/ProductPage/ProductPage';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import Orders from './pages/Orders/Orders';
import Contact from './pages/Contact/Contact';
import Offers from './pages/Offers/Offers';
import Search from './pages/Search/Search';
import UserDash from './pages/UserDash/UserDash';
import AdminDash from './pages/AdminDash/AdminDash';
import LoginStatusToast from './components/LoginStatusToast';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Toggle search overlay
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <Header toggleSearch={toggleSearch} />
            <SearchOverlay isOpen={isSearchOpen} closeSearch={() => setIsSearchOpen(false)} />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                } />
                <Route path="/order-confirmation" element={
                  <PrivateRoute>
                    <OrderConfirmation />
                  </PrivateRoute>
                } />
                <Route path="/orders" element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                } />
                <Route path="/contact" element={<Contact />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/search" element={<Search />} />
                <Route path="/account" element={
                  <PrivateRoute>
                    <UserDash />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminDash />
                  </PrivateRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <LoginStatusToast />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;