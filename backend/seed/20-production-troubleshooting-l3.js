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
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 1,
    question:
      'What is the correct L3 methodology for troubleshooting a MongoDB production incident without making the situation worse?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `Production troubleshooting is not simply running commands until the problem disappears.

A strong DBA follows a controlled process:

1. Understand the impact.
2. Establish the timeline.
3. Collect evidence.
4. Form hypotheses.
5. Test those hypotheses.
6. Apply the lowest-risk effective mitigation.
7. Validate recovery.
8. Determine root cause.

The most dangerous troubleshooting style is making many unrelated changes before understanding the problem.`,

      coreConcept: `INCIDENT
   |
   v
Understand impact
   |
   v
Build timeline
   |
   v
Collect evidence
   |
   v
Form hypothesis
   |
   v
Test
   |
   v
Mitigate
   |
   v
Validate
   |
   v
RCA`,

      detailedExplanation: `PHASE 1 — UNDERSTAND BUSINESS IMPACT

Before touching MongoDB, determine:

• Is the application completely unavailable?
• Are only some operations slow?
• Are writes failing?
• Are reads failing?
• Is data integrity at risk?
• Is the problem isolated to one application?
• When did the problem begin?

PHASE 2 — ESTABLISH CURRENT TOPOLOGY

For a replica set determine:

• current primary
• secondary states
• member health
• replication lag
• recent elections.

For a sharded deployment also determine:

• mongos health
• shard health
• config server health
• affected shards.

PHASE 3 — BUILD A TIMELINE

Correlate:

• application errors
• MongoDB logs
• deployments
• elections
• infrastructure changes
• CPU
• memory
• disk latency
• connections
• query latency.

PHASE 4 — COLLECT EVIDENCE

Typical evidence includes:

• logs
• monitoring graphs
• current operations
• serverStatus
• replica-set state
• explain output
• OS metrics
• application telemetry.

PHASE 5 — FORM A HYPOTHESIS

Example:

A newly deployed query is causing excessive collection scans.

Then verify whether the evidence supports that hypothesis.

PHASE 6 — MITIGATE

Examples:

• rollback a bad application release
• stop a problematic batch process
• correct an index
• scale resources
• resolve disk pressure
• correct networking.

The mitigation should match the evidence.

PHASE 7 — VALIDATE

Do not stop when one graph looks better.

Check:

• application recovery
• query latency
• replication
• connections
• resource utilization
• error rate.

PHASE 8 — RCA

Separate:

root cause

from:

symptoms and contributing factors.`,

      internalWorking: `Bad troubleshooting:

Alert
  |
random restart
  |
random config change
  |
another restart
  |
evidence destroyed


L3 troubleshooting:

Alert
  |
evidence
  |
hypothesis
  |
controlled action
  |
validation`,

      architecture: `          APPLICATION
               |
               v
            MONGODB
        /      |       \
      QUERY   REPL    STORAGE
        \      |       /
          MONITORING
               |
             LOGS
               |
             DBA
               |
        evidence-driven
           decision`,

      examples: [
        'High CPU is a symptom; an inefficient query may be the cause.',
        'Replication lag may be a secondary effect of storage pressure.',
        'Application timeouts may create retries and connection growth, making the original incident appear larger.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Establish replica-set topology and member states.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect active operations when authorized. Do not kill operations merely because they are long-running.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server-level metrics and counters. Interpret them together with trends and monitoring data.'
        }
      ],

      productionScenario: `An application reports severe latency.

CPU is high and one secondary is lagging.

An inexperienced response might immediately restart the secondary.

An L3 DBA instead builds the timeline.

The DBA discovers that a reporting job began shortly before CPU and storage latency increased.

The expensive workload affects the primary, and replication lag appears afterward.

The reporting workload is stopped through the approved process.

CPU and storage latency fall and the secondary catches up.

The lag was a symptom, not the original cause.`,

      troubleshootingApproach: `1. Determine business impact.

2. Establish incident start time.

3. Check current topology.

4. Check application errors.

5. Check MongoDB logs.

6. Check CPU/memory/storage/network.

7. Check connections.

8. Check active operations.

9. Check query behavior.

10. Check replication.

11. Check recent changes.

12. Build hypotheses.

13. Test hypotheses using evidence.

14. Apply controlled mitigation.

15. Validate the entire service.

16. Preserve evidence for RCA.`,

      commonMistakes: [
        'Restarting MongoDB as the first troubleshooting action.',
        'Making several changes simultaneously.',
        'Killing operations without understanding them.',
        'Treating symptoms as root causes.',
        'Ignoring application telemetry.',
        'Failing to record timestamps.'
      ],

      bestPractices: [
        'Build a timeline first.',
        'Preserve evidence.',
        'Change one controlled variable where possible.',
        'Use monitoring and logs together.',
        'Validate service recovery end to end.'
      ],

      interviewAnswer: `My L3 troubleshooting methodology is evidence-driven. I first determine business impact and establish the incident timeline. Then I check topology, application errors, MongoDB logs, resource metrics, queries, connections and replication.

I form hypotheses from the evidence rather than making random changes. I apply the lowest-risk effective mitigation, validate application and database recovery, preserve evidence and then complete RCA identifying the root cause, contributing factors and preventive actions.`,

      keyTakeaways: [
        'Troubleshoot systematically.',
        'Build a timeline.',
        'Separate symptoms from causes.',
        'Avoid random changes.',
        'Validate recovery end to end.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 2,
    question:
      'MongoDB CPU suddenly reaches 90–100% in production. How would you troubleshoot the incident at L3 level?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `High CPU tells you that processors are busy.

It does not tell you why.

Possible causes include:

• increased workload
• inefficient queries
• collection scans
• expensive aggregations
• index builds
• application retry storms
• background operations
• compression or checkpoint-related work
• infrastructure contention.

The DBA must determine which workload changed.`,

      coreConcept: `HIGH CPU
   |
   +--> traffic increase?
   +--> bad query?
   +--> COLLSCAN?
   +--> aggregation?
   +--> index build?
   +--> retry storm?
   +--> background work?
   |
   v
find workload responsible`,

      detailedExplanation: `STEP 1 — ESTABLISH BASELINE

Determine whether 90% CPU is unusual for this server.

A production system that normally runs at 20% and suddenly reaches 95% is different from a system that normally runs at 80%.

STEP 2 — ESTABLISH TIMESTAMP

Identify when CPU increased.

STEP 3 — CHECK OPERATION RATE

Compare:

• reads
• writes
• commands
• updates
• deletes.

If traffic doubled, CPU growth may be expected.

STEP 4 — CHECK ACTIVE OPERATIONS

Look for:

• long-running finds
• aggregations
• index operations
• unusual commands.

STEP 5 — CHECK SLOW WORKLOAD

Review slow-query evidence and monitoring.

Look for:

• COLLSCAN
• high documents examined
• expensive sort
• large aggregation
• poor selectivity.

STEP 6 — CHECK APPLICATION CHANGES

Was there:

• new deployment
• batch job
• traffic event
• retry storm?

STEP 7 — CORRELATE OTHER RESOURCES

High CPU combined with high disk latency may indicate a different bottleneck than CPU alone.

STEP 8 — MITIGATION

Depending on cause:

• rollback bad application release
• stop approved batch
• optimize query
• add justified index
• reduce unnecessary workload
• scale when workload legitimately exceeds capacity.

Do not assume that scaling is always wrong.

If the workload is efficient and legitimate demand has grown, scaling can be the correct solution.`,

      internalWorking: `Application workload
        |
        v
MongoDB operations
        |
 query execution
        |
 CPU work

More operations
or
more CPU per operation
        |
        v
HIGH CPU`,

      architecture: `          APPLICATION
               |
            queries
               |
          +----+----+
          |         |
      efficient   expensive
          |         |
          +----+----+
               |
             CPU`,

      examples: [
        'A missing index can turn a small indexed lookup into a large collection scan.',
        'A sudden traffic increase can produce high CPU even when queries are efficient.',
        'A new aggregation pipeline may consume substantial CPU without increasing connection count.'
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect currently active operations when authorized.'
        },
        {
          command:
            'db.serverStatus().opcounters',
          explanation:
            'Provides cumulative operation counters. Compare deltas over time rather than treating them as instantaneous rates.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Analyze representative suspect queries.'
        }
      ],

      productionScenario: `CPU jumps from approximately 35% to 96% immediately after an application release.

Traffic volume is unchanged.

The DBA identifies a new query repeatedly performing COLLSCAN over a large collection.

The release is mitigated according to change procedures.

CPU returns to normal.

A suitable query/index design is tested before the application is redeployed.`,

      troubleshootingApproach: `1. Confirm CPU spike.

2. Establish baseline.

3. Record incident time.

4. Compare operation rate.

5. Check current operations.

6. Identify slow/high-work queries.

7. Check explain plans.

8. Review application releases.

9. Check batch jobs.

10. Correlate disk and memory.

11. Determine optimization versus capacity issue.

12. Apply controlled remediation.

13. Monitor afterward.`,

      commonMistakes: [
        'Immediately restarting mongod.',
        'Scaling before checking query behavior.',
        'Assuming high CPU always means more hardware is required.',
        'Ignoring application releases.',
        'Killing random operations.'
      ],

      bestPractices: [
        'Maintain CPU baselines.',
        'Correlate CPU with operation rate.',
        'Use explain for suspect queries.',
        'Track deployment timestamps.',
        'Scale only when evidence supports capacity pressure.'
      ],

      interviewAnswer: `For sudden MongoDB CPU saturation, I establish the baseline and exact incident time, then correlate CPU with operation rate, current operations, slow-query evidence, application deployments and other resources.

If traffic is unchanged but a new query is performing large scans, I optimize or mitigate that workload. If queries are efficient and legitimate workload has exceeded capacity, scaling may be appropriate. High CPU is the symptom; I identify what work caused it.`,

      keyTakeaways: [
        'CPU is a symptom.',
        'Compare with baseline.',
        'Correlate with operation rate.',
        'Check query plans.',
        'Differentiate inefficiency from legitimate growth.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 3,
    question:
      'MongoDB memory usage is very high in production. How would you determine whether it is healthy cache usage or a real memory-pressure incident?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `High memory usage is not automatically a MongoDB problem.

MongoDB and the operating system intentionally use memory to improve performance.

A DBA should ask:

Is the system experiencing memory pressure?

rather than:

Is memory usage high?`,

      coreConcept: `HIGH MEMORY
    |
    v
Pressure?
 /     \
No      Yes
|        |
cache   investigate
use     cache/OS/swap/
normal  workload/processes`,

      detailedExplanation: `WIREDTIGER CACHE

WiredTiger maintains an internal cache.

The exact default cache sizing formula depends on MongoDB version, platform and deployment environment.

Do not rely on one memorized percentage as a universal rule.

OPERATING SYSTEM CACHE

MongoDB also benefits from the operating system filesystem/page cache.

Therefore high used memory can be expected.

REAL MEMORY PRESSURE

Look for evidence such as:

• sustained eviction pressure
• cache unable to keep up
• increased page faults depending on platform/metric
• swap activity
• application or mongod OOM events
• severe latency correlated with memory pressure
• other processes consuming unexpected memory.

SWAP

The presence of configured swap and actual swap activity are different things.

Heavy swap activity can seriously affect latency.

Exact OS recommendations should be based on the MongoDB version, operating system and workload rather than applying one universal swappiness setting.

WORKING SET

If the active working set substantially exceeds available memory, the system may perform more storage reads.

This can increase latency.

OTHER PROCESSES

Always check whether another process is consuming memory.

Do not assume all host memory belongs to mongod.`,

      internalWorking: `MongoDB
  |
WiredTiger cache
  |
OS filesystem cache
  |
storage

Memory helps avoid
storage reads.

Pressure occurs when
active demand exceeds
available resources.`,

      architecture: `          SYSTEM RAM
        /           \
WiredTiger cache   OS/cache
       |
   active pages
       |
   application
     workload`,

      examples: [
        'A server showing high used memory but no swapping or latency may be healthy.',
        'A working set larger than memory can increase storage reads and latency.',
        'Another process on the host can create memory pressure even when MongoDB configuration has not changed.'
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows WiredTiger cache statistics. Exact fields vary by MongoDB version.'
        },
        {
          command:
            'free -h',
          explanation:
            'Linux command for a high-level memory and swap view.'
        },
        {
          command:
            'vmstat 1',
          explanation:
            'Can help observe system memory, run queue and swap activity over time.'
        }
      ],

      productionScenario: `Monitoring reports 92% memory used and an alert is raised.

The DBA checks the host and sees substantial memory being used for cache, no meaningful swap activity, normal storage latency and normal application response time.

There is no evidence of actual memory pressure.

The team tunes the alert instead of restarting MongoDB merely to make the used-memory percentage temporarily fall.`,

      troubleshootingApproach: `1. Check application impact.

2. Check available memory.

3. Check swap activity.

4. Check WiredTiger cache metrics.

5. Check eviction behavior.

6. Check storage latency.

7. Check working-set behavior.

8. Check other processes.

9. Check OOM/system logs if relevant.

10. Compare against historical baseline.

11. Determine whether real pressure exists.`,

      commonMistakes: [
        'Treating high used-memory percentage as failure.',
        'Restarting MongoDB just to clear memory.',
        'Ignoring OS cache.',
        'Ignoring other host processes.',
        'Applying universal swap settings without checking version and environment.'
      ],

      bestPractices: [
        'Monitor pressure rather than only utilization.',
        'Understand WiredTiger cache behavior.',
        'Correlate memory with storage latency.',
        'Monitor swap activity.',
        'Maintain workload baselines.'
      ],

      interviewAnswer: `High memory utilization alone is not enough for me to declare a MongoDB incident because WiredTiger and the operating system intentionally use memory for caching.

I check WiredTiger cache and eviction metrics, available memory, swap activity, storage latency, other processes and application performance. I classify it as a real memory-pressure issue only when there is evidence that memory demand is harming the system.`,

      keyTakeaways: [
        'High memory usage can be healthy.',
        'WiredTiger and OS caches both matter.',
        'Look for pressure signals.',
        'Swap activity matters more than swap existence alone.',
        'Correlate with latency.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 4,
    question:
      'A MongoDB filesystem reaches 95% utilization in production. What should an L3 DBA do, and what actions must be avoided?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `A nearly full MongoDB filesystem is a serious capacity incident.

The DBA must determine:

• what filesystem is affected
• what is consuming space
• how quickly it is growing
• how much time remains
• how space can be added or safely reclaimed.

Never manually delete WiredTiger files from dbPath.`,

      coreConcept: `DISK 95%
   |
   +--> dbPath?
   +--> logs?
   +--> backup?
   +--> temp files?
   +--> other files?
   |
   v
identify consumer
   |
expand / safely remediate`,

      detailedExplanation: `STEP 1 — IDENTIFY FILESYSTEM

Determine whether the full mount contains:

• MongoDB dbPath
• logs
• backups
• application files
• unrelated files.

STEP 2 — CHECK GROWTH

Determine whether utilization increased:

• gradually
• suddenly.

STEP 3 — IDENTIFY CONSUMERS

At the MongoDB level investigate:

• database size
• collection size
• index size
• oplog size.

At the OS level identify directories consuming space, subject to access permissions.

STEP 4 — UNDERSTAND WIREDTIGER SPACE

Deleting documents does not necessarily immediately return equivalent filesystem space to the OS.

WiredTiger can reuse freed space internally.

Therefore:

delete 100 GB of documents

does not automatically mean:

df shows 100 GB more free.

STEP 5 — EXPANSION

In many production environments, expanding the underlying storage/filesystem is the safest immediate response.

Exact procedures depend on cloud provider, volume manager and filesystem.

STEP 6 — LOGS/BACKUPS

Check whether:

• logs failed to rotate
• dumps were accidentally written to dbPath filesystem
• old backups accumulated locally.

STEP 7 — DATA REMOVAL

Data should never be deleted simply to solve disk pressure without confirming business retention requirements.

STEP 8 — NEVER DELETE DBPATH FILES

Do not manually remove:

• WiredTiger files
• collection files
• index files
• journal files

from an active MongoDB dbPath to free space.

That can make the database unusable or cause data loss.`,

      internalWorking: `MongoDB files
     |
 filesystem
     |
 free capacity
     |
if exhausted
     |
writes/startup can fail

Safe response:
identify + expand/remediate

Unsafe:
rm WiredTiger*`,

      architecture: `             FILESYSTEM
          /      |       \
       DATA    INDEXES    OPLOG
          \      |       /
             dbPath

Other possible consumers:
logs / backups / temp / unrelated files`,

      examples: [
        'A mongodump accidentally stored on the database volume can consume hundreds of GB without database growth.',
        'Large index creation can materially increase storage consumption.',
        'Deleting documents may create internally reusable space without immediately reducing filesystem allocation.'
      ],

      commands: [
        {
          command:
            'df -h',
          explanation:
            'Shows filesystem capacity and utilization on Linux.'
        },
        {
          command:
            'du -sh <approved-path>/*',
          explanation:
            'Can identify large directories when permissions and operational policy allow.'
        },
        {
          command:
            'db.stats()',
          explanation:
            'Provides database-level storage statistics.'
        },
        {
          command:
            'db.collection.stats()',
          explanation:
            'Provides collection-level statistics. Exact output fields vary by version.'
        }
      ],

      productionScenario: `The MongoDB data filesystem reaches 95%.

The DBA finds that database growth is normal, but a 300 GB temporary backup was written to the same mount.

The backup is moved or removed through the approved backup process.

The DBA also updates the backup procedure so future dumps cannot unexpectedly consume the production database volume.`,

      troubleshootingApproach: `1. Identify affected filesystem.

2. Determine dbPath/log/backup locations.

3. Measure free space.

4. Calculate growth rate.

5. Identify largest consumers.

6. Check database/collection/index growth.

7. Check oplog size.

8. Check backups/logs/temp files.

9. Expand storage if required.

10. Remove only confirmed safe non-database files.

11. Never manually delete WiredTiger/dbPath files.

12. Add preventive capacity alerts.`,

      commonMistakes: [
        'Deleting WiredTiger files manually.',
        'Deleting production data without approval.',
        'Assuming document deletion immediately frees filesystem space.',
        'Ignoring backup files.',
        'Waiting until the filesystem reaches 100%.'
      ],

      bestPractices: [
        'Alert before critical capacity.',
        'Forecast growth.',
        'Separate backup storage where practical.',
        'Maintain log rotation.',
        'Preserve emergency storage headroom.'
      ],

      interviewAnswer: `At 95% disk utilization I first determine which filesystem is affected and identify whether the growth comes from MongoDB data, indexes, oplog, logs, backups or unrelated files. I calculate the growth rate and remaining time.

If necessary I expand storage using the platform-specific procedure. I never manually delete WiredTiger or other dbPath files. I also remember that deleting MongoDB documents may make space reusable internally without immediately returning the same amount to the filesystem.`,

      keyTakeaways: [
        '95% disk is a capacity incident.',
        'Identify the real consumer.',
        'Expansion may be the safest immediate response.',
        'Deleted space may be reused internally.',
        'Never manually delete dbPath files.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 5,
    question:
      'An application reports that MongoDB queries suddenly take 10 seconds instead of milliseconds. How would you troubleshoot the slowdown?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `A query that suddenly becomes slow may have changed because of:

• query plan
• data volume
• index availability
• selectivity
• storage latency
• resource contention
• application behavior
• network latency.

The first objective is to identify the exact query shape and when it became slow.`,

      coreConcept: `SLOW QUERY
    |
query changed?
plan changed?
data changed?
index changed?
storage changed?
load changed?
network changed?
    |
    v
explain + timeline`,

      detailedExplanation: `STEP 1 — IDENTIFY QUERY

Obtain the exact query shape safely.

Do not begin by optimizing an unrelated query.

STEP 2 — ESTABLISH BEFORE/AFTER

When was it fast?

When did it become slow?

STEP 3 — EXPLAIN

Use executionStats on a representative query where operationally safe.

Important indicators include:

• winningPlan
• nReturned
• totalDocsExamined
• totalKeysExamined
• executionTimeMillis.

STEP 4 — INDEXES

Check whether:

• required index exists
• index was dropped
• index is hidden
• compound order fits workload.

STEP 5 — DATA DISTRIBUTION

An index that worked well when a predicate was selective may become less effective as data distribution changes.

STEP 6 — SORT

Determine whether MongoDB performs an expensive sort not supported by an index.

STEP 7 — STORAGE

If execution plan is unchanged, check storage latency.

STEP 8 — LOAD

Check whether system workload changed.

STEP 9 — APPLICATION

The application may report 10 seconds even if MongoDB executes the query quickly.

Possible application-side time includes:

• connection-pool wait
• network
• retries
• result processing.

Therefore separate:

database execution time

from:

end-to-end request time.`,

      internalWorking: `Application
   |
driver/pool
   |
network
   |
MongoDB
   |
query planner
   |
index/storage
   |
result

10-second app latency
can originate at multiple layers.`,

      architecture: `QUERY
  |
PLANNER
  |
WINNING PLAN
 /          \
IXSCAN     COLLSCAN
  |           |
work         work
  \           /
    execution time`,

      examples: [
        'An index may have been removed during deployment.',
        'A query can become less selective as data grows.',
        'Storage latency can increase query time even when the execution plan is unchanged.'
      ],

      commands: [
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Inspect execution statistics for the representative query.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Verify available indexes.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect currently running operations and waits where appropriate.'
        }
      ],

      productionScenario: `A customer lookup that normally completes in milliseconds begins taking several seconds.

Explain shows a COLLSCAN.

The DBA checks indexes and discovers that the expected compound index was removed during a deployment.

After the correct index is restored through change control, explain returns to an indexed plan and latency normalizes.`,

      troubleshootingApproach: `1. Identify exact query shape.

2. Establish slow-start timestamp.

3. Compare application/database latency.

4. Run explain.

5. Check winning plan.

6. Check docs examined.

7. Check keys examined.

8. Check indexes.

9. Check data growth/selectivity.

10. Check storage latency.

11. Check workload changes.

12. Check network/pool behavior.

13. Apply evidence-based fix.

14. Re-run explain and measure.`,

      commonMistakes: [
        'Creating indexes without explain.',
        'Looking only at CPU.',
        'Assuming application latency equals server execution time.',
        'Ignoring data distribution changes.',
        'Testing with unrealistic query values.'
      ],

      bestPractices: [
        'Capture representative query shapes.',
        'Use executionStats.',
        'Track index changes.',
        'Compare before and after.',
        'Measure end-to-end and server latency separately.'
      ],

      interviewAnswer: `For a query that suddenly increases from milliseconds to seconds, I identify the exact query shape and timeline, then use explain executionStats to inspect the winning plan, documents examined, keys examined and returned documents.

I check index changes, data selectivity, sorting, storage latency and workload changes. I also separate MongoDB execution time from application-side pool, network and result-processing latency.`,

      keyTakeaways: [
        'Start with the exact query.',
        'Use explain.',
        'Check index changes.',
        'Data distribution can change performance.',
        'Application latency is not always database execution time.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 6,
    question:
      'A MongoDB secondary is showing 2,000 seconds of replication lag. How would you troubleshoot and recover it safely?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `Replication lag means a secondary is behind the primary.

2,000 seconds of lag tells you the size of the delay in time.

It does not tell you why the secondary is behind.

The DBA must determine whether the secondary is:

• receiving oplog entries slowly
• applying them slowly
• resource constrained
• blocked by network/storage
• recovering from maintenance
• approaching or outside the oplog window.`,

      coreConcept: `PRIMARY
   |
 oplog
   |
 network
   |
SECONDARY
   |
 apply
   |
 lag

Investigate:
source -> transfer -> apply -> resources`,

      detailedExplanation: `STEP 1 — CHECK MEMBER STATE

Confirm whether the member is:

• SECONDARY
• RECOVERING
• STARTUP2
• DOWN
• another state.

STEP 2 — CHECK LAG

Compare member optimes/timestamps.

STEP 3 — CHECK OPLOG WINDOW

This is critical.

If the secondary falls behind farther than the history retained in the primary's oplog, normal replication cannot simply fetch the missing history.

The member may require initial sync/resynchronization depending on the exact state and supported recovery procedure.

STEP 4 — CHECK NETWORK

Check connectivity and latency between members.

STEP 5 — CHECK DISK

Replication apply can be limited by storage latency.

STEP 6 — CHECK CPU/MEMORY

Resource pressure can slow application of operations.

STEP 7 — CHECK WORKLOAD

A sudden heavy write workload can generate oplog entries faster than the secondary can apply them.

STEP 8 — CHECK MEMBER-SPECIFIC ACTIVITY

Examples:

• backup activity
• index operations
• infrastructure maintenance.

STEP 9 — DO NOT RESTART BLINDLY

Restarting a lagging secondary does not automatically solve the cause.

STEP 10 — RECOVERY

If the secondary remains within the oplog window and the bottleneck is removed, it may catch up naturally.

If it is outside the available oplog history, resynchronization may be required.`,

      internalWorking: `PRIMARY oplog

T0 ---------------- Tnow
         |
      history

Secondary position:
        ^

If position still exists
in oplog:
can catch up.

If required history
has rolled off:
normal catch-up cannot
retrieve missing operations.`,

      architecture: `PRIMARY
   |
   | oplog entries
   v
SECONDARY
   |
   +--> network
   +--> disk
   +--> CPU
   +--> apply capacity
   |
   v
replication progress`,

      examples: [
        'A secondary may lag after OS patching because it was offline and needs to catch up.',
        'High disk latency on one secondary can cause lag even when the primary is healthy.',
        'A very small oplog window increases the risk that prolonged lag requires resynchronization.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Inspect member state and replication progress.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Convenient mongosh helper for lag information where available.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Can provide oplog information from an appropriate replica-set member; helper behavior/output varies by version.'
        }
      ],

      productionScenario: `A secondary shows approximately 2,000 seconds of lag after an infrastructure maintenance event.

The DBA verifies that the member is SECONDARY and still within the available oplog window.

Disk and network are healthy after maintenance.

The DBA allows the member to catch up while monitoring lag rather than immediately triggering a new initial sync.

Lag steadily falls to zero.`,

      troubleshootingApproach: `1. Check rs.status().

2. Confirm member state.

3. Measure lag.

4. Determine oplog window.

5. Compare lag against available history.

6. Check network.

7. Check disk latency.

8. Check CPU/memory.

9. Check write workload.

10. Review maintenance/events.

11. Remove underlying bottleneck.

12. Monitor catch-up.

13. Resync only when required by the member state/history situation.`,

      commonMistakes: [
        'Restarting the secondary repeatedly.',
        'Ignoring oplog window.',
        'Immediately forcing initial sync when catch-up is possible.',
        'Assuming lag always comes from network.',
        'Ignoring secondary disk latency.'
      ],

      bestPractices: [
        'Monitor oplog window continuously.',
        'Size oplog based on workload and recovery needs.',
        'Correlate lag with resource metrics.',
        'Allow safe natural catch-up when appropriate.',
        'Avoid unnecessary resynchronization.'
      ],

      interviewAnswer: `For 2,000 seconds of replication lag, I first check the secondary state and compare its replication position with the primary. Then I determine whether the required history is still inside the oplog window.

I check network, disk latency, CPU, memory, write volume and recent maintenance. If the member remains within the oplog window and the bottleneck is removed, I allow it to catch up while monitoring. If required oplog history has rolled off, resynchronization may be necessary.`,

      keyTakeaways: [
        'Lag is a symptom.',
        'Check member state.',
        'Oplog window is critical.',
        'Disk can cause replication lag.',
        'Do not resync unnecessarily.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 7,
    question:
      'MongoDB suddenly has thousands of connections and applications start timing out. How would you investigate a connection storm?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `MongoDB drivers normally use connection pools.

A connection storm occurs when connection count or connection creation rises abnormally.

Possible causes include:

• application autoscaling
• new MongoClient per request
• oversized pools
• reconnect loops
• network instability
• application retries
• deployment/restart events.`,

      coreConcept: `APP INSTANCES
      x
CONNECTION POOLS
      =
TOTAL CONNECTIONS

Plus:

network failure
   |
reconnect/retry
   |
connection storm`,

      detailedExplanation: `STEP 1 — ESTABLISH TIMELINE

Determine exactly when connections increased.

STEP 2 — COMPARE APPLICATION INSTANCES

Did the application scale from:

20 instances

to:

200 instances?

Each instance can maintain its own pool.

STEP 3 — CHECK DRIVER BEHAVIOR

Applications should generally reuse MongoClient instances appropriately rather than creating a new client for every request.

STEP 4 — CHECK DEPLOYMENTS

A release may have changed:

• pool settings
• client lifecycle
• retry behavior.

STEP 5 — CHECK NETWORK

Repeated network failures can cause reconnect behavior.

STEP 6 — CHECK DATABASE PERFORMANCE

Determine whether the connection storm is:

cause

or:

effect.

Example:

slow database
→ application timeout
→ retry
→ more requests
→ more connection pressure.

STEP 7 — CHECK RESOURCE IMPACT

Large connection growth can increase memory and operational overhead.

STEP 8 — FIX ROOT CAUSE

Do not simply increase connection-related limits without understanding why the connections multiplied.

Exact server and driver connection limits/settings depend on MongoDB and driver versions.`,

      internalWorking: `Normal:

App
 |
shared MongoClient
 |
pool
 |
MongoDB


Bad pattern:

Request 1 -> new client
Request 2 -> new client
Request 3 -> new client
...
       |
connection explosion`,

      architecture: `APP POD 1 ----\
APP POD 2 -----\
APP POD 3 ------> MONGODB
APP POD N -----/

Each instance
may maintain
its own pool.`,

      examples: [
        'Kubernetes autoscaling can multiply driver pools rapidly.',
        'Creating MongoClient per HTTP request can create excessive connection churn.',
        'Database latency can trigger application retries that worsen the original incident.'
      ],

      commands: [
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Shows connection-related server statistics; exact fields vary by version.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect active client operations and connection-related context when authorized.'
        }
      ],

      productionScenario: `Connections increase from 600 to several thousand within minutes.

Traffic has not increased proportionally.

The DBA correlates the event with a new application release.

The new code creates a MongoClient for each request instead of reusing the application's client/pool.

The application is rolled back and connection count returns to baseline.`,

      troubleshootingApproach: `1. Establish connection baseline.

2. Record spike timestamp.

3. Compare traffic.

4. Check application instance count.

5. Check autoscaling.

6. Review deployments.

7. Review MongoClient lifecycle.

8. Review pool configuration.

9. Check network errors.

10. Check retries/timeouts.

11. Check database latency.

12. Determine cause versus effect.

13. Fix root cause.

14. Monitor connections afterward.`,

      commonMistakes: [
        'Increasing limits immediately.',
        'Ignoring application autoscaling.',
        'Ignoring driver pool configuration.',
        'Treating every connection as an independent user.',
        'Ignoring reconnect storms.'
      ],

      bestPractices: [
        'Reuse MongoClient correctly.',
        'Use sensible connection pools.',
        'Monitor connection creation and total connections.',
        'Correlate with application instances.',
        'Coordinate retry behavior across application and database layers.'
      ],

      interviewAnswer: `For a connection storm, I correlate the connection spike with application traffic, instance count, autoscaling, deployments, pool configuration and network errors.

I determine whether connection growth is the cause or a secondary effect of database latency and retries. I avoid simply increasing limits because that can hide poor client lifecycle management. The permanent fix is usually at the driver, application, network or workload layer.`,

      keyTakeaways: [
        'Drivers use pools.',
        'Autoscaling multiplies pools.',
        'Retries can amplify incidents.',
        'Check MongoClient lifecycle.',
        'Do not blindly raise limits.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 8,
    question:
      'The MongoDB primary suddenly goes down in production. What happens internally, and what should the DBA verify during and after failover?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `In a healthy replica set with sufficient voting majority and eligible members, loss of the primary can trigger an election.

An eligible secondary may become the new primary.

The DBA should not assume that failover means everything is automatically healthy.

Verify:

• election
• new primary
• member health
• replication
• application recovery
• reason old primary failed.`,

      coreConcept: `PRIMARY DOWN
     |
majority available?
     |
    yes
     |
 election
     |
new PRIMARY
     |
drivers discover
     |
application resumes`,

      detailedExplanation: `ELECTION

Replica-set members coordinate to elect an eligible member when a primary is unavailable and election requirements are satisfied.

Exact election behavior depends on topology, member configuration and current state.

APPLICATION

Supported MongoDB drivers using proper replica-set-aware connection configuration can discover topology changes.

There can still be temporary application errors during failover.

Retryable writes and driver retry behavior depend on operation type, configuration and driver/server support.

Do not promise zero application impact.

DBA CHECKS

1. Which member became primary?

2. Are remaining members healthy?

3. Is majority available?

4. Is replication caught up?

5. Did the application reconnect?

6. Were any writes interrupted?

7. Why did the old primary fail?

OLD PRIMARY RETURN

When the former primary returns, it normally rejoins according to replica-set state and synchronizes as required.

Do not manually force it to primary merely because it used to be primary.

ROLLBACK

If a former primary had writes that were not replicated to the new majority-confirmed history before failover, rollback behavior may become relevant when histories reconcile.

Write concern and application semantics matter.

ROOT CAUSE

Failover restores availability.

It does not explain why the member failed.`,

      internalWorking: `P = primary
S = secondary

Before:
P   S   S

P fails:
X   S   S
     \ /
     vote
      |
new P

After:
X   P   S

Old node returns:
S   P   S
after reconciliation`,

      architecture: `APPLICATION
     |
replica-set-aware driver
     |
 +---+---+
 |   |   |
 P   S   S
 |
fails
 |
election
 |
new P`,

      examples: [
        'A three-voting-member replica set can generally tolerate one voting member failure while retaining majority.',
        'If majority is unavailable, a primary cannot simply be elected safely.',
        'Applications hard-coded to one host may experience unnecessary outage after failover.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Verify current primary and member states.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Review replica-set configuration when topology or voting eligibility must be understood.'
        }
      ],

      productionScenario: `The primary server unexpectedly reboots.

The two remaining voting members retain majority and elect a new primary.

Applications recover through their replica-set connection configuration.

The DBA verifies topology and replication, then investigates the original server's OS and MongoDB logs.

The incident is not closed merely because a new primary exists.`,

      troubleshootingApproach: `1. Record failover timestamp.

2. Check rs.status().

3. Identify new primary.

4. Verify majority.

5. Check member health.

6. Check replication lag.

7. Check application recovery.

8. Review interrupted operations/errors.

9. Investigate failed node.

10. Monitor old node rejoin.

11. Review rollback evidence if relevant.

12. Complete RCA.`,

      commonMistakes: [
        'Forcing the old primary back to primary.',
        'Assuming failover means no application impact.',
        'Ignoring why the primary failed.',
        'Changing replica-set configuration during panic without understanding majority.',
        'Hard-coding applications to one member.'
      ],

      bestPractices: [
        'Use replica-set-aware connection strings.',
        'Preserve majority.',
        'Test failover behavior.',
        'Monitor elections.',
        'Investigate the failed member after service stabilization.'
      ],

      interviewAnswer: `When a MongoDB primary goes down, eligible members can hold an election if a voting majority is available. An eligible secondary may become the new primary.

I verify the new topology, majority, replication health and application recovery. I then investigate why the original primary failed and whether any rollback or interrupted-write concerns exist. Failover restores availability, but RCA is still required.`,

      keyTakeaways: [
        'Elections require appropriate majority conditions.',
        'Failover can have temporary application impact.',
        'Drivers should be replica-set aware.',
        'Do not force the former primary back.',
        'Investigate the original failure.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 9,
    question:
      'MongoDB service unexpectedly stops and the logs show that mongod received SIGTERM. How would you investigate who or what stopped it?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `SIGTERM normally indicates that the mongod process received a request to terminate gracefully.

It does not by itself tell you who sent the signal.

Possible sources include:

• systemctl stop/restart
• server shutdown/reboot
• automation
• maintenance tooling
• orchestration
• administrative kill command
• infrastructure event.

The DBA must correlate MongoDB logs with operating-system and infrastructure evidence.`,

      coreConcept: `mongod receives SIGTERM
        |
        v
MongoDB log records shutdown
        |
        v
Need external evidence
        |
OS logs
systemd
reboot history
automation
cloud events`,

      detailedExplanation: `MONGODB LOG

The MongoDB log may show that a signal was received and that shutdown began.

This proves:

mongod received the signal.

It does not necessarily prove:

which human or process caused it.

SYSTEMD

If mongod is managed by systemd, investigate service logs and unit activity where permissions allow.

REBOOT

Check whether the operating system rebooted.

A normal shutdown/reboot sequence can cause systemd to terminate MongoDB gracefully.

LOGIN/AUDIT HISTORY

Depending on OS configuration and permissions, investigate:

• login history
• sudo/audit logs
• shell history
• automation logs.

Do not treat shell history as authoritative security evidence because it may be incomplete.

CLOUD INFRASTRUCTURE

For cloud VMs, investigate:

• VM restart
• stop/start
• maintenance event
• automation
• platform activity.

TIME ZONES

Be careful when correlating logs.

MongoDB logs, OS logs, monitoring systems and cloud consoles may display different time zones.

Normalize timestamps before drawing conclusions.

OOM

An out-of-memory kill is conceptually different from a normal SIGTERM shutdown.

Look for OS evidence rather than assuming high memory caused the SIGTERM.`,

      internalWorking: `External actor/system
       |
     SIGTERM
       |
     mongod
       |
graceful shutdown log

MongoDB knows signal arrived.

OS/cloud evidence may reveal
why it was sent.`,

      architecture: `         USER
          |
       systemctl
          |
          +------\
                  \
AUTOMATION --------> systemd ---> mongod
                  /
OS REBOOT --------/
                  |
               SIGTERM`,

      examples: [
        'A VM reboot can result in mongod receiving SIGTERM during normal shutdown.',
        'A systemctl restart can produce a graceful MongoDB shutdown followed by startup.',
        'MongoDB logs alone may not identify the administrator who initiated an OS reboot.'
      ],

      commands: [
        {
          command:
            'journalctl -u mongod',
          explanation:
            'Shows systemd journal entries for the MongoDB service when permissions allow.'
        },
        {
          command:
            'last -x',
          explanation:
            'Can show Linux reboot/shutdown history depending on system configuration.'
        },
        {
          command:
            'who -b',
          explanation:
            'Shows the last system boot time on many Linux systems.'
        },
        {
          command:
            'systemctl status mongod',
          explanation:
            'Shows current service state and recent service information.'
        }
      ],

      productionScenario: `MongoDB stops at 00:20 and its log records SIGTERM.

The VM reboot history shows the host entered a shutdown/reboot sequence shortly afterward.

The DBA correlates the MongoDB timestamp, OS reboot history and infrastructure event records.

The RCA therefore attributes the database shutdown to the VM shutdown sequence rather than claiming MongoDB crashed independently.`,

      troubleshootingApproach: `1. Capture MongoDB shutdown timestamp.

2. Confirm shutdown type from MongoDB logs.

3. Normalize timezone.

4. Check systemd journal.

5. Check reboot/shutdown history.

6. Check OS audit evidence where available.

7. Check automation/change records.

8. Check cloud infrastructure events.

9. Distinguish SIGTERM from crash/OOM/SIGKILL.

10. Build evidence-based RCA.`,

      commonMistakes: [
        'Assuming SIGTERM means MongoDB crashed.',
        'Claiming a specific user sent the signal without evidence.',
        'Ignoring VM reboot history.',
        'Mixing UTC and local timestamps.',
        'Assuming CPU or RAM pressure directly explains SIGTERM.'
      ],

      bestPractices: [
        'Normalize timestamps.',
        'Preserve MongoDB and OS logs.',
        'Correlate database and infrastructure events.',
        'Use audit evidence where available.',
        'State clearly when the initiating actor cannot be proven.'
      ],

      interviewAnswer: `SIGTERM tells me that mongod received a graceful termination signal, but it does not by itself identify who sent it. I correlate the MongoDB shutdown timestamp with systemd journal entries, OS reboot history, audit records, automation/change records and cloud infrastructure events.

I also normalize time zones and distinguish SIGTERM from OOM kills or crashes. My RCA states only what the available evidence proves.`,

      keyTakeaways: [
        'SIGTERM is not automatically a crash.',
        'MongoDB logs may not identify the sender.',
        'Check systemd and reboot history.',
        'Cloud events matter.',
        'Normalize time zones.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 10,
    question:
      'A MongoDB secondary falls outside the oplog window. What does that mean, why can normal replication no longer catch up, and how should the DBA recover the member?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `The oplog contains a rolling history of replicated operations.

A secondary needs that history to catch up.

If the secondary is so far behind that the operations it needs have already rolled out of the available oplog, there is a gap in replication history.

The secondary cannot reconstruct those missing operations from the current oplog alone.`,

      coreConcept: `PRIMARY OPLOG

Oldest -------------------- Newest
        available history


Secondary needs:
   X

If X is older than
oldest retained operation:

required history is gone

=> normal catch-up cannot continue`,

      detailedExplanation: `OPLOG WINDOW

The oplog window represents approximately how much time of operation history the oplog currently retains.

It is workload-dependent.

A 100 GB oplog may represent:

many hours in one environment

and:

much less time in a high-write environment.

Therefore oplog sizing should not be based only on GB.

HOW A SECONDARY CATCHES UP

A secondary reads replication history and applies the operations it has not yet processed.

Suppose the secondary last applied operation:

T1.

The primary's oldest retained oplog operation is now:

T2.

If:

T1 < T2

then operations between those points are no longer available in the oplog.

The secondary cannot simply skip them because doing so would produce an inconsistent dataset.

RECOVERY

The member generally needs to obtain a consistent copy of the data again through a supported resynchronization/initial-sync procedure appropriate to the deployment.

Exact operational steps depend on:

• MongoDB version
• self-managed versus Atlas
• topology
• storage
• supported snapshot/initial-sync procedures.

For a standard self-managed replica-set member, allowing MongoDB to perform an initial sync is a common recovery path.

Do not manually copy arbitrary dbPath files from a running node.

PREVENTION

Monitor:

• oplog window
• replication lag
• maintenance duration
• write workload.

If planned maintenance can keep a secondary offline for four hours, an oplog window of one hour creates obvious operational risk.

Oplog resizing can be supported through MongoDB commands on supported versions, but exact syntax, limits and behavior should be verified for the deployed version.`,

      internalWorking: `Secondary last applied:
        T1

Oplog:
             T2 -------- T3
             oldest      now

T1 < T2

Missing history:
T1 ---- T2

Not available anymore.

Secondary requires
resynchronization.`,

      architecture: `PRIMARY
   |
   +--> capped oplog history
   |
   v
SECONDARY
   |
requires continuous history

If history gap occurs:
normal incremental replication
cannot rebuild missing state.`,

      examples: [
        'A secondary offline for OS maintenance can fall outside a small oplog window.',
        'A write spike can dramatically shorten the oplog window even if oplog size does not change.',
        'Increasing oplog size improves retained history but does not guarantee a fixed number of hours under every workload.'
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Can display oplog size and time span information from mongosh where applicable.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Inspect replica-set member state and replication progress.'
        }
      ],

      productionScenario: `A secondary is offline for six hours during infrastructure maintenance.

The production workload is write-heavy and the current oplog window is approximately two hours.

When the member returns, the history it requires is no longer available.

The DBA confirms the history gap and follows the approved resynchronization procedure rather than repeatedly restarting the member.

After recovery, oplog capacity planning is reviewed against realistic maintenance and incident durations.`,

      troubleshootingApproach: `1. Check member state.

2. Determine last applied position.

3. Determine current oplog window.

4. Confirm whether required history still exists.

5. Check why the member fell behind.

6. If history exists, correct bottleneck and allow catch-up.

7. If required history is gone, plan supported resynchronization.

8. Preserve replica-set majority during recovery.

9. Monitor initial sync/resynchronization.

10. Verify member reaches SECONDARY.

11. Verify zero/acceptable lag.

12. Review oplog sizing and operational procedures.`,

      commonMistakes: [
        'Restarting repeatedly hoping missing oplog history returns.',
        'Assuming oplog GB directly equals a fixed time window.',
        'Manually copying arbitrary WiredTiger files.',
        'Removing multiple replica-set members simultaneously.',
        'Ignoring why the member fell outside the window.'
      ],

      bestPractices: [
        'Monitor oplog window.',
        'Size history for realistic outage and maintenance scenarios.',
        'Preserve majority during recovery.',
        'Use supported resynchronization procedures.',
        'Investigate the original cause of excessive lag.'
      ],

      interviewAnswer: `A secondary falls outside the oplog window when the operations it still needs have already rolled out of the primary's retained oplog history. Because the secondary no longer has a continuous sequence of operations to apply, normal incremental replication cannot safely catch it up.

I confirm the history gap and member state, then use the supported resynchronization or initial-sync procedure for that MongoDB version and environment while preserving replica-set majority. Afterward I review why the lag occurred and whether the oplog window is adequate for the workload and maintenance requirements.`,

      keyTakeaways: [
        'Oplog is rolling replication history.',
        'Window is workload-dependent.',
        'Missing history prevents normal catch-up.',
        'Resynchronization may be required.',
        'Oplog sizing should consider outage duration.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 11,
    question:
      'A MongoDB node enters rollback after an election or network partition. What does rollback mean, why does it happen, and how should an L3 DBA investigate it?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `MongoDB rollback can occur when a former primary rejoins the replica set and discovers that some of the writes it accepted are not part of the replica set's current authoritative history.

MongoDB must reconcile the divergent history.

Rollback does not automatically mean corruption.

It is a replication-consistency mechanism.`,

      coreConcept: `Old Primary
   |
accepted writes
   |
loses majority/connectivity
   |
new Primary elected
   |
new writes occur
   |
old Primary returns
   |
histories differ
   |
rollback divergent operations`,

      detailedExplanation: `HOW DIVERGENCE CAN OCCUR

Suppose:

Node A = Primary.

A loses contact with enough voting members that it can no longer maintain primary authority.

Another eligible member becomes Primary.

During the transition, writes that existed only on the old primary may not exist in the new authoritative history.

When the old primary rejoins, MongoDB must align it with the replica set's current history.

ROLLBACK

MongoDB identifies operations that belong to the divergent branch and removes/reconciles them from the returning member.

The exact rollback implementation and recovery behavior depend on MongoDB version and storage engine.

DBA INVESTIGATION

1. Establish election timeline.

2. Identify old and new primary.

3. Check network/host failure.

4. Check write concern used by affected applications.

5. Review rollback-related logs.

6. Identify whether applications observed failed or acknowledged writes.

7. Determine business impact.

WRITE CONCERN

A write acknowledged only by the old primary has a different durability guarantee from a write acknowledged according to majority write concern.

This is why write concern matters in failover analysis.

DO NOT

• force the old primary back to primary
• copy its divergent files over healthy nodes
• manually manipulate oplog records
• assume rollback automatically equals data loss incident without understanding acknowledgment semantics.

APPLICATION REVIEW

If business-critical writes were involved, application teams may need to reconcile transactions using business logs or upstream systems.`,

      internalWorking: `History A:

x1 -> x2 -> x3 -> old-primary-only-write

History B:

x1 -> x2 -> x3 -> new-primary-write

Returning old primary must
align to authoritative history.`,

      architecture: `             NETWORK SPLIT

        Old P          S1 ---- S2
          |              \    /
      divergent            vote
       writes                |
                             v
                          New P

Network returns
     |
rollback/reconciliation
     |
old P rejoins`,

      examples: [
        'A write acknowledged only by a primary before failover may have different durability guarantees from a majority-acknowledged write.',
        'Rollback messages should be correlated with the election and network timeline.',
        'A returning former primary should normally rejoin according to replica-set state rather than being forced back to primary.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows current replica-set states and election-related information.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Helps review voting and member configuration when investigating election behavior.'
        }
      ],

      productionScenario: `A network partition isolates the current primary from the other two voting members.

The majority side elects a new primary.

The isolated node had briefly accepted writes before it recognized that it could no longer remain primary.

When connectivity returns, that node enters rollback/recovery behavior so its history matches the majority branch.

The DBA investigates affected application acknowledgments and write concern rather than treating the old node as the authoritative source.`,

      troubleshootingApproach: `1. Build election timeline.

2. Identify old and new primary.

3. Review member logs.

4. Identify rollback interval.

5. Review application write errors.

6. Review write concern.

7. Determine whether business transactions require reconciliation.

8. Verify returning node rejoins safely.

9. Monitor replication.

10. Investigate original network/host event.

11. Complete RCA.`,

      commonMistakes: [
        'Forcing the old primary back to primary.',
        'Assuming the old primary contains the correct authoritative history.',
        'Ignoring write concern.',
        'Treating rollback as storage corruption.',
        'Ignoring application-level reconciliation.'
      ],

      bestPractices: [
        'Use appropriate write concern for durability requirements.',
        'Monitor elections and network events.',
        'Understand rollback semantics.',
        'Preserve logs for incident analysis.',
        'Validate business impact separately from cluster recovery.'
      ],

      interviewAnswer: `Rollback occurs when a former primary rejoins and its local history diverges from the replica set's current authoritative branch. MongoDB reconciles the returning member so it matches the majority history.

I investigate the election and network timeline, rollback logs, application errors and write concern. I do not force the old primary back into authority or manually manipulate its oplog. I also determine whether any business transactions require application-level reconciliation.`,

      keyTakeaways: [
        'Rollback is replication-history reconciliation.',
        'Network partitions and elections can create divergent branches.',
        'Write concern affects durability guarantees.',
        'Do not force the old primary back.',
        'Business reconciliation may still be required.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 12,
    question:
      'A MongoDB initial sync repeatedly fails or restarts. How would an L3 DBA troubleshoot the problem before attempting another resynchronization?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Initial sync creates a fresh replica-set member from a current source.

If it repeatedly fails, simply restarting it again is not enough.

The DBA must determine which phase or resource is failing.`,

      coreConcept: `INITIAL SYNC
     |
     +--> clone data
     +--> build/copy indexes
     +--> oplog catch-up
     |
failure
     |
     +--> network?
     +--> disk?
     +--> source pressure?
     +--> oplog window?
     +--> process restart?
     +--> config/security?
     |
     v
fix before retry`,

      detailedExplanation: `INITIAL SYNC NEEDS TIME AND RESOURCES

The target member must copy a large amount of data and then catch up with ongoing writes.

Important dependencies include:

• target disk capacity
• target storage performance
• network throughput
• source-member availability
• ongoing write rate
• sufficient oplog history
• stable process lifetime.

LOGS

Identify the exact stage where sync fails.

Look for:

• network interruption
• storage error
• process termination
• authentication/TLS failure
• source change
• insufficient disk
• oplog-related failure
• resource exhaustion.

DISK

Initial sync may fail if the target filesystem lacks enough capacity.

Do not estimate only from logical data size.

Indexes, storage overhead and growth during synchronization matter.

NETWORK

A 1 TB copy across a slow or unstable link can take many hours.

NETWORK STABILITY

Intermittent disconnections can repeatedly disrupt synchronization.

SOURCE MEMBER

The sync source itself must remain healthy and capable of serving synchronization traffic.

OPLOG WINDOW

The member must eventually catch up to current data while writes continue.

High write volume can make recovery difficult if the available history/synchronization conditions are inadequate.

REBOOTS

If a target server is rebooted during initial sync, behavior depends on MongoDB version and the exact sync phase.

Do not assume the process can always resume from exactly where it stopped.

CONFIGURATION

Check:

• replica-set name
• networking
• authentication
• TLS
• version compatibility.

Repeatedly deleting the dbPath and trying again without understanding the failure wastes time and can create more production load.`,

      internalWorking: `Source
   |
bulk data copy
   |
Target
   |
oplog catch-up
   |
SECONDARY

Failure anywhere
must be diagnosed
before another attempt.`,

      architecture: `          PRIMARY / SYNC SOURCE
                    |
              data transfer
                    |
                    v
                 TARGET
              /          \
           storage       network
              |
         initial sync
              |
          SECONDARY`,

      examples: [
        'A large initial sync may fail repeatedly because the target disk is nearly full.',
        'A slow WAN path can make synchronization so long that workload growth becomes difficult to catch up with.',
        'A restart during sync should be investigated from logs rather than assuming MongoDB simply continues from the same percentage.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows member state and initial-sync-related status where exposed.'
        },
        {
          command:
            'df -h',
          explanation:
            'Checks target filesystem capacity.'
        },
        {
          command:
            'tail -n 300 <mongod-log-path>',
          explanation:
            'Reviews recent initial-sync errors and stage transitions.'
        }
      ],

      productionScenario: `A 1.4 TB secondary repeatedly fails during initial sync.

The DBA sees that every attempt stops after many hours.

Logs and OS metrics show the target filesystem has almost no remaining headroom and storage latency rises dramatically near failure.

The target storage is expanded and performance validated before the sync is retried.

The next initial sync completes successfully.`,

      troubleshootingApproach: `1. Capture exact failure timestamp.

2. Identify sync phase.

3. Read MongoDB logs.

4. Check target disk capacity.

5. Check storage latency.

6. Check network stability and throughput.

7. Check source-member health.

8. Check ongoing write rate.

9. Check oplog conditions.

10. Check process/OS restart history.

11. Check authentication/TLS/config.

12. Correct root cause.

13. Retry once environment is stable.

14. Monitor source and target throughout sync.`,

      commonMistakes: [
        'Restarting initial sync repeatedly without reading logs.',
        'Sizing target disk from logical data size only.',
        'Ignoring network throughput.',
        'Ignoring source impact.',
        'Assuming initial sync always resumes exactly from its previous percentage.'
      ],

      bestPractices: [
        'Capacity-plan initial sync.',
        'Use stable high-throughput networking.',
        'Monitor target storage.',
        'Monitor source load.',
        'Investigate exact failure stage.'
      ],

      interviewAnswer: `If initial sync repeatedly fails, I first identify the exact phase and error from the member logs. I check target storage capacity and latency, network stability, source-member load, write rate, oplog conditions, process restarts and authentication/TLS configuration.

I do not simply keep deleting the target data and retrying. I fix the limiting resource or configuration first, then rerun the sync under monitored conditions.`,

      keyTakeaways: [
        'Initial sync is resource intensive.',
        'Find the failing stage.',
        'Disk and network are critical.',
        'Source health matters.',
        'Do not retry blindly.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 13,
    question:
      'MongoDB shows high WiredTiger cache pressure, heavy eviction activity, and increased disk I/O. How would an L3 DBA determine whether the real problem is memory, workload, or storage?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `WiredTiger cache pressure often means the workload is demanding more active data than can remain conveniently in cache.

But that does not automatically mean:

increase cache size.

The DBA must understand:

• working set
• query behavior
• eviction
• storage latency
• memory availability.`,

      coreConcept: `WORKLOAD
   |
active pages
   |
WT cache
   |
eviction
   |
disk reads/writes

If pressure rises:
query?
working set?
memory?
storage?`,

      detailedExplanation: `WIREDTIGER CACHE

WiredTiger stores frequently accessed pages in its internal cache.

When pages must leave the cache to make room for others, eviction occurs.

Eviction itself is normal.

The concern is sustained pressure that correlates with latency or throughput degradation.

WORKING SET

If the active working set exceeds what memory can accommodate effectively, pages are repeatedly loaded from storage.

This can increase:

• read latency
• disk I/O
• eviction activity.

QUERY BEHAVIOR

A collection scan can read a large amount of data into cache and displace hotter pages.

Therefore cache pressure may be caused by an inefficient query rather than insufficient memory.

STORAGE

If the workload legitimately requires frequent page reads, slow storage can make cache misses much more expensive.

MEMORY

Check total system memory and competing processes.

Do not increase WiredTiger cache beyond safe system limits without understanding how much memory the OS and other processes require.

VERSION DEPENDENCE

Exact cache metrics, eviction statistics, ticketing behavior and default sizing differ across MongoDB releases.

Use the fields available in the deployed version.

L3 DECISION

Possible solutions include:

• query/index optimization
• more RAM
• faster storage
• reducing unnecessary scans
• workload distribution/scaling
• schema/data-lifecycle changes.

The correct fix depends on the bottleneck.`,

      internalWorking: `Query
  |
page needed
  |
cache hit? ---- yes ---> fast
  |
  no
  |
storage read
  |
cache insertion
  |
possible eviction
  |
more pressure`,

      architecture: `          APPLICATION
               |
             QUERY
               |
        WIREDTIGER CACHE
          /          \
       hits         misses
                      |
                    DISK
                      |
                 latency`,

      examples: [
        'A large unindexed scan can churn the cache even on a server with substantial RAM.',
        'A working set larger than available memory may make storage performance critical.',
        'Increasing cache too aggressively can reduce memory available to the operating system.'
      ],

      commands: [
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows cache-related WiredTiger statistics; exact field names vary by release.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<suspect-query>)',
          explanation:
            'Checks whether query inefficiency is driving excessive reads.'
        },
        {
          command:
            'vmstat 1',
          explanation:
            'Helps correlate memory, CPU and I/O activity on Linux.'
        }
      ],

      productionScenario: `WiredTiger eviction activity increases and application reads become slow.

The DBA initially considers adding RAM.

Query analysis discovers a new analytics request repeatedly scanning hundreds of GB.

The scan churns the cache and drives storage reads.

Fixing the query/workload removes most cache pressure without changing memory configuration.`,

      troubleshootingApproach: `1. Establish latency period.

2. Check cache metrics.

3. Check eviction trend.

4. Check cache-read/write pressure.

5. Check system memory.

6. Check swap.

7. Check storage latency.

8. Identify high-read operations.

9. Analyze query plans.

10. Estimate working-set behavior.

11. Compare with workload changes.

12. Decide whether optimization, RAM, storage or scaling is appropriate.

13. Validate after remediation.`,

      commonMistakes: [
        'Increasing WiredTiger cache automatically.',
        'Ignoring collection scans.',
        'Ignoring OS memory requirements.',
        'Treating eviction itself as abnormal.',
        'Ignoring storage latency.'
      ],

      bestPractices: [
        'Correlate cache with workload.',
        'Optimize scans first where appropriate.',
        'Monitor storage latency.',
        'Leave sufficient OS memory.',
        'Use version-specific WiredTiger metrics.'
      ],

      interviewAnswer: `For high WiredTiger cache pressure, I determine whether the workload's working set exceeds available cache, whether inefficient queries are churning pages and whether storage latency makes cache misses expensive.

I correlate WiredTiger cache and eviction metrics with query plans, system memory, swap and disk latency. The fix may be query optimization, more RAM, faster storage or scaling; I would not increase the cache blindly.`,

      keyTakeaways: [
        'Eviction is normal but sustained pressure can hurt performance.',
        'Queries can churn the cache.',
        'Working set matters.',
        'Storage determines cache-miss cost.',
        'Do not tune cache blindly.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 14,
    question:
      'A long-running MongoDB operation is blocking or degrading production. How would you decide whether to use killOp, and what risks must be considered?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `killOp is an operational control, not a performance-tuning strategy.

Before terminating an operation, the DBA must know:

• what it is
• who owns it
• why it is running
• whether it is safe to interrupt
• whether the application will simply retry it.`,

      coreConcept: `Long operation
     |
identify
     |
business purpose?
     |
impact?
     |
safe to interrupt?
     |
     +--> no -> monitor/escalate
     |
     +--> yes -> kill carefully
                   |
                   v
              monitor retry`,

      detailedExplanation: `IDENTIFY THE OPERATION

Use current-operation diagnostics to determine:

• operation type
• namespace
• client
• duration
• command/query shape
• waiting/active state.

DO NOT KILL BASED ONLY ON DURATION

A long operation can be legitimate.

Examples:

• index build
• large aggregation
• maintenance
• backup-related activity.

ASSESS IMPACT

Ask:

• Is it consuming CPU?
• Is it causing lock/contention?
• Is it saturating storage?
• Is it blocking critical transactions?
• Is it part of an approved change?

APPLICATION RETRIES

Killing an operation does not guarantee the workload disappears.

The application may immediately retry the same expensive request.

TRANSACTIONS

Interrupting an operation participating in a transaction can have application-level consequences.

INTERNAL OPERATIONS

Do not casually kill MongoDB internal replication or system operations.

KILLOP

MongoDB exposes operation interruption mechanisms such as db.killOp() / killOp command.

Exact privilege requirements and behavior vary by version and operation type.

ROOT CAUSE

After stopping an operation, investigate why it became problematic.

Possible causes:

• missing index
• unbounded request
• application bug
• unexpected report
• poor maintenance scheduling.`,

      internalWorking: `currentOp
   |
 identify opid
   |
 evaluate
   |
 killOp?
   |
   +--> operation interrupted
             |
       app may retry
             |
      root cause still exists`,

      architecture: `APPLICATION
     |
   request
     |
   mongod
     |
current operation
     |
     +--> normal
     |
     +--> harmful
             |
          killOp
             |
        application response`,

      examples: [
        'Killing a query may provide temporary relief but the application can immediately submit it again.',
        'A long-running index build should not be terminated merely because it has run for hours.',
        'An unbounded analytics aggregation affecting OLTP traffic may be a valid candidate for controlled interruption.'
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Lists active operations accessible to the current user.'
        },
        {
          command:
            'db.killOp(<opid>)',
          explanation:
            'Requests interruption of an operation. Use only after identifying the exact operation and understanding impact.'
        }
      ],

      productionScenario: `A reporting aggregation runs for a long time and saturates disk, causing customer-facing operations to slow dramatically.

The DBA confirms the aggregation is an ad-hoc report, identifies its opid and coordinates with the report owner.

The operation is terminated.

The DBA then analyzes the query and moves the workload to an appropriate design rather than relying on killOp as a recurring fix.`,

      troubleshootingApproach: `1. Identify active operations.

2. Identify exact opid.

3. Identify client/user.

4. Identify namespace/query.

5. Measure resource impact.

6. Determine business purpose.

7. Check whether it is internal/system work.

8. Coordinate owner where possible.

9. Decide whether interruption is safer than continuation.

10. Kill only the intended operation.

11. Monitor application retry.

12. Fix root cause.`,

      commonMistakes: [
        'Killing every long-running operation.',
        'Killing internal replication operations.',
        'Using killOp without identifying the client.',
        'Ignoring automatic retries.',
        'Treating killOp as permanent remediation.'
      ],

      bestPractices: [
        'Identify before interrupting.',
        'Coordinate business impact.',
        'Use least-disruptive mitigation.',
        'Monitor retry behavior.',
        'Correct the underlying workload.'
      ],

      interviewAnswer: `I use killOp only after identifying the exact operation, its owner, workload purpose and production impact. Duration alone is not enough.

If the operation is causing severe resource contention and interruption is safer than allowing it to continue, I can terminate it using the supported operation-control mechanism. I then monitor whether the application retries it and fix the underlying query or workload issue.`,

      keyTakeaways: [
        'killOp is not routine tuning.',
        'Duration alone is insufficient.',
        'Do not kill internal operations casually.',
        'Applications may retry.',
        'Fix the root cause afterward.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 15,
    question:
      'A replica set loses majority and no primary is available. How should an L3 DBA troubleshoot and recover the environment without creating split-brain or data-loss risk?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `A replica set requires the appropriate voting majority to elect and maintain a primary.

If majority is lost, the absence of a primary is a safety behavior.

The DBA should restore enough healthy voting members rather than immediately forcing a new primary.`,

      coreConcept: `5 voting members

Need majority = 3

Only 2 reachable
    |
no majority
    |
no primary

Correct response:
restore member/network

Dangerous response:
force topology without understanding data`,

      detailedExplanation: `STEP 1 — MAP TOPOLOGY

Identify:

• configured members
• votes
• current reachable members
• member states
• network partitions.

STEP 2 — DETERMINE WHY MAJORITY IS LOST

Possible causes:

• multiple server failures
• network partition
• data-center outage
• firewall/routing change
• simultaneous maintenance.

STEP 3 — IDENTIFY AUTHORITATIVE DATA

Determine which members have the most current known history.

Do not assume the node that was previously primary should automatically be authoritative after a partition.

STEP 4 — RESTORE CONNECTIVITY

The safest normal recovery is to restore communication or enough failed voting members so majority exists again.

STEP 5 — AVOID FORCE RECONFIG

Forced reconfiguration is an exceptional recovery tool with serious consequences.

It can create divergence or loss if used against a partitioned cluster where other members may still be active.

Use it only when the documented conditions for disaster recovery are fully understood.

STEP 6 — APPLICATION

During loss of primary:

• writes requiring a primary cannot proceed normally
• some reads may still be possible depending on application read preference and topology.

STEP 7 — RECOVERY VALIDATION

Once majority returns:

• confirm election
• check member states
• check replication
• investigate divergent history/rollback if applicable.

STEP 8 — RCA

Determine why failure tolerance was exceeded.

Examples:

• maintenance removed too many voters
• network architecture created correlated failure
• insufficient DR design.`,

      internalWorking: `Majority available?
      |
   +--+--+
   |     |
  yes    no
   |     |
elect   no primary
primary
         |
 restore voters/
 connectivity`,

      architecture: `5-member example

DC1:
P
S

DC2:
S
S

Other:
S

If network split leaves
only 2 voters together:

no safe majority.`,

      examples: [
        'A three-voting-member replica set with two unavailable members cannot elect a primary.',
        'Force reconfig should not be the first response to a temporary network partition.',
        'Restoring network connectivity may recover the set without topology changes.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Inspect reachable member states and replica-set health.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Review votes, priorities and configured members.'
        }
      ],

      productionScenario: `A three-member replica set spans multiple network zones.

Two members become unreachable because of a routing failure.

The remaining member cannot maintain majority and steps down.

Instead of forcing it into a one-node configuration, the DBA works with the network team to restore connectivity.

Once a second voter returns, the replica set can safely elect a primary.`,

      troubleshootingApproach: `1. Determine configured voting members.

2. Determine reachable members.

3. Calculate majority requirement.

4. Check network paths.

5. Check failed hosts.

6. Review recent maintenance.

7. Identify most current member histories.

8. Restore normal majority where possible.

9. Avoid force reconfig unless true disaster conditions justify it.

10. Verify election.

11. Check rollback/divergence.

12. Validate application.

13. Complete RCA.`,

      commonMistakes: [
        'Forcing a one-node replica set during a temporary partition.',
        'Ignoring the possibility that other members are still active elsewhere.',
        'Reconfiguring before checking votes.',
        'Promoting stale data.',
        'Treating no-primary state as a MongoDB defect rather than a safety mechanism.'
      ],

      bestPractices: [
        'Design failure domains carefully.',
        'Know voting topology.',
        'Restore majority instead of bypassing it.',
        'Use force reconfiguration only for documented disaster scenarios.',
        'Test loss-of-majority procedures.'
      ],

      interviewAnswer: `If a replica set loses majority, the lack of a primary is a safety mechanism. I map the voting topology, determine which members are reachable and identify whether the cause is server failure or network partition.

My first goal is restoring enough healthy voters or connectivity to regain majority. I avoid force reconfiguration unless this is a true disaster-recovery situation and I fully understand the possibility of divergent histories and data loss.`,

      keyTakeaways: [
        'Majority protects consistency.',
        'No primary can be expected when majority is lost.',
        'Restore voters/connectivity first.',
        'Force reconfig is exceptional.',
        'Avoid split-brain recovery actions.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 16,
    question:
      'A sharded MongoDB production environment becomes slow and one shard is overloaded while others are lightly used. How would you investigate the problem at L3 level?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `A sharded cluster can have plenty of total capacity and still perform badly if workload is distributed unevenly.

One hot shard may indicate:

• poor shard-key distribution
• hot value/range
• targeting problem
• jumbo/large range issue
• workload skew
• balancing limitations.`,

      coreConcept: `Application
    |
 mongos
    |
 shard targeting
   /   |   \
 S1   S2   S3

If most operations hit S1:

S1 = hot
S2 = idle
S3 = idle

Total cluster capacity
is not being used evenly.`,

      detailedExplanation: `STEP 1 — IDENTIFY HOT SHARD

Compare:

• CPU
• disk latency
• operation rates
• connections
• data distribution.

STEP 2 — QUERY TARGETING

Determine whether common queries include the shard key or otherwise allow efficient targeting.

Queries without appropriate shard-key targeting can become scatter-gather operations.

STEP 3 — SHARD KEY

Review:

• cardinality
• frequency
• monotonic behavior
• distribution
• hot values.

STEP 4 — DATA DISTRIBUTION

Check whether one shard stores materially more data or ranges than others.

STEP 5 — BALANCER

Review whether balancing is active, blocked, or constrained.

Exact balancing behavior and commands depend on MongoDB version.

STEP 6 — HOT RANGE

Even if overall data volume appears balanced, current writes may target one range.

Example:

monotonically increasing key

can concentrate new inserts at one end of the key space depending on shard-key design.

STEP 7 — APPLICATION

A tenant-heavy workload can create a hot shard if one tenant dominates traffic and the shard key routes it to one location.

STEP 8 — MITIGATION

Possible solutions depend on root cause:

• query targeting
• shard-key redesign/refinement where supported
• resharding
• workload isolation
• capacity adjustments.

Do not simply add more shards without understanding whether the workload can use them.`,

      internalWorking: `Shard key
   |
maps document/query
   |
chunk/range
   |
shard

Poor distribution
   |
hot shard
   |
cluster-wide latency`,

      architecture: `             MONGOS
           /      |      \
         S1       S2      S3
        90%       5%      5%

Question:
Why does routing/data
favor S1?`,

      examples: [
        'A high-cardinality shard key can still create hot workload if application traffic is skewed toward one value range.',
        'A query without effective targeting may contact many shards.',
        'Adding shards does little if all new writes continue routing to the same hot range.'
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Provides high-level sharding metadata and distribution information in supported shell environments.'
        },
        {
          command:
            'db.collection.getShardDistribution()',
          explanation:
            'A shell helper available in some environments/versions for distribution inspection; exact availability and output vary.'
        }
      ],

      productionScenario: `A four-shard production cluster has one shard at 95% CPU while the others remain below 30%.

The DBA finds that most current writes contain monotonically increasing shard-key values that target the same active range.

Adding another shard would not automatically remove the hotspot.

The shard-key/workload design is reviewed and a supported redistribution strategy is planned.`,

      troubleshootingApproach: `1. Identify hot shard.

2. Compare resource metrics across shards.

3. Compare data distribution.

4. Analyze dominant query shapes.

5. Check shard targeting.

6. Review shard-key cardinality/distribution.

7. Check hot values/ranges.

8. Check balancer activity.

9. Check application workload skew.

10. Determine whether query tuning, balancing, resharding or scaling is appropriate.

11. Validate distribution after remediation.`,

      commonMistakes: [
        'Adding shards immediately.',
        'Looking only at total cluster CPU.',
        'Ignoring query targeting.',
        'Assuming balanced data means balanced workload.',
        'Treating balancer as a solution to every hot-shard problem.'
      ],

      bestPractices: [
        'Design shard key from workload.',
        'Monitor per-shard metrics.',
        'Track both data and traffic distribution.',
        'Avoid scatter-gather where possible.',
        'Validate routing with representative queries.'
      ],

      interviewAnswer: `If one shard is overloaded, I compare per-shard CPU, disk, operations and data distribution, then analyze query targeting and the shard key.

I determine whether the issue is data imbalance, hot key/range behavior, scatter-gather queries or workload skew. I would not simply add shards because extra capacity is useless if routing still concentrates the workload on the same shard.`,

      keyTakeaways: [
        'Sharded capacity must be usable by the workload.',
        'Data balance and workload balance are different.',
        'Shard targeting matters.',
        'Hot ranges can dominate one shard.',
        'Adding shards is not always the fix.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 17,
    question:
      'A mongorestore or backup recovery fails repeatedly on a large production dataset. How would you perform an L3 investigation without assuming the backup itself is corrupt?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `A restore failure can come from several layers:

• backup data
• Database Tools
• MongoDB server version
• target resources
• network
• authentication
• storage
• command options.

Do not declare the backup corrupt until evidence supports it.`,

      coreConcept: `RESTORE FAILURE
      |
      +--> dump valid?
      +--> tool version?
      +--> target version?
      +--> disk?
      +--> memory?
      +--> network?
      +--> auth?
      +--> BSON/document issue?
      +--> tool bug?
      |
      v
reproduce + isolate`,

      detailedExplanation: `STEP 1 — CAPTURE EXACT FAILURE

Record:

• exact percentage/time
• collection
• error message
• tool version
• server version.

Repeated failure at roughly the same point can be valuable evidence.

STEP 2 — DATABASE TOOLS VERSION

MongoDB Database Tools are versioned independently from the server.

Verify the exact mongorestore version.

Review known issues for that tool release where appropriate.

STEP 3 — TARGET SERVER

Check:

• MongoDB version
• disk capacity
• storage latency
• CPU
• memory
• logs.

STEP 4 — BACKUP CONTENT

Determine whether failure is isolated to:

• one collection
• one BSON file
• one index restore
• one metadata operation.

STEP 5 — DISK

Large restores can consume substantial storage and produce high write I/O.

STEP 6 — AUTH/TLS

Ensure long-running restore connections are not failing due to connectivity or certificate issues.

STEP 7 — REPRODUCIBILITY

If the restore fails at the same collection/record repeatedly, isolate that unit where possible.

If failure percentage shifts after a tool upgrade, that is evidence that the tool/runtime behavior may be involved.

STEP 8 — SOURCE VALIDATION

Use available BSON/database-tool capabilities to inspect or test the relevant dump where practical.

STEP 9 — TARGET TEST

A controlled restore into a test environment can help determine whether the problem is source dump versus production target constraints.

STEP 10 — DO NOT GUESS FROM OS ALONE

If restore consistently progresses deeply before failure, an unsupported OS might still be relevant in some cases, but evidence should come from tool/server compatibility and the actual error rather than assuming the OS is the root cause.`,

      internalWorking: `Dump
 |
mongorestore tool
 |
network
 |
target mongod
 |
storage

Failure can originate
at any layer.`,

      architecture: `BACKUP FILES
     |
MONGORESTORE
     |
DRIVER/NETWORK
     |
MONGOD
     |
WIREDTIGER
     |
DISK`,

      examples: [
        'A Database Tools bug can cause restore failures even when BSON data itself is valid.',
        'A target filesystem can fill during restore.',
        'Failure on one collection can be isolated instead of repeatedly restoring the entire dataset.'
      ],

      commands: [
        {
          command:
            'mongorestore --version',
          explanation:
            'Confirms the exact Database Tools version.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms target MongoDB server binary version.'
        },
        {
          command:
            'df -h',
          explanation:
            'Checks target capacity during restore.'
        }
      ],

      productionScenario: `A very large restore fails repeatedly after processing most of the dataset.

The DBA records the exact tool version and error and confirms target disk/memory remain healthy.

After moving to a newer Database Tools release containing relevant fixes, the failure moves past the previous point.

This indicates the tool layer was involved rather than automatically proving corruption in the backup.`,

      troubleshootingApproach: `1. Capture exact error.

2. Record tool version.

3. Record target MongoDB version.

4. Identify failing namespace/file.

5. Check disk.

6. Check CPU/memory.

7. Check target MongoDB logs.

8. Check network/auth/TLS.

9. Review tool compatibility and known issues.

10. Isolate the failing collection where possible.

11. Test restore in controlled environment.

12. Determine dump issue versus tool/target issue.

13. Re-run using supported corrective action.

14. Validate restored data.`,

      commonMistakes: [
        'Calling the backup corrupt without evidence.',
        'Ignoring Database Tools version.',
        'Running the same full restore repeatedly without isolating the failure.',
        'Ignoring target disk/storage.',
        'Assuming server and Database Tools share the same version lifecycle.'
      ],

      bestPractices: [
        'Record exact versions.',
        'Capture reproducible failure point.',
        'Validate target capacity.',
        'Test backups regularly.',
        'Keep restore procedures and compatible tools documented.'
      ],

      interviewAnswer: `For a repeated mongorestore failure, I capture the exact error, failing namespace or percentage, Database Tools version and target MongoDB version. I check target disk, storage, CPU, memory and logs and determine whether the issue is isolated to a particular collection or BSON file.

I also review tool compatibility and relevant known issues because Database Tools are independently versioned. I do not call the backup corrupt until I have isolated the failure to the backup content itself.`,

      keyTakeaways: [
        'Restore failures are multi-layer problems.',
        'Database Tools version matters.',
        'Exact failure point is useful evidence.',
        'Target resource pressure must be checked.',
        'Do not assume corruption prematurely.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 18,
    question:
      'After MongoDB or OS patching, one replica-set member does not return to SECONDARY. How would you troubleshoot the post-patching failure?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `Post-patching failure should be treated as:

What changed?

Potential changes include:

• mongod binary
• configuration
• OS libraries
• filesystem mounts
• service state
• permissions
• TLS files
• networking
• kernel/security settings.`,

      coreConcept: `PATCH
  |
REBOOT/START
  |
member unhealthy
  |
compare:
before vs after
  |
logs/config/version/
mount/network/security`,

      detailedExplanation: `STEP 1 — STOP ROLLING CHANGE

Do not patch the next replica-set member until the failed member is healthy.

STEP 2 — CHECK PROCESS

Is mongod:

• not running
• running but STARTUP2
• running but RECOVERING
• unable to connect to peers?

STEP 3 — CHECK LOGS

Review startup and replication messages.

STEP 4 — CHECK VERSION

Confirm the installed and running mongod version.

STEP 5 — CHECK CONFIG

Compare mongod.conf against the approved pre-change configuration.

STEP 6 — FILESYSTEM

Verify dbPath filesystem is actually mounted.

A reboot can expose mount problems.

STEP 7 — PERMISSIONS

Check service-account access to:

• dbPath
• logPath
• keyfile
• TLS certificate/private key.

STEP 8 — NETWORK

Check:

• member-to-member port
• DNS
• firewall
• routing.

STEP 9 — TLS/AUTH

If security files or crypto libraries changed, member authentication can fail even if the process starts.

STEP 10 — REPLICATION STATE

If the member was offline long enough, determine whether it remains within oplog history.

STEP 11 — RESOURCE HEALTH

Check storage latency, disk fullness and memory.

STEP 12 — RECOVERY

If the node cannot catch up because required history is gone, controlled resynchronization may be necessary.

Do not continue the patch rollout until redundancy is restored.`,

      internalWorking: `Before patch:
P S S healthy

Patch S1
   |
S1 fails
   |
STOP
   |
investigate S1
   |
recover S1
   |
only then continue`,

      architecture: `             PRIMARY
             /     \
          S-good   S-patched
                     |
                  problem
              /      |      \
           service network storage`,

      examples: [
        'A missing dbPath mount can prevent proper startup after reboot.',
        'A certificate file permission change can break internal authentication.',
        'A member offline beyond oplog history may require initial sync even after the patch itself is fixed.'
      ],

      commands: [
        {
          command:
            'systemctl status mongod',
          explanation:
            'Checks service state where systemd is used.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Shows member state from a healthy replica-set member.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms installed executable version.'
        },
        {
          command:
            'df -h',
          explanation:
            'Checks filesystems after reboot.'
        }
      ],

      productionScenario: `A Secondary is patched and rebooted but never returns to the replica set.

The process is running.

MongoDB logs show authentication failures to peer members.

The DBA discovers that the internal authentication keyfile permissions changed during server maintenance.

Permissions are restored correctly, the member rejoins and catches up.

Only after that does the rolling patch continue.`,

      troubleshootingApproach: `1. Stop rollout.

2. Check member/process state.

3. Review MongoDB logs.

4. Confirm binary version.

5. Compare configuration.

6. Verify filesystems.

7. Verify permissions.

8. Verify network/DNS.

9. Verify TLS/keyfile/auth.

10. Check lag/oplog window.

11. Check resource health.

12. Recover member.

13. Verify SECONDARY/catch-up.

14. Continue only after full validation.`,

      commonMistakes: [
        'Continuing to patch other members.',
        'Assuming reboot success means MongoDB success.',
        'Ignoring mounts.',
        'Ignoring keyfile/TLS permissions.',
        'Reconfiguring the replica set before fixing the actual post-patch issue.'
      ],

      bestPractices: [
        'Patch one member at a time.',
        'Capture pre-change configuration.',
        'Validate mounts and security files after reboot.',
        'Require full catch-up before continuing.',
        'Use clear stop criteria.'
      ],

      interviewAnswer: `If a member does not return after patching, I stop the rolling change. I determine whether mongod is down or running in an unhealthy state, then review startup/replication logs, actual binary version, configuration, mounts, permissions, networking, TLS/internal authentication and resource health.

If it was offline beyond available oplog history, I evaluate supported resynchronization. I only continue patching once redundancy is fully restored.`,

      keyTakeaways: [
        'Stop the rollout after unexpected failure.',
        'Compare before and after.',
        'Mounts and permissions are common post-reboot issues.',
        'Check oplog history.',
        'Restore redundancy before continuing.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 19,
    question:
      'MongoDB production simultaneously shows high CPU, high disk latency, increasing connections, slow queries, and replication lag. How would an L3 DBA determine the real root cause instead of treating five separate incidents?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `Many production alerts can be different consequences of one original event.

The L3 job is to identify the sequence.

Example:

bad query
→ large scans
→ CPU + disk pressure
→ query latency
→ application timeouts
→ retries
→ more connections
→ replication lag.

The five alerts are one causal chain.`,

      coreConcept: `TRIGGER
  |
  v
resource pressure
  |
  v
latency
  |
  v
application retries
  |
  v
connection growth
  |
  v
replication lag

Find first abnormal event.`,

      detailedExplanation: `STEP 1 — COMMON TIMELINE

Put all metrics on the same timeline:

• CPU
• storage latency
• query latency
• connections
• replication lag
• application errors
• deployments
• batch jobs.

STEP 2 — FIND THE FIRST CHANGE

The earliest meaningful abnormal event is often closer to the root cause.

Example:

19:01 new application release
19:03 slow query volume increases
19:04 CPU rises
19:05 disk latency rises
19:07 application timeouts
19:08 connections spike
19:10 replication lag.

STEP 3 — QUERY ANALYSIS

Identify expensive operations.

STEP 4 — APPLICATION BEHAVIOR

Determine whether timeouts cause retries.

STEP 5 — STORAGE

Check whether storage was already degraded before query pressure.

If storage latency rose first, the chain may instead be:

storage problem
→ slow queries
→ app retries
→ connection increase
→ CPU overhead
→ lag.

STEP 6 — REPLICATION

Determine whether lag is a cause or consequence.

STEP 7 — CONTROLLED MITIGATION

Choose the earliest controllable root/cause contributor.

Examples:

• rollback bad release
• stop heavy batch
• correct storage issue
• reduce retry storm.

STEP 8 — AVOID FIVE CHANGES

If you simultaneously:

restart secondary
add index
scale CPU
raise connections
change cache

you may not know which change helped and can create new risk.`,

      internalWorking: `Alerts:
CPU
disk
connections
slow query
lag

        |
        v
Sort by time
        |
        v
Find first trigger
        |
        v
Build dependency chain`,

      architecture: `APPLICATION
     |
  workload
     |
  QUERY
   /  \
 CPU  DISK
   \  /
 latency
   |
 retries
   |
 connections
   |
 replication impact`,

      examples: [
        'Replication lag may appear last and therefore be a symptom of primary/storage pressure.',
        'A storage incident may be the first event and cause every later database symptom.',
        'Application retries can amplify a small database slowdown into a much larger incident.'
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Identifies active workload.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server metrics for correlation with external monitoring.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Shows replication state.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<suspect-query>)',
          explanation:
            'Validates suspected query inefficiency.'
        }
      ],

      productionScenario: `At 22:00 several alerts fire:

CPU 95%
disk latency high
connections doubled
slow-query alerts
secondary lag.

The DBA correlates them and sees that a new batch job started first.

It performs a large unindexed aggregation.

The aggregation saturates CPU and storage.

Application requests then time out and retry, increasing connections.

Replication falls behind because storage is overloaded.

Stopping the batch stabilizes every metric.

The DBA then fixes the report design before it runs again.`,

      troubleshootingApproach: `1. Build one timeline.

2. Mark application changes.

3. Mark batch/maintenance events.

4. Identify first abnormal metric.

5. Inspect active operations.

6. Analyze slow-query shapes.

7. Check CPU.

8. Check disk latency.

9. Check connection/retry behavior.

10. Check replication.

11. Build causal chain.

12. Apply lowest-risk mitigation at the earliest controllable cause.

13. Validate all metrics.

14. Perform RCA.`,

      commonMistakes: [
        'Opening five separate incidents for one causal chain.',
        'Changing many settings simultaneously.',
        'Assuming replication lag is root cause because it is severe.',
        'Ignoring retry amplification.',
        'Ignoring metric ordering.'
      ],

      bestPractices: [
        'Use a unified timeline.',
        'Find the first abnormal event.',
        'Distinguish cause from downstream effects.',
        'Mitigate the earliest controllable cause.',
        'Validate every downstream symptom afterward.'
      ],

      interviewAnswer: `When CPU, disk latency, connections, slow queries and replication lag rise together, I build a single timeline rather than treating them independently.

I identify which metric or workload changed first and then build the causal chain. For example, a bad query may drive CPU and disk pressure, causing timeouts and retries, which increase connections and eventually create replication lag. I mitigate the earliest controllable cause and validate that the downstream symptoms recover.`,

      keyTakeaways: [
        'Multiple alerts may have one cause.',
        'Timeline order matters.',
        'Application retries amplify incidents.',
        'Replication lag can be downstream.',
        'Avoid simultaneous random changes.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'production_troubleshooting_l3',
    topicId: 'production-troubleshooting-l3',
    topicNumber: 20,
    topicName: 'Production Troubleshooting & L3 Scenarios',
    questionNumber: 20,
    question:
      'You are leading a MongoDB production war room: the Primary restarted unexpectedly, a Secondary is 3,000 seconds behind, disk is at 96%, application latency is severe, connections are climbing, and management wants immediate recovery. How would you lead the incident end to end?',
    level: 'L3+',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `This scenario tests senior DBA judgment.

The goal is not:

fix every alert immediately.

The goal is:

protect data
→ preserve availability
→ stop deterioration
→ establish cause
→ recover safely
→ validate
→ communicate clearly.`,

      coreConcept: `WAR ROOM
   |
1. Establish ownership
   |
2. Protect topology
   |
3. Assess disk risk
   |
4. Stabilize workload
   |
5. Assess replication
   |
6. Investigate restart
   |
7. Recover redundancy
   |
8. Validate application
   |
9. RCA`,

      detailedExplanation: `PHASE 1 — INCIDENT COMMAND

Establish:

• incident lead
• DBA owner
• application owner
• OS/cloud owner
• communication channel
• decision log.

Avoid many engineers independently changing production.

PHASE 2 — DETERMINE CURRENT TOPOLOGY

Immediately establish:

• current primary
• healthy members
• voting majority
• secondary states.

Do not restart another healthy member.

PHASE 3 — PROTECT DATA

Avoid:

• forced reconfiguration
• forced promotions
• manual dbPath deletion
• random shutdowns.

PHASE 4 — DISK EMERGENCY

At 96%, calculate:

• free GB
• growth per minute/hour
• estimated time to exhaustion.

Identify whether growth comes from:

• data
• indexes
• logs
• backup/dump files
• temp files
• runaway workload.

If infrastructure supports safe expansion, coordinate it urgently.

Remove only verified disposable files.

PHASE 5 — APPLICATION LOAD

Connections are climbing and latency is severe.

Determine whether:

• traffic increased
• retries are multiplying
• a deployment/batch began
• connection pool behavior changed.

Coordinate throttling or rollback of non-critical harmful workload if supported by incident procedure.

PHASE 6 — REPLICATION

Secondary lag = 3,000 seconds.

Check:

• member state
• current oplog window
• lag trend
• disk/network on that member.

If it remains within the oplog window, it may recover after pressure is reduced.

Do not start initial sync unnecessarily during an active capacity incident.

PHASE 7 — PRIMARY RESTART

Determine why the Primary restarted.

Correlate:

• mongod logs
• OS reboot/service logs
• cloud events
• OOM evidence
• maintenance/automation.

Do not assume the restart caused every other symptom.

It may itself have been a consequence of the same resource incident.

PHASE 8 — FIND CAUSAL CHAIN

Possible chain:

runaway application release
→ massive write/query load
→ disk growth
→ storage latency
→ application timeouts/retries
→ connection growth
→ secondary lag
→ host/service instability.

Or:

storage failure
→ query latency
→ retries
→ connection storm
→ lag
→ service restart.

Use timeline evidence to determine direction.

PHASE 9 — MITIGATION

Prioritize actions that:

• prevent disk exhaustion
• stop harmful workload
• preserve majority
• stabilize Primary
• allow Secondary to catch up.

PHASE 10 — VALIDATION

Do not declare recovery until:

• Primary stable
• expected Secondaries healthy
• lag normalizing
• disk stable
• connection count normalizing
• application latency restored
• errors stopped
• backups/monitoring healthy.

PHASE 11 — COMMUNICATION

Management needs:

• impact
• current state
• actions
• risks
• next decision point.

Do not provide unsupported root-cause statements during the incident.

PHASE 12 — RCA

After stabilization document:

• trigger
• timeline
• root cause
• contributing factors
• business impact
• recovery
• prevention.

Possible prevention:

• earlier disk forecasting
• better retry control
• query release testing
• adequate oplog window
• patch/reboot controls
• stronger alerts
• incident stop criteria.`,

      internalWorking: `             INCIDENT
                 |
        +--------+--------+
        |                 |
     DATA SAFETY       AVAILABILITY
        |                 |
        +--------+--------+
                 |
              CAPACITY
                 |
              WORKLOAD
                 |
             REPLICATION
                 |
            ROOT CAUSE
                 |
              RECOVERY
                 |
             VALIDATION`,

      architecture: `                   APPLICATION
                     |
               retries/load
                     |
                     v
                  PRIMARY
               /         \
              /           \
      lagging SECONDARY   SECONDARY
              |
             disk

Meanwhile:
96% filesystem
+
Primary restart

Incident leader correlates
all layers before making changes.`,

      examples: [
        'If disk will be exhausted in 15 minutes, capacity stabilization may be more urgent than investigating every query.',
        'If the lagging Secondary is still within the oplog window, allowing it to catch up after resource pressure drops may be safer than immediately rebuilding it.',
        'If application retries are amplifying load, reducing retry pressure can help both connections and database resources.',
        'Management urgency does not justify unsafe force reconfiguration.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Establish current topology and member health.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Assess oplog coverage where available.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Assess current secondary lag where available.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect active workload when authorized.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Inspect server-level behavior and correlate with monitoring.'
        },
        {
          command:
            'df -h',
          explanation:
            'Assess filesystem utilization immediately.'
        }
      ],

      productionScenario: `A production incident begins with severe latency.

The Primary restarts, one Secondary falls 3,000 seconds behind, disk reaches 96% and applications begin creating more connections.

The DBA takes incident control and stops further planned changes.

Topology still has a healthy majority.

Disk analysis shows a rapidly growing bulk-import workload and application retry storm.

The bulk import is paused through the approved incident process and storage is expanded.

CPU and disk latency begin falling.

Connection count stabilizes.

The lagging Secondary remains within the oplog window and catches up naturally.

The DBA then investigates the Primary restart from OS and MongoDB logs and discovers that resource exhaustion triggered the service interruption.

The incident is closed only after application latency, replication, storage, backups and monitoring are validated.`,

      troubleshootingApproach: `1. Establish incident command.

2. Record exact timeline.

3. Check current Primary.

4. Confirm voting majority.

5. Protect healthy members.

6. Measure disk exhaustion time.

7. Identify disk growth source.

8. Expand capacity or safely remove verified disposable files.

9. Check application traffic/retries.

10. Stop or throttle harmful non-critical workload through approved process.

11. Check current operations.

12. Check slow-query workload.

13. Check connection behavior.

14. Check lag and oplog window.

15. Allow safe catch-up if possible.

16. Investigate Primary restart separately.

17. Check OS/cloud evidence.

18. Build causal chain.

19. Validate topology.

20. Validate application.

21. Validate disk.

22. Validate backup/monitoring.

23. Communicate status.

24. Complete RCA and prevention plan.`,

      commonMistakes: [
        'Restarting additional members during degraded redundancy.',
        'Running force reconfiguration because management wants immediate action.',
        'Deleting WiredTiger files to create space.',
        'Starting initial sync before determining whether natural catch-up is possible.',
        'Ignoring application retries.',
        'Making several unrelated changes at once.',
        'Announcing root cause before evidence exists.'
      ],

      bestPractices: [
        'Protect data before speed.',
        'Use clear incident ownership.',
        'Prioritize imminent risks.',
        'Preserve majority.',
        'Control workload amplification.',
        'Use oplog window to guide replication recovery.',
        'Communicate facts separately from hypotheses.',
        'Validate the entire service before closure.'
      ],

      interviewAnswer: `In a multi-layer production incident I first establish incident ownership and protect the surviving replica-set majority. I determine whether disk exhaustion poses the most immediate availability risk and stabilize storage without touching MongoDB internal files.

I correlate application traffic, retries, current operations, CPU, storage and connections, while separately checking the lagging Secondary against the available oplog window. If it can safely catch up, I avoid unnecessary initial sync.

I investigate the Primary restart using MongoDB, OS and infrastructure evidence and build one causal timeline rather than treating every alert as independent.

My recovery is complete only when the Primary is stable, redundancy is restored, replication lag is healthy, disk growth is controlled, application latency and connections have normalized, and backup and monitoring are confirmed. Then I complete an evidence-based RCA and preventive action plan.`,

      keyTakeaways: [
        'Incident leadership is part of L3 DBA work.',
        'Protect majority and data first.',
        'Prioritize imminent disk exhaustion.',
        'Application retries can amplify incidents.',
        'Lag must be compared with oplog window.',
        'Do not use dangerous shortcuts under management pressure.',
        'One causal timeline is more useful than many isolated alerts.',
        'Recovery requires end-to-end validation.'
      ]
    }
  }

];

/* =========================================================
   SEED FUNCTION
========================================================= */

async function seedProductionTroubleshootingL3() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'production_troubleshooting_l3'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous production_troubleshooting_l3 documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Production Troubleshooting & L3 Scenarios questions`
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
        category: 'production_troubleshooting_l3'
      });

    console.log(
      `Topic 20 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 20 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 20 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 20 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedProductionTroubleshootingL3();
