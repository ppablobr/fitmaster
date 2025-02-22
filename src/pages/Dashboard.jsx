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
    } from 'chart.js'

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
      LineController // Register LineController
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
      const [userId, setUserId] = useState(null);

      useEffect(() => {
        const fetchUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUserId(user?.id);
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUserId(session?.user?.id ?? null);
        });

        return () => {
          authListener?.subscription.unsubscribe();
        };
      }, []);

      useEffect(() => {
        if (userId) {
          fetchExerciseData();
        }
      }, [userId]);


      const fetchExerciseData = async () => {
        try {
          const { data: exercises, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('user_id', userId) // Filter by user ID
            .order('date', { ascending: true })

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
              groups[date] = { distance: 0, duration: 0 }
            }
            groups[date].distance += exercise.distance
            groups[date].duration += exercise.duration
            return groups
          }, {})

          const labels = Object.keys(dateGroups).slice(-7) // Last 7 days
          const distances = labels.map(date => dateGroups[date].distance)
          const durations = labels.map(date => dateGroups[date].duration)

          setChartData({
            labels,
            datasets: [
              {
                type: 'line',
                label: 'Distance (km)',
                data: distances,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                yAxisID: 'y',
              },
              {
                type: 'bar',
                label: 'Duration (min)',
                data: durations,
                backgroundColor: 'rgb(53, 162, 235)',
                yAxisID: 'y1',
              },
            ],
          })

          setLoading(false)
        } catch (error) {
          console.error('Error fetching exercise data:', error)
          setLoading(false)
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Exercise Dashboard</h1>
              <p className="mt-2 text-gray-600">Track your fitness progress over time</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Last 7 Days Activity</h2>
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
                          text: 'Duration (min)',
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
        </div>
      )
    }
