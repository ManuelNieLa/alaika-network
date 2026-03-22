import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getYouTubeId(url) {
  if (!url) return null
  var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
  return match ? match[1] : null
}

export default function Videos({ user }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(function() { fetchVideos() }, [])

  async function fetchVideos() {
    var r = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    setVideos(r.data || [])
    setLoading(false)
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading videos...</p>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Video Library</h2>
        <button onClick={function() { setShowForm(!showForm) }} style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>
      {showForm ? <VideoForm user={user} onDone={function() { setShowForm(false); fetchVideos() }} /> : null}
      <p style={{ color: '#666', marginBottom: '1rem' }}>{videos.length} videos</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
        {videos.map(function(v) {
          var ytId = getYouTubeId(v.youtube_url)
          return (
            <div key={v.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
              {ytId ? (
                <iframe
                  src={'https://www.youtube.com/embed/' + ytId}
                  width="100%"
                  height="225"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={v.title}
                />
              ) : null}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem' }}>{v.title}</h3>
                {v.description ? <p style={{ color: '#555', fontSize: '0.9rem' }}>{v.description}</p> : null}
                <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem' }}>{new Date(v.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VideoForm({ user, onDone }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    var r = await supabase.from('videos').insert({ added_by: user.id, title: title, description: desc, youtube_url: url })
    setSaving(false)
    if (r.error) { alert('Error: ' + r.error.message) } else { onDone() }
  }

  var s = { width: '100%', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '0.75rem' }
  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Add Video</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Video Title *" value={title} onChange={function(e) { setTitle(e.target.value) }} required style={s} />
        <input placeholder="YouTube URL *" value={url} onChange={function(e) { setUrl(e.target.value) }} required style={s} />
        <textarea placeholder="Description..." value={desc} onChange={function(e) { setDesc(e.target.value) }} rows={2} style={s} />
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{saving ? 'Adding...' : 'Add Video'}</button>
      </form>
    </div>
  )
}