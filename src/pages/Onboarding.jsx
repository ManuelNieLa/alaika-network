import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Onboarding({ user }) {
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    linkedin_url: '',
    member_type: 'alumni',
    skills: '',
    industries: '',
    languages: '',
    education: '',
    firm_history: '',
    bio: '',
    open_to_mentoring: false,
    open_to_referrals: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('members').insert({
      user_id: user.id,
      full_name: formData.full_name,
      email: formData.email,
      linkedin_url: formData.linkedin_url,
      member_type: formData.member_type,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      industries: formData.industries.split(',').map(s => s.trim()).filter(Boolean),
      languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
      education: formData.education,
      firm_history: formData.firm_history,
      bio: formData.bio,
      open_to_mentoring: formData.open_to_mentoring,
      open_to_referrals: formData.open_to_referrals,
    })

    setLoading(false)
    if (error) {
      console.error('Error:', error.message)
      alert('Something went wrong: ' + error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'system-ui' }}>
        <h1>Welcome to Alaika Network!</h1>
        <p>Your profile has been created successfully.</p>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: '600',
  }

  const fieldStyle = {
    marginBottom: '1rem',
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1>Complete Your Profile</h1>
      <p style={{ color: '#666' }}>Tell us about yourself to join the network.</p>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Full Name *</label>
          <input name="full_name" value={formData.full_name} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input name="email" value={formData.email} disabled style={{ ...inputStyle, background: '#f5f5f5' }} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>LinkedIn URL *</label>
          <input name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} required placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Member Type *</label>
          <select name="member_type" value={formData.member_type} onChange={handleChange} style={inputStyle}>
            <option value="alumni">Alumni</option>
            <option value="friend">Friend (External Contact)</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Skills</label>
          <input name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Strategy, Data Analysis, Python" style={inputStyle} />
          <small style={{ color: '#999' }}>Comma-separated</small>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Industries</label>
          <input name="industries" value={formData.industries} onChange={handleChange} placeholder="e.g. Tech, Healthcare, Finance" style={inputStyle} />
          <small style={{ color: '#999' }}>Comma-separated</small>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Languages</label>
          <input name="languages" value={formData.languages} onChange={handleChange} placeholder="e.g. English, German, Spanish" style={inputStyle} />
          <small style={{ color: '#999' }}>Comma-separated</small>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Education</label>
          <input name="education" value={formData.education} onChange={handleChange} placeholder="e.g. MBA, University of Munich" style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Firm History</label>
          <textarea name="firm_history" value={formData.firm_history} onChange={handleChange} placeholder="e.g. McKinsey (2019-2022), BCG (2022-present)" rows={3} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="A short description about yourself" rows={3} style={inputStyle} />
        </div>

        <div style={{ ...fieldStyle, display: 'flex', gap: '2rem' }}>
          <label>
            <input type="checkbox" name="open_to_mentoring" checked={formData.open_to_mentoring} onChange={handleChange} />
            {' '}Open to mentoring
          </label>
          <label>
            <input type="checkbox" name="open_to_referrals" checked={formData.open_to_referrals} onChange={handleChange} />
            {' '}Open to referrals
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Saving...' : 'Join the Network'}
        </button>
      </form>
    </div>
  )
}