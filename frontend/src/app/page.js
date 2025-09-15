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
  const [scrolled, setScrolled] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [galleryProduct, setGalleryProduct] = useState(null)
  const [galleryImageIndex, setGalleryImageIndex] = useState(0)

  // Hero slider images
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Latest Electronics',
      subtitle: 'Discover cutting-edge technology at unbeatable prices',
      cta: 'Shop Now'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80',
      title: 'Premium Audio',
      subtitle: 'Immerse yourself in crystal-clear sound quality',
      cta: 'Explore Audio'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Smart Home Solutions',
      subtitle: 'Transform your home with intelligent automation',
      cta: 'Browse Smart Home'
    }
  ]

  // Category placeholder images
  const getCategoryImage = (categoryName) => {
    const categoryImages = {
      'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
    return categoryImages[categoryName] || 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }

  // Product placeholder images
  const getProductImage = (productName) => {
    const productImages = {
      'iPhone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Samsung': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'MacBook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Sony': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'AirPods': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'iPad': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
    for (const [key, image] of Object.entries(productImages)) {
      if (productName.includes(key)) return image
    }
    return 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }

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
  }, [heroSlides.length])

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadShopData = async () => {
    try {
      setLoading(true)
      setError('')
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

  const addToCart = (product, event) => {
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
        image: product.images?.[0]?.url || getProductImage(product.name)
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()

    // Show feedback
    const button = event.target
    const originalText = button.innerHTML
    button.innerHTML = '<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Added!'
    button.className = button.className.replace('bg-blue-600', 'bg-green-600').replace('hover:bg-blue-700', 'hover:bg-green-700')
    setTimeout(() => {
      button.innerHTML = originalText
      button.className = button.className.replace('bg-green-600', 'bg-blue-600').replace('hover:bg-green-700', 'hover:bg-blue-700')
    }, 1000)
  }

  const openQuickView = (product) => setQuickViewProduct(product)
  const closeQuickView = () => setQuickViewProduct(null)
  const openGallery = (product, imageIndex = 0) => {
    setGalleryProduct(product)
    setGalleryImageIndex(imageIndex)
  }
  const closeGallery = () => {
    setGalleryProduct(null)
    setGalleryImageIndex(0)
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
          <button onClick={loadShopData} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{shop?.shop_name?.[0] || 'E'}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{shop?.shop_name || 'EasyCart'}</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Slider - 60% viewport height */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden mt-16">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6 opacity-90">{slide.subtitle}</p>
                <button
                  onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100"
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section - No header as requested */}
      {categories.length > 0 && (
        <section id="categories" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    document.getElementById('featured').scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={category.image_url || getCategoryImage(category.name)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section id="featured" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium electronics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={product.images?.[0]?.url || getProductImage(product.name)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover overlay with action buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => openQuickView(product)}
                          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
                          title="Quick View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => openGallery(product)}
                          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
                          title="View Gallery"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => addToCart(product, e)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                          title="Add to Cart"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Featured badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2">
                      {product.category && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-gray-900">{product.price_display}</span>
                        {product.compare_price_display && (
                          <span className="text-sm text-gray-500 line-through">{product.compare_price_display}</span>
                        )}
                      </div>

                      {/* Star rating */}
                      <div className="flex items-center space-x-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                        <span className="text-gray-500 text-xs ml-1">(4.8)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Products</h2>
            {selectedCategory && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-gray-600">
                  Filtered by: {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={product.images?.[0]?.url || getProductImage(product.name)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Hover overlay with action buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => openQuickView(product)}
                        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
                        title="Quick View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => openGallery(product)}
                        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
                        title="View Gallery"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => addToCart(product, e)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                        title="Add to Cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-2">
                    {product.category && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold text-gray-900">{product.price_display}</span>
                      {product.compare_price_display && (
                        <span className="text-sm text-gray-500 line-through">{product.compare_price_display}</span>
                      )}
                    </div>

                    {/* Star rating */}
                    <div className="flex items-center space-x-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                      <span className="text-gray-500 text-xs ml-1">(4.8)</span>
                    </div>
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

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeQuickView}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>
            <div className="bg-white rounded-xl max-w-4xl w-full mx-auto p-6 relative z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{quickViewProduct.name}</h3>
                <button onClick={closeQuickView} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={quickViewProduct.images?.[0]?.url || getProductImage(quickViewProduct.name)}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">{quickViewProduct.price_display}</div>
                  <p className="text-gray-600">{quickViewProduct.description}</p>
                  <button
                    onClick={(e) => addToCart(quickViewProduct, e)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryProduct && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90" onClick={closeGallery}>
          <div className="flex items-center justify-center h-full p-4">
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeGallery} className="absolute top-4 right-4 text-white z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={galleryProduct.images?.[galleryImageIndex]?.url || getProductImage(galleryProduct.name)}
                alt={galleryProduct.name}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}