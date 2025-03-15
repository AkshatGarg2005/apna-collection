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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage } from './cloudinary';

const productsCollection = collection(db, 'products');

// Get all products
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

// Get products by category
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

// Get a single product by ID
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

// Search products by name or description
export const searchProducts = async (searchTerm) => {
  try {
    // NOTE: Firestore doesn't support native text search
    // Fetching all products then filtering client-side
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

// Add a new product
export const addProduct = async (productData, imageFile) => {
  try {
    let imageUrl = '';
    let imagePublicId = '';
    
    // Upload image to Cloudinary if provided
    if (imageFile) {
      const uploadResult = await uploadImage(imageFile);
      if (uploadResult.success) {
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      } else {
        throw new Error('Image upload failed');
      }
    }
    
    // Create product in Firestore
    const docRef = await addDoc(productsCollection, {
      ...productData,
      image: imageUrl,
      imagePublicId: imagePublicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...productData,
      image: imageUrl,
      imagePublicId: imagePublicId
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (productId, productData, imageFile) => {
  try {
    const productRef = doc(db, 'products', productId);
    
    // Get current product to check if image needs to be updated
    const currentProduct = await getDoc(productRef);
    if (!currentProduct.exists()) {
      throw new Error('Product not found');
    }
    
    let updateData = {
      ...productData,
      updatedAt: serverTimestamp()
    };
    
    // Upload new image to Cloudinary if provided
    if (imageFile) {
      const uploadResult = await uploadImage(imageFile);
      if (uploadResult.success) {
        updateData.image = uploadResult.url;
        updateData.imagePublicId = uploadResult.publicId;
      } else {
        throw new Error('Image upload failed');
      }
    }
    
    // Update product in Firestore
    await updateDoc(productRef, updateData);
    
    return {
      id: productId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    // Get product info to delete the associated image
    const productRef = doc(db, 'products', productId);
    const product = await getDoc(productRef);
    
    if (!product.exists()) {
      throw new Error('Product not found');
    }
    
    // Delete from Firestore
    await deleteDoc(productRef);
    
    // Note about deleting the image from Cloudinary:
    // For security, Cloudinary image deletion should be handled
    // through a server or cloud function, not directly from the client.
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get featured or new products
export const getFeaturedProducts = async (limit = 4) => {
  try {
    const q = query(
      productsCollection,
      where('isNew', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw error;
  }
};