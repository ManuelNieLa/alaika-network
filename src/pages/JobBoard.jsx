import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function JobBoard({ user, isAdmin }) {
  const [greenhouseJobs, setGreenhouseJobs] = useState([])
  const [communityJobs, setCommunityJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [referralJobId, setReferralJobId] = useState(null)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')

  useEffect(function() { fetchAll() }, [])

  async function fetchAll() {
    await Promise.all([fetchGreenhouse(), fetchCommunityJobs()])
    setLoading(false)
  }

  async function fetchGreenhouse() {
    try {
      var res = await fetch('https://boards-api.greenhouse.io/v1/boards/alaika/jobs')
      var data = await res.json()
      var jobs = (data.jobs || []).map(function(j) {
        return { id: 'gh-' + j.id, title: j.title, company: 'ALAIKA Advisory', location: j.location ? j.location.name : '', url: 'https://job-boards.eu.greenhouse.io/alaika/jobs/' + j.id, source: 'greenhouse' }
      })
      setGreenhouseJobs(jobs)
    } catch (err) { console.error('Greenhouse fetch error:', err) }
  }

  async function fetchCommunityJobs() {
    var r = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setCommunityJobs((r.data || []).map(function(j) { return Object.assign({}, j, { source: 'community' }) }))
  }

  var allJobs = greenhouseJobs.concat(communityJobs)
  var filtered = allJobs.filter(function(j) {
    var matchesSource = source === 'all' || (source === 'alaika' && j.source === 'greenhouse') || (source === 'community' && j.source === 'community')
    if (!search) return matchesSource
    var term = search.toLowerCase()
    return matchesSource && ((j.title && j.title.toLowerCase().includes(term)) || (j.company && j.company.toLowerCase().includes(term)) || (j.location && j.location.toLowerCase().includes(term)))
  })

  if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading jobs...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Job Board</h2>
        {isAdmin ? <button onClick={function() { setShowPostForm(!showPostForm) }} className="btn-lime">{showPostForm ? 'Cancel' : 'Post a Job'}</button> : null}
      </div>
      {showPostForm ? <PostJobForm user={user} onDone={function() { setShowPostForm(false); fetchCommunityJobs() }} /> : null}
      <div className="search-bar">
        <input type="text" placeholder="Search jobs..." value={search} onChange={function(e) { setSearch(e.target.value) }} className="input" />
        <select value={source} onChange={function(e) { setSource(e.target.value) }}>
          <option value="all">All Jobs</option>
          <option value="alaika">ALAIKA Careers</option>
          <option value="community">Community Posts</option>
        </select>
      </div>
      <p className="text-muted text-sm mb-2">{filtered.length} jobs ({greenhouseJobs.length} ALAIKA, {communityJobs.length} community)</p>
      {filtered.map(function(job) {
        return <JobCard key={job.id} job={job} showReferral={referralJobId === job.id} onToggleReferral={function() { setReferralJobId(referralJobId === job.id ? null : job.id) }} user={user} />
      })}
    </div>
  )
}

function PostJobForm({ user, onDone }) {
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '', url: '' })
  const [saving, setSaving] = useState(false)
  function handleChange(e) { setForm(function(prev) { return Object.assign({}, prev, { [e.target.name]: e.target.value }) }) }
  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    var r = await supabase.from('jobs').insert({ posted_by: user.id, title: form.title, company: form.company, location: form.location, description: form.description, url: form.url })
    setSaving(false)
    if (r.error) alert('Error: ' + r.error.message); else onDone()
  }
  return (
    <div className="form-card">
      <h3 style={{ marginBottom: '1rem' }}>Post a New Job</h3>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Job Title *" value={form.title} onChange={handleChange} required className="input" />
        <input name="company" placeholder="Company *" value={form.company} onChange={handleChange} required className="input" />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input" />
        <input name="url" placeholder="Application URL" value={form.url} onChange={handleChange} className="input" />
        <textarea name="description" placeholder="Job description..." value={form.description} onChange={handleChange} rows={4} className="input" />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Posting...' : 'Post Job'}</button>
      </form>
    </div>
  )
}

function JobCard({ job, showReferral, onToggleReferral, user }) {
  var isGreenhouse = job.source === 'greenhouse'
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{job.title}</h3>
          <p className="text-sm" style={{ color: '#555', margin: '0.25rem 0' }}>{job.company}</p>
          {job.location ? <p className="text-xs text-muted">{job.location}</p> : null}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {isGreenhouse ? <span className="badge badge-lime">ALAIKA</span> : null}
          {job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}>Apply</a> : null}
          <button onClick={onToggleReferral} className={showReferral ? 'btn-blue' : 'btn-blue-outline'} style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}>Refer</button>
        </div>
      </div>
      {job.description ? <p className="text-sm mt-1" style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{job.description}</p> : null}
      {showReferral ? <ReferralForm jobId={job.id} user={user} onDone={onToggleReferral} /> : null}
    </div>
  )
}

function ReferralForm({ jobId, user, onDone }) {
  const [form, setForm] = useState({ candidate_name: '', candidate_email: '', candidate_linkedin: '', note: '' })
  const [saving, setSaving] = useState(false)
  function handleChange(e) { setForm(function(prev) { return Object.assign({}, prev, { [e.target.name]: e.target.value }) }) }
  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    var isGh = typeof jobId === 'string' && jobId.startsWith('gh-')
    var r = await supabase.from('referrals').insert({ job_id: isGh ? null : jobId, referrer_id: user.id, candidate_name: form.candidate_name, candidate_email: form.candidate_email, candidate_linkedin: form.candidate_linkedin, note: form.note + (isGh ? ' [Greenhouse Job]' : '') })
    setSaving(false)
    if (r.error) alert('Error: ' + r.error.message); else { alert('Referral submitted!'); onDone() }
  }
  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-100)', borderRadius: '8px' }}>
      <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Refer a Candidate</h4>
      <form onSubmit={handleSubmit}>
        <input name="candidate_name" placeholder="Candidate Name *" value={form.candidate_name} onChange={handleChange} required className="input" />
        <input name="candidate_email" placeholder="Candidate Email *" value={form.candidate_email} onChange={handleChange} required type="email" className="input" />
        <input name="candidate_linkedin" placeholder="Candidate LinkedIn URL" value={form.candidate_linkedin} onChange={handleChange} className="input" />
        <textarea name="note" placeholder="Why are you referring this person?" value={form.note} onChange={handleChange} rows={2} className="input" />
        <button type="submit" disabled={saving} className="btn-blue">{saving ? 'Submitting...' : 'Submit Referral'}</button>
      </form>
    </div>
  )
}
