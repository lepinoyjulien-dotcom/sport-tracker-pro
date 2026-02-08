// Sport Tracker Pro - Utility Functions

/**
 * Format date to French locale
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format date to short format (DD/MM)
 */
export const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit'
  })
}

/**
 * Calculate MET-based calories
 * @param {string} intensity - Faible, Moyenne, Haute
 * @param {number} weight - Weight in kg
 * @param {number} minutes - Duration in minutes
 */
export const calculateCardioCalories = (intensity, weight, minutes) => {
  const metValues = {
    'Faible': 4,
    'Moyenne': 7,
    'Haute': 10
  }
  
  const met = metValues[intensity] || 7
  return Math.round((met * weight * minutes) / 60)
}

/**
 * Calculate musculation calories (simple formula)
 * @param {number} sets - Number of sets
 */
export const calculateMuscuCalories = (sets) => {
  return sets * 5
}

/**
 * Calculate volume for strength training
 * @param {number} sets - Number of sets
 * @param {number} reps - Repetitions per set
 * @param {number} weight - Weight in kg
 */
export const calculateVolume = (sets, reps, weight) => {
  return sets * reps * weight
}

/**
 * Group array by date
 */
export const groupByDate = (array, dateField = 'date') => {
  return array.reduce((acc, item) => {
    const date = item[dateField]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})
}

/**
 * Group array by exercise name
 */
export const groupByExercise = (array) => {
  return array.reduce((acc, item) => {
    const name = item.exercise?.name || 'Autre'
    if (!acc[name]) acc[name] = []
    acc[name].push(item)
    return acc
  }, {})
}

/**
 * Get last N days dates
 */
export const getLastNDays = (n) => {
  const dates = []
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

/**
 * Calculate delta between two values
 */
export const calculateDelta = (current, previous) => {
  if (!current || !previous) return null
  return current - previous
}

/**
 * Format delta with sign
 */
export const formatDelta = (delta, unit = 'kg') => {
  if (delta === null || delta === undefined) return '-'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} ${unit}`
}

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (!current || !previous || previous === 0) return null
  return ((current - previous) / previous) * 100
}

/**
 * Format number with thousands separator
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Get intensity color
 */
export const getIntensityColor = (intensity) => {
  const colors = {
    'Faible': 'green',
    'Moyenne': 'yellow',
    'Haute': 'red'
  }
  return colors[intensity] || 'gray'
}

/**
 * Get exercise icon
 */
export const getExerciseIcon = (exerciseName) => {
  const icons = {
    'Course': '🏃',
    'Vélo': '🚴',
    'Natation': '🏊',
    'Marche': '🚶',
    'Rameur': '🚣',
    'Elliptique': '⚡',
    'Squats': '🦵',
    'Développé couché': '🏋️',
    'Tractions': '💪',
    'Abdos': '🔥'
  }
  return icons[exerciseName] || '💪'
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return password.length >= 6
}

/**
 * Get date range for last N days
 */
export const getDateRange = (days) => {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  return { startDate, endDate }
}

/**
 * Sort array by date (most recent first)
 */
export const sortByDateDesc = (array, dateField = 'date') => {
  return [...array].sort((a, b) => 
    new Date(b[dateField]) - new Date(a[dateField])
  )
}

/**
 * Sort array by date (oldest first)
 */
export const sortByDateAsc = (array, dateField = 'date') => {
  return [...array].sort((a, b) => 
    new Date(a[dateField]) - new Date(b[dateField])
  )
}

export default {
  formatDate,
  formatDateShort,
  calculateCardioCalories,
  calculateMuscuCalories,
  calculateVolume,
  groupByDate,
  groupByExercise,
  getLastNDays,
  calculateDelta,
  formatDelta,
  calculatePercentageChange,
  formatNumber,
  truncate,
  debounce,
  getIntensityColor,
  getExerciseIcon,
  isValidEmail,
  isValidPassword,
  getDateRange,
  sortByDateDesc,
  sortByDateAsc
}
