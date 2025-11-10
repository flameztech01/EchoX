import { apiSlice } from './apiSlice.js';

const USER_URL = '/users';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      login: builder.mutation({
        query: (data) => ({
            url: `${USER_URL}/login`,
            method: 'POST',
            body: data
        })
      }),
      
      googleAuth: builder.mutation({
        query: (data) => ({
          url: `${USER_URL}/google`,
          method: 'POST',
          body: data
        })
      }),

      register: builder.mutation({
        query: (data) => ({
            url: `${USER_URL}/register`,
            method: 'POST',
            body: data
        })
      }),

      getUserProfile: builder.query({
        query: () => ({
            url: `${USER_URL}/profile`,
            method: 'GET'
        })
      }),

      getOneUserProfile: builder.query({
        query: (id) => ({
          url: `${USER_URL}/profile/${id}`,
          method: 'GET'
        })
      }),

      updateProfile: builder.mutation({
        query: (formData) => ({
            url: `${USER_URL}/update-profile`,
            method: 'PUT',
            body: formData
        })
      }),

      logoutUser: builder.mutation({
        query: () => ({
            url: `${USER_URL}/logout`,
            method: 'POST'
        })
      })
    }),
});

export const {useLoginMutation, 
  useGoogleAuthMutation,
    useRegisterMutation, 
    useGetUserProfileQuery, 
    useGetOneUserProfileQuery,
    useUpdateProfileMutation, 
    useLogoutUserMutation } = userApiSlice;