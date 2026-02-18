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
        // Group by date and get max weight
        const dateMap = {}
        data.forEach(item => {
          if (!dateMap[item.date]) {
            dateMap[item.date] = 0
          }
          dateMap[item.date] = Math.max(dateMap[item.date], item.weight || 0)
        })
        return Object.entries(dateMap)
          .map(([date, value]) => ({ date, value, label: `${value} kg` }))
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

  // MUSCU ANALYSIS
  const getMuscuAnalysis = () => {
    if (mode !== 'muscu' || selectedExercise === 'all') return null

    const filteredData = filterByDateRange(muscuData)
      .filter(a => a.exercise?.name === selectedExercise)
      .sort((a, b) => a.date.localeCompare(b.date))

    if (filteredData.length === 0) return null

    // All historical data for comparison
    const allHistorical = muscuData
      .filter(a => a.exercise?.name === selectedExercise)
      .sort((a, b) => a.date.localeCompare(b.date))

    // Group by weight to analyze reps
    const weightProgressMap = {}
    
    filteredData.forEach(session => {
      const weight = session.weight || 0
      const key = weight.toString()
      
      if (!weightProgressMap[key]) {
        weightProgressMap[key] = []
      }
      
      weightProgressMap[key].push({
        date: session.date,
        sets: session.sets,
        reps: session.reps,
        totalReps: session.sets * session.reps
      })
    })

    // Calculate progress for each weight
    const weightProgress = Object.entries(weightProgressMap).map(([weight, sessions]) => {
      const sorted = sessions.sort((a, b) => a.date.localeCompare(b.date))
      const latest = sorted[sorted.length - 1]
      const previous = sorted[sorted.length - 2]
      const first = sorted[0]

      let vsLast = 0
      let vsFirst = 0

      if (previous) {
        vsLast = latest.totalReps - previous.totalReps
      }
      
      if (first && sorted.length > 1) {
        vsFirst = latest.totalReps - first.totalReps
      }

      return {
        weight: parseFloat(weight),
        latestDate: latest.date,
        latestReps: latest.totalReps,
        latestSets: latest.sets,
        latestRepsPerSet: latest.reps,
        vsLast,
        vsFirst,
        sessionsCount: sessions.length
      }
    }).sort((a, b) => b.weight - a.weight)

    // Weight progression over time
    const weightByDate = filteredData.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = { maxWeight: 0, totalReps: 0 }
      }
      acc[session.date].maxWeight = Math.max(acc[session.date].maxWeight, session.weight || 0)
      acc[session.date].totalReps += (session.sets * session.reps)
      return acc
    }, {})

    const weightProgression = Object.entries(weightByDate)
      .map(([date, data]) => ({ ...data, date }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate progression vs previous and first
    weightProgression.forEach((item, index) => {
      if (index > 0) {
        item.vsLast = item.maxWeight - weightProgression[index - 1].maxWeight
      } else {
        item.vsLast = 0
      }
      item.vsFirst = item.maxWeight - weightProgression[0].maxWeight
    })

    return {
      weightProgress,
      weightProgression
    }
  }

  const muscuAnalysis = getMuscuAnalysis()

  // WEIGHT ANALYSIS
  const getWeightAnalysis = () => {
    if (mode !== 'weight') return null

    const filteredData = filterByDateRange(weightData)
      .sort((a, b) => a.date.localeCompare(b.date))

    if (filteredData.length === 0) return null

    // All historical data
    const allHistorical = weightData.sort((a, b) => a.date.localeCompare(b.date))
    const firstEver = allHistorical[0]

    const analysis = filteredData.map((entry, index) => {
      const previous = index > 0 ? filteredData[index - 1] : null
      
      return {
        date: entry.date,
        weight: entry.weight,
        bodyFat: entry.bodyFat,
        muscleMass: entry.muscleMass,
        // vs previous
        weightDiff: previous ? entry.weight - previous.weight : 0,
        bodyFatDiff: previous && entry.bodyFat && previous.bodyFat 
          ? entry.bodyFat - previous.bodyFat : null,
        muscleMassDiff: previous && entry.muscleMass && previous.muscleMass 
          ? entry.muscleMass - previous.muscleMass : null,
        // vs first
        weightDiffFirst: entry.weight - firstEver.weight,
        bodyFatDiffFirst: entry.bodyFat && firstEver.bodyFat 
          ? entry.bodyFat - firstEver.bodyFat : null,
        muscleMassDiffFirst: entry.muscleMass && firstEver.muscleMass 
          ? entry.muscleMass - firstEver.muscleMass : null
      }
    })

    return analysis
  }

  const weightAnalysis = getWeightAnalysis()

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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">
          {mode === 'calories' && 'Évolution des calories'}
          {mode === 'cardio' && `Évolution - ${selectedExercise === 'all' ? 'Tous les exercices' : selectedExercise}`}
          {mode === 'muscu' && `Évolution du poids porté - ${selectedExercise === 'all' ? 'Tous les exercices' : selectedExercise}`}
          {mode === 'weight' && 'Évolution du poids corporel'}
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
                  <div className="text-lg font-bold">{Math.round(stats.total * 10) / 10}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Moyenne</div>
                  <div className="text-lg font-bold">{Math.round(stats.avg * 10) / 10}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Maximum</div>
                  <div className="text-lg font-bold">{Math.round(stats.max * 10) / 10}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Minimum</div>
                  <div className="text-lg font-bold">{Math.round(stats.min * 10) / 10}</div>
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
                      <div className="relative w-full flex items-end justify-center group">
                        <div
                          className="w-16 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                          style={{ height: `${heightPx}px` }}
                          title={item.label}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                            {Math.round(item.value * 10) / 10}
                          </div>
                        </div>
                        
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {item.label}
                        </div>
                      </div>
                      
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

      {/* MUSCU DETAILED ANALYSIS */}
      {mode === 'muscu' && selectedExercise !== 'all' && muscuAnalysis && (
        <>
          {/* Weight Progression Table */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">📈 Progression par poids</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Poids (kg)</th>
                    <th className="px-4 py-3 text-left font-medium">Dernière séance</th>
                    <th className="px-4 py-3 text-center font-medium">Répétitions totales</th>
                    <th className="px-4 py-3 text-center font-medium">vs Séance précédente</th>
                    <th className="px-4 py-3 text-center font-medium">vs Début période</th>
                    <th className="px-4 py-3 text-center font-medium">Nb séances</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {muscuAnalysis.weightProgress.map((wp, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">{wp.weight} kg</td>
                      <td className="px-4 py-3 text-gray-600">{wp.latestDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium">{wp.latestReps}</span>
                        <span className="text-gray-500 text-xs ml-1">
                          ({wp.latestSets}×{wp.latestRepsPerSet})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {wp.vsLast === 0 ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={wp.vsLast > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {wp.vsLast > 0 ? '+' : ''}{wp.vsLast}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {wp.vsFirst === 0 ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={wp.vsFirst > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {wp.vsFirst > 0 ? '+' : ''}{wp.vsFirst}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{wp.sessionsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Weight Progression */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">📅 Évolution du poids max par séance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-center font-medium">Poids max (kg)</th>
                    <th className="px-4 py-3 text-center font-medium">Reps totales</th>
                    <th className="px-4 py-3 text-center font-medium">vs Séance précédente</th>
                    <th className="px-4 py-3 text-center font-medium">vs Début période</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {muscuAnalysis.weightProgression.map((prog, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{prog.date}</td>
                      <td className="px-4 py-3 text-center font-bold">{prog.maxWeight} kg</td>
                      <td className="px-4 py-3 text-center">{prog.totalReps}</td>
                      <td className="px-4 py-3 text-center">
                        {prog.vsLast === 0 ? (
                          <span className="text-gray-400">=</span>
                        ) : (
                          <span className={prog.vsLast > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {prog.vsLast > 0 ? '+' : ''}{prog.vsLast} kg
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {prog.vsFirst === 0 ? (
                          <span className="text-gray-400">=</span>
                        ) : (
                          <span className={prog.vsFirst > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {prog.vsFirst > 0 ? '+' : ''}{prog.vsFirst} kg
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* WEIGHT DETAILED ANALYSIS */}
      {mode === 'weight' && weightAnalysis && weightAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">📊 Analyse détaillée des pesées</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-center font-medium">Poids (kg)</th>
                  <th className="px-4 py-3 text-center font-medium">M. Grasse (%)</th>
                  <th className="px-4 py-3 text-center font-medium">M. Muscu (kg)</th>
                  <th className="px-4 py-3 text-center font-medium" colSpan="3">vs Pesée précédente</th>
                  <th className="px-4 py-3 text-center font-medium" colSpan="3">vs Début période</th>
                </tr>
                <tr className="bg-gray-50 border-t">
                  <th colSpan="4"></th>
                  <th className="px-2 py-2 text-center text-xs text-gray-600">Poids</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-600">Grasse</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-600">Muscu</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-600">Poids</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-600">Grasse</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-600">Muscu</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {weightAnalysis.map((wa, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{wa.date}</td>
                    <td className="px-4 py-3 text-center font-bold">{wa.weight}</td>
                    <td className="px-4 py-3 text-center">{wa.bodyFat ? `${wa.bodyFat}%` : '-'}</td>
                    <td className="px-4 py-3 text-center">{wa.muscleMass || '-'}</td>
                    
                    {/* vs Previous */}
                    <td className="px-2 py-3 text-center">
                      {wa.weightDiff === 0 ? (
                        <span className="text-gray-400">=</span>
                      ) : (
                        <span className={wa.weightDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                          {wa.weightDiff > 0 ? '+' : ''}{wa.weightDiff.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      {wa.bodyFatDiff === null ? '-' : (
                        <span className={wa.bodyFatDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                          {wa.bodyFatDiff > 0 ? '+' : ''}{wa.bodyFatDiff.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      {wa.muscleMassDiff === null ? '-' : (
                        <span className={wa.muscleMassDiff > 0 ? 'text-green-600' : 'text-red-600'}>
                          {wa.muscleMassDiff > 0 ? '+' : ''}{wa.muscleMassDiff.toFixed(1)}
                        </span>
                      )}
                    </td>
                    
                    {/* vs First */}
                    <td className="px-2 py-3 text-center">
                      {wa.weightDiffFirst === 0 ? (
                        <span className="text-gray-400">=</span>
                      ) : (
                        <span className={wa.weightDiffFirst > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {wa.weightDiffFirst > 0 ? '+' : ''}{wa.weightDiffFirst.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      {wa.bodyFatDiffFirst === null ? '-' : (
                        <span className={wa.bodyFatDiffFirst > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {wa.bodyFatDiffFirst > 0 ? '+' : ''}{wa.bodyFatDiffFirst.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      {wa.muscleMassDiffFirst === null ? '-' : (
                        <span className={wa.muscleMassDiffFirst > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {wa.muscleMassDiffFirst > 0 ? '+' : ''}{wa.muscleMassDiffFirst.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsTab
