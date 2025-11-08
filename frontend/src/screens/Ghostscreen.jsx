import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Anonymous from '../components/Anonymous.jsx'
import Bottombar from '../components/Bottombar.jsx'
import Ghostbtn from '../components/Ghostbtn.jsx'

const Ghostscreen = () => {
  return (
    <div>
        <Navbar />
      <Anonymous />
      <Ghostbtn />
      <Bottombar />
    </div>
  )
}

export default Ghostscreen
