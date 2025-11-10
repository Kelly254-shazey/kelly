/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Calendar, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { COUNTIES } from '../../utils/constants'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('') // New state for server errors
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setError } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('') // reset previous server error
    try {
      await registerUser(data)
      navigate('/')
    } catch (error) {
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const validationErrors = error.response.data.errors
        Object.keys(validationErrors).forEach((field) => {
          setError(field, { type: 'server', message: validationErrors[field][0] })
        })
      } else if (error.response?.data?.message) {
        // General error message from backend
        setServerError(error.response.data.message)
      } else {
        setServerError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-romantic py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center fade-in">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-royal-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Join KellyFlo</h1>
              <p className="text-white/80 text-sm mt-1">Create your account today</p>
            </div>
          </div>
        </div>

        <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <p className="text-red-500 text-sm mb-2">{serverError}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                <input
                  {...register('first_name', { required: 'First name is required' })}
                  id="first_name"
                  type="text"
                  className="input-field"
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                <input
                  {...register('last_name', { required: 'Last name is required' })}
                  id="last_name"
                  type="text"
                  className="input-field"
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  id="email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('date_of_birth', { required: 'Date of birth is required' })}
                  id="date_of_birth"
                  type="date"
                  className="input-field pl-10"
                />
              </div>
              {errors.date_of_birth && (
                <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            {/* County */}
            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">County</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  {...register('county', { required: 'Please select your county' })}
                  id="county"
                  className="input-field pl-10"
                >
                  <option value="">Select your county</option>
                  {COUNTIES && COUNTIES.map((county) => (
                    <option key={county.code || county.id || county.name} value={county.name}>
                      {county.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.county && (
                <p className="text-red-500 text-xs mt-1">{errors.county.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      {...register('gender', { required: 'Please select gender' })}
                      id={`gender-${gender.toLowerCase()}`}
                      type="radio"
                      value={gender.toLowerCase()}
                      className="text-royal-blue focus:ring-royal-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{gender}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                {...register('terms', { required: 'You must accept the terms and conditions' })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-royal-blue focus:ring-royal-blue border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-royal-blue hover:text-royal-blue/80">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-royal-blue hover:text-royal-blue/80">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-royal-blue hover:text-royal-blue/80">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register;