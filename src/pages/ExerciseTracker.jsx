import React, { useState } from 'react'
import { Calendar, Clock, MapPin, MessageSquare, Loader2 } from 'lucide-react'
import { Toast } from '../components/Toast'
import { supabase } from '../lib/supabase'

export function ExerciseTracker() {
  const [formData, setFormData] = useState({
    type: '',
    duration: '',
    distance: '',
    datetime: '',
    comments: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })

  const exerciseTypes = [
    'Walking',
    'Running',
    'Jogging',
    'Hiking',
    'Cycling',
    'Swimming',
    'Power Walking'
  ]

  const calculatePace = (duration, distance) => {
    if (!duration || !distance || duration <= 0 || distance <= 0) return 0
    return (parseFloat(duration) / parseFloat(distance)).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setToast({ show: false, type: '', message: '' })

    try {
      const pace = calculatePace(formData.duration, formData.distance)
      
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert([{
          type: formData.type,
          duration: parseFloat(formData.duration),
          distance: parseFloat(formData.distance),
          pace: parseFloat(pace),
          exercise_date: formData.datetime,
          comments: formData.comments
        }])
        .select()

      if (exerciseError) throw exerciseError

      setToast({
        show: true,
        type: 'success',
        message: 'Exercise saved successfully! View your progress in the Dashboard.'
      })
      
      // Clear form
      setFormData({
        type: '',
        duration: '',
        distance: '',
        datetime: '',
        comments: ''
      })

    } catch (error) {
      console.error('Error saving exercise:', error)
      setToast({
        show: true,
        type: 'error',
        message: 'Failed to save exercise. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 relative z-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Track Your Exercise</h2>
              <p className="mt-2 text-gray-600">Record your latest exercise activity</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Exercise Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-2 border-gray-200 py-2.5 pl-3 pr-10 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                  required
                >
                  <option value="">Select an exercise type</option>
                  {exerciseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="block w-full rounded-md border-2 border-gray-200 py-2.5 pl-3 pr-10 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                      placeholder="30"
                      required
                      min="1"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                    Distance (km)
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      name="distance"
                      id="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      className="block w-full rounded-md border-2 border-gray-200 py-2.5 pl-3 pr-10 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                      placeholder="5.0"
                      step="0.1"
                      required
                      min="0.1"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
                  Date and Time
                </label>
                <div className="mt-2 relative">
                  <input
                    type="datetime-local"
                    name="datetime"
                    id="datetime"
                    value={formData.datetime}
                    onChange={handleChange}
                    className="block w-full rounded-md border-2 border-gray-200 py-2.5 pl-3 pr-10 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <div className="mt-2 relative">
                  <textarea
                    name="comments"
                    id="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full rounded-md border-2 border-gray-200 py-2.5 px-3 text-gray-900 ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                    placeholder="How was your exercise today?"
                  />
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving exercise...
                    </>
                  ) : (
                    'Save Exercise'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
