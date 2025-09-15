'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../lib/storefront'

export default function CheckoutPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [shop, setShop] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'US',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    try {
      // Load shop data
      const shopData = await storefrontService.getShop(slug)
      setShop(shopData)
      
      // Load cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)

      // Redirect if cart is empty
      if (cart.length === 0) {
        router.push(`/store/${slug}/cart`)
        return
      }
    } catch (error) {
      setError('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Prepare order data
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      }

      // Create order
      const order = await storefrontService.createOrder(slug, orderData)

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]))

      // Redirect to success page
      router.push(`/store/${slug}/order/${order.id}`)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading checkout...</div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Store not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href={`/store/${slug}/cart`} className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors group">
                <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="font-medium">Back to Cart</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Checkout
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-red-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-3xl p-8 border border-white/20 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                    Shipping Information
                  </h2>
                </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      required
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-white/90 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      name="customer_email"
                      required
                      value={formData.customer_email}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-white/90 transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="shipping_address"
                    name="shipping_address"
                    required
                    value={formData.shipping_address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      id="shipping_city"
                      name="shipping_city"
                      required
                      value={formData.shipping_city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="shipping_state"
                      name="shipping_state"
                      value={formData.shipping_state}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_zip" className="block text-sm font-medium text-gray-700">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="shipping_zip"
                      name="shipping_zip"
                      required
                      value={formData.shipping_zip}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shipping_country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="shipping_country"
                    name="shipping_country"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Order Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Any special instructions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Place Order</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-3xl p-8 border border-white/20 sticky top-32 relative overflow-hidden">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-2xl opacity-40"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                    Order Summary
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden ring-2 ring-white/50 shadow-sm">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-indigo-400 text-xs">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-600 bg-indigo-50 px-2 py-1 rounded-full inline-block">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/30">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(calculateSubtotal())}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-200/30">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 text-blue-500 mt-0.5">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">
                        This is a demo checkout. No payment will be processed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}