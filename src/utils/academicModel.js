/**
 * Centralized Academic Data Model & Helpers
 * 
 * Implements strict hierarchical relationships:
 * Branch → Class → Wing → Batch → Student
 * 
 * Reusable Subject Master & Subject Combo Templates.
 * Independent Student Subject Enrollment (1 or multiple subjects).
 * Teacher Teaching Assignments & Derived Student Access.
 */

// 1. REUSABLE SUBJECT MASTER
export const CANONICAL_SUBJECTS = [
  {
    id: 'sub-eng',
    name: 'English',
    code: 'ENG-101',
    category: 'Language',
    description: 'Reading Comprehension, Advanced Grammar & Technical Composition',
    color: 'violet',
  },
  {
    id: 'sub-phy',
    name: 'Physics',
    code: 'PHY-101',
    category: 'Science',
    description: 'Mechanics, Electromagnetism, Modern Physics & Wave Optics',
    color: 'blue',
  },
  {
    id: 'sub-chem',
    name: 'Chemistry',
    code: 'CHM-101',
    category: 'Science',
    description: 'Physical, Organic, and Inorganic Chemistry & Thermodynamics',
    color: 'emerald',
  },
  {
    id: 'sub-bot',
    name: 'Botany',
    code: 'BOT-101',
    category: 'Biology',
    description: 'Plant Physiology, Morphology, Genetics & Ecology',
    color: 'green',
  },
  {
    id: 'sub-zoo',
    name: 'Zoology',
    code: 'ZOO-101',
    category: 'Biology',
    description: 'Human Physiology, Animal Kingdom, Evolution & Biotechnology',
    color: 'teal',
  },
  {
    id: 'sub-math',
    name: 'Mathematics',
    code: 'MTH-101',
    category: 'Mathematics',
    description: 'Calculus, Algebra, Coordinate Geometry, Vectors & Probability',
    color: 'amber',
  },
  {
    id: 'sub-bio',
    name: 'Biology',
    code: 'BIO-101',
    category: 'Biology',
    description: 'Life Processes, Heredity & Natural Resources for Secondary Classes',
    color: 'emerald',
  },
  {
    id: 'sub-cs',
    name: 'Computer Science',
    code: 'CS-101',
    category: 'Technology',
    description: 'Python Programming, Data Structures, Boolean Logic & SQL',
    color: 'indigo',
  },
];

// 2. REUSABLE SUBJECT COMBO TEMPLATES
// A combo is a pre-configured template. Combo != final student enrollment.
export const CANONICAL_SUBJECT_COMBOS = [
  {
    id: 'combo-med',
    name: 'Medical',
    stream: 'Medical',
    code: 'COMBO-MED',
    description: 'Comprehensive 4-subject package for Medical Entrance (Physics, Chemistry, Botany, Zoology)',
    subjectIds: ['sub-phy', 'sub-chem', 'sub-bot', 'sub-zoo'],
  },
  {
    id: 'combo-eng',
    name: 'Engineering',
    stream: 'Engineering',
    code: 'COMBO-ENG',
    description: 'Intensive 3-subject package for JEE Main & Advanced (Physics, Chemistry, Mathematics)',
    subjectIds: ['sub-phy', 'sub-chem', 'sub-math'],
  },
  {
    id: 'combo-pcm-cs',
    name: 'Engineering with Computer Science',
    stream: 'Engineering',
    code: 'COMBO-PCM-CS',
    description: 'Engineering track with modern Computer Science (Physics, Chemistry, Mathematics, CS)',
    subjectIds: ['sub-phy', 'sub-chem', 'sub-math', 'sub-cs'],
  },
  {
    id: 'combo-fnd',
    name: 'Foundation',
    stream: 'Foundation',
    code: 'COMBO-FND',
    description: 'Integrated 5-subject curriculum (Physics, Chemistry, Mathematics, Biology, English)',
    subjectIds: ['sub-phy', 'sub-chem', 'sub-math', 'sub-bio', 'sub-eng'],
  },
];

// 3. HIERARCHY SELECTORS
// Branch → Class → Wing → Batch → Student

/**
 * Filter classes available in a branch.
 */
export function getClassesForBranch(classes = [], branchId = 'all') {
  if (!Array.isArray(classes)) return [];
  if (!branchId || branchId === 'all') return classes;
  return classes.filter((c) => !c.branchId || c.branchId === branchId);
}

/**
 * Filter wings for a given class & branch.
 */
export function getWingsForClass(wings = [], classId = 'all', branchId = 'all') {
  if (!Array.isArray(wings)) return [];
  return wings.filter((w) => {
    const classMatch = !classId || classId === 'all' || !w.classId || w.classId === classId;
    const branchMatch = !branchId || branchId === 'all' || !w.branchId || w.branchId === branchId;
    return classMatch && branchMatch;
  });
}

/**
 * Filter batches by branch, class, and wing.
 */
export function getBatchesByHierarchy(batches = [], { branchId, classId, wingId } = {}) {
  if (!Array.isArray(batches)) return [];
  return batches.filter((b) => {
    if (branchId && branchId !== 'all' && b.branchId !== branchId) return false;
    if (classId && classId !== 'all' && b.classId !== classId) return false;
    if (wingId && wingId !== 'all' && b.wingId !== wingId) return false;
    return true;
  });
}

/**
 * Resolves full hierarchy metadata for a batch.
 */
export function resolveBatchHierarchy(batch, { branches = [], classes = [], wings = [] } = {}) {
  if (!batch) return null;
  const branch = branches.find((b) => b.id === batch.branchId);
  const cls = classes.find((c) => c.id === batch.classId);
  const wing = wings.find((w) => w.id === batch.wingId);

  return {
    branchId: batch.branchId,
    branchName: branch?.name || batch.branchName || 'Campus',
    classId: batch.classId,
    className: cls?.name || batch.className || 'Class',
    wingId: batch.wingId,
    wingName: wing?.name || batch.wingName || 'Wing',
    batchId: batch.id,
    batchName: batch.name,
  };
}

// 4. STUDENT SUBJECT ENROLLMENT HELPERS

/**
 * Normalizes enrolled subject IDs for a student.
 * Supports students with 1 subject, 2 subjects, combo, or custom selection.
 */
export function getStudentEnrolledSubjectIds(student) {
  if (!student) return [];
  if (Array.isArray(student.enrolledSubjects)) {
    return student.enrolledSubjects;
  }
  if (Array.isArray(student.enrolledSubjectIds)) {
    return student.enrolledSubjectIds;
  }
  // Fallback to combo template if enrolledSubjects array not explicitly set
  if (student.subjectComboId) {
    const combo = CANONICAL_SUBJECT_COMBOS.find((c) => c.id === student.subjectComboId);
    if (combo) return combo.subjectIds;
  }
  return ['sub-phy']; // Default single subject
}

/**
 * Checks whether a student is enrolled in a specific subject.
 */
export function isStudentEnrolledInSubject(student, subjectId) {
  if (!student || !subjectId) return false;
  const subjectIds = getStudentEnrolledSubjectIds(student);
  return subjectIds.includes(subjectId);
}

/**
 * Resolves full subject objects for a student's enrolled subjects.
 */
export function getStudentEnrolledSubjects(student, subjectsMaster = CANONICAL_SUBJECTS) {
  const ids = getStudentEnrolledSubjectIds(student);
  return ids
    .map((id) => (subjectsMaster || CANONICAL_SUBJECTS).find((s) => s.id === id))
    .filter(Boolean);
}

// 5. TEACHER STUDENT DERIVATION
// Teacher assignment: Teacher + Branch + Class + Wing + Batch + Subject
// Teacher's students MUST be derived from:
// teacher assignment + actual student enrollment

/**
 * Derives the exact list of students a teacher is authorized to access.
 * 
 * Rules:
 * 1. SuperAdmin / HQ Admin can oversee all students in the batch.
 * 2. A Teacher only sees students enrolled in the specific batch AND enrolled in the specific subject(s)
 *    the teacher is assigned to teach for that batch.
 * 
 * @param {object} params
 * @param {string} params.teacherId - The teacher employee/user ID.
 * @param {string} [params.teacherName] - Optional fallback teacher name.
 * @param {Array} params.teacherAssignments - List of all teacher assignments.
 * @param {Array} params.students - List of students to evaluate.
 * @param {string} [params.batchId] - Target batch ID (optional).
 * @param {string} [params.subjectId] - Target subject ID (optional).
 * @param {boolean} [params.isSuperOrHq] - Whether user has executive clearance.
 * @returns {Array} Filtered list of students matching the teacher's assigned subjects.
 */
export function getStudentsForTeacher({
  teacherId,
  teacherName,
  teacherAssignments = [],
  students = [],
  batchId,
  subjectId,
  isSuperOrHq = false,
}) {
  if (!Array.isArray(students)) return [];

  // SuperAdmin and HQ Admin can see all students in the target batch
  if (isSuperOrHq) {
    if (batchId && batchId !== 'all') {
      return students.filter((s) => s.batchId === batchId);
    }
    return students;
  }

  if (!teacherId && !teacherName) return [];

  // 1. Find all teaching assignments belonging to this teacher
  const myAssignments = (teacherAssignments || []).filter((ta) => {
    const idMatch = teacherId && (ta.teacherId === teacherId || ta.userId === teacherId);
    const nameMatch =
      teacherName &&
      ta.teacherName &&
      ta.teacherName.toLowerCase() === teacherName.toLowerCase();
    return idMatch || nameMatch;
  });

  if (myAssignments.length === 0) {
    return [];
  }

  // 2. Determine target assignments (optionally filtered by batch and/or subject)
  let relevantAssignments = myAssignments;
  if (batchId && batchId !== 'all') {
    relevantAssignments = relevantAssignments.filter((ta) => ta.batchId === batchId);
  }
  if (subjectId && subjectId !== 'all') {
    relevantAssignments = relevantAssignments.filter((ta) => ta.subjectId === subjectId);
  }

  if (relevantAssignments.length === 0) {
    return [];
  }

  // 3. Build a map of batchId -> Set of subjectIds the teacher is assigned to teach in that batch
  const batchSubjectMap = new Map();
  for (const ta of relevantAssignments) {
    if (!batchSubjectMap.has(ta.batchId)) {
      batchSubjectMap.set(ta.batchId, new Set());
    }
    if (ta.subjectId) {
      batchSubjectMap.get(ta.batchId).add(ta.subjectId);
    }
  }

  // 4. A student is visible IF:
  //    - Student's batch is in batchSubjectMap, AND
  //    - Student is enrolled in at least ONE subject the teacher teaches in that specific batch.
  return students.filter((student) => {
    const assignedSubjectsInBatch = batchSubjectMap.get(student.batchId);
    if (!assignedSubjectsInBatch || assignedSubjectsInBatch.size === 0) {
      return false;
    }

    const studentEnrolledIds = getStudentEnrolledSubjectIds(student);
    for (const subId of assignedSubjectsInBatch) {
      if (studentEnrolledIds.includes(subId)) {
        return true;
      }
    }
    return false;
  });
}
