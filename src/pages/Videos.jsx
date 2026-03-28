import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getYouTubeId(url) {
  if (!url) return null
  var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
  return match ? match[1] : null
}

export default function Videos({ user, isAdmin }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(function() { fetchVideos() }, [])

  async function fetchVideos() {
    var r = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    setVideos(r.data || [])
    setLoading(false)
  }

  if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading videos...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Video Library</h2>
        {isAdmin ? <button onClick={function() { setShowForm(!showForm) }} className="btn-lime">{showForm ? 'Cancel' : 'Add Video'}</button> : null}
      </div>
      {showForm ? <VideoForm user={user} onDone={function() { setShowForm(false); fetchVideos() }} /> : null}
      <p className="text-muted text-sm mb-2">{videos.length} videos</p>
      <div className="video-grid">
        {videos.map(function(v) {
          var ytId = getYouTubeId(v.youtube_url)
          return (
            <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {ytId ? (
                <iframe src={'https://www.youtube.com/embed/' + ytId} width="100%" height="225" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={v.title} />
              ) : null}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{v.title}</h3>
                {v.description ? <p className="text-sm text-muted">{v.description}</p> : null}
                <p className="text-xs text-muted mt-1">{new Date(v.created_at).toLocaleDateString()}</p>
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
    e.preventDefault(); setSaving(true)
    var r = await supabase.from('videos').insert({ added_by: user.id, title: title, description: desc, youtube_url: url })
    setSaving(false)
    if (r.error) alert('Error: ' + r.error.message); else onDone()
  }

  return (
    <div className="form-card">
      <h3 style={{ marginBottom: '1rem' }}>Add Video</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Video Title *" value={title} onChange={function(e) { setTitle(e.target.value) }} required className="input" />
        <input placeholder="YouTube URL *" value={url} onChange={function(e) { setUrl(e.target.value) }} required className="input" />
        <textarea placeholder="Description..." value={desc} onChange={function(e) { setDesc(e.target.value) }} rows={2} className="input" />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add Video'}</button>
      </form>
    </div>
  )
}
