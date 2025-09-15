'use client'
import { useState, useEffect } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    currency: 'USD',
    tax_rate: '',
    shipping_rate: '',
    theme_color: '#3B82F6',
    meta_title: '',
    meta_description: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load settings')
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError('Failed to load settings')
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
      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...settings,
          tax_rate: settings.tax_rate ? parseFloat(settings.tax_rate) : 0,
          shipping_rate: settings.shipping_rate ? parseInt(settings.shipping_rate * 100) : 0
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      [name]: value
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
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Store Settings</h3>
        <p className="text-sm text-gray-500 mt-2">Manage your store configuration and preferences</p>
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

        {/* Store Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Store Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={settings.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Store Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={settings.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Store Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={settings.state}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={settings.zip_code}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={settings.country}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Business Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="tax_rate"
                name="tax_rate"
                min="0"
                max="100"
                step="0.01"
                value={settings.tax_rate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="shipping_rate" className="block text-sm font-medium text-gray-700">
                Default Shipping Rate ($)
              </label>
              <input
                type="number"
                id="shipping_rate"
                name="shipping_rate"
                min="0"
                step="0.01"
                value={settings.shipping_rate}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Theme</h3>

          <div>
            <label htmlFor="theme_color" className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <input
              type="color"
              id="theme_color"
              name="theme_color"
              value={settings.theme_color}
              onChange={handleChange}
              className="mt-1 h-10 w-20 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* SEO */}
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
                value={settings.meta_title}
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
                value={settings.meta_description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Social Media</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700">
                Facebook URL
              </label>
              <input
                type="url"
                id="facebook_url"
                name="facebook_url"
                value={settings.facebook_url}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700">
                Instagram URL
              </label>
              <input
                type="url"
                id="instagram_url"
                name="instagram_url"
                value={settings.instagram_url}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                Twitter URL
              </label>
              <input
                type="url"
                id="twitter_url"
                name="twitter_url"
                value={settings.twitter_url}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}