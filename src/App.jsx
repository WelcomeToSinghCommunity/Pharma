import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, BookOpen, CheckCircle2, ChevronRight, ClipboardCheck,
  Download, Gift, LayoutDashboard, Lock, LogOut, Mail, MapPin, Menu, MessageSquare,
  Phone, Play, Plus, Radio, Search, ShieldCheck, UploadCloud, UserRound, Users, Video, X,
  Sun, Moon, Star, Linkedin, Megaphone,
} from 'lucide-react';
import {
  courses as staticCourses, getCourseBySlug as getCourseBySlugStatic, getLessonById, getLessonCount, getModuleCount, makeLessonId,
} from './data/courses.js';
import { supabase, hasSupabaseConfig } from './lib/supabase.js';
import {
  getCourses, getCourseBySlug, getCourseById, createCourse, updateCourse, deleteCourse,
  uploadThumbnail, uploadMaterial, uploadVideo,
  getAnnouncement, updateAnnouncement,
} from './lib/api.js';
import VideoPlayer from './components/VideoPlayer.jsx';
import CheckoutPage from './components/CheckoutPage.jsx';
import CourseInsights from './components/CourseInsights.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsConditions from './pages/TermsConditions.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import AboutUs from './pages/AboutUs.jsx';
import ReferFriends from './pages/ReferFriends.jsx';
import Contact from './pages/Contact.jsx';
import LiveClasses from './pages/LiveClasses.jsx';
import ManageLive from './pages/admin/ManageLive.jsx';
import Books from './pages/Books.jsx';
import { applyReferralFromURL } from './hooks/useReferral.js';

// Apply referral code from URL on load
applyReferralFromURL();

// ─── ANNOUNCEMENT BAR CONFIGURATION ──────────────────────────────────────────
const ANNOUNCEMENT_CONFIG = {
  show: true,
  badge: "Notice",
  text: "🚀 GAMP 5 & CSA Validation Course is launching next week! Register early for 20% off.",
  linkText: "Learn More",
  linkUrl: "/courses",
  theme: "gradient-teal", // options: "gradient-teal", "gradient-indigo", "warning-amber", "danger-red"
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const adminEmails = ['harideepsingh13@gmail.com', 'kishansingh.nmims@gmail.com'];

function useAuth() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    if (!hasSupabaseConfig) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  const user = session?.user ?? null;
  const isAdmin = adminEmails.includes(user?.email?.toLowerCase() ?? '');
  return { session, user, isAdmin, loading: session === undefined };
}

const publishedCourses = staticCourses.filter((c) => c.published);
function formatPrice(p) { return p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`; }
function getFirstLesson(course) { return makeLessonId(course.modules[0].title, 0); }

function RequireAuth({ user, loading, children }) {
  if (loading) return <PremiumLoader message="Verifying authentication session..." type="auth" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ user, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  async function handleLogout() { await supabase.auth.signOut(); setMenuOpen(false); }
  function closeMenu() { setMenuOpen(false); }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="brand-logo" aria-label="NextGen Pharma home" onClick={closeMenu}>
          <img src="/logo-harish-pharma-academy.svg" alt="NextGen Pharma" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <NavLink className="hover:text-teal" to="/courses">Courses</NavLink>
          
          <div className="relative" ref={resourcesRef}>
            <button 
              className="flex items-center gap-1 hover:text-teal transition-colors focus:outline-none"
              onClick={() => setResourcesOpen(!resourcesOpen)}
            >
              Resources <ChevronRight size={14} className={`transition-transform ${resourcesOpen ? 'rotate-90' : ''}`} />
            </button>
            {resourcesOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                <NavLink className="block px-4 py-2 hover:bg-slate-50 hover:text-teal" to="/books" onClick={() => setResourcesOpen(false)}>Books</NavLink>
                <NavLink className="block px-4 py-2 hover:bg-slate-50 hover:text-teal" to="/live" onClick={() => setResourcesOpen(false)}>Live Classes</NavLink>
              </div>
            )}
          </div>

          <NavLink className="hover:text-teal" to="/contact">Contact</NavLink>
          
          {user && (
            <>
              <NavLink className="hover:text-teal" to="/dashboard">Dashboard</NavLink>
              <NavLink className="hover:text-teal flex items-center gap-1" to="/refer"><Gift size={14} /> Refer</NavLink>
            </>
          )}
          
          {isAdmin && <NavLink className="hover:text-teal text-teal" to="/admin">Admin</NavLink>}
        </nav>
        
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-teal focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">{user.user_metadata?.full_name || user.email}</span>
              <button className="btn btn-ghost text-sm" onClick={handleLogout}><LogOut size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="btn btn-ghost text-sm" to="/login">Login</Link>
              <Link className="btn btn-primary text-sm" to="/signup">Sign Up</Link>
            </div>
          )}
        </div>
        
        <button className="icon-btn md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {menuOpen && (
        <div className="mobile-menu md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            <NavLink className="mobile-nav-link" to="/courses" onClick={closeMenu}>Courses</NavLink>
            <NavLink className="mobile-nav-link" to="/books" onClick={closeMenu}>Books</NavLink>
            <NavLink className="mobile-nav-link" to="/live" onClick={closeMenu}>Live Classes</NavLink>
            <NavLink className="mobile-nav-link" to="/contact" onClick={closeMenu}>Contact</NavLink>
            {user && <NavLink className="mobile-nav-link" to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>}
            {user && <NavLink className="mobile-nav-link" to="/refer" onClick={closeMenu}>🎁 Refer &amp; Earn</NavLink>}
            {isAdmin && <NavLink className="mobile-nav-link" to="/admin" onClick={closeMenu}>Admin</NavLink>}
          </nav>
          <div className="border-t border-slate-100 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} /> <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} /> <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>

            {user ? (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-slate-600">{user.user_metadata?.full_name || user.email}</span>
                <button className="btn btn-ghost w-full justify-center" onClick={handleLogout}><LogOut size={16} /> Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link className="btn btn-outline w-full justify-center" to="/login" onClick={closeMenu}>Login</Link>
                <Link className="btn btn-primary w-full justify-center" to="/signup" onClick={closeMenu}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Auth pages ───────────────────────────────────────────────────────────────
function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/login` } });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  }
  if (done) return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-8 text-center shadow-soft">
        <CheckCircle2 size={48} className="mx-auto text-teal" />
        <h1 className="mt-4 font-display text-2xl font-bold text-navy">Check your inbox!</h1>
        <p className="mt-3 leading-7 text-slate-600">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and log in.</p>
        <Link className="btn btn-primary mt-6 inline-flex" to="/login">Go to Login</Link>
      </div>
    </section>
  );
  return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft">
        <span className="eyebrow-dark">Join NextGen Pharma</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">Create your account</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label>Full name<input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required /></label>
          <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Password <span className="font-normal text-slate-400">(min 6 characters)</span><input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn btn-primary w-full justify-center" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="mt-4 text-sm text-slate-500">Already have an account? <Link className="font-semibold text-teal" to="/login">Log in</Link></p>
      </div>
    </section>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate('/dashboard');
  }
  return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft">
        <span className="eyebrow-dark">Welcome back</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">Log in to your account</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn btn-primary w-full justify-center" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <Link className="font-semibold text-teal" to="/forgot-password">Forgot password?</Link>
          <span className="text-slate-500">New here? <Link className="font-semibold text-teal" to="/signup">Create account</Link></span>
        </div>
      </div>
    </section>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }
  if (sent) return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-8 text-center shadow-soft">
        <Mail size={48} className="mx-auto text-teal" />
        <h1 className="mt-4 font-display text-2xl font-bold text-navy">Reset link sent</h1>
        <p className="mt-3 leading-7 text-slate-600">Check your inbox at <strong>{email}</strong> for the password reset link.</p>
        <Link className="btn btn-outline mt-6 inline-flex" to="/login">Back to Login</Link>
      </div>
    </section>
  );
  return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft">
        <span className="eyebrow-dark">Password reset</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">Reset your password</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn btn-primary w-full justify-center" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Reset Link'}</button>
        </form>
        <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/login"><ArrowLeft size={16} /> Back to Login</Link>
      </div>
    </section>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const PHARMA_TIPS = [
  "OOS (Out-of-Specification) investigations must be completed within 30 days of the initial result.",
  "USFDA 21 CFR Part 11 sets the criteria for electronic records and signatures to be trustworthy.",
  "Environmental monitoring in Grade A zones requires active air sampling, settle plates, and contact plates.",
  "GAMP 5 principles classify software from Category 1 (Infrastructure) to Category 5 (Custom Software).",
  "Cleanroom gowning procedures are the most critical control for preventing human contamination in sterile areas.",
  "FDA inspectors prioritize Data Integrity issues, including ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate).",
  "Annex 1 guidelines mandate a formal Contamination Control Strategy (CCS) to identify and mitigate risks."
];

function PremiumLoader({ message = "Loading...", type = "default" }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % PHARMA_TIPS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = prev < 50 ? 6 : prev < 80 ? 3 : prev < 95 ? 1.5 : 0.4;
        return Math.min(100, prev + increment);
      });
    }, 150);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="premium-loader-overlay">
      <div className="premium-loader-card">
        <div className="loader-icon-container">
          <div className="pulse-ring"></div>
          <div className="pulse-ring-slow"></div>
          <ShieldCheck size={36} className="loader-icon-svg" />
        </div>
        <h3 className="loader-title">{message}</h3>
        <div className="loader-progress-container">
          <div className="loader-progress-track">
            <div className="loader-progress-fill" style={{ width: `${progress}%` }}>
              <div className="loader-progress-glow"></div>
            </div>
          </div>
          <span className="loader-progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="loader-tip-box">
          <span className="loader-tip-label">PHARMA INSIGHT</span>
          <p className="loader-tip-text">
            "{PHARMA_TIPS[tipIndex]}"
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl">
      <span className="eyebrow-dark">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-lg leading-8 text-slate-600">{copy}</p>}
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <article className="course-card">
      <img src={course.thumbnail} alt="" className="h-44 w-full object-cover" />
      <div className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="badge">{course.level}</span>
          <span className="font-semibold text-teal">{formatPrice(course.priceInr)}</span>
        </div>
        <h3 className="font-display text-xl font-bold text-navy">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.shortDesc}</p>
        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>{getModuleCount(course)} modules</span>
          <span>{getLessonCount(course)} lessons</span>
        </div>
        <Link className="btn btn-outline mt-5 w-full justify-center" to={`/courses/${course.slug}`}>
          View Course <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const featured = publishedCourses.slice(0, 3);
  return (
    <>
      <section className="hero-section">
        <div className="hero-grid-overlay"></div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20 relative z-10">
          <div className="flex flex-col justify-center">
            <span className="eyebrow">Pharmaceutical QA/QC Training Platform</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              GMP &amp; Regulatory compliance training designed by <span className="gradient-text font-extrabold">Harish C. Singh</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              NextGen Pharma Solutions — a dynamic learning ecosystem to empower pharma talent, drive career growth,
              and help QA/QC professionals flourish in the global compliance landscape.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="btn btn-light hover:shadow-lg transition-all" to="/courses">Browse Courses</Link>
              <Link className="btn btn-teal hover:shadow-lg transition-all" to="/signup">Get Started Free</Link>
            </div>
          </div>
          <div className="lab-panel" aria-label="Harish C. Singh profile and training focus">
            <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80" alt="Pharmaceutical laboratory" className="h-72 w-full object-cover sm:h-96" />
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">Founded by Harish C. Singh</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Quality and Compliance Expert, M.Tech BITS</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Practical GMP, validation, OOS, smoke study, and CSA content built from real industry workflows.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="stats-band">
        {[
          [BookOpen, '4+', 'Specialized Courses'],
          [Users, '250+', 'Active Learners'],
          [ShieldCheck, '20+', 'Years Industry Experience'],
          [ClipboardCheck, '100%', 'Audit-ready Curriculum']
        ].map(([Icon, v, l]) => (
          <div key={l} className="stat-card">
            <Icon className="stat-icon" size={24} />
            <strong>{v}</strong>
            <span>{l}</span>
          </div>
        ))}
      </section>
      <section className="section">
        <SectionTitle eyebrow="Featured Courses" title="Build confidence before the next inspection" copy="Each course is organized into modules, lessons, notes, attachments, and progress checkpoints." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">{featured.map((c) => <CourseCard key={c.id} course={c} />)}</div>
      </section>
      <section className="section bg-white">
        <SectionTitle eyebrow="Why This Platform" title="Purpose-built for pharmaceutical learners" />
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            [ShieldCheck, 'Regulatory-aligned', 'USFDA, EU GMP, MHRA, USP, Annex 15, and GAMP 5 compliance references.'],
            [ClipboardCheck, 'Actionable SOP Thinking', 'Content maps directly to investigation protocols, validation tasks, and audits.'],
            [BarChart3, 'Progress-led UX', 'Personalized dashboards, completion states, and resume-learning paths.'],
            [Users, 'Community-first', 'Connecting active experts in QA/QC, Regulatory Affairs, and Manufacturing.']
          ].map(([Icon, title, copy]) => (
            <div className="value-card group" key={title}>
              <div className="value-card-icon-wrapper">
                <Icon className="text-teal transition-transform group-hover:scale-110" size={26} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="founder-photo-wrap">
            <div className="founder-photo-glow-border">
              <img src="/harish-profile.png" alt="Harish C. Singh — Founder, NextGen Pharma Solutions" className="founder-photo" />
            </div>
          </div>
          <div className="founder-bio-card">
            <span className="eyebrow-dark">About the Founder</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy">Harish C. Singh</h2>
            <p className="mt-1 text-base font-semibold text-teal flex items-center gap-2">
              Quality &amp; Compliance Expert &bull; M.Tech BITS Pilani
            </p>
            <p className="mt-4 leading-8 text-slate-600">NextGen Pharma Solutions was founded with a single mission — to help pharmaceutical professionals flourish, upskill, showcase expertise, expand networks, and achieve their dream roles in the global pharmaceutical landscape.</p>
            <p className="mt-3 leading-8 text-slate-600">Harish brings Quality Control and Compliance leadership experience into focused, practical lessons built from real industry workflows across QA/QC, Regulatory Affairs, Manufacturing, and Analytical Method Validation.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {['M.Tech BITS', 'QA/QC Mentoring', 'Regulatory Compliance', 'GMP Inspector Prep'].map((p) => <span key={p} className="pill">{p}</span>)}
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <SectionTitle eyebrow="Testimonials" title="Designed for serious learners" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            'Clear module structure made OOS concepts easier to apply in daily lab work.',
            'The validation examples feel grounded in real inspection expectations.',
            'A clean way for our team to revisit GMP topics before audits.'
          ].map((quote, i) => (
            <blockquote className="quote-card" key={quote}>
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
              </div>
              <p className="italic text-slate-600">"{quote}"</p>
              <footer>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-8 w-8 rounded-full bg-teal/10 text-teal font-bold flex items-center justify-center text-xs">
                    L{i + 1}
                  </div>
                  <div>
                    <strong className="text-navy block text-sm font-bold">QA/QC Professional</strong>
                    <span className="text-slate-400 text-xs">Verified Learner</span>
                  </div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}

// ─── Catalog ──────────────────────────────────────────────────────────────────
function CatalogPage() {
  const [query, setQuery] = useState(''); const [level, setLevel] = useState('All levels'); const [price, setPrice] = useState('Free and paid');
  const filtered = useMemo(() => publishedCourses.filter((c) => {
    const q = c.title.toLowerCase().includes(query.toLowerCase());
    const l = level === 'All levels' || c.level === level;
    const p = price === 'Free and paid' || (price === 'Free' && c.priceInr === 0) || (price === 'Paid' && c.priceInr > 0);
    return q && l && p;
  }), [level, price, query]);
  return (
    <section className="section">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionTitle eyebrow="Course Catalog" title="Choose a focused training path" copy="Filter-ready catalog of pharmaceutical training courses." />
        <div className="filter-bar">
          <label className="search-box"><Search size={18} /><input placeholder="Search courses" aria-label="Search courses" value={query} onChange={e => setQuery(e.target.value)} /></label>
          <select aria-label="Filter by level" value={level} onChange={e => setLevel(e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
          <select aria-label="Filter by price" value={price} onChange={e => setPrice(e.target.value)}><option>Free and paid</option><option>Free</option><option>Paid</option></select>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{filtered.map((c) => <CourseCard key={c.id} course={c} />)}</div>
      {filtered.length === 0 && <div className="empty-state mt-8">No courses match the current filters.</div>}
    </section>
  );
}

// ─── Course detail ────────────────────────────────────────────────────────────
function CourseDetailPage({ user, isAdmin }) {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    // Try to get from backend API first
    getCourseBySlug(slug)
      .then(data => {
        if (data && data.id) setCourse(data);
        else {
          // Fallback to static data
          const staticCourse = getCourseBySlugStatic(slug);
          if (staticCourse) setCourse(staticCourse);
          else setCourse(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load course from API:', err);
        // Fallback to static data on error
        const staticCourse = getCourseBySlugStatic(slug);
        if (staticCourse) setCourse(staticCourse);
        else setCourse(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <PremiumLoader message="Loading course curriculum & details..." type="detail" />;
  }

  if (!course) return <NotFound />;
  const isEnrolled = false;
  function handleEnroll() {
    if (!user) { navigate('/signup'); return; }
    if (course.priceInr === 0 || isEnrolled) navigate(`/dashboard/learn/${course.id}/${getFirstLesson(course)}`);
    else navigate(`/courses/${course.slug}/insights`);
  }
  return (
    <section className="section">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/courses"><ArrowLeft size={16} /> Back to catalog</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <span className="badge">{course.level}</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-navy">{course.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{course.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="pill">Instructor: {course.instructor}</span>
            <span className="pill">{getModuleCount(course)} modules</span>
            <span className="pill">{getLessonCount(course)} lessons</span>
          </div>
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-navy">Course Curriculum</h2>
            <div className="mt-5 divide-y divide-slate-200 rounded border border-slate-200 bg-white">
              {course.modules.map((mod, mi) => (
                <details key={mod.title} open={mi === 0} className="curriculum-item">
                  <summary><span>{mod.title}</span><span>{mod.lessons.length} lessons</span></summary>
                  <div className="space-y-2 p-4">
                    {mod.lessons.map((lesson) => (
                      <div className="lesson-row" key={lesson.title}>
                        <span className="flex items-center gap-2">{lesson.isPreview || isEnrolled ? <Play size={16} /> : <Lock size={16} />}{lesson.title}</span>
                        <span>{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">What You'll Learn</h2>
              <ul className="mt-4 space-y-3">{course.whatYouWillLearn.map((item) => (<li className="flex gap-3 text-slate-700" key={item}><CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={18} /><span>{item}</span></li>))}</ul>
            </div>
            <div><h2 className="font-display text-2xl font-bold text-navy">About this Course</h2><p className="mt-4 leading-8 text-slate-600">{course.description}</p></div>
          </div>
        </div>
        <aside className="sticky top-24 h-fit rounded border border-slate-200 bg-white p-5 shadow-soft">
          <img src={course.thumbnail} alt="" className="h-44 w-full rounded object-cover" />
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Course price</span>
            <strong className="text-2xl text-navy">{formatPrice(course.priceInr)}</strong>
          </div>
          <button className="btn btn-primary mt-5 w-full justify-center" onClick={handleEnroll}>
            {isEnrolled ? 'Continue Learning' : course.priceInr === 0 ? 'Enroll Free' : user ? 'Enroll Now' : 'Sign Up to Enroll'}
          </button>
          {!user && <p className="mt-3 text-xs text-slate-400 text-center">Create a free account to get started.</p>}
        </aside>
      </div>
    </section>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardLayout({ user, children }) {
  return (
    <section className="dashboard-shell">
      <aside className="dashboard-nav">
        <div className="dashboard-profile-card">
          <div className="avatar-circle">
            <UserRound size={20} className="text-teal" />
          </div>
          <div className="profile-info">
            <span className="profile-role">Learner Space</span>
            <h2 className="profile-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner'}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>
        <nav className="dashboard-menu">
          <NavLink to="/dashboard" end className="menu-item"><LayoutDashboard size={18} /> Overview</NavLink>
          <NavLink to="/dashboard/my-courses" className="menu-item"><BookOpen size={18} /> My Courses</NavLink>
          <NavLink to="/dashboard/profile" className="menu-item"><UserRound size={18} /> Profile</NavLink>
          <NavLink to="/refer" className="menu-item"><Gift size={18} /> Refer &amp; Earn</NavLink>
        </nav>
      </aside>
      <main className="dashboard-main-content">{children}</main>
    </section>
  );
}

function DashboardPage({ user }) {
  const enrolled = staticCourses.filter((c) => c.priceInr === 0);
  return (
    <DashboardLayout user={user}>
      <SectionTitle eyebrow="Dashboard" title="Welcome back to your learning workspace" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[['Free courses', enrolled.length],['Lessons completed', 0],['Current plan','Free']].map(([label,value]) => (
          <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      <div className="mt-10">
        <SectionTitle eyebrow="Available Courses" title="Start learning today" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {enrolled.map((c) => (
            <article className="learning-card" key={c.id}>
              <img src={c.thumbnail} alt="" className="h-36 w-full object-cover sm:h-full sm:w-44" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-bold text-navy">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{c.shortDesc}</p>
                <Link className="btn btn-outline mt-5 w-fit" to={`/dashboard/learn/${c.id}/${getFirstLesson(c)}`}>Start <ChevronRight size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfilePage({ user }) {
  return (
    <DashboardLayout user={user}>
      <SectionTitle eyebrow="Profile" title="Account and billing" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="panel-title">Profile details</h3>
          <label>Full name<input defaultValue={user?.user_metadata?.full_name || ''} /></label>
          <label>Email<input defaultValue={user?.email || ''} disabled className="bg-slate-50 text-slate-400" /></label>
          <button className="btn btn-primary w-fit">Save Profile</button>
        </div>
        <div className="panel">
          <h3 className="panel-title">Billing history</h3>
          <div className="empty-state">Payment history will appear here after a paid enrollment.</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Course Player ────────────────────────────────────────────────────────────
function CoursePlayerPage({ user }) {
  const { courseId, lessonId } = useParams(); const navigate = useNavigate();
  const course = staticCourses.find((c) => c.id === courseId) ?? staticCourses[0];
  const allLessons = course.modules.flatMap((mod, mi) =>
    mod.lessons.map((lesson, li) => ({ ...lesson, id: makeLessonId(mod.title, li), moduleTitle: mod.title, moduleIndex: mi, lessonIndex: li }))
  );
  const currentLesson = getLessonById(course, lessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const [completed, setCompleted] = useState(() => { try { return JSON.parse(localStorage.getItem(`completed_${courseId}`) || '[]'); } catch { return []; } });
  function markComplete() {
    const updated = completed.includes(currentLesson.id) ? completed : [...completed, currentLesson.id];
    setCompleted(updated); localStorage.setItem(`completed_${courseId}`, JSON.stringify(updated));
    if (nextLesson) navigate(`/dashboard/learn/${course.id}/${nextLesson.id}`);
  }
  const isCompleted = (id) => completed.includes(id);
  const hasVideo = currentLesson.videoUrl && currentLesson.videoUrl !== '/videos/upload-your-video.mp4';
  return (
    <section className="player-shell">
      <aside className="lesson-sidebar">
        <Link className="sidebar-back-link" to="/dashboard">
          <ArrowLeft size={16} /> <span>Back to Dashboard</span>
        </Link>
        <div className="sidebar-course-header">
          <span className="course-header-tag">Course Workspace</span>
          <h1 className="course-header-title">{course.title}</h1>
        </div>
        <div className="sidebar-progress-card">
          <div className="progress-labels">
            <span>Course Progress</span>
            <strong>{Math.round((completed.length / allLessons.length) * 100)}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed.length / allLessons.length) * 100}%` }} />
          </div>
          <p className="progress-stats">{completed.length} of {allLessons.length} lessons completed</p>
        </div>
        <div className="sidebar-modules-list">
          {course.modules.map((mod, modIdx) => (
            <div key={mod.title} className="sidebar-module-section">
              <h2 className="sidebar-module-title">
                <span className="module-num">M{modIdx + 1}</span> {mod.title}
              </h2>
              <div className="sidebar-lessons-list">
                {mod.lessons.map((lesson, li) => { 
                  const id = makeLessonId(mod.title, li); 
                  const done = isCompleted(id); 
                  return (
                    <Link 
                      className={currentLesson.id === id ? 'outline-lesson active' : 'outline-lesson'} 
                      key={lesson.title} 
                      to={`/dashboard/learn/${course.id}/${id}`}
                    >
                      <span className="lesson-title-text">{lesson.title}</span>
                      {done ? <CheckCircle2 size={15} className="text-teal shrink-0" /> : <Play size={14} className="lesson-play-icon shrink-0" />}
                    </Link>
                  ); 
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className="player-main">
        {hasVideo ? (
          <VideoPlayer src={currentLesson.videoUrl} courseId={courseId} videoId={currentLesson.id} title={currentLesson.title} user={user} />
        ) : (
          <div className="content-only-banner"><BookOpen size={32} className="text-teal" aria-hidden="true" /><p>Reading lesson — no video for this topic</p></div>
        )}
        <div className="mt-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div><span className="badge">{currentLesson.moduleTitle}</span><h2 className="mt-3 font-display text-3xl font-bold text-navy">{currentLesson.title}</h2></div>
          {currentLesson.attachmentUrl && <a className="btn btn-outline" href={currentLesson.attachmentUrl} target="_blank" rel="noreferrer"><Download size={16} /> Download notes</a>}
        </div>
        <article className="lesson-notes">{currentLesson.notes.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}</article>
        <div className="mt-8 flex items-center justify-between gap-3">
          <button className="btn btn-outline" disabled={!prevLesson} onClick={() => prevLesson && navigate(`/dashboard/learn/${course.id}/${prevLesson.id}`)}><ArrowLeft size={16} /> Previous</button>
          <span className="text-sm text-slate-400">{currentIndex + 1} / {allLessons.length}</span>
          {nextLesson ? (
            <button className="btn btn-primary" onClick={markComplete}><CheckCircle2 size={16} />{isCompleted(currentLesson.id) ? 'Next Lesson' : 'Mark Complete & Next'}</button>
          ) : (
            <button className="btn btn-teal" onClick={markComplete}><CheckCircle2 size={16} />{isCompleted(currentLesson.id) ? '✓ Course Complete' : 'Mark Complete'}</button>
          )}
        </div>
        {!nextLesson && isCompleted(currentLesson.id) && (
          <div className="mt-6 rounded border border-teal/30 bg-teal/5 p-5 text-center">
            <CheckCircle2 size={36} className="mx-auto text-teal" />
            <h3 className="mt-3 font-display text-xl font-bold text-navy">Course Complete!</h3>
            <p className="mt-2 text-slate-600">You've finished all lessons in this course.</p>
            <Link className="btn btn-primary mt-4 inline-flex" to="/dashboard">Back to Dashboard</Link>
          </div>
        )}
      </main>
    </section>
  );
}

// ─── Plans ────────────────────────────────────────────────────────────────────
function PlansPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCourses(true)
      .then(data => setCourses(data))
      .catch(err => {
        console.error('Failed to load courses:', err);
        setCourses(staticCourses);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PremiumLoader message="Retrieving course pricing & details..." type="plans" />;
  }

  return (
    <section className="section">
      <SectionTitle eyebrow="Course Pricing" title="Choose your course to enroll" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <article className="pricing-card" key={course.id}>
            {(course.thumbnailUrl || course.thumbnail) && (
              <img src={course.thumbnailUrl || course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
            )}
            <div className="p-6">
              <span className="px-2 py-1 bg-teal/10 text-teal text-xs font-semibold rounded-full">
                {course.level}
              </span>
              <h2 className="mt-3 text-lg font-bold text-navy">{course.title}</h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{course.shortDesc}</p>
              <div className="mt-4 flex items-center justify-between">
                <strong className="text-2xl text-navy">
                  {course.priceInr === 0 ? 'Free' : `₹${course.priceInr}`}
                </strong>
                <span className="text-sm text-slate-500">
                  {course.modules.length} modules
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-teal" />
                  Full course access
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-teal" />
                  Downloadable materials
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-teal" />
                  Certificate of completion
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-teal" />
                  Lifetime access
                </li>
              </ul>
              <button
                onClick={() => navigate(`/checkout/${course.id}`)}
                className="btn btn-primary mt-6 w-full justify-center"
              >
                {course.priceInr === 0 ? 'Enroll Free' : 'Buy Now'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────
function AdminLayout({ isAdmin, children }) {
  if (!isAdmin) return <AdminAccessDenied />;
  return (
    <section className="dashboard-shell">
      <aside className="dashboard-nav">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Owner Panel</p>
        <h2 className="mt-2 font-display text-xl font-bold text-navy">Admin Panel</h2>
        <nav className="mt-8 space-y-2">
          <NavLink to="/admin" end><BarChart3 size={18} /> Analytics</NavLink>
          <NavLink to="/admin/courses"><BookOpen size={18} /> Courses</NavLink>
          <NavLink to="/admin/users"><Users size={18} /> Users</NavLink>
          <NavLink to="/admin/messages"><MessageSquare size={18} /> Messages</NavLink>
          <NavLink to="/admin/live"><Radio size={18} /> Live Sessions</NavLink>
          <NavLink to="/admin/announcement"><Megaphone size={18} /> Announcement</NavLink>
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </section>
  );
}

function AdminAccessDenied() {
  return (
    <section className="section">
      <div className="mx-auto max-w-3xl rounded border border-slate-200 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded bg-[#ccfbf1] text-teal"><ShieldCheck size={30} aria-hidden="true" /></span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">This area is for admins only</h1>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" to="/courses">Explore Courses</Link>
          <Link className="btn btn-outline" to="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    </section>
  );
}

function AdminPage({ isAdmin }) {
  const [stats, setStats] = useState({ signups: 0, enrollments: 0, subscribers: 0, messages: 0 });
  useEffect(() => {
    if (!hasSupabaseConfig || !isAdmin) return;
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('read', false),
    ]).then(([{ count: signups }, { count: enrollments }, { count: subscribers }, { count: messages }]) => {
      setStats({ signups: signups ?? 0, enrollments: enrollments ?? 0, subscribers: subscribers ?? 0, messages: messages ?? 0 });
    });
  }, [isAdmin]);
  return (
    <AdminLayout isAdmin={isAdmin}>
      <SectionTitle eyebrow="Owner Control Center" title="Manage courses, videos, users, and access" copy="This panel is visible only to admin accounts." />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[[BookOpen,'Course CMS','Create, edit, publish, unpublish, or remove courses.','/admin/courses'],[UploadCloud,'Video Library','Upload lesson videos and connect them to each subtopic.','/admin/courses'],[Users,'Learner Access','Grant, revoke, or review enrollment access for users.','/admin/users'],[Radio,'Live Sessions','Schedule and start live classes for learners.','/admin/live']].map(([Icon,title,copy,href]) => (
          <Link className="admin-action-card" to={href} key={title}><Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {[['MRR','₹0'],['Active subscribers',stats.subscribers],['Enrollments',stats.enrollments],['New signups',stats.signups]].map(([label,value]) => (
          <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      {stats.messages > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3">
          <MessageSquare size={18} className="text-amber-600" />
          <span className="font-semibold text-amber-700">{stats.messages} unread contact message{stats.messages !== 1 ? 's' : ''}</span>
          <Link className="btn btn-ghost ml-auto text-sm text-amber-700" to="/admin/messages">View Messages →</Link>
        </div>
      )}
    </AdminLayout>
  );
}

function AdminCoursesPage({ isAdmin }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Try to get from backend API first
    getCourses(false) // Get all courses including drafts
      .then(data => {
        if (data && Array.isArray(data)) {
          setCourses(data);
        } else {
          // Fallback to static data
          setCourses(staticCourses);
        }
      })
      .catch(err => {
        console.error('Failed to load courses:', err);
        // Fallback to static data on error
        setCourses(staticCourses);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout isAdmin={isAdmin}>
        <PremiumLoader message="Accessing course manager database..." type="admin-courses" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout isAdmin={isAdmin}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionTitle eyebrow="Courses" title="Manage course content" />
        <Link className="btn btn-primary" to="/admin/courses/new"><Plus size={16} /> New Course</Link>
      </div>
      <div className="table-wrap mt-8">
        <table>
          <thead><tr><th>Course</th><th>Level</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-slate-500 py-8">
                  No courses found. Create your first course to get started.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.title}</strong><span>{c.shortDesc}</span></td>
                  <td>{c.level}</td><td>{formatPrice(c.priceInr)}</td>
                  <td><span className="badge">{(c.isPublished ?? c.published) ? 'Published' : 'Draft'}</span></td>
                  <td><Link className="btn btn-ghost" to={`/admin/courses/${c.id}/edit`}>Edit</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function AdminCourseFormPage({ isAdmin }) {
  const { id: editId } = useParams(); const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('INTERMEDIATE');
  const [priceInr, setPriceInr] = useState(999);
  const [thumbnail, setThumbnail] = useState('');
  const [published, setPublished] = useState(false);
  const [modules, setModules] = useState([{ title: '', lessons: [{ title: '', duration: '10 min', videoUrl: '', attachmentUrl: '', isPreview: false, notes: '' }] }]);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // Track which file is uploading
  
  // Load course data if editing
  useEffect(() => {
    if (editId) {
      setLoading(true);
      getCourseById(editId)
        .then(course => {
          setTitle(course.title);
          setSlug(course.slug);
          setShortDesc(course.shortDesc);
          setDescription(course.description);
          setLevel(course.level);
          setPriceInr(course.priceInr);
          setThumbnail(course.thumbnailUrl || '');
          setPublished(course.isPublished);
          setModules(course.modules.map(m => ({
            title: m.title,
            lessons: m.lessons.map(l => ({
              title: l.title,
              duration: l.videoDuration ? `${Math.floor(l.videoDuration / 60)} min` : '10 min',
              videoUrl: l.videoUrl || '',
              attachmentUrl: l.attachmentUrl || '',
              isPreview: l.isPreview,
              notes: l.contentText || '',
            }))
          })));
        })
        .catch(err => {
          console.error('Failed to load course from API:', err);
          // Try to fallback to static courses
          const staticCourse = staticCourses.find(c => c.id === editId || c.slug === editId);
          if (staticCourse) {
            setTitle(staticCourse.title);
            setSlug(staticCourse.slug);
            setShortDesc(staticCourse.shortDesc);
            setDescription(staticCourse.description);
            setLevel(staticCourse.level.toUpperCase());
            setPriceInr(staticCourse.priceInr);
            setThumbnail(staticCourse.thumbnail || '');
            setPublished(staticCourse.published);
            setModules(staticCourse.modules.map(m => ({
              title: m.title,
              lessons: m.lessons.map(l => ({
                title: l.title,
                duration: l.duration || '10 min',
                videoUrl: l.videoUrl || '',
                attachmentUrl: l.attachmentUrl || '',
                isPreview: l.isPreview,
                notes: l.notes || '',
              }))
            })));
          } else {
            showToast('❌ Failed to load course');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [editId]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3500); }
  function addModule() { setModules([...modules, { title: '', lessons: [{ title: '', duration: '10 min', videoUrl: '', attachmentUrl: '', isPreview: false, notes: '' }] }]); }
  function removeModule(mi) { setModules(modules.filter((_, i) => i !== mi)); }
  function updateModule(mi, field, value) { setModules(modules.map((m, i) => i === mi ? { ...m, [field]: value } : m)); }
  function addLesson(mi) { setModules(modules.map((m, i) => i === mi ? { ...m, lessons: [...m.lessons, { title: '', duration: '10 min', videoUrl: '', attachmentUrl: '', isPreview: false, notes: '' }] } : m)); }
  function removeLesson(mi, li) { setModules(modules.map((m, i) => i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m)); }
  function updateLesson(mi, li, field, value) { setModules(modules.map((m, i) => i === mi ? { ...m, lessons: m.lessons.map((l, j) => j === li ? { ...l, [field]: value } : l) } : m)); }
  
  async function handleThumbnailUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading('thumbnail');
    try {
      const result = await uploadThumbnail(file);
      setThumbnail(result.url);
      showToast('✅ Thumbnail uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('❌ Failed to upload thumbnail');
    } finally {
      setUploading(null);
    }
  }

  async function handleVideoUpload(mi, li, e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(`video-${mi}-${li}`);
    try {
      const result = await uploadVideo(file, modules[mi].lessons[li].title);
      updateLesson(mi, li, 'videoUrl', result.playbackUrl);
      updateLesson(mi, li, 'videoStreamId', result.videoId);
      showToast('✅ Video uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('❌ Failed to upload video');
    } finally {
      setUploading(null);
    }
  }

  async function handleMaterialUpload(mi, li, e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(`material-${mi}-${li}`);
    try {
      const result = await uploadMaterial(file);
      updateLesson(mi, li, 'attachmentUrl', result.url);
      showToast('✅ Material uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('❌ Failed to upload material');
    } finally {
      setUploading(null);
    }
  }
  
  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    
    const courseData = {
      slug,
      title,
      shortDesc,
      description,
      level,
      priceInr: Number(priceInr),
      thumbnailUrl: thumbnail,
      isPublished: published,
      whatYouWillLearn: [],
      modules: modules.map((mod, modIndex) => ({
        title: mod.title,
        sortOrder: modIndex,
        lessons: mod.lessons.map((lesson, lessonIndex) => ({
          title: lesson.title,
          contentText: lesson.notes,
          videoUrl: lesson.videoUrl,
          videoDuration: parseDuration(lesson.duration),
          attachmentUrl: lesson.attachmentUrl,
          isPreview: lesson.isPreview,
          sortOrder: lessonIndex,
        }))
      }))
    };

    try {
      if (editId) {
        await updateCourse(editId, courseData);
        showToast('✅ Course updated successfully!');
      } else {
        await createCourse(courseData);
        showToast('✅ Course created successfully!');
      }
      setTimeout(() => navigate('/admin/courses'), 1000);
    } catch (error) {
      console.error('Save error:', error);
      showToast(`❌ Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  function parseDuration(duration) {
    if (!duration) return 600;
    const match = duration.match(/(\d+)\s*(min|minute|minutes|hr|hour|hours)/i);
    if (!match) return 600;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('hr') || unit.startsWith('hour')) {
      return value * 60;
    }
    return value;
  }

  if (loading) {
    return (
      <AdminLayout isAdmin={isAdmin}>
        <PremiumLoader message="Fetching course editor data..." type="admin-form" />
      </AdminLayout>
    );
  }
  return (
    <AdminLayout isAdmin={isAdmin}>
      <div className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow={editId ? 'Edit Course' : 'New Course'} title={editId ? 'Edit Course' : 'Create a new course'} />
        <button className="btn btn-ghost" onClick={() => navigate('/admin/courses')}><ArrowLeft size={16} /> Back</button>
      </div>
      {toast && <div className="mt-4 rounded bg-teal/10 px-4 py-3 font-semibold text-teal">{toast}</div>}
      <form onSubmit={handleSave} className="mt-8 space-y-8">
        <div className="panel">
          <h3 className="panel-title">Course details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" required /></label>
            <label>Slug (URL)<input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g,'-'))} placeholder="course-url-slug" required /></label>
          </div>
          <label className="mt-4 block">Short description<textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows="2" placeholder="One line summary" /></label>
          <label className="mt-4 block">Full description<textarea value={description} onChange={e => setDescription(e.target.value)} rows="4" placeholder="Full course description" /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label>Level<select value={level} onChange={e => setLevel(e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label>Price (₹ INR — 0 for free)<input type="number" min="0" value={priceInr} onChange={e => setPriceInr(e.target.value)} /></label>
            <label>Status<select value={published ? 'published' : 'draft'} onChange={e => setPublished(e.target.value === 'published')}><option value="draft">Draft (hidden)</option><option value="published">Published (live)</option></select></label>
          </div>
          <label className="mt-4 block">Thumbnail</label>
          <div className="flex gap-3">
            <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="flex-1" disabled={uploading === 'thumbnail'} />
            <input value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="Or paste URL" className="flex-1" />
          </div>
          {uploading === 'thumbnail' && <p className="mt-2 text-sm text-slate-500">Uploading...</p>}
          {thumbnail && <img src={thumbnail} alt="" className="mt-3 h-36 w-full rounded object-cover" onError={e => e.target.style.display='none'} />}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-navy">Modules &amp; Lessons</h3>
            <button type="button" className="btn btn-outline" onClick={addModule}><Plus size={15} /> Add Module</button>
          </div>
          <div className="mt-5 space-y-6">
            {modules.map((mod, mi) => (
              <div key={mi} className="panel border-l-4 border-l-teal">
                <div className="flex items-start justify-between gap-4">
                  <label className="flex-1">Module {mi + 1} title<input value={mod.title} onChange={e => updateModule(mi, 'title', e.target.value)} placeholder="e.g. Introduction" /></label>
                  <button type="button" className="btn btn-ghost mt-6 text-red-500" onClick={() => removeModule(mi)}>Remove</button>
                </div>
                <div className="mt-4 space-y-4">
                  {mod.lessons.map((lesson, li) => (
                    <div key={li} className="rounded border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Lesson {li + 1}</span>
                        <button type="button" className="text-xs font-semibold text-red-400 hover:text-red-600" onClick={() => removeLesson(mi, li)}>Remove</button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label>Lesson title<input value={lesson.title} onChange={e => updateLesson(mi, li, 'title', e.target.value)} placeholder="Lesson title" /></label>
                        <label>Duration<input value={lesson.duration} onChange={e => updateLesson(mi, li, 'duration', e.target.value)} placeholder="10 min" /></label>
                      </div>
                      <label className="mt-3 block">Video</label>
                      <div className="flex gap-3">
                        <input type="file" accept="video/*" onChange={(e) => handleVideoUpload(mi, li, e)} className="flex-1" disabled={uploading === `video-${mi}-${li}`} />
                        <input value={lesson.videoUrl} onChange={e => updateLesson(mi, li, 'videoUrl', e.target.value)} placeholder="Or paste URL" className="flex-1" />
                      </div>
                      {uploading === `video-${mi}-${li}` && <p className="mt-2 text-sm text-slate-500">Uploading video...</p>}
                      <label className="mt-3 block">Attachment (PDF / PPT)</label>
                      <div className="flex gap-3">
                        <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={(e) => handleMaterialUpload(mi, li, e)} className="flex-1" disabled={uploading === `material-${mi}-${li}`} />
                        <input value={lesson.attachmentUrl} onChange={e => updateLesson(mi, li, 'attachmentUrl', e.target.value)} placeholder="Or paste URL" className="flex-1" />
                      </div>
                      {uploading === `material-${mi}-${li}` && <p className="mt-2 text-sm text-slate-500">Uploading material...</p>}
                      <label className="mt-3 block">Lesson notes<textarea value={lesson.notes} onChange={e => updateLesson(mi, li, 'notes', e.target.value)} rows="3" placeholder="Notes shown below the video" /></label>
                      <label className="mt-3 flex items-center gap-2 font-normal"><input type="checkbox" checked={lesson.isPreview} onChange={e => updateLesson(mi, li, 'isPreview', e.target.checked)} />Free preview (visible without enrollment)</label>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost w-full border border-dashed border-slate-300" onClick={() => addLesson(mi)}><Plus size={15} /> Add Lesson</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sticky bottom-4 flex flex-wrap gap-3 rounded border border-slate-200 bg-white p-4 shadow-soft">
          <button type="submit" className="btn btn-primary" disabled={saving}><CheckCircle2 size={16} /> {saving ? 'Saving…' : 'Save Changes'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/courses')}>Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}

function AdminUsersPage({ isAdmin }) {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!hasSupabaseConfig || !isAdmin) return;
    supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, [isAdmin]);
  return (
    <AdminLayout isAdmin={isAdmin}>
      <SectionTitle eyebrow="Users" title="Manage enrollments" />
      <div className="table-wrap mt-8">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="py-6 text-center text-slate-400">Loading users…</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan="5" className="py-6 text-center text-slate-400">No users yet.</td></tr>}
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.full_name || '—'}</strong></td><td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}`}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                <td><div className="flex flex-wrap gap-2"><button className="btn btn-ghost">Grant Access</button><button className="btn btn-outline">Revoke</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function AdminMessagesPage({ isAdmin }) {
  const [messages, setMessages] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!hasSupabaseConfig || !isAdmin) return;
    supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); });
  }, [isAdmin]);
  async function markRead(id) {
    await supabase.from('contact_submissions').update({ read: true }).eq('id', id);
    setMessages(messages.map((m) => m.id === id ? { ...m, read: true } : m));
  }
  return (
    <AdminLayout isAdmin={isAdmin}>
      <SectionTitle eyebrow="Messages" title="Contact form submissions" />
      {loading ? <p className="mt-6 text-slate-400">Loading…</p> : messages.length === 0 ? (
        <div className="empty-state mt-6">No messages yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`panel ${!m.read ? 'border-l-4 border-l-teal' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-navy">{m.first_name} {m.last_name} {!m.read && <span className="badge ml-2">New</span>}</p>
                  <p className="text-sm text-slate-500">{m.email}{m.phone ? ` · ${m.phone}` : ''} · {new Date(m.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                {!m.read && <button className="btn btn-outline text-sm" onClick={() => markRead(m.id)}>Mark as read</button>}
              </div>
              <p className="mt-3 leading-7 text-slate-600">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function AdminLivePage({ isAdmin }) {
  return (
    <AdminLayout isAdmin={isAdmin}>
      <ManageLive isAdmin={isAdmin} />
    </AdminLayout>
  );
}

function AdminAnnouncementPage({ isAdmin }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(true);
  const [badge, setBadge] = useState('Notice');
  const [text, setText] = useState('');
  const [linkText, setLinkText] = useState('Learn More');
  const [linkUrl, setLinkUrl] = useState('/courses');
  const [theme, setTheme] = useState('gradient-teal');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLoading(true);
    getAnnouncement()
      .then(data => {
        setShow(data.show);
        setBadge(data.badge);
        setText(data.text);
        setLinkText(data.linkText || 'Learn More');
        setLinkUrl(data.linkUrl || '/courses');
        setTheme(data.theme || 'gradient-teal');
      })
      .catch(err => {
        console.error('Failed to load announcement config:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAnnouncement({ show, badge, text, linkText, linkUrl, theme });
      showToast('✅ Announcement saved successfully!');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to save announcement');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout isAdmin={isAdmin}>
        <PremiumLoader message="Loading announcement config..." type="admin-announcement" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout isAdmin={isAdmin}>
      <SectionTitle eyebrow="Alerts & Broadcast" title="Manage Announcement Bar" copy="Update the top banner message instantly across the entire platform." />
      {toast && <div className="mt-4 rounded bg-teal/10 px-4 py-3 font-semibold text-teal">{toast}</div>}
      
      <form onSubmit={handleSave} className="mt-8 space-y-6 max-w-3xl">
        <div className="panel">
          <h3 className="panel-title">Announcement Settings</h3>
          
          <label className="flex flex-row items-center gap-3 font-normal cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={show} 
              onChange={e => setShow(e.target.checked)} 
              className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal animate-pulse"
            />
            <span className="font-bold text-slate-700 dark:text-slate-300">Show announcement bar to visitors</span>
          </label>
          
          {show && (
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>Badge text
                  <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="e.g. Notice, Alert, Holiday" required />
                </label>
                <label>Theme Preset
                  <select value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="gradient-teal">Emerald Teal (Gradient)</option>
                    <option value="gradient-indigo">Indigo Blue (Gradient)</option>
                    <option value="warning-amber">Warning Gold (Amber)</option>
                    <option value="danger-red">Alert Red (Danger)</option>
                  </select>
                </label>
              </div>
              
              <label>Announcement Text
                <textarea value={text} onChange={e => setText(e.target.value)} rows="3" placeholder="Message content..." required />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>Link Text
                  <input value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="e.g. Learn More, View Details" />
                </label>
                <label>Link URL (relative or absolute)
                  <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="e.g. /courses, /live, https://..." />
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <CheckCircle2 size={16} /> {saving ? 'Saving…' : 'Publish Announcement'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

// ─── Footer & NotFound ────────────────────────────────────────────────────────
function NotFound() {
  return (
    <section className="section">
      <h1 className="font-display text-4xl font-bold text-navy">Page not found</h1>
      <Link className="btn btn-primary mt-6" to="/">Go home</Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer-container">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info Column */}
          <div className="md:col-span-1">
            <strong className="footer-brand">NextGen Pharma</strong>
            <p className="footer-desc">
              Empowering pharmaceutical talent with practical compliance, QA/QC, and regulatory validation training. Built by industry experts.
            </p>
            <div className="footer-contact">
              <p className="flex items-center gap-2"><MapPin size={16} className="text-teal" /> Makarba, Ahmedabad 380051, Gujarat</p>
              <p className="flex items-center gap-2"><Mail size={16} className="text-teal" /> harideepsingh13@gmail.com</p>
            </div>
          </div>
          
          {/* Column 2: Courses & Training */}
          <div>
            <h4 className="footer-title">Learning</h4>
            <ul className="footer-links">
              <li><Link to="/courses">Courses Catalog</Link></li>
              <li><Link to="/books">Reference Books</Link></li>
              <li><Link to="/live">Live Classes</Link></li>
              <li><Link to="/refer">Refer &amp; Earn</Link></li>
            </ul>
          </div>
          
          {/* Column 3: About & Support */}
          <div>
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li>
                <a href="https://www.linkedin.com/in/harish-singh-29b39b46/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                  <Linkedin size={15} /> LinkedIn Profile
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Legal Policy */}
          <div>
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions">Terms &amp; Conditions</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NextGen Pharma Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, isAdmin, loading } = useAuth();

  const [announcement, setAnnouncement] = useState({
    show: false,
    badge: "Notice",
    text: "",
    linkText: "Learn More",
    linkUrl: "/courses",
    theme: "gradient-teal",
  });
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  useEffect(() => {
    getAnnouncement()
      .then(data => {
        setAnnouncement(data);
        const dismissedText = localStorage.getItem('announcement_dismissed_text');
        const isNewAnnouncement = dismissedText !== data.text;
        setAnnouncementOpen(data.show && (isNewAnnouncement || !dismissedText));
      })
      .catch(err => {
        console.error('Failed to load announcement config:', err);
      });
  }, []);

  const dismissAnnouncement = () => {
    setAnnouncementOpen(false);
    localStorage.setItem('announcement_dismissed_text', announcement.text);
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col">
      {announcementOpen && (
        <div className={`announcement-bar-outer ${announcement.theme}`}>
          <div className="announcement-bar-inner">
            <span className="announcement-badge">{announcement.badge}</span>
            <span className="announcement-text">{announcement.text}</span>
            {announcement.linkUrl && (
              <Link to={announcement.linkUrl} className="announcement-link">
                {announcement.linkText} &rarr;
              </Link>
            )}
          </div>
          <button onClick={dismissAnnouncement} className="announcement-close" aria-label="Dismiss announcement">
            <X size={14} />
          </button>
        </div>
      )}
      <Header user={user} isAdmin={isAdmin} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<CatalogPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage user={user} isAdmin={isAdmin} />} />
          <Route path="/courses/:slug/insights" element={<CourseInsights />} />
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
          <Route path="/books" element={<Books />} />
          <Route path="/live" element={<LiveClasses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/refer" element={<ReferFriends user={user} />} />
          <Route path="/ref/:code" element={<ReferralRedirect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/about" element={<AboutUs />} />

          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/dashboard" element={<RequireAuth user={user} loading={loading}><DashboardPage user={user} /></RequireAuth>} />
          <Route path="/dashboard/my-courses" element={<RequireAuth user={user} loading={loading}><DashboardPage user={user} /></RequireAuth>} />
          <Route path="/dashboard/profile" element={<RequireAuth user={user} loading={loading}><ProfilePage user={user} /></RequireAuth>} />
          <Route path="/dashboard/learn/:courseId/:lessonId" element={<RequireAuth user={user} loading={loading}><CoursePlayerPage user={user} /></RequireAuth>} />

          <Route path="/admin" element={<AdminPage isAdmin={isAdmin} />} />
          <Route path="/admin/courses" element={<AdminCoursesPage isAdmin={isAdmin} />} />
          <Route path="/admin/courses/new" element={<AdminCourseFormPage isAdmin={isAdmin} />} />
          <Route path="/admin/courses/:id/edit" element={<AdminCourseFormPage isAdmin={isAdmin} />} />
          <Route path="/admin/users" element={<AdminUsersPage isAdmin={isAdmin} />} />
          <Route path="/admin/messages" element={<AdminMessagesPage isAdmin={isAdmin} />} />
          <Route path="/admin/live" element={<AdminLivePage isAdmin={isAdmin} />} />
          <Route path="/admin/announcement" element={<AdminAnnouncementPage isAdmin={isAdmin} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Referral redirect handler — stores code then sends to signup
function ReferralRedirect() {
  const { code } = useParams(); const navigate = useNavigate();
  useEffect(() => {
    if (code) localStorage.setItem('pending_referral', code.toUpperCase());
    navigate('/signup', { replace: true });
  }, [code, navigate]);
  return null;
}
