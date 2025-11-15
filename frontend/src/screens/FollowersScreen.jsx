import React from "react";
import { Link } from "react-router-dom";
import {
  useGetFollowersQuery,
  useGetUserProfileQuery,
} from "../slices/userApiSlice";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import Bottombar from "../components/Bottombar.jsx";

const FollowersScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const {
    data: followers,
    isLoading,
    refetch: refetchFollowers,
  } = useGetFollowersQuery(userInfo?._id);

  const { data: currentUser, refetch: refetchCurrentUser } =
    useGetUserProfileQuery();

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollow = async (userId) => {
    try {
      await followUser(userId).unwrap();
      refetchFollowers();
      refetchCurrentUser();
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId).unwrap();
      refetchFollowers();
      refetchCurrentUser();
    } catch (error) {
      console.error("Unfollow error:", error);
    }
  };

  // Use currentUser data for following status
  const isFollowing = (user) => {
    if (!currentUser?.following) return false;
    return currentUser.following.some(
      (followedUser) => followedUser._id === user._id
    );
  };

  // Check mutual follow for friends badge
  // In FollowersScreen component - simplified isFriends
  const isFriends = (user) => {
    return user.isMutualFollow; // Now using backend data
  };

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
    );
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

            {currentUser && currentUser._id !== follower._id && (
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
  );
};

export default FollowersScreen;
