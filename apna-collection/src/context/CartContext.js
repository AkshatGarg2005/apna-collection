// src/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Load cart from localStorage or Firestore on component mount or user change
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      
      try {
        if (currentUser) {
          // If user is logged in, try to load cart from Firestore
          const cartRef = doc(db, 'carts', currentUser.uid);
          const cartSnap = await getDoc(cartRef);
          
          if (cartSnap.exists()) {
            setCart(cartSnap.data().items || []);
          } else {
            // If no cart exists in Firestore, initialize with local cart
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            if (localCart.length > 0) {
              // Save local cart to Firestore
              await setDoc(cartRef, { items: localCart });
            }
            setCart(localCart);
          }
        } else {
          // If no user is logged in, load from localStorage
          const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          setCart(localCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(localCart);
      }
      
      setLoading(false);
    };
    
    loadCart();
  }, [currentUser]);
  
  // Save cart to localStorage and Firestore when it changes
  useEffect(() => {
    if (!loading) {
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Save to Firestore if user is logged in
      if (currentUser) {
        const saveCart = async () => {
          try {
            const cartRef = doc(db, 'carts', currentUser.uid);
            await setDoc(cartRef, { items: cart });
          } catch (error) {
            console.error('Error saving cart to Firestore:', error);
          }
        };
        
        saveCart();
      }
    }
  }, [cart, currentUser, loading]);
  
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
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate cart totals
  const calculateCartTotals = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal > 999 ? 0 : 99; // Free shipping over ₹999
    const total = subtotal + tax + shipping;
    
    return {
      subtotal,
      tax,
      shipping,
      total
    };
  };
  
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    calculateCartTotals,
    loading
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};