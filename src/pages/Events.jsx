import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Events({ user }) {
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(function() { fetchAll() }, [])

  async function fetchAll() {
    var e = await supabase.from('events').select('*').order('event_date', { ascending: true })
    var r = await supabase.from('event_rsvps').select('*')
    setEvents(e.data || [])
    setRsvps(r.data || [])
    setLoading(false)
  }

  async function toggleRsvp(eventId) {
    var existing = rsvps.find(function(r) { return r.event_id === eventId && r.user_id === user.id })
    if (existing) {
      await supabase.from('event_rsvps').delete().eq('id', existing.id)
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: user.id })
    }
    fetchAll()
  }

  function getRsvpCount(eventId) {
    return rsvps.filter(function(r) { return r.event_id === eventId }).length
  }

  function hasRsvpd(eventId) {
    return rsvps.some(function(r) { return r.event_id === eventId && r.user_id === user.id })
  }

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading events...</p>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Events</h2>
        <button onClick={function() { setShowForm(!showForm) }} style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>
      {showForm ? <EventForm user={user} onDone={function() { setShowForm(false); fetchAll() }} /> : null}
      <p style={{ color: '#666', marginBottom: '1rem' }}>{events.length} events</p>
      {events.map(function(ev) {
        var isPast = new Date(ev.event_date) < new Date()
        return (
          <div key={ev.id} style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1rem', opacity: isPast ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{ev.title}</h3>
                <p style={{ color: '#555', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                  {new Date(ev.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {ev.location ? <p style={{ fontSize: '0.85rem', color: '#777' }}>{ev.location}</p> : null}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>{getRsvpCount(ev.id)} attending</p>
                {isPast ? (
                  <span style={{ fontSize: '0.8rem', color: '#999' }}>Past event</span>
                ) : (
                  <button onClick={function() { toggleRsvp(ev.id) }} style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    border: '1px solid #0077b5',
                    borderRadius: '6px',
                    background: hasRsvpd(ev.id) ? '#0077b5' : 'white',
                    color: hasRsvpd(ev.id) ? 'white' : '#0077b5',
                    cursor: 'pointer'
                  }}>
                    {hasRsvpd(ev.id) ? 'Going' : 'RSVP'}
                  </button>
                )}
              </div>
            </div>
            {ev.description ? <p style={{ color: '#555', marginTop: '0.75rem', fontSize: '0.95rem' }}>{ev.description}</p> : null}
            {ev.event_url ? <a href={ev.event_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', fontSize: '0.85rem' }}>Event link</a> : null}
          </div>
        )
      })}
    </div>
  )
}

function EventForm({ user, onDone }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    var r = await supabase.from('events').insert({ created_by: user.id, title: title, description: desc, event_date: date, location: location, event_url: url })
    setSaving(false)
    if (r.error) { alert('Error: ' + r.error.message) } else { onDone() }
  }

  var s = { width: '100%', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '0.75rem' }
  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #eee', borderRadius: '10px', marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Create Event</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Event Title *" value={title} onChange={function(e) { setTitle(e.target.value) }} required style={s} />
        <input type="datetime-local" value={date} onChange={function(e) { setDate(e.target.value) }} required style={s} />
        <input placeholder="Location" value={location} onChange={function(e) { setLocation(e.target.value) }} style={s} />
        <input placeholder="Event URL (optional)" value={url} onChange={function(e) { setUrl(e.target.value) }} style={s} />
        <textarea placeholder="Description..." value={desc} onChange={function(e) { setDesc(e.target.value) }} rows={3} style={s} />
        <button type="submit" disabled={saving} style={{ padding: '0.5rem 1.5rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{saving ? 'Creating...' : 'Create Event'}</button>
      </form>
    </div>
  )
}