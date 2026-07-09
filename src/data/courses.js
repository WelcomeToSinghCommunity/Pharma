const videoPlaceholder = '/videos/upload-your-video.mp4';

function lesson(title, options = {}) {
  return {
    title,
    duration: options.duration ?? '8 min',
    videoUrl: options.videoUrl ?? videoPlaceholder,
    attachmentUrl: options.attachmentUrl ?? '',
    isPreview: options.isPreview ?? false,
    notes:
      options.notes ??
      `Add lesson notes for "${title}" here. You can write plain text or markdown-style notes for learners.`,
  };
}

export const courses = [
  {
    id: 'oos-investigation',
    slug: 'oos-investigation',
    title: 'OOS Investigation',
    shortDesc: 'USFDA, EU, and MHRA-aligned investigation workflow from lab assessment to CAPA.',
    description:
      'A comprehensive guide to Out-of-Specification investigations across global regulatory expectations, covering initial assessment, root cause analysis, documentation, reporting, CAPA, and continuous improvement.',
    thumbnail:
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=60',
    instructor: 'Harish Singh',
    level: 'Intermediate',
    priceInr: 1499,
    published: true,
    whatYouWillLearn: [
      'Classify true OOS results versus laboratory error.',
      'Run structured 5 Whys and Fishbone root-cause analysis.',
      'Prepare inspection-ready investigation documentation.',
      'Connect CAPA plans to measurable prevention controls.',
    ],
    modules: [
      {
        title: 'Introduction & Regulatory Framework',
        lessons: [
          lesson('Overview of OOS: Definition and Importance', {
            duration: '10 min',
            isPreview: true,
            notes:
              'Introduce OOS meaning, why it matters in GMP environments, and how poor investigation practices create audit risk.',
          }),
          lesson('Regulatory Agencies: USFDA, EMA, MHRA roles', { duration: '12 min' }),
          lesson('Key Guidelines and GMP requirements', { duration: '14 min' }),
          lesson('Compliance across jurisdictions', { duration: '11 min' }),
        ],
      },
      {
        title: 'OOS Investigation Process',
        lessons: [
          lesson('Defining OOS results and acceptance criteria', { duration: '13 min' }),
          lesson('Initial Assessment: Lab error vs. true OOS', { duration: '16 min' }),
          lesson('Investigative Procedures and sample retesting', { duration: '15 min' }),
          lesson('Root Cause Analysis (5 Whys, Fishbone)', { duration: '18 min' }),
        ],
      },
      {
        title: 'Documentation & Reporting',
        lessons: [
          lesson('Importance of accurate documentation', { duration: '10 min' }),
          lesson('Standard Operating Procedures (SOPs)', { duration: '13 min' }),
          lesson('Data integrity and security', { duration: '15 min' }),
          lesson('Audit trail maintenance', { duration: '11 min' }),
          lesson('Regulatory reporting requirements', { duration: '14 min' }),
        ],
      },
      {
        title: 'CAPA & Continuous Improvement',
        lessons: [
          lesson('Corrective and Preventive Actions (CAPA)', { duration: '14 min' }),
          lesson('Implementing corrective measures', { duration: '12 min' }),
          lesson('Enhancing training programs', { duration: '10 min' }),
          lesson('Monitoring and evaluation metrics', { duration: '11 min' }),
          lesson('Fostering a culture of continuous improvement', { duration: '9 min' }),
        ],
      },
    ],
  },
  {
    id: 'equipment-qualification',
    slug: 'equipment-qualification',
    title: 'Qualification of Instrument/Equipment',
    shortDesc: 'Step-by-step DQ, IQ, OQ, PQ, and MQ for laboratory instruments and equipment.',
    description:
      'A practical guide to qualifying instruments and equipment per USP, EU GMP Annex 15, and GAMP 5 standards, with documentation and lifecycle control expectations.',
    thumbnail:
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=600&q=60',
    instructor: 'Harish Singh',
    level: 'Beginner',
    priceInr: 999,
    published: true,
    whatYouWillLearn: [
      'Map qualification activities across the equipment lifecycle.',
      'Build DQ, IQ, OQ, PQ, and MQ documentation packs.',
      'Define acceptance criteria and recalibration intervals.',
      'Prepare equipment files for GMP inspection review.',
    ],
    modules: [
      {
        title: 'Design Qualification (DQ)',
        lessons: [
          lesson('Purpose and scope', { duration: '9 min', isPreview: true }),
          lesson("User's Responsibility: Intended use, Make/Model selection", { duration: '13 min' }),
          lesson('Vendor qualification process', { duration: '12 min' }),
          lesson("Manufacturer's Responsibility: Documentation, Consultation", { duration: '11 min' }),
          lesson('USP and EU GMP Annex 15 requirements', { duration: '15 min' }),
        ],
      },
      {
        title: 'Installation Qualification (IQ)',
        lessons: [
          lesson('Pre-installation checklist', { duration: '9 min' }),
          lesson('Comparing instrument with Purchase Order', { duration: '10 min' }),
          lesson('Checking for damage, completeness of documents', { duration: '12 min' }),
          lesson('Verifying environmental conditions', { duration: '11 min' }),
          lesson('Installation procedure and documentation', { duration: '14 min' }),
        ],
      },
      {
        title: 'Operation Qualification (OQ)',
        lessons: [
          lesson('Linking OQ to equipment location', { duration: '10 min' }),
          lesson('Re-qualification on location change', { duration: '11 min' }),
          lesson('Setting time intervals and acceptance criteria', { duration: '14 min' }),
          lesson('Functional testing and use familiarization', { duration: '13 min' }),
          lesson('Ensuring document completeness', { duration: '9 min' }),
        ],
      },
      {
        title: 'Performance Qualification (PQ)',
        lessons: [
          lesson('Demonstrating consistent performance over lifecycle', { duration: '15 min' }),
          lesson('SOP development for calibration', { duration: '12 min' }),
          lesson('Periodic calibration procedures', { duration: '11 min' }),
          lesson('Error detection, recording, and handling', { duration: '13 min' }),
        ],
      },
      {
        title: 'Maintenance Qualification (MQ)',
        lessons: [
          lesson('Ongoing maintenance requirements', { duration: '10 min' }),
          lesson('Selecting service providers', { duration: '9 min' }),
          lesson('Defining maintenance schedules', { duration: '12 min' }),
          lesson('Functional checks and cleaning frequency', { duration: '11 min' }),
          lesson('Service contact agreements', { duration: '8 min' }),
        ],
      },
    ],
  },
  {
    id: 'smoke-study-validation',
    slug: 'smoke-study-validation',
    title: 'Smoke Study: Airflow Visualization',
    shortDesc: 'Sterile-area smoke studies, HVAC controls, visual recording, and QA oversight.',
    description:
      'Master airflow visualization studies in sterile pharmaceutical environments, from HVAC design to QA responsibilities and regulatory compliance.',
    thumbnail:
      '/smoke-study-thumbnail.png',
    instructor: 'Harish Singh',
    level: 'Advanced',
    priceInr: 1999,
    published: true,
    whatYouWillLearn: [
      'Plan smoke studies for cleanrooms, isolators, and LAF workstations.',
      'Assess airflow against Grade A and pressure differential expectations.',
      'Capture defensible video evidence for inspection packages.',
      'Document QA oversight, deviations, and corrective actions.',
    ],
    modules: [
      {
        title: 'Introduction to Smoke Studies',
        lessons: [
          lesson('Definition: Airflow visualization in sterile environments', { duration: '9 min', isPreview: true }),
          lesson('Regulatory basis and importance', { duration: '12 min' }),
          lesson('Applications: Cleanrooms, isolators, LAF workstations', { duration: '13 min' }),
        ],
      },
      {
        title: 'Engineering Design & Controls',
        lessons: [
          lesson('HVAC system design requirements (240-400 ACH for Grade A)', { duration: '15 min' }),
          lesson('Pressure differentials between cleanroom grades (10-15 Pa)', { duration: '12 min' }),
          lesson('HEPA filter positioning', { duration: '10 min' }),
          lesson('Laminar Airflow (LAF) unit validation (0.45 m/s +/-20%)', { duration: '14 min' }),
          lesson('Cleanroom layout and obstruction avoidance', { duration: '11 min' }),
        ],
      },
      {
        title: 'Equipment & Setup',
        lessons: [
          lesson('Smoke generation: WFI-based foggers, sterile water vapor', { duration: '12 min' }),
          lesson('Avoiding glycerin/oil-based smoke (residue risk)', { duration: '9 min' }),
          lesson('Video recording: Camera placement, dark backgrounds, multi-angle', { duration: '13 min' }),
          lesson('Monitoring: Anemometers, particle counters, pressure gauges', { duration: '12 min' }),
        ],
      },
      {
        title: 'Manufacturing Personnel Roles',
        lessons: [
          lesson('Simulation of routine operations', { duration: '11 min' }),
          lesson('Controlled movement protocols', { duration: '9 min' }),
          lesson('Aseptic technique validation', { duration: '14 min' }),
          lesson('Training and qualification requirements', { duration: '10 min' }),
          lesson('Documentation of personnel behavior and deviations', { duration: '13 min' }),
        ],
      },
      {
        title: 'QA Responsibilities',
        lessons: [
          lesson('Protocol review and approval', { duration: '10 min' }),
          lesson('Oversight of execution', { duration: '11 min' }),
          lesson('Risk assessment and corrective actions', { duration: '13 min' }),
          lesson('Regulatory filing and documentation', { duration: '12 min' }),
        ],
      },
    ],
  },
  {
    id: 'csa-guidelines-fda-audits',
    slug: 'csa-guidelines-fda-audits',
    title: 'Implementation of CSA Guidelines & FDA Audits',
    shortDesc: 'Practical computer software assurance rollout for FDA inspection readiness.',
    description:
      'Practical guidance on implementing Computer Software Assurance guidelines and preparing for future FDA authority audits.',
    thumbnail:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=60',
    instructor: 'Harish Singh',
    level: 'Intermediate',
    priceInr: 0,
    published: true,
    whatYouWillLearn: [
      'Distinguish CSA from traditional CSV in quality activities.',
      'Start CSA adoption from existing system controls.',
      'Pilot low-risk activities before broad rollout.',
      'Prepare teams for changing FDA inspection expectations.',
    ],
    modules: [
      {
        title: 'Introduction to CSA',
        lessons: [
          lesson('Context of CSA vs. traditional CSV', { duration: '9 min', isPreview: true }),
          lesson('Common implementation questions', { duration: '11 min' }),
          lesson('Flexibility of FDA authority audits', { duration: '10 min' }),
          lesson('Importance of understanding quality activity context', { duration: '12 min' }),
        ],
      },
      {
        title: 'Implementation Strategy',
        lessons: [
          lesson('Assessing current activities and controls', { duration: '12 min' }),
          lesson('Starting with existing processes for computer systems', { duration: '13 min' }),
          lesson('Identifying necessary tools and resources', { duration: '10 min' }),
          lesson('Piloting small projects before broader rollout', { duration: '11 min' }),
          lesson('Gradual adaptation and practice refinement', { duration: '12 min' }),
        ],
      },
      {
        title: "FDA's Internal Progress",
        lessons: [
          lesson("FDA's adaptation of inspection models", { duration: '10 min' }),
          lesson('Integration of CSA into FDA practices', { duration: '11 min' }),
          lesson('Dissemination of information and internal training', { duration: '12 min' }),
          lesson('Anticipated guidance releases', { duration: '9 min' }),
          lesson('Feedback from FDA investigators', { duration: '10 min' }),
        ],
      },
      {
        title: 'Collaboration & Support',
        lessons: [
          lesson('Seeking external expertise', { duration: '9 min' }),
          lesson('Agency support mechanisms', { duration: '10 min' }),
          lesson('Reviewing proposed changes', { duration: '11 min' }),
          lesson('Ongoing dialogue and stakeholder engagement', { duration: '12 min' }),
        ],
      },
    ],
  },
];

export function getCourseBySlug(slug) {
  return courses.find((course) => course.slug === slug);
}

export function getLessonCount(course) {
  if (!course || !Array.isArray(course.modules)) return 0;
  return course.modules.reduce((total, module) => total + (Array.isArray(module.lessons) ? module.lessons.length : 0), 0);
}

export function getModuleCount(course) {
  if (!course || !Array.isArray(course.modules)) return 0;
  return course.modules.length;
}

export function getLessonById(course, lessonId) {
  if (!course || !Array.isArray(course.modules)) return null;
  const allLessons = course.modules.flatMap((module, moduleIndex) =>
    Array.isArray(module.lessons) ? module.lessons.map((lessonItem, lessonIndex) => ({
      ...lessonItem,
      id: lessonItem.id || makeLessonId(module.title, lessonIndex),
      moduleTitle: module.title,
      moduleIndex,
      lessonIndex,
    })) : []
  );

  return allLessons.find((lessonItem) => lessonItem.id === lessonId) ?? allLessons[0];
}

export function makeLessonId(moduleTitle, lessonIndex) {
  return `${moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lessonIndex}`;
}
