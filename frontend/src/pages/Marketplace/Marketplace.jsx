import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, MapPin, Heart, Share } from 'lucide-react'
import { marketplaceAPI } from '../../services/api'
import { CATEGORIES, COUNTIES } from '../../utils/constants'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const Marketplace = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 0,
    total: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    county: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  })

  useEffect(() => {
    fetchProducts(page)
  }, [filters, page])

  const fetchProducts = async (pageNum = 1) => {
    try {
      const params = { ...filters, page: pageNum }
      const response = await marketplaceAPI.getProducts(params)
      // Debug: log full response to help diagnose shape issues
      console.debug('marketplace API response', response?.data)
      console.debug('auth token present:', !!localStorage.getItem('kellyflo-token'))
      console.debug('first product is_liked:', response?.data?.data?.[0]?.is_liked)
      console.debug('first product likes_count:', response?.data?.data?.[0]?.likes_count)

      // Backend may return products in different shapes:
      // - array directly: [ {..}, ... ]
      // - wrapper with `products` key: { products: [ ... ] }
      // - Laravel paginator: { current_page, data: [ ... ], ... }
      const productsData = response?.data?.products ?? response?.data?.data ?? response?.data

      if (response?.data && response?.data?.current_page !== undefined) {
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page ?? (response.data.data?.length || 0),
          total: response.data.total ?? 0
        })
      }

      if (Array.isArray(productsData)) {
        setProducts(productsData)
      } else {
        console.warn('Unexpected products response shape, expected array but got:', response?.data)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const goToPage = async (p) => {
    if (!p || p < 1 || p > pagination.last_page) return
    setPage(p)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400">Buy and sell items in your community</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Sell Item</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="marketplace-search"
              type="text"
              placeholder="Search for items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-royal-blue"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.county}
              onChange={(e) => handleFilterChange('county', e.target.value)}
              className="input-field"
            >
              <option value="">All Counties</option>
              {COUNTIES.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>

            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="input-field"
            >
              <option value="">Any Condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>

            <div className="flex space-x-2">
              <input
                id="min-price"
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input-field"
              />
              <input
                id="max-price"
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(products) ? products : []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination controls (simple) */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => goToPage(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Prev</button>

          <span>Page {pagination.current_page} of {pagination.last_page}</span>

          <button
            onClick={() => goToPage(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.last_page}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Next</button>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  // Dev-only: inject mock products for local development
                  const mock = [
                    {
                      id: 'm1',
                      title: 'Sample Phone',
                      description: 'A gently used smartphone',
                      price: 12000,
                      county: 'Nairobi',
                      condition: 'used',
                      images: ['/default-product.svg'],
                      seller: { name: 'Demo Seller', avatar: '/default-avatar.png' },
                      created_at: '2025-01-01'
                    },
                    {
                      id: 'm2',
                      title: 'Mountain Bike',
                      description: 'Lightly used mountain bike',
                      price: 45000,
                      county: 'Kiambu',
                      condition: 'used',
                      images: ['/default-product.svg'],
                      seller: { name: 'Bike Shop', avatar: '/default-avatar.png' },
                      created_at: '2025-02-01'
                    }
                  ]
                  setProducts(mock)
                }}
                className="btn-secondary"
              >Use mock data</button>
              
              <button
                onClick={() => {
                  // Dev-only: Set test authentication token
                  localStorage.setItem('kellyflo-token', '2|iWbA12UPa8wZ6OjgMAD2e88KhwixwWQmi6NHa7BN47ffbd3b')
                  window.location.reload()
                }}
                className="btn-primary"
              >Login as Test User</button>
            </div>
        </div>
      )}
    </div>
  )
}

const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(product.is_liked || false)
  const [likesCount, setLikesCount] = useState(product.likes_count || 0)
  const [isLoading, setIsLoading] = useState(false)

  // Sync local state with product props when they change
  useEffect(() => {
    console.debug(`Product ${product.id} sync:`, { 
      is_liked: product.is_liked, 
      likes_count: product.likes_count 
    })
    setIsLiked(!!product.is_liked) // Ensure boolean conversion
    setLikesCount(product.likes_count || 0)
  }, [product.id, product.is_liked, product.likes_count])

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    const wasLiked = isLiked

    // Optimistic update
    setIsLiked(!wasLiked)
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1)

    try {
      let response
      if (wasLiked) {
        response = await marketplaceAPI.unlike(product.id)
      } else {
        response = await marketplaceAPI.like(product.id)
      }

      // Update with actual data from server
      if (response.data && response.data.likes_count !== undefined) {
        setLikesCount(response.data.likes_count)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update on error
      setIsLiked(wasLiked)
      setLikesCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card group cursor-pointer transform hover:scale-105 transition-transform duration-200">
      <div className="relative">
        <img
          src={(product.images && product.images.length && product.images[0]) ? product.images[0] : '/default-product.svg'}
          alt={product.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
            {likesCount}
          </span>
          <button
            onClick={handleLike}
            disabled={isLoading}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              } ${isLoading ? 'animate-pulse' : ''}`}
            />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.condition === 'new' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {product.condition}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-royal-blue transition-colors">
          {product.title}
        </h3>
        
        <p className="text-2xl font-bold text-royal-blue">
          KSh {product.price.toLocaleString()}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{product.county}</span>
          </div>
          <span>{product.created_at}</span>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <img
            src={product.user.avatar || '/default-avatar.png'}
            alt={product.user.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {product.user.name}
          </span>
        </div>

        <div className="flex space-x-2 mt-3">
          <button className="flex-1 btn-primary py-2 text-sm">
            Buy Now
          </button>
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Share className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Marketplace;