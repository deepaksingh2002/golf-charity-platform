import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './index.css';

// Router
import { router } from './router';

// Mock Data Seeding
import { mockUsers, mockCharities, mockScores, mockDraws } from './data/mockData';
const seed = (key, data) => {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};
seed('golf_mock_users', mockUsers);
seed('golf_mock_charities', mockCharities);
seed('golf_mock_scores', mockScores);
seed('golf_mock_draws', mockDraws);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
