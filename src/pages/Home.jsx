    import React from 'react'
    import { ArrowRight, Activity } from 'lucide-react'
    import { Link } from 'react-router-dom'
    import { supabase } from '../lib/supabase'

    export function Home() {
      const [user, setUser] = React.useState(null);

      React.useEffect(() => {
        const fetchUser = async () => {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        }
        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
        })

        return () => {
          authListener?.subscription.unsubscribe()
        }
      }, []);

      return (
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
      )
    }
