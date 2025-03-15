// src/services/cloudinary.js
const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Function to upload an image to Cloudinary
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      success: true
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to delete an image from Cloudinary
// Note: For deletion to work securely, you'll need to implement 
// a server-side function eventually. This is just a placeholder.
export const deleteImage = async (publicId) => {
  // In a production app, this should be handled server-side for security
  console.log(`Delete request for image with public ID: ${publicId}`);
  return {
    success: true,
    message: 'Image deletion should be handled server-side for security'
  };
};