'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../lib/storefront'

export default function StorePage() {
  const { slug } = useParams()
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

  // Hero slider images (placeholder URLs - you can replace with actual images)
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
  }, [slug, searchTerm, selectedCategory])

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

  // Category icons mapping for modern navigation
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
      ),
      'Tablets': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z M12 14v6.5l-9-5.5 M12 14v6.5l9-5.5" />
        </svg>
      ),
      'Audio': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      'Smart Home': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      'Gaming': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M16 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Wearables': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Accessories': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
    return icons[categoryName] || icons['Accessories']
  }

  const loadShopData = async () => {
    try {
      setLoading(true)
      const [shopData, productsData, categoriesData] = await Promise.all([
        storefrontService.getShop(slug),
        storefrontService.getProducts(slug, {
          search: searchTerm,
          category_id: selectedCategory,
          limit: searchTerm || selectedCategory ? 50 : 12
        }),
        storefrontService.getCategories(slug)
      ])
      
      setShop(shopData)
      setProducts(productsData.products || [])
      setFeaturedProducts((productsData.products || []).filter(p => p.is_featured).slice(0, 8))
      setCategories(categoriesData.categories || [])
    } catch (error) {
      setError('Failed to load store: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    setCartCount(count)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = existingCart.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0]?.url
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart))
    updateCartCount()
    
    // Show success toast instead of alert
    showToast('Product added to cart!')
  }

  const showToast = (message) => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300'
    toast.textContent = message
    document.body.appendChild(toast)
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
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
          <div className="text-red-600 text-xl font-medium">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl">Store not found</div>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Glassmorphic Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-xl bg-white/80 shadow-lg border-b border-white/20' 
          : 'backdrop-blur-lg bg-white/70'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <Link href={`/store/${slug}`} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {shop.name}
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Main Menu Links */}
              <div className="flex items-center space-x-6">
                <Link href={`/store/${slug}`} className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-indigo-600 transition-colors font-medium">
                  Home
                </Link>
                
                {/* Categories Mega Menu */}
                <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="font-medium">Categories</span>
                  <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mega Menu Dropdown */}
                {isCategoriesOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsCategoriesOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 z-20">
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setIsCategoriesOpen(false)
                            }}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              {getCategoryIcon(category.name)}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.description?.slice(0, 30)}...</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                </div>

                <Link href={`/store/${slug}/about`} className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-indigo-600 transition-colors font-medium">
                  About Us
                </Link>
                
                <Link href={`/store/${slug}/contact`} className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-indigo-600 transition-colors font-medium">
                  Contact
                </Link>
                
                <Link href={`/store/${slug}/faq`} className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-indigo-600 transition-colors font-medium">
                  FAQ
                </Link>
                
                <Link href={`/store/${slug}/support`} className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/50 hover:text-indigo-600 transition-colors font-medium">
                  Support
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 md:w-64 pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/70 transition-all placeholder-gray-500"
                  placeholder="Search products..."
                />
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart with Modern Design */}
              <Link
                href={`/store/${slug}/cart`}
                className="relative group"
              >
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                  </svg>
                  <span className="hidden sm:block font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/50 border border-white/30"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl z-30">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search products..."
                  />
                </div>

                {/* Mobile Categories */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 px-2">Categories</h3>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(category.name)}
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 px-2">Menu</h3>
                  <Link
                    href={`/store/${slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">Home</span>
                  </Link>
                  
                  <Link
                    href={`/store/${slug}/about`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">About Us</span>
                  </Link>
                  
                  <Link
                    href={`/store/${slug}/contact`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">Contact</span>
                  </Link>
                  
                  <Link
                    href={`/store/${slug}/faq`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">FAQ</span>
                  </Link>
                  
                  <Link
                    href={`/store/${slug}/support`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM15.91 11.672a4.5 4.5 0 01-6.82 4.49c-1.087-.744-2.03-1.726-2.716-2.904m0-5.524c.686-1.178 1.629-2.16 2.716-2.904a4.5 4.5 0 016.82 4.49" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">Support</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Add top padding to account for fixed header */}
      <div className="pt-16"></div>

      {!searchTerm && !selectedCategory && (
        <>
          {/* Hero Slider */}
          <section className="relative h-96 md:h-[500px] overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h2>
                    <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                    <button className="bg-white text-gray-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
                      {slide.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Slider Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Modern Categories Section */}
          <section className="py-20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:20px_20px]"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-4">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Explore Categories
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                  Shop by Category
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Discover our carefully curated collection of premium electronics and gadgets
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="group relative p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Icon Container */}
                    <div className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <div className="text-blue-600 group-hover:text-purple-600 transition-colors">
                        {getCategoryIcon(category.name)}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Modern Popular Products Section */}
          {featuredProducts.length > 0 && (
            <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Featured Products
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Customer Favorites
                  </h2>
                  <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Hand-picked products that our customers love the most
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {featuredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-1 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                      style={{
                        animationDelay: `${index * 150}ms`
                      }}
                    >
                      {/* Inner Card */}
                      <div className="bg-white rounded-[22px] overflow-hidden shadow-2xl">
                        {/* Image Container */}
                        <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Badges */}
                          {product.compare_price && product.compare_price > product.price && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              SALE
                            </div>
                          )}
                          
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            ⭐ POPULAR
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          
                          {/* Pricing */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {formatPrice(product.price)}
                              </span>
                              {product.compare_price && product.compare_price > product.price && (
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(product.compare_price)}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm">
                              {product.stock > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                  {product.stock} left
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                  <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                                  Out of stock
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Add to Cart Button */}
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            {product.stock === 0 ? (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Out of Stock</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                                </svg>
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* All Products Section (shown when searching/filtering or as main section) */}
      <section className={`py-16 ${!searchTerm && !selectedCategory ? 'bg-white' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(searchTerm || selectedCategory) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? `Search results for "${searchTerm}"` : 'All Products'}
                </h2>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              
              {/* Mobile Search */}
              <div className="block md:hidden mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search products..."
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          )}

          {!searchTerm && !selectedCategory && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Products</h2>
              <p className="text-lg text-gray-600">Browse our complete collection</p>
            </div>
          )}
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or browse our categories.</p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="aspect-square w-full bg-gray-200 relative overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.compare_price && product.compare_price > product.price && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        SALE
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {product.stock > 0 ? (
                          <span className="text-green-600 font-medium">{product.stock} left</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of stock</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{shop.name}</h3>
              <p className="text-gray-400 mb-6 max-w-md">{shop.description}</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {shop.name}. All rights reserved. Powered by EasyCart.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}