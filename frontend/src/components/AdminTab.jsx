import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function AdminTab({ token, currentUser }) {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // Calorie settings
  const [calorieSettings, setCalorieSettings] = useState({
    cardio: { low: 4, medium: 7, high: 10 },
    muscu: { perSet: 5 }
  })
  const [editingSettings, setEditingSettings] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchStats()
    loadCalorieSettings()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage('❌ Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const loadCalorieSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/settings/calories`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data) {
        setCalorieSettings(response.data)
      }
    } catch (error) {
      console.log('Using default calorie settings')
    }
  }

  const saveCalorieSettings = async () => {
    try {
      await axios.put(
        `${API_URL}/api/admin/settings/calories`,
        calorieSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage('✅ Paramètres de calories sauvegardés')
      setEditingSettings(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de la sauvegarde')
    }
  }

  const handleResetPassword = async (userId, email) => {
    const newPassword = prompt(`Nouveau mot de passe pour ${email} :`)
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/reset-password`,
        { userId, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage(`✅ Mot de passe réinitialisé pour ${email}`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de la réinitialisation')
    }
  }

  const handleToggleRole = async (userId, currentRole, email) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Changer le rôle de ${email} en ${newRole} ?`)) return

    try {
      await axios.post(
        `${API_URL}/api/admin/change-role`,
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage(`✅ Rôle changé pour ${email}`)
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors du changement de rôle')
    }
  }

  const handleDeleteUser = async (userId, email) => {
    if (userId === currentUser.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte !')
      return
    }

    if (!confirm(`⚠️ ATTENTION : Supprimer définitivement ${email} et toutes ses données ?`)) return

    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage(`✅ Utilisateur ${email} supprimé`)
      fetchUsers()
      fetchStats()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <div className="text-gray-600">Chargement du panel admin...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold text-yellow-900">Panel Administrateur</div>
            <div className="text-sm text-yellow-700 mt-1">
              Vous avez accès à toutes les fonctionnalités d'administration. Utilisez avec précaution.
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            icon="👥" 
            value={stats.totalUsers || users.length} 
            label="Utilisateurs" 
            color="blue" 
          />
          <StatCard 
            icon="🏃" 
            value={stats.totalCardio || 0} 
            label="Activités cardio" 
            color="red" 
          />
          <StatCard 
            icon="💪" 
            value={stats.totalMuscu || 0} 
            label="Exercices muscu" 
            color="purple" 
          />
          <StatCard 
            icon="⚖️" 
            value={stats.totalWeight || 0} 
            label="Mesures poids" 
            color="green" 
          />
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Calorie Calculation Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Paramètres de calcul des calories
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Valeurs MET utilisées pour calculer les calories brûlées
            </p>
          </div>
          {!editingSettings ? (
            <button
              onClick={() => setEditingSettings(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveCalorieSettings}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setEditingSettings(false)
                  loadCalorieSettings()
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cardio Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🏃</span> Cardio (valeurs MET)
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensité faible
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calorieSettings.cardio.low}
                  onChange={(e) => setCalorieSettings({
                    ...calorieSettings,
                    cardio: { ...calorieSettings.cardio, low: parseFloat(e.target.value) }
                  })}
                  disabled={!editingSettings}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensité moyenne
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calorieSettings.cardio.medium}
                  onChange={(e) => setCalorieSettings({
                    ...calorieSettings,
                    cardio: { ...calorieSettings.cardio, medium: parseFloat(e.target.value) }
                  })}
                  disabled={!editingSettings}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensité haute
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calorieSettings.cardio.high}
                  onChange={(e) => setCalorieSettings({
                    ...calorieSettings,
                    cardio: { ...calorieSettings.cardio, high: parseFloat(e.target.value) }
                  })}
                  disabled={!editingSettings}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Muscu Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">💪</span> Musculation
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories par série
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={calorieSettings.muscu.perSet}
                  onChange={(e) => setCalorieSettings({
                    ...calorieSettings,
                    muscu: { perSet: parseFloat(e.target.value) }
                  })}
                  disabled={!editingSettings}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Formule cardio :</strong><br/>
                  Calories = (MET × poids × minutes) / 60
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Formule muscu :</strong><br/>
                  Calories = séries × {calorieSettings.muscu.perSet}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List - Simplified */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Gestion des utilisateurs ({users.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
		{users.filter(user => user && user.id).map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">
                      {user.role === 'admin' ? '👑' : '👤'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{user.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                        {user.id === currentUser.id && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleResetPassword(user.id, user.email)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Réinitialiser MDP
                  </button>
                  
                  {user.id !== currentUser.id && (
                    <>
                      <button
                        onClick={() => handleToggleRole(user.id, user.role, user.email)}
                        className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        {user.role === 'admin' ? 'Révoquer admin' : 'Promouvoir admin'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-blue-700">
            <div className="font-semibold mb-1">Fonctionnalités admin :</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Réinitialiser le mot de passe de n'importe quel utilisateur</li>
              <li>Promouvoir un utilisateur en administrateur</li>
              <li>Révoquer les privilèges d'administrateur</li>
              <li>Supprimer des comptes utilisateurs (et toutes leurs données)</li>
              <li>Configurer les paramètres de calcul des calories</li>
              <li>Voir les statistiques globales de la plateforme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-sm p-6 text-white`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  )
}

export default AdminTab
