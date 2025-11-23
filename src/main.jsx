import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'

import './styles/base/variables.css'
import './styles/base/reset.css'
import './styles/base/utilities.css'

import './styles/components/footer.css'
import './styles/components/navigation.css'
import './styles/components/buttons.css'
import './styles/components/forms.css'
import './styles/components/product-card.css'
import './styles/components/carousel.css'
import './styles/components/modal.css'
import './styles/components/skeleton.css'
import './styles/components/tags.css'

import './styles/pages/home.css'
import { ToastProvider } from './components/ToastProvider'

const GOOGLE_CLIENT_ID =
  "598991926059-89o00dcat0lvhua40ddob5vbu4qio1ht.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
