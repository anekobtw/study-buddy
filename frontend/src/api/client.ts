// API client for Study Buddy backend
const API_BASE_URL = 'http://localhost:8000'

interface SignInRequest {
  email: string
  password: string
}

interface SignUpRequest {
  email: string
  fullName: string
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate'
  major: string
  preferredStudyTime: 0 | 1 | 2 | 3
  classes: Record<string, 0 | 1 | 2>
  description: string
  password: string
}

interface SwipeRequest {
  targetUid: string
  direction: 'left' | 'right'
}

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async signIn(data: SignInRequest) {
    const result = await this.request('/api/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    this.token = result.token
    localStorage.setItem('auth_token', result.token)
    
    return result
  }

  async signUp(data: SignUpRequest) {
    const result = await this.request('/api/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    this.token = result.token
    localStorage.setItem('auth_token', result.token)
    
    return result
  }

  async signOut() {
    this.token = null
    localStorage.removeItem('auth_token')
    
    try {
      await this.request('/api/signout', { method: 'POST' })
    } catch (error) {
      // Ignore errors - token is already cleared locally
      console.log('Signout request failed, but local token cleared')
    }
  }

  async getCurrentUser() {
    return this.request('/api/users/me')
  }

  async updateProfile(data: Partial<SignUpRequest>) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAccount() {
    const result = await this.request('/api/users/me', { method: 'DELETE' })
    this.token = null
    localStorage.removeItem('auth_token')
    return result
  }

  async getNextBatch() {
    return this.request('/api/next_batch')
  }

  async submitSwipe(data: SwipeRequest) {
    return this.request('/api/submit_swipe', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  isAuthenticated(): boolean {
    return this.token !== null
  }

  getToken(): string | null {
    return this.token
  }
}

export const apiClient = new ApiClient()
export default apiClient
