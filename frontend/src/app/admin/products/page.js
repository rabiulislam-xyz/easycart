'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import APIService from '../../../lib/api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await APIService.getProducts()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Failed to load products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await APIService.deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Failed to delete product')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
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
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">Products</h3>
          <p className="text-sm text-gray-500 mt-2">Manage your store products</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
            <div className="mt-6">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Product
              </Link>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={product.images[0].url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}