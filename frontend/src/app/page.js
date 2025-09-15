'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import storefrontService from '../lib/storefront'

export default function HomePage() {
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Hero slider images
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Latest Electronics',
      subtitle: 'Discover cutting-edge technology at unbeatable prices',
      cta: 'Shop Now'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80',
      title: 'Premium Audio',
      subtitle: 'Immerse yourself in crystal-clear sound quality',
      cta: 'Explore Audio'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Smart Home Solutions',
      subtitle: 'Transform your home with intelligent automation',
      cta: 'Browse Smart Home'
    }
  ]

  useEffect(() => {
    loadShopData()
    updateCartCount()
  }, [searchTerm, selectedCategory])

  // Auto-advance hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Scroll detection for modern header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadShopData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load shop settings, products, and categories in parallel
      const [shopResponse, productsResponse, categoriesResponse] = await Promise.all([
        storefrontService.getShop(),
        storefrontService.getProducts({ search: searchTerm, category_id: selectedCategory }),
        storefrontService.getCategories()
      ])

      setShop(shopResponse)
      setProducts(productsResponse.products || [])
      setFeaturedProducts((productsResponse.products || []).filter(p => p.is_featured))
      setCategories(categoriesResponse.categories || [])

    } catch (error) {
      console.error('Error loading shop data:', error)
      setError('Failed to load shop data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
  }

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        price_display: product.price_display,
        quantity: 1,
        image: product.images?.[0]?.url || ''
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
  }

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Smartphones': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      'Laptops': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
    return icons[categoryName] || (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading store...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={loadShopData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{shop?.shop_name?.[0] || 'E'}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{shop?.shop_name || 'EasyCart'}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button
                  className="flex items-center space-x-1 text-gray-900 hover:text-blue-600 font-medium transition-colors"
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <span>Categories</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mega Menu */}
                {isCategoriesOpen && (
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-6 mt-2"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id)
                            setIsCategoriesOpen(false)
                          }}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex-shrink-0 text-blue-600">
                            {getCategoryIcon(category.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/about" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                Contact
              </Link>
            </nav>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium electronics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{product.price_display}</span>
                        {product.compare_price_display && (
                          <span className="text-lg text-gray-500 line-through">{product.compare_price_display}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Products</h2>
            {selectedCategory && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-lg text-gray-600">
                  Showing products in: {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{product.price_display}</span>
                      {product.compare_price_display && (
                        <span className="text-lg text-gray-500 line-through">{product.compare_price_display}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl">No products found</div>
              <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{shop?.shop_name?.[0] || 'E'}</span>
                </div>
                <span className="text-xl font-bold">{shop?.shop_name || 'EasyCart'}</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                {shop?.description || 'Your trusted partner for quality electronics and exceptional service.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors block">Home</Link>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors block">About</Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors block">Contact</Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 4).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      document.getElementById('products').scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-gray-400 hover:text-white transition-colors block text-left"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {shop?.shop_name || 'EasyCart'}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-semibold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link href="/" className="block text-gray-900 hover:text-blue-600 font-medium">Home</Link>
              <div>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center justify-between w-full text-gray-900 hover:text-blue-600 font-medium"
                >
                  <span>Categories</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isCategoriesOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className="block text-gray-600 hover:text-blue-600 text-sm"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/about" className="block text-gray-900 hover:text-blue-600 font-medium">About Us</Link>
              <Link href="/contact" className="block text-gray-900 hover:text-blue-600 font-medium">Contact</Link>

              {/* Mobile Search */}
              <div className="pt-4 border-t">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}