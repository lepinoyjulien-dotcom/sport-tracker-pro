import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function MuscuTab({ token, selectedDate }) {
  const [activities, setActivities] = useState([])
  const [exercises, setExercises] = useState([])
  const [formData, setFormData] = useState({
    exerciseName: '',
    sets: '',
    reps: '',
    weight: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
    fetchExercises()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/muscu`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setActivities(response.data)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/exercises?type=muscu`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExercises(response.data)
      // Auto-sélectionner le premier exercice
      if (response.data.length > 0 && !formData.exerciseName) {
        setFormData(prev => ({ ...prev, exerciseName: response.data[0].name }))
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.exerciseName || !formData.sets || !formData.reps || !selectedDate) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      await axios.post(
        `${API_URL}/api/muscu`,
        {
          date: selectedDate,
          exerciseName: formData.exerciseName,
          sets: parseInt(formData.sets),
          reps: parseInt(formData.reps),
          weight: formData.weight ? parseFloat(formData.weight) : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Activité ajoutée avec succès !')
      setFormData({
        exerciseName: formData.exerciseName,
        sets: '',
        reps: '',
        weight: ''
      })
      fetchActivities()
      fetchExercises()
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding activity:', error)
      setMessage('❌ Erreur lors de l\'ajout')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette activité ?')) return

    try {
      await axios.delete(`${API_URL}/api/muscu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Activité supprimée')
      fetchActivities()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting activity:', error)
      setMessage('❌ Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">💪 Ajouter une séance de musculation</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exercice */}
          <div>
            <label className="block text-sm font-medium mb-1">Exercice</label>
            <select
              value={formData.exerciseName}
              onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Sélectionner un exercice</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {/* Séries */}
          <div>
            <label className="block text-sm font-medium mb-1">Séries</label>
            <input
              type="number"
              min="1"
              value={formData.sets}
              onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="4"
              required
            />
          </div>

          {/* Répétitions */}
          <div>
            <label className="block text-sm font-medium mb-1">Répétitions</label>
            <input
              type="number"
              min="1"
              value={formData.reps}
              onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="12"
              required
            />
          </div>

          {/* Poids (optionnel) */}
          <div>
            <label className="block text-sm font-medium mb-1">Poids (kg) - Optionnel</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="20"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Ajouter la séance
          </button>
        </form>
      </div>

      {/* Liste des activités */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Historique</h3>
        
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune activité enregistrée</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium">{activity.exercise?.name || 'Exercice'}</div>
                  <div className="text-sm text-gray-600">
                    {activity.date} • {activity.sets} séries × {activity.reps} reps
                    {activity.weight > 0 && ` • ${activity.weight} kg`}
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    {activity.calories} calories
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1"
                >
                  🗑️
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
