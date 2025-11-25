import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import './ProfileModal.css'

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-[#006747]">My Profile</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {profile && (
          <div className="modal-body">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{profile.usf_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold">{profile.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-semibold">{profile.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Major</p>
                    <p className="font-semibold">{profile.major}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Study Time</p>
                  <p className="font-semibold">{getStudyTimeLabel(profile.preferred_study_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Classes</p>
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
                  <p className="text-sm text-gray-500">About</p>
                  <p className="text-gray-700">{profile.description}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-[#088e64] text-white rounded-xl font-semibold hover:bg-[#0a9f72] transition-all"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none"
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Major</label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Study Time</label>
                  <select
                    value={formData.preferredStudyTime}
                    onChange={(e) => setFormData({ ...formData, preferredStudyTime: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none"
                  >
                    <option value={0}>☀️ Morning</option>
                    <option value={1}>🌤️ Afternoon</option>
                    <option value={2}>🌙 Evening</option>
                    <option value={3}>🌑 Night</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Classes</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentClass.name}
                        onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                        placeholder="Class name"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none"
                      />
                      <select
                        value={currentClass.level}
                        onChange={(e) => setCurrentClass({ ...currentClass, level: parseInt(e.target.value) })}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none"
                      >
                        <option value={0}>Beginner</option>
                        <option value={1}>Intermediate</option>
                        <option value={2}>Advanced</option>
                      </select>
                      <button
                        type="button"
                        onClick={addClass}
                        className="px-6 py-3 bg-[#088e64] text-white rounded-xl font-semibold hover:bg-[#0a9f72]"
                      >
                        Add
                      </button>
                    </div>

                    {classes.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
                        {classes.map((cls, index) => {
                          const colors = getLevelColor(cls.level)
                          return (
                            <span key={index} className={`${colors.bg} ${colors.text} border ${colors.border} px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2`}>
                              {cls.name} • {getLevelLabel(cls.level)}
                              <button
                                type="button"
                                onClick={() => removeClass(index)}
                                className="text-gray-500 hover:text-red-600"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">About</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#088e64] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-3 bg-[#088e64] text-white rounded-xl font-semibold hover:bg-[#0a9f72] transition-all disabled:opacity-50"
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
