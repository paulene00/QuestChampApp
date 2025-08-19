import React from 'react'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './components/Auth/AuthPage'
import { ResetPasswordForm } from './components/Auth/ResetPasswordForm'
import { PasswordResetSuccess } from './components/Auth/PasswordResetSuccess'
import { Dashboard } from './components/Dashboard/Dashboard'
import { supabase } from './lib/supabase'

function App() {
  const { user, loading } = useAuth()
  const [showResetSuccess, setShowResetSuccess] = React.useState(false)
  const [isPasswordReset, setIsPasswordReset] = React.useState(false)

  useEffect(() => {
    // Handle password reset URL fragments
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      
      if (type === 'recovery' || window.location.hash.includes('type=recovery')) {
        setIsPasswordReset(true)
        // Clear the URL fragments
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    handleAuthCallback()
  }, [])

  // Check if we're on the password reset page
  const isResetPasswordPage = window.location.pathname === '/reset-password' || isPasswordReset

  // Show connection message if Supabase is not configured
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h1>
          <p className="text-gray-600 mb-6">
            To use this application, please click "Connect to Supabase" in the top right corner to set up your database connection.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Quest Champ</strong> - A comprehensive task management application with real-time updates, user authentication, and priority-based organization.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle password reset flow
  if (isResetPasswordPage) {
    if (showResetSuccess) {
      return <PasswordResetSuccess onContinue={() => {
        setShowResetSuccess(false)
        setIsPasswordReset(false)
        window.history.pushState({}, '', '/')
      }} />
    }
    return <ResetPasswordForm onSuccess={() => {
      setShowResetSuccess(true)
      setIsPasswordReset(false)
    }} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthPage />
}

export default App