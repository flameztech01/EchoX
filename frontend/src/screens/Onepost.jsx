import React from 'react'
import Postid from '../components/Postid.jsx'
import Comment from '../components/Comment.jsx'
import Bottombar from '../components/Bottombar.jsx'
import Ghostcommentform from '../components/Ghostcommentform.jsx'
import PostNavbar from '../components/PostNavbar.jsx'

const Onepost = () => {
  return (
    <div>
      <PostNavbar />
      <Postid />
    <Comment />
    <Ghostcommentform />
    </div>
  )
}

export default Onepost
