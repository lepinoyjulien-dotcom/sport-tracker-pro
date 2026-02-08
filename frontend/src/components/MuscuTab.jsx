import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function MuscuTab({ token, currentDate }) {
  const [activities, setActivities] = useState([])
  const [exercise, setExercise] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const muscuExercises = [
    'Développé couché', 'Squats', 'Tractions', 'Soulevé de terre',
    'Développé militaire', 'Rowing', 'Dips', 'Curl biceps', 'Extension triceps', 'Abdos'
  ]

  useEffect(() => {
    fetchActivities()
  }, [currentDate])

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/muscu`, {
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
    if (!exercise || !sets || !reps) {
      setMessage('Remplissez au moins l\'exercice, séries et répétitions')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await axios.post(
        `${API_URL}/api/muscu`,
        {
          date: currentDate,
          exerciseName: exercise,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: weight ? parseFloat(weight) : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Exercice ajouté !')
      setExercise('')
      setSets('')
      setReps('')
      setWeight('')
      fetchActivities()

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de l\'ajout')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet exercice ?')) return

    try {
      await axios.delete(`${API_URL}/api/muscu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Exercice supprimé')
      fetchActivities()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression')
    }
  }

  const totalSets = activities.reduce((sum, a) => sum + a.sets, 0)
  const totalVolume = activities.reduce((sum, a) => sum + (a.sets * a.reps * a.weight), 0)
  const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">💪</div>
          <div className="text-2xl font-bold text-gray-900">{totalSets}</div>
          <div className="text-sm text-gray-500">Séries totales</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-gray-900">{totalVolume.toFixed(0)} kg</div>
          <div className="text-sm text-gray-500">Volume total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-gray-900">{totalCalories} kcal</div>
          <div className="text-sm text-gray-500">Calories brûlées</div>
        </div>
      </div>

      {/* Add Exercise Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un exercice</h2>
        
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="">Sélectionner un exercice</option>
              {muscuExercises.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Séries</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="3"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="12"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
              <input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="50"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            {loading ? 'Ajout...' : 'Ajouter l\'exercice'}
          </button>
        </form>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Exercices du jour ({activities.length})
        </h2>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💪</div>
            <p>Aucun exercice aujourd'hui</p>
            <p className="text-sm mt-1">Ajoutez votre premier exercice ci-dessus !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {activity.exercise?.name || 'Exercice'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {activity.sets} séries × {activity.reps} reps
                    {activity.weight > 0 && ` × ${activity.weight} kg`}
                    {' • '}
                    {activity.calories} kcal
                    {activity.weight > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        (Volume: {(activity.sets * activity.reps * activity.weight).toFixed(0)} kg)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
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

export default MuscuTab
