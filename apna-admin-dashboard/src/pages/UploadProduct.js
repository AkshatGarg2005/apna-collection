// src/pages/UploadProduct.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUpload, FaImage, FaSave, FaTimes, FaStar, FaRing, FaFireAlt } from 'react-icons/fa';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage } from '../services/cloudinary';
import DashboardLayout from '../components/layout/DashboardLayout';

const UploadProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([
    'shirts', 'jeans', 'kurta', 'tshirt', 'undergarments', 
    // Wedding categories
    'sherwanis', 'weddingsuits', 'waistcoats', 'accessories',
    // Festive categories
    'festive-shirts', 'bottom-wear', 'ethnic-sets'
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'shirts',
    stock: '',
    sizes: {
      S: false,
      M: false,
      L: false,
      XL: false,
      XXL: false
    },
    colors: {
      White: false,
      Black: false,
      Blue: false,
      Red: false,
      Green: false,
      Beige: false,
      Maroon: false,
      Gold: false
    },
    isNew: false,
    isBestSeller: false,
    isFestive: false,   // Flag for festive collection
    isWedding: false    // Flag for wedding collection
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch categories from Firestore (optional - could be used to dynamically populate categories)
  useEffect(() => {
    // This is a placeholder - you could fetch categories from Firestore
    // For now, we're using the hardcoded values above
  }, []);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('size-')) {
        const size = name.replace('size-', '');
        setFormData(prev => ({
          ...prev,
          sizes: {
            ...prev.sizes,
            [size]: checked
          }
        }));
      } else if (name.startsWith('color-')) {
        const color = name.replace('color-', '');
        setFormData(prev => ({
          ...prev,
          colors: {
            ...prev.colors,
            [color]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.price || !formData.stock) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!selectedImage) {
      setError('Please upload a product image');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Upload image to Cloudinary
      const uploadResult = await uploadImage(selectedImage);
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload image');
      }
      
      // Prepare product data
      const selectedSizes = Object.entries(formData.sizes)
        .filter(([_, isSelected]) => isSelected)
        .map(([size]) => size);
        
      const selectedColors = Object.entries(formData.colors)
        .filter(([_, isSelected]) => isSelected)
        .map(([color]) => color);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        sizes: selectedSizes,
        colors: selectedColors,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
        isFestive: formData.isFestive,
        isWedding: formData.isWedding,
        image: uploadResult.url,
        imagePublicId: uploadResult.publicId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add product to Firestore
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      // Clear form and show success message
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'shirts',
        stock: '',
        sizes: {
          S: false,
          M: false,
          L: false,
          XL: false,
          XXL: false
        },
        colors: {
          White: false,
          Black: false,
          Blue: false,
          Red: false,
          Green: false,
          Beige: false,
          Maroon: false,
          Gold: false
        },
        isNew: false,
        isBestSeller: false,
        isFestive: false,
        isWedding: false
      });
      setSelectedImage(null);
      setImagePreview(null);
      
      setSuccess('Product successfully uploaded!');
      
      // Redirect to products page after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to upload product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Group categories for better organization
  const categoryGroups = {
    'Regular Wear': ['shirts', 'jeans', 'tshirt', 'undergarments'],
    'Wedding Collection': ['sherwanis', 'weddingsuits', 'waistcoats', 'accessories'], 
    'Festive Collection': ['kurta', 'festive-shirts', 'bottom-wear', 'ethnic-sets']
  };
  
  return (
    <DashboardLayout title="Upload New Product">
      <UploadContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <UploadForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Product Information</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="name">Product Name*</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="category">Category*</Label>
                <Select 
                  id="category" 
                  name="category" 
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {Object.entries(categoryGroups).map(([groupName, groupCategories]) => (
                    <optgroup key={groupName} label={groupName}>
                      {groupCategories.map(category => (
                        <option key={category} value={category}>
                          {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows="4"
              />
            </FormGroup>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Product Details</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="price">Price (₹)*</Label>
                <Input 
                  type="number" 
                  id="price" 
                  name="price" 
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="stock">Stock Quantity*</Label>
                <Input 
                  type="number" 
                  id="stock" 
                  name="stock" 
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <SelectionCard>
                <SelectionTitle>Available Sizes</SelectionTitle>
                <SizeOptions>
                  {Object.keys(formData.sizes).map(size => (
                    <SizeOption key={size}>
                      <input 
                        type="checkbox" 
                        id={`size-${size}`} 
                        name={`size-${size}`} 
                        checked={formData.sizes[size]}
                        onChange={handleInputChange}
                      />
                      <label htmlFor={`size-${size}`}>
                        <SizeCircle>{size}</SizeCircle>
                      </label>
                    </SizeOption>
                  ))}
                </SizeOptions>
              </SelectionCard>
              
              <SelectionCard>
                <SelectionTitle>Available Colors</SelectionTitle>
                <ColorOptions>
                  {Object.keys(formData.colors).map(color => (
                    <ColorOption key={color}>
                      <input 
                        type="checkbox" 
                        id={`color-${color}`} 
                        name={`color-${color}`} 
                        checked={formData.colors[color]}
                        onChange={handleInputChange}
                      />
                      <label htmlFor={`color-${color}`}>
                        <ColorCircle 
                          style={{ 
                            backgroundColor: color.toLowerCase(),
                            border: color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none'
                          }}
                        />
                        <ColorName>{color}</ColorName>
                      </label>
                    </ColorOption>
                  ))}
                </ColorOptions>
              </SelectionCard>
            </FormRow>
            
            <CollectionOptionsContainer>
              <CollectionOptionsTitle>Collection Tags</CollectionOptionsTitle>
              <CollectionOptions>
                <CheckboxGroup>
                  <Checkbox 
                    type="checkbox" 
                    id="isNew" 
                    name="isNew" 
                    checked={formData.isNew}
                    onChange={handleInputChange}
                  />
                  <CheckboxLabel htmlFor="isNew">
                    Mark as New Arrival
                  </CheckboxLabel>
                </CheckboxGroup>
                
                <CheckboxGroup>
                  <Checkbox 
                    type="checkbox" 
                    id="isBestSeller" 
                    name="isBestSeller" 
                    checked={formData.isBestSeller}
                    onChange={handleInputChange}
                  />
                  <CheckboxLabel htmlFor="isBestSeller">
                    <FaFireAlt style={{ marginRight: '8px', color: '#e74c3c' }} />
                    Add to Best Sellers
                  </CheckboxLabel>
                </CheckboxGroup>
                
                <CheckboxGroup>
                  <Checkbox 
                    type="checkbox" 
                    id="isFestive" 
                    name="isFestive" 
                    checked={formData.isFestive}
                    onChange={handleInputChange}
                  />
                  <CheckboxLabel htmlFor="isFestive">
                    <FaStar style={{ marginRight: '8px', color: '#c59b6d' }} />
                    Add to Festive Collection
                  </CheckboxLabel>
                </CheckboxGroup>
                
                <CheckboxGroup>
                  <Checkbox 
                    type="checkbox" 
                    id="isWedding" 
                    name="isWedding" 
                    checked={formData.isWedding}
                    onChange={handleInputChange}
                  />
                  <CheckboxLabel htmlFor="isWedding">
                    <FaRing style={{ marginRight: '8px', color: '#8e44ad' }} />
                    Add to Wedding Collection
                  </CheckboxLabel>
                </CheckboxGroup>
              </CollectionOptions>
            </CollectionOptionsContainer>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Product Image</SectionTitle>
            
            <ImageUploadContainer>
              {!imagePreview ? (
                <ImageUploadArea>
                  <input 
                    type="file" 
                    id="image-upload" 
                    name="image" 
                    onChange={handleImageChange}
                    accept="image/*" 
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload">
                    <FaImage className="upload-icon" />
                    <p>Click to upload image or drag & drop</p>
                    <span>JPG, PNG or WEBP (max. 5MB)</span>
                  </label>
                </ImageUploadArea>
              ) : (
                <ImagePreviewContainer>
                  <ImagePreview src={imagePreview} alt="Product preview" />
                  <RemoveImageButton onClick={handleRemoveImage}>
                    <FaTimes />
                  </RemoveImageButton>
                </ImagePreviewContainer>
              )}
            </ImageUploadContainer>
          </FormSection>
          
          <FormActions>
            <CancelButton type="button" onClick={() => navigate('/products')}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Product'}
              {!loading && <FaSave style={{ marginLeft: '8px' }} />}
            </SubmitButton>
          </FormActions>
        </UploadForm>
      </UploadContainer>
    </DashboardLayout>
  );
};

// Styled Components
const UploadContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const FormSection = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 25px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #333;
  position: relative;
  padding-left: 18px;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 24px;
    background: linear-gradient(to bottom, #8e44ad, #9b59b6);
    border-radius: 3px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
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

const SelectionCard = styled.div`
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const SelectionTitle = styled.h4`
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
  font-weight: 500;
`;

const SizeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`;

const SizeOption = styled.div`
  position: relative;
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  label {
    cursor: pointer;
  }
  
  input:checked + label > div {
    border-color: #8e44ad;
    color: #8e44ad;
    background-color: rgba(142, 68, 173, 0.1);
    transform: scale(1.05);
  }
`;

const SizeCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #8e44ad;
  }
`;

const ColorOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const ColorOption = styled.div`
  position: relative;
  
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  input:checked + label > div:first-child {
    transform: scale(1.15);
    box-shadow: 0 0 0 2px #8e44ad;
  }
  
  input:checked + label > div:last-child {
    color: #8e44ad;
    font-weight: 600;
  }
`;

const ColorCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: all 0.3s ease;
`;

const ColorName = styled.div`
  font-size: 12px;
  color: #666;
`;

const CollectionOptionsContainer = styled.div`
  margin-top: 25px;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
`;

const CollectionOptionsTitle = styled.h4`
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
  font-weight: 500;
`;

const CollectionOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
  width: 18px;
  height: 18px;
  accent-color: #8e44ad;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ImageUploadContainer = styled.div`
  margin-top: 10px;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #8e44ad;
    background-color: rgba(142, 68, 173, 0.03);
  }
  
  .upload-icon {
    font-size: 40px;
    color: #8e44ad;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 8px;
  }
  
  span {
    font-size: 12px;
    color: #888;
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  max-width: 300px;
  margin: 0 auto;
`;

const ImagePreview = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #f44336;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #fff;
    color: #d32f2f;
    transform: scale(1.1);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 160px;
  
  &:hover {
    background-color: #7d3c98;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #b39ddb;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 14px 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #eee;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default UploadProduct;