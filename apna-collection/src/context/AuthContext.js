// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  // Register a new user
  const signup = async (email, password, displayName) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        role: 'customer', // Default role
        addresses: [],
        paymentMethods: []
      });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Sign in existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Sign out user
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        return userData;
      } else {
        console.log('No user profile found!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Update in Firestore
      await setDoc(doc(db, 'users', currentUser.uid), 
        profileData, 
        { merge: true }
      );
      
      // Refresh the profile data
      const updatedProfile = await fetchUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Address management functions
  const addAddress = async (newAddress) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Create a new address with ID
      const addressWithId = {
        ...newAddress,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Get current addresses
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      // If setting as default, update existing addresses
      let updatedAddresses;
      if (addressWithId.isDefault) {
        updatedAddresses = currentAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      } else {
        updatedAddresses = [...currentAddresses];
      }
      
      // Add new address
      updatedAddresses.push(addressWithId);
      
      // Update in Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid), 
        { addresses: updatedAddresses }, 
        { merge: true }
      );
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
      
      return { success: true, address: addressWithId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateAddress = async (addressId, updatedData) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Get current addresses
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      // Find the address to update
      const addressIndex = currentAddresses.findIndex(addr => addr.id === addressId);
      if (addressIndex === -1) throw new Error('Address not found');
      
      // Handle default status changes
      let updatedAddresses = [...currentAddresses];
      if (updatedData.isDefault) {
        // If setting as default, update all other addresses
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }
      
      // Update the specific address
      updatedAddresses[addressIndex] = {
        ...updatedAddresses[addressIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      // Update in Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid), 
        { addresses: updatedAddresses }, 
        { merge: true }
      );
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Get current addresses
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      // Filter out the address to delete
      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
      
      // Update in Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid), 
        { addresses: updatedAddresses }, 
        { merge: true }
      );
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');
      
      // Get current addresses
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      // Update default status
      const updatedAddresses = currentAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      
      // Update in Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid), 
        { addresses: updatedAddresses }, 
        { merge: true }
      );
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch the user profile when user logs in
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    updateUserProfile,
    loading,
    // Added address management functions
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};