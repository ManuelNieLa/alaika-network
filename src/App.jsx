import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Directory from './pages/Directory'
import JobBoard from './pages/JobBoard'
import Events from './pages/Events'
import Videos from './pages/Videos'
import ContentFeed from './pages/ContentFeed'

function App() {
  const [user, setUser] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('directory')

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      var s = result.data.session
      setUser(s ? s.user : null)
      if (s && s.user) checkMember(s.user.id)
      else setLoading(false)
    })
    var sub = supabase.auth.onAuthStateChange(function(_e, session) {
      setUser(session ? session.user : null)
      if (session && session.user) checkMember(session.user.id)
      else { setLoading(false); setMember(null) }
    })
    return function() { sub.data.subscription.unsubscribe() }
  }, [])

  async function checkMember(uid) {
    var r = await supabase.from('members').select('*').eq('user_id', uid).single()
    setMember(r.data)
    setLoading(false)
  }

  if (loading) return <p>Loading...</p>
  if (!user) return <Login />
  if (!member) return <Onboarding user={user} />

  var adm = member.is_admin
  var tabs = ['directory','jobs','events','videos','content']
  var labels = ['Directory','Jobs','Events','Videos','Content']

  return (
    <div>
      <div style={{ background: '#0A0A0A', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: '#C8FF00', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer' }} onClick={function(){setPage('directory')}}>ALAIKA Network</span>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(function(t, i) {
            var isActive = page === t
            return <button key={t} onClick={function(){setPage(t)}} style={{ color: isActive ? '#C8FF00' : '#ccc', background: 'none', border: 'none', borderBottom: isActive ? '2px solid #C8FF00' : '2px solid transparent', padding: '0 1rem', height: '64px', fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>{labels[i]}</button>
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{member.full_name}</span>
          <button onClick={function(){supabase.auth.signOut()}} style={{ color: '#888', background: 'none', border: '1px solid #555', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem' }}>
        {page === 'directory' && <Directory />}
        {page === 'jobs' && <JobBoard user={user} isAdmin={adm} />}
        {page === 'events' && <Events user={user} isAdmin={adm} />}
        {page === 'videos' && <Videos user={user} isAdmin={adm} />}
        {page === 'content' && <ContentFeed user={user} isAdmin={adm} />}
      </div>
    </div>
  )
}

export default App