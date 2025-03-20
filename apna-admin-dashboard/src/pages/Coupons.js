// src/pages/Coupons.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaPercent, 
  FaRupeeSign, 
  FaCalendarAlt, 
  FaTag, 
  FaInfoCircle,
  FaCopy
} from 'react-icons/fa';
import { 
  collection, 
  getDocs,
  orderBy,
  query 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  toggleCouponStatus 
} from '../services/couponService';
import DashboardLayout from '../components/layout/DashboardLayout';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    minOrder: '',
    maxDiscount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
    active: true,
    usageLimit: '',
    perUserLimit: ''
  });
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Fetch coupons from Firestore
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const couponsQuery = query(
          collection(db, 'coupons'),
          orderBy('createdAt', 'desc')
        );
        const couponsSnapshot = await getDocs(couponsQuery);
        const couponsList = couponsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCoupons(couponsList);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoupons();
  }, []);
  
  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(coupon => {
    return coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Open modal for creating a new coupon
  const handleCreateCoupon = () => {
    setFormMode('create');
    setSelectedCoupon(null);
    setFormData({
      code: '',
      discount: '',
      discountType: 'percentage',
      minOrder: '',
      maxDiscount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      usageLimit: '',
      perUserLimit: ''
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };
  
  // Open modal for editing an existing coupon
  const handleEditCoupon = (coupon) => {
    setFormMode('edit');
    setSelectedCoupon(coupon);
    
    // Convert Firestore timestamps to date strings
    const startDate = coupon.startDate?.toDate?.() || new Date(coupon.startDate);
    const endDate = coupon.endDate?.toDate?.() || new Date(coupon.endDate);
    
    setFormData({
      code: coupon.code || '',
      discount: coupon.discount || '',
      discountType: coupon.discountType || 'percentage',
      minOrder: coupon.minOrder || '',
      maxDiscount: coupon.maxDiscount || '',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      active: coupon.active !== undefined ? coupon.active : true,
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit || ''
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.code) {
      setFormError('Coupon code is required');
      return;
    }
    
    if (!formData.discount) {
      setFormError('Discount amount is required');
      return;
    }
    
    if (formData.discountType === 'percentage' && (formData.discount < 1 || formData.discount > 100)) {
      setFormError('Percentage discount must be between 1 and 100');
      return;
    }
    
    if (!formData.minOrder) {
      setFormError('Minimum order amount is required');
      return;
    }
    
    if (formData.discountType === 'percentage' && formData.maxDiscount === '') {
      setFormError('Maximum discount amount is required for percentage discounts');
      return;
    }
    
    try {
      setFormError('');
      
      if (formMode === 'create') {
        // Create new coupon
        const result = await createCoupon(formData);
        
        if (result.success) {
          setFormSuccess('Coupon created successfully');
          
          // Add the new coupon to the list
          setCoupons(prev => [{
            id: result.couponId,
            ...formData,
            createdAt: new Date(),
            updatedAt: new Date()
          }, ...prev]);
          
          // Close the modal after a short delay
          setTimeout(() => {
            setShowModal(false);
          }, 1500);
        } else {
          setFormError(result.message);
        }
      } else {
        // Update existing coupon
        const result = await updateCoupon(selectedCoupon.id, formData);
        
        if (result.success) {
          setFormSuccess('Coupon updated successfully');
          
          // Update the coupon in the list
          setCoupons(prev => prev.map(coupon => 
            coupon.id === selectedCoupon.id 
              ? { ...coupon, ...formData, updatedAt: new Date() } 
              : coupon
          ));
          
          // Close the modal after a short delay
          setTimeout(() => {
            setShowModal(false);
          }, 1500);
        } else {
          setFormError(result.message);
        }
      }
    } catch (err) {
      console.error('Error submitting coupon:', err);
      setFormError('An error occurred. Please try again.');
    }
  };
  
  // Handle coupon deletion
  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const result = await deleteCoupon(couponId);
        
        if (result.success) {
          // Remove the coupon from the list
          setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Failed to delete coupon. Please try again.');
      }
    }
  };
  
  // Handle toggling coupon status
  const handleToggleStatus = async (couponId) => {
    try {
      const result = await toggleCouponStatus(couponId);
      
      if (result.success) {
        // Update the coupon status in the list
        setCoupons(prev => prev.map(coupon => 
          coupon.id === couponId 
            ? { ...coupon, active: !coupon.active, updatedAt: new Date() } 
            : coupon
        ));
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      alert('Failed to update coupon status. Please try again.');
    }
  };
  
  // Handle coupon code copy
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert(`Coupon code ${code} copied to clipboard`);
      })
      .catch((err) => {
        console.error('Could not copy code: ', err);
      });
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Check if coupon is active based on dates
  const isCouponActive = (coupon) => {
    if (!coupon.active) return false;
    
    const now = new Date();
    const startDate = coupon.startDate?.toDate?.() || new Date(coupon.startDate);
    const endDate = coupon.endDate?.toDate?.() || new Date(coupon.endDate);
    
    return now >= startDate && now <= endDate;
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
    <DashboardLayout title="Coupon Management">
      <PageHeader>
        <h1>Manage Coupon Codes</h1>
        <p>Create and manage discount coupons for your customers</p>
      </PageHeader>
      
      <ActionsContainer>
        <SearchContainer>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <SearchInput 
            type="text" 
            placeholder="Search coupons by code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <CreateButton onClick={handleCreateCoupon}>
          <FaPlus /> Create Coupon
        </CreateButton>
      </ActionsContainer>
      
      {loading ? (
        <LoadingMessage>Loading coupons...</LoadingMessage>
      ) : (
        <>
          {filteredCoupons.length > 0 ? (
            <CouponsGrid>
              {filteredCoupons.map(coupon => (
                <CouponCard 
                  key={coupon.id}
                  className={isCouponActive(coupon) ? 'active' : 'inactive'}
                >
                  <CouponCardHeader>
                    <CouponCode>
                      {coupon.code}
                      <CopyButton 
                        onClick={() => handleCopyCode(coupon.code)}
                        title="Copy code"
                      >
                        <FaCopy />
                      </CopyButton>
                    </CouponCode>
                    <CouponStatus className={isCouponActive(coupon) ? 'active' : 'inactive'}>
                      {isCouponActive(coupon) ? 'Active' : 'Inactive'}
                    </CouponStatus>
                  </CouponCardHeader>
                  
                  <CouponDetails>
                    <CouponDetail>
                      <DetailIcon className="discount">
                        {coupon.discountType === 'percentage' ? <FaPercent /> : <FaRupeeSign />}
                      </DetailIcon>
                      <DetailInfo>
                        <DetailLabel>Discount</DetailLabel>
                        <DetailValue>
                          {coupon.discount}
                          {coupon.discountType === 'percentage' ? '%' : ' flat'}
                          {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                            <span className="max-discount">
                              {' '}(max {formatPrice(coupon.maxDiscount)})
                            </span>
                          )}
                        </DetailValue>
                      </DetailInfo>
                    </CouponDetail>
                    
                    <CouponDetail>
                      <DetailIcon className="min-order">
                        <FaRupeeSign />
                      </DetailIcon>
                      <DetailInfo>
                        <DetailLabel>Min. Order</DetailLabel>
                        <DetailValue>{formatPrice(coupon.minOrder)}</DetailValue>
                      </DetailInfo>
                    </CouponDetail>
                    
                    <CouponDetail>
                      <DetailIcon className="validity">
                        <FaCalendarAlt />
                      </DetailIcon>
                      <DetailInfo>
                        <DetailLabel>Validity</DetailLabel>
                        <DetailValue>
                          {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                        </DetailValue>
                      </DetailInfo>
                    </CouponDetail>
                    
                    {(coupon.usageLimit || coupon.perUserLimit) && (
                      <CouponDetail>
                        <DetailIcon className="usage">
                          <FaInfoCircle />
                        </DetailIcon>
                        <DetailInfo>
                          <DetailLabel>Usage Limits</DetailLabel>
                          <DetailValue>
                            {coupon.usageLimit ? `Total: ${coupon.usageLimit}` : ''}
                            {coupon.usageLimit && coupon.perUserLimit ? ' | ' : ''}
                            {coupon.perUserLimit ? `Per User: ${coupon.perUserLimit}` : ''}
                          </DetailValue>
                        </DetailInfo>
                      </CouponDetail>
                    )}
                  </CouponDetails>
                  
                  <CouponActions>
                    <ActionButton 
                      className="toggle"
                      onClick={() => handleToggleStatus(coupon.id)}
                      title={coupon.active ? "Deactivate coupon" : "Activate coupon"}
                    >
                      {coupon.active ? <FaTimes /> : <FaCheck />}
                      <span>{coupon.active ? 'Deactivate' : 'Activate'}</span>
                    </ActionButton>
                    
                    <ActionButton 
                      className="edit"
                      onClick={() => handleEditCoupon(coupon)}
                    >
                      <FaEdit /> Edit
                    </ActionButton>
                    
                    <ActionButton 
                      className="delete"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                    >
                      <FaTrash /> Delete
                    </ActionButton>
                  </CouponActions>
                </CouponCard>
              ))}
            </CouponsGrid>
          ) : (
            <EmptyMessage>
              No coupons found. {searchTerm && 'Try a different search term or '} 
              <CreateLink onClick={handleCreateCoupon}>create a new coupon</CreateLink>.
            </EmptyMessage>
          )}
        </>
      )}
      
      {/* Coupon Form Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {formMode === 'create' ? 'Create New Coupon' : 'Edit Coupon'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              {formError && <ErrorMessage>{formError}</ErrorMessage>}
              {formSuccess && <SuccessMessage>{formSuccess}</SuccessMessage>}
              
              <CouponForm onSubmit={handleSubmit}>
                <FormSection>
                  <SectionTitle>Coupon Information</SectionTitle>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="code">Coupon Code*</Label>
                      <Input 
                        type="text" 
                        id="code" 
                        name="code" 
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g. SUMMER20"
                        required
                        disabled={formMode === 'edit'}
                      />
                      <FieldHint>
                        Unique code for the coupon. Use uppercase for better visibility.
                      </FieldHint>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="active">Status</Label>
                      <ToggleContainer>
                        <ToggleInput 
                          type="checkbox" 
                          id="active" 
                          name="active" 
                          checked={formData.active}
                          onChange={handleInputChange}
                        />
                        <ToggleLabel htmlFor="active">
                          {formData.active ? 'Active' : 'Inactive'}
                        </ToggleLabel>
                      </ToggleContainer>
                      <FieldHint>
                        Active coupons can be used by customers.
                      </FieldHint>
                    </FormGroup>
                  </FormRow>
                </FormSection>
                
                <FormSection>
                  <SectionTitle>Discount Details</SectionTitle>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="discountType">Discount Type*</Label>
                      <Select 
                        id="discountType" 
                        name="discountType" 
                        value={formData.discountType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </Select>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="discount">
                        Discount {formData.discountType === 'percentage' ? '(%)' : '(₹)'}*
                      </Label>
                      <Input 
                        type="number" 
                        id="discount" 
                        name="discount" 
                        value={formData.discount}
                        onChange={handleInputChange}
                        placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                        min="1"
                        max={formData.discountType === 'percentage' ? '100' : ''}
                        required
                      />
                    </FormGroup>
                  </FormRow>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="minOrder">Minimum Order Amount (₹)*</Label>
                      <Input 
                        type="number" 
                        id="minOrder" 
                        name="minOrder" 
                        value={formData.minOrder}
                        onChange={handleInputChange}
                        placeholder="e.g. 1000"
                        min="0"
                        required
                      />
                      <FieldHint>
                        Minimum order value required to apply this coupon.
                      </FieldHint>
                    </FormGroup>
                    
                    {formData.discountType === 'percentage' && (
                      <FormGroup>
                        <Label htmlFor="maxDiscount">Maximum Discount (₹)*</Label>
                        <Input 
                          type="number" 
                          id="maxDiscount" 
                          name="maxDiscount" 
                          value={formData.maxDiscount}
                          onChange={handleInputChange}
                          placeholder="e.g. 1000"
                          min="0"
                          required
                        />
                        <FieldHint>
                          Maximum discount amount applicable when using percentage.
                        </FieldHint>
                      </FormGroup>
                    )}
                  </FormRow>
                </FormSection>
                
                <FormSection>
                  <SectionTitle>Validity and Usage</SectionTitle>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="startDate">Start Date*</Label>
                      <Input 
                        type="date" 
                        id="startDate" 
                        name="startDate" 
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="endDate">End Date*</Label>
                      <Input 
                        type="date" 
                        id="endDate" 
                        name="endDate" 
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </FormRow>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="usageLimit">Total Usage Limit</Label>
                      <Input 
                        type="number" 
                        id="usageLimit" 
                        name="usageLimit" 
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        placeholder="e.g. 100 (leave empty for unlimited)"
                        min="0"
                      />
                      <FieldHint>
                        How many times this coupon can be used in total.
                      </FieldHint>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="perUserLimit">Per User Limit</Label>
                      <Input 
                        type="number" 
                        id="perUserLimit" 
                        name="perUserLimit" 
                        value={formData.perUserLimit}
                        onChange={handleInputChange}
                        placeholder="e.g. 1 (leave empty for unlimited)"
                        min="0"
                      />
                      <FieldHint>
                        How many times each user can use this coupon.
                      </FieldHint>
                    </FormGroup>
                  </FormRow>
                </FormSection>
                
                <FormActions>
                  <CancelButton type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </CancelButton>
                  <SubmitButton type="submit">
                    {formMode === 'create' ? 'Create Coupon' : 'Update Coupon'}
                  </SubmitButton>
                </FormActions>
              </CouponForm>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

// Styled Components
const PageHeader = styled.div`
  background: linear-gradient(135deg, #8e44ad, #6c3483);
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

const ActionsContainer = styled.div`
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

const CreateButton = styled.button`
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

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const CouponCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 5px solid #8e44ad;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    border-left-color: #4caf50;
  }
  
  &.inactive {
    border-left-color: #9e9e9e;
    opacity: 0.8;
  }
`;

const CouponCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const CouponCode = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #8e44ad;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  
  &:hover {
    color: #6c3483;
  }
`;

const CouponStatus = styled.div`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  &.active {
    background-color: rgba(76, 175, 80, 0.15);
    color: #4caf50;
  }
  
  &.inactive {
    background-color: rgba(158, 158, 158, 0.15);
    color: #9e9e9e;
  }
`;

const CouponDetails = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CouponDetail = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const DetailIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  &.discount {
    background-color: #8e44ad;
  }
  
  &.min-order {
    background-color: #2196f3;
  }
  
  &.validity {
    background-color: #ff9800;
  }
  
  &.usage {
    background-color: #4caf50;
  }
`;

const DetailInfo = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  
  .max-discount {
    font-size: 12px;
    color: #666;
  }
`;

const CouponActions = styled.div`
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
  
  &.delete {
    color: #f44336;
    
    &:hover {
      background-color: rgba(244, 67, 54, 0.1);
    }
  }
  
  &.toggle {
    color: #4caf50;
    
    &:hover {
      background-color: rgba(76, 175, 80, 0.1);
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

const CreateLink = styled.span`
  color: #8e44ad;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
`;

// Form Styles
const CouponForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormSection = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
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
  
  &:disabled {
    background-color: #f9f9f9;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
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
`;

const FieldHint = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + label {
    background-color: #8e44ad;
  }
  
  &:checked + label:before {
    transform: translateX(20px);
  }
`;

const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  background-color: #ccc;
  border-radius: 34px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  
  &:before {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: white;
    top: 3px;
    left: 3px;
    transition: all 0.3s ease;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  @media (max-width: 768px) {
    order: 2;
  }
`;

const SubmitButton = styled.button`
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
    order: 1;
  }
`;

export default Coupons;