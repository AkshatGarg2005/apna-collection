import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist data:', error);
        setWishlist([]);
      }
    }
    setLoading(false);
  }, []);
  
  // Save wishlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  
  // Add item to wishlist
  const addToWishlist = (product) => {
    setWishlist(prevItems => {
      // Check if item already exists in wishlist
      const exists = prevItems.some(item => item.id === product.id);
      
      if (exists) {
        return prevItems;
      } else {
        // Add new item if it doesn't exist
        return [...prevItems, product];
      }
    });
  };
  
  // Remove item from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };
  
  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };
  
  // Toggle wishlist item (add if not present, remove if present)
  const toggleWishlist = (product) => {
    const isInList = isInWishlist(product.id);
    
    if (isInList) {
      removeFromWishlist(product.id);
      return false; // Return false to indicate item was removed
    } else {
      addToWishlist(product);
      return true; // Return true to indicate item was added
    }
  };
  
  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
  };
  
  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist
  };
  
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;