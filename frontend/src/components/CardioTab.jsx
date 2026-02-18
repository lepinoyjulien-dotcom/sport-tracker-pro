import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function CardioTab({ token }) {
  const [activities, setActivities] = useState([])
  const [exercises, setExercises] = useState([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    exerciseName: '',
    minutes: '',
    intensity: 'Moyenne'
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
    fetchExercises()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cardio`, {
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
      const response = await axios.get(`${API_URL}/api/exercises?type=cardio`, {
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
    
    if (!formData.exerciseName || !formData.minutes || !formData.date) {
      setMessage('❌ Veuillez remplir tous les champs')
      return
    }

    try {
      await axios.post(
        `${API_URL}/api/cardio`,
        {
          date: formData.date,
          exerciseName: formData.exerciseName,
          minutes: parseInt(formData.minutes),
          intensity: formData.intensity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Activité ajoutée avec succès !')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        exerciseName: formData.exerciseName,
        minutes: '',
        intensity: 'Moyenne'
      })
      fetchActivities()
      fetchExercises() // Refresh au cas où nouvel exercice créé
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding activity:', error)
      setMessage('❌ Erreur lors de l\'ajout')
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
        <h2 className="text-2xl font-bold mb-4 text-purple-600">📊 Ajouter une activité cardio</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

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

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="30"
              required
            />
          </div>

          {/* Intensité */}
          <div>
            <label className="block text-sm font-medium mb-1">Intensité</label>
            <select
              value={formData.intensity}
              onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Haute">Haute</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Ajouter l'activité
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
                    {activity.date} • {activity.minutes} min • {activity.intensity}
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

export default CardioTab
