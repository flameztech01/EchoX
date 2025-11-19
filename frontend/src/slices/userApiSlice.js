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

    sendOtp: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/verify-otp`,
        method: "POST",
        body: data,
      }),
    }),

    resendOtp: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/resend-otp`,
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

    // Add this mutation
    updateDarkMode: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/dark-mode`,
        method: "PUT",
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

    // In your userApiSlice.js
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    verifyResetOTP: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/verify-reset-otp`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    resendResetOTP: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/resend-reset-otp`,
        method: "POST",
        body: data,
      }),
    }),

    // Delete User
    // In userApiSlice.js - add this to endpoints
    deleteUser: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/delete`,
        method: "DELETE",
        body: data,
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

    // In your userApiSlice.js
    search: builder.query({
      query: ({ query, type = "all", page = 1, limit = 10 }) => ({
        url: `${USER_URL}/search`,
        params: { query, type, page, limit },
      }),
      providesTags: ["Search"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleAuthMutation,
  useFacebookAuthMutation,
  useSendOtpMutation,
  useResendOtpMutation,
  useRegisterMutation,
  useUpdateDarkModeMutation,
  useGetUserProfileQuery,
  useGetOneUserProfileQuery,
  useUpdateProfileMutation,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetOTPMutation,
  useResetPasswordMutation,
  useVerifyResetOTPMutation,
  useResendResetOTPMutation,
  useDeleteUserMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetFollowStatsQuery,
  useSearchQuery,
} = userApiSlice;
