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

  // Get shop settings (single shop)
  async getShop() {
    return this.request(`/api/v1/store`)
  }

  // Get products (single shop)
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key])
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/v1/store/products${queryString ? `?${queryString}` : ''}`

    return this.request(endpoint)
  }

  // Get single product
  async getProduct(productId) {
    return this.request(`/api/v1/store/products/${productId}`)
  }

  // Get categories (single shop)
  async getCategories() {
    return this.request(`/api/v1/store/categories`)
  }

  // Create order (checkout)
  async createOrder(orderData) {
    return this.request(`/api/v1/store/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }
}

export default new StorefrontService()