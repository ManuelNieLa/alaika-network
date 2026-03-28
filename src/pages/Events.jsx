import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Events({ user, isAdmin }) {
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
    if (existing) { await supabase.from('event_rsvps').delete().eq('id', existing.id) }
    else { await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: user.id }) }
    fetchAll()
  }

  function getRsvpCount(eventId) { return rsvps.filter(function(r) { return r.event_id === eventId }).length }
  function hasRsvpd(eventId) { return rsvps.some(function(r) { return r.event_id === eventId && r.user_id === user.id }) }

  if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading events...</p>

  return (
    <div>
      <div className="page-header">
        <h2>Events</h2>
        {isAdmin ? <button onClick={function() { setShowForm(!showForm) }} className="btn-lime">{showForm ? 'Cancel' : 'Create Event'}</button> : null}
      </div>
      {showForm ? <EventForm user={user} onDone={function() { setShowForm(false); fetchAll() }} /> : null}
      <p className="text-muted text-sm mb-2">{events.length} events</p>
      {events.map(function(ev) {
        var isPast = new Date(ev.event_date) < new Date()
        return (
          <div key={ev.id} className="card" style={{ opacity: isPast ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{ev.title}</h3>
                <p className="text-sm" style={{ color: '#555', margin: '0.25rem 0' }}>
                  {new Date(ev.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {ev.location ? <p className="text-xs text-muted">{ev.location}</p> : null}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p className="text-sm text-muted mb-1">{getRsvpCount(ev.id)} attending</p>
                {isPast ? (
                  <span className="badge badge-gray">Past</span>
                ) : (
                  <button onClick={function() { toggleRsvp(ev.id) }} className={hasRsvpd(ev.id) ? 'btn-lime' : 'btn-outline'}>
                    {hasRsvpd(ev.id) ? 'Going' : 'RSVP'}
                  </button>
                )}
              </div>
            </div>
            {ev.description ? <p className="text-sm mt-1" style={{ color: '#555' }}>{ev.description}</p> : null}
            {ev.event_url ? <a href={ev.event_url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: 'var(--blue)' }}>Event link</a> : null}
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
    e.preventDefault(); setSaving(true)
    var r = await supabase.from('events').insert({ created_by: user.id, title: title, description: desc, event_date: date, location: location, event_url: url })
    setSaving(false)
    if (r.error) alert('Error: ' + r.error.message); else onDone()
  }

  return (
    <div className="form-card">
      <h3 style={{ marginBottom: '1rem' }}>Create Event</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Event Title *" value={title} onChange={function(e) { setTitle(e.target.value) }} required className="input" />
        <input type="datetime-local" value={date} onChange={function(e) { setDate(e.target.value) }} required className="input" />
        <input placeholder="Location" value={location} onChange={function(e) { setLocation(e.target.value) }} className="input" />
        <input placeholder="Event URL (optional)" value={url} onChange={function(e) { setUrl(e.target.value) }} className="input" />
        <textarea placeholder="Description..." value={desc} onChange={function(e) { setDesc(e.target.value) }} rows={3} className="input" />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Event'}</button>
      </form>
    </div>
  )
}
