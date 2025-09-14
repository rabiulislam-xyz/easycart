import storefrontService from '../storefront'

// Mock fetch
global.fetch = jest.fn()

describe('StorefrontService', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('getShop', () => {
    it('should fetch shop data successfully', async () => {
      const mockShop = {
        id: '123',
        name: 'Test Shop',
        slug: 'test-shop',
        description: 'A test shop'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShop,
      })

      const result = await storefrontService.getShop('test-shop')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/store/test-shop',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
      expect(result).toEqual(mockShop)
    })

    it('should throw error when shop not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Shop not found' }),
      })

      await expect(storefrontService.getShop('nonexistent')).rejects.toThrow(
        'Shop not found'
      )
    })
  })

  describe('getProducts', () => {
    it('should fetch products with search params', async () => {
      const mockProducts = {
        products: [
          { id: '1', name: 'Product 1', price: 1000 },
          { id: '2', name: 'Product 2', price: 2000 },
        ],
        pagination: { total: 2, page: 1 }
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })

      const result = await storefrontService.getProducts('test-shop', {
        search: 'test',
        category_id: 'cat-123'
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/store/test-shop/products?search=test&category_id=cat-123',
        expect.any(Object)
      )
      expect(result).toEqual(mockProducts)
    })

    it('should fetch products without search params', async () => {
      const mockProducts = { products: [] }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      })

      await storefrontService.getProducts('test-shop')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/store/test-shop/products',
        expect.any(Object)
      )
    })
  })

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockOrder = {
        id: 'order-123',
        customer_email: 'test@example.com',
        total: 5000
      }

      const orderData = {
        customer_email: 'test@example.com',
        customer_name: 'John Doe',
        shipping_address: '123 Main St',
        items: [{ product_id: 'prod-123', quantity: 2 }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })

      const result = await storefrontService.createOrder('test-shop', orderData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/store/test-shop/orders',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        })
      )
      expect(result).toEqual(mockOrder)
    })

    it('should handle order creation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Insufficient stock' }),
      })

      const orderData = {
        customer_email: 'test@example.com',
        items: [{ product_id: 'prod-123', quantity: 100 }]
      }

      await expect(
        storefrontService.createOrder('test-shop', orderData)
      ).rejects.toThrow('Insufficient stock')
    })
  })
})