import React from 'react'
import { Link } from 'react-router-dom'

const SettingsHeader = () => {
  return (
    <div className="settings-header">
      <Link to="/profile" className="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </Link>
      <h1>Settings</h1>
    </div>
  )
}

export default SettingsHeader