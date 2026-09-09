import { useEffect, useMemo, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Database,
  Gauge,
  HardDrive,
  KeyRound,
  Layers3,
  Leaf,
  Loader2,
  LockKeyhole,
  LogOut,
  MessageSquarePlus,
  ClipboardList,
  Send,
  Network,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';

import {
  getQuestions,
  getQuestionsByCategory,
} from './api/questions';

import {
  login,
  logout,
  getSession,
} from './api/auth';

import {
  submitQuestionRequest,
  getQuestionRequests,
  updateQuestionRequestStatus,
} from './api/questionRequests';

import {
  getProgress,
  markQuestionCompleted as saveQuestionCompleted,
} from './api/progress';

import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from './api/bookmarks';

import {
  searchQuestions as runQuestionSearch,
} from './api/search';

import {
  getAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  updateAdminQuestionStatus,
  deleteAdminQuestion,
  deleteAdminTopic,
} from './api/adminQuestions';

import './App.css';
import './requestFeature.css';


/* =========================================================
   CURRICULUM
========================================================= */

const categories = [
  {
    number: 1,
    key: 'mongodb_fundamentals',
    title: 'MongoDB Fundamentals',
    description:
      'Start from zero and understand MongoDB, BSON, documents, collections, schema design and core database concepts.',
    icon: Database,
    level: 'Foundation → L3',
    colorClass: 'fundamentals',
  },

  {
    number: 2,
    key: 'mongodb_architecture',
    title: 'Architecture & Internals',
    description:
      'Understand MongoDB processes, memory, storage architecture and how the database works internally.',
    icon: Server,
    level: 'Foundation → L3',
    colorClass: 'architecture',
  },

  {
    number: 3,
    key: 'crud_query_language',
    title: 'CRUD & Query Language',
    description:
      'Master inserts, reads, updates, deletes, filters, operators and MongoDB query patterns.',
    icon: Terminal,
    level: 'Foundation → L3',
    colorClass: 'crud',
  },

  {
    number: 4,
    key: 'indexing_fundamentals',
    title: 'Indexing Fundamentals',
    description:
      'Learn how indexes work, their internal structure, selectivity, cardinality and correct index design.',
    icon: Search,
    level: 'Foundation → L3',
    colorClass: 'indexing',
  },

  {
    number: 5,
    key: 'advanced_indexing',
    title: 'Advanced Indexing & Optimization',
    description:
      'Study compound, multikey, partial, sparse, TTL, wildcard and advanced index optimization.',
    icon: Gauge,
    level: 'L2 → L3+',
    colorClass: 'advanced-indexing',
  },

  {
    number: 6,

    /*
     * IMPORTANT
     *
     * Backend category:
     *
     * query_planner_explain
     *
     * Do NOT change this back to:
     *
     * query_planner
     */
    key: 'query_planner_explain',

    title: 'Query Planner & Explain',
    description:
      'Learn query planning, winning plans, rejected plans, executionStats and production query analysis.',
    icon: Search,
    level: 'L2 → L3+',
    colorClass: 'query-planner',
  },

  {
    number: 7,
    key: 'replica_set_fundamentals',
    title: 'Replica Set Fundamentals',
    description:
      'Understand primary-secondary replication, oplog, elections, voting, heartbeats and failover.',
    icon: Layers3,
    level: 'Foundation → L3',
    colorClass: 'replication',
  },

  {
    number: 8,
    key: 'advanced_replication',
    title: 'Advanced Replication & HA',
    description:
      'Deep dive into replication lag, rollback, initial sync, sync sources, commit point and high availability.',
    icon: Network,
    level: 'L2 → L3+',
    colorClass: 'advanced-replication',
  },

  {
    number: 9,
    key: 'sharding_fundamentals',
    title: 'Sharding Fundamentals',
    description:
      'Understand mongos, config servers, shards, chunks, balancer and horizontal scaling concepts.',
    icon: Network,
    level: 'Foundation → L3',
    colorClass: 'sharding',
  },

  {
    number: 10,
    key: 'advanced_sharding',
    title: 'Advanced Sharding & Scaling',
    description:
      'Master shard-key design, chunk distribution, balancing, hotspots, zones and production scaling.',
    icon: Layers3,
    level: 'L2 → L3+',
    colorClass: 'advanced-sharding',
  },

  {
    number: 11,
    key: 'backup_restore',
    title: 'Backup & Restore',
    description:
      'Learn mongodump, mongorestore, snapshots, backup validation and production recovery planning.',
    icon: HardDrive,
    level: 'Foundation → L3',
    colorClass: 'backup',
  },

  {
    number: 12,
    key: 'pitr_disaster_recovery',
    title: 'PITR & Disaster Recovery',
    description:
      'Understand oplog-based recovery, recovery points, RPO, RTO and disaster-recovery strategies.',
    icon: RefreshCcw,
    level: 'L2 → L3+',
    colorClass: 'pitr',
  },

  {
    number: 13,
    key: 'performance_tuning',
    title: 'Performance Tuning',
    description:
      'Diagnose CPU, memory, disk, query latency, connections and production MongoDB bottlenecks.',
    icon: Gauge,
    level: 'L2 → L3+',
    colorClass: 'performance',
  },

  {
    number: 14,
    key: 'wiredtiger_internals',
    title: 'WiredTiger Internals',
    description:
      'Understand WiredTiger cache, checkpoints, eviction, compression, journaling and storage internals.',
    icon: Database,
    level: 'L2 → L3+',
    colorClass: 'wiredtiger',
  },

  {
    number: 15,
    key: 'security_access_control',
    title: 'Security & Access Control',
    description:
      'Learn authentication, authorization, users, roles, least privilege and MongoDB security design.',
    icon: KeyRound,
    level: 'Foundation → L3',
    colorClass: 'security',
  },

  {
    number: 16,
    key: 'tls_encryption_hardening',
    title: 'TLS, Encryption & Hardening',
    description:
      'Secure MongoDB with TLS, encryption, network controls, certificates and production hardening.',
    icon: ShieldCheck,
    level: 'L2 → L3+',
    colorClass: 'tls',
  },

  {
    number: 17,
    key: 'administration_maintenance',
    title: 'Administration & Maintenance',
    description:
      'Learn day-to-day MongoDB administration, maintenance, capacity management and operational practices.',
    icon: Wrench,
    level: 'Foundation → L3',
    colorClass: 'administration',
  },

  {
    number: 18,
    key: 'upgrade_patching_migration',
    title: 'Upgrade, Patching & Migration',
    description:
      'Plan MongoDB upgrades, patching, FCV changes, migrations, validation and rollback strategies.',
    icon: RefreshCcw,
    level: 'L2 → L3+',
    colorClass: 'upgrade',
  },

  {
    number: 19,
    key: 'atlas_monitoring',
    title: 'MongoDB Atlas & Monitoring',
    description:
      'Learn Atlas administration, metrics, alerts, monitoring, automation and cloud MongoDB operations.',
    icon: Server,
    level: 'Foundation → L3',
    colorClass: 'atlas',
  },

  {
    number: 20,
    key: 'production_troubleshooting_l3',
    title: 'Production Troubleshooting & L3 Scenarios',
    description:
      'Solve real production incidents involving CPU, memory, disk, queries, replication and availability.',
    icon: Wrench,
    level: 'L3 → L3+',
    colorClass: 'troubleshooting',
  },

  {
    number: 21,
    key: 'linux_for_mongodb',
    title: 'Linux for MongoDB',
    description:
      'Master Linux commands, OS tuning, process management, storage, memory, networking and production troubleshooting for MongoDB.',
    icon: Terminal,
    level: 'Foundation → L3+',
    colorClass: 'linux',
  },
];


/* =========================================================
   RESPONSE NORMALIZER
========================================================= */

function normalizeQuestions(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.questions)
  ) {
    return response.questions;
  }

  if (
    response &&
    Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response &&
    Array.isArray(response.results)
  ) {
    return response.results;
  }

  return [];
}


/* =========================================================
   TEXT BLOCK
========================================================= */

function TextBlock({ text }) {
  if (
    text === undefined ||
    text === null ||
    text === ''
  ) {
    return null;
  }

  return (
    <div className="answer-text">
      {String(text)
        .split('\n')
        .map((line, index) => {
          if (!line.trim()) {
            return (
              <div
                key={index}
                className="answer-spacer"
              />
            );
          }

          return (
            <p key={index}>
              {line}
            </p>
          );
        })}
    </div>
  );
}


/* =========================================================
   ANSWER SECTION
========================================================= */

function AnswerSection({
  title,
  children,
  icon: Icon = Sparkles,
}) {
  if (
    children === undefined ||
    children === null
  ) {
    return null;
  }

  return (
    <section className="answer-section">

      <div className="answer-section-title">
        <Icon size={16} />

        <span>
          {title}
        </span>
      </div>

      <div className="answer-section-body">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   STRING LIST
========================================================= */

function StringList({ items }) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  return (
    <ul className="answer-list">

      {items.map(
        (item, index) => (
          <li key={index}>
            {item}
          </li>
        )
      )}

    </ul>
  );
}


/* =========================================================
   CODE BLOCK
========================================================= */

function CodeBlock({ value }) {
  if (!value) {
    return null;
  }

  return (
    <pre className="command-code">
      <code>
        {value}
      </code>
    </pre>
  );
}


/* =========================================================
   COMMAND LIST
========================================================= */

function CommandList({ commands }) {
  if (
    !Array.isArray(commands) ||
    commands.length === 0
  ) {
    return null;
  }

  return (
    <div className="commands-list">

      {commands.map(
        (item, index) => (
          <div
            className="command-card"
            key={index}
          >

            <CodeBlock
              value={item.command}
            />

            {item.explanation && (
              <p className="command-explanation">
                {item.explanation}
              </p>
            )}

          </div>
        )
      )}

    </div>
  );
}


/* =========================================================
   EXAMPLES
========================================================= */

function Examples({ examples }) {
  if (
    !Array.isArray(examples) ||
    examples.length === 0
  ) {
    return null;
  }

  return (
    <div className="examples-list">

      {examples.map(
        (example, index) => (
          <pre
            className="example-code"
            key={index}
          >
            <code>
              {example}
            </code>
          </pre>
        )
      )}

    </div>
  );
}


/* =========================================================
   STRUCTURED ANSWER
========================================================= */

function StructuredAnswer({ answer }) {
  if (!answer) {
    return (
      <TextBlock
        text="Answer not available."
      />
    );
  }

  if (typeof answer === 'string') {
    return (
      <TextBlock text={answer} />
    );
  }

  return (
    <div className="structured-answer">

      <AnswerSection
        title="Ground Zero"
        icon={Leaf}
      >
        <TextBlock
          text={answer.groundZero}
        />
      </AnswerSection>


      <AnswerSection
        title="Core Concept"
        icon={Sparkles}
      >
        <TextBlock
          text={answer.coreConcept}
        />
      </AnswerSection>


      <AnswerSection
        title="Detailed Explanation"
        icon={BookOpen}
      >
        <TextBlock
          text={
            answer.detailedExplanation
          }
        />
      </AnswerSection>


      <AnswerSection
        title="Internal Working"
        icon={Database}
      >
        <TextBlock
          text={answer.internalWorking}
        />
      </AnswerSection>


      <AnswerSection
        title="Architecture"
        icon={Layers3}
      >
        <CodeBlock
          value={answer.architecture}
        />
      </AnswerSection>


      <AnswerSection
        title="Examples"
        icon={Terminal}
      >
        <Examples
          examples={answer.examples}
        />
      </AnswerSection>


      <AnswerSection
        title="Commands"
        icon={Terminal}
      >
        <CommandList
          commands={answer.commands}
        />
      </AnswerSection>


      <AnswerSection
        title="Production Scenario"
        icon={Server}
      >
        <TextBlock
          text={answer.productionScenario}
        />
      </AnswerSection>


      <AnswerSection
        title="Troubleshooting Approach"
        icon={Wrench}
      >
        <TextBlock
          text={
            answer.troubleshootingApproach
          }
        />
      </AnswerSection>


      <AnswerSection
        title="Common Mistakes"
        icon={Zap}
      >
        <StringList
          items={answer.commonMistakes}
        />
      </AnswerSection>


      <AnswerSection
        title="Best Practices"
        icon={CircleCheck}
      >
        <StringList
          items={answer.bestPractices}
        />
      </AnswerSection>


      <AnswerSection
        title="Interview Answer"
        icon={Trophy}
      >
        <TextBlock
          text={answer.interviewAnswer}
        />
      </AnswerSection>


      <AnswerSection
        title="Key Takeaways"
        icon={CheckCircle2}
      >
        <StringList
          items={answer.keyTakeaways}
        />
      </AnswerSection>

    </div>
  );
}


/* =========================================================
   APPLICATION
========================================================= */


function createEmptyAdminQuestionForm() {
  return {
    category: '',
    topicId: '',
    topicNumber: '',
    topicName: '',
    questionNumber: '',
    question: '',
    level: '',
    difficulty: '',
    order: '',
    answer: {
      groundZero: '',
      coreConcept: '',
      detailedExplanation: '',
      internalWorking: '',
      architecture: '',
      examples: '',
      commands: '[]',
      productionScenario: '',
      troubleshootingApproach: '',
      commonMistakes: '',
      bestPractices: '',
      interviewAnswer: '',
      keyTakeaways: '',
    },
  };
}


function arrayToLines(value) {
  return Array.isArray(value)
    ? value.join('\n')
    : '';
}


function linesToArray(value) {
  return String(value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}


function App() {
  /* ---------------------------------------------------------
     AUTHENTICATION
  --------------------------------------------------------- */

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authUser, setAuthUser] =
    useState(null);

  const [authToken, setAuthToken] =
    useState(() =>
      sessionStorage.getItem('authToken')
    );

  const [loginUsername, setLoginUsername] =
    useState('');

  const [loginPassword, setLoginPassword] =
    useState('');

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [loginError, setLoginError] =
    useState('');

  /* ---------------------------------------------------------
     QUESTION REQUEST FEATURE
  --------------------------------------------------------- */

  const [requestTopic, setRequestTopic] =
    useState('General');

  const [requestQuestion, setRequestQuestion] =
    useState('');

  const [requestNotes, setRequestNotes] =
    useState('');

  const [requestLoading, setRequestLoading] =
    useState(false);

  const [requestMessage, setRequestMessage] =
    useState('');

  const [requestError, setRequestError] =
    useState('');

  const [adminRequests, setAdminRequests] =
    useState([]);

  const [
    adminRequestsLoading,
    setAdminRequestsLoading,
  ] = useState(false);

  const [
    adminRequestsError,
    setAdminRequestsError,
  ] = useState('');

  const [
    updatingRequestId,
    setUpdatingRequestId,
  ] = useState(null);


  /* ---------------------------------------------------------
     ADMIN QUESTION MANAGEMENT
  --------------------------------------------------------- */

  const [
    showAdminQuestionManager,
    setShowAdminQuestionManager,
  ] = useState(false);

  const [
    adminQuestions,
    setAdminQuestions,
  ] = useState([]);

  const [
    adminQuestionsLoading,
    setAdminQuestionsLoading,
  ] = useState(false);

  const [
    adminQuestionsError,
    setAdminQuestionsError,
  ] = useState('');

  const [
    adminQuestionFilter,
    setAdminQuestionFilter,
  ] = useState('');

  const [
    adminQuestionStatusFilter,
    setAdminQuestionStatusFilter,
  ] = useState('all');

  const [
    editingAdminQuestionId,
    setEditingAdminQuestionId,
  ] = useState(null);

  const [
    adminQuestionForm,
    setAdminQuestionForm,
  ] = useState(
    createEmptyAdminQuestionForm
  );

  const [
    adminQuestionSaving,
    setAdminQuestionSaving,
  ] = useState(false);

  const [
    adminQuestionStatusSavingId,
    setAdminQuestionStatusSavingId,
  ] = useState(null);

  const [
    adminDeletingQuestionId,
    setAdminDeletingQuestionId,
  ] = useState(null);

  const [
    adminDeletingTopicId,
    setAdminDeletingTopicId,
  ] = useState(null);

  const [
    adminQuestionMessage,
    setAdminQuestionMessage,
  ] = useState('');

  const [
    adminCreatingNewTopic,
    setAdminCreatingNewTopic,
  ] = useState(false);

  /* ---------------------------------------------------------
     MASTER QUESTION LIST
  --------------------------------------------------------- */

  const [
    allQuestions,
    setAllQuestions,
  ] = useState([]);


  /* ---------------------------------------------------------
     DYNAMIC CURRICULUM TOPICS

     The original 21 topics keep their custom icons/styles.
     Any new topic created by an admin is discovered from
     MongoDB and automatically added to the curriculum UI.
  --------------------------------------------------------- */

  const curriculumCategories =
    useMemo(() => {
      const topicMap = new Map(
        categories.map(category => [
          category.key,
          category,
        ])
      );

      allQuestions.forEach(question => {
        const key = String(
          question?.category || ''
        ).trim();

        if (!key) {
          return;
        }

        const existing = topicMap.get(key);

        if (existing) {
          topicMap.set(key, {
            ...existing,
            number:
              Number(question?.topicNumber) ||
              existing.number,
            title:
              question?.topicName ||
              existing.title,
          });
          return;
        }

        topicMap.set(key, {
          number:
            Number(question?.topicNumber) || 999,
          key,
          title:
            question?.topicName ||
            question?.topicId ||
            key,
          description:
            'Custom MongoDB DBA curriculum topic managed from the Admin Question Manager.',
          icon: BookOpen,
          level:
            question?.level ||
            'Foundation → L3+',
          colorClass: 'dynamic-topic',
        });
      });

      return Array.from(topicMap.values())
        .sort((a, b) =>
          Number(a.number || 0) -
          Number(b.number || 0)
        );
    }, [allQuestions]);


  /* ---------------------------------------------------------
     CURRENT TOPIC QUESTIONS
  --------------------------------------------------------- */

  const [
    questions,
    setQuestions,
  ] = useState([]);


  /* ---------------------------------------------------------
     SELECTED TOPIC
  --------------------------------------------------------- */

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);


  /* ---------------------------------------------------------
     CURRENT QUESTION
  --------------------------------------------------------- */

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);


  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    loadingCategory,
    setLoadingCategory,
  ] = useState(false);


  /* ---------------------------------------------------------
     ERROR
  --------------------------------------------------------- */

  const [
    error,
    setError,
  ] = useState('');


  /* ---------------------------------------------------------
     PROGRESS
  --------------------------------------------------------- */

  const [
    completedQuestions,
    setCompletedQuestions,
  ] = useState({});

  const [
    savingProgress,
    setSavingProgress,
  ] = useState(false);


  /* ---------------------------------------------------------
     BOOKMARKS
  --------------------------------------------------------- */

  const [
    bookmarkedQuestionIds,
    setBookmarkedQuestionIds,
  ] = useState([]);

  const [
    savingBookmarkId,
    setSavingBookmarkId,
  ] = useState(null);

  const [
    showBookmarks,
    setShowBookmarks,
  ] = useState(false);


  /* ---------------------------------------------------------
     SEARCH
  --------------------------------------------------------- */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

  const [
    searchTopic,
    setSearchTopic,
  ] = useState('');

  const [
    searchDifficulty,
    setSearchDifficulty,
  ] = useState('');

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState('');

  const [
    showSearchResults,
    setShowSearchResults,
  ] = useState(false);


  /* =========================================================
     AUTHENTICATION SESSION CHECK
  ========================================================= */

  useEffect(() => {

    let logoutTimer;

    const validateSession =
      async () => {

        /*
         * No stored token means the user
         * needs to log in.
         */

        if (!authToken) {

          setAuthUser(null);
          setAuthLoading(false);

          return;
        }


        try {

          setAuthLoading(true);

          const session =
            await getSession(authToken);


          setAuthUser({
            username: session.username,
            role: session.role,
            expiresAt: session.expiresAt,
          });


          /*
           * Calculate exactly how much
           * time remains in the backend
           * session.
           */

          const expiryTime =
            new Date(
              session.expiresAt
            ).getTime();

          const remainingTime =
            expiryTime - Date.now();


          /*
           * Session already expired.
           */

          if (remainingTime <= 0) {

            sessionStorage.removeItem(
              'authToken'
            );

            setAuthToken(null);
            setAuthUser(null);

            return;
          }


          /*
           * Automatically log the user
           * out when the backend session
           * expiry time is reached.
           */

          logoutTimer = setTimeout(
            () => {

              sessionStorage.removeItem(
                'authToken'
              );

              setAuthToken(null);
              setAuthUser(null);

            },
            remainingTime
          );


        } catch (err) {

          console.error(
            'Session validation failed:',
            err
          );

          sessionStorage.removeItem(
            'authToken'
          );

          setAuthToken(null);
          setAuthUser(null);

        } finally {

          setAuthLoading(false);

        }
      };


    validateSession();


    return () => {

      if (logoutTimer) {

        clearTimeout(
          logoutTimer
        );

      }
    };

  }, [authToken]);


  /* =========================================================
     LOGIN HANDLER
  ========================================================= */

  const handleLogin =
    async (event) => {

      event.preventDefault();

      try {

        setLoginLoading(true);
        setLoginError('');


        const response =
          await login(
            loginUsername.trim(),
            loginPassword
          );


        sessionStorage.setItem(
          'authToken',
          response.token
        );


        setAuthToken(
          response.token
        );


        /*
         * Clear password immediately
         * after successful login.
         */

        setLoginPassword('');


      } catch (err) {

        console.error(
          'Login failed:',
          err
        );

        setLoginError(
          err.message ||
          'Unable to login.'
        );

      } finally {

        setLoginLoading(false);

      }
    };


  /* =========================================================
     LOGOUT HANDLER
  ========================================================= */

  const handleLogout =
    async () => {

      const token =
        authToken;


      /*
       * Remove local authentication
       * immediately.
       */

      sessionStorage.removeItem(
        'authToken'
      );

      setAuthToken(null);
      setAuthUser(null);
      setCompletedQuestions({});
      setBookmarkedQuestionIds([]);
      setShowBookmarks(false);
      setShowSearchResults(false);
      setSearchResults([]);
      setSearchQuery('');
      setSearchTopic('');
      setSearchDifficulty('');
      setSearchError('');

      setShowAdminQuestionManager(false);
      setAdminQuestions([]);
      setAdminQuestionsError('');
      setAdminQuestionFilter('');
      setAdminQuestionStatusFilter('all');
      setEditingAdminQuestionId(null);
      setAdminQuestionForm(
        createEmptyAdminQuestionForm()
      );
      setAdminQuestionMessage('');
      setAdminDeletingQuestionId(null);
      setAdminDeletingTopicId(null);
      setAdminCreatingNewTopic(false);

      setLoginUsername('');
      setLoginPassword('');
      setLoginError('');


      /*
       * Also remove the server-side
       * session.
       */

      if (token) {

        try {

          await logout(token);

        } catch (err) {

          /*
           * Local logout has already
           * happened, so a network
           * failure here should not
           * keep the user logged in.
           */

          console.error(
            'Server logout failed:',
            err
          );

        }
      }
    };


  /* =========================================================
     SUBMIT QUESTION REQUEST
  ========================================================= */

  const handleQuestionRequestSubmit =
    async (event) => {

      event.preventDefault();

      try {

        setRequestLoading(true);
        setRequestError('');
        setRequestMessage('');

        await submitQuestionRequest({
          topic: requestTopic,
          question: requestQuestion,
          notes: requestNotes,
        });

        setRequestQuestion('');
        setRequestNotes('');

        setRequestMessage(
          'Your question request was submitted successfully.'
        );

      } catch (err) {

        console.error(
          'Question request failed:',
          err
        );

        setRequestError(
          err?.message ||
          'Unable to submit your question request.'
        );

      } finally {

        setRequestLoading(false);
      }
    };


  /* =========================================================
     LOAD ADMIN QUESTION REQUESTS
  ========================================================= */

  const loadAdminQuestionRequests =
    async () => {

      if (authUser?.role !== 'admin') {
        return;
      }

      try {

        setAdminRequestsLoading(true);
        setAdminRequestsError('');

        const response =
          await getQuestionRequests();

        setAdminRequests(
          Array.isArray(response?.requests)
            ? response.requests
            : []
        );

      } catch (err) {

        console.error(
          'Failed to load admin question requests:',
          err
        );

        setAdminRequestsError(
          err?.message ||
          'Unable to load question requests.'
        );

      } finally {

        setAdminRequestsLoading(false);
      }
    };


  /* =========================================================
     UPDATE ADMIN REQUEST STATUS
  ========================================================= */

  const handleRequestStatusChange =
    async (
      requestId,
      status
    ) => {

      try {

        setUpdatingRequestId(
          requestId
        );

        setAdminRequestsError('');

        await updateQuestionRequestStatus(
          requestId,
          status
        );

        await loadAdminQuestionRequests();

      } catch (err) {

        console.error(
          'Failed to update question request:',
          err
        );

        setAdminRequestsError(
          err?.message ||
          'Unable to update the request.'
        );

      } finally {

        setUpdatingRequestId(null);
      }
    };


  /* =========================================================
     AUTO LOAD ADMIN REQUEST QUEUE
  ========================================================= */

  useEffect(() => {

    if (
      authUser?.role !== 'admin' ||
      !authToken
    ) {
      setAdminRequests([]);
      return;
    }

    loadAdminQuestionRequests();

  }, [authUser?.role, authToken]);

    
  /* =========================================================
     AUTHENTICATION EXPIRY EVENT
  ========================================================= */

  useEffect(() => {

    const handleAuthExpired =
      () => {

        sessionStorage.removeItem(
          'authToken'
        );

        setAuthToken(null);
        setAuthUser(null);
        setCompletedQuestions({});
        setBookmarkedQuestionIds([]);
        setShowBookmarks(false);
        setShowSearchResults(false);
        setSearchResults([]);
        setSearchQuery('');
        setSearchTopic('');
        setSearchDifficulty('');
        setSearchError('');

        setAllQuestions([]);
        setQuestions([]);
        setSelectedCategory(null);
        setCurrentIndex(0);

        setLoginError(
          'Your session has expired. Please login again.'
        );
      };


    window.addEventListener(
      'auth-expired',
      handleAuthExpired
    );


    return () => {

      window.removeEventListener(
        'auth-expired',
        handleAuthExpired
      );
    };

  }, []);


  /* =========================================================
     LOAD COMPLETE CURRICULUM + USER PROGRESS
  ========================================================= */

  useEffect(() => {

    if (!authToken) {

      setAllQuestions([]);
      setCompletedQuestions({});
      setLoading(false);

      return;
    }

    if (!authUser?.username) {
      return;
    }


    const loadCurriculumAndProgress =
      async () => {

        try {

          setLoading(true);
          setError('');

          const response =
            await getQuestions();

          const list =
            normalizeQuestions(
              response
            );

          console.log(
            'All curriculum questions:',
            list
          );

          /*
           * Load the authenticated user's
           * MongoDB-backed progress.
           */

          let progressResponse =
            await getProgress();

          let progressRecords =
            Array.isArray(
              progressResponse?.progress
            )
              ? progressResponse.progress
              : [];

          /*
           * One-time migration of the old
           * localStorage progress into MongoDB.
           *
           * The old data is intentionally kept
           * in localStorage as a backup.
           */

          const migrationKey =
            `dbaLearningProgressV2Migrated:${authUser.username}`;

          const migrationDone =
            localStorage.getItem(
              migrationKey
            ) === 'true';

          if (!migrationDone) {

            try {

              const legacyRaw =
                localStorage.getItem(
                  'dbaLearningProgressV2'
                );

              const legacyProgress =
                legacyRaw
                  ? JSON.parse(legacyRaw)
                  : {};

              const existingQuestionIds =
                new Set(
                  progressRecords
                    .map(item =>
                      item?.questionId
                        ? String(item.questionId)
                        : ''
                    )
                    .filter(Boolean)
                );

              const migrationQuestionIds = [];

              Object.entries(
                legacyProgress || {}
              ).forEach(
                ([categoryKey, indexes]) => {

                  if (!Array.isArray(indexes)) {
                    return;
                  }

                  const categoryQuestions =
                    list
                      .filter(
                        question =>
                          question?.category ===
                          categoryKey
                      )
                      .sort(
                        (a, b) =>
                          Number(
                            a.order ??
                            a.questionNumber ??
                            0
                          ) -
                          Number(
                            b.order ??
                            b.questionNumber ??
                            0
                          )
                      );

                  indexes.forEach(index => {

                    const question =
                      categoryQuestions[
                        Number(index)
                      ];

                    const questionId =
                      question?._id
                        ? String(question._id)
                        : '';

                    if (
                      questionId &&
                      !existingQuestionIds.has(
                        questionId
                      )
                    ) {
                      existingQuestionIds.add(
                        questionId
                      );

                      migrationQuestionIds.push(
                        questionId
                      );
                    }
                  });
                }
              );

              if (
                migrationQuestionIds.length > 0
              ) {

                const results =
                  await Promise.allSettled(
                    migrationQuestionIds.map(
                      questionId =>
                        saveQuestionCompleted(
                          questionId
                        )
                    )
                  );

                const migrationFailed =
                  results.some(
                    result =>
                      result.status ===
                      'rejected'
                  );

                if (!migrationFailed) {
                  localStorage.setItem(
                    migrationKey,
                    'true'
                  );
                }

                progressResponse =
                  await getProgress();

                progressRecords =
                  Array.isArray(
                    progressResponse?.progress
                  )
                    ? progressResponse.progress
                    : [];

              } else {

                localStorage.setItem(
                  migrationKey,
                  'true'
                );
              }

            } catch (migrationError) {

              console.error(
                'Legacy progress migration failed:',
                migrationError
              );
            }
          }

          const completedQuestionIds =
            new Set(
              progressRecords
                .filter(
                  item =>
                    item?.completed !== false
                )
                .map(item =>
                  item?.questionId
                    ? String(item.questionId)
                    : ''
                )
                .filter(Boolean)
            );

          const progressByCategory = {};

          categories.forEach(category => {

            const categoryQuestions =
              list
                .filter(
                  question =>
                    question?.category ===
                    category.key
                )
                .sort(
                  (a, b) =>
                    Number(
                      a.order ??
                      a.questionNumber ??
                      0
                    ) -
                    Number(
                      b.order ??
                      b.questionNumber ??
                      0
                    )
                );

            const completedIndexes = [];

            categoryQuestions.forEach(
              (question, index) => {

                const questionId =
                  question?._id
                    ? String(question._id)
                    : '';

                if (
                  questionId &&
                  completedQuestionIds.has(
                    questionId
                  )
                ) {
                  completedIndexes.push(index);
                }
              }
            );

            if (completedIndexes.length > 0) {
              progressByCategory[
                category.key
              ] = completedIndexes;
            }
          });

          const bookmarksResponse =
            await getBookmarks();

          const bookmarkRecords =
            Array.isArray(
              bookmarksResponse?.bookmarks
            )
              ? bookmarksResponse.bookmarks
              : [];

          const bookmarkIds =
            bookmarkRecords
              .map(item =>
                item?.questionId
                  ? String(item.questionId)
                  : ''
              )
              .filter(Boolean);

          setAllQuestions(list);
          setCompletedQuestions(
            progressByCategory
          );
          setBookmarkedQuestionIds(
            bookmarkIds
          );

        } catch (err) {

          console.error(
            'Failed to load questions or progress:',
            err
          );

          setError(
            err?.message ||
            'Unable to load the curriculum.'
          );

        } finally {

          setLoading(false);
        }
      };


    loadCurriculumAndProgress();

  }, [authToken, authUser?.username]);


  /* =========================================================
     QUESTION COUNT BY CATEGORY
  ========================================================= */

  const questionCounts =
    useMemo(() => {

      const counts = {};

      allQuestions.forEach(
        question => {

          if (!question?.category) {
            return;
          }

          counts[question.category] =
            (
              counts[
                question.category
              ] || 0
            ) + 1;
        }
      );

      return counts;

    }, [allQuestions]);


  /* =========================================================
     AVAILABLE QUESTIONS
  ========================================================= */

  const getAvailableQuestions =
    categoryKey =>
      questionCounts[
        categoryKey
      ] || 0;


  /* =========================================================
     PROGRESS HELPERS
  ========================================================= */

  const getCompletedQuestions =
    categoryKey =>
      completedQuestions[
        categoryKey
      ] || [];


  const getCompletedCount =
    categoryKey =>
      getCompletedQuestions(
        categoryKey
      ).length;


  /* =========================================================
     TOTAL CURRICULUM STATS
  ========================================================= */

  const totalAvailableQuestions =
    Object.values(
      questionCounts
    ).reduce(
      (total, count) =>
        total + count,
      0
    );


  const totalCompletedQuestions =
    categories.reduce(
      (total, category) =>
        total +
        getCompletedCount(
          category.key
        ),
      0
    );


  /* =========================================================
     OPEN TOPIC
  ========================================================= */

  const startLearning =
    async category => {

      const availableQuestions =
        getAvailableQuestions(
          category.key
        );


      if (
        availableQuestions === 0
      ) {
        return;
      }


      try {

        setLoadingCategory(true);
        setError('');

        console.log(
          'Starting category:',
          category.key
        );


        const response =
          await getQuestionsByCategory(
            category.key
          );


        const list =
          normalizeQuestions(
            response
          );


        console.log(
          'Category questions:',
          list
        );


        if (
          !Array.isArray(list) ||
          list.length === 0
        ) {

          throw new Error(
            `No questions found for ${category.title}.`
          );
        }


        /*
         * Defensive frontend sort.
         *
         * Backend already sorts,
         * but this guarantees correct
         * order even if API changes.
         */

        const sortedQuestions =
          [...list].sort(
            (a, b) =>
              Number(
                a.order ??
                a.questionNumber ??
                0
              ) -
              Number(
                b.order ??
                b.questionNumber ??
                0
              )
          );


        setQuestions(
          sortedQuestions
        );

        setSelectedCategory(
          category
        );


        /*
         * Continue from first
         * unanswered question.
         */

        const completed =
          getCompletedQuestions(
            category.key
          );


        let startingIndex = 0;


        while (
          startingIndex <
            sortedQuestions.length &&
          completed.includes(
            startingIndex
          )
        ) {

          startingIndex += 1;
        }


        if (
          startingIndex >=
          sortedQuestions.length
        ) {

          startingIndex =
            sortedQuestions.length - 1;
        }


        setCurrentIndex(
          Math.max(
            startingIndex,
            0
          )
        );


        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

      } catch (err) {

        console.error(
          'Failed to load category:',
          err
        );

        setError(
          err?.message ||
          'Unable to load this topic.'
        );

      } finally {

        setLoadingCategory(false);
      }
    };


  /* =========================================================
     BACK TO HOME
  ========================================================= */

  const goBackHome = () => {

    setShowBookmarks(false);
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchError('');
    setSelectedCategory(null);

    setQuestions([]);

    setCurrentIndex(0);

    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  /* =========================================================
     GLOBAL SEARCH
  ========================================================= */

  const handleSearchSubmit =
    async event => {

      event?.preventDefault?.();

      if (
        !searchQuery.trim() &&
        !searchTopic &&
        !searchDifficulty
      ) {
        setSearchError(
          'Enter a search term or select a filter.'
        );
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError('');
        setError('');

        const response =
          await runQuestionSearch({
            query: searchQuery,
            topic: searchTopic,
            difficulty: searchDifficulty,
          });

        const results =
          Array.isArray(response?.questions)
            ? response.questions
            : [];

        setSearchResults(results);
        setShowSearchResults(true);
        setShowBookmarks(false);
        setSelectedCategory(null);
        setQuestions([]);
        setCurrentIndex(0);

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

      } catch (err) {
        console.error(
          'Question search failed:',
          err
        );

        setSearchError(
          err?.message ||
          'Unable to search questions.'
        );
      } finally {
        setSearchLoading(false);
      }
    };


  const openSearchQuestion =
    question => {

      const category =
        curriculumCategories.find(
          item =>
            item.key === question?.category
        );

      if (!category) {
        setSearchError(
          'Unable to open this result because its topic is unavailable.'
        );
        return;
      }

      const categoryQuestions =
        allQuestions
          .filter(
            item =>
              item?.category ===
              category.key
          )
          .sort(
            (a, b) =>
              Number(
                a.order ??
                a.questionNumber ??
                0
              ) -
              Number(
                b.order ??
                b.questionNumber ??
                0
              )
          );

      const questionId =
        question?._id
          ? String(question._id)
          : '';

      const index =
        categoryQuestions.findIndex(
          item =>
            String(item?._id || '') ===
            questionId
        );

      if (index < 0) {
        setSearchError(
          'Unable to locate this question in the curriculum.'
        );
        return;
      }

      setQuestions(categoryQuestions);
      setSelectedCategory(category);
      setCurrentIndex(index);
      setShowSearchResults(false);
      setShowBookmarks(false);
      setSearchError('');
      setError('');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };



  /* =========================================================
     ADMIN QUESTION MANAGEMENT
  ========================================================= */

  const loadAdminQuestions =
    async () => {

      if (authUser?.role !== 'admin') {
        return;
      }

      try {
        setAdminQuestionsLoading(true);
        setAdminQuestionsError('');

        const response =
          await getAdminQuestions();

        setAdminQuestions(
          Array.isArray(response?.questions)
            ? response.questions
            : []
        );

      } catch (err) {
        console.error(
          'Failed to load admin questions:',
          err
        );

        setAdminQuestionsError(
          err?.message ||
          'Unable to load questions.'
        );

      } finally {
        setAdminQuestionsLoading(false);
      }
    };


  const toggleAdminQuestionManager =
    async () => {

      const nextState =
        !showAdminQuestionManager;

      setShowAdminQuestionManager(
        nextState
      );

      setAdminQuestionMessage('');
      setAdminQuestionsError('');

      if (
        nextState &&
        adminQuestions.length === 0
      ) {
        await loadAdminQuestions();
      }
    };


  const startNewAdminQuestion = () => {
    setEditingAdminQuestionId(null);
    setAdminCreatingNewTopic(false);
    setAdminQuestionForm(
      createEmptyAdminQuestionForm()
    );
    setAdminQuestionMessage('');
    setAdminQuestionsError('');
  };


  const startEditAdminQuestion =
    question => {

      const answer =
        question?.answer || {};

      setEditingAdminQuestionId(
        String(question?._id || '')
      );
      setAdminCreatingNewTopic(false);

      setAdminQuestionForm({
        category:
          question?.category || '',
        topicId:
          question?.topicId || '',
        topicNumber:
          String(question?.topicNumber ?? ''),
        topicName:
          question?.topicName || '',
        questionNumber:
          String(question?.questionNumber ?? ''),
        question:
          question?.question || '',
        level:
          question?.level || '',
        difficulty:
          question?.difficulty || '',
        order:
          String(question?.order ?? ''),
        answer: {
          groundZero:
            answer.groundZero || '',
          coreConcept:
            answer.coreConcept || '',
          detailedExplanation:
            answer.detailedExplanation || '',
          internalWorking:
            answer.internalWorking || '',
          architecture:
            answer.architecture || '',
          examples:
            arrayToLines(answer.examples),
          commands:
            JSON.stringify(
              Array.isArray(answer.commands)
                ? answer.commands
                : [],
              null,
              2
            ),
          productionScenario:
            answer.productionScenario || '',
          troubleshootingApproach:
            answer.troubleshootingApproach || '',
          commonMistakes:
            arrayToLines(answer.commonMistakes),
          bestPractices:
            arrayToLines(answer.bestPractices),
          interviewAnswer:
            answer.interviewAnswer || '',
          keyTakeaways:
            arrayToLines(answer.keyTakeaways),
        },
      });

      setAdminQuestionMessage('');
      setAdminQuestionsError('');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };



  const handleAdminTopicSelection =
    topicKey => {

      if (topicKey === '__new_topic__') {
        const nextTopicNumber =
          adminTopicOptions.reduce(
            (highest, topic) =>
              Math.max(
                highest,
                Number(topic?.topicNumber || 0)
              ),
            0
          ) + 1;

        setAdminCreatingNewTopic(true);
        setEditingAdminQuestionId(null);
        setAdminQuestionForm(previous => ({
          ...createEmptyAdminQuestionForm(),
          topicNumber: String(nextTopicNumber),
          questionNumber: '1',
          order: '1',
          answer: {
            ...createEmptyAdminQuestionForm().answer,
          },
        }));
        setAdminQuestionMessage('');
        setAdminQuestionsError('');
        return;
      }

      setAdminCreatingNewTopic(false);

      const selectedTopic =
        adminTopicOptions.find(
          topic =>
            topic.key === topicKey
        );

      if (!selectedTopic) {
        return;
      }


      const topicQuestions =
        adminQuestions.filter(
          question =>
            question?.category ===
              selectedTopic.category
        );


      const nextQuestionNumber =
        topicQuestions.reduce(
          (highest, question) =>
            Math.max(
              highest,
              Number(
                question?.questionNumber ||
                0
              )
            ),
          0
        ) + 1;


      const nextOrder =
        topicQuestions.reduce(
          (highest, question) =>
            Math.max(
              highest,
              Number(
                question?.order ||
                0
              )
            ),
          0
        ) + 1;


      setAdminQuestionForm(
        previous => {

          const sameTopic =
            previous.category ===
              selectedTopic.category &&
            previous.topicId ===
              selectedTopic.topicId;


          return {
            ...previous,

            category:
              selectedTopic.category,

            topicId:
              selectedTopic.topicId,

            topicNumber:
              String(
                selectedTopic.topicNumber
              ),

            topicName:
              selectedTopic.topicName,

            questionNumber:
              editingAdminQuestionId &&
              sameTopic
                ? previous.questionNumber
                : String(
                    nextQuestionNumber
                  ),

            order:
              editingAdminQuestionId &&
              sameTopic
                ? previous.order
                : String(
                    nextOrder
                  ),
          };
        }
      );


      setAdminQuestionMessage('');
      setAdminQuestionsError('');
    };


  const handleAdminQuestionField =
    (field, value) => {
      setAdminQuestionForm(
        previous => ({
          ...previous,
          [field]: value,
        })
      );
    };


  const handleNewAdminTopicName =
    value => {
      const normalized = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      setAdminQuestionForm(previous => ({
        ...previous,
        topicName: value,
        topicId: normalized,
        category: normalized.replace(/-/g, '_'),
      }));
    };


  const handleAdminAnswerField =
    (field, value) => {
      setAdminQuestionForm(
        previous => ({
          ...previous,
          answer: {
            ...previous.answer,
            [field]: value,
          },
        })
      );
    };


  const buildAdminQuestionPayload = () => {
    let commands;

    try {
      commands = JSON.parse(
        adminQuestionForm.answer.commands || '[]'
      );
    } catch {
      throw new Error(
        'Commands must be valid JSON.'
      );
    }

    if (!Array.isArray(commands)) {
      throw new Error(
        'Commands must be a JSON array.'
      );
    }

    return {
      category:
        adminQuestionForm.category.trim(),
      topicId:
        adminQuestionForm.topicId.trim(),
      topicNumber:
        Number(adminQuestionForm.topicNumber),
      topicName:
        adminQuestionForm.topicName.trim(),
      questionNumber:
        Number(adminQuestionForm.questionNumber),
      question:
        adminQuestionForm.question.trim(),
      level:
        adminQuestionForm.level.trim(),
      difficulty:
        adminQuestionForm.difficulty.trim(),
      order:
        Number(adminQuestionForm.order),
      answer: {
        groundZero:
          adminQuestionForm.answer.groundZero.trim(),
        coreConcept:
          adminQuestionForm.answer.coreConcept.trim(),
        detailedExplanation:
          adminQuestionForm.answer.detailedExplanation.trim(),
        internalWorking:
          adminQuestionForm.answer.internalWorking.trim(),
        architecture:
          adminQuestionForm.answer.architecture.trim(),
        examples:
          linesToArray(
            adminQuestionForm.answer.examples
          ),
        commands,
        productionScenario:
          adminQuestionForm.answer.productionScenario.trim(),
        troubleshootingApproach:
          adminQuestionForm.answer.troubleshootingApproach.trim(),
        commonMistakes:
          linesToArray(
            adminQuestionForm.answer.commonMistakes
          ),
        bestPractices:
          linesToArray(
            adminQuestionForm.answer.bestPractices
          ),
        interviewAnswer:
          adminQuestionForm.answer.interviewAnswer.trim(),
        keyTakeaways:
          linesToArray(
            adminQuestionForm.answer.keyTakeaways
          ),
      },
    };
  };


  const refreshCurriculumQuestions =
    async () => {
      const refreshed =
        await getQuestions();

      const list =
        Array.isArray(refreshed)
          ? refreshed
          : [];

      setAllQuestions(list);

      if (selectedCategory) {
        const currentQuestionId =
          questions[currentIndex]?._id
            ? String(
                questions[currentIndex]._id
              )
            : '';

        const categoryQuestions =
          list
            .filter(
              question =>
                question?.category ===
                selectedCategory.key
            )
            .sort(
              (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
            );

        setQuestions(categoryQuestions);

        const nextIndex =
          categoryQuestions.findIndex(
            question =>
              String(question?._id || '') ===
              currentQuestionId
          );

        setCurrentIndex(
          nextIndex >= 0
            ? nextIndex
            : 0
        );
      }
    };


  const saveAdminQuestion =
    async event => {
      event?.preventDefault?.();

      try {
        setAdminQuestionSaving(true);
        setAdminQuestionsError('');
        setAdminQuestionMessage('');

        const payload =
          buildAdminQuestionPayload();

        if (editingAdminQuestionId) {
          await updateAdminQuestion(
            editingAdminQuestionId,
            payload
          );

          setAdminQuestionMessage(
            'Question updated successfully.'
          );
        } else {
          await createAdminQuestion(
            payload
          );

          setAdminQuestionMessage(
            'Question created successfully.'
          );
        }

        await Promise.all([
          loadAdminQuestions(),
          refreshCurriculumQuestions(),
        ]);

        setEditingAdminQuestionId(null);
        setAdminQuestionForm(
          createEmptyAdminQuestionForm()
        );

      } catch (err) {
        console.error(
          'Failed to save admin question:',
          err
        );

        setAdminQuestionsError(
          err?.message ||
          'Unable to save question.'
        );

      } finally {
        setAdminQuestionSaving(false);
      }
    };


  const changeAdminQuestionStatus =
    async question => {
      const questionId =
        String(question?._id || '');

      if (!questionId) {
        return;
      }

      const currentlyActive =
        question?.active !== false;

      try {
        setAdminQuestionStatusSavingId(
          questionId
        );
        setAdminQuestionsError('');
        setAdminQuestionMessage('');

        await updateAdminQuestionStatus(
          questionId,
          !currentlyActive
        );

        setAdminQuestionMessage(
          currentlyActive
            ? 'Question disabled successfully.'
            : 'Question enabled successfully.'
        );

        await Promise.all([
          loadAdminQuestions(),
          refreshCurriculumQuestions(),
        ]);

      } catch (err) {
        console.error(
          'Failed to update question status:',
          err
        );

        setAdminQuestionsError(
          err?.message ||
          'Unable to update question status.'
        );

      } finally {
        setAdminQuestionStatusSavingId(null);
      }
    };


  const permanentlyDeleteAdminQuestion =
    async question => {
      const questionId =
        String(question?._id || '');

      if (!questionId) {
        return;
      }

      const questionLabel =
        String(
          question?.question ||
          'this question'
        ).trim();

      const confirmed =
        window.confirm(
          `Permanently delete this question?\n\n${questionLabel}\n\nThis will also delete its saved progress and bookmark records. This action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setAdminDeletingQuestionId(
          questionId
        );
        setAdminQuestionsError('');
        setAdminQuestionMessage('');

        const response =
          await deleteAdminQuestion(
            questionId
          );

        if (
          editingAdminQuestionId ===
          questionId
        ) {
          setEditingAdminQuestionId(null);
          setAdminCreatingNewTopic(false);
          setAdminQuestionForm(
            createEmptyAdminQuestionForm()
          );
        }

        setBookmarkedQuestionIds(
          previous =>
            previous.filter(
              id => id !== questionId
            )
        );

        const deleted =
          response?.deleted || {};

        setAdminQuestionMessage(
          `Question permanently deleted. Removed ${deleted.progressRecords || 0} progress record(s) and ${deleted.bookmarks || 0} bookmark(s).`
        );

        await Promise.all([
          loadAdminQuestions(),
          refreshCurriculumQuestions(),
        ]);

      } catch (err) {
        console.error(
          'Failed to permanently delete question:',
          err
        );

        setAdminQuestionsError(
          err?.message ||
          'Unable to permanently delete question.'
        );

      } finally {
        setAdminDeletingQuestionId(null);
      }
    };


  const permanentlyDeleteAdminTopic =
    async topic => {
      const topicId =
        String(topic?.topicId || '').trim();

      const topicName =
        String(topic?.topicName || '').trim();

      if (!topicId || !topicName) {
        return;
      }

      const confirmation =
        window.prompt(
          `PERMANENT TOPIC DELETE\n\nYou are about to delete \"${topicName}\" and every question inside it. Progress and bookmark records for those questions will also be deleted.\n\nType the exact topic name to continue:`
        );

      if (confirmation === null) {
        return;
      }

      if (confirmation.trim() !== topicName) {
        setAdminQuestionsError(
          'Topic was not deleted because the confirmation text did not exactly match the topic name.'
        );
        return;
      }

      const finalConfirmation =
        window.confirm(
          `Final confirmation: permanently delete \"${topicName}\"? This cannot be undone.`
        );

      if (!finalConfirmation) {
        return;
      }

      try {
        setAdminDeletingTopicId(topicId);
        setAdminQuestionsError('');
        setAdminQuestionMessage('');

        const response =
          await deleteAdminTopic(
            topicId,
            topicName
          );

        const deleted =
          response?.deleted || {};

        setEditingAdminQuestionId(null);
        setAdminCreatingNewTopic(false);
        setAdminQuestionForm(
          createEmptyAdminQuestionForm()
        );

        setAdminQuestionMessage(
          `Topic permanently deleted. Removed ${deleted.questions || 0} question(s), ${deleted.progressRecords || 0} progress record(s), and ${deleted.bookmarks || 0} bookmark(s).`
        );

        await Promise.all([
          loadAdminQuestions(),
          refreshCurriculumQuestions(),
        ]);

      } catch (err) {
        console.error(
          'Failed to permanently delete topic:',
          err
        );

        setAdminQuestionsError(
          err?.message ||
          'Unable to permanently delete topic.'
        );

      } finally {
        setAdminDeletingTopicId(null);
      }
    };


  const filteredAdminQuestions =
    useMemo(() => {
      const search =
        adminQuestionFilter
          .trim()
          .toLowerCase();

      return adminQuestions.filter(
        question => {
          const active =
            question?.active !== false;

          if (
            adminQuestionStatusFilter === 'active' &&
            !active
          ) {
            return false;
          }

          if (
            adminQuestionStatusFilter === 'disabled' &&
            active
          ) {
            return false;
          }

          if (!search) {
            return true;
          }

          const haystack = [
            question?.question,
            question?.topicName,
            question?.topicId,
            question?.category,
            question?.level,
            question?.difficulty,
            question?.questionNumber,
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(search);
        }
      );
    }, [
      adminQuestions,
      adminQuestionFilter,
      adminQuestionStatusFilter,
    ]);



  /* =========================================================
     ADMIN TOPIC OPTIONS
  ========================================================= */

  const adminTopicOptions =
    useMemo(() => {
      const topicMap =
        new Map();

      adminQuestions.forEach(
        question => {
          const topicNumber =
            Number(
              question?.topicNumber || 0
            );

          const category =
            String(
              question?.category || ''
            ).trim();

          const topicId =
            String(
              question?.topicId || ''
            ).trim();

          const topicName =
            String(
              question?.topicName || ''
            ).trim();

          if (
            !topicNumber ||
            !category ||
            !topicId ||
            !topicName
          ) {
            return;
          }

          const key =
            `${topicNumber}:${category}`;

          if (!topicMap.has(key)) {
            topicMap.set(
              key,
              {
                key,
                topicNumber,
                category,
                topicId,
                topicName,
              }
            );
          }
        }
      );

      return Array.from(
        topicMap.values()
      ).sort(
        (a, b) =>
          a.topicNumber -
          b.topicNumber
      );
    }, [adminQuestions]);


  const customAdminTopics =
    useMemo(() => {
      const builtInCategories =
        new Set(
          categories.map(
            category => category.key
          )
        );

      return adminTopicOptions.filter(
        topic =>
          !builtInCategories.has(
            topic.category
          )
      );
    }, [adminTopicOptions]);


  const selectedAdminTopicKey =
    useMemo(() => {
      const match =
        adminTopicOptions.find(
          topic =>
            topic.category ===
              adminQuestionForm.category &&
            topic.topicId ===
              adminQuestionForm.topicId &&
            String(
              topic.topicNumber
            ) ===
              String(
                adminQuestionForm.topicNumber
              )
        );

      return match?.key || '';
    }, [
      adminTopicOptions,
      adminQuestionForm.category,
      adminQuestionForm.topicId,
      adminQuestionForm.topicNumber,
    ]);


  /* =========================================================
     BOOKMARK HELPERS
  ========================================================= */

  const isQuestionBookmarked =
    question => {

      const questionId =
        question?._id
          ? String(question._id)
          : '';

      return Boolean(
        questionId &&
        bookmarkedQuestionIds.includes(
          questionId
        )
      );
    };


  const toggleBookmark =
    async question => {

      const questionId =
        question?._id
          ? String(question._id)
          : '';

      if (!questionId) {
        setError(
          'Unable to update bookmark because the question ID is missing.'
        );
        return;
      }

      const alreadyBookmarked =
        bookmarkedQuestionIds.includes(
          questionId
        );

      try {
        setSavingBookmarkId(questionId);
        setError('');

        if (alreadyBookmarked) {
          await removeBookmark(questionId);

          setBookmarkedQuestionIds(
            previous =>
              previous.filter(
                id => id !== questionId
              )
          );
        } else {
          await addBookmark(questionId);

          setBookmarkedQuestionIds(
            previous =>
              previous.includes(questionId)
                ? previous
                : [...previous, questionId]
          );
        }
      } catch (err) {
        console.error(
          'Failed to update bookmark:',
          err
        );

        setError(
          err?.message ||
          'Unable to update bookmark.'
        );
      } finally {
        setSavingBookmarkId(null);
      }
    };


  const openBookmarkedQuestion =
    question => {

      const category =
        curriculumCategories.find(
          item =>
            item.key === question?.category
        );

      if (!category) {
        setError(
          'Unable to open this bookmarked question because its topic is unavailable.'
        );
        return;
      }

      const categoryQuestions =
        allQuestions
          .filter(
            item =>
              item?.category === category.key
          )
          .sort(
            (a, b) =>
              Number(
                a.order ??
                a.questionNumber ??
                0
              ) -
              Number(
                b.order ??
                b.questionNumber ??
                0
              )
          );

      const questionId =
        question?._id
          ? String(question._id)
          : '';

      const index =
        categoryQuestions.findIndex(
          item =>
            String(item?._id || '') ===
            questionId
        );

      if (index < 0) {
        setError(
          'Unable to locate this bookmarked question.'
        );
        return;
      }

      setQuestions(categoryQuestions);
      setSelectedCategory(category);
      setCurrentIndex(index);
      setShowBookmarks(false);
      setError('');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };


  const bookmarkedQuestions =
    allQuestions.filter(
      question =>
        bookmarkedQuestionIds.includes(
          String(question?._id || '')
        )
    );


  /* =========================================================
     MARK COMPLETE
  ========================================================= */

  const markQuestionCompleted =
    async index => {

      if (!selectedCategory) {
        return false;
      }

      const question =
        questions[index];

      const questionId =
        question?._id
          ? String(question._id)
          : '';

      if (!questionId) {

        setError(
          'Unable to save progress because the question ID is missing.'
        );

        return false;
      }

      const categoryKey =
        selectedCategory.key;

      const existing =
        completedQuestions[
          categoryKey
        ] || [];

      if (existing.includes(index)) {
        return true;
      }

      try {

        setSavingProgress(true);
        setError('');

        await saveQuestionCompleted(
          questionId
        );

        setCompletedQuestions(
          previous => {

            const current =
              previous[
                categoryKey
              ] || [];

            if (
              current.includes(
                index
              )
            ) {
              return previous;
            }

            return {
              ...previous,

              [categoryKey]: [
                ...current,
                index,
              ].sort(
                (a, b) => a - b
              ),
            };
          }
        );

        return true;

      } catch (err) {

        console.error(
          'Failed to save question progress:',
          err
        );

        setError(
          err?.message ||
          'Unable to save your progress.'
        );

        return false;

      } finally {

        setSavingProgress(false);
      }
    };


  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  const nextQuestion = async () => {

    const saved =
      await markQuestionCompleted(
        currentIndex
      );

    if (!saved) {
      return;
    }


    if (
      currentIndex <
      questions.length - 1
    ) {

      setCurrentIndex(
        previous =>
          previous + 1
      );


      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }


    /*
     * Last question.
     */

    setTimeout(
      () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
      50
    );
  };


  /* =========================================================
     PREVIOUS QUESTION
  ========================================================= */

  const previousQuestion = () => {

    if (
      currentIndex <= 0
    ) {
      return;
    }


    setCurrentIndex(
      previous =>
        previous - 1
    );


    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const currentQuestion =
    questions[
      currentIndex
    ];


    /* =========================================================
     AUTHENTICATION LOADING SCREEN
  ========================================================= */

  if (authLoading) {

    return (
      <div className="app">

        <div className="loading-screen">

          <Loader2
            size={38}
            className="loading-spinner"
          />

          <p>
            Checking your session...
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     LOGIN PAGE
  ========================================================= */

  if (!authUser) {

    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-brand-icon">
            <Leaf size={32} />
          </div>


          <div className="login-heading">

            <span className="eyebrow">
              MONGODB DBA LEARNING HUB
            </span>

            <h1>
              Welcome Back
            </h1>

            <p>
              Sign in with your authorized
              account to continue learning.
            </p>

          </div>


          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="login-field">

              <label htmlFor="username">
                Username
              </label>

              <div className="login-input-wrapper">

                <KeyRound size={18} />

                <input
                  id="username"
                  type="text"
                  value={loginUsername}
                  onChange={(event) =>
                    setLoginUsername(
                      event.target.value
                    )
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={loginLoading}
                  required
                />

              </div>

            </div>


            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(event) =>
                    setLoginPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={loginLoading}
                  required
                />

              </div>

            </div>


            {loginError && (

              <div
                className="login-error"
                role="alert"
              >
                {loginError}
              </div>

            )}


            <button
              type="submit"
              className="login-button"
              disabled={
                loginLoading ||
                !loginUsername.trim() ||
                !loginPassword
              }
            >

              {loginLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="loading-spinner"
                  />

                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />

                  Sign In
                </>
              )}

            </button>

          </form>


          <div className="login-security">

            <LockKeyhole size={15} />

            <span>
              Access is restricted to
              authorized users.
            </span>

          </div>

        </div>

      </div>
    );
  }


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {

    return (
      <div className="app">

        <div className="loading-screen">

          <Loader2
            size={38}
            className="loading-spinner"
          />

          <p>
            Loading MongoDB DBA
            Learning Hub...
          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     SEARCH RESULTS PAGE
  ========================================================= */

  if (showSearchResults) {
    return (
      <div className="app">

        <header className="navbar">

          <div className="brand">
            <div className="brand-icon">
              <Leaf size={22} />
            </div>

            <div>
              <div className="brand-name">
                MongoDB
              </div>
              <div className="brand-subtitle">
                DBA LEARNING HUB
              </div>
            </div>
          </div>

          <div className="nav-user-area">
            <div className="signed-user">
              <span className="signed-user-name">
                {authUser.username}
              </span>
              <span className={`signed-user-role ${authUser.role}`}>
                {authUser.role}
              </span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={() => {
                setShowBookmarks(true);
                setShowSearchResults(false);
              }}
            >
              <Bookmark size={16} />
              My Bookmarks ({bookmarkedQuestionIds.length})
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

        </header>


        <main className="search-page">

          <div className="search-page-topbar">
            <button
              type="button"
              className="back-button"
              onClick={goBackHome}
            >
              <ArrowLeft size={18} />
              Back to Topics
            </button>
          </div>


          <section className="search-panel">

            <div className="search-panel-heading">
              <div className="search-panel-icon">
                <Search size={23} />
              </div>

              <div>
                <div className="section-eyebrow">
                  GLOBAL SEARCH
                </div>
                <h1>
                  Search Results
                </h1>
                <p>
                  {searchResults.length} matching question{searchResults.length === 1 ? '' : 's'} found.
                </p>
              </div>
            </div>


            <form
              className="global-search-form compact"
              onSubmit={handleSearchSubmit}
            >
              <div className="global-search-input">
                <Search size={18} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={event =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search oplog, rollback, WiredTiger, TLS, indexes..."
                  disabled={searchLoading}
                />
              </div>

              <select
                value={searchTopic}
                onChange={event =>
                  setSearchTopic(event.target.value)
                }
                disabled={searchLoading}
                aria-label="Search topic"
              >
                <option value="">All Topics</option>
                {curriculumCategories.map(category => (
                  <option
                    key={category.key}
                    value={category.key}
                  >
                    {category.title}
                  </option>
                ))}
              </select>

              <select
                value={searchDifficulty}
                onChange={event =>
                  setSearchDifficulty(event.target.value)
                }
                disabled={searchLoading}
                aria-label="Search difficulty"
              >
                <option value="">All Levels</option>
                <option value="Foundation">Foundation</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="L3+">L3+</option>
              </select>

              <button
                type="submit"
                className="global-search-button"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <Loader2
                    size={18}
                    className="loading-spinner"
                  />
                ) : (
                  <Search size={18} />
                )}
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchError && (
              <div className="inline-error">
                {searchError}
              </div>
            )}

          </section>


          {searchResults.length === 0 ? (

            <section className="search-empty">
              <Search size={28} />
              <h2>No matching questions</h2>
              <p>
                Try a different keyword or remove one of the filters.
              </p>
            </section>

          ) : (

            <section className="search-results-grid">

              {searchResults.map(question => {

                const category =
                  curriculumCategories.find(
                    item =>
                      item.key === question.category
                  );

                const questionId =
                  String(question?._id || '');

                const bookmarked =
                  isQuestionBookmarked(question);

                return (
                  <article
                    className="search-result-card"
                    key={questionId}
                  >

                    <div className="search-result-card-top">
                      <div className="search-result-topic">
                        {category?.title || question.topicName || question.category}
                      </div>

                      <button
                        type="button"
                        className={`search-bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
                        disabled={
                          savingBookmarkId === questionId
                        }
                        onClick={() =>
                          toggleBookmark(question)
                        }
                        aria-label={
                          bookmarked
                            ? 'Remove bookmark'
                            : 'Bookmark question'
                        }
                      >
                        {savingBookmarkId === questionId ? (
                          <Loader2
                            size={17}
                            className="loading-spinner"
                          />
                        ) : (
                          <Bookmark
                            size={17}
                            fill={
                              bookmarked
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        )}
                      </button>
                    </div>

                    <h2>
                      {question.question}
                    </h2>

                    <div className="search-result-meta">
                      {question.questionNumber && (
                        <span>Question {question.questionNumber}</span>
                      )}
                      {question.level && (
                        <span>{question.level}</span>
                      )}
                      {question.difficulty && (
                        <span>{question.difficulty}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="search-open-button"
                      onClick={() =>
                        openSearchQuestion(question)
                      }
                    >
                      Open Question
                      <ArrowRight size={17} />
                    </button>

                  </article>
                );
              })}

            </section>

          )}

        </main>

      </div>
    );
  }


  /* =========================================================
     MY BOOKMARKS PAGE
  ========================================================= */

  if (showBookmarks) {
    return (
      <div className="app">
        <header className="navbar">
          <div className="brand">
            <div className="brand-icon">
              <Leaf size={22} />
            </div>
            <div>
              <div className="brand-name">
                MongoDB
              </div>
              <div className="brand-subtitle">
                DBA LEARNING HUB
              </div>
            </div>
          </div>

          <div className="nav-user-area">
            <div className="signed-user">
              <span className="signed-user-name">
                {authUser.username}
              </span>
              <span className={`signed-user-role ${authUser.role}`}>
                {authUser.role}
              </span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="home-container">
          <section className="request-feature-section">
            <div className="request-feature-card">
              <div className="request-feature-heading">
                <div className="request-feature-icon">
                  <Bookmark size={24} />
                </div>
                <div>
                  <div className="section-eyebrow">
                    SAVED QUESTIONS
                  </div>
                  <h2>
                    My Bookmarks
                  </h2>
                  <p>
                    {bookmarkedQuestions.length} saved question{bookmarkedQuestions.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="request-refresh-button"
                onClick={goBackHome}
              >
                <ArrowLeft size={16} />
                Back to Topics
              </button>
            </div>
          </section>

          {error && (
            <div className="inline-error">
              {error}
            </div>
          )}

          {bookmarkedQuestions.length === 0 ? (
            <section className="request-feature-section">
              <div className="request-feature-card">
                <div>
                  <h2>No bookmarks yet</h2>
                  <p>
                    Open any question and select Bookmark to save it here.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="admin-request-section">
              <div className="admin-request-card">
                <div className="admin-request-list">
                  {bookmarkedQuestions.map(question => {
                    const category =
                      curriculumCategories.find(
                        item =>
                          item.key === question.category
                      );

                    const questionId =
                      String(question._id || '');

                    return (
                      <article
                        className="admin-request-item"
                        key={questionId}
                      >
                        <div className="admin-request-item-top">
                          <div>
                            <div className="admin-request-topic">
                              {category?.title || question.topicName || question.category}
                            </div>
                            <h3>
                              {question.question}
                            </h3>
                          </div>
                          <Bookmark
                            size={20}
                            fill="currentColor"
                          />
                        </div>

                        <div className="admin-request-meta">
                          {question.level && (
                            <span>Level: {question.level}</span>
                          )}
                          {question.difficulty && (
                            <span>Difficulty: {question.difficulty}</span>
                          )}
                          {question.questionNumber && (
                            <span>Question {question.questionNumber}</span>
                          )}
                        </div>

                        <div className="admin-request-actions">
                          <button
                            type="button"
                            className="status-action-button approved"
                            onClick={() =>
                              openBookmarkedQuestion(
                                question
                              )
                            }
                          >
                            Open Question
                          </button>

                          <button
                            type="button"
                            className="status-action-button rejected"
                            disabled={
                              savingBookmarkId ===
                              questionId
                            }
                            onClick={() =>
                              toggleBookmark(
                                question
                              )
                            }
                          >
                            {savingBookmarkId === questionId
                              ? 'Removing...'
                              : 'Remove Bookmark'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }


  /* =========================================================
     LEARNING PAGE
  ========================================================= */

  if (
    selectedCategory &&
    currentQuestion
  ) {

    const SelectedIcon =
      selectedCategory.icon;


    const completed =
      getCompletedQuestions(
        selectedCategory.key
      );


    const completedCount =
      completed.length;


    const totalQuestions =
      questions.length;


    const progress =
      totalQuestions > 0
        ? Math.round(
            (
              completedCount /
              totalQuestions
            ) * 100
          )
        : 0;


    const isCurrentCompleted =
      completed.includes(
        currentIndex
      );


    const isLastQuestion =
      currentIndex ===
      totalQuestions - 1;


    return (
      <div className="app">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="navbar">

          <div className="brand">

            <div className="brand-icon">
              <Leaf size={22} />
            </div>

            <div>

              <div className="brand-name">
                MongoDB
              </div>

              <div className="brand-subtitle">
                DBA LEARNING HUB
              </div>

            </div>

          </div>


          <div className="nav-user-area">

            <div className="nav-badge">
              <Zap size={14} />
              Learn • Practice • Master
            </div>

            <div className="signed-user">
              <span className="signed-user-name">
                {authUser.username}
              </span>
              <span className={`signed-user-role ${authUser.role}`}>
                {authUser.role}
              </span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

        </header>


        {/* ===================================================
            LEARNING AREA
        =================================================== */}

        <main className="learning-container">

          <div className="learning-topbar">

            <button
              type="button"
              className="back-button"
              onClick={
                goBackHome
              }
            >
              <ArrowLeft size={18} />
              Back to Topics
            </button>


            <div className="learning-topic">

              <SelectedIcon size={20} />

              <span>
                {selectedCategory.title}
              </span>

            </div>

          </div>


          {/* =================================================
              PROGRESS
          ================================================= */}

          <div className="learning-progress-card">

            <div className="progress-header">

              <div>

                <div className="progress-title">
                  Learning Progress
                </div>

                <div className="progress-subtitle">

                  {completedCount}
                  {' '}of{' '}
                  {totalQuestions}
                  {' '}questions completed

                </div>

              </div>


              <div className="progress-percentage">
                {progress}%
              </div>

            </div>


            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="inline-error">
              {error}
            </div>

          )}


          {/* =================================================
              QUESTION META
          ================================================= */}

          <div className="question-meta">

            <div className="question-number">

              Question{' '}

              {currentIndex + 1}

              {' '}of{' '}

              {totalQuestions}

            </div>


            <div className="question-meta-right">

              {currentQuestion.level && (

                <span className="level-badge">
                  {currentQuestion.level}
                </span>

              )}


              {currentQuestion.difficulty && (

                <span
                  className={`difficulty-badge ${String(
                    currentQuestion.difficulty
                  )
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {
                    currentQuestion.difficulty
                  }
                </span>

              )}

            </div>

          </div>


          {/* =================================================
              QUESTION
          ================================================= */}

          <div className="question-card">

            <div className="question-card-header">

              <div className="question-icon">
                <BookOpen size={25} />
              </div>

              <div>

                <div className="section-label">
                  QUESTION
                </div>

                {currentQuestion.questionNumber && (

                  <div className="question-small-label">

                    MongoDB DBA Question{' '}

                    {
                      currentQuestion.questionNumber
                    }

                  </div>

                )}

              </div>

              <button
                type="button"
                className={`bookmark-toggle-button ${
                  isQuestionBookmarked(
                    currentQuestion
                  )
                    ? 'bookmarked'
                    : ''
                }`}
                onClick={() =>
                  toggleBookmark(
                    currentQuestion
                  )
                }
                disabled={
                  savingBookmarkId ===
                  String(
                    currentQuestion._id || ''
                  )
                }
                title={
                  isQuestionBookmarked(
                    currentQuestion
                  )
                    ? 'Remove bookmark'
                    : 'Bookmark question'
                }
              >
                <Bookmark
                  size={18}
                  fill={
                    isQuestionBookmarked(
                      currentQuestion
                    )
                      ? 'currentColor'
                      : 'none'
                  }
                />
                {savingBookmarkId ===
                String(
                  currentQuestion._id || ''
                )
                  ? 'Saving...'
                  : isQuestionBookmarked(
                      currentQuestion
                    )
                    ? 'Bookmarked'
                    : 'Bookmark'}
              </button>

            </div>


            <h1>
              {currentQuestion.question}
            </h1>

          </div>


          {/* =================================================
              ANSWER
          ================================================= */}

          <div className="answer-card">

            <div className="answer-card-header">

              <div className="answer-icon">
                <Sparkles size={25} />
              </div>

              <div>

                <div className="section-label">
                  COMPLETE EXPLANATION
                </div>

                <div className="answer-small-label">
                  Ground Zero → Production L3
                </div>

              </div>

            </div>


            <div className="answer-content">

              <StructuredAnswer
                answer={
                  currentQuestion.answer
                }
              />

            </div>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="question-navigation">

            <button
              type="button"
              className="nav-button"
              disabled={
                currentIndex === 0
              }
              onClick={
                previousQuestion
              }
            >

              <ArrowLeft size={18} />

              Previous

            </button>


            <div className="navigation-center">

              {isCurrentCompleted ? (

                <>
                  <CheckCircle2
                    size={16}
                  />

                  Completed
                </>

              ) : (

                <>
                  <BookOpen
                    size={16}
                  />

                  Keep learning
                </>

              )}

            </div>


            <button
              type="button"
              className="nav-button primary"
              onClick={
                nextQuestion
              }
              disabled={savingProgress}
            >

              {savingProgress
                ? 'Saving...'
                : isLastQuestion
                  ? 'Complete Topic'
                  : 'Next Question'}

              {isLastQuestion ? (
                <Trophy size={18} />
              ) : (
                <ArrowRight size={18} />
              )}

            </button>

          </div>


          {/* =================================================
              COMPLETION
          ================================================= */}

          {isLastQuestion &&
            completedCount >=
              totalQuestions && (

            <div className="completion-card">

              <div className="completion-icon">
                <Trophy size={32} />
              </div>

              <div>

                <h3>
                  Topic Completed!
                </h3>

                <p>

                  You completed all{' '}

                  {totalQuestions}

                  {' '}questions in{' '}

                  {selectedCategory.title}.

                </p>

              </div>

              <button
                type="button"
                className="completion-button"
                onClick={
                  goBackHome
                }
              >

                Explore More Topics

                <ArrowRight size={17} />

              </button>

            </div>

          )}

        </main>

      </div>
    );
  }


  /* =========================================================
     HOME PAGE
  ========================================================= */

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-icon">
            <Leaf size={22} />
          </div>

          <div>

            <div className="brand-name">
              MongoDB
            </div>

            <div className="brand-subtitle">
              DBA LEARNING HUB
            </div>

          </div>

        </div>


        <div className="nav-user-area">

          <div className="nav-badge">
            <Zap size={14} />
            Learn • Practice • Master
          </div>

          <div className="signed-user">
            <span className="signed-user-name">
              {authUser.username}
            </span>
            <span className={`signed-user-role ${authUser.role}`}>
              {authUser.role}
            </span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={() => {
              setShowBookmarks(true);
              setShowSearchResults(false);
              setSelectedCategory(null);
              setQuestions([]);
              setCurrentIndex(0);
              setError('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Bookmark size={16} />
            My Bookmarks ({bookmarkedQuestionIds.length})
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="home-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero-section">

          <div className="hero-content">

            <div className="hero-eyebrow">

              <Sparkles size={15} />

              MONGODB DBA LEARNING PATH

            </div>


            <h1>

              <span>
                MongoDB
              </span>

              {' '}Interview Questions

            </h1>


            <p>

              Practice MongoDB DBA interview questions from
              fundamentals through advanced L3 production
              scenarios, with detailed explanations, commands
              and troubleshooting approaches.

            </p>


            <div className="hero-stats">

              <div className="hero-stat">

                <strong>
                  21
                </strong>

                <span>
                  Topics
                </span>

              </div>


              <div className="hero-stat">

                <strong>
                  {totalAvailableQuestions}
                </strong>

                <span>
                  Questions Available
                </span>

              </div>


              <div className="hero-stat">

                <strong>
                  {totalCompletedQuestions}
                </strong>

                <span>
                  Completed
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            GLOBAL SEARCH
        =================================================== */}

        <section className="home-search-section">

          <div className="home-search-card">

            <div className="home-search-heading">
              <div className="home-search-icon">
                <Search size={23} />
              </div>

              <div>
                <div className="section-eyebrow">
                  SEARCH ALL QUESTIONS
                </div>

                <h2>
                  Find the MongoDB question you need
                </h2>

                <p>
                  Search across questions, answers, production scenarios, troubleshooting notes and interview answers.
                </p>
              </div>
            </div>


            <form
              className="global-search-form"
              onSubmit={handleSearchSubmit}
            >

              <div className="global-search-input">
                <Search size={18} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={event =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search: oplog, rollback, ESR, COLLSCAN, WiredTiger, TLS..."
                  disabled={searchLoading}
                />
              </div>

              <select
                value={searchTopic}
                onChange={event =>
                  setSearchTopic(event.target.value)
                }
                disabled={searchLoading}
                aria-label="Search topic"
              >
                <option value="">All Topics</option>
                {curriculumCategories.map(category => (
                  <option
                    key={category.key}
                    value={category.key}
                  >
                    {category.title}
                  </option>
                ))}
              </select>

              <select
                value={searchDifficulty}
                onChange={event =>
                  setSearchDifficulty(event.target.value)
                }
                disabled={searchLoading}
                aria-label="Search difficulty"
              >
                <option value="">All Levels</option>
                <option value="Foundation">Foundation</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="L3+">L3+</option>
              </select>

              <button
                type="submit"
                className="global-search-button"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <Loader2
                    size={18}
                    className="loading-spinner"
                  />
                ) : (
                  <Search size={18} />
                )}

                {searchLoading
                  ? 'Searching...'
                  : 'Search'}
              </button>

            </form>

            {searchError && (
              <div className="inline-error">
                {searchError}
              </div>
            )}

          </div>

        </section>



        {/* ===================================================
            ADMIN QUESTION MANAGEMENT
        =================================================== */}

        {authUser?.role === 'admin' && (

          <section className="admin-question-section">

            <div className="admin-question-card">

              <div className="admin-question-header">

                <div className="request-feature-heading">

                  <div className="request-feature-icon admin">
                    <Wrench size={24} />
                  </div>

                  <div>
                    <div className="section-eyebrow">
                      ADMIN ONLY
                    </div>

                    <h2>
                      Manage Questions
                    </h2>

                    <p>
                      Add, edit, disable, enable or permanently delete curriculum questions. Custom topics can also be permanently removed.
                    </p>
                  </div>

                </div>

                <div className="admin-question-header-actions">
                  <button
                    type="button"
                    className="request-refresh-button"
                    onClick={toggleAdminQuestionManager}
                  >
                    {showAdminQuestionManager
                      ? 'Close Manager'
                      : 'Open Manager'}
                  </button>

                  {showAdminQuestionManager && (
                    <button
                      type="button"
                      className="request-refresh-button"
                      onClick={loadAdminQuestions}
                      disabled={adminQuestionsLoading}
                    >
                      <RefreshCcw
                        size={16}
                        className={
                          adminQuestionsLoading
                            ? 'loading-spinner'
                            : ''
                        }
                      />
                      Refresh
                    </button>
                  )}
                </div>

              </div>


              {showAdminQuestionManager && (
                <div className="admin-question-manager">

                  {adminQuestionsError && (
                    <div className="request-alert error">
                      {adminQuestionsError}
                    </div>
                  )}

                  {adminQuestionMessage && (
                    <div className="request-alert success">
                      {adminQuestionMessage}
                    </div>
                  )}


                  <form
                    className="admin-question-form"
                    onSubmit={saveAdminQuestion}
                  >

                    <div className="admin-question-form-title">
                      <div>
                        <div className="section-eyebrow">
                          {editingAdminQuestionId
                            ? 'EDIT QUESTION'
                            : 'ADD QUESTION'}
                        </div>

                        <h3>
                          {editingAdminQuestionId
                            ? 'Update Curriculum Question'
                            : 'Create New Curriculum Question'}
                        </h3>
                      </div>

                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={startNewAdminQuestion}
                        disabled={adminQuestionSaving}
                      >
                        New Question
                      </button>
                    </div>


                    <div className="admin-question-grid">

                      <label className="admin-topic-select-field">
                        <span>Topic</span>

                        <select
                          value={
                            adminCreatingNewTopic
                              ? '__new_topic__'
                              : selectedAdminTopicKey
                          }
                          onChange={event =>
                            handleAdminTopicSelection(
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Select curriculum topic
                          </option>

                          <option value="__new_topic__">
                            + Create New Topic
                          </option>

                          {adminTopicOptions.map(
                            topic => (
                              <option
                                key={topic.key}
                                value={topic.key}
                              >
                                {topic.topicNumber}. {topic.topicName}
                              </option>
                            )
                          )}
                        </select>

                        <small className="admin-field-help">
                          Select an existing topic to fill its metadata automatically, or choose Create New Topic. A new topic starts at question 1/order 1 and appears automatically in the curriculum after its first active question is saved.
                        </small>
                      </label>


                      <label>
                        <span>Category Key</span>
                        <input
                          value={adminQuestionForm.category}
                          onChange={event =>
                            handleAdminQuestionField(
                              'category',
                              event.target.value
                            )
                          }
                          readOnly={!adminCreatingNewTopic}
                          tabIndex={adminCreatingNewTopic ? 0 : -1}
                          required
                        />
                      </label>


                      <label>
                        <span>Topic ID</span>
                        <input
                          value={adminQuestionForm.topicId}
                          onChange={event =>
                            handleAdminQuestionField(
                              'topicId',
                              event.target.value
                            )
                          }
                          readOnly={!adminCreatingNewTopic}
                          tabIndex={adminCreatingNewTopic ? 0 : -1}
                          required
                        />
                      </label>


                      <label>
                        <span>Topic Number</span>
                        <input
                          value={adminQuestionForm.topicNumber}
                          onChange={event =>
                            handleAdminQuestionField(
                              'topicNumber',
                              event.target.value
                            )
                          }
                          readOnly={!adminCreatingNewTopic}
                          tabIndex={adminCreatingNewTopic ? 0 : -1}
                          required
                        />
                      </label>


                      <label>
                        <span>Topic Name</span>
                        <input
                          value={adminQuestionForm.topicName}
                          onChange={event =>
                            adminCreatingNewTopic
                              ? handleNewAdminTopicName(
                                  event.target.value
                                )
                              : handleAdminQuestionField(
                                  'topicName',
                                  event.target.value
                                )
                          }
                          readOnly={!adminCreatingNewTopic}
                          tabIndex={adminCreatingNewTopic ? 0 : -1}
                          required
                        />
                      </label>


                      <label>
                        <span>Question Number</span>
                        <input
                          type="number"
                          min="1"
                          value={adminQuestionForm.questionNumber}
                          onChange={event =>
                            handleAdminQuestionField(
                              'questionNumber',
                              event.target.value
                            )
                          }
                          required
                        />
                      </label>

                      <label>
                        <span>Order</span>
                        <input
                          type="number"
                          min="1"
                          value={adminQuestionForm.order}
                          onChange={event =>
                            handleAdminQuestionField(
                              'order',
                              event.target.value
                            )
                          }
                          required
                        />
                      </label>

                      <label>
                        <span>Level</span>
                        <input
                          value={adminQuestionForm.level}
                          onChange={event =>
                            handleAdminQuestionField(
                              'level',
                              event.target.value
                            )
                          }
                          placeholder="L3"
                          required
                        />
                      </label>

                      <label>
                        <span>Difficulty</span>
                        <input
                          value={adminQuestionForm.difficulty}
                          onChange={event =>
                            handleAdminQuestionField(
                              'difficulty',
                              event.target.value
                            )
                          }
                          placeholder="L3"
                          required
                        />
                      </label>

                    </div>


                    <label className="admin-question-wide-field">
                      <span>Question</span>
                      <textarea
                        rows="3"
                        value={adminQuestionForm.question}
                        onChange={event =>
                          handleAdminQuestionField(
                            'question',
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>


                    <div className="admin-answer-grid">

                      {[
                        ['groundZero', 'Ground Zero'],
                        ['coreConcept', 'Core Concept'],
                        ['detailedExplanation', 'Detailed Explanation'],
                        ['internalWorking', 'Internal Working'],
                        ['architecture', 'Architecture'],
                        ['productionScenario', 'Production Scenario'],
                        ['troubleshootingApproach', 'Troubleshooting Approach'],
                        ['interviewAnswer', 'Interview Answer'],
                      ].map(([field, label]) => (
                        <label key={field}>
                          <span>{label}</span>
                          <textarea
                            rows="5"
                            value={adminQuestionForm.answer[field]}
                            onChange={event =>
                              handleAdminAnswerField(
                                field,
                                event.target.value
                              )
                            }
                          />
                        </label>
                      ))}

                    </div>


                    <div className="admin-answer-grid compact">

                      {[
                        ['examples', 'Examples — one per line'],
                        ['commonMistakes', 'Common Mistakes — one per line'],
                        ['bestPractices', 'Best Practices — one per line'],
                        ['keyTakeaways', 'Key Takeaways — one per line'],
                      ].map(([field, label]) => (
                        <label key={field}>
                          <span>{label}</span>
                          <textarea
                            rows="5"
                            value={adminQuestionForm.answer[field]}
                            onChange={event =>
                              handleAdminAnswerField(
                                field,
                                event.target.value
                              )
                            }
                          />
                        </label>
                      ))}

                    </div>


                    <label className="admin-question-wide-field">
                      <span>
                        Commands — JSON array
                      </span>
                      <textarea
                        rows="8"
                        className="admin-command-editor"
                        value={adminQuestionForm.answer.commands}
                        onChange={event =>
                          handleAdminAnswerField(
                            'commands',
                            event.target.value
                          )
                        }
                        placeholder='[{"command":"db.serverStatus()","explanation":"Shows server statistics"}]'
                      />
                    </label>


                    <div className="admin-question-form-actions">
                      <button
                        type="submit"
                        className="admin-primary-button"
                        disabled={adminQuestionSaving}
                      >
                        {adminQuestionSaving ? (
                          <Loader2
                            size={17}
                            className="loading-spinner"
                          />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}

                        {editingAdminQuestionId
                          ? 'Save Changes'
                          : 'Create Question'}
                      </button>

                      {editingAdminQuestionId && (
                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={startNewAdminQuestion}
                          disabled={adminQuestionSaving}
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                  </form>


                  <div className="admin-topic-management-block">

                    <div className="admin-topic-management-heading">
                      <div>
                        <div className="section-eyebrow">
                          CUSTOM TOPICS
                        </div>

                        <h3>
                          Manage New Topics ({customAdminTopics.length})
                        </h3>

                        <p>
                          Built-in Topics 1-21 are protected from whole-topic deletion. New custom topics can be removed permanently here.
                        </p>
                      </div>
                    </div>

                    {customAdminTopics.length === 0 ? (
                      <div className="admin-request-empty compact">
                        No custom topics have been created yet.
                      </div>
                    ) : (
                      <div className="admin-topic-delete-list">
                        {customAdminTopics.map(topic => {
                          const topicQuestionCount =
                            adminQuestions.filter(
                              question =>
                                question?.topicId ===
                                topic.topicId
                            ).length;

                          return (
                            <div
                              className="admin-topic-delete-item"
                              key={topic.key}
                            >
                              <div>
                                <strong>
                                  {topic.topicNumber}. {topic.topicName}
                                </strong>

                                <span>
                                  {topicQuestionCount} question{topicQuestionCount === 1 ? '' : 's'} · {topic.topicId}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="admin-permanent-delete-button"
                                disabled={
                                  adminDeletingTopicId ===
                                  topic.topicId
                                }
                                onClick={() =>
                                  permanentlyDeleteAdminTopic(topic)
                                }
                              >
                                <Trash2 size={16} />
                                {adminDeletingTopicId === topic.topicId
                                  ? 'Deleting Topic...'
                                  : 'Delete Topic Permanently'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>


                  <div className="admin-question-list-block">

                    <div className="admin-question-list-toolbar">

                      <div>
                        <div className="section-eyebrow">
                          CURRICULUM DATABASE
                        </div>

                        <h3>
                          All Questions ({adminQuestions.length})
                        </h3>
                      </div>

                      <div className="admin-question-list-filters">
                        <div className="admin-question-search">
                          <Search size={16} />
                          <input
                            type="search"
                            value={adminQuestionFilter}
                            onChange={event =>
                              setAdminQuestionFilter(
                                event.target.value
                              )
                            }
                            placeholder="Search admin questions..."
                          />
                        </div>

                        <select
                          value={adminQuestionStatusFilter}
                          onChange={event =>
                            setAdminQuestionStatusFilter(
                              event.target.value
                            )
                          }
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>

                    </div>


                    {adminQuestionsLoading &&
                     adminQuestions.length === 0 ? (
                      <div className="admin-request-empty">
                        <Loader2
                          size={24}
                          className="loading-spinner"
                        />
                        Loading questions...
                      </div>
                    ) : filteredAdminQuestions.length === 0 ? (
                      <div className="admin-request-empty">
                        No questions match the current filter.
                      </div>
                    ) : (
                      <div className="admin-question-list">
                        {filteredAdminQuestions.map(
                          question => {
                            const questionId =
                              String(question?._id || '');

                            const active =
                              question?.active !== false;

                            return (
                              <article
                                className="admin-question-item"
                                key={questionId}
                              >
                                <div className="admin-question-item-main">
                                  <div className="admin-question-item-meta">
                                    <span>
                                      Topic {question.topicNumber ?? '—'}
                                    </span>
                                    <span>
                                      Q{question.questionNumber ?? question.order ?? '—'}
                                    </span>
                                    <span>
                                      {question.level || question.difficulty || '—'}
                                    </span>
                                    <span
                                      className={`admin-question-status ${active ? 'active' : 'disabled'}`}
                                    >
                                      {active ? 'Active' : 'Disabled'}
                                    </span>
                                  </div>

                                  <h4>
                                    {question.question}
                                  </h4>

                                  <p>
                                    {question.topicName || question.category}
                                  </p>
                                </div>

                                <div className="admin-question-item-actions">
                                  <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={() =>
                                      startEditAdminQuestion(question)
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      active
                                        ? 'admin-danger-button'
                                        : 'admin-enable-button'
                                    }
                                    disabled={
                                      adminQuestionStatusSavingId ===
                                      questionId ||
                                      adminDeletingQuestionId ===
                                      questionId
                                    }
                                    onClick={() =>
                                      changeAdminQuestionStatus(question)
                                    }
                                  >
                                    {adminQuestionStatusSavingId ===
                                    questionId
                                      ? 'Updating...'
                                      : active
                                        ? 'Disable'
                                        : 'Enable'}
                                  </button>

                                  <button
                                    type="button"
                                    className="admin-permanent-delete-button"
                                    disabled={
                                      adminDeletingQuestionId ===
                                      questionId ||
                                      adminQuestionStatusSavingId ===
                                      questionId
                                    }
                                    onClick={() =>
                                      permanentlyDeleteAdminQuestion(question)
                                    }
                                  >
                                    <Trash2 size={16} />
                                    {adminDeletingQuestionId ===
                                    questionId
                                      ? 'Deleting...'
                                      : 'Delete Permanently'}
                                  </button>
                                </div>
                              </article>
                            );
                          }
                        )}
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

          </section>

        )}


        {/* ===================================================
            ADMIN QUESTION REQUESTS
        =================================================== */}

        {authUser?.role === 'admin' && (

          <section className="admin-request-section">

            <div className="admin-request-card">

              <div className="admin-request-header">

                <div className="request-feature-heading">

                  <div className="request-feature-icon admin">
                    <ClipboardList size={24} />
                  </div>

                  <div>
                    <div className="section-eyebrow">
                      ADMIN ONLY
                    </div>

                    <h2>
                      Question Requests
                    </h2>

                    <p>
                      Review requests submitted by every
                      authorized user and update their status.
                    </p>
                  </div>

                </div>


                <button
                  type="button"
                  className="request-refresh-button"
                  onClick={loadAdminQuestionRequests}
                  disabled={adminRequestsLoading}
                >
                  <RefreshCcw
                    size={16}
                    className={
                      adminRequestsLoading
                        ? 'loading-spinner'
                        : ''
                    }
                  />
                  Refresh
                </button>

              </div>


              {adminRequestsError && (
                <div className="request-alert error">
                  {adminRequestsError}
                </div>
              )}


              {adminRequestsLoading &&
               adminRequests.length === 0 ? (

                <div className="admin-request-empty">
                  <Loader2
                    size={24}
                    className="loading-spinner"
                  />
                  Loading requests...
                </div>

              ) : adminRequests.length === 0 ? (

                <div className="admin-request-empty">
                  No question requests have been submitted yet.
                </div>

              ) : (

                <div className="admin-request-list">

                  {adminRequests.map(
                    request => (

                      <article
                        className="admin-request-item"
                        key={String(request._id)}
                      >

                        <div className="admin-request-item-top">

                          <div>
                            <div className="admin-request-topic">
                              {request.topic || 'General'}
                            </div>

                            <h3>
                              {request.question}
                            </h3>
                          </div>


                          <span
                            className={`request-status ${request.status || 'pending'}`}
                          >
                            {request.status || 'pending'}
                          </span>

                        </div>


                        {request.notes && (
                          <p className="admin-request-notes">
                            {request.notes}
                          </p>
                        )}


                        <div className="admin-request-meta">

                          <span>
                            User: <strong>{request.username}</strong>
                          </span>

                          <span>
                            Role: {request.submittedByRole || 'user'}
                          </span>

                          <span>
                            {request.createdAt
                              ? new Date(
                                  request.createdAt
                                ).toLocaleString()
                              : ''}
                          </span>

                        </div>


                        <div className="admin-request-actions">

                          {[
                            'pending',
                            'approved',
                            'rejected',
                            'added',
                          ].map(
                            status => (

                              <button
                                key={status}
                                type="button"
                                className={`status-action-button ${status}`}
                                disabled={
                                  updatingRequestId ===
                                  String(request._id)
                                }
                                onClick={() =>
                                  handleRequestStatusChange(
                                    String(request._id),
                                    status
                                  )
                                }
                              >
                                {updatingRequestId ===
                                  String(request._id)
                                  ? 'Updating...'
                                  : status}
                              </button>

                            )
                          )}

                        </div>

                      </article>

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="inline-error">
            {error}
          </div>

        )}


        {/* ===================================================
            TOPICS HEADING
        =================================================== */}

        <section className="topics-section">

          <div className="section-heading">

            <div>

              <div className="section-eyebrow">

                <BookOpen size={14} />

                COMPLETE CURRICULUM

              </div>

              <h2>
                MongoDB DBA Learning Path
              </h2>

              <p>

                {curriculumCategories.length} topics • {allQuestions.length} active questions —
                from fundamentals to L3+
                production scenarios.

              </p>

            </div>

          </div>


          {/* =================================================
              TOPIC GRID
          ================================================= */}

          <div className="topics-grid">

            {curriculumCategories.map(
              category => {

                const Icon =
                  category.icon;


                const availableQuestions =
                  getAvailableQuestions(
                    category.key
                  );


                const completedCount =
                  getCompletedCount(
                    category.key
                  );


                const isAvailable =
                  availableQuestions > 0;


                const progress =
                  availableQuestions > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (
                            completedCount /
                            availableQuestions
                          ) * 100
                        )
                      )
                    : 0;


                return (
                  <article
                    key={
                      category.key
                    }
                    className={`topic-card ${category.colorClass} ${
                      isAvailable
                        ? 'available'
                        : 'unavailable'
                    }`}
                  >

                    {/* CARD TOP */}

                    <div className="topic-card-top">

                      <div className="topic-icon">

                        <Icon size={25} />

                      </div>


                      <div className="topic-level">

                        {category.level}

                      </div>

                    </div>


                    {/* CONTENT */}

                    <div className="topic-card-content">

                      <h3>
                        {category.title}
                      </h3>

                      <p>
                        {category.description}
                      </p>

                    </div>


                    {/* PROGRESS */}

                    <div className="topic-progress">

                      <div className="topic-progress-info">

                        <span>

                          {completedCount}

                          {' / '}

                          {isAvailable
                            ? availableQuestions
                            : 20}

                          {' '}completed

                        </span>


                        <span>
                          {progress}%
                        </span>

                      </div>


                      <div className="topic-progress-bar">

                        <div
                          className="topic-progress-fill"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* CARD BOTTOM */}

                    <div className="topic-card-bottom">

                      <div className="question-count">

                        <BookOpen size={14} />

                        {isAvailable
                          ? `${availableQuestions} available`
                          : 'Coming soon'}

                      </div>


                      <button
                        type="button"
                        className="topic-arrow"
                        disabled={
                          !isAvailable ||
                          loadingCategory
                        }
                        onClick={() =>
                          startLearning(
                            category
                          )
                        }
                        aria-label={
                          `Start ${category.title}`
                        }
                      >

                        {loadingCategory ? (

                          <Loader2
                            size={19}
                            className="loading-spinner"
                          />

                        ) : (

                          <ArrowRight
                            size={20}
                          />

                        )}

                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        </section>


        {/* ===================================================
            REQUEST A QUESTION
        =================================================== */}

        <section className="request-feature-section">

          <div className="request-feature-card">

            <div className="request-feature-heading">

              <div className="request-feature-icon">
                <MessageSquarePlus size={24} />
              </div>

              <div>
                <div className="section-eyebrow">
                  REQUEST A QUESTION
                </div>

                <h2>
                  Ask for a new MongoDB DBA question
                </h2>

                <p>
                  Submit a question you want added to the
                  learning hub. Your request will be visible
                  to the administrator for review.
                </p>
              </div>

            </div>

            <form
              className="request-form"
              onSubmit={handleQuestionRequestSubmit}
            >

              <div className="request-form-grid">

                <label className="request-field">
                  <span>Topic</span>

                  <select
                    value={requestTopic}
                    onChange={(event) =>
                      setRequestTopic(
                        event.target.value
                      )
                    }
                    disabled={requestLoading}
                  >
                    <option value="General">
                      General / Other
                    </option>

                    {curriculumCategories.map(
                      category => (
                        <option
                          key={category.key}
                          value={category.title}
                        >
                          {category.number}. {category.title}
                        </option>
                      )
                    )}
                  </select>
                </label>


                <label className="request-field request-field-full">
                  <span>Question</span>

                  <textarea
                    value={requestQuestion}
                    onChange={(event) =>
                      setRequestQuestion(
                        event.target.value
                      )
                    }
                    placeholder="Example: How do I diagnose rollback after a replica-set failover?"
                    minLength={5}
                    maxLength={1000}
                    rows={4}
                    disabled={requestLoading}
                    required
                  />

                  <small>
                    {requestQuestion.length}/1000
                  </small>
                </label>


                <label className="request-field request-field-full">
                  <span>
                    Notes / what you want explained
                    <em> optional</em>
                  </span>

                  <textarea
                    value={requestNotes}
                    onChange={(event) =>
                      setRequestNotes(
                        event.target.value
                      )
                    }
                    placeholder="Example: Include commands, internal working and a production incident."
                    maxLength={2000}
                    rows={3}
                    disabled={requestLoading}
                  />

                  <small>
                    {requestNotes.length}/2000
                  </small>
                </label>

              </div>


              {requestError && (
                <div className="request-alert error">
                  {requestError}
                </div>
              )}


              {requestMessage && (
                <div className="request-alert success">
                  <CheckCircle2 size={17} />
                  {requestMessage}
                </div>
              )}


              <div className="request-form-footer">

                <div className="request-user-note">
                  Submitted as <strong>{authUser.username}</strong>
                </div>

                <button
                  type="submit"
                  className="request-submit-button"
                  disabled={
                    requestLoading ||
                    requestQuestion.trim().length < 5
                  }
                >
                  {requestLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="loading-spinner"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Request
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </section>




        {/* ===================================================
            FOOTER MESSAGE
        =================================================== */}

        <section className="bottom-tip">

          <div className="tip-icon">
            <Sparkles size={20} />
          </div>

          <div>

            <strong>
              Learn one topic at a time.
            </strong>

            <p>

              Your progress and bookmarks are saved
              securely to your account, so you can
              continue from where you stopped after
              signing in again.

            </p>

          </div>

          <ChevronRight size={19} />

        </section>

      </main>

    </div>
  );
}


export default App;