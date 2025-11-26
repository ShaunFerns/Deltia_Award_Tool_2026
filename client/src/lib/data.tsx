import { useState, useEffect, createContext, useContext } from 'react';

// --- Types ---

export interface User {
  id: string;
  name: string;
  email?: string; // Added email for user identification
  role?: string; // Added role for UI permission hints
}

export interface Programme {
  id: string;
  code: string;
  name: string;
  school?: string; // Added school
  faculty?: string;
  disciplineArea?: string;
  nfqLevel?: string;
  mode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  credits?: number;
  programme?: string; // Kept for compatibility with existing mock data, though ProgrammeModule is better
  programmeId?: string; // Added for direct navigation
  programmeName?: string; // Added for display
}

export interface ProgrammeModule {
  id: string;
  programmeId: string;
  moduleId: string;
  stage?: number; // 1, 2, 3, 4
  semester?: string; // 'autumn', 'spring', 'year_long'
  isCore?: 'core' | 'elective';
}

export interface ModuleOwner {
  id: string;
  userId: string;
  moduleId: string;
}

export interface ProgrammeChair {
  id: string;
  userId: string;
  programmeId: string;
}

export interface ProgrammeTeamMember {
  id: string;
  programmeId: string;
  academicYear?: string;
  name: string;
  role: string;
  email?: string;
  contributionFocus?: string;
  createdAt: string;
}

export interface ProgrammeProfile {
  id: string;
  programmeId: string;
  academicYear?: string;
  programmeRationale?: string;
  annualIntake?: number;
  totalEnrolmentAcrossStages?: number;
  levelsTaught: string[]; // Stored as JSON string in DB, array here for ease
  programmeVariants: string[]; // Stored as JSON string in DB, array here for ease
  teamCollaborationSummary?: string;
  studentInvolvement?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export type Category = 'strategy_capacity' | 'evidence_based' | 'design_of_learning' | 'teaching_practice' | 'assessment';

export interface Indicator {
    id: string;
    label: string;
    description: string;
}

export const CATEGORIES: { id: Category; label: string; description: string; indicators: Indicator[] }[] = [
  { 
    id: 'strategy_capacity', 
    label: 'Strategy & Capacity Building', 
    description: 'To what extent is this module informed by institutional/national policies and professional requirements?',
    indicators: [
        { id: 'sc_1', label: 'Policy Alignment', description: 'Informed by institutional/national T&L policies' },
        { id: 'sc_2', label: 'Professional Requirements', description: 'Shaped by external reviews/professional bodies' },
        { id: 'sc_3', label: 'Enhancement Planning', description: 'Planned enhancements aligned with school priorities' }
    ]
  },
  { 
    id: 'evidence_based', 
    label: 'Evidence-Based Approach', 
    description: 'Use of feedback and data to inform module design and delivery.',
    indicators: [
        { id: 'eb_1', label: 'Student Feedback', description: 'Use of formal/informal feedback' },
        { id: 'eb_2', label: 'Engagement Analytics', description: 'Analysis of engagement data' },
        { id: 'eb_3', label: 'Pedagogical Research', description: 'Informed by scholarship' }
    ]
  },
  { 
    id: 'design_of_learning', 
    label: 'Design of Learning', 
    description: 'Structure, alignment, and inclusivity of the learning experience.',
    indicators: [
        { id: 'dl_1', label: 'Constructive Alignment', description: 'Alignment of outcomes, activities, assessments' },
        { id: 'dl_2', label: 'Inclusive Design', description: 'Support for diverse learner needs' },
        { id: 'dl_3', label: 'Workload Balance', description: 'Clear communication and balance of workload' }
    ]
  },
  { 
    id: 'teaching_practice', 
    label: 'Teaching & Learning Practice', 
    description: 'Engagement, variety of approaches, and digital/blended learning.',
    indicators: [
        { id: 'tp_1', label: 'Active Learning', description: 'Strategies to engage students' },
        { id: 'tp_2', label: 'Transition Support', description: 'Support through levels of study' },
        { id: 'tp_3', label: 'Digital Enhancement', description: 'Meaningful use of digital tools' }
    ]
  },
  { 
    id: 'assessment', 
    label: 'Assessment', 
    description: 'Variety, authenticity, and quality of feedback in assessment.',
    indicators: [
        { id: 'as_1', label: 'Assessment Variety', description: 'Methods suitable for outcomes' },
        { id: 'as_2', label: 'Authentic Assessment', description: 'Relevance to real-world contexts' },
        { id: 'as_3', label: 'Feedback Quality', description: 'Timely and actionable feedback' }
    ]
  },
];

export interface Question {
  text: string;
  components: number[];
  indicatorId: string; // New: link to specific indicator
}

export const QUESTIONS: Record<Category, Question[]> = {
  strategy_capacity: [
    { text: "To what extent is this module informed by institutional or national T&L policies?", components: [1], indicatorId: 'sc_1' },
    { text: "To what extent do external reviews or professional requirements shape this module?", components: [1], indicatorId: 'sc_2' },
    { text: "To what extent do you plan enhancements for this module in line with School/Faculty priorities?", components: [1], indicatorId: 'sc_3' }
  ],
  evidence_based: [
    { text: "To what extent do you use student feedback (formal/informal) to refine this module?", components: [2], indicatorId: 'eb_1' },
    { text: "To what extent do you analyse engagement data (e.g., VLE stats, attendance) to support students?", components: [2], indicatorId: 'eb_2' },
    { text: "To what extent is the module design informed by pedagogical research or scholarship?", components: [2], indicatorId: 'eb_3' }
  ],
  design_of_learning: [
    { text: "To what extent are learning outcomes, activities, and assessments constructively aligned?", components: [3], indicatorId: 'dl_1' },
    { text: "To what extent is the module structured to support diverse learner needs (inclusivity)?", components: [3], indicatorId: 'dl_2' },
    { text: "To what extent is the workload balanced and clearly communicated to students?", components: [3], indicatorId: 'dl_3' }
  ],
  teaching_practice: [
    { text: "To what extent do you use active learning strategies to engage students?", components: [4], indicatorId: 'tp_1' },
    { text: "To what extent do you support students in transitioning to/through this level of study?", components: [4], indicatorId: 'tp_2' },
    { text: "To what extent are digital tools used meaningfully to enhance learning?", components: [4], indicatorId: 'tp_3' }
  ],
  assessment: [
    { text: "To what extent do you use a variety of assessment methods suitable for the outcomes?", components: [5], indicatorId: 'as_1' },
    { text: "To what extent are assessments designed to be authentic or relevant to real-world contexts?", components: [5], indicatorId: 'as_2' },
    { text: "To what extent is feedback provided in a timely and actionable manner?", components: [5], indicatorId: 'as_3' }
  ]
};

export type Level = 'Developing' | 'Consolidating' | 'Leading';
export type ArtefactType = 'file' | 'link' | 'note';

export interface Artefact {
  type: ArtefactType;
  content: string; // File name, URL, or Note text
}

export interface ModuleAssessment {
    id: string;
    name: string;
    type: string;
    weight: number;
    dueWeek: number;
    shared: 'yes' | 'no';
    sharedWith?: string;
    evidenceType?: ArtefactType;
    evidenceContent?: string;
    timingBand: 'early' | 'mid' | 'late';
}

export interface ModuleMetadata {
  // 3.1 Module Type & Context
  moduleTypes: string[]; // e.g. ['core', 'online_hybrid']
  teachingTeamSize: string; // 'sole', 'small_team_2_3', 'medium_team_4_6', 'large_team_7_plus'
  cohortCharacteristics: string[]; // e.g. ['mixed_level', 'mature']

  // 3.2 Assessment Profile
  assessments: ModuleAssessment[];

  // 3.3 UDL / Inclusion Indicators
  udlIndicators: string[]; // e.g. ['udl_engagement']

  // 3.4 Digital Practice Indicators
  digitalPractice: string[]; // e.g. ['vle_template']

  // 3.5 Student Feedback Signals
  studentFeedbackOverall: number; // 1-5
  studentFeedbackVolume: string; // 'minimal_0_10', ...

  // 3.6 Module Risk / Attention
  moduleRiskLevel: string; // 'no_concern', 'some_concern', 'significant_concern'
  moduleRiskReasons: string[]; // e.g. ['workload']

  // 3.7 Workload (Optional)
  teachingHoursBand?: string; // '1_2', ...
  markingHoursBand?: string; // '<10', ...

  // --- New Demo Fields for Richer Taking Stock Evidence ---
  // These fields store the text content requested for the demo
  policiesInfluencing?: string; // Component 1
  externalRequirements?: string; // Component 1
  staffDevelopmentInfluence?: string; // Component 1
  studentPartnership?: string; // Component 1
  
  evidenceSources?: string[]; // Component 2 (e.g. ['module_survey', 'focus_group'])
  changesLast3Years?: string; // Component 2
  studentFeedbackSummary?: string; // Component 2
  
  curriculumConnections?: string; // Component 3
  learningEnvironmentUse?: string; // Component 3
  
  teachingApproaches?: string[]; // Component 4 (e.g. ['pbl', 'studio'])
  transitionSupport?: string; // Component 4
  diversitySupport?: string; // Component 4
  
  authenticAssessmentRationale?: string; // Component 5
  feedbackPractices?: string; // Component 5
  selfPeerAssessment?: boolean; // Component 5
}

export interface ModuleEvaluation {
  id?: string; // Unique ID for the evaluation record itself
  userId: string;
  moduleId: string;
  academicYear: string;
  answers: Record<string, number>; // Keyed by category_index (e.g. "strategy_capacity_0")
  categoryScores: Record<Category, number>;
  categoryLevels: Record<Category, Level>;
  
  // New: Store indicator scores explicitly for easier dashboarding
  indicatorScores?: Record<string, number>; // Keyed by indicatorId (e.g. "sc_1")

  // New Fields
  evidenceSummaries: Partial<Record<Category, string>>;
  artefacts: Partial<Record<Category, Artefact>>;
  moduleHeadline?: string;
  
  // Metadata Section
  metadata?: ModuleMetadata;

  completedAt: string; // Kept for backward compatibility, effectively "last saved"
  
  // Versioning
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleEvaluationHistory {
  id: string;
  moduleEvaluationId: string;
  moduleId: string;
  versionNumber: number;
  snapshot: ModuleEvaluation;
  createdAt: string;
}

// --- Mock Data ---

export const DEMO_MODE = true;

export const TEST_USERS = [
    { username: "demo_team1", password: "delta123", role: "programme_chair", name: "Dr. Alex Rivera", id: "u1", email: "alex.rivera@uni.ac.uk" },
    { username: "demo_team2", password: "delta123", role: "module_lead", name: "Prof. Sarah Chen", id: "u2", email: "sarah.chen@uni.ac.uk" },
];

const MOCK_USER: User = {
  id: 'u1',
  name: 'Dr. Alex Rivera',
  email: 'alex.rivera@uni.ac.uk',
  role: 'programme_chair'
};

const MOCK_PROGRAMMES: Programme[] = [
    { 
        id: 'p1', 
        code: 'BA-DMED-4', 
        name: 'BA (Hons) in Digital Media', 
        school: 'School of Creative Arts',
        faculty: 'Arts & Humanities', 
        disciplineArea: 'Media', 
        nfqLevel: 'Level 8', 
        mode: 'Full-time',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

const MOCK_MODULES: Module[] = [
  { id: 'm1', code: 'CS101', name: 'Introduction to Programming', programme: 'BSc Computer Science' },
  { id: 'm2', code: 'CS305', name: 'Advanced Algorithms', programme: 'BSc Computer Science' },
  { id: 'm3', code: 'DS201', name: 'Data Visualisation', programme: 'MSc Data Science' },
  // New mock modules for Digital Media programme
  { id: 'm4', code: 'DMED1001', name: 'Intro to Digital Media', programme: 'BA (Hons) in Digital Media', credits: 5 },
  { id: 'm5', code: 'DMED2002', name: 'Digital Storytelling', programme: 'BA (Hons) in Digital Media', credits: 5 },
];

const MOCK_PROGRAMME_MODULES: ProgrammeModule[] = [
    { id: 'pm1', programmeId: 'p1', moduleId: 'm4', stage: 1, semester: 'autumn', isCore: 'core' },
    { id: 'pm2', programmeId: 'p1', moduleId: 'm5', stage: 2, semester: 'spring', isCore: 'core' }
];

const MOCK_PROGRAMME_CHAIRS: ProgrammeChair[] = [
    { id: 'pc1', userId: 'u1', programmeId: 'p1' }
];

const MOCK_MODULE_OWNERS: ModuleOwner[] = [
    { id: 'mo1', userId: 'u1', moduleId: 'm4' }
];

const MOCK_PROGRAMME_PROFILES: ProgrammeProfile[] = [
  {
    id: 'pp1',
    programmeId: 'p1',
    academicYear: '2024-25',
    programmeRationale: '',
    annualIntake: 45,
    totalEnrolmentAcrossStages: 160,
    levelsTaught: ['Level 8'],
    programmeVariants: ['Full-time'],
    teamCollaborationSummary: '',
    studentInvolvement: '',
    createdByUserId: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// --- Taking Stock Types ---

export interface TakingStockImprovement {
    id: string;
    componentId: Category;
    text: string;
    generatedBy: 'system' | 'user';
    selectedAsPriority: boolean;
    createdAt: string;
}

export interface TakingStockCategoryData {
    recommendedLevel: Level;
    selectedLevel: Level | '';
    rationaleOverride?: string;
    evidenceSummary: string[]; // Auto-populated points
    whatWeDoWell: string;
    areasForDevelopment: string; // Legacy / Fallback
    improvements: TakingStockImprovement[]; // New structured list
    updatedAt: string;
}

export interface ProgrammeTakingStock {
    id: string;
    programmeId: string;
    academicYear: string;
    
    strategy_capacity?: TakingStockCategoryData;
    evidence_based?: TakingStockCategoryData;
    design_of_learning?: TakingStockCategoryData;
    teaching_practice?: TakingStockCategoryData;
    assessment?: TakingStockCategoryData;
    
    updatedAt: string;
    createdAt: string;
}

const MOCK_PROGRAMME_TAKING_STOCK: ProgrammeTakingStock[] = [];

const MOCK_PROGRAMME_TEAM_MEMBERS: ProgrammeTeamMember[] = [
  {
    id: 'ptm1',
    programmeId: 'p1',
    academicYear: '2024-25',
    name: 'Dr. Alex Rivera',
    role: 'Programme Chair',
    email: 'alex.rivera@uni.ac.uk',
    contributionFocus: 'Overall leadership and strategy',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ptm2',
    programmeId: 'p1',
    academicYear: '2024-25',
    name: 'Prof. Sarah Chen',
    role: 'Module Lead',
    email: 'sarah.chen@uni.ac.uk',
    contributionFocus: 'Digital ethics and theory',
    createdAt: new Date().toISOString()
  }
];

// --- Action Plan Types ---

export interface ProgrammePriority {
    id: string;
    programmeId: string;
    componentId: Category;
    text: string; // The text from "Areas for Improvement"
    selected: boolean;
    generatedBy: 'system' | 'user';
    createdAt: string;
}

export interface PriorityTheme {
    id: string;
    programmeId: string;
    title: string;
    linkedPriorityIds: string[]; // IDs from ProgrammePriority
    rationale: string;
    createdAt: string;
}

export interface SmartGoal {
    id: string;
    themeId: string;
    programmeId: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
    partners: string;
    resources: string;
    risks: string;
    sustainability: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    
    // New Fields for Enhanced Gantt & Reporting
    responsibleRoles?: string; // e.g. "Module Lead", "Chair"
    dependencies?: string; // e.g. "Requires budget approval"
    milestones?: string; // e.g. "Review in Dec"
    modulesImpacted?: string; // e.g. "Stage 1 Modules", "All"
}

// --- Store Logic (LocalStorage wrapper) ---

const STORAGE_KEY = 'delta_evaluations_v4'; // Active evaluations
const HISTORY_STORAGE_KEY = 'delta_evaluations_history_v1'; // History
const PROGRAMMES_KEY = 'delta_programmes_v1';
const MODULES_KEY = 'delta_modules_v1';
const PROGRAMME_MODULES_KEY = 'delta_programme_modules_v1';
const PROGRAMME_CHAIRS_KEY = 'delta_programme_chairs_v1';
const MODULE_OWNERS_KEY = 'delta_module_owners_v1';
const PROGRAMME_PROFILES_KEY = 'delta_programme_profiles_v1';
const PROGRAMME_TEAM_MEMBERS_KEY = 'delta_programme_team_members_v1';
const PROGRAMME_TAKING_STOCK_KEY = 'delta_programme_taking_stock_v1';
const PROGRAMME_PRIORITIES_KEY = 'delta_programme_priorities_v1';
const PROGRAMME_THEMES_KEY = 'delta_programme_themes_v1';
const PROGRAMME_GOALS_KEY = 'delta_programme_goals_v1';
const SESSION_KEY = 'delta_session_v1';

const StoreContext = createContext<any>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [evaluations, setEvaluations] = useState<ModuleEvaluation[]>([]);
  const [history, setHistory] = useState<ModuleEvaluationHistory[]>([]);
  
  // New State
  const [programmes, setProgrammes] = useState<Programme[]>(MOCK_PROGRAMMES);
  const [modules, setModules] = useState<Module[]>(MOCK_MODULES);
  const [programmeModules, setProgrammeModules] = useState<ProgrammeModule[]>(MOCK_PROGRAMME_MODULES);
  const [programmeChairs, setProgrammeChairs] = useState<ProgrammeChair[]>(MOCK_PROGRAMME_CHAIRS);
  const [moduleOwners, setModuleOwners] = useState<ModuleOwner[]>(MOCK_MODULE_OWNERS);
  
  const [programmeProfiles, setProgrammeProfiles] = useState<ProgrammeProfile[]>(MOCK_PROGRAMME_PROFILES);
  const [programmeTeamMembers, setProgrammeTeamMembers] = useState<ProgrammeTeamMember[]>(MOCK_PROGRAMME_TEAM_MEMBERS);
  const [programmeTakingStocks, setProgrammeTakingStocks] = useState<ProgrammeTakingStock[]>(MOCK_PROGRAMME_TAKING_STOCK);
  
  const [programmePriorities, setProgrammePriorities] = useState<ProgrammePriority[]>([]);
  const [programmeThemes, setProgrammeThemes] = useState<PriorityTheme[]>([]);
  const [smartGoals, setSmartGoals] = useState<SmartGoal[]>([]);

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
        setUser(JSON.parse(storedSession));
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEvaluations(JSON.parse(stored));

    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) setHistory(JSON.parse(storedHistory));

    // Load new entities if present (otherwise use mocks initially set)
    const storedProgrammes = localStorage.getItem(PROGRAMMES_KEY);
    if (storedProgrammes) setProgrammes(JSON.parse(storedProgrammes));

    const storedModules = localStorage.getItem(MODULES_KEY);
    if (storedModules) setModules(JSON.parse(storedModules));

    const storedProgModules = localStorage.getItem(PROGRAMME_MODULES_KEY);
    if (storedProgModules) setProgrammeModules(JSON.parse(storedProgModules));

    const storedProgChairs = localStorage.getItem(PROGRAMME_CHAIRS_KEY);
    if (storedProgChairs) setProgrammeChairs(JSON.parse(storedProgChairs));

    const storedModOwners = localStorage.getItem(MODULE_OWNERS_KEY);
    if (storedModOwners) setModuleOwners(JSON.parse(storedModOwners));

    const storedProfiles = localStorage.getItem(PROGRAMME_PROFILES_KEY);
    if (storedProfiles) setProgrammeProfiles(JSON.parse(storedProfiles));

    const storedTeamMembers = localStorage.getItem(PROGRAMME_TEAM_MEMBERS_KEY);
    if (storedTeamMembers) setProgrammeTeamMembers(JSON.parse(storedTeamMembers));

    const storedTakingStocks = localStorage.getItem(PROGRAMME_TAKING_STOCK_KEY);
    if (storedTakingStocks) setProgrammeTakingStocks(JSON.parse(storedTakingStocks));

    const storedPriorities = localStorage.getItem(PROGRAMME_PRIORITIES_KEY);
    if (storedPriorities) setProgrammePriorities(JSON.parse(storedPriorities));

    const storedThemes = localStorage.getItem(PROGRAMME_THEMES_KEY);
    if (storedThemes) setProgrammeThemes(JSON.parse(storedThemes));

    const storedGoals = localStorage.getItem(PROGRAMME_GOALS_KEY);
    if (storedGoals) {
        setSmartGoals(JSON.parse(storedGoals));
    } else {
        // If no data is found in storage, and we are in DEMO_MODE, seed data
        // This auto-fixes empty dashboards on first load
        if (DEMO_MODE && !stored && !storedProgrammes) {
             setTimeout(() => seedDemoData(), 100);
        }
    }

  }, []);


  // --- Persistence Helpers ---
  const persist = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // --- Actions ---

  const saveProgrammePriorities = (priorities: ProgrammePriority[]) => {
      setProgrammePriorities(priorities);
      persist(PROGRAMME_PRIORITIES_KEY, priorities);
  };

  const saveProgrammeThemes = (themes: PriorityTheme[]) => {
      setProgrammeThemes(themes);
      persist(PROGRAMME_THEMES_KEY, themes);
  };

  const saveSmartGoals = (goals: SmartGoal[]) => {
      setSmartGoals(goals);
      persist(PROGRAMME_GOALS_KEY, goals);
  };

  const login = (username: string, password: string): boolean => {
      const found = TEST_USERS.find(u => u.username === username && u.password === password);
      if (found) {
          const userData: User = { id: found.id, name: found.name, email: found.email, role: found.role };
          setUser(userData);
          persist(SESSION_KEY, userData);
          return true;
      }
      return false;
  };


  const logout = () => {
      setUser(null);
      localStorage.removeItem(SESSION_KEY);
  };

  const seedDemoData = () => {
      if (!DEMO_MODE) return;

      const now = new Date().toISOString();
      
      // 1. Create Demo Programme 1: DP101 (Arts)
      const demoProg1: Programme = {
          id: 'demo_prog_1',
          code: 'DP101',
          name: 'BA (Hons) in Digital Media',
          school: 'School of Creative Arts',
          faculty: 'Arts & Humanities',
          disciplineArea: 'Media',
          nfqLevel: 'Level 8',
          mode: 'Full-time',
          createdAt: now,
          updatedAt: now
      };

      // 2. Create Demo Programme 2: ED202 (Education)
      const demoProg2: Programme = {
          id: 'demo_prog_2',
          code: 'ED202',
          name: 'MSc in Education Practice',
          school: 'School of Education',
          faculty: 'Arts, Humanities & Social Sciences',
          disciplineArea: 'Education',
          nfqLevel: 'Level 9',
          mode: 'Part-time',
          createdAt: now,
          updatedAt: now
      };

      // 3. Assign Chair (Alex Rivera / u1) to BOTH
      const demoChairs: ProgrammeChair[] = [
          { id: 'chair_1', userId: 'u1', programmeId: demoProg1.id },
          { id: 'chair_2', userId: 'u1', programmeId: demoProg2.id }
      ];

      // 4. Create Modules for DP101 (8 modules)
      const modulesProg1: Module[] = [
          { id: 'm_dp1_1', code: 'DM101', name: 'Digital Foundations', credits: 5, programme: demoProg1.name },
          { id: 'm_dp1_2', code: 'DM102', name: 'Media Theory', credits: 5, programme: demoProg1.name },
          { id: 'm_dp1_3', code: 'DM201', name: 'Interactive Design', credits: 10, programme: demoProg1.name },
          { id: 'm_dp1_4', code: 'DM202', name: 'User Experience Studio', credits: 10, programme: demoProg1.name },
          { id: 'm_dp1_5', code: 'DM301', name: 'Advanced Web Tech', credits: 5, programme: demoProg1.name },
          { id: 'm_dp1_6', code: 'DM302', name: 'Digital Ethics', credits: 5, programme: demoProg1.name },
          { id: 'm_dp1_7', code: 'DM401', name: 'Major Project A', credits: 20, programme: demoProg1.name },
          { id: 'm_dp1_8', code: 'DM402', name: 'Portfolio Development', credits: 10, programme: demoProg1.name },
      ];

      // 5. Create Modules for ED202 (4 modules)
      const modulesProg2: Module[] = [
          { id: 'm_ed2_1', code: 'ED501', name: 'Curriculum Design', credits: 10, programme: demoProg2.name },
          { id: 'm_ed2_2', code: 'ED502', name: 'Assessment Strategies', credits: 10, programme: demoProg2.name },
          { id: 'm_ed2_3', code: 'ED503', name: 'Technology Enhanced Learning', credits: 10, programme: demoProg2.name },
          { id: 'm_ed2_4', code: 'ED504', name: 'Research Methods', credits: 10, programme: demoProg2.name },
      ];

      const allDemoModules = [...modulesProg1, ...modulesProg2];

      // 6. Link Modules to Programmes (ProgrammeModule)
      const progModules: ProgrammeModule[] = [];
      
      // Link Prog 1
      modulesProg1.forEach((m, i) => {
          progModules.push({
              id: `pm_dp1_${i}`,
              programmeId: demoProg1.id,
              moduleId: m.id,
              stage: Math.floor(i / 2) + 1, // Stages 1-4
              semester: i % 2 === 0 ? 'autumn' : 'spring',
              isCore: 'core'
          });
      });

      // Link Prog 2
      modulesProg2.forEach((m, i) => {
          progModules.push({
              id: `pm_ed2_${i}`,
              programmeId: demoProg2.id,
              moduleId: m.id,
              stage: 1, // All stage 1 (Masters)
              semester: i % 2 === 0 ? 'autumn' : 'spring',
              isCore: 'core'
          });
      });

      // 7. Create Module Owners (Assign some to Alex, some to others)
      const owners: ModuleOwner[] = [];
      allDemoModules.forEach((m, i) => {
         // Assign Alex (u1) to first module of each programme (leaders often teach)
         // Assign Sarah (u2) to a few specific ones (e.g. indices 1, 2, 3 of Prog 1)
         // Assign others to a 'ghost' user u3 so Sarah doesn't own EVERYTHING else
         
         let ownerId = 'u3'; // Ghost user
         
         if (m.id === 'm_dp1_1' || m.id === 'm_ed2_1') {
             ownerId = 'u1'; // Alex
         } else if (['m_dp1_2', 'm_dp1_3', 'm_ed2_2'].includes(m.id)) {
             ownerId = 'u2'; // Sarah (Module Lead)
         }
         
         owners.push({ id: `mo_${m.id}`, userId: ownerId, moduleId: m.id });
      });

      // 8. Create Evaluations (Populate data for heatmaps)
      // We want varied scores: Strong/Leading, Consolidating, Developing
      const evals: ModuleEvaluation[] = [];
      
      allDemoModules.forEach((m, i) => {
          // Generate mock scores
          // i % 3 == 0 -> High (Leading)
          // i % 3 == 1 -> Mid (Consolidating)
          // i % 3 == 2 -> Low (Developing)
          
          const baseScore = i % 3 === 0 ? 5 : (i % 3 === 1 ? 3 : 2);
          
          // Determine Module Profile for text generation
          const isStrong = baseScore === 5;
          const isDigitalInclusion = i % 3 === 1; 
          
          // Create answers dictionary
          const answers: Record<string, number> = {};
          CATEGORIES.forEach((cat, catIdx) => {
             cat.indicators.forEach((ind, indIdx) => {
                 // Add some randomness: baseScore +/- 1
                 let score = baseScore;
                 if (Math.random() > 0.5) score += (Math.random() > 0.5 ? 1 : -1);
                 score = Math.max(1, Math.min(5, score));
                 
                 answers[`${cat.id}_${indIdx}`] = score;
             });
          });
          
          // Calculate category scores
          const categoryScores: any = {};
          const categoryLevels: any = {};
          const indicatorScores: any = {};
          
          CATEGORIES.forEach((cat, idx) => {
              const catAnswers = [0,1,2].map(k => answers[`${cat.id}_${k}`]);
              
              // Store individual indicator scores
              cat.indicators.forEach((ind, indIdx) => {
                   indicatorScores[ind.id] = answers[`${cat.id}_${indIdx}`];
              });

              const score10 = calculateScore(catAnswers);
              categoryScores[cat.id] = score10;
              categoryLevels[cat.id] = getLevel(score10);
          });

          // Rich Metadata Generation
          const metadata: ModuleMetadata = {
              moduleTypes: isDigitalInclusion ? ['core', 'online_hybrid'] : ['core', 'in_person'],
              teachingTeamSize: isStrong ? 'medium_team_4_6' : 'small_team_2_3',
              cohortCharacteristics: ['mixed_level'],
              assessments: [
                  // Varied assessment schedule for clustering/timing demo
                  { id: 'a1', name: 'Project', type: 'project', weight: isStrong ? 50 : 100, dueWeek: 12, shared: 'no' as const, timingBand: 'late' as const },
                  ...(isStrong ? [{ id: 'a2', name: 'Mid-term Review', type: 'presentation', weight: 30, dueWeek: 6, shared: 'no' as const, timingBand: 'mid' as const }] : []),
                  ...(isStrong ? [{ id: 'a3', name: 'Reflection', type: 'essay', weight: 20, dueWeek: 9, shared: 'no' as const, timingBand: 'mid' as const }] : []),
                  ...(isDigitalInclusion ? [{ id: 'a4', name: 'Early Feedback Task', type: 'formative', weight: 0, dueWeek: 3, shared: 'no' as const, timingBand: 'early' as const }] : [])
              ],
              udlIndicators: isDigitalInclusion ? ['multiple_means_expression', 'flexible_deadlines'] : [],
              digitalPractice: isDigitalInclusion ? ['vle_template', 'accessibility_checked'] : ['vle_template'],
              studentFeedbackOverall: isStrong ? 5 : 3,
              studentFeedbackVolume: 'moderate_10_30',
              moduleRiskLevel: 'no_concern',
              moduleRiskReasons: [],
              
              // Rich Text Fields for Taking Stock
              policiesInfluencing: isStrong 
                  ? "Module design explicitly aligned with the National Forum Authentic Assessment Framework (2021). Incorporated institutional guidelines on AI use in assessment (2024)." 
                  : "Standard university T&L policy followed regarding assessment turnaround times and grading criteria.",
              
              externalRequirements: m.name.includes('Ethics') 
                  ? "Meets professional body requirements for ethics in practice (CORU/Teaching Council)." 
                  : "No specific external body requirements.",
              
              staffDevelopmentInfluence: isStrong 
                  ? "Teaching team completed Digital Badge in UDL and Assessment Design." 
                  : "Staff attend annual T&L showcase events.",
              
              studentPartnership: isStrong 
                  ? "Students co-designed assessment criteria and rubric in Week 2." 
                  : "Standard end-of-module feedback loop via student survey.",
              
              evidenceSources: isStrong ? ['module_survey', 'focus_group', 'external_examiner'] : ['module_survey'],
              changesLast3Years: isStrong 
                  ? "Major redesign to move to 100% continuous assessment based on student feedback." 
                  : "Minor updates to reading list and VLE structure.",
              
              studentFeedbackSummary: isStrong 
                  ? "Students consistently praise the authentic nature of the tasks and clarity of feedback." 
                  : "Students find the workload heavy at times, but appreciate the structure.",
              
              curriculumConnections: (m.credits || 5) > 10 
                  ? "Explicitly connects with research methods module in previous semester." 
                  : "Builds on foundational concepts from Stage 1.",
              
              learningEnvironmentUse: isDigitalInclusion 
                  ? "Active use of VLE discussion boards, wiki, and collaborative whiteboard tools for async work." 
                  : "VLE primarily used as document repository for slides and readings.",
              
              teachingApproaches: isStrong ? ['pbl', 'studio'] : ['lecture', 'seminar'],
              
              transitionSupport: m.code.includes('101') 
                  ? "Dedicated induction weeks, jargon buster glossary, and peer mentoring programme." 
                  : "Standard office hours and email support.",
              
              diversitySupport: isDigitalInclusion 
                  ? "All materials provided in alternative formats (accessible PDF, captioned video). Flexible deadline policy." 
                  : "Standard student support services referral process.",
              
              authenticAssessmentRationale: isStrong 
                  ? "Assessment mirrors professional practice tasks (e.g. client brief, portfolio) rather than academic essays." 
                  : "Traditional essay format used to test theoretical understanding of core concepts.",
              
              feedbackPractices: isStrong 
                  ? "Audio feedback provided on drafts; peer review cycles included before final submission." 
                  : "Written feedback on final submission via VLE rubric within 3 weeks.",
              
              selfPeerAssessment: isStrong || isDigitalInclusion
          };

          evals.push({
              id: `eval_${m.id}`,
              userId: owners.find(o => o.moduleId === m.id)?.userId || 'u2',
              moduleId: m.id,
              academicYear: '2024-25',
              answers,
              categoryScores,
              categoryLevels,
              indicatorScores, // Added rich indicator scores
              evidenceSummaries: {
                  strategy_capacity: `${metadata.policiesInfluencing}\n\n${metadata.externalRequirements}\n\n${metadata.staffDevelopmentInfluence}`,
                  evidence_based: `${metadata.studentFeedbackSummary}\n\nEvidence Sources: ${metadata.evidenceSources?.join(', ')}\n\nRecent Changes: ${metadata.changesLast3Years}`,
                  design_of_learning: `${metadata.curriculumConnections}\n\n${metadata.learningEnvironmentUse}`,
                  teaching_practice: `${metadata.transitionSupport}\n\n${metadata.diversitySupport}`,
                  assessment: `${metadata.authenticAssessmentRationale}\n\n${metadata.feedbackPractices}`
              },
              artefacts: {},
              metadata,
              moduleHeadline: isStrong 
                  ? `A flagship module demonstrating best practice in ${m.name}.` 
                  : `A solid module with opportunities to enhance digital engagement in ${m.name}.`,
              completedAt: now,
              createdAt: now
          });
      });

      // 9. Persist everything
      setProgrammes([demoProg1, demoProg2]);
      persist(PROGRAMMES_KEY, [demoProg1, demoProg2]);

      setModules(allDemoModules);
      persist(MODULES_KEY, allDemoModules);

      setProgrammeChairs(demoChairs);
      persist(PROGRAMME_CHAIRS_KEY, demoChairs);

      setProgrammeModules(progModules);
      persist(PROGRAMME_MODULES_KEY, progModules);

      setModuleOwners(owners);
      persist(MODULE_OWNERS_KEY, owners);

      setEvaluations(evals);
      persist(STORAGE_KEY, evals);
      
      console.log("Demo Data Seeded for User u1 (Alex Rivera) with 2 Programmes");
  };

  const saveEvaluation = (evaluation: ModuleEvaluation) => {
    const now = new Date().toISOString();
    let newEvaluation = { ...evaluation };
    
    // Find existing based on Module ID AND Academic Year
    const existingIndex = evaluations.findIndex(e => 
        e.moduleId === evaluation.moduleId && e.academicYear === evaluation.academicYear
    );
    
    let evaluationId = existingIndex >= 0 ? evaluations[existingIndex].id : crypto.randomUUID();
    
    if (!newEvaluation.id) {
        newEvaluation.id = evaluationId;
    }

    if (existingIndex >= 0) {
        // Update existing
        const existing = evaluations[existingIndex];
        newEvaluation.createdAt = existing.createdAt || now;
        newEvaluation.updatedAt = now;
        newEvaluation.completedAt = now; 
    } else {
        // Create new
        newEvaluation.createdAt = now;
        newEvaluation.updatedAt = now;
        newEvaluation.completedAt = now;
    }

    // Save Active State - Replace only the specific (Module + Year) entry
    const newEvaluations = [
      ...evaluations.filter(e => !(e.moduleId === evaluation.moduleId && e.academicYear === evaluation.academicYear)),
      newEvaluation
    ];
    setEvaluations(newEvaluations);
    persist(STORAGE_KEY, newEvaluations);

    // Save History Snapshot
    const moduleHistory = history.filter(h => h.moduleEvaluationId === newEvaluation.id);
    const maxVersion = moduleHistory.reduce((max, h) => Math.max(max, h.versionNumber), 0);
    const newVersion = maxVersion + 1;

    const historyEntry: ModuleEvaluationHistory = {
        id: crypto.randomUUID(),
        moduleEvaluationId: newEvaluation.id!,
        moduleId: newEvaluation.moduleId,
        versionNumber: newVersion,
        snapshot: newEvaluation,
        createdAt: now
    };

    const newHistory = [...history, historyEntry];
    setHistory(newHistory);
    persist(HISTORY_STORAGE_KEY, newHistory);
  };

  const getEvaluation = (moduleId: string, academicYear?: string) => {
    const moduleEvaluations = evaluations.filter(e => e.moduleId === moduleId);
    if (academicYear) {
        return moduleEvaluations.find(e => e.academicYear === academicYear);
    }
    return moduleEvaluations.sort((a, b) => 
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    )[0];
  };
  
  const getHistory = (moduleId: string) => {
      return history.filter(h => h.moduleId === moduleId).sort((a, b) => b.versionNumber - a.versionNumber);
  };

  // --- Programme Management Actions ---

  const addProgramme = (programme: Omit<Programme, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newProgramme: Programme = {
          ...programme,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      const updatedProgrammes = [...programmes, newProgramme];
      setProgrammes(updatedProgrammes);
      persist(PROGRAMMES_KEY, updatedProgrammes);
      
      // Auto-assign chair
      const newChair: ProgrammeChair = {
          id: crypto.randomUUID(),
          userId: MOCK_USER.id,
          programmeId: newProgramme.id
      };
      const updatedChairs = [...programmeChairs, newChair];
      setProgrammeChairs(updatedChairs);
      persist(PROGRAMME_CHAIRS_KEY, updatedChairs);
      
      return newProgramme;
  };

  const updateProgramme = (id: string, updates: Partial<Programme>) => {
      const updatedProgrammes = programmes.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      setProgrammes(updatedProgrammes);
      persist(PROGRAMMES_KEY, updatedProgrammes);
  };

  const addModuleToProgramme = (programmeId: string, moduleData: Partial<Module>, context: { stage: number, semester: string, isCore: 'core' | 'elective' }) => {
      let moduleId = moduleData.id;
      
      // Create module if it doesn't exist
      if (!moduleId) {
          const newModule: Module = {
              id: crypto.randomUUID(),
              code: moduleData.code || 'NEW',
              name: moduleData.name || 'New Module',
              credits: moduleData.credits || 5,
              programme: programmes.find(p => p.id === programmeId)?.name || ''
          };
          moduleId = newModule.id;
          const updatedModules = [...modules, newModule];
          setModules(updatedModules);
          persist(MODULES_KEY, updatedModules);
      }

      const newProgModule: ProgrammeModule = {
          id: crypto.randomUUID(),
          programmeId,
          moduleId: moduleId!,
          stage: context.stage,
          semester: context.semester,
          isCore: context.isCore
      };
      
      const updatedProgModules = [...programmeModules, newProgModule];
      setProgrammeModules(updatedProgModules);
      persist(PROGRAMME_MODULES_KEY, updatedProgModules);

      return { moduleId, programmeModuleId: newProgModule.id };
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    const updatedModules = modules.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    );
    setModules(updatedModules);
    persist(MODULES_KEY, updatedModules);
  };

  const updateProgrammeModule = (id: string, updates: Partial<ProgrammeModule>) => {
      const updatedProgModules = programmeModules.map(pm => 
          pm.id === id ? { ...pm, ...updates } : pm
      );
      setProgrammeModules(updatedProgModules);
      persist(PROGRAMME_MODULES_KEY, updatedProgModules);
  };
  
  const removeModuleFromProgramme = (programmeModuleId: string) => {
      const updatedProgModules = programmeModules.filter(pm => pm.id !== programmeModuleId);
      setProgrammeModules(updatedProgModules);
      persist(PROGRAMME_MODULES_KEY, updatedProgModules);
  };

  const assignModuleOwner = (moduleId: string, userId: string) => {
      // Remove existing owner
      const filteredOwners = moduleOwners.filter(mo => mo.moduleId !== moduleId);
      // Add new owner
      const newOwner: ModuleOwner = {
          id: crypto.randomUUID(),
          userId,
          moduleId
      };
      const updatedOwners = [...filteredOwners, newOwner];
      setModuleOwners(updatedOwners);
      persist(MODULE_OWNERS_KEY, updatedOwners);
  };
  
  const getProgrammeModules = (programmeId: string) => {
      return programmeModules
        .filter(pm => pm.programmeId === programmeId)
        .map(pm => {
            const module = modules.find(m => m.id === pm.moduleId);
            const owner = moduleOwners.find(mo => mo.moduleId === pm.moduleId);
            
            // Improved User Lookup
            let ownerUser = null;
            if (owner) {
                // 1. Try current session user
                if (user && owner.userId === user.id) {
                    ownerUser = user;
                } 
                // 2. Try known test users
                else {
                    const foundTestUser = TEST_USERS.find(u => u.id === owner.userId);
                    if (foundTestUser) {
                        ownerUser = { id: foundTestUser.id, name: foundTestUser.name, email: foundTestUser.email, role: foundTestUser.role };
                    } else {
                        // 3. Fallback
                        ownerUser = { id: owner.userId, name: 'Other User' };
                    }
                }
            }
            
            return {
                ...pm,
                module,
                owner: ownerUser
            };
        });
  };

  const getMyProgrammes = () => {
      if (!user) return [];
      return programmeChairs
        .filter(pc => pc.userId === user.id)
        .map(pc => programmes.find(p => p.id === pc.programmeId))
        .filter((p): p is Programme => !!p);
  };

  const getMyModules = () => {
      if (!user) return [];
      return moduleOwners
        .filter(mo => mo.userId === user.id)
        .reduce<Module[]>((acc, mo) => {
            const module = modules.find(m => m.id === mo.moduleId);
            if (!module) return acc;

            // Try to find which programme this module belongs to (mock join)
            const progMod = programmeModules.find(pm => pm.moduleId === module.id);
            const programme = progMod ? programmes.find(p => p.id === progMod.programmeId) : null;
            
            acc.push({
                ...module,
                programmeName: programme ? programme.name : module.programme, // fallback to legacy string
                programmeId: programme ? programme.id : undefined
            });
            return acc;
        }, []);
  };

  const getProgrammeProfile = (programmeId: string, academicYear: string) => {
      return programmeProfiles.find(pp => pp.programmeId === programmeId && pp.academicYear === academicYear);
  };
  
  const saveProgrammeProfile = (profile: ProgrammeProfile) => {
      const now = new Date().toISOString();
      let newProfile = { ...profile, updatedAt: now };
      
      if (!newProfile.id) {
          newProfile.id = crypto.randomUUID();
          newProfile.createdAt = now;
      }
      
      const existingIndex = programmeProfiles.findIndex(pp => pp.id === newProfile.id || (pp.programmeId === newProfile.programmeId && pp.academicYear === newProfile.academicYear));
      
      let updatedProfiles;
      if (existingIndex >= 0) {
          updatedProfiles = programmeProfiles.map((p, i) => i === existingIndex ? { ...p, ...newProfile } : p);
      } else {
          updatedProfiles = [...programmeProfiles, newProfile];
      }
      
      setProgrammeProfiles(updatedProfiles);
      persist(PROGRAMME_PROFILES_KEY, updatedProfiles);
      return newProfile;
  };
  
  const getProgrammeTeamMembers = (programmeId: string, academicYear: string) => {
      return programmeTeamMembers.filter(ptm => ptm.programmeId === programmeId && ptm.academicYear === academicYear);
  };
  
  const saveProgrammeTeamMembers = (programmeId: string, academicYear: string, members: ProgrammeTeamMember[]) => {
      // Remove existing for this programme + year
      const otherMembers = programmeTeamMembers.filter(ptm => !(ptm.programmeId === programmeId && ptm.academicYear === academicYear));
      
      // Ensure all new members have IDs and timestamps
      const newMembers = members.map(m => ({
          ...m,
          id: m.id || crypto.randomUUID(),
          programmeId,
          academicYear,
          createdAt: m.createdAt || new Date().toISOString()
      }));
      
      const updatedMembers = [...otherMembers, ...newMembers];
      setProgrammeTeamMembers(updatedMembers);
      persist(PROGRAMME_TEAM_MEMBERS_KEY, updatedMembers);
  };

  const getProgrammeTakingStock = (programmeId: string, academicYear: string) => {
      return programmeTakingStocks.find(pts => pts.programmeId === programmeId && pts.academicYear === academicYear);
  };

  const saveProgrammeTakingStock = (takingStock: ProgrammeTakingStock) => {
      const now = new Date().toISOString();
      let newData = { ...takingStock, updatedAt: now };
      
      if (!newData.id) {
          newData.id = crypto.randomUUID();
          newData.createdAt = now;
      }
      
      const existingIndex = programmeTakingStocks.findIndex(pts => pts.id === newData.id || (pts.programmeId === newData.programmeId && pts.academicYear === newData.academicYear));
      
      let updatedList;
      if (existingIndex >= 0) {
          updatedList = programmeTakingStocks.map((p, i) => i === existingIndex ? { ...p, ...newData } : p);
      } else {
          updatedList = [...programmeTakingStocks, newData];
      }
      
      setProgrammeTakingStocks(updatedList);
      persist(PROGRAMME_TAKING_STOCK_KEY, updatedList);
      return newData;
  };

  const store = {
    user, // Now dynamic state
    login,
    logout,
    seedDemoData,
    modules,
    programmes,
    evaluations,
    history,
    saveEvaluation,
    getEvaluation,
    getHistory,
    // Programme Actions
    addProgramme,
    updateProgramme,
    addModuleToProgramme,
    updateModule,
    updateProgrammeModule,
    removeModuleFromProgramme,
    assignModuleOwner,
    // Profile Actions
    getProgrammeProfile,
    saveProgrammeProfile,
    getProgrammeTeamMembers,
    saveProgrammeTeamMembers,
    getProgrammeTakingStock,
    saveProgrammeTakingStock,
    // Getters
    getProgrammeModules,
    getMyProgrammes,
    getMyModules,
    programmeTakingStocks, // Expose raw state for dependency arrays
    
    // Action Plan State & Actions
    programmePriorities,
    saveProgrammePriorities,
    programmeThemes,
    saveProgrammeThemes,
    programmeGoals: smartGoals, // Expose as programmeGoals to match component expectation
    saveSmartGoals
  };

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

// --- Scoring Logic ---

export function calculateScore(answers: number[]): number {
  // answers are 1-5
  // sum: min 3, max 15
  // We want 0-10 scale
  const rawSum = answers.reduce((a, b) => a + b, 0);
  // (raw_sum - 3) / (15 - 3) * 10
  // (raw_sum - 3) / 12 * 10
  const score = Math.round(((rawSum - 3) / 12) * 10);
  return Math.max(0, Math.min(10, score));
}

export function getLevel(score: number): Level {
  if (score <= 3) return 'Developing';
  if (score <= 7) return 'Consolidating';
  return 'Leading';
}

// --- Helper for Timing Band ---
export function getTimingBand(week: number): 'early' | 'mid' | 'late' {
    if (week <= 4) return 'early';
    if (week <= 9) return 'mid';
    return 'late';
}
