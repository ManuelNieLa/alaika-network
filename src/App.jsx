import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Directory from './pages/Directory'
import JobBoard from './pages/JobBoard'
import ContentFeed from './pages/ContentFeed'
import Events from './pages/Events'
import Videos from './pages/Videos'

function App() {
  const [user, setUser] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) checkMember(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkMember(session.user.id)
      else { setLoading(false); setMember(null); setPage('home') }
    })

    const handleNav = (e) => setPage(e.detail)
    window.addEventListener('navigate', handleNav)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('navigate', handleNav)
    }
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
    <div>
      <Dashboard member={member} />
      {page === 'directory' && <Directory />}
      {page === 'jobs' && <JobBoard user={user} />}
      {page === 'events' && <Events user={user} />}
      {page === 'videos' && <Videos user={user} />}
      {page === 'newsletters' && <ContentFeed user={user} />}
      {page === 'home' && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>Select a section above to get started.</p>
        </div>
      )}
    </div>
  )
}

export default App