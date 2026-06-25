import { useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
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

const currentUser = {
  name: 'Harish Singh',
  email: 'harideepsingh13@gmail.com',
  role: 'admin',
  enrolledCourseIds: ['csa-guidelines-fda-audits', 'oos-investigation'],
};

const ownerEmail = 'harideepsingh13@gmail.com';
const isOwner = currentUser.role === 'admin' && currentUser.email.toLowerCase() === ownerEmail;
const publishedCourses = courses.filter((course) => course.published);

function formatPrice(priceInr) {
  return priceInr === 0 ? 'Free' : `₹${priceInr.toLocaleString('en-IN')}`;
}

function getFirstLesson(course) {
  return makeLessonId(course.modules[0].title, 0);
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="brand-logo" aria-label="NextGen Pharma Solutions home">
          <img src="/logo-harish-pharma-academy.svg" alt="NextGen Pharma Solutions" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <NavLink className="hover:text-teal" to="/courses">
            Courses
          </NavLink>
          <NavLink className="hover:text-teal" to="/plans">
            Plans
          </NavLink>
          <NavLink className="hover:text-teal" to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className="hover:text-teal" to="/admin">
            Admin
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link className="btn btn-ghost hidden sm:inline-flex" to="/login">
            Login
          </Link>
          <Link className="btn btn-primary" to="/courses">
            Browse Courses
          </Link>
          <button className="icon-btn md:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
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
              <Link className="btn btn-light" to="/courses">
                Browse Courses
              </Link>
              <Link className="btn btn-teal" to="/dashboard">
                Start Learning
              </Link>
            </div>
          </div>
          <div className="lab-panel" aria-label="Harish Singh profile and training focus">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
              alt="Pharmaceutical laboratory glassware and testing environment"
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
        {[
          ['4', 'Courses published'],
          ['250+', 'Target learners'],
          ['20+', 'Years industry experience'],
          ['100%', 'Structured curriculum'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <SectionTitle
          eyebrow="Featured Courses"
          title="Build confidence before the next inspection"
          copy="Each course is organized into modules, lessons, notes, attachments, and progress checkpoints."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="section bg-white">
        <SectionTitle eyebrow="Why This Platform" title="Purpose-built for pharmaceutical learners" />
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            [ShieldCheck, 'Regulatory-aligned', 'USFDA, EU GMP, MHRA, USP, Annex 15, and GAMP 5 references.'],
            [ClipboardCheck, 'Actionable SOP thinking', 'Content maps directly to investigation, validation, and audit tasks.'],
            [BarChart3, 'Progress-led UX', 'Dashboards, completion states, and continue paths keep learners moving.'],
            [Users, 'Owner-ready CMS', 'Harish can publish, price, and manage courses without code changes.'],
          ].map(([Icon, title, copy]) => (
            <div className="value-card" key={title}>
              <Icon className="text-teal" size={26} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="founder-photo-wrap">
            <img
              src="/harish-profile.jpg"
              alt="Harish C. Singh — Founder, NextGen Pharma Solutions"
              className="founder-photo"
            />
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
          ].map((quote, index) => (
            <blockquote className="quote-card" key={quote}>
              <p>“{quote}”</p>
              <footer>Learner {index + 1}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
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

function CatalogPage() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All levels');
  const [price, setPrice] = useState('Free and paid');
  const filteredCourses = useMemo(
    () =>
      publishedCourses.filter((course) => {
        const matchesQuery = course.title.toLowerCase().includes(query.toLowerCase());
        const matchesLevel = level === 'All levels' || course.level === level;
        const matchesPrice =
          price === 'Free and paid' ||
          (price === 'Free' && course.priceInr === 0) ||
          (price === 'Paid' && course.priceInr > 0);
        return matchesQuery && matchesLevel && matchesPrice;
      }),
    [level, price, query],
  );

  return (
    <section className="section">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionTitle
          eyebrow="Course Catalog"
          title="Choose a focused training path"
          copy="Filter-ready catalog experience with the launch seed courses from the PRD."
        />
        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input
              placeholder="Search courses"
              aria-label="Search courses"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select aria-label="Filter by level" value={level} onChange={(event) => setLevel(event.target.value)}>
            <option>All levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select aria-label="Filter by price" value={price} onChange={(event) => setPrice(event.target.value)}>
            <option>Free and paid</option>
            <option>Free</option>
            <option>Paid</option>
          </select>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      {filteredCourses.length === 0 && (
        <div className="empty-state mt-8">No courses match the current filters.</div>
      )}
    </section>
  );
}

function CourseDetailPage() {
  const { slug } = useParams();
  const course = getCourseBySlug(slug);
  const navigate = useNavigate();

  if (!course || (!course.published && !isOwner)) {
    return <NotFound />;
  }

  const isEnrolled = currentUser.enrolledCourseIds.includes(course.id);

  function handleEnroll() {
    if (course.priceInr === 0 || isEnrolled) {
      navigate(`/dashboard/learn/${course.id}/${getFirstLesson(course)}`);
      return;
    }
    navigate('/login');
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
              {course.modules.map((module, moduleIndex) => (
                <details key={module.title} open={moduleIndex === 0} className="curriculum-item">
                  <summary>
                    <span>{module.title}</span>
                    <span>{module.lessons.length} lessons</span>
                  </summary>
                  <div className="space-y-2 p-4">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isPreview = lesson.isPreview;
                      return (
                        <div className="lesson-row" key={lesson.title}>
                          <span className="flex items-center gap-2">
                            {isPreview || isEnrolled ? <Play size={16} /> : <Lock size={16} />}
                            {lesson.title}
                          </span>
                          <span>{lesson.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">What You’ll Learn</h2>
              <ul className="mt-4 space-y-3">
                {course.whatYouWillLearn.map((item) => (
                  <li className="flex gap-3 text-slate-700" key={item}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={18} />
                    <span>{item}</span>
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
            {isEnrolled ? 'Continue Learning' : course.priceInr === 0 ? 'Enroll Free' : 'Enroll Now'}
          </button>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Paid checkout is wired for Razorpay Edge Functions once Supabase credentials are connected.
          </p>
        </aside>
      </div>
    </section>
  );
}

function DashboardLayout({ children }) {
  return (
    <section className="dashboard-shell">
      <aside className="dashboard-nav">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Learner</p>
          <h2 className="mt-2 font-display text-xl font-bold text-navy">{currentUser.name}</h2>
        </div>
        <nav className="mt-8 space-y-2">
          <NavLink to="/dashboard" end>
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          <NavLink to="/dashboard/my-courses">
            <BookOpen size={18} /> My Courses
          </NavLink>
          <NavLink to="/dashboard/profile">
            <UserRound size={18} /> Profile
          </NavLink>
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </section>
  );
}

function DashboardPage() {
  const enrolled = courses.filter((course) => currentUser.enrolledCourseIds.includes(course.id));

  return (
    <DashboardLayout>
      <SectionTitle eyebrow="Dashboard" title="Welcome back to your learning workspace" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ['Active courses', enrolled.length],
          ['Lessons completed', 11],
          ['Current plan', 'Free'],
        ].map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <MyCourses compact />
    </DashboardLayout>
  );
}

function MyCoursesPage() {
  return (
    <DashboardLayout>
      <MyCourses />
    </DashboardLayout>
  );
}

function MyCourses({ compact = false }) {
  const enrolled = courses.filter((course) => currentUser.enrolledCourseIds.includes(course.id));

  return (
    <div className={compact ? 'mt-10' : ''}>
      <SectionTitle eyebrow="My Courses" title="Continue where you left off" />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {enrolled.map((course, index) => (
          <article className="learning-card" key={course.id}>
            <img src={course.thumbnail} alt="" className="h-36 w-full object-cover sm:h-full sm:w-44" />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-xl font-bold text-navy">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{course.shortDesc}</p>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Progress</span>
                  <span>{index === 0 ? 42 : 18}%</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${index === 0 ? 42 : 18}%` }} />
                </div>
              </div>
              <Link className="btn btn-outline mt-5 w-fit" to={`/dashboard/learn/${course.id}/${getFirstLesson(course)}`}>
                Continue <ChevronRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <DashboardLayout>
      <SectionTitle eyebrow="Profile" title="Account and billing" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="panel-title">Profile details</h3>
          <label>
            Full name
            <input defaultValue={currentUser.name} />
          </label>
          <label>
            Email
            <input defaultValue={currentUser.email} />
          </label>
          <button className="btn btn-primary w-fit">Save Profile</button>
        </div>
        <div className="panel">
          <h3 className="panel-title">Billing history</h3>
          <div className="empty-state">
            Razorpay payment IDs will appear here after paid checkout is connected.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CoursePlayerPage() {
  const { courseId, lessonId } = useParams();
  const course = courses.find((item) => item.id === courseId) ?? courses[0];
  const currentLesson = getLessonById(course, lessonId);

  return (
    <section className="player-shell">
      <aside className="lesson-sidebar">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/dashboard/my-courses">
          <ArrowLeft size={16} /> My courses
        </Link>
        <h1 className="mt-5 font-display text-2xl font-bold text-navy">{course.title}</h1>
        <div className="mt-6 space-y-5">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">{module.title}</h2>
              <div className="mt-3 space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <Link
                    className={currentLesson.id === makeLessonId(module.title, lessonIndex) ? 'outline-lesson active' : 'outline-lesson'}
                    key={lesson.title}
                    to={`/dashboard/learn/${course.id}/${makeLessonId(module.title, lessonIndex)}`}
                  >
                    <span>{lesson.title}</span>
                    {lessonIndex < 2 ? <CheckCircle2 size={16} /> : <Play size={16} />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className="player-main">
        <div className="video-frame">
          {currentLesson.videoUrl && currentLesson.videoUrl !== '/videos/upload-your-video.mp4' ? (
            <video src={currentLesson.videoUrl} controls controlsList="nodownload" />
          ) : (
            <div>
              <Play size={42} aria-hidden="true" />
              <p>Upload video URL in src/data/courses.js</p>
            </div>
          )}
        </div>
        <div className="mt-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="badge">{currentLesson.moduleTitle}</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy">{currentLesson.title}</h2>
          </div>
          {currentLesson.attachmentUrl ? (
            <a className="btn btn-outline" href={currentLesson.attachmentUrl} target="_blank" rel="noreferrer">
              <Download size={16} /> Download notes
            </a>
          ) : (
            <button className="btn btn-outline" disabled>
              <Download size={16} /> No attachment
            </button>
          )}
        </div>
        <article className="lesson-notes">
          {currentLesson.notes.split('\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <div className="mt-8 flex justify-between">
          <button className="btn btn-ghost">Previous</button>
          <button className="btn btn-primary">Mark Complete & Next</button>
        </div>
      </main>
    </section>
  );
}

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
              {features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={17} /> {feature}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary w-full justify-center">
              {price === 0 ? 'Start Free' : 'Subscribe'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminLayout({ children }) {
  if (!isOwner) {
    return <AdminAccessDenied />;
  }

  return (
    <section className="dashboard-shell">
      <aside className="dashboard-nav">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Owner Panel</p>
        <h2 className="mt-2 font-display text-xl font-bold text-navy">Harish Admin</h2>
        <nav className="mt-8 space-y-2">
          <NavLink to="/admin" end>
            <BarChart3 size={18} /> Analytics
          </NavLink>
          <NavLink to="/admin/courses">
            <BookOpen size={18} /> Courses
          </NavLink>
          <NavLink to="/admin/users">
            <Users size={18} /> Users
          </NavLink>
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
          Happy to see you onboard. Course creation, video uploads, access management, and content editing
          are reserved for Harish Singh’s admin account. You can explore courses and continue learning from
          your dashboard.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" to="/courses">
            Explore Courses
          </Link>
          <Link className="btn btn-outline" to="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

function AdminPage() {
  return (
    <AdminLayout>
      <SectionTitle
        eyebrow="Owner Control Center"
        title="Manage courses, videos, users, and access"
        copy="This panel is visible only to Harish’s admin account. The buttons are ready for the Supabase, storage, and payment APIs when they are connected."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          [BookOpen, 'Course CMS', 'Create, edit, publish, unpublish, or remove courses.', '/admin/courses'],
          [UploadCloud, 'Video Library', 'Upload lesson videos and connect them to each subtopic.', '/admin/courses'],
          [Users, 'Learner Access', 'Grant, revoke, or review enrollment access for users.', '/admin/users'],
          [ShieldCheck, 'Admin Security', 'Owner-only access backed by Supabase admin roles later.', '/admin/users'],
        ].map(([Icon, title, copy, href]) => (
          <Link className="admin-action-card" to={href} key={title}>
            <Icon size={24} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{copy}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {[
          ['MRR', '₹0'],
          ['Active subscribers', '0'],
          ['Enrollments', '2'],
          ['New signups', '12'],
        ].map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="panel mt-8">
        <h3 className="panel-title">Owner checklist before launch</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            'Upload video for every lesson',
            'Add PDFs/PPTs where required',
            'Mark preview lessons',
            'Set course prices',
            'Check learner access rules',
            'Connect Supabase, Razorpay, and video hosting',
          ].map((item) => (
            <div className="form-chip" key={item}>
              <CheckCircle2 size={17} /> {item}
            </div>
          ))}
        </div>
      </div>
      <div className="panel mt-8">
        <h3 className="panel-title">Course completion rates</h3>
        {courses.map((course, index) => (
          <div className="admin-progress" key={course.id}>
            <span>{course.title}</span>
            <div className="progress-track">
              <span style={{ width: `${30 + index * 12}%` }} />
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

function AdminCoursesPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionTitle eyebrow="Courses" title="Manage course content" />
        <Link className="btn btn-primary" to="/admin/courses/new">
          <Plus size={16} /> New Course
        </Link>
      </div>
      <div className="table-wrap mt-8">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Level</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>
                  <strong>{course.title}</strong>
                  <span>{course.shortDesc}</span>
                </td>
                <td>{course.level}</td>
                <td>{formatPrice(course.priceInr)}</td>
                <td>
                  <span className="badge">Published</span>
                </td>
                <td>
                  <Link className="btn btn-ghost" to={`/admin/courses/${course.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function AdminCourseFormPage() {
  return (
    <AdminLayout>
      <SectionTitle eyebrow="Course Builder" title="Create or edit course" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="panel">
          <h3 className="panel-title">Course details</h3>
          <label>
            Title
            <input defaultValue="New GMP Course" />
          </label>
          <label>
            Slug
            <input defaultValue="new-gmp-course" />
          </label>
          <label>
            Short description
            <textarea defaultValue="Concise course summary for catalog cards." />
          </label>
          <label>
            Full description
            <textarea rows="5" defaultValue="Full course description and learner outcomes." />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Level
              <select defaultValue="Intermediate">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label>
              Price INR
              <input type="number" defaultValue="1499" />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-outline" type="button">
              Save Draft
            </button>
            <button className="btn btn-primary" type="button">
              Publish
            </button>
          </div>
        </form>
        <div className="panel">
          <h3 className="panel-title">Video and lesson manager</h3>
          <button className="upload-zone" type="button">
            <UploadCloud size={28} />
            Upload thumbnail, video, PDF, or PPT
          </button>
          <div className="mt-5 space-y-3">
            {[
              'Module/topic title',
              'Lesson/subtopic title',
              'Video URL or uploaded MP4',
              'PDF/PPT attachment',
              'Preview lesson toggle',
              'Duration',
            ].map((item) => (
              <div className="form-chip" key={item}>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded border border-teal/30 bg-teal/5 p-4 text-sm leading-6 text-slate-600">
            Until storage APIs are connected, upload MP4 files into <strong>public/videos</strong> and paste
            the matching <strong>videoUrl</strong> in <strong>src/data/courses.js</strong>. After Supabase and
            Cloudflare/Mux are connected, this box becomes the owner upload workflow.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminUsersPage() {
  return (
    <AdminLayout>
      <SectionTitle eyebrow="Users" title="Manage enrollments" />
      <div className="table-wrap mt-8">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enrolled courses</th>
              <th>Subscription</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Kishan Singh', 'learner@example.com', '2', 'Free'],
              ['Demo Learner', 'demo@example.com', '1', 'Pro'],
            ].map(([name, email, enrolled, plan]) => (
              <tr key={email}>
                <td>
                  <strong>{name}</strong>
                </td>
                <td>{email}</td>
                <td>{enrolled}</td>
                <td>{plan}</td>
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

function AuthPage({ mode }) {
  const copy = {
    signup: ['Create account', 'Start learning GMP skills', 'Create Account'],
    login: ['Welcome back', 'Login to continue', 'Login'],
    forgot: ['Password reset', 'Reset your password', 'Send Reset Link'],
  }[mode];

  return (
    <section className="section">
      <div className="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft">
        <span className="eyebrow-dark">{copy[0]}</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">{copy[1]}</h1>
        <form className="mt-6 space-y-4">
          {mode === 'signup' && (
            <label>
              Full name
              <input placeholder="Your name" />
            </label>
          )}
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          {mode !== 'forgot' && (
            <label>
              Password
              <input type="password" placeholder="Password" />
            </label>
          )}
          <button className="btn btn-primary w-full justify-center" type="button">
            {copy[2]}
          </button>
        </form>
        {mode !== 'forgot' && (
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal" to="/forgot-password">
            <Mail size={16} /> Forgot password?
          </Link>
        )}
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <section className="section">
      <h1 className="font-display text-4xl font-bold text-navy">Page not found</h1>
      <Link className="btn btn-primary mt-6" to="/">
        Go home
      </Link>
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
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/pricing" element={<PlansPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/my-courses" element={<MyCoursesPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/learn/:courseId/:lessonId" element={<CoursePlayerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/courses/new" element={<AdminCourseFormPage />} />
        <Route path="/admin/courses/:id/edit" element={<AdminCourseFormPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
