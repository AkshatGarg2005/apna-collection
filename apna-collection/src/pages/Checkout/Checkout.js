import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateCoupon } from '../../services/couponService';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { cart, calculateCartTotals, clearCart } = useCart();
  
  // Phone validation state and function
  const [phoneError, setPhoneError] = useState('');
  
  const validatePhoneNumber = (phone) => {
    // Basic validation: Must be at least 10 digits
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, '')); // Remove non-digits before testing
  };
  
  // Cart items state - now connected to cart context
  const [cartItems, setCartItems] = useState([]);
  
  // Load cart items when component mounts
  useEffect(() => {
    if (cart && cart.length > 0) {
      setCartItems(cart);
    } else {
      // Redirect to cart if cart is empty
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  // Load user addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      setAddresses(userProfile.addresses);
      
      // Set default address as selected
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(userProfile.addresses[0].id);
      }
    }
  }, [userProfile]);
  
  // Payment method state - defaulting to COD
  const [paymentMethod, setPaymentMethod] = useState('codPayment');
  
  // Payment details states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  
  const [upiDetails, setUpiDetails] = useState({
    upiId: ''
  });
  
  const [netBankingDetails, setNetBankingDetails] = useState({
    bank: ''
  });
  
  // Form states
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    orderNotes: ''
  });
  
  // Load user profile data when available
  useEffect(() => {
    if (currentUser || userProfile) {
      setContactInfo(prevInfo => ({
        ...prevInfo,
        fullName: userProfile?.displayName || currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: userProfile?.phone || ''
      }));
    }
  }, [currentUser, userProfile]);
  
  // Summary state (updated to include shipping)
  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    gst: 0,
    total: 0
  });
  
  // Animation references
  const subtotalRef = useRef(null);
  const discountRef = useRef(null);
  const shippingRef = useRef(null);
  const gstRef = useRef(null);
  const totalRef = useRef(null);
  
  // Place order animation state
  const [orderButtonState, setOrderButtonState] = useState({
    isLoading: false,
    isSuccess: false,
    text: 'Place Order',
    icon: 'fas fa-lock'
  });
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  // Load coupon from localStorage if it was applied in cart
  useEffect(() => {
    const storedCoupon = localStorage.getItem('appliedCoupon');
    if (storedCoupon) {
      try {
        const couponData = JSON.parse(storedCoupon);
        if (couponData && couponData.code) {
          setAppliedCoupon(couponData);
          setIsCouponApplied(true);
          setCouponSuccess(`Coupon ${couponData.code} applied!`);
        }
        
        // Remove from localStorage to prevent reuse
        localStorage.removeItem('appliedCoupon');
      } catch (error) {
        console.error('Error parsing applied coupon:', error);
      }
    }
  }, []);
  
  // Calculate order summary
  useEffect(() => {
    calculateOrderSummary();
  }, [cartItems, appliedCoupon, isCouponApplied]);
  
  const calculateOrderSummary = () => {
    // Calculate subtotal
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate discount (only if coupon is applied)
    const discount = isCouponApplied && appliedCoupon ? (appliedCoupon.discount || 0) : 0;
    
    // Calculate amount after discount
    const afterDiscount = subtotal - discount;
    
    // Calculate shipping - free for orders over ₹1000
    const shipping = subtotal > 1000 ? 0 : 99;
    
    // Calculate GST (18%) on discounted amount
    const gst = Math.round(afterDiscount * 0.18);
    
    // Calculate total
    const total = afterDiscount + gst + shipping;
    
    // Update state with new values
    setSummary(prevSummary => {
      const newSummary = {
        subtotal,
        discount,
        shipping,
        gst,
        total
      };
      
      // Animate changes if values are different
      if (prevSummary.subtotal !== 0) {
        if (prevSummary.subtotal !== subtotal && subtotalRef.current) 
          animateValue(subtotalRef.current, prevSummary.subtotal, subtotal);
        if (prevSummary.discount !== discount && discountRef.current) 
          animateValue(discountRef.current, prevSummary.discount, discount, true);
        if (prevSummary.shipping !== shipping && shippingRef.current) 
          animateValue(shippingRef.current, prevSummary.shipping, shipping);
        if (prevSummary.gst !== gst && gstRef.current) 
          animateValue(gstRef.current, prevSummary.gst, gst);
        if (prevSummary.total !== total && totalRef.current) 
          animateValue(totalRef.current, prevSummary.total, total, false, true);
      }
      
      return newSummary;
    });
  };
  
  // Animate value change
  const animateValue = (element, start, end, isDiscount = false, isTotal = false) => {
    if (!element) return;
    
    const duration = 800;
    const startTime = performance.now();
    const prefix = isDiscount ? '-₹' : '₹';
    
    // Handling free shipping
    if (end === 0 && element === shippingRef.current) {
      element.textContent = 'Free';
      return;
    }
    
    // Highlight the element
    element.style.transition = 'all 0.3s ease';
    element.style.backgroundColor = isTotal 
      ? 'rgba(197, 155, 109, 0.15)' 
      : 'rgba(241, 236, 229, 0.5)';
    element.style.transform = 'scale(1.05)';
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);
      
      // Calculate current value
      const current = Math.round(start + (end - start) * easedProgress);
      
      // Update the element
      element.textContent = `${prefix}${current.toLocaleString()}`;
      
      // Add glow effect for total
      if (isTotal) {
        const intensity = 1 - progress;
        element.style.textShadow = `0 0 ${5 * intensity}px rgba(197, 155, 109, ${0.8 * intensity})`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        // Restore element style after animation
        setTimeout(() => {
          element.style.backgroundColor = '';
          element.style.transform = '';
          element.style.textShadow = '';
        }, 300);
      }
    };
    
    requestAnimationFrame(animateFrame);
  };
  
  // Handle quantity changes
  const decreaseQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    
    // If quantity is 1, remove the item instead of decreasing
    if (item && item.quantity === 1) {
      removeItem(itemId);
    } else {
      setCartItems(cartItems.map(item => {
        if (item.id === itemId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }));
    }
  };
  
  const increaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item => {
      if (item.id === itemId && item.quantity < 10) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };
  
  const updateQuantity = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) return;
    
    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.min(quantity, 10) };
      }
      return item;
    }));
  };
  
  // Remove item from cart with animation
  const removeItem = (itemId) => {
    // Find the cart item element
    const itemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
    
    if (itemElement) {
      // Add removal animation
      itemElement.style.transition = 'all 0.5s ease';
      itemElement.style.height = `${itemElement.offsetHeight}px`;
      itemElement.style.overflow = 'hidden';
      
      // First fade out
      itemElement.style.opacity = '0';
      itemElement.style.transform = 'translateX(20px)';
      
      setTimeout(() => {
        // Then collapse
        itemElement.style.height = '0';
        itemElement.style.marginTop = '0';
        itemElement.style.marginBottom = '0';
        itemElement.style.padding = '0';
        
        // Finally remove from state after animation completes
        setTimeout(() => {
          setCartItems(cartItems.filter(item => item.id !== itemId));
        }, 300);
      }, 300);
    } else {
      // If element not found, just update the state
      setCartItems(cartItems.filter(item => item.id !== itemId));
    }
  };
  
  // Select address
  const selectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };
  
  // Handle contact info changes
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If phone number is being changed, update it in the database immediately
    if (name === 'phone' && value && value.trim().length >= 10 && validatePhoneNumber(value)) {
      updateUserPhoneInDatabase(value);
    }
  };
  
  // Update phone number in database
  const updateUserPhoneInDatabase = async (phoneNumber) => {
    if (!currentUser || !currentUser.uid) return;
    
    try {
      console.log("Updating phone number in database:", phoneNumber);
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Update the user profile in Firestore with the phone number
      await updateDoc(userRef, {
        phone: phoneNumber,
        updatedAt: serverTimestamp()
      });
      
      console.log("✅ Phone number updated successfully in database");
      
      // Optional: Show a subtle notification
      const phoneInput = document.querySelector('input[name="phone"]');
      if (phoneInput) {
        phoneInput.style.transition = 'all 0.3s ease';
        phoneInput.style.borderColor = '#28a745';
        phoneInput.style.backgroundColor = 'rgba(40, 167, 69, 0.05)';
        
        setTimeout(() => {
          phoneInput.style.borderColor = '';
          phoneInput.style.backgroundColor = '';
        }, 2000);
      }
      
    } catch (error) {
      console.error("Failed to update phone number in database:", error);
    }
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.id);
  };
  
  // Handle card details changes
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle UPI details changes
  const handleUpiDetailsChange = (e) => {
    const { name, value } = e.target;
    setUpiDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle net banking details changes
  const handleNetBankingDetailsChange = (e) => {
    const { name, value } = e.target;
    setNetBankingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply coupon with server validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setCouponError('');
    setCouponSuccess('');
    setIsCouponLoading(true);
    
    try {
      // Call the validateCoupon service
      const result = await validateCoupon(
        couponCode.trim().toUpperCase(),
        summary.subtotal,
        currentUser?.uid
      );
      
      if (result.valid) {
        // Coupon is valid
        setIsCouponApplied(true);
        setCouponSuccess(`Coupon applied successfully! ${result.message}`);
        
        // Store the coupon data with the required fields
        const couponData = {
          code: result.coupon.code,
          id: result.coupon.id || null,    // Ensure id is not undefined
          discount: result.discountAmount || 0,
          discountType: result.coupon.discountType || 'percentage',
          discountValue: result.coupon.discount || 0
        };
        
        // Log coupon data for debugging
        console.log("Applied coupon data:", couponData);
        
        setAppliedCoupon(couponData);
        
        // Show success animation on the discount row
        const discountRow = document.querySelector('.summary-row:nth-child(2)');
        if (discountRow) {
          discountRow.style.transition = 'all 0.5s ease';
          discountRow.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
          discountRow.style.borderLeft = '3px solid #28a745';
          
          setTimeout(() => {
            discountRow.style.backgroundColor = '';
            discountRow.style.borderLeft = '';
          }, 3000);
        }
        
        // Clear the input
        setCouponCode('');
      } else {
        // Coupon is invalid
        setCouponError(result.message);
        
        // Shake animation for error
        const couponInput = document.querySelector('.coupon-form .form-input');
        if (couponInput) {
          couponInput.style.transition = 'all 0.1s ease';
          couponInput.style.borderColor = '#dc3545';
          
          let position = 1;
          const shake = setInterval(() => {
            couponInput.style.transform = position ? 'translateX(2px)' : 'translateX(-2px)';
            position = !position;
          }, 50);
          
          setTimeout(() => {
            clearInterval(shake);
            couponInput.style.transform = '';
            
            setTimeout(() => {
              couponInput.style.borderColor = '';
            }, 500);
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsCouponLoading(false);
    }
  };
  
  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponCode('');
  };
  
  // Progress animation for order processing
  const createProgressAnimation = () => {
    const container = document.querySelector('.checkout-container');
    if (!container) return;
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'order-progress-bar';
    progressBar.innerHTML = `
      <div class="progress-inner"></div>
    `;
    
    container.appendChild(progressBar);
    
    // Start animation
    setTimeout(() => {
      const inner = progressBar.querySelector('.progress-inner');
      if (inner) inner.style.width = '100%';
    }, 50);
    
    // Remove after completion
    setTimeout(() => {
      progressBar.style.opacity = '0';
      setTimeout(() => progressBar.remove(), 500);
    }, 2500);
  };
  
  // Success animation
  const createSuccessAnimation = () => {
    const container = document.querySelector('.checkout-container');
    if (!container) return;
    
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.className = 'order-success-overlay';
    
    // Add animated check mark
    overlay.innerHTML = `
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
      <div class="success-message">Order Confirmed!</div>
    `;
    
    container.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 100);
    
    // Animate out before redirect
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 1800);
  };
  
  // Play celebratory sound (silent by default, uncomment to enable)
  const playCelebrativeSound = () => {
    // Uncomment below for audio feedback
    // const audio = new Audio('success-sound-url.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(e => console.log('Audio play prevented by browser policy'));
  };
  
  // Enhanced confetti effect for successful order
  const triggerConfettiEffect = () => {
    const colors = ['#c59b6d', '#d4af7a', '#e1d9d2', '#f1ece5', '#ffffff', '#28a745', '#ffc107'];
    const confettiCount = 250;
    const container = document.querySelector('.checkout-container');
    
    if (!container) return;
    
    // Create confetti container for better performance
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    container.appendChild(confettiContainer);
    
    // Generate different types of confetti
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      
      // Randomize confetti type (circle, square, or star)
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        confetti.className = 'confetti confetti-circle';
      } else if (type === 1) {
        confetti.className = 'confetti';
      } else {
        confetti.className = 'confetti confetti-star';
        confetti.innerHTML = '★';
      }
      
      // Random styling
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 5 + 3 + 'px';
      confetti.style.opacity = Math.random() + 0.5;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Animation duration and delay
      confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      
      confettiContainer.appendChild(confetti);
    }
    
    // Clean up confetti after animation
    setTimeout(() => {
      confettiContainer.style.transition = 'opacity 1s ease';
      confettiContainer.style.opacity = '0';
      setTimeout(() => {
        confettiContainer.remove();
      }, 1000);
    }, 5000);
  };
  
  // Place order function with coupon support - FIXED undefined couponId issue
  const handlePlaceOrder = async () => {
    // Reset any previous error
    setPhoneError('');
    
    // Validate phone number
    if (!contactInfo.phone || !validatePhoneNumber(contactInfo.phone)) {
      setPhoneError('Please add a valid phone number to continue with checkout.');
      
      // Scroll to phone input field
      const phoneInput = document.querySelector('input[name="phone"]');
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInput.focus();
      }
      return; // Stop the checkout process
    }
    
    // Make sure to update phone number in database before proceeding
    // This ensures the phone is saved even if the order process fails
    if (currentUser?.uid && contactInfo.phone) {
      await updateUserPhoneInDatabase(contactInfo.phone);
    }
    
    // Create a local copy of the order summary data to avoid conflicts with DOM element variables
    const orderSummary = {
      subtotal: summary.subtotal,
      discount: summary.discount,
      shipping: summary.shipping,
      gst: summary.gst,
      total: summary.total
    };
    
    // Store the original button width and text for consistency
    const button = document.querySelector('.place-order-btn');
    if (button) {
      // Ensure consistent width during state changes
      const buttonWidth = button.offsetWidth;
      button.style.width = `${buttonWidth}px`;
    }
    
    // Add a ripple effect to the button first
    if (button) {
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${button.clientWidth / 2 - radius}px`;
      ripple.style.top = `${button.clientHeight / 2 - radius}px`;
      
      button.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    }
    
    // Set loading state with progress animation
    setOrderButtonState({
      isLoading: true,
      isSuccess: false,
      text: 'Processing...',
      icon: 'fas fa-spinner fa-spin'
    });
    
    // Create a progress indication
    createProgressAnimation();
    
    try {
      console.log("Starting order placement");
      
      // Verify user is logged in
      if (!currentUser || !currentUser.uid) {
        throw new Error("User not logged in. Please log in to place an order.");
      }
      
      // 1. Sanitize the shipping address to avoid null/undefined values
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId) || {};
      const sanitizedAddress = {
        id: selectedAddress.id || '',
        type: selectedAddress.type || '',
        address: selectedAddress.address || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        pincode: selectedAddress.pincode || '',
        phone: selectedAddress.phone || contactInfo.phone || '',
        name: contactInfo.fullName || currentUser?.displayName || 'Customer',
      };
      
      // 2. Sanitize items to ensure they have valid properties
      const sanitizedItems = cartItems.map(item => ({
        productId: item.id || '',  // THIS IS CRITICAL - admin expects productId, not id
        id: item.id || '',         // Keep this for backward compatibility
        name: item.name || 'Product',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        size: item.size || '',
        color: item.color || '',
        image: item.image || ''
      }));
      
      // Generate order number with prefix OD and 10 random digits
      const orderNumber = 'OD' + Math.floor(1000000000 + Math.random() * 9000000000);
      
      // 3. Create a complete order object with all required fields
      const orderData = {
        orderNumber: orderNumber,
        items: sanitizedItems,
        shippingAddress: sanitizedAddress,
        paymentMethod: 'codPayment', // Always use COD
        subtotal: Number(orderSummary.subtotal) || 0,
        discount: Number(orderSummary.discount) || 0,
        shipping: Number(orderSummary.shipping) || 0,
        gst: Number(orderSummary.gst) || 0,
        total: Number(orderSummary.total) || 0,
        status: 'Processing',
        userId: currentUser.uid,  // CRITICAL - this field is how orders are linked to users
        email: contactInfo.email || currentUser.email || '',
        phone: contactInfo.phone || '',
        orderNotes: contactInfo.orderNotes || '',
        paymentStatus: 'Pending', // Always pending for COD
        createdAt: serverTimestamp(),  // CRITICAL - this is used for ordering in the admin panel
        updatedAt: serverTimestamp()
      };
      
      // Add coupon information if a coupon was applied
      // FIX: Only add coupon fields when both isCouponApplied and appliedCoupon.id exist
      if (isCouponApplied && appliedCoupon && appliedCoupon.code) {
        orderData.couponCode = appliedCoupon.code;
        // Only add couponId if it's not null/undefined
        if (appliedCoupon.id) {
          orderData.couponId = appliedCoupon.id;
        }
        orderData.couponDiscount = appliedCoupon.discount || 0;
      }
      
      console.log("Saving order with data:", JSON.stringify(orderData));
      
      // 4. Add the complete order to Firestore in a single operation
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log("Order created with ID:", docRef.id);
      
      // 5. Create a notification in adminNotifications collection
      // This is expected by the admin dashboard
      try {
        await addDoc(collection(db, 'adminNotifications'), {
          type: 'order',
          title: 'New Order Received',
          message: `Order #${orderData.orderNumber} for ₹${orderData.total} from ${sanitizedAddress.name}`,
          orderId: docRef.id,
          read: false,
          resolved: false,
          createdAt: serverTimestamp()
        });
        console.log("Admin notification created");
      } catch (notifError) {
        console.error("Error creating admin notification:", notifError);
        // Continue with order process even if notification fails
      }
      
      // 6. Store for confirmation page - include everything needed in order confirmation
      const orderForStorage = {
        ...orderData,
        id: docRef.id,
        date: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      
      localStorage.setItem('recentOrder', JSON.stringify(orderForStorage));
      
      // 7. Clear cart
      clearCart();
      
      // Flash summary section
      const summaryElement = document.querySelector('.checkout-summary .checkout-section');
      if (summaryElement) {
        summaryElement.style.transition = 'all 0.5s ease';
        summaryElement.style.boxShadow = '0 0 30px rgba(197, 155, 109, 0.5)';
        
        setTimeout(() => {
          summaryElement.style.boxShadow = '';
        }, 800);
      }
      
      // Set success state
      setOrderButtonState({
        isLoading: false,
        isSuccess: true,
        text: 'Order Placed Successfully!',
        icon: 'fas fa-check'
      });
      
      // Celebration effects
      triggerConfettiEffect();
      createSuccessAnimation();
      playCelebrativeSound();
      
      // Navigate to confirmation page after a delay
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2200);
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Error details:", error.code, error.message);
      
      // Show error state
      setOrderButtonState({
        isLoading: false,
        isSuccess: false,
        text: 'Error! Try Again',
        icon: 'fas fa-exclamation-circle'
      });
      
      // Show an error message to the user
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.textContent = `There was an error processing your order: ${error.message || 'Please try again'}`;
      errorMessage.style.color = '#dc3545';
      errorMessage.style.padding = '10px';
      errorMessage.style.marginTop = '10px';
      errorMessage.style.textAlign = 'center';
      
      const orderButton = document.querySelector('.place-order-btn');
      if (orderButton && orderButton.parentNode) {
        orderButton.parentNode.insertBefore(errorMessage, orderButton.nextSibling);
        
        // Remove error message after a few seconds
        setTimeout(() => {
          errorMessage.remove();
          setOrderButtonState({
            isLoading: false,
            isSuccess: false,
            text: 'Place Order',
            icon: 'fas fa-lock'
          });
        }, 5000);
      }
    }
  };
  
  // Show add address form
  const showAddAddressForm = () => {
    navigate('/account');
  };

  return (
    <div className="checkout-container">
      {/* Checkout Header */}
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Please fill in your details below to complete your purchase</p>
      </div>
      
      {/* Checkout Progress */}
      <div className="checkout-progress">
        <div className="progress-line">
          <div className="progress-line-fill" style={{ width: '50%' }}></div>
        </div>
        <div className="progress-step">
          <div className="step-number active">1</div>
          <div className="step-name active">Shopping Cart</div>
        </div>
        <div className="progress-step">
          <div className="step-number active">2</div>
          <div className="step-name active">Checkout</div>
        </div>
        <div className="progress-step">
          <div className="step-number">3</div>
          <div className="step-name">Confirmation</div>
        </div>
      </div>
      
      {/* Checkout Content */}
      <div className="checkout-content">
        {/* Checkout Details */}
        <div className="checkout-details">
          {/* Order Items */}
          <div className="checkout-section">
            <h2 className="section-title">Your Order</h2>
            <div className="cart-items">
              {cartItems.length > 0 ? (
                cartItems.map(item => (
                  <div className="cart-item" key={item.id} data-id={item.id}>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-info">
                        <span>Size: {item.size}</span>
                        <span>Color: {item.color}</span>
                      </div>
                      <div className="item-price">₹{item.price}</div>
                    </div>
                    <div className="item-quantity">
                      <div className="quantity-control">
                        <button 
                          className="quantity-btn" 
                          onClick={() => decreaseQuantity(item.id)}
                          title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                        >
                          {item.quantity === 1 ? <i className="fas fa-trash-alt"></i> : "-"}
                        </button>
                        <input 
                          type="number" 
                          className="quantity-input" 
                          value={item.quantity} 
                          min="1" 
                          max="10" 
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                        />
                        <button 
                          className="quantity-btn" 
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-total">₹{item.price * item.quantity}</div>
                    <div 
                      className="item-remove" 
                      onClick={() => removeItem(item.id)}
                    >
                      <i className="fas fa-times"></i>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '15px' }}></i>
                  <p style={{ color: '#888' }}>Your cart is empty</p>
                  <Link to="/shop" style={{ display: 'inline-block', marginTop: '15px', color: '#c59b6d', textDecoration: 'underline' }}>
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="checkout-section">
            <h2 className="section-title">Shipping Address</h2>
            
            <div className="address-cards">
              {addresses.length > 0 ? (
                addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                    onClick={() => selectAddress(address.id)}
                  >
                    <div className="address-type">
                      <i className={`${address.type === 'Home' ? 'fas fa-home' : 'fas fa-briefcase'} address-icon`}></i> 
                      {address.type}
                    </div>
                    <div className="address-details">
                      {userProfile?.displayName || currentUser?.displayName || 'User'}<br />
                      {address.address}<br />
                      {address.city}, {address.state} - {address.pincode}<br />
                      {userProfile?.phone && `Phone: ${userProfile.phone}`}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{padding: '20px', textAlign: 'center'}}>
                  <p>No saved addresses found. Please add an address to continue.</p>
                  <Link to="/account" className="add-address-btn" style={{marginTop: '15px', display: 'inline-block'}}>
                    Add New Address
                  </Link>
                </div>
              )}
            </div>
            
            <div className="add-address-btn" onClick={showAddAddressForm}>
              <i className="fas fa-plus"></i> Add New Address
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="checkout-section">
            <h2 className="section-title">Contact Information</h2>
            
            <div className="form-group">
              <label className="form-label">Full Name*</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Your full name" 
                name="fullName"
                value={contactInfo.fullName} 
                onChange={handleContactInfoChange}
                required 
              />
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Email Address*</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="Your email address" 
                    name="email"
                    value={contactInfo.email} 
                    onChange={handleContactInfoChange}
                    required 
                  />
                  {currentUser?.email && contactInfo.email !== currentUser.email && (
                    <div className="field-note">
                      <i className="fas fa-info-circle"></i> This email is different from your account email.
                    </div>
                  )}
                </div>
              </div>
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Phone Number* <span className="required-field">Required</span></label>
                  <input 
                    type="tel" 
                    className={`form-input ${phoneError ? 'input-error' : ''}`}
                    placeholder="Your phone number" 
                    name="phone"
                    value={contactInfo.phone} 
                    onChange={(e) => {
                      handleContactInfoChange(e);
                      if (phoneError) setPhoneError(''); // Clear error on change
                    }}
                    required 
                  />
                  {phoneError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i> {phoneError}
                    </div>
                  )}
                  <div className="field-note">
                    <i className="fas fa-info-circle"></i> Your phone number will be used for delivery updates
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-note">
              <div className="note-heading">Order Notes (Optional)</div>
              <textarea 
                className="note-textarea" 
                placeholder="Special notes about your order, e.g. special instructions for delivery"
                name="orderNotes"
                value={contactInfo.orderNotes}
                onChange={handleContactInfoChange}
              ></textarea>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="checkout-section">
            <h2 className="section-title">Payment Method</h2>
            
            <div className="payment-methods">
              <div className="payment-method">
                <input 
                  type="radio" 
                  id="codPayment" 
                  name="paymentMethod" 
                  className="payment-radio" 
                  checked={true} // Always checked
                  readOnly // Cannot be changed
                />
                <label htmlFor="codPayment" className="payment-label active-payment">
                  <i className="fas fa-money-bill-wave payment-icon"></i>
                  <span className="payment-name">Cash on Delivery</span>
                </label>
              </div>
              
              <div className="payment-method coming-soon">
                <div className="coming-soon-badge">Coming Soon</div>
                <div className="payment-label disabled-payment">
                  <i className="fas fa-credit-card payment-icon"></i>
                  <span className="payment-name">Credit/Debit Card</span>
                </div>
              </div>
              
              <div className="payment-method coming-soon">
                <div className="coming-soon-badge">Coming Soon</div>
                <div className="payment-label disabled-payment">
                  <i className="fas fa-mobile-alt payment-icon"></i>
                  <span className="payment-name">UPI</span>
                </div>
              </div>
            </div>
            
            {/* COD Payment Details */}
            <div className="payment-details active" id="codDetails">
              <p>Pay with cash upon delivery. Please keep exact change handy to help our delivery associates.</p>
              <div className="cod-info">
                <div className="info-item">
                  <i className="fas fa-check-circle"></i>
                  <span>No advance payment required</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Cash, UPI & card payments accepted at delivery</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Verify your product before payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-section">
            <h2 className="section-title">Order Summary</h2>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-shopping-cart" style={{ color: '#c59b6d' }}></i> Subtotal</div>
              <div className="summary-value" id="summary-subtotal" ref={subtotalRef}>₹{summary.subtotal}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-tag" style={{ color: '#c59b6d' }}></i> Discount</div>
              <div className="summary-value" id="summary-discount" ref={discountRef}>-₹{summary.discount}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-percent" style={{ color: '#c59b6d' }}></i> GST (18%)</div>
              <div className="summary-value" id="summary-gst" ref={gstRef}>₹{summary.gst}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-truck" style={{ color: '#c59b6d' }}></i> Delivery Charges</div>
              <div className="summary-value" id="summary-delivery" ref={shippingRef}>
                {summary.shipping === 0 ? 'Free' : `₹${summary.shipping}`}
              </div>
            </div>
            
            <div className="summary-row summary-total">
              <div className="summary-label"><i className="fas fa-rupee-sign" style={{ marginRight: '5px' }}></i> Total Amount</div>
              <div className="summary-value" id="summary-total" ref={totalRef}>₹{summary.total}</div>
            </div>
            
            <button 
              className={`place-order-btn ${orderButtonState.isSuccess ? 'success' : ''} ${orderButtonState.isLoading ? 'loading' : ''}`} 
              onClick={handlePlaceOrder}
              disabled={orderButtonState.isLoading || orderButtonState.isSuccess || addresses.length === 0}
            >
              <span className="btn-content">
                <i className={orderButtonState.icon}></i> 
                <span>{orderButtonState.text}</span>
              </span>
            </button>
            
            <div className="secure-info">
              <i className="fas fa-shield-alt secure-icon"></i>
              <span>Transactions are 100% secure and encrypted</span>
            </div>
            
            <div className="payment-icons">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-amex"></i>
              <i className="fab fa-cc-paypal"></i>
              <i className="fab fa-google-pay"></i>
            </div>
          </div>
          
          <div className="checkout-section">
            <div className="coupon-form">
              <div className="form-group">
                <label className="form-label">Apply Coupon</label>
                {!isCouponApplied ? (
                  <>
                    <div style={{ display: 'flex' }} className="coupon-form">
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Enter coupon code" 
                        style={{ borderRadius: '12px 0 0 12px', borderRight: 'none' }}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={isCouponLoading}
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        style={{ 
                          padding: '0 20px', 
                          background: 'linear-gradient(135deg, #d4af7a, #c59b6d)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '0 12px 12px 0', 
                          cursor: isCouponLoading ? 'wait' : 'pointer', 
                          fontWeight: '600', 
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        disabled={isCouponLoading}
                        type="button"
                      >
                        <span style={{ position: 'relative', zIndex: 2 }}>
                          {isCouponLoading ? 'Validating...' : 'Apply'}
                        </span>
                        <span 
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: '-100%', 
                            width: '100%', 
                            height: '100%', 
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)', 
                            transition: 'all 0.6s ease',
                            zIndex: 1
                          }}
                          className="btn-shine"
                          onMouseEnter={(e) => { e.currentTarget.style.left = '100%' }}
                        ></span>
                      </button>
                    </div>
                    {couponError && (
                      <div 
                        style={{ 
                          marginTop: '8px', 
                          fontSize: '0.9rem', 
                          color: '#dc3545',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <i className="fas fa-exclamation-circle"></i>
                        {couponError}
                      </div>
                    )}
                  </>
                ) : (
                  <div 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      padding: '15px',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#4caf50' }}>
                        <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i>
                        {appliedCoupon ? appliedCoupon.code : 'Coupon applied'}
                      </div>
                      <div style={{ fontSize: '0.9rem', marginTop: '3px' }}>
                        {couponSuccess || `Discount: ₹${summary.discount}`}
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'none',
                        border: '1px solid #dc3545',
                        color: '#dc3545',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <i className="fas fa-times"></i>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;