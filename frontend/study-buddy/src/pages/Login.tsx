import { useState } from 'react'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      console.log('Email:', email)
    }
  }


  return (
    <div className="min-h-screen w-full flex justify-center items-center p-5">
      <div className="backdrop-blur-2xl bg-white/95 shadow-[0_20px_60px_0_rgba(0,0,0,0.3)] rounded-3xl p-0 w-full max-w-[680px] overflow-hidden">
        {/* Header with USF Logo */}
        <div className="bg-linear-to-r from-[#088e64] to-[#037f58] px-12 pt-10 pb-8 text-center">
          <h1 className="text-white text-3xl font-bold mb-2">Find Your Buddy Now!</h1>
          <p className="text-[#CFC493] text-sm font-medium">University of South Florida</p>
        </div>

        {/* Form Content */}
        <div className="px-12 py-10">
          <h2 className="text-2xl font-bold text-[#006747] mb-2 text-center">Welcome Back!</h2>
          <p className="text-gray-600 text-center mb-8">Sign in with your USF email to continue</p>
          
          <form onSubmit={handleNext}>
            <div className="input-group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@usf.edu"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 bg-[#088e64] text-white border-none rounded-xl text-lg font-bold cursor-pointer transition-all duration-500 ease-out hover:bg-[#0a9f72] hover:shadow-[0_8px_20px_rgba(8,142,100,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Next →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login