import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import BackgroundGrid from "../assets/BackgroundGrid.svg"

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
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f7] overflow-x-hidden font-['Inter'] bg-cover bg-center" style={{ backgroundImage: `url(${BackgroundGrid})` }}>
      <div className="flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center items-center py-5">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-neutral-900 text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-zinc-600 text-sm">Sign in to continue to Study Buddy</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yourname@usf.edu"
                    className="w-full h-12 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full h-12 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl h-12 px-8 bg-neutral-900 text-white text-base font-semibold transition-all duration-300 hover:bg-[#13ec6d] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-zinc-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="text-neutral-900 font-semibold hover:text-[#13ec6d] transition-colors"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Back to Landing */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-zinc-600 hover:text-neutral-900 transition-colors"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-zinc-500 text-sm">© 2025 anekobtw. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

export default SignIn