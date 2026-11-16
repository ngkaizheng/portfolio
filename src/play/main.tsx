import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/syne'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '../index.css'
import './play.css'
import Play from './Play'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Play />
  </StrictMode>,
)
