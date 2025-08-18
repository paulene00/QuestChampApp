import React from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'

interface PasswordResetSuccessProps {
  onContinue: () => void
}

export function PasswordResetSuccess({ onContinue }: PasswordResetSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Updated!</h1>
            <p className="text-gray-600">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Continue to Sign In
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}