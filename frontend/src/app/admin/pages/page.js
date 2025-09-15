'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPages() {
  const [pages, setPages] = useState([
    {
      id: 'about',
      title: 'About Us',
      slug: 'about',
      content: 'Learn more about our company and mission.',
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'contact',
      title: 'Contact Us',
      slug: 'contact',
      content: 'Get in touch with our customer service team.',
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'faq',
      title: 'FAQ',
      slug: 'faq',
      content: 'Frequently asked questions and answers.',
      is_active: true,
      updated_at: new Date().toISOString()
    },
    {
      id: 'support',
      title: 'Support',
      slug: 'support',
      content: 'Get help and support for your orders.',
      is_active: true,
      updated_at: new Date().toISOString()
    }
  ])

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">Static Pages</h3>
          <p className="text-sm text-gray-500 mt-2">Manage your website&apos;s static content</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Page
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                    <div className="text-sm text-gray-500">{page.content.substring(0, 60)}...</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  /{page.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    page.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {page.is_active ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(page.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/${page.slug}`}
                    target="_blank"
                    className="text-green-600 hover:text-green-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}