// src/pages/OrdersDebug.js
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const OrdersDebug = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersList);
      setLoading(false);
      
      // Log orders to console for debugging
      console.log("All orders:", ordersList);
      
      // Try to find orders with coupon information
      const ordersWithCoupons = ordersList.filter(order => {
        // Check common coupon field names
        return order.couponCode || order.couponId || order.coupon || 
               order.discount || order.couponDiscount || 
               (order.coupon && order.coupon.code);
      });
      
      console.log("Orders with potential coupon data:", ordersWithCoupons);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout title="Order Debug">
      <h1>Orders Debug</h1>
      <p>Check your browser console for order data</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Orders with Coupon Fields (any field match)</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {orders.filter(order => {
              // Check for any potential coupon-related field
              const keys = Object.keys(order);
              return keys.some(key => key.toLowerCase().includes('coupon') || key.toLowerCase().includes('discount') || key.toLowerCase().includes('promo'));
            }).map(order => (
              <div key={order.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px',
                borderRadius: '8px'
              }}>
                <h3>Order #{order.orderNumber || order.id.slice(0, 8)}</h3>
                <p>Order ID: {order.id}</p>
                <p>Status: {order.status || 'N/A'}</p>
                <p>Total: ₹{order.total || 0}</p>
                
                <div style={{ marginTop: '10px' }}>
                  <h4>All Coupon/Discount Related Fields:</h4>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '5px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(order).filter(([key]) => 
                          key.toLowerCase().includes('coupon') || 
                          key.toLowerCase().includes('discount') || 
                          key.toLowerCase().includes('promo')
                        )
                      ), 
                      null, 2
                    )}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersDebug;