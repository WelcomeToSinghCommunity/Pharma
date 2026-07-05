import { Award, BookOpen, Users, Target, CheckCircle, Heart, GraduationCap } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">About NextGen Pharma</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Empowering pharmaceutical professionals with industry-leading training and practical learning programs since 2020
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal/10 rounded-lg">
              <Target size={32} className="text-teal" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Our Mission</h2>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            At Harish Pharma Academy, we are dedicated to bridging the gap between academic knowledge and industry requirements in the pharmaceutical sector. Our mission is to provide high-quality, accessible, and practical training that equips professionals with the skills needed to excel in GMP compliance, quality assurance, and regulatory affairs.
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy mb-6">Our Story</h2>
          <div className="space-y-4 text-slate-600">
            <p>
              Founded by industry veteran Harish Singh, Harish Pharma Academy was born from a simple observation: while pharmaceutical education provides strong theoretical foundations, many professionals struggle to apply this knowledge in real-world scenarios, particularly in areas like OOS investigations, equipment qualification, and regulatory compliance.
            </p>
            <p>
              With over 15 years of experience in pharmaceutical quality assurance and GMP compliance, Harish recognized the need for practical, industry-focused training that goes beyond textbooks. Our academy was established to fill this gap, offering courses that are directly applicable to day-to-day operations in pharmaceutical manufacturing and quality control.
            </p>
            <p>
              Today, we have trained hundreds of professionals across India, helping them advance their careers, ensure compliance, and contribute to safer pharmaceutical products. Our courses are designed by industry experts who understand the challenges you face every day.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal/10 rounded-lg">
              <BookOpen size={32} className="text-teal" />
            </div>
            <h2 className="text-2xl font-bold text-navy">What We Offer</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy">Industry-Relevant Curriculum</h3>
                <p className="text-slate-600 text-sm">Courses designed by professionals with real-world experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy">Practical Training</h3>
                <p className="text-slate-600 text-sm">Focus on application, not just theory</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy">Flexible Learning</h3>
                <p className="text-slate-600 text-sm">Self-paced courses accessible anytime, anywhere</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy">Hands-On Cases</h3>
                <p className="text-slate-600 text-sm">Interactive learning with real industry templates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy">Expert Support</h3>
                <p className="text-slate-600 text-sm">Direct access to instructors for doubt clarification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-navy">Affordable Pricing</h3>
                <p className="text-slate-600 text-sm">Quality education at competitive prices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Courses */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal/10 rounded-lg">
              <GraduationCap size={32} className="text-teal" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Our Course Specializations</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-navy mb-2">OOS Investigation</h3>
              <p className="text-slate-600 text-sm">Master Out-of-Specification investigation processes, root cause analysis, and corrective actions</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-navy mb-2">Equipment Qualification</h3>
              <p className="text-slate-600 text-sm">Learn IQ, OQ, PQ protocols for pharmaceutical instruments and equipment</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-navy mb-2">Smoke Studies</h3>
              <p className="text-slate-600 text-sm">Understand airflow visualization and cleanroom qualification techniques</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-navy mb-2">CSA Guidelines</h3>
              <p className="text-slate-600 text-sm">Computer System Assurance implementation and FDA audit preparation</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal/10 rounded-lg">
              <Heart size={32} className="text-teal" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-teal/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award size={32} className="text-teal" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Excellence</h3>
              <p className="text-slate-600 text-sm">We strive for the highest quality in everything we do</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-teal/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users size={32} className="text-teal" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Community</h3>
              <p className="text-slate-600 text-sm">Building a network of skilled pharmaceutical professionals</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-teal/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target size={32} className="text-teal" />
              </div>
              <h3 className="font-semibold text-navy mb-2">Impact</h3>
              <p className="text-slate-600 text-sm">Contributing to safer pharmaceutical products worldwide</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-teal to-teal-600 rounded-2xl shadow-sm p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-6 opacity-90">
            Have questions about our courses or need guidance on which program is right for you? We're here to help.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Email</p>
              <p className="opacity-90">contact@nextgenpharma.org</p>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <p className="opacity-90">+91 9630877397</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-semibold">Address</p>
              <p className="opacity-90">Makarba, Ahmedabad 380051, Gujarat</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>NextGen Pharma - Your Partner in Pharmaceutical Excellence</p>
        </div>
      </div>
    </div>
  );
}
