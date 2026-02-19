import { useState } from 'react'

function DateSelector({ selectedDate, onDateChange }) {
  const [showCalendar, setShowCalendar] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return 'Date invalide'

    try {
      const date = new Date(dateString + 'T00:00:00')
      if (isNaN(date.getTime()) || date.getTime() < 0) return 'Date invalide'

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const selectedDateObj = new Date(dateString + 'T00:00:00')
      selectedDateObj.setHours(0, 0, 0, 0)

      if (selectedDateObj.getTime() === today.getTime()) {
        return "Aujourd'hui"
      }
      if (selectedDateObj.getTime() === yesterday.getTime()) {
        return 'Hier'
      }

      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    } catch (error) {
      return 'Date invalide'
    }
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    if (newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      onDateChange(newDate)
      setShowCalendar(false)
    }
  }

  const handleToday = () => {
    try {
      const today = new Date()
      if (isNaN(today.getTime())) {
        // Fallback if even new Date() fails
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        onDateChange(`${year}-${month}-${day}`)
      } else {
        const dateStr = today.toISOString().split('T')[0]
        onDateChange(dateStr)
      }
      setShowCalendar(false)
    } catch (error) {
      console.error('Error in handleToday:', error)
      // Ultimate fallback
      const now = new Date()
      onDateChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
    }
  }

  const changeDay = (delta) => {
    try {
      // Validate selectedDate first
      if (!selectedDate || typeof selectedDate !== 'string') {
        handleToday()
        return
      }
      
      const currentDate = new Date(selectedDate + 'T00:00:00')
      
      // Check if date is valid
      if (isNaN(currentDate.getTime()) || currentDate.getTime() < 0) {
        handleToday()
        return
      }

      currentDate.setDate(currentDate.getDate() + delta)
      
      // Double check after setDate
      if (isNaN(currentDate.getTime()) || currentDate.getTime() < 0) {
        handleToday()
        return
      }
      
      const newDateStr = currentDate.toISOString().split('T')[0]

      // Don't allow future dates
      const todayDate = new Date()
      const todayStr = todayDate.toISOString().split('T')[0]
      
      if (newDateStr <= todayStr) {
        onDateChange(newDateStr)
      }
    } catch (error) {
      console.error('Error changing date:', error)
      handleToday()
    }
  }

  const isToday = () => {
    try {
      if (!selectedDate || typeof selectedDate !== 'string') return false
      
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      return selectedDate === todayStr
    } catch (error) {
      return false
    }
  }

  const getMaxDate = () => {
    try {
      const today = new Date()
      return today.toISOString().split('T')[0]
    } catch (error) {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
  }

  const maxDate = getMaxDate()

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* Previous Day Button */}
        <button
          onClick={() => changeDay(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Date Display */}
        <div className="flex-1 text-center">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-lg font-medium hover:text-purple-600 transition"
          >
            {formatDate(selectedDate)}
          </button>

          {showCalendar && (
            <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg p-4 left-1/2 transform -translate-x-1/2">
              <input
                type="date"
                value={selectedDate || ''}
                onChange={handleDateChange}
                max={maxDate}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        {/* Next Day Button */}
        <button
          onClick={() => changeDay(1)}
          disabled={isToday()}
          className={`p-2 rounded-lg transition ${
            isToday()
              ? 'text-gray-300 cursor-not-allowed'
              : 'hover:bg-gray-100'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Today Button */}
      {!isToday() && (
        <div className="mt-3 text-center">
          <button
            onClick={handleToday}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Aujourd'hui
          </button>
        </div>
      )}
    </div>
  )
}

export default DateSelector
