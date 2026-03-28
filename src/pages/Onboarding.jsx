import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Onboarding({ user }) {
  const [formData, setFormData] = useState({
    full_name: user && user.user_metadata ? user.user_metadata.full_name || '' : '',
    email: user ? user.email || '' : '',
    linkedin_url: '',
    member_type: 'alumni',
    skills: '',
    industries: '',
    languages: '',
    education: '',
    firm_history: '',
    bio: '',
    open_to_mentoring: false,
    open_to_referrals: false
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    var name = e.target.name
    var value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(function(prev) { return Object.assign({}, prev, { [name]: value }) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    var r = await supabase.from('members').insert({
      user_id: user.id,
      full_name: formData.full_name,
      email: formData.email,
      linkedin_url: formData.linkedin_url,
      member_type: formData.member_type,
      skills: formData.skills.split(',').map(function(s) { return s.trim() }).filter(Boolean),
      industries: formData.industries.split(',').map(function(s) { return s.trim() }).filter(Boolean),
      languages: formData.languages.split(',').map(function(s) { return s.trim() }).filter(Boolean),
      education: formData.education,
      firm_history: formData.firm_history,
      bio: formData.bio,
      open_to_mentoring: formData.open_to_mentoring,
      open_to_referrals: formData.open_to_referrals
    })
    setLoading(false)
    if (r.error) {
      alert('Something went wrong: ' + r.error.message)
    } else {
      setSuccess(true)
      window.location.reload()
    }
  }

  if (success) {
    return (
      <div className="login-page">
        <h1 className="login-title"><span>Welcome</span> to ALAIKA Network!</h1>
        <p className="login-subtitle">Your profile has been created successfully.</p>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      <h1>Complete Your Profile</h1>
      <p className="text-muted mb-2">Tell us about yourself to join the network.</p>

      <form onSubmit={handleSubmit}>
        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name *</label>
        <input name="full_name" value={formData.full_name} onChange={handleChange} required className="input" />

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
        <input name="email" value={formData.email} disabled className="input" style={{ background: '#f5f5f5' }} />

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>LinkedIn URL *</label>
        <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} required placeholder="https://linkedin.com/in/yourname" className="input" />

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Member Type *</label>
        <select name="member_type" value={formData.member_type} onChange={handleChange} className="input">
          <option value="alumni">Alumni</option>
          <option value="friend">Friend (External Contact)</option>
        </select>

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Skills</label>
        <input name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Strategy, Data Analysis, Python" className="input" />
        <p className="text-xs text-muted" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>Comma-separated</p>

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Industries</label>
        <input name="industries" value={formData.industries} onChange={handleChange} placeholder="e.g. Tech, Healthcare, Finance" className="input" />
        <p className="text-xs text-muted" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>Comma-separated</p>

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Languages</label>
        <input name="languages" value={formData.languages} onChange={handleChange} placeholder="e.g. English, German, Spanish" className="input" />
        <p className="text-xs text-muted" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>Comma-separated</p>

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Education</label>
        <input name="education" value={formData.education} onChange={handleChange} placeholder="e.g. MBA, University of Munich" className="input" />

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Firm History</label>
        <textarea name="firm_history" value={formData.firm_history} onChange={handleChange} placeholder="e.g. McKinsey (2019-2022), BCG (2022-present)" rows={3} className="input" />

        <label className="text-sm" style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Bio</label>
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="A short description about yourself" rows={3} className="input" />

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input type="checkbox" name="open_to_mentoring" checked={formData.open_to_mentoring} onChange={handleChange} />
            Open to mentoring
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input type="checkbox" name="open_to_referrals" checked={formData.open_to_referrals} onChange={handleChange} />
            Open to referrals
          </label>
        </div>

        <button type="submit" disabled={loading} className="btn-lime" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
          {loading ? 'Saving...' : 'Join the Network'}
        </button>
      </form>
    </div>
  )
}
