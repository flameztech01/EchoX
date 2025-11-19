import React from "react";
import { Link, useNavigate } from "react-router-dom";

const SearchNav = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="postform_header">
      <Link to="#" onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </Link>
      <h2>SEARCH</h2>
    </div>
  );
};

export default SearchNav;