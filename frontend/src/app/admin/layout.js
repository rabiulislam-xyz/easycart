'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthService from '../../lib/auth'

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push('/login')
        return
      }

      const userData = AuthService.getUser()
      if (!userData || (userData.role !== 'admin' && userData.role !== 'manager')) {
        router.push('/login')
        return
      }

      setUser(userData)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    AuthService.logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Demo Electronics Store - Admin
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-600"
                >
                  Products
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-600"
                >
                  Orders
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-600"
                >
                  Settings
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/users"
                    className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-blue-600"
                  >
                    Users
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                Welcome, {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}