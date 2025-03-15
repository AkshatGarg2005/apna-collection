// src/components/AddressDisplay.js
import React from 'react';

// This is a reusable component for displaying an address consistently
const AddressDisplay = ({ address, userName, userPhone, showBadge = true }) => {
  return (
    <div className="address-display">
      {showBadge && address.isDefault && (
        <div className="default-badge">Default</div>
      )}
      
      <div className="address-type">
        <i className={`${address.type === 'Home' ? 'fas fa-home' : 'fas fa-briefcase'} address-icon`}></i> 
        {address.type}
      </div>
      
      <div className="address-details">
        {userName && <p className="address-name">{userName}</p>}
        <p>{address.address}</p>
        <p>{address.city}, {address.state} - {address.pincode}</p>
        {userPhone && <p>Phone: {userPhone}</p>}
      </div>
    </div>
  );
};

export default AddressDisplay;