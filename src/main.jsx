import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProductsProvider>
      <App />
    </ProductsProvider>
  </StrictMode>,
)
