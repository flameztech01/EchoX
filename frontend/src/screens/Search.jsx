import React, { useState, useEffect } from "react";
import { useSearchQuery } from "../slices/userApiSlice";
import { useFollowUserMutation, useUnfollowUserMutation } from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import SearchNav from "../components/SearchNav"; // Import the SearchNav

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedImages, setExpandedImages] = useState({});
  const { userInfo } = useSelector((state) => state.auth);

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: searchResponse,
    isLoading,
    error,
    isFetching,
  } = useSearchQuery(
    {
      query: debouncedQuery,
      type: searchType,
      page: 1,
      limit: 10,
    },
    {
      skip: debouncedQuery.length < 2,
    }
  );

  // Extract data from response
  const searchResults = searchResponse?.data || searchResponse;

  // Follow/Unfollow handlers
  const handleFollow = async (userId) => {
    if (!userInfo) {
      toast.error("Please login to follow users");
      return;
    }
    
    try {
      await followUser(userId).unwrap();
      toast.success("User followed successfully");
    } catch (error) {
      console.error("Follow error:", error);
      toast.error(error?.data?.message || "Failed to follow user");
    }
  };

  const handleUnfollow = async (userId) => {
    if (!userInfo) {
      toast.error("Please login to unfollow users");
      return;
    }
    
    try {
      await unfollowUser(userId).unwrap();
      toast.success("User unfollowed successfully");
    } catch (error) {
      console.error("Unfollow error:", error);
      toast.error(error?.data?.message || "Failed to unfollow user");
    }
  };

  // Check if current user is following a user
  const isFollowing = (user) => {
    if (!userInfo || !user.followers) return false;
    return user.followers.includes(userInfo._id);
  };

  // Check if it's the current user's own profile
  const isOwnProfile = (user) => {
    return userInfo && user._id === userInfo._id;
  };

  // Image expansion functionality
  const toggleImageExpand = (postId) => {
    setExpandedImages(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="search-container">
      {/* Add SearchNav here */}
      <SearchNav />
      
      <div className="search-header">
        <input
          type="text"
          placeholder="Search for users or posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-select"
        >
          <option value="all">All</option>
          <option value="users">Users</option>
          <option value="posts">Posts</option>
        </select>
      </div>

      {isLoading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <div>Searching...</div>
        </div>
      )}

      {error && (
        <div className="search-error">
          Error: {error?.data?.message || "Search failed"}
        </div>
      )}

      {searchResults && (
        <div className="search-results">
          {/* Users Results - Matching Followers Screen */}
          {searchResults.users && searchResults.users.length > 0 && (
            <div className="users-section">
              <h3>Users ({searchResults.usersCount || searchResults.users.length})</h3>
              {searchResults.users.map((user) => (
                <div key={user._id} className="user-result">
                  <div className="user-info">
                    <Link to={`/profile/${user._id}`} className="user-avatar">
                      <img
                        src={user.profile || "/default-avatar.png"}
                        alt={user.name}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    </Link>
                    <div className="user-details">
                      <Link to={`/profile/${user._id}`} className="user-name">
                        {user.name}
                      </Link>
                      <p className="user-username">@{user.username}</p>
                      {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>
                  </div>
                  
                  {userInfo && !isOwnProfile(user) && (
                    <div className="user-actions">
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
            </div>
          )}

          {/* Posts Results - Matching ViewPosts */}
          {searchResults.posts && searchResults.posts.length > 0 && (
            <div className="posts-section">
              <h3>Posts ({searchResults.postsCount || searchResults.posts.length})</h3>
              {searchResults.posts.map((post) => (
                <div key={post._id} className="post-result">
                  <div className="post-profile-side">
                    <div className="post-profile">
                      <img
                        src={post.user?.profile || "/default-avatar.png"}
                        alt={post.user?.name}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <Link to={`/profile/${post.user?._id}`}>
                        {post.user?.username}
                      </Link>
                    </div>
                    
                    {/* FIXED: Check if user data includes followers for follow status */}
                    {userInfo && post.user?._id !== userInfo._id && post.user?.followers && (
                      <div className="post-follow">
                        {isFollowing(post.user) ? (
                          <button 
                            type="button" 
                            onClick={() => handleUnfollow(post.user?._id)}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => handleFollow(post.user?._id)}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="post-content">{post.text}</p>
                  
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="Post" 
                      className={`post-image ${expandedImages[post._id] ? 'expanded' : ''}`}
                      onClick={() => toggleImageExpand(post._id)}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  
                  <div className="post-actions">
                    <div className="action-left">
                      <div className="likes-count">
                        <button className="icon-btn">
                          <FaRegHeart className="icon" />
                        </button>
                        {/* FIXED: Use 'like' instead of 'likes' to match your Post model */}
                        <p>{post.like || 0} Likes</p>
                      </div>
                      <div className="likes-count">
                        <Link to={`/post/${post._id}`} className="icon-btn">
                          <FaRegComment className="icon" />
                        </Link>
                        <Link to={`/post/${post._id}`}>Comments</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchResults &&
            (!searchResults.users || searchResults.users.length === 0) &&
            (!searchResults.posts || searchResults.posts.length === 0) &&
            debouncedQuery.length >= 2 && (
              <div className="no-results">
                No results found for "{searchResults.query || debouncedQuery}"
              </div>
            )}
        </div>
      )}

      {debouncedQuery.length < 2 && debouncedQuery.length > 0 && (
        <div className="search-hint">
          Type at least 2 characters to search...
        </div>
      )}
    </div>
  );
};

export default Search;