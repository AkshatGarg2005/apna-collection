// src/pages/FestiveProducts.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const FestiveProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Toggle festive status
  const toggleFestiveStatus = async (productId) => {
    try {
      const productToUpdate = products.find(product => product.id === productId);
      const isFestive = !productToUpdate.isFestive;
      
      // Update in Firestore
      await updateDoc(doc(db, 'products', productId), {
        isFestive: isFestive
      });
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, isFestive: isFestive } 
          : product
      ));
      
    } catch (error) {
      console.error('Error updating festive status:', error);
      alert('Failed to update festive status. Please try again.');
    }
  };

  // Handle edit product
  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };
  
  // Format price to Indian Rupee
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Get all unique categories
  const categories = [
    'all',
    'kurta',
    'festive-shirts',
    'bottom-wear',
    'ethnic-sets',
    'shirts',
    'jeans',
    'tshirt',
    'undergarments'
  ];

  // Format category name for display
  const formatCategoryName = (category) => {
    if (category === 'all') return 'All Categories';
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <DashboardLayout title="Festive Collection Management">
      <FestiveHeader>
        <h1>Manage Festive Collection</h1>
        <p>Mark products to be shown in the Festive Collection on the website.</p>
      </FestiveHeader>
      
      <ProductsHeader>
        <SearchContainer>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <SearchInput 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <FilterContainer>
          <FilterLabel>Category:</FilterLabel>
          <CategorySelect 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {formatCategoryName(category)}
              </option>
            ))}
          </CategorySelect>
        </FilterContainer>
        
        <AddProductButton onClick={() => navigate('/upload')}>
          <FaPlus /> Add Product
        </AddProductButton>
      </ProductsHeader>
      
      {loading ? (
        <LoadingMessage>Loading products...</LoadingMessage>
      ) : (
        <>
          <ProductsGrid>
            {filteredProducts.map(product => (
              <ProductCard key={product.id}>
                <ProductImage>
                  <img src={product.image || '/api/placeholder/200/200'} alt={product.name} />
                  {product.isNew && <ProductBadge>New</ProductBadge>}
                </ProductImage>
                <ProductDetails>
                  <ProductName>{product.name}</ProductName>
                  <ProductCategory>{formatCategoryName(product.category)}</ProductCategory>
                  <ProductPrice>{formatPrice(product.price)}</ProductPrice>
                  <ProductInfo>
                    <StockInfo className={product.stock > 10 ? 'in-stock' : 'low-stock'}>
                      {product.stock > 10 ? 'In Stock' : 'Low Stock'}: {product.stock}
                    </StockInfo>
                  </ProductInfo>
                </ProductDetails>
                <FestiveStar 
                  onClick={() => toggleFestiveStatus(product.id)}
                  className={product.isFestive ? 'active' : ''}
                >
                  {product.isFestive ? <FaStar /> : <FaRegStar />}
                  <span>{product.isFestive ? 'In Festive Collection' : 'Add to Festive'}</span>
                </FestiveStar>
                <ProductActions>
                  <ActionButton 
                    className="edit"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                </ProductActions>
              </ProductCard>
            ))}
          </ProductsGrid>
          
          {filteredProducts.length === 0 && (
            <EmptyMessage>
              No products found. {searchTerm && `Try a different search term or category.`}
            </EmptyMessage>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

// Styled Components
const FestiveHeader = styled.div`
  background: linear-gradient(135deg, #8e44ad, #c59b6d);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  
  h1 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 14px;
    opacity: 0.9;
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  margin-right: 10px;
  font-weight: 500;
  color: #555;
`;

const CategorySelect = styled.select`
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const AddProductButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #7d3c98;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #666;
  height: 200px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
`;

const ProductCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background-color: #f9f9f9;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ProductBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #8e44ad;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const ProductDetails = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
`;

const ProductCategory = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 10px;
  text-transform: capitalize;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #8e44ad;
  margin-bottom: 10px;
`;

const ProductInfo = styled.div`
  margin-bottom: 10px;
`;

const StockInfo = styled.div`
  display: inline-block;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 20px;
  
  &.in-stock {
    background-color: rgba(76, 175, 80, 0.15);
    color: #4caf50;
  }
  
  &.low-stock {
    background-color: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }
`;

const FestiveStar = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &.active {
    background-color: #c59b6d;
    color: white;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    font-size: 16px;
    color: ${props => props.className === 'active' ? 'white' : '#c59b6d'};
  }
`;

const ProductActions = styled.div`
  display: flex;
  border-top: 1px solid #eee;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.edit {
    color: #2196f3;
    
    &:hover {
      background-color: rgba(33, 150, 243, 0.1);
    }
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: #666;
  font-size: 16px;
`;

export default FestiveProducts;