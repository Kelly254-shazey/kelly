import React from 'react'

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-royal-blue ${sizeClasses[size]} ${className}`} />
  )
}

export default LoadingSpinner;