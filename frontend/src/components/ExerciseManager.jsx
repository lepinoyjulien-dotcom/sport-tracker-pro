import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function ExerciseManager({ token }) {
  const [exercises, setExercises] = useState([])
  const [type, setType] = useState('cardio')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchExercises()
  }, [type])

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/exercises`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type }
      })
      // Filter out any undefined/null/invalid entries
      const validExercises = Array.isArray(response.data) 
        ? response.data.filter(ex => ex && ex.id && ex.name)
        : []
      setExercises(validExercises)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setExercises([])
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setMessage('Le nom est requis')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await axios.post(
        `${API_URL}/api/exercises`,
        { name: name.trim(), type },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Exercice ajouté')
      setName('')
      fetchExercises()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Erreur'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet exercice ?')) return

    try {
      await axios.delete(`${API_URL}/api/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Exercice supprimé')
      fetchExercises()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Erreur'))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Mes exercices personnalisés
      </h3>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('cardio')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            type === 'cardio'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cardio
        </button>
        <button
          onClick={() => setType('muscu')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            type === 'muscu'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Musculation
        </button>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Nouveau ${type === 'cardio' ? 'cardio' : 'exercice'}`}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>

      {/* Exercises list */}
      <div className="space-y-2">
        {exercises.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Aucun exercice personnalisé pour le {type}
          </div>
        ) : (
          exercises
            .filter(exercise => exercise && exercise.id) // Double check
            .map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{exercise.name}</span>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ))
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 Vos exercices personnalisés apparaîtront dans les listes de sélection
          des onglets Cardio et Muscu.
        </p>
      </div>
    </div>
  )
}

export default ExerciseManager
