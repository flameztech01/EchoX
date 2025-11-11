// services/facebookAuthService.js

// Facebook helper function
const getFacebookUserInfo = async (accessToken) => {
  const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user info from Facebook');
  }
  const userInfo = await response.json();
  return userInfo;
};

// Process Facebook Auth
export const processFacebookAuth = async (facebookToken) => {
  const userInfo = await getFacebookUserInfo(facebookToken);
  
  const facebookId = userInfo.id;
  const email = userInfo.email;
  const name = userInfo.name;
  const picture = userInfo.picture?.data?.url || '';

  if (!email) {
    throw new Error('Email permission is required for Facebook login');
  }

  return { facebookId, email, name, picture };
};