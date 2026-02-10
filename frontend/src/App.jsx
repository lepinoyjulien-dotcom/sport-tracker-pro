import { useState, useEffect } from 'react'
import axios from 'axios'
import CardioTab from './components/CardioTab'
import MuscuTab from './components/MuscuTab'
import WeightTab from './components/WeightTab'
import StatsTab from './components/StatsTab-v2'
import AdminTab from './components/AdminTab-v2'
import ProfileTab from './components/ProfileTab-v2'
import DateSelector from './components/DateSelector'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setShowLogin(true)
  }

  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  if (!isAuthenticated) {
    return showLogin ? 
      <LoginForm onSuccess={handleAuthSuccess} onToggle={() => setShowLogin(false)} /> :
      <RegisterForm onSuccess={handleAuthSuccess} onToggle={() => setShowLogin(true)} />
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
}

function LoginForm({ onSuccess, onToggle }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      onSuccess(response.data.token, response.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-gray-900">Sport Tracker Pro</h1>
          <p className="text-sm text-gray-500 mt-2">Connexion à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-sm text-gray-600 hover:text-purple-600"
          >
            Pas de compte ? <span className="font-semibold">S'inscrire</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ onSuccess, onToggle }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password })
      onSuccess(response.data.token, response.data.user)
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-gray-900">Sport Tracker Pro</h1>
          <p className="text-sm text-gray-500 mt-2">Créer votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="Votre nom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-sm text-gray-600 hover:text-purple-600"
          >
            Déjà un compte ? <span className="font-semibold">Se connecter</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ token, user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('cardio')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
  // Load visible tabs preferences
  const [visibleTabs, setVisibleTabs] = useState({
    cardio: true,
    muscu: true,
    weight: true
  })

  useEffect(() => {
    const saved = localStorage.getItem('visibleTabs')
    if (saved) {
      setVisibleTabs(JSON.parse(saved))
    }
  }, [])

  // Build tabs list based on visibility settings
  const buildTabs = () => {
    const tabs = []
    
    if (visibleTabs.cardio) {
      tabs.push({ id: 'cardio', icon: '🏃', label: 'Cardio', color: 'from-red-500 to-pink-500' })
    }
    
    if (visibleTabs.muscu) {
      tabs.push({ id: 'muscu', icon: '💪', label: 'Muscu', color: 'from-blue-500 to-cyan-500' })
    }
    
    if (visibleTabs.weight) {
      tabs.push({ id: 'weight', icon: '⚖️', label: 'Poids', color: 'from-green-500 to-emerald-500' })
    }
    
    // Always visible tabs
    tabs.push({ id: 'stats', icon: '📊', label: 'Stats', color: 'from-orange-500 to-yellow-500' })
    tabs.push({ id: 'profile', icon: '👤', label: 'Profil', color: 'from-purple-500 to-pink-500' })
    
    // Admin tab (always visible for admins)
    if (user?.role === 'admin') {
      tabs.push({ id: 'admin', icon: '⚙️', label: 'Admin', color: 'from-gray-700 to-gray-900' })
    }
    
    return tabs
  }

  const tabs = buildTabs()

  // Set first visible tab as active if current tab is hidden
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'stats')
    }
  }, [visibleTabs])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💪
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sport Tracker Pro</h1>
                <p className="text-sm text-gray-500">
                  Bonjour {user?.name} !
                  {user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                      👑 Admin
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date Selector - Visible seulement pour cardio, muscu, weight */}
        {['cardio', 'muscu', 'weight'].includes(activeTab) && (
          <div className="mb-6">
            <DateSelector 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'cardio' && visibleTabs.cardio && <CardioTab token={token} currentDate={selectedDate} />}
        {activeTab === 'muscu' && visibleTabs.muscu && <MuscuTab token={token} currentDate={selectedDate} />}
        {activeTab === 'weight' && visibleTabs.weight && <WeightTab token={token} currentDate={selectedDate} />}
        {activeTab === 'stats' && <StatsTab token={token} />}
        {activeTab === 'profile' && <ProfileTab token={token} user={user} onUserUpdate={onUserUpdate} />}
        {activeTab === 'admin' && user?.role === 'admin' && <AdminTab token={token} currentUser={user} />}
      </div>
    </div>
  )
}

export default App
