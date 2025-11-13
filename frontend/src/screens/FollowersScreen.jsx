import React from 'react'
import { Link } from 'react-router-dom'
import { useGetFollowersQuery } from '../slices/userApiSlice'
import { useFollowUserMutation, useUnfollowUserMutation } from '../slices/userApiSlice'
import { useSelector } from 'react-redux'
import Bottombar from '../components/Bottombar.jsx'

const FollowersScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { data: followers, isLoading, refetch } = useGetFollowersQuery(userInfo?._id)
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap()
      refetch()
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId).unwrap()
      refetch()
    } catch (error) {
      console.error('Unfollow error:', error)
    }
  }

const isFollowing = (user) => {
  console.log('userInfo following:', userInfo?.following)
  console.log('target user:', user._id)
  return userInfo?.following?.includes(user._id)
}

const isFriends = (user) => {
  return isFollowing(user) && user.following?.some(followingUser => followingUser._id === userInfo?._id)
}

  if (isLoading) {
    return (
      <div className="followers-screen">
        <div className="followers-header">
          <h2>Followers</h2>
        </div>
        {[...Array(5)].map((_, index) => (
          <div className="follower-card loading-skeleton" key={index}>
            <div className="follower-info">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="followers-screen">
        
      <div className="followers-header">
        <h2>Followers ({followers?.followersCount || 0})</h2>
      </div>
      
      <div className="followers-list">
        {followers?.followers?.map((follower) => (
          <div className="follower-card" key={follower._id}>
            <div className="follower-info">
              <Link to={`/profile/${follower._id}`} className="follower-avatar">
                <img 
                  src={follower.profile || "/default-avatar.jpg"} 
                  alt={follower.username}
                />
              </Link>
              
              <div className="follower-details">
                <Link to={`/profile/${follower._id}`} className="follower-name">
                  {follower.name}
                </Link>
                <p className="follower-username">@{follower.username}</p>
                {isFriends(follower) && (
                  <span className="friends-badge">Friends</span>
                )}
              </div>
            </div>

            {userInfo && userInfo._id !== follower._id && (
              <div className="follower-actions">
                {isFollowing(follower) ? (
                  <button 
                    className="unfollow-btn"
                    onClick={() => handleUnfollow(follower._id)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button 
                    className="follow-btn"
                    onClick={() => handleFollow(follower._id)}
                  >
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        
        {followers?.followers?.length === 0 && (
          <div className="empty-state">
            <p>No followers yet</p>
          </div>
        )}
      </div>
      <Bottombar />
    </div>
  )
}

export default FollowersScreen