import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabase.js';

export default function Contact() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newsletter, setNewsletter] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim() || form.message.trim().length < 20) e.message = 'At least 20 characters required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message. Please try again.');
      }

      if (hasSupabaseConfig) {
        try {
          await supabase.from('contact_submissions').insert({
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            phone: form.phone || null,
            message: form.message,
          });
        } catch (dbErr) {
          console.warn('Failed to save submission to Supabase database:', dbErr);
        }
      }

      setSubmitted(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrors({ submit: err.message || 'An error occurred while sending your message. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNewsletter(e) {
    e.preventDefault();
    setNewsletterError('');
    if (!newsletter.trim() || !/\S+@\S+\.\S+/.test(newsletter)) {
      setNewsletterError('Please enter a valid email.');
      return;
    }
    if (hasSupabaseConfig) {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: newsletter });
      if (error && error.code === '23505') {
        setNewsletterError('You are already subscribed!');
        return;
      }
    }
    setNewsletterDone(true);
    setNewsletter('');
  }

  return (
    <section className="section">
      <div className="max-w-3xl">
        <span className="eyebrow-dark">Get in touch</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">Connect with NextGen Pharma</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">Have a question about our courses? Want to collaborate? We'd love to hear from you.</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left — Contact form */}
        <div className="panel">
          {submitted ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/5">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-extrabold text-navy">Message Sent!</h2>
              <p className="mt-3 text-slate-600 max-w-md mx-auto leading-relaxed">
                Thanks for reaching out! We have received your inquiry. Our support team will review it and get back to you within 24 hours.
              </p>
              <button className="btn btn-outline mt-8 px-6 py-2.5 rounded-xl transition-all" onClick={() => setSubmitted(false)}>Send another message</button>
            </div>
          ) : (
            <>
              <h2 className="panel-title">Send us a message</h2>
              {errors.submit && (
                <div className="mb-4 rounded-lg bg-red-50/80 backdrop-blur-sm p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/30">
                  {errors.submit}
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    First Name *
                    <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Harish" />
                    {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
                  </label>
                  <label>
                    Last Name *
                    <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Singh" />
                    {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
                  </label>
                </div>
                <label>
                  Email *
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                  {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                </label>
                <label>
                  Phone <span className="font-normal text-slate-400">(optional — Indian format e.g. +91 98765 43210)</span>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </label>
                <label>
                  Message *
                  <textarea rows="5" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you'd like to discuss..." />
                  {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
                </label>
                <button className="btn btn-primary w-full justify-center" type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right — Contact info */}
        <div className="space-y-6">
          <div className="panel">
            <h2 className="panel-title">Contact Information</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="font-bold text-navy">Our Address</p>
                  <p className="mt-1 text-sm text-slate-600">Manjri Bk, Pune, 412307</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Phone size={20} />
                </span>
                <div>
                  <p className="font-bold text-navy">For Enquiries</p>
                  <a href="tel:+919630877397" className="mt-1 text-sm font-semibold text-teal hover:underline">+91 9630877397</a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Mail size={20} />
                </span>
                <div>
                  <p className="font-bold text-navy">Email us at</p>
                  <a href="mailto:contact@nextgenpharma.org" className="mt-1 text-sm font-semibold text-teal hover:underline">contact@nextgenpharma.org</a>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="panel">
            <h2 className="font-display text-lg font-bold text-navy">Stay Updated</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Get updates on new courses, live sessions, and pharma career opportunities.</p>
            {newsletterDone ? (
              <p className="mt-4 font-semibold text-teal">✓ Thanks for subscribing!</p>
            ) : (
              <form className="mt-4 flex flex-col gap-3" onSubmit={handleNewsletter}>
                <input type="email" value={newsletter} onChange={e => setNewsletter(e.target.value)} placeholder="your@email.com" />
                {newsletterError && <p className="text-xs text-red-500">{newsletterError}</p>}
                <button className="btn btn-primary w-full justify-center" type="submit">Subscribe</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
