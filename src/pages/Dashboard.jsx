import { supabase } from '../lib/supabase'

export default function Dashboard({ member }) {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      fontFamily: 'system-ui',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Welcome, {member.full_name}</h1>
          <p style={{ color: '#666' }}>{member.bio}</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {[
          ['directory', 'Member Directory'],
          ['jobs', 'Job Board'],
          ['events', 'Events'],
          ['videos', 'Videos'],
          ['newsletters', 'Newsletters'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: key }))}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}