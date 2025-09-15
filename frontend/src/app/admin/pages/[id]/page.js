'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id

  const [page, setPage] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadPage()
  }, [pageId])

  const loadPage = async () => {
    try {
      setLoading(true)

      // Mock data for static pages - in a real app this would come from an API
      const mockPages = {
        'about': {
          title: 'About Us',
          slug: 'about',
          content: `# About Demo Electronics Store

Welcome to Demo Electronics Store, your premier destination for cutting-edge technology and electronics. Since our founding, we have been committed to bringing you the latest and greatest in consumer electronics at competitive prices.

## Our Mission

Our mission is to provide high-quality electronics and exceptional customer service to tech enthusiasts, professionals, and everyday consumers alike.

## What We Offer

- Latest smartphones and mobile devices
- High-performance laptops and computers
- Premium audio equipment and headphones
- Tablets and e-readers
- And much more!

## Why Choose Us

- Competitive prices
- Fast and reliable shipping
- Expert customer support
- Quality guarantee on all products

Contact us today to learn more about our products and services!`,
          meta_title: 'About Us - Demo Electronics Store',
          meta_description: 'Learn about Demo Electronics Store, your trusted source for the latest technology and electronics.',
          is_active: true
        },
        'contact': {
          title: 'Contact Us',
          slug: 'contact',
          content: `# Contact Demo Electronics Store

We're here to help! Get in touch with us using any of the methods below.

## Customer Service

**Phone:** 1-800-DEMO-TECH (1-800-336-6832)
**Email:** support@demoelectronics.com
**Hours:** Monday - Friday, 9 AM - 6 PM EST

## Store Address

Demo Electronics Store
123 Technology Boulevard
Tech City, TC 12345
United States

## Quick Contact Form

For quick inquiries, please use our contact form and we'll get back to you within 24 hours.

## Returns & Exchanges

Need to return or exchange an item? Contact our customer service team and we'll walk you through the process.

## Wholesale Inquiries

Interested in wholesale pricing? Email us at wholesale@demoelectronics.com for bulk pricing information.`,
          meta_title: 'Contact Us - Demo Electronics Store',
          meta_description: 'Get in touch with Demo Electronics Store customer service for support, returns, and inquiries.',
          is_active: true
        },
        'faq': {
          title: 'Frequently Asked Questions',
          slug: 'faq',
          content: `# Frequently Asked Questions

## Shipping & Delivery

**Q: How long does shipping take?**
A: Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.

**Q: Do you ship internationally?**
A: Currently we only ship within the United States.

**Q: What are the shipping costs?**
A: Shipping costs vary by location and item weight. Free shipping on orders over $50.

## Returns & Exchanges

**Q: What is your return policy?**
A: We accept returns within 30 days of purchase for a full refund.

**Q: How do I initiate a return?**
A: Contact our customer service team to receive a return authorization number.

## Payment & Pricing

**Q: What payment methods do you accept?**
A: We accept all major credit cards, PayPal, and digital wallets.

**Q: Do you offer price matching?**
A: Yes, we offer price matching on identical items from authorized retailers.

## Product Information

**Q: Are all products covered by warranty?**
A: Yes, all products come with manufacturer warranty. Extended warranties available.

**Q: Do you sell refurbished items?**
A: We only sell brand new items directly from manufacturers.`,
          meta_title: 'FAQ - Demo Electronics Store',
          meta_description: 'Find answers to frequently asked questions about shipping, returns, payments and more.',
          is_active: true
        },
        'support': {
          title: 'Customer Support',
          slug: 'support',
          content: `# Customer Support

We're committed to providing exceptional customer support before, during, and after your purchase.

## How We Can Help

### Pre-Sales Support
- Product recommendations
- Technical specifications
- Compatibility questions
- Pricing inquiries

### Order Support
- Order status updates
- Shipping tracking
- Delivery modifications
- Payment assistance

### Post-Sales Support
- Installation guidance
- Troubleshooting help
- Warranty claims
- Return processing

## Support Channels

### Live Chat
Available on our website Monday-Friday, 9 AM - 6 PM EST

### Phone Support
**Customer Service:** 1-800-DEMO-TECH
**Technical Support:** 1-800-TECH-HELP

### Email Support
**General:** support@demoelectronics.com
**Technical:** tech@demoelectronics.com
**Returns:** returns@demoelectronics.com

### Self-Service
- Order tracking portal
- Knowledge base
- Video tutorials
- Product manuals

## Response Times

- Live Chat: Immediate
- Phone: No wait time
- Email: Within 4 hours
- Returns: Same day processing

## Technical Support

Our certified technicians can help with:
- Product setup and installation
- Troubleshooting issues
- Software configuration
- Hardware compatibility

Need help? We're here for you!`,
          meta_title: 'Customer Support - Demo Electronics Store',
          meta_description: 'Get comprehensive customer support for your electronics purchases. Multiple support channels available.',
          is_active: true
        }
      }

      const pageData = mockPages[pageId]
      if (pageData) {
        setPage(pageData)
      } else {
        setError('Page not found')
      }
    } catch (err) {
      console.error('Failed to load page:', err)
      setError('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // In a real app, this would save to an API
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Page saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setPage({
      ...page,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/admin/pages" className="hover:text-blue-600">Pages</Link>
          <span>/</span>
          <span>Edit Page</span>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">Edit Page</h3>
        <p className="text-sm text-gray-500 mt-2">Update page content and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Page Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={page.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={page.slug}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">URL: /{page.slug}</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={20}
                required
                value={page.content}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="You can use Markdown formatting here..."
              />
              <p className="mt-1 text-sm text-gray-500">Supports Markdown formatting</p>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">SEO Settings</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={page.meta_title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                rows={3}
                value={page.meta_description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Settings</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={page.is_active}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Page is published
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between">
          <Link
            href="/admin/pages"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md text-sm font-medium"
          >
            Cancel
          </Link>
          <div className="flex space-x-3">
            <Link
              href={`/${page.slug}`}
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
            >
              Preview
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}