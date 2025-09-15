'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../lib/storefront'

export default function AboutPage() {
  const { slug } = useParams()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href={`/store/${slug}`} className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Store</span>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              About {shop?.name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              About Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Welcome to {shop?.name}. We&apos;re passionate about providing you with the best products and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Story</h3>
                <p className="text-gray-700">
                  Founded with a vision to bring quality products directly to our customers, {shop?.name} has grown from a small startup to a trusted online retailer. We believe in putting our customers first and delivering exceptional value.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-700">
                  To provide our customers with high-quality products, competitive prices, and outstanding customer service. We strive to make every shopping experience memorable and satisfying.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Why Choose Us?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Quality guaranteed products
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fast and reliable shipping
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    24/7 customer support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Easy returns and exchanges
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contact Information</h3>
                <p className="text-gray-700 mb-2">
                  Have questions? We&apos;d love to hear from you!
                </p>
                <Link href={`/store/${slug}/contact`} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
                  Get in touch
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/store/${slug}`}
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}