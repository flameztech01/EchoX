import React from 'react'
import { useGetOneUserProfileQuery } from '../slices/userApiSlice.js';
import { useParams } from 'react-router-dom'

const PictureSide = () => {
    const { id } = useParams();
    const { data: user, isLoading } = useGetOneUserProfileQuery(id);

     console.log('RAW USER DATA:', user); 

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
                <div className="followPerson">
                    <button>Follow</button>
                </div>
                <div className="followersNumber">
                    <div className="follows">
                        <h1>800</h1>
                        <p>Following</p>
                    </div>
                    <div className="follows">
                        <h1>800</h1>
                        <p>Followers</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PictureSide