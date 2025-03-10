import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Target, Edit, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Toast } from '../components/Toast'

export function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, goalId: null })
  const [progress, setProgress] = useState({})

  // Goal options
  const goalOptions = [
    { value: 'Total days', label: 'Total days of exercise', unit: 'days' },
    { value: 'Total distance', label: 'Total distance achieved', unit: 'km' },
    { value: 'Total duration', label: 'Total duration achieved', unit: 'min' }
  ]

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  useEffect(() => {
    if (user && goals.length > 0) {
      calculateProgress()
    }
  }, [user, goals])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      if (!user) {
        console.warn('User not available, skipping goals fetch.')
        return
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        setError(error)
        console.error('Error fetching goals:', error)
      } else {
        setGoals(data || [])
      }
    } catch (err) {
      setError(err)
      console.error('Unexpected error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = async () => {
    try {
      if (!user) return

      // Get all user exercises
      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching exercises for progress calculation:', error)
        return
      }

      const newProgress = {}

      goals.forEach(goal => {
        let achieved = 0

        if (goal.goal === 'Total days') {
          // Count unique days
          const uniqueDays = new Set(exercises.map(ex => ex.date.split('T')[0])).size
          achieved = uniqueDays
        } else if (goal.goal === 'Total distance') {
          // Sum all distances and round to 2 decimal places
          achieved = parseFloat(exercises.reduce((sum, ex) => sum + ex.distance, 0).toFixed(2))
        } else if (goal.goal === 'Total duration') {
          // Sum all durations
          achieved = exercises.reduce((sum, ex) => sum + ex.duration, 0)
        }

        // Calculate percentage
        const percentage = Math.min(Math.round((achieved / goal.metric) * 100), 100)
        
        newProgress[goal.id] = {
          achieved,
          percentage,
          unit: goalOptions.find(opt => opt.value === goal.goal)?.unit || ''
        }
      })

      setProgress(newProgress)
    } catch (err) {
      console.error('Error calculating progress:', err)
    }
  }

  const handleAddGoal = async (newGoal) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            goal: newGoal.goal,
            metric: newGoal.metric
          }
        ])
        .select()

      if (error) {
        console.error('Error adding goal:', error)
        setToast({ show: true, type: 'error', message: 'Failed to add goal.' })
      } else {
        setGoals([...goals, data[0]])
        setToast({ show: true, type: 'success', message: 'Goal added successfully!' })
      }
    } catch (err) {
      console.error('Error adding goal:', err)
      setToast({ show: true, type: 'error', message: 'Unexpected error adding goal.' })
    } finally {
      setIsAddModalOpen(false)
    }
  }

  const handleUpdateGoal = async (updatedGoal) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          goal: updatedGoal.goal,
          metric: updatedGoal.metric
        })
        .eq('id', updatedGoal.id)
        .select()

      if (error) {
        console.error('Error updating goal:', error)
        setToast({ show: true, type: 'error', message: 'Failed to update goal.' })
      } else {
        // Optimistically update the state
        setGoals(goals.map(g => (g.id === updatedGoal.id ? data[0] : g)))
        setToast({ show: true, type: 'success', message: 'Goal updated successfully!' })
      }
    } catch (err) {
      console.error('Error updating goal:', err)
      setToast({ show: true, type: 'error', message: 'Unexpected error updating goal.' })
    } finally {
      closeEditModal()
    }
  }

  const handleDeleteGoal = async (id) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting goal:', error)
        setToast({ show: true, type: 'error', message: 'Failed to delete goal.' })
      } else {
        // Optimistically update the state
        setGoals(goals.filter(goal => goal.id !== id))
        setToast({ show: true, type: 'success', message: 'Goal deleted successfully!' })
      }
    } catch (err) {
      console.error('Error deleting goal:', err)
      setToast({ show: true, type: 'error', message: 'Unexpected error deleting goal.' })
    } finally {
      closeDeleteConfirmation()
    }
  }

  const openAddModal = () => {
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
  }

  const openEditModal = (goal) => {
    setSelectedGoal(goal)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedGoal(null)
  }

  const openDeleteConfirmation = (id) => {
    setDeleteConfirmation({ show: true, goalId: id })
  }

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ show: false, goalId: null })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Fitness Goals</h1>
          <button
            onClick={openAddModal}
            className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't set any fitness goals yet.</p>
            <button
              onClick={openAddModal}
              className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Set Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => {
              const progressData = progress[goal.id] || { achieved: 0, percentage: 0, unit: '' }
              return (
                <div key={goal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{goal.goal}</h3>
                        <p className="text-gray-600">
                          Target: {goal.goal === 'Total distance' ? parseFloat(goal.metric).toFixed(2) : goal.metric} {progressData.unit}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(goal)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(goal.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Progress: {goal.goal === 'Total distance' ? progressData.achieved.toFixed(2) : progressData.achieved} / {goal.goal === 'Total distance' ? parseFloat(goal.metric).toFixed(2) : goal.metric} {progressData.unit}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {progressData.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${progressData.percentage >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${progressData.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {progressData.percentage >= 100 && (
                      <div className="mt-4 flex items-center text-green-500">
                        <Award className="h-5 w-5 mr-2" />
                        <span className="font-medium">Goal achieved!</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <GoalFormModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSubmit={handleAddGoal}
          goalOptions={goalOptions}
          title="Add New Goal"
          submitLabel="Add Goal"
        />
      )}

      {/* Edit Goal Modal */}
      {isEditModalOpen && selectedGoal && (
        <GoalFormModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateGoal}
          goalOptions={goalOptions}
          initialData={selectedGoal}
          title="Edit Goal"
          submitLabel="Update Goal"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete Goal
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this goal? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteGoal(deleteConfirmation.goalId)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeDeleteConfirmation}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalFormModal({ isOpen, onClose, onSubmit, goalOptions, initialData = null, title, submitLabel }) {
  const [formData, setFormData] = useState({
    goal: initialData?.goal || '',
    metric: initialData?.metric || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'metric' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!formData.goal || !formData.metric) {
        alert('Please fill in all required fields.')
        setIsSubmitting(false)
        return
      }

      // Call the onSubmit function passed from the parent component
      await onSubmit(initialData ? { ...formData, id: initialData.id } : formData)
    } catch (error) {
      console.error('Error submitting goal:', error)
      alert('Failed to submit goal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {title}
              </h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                Goal Type
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-2 border-gray-200 py-2.5 pl-3 pr-10 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                required
              >
                <option value="">Select a goal type</option>
                {goalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="metric" className="block text-sm font-medium text-gray-700">
                Target Value
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="metric"
                  id="metric"
                  value={formData.metric}
                  onChange={handleChange}
                  className="block w-full rounded-md border-2 border-gray-200 py-2.5 pl-3 pr-10 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                  placeholder="100"
                  step="0.01"
                  min="0.01"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {formData.goal ? goalOptions.find(opt => opt.value === formData.goal)?.unit : ''}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {formData.goal === 'Total days' && 'Set the number of days you want to exercise'}
                {formData.goal === 'Total distance' && 'Set the total distance you want to achieve in kilometers'}
                {formData.goal === 'Total duration' && 'Set the total time you want to spend exercising in minutes'}
              </p>
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}