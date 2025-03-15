// src/services/products.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage } from './cloudinary';

const productsCollection = collection(db, 'products');

// Set up real-time listener for all products
export const subscribeToProducts = (callback) => {
  const q = query(productsCollection, orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(products);
  }, (error) => {
    console.error('Error getting real-time products:', error);
    callback([]);
  });
};

// Set up real-time listener for products by category
export const subscribeToProductsByCategory = (category, callback) => {
  const q = query(
    productsCollection, 
    where('category', '==', category),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(products);
  }, (error) => {
    console.error(`Error getting real-time ${category} products:`, error);
    callback([]);
  });
};

// Set up real-time listener for a single product
export const subscribeToProduct = (productId, callback) => {
  const productRef = doc(db, 'products', productId);
  
  return onSnapshot(productRef, (snapshot) => {
    if (snapshot.exists()) {
      const product = {
        id: snapshot.id,
        ...snapshot.data()
      };
      callback(product);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error getting real-time product:', error);
    callback(null);
  });
};

// Get new arrivals with real-time updates
export const subscribeToNewArrivals = (limit = 4, callback) => {
  const q = query(
    productsCollection,
    where('isNew', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(products);
  }, (error) => {
    console.error('Error getting real-time new arrivals:', error);
    callback([]);
  });
};

// Get all products (non-realtime, for fallback)
export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get products by category (non-realtime, for fallback)
export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      productsCollection, 
      where('category', '==', category)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

// Get a single product by ID (non-realtime, for fallback)
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Search products 
export const searchProducts = async (searchTerm) => {
  try {
    // NOTE: Firestore doesn't support native text search
    // For a production app, consider using Algolia or ElasticSearch
    const snapshot = await getDocs(productsCollection);
    const allProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter products that contain the search term in name or description
    const searchTermLower = searchTerm.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTermLower) || 
      (product.description && product.description.toLowerCase().includes(searchTermLower))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Check if product has sufficient stock
export const checkProductStock = async (productId, quantity) => {
  try {
    const product = await getProductById(productId);
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      };
    }
    
    if (product.stock < quantity) {
      return {
        success: false,
        message: `Only ${product.stock} items available`,
        availableStock: product.stock
      };
    }
    
    return {
      success: true,
      availableStock: product.stock
    };
  } catch (error) {
    console.error('Error checking product stock:', error);
    throw error;
  }
};