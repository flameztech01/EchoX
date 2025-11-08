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
    })
})

export const {
    useCreatePostMutation,
} = postApiSlice;