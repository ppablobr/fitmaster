import React, { useState, useEffect } from 'react'
import { Pencil, Trash2, Loader2, Calendar, Clock, MapPin, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Toast } from '../components/Toast'

export function ManageExercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true)
      try {
        if (!user) {
          console.warn('User not available, skipping exercise fetch.');
          return;
        }
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('user_id', user.id) // Fetch only the current user's exercises
          .order('date', { ascending: false }); // Order by date, newest first

        if (error) {
          setError(error)
          console.error('Error fetching exercises:', error)
        } else {
          setExercises(data || []) // Ensure data is an array
        }
      } catch (err) {
        setError(err)
        console.error('Unexpected error fetching exercises:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [user])

  const openEditModal = (exercise) => {
    setSelectedExercise(exercise)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedExercise(null)
  }

  const handleUpdateExercise = async (updatedExercise) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updatedExercise)
        .eq('id', updatedExercise.id)
        .select();

      if (error) {
        console.error('Error updating exercise:', error);
        setToast({ show: true, type: 'error', message: 'Failed to update exercise.' });
      } else {
        // Optimistically update the state
        setExercises(exercises.map(ex => (ex.id === updatedExercise.id ? { ...ex, ...updatedExercise } : ex)));
        setToast({ show: true, type: 'success', message: 'Exercise updated successfully!' });
      }
    } catch (err) {
      console.error('Error updating exercise:', err);
      setToast({ show: true, type: 'error', message: 'Unexpected error updating exercise.' });
    } finally {
      closeEditModal();
    }
  };

  const handleDeleteExercise = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        const { error } = await supabase.from('exercises').delete().eq('id', id)

        if (error) {
          console.error('Error deleting exercise:', error)
          setToast({ show: true, type: 'error', message: 'Failed to delete exercise.' });
        } else {
          // Optimistically update the state
          setExercises(exercises.filter(exercise => exercise.id !== id));
          setToast({ show: true, type: 'success', message: 'Exercise deleted successfully!' });
        }
      } catch (err) {
        console.error('Error deleting exercise:', err)
        setToast({ show: true, type: 'error', message: 'Unexpected error deleting exercise.' });
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculatePace = (duration, distance) => {
    if (!duration || !distance) return 'N/A';
    const pace = (duration / distance).toFixed(2);
    return `${pace} min/km`;
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Manage Exercises</h1>
      </div>
        {exercises.length === 0 ? (
          <div className="text-gray-500">No exercises found.</div>
        ) : (
          <div className="overflow-x-auto px-4">
            <table className="min-w-full bg-white border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b font-semibold text-left">Date</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">Type</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">Duration</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">Distance</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">Pace</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map(exercise => (
                  <tr key={exercise.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{formatDate(exercise.date)}</td>
                    <td className="py-2 px-4 border-b">{exercise.type}</td>
                    <td className="py-2 px-4 border-b">{exercise.duration}</td>
                    <td className="py-2 px-4 border-b">{exercise.distance}</td>
                    <td className="py-2 px-4 border-b">{calculatePace(exercise.duration, exercise.distance)}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => openEditModal(exercise)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditExerciseModal
          exercise={selectedExercise}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onUpdate={handleUpdateExercise}
        />
      )}
    </div>
  )
}

function EditExerciseModal({ exercise, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    type: exercise?.type || '',
    duration: exercise?.duration || '',
    distance: exercise?.distance || '',
    date: exercise?.date || '',
    comments: exercise?.comments || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (exercise) {
      setFormData({
        type: exercise.type || '',
        duration: exercise.duration || '',
        distance: exercise.distance || '',
        date: exercise.date || '',
        comments: exercise.comments || '',
      });
    }
  }, [exercise]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.type || !formData.duration || !formData.distance || !formData.date) {
        alert('Please fill in all required fields.');
        return;
      }

      // Call the onUpdate function passed from the parent component
      await onUpdate({
        id: exercise.id,
        type: formData.type,
        duration: parseInt(formData.duration),
        distance: parseFloat(formData.distance),
        date: formData.date,
        comments: formData.comments,
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exerciseTypes = [
    'Walking',
    'Running',
    'Jogging',
    'Hiking',
    'Cycling',
    'Swimming',
    'Power Walking'
  ];

  if (!isOpen) return null;

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
                Edit Exercise
              </h3>
            </div>
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
                    step="0.01"
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date and Time
              </label>
              <div className="mt-2 relative">
                <input
                  type="datetime-local"
                  name="date"
                  id="date"
                  value={formData.date}
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

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Exercise'
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
  );
}
