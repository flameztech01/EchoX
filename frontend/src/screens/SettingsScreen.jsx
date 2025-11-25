import React from "react";
import LightDark from "../components/LightDark.jsx";
import Bottombar from "../components/Bottombar.jsx";
import { Link } from "react-router-dom";
import { FaChevronRight, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";

// SettingsHeader component (in case you don't have it)
const SettingsHeader = () => {
  return (
    <div className="settings-header">
      <Link to="/" className="back-button">
        <FaArrowLeft />
      </Link>
      <h1>Settings</h1>
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div className="settings-screen">
      <SettingsHeader />
      <div className="settings-content">
        {/* Appearance */}
        <div className="settings-item">
          <div className="settings-info">
            <h3>Appearance</h3>
            <p>Switch between light and dark theme</p>
          </div>
          <LightDark />
        </div>

        {/* Account Settings */}
        <Link to="/edit-profile" className="settings-item settings-link">
          <div className="settings-info">
            <h3>Account Settings</h3>
            <p>Manage your profile information</p>
          </div>
          <FaChevronRight className="settings-chevron" />
        </Link>

        {/* Privacy & Security */}
        <Link to="/privacy" className="settings-item settings-link">
          <div className="settings-info">
            <h3>Privacy & Security</h3>
            <p>Control your privacy settings</p>
          </div>
          <FaChevronRight className="settings-chevron" />
        </Link>

        {/* Notifications */}
        <Link to="/notifications" className="settings-item settings-link">
          <div className="settings-info">
            <h3>Notifications</h3>
            <p>Manage your notification preferences</p>
          </div>
          <FaChevronRight className="settings-chevron" />
        </Link>

        {/* Activities */}
        <Link to="/activities" className="settings-item settings-link">
          <div className="settings-info">
            <h3>Activities</h3>
            <p>View your account activity</p>
          </div>
          <FaChevronRight className="settings-chevron" />
        </Link>

        {/* Help & Support */}
        <Link to="/help" className="settings-item settings-link">
          <div className="settings-info">
            <h3>Help & Support</h3>
            <p>Get help and contact support</p>
          </div>
          <FaChevronRight className="settings-chevron" />
        </Link>

        {/* About */}
        <Link to="/about" className="settings-item settings-link">
          <div className="settings-info">
            <h3>About</h3>
            <p>Learn more about our app</p>
          </div>
          <FaChevronRight className="settings-chevron" />
        </Link>

        {/* Logout */}
        <div className="settings-item settings-link logout-item">
          <div className="settings-info">
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
          <FaSignOutAlt className="settings-chevron" />
        </div>
      </div>
      <Bottombar />
    </div>
  );
};

export default SettingsScreen;