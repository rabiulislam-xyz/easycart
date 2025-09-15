'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../lib/storefront'

export default function SupportPage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)

  const supportOptions = [
    {
      id: 1,
      title: "Order Issues",
      description: "Problems with your order, shipping, or delivery",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50"
    },
    {
      id: 2,
      title: "Product Questions",
      description: "Information about products, specifications, or availability",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      id: 3,
      title: "Returns & Refunds",
      description: "Return process, refund status, or exchange requests",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50"
    },
    {
      id: 4,
      title: "Account Help",
      description: "Account access, password reset, or profile updates",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      id: 5,
      title: "Technical Issues",
      description: "Website problems, app issues, or technical difficulties",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-cyan-500 to-blue-500",
      bgColor: "from-cyan-50 to-blue-50"
    },
    {
      id: 6,
      title: "General Inquiry",
      description: "Other questions or feedback about our service",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-gray-500 to-gray-600",
      bgColor: "from-gray-50 to-gray-100"
    }
  ]

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
              Support Center - {shop?.name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            How Can We Help You?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the support you need. Choose a topic below or contact us directly for personalized assistance.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option) => (
            <Link
              key={option.id}
              href={`/store/${slug}/contact`}
              className="group bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${option.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <div className={`text-transparent bg-gradient-to-r ${option.color} bg-clip-text`}>
                  {option.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {option.title}
              </h3>
              <p className="text-gray-600">
                {option.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-6 text-center">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href={`/store/${slug}/contact`}
              className="flex flex-col items-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl hover:from-indigo-100 hover:to-purple-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 text-center">Send Message</h4>
              <p className="text-sm text-gray-600 text-center mt-1">Contact our support team</p>
            </Link>

            <Link
              href={`/store/${slug}/faq`}
              className="flex flex-col items-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 text-center">View FAQ</h4>
              <p className="text-sm text-gray-600 text-center mt-1">Find instant answers</p>
            </Link>

            <div className="flex flex-col items-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 text-center">Call Us</h4>
              <p className="text-sm text-gray-600 text-center mt-1">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Hours and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Support Hours</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="font-semibold text-gray-900">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saturday</span>
                <span className="font-semibold text-gray-900">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sunday</span>
                <span className="font-semibold text-gray-900">12:00 PM - 4:00 PM</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
              <p className="text-sm text-indigo-700">
                <strong>Note:</strong> We respond to all inquiries within 2-4 hours during business hours.
              </p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Emergency Support</h3>
            <p className="text-gray-600 mb-4">
              For urgent issues outside business hours, please use our priority contact methods:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Emergency: +1 (555) 911-HELP</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">urgent@{shop?.slug}.com</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}