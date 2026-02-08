import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function StatsTab({ token }) {
  const [mode, setMode] = useState(1)
  const [cardioData, setCardioData] = useState([])
  const [muscuData, setMuscuData] = useState([])
  const [weightData, setWeightData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [cardio, muscu, weight] = await Promise.all([
        axios.get(`${API_URL}/api/cardio`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate }
        }),
        axios.get(`${API_URL}/api/muscu`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate }
        }),
        axios.get(`${API_URL}/api/weight`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setCardioData(cardio.data)
      setMuscuData(muscu.data)
      setWeightData(weight.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const modes = [
    { id: 1, label: 'Calories', icon: '🔥', color: 'from-red-500 to-orange-500' },
    { id: 2, label: 'Cardio', icon: '🏃', color: 'from-blue-500 to-cyan-500' },
    { id: 3, label: 'Muscu', icon: '💪', color: 'from-purple-500 to-pink-500' },
    { id: 4, label: 'Poids', icon: '⚖️', color: 'from-green-500 to-emerald-500' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-gray-600">Chargement des statistiques...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode de visualisation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-4 rounded-lg font-medium transition-all ${
                mode === m.id
                  ? `bg-gradient-to-r ${m.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-sm">{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Content */}
      {mode === 1 && <CaloriesMode cardioData={cardioData} muscuData={muscuData} />}
      {mode === 2 && <CardioMode cardioData={cardioData} />}
      {mode === 3 && <MuscuMode muscuData={muscuData} />}
      {mode === 4 && <WeightMode weightData={weightData} />}
    </div>
  )
}

function CaloriesMode({ cardioData, muscuData }) {
  // Group by date
  const caloriesByDate = {}
  
  cardioData.forEach(a => {
    const date = a.date
    if (!caloriesByDate[date]) caloriesByDate[date] = { cardio: 0, muscu: 0 }
    caloriesByDate[date].cardio += a.calories
  })

  muscuData.forEach(a => {
    const date = a.date
    if (!caloriesByDate[date]) caloriesByDate[date] = { cardio: 0, muscu: 0 }
    caloriesByDate[date].muscu += a.calories
  })

  const dates = Object.keys(caloriesByDate).sort().slice(-14)
  const totalCardio = cardioData.reduce((sum, a) => sum + a.calories, 0)
  const totalMuscu = muscuData.reduce((sum, a) => sum + a.calories, 0)
  const totalCalories = totalCardio + totalMuscu

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="🔥" value={totalCalories} label="Total" color="red" />
        <StatCard icon="🏃" value={totalCardio} label="Cardio" color="blue" />
        <StatCard icon="💪" value={totalMuscu} label="Muscu" color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calories (14 derniers jours)</h3>
        <SimpleBarChart 
          data={dates.map(date => ({
            label: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            value: (caloriesByDate[date].cardio + caloriesByDate[date].muscu)
          }))}
          color="#ef4444"
        />
      </div>
    </div>
  )
}

function CardioMode({ cardioData }) {
  const byExercise = {}
  
  cardioData.forEach(a => {
    const name = a.exercise?.name || 'Autre'
    if (!byExercise[name]) byExercise[name] = { minutes: 0, count: 0 }
    byExercise[name].minutes += a.minutes
    byExercise[name].count += 1
  })

  const topExercises = Object.entries(byExercise)
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .slice(0, 5)

  const totalMinutes = cardioData.reduce((sum, a) => sum + a.minutes, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="🏃" value={cardioData.length} label="Activités" color="blue" />
        <StatCard icon="⏱️" value={`${totalMinutes} min`} label="Durée totale" color="cyan" />
        <StatCard icon="📊" value={Object.keys(byExercise).length} label="Exercices" color="indigo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 exercices</h3>
        {topExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏃</div>
            <p>Aucune activité cardio</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topExercises.map(([name, data], index) => (
              <div key={name} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-blue-500 w-8">#{index + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{name}</div>
                  <div className="text-sm text-gray-600">
                    {data.minutes} min • {data.count} séances
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(data.minutes / topExercises[0][1].minutes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MuscuMode({ muscuData }) {
  const byExercise = {}
  
  muscuData.forEach(a => {
    const name = a.exercise?.name || 'Autre'
    if (!byExercise[name]) byExercise[name] = { volume: 0, count: 0 }
    byExercise[name].volume += (a.sets * a.reps * a.weight)
    byExercise[name].count += 1
  })

  const topExercises = Object.entries(byExercise)
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 5)

  const totalVolume = muscuData.reduce((sum, a) => sum + (a.sets * a.reps * a.weight), 0)
  const totalSets = muscuData.reduce((sum, a) => sum + a.sets, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="💪" value={muscuData.length} label="Exercices" color="purple" />
        <StatCard icon="⚡" value={totalSets} label="Séries" color="pink" />
        <StatCard icon="🏋️" value={`${totalVolume.toFixed(0)} kg`} label="Volume" color="indigo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 exercices (volume)</h3>
        {topExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💪</div>
            <p>Aucun exercice de musculation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topExercises.map(([name, data], index) => (
              <div key={name} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-purple-500 w-8">#{index + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{name}</div>
                  <div className="text-sm text-gray-600">
                    {data.volume.toFixed(0)} kg • {data.count} séances
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(data.volume / topExercises[0][1].volume) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WeightMode({ weightData }) {
  const recent = weightData.slice(0, 14).reverse()
  const latest = weightData[0]
  const first = weightData[weightData.length - 1]

  const weightDelta = latest && first ? (latest.weight - first.weight).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="⚖️" value={latest?.weight || '-'} label="Poids actuel (kg)" color="green" />
        <StatCard icon="📈" value={`${weightDelta > 0 ? '+' : ''}${weightDelta} kg`} label="Évolution" color="emerald" />
        <StatCard icon="📊" value={weightData.length} label="Mesures" color="teal" />
      </div>

      {recent.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du poids</h3>
          <SimpleLineChart 
            data={recent.map(d => ({
              label: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
              value: d.weight
            }))}
            color="#10b981"
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function SimpleBarChart({ data, color }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-16 text-xs text-gray-600">{item.label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div 
              className="h-6 rounded-full transition-all"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                background: color
              }}
            />
            <span className="absolute right-2 top-0.5 text-xs font-medium text-gray-700">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SimpleLineChart({ data, color }) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  return (
    <div>
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 800 150">
          {/* Grid */}
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#e5e7eb" strokeWidth="1" />
          ))}

          {/* Line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 800
              const y = 140 - ((d.value - minValue) / range) * 120
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="3"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 800
            const y = 140 - ((d.value - minValue) / range) * 120
            return <circle key={i} cx={x} cy={y} r="4" fill={color} />
          })}
        </svg>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => i % Math.ceil(data.length / 7) === 0 && (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export default StatsTab
