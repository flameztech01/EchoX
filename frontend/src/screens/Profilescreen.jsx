import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  useUpdateProfileMutation, 
  useLogoutUserMutation 
} from '../slices/userApiSlice.js';
import { setCredentials, logout } from '../slices/authSlice.js';
import { toast } from 'react-toastify';
import Bottombar from '../components/Bottombar.jsx';

const ProfileScreen = () => {
  // Redux state and mutations
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Local state
  const [isUploading, setIsUploading] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Constants
  const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Handles profile picture upload
   */
  const handleFileUpload = async (event) => {
    event.preventDefault();
    
    const file = fileInputRef.current?.files[0];
    
    // Validation
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, JPG, WEBP)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await updateProfile(formData).unwrap();
      dispatch(setCredentials({ ...userInfo, profile: response.profile }));
      
      toast.success('Profile picture updated successfully');
      fileInputRef.current.value = '';
      
      // Close image viewer if open
      setIsImageViewerOpen(false);
    } catch (error) {
      const errorMessage = error?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Triggers file input click when camera icon is clicked
   */
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Opens image viewer modal
   */
  const handleImageClick = () => {
    if (userInfo?.profile) {
      setIsImageViewerOpen(true);
    }
  };

  /**
   * Closes image viewer modal
   */
  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  // Derived state
  const isLoading = isUploading || isUpdatingProfile || isLoggingOut;
  const displayName = userInfo?.name || 'User Name';
  const username = userInfo?.username || 'username';
  const email = userInfo?.email || 'user@example.com';
  const bio = userInfo?.bio || 'No bio provided';
  const profileImage = userInfo?.profile || '/default-avatar.jpg';
  const hasProfileImage = userInfo?.profile && userInfo.profile !== '/default-avatar.jpg';

  return (
    <div className="profile-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">
            {isLoggingOut && 'Logging out...'}
            {(isUploading || isUpdatingProfile) && 'Updating profile...'}
          </p>
        </div>
      )}

      {/* Image Viewer Modal */}
      {isImageViewerOpen && (
        <ImagePreviewModal
          imageUrl={profileImage}
          userName={displayName}
          onClose={handleCloseImageViewer}
        />
      )}

      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-image-section">
          <div className="profile-image-container">
            <img 
              src={profileImage} 
              alt={`${displayName}'s profile`} 
              className={`profile-image ${hasProfileImage ? 'clickable' : ''}`}
              onClick={handleImageClick}
            />
            <button 
              className="camera-icon-button"
              onClick={handleCameraClick}
              type="button"
              aria-label="Change profile picture"
              disabled={isLoading}
            >
              <CameraIcon />
            </button>
          </div>

          <form onSubmit={handleFileUpload} className="upload-form">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="file-input"
              disabled={isLoading}
              aria-label="Select profile picture"
            />
            <button 
              type="submit" 
              disabled={isUploading || isUpdatingProfile} 
              className="upload-button"
            >
              {(isUploading || isUpdatingProfile) ? (
                <>
                  <div className="button-spinner"></div>
                  Uploading...
                </>
              ) : (
                'Update Profile Picture'
              )}
            </button>
          </form>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{displayName}</h1>
          <p className="profile-username">@{username}</p>
          <p className="profile-email">{email}</p>
          <div className="profile-bio">
            <p>{bio}</p>
          </div>
        </div>
      </section>

      {/* Navigation Links */}
      <nav className="profile-navigation">
        <Link className="profile-link" to="/edit-profile">
          Edit Profile
        </Link>
        <Link className="profile-link" to="/followers">
          Followers
        </Link>
        <Link className="profile-link" to="/following">
          Following
        </Link>
        <Link className="profile-link" to="/change-password">
          Change Password
        </Link>
        <Link className="profile-link" to="/delete-account">
          Delete Account
        </Link>
        <button 
          className="profile-link logout-button" 
          onClick={handleLogout}
          disabled={isLoggingOut}
          type="button"
        >
          {isLoggingOut ? (
            <>
              <div className="button-spinner"></div>
              Logging out...
            </>
          ) : (
            'Logout'
          )}
        </button>
      </nav>
      
      <div className="bottom-spacer"></div>
      <Bottombar />
    </div>
  );
};

// Image Preview Modal Component
const ImagePreviewModal = ({ imageUrl, userName, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="image-preview-modal"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Profile picture of ${userName}`}
    >
      <div className="modal-content">
        <button 
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          <CloseIcon />
        </button>
        
        <div className="image-container">
          <img 
            src={imageUrl} 
            alt={`Profile picture of ${userName}`}
            className={`preview-image ${isZoomed ? 'zoomed' : ''}`}
            onClick={handleImageClick}
          />
          
          {/* Zoom hint */}
          {!isZoomed && (
            <div className="zoom-hint">
              <ZoomIcon />
              <span>Click to zoom</span>
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="modal-controls">
          <button 
            className="control-button"
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
          >
            {isZoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
          </button>
          
          <button 
            className="control-button"
            onClick={onClose}
            aria-label="Close viewer"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// Icon Components
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M12 15.2C13.767 15.2 15.2 13.767 15.2 12 15.2 10.233 13.767 8.8 12 8.8 10.233 8.8 8.8 10.233 8.8 12 8.8 13.767 10.233 15.2 12 15.2ZM12 17.6C9.349 17.6 7.2 15.451 7.2 12 7.2 8.549 9.349 6.4 12 6.4 14.651 6.4 16.8 8.549 16.8 12 16.8 15.451 14.651 17.6 12 17.6ZM20 7.2C20.442 7.2 20.8 7.558 20.8 8L20.8 16C20.8 16.442 20.442 16.8 20 16.8 19.558 16.8 19.2 16.442 19.2 16L19.2 8C19.2 7.558 19.558 7.2 20 7.2ZM4 7.2C4.442 7.2 4.8 7.558 4.8 8L4.8 16C4.8 16.442 4.442 16.8 4 16.8 3.558 16.8 3.2 16.442 3.2 16L3.2 8C3.2 7.558 3.558 7.2 4 7.2Z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    <path d="M7 9h5v1H7z"/>
  </svg>
);

const ZoomIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

export default ProfileScreen;