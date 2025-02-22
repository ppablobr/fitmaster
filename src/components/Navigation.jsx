import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Activity, LineChart, LogIn, LogOut, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const location = useLocation()
  const [user, setUser] = React.useState(null)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = React.useState(false) // New state

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
    setShowLogoutConfirmation(false) // Close the confirmation dialog after logout
  }

  const handleOpenLogoutConfirmation = () => {
    setShowLogoutConfirmation(true)
  }

  const handleCloseLogoutConfirmation = () => {
    setShowLogoutConfirmation(false)
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
              <button onClick={handleOpenLogoutConfirmation} className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
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
              <button onClick={handleOpenLogoutConfirmation} className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-sm font-medium w-full text-left"
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

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmation && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Logout Confirmation
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to logout?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleLogout}
                >
                  Confirm Logout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={handleCloseLogoutConfirmation}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
