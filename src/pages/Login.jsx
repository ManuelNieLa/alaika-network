import { supabase } from '../lib/supabase'

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/alaika-network/',
      },
    })
    if (error) console.error('Login error:', error.message)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1>Welcome to Alaika Network</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Sign in to access the alumni and talent network
      </p>
      <button
        onClick={handleGoogleLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        Sign in with Google
      </button>
    </div>
  )
}