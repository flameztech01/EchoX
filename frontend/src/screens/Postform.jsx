import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useCreatePostMutation } from '../slices/postApiSlice.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Postform = () => {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      navigate('/home');
    } catch (error) {
      toast.error('Error creating post');
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
            ></textarea>
            <input 
              type="file" 
              onChange={handleImageChange}
              accept="image/*"
            />
            <button type='submit' disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post'}
            </button>
      </form>
    </div>
  )
}

export default Postform