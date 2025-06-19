import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error("Root element not found. Check your index.html")
}

// Add temporary debug styling
rootElement.style.backgroundColor = 'yellow'
rootElement.style.padding = '20px'
rootElement.innerHTML += '<p>Temporary debug marker</p>'

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)