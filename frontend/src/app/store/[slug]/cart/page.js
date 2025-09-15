'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../lib/storefront'

export default function CartPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [shop, setShop] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShopAndCart()
  }, [slug])

  const loadShopAndCart = async () => {
    try {
      setLoading(true)
      const shopData = await storefrontService.getShop(slug)
      setShop(shopData)
      
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(cartData)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId)
      return
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    // For demo purposes, no tax or shipping
    return subtotal
  }

  const proceedToCheckout = () => {
    if (cart.length === 0) return
    router.push(`/store/${slug}/checkout`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading cart...</div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl">Store not found</div>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href={`/store/${slug}`} className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors group">
              <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium">Back to Store</span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {shop.name}
              </h1>
              <p className="text-sm text-gray-600 font-medium">Shopping Cart</p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-100 rounded-full blur-3xl opacity-30 w-48 h-48 mx-auto"></div>
              <div className="relative bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-white/20">
                <div className="text-indigo-400 mb-6">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                  Your cart is empty
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven&apos;t added anything to your cart yet. Discover amazing products!
                </p>
                <Link
                  href={`/store/${slug}`}
                  className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                        Shopping Cart
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Review your items before checkout</p>
                    </div>
                    <button
                      onClick={clearCart}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear Cart</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="group bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl p-4 hover:bg-white/70 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden ring-2 ring-white/50 shadow-sm">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">{item.name}</h3>
                          <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 bg-white/80 rounded-2xl p-2 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 flex items-center justify-center text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="font-bold text-gray-900 w-8 text-center bg-indigo-50 py-1 rounded-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 flex items-center justify-center text-green-600 hover:text-green-700 transition-all duration-200 hover:scale-110"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sticky top-28 relative overflow-hidden">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-2xl opacity-40"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-6">
                    Order Summary
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                      <span className="text-gray-600">Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                      <span className="font-semibold text-gray-900">{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50/70 rounded-xl">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50/70 rounded-xl">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold text-gray-900">$0.00</span>
                    </div>
                    <div className="border-t border-white/30 pt-4">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span>Proceed to Checkout</span>
                    </div>
                  </button>

                  <Link
                    href={`/store/${slug}`}
                    className="w-full bg-white/70 backdrop-blur-sm text-gray-700 py-3 rounded-2xl text-center font-medium hover:bg-white/90 transition-all duration-200 block border border-white/30 hover:shadow-lg"
                  >
                    Continue Shopping
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-white/30">
                    <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-600">
                      <div className="p-3 bg-green-50/70 rounded-xl">
                        <div className="w-8 h-8 mx-auto mb-2 p-1 bg-green-100 rounded-full">
                          <svg className="w-full h-full text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="font-medium">Secure Payment</div>
                      </div>
                      <div className="p-3 bg-blue-50/70 rounded-xl">
                        <div className="w-8 h-8 mx-auto mb-2 p-1 bg-blue-100 rounded-full">
                          <svg className="w-full h-full text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div className="font-medium">Free Returns</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}