'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import authService from '../lib/auth'

export default function HomePage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL
        const response = await fetch(`${API_URL}/api/v1/health`)
        const data = await response.json()
        setHealth(data)
      } catch (error) {
        console.error('Backend health check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    setIsAuthenticated(authService.isAuthenticated())
    checkBackendHealth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to EasyCart
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Build and manage your online store with ease
        </p>
        
        <div className="space-y-6">
          {isAuthenticated ? (
            <div className="space-x-4">
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  authService.logout()
                  setIsAuthenticated(false)
                }}
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/register"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
              >
                Sign In
              </Link>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-12">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            {loading ? (
              <p className="text-gray-500">Checking backend...</p>
            ) : health ? (
              <div className="text-green-600">
                <p>✓ Backend is {health.status}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Service: {health.service}
                </p>
              </div>
            ) : (
              <p className="text-red-600">✗ Backend unavailable</p>
            )}
          </div>
          
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold text-gray-800 mb-2">Easy Setup</h4>
                <p className="text-gray-600 text-sm">Create your online store in minutes with our simple setup wizard.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold text-gray-800 mb-2">Custom Themes</h4>
                <p className="text-gray-600 text-sm">Customize your store's appearance with colors and themes.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold text-gray-800 mb-2">Secure Checkout</h4>
                <p className="text-gray-600 text-sm">Built-in secure payment processing and order management.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}