import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function StatsTab({ token }) {
  const [mode, setMode] = useState(1)
  const [period, setPeriod] = useState(14)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('all')
  
  const [cardioData, setCardioData] = useState([])
  const [muscuData, setMuscuData] = useState([])
  const [weightData, setWeightData] = useState([])
  const [exercises, setExercises] = useState({ cardio: [], muscu: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - period)
    
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [period])

  useEffect(() => {
    if (startDate && endDate) {
      fetchAllData()
    }
  }, [startDate, endDate, token])

  const fetchAllData = async () => {
    setLoading(true)
    setError('')
    try {
      const [cardio, muscu, weight] = await Promise.all([
        axios.get(`${API_URL}/api/cardio`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/muscu`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/weight`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const cardioArray = Array.isArray(cardio.data) ? cardio.data : []
      const muscuArray = Array.isArray(muscu.data) ? muscu.data : []
      const weightArray = Array.isArray(weight.data) ? weight.data : []

      const start = new Date(startDate)
      const end = new Date(endDate)
      
      const filteredCardio = cardioArray.filter(a => {
        const date = new Date(a.date)
        return date >= start && date <= end
      })
      
      const filteredMuscu = muscuArray.filter(a => {
        const date = new Date(a.date)
        return date >= start && date <= end
      })

      setCardioData(filteredCardio)
      setMuscuData(filteredMuscu)
      setWeightData(weightArray)

      const cardioExercises = [...new Set(filteredCardio.map(a => a.exercise?.name).filter(Boolean))]
      const muscuExercises = [...new Set(filteredMuscu.map(a => a.exercise?.name).filter(Boolean))]
      setExercises({ cardio: cardioExercises, muscu: muscuExercises })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Erreur lors du chargement des données')
      setCardioData([])
      setMuscuData([])
      setWeightData([])
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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-600">{error}</div>
          <button 
            onClick={fetchAllData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Période</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[7, 14, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`p-3 rounded-lg font-medium transition-colors ${
                period === days
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} jours
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>
        </div>
      </div>

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
      {mode === 1 && <CaloriesMode cardioData={cardioData} muscuData={muscuData} startDate={startDate} endDate={endDate} />}
      {mode === 2 && <CardioMode cardioData={cardioData} exercises={exercises.cardio} selectedExercise={selectedExercise} setSelectedExercise={setSelectedExercise} startDate={startDate} endDate={endDate} />}
      {mode === 3 && <MuscuMode muscuData={muscuData} exercises={exercises.muscu} selectedExercise={selectedExercise} setSelectedExercise={setSelectedExercise} startDate={startDate} endDate={endDate} />}
      {mode === 4 && <WeightMode weightData={weightData} startDate={startDate} endDate={endDate} />}
    </div>
  )
}

function CaloriesMode({ cardioData, muscuData, startDate, endDate }) {
  const getDailyData = () => {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = { cardio: 0, muscu: 0, total: 0 }
    }
    
    cardioData.forEach(a => {
      const date = a.date
      if (dailyMap[date]) dailyMap[date].cardio += (a.calories || 0)
    })
    
    muscuData.forEach(a => {
      const date = a.date
      if (dailyMap[date]) dailyMap[date].muscu += (a.calories || 0)
    })
    
    Object.keys(dailyMap).forEach(date => {
      dailyMap[date].total = dailyMap[date].cardio + dailyMap[date].muscu
    })
    
    return dailyMap
  }

  const dailyData = getDailyData()
  const dates = Object.keys(dailyData).sort()
  const totalCardio = cardioData.reduce((sum, a) => sum + (a.calories || 0), 0)
  const totalMuscu = muscuData.reduce((sum, a) => sum + (a.calories || 0), 0)
  const totalCalories = totalCardio + totalMuscu

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="🔥" value={Math.round(totalCalories)} label="Total" color="red" />
        <StatCard icon="🏃" value={Math.round(totalCardio)} label="Cardio" color="blue" />
        <StatCard icon="💪" value={Math.round(totalMuscu)} label="Muscu" color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution jour par jour</h3>
        <DailyLineChart 
          dates={dates}
          data={dates.map(date => dailyData[date].total)}
          color="#ef4444"
          label="Calories"
        />
      </div>
    </div>
  )
}

function CardioMode({ cardioData, exercises, selectedExercise, setSelectedExercise, startDate, endDate }) {
  const filteredData = selectedExercise === 'all' 
    ? cardioData 
    : cardioData.filter(a => a.exercise?.name === selectedExercise)

  const getDailyData = () => {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = 0
    }
    
    filteredData.forEach(a => {
      const date = a.date
      if (dailyMap[date] !== undefined) dailyMap[date] += (a.minutes || 0)
    })
    
    return dailyMap
  }

  const dailyData = getDailyData()
  const dates = Object.keys(dailyData).sort()
  const totalMinutes = filteredData.reduce((sum, a) => sum + (a.minutes || 0), 0)
  const totalCalories = filteredData.reduce((sum, a) => sum + (a.calories || 0), 0)

  return (
    <div className="space-y-6">
      {exercises.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Exercice</label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">Tous les exercices</option>
            {exercises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="🏃" value={filteredData.length} label="Activités" color="blue" />
        <StatCard icon="⏱️" value={`${totalMinutes} min`} label="Durée totale" color="cyan" />
        <StatCard icon="🔥" value={Math.round(totalCalories)} label="Calories" color="orange" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Évolution - {selectedExercise === 'all' ? 'Tous' : selectedExercise}
        </h3>
        <DailyLineChart 
          dates={dates}
          data={dates.map(date => dailyData[date])}
          color="#3b82f6"
          label="Minutes"
        />
      </div>
    </div>
  )
}

function MuscuMode({ muscuData, exercises, selectedExercise, setSelectedExercise, startDate, endDate }) {
  const filteredData = selectedExercise === 'all' 
    ? muscuData 
    : muscuData.filter(a => a.exercise?.name === selectedExercise)

  const getDailyVolume = () => {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = 0
    }
    
    filteredData.forEach(a => {
      const date = a.date
      if (dailyMap[date] !== undefined) {
        dailyMap[date] += ((a.sets || 0) * (a.reps || 0) * (a.weight || 0))
      }
    })
    
    return dailyMap
  }

  const dailyData = getDailyVolume()
  const dates = Object.keys(dailyData).sort()
  const totalVolume = filteredData.reduce((sum, a) => sum + ((a.sets || 0) * (a.reps || 0) * (a.weight || 0)), 0)
  const totalSets = filteredData.reduce((sum, a) => sum + (a.sets || 0), 0)
  const totalCalories = filteredData.reduce((sum, a) => sum + (a.calories || 0), 0)

  return (
    <div className="space-y-6">
      {exercises.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Exercice</label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="all">Tous les exercices</option>
            {exercises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon="💪" value={filteredData.length} label="Exercices" color="purple" />
        <StatCard icon="⚡" value={totalSets} label="Séries" color="pink" />
        <StatCard icon="🏋️" value={`${Math.round(totalVolume)} kg`} label="Volume" color="indigo" />
        <StatCard icon="🔥" value={Math.round(totalCalories)} label="Calories" color="orange" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Évolution du volume - {selectedExercise === 'all' ? 'Tous' : selectedExercise}
        </h3>
        <DailyLineChart 
          dates={dates}
          data={dates.map(date => dailyData[date])}
          color="#a855f7"
          label="Volume (kg)"
        />
      </div>
    </div>
  )
}

function WeightMode({ weightData, startDate, endDate }) {
  const filteredData = weightData
    .filter(w => {
      const wDate = new Date(w.date)
      return wDate >= new Date(startDate) && wDate <= new Date(endDate)
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const latest = weightData[0]
  const first = filteredData[filteredData.length - 1]
  const weightDelta = latest && first ? (latest.weight - first.weight).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="⚖️" value={latest?.weight || '-'} label="Poids actuel (kg)" color="green" />
        <StatCard icon="📈" value={`${weightDelta > 0 ? '+' : ''}${weightDelta} kg`} label="Évolution" color="emerald" />
        <StatCard icon="📊" value={filteredData.length} label="Mesures" color="teal" />
      </div>

      {filteredData.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du poids</h3>
          <DailyLineChart 
            dates={filteredData.map(d => d.date)}
            data={filteredData.map(d => d.weight)}
            color="#10b981"
            label="Poids (kg)"
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  const colors = {
    red: 'from-red-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    cyan: 'from-cyan-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500',
    indigo: 'from-indigo-500 to-purple-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500',
    emerald: 'from-emerald-500 to-teal-500',
    teal: 'from-teal-500 to-cyan-500'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color] || colors.blue} rounded-xl shadow-sm p-6 text-white`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  )
}

function DailyLineChart({ dates, data, color, label }) {
  if (!dates || dates.length === 0 || !data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée pour la période sélectionnée
      </div>
    )
  }

  const maxValue = Math.max(...data, 1)
  const minValue = Math.min(...data, 0)
  const range = maxValue - minValue || 1

  return (
    <div>
      <div className="relative h-64 border border-gray-200 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
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
          {data.length > 1 && (
            <polyline
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 800
                const y = 190 - ((d - minValue) / range) * 170
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {data.map((d, i) => {
            const x = data.length === 1 ? 400 : (i / (data.length - 1)) * 800
            const y = 190 - ((d - minValue) / range) * 170
            return (
              <circle 
                key={i} 
                cx={x} 
                cy={y} 
                r="5" 
                fill={color}
              />
            )
          })}
        </svg>
      </div>
      
      <div className="flex justify-between mt-4 text-xs text-gray-500 overflow-x-auto gap-2">
        {dates.map((date, i) => {
          const showLabel = dates.length <= 14 || i % Math.ceil(dates.length / 10) === 0 || i === dates.length - 1
          return showLabel ? (
            <span key={i} className="whitespace-nowrap">
              {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            </span>
          ) : null
        })}
      </div>

      <div className="mt-2 text-center text-sm text-gray-600">
        {label}: Min <span className="font-semibold">{minValue.toFixed(1)}</span> | 
        Max <span className="font-semibold">{maxValue.toFixed(1)}</span> | 
        Moy <span className="font-semibold">{(data.reduce((a,b) => a+b, 0) / data.length).toFixed(1)}</span>
      </div>
    </div>
  )
}

export default StatsTab
