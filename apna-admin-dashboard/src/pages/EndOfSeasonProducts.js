// src/pages/EndOfSeasonProducts.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaPlus, FaSearch, FaPercent, FaTag, FaTags } from 'react-icons/fa';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const EndOfSeasonProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkDiscount, setBulkDiscount] = useState(20);
  const [saleEndDate, setSaleEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsQuery = query(
          collection(db, 'products'),
          orderBy('name', 'asc')
        );
        const productsSnapshot = await getDocs(productsQuery);
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
  
  // Toggle sale status and apply discount
  const toggleSaleStatus = async (productId, currentDiscount = 20) => {
    try {
      const productToUpdate = products.find(product => product.id === productId);
      const isOnSale = !productToUpdate.onSale;
      
      // Calculate fields based on the sale status
      let updateData = {};
      
      if (isOnSale) {
        // Adding to sale - set up discount
        const discountPercentage = typeof currentDiscount === 'number' ? currentDiscount : 20;
        const originalPrice = productToUpdate.price || 0;
        const discountedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
        
        updateData = {
          onSale: true,
          discountPercentage,
          discountedPrice,
          saleEndDate
        };
      } else {
        // Removing from sale - remove discount fields
        updateData = {
          onSale: false,
          discountPercentage: null,
          discountedPrice: null,
          saleEndDate: null
        };
      }
      
      // Update in Firestore
      await updateDoc(doc(db, 'products', productId), updateData);
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, ...updateData }
          : product
      ));
      
    } catch (error) {
      console.error('Error updating sale status:', error);
      alert('Failed to update sale status. Please try again.');
    }
  };

  // Update discount percentage
  const updateDiscount = async (productId, newDiscount) => {
    try {
      const productToUpdate = products.find(product => product.id === productId);
      
      if (!productToUpdate.onSale) {
        return; // Do nothing if product is not on sale
      }
      
      const discountPercentage = parseInt(newDiscount);
      if (isNaN(discountPercentage) || discountPercentage < 1 || discountPercentage > 99) {
        alert('Discount must be a number between 1 and 99');
        return;
      }
      
      const originalPrice = productToUpdate.price || 0;
      const discountedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
      
      // Update in Firestore
      await updateDoc(doc(db, 'products', productId), {
        discountPercentage,
        discountedPrice
      });
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, discountPercentage, discountedPrice }
          : product
      ));
      
    } catch (error) {
      console.error('Error updating discount:', error);
      alert('Failed to update discount. Please try again.');
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
  
  // Handle bulk selection toggle
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };
  
  // Handle select all products
  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };
  
  // Apply bulk discount
  const applyBulkDiscount = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }
    
    if (isNaN(bulkDiscount) || bulkDiscount < 1 || bulkDiscount > 99) {
      alert('Discount must be a number between 1 and 99');
      return;
    }
    
    try {
      setLoading(true);
      
      // Process each selected product
      for (const productId of selectedProducts) {
        const productToUpdate = products.find(product => product.id === productId);
        const originalPrice = productToUpdate.price || 0;
        const discountedPrice = Math.round(originalPrice * (1 - bulkDiscount / 100));
        
        // Update in Firestore
        await updateDoc(doc(db, 'products', productId), {
          onSale: true,
          discountPercentage: parseInt(bulkDiscount),
          discountedPrice,
          saleEndDate
        });
      }
      
      // Refresh product list
      const productsQuery = query(collection(db, 'products'), orderBy('name', 'asc'));
      const productsSnapshot = await getDocs(productsQuery);
      const updatedProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(updatedProducts);
      setSelectedProducts([]);
      setIsBulkMode(false);
      
    } catch (error) {
      console.error('Error applying bulk discount:', error);
      alert('Failed to apply bulk discount. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update sale end date for all sale products
  const updateSaleEndDate = async () => {
    try {
      setLoading(true);
      
      // Get all products on sale
      const saleProducts = products.filter(product => product.onSale);
      
      if (saleProducts.length === 0) {
        alert('No products are currently on sale');
        setLoading(false);
        return;
      }
      
      // Update each product
      for (const product of saleProducts) {
        await updateDoc(doc(db, 'products', product.id), {
          saleEndDate
        });
      }
      
      // Update local state
      setProducts(products.map(product => 
        product.onSale ? { ...product, saleEndDate } : product
      ));
      
      alert('Sale end date updated successfully');
      
    } catch (error) {
      console.error('Error updating sale end date:', error);
      alert('Failed to update sale end date. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get all unique categories
  const categories = [
    'all',
    'shirts', 'jeans', 'tshirt', 'undergarments',
    'sherwanis', 'weddingsuits', 'waistcoats', 'accessories',
    'kurta', 'festive-shirts', 'bottom-wear', 'ethnic-sets'
  ];

  // Format category name for display
  const formatCategoryName = (category) => {
    if (category === 'all') return 'All Categories';
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Calculate days remaining in sale
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Count products on sale
  const productsOnSale = products.filter(product => product.onSale).length;

  return (
    <DashboardLayout title="End of Season Sale Management">
      <SaleHeader>
        <h1>Manage End of Season Sale</h1>
        <p>Mark products for the sale and set discount percentages</p>
      </SaleHeader>
      
      <SaleDateSection>
        <SaleDateTitle>Sale End Date</SaleDateTitle>
        <SaleDateForm>
          <SaleDateInput 
            type="date" 
            value={saleEndDate}
            onChange={(e) => setSaleEndDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <SaleDateButton onClick={updateSaleEndDate}>
            Update End Date
          </SaleDateButton>
        </SaleDateForm>
        <SaleStats>
          <SaleStat>
            <span className="stat-value">{productsOnSale}</span>
            <span className="stat-label">Products on Sale</span>
          </SaleStat>
          <SaleStat>
            <span className="stat-value">{getDaysRemaining(saleEndDate)}</span>
            <span className="stat-label">Days Remaining</span>
          </SaleStat>
        </SaleStats>
      </SaleDateSection>
      
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
        
        {!isBulkMode ? (
          <BulkModeButton onClick={() => setIsBulkMode(true)}>
            <FaPercent /> Bulk Discount Mode
          </BulkModeButton>
        ) : (
          <BulkDiscountContainer>
            <BulkDiscount
              type="number"
              placeholder="Discount %"
              min="1"
              max="99"
              value={bulkDiscount}
              onChange={(e) => setBulkDiscount(e.target.value)}
            />
            <ApplyBulkButton onClick={applyBulkDiscount}>
              Apply to Selected
            </ApplyBulkButton>
            <CancelBulkButton onClick={() => {
              setIsBulkMode(false);
              setSelectedProducts([]);
            }}>
              Cancel
            </CancelBulkButton>
          </BulkDiscountContainer>
        )}
      </ProductsHeader>
      
      {loading ? (
        <LoadingMessage>Loading products...</LoadingMessage>
      ) : (
        <>
          {isBulkMode && (
            <BulkActionBar>
              <SelectAllCheckbox>
                <input 
                  type="checkbox" 
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={selectAllProducts}
                  id="select-all"
                />
                <label htmlFor="select-all">Select All ({selectedProducts.length}/{filteredProducts.length})</label>
              </SelectAllCheckbox>
              <SelectedInfo>
                {selectedProducts.length} products selected for {bulkDiscount}% discount
              </SelectedInfo>
            </BulkActionBar>
          )}
          
          <ProductsGrid>
            {filteredProducts.map(product => (
              <ProductCard key={product.id}>
                {isBulkMode && (
                  <SelectProductCheckbox 
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                  />
                )}
                <ProductImage>
                  <img src={product.image || '/api/placeholder/200/200'} alt={product.name} />
                  {product.isNew && <ProductBadge>New</ProductBadge>}
                  {product.onSale && (
                    <SaleBadge>{product.discountPercentage || 0}% OFF</SaleBadge>
                  )}
                </ProductImage>
                <ProductDetails>
                  <ProductName>{product.name}</ProductName>
                  <ProductCategory>{formatCategoryName(product.category)}</ProductCategory>
                  <ProductPrice>
                    {product.onSale ? (
                      <>
                        <OriginalPrice>{formatPrice(product.price)}</OriginalPrice>
                        <DiscountedPrice>{formatPrice(product.discountedPrice)}</DiscountedPrice>
                      </>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </ProductPrice>
                  <ProductInfo>
                    <StockInfo className={product.stock > 10 ? 'in-stock' : 'low-stock'}>
                      {product.stock > 10 ? 'In Stock' : 'Low Stock'}: {product.stock}
                    </StockInfo>
                  </ProductInfo>
                </ProductDetails>
                
                {!isBulkMode && (
                  <>
                    <SaleTag 
                      onClick={() => toggleSaleStatus(product.id, product.discountPercentage)}
                      className={product.onSale ? 'active' : ''}
                    >
                      {product.onSale ? <FaTag /> : <FaTags />}
                      <span>{product.onSale ? 'On Sale' : 'Add to Sale'}</span>
                    </SaleTag>
                    
                    {product.onSale && (
                      <DiscountInput
                        type="number"
                        min="1"
                        max="99"
                        value={product.discountPercentage || ""}
                        onChange={(e) => updateDiscount(product.id, e.target.value)}
                        placeholder="% Off"
                      />
                    )}
                  </>
                )}
                
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
const SaleHeader = styled.div`
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

const SaleDateSection = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SaleDateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const SaleDateForm = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SaleDateInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
  }
`;

const SaleDateButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #7d3c98;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SaleStats = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SaleStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #8e44ad;
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 15px;
  
  @media (max-width: 992px) {
    flex-wrap: wrap;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  flex: 1;
  
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
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  margin-right: 10px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
`;

const CategorySelect = styled.select`
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
`;

const BulkModeButton = styled.button`
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
  white-space: nowrap;
  
  &:hover {
    background-color: #7d3c98;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const BulkDiscountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const BulkDiscount = styled.input`
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 100px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ApplyBulkButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #7d3c98;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const CancelBulkButton = styled.button`
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const BulkActionBar = styled.div`
  background-color: #f9f9f9;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
`;

const SelectAllCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    font-size: 14px;
    cursor: pointer;
  }
`;

const SelectedInfo = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
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

const SelectProductCheckbox = styled.input`
  position: absolute;
  top: 15px;
  left: 15px;
  width: 20px;
  height: 20px;
  z-index: 10;
  cursor: pointer;
  background-color: white;
  border: 2px solid #8e44ad;
  border-radius: 4px;
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

const SaleBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  font-weight: 400;
`;

const DiscountedPrice = styled.span`
  color: #e74c3c;
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

const SaleTag = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
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
  z-index: 5;
  
  &.active {
    background-color: #e74c3c;
    color: white;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    font-size: 16px;
  }
`;

const DiscountInput = styled.input`
  position: absolute;
  top: 60px;
  right: 10px;
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 5;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 2px 8px rgba(142, 68, 173, 0.2);
  }
  
  &::after {
    content: '%';
    position: absolute;
    right: 10px;
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

export default EndOfSeasonProducts;