import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import BackgroundGrid from "../assets/BackgroundGrid.svg"
import './Landing.css'

function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      navigate('/home')
    }
  }, [navigate])

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f7] overflow-x-hidden font-['Inter'] bg-cover bg-center" style={{ backgroundImage: `url(${BackgroundGrid})` }}>
      <div className="flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-6xl flex-1">
            {/* Hero Section */}
            <main className="flex flex-1 items-center justify-center py-16 md:py-24 lg:py-32">
              <div className="flex flex-col gap-8 text-center px-4">
                <div className="flex flex-col gap-4 relative">
                  {/* Light gradient glow behind title */}
                  <div className="absolute w-[600px] h-[350px] bg-linear-to-r from-[#13ec6d]/10 via-[#13ec6d]/20 to-[#13ec6d]/10 blur-2xl rounded-full pointer-events-none" />

                  <h1 className="relative text-neutral-900 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter z-10">
                    <div className='typewriter'> Study Buddy</div>
                  </h1>
                  <h2 className="relative text-zinc-600 text-lg md:text-xl font-light leading-normal max-w-2xl mx-auto z-10">
                    The best way for University of South Florida students to connect and organize study sessions.
                  </h2>
                </div>
                <div className="flex-wrap gap-3 flex justify-center">
                  <button 
                    onClick={() => navigate('/signup')}
                    className="cursor-pointer rounded-xl h-12 px-8 bg-neutral-900 text-white text-base font-semibold transition-all duration-300 hover:bg-[#13ec6d] hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Sign Up
                  </button>
                  <button 
                    onClick={() => navigate('/signin')}
                    className="cursor-pointer rounded-xl h-12 px-8 bg-white border-2 border-neutral-900 text-neutral-900 text-base font-semibold transition-all duration-300 hover:border-[#13ec6d] hover:text-[#13ec6d] hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="flex flex-col gap-6 px-5 text-center">
              <p className="text-zinc-500 text-sm font-normal leading-normal">© 2025 anekobtw. All Rights Reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing