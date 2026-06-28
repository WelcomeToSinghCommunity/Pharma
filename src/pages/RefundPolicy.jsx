import { AlertTriangle, Mail, Phone, Clock, XCircle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-10 rounded-lg">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy">Refund Policy</h1>
              <p className="text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
              <p className="text-red-800 font-semibold text-lg">
                All course purchases are NON-REFUNDABLE once access has been granted.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <XCircle size={20} className="text-red-500" />
                No Refund Policy
              </h2>
              <div className="space-y-3 text-slate-600">
                <p>
                  At NextGen Pharma, we take pride in delivering high-quality pharmaceutical training content. Due to the digital nature of our courses and immediate access granted upon enrollment, we maintain a strict <strong>NO REFUND POLICY</strong>.
                </p>
                <p>
                  Once you have successfully enrolled in a course and gained access to the course materials, videos, and resources, the purchase is considered final and non-refundable.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Clock size={20} className="text-teal" />
                Why No Refunds?
              </h2>
              <div className="space-y-3 text-slate-600">
                <p><strong>Digital Content:</strong> Course materials are intellectual property that cannot be "returned" once accessed.</p>
                <p><strong>Immediate Access:</strong> You receive full access to all course content immediately upon payment.</p>
                <p><strong>Value Proposition:</strong> We provide detailed course descriptions, previews, and curriculum information before enrollment to help you make informed decisions.</p>
                <p><strong>Fair Pricing:</strong> Our courses are priced competitively to provide maximum value for your investment.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Exceptions</h2>
              <p className="text-slate-600 mb-3">
                In rare circumstances, we may consider exceptions:
              </p>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li><strong>Duplicate Charges:</strong> If you were accidentally charged multiple times for the same course, we will refund the duplicate amount within 7-10 business days.</li>
                <li><strong>Technical Errors:</strong> If a technical error on our end prevented you from accessing the course despite successful payment, we will investigate and resolve the issue or provide a refund if access cannot be restored.</li>
                <li><strong>Incorrect Course:</strong> If you enrolled in the wrong course due to a platform error, contact us within 24 hours for possible course transfer (not refund).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Technical Support</h2>
              <p className="text-slate-600 mb-3">
                If you face any technical issues accessing your course, please contact our support team before assuming the purchase is invalid. We are committed to resolving technical issues promptly.
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-teal-800">
                  <strong>Common Issues We Resolve:</strong> Login problems, video playback issues, certificate generation errors, account access problems.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">How to Request Support</h2>
              <p className="text-slate-600 mb-3">
                If you believe you qualify for an exception or need technical support:
              </p>
              <div className="space-y-3 text-slate-600">
                <p><strong>Required Information:</strong></p>
                <ul className="list-disc pl-5 ml-4">
                  <li>Transaction ID (from Razorpay payment receipt)</li>
                  <li>Registered email address</li>
                  <li>Course name and enrollment date</li>
                  <li>Detailed description of the issue</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Mail size={20} className="text-teal" />
                Contact Information
              </h2>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 mb-2">
                  For refund-related inquiries or technical support, please contact:
                </p>
                <p className="text-slate-700"><strong>Email:</strong> harideepsingh13@gmail.com</p>
                <p className="text-slate-700 mt-1"><strong>Phone:</strong> +91 XXXXXXXXXX</p>
                <p className="text-slate-700 mt-1"><strong>Response Time:</strong> Within 24-48 business hours</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Before You Enroll</h2>
              <p className="text-slate-600 mb-3">
                To ensure you're making the right decision, we recommend:
              </p>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li>Review the complete course curriculum and syllabus</li>
                <li>Watch available course previews and sample videos</li>
                <li>Read course descriptions and learning outcomes</li>
                <li>Check the course level (Beginner, Intermediate, Advanced) matches your background</li>
                <li>Ensure you have the required time commitment to complete the course</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Questions?</h2>
              <p className="text-slate-600">
                If you have any questions about a course before enrolling, please reach out to us. We're happy to provide additional information to help you make an informed decision.
              </p>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-8">
              <p className="text-sm text-slate-500">
                This Refund Policy is effective as of the date listed above and may be updated periodically. We will notify you of any significant changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
