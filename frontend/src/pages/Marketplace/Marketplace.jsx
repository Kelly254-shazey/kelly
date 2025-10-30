import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, MapPin, Heart, Share } from 'lucide-react'
import { marketplaceAPI } from '../../services/api'
import { CATEGORIES, COUNTIES } from '../../utils/constants'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const Marketplace = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    county: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      const response = await marketplaceAPI.getProducts(filters)
      setProducts(response.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
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
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input-field"
              />
              <input
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}

const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(product.is_liked)

  const handleLike = async () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality
  }

  return (
    <div className="card group cursor-pointer transform hover:scale-105 transition-transform duration-200">
      <div className="relative">
        <img
          src={product.images[0] || '/default-product.jpg'}
          alt={product.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <button
          onClick={handleLike}
          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
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
            src={product.seller.avatar || '/default-avatar.png'}
            alt={product.seller.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {product.seller.name}
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