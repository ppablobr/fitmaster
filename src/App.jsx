import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { ExerciseTracker } from './pages/ExerciseTracker'
import { Dashboard } from './pages/Dashboard'
import { ManageExercises } from './pages/ManageExercises'
import { Goals } from './pages/Goals'
import { Account } from './pages/Account'
import { Layout } from './components/Layout'
import { Auth } from './components/Auth'
import { supabase } from './lib/supabase'

function App() {
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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/tracker"
          element={user ? <ExerciseTracker /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/manage"
          element={user ? <ManageExercises /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/goals"
          element={user ? <Goals /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/account"
          element={user ? <Account /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Auth />} />
      </Route>
    </Routes>
  )
}

export default App
