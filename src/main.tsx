import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { loadCachedOverrides } from './i18n/texts'

loadCachedOverrides() // show the last known edited wording instantly

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
