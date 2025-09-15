import authService from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiService {
  async request(endpoint, options = {}) {
    const token = authService.getToken()
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request failed')
    }

    return response.json()
  }

  // Admin Categories
  async getCategories() {
    return this.request('/api/v1/admin/categories')
  }

  async createCategory(categoryData) {
    return this.request('/api/v1/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    })
  }

  async updateCategory(id, categoryData) {
    return this.request(`/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    })
  }

  async deleteCategory(id) {
    return this.request(`/api/v1/admin/categories/${id}`, {
      method: 'DELETE'
    })
  }

  // Admin Products
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key])
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/api/v1/admin/products${queryString ? `?${queryString}` : ''}`

    return this.request(endpoint)
  }

  async getProduct(id) {
    return this.request(`/api/v1/admin/products/${id}`)
  }

  async createProduct(productData) {
    return this.request('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  }

  async updateProduct(id, productData) {
    return this.request(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
  }

  async deleteProduct(id) {
    return this.request(`/api/v1/admin/products/${id}`, {
      method: 'DELETE'
    })
  }

  // Admin Settings
  async getSettings() {
    return this.request('/api/v1/admin/settings')
  }

  async updateSettings(settingsData) {
    return this.request('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  }

  // Uploads
  async uploadFile(file) {
    const token = authService.getToken()
    if (!token) throw new Error('No token found')

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/v1/admin/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }
}

export default new ApiService()