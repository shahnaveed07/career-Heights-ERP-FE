import { useState, useMemo } from 'react';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Users,
  MapPin,
  Phone,
  Mail,
  Award,
  ChevronRight,
  Clock,
  Building2,
  ClipboardList,
  Search,
  FileCheck,
  Send,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

export const PublicHomeView = ({ onOpenLogin, onSelectPublicPage, initialPage = 'home' }) => {
  const {
    branches,
    wings,
    classes,
    batches,
    subjects,
    subjectCombos,
    employees,
    tests,
    testResults,
  } = useErpData();

  const [activePage, setActivePage] = useState(initialPage);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [enquiryForm, setEnquiryForm] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    courseInterest: 'Pre-Medical (NEET)',
    branchChoice: 'b-hdw',
    message: '',
  });
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Distinct courses derived from Wings & Classes
  const coursesList = useMemo(() => {
    return [
      {
        id: 'course-neet',
        name: 'Pre-Medical (NEET) Stream',
        subtitle: 'Intensive Medical Entrance Coaching',
        targetClasses: 'Class 11, Class 12 & Repeater Batches',
        wingName: 'Pre-Medical Wing',
        subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
        description:
          'Rigorous conceptual grounding in NCERT syllabus and entrance test problem-solving techniques, with high-frequency OMR tests and daily performance evaluation.',
        highlight: 'Class 11 & 12 Batches Available',
        badgeColor: 'emerald',
      },
      {
        id: 'course-jee',
        name: 'Engineering (JEE) Stream',
        subtitle: 'JEE Main & Advanced Preparation',
        targetClasses: 'Class 11 & Class 12 Batches',
        wingName: 'Engineering Wing',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        description:
          'Comprehensive module covering core mechanics, calculus, organic synthesis, and test speed-building designed for competitive engineering aspirations.',
        highlight: 'Focus on Analytical Problem Solving',
        badgeColor: 'blue',
      },
      {
        id: 'course-foundation',
        name: 'Foundation & Secondary Classes',
        subtitle: 'Class 9 & 10 Conceptual Strengthening',
        targetClasses: 'Secondary Grades (Classes 9 & 10)',
        wingName: 'Foundation Wing',
        subjects: ['Mathematics', 'Science (Phy/Chem/Bio)', 'English'],
        description:
          'Strengthening fundamental concepts in secondary school science and mathematics, building a solid base before transition into senior secondary competitive streams.',
        highlight: 'Board Exams + Olympiad Foundation',
        badgeColor: 'indigo',
      },
      {
        id: 'course-science-composite',
        name: 'Integrated Science Composite',
        subtitle: 'Comprehensive Board + Entrance Dual Track',
        targetClasses: 'Classes 11 & 12 Science',
        wingName: 'Integrated Science Wing',
        subjects: ['Physics', 'Chemistry', 'Mathematics / Biology'],
        description:
          'Structured syllabus coverage aligned with J&K State Board and CBSE guidelines while integrating objective competitive test practice modules.',
        highlight: 'Available at Branch Campuses',
        badgeColor: 'amber',
      },
    ];
  }, []);

  // Filtered Batches
  const displayedBatches = useMemo(() => {
    if (selectedBranchFilter === 'all') return batches;
    return batches.filter((b) => b.branchId === selectedBranchFilter);
  }, [batches, selectedBranchFilter]);

  // Actual Faculty derived from staff data (Academic department)
  const facultyMembers = useMemo(() => {
    return employees
      .filter((emp) => emp.department === 'Academic' || emp.role === 'faculty')
      .slice(0, 8);
  }, [employees]);

  // Actual verified tests in the institute
  const recentTests = useMemo(() => {
    return tests.slice(0, 4);
  }, [tests]);

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    if (!enquiryForm.studentName || !enquiryForm.phone) return;
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setEnquiryForm({
        studentName: '',
        parentName: '',
        phone: '',
        courseInterest: 'Pre-Medical (NEET)',
        branchChoice: 'b-hdw',
        message: '',
      });
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Public Sticky Navigation */}
      <PublicNavbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenLogin={onOpenLogin}
        branches={branches}
      />

      {/* Main Public Content area */}
      <main className="flex-1">
        {/* ======================================================== */}
        {/* SECTION 1: HERO SECTION                                 */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading and Core Messaging */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-900/50 px-3.5 py-1.5 text-xs text-blue-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold tracking-wide">
                    Academic Year Admissions Open · Kashmir Centers
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                    Dedicated Coaching &amp; Academic Rigor in{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
                      Kashmir.
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                    Career Heights provides disciplined classroom coaching, regular
                    test evaluations, and structured mentoring for Pre-Medical (NEET),
                    Engineering (JEE), and Secondary Foundation students across our
                    five regional branch campuses.
                  </p>
                </div>

                {/* Primary CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleNavigate('courses')}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-900/40 transition"
                  >
                    <span>Explore Courses</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleNavigate('contact')}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                  >
                    <span>Enquire for Admission</span>
                  </button>
                </div>

                {/* Regional Campuses Strip */}
                <div className="pt-6 border-t border-slate-800/80">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                    Active Regional Campuses:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBranchFilter(b.id);
                          handleNavigate('branches');
                        }}
                        className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-blue-500/50 hover:text-white transition flex items-center gap-1.5"
                      >
                        <MapPin className="h-3 w-3 text-blue-400" />
                        <span>{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Educational Visual Dossier */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white font-black">
                        CH
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Career Heights Academic Structure
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Classroom Hierarchy &amp; Oversight
                        </p>
                      </div>
                    </div>
                    <span className="rounded bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 text-[10px] font-bold text-blue-300 uppercase">
                      5 Branches
                    </span>
                  </div>

                  {/* Flow representation */}
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Pre-Medical (NEET) Wing
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Physics · Chemistry · Botany · Zoology
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Classes 11 &amp; 12
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950 text-blue-400 border border-blue-800/40">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Engineering (JEE) Wing
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Physics · Chemistry · Advanced Mathematics
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        Classes 11 &amp; 12
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Foundation &amp; Olympiad Wing
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Core Science, Mathematics &amp; English
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        Classes 9 &amp; 10
                      </span>
                    </div>
                  </div>

                  {/* Operational verification metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3 text-center">
                      <span className="text-xs font-bold text-slate-200 block">
                        OMR Testing
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Periodic diagnostic pattern
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3 text-center">
                      <span className="text-xs font-bold text-slate-200 block">
                        Parent Reporting
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Biometric &amp; test logs
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-900/40 bg-blue-950/40 p-3 flex items-center justify-between">
                    <div className="text-xs text-blue-200">
                      Already an enrolled student or guardian?
                    </div>
                    <button
                      onClick={onOpenLogin}
                      className="text-xs font-bold text-white underline hover:text-blue-300"
                    >
                      Login to ERP &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: ACADEMIC HIERARCHY EXPLAINER                 */}
        {/* ======================================================== */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Institutional Academic Structure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                How Academic Programs are Organized
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Career Heights organizes coursework systematically from branch campus down to individual student enrollments.
              </p>
            </div>

            {/* Hierarchy visual diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <span className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-900 font-black">1</span>
                  Branch Campus
                </div>
                <h4 className="text-sm font-bold text-slate-900">Regional Centers</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  5 physical locations with classrooms, faculty rooms, and examination facilities.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <span className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-900 font-black">2</span>
                  Academic Class
                </div>
                <h4 className="text-sm font-bold text-slate-900">Grade Level</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Curriculum aligned to student school grade: Class 9, Class 10, Class 11, Class 12.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <span className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-900 font-black">3</span>
                  Academic Wing
                </div>
                <h4 className="text-sm font-bold text-slate-900">Stream Specialization</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Medical (NEET), Engineering (JEE), and Foundation &amp; Olympiad Wings.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <span className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-900 font-black">4</span>
                  Class Batch
                </div>
                <h4 className="text-sm font-bold text-slate-900">Scheduled Cohort</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Fixed lecture timings, designated faculty mentor, and classroom assignment.
                </p>
              </div>

              <div className="rounded-xl border border-blue-300 bg-blue-50/70 p-4 relative">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <span className="h-5 w-5 rounded-md bg-blue-900 flex items-center justify-center text-white font-black">5</span>
                  Subject Combos
                </div>
                <h4 className="text-sm font-bold text-blue-950">Student Enrollment</h4>
                <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                  Tailored packages (e.g. PCB, PCM, or individual subject enrollment).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: COURSES OFFERED                               */}
        {/* ======================================================== */}
        <section id="courses" className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  Curriculum &amp; Programs
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  Academic Courses &amp; Streams
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  Targeted classroom programs designed for competitive entrance exams and board mastery.
                </p>
              </div>

              <button
                onClick={() => handleNavigate('batches')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700"
              >
                <span>View All Active Batches</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coursesList.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-blue-100 text-blue-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {course.wingName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {course.targetClasses}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-950">
                      {course.name}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                        Subjects Covered:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {course.subjects.map((sub) => (
                          <span
                            key={sub}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{course.highlight}</span>
                    </div>
                    <button
                      onClick={() => {
                        setEnquiryForm((prev) => ({
                          ...prev,
                          courseInterest: course.name,
                        }));
                        handleNavigate('contact');
                      }}
                      className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition"
                    >
                      Enquire for Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: ACTIVE BATCHES                                */}
        {/* ======================================================== */}
        <section id="batches" className="py-16 bg-white border-t border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  Classroom Cohorts
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  Active Batches &amp; Timings
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Scheduled classroom cohorts across our branch network. Select a campus to inspect timings.
                </p>
              </div>

              {/* Branch filter tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedBranchFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedBranchFilter === 'all'
                      ? 'bg-white text-blue-950 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Campuses
                </button>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranchFilter(b.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedBranchFilter === b.id
                        ? 'bg-white text-blue-950 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Batches Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 shadow-2xs hover:bg-white hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900">
                      {batch.branchName} Campus
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {batch.code}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-950">
                      Batch {batch.name}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {batch.className}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Timings:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {batch.timing || 'Morning Session'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        Mentor:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {batch.facultyMentor || 'Assigned Faculty'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        Room:
                      </span>
                      <span className="font-medium text-slate-700">
                        {batch.roomNumber || 'Main Lecture Hall'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEnquiryForm((prev) => ({
                        ...prev,
                        branchChoice: batch.branchId,
                        message: `Inquiring about seat availability in Batch ${batch.name} (${batch.className} at ${batch.branchName}).`,
                      }));
                      handleNavigate('contact');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 transition"
                  >
                    Enquire for this Batch
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: WHY CAREER HEIGHTS                           */}
        {/* ======================================================== */}
        <section id="about" className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Institute Pedagogy
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                Our Educational Approach
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                A disciplined academic environment focused on syllabus completion, regular testing, and student accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Structured Syllabus Delivery
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lectures follow an organized chapter-wise timeline with Daily Practice Problem (DPP) assignments, ensuring comprehensive NCERT and competitive depth.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Periodic Diagnostic OMR Tests
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Regular offline minor and major tests conducted on standardized OMR sheets to train students for real exam timing, negative marking, and accuracy.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Doubt Resolution &amp; Faculty Mentoring
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Subject-specific doubt clearing hours enable students to resolve individual conceptual gaps directly with their classroom teachers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Transparent Parent Communication
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daily attendance logs, test performance scorecards, and fee installment transparency accessible to parents via the ERP portal and SMS updates.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Regional Campus Accessibility
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students across Handwara, Qaziabad, Dangiwacha, Kalambad, and Unso can access high-quality faculty coaching without long daily inter-district commutes.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  CHTQ Merit Scholarship Scheme
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Career Heights Talent Quest (CHTQ) test identifies deserving local students for fee concessions and academic assistance based on merit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: ACADEMIC PROGRESS & TESTS (RESULTS)          */}
        {/* ======================================================== */}
        <section id="results" className="py-16 bg-white border-t border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Evaluation &amp; Progress
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                Academic Progress &amp; Examination System
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Objective assessment through periodic Minor and Grand Diagnostic tests evaluated using standardized OMR scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Test Conduct Schedules */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Conducted Institute Tests &amp; Scorecards
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Verified ERP Examination Records
                  </span>
                </div>

                <div className="space-y-3">
                  {recentTests.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-xs font-bold text-slate-950">
                          {t.title}
                        </span>
                        <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-mono font-bold self-start">
                          Date: {t.testDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>Course: <strong className="text-slate-700">{t.course}</strong></span>
                        <span>•</span>
                        <span>Campus: <strong className="text-slate-700">{t.branchName}</strong></span>
                        <span>•</span>
                        <span>Total Marks: <strong className="text-slate-700">{t.totalMarks}</strong></span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-emerald-700 font-semibold">
                          Top Batch Score: {t.topScore} / {t.totalMarks}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Duration: {t.durationMinutes} mins (OMR)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Tracking Callout */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-2xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-blue-950">
                    Individual Student Dossier
                  </h3>
                  <p className="text-xs text-blue-900/80 leading-relaxed">
                    Career Heights ERP records detailed subject-wise marks, institute rank, percentile standings, and weak topic analytics for every test taken by a student.
                  </p>
                  <ul className="space-y-2 text-xs text-blue-950">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0" />
                      <span>Instant OMR score publishing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0" />
                      <span>Subject-wise weak topic identification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-700 shrink-0" />
                      <span>Batch and Institute rank comparison</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-blue-200/80">
                  <p className="text-[11px] text-blue-800 mb-2">
                    Enrolled students can view their scorecards in the portal:
                  </p>
                  <button
                    onClick={onOpenLogin}
                    className="w-full rounded-xl bg-blue-900 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition"
                  >
                    Login to Student Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: FACULTY MENTORS                               */}
        {/* ======================================================== */}
        <section id="faculty" className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Academic Mentorship
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                Faculty &amp; Teaching Staff
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Subject specialist educators conducting classroom sessions and mentor guidance across our branch centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facultyMembers.map((fac) => (
                <div
                  key={fac.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center space-y-3"
                >
                  <img
                    src={fac.photo}
                    alt={fac.name}
                    className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-slate-100 shadow-2xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">
                      {fac.name}
                    </h4>
                    <p className="text-xs font-semibold text-blue-900 mt-0.5">
                      {fac.designation}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {fac.branchName} Center
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-700">
                      {fac.qualifications}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 8: BRANCHES (CAMPUSES)                           */}
        {/* ======================================================== */}
        <section id="branches" className="py-16 bg-white border-t border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Campus Locations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                Our 5 Regional Branch Campuses
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Standardized academic operations, administrative assistance, and classrooms at each center in Jammu &amp; Kashmir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs hover:bg-white hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-900 text-white font-bold text-xs">
                        CH
                      </span>
                      <h3 className="text-base font-bold text-slate-950">
                        {b.name} Campus
                      </h3>
                    </div>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                      <span>{b.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-700 shrink-0" />
                      <span>{b.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-700 shrink-0" />
                      <span>{b.email}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Center Head: <strong className="text-slate-800">{b.headFaculty}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEnquiryForm((prev) => ({
                        ...prev,
                        branchChoice: b.id,
                      }));
                      handleNavigate('contact');
                    }}
                    className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition"
                  >
                    Contact {b.name} Desk
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 9: DIGITAL EXPERIENCE (STUDENT + PARENT ERP)     */}
        {/* ======================================================== */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Digital Infrastructure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                Connected Experience for Students &amp; Guardians
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Our centralized ERP platform connects classroom learning with transparent parental oversight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student Experience */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Enrolled Student Portal
                    </h3>
                    <p className="text-xs text-slate-400">
                      Self-service academic management
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Check daily biometric attendance &amp; lecture logs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Access class timetable, room numbers, and mentor notices</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>View test answer keys, OMR scorecards, and percentile rankings</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Inspect enrolled subject combinations and study modules</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Download fee payment receipts and installment ledger</span>
                  </li>
                </ul>

                <div className="pt-3">
                  <button
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                  >
                    <span>Login to Student Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Parent Experience */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Parent &amp; Guardian Oversight
                    </h3>
                    <p className="text-xs text-slate-400">
                      Transparent updates on student progress
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Instant attendance updates and absence notifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Examination performance analysis and rank reports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Fee schedule reminders and payment confirmations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Direct phone contact with assigned batch counselor</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Support for parents with multiple enrolled wards</span>
                  </li>
                </ul>

                <div className="pt-3">
                  <button
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
                  >
                    <span>Access Parent Oversight</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 10: ADMISSIONS & ENQUIRY CONTACT FORM            */}
        {/* ======================================================== */}
        <section id="contact" className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Contact Information */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    Admissions &amp; Enquiries
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                    Visit or Contact Career Heights
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Have questions about courses, seat availability, or fee schedules? Reach our admissions desk or leave an enquiry below.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Central Admissions Office (HQ)
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-slate-700">
                      <MapPin className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
                      <div>
                        <strong>Handwara Central Campus</strong>
                        <p className="text-slate-500 text-[11px]">
                          Campus Tower, Main Chowk, Handwara, J&amp;K
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone className="h-4 w-4 text-blue-900 shrink-0" />
                      <div>
                        <strong>Helpline: +91 94190 12001</strong>
                        <p className="text-slate-500 text-[11px]">
                          Monday to Saturday, 08:30 AM to 05:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-700">
                      <Mail className="h-4 w-4 text-blue-900 shrink-0" />
                      <div>
                        <strong>Email: contact@careerheights.demo</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950">
                  <span className="font-bold block mb-1">CHTQ Scholarship Test:</span>
                  Students seeking merit concessions can sit for the periodic Career Heights Talent Quest (CHTQ) test at any branch center.
                </div>
              </div>

              {/* Enquiry Form */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                  <h3 className="text-lg font-bold text-slate-950 mb-1">
                    Submit an Admission Enquiry
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Our academic counselor will contact you with batch schedules and subject combination details.
                  </p>

                  {enquirySuccess ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                      <h4 className="text-sm font-bold text-emerald-950">
                        Enquiry Submitted Successfully
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Thank you for your interest. A Career Heights academic counselor will call your provided number shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Student Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Danish Ahmad"
                            value={enquiryForm.studentName}
                            onChange={(e) =>
                              setEnquiryForm({
                                ...enquiryForm,
                                studentName: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Parent / Guardian Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ghulam Hassan"
                            value={enquiryForm.parentName}
                            onChange={(e) =>
                              setEnquiryForm({
                                ...enquiryForm,
                                parentName: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 94190 XXXXX"
                            value={enquiryForm.phone}
                            onChange={(e) =>
                              setEnquiryForm({
                                ...enquiryForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Preferred Branch Campus
                          </label>
                          <select
                            value={enquiryForm.branchChoice}
                            onChange={(e) =>
                              setEnquiryForm({
                                ...enquiryForm,
                                branchChoice: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none bg-white"
                          >
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name} Campus
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Course of Interest
                        </label>
                        <select
                          value={enquiryForm.courseInterest}
                          onChange={(e) =>
                            setEnquiryForm({
                              ...enquiryForm,
                              courseInterest: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none bg-white"
                        >
                          <option value="Pre-Medical (NEET)">Pre-Medical (NEET) Stream</option>
                          <option value="Engineering (JEE)">Engineering (JEE) Stream</option>
                          <option value="Foundation & Secondary (Class 9 & 10)">
                            Foundation &amp; Secondary (Class 9 &amp; 10)
                          </option>
                          <option value="Integrated Science Composite">
                            Integrated Science Composite
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Additional Query / Current Class
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Provide details about your current school grade or specific subject requirements..."
                          value={enquiryForm.message}
                          onChange={(e) =>
                            setEnquiryForm({
                              ...enquiryForm,
                              message: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-900 py-3 text-xs font-bold text-white hover:bg-blue-800 transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit Admission Enquiry</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <PublicFooter
        onNavigate={handleNavigate}
        onOpenLogin={onOpenLogin}
        branches={branches}
      />
    </div>
  );
};
