import { supabase } from '../lib/supabase'

export default function Login() {
  async function handleGoogle() {
    var r = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/alaika-network/' }
    })
    if (r.error) console.error('Login error:', r.error.message)
  }

  async function handleLinkedIn() {
    var r = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: window.location.origin + '/alaika-network/' }
    })
    if (r.error) console.error('Login error:', r.error.message)
  }

  return (
    <div className="login-page">
      <h1 className="login-title">
        <span>ALAIKA</span> Network
      </h1>
      <p className="login-subtitle">
        The alumni and talent network for Financial Services
      </p>
      <div className="login-buttons">
        <button onClick={handleGoogle} className="btn-google">
          Sign in with Google
        </button>
        <button onClick={handleLinkedIn} className="btn-linkedin">
          Sign in with LinkedIn
        </button>
      </div>
    </div>
  )
}
