describe('Storefront E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage()
    
    // Mock API responses
    cy.intercept('GET', '**/api/v1/store/test-shop', {
      fixture: 'shop.json'
    }).as('getShop')
    
    cy.intercept('GET', '**/api/v1/store/test-shop/products**', {
      fixture: 'products.json'
    }).as('getProducts')
    
    cy.intercept('GET', '**/api/v1/store/test-shop/categories', {
      fixture: 'categories.json'
    }).as('getCategories')
  })

  it('should display shop and products correctly', () => {
    cy.visit('/store/test-shop')
    
    // Wait for API calls
    cy.wait(['@getShop', '@getProducts', '@getCategories'])
    
    // Check shop header
    cy.contains('Test Shop').should('be.visible')
    cy.contains('A demo e-commerce shop').should('be.visible')
    
    // Check products are displayed
    cy.contains('iPhone 15').should('be.visible')
    cy.contains('Samsung Galaxy').should('be.visible')
    
    // Check prices are formatted
    cy.contains('$999.00').should('be.visible')
    cy.contains('$799.00').should('be.visible')
    
    // Check cart button is visible
    cy.contains('🛒 Cart').should('be.visible')
  })

  it('should add products to cart', () => {
    cy.visit('/store/test-shop')
    
    cy.wait(['@getShop', '@getProducts', '@getCategories'])
    
    // Add first product to cart
    cy.contains('iPhone 15').parent().find('button:contains("Add to Cart")').click()
    
    // Check alert is shown
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Product added to cart!')
    })
    
    // Check localStorage
    cy.window().then((win) => {
      const cart = JSON.parse(win.localStorage.getItem('cart'))
      expect(cart).to.have.length(1)
      expect(cart[0].name).to.equal('iPhone 15')
      expect(cart[0].quantity).to.equal(1)
    })
  })

  it('should search products', () => {
    cy.visit('/store/test-shop')
    
    cy.wait(['@getShop', '@getProducts', '@getCategories'])
    
    // Search for iPhone
    cy.get('input[placeholder="Search products..."]').type('iPhone')
    
    // API should be called with search parameter
    cy.wait('@getProducts').then((interception) => {
      expect(interception.request.url).to.include('search=iPhone')
    })
  })

  it('should filter by category', () => {
    cy.visit('/store/test-shop')
    
    cy.wait(['@getShop', '@getProducts', '@getCategories'])
    
    // Select category
    cy.get('select').select('Electronics')
    
    // API should be called with category parameter
    cy.wait('@getProducts').then((interception) => {
      expect(interception.request.url).to.include('category_id=')
    })
  })

  it('should navigate to cart page', () => {
    cy.visit('/store/test-shop')
    
    cy.wait(['@getShop', '@getProducts', '@getCategories'])
    
    // Click cart button
    cy.contains('🛒 Cart').click()
    
    // Should navigate to cart page
    cy.url().should('include', '/store/test-shop/cart')
  })
})

describe('Shopping Cart E2E Tests', () => {
  beforeEach(() => {
    // Set up cart with items
    cy.window().then((win) => {
      win.localStorage.setItem('cart', JSON.stringify([
        {
          id: 'prod-1',
          name: 'iPhone 15',
          price: 99900,
          quantity: 2,
          image: 'https://example.com/iphone.jpg'
        },
        {
          id: 'prod-2', 
          name: 'Samsung Galaxy',
          price: 79900,
          quantity: 1
        }
      ]))
    })
    
    cy.intercept('GET', '**/api/v1/store/test-shop', {
      fixture: 'shop.json'
    }).as('getShop')
  })

  it('should display cart items correctly', () => {
    cy.visit('/store/test-shop/cart')
    
    cy.wait('@getShop')
    
    // Check cart items
    cy.contains('iPhone 15').should('be.visible')
    cy.contains('Samsung Galaxy').should('be.visible')
    
    // Check quantities
    cy.contains('2').should('be.visible') // iPhone quantity
    cy.contains('1').should('be.visible') // Samsung quantity
    
    // Check subtotal
    cy.contains('$2,797.00').should('be.visible') // (999 * 2) + 799
  })

  it('should update item quantities', () => {
    cy.visit('/store/test-shop/cart')
    
    cy.wait('@getShop')
    
    // Increase iPhone quantity
    cy.contains('iPhone 15').parent().find('button:contains("+")').click()
    
    // Check quantity updated
    cy.contains('3').should('be.visible')
    
    // Check subtotal updated
    cy.contains('$3,796.00').should('be.visible') // (999 * 3) + 799
  })

  it('should remove items from cart', () => {
    cy.visit('/store/test-shop/cart')
    
    cy.wait('@getShop')
    
    // Remove Samsung Galaxy
    cy.contains('Samsung Galaxy').parent().find('button:contains("Remove")').click()
    
    // Item should be removed
    cy.contains('Samsung Galaxy').should('not.exist')
    
    // Subtotal should update
    cy.contains('$1,998.00').should('be.visible') // 999 * 2
  })

  it('should proceed to checkout', () => {
    cy.visit('/store/test-shop/cart')
    
    cy.wait('@getShop')
    
    // Click checkout button
    cy.contains('Checkout').click()
    
    // Should navigate to checkout
    cy.url().should('include', '/store/test-shop/checkout')
  })
})

describe('Checkout E2E Tests', () => {
  beforeEach(() => {
    // Set up cart with items
    cy.window().then((win) => {
      win.localStorage.setItem('cart', JSON.stringify([
        {
          id: 'prod-1',
          name: 'iPhone 15',
          price: 99900,
          quantity: 1
        }
      ]))
    })
    
    cy.intercept('GET', '**/api/v1/store/test-shop', {
      fixture: 'shop.json'
    }).as('getShop')
    
    cy.intercept('POST', '**/api/v1/store/test-shop/orders', {
      statusCode: 201,
      body: {
        id: 'order-123',
        order_number: 'ORD-1234567890',
        customer_email: 'test@example.com'
      }
    }).as('createOrder')
  })

  it('should display checkout form and order summary', () => {
    cy.visit('/store/test-shop/checkout')
    
    cy.wait('@getShop')
    
    // Check form fields
    cy.contains('Full Name').should('be.visible')
    cy.contains('Email Address').should('be.visible')
    cy.contains('Street Address').should('be.visible')
    
    // Check order summary
    cy.contains('Order Summary').should('be.visible')
    cy.contains('iPhone 15').should('be.visible')
    cy.contains('$999.00').should('be.visible')
  })

  it('should complete checkout successfully', () => {
    cy.visit('/store/test-shop/checkout')
    
    cy.wait('@getShop')
    
    // Fill out form
    cy.get('#customer_name').type('John Doe')
    cy.get('#customer_email').type('test@example.com')
    cy.get('#shipping_address').type('123 Main St')
    cy.get('#shipping_city').type('Anytown')
    cy.get('#shipping_zip').type('12345')
    
    // Submit order
    cy.contains('Place Order').click()
    
    // Wait for order creation
    cy.wait('@createOrder')
    
    // Should redirect to confirmation
    cy.url().should('include', '/store/test-shop/order/order-123')
    
    // Check confirmation message
    cy.contains('Thank you for your order!').should('be.visible')
    cy.contains('order-123').should('be.visible')
  })

  it('should show validation errors for empty form', () => {
    cy.visit('/store/test-shop/checkout')
    
    cy.wait('@getShop')
    
    // Try to submit empty form
    cy.contains('Place Order').click()
    
    // Form should not submit (browser validation will prevent it)
    cy.url().should('include', '/checkout')
  })
})