import React, { useState } from 'react'
import { useDeleteUserMutation } from '../slices/userApiSlice.js'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DeleteAccount = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const [deleteUser, { isLoading }] = useDeleteUserMutation()
  const navigate = useNavigate()
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    reason: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoBack = () => {
    navigate('/profile')
  }

  const handleProceedToDelete = () => {
    setShowConfirmation(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.reason.trim()) {
      toast.error('Please state your reason for deleting account')
      return
    }

    if (!formData.password) {
      toast.error('Please enter your password to confirm deletion')
      return
    }

    try {
      await deleteUser({
        reason: formData.reason,
        password: formData.password
      }).unwrap()
      
      toast.success('Your account don delete successfully')
      // User will be logged out automatically by the backend
    } catch (error) {
      toast.error(error.data?.message || 'Error deleting account')
    }
  }

  if (!showConfirmation) {
    return (
      <div className="edit-profile-form">
        <h2>Delete Account</h2>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={handleGoBack}
              style={{
                padding: '12px 30px',
                background: '#E0E0E0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Go Back
            </button>
            
            <button 
              type="button" 
              onClick={handleProceedToDelete}
              style={{
                padding: '12px 30px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Proceed to Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-profile-form">
      <h2 style={{ color: '#dc3545' }}>Confirm Account Deletion</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Reason for deleting account</label>
          <textarea 
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            placeholder="Please tell us why you're leaving..."
            required
          />
        </div>

        <div className="form-group">
          <label>Enter your password to confirm</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your current password"
            required
          />
        </div>

        <div style={{ 
          background: '#fff5f5', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #ffcccc',
          marginBottom: '20px'
        }}>
          <p style={{ 
            color: '#dc3545', 
            fontSize: '14px', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            ⚠️ <strong>Warning:</strong> This action cannot be undone. All your data, posts, comments, and followers will be permanently deleted.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            background: '#dc3545'
          }}
        >
          {isLoading ? 'Deleting Account...' : 'Delete My Account'}
        </button>
      </form>
    </div>
  )
}

export default DeleteAccount