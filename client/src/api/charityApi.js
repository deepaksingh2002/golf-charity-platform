import { baseApi } from './baseApi';

export const charityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getCharities: builder.query({
      query: (params = {}) => ({
        url: '/charities',
        params,
      }),
      providesTags: ['Charities'],
    }),

    getCharity: builder.query({
      query: (id) => `/charities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Charities', id }],
    }),

    createCharity: builder.mutation({
      query: (data) => ({
        url: '/charities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Charities'],
    }),

    updateCharity: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/charities/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Charities'],
    }),

    deleteCharity: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charities'],
    }),

    toggleFeatured: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}/featured`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Charities'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetCharitiesQuery,
  useGetCharityQuery,
  useCreateCharityMutation,
  useUpdateCharityMutation,
  useDeleteCharityMutation,
  useToggleFeaturedMutation,
} = charityApi;
