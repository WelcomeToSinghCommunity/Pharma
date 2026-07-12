import { useEffect, useState } from 'react';
import { Calendar, Radio, Video } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabase.js';

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function LiveClasses() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    if (!hasSupabaseConfig) return;
    supabase
      .from('live_sessions')
      .select('*')
      .order('scheduled_at', { ascending: true })
      .then(({ data }) => { setSessions(data ?? []); setLoading(false); })
      .catch(err => console.error('Error fetching sessions:', err));
  };

  useEffect(() => {
    if (!hasSupabaseConfig) { setLoading(false); return; }
    fetchSessions();

    // Subscribe to realtime changes on live_sessions table to keep class status fresh
    const channel = supabase
      .channel('live-sessions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => fetchSessions())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const live = sessions.filter((s) => s.status === 'live');
  const upcoming = sessions.filter((s) => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date());
  const past = sessions.filter((s) => s.status === 'ended');

  function setReminder(session) {
    const key = `reminder_${session.id}`;
    localStorage.setItem(key, session.scheduled_at);
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          alert(`Reminder set for "${session.title}" on ${formatDateTime(session.scheduled_at)}`);
        }
      });
    } else {
      alert(`Reminder set for "${session.title}"`);
    }
  }

  if (loading) return <section className="section"><p className="text-slate-400">Loading sessions…</p></section>;

  return (
    <section className="section">
      <div className="max-w-3xl">
        <span className="eyebrow-dark">Live Learning</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">Live Classes</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Join Harish C. Singh live for Q&amp;A sessions, deep dives, and interactive GMP training.
        </p>
      </div>

      {/* Live now */}
      {live.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
            </span>
            <h2 className="font-display text-2xl font-bold text-red-600">Live Now</h2>
          </div>
          <div className="mt-5 space-y-6">
            {live.map((s) => (
              <div key={s.id} className="rounded border-2 border-red-200 bg-white p-6 shadow-soft">
                {s.thumbnail_url && <img src={s.thumbnail_url} alt="" className="mb-4 h-48 w-full rounded object-cover" />}
                <h3 className="font-display text-2xl font-bold text-navy">{s.title}</h3>
                {s.description && <p className="mt-2 text-slate-600">{s.description}</p>}
                {s.stream_url && (
                  <div className="mt-5">
                    <div className="aspect-video w-full overflow-hidden rounded border border-slate-200">
                      <iframe src={s.stream_url} className="h-full w-full" allowFullScreen title={s.title} />
                    </div>
                  </div>
                )}
                <a href={s.stream_url || '#'} target="_blank" rel="noreferrer" className="btn btn-primary mt-4 inline-flex">
                  <Radio size={16} /> Join Live Class
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-navy">Upcoming Sessions</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {upcoming.map((s) => (
              <div key={s.id} className="course-card">
                {s.thumbnail_url ? (
                  <img src={s.thumbnail_url} alt="" className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-navy to-teal">
                    <Video size={48} className="text-white/60" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-teal" />
                    <span className="text-xs font-bold text-teal">Coming Live at {formatDateTime(s.scheduled_at)}</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-navy">{s.title}</h3>
                  {s.description && <p className="mt-2 text-sm text-slate-600">{s.description}</p>}
                  <button className="btn btn-outline mt-4 w-full justify-center" onClick={() => setReminder(s)}>
                    Set Reminder 🔔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-navy">Past Sessions</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {past.map((s) => (
              <div key={s.id} className="course-card">
                {s.thumbnail_url ? (
                  <img src={s.thumbnail_url} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-slate-100">
                    <Video size={32} className="text-slate-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-navy">{s.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(s.scheduled_at)}</p>
                  {s.stream_url && (
                    <a href={s.stream_url} target="_blank" rel="noreferrer" className="btn btn-outline mt-3 w-full justify-center text-sm">
                      Watch Recording
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="empty-state mt-10 text-center">
          <Video size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">No live sessions scheduled yet.</p>
          <p className="mt-1 text-sm text-slate-400">Check back soon — live classes are coming!</p>
        </div>
      )}
    </section>
  );
}
