import React, { useState, useEffect } from 'react'
import { useGetUserProfileQuery } from '../slices/userApiSlice.js'
import { useSelector } from 'react-redux'

const ThemeProvider = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth)
  const { data: currentUser } = useGetUserProfileQuery(undefined, {
    skip: !userInfo // Only fetch if user is logged in
  })

  useEffect(() => {
    const initializeTheme = () => {
      let theme = 'light' // Default to light
      
      // Priority: 1. Backend preference, 2. localStorage, 3. System preference
      if (userInfo && currentUser?.darkMode !== undefined) {
        // Use backend preference for logged-in users
        theme = currentUser.darkMode ? 'dark' : 'light'
      } else {
        // For logged-out users, use localStorage or system preference
        const savedTheme = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        if (savedTheme) {
          theme = savedTheme
        } else if (prefersDark) {
          theme = 'dark'
        }
      }
      
      // Apply the theme
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }

    initializeTheme()
  }, [userInfo, currentUser])

  return <>{children}</>
}

export default ThemeProvider