import React, { useState } from 'react'
import { useUpdateProfileMutation } from '../slices/userApiSlice.js'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const ChangePassword = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password no match')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await updateProfile({
        currentPassword: formData.currentPassword,
        password: formData.newPassword
      }).unwrap()
      
      toast.success('Your password don change successfully')
      navigate('/profile')
    } catch (error) {
      toast.error(error.data?.message || 'Error changing password')
    }
  }

  return (
    <div className="edit-profile-form">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input 
            type="password" 
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input 
            type="password" 
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword