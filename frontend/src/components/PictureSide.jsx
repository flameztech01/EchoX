import React from 'react'
import { useGetOneUserProfileQuery } from '../slices/userApiSlice.js';
import { useParams } from 'react-router-dom';
import { useFollowUserMutation, useUnfollowUserMutation } from '../slices/userApiSlice.js';
import { useSelector } from 'react-redux';

const PictureSide = () => {
    const { id } = useParams();
    const { data: user, isLoading, refetch: refetchUser } = useGetOneUserProfileQuery(id);
    
    // Get current user ONLY from Redux store
    const { userInfo } = useSelector((state) => state.auth);
    const currentUser = userInfo;
    
    const [followUser] = useFollowUserMutation();
    const [unfollowUser] = useUnfollowUserMutation();

    const handleFollow = async () => {
        try {
            await followUser(id).unwrap();
            refetchUser();
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    const handleUnfollow = async () => {
        try {
            await unfollowUser(id).unwrap();
            refetchUser();
        } catch (error) {
            console.error('Unfollow error:', error);
        }
    };

    console.log('Current user from Redux:', currentUser);
    console.log('User data:', user);

    const isOwnProfile = currentUser && user && currentUser._id === user._id;
    
    const isFollowing = user?.followers?.some(follower => 
        follower._id === currentUser?._id
    );

    console.log('Is following:', isFollowing);

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className='container'>
            <div className="coverPhoto"></div>
            <div className="profileContent">
                <img src={user.profile || "/default-avatar.jpg"} alt="Profile" />
                <h1>{user.name}</h1>
                <p>@{user.username}</p>
                <p>{user.bio || ''}</p>
                
                {currentUser && !isOwnProfile && (
                    <div className="followPerson">
                        {isFollowing ? (
                            <button onClick={handleUnfollow} style={{ backgroundColor: '#ff4444' }}>
                                Unfollow
                            </button>
                        ) : (
                            <button onClick={handleFollow} style={{ backgroundColor: '#4CAF50' }}>
                                Follow
                            </button>
                        )}
                    </div>
                )}

                {currentUser && isOwnProfile && (
                    <div className="followPerson">
                        <button style={{ backgroundColor: '#2196F3' }}>
                            Edit Profile
                        </button>
                    </div>
                )}

                <div className="followersNumber">
                    <div className="follows">
                        <h1>{user.following?.length || 0}</h1>
                        <p>Following</p>
                    </div>
                    <div className="follows">
                        <h1>{user.followers?.length || 0}</h1>
                        <p>Followers</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PictureSide