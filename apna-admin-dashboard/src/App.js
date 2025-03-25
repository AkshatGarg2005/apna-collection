// src/App.js update for admin dashboard
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminRoute from './components/auth/AdminRoute';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import UploadProduct from './pages/UploadProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import FestiveProducts from './pages/FestiveProducts';
import WeddingProducts from './pages/WeddingProducts';
import EndOfSeasonProducts from './pages/EndOfSeasonProducts';
import FeaturedProducts from './pages/FeaturedProducts';
import ContactMessages from './pages/ContactMessages';
import Coupons from './pages/Coupons'; // Import the new Coupons page
import OrdersDebug from './pages/OrdersDebug';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path="/products" element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            } />
            <Route path="/upload" element={
              <AdminRoute>
                <UploadProduct />
              </AdminRoute>
            } />
            <Route path="/edit-product/:productId" element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            } />
            <Route path="/orders" element={
              <AdminRoute>
                <Orders />
              </AdminRoute>
            } />
            <Route path="/customers" element={
              <AdminRoute>
                <Customers />
              </AdminRoute>
            } />
            <Route path="/contact-messages" element={
              <AdminRoute>
                <ContactMessages />
              </AdminRoute>
            } />
            <Route path="/festive-products" element={
              <AdminRoute>
                <FestiveProducts />
              </AdminRoute>
            } />
            <Route path="/wedding-products" element={
              <AdminRoute>
                <WeddingProducts />
              </AdminRoute>
            } />
            <Route path="/end-of-season-products" element={
              <AdminRoute>
                <EndOfSeasonProducts />
              </AdminRoute>
            } />
            <Route path="/featured-products" element={
              <AdminRoute>
                <FeaturedProducts />
              </AdminRoute>
            } />
            {/* Add new route for coupons */}
            <Route path="/coupons" element={
              <AdminRoute>
                <Coupons />
              </AdminRoute>
            } />
            <Route path="/orders-debug" element={
  <AdminRoute>
    <OrdersDebug />
  </AdminRoute>
} />
          </Routes>
        </div>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;