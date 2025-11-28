import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import BackgroundGrid from "../assets/BackgroundGrid.svg";

function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      navigate('/home')
    }
  }, [navigate])

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f7] overflow-x-hidden font-['Inter',sans-serif]"
    style={{ 
            backgroundImage: `url(${BackgroundGrid})`, 
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'center',
            width: '100vw',
            height: '100vh'
          }}>
      <div className="flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-6xl flex-1">
            {/* Hero Section */}
            <main className="flex flex-1 items-center justify-center py-16 md:py-24 lg:py-32">
              <div className="flex flex-col gap-8 text-center px-4">
                <div className="flex flex-col gap-4">
                  <h1 className="text-neutral-900 text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter">
                    Study Buddy
                  </h1>
                  <h2 className="text-zinc-600 text-lg md:text-xl font-normal leading-normal max-w-2xl mx-auto">
                    The best way for University of South Florida students to connect and organize study sessions.
                  </h2>
                </div>
                <div className="flex-wrap gap-3 flex justify-center">
                  <button 
                    onClick={() => navigate('/signup')}
                    className="ease-in-out duration-150 hover:scale-110 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#13ec6d] text-[#102218] text-base font-bold leading-normal tracking-wide hover:bg-opacity-90 transition-all"
                  >
                    <span className="truncate">Sign Up</span>
                  </button>
                  <button 
                    onClick={() => navigate('/signin')}
                    className="ease-in-out duration-150 hover:scale-110 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#13ec6d]/20 text-zinc-900 text-base font-bold leading-normal tracking-wide hover:bg-[#13ec6d]/30 transition-all"
                  >
                    <span className="truncate">Sign In</span>
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