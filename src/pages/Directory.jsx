import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Directory() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    async function load() {
      var r = await supabase.from('members').select('*').order('created_at', { ascending: false })
      setMembers(r.data || [])
      setLoading(false)
    }
    load()
  }, [])

  var filtered = members.filter(function(m) {
    if (!search) return true
    var term = search.toLowerCase()
    return (
      (m.full_name && m.full_name.toLowerCase().includes(term)) ||
      (m.bio && m.bio.toLowerCase().includes(term)) ||
      (m.education && m.education.toLowerCase().includes(term)) ||
      (m.skills && m.skills.some(function(s) { return s.toLowerCase().includes(term) })) ||
      (m.industries && m.industries.some(function(i) { return i.toLowerCase().includes(term) }))
    )
  })

  if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading directory...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Member Directory</h2>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by name, skills, industry, education..." value={search} onChange={function(e) { setSearch(e.target.value) }} className="input" />
      </div>

      <p className="text-muted text-sm mb-2">{filtered.length} members found</p>

      {filtered.map(function(m) {
        return (
          <div key={m.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{m.full_name}</h3>
                <span className={m.member_type === 'alumni' ? 'badge badge-green' : 'badge badge-blue'}>
                  {m.member_type}
                </span>
              </div>
              {m.linkedin_url ? (
                <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-blue-outline" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
                  LinkedIn
                </a>
              ) : null}
            </div>
            {m.bio ? <p className="text-sm mt-1" style={{ color: '#555' }}>{m.bio}</p> : null}
            {m.education ? <p className="text-sm mt-1 text-muted">Education: {m.education}</p> : null}
            {m.firm_history ? <p className="text-sm text-muted">Experience: {m.firm_history}</p> : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
              {m.skills ? m.skills.map(function(s, i) {
                return <span key={i} className="badge badge-gray">{s}</span>
              }) : null}
              {m.industries ? m.industries.map(function(ind, i) {
                return <span key={i} className="badge badge-blue">{ind}</span>
              }) : null}
            </div>
            {(m.open_to_mentoring || m.open_to_referrals) ? (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                {m.open_to_mentoring ? <span className="text-xs" style={{ color: 'var(--green)' }}>Open to mentoring</span> : null}
                {m.open_to_referrals ? <span className="text-xs" style={{ color: 'var(--green)' }}>Open to referrals</span> : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
