import { useState, useEffect } from 'react'
import axios from 'axios'
import ExerciseManager from './ExerciseManager'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function ProfileTab({ token, user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [weight, setWeight] = useState(user?.weight || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Tab visibility settings
  const [visibleTabs, setVisibleTabs] = useState({
    cardio: true,
    muscu: true,
    weight: true
  })

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.put(
        `${API_URL}/api/profile`,
        { name, email, weight: parseFloat(weight) },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Profil mis à jour avec succès')
      onUserUpdate(response.data.user)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Erreur lors de la mise à jour'))
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 6) {
      setMessage('❌ Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await axios.post(
        `${API_URL}/api/profile/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Mot de passe changé avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Mot de passe actuel incorrect'))
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTab = (tab) => {
    const newVisibleTabs = { ...visibleTabs, [tab]: !visibleTabs[tab] }
    setVisibleTabs(newVisibleTabs)
    localStorage.setItem('visibleTabs', JSON.stringify(newVisibleTabs))
    setMessage('✅ Préférences sauvegardées - Rechargez la page pour voir les changements')
    setTimeout(() => setMessage(''), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user?.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ⚖️ {user?.weight} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Tab Visibility Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Affichage des onglets
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Choisissez les onglets que vous souhaitez afficher dans votre interface.
          Les onglets Profil, Stats et Admin restent toujours visibles.
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏃</span>
              <div>
                <div className="font-medium text-gray-900">Cardio</div>
                <div className="text-sm text-gray-500">Activités cardiovasculaires</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={visibleTabs.cardio}
              onChange={() => handleToggleTab('cardio')}
              className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <div className="font-medium text-gray-900">Musculation</div>
                <div className="text-sm text-gray-500">Exercices de musculation</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={visibleTabs.muscu}
              onChange={() => handleToggleTab('muscu')}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <div className="font-medium text-gray-900">Poids</div>
                <div className="text-sm text-gray-500">Suivi du poids et composition</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={visibleTabs.weight}
              onChange={() => handleToggleTab('weight')}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Rechargez la page (F5) après avoir modifié vos préférences pour voir les changements.
          </p>
        </div>
      </div>

      {/* Exercise Manager */}
      <ExerciseManager token={token} />

      {/* Edit Profile */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Poids par défaut (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilisé pour le calcul des calories en cardio
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            {loading ? 'Changement...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Membre depuis</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : '-'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Rôle</span>
            <span className="font-medium">
              {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>

          {user?.lastLogin && (
            <div className="flex justify-between">
              <span className="text-gray-600">Dernière connexion</span>
              <span className="font-medium">
                {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileTab
