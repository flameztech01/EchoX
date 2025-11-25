import React from 'react'
import PictureSide from '../components/PictureSide.jsx';
import UserPost from '../components/UserPost.jsx';

const ProfileIdscreen = () => {
  return (
    <div className='profile-layout' style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <PictureSide />
        <UserPost />
      </div>
    </div>
  )
}

export default ProfileIdscreen