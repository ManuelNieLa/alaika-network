import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'

function App() {
  const [user, setUser] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkMember(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkMember(session.user.id)
      else setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkMember = async (userId) => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()
    setMember(data)
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>

  if (!user) return <Login />

  if (!member) return <Onboarding user={user} />

  return (
    <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'system-ui' }}>
      <h1>Welcome back, {member.full_name}!</h1>
      <p>You're signed in to Alaika Network.</p>
      <button onClick={() => supabase.auth.signOut()} style={{
        padding: '0.5rem 1rem',
        marginTop: '1rem',
        cursor: 'pointer',
      }}>
        Sign Out
      </button>
    </div>
  )
}

export default App