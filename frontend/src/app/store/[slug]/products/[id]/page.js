'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import storefrontService from '../../../../../lib/storefront'

export default function ProductDetailPage() {
  const { slug, id } = useParams()
  const router = useRouter()
  const [shop, setShop] = useState(null)
  const [product, setProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({}) // { optionId: valueId }
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    loadProductData()
  }, [slug, id])

  const loadProductData = async () => {
    try {
      setLoading(true)
      
      // Load shop and product data in parallel
      const [shopData, productData] = await Promise.all([
        storefrontService.getShop(slug),
        storefrontService.getProduct(slug, id)
      ])
      
      setShop(shopData)
      setProduct(productData)
    } catch (error) {
      setError('Failed to load product: ' + error.message)
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

  // Handle option selection
  const handleOptionSelect = (optionId, valueId) => {
    const newSelectedOptions = {
      ...selectedOptions,
      [optionId]: valueId
    }
    setSelectedOptions(newSelectedOptions)
    
    // Find matching variant
    const matchingVariant = findMatchingVariant(newSelectedOptions)
    setSelectedVariant(matchingVariant)
    
    // Update image gallery if variant has specific images
    if (matchingVariant?.images && matchingVariant.images.length > 0) {
      setSelectedImageIndex(0) // Reset to first image of variant
    }
  }

  // Find variant that matches selected options
  const findMatchingVariant = (options) => {
    if (!product?.variants || product.variants.length === 0) return null
    
    const selectedOptionIds = Object.keys(options)
    if (selectedOptionIds.length === 0) return null

    return product.variants.find(variant => {
      // Check if variant's option values match all selected options
      const variantOptionValues = variant.option_values || []
      
      return selectedOptionIds.every(optionId => {
        const selectedValueId = options[optionId]
        return variantOptionValues.some(optionValue => 
          optionValue.option_id === optionId && optionValue.value_id === selectedValueId
        )
      })
    })
  }

  // Get current price (variant price or product price)
  const getCurrentPrice = () => {
    if (selectedVariant?.price) return selectedVariant.price
    return product?.price || 0
  }

  // Get current compare price
  const getCurrentComparePrice = () => {
    if (selectedVariant?.compare_price) return selectedVariant.compare_price
    return product?.compare_price || null
  }

  // Get current stock
  const getCurrentStock = () => {
    if (selectedVariant) return selectedVariant.stock
    return product?.stock || 0
  }

  // Get current SKU
  const getCurrentSKU = () => {
    if (selectedVariant?.sku) return selectedVariant.sku
    return product?.sku || ''
  }

  // Get current images (variant images or product images)
  const getCurrentImages = () => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images
    }
    return product?.images || []
  }

  const addToCart = () => {
    if (!product) return
    
    setAddingToCart(true)
    
    try {
      // Get current cart
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
      
      // Create cart item identifier (includes variant info if applicable)
      const cartItemId = selectedVariant ? selectedVariant.id : product.id
      const cartItemName = selectedVariant 
        ? `${product.name}${selectedVariant.option_values?.length > 0 
          ? ` (${selectedVariant.option_values.map(ov => ov.value).join(', ')})` 
          : ''}`
        : product.name
      
      // Check if this specific variant/product already exists in cart
      const existingItemIndex = currentCart.findIndex(item => item.id === cartItemId)
      
      if (existingItemIndex > -1) {
        // Update quantity if product/variant exists
        currentCart[existingItemIndex].quantity += quantity
      } else {
        // Add new item to cart
        currentCart.push({
          id: cartItemId,
          name: cartItemName,
          price: getCurrentPrice(),
          quantity: quantity,
          image: getCurrentImages().length > 0 ? getCurrentImages()[0].url : null,
          variant: selectedVariant ? {
            id: selectedVariant.id,
            sku: selectedVariant.sku,
            options: selectedVariant.option_values
          } : null
        })
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(currentCart))
      
      // Optional: Show success message or redirect
      setTimeout(() => {
        setAddingToCart(false)
        // Could show a toast notification here
      }, 500)
      
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setAddingToCart(false)
    }
  }

  const nextImage = () => {
    const images = getCurrentImages()
    if (images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const previousImage = () => {
    const images = getCurrentImages()
    if (images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading product...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm">
              <Link href={`/store/${slug}`} className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <div className="p-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors mr-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <span className="font-medium">{shop?.name}</span>
              </Link>
              <div className="text-gray-400">/</div>
              {product?.category && (
                <>
                  <span className="text-gray-600 font-medium">{product.category.name}</span>
                  <div className="text-gray-400">/</div>
                </>
              )}
              <span className="text-indigo-600 font-semibold truncate max-w-48">
                {product?.name}
              </span>
            </div>

            {/* Cart Icon with Count */}
            <Link href={`/store/${slug}/cart`} className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <div className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden group">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                {(() => {
                  const images = getCurrentImages()
                  return images.length > 0 ? (
                    <>
                      <img
                        src={images[selectedImageIndex]?.url}
                        alt={images[selectedImageIndex]?.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {images.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                      {/* Image Counter */}
                      {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      )}
                    </>
                ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No Image Available</p>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {(() => {
              const images = getCurrentImages()
              return images.length > 1 && (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-white hover:border-indigo-200'
                    }`}
                  >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Product Information Section */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
              <div className="relative">
                {/* Category Badge */}
                {product?.category && (
                  <div className="inline-flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                    {product.category.name}
                  </div>
                )}

                {/* Product Name */}
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                  {product?.name}
                </h1>

                {/* SKU */}
                {getCurrentSKU() && (
                  <p className="text-sm text-gray-500 mb-4">SKU: {getCurrentSKU()}</p>
                )}

                {/* Price Section */}
                <div className="flex items-baseline space-x-4 mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(getCurrentPrice())}
                  </span>
                  {getCurrentComparePrice() && getCurrentComparePrice() > getCurrentPrice() && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(getCurrentComparePrice())}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className={`w-3 h-3 rounded-full ${getCurrentStock() > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`font-medium ${getCurrentStock() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getCurrentStock() > 0 ? `${getCurrentStock()} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Product Variants/Options */}
                {product?.options && product.options.length > 0 && (
                  <div className="mb-8 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Select Options</h3>
                    {product.options.map((option) => (
                      <div key={option.id} className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {option.name}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((value) => {
                            const isSelected = selectedOptions[option.id] === value.id
                            return (
                              <button
                                key={value.id}
                                onClick={() => handleOptionSelect(option.id, value.id)}
                                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 font-medium ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                                    : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 text-gray-700'
                                }`}
                              >
                                {value.value}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {/* Variant Selection Feedback */}
                    {product.options.length > 0 && Object.keys(selectedOptions).length < product.options.length && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-amber-700">
                            Please select all options to see final pricing and availability.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {product?.description && (
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center space-x-3 bg-white/80 rounded-2xl p-2 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="font-bold text-gray-900 w-12 text-center bg-indigo-50 py-1 rounded-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(getCurrentStock() || 999, quantity + 1))}
                      className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 flex items-center justify-center text-green-600 hover:text-green-700 transition-all duration-200 hover:scale-110"
                      disabled={quantity >= (getCurrentStock() || 999)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={addToCart}
                  disabled={getCurrentStock() < 1 || addingToCart || (product?.options?.length > 0 && Object.keys(selectedOptions).length < product.options.length)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-semibold text-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding to Cart...</span>
                      </>
                    ) : getCurrentStock() > 0 ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                        </svg>
                        <span>Add to Cart</span>
                      </>
                    ) : (
                      <span>Out of Stock</span>
                    )}
                  </div>
                </button>

                {/* Continue Shopping Link */}
                <Link
                  href={`/store/${slug}`}
                  className="w-full bg-white/70 backdrop-blur-sm text-gray-700 py-3 rounded-2xl text-center font-medium hover:bg-white/90 transition-all duration-200 block border border-white/30 hover:shadow-lg"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}