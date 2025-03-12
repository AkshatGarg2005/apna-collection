import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Import FontAwesome directly in your component if needed
import 'font-awesome/css/font-awesome.min.css';

// Inline styles object
const styles = {
  page: {
    fontFamily: "'Poppins', sans-serif",
  },
  offersSection: {
    padding: '50px',
    backgroundColor: '#E1D9D2',
  },
  offersTitle: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '1rem',
    letterSpacing: '1px',
    fontWeight: 600,
  },
  offersSubtitle: {
    textAlign: 'center',
    color: '#555',
    marginBottom: '3rem',
    fontSize: '1.1rem',
  },
  offersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  offerImage: {
    height: '250px',
    overflow: 'hidden',
    position: 'relative',
  },
  offerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  discountBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#E1D9D2',
    color: '#333',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  limitedBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: '#333',
    color: '#FFFFFF',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '5px 10px',
    borderRadius: '4px',
  },
  offerContent: {
    padding: '20px',
  },
  offerName: {
    fontSize: '1.2rem',
    marginBottom: '10px',
    fontWeight: 600,
  },
  offerPrice: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: '#999',
    marginRight: '10px',
    fontSize: '0.95rem',
  },
  currentPrice: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#c59b6d',
  },
  offerDescription: {
    color: '#666',
    marginBottom: '20px',
    fontSize: '0.9rem',
  },
  shopNowBtn: {
    display: 'inline-block',
    padding: '10px 25px',
    fontSize: '0.95rem',
    fontWeight: 500,
    border: '1px solid #333',
    backgroundColor: 'transparent',
    color: '#333',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    textAlign: 'center',
  },
  seasonalBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    margin: '50px auto',
    display: 'flex',
    maxWidth: '1200px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    position: 'relative',
  },
  bannerContent: {
    padding: '50px',
    flex: 1,
    position: 'relative',
    zIndex: 2,
    background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.8) 100%)',
  },
  bannerTitle: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    fontWeight: 700,
    color: '#333',
    position: 'relative',
    display: 'inline-block',
  },
  bannerText: {
    color: '#555',
    marginBottom: '30px',
    fontSize: '1.1rem',
    maxWidth: '90%',
    lineHeight: 1.7,
  },
  bannerImage: {
    flex: 1.2,
    minHeight: '350px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  },
  bannerBadge: {
    position: 'absolute',
    top: '30px',
    right: '30px',
    backgroundColor: '#c59b6d',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 600,
    padding: '15px 20px',
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 1.2,
    transform: 'rotate(10deg)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    zIndex: 3,
  },
  bannerShopNowBtn: {
    display: 'inline-block',
    padding: '12px 30px',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#333',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  newsletterSection: {
    background: 'linear-gradient(135deg, #f8f4f1 0%, #FFFFFF 100%)',
    padding: '60px',
    textAlign: 'center',
    margin: '50px auto',
    maxWidth: '1200px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  newsletterTitle: {
    fontSize: '2.2rem',
    marginBottom: '20px',
    fontWeight: 600,
    color: '#333',
    position: 'relative',
    display: 'inline-block',
  },
  newsletterText: {
    color: '#555',
    marginBottom: '30px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: '1.05rem',
    lineHeight: 1.7,
  },
  subscriptionMessage: {
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    fontSize: '0.95rem',
  },
  subscriptionMessageSuccess: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderLeft: '4px solid #2e7d32',
  },
  subscriptionMessageError: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderLeft: '4px solid #c62828',
  },
  newsletterForm: {
    display: 'flex',
    maxWidth: '550px',
    margin: '0 auto',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    borderRadius: '50px',
    overflow: 'hidden',
  },
  newsletterInput: {
    flex: 1,
    padding: '16px 25px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    fontSize: '1rem',
    color: '#333',
  },
  newsletterButton: {
    padding: '16px 30px',
    backgroundColor: '#333',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
  },
  newsletterPerks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginTop: '40px',
  },
  newsletterPerk: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '160px',
  },
  perkIcon: {
    fontSize: '2rem',
    color: '#c59b6d',
    marginBottom: '15px',
  },
  perkText: {
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'center',
  },
};

// Responsive style adjustments can be handled with media queries in a separate CSS file
// or through conditional rendering based on window size

const Offers = ({ addToCart }) => {
  // Sample offer data
  const offerData = [
    {
      id: 101,
      title: "Premium Linen Shirts",
      description: "Breathable and stylish linen shirts perfect for summer outings.",
      originalPrice: 3999,
      currentPrice: 2799,
      discount: 30,
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
      limited: true
    },
    {
      id: 102,
      title: "Tailored Formal Suit",
      description: "Elegant suit set with premium fabric and perfect fitting.",
      originalPrice: 12999,
      currentPrice: 9999,
      discount: 25,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
      limited: false
    },
    {
      id: 103,
      title: "Designer Denim Collection",
      description: "Premium quality denim jeans with modern cuts and styles.",
      originalPrice: 2599,
      currentPrice: 1999,
      discount: 20,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
      limited: true
    },
    {
      id: 104,
      title: "Casual T-Shirt Bundle",
      description: "Set of 3 premium cotton t-shirts in essential colors.",
      originalPrice: 1499,
      currentPrice: 999,
      discount: 35,
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
      limited: false
    },
    {
      id: 105,
      title: "Leather Belt Collection",
      description: "Handcrafted genuine leather belts with elegant buckles.",
      originalPrice: 1999,
      currentPrice: 1599,
      discount: 15,
      image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      limited: false
    },
    {
      id: 106,
      title: "Seasonal Jackets",
      description: "Stylish and functional jackets perfect for transitional weather.",
      originalPrice: 4999,
      currentPrice: 3499,
      discount: 30,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80",
      limited: true
    }
  ];

  // State for newsletter subscription
  const [email, setEmail] = useState('');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // Handle newsletter form submission
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim() !== '') {
      setSubscriptionMessage('Thank you for subscribing to our newsletter!');
      setEmail('');
      setTimeout(() => setSubscriptionMessage(''), 3000);
    } else {
      setSubscriptionMessage('Please enter a valid email address.');
      setTimeout(() => setSubscriptionMessage(''), 3000);
    }
  };

  // Handle shop now button click
  const handleShopNow = (offer) => {
    // Add the first variant of the product to cart
    const product = {
      id: offer.id,
      name: offer.title,
      price: offer.currentPrice,
      image: offer.image,
      quantity: 1,
      size: 'M', // Default size
      color: 'Default' // Default color
    };
    
    addToCart(product);
  };

  // Helper function to determine screen size responsively
  const getResponsiveStyles = () => {
    if (window.innerWidth <= 768) {
      return {
        offersGrid: {
          ...styles.offersGrid,
          gridTemplateColumns: '1fr'
        }
      };
    } else if (window.innerWidth <= 1200) {
      return {
        offersGrid: {
          ...styles.offersGrid,
          gridTemplateColumns: 'repeat(2, 1fr)'
        }
      };
    }
    return {};
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <div style={styles.page}>
      {/* Offers Section */}
      <section style={styles.offersSection}>
        <h1 style={styles.offersTitle}>SPECIAL OFFERS</h1>
        <p style={styles.offersSubtitle}>Exclusive deals for the modern gentleman</p>
        
        <div style={{...styles.offersGrid, ...responsiveStyles.offersGrid}}>
          {offerData.map((offer) => (
            <div style={styles.offerCard} key={offer.id}>
              <div style={styles.offerImage}>
                <img src={offer.image} alt={offer.title} style={styles.offerImg} />
                <div style={styles.discountBadge}>{offer.discount}% OFF</div>
                {offer.limited && <div style={styles.limitedBadge}>LIMITED TIME</div>}
              </div>
              <div style={styles.offerContent}>
                <h3 style={styles.offerName}>{offer.title}</h3>
                <div style={styles.offerPrice}>
                  <span style={styles.originalPrice}>₹{offer.originalPrice}</span>
                  <span style={styles.currentPrice}>₹{offer.currentPrice}</span>
                </div>
                <p style={styles.offerDescription}>{offer.description}</p>
                <button 
                  style={styles.shopNowBtn}
                  onClick={() => handleShopNow(offer)}
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Improved Seasonal Banner */}
        <div style={styles.seasonalBanner}>
          <div style={styles.bannerContent}>
            <h2 style={styles.bannerTitle}>End of Season Sale</h2>
            <p style={styles.bannerText}>
              Upgrade your wardrobe with premium clothing at unbeatable prices. 
              Our collection features the finest materials and craftsmanship for the modern gentleman.
            </p>
            <Link to="/shop" style={styles.bannerShopNowBtn}>Explore Collection</Link>
          </div>
          <div 
            style={{
              ...styles.bannerImage,
              backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')`
            }}
          ></div>
          <div style={styles.bannerBadge}>Up to 50% Off</div>
        </div>

        {/* Improved Newsletter Section */}
        <div style={styles.newsletterSection}>
          <h2 style={styles.newsletterTitle}>Stay Updated</h2>
          <p style={styles.newsletterText}>
            Subscribe to receive notifications about new arrivals, exclusive offers,
            and seasonal collections. Be the first to know about our limited-time promotions.
          </p>
          
          {subscriptionMessage && (
            <div style={{
              ...styles.subscriptionMessage,
              ...(email ? styles.subscriptionMessageSuccess : styles.subscriptionMessageError)
            }}>
              {subscriptionMessage}
            </div>
          )}
          
          <form style={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Your email address" 
              style={styles.newsletterInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" style={styles.newsletterButton}>Subscribe</button>
          </form>
          
          <div style={styles.newsletterPerks}>
            <div style={styles.newsletterPerk}>
              <i className="fas fa-gift" style={styles.perkIcon}></i>
              <p style={styles.perkText}>Exclusive offers for subscribers</p>
            </div>
            <div style={styles.newsletterPerk}>
              <i className="fas fa-clock" style={styles.perkIcon}></i>
              <p style={styles.perkText}>Early access to sales</p>
            </div>
            <div style={styles.newsletterPerk}>
              <i className="fas fa-tag" style={styles.perkIcon}></i>
              <p style={styles.perkText}>Special birthday discount</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;