import {Navigate, Outlet} from 'react-router-dom'
import {useSelector} from 'react-redux'
import React from 'react'

const Privateroute = () => {
    const {userInfo} = useSelector((state) => state.auth);


  return userInfo ? <Outlet/> : <Navigate to ="/signin"/>;
}

export default Privateroute;
