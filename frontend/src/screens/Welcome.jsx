import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="app">
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="background-video"
      >
        <source src="/welcome.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default Welcome