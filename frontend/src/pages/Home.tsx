import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import ProfileModal from '../components/ProfileModal'
import './Home.css'
import { parseClassLevel } from '../utils'
import type { Student } from '../enums.tsx'


function Main() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [cards, setCards] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    loadBatch()
  }, [])

  const loadBatch = async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        navigate('/signin')
        return
      }
      const response = await apiClient.getNextBatch()
      setCards(response.batch)
    } catch (error) {
      console.error('Failed to load batch:', error)
      if (error instanceof Error && error.message.includes('401')) {
        navigate('/signin')
      }
    } finally {
      setLoading(false)
    }
  }


  const getStudyTimeInfo = (time: number) => {
    const timeMap = [
      { label: 'Morning', icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ), color: 'text-amber-500' },
      { label: 'Afternoon', icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ), color: 'text-orange-500' },
      { label: 'Evening', icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      ), color: 'text-indigo-500' },
      { label: 'Night', icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
        </svg>
      ), color: 'text-blue-900' }
    ]
    return timeMap[time] || timeMap[0]
  }

  const handleLike = async () => {
    const card = cards[currentIndex]
    if (!card) return

    try {
      const response = await apiClient.submitSwipe({
        targetUid: (card.usf_email || card.USFEmail)!,
        direction: 'right'
      })
      
      if (response.isMutualMatch) {
        alert(`🎉 It's a match with ${card.full_name || card.fullName}!`)
      }
    } catch (error) {
      console.error('Failed to submit swipe:', error)
    }
    
    nextCard()
  }

  const handleDislike = async () => {
    const card = cards[currentIndex]
    if (!card) return

    try {
      await apiClient.submitSwipe({
        targetUid: (card.usf_email || card.USFEmail)!,
        direction: 'left'
      })
    } catch (error) {
      console.error('Failed to submit swipe:', error)
    }
    
    nextCard()
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
      loadBatch()
    }
  }

  const handleSwipeStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
  }

  const handleSwipeMove = (clientX: number) => {
    if (!isDragging) return
    const offset = clientX - startX
    setSwipeOffset(offset)
  }

  const handleSwipeEnd = () => {
    setIsDragging(false)
    const threshold = 100
    
    if (swipeOffset > threshold) {
      // Swiped right - Like
      handleLike()
    } else if (swipeOffset < -threshold) {
      // Swiped left - Dislike
      handleDislike()
    }
    
    setSwipeOffset(0)
  }

  const currentCard = cards[currentIndex]
  
  const rotation = swipeOffset / 20
  const opacity = 1 - Math.abs(swipeOffset) / 300

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="text-green-900 text-2xl font-bold">USF Study Buddy</div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowProfileModal(true)}
            className="text-green-800 cursor-pointer hover:text-[#CFC493] transition-colors"
            title="My Profile"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button className="text-green-800 cursor-pointer hover:text-[#CFC493] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button 
            onClick={async () => {
              await apiClient.signOut()
              navigate('/signin')
            }}
            className="text-green-800 cursor-pointer hover:text-[#CFC493] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {loading ? (
          <div className="text-gray-600 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading study buddies...</p>
          </div>
        ) : currentCard ? (
          <div className="relative w-full max-w-sm">
            <div 
              className="bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                opacity: opacity
              }}
              onMouseDown={(e) => handleSwipeStart(e.clientX)}
              onMouseMove={(e) => isDragging && handleSwipeMove(e.clientX)}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
              onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX)}
              onTouchEnd={handleSwipeEnd}
            >
              {/* Swipe Indicators */}
              {swipeOffset > 50 && (
                <div className="absolute top-8 right-8 z-10 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl rotate-12 shadow-lg">
                  LIKE
                </div>
              )}
              {swipeOffset < -50 && (
                <div className="absolute top-8 left-8 z-10 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-2xl -rotate-12 shadow-lg">
                  NOPE
                </div>
              )}
              
              {/* Card Image/Avatar */}
              <div className="h-96 bg-linear-to-br from-[#088e64] to-[#006747] flex items-center justify-center">
                <div className="text-white text-8xl font-bold">
                  {(currentCard.full_name || currentCard.fullName || '?').charAt(0)}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-6 space-y-4">
                {/* Name, Email, and Year */}
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{currentCard.full_name || currentCard.fullName}</h2>
                    <span className="text-sm text-gray-500 font-medium">{currentCard.year}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{currentCard.usf_email || currentCard.USFEmail}</p>
                </div>
                
                {/* Major */}
                <div>
                  <p className="text-[#088e64] font-semibold text-base">{currentCard.major}</p>
                </div>
                
                {/* Study Time */}
                <div className="flex items-center gap-2">
                  <span className={`${getStudyTimeInfo((currentCard.preferred_study_time || currentCard.preferredStudyTime) ?? 0).color}`}>
                    {getStudyTimeInfo((currentCard.preferred_study_time || currentCard.preferredStudyTime) ?? 0).icon}
                  </span>
                  <p className="text-sm text-gray-700">
                    Prefers <span className="font-semibold">{getStudyTimeInfo((currentCard.preferred_study_time || currentCard.preferredStudyTime) ?? 0).label}</span> study sessions
                  </p>
                </div>
                
                {/* Description */}
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">{currentCard.description}</p>
                </div>
                
                {/* Classes */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(typeof currentCard.classes === 'string' ? JSON.parse(currentCard.classes) : currentCard.classes).map(([className, level]) => {
                      const levelInfo = parseClassLevel(level as number)
                      return (
                        <span 
                          key={className} 
                          className={`${levelInfo.bg} ${levelInfo.text} border ${levelInfo.border} px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5`}
                        >
                          <span>{className}</span>
                          <span className="text-[10px] opacity-75">• {levelInfo.label}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-800 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">No more profiles!</h2>
            <p className="text-gray-600">Check back later for more study buddies</p>
          </div>
        )}
      </div>

      {/* Footer with Action Buttons */}
      <div className="pb-8 px-4">
        <div className="max-w-sm mx-auto flex justify-center items-center gap-6">
          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            disabled={!currentCard}
            className="w-16 h-16 rounded-full bg-red-500 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={!currentCard}
            className="w-16 h-16 rounded-full bg-[#088e64] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#0a9f72] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Main