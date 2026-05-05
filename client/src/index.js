import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '12px',
          background: '#1A1A1A',
          color: '#fff',
        },
        success: { iconTheme: { primary: '#D4A853', secondary: '#1A1A1A' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1A1A1A' } },
      }}
    />
    <App />
  </BrowserRouter>
);