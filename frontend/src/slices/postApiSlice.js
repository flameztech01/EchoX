import { apiSlice } from "./apiSlice";

const POST_URL = '/post'

export const postApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createPost: builder.mutation({
            query: (formData) => ({
                url: `${POST_URL}/upload`,
                method: 'POST',
                body: formData
            })
        }),
        getPosts: builder.query({
            query: () => ({
                url: `${POST_URL}/`,
                method: 'GET',
            })
        }),
        getOnePost: builder.query({
            query: (id) => ({
                url: `${POST_URL}/${id}`,
                method: 'GET'
            })
        }),
        likePost: builder.mutation({
            query: (id) => ({
                url: `${POST_URL}/${id}/like`,
                method: 'PATCH'
            })
        }),
        getUserPost: builder.query({
            query: (userId) => ({
                url: `${POST_URL}/user-post/${userId}`,
                method: 'GET'
            })
        }),
        getPostsByUser: builder.query({
            query: (id) => ({
                url: `${POST_URL}/user-post`,
                method: 'GET'
            })
        }),
    })
})

export const {
    useCreatePostMutation,
    useGetPostsQuery,
    useGetOnePostQuery,
    useLikePostMutation,
    useGetUserPostQuery,
} = postApiSlice;