const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class AuthService {
  async register(userData) {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const data = await response.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  }

  async login(credentials) {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getToken() {
    return localStorage.getItem('token')
  }

  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated() {
    const token = this.getToken()
    return !!token
  }

  async getProfile() {
    const token = this.getToken()
    if (!token) throw new Error('No token found')

    const response = await fetch(`${API_URL}/api/v1/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return response.json()
  }

  async createShop(shopData) {
    const token = this.getToken()
    if (!token) throw new Error('No token found')

    const response = await fetch(`${API_URL}/api/v1/shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shopData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create shop')
    }

    return response.json()
  }

  async getShop() {
    const token = this.getToken()
    if (!token) throw new Error('No token found')

    const response = await fetch(`${API_URL}/api/v1/shop`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // No shop found
      }
      throw new Error('Failed to fetch shop')
    }

    return response.json()
  }

  async updateShop(shopData) {
    const token = this.getToken()
    if (!token) throw new Error('No token found')

    const response = await fetch(`${API_URL}/api/v1/shop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shopData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update shop')
    }

    return response.json()
  }
}

export default new AuthService()