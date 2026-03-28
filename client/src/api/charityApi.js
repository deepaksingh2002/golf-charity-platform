import { baseApi } from './baseApi';

export const charityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharities: builder.query({
      query: (params) => ({
        url: '/charities',
        params,
      }),
      providesTags: ['Charities'],
    }),
    getCharity: builder.query({
      query: (id) => `/charities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Charity', id }],
    }),
  }),
});

export const {
  useGetCharitiesQuery,
  useGetCharityQuery,
} = charityApi;
