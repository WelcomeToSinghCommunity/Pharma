import { Shield, Lock, Eye, User, Database, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-teal/10 rounded-lg">
              <Shield size={32} className="text-teal" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy">Privacy Policy</h1>
              <p className="text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              NextGen Pharma ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our online pharmaceutical training platform.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <User size={20} className="text-teal" />
                Information We Collect
              </h2>
              <div className="space-y-3 text-slate-600">
                <p><strong>Personal Information:</strong> Name, email address, phone number, and payment details when you enroll in courses.</p>
                <p><strong>Account Information:</strong> Username, password (encrypted), and profile information you provide.</p>
                <p><strong>Course Progress:</strong> Learning progress, quiz scores, and completion certificates.</p>
                <p><strong>Payment Information:</strong> Transaction details processed securely through Razorpay. We do not store your full card details.</p>
                <p><strong>Usage Data:</strong> IP address, browser type, device information, and pages visited to improve our services.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Lock size={20} className="text-teal" />
                How We Use Your Information
              </h2>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li>To provide and deliver course content and materials</li>
                <li>To process payments and send payment confirmations</li>
                <li>To create and manage your account</li>
                <li>To track your learning progress and issue certificates</li>
                <li>To communicate about course updates, new offerings, and support</li>
                <li>To improve our platform and user experience</li>
                <li>To comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Database size={20} className="text-teal" />
                Data Security
              </h2>
              <p className="text-slate-600 mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li>SSL encryption for all data transmissions</li>
                <li>Secure payment processing through Razorpay (PCI DSS compliant)</li>
                <li>Encrypted password storage</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication systems</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Eye size={20} className="text-teal" />
                Information Sharing
              </h2>
              <p className="text-slate-600 mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
              </p>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li>With service providers who assist in operating our platform (payment processors, hosting services)</li>
                <li>When required by law or to protect our rights and safety</li>
                <li>With your explicit consent for specific purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Mail size={20} className="text-teal" />
                Your Rights
              </h2>
              <p className="text-slate-600 mb-3">
                You have the right to:
              </p>
              <ul className="space-y-2 text-slate-600 list-disc pl-5">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Review and manage your learning data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4">Contact Us</h2>
              <p className="text-slate-600 mb-2">
                If you have questions about this Privacy Policy or your personal information, please contact us:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-3">
                <p className="text-slate-700"><strong>Email:</strong> harideepsingh13@gmail.com</p>
                <p className="text-slate-700 mt-1"><strong>Phone:</strong> +91 XXXXXXXXXX</p>
                <p className="text-slate-700 mt-1"><strong>Address:</strong> Makarba, Ahmedabad 380051, Gujarat</p>
              </div>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-8">
              <p className="text-sm text-slate-500">
                This Privacy Policy is effective as of the date listed above and may be updated periodically. We will notify you of any significant changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
