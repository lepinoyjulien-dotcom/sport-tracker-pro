import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function WeightTab({ token, selectedDate }) {
  const [entries, setEntries] = useState([])
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [selectedDate])

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/weight`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Filtrer par date sélectionnée
      const filtered = response.data.filter(entry => entry.date === selectedDate)
      setEntries(filtered)
    } catch (error) {
      console.error('Error fetching weight entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.weight || !selectedDate) {
      setMessage('❌ Le poids est requis')
      return
    }

    try {
      await axios.post(
        `${API_URL}/api/weight`,
        {
          date: selectedDate,
          weight: parseFloat(formData.weight),
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
          muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Pesée ajoutée avec succès !')
      setFormData({
        weight: '',
        bodyFat: '',
        muscleMass: ''
      })
      fetchEntries()
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding weight entry:', error)
      setMessage('❌ Erreur lors de l\'ajout')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette pesée ?')) return

    try {
      await axios.delete(`${API_URL}/api/weight/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Pesée supprimée')
      fetchEntries()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting weight entry:', error)
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
        <h2 className="text-2xl font-bold mb-4 text-purple-600">⚖️ Ajouter une pesée</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Poids */}
          <div>
            <label className="block text-sm font-medium mb-1">Poids (kg) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="75.5"
              required
            />
          </div>

          {/* Masse grasse (optionnel) */}
          <div>
            <label className="block text-sm font-medium mb-1">Masse grasse (%) - Optionnel</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.bodyFat}
              onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="18.5"
            />
          </div>

          {/* Masse musculaire (optionnel) */}
          <div>
            <label className="block text-sm font-medium mb-1">Masse musculaire (kg) - Optionnel</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.muscleMass}
              onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="45.0"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Enregistrer la pesée
          </button>
        </form>
      </div>

      {/* Liste des pesées */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Historique</h3>
        
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune pesée enregistrée</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-lg">{entry.weight} kg</div>
                  <div className="text-sm text-gray-600">
                    {entry.date}
                    {entry.bodyFat && ` • Masse grasse: ${entry.bodyFat}%`}
                    {entry.muscleMass && ` • Masse musculaire: ${entry.muscleMass} kg`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
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

export default WeightTab
