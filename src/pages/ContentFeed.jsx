import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ContentCard({ item }) {
  var match = item.linkedin_post_url ? item.linkedin_post_url.match(/activity[-:](\d+)/) : null
  var embedId = match ? 'urn:li:activity:' + match[1] : null
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span className="badge badge-blue">{item.content_type}</span>
        <span className="text-xs text-muted">{new Date(item.created_at).toLocaleDateString()}</span>
      </div>
      <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.05rem' }}>{item.title}</h3>
      {item.description ? <p className="text-sm" style={{ color: '#555' }}>{item.description}</p> : null}
      {item.linkedin_post_url ? <a href={item.linkedin_post_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--blue)' }}>Open on LinkedIn</a> : null}
      {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--blue)' }}>Open link</a> : null}
      {embedId ? <iframe src={'https://www.linkedin.com/embed/feed/update/' + embedId} width="100%" height="400" frameBorder="0" title="LinkedIn" style={{ marginTop: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }} /> : null}
    </div>
  )
}

function AddForm({ user, onDone }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    var r = await supabase.from('content_feed').insert({ posted_by: user.id, content_type: 'linkedin', title: title, description: desc, linkedin_post_url: url })
    setSaving(false)
    if (r.error) alert('Error: ' + r.error.message); else onDone()
  }

  return (
    <div className="form-card">
      <h3 style={{ marginBottom: '1rem' }}>Share Content</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title *" value={title} onChange={function(e) { setTitle(e.target.value) }} required className="input" />
        <textarea placeholder="Description..." value={desc} onChange={function(e) { setDesc(e.target.value) }} rows={2} className="input" />
        <input placeholder="LinkedIn post URL *" value={url} onChange={function(e) { setUrl(e.target.value) }} required className="input" />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Share'}</button>
      </form>
    </div>
  )
}

export default function ContentFeed({ user, isAdmin }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(function() { fetchContent() }, [])

  async function fetchContent() {
    var r = await supabase.from('content_feed').select('*').order('created_at', { ascending: false })
    setItems(r.data || [])
    setLoading(false)
  }

  if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Content Feed</h2>
        {isAdmin ? <button onClick={function() { setShowForm(!showForm) }} className="btn-lime">{showForm ? 'Cancel' : 'Share Content'}</button> : null}
      </div>
      {showForm ? <AddForm user={user} onDone={function() { setShowForm(false); fetchContent() }} /> : null}
      <p className="text-muted text-sm mb-2">{items.length} items</p>
      {items.map(function(item) { return <ContentCard key={item.id} item={item} /> })}
    </div>
  )
}
