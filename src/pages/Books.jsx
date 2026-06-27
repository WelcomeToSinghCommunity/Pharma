import { useEffect, useState } from 'react';
import { BookOpen, Download, ShoppingCart } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabase.js';

const TABS = ['All', 'QA/QC', 'Regulatory', 'Production'];

function formatPrice(p) { return p === 0 ? 'Free' : `₹${Number(p).toLocaleString('en-IN')}`; }

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    if (!hasSupabaseConfig) { setLoading(false); return; }
    supabase.from('books').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => { setBooks(data ?? []); setLoading(false); });
  }, []);

  const filtered = tab === 'All' ? books : books.filter((b) => b.category === tab);

  return (
    <section className="section">
      {/* Hero */}
      <div className="rounded bg-gradient-to-r from-navy to-teal p-8 text-white">
        <BookOpen size={40} className="text-white/70" />
        <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">📚 Pharma Books &amp; Study Material</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-200">
          Curated books for QA/QC, Regulatory Affairs, and Production professionals — hand-picked by Harish C. Singh.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            className={`rounded-full border px-5 py-2 text-sm font-bold transition ${tab === t ? 'border-teal bg-teal text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal hover:text-teal'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="mt-10 text-slate-400">Loading books…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state mt-10">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p>{tab === 'All' ? 'No books available yet. Check back soon!' : `No books in the ${tab} category yet.`}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <article key={book.id} className="course-card">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="h-52 w-full object-cover" />
              ) : (
                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-navy to-teal">
                  <BookOpen size={48} className="text-white/60" />
                </div>
              )}
              <div className="flex flex-col p-5">
                {book.category && <span className="badge mb-2 w-fit">{book.category}</span>}
                <h3 className="font-display text-lg font-bold text-navy">{book.title}</h3>
                {book.author && <p className="mt-1 text-sm text-slate-500">by {book.author}</p>}
                {book.description && <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{book.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-teal">{formatPrice(book.price ?? 0)}</span>
                </div>
                {book.razorpay_payment_link ? (
                  <a href={book.razorpay_payment_link} target="_blank" rel="noreferrer" className="btn btn-primary mt-4 w-full justify-center">
                    <ShoppingCart size={16} /> Buy Now
                  </a>
                ) : book.pdf_url ? (
                  <a href={book.pdf_url} target="_blank" rel="noreferrer" className="btn btn-outline mt-4 w-full justify-center">
                    <Download size={16} /> Download Free
                  </a>
                ) : (
                  <button className="btn btn-outline mt-4 w-full justify-center" disabled>Coming Soon</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
