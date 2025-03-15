// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminRoute from './components/auth/AdminRoute';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import UploadProduct from './pages/UploadProduct';
import Orders from './pages/Orders';
import Customers from './pages/Customers';

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
          </Routes>
        </div>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;