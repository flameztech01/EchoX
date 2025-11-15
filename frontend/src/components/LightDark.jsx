import React, { useState, useEffect } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useUpdateDarkModeMutation, useGetUserProfileQuery } from '../slices/userApiSlice.js'
import { useSelector } from 'react-redux'

const LightDark = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { data: currentUser, refetch } = useGetUserProfileQuery()
  const [updateDarkMode] = useUpdateDarkModeMutation()
  
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sync with current theme on mount
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    setIsDarkMode(currentTheme === 'dark')
  }, [])

  const toggleTheme = async () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    
    // Update UI immediately
    const themeValue = newTheme ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', themeValue)
    localStorage.setItem('theme', themeValue)
    
    // Save to backend if user is logged in
    if (userInfo) {
      try {
        await updateDarkMode({ darkMode: newTheme }).unwrap()
        refetch() // Refresh user data
      } catch (error) {
        console.error('Failed to save theme preference:', error)
        // Revert if save fails
        const revertTheme = !newTheme ? 'dark' : 'light'
        setIsDarkMode(!newTheme)
        document.documentElement.setAttribute('data-theme', revertTheme)
      }
    }
  }

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle settings-toggle"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FaSun className="theme-icon" />
      ) : (
        <FaMoon className="theme-icon" />
      )}
    </button>
  )
}

export default LightDark