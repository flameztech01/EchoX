import React from 'react'
import { Link } from 'react-router-dom';
import { usePostAnonymousMutation } from '../slices/ghostApiSlice.js';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Ghostform = () => {
  const [postContent, setPostContent] = useState('');
  const navigate = useNavigate();
  const [postAnonymous, { isLoading }] = usePostAnonymousMutation();

  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await postAnonymous({ text: postContent }).unwrap();
        toast.success('Anonymous post created successfully!');
        navigate('/anonymous');
        setPostContent('');
    } catch (error) {
        toast.error('Failed to create anonymous post.');
    }
  };

  return (
    <div>
        <div className="postform_header">
            <Link to="/anonymous">back</Link>
            <h2>Post Anonymously</h2>
        </div>
      <form onSubmit={handleSubmit}>
            <textarea name="" 
            id="" 
            cols="30" 
            rows="10" 
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write your post here..."></textarea>
            <button type='Submit'>Post Anonymous</button>
      </form>
    </div>
  )
}

export default Ghostform
