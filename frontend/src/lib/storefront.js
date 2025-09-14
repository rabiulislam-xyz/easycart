const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class StorefrontService {
  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request failed')
    }

    return response.json()
  }

  // Get shop by slug
  async getShop(slug) {
    return this.request(`/api/v1/store/${slug}`)
  }

  // Get products for a shop
  async getProducts(slug, params = {}) {
    const searchParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key])
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/api/v1/store/${slug}/products${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // Get single product
  async getProduct(slug, productId) {
    return this.request(`/api/v1/store/${slug}/products/${productId}`)
  }

  // Get categories for a shop
  async getCategories(slug) {
    return this.request(`/api/v1/store/${slug}/categories`)
  }

  // Create order (checkout)
  async createOrder(slug, orderData) {
    return this.request(`/api/v1/store/${slug}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }
}

export default new StorefrontService()