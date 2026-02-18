import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function StatsTab({ token }) {
  const [mode, setMode] = useState('calories')
  const [period, setPeriod] = useState(7)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('all')
  
  const [cardioData, setCardioData] = useState([])
  const [muscuData, setMuscuData] = useState([])
  const [weightData, setWeightData] = useState([])
  const [exercises, setExercises] = useState({ cardio: [], muscu: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cardioRes, muscuRes, weightRes] = await Promise.all([
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

      setCardioData(cardioRes.data || [])
      setMuscuData(muscuRes.data || [])
      setWeightData(weightRes.data || [])

      // Extract unique exercises
      const cardioExercises = [...new Set(
        (cardioRes.data || []).map(a => a.exercise?.name).filter(Boolean)
      )]
      const muscuExercises = [...new Set(
        (muscuRes.data || []).map(a => a.exercise?.name).filter(Boolean)
      )]
      
      setExercises({ cardio: cardioExercises, muscu: muscuExercises })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter data by date range
  const getDateRange = () => {
    const today = new Date()
    let startDate

    if (period === 'custom' && customStartDate && customEndDate) {
      return { start: customStartDate, end: customEndDate }
    }

    const daysAgo = new Date(today)
    daysAgo.setDate(today.getDate() - period)
    startDate = daysAgo.toISOString().split('T')[0]

    return {
      start: startDate,
      end: today.toISOString().split('T')[0]
    }
  }

  const filterByDateRange = (data) => {
    const { start, end } = getDateRange()
    return data.filter(item => item.date >= start && item.date <= end)
  }

  // Aggregate data by date
  const aggregateByDate = (data, valueKey) => {
    const dateMap = {}
    
    data.forEach(item => {
      if (!dateMap[item.date]) {
        dateMap[item.date] = 0
      }
      dateMap[item.date] += item[valueKey] || 0
    })

    return Object.entries(dateMap)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // Calculate chart data based on mode
  const getChartData = () => {
    const filteredCardio = filterByDateRange(cardioData)
    const filteredMuscu = filterByDateRange(muscuData)
    const filteredWeight = filterByDateRange(weightData)

    switch (mode) {
      case 'calories': {
        const cardioCalories = aggregateByDate(filteredCardio, 'calories')
        const muscuCalories = aggregateByDate(filteredMuscu, 'calories')
        
        // Merge cardio and muscu calories
        const allDates = new Set([
          ...cardioCalories.map(d => d.date),
          ...muscuCalories.map(d => d.date)
        ])
        
        return Array.from(allDates).map(date => {
          const cardio = cardioCalories.find(d => d.date === date)?.value || 0
          const muscu = muscuCalories.find(d => d.date === date)?.value || 0
          return { date, value: cardio + muscu, label: `${Math.round(cardio + muscu)} cal` }
        }).sort((a, b) => a.date.localeCompare(b.date))
      }

      case 'cardio': {
        let data = filteredCardio
        if (selectedExercise !== 'all') {
          data = data.filter(a => a.exercise?.name === selectedExercise)
        }
        return aggregateByDate(data, 'minutes').map(d => ({
          ...d,
          label: `${d.value} min`
        }))
      }

      case 'muscu': {
        let data = filteredMuscu
        if (selectedExercise !== 'all') {
          data = data.filter(a => a.exercise?.name === selectedExercise)
        }
        // Aggregate total sets
        const dateMap = {}
        data.forEach(item => {
          if (!dateMap[item.date]) {
            dateMap[item.date] = 0
          }
          dateMap[item.date] += item.sets || 0
        })
        return Object.entries(dateMap)
          .map(([date, value]) => ({ date, value, label: `${value} séries` }))
          .sort((a, b) => a.date.localeCompare(b.date))
      }

      case 'weight': {
        return filteredWeight
          .map(w => ({
            date: w.date,
            value: w.weight,
            label: `${w.weight} kg`
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
      }

      default:
        return []
    }
  }

  const chartData = getChartData()

  // Calculate stats
  const getStats = () => {
    if (chartData.length === 0) return null

    const values = chartData.map(d => d.value)
    const total = values.reduce((sum, v) => sum + v, 0)
    const avg = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    return { total, avg, max, min }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">📊 Statistiques</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setMode('calories')}
            className={`p-4 rounded-lg font-medium transition ${
              mode === 'calories'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🔥 Calories
          </button>
          <button
            onClick={() => setMode('cardio')}
            className={`p-4 rounded-lg font-medium transition ${
              mode === 'cardio'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            🏃 Cardio
          </button>
          <button
            onClick={() => setMode('muscu')}
            className={`p-4 rounded-lg font-medium transition ${
              mode === 'muscu'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            💪 Muscu
          </button>
          <button
            onClick={() => setMode('weight')}
            className={`p-4 rounded-lg font-medium transition ${
              mode === 'weight'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            ⚖️ Poids
          </button>
        </div>

        {/* Period Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Période</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[7, 14, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-lg ${
                  period === days
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {days} jours
              </button>
            ))}
            <button
              onClick={() => setPeriod('custom')}
              className={`px-4 py-2 rounded-lg ${
                period === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Personnalisé
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Exercise Filter */}
        {(mode === 'cardio' || mode === 'muscu') && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Exercice</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">Tous les exercices</option>
              {exercises[mode].map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">
          {mode === 'calories' && 'Évolution des calories'}
          {mode === 'cardio' && `Évolution - ${selectedExercise === 'all' ? 'Tous les exercices' : selectedExercise}`}
          {mode === 'muscu' && `Évolution - ${selectedExercise === 'all' ? 'Tous les exercices' : selectedExercise}`}
          {mode === 'weight' && 'Évolution du poids'}
        </h3>

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune donnée pour cette période
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-lg font-bold">{Math.round(stats.total)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Moyenne</div>
                  <div className="text-lg font-bold">{Math.round(stats.avg)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Maximum</div>
                  <div className="text-lg font-bold">{Math.round(stats.max)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Minimum</div>
                  <div className="text-lg font-bold">{Math.round(stats.min)}</div>
                </div>
              </div>
            )}

            {/* Simple Bar Chart */}
            <div className="relative border-b border-l border-gray-300 ml-8" style={{ height: '300px' }}>
              <div className="flex justify-around items-end h-full pb-12 px-4" style={{ height: '100%' }}>
                {chartData.map((item, index) => {
                  const maxValue = Math.max(...chartData.map(d => d.value))
                  const heightPx = maxValue > 0 ? Math.max((item.value / maxValue) * 250, 20) : 0
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-end"
                      style={{ width: `${100 / chartData.length}%`, maxWidth: '80px' }}
                    >
                      {/* Bar Container */}
                      <div className="relative w-full flex items-end justify-center group">
                        <div
                          className="w-16 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ height: `${heightPx}px` }}
                          title={item.label}
                        >
                          {/* Value on top of bar */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                            {Math.round(item.value)}
                          </div>
                        </div>
                        
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {item.label}
                        </div>
                      </div>
                      
                      {/* Date label */}
                      <div className="text-xs text-gray-600 mt-4 text-center">
                        {new Date(item.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StatsTab
