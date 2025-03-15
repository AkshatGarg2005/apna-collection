// src/context/AdminAuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sign in admin user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user has admin role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        return { success: true, user: userCredential.user };
      } else {
        // Sign out if user is not an admin
        await signOut(auth);
        return { success: false, error: 'Unauthorized access. Admin privileges required.' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Sign out admin user
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify admin role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setCurrentAdmin(user);
        } else {
          setCurrentAdmin(null);
          signOut(auth);
        }
      } else {
        setCurrentAdmin(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const value = {
    currentAdmin,
    login,
    logout,
    loading
  };
  
  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};