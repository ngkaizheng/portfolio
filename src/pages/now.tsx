import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/syne'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '../index.css'
import './pages.css'
import { nowPage } from '../data/content'
import InfoPage from './InfoPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InfoPage page={nowPage} />
  </StrictMode>,
)
