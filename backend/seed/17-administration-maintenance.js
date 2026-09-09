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
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 1,
    question:
      'What are the core day-to-day responsibilities of a MongoDB DBA in production, and how should routine administration differ from incident response?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `MongoDB administration means keeping the database environment:

• available
• healthy
• secure
• recoverable
• performant
• maintainable.

Routine administration is proactive.

Incident response is reactive.

A strong DBA spends more time preventing incidents than repeatedly firefighting them.`,

      coreConcept: `Routine DBA work:

Monitor
  |
Maintain
  |
Validate
  |
Patch
  |
Backup
  |
Capacity plan

Incident response:

Detect
  |
Diagnose
  |
Stabilize
  |
Recover
  |
RCA`,

      detailedExplanation: `Production MongoDB administration usually includes several major responsibilities.

1. AVAILABILITY

Monitor:

• replica-set health
• elections
• replication lag
• member state
• sharded-cluster component health.

2. BACKUPS

Ensure:

• backups succeed
• retention is correct
• backups are protected
• restore tests are performed.

3. CAPACITY

Track:

• disk utilization
• memory pressure
• CPU
• storage throughput
• oplog window
• connection growth
• dataset growth.

4. PERFORMANCE

Review:

• slow operations
• query efficiency
• index usage
• storage latency
• cache behavior.

5. SECURITY

Maintain:

• users
• roles
• certificates
• credentials
• access reviews
• network restrictions.

6. PATCHING

Plan:

• MongoDB maintenance releases
• Database Tools updates
• OS maintenance
• certificate rotation
• dependency updates.

7. HOUSEKEEPING

Review:

• obsolete indexes
• expired data
• logs
• backup retention
• abandoned users
• unused environments.

8. CHANGE MANAGEMENT

Production changes should include:

• scope
• impact
• validation
• rollback plan
• evidence.

9. DOCUMENTATION

Maintain:

• topology diagrams
• ports
• member roles
• backup procedures
• DR procedure
• operational runbooks.

10. INCIDENT RESPONSE

When something fails, the DBA should:

detect
→ scope
→ collect evidence
→ stabilize
→ identify root cause
→ recover
→ validate
→ document RCA.

Routine maintenance should reduce the likelihood and impact of emergency incidents.`,

      internalWorking: `PROACTIVE

Monitoring
   |
Capacity
   |
Backup
   |
Maintenance
   |
Validation
   |
fewer incidents


REACTIVE

Alert
 |
Incident
 |
Diagnosis
 |
Recovery`,

      architecture: `              MONGODB DBA
                  |
      +-----------+-----------+
      |           |           |
      v           v           v
 Availability  Security    Performance
      |           |           |
      +-----------+-----------+
                  |
                  v
          Backup / Recovery
                  |
                  v
          Maintenance / Change`,

      examples: [
        `Checking replication lag every day is routine administration; recovering a stale Secondary is incident work.`,
        `Monitoring disk growth is proactive; responding when disk reaches 99% is reactive.`,
        `Testing restore procedures prevents discovering backup problems during a disaster.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'A common health check for replica-set state.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides broad server-level operational metrics.'
        }
      ],

      productionScenario: `A DBA team checks disk usage only when an alert fires at 95%.

Eventually a large index build fills the filesystem.

A mature administration model tracks growth trends and forecasts capacity before storage becomes critical.

This converts an emergency into a planned capacity change.`,

      troubleshootingApproach: `1. Define routine health checks.

2. Define alert thresholds.

3. Establish baselines.

4. Review capacity trends.

5. Validate backups.

6. Review security periodically.

7. Plan maintenance.

8. Document changes.

9. Keep incident runbooks.

10. Perform RCA after outages.`,

      commonMistakes: [
        'Treating DBA work as only incident firefighting.',
        'Checking backups without testing restores.',
        'Ignoring capacity trends.',
        'Making undocumented production changes.',
        'Running maintenance without rollback planning.'
      ],

      bestPractices: [
        'Automate routine monitoring.',
        'Use trend-based capacity planning.',
        'Test restore procedures.',
        'Maintain runbooks.',
        'Perform regular health reviews.'
      ],

      interviewAnswer: `A MongoDB DBA is responsible for availability, replication health, backups, capacity, performance, security, patching, housekeeping, and controlled production changes.

Routine administration should be proactive and based on monitoring and trends. Incident response should follow a structured process of scoping, evidence collection, stabilization, root-cause analysis, recovery, and validation.`,

      keyTakeaways: [
        'Administration should be proactive.',
        'Availability, backup, capacity and security are core responsibilities.',
        'Routine work should reduce incidents.',
        'Changes require validation and rollback plans.',
        'RCA completes incident handling.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 2,
    question:
      'What MongoDB health checks should a DBA perform regularly on a replica set, and which checks should be automated?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `A MongoDB replica set can appear healthy because a Primary exists while still having hidden problems.

A proper health check should examine every member and several system layers.`,

      coreConcept: `Replica-set health:

Member state
    |
Replication lag
    |
Oplog window
    |
Disk
    |
CPU/RAM
    |
Connections
    |
Backups
    |
Logs
    |
Alerts`,

      detailedExplanation: `A regular replica-set health review should include:

1. MEMBER STATES

Verify expected members are:

PRIMARY
SECONDARY
or intentionally configured states.

Unexpected:

RECOVERING
STARTUP2
ROLLBACK
UNKNOWN
DOWN

requires investigation.

2. PRIMARY

Confirm there is exactly one expected writable Primary under normal conditions.

3. REPLICATION LAG

Measure how far Secondaries are behind.

Lag should be interpreted relative to workload and business requirements.

4. OPLOG WINDOW

Ensure the oplog provides sufficient time coverage for expected outages or maintenance.

5. MEMBER CONNECTIVITY

Check heartbeat/network problems.

6. DISK

Monitor:

• filesystem utilization
• growth
• storage latency
• inode considerations where relevant.

7. MEMORY

Check:

• WiredTiger cache
• system memory
• swap
• memory trends.

8. CPU

Monitor sustained saturation and unusual changes.

9. CONNECTIONS

Track current and available connection behavior.

10. BACKUP STATUS

Verify the backup process itself, not merely database health.

11. LOGS

Review recurring warnings/errors.

12. TIME SYNCHRONIZATION

Replica nodes should maintain reliable system time.

13. CERTIFICATE EXPIRATION

If TLS is used, monitor certificate validity.

14. VERSION CONSISTENCY

Ensure member versions match the intended maintenance state.

AUTOMATION

Checks that can be measured continuously should usually be monitored automatically.

Manual review should focus on:

• trends
• anomalies
• capacity
• planned changes
• deeper diagnostics.`,

      internalWorking: `Automated monitoring
       |
       v
Metrics + alerts
       |
       v
DBA review
       |
       v
Trend/anomaly analysis
       |
       v
preventive action`,

      architecture: `             REPLICA SET
         +----------+----------+
         |          |          |
         v          v          v
      Primary    Secondary   Secondary
         |          |          |
         +----------+----------+
                    |
                 Metrics
                    |
                    v
              Monitoring
                    |
                    v
                   DBA`,

      examples: [
        `A Secondary may be healthy but lagging significantly.`,
        `A replica set may have healthy member states but an oplog window too small for recovery requirements.`,
        `A certificate-expiry alert can prevent a future connectivity outage.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows replica-set member states and health information.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'A convenient shell helper for inspecting Secondary replication lag in environments where it is available.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Useful quick view of oplog sizing/window information; exact output depends on version.'
        }
      ],

      productionScenario: `The Primary and both Secondaries are all healthy.

However, one Secondary has been lagging for six hours and the oplog window is only eight hours.

The DBA identifies that another few hours of lag could force an initial sync.

Routine health monitoring catches the risk before the node becomes stale.`,

      troubleshootingApproach: `1. Check member states.

2. Check replication lag.

3. Check oplog window.

4. Check disk.

5. Check CPU/RAM.

6. Check storage latency.

7. Check connection count.

8. Check logs.

9. Check backups.

10. Check certificates.

11. Compare with baseline.

12. Automate recurring checks.`,

      commonMistakes: [
        'Checking only whether a Primary exists.',
        'Ignoring oplog window.',
        'Ignoring certificate expiration.',
        'Checking raw metrics without baselines.',
        'Performing all health checks manually.'
      ],

      bestPractices: [
        'Automate measurable health checks.',
        'Review every replica member.',
        'Alert on lag and oplog risk.',
        'Monitor capacity trends.',
        'Perform periodic deeper manual reviews.'
      ],

      interviewAnswer: `My regular replica-set health checks include member state, Primary availability, replication lag, oplog window, disk, storage latency, CPU, memory, connections, logs, backup status, TLS certificates and version consistency.

Continuous measurable checks should be automated, while the DBA focuses on interpreting trends, anomalies and capacity risks.`,

      keyTakeaways: [
        'A Primary alone does not prove full health.',
        'Every member needs monitoring.',
        'Lag and oplog window must be evaluated together.',
        'Infrastructure health matters.',
        'Routine checks should be automated.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 3,
    question:
      'How should a MongoDB DBA perform disk-space monitoring and capacity planning instead of waiting for the filesystem to become full?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `Disk capacity should be managed using growth rate and forecast, not only current percentage used.

A filesystem at 70% may be dangerous if it grows 5% every day.

A filesystem at 85% may be stable if growth is extremely slow and sufficient emergency headroom exists.

Trend matters.`,

      coreConcept: `Current usage
    +
Growth rate
    +
Expected maintenance growth
    +
Emergency headroom
    =
Capacity decision`,

      detailedExplanation: `A MongoDB DBA should monitor multiple storage dimensions.

1. CURRENT UTILIZATION

Example:

Filesystem:
1 TB

Used:
700 GB

Free:
300 GB.

2. GROWTH RATE

Example:

Database grows:
20 GB/day.

Then 300 GB free represents only approximately 15 days at the same rate before reaching full capacity, ignoring safety margins and workload changes.

3. PEAK OPERATIONS

Some operations can temporarily require significant space.

Examples may include:

• index builds
• initial sync
• restore
• resharding
• certain maintenance/rewrite operations
• large imports
• log growth
• backup staging.

4. REPLICA MEMBER DIFFERENCES

Check every member.

One node may have less filesystem capacity or additional unrelated files.

5. DATA VS FILESYSTEM UTILIZATION

Do not assume MongoDB logical data size equals filesystem usage.

WiredTiger storage, indexes, journal, diagnostic data, logs, filesystem overhead and other files all contribute.

6. STORAGE PERFORMANCE

Capacity is not only GB.

A disk can have enough free space but insufficient:

• IOPS
• throughput
• latency performance.

7. ALERT LEVELS

Use multiple operational thresholds rather than one emergency threshold.

For example conceptually:

warning
critical
emergency

but exact percentages should be based on environment and growth rate rather than copied blindly.

8. FORECASTING

Forecast:

days to threshold

rather than:

percentage used.

This gives operations time to respond before the environment reaches critical state.`,

      internalWorking: `Free space
   |
   v
Growth per day
   |
   v
Days to threshold
   |
   v
Capacity action date`,

      architecture: `             FILESYSTEM
           +----------------+
           | MongoDB data   |
           | indexes        |
           | journal        |
           | logs           |
           | other files    |
           +----------------+
                   |
                   v
              growth trend
                   |
                   v
             forecast / alert`,

      examples: [
        `300 GB free with 30 GB/day growth gives far less time than 100 GB free with 1 GB/month growth.`,
        `An initial sync can require substantial additional storage capacity on the target member.`,
        `Disk-space planning should include non-MongoDB files on the same filesystem.`
      ],

      commands: [
        {
          command:
            'df -h',
          explanation:
            'Shows filesystem utilization at the OS level.'
        },
        {
          command:
            'du -sh <dbPath>',
          explanation:
            'Provides an approximate filesystem view of the database path, subject to OS permissions and filesystem behavior.'
        },
        {
          command:
            'db.stats()',
          explanation:
            'Provides database-level storage statistics for context.'
        }
      ],

      productionScenario: `A 2 TB MongoDB filesystem is 72% used.

The operations team considers it safe because the alert threshold is 85%.

The DBA notices usage increased by 8% in one week due to a new data feed.

At the current rate the environment will cross the threshold quickly.

Capacity is expanded before an emergency occurs.`,

      troubleshootingApproach: `1. Check filesystem size.

2. Check used/free space.

3. Check historical growth.

4. Calculate days to threshold.

5. Check dbPath components.

6. Check log growth.

7. Check expected upcoming maintenance.

8. Check all replica members.

9. Check storage performance limits.

10. Plan expansion with safety margin.`,

      commonMistakes: [
        'Monitoring only percentage used.',
        'Ignoring growth rate.',
        'Ignoring maintenance space requirements.',
        'Checking only the Primary.',
        'Assuming logical database size equals filesystem usage.'
      ],

      bestPractices: [
        'Track daily/weekly growth.',
        'Forecast days to threshold.',
        'Maintain emergency headroom.',
        'Monitor every member.',
        'Plan storage capacity before maintenance.'
      ],

      interviewAnswer: `I manage MongoDB disk capacity using current utilization plus growth rate, not a single percentage threshold. I track how quickly data, indexes, logs and other files are growing, calculate time to a safe threshold and include temporary space required by maintenance operations.

I also monitor storage latency, IOPS and throughput because sufficient free capacity does not guarantee sufficient storage performance.`,

      keyTakeaways: [
        'Growth rate matters more than one percentage.',
        'Every replica member needs capacity monitoring.',
        'Maintenance may require temporary headroom.',
        'Logical size differs from filesystem use.',
        'Storage capacity and storage performance are separate.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 4,
    question:
      'How should MongoDB log files be managed in production, and what should a DBA investigate when logs grow unexpectedly fast?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `MongoDB logs are operational evidence.

They are necessary for troubleshooting, but unmanaged logs can consume filesystem space.

The goal is:

retain enough useful evidence
without allowing logging to fill the server.`,

      coreConcept: `mongod
  |
  v
Log file
  |
rotation
  |
retention/compression
  |
central monitoring
  |
controlled disk usage`,

      detailedExplanation: `MongoDB logging should be managed using a deliberate rotation and retention policy.

Important concerns include:

1. LOG DESTINATION

Know where mongod logs are stored.

2. ROTATION

Ensure logs are rotated through the supported operational approach used by the environment.

Rotation can be integrated with:

• MongoDB-supported behavior
• OS tooling
• centralized logging

depending on deployment design.

3. RETENTION

Do not retain unlimited historical logs on the database filesystem.

4. CENTRALIZATION

Where available, ship logs to centralized monitoring/logging so historical incident evidence does not depend entirely on local files.

5. DEBUG VERBOSITY

Unexpected high verbosity can produce enormous logs.

Do not leave diagnostic verbosity increased after troubleshooting unless explicitly required.

6. REPEATED ERROR LOOPS

Fast log growth may indicate a real incident such as:

• repeated authentication failure
• network reconnect loop
• replication problem
• TLS failure
• application retry storm
• disk/storage warning.

Therefore deleting logs without reading the messages can hide the actual problem.

7. LOG FILESYSTEM

Ideally understand whether MongoDB logs share storage with database data.

If they do, uncontrolled log growth can threaten database availability.

8. DISK ALERTING

Monitor log filesystem separately if applicable.

Security-sensitive logs should also be handled according to organization retention and privacy requirements.`,

      internalWorking: `Log grows fast
    |
    v
Check message pattern
    |
 +--+---+
 |      |
verbosity repeated error
 |      |
 v      v
fix     investigate root cause
    |
    v
rotate / retain safely`,

      architecture: `               MONGOD
                  |
                  v
              LOCAL LOG
                  |
           rotation/retention
                  |
                  v
           CENTRAL LOGGING
                  |
                  v
                 DBA`,

      examples: [
        `Repeated failed authentication attempts can generate significant log volume.`,
        `Debug verbosity accidentally left enabled can increase log size dramatically.`,
        `Deleting a large active log file without understanding the logging mechanism can create operational confusion.`
      ],

      commands: [
        {
          command:
            'du -sh <mongo-log-directory>',
          explanation:
            'Checks local MongoDB log storage usage.'
        },
        {
          command:
            'tail -n 100 <mongod.log>',
          explanation:
            'Quickly inspects recent log messages without dumping the whole file.'
        }
      ],

      productionScenario: `The MongoDB log grows 40 GB in a few hours.

The server team asks the DBA to delete it.

The DBA first checks the repeated messages and finds an application performing thousands of authentication attempts per second with an invalid password.

Fixing the application retry loop removes the root cause, then normal log retention handles the existing files.`,

      troubleshootingApproach: `1. Check log file size.

2. Measure growth rate.

3. Identify dominant repeated messages.

4. Check log verbosity.

5. Check application retry patterns.

6. Check replication/network/TLS errors.

7. Confirm rotation is working.

8. Confirm retention policy.

9. Check filesystem headroom.

10. Fix root cause before cleanup.`,

      commonMistakes: [
        'Deleting logs before reading the error pattern.',
        'Leaving debug verbosity enabled indefinitely.',
        'Keeping unlimited local logs.',
        'Ignoring log filesystem capacity.',
        'Treating repeated log errors as only a disk problem.'
      ],

      bestPractices: [
        'Use supported log rotation.',
        'Centralize logs where appropriate.',
        'Monitor log growth.',
        'Keep reasonable retention.',
        'Fix repeated error sources.'
      ],

      interviewAnswer: `MongoDB logs should have controlled rotation, retention and preferably centralized collection. If logs suddenly grow, I first identify the dominant message pattern and check whether the cause is increased verbosity, retry storms, authentication failures, network errors or replication issues.

I fix the source of excessive logging rather than simply deleting evidence.`,

      keyTakeaways: [
        'Logs are troubleshooting evidence.',
        'Rotation and retention are essential.',
        'Fast growth can indicate a real incident.',
        'Debug logging should not be left enabled casually.',
        'Fix the source before cleanup.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 5,
    question:
      'What is a controlled MongoDB restart, and how should a DBA restart a production replica-set member safely?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `A production MongoDB restart should not mean:

kill mongod
and hope it comes back.

A controlled restart means:

validate topology
→ stop one appropriate member
→ perform maintenance
→ start it
→ verify it rejoins
→ continue only when healthy.`,

      coreConcept: `Replica set

Secondary 1
    |
restart
    |
verify SECONDARY
    |
Secondary 2
    |
restart
    |
verify
    |
Primary last
after controlled stepdown
when needed`,

      detailedExplanation: `A normal rolling maintenance pattern generally starts with Secondary members.

BEFORE RESTART

Check:

• rs.status()
• replication lag
• oplog window
• disk
• backups
• current maintenance risk.

SECONDARY RESTART

1. Select one healthy Secondary.

2. Ensure remaining voting topology can maintain majority.

3. Stop mongod cleanly through the environment's service-management procedure.

4. Perform maintenance.

5. Start mongod.

6. Check startup logs.

7. Verify it returns to SECONDARY.

8. Verify replication catches up.

9. Only then move to another member.

PRIMARY

For work that requires restarting the Primary:

• ensure Secondaries are healthy and caught up
• perform controlled stepdown where appropriate
• confirm a new Primary
• restart the old Primary
• verify it rejoins.

Important:

The exact maintenance sequence depends on:

• voting configuration
• arbiters
• priority
• hidden/delayed members
• sharded topology
• maintenance objective.

Never blindly restart nodes based only on the label PRIMARY/SECONDARY.

A three-member set has different failure tolerance from a two-data-node-plus-arbiter or more complex topology.`,

      internalWorking: `Healthy 3-node set

P
S1
S2

Restart S1
 |
S1 returns healthy

Restart S2
 |
S2 returns healthy

Step down P if required
 |
new P elected
 |
restart old P`,

      architecture: `           BEFORE
         P
       /   \
     S1     S2

        restart S1

           P
           |
          S2
           |
      majority intact

        S1 returns

           P
         /   \
       S1     S2`,

      examples: [
        `Rolling restart preserves service when topology and majority are handled correctly.`,
        `A lagging Secondary should not automatically be considered ready to take over as Primary.`,
        `The DBA should validate each restarted member before moving to the next.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Primary replica-set validation before and after restart.'
        },
        {
          command:
            'rs.stepDown()',
          explanation:
            'Conceptual controlled Primary stepdown command. Use only after validating topology and operational impact.'
        }
      ],

      productionScenario: `A three-member replica set needs an OS patch.

The DBA patches one Secondary, waits until it rejoins and fully catches up, patches the second Secondary, validates it, then performs a controlled Primary transition before patching the old Primary.

Application availability is maintained throughout the maintenance window.`,

      troubleshootingApproach: `1. Check topology.

2. Check voting majority.

3. Check lag.

4. Check oplog window.

5. Pick safe member.

6. Stop cleanly.

7. Perform maintenance.

8. Start member.

9. Check logs.

10. Verify member state.

11. Verify catch-up.

12. Continue only when healthy.`,

      commonMistakes: [
        'Restarting all members together.',
        'Restarting a Secondary without checking remaining majority.',
        'Moving to the next member before replication catches up.',
        'Restarting the Primary first unnecessarily.',
        'Using forced election/reconfiguration as routine maintenance.'
      ],

      bestPractices: [
        'Use rolling maintenance.',
        'Validate after every restart.',
        'Preserve voting majority.',
        'Keep Secondaries caught up before Primary maintenance.',
        'Document rollback criteria.'
      ],

      interviewAnswer: `For a controlled replica-set restart, I first verify member health, replication lag, oplog window and voting majority. I restart one Secondary at a time, wait for it to return and catch up, and only then continue.

If the Primary must be restarted, I ensure healthy Secondaries exist, use a controlled stepdown when appropriate, confirm a new Primary and then restart the old Primary.`,

      keyTakeaways: [
        'Production restarts should be controlled.',
        'Restart one member at a time.',
        'Preserve majority.',
        'Verify replication after every restart.',
        'Primary maintenance usually comes after healthy Secondaries.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 6,
    question:
      'What is the correct way to shut down MongoDB, and why should a DBA avoid killing the mongod process with SIGKILL during routine maintenance?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `MongoDB should normally be stopped using a clean shutdown procedure.

SIGKILL immediately terminates the process without allowing normal shutdown handling.

That is very different from a controlled stop.`,

      coreConcept: `Clean stop:

request shutdown
    |
    v
mongod handles shutdown
    |
    v
process exits cleanly


SIGKILL:

kill -9
    |
    v
process disappears immediately
    |
    v
unclean shutdown`,

      detailedExplanation: `A clean MongoDB shutdown allows the server to perform its supported termination path.

Depending on deployment and operating system, administration may use:

• service manager
• MongoDB shutdown command
• orchestration platform.

For example, on systemd-managed Linux environments, MongoDB may be controlled through the configured service unit.

WHY SIGKILL IS DIFFERENT

SIGKILL cannot be handled by the application.

The operating system immediately terminates the process.

MongoDB then treats the next startup as recovery from an unclean shutdown.

WiredTiger durability mechanisms are designed to recover from crashes, but that does not mean DBAs should intentionally create unclean shutdowns during normal operations.

Repeated unclean shutdowns can:

• increase recovery work
• hide infrastructure problems
• complicate incident timelines
• create unnecessary operational risk.

SIGTERM and service-manager stop behavior are different from SIGKILL.

MongoDB can receive a normal termination request and execute its controlled shutdown process.

A DBA investigating a past outage should inspect logs to distinguish:

• intentional clean shutdown
• SIGTERM
• SIGKILL
• host reboot
• process crash
• out-of-memory kill
• infrastructure termination.`,

      internalWorking: `Normal:

systemctl stop
     |
     v
SIGTERM / controlled stop
     |
     v
MongoDB shutdown


Abnormal:

kill -9
     |
     v
SIGKILL
     |
     v
Immediate termination`,

      architecture: `               OS
                |
        service manager
                |
                v
              mongod
                |
         controlled shutdown
                |
                v
             storage


SIGKILL bypasses
normal application shutdown.`,

      examples: [
        `A service manager stop is preferable to kill -9 during routine patching.`,
        `A reboot may produce service shutdown messages before the host actually restarts.`,
        `Crash recovery capability does not make intentional unclean shutdown a best practice.`
      ],

      commands: [
        {
          command:
            'systemctl stop mongod',
          explanation:
            'Typical service-manager stop when MongoDB is managed by systemd; exact service name and privileges vary.'
        },
        {
          command:
            'db.adminCommand({ shutdown: 1 })',
          explanation:
            'MongoDB shutdown command when appropriate and authorized. Operational use depends on topology and environment.'
        }
      ],

      productionScenario: `During maintenance an engineer uses:

kill -9 <mongod-pid>

because it stops the process immediately.

The next startup performs unclean-shutdown recovery.

The DBA changes the runbook to use the supported service-manager stop procedure and reserves forced termination for exceptional situations.`,

      troubleshootingApproach: `1. Identify how mongod is managed.

2. Use supported clean shutdown.

3. Wait for process exit.

4. Review shutdown log messages.

5. Perform maintenance.

6. Start service.

7. Check recovery/startup logs.

8. Verify replica-set state.

9. Investigate unexpected unclean termination separately.`,

      commonMistakes: [
        'Using kill -9 as routine shutdown.',
        'Assuming all signals behave the same.',
        'Rebooting without checking database shutdown behavior.',
        'Ignoring startup recovery messages.',
        'Force-killing a Primary without considering topology.'
      ],

      bestPractices: [
        'Use clean shutdown procedures.',
        'Use service management consistently.',
        'Reserve SIGKILL for exceptional cases.',
        'Validate replica health after restart.',
        'Investigate unexpected shutdown causes.'
      ],

      interviewAnswer: `For routine maintenance I use the supported MongoDB or service-manager shutdown procedure, which allows mongod to handle termination cleanly.

I avoid SIGKILL because it cannot be handled by the process and creates an unclean shutdown. WiredTiger can recover from crashes, but intentionally causing crash-style termination is unnecessary operational risk.`,

      keyTakeaways: [
        'Clean shutdown is the normal procedure.',
        'SIGKILL is an unclean termination.',
        'Crash recovery is not a maintenance strategy.',
        'Topology must be considered before stopping nodes.',
        'Unexpected shutdowns should be investigated.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 7,
    question:
      'How should a MongoDB DBA manage the oplog as part of routine maintenance, and how can you decide whether the oplog window is large enough?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `The oplog stores replication history for a replica set.

The most important operational question is not only:

How large is the oplog?

but:

How much time does the oplog currently cover?`,

      coreConcept: `Oplog capacity
      +
write volume
      =
oplog window

Higher write volume
      |
      v
shorter time window
for the same effective capacity`,

      detailedExplanation: `The oplog is a capped replication log stored in:

local.oplog.rs

Replica-set Secondaries use it to replicate changes.

OPLOG WINDOW

The oplog window is the time difference between the oldest and newest retained oplog entries.

Example:

Oldest:
08:00

Newest:
20:00

Window:
approximately 12 hours.

WHY IT MATTERS

If a Secondary is unavailable longer than the usable oplog history and can no longer find the operations required to catch up, it may require a resynchronization/initial sync rather than normal incremental catch-up.

OPLOG WINDOW DEPENDS ON WORKLOAD

The same oplog size may provide:

3 days

during normal workload

but only:

8 hours

during a major bulk-update period.

Therefore monitor the window over time.

MAINTENANCE PLANNING

Before taking a Secondary down for:

• OS patching
• storage work
• long maintenance

compare expected downtime with current oplog window and safety margin.

OPLOG RESIZING

MongoDB supports oplog resizing capabilities in supported versions, but exact commands, behavior and limitations should be verified for the deployed release.

Do not resize it blindly.

Increasing oplog consumes storage.

Also remember that modern MongoDB oplog behavior includes internal durability/majority considerations that make simplistic fixed-size assumptions incomplete.

The core DBA principle remains:

monitor usable time coverage and write-rate behavior.`,

      internalWorking: `Oplog:

oldest ---------------- newest
       16-hour window

Secondary downtime:
2 hours

likely catch-up possible


Secondary downtime:
20 hours

may exceed retained history`,

      architecture: `             PRIMARY
                 |
              writes
                 |
                 v
              OPLOG
       oldest -------- newest
                 |
          +------+------+
          |             |
          v             v
      Secondary A   Secondary B`,

      examples: [
        `A 50 GB oplog can represent very different time windows under different workloads.`,
        `Bulk migration can dramatically shrink the oplog window.`,
        `Maintenance duration should be comfortably below available oplog coverage.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Provides a convenient view of oplog information and time span in mongosh environments where available.'
        },
        {
          command:
            'db.getSiblingDB("local").oplog.rs.stats()',
          explanation:
            'Provides oplog collection statistics.'
        }
      ],

      productionScenario: `A Secondary must be offline for six hours for storage work.

The normal oplog window is two days.

However, before maintenance the DBA observes a migration workload has reduced the current window to eight hours.

The maintenance is rescheduled or additional safety measures are taken because six hours leaves too little margin.`,

      troubleshootingApproach: `1. Check current oplog window.

2. Check historical minimum window.

3. Check current write rate.

4. Check upcoming bulk operations.

5. Estimate maintenance downtime.

6. Include safety margin.

7. Check available storage.

8. Resize only if justified and supported.

9. Recheck after workload changes.`,

      commonMistakes: [
        'Monitoring oplog size but not time window.',
        'Assuming window is constant.',
        'Taking nodes offline close to the current window limit.',
        'Ignoring bulk-write effects.',
        'Increasing oplog without considering disk capacity.'
      ],

      bestPractices: [
        'Monitor oplog window continuously.',
        'Maintain maintenance safety margin.',
        'Track workload-driven window changes.',
        'Include oplog planning in DR and maintenance.',
        'Validate version-specific resize procedures.'
      ],

      interviewAnswer: `For routine oplog administration I monitor the time window, not just the configured size. The window depends on write volume and can shrink sharply during bulk workloads.

Before taking a Secondary offline I ensure the expected downtime is comfortably inside the current and historically observed oplog window. If the window is consistently insufficient, I evaluate oplog resizing and storage capacity using the exact supported procedure for that MongoDB version.`,

      keyTakeaways: [
        'Oplog window is more operationally useful than size alone.',
        'Write volume changes the window.',
        'Maintenance must fit safely inside the window.',
        'A stale Secondary may require initial sync.',
        'Oplog resizing requires capacity planning.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 8,
    question:
      'How should MongoDB data-retention and housekeeping be designed, and when should TTL indexes be preferred over manual scheduled delete jobs?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `Housekeeping removes data that the business no longer needs.

Common approaches include:

• TTL indexes
• scheduled delete jobs
• archival
• collection rotation
• application-driven retention.

The correct method depends on the data lifecycle.`,

      coreConcept: `Data
 |
 v
Retention policy
 |
 +--> expire automatically -> TTL
 |
 +--> complex condition -> scheduled job
 |
 +--> keep historically -> archive
 |
 +--> bounded rolling structure -> specialized design`,

      detailedExplanation: `TTL INDEX

A TTL index is useful when documents should expire automatically based on a date/time field under supported TTL rules.

Example use cases:

• sessions
• temporary events
• short-lived logs
• cache-like documents.

TTL deletion is asynchronous.

Documents are not guaranteed to disappear at the exact expiration second.

Therefore TTL should not be treated as a precision scheduler.

MANUAL HOUSEKEEPING

Scheduled deletion may be more appropriate when:

• retention logic is complex
• deletion requires business validation
• data must be archived first
• deletion must be rate-limited
• multiple conditions determine eligibility.

LARGE DELETE RISKS

Deleting millions of documents at once can create:

• high write I/O
• replication lag
• oplog growth
• cache pressure
• index maintenance
• application latency.

Therefore large manual housekeeping jobs are often safer when performed in controlled batches.

ARCHIVAL

If historical data may still be required:

archive first
then delete.

CAPPED COLLECTIONS

Capped collections automatically overwrite old entries based on bounded collection storage behavior, but they are specialized structures with restrictions.

They should not be used as a generic replacement for TTL on normal production collections simply because old data needs removal.

REPLICATION

Deletes performed through normal MongoDB operations replicate to Secondaries.

Housekeeping load therefore affects the whole replica set, not just the Primary.`,

      internalWorking: `TTL:

document expires
    |
TTL monitor identifies
    |
delete
    |
replicated


Manual:

query old records
    |
batch delete
    |
monitor impact
    |
repeat`,

      architecture: `              APPLICATION DATA
                     |
               retention policy
                     |
          +----------+----------+
          |          |          |
          v          v          v
         TTL      Batch Job   Archive
          |          |          |
          +----------+----------+
                     |
                     v
              controlled lifecycle`,

      examples: [
        `Temporary session documents are a strong TTL use case.`,
        `Weekly deletion of hundreds of millions of records may require batching rather than one massive deleteMany.`,
        `Capped collections are not a general substitute for production retention policy.`
      ],

      commands: [
        {
          command:
            'db.collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })',
          explanation:
            'Conceptual TTL index for documents containing an absolute expiration date. Exact data-type and feature requirements should be verified for the deployed version.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Confirms TTL and other index definitions.'
        }
      ],

      productionScenario: `A production collection receives millions of event records daily and retains only seven days.

A weekly delete job removes an enormous volume at once and causes replication lag.

The DBA evaluates TTL because retention is based directly on a timestamp and gradual asynchronous deletion is more suitable than a weekly deletion burst.`,

      troubleshootingApproach: `1. Define retention requirement.

2. Identify timestamp/criteria.

3. Determine whether TTL fits.

4. Estimate delete volume.

5. Check index impact.

6. Check replication impact.

7. Batch manual deletes if needed.

8. Monitor oplog window.

9. Monitor disk/storage.

10. Validate business retention.`,

      commonMistakes: [
        'Running huge deleteMany operations without impact analysis.',
        'Expecting TTL deletion at the exact second.',
        'Using capped collections as generic housekeeping.',
        'Deleting data that should have been archived.',
        'Ignoring replication impact.'
      ],

      bestPractices: [
        'Use TTL for suitable time-based expiration.',
        'Batch large manual deletes.',
        'Archive before deletion when required.',
        'Monitor replication during housekeeping.',
        'Document retention policies.'
      ],

      interviewAnswer: `I choose housekeeping based on the data lifecycle. TTL indexes are well suited to simple time-based expiration and remove data asynchronously over time. Complex retention or archival requirements may require controlled batch jobs.

For large deletes I avoid one huge operation because deletion also generates replication and index work and can affect storage, oplog window and application latency.`,

      keyTakeaways: [
        'Retention design should match business rules.',
        'TTL is asynchronous.',
        'Large deletes can impact the whole replica set.',
        'Batching reduces operational spikes.',
        'Capped collections have specialized use cases.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 9,
    question:
      'How should a MongoDB DBA evaluate unused or redundant indexes before dropping them from production?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Indexes improve some reads but they are not free.

Every additional index consumes:

• storage
• memory/cache
• write maintenance
• backup/restore time.

However, an index that appears unused today may still support:

• monthly reports
• failover workload
• rare critical operations.

So an index should not be dropped based on one observation alone.`,

      coreConcept: `Index candidate
    |
    v
Usage evidence
    |
    v
Query dependency
    |
    v
Redundancy check
    |
    v
Write/storage cost
    |
    v
Safe validation
    |
    v
Drop or retain`,

      detailedExplanation: `INDEX REVIEW SHOULD INCLUDE:

1. INDEX USAGE

Inspect available index-usage statistics.

Remember those statistics may reset after process restart or other lifecycle events depending on mechanism.

Therefore:

zero usage since restart

does not automatically mean:

unused forever.

2. WORKLOAD PERIOD

Observe long enough to include:

• daily jobs
• weekly jobs
• month-end
• reports
• maintenance.

3. QUERY ANALYSIS

Search known slow/query workload and application code where available.

4. REDUNDANT PREFIXES

Some compound indexes may make other indexes partly redundant, but equivalence is not automatic.

Example:

{ a: 1, b: 1 }

may support some queries on:

{ a: 1 }

but uniqueness, sparse/partial behavior, sort requirements, collation and other properties can change whether dropping another index is safe.

5. HIDDEN INDEX TESTING

MongoDB supports hidden indexes in relevant versions, which can allow testing behavior without immediately deleting the index.

Exact behavior/version support should be verified.

6. WRITE COST

Each index can increase:

• insert work
• update work
• delete work
• storage.

7. DROP IMPACT

Dropping an index is a production change.

The DBA should have:

• evidence
• rollback/recreation definition
• monitoring.

If performance degrades after removal, recreation may itself be expensive.

Therefore save the full index definition before dropping it.`,

      internalWorking: `Index appears unused
      |
      v
Check observation window
      |
      v
Check rare workloads
      |
      v
Check redundancy
      |
      v
Hide/test if appropriate
      |
      v
Drop carefully`,

      architecture: `                 INDEXES
           +---------+---------+
           |         |         |
           v         v         v
        Index A   Index B   Index C
           |         |         |
       active     maybe      redundant?
                  unused
                     |
                     v
                validation`,

      examples: [
        `An index unused for two days may still support a month-end report.`,
        `Two indexes with similar key prefixes can still differ because one is unique or partial.`,
        `Saving the exact index definition makes rollback planning easier.`
      ],

      commands: [
        {
          command:
            'db.collection.aggregate([{ $indexStats: {} }])',
          explanation:
            'Shows index-usage statistics available for the running node; interpretation must account for the observation window.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Captures exact index definitions before making changes.'
        }
      ],

      productionScenario: `A DBA sees zero usage for an index after a recent database restart and plans to drop it.

The application owner explains that the index supports a monthly reconciliation process.

The DBA expands the observation window and avoids causing a future month-end performance incident.`,

      troubleshootingApproach: `1. Capture index definition.

2. Check usage statistics.

3. Determine metric reset time.

4. Review workload cycle.

5. Review query patterns.

6. Check redundancy.

7. Check index options.

8. Consider hidden-index validation where appropriate.

9. Monitor performance.

10. Drop only with rollback plan.`,

      commonMistakes: [
        'Dropping an index because usage is zero after restart.',
        'Ignoring monthly or rare queries.',
        'Assuming compound-prefix similarity means exact redundancy.',
        'Dropping without preserving definition.',
        'Removing many indexes simultaneously.'
      ],

      bestPractices: [
        'Use long enough observation windows.',
        'Review application dependencies.',
        'Preserve exact index definitions.',
        'Test incrementally.',
        'Monitor after removal.'
      ],

      interviewAnswer: `Before dropping an index, I verify its usage over a representative workload period, account for statistics resets, review rare and scheduled queries, compare exact index definitions and evaluate redundancy.

Where supported and appropriate, hidden indexes can help test impact before deletion. I always preserve the index definition and monitor after the change because recreating a large production index may be expensive.`,

      keyTakeaways: [
        'Unused-looking does not mean truly unused.',
        'Observation window matters.',
        'Index options affect redundancy.',
        'Index removal is a production change.',
        'Preserve rollback definitions.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 10,
    question:
      'How should a MongoDB DBA design a production maintenance window and change plan before performing database work?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A maintenance window is not simply:

"we have two hours to make changes."

A proper change plan explains:

• what will change
• why
• expected impact
• exact sequence
• validation
• rollback
• ownership.`,

      coreConcept: `Before change:

Scope
 |
Risk
 |
Dependencies
 |
Backup
 |
Steps
 |
Validation
 |
Rollback
 |
Communication

Then execute.`,

      detailedExplanation: `A good MongoDB production change plan should include:

1. OBJECTIVE

Example:

Upgrade MongoDB maintenance release
or
rotate TLS certificate.

2. SCOPE

List affected:

• replica set
• nodes
• ports
• applications
• monitoring
• backup systems.

3. CURRENT STATE

Record:

• MongoDB version
• topology
• Primary
• replication lag
• disk
• backups
• relevant configuration.

4. PREREQUISITES

Examples:

• valid backup
• enough disk
• healthy Secondaries
• package staged
• certificates prepared.

5. RISK ANALYSIS

Consider:

• election
• connection interruption
• replication lag
• rollback time
• version compatibility.

6. STEP-BY-STEP PROCEDURE

Commands should be explicit and reviewed.

Avoid improvisation during the maintenance window.

7. VALIDATION AFTER EACH STEP

Example:

After Secondary restart:

• process running
• member SECONDARY
• replication caught up
• logs clean.

8. ROLLBACK

Define:

what condition triggers rollback

and:

how to restore the previous known-good state.

9. COMMUNICATION

Identify:

• application owner
• server team
• network/security
• change manager
• escalation contact.

10. STOP CRITERIA

If unexpected issues occur, do not continue simply because the maintenance window is open.

11. POST-CHANGE VALIDATION

Check:

• application
• replica set
• backups
• monitoring
• performance.

12. DOCUMENT ACTUAL RESULT

Record what happened, including deviations from plan.`,

      internalWorking: `Plan
 |
Pre-check
 |
Change node 1
 |
Validate
 |
Change node 2
 |
Validate
 |
Primary/change final
 |
Validate
 |
Application test
 |
Close change`,

      architecture: `                CHANGE PLAN
          +----------+----------+
          |          |          |
          v          v          v
       Precheck    Execution   Rollback
          |          |          |
          +----------+----------+
                     |
                     v
                 Validation
                     |
                     v
                Change close`,

      examples: [
        `A rolling restart plan should define what happens if the first Secondary does not return.`,
        `A certificate rollout should include application and monitoring validation, not only mongod startup.`,
        `A backup existing somewhere is not enough; its status and recoverability should be known before risky work.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Common pre- and post-change topology validation.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Quick confirmation of the MongoDB server version for the current connection.'
        }
      ],

      productionScenario: `A DBA begins patching a replica set without a rollback plan.

The first Secondary fails after restart because of an unexpected package dependency.

Instead of continuing, a well-designed maintenance procedure would already specify:

stop criteria
rollback action
escalation owner
and validation requirements.

The issue remains isolated to one member rather than becoming a full cluster outage.`,

      troubleshootingApproach: `1. Define objective.

2. Define scope.

3. Record current state.

4. Validate backup.

5. Validate topology.

6. Check capacity.

7. Review dependencies.

8. Write exact steps.

9. Define validation.

10. Define rollback.

11. Define stop criteria.

12. Communicate stakeholders.

13. Execute incrementally.

14. Validate final service.

15. Record results.`,

      commonMistakes: [
        'Starting changes without a rollback plan.',
        'Continuing after unexpected failures.',
        'Changing multiple members before validating.',
        'Ignoring application validation.',
        'Using the maintenance window as permission to improvise.'
      ],

      bestPractices: [
        'Use reviewed runbooks.',
        'Define stop criteria.',
        'Validate after every step.',
        'Preserve rollback capability.',
        'Document actual execution.'
      ],

      interviewAnswer: `My MongoDB change plan includes the objective, topology and application scope, current state, prerequisites, risks, exact commands, validation after each step, rollback procedure, stop criteria and stakeholder communication.

I execute incrementally and do not continue if the environment deviates materially from the expected state. The change closes only after database and application validation succeeds.`,

      keyTakeaways: [
        'Maintenance requires a real change plan.',
        'Pre-checks are essential.',
        'Every step needs validation.',
        'Rollback and stop criteria must be defined.',
        'Application validation is part of database maintenance.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 11,
    question:
      'A MongoDB service fails to start after a planned restart. How should an L3 DBA troubleshoot the failure without risking data loss?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `When mongod does not start, the first objective is not to "make it start somehow."

The objective is to identify exactly why startup failed while preserving the existing data.

Do not immediately:

• delete lock files
• delete WiredTiger files
• delete journal files
• run --repair
• change permissions recursively
• move dbPath contents
• initialize a new database over the existing path.`,

      coreConcept: `Startup failure
      |
      v
Service status
      |
      v
MongoDB logs
      |
      v
Configuration
      |
      v
Filesystem / permissions
      |
      v
Port / process
      |
      v
Storage / recovery
      |
      v
Fix identified cause
      |
      v
Validate replica health`,

      detailedExplanation: `A structured startup investigation should begin with evidence.

1. SERVICE STATUS

Determine whether:

• mongod exited immediately
• service manager rejected startup
• startup timed out
• process is repeatedly restarting.

2. MONGODB LOG

The MongoDB log is normally the most important source.

Look for messages involving:

• configuration parsing
• dbPath
• permissions
• TLS
• certificates
• port binding
• storage engine
• WiredTiger recovery
• disk space
• incompatible options
• version compatibility.

3. CONFIGURATION

If configuration changed, compare the current configuration with the last known working version.

A simple typo can prevent startup.

4. FILESYSTEM

Check:

• dbPath exists
• filesystem is mounted
• sufficient free space exists
• expected ownership/permissions exist.

Do not perform broad recursive permission changes without understanding what changed.

5. PORT

Check whether another process already owns the configured port.

6. PROCESS STATE

Determine whether another mongod instance is already running against the same environment.

7. VERSION

If startup failure occurred after package replacement or upgrade, confirm:

• mongod binary version
• intended upgrade path
• configuration-option compatibility.

8. WIREDTIGER

If logs report WiredTiger recovery or corruption-related errors, preserve evidence and determine whether this is:

• normal crash recovery
• storage failure
• actual corruption.

Do not delete WiredTiger metadata.

9. REPLICA SET

If the failed member is a Secondary and other members are healthy, there may be time to investigate safely without destructive local recovery.

The existence of healthy replica-set members can materially change the recovery strategy.

10. REPAIR

Repair is not the first troubleshooting command.

Its behavior and risks depend on the failure and MongoDB version and it can result in loss of unrecoverable data.

For a replica-set Secondary with healthy authoritative copies elsewhere, rebuilding/resyncing the member may sometimes be safer than attempting destructive repair.`,

      internalWorking: `mongod fails
    |
    +--> config error?
    |
    +--> permission?
    |
    +--> port conflict?
    |
    +--> disk full?
    |
    +--> TLS problem?
    |
    +--> storage/recovery?
    |
    +--> version mismatch?
    |
    v
Fix proven cause
    |
    v
restart + validate`,

      architecture: `              systemd
                  |
                  v
                mongod
             /    |    \
            /     |     \
        config  storage   network
          |       |         |
       YAML    dbPath/WT   port/TLS
                  |
                  v
               LOGS
                  |
                  v
                 DBA`,

      examples: [
        `A YAML indentation error introduced during maintenance can prevent mongod from starting.`,
        `A missing filesystem mount can make the configured dbPath unavailable even though the MongoDB package itself is healthy.`,
        `A TLS certificate permission problem may appear only after the process restarts and attempts to read the certificate again.`
      ],

      commands: [
        {
          command:
            'systemctl status mongod',
          explanation:
            'Shows service state and recent service-manager information when systemd is used and permissions allow it.'
        },
        {
          command:
            'journalctl -u mongod',
          explanation:
            'Provides systemd journal information where accessible; exact service name and privileges vary.'
        },
        {
          command:
            'tail -n 200 <mongod-log-path>',
          explanation:
            'Reviews recent MongoDB startup messages.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms the binary version actually being executed.'
        }
      ],

      productionScenario: `After OS maintenance, one Secondary fails to start.

Instead of deleting WiredTiger.lock or running repair, the DBA checks the log and discovers that the data filesystem was not mounted after reboot.

Starting MongoDB against the wrong filesystem path could have created a much more serious incident.

The filesystem is mounted correctly, mongod starts, and the member rejoins the replica set.`,

      troubleshootingApproach: `1. Stop repeated restart attempts if they are obscuring evidence.

2. Check service status.

3. Read MongoDB logs.

4. Identify the first meaningful startup error.

5. Verify configuration.

6. Verify dbPath and filesystem mount.

7. Verify disk capacity.

8. Verify permissions.

9. Verify port ownership.

10. Verify MongoDB binary/version.

11. Investigate WiredTiger only if logs point there.

12. Avoid destructive recovery actions.

13. Start after correcting the proven cause.

14. Validate replica-set state and replication.`,

      commonMistakes: [
        'Deleting lock files immediately.',
        'Deleting WiredTiger metadata.',
        'Running repair as the first action.',
        'Ignoring the first startup error and focusing on later cascading messages.',
        'Starting mongod before confirming the correct filesystem is mounted.'
      ],

      bestPractices: [
        'Preserve evidence before changing anything.',
        'Start with MongoDB logs.',
        'Compare against last known working configuration.',
        'Prefer non-destructive recovery.',
        'Validate the member after startup.'
      ],

      interviewAnswer: `If mongod fails after restart, I first preserve the existing data and investigate service status and MongoDB startup logs. I verify configuration, dbPath and mounts, free space, permissions, ports, TLS files and binary version.

I do not delete WiredTiger files or run repair blindly. If storage-engine problems are indicated, I evaluate the replica-set topology and available healthy copies before choosing the safest recovery strategy.`,

      keyTakeaways: [
        'Startup logs usually provide the first diagnostic direction.',
        'Do not manipulate WiredTiger files manually.',
        'Repair is not the first response.',
        'Filesystem mounts must be verified.',
        'Replica-set redundancy affects recovery choices.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 12,
    question:
      'A Secondary has been offline for longer than the available oplog window and cannot catch up. How should an L3 DBA recover the stale member safely?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `A Secondary normally catches up by reading operations retained in the oplog.

If the operations it needs are no longer available, normal incremental replication cannot bridge the missing history.

The member may need to be resynchronized from a current replica-set member.`,

      coreConcept: `Secondary offline
      |
      v
Required oplog history available?
      |
   +--+--+
   |     |
  YES    NO
   |     |
catch   stale
 up      |
         v
   resync / initial sync
         |
         v
      SECONDARY`,

      detailedExplanation: `First confirm the actual condition.

1. CHECK REPLICA STATUS

Determine:

• current member state
• last replicated position
• health of remaining members.

2. CHECK OPLOG WINDOW

Compare the missing period with the history still retained by an appropriate sync source.

3. DO NOT FORCE IT TO PRIMARY

A stale member should not be promoted simply because its files are available.

Its data may be materially behind production.

4. IDENTIFY AUTHORITATIVE HEALTHY MEMBERS

Confirm the current Primary and healthy Secondaries have current data.

5. CAPACITY FOR INITIAL SYNC

Before resynchronizing, verify:

• disk capacity
• network capacity
• source-member load
• expected sync duration
• oplog window during synchronization.

Initial sync can be resource intensive.

6. UNDERSTAND WHY IT BECAME STALE

Possible causes:

• long outage
• unexpectedly small oplog window
• write burst
• network failure
• storage problem
• replication performance issue.

7. RESYNC

The exact supported resynchronization procedure depends on deployment and MongoDB version.

In self-managed replica sets, this may involve replacing the stale member's local data with a fresh initial sync following documented procedures.

Do not casually delete data from the wrong member.

8. MONITOR INITIAL SYNC

Monitor:

• source impact
• target disk
• network
• replication progress
• logs.

9. VALIDATE

After completion confirm:

• SECONDARY state
• replication caught up
• no recurring errors
• application/topology health.

10. PREVENT RECURRENCE

If the outage was shorter than normal maintenance expectations but exceeded the oplog window, evaluate increasing the operational safety margin.`,

      internalWorking: `Current Primary
      |
      | fresh data
      v
 Initial sync
      |
      v
Stale Secondary
      |
 copy + catch-up
      |
      v
healthy SECONDARY`,

      architecture: `        PRIMARY
           |
       current data
           |
     +-----+------+
     |            |
     v            v
 Healthy S     Stale S
                  |
                  | resync
                  v
             Healthy S`,

      examples: [
        `A Secondary offline for three days cannot catch up when only 18 hours of required oplog history remains.`,
        `Increasing the oplog after the member is already stale does not recreate oplog entries that have already rolled off.`,
        `A stale node should not be used as the authoritative recovery source.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows current replica-set member state and health.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Useful for viewing current oplog time coverage where available.'
        }
      ],

      productionScenario: `A Secondary is powered off for 48 hours.

During the outage, a bulk workload reduces the oplog window to 20 hours.

When the member returns, the history required to catch up is gone.

The DBA confirms the other members are healthy, verifies disk/network capacity and performs a controlled initial sync rather than trying to force the stale data back into service.`,

      troubleshootingApproach: `1. Confirm member state.

2. Determine last replicated position.

3. Check current oplog window.

4. Confirm required history is missing.

5. Verify healthy authoritative members.

6. Check initial-sync capacity.

7. Follow supported resync procedure.

8. Monitor source and target.

9. Wait for SECONDARY and catch-up.

10. Investigate why oplog coverage was insufficient.`,

      commonMistakes: [
        'Trying to promote a stale member.',
        'Assuming increasing oplog size restores lost history.',
        'Deleting the wrong member data.',
        'Starting initial sync without disk-capacity checks.',
        'Ignoring the reason the node became stale.'
      ],

      bestPractices: [
        'Maintain sufficient oplog safety margin.',
        'Validate source-member health.',
        'Plan initial sync capacity.',
        'Monitor synchronization.',
        'Correct the original oplog or outage problem.'
      ],

      interviewAnswer: `If a Secondary is outside the oplog window, I first prove that the required replication history is no longer retained. I verify that the remaining replica-set members are healthy and authoritative, then plan a supported resynchronization or initial sync with sufficient disk, network and source capacity.

I do not promote stale data or assume increasing the oplog afterward can restore history that has already rolled off.`,

      keyTakeaways: [
        'Missing oplog history prevents normal catch-up.',
        'Stale data must not be promoted.',
        'Initial sync requires capacity planning.',
        'Lost oplog history cannot be recreated by resizing.',
        'The root cause must also be addressed.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 13,
    question:
      'MongoDB disk utilization reaches 95% and continues increasing. What should an L3 DBA do before the filesystem becomes completely full?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `95% disk utilization is not simply a housekeeping alert.

If growth continues, it is a production availability risk.

The DBA needs to:

measure
→ identify growth
→ protect service
→ create capacity
→ remove only verified disposable data
→ prevent recurrence.`,

      coreConcept: `95% disk
   |
   v
Growth rate
   |
   v
What is consuming space?
   |
   +--> MongoDB data
   +--> indexes
   +--> logs
   +--> dump files
   +--> core/temp files
   +--> other OS files
   |
   v
Safest capacity action`,

      detailedExplanation: `1. DETERMINE URGENCY

Measure:

• current free space
• growth per hour/day
• estimated time to critical exhaustion.

2. IDENTIFY CONSUMERS

Do not assume MongoDB data is responsible.

Check:

• dbPath
• MongoDB logs
• backup/dump files
• temporary files
• diagnostic files
• unrelated application files.

3. CHECK ALL MEMBERS

A single replica member may have a local filesystem problem.

4. CHECK ACTIVE OPERATIONS

Determine whether growth correlates with:

• bulk load
• index build
• restore
• initial sync
• resharding/migration
• unexpected logging.

5. EXPAND STORAGE

Where infrastructure supports safe online expansion, adding capacity may be the least disruptive response.

Filesystem/cloud-volume expansion procedures belong to the relevant infrastructure runbook.

6. REMOVE ONLY SAFE FILES

Potentially removable files might include obsolete externally verified backup staging files or old rotated logs according to policy.

Never manually delete:

• WiredTiger data files
• journal files
• collection/index .wt files
• internal MongoDB metadata

to create emergency space.

7. LOG CLEANUP

If old rotated logs are responsible, follow the log retention procedure.

Do not blindly remove the active log.

8. DATA DELETION

Deleting documents is not necessarily an immediate filesystem-space solution.

With WiredTiger, logical deletion does not mean filesystem files instantly shrink by the same amount.

Therefore a massive emergency delete can add write load without solving immediate filesystem exhaustion.

9. REDUCE GROWTH

If safe and business-approved, pause or throttle the workload causing extraordinary growth.

10. AFTER STABILIZATION

Perform capacity analysis and establish earlier forecasting alerts.`,

      internalWorking: `95%
 |
 +--> Find consumer
 |
 +--> Stop abnormal growth
 |
 +--> Expand capacity
 |
 +--> Safe cleanup
 |
 v
stabilize
 |
 v
capacity RCA`,

      architecture: `            FILESYSTEM
      +-------------------------+
      | WiredTiger data         |
      | indexes                 |
      | journal                 |
      | logs                    |
      | dumps / other files     |
      +-------------------------+
                   |
                   v
             DBA diagnosis
                   |
          +--------+--------+
          |                 |
      expansion        safe cleanup`,

      examples: [
        `A forgotten mongodump on the database filesystem can consume hundreds of GB without MongoDB data itself growing.`,
        `Deleting documents does not guarantee an equivalent immediate reduction in filesystem allocation.`,
        `Deleting .wt files to free disk space can destroy the database.`
      ],

      commands: [
        {
          command:
            'df -h',
          explanation:
            'Checks filesystem utilization.'
        },
        {
          command:
            'du -sh <dbPath> <log-directory> <backup-directory>',
          explanation:
            'Compares major known consumers where permissions permit.'
        },
        {
          command:
            'du -x -h <mount-point> | sort -h | tail',
          explanation:
            'Example OS-level investigation for large consumers on one filesystem; adapt carefully for environment, permissions and filesystem size.'
        }
      ],

      productionScenario: `A MongoDB mount reaches 96%.

The database team initially assumes data growth.

Investigation shows a logical backup was accidentally written to the same mount and consumed 350 GB.

After verifying that the backup exists safely in its intended destination, the staging copy is removed according to procedure.

No MongoDB storage files are touched.`,

      troubleshootingApproach: `1. Measure free space.

2. Calculate exhaustion time.

3. Identify top consumers.

4. Check dbPath growth.

5. Check logs/dumps.

6. Check active operations.

7. Stop abnormal growth where safe.

8. Expand storage if possible.

9. Remove only verified disposable files.

10. Never delete MongoDB internal files.

11. Validate database health.

12. Implement capacity prevention.`,

      commonMistakes: [
        'Deleting WiredTiger files.',
        'Running huge deletes expecting immediate filesystem shrinkage.',
        'Ignoring non-MongoDB files.',
        'Waiting until 100% utilization.',
        'Performing cleanup without verifying backup/file ownership.'
      ],

      bestPractices: [
        'Forecast disk exhaustion.',
        'Keep backup staging separate where practical.',
        'Maintain emergency headroom.',
        'Know which files are safe to remove.',
        'Prefer planned capacity expansion.'
      ],

      interviewAnswer: `At 95% and growing, I calculate time to exhaustion and identify exactly what is consuming the filesystem. I check MongoDB data, logs, backup files and active operations.

I prefer safe capacity expansion or removal of verified disposable files. I never delete WiredTiger or journal files. I also avoid assuming a large document delete will immediately return equivalent filesystem space.`,

      keyTakeaways: [
        '95% and growing is an availability risk.',
        'Identify the consumer first.',
        'Never delete MongoDB internal files.',
        'Logical deletion is not immediate filesystem reclamation.',
        'Capacity forecasting should prevent recurrence.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 14,
    question:
      'A Linux server hosting MongoDB unexpectedly reboots and mongod goes down. How should an L3 DBA investigate the incident and prepare an RCA?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `The DBA must distinguish:

MongoDB caused the outage

from:

MongoDB stopped because the server disappeared.

An unexpected reboot requires both database evidence and operating-system/infrastructure evidence.`,

      coreConcept: `MongoDB stopped
      |
      v
Did host reboot?
      |
      v
Timeline correlation
      |
 +----+-----+
 |          |
MongoDB     OS/cloud
logs        evidence
 |          |
 +----+-----+
      |
      v
Root cause / RCA`,

      detailedExplanation: `Build a timeline first.

Example:

00:20
mongod receives termination signal

00:30
host reboot recorded

00:35
mongod manually or automatically starts.

The key question becomes:

WHY did the host reboot?

MongoDB logs can prove what mongod observed, but they may not prove why the infrastructure reboot occurred.

INVESTIGATE DATABASE EVIDENCE

Check:

• last normal operation
• shutdown messages
• signals
• startup recovery
• replica-set election
• member recovery.

INVESTIGATE OS EVIDENCE

Where available:

• system journal
• reboot history
• kernel logs
• OOM events
• service-manager logs.

INVESTIGATE CLOUD/VM EVIDENCE

For hosted VMs, infrastructure teams may need to review:

• VM reboot events
• platform health
• maintenance
• host failure
• administrative actions.

RESOURCE SATURATION

High CPU or memory can contribute to an unhealthy host, but correlation is not proof that MongoDB caused the reboot.

For example, Linux OOM evidence would be stronger than simply observing that MongoDB historically uses substantial RAM.

TIME ZONES

RCA timelines must state the timezone explicitly.

For example:

All timestamps are UTC.

This prevents confusion when teams compare MongoDB, OS and cloud logs.

RECOVERY

After reboot verify:

• mongod startup
• WiredTiger recovery messages
• member state
• election impact
• replication lag
• application connectivity.

RCA

Separate:

Root cause
from
Impact
from
Recovery action
from
Preventive action.

If infrastructure evidence is unavailable to the DBA, say so rather than inventing the root cause.`,

      internalWorking: `DB log -----+
             |
OS log -----+----> unified timeline
             |
Cloud log --+
             |
             v
       evidence-based RCA`,

      architecture: `          APPLICATION
               |
             MongoDB
               |
              Linux
               |
            VM / Cloud
               |
        physical platform

Failure can originate
at any layer.`,

      examples: [
        `SIGTERM before a reboot can indicate orderly service termination as part of host shutdown.`,
        `SIGKILL or abrupt log termination can indicate a different failure pattern.`,
        `The DBA should not label high RAM as root cause without OS/platform evidence.`
      ],

      commands: [
        {
          command:
            'who -b',
          explanation:
            'Shows the last system boot time on systems where available.'
        },
        {
          command:
            'last reboot',
          explanation:
            'Displays recorded reboot history where available.'
        },
        {
          command:
            'journalctl -u mongod',
          explanation:
            'Reviews service events when systemd journal access is available.'
        }
      ],

      productionScenario: `mongod stops at 00:20 UTC and the VM reboots shortly afterward.

MongoDB logs show a termination event but no preceding database fatal error.

The Linux/cloud team confirms an infrastructure-level reboot.

The RCA correctly states that MongoDB became unavailable as a consequence of the VM reboot rather than claiming MongoDB initiated it.`,

      troubleshootingApproach: `1. Establish exact outage time.

2. State timezone.

3. Read MongoDB logs.

4. Identify signal/shutdown pattern.

5. Check reboot history.

6. Request OS/kernel evidence.

7. Request cloud-platform evidence.

8. Check resource metrics.

9. Reconstruct election/application impact.

10. Validate recovery.

11. Separate facts from hypotheses.

12. Write corrective actions.`,

      commonMistakes: [
        'Assuming MongoDB caused the server reboot.',
        'Mixing UTC and local timestamps.',
        'Calling high memory the root cause without evidence.',
        'Ignoring infrastructure logs.',
        'Writing an RCA based on assumptions.'
      ],

      bestPractices: [
        'Create one unified timeline.',
        'State timezone explicitly.',
        'Use evidence from every layer.',
        'Separate cause and impact.',
        'Document unknowns honestly.'
      ],

      interviewAnswer: `For an unexpected reboot I create a unified timeline from MongoDB, OS and cloud-platform evidence. MongoDB logs tell me how mongod stopped and recovered, while OS or infrastructure logs are needed to determine why the host rebooted.

I explicitly state the timezone and separate proven facts from hypotheses. After recovery I validate replica-set state, replication and application connectivity before completing the RCA.`,

      keyTakeaways: [
        'MongoDB failure can be a consequence of host failure.',
        'RCA requires cross-layer evidence.',
        'Timezone must be explicit.',
        'Correlation is not proof.',
        'Facts and hypotheses must be separated.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 15,
    question:
      'How should an L3 MongoDB DBA replace a failed replica-set member while minimizing risk to production?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Replacing a replica-set member means introducing a new healthy copy of the data while preserving the availability and voting safety of the existing replica set.

The DBA must think about both:

data synchronization

and

replica-set configuration.`,

      coreConcept: `Failed member
     |
     v
Validate surviving set
     |
     v
Prepare replacement
     |
     v
Add / configure safely
     |
     v
Initial sync
     |
     v
Validate SECONDARY
     |
     v
Remove obsolete member
when appropriate`,

      detailedExplanation: `1. VALIDATE SURVIVING TOPOLOGY

Before changing configuration determine:

• current Primary
• healthy Secondaries
• voting members
• majority availability
• replication lag.

2. DETERMINE WHETHER REPLACEMENT IS REQUIRED

A temporary server outage is different from permanently lost storage.

Do not reconfigure unnecessarily.

3. PREPARE NEW MEMBER

Match required:

• MongoDB version
• configuration
• authentication
• TLS
• networking
• storage
• OS limits
• time synchronization.

4. NETWORK CONNECTIVITY

Every required replica-set member must be able to communicate using the configured hostnames/addresses and ports.

5. STORAGE CAPACITY

The replacement must have sufficient capacity for:

• current data
• indexes
• growth
• initial-sync overhead/safety margin.

6. ADDING MEMBER

Use supported replica-set configuration commands.

Avoid forced reconfiguration during normal member replacement.

7. INITIAL SYNC

Monitor:

• source load
• network
• disk
• logs
• synchronization progress.

8. VOTING/PRIORITY

In some maintenance designs a DBA may intentionally control voting or priority while introducing a member, but the correct configuration depends on topology and MongoDB version.

Do not blindly copy configuration patterns.

9. VALIDATE

Wait until the new member is healthy and caught up.

10. REMOVE OLD MEMBER

Only remove obsolete configuration entries when the recovery plan calls for it and topology remains safe.

11. APPLICATION CONNECTION STRING

If the application uses a proper replica-set URI with multiple members and service discovery, member replacement should be coordinated with connection configuration as necessary.

12. MONITOR AFTER CHANGE

Watch:

• elections
• lag
• connection errors
• disk
• application latency.`,

      internalWorking: `P + S healthy
    |
    v
prepare S-new
    |
    v
add
    |
    v
initial sync
    |
    v
SECONDARY
    |
    v
remove failed S-old`,

      architecture: `BEFORE

 P ----- S1
 |
 X S2


DURING

 P ----- S1
 |
 +------ S-new
          |
      initial sync


AFTER

 P ----- S1
 |
 +------ S-new`,

      examples: [
        `A new node should not be added before confirming its dbPath has enough storage.`,
        `Forced reconfiguration is not a routine member-replacement tool.`,
        `A replacement node should use compatible MongoDB configuration and security settings.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Validates topology before and after replacement.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Shows current replica-set configuration for review.'
        },
        {
          command:
            'rs.add("<new-member-host>:<port>")',
          explanation:
            'Conceptual member-add operation; actual configuration should be reviewed for voting, priority and topology requirements.'
        }
      ],

      productionScenario: `One Secondary suffers permanent storage failure.

The Primary and another Secondary remain healthy.

The DBA prepares a replacement server, verifies MongoDB version, TLS, networking and capacity, adds it using a supported configuration and monitors initial sync.

Only after the new member becomes a healthy Secondary is the obsolete member configuration cleaned up.`,

      troubleshootingApproach: `1. Validate surviving majority.

2. Confirm old member is truly unrecoverable.

3. Prepare replacement.

4. Verify version/security.

5. Verify network.

6. Verify storage.

7. Review rs.conf().

8. Add member safely.

9. Monitor initial sync.

10. Validate SECONDARY.

11. Remove obsolete member when appropriate.

12. Monitor production afterward.`,

      commonMistakes: [
        'Using force reconfiguration unnecessarily.',
        'Adding a node with insufficient disk.',
        'Ignoring voting topology.',
        'Removing the old member before understanding majority impact.',
        'Assuming initial sync has no production impact.'
      ],

      bestPractices: [
        'Preserve majority throughout.',
        'Match security and configuration.',
        'Capacity-plan initial sync.',
        'Validate before removing obsolete configuration.',
        'Monitor source load.'
      ],

      interviewAnswer: `I first verify that the surviving replica set has a healthy Primary, sufficient majority and current data. I prepare the replacement with compatible MongoDB version, TLS/authentication, networking and sufficient storage.

I then add it using the supported replica-set procedure, monitor initial sync and wait for it to become a healthy caught-up Secondary before cleaning up the failed member configuration. I avoid forced reconfiguration during normal replacement.`,

      keyTakeaways: [
        'Topology safety comes first.',
        'Replacement requires infrastructure preparation.',
        'Initial sync consumes resources.',
        'Forced reconfig is not routine.',
        'Validate the new member before cleanup.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 16,
    question:
      'You must perform maintenance on the current Primary of a busy production replica set. How would you execute a controlled Primary transition and validate the application afterward?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 16,

    answer: {
      groundZero: `Primary maintenance should normally be prepared so another eligible, healthy member can become Primary.

The transition itself may cause a brief interruption while drivers discover the new Primary.

The DBA should make the event controlled and observable.`,

      coreConcept: `Current Primary
      |
pre-check Secondaries
      |
      v
controlled stepdown
      |
      v
election
      |
      v
new Primary
      |
      v
maintain old Primary
      |
      v
rejoin + validate`,

      detailedExplanation: `PRE-CHECK

Verify:

• all expected members healthy
• replication lag acceptable
• sufficient voting majority
• at least one appropriate electable Secondary
• application drivers use replica-set discovery
• no critical maintenance operation is already running.

BACKUP/RISK

For significant maintenance, verify required backup/change controls.

APPLICATION COMMUNICATION

A controlled election may produce a short period where writes are retried or temporarily fail depending on driver/application configuration.

Coordinate accordingly.

STEPDOWN

Use the supported controlled stepdown procedure.

Do not simply kill the Primary to force an election during planned maintenance.

ELECTION

Observe:

• old Primary leaves PRIMARY
• eligible member becomes PRIMARY
• replica set stabilizes.

MAINTENANCE

After a new Primary is confirmed, perform the required work on the old Primary.

RETURN

Start the old member and verify:

• it rejoins
• it becomes SECONDARY unless election configuration causes otherwise
• it catches up
• no startup errors exist.

APPLICATION VALIDATION

Test:

• connection
• reads
• writes
• error rates
• latency
• connection-pool recovery.

Do not assume rs.status() alone proves the application is healthy.

POST-CHECK

Review:

• replica-set health
• lag
• logs
• monitoring
• application metrics.

Whether the original Primary should become Primary again is an operational/topology decision; do not trigger unnecessary elections merely to restore the previous hostname as Primary.`,

      internalWorking: `P1       S2       S3
 |
stepDown
 |
 v
S2 becomes P
 |
maintain P1
 |
P1 returns S
 |
cluster stable`,

      architecture: `BEFORE
 P1 ---> application
 |
 +--- S2
 |
 +--- S3

TRANSITION
 S2 ---> new Primary
 |
 +--- S3

P1 maintenance

AFTER
 P2/S2
 |
 +--- S3
 |
 +--- old P1 as Secondary`,

      examples: [
        `A healthy Secondary with replication lag should be evaluated before allowing it to become Primary.`,
        `The application may observe a brief topology transition even during a successful planned stepdown.`,
        `There is usually no reason to force another election solely to return Primary status to the old host.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Validates replica-set state before, during and after the transition.'
        },
        {
          command:
            'rs.stepDown()',
          explanation:
            'Initiates controlled Primary stepdown when used appropriately. Exact options and behavior should be checked for the deployed MongoDB version.'
        }
      ],

      productionScenario: `The Primary needs an OS patch.

Both Secondaries are healthy and caught up.

The DBA coordinates the change, performs a controlled stepdown, confirms a Secondary becomes Primary and verifies application writes recover.

The old Primary is patched and restarted, rejoins as a Secondary and catches up.

No additional election is triggered just to restore the original Primary.`,

      troubleshootingApproach: `1. Verify topology.

2. Verify lag.

3. Verify electable members.

4. Verify majority.

5. Coordinate application impact.

6. Perform controlled stepdown.

7. Confirm new Primary.

8. Validate application.

9. Maintain old Primary.

10. Restart old member.

11. Verify SECONDARY/catch-up.

12. Perform final application and cluster checks.`,

      commonMistakes: [
        'Killing the Primary during planned maintenance.',
        'Stepping down before checking Secondary health.',
        'Checking MongoDB but not the application.',
        'Forcing the original host back to Primary unnecessarily.',
        'Ignoring driver retry and topology-discovery behavior.'
      ],

      bestPractices: [
        'Use controlled transitions.',
        'Ensure an eligible caught-up Secondary exists.',
        'Coordinate application expectations.',
        'Validate writes after election.',
        'Avoid unnecessary elections.'
      ],

      interviewAnswer: `Before Primary maintenance I verify healthy caught-up Secondaries, voting majority and an eligible election candidate. I coordinate the expected brief application transition and perform a controlled stepdown rather than killing mongod.

After election I validate the new Primary and application reads/writes, perform maintenance on the old Primary, then verify it rejoins and catches up as a Secondary.`,

      keyTakeaways: [
        'Primary maintenance should be planned around election readiness.',
        'Stepdown is preferable to crash-style failover.',
        'Application validation is mandatory.',
        'The old Primary can normally rejoin as Secondary.',
        'Avoid unnecessary extra elections.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 17,
    question:
      'How should an L3 DBA perform rolling MongoDB configuration changes across a replica set without creating inconsistent or unsafe member behavior?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 17,

    answer: {
      groundZero: `A configuration change can affect:

startup
networking
storage
security
replication
or runtime behavior.

Rolling configuration means changing one member at a time while keeping the replica set available and validating compatibility throughout.`,

      coreConcept: `Review change
     |
test compatibility
     |
Secondary 1
     |
validate
     |
Secondary 2
     |
validate
     |
Primary transition
     |
Primary change
     |
final validation`,

      detailedExplanation: `1. CLASSIFY THE SETTING

Determine whether it is:

• runtime parameter
• startup configuration
• replica-set configuration
• storage setting
• security/TLS setting.

These are not interchangeable.

2. CHECK VERSION SUPPORT

Configuration options can:

• change names
• change defaults
• become unsupported
• behave differently

between MongoDB releases.

3. DETERMINE MIXED-STATE SAFETY

During rolling maintenance, some members temporarily use the old setting while others use the new one.

Verify that this mixed state is supported.

4. BACK UP CONFIGURATION

Preserve the last known working configuration.

5. CHANGE ONE SECONDARY

Apply the change and restart only if required.

6. VALIDATE

Confirm:

• startup
• SECONDARY state
• replication
• logs
• expected setting.

7. CONTINUE ONE MEMBER AT A TIME

Never update all members simultaneously simply for consistency.

8. PRIMARY

After Secondaries are healthy, transition Primary responsibility when required and apply the change to the old Primary.

9. REPLICA-SET CONFIGURATION

Changes to rs.conf() are logically different from changing mongod.conf.

Voting/priority changes can affect elections and majority.

10. FINAL VALIDATION

Compare configuration and health across all members.

SECURITY EXAMPLE

TLS changes can break both:

• client connectivity
• member-to-member connectivity.

Therefore certificate and trust changes require special transition planning.

STORAGE SETTINGS

Some storage-engine settings cannot simply be changed dynamically for existing data.

Always verify the exact semantics for the setting and MongoDB version.`,

      internalWorking: `Old config everywhere
       |
change S1
       |
old/new mixed state
       |
validate
       |
change S2
       |
validate
       |
transition P
       |
change old P
       |
new config everywhere`,

      architecture: `Stage 1:
 P(old)
 S1(new)
 S2(old)

Stage 2:
 P(old)
 S1(new)
 S2(new)

Stage 3:
 new Primary
 old P -> new config

Final:
 all validated`,

      examples: [
        `A removed configuration option can prevent a member from starting after upgrade.`,
        `TLS configuration changes require planning for both internal replication and application clients.`,
        `Replica-set priority changes can alter election behavior even though no mongod.conf file changed.`
      ],

      commands: [
        {
          command:
            'mongod --config <config-path>',
          explanation:
            'Conceptually demonstrates that mongod reads startup configuration; do not use it to launch a duplicate production process against an active dbPath.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Reviews replica-set configuration when the change concerns member settings such as votes or priority.'
        }
      ],

      productionScenario: `A configuration option must change on all three members.

The DBA updates one Secondary and discovers that the new option is invalid for the installed MongoDB version.

Because only one Secondary was changed, the Primary and another Secondary remain healthy.

The change is stopped and rolled back without causing cluster-wide downtime.`,

      troubleshootingApproach: `1. Identify setting type.

2. Verify version support.

3. Verify mixed-state compatibility.

4. Preserve old configuration.

5. Change one Secondary.

6. Restart if required.

7. Validate state and logs.

8. Continue to next Secondary.

9. Transition Primary if required.

10. Change old Primary.

11. Compare final configuration.

12. Validate application.`,

      commonMistakes: [
        'Changing every node simultaneously.',
        'Assuming all configuration options are dynamic.',
        'Ignoring version-specific option changes.',
        'Confusing mongod.conf with rs.conf().',
        'Rolling TLS changes without trust-transition planning.'
      ],

      bestPractices: [
        'Change one member at a time.',
        'Verify mixed-state support.',
        'Preserve rollback configuration.',
        'Validate after every member.',
        'Treat security settings as connectivity changes.'
      ],

      interviewAnswer: `I first classify whether the change is a startup option, runtime parameter or replica-set configuration and verify its behavior for the deployed version. I confirm that the temporary mixed configuration during rolling maintenance is supported.

I then change one Secondary, validate startup and replication, continue member by member and handle the Primary last through a controlled transition when required.`,

      keyTakeaways: [
        'Configuration changes are version-sensitive.',
        'Mixed-state compatibility matters.',
        'Change one member at a time.',
        'rs.conf and mongod.conf are different control planes.',
        'Validate after every step.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 18,
    question:
      'A scheduled housekeeping job causes replication lag, high disk I/O, and increased application latency every week. How would an L3 DBA redesign the maintenance process?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 18,

    answer: {
      groundZero: `If a maintenance job repeatedly causes production degradation, the solution is not to accept the incident every week.

The DBA should change the workload shape.

Instead of:

huge burst

use:

smaller controlled work over time.`,

      coreConcept: `Weekly huge delete
       |
       v
write burst
       |
       +--> index work
       +--> oplog growth
       +--> replication lag
       +--> disk I/O
       +--> cache pressure
       |
       v
application latency


Redesign:
TTL / batching / archive / rate control`,

      detailedExplanation: `1. QUANTIFY THE JOB

Measure:

• documents affected
• duration
• delete/write rate
• disk I/O
• replication lag
• oplog window
• application latency.

2. IDENTIFY RETENTION LOGIC

If records expire solely by time, evaluate whether TTL is appropriate.

3. BATCHING

Instead of deleting millions of records in one operation, process controlled batches.

The ideal batch size is workload-dependent; there is no universal safe number.

4. THROTTLING

Pause or slow between batches if replication/storage cannot keep up.

5. ARCHIVAL

If data must be retained elsewhere, decouple archival and deletion where possible.

6. INDEXES

Deletion modifies applicable indexes too.

A collection with many indexes can make housekeeping more expensive.

Do not drop required indexes merely to speed deletion without workload analysis.

7. OPLOG

Deletes generate replicated operations and consume oplog history.

Monitor the oplog window during large housekeeping.

8. SECONDARY LAG

Do not continue pushing deletion throughput while Secondaries are increasingly unable to keep up.

9. STORAGE

Correlate:

• disk latency
• throughput
• queueing
• WiredTiger behavior.

10. SCHEDULE

Low-traffic periods can help, but scheduling alone is not a substitute for controlling workload.

11. TTL

TTL can spread eligible deletions asynchronously rather than producing one weekly burst, when the data model fits TTL semantics.

12. VALIDATE BUSINESS RULES

Ensure redesign preserves:

• retention requirement
• archival requirement
• compliance requirements.`,

      internalWorking: `BEFORE

7 days accumulated
      |
      v
massive delete
      |
      v
resource spike


AFTER

continuous TTL
or
small batches
 | | | | |
 v v v v v
controlled load`,

      architecture: `        RETENTION ENGINE
         /      |       \
       TTL    Batch    Archive
        |       |         |
        +-------+---------+
                |
                v
        controlled deletes
                |
                v
           replica set`,

      examples: [
        `Deleting ten million records in one burst can produce much greater operational impact than controlled batches.`,
        `A timestamp-based seven-day retention policy may be suitable for TTL.`,
        `Housekeeping should slow down if replication lag crosses the environment's safe operational limits.`
      ],

      commands: [
        {
          command:
            'db.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: <retention-seconds> })',
          explanation:
            'Conceptual TTL pattern when retention rules and MongoDB version support it.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used alongside monitoring to observe replication health during maintenance.'
        }
      ],

      productionScenario: `Every Sunday a job deletes one week of accumulated historical records.

Disk latency spikes and Secondaries fall behind.

The DBA confirms retention is based entirely on document age and redesigns the collection with an appropriate TTL strategy.

For another collection requiring archival, deletion is performed in rate-controlled batches.

The weekly performance incident disappears.`,

      troubleshootingApproach: `1. Baseline normal workload.

2. Measure housekeeping impact.

3. Determine retention logic.

4. Evaluate TTL.

5. Design batches where required.

6. Add throttling.

7. Monitor storage.

8. Monitor replication lag.

9. Monitor oplog window.

10. Validate application latency.

11. Tune batch rate from evidence.

12. Document new process.`,

      commonMistakes: [
        'Running the same harmful job every week.',
        'Choosing arbitrary huge batch sizes.',
        'Ignoring replication lag.',
        'Assuming off-peak scheduling solves everything.',
        'Using TTL without validating retention semantics.'
      ],

      bestPractices: [
        'Spread maintenance load.',
        'Use TTL for suitable expiration.',
        'Rate-limit manual housekeeping.',
        'Make lag/storage metrics part of job control.',
        'Validate business retention.'
      ],

      interviewAnswer: `I first correlate the housekeeping job with delete throughput, storage latency, oplog usage, replication lag and application latency. Then I redesign the workload rather than simply moving it to another time.

For pure time-based expiration I evaluate TTL. For complex retention I use controlled batches with monitoring and throttling so the job cannot overwhelm storage or replication.`,

      keyTakeaways: [
        'Maintenance should not repeatedly cause incidents.',
        'Control workload shape.',
        'TTL can eliminate large expiration bursts.',
        'Batching and throttling protect replication.',
        'Measure impact while the job runs.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 19,
    question:
      'A replica-set member repeatedly enters unhealthy states after maintenance even though restarting it temporarily fixes the issue. How should an L3 DBA investigate the recurring problem?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 19,

    answer: {
      groundZero: `Restarting a node may remove the symptom temporarily.

It does not prove the problem is fixed.

Recurring failures require comparison across:

• database
• storage
• network
• OS
• configuration
• workload.`,

      coreConcept: `Member unhealthy
      |
restart
      |
temporarily healthy
      |
fails again
      |
      v
DO NOT repeat forever
      |
      v
Find recurring trigger
      |
      v
Root cause`,

      detailedExplanation: `1. DEFINE "UNHEALTHY"

Determine the exact state:

• DOWN
• RECOVERING
• STARTUP2
• excessive lag
• process crash
• heartbeat failures
• storage stalls.

2. BUILD TIMELINE

For every occurrence capture:

• timestamp
• member state
• workload
• MongoDB logs
• OS metrics
• maintenance/change events.

3. COMPARE WITH HEALTHY MEMBERS

If only one node fails, compare:

• hardware/storage
• MongoDB configuration
• version
• filesystem
• network
• OS settings.

4. STORAGE

A weak disk can cause:

• high latency
• replication lag
• checkpoint/eviction pressure
• timeouts.

5. NETWORK

Intermittent connectivity can cause heartbeat and replication problems.

6. CAPACITY

Check:

• disk exhaustion
• memory pressure
• CPU saturation
• oplog window.

7. CONFIGURATION DRIFT

The affected member may have a different:

• mongod.conf
• package version
• TLS certificate
• OS configuration
• mount option.

8. LOG PATTERN

Find the first recurring warning/error before each failure.

9. RESTART EFFECT

Ask what restart actually changes.

It may:

• reset connections
• clear process memory
• restart replication
• temporarily reduce queues.

That information can help diagnosis, but restart itself is not root cause.

10. REBUILD DECISION

If the member's local state/storage is suspect and healthy authoritative replicas exist, controlled replacement/resync may be considered after root-cause analysis.

If the underlying disk/network remains faulty, rebuilding onto the same broken infrastructure will not solve the incident.

11. RCA

Document why the issue recurs and why the corrective action addresses the cause.`,

      internalWorking: `Failure #1 ----+
Failure #2 ----+ |
Failure #3 --+ | |
             v v v
        common pattern
             |
     +-------+-------+
     |       |       |
   disk    network config
     |       |       |
     +-------+-------+
             |
             v
          root cause`,

      architecture: ` Healthy node             Bad node
      |                     |
   config A              config ?
   disk A                disk ?
   network A             network ?
   version A             version ?
      |                     |
      +------ compare -------+`,

      examples: [
        `A restart may temporarily clear a connection storm while the application continues recreating the problem.`,
        `One Secondary may lag repeatedly because its storage latency is much higher than the other members.`,
        `Configuration drift can explain why only one member fails after identical-looking maintenance.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Captures the exact member state and replica-set view.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server metrics that can be compared with healthy periods and members.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms binary version when member drift is suspected.'
        }
      ],

      productionScenario: `One Secondary falls hours behind every evening.

Restarting it allows temporary catch-up.

The DBA compares all nodes and discovers that this member resides on storage with consistently high write latency during the same period.

Moving/reprovisioning the member on suitable storage resolves the recurring problem; repeated restarts never would have.`,

      troubleshootingApproach: `1. Define exact unhealthy state.

2. Capture timestamps.

3. Correlate MongoDB logs.

4. Compare healthy members.

5. Compare configuration/version.

6. Compare storage latency.

7. Compare CPU/memory.

8. Check network.

9. Check workload timing.

10. Determine why restart helps.

11. Correct root cause.

12. Validate across multiple workload cycles.`,

      commonMistakes: [
        'Using restart as permanent remediation.',
        'Investigating only MongoDB.',
        'Ignoring differences between members.',
        'Rebuilding onto faulty infrastructure.',
        'Closing the incident after temporary recovery.'
      ],

      bestPractices: [
        'Build recurring-event timelines.',
        'Compare against healthy members.',
        'Correlate database and infrastructure metrics.',
        'Fix the recurring trigger.',
        'Validate across representative workload periods.'
      ],

      interviewAnswer: `If restarting repeatedly fixes a member only temporarily, I treat restart as symptom recovery, not root-cause remediation. I define the exact unhealthy state and correlate each occurrence with MongoDB logs, storage, network, CPU, memory and workload.

I compare the failing member against healthy members for configuration and infrastructure drift, then correct the recurring trigger and validate over multiple workload cycles.`,

      keyTakeaways: [
        'Restart is not root-cause analysis.',
        'Recurring failures need timeline correlation.',
        'Healthy members provide useful comparison baselines.',
        'Infrastructure can be the root cause.',
        'Validate the permanent fix over time.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'administration_maintenance',
    topicId: 'administration-maintenance',
    topicNumber: 17,
    topicName: 'MongoDB Administration & Maintenance',
    questionNumber: 20,
    question:
      'You are the L3 DBA during a production maintenance incident: one Secondary fails to restart, disk space is critically low, replication lag is increasing, and the application is still writing heavily. How would you manage the incident end to end?',
    level: 'L3+',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `Complex incidents must be handled by priority.

Do not try random fixes on every symptom simultaneously.

The order is generally:

protect availability
→ stop the situation getting worse
→ preserve authoritative data
→ restore redundancy
→ validate service
→ determine root cause.`,

      coreConcept: `INCIDENT

Secondary failed
Disk critical
Lag growing
Writes heavy
     |
     v
1. Protect surviving majority
     |
     v
2. Stop risky maintenance
     |
     v
3. Control disk growth
     |
     v
4. Diagnose failed member
     |
     v
5. Restore redundancy
     |
     v
6. Validate application
     |
     v
7. RCA`,

      detailedExplanation: `PHASE 1 — DECLARE AND STABILIZE

Stop the planned maintenance sequence.

Do not restart another member.

Identify:

• current Primary
• healthy members
• voting majority
• application status.

PHASE 2 — PROTECT THE AUTHORITATIVE DATA

Confirm the Primary and remaining healthy member are current.

Avoid:

• forced reconfiguration
• deleting MongoDB files
• promoting stale data
• unnecessary elections.

PHASE 3 — HANDLE CRITICAL DISK

Calculate:

• free GB
• growth rate
• time to exhaustion.

Identify whether space is consumed by:

• database growth
• logs
• backup files
• temporary files
• unexpected operations.

Expand capacity or remove only verified disposable files.

PHASE 4 — CONTROL WORKLOAD

If the heavy write workload is causing imminent disk exhaustion or making recovery impossible, coordinate with the application/business team.

Possible controlled responses may include:

• throttling non-critical ingestion
• pausing bulk jobs
• stopping housekeeping/import workloads.

Do not unilaterally stop business-critical writes unless emergency procedures authorize it.

PHASE 5 — INVESTIGATE FAILED SECONDARY

Read its startup logs.

Check:

• filesystem mount
• disk
• configuration
• permissions
• port
• TLS
• version
• WiredTiger recovery.

Do not run destructive recovery commands.

PHASE 6 — WATCH OPLOG WINDOW

Because the Secondary is down while writes continue, track:

• replication lag of remaining Secondary
• oplog window
• outage duration.

If the failed member remains offline beyond retained history, initial sync may be required.

PHASE 7 — RECOVER REDUNDANCY

If the member can be safely repaired non-destructively, restart and catch it up.

If local data is unusable/stale and healthy authoritative replicas exist, plan supported resynchronization or replacement.

PHASE 8 — VALIDATE

After redundancy returns verify:

• one healthy Primary
• expected Secondaries
• lag recovered
• disk stabilized
• application reads/writes
• monitoring
• backup status.

PHASE 9 — RCA

Build a timeline.

Determine:

• why the Secondary failed
• why disk reached critical level
• why alerts/capacity planning did not prevent it
• whether maintenance planning was insufficient
• whether workload contributed.

PHASE 10 — PREVENTION

Potential corrective actions:

• earlier capacity alerts
• improved oplog safety margin
• maintenance stop criteria
• backup staging controls
• automated pre-checks
• application throttling procedure
• tested member-replacement runbook.`,

      internalWorking: `                  INCIDENT
                     |
            +--------+--------+
            |                 |
       availability        capacity
            |                 |
            +--------+--------+
                     |
                  stabilize
                     |
             failed Secondary
                     |
                  recover
                     |
                redundancy
                     |
                  validate
                     |
                    RCA`,

      architecture: `                APPLICATION
                     |
                heavy writes
                     |
                     v
                 PRIMARY
                /       \
               /         \
      healthy S           failed S
          |
      lag rising

Meanwhile:
filesystem -> critical

L3 priority:
preserve P + healthy S
then stabilize capacity
then recover failed S.`,

      examples: [
        `Restarting the healthy Secondary while another Secondary is already down could unnecessarily reduce availability.`,
        `Deleting WiredTiger files for emergency disk space could convert a recoverable incident into data loss.`,
        `Continuing a bulk import while disk exhaustion is minutes away may be less important than temporarily throttling that workload through the approved incident process.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Establishes current replica-set topology and member health.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps assess current oplog coverage where available.'
        },
        {
          command:
            'df -h',
          explanation:
            'Shows filesystem capacity during the incident.'
        },
        {
          command:
            'tail -n 200 <mongod-log-path>',
          explanation:
            'Reviews the failed member startup/error evidence.'
        }
      ],

      productionScenario: `During a rolling maintenance window, the first Secondary fails after restart.

At the same time, the database filesystem reaches 96% and a bulk ingestion process continues writing heavily.

The DBA immediately stops further maintenance and confirms the Primary and remaining Secondary are healthy.

The disk-growth source is identified, the non-critical bulk ingestion is throttled through the incident process, and safe capacity is restored.

The failed Secondary is then diagnosed from logs rather than manipulated destructively.

After it returns or is resynchronized, the DBA validates replication and application behavior before closing the incident and producing an RCA.`,

      troubleshootingApproach: `1. Stop further maintenance.

2. Establish incident ownership.

3. Confirm Primary and majority.

4. Protect healthy members.

5. Measure disk exhaustion time.

6. Identify disk consumers.

7. Expand capacity or safely remove disposable data.

8. Coordinate workload throttling if required.

9. Monitor oplog window.

10. Diagnose failed Secondary from logs.

11. Avoid destructive recovery.

12. Restore the member or resync safely.

13. Verify full replication health.

14. Validate application reads/writes.

15. Validate backup/monitoring.

16. Build unified incident timeline.

17. Produce root cause and preventive actions.`,

      commonMistakes: [
        'Continuing rolling maintenance after the first unexpected failure.',
        'Restarting healthy members during degraded redundancy.',
        'Deleting MongoDB storage files for emergency space.',
        'Using forced reconfiguration without necessity.',
        'Ignoring application workload during recovery.',
        'Closing the incident immediately after mongod starts.'
      ],

      bestPractices: [
        'Protect availability before completing maintenance.',
        'Use explicit stop criteria.',
        'Preserve authoritative data.',
        'Coordinate workload control.',
        'Restore redundancy before resuming maintenance.',
        'Complete an evidence-based RCA.'
      ],

      interviewAnswer: `In a combined maintenance incident I stop further maintenance immediately and establish the current Primary, healthy members and voting majority. I protect the surviving authoritative copies and avoid forced reconfiguration or destructive file operations.

I then address the most immediate availability threat, such as disk exhaustion, by identifying growth, safely creating capacity and coordinating workload throttling if necessary. In parallel I monitor the oplog window and diagnose the failed Secondary from its logs and infrastructure state.

After safely restoring or resynchronizing the member, I validate replica health, application reads/writes, capacity and backups. Finally I build an evidence-based RCA and improve capacity alerts, maintenance stop criteria and recovery runbooks.`,

      keyTakeaways: [
        'Stop planned maintenance when unexpected degradation occurs.',
        'Protect surviving majority first.',
        'Disk exhaustion can become an immediate availability threat.',
        'Do not use destructive shortcuts.',
        'Monitor oplog coverage during extended recovery.',
        'Recovery includes application validation.',
        'RCA should produce preventive controls.'
      ]
    }
  }

];

/* =========================================================
   SEED FUNCTION
========================================================= */

async function seedAdministrationMaintenance() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'administration_maintenance'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous administration_maintenance documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} MongoDB Administration & Maintenance questions`
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
        category: 'administration_maintenance'
      });

    console.log(
      `Topic 17 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 17 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 17 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 17 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedAdministrationMaintenance();
