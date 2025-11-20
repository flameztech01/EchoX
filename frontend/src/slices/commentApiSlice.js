import { apiSlice } from "./apiSlice";

const COMMENT_URL = "/comments";

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Reply/Add comments
    replyComment: builder.mutation({
      query: (data) => ({
        url: `${COMMENT_URL}/reply`,
        method: "POST",
        body: data,
      }),
    }),
    getComments: builder.query({
      query: (postId) => ({
        url: `${COMMENT_URL}/post/${postId}`,
        method: "GET",
      }),
    }),

    getCommentThread: builder.query({
      query: (commentId) => ({
        url: `${COMMENT_URL}/comment/${commentId}`,
        method: "GET",
      }),
    }),

    likeComment: builder.mutation({
      query: (id) => ({
        url: `${COMMENT_URL}/${id}/like`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useReplyCommentMutation,
  useGetCommentsQuery,
  useGetCommentThreadQuery,
  useLikeCommentMutation,
} = commentApiSlice;
