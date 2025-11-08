import { apiSlice } from "./apiSlice";

const GHOST_URL = '/anonymous';

export const ghostApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        postAnonymous: builder.mutation({
            query: (data) => ({
                url: `${GHOST_URL}/post`,
                method: 'POST',
                body: data
            })
        }),
        getAnonymous: builder.query({
            query: () => ({
                url: `${GHOST_URL}/`,
                method: 'GET'
            })
        }),
        getOneAnonymous: builder.query({
            query: (id) => ({
                url: `${GHOST_URL}/${id}`
            })
        }),
        likeAnonymous: builder.mutation({
            query: (id) => ({
                url: `${GHOST_URL}/${id}/like`,
                method: 'PATCH'
            })
        })
     })
})

export const { usePostAnonymousMutation, useGetAnonymousQuery, useGetOneAnonymousQuery, useLikeAnonymousMutation } = ghostApiSlice;