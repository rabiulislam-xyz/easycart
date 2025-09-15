'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../lib/storefront'

export default function FAQPage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqs = [
    {
      id: 1,
      question: "How do I place an order?",
      answer: "Simply browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping information and complete the payment process."
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and other secure payment methods. All transactions are processed securely using industry-standard encryption."
    },
    {
      id: 3,
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. We also offer expedited shipping options for faster delivery. You'll receive a tracking number once your order ships."
    },
    {
      id: 4,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be in original condition and packaging. Contact our support team to initiate a return."
    },
    {
      id: 5,
      question: "Do you ship internationally?",
      answer: "Yes, we ship to many countries worldwide. Shipping costs and delivery times vary by location. International orders may be subject to customs duties and taxes."
    },
    {
      id: 6,
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive an email with tracking information. You can also check your order status by contacting our customer service team."
    },
    {
      id: 7,
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order within 1 hour of placing it. After that, please contact our customer service team as soon as possible for assistance."
    },
    {
      id: 8,
      question: "Are your products covered by warranty?",
      answer: "Yes, most of our products come with manufacturer warranties. Warranty terms vary by product. Check the product description for specific warranty information."
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

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
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
              FAQ - {shop?.name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about shopping, shipping, returns, and more.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between text-left py-4 px-2 hover:bg-gray-50/50 rounded-xl transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 transition-transform duration-200 ${openFAQ === faq.id ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {openFAQ === faq.id && (
                  <div className="px-2 pb-4 pt-2">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6">
                Can&apos;t find the answer you&apos;re looking for? Don&apos;t hesitate to reach out to our customer support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/store/${slug}/contact`}
                  className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Link>
                <Link
                  href={`/store/${slug}/support`}
                  className="inline-flex items-center bg-white/70 border border-indigo-200 text-indigo-600 px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                  Support Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}