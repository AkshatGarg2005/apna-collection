import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Sign up with email and password
  const signup = async (email, password, name, phone) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName: name,
        phone,
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout current user
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      if (!currentUser) {
        throw new Error('No user is logged in');
      }
      
      // Update display name if provided
      if (data.displayName) {
        await updateProfile(currentUser, {
          displayName: data.displayName
        });
      }
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // Update local profile state
      setUserProfile(prev => ({
        ...prev,
        ...data
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Add a new address to user profile
  const addUserAddress = async (address) => {
    try {
      if (!currentUser) {
        throw new Error('No user is logged in');
      }
      
      // Get current addresses
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Prepare addresses array (use existing or create new)
      const addresses = userData.addresses || [];
      
      // If this is the first address or isDefault is true, mark as default
      if (addresses.length === 0 || address.isDefault) {
        // Set all existing addresses to non-default
        addresses.forEach(addr => addr.isDefault = false);
        address.isDefault = true;
      }
      
      // Add the new address
      addresses.push(address);
      
      // Update in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        addresses,
        updatedAt: serverTimestamp()
      });
      
      // Update local profile state
      setUserProfile(prev => ({
        ...prev,
        addresses
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // Explicitly refresh the user profile
  const refreshUserProfile = async (userId) => {
    if (!userId) return;
    
    try {
      setLoadingProfile(true);
      
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        // Update the userProfile state with the latest data from Firestore
        const userData = userSnapshot.data();
        setUserProfile(userData);
        console.log("User profile refreshed successfully:", userData);
      } else {
        console.log("No user profile found for refresh");
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile when logged in
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
    loadingProfile,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    addUserAddress,
    loading,
    refreshUserProfile // Add the refreshUserProfile function to the context
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;