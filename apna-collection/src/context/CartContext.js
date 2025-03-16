import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { processOrder, checkInventory } from '../services/orders';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setCart([]);
      }
    }
    setLoading(false);
  }, []);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // Add item to cart
  const addToCart = (product) => {
    setCart(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += product.quantity;
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, product];
      }
    });
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (id, size, color, quantity) => {
    if (quantity < 1) return;
    
    setCart(prevItems => 
      prevItems.map(item => 
        (item.id === id && item.size === size && item.color === color) 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (id, size, color) => {
    setCart(prevItems => 
      prevItems.filter(item => 
        !(item.id === id && item.size === size && item.color === color)
      )
    );
  };
  
  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Get total number of items in cart
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  // Get subtotal (alias for calculateSubtotal for compatibility)
  const getSubtotal = () => {
    return calculateSubtotal();
  };
  
  // Check if cart items are in stock
  const checkCartItemsInventory = async () => {
    if (cart.length === 0) {
      return { success: true, message: 'Cart is empty' };
    }
    
    try {
      const result = await checkInventory(cart);
      return result;
    } catch (error) {
      console.error('Error checking cart inventory:', error);
      return { 
        success: false, 
        message: 'Failed to check inventory. Please try again.' 
      };
    }
  };
  
  // Process order checkout
  const checkout = async (orderData) => {
    try {
      // Make sure we're logged in
      if (!currentUser) {
        return { 
          success: false, 
          message: 'Please log in to complete your order' 
        };
      }
      
      // Check inventory before proceeding
      const inventoryCheck = await checkCartItemsInventory();
      if (!inventoryCheck.success) {
        return inventoryCheck;
      }
      
      // Add user ID and cart items to order data
      const completeOrderData = {
        ...orderData,
        userId: currentUser.uid,
        items: cart
      };
      
      // Process the order
      const result = await processOrder(completeOrderData);
      
      // Clear cart on successful order
      if (result.success) {
        clearCart();
      }
      
      return result;
    } catch (error) {
      console.error('Error during checkout:', error);
      return { 
        success: false, 
        message: 'An error occurred during checkout. Please try again.' 
      };
    }
  };
  
  const value = {
    cart, // Renamed from cartItems to cart
    loading,
    addToCart,
    updateCartItemQuantity, // Renamed from updateQuantity
    removeFromCart,
    clearCart,
    calculateSubtotal,
    getSubtotal, // Added alias for compatibility 
    getTotalItems, // Added for compatibility
    checkout,
    checkCartItemsInventory
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;