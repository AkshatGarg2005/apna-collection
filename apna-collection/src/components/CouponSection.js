// src/components/CouponSection.js
import React, { useState, useEffect } from 'react';
import { validateCoupon, getAvailableCoupons } from '../services/couponService';

const CouponSection = ({ subtotal, onCouponApplied, userId, isMobile, isLargePhone }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailable, setShowAvailable] = useState(false);

  // Fetch available coupons on component mount
  useEffect(() => {
    const fetchCoupons = async () => {
      const coupons = await getAvailableCoupons();
      setAvailableCoupons(coupons);
    };
    
    fetchCoupons();
  }, []);

  // Apply promo code
  const applyPromoCode = async () => {
    // Reset previous messages
    setPromoError('');
    setPromoSuccess('');
    
    if (promoCode.trim() === '') {
      setPromoError('Please enter a valid promo code.');
      return;
    }
    
    const code = promoCode.trim().toUpperCase();
    
    try {
      setIsLoadingPromo(true);
      
      // Call the coupon validation service
      const result = await validateCoupon(code, subtotal, userId);
      
      if (result.valid) {
        // Set the discount amount
        setPromoSuccess(`Coupon applied! ${result.coupon.discountType === 'percentage' ? 
          `${result.coupon.discount}% discount` : 
          `₹${result.discountAmount} discount`}`);
        
        // Call the parent callback with coupon info
        onCouponApplied(result.coupon, result.discountAmount);
        
        // Store coupon info in localStorage for checkout
        localStorage.setItem('appliedCoupon', JSON.stringify({
          code: code,
          id: result.coupon.id,
          discount: result.discountAmount,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discount
        }));
      } else {
        setPromoError(result.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setPromoError('Failed to apply coupon. Please try again.');
    } finally {
      setIsLoadingPromo(false);
      setPromoCode(''); // Clear the input field
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Apply coupon directly from the available list
  const applySelectedCoupon = (code) => {
    setPromoCode(code);
    setTimeout(() => applyPromoCode(), 100);
  };

  return (
    <div className="promo-code-section">
      <h3 style={{
        fontSize: isMobile || isLargePhone ? '1rem' : '1rem',
        marginBottom: isMobile || isLargePhone ? '10px' : '15px',
        color: '#555'
      }}>
        Promo Code
      </h3>
      
      <div className="promo-form" style={{
        display: 'flex',
        marginBottom: isMobile || isLargePhone ? '15px' : '20px',
        flexWrap: isMobile || isLargePhone ? 'wrap' : 'nowrap'
      }}>
        <input 
          type="text" 
          placeholder="Enter promo code" 
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="promo-input"
          disabled={isLoadingPromo}
          style={{
            flex: 1,
            padding: isMobile || isLargePhone ? '10px 12px' : '12px 15px',
            border: '1px solid #e1d9d2',
            borderRadius: isMobile || isLargePhone ? '4px' : '4px 0 0 4px',
            fontSize: isMobile || isLargePhone ? '0.9rem' : '0.9rem',
            backgroundColor: isLoadingPromo ? '#f9f9f9' : 'white',
            marginBottom: isMobile || isLargePhone ? '8px' : 0,
            width: isMobile || isLargePhone ? '100%' : 'auto'
          }}
        />
        <button 
          type="button" 
          className="promo-btn"
          onClick={applyPromoCode}
          disabled={isLoadingPromo}
          style={{
            padding: '0 15px',
            backgroundColor: isLoadingPromo ? '#d0b895' : '#c59b6d',
            color: 'white',
            border: 'none',
            borderRadius: isMobile || isLargePhone ? '4px' : '0 4px 4px 0',
            fontWeight: 500,
            cursor: isLoadingPromo ? 'wait' : 'pointer',
            transition: 'background-color 0.3s',
            fontSize: isMobile || isLargePhone ? '0.9rem' : 'inherit',
            height: isMobile || isLargePhone ? '38px' : 'auto',
            width: isMobile || isLargePhone ? '100%' : 'auto'
          }}
        >
          {isLoadingPromo ? 'Applying...' : 'Apply'}
        </button>
      </div>
      
      {promoError && (
        <div style={{ 
          color: '#dc3545', 
          fontSize: isMobile || isLargePhone ? '1rem' : '0.9rem', 
          marginBottom: '15px' 
        }}>
          {promoError}
        </div>
      )}
      
      {promoSuccess && (
        <div style={{ 
          color: '#28a745', 
          fontSize: isMobile || isLargePhone ? '1rem' : '0.9rem', 
          marginBottom: '15px' 
        }}>
          {promoSuccess}
        </div>
      )}

      {availableCoupons.length > 0 && (
        <div className="available-coupons">
          <button 
            onClick={() => setShowAvailable(!showAvailable)}
            style={{
              background: 'none',
              border: 'none',
              color: '#c59b6d',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              marginBottom: '10px'
            }}
          >
            {showAvailable ? 'Hide available coupons' : 'View available coupons'}
          </button>
          
          {showAvailable && (
            <div className="coupons-list" style={{ marginTop: '10px' }}>
              {availableCoupons.map(coupon => (
                <div 
                  key={coupon.id} 
                  className="coupon-card"
                  style={{
                    border: '1px dashed #c59b6d',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#faf7f2'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{coupon.code}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {coupon.discountType === 'percentage' ? 
                          `${coupon.discount}% off (Max ${formatCurrency(coupon.maxDiscount)})` : 
                          `${formatCurrency(coupon.discount)} off`}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        Min order: {formatCurrency(coupon.minOrder)}
                      </div>
                    </div>
                    <button 
                      onClick={() => applySelectedCoupon(coupon.code)}
                      style={{
                        backgroundColor: '#c59b6d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponSection;