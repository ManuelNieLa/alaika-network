import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function JobBoard({ user }) {
  const [greenhouseJobs, setGreenhouseJobs] = useState([])
  const [communityJobs, setCommunityJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [referralJobId, setReferralJobId] = useState(null)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const gh = fetchGreenhouse()
    const community = fetchCommunityJobs()
    await Promise.all([gh, community])
    setLoading(false)
  }

const fetchGreenhouse = async () => {
    try {
      const res = await fetch('https://boards-api.greenhouse.io/v1/boards/alaika/jobs')
      const data = await res.json()
      const jobs = (data.jobs || []).map((j) => ({
        id: 'gh-' + j.id,
        title: j.title,
        company: 'ALAIKA Advisory',
        location: j.location?.name || '',
        url: 'https://job-boards.eu.greenhouse.io/alaika/jobs/' + j.id,
        source: 'greenhouse',
      }))
      setGreenhouseJobs(jobs)
    } catch (err) {
      console.error('Greenhouse fetch error:', err)
    }
  }
  const fetchCommunityJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    setCommunityJobs((data || []).map((j) => ({ ...j, source: 'community' })))
  }

  const allJobs = [...greenhouseJobs, ...communityJobs]

  const filtered = allJobs.filter((j) => {
    const matchesSource =
      source === 'all' ||
      (source === 'alaika' && j.source === 'greenhouse') ||
      (source === 'community' && j.source === 'community')

    if (!search) return matchesSource
    const term = search.toLowerCase()
    return (
      matchesSource &&
      (j.title?.toLowerCase().includes(term) ||
        j.company?.toLowerCase().includes(term) ||
        j.location?.toLowerCase().includes(term))
    )
  })

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading jobs...</p>
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Job Board</h2>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          style={{
            padding: '0.5rem 1rem',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {showPostForm ? 'Cancel' : 'Post a Job'}
        </button>
      </div>

      {showPostForm && (
        <PostJobForm user={user} onDone={() => { setShowPostForm(false); fetchCommunityJobs() }} />
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
          }}
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
          }}
        >
          <option value="all">All Jobs</option>
          <option value="alaika">ALAIKA Careers</option>
          <option value="community">Community Posts</option>
        </select>
      </div>

      <p style={{ color: '#666', marginBottom: '1rem' }}>
        {filtered.length} jobs found ({greenhouseJobs.length} from ALAIKA, {communityJobs.length} from community)
      </p>

      {filtered.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          showReferral={referralJobId === job.id}
          onToggleReferral={() => setReferralJobId(referralJobId === job.id ? null : job.id)}
          user={user}
        />
      ))}
    </div>
  )
}

function PostJobForm({ user, onDone }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    url: '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('jobs').insert({
      posted_by: user.id,
      title: form.title,
      company: form.company,
      location: form.location,
      description: form.description,
      url: form.url,
    })
    setSaving(false)
    if (error) alert('Error: ' + error.message)
    else onDone()
  }

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
  }

  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Post a New Job</h3>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Job Title *" value={form.title} onChange={handleChange} required style={inputStyle} />
        <input name="company" placeholder="Company *" value={form.company} onChange={handleChange} required style={inputStyle} />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={inputStyle} />
        <input name="url" placeholder="Application URL" value={form.url} onChange={handleChange} style={inputStyle} />
        <textarea name="description" placeholder="Job description..." value={form.description} onChange={handleChange} rows={4} style={inputStyle} />
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {saving ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}

function JobCard({ job, showReferral, onToggleReferral, user }) {
  const isGreenhouse = job.source === 'greenhouse'

  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0 }}>{job.title}</h3>
          <p style={{ color: '#555', margin: '0.25rem 0' }}>{job.company}</p>
          {job.location && <p style={{ fontSize: '0.85rem', color: '#777' }}>{job.location}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {isGreenhouse && (
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#c8e6c9', borderRadius: '999px', color: '#2e7d32', alignSelf: 'center' }}>
              ALAIKA
            </span>
          )}
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: '1px solid #ddd', borderRadius: '6px', color: '#333', textDecoration: 'none' }}>
              Apply
            </a>
          )}
          <button onClick={onToggleReferral} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: '1px solid #0077b5', borderRadius: '6px', background: showReferral ? '#0077b5' : 'white', color: showReferral ? 'white' : '#0077b5', cursor: 'pointer' }}>
            Refer
          </button>
        </div>
      </div>

      {job.description && (
        <p style={{ color: '#555', marginTop: '0.75rem', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{job.description}</p>
      )}

      {showReferral && <ReferralForm jobId={job.id} user={user} onDone={onToggleReferral} />}
    </div>
  )
}

function ReferralForm({ jobId, user, onDone }) {
  const [form, setForm] = useState({ candidate_name: '', candidate_email: '', candidate_linkedin: '', note: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('referrals').insert({
      job_id: typeof jobId === 'string' && jobId.startsWith('gh-') ? null : jobId,
      referrer_id: user.id,
      candidate_name: form.candidate_name,
      candidate_email: form.candidate_email,
      candidate_linkedin: form.candidate_linkedin,
      note: form.note + (typeof jobId === 'string' && jobId.startsWith('gh-') ? ' [Greenhouse Job]' : ''),
    })
    setSaving(false)
    if (error) alert('Error: ' + error.message)
    else { alert('Referral submitted!'); onDone() }
  }

  const inputStyle = { width: '100%', padding: '0.5rem', fontSize: '0.9rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '0.5rem' }

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
      <h4 style={{ marginBottom: '0.75rem' }}>Refer a Candidate</h4>
      <form onSubmit={handleSubmit}>
        <input name="candidate_name" placeholder="Candidate Name *" value={form.candidate_name} onChange={handleChange} required style={inputStyle} />
        <input name="candidate_email" placeholder="Candidate Email *" value={form.candidate_email} onChange={handleChange} required type="email" style={inputStyle} />
        <input name="candidate_linkedin" placeholder="Candidate LinkedIn URL" value={form.candidate_linkedin} onChange={handleChange} style={inputStyle} />
        <textarea name="note" placeholder="Why are you referring this person?" value={form.note} onChange={handleChange} rows={2} style={inputStyle} />
        <button type="submit" disabled={saving} style={{ padding: '0.4rem 1rem', background: '#0077b5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
          {saving ? 'Submitting...' : 'Submit Referral'}
        </button>
      </form>
    </div>
  )
}