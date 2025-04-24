import React from 'react';                        // ✅ make sure React is imported
import ReactDOM from 'react-dom/client';           // ✅ 
import { BrowserRouter } from 'react-router-dom';  // ✅ 
import App from './App';                          // ✅ 
// import StripeProvider from './StripeProvider';    // ✅ 
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function      