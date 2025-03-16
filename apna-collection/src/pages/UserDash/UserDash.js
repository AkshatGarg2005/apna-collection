import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './UserDash.css';

const UserDash = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    userProfile, 
    updateUserProfile, 
    logout,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [activeSection, setActiveSection] = useState('overview');
  const [animateIn, setAnimateIn] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  
  // Form states for profile update
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phone: '',
    birthdate: ''
  });
  
  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for address editing
  const [editAddress, setEditAddress] = useState(null);

  // Mock data for sections that don't have real data yet
  const mockData = {
    recentOrders: [
      {
        id: "ORD48756",
        date: "March 8, 2025",
        total: 4298,
        status: "Delivered",
        items: [
          { name: "Premium Cotton Shirt", color: "White", size: "M", quantity: 1 },
          { name: "Slim Fit Trousers", color: "Navy Blue", size: "32", quantity: 1 }
        ]
      },
      {
        id: "ORD48621",
        date: "February 22, 2025",
        total: 3499,
        status: "Delivered",
        items: [
          { name: "Designer Blazer", color: "Black", size: "L", quantity: 1 }
        ]
      },
      {
        id: "ORD48512",
        date: "February 10, 2025",
        total: 2399,
        status: "Returned",
        items: [
          { name: "Silk Blend Kurta", color: "Maroon", size: "XL", quantity: 1 }
        ]
      }
    ]
  };

  // Initialize form data when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || currentUser?.displayName || '',
        phone: userProfile.phone || '',
        birthdate: userProfile.birthdate || ''
      });
    } else if (currentUser) {
      setProfileForm({
        displayName: currentUser.displayName || '',
        phone: '',
        birthdate: ''
      });
    }
  }, [userProfile, currentUser]);
  
  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, []);
  
  // Add animation when changing sections
  useEffect(() => {
    setAnimateIn(false);
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, [activeSection]);

  // Calculate user join date
  const formatJoinDate = () => {
    if (userProfile?.createdAt) {
      // If we have a Firestore timestamp
      const date = userProfile.createdAt.toDate ? 
                  userProfile.createdAt.toDate() : 
                  new Date(userProfile.createdAt);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (currentUser?.metadata?.creationTime) {
      // Fallback to Firebase auth creation time
      return new Date(currentUser.metadata.creationTime)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return 'Recently';
  };

  // Format price to Indian Rupee format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);
    
    try {
      await updateUserProfile(profileForm);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password update submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Implement password update functionality
      alert('Password update functionality not implemented in this demo');
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle adding item from wishlist to cart
  const handleAddToCartFromWishlist = (item) => {
    const productToAdd = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      size: 'M', // Default size
      color: 'Default' // Default color
    };
    
    addToCart(productToAdd);
    alert(`${item.name} added to cart!`);
  };

  // Handle removing item from wishlist
  const handleRemoveFromWishlist = (itemId) => {
    removeFromWishlist(itemId);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  // Show the address form
  const showAddAddressForm = () => {
    setShowAddressForm(true);
  };

  // Handle address form input changes
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle default address checkbox changes
  const handleDefaultAddressChange = (e) => {
    setNewAddress(prev => ({
      ...prev,
      isDefault: e.target.checked
    }));
  };

  // Handle address form submission
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const result = await addAddress(newAddress);
      
      if (result.success) {
        // Reset form and hide it
        setNewAddress({
          type: 'Home',
          address: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        });
        setShowAddressForm(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert('Failed to add address: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle editing an address
  const handleEditAddress = (address) => {
    setEditAddress(address);
    setNewAddress({
      type: address.type,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  // Handle updating an address
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const result = await updateAddress(editAddress.id, newAddress);
      
      if (result.success) {
        // Reset form and hide it
        setNewAddress({
          type: 'Home',
          address: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        });
        setEditAddress(null);
        setShowAddressForm(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert('Failed to update address: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting an address
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const result = await deleteAddress(addressId);
        
        if (result.success) {
          setUpdateSuccess(true);
          setTimeout(() => setUpdateSuccess(false), 3000);
        } else {
          alert('Failed to delete address: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  // Handle setting default address
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const result = await setDefaultAddress(addressId);
      
      if (result.success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert('Failed to set default address: ' + result.error);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  // Render the overview section
  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <button className="view-all-btn" onClick={() => setActiveSection('orders')}>
            View All
          </button>
        </div>
        <div className="order-cards">
          {mockData.recentOrders.slice(0, 2).map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <span className="order-id">{order.id}</span>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <span className="order-date">{order.date}</span>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-details">
                      {item.color}, Size: {item.size}, Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <span className="order-total">{formatPrice(order.total)}</span>
                <Link to={`/orders/${order.id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Profile Settings</h3>
            <button className="edit-btn" onClick={() => setActiveSection('profile')}>Edit</button>
          </div>
          <div className="profile-preview">
            <div className="avatar">
              <div className="avatar-placeholder">
                {(userProfile?.displayName || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-details">
              <div className="profile-detail">
                <span className="detail-label">Email</span>
                <span className="detail-value">{currentUser?.email || 'Not provided'}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{userProfile?.phone || 'Not provided'}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{formatJoinDate()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Wishlist</h3>
            <button className="view-all-btn" onClick={() => setActiveSection('wishlist')}>
              View All
            </button>
          </div>
          <div className="wishlist-preview">
            {wishlist.length > 0 ? (
              wishlist.slice(0, 2).map(item => (
                <div className="wishlist-item" key={item.id}>
                  <div className="wishlist-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="wishlist-item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{formatPrice(item.price)}</span>
                  </div>
                  <button 
                    className="add-to-cart-btn" 
                    onClick={() => handleAddToCartFromWishlist(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <p>Your wishlist is empty. Browse the shop and add items you like.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Saved Addresses</h3>
            <button className="edit-btn" onClick={() => setActiveSection('addresses')}>Manage</button>
          </div>
          <div className="address-preview">
            {userProfile?.addresses && userProfile.addresses.length > 0 ? (
              userProfile.addresses
                .filter(addr => addr.isDefault)
                .map(address => (
                  <div className="address-card" key={address.id}>
                    <div className="address-type">{address.type}</div>
                    <div className="address-details">
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} - {address.pincode}</p>
                    </div>
                    <div className="default-badge">Default</div>
                  </div>
                ))
            ) : (
              <p>No addresses saved yet. Add your first address from the Addresses section.</p>
            )}
          </div>
        </div>

        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Payment Methods</h3>
            <button className="edit-btn" onClick={() => setActiveSection('payments')}>Manage</button>
          </div>
          <div className="payment-preview">
            {userProfile?.paymentMethods && userProfile.paymentMethods.length > 0 ? (
              userProfile.paymentMethods
                .filter(pm => pm.isDefault)
                .map(payment => (
                  <div className="payment-card" key={payment.id}>
                    <div className="payment-type">{payment.type}</div>
                    <div className="payment-details">
                      <p className="payment-name">{payment.name}</p>
                      <p className="payment-number">{payment.number}</p>
                      {payment.expiry && <p className="payment-expiry">Expires: {payment.expiry}</p>}
                    </div>
                    <div className="default-badge">Default</div>
                  </div>
                ))
            ) : (
              <p>No payment methods saved yet. Add your first payment method from the Payment Methods section.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the orders section
  const renderOrders = () => (
    <div className="dashboard-orders">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Order History</h3>
        </div>
        <div className="order-list">
          {mockData.recentOrders.length > 0 ? (
            mockData.recentOrders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <span className="order-id">{order.id}</span>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <span className="order-date">{order.date}</span>
                </div>
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-details">
                        {item.color}, Size: {item.size}, Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="order-total">{formatPrice(order.total)}</span>
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="view-details-btn">
                      View Details
                    </Link>
                    {order.status === "Delivered" && (
                      <button className="reorder-btn">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>You haven't placed any orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render the profile section
  const renderProfile = () => (
    <div className="dashboard-profile">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Profile Information</h3>
        </div>
        {updateSuccess && (
          <div style={{ 
            backgroundColor: "#e8f5e9", 
            color: "#2e7d32", 
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            textAlign: "center"
          }}>
            Profile updated successfully!
          </div>
        )}
        <form onSubmit={handleProfileSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input 
                type="text" 
                id="displayName"
                name="displayName"
                value={profileForm.displayName} 
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={currentUser?.email || ''}
                disabled={true} // Email can't be changed
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                name="phone"
                value={profileForm.phone} 
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthdate">Date of Birth</label>
              <input 
                type="date" 
                id="birthdate"
                name="birthdate"
                value={profileForm.birthdate} 
                onChange={handleProfileChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Change Password</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render the wishlist section
  const renderWishlist = () => (
    <div className="dashboard-wishlist">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>My Wishlist</h3>
        </div>
        <div className="wishlist-grid">
          {wishlist.length > 0 ? (
            wishlist.map(item => (
              <div className="wishlist-item-card" key={item.id}>
                <div className="wishlist-item-image">
                  <img src={item.image} alt={item.name} />
                  <button 
                    className="remove-wishlist-btn"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    ×
                  </button>
                </div>
                <div className="wishlist-item-details">
                  <h4>{item.name}</h4>
                  <span className="item-price">{formatPrice(item.price)}</span>
                </div>
                <button 
                  className="add-to-cart-btn" 
                  onClick={() => handleAddToCartFromWishlist(item)}
                >
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', gridColumn: '1 / -1' }}>
              <p>Your wishlist is empty. Browse the shop and add items you like.</p>
              <Link to="/shop" className="add-btn" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
                Go to Shop
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render the addresses section
  const renderAddresses = () => (
    <div className="dashboard-addresses">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Saved Addresses</h3>
          {!showAddressForm && (
            <button className="add-btn" onClick={showAddAddressForm}>+ Add New Address</button>
          )}
        </div>
        
        {updateSuccess && (
          <div style={{ 
            backgroundColor: "#e8f5e9", 
            color: "#2e7d32", 
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            textAlign: "center"
          }}>
            Address {editAddress ? 'updated' : 'added'} successfully!
          </div>
        )}
        
        {/* Add Address Form */}
        {showAddressForm && (
          <div style={{ marginBottom: "30px" }}>
            <form onSubmit={editAddress ? handleUpdateAddress : handleAddressSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Address Type</label>
                  <select 
                    id="type"
                    name="type"
                    value={newAddress.type}
                    onChange={handleAddressInputChange}
                    className="form-control"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <input 
                    type="text" 
                    id="address"
                    name="address"
                    value={newAddress.address}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input 
                    type="text" 
                    id="state"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input 
                    type="text" 
                    id="pincode"
                    name="pincode"
                    value={newAddress.pincode}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input 
                    type="checkbox" 
                    id="isDefault"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={handleDefaultAddressChange}
                    style={{ marginRight: "10px" }}
                  />
                  <label htmlFor="isDefault">Set as default address</label>
                </div>
              </div>
              
              <div className="form-actions" style={{ display: "flex", gap: "15px" }}>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? (editAddress ? 'Updating...' : 'Adding...') : (editAddress ? 'Update Address' : 'Add Address')}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditAddress(null);
                    setNewAddress({
                      type: 'Home',
                      address: '',
                      city: '',
                      state: '',
                      pincode: '',
                      isDefault: false
                    });
                  }}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "1px solid #E1D9D2",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Existing code for displaying addresses */}
        <div className="address-list">
          {userProfile?.addresses && userProfile.addresses.length > 0 ? (
            userProfile.addresses.map(address => (
              <div className="address-card" key={address.id}>
                <div className="address-type">{address.type}</div>
                <div className="address-details">
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>
                <div className="address-actions">
                  <button className="edit-address-btn" onClick={() => handleEditAddress(address)}>Edit</button>
                  <button className="delete-address-btn" onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                  {!address.isDefault && (
                    <button className="set-default-btn" onClick={() => handleSetDefaultAddress(address.id)}>
                      Set as Default
                    </button>
                  )}
                  {address.isDefault && (
                    <div className="default-badge">Default</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p>You don't have any saved addresses yet.</p>
              {!showAddressForm && (
                <button className="add-btn" style={{ marginTop: '20px' }} onClick={showAddAddressForm}>
                  + Add Your First Address
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render the payments section
  const renderPayments = () => (
    <div className="dashboard-payments">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Payment Methods</h3>
          <button className="add-btn">+ Add New Payment Method</button>
        </div>
        <div className="payment-list">
          {userProfile?.paymentMethods && userProfile.paymentMethods.length > 0 ? (
            userProfile.paymentMethods.map(payment => (
              <div className="payment-card-large" key={payment.id}>
                <div className="payment-type">{payment.type}</div>
                <div className="payment-details">
                  <p className="payment-name">{payment.name}</p>
                  <p className="payment-number">{payment.number}</p>
                  {payment.expiry && <p className="payment-expiry">Expires: {payment.expiry}</p>}
                </div>
                <div className="payment-actions">
                  {!payment.isDefault ? (
                    <button className="set-default-btn">Set as Default</button>
                  ) : (
                    <div className="default-badge">Default</div>
                  )}
                  <button className="delete-payment-btn">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p>You don't have any saved payment methods yet.</p>
              <button className="add-btn" style={{ marginTop: '20px' }}>
                + Add Your First Payment Method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Determine which content to render based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'profile':
        return renderProfile();
      case 'wishlist':
        return renderWishlist();
      case 'addresses':
        return renderAddresses();
      case 'payments':
        return renderPayments();
      default:
        return renderOverview();
    }
  };

  // Get first letter of user's name for avatar
  const getInitial = () => {
    const name = userProfile?.displayName || currentUser?.displayName || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-welcome">
        <h2>Welcome, {userProfile?.displayName || currentUser?.displayName || 'User'}</h2>
        <div className="welcome-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="account-status">
          <span className="status-indicator active"></span>
          <span className="status-text">Signed in as {currentUser?.email}</span>
        </div>
      </div>
      
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="sidebar-avatar">
            <div className="avatar-circle">
              {getInitial()}
            </div>
            <span className="user-name">{userProfile?.displayName || currentUser?.displayName || 'User'}</span>
            <span className="member-since">Member since {formatJoinDate()}</span>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span className="nav-text">Overview</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <span className="nav-text">My Orders</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <span className="nav-text">Profile</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveSection('wishlist')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </span>
              <span className="nav-text">Wishlist</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveSection('addresses')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span className="nav-text">Addresses</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveSection('payments')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </span>
              <span className="nav-text">Payment Methods</span>
            </button>
            
            <button onClick={handleLogout} className="nav-item logout">
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="nav-text">Logout</span>
            </button>
          </nav>
        </div>
        
        <div className="dashboard-content">
          <div className={`dashboard-content-inner ${animateIn ? 'fade-in' : 'fade-out'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDash;