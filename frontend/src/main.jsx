import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from '../src/store.js';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
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
import FollowersScreen from './screens/FollowersScreen.jsx';

import NotFound from './screens/Notfound.jsx';

// Use createRoutesFromElements for better control
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Welcome />} />
      <Route path="signup" element={<Signup />} />
      <Route path="signin" element={<Signin />} />
      
      <Route element={<Privateroute />}>
        <Route path="postform" element={<Postform />} />
        <Route path="home" element={<Homescreen />} />
        <Route path="post/:id" element={<Onepost />} />
        <Route path="anonymous/:id" element={<Oneghostpost />} />
        <Route path="profile" element={<Profilescreen />} />
        <Route path="anonymous" element={<Ghostscreen />} />
        <Route path="ghostform" element={<Ghostform />} />
        <Route path="profile/:id" element={<ProfileIdscreen />} />
        <Route path="edit-profile" element={<Editprofileform />} />
        <Route path="followers" element={<FollowersScreen />} />
      </Route>
      
      {/* Add explicit 404 route that doesn't interfere with static files */}
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  {
    // This helps with static file serving
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  }
);

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </Provider>
  </GoogleOAuthProvider>
);