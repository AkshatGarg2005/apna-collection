import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchOverlay from './components/SearchOverlay';

// Import pages
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

// ScrollToTop component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Toggle search overlay
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  // Add to cart function
  const addToCart = (product) => {
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => 
      item.id === product.id && 
      item.size === product.size && 
      item.color === product.color
    );
    
    if (existingItemIndex !== -1) {
      // If item exists, update quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += product.quantity;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, product]);
    }
  };
  
  // Remove from cart function
  const removeFromCart = (itemId, size, color) => {
    const updatedCart = cart.filter(item => 
      !(item.id === itemId && item.size === size && item.color === color)
    );
    setCart(updatedCart);
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (itemId, size, color, newQuantity) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId && item.size === size && item.color === color) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
  };
  
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Header 
          toggleSearch={toggleSearch} 
          cartItemCount={cart.reduce((total, item) => total + item.quantity, 0)}
        />
        <SearchOverlay 
          isOpen={isSearchOpen} 
          closeSearch={() => setIsSearchOpen(false)} 
        />
        <main>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/shop" element={<Shop addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
            <Route 
              path="/cart" 
              element={
                <Cart 
                  cart={cart} 
                  removeFromCart={removeFromCart} 
                  updateQuantity={updateCartItemQuantity} 
                />
              } 
            />
            <Route 
              path="/checkout" 
              element={<Checkout cart={cart} setCart={setCart} />} 
            />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/offers" element={<Offers addToCart={addToCart} />} />
            <Route path="/search" element={<Search addToCart={addToCart} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;