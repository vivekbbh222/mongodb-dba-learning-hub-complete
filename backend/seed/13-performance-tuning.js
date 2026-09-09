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
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 1,
    question:
      'What does MongoDB performance tuning actually mean, and what should a DBA measure before making any tuning change?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `MongoDB performance tuning means improving how efficiently the database serves the application workload.

It does not mean randomly changing parameters.

A DBA should first measure what is actually slow or resource constrained.

Typical areas include:

• query latency
• throughput
• CPU
• memory
• WiredTiger cache
• disk latency
• disk throughput
• connections
• replication lag
• query plans
• lock/contention behavior.`,

      coreConcept: `Performance tuning should follow:

Measure
  |
  v
Identify bottleneck
  |
  v
Find root cause
  |
  v
Apply targeted change
  |
  v
Measure again

Not:

Guess
  |
  v
Change many things
  |
  v
Hope it improves`,

      detailedExplanation: `A MongoDB environment can be slow for many completely different reasons.

Examples:

CASE 1 — BAD QUERY

A query performs COLLSCAN across millions of documents.

The correct fix may be an index.

CASE 2 — HIGH DISK LATENCY

Queries use indexes correctly, but storage latency is extremely high.

Adding another index may make the problem worse.

CASE 3 — MEMORY PRESSURE

The active working set no longer fits effectively in memory.

Frequent storage reads increase latency.

CASE 4 — CPU SATURATION

Complex aggregation, compression, encryption, or high query volume may drive CPU close to saturation.

CASE 5 — CONNECTION PRESSURE

Too many application connections can consume resources and increase scheduling overhead.

CASE 6 — REPLICATION PRESSURE

A Secondary may lag because storage cannot apply changes quickly enough.

Therefore the DBA needs a baseline.

A useful baseline includes:

• normal query latency
• peak query latency
• operations per second
• CPU utilization
• memory utilization
• WiredTiger cache metrics
• disk read/write latency
• disk IOPS and throughput
• network throughput
• connection counts
• replication lag
• most frequent query shapes
• slow query patterns.

Performance tuning is evidence-driven.

The goal is not:

"make every metric low."

The goal is:

meet application SLA efficiently and predictably.`,

      internalWorking: `Symptom:

API latency = 2 seconds

Possible causes:

query plan
disk
CPU
cache
network
locks
replication
application

Need evidence before changing anything.`,

      architecture: `              APPLICATION
                    |
                    v
                 MONGOS/
                MONGOD
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
      Query       Cache       Storage
       Plan         |           |
        |           |           |
        +-----------+-----------+
                    |
                    v
                 Latency`,

      examples: [
        `High CPU caused by one unindexed query should be fixed differently from high CPU caused by 50,000 legitimate indexed operations per second.`,
        `Low disk utilization percentage does not prove storage latency is healthy.`,
        `One slow shard can dominate distributed query latency.`
      ],

      commands: [
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides a broad set of MongoDB server metrics useful for establishing a performance baseline.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help identify active long-running operations, depending on privileges and version.'
        }
      ],

      productionScenario: `A production MongoDB server reaches 90% CPU.

The immediate recommendation is:

"Increase CPU."

The DBA first checks slow operations and query plans.

One newly deployed query is performing millions of document examinations per request.

After adding the correct index and fixing the query shape:

CPU falls to 35%.

The infrastructure was not undersized.

The workload was inefficient.`,

      troubleshootingApproach: `1. Define the performance symptom.

2. Record exact time window.

3. Measure application latency.

4. Measure throughput.

5. Check CPU.

6. Check memory.

7. Check WiredTiger cache.

8. Check disk latency.

9. Check network.

10. Check connections.

11. Check slow queries.

12. Run explain.

13. Check replication lag.

14. Compare with known-good baseline.

15. Identify the bottleneck.

16. Change one thing.

17. Measure again.`,

      commonMistakes: [
        'Changing parameters before measuring.',
        'Treating high CPU as automatically bad.',
        'Adding indexes without query analysis.',
        'Changing several variables simultaneously.',
        'Using only average metrics and ignoring peaks.'
      ],

      bestPractices: [
        'Maintain a normal performance baseline.',
        'Correlate database and infrastructure metrics.',
        'Change one major variable at a time.',
        'Measure before and after.',
        'Tune against application SLA.'
      ],

      interviewAnswer: `MongoDB performance tuning is an evidence-driven process. I first define the symptom and baseline query latency, throughput, CPU, cache, memory, disk latency, connections, query plans, and replication health.

Then I identify the actual bottleneck, make the smallest targeted change, and compare before-and-after results. I do not start by randomly changing MongoDB parameters.`,

      keyTakeaways: [
        'Performance tuning begins with measurement.',
        'Symptoms can have many root causes.',
        'Baseline data is essential.',
        'Changes should be targeted.',
        'Application SLA is the real objective.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 2,
    question:
      'What is the difference between latency, throughput, and concurrency in MongoDB performance analysis?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `Latency means:

How long one operation takes.

Throughput means:

How many operations the system completes per unit of time.

Concurrency means:

How many operations are active or competing at the same time.`,

      coreConcept: `Latency:

1 query = 20 ms


Throughput:

10,000 operations/sec


Concurrency:

500 operations executing/
waiting at the same time`,

      detailedExplanation: `These three concepts are related but not identical.

LATENCY

Example:

find() takes 15 ms.

This describes response time for an operation.

THROUGHPUT

Example:

MongoDB processes:

20,000 reads/sec.

This measures overall work rate.

CONCURRENCY

Example:

1,000 requests arrive simultaneously.

This determines how much work competes for:

• CPU
• cache
• storage
• connections
• internal execution resources.

A system can have:

high throughput
and
low latency

when it has enough capacity.

But as concurrency increases beyond the capacity of a bottleneck, queues form.

Example:

Storage can efficiently process workload until:

10,000 operations/sec.

Application pushes:

20,000 operations/sec.

Requests begin waiting.

Latency increases.

This produces an important performance principle:

High latency does not always mean one query is inherently slow.

The same query may be:

10 ms at low load

and:

300 ms at peak concurrency

because it waits behind other work.

Therefore performance testing should include realistic concurrency.

Testing one query manually in mongosh may not reproduce production latency.`,

      internalWorking: `Low load:

Query execution:
10 ms

High concurrency:

Wait:
150 ms

Execute:
10 ms

Total latency:
160 ms

The query itself did not become
16x more expensive.`,

      architecture: `               REQUESTS
                    |
              concurrency
                    |
                    v
              shared resources
          +---------+---------+
          |         |         |
          v         v         v
         CPU       Cache     Disk
          \         |         /
           \        |        /
              throughput
                  |
                  v
                latency`,

      examples: [
        `Latency = 50 ms per query.`,
        `Throughput = 8,000 queries per second.`,
        `Concurrency = 400 simultaneous requests.`,
        `Latency can rise sharply when concurrency exceeds a resource's capacity.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().opcounters',
          explanation:
            'Provides operation counters that can be observed over time to estimate workload throughput.'
        },
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Shows connection-related metrics, which are one part of concurrency analysis.'
        }
      ],

      productionScenario: `A query takes:

8 ms

when tested manually.

During the 10 AM traffic peak, the API reports:

250 ms.

Explain remains efficient.

The DBA finds storage queues and CPU run queues increase only during peak concurrency.

The issue is capacity contention under load rather than an inherently bad query plan.`,

      troubleshootingApproach: `1. Measure per-operation latency.

2. Measure operations/sec.

3. Measure concurrent application requests.

4. Measure active connections.

5. Check CPU saturation.

6. Check disk queue/latency.

7. Compare low-load and peak-load behavior.

8. Verify query plan remains the same.

9. Identify where queuing begins.

10. Tune capacity or workload accordingly.`,

      commonMistakes: [
        'Using latency and throughput interchangeably.',
        'Testing only single-threaded queries.',
        'Assuming more concurrency always increases throughput.',
        'Ignoring queueing effects.',
        'Comparing production peak latency with an idle test environment.'
      ],

      bestPractices: [
        'Measure all three dimensions.',
        'Load-test realistic concurrency.',
        'Watch tail latency, not only averages.',
        'Identify resource saturation points.',
        'Capacity-plan for peak workloads.'
      ],

      interviewAnswer: `Latency is the response time of an operation, throughput is the amount of work completed per second, and concurrency is the amount of simultaneous work competing for resources.

As concurrency increases, throughput may rise until a bottleneck saturates. Beyond that point queues form and latency increases sharply. That is why I compare performance under realistic production concurrency, not only single-query tests.`,

      keyTakeaways: [
        'Latency measures time.',
        'Throughput measures work rate.',
        'Concurrency measures simultaneous demand.',
        'Queueing can increase latency.',
        'Production testing must reflect real load.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 3,
    question:
      'How should a MongoDB DBA investigate high CPU utilization and determine whether the root cause is query inefficiency, workload volume, or another subsystem?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `High CPU is a symptom.

It does not automatically mean:

"MongoDB needs more CPUs."

The first question is:

What work is consuming the CPU?`,

      coreConcept: `High CPU
   |
   v
Is workload higher?
   |
   +--> yes -> capacity?
   |
   v
Are queries inefficient?
   |
   +--> COLLSCAN
   +--> excessive documents examined
   +--> aggregation
   +--> sorting
   |
   v
Other work?
   |
   +--> compression
   +--> index build
   +--> backup
   +--> replication
   +--> encryption`,

      detailedExplanation: `MongoDB CPU consumption can come from many workloads.

QUERY EXECUTION

Examples:

• collection scans
• expensive expressions
• large aggregations
• excessive sorting
• inefficient index selection.

INDEX OPERATIONS

Examples:

• index builds
• maintaining many indexes during heavy writes.

COMPRESSION

WiredTiger compression saves disk space and I/O but consumes CPU.

BACKUP

Compression or logical backup processing can increase CPU.

REPLICATION

High write volume creates replication processing on Secondaries.

CONNECTION/REQUEST VOLUME

Even efficient queries can consume high CPU if there are enough of them.

The DBA should correlate:

CPU spike time

with:

• operations/sec
• query shapes
• slow logs
• deployments
• index builds
• backup jobs
• replication activity.

Important distinction:

Case A:

CPU 90%
and throughput doubled.

This may be legitimate capacity demand.

Case B:

CPU 90%
but throughput is unchanged.

A regression or inefficient workload is more likely.

Case C:

CPU 90%
after new index build starts.

The index build may explain the change.

Do not add CPU before understanding which case exists.`,

      internalWorking: `CPU high

Compare:

Before:
5k ops/sec
40% CPU

Now:
10k ops/sec
85% CPU

May be workload growth.


Or:

Before:
5k ops/sec
40%

Now:
5k ops/sec
90%

Likely efficiency regression.`,

      architecture: `               CPU USAGE
                    |
       +------------+------------+
       |            |            |
       v            v            v
     queries      writes      background
       |            |            |
       v            v            v
     plans       indexes      backup/
                              index build/
                              replication`,

      examples: [
        `COLLSCAN can consume CPU while examining large numbers of documents.`,
        `Large aggregations may be CPU-heavy even with indexes.`,
        `High throughput on correctly indexed queries can still legitimately saturate CPU.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().opcounters',
          explanation:
            'Helps correlate operation volume with CPU behavior.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can reveal long-running active operations.'
        },
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Used to identify inefficient query execution.'
        }
      ],

      productionScenario: `CPU jumps from 45% to 95% after an application release.

Operations/sec remains roughly unchanged.

The DBA identifies a new query doing:

COLLSCAN

with:

8 million documents examined

to return:

20 documents.

A compound index fixes the query and CPU returns to normal.

Scaling the server would only have hidden the regression temporarily.`,

      troubleshootingApproach: `1. Record CPU spike time.

2. Compare operations/sec before and during spike.

3. Check new deployments.

4. Check slow queries.

5. Identify top query shapes.

6. Run explain.

7. Check aggregation workload.

8. Check index builds.

9. Check backup jobs.

10. Check write/index maintenance load.

11. Check replication work.

12. Compare user vs system CPU.

13. Fix inefficiency or scale legitimate workload.

14. Measure result.`,

      commonMistakes: [
        'Scaling CPU immediately.',
        'Looking only at percentage CPU.',
        'Ignoring throughput changes.',
        'Ignoring new application releases.',
        'Adding indexes without identifying the actual hot query.'
      ],

      bestPractices: [
        'Correlate CPU with workload.',
        'Track top query shapes.',
        'Compare before and after deployment.',
        'Distinguish legitimate demand from regression.',
        'Scale only after efficiency is understood.'
      ],

      interviewAnswer: `For high CPU I first correlate the spike with operations per second and recent workload changes. If throughput is unchanged but CPU doubled, I suspect an efficiency regression and inspect slow queries, explain plans, aggregations, index builds, backups, and replication activity.

If queries are already efficient and throughput has genuinely grown, then capacity scaling may be appropriate.`,

      keyTakeaways: [
        'High CPU is a symptom.',
        'Throughput correlation is important.',
        'Query regressions are common causes.',
        'Background work can also consume CPU.',
        'Scale only after root cause analysis.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 4,
    question:
      'How should a MongoDB DBA interpret high memory usage, and why is high RAM consumption by mongod not automatically a problem?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `MongoDB intentionally uses memory to improve performance.

WiredTiger maintains an internal cache, and the operating system may also use free memory for filesystem caching.

Therefore:

"MongoDB uses a lot of RAM"

does not automatically mean:

"MongoDB has a memory problem."`,

      coreConcept: `RAM

+-----------------------+
| WiredTiger cache      |
+-----------------------+
| OS filesystem cache   |
+-----------------------+
| mongod/process memory |
+-----------------------+
| other processes       |
+-----------------------+

High utilization can be healthy.

Pressure is the real question.`,

      detailedExplanation: `Memory should be analyzed based on pressure and workload behavior.

WIREDTIGER CACHE

WiredTiger uses cache to keep frequently accessed pages and manage writes.

OS FILESYSTEM CACHE

The operating system may use otherwise free RAM to cache filesystem data.

PROCESS MEMORY

mongod also uses memory outside the WiredTiger cache for:

• connections
• query execution
• aggregation
• indexes/metadata
• internal structures
• encryption/compression work.

What indicates a potential memory problem?

Examples:

• heavy swapping
• sustained cache eviction pressure
• increasing storage reads because working set does not fit
• OOM events
• application latency correlated with memory pressure
• other critical processes being starved.

Linux often reports low "free" memory because it uses RAM productively for cache.

More useful questions include:

• Is swap actively being used?
• Is there memory available for the OS?
• Is WiredTiger cache constantly evicting?
• Is disk read pressure increasing?
• Is the application working set larger than memory?

The DBA should distinguish:

high memory utilization

from:

memory exhaustion.`,

      internalWorking: `Healthy:

RAM used = 85%
swap = near zero
cache effective
disk latency normal
queries fast


Unhealthy:

RAM pressure
swap active
cache eviction high
disk reads rise
latency rises`,

      architecture: `                 SYSTEM RAM
                    |
          +---------+---------+
          |                   |
          v                   v
      WiredTiger            OS cache
          |                   |
          +---------+---------+
                    |
                    v
              fewer disk reads
                    |
                    v
                lower latency`,

      examples: [
        `80% RAM usage can be perfectly healthy.`,
        `20% free RAM does not mean MongoDB should release memory.`,
        `Active swapping under database load is much more concerning than high utilization alone.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows WiredTiger cache metrics relevant to memory-pressure analysis.'
        },
        {
          command:
            'db.serverStatus().mem',
          explanation:
            'Provides process-level memory information, though OS-level metrics should also be checked.'
        }
      ],

      productionScenario: `An alert reports:

mongod memory usage = 70%.

The team proposes restarting MongoDB to free memory.

The DBA checks:

• no swap activity
• normal disk latency
• low eviction pressure
• stable query latency.

The memory is being used effectively as cache.

Restarting would actually make performance temporarily worse because the cache would become cold.`,

      troubleshootingApproach: `1. Check total RAM.

2. Check available memory.

3. Check swap activity.

4. Check mongod resident memory.

5. Check WiredTiger cache usage.

6. Check eviction metrics.

7. Check disk reads.

8. Check disk latency.

9. Check application latency.

10. Check other processes.

11. Determine whether there is actual pressure.

12. Avoid restart unless there is a real fault.`,

      commonMistakes: [
        'Treating high RAM utilization as a failure.',
        'Restarting MongoDB just to clear cache.',
        'Looking only at free memory.',
        'Ignoring swap.',
        'Ignoring WiredTiger eviction behavior.'
      ],

      bestPractices: [
        'Evaluate memory pressure, not percentage alone.',
        'Monitor swap activity.',
        'Monitor WiredTiger cache and eviction.',
        'Keep OS headroom.',
        'Correlate memory with disk and latency.'
      ],

      interviewAnswer: `High mongod memory usage is often normal because MongoDB and the operating system intentionally use RAM for caching. I do not diagnose memory problems from utilization percentage alone.

I check swap activity, available memory, WiredTiger cache usage, eviction pressure, disk-read behavior, and latency. The important distinction is high utilization versus actual memory pressure.`,

      keyTakeaways: [
        'MongoDB intentionally uses RAM.',
        'High usage can be healthy.',
        'Swap is an important warning signal.',
        'Eviction pressure matters.',
        'Restarting a healthy cache can hurt performance.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 5,
    question:
      'What is a MongoDB working set, and how does working-set size affect WiredTiger cache, disk reads, and query latency?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `The working set is the subset of data and indexes actively used by the application during a meaningful period.

A database may contain:

10 TB

while the application regularly accesses only:

100 GB.

That 100 GB active portion is closer to the practical working set.`,

      coreConcept: `Total database:
10 TB

Frequently accessed:
100 GB

Working set ≈ active data
+ active index pages

If active pages fit in memory:
fewer disk reads.

If not:
more cache misses and disk I/O.`,

      detailedExplanation: `MongoDB performance depends heavily on whether frequently accessed data and indexes can be served from memory.

Consider two workloads.

WORKLOAD A

Dataset:
5 TB

Working set:
50 GB

RAM:
128 GB

The actively used pages may fit comfortably.

WORKLOAD B

Dataset:
500 GB

Working set:
300 GB

RAM:
64 GB

Even though the total database is smaller, the active working set is much larger relative to memory.

Workload B may generate significantly more disk reads.

Important distinction:

Working set is not simply:

db.stats().dataSize

or:

total index size.

It depends on access patterns.

Examples of a working set include:

• recent 24 hours of events
• hottest customer accounts
• root/upper index pages plus frequently accessed leaf pages
• frequently updated records.

If the working set exceeds effective memory capacity:

• cache misses increase
• pages are read from storage
• eviction activity may rise
• disk latency becomes more important
• query latency can increase.

The appropriate response is not always:

"add RAM."

Other options include:

• improve indexes
• reduce scanned data
• archive cold data
• shard workload
• redesign access patterns
• increase memory where justified.`,

      internalWorking: `Query requests page

Is page in cache?
   |
 +--+--+
 |     |
YES    NO
 |      |
fast   disk read
        |
        v
     higher latency

If misses become frequent,
storage dominates.`,

      architecture: `             APPLICATION
                  |
                  v
             WORKING SET
                  |
                  v
          WiredTiger cache
             /          \
            v            v
         HIT            MISS
          |              |
          v              v
        memory          disk
          |              |
          v              v
        fast         more latency`,

      examples: [
        `A large historical collection can perform well if most queries access only recent data.`,
        `A smaller database can perform poorly if nearly every page is accessed randomly.`,
        `Poor indexes can artificially enlarge the effective working set by forcing excessive scans.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides cache metrics that help infer cache pressure and page activity.'
        }
      ],

      productionScenario: `A 2 TB collection performs well for months.

A new reporting workload begins scanning historical data randomly.

The underlying dataset size has not changed significantly, but the effective working set expands dramatically.

Cache misses and disk reads increase and API latency rises.

The root cause is the changed access pattern, not simply database size.`,

      troubleshootingApproach: `1. Identify hot collections.

2. Identify hot indexes.

3. Capture top query patterns.

4. Determine frequently accessed data range.

5. Check cache metrics.

6. Check eviction.

7. Check disk read volume.

8. Check disk latency.

9. Identify scans that enlarge the working set.

10. Improve query/index design.

11. Consider memory/capacity changes.

12. Measure again.`,

      commonMistakes: [
        'Equating total database size with working set.',
        'Ignoring index pages.',
        'Assuming cache misses are always caused by low RAM.',
        'Ignoring new analytical workloads.',
        'Adding RAM before fixing unnecessary scans.'
      ],

      bestPractices: [
        'Understand access patterns.',
        'Keep high-value query paths efficient.',
        'Monitor cache and disk together.',
        'Separate hot and cold data where useful.',
        'Scale memory based on measured working-set pressure.'
      ],

      interviewAnswer: `The working set is the active subset of data and indexes repeatedly used by the workload. If it fits effectively in memory, MongoDB can serve many operations without storage reads.

When the working set exceeds effective cache capacity, cache misses and eviction increase, storage becomes more important, and latency can rise. I analyze query patterns and cache/disk metrics before deciding whether the fix is indexing, workload redesign, archiving, sharding, or more RAM.`,

      keyTakeaways: [
        'Working set is workload-dependent.',
        'It includes active data and index pages.',
        'Cache misses lead to storage reads.',
        'Total database size is not the same as working set.',
        'Query design can change working-set pressure.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 6,
    question:
      'How should a DBA troubleshoot high disk latency in MongoDB, and how do you distinguish a storage problem from a query problem?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `MongoDB ultimately depends on storage for data that is not already served from memory.

High disk latency can make:

• reads slow
• writes slow
• checkpoints slower
• replication lag
• backups slower
• index builds slower.

But high disk activity does not automatically mean storage hardware is the root cause.`,

      coreConcept: `High disk latency
      |
      v
Why so much I/O?
      |
   +--+--+
   |     |
   v     v
bad    legitimate
queries workload
   |     |
   v     v
fix    capacity/
scan   storage`,

      detailedExplanation: `Suppose disk latency increases to:

100 ms.

There are two broad possibilities.

CASE 1 — STORAGE IS TOO SLOW

Queries are efficient, workload is normal, but the storage system cannot deliver required IOPS/throughput.

CASE 2 — DATABASE IS GENERATING TOO MUCH I/O

Example:

A COLLSCAN examines 50 million documents every minute.

The storage system may be working correctly, but the query creates unnecessary reads.

Therefore the DBA needs both database and OS/storage evidence.

DATABASE SIDE:

• slow queries
• explain plans
• totalDocsExamined
• index usage
• cache misses
• eviction
• checkpoints
• backup/index-build activity.

STORAGE SIDE:

• read latency
• write latency
• IOPS
• throughput
• queue depth
• filesystem utilization
• cloud volume limits.

Another important distinction is:

latency versus utilization.

A disk can show relatively modest throughput but still have high latency if:

• IOPS limit is reached
• burst credits are exhausted
• backend storage is degraded
• queueing is high.

Conversely, high throughput with low latency may be healthy.

The DBA should compare:

normal baseline

versus:

incident values.`,

      internalWorking: `Query:

needs 10 pages
    |
    v
10 disk reads

vs

Bad query:
scans 1,000,000 pages
    |
    v
huge disk load

Storage metrics alone
cannot explain why requests exist.`,

      architecture: `               MongoDB
                  |
          read/write requests
                  |
                  v
              OS/filesystem
                  |
                  v
                STORAGE
            /      |      \
           v       v       v
        latency   IOPS  throughput`,

      examples: [
        `COLLSCAN can create high storage reads on otherwise healthy disks.`,
        `Cloud-volume IOPS limits can cause latency even when MongoDB queries are efficient.`,
        `Checkpoint and backup activity can temporarily increase write/read pressure.`
      ],

      commands: [
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Determines whether a query is creating unnecessary document or key examinations.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps correlate cache misses and eviction with storage pressure.'
        }
      ],

      productionScenario: `Disk latency rises from 5 ms to 80 ms.

The storage team recommends a larger volume.

The DBA finds a new report performing full scans every 30 seconds.

After the report is indexed and redesigned:

IOPS drops sharply

and latency returns to 6 ms.

The disk was overloaded, but the root cause was database workload inefficiency.`,

      troubleshootingApproach: `1. Record incident time.

2. Check read latency.

3. Check write latency.

4. Check IOPS.

5. Check throughput.

6. Check queue depth if available.

7. Check WiredTiger cache pressure.

8. Check slow queries.

9. Run explain.

10. Check backup/index builds.

11. Check checkpoints.

12. Check replication lag.

13. Check cloud/storage limits.

14. Compare with baseline.

15. Fix unnecessary I/O or scale storage as required.`,

      commonMistakes: [
        'Blaming storage without query analysis.',
        'Looking only at disk utilization percentage.',
        'Ignoring IOPS limits.',
        'Ignoring cache pressure.',
        'Ignoring backups and index builds.'
      ],

      bestPractices: [
        'Correlate MongoDB and storage metrics.',
        'Eliminate unnecessary scans.',
        'Monitor latency, IOPS, and throughput separately.',
        'Know cloud-volume limits.',
        'Maintain baseline disk metrics.'
      ],

      interviewAnswer: `For high disk latency, I determine both whether storage is slow and why MongoDB is generating the I/O. I correlate read/write latency, IOPS, throughput, cache misses, slow queries, explain plans, checkpoints, backups, and replication activity.

If queries are efficient but the storage layer is saturated, I scale storage. If an inefficient query creates excessive reads, I fix the workload first.`,

      keyTakeaways: [
        'Disk latency is a symptom and a resource metric.',
        'Query inefficiency can create storage pressure.',
        'IOPS and throughput differ from latency.',
        'Cache behavior matters.',
        'Use database and OS evidence together.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 7,
    question:
      'What WiredTiger cache metrics should a MongoDB DBA monitor, and how do eviction and cache pressure affect performance?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `WiredTiger uses an internal cache for database pages.

When the cache becomes full or needs space, pages must be evicted.

Eviction is a normal process.

The problem is not:

"eviction exists."

The problem is:

"eviction cannot keep up or consumes excessive resources."`,

      coreConcept: `Cache receives pages
      |
      v
Cache fills
      |
      v
Eviction selects pages
      |
      +--> clean page discard
      |
      +--> dirty page write
      |
      v
space becomes available

Healthy if balanced.
Pressure if workload overwhelms eviction.`,

      detailedExplanation: `A DBA should look at cache behavior as a trend rather than one isolated number.

Important conceptual metrics include:

• bytes currently in cache
• maximum configured cache bytes
• dirty bytes/pages
• pages read into cache
• pages written from cache
• eviction activity
• application threads participating in eviction
• eviction-related waits or pressure indicators.

Exact metric names can vary across MongoDB/WiredTiger versions.

DIRTY DATA

Writes modify pages in cache.

Those dirty pages eventually need to be written to storage.

If dirty data grows too aggressively, checkpoint/eviction pressure can increase.

CACHE MISS

If needed data is not in cache:

MongoDB reads it from disk.

Heavy cache misses can increase read latency.

EVICTION PRESSURE

When eviction cannot free pages fast enough, application threads may contribute to eviction work.

That can increase query latency.

But high eviction counts alone are not necessarily bad.

A busy database naturally evicts pages.

The important questions are:

• Is latency rising?
• Is cache constantly near pressure thresholds?
• Are disk reads increasing?
• Are application threads spending significant effort on eviction?
• Is the working set too large?
• Are queries scanning unnecessary pages?

Do not tune WiredTiger cache size blindly.

Reducing OS memory too much can hurt filesystem caching and system stability.`,

      internalWorking: `Working set > effective cache

     |
     v
frequent cache misses
     |
     v
read new pages
     |
     v
evict old pages
     |
     v
more disk I/O
     |
     v
latency rises`,

      architecture: `            WiredTiger Cache
          +-------------------+
          | clean pages       |
          | dirty pages       |
          | index/data pages  |
          +---------+---------+
                    |
                 eviction
                    |
                    v
                 STORAGE`,

      examples: [
        `High page eviction can be normal under a large active workload.`,
        `Rapidly growing dirty cache plus high write latency deserves investigation.`,
        `A large scan can evict useful hot pages and reduce cache efficiency.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Primary starting point for WiredTiger cache and eviction metrics.'
        }
      ],

      productionScenario: `An analytics query begins scanning hundreds of gigabytes every hour.

API queries previously had high cache hit behavior.

After the scan begins:

• pages read into cache rise sharply
• eviction rises
• storage reads increase
• API latency increases.

The analytics workload is polluting the cache and displacing hot operational data.`,

      troubleshootingApproach: `1. Check cache bytes used.

2. Compare with cache maximum.

3. Check dirty bytes.

4. Check pages read into cache.

5. Check eviction trends.

6. Check application-thread eviction pressure indicators.

7. Check disk reads.

8. Check disk latency.

9. Identify large scans.

10. Identify working-set growth.

11. Fix query/workload issue.

12. Consider memory/capacity changes if justified.`,

      commonMistakes: [
        'Treating any eviction as a problem.',
        'Changing cache size without OS-memory analysis.',
        'Ignoring large scans.',
        'Looking at one snapshot instead of trends.',
        'Ignoring dirty-cache pressure.'
      ],

      bestPractices: [
        'Monitor cache trends over time.',
        'Correlate eviction with latency and disk.',
        'Control unnecessary large scans.',
        'Leave sufficient memory for the OS.',
        'Tune only with workload evidence.'
      ],

      interviewAnswer: `WiredTiger eviction is normal because the cache must continuously make room for useful pages. I monitor cache occupancy, dirty data, pages read, pages written, eviction trends, storage I/O, and any signs that application threads are being pulled heavily into eviction work.

I diagnose pressure from the combined behavior rather than from a high eviction counter alone.`,

      keyTakeaways: [
        'Eviction is normal.',
        'Excessive pressure can hurt latency.',
        'Dirty cache matters for writes.',
        'Large scans can pollute cache.',
        'Cache metrics must be correlated with storage.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 8,
    question:
      'How do connection count and connection-pool behavior affect MongoDB performance, and why is increasing max connections not usually the first solution?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `Applications normally connect to MongoDB using driver connection pools.

A pool keeps reusable connections instead of opening a brand-new network connection for every request.

Too few connections can create application-side waiting.

Too many connections can waste resources and increase pressure.`,

      coreConcept: `Application
    |
connection pool
+---+---+---+
|   |   |   |
v   v   v   v
MongoDB connections

Too small:
requests wait for pool.

Too large:
many sockets/resources/
more concurrent pressure.`,

      detailedExplanation: `MongoDB performance depends on both:

database connection capacity

and:

application pool configuration.

TOO SMALL A POOL

Example:

Application receives:
1,000 concurrent requests.

Pool:
10 connections.

Requests may wait for an available connection even if MongoDB itself is healthy.

TOO LARGE A POOL

Suppose 100 application servers each create:

1,000 connections.

Potential total:

100,000 connections.

This can create:

• socket overhead
• memory overhead
• more simultaneous requests
• TLS overhead
• connection-management overhead
• increased resource contention.

The correct answer is not:

"set every pool to maximum."

Connection pools should reflect:

• application concurrency
• number of application instances
• database capacity
• request duration
• traffic pattern.

Connection storms are also important.

If application servers restart simultaneously and open many new TLS connections at once, MongoDB may see a sudden burst of connection/authentication work.

A DBA should distinguish:

connection count

from:

active database operations.

10,000 mostly idle pooled connections are different from:

10,000 simultaneous expensive queries.

The driver, application, load balancer, and database all participate in the connection architecture.`,

      internalWorking: `100 app servers

Each pool = 500

Potential:
50,000 DB connections

If workload only needs:
5,000 concurrent DB operations

pool design may be excessive.`,

      architecture: `           APPLICATION TIER
       +--------+--------+--------+
       |        |        |        |
       v        v        v        v
      pool     pool     pool     pool
       \        |        |       /
        \       |        |      /
             MongoDB
           connections`,

      examples: [
        `Pool wait time can cause API latency even when MongoDB CPU is low.`,
        `Large pools across many application pods can multiply into huge connection counts.`,
        `Connection storms after deployment can temporarily increase CPU and authentication load.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Shows current, available, total-created, and related connection metrics depending on MongoDB version.'
        }
      ],

      productionScenario: `A Kubernetes deployment scales from:

20 pods

to:

200 pods.

Each pod permits:

500 MongoDB connections.

The database suddenly receives tens of thousands of additional connections even though transaction volume increased only moderately.

The DBA works with the application team to right-size connection pools rather than increasing server connection limits indefinitely.`,

      troubleshootingApproach: `1. Check current connections.

2. Check connection creation rate.

3. Check application instance count.

4. Check pool size per instance.

5. Check pool wait time from driver metrics.

6. Check active operations.

7. Check CPU during connection spikes.

8. Check TLS/authentication cost.

9. Check application restart/deployment events.

10. Right-size pools.

11. Test under peak concurrency.`,

      commonMistakes: [
        'Increasing max connections before understanding pool design.',
        'Ignoring application pod count.',
        'Treating idle and active connections as equivalent.',
        'Opening one connection per request.',
        'Ignoring connection storms.'
      ],

      bestPractices: [
        'Use driver connection pooling.',
        'Right-size pools per application instance.',
        'Monitor total connections and creation rate.',
        'Coordinate pool settings with scaling policy.',
        'Load-test deployment/restart behavior.'
      ],

      interviewAnswer: `MongoDB applications should use driver connection pools. If pools are too small, requests wait for connections. If they are too large across many application instances, the database can receive excessive sockets and concurrency.

I look at pool size per instance, application instance count, driver wait time, current/created connections, and active workload before changing MongoDB connection limits.`,

      keyTakeaways: [
        'Connection pools should be reused.',
        'Too few connections can cause waits.',
        'Too many can create unnecessary pressure.',
        'Application scaling multiplies pool size.',
        'Connection limits are not the first tuning knob.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 9,
    question:
      'How should a MongoDB DBA use serverStatus() during performance troubleshooting, and what are the major metric groups worth correlating?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `serverStatus() provides a broad snapshot of MongoDB server activity and internal metrics.

It is one of the most useful starting points for performance analysis.

But one serverStatus output by itself has limited value.

Performance analysis usually requires comparing metrics over time.`,

      coreConcept: `serverStatus()

contains metrics for:

• connections
• opcounters
• WiredTiger
• network
• locks
• transactions
• memory
• queues/tickets/version-specific internals
• replication-related state

Best use:
sample over time
and correlate.`,

      detailedExplanation: `Some important areas include:

OPCOUNTERS

Shows counts of database operations.

Useful for workload volume trends.

CONNECTIONS

Shows connection usage and creation behavior.

NETWORK

Helps measure database network traffic.

MEMORY

Provides process memory information.

WIREDTIGER CACHE

Critical for:

• cache occupancy
• dirty data
• page reads/writes
• eviction.

WIREDTIGER TRANSACTIONS / CONCURRENCY METRICS

Can help identify transaction or storage-engine pressure depending on version.

LOCKS

MongoDB uses fine-grained concurrency mechanisms, but lock metrics can still help identify contention patterns.

GLOBAL/QUEUE-TYPE METRICS

Exact fields evolve by version.

Use the metrics available in the deployed release rather than memorizing one fixed field list.

ASSERTS/EXTRA INFO

Can occasionally provide useful health context.

UPTIME

Important when interpreting counters.

Example:

10 billion operations

means very little unless you know:

over one hour?

or:

over six months?

COUNTERS ARE CUMULATIVE

Many serverStatus metrics increase since process startup.

To calculate rates:

Sample 1 at time T1

Sample 2 at time T2

Difference / elapsed seconds

gives a rate.

This is why Prometheus/Ops Manager/Atlas monitoring is much more useful than manually looking at one snapshot.`,

      internalWorking: `T1:

opcounters.query = 1,000,000

60 seconds later:

T2:
1,060,000

Rate:
60,000 / 60
= 1,000 queries/sec`,

      architecture: `             serverStatus()
                   |
        +----------+----------+
        |          |          |
        v          v          v
     workload     cache     connections
        |          |          |
        +----------+----------+
                   |
                   v
             time-series
              monitoring
                   |
                   v
             correlation`,

      examples: [
        `Use deltas to calculate operations per second.`,
        `Correlate cache reads with disk latency.`,
        `Correlate connection creation with application deployments.`
      ],

      commands: [
        {
          command:
            'db.serverStatus()',
          explanation:
            'Returns broad server-level metrics.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Focuses on WiredTiger cache metrics.'
        },
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Focuses on connection metrics.'
        },
        {
          command:
            'db.serverStatus().opcounters',
          explanation:
            'Shows cumulative operation counters.'
        }
      ],

      productionScenario: `An API slows down between:

14:00–14:20.

A DBA runs serverStatus only at:

15:00.

Everything looks normal.

The useful data was the change during the incident window.

The team enables time-series monitoring of:

• opcounters
• cache
• disk
• CPU
• connections.

The next incident can be correlated precisely.`,

      troubleshootingApproach: `1. Record uptime.

2. Capture relevant serverStatus metrics.

3. Prefer time-series monitoring.

4. Calculate rates from counters.

5. Correlate operations/sec.

6. Correlate cache metrics.

7. Correlate connections.

8. Correlate network.

9. Correlate lock/contention metrics.

10. Compare with OS CPU/disk.

11. Compare with application latency.

12. Compare with baseline.`,

      commonMistakes: [
        'Using one serverStatus snapshot as complete diagnosis.',
        'Treating cumulative counters as rates.',
        'Ignoring uptime.',
        'Memorizing field names without version awareness.',
        'Ignoring OS and application metrics.'
      ],

      bestPractices: [
        'Collect serverStatus continuously.',
        'Convert counters to rates.',
        'Correlate multiple metric groups.',
        'Use monitoring platforms for trends.',
        'Compare incident periods with baseline.'
      ],

      interviewAnswer: `serverStatus() is a broad MongoDB metrics snapshot. I use it to examine workload counters, connections, network, memory, WiredTiger cache, transaction/storage metrics, locks, and other version-specific indicators.

Many counters are cumulative, so I compare samples over time or use monitoring systems to calculate rates and correlate them with CPU, disk, replication, and application latency.`,

      keyTakeaways: [
        'serverStatus is a starting point.',
        'Time series are more useful than snapshots.',
        'Many counters are cumulative.',
        'Rates require deltas.',
        'Cross-layer correlation is essential.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 10,
    question:
      'How would you establish a MongoDB production performance baseline so that future CPU, memory, disk, latency, and throughput incidents can be diagnosed quickly?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A baseline describes what "normal" looks like.

Without a baseline, a DBA may see:

CPU = 70%

and not know whether that is:

normal

or:

a major anomaly.`,

      coreConcept: `Collect normal behavior for:

• quiet period
• normal business hours
• peak period
• batch window
• backup window

Then future incident metrics
can be compared against them.`,

      detailedExplanation: `A useful MongoDB baseline includes several layers.

APPLICATION

• average latency
• p95/p99 latency
• requests/sec
• error rate.

MONGODB WORKLOAD

• reads/sec
• writes/sec
• commands/sec
• transactions where applicable
• slow-query rate.

QUERY EFFICIENCY

For critical queries record:

• execution time
• keys examined
• docs examined
• returned documents
• query plan shape.

CPU

Record:

• normal
• peak
• batch-window CPU.

MEMORY

Record:

• process memory
• available RAM
• swap
• cache usage
• eviction behavior.

STORAGE

Record:

• read latency
• write latency
• IOPS
• throughput
• disk utilization
• growth rate.

REPLICATION

Record:

• normal lag
• oplog window
• election frequency
• replication state.

CONNECTIONS

Record:

• current
• peak
• creation rate.

NETWORK

Record:

• ingress/egress
• normal throughput
• cross-zone/region behavior.

MAINTENANCE WINDOWS

Backups, index builds, TTL activity, batch jobs, and balancing can create predictable patterns.

A baseline should therefore distinguish:

normal workload

from:

scheduled workload.

Example:

Disk latency of 20 ms might be abnormal during business hours but normal during a scheduled backup if application SLA is unaffected.

The best baseline is stored as time-series history, not a spreadsheet updated once a year.`,

      internalWorking: `Normal:

09:00
CPU 40%
Latency 15 ms
Disk 5 ms
5k ops/sec

Peak:

12:00
CPU 70%
Latency 30 ms
Disk 8 ms
12k ops/sec

Incident:

12:00
CPU 95%
Latency 400 ms
Disk 90 ms
8k ops/sec

Baseline reveals anomaly quickly.`,

      architecture: `             MONITORING SYSTEM
                    |
       +------------+------------+
       |            |            |
       v            v            v
    MongoDB        OS       Application
       |            |            |
       +------------+------------+
                    |
                    v
              historical baseline
                    |
                    v
              incident comparison`,

      examples: [
        `Track p95/p99 latency, not only averages.`,
        `Record disk metrics during normal and backup periods.`,
        `Record query-plan performance for critical APIs.`
      ],

      commands: [
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides many of the server metrics needed for baseline collection.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Provides replica-set health and member-state information.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Provides oplog-window information useful in replication baselines.'
        }
      ],

      productionScenario: `At 19:00, CPU reaches:

78%.

An alert declares a critical incident.

Historical baseline shows:

every day from 18:45–19:20

a scheduled batch drives CPU to:

75–80%

with:

normal API latency
normal disk latency
no replication lag.

The metric is expected behavior.

Later CPU reaches 78% at 11:00 with a large latency spike.

Because the DBA has a baseline, the second event is immediately recognized as abnormal.`,

      troubleshootingApproach: `1. Identify critical business periods.

2. Collect application latency.

3. Collect throughput.

4. Collect CPU.

5. Collect memory.

6. Collect cache/eviction.

7. Collect disk latency/IOPS.

8. Collect network.

9. Collect connections.

10. Collect replication lag.

11. Record maintenance windows.

12. Record query-plan baselines.

13. Retain time-series history.

14. Define warning/critical thresholds from actual behavior.

15. Review baseline after major workload changes.`,

      commonMistakes: [
        'Setting thresholds without historical data.',
        'Using only average latency.',
        'Ignoring maintenance windows.',
        'Keeping no query-plan baseline.',
        'Failing to update baselines after growth.'
      ],

      bestPractices: [
        'Use time-series monitoring.',
        'Capture peak and normal periods.',
        'Include application metrics.',
        'Track p95/p99 latency.',
        'Review thresholds periodically.'
      ],

      interviewAnswer: `I establish a MongoDB baseline across application latency, operations per second, critical query plans, CPU, memory, WiredTiger cache, disk latency and throughput, network, connections, replication lag, and oplog window.

I record normal, peak, backup, and batch periods so incident values can be compared with known behavior. This makes performance troubleshooting much faster and helps create meaningful alert thresholds.`,

      keyTakeaways: [
        'A baseline defines normal behavior.',
        'Peak and maintenance periods should be included.',
        'Application and database metrics must be correlated.',
        'Tail latency matters.',
        'Baselines should evolve with the workload.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 11,
    question:
      'A MongoDB query that normally completes in milliseconds suddenly starts taking several seconds. How would you investigate whether the problem is query-plan regression, data growth, cache pressure, or storage latency?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A query can become slow even if the query text did not change.

Possible reasons include:

• different query plan
• collection/index growth
• changed data distribution
• cache misses
• disk latency
• increased concurrency
• application parameter changes.

The DBA should compare the slow execution with a known-good execution rather than guessing.`,

      coreConcept: `Slow query
   |
   v
Compare with baseline
   |
   +--> plan changed?
   +--> docs/keys examined changed?
   +--> data distribution changed?
   +--> cache misses?
   +--> disk latency?
   +--> concurrency?
   |
   v
root cause`,

      detailedExplanation: `A structured investigation should separate logical query efficiency from resource pressure.

STEP 1 — CAPTURE EXACT QUERY SHAPE

Do not troubleshoot a paraphrased query.

Capture:

• filter
• sort
• projection
• collation
• hint if any
• aggregation pipeline if applicable.

STEP 2 — RUN EXPLAIN

Compare:

• winning plan
• IXSCAN vs COLLSCAN
• index selected
• totalKeysExamined
• totalDocsExamined
• nReturned
• executionTimeMillis.

STEP 3 — CHECK WHETHER THE PLAN CHANGED

A different plan may be selected because:

• statistics/estimation behavior
• new index
• changed selectivity
• query shape changes
• plan cache behavior.

STEP 4 — CHECK DATA GROWTH

The same plan can become more expensive if:

• collection grew dramatically
• matching cardinality increased
• an indexed predicate became less selective.

STEP 5 — CHECK CACHE

If the working set was previously hot but is now cold or displaced, the same query may require more storage reads.

STEP 6 — CHECK DISK

High disk latency can make a good plan slow.

STEP 7 — CHECK CONCURRENCY

The query may execute efficiently but wait behind other work.

STEP 8 — CHECK APPLICATION CHANGES

Parameter changes can alter selectivity.

Example:

Previously:
tenantId + status

Now:
status only

The route may look similar at application level but produce a much larger scan.

The DBA should build one evidence chain:

query shape
→ plan
→ work performed
→ resource behavior
→ latency.`,

      internalWorking: `Same query text

Before:
IXSCAN
1,000 keys
100 docs
5 ms

After:
IXSCAN
5,000,000 keys
1,000,000 docs
4 sec

Plan may be same,
but data distribution changed.`,

      architecture: `             APPLICATION QUERY
                    |
                    v
                QUERY PLAN
                    |
         +----------+----------+
         |          |          |
         v          v          v
       index      cache      storage
         |          |          |
         +----------+----------+
                    |
                    v
                 latency`,

      examples: [
        `A previously selective status value may become common as data distribution changes.`,
        `The same IXSCAN can become expensive if millions of keys must be examined.`,
        `A good query plan can still be slow when storage latency spikes.`
      ],

      commands: [
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Provides the execution plan and work performed by the query.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps correlate query slowdown with cache pressure.'
        }
      ],

      productionScenario: `A query normally returns in 20 ms.

It suddenly takes 4 seconds.

Explain still shows IXSCAN, so the team initially assumes the index is healthy.

The DBA compares execution statistics and finds:

Before:
2,000 keys examined

Now:
4 million keys examined.

A formerly selective field has become highly common because application data changed.

The problem is selectivity, not index existence.`,

      troubleshootingApproach: `1. Capture exact query.

2. Capture slow-query timestamp.

3. Run explain.

4. Compare winning plan with baseline.

5. Compare totalKeysExamined.

6. Compare totalDocsExamined.

7. Compare nReturned.

8. Check index definitions.

9. Check data growth/selectivity.

10. Check cache pressure.

11. Check disk latency.

12. Check concurrent workload.

13. Check recent deployment/query changes.

14. Apply targeted fix.

15. Validate improvement.`,

      commonMistakes: [
        'Assuming IXSCAN means the query is efficient.',
        'Looking only at executionTimeMillis.',
        'Ignoring selectivity changes.',
        'Ignoring cache and disk behavior.',
        'Changing indexes without comparing the old and new plan.'
      ],

      bestPractices: [
        'Keep explain baselines for critical queries.',
        'Track keys/docs examined ratios.',
        'Monitor data-distribution changes.',
        'Correlate query plans with system metrics.',
        'Revalidate critical queries as data grows.'
      ],

      interviewAnswer: `For a sudden query slowdown, I compare the exact query shape and explain execution statistics with a known-good baseline. I check whether the winning plan changed, whether keys/documents examined increased, whether selectivity changed, and whether cache, storage latency, or concurrency changed.

An IXSCAN alone does not prove efficiency; I focus on how much work the plan actually performs.`,

      keyTakeaways: [
        'Query text can remain unchanged while cost changes.',
        'IXSCAN is not automatically efficient.',
        'Selectivity can degrade over time.',
        'Cache and disk affect good plans too.',
        'Baseline comparison is critical.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 12,
    question:
      'CPU is consistently above 90% on mongod, but no single slow query is obvious. How would you troubleshoot a high-CPU production incident at L3 level?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `High CPU does not always come from one spectacularly slow query.

It can come from:

• many individually fast queries
• increased throughput
• aggregation workload
• index maintenance
• compression
• connection churn
• replication
• background activity.

The DBA must analyze total CPU demand.`,

      coreConcept: `CPU 90%+
   |
   v
No obvious slow query
   |
   +--> many fast queries?
   +--> throughput spike?
   +--> aggregation?
   +--> index build?
   +--> write/index maintenance?
   +--> connection churn?
   +--> replication/background work?
   |
   v
identify aggregate CPU consumer`,

      detailedExplanation: `A slow-query log may not reveal the issue when thousands of queries each complete in 10–20 ms but collectively consume all CPUs.

The DBA should evaluate:

1. WORKLOAD RATE

Compare current operations/sec with baseline.

2. QUERY SHAPES

Identify high-frequency shapes, not only highest-latency shapes.

A query taking 10 ms:

100,000 times/sec

can consume more CPU than a 2-second query run once per minute.

3. AGGREGATIONS

Look for CPU-intensive:

• grouping
• expressions
• projections
• sorting
• regex
• transformations.

4. WRITES

Heavy inserts/updates require:

• document changes
• index maintenance
• journaling/storage work
• replication.

5. INDEX BUILDS

Check recent maintenance or deployment changes.

6. CONNECTION CHURN

Large numbers of new connections, authentication, and TLS handshakes can consume CPU.

7. REPLICATION

Secondaries can consume CPU applying heavy oplog traffic.

8. COMPRESSION/ENCRYPTION

These trade storage/network efficiency for CPU.

9. OS CONTEXT

Determine:

• user CPU
• system CPU
• steal time in virtual environments
• other processes.

A strong investigation distinguishes:

CPU used by valuable business throughput

from:

CPU wasted by inefficient execution.`,

      internalWorking: `Query A:
10 ms
100,000/sec

Query B:
2 sec
1/min

Slow log highlights B.

But A may consume far more total CPU.`,

      architecture: `                 CPU
                    |
      +-------------+-------------+
      |             |             |
      v             v             v
 high-rate       expensive     background
 queries         pipelines        work
      |             |             |
      +-------------+-------------+
                    |
                    v
               saturation`,

      examples: [
        `High-frequency small queries can saturate CPU without appearing in slow-query logs.`,
        `A sudden connection storm can create high CPU with normal query plans.`,
        `Large write growth increases both database and replication CPU.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().opcounters',
          explanation:
            'Helps determine whether operation volume increased.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Shows currently active operations that may reveal aggregate workload patterns.'
        },
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Useful when investigating connection churn or growth.'
        }
      ],

      productionScenario: `CPU stays at 95%.

Slow-query logs contain nothing alarming.

Operations/sec analysis shows API traffic increased from:

8,000/sec

to:

28,000/sec

after a retry bug was introduced.

Each query remains individually fast.

The root cause is workload amplification, not a single slow query.`,

      troubleshootingApproach: `1. Confirm CPU timeline.

2. Compare operations/sec with baseline.

3. Identify top-frequency query shapes.

4. Review aggregations.

5. Review write rate.

6. Check index builds.

7. Check connection creation rate.

8. Check authentication/TLS churn.

9. Check replication workload.

10. Check backup/compression work.

11. Check OS user/system CPU.

12. Check other processes.

13. Identify legitimate versus wasteful demand.

14. Fix source or scale capacity.

15. Measure after change.`,

      commonMistakes: [
        'Looking only for one slow query.',
        'Ignoring high-frequency fast queries.',
        'Ignoring connection storms.',
        'Ignoring throughput growth.',
        'Adding CPUs before understanding workload amplification.'
      ],

      bestPractices: [
        'Track query frequency as well as latency.',
        'Correlate CPU with ops/sec.',
        'Monitor connection creation.',
        'Separate user workload from maintenance.',
        'Scale only after efficiency analysis.'
      ],

      interviewAnswer: `If CPU is above 90% but there is no obvious slow query, I analyze aggregate workload. I compare operations per second with baseline, identify the most frequent query shapes, review aggregation, writes, index maintenance, connection churn, TLS/authentication, replication, and background work.

Many individually fast operations can saturate CPU, so slow-query logs alone are insufficient.`,

      keyTakeaways: [
        'CPU can be saturated by aggregate workload.',
        'Query frequency matters.',
        'Slow logs do not show every CPU consumer.',
        'Connection and background work matter.',
        'Throughput comparison is essential.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 13,
    question:
      'What is WiredTiger cache thrashing, how would you recognize it, and what root causes should you investigate before increasing RAM?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `Cache thrashing occurs when the active workload repeatedly brings pages into cache only for other useful pages to be evicted soon afterward.

The cache cannot retain the useful working set effectively.

This can create repeated disk reads and high eviction pressure.`,

      coreConcept: `Need page A
load A

Need B
load B

Need C
evict A

Need A again
read A from disk again

Repeated cycle
=
cache thrashing`,

      detailedExplanation: `Cache thrashing usually appears when:

working set

is significantly larger than the useful memory available,

or when a disruptive workload scans large amounts of cold data.

Indicators may include:

• rapid pages read into cache
• high eviction activity
• increasing disk reads
• elevated disk latency
• application latency
• low reuse of cached pages
• application threads increasingly involved in eviction.

Common root causes include:

1. WORKING SET GROWTH

The active dataset simply outgrew available memory.

2. LARGE COLLECTION SCANS

A reporting or maintenance query reads huge volumes and displaces hot pages.

3. BAD INDEXING

Queries examine unnecessary data.

4. LARGE INDEX FOOTPRINT

Too many or oversized indexes compete for memory.

5. RANDOM ACCESS WORKLOAD

Poor locality can prevent useful caching.

6. MULTIPLE WORKLOAD TYPES

Operational API and analytics workload compete for the same cache.

Increasing RAM can help when the workload is legitimate and well-designed.

But if a bad query scans terabytes unnecessarily, adding RAM may only delay the same problem.

The DBA should identify:

why so many pages are entering cache

before sizing additional memory.`,

      internalWorking: `Hot API pages
     |
     v
cache

Large analytics scan
     |
     v
fills cache
     |
     v
evicts hot pages
     |
     v
API requests reread from disk
     |
     v
latency`,

      architecture: `           WIREDTIGER CACHE
          +------------------+
          | hot API pages    |
          +------------------+
                    ^
                    |
            large cold scan
                    |
                    v
              page turnover
                    |
                    v
               disk reads`,

      examples: [
        `A full historical scan can evict frequently accessed recent records.`,
        `Bad indexes can cause artificial working-set growth.`,
        `More RAM helps only if the underlying workload is sensible.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides cache activity and eviction metrics relevant to thrashing analysis.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help identify large scans currently active.'
        }
      ],

      productionScenario: `A reporting job starts at 01:00.

It scans 600 GB of historical data.

Immediately afterward:

• cache page reads spike
• eviction increases
• disk read latency rises
• latency of small API lookups increases.

The DBA isolates the reporting workload and optimizes its access pattern instead of simply enlarging RAM.`,

      troubleshootingApproach: `1. Check cache page-read trend.

2. Check eviction trend.

3. Check dirty cache.

4. Check disk read volume.

5. Check disk latency.

6. Identify large scans.

7. Identify working-set changes.

8. Review index efficiency.

9. Review analytical workloads.

10. Review index footprint.

11. Separate workloads if justified.

12. Increase RAM only if measured need remains.`,

      commonMistakes: [
        'Calling every eviction event thrashing.',
        'Adding RAM before identifying scan sources.',
        'Ignoring large reporting jobs.',
        'Ignoring index footprint.',
        'Looking only at cache percentage.'
      ],

      bestPractices: [
        'Correlate cache turnover with disk reads.',
        'Control disruptive scans.',
        'Optimize index access.',
        'Separate analytical workloads where appropriate.',
        'Use measured working-set pressure for memory sizing.'
      ],

      interviewAnswer: `WiredTiger cache thrashing is repeated page churn where useful pages are evicted and then soon reread from disk. I look for high page-read and eviction activity correlated with increased storage reads and latency.

Before adding RAM, I investigate working-set growth, large scans, poor indexes, oversized index footprint, random access patterns, and competing analytics workloads.`,

      keyTakeaways: [
        'Thrashing means low cache reuse.',
        'Large scans are a common cause.',
        'Disk reads rise when hot pages are displaced.',
        'Bad indexes can enlarge the effective working set.',
        'RAM should be added only after workload analysis.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 14,
    question:
      'How would you troubleshoot MongoDB write latency caused by storage saturation, checkpoints, journaling, replication, or index-maintenance overhead?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `A write has several possible costs.

Depending on configuration and write concern, it may involve:

• updating documents
• updating indexes
• storage-engine work
• journaling
• replication
• waiting for acknowledgements.

High write latency therefore requires layered analysis.`,

      coreConcept: `Application write
      |
      v
document change
      |
      +--> index updates
      |
      +--> WiredTiger/cache
      |
      +--> journal/storage
      |
      +--> replication
      |
      v
writeConcern acknowledgement`,

      detailedExplanation: `The DBA should separate local write execution from acknowledgement delay.

1. DOCUMENT UPDATE COST

Large documents or complex updates may consume CPU and storage.

2. INDEX MAINTENANCE

Every relevant secondary index may need updates.

A write-heavy collection with many indexes can be expensive.

3. WIREDTIGER DIRTY CACHE

High dirty-data pressure can increase eviction/checkpoint work.

4. CHECKPOINTS

Checkpoints are normal, but storage that cannot keep up with sustained dirty-page writeback can experience latency.

Do not treat checkpoint existence as a bug.

5. JOURNALING

Durability requires journal-related storage work.

Exact acknowledgement behavior depends on write concern and journaling configuration/version.

6. STORAGE SATURATION

High write latency, queue depth, or exhausted cloud-storage throughput can directly affect database writes.

7. REPLICATION

For majority write concern, acknowledgement may depend on replication progress to the required majority.

A slow Secondary/network path can therefore increase majority-write latency.

8. FLOW CONTROL

MongoDB can regulate Primary write throughput when replication lag threatens to grow too much, depending on configuration/version.

9. APPLICATION CONCURRENCY

High concurrent write pressure can saturate CPU or storage even when individual writes are efficient.

The DBA should compare:

local/simple acknowledgement latency

with:

majority acknowledgement latency

where safe and appropriate in a controlled diagnostic context.

This can help separate Primary-local execution from replication acknowledgement delay.`,

      internalWorking: `Write latency

       |
 +-----+-----+
 |           |
 v           v
local      replication/
cost       acknowledgement
 |           |
 v           v
indexes    Secondary lag
storage    network
cache      majority`,

      architecture: `               PRIMARY
                  |
          +-------+-------+
          |               |
          v               v
       local write      replication
          |               |
     indexes/cache       Secondary
     journal/storage       |
          |                |
          +-------+--------+
                  |
                  v
            acknowledgement`,

      examples: [
        `Too many secondary indexes increase write amplification.`,
        `Majority writes can slow when required replica acknowledgements are delayed.`,
        `Checkpoint-related storage pressure usually points back to sustained write volume or storage capacity.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps inspect dirty data, page writes, and cache pressure.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Useful when majority-write latency may be related to replica lag.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Useful for evaluating index-maintenance overhead on write-heavy collections.'
        }
      ],

      productionScenario: `Write latency increases from:

15 ms

to:

250 ms.

CPU is normal.

The Primary's disk latency is moderately high, but Secondary lag also jumps.

The application uses majority writes.

The DBA finds one Secondary in the acknowledgement majority has severe storage latency.

Majority acknowledgement is therefore delayed.

The issue is not just the Primary's local write path.`,

      troubleshootingApproach: `1. Record write-latency timeline.

2. Check write rate.

3. Check document/update patterns.

4. Count indexes.

5. Check dirty cache.

6. Check checkpoint-related pressure.

7. Check journal/storage latency.

8. Check disk IOPS/throughput.

9. Check replication lag.

10. Check network latency.

11. Check majority-write behavior.

12. Check flow-control indicators where available.

13. Compare with baseline.

14. Fix the constrained layer.

15. Revalidate latency.`,

      commonMistakes: [
        'Blaming checkpoints simply because they are visible.',
        'Ignoring index write amplification.',
        'Checking only Primary disk.',
        'Ignoring write concern.',
        'Disabling durability or flow control as a first response.'
      ],

      bestPractices: [
        'Separate local write cost from acknowledgement cost.',
        'Keep indexes intentional.',
        'Monitor dirty cache and storage.',
        'Monitor replication for majority workloads.',
        'Preserve durability unless a deliberate business decision changes it.'
      ],

      interviewAnswer: `For high write latency I trace the write path from document modification through index maintenance, WiredTiger dirty-cache behavior, journaling/storage, replication, and writeConcern acknowledgement.

If local writes are healthy but majority writes are slow, I focus on replica lag and network/storage on the acknowledging members. I avoid blaming checkpoints or disabling durability without proving the bottleneck.`,

      keyTakeaways: [
        'Write latency has multiple layers.',
        'Indexes amplify writes.',
        'Storage and dirty-cache pressure matter.',
        'Majority acknowledgement depends on replication.',
        'Checkpoint activity must be interpreted in context.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 15,
    question:
      'How would you troubleshoot a MongoDB connection storm after an application deployment or mass restart?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `A connection storm occurs when many clients attempt to establish database connections over a short period.

This can happen after:

• application restart
• Kubernetes rollout
• autoscaling event
• network recovery
• database failover.

Even if normal steady-state connection count is healthy, the creation burst can create significant temporary pressure.`,

      coreConcept: `200 app pods restart
       |
       v
all open pools
       |
       v
thousands of new TCP/TLS/auth
connections simultaneously
       |
       v
CPU/network/authentication pressure
       |
       v
latency/errors`,

      detailedExplanation: `Connection establishment can involve:

• TCP setup
• TLS handshake
• authentication
• driver topology discovery
• connection pool warm-up.

If hundreds of application instances start simultaneously, these operations can create a burst.

Important metrics include:

• current connections
• total connections created
• connection creation rate
• CPU
• network
• authentication failures
• TLS handshake load
• application pool wait time.

The root cause may be application deployment behavior.

Examples:

• every pod opens maximum pool size immediately
• retry loops reconnect aggressively
• no backoff/jitter
• load balancer resets connections
• application closes and recreates pools repeatedly.

The DBA should work with developers rather than simply increasing connection limits.

Possible improvements include:

• smaller or more appropriate pool sizes
• gradual pool warm-up
• deployment staggering
• exponential backoff
• jitter
• connection reuse
• avoiding unnecessary client creation per request.

A server with a high connection limit can still become CPU-bound by creating connections too quickly.`,

      internalWorking: `Normal:

100 pods
50 connections each
steady state

Deployment:

100 pods restart together
       |
       v
5,000 connections attempted
within seconds

Creation rate,
not only final count,
becomes important.`,

      architecture: `            APPLICATION PODS
        +------+------+------+
        |      |      |      |
        v      v      v      v
       TLS    TLS    TLS    TLS
        \      |      |      /
         \     |      |     /
              MongoDB
                |
                v
           CPU / network
             pressure`,

      examples: [
        `A stable 10,000 connections can be less disruptive than 10,000 new connections created in 10 seconds.`,
        `Kubernetes rolling deployment strategy can influence connection pressure.`,
        `Retry storms can amplify a temporary MongoDB failure.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Provides current and connection-creation metrics depending on MongoDB version.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can provide context on active operations during the storm.'
        }
      ],

      productionScenario: `A new application release restarts 300 pods.

Every pod immediately creates a pool of 200 connections.

MongoDB sees a massive burst of TCP/TLS/authentication work.

CPU spikes and clients begin timing out.

Retry loops create even more connections.

The DBA and application team reduce pool size, add jitter/backoff, and stagger rollout behavior.`,

      troubleshootingApproach: `1. Record deployment/restart time.

2. Check current connections.

3. Check connection creation rate.

4. Check application pod count.

5. Check pool configuration.

6. Check CPU.

7. Check network.

8. Check authentication failures.

9. Check TLS-related resource use.

10. Check client retry behavior.

11. Check connection reuse.

12. Stagger startup.

13. Right-size pools.

14. Retest mass restart scenario.`,

      commonMistakes: [
        'Increasing server connection limit immediately.',
        'Ignoring total application instance count.',
        'Ignoring connection creation rate.',
        'Allowing retry loops without backoff.',
        'Creating MongoClient repeatedly in application code.'
      ],

      bestPractices: [
        'Reuse long-lived driver clients.',
        'Right-size connection pools.',
        'Use backoff and jitter.',
        'Stagger deployments where practical.',
        'Load-test connection recovery scenarios.'
      ],

      interviewAnswer: `For a connection storm I correlate the event with deployments or infrastructure recovery and inspect current connections, connection creation rate, CPU, network, TLS/authentication load, and application pool settings.

The fix is usually coordinated with the application: reuse clients, right-size pools, stagger startups, and use backoff/jitter instead of simply increasing MongoDB's connection limit.`,

      keyTakeaways: [
        'Connection creation rate matters.',
        'Mass restarts can overload MongoDB temporarily.',
        'Pool configuration multiplies across application instances.',
        'Retry behavior can amplify incidents.',
        'Application and DBA teams must solve connection storms together.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 16,
    question:
      'MongoDB read latency suddenly increases while CPU remains moderate and query plans still use indexes. How would you isolate cache, disk, network, and concurrency causes?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `A correct index does not guarantee low read latency.

If the query needs pages that are not in memory, it may wait on storage.

If requests queue behind other work, latency can rise without CPU reaching 100%.

Network can also add delay.

The DBA must trace the whole read path.`,

      coreConcept: `Indexed read
   |
   v
page in cache?
   |
 +--+--+
 |     |
YES    NO
 |      |
fast   storage
       |
       v
   disk latency

Also:
network + queueing
can add delay.`,

      detailedExplanation: `A structured L3 investigation should test four major layers.

1. QUERY EXECUTION

Verify the plan is still efficient.

Check:

• totalKeysExamined
• totalDocsExamined
• nReturned
• sort behavior.

2. CACHE

Check whether:

• pages read into cache increased
• eviction increased
• working set changed
• analytical scans displaced hot data.

3. STORAGE

Check:

• read latency
• IOPS
• throughput
• queueing
• cloud volume limits.

A good index can still require random storage reads if useful pages are not cached.

4. NETWORK

Check:

• application-to-MongoDB latency
• cross-AZ/region paths
• packet loss
• bandwidth saturation.

5. CONCURRENCY

Moderate CPU does not mean no waiting.

Storage or connection pools may queue requests.

6. REPLICATION/READ PREFERENCE

If applications read from Secondaries, check whether one Secondary is overloaded or geographically distant.

7. DISTRIBUTED QUERY

In sharded environments, one slow shard can dominate response time.

The DBA should compare:

server-side execution time

with:

application-observed latency.

If MongoDB reports 20 ms but application sees 500 ms, investigate network, pool wait, or application layers.`,

      internalWorking: `App latency:
500 ms

MongoDB execution:
30 ms

Remaining:
470 ms

Possible:
pool wait
network
application processing

Do not blame MongoDB execution alone.`,

      architecture: `             APPLICATION
                  |
             pool/network
                  |
                  v
               MONGODB
                  |
            query execution
                  |
             cache lookup
              /      \
             v        v
           memory    disk
                     |
                     v
                  latency`,

      examples: [
        `An indexed lookup can become slow after cache eviction.`,
        `A slow Secondary selected by read preference can increase read latency.`,
        `Application latency can exceed MongoDB execution time because of pool or network waiting.`
      ],

      commands: [
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Confirms actual query execution work.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps detect increased cache misses and eviction.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Useful when reads may be routed to replica-set members with differing health or latency.'
        }
      ],

      productionScenario: `API read latency rises from:

30 ms

to:

350 ms.

Queries still use the expected indexes.

CPU is only 55%.

The DBA finds an analytics scan started earlier and displaced much of the hot working set.

Disk reads increase sharply and storage latency rises.

The root cause is cache disruption and storage dependence, not query-plan regression.`,

      troubleshootingApproach: `1. Compare application and DB execution latency.

2. Validate explain.

3. Check keys/docs examined.

4. Check cache page reads.

5. Check eviction.

6. Check disk read latency.

7. Check IOPS/throughput.

8. Check network latency.

9. Check packet loss.

10. Check connection-pool waits.

11. Check read preference.

12. Compare replica members.

13. Check sharded fan-out if applicable.

14. Correct constrained layer.

15. Validate end-to-end latency.`,

      commonMistakes: [
        'Assuming indexed means memory-resident.',
        'Ignoring application pool wait time.',
        'Ignoring network.',
        'Looking only at CPU.',
        'Ignoring which replica member served the read.'
      ],

      bestPractices: [
        'Measure end-to-end and server-side latency separately.',
        'Correlate cache and storage.',
        'Monitor replica member performance individually.',
        'Track connection-pool metrics.',
        'Prevent disruptive analytical scans on critical workloads.'
      ],

      interviewAnswer: `For rising read latency with moderate CPU and good indexes, I trace the full path. I compare application latency with MongoDB execution time, then inspect cache misses, eviction, disk read latency, IOPS, network, connection-pool waits, read preference, and replica member performance.

A query can use the correct index and still be slow if its pages must be fetched from slow storage or if it waits elsewhere in the request path.`,

      keyTakeaways: [
        'Indexed reads can still hit disk.',
        'CPU is only one resource.',
        'Network and pool waits matter.',
        'Replica choice can affect latency.',
        'End-to-end timing should be decomposed.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 17,
    question:
      'A production deployment causes a sudden MongoDB performance regression. How would you compare before-and-after behavior and prove whether the application release caused the issue?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `A performance regression after a deployment should be treated as a timeline and comparison problem.

The fact that:

deployment happened

and:

MongoDB became slow

at similar times is strong evidence, but the DBA should still prove the causal mechanism.`,

      coreConcept: `Before deploy
   |
   v
baseline

Deployment
   |
   v
After deploy

Compare:
• traffic
• query shapes
• plans
• connections
• writes
• latency
• CPU/cache/disk`,

      detailedExplanation: `The DBA should first lock down the timeline.

Example:

13:00 deployment starts

13:07 new pods healthy

13:10 CPU rises

13:11 disk reads increase

13:12 API latency increases.

Then compare before and after.

APPLICATION LEVEL

• requests/sec
• retries
• new endpoints
• changed parameters
• connection pools.

QUERY LEVEL

• new query shapes
• frequency changes
• explain plans
• scanned keys/docs.

WRITE LEVEL

• document size
• update patterns
• additional indexes affected
• bulk operations.

CONNECTION LEVEL

• new client count
• pool size
• connection creation rate.

RESOURCE LEVEL

• CPU
• cache
• disk
• network.

A rollback can be a powerful diagnostic if safe and approved.

If rollback causes:

query volume returns to normal
→ disk pressure falls
→ latency recovers,

that strengthens causality.

But sometimes a deployment coincides with another event such as:

• storage degradation
• backup
• batch job
• traffic spike.

Therefore the RCA should describe the actual mechanism, not just temporal correlation.`,

      internalWorking: `Deployment
   |
   v
new query shape
   |
   v
COLLSCAN
   |
   v
disk reads
   |
   v
cache pressure
   |
   v
latency

This proves mechanism.`,

      architecture: `         BEFORE               AFTER
           |                    |
      known baseline         deployment
           |                    |
           v                    v
       MongoDB A            MongoDB B
           \                    /
            \                  /
              compare metrics
                    |
                    v
                causal chain`,

      examples: [
        `A release may increase query frequency without changing query text.`,
        `A pool configuration change can create connection pressure.`,
        `A new endpoint can introduce large scans even when total traffic is unchanged.`
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Useful for capturing active workload after a deployment.'
        },
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Compares execution behavior of newly introduced or changed query shapes.'
        }
      ],

      productionScenario: `At 15:00 an application release is deployed.

By 15:05:

CPU rises from 45% to 88%.

Disk reads triple.

A newly added endpoint executes a nonselective query every page load.

After rollback:

query frequency drops

CPU returns to 48%

disk reads normalize.

The DBA can demonstrate both timing and mechanism.`,

      troubleshootingApproach: `1. Establish exact deployment timeline.

2. Compare application traffic before/after.

3. Compare retry rate.

4. Compare query shapes.

5. Compare query frequency.

6. Run explain on new/changed queries.

7. Compare connections/pools.

8. Compare writes.

9. Compare CPU.

10. Compare cache.

11. Compare disk.

12. Compare network.

13. Check overlapping maintenance jobs.

14. Perform safe rollback if appropriate.

15. Confirm metrics recover.

16. Document causal chain.`,

      commonMistakes: [
        'Blaming the deployment without evidence.',
        'Ignoring query frequency changes.',
        'Ignoring connection-pool changes.',
        'Changing database settings before comparing application behavior.',
        'Failing to preserve before/after metrics.'
      ],

      bestPractices: [
        'Keep deployment markers in monitoring.',
        'Track query shapes over time.',
        'Maintain pre-deployment baselines.',
        'Use rollback as controlled evidence where safe.',
        'Document the exact mechanism.'
      ],

      interviewAnswer: `For a suspected deployment regression, I align application deployment timestamps with MongoDB and infrastructure metrics, then compare query shapes, frequency, plans, writes, connections, CPU, cache, and disk before and after the release.

If rollback is safe, I use it as an additional controlled comparison. The RCA should prove the mechanism, such as a new scan or retry storm, rather than merely saying the issue started after deployment.`,

      keyTakeaways: [
        'Timeline is the starting point.',
        'Before/after comparison is essential.',
        'Application changes can affect frequency, not only query text.',
        'Rollback can provide strong evidence.',
        'RCA should describe the causal mechanism.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 18,
    question:
      'MongoDB disk utilization is near 100%, replication lag is increasing, and application writes are slowing. How would you determine whether storage saturation is the primary bottleneck?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `High disk utilization, replication lag, and slow writes often point toward storage pressure.

But the DBA should prove:

1. storage is saturated,
2. MongoDB workload is causing or exposed to that saturation,
3. no other bottleneck better explains the incident.`,

      coreConcept: `Writes increase
    |
    v
disk pressure
    |
    v
Primary writes slower
    |
    v
Secondary applies slower
    |
    v
replication lag
    |
    v
majority writes slower

Possible causal chain.`,

      detailedExplanation: `A storage-saturation investigation should examine:

1. DISK LATENCY

Read and write latency are often more meaningful than utilization percentage alone.

2. IOPS

Is the volume at its IOPS limit?

3. THROUGHPUT

Is MB/s at the configured or physical limit?

4. QUEUEING

Are requests waiting for storage?

5. CLOUD STORAGE LIMITS

Examples include:

• provisioned IOPS
• throughput limits
• burst-credit exhaustion
• instance-to-volume bandwidth caps.

6. WIREDTIGER

Check:

• dirty cache
• page writes
• eviction
• checkpoint-related behavior.

7. WORKLOAD

Why did storage demand increase?

Possibilities:

• write spike
• new query scans
• backup
• index build
• migration
• batch job.

8. REPLICATION

Secondaries may have slower storage than Primary.

If lag is isolated to one member, that member's storage may be the problem.

9. MAJORITY WRITE LATENCY

If application uses majority writes, lagging required replicas can increase acknowledgement latency.

The DBA should map:

workload increase
→ storage saturation
→ replication lag
→ application latency

with timestamps.

If storage latency rises before lag and write latency, storage is likely upstream in the causal chain.`,

      internalWorking: `13:00 write spike

13:02 disk latency rises

13:04 Secondary lag rises

13:05 majority write latency rises

Timeline supports
storage as upstream bottleneck.`,

      architecture: `               PRIMARY
                  |
                storage
                  |
                 slow
                  |
               replication
                  |
           +------+------+
           |             |
           v             v
       Secondary A   Secondary B
          slow           slow
           |
           v
          lag
           |
           v
    majority acknowledgement
           |
           v
     application latency`,

      examples: [
        `100% utilization with 2 ms latency may be acceptable, while 60% utilization with 100 ms latency is not.`,
        `One slow Secondary can affect majority writes depending on topology and acknowledgement path.`,
        `A backup can be the trigger that saturates storage rather than the application itself.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps correlate write/cache pressure with storage behavior.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Shows whether replication lag is growing.'
        }
      ],

      productionScenario: `At 20:00 a nightly backup overlaps with a write-heavy batch.

Disk write latency rises from:

4 ms

to:

90 ms.

Secondary lag begins increasing two minutes later.

Majority write latency then jumps.

The DBA confirms storage saturation is upstream and reschedules the backup while increasing storage headroom.`,

      troubleshootingApproach: `1. Capture disk latency.

2. Capture IOPS.

3. Capture throughput.

4. Check queueing.

5. Check cloud/storage limits.

6. Check write rate.

7. Check backup/index jobs.

8. Check dirty cache.

9. Check checkpoint behavior.

10. Check per-member storage metrics.

11. Check replication lag timeline.

12. Check majority-write latency.

13. Build causal timeline.

14. Remove unnecessary load or scale storage.

15. Validate lag recovery.`,

      commonMistakes: [
        'Using utilization percentage alone.',
        'Checking only Primary storage.',
        'Ignoring cloud volume limits.',
        'Ignoring backup/index-build overlap.',
        'Treating replication lag as an unrelated issue.'
      ],

      bestPractices: [
        'Monitor latency, IOPS, throughput, and queueing.',
        'Track storage per replica member.',
        'Avoid overlapping heavy maintenance workloads.',
        'Maintain I/O headroom.',
        'Correlate storage and replication timelines.'
      ],

      interviewAnswer: `To prove storage saturation, I correlate disk read/write latency, IOPS, throughput, queueing and storage limits with WiredTiger dirty-cache behavior, workload changes, and replication lag.

If storage latency rises first and replication and write latency follow, that strongly supports storage as the upstream bottleneck. I still identify what caused the storage demand so the permanent fix addresses both capacity and workload.`,

      keyTakeaways: [
        'Disk utilization alone is insufficient.',
        'Latency and limits matter.',
        'Replication lag can be downstream of slow storage.',
        'Maintenance jobs can trigger saturation.',
        'Causal timing matters.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 19,
    question:
      'How would you distinguish a MongoDB capacity problem from an application or query-efficiency problem before deciding to vertically scale or add shards?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `Scaling hardware can improve performance, but it can also hide inefficient workload.

Before adding CPU, RAM, storage, or shards, the DBA should ask:

"Is the current workload efficient for the business work it performs?"`,

      coreConcept: `Performance limit
      |
      v
Efficient workload?
   /       \
  NO       YES
  |         |
  v         v
optimize   capacity
first      scaling
           may be justified`,

      detailedExplanation: `A capacity problem generally means:

the system is efficiently doing useful work

but legitimate demand exceeds available resources.

An efficiency problem means:

the system is doing unnecessary or avoidable work.

EFFICIENCY WARNING SIGNS

• COLLSCAN
• millions of docs examined for small results
• redundant requests
• retry storms
• huge connection pools
• unnecessary indexes
• unbounded aggregations
• scatter-gather queries
• repeated full scans.

CAPACITY WARNING SIGNS

• efficient critical query plans
• reasonable keys/docs examined ratios
• workload volume has grown materially
• CPU/storage saturation scales with useful throughput
• cache working set legitimately exceeds memory
• shard/storage growth is sustained and expected.

Example:

Scenario A:

CPU 95%

5,000 ops/sec

One query scans 10 million docs.

Fix query.

Scenario B:

CPU 95%

50,000 ops/sec

Queries are well indexed and efficient.

Application growth increased 10x.

Scaling may be appropriate.

For sharding specifically, the DBA should also verify the bottleneck cannot be solved by:

• better indexes
• schema changes
• archiving
• vertical scale
• read scaling

before accepting distributed-system complexity.

Sharding is a scalability architecture, not a generic performance button.`,

      internalWorking: `Same symptom:

CPU 95%

Case A:
5k useful ops/sec
huge scans
=> inefficiency

Case B:
50k useful ops/sec
good plans
=> capacity`,

      architecture: `                BOTTLENECK
                    |
            workload analysis
            /             \
           v               v
      inefficient       efficient
         work              work
           |               |
           v               v
       optimize         scale resource/
                       architecture`,

      examples: [
        `A bad COLLSCAN should be fixed before buying more CPUs.`,
        `A legitimately memory-bound working set may justify more RAM.`,
        `Sharding adds complexity and should solve a measured scaling problem.`
      ],

      commands: [
        {
          command:
            'db.collection.find(<query>).explain("executionStats")',
          explanation:
            'Helps evaluate query efficiency before scaling decisions.'
        },
        {
          command:
            'db.serverStatus().opcounters',
          explanation:
            'Helps quantify useful workload growth.'
        }
      ],

      productionScenario: `A cluster hits 90% CPU and the team proposes adding shards.

The DBA finds:

• total traffic grew only 10%
• a new endpoint performs broad scans
• totalDocsExamined increased 20x.

After fixing the endpoint, CPU returns to 45%.

Sharding would have distributed an avoidable problem across more servers.`,

      troubleshootingApproach: `1. Define bottleneck.

2. Measure workload growth.

3. Identify top query shapes.

4. Check query efficiency.

5. Check redundant workload/retries.

6. Review indexes.

7. Review working-set pressure.

8. Review storage limits.

9. Review connection behavior.

10. Determine whether useful throughput increased.

11. Optimize avoidable work.

12. Retest.

13. Scale remaining legitimate bottleneck if necessary.`,

      commonMistakes: [
        'Scaling before query analysis.',
        'Using sharding as a generic performance fix.',
        'Ignoring retry amplification.',
        'Confusing high resource use with inefficient resource use.',
        'Failing to retest after optimization.'
      ],

      bestPractices: [
        'Optimize first where waste exists.',
        'Scale when useful demand justifies it.',
        'Use workload evidence.',
        'Quantify before/after efficiency.',
        'Choose the simplest architecture that meets SLA.'
      ],

      interviewAnswer: `Before scaling, I determine whether MongoDB is efficiently processing legitimate workload. I inspect query plans, keys/docs examined, retries, connections, indexes, aggregations, cache pressure, and throughput growth.

If avoidable work is causing saturation, I optimize it first. If queries are efficient and legitimate workload has outgrown CPU, memory, storage or single-shard capacity, then I scale the appropriate resource or architecture.`,

      keyTakeaways: [
        'Capacity and efficiency are different problems.',
        'Scaling can hide bad queries.',
        'Useful throughput growth matters.',
        'Sharding should solve a measured scaling problem.',
        'Optimize then scale.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'performance_tuning',
    topicId: 'performance-tuning',
    topicNumber: 13,
    topicName: 'Performance Tuning',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 MongoDB production performance investigation involving high CPU, cache pressure, storage latency, replication lag, connection growth, and slow application response times?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `A complex MongoDB performance incident usually contains several symptoms at once.

Example:

• API latency high
• CPU 90%
• disk latency high
• cache eviction rising
• Secondary lag increasing
• connections increasing.

The DBA should not troubleshoot each symptom independently.

The goal is to build one evidence-based causal chain.`,

      coreConcept: `Application latency
       |
       v
Workload/query behavior
       |
       v
MongoDB execution
       |
       +--> CPU
       +--> cache
       +--> disk
       +--> connections
       |
       v
Replication impact
       |
       v
Root causal chain
       |
   +---+---+
   |       |
   v       v
stabilize permanent fix`,

      detailedExplanation: `PHASE 1 — ESTABLISH INCIDENT TIMELINE

Record:

• first user impact
• deployments
• traffic growth
• backup jobs
• batch jobs
• index builds
• infrastructure events.

PHASE 2 — DEFINE USER SYMPTOM

Measure:

• average latency
• p95/p99 latency
• error rate
• affected APIs.

PHASE 3 — CHECK WORKLOAD VOLUME

Compare:

• reads/sec
• writes/sec
• commands/sec
• connection creation
• transaction rate.

PHASE 4 — IDENTIFY QUERY SHAPES

Look for:

• slow queries
• high-frequency queries
• scans
• aggregations
• sort/group pressure.

PHASE 5 — RUN EXPLAIN

For critical queries inspect:

• IXSCAN/COLLSCAN
• totalKeysExamined
• totalDocsExamined
• nReturned
• sorting
• execution time.

PHASE 6 — ANALYZE CPU

Determine whether CPU increase tracks:

• useful throughput
• inefficient queries
• connection churn
• background operations.

PHASE 7 — ANALYZE MEMORY/CACHE

Check:

• cache occupancy
• dirty data
• page reads
• eviction
• working-set changes.

PHASE 8 — ANALYZE STORAGE

Check:

• read latency
• write latency
• IOPS
• throughput
• queueing
• cloud limits.

PHASE 9 — ANALYZE CONNECTIONS

Check:

• current connections
• connection creation rate
• application pools
• deployment/autoscaling behavior.

PHASE 10 — ANALYZE REPLICATION

Check:

• lag
• oplog window
• Secondary resource health
• majority-write effects.

PHASE 11 — BUILD CAUSAL CHAIN

Example:

application deployment
→ retry bug
→ queries/sec triples
→ CPU rises
→ working set churn increases
→ disk reads rise
→ storage latency rises
→ Secondary apply slows
→ replication lag increases
→ majority write latency rises
→ API latency increases further
→ client retries increase again.

This is a feedback loop.

PHASE 12 — IMMEDIATE STABILIZATION

Depending on evidence:

• rollback bad deployment
• stop runaway query/batch
• reduce retry amplification
• increase urgent storage headroom
• isolate backup/reporting workload
• temporarily scale resources.

PHASE 13 — PERMANENT FIX

May include:

• indexing
• query redesign
• pool/retry tuning
• workload isolation
• RAM/storage scaling
• shard-key/architecture changes
• better monitoring.

PHASE 14 — VALIDATE

Compare incident metrics against baseline after remediation.

PHASE 15 — RCA

Document:

• trigger
• causal chain
• customer impact
• mitigation
• permanent fixes
• monitoring gaps.`,

      internalWorking: `Example loop:

Bad release
   |
   v
retry amplification
   |
   v
3x queries
   |
   v
CPU/cache pressure
   |
   v
disk latency
   |
   v
replication lag
   |
   v
write latency
   |
   v
more client timeouts
   |
   v
more retries`,

      architecture: `                  APPLICATION
                      |
                      v
                 CONNECTIONS
                      |
                      v
                    MONGOD
          +-----------+-----------+
          |           |           |
          v           v           v
        CPU         CACHE       STORAGE
          \           |           /
           \          |          /
              query latency
                    |
                    v
                REPLICATION
                    |
                    v
             majority writes
                    |
                    v
             application SLA`,

      examples: [
        `High CPU and high disk can be two stages of one workload amplification incident.`,
        `Replication lag may be downstream of storage pressure.`,
        `Connection growth may be caused by retries rather than legitimate user growth.`
      ],

      commands: [
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides a broad server snapshot for workload, cache, connections, network and storage-engine analysis.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Helps inspect active operations during the incident.'
        },
        {
          command:
            'db.collection.find(<critical-query>).explain("executionStats")',
          explanation:
            'Used to validate critical query efficiency.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Helps quantify Secondary lag.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps compare replication lag against available oplog history.'
        }
      ],

      productionScenario: `At 11:00 API p99 latency jumps from:

80 ms

to:

4 seconds.

Evidence shows:

• deployment at 10:55
• application retries increased 4x
• MongoDB query rate triples
• CPU rises to 92%
• cache page reads and eviction increase
• disk latency rises from 6 ms to 70 ms
• Secondary lag rises to 8 minutes
• majority writes slow further.

The DBA identifies the causal chain:

deployment retry bug
→ workload amplification
→ CPU/cache/storage saturation
→ replication lag
→ slower acknowledgements
→ more application timeouts
→ more retries.

Immediate action:

rollback deployment.

Within minutes:

query rate normalizes
CPU drops
disk latency recovers
replication catches up.

Long-term fixes include retry backoff, query-rate monitoring, connection-pool metrics, and better saturation alerts.`,

      troubleshootingApproach: `1. Establish T0.

2. Measure application p95/p99.

3. Identify affected APIs.

4. Compare ops/sec with baseline.

5. Check deployments.

6. Check retries.

7. Identify top query shapes.

8. Run explain.

9. Check CPU.

10. Check cache occupancy.

11. Check eviction.

12. Check disk latency.

13. Check IOPS/throughput.

14. Check connection count.

15. Check connection creation rate.

16. Check pool settings.

17. Check replication lag.

18. Check oplog window.

19. Compare Primary and Secondaries.

20. Check backup/index/batch activity.

21. Build timeline.

22. Build causal chain.

23. Choose lowest-risk stabilization.

24. Validate recovery.

25. Implement permanent fix.

26. Update monitoring.

27. Document RCA.`,

      commonMistakes: [
        'Restarting MongoDB before collecting evidence.',
        'Treating each metric as an independent problem.',
        'Scaling everything at once.',
        'Ignoring application retries.',
        'Ignoring query frequency.',
        'Ignoring replication as a downstream effect.',
        'Closing the incident when CPU drops without fixing the trigger.'
      ],

      bestPractices: [
        'Start from customer impact and timeline.',
        'Correlate application, MongoDB and OS metrics.',
        'Use baselines.',
        'Distinguish trigger, amplifier and symptom.',
        'Stabilize first, then remove the root cause.',
        'Document one clear causal chain.',
        'Improve observability after every incident.'
      ],

      interviewAnswer: `For a complex MongoDB performance incident, I start with the application symptom and timeline, then correlate workload volume, query shapes, explain plans, CPU, WiredTiger cache, disk latency, connections, and replication.

I build one causal chain rather than treating every metric independently. For example, a retry bug can multiply queries, drive CPU and cache churn, increase storage latency, cause replication lag, slow majority writes, and trigger even more retries.

I apply the lowest-risk stabilization, validate recovery against baseline, implement the permanent fix, and document the RCA.`,

      keyTakeaways: [
        'Complex incidents usually have a causal chain.',
        'Application behavior must be included.',
        'CPU, cache, disk and replication interact.',
        'Replication lag can be a downstream symptom.',
        'RCA should identify trigger, amplifiers and root cause.'
      ]
    }
  }

];

/* =========================================================
   SEED EXECUTION
========================================================= */

async function seedPerformanceTuning() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'performance_tuning'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous performance_tuning documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Performance Tuning questions`
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
        category: 'performance_tuning'
      });

    console.log(
      `Topic 13 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 13 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 13 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 13 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedPerformanceTuning();
