import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Lock, PlayCircle, FileText, Award, Clock, Users, Star } from 'lucide-react';
import { getCourseBySlug as getCourseBySlugStatic } from '../data/courses.js';

export default function CheckoutPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
        console.error('Failed to load course from API, trying static fallback:', err);
        try {
          const staticCourse = getCourseBySlugStatic(slug);
          if (staticCourse) {
            setCourse(staticCourse);
          } else {
            setCourse(null);
          }
        } catch (staticErr) {
          console.error('Failed to load static course:', staticErr);
          setCourse(null);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!course) return;
    
    setProcessing(true);
    
    try {
      // Create Razorpay order
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.priceInr,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const order = await response.json();

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'NextGen Pharma',
          description: course.title,
          order_id: order.orderId,
          handler: async function (response) {
            // Verify payment
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                courseId: course.id,
                userId: 'user-id-placeholder', // Replace with actual user ID from auth
              }),
            });

            if (verifyResponse.ok) {
              alert('Payment successful! You are now enrolled.');
              navigate(`/course/${course.slug}`);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#0d9488',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', function (response) {
          alert('Payment failed. Please try again.');
        });
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
        <div className="text-red-500">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-navy">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Course Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Preview */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {course.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-64 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-teal/10 text-teal text-sm font-semibold rounded-full">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-navy mb-2">{course.title}</h2>
                <p className="text-slate-600 mb-4">{course.shortDesc}</p>
                
                <div className="flex items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Self-paced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>50+ enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle size={16} />
                    <span>{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-navy mb-4">What You'll Learn</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check size={20} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-navy mb-4">Course Content</h3>
              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <div key={module.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-navy">Module {index + 1}: {module.title}</h4>
                      <span className="text-sm text-slate-500">{module.lessons.length} lessons</span>
                    </div>
                    <div className="space-y-1">
                      {module.lessons.map((lesson, lIndex) => (
                        <div key={lesson.id} className="flex items-center gap-2 text-sm text-slate-600">
                          <PlayCircle size={14} className="text-slate-400" />
                          <span>{lIndex + 1}. {lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-navy mb-4">Why This Course?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal/10 rounded-lg">
                    <Award size={20} className="text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy">Industry Expert</h4>
                    <p className="text-sm text-slate-600">Learn from experienced professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal/10 rounded-lg">
                    <FileText size={20} className="text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy">Study Materials</h4>
                    <p className="text-sm text-slate-600">Downloadable PDFs and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal/10 rounded-lg">
                    <PlayCircle size={20} className="text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy">Lifetime Access</h4>
                    <p className="text-sm text-slate-600">Learn at your own pace, forever</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal/10 rounded-lg">
                    <Lock size={20} className="text-teal" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy">Certificate</h4>
                    <p className="text-sm text-slate-600">Get certified upon completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-navy mb-4">Payment Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Course Price</span>
                  <span className="font-semibold">₹{course.priceInr}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-semibold text-green-600">₹0</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-bold text-navy">
                  <span>Total</span>
                  <span>₹{course.priceInr}</span>
                </div>
              </div>

              <button
                onClick={handleEnroll}
                disabled={processing}
                className="w-full btn btn-primary py-4 text-lg font-semibold"
              >
                {processing ? 'Processing...' : `Pay ₹${course.priceInr}`}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Lock size={16} />
                <span>Secure payment powered by Razorpay</span>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">After Purchase, You Get:</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal" />
                    <span>Full access to all lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal" />
                    <span>Downloadable study materials</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-teal" />
                    <span>Lifetime access</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 text-center text-xs text-slate-400">
                <p>By clicking "Pay", you agree to our Terms of Service and Refund Policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
