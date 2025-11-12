import { apiSlice } from "./apiSlice.js";

const USER_URL = "/users";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),

    googleAuth: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/google`,
        method: "POST",
        body: data,
      }),
    }),

    facebookAuth: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/facebook`,
        method: "POST",
        body: data,
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: `${USER_URL}/profile`,
        method: "GET",
      }),
    }),

    getOneUserProfile: builder.query({
      query: (id) => ({
        url: `${USER_URL}/profile/${id}`,
        method: "GET",
      }),
    }),

    updateProfile: builder.mutation({
      query: (formData) => ({
        url: `${USER_URL}/update-profile`,
        method: "PUT",
        body: formData,
      }),
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: `${USER_URL}/logout`,
        method: "POST",
      }),
    }),

    // Follow/Unfollow endpoints
    followUser: builder.mutation({
      query: (id) => ({
        url: `${USER_URL}/follow/${id}`,
        method: "POST",
      }),
    }),

    unfollowUser: builder.mutation({
      query: (id) => ({
        url: `${USER_URL}/unfollow/${id}`,
        method: "POST",
      }),
    }),

    getFollowers: builder.query({
      query: (id) => ({
        url: `${USER_URL}/followers/${id || ""}`, // Handle optional parameter
        method: "GET",
      }),
    }),

    getFollowing: builder.query({
      query: (id) => ({
        url: `${USER_URL}/following/${id || ""}`, // Handle optional parameter
        method: "GET",
      }),
    }),

    getFollowStats: builder.query({
      query: (id) => ({
        url: `${USER_URL}/follow-stats/${id || ""}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleAuthMutation,
  useFacebookAuthMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
  useGetOneUserProfileQuery,
  useUpdateProfileMutation,
  useLogoutUserMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetFollowStatsQuery,
} = userApiSlice;
