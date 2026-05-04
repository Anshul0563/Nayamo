import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { SpeedInsights } from '@vercel/speed-insights/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgb(10,10,12)',
          color: '#FAFAFA',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    />
    <SpeedInsights />
  </React.StrictMode>,
)

