import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Play,
  Plus,
  Search,
  ShieldCheck,
  UploadCloud,
  UserRound,
  Users,
} from 'lucide-react';
import {
  courses,
  getCourseBySlug,
  getLessonById,
  getLessonCount,
  getModuleCount,
  makeLessonId,
} from './data/courses.js';
import { supabase, hasSupabaseConfig } from './lib/supabase.js';

// ─── Auth context ────────────────────────────────────────────────────────────
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

const publishedCourses = courses.filter((c) => c.published);

function formatPrice(p) { return p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}`; }
function getFirstLesson(course) { return makeLessonId(course.modules[0].title, 0); }

// ─── Require auth wrapper ─────────────────────────────────────────────────────
function RequireAuth({ user, loading, children }) {
  if (loading) return <div className="section"><p className="text-slate-500">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ user, isAdmin }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="brand-logo" aria-label="NextGen Pharma Solutions home">
          <img src="/logo-harish-pharma-academy.svg" alt="NextGen Pharma Solutions" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <NavLink className="hover:text-teal" to="/courses">Courses</NavLink>
          <NavLink className="hover:text-teal" to="/plans">Plans</NavLink>
          {user && <NavLink className="hover:text-teal" to="/dashboard">Dashboard</NavLink>}
          {isAdmin && <NavLink className="hover:text-teal" to="/admin">Admin</NavLink>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm font-semibold text-slate-600 sm:inline">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button className="btn btn-ghost hidden sm:inline-flex" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost hidden sm:inline-flex" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/signup">Sign Up</Link>
            </>
          )}
          <button className="icon-btn md:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────
function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <section className="section">
        <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-8 text-center shadow-soft">
          <CheckCircle2 size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Check your inbox!</h1>
          <p className="mt-3 leading-7 text-slate-600">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account,
            then come back and log in.
          </p>
          <Link className="btn btn-primary mt-6 inline-flex" to="/login">Go to Login</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft">
        <span className="eyebrow-dark">Join NextGen Pharma</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">Create your account</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label>
            Full name
            <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>
            Password <span className="font-normal text-slate-400">(min 6 characters)</span>
            <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn btn-primary w-full justify-center" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-teal" to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
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
          <label>
            Email
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn btn-primary w-full justify-center" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <Link className="font-semibold text-teal" to="/forgot-password">Forgot password?</Link>
          <span className="text-slate-500">
            New here?{' '}
            <Link className="font-semibold text-teal" to="/signup">Create account</Link>
          </span>
        </div>
      </div>
    </section>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <section className="section">
        <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Mail size={48} className="mx-auto text-teal" />
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Reset link sent</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Check your inbox at <strong>{email}</strong> for the password reset link.
          </p>
          <Link className="btn btn-outline mt-6 inline-flex" to="/login">Back to Login</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft">
        <span className="eyebrow-dark">Password reset</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">Reset your password</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn btn-primary w-full justify-center" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/login">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </section>
  );
}

// ─── Course card & shared UI ──────────────────────────────────────────────────
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

function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl">
      <span className="eyebrow-dark">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-lg leading-8 text-slate-600">{copy}</p>}
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const featured = publishedCourses.slice(0, 3);
  return (
    <>
      <section className="hero-section">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="eyebrow">Pharmaceutical QA/QC Certification Platform</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Inspection-ready GMP training by Harish C. Singh.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              NextGen Pharma Solutions — a dynamic ecosystem to empower pharma talent, drive career growth,
              and help professionals flourish in the global pharmaceutical landscape.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-light" to="/courses">Browse Courses</Link>
              <Link className="btn btn-teal" to="/signup">Get Started Free</Link>
            </div>
          </div>
          <div className="lab-panel" aria-label="Harish C. Singh profile and training focus">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
              alt="Pharmaceutical laboratory"
              className="h-72 w-full object-cover sm:h-96"
            />
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">Founded by Harish C. Singh</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Deputy Manager QCC, M.Tech BITS</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Practical GMP, validation, OOS, smoke study, and CSA content built from real industry workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band">
        {[['4','Courses published'],['250+','Target learners'],['20+','Years industry experience'],['100%','Structured curriculum']].map(([v,l]) => (
          <div key={l}><strong>{v}</strong><span>{l}</span></div>
        ))}
      </section>

      <section className="section">
        <SectionTitle eyebrow="Featured Courses" title="Build confidence before the next inspection"
          copy="Each course is organized into modules, lessons, notes, attachments, and progress checkpoints." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      <section className="section bg-white">
        <SectionTitle eyebrow="Why This Platform" title="Purpose-built for pharmaceutical learners" />
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            [ShieldCheck,'Regulatory-aligned','USFDA, EU GMP, MHRA, USP, Annex 15, and GAMP 5 references.'],
            [ClipboardCheck,'Actionable SOP thinking','Content maps directly to investigation, validation, and audit tasks.'],
            [BarChart3,'Progress-led UX','Dashboards, completion states, and continue paths keep learners moving.'],
            [Users,'Community-first','Connecting experts in QA/QC, Regulatory Affairs, Manufacturing, and more.'],
          ].map(([Icon,title,copy]) => (
            <div className="value-card" key={title}>
              <Icon className="text-teal" size={26} aria-hidden="true" />
              <h3>{title}</h3><p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="founder-photo-wrap">
            <img src="/harish-profile.png" alt="Harish C. Singh — Founder, NextGen Pharma Solutions" className="founder-photo" />
          </div>
          <div>
            <span className="eyebrow-dark">About the Founder</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy">Harish C. Singh</h2>
            <p className="mt-1 text-base font-semibold text-teal">Deputy Manager QCC · M.Tech BITS</p>
            <p className="mt-4 leading-8 text-slate-600">
              NextGen Pharma Solutions was founded with a single mission — to help pharmaceutical professionals
              flourish, upskill, showcase expertise, expand networks, and achieve their dream roles in the
              global pharmaceutical landscape.
            </p>
            <p className="mt-3 leading-8 text-slate-600">
              Harish brings Quality Control and Compliance leadership experience into focused, practical lessons
              built from real industry workflows across QA/QC, Regulatory Affairs, Manufacturing, and
              Analytical Method Validation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="pill">Deputy Manager QCC</span>
              <span className="pill">M.Tech BITS</span>
              <span className="pill">QA/QC Mentoring</span>
              <span className="pill">Regulatory Affairs</span>
              <span className="pill">GMP Training</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <SectionTitle eyebrow="Testimonials" title="Designed for serious learners" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            'Clear module structure made OOS concepts easier to apply in daily lab work.',
            'The validation examples feel grounded in real inspection expectations.',
            'A clean way for our team to revisit GMP topics before audits.',
          ].map((quote, i) => (
            <blockquote className="quote-card" key={quote}>
              <p>"{quote}"</p><footer>Learner {i + 1}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}

// ─── Catalog ──────────────────────────────────────────────────────────────────
function CatalogPage() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All levels');
  const [price, setPrice] = useState('Free and paid');
  const filtered = useMemo(() => publishedCourses.filter((c) => {
    const q = c.title.toLowerCase().includes(query.toLowerCase());
    const l = level === 'All levels' || c.level === level;
    const p = price === 'Free and paid' || (price === 'Free' && c.priceInr === 0) || (price === 'Paid' && c.priceInr > 0);
    return q && l && p;
  }), [level, price, query]);

  return (
    <section className="section">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionTitle eyebrow="Course Catalog" title="Choose a focused training path"
          copy="Filter-ready catalog of pharmaceutical training courses." />
        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input placeholder="Search courses" aria-label="Search courses" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <select aria-label="Filter by level" value={level} onChange={e => setLevel(e.target.value)}>
            <option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
          <select aria-label="Filter by price" value={price} onChange={e => setPrice(e.target.value)}>
            <option>Free and paid</option><option>Free</option><option>Paid</option>
          </select>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
      {filtered.length === 0 && <div className="empty-state mt-8">No courses match the current filters.</div>}
    </section>
  );
}

// ─── Course detail ────────────────────────────────────────────────────────────
function CourseDetailPage({ user, isAdmin }) {
  const { slug } = useParams();
  const course = getCourseBySlug(slug);
  const navigate = useNavigate();
  if (!course || (!course.published && !isAdmin)) return <NotFound />;
  const isEnrolled = false; // TODO: wire to Supabase enrollments table

  function handleEnroll() {
    if (!user) { navigate('/signup'); return; }
    if (course.priceInr === 0 || isEnrolled) {
      navigate(`/dashboard/learn/${course.id}/${getFirstLesson(course)}`);
    } else {
      navigate('/plans');
    }
  }

  return (
    <section className="section">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/courses">
        <ArrowLeft size={16} /> Back to catalog
      </Link>
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
                        <span className="flex items-center gap-2">
                          {lesson.isPreview || isEnrolled ? <Play size={16} /> : <Lock size={16} />}
                          {lesson.title}
                        </span>
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
              <ul className="mt-4 space-y-3">
                {course.whatYouWillLearn.map((item) => (
                  <li className="flex gap-3 text-slate-700" key={item}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={18} /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">About this Course</h2>
              <p className="mt-4 leading-8 text-slate-600">{course.description}</p>
            </div>
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
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Learner</p>
          <h2 className="mt-2 font-display text-xl font-bold text-navy">
            {user?.user_metadata?.full_name || user?.email || 'Learner'}
          </h2>
        </div>
        <nav className="mt-8 space-y-2">
          <NavLink to="/dashboard" end><LayoutDashboard size={18} /> Overview</NavLink>
          <NavLink to="/dashboard/my-courses"><BookOpen size={18} /> My Courses</NavLink>
          <NavLink to="/dashboard/profile"><UserRound size={18} /> Profile</NavLink>
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </section>
  );
}

function DashboardPage({ user }) {
  const enrolled = courses.filter((c) => c.priceInr === 0);
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
                <Link className="btn btn-outline mt-5 w-fit" to={`/dashboard/learn/${c.id}/${getFirstLesson(c)}`}>
                  Start <ChevronRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfilePage({ user }) {
  const name = user?.user_metadata?.full_name || '';
  const email = user?.email || '';
  return (
    <DashboardLayout user={user}>
      <SectionTitle eyebrow="Profile" title="Account and billing" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="panel-title">Profile details</h3>
          <label>Full name<input defaultValue={name} /></label>
          <label>Email<input defaultValue={email} disabled className="bg-slate-50 text-slate-400" /></label>
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

// ─── Course player ────────────────────────────────────────────────────────────
function CoursePlayerPage({ user }) {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId) ?? courses[0];

  // Build a flat ordered list of all lessons across all modules
  const allLessons = course.modules.flatMap((mod, mi) =>
    mod.lessons.map((lesson, li) => ({
      ...lesson,
      id: makeLessonId(mod.title, li),
      moduleTitle: mod.title,
      moduleIndex: mi,
      lessonIndex: li,
    }))
  );

  const currentLesson = getLessonById(course, lessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Track completed lessons locally (persists per session)
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`completed_${courseId}`) || '[]'); }
    catch { return []; }
  });

  function markComplete() {
    const updated = completed.includes(currentLesson.id)
      ? completed
      : [...completed, currentLesson.id];
    setCompleted(updated);
    localStorage.setItem(`completed_${courseId}`, JSON.stringify(updated));
    if (nextLesson) {
      navigate(`/dashboard/learn/${course.id}/${nextLesson.id}`);
    }
  }

  const isCompleted = (id) => completed.includes(id);

  return (
    <section className="player-shell">
      <aside className="lesson-sidebar">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/dashboard">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="mt-5 font-display text-2xl font-bold text-navy">{course.title}</h1>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
            <span>Progress</span>
            <span>{Math.round((completed.length / allLessons.length) * 100)}%</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed.length / allLessons.length) * 100}%` }} />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {course.modules.map((mod) => (
            <div key={mod.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{mod.title}</h2>
              <div className="mt-3 space-y-2">
                {mod.lessons.map((lesson, li) => {
                  const id = makeLessonId(mod.title, li);
                  const done = isCompleted(id);
                  return (
                    <Link
                      className={currentLesson.id === id ? 'outline-lesson active' : 'outline-lesson'}
                      key={lesson.title}
                      to={`/dashboard/learn/${course.id}/${id}`}
                    >
                      <span>{lesson.title}</span>
                      {done ? <CheckCircle2 size={16} className="text-teal shrink-0" /> : <Play size={16} className="shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="player-main">
        {/* Video or content-only lesson */}
        {currentLesson.videoUrl && currentLesson.videoUrl !== '/videos/upload-your-video.mp4' ? (
          <div className="video-frame">
            <video src={currentLesson.videoUrl} controls controlsList="nodownload" />
          </div>
        ) : (
          <div className="content-only-banner">
            <BookOpen size={32} className="text-teal" aria-hidden="true" />
            <p>Reading lesson — no video for this topic</p>
          </div>
        )}

        <div className="mt-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="badge">{currentLesson.moduleTitle}</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy">{currentLesson.title}</h2>
          </div>
          {currentLesson.attachmentUrl ? (
            <a className="btn btn-outline" href={currentLesson.attachmentUrl} target="_blank" rel="noreferrer">
              <Download size={16} /> Download notes
            </a>
          ) : null}
        </div>

        <article className="lesson-notes">
          {currentLesson.notes.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
        </article>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            className="btn btn-outline"
            disabled={!prevLesson}
            onClick={() => prevLesson && navigate(`/dashboard/learn/${course.id}/${prevLesson.id}`)}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <span className="text-sm text-slate-400">
            {currentIndex + 1} / {allLessons.length}
          </span>

          {nextLesson ? (
            <button className="btn btn-primary" onClick={markComplete}>
              <CheckCircle2 size={16} />
              {isCompleted(currentLesson.id) ? 'Next Lesson' : 'Mark Complete & Next'}
            </button>
          ) : (
            <button className="btn btn-teal" onClick={markComplete}>
              <CheckCircle2 size={16} />
              {isCompleted(currentLesson.id) ? '✓ Course Complete' : 'Mark Complete'}
            </button>
          )}
        </div>

        {/* Course complete banner */}
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
  const plans = [
    ['Free', 0, 'Free courses only', ['Course previews', 'Free course access', 'Profile dashboard']],
    ['Pro', 499, 'All published courses', ['Everything in Free', 'All course access', 'Progress tracking']],
    ['Annual', 3999, 'All courses plus early access', ['Everything in Pro', 'Early access', 'Priority updates']],
  ];
  return (
    <section className="section">
      <SectionTitle eyebrow="Pricing" title="Simple plans for continuous GMP learning" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map(([name, price, access, features]) => (
          <article className="pricing-card" key={name}>
            <h2>{name}</h2>
            <strong>{price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}</strong>
            <p>{access}</p>
            <ul>
              {features.map((f) => <li key={f}><CheckCircle2 size={17} /> {f}</li>)}
            </ul>
            <Link className="btn btn-primary w-full justify-center" to={price === 0 ? '/signup' : '/signup'}>
              {price === 0 ? 'Start Free' : 'Subscribe'}
            </Link>
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
        <h2 className="mt-2 font-display text-xl font-bold text-navy">Harish Admin</h2>
        <nav className="mt-8 space-y-2">
          <NavLink to="/admin" end><BarChart3 size={18} /> Analytics</NavLink>
          <NavLink to="/admin/courses"><BookOpen size={18} /> Courses</NavLink>
          <NavLink to="/admin/users"><Users size={18} /> Users</NavLink>
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
        <span className="mx-auto grid h-14 w-14 place-items-center rounded bg-[#ccfbf1] text-teal">
          <ShieldCheck size={30} aria-hidden="true" />
        </span>
        <span className="eyebrow-dark mx-auto mt-5">Admin Only</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">This area is for the owner only</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
          Course creation, video uploads, access management, and content editing are reserved for Harish Singh's admin account.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" to="/courses">Explore Courses</Link>
          <Link className="btn btn-outline" to="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    </section>
  );
}

function AdminPage({ isAdmin }) {
  const [stats, setStats] = useState({ signups: 0, enrollments: 0, subscribers: 0 });

  useEffect(() => {
    if (!hasSupabaseConfig || !isAdmin) return;
    async function loadStats() {
      const [{ count: signups }, { count: enrollments }, { count: subscribers }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      setStats({ signups: signups ?? 0, enrollments: enrollments ?? 0, subscribers: subscribers ?? 0 });
    }
    loadStats();
  }, [isAdmin]);

  return (
    <AdminLayout isAdmin={isAdmin}>
      <SectionTitle eyebrow="Owner Control Center" title="Manage courses, videos, users, and access"
        copy="This panel is visible only to admin accounts." />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          [BookOpen,'Course CMS','Create, edit, publish, unpublish, or remove courses.','/admin/courses'],
          [UploadCloud,'Video Library','Upload lesson videos and connect them to each subtopic.','/admin/courses'],
          [Users,'Learner Access','Grant, revoke, or review enrollment access for users.','/admin/users'],
          [ShieldCheck,'Admin Security','Owner-only access backed by Supabase admin roles.','/admin/users'],
        ].map(([Icon,title,copy,href]) => (
          <Link className="admin-action-card" to={href} key={title}>
            <Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {[
          ['MRR','₹0'],
          ['Active subscribers', stats.subscribers],
          ['Enrollments', stats.enrollments],
          ['New signups', stats.signups],
        ].map(([label,value]) => (
          <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      <div className="panel mt-8">
        <h3 className="panel-title">Course completion rates</h3>
        {courses.map((c, i) => (
          <div className="admin-progress" key={c.id}>
            <span>{c.title}</span>
            <div className="progress-track"><span style={{ width: `${30 + i * 12}%` }} /></div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

function AdminCoursesPage({ isAdmin }) {
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
            {courses.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.title}</strong><span>{c.shortDesc}</span></td>
                <td>{c.level}</td>
                <td>{formatPrice(c.priceInr)}</td>
                <td><span className="badge">{c.published ? 'Published' : 'Draft'}</span></td>
                <td><Link className="btn btn-ghost" to={`/admin/courses/${c.id}/edit`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function AdminCourseFormPage({ isAdmin }) {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const existingCourse = editId ? courses.find((c) => c.id === editId) : null;

  const [title, setTitle] = useState(existingCourse?.title ?? '');
  const [slug, setSlug] = useState(existingCourse?.slug ?? '');
  const [shortDesc, setShortDesc] = useState(existingCourse?.shortDesc ?? '');
  const [description, setDescription] = useState(existingCourse?.description ?? '');
  const [level, setLevel] = useState(existingCourse?.level ?? 'Intermediate');
  const [priceInr, setPriceInr] = useState(existingCourse?.priceInr ?? 999);
  const [thumbnail, setThumbnail] = useState(existingCourse?.thumbnail ?? '');
  const [published, setPublished] = useState(existingCourse?.published ?? false);
  const [modules, setModules] = useState(
    existingCourse?.modules.map((m) => ({
      title: m.title,
      lessons: m.lessons.map((l) => ({
        title: l.title,
        duration: l.duration,
        videoUrl: l.videoUrl ?? '',
        attachmentUrl: l.attachmentUrl ?? '',
        isPreview: l.isPreview ?? false,
        notes: l.notes ?? '',
      })),
    })) ?? [{ title: '', lessons: [{ title: '', duration: '10 min', videoUrl: '', attachmentUrl: '', isPreview: false, notes: '' }] }]
  );
  const [saved, setSaved] = useState(false);

  function addModule() {
    setModules([...modules, { title: '', lessons: [{ title: '', duration: '10 min', videoUrl: '', attachmentUrl: '', isPreview: false, notes: '' }] }]);
  }
  function removeModule(mi) { setModules(modules.filter((_, i) => i !== mi)); }
  function updateModule(mi, field, value) {
    setModules(modules.map((m, i) => i === mi ? { ...m, [field]: value } : m));
  }
  function addLesson(mi) {
    setModules(modules.map((m, i) => i === mi
      ? { ...m, lessons: [...m.lessons, { title: '', duration: '10 min', videoUrl: '', attachmentUrl: '', isPreview: false, notes: '' }] }
      : m));
  }
  function removeLesson(mi, li) {
    setModules(modules.map((m, i) => i === mi
      ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) }
      : m));
  }
  function updateLesson(mi, li, field, value) {
    setModules(modules.map((m, i) => i === mi
      ? { ...m, lessons: m.lessons.map((l, j) => j === li ? { ...l, [field]: value } : l) }
      : m));
  }

  function handleSave(e) {
    e.preventDefault();
    // Build the updated course data object and log it — 
    // in full Supabase integration this would upsert to DB
    const courseData = { id: slug, slug, title, shortDesc, description, level, priceInr: Number(priceInr), thumbnail, published, modules };
    console.log('Course data to save:', courseData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AdminLayout isAdmin={isAdmin}>
      <div className="flex items-center justify-between gap-4">
        <SectionTitle eyebrow={existingCourse ? 'Edit Course' : 'New Course'} title={existingCourse ? `Editing: ${existingCourse.title}` : 'Create a new course'} />
        <button className="btn btn-ghost" onClick={() => navigate('/admin/courses')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {saved && (
        <div className="mt-4 flex items-center gap-2 rounded bg-teal/10 px-4 py-3 font-semibold text-teal">
          <CheckCircle2 size={18} /> Changes saved — update src/data/courses.js with this data to publish.
        </div>
      )}

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {/* Course details */}
        <div className="panel">
          <h3 className="panel-title">Course details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" required /></label>
            <label>Slug (URL)<input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g,'-'))} placeholder="course-url-slug" required /></label>
          </div>
          <label className="mt-4 block">Short description (card text)
            <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows="2" placeholder="One line summary for the course card" />
          </label>
          <label className="mt-4 block">Full description
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows="4" placeholder="Full course description" />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label>Level
              <select value={level} onChange={e => setLevel(e.target.value)}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </label>
            <label>Price (₹ INR — use 0 for free)
              <input type="number" min="0" value={priceInr} onChange={e => setPriceInr(e.target.value)} />
            </label>
            <label>Status
              <select value={published ? 'published' : 'draft'} onChange={e => setPublished(e.target.value === 'published')}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">Thumbnail image URL
            <input value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://images.unsplash.com/..." />
          </label>
          {thumbnail && <img src={thumbnail} alt="Thumbnail preview" className="mt-3 h-36 w-full rounded object-cover" onError={e => e.target.style.display='none'} />}
        </div>

        {/* Modules & Lessons */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-navy">Modules &amp; Lessons</h3>
            <button type="button" className="btn btn-outline" onClick={addModule}><Plus size={15} /> Add Module</button>
          </div>

          <div className="mt-5 space-y-6">
            {modules.map((mod, mi) => (
              <div key={mi} className="panel border-l-4 border-l-teal">
                <div className="flex items-start justify-between gap-4">
                  <label className="flex-1">Module {mi + 1} title
                    <input value={mod.title} onChange={e => updateModule(mi, 'title', e.target.value)} placeholder="e.g. Introduction & Regulatory Framework" />
                  </label>
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
                        <label>Lesson title
                          <input value={lesson.title} onChange={e => updateLesson(mi, li, 'title', e.target.value)} placeholder="Lesson title" />
                        </label>
                        <label>Duration
                          <input value={lesson.duration} onChange={e => updateLesson(mi, li, 'duration', e.target.value)} placeholder="10 min" />
                        </label>
                      </div>
                      <label className="mt-3 block">Video URL
                        <input value={lesson.videoUrl} onChange={e => updateLesson(mi, li, 'videoUrl', e.target.value)}
                          placeholder="https://stream.cloudflare.com/... or /videos/filename.mp4" />
                      </label>
                      <label className="mt-3 block">Attachment URL (PDF / PPT)
                        <input value={lesson.attachmentUrl} onChange={e => updateLesson(mi, li, 'attachmentUrl', e.target.value)}
                          placeholder="/materials/filename.pdf or https://..." />
                      </label>
                      <label className="mt-3 block">Lesson notes
                        <textarea value={lesson.notes} onChange={e => updateLesson(mi, li, 'notes', e.target.value)} rows="3"
                          placeholder="Notes shown below the video to learners" />
                      </label>
                      <label className="mt-3 flex items-center gap-2 font-normal">
                        <input type="checkbox" checked={lesson.isPreview} onChange={e => updateLesson(mi, li, 'isPreview', e.target.checked)} />
                        Free preview (visible without enrollment)
                      </label>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost w-full border border-dashed border-slate-300" onClick={() => addLesson(mi)}>
                    <Plus size={15} /> Add Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save bar */}
        <div className="sticky bottom-4 flex flex-wrap gap-3 rounded border border-slate-200 bg-white p-4 shadow-soft">
          <button type="submit" className="btn btn-primary"><CheckCircle2 size={16} /> Save Changes</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/courses')}>Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}

function AdminUsersPage({ isAdmin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig || !isAdmin) return;
    supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, [isAdmin]);

  return (
    <AdminLayout isAdmin={isAdmin}>
      <SectionTitle eyebrow="Users" title="Manage enrollments" />
      <div className="table-wrap mt-8">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="text-center text-slate-400 py-6">Loading users…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan="5" className="text-center text-slate-400 py-6">No users yet.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.full_name || '—'}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-ghost">Grant Access</button>
                    <button className="btn btn-outline">Revoke</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
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
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row lg:px-8">
        <div>
          <strong className="font-display text-navy">NextGen Pharma Solutions</strong>
          <p className="mt-2">Contact: harideepsingh13@gmail.com</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/courses">Courses</Link>
          <Link to="/plans">Plans</Link>
          <Link to="/dashboard">Dashboard</Link>
          <a href="https://www.linkedin.com/in/harish-singh-29b39b46/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, isAdmin, loading } = useAuth();

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Header user={user} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage user={user} isAdmin={isAdmin} />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/pricing" element={<PlansPage />} />

        {/* Auth routes — redirect logged-in users away */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected learner routes */}
        <Route path="/dashboard" element={
          <RequireAuth user={user} loading={loading}><DashboardPage user={user} /></RequireAuth>
        } />
        <Route path="/dashboard/my-courses" element={
          <RequireAuth user={user} loading={loading}><DashboardPage user={user} /></RequireAuth>
        } />
        <Route path="/dashboard/profile" element={
          <RequireAuth user={user} loading={loading}><ProfilePage user={user} /></RequireAuth>
        } />
        <Route path="/dashboard/learn/:courseId/:lessonId" element={
          <RequireAuth user={user} loading={loading}><CoursePlayerPage user={user} /></RequireAuth>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminPage isAdmin={isAdmin} />} />
        <Route path="/admin/courses" element={<AdminCoursesPage isAdmin={isAdmin} />} />
        <Route path="/admin/courses/new" element={<AdminCourseFormPage isAdmin={isAdmin} />} />
        <Route path="/admin/courses/:id/edit" element={<AdminCourseFormPage isAdmin={isAdmin} />} />
        <Route path="/admin/users" element={<AdminUsersPage isAdmin={isAdmin} />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
