import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ContentFeed({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(function() { fetchContent() }, [])

  async function fetchContent() {
    var r = await supabase.from('content_feed').select('*').order('created_at', { ascending: false })
    setItems(r.data || [])
    setLoading(false)
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Content Feed</h2>
        <button onClick={function() { setShowForm(!showForm) }} style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : 'Share Content'}
        </button>
      </div>
      {showForm ? <AddForm user={user} onDone={function() { setShowForm(false); fetchContent() }} /> : null}
      <p style={{ color: '#666', marginBottom: '1rem' }}>{items.length} items</p>
      {items.map(function(item) { return <Card key={item.id} item={item} /> })}
    </div>
  )
}

function AddForm({ user, onDone }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    var r = await supabase.from('content_feed').insert({ posted_by: user.id, content_type: 'linkedin', title: title, description: desc, linkedin_post_url: url })
    setSaving(false)
    if (r.error) { alert('Error: ' + r.error.message) } else { onDone() }
  }

  var s = { width: '100%', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '0.75rem' }
  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Share Content</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title *" value={title} onChange={function(e) { setTitle(e.target.value) }} required style={s} />
        <textarea placeholder="Description..." value={desc} onChange={function(e) { setDesc(e.target.value) }} rows={2} style={s} />
        <input placeholder="LinkedIn post URL *" value={url} onChange={function(e) { setUrl(e.target.value) }} required style={s} />
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Share'}</button>
      </form>
    </div>
  )
}

function Card({ item }) {
  var match = item.linkedin_post_url ? item.linkedin_post_url.match(/activity[-:](\d+)/) : null
  var embedId = match ? 'urn:li:activity:' + match[1] : null
  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#aaa' }}>{new Date(item.created_at).toLocaleDateString()}</p>
      <h3 style={{ margin: '0.5rem 0' }}>{item.title}</h3>
      {item.description ? <p style={{ color: '#555' }}>{item.description}</p> : null}
      {item.linkedin_post_url ? <a href={item.linkedin_post_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', fontSize: '0.85rem' }}>Open on LinkedIn</a> : null}
      {embedId ? <iframe src={'https://www.linkedin.com/embed/feed/update/' + embedId} width="100%" height="400" frameBorder="0" title="LinkedIn" style={{ marginTop: '0.75rem', borderRadius: '8px', border: '1px solid #eee' }} /> : null}
    </div>
  )
}
