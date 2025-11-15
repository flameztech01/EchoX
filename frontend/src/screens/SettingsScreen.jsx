import React from 'react'
import LightDark from '../components/LightDark.jsx';
import Bottombar from '../components/Bottombar.jsx';
import SettingsHeader from '../components/SettingsHeader.jsx';

const SettingsScreen = () => {
  return (
    <div className="settings-screen">
      <SettingsHeader />
      <div className="settings-content">
        <div className="settings-item">
          <div className="settings-info">
            <h3>Dark/Light Mode</h3>
            <p>Switch between light and dark theme</p>
          </div>
          <LightDark />
        </div>
      </div>
      <Bottombar />
    </div>
  )
}

export default SettingsScreen