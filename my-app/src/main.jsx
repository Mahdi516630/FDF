import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './referee-manager-fdf-v2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
