import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { CheckSquare } from 'lucide-react'

type AuthView = 'login' | 'register'

export function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center gap-12">
        {/* Hero Section */}
        <div className="hidden lg:block flex-1 max-w-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <CheckSquare className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Quest Champ</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Conquer Your Tasks, Champion Your Goals
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Transform your productivity with our powerful quest management system. 
              Create, prioritize, and conquer your daily challenges like a champion.
            </p>
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">Priority-based organization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-700">Real-time synchronization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Beautiful, responsive design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex-1 max-w-md">
          {currentView === 'login' ? (
            <LoginForm 
              onSwitchToRegister={() => setCurrentView('register')} 
            />
          ) : currentView === 'register' ? (
            <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}