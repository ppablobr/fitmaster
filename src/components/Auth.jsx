import React, { useState } from 'react'
    import { supabase } from '../lib/supabase'
    import { useNavigate } from 'react-router-dom'
    import { Loader2, User, Mail, Lock, UserPlus } from 'lucide-react'

    export function Auth() {
      const [isRegistering, setIsRegistering] = useState(false)
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const [confirmPassword, setConfirmPassword] = useState('') // New state for password confirmation
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState(null)
      const navigate = useNavigate()

      const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            setError(error.message)
          } else {
            navigate('/tracker')
          }
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            setError(error.message);
          } else {
            // Registration successful, you might want to automatically log the user in
            // or redirect them to a confirmation page.  For now, we'll redirect to /tracker.
            if (data.user) {
              navigate('/tracker');
            } else {
              // Handle cases where signup was successful, but no user is returned (e.g., email confirmation required)
              setError("Registration successful! Please check your email to confirm your account."); // Or redirect to a different page
            }
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              {isRegistering ? (
                <UserPlus className="mx-auto h-12 w-auto text-primary" />
              ) : (
                <User className="mx-auto h-12 w-auto text-primary" />
              )}
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {isRegistering ? 'Register for an account' : 'Sign in to your account'}
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleRegister : handleLogin}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {isRegistering && (
                  <div>
                    <label htmlFor="confirm-password" className="sr-only">
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    {loading ? (
                      <Loader2 className="h-5 w-5 text-primary-300 animate-spin" />
                    ) : isRegistering ? (
                      <UserPlus className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
                    ) : (
                      <User className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
                    )}
                  </span>
                  {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign in')}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
            <div className="text-sm text-center">
              {isRegistering ? (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Register
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }
