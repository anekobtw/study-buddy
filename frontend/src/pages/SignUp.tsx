import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import BackgroundGrid from "../assets/BackgroundGrid.svg"
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
    preferredStudyTime: 0,
    profilePicture: ''
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
        profilePicture: (formData as any).profilePicture || undefined,
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
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f7] overflow-x-hidden font-['Inter'] bg-cover bg-center" style={{ backgroundImage: `url(${BackgroundGrid})` }}>
      <div className="flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center items-center py-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-neutral-900 text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-zinc-600 text-sm">Join Study Buddy and find your perfect study partner</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile picture preview + inputs */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Profile Picture (optional)</label>
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => document.getElementById('signup-file-input')?.click()}
                      className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-dashed border-neutral-300 hover:border-[#13ec6d]"
                    >
                      {(formData as any).profilePicture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={(formData as any).profilePicture} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-neutral-400 text-xs text-center px-2">Click to upload</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={(formData as any).profilePicture}
                        onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                        className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                      />
                      <input
                        id="signup-file-input"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            setFormData({ ...formData, profilePicture: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Email & Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                      USF Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@usf.edu"
                      className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-neutral-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                      required
                    />
                  </div>
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
                    placeholder="Min 6 characters"
                    className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                    minLength={6}
                    required
                  />
                </div>

                {/* Year & Major */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-neutral-900 mb-2">
                      Year
                    </label>
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="select w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-neutral-900 mb-2">
                      Major
                    </label>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                      className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Study Time */}
                <div>
                  <label htmlFor="preferredStudyTime" className="block text-sm font-medium text-neutral-900 mb-2">
                    Preferred Study Time
                  </label>
                  <select
                    id="preferredStudyTime"
                    name="preferredStudyTime"
                    value={formData.preferredStudyTime}
                    onChange={handleInputChange}
                    className="select w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors"
                    required
                  >
                    <option value={0}>☀️ Morning</option>
                    <option value={1}>🌤️ Afternoon</option>
                    <option value={2}>🌙 Evening</option>
                    <option value={3}>🌑 Night</option>
                  </select>
                </div>

                {/* Classes */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Classes
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentClass.name}
                        onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                        placeholder="Class name"
                        className="flex-1 h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors"
                      />
                      <select
                        value={currentClass.level}
                        onChange={(e) => setCurrentClass({ ...currentClass, level: parseInt(e.target.value) })}
                        className="select h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors"
                      >
                        <option value={0}>Beginner</option>
                        <option value={1}>Intermediate</option>
                        <option value={2}>Advanced</option>
                      </select>
                      <button
                        type="button"
                        onClick={addClass}
                        className="cursor-pointer h-11 px-6 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-[#13ec6d] transition-all"
                      >
                        Add
                      </button>
                    </div>

                    {classes.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-xl">
                        {classes.map((cls, index) => {
                          const colors = getLevelColor(cls.level)
                          return (
                            <span
                              key={index}
                              className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2`}
                            >
                              <span>{cls.name}</span>
                              <span className="text-xs opacity-75">• {getLevelLabel(cls.level)}</span>
                              <button
                                type="button"
                                onClick={() => removeClass(index)}
                                className="ml-1 hover:text-red-600 transition-colors"
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
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-900 mb-2">
                    About You
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell potential study buddies about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors resize-none"
                    required
                  />
                </div>
                
                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="cursor-pointer w-full rounded-xl h-12 px-8 bg-neutral-900 text-white text-base font-semibold transition-all duration-300 hover:bg-[#13ec6d] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Sign In Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-zinc-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/signin')}
                      className="cursor-pointer text-neutral-900 font-semibold hover:text-[#13ec6d] transition-colors"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Back to Landing */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer text-sm text-zinc-600 hover:text-neutral-900 transition-colors"
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

export default SignUp
