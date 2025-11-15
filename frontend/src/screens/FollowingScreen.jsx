import React from "react";
import { Link } from "react-router-dom";
import { useGetFollowingQuery, useGetUserProfileQuery } from "../slices/userApiSlice";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import Bottombar from "../components/Bottombar.jsx";

const FollowingScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const {
    data: following,
    isLoading,
    refetch: refetchFollowing,
  } = useGetFollowingQuery(userInfo?._id);
  
  const { data: currentUser, refetch: refetchCurrentUser } = useGetUserProfileQuery();
  
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap();
      refetchFollowing();
      refetchCurrentUser();
    } catch (error) {
      console.error('Follow error:', error);
    }
  }

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId).unwrap();
      refetchFollowing();
      refetchCurrentUser();
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  }

  // Use currentUser data for following status
  const isFollowing = (user) => {
    if (!currentUser?.following) return false;
    return currentUser.following.some(followedUser => 
      followedUser._id === user._id
    );
  };

  const isFriends = (user) => {
    return user.isMutualFollow; // Using backend data
  };

  if (isLoading) {
    return (
      <div className="followers-screen">
        <div className="followers-header">
          <h2>Following</h2>
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
    );
  }

  return (
    <div className="followers-screen">
      <div className="followers-header">
        <h2>Following ({following?.followingCount || 0})</h2>
      </div>

      <div className="followers-list">
        {following?.following?.map((user) => (
          <div className="follower-card" key={user._id}>
            <div className="follower-info">
              <Link to={`/profile/${user._id}`} className="follower-avatar">
                <img
                  src={user.profile || "/default-avatar.jpg"}
                  alt={user.username}
                />
              </Link>

              <div className="follower-details">
                <Link to={`/profile/${user._id}`} className="follower-name">
                  {user.name}
                </Link>
                <p className="follower-username">@{user.username}</p>
                {isFriends(user) && (
                  <span className="friends-badge">Friends</span>
                )}
              </div>
            </div>

            {currentUser && currentUser._id !== user._id && (
              <div className="follower-actions">
                {isFollowing(user) ? (
                  <button
                    className="unfollow-btn"
                    onClick={() => handleUnfollow(user._id)}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="follow-btn"
                    onClick={() => handleFollow(user._id)}
                  >
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {following?.following?.length === 0 && (
          <div className="empty-state">
            <p>Not following anyone yet</p>
          </div>
        )}
      </div>
      <Bottombar />
    </div>
  );
};

export default FollowingScreen;