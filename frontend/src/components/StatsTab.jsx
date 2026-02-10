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
    if (startDate && endDate && token) {
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
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/muscu`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/weight`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ])

      const cardioArray = Array.isArray(cardio.data) ? cardio.data : []
      const muscuArray = Array.isArray(muscu.data) ? muscu.data : []
      const weightArray = Array.isArray(weight.data) ? weight.data : []

      const start = new Date(startDate)
      const end = new Date(endDate)
      
      const filteredCardio = cardioArray.filter(a => {
        if (!a || !a.date) return false
        const date = new Date(a.date)
        return date >= start && date <= end
      })
      
      const filteredMuscu = muscuArray.filter(a => {
        if (!a || !a.date) return false
        const date = new Date(a.date)
        return date >= start && date <= end
      })

      setCardioData(filteredCardio)
      setMuscuData(filteredMuscu)
      setWeightData(weightArray)

      const cardioExercises = [...new Set(
        filteredCardio
          .map(a => a.exercise?.name)
          .filter(name => name && typeof name === 'string')
      )]
      
      const muscuExercises = [...new Set(
        filteredMuscu
          .map(a => a.exercise?.name)
          .filter(name => name && typeof name === 'string')
      )]
      
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
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchAllData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
  if (!Array.isArray(cardioData) || !Array.isArray(muscuData)) {
    return <div className="text-center py-8 text-gray-500">Données invalides</div>
  }

  const getDailyData = () => {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = { cardio: 0, muscu: 0, total: 0 }
    }
    
    cardioData.forEach(a => {
      if (a && a.date && dailyMap[a.date]) {
        dailyMap[a.date].cardio += (a.calories || 0)
      }
    })
    
    muscuData.forEach(a => {
      if (a && a.date && dailyMap[a.date]) {
        dailyMap[a.date].muscu += (a.calories || 0)
      }
    })
    
    Object.keys(dailyMap).forEach(date => {
      dailyMap[date].total = dailyMap[date].cardio + dailyMap[date].muscu
    })
    
    return dailyMap
  }

  const dailyData = getDailyData()
  const dates = Object.keys(dailyData).sort()
  const totalCardio = cardioData.reduce((sum, a) => sum + (a?.calories || 0), 0)
  const totalMuscu = muscuData.reduce((sum, a) => sum + (a?.calories || 0), 0)
  const totalCalories = totalCardio + totalMuscu

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="🔥" value={Math.round(totalCalories)} label="Total calories" />
        <StatCard icon="🏃" value={Math.round(totalCardio)} label="Cardio" />
        <StatCard icon="💪" value={Math.round(totalMuscu)} label="Muscu" />
      </div>

      {dates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution jour par jour</h3>
          <SimpleBarChart 
            dates={dates}
            data={dates.map(date => dailyData[date].total)}
            label="Calories"
          />
        </div>
      )}
    </div>
  )
}

function CardioMode({ cardioData, exercises, selectedExercise, setSelectedExercise, startDate, endDate }) {
  if (!Array.isArray(cardioData) || !Array.isArray(exercises)) {
    return <div className="text-center py-8 text-gray-500">Données invalides</div>
  }

  const filteredData = selectedExercise === 'all' 
    ? cardioData 
    : cardioData.filter(a => a?.exercise?.name === selectedExercise)

  const getDailyData = () => {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = 0
    }
    
    filteredData.forEach(a => {
      if (a && a.date && dailyMap[a.date] !== undefined) {
        dailyMap[a.date] += (a.minutes || 0)
      }
    })
    
    return dailyMap
  }

  const dailyData = getDailyData()
  const dates = Object.keys(dailyData).sort()
  const totalMinutes = filteredData.reduce((sum, a) => sum + (a?.minutes || 0), 0)
  const totalCalories = filteredData.reduce((sum, a) => sum + (a?.calories || 0), 0)

  return (
    <div className="space-y-6">
      {exercises.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par exercice</label>
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
        <StatCard icon="🏃" value={filteredData.length} label="Activités" />
        <StatCard icon="⏱️" value={`${totalMinutes} min`} label="Durée totale" />
        <StatCard icon="🔥" value={Math.round(totalCalories)} label="Calories" />
      </div>

      {dates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution - {selectedExercise === 'all' ? 'Tous' : selectedExercise}
          </h3>
          <SimpleBarChart 
            dates={dates}
            data={dates.map(date => dailyData[date])}
            label="Minutes"
          />
        </div>
      )}
    </div>
  )
}

function MuscuMode({ muscuData, exercises, selectedExercise, setSelectedExercise, startDate, endDate }) {
  if (!Array.isArray(muscuData) || !Array.isArray(exercises)) {
    return <div className="text-center py-8 text-gray-500">Données invalides</div>
  }

  const filteredData = selectedExercise === 'all' 
    ? muscuData 
    : muscuData.filter(a => a?.exercise?.name === selectedExercise)

  const getDailyVolume = () => {
    const dailyMap = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyMap[dateStr] = 0
    }
    
    filteredData.forEach(a => {
      if (a && a.date && dailyMap[a.date] !== undefined) {
        const volume = (a.sets || 0) * (a.reps || 0) * (a.weight || 0)
        dailyMap[a.date] += volume
      }
    })
    
    return dailyMap
  }

  const dailyData = getDailyVolume()
  const dates = Object.keys(dailyData).sort()
  const totalVolume = filteredData.reduce((sum, a) => {
    const volume = (a?.sets || 0) * (a?.reps || 0) * (a?.weight || 0)
    return sum + volume
  }, 0)
  const totalSets = filteredData.reduce((sum, a) => sum + (a?.sets || 0), 0)
  const totalCalories = filteredData.reduce((sum, a) => sum + (a?.calories || 0), 0)

  return (
    <div className="space-y-6">
      {exercises.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par exercice</label>
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
        <StatCard icon="💪" value={filteredData.length} label="Exercices" />
        <StatCard icon="⚡" value={totalSets} label="Séries" />
        <StatCard icon="🏋️" value={`${Math.round(totalVolume)} kg`} label="Volume" />
        <StatCard icon="🔥" value={Math.round(totalCalories)} label="Calories" />
      </div>

      {dates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution du volume - {selectedExercise === 'all' ? 'Tous' : selectedExercise}
          </h3>
          <SimpleBarChart 
            dates={dates}
            data={dates.map(date => dailyData[date])}
            label="Volume (kg)"
          />
        </div>
      )}
    </div>
  )
}

function WeightMode({ weightData, startDate, endDate }) {
  if (!Array.isArray(weightData)) {
    return <div className="text-center py-8 text-gray-500">Données invalides</div>
  }

  const filteredData = weightData
    .filter(w => {
      if (!w || !w.date) return false
      const wDate = new Date(w.date)
      return wDate >= new Date(startDate) && wDate <= new Date(endDate)
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const latest = weightData[0]
  const first = filteredData[filteredData.length - 1]
  const weightDelta = (latest && first && latest.weight && first.weight) 
    ? (latest.weight - first.weight).toFixed(1) 
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="⚖️" value={latest?.weight || '-'} label="Poids actuel (kg)" />
        <StatCard icon="📈" value={`${weightDelta > 0 ? '+' : ''}${weightDelta} kg`} label="Évolution" />
        <StatCard icon="📊" value={filteredData.length} label="Mesures" />
      </div>

      {filteredData.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du poids</h3>
          <SimpleBarChart 
            dates={filteredData.map(d => d.date)}
            data={filteredData.map(d => d.weight)}
            label="Poids (kg)"
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function SimpleBarChart({ dates, data, label }) {
  if (!Array.isArray(dates) || !Array.isArray(data) || dates.length === 0 || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée pour la période sélectionnée
      </div>
    )
  }

  const maxValue = Math.max(...data.filter(d => typeof d === 'number'), 1)
  const showDates = dates.length <= 14

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 h-48">
        {data.map((value, i) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:opacity-80"
                style={{ height: `${height}%`, minHeight: value > 0 ? '4px' : '0' }}
                title={`${dates[i]}: ${value} ${label}`}
              />
              {showDates && (
                <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                  {new Date(dates[i]).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="text-center text-sm text-gray-600">
        {label}: Max <span className="font-semibold">{maxValue.toFixed(1)}</span> | 
        Total <span className="font-semibold">{data.reduce((a, b) => a + b, 0).toFixed(1)}</span>
      </div>
    </div>
  )
}

export default StatsTab
