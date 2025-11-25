import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import './SignUp.css'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    year: '',
    major: '',
    description: '',
    password: '',
    preferredStudyTime: 0
  })
  
  const [classes, setClasses] = useState<{ name: string; level: number }[]>([])
  const [currentClass, setCurrentClass] = useState({ name: '', level: 0 })
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

    // Validation
    if (!formData.email.endsWith('@usf.edu')) {
      setError('Please use your USF email address (@usf.edu)')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!formData.year) {
      setError('Please select your year')
      return
    }

    if (classes.length === 0) {
      setError('Please add at least one class')
      return
    }

    setLoading(true)

    try {
      const registrationData = {
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        year: formData.year as 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate',
        major: formData.major,
        preferredStudyTime: formData.preferredStudyTime as 0 | 1 | 2 | 3,
        description: formData.description,
        classes: classes.reduce((acc, cls) => {
          acc[cls.name] = cls.level as 0 | 1 | 2
          return acc
        }, {} as Record<string, 0 | 1 | 2>)
      }

      const response = await apiClient.signUp(registrationData)
      console.log('Signup successful:', response)
      navigate('/home')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addClass = () => {
    if (currentClass.name.trim()) {
      setClasses([...classes, { ...currentClass }])
      setCurrentClass({ name: '', level: 0 })
    }
  }

  const removeClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index))
  }

  const getLevelColor = (level: number) => {
    const colors = [
      { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    ]
    return colors[level] || colors[0]
  }

  const getLevelLabel = (level: number) => ['Beginner', 'Intermediate', 'Advanced'][level]

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-5">
      <div className="backdrop-blur-2xl bg-white/95 shadow-[0_20px_60px_0_rgba(0,0,0,0.3)] rounded-3xl p-0 w-full max-w-[680px] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-linear-to-r from-[#088e64] to-[#037f58] px-12 pt-10 pb-8 text-center">
          <h1 className="text-white text-3xl font-bold mb-2">Join Study Buddy</h1>
          <p className="text-[#CFC493] text-sm font-medium">University of South Florida</p>
        </div>

        {/* Form Content */}
        <div className="px-12 py-10">
          <h2 className="text-2xl font-bold text-[#006747] mb-2 text-center">Create Your Profile</h2>
          <p className="text-gray-600 text-center mb-8">Tell us about yourself to find the perfect study buddy</p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="input-group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                USF Email Address
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

            {/* Full Name */}
            <div className="input-group">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
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
                placeholder="Create a strong password"
                minLength={6}
                required
              />
            </div>

            {/* Year and Major in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl font-medium text-gray-700 transition-all duration-300 focus:outline-none focus:border-[#088e64] focus:bg-gray-50 focus:shadow-[0_0_0_4px_rgba(8,142,100,0.1)]"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="major" className="block text-sm font-semibold text-gray-700 mb-2">
                  Major
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                  required
                />
              </div>
            </div>

            {/* Preferred Study Time */}
            <div className="input-group">
              <label htmlFor="preferredStudyTime" className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Study Time
              </label>
              <select
                id="preferredStudyTime"
                name="preferredStudyTime"
                value={formData.preferredStudyTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl font-medium text-gray-700 transition-all duration-300 focus:outline-none focus:border-[#088e64] focus:bg-gray-50 focus:shadow-[0_0_0_4px_rgba(8,142,100,0.1)]"
                required
              >
                <option value={0}>☀️ Morning</option>
                <option value={1}>🌤️ Afternoon</option>
                <option value={2}>🌙 Evening</option>
                <option value={3}>🌑 Night</option>
              </select>
            </div>

            {/* Classes */}
            <div className="input-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Classes <span className="text-red-500">*</span> (Add at least one)
              </label>
              
              <div className="space-y-3">
                {/* Add class input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentClass.name}
                    onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                    placeholder="Class name (e.g., Data Structures)"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 bg-white rounded-xl font-medium text-gray-700 transition-all duration-300 focus:outline-none focus:border-[#088e64] focus:bg-gray-50 focus:shadow-[0_0_0_4px_rgba(8,142,100,0.1)]"
                  />
                  <select
                    value={currentClass.level}
                    onChange={(e) => setCurrentClass({ ...currentClass, level: parseInt(e.target.value) })}
                    className="px-4 py-3 border-2 border-gray-200 bg-white rounded-xl font-medium text-gray-700 transition-all duration-300 focus:outline-none focus:border-[#088e64] focus:bg-gray-50"
                  >
                    <option value={0}>Beginner</option>
                    <option value={1}>Intermediate</option>
                    <option value={2}>Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={addClass}
                    className="px-6 py-3 bg-[#088e64] text-white rounded-xl font-semibold hover:bg-[#0a9f72] transition-all duration-300"
                  >
                    Add
                  </button>
                </div>

                {/* Display added classes */}
                {classes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl">
                    {classes.map((cls, index) => {
                      const colors = getLevelColor(cls.level)
                      return (
                        <span
                          key={index}
                          className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2`}
                        >
                          <span>{cls.name}</span>
                          <span className="text-xs opacity-75">• {getLevelLabel(cls.level)}</span>
                          <button
                            type="button"
                            onClick={() => removeClass(index)}
                            className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="input-group">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                About You
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell potential study buddies about yourself, your study style, and what you're looking for..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl font-medium text-gray-700 transition-all duration-300 focus:outline-none focus:border-[#088e64] focus:bg-gray-50 focus:shadow-[0_0_0_4px_rgba(8,142,100,0.1)] resize-none"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#088e64] text-white border-none rounded-xl text-lg font-bold cursor-pointer transition-all duration-500 ease-out hover:bg-[#0a9f72] hover:shadow-[0_8px_20px_rgba(8,142,100,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Creating Account...' : 'Create Profile →'}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Already have an account? <a href="/signin" className="text-[#088e64] font-semibold hover:text-[#0a9f72] transition-colors">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp