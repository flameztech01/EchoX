import React from 'react'
import { useReplyCommentMutation } from '../slices/commentApiSlice.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams} from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const Ghostcommentform = () => {
    const { id: postId} = useParams();
    const [comments, {isLoading, refetch}] = useReplyCommentMutation();
    const navigate = useNavigate();

    const userInfo = useSelector((state) => state.auth.userInfo);

    const [text, setText] = useState('');

    const HandleSubmitComment = async (e) => {
        e.preventDefault();
       
        try {
            await comments({post: postId, 
                text: text, 
                author: userInfo._id}).unwrap();
            toast.success('Commented Successfully')
            setText('');
            await refetch()
        } catch (error) {
            toast.error('Error Commenting')
        }
    }
  return (
    <div>
      <form onSubmit={HandleSubmitComment} className='comment'>
                <input type="text" 
            placeholder='Write your comment'
            value={text}
            onChange={(e) => setText(e.target.value)}
            />
            <button type='submit'>Send</button>
      </form>
    </div>
  )
}

export default Ghostcommentform
