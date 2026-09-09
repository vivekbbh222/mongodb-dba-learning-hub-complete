const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const { MongoClient } = require('mongodb');

const uri =
  process.env.SEED_MONGODB_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

if (!uri) {
  console.error(
    'MongoDB URI not found. Set SEED_MONGODB_URI, MONGODB_URI, or MONGO_URI.'
  );
  process.exit(1);
}

const DATABASE_NAME = 'webapp';
const COLLECTION_NAME = 'questions';

const questions = [

  /* =========================================================
     QUESTION 1
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 1,
    question:
      'What is WiredTiger in MongoDB, and what responsibilities does the storage engine handle inside mongod?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `WiredTiger is the storage engine used by modern MongoDB deployments.

A storage engine is the layer responsible for storing and retrieving database information on disk and managing how that information is cached and persisted.

MongoDB handles database concepts such as:

• documents
• collections
• indexes
• queries
• replication

while WiredTiger handles much of the lower-level storage work.`,

      coreConcept: `MongoDB query layer
        |
        v
    WiredTiger
        |
        +--> cache
        +--> B-tree pages
        +--> compression
        +--> checkpoints
        +--> journaling interaction
        +--> concurrency/MVCC
        +--> disk persistence
        |
        v
      Storage`,

      detailedExplanation: `WiredTiger is responsible for several critical database-storage functions.

1. DATA STORAGE

MongoDB documents and indexes are represented internally in WiredTiger data structures and files.

2. CACHE MANAGEMENT

Frequently accessed database pages are kept in the WiredTiger cache.

3. PAGE MANAGEMENT

WiredTiger organizes data and indexes into pages that are read from and written to storage.

4. COMPRESSION

WiredTiger supports compression to reduce storage requirements and physical I/O.

MongoDB commonly uses compression for collection and index data depending on configuration and defaults.

5. CHECKPOINTING

WiredTiger periodically creates a consistent durable view of data on disk.

6. CONCURRENCY

WiredTiger supports concurrent reads and writes using mechanisms including multi-version concurrency control.

7. TRANSACTIONAL STORAGE

MongoDB transactions and individual operations depend on WiredTiger's transactional capabilities.

8. EVICTION

When cache space is required, WiredTiger decides which pages can leave cache.

9. RECOVERY

After an unclean shutdown, MongoDB can use checkpoint and journal information to recover to a consistent state.

A DBA does not normally interact directly with WiredTiger data structures.

Instead, DBAs observe WiredTiger through MongoDB metrics such as:

db.serverStatus().wiredTiger

Understanding the storage engine is important because many production symptoms originate at this layer:

• high cache pressure
• eviction
• checkpoint pressure
• disk latency
• write conflicts
• long-running transactions
• history-store growth.`,

      internalWorking: `Application query
      |
      v
MongoDB execution engine
      |
      v
WiredTiger
      |
  +---+---+
  |       |
cache   disk
  |       |
  +---+---+
      |
      v
documents/indexes`,

      architecture: `              MONGOD
                 |
      +----------+----------+
      |                     |
      v                     v
 Query/Database        WiredTiger
   Layer             Storage Engine
                          |
              +-----------+-----------+
              |           |           |
              v           v           v
            Cache       Pages      Checkpoints
              |           |           |
              +-----------+-----------+
                          |
                          v
                       Storage`,

      examples: [
        `When a query needs a page already in WiredTiger cache, disk access may not be required.`,
        `When dirty pages need persistence, WiredTiger participates in writing them to storage.`,
        `Indexes are also stored and managed through WiredTiger structures.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger',
          explanation:
            'Displays WiredTiger-related server metrics and is a key starting point for storage-engine troubleshooting.'
        }
      ],

      productionScenario: `A MongoDB server has high query latency.

CPU is moderate, but storage latency and WiredTiger page-read activity are high.

The DBA understands that query execution is repeatedly waiting for pages to be read through the storage engine.

This directs the investigation toward:

• cache efficiency
• working set
• query scans
• storage performance

rather than only application code.`,

      troubleshootingApproach: `1. Identify the user-facing symptom.

2. Check WiredTiger metrics.

3. Check cache pressure.

4. Check page reads/writes.

5. Check eviction.

6. Check dirty data.

7. Check checkpoints.

8. Check disk latency.

9. Check query workload.

10. Correlate storage-engine behavior with application latency.`,

      commonMistakes: [
        'Thinking WiredTiger is only a file format.',
        'Treating MongoDB query execution and storage-engine work as completely separate.',
        'Ignoring WiredTiger metrics during performance incidents.',
        'Manually manipulating WiredTiger files while mongod is running.',
        'Assuming every database delay originates in the query planner.'
      ],

      bestPractices: [
        'Understand WiredTiger as the storage layer beneath MongoDB.',
        'Monitor cache and storage-engine metrics.',
        'Correlate WiredTiger behavior with disk performance.',
        'Use supported MongoDB tools rather than manipulating storage files manually.',
        'Include storage-engine knowledge in L3 troubleshooting.'
      ],

      interviewAnswer: `WiredTiger is MongoDB's storage engine. It manages low-level persistence, cache, pages, compression, concurrency, checkpoints, eviction, and transactional storage behavior.

As a DBA, I normally interact with WiredTiger through MongoDB rather than its files directly. Understanding its metrics helps diagnose memory pressure, disk latency, checkpoint issues, write conflicts, and other storage-related production problems.`,

      keyTakeaways: [
        'WiredTiger is MongoDB’s storage engine.',
        'It manages cache, pages and persistence.',
        'It supports concurrency and transactions.',
        'Many performance symptoms originate in this layer.',
        'DBAs should monitor WiredTiger metrics.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 2,
    question:
      'How does WiredTiger organize MongoDB data and indexes internally using B-tree pages?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `WiredTiger stores collection and index information using tree-based structures.

A B-tree is designed so MongoDB can locate data efficiently without reading an entire file from beginning to end.

The tree is divided into pages.`,

      coreConcept: `        Root Page
            |
      +-----+-----+
      |           |
      v           v
 Internal      Internal
   Page          Page
   |              |
 +---+---+      +---+---+
 |       |      |       |
 v       v      v       v
Leaf    Leaf   Leaf    Leaf

Leaf pages contain
actual key/value information.`,

      detailedExplanation: `Conceptually, a B-tree contains several page types.

ROOT PAGE

The top of the tree.

It helps direct traversal toward the correct part of the tree.

INTERNAL PAGES

Contain routing information that helps determine which lower-level page should be visited.

LEAF PAGES

Contain actual collection or index entries.

For an index, keys are arranged so that MongoDB can efficiently navigate to matching key ranges.

Suppose an index contains:

age: 20
age: 25
age: 30
age: 35
age: 40

A query:

{ age: 35 }

does not need to inspect every key in the entire index.

The tree structure allows navigation toward the relevant leaf page.

This also explains why index locality matters.

Range queries can often scan adjacent index entries after reaching the correct starting position.

B-tree pages are not permanently kept in memory.

Frequently used pages may remain in WiredTiger cache.

Cold pages may exist only on storage until accessed.

When a page is modified, WiredTiger tracks changes in memory and eventually reconciles them into a form suitable for persistence.

The exact physical representation and page formats are internal implementation details and can evolve across versions.

A DBA should understand the conceptual structure without depending on unsupported assumptions about file internals.`,

      internalWorking: `Query:

age = 35

Root
 |
 v
Internal page
 |
 v
Leaf containing
30, 35, 40
 |
 v
find 35

No need to scan
all index pages.`,

      architecture: `                  B-TREE
                     |
                  Root Page
                     |
          +----------+----------+
          |                     |
          v                     v
      Internal              Internal
         Page                  Page
          |                     |
       +--+--+               +--+--+
       |     |               |     |
       v     v               v     v
      Leaf  Leaf            Leaf  Leaf
       |     |               |     |
       v     v               v     v
      keys/data          keys/data`,

      examples: [
        `An index lookup traverses tree pages toward the matching key.`,
        `A range query may find a starting key and then scan neighboring index entries.`,
        `Frequently accessed upper-level pages are good candidates to remain hot in cache.`
      ],

      commands: [
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Shows the logical indexes MongoDB exposes; WiredTiger manages their underlying storage structures.'
        }
      ],

      productionScenario: `A query uses a well-designed index and examines:

50 index keys

instead of:

10 million collection documents.

The underlying B-tree allows MongoDB to navigate directly toward the relevant key range rather than scanning the entire dataset.`,

      troubleshootingApproach: `1. Identify whether query uses an index.

2. Examine keys/documents scanned.

3. Understand expected key range.

4. Check whether access is selective.

5. Check cache pressure.

6. Check storage reads for index pages.

7. Evaluate index design.

8. Avoid assumptions about unsupported physical file details.`,

      commonMistakes: [
        'Thinking an index is a flat unsorted list.',
        'Assuming the entire B-tree stays in memory.',
        'Thinking one index entry equals one disk read.',
        'Manually editing storage-engine files.',
        'Depending on internal file-format details that may change.'
      ],

      bestPractices: [
        'Understand B-tree navigation conceptually.',
        'Design selective indexes.',
        'Monitor keys and documents examined.',
        'Keep critical working-set pages cache-friendly.',
        'Treat storage format as an internal implementation detail.'
      ],

      interviewAnswer: `WiredTiger organizes collection and index storage using B-tree-style page structures. Root and internal pages route lookups toward leaf pages containing actual entries.

This allows indexed queries to navigate to relevant key ranges instead of scanning the entire dataset. Pages move between storage and WiredTiger cache according to workload and eviction behavior.`,

      keyTakeaways: [
        'WiredTiger uses tree-based page structures.',
        'Internal pages guide traversal.',
        'Leaf pages contain entries.',
        'Indexes benefit from ordered navigation.',
        'Pages move between cache and storage.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 3,
    question:
      'What is the WiredTiger cache, what kinds of pages live inside it, and why is cache size different from total mongod memory usage?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `The WiredTiger cache is memory managed by the WiredTiger storage engine for database pages.

It is not the same thing as total MongoDB process memory.

mongod also uses memory outside the WiredTiger cache.`,

      coreConcept: `mongod memory

+-----------------------+
| WiredTiger cache      |
+-----------------------+
| connections           |
+-----------------------+
| query execution       |
+-----------------------+
| metadata/index info   |
+-----------------------+
| other process memory  |
+-----------------------+

Plus:
OS filesystem cache`,

      detailedExplanation: `WiredTiger cache can contain pages related to:

• collection data
• index data
• dirty modified pages
• clean pages
• historical/version-related information.

When an operation needs data:

IF PAGE IS IN CACHE

MongoDB can access it without first reading the page from storage.

IF PAGE IS NOT IN CACHE

WiredTiger may need to read it from storage.

CACHE SIZE

MongoDB normally calculates a default WiredTiger cache size based on available memory and product/version rules.

The exact formula and behavior should be checked for the deployed MongoDB version rather than memorized as a universal constant.

TOTAL MONGOD MEMORY

mongod may also use memory for:

• connections
• query execution
• aggregation
• internal metadata
• compression buffers
• replication
• transactions
• libraries and runtime structures.

OS CACHE

The operating system also uses available RAM for filesystem caching.

Therefore:

WiredTiger cache = 4 GB

does not mean:

mongod process RSS = 4 GB.

And:

mongod RSS = 6 GB

does not necessarily indicate a memory leak.

A DBA should compare:

• cache utilization
• process memory
• available system RAM
• swap
• page reads
• eviction

instead of relying on one number.`,

      internalWorking: `Query needs page

     |
     v
WiredTiger cache
   /      \
  /        \
found     absent
 |           |
 v           v
use RAM    read disk
             |
             v
          put page
          in cache`,

      architecture: `                SYSTEM RAM
                     |
         +-----------+-----------+
         |                       |
         v                       v
       mongod                  OS cache
         |
   +-----+-----+
   |           |
   v           v
WiredTiger   other mongod
  cache       memory`,

      examples: [
        `Cache contains both collection and index pages.`,
        `Dirty pages represent modifications not yet fully reflected in the latest persisted checkpoint state.`,
        `mongod memory usage can exceed WiredTiger cache size without indicating a leak.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows WiredTiger cache usage and activity.'
        },
        {
          command:
            'db.serverStatus().mem',
          explanation:
            'Provides process-level MongoDB memory information.'
        }
      ],

      productionScenario: `A server has:

16 GB RAM.

WiredTiger cache uses several GB.

mongod resident memory is larger than the cache.

The team assumes there is a leak.

The DBA checks:

• stable RSS over time
• no swap
• normal eviction
• sufficient OS memory.

The additional memory is normal process overhead rather than evidence of a leak.`,

      troubleshootingApproach: `1. Check total RAM.

2. Check available RAM.

3. Check mongod process memory.

4. Check WiredTiger cache size.

5. Check bytes currently in cache.

6. Check dirty bytes.

7. Check page reads.

8. Check eviction.

9. Check swap.

10. Correlate memory with query latency.`,

      commonMistakes: [
        'Equating WiredTiger cache with total mongod RAM.',
        'Assuming all non-cache memory is leaked.',
        'Ignoring OS filesystem cache.',
        'Changing cache size without system-memory analysis.',
        'Restarting MongoDB simply to reduce memory usage.'
      ],

      bestPractices: [
        'Monitor cache and process memory separately.',
        'Keep OS memory headroom.',
        'Watch swap and eviction.',
        'Use trends instead of single snapshots.',
        'Avoid manual cache-size changes without evidence.'
      ],

      interviewAnswer: `The WiredTiger cache stores database and index pages, including clean and dirty pages, but it is only one part of mongod memory usage. MongoDB also consumes memory for connections, query execution, replication, metadata and other runtime structures, while the OS maintains filesystem cache.

I therefore analyze cache metrics, RSS, available memory, swap, page reads and eviction together.`,

      keyTakeaways: [
        'WiredTiger cache is only part of mongod memory.',
        'Collection and index pages live in cache.',
        'Dirty and clean pages coexist.',
        'The OS also uses memory for caching.',
        'Memory troubleshooting requires several metrics.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 4,
    question:
      'What is a dirty page in WiredTiger, how does it become dirty, and why does dirty-cache growth matter for MongoDB writes?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `A dirty page is a page in memory that has been modified compared with its persisted representation.

Example:

A document is updated.

The in-memory page containing that data changes.

That page now contains modified information and is considered dirty.`,

      coreConcept: `Page on disk:
value = 10

Read into cache
     |
     v
Update:
value = 20
     |
     v
cache page changed
     |
     v
DIRTY PAGE
     |
     v
eventually reconciled/
written persistently`,

      detailedExplanation: `When MongoDB performs a write, WiredTiger modifies relevant in-memory structures.

Examples include:

• collection pages
• index pages.

Those changes make pages dirty.

Dirty pages cannot simply be discarded from cache like unmodified clean pages.

Before they can be safely removed or represented on disk, WiredTiger must perform the required reconciliation/write work.

Therefore high write rates can create increasing dirty-cache pressure.

Consider:

incoming dirty data:
500 MB/sec

storage can sustainably persist:
200 MB/sec.

Dirty information accumulates.

Eventually this can create:

• increased eviction work
• writeback pressure
• checkpoint pressure
• application latency.

This does not mean:

"dirty bytes > 0 is bad."

Dirty pages are completely normal in a database.

The DBA should look for:

• sustained growth
• inability to drain
• high write latency
• high disk latency
• eviction pressure
• checkpoint stress.

Dirty cache behavior is tightly connected with underlying storage performance.

If storage becomes slow, dirty-page processing may fall behind even if the application write rate did not change.`,

      internalWorking: `Write workload
     |
     v
modify cache page
     |
     v
dirty page
     |
     v
reconciliation/write
     |
     v
persistent storage

If incoming dirty work
> outgoing capacity:

pressure increases.`,

      architecture: `                APPLICATION
                     |
                   writes
                     |
                     v
              WiredTiger Cache
               dirty pages
                     |
               reconciliation
                     |
                     v
                  STORAGE`,

      examples: [
        `An update can dirty both collection and index pages.`,
        `Sustained high write rates can increase dirty-cache pressure.`,
        `Slow disks can prevent dirty data from being processed fast enough.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Contains dirty-cache and eviction-related metrics that help evaluate write pressure.'
        }
      ],

      productionScenario: `A write-heavy workload runs normally for months.

Storage latency suddenly increases.

The application write rate remains the same, but dirty-cache metrics begin rising and write latency increases.

The DBA identifies storage degradation as the reason dirty data is no longer being processed at the normal rate.`,

      troubleshootingApproach: `1. Measure write rate.

2. Check dirty cache trend.

3. Check cache occupancy.

4. Check eviction.

5. Check disk write latency.

6. Check disk throughput.

7. Check checkpoint behavior.

8. Check index-maintenance load.

9. Compare against baseline.

10. Correct workload or storage bottleneck.`,

      commonMistakes: [
        'Treating any dirty page as a problem.',
        'Ignoring storage when dirty cache grows.',
        'Disabling durability to hide write pressure.',
        'Ignoring index updates.',
        'Looking at one dirty-byte snapshot instead of trends.'
      ],

      bestPractices: [
        'Monitor dirty cache over time.',
        'Correlate with storage latency.',
        'Maintain write I/O headroom.',
        'Keep indexes intentional.',
        'Investigate sustained dirty-data growth early.'
      ],

      interviewAnswer: `A dirty WiredTiger page is an in-memory page modified relative to its persisted state. Writes can dirty collection and index pages.

Dirty pages are normal, but sustained dirty-cache growth can indicate that the storage engine is receiving modified data faster than it can reconcile and persist it. I correlate dirty-cache trends with write rate, eviction, checkpoints, and storage latency.`,

      keyTakeaways: [
        'Dirty means modified in memory.',
        'Dirty pages are normal.',
        'Writes create dirty data.',
        'Sustained growth can indicate pressure.',
        'Storage speed strongly affects dirty-page behavior.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 5,
    question:
      'What is WiredTiger eviction, why is eviction necessary, and why is a high eviction counter not automatically a performance problem?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `The WiredTiger cache has limited capacity.

As new pages enter cache, older or less useful pages eventually need to leave.

That process is called eviction.

Eviction is normal and necessary.`,

      coreConcept: `Cache full-ish
    |
    v
Need new page
    |
    v
Choose old page
    |
 +--+--+
 |     |
clean dirty
 |     |
 v     v
discard reconcile/write
    |
    v
free cache space`,

      detailedExplanation: `WiredTiger tries to keep cache useful for active workload.

When cache space is needed, candidate pages are selected for eviction.

CLEAN PAGE

If a page has not been modified, it can often be removed from cache without writing new data because its persisted version already exists.

DIRTY PAGE

A modified page may require reconciliation before it can be evicted safely.

This makes dirty eviction more expensive.

WHY EVICTION EXISTS

Without eviction, cache would eventually fill and no new working-set pages could enter.

WHY HIGH EVICTION COUNTS ARE NOT AUTOMATICALLY BAD

A busy database with a large working set may naturally perform many evictions.

The more important question is whether eviction becomes a bottleneck.

Warning signs may include:

• increasing application latency
• heavy application-thread participation in eviction
• high disk reads
• repeated rereads of recently evicted data
• dirty cache pressure
• storage unable to keep up.

This is why:

eviction count = 1 million

means little without:

• time interval
• workload rate
• historical baseline.

The DBA should distinguish healthy page turnover from eviction pressure.`,

      internalWorking: `Healthy:

new pages enter
old pages leave
latency stable

Pressure:

new pages enter fast
eviction struggles
application threads help
disk reads rise
latency rises`,

      architecture: `              WiredTiger Cache
           +----------------------+
           | hot pages            |
           | cold pages           |
           | dirty pages          |
           +----------+-----------+
                      |
                   eviction
                      |
             +--------+--------+
             |                 |
             v                 v
           clean              dirty
          discard          reconcile
                              |
                              v
                           storage`,

      examples: [
        `Eviction occurs even in healthy systems.`,
        `Large table scans can cause excessive useful-page turnover.`,
        `Dirty-page eviction usually requires more work than clean-page eviction.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides eviction and cache metrics used to determine whether eviction is healthy or under pressure.'
        }
      ],

      productionScenario: `Monitoring reports millions of evicted pages.

An engineer declares a cache failure.

The DBA compares with historical data and finds:

• workload doubled
• latency remains normal
• disk latency remains low
• application threads are not heavily stalled.

The increased eviction is proportional to legitimate workload and is not itself an incident.`,

      troubleshootingApproach: `1. Check eviction rate over time.

2. Compare workload rate.

3. Check clean versus dirty behavior where metrics allow.

4. Check page reads.

5. Check disk latency.

6. Check dirty cache.

7. Check application-thread eviction indicators.

8. Check query latency.

9. Identify disruptive scans.

10. Compare with baseline.`,

      commonMistakes: [
        'Treating any eviction as abnormal.',
        'Using cumulative counters without rates.',
        'Ignoring workload growth.',
        'Ignoring dirty-page pressure.',
        'Changing cache size immediately.'
      ],

      bestPractices: [
        'Treat eviction as normal storage-engine behavior.',
        'Monitor rates and trends.',
        'Correlate eviction with latency.',
        'Control cache-polluting scans.',
        'Tune only when evidence shows pressure.'
      ],

      interviewAnswer: `Eviction is how WiredTiger removes pages from its finite cache to make space for incoming working-set pages. Clean pages can generally be discarded more cheaply, while dirty pages require additional reconciliation work.

A high eviction count alone is not a problem. I look for eviction pressure through trends, disk reads, dirty-cache behavior, application-thread participation, and increased latency.`,

      keyTakeaways: [
        'Eviction is necessary.',
        'Clean and dirty eviction differ.',
        'High counts alone are meaningless.',
        'Latency and disk correlation matter.',
        'Pressure, not existence, is the problem.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 6,
    question:
      'What is reconciliation in WiredTiger, and how is reconciliation related to dirty pages, eviction, and writing data to disk?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `Reconciliation is the process by which WiredTiger converts an in-memory page and its updates into a form suitable for persistence.

It is an important bridge between:

modified pages in cache

and:

stable on-disk structures.`,

      coreConcept: `In-memory page
      |
   updates applied
      |
      v
 dirty page
      |
      v
reconciliation
      |
      v
construct persistent
page representation
      |
      v
storage`,

      detailedExplanation: `A page loaded into cache may receive many updates over time.

The in-memory representation can contain:

• base page information
• newer updates
• multiple visible versions depending on transaction history.

Eventually WiredTiger may need to:

• evict the page
• checkpoint the page
• persist updated state.

At that point, reconciliation determines how the page should be represented for storage.

Conceptually, reconciliation may involve:

• considering which updates are visible/persistable
• writing new page images
• splitting pages when required
• handling historical versions
• coordinating with transaction visibility.

This is more complex than simply:

"copy RAM page bytes to disk."

The page stored on disk may be newly constructed.

Reconciliation interacts with:

EVICTION

A dirty page often needs reconciliation before eviction can complete.

CHECKPOINTS

Checkpoint processing requires persistent representation of relevant dirty information.

HISTORY STORE

Older versions that remain necessary for visibility may need to be preserved appropriately.

COMPRESSION

On-disk page representation may be compressed.

Heavy reconciliation demand can consume:

• CPU
• storage bandwidth
• cache resources.

A DBA usually does not tune reconciliation directly.

Instead, the DBA diagnoses why reconciliation pressure is high:

• sustained write workload
• storage bottleneck
• long-lived transactions
• cache pressure
• large pages/data patterns.`,

      internalWorking: `Page P

Original:
A=1

Updates:
A=2
A=3
B=5

In cache:
multiple updates/state

Reconciliation
     |
     v
construct new
persistent page/state
     |
     v
disk`,

      architecture: `             WIREDTIGER CACHE
                    |
                dirty page
                    |
                    v
             reconciliation
             /      |      \
            v       v       v
        page form  history  compression
            \       |       /
             \      |      /
                   disk`,

      examples: [
        `Dirty-page eviction can require reconciliation.`,
        `A heavily updated workload produces more reconciliation work.`,
        `Long transaction visibility requirements can make version handling more complicated.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger',
          explanation:
            'Provides storage-engine metrics that can help correlate reconciliation-related pressure with cache, transaction and I/O behavior.'
        }
      ],

      productionScenario: `A write-heavy deployment shows:

• dirty cache rising
• eviction pressure
• CPU increasing
• disk writes increasing.

The DBA understands that WiredTiger is doing substantial reconciliation work rather than assuming every CPU spike comes from query execution.`,

      troubleshootingApproach: `1. Measure write rate.

2. Check dirty cache.

3. Check eviction pressure.

4. Check disk writes.

5. Check storage latency.

6. Check checkpoint behavior.

7. Check long-running transactions.

8. Check history-store growth.

9. Compare CPU with workload.

10. Identify the workload or storage constraint driving reconciliation pressure.`,

      commonMistakes: [
        'Thinking reconciliation means simple memcpy to disk.',
        'Trying to disable reconciliation.',
        'Ignoring transaction visibility.',
        'Ignoring storage bottlenecks.',
        'Blaming query execution for all storage-engine CPU.'
      ],

      bestPractices: [
        'Understand reconciliation conceptually.',
        'Monitor its surrounding symptoms rather than trying to manipulate internals.',
        'Control sustained write pressure.',
        'Keep storage healthy.',
        'Investigate long-lived transactions.'
      ],

      interviewAnswer: `Reconciliation is WiredTiger's process of taking an in-memory page plus its updates and constructing the persistent representation that can be written to storage.

It is involved in dirty-page eviction and checkpoints and interacts with compression, transaction visibility, and historical versions. High reconciliation pressure is usually investigated through write rate, dirty cache, eviction, storage, checkpoints, and long-running transactions.`,

      keyTakeaways: [
        'Reconciliation creates persistent page representations.',
        'It is required for dirty-page processing.',
        'It participates in eviction and checkpoints.',
        'It can involve version/history handling.',
        'DBAs troubleshoot its causes rather than manipulating it directly.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 7,
    question:
      'What is a WiredTiger checkpoint, what does a checkpoint represent, and why should DBAs not confuse checkpoints with journal writes or backups?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `A checkpoint is a consistent persisted view of database data at a point in the storage engine's history.

It allows WiredTiger to establish a stable on-disk recovery point.

A checkpoint is not the same as:

• a journal write
• a user backup
• a replica-set snapshot across arbitrary infrastructure.`,

      coreConcept: `In-memory changes
      |
      v
WiredTiger
      |
      v
Checkpoint
      |
      v
consistent persisted
storage-engine state

Journal:
records durability information
between recovery points

Backup:
separate recoverable copy`,

      detailedExplanation: `MongoDB continuously processes writes.

Those writes modify pages in memory.

WiredTiger periodically creates checkpoints representing a consistent state of the database on storage.

Why checkpoints matter:

If mongod stops unexpectedly, recovery does not need to reconstruct database state from the beginning of time.

Conceptually, recovery can use:

latest checkpoint
+
required journal information

to recover recent durable changes.

CHECKPOINT VS JOURNAL

Checkpoint:

represents a durable consistent storage-engine state.

Journal:

supports durability of changes occurring around/between persisted states and is used during crash recovery.

They work together but are not identical.

CHECKPOINT VS BACKUP

A checkpoint is part of normal database storage operation.

It is not automatically an independent disaster-recovery backup.

If the entire volume is destroyed, a checkpoint stored on that same volume is also gone.

CHECKPOINT PERFORMANCE

Checkpoint activity involves processing dirty data and writing information to storage.

A healthy storage system should handle normal checkpoints as part of ordinary workload.

If checkpoint periods correlate with severe latency, investigate:

• sustained dirty data
• insufficient storage throughput
• cache pressure
• high write volume
• competing I/O.

Do not solve this by trying to eliminate checkpoints.

They are fundamental to storage-engine durability and recovery.`,

      internalWorking: `Checkpoint C1
     |
writes
writes
writes
     |
Journal history
     |
Checkpoint C2

Crash after C2:
recover from
C2 + required journal data`,

      architecture: `             WIREDTIGER CACHE
                    |
               dirty changes
                    |
                    v
                CHECKPOINT
                    |
                    v
               DISK STATE
                    |
              +-----+-----+
              |           |
              v           v
          crash base    backup source
                       only when taken
                       through supported
                       backup method`,

      examples: [
        `A checkpoint remains on the same storage and is not an off-host backup.`,
        `Journal and checkpoint are complementary durability mechanisms.`,
        `Checkpoint-related latency often exposes inadequate storage headroom.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Depending on version, transaction/storage metrics can provide checkpoint-related information.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Useful for correlating dirty-cache behavior with checkpoint activity.'
        }
      ],

      productionScenario: `Every checkpoint period, write latency rises sharply.

The team proposes disabling checkpoint-related behavior.

The DBA instead finds:

• dirty data accumulating rapidly
• storage write latency at 100 ms
• volume throughput at its maximum.

The checkpoint is exposing a storage-capacity problem rather than being the root architectural defect.`,

      troubleshootingApproach: `1. Correlate latency with checkpoint timing.

2. Check dirty cache.

3. Check write rate.

4. Check disk write latency.

5. Check throughput.

6. Check IOPS limits.

7. Check competing backup/index workload.

8. Compare with normal baseline.

9. Correct workload/storage pressure.

10. Revalidate checkpoint behavior.`,

      commonMistakes: [
        'Calling checkpoints backups.',
        'Calling checkpoints the same as journal writes.',
        'Trying to eliminate checkpoints.',
        'Ignoring storage limits.',
        'Assuming all checkpoint activity should be invisible at any workload level.'
      ],

      bestPractices: [
        'Understand checkpoint and journal roles separately.',
        'Maintain storage headroom.',
        'Monitor dirty cache.',
        'Correlate checkpoint timing with I/O.',
        'Use supported backup methods for DR.'
      ],

      interviewAnswer: `A WiredTiger checkpoint is a consistent persisted storage-engine state. During crash recovery, MongoDB can use a checkpoint together with required journal information to recover durable changes.

A checkpoint is not itself a disaster-recovery backup, because it exists as part of the same database storage. If checkpoints correlate with latency, I investigate dirty-data volume and storage capacity rather than trying to disable the mechanism.`,

      keyTakeaways: [
        'Checkpoint is a consistent persisted state.',
        'Journal and checkpoint are different.',
        'Checkpoints support crash recovery.',
        'A checkpoint is not an independent backup.',
        'Checkpoint pressure often points to storage/write pressure.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 8,
    question:
      'How does MongoDB journaling work conceptually with WiredTiger, and what problem does the journal solve during an unclean shutdown?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `The journal is part of MongoDB's durability mechanism.

Its purpose is to preserve enough information about recent changes so MongoDB can recover committed durable work after an unexpected shutdown.`,

      coreConcept: `Application write
      |
      v
MongoDB/WiredTiger
      |
      +--> cache changes
      |
      +--> journal durability
      |
      v
checkpoint eventually

Crash
  |
  v
checkpoint
+
journal recovery
  |
  v
consistent database`,

      detailedExplanation: `Suppose a document is updated.

The modified database page may exist in memory before a newer checkpoint fully incorporates that change.

If power suddenly fails, RAM is lost.

Without a durability mechanism, recently acknowledged writes could disappear.

The journal records information needed for crash recovery according to MongoDB's durability rules and write concern behavior.

On startup after an unclean shutdown, MongoDB can use:

• persisted checkpoint state
• journal records

to recover the database to a consistent durable state.

Important distinction:

JOURNAL != OPLOG

Journal:

storage-engine durability/crash recovery.

Oplog:

replica-set replication history.

They solve different problems.

JOURNAL != BACKUP

The journal exists with the database storage and is designed for crash recovery.

It is not a substitute for:

• backups
• snapshots
• PITR archives.

JOURNAL != REPLICATION

Replication protects availability and maintains copies across members.

Journaling protects durability on an individual member.

Write acknowledgement behavior depends on:

• writeConcern
• journaling semantics
• deployment/version configuration.

A DBA should not disable durability casually to gain benchmark performance.

Any durability trade-off must be explicit and business-approved.`,

      internalWorking: `Checkpoint:
state at T0

Writes:
T1
T2
T3

Journal persists
needed recent changes

Crash at T4

Restart:
checkpoint T0
+
journal recovery
=
durable state`,

      architecture: `                  MONGOD
                     |
                  WiredTiger
                  /       \
                 v         v
              Cache      Journal
                 \         /
                  \       /
                   v     v
                   Storage
                     |
                     v
                 Checkpoint`,

      examples: [
        `Journal helps recover durable writes after process or host failure.`,
        `Oplog is for replication, not local storage crash recovery.`,
        `Backup protects against failures the local journal cannot survive, such as full storage destruction.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().storageEngine',
          explanation:
            'Shows storage-engine information; journaling details should be interpreted according to the MongoDB version and deployment configuration.'
        }
      ],

      productionScenario: `A server loses power unexpectedly.

On restart, MongoDB performs storage-engine recovery.

The database returns to a consistent durable state using its persisted storage structures and journal information.

The DBA understands this as crash recovery, not as restoring from backup.`,

      troubleshootingApproach: `1. Confirm whether shutdown was clean.

2. Review mongod startup logs.

3. Observe recovery messages.

4. Check storage health.

5. Confirm database starts successfully.

6. Validate replica-set state.

7. Check application write concern.

8. Investigate repeated unclean shutdowns separately.

9. Do not manually modify journal files.`,

      commonMistakes: [
        'Confusing journal with oplog.',
        'Calling the journal a backup.',
        'Deleting journal files to fix startup issues.',
        'Disabling durability casually.',
        'Ignoring storage corruption symptoms.'
      ],

      bestPractices: [
        'Keep journaling enabled according to supported defaults and requirements.',
        'Understand writeConcern separately.',
        'Use proper shutdown procedures.',
        'Maintain external backups.',
        'Never manipulate journal files manually during normal operations.'
      ],

      interviewAnswer: `MongoDB journaling provides local durability by preserving information needed to recover recent durable changes after an unclean shutdown. WiredTiger can recover from its persisted checkpoint state plus required journal information.

The journal is different from the replica-set oplog and is not a backup. I treat durability changes as business decisions, not performance tuning shortcuts.`,

      keyTakeaways: [
        'Journal supports crash recovery.',
        'It complements checkpoints.',
        'Journal is not the oplog.',
        'Journal is not a backup.',
        'Durability should not be casually reduced.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 9,
    question:
      'How does WiredTiger compression help MongoDB, and what are the performance trade-offs between reduced I/O and additional CPU work?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Compression reduces the amount of physical storage required for MongoDB data and indexes.

Reading or writing less data can reduce disk and network/storage pressure.

But compression and decompression consume CPU.`,

      coreConcept: `Without compression:

100 MB data
   |
   v
100 MB disk I/O


With compression:

100 MB logical data
   |
compress
   |
   v
40 MB physical data

Less I/O
but extra CPU.`,

      detailedExplanation: `Compression creates a resource trade-off.

BENEFIT 1 — LESS STORAGE

Compressed pages require less physical disk capacity.

BENEFIT 2 — LESS PHYSICAL I/O

Fewer bytes may need to be read from or written to storage.

This can significantly improve performance when storage is the bottleneck.

BENEFIT 3 — BETTER EFFECTIVE STORAGE UTILIZATION

More logical data can be represented with fewer physical bytes.

COST — CPU

Compression and decompression require CPU cycles.

Therefore workload behavior matters.

STORAGE-BOUND SYSTEM

Compression can improve overall performance because reducing I/O is more valuable than the added CPU.

CPU-BOUND SYSTEM

More expensive compression may increase CPU pressure.

MongoDB/WiredTiger supports different compression behavior for collections and indexes depending on configuration and version.

DBAs should avoid memorizing one codec as universally best.

The correct choice depends on:

• data compressibility
• CPU headroom
• disk performance
• workload type
• latency requirement.

Another important concept is that compression ratio differs by data.

Repeated strings and structurally similar data may compress well.

Already compressed/encrypted-like payloads may compress poorly.

The DBA should benchmark with production-like data.`,

      internalWorking: `Logical page:
64 KB

compression
   |
   +--> CPU cost
   |
   v
physical page:
20 KB

Disk reads fewer bytes

On read:
decompress
   |
   v
usable page`,

      architecture: `             MongoDB data
                   |
                   v
              WiredTiger
              compression
              /         \
             v           v
          CPU work    fewer bytes
                         |
                         v
                      storage`,

      examples: [
        `Compression can lower storage throughput requirements.`,
        `Highly compressible documents may achieve large space savings.`,
        `CPU-bound workloads may need careful codec benchmarking.`
      ],

      commands: [
        {
          command:
            'db.collection.stats()',
          explanation:
            'Can help compare logical and storage-related collection sizes, though exact reported fields and interpretation depend on MongoDB version.'
        }
      ],

      productionScenario: `A workload is constrained by storage throughput while CPU averages only 35%.

Compression significantly reduces physical I/O.

Overall query and write performance improves despite the CPU cost of compression.

In another environment already at 90% CPU, the trade-off may be different.`,

      troubleshootingApproach: `1. Measure CPU utilization.

2. Measure disk throughput.

3. Measure disk latency.

4. Measure logical dataset size.

5. Measure physical storage size.

6. Identify compression configuration.

7. Benchmark representative workload.

8. Compare CPU cost.

9. Compare I/O savings.

10. Choose based on total system performance.`,

      commonMistakes: [
        'Assuming maximum compression always gives maximum performance.',
        'Ignoring CPU cost.',
        'Using synthetic data that compresses differently from production.',
        'Changing compression during an incident without testing.',
        'Comparing only disk space and not latency.'
      ],

      bestPractices: [
        'Benchmark representative data.',
        'Evaluate CPU and I/O together.',
        'Use supported compression settings.',
        'Consider workload bottleneck first.',
        'Test before production changes.'
      ],

      interviewAnswer: `WiredTiger compression reduces physical storage and I/O, which can significantly improve storage-bound workloads. The trade-off is CPU required for compression and decompression.

I evaluate compression based on production data compressibility, CPU headroom, disk latency and throughput rather than assuming the highest compression ratio is always best.`,

      keyTakeaways: [
        'Compression reduces physical bytes.',
        'Less I/O can improve performance.',
        'Compression consumes CPU.',
        'Data compressibility varies.',
        'Benchmark the complete workload.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 10,
    question:
      'What is Multi-Version Concurrency Control in WiredTiger, and how does MVCC allow MongoDB readers and writers to operate concurrently?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `MVCC means Multi-Version Concurrency Control.

Instead of requiring every reader to block every writer, the storage engine can maintain visibility of different versions of data.

A reader can see a version appropriate to its transaction or snapshot while another operation creates a newer version.`,

      coreConcept: `Document versions:

V1
 |
 +--> reader started here
 |
 V2
 |
 +--> writer creates newer version
 |
 V3

Reader may continue seeing
the version allowed by
its snapshot/visibility rules.`,

      detailedExplanation: `Consider a document:

balance = 100

Transaction/read starts.

Another operation updates:

balance = 150.

Without versioning, the system might need coarse blocking to prevent inconsistent reads.

With MVCC, WiredTiger maintains enough version/history information so operations can determine which version is visible according to transaction rules.

This supports concurrency between:

• readers
• writers
• transactions.

MVCC does not mean:

"no contention exists."

Operations can still encounter:

• write conflicts
• lock waits at MongoDB layers
• transaction conflicts
• resource contention.

MVCC solves visibility and concurrency problems by maintaining versions rather than forcing all operations into one serialized timeline.

However, old versions cannot always be removed immediately.

If a long-running transaction still needs an older view of data, historical information may need to remain available.

This connects MVCC with:

• transaction timestamps
• oldest timestamp
• history store
• cache pressure.

Long-running transactions can therefore have storage-engine consequences beyond simply occupying a client connection.

The exact visibility/timestamp machinery is complex and version-dependent, but the DBA should understand the core principle:

readers see a consistent version appropriate to their operation while newer versions can coexist temporarily.`,

      internalWorking: `Time --->

V1
 |
Reader R starts
and sees V1
 |
Writer changes data
 |
V2 created
 |
New reader sees V2

Old reader may still
require visibility of V1.`,

      architecture: `             LOGICAL DOCUMENT
                    |
           +--------+--------+
           |        |        |
           v        v        v
          V1       V2       V3
           ^                 ^
           |                 |
       old snapshot      new operation
           |
           v
       MVCC visibility`,

      examples: [
        `A reader can continue using a consistent snapshot while another operation updates data.`,
        `Historical versions may remain necessary while older transactions are active.`,
        `MVCC reduces the need for coarse reader/writer blocking.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Provides WiredTiger transaction-related metrics that can help investigate transaction and visibility behavior.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help locate long-running operations or transactions when investigating MVCC-related pressure.'
        }
      ],

      productionScenario: `A transaction remains open for a very long time while a heavily updated collection continues changing.

The database must preserve older versions needed by that transaction's visibility window.

History-related storage grows and cache/storage pressure increases.

The DBA identifies the long-running transaction as an important contributor rather than treating the history growth as unrelated.`,

      troubleshootingApproach: `1. Identify long-running transactions.

2. Check transaction metrics.

3. Check cache pressure.

4. Check history-store related metrics where available.

5. Check update workload.

6. Check storage growth.

7. Check application transaction duration.

8. Determine why transactions remain open.

9. Fix application behavior.

10. Validate storage-engine recovery afterward.`,

      commonMistakes: [
        'Thinking MVCC means there can never be write conflicts.',
        'Assuming old versions disappear immediately.',
        'Ignoring long-running transactions.',
        'Treating transaction duration as only an application concern.',
        'Confusing MVCC with replication.'
      ],

      bestPractices: [
        'Keep transactions as short as practical.',
        'Monitor long-running transactions.',
        'Understand version visibility.',
        'Monitor history and cache pressure.',
        'Design applications to avoid unnecessary transaction lifetimes.'
      ],

      interviewAnswer: `MVCC allows WiredTiger to maintain multiple logical versions of data so readers can see a consistent version appropriate to their transaction or snapshot while writers create newer versions.

This improves concurrency, but older versions may need to be retained while long-running transactions still require them. That is why transaction duration can affect history-store, cache, and storage pressure.`,

      keyTakeaways: [
        'MVCC means multiple versions can coexist.',
        'Readers and writers can operate concurrently.',
        'Visibility rules determine which version is seen.',
        'Old versions may need temporary retention.',
        'Long-running transactions can create storage pressure.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 11,
    question:
      'What is the WiredTiger history store, why does MongoDB need it, and how can long-running transactions or snapshots increase history-store pressure?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `The WiredTiger history store keeps older versions of data that may still be required by active readers or transactions.

It exists because MongoDB uses MVCC.

When newer versions are created, older versions cannot always be discarded immediately if some operation still needs to see them.`,

      coreConcept: `Document versions:

V1
 |
V2
 |
V3

Current readers may need V3.

Older snapshot may still need V1.

Older version cannot disappear yet.

History store helps retain
required historical versions.`,

      detailedExplanation: `With MVCC, different operations may see different logical versions of the same record.

Suppose:

Transaction A starts at time T1.

Afterward:

Document changes at T2.
Document changes again at T3.

Transaction A may still need the version that was visible at T1.

WiredTiger therefore needs mechanisms to preserve older versions until they are no longer required.

The history store is part of that mechanism.

Conceptually, historical versions may be moved out of the primary data page representation and retained in history storage so they remain available to older snapshots.

WHY PRESSURE OCCURS

If a transaction or snapshot remains active for a long time while many updates continue:

• more historical versions may need retention
• history-store activity can increase
• cache pressure can increase
• disk usage can increase
• reconciliation may become more expensive.

This is why long-running transactions can have system-wide storage consequences.

They may not consume much CPU directly, but they can prevent old versions from becoming globally obsolete.

The exact history-store internals and metrics evolve across MongoDB/WiredTiger versions, so a DBA should focus on the principle and inspect version-specific metrics rather than relying on one fixed counter name.`,

      internalWorking: `T1:
Reader starts
sees V1

T2:
writer creates V2

T3:
writer creates V3

Reader still active

V1 may still be required

=> historical version retained`,

      architecture: `             CURRENT DATA
                  |
             newer versions
                  |
                  v
             WiredTiger
          +-------+-------+
          |               |
          v               v
      current page    history store
                          |
                          v
                  older required
                    versions`,

      examples: [
        `A long-running transaction can require older record versions to remain available.`,
        `A heavily updated collection can generate many historical versions.`,
        `History-store pressure is often a symptom of transaction lifetime plus update volume.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger',
          explanation:
            'Provides WiredTiger metrics that can be reviewed for history-store and transaction-related activity, with exact fields varying by version.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Useful for identifying long-running operations or transactions contributing to old-version retention.'
        }
      ],

      productionScenario: `A transaction remains open for 90 minutes on a collection receiving thousands of updates per second.

During that period:

• history-store activity rises
• cache pressure increases
• disk usage grows
• latency begins to increase.

The DBA traces the issue back to the long transaction keeping old versions relevant.`,

      troubleshootingApproach: `1. Identify long-running transactions.

2. Measure transaction age.

3. Check update rate on affected collections.

4. Review WiredTiger history-related metrics.

5. Check cache pressure.

6. Check eviction.

7. Check disk growth.

8. Check application transaction logic.

9. End or fix unnecessarily long transactions.

10. Monitor whether history pressure subsides.`,

      commonMistakes: [
        'Treating history-store growth as random disk growth.',
        'Ignoring transaction lifetime.',
        'Looking only at transaction count and not duration.',
        'Trying to delete WiredTiger history files manually.',
        'Assuming old versions disappear immediately after every update.'
      ],

      bestPractices: [
        'Keep transactions short.',
        'Monitor long-running transactions.',
        'Correlate history activity with update-heavy workloads.',
        'Never manipulate history-store files directly.',
        'Use version-specific metrics for diagnosis.'
      ],

      interviewAnswer: `The WiredTiger history store preserves older record versions required by MVCC readers and transactions. If a transaction remains open while documents continue changing, older versions may need to be retained longer, increasing history-store, cache, reconciliation, and disk pressure.

I usually investigate long transaction age together with update rate and WiredTiger metrics.`,

      keyTakeaways: [
        'History store preserves older versions.',
        'MVCC depends on historical visibility.',
        'Long transactions can increase pressure.',
        'Update rate amplifies the effect.',
        'History-store files should never be manipulated manually.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 12,
    question:
      'What are oldest and stable timestamps conceptually in WiredTiger, and how do they influence visibility, checkpoints, and historical version retention?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `WiredTiger uses internal timestamp concepts to reason about which versions are visible and which versions must remain available.

Two important concepts are:

• oldest timestamp
• stable timestamp.

Their exact management is internal and version-dependent, but the conceptual meaning is valuable for DBAs.`,

      coreConcept: `Timeline:

T1 --- T2 --- T3 --- T4 --- T5

oldest timestamp:
older versions before some boundary
may become unnecessary once no reader needs them.

stable timestamp:
represents a point considered stable enough
for certain durable/checkpoint semantics.`,

      detailedExplanation: `OLDEST TIMESTAMP

Conceptually, this is related to the oldest point still needed by active snapshots or transactions.

If a very old transaction remains active, the system may need to retain historical versions dating back to that transaction's visibility point.

As the oldest timestamp advances, older historical versions can eventually become eligible for cleanup.

STABLE TIMESTAMP

Conceptually, the stable timestamp represents a point in the timeline considered safe/stable for certain storage-engine checkpoint and recovery semantics.

In a replicated MongoDB deployment, stable-state advancement is related to replication/durability rules and internal coordination.

A DBA does not normally set these timestamps manually.

The important operational lesson is:

long-running transactions can prevent the oldest timestamp from advancing normally.

That can increase:

• history-store retention
• disk usage
• cache pressure
• reconciliation complexity.

Similarly, replication and durable-state progression affect what can be considered stable.

These timestamp mechanisms connect:

MVCC
+
transactions
+
replication
+
checkpoints
+
history store.

Because the exact implementation changes across releases, use them as conceptual diagnostic models rather than unsupported tuning knobs.`,

      internalWorking: `T1 reader starts
 |
 | updates
 |
 | updates
 |
T5 current time

Old reader still needs T1 view

Oldest visibility boundary
cannot advance freely

=> older versions retained longer.`,

      architecture: `              TRANSACTIONS
                    |
                    v
             visibility rules
                    |
          +---------+---------+
          |                   |
          v                   v
       oldest              stable
      timestamp           timestamp
          |                   |
          v                   v
     history retention    checkpoint/
                          durable state`,

      examples: [
        `A long-running transaction can delay old-version cleanup.`,
        `Stable-state concepts matter to consistent durable checkpoints.`,
        `These timestamps are internal coordination mechanisms, not normal DBA tuning settings.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Provides transaction-related WiredTiger metrics that may expose timestamp and transaction-pressure information depending on MongoDB version.'
        }
      ],

      productionScenario: `A reporting transaction remains open for hours while a heavily updated workload continues.

Historical data cannot be cleaned up at the normal rate.

Disk usage grows and history-store activity increases.

The DBA identifies the old transaction as the reason the oldest visibility boundary is not progressing normally.`,

      troubleshootingApproach: `1. Check long-running transactions.

2. Check transaction age.

3. Check update workload.

4. Check history-store metrics.

5. Check cache pressure.

6. Check disk growth.

7. Check replication health.

8. Compare timestamp-related metrics where available.

9. Resolve stale/long transactions.

10. Monitor cleanup and stabilization.`,

      commonMistakes: [
        'Trying to manually manipulate internal timestamps.',
        'Ignoring long transaction age.',
        'Assuming timestamp concepts are identical to wall-clock Date values.',
        'Treating stable and oldest timestamp as the same thing.',
        'Using undocumented internals as tuning knobs.'
      ],

      bestPractices: [
        'Understand timestamp concepts conceptually.',
        'Keep transactions short.',
        'Monitor history-store pressure.',
        'Use supported server metrics.',
        'Avoid manual intervention in internal timestamp state.'
      ],

      interviewAnswer: `The oldest timestamp is conceptually related to the oldest snapshot still needed for visibility, while the stable timestamp represents a point considered stable for storage-engine durability/checkpoint semantics.

Long-running transactions can hold back old-version cleanup and increase history-store pressure. As a DBA I monitor the consequences rather than trying to manipulate these internal timestamps directly.`,

      keyTakeaways: [
        'Oldest and stable timestamps serve different purposes.',
        'They are related to visibility and durability.',
        'Long transactions can delay cleanup.',
        'History retention can increase as a result.',
        'They are internal mechanisms, not normal tuning knobs.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 13,
    question:
      'What is a WiredTiger write conflict, why can write conflicts occur under MVCC, and how does MongoDB handle them?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `A write conflict can occur when concurrent operations attempt changes that cannot safely proceed at the same time against the same underlying data state.

MVCC improves concurrency, but it does not eliminate all write contention.`,

      coreConcept: `Writer A
    |
    v
changes record X

Writer B
    |
    v
also changes record X

Conflict
    |
    v
one operation may need
to retry internally`,

      detailedExplanation: `Suppose two operations concurrently modify the same logical record or overlapping storage state.

Both may have started from versions that cannot both be committed exactly as originally attempted.

WiredTiger can report a write conflict to MongoDB's execution layer.

MongoDB may automatically retry certain operations internally.

This means an application does not necessarily see every low-level WiredTiger write conflict directly.

However, heavy write-conflict activity can indicate contention.

Common contributors include:

• many writers targeting the same document
• hot counters
• hot queue records
• highly concentrated updates
• long transactions
• competing transaction patterns.

WRITE CONFLICT != LOCK ERROR

It is related to storage-engine concurrency and versioning.

WRITE CONFLICT != AUTOMATIC DATABASE FAILURE

Occasional conflicts are normal in concurrent systems.

The problem is sustained high conflict rates that consume CPU and increase latency because operations repeatedly retry.

Application design can significantly influence conflicts.

Example:

Every request updates:

{ _id: "globalCounter" }

That single document becomes a write hotspot.

Distributing work across multiple documents or redesigning the pattern can reduce contention.`,

      internalWorking: `A reads V1
B reads V1

A writes V2
commits

B attempts write
based on conflicting state

=> write conflict
=> retry/re-evaluate`,

      architecture: `               HOT DOCUMENT
                    ^
                    |
          +---------+---------+
          |                   |
          v                   v
      Writer A            Writer B
          |                   |
          +--------X----------+
               conflict
                    |
                    v
                  retry`,

      examples: [
        `Multiple concurrent increments on one hot document can increase contention.`,
        `Write conflicts can be retried internally.`,
        `Sustained conflict rates may indicate schema or workload hotspots.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().metrics',
          explanation:
            'Depending on MongoDB version, server metrics can expose write-conflict related counters.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help identify highly contended active operations.'
        }
      ],

      productionScenario: `A queue application stores one document containing a global processing counter.

Thousands of workers update that same document every second.

CPU rises and write latency increases despite healthy storage.

The DBA identifies a hot-document contention pattern and the application redesigns the counter strategy.`,

      troubleshootingApproach: `1. Identify write-conflict metrics.

2. Compare with baseline.

3. Identify hottest write namespaces.

4. Identify hot documents/keys.

5. Check concurrent writers.

6. Check transaction duration.

7. Check CPU.

8. Check storage to rule out unrelated bottlenecks.

9. Review application write model.

10. Redesign hotspot if necessary.

11. Validate conflict reduction.`,

      commonMistakes: [
        'Assuming MVCC eliminates write conflicts.',
        'Treating every conflict as corruption.',
        'Ignoring hot-document patterns.',
        'Blaming disk for CPU caused by retries.',
        'Adding hardware without changing a single-record hotspot.'
      ],

      bestPractices: [
        'Monitor conflict rates.',
        'Avoid unnecessary hot-document designs.',
        'Keep transactions short.',
        'Distribute write load where possible.',
        'Correlate conflicts with latency and CPU.'
      ],

      interviewAnswer: `A WiredTiger write conflict occurs when concurrent writes cannot safely proceed against the same underlying versioned state. MongoDB can retry certain conflicts internally, so occasional conflicts are normal.

Sustained conflict activity can indicate write hotspots, long transactions, or highly concentrated concurrent updates. I investigate the write pattern rather than treating the conflict itself as corruption.`,

      keyTakeaways: [
        'MVCC does not remove all write contention.',
        'MongoDB may retry conflicts internally.',
        'Hot documents can create conflict pressure.',
        'High conflict rates waste CPU and increase latency.',
        'Application write design matters.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 14,
    question:
      'What are page splits in WiredTiger B-trees, why do they occur, and how can insert patterns influence page behavior?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `B-tree pages have finite capacity.

As data or index entries are inserted, a page can become too large to remain as one page.

WiredTiger can then split the page into multiple pages.`,

      coreConcept: `Page:

[A B C D E F G H]

More inserts
     |
     v
page grows
     |
     v
split

[A B C D] [E F G H ...]`,

      detailedExplanation: `Page splits are normal B-tree maintenance behavior.

As records or index keys accumulate, WiredTiger must keep tree pages within suitable size boundaries.

When a page becomes too large, it may be split.

This can cause:

• new pages to be created
• parent routing information to change
• additional reconciliation work.

INSERT PATTERNS MATTER

MONOTONIC INSERTS

Example:

timestamp
1
2
3
4
5
6

New entries tend to target the end of a key range.

This may concentrate activity on a smaller portion of the tree.

RANDOM INSERTS

Writes may be spread across many leaf pages.

This can distribute page changes but reduce locality.

DOCUMENT GROWTH

Updates that materially change document/index representation can also affect page organization.

A DBA generally does not tune individual page splits.

Instead, page behavior is part of understanding:

• write amplification
• locality
• index design
• cache behavior.

The exact page split algorithm and thresholds are implementation details and can evolve.

Avoid overfitting schema design to undocumented page internals.

Focus on supported database-level principles such as good shard keys, index design, document patterns, and measured workload behavior.`,

      internalWorking: `Leaf page full
    |
    v
reconciliation
    |
    v
split into
two or more pages
    |
    v
parent updated
    |
    v
tree continues`,

      architecture: `                 ROOT
                    |
                 internal
                    |
             +------+------+
             |             |
             v             v
          Leaf A         Leaf B
             |
          grows full
             |
             v
       +-----+-----+
       |           |
       v           v
    Leaf A1     Leaf A2`,

      examples: [
        `Sequential index keys can concentrate inserts at the right edge of a tree.`,
        `Random keys distribute inserts across a wider set of pages.`,
        `Page splitting is normal and not automatically a problem.`
      ],

      commands: [
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Helps review index key patterns that influence tree access and insert locality.'
        }
      ],

      productionScenario: `A collection receives very high write volume on a monotonically increasing indexed field.

The DBA observes concentrated write activity and investigates the full workload design.

The solution is not to manipulate WiredTiger page files; instead, the DBA reviews index necessity, write distribution, and overall schema/sharding strategy.`,

      troubleshootingApproach: `1. Identify write-heavy indexes.

2. Check key patterns.

3. Check monotonic versus distributed inserts.

4. Measure write latency.

5. Check dirty cache.

6. Check reconciliation pressure.

7. Check storage I/O.

8. Review index necessity.

9. Review sharding/write distribution if applicable.

10. Avoid unsupported page-level tuning.`,

      commonMistakes: [
        'Treating page splits as corruption.',
        'Trying to control internal split thresholds blindly.',
        'Ignoring write locality.',
        'Keeping unnecessary write-heavy indexes.',
        'Designing schema around undocumented storage-engine internals.'
      ],

      bestPractices: [
        'Understand page splits conceptually.',
        'Keep index design intentional.',
        'Measure write locality and contention.',
        'Use supported schema and sharding techniques.',
        'Avoid direct storage-engine manipulation.'
      ],

      interviewAnswer: `WiredTiger B-tree pages have finite size, so as entries grow a page may be reconciled and split into multiple pages, with parent routing updated accordingly.

Page splits are normal. Insert patterns such as monotonically increasing keys can concentrate activity on particular tree regions, while random keys distribute writes more broadly. I use this understanding to evaluate workload locality rather than trying to tune page internals directly.`,

      keyTakeaways: [
        'Pages have finite capacity.',
        'Splits are normal B-tree maintenance.',
        'Insert patterns influence locality.',
        'Page internals are implementation details.',
        'Optimize schema and indexes at supported levels.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 15,
    question:
      'What does it mean when WiredTiger cache appears stuck under pressure, and how would you investigate eviction stalls without blindly changing cache size?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `A cache-pressure incident may appear as:

• cache staying near capacity
• eviction increasing
• application latency increasing
• dirty pages not draining
• disk I/O rising.

The issue may be that eviction cannot make space efficiently enough.`,

      coreConcept: `Cache pressure
    |
    v
eviction tries to free pages
    |
    +--> clean pages easy
    |
    +--> dirty/history pages harder
    |
    v
if progress too slow:
application threads wait/help
    |
    v
latency`,

      detailedExplanation: `A "stuck cache" is not a formal diagnosis by itself.

The DBA needs to understand why eviction progress is limited.

Possible causes include:

1. DIRTY PAGE PRESSURE

Large amounts of modified data require reconciliation and storage writes.

2. SLOW STORAGE

Dirty pages cannot be persisted quickly enough.

3. LONG-RUNNING TRANSACTIONS

Old versions cannot be discarded freely.

4. HISTORY-STORE PRESSURE

Older versions remain needed.

5. LARGE SCANS

Cold pages continuously enter cache and push out useful hot pages.

6. WORKING SET TOO LARGE

Legitimate active data exceeds effective memory.

7. VERY HIGH WRITE RATE

Incoming page modifications exceed sustainable writeback.

The wrong response is often:

increase WiredTiger cache size immediately.

Why?

Because WiredTiger shares server memory with:

• operating system
• filesystem cache
• mongod overhead.

Making the cache too large can starve the OS.

Instead:

measure
→ identify eviction blocker
→ fix workload/storage/transaction issue
→ change capacity only if justified.`,

      internalWorking: `Incoming pages/writes
        |
        v
      CACHE
        |
     eviction
        |
        X
   slow progress
        |
        v
application threads
participate/wait
        |
        v
latency rises`,

      architecture: `              CACHE PRESSURE
                    |
       +------------+------------+
       |            |            |
       v            v            v
    dirty data   history      scans
       |            |            |
       v            v            v
   storage need  old versions  turnover
       \            |            /
        \           |           /
             eviction stalls`,

      examples: [
        `Slow storage can make dirty-page eviction struggle.`,
        `Long-running transactions can prevent older versions from being released.`,
        `A large scan can create severe page turnover even with healthy storage.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Primary cache/eviction metric source.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Useful for investigating transaction-related pressure.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Helps identify long-running transactions or large scans.'
        }
      ],

      productionScenario: `Application latency spikes and the cache remains near pressure limits.

The team proposes increasing cache size.

The DBA finds:

• a 2-hour transaction
• heavy update traffic
• rapidly increasing history-store activity.

After fixing the long-running transaction, history and eviction pressure fall without changing cache size.`,

      troubleshootingApproach: `1. Check cache occupancy trend.

2. Check dirty bytes.

3. Check pages read into cache.

4. Check eviction metrics.

5. Check application-thread eviction indicators.

6. Check disk latency.

7. Check long transactions.

8. Check history-store activity.

9. Check large scans.

10. Check write rate.

11. Fix the actual blocker.

12. Reassess memory only afterward.`,

      commonMistakes: [
        'Calling near-full cache a failure automatically.',
        'Increasing cache size first.',
        'Ignoring long-running transactions.',
        'Ignoring slow storage.',
        'Ignoring scan-driven cache pollution.'
      ],

      bestPractices: [
        'Find what prevents efficient eviction.',
        'Correlate cache with transactions and storage.',
        'Leave OS memory headroom.',
        'Keep transactions short.',
        'Change cache sizing only with measured evidence.'
      ],

      interviewAnswer: `When WiredTiger cache appears stuck under pressure, I look for why eviction cannot progress efficiently. Common causes are dirty-page pressure, slow storage, long-running transactions, history-store retention, large scans, or a working set that exceeds memory.

I do not increase cache size first because that can starve the OS. I identify the eviction blocker, fix it, then reassess capacity.`,

      keyTakeaways: [
        'Near-full cache is not enough to diagnose a problem.',
        'Eviction progress is the key question.',
        'Transactions and history can block cleanup.',
        'Storage speed matters.',
        'Cache size should not be changed blindly.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 16,
    question:
      'MongoDB latency spikes periodically during heavy writes and appears correlated with checkpoint activity. How would you prove whether checkpoints are the cause, a symptom, or simply exposing slow storage?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `Seeing checkpoint activity at the same time as latency does not prove:

"checkpoint is the root cause."

Checkpoints naturally perform storage work.

The real question is:

Why can the system not absorb that work without violating latency requirements?`,

      coreConcept: `Heavy writes
    |
    v
dirty cache grows
    |
    v
checkpoint/writeback
    |
    v
storage demand rises
    |
    v
if storage saturated
    |
    v
latency spike

Checkpoint may expose
underlying capacity issue.`,

      detailedExplanation: `A proper investigation requires timeline correlation.

Measure:

• application write latency
• dirty-cache growth
• checkpoint duration/activity
• disk write latency
• IOPS
• throughput
• queue depth
• write workload.

CASE 1 — CHECKPOINT CORRELATES WITH STORAGE SATURATION

Example:

Before checkpoint:
disk latency 5 ms.

During checkpoint:
disk latency 120 ms.
throughput reaches storage limit.

This suggests the underlying storage has insufficient headroom for checkpoint plus foreground writes.

CASE 2 — DIRTY DATA ALREADY HIGH

The checkpoint may be processing a backlog produced by sustained writes.

The workload itself is the upstream cause.

CASE 3 — PERIODIC OTHER WORKLOAD

Backup or batch job overlaps checkpoint periods.

The checkpoint may be blamed incorrectly.

CASE 4 — NORMAL CHECKPOINT, NO USER IMPACT

Checkpoint metrics change but application latency does not.

No incident exists.

The DBA should avoid unsupported attempts to disable or fundamentally alter checkpoint behavior.

The durable solution is usually:

• reduce unnecessary writes
• reduce index write amplification
• improve storage
• separate competing jobs
• increase capacity/headroom.`,

      internalWorking: `Timeline:

10:00 write spike
10:02 dirty cache rises
10:05 checkpoint
10:05 disk latency 100ms
10:06 app latency rises

Likely chain:
write pressure
→ checkpoint I/O
→ storage saturation
→ latency`,

      architecture: `                WRITES
                   |
                   v
             dirty cache
                   |
                   v
              checkpoint
                   |
                   v
                STORAGE
             /     |      \
            v      v       v
         latency  IOPS  throughput
                   |
                   v
            application impact`,

      examples: [
        `Checkpoint timing can expose storage limits.`,
        `A backup overlapping with checkpoint can amplify I/O.`,
        `A checkpoint with low disk latency and no app impact is normal.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Useful for dirty-cache and page-write correlation.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'May provide checkpoint-related transaction metrics depending on version.'
        }
      ],

      productionScenario: `Write latency spikes every few minutes.

Checkpoint events are visible at the same time.

The DBA correlates:

• dirty cache rising steadily
• storage throughput already at 90%
• checkpoint pushes it to the volume limit
• disk latency jumps to 110 ms.

The permanent fix is increased storage headroom and removal of an unnecessary write-heavy index, not disabling checkpoints.`,

      troubleshootingApproach: `1. Capture checkpoint timeline.

2. Capture write latency.

3. Capture dirty cache.

4. Capture storage latency.

5. Capture IOPS.

6. Capture throughput.

7. Check queueing.

8. Check write rate.

9. Check index count.

10. Check backup/batch overlap.

11. Build causal timeline.

12. Fix workload/storage headroom.

13. Revalidate checkpoint behavior.`,

      commonMistakes: [
        'Assuming correlation proves checkpoint is root cause.',
        'Trying to disable checkpoints.',
        'Ignoring storage limits.',
        'Ignoring dirty-data buildup.',
        'Ignoring overlapping maintenance workloads.'
      ],

      bestPractices: [
        'Correlate checkpoint with storage and dirty cache.',
        'Maintain write I/O headroom.',
        'Reduce unnecessary write amplification.',
        'Separate heavy maintenance windows.',
        'Treat checkpoints as normal durability behavior.'
      ],

      interviewAnswer: `If latency spikes around checkpoints, I correlate checkpoint timing with dirty-cache growth, write rate, storage latency, IOPS and throughput. If storage saturates during checkpoint work, the checkpoint is often exposing insufficient I/O headroom rather than being an abnormal feature itself.

I fix the upstream workload or storage capacity rather than trying to eliminate checkpoints.`,

      keyTakeaways: [
        'Checkpoint correlation is not enough.',
        'Dirty-cache and storage metrics prove the chain.',
        'Slow storage is a common underlying cause.',
        'Checkpoints are normal.',
        'Fix capacity or write amplification.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 17,
    question:
      'A long-running MongoDB transaction is causing cache pressure, history-store growth, and increased disk usage. How would you investigate and remediate the incident safely?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `Long-running transactions can hold old snapshots open.

If many documents continue changing, WiredTiger may need to retain historical versions for the old transaction.

This can create:

• history-store growth
• cache pressure
• disk growth
• higher reconciliation cost.`,

      coreConcept: `Transaction starts T1
       |
       v
keeps old snapshot
       |
many updates continue
       |
       v
older versions retained
       |
       v
history/cache/disk pressure`,

      detailedExplanation: `The investigation should answer:

1. WHICH TRANSACTION IS OLD?

Find:

• transaction duration
• client/app
• namespace
• session if available.

2. WHY IS IT STILL OPEN?

Possible application causes:

• transaction started too early
• network/client stalled
• user interaction inside transaction
• error path forgot to abort
• oversized batch.

3. HOW MUCH UPDATE ACTIVITY OCCURRED?

The pressure becomes worse when many records change while the transaction remains active.

4. WHAT STORAGE-ENGINE SYMPTOMS EXIST?

Check:

• cache
• eviction
• history-store activity
• disk growth
• storage latency.

5. CAN IT BE TERMINATED SAFELY?

Killing an operation or session can impact application work.

The DBA should coordinate with the application owner and understand transaction semantics before terminating.

6. AFTER TERMINATION

Do not expect all history/disk metrics to normalize instantly.

Cleanup can take time.

Monitor:

• transaction disappears
• oldest visibility progresses
• history pressure reduces
• cache improves
• storage stabilizes.

Permanent remediation belongs in the application:

keep transactions:

• short
• bounded
• free from user think-time
• free from unnecessary long waits.`,

      internalWorking: `Transaction T1
open 2 hours
   |
   v
updates continue
   |
   v
versions accumulate
   |
   v
history store grows

Terminate/fix transaction
   |
   v
old versions become
eligible for cleanup over time`,

      architecture: `             APPLICATION
                   |
              transaction
                   |
                  OLD
                   |
                   v
               WiredTiger
          +--------+--------+
          |                 |
          v                 v
       history            cache
          |                 |
          +--------+--------+
                   |
                   v
                 disk`,

      examples: [
        `An idle application transaction can still have storage-engine impact.`,
        `Heavy updates amplify the cost of an old snapshot.`,
        `Cleanup may continue after the transaction ends.`
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Used to locate long-running operations/transactions depending on privileges and version.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Provides transaction-related WiredTiger metrics.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps correlate transaction age with cache pressure.'
        }
      ],

      productionScenario: `Disk usage starts growing unusually fast.

No new collections were created.

The DBA finds one transaction open for nearly three hours against a heavily updated collection.

History-store and cache pressure increased during the same period.

The transaction is safely aborted after application coordination, and pressure gradually decreases.

The application is then fixed to enforce bounded transaction duration.`,

      troubleshootingApproach: `1. Identify transaction age.

2. Identify owning client/application.

3. Identify affected namespaces.

4. Measure update volume.

5. Check history-store metrics.

6. Check cache pressure.

7. Check disk growth.

8. Check disk latency.

9. Coordinate with app owner.

10. Abort/terminate safely if required.

11. Monitor cleanup.

12. Fix transaction design.

13. Add transaction-duration monitoring.`,

      commonMistakes: [
        'Ignoring idle transactions.',
        'Killing sessions without application coordination.',
        'Expecting disk usage to drop instantly.',
        'Treating the history store as disposable files.',
        'Allowing user interaction inside long transactions.'
      ],

      bestPractices: [
        'Keep transactions short.',
        'Monitor transaction duration.',
        'Set application-side time bounds.',
        'Correlate old transactions with history growth.',
        'Coordinate before terminating production work.'
      ],

      interviewAnswer: `For long-transaction pressure, I identify the oldest transaction and its owning application, then correlate its lifetime with update volume, history-store activity, cache pressure and disk growth.

If necessary, I terminate it in coordination with the application owner, then monitor cleanup and fix the application so transactions remain short and bounded.`,

      keyTakeaways: [
        'Old transactions can retain historical versions.',
        'Update volume amplifies the effect.',
        'History and cache pressure can result.',
        'Termination should be coordinated.',
        'Permanent fix belongs in transaction design.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 18,
    question:
      'MongoDB reports WiredTiger or storage-engine corruption during startup. How should an L3 DBA respond without making the situation worse?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `Storage-engine corruption is a high-risk incident.

The worst response is to begin deleting or editing WiredTiger files randomly.

The DBA must preserve evidence and determine whether recovery should come from:

• healthy replica-set members
• backup
• supported repair/recovery procedures.`,

      coreConcept: `Startup corruption error
        |
        v
STOP destructive actions
        |
        v
preserve files/logs
        |
   +----+----+
   |         |
   v         v
healthy    no healthy
replica    replica
   |         |
   v         v
resync     backup/
member     supported recovery`,

      detailedExplanation: `STEP 1 — PRESERVE EVIDENCE

Capture:

• exact startup error
• mongod logs
• server version
• storage-engine messages
• recent OS/storage events.

Do not repeatedly mutate files while experimenting.

STEP 2 — DETERMINE TOPOLOGY

If this member is a Secondary and other healthy replica-set members exist, the safest recovery may be:

rebuild/resync the damaged member

rather than trying to salvage it in place.

STEP 3 — CHECK STORAGE

Investigate:

• disk errors
• filesystem errors
• cloud volume events
• sudden power loss
• hardware issues.

Recovering the database onto failing storage can reproduce the incident.

STEP 4 — CHECK BACKUPS

If no healthy replica exists, identify the latest validated backup.

STEP 5 — SUPPORTED REPAIR

MongoDB provides repair capabilities for specific scenarios, but repair is not equivalent to guaranteed full data recovery.

It can discard unrecoverable data in some corruption cases.

Therefore it should be used only when appropriate and after understanding the implications for the exact version/deployment.

STEP 6 — REPLICA SET CAUTION

Do not use a repaired or uncertain node as authoritative when a known-good replica exists.

STEP 7 — VALIDATION

Any salvaged or repaired dataset requires strong validation.

Never manually:

• delete WiredTiger metadata files
• replace individual .wt files
• copy random storage-engine files from another live member

unless following a documented, supported recovery procedure.

Physical file consistency is more complex than file presence.`,

      internalWorking: `Corrupt Secondary

Healthy Primary exists
      |
      v
Do not salvage as authority
      |
      v
replace data directory
through supported resync/
initial sync process

safer than risky manual repair.`,

      architecture: `            CORRUPT MEMBER
                   |
          +--------+--------+
          |                 |
          v                 v
   healthy replica      no replica
      exists              available
          |                 |
          v                 v
       rebuild          backup/
       member           supported
                        recovery`,

      examples: [
        `A corrupted Secondary is often better rebuilt from a healthy replica.`,
        `Repair may recover availability but can involve data loss.`,
        `Underlying disk failure should be fixed before database recovery.`
      ],

      commands: [
        {
          command:
            'mongod --version',
          explanation:
            'Records the exact server version for version-specific recovery guidance.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'From a healthy member, helps determine whether authoritative replicas remain available.'
        }
      ],

      productionScenario: `A Secondary fails to start with WiredTiger corruption messages after a storage incident.

The Primary and another Secondary remain healthy.

Instead of running repair and introducing uncertainty, the DBA replaces the failed storage and allows the member to perform a clean initial sync from the healthy replica set.`,

      troubleshootingApproach: `1. Preserve exact error/logs.

2. Record MongoDB version.

3. Stop repeated restart experiments.

4. Determine whether healthy replicas exist.

5. Check storage/filesystem health.

6. Check recent unclean shutdowns.

7. Check backup availability.

8. Prefer resync when a healthy authoritative replica exists.

9. Use repair only when justified and documented.

10. Validate recovered data.

11. Replace faulty infrastructure.

12. Complete RCA.`,

      commonMistakes: [
        'Deleting WiredTiger files manually.',
        'Running repair immediately on a Secondary with healthy peers.',
        'Treating repaired data as automatically complete.',
        'Ignoring underlying disk faults.',
        'Copying individual .wt files between members.'
      ],

      bestPractices: [
        'Preserve evidence.',
        'Prefer healthy replicas as recovery source.',
        'Use supported recovery procedures.',
        'Fix underlying storage first.',
        'Validate any salvaged dataset carefully.'
      ],

      interviewAnswer: `For WiredTiger corruption, I avoid manual file manipulation. I preserve logs and determine whether healthy replica-set members exist. If they do, rebuilding the damaged member from a healthy source is usually safer than attempting in-place salvage.

If no healthy replica exists, I evaluate validated backups and supported repair/recovery options, understanding that repair may not preserve all data. I also investigate the underlying storage failure before restoring service.`,

      keyTakeaways: [
        'Corruption is a high-risk incident.',
        'Never manipulate WiredTiger files casually.',
        'Healthy replicas are preferred recovery sources.',
        'Repair may involve data loss.',
        'Underlying storage must be investigated.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 19,
    question:
      'How would you distinguish WiredTiger storage-engine pressure from a query-planner problem when both produce slow MongoDB operations?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `Both a bad query plan and storage-engine pressure can produce:

"query is slow."

The DBA must separate:

how much logical work the query performs

from:

how expensive each page/storage operation has become.`,

      coreConcept: `Slow query
   |
   +--> excessive work?
   |      |
   |      v
   |   bad plan/
   |   selectivity
   |
   +--> normal work,
          slow resources?
          |
          v
       cache/storage
       pressure`,

      detailedExplanation: `QUERY-PLANNER PROBLEM

Typical evidence:

• COLLSCAN
• wrong/nonselective index
• millions of keys examined
• millions of docs examined
• expensive sort
• excessive work relative to nReturned.

Example:

10 million docs examined
10 returned.

STORAGE-ENGINE PRESSURE

Typical evidence:

• query plan still efficient
• keys/docs examined remain low
• cache page reads increase
• eviction pressure rises
• disk latency rises
• many otherwise efficient queries slow together.

Example:

20 keys examined
10 docs examined

but:

storage latency = 150 ms

because index/data pages are not in cache.

BOTH CAN OCCUR TOGETHER

A bad plan creates excessive page reads.

That then causes cache churn and storage saturation.

This is why the best RCA may be:

bad query
→ excessive scans
→ cache eviction
→ disk reads
→ storage latency
→ system-wide slowdown.

The DBA should not force a false choice between:

query problem

and:

WiredTiger problem.

Often one is upstream of the other.`,

      internalWorking: `Case A:

Docs examined = 10M
Disk normal
=> query inefficiency


Case B:

Docs examined = 20
Disk = 150ms
=> resource/storage problem


Case C:

Docs examined = 10M
Disk becomes 150ms
=> query causes storage pressure`,

      architecture: `                QUERY
                    |
                 explain
                    |
             logical work
                    |
                    v
               WiredTiger
                    |
             cache/storage
                    |
                    v
                 latency`,

      examples: [
        `Efficient query plans can still be slow on cold data and slow disks.`,
        `COLLSCAN can create the cache/storage problem itself.`,
        `Compare logical work and physical resource cost separately.`
      ],

      commands: [
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Measures logical query work such as keys/docs examined.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Measures cache behavior and page pressure.'
        }
      ],

      productionScenario: `A key API slows from 15 ms to 2 seconds.

Explain shows:

IXSCAN
25 keys examined
8 docs examined.

The plan is still efficient.

At the same time, WiredTiger page reads and storage latency spike.

The DBA investigates cache eviction and storage rather than rebuilding indexes unnecessarily.`,

      troubleshootingApproach: `1. Capture query plan.

2. Check keys examined.

3. Check docs examined.

4. Check nReturned.

5. Compare with baseline.

6. Check cache page reads.

7. Check eviction.

8. Check disk latency.

9. Check working-set changes.

10. Check large concurrent scans.

11. Determine upstream cause.

12. Fix logical or physical bottleneck accordingly.`,

      commonMistakes: [
        'Blaming WiredTiger without explain.',
        'Blaming query planner without storage metrics.',
        'Assuming IXSCAN means no storage problem.',
        'Treating query and storage issues as mutually exclusive.',
        'Rebuilding indexes without evidence.'
      ],

      bestPractices: [
        'Separate logical work from physical cost.',
        'Use explain and WiredTiger metrics together.',
        'Compare with baseline.',
        'Find the upstream trigger.',
        'Avoid unnecessary index changes.'
      ],

      interviewAnswer: `I distinguish query-planner problems from WiredTiger pressure by measuring logical query work and physical resource cost separately. Explain tells me keys/docs examined and the selected plan, while WiredTiger and storage metrics tell me whether otherwise efficient work is expensive because of cache misses or disk latency.

They can also be connected—for example, a bad scan can create cache and storage pressure for the entire system.`,

      keyTakeaways: [
        'Explain measures logical work.',
        'WiredTiger metrics measure storage-engine pressure.',
        'Good plans can still be slow on bad storage.',
        'Bad plans can create storage pressure.',
        'Find the upstream cause.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'wiredtiger_internals',
    topicId: 'wiredtiger-internals',
    topicNumber: 14,
    topicName: 'WiredTiger Internals',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 MongoDB WiredTiger investigation involving cache pressure, dirty pages, eviction stalls, history-store growth, checkpoint latency, and slow storage?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `A serious WiredTiger incident can present many symptoms at the same time:

• cache near pressure limits
• dirty data increasing
• eviction rising
• history-store activity increasing
• checkpoint latency
• disk latency
• application slowdown.

The DBA's job is to build one causal chain instead of reacting to each metric separately.`,

      coreConcept: `Application workload
       |
       v
updates/scans/transactions
       |
       v
WiredTiger cache
       |
 +-----+-----+
 |           |
dirty      history
pages      versions
 |           |
 +-----+-----+
       |
    eviction
       |
       v
reconciliation
       |
       v
checkpoint/storage
       |
       v
application latency`,

      detailedExplanation: `PHASE 1 — ESTABLISH INCIDENT TIMELINE

Record:

• first latency increase
• deployment
• batch jobs
• transaction changes
• storage events.

PHASE 2 — IDENTIFY WORKLOAD CHANGE

Measure:

• reads/sec
• writes/sec
• update rate
• query scans
• transaction duration.

PHASE 3 — CACHE

Check:

• cache occupancy
• page reads
• dirty bytes
• eviction.

PHASE 4 — HISTORY

Check whether:

• long transactions exist
• old snapshots remain active
• heavily updated collections are involved
• history-store activity/growth increased.

PHASE 5 — EVICTION

Determine whether eviction is:

normal turnover

or:

under pressure.

Look for:

• application-thread participation
• inability to drain dirty pages
• repeated page rereads.

PHASE 6 — CHECKPOINT

Correlate:

• checkpoint periods
• dirty-data levels
• storage writes
• application latency.

PHASE 7 — STORAGE

Measure:

• read latency
• write latency
• IOPS
• throughput
• queueing
• cloud limits.

PHASE 8 — QUERY ANALYSIS

Large scans may be the trigger.

Use explain to identify:

• COLLSCAN
• huge key ranges
• inefficient aggregations.

PHASE 9 — TRANSACTION ANALYSIS

An old transaction may be preventing history cleanup.

PHASE 10 — BUILD CAUSAL CHAIN

Example:

new reporting transaction
→ remains open 90 minutes
→ high update workload continues
→ historical versions retained
→ history-store grows
→ cache pressure rises
→ eviction/reconciliation increases
→ storage writes increase
→ storage saturates
→ checkpoint periods become slower
→ application latency increases.

PHASE 11 — STABILIZE

Depending on evidence:

• stop runaway scan
• abort pathological transaction
• pause noncritical batch/backup
• add urgent storage headroom
• reduce workload pressure.

PHASE 12 — PERMANENT FIX

Examples:

• shorten transactions
• redesign report workload
• improve indexes
• isolate analytics
• increase RAM/storage
• improve monitoring.

PHASE 13 — VALIDATE

Compare:

• cache
• history
• eviction
• storage
• application latency

against normal baseline.

PHASE 14 — RCA

Document trigger, causal chain, mitigation, and permanent actions.`,

      internalWorking: `Bad transaction/workload
        |
        v
history retained
        |
        v
cache pressure
        |
        v
eviction/reconciliation
        |
        v
more I/O
        |
        v
storage saturation
        |
        v
checkpoint slowdown
        |
        v
application latency`,

      architecture: `               APPLICATION
                     |
                     v
                  MONGOD
                     |
                 WiredTiger
      +--------------+--------------+
      |              |              |
      v              v              v
    CACHE          HISTORY       TRANSACTIONS
      |              |              |
      +--------------+--------------+
                     |
                 EVICTION
                     |
              RECONCILIATION
                     |
                CHECKPOINT
                     |
                     v
                  STORAGE
                     |
                     v
                 LATENCY`,

      examples: [
        `A long transaction can be the upstream cause of history and cache pressure.`,
        `Slow storage can amplify dirty-page and checkpoint problems.`,
        `A large scan can create cache churn without any transaction issue.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger',
          explanation:
            'Broad WiredTiger metric source for cache, transaction and storage-engine analysis.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Focuses on cache, dirty-page and eviction behavior.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Useful for transaction/history-related investigation.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Helps identify long transactions and disruptive operations.'
        },
        {
          command:
            'db.collection.find(<critical-query>).explain("executionStats")',
          explanation:
            'Determines whether inefficient query execution is driving storage-engine pressure.'
        }
      ],

      productionScenario: `At 14:00 application p99 latency rises from:

70 ms

to:

2.5 seconds.

Evidence shows:

• a new analytical transaction started at 13:45
• it remains open
• the collection receives heavy updates
• history-store activity rises
• cache dirty bytes increase
• eviction pressure rises
• disk write latency reaches 90 ms
• checkpoint periods now coincide with major latency spikes.

The DBA identifies the chain:

long transaction
→ historical-version retention
→ cache/history pressure
→ reconciliation and storage growth
→ disk saturation
→ checkpoint amplification
→ application latency.

The transaction is safely terminated, the analytical workflow is redesigned, and storage headroom is increased.`,

      troubleshootingApproach: `1. Establish incident timeline.

2. Measure app p95/p99.

3. Measure reads/writes.

4. Check cache occupancy.

5. Check dirty bytes.

6. Check page reads.

7. Check eviction.

8. Check application-thread eviction indicators.

9. Check long transactions.

10. Check transaction age.

11. Check history-store activity.

12. Check checkpoint timing.

13. Check disk read/write latency.

14. Check IOPS.

15. Check throughput.

16. Check storage limits.

17. Check large scans.

18. Run explain.

19. Build causal chain.

20. Stop or reduce offending workload safely.

21. Monitor cleanup.

22. Implement permanent fix.

23. Compare with baseline.

24. Document RCA.`,

      commonMistakes: [
        'Restarting mongod before collecting evidence.',
        'Changing cache size immediately.',
        'Treating checkpoint as the root cause automatically.',
        'Ignoring history-store growth.',
        'Ignoring long-running transactions.',
        'Ignoring query scans.',
        'Manipulating WiredTiger files manually.'
      ],

      bestPractices: [
        'Correlate workload, transactions, cache and storage.',
        'Identify the upstream trigger.',
        'Keep transactions short.',
        'Maintain storage headroom.',
        'Use explain to identify cache-polluting scans.',
        'Avoid unsupported storage-engine manipulation.',
        'Maintain WiredTiger baselines.'
      ],

      interviewAnswer: `For a complex WiredTiger incident, I correlate application latency with workload, cache occupancy, dirty bytes, eviction, history-store behavior, transaction age, checkpoint activity, and storage latency.

I build one causal chain. For example, a long transaction can retain old versions, increase history and cache pressure, drive more reconciliation and I/O, saturate storage, and make checkpoint periods visibly painful.

I stabilize the upstream workload first, validate that WiredTiger pressure subsides, then implement the permanent application or capacity fix.`,

      keyTakeaways: [
        'WiredTiger symptoms are interconnected.',
        'Long transactions can be upstream causes.',
        'Dirty pages and history increase I/O pressure.',
        'Checkpoints can expose slow storage.',
        'The DBA should build one evidence-based causal chain.'
      ]
    }
  }

];

/* =========================================================
   SEED EXECUTION
========================================================= */

async function seedWiredTigerInternals() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'wiredtiger_internals'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous wiredtiger_internals documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} WiredTiger Internals questions`
    );

    await collection.createIndex(
      {
        topicId: 1,
        order: 1
      },
      {
        unique: true,
        name: 'topicId_order_unique',
        partialFilterExpression: {
          topicId: {
            $exists: true
          }
        }
      }
    );

    const topicCount =
      await collection.countDocuments({
        category: 'wiredtiger_internals'
      });

    console.log(
      `Topic 14 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 14 validation failed. Expected 20 questions but found ${topicCount}.`
      );
    }

    const curriculumCount =
      await collection.countDocuments({
        topicId: {
          $exists: true
        }
      });

    console.log(
      `New curriculum question count: ${curriculumCount}`
    );

    console.log(
      'Topic 14 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 14 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedWiredTigerInternals();
