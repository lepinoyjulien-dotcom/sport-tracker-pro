import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState(null)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setIsAuthenticated(false)
    setShowLogin(true)
  }

  if (!isAuthenticated) {
    return showLogin ? 
      <LoginForm onSuccess={(token) => { setToken(token); setIsAuthenticated(true); }} onToggle={() => setShowLogin(false)} /> :
      <RegisterForm onSuccess={(token) => { setToken(token); setIsAuthenticated(true); }} onToggle={() => setShowLogin(true)} />
  }

  return <Dashboard token={token} onLogout={handleLogout} />
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
      localStorage.setItem('token', response.data.token)
      onSuccess(response.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💪</div>
          <h1 className="text-2xl font-bold text-gray-900">Sport Tracker Pro</h1>
          <p className="text-sm text-gray-500 mt-2">Connexion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-sm text-gray-600 hover:text-gray-900"
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
      localStorage.setItem('token', response.data.token)
      onSuccess(response.data.token)
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💪</div>
          <h1 className="text-2xl font-bold text-gray-900">Sport Tracker Pro</h1>
          <p className="text-sm text-gray-500 mt-2">Créer un compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre nom"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Déjà un compte ? <span className="font-semibold">Se connecter</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ token, onLogout }) {
  const [apiStatus, setApiStatus] = useState('Vérification...')

  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(() => setApiStatus('✅ API connectée'))
      .catch(() => setApiStatus('❌ API déconnectée'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sport Tracker Pro</h1>
                <p className="text-sm text-gray-500">{apiStatus}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Déployée !</h2>
          <p className="text-gray-600 mb-6">
            Votre Sport Tracker Pro est maintenant en ligne et fonctionnel !
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="text-3xl mb-2">🏃</div>
              <div className="text-sm font-semibold text-red-900">Cardio</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl mb-2">💪</div>
              <div className="text-sm font-semibold text-blue-900">Muscu</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl mb-2">⚖️</div>
              <div className="text-sm font-semibold text-green-900">Poids</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-semibold text-orange-900">Stats</div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            ✅ Backend déployé sur Render<br/>
            ✅ Frontend déployé sur Vercel<br/>
            ✅ Base de données sur Neon<br/>
            ✅ 100% Gratuit !
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
