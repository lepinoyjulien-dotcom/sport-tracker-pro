import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const ExercisesContext = createContext()

export function ExercisesProvider({ children, token }) {
  const [exercises, setExercises] = useState({ cardio: [], muscu: [] })
  const [loading, setLoading] = useState(true)

  const fetchExercises = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const [cardio, muscu] = await Promise.all([
        axios.get(`${API_URL}/api/exercises`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: 'cardio' }
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/exercises`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: 'muscu' }
        }).catch(() => ({ data: [] }))
      ])

      setExercises({
        cardio: Array.isArray(cardio.data) ? cardio.data : [],
        muscu: Array.isArray(muscu.data) ? muscu.data : []
      })
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [token])

  const addExercise = async (name, type) => {
    try {
      await axios.post(
        `${API_URL}/api/exercises`,
        { name, type },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchExercises() // Refresh
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur' }
    }
  }

  const updateExercise = async (id, name) => {
    try {
      await axios.put(
        `${API_URL}/api/exercises/${id}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchExercises() // Refresh
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur' }
    }
  }

  const deleteExercise = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/exercises/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchExercises() // Refresh
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erreur' }
    }
  }

  return (
    <ExercisesContext.Provider value={{ 
      exercises, 
      loading, 
      addExercise, 
      updateExercise,
      deleteExercise, 
      refreshExercises: fetchExercises 
    }}>
      {children}
    </ExercisesContext.Provider>
  )
}

export function useExercises() {
  const context = useContext(ExercisesContext)
  if (!context) {
    throw new Error('useExercises must be used within ExercisesProvider')
  }
  return context
}
