import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">
          <div className="icon-circle">
            <span className="icon-text">404</span>
          </div>
        </div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-message">
          Oops! The page you're looking for seems to have wandered off into the
          digital void. Decide below
        </p>
        <div className="notfound-actions">
          <Link to="/home" className="notfound-button primary">
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="notfound-button secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
