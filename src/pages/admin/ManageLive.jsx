import { useEffect, useState } from 'react';
import { Plus, Radio, Square } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../../lib/supabase.js';

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ManageLive({ isAdmin }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', scheduled_at: '', stream_url: '', thumbnail_url: '',
  });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function load() {
    if (!hasSupabaseConfig) { setLoading(false); return; }
    const { data } = await supabase.from('live_sessions').select('*').order('scheduled_at', { ascending: false });
    setSessions(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title || !form.scheduled_at) { showToast('Title and date are required.'); return; }
    setSaving(true);
    const { error } = await supabase.from('live_sessions').insert({
      title: form.title,
      description: form.description,
      scheduled_at: form.scheduled_at,
      stream_url: form.stream_url,
      thumbnail_url: form.thumbnail_url,
      status: 'scheduled',
    });
    setSaving(false);
    if (error) { showToast('❌ Failed to save.'); return; }
    showToast('✅ Session scheduled!');
    setForm({ title: '', description: '', scheduled_at: '', stream_url: '', thumbnail_url: '' });
    load();
  }

  async function goLive(id) {
    await supabase.from('live_sessions').update({ status: 'live', started_at: new Date().toISOString() }).eq('id', id);
    showToast('🔴 You are now live!');
    load();
  }

  async function endLive(id) {
    await supabase.from('live_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', id);
    showToast('Session ended.');
    load();
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy">Manage Live Sessions</h2>

      {toast && (
        <div className="mt-4 rounded bg-teal/10 px-4 py-3 font-semibold text-teal">{toast}</div>
      )}

      {/* Create form */}
      <form className="panel mt-6" onSubmit={handleCreate}>
        <h3 className="panel-title">Schedule a New Session</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>Session Title *<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="OOS Investigation — Live Q&A" /></label>
          <label>Scheduled Date &amp; Time *<input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} /></label>
        </div>
        <label className="mt-4 block">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="2" placeholder="What will be covered in this session" /></label>
        <label className="mt-4 block">Stream URL (YouTube Live / embed URL)<input value={form.stream_url} onChange={e => setForm({ ...form, stream_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." /></label>
        <label className="mt-4 block">Thumbnail URL<input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." /></label>
        <button className="btn btn-primary mt-4" type="submit" disabled={saving}>
          <Plus size={16} /> {saving ? 'Scheduling…' : 'Schedule Session'}
        </button>
      </form>

      {/* Sessions list */}
      <div className="mt-8">
        <h3 className="font-display text-xl font-bold text-navy">All Sessions</h3>
        {loading ? <p className="mt-3 text-slate-400">Loading…</p> : (
          <div className="table-wrap mt-4">
            <table>
              <thead><tr><th>Title</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-slate-400 py-6">No sessions yet.</td></tr>
                )}
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.title}</strong></td>
                    <td>{formatDateTime(s.scheduled_at)}</td>
                    <td>
                      <span className={`badge ${s.status === 'live' ? 'bg-red-100 text-red-700' : s.status === 'ended' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {s.status === 'scheduled' && (
                          <button className="btn btn-primary text-xs" onClick={() => goLive(s.id)}>
                            <Radio size={14} /> Go Live
                          </button>
                        )}
                        {s.status === 'live' && (
                          <button className="btn btn-outline text-xs text-red-600" onClick={() => endLive(s.id)}>
                            <Square size={14} /> End Live
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
