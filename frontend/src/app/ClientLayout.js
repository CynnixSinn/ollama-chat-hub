'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '../state/appStore'
import App from '../pages/App'

export default function ClientLayout({ children }) {
  const initStore = useAppStore(state => state.init)

  useEffect(() => {
    initStore()
  }, [initStore])

  return (
    <div className="h-screen bg-dark-900 text-white flex overflow-hidden">
      <App />
    </div>
  )
}