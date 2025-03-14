import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  // State for orders, filters, search, and modal
  const [orders, setOrders] = useState([
    // Sample orders data
    {
      id: 'AC23051587',
      date: '4 March, 2025',
      status: 'Delivered',
      items: [
        {
          id: 1,
          name: 'Premium Cotton Formal Shirt',
          image: '/api/placeholder/200/200',
          size: 'L',
          color: 'White',
          quantity: 1,
          price: 1299
        },
        {
          id: 2,
          name: 'Slim Fit Dark Denim Jeans',
          image: '/api/placeholder/200/200',
          size: '32',
          color: 'Dark Blue',
          quantity: 1,
          price: 1899
        }
      ],
      total: 3198,
      payment: {
        method: 'UPI',
        status: 'Paid'
      }
    },
    {
      id: 'AC23051492',
      date: '28 February, 2025',
      status: 'Shipped',
      items: [
        {
          id: 3,
          name: 'Traditional Silk Kurta',
          image: '/api/placeholder/200/200',
          size: 'M',
          color: 'Maroon',
          quantity: 1,
          price: 2999
        }
      ],
      total: 2999,
      payment: {
        method: 'Credit Card',
        status: 'Paid'
      }
    },
    {
      id: 'AC23051375',
      date: '15 February, 2025',
      status: 'Processing',
      items: [
        {
          id: 4,
          name: 'Designer Blazer',
          image: '/api/placeholder/200/200',
          size: '40',
          color: 'Navy Blue',
          quantity: 1,
          price: 3499
        },
        {
          id: 5,
          name: 'Formal Shoes',
          image: '/api/placeholder/200/200',
          size: '9',
          color: 'Brown',
          quantity: 1,
          price: 2199
        }
      ],
      total: 5698,
      payment: {
        method: 'Cash on Delivery',
        status: 'Pending'
      }
    },
    {
      id: 'AC23051240',
      date: '10 February, 2025',
      status: 'Cancelled',
      items: [
        {
          id: 6,
          name: 'Polo T-shirt',
          image: '/api/placeholder/200/200',
          size: 'M',
          color: 'Black',
          quantity: 2,
          price: 1199
        }
      ],
      total: 2398,
      payment: {
        method: 'UPI',
        status: 'Refunded'
      }
    }
  ]);
  
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [modalOrder, setModalOrder] = useState(null);
  
  // Filter orders when activeFilter or searchTerm changes
  useEffect(() => {
    let result = [...orders];
    
    // Apply filter
    if (activeFilter !== 'All Orders') {
      if (activeFilter === 'Recent') {
        // Get the two most recent orders
        result = result.slice(0, 2);
      } else {
        result = result.filter(order => 
          order.status === activeFilter
        );
      }
    }
    
    // Apply search
    if (searchTerm.trim() !== '') {
      result = result.filter(order => {
        const matchesId = order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProduct = order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesId || matchesProduct;
      });
    }
    
    setFilteredOrders(result);
  }, [activeFilter, searchTerm, orders]);
  
  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    return status.toLowerCase();
  };
  
  return (
    <div className="orders-container">
      <h1 className="page-title">My Orders</h1>
      
      <div className="orders-layout">
        {/* Filter Buttons */}
        <div className="filter-section">
          <button 
            className={`filter-btn ${activeFilter === 'All Orders' ? 'active' : ''}`}
            onClick={() => handleFilterClick('All Orders')}
          >
            All Orders
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Recent' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Recent')}
          >
            Recent
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Delivered' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Delivered')}
          >
            Delivered
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Processing' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Processing')}
          >
            Processing
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Cancelled')}
          >
            Cancelled
          </button>
        </div>
        
        {/* Orders and Search Content */}
        <div className="orders-content">
          {/* Search Box */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search orders by ID, product..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Orders List */}
          <div className="orders-list">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div className="order-card" key={order.id}>
                  <div className="order-header">
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-info">
                      <div className="order-date">Ordered on {order.date}</div>
                      <div className={`order-status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                  
                  {order.items.map(item => (
                    <div className="order-item" key={item.id}>
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <div className="item-meta">
                          <span>Size: {item.size}</span>
                          <span>Color: {item.color}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="item-price">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="empty-orders">
                <i className="fas fa-box-open"></i>
                <h3>No orders found</h3>
                <p>We couldn't find any orders matching your criteria.</p>
                <Link to="/shop" className="shop-link">Continue Shopping</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;