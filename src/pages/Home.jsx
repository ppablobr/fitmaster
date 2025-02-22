import React from 'react'
import { ArrowRight, Activity, Award, BarChart, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Home() {
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-8">
              <Activity className="h-16 w-16 text-primary animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Track Your Fitness Journey
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Record and monitor your exercises, track your progress, and achieve your fitness goals.
              Whether you're walking, running, or jogging, we've got you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {user ? (
                <Link
                  to="/tracker"
                  className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Start Tracking
                  <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Login to Track
                  <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-8">
            Key Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Stay Motivated</h3>
              <p className="text-gray-600 text-center">
                Keep track of your progress and stay motivated to achieve your fitness goals.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-4">
                <BarChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Track Your Progress</h3>
              <p className="text-gray-600 text-center">
                Easily record and monitor your exercises, distance, and pace.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Improve Your Fitness</h3>
              <p className="text-gray-600 text-center">
                Get insights into your performance and improve your overall fitness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Exercise Tracking</h3>
              <p className="text-gray-600">
                Record your exercises with details like distance, duration, and date.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Dashboard</h3>
              <p className="text-gray-600">
                Visualize your progress with charts and stats on your personal dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-8">
            FAQ
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Is Fit Master free to use?</h3>
              <p className="text-gray-600">
                Yes, Fit Master is completely free to use.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What kind of exercises can I track?
              </h3>
              <p className="text-gray-600">
                You can track any kind of exercise, including walking, running, jogging, and more.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Free Call to Action Section */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Start Tracking Your Fitness Journey Today!
          </h2>
          <p className="text-lg leading-8 text-gray-600 mb-8">
            Fit Master is free to use. Sign up now and start tracking your progress.
          </p>
          {user ? (
            <Link
              to="/tracker"
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start Tracking
              <ArrowRight className="ml-2 h-4 w-4 inline-block" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Login to Track
              <ArrowRight className="ml-2 h-4 w-4 inline-block" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
