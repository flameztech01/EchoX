import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from '../src/store.js';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';

import Welcome from './screens/Welcome.jsx';
import Signup from './screens/Signup.jsx';
import Signin from './screens/Signin.jsx';
import Postform from './screens/Postform.jsx';
import Homescreen from './screens/Homescreen.jsx';
import Onepost from './screens/Onepost.jsx';
import Oneghostpost from './screens/Oneghostpost.jsx';
import Profilescreen from './screens/Profilescreen.jsx';
import Ghostscreen from './screens/Ghostscreen.jsx';
import Privateroute from './components/Privateroute.jsx';
import Ghostform from './screens/Ghostform.jsx';
import ProfileIdscreen from './screens/ProfileIdscreen.jsx';
import Editprofileform from './screens/Editprofileform.jsx';

const router = createBrowserRouter([
  {path: '/', element: <App />, children: [
    {index: true, element: <Welcome />},
    {path: 'signup', element: <Signup /> },
    {path: 'signin', element: <Signin />},
    
    {element: <Privateroute />, children: [
      {path: 'postform', element: <Postform />},
    {path: '/home', element: <Homescreen />},
    {path: 'post/:id', element: <Onepost />},
    {path: 'anonymous/:id', element: <Oneghostpost />},
    {path: 'profile', element: <Profilescreen />},
    {path: 'anonymous', element: <Ghostscreen />},
    {path: 'ghostform', element: <Ghostform />},
    {path: '/profile/:id', element: <ProfileIdscreen />},
    {path: 'edit-profile', element: <Editprofileform />},
    ]},
  ]}
])

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </Provider>
  </GoogleOAuthProvider>
)