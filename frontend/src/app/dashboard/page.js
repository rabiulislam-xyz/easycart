'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import authService from '../../lib/auth'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [shop, setShop] = useState(null)
  const [showShopForm, setShowShopForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    primary_color: '#3B82F6',
    secondary_color: '#64748B'
  })
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/login')
          return
        }

        const [profileData, shopData] = await Promise.all([
          authService.getProfile(),
          authService.getShop()
        ])

        setUser(profileData)
        setShop(shopData)
        
        if (!shopData) {
          setShowShopForm(true)
        }
      } catch (error) {
        setError('Failed to load data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  const handleShopSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const newShop = await authService.createShop(shopForm)
      setShop(newShop)
      setShowShopForm(false)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleShopFormChange = (e) => {
    setShopForm({
      ...shopForm,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {user && (
                <p className="mt-1 text-sm text-gray-600">
                  Welcome, {user.first_name} {user.last_name}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {showShopForm ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create Your Shop
              </h2>
              <p className="text-gray-600 mb-6">
                Let's set up your online store. You can customize it later.
              </p>
              
              <form onSubmit={handleShopSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={shopForm.name}
                    onChange={handleShopFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your shop name"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={shopForm.description}
                    onChange={handleShopFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your shop..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      id="primary_color"
                      name="primary_color"
                      value={shopForm.primary_color}
                      onChange={handleShopFormChange}
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      id="secondary_color"
                      name="secondary_color"
                      value={shopForm.secondary_color}
                      onChange={handleShopFormChange}
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
                  >
                    Create Shop
                  </button>
                </div>
              </form>
            </div>
          ) : shop ? (
            <>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Shop
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Shop Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{shop.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Shop URL</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a 
                            href={`/store/${shop.slug}`} 
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            /store/{shop.slug}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900">{shop.description || 'No description'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Theme Colors</h3>
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: shop.primary_color }}
                        ></div>
                        <p className="text-xs text-gray-600">Primary</p>
                      </div>
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: shop.secondary_color }}
                        ></div>
                        <p className="text-xs text-gray-600">Secondary</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Shop created on {new Date(shop.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/dashboard/products"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
                  <p className="text-gray-600 text-sm">Manage your product catalog, inventory, and pricing.</p>
                </Link>
                
                <Link
                  href="/dashboard/orders"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
                  <p className="text-gray-600 text-sm">View and manage customer orders and fulfillment.</p>
                </Link>
                
                <Link
                  href={`/store/${shop.slug}`}
                  target="_blank"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Store</h3>
                  <p className="text-gray-600 text-sm">See how your store looks to customers.</p>
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}