import { useState, useEffect } from 'react'
import axios from 'axios'
import { ExercisesProvider } from './ExercisesContext'
import CardioTab from './components/CardioTab'
import MuscuTab from './components/MuscuTab'
import WeightTab from './components/WeightTab'
import StatsTab from './components/StatsTab'
import AdminTab from './components/AdminTab'
import ProfileTab from './components/ProfileTab'
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

  return (
    <ExercisesProvider token={token}>
      <Dashboard token={token} user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
    </ExercisesProvider>
  )
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
              autoComplete="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Pas encore de compte ? Créer un compte
          </button>
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ onSuccess, onToggle }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [weight, setWeight] = useState('70')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
        weight: parseFloat(weight)
      })
      onSuccess(response.data.token, response.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
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
              autoComplete="name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ token, user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('stats')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [visibleTabs, setVisibleTabs] = useState({ cardio: true, muscu: true, weight: true })

  useEffect(() => {
    const saved = localStorage.getItem('visibleTabs')
    if (saved) {
      try {
        setVisibleTabs(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing visibleTabs:', e)
      }
    }
  }, [])

  const buildTabs = () => {
    const tabs = [
      { id: 'stats', label: 'Stats', icon: '📊', color: 'from-purple-500 to-blue-500' }
    ]

    if (visibleTabs.cardio) {
      tabs.push({ id: 'cardio', label: 'Cardio', icon: '🏃', color: 'from-red-500 to-orange-500' })
    }
    if (visibleTabs.muscu) {
      tabs.push({ id: 'muscu', label: 'Muscu', icon: '💪', color: 'from-blue-500 to-cyan-500' })
    }
    if (visibleTabs.weight) {
      tabs.push({ id: 'weight', label: 'Poids', icon: '⚖️', color: 'from-green-500 to-emerald-500' })
    }

    tabs.push({ id: 'profile', label: 'Profil', icon: '👤', color: 'from-indigo-500 to-purple-500' })

    if (user?.role === 'admin') {
      tabs.push({ id: 'admin', label: 'Admin', icon: '👑', color: 'from-yellow-500 to-red-500' })
    }

    return tabs
  }

  const tabs = buildTabs()

  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'stats')
    }
  }, [visibleTabs])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💪</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sport Tracker Pro</h1>
                <p className="text-sm text-gray-500">Bienvenue, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
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

      {/* Date Selector */}
      {['cardio', 'muscu', 'weight'].includes(activeTab) && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'stats' && <StatsTab token={token} />}
        {activeTab === 'cardio' && <CardioTab token={token} selectedDate={selectedDate} user={user} />}
        {activeTab === 'muscu' && <MuscuTab token={token} selectedDate={selectedDate} user={user} />}
        {activeTab === 'weight' && <WeightTab token={token} selectedDate={selectedDate} />}
        {activeTab === 'profile' && <ProfileTab token={token} user={user} onUserUpdate={onUserUpdate} />}
        {activeTab === 'admin' && user?.role === 'admin' && <AdminTab token={token} />}
      </div>
    </div>
  )
}

export default App
