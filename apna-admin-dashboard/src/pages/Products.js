// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaImage } from 'react-icons/fa';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const Products = () => {
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
  
  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        
        // Update state to reflect deletion
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
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
  const categories = ['all', ...new Set(products.map(product => product.category))];

  return (
    <DashboardLayout title="Product Management">
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
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
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
              <ProductCard 
                key={product.id} 
                product={product}
                onEdit={() => handleEditProduct(product.id)}
                onDelete={() => handleDeleteProduct(product.id)}
              />
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

// ProductCard Component
const ProductCard = ({ product, onEdit, onDelete }) => {
  // Check if product has multiple images
  const hasMultipleImages = product.images && Array.isArray(product.images) && product.images.length > 1;
  
  // Format category name for display
  const formatCategoryName = (category) => {
    if (!category) return '';
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Format price to Indian Rupee
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <ProductCardContainer>
      <ProductImage>
        <img src={product.image || (product.images && product.images[0]?.url) || '/api/placeholder/200/200'} alt={product.name} />
        {product.isNew && <ProductBadge>New</ProductBadge>}
        
        {/* Show image count indicator if product has multiple images */}
        {hasMultipleImages && (
          <ImageCountBadge>
            <FaImage /> <span>{product.images.length}</span>
          </ImageCountBadge>
        )}
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
      
      <ProductActions>
        <ActionButton 
          className="edit"
          onClick={onEdit}
        >
          <FaEdit /> Edit
        </ActionButton>
        <ActionButton 
          className="delete"
          onClick={onDelete}
        >
          <FaTrash /> Delete
        </ActionButton>
      </ProductActions>
    </ProductCardContainer>
  );
};

// Styled Components
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

const ProductCardContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  
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
  
  ${ProductCardContainer}:hover & img {
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

const ImageCountBadge = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
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
    border-right: 1px solid #eee;
    
    &:hover {
      background-color: rgba(33, 150, 243, 0.1);
    }
  }
  
  &.delete {
    color: #f44336;
    
    &:hover {
      background-color: rgba(244, 67, 54, 0.1);
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

export default Products;