import React from 'react'
import Postnav from '../components/Postnav.jsx';
import Ghostid from '../components/Ghostid.jsx';
import Ghostcommentform from '../components/Ghostcommentform.jsx';
import Ghostcomment from '../components/Ghostcomment.jsx';

const Oneghostpost = () => {
  return (
    <div>
      <Postnav />
      <Ghostid />
      <Ghostcomment />
      <Ghostcommentform isAnonymous={ true } />
    </div>
  )
}

export default Oneghostpost
