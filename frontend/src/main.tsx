import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from '../ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallback={<div>Something went wrong. Please refresh.</div>}>
    <StrictMode>
      <App />
    </StrictMode>
  </ErrorBoundary>
)
