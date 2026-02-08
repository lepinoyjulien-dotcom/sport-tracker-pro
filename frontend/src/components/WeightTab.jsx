import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function WeightTab({ token, currentDate }) {
  const [entries, setEntries] = useState([])
  const [weight, setWeight] = useState('')
  const [muscleMass, setMuscleMass] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/weight`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEntries(response.data)
    } catch (error) {
      console.error('Error fetching entries:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weight) {
      setMessage('Le poids est obligatoire')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await axios.post(
        `${API_URL}/api/weight`,
        {
          date: currentDate,
          weight: parseFloat(weight),
          muscleMass: muscleMass ? parseFloat(muscleMass) : null,
          bodyFat: bodyFat ? parseFloat(bodyFat) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('✅ Poids enregistré !')
      setWeight('')
      setMuscleMass('')
      setBodyFat('')
      fetchEntries()

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette mesure ?')) return

    try {
      await axios.delete(`${API_URL}/api/weight/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('✅ Mesure supprimée')
      fetchEntries()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression')
    }
  }

  // Calculate deltas
  const latest = entries[0]
  const previous = entries[1]
  const first = entries[entries.length - 1]

  const getDelta = (current, comparison, field) => {
    if (!current || !comparison || !current[field] || !comparison[field]) return null
    return current[field] - comparison[field]
  }

  const formatDelta = (delta) => {
    if (delta === null) return '-'
    const sign = delta > 0 ? '+' : ''
    return `${sign}${delta.toFixed(1)} kg`
  }

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      {latest && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernière mesure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-green-600">{latest.weight} kg</div>
              <div className="text-sm text-gray-600">Poids</div>
              {previous && (
                <div className="text-xs text-gray-500 mt-1">
                  vs précédent: {formatDelta(getDelta(latest, previous, 'weight'))}
                </div>
              )}
            </div>
            {latest.muscleMass && (
              <div>
                <div className="text-3xl font-bold text-blue-600">{latest.muscleMass} kg</div>
                <div className="text-sm text-gray-600">Masse musculaire</div>
                {previous && (
                  <div className="text-xs text-gray-500 mt-1">
                    vs précédent: {formatDelta(getDelta(latest, previous, 'muscleMass'))}
                  </div>
                )}
              </div>
            )}
            {latest.bodyFat && (
              <div>
                <div className="text-3xl font-bold text-orange-600">{latest.bodyFat}%</div>
                <div className="text-sm text-gray-600">Masse grasse</div>
                {previous && (
                  <div className="text-xs text-gray-500 mt-1">
                    vs précédent: {formatDelta(getDelta(latest, previous, 'bodyFat'))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delta vs first */}
          {first && first !== latest && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Évolution depuis le début</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Poids: </span>
                  <span className="font-semibold">{formatDelta(getDelta(latest, first, 'weight'))}</span>
                </div>
                {latest.muscleMass && first.muscleMass && (
                  <div>
                    <span className="text-gray-600">Muscle: </span>
                    <span className="font-semibold">{formatDelta(getDelta(latest, first, 'muscleMass'))}</span>
                  </div>
                )}
                {latest.bodyFat && first.bodyFat && (
                  <div>
                    <span className="text-gray-600">Graisse: </span>
                    <span className="font-semibold">{formatDelta(getDelta(latest, first, 'bodyFat'))}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Entry Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle mesure</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="75.5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masse musculaire (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="35.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masse grasse (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="15.0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la mesure'}
          </button>
        </form>
      </div>

      {/* Simple Graph */}
      {entries.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution (14 dernières mesures)</h2>
          <SimpleLineChart data={entries.slice(0, 14).reverse()} />
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Historique ({entries.length} mesures)
        </h2>

        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚖️</div>
            <p>Aucune mesure enregistrée</p>
            <p className="text-sm mt-1">Ajoutez votre première mesure ci-dessus !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Poids: {entry.weight} kg
                    {entry.muscleMass && ` • Muscle: ${entry.muscleMass} kg`}
                    {entry.bodyFat && ` • Graisse: ${entry.bodyFat}%`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="px-4 py-2 text-sm text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ))}
            {entries.length > 5 && (
              <div className="text-center text-sm text-gray-500 mt-4">
                + {entries.length - 5} autres mesures
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Simple Line Chart Component
function SimpleLineChart({ data }) {
  const maxWeight = Math.max(...data.map(d => d.weight))
  const minWeight = Math.min(...data.map(d => d.weight))
  const range = maxWeight - minWeight || 1

  return (
    <div className="relative h-64">
      <svg className="w-full h-full" viewBox="0 0 800 200">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="0"
            y1={i * 50}
            x2="800"
            y2={i * 50}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Line */}
        <polyline
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 800
            const y = 200 - ((d.weight - minWeight) / range) * 180 - 10
            return `${x},${y}`
          }).join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
        />

        {/* Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 800
          const y = 200 - ((d.weight - minWeight) / range) * 180 - 10
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill="#10b981"
            />
          )
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{data[0]?.weight} kg</span>
        <span>{data[data.length - 1]?.weight} kg</span>
      </div>
    </div>
  )
}

export default WeightTab
