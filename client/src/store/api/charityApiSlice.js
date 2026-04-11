import { apiSlice } from './apiSlice';
import { normalizeApiList } from './apiUtils';

export const charityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCharities: builder.query({
      query: (queryArg) => {
        let params = {};

        if (typeof queryArg === 'string') {
          params = queryArg ? { search: queryArg } : {};
        } else if (queryArg && typeof queryArg === 'object') {
          params = queryArg;
        }

        return {
          url: '/charities',
          params,
        };
      },
      providesTags: (result) => {
        const charitiesList = normalizeApiList(result, 'charities');
        return [
          ...charitiesList.map(({ _id }) => ({ type: 'Charity', id: _id })),
          { type: 'Charity', id: 'LIST' }
        ];
      },
    }),
    getCharityById: builder.query({
      query: (id) => `/charities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Charity', id }],
    }),
    createCharity: builder.mutation({
      query: (data) => ({
        url: '/charities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Charity', id: 'LIST' }],
    }),
    updateCharity: builder.mutation({
      query: ({ id, data }) => ({
        url: `/charities/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Charity', id }, { type: 'Charity', id: 'LIST' }],
    }),
    deleteCharity: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Charity', id: 'LIST' }],
    }),
    toggleFeatured: builder.mutation({
      query: (id) => ({
        url: `/charities/${id}/featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Charity', id }, { type: 'Charity', id: 'LIST' }],
    }),
    addCharityEvent: builder.mutation({
      query: ({ id, event }) => ({
        url: `/charities/${id}/events`,
        method: 'POST',
        body: event,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Charity', id }, { type: 'Charity', id: 'LIST' }],
    }),
  }),
});

export const { 
  useGetCharitiesQuery, 
  useGetCharityByIdQuery,
  useCreateCharityMutation,
  useUpdateCharityMutation,
  useDeleteCharityMutation,
  useToggleFeaturedMutation,
  useAddCharityEventMutation,
} = charityApiSlice;
