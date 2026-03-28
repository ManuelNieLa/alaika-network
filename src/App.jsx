import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      var s = result.data.session
      setUser(s ? s.user : null)
      setLoading(false)
    })
    var sub = supabase.auth.onAuthStateChange(function(_e, session) {
      setUser(session ? session.user : null)
      setLoading(false)
    })
    return function() { sub.data.subscription.unsubscribe() }
  }, [])

  if (loading) return <p>Loading...</p>
  if (!user) return <Login />

  return (
    <div>
      <div style={{ background: 'black', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#C8FF00', fontWeight: 700, fontSize: '1.25rem' }}>ALAIKA Network</span>
        <button onClick={function() { supabase.auth.signOut() }} style={{ color: '#999', background: 'none', border: '1px solid #555', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}>Sign Out</button>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>NAVBAR WORKS!</h2>
        <p>Logged in as {user.email}</p>
      </div>
    </div>
  )
}

export default App