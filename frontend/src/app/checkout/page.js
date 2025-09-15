'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../lib/storefront'

export default function CheckoutPage() {
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
  }, [])

  const loadData = async () => {
    try {
      // Load shop data
      const shopData = await storefrontService.getShop()
      setShop(shopData)

      // Load cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItems(cart)

      // Redirect if cart is empty
      if (cart.length === 0) {
        router.push('/cart')
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
      const order = await storefrontService.createOrder(orderData)

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]))

      // Redirect to success page
      router.push(`/order/${order.id}`)
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

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    // For now, no tax or shipping calculations
    return subtotal
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                {shop?.name || 'Demo Electronics Store'}
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/cart" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Cart ({cartItems.length})
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order below</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Order form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      required
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      name="customer_email"
                      required
                      value={formData.customer_email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>

                <div className="grid grid-cols-1 gap-6">
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="shipping_state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="shipping_state"
                        name="shipping_state"
                        value={formData.shipping_state}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="shipping_zip" className="block text-sm font-medium text-gray-700">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        id="shipping_zip"
                        name="shipping_zip"
                        required
                        value={formData.shipping_zip}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h2>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special delivery instructions or notes..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">{formatPrice(item.price)}</p>
                          </div>
                          {item.category && (
                            <p className="mt-1 text-sm text-gray-500">{item.category.name}</p>
                          )}
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatPrice(calculateSubtotal())}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                  <p>Total</p>
                  <p>{formatPrice(calculateTotal())}</p>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Shipping and taxes will be calculated at delivery
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  form="checkout-form"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>

                <Link
                  href="/cart"
                  className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center block"
                >
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}