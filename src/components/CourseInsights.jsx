import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Users, Award, Play, Lock, ChevronRight } from 'lucide-react';

export default function CourseInsights() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    // Try to get from backend API by slug
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses/slug/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setCourse(data);
        else throw new Error('Course not found');
      })
      .catch(err => {
        console.error('Failed to load course:', err);
        setCourse(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Course Not Found</h1>
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const totalDuration = course.modules.reduce((acc, mod) => 
    acc + mod.lessons.reduce((sum, lesson) => sum + (lesson.videoDuration || 0), 0), 0
  );

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link 
            to={`/courses/${course.slug}`} 
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal-700"
          >
            <ArrowLeft size={16} /> Back to Course
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Course Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-6">
                {course.thumbnailUrl && (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <span className="px-3 py-1 bg-teal/10 text-teal text-sm font-semibold rounded-full">
                    {course.level}
                  </span>
                  <h1 className="mt-3 text-3xl font-bold text-navy">{course.title}</h1>
                  <p className="mt-2 text-slate-600">{course.shortDesc}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <Clock size={20} className="mx-auto text-teal mb-1" />
                  <p className="text-sm text-slate-500">Duration</p>
                  <p className="font-semibold text-navy">{formatDuration(totalDuration)}</p>
                </div>
                <div className="text-center">
                  <BookOpen size={20} className="mx-auto text-teal mb-1" />
                  <p className="text-sm text-slate-500">Lessons</p>
                  <p className="font-semibold text-navy">{totalLessons}</p>
                </div>
                <div className="text-center">
                  <Users size={20} className="mx-auto text-teal mb-1" />
                  <p className="text-sm text-slate-500">Modules</p>
                  <p className="font-semibold text-navy">{course.modules.length}</p>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Award size={24} className="text-teal" />
                What You'll Learn
              </h2>
              <div className="space-y-3">
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                  course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-teal flex-shrink-0 mt-0.5" />
                      <p className="text-slate-600">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Course learning outcomes will be updated soon.</p>
                )}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <BookOpen size={24} className="text-teal" />
                Course Content
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, modIndex) => (
                  <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                      <h3 className="font-semibold text-navy">
                        Module {modIndex + 1}: {module.title}
                      </h3>
                      <span className="text-sm text-slate-500">{module.lessons.length} lessons</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
                          {lesson.isPreview ? (
                            <Play size={16} className="text-teal flex-shrink-0" />
                          ) : (
                            <Lock size={16} className="text-slate-400 flex-shrink-0" />
                          )}
                          <span className="flex-1 text-sm text-slate-700">{lesson.title}</span>
                          {lesson.videoDuration && (
                            <span className="text-xs text-slate-500">
                              {formatDuration(lesson.videoDuration)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Award size={24} className="text-teal" />
                Course Benefits
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Full Course Access</h3>
                    <p className="text-sm text-slate-600">Lifetime access to all course materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Downloadable Materials</h3>
                    <p className="text-sm text-slate-600">PDFs, slides, and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Certificate</h3>
                    <p className="text-sm text-slate-600">Certificate of completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Expert Support</h3>
                    <p className="text-sm text-slate-600">Direct instructor access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-navy mb-4">Payment Summary</h2>
              
              <div className="space-y-3 py-4 border-y border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-600">Course Price</span>
                  <span className="font-semibold text-navy">
                    {course.priceInr === 0 ? 'Free' : `₹${course.priceInr}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-semibold text-green-600">₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-slate-100">
                <span className="font-bold text-navy">Total</span>
                <span className="text-2xl font-bold text-teal">
                  {course.priceInr === 0 ? 'Free' : `₹${course.priceInr}`}
                </span>
              </div>

              <button
                onClick={() => navigate(`/checkout/${course.slug}`)}
                className="btn btn-primary w-full justify-center mt-6 text-lg"
              >
                Proceed to Checkout
                <ChevronRight size={20} className="ml-2" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  Secure payment powered by Razorpay
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="font-semibold text-navy mb-3">Need Help?</h3>
                <p className="text-sm text-slate-600 mb-2">
                  Contact us at harideepsingh13@gmail.com
                </p>
                <Link to="/refund-policy" className="text-sm text-teal hover:underline">
                  View Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
