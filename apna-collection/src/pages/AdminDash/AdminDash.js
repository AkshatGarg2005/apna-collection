import React, { useState } from 'react';
import { 
  FaShoppingBag, 
  FaCreditCard, 
  FaTshirt, 
  FaUpload, 
  FaSignOutAlt, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaChartLine,
  FaBox,
  FaBell,
  FaUserCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  
  // Mock data for dashboard
  const orders = [
    { id: 'ORD123456', customer: 'Rahul Sharma', date: '13 Mar, 2025', items: ['Premium Cotton Shirt (White, M)', 'Slim Fit Trousers (Navy, 32)'], total: 3198, paymentStatus: 'Paid', orderStatus: 'Pending' },
    { id: 'ORD123455', customer: 'Vikram Patel', date: '12 Mar, 2025', items: ['Designer Blazer (Black, 40)'], total: 3499, paymentStatus: 'Paid', orderStatus: 'Accepted' },
    { id: 'ORD123454', customer: 'Aman Singh', date: '11 Mar, 2025', items: ['Casual Linen Shirt (Blue, L)', 'Classic T-shirt (Black, M)'], total: 2498, paymentStatus: 'Pending', orderStatus: 'Pending' },
    { id: 'ORD123453', customer: 'Sanjay Kumar', date: '10 Mar, 2025', items: ['Traditional Silk Kurta (Maroon, XL)'], total: 2999, paymentStatus: 'Paid', orderStatus: 'Shipped' },
    { id: 'ORD123452', customer: 'Rajiv Verma', date: '09 Mar, 2025', items: ['Premium Cotton Briefs Pack', 'Premium V-Neck T-shirt (Grey, L)'], total: 1598, paymentStatus: 'Failed', orderStatus: 'Cancelled' },
    { id: 'ORD123451', customer: 'Ajay Malhotra', date: '08 Mar, 2025', items: ['Designer Wedding Kurta (Beige, L)'], total: 3499, paymentStatus: 'Paid', orderStatus: 'Delivered' }
  ];

  const payments = [
    { id: 'TXN987654', orderId: 'ORD123456', customer: 'Rahul Sharma', date: '13 Mar, 2025', amount: 3198, method: 'Credit Card', status: 'Completed' },
    { id: 'TXN987653', orderId: 'ORD123455', customer: 'Vikram Patel', date: '12 Mar, 2025', amount: 3499, method: 'UPI', status: 'Completed' },
    { id: 'TXN987652', orderId: 'ORD123454', customer: 'Aman Singh', date: '11 Mar, 2025', amount: 2498, method: 'Cash on Delivery', status: 'Pending' },
    { id: 'TXN987651', orderId: 'ORD123453', customer: 'Sanjay Kumar', date: '10 Mar, 2025', amount: 2999, method: 'Net Banking', status: 'Completed' },
    { id: 'TXN987650', orderId: 'ORD123452', customer: 'Rajiv Verma', date: '09 Mar, 2025', amount: 1598, method: 'Credit Card', status: 'Failed' },
    { id: 'TXN987649', orderId: 'ORD123451', customer: 'Ajay Malhotra', date: '08 Mar, 2025', amount: 3499, method: 'UPI', status: 'Completed' }
  ];

  const products = [
    { id: 1, name: 'Premium Cotton Formal Shirt', category: 'Shirts', price: 1299, stock: 25, image: '/api/placeholder/80/80' },
    { id: 2, name: 'Classic White Shirt', category: 'Shirts', price: 1199, stock: 18, image: '/api/placeholder/80/80' },
    { id: 3, name: 'Casual Linen Shirt', category: 'Shirts', price: 1499, stock: 12, image: '/api/placeholder/80/80' },
    { id: 4, name: 'Designer Check Shirt', category: 'Shirts', price: 1599, stock: 8, image: '/api/placeholder/80/80' },
    { id: 5, name: 'Slim Fit Dark Denim Jeans', category: 'Jeans', price: 1899, stock: 15, image: '/api/placeholder/80/80' },
    { id: 6, name: 'Traditional Silk Kurta', category: 'Kurta', price: 2999, stock: 10, image: '/api/placeholder/80/80' },
    { id: 7, name: 'Classic Round Neck T-shirt', category: 'T-shirts', price: 799, stock: 30, image: '/api/placeholder/80/80' },
    { id: 8, name: 'Premium Cotton Briefs Pack', category: 'Undergarments', price: 699, stock: 40, image: '/api/placeholder/80/80' }
  ];

  // Status color mapping
  const statusColors = {
    'Pending': '#ff9800',
    'Accepted': '#2196f3',
    'Shipped': '#9c27b0',
    'Delivered': '#4caf50',
    'Cancelled': '#f44336',
    'Completed': '#4caf50',
    'Failed': '#f44336',
    'Paid': '#4caf50'
  };

  // Format price to Indian Rupee format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Order Management Section
  const renderOrders = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Order Management</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search orders..." className="search-input" />
        </div>
      </div>
      
      <div className="stat-cards-container">
        <div className="stat-card">
          <div className="stat-card-icon order-icon">
            <FaShoppingBag />
          </div>
          <div className="stat-card-content">
            <h3>Total Orders</h3>
            <p className="stat-value">126</p>
            <p className="stat-label">Last 30 days</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon pending-icon">
            <FaBox />
          </div>
          <div className="stat-card-content">
            <h3>Pending</h3>
            <p className="stat-value">14</p>
            <p className="stat-label">Orders to process</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon shipped-icon">
            <FaTruck />
          </div>
          <div className="stat-card-content">
            <h3>Shipped</h3>
            <p className="stat-value">32</p>
            <p className="stat-label">In transit</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon delivered-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-card-content">
            <h3>Delivered</h3>
            <p className="stat-value">78</p>
            <p className="stat-label">Completed orders</p>
          </div>
        </div>
      </div>
      
      <div className="order-container">
        <div className="order-table-header">
          <div className="table-cell">Order ID</div>
          <div className="table-cell">Customer</div>
          <div className="table-cell">Date</div>
          <div className="table-cell">Items</div>
          <div className="table-cell">Total</div>
          <div className="table-cell">Payment</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>
        
        {orders.map(order => (
          <div className="order-row" key={order.id}>
            <div className="table-cell">
              <span className="order-id">{order.id}</span>
            </div>
            <div className="table-cell">
              <span className="customer-name">{order.customer}</span>
            </div>
            <div className="table-cell">
              <span className="order-date">{order.date}</span>
            </div>
            <div className="table-cell items-cell">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-bullet">•</span> {item}
                </div>
              ))}
            </div>
            <div className="table-cell">
              <span className="order-total">{formatPrice(order.total)}</span>
            </div>
            <div className="table-cell">
              <span className={`payment-badge ${order.paymentStatus.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="table-cell">
              <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="table-cell actions-cell">
              <div className="actions-container">
                {order.orderStatus === 'Pending' && (
                  <>
                    <button className="action-button accept">
                      <FaCheckCircle /> Accept
                    </button>
                    <button className="action-button reject">
                      <FaTimesCircle /> Reject
                    </button>
                  </>
                )}
                {order.orderStatus === 'Accepted' && (
                  <button className="action-button ship">
                    <FaTruck /> Ship Order
                  </button>
                )}
                <button className="action-button view">
                  <FaEye /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Payment Tracking Section
  const renderPayments = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Payment Tracking</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search payments..." className="search-input" />
        </div>
      </div>
      
      <div className="stat-cards-container">
        <div className="stat-card">
          <div className="stat-card-icon revenue-icon">
            <FaChartLine />
          </div>
          <div className="stat-card-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatPrice(286000)}</p>
            <p className="stat-label">Last 30 days</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon transaction-icon">
            <FaCreditCard />
          </div>
          <div className="stat-card-content">
            <h3>Transactions</h3>
            <p className="stat-value">156</p>
            <p className="stat-label">Successful payments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon pending-icon">
            <FaBox />
          </div>
          <div className="stat-card-content">
            <h3>Pending</h3>
            <p className="stat-value">12</p>
            <p className="stat-label">Awaiting payment</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon refund-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-card-content">
            <h3>Refunds</h3>
            <p className="stat-value">4</p>
            <p className="stat-label">Processed returns</p>
          </div>
        </div>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="table-cell">Transaction ID</div>
          <div className="table-cell">Order ID</div>
          <div className="table-cell">Customer</div>
          <div className="table-cell">Date</div>
          <div className="table-cell">Amount</div>
          <div className="table-cell">Method</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>
        
        {payments.map(payment => (
          <div className="table-row" key={payment.id}>
            <div className="table-cell transaction-id">{payment.id}</div>
            <div className="table-cell">{payment.orderId}</div>
            <div className="table-cell">{payment.customer}</div>
            <div className="table-cell">{payment.date}</div>
            <div className="table-cell">{formatPrice(payment.amount)}</div>
            <div className="table-cell method-cell">
              <span className="method-badge">
                {payment.method}
              </span>
            </div>
            <div className="table-cell">
              <span className="status-pill" style={{ backgroundColor: statusColors[payment.status] }}>
                {payment.status}
              </span>
            </div>
            <div className="table-cell actions-cell">
              <button className="action-btn view-btn">
                <FaEye /> View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Product Management Section
  const renderProducts = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Product Management</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search products..." className="search-input" />
        </div>
      </div>
      
      <div className="stat-cards-container">
        <div className="stat-card">
          <div className="stat-card-icon product-icon">
            <FaTshirt />
          </div>
          <div className="stat-card-content">
            <h3>Total Products</h3>
            <p className="stat-value">86</p>
            <p className="stat-label">Active listings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon category-icon">
            <FaBox />
          </div>
          <div className="stat-card-content">
            <h3>Categories</h3>
            <p className="stat-value">8</p>
            <p className="stat-label">Product types</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon low-stock-icon">
            <FaBell />
          </div>
          <div className="stat-card-content">
            <h3>Low Stock</h3>
            <p className="stat-value">12</p>
            <p className="stat-label">Need reordering</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon out-stock-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-card-content">
            <h3>Out of Stock</h3>
            <p className="stat-value">3</p>
            <p className="stat-label">Unavailable items</p>
          </div>
        </div>
      </div>
      
      <div className="products-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              <span className="product-category-badge">{product.category}</span>
              <p className="product-price">{formatPrice(product.price)}</p>
              <div className="stock-indicator">
                <div className={`stock-level ${product.stock < 10 ? 'low-stock' : 'in-stock'}`}></div>
                <span className="stock-text">{product.stock} in stock</span>
              </div>
            </div>
            <div className="product-actions">
              <button className="product-btn edit-btn">
                <FaEdit /> Edit
              </button>
              <button className="product-btn delete-btn">
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Upload Product Section
  const renderUploadProduct = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Upload New Product</h2>
      </div>
      
      <div className="upload-form-container">
        <form className="upload-form">
          <div className="form-section">
            <h3 className="form-section-title">Product Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input type="text" id="productName" placeholder="Enter product name" className="form-input" />
              </div>
              
              <div className="form-group">
                <label htmlFor="productCategory">Category</label>
                <select id="productCategory" className="form-input">
                  <option value="">Select Category</option>
                  <option value="shirts">Shirts</option>
                  <option value="jeans">Jeans</option>
                  <option value="kurta">Kurta</option>
                  <option value="tshirt">T-shirts</option>
                  <option value="undergarments">Undergarments</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="productDescription">Description</label>
              <textarea id="productDescription" rows="4" placeholder="Enter product description" className="form-input"></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Product Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productPrice">Price (₹)</label>
                <input type="number" id="productPrice" placeholder="Enter price" className="form-input" />
              </div>
              
              <div className="form-group">
                <label htmlFor="productStock">Stock Quantity</label>
                <input type="number" id="productStock" placeholder="Enter quantity" className="form-input" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="selection-card">
                <h3 className="selection-title">Available Sizes</h3>
                <div className="size-options">
                  <label className="size-option">
                    <input type="checkbox" name="size" value="S" />
                    <span>S</span>
                  </label>
                  <label className="size-option">
                    <input type="checkbox" name="size" value="M" />
                    <span>M</span>
                  </label>
                  <label className="size-option">
                    <input type="checkbox" name="size" value="L" />
                    <span>L</span>
                  </label>
                  <label className="size-option">
                    <input type="checkbox" name="size" value="XL" />
                    <span>XL</span>
                  </label>
                  <label className="size-option">
                    <input type="checkbox" name="size" value="XXL" />
                    <span>XXL</span>
                  </label>
                </div>
              </div>
              
              <div className="selection-card">
                <h3 className="selection-title">Available Colors</h3>
                <div className="color-options">
                  <div className="color-option">
                    <input type="checkbox" name="color" value="White" id="color-white" />
                    <label htmlFor="color-white">
                      <span className="color-circle" style={{ backgroundColor: "#ffffff", border: "1px solid #ddd" }}></span>
                      <span className="color-name">White</span>
                    </label>
                  </div>
                  <div className="color-option">
                    <input type="checkbox" name="color" value="Black" id="color-black" />
                    <label htmlFor="color-black">
                      <span className="color-circle" style={{ backgroundColor: "#000000" }}></span>
                      <span className="color-name">Black</span>
                    </label>
                  </div>
                  <div className="color-option">
                    <input type="checkbox" name="color" value="Blue" id="color-blue" />
                    <label htmlFor="color-blue">
                      <span className="color-circle" style={{ backgroundColor: "#2196f3" }}></span>
                      <span className="color-name">Blue</span>
                    </label>
                  </div>
                  <div className="color-option">
                    <input type="checkbox" name="color" value="Beige" id="color-beige" />
                    <label htmlFor="color-beige">
                      <span className="color-circle" style={{ backgroundColor: "#f5f5dc" }}></span>
                      <span className="color-name">Beige</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Product Images</h3>
            
            <div className="image-upload-container">
              <div className="image-upload-area">
                <FaUpload className="upload-icon" />
                <p>Drag & drop images here or click to browse</p>
                <input type="file" multiple accept="image/*" className="file-input" />
              </div>
              
              <div className="uploaded-images-preview">
                <div className="upload-placeholder">
                  <span>No images uploaded yet</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">Upload Product</button>
            <button type="button" className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render the active tab content
  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return renderOrders();
      case 'payments':
        return renderPayments();
      case 'products':
        return renderProducts();
      case 'upload':
        return renderUploadProduct();
      default:
        return renderOrders();
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1>Apna Collection</h1>
          <p>Admin Panel</p>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingBag className="menu-icon" />
            <span>Orders</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <FaCreditCard className="menu-icon" />
            <span>Payments</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaTshirt className="menu-icon" />
            <span>Products</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FaUpload className="menu-icon" />
            <span>Upload New Product</span>
          </button>
        </div>
        
        <button className="logout-button">
          <FaSignOutAlt className="menu-icon" />
          <span>Logout</span>
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <div className="notification-icon">
              <FaBell />
              <span className="notification-badge">3</span>
            </div>
            <span className="user-name">Admin User</span>
            <div className="user-avatar">
              <FaUserCircle />
            </div>
          </div>
        </div>
        
        <div className="dashboard-main">
          {renderContent()}
        </div>
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .admin-dashboard {
          display: flex;
          height: 100vh;
          font-family: 'Poppins', 'Helvetica Neue', sans-serif;
          background-color: #f5f7fa;
          color: #333;
        }
        
        /* Sidebar Styles */
        .dashboard-sidebar {
          width: 260px;
          background: linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%);
          padding: 30px 0;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .sidebar-header {
          padding: 0 25px 25px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sidebar-header h1 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 5px;
          color: #fff;
          letter-spacing: 0.5px;
        }
        
        .sidebar-header p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
        }
        
        .sidebar-menu {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          padding: 0 15px;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          margin-bottom: 5px;
          font-size: 15px;
          border: none;
          background: none;
          color: rgba(255, 255, 255, 0.7);
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 10px;
          font-weight: 500;
        }
        
        .menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: translateX(5px);
        }
        
        .menu-item.active {
          background-color: rgba(255, 255, 255, 0.2);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .menu-icon {
          font-size: 18px;
          margin-right: 15px;
        }
        
        .logout-button {
          margin: 15px;
          display: flex;
          align-items: center;
          padding: 14px 20px;
          font-size: 15px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 10px;
          font-weight: 500;
        }
        
        .logout-button:hover {
          background-color: rgba(244, 67, 54, 0.2);
          color: #fff;
        }
        
        /* Content Area Styles */
        .dashboard-content {
          flex-grow: 1;
          overflow-y: auto;
          padding: 0;
        }
        
        .dashboard-header {
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fff;
          position: sticky;
          top: 0;
          z-index: 5;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .dashboard-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }
        
        .user-info {
          display: flex;
          align-items: center;
        }
        
        .notification-icon {
          position: relative;
          margin-right: 20px;
          cursor: pointer;
          color: #555;
          font-size: 18px;
        }
        
        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #f44336;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        
        .user-name {
          margin-right: 15px;
          font-size: 14px;
          font-weight: 500;
          color: #555;
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: #8e44ad;
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .dashboard-main {
          padding: 30px 40px;
        }
        
        /* Content Section Styles */
        .content-section {
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
          padding: 30px;
          margin-bottom: 30px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .content-section:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .section-header h2 {
          font-size: 22px;
          font-weight: 600;
          color: #333;
          position: relative;
          padding-left: 15px;
        }
        
        .section-header h2:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(to bottom, #8e44ad, #9b59b6);
          border-radius: 4px;
        }
        
        .search-container {
          position: relative;
          width: 300px;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background-color: #f9f9f9;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #8e44ad;
          box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
          background-color: #fff;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }
        
        /* Stat Cards */
        .stat-cards-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background-color: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 20px;
          color: white;
        }
        
        .order-icon {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
        }
        
        .pending-icon {
          background: linear-gradient(135deg, #ff9800, #e65100);
        }
        
        .shipped-icon {
          background: linear-gradient(135deg, #9c27b0, #6a1b9a);
        }
        
        .delivered-icon {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
        }
        
        .revenue-icon {
          background: linear-gradient(135deg, #2196f3, #0d47a1);
        }
        
        .transaction-icon {
          background: linear-gradient(135deg, #9c27b0, #6a1b9a);
        }
        
        .refund-icon {
          background: linear-gradient(135deg, #f44336, #b71c1c);
        }
        
        .product-icon {
          background: linear-gradient(135deg, #2196f3, #0d47a1);
        }
        
        .category-icon {
          background: linear-gradient(135deg, #ff9800, #e65100);
        }
        
        .low-stock-icon {
          background: linear-gradient(135deg, #ff9800, #e65100);
        }
        
        .out-stock-icon {
          background: linear-gradient(135deg, #f44336, #b71c1c);
        }
        
        .stat-card-content {
          flex: 1;
        }
        
        .stat-card h3 {
          font-size: 14px;
          font-weight: 500;
          color: #666;
          margin-bottom: 6px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #888;
        }
        
        /* Modern Table Styles for Orders and Payments */
        .order-container, .data-table {
          background-color: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .order-table-header, .table-header {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr 2fr 1fr 1fr 1fr 1.5fr;
          background-color: #f9f9f9;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .order-row, .table-row {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr 2fr 1fr 1fr 1fr 1.5fr;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }
        
        .order-row:last-child, .table-row:last-child {
          border-bottom: none;
        }
        
        .table-cell {
          padding: 8px;
          font-size: 14px;
          color: #555;
          display: flex;
          align-items: center;
        }
        
        .order-table-header .table-cell, .table-header .table-cell {
          font-weight: 600;
          color: #333;
        }
        
        .order-id, .transaction-id {
          font-weight: 600;
          color: #8e44ad;
        }
        
        .customer-name {
          font-weight: 500;
        }
        
        .items-cell {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .order-item {
          margin-bottom: 4px;
          font-size: 13px;
          display: flex;
          align-items: center;
        }
        
        .order-item:last-child {
          margin-bottom: 0;
        }
        
        .item-bullet {
          margin-right: 6px;
          color: #9c27b0;
        }
        
        .payment-badge, .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }
        
        .paid {
          background-color: rgba(76, 175, 80, 0.15);
          color: #4caf50;
        }
        
        .pending {
          background-color: rgba(255, 152, 0, 0.15);
          color: #ff9800;
        }
        
        .failed {
          background-color: rgba(244, 67, 54, 0.15);
          color: #f44336;
        }
        
        .accepted {
          background-color: rgba(33, 150, 243, 0.15);
          color: #2196f3;
        }
        
        .shipped {
          background-color: rgba(156, 39, 176, 0.15);
          color: #9c27b0;
        }
        
        .delivered {
          background-color: rgba(76, 175, 80, 0.15);
          color: #4caf50;
        }
        
        .cancelled {
          background-color: rgba(244, 67, 54, 0.15);
          color: #f44336;
        }
        
        .actions-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .action-button, .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .action-button.accept {
          background-color: rgba(76, 175, 80, 0.15);
          color: #4caf50;
        }
        
        .action-button.reject {
          background-color: rgba(244, 67, 54, 0.15);
          color: #f44336;
        }
        
        .action-button.ship {
          background-color: rgba(156, 39, 176, 0.15);
          color: #9c27b0;
        }
        
        .action-button.view, .view-btn {
          background-color: rgba(33, 150, 243, 0.15);
          color: #2196f3;
        }
        
        .method-badge {
          padding: 6px 12px;
          background-color: rgba(142, 68, 173, 0.1);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: #8e44ad;
        }
        
        .status-pill {
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }
        
        /* Products Grid Styles */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
        }
        
        .product-card {
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        }
        
        .product-image {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to right, #f5f7fa, #f9f9f9);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .product-image:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 30%;
          background: linear-gradient(to top, rgba(255,255,255,0.8), transparent);
        }
        
        .product-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          z-index: 1;
        }
        
        .product-details {
          padding: 20px;
          position: relative;
        }
        
        .product-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #333;
          line-height: 1.4;
        }
        
        .product-category-badge {
          position: absolute;
          top: -12px;
          right: 20px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #8e44ad, #9b59b6);
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .product-price {
          font-size: 20px;
          font-weight: 700;
          color: #8e44ad;
          margin-bottom: 15px;
        }
        
        .stock-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .stock-level {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .in-stock {
          background-color: #4caf50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }
        
        .low-stock {
          background-color: #ff9800;
          box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
        }
        
        .out-of-stock {
          background-color: #f44336;
          box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
        }
        
        .stock-text {
          font-size: 13px;
          color: #666;
        }
        
        .product-actions {
          padding: 0 20px 20px;
          display: flex;
          gap: 15px;
        }
        
        .product-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        
        .edit-btn {
          background-color: rgba(33, 150, 243, 0.1);
          color: #2196f3;
        }
        
        .edit-btn:hover {
          background-color: #2196f3;
          color: white;
        }
        
        .delete-btn {
          background-color: rgba(244, 67, 54, 0.1);
          color: #f44336;
        }
        
        .delete-btn:hover {
          background-color: #f44336;
          color: white;
        }
        
        /* Upload Form Styles */
        .upload-form-container {
          background-color: #fff;
          border-radius: 15px;
        }
        
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .form-section {
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 30px;
        }
        
        .form-section:last-child {
          border-bottom: none;
        }
        
        .form-section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 25px;
          color: #333;
          position: relative;
          padding-left: 18px;
        }
        
        .form-section-title:before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 24px;
          background: linear-gradient(to bottom, #8e44ad, #9b59b6);
          border-radius: 3px;
        }
        
        .form-row {
          display: flex;
          gap: 25px;
          margin-bottom: 25px;
          justify-content: space-between;
        }
        
        .form-group {
          flex: 1;
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #555;
        }
        
        .selection-label {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
          display: block;
        }
        
        .sizes-container, .colors-container {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #eee;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.03);
        }
        
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background-color: #f9f9f9;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #8e44ad;
          box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
          background-color: #fff;
        }
        
        .selection-card {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 20px;
          width: 48%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .selection-title {
          font-size: 16px;
          color: #666;
          font-weight: 500;
          margin-bottom: 24px;
          margin-left: 10px;
        }
        
        .size-options {
          display: flex;
          gap: 15px;
        }
        
        .size-option {
          position: relative;
          cursor: pointer;
        }
        
        .size-option input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .size-option span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          background-color: white;
          border: 2px solid #eaeaea;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }
        
        .size-option input:checked ~ span {
          border-color: #9c27b0;
          box-shadow: 0 0 0 2px rgba(156,39,176,0.1);
        }
        
        .color-options {
          display: flex;
          gap: 24px;
          margin-left: 8px;
        }
        
        .color-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        
        .color-option input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .color-option label {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        
        .color-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-bottom: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .color-name {
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        
        .color-option input:checked + label .color-circle {
          box-shadow: 0 0 0 2px #9c27b0;
        }
        
        .image-upload-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .image-upload-area {
          border: 2px dashed #c1c1c1;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f9f9f9;
        }
        
        .image-upload-area:hover {
          border-color: #8e44ad;
          background-color: rgba(142, 68, 173, 0.05);
        }
        
        .upload-icon {
          font-size: 40px;
          color: #8e44ad;
          margin-bottom: 15px;
        }
        
        .file-input {
          display: none;
        }
        
        .uploaded-images-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .upload-placeholder {
          width: 100%;
          padding: 30px;
          text-align: center;
          background-color: #f5f7fa;
          border-radius: 10px;
          color: #888;
          font-size: 14px;
          border: 1px dashed #ddd;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 20px;
        }
        
        .submit-btn {
          padding: 12px 30px;
          background: linear-gradient(135deg, #8e44ad, #9b59b6);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(142, 68, 173, 0.2);
        }
        
        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(142, 68, 173, 0.3);
        }
        
        .cancel-btn {
          padding: 12px 30px;
          background-color: transparent;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cancel-btn:hover {
          background-color: #f5f5f5;
          border-color: #bbb;
        }
        
        /* Responsive Styles */
        @media (max-width: 1200px) {
          .stat-cards-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 992px) {
          .dashboard-sidebar {
            width: 80px;
            padding: 20px 0;
          }
          
          .sidebar-header {
            padding: 0 10px 20px;
            text-align: center;
          }
          
          .sidebar-header h1, .sidebar-header p {
            display: none;
          }
          
          .menu-item {
            padding: 15px 0;
            justify-content: center;
          }
          
          .menu-item span, .logout-button span {
            display: none;
          }
          
          .menu-icon {
            margin-right: 0;
            font-size: 20px;
          }
          
          .logout-button {
            padding: 15px 0;
            justify-content: center;
            margin: 15px auto;
            width: 50px;
            height: 50px;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 20px;
          }
          
          .dashboard-main {
            padding: 20px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          
          .order-table-header, .order-row, .table-header, .table-row {
            grid-template-columns: 1fr 1fr 1fr;
            overflow-x: auto;
          }
        }
        
        @media (max-width: 576px) {
          .stat-cards-container {
            grid-template-columns: 1fr;
          }
          
          .products-grid {
            grid-template-columns: 1fr;
          }
          
          .table-cell {
            padding: 8px 4px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;