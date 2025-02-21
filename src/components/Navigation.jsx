    import React from 'react'
    import { Link, useLocation } from 'react-router-dom'
    import { Menu, X, Activity, LineChart, LogIn, LogOut } from 'lucide-react'
    import { supabase } from '../lib/supabase'

    export function Navigation() {
      const [isOpen, setIsOpen] = React.useState(false)
      const location = useLocation()
      const [user, setUser] = React.useState(null)

      React.useEffect(() => {
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

      const handleLogout = async () => {
        await supabase.auth.signOut()
      }

      const isActive = (path) => {
        return location.pathname === path
      }

      const linkClass = (path) => `
        ${isActive(path)
          ? 'text-primary font-semibold'
          : 'text-gray-700 hover:text-primary'
        } px-3 py-2 rounded-md text-sm font-medium
      `

      return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <Activity className="h-8 w-8 text-primary" />
                  <span className="ml-2 text-xl font-bold">Fit Master</span>
                </Link>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="flex space-x-4">
                  <Link to="/" className={linkClass('/')}>
                    Home
                  </Link>
                  {user && (
                    <>
                      <Link to="/tracker" className={linkClass('/tracker')}>
                        Track Exercise
                      </Link>
                      <Link to="/dashboard" className={linkClass('/dashboard')}>
                        <div className="flex items-center gap-1">
                          <LineChart className="h-4 w-4" />
                          Dashboard
                        </div>
                      </Link>
                    </>
                  )}
                </div>
                {user ? (
                  <button onClick={handleLogout} className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </div>
                  </button>
                ) : (
                  <Link to="/login" className={linkClass('/login')}>
                    <div className="flex items-center gap-1">
                      <LogIn className="h-4 w-4" />
                      Login
                    </div>
                  </Link>
                )}
              </div>

              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
                >
                  {isOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/"
                  className={`${linkClass('/')} block`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                {user && (
                  <>
                    <Link
                      to="/tracker"
                      className={`${linkClass('/tracker')} block`}
                      onClick={() => setIsOpen(false)}
                    >
                      Track Exercise
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`${linkClass('/dashboard')} block`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-1">
                        <LineChart className="h-4 w-4" />
                        Dashboard
                      </div>
                    </Link>
                  </>
                )}
                {user ? (
                  <button onClick={handleLogout} className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-sm font-medium w-full text-left"
                  >
                    <div className="flex items-center gap-1">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </div>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className={`${linkClass('/login')} block`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-1">
                      <LogIn className="h-4 w-4" />
                      Login
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      )
    }
