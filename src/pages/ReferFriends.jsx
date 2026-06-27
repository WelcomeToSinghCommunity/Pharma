import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, Gift, Users } from 'lucide-react';
import { getReferralCode, getReferralUrl, getReferralStats } from '../hooks/useReferral.js';

export default function ReferFriends({ user }) {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ total: 0, converted: 0, credit: 0, history: [] });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      getReferralCode(user.id),
      getReferralStats(user.id),
    ]).then(([c, s]) => {
      setCode(c ?? '');
      setStats(s);
      setLoading(false);
    });
  }, [user]);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(getReferralUrl(code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const referralUrl = code ? getReferralUrl(code) : '';
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`Join NextGen Pharma and get 12% off! Use my link: ${referralUrl}`)}`;

  if (!user) {
    return (
      <section className="section">
        <div className="mx-auto max-w-lg rounded border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Gift size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Refer &amp; Earn</h1>
          <p className="mt-3 text-slate-600">Log in to get your unique referral link and start earning credits.</p>
          <Link className="btn btn-primary mt-6 inline-flex" to="/login">Login to get your referral link</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="max-w-3xl">
        <span className="eyebrow-dark">Referral Program</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">
          Refer &amp; Earn — Give 12%, Get 12%
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Share your link → your friend gets 12% off their first purchase → you earn 12% credit on your next purchase.
        </p>
      </div>

      {/* Referral link box */}
      <div className="mt-8 rounded border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-navy">Your Referral Link</h2>
        {loading ? (
          <p className="mt-3 text-slate-400">Generating your link…</p>
        ) : (
          <>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                readOnly
                value={referralUrl}
                className="flex-1 rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              />
              <button className="btn btn-primary shrink-0" onClick={handleCopy}>
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a className="btn btn-teal shrink-0" href={waUrl} target="_blank" rel="noreferrer">
                Share on WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-400">Referral code: <strong>{code}</strong></p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {[
          ['Total referrals sent', stats.total],
          ['Converted (purchased)', stats.converted],
          [`Available credit`, stats.credit > 0 ? `${stats.credit}%` : 'None yet'],
        ].map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-8 rounded border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-navy">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ['1. Share', 'Send your unique link to a pharma colleague or friend.'],
            ['2. They save 12%', 'When they purchase any course or plan using your link.'],
            ['3. You earn 12%', 'A 12% credit is added to your account for your next purchase.'],
          ].map(([step, desc]) => (
            <div key={step} className="rounded border border-slate-100 bg-slate-50 p-4">
              <p className="font-display font-bold text-teal">{step}</p>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History table */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-navy">Referral History</h2>
        {stats.history.length === 0 ? (
          <div className="empty-state mt-4">No referrals yet. Share your link to get started!</div>
        ) : (
          <div className="table-wrap mt-4">
            <table>
              <thead>
                <tr><th>Date</th><th>Status</th><th>Credit Earned</th></tr>
              </thead>
              <tbody>
                {stats.history.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${r.status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.status === 'converted' ? 'Converted' : 'Pending'}
                      </span>
                    </td>
                    <td>{r.status === 'converted' ? <span className="flex items-center gap-1 text-teal font-semibold"><CheckCircle2 size={14} /> 12%</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
