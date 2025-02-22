import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Clock, MapPin, Activity } from 'lucide-react'
import { Line, Bar, Chart } from 'react-chartjs-2' // Import Bar component
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController, // Import BarController
  LineController, // Import LineController
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { enUS } from 'date-fns/locale'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Link } from 'react-router-dom'
// Import package.json to read version
import packageJson from '../../package.json'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController, // Register BarController
  LineController, // Register LineController
  TimeScale
)

export function Dashboard() {
  const [stats, setStats] = useState({
    totalDays: 0,
    totalDistance: 0,
    totalDuration: 0,
    averagePace: 0,
  })
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [version, setVersion] = useState('1.0') // Initialize version state

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (userId) {
      fetchExerciseData()
    }
  }, [userId, startDate, endDate])

  const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  const fetchExerciseData = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId) // Filter by user ID
        .order('date', { ascending: true })

      if (startDate && endDate) {
        query = query.gte('date', formatDate(startDate)).lte('date', formatDate(endDate))
      }

      const { data: exercises, error } = await query

      if (error) throw error

      // Calculate stats
      const uniqueDays = new Set(exercises.map(ex => ex.date.split('T')[0])).size
      const totalDistance = exercises.reduce((sum, ex) => sum + ex.distance, 0)
      const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0)
      const averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0

      setStats({
        totalDays: uniqueDays,
        totalDistance: totalDistance.toFixed(1),
        totalDuration: Math.round(totalDuration),
        averagePace: averagePace.toFixed(2),
      })

      // Prepare chart data
      const dateGroups = exercises.reduce((groups, exercise) => {
        const date = exercise.date.split('T')[0]
        if (!groups[date]) {
          groups[date] = { distance: 0, duration: 0, pace: 0, totalDuration: 0 }
        }
        groups[date].distance += exercise.distance
        groups[date].totalDuration += exercise.duration
        groups[date].pace = groups[date].totalDuration / groups[date].distance
        return groups
      }, {})

      const labels = Object.keys(dateGroups) // All available dates
      const distances = labels.map(date => dateGroups[date].distance)
      const paces = labels.map(date => dateGroups[date].pace)

      setChartData({
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Distance (km)',
            data: distances,
            backgroundColor: 'rgb(53, 162, 235)',
            yAxisID: 'y',
            z: 0, // Ensure bars are behind the line
          },
          {
            type: 'line',
            label: 'Pace (min/km)',
            data: paces,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            yAxisID: 'y1',
            z: 1, // Ensure line is in front of bars
          },
        ],
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching exercise data:', error)
      setLoading(false)
    }
  }

  // Function to update the version (for demonstration purposes)
  const updateVersion = (type) => {
    if (type === 'minor') {
      setVersion((prevVersion) => (parseFloat(prevVersion) + 0.1).toFixed(1))
    } else if (type === 'major') {
      setVersion((prevVersion) => (parseFloat(prevVersion) + 1).toFixed(1))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Dashboard</h1>
            <p className="mt-2 text-gray-600">Track your fitness progress over time</p>
          </div>
          <Link to="/tracker" className="mt-4 sm:mt-0 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto">
            Track Exercise
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="w-full">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm w-full"
            />
          </div>
          <div className="w-full sm:mb-0">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="p-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDistance} km</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDuration} min</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Pace</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averagePace} min/km</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Chart</h2>
          <div className="h-96">
            <Line
              data={chartData}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  x: {
                    type: 'category',
                    labels: chartData.labels,
                    title: {
                      display: true,
                      text: 'Date',
                    },
                  },
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Distance (km)',
                    },
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Pace (min/km)',
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      <footer className="bg-transparent text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-2">
            <span>Version: {version}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
