import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreatePostMutation } from '../slices/postApiSlice.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Postform = () => {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image) {
      toast.error('Please add some text or an image');
      return;
    }
    
    const formData = new FormData();
    formData.append('text', text);
    if (image) {
      formData.append('image', image);
    }

    try {
      await createPost(formData).unwrap();
      toast.success('Post created successfully');
      setText('');
      setImage(null);
      setImagePreview(null);
      navigate('/home');
    } catch (error) {
      if (error?.data?.message?.includes('File too large') || 
          error?.data?.message?.includes('File size') ||
          error?.status === 413) {
        toast.error('Image too large. Please choose a smaller file (max 5MB).');
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Error creating post');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      e.target.value = '';
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      e.target.value = '';
      return;
    }

    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div>
      <div className="postform_header">
        <Link to="/home">back</Link>
        <h2>What's on your mind?</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          cols="30" 
          rows="10" 
          placeholder="Write your post here..."
          maxLength={1000}
        ></textarea>
        
        <div className="image-upload-section">
          <input 
            type="file" 
            onChange={handleImageChange}
            accept="image/*"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-label">
            Choose Image
          </label>
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" onClick={removeImage} className="remove-image">
                Remove
              </button>
            </div>
          )}
        </div>
        
        <button type='submit' disabled={isLoading || (!text.trim() && !image)}>
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default Postform;