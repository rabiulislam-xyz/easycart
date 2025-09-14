'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../../lib/storefront'

export default function OrderConfirmationPage() {
  const { slug, orderId } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShopData()
  }, [slug])

  const loadShopData = async () => {
    try {
      const shopData = await storefrontService.getShop(slug)
      setShop(shopData)
    } catch (error) {
      console.error('Failed to load shop:', error)
    } finally {
      setLoading(false)
    }
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href={`/store/${slug}`} className="text-indigo-600 hover:text-indigo-500 mr-4">
                ← Back to {shop?.name || 'Store'}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your order!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been received and is being processed.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-semibold text-gray-900">{orderId}</p>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <p>✅ Order confirmation email will be sent shortly</p>
              <p>📦 Processing time: 1-3 business days</p>
              <p>🚚 Shipping: 3-7 business days</p>
            </div>

            <div className="mt-8 space-x-4">
              <Link
                href={`/store/${slug}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                * This is a demo order confirmation. No actual payment was processed or order fulfilled.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}