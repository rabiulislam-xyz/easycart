import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useParams } from 'next/navigation'
import StorePage from '../page'
import storefrontService from '../../../../lib/storefront'

// Mock the storefront service
jest.mock('../../../../lib/storefront', () => ({
  getShop: jest.fn(),
  getProducts: jest.fn(),
  getCategories: jest.fn(),
}))

// Mock useParams
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

describe('StorePage', () => {
  const mockShop = {
    id: 'shop-123',
    name: 'Test Shop',
    slug: 'test-shop',
    description: 'A test shop',
    primary_color: '#3B82F6',
    secondary_color: '#F9FAFB'
  }

  const mockProducts = [
    {
      id: 'prod-1',
      name: 'iPhone 15',
      description: 'Latest iPhone',
      price: 99900,
      stock: 10,
      media: [{ url: 'https://example.com/iphone.jpg' }]
    },
    {
      id: 'prod-2',
      name: 'Samsung Galaxy',
      description: 'Android phone',
      price: 79900,
      stock: 5,
      media: []
    }
  ]

  const mockCategories = [
    { id: 'cat-1', name: 'Phones' },
    { id: 'cat-2', name: 'Accessories' }
  ]

  beforeEach(() => {
    useParams.mockReturnValue({ slug: 'test-shop' })
    
    storefrontService.getShop.mockResolvedValue(mockShop)
    storefrontService.getProducts.mockResolvedValue({ 
      products: mockProducts 
    })
    storefrontService.getCategories.mockResolvedValue({ 
      categories: mockCategories 
    })

    // Clear localStorage mock
    localStorage.getItem.mockReturnValue('[]')
    localStorage.setItem.mockClear()
  })

  it('should render shop name and products', async () => {
    render(<StorePage />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading store...')).not.toBeInTheDocument()
    })

    // Check if shop name is displayed
    expect(screen.getByText('Test Shop')).toBeInTheDocument()
    expect(screen.getByText('A test shop')).toBeInTheDocument()

    // Check if products are displayed
    expect(screen.getByText('iPhone 15')).toBeInTheDocument()
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
    
    // Check prices are formatted correctly
    expect(screen.getByText('$999.00')).toBeInTheDocument()
    expect(screen.getByText('$799.00')).toBeInTheDocument()
  })

  it('should display stock status correctly', async () => {
    render(<StorePage />)

    await waitFor(() => {
      expect(screen.queryByText('Loading store...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('10 in stock')).toBeInTheDocument()
    expect(screen.getByText('5 in stock')).toBeInTheDocument()
  })

  it('should handle search functionality', async () => {
    render(<StorePage />)

    await waitFor(() => {
      expect(screen.queryByText('Loading store...')).not.toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search products...')
    fireEvent.change(searchInput, { target: { value: 'iPhone' } })

    // Verify that the service is called with search params
    await waitFor(() => {
      expect(storefrontService.getProducts).toHaveBeenCalledWith(
        'test-shop',
        expect.objectContaining({
          search: 'iPhone'
        })
      )
    })
  })

  it('should add product to cart', async () => {
    render(<StorePage />)

    await waitFor(() => {
      expect(screen.queryByText('Loading store...')).not.toBeInTheDocument()
    })

    const addToCartButtons = screen.getAllByText('Add to Cart')
    fireEvent.click(addToCartButtons[0])

    // Check that localStorage was called
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([
        expect.objectContaining({
          id: 'prod-1',
          name: 'iPhone 15',
          price: 99900,
          quantity: 1
        })
      ])
    )

    // Check that alert was shown
    expect(window.alert).toHaveBeenCalledWith('Product added to cart!')
  })

  it('should handle out of stock products', async () => {
    const outOfStockProducts = [
      {
        ...mockProducts[0],
        stock: 0
      }
    ]

    storefrontService.getProducts.mockResolvedValue({ 
      products: outOfStockProducts 
    })

    render(<StorePage />)

    await waitFor(() => {
      expect(screen.queryByText('Loading store...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    
    const outOfStockButton = screen.getByText('Out of Stock')
    expect(outOfStockButton).toBeDisabled()
  })

  it('should show error message when shop not found', async () => {
    storefrontService.getShop.mockRejectedValue(new Error('Shop not found'))

    render(<StorePage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load store: Shop not found')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    render(<StorePage />)
    
    expect(screen.getByText('Loading store...')).toBeInTheDocument()
  })

  it('should handle empty products state', async () => {
    storefrontService.getProducts.mockResolvedValue({ 
      products: [] 
    })

    render(<StorePage />)

    await waitFor(() => {
      expect(screen.queryByText('Loading store...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument()
  })
})