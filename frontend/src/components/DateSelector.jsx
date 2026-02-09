import { useState } from 'react'

function DateSelector({ selectedDate, onDateChange }) {
  const [showCalendar, setShowCalendar] = useState(false)

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split('T')[0]) {
      return "Aujourd'hui"
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Hier'
    }
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  const navigateDate = (days) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    onDateChange(date.toISOString().split('T')[0])
  }

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0])
    setShowCalendar(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between gap-4">
        {/* Previous Day */}
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Jour précédent"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Current Date Display */}
        <div className="flex-1 text-center">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {formatDateDisplay(selectedDate)}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(selectedDate).toLocaleDateString('fr-FR')}
            </div>
          </button>

          {/* Calendar Popup */}
          {showCalendar && (
            <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
              <div className="mb-3 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Sélectionner une date</h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  onDateChange(e.target.value)
                  setShowCalendar(false)
                }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigateDate(-7)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Il y a 7 jours
                </button>
                <button
                  onClick={() => navigateDate(-30)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Il y a 30 jours
                </button>
              </div>

              <button
                onClick={goToToday}
                className="w-full mt-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Aujourd'hui
              </button>
            </div>
          )}
        </div>

        {/* Next Day */}
        <button
          onClick={() => navigateDate(1)}
          disabled={selectedDate === new Date().toISOString().split('T')[0]}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Jour suivant"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Today Button */}
        {selectedDate !== new Date().toISOString().split('T')[0] && (
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all text-sm"
          >
            Aujourd'hui
          </button>
        )}
      </div>
    </div>
  )
}

export default DateSelector
