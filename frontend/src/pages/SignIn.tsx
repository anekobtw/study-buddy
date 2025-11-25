import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import './SignIn.css'

function SignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      navigate('/home')
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiClient.signIn(formData)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-5">
      <div className="backdrop-blur-2xl bg-white/95 shadow-[0_20px_60px_0_rgba(0,0,0,0.3)] rounded-3xl p-0 w-full max-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#088e64] to-[#037f58] px-12 pt-10 pb-8 text-center">
          <h1 className="text-white text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-[#CFC493] text-sm font-medium">University of South Florida</p>
        </div>

        {/* Form Content */}
        <div className="px-12 py-10">
          <h2 className="text-2xl font-bold text-[#006747] mb-2 text-center">Sign In</h2>
          <p className="text-gray-600 text-center mb-3">Enter your credentials to continue</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Email */}''
            <div className="input-group pb-3">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yourname@usf.edu"
                required
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-[#088e64] hover:text-[#0a9f72] font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#088e64] text-white border-none rounded-xl text-lg font-bold cursor-pointer transition-all duration-500 ease-out hover:bg-[#0a9f72] hover:shadow-[0_8px_20px_rgba(8,142,100,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Don't have an account? <a href="/signup" className="text-[#088e64] font-semibold hover:text-[#0a9f72] transition-colors">Sign up</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn