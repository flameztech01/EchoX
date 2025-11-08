import React from 'react'
import Navbar from '../components/Navbar'
import Viewposts from '../components/Viewposts'
import Bottombar from '../components/Bottombar'

const Homescreen = () => {
  return (
    <div className='home'>
      <Navbar />
      <Viewposts className="view-posts" />
      <Bottombar />
    </div>
  )
}

export default Homescreen
