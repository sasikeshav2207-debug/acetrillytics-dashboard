import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// SPA deep-link restore: public/404.html bounces unknown paths to /?redirect=<path>.
// Rewrite the URL to the real path BEFORE BrowserRouter mounts so it routes correctly.
const _redirect = new URLSearchParams(window.location.search).get('redirect')
if (_redirect) window.history.replaceState(null, '', _redirect)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
