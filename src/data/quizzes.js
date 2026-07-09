export const quizzes = {
  'oos-investigation': [
    {
      question: "Which of the following is the first action to take upon obtaining an Out-of-Specification (OOS) result?",
      options: [
        "Immediately discard the sample and start a retest.",
        "Initiate a documented laboratory investigation to rule out lab error.",
        "Report the batch as rejected to regulatory authorities.",
        "Adjust instrument parameters and run the same sample again."
      ],
      answerIndex: 1,
      explanation: "Per FDA guidelines, the first step is to initiate a Phase I laboratory investigation to confirm the validity of the testing and rule out laboratory error before any retesting is conducted."
    },
    {
      question: "When is it appropriate to utilize 'averaging' of OOS and retest results?",
      options: [
        "To mask individual failing results and pass the batch.",
        "Only when the test method specifically calls for averaging (e.g., microbiological assays) and is scientifically justified.",
        "Whenever you have more passing results than failing ones.",
        "For all chemical assays to minimize variance."
      ],
      answerIndex: 1,
      explanation: "Averaging OOS and passing retest results to hide failing values is a major GMP violation. It is only permitted if the official test method is designed around an average (e.g., specific biological assays)."
    },
    {
      question: "During root cause analysis, which tool is best suited for visual mapping of potential variables?",
      options: [
        "A Gantt Chart.",
        "Fishbone (Ishikawa) Diagram.",
        "A line graph of raw data.",
        "Prisma Database model."
      ],
      answerIndex: 1,
      explanation: "A Fishbone (Ishikawa) diagram organizes potential causes into categories (Man, Machine, Material, Method, Measurement, Mother Nature) to facilitate brainstorming."
    },
    {
      question: "What does CAPA stand for in compliance environments?",
      options: [
        "Corrective Action and Preventive Action.",
        "Compliance Assessment and Product Analysis.",
        "Computer-System Assurance and Audit Protocol.",
        "Control Activity and Performance Audit."
      ],
      answerIndex: 0,
      explanation: "CAPA stands for Corrective Action (to fix/contain the current issue) and Preventive Action (to prevent recurrence in the future)."
    },
    {
      question: "If a Phase I investigation does not identify a clear laboratory error, what is the next step?",
      options: [
        "Release the batch immediately.",
        "Escalate to a Phase II full manufacturing investigation.",
        "Retest the sample until a passing result is obtained.",
        "Delete the audit trail entry."
      ],
      answerIndex: 1,
      explanation: "If no lab error is found in Phase I, a Phase II investigation must be initiated to inspect manufacturing processes, materials, and equipment."
    }
  ],
  'equipment-qualification': [
    {
      question: "Which phase of qualification focuses on verifying that the instrument is installed according to purchase order specs and vendor guidelines?",
      options: [
        "Design Qualification (DQ)",
        "Installation Qualification (IQ)",
        "Operational Qualification (OQ)",
        "Performance Qualification (PQ)"
      ],
      answerIndex: 1,
      explanation: "Installation Qualification (IQ) checks that the physical space, utilities, and components match purchase orders and vendor drawings."
    },
    {
      question: "Under what condition must an Operational Qualification (OQ) be repeated?",
      options: [
        "Every single day before running a sample.",
        "When the instrument is physically relocated to another laboratory room.",
        "Only when the manufacturer goes out of business.",
        "When a new analyst joins the lab."
      ],
      answerIndex: 1,
      explanation: "Moving equipment to a new location can impact functional calibration and alignments, requiring a relocation-based re-qualification (IQ/OQ)."
    },
    {
      question: "What is the primary objective of Performance Qualification (PQ)?",
      options: [
        "To select the cheapest supplier.",
        "To prove the instrument performs consistently under routine production load over its lifecycle.",
        "To document the shipping crate dimensions.",
        "To run vendor-specific self-diagnostics."
      ],
      answerIndex: 1,
      explanation: "Performance Qualification (PQ) verifies that the system works reliably and consistently under actual operating conditions over time."
    },
    {
      question: "What does DQ stand for in the equipment validation lifecycle?",
      options: [
        "Database Query.",
        "Design Qualification.",
        "Deviation Quantity.",
        "Data Quality."
      ],
      answerIndex: 1,
      explanation: "Design Qualification (DQ) is the documented verification that the proposed design of the equipment is suitable for its intended purpose."
    },
    {
      question: "What is the role of Maintenance Qualification (MQ)?",
      options: [
        "To establish maintenance, calibration schedules, and cleaning routines to maintain qualified state.",
        "To replace the equipment every 12 months.",
        "To avoid documentation steps.",
        "To audit vendor financial statements."
      ],
      answerIndex: 0,
      explanation: "Maintenance Qualification (MQ) defines ongoing preventive maintenance parameters, schedules, and service agreements to prevent degradation of performance."
    }
  ],
  'smoke-study-validation': [
    {
      question: "What is the standard regulatory range for Air Changes per Hour (ACH) in a Grade A cleanroom environment?",
      options: [
        "5 to 10 ACH.",
        "20 to 40 ACH.",
        "240 to 400 ACH.",
        "Over 1,000 ACH."
      ],
      answerIndex: 2,
      explanation: "Grade A cleanroom environments require unidirectional airflow with high air turnover, typically between 240 and 400 ACH to keep particle levels low."
    },
    {
      question: "Why is glycerin or oil-based smoke avoided during airflow visualization studies?",
      options: [
        "It doesn't show up on video cameras.",
        "It leaves residues that compromise sterile area cleanliness.",
        "It is too expensive to purchase.",
        "It rises too quickly due to heat."
      ],
      answerIndex: 1,
      explanation: "Glycerin and oil-based fogs leave residue on surfaces and HEPA filters, risking contamination. Water-for-injection (WFI) foggers are preferred."
    },
    {
      question: "What velocity should a laminar airflow (LAF) unit maintain in Grade A zones?",
      options: [
        "0.10 m/s ± 20%",
        "0.45 m/s ± 20%",
        "1.50 m/s ± 20%",
        "5.00 m/s ± 20%"
      ],
      answerIndex: 1,
      explanation: "FDA and EU Annex 1 guidelines recommend a working homogeneous air velocity of 0.45 m/s (90 fpm) ± 20% in unidirectional airflow systems."
    },
    {
      question: "During a smoke study, what state must the cleanroom be in to simulate actual risk?",
      options: [
        "Completely empty with all HVAC systems turned off.",
        "Both 'at-rest' and 'operational' states (simulating routine manual operations and interventions).",
        "During maintenance shutdowns only.",
        "Only when no personnel are present."
      ],
      answerIndex: 1,
      explanation: "A smoke study must document both 'at-rest' and 'operational' conditions (with personnel simulating actual interventions) to prove airflow keeps contamination away from products."
    },
    {
      question: "What is the pressure differential standard between cleanrooms of different grades?",
      options: [
        "0 to 2 Pa.",
        "10 to 15 Pa.",
        "100 to 150 Pa.",
        "Pressures must be identical."
      ],
      answerIndex: 1,
      explanation: "To prevent backflow of contaminated air, a positive pressure differential of 10 to 15 Pascals is standard between adjacent rooms of different grades."
    }
  ],
  'csa-guidelines-fda-audits': [
    {
      question: "What is the core philosophy of Computer Software Assurance (CSA) compared to Computer System Validation (CSV)?",
      options: [
        "CSA completely eliminates the need for any testing.",
        "CSA focuses on critical risk-based assurance rather than excessive, non-value-added documentation.",
        "CSA is only used for hardware components.",
        "CSA is a European standard not recognized by the USFDA."
      ],
      answerIndex: 1,
      explanation: "CSA shifts the focus from writing pages of formal documentation to testing critical functions based on risk, streamlining computerized compliance."
    },
    {
      question: "In a CSA framework, which systems receive the highest testing scrutiny?",
      options: [
        "All systems are tested equally.",
        "High-risk systems that directly impact product quality and patient safety.",
        "Low-risk office productivity applications.",
        "Systems that have the shortest vendor manuals."
      ],
      answerIndex: 1,
      explanation: "CSA advocates for a risk-based approach where systems directly affecting product safety/efficacy receive rigorous testing, while low-risk systems use vendor validation or unscripted testing."
    },
    {
      question: "What is 'unscripted testing' in the context of CSA guidelines?",
      options: [
        "Testing without any record or result logging.",
        "Testing focusing on user scenarios without writing detailed step-by-step test instructions beforehand.",
        "Testing performed by automated bots only.",
        "An invalid GMP testing methodology."
      ],
      answerIndex: 1,
      explanation: "Unscripted testing allows qualified testers to explore and verify software functionality based on a test objective, rather than following rigid, predefined scripts."
    },
    {
      question: "Which of the following is a recommended starting point for transitioning from CSV to CSA?",
      options: [
        "Scraping all quality systems and starting from scratch.",
        "Assessing existing validation templates and pilot-testing CSA on a low-to-medium risk system first.",
        "Hiring a vendor to take over validation entirely.",
        "Waiting for an FDA warning letter before changing anything."
      ],
      answerIndex: 1,
      explanation: "A gradual transition is best. Assess your current controls, align your risk profiles, and run a pilot project on a low-risk system to build team experience."
    },
    {
      question: "True or False: The FDA supports and encourages the adoption of Computer Software Assurance.",
      options: [
        "False, FDA investigators will issue citations for using CSA.",
        "True, the FDA released a draft guidance in 2022 encouraging CSA to foster software innovation and quality.",
        "True, but only for medical device software, not pharmaceutical systems.",
        "False, the FDA has no stance on software validation."
      ],
      answerIndex: 1,
      explanation: "The FDA actively supports CSA (having issued draft guidance in 2022) to help manufacturers adopt modern digital tools that improve overall product safety and quality."
    }
  ]
};
