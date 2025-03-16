import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const { addToCart } = useCart();

  // Sample product data for fallback
  const sampleProductData = {
    id: id || '1',
    name: "Premium Cotton Formal Shirt",
    price: 1299,
    originalPrice: 1699,
    discount: "24%",
    rating: 4.5,
    reviewCount: 128,
    category: "shirts",
    images: [
      "/api/placeholder/600/700",
      "/api/placeholder/600/700",
      "/api/placeholder/600/700",
      "/api/placeholder/600/700"
    ],
    image: "/api/placeholder/600/700", // For compatibility with both data models
    description: "Elevate your formal attire with our Premium Cotton Formal Shirt. Crafted from high-quality Egyptian cotton, this shirt offers exceptional comfort and a sophisticated appearance. The tailored fit accentuates your silhouette while allowing ease of movement throughout the day. Perfect for office wear, formal events, or pair with jeans for a smart-casual look.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Blue", "Black", "Beige"],
    stock: 12,
    isNew: true,
    features: [
      {
        title: "Premium Fabric",
        description: "Made from 100% Egyptian cotton with a thread count of 120, ensuring softness and durability.",
        icon: "tshirt"
      },
      {
        title: "Tailored Fit",
        description: "Designed with a contemporary tailored fit that provides comfort while maintaining a sleek appearance.",
        icon: "ruler"
      },
      {
        title: "Superior Finishing",
        description: "Single-needle stitching with 18 stitches per inch for a refined finish and enhanced durability.",
        icon: "palette"
      },
      {
        title: "Detail-Oriented Design",
        description: "Features mother-of-pearl buttons, reinforced collar and cuffs, and a classic pointed collar style.",
        icon: "th"
      }
    ],
    specifications: [
      { label: "Material", value: "100% Egyptian Cotton" },
      { label: "Pattern", value: "Solid" },
      { label: "Sleeve", value: "Full Sleeve" },
      { label: "Collar", value: "Classic Pointed Collar" },
      { label: "Cuff", value: "Single Button" },
      { label: "Fit", value: "Tailored Fit" },
      { label: "Occasion", value: "Formal, Office, Business Casual" },
      { label: "Package Contents", value: "1 Shirt" }
    ],
    careInstructions: [
      { text: "Machine wash cold with similar colors", icon: "tint" },
      { text: "Do not use bleach", icon: "ban" },
      { text: "Tumble dry on low heat", icon: "temperature-low" },
      { text: "Iron on medium heat", icon: "iron" },
      { text: "Do not dry clean", icon: "minus-circle" }
    ],
    careTips: [
      "Turn the shirt inside out before washing to protect the buttons and surface of the fabric",
      "Always unbutton the shirt completely before washing",
      "Remove collar stays before washing",
      "For best results, iron while slightly damp",
      "Hang on a quality hanger when not in use to maintain the shape"
    ],
    reviews: [
      {
        name: "Rajesh Kumar",
        date: "15 Feb, 2025",
        rating: 5,
        text: "The quality of this shirt is exceptional! The fabric feels premium and comfortable, even after a full day at the office. The fit is perfect for my body type, not too tight or loose. Definitely worth the price and I'll be ordering more colors soon.",
        photos: []
      },
      {
        name: "Aman Singh",
        date: "3 Feb, 2025",
        rating: 4,
        text: "Great formal shirt that looks very professional. The Egyptian cotton makes a noticeable difference compared to regular cotton shirts. The only minor issue is that the sleeves are slightly longer than expected, but otherwise perfect.",
        photos: ["/api/placeholder/80/80", "/api/placeholder/80/80"]
      },
      {
        name: "Vikram Patel",
        date: "27 Jan, 2025",
        rating: 4.5,
        text: "I've been searching for quality formal shirts for a while, and Apna Collection has nailed it with this premium cotton shirt. The material is breathable and doesn't wrinkle easily, which is perfect for long workdays. The stitching and buttons are top-notch too. Highly recommend!",
        photos: []
      }
    ],
    ratingDistribution: [
      { rating: 5, count: 96, percentage: 75 },
      { rating: 4, count: 19, percentage: 15 },
      { rating: 3, count: 6, percentage: 5 },
      { rating: 2, count: 4, percentage: 3 },
      { rating: 1, count: 3, percentage: 2 }
    ]
  };
  
  // Sample related products for fallback
  const sampleRelatedProducts = [
    { 
      id: 'related1', 
      name: "Classic White Shirt", 
      price: 1199, 
      image: "/api/placeholder/400/500", 
      colors: ["White", "Blue", "Black"] 
    },
    { 
      id: 'related2', 
      name: "Slim Fit Trousers", 
      price: 1599, 
      image: "/api/placeholder/400/500", 
      colors: ["Black", "Beige"] 
    },
    { 
      id: 'related3', 
      name: "Designer Blazer", 
      price: 3499, 
      image: "/api/placeholder/400/500", 
      colors: ["Black", "Blue"] 
    },
    { 
      id: 'related4', 
      name: "Formal Shoes", 
      price: 2199, 
      image: "/api/placeholder/400/500", 
      colors: ["Black", "Beige"] 
    }
  ];

  // Fetch product and related products from Firestore
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch the product document
        const productDoc = await getDoc(doc(db, 'products', id));
        
        if (!productDoc.exists()) {
          console.log('Product not found in Firebase, using sample data');
          setUseFallbackData(true);
          setProduct(sampleProductData);
          setRelatedProducts(sampleRelatedProducts);
          
          // Set default selected size and color from sample data
          if (sampleProductData.sizes && sampleProductData.sizes.length > 0) {
            setSelectedSize(sampleProductData.sizes[0]);
          }
          
          if (sampleProductData.colors && sampleProductData.colors.length > 0) {
            setSelectedColor(sampleProductData.colors[0]);
          }
          
          setLoading(false);
          return;
        }
        
        const productData = {
          id: productDoc.id,
          ...productDoc.data()
        };
        
        // Set default selected size and color from available options
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        setProduct(productData);
        
        // Fetch related products in the same category
        if (productData.category) {
          try {
            const relatedQuery = query(
              collection(db, 'products'),
              where('category', '==', productData.category),
              where('id', '!=', productData.id),
              limit(4)
            );
            
            const relatedSnapshot = await getDocs(relatedQuery);
            const relatedItems = relatedSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            if (relatedItems.length > 0) {
              setRelatedProducts(relatedItems);
            } else {
              // If no related products found, use sample related products
              setRelatedProducts(sampleRelatedProducts);
            }
          } catch (error) {
            console.error('Error fetching related products:', error);
            setRelatedProducts(sampleRelatedProducts);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
        // On error, use sample data
        setUseFallbackData(true);
        setProduct(sampleProductData);
        setRelatedProducts(sampleRelatedProducts);
        
        // Set default selected size and color from sample data
        if (sampleProductData.sizes && sampleProductData.sizes.length > 0) {
          setSelectedSize(sampleProductData.sizes[0]);
        }
        
        if (sampleProductData.colors && sampleProductData.colors.length > 0) {
          setSelectedColor(sampleProductData.colors[0]);
        }
        
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  // Add to cart function
  const handleAddToCart = () => {
    if (!product) return;
    
    // Get the product image (either from selected image index or default image)
    const productImage = product.images && product.images.length > 0 
      ? product.images[selectedImage] 
      : product.image;
    
    // Create a properly formatted product object with selected options
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor
    };
    
    // Add to cart using context
    addToCart(productToAdd);
    
    // Show feedback to user
    alert(`Added to cart: ${product.name}\nSize: ${selectedSize}\nColor: ${selectedColor}\nQuantity: ${quantity}`);
  };

  // Handle buy now
  const handleBuyNow = () => {
    // Add to cart first, then redirect to checkout
    handleAddToCart();
    navigate('/checkout');
  };

  // Helper function to ensure array exists
  const ensureArray = (arr, defaultValue = []) => {
    return Array.isArray(arr) ? arr : defaultValue;
  };

  // Render loading state
  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  // Render 404 if product not found
  if (!product) {
    return <div className="not-found">Product not found</div>;
  }

  // Calculate original price if not provided
  const originalPrice = product.originalPrice || Math.round(product.price * 1.2);
  const discount = product.discount || Math.round(((originalPrice - product.price) / originalPrice) * 100) + '%';

  // Ensure images array exists
  const productImages = product.images || [product.image];

  return (
    <div className="product-page">
      {/* Display notice for sample data */}
      {useFallbackData && (
        <div className="data-notice">
          <p>Currently displaying sample product data. Connect to Firebase for live data.</p>
        </div>
      )}
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-links">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-separator">›</span>
          <span>{product.name}</span>
        </div>
      </div>

      <div className="product-container">
        {/* Product Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={productImages[selectedImage] || product.image} alt={product.name} />
          </div>
          <div className="image-thumbnails">
            {productImages.map((image, index) => (
              <div 
                key={index} 
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`} 
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt={`${product.name} - View ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            {product.isNew && <span className="product-tag">New Arrival</span>}
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price">
              ₹{product.price.toLocaleString()} 
              <span className="price-original">₹{originalPrice.toLocaleString()}</span> 
              <span className="price-discount">{discount} OFF</span>
            </div>
            <div className="product-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star} 
                    className={
                      star <= Math.floor(product.rating || 4.5) 
                        ? "fas fa-star" 
                        : star <= (product.rating || 4.5)
                          ? "fas fa-star-half-alt" 
                          : "far fa-star"
                    }
                  ></i>
                ))}
              </div>
              <span className="rating-count">{product.rating || 4.5}/5 ({product.reviewCount || 10} reviews)</span>
            </div>
            <p className="product-description">{product.description}</p>
          </div>

          <div className="product-options">
            {product.sizes && product.sizes.length > 0 && (
              <div className="option-group">
                <div className="option-label">Size</div>
                <div className="size-options">
                  {product.sizes.map((size) => (
                    <div 
                      key={size} 
                      className={`size-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </div>
                  ))}
                </div>
                <a href="#" className="size-guide">Size Guide</a>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="option-group">
                <div className="option-label">Color</div>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <div 
                      key={color} 
                      className={`color-option color-${color.toLowerCase()} ${selectedColor === color ? 'active' : ''}`}
                      data-color={color}
                      onClick={() => setSelectedColor(color)}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <div className="option-group">
              <div className="option-label">Quantity</div>
              <div className="quantity-selector">
                <div className="quantity-control">
                  <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    min="1" 
                    max="10" 
                    className="quantity-input"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 10) {
                        setQuantity(value);
                      }
                    }}
                  />
                  <button className="quantity-btn" onClick={increaseQuantity}>+</button>
                </div>
                <span className="stock-status">In Stock ({product.stock || 10} items)</span>
              </div>
            </div>

            <div className="product-buttons">
              <button className="btn-primary" onClick={handleAddToCart}>
                <i className="fas fa-shopping-bag"></i> Add to Cart
              </button>
              <button className="btn-secondary" onClick={handleBuyNow}>
                <i className="fas fa-bolt"></i> Buy Now
              </button>
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-item">
              <i className="fas fa-truck delivery-icon"></i>
              <div>Free delivery on orders above ₹999</div>
            </div>
            <div className="delivery-item">
              <i className="fas fa-exchange-alt delivery-icon"></i>
              <div>Easy 30-day returns & exchanges</div>
            </div>
            <div className="delivery-item">
              <i className="fas fa-shield-alt delivery-icon"></i>
              <div>100% authentic products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="additional-info">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`} 
            onClick={() => setActiveTab('details')}
          >
            Product Details
          </div>
          <div 
            className={`tab ${activeTab === 'care' ? 'active' : ''}`} 
            onClick={() => setActiveTab('care')}
          >
            Care Instructions
          </div>
          <div 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reviews')}
          >
            Customer Reviews
          </div>
        </div>

        {/* Product Details Tab */}
        <div className={`tab-content ${activeTab === 'details' ? 'active' : ''}`} id="tab-details">
          <div className="product-features">
            {ensureArray(product.features, [
              {
                title: "Premium Quality",
                description: "Made with high-quality materials for durability and comfort.",
                icon: "star"
              }
            ]).map((feature, index) => (
              <div className="feature-item" key={index}>
                <div className="feature-icon">
                  <i className={`fas fa-${feature.icon || 'check'}`}></i>
                </div>
                <div className="feature-text">
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-desc">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>

          <table className="product-spec-table">
            <tbody>
              {ensureArray(product.specifications, [
                { label: "Material", value: "Premium Materials" },
                { label: "Pattern", value: "Solid" },
                { label: "Occasion", value: "Casual, Formal" }
              ]).map((spec, index) => (
                <tr key={index}>
                  <td><strong>{spec.label}:</strong></td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Care Instructions Tab */}
        <div className={`tab-content ${activeTab === 'care' ? 'active' : ''}`} id="tab-care">
          <h3>Washing & Care Instructions</h3>
          <p>To maintain the premium quality and appearance of your item, please follow these care instructions:</p>
          
          <div className="care-instructions">
            {ensureArray(product.careInstructions, [
              { text: "Machine wash cold with similar colors", icon: "tint" },
              { text: "Do not use bleach", icon: "ban" },
              { text: "Tumble dry on low heat", icon: "temperature-low" },
              { text: "Iron on medium heat", icon: "iron" },
              { text: "Do not dry clean", icon: "minus-circle" }
            ]).map((instruction, index) => (
              <div className="care-item" key={index}>
                <div className="care-icon">
                  <i className={`fas fa-${instruction.icon}`}></i>
                </div>
                <div>{instruction.text}</div>
              </div>
            ))}
          </div>
          
          <div className="care-tips">
            <h4>Additional Care Tips:</h4>
            <ul>
              {ensureArray(product.careTips, [
                "Turn the garment inside out before washing to protect the surface of the fabric",
                "Always unbutton completely before washing",
                "For best results, iron while slightly damp",
                "Hang on a quality hanger when not in use to maintain the shape"
              ]).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Customer Reviews Tab */}
        <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`} id="tab-reviews">
          <div className="review-header">
            <div className="review-total">
              <div className="review-average">{product.rating || 4.5}</div>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star} 
                    className={
                      star <= Math.floor(product.rating || 4.5) 
                        ? "fas fa-star" 
                        : star <= (product.rating || 4.5)
                          ? "fas fa-star-half-alt" 
                          : "far fa-star"
                    }
                  ></i>
                ))}
              </div>
              <div>Based on {product.reviewCount || 10} reviews</div>
            </div>
            
            <div className="review-distribution">
              {ensureArray(product.ratingDistribution, [
                { rating: 5, count: 7, percentage: 70 },
                { rating: 4, count: 2, percentage: 20 },
                { rating: 3, count: 1, percentage: 10 },
                { rating: 2, count: 0, percentage: 0 },
                { rating: 1, count: 0, percentage: 0 }
              ]).map((dist) => (
                <div className="review-bar" key={dist.rating}>
                  <div className="review-stars">{dist.rating} <i className="fas fa-star"></i></div>
                  <div className="review-progress">
                    <div 
                      className="review-progress-fill" 
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                  <div className="review-count">{dist.count}</div>
                </div>
              ))}
            </div>
            
            <button className="write-review-btn">Write a Review</button>
          </div>
          
          <div className="review-list">
            {ensureArray(product.reviews, [
              {
                name: "Customer Review",
                date: new Date().toLocaleDateString(),
                rating: 5,
                text: "Great product quality and fit. Very happy with my purchase!",
                photos: []
              }
            ]).map((review, index) => (
              <div className="review-item" key={index}>
                <div className="review-user">
                  <div className="review-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="review-user-info">
                    <div className="review-user-name">{review.name}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                      key={star} 
                      className={
                        star <= Math.floor(review.rating) 
                          ? "fas fa-star" 
                          : star <= review.rating 
                            ? "fas fa-star-half-alt" 
                            : "far fa-star"
                      }
                    ></i>
                  ))}
                </div>
                <div className="review-text">{review.text}</div>
                {review.photos && review.photos.length > 0 && (
                  <div className="review-photos">
                    {review.photos.map((photo, photoIndex) => (
                      <div className="review-photo" key={photoIndex}>
                        <img src={photo} alt="Customer Photo" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2 className="related-title">You May Also Like</h2>
          <div className="related-grid">
            {relatedProducts.map((relatedProduct) => (
              <div className="related-item" key={relatedProduct.id}>
                <Link to={`/product/${relatedProduct.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="related-img">
                    <img src={relatedProduct.image} alt={relatedProduct.name} />
                  </div>
                  <div className="related-info">
                    <h3 className="related-name">{relatedProduct.name}</h3>
                    <div className="related-price">₹{relatedProduct.price.toLocaleString()}</div>
                    <div className="related-colors">
                      {ensureArray(relatedProduct.colors, ['Default']).map((color, colorIndex) => (
                        <div 
                          key={colorIndex} 
                          className={`related-color color-${color.toLowerCase()}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;