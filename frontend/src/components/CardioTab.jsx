import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function CardioTab({ token, currentDate }) {
  const [activities, setActivities] = useState([])
  const [exercise, setExercise] = useState('')
  const [minutes, setMinutes] = useState('')
  const [intensity, setIntensity] = useState('Moyenne')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const cardioExercises = ['Course', 'Vélo', 'Natation', 'Marche', 'Rameur', 'Elliptique']

  useEffect(() => {
    fetchActivities()
  }, [currentDate])

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cardio`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: currentDate, endDate: currentDate }
      })
      setActivities(response.data)
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!exercise || !minutes) {
      setMessage('Remplissez tous les champs')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await axios.post(
        `${API_URL}/api/cardio`,
        {
          date: currentDate,
          exerciseName: exercise,
          minutes: parseInt(minutes),
          intensity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Activité ajoutée !')
      setExercise('')
      setMinutes('')
      setIntensity('Moyenne')
      fetchActivities()

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de l\'ajout')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette activité ?')) return

    try {
      await axios.delete(`${API_URL}/api/cardio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Activité supprimée')
      fetchActivities()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression')
    }
  }

  const totalMinutes = activities.reduce((sum, a) => sum + a.minutes, 0)
  const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">🏃</div>
          <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
          <div className="text-sm text-gray-500">Activités</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-gray-900">{totalMinutes} min</div>
          <div className="text-sm text-gray-500">Durée totale</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-gray-900">{totalCalories} kcal</div>
          <div className="text-sm text-gray-500">Calories brûlées</div>
        </div>
      </div>

      {/* Add Activity Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une activité</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exercice</label>
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            >
              <option value="">Sélectionner un exercice</option>
              {cardioExercises.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="30"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intensité</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            {loading ? 'Ajout...' : 'Ajouter l\'activité'}
          </button>
        </form>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activités du jour ({activities.length})
        </h2>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏃</div>
            <p>Aucune activité cardio aujourd'hui</p>
            <p className="text-sm mt-1">Ajoutez votre première activité ci-dessus !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {activity.exercise?.name || 'Exercice'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      activity.intensity === 'Haute' ? 'bg-red-100 text-red-700' :
                      activity.intensity === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {activity.intensity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {activity.minutes} min • {activity.calories} kcal
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CardioTab
