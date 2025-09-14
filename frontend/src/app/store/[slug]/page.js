'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../lib/storefront'

export default function StorePage() {
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadShopData()
  }, [slug, searchTerm, selectedCategory])

  const loadShopData = async () => {
    try {
      setLoading(true)
      const [shopData, productsData, categoriesData] = await Promise.all([
        storefrontService.getShop(slug),
        storefrontService.getProducts(slug, {
          search: searchTerm,
          category_id: selectedCategory
        }),
        storefrontService.getCategories(slug)
      ])
      
      setShop(shopData)
      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      setError('Failed to load store: ' + error.message)
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

  const addToCart = (product) => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if product already in cart
    const existingItem = existingCart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Increase quantity
      existingItem.quantity += 1
    } else {
      // Add new item
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.media?.[0]?.url
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart))
    
    // Show success message (you could add a toast notification here)
    alert('Product added to cart!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading store...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Store not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: shop.secondary_color || '#F9FAFB' }}>
      {/* Header */}
      <header className="shadow" style={{ backgroundColor: shop.primary_color || '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
              {shop.description && (
                <p className="mt-1 text-sm text-gray-100">{shop.description}</p>
              )}
            </div>
            <Link
              href={`/store/${slug}/cart`}
              className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
            >
              🛒 Cart
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Products
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search products..."
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Filter by Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-square w-full bg-gray-200">
                    {product.media?.[0]?.url ? (
                      <img
                        src={product.media[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {product.stock > 0 ? (
                          <span className="text-green-600">{product.stock} in stock</span>
                        ) : (
                          <span className="text-red-600">Out of stock</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{shop.name}</h3>
            <p className="text-gray-300">Powered by EasyCart</p>
          </div>
        </div>
      </footer>
    </div>
  )
}