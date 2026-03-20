import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Directory() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
      setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = members.filter((m) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      m.full_name?.toLowerCase().includes(term) ||
      m.bio?.toLowerCase().includes(term) ||
      m.education?.toLowerCase().includes(term) ||
      m.skills?.some((s) => s.toLowerCase().includes(term)) ||
      m.industries?.some((i) => i.toLowerCase().includes(term))
    )
  })

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <h2>Member Directory</h2>
      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          border: '1px solid #ddd',
          borderRadius: '6px',
          marginBottom: '1.5rem',
        }}
      />
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        {filtered.length} members found
      </p>
      {filtered.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  )
}

function MemberCard({ member }) {
  const m = member
  return (
    <div style={{
      padding: '1.5rem',
      background: 'white',
      border: '1px solid #eee',
      borderRadius: '10px',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>{m.full_name}</h3>
          <small style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            background: m.member_type === 'alumni' ? '#e8f4e8' : '#e8e8f4',
            color: m.member_type === 'alumni' ? '#2d6a2d' : '#2d2d6a',
          }}>
            {m.member_type}
          </small>
        </div>
        {m.linkedin_url && (
          <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5' }}>
            LinkedIn
          </a>
        )}
      </div>
      {m.bio && <p style={{ color: '#555', marginTop: '0.5rem' }}>{m.bio}</p>}
      {m.education && <p style={{ fontSize: '0.85rem', color: '#777' }}>Education: {m.education}</p>}
      {m.firm_history && <p style={{ fontSize: '0.85rem', color: '#777' }}>Experience: {m.firm_history}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
        {m.skills?.map((s, i) => (
          <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#f0f0f0', borderRadius: '999px' }}>
            {s}
          </span>
        ))}
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#2d6a2d' }}>
        {m.open_to_mentoring && <span>Open to mentoring </span>}
        {m.open_to_referrals && <span>Open to referrals</span>}
      </div>
    </div>
  )
}