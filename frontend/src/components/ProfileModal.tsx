import { useState, useEffect } from 'react'
import apiClient from '../api/client'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  usf_email: string
  full_name: string
  major: string
  year: string
  preferred_study_time: number
  classes: Record<string, number>
  description: string
}

function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    major: '',
    year: '',
    preferredStudyTime: 0,
    description: ''
  })

  const [classes, setClasses] = useState<{ name: string; level: number }[]>([])
  const [currentClass, setCurrentClass] = useState({ name: '', level: 0 })

  useEffect(() => {
    if (isOpen) {
      loadProfile()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const loadProfile = async () => {
    try {
      const data = await apiClient.getCurrentUser()
      setProfile(data)
      setFormData({
        fullName: data.full_name,
        major: data.major,
        year: data.year,
        preferredStudyTime: data.preferred_study_time,
        description: data.description || ''
      })
      
      const parsedClasses = typeof data.classes === 'string' 
        ? JSON.parse(data.classes) 
        : data.classes
      
      setClasses(Object.entries(parsedClasses).map(([name, level]) => ({
        name,
        level: level as number
      })))
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    }
  }

  const handleSave = async () => {
    setError('')
    setLoading(true)

    try {
      const updateData = {
        fullName: formData.fullName,
        major: formData.major,
        year: formData.year as 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate',
        preferredStudyTime: formData.preferredStudyTime as 0 | 1 | 2 | 3,
        description: formData.description,
        classes: classes.reduce((acc, cls) => {
          acc[cls.name] = cls.level as 0 | 1 | 2
          return acc
        }, {} as Record<string, 0 | 1 | 2>)
      }

      await apiClient.updateProfile(updateData)
      setIsEditing(false)
      loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
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

  const getStudyTimeLabel = (time: number) => {
    return ['☀️ Morning', '🌤️ Afternoon', '🌙 Evening', '🌑 Night'][time]
  }

  const getLevelLabel = (level: number) => ['Beginner', 'Intermediate', 'Advanced'][level]
  
  const getLevelColor = (level: number) => {
    const colors = [
      { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    ]
    return colors[level] || colors[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-neutral-900">My Profile</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all hover:scale-110 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {profile && (
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-6">
                {/* Profile Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#13ec6d] to-[#0a9f72] flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profile.full_name.charAt(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Email</p>
                    <p className="text-neutral-900 font-medium">{profile.usf_email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Name</p>
                    <p className="text-neutral-900 font-semibold text-lg">{profile.full_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Year</p>
                      <p className="text-neutral-900 font-medium">{profile.year}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Major</p>
                      <p className="text-neutral-900 font-medium">{profile.major}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Study Time</p>
                      <p className="text-neutral-900 font-medium">{getStudyTimeLabel(profile.preferred_study_time)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-2">Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(typeof profile.classes === 'string' ? JSON.parse(profile.classes) : profile.classes).map(([className, level]) => {
                        const colors = getLevelColor(level as number)
                        return (
                          <span key={className} className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-1.5 rounded-lg text-xs font-medium`}>
                            {className} • {getLevelLabel(level as number)}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-1">About</p>
                    <p className="text-zinc-700 leading-relaxed">{profile.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 mt-2 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-[#13ec6d] transition-all hover:scale-101 cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="select w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors cursor-pointer"
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Major</label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Study Time</label>
                  <select
                    value={formData.preferredStudyTime}
                    onChange={(e) => setFormData({ ...formData, preferredStudyTime: parseInt(e.target.value) })}
                    className="select w-full h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors cursor-pointer"
                  >
                    <option value={0}>☀️ Morning</option>
                    <option value={1}>🌤️ Afternoon</option>
                    <option value={2}>🌙 Evening</option>
                    <option value={3}>🌑 Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Classes</label>
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
                        className="select h-11 px-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-[#13ec6d] transition-colors cursor-pointer"
                      >
                        <option value={0}>Beginner</option>
                        <option value={1}>Intermediate</option>
                        <option value={2}>Advanced</option>
                      </select>
                      <button
                        type="button"
                        onClick={addClass}
                        className="h-11 px-6 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-[#13ec6d] transition-all hover:scale-105 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {classes.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-xl">
                        {classes.map((cls, index) => {
                          const colors = getLevelColor(cls.level)
                          return (
                            <span key={index} className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2`}>
                              <span>{cls.name}</span>
                              <span className="text-xs opacity-75">• {getLevelLabel(cls.level)}</span>
                              <button
                                type="button"
                                onClick={() => removeClass(index)}
                                className="ml-1 hover:text-red-600 transition-all hover:scale-125 cursor-pointer"
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

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">About</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#13ec6d] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-11 border-2 border-neutral-900 text-neutral-900 rounded-xl font-semibold hover:border-[#13ec6d] hover:text-[#13ec6d] transition-all hover:scale-101 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 h-11 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-[#13ec6d] transition-all hover:scale-101 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileModal
