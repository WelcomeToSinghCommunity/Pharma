import { FileText, Scale, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-teal/10 rounded-lg">
              <FileText size={32} className="text-teal" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy">Terms & Conditions</h1>
              <p className="text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              Welcome to NextGen Pharma. By accessing or using our online pharmaceutical training platform, you agree to comply with and be bound by the following Terms & Conditions.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Scale size={20} className="text-teal" />
                Acceptance of Terms
              </h2>
              <p className="text-slate-600">
                By enrolling in any course or creating an account on NextGen Pharma, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree with these terms, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Course Enrollment & Access</h2>
              <div className="space-y-3 text-slate-600">
                <p><strong>Eligibility:</strong> You must be at least 18 years old to enroll in our courses. By enrolling, you confirm that you meet this requirement.</p>
                <p><strong>Course Access:</strong> Upon successful payment, you will receive immediate access to the enrolled course(s). Access is granted for the lifetime of the course.</p>
                <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.</p>
                <p><strong>Single User License:</strong> Each enrollment is for individual use only. Sharing account credentials or course content with others is strictly prohibited.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-teal" />
                Payment Terms
              </h2>
              <div className="space-y-3 text-slate-600">
                <p><strong>Pricing:</strong> Course fees are displayed in Indian Rupees (INR) and are subject to change without prior notice. Changes will not affect existing enrollments.</p>
                <p><strong>Payment Method:</strong> Payments are processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and wallets.</p>
                <p><strong>Transaction Security:</strong> All payment information is encrypted and processed in compliance with PCI DSS standards.</p>
                <p><strong>Taxes:</strong> All prices are inclusive of applicable taxes unless otherwise stated.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <XCircle size={20} className="text-red-500" />
                Refund Policy
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">All course purchases are NON-REFUNDABLE once access has been granted.</p>
              </div>
              <div className="space-y-3 text-slate-600">
                <p><strong>No Refunds:</strong> Due to the nature of digital content and immediate access, we do not offer refunds for course purchases once you have been granted access to the course materials.</p>
                <p><strong>Technical Issues:</strong> If you experience technical difficulties accessing the course, please contact our support team immediately. We will work to resolve the issue promptly.</p>
                <p><strong>Exceptional Circumstances:</strong> In rare cases of billing errors or duplicate charges, we will review and process appropriate corrections within 7-10 business days.</p>
                <p><strong>Support Contact:</strong> For any payment-related issues, please contact us with your transaction ID and registered email at contact@nextgenpharma.org</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-teal" />
                Intellectual Property
              </h2>
              <div className="space-y-3 text-slate-600">
                <p><strong>Course Content:</strong> All course materials, videos, documents, and assessments are the intellectual property of NextGen Pharma and are protected by copyright laws.</p>
                <p><strong>Usage Restrictions:</strong> You may not reproduce, distribute, modify, or create derivative works of any course content without explicit written permission.</p>
                <p><strong>Certificate:</strong> Course completion certificates are issued upon successful completion and remain the property of NextGen Pharma.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">User Conduct</h2>
              <p className="text-slate-600 mb-3">You agree not to:</p>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Share or resell course content to third parties</li>
                <li>Attempt to reverse-engineer or circumvent security measures</li>
                <li>Post offensive, inappropriate, or harmful content</li>
                <li>Interfere with the operation of the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Limitation of Liability</h2>
              <p className="text-slate-600">
                Harish Pharma Academy shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use our courses or platform. Our liability is limited to the amount paid for the specific course in question.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Modifications to Terms</h2>
              <p className="text-slate-600">
                We reserve the right to modify these Terms & Conditions at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Governing Law</h2>
              <p className="text-slate-600">
                These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Contact Information</h2>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700"><strong>Email:</strong> contact@nextgenpharma.org</p>
                <p className="text-slate-700 mt-1"><strong>Phone:</strong> +91 9630877397</p>
                <p className="text-slate-700 mt-1"><strong>Address:</strong> Makarba, Ahmedabad 380051, Gujarat</p>
              </div>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-8">
              <p className="text-sm text-slate-500">
                By enrolling in any course on NextGen Pharma, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
