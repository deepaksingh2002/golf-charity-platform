import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store.js'
import { AppRouter } from './router/AppRouter.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <>
      <Toaster position="top-right" />
      <AppRouter />
    </>
  </Provider>,
)
