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
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 1,
    question:
      'What is Point-in-Time Recovery in MongoDB, and how is PITR different from restoring only the latest full backup?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `Point-in-Time Recovery, or PITR, means recovering MongoDB data to a selected point in time rather than only to the timestamp of the last full backup.

Example:

Full backup:
01:00 AM

Accidental delete:
10:15 AM

If only the full backup exists, recovery may stop at 01:00 AM.

With PITR change history, the DBA may restore the 01:00 backup and replay changes up to just before 10:15 AM.`,

      coreConcept: `Full backup only:

01:00 backup
    |
    v
restore
    |
    v
01:00 state


PITR:

01:00 backup
    |
    +--> changes
    +--> changes
    +--> changes
    |
    v
10:14:59
    |
    v
recover just before incident`,

      detailedExplanation: `A full backup gives a base recovery point.

PITR adds the ability to recover changes that occurred after that base.

Conceptually:

BASE BACKUP
+
CHANGE HISTORY
=
RECOVERY TO SELECTED TIME

In MongoDB, the replication oplog is the fundamental ordered history of data-changing operations in a replica set.

Backup products and continuous-backup systems can use change capture to provide point-in-time recovery capabilities.

Consider:

Full backup:
Sunday 00:00

Accidental update:
Tuesday 14:37

If only Sunday's full backup exists, restoring it may lose more than two days of valid changes.

If continuous change history exists through Tuesday 14:36:59, the system can potentially recover much closer to the incident.

PITR therefore improves RPO.

But PITR is not merely:

"copy the oplog somewhere."

A reliable PITR system must maintain:

• consistent base backups
• continuous change capture
• retention
• ordering
• backup metadata
• recovery tooling
• validation.

The precise implementation depends on whether you use:

• MongoDB Atlas
• Ops Manager
• Cloud Manager/managed tooling
• another supported backup platform
• a custom architecture.

For custom recovery procedures, version-specific behavior and consistency requirements must be understood carefully.`,

      internalWorking: `Timeline:

00:00 Full backup
 |
 | valid write A
 |
 | valid write B
 |
 | valid write C
 |
 | accidental delete
 v
14:00

PITR target:

13:59:59

Restore:
base
+
all valid changes
before delete.`,

      architecture: `             PRODUCTION
                  |
          +-------+-------+
          |               |
          v               v
      Full backup      Change history
          |               |
          +-------+-------+
                  |
                  v
           Recovery engine
                  |
                  v
        Selected point in time`,

      examples: [
        `Recover to one second before an accidental delete where supported by the backup system.`,
        `Recover yesterday's snapshot and replay captured changes to a later timestamp.`,
        `PITR is especially important where daily backup RPO is too large.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows the current oplog time range on a replica set. This helps understand available local oplog history but does not by itself constitute a complete PITR system.'
        }
      ],

      productionScenario: `A payment application has:

daily full backup at midnight.

At 16:42, an application bug incorrectly updates millions of payment records.

Restoring only midnight's backup would lose more than sixteen hours of valid transactions.

The backup system has continuous recovery data.

The DBA restores the base backup and recovers to:

16:41:59

just before the bad deployment changed the data.`,

      troubleshootingApproach: `When evaluating PITR:

1. Identify latest base backup.

2. Identify available continuous change history.

3. Verify the change stream/oplog coverage has no gaps.

4. Identify incident timestamp.

5. Determine desired recovery timestamp.

6. Confirm backup system supports that point.

7. Restore into isolated environment.

8. Replay to target time.

9. Validate critical data.

10. Measure achieved RPO and RTO.`,

      commonMistakes: [
        'Calling a daily backup PITR.',
        'Assuming local oplog alone is a durable long-term PITR archive.',
        'Recovering to the incident timestamp instead of just before the destructive operation.',
        'Ignoring gaps in change capture.',
        'Never testing point-in-time restore.'
      ],

      bestPractices: [
        'Maintain tested base backups.',
        'Continuously protect required change history.',
        'Monitor backup gaps.',
        'Record timestamps accurately.',
        'Test recovery to specific points in time.'
      ],

      interviewAnswer: `PITR allows MongoDB to be recovered to a selected timestamp by restoring a base backup and applying captured changes up to the desired recovery point.

It provides a smaller RPO than restoring only a periodic full backup. I treat PITR as a complete recovery system consisting of consistent base backups, continuous change capture, retention, metadata, and tested replay procedures.`,

      keyTakeaways: [
        'PITR recovers to a chosen time.',
        'A full backup provides the base.',
        'Continuous changes fill the gap after the base.',
        'PITR improves RPO.',
        'The whole recovery chain must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 2,
    question:
      'What role does the MongoDB oplog play in point-in-time recovery, and why should a DBA understand oplog retention even when using a backup product?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `The oplog is the ordered operation log used by MongoDB replica sets for replication.

It records data-changing operations that Secondaries use to reproduce the Primary's changes.

Because it represents change history, oplog data is also important to many backup and PITR workflows.`,

      coreConcept: `Primary writes
    |
    v
oplog
    |
    +--> Secondary replication
    |
    +--> backup/change capture
    |
    v
recovery history`,

      detailedExplanation: `The oplog is stored in:

local.oplog.rs

on replica-set members.

It behaves as a capped collection.

Conceptually:

Application write
     |
     v
Primary applies operation
     |
     v
Operation recorded in oplog
     |
     v
Secondaries fetch/apply operation.

Backup systems may capture oplog or equivalent change history to extend recovery beyond a base snapshot.

The DBA should understand oplog retention because local history is finite.

Example:

Oplog size:
100 GB

Current write rate:
25 GB/hour

Approximate history:
4 hours

If a backup job, initial sync, or change-capture process falls more than four hours behind, required history may be overwritten.

The exact relationship is not simply:

oplog size / logical user data writes

because oplog generation depends on actual operations.

Therefore always measure the real time window.

A PITR product may persist change history outside the local oplog, but its capture process still needs a reliable source and must avoid gaps.

Monitoring only:

"backup status = green"

without understanding capture continuity can hide risk.`,

      internalWorking: `Oplog:

T1 operation
T2 operation
T3 operation
...
T100 operation

Capped collection fills
        |
        v
oldest entries overwritten

Therefore history is finite.`,

      architecture: `               PRIMARY
                  |
                  v
                OPLOG
             /         \
            v           v
      SECONDARIES   BACKUP CAPTURE
                         |
                         v
                  PITR ARCHIVE`,

      examples: [
        `A 24-hour oplog window gives more catch-up margin than a 2-hour window.`,
        `High write bursts can shrink the time window even if oplog size does not change.`,
        `Backup capture lag should be compared with available oplog history.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows oplog size and approximate time span.'
        },
        {
          command:
            'db.getSiblingDB("local").getCollection("oplog.rs").stats()',
          explanation:
            'Provides oplog collection statistics.'
        }
      ],

      productionScenario: `A backup agent becomes unavailable for six hours.

The replica set has only a four-hour oplog window.

When the agent returns, some required oplog history has already been overwritten.

The PITR chain may now contain a gap.

The DBA cannot simply assume continuous recovery is intact because the current backup agent is healthy again.`,

      troubleshootingApproach: `1. Check oplog time window.

2. Check write-rate changes.

3. Check backup/change-capture lag.

4. Identify any agent downtime.

5. Determine whether history was overwritten.

6. Check for gaps in backup system coverage.

7. Increase oplog size if operationally justified.

8. Fix capture reliability.

9. Re-establish a valid base backup if required.

10. Test PITR afterward.`,

      commonMistakes: [
        'Thinking oplog history is infinite.',
        'Sizing oplog only by GB and ignoring hours.',
        'Ignoring write-rate bursts.',
        'Assuming backup capture can catch up after any outage.',
        'Using local oplog as the only durable DR archive.'
      ],

      bestPractices: [
        'Monitor oplog window in time, not only bytes.',
        'Maintain safety margin for outages and lag.',
        'Alert on change-capture delay.',
        'Revalidate PITR continuity after capture failures.',
        'Use persistent backup storage for long-term recovery history.'
      ],

      interviewAnswer: `The oplog is MongoDB's ordered replication history. Secondaries use it to replicate changes, and backup/PITR systems can use it or equivalent change capture to extend recovery beyond a base backup.

Because the oplog is capped and finite, I monitor its actual time window and compare that with replication and backup-capture lag. If required history is overwritten, a PITR gap can occur.`,

      keyTakeaways: [
        'The oplog stores ordered change history.',
        'It is finite.',
        'Write rate affects time retention.',
        'PITR capture must avoid gaps.',
        'Oplog window should be actively monitored.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 3,
    question:
      'What is the oplog window, how do you interpret it, and why is it important for replication, backups, initial sync, and disaster recovery?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `The oplog window is the amount of time between the oldest and newest operations currently retained in the oplog.

Example:

Oldest oplog entry:
08:00

Newest:
20:00

Oplog window:
approximately 12 hours.`,

      coreConcept: `Oldest oplog entry
08:00
   |
   | retained history
   |
   v
Newest oplog entry
20:00

Window ≈ 12 hours`,

      detailedExplanation: `The oplog has a configured/storage size, but DBAs often care more about:

How many hours of operations are currently retained?

The same oplog size can provide very different windows.

Example:

100 GB oplog

Environment A:
5 GB/hour oplog generation
≈ 20 hours

Environment B:
25 GB/hour
≈ 4 hours

Therefore the oplog window changes dynamically with workload.

WHY IT MATTERS FOR REPLICATION

A Secondary that is offline longer than the available oplog history may be unable to catch up incrementally.

It can become stale and may require initial sync.

WHY IT MATTERS FOR BACKUP

If a backup/change-capture workflow depends on oplog entries and falls behind beyond available history, it can lose continuity.

WHY IT MATTERS FOR INITIAL SYNC

During a long synchronization process, sufficient operation history may be required so the syncing member can reconcile writes occurring during the process.

Exact initial-sync internals vary by MongoDB version, but insufficient historical headroom is an important operational risk.

WHY IT MATTERS FOR DR

Oplog retention gives the DBA a local recovery/history window, but local oplog alone should not be confused with a complete disaster-recovery archive.

The DBA should monitor:

• current window
• normal window
• minimum observed window
• peak write-rate window.`,

      internalWorking: `Fixed-ish allocated oplog capacity
       |
       v
Write rate changes
       |
   +---+---+
   |       |
 low      high
   |       |
   v       v
longer   shorter
window   window`,

      architecture: `                 OPLOG
        oldest ---------------- newest
           |                       |
           +-----------------------+
               time retention
                     |
          +----------+----------+
          |          |          |
          v          v          v
      replication   backup    recovery
       catch-up     capture     margin`,

      examples: [
        `50 GB oplog during low writes might retain a day.`,
        `The same 50 GB during a batch import might retain only two hours.`,
        `Monitor the smallest window during peak traffic, not only the average.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Displays oplog size and time range in mongosh.'
        }
      ],

      productionScenario: `A Secondary is taken offline for planned maintenance.

Normal oplog window:
18 hours.

Maintenance planned:
6 hours.

During maintenance, a bulk import begins and increases oplog generation dramatically.

Actual window shrinks to:
4 hours.

When the Secondary returns after six hours, it can no longer find the required history and must be resynchronized.

The mistake was relying on the normal window instead of considering peak workload.`,

      troubleshootingApproach: `1. Measure current oplog window.

2. Record normal workload window.

3. Record peak workload window.

4. Measure Secondary lag.

5. Measure backup-capture lag.

6. Estimate maintenance duration.

7. Estimate bulk-operation impact.

8. Increase oplog capacity where justified.

9. Alert when lag approaches available history.

10. Recheck after major workload changes.`,

      commonMistakes: [
        'Treating oplog size and oplog time window as the same thing.',
        'Using average write rate for all planning.',
        'Ignoring bulk import/update activity.',
        'Scheduling long maintenance with no safety margin.',
        'Not monitoring backup capture against the window.'
      ],

      bestPractices: [
        'Monitor hours of history.',
        'Plan against peak write rates.',
        'Maintain generous safety margin.',
        'Review oplog sizing after workload growth.',
        'Alert before lag consumes the available window.'
      ],

      interviewAnswer: `The oplog window is the time span between the oldest and newest retained oplog entries. Its duration depends on both oplog capacity and workload-generated oplog volume.

It is important because Secondaries and backup/change-capture systems need sufficient history to catch up. I monitor the actual time window, especially during peak writes, and maintain safety margin beyond expected outages or maintenance.`,

      keyTakeaways: [
        'Oplog window is a time measurement.',
        'High write rates shorten it.',
        'Replication catch-up depends on it.',
        'Backup continuity can depend on it.',
        'Peak workload matters more than averages.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 4,
    question:
      'How do MongoDB Timestamp values work in the oplog, and how should a DBA think about timestamps when selecting a PITR recovery point?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `MongoDB oplog entries contain a BSON Timestamp value.

It is commonly represented as:

Timestamp(seconds, increment)

The first component represents seconds since the Unix epoch.

The second component distinguishes operations within the same second.`,

      coreConcept: `Timestamp:

Timestamp(t, i)

t = seconds component
i = increment within that second

Example concept:

Timestamp(1720000000, 1)
Timestamp(1720000000, 2)
Timestamp(1720000000, 3)

Three ordered operations
within the same second.`,

      detailedExplanation: `A MongoDB Timestamp is not identical to an ordinary BSON Date.

BSON Date represents a millisecond-based date/time value.

BSON Timestamp is primarily used internally for ordered operation sequencing.

In the oplog, each operation has a timestamp.

This makes it possible to reason about operation order.

For PITR, the recovery system needs to identify:

Which operation is the last safe operation before the incident?

Example:

10:15:20.000
valid writes

10:15:20.xxx
accidental delete operation

Recovering simply to:

10:15:20

without understanding operation ordering can be ambiguous if multiple operations happened within the same second.

A mature PITR product handles ordering internally.

For custom oplog analysis, the DBA should understand both components of the Timestamp.

Another important concept is clock interpretation.

Server logs may be in:

UTC

while business reports may state:

IST

The DBA must convert timestamps accurately before selecting recovery boundaries.

A timezone mistake can replay the very destructive operation the recovery was meant to avoid.`,

      internalWorking: `Same second:

Timestamp(1000,1)
valid update

Timestamp(1000,2)
valid insert

Timestamp(1000,3)
bad delete

Safe target is before:
Timestamp(1000,3)

Not simply:
"second 1000".`,

      architecture: `                 OPLOG
                    |
           ordered operations
              by Timestamp
             /     |      \
            v      v       v
           T1      T2      T3
                           |
                           X
                     bad operation

Recovery target:
before T3`,

      examples: [
        `Timestamp has seconds plus increment.`,
        `Multiple oplog entries can occur in one wall-clock second.`,
        `Convert UTC/IST or other timezones carefully when correlating incidents.`
      ],

      commands: [
        {
          command:
            'db.getSiblingDB("local").getCollection("oplog.rs").find().sort({$natural:-1}).limit(5)',
          explanation:
            'Shows recent oplog entries including their ts fields. Use carefully because oplog queries on large ranges can be expensive.'
        }
      ],

      productionScenario: `An operator reports:

"bad delete happened at 18:30 IST."

MongoDB logs use UTC.

The DBA incorrectly interprets 18:30 as UTC and selects the wrong recovery boundary.

Several hours of valid data are lost unnecessarily.

A proper incident workflow always normalizes all timestamps before choosing PITR boundaries.`,

      troubleshootingApproach: `1. Identify incident timezone.

2. Identify MongoDB log timezone.

3. Normalize to one timezone, preferably UTC.

4. Locate suspicious operation time.

5. Inspect operation ordering if needed.

6. Identify last safe recovery point.

7. Restore in test environment.

8. Validate that destructive operation is absent.

9. Verify preceding valid operations are present.`,

      commonMistakes: [
        'Treating BSON Timestamp as BSON Date.',
        'Ignoring the increment component.',
        'Using human-reported local time without timezone conversion.',
        'Recovering exactly to the bad-operation second without validating ordering.',
        'Selecting PITR boundary without test restore.'
      ],

      bestPractices: [
        'Normalize incident timelines to UTC.',
        'Preserve exact operation timestamps.',
        'Understand Timestamp ordering.',
        'Validate the chosen recovery point in isolation.',
        'Document timezone conversions in the RCA.'
      ],

      interviewAnswer: `MongoDB oplog entries use BSON Timestamp values containing a seconds component and an increment that orders multiple operations occurring in the same second.

For PITR I normalize incident times to a single timezone, identify the destructive operation precisely, and choose the last safe point before it. I validate that point through a test restore before production cutover.`,

      keyTakeaways: [
        'BSON Timestamp has two components.',
        'Multiple operations can share one wall-clock second.',
        'Timezone accuracy matters.',
        'PITR boundaries must exclude the bad operation.',
        'Always validate the selected timestamp.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 5,
    question:
      'How would you recover MongoDB data to just before an accidental delete or update operation?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `The goal is not simply to restore the latest backup.

The goal is to identify:

1. the last good base backup,
2. the destructive operation,
3. the last safe point immediately before it,
4. the available change history.

Then recover to that safe point.`,

      coreConcept: `Timeline:

09:00 full backup
   |
   +--> valid changes
   |
   +--> valid changes
   |
10:42 bad delete
   |
   v

Target:
just before 10:42

Recovery:
09:00 base
+
changes up to safe target`,

      detailedExplanation: `A structured recovery process is:

STEP 1 — STOP FURTHER DAMAGE

If the application bug is still active, stop or isolate it.

Do not restore while the same destructive process is continuing.

STEP 2 — PRESERVE EVIDENCE

Capture:

• logs
• operation time
• affected collections
• application deployment time
• audit data if available.

STEP 3 — IDENTIFY BAD OPERATION

Determine the exact time and ideally the precise operation boundary.

STEP 4 — IDENTIFY BASE BACKUP

Choose a validated backup before the incident.

STEP 5 — VERIFY CHANGE HISTORY

Ensure continuous PITR/oplog archive exists from the base through the target point.

STEP 6 — RESTORE INTO ISOLATION

Do not immediately overwrite production.

STEP 7 — APPLY CHANGES TO SAFE POINT

Replay valid operations only through the chosen recovery boundary.

STEP 8 — VALIDATE

Confirm:

• deleted documents exist
• bad update is absent
• valid transactions immediately before incident exist.

STEP 9 — CHOOSE RECOVERY METHOD

Depending on incident scope, the DBA may:

• replace an entire database
• restore selected collections
• reconcile only affected documents.

For a small logical deletion, selective reconciliation may reduce business disruption.

For widespread corruption, full PITR recovery may be safer.

STEP 10 — CUT OVER OR RECONCILE

Execute the approved production recovery procedure.`,

      internalWorking: `Production:
Good state
   |
   v
Bad delete
   |
   v
More writes

Recovery copy:
Base
  +
changes before delete
  |
  v
Good state

Then:
cutover or selective reconciliation.`,

      architecture: `          INCIDENT TIMELINE
                 |
        +--------+--------+
        |                 |
        v                 v
    base backup       bad operation
        |                 |
        +------changes----+
                 |
                 v
           safe timestamp
                 |
                 v
          isolated restore
                 |
                 v
             validation
                 |
                 v
             recovery`,

      examples: [
        `Recover the whole database to 12:59:59 before a 13:00 destructive script.`,
        `Restore one collection into a recovery namespace and copy only missing records.`,
        `Use audit/application evidence to determine exactly when corruption began.`
      ],

      commands: [
        {
          command:
            'db.getSiblingDB("local").getCollection("oplog.rs").find({ ns: "app.orders" }).sort({$natural:-1}).limit(20)',
          explanation:
            'Can assist in focused oplog analysis where appropriate. Avoid broad expensive oplog scans in production.'
        }
      ],

      productionScenario: `At 14:05, a script executes:

deleteMany({ status: "ARCHIVED" })

against the wrong collection.

The DBA stops the script immediately and identifies the operation timestamp.

A recovery environment is restored from the latest base backup and replayed to the final valid operation immediately before the delete.

The restored collection is compared with current production.

Because only one collection was affected, the team reconciles the missing records instead of rolling the entire application back in time.`,

      troubleshootingApproach: `1. Stop ongoing destructive activity.

2. Record incident time.

3. Identify affected namespace.

4. Preserve logs/audit information.

5. Identify latest valid base backup.

6. Verify PITR coverage.

7. Determine precise safe target.

8. Restore in isolation.

9. Validate before/after boundary.

10. Determine full cutover vs selective reconciliation.

11. Execute approved recovery.

12. Validate production afterward.`,

      commonMistakes: [
        'Restoring while the buggy application is still running.',
        'Choosing the bad operation time instead of the last safe point.',
        'Overwriting production immediately.',
        'Rolling back unrelated healthy data unnecessarily.',
        'Ignoring valid writes that occurred after the base backup.'
      ],

      bestPractices: [
        'Stop the source of corruption first.',
        'Preserve evidence.',
        'Use isolated recovery.',
        'Recover to a precise safe point.',
        'Choose the smallest safe recovery scope.'
      ],

      interviewAnswer: `For an accidental delete or update, I first stop the destructive workload and identify the exact operation time. I select a validated base backup and verify continuous recovery data exists through the last safe point before the bad operation.

I restore into an isolated environment, replay to that point, validate the affected data, and then decide whether a full cutover or selective reconciliation is the safer production recovery.`,

      keyTakeaways: [
        'Stop further corruption first.',
        'Find the last safe operation.',
        'Restore in isolation.',
        'Validate before production changes.',
        'Recovery scope should match incident scope.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 6,
    question:
      'What is the difference between full backup, incremental change capture, and continuous backup in a MongoDB disaster-recovery strategy?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `A full backup captures a complete base recovery state.

Incremental or continuous change capture records what changed after that base.

A complete PITR strategy usually needs both a base and the changes required to reach later recovery points.`,

      coreConcept: `Full backup:

complete base
Sunday 00:00


Change capture:

00:01
00:02
00:03
...
Tuesday 15:00


Recovery:

Base
+
required changes
=
selected point`,

      detailedExplanation: `FULL BACKUP

Contains a complete recoverable dataset at a point or consistent interval.

Advantages:

• self-contained base
• simple recovery starting point.

Disadvantage:

Taking full backups very frequently can be expensive.

INCREMENTAL CHANGE CAPTURE

Stores only changes after a previous recovery base.

This reduces the amount of repeated data that needs to be backed up.

CONTINUOUS BACKUP

A system continuously captures changes and typically manages:

• base snapshots
• incremental history
• retention
• restore-point catalog
• replay.

The important architectural concept is the recovery chain.

Example:

Sunday full snapshot
+
Monday changes
+
Tuesday changes
=
Tuesday recovery.

If part of that required chain is missing, some recovery points may become impossible.

Modern managed products may hide much of this implementation detail, but DBAs still need to understand:

• base snapshot freshness
• continuity
• retention
• recovery-point availability.

Do not assume:

"continuous backup enabled"

means:

"every second forever is recoverable."

Retention and product configuration still define what recovery points are available.`,

      internalWorking: `Base B0

B0
 |
 + C1
 |
 + C2
 |
 + C3
 |
 + C4
 |
 v
Current state

Recover at C2:

B0 + C1 + C2`,

      architecture: `             FULL BASE
                  |
                  v
          CONTINUOUS CHANGES
       C1 -> C2 -> C3 -> C4
                  |
             +----+----+
             |         |
             v         v
         PITR T2    PITR T4`,

      examples: [
        `Daily snapshot + continuous change capture.`,
        `Weekly base + incremental recovery data where supported.`,
        `Managed backup service maintaining recovery points automatically.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Useful for understanding the local source history available to some change-capture workflows.'
        }
      ],

      productionScenario: `A backup system keeps weekly snapshots and continuous operation history.

The weekly snapshot itself is seven days old, but PITR allows recovery to a timestamp only minutes before a failure.

The weekly base alone would have poor RPO.

The continuous change chain is what closes the gap.`,

      troubleshootingApproach: `1. Identify base backup schedule.

2. Identify continuous change mechanism.

3. Check recovery-point retention.

4. Check capture continuity.

5. Identify gaps.

6. Verify restore catalog.

7. Test old and recent recovery points.

8. Measure restore time from different base ages.

9. Verify retention matches business policy.`,

      commonMistakes: [
        'Treating incremental changes as useful without a valid base.',
        'Assuming full backups alone provide small RPO.',
        'Assuming continuous backup has infinite retention.',
        'Ignoring gaps in incremental history.',
        'Not testing old recovery points.'
      ],

      bestPractices: [
        'Maintain validated base backups.',
        'Monitor continuous capture.',
        'Define retention formally.',
        'Test multiple restore points.',
        'Document recovery-chain dependencies.'
      ],

      interviewAnswer: `A full backup provides a complete base state. Incremental or continuous capture preserves changes after that base. PITR combines the base with the required change history to reach a selected later point.

I monitor both base-backup validity and continuity of the incremental chain because losing either can invalidate recovery points.`,

      keyTakeaways: [
        'Full backup provides the base.',
        'Incremental capture provides later changes.',
        'PITR depends on the recovery chain.',
        'Continuity matters.',
        'Retention defines how far back recovery is possible.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 7,
    question:
      'How should a DBA design a MongoDB disaster-recovery strategy across availability zones or regions, and how is DR different from normal replica-set high availability?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `High availability and disaster recovery are related but different.

High availability handles expected component failures while keeping the service running.

Disaster recovery handles larger failures where the primary environment may become unusable.`,

      coreConcept: `HA:

One node/AZ fails
     |
     v
Replica set fails over


DR:

Entire site/region/cluster lost
     |
     v
Recover from alternate environment
or backup.`,

      detailedExplanation: `HIGH AVAILABILITY

Example:

3-member replica set across availability zones.

AZ1 member fails.

The remaining voting majority can elect/maintain a Primary.

This is HA.

DISASTER RECOVERY

Example:

An entire region becomes unavailable.

If all required infrastructure is inside that region, the local HA design may not help.

A DR strategy may use:

• cross-region members
• separate DR cluster
• continuous backup
• replicated snapshots
• warm standby
• cold standby
• managed multi-region capability.

The correct design depends on:

• RPO
• RTO
• latency
• cost
• consistency
• legal requirements
• network reliability.

A cross-region voting design must be planned carefully because election and majority behavior depend on member placement.

Placing members across regions without understanding network latency and failure domains can create availability problems.

A separate backup-based DR architecture may offer better isolation from logical corruption or security incidents than one continuously replicated cluster.

Therefore DR design should protect against:

• regional outage
• destructive administrator action
• application corruption
• ransomware/security events
• simultaneous infrastructure failures.`,

      internalWorking: `Normal HA:

Region A
AZ1 AZ2 AZ3
 |   |   |
Replica Set
   |
node/AZ failure
   |
continue


Regional DR:

Region A lost
   |
   v
Region B recovery path
   |
   +--> standby
   +--> backup
   +--> PITR`,

      architecture: `              REGION A
             Production
          /      |      \
        AZ1     AZ2     AZ3
                  |
                  |
          DR protection path
                  |
                  v
              REGION B
          +-------+-------+
          |               |
          v               v
       standby         backups
                       + PITR`,

      examples: [
        `Three nodes across one region's AZs can provide strong HA but not necessarily region-loss DR.`,
        `Cross-region standby can reduce RTO but increase cost.`,
        `Backup-based DR protects against some logical failures that replication may reproduce.`
      ],

      commands: [
        {
          command:
            'rs.conf()',
          explanation:
            'Useful for reviewing replica-set member placement, votes, and priorities when assessing HA topology.'
        }
      ],

      productionScenario: `A three-member replica set spans three availability zones in one cloud region.

The design survives an AZ outage.

A regional service failure later makes all three zones unreachable.

The company discovers that:

multi-AZ HA

was incorrectly described as:

cross-region DR.

The revised architecture maintains protected recovery capability in a second region.`,

      troubleshootingApproach: `1. Define disaster scenarios.

2. Separate HA from DR requirements.

3. Record RPO/RTO.

4. Map failure domains.

5. Review member placement.

6. Evaluate region-loss scenario.

7. Evaluate logical corruption scenario.

8. Evaluate security-compromise scenario.

9. Select standby/backup design.

10. Protect cross-region recovery data.

11. Test DNS/application cutover.

12. Run regional DR exercises.`,

      commonMistakes: [
        'Calling multi-AZ the same as multi-region DR.',
        'Placing voting members across high-latency links without election analysis.',
        'Assuming replication protects against logical corruption.',
        'Ignoring regional backup availability.',
        'Never testing application cutover.'
      ],

      bestPractices: [
        'Define HA and DR separately.',
        'Design around explicit failure domains.',
        'Protect recovery data across regions where required.',
        'Test regional failover.',
        'Include application and DNS/network recovery.'
      ],

      interviewAnswer: `Replica-set HA protects against member or availability-zone failures by maintaining a voting majority and failing over. DR addresses larger events such as complete region loss, destructive corruption, or security incidents.

I design DR from RPO/RTO and failure domains, using an appropriate mix of cross-region topology, standby infrastructure, backups, and PITR, and I test complete application cutover rather than only database startup.`,

      keyTakeaways: [
        'HA and DR are not the same.',
        'Multi-AZ does not automatically mean multi-region DR.',
        'DR must handle logical and infrastructure disasters.',
        'RPO/RTO determine the architecture.',
        'Regional recovery must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 8,
    question:
      'What are cold, warm, and hot disaster-recovery standby models for MongoDB, and how do they affect cost, RTO, and operational complexity?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `DR environments are often described as:

• cold
• warm
• hot.

These terms describe how ready the recovery environment is before a disaster.`,

      coreConcept: `COLD

Backup exists
Infrastructure created after disaster

Low cost
High RTO


WARM

Infrastructure partly/fully ready
Data refreshed regularly

Medium cost
Medium RTO


HOT

Recovery environment continuously ready

High cost
Low RTO`,

      detailedExplanation: `COLD STANDBY

Typical model:

• backups exist
• recovery infrastructure is not running
• servers/volumes are provisioned after disaster.

Advantages:

• lower cost.

Disadvantages:

• longer RTO
• more steps during emergency.

WARM STANDBY

Typical model:

• infrastructure exists
• some services are running
• data is replicated or refreshed periodically
• additional steps are needed before cutover.

Advantages:

• lower RTO than cold
• moderate cost.

HOT STANDBY

Typical model:

• recovery environment is continuously ready
• data is kept very current
• cutover may require only application/network changes.

Advantages:

• lowest RTO.

Disadvantages:

• highest cost
• more operational complexity
• risk of replicating logical corruption depending on architecture.

The terms are conceptual rather than MongoDB-specific product modes.

A DBA should choose based on requirements.

Example:

RTO = 24 hours
might justify cold DR.

RTO = 15 minutes
likely requires a far more prepared environment.

Also consider RPO.

A hot environment with asynchronous replication may still have some potential data lag.

A cold environment with excellent PITR may have good RPO but poor RTO.

Therefore RPO and RTO must be evaluated separately.`,

      internalWorking: `Cost / readiness:

Cold
  |
  | lower cost
  | longer recovery
  v

Warm
  |
  | moderate
  v

Hot
  |
  | high readiness
  | shortest recovery
  v`,

      architecture: `DR OPTIONS

COLD:
Backup -> build everything after failure

WARM:
Backup/replication -> prebuilt infrastructure -> activate

HOT:
Continuously ready recovery environment -> cutover`,

      examples: [
        `Cold: snapshots stored in another region, no running DB nodes.`,
        `Warm: recovery cluster exists but needs final restore/catch-up.`,
        `Hot: active standby designed for rapid cutover.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'In architectures using replica-set-based standby, replica health is one component of readiness validation.'
        }
      ],

      productionScenario: `A noncritical internal system has:

RTO = 12 hours.

A cold standby is cost-effective.

A payment platform has:

RTO = 10 minutes.

Provisioning servers, restoring terabytes, and rebuilding a replica set after disaster cannot meet that target.

A much warmer recovery design is required.`,

      troubleshootingApproach: `1. Define RPO.

2. Define RTO.

3. Estimate infrastructure provisioning time.

4. Estimate restore time.

5. Estimate replication/catch-up time.

6. Estimate application cutover time.

7. Calculate operating cost.

8. Choose cold/warm/hot model.

9. Test it.

10. Revisit when dataset or SLA changes.`,

      commonMistakes: [
        'Choosing hot standby only because it sounds best.',
        'Choosing cold standby only because it is cheaper.',
        'Ignoring application cutover time.',
        'Assuming hot standby guarantees zero data loss.',
        'Never recalculating RTO as data grows.'
      ],

      bestPractices: [
        'Match standby model to SLA.',
        'Measure real recovery time.',
        'Include database and application layers.',
        'Review cost against business value.',
        'Retest as environment size changes.'
      ],

      interviewAnswer: `Cold DR provisions most recovery infrastructure after failure, so it is cheaper but has higher RTO. Warm DR keeps part of the environment ready and reduces recovery time. Hot DR maintains a highly prepared standby for the fastest cutover but costs more and adds operational complexity.

I choose among them based on measured RPO/RTO rather than terminology alone.`,

      keyTakeaways: [
        'Cold is cheapest but slowest.',
        'Warm balances readiness and cost.',
        'Hot is fastest but most expensive.',
        'RPO and RTO remain separate.',
        'Standby readiness must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 9,
    question:
      'Why are backup immutability, access separation, and encryption important for MongoDB disaster recovery and ransomware resilience?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `A backup is useful only if it survives the same incident that damages production.

If an attacker or administrator can delete both:

production

and:

all backups

using the same credentials, the recovery architecture has a serious weakness.`,

      coreConcept: `Production credentials
       |
       X
should not automatically control
all recovery copies


Recovery design:

Production
   |
   v
Backup
   |
   +--> encrypted
   +--> restricted
   +--> separate access
   +--> immutable where appropriate`,

      detailedExplanation: `DISASTER RECOVERY SECURITY must protect against more than hardware failure.

Consider ransomware or credential compromise.

An attacker obtains a highly privileged production account.

They:

• delete collections
• drop databases
• attempt to delete backup files.

If backup storage uses the same administrative trust boundary, the attacker may destroy recovery capability.

Important controls include:

1. ACCESS SEPARATION

Backup administration should be separated from normal application/database credentials where feasible.

2. LEAST PRIVILEGE

Backup jobs need only the permissions required for backup.

3. IMMUTABILITY

Some storage systems support write-once or retention-lock capabilities.

This can prevent backups from being deleted or overwritten before the retention period expires.

4. ENCRYPTION

Backup data should be encrypted:

• in transit
• at rest.

5. KEY MANAGEMENT

Encryption is useless for recovery if keys are lost.

Keys should be protected independently but remain recoverable during DR.

6. AUDITING

Backup deletion and policy changes should be logged and alerted.

7. MULTIPLE FAILURE DOMAINS

Keep recovery copies separate from the primary environment where required.

This is sometimes described conceptually by backup strategies such as:

multiple copies
different media/storage
off-site copies
immutable/offline protection.`,

      internalWorking: `Compromised production account
        |
        v
Production destroyed
        |
        X
cannot delete immutable/
separately protected backup
        |
        v
Recovery still possible`,

      architecture: `             PRODUCTION
                  |
             backup flow
                  |
                  v
          RECOVERY STORAGE
        +---------+---------+
        |         |         |
        v         v         v
    encryption  access   immutability
                control
                    |
                    v
                DR recovery`,

      examples: [
        `Backup object retention can protect against accidental deletion.`,
        `Separate backup credentials reduce blast radius.`,
        `Encryption keys must themselves be included in DR planning.`
      ],

      commands: [
        {
          command:
            'mongodump --uri="<URI>" --archive=/secure-backup/full.archive',
          explanation:
            'Logical backup command is only one part of protection. Storage access, encryption, and retention policies must be implemented outside the dump utility as appropriate.'
        }
      ],

      productionScenario: `An attacker compromises an application administrator account and deletes production data.

The same identity cannot delete the organization's immutable backup copies.

The DBA restores from a clean point before the intrusion.

Without access separation and immutable retention, the attacker could have destroyed the recovery path as well.`,

      troubleshootingApproach: `1. Identify who can delete backups.

2. Compare production and backup credentials.

3. Review backup storage IAM/access controls.

4. Review retention/immutability policy.

5. Verify encryption.

6. Verify key-recovery process.

7. Review audit logs.

8. Test recovery using separated credentials.

9. Simulate credential-compromise scenario.

10. Close unnecessary access paths.`,

      commonMistakes: [
        'Using one admin credential for production and backup storage.',
        'Encrypting backups but losing the encryption keys.',
        'Allowing backups to be deleted immediately.',
        'Keeping every backup in the same infrastructure account/failure domain.',
        'Ignoring backup-system audit logs.'
      ],

      bestPractices: [
        'Separate backup access from application access.',
        'Use immutable retention where requirements justify it.',
        'Encrypt backups.',
        'Protect and test key recovery.',
        'Audit backup deletion and policy changes.'
      ],

      interviewAnswer: `DR protection must assume production credentials or infrastructure can be compromised. I therefore separate backup access, use least privilege, encrypt backups, protect recovery keys, and use immutable or retention-protected storage where appropriate.

The objective is to ensure that an incident capable of destroying production cannot automatically destroy every recovery copy.`,

      keyTakeaways: [
        'Backups need independent protection.',
        'Credential separation reduces blast radius.',
        'Immutability improves ransomware resilience.',
        'Encryption keys are part of DR.',
        'Backup security must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 10,
    question:
      'How should a MongoDB DBA perform a structured disaster-recovery readiness review before any real incident occurs?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A DR review asks:

"If production disappears right now, can we recover?"

The answer must be proven with evidence.

A checklist alone is not enough without restore testing.`,

      coreConcept: `DR readiness:

Requirements
    |
    v
Backup inventory
    |
    v
PITR coverage
    |
    v
Infrastructure readiness
    |
    v
Security/key readiness
    |
    v
Restore procedure
    |
    v
DR test
    |
    v
Measured RPO/RTO`,

      detailedExplanation: `A structured review should cover:

1. BUSINESS REQUIREMENTS

Document:

• RPO
• RTO
• retention
• compliance.

2. BACKUP INVENTORY

Know:

• full backup schedule
• snapshot locations
• PITR coverage
• retention dates
• backup sizes.

3. RECOVERY POINT VALIDATION

Can you identify exactly which timestamps are recoverable?

4. BACKUP HEALTH

Check:

• failed jobs
• change-capture gaps
• corrupted/incomplete backups
• storage availability.

5. SECURITY

Verify:

• backup credentials
• IAM
• encryption
• key availability
• immutable retention.

6. INFRASTRUCTURE

Can you provision:

• MongoDB servers
• storage
• networks
• DNS
• TLS certificates?

7. SOFTWARE

Record:

• MongoDB version
• Database Tools version
• automation versions.

8. RUNBOOK

Recovery procedures should be explicit and tested.

9. APPLICATION DEPENDENCIES

A database may recover while the service remains unavailable because:

• application configuration is wrong
• DNS is missing
• certificates are unavailable
• secrets are unavailable.

10. DR EXERCISE

Actually execute:

backup restore
→ MongoDB validation
→ application validation
→ cutover simulation.

Then record:

actual RPO
actual RTO.

Any gap between requirement and measured result becomes remediation work.`,

      internalWorking: `Paper DR plan
      |
      X
not enough

Tested DR:
backup
  |
restore
  |
MongoDB health
  |
application health
  |
timed cutover
  |
measured result`,

      architecture: `                DR REVIEW
                    |
       +------------+------------+
       |            |            |
       v            v            v
    Backup       Recovery      Security
       |            |            |
       +------------+------------+
                    |
                    v
             DR EXERCISE
                    |
                    v
             measured RPO/RTO`,

      examples: [
        `Restore the newest backup into an isolated region.`,
        `Test recovery without using production-only credentials.`,
        `Measure total time through application validation, not only MongoDB startup.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'One of several checks used to validate the recovered replica set during a DR exercise.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Useful for validating oplog history and understanding replication/recovery margin.'
        }
      ],

      productionScenario: `A quarterly DR test discovers:

• backups are valid
• restore completes
• MongoDB starts successfully

but:

TLS private keys for the recovery environment were never included in the runbook.

Application cutover cannot proceed.

The database team learns that DR readiness includes all dependencies needed to make the service usable.`,

      troubleshootingApproach: `1. Confirm RPO/RTO.

2. Inventory backups.

3. Verify recovery-point catalog.

4. Check PITR continuity.

5. Verify backup retention.

6. Verify credentials.

7. Verify encryption keys.

8. Verify software versions.

9. Verify recovery infrastructure.

10. Verify DNS/network.

11. Verify TLS/secrets.

12. Execute restore.

13. Validate MongoDB.

14. Validate application.

15. Measure RPO/RTO.

16. Document gaps.

17. Assign remediation actions.

18. Repeat test after fixes.`,

      commonMistakes: [
        'Calling a backup report a DR test.',
        'Testing only MongoDB startup.',
        'Ignoring application secrets and certificates.',
        'Not measuring actual recovery time.',
        'Leaving known DR gaps undocumented.'
      ],

      bestPractices: [
        'Run regular end-to-end DR exercises.',
        'Measure actual RPO and RTO.',
        'Include application dependencies.',
        'Keep runbooks current.',
        'Track remediation until closed.'
      ],

      interviewAnswer: `I perform DR readiness reviews by validating business RPO/RTO, backup inventory, PITR continuity, retention, backup security, recovery infrastructure, software versions, keys, certificates, DNS, and application dependencies.

The most important step is an end-to-end timed DR exercise. I restore the data, rebuild MongoDB health, validate the application, and compare the measured RPO/RTO with the required SLA.`,

      keyTakeaways: [
        'DR readiness must be proven.',
        'Backup availability is only one component.',
        'Application dependencies matter.',
        'RPO/RTO must be measured.',
        'DR testing should produce remediation actions.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 11,
    question:
      'How would you analyze a specific MongoDB oplog time range during a recovery investigation without performing an unsafe full oplog scan?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `During a recovery investigation, a DBA may need to answer:

"What database operations happened between two specific points in time?"

The MongoDB oplog contains ordered replication operations.

However, the oplog can be extremely large.

A DBA should therefore narrow the investigation using:

• timestamp range
• namespace
• operation type

instead of blindly reading the entire oplog.`,

      coreConcept: `Large oplog
    |
    v
Narrow by timestamp
    |
    v
Narrow by namespace
    |
    v
Inspect operation type
    |
    v
Identify recovery boundary`,

      detailedExplanation: `The oplog is normally found at:

local.oplog.rs

Each entry contains fields such as:

ts
h/version-dependent metadata
op
ns
o
o2
wall
and other fields depending on MongoDB version and operation type.

Common operation codes conceptually include:

i = insert
u = update
d = delete
c = command
n = no-op

Modern MongoDB can also represent transactions and grouped operations in ways that require deeper interpretation.

Therefore:

one oplog document

does not always equal:

one simple application statement.

For recovery analysis, first determine an approximate wall-clock incident time.

Then convert that time into the appropriate BSON Timestamp boundary.

Example concept:

start:
Timestamp(T1, 1)

end:
Timestamp(T2, 1)

Query:

{
  ts: {
    $gte: start,
    $lt: end
  }
}

You can additionally filter by:

ns: "production.orders"

when appropriate.

However, some operations such as transaction-related entries can require interpretation beyond a simple namespace filter.

The purpose of oplog inspection is usually to:

• establish incident sequence
• identify destructive operations
• determine the last safe recovery point
• verify whether required history still exists.

It should not become an uncontrolled production scan.`,

      internalWorking: `OPLOG

T1 valid insert
T2 valid update
T3 valid update
T4 BAD DELETE
T5 valid unrelated write

Recovery investigation:

find T4
   |
   v
target before T4`,

      architecture: `              local.oplog.rs
                    |
            timestamp filter
                    |
             namespace filter
                    |
                    v
              small result set
                    |
                    v
             incident analysis
                    |
                    v
           recovery boundary`,

      examples: [
        `Inspect only a five-minute incident window instead of hours of oplog history.`,
        `Filter an affected namespace when the operation representation permits it.`,
        `Use the ts field for operation ordering and wall time/logs for human timeline correlation.`
      ],

      commands: [
        {
          command:
            'use local',
          explanation:
            'Switches to the local database where replica-set oplog data is stored.'
        },
        {
          command:
            'db.getCollection("oplog.rs").find({ts: {$gte: Timestamp(<startSeconds>, <startIncrement>), $lt: Timestamp(<endSeconds>, <endIncrement>)}}).sort({ts:1})',
          explanation:
            'Conceptual bounded oplog query. Replace placeholders only after establishing the correct timestamp range.'
        },
        {
          command:
            'db.getCollection("oplog.rs").find({ns:"production.orders", ts:{$gte:Timestamp(<startSeconds>,0), $lt:Timestamp(<endSeconds>,0)}}).sort({ts:1})',
          explanation:
            'Adds namespace filtering for focused investigation where that representation is appropriate.'
        }
      ],

      productionScenario: `At approximately 11:42, millions of documents disappear from production.orders.

The DBA first correlates:

• application logs
• MongoDB logs
• deployment history.

The suspected interval becomes:

11:41–11:43.

Instead of dumping the entire oplog, the DBA examines the bounded interval and identifies the destructive operation.

The exact operation timestamp becomes the upper boundary for an isolated PITR test.`,

      troubleshootingApproach: `1. Record incident time and timezone.

2. Normalize timestamps.

3. Determine a narrow search interval.

4. Confirm the oplog still contains that interval.

5. Query using ts boundaries.

6. Add namespace filtering where useful.

7. Inspect operation types.

8. Consider transactions/grouped operations.

9. Correlate with application and audit logs.

10. Identify the last safe point.

11. Perform recovery in isolation.

12. Validate before production action.`,

      commonMistakes: [
        'Scanning the entire oplog without a time boundary.',
        'Treating wall-clock time and BSON Timestamp as identical.',
        'Assuming every application operation maps to one simple oplog entry.',
        'Ignoring transactions or command entries.',
        'Modifying the local database during investigation.'
      ],

      bestPractices: [
        'Use narrow timestamp ranges.',
        'Correlate multiple evidence sources.',
        'Treat the oplog as critical internal data.',
        'Never manually modify oplog entries.',
        'Validate recovery boundaries in an isolated restore.'
      ],

      interviewAnswer: `For oplog analysis I first establish the incident window from logs, normalize the timezone, and verify that the required history is still retained. I then query local.oplog.rs using bounded ts values and, where appropriate, namespace and operation filters.

I avoid broad oplog scans and remember that transactions and modern operation representations may require more interpretation than a simple one-entry-per-write model.`,

      keyTakeaways: [
        'Oplog investigation should be bounded.',
        'ts provides operation ordering.',
        'Namespace filters can reduce scope.',
        'Transactions can complicate interpretation.',
        'Never modify the oplog manually.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 12,
    question:
      'How would you recover MongoDB to an exact safe point when several valid and invalid operations occur within the same second?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Recovering to a wall-clock second may not be precise enough.

MongoDB can execute many operations within one second.

The BSON Timestamp increment helps order operations that share the same seconds component.`,

      coreConcept: `Same second:

Timestamp(5000,1)
valid

Timestamp(5000,2)
valid

Timestamp(5000,3)
BAD

Timestamp(5000,4)
valid

Desired boundary:

after increment 2
before increment 3`,

      detailedExplanation: `Suppose the incident occurred at:

10:15:20

Within that same second:

Timestamp(1000,1)
valid payment

Timestamp(1000,2)
valid payment

Timestamp(1000,3)
destructive update

Timestamp(1000,4)
another operation

If the recovery mechanism supports operation-level timestamp targeting, the ideal target is immediately before:

Timestamp(1000,3).

This illustrates why:

"recover to 10:15:19"

can unnecessarily discard valid operations,

while:

"recover to 10:15:20"

without understanding the exact boundary could include the bad operation.

The exact targeting interface depends on the backup/PITR product and MongoDB version.

A managed backup platform may expose a recovery timestamp through its own interface rather than asking the DBA to manually replay raw oplog entries.

For custom recovery workflows, do not improvise raw oplog manipulation in production.

The safe process is:

• identify exact bad operation
• establish last safe boundary
• confirm backup tooling can target it
• recover into isolation
• verify both sides of the boundary.`,

      internalWorking: `T,1  GOOD
 |
T,2  GOOD
 |
T,3  BAD
 |
T,4  later

Target:
between T,2 and T,3`,

      architecture: `              INCIDENT SECOND
                    |
          +---------+---------+
          |         |         |
          v         v         v
        GOOD      GOOD       BAD
        T,1       T,2        T,3
                    |
                    v
              SAFE BOUNDARY`,

      examples: [
        `Two valid operations and one destructive operation can share the same seconds value.`,
        `The Timestamp increment provides ordering within that second.`,
        `The actual PITR product determines how precisely that boundary can be selected.`
      ],

      commands: [
        {
          command:
            'db.getSiblingDB("local").getCollection("oplog.rs").find({ts:{$gte:Timestamp(<seconds>,0), $lt:Timestamp(<secondsPlusOne>,0)}}).sort({ts:1})',
          explanation:
            'Conceptually inspects all oplog operations within a particular second. Use actual validated timestamp values.'
        }
      ],

      productionScenario: `At 15:20:10, an automation account performs several legitimate writes followed by a destructive operation.

The business cannot afford to discard the valid transactions that happened earlier in the same second.

The DBA identifies the exact oplog ordering and tests the closest supported recovery boundary before the destructive operation.`,

      troubleshootingApproach: `1. Normalize incident time.

2. Inspect the narrow second/window.

3. Order entries by ts.

4. Identify bad operation.

5. Identify last valid operation.

6. Check backup system targeting capability.

7. Recover into isolation.

8. Confirm last valid operation exists.

9. Confirm bad operation is absent.

10. Approve production recovery point.`,

      commonMistakes: [
        'Assuming one second contains one operation.',
        'Discarding an entire second unnecessarily.',
        'Including the destructive operation accidentally.',
        'Assuming every PITR platform exposes identical timestamp granularity.',
        'Testing the boundary directly on production.'
      ],

      bestPractices: [
        'Identify the exact operation boundary.',
        'Understand BSON Timestamp ordering.',
        'Use supported recovery tooling.',
        'Test the boundary before cutover.',
        'Document the selected recovery point precisely.'
      ],

      interviewAnswer: `When multiple operations occur within one second, I use the oplog Timestamp ordering to identify the exact destructive operation and the last safe operation before it. I then use the supported PITR mechanism to recover as close as possible to that safe boundary and validate it in isolation before cutover.`,

      keyTakeaways: [
        'Seconds alone may be insufficient.',
        'Timestamp increments establish ordering.',
        'The last safe operation matters.',
        'Tool capability determines selectable recovery granularity.',
        'Recovery must be validated.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 13,
    question:
      'What happens if there is a gap in the MongoDB PITR recovery chain, and how would you investigate whether later recovery points are still usable?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `PITR depends on continuous recovery history between a base backup and the desired recovery point.

If part of that required history is missing, the chain may be broken.`,

      coreConcept: `Base

B0
 |
 C1
 |
 C2
 |
 X   missing history
 |
 C4
 |
 C5

Can B0 safely become C5?

Not if required operations
between C2 and C4 are missing.`,

      detailedExplanation: `Consider:

Full backup:
00:00

Continuous changes:
00:00–04:00 available

04:00–04:20 missing

04:20–10:00 available.

A request to recover to:

03:30

may still be possible.

A request to recover to:

09:00

cannot simply skip the missing 20 minutes.

Doing so would produce a state that does not represent the actual database history.

Possible causes of a PITR gap include:

• backup agent outage
• network outage
• source unavailable
• oplog history overwritten before capture
• backup storage failure
• corrupted archive
• retention misconfiguration.

The DBA must determine whether a newer valid base backup exists after the gap.

Example:

Base B0
00:00

gap
04:00–04:20

new valid base B1
05:00

If B1 is independently consistent and validated, later recovery points may be constructed from:

B1 + continuous history after 05:00.

Therefore a gap does not necessarily invalidate all future recovery forever.

It invalidates recovery paths that depend on the missing section.`,

      internalWorking: `B0
 |
 changes
 |
 X gap
 |
 changes
 |
 B1 new valid base
 |
 changes
 |
 target

Target may be recoverable
from B1 even though
B0 chain is broken.`,

      architecture: `              RECOVERY CATALOG
                     |
          +----------+----------+
          |                     |
          v                     v
      old base              newer base
          |                     |
       history                 history
          |                     |
          X gap                  |
                                v
                         later recovery point`,

      examples: [
        `A recovery point before the gap can remain usable.`,
        `A newer base after the gap can establish a new recovery chain.`,
        `Later change files alone cannot magically reconstruct missing operations.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Can help determine whether a capture outage exceeded local oplog retention when investigating the cause of a gap.'
        }
      ],

      productionScenario: `A backup agent is down for five hours.

The local oplog window during peak workload is only three hours.

When the agent returns, two hours of required history are already gone.

The backup system must establish a new valid recovery base rather than pretending continuous PITR coverage was maintained.`,

      troubleshootingApproach: `1. Identify exact gap start.

2. Identify exact gap end.

3. Determine cause.

4. Compare outage with oplog window.

5. Determine which recovery points depend on missing history.

6. Locate newest valid base before gap.

7. Locate first valid new base after gap.

8. Mark unavailable recovery interval.

9. Re-establish continuous capture.

10. Perform a PITR test from the new chain.

11. Alert stakeholders if RPO coverage was violated.`,

      commonMistakes: [
        'Ignoring a short PITR gap.',
        'Concatenating later change history across missing operations.',
        'Assuming a healthy agent means historical continuity is restored.',
        'Not marking unavailable recovery points.',
        'Failing to establish a new valid base.'
      ],

      bestPractices: [
        'Alert immediately on capture gaps.',
        'Maintain sufficient oplog headroom.',
        'Catalog valid recovery intervals.',
        'Re-establish a new base when required.',
        'Test the repaired recovery chain.'
      ],

      interviewAnswer: `A PITR chain cannot safely skip required operations. I identify the exact gap, determine whether the capture outage exceeded available oplog history, and map which recovery points depend on the missing interval.

If a new independently valid base backup exists after the gap, later PITR can start from that base. Otherwise the affected recovery interval must be treated as unavailable.`,

      keyTakeaways: [
        'PITR requires continuity.',
        'Missing operations cannot simply be skipped.',
        'A newer base can establish a new chain.',
        'Recovery-point availability must be explicit.',
        'Capture gaps are RPO incidents.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 14,
    question:
      'How would you design and validate a cross-region MongoDB disaster-recovery architecture without creating unsafe election or split-brain assumptions?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `MongoDB replica sets use majority-based elections.

A disaster-recovery design must respect those rules.

A DBA cannot simply place servers in two regions and assume both regions can independently become Primary after a network partition.`,

      coreConcept: `5 voting members

Region A = 3
Region B = 2

Partition occurs

A:
3/5 majority
can maintain/elect Primary

B:
2/5
cannot elect Primary

This prevents two authoritative Primaries
from being independently elected
within the same replica-set configuration.`,

      detailedExplanation: `Replica-set election safety comes from majority voting.

For a configured set of voting members, a candidate requires the required majority to become Primary.

Example:

5 voting members.

Majority:
3.

Region A:
3 voters.

Region B:
2 voters.

If communication between regions fails:

Region A can potentially retain/elect a Primary.

Region B cannot independently elect one with only two votes.

This is intentional.

A poorly understood DR plan may say:

"If Region A fails, just force Region B to become Primary."

Forced reconfiguration can change the safety model and can create serious divergence risk if the old region is not truly dead or later returns unexpectedly.

Cross-region design therefore needs explicit answers to:

• Where is voting majority?
• What failure is being protected against?
• What happens during WAN partition?
• What is expected failover time?
• What write latency is acceptable?
• Is DR automatic or manual?
• How is the old site fenced before forced recovery?

Another model is a separate DR cluster backed by:

• snapshots
• PITR
• controlled data replication.

This can provide stronger isolation from logical corruption but different RTO/RPO characteristics.

There is no universally correct topology.

The design must be tied to the business SLA and failure model.`,

      internalWorking: `REGION A              REGION B

A1 voter
A2 voter
A3 voter

                       B1 voter
                       B2 voter

Network partition

A = 3 votes
B = 2 votes

Only A has majority.`,

      architecture: `              REPLICA SET
                 5 voters
                    |
          +---------+---------+
          |                   |
          v                   v
      REGION A            REGION B
      3 voters            2 voters
          |                   |
          v                   X
       majority          no majority`,

      examples: [
        `A two-region 2+2 voter layout does not provide either side a majority after partition in a four-voter set.`,
        `A third failure domain can sometimes help topology design, but latency and operational goals still matter.`,
        `Forced recovery should include fencing of the old Primary side.`
      ],

      commands: [
        {
          command:
            'rs.conf()',
          explanation:
            'Shows member votes, priorities, and topology configuration for DR review.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Shows current replica-set state and member health.'
        }
      ],

      productionScenario: `A two-region deployment loses WAN connectivity.

The DR team initially believes both sites should remain writable.

That expectation would violate the safety objective of majority-based consensus.

Only the side retaining the configured voting majority can maintain authoritative Primary availability.

The DR runbook is corrected to distinguish:

network partition

from:

confirmed destruction of the primary region.`,

      troubleshootingApproach: `1. List all voting members.

2. Calculate configured majority.

3. Map voters to failure domains.

4. Simulate each region failure.

5. Simulate WAN partition.

6. Determine which side has majority.

7. Measure cross-region latency.

8. Review write concern requirements.

9. Define fencing procedure.

10. Define forced-recovery approval process.

11. Test regional failover.

12. Test old-region reintegration.`,

      commonMistakes: [
        'Expecting both regions to accept Primary writes during partition.',
        'Using forced reconfiguration casually.',
        'Ignoring old-Primary fencing.',
        'Designing only for server failure and not WAN partition.',
        'Ignoring latency effects of cross-region voting.'
      ],

      bestPractices: [
        'Design voting topology around failure domains.',
        'Document majority behavior.',
        'Fence failed/isolated environments before dangerous recovery actions.',
        'Test region-loss and network-partition scenarios separately.',
        'Avoid forced reconfiguration unless truly required.'
      ],

      interviewAnswer: `For cross-region DR I start with the replica-set voting topology and explicitly calculate what happens under member failure, region failure, and WAN partition.

Only a side with the configured majority can safely maintain or elect a Primary. If forced recovery is ever required after confirmed site loss, I treat fencing and divergence risk as critical controls rather than using forced reconfiguration as a routine failover mechanism.`,

      keyTakeaways: [
        'Majority rules still apply across regions.',
        'Network partition and region destruction are different.',
        'Both sides should not independently become authoritative.',
        'Forced recovery requires strong controls.',
        'Cross-region DR must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 15,
    question:
      'How should a DBA validate a MongoDB PITR recovery before declaring the recovered environment production-ready?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `A successful restore command does not prove successful disaster recovery.

The DBA must prove:

1. the correct recovery point was restored,
2. required data exists,
3. unwanted operations are absent,
4. indexes and security are correct,
5. MongoDB is healthy,
6. the application works.`,

      coreConcept: `Restore complete
      |
      v
Technical validation
      |
      v
Recovery-point validation
      |
      v
Business validation
      |
      v
Replica-set validation
      |
      v
Application validation
      |
      v
Production-ready`,

      detailedExplanation: `Validation should occur at several levels.

LEVEL 1 — RESTORE LOG

Check for:

• errors
• skipped documents
• duplicate-key failures
• failed namespaces.

LEVEL 2 — DATABASE INVENTORY

Confirm:

• expected databases
• collections
• document counts appropriate to the recovery point.

LEVEL 3 — INDEXES

Compare expected indexes and constraints.

LEVEL 4 — RECOVERY BOUNDARY

If recovering before an accidental delete:

verify the last valid operation is represented

and:

verify the destructive change is absent.

LEVEL 5 — BUSINESS DATA

Examples:

• expected payment exists
• account balance matches
• latest safe order exists
• corrupted records are restored.

LEVEL 6 — SECURITY

Validate:

• users
• roles
• authentication
• TLS.

LEVEL 7 — REPLICA SET

Check:

• one healthy Primary
• expected Secondaries
• normal replication lag
• no unexpected sync problems.

LEVEL 8 — APPLICATION

Run:

• connection test
• read test
• controlled write test
• critical business workflow.

LEVEL 9 — OBSERVABILITY

Confirm:

• monitoring
• alerts
• backup
• logging.

LEVEL 10 — RPO/RTO

Record:

• selected recovery point
• actual data-loss interval
• total recovery duration.

Only then should the recovered environment be considered ready for production cutover.`,

      internalWorking: `Restore
 |
 v
Correct timestamp?
 |
 v
Correct data?
 |
 v
Correct indexes?
 |
 v
Correct security?
 |
 v
Healthy replication?
 |
 v
Application works?
 |
 v
READY`,

      architecture: `             RECOVERED CLUSTER
                    |
       +------------+------------+
       |            |            |
       v            v            v
      Data        MongoDB    Application
   validation      health      testing
       \            |            /
        \           |           /
             final approval`,

      examples: [
        `Verify the deleted documents exist after PITR.`,
        `Verify the destructive delete itself was not replayed.`,
        `Compare critical business records rather than relying only on countDocuments().`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Checks recovered replica-set health.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Validates expected index definitions.'
        },
        {
          command:
            'db.collection.countDocuments({})',
          explanation:
            'Provides one basic validation metric but should not be the only validation method.'
        }
      ],

      productionScenario: `A PITR restore completes successfully.

Document counts look correct.

Before cutover, business validation finds that the chosen recovery point includes the first destructive transaction.

The DBA moves the recovery boundary earlier and restores again.

Without boundary-level validation, the team would have restored the corruption back into production.`,

      troubleshootingApproach: `1. Review restore logs.

2. Validate database inventory.

3. Validate collection counts.

4. Validate indexes.

5. Validate recovery boundary.

6. Validate critical business records.

7. Validate users and roles.

8. Validate TLS/authentication.

9. Validate replica-set health.

10. Test application reads.

11. Test controlled writes.

12. Verify monitoring.

13. Verify backups resume.

14. Record achieved RPO/RTO.

15. Approve cutover.`,

      commonMistakes: [
        'Declaring success when mongorestore exits successfully.',
        'Checking only document counts.',
        'Not validating the bad-operation boundary.',
        'Ignoring users, roles, TLS, or indexes.',
        'Cutting over before application testing.'
      ],

      bestPractices: [
        'Use layered validation.',
        'Include business owners where necessary.',
        'Validate both presence and absence of key operations.',
        'Verify observability before cutover.',
        'Record evidence of recovery approval.'
      ],

      interviewAnswer: `I validate PITR at multiple layers: restore logs, database and collection inventory, indexes, exact recovery boundary, business-critical records, security, replica-set health, application workflows, monitoring, and backup resumption.

For accidental corruption, I specifically prove that the final valid operation is present and the destructive operation is absent before declaring the environment production-ready.`,

      keyTakeaways: [
        'Restore completion is not recovery completion.',
        'Recovery boundary must be proven.',
        'Business validation matters.',
        'Application testing is required.',
        'RPO/RTO should be recorded.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 16,
    question:
      'A MongoDB Secondary in the DR region has been disconnected for longer than the oplog window. Can it still be used for immediate failover, and how would you recover safely?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `If a Secondary has been disconnected longer than the available oplog history, it may be stale.

It cannot simply fetch operations that no longer exist on a valid sync source.

This usually means it needs to be resynchronized before it can become a trusted current replica.`,

      coreConcept: `DR Secondary last applied:
T1

Primary oplog now starts:
T5

Required:
T2 T3 T4

But they are gone.

Secondary cannot catch up
from current oplog history.`,

      detailedExplanation: `Consider:

DR Secondary offline:
10 hours.

Current oplog window:
6 hours.

The Secondary may require operations older than the oldest retained entry.

This is a stale-member condition.

The DBA should not say:

"It still has most of the data, so promote it."

Its data may be hours behind production.

Promoting stale data can create significant data loss.

Recovery options depend on the wider incident.

CASE 1 — PRIMARY REGION HEALTHY

Resynchronize the DR member from a valid source.

CASE 2 — PRIMARY REGION LOST

Determine whether another valid current replica exists.

If not, evaluate:

• latest backup
• PITR history
• exact state of stale DR member
• business RPO.

A stale member may contain useful data for forensic or recovery purposes, but it should not automatically be treated as an authoritative failover target.

If backup/PITR is newer than the stale member, recovering from backup may provide a better RPO.

The recovery decision must compare all available data sources.`,

      internalWorking: `DR member:

last operation = 08:00

Production failure = 18:00

Member is 10 hours behind

PITR available = 17:58

Best recovery source:

PITR, not blindly
promoting stale member.`,

      architecture: `             PRIMARY REGION
                    |
                    X
                  lost
                    |
        +-----------+-----------+
        |                       |
        v                       v
   stale DR node          backup/PITR
      08:00                  17:58
        |                       |
        +-----------+-----------+
                    |
                    v
           choose safest/latest
             valid recovery`,

      examples: [
        `A stale Secondary is not automatically a DR Primary.`,
        `A newer PITR point may provide far less data loss.`,
        `If production remains healthy, resync the stale member instead of forcing it current.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Helps identify member state and replication status.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows available oplog history on a healthy source.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a quick view of Secondary lag where applicable.'
        }
      ],

      productionScenario: `A DR member has been disconnected for 14 hours.

The Primary region then suffers a major outage.

The stale member is 14 hours behind, while managed PITR is available through three minutes before the outage.

The DBA chooses the validated PITR recovery path instead of promoting the stale member and accepting 14 hours of data loss.`,

      troubleshootingApproach: `1. Determine last applied time on DR member.

2. Determine current/last known production time.

3. Calculate data gap.

4. Determine available oplog window.

5. Determine whether incremental catch-up is possible.

6. Inventory other healthy replicas.

7. Inventory backups.

8. Identify newest PITR point.

9. Compare achievable RPO.

10. Choose authoritative recovery source.

11. Recover in isolation where required.

12. Validate.

13. Rebuild DR redundancy.`,

      commonMistakes: [
        'Promoting a stale member because it is already running.',
        'Ignoring available newer backups.',
        'Assuming a stale Secondary can always catch up.',
        'Forcing replica-set changes before understanding data freshness.',
        'Destroying stale-member evidence before recovery decisions are complete.'
      ],

      bestPractices: [
        'Monitor DR-member lag continuously.',
        'Alert before lag approaches the oplog window.',
        'Maintain independent backup/PITR.',
        'Compare recovery sources by freshness and validity.',
        'Never sacrifice data unnecessarily for a superficially faster failover.'
      ],

      interviewAnswer: `If a DR Secondary has fallen beyond available oplog history, I treat it as stale rather than an immediate failover candidate. I compare its last applied point with other replicas and available backup/PITR recovery points.

If production is healthy, I resynchronize it. If the primary region is lost, I choose the newest validated authoritative recovery source rather than blindly promoting stale data.`,

      keyTakeaways: [
        'Outside the oplog window can mean stale.',
        'Stale data should not be blindly promoted.',
        'Compare all available recovery sources.',
        'PITR may provide a better RPO.',
        'Monitor DR lag before disaster.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 17,
    question:
      'A MongoDB region becomes unreachable but you cannot confirm whether the old Primary is actually down. How would you perform DR failover without creating data divergence?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `One of the most dangerous DR situations is:

"I cannot reach the Primary."

That does not necessarily mean:

"The Primary is dead."

It may still be running and accepting traffic from systems that can reach it.

This creates a fencing problem.`,

      coreConcept: `Region A unreachable
from DBA
      |
      ?
      |
Old Primary may still run

Before activating
independent DR writes:

FENCE OLD SITE
      |
      v
prove it cannot continue
serving authoritative writes`,

      detailedExplanation: `Imagine:

Region A contains the original Primary.

Region B is the DR site.

A WAN or management-plane failure makes Region A unreachable from Region B.

The DBA cannot determine whether the original application can still communicate with Region A.

Immediately forcing Region B into an independent writable state can create:

Region A writes
+
Region B writes

on divergent histories.

Even if MongoDB's normal replica-set majority rules prevent split-brain inside the original configuration, dangerous manual actions such as forced reconfiguration or building an independent replacement environment can bypass assumptions that previously maintained safety.

The DR process therefore needs fencing.

Fencing means ensuring the old environment cannot continue accepting authoritative writes.

Possible infrastructure-specific methods include:

• stop application traffic to old region
• isolate network routes
• revoke service discovery/DNS
• shut down old database nodes
• block client access
• use cloud control-plane fencing.

The exact method depends on infrastructure.

After fencing:

1. determine newest authoritative data source,
2. establish DR database,
3. validate,
4. redirect application traffic.

When Region A returns, do not simply reconnect it.

Treat it as potentially divergent.

Inspect and reintroduce it using a controlled recovery procedure.`,

      internalWorking: `REGION A
Old Primary
   |
   | unknown state
   |
   X connectivity

REGION B
DR

Before DR writes:

ensure Region A
cannot serve writes

then activate B.`,

      architecture: `             REGION A
              old Primary
                   |
              [FENCE]
                   X
                   |
             application
                   |
                   v
               REGION B
              recovered DR
                   |
                   v
             new authority`,

      examples: [
        `Loss of monitoring connectivity does not prove database failure.`,
        `Forced DR without fencing can create two business histories.`,
        `A returning old site should be treated as untrusted until reconciled.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Useful when connectivity exists, but an unreachable region requires infrastructure-level evidence as well.'
        }
      ],

      productionScenario: `Region A disappears from monitoring.

Region B operations team prepares to force DR activation.

Before doing so, the network team confirms that customer traffic is still reaching Region A through another path.

Had Region B been made independently writable, both sites could have accepted conflicting business transactions.

The team fences Region A application traffic before DR activation.`,

      troubleshootingApproach: `1. Identify what connectivity was lost.

2. Determine whether clients can still reach old Primary.

3. Determine whether old region still has voting majority.

4. Stop automated destructive recovery actions.

5. Establish infrastructure-level fencing.

6. Confirm old site cannot serve application writes.

7. Identify newest valid recovery source.

8. Activate DR.

9. Validate database.

10. Redirect application.

11. Monitor.

12. Treat returning old region as potentially divergent.

13. Rebuild/rejoin through controlled procedure.`,

      commonMistakes: [
        'Equating unreachable with powered off.',
        'Forcing DR immediately.',
        'Ignoring application paths to the old site.',
        'Reconnecting the old region automatically after recovery.',
        'Failing to document fencing ownership.'
      ],

      bestPractices: [
        'Define fencing before disasters.',
        'Require clear authority for forced failover.',
        'Separate detection from recovery decisions.',
        'Validate old-site isolation.',
        'Reintegrate recovered regions cautiously.'
      ],

      interviewAnswer: `If the old Primary region is unreachable but not confirmed dead, I treat the situation as a potential partition rather than immediate site loss. Before any forced DR action that could create an independent writable history, I ensure the old site is fenced from application writes.

Only after fencing do I activate the validated DR recovery path. A returning old region is treated as potentially divergent and is not automatically rejoined.`,

      keyTakeaways: [
        'Unreachable does not mean dead.',
        'Fencing prevents divergent writes.',
        'Forced DR needs controlled authority.',
        'Application connectivity matters.',
        'Returning sites require careful reintegration.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 18,
    question:
      'MongoDB production is hit by ransomware or malicious data destruction. How would you determine a clean recovery point and prevent reinfection after restoration?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `Security recovery is different from ordinary hardware recovery.

The newest backup may already contain malicious changes.

The DBA must determine:

"When was the environment last known to be clean?"

Then restore to a point before compromise or destructive activity.`,

      coreConcept: `Compromise begins
       |
       v
malicious changes
       |
       v
incident detected

Newest backup may contain damage.

Need:

last known clean point
       |
       v
isolated recovery
       |
       v
security remediation
       |
       v
controlled cutover`,

      detailedExplanation: `A ransomware or malicious-administrator incident requires coordination between:

• DBA
• security
• infrastructure
• application teams.

STEP 1 — CONTAIN

Prevent continued access.

Examples may include:

• disable compromised identities
• isolate affected systems
• revoke credentials
• block malicious network paths.

STEP 2 — PRESERVE EVIDENCE

Do not destroy the original environment immediately.

Security teams may require:

• logs
• audit records
• disk evidence
• authentication history.

STEP 3 — ESTABLISH COMPROMISE TIMELINE

The visible destructive event may not equal the initial compromise time.

Example:

Attacker gained access:
Monday

Data destruction:
Thursday

A Wednesday backup may therefore contain attacker-created accounts or persistence.

STEP 4 — IDENTIFY CLEAN RECOVERY POINT

Use:

• audit logs
• application logs
• IAM logs
• MongoDB logs
• deployment history
• backup history.

STEP 5 — RECOVER IN ISOLATION

Restore to a quarantined environment.

STEP 6 — REMOVE PERSISTENCE

Rotate:

• passwords
• keys
• certificates where required
• service credentials
• compromised secrets.

Review:

• users
• roles
• startup configuration
• automation.

STEP 7 — VALIDATE DATA

Ensure destructive operations are absent.

STEP 8 — VALIDATE SECURITY

Ensure attacker access cannot continue.

STEP 9 — CUT OVER

Only after both data and security validation pass.

The critical principle is:

Do not restore clean data into an environment that is still compromised.`,

      internalWorking: `Monday:
compromise begins

Tuesday:
attacker persistence

Wednesday:
backup

Thursday:
data destruction

Wednesday backup may NOT be clean.

Need recovery point
before compromise/persistence.`,

      architecture: `            COMPROMISED PROD
                   |
             containment
                   |
          +--------+--------+
          |                 |
          v                 v
       evidence         clean backups
          |                 |
          +--------+--------+
                   |
                   v
          isolated recovery
                   |
          security remediation
                   |
                   v
              validation
                   |
                   v
               cutover`,

      examples: [
        `A backup taken after attacker account creation may not be a clean recovery source.`,
        `Rotate database and application credentials before restored production is exposed.`,
        `Immutable backups can preserve recovery copies against malicious deletion.`
      ],

      commands: [
        {
          command:
            'db.getSiblingDB("admin").getUsers()',
          explanation:
            'Can help review database users during controlled recovery, subject to privileges and version-specific behavior.'
        },
        {
          command:
            'db.getSiblingDB("admin").getRoles({showPrivileges:true, showBuiltinRoles:false})',
          explanation:
            'Can help validate role configuration during security recovery where appropriate.'
        }
      ],

      productionScenario: `An attacker drops several production databases at 03:00.

Security investigation shows the compromised administrator credential was first used at 22:30.

The 02:00 backup is newer than the compromise and therefore cannot automatically be considered clean.

The team restores an earlier known-good base and applies only validated recovery history before the malicious activity.

All compromised credentials are rotated before cutover.`,

      troubleshootingApproach: `1. Contain attacker access.

2. Preserve forensic evidence.

3. Determine initial compromise time.

4. Determine destructive-operation time.

5. Review backup timestamps.

6. Identify last known clean point.

7. Verify backup immutability/integrity.

8. Restore into quarantine.

9. Review users and roles.

10. Rotate credentials.

11. Validate configuration.

12. Validate business data.

13. Validate application artifacts.

14. Confirm security remediation.

15. Cut over.

16. Monitor aggressively.

17. Continue RCA/forensics.`,

      commonMistakes: [
        'Restoring the newest backup automatically.',
        'Confusing destruction time with compromise time.',
        'Reusing compromised credentials.',
        'Restoring into the compromised environment.',
        'Destroying forensic evidence too early.'
      ],

      bestPractices: [
        'Maintain immutable recovery copies.',
        'Coordinate with security teams.',
        'Recover into isolated infrastructure.',
        'Rotate compromised secrets.',
        'Prove both data integrity and security before cutover.'
      ],

      interviewAnswer: `For ransomware recovery I first contain the compromise and preserve evidence. I determine the initial compromise time, not only the visible destruction time, because recent backups may already contain malicious changes.

I restore the last known clean point into isolated infrastructure, rotate compromised credentials and keys, validate users, roles, data and application security, and only then perform production cutover.`,

      keyTakeaways: [
        'Newest backup may not be clean.',
        'Compromise time matters.',
        'Security containment comes before recovery.',
        'Credentials must be rotated.',
        'Recovery must happen in a trusted environment.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 19,
    question:
      'A complete MongoDB region is lost and the DR environment is available, but application traffic, DNS, certificates, and secrets are not ready. How would you manage the recovery and calculate the real RTO?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `Database recovery time is not the same as service recovery time.

If MongoDB is healthy after 30 minutes but users cannot access the application for another three hours, the business RTO is not 30 minutes.`,

      coreConcept: `Disaster
 |
 v
Database recovery
 |
 v
Network
 |
 v
DNS
 |
 v
Secrets/TLS
 |
 v
Application
 |
 v
Business service available

REAL RTO =
entire duration`,

      detailedExplanation: `A full DR timeline may include:

T0
incident declared

T1
recovery infrastructure available

T2
MongoDB restored

T3
replica set healthy

T4
application secrets available

T5
TLS/network configuration complete

T6
DNS/service discovery updated

T7
application smoke test passes

T8
customer traffic restored.

If:

T0 = 10:00

MongoDB healthy = 10:40

Customer traffic restored = 12:15

then:

database recovery time:
40 minutes

business RTO:
2 hours 15 minutes.

This distinction matters because database teams sometimes report successful RTO while the service is still unavailable.

The DBA should participate in an integrated DR runbook covering:

• infrastructure
• storage
• MongoDB
• authentication
• certificates
• application secrets
• load balancers
• DNS
• firewall/networking
• monitoring.

DR dependencies should be pre-staged according to the required standby model.

For low RTO systems, manually locating certificates and secrets during an outage is unacceptable.

Those dependencies must be recoverable securely and quickly.`,

      internalWorking: `10:00 disaster
 |
10:40 MongoDB healthy
 |
11:00 secrets ready
 |
11:20 app starts
 |
11:45 DNS ready
 |
12:15 customers restored

Real RTO:
2h 15m`,

      architecture: `               DR SERVICE
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
     MongoDB     Security    Networking
        |           |           |
        +-----------+-----------+
                    |
                    v
                Application
                    |
                    v
                 Customer`,

      examples: [
        `Healthy MongoDB with broken DNS is still an unavailable service.`,
        `Missing TLS keys can block application connectivity.`,
        `A DR test should measure from incident start through business-service restoration.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Confirms database topology health but does not by itself prove service recovery.'
        }
      ],

      productionScenario: `A regional outage occurs at 09:00.

The DR database is ready at:
09:35.

However:

• TLS certificate deployment takes 25 minutes
• secrets restoration takes 30 minutes
• DNS and application validation take another 40 minutes.

Customers regain access at:
11:10.

The real RTO is:

2 hours 10 minutes,

not 35 minutes.`,

      troubleshootingApproach: `1. Record incident start.

2. Track every DR milestone.

3. Restore database.

4. Validate replica-set health.

5. Restore credentials/secrets.

6. Validate TLS.

7. Validate network/firewall.

8. Start application.

9. Update service discovery/DNS.

10. Run smoke tests.

11. Restore customer traffic.

12. Record final service-restoration time.

13. Calculate real RTO.

14. Identify longest dependency.

15. Improve DR automation.`,

      commonMistakes: [
        'Reporting MongoDB startup time as total RTO.',
        'Ignoring DNS propagation/cutover.',
        'Ignoring certificates and secrets.',
        'Testing database recovery separately from application recovery.',
        'Not recording milestone timestamps.'
      ],

      bestPractices: [
        'Measure business-service RTO.',
        'Maintain integrated DR runbooks.',
        'Pre-stage critical dependencies where appropriate.',
        'Automate secure secret/certificate recovery.',
        'Time every DR exercise.'
      ],

      interviewAnswer: `I calculate RTO from the start of the outage until the business service is actually available, not until mongod becomes healthy. I track MongoDB recovery, replica-set readiness, secrets, TLS, networking, DNS, application startup, validation, and customer cutover as separate milestones.

This exposes the real recovery bottleneck and prevents the database team from reporting an artificially low RTO.`,

      keyTakeaways: [
        'Database RTO and service RTO differ.',
        'Application dependencies are part of DR.',
        'Track recovery milestones.',
        'Low RTO requires prepared dependencies.',
        'Measure until users can use the service.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'pitr_disaster_recovery',
    topicId: 'pitr-disaster-recovery',
    topicNumber: 12,
    topicName: 'PITR & Disaster Recovery',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 MongoDB disaster-recovery investigation involving complete primary-region loss, a stale DR member, PITR data, uncertain failover state, and strict RPO/RTO requirements?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `This is a combined L3 incident.

The DBA must solve several problems at once:

• Is the original Primary truly unavailable?
• Is it safe to activate DR?
• How fresh is the DR member?
• What PITR data exists?
• What is the newest safe recovery point?
• Can recovery meet RPO?
• Can the complete service meet RTO?`,

      coreConcept: `Region A lost/unreachable
        |
        v
Determine old-site state
        |
        v
Fence if required
        |
        v
Inventory recovery sources
      /        \
     v          v
stale DR      PITR
member        backup
     \          /
      \        /
       v      v
choose newest valid
authoritative point
        |
        v
recover + validate
        |
        v
rebuild HA
        |
        v
application cutover
        |
        v
measure RPO/RTO`,

      detailedExplanation: `SCENARIO

Production region:
Region A.

DR region:
Region B.

Incident:
Region A becomes unreachable at 18:00.

DR Secondary last applied:
16:20.

Latest full backup:
12:00.

Continuous PITR:
available through 17:57.

Business requirements:

RPO:
5 minutes.

RTO:
90 minutes.

PHASE 1 — INCIDENT CONTROL

Record:

• incident start
• affected services
• last known Primary
• network status.

Do not immediately force a new writable environment.

PHASE 2 — DETERMINE OLD-SITE STATE

Ask:

• Is Region A powered down?
• Is it only unreachable from Region B?
• Can applications still reach it?
• Does it still possess majority?

If uncertain and forced DR is required, establish fencing.

PHASE 3 — INVENTORY RECOVERY SOURCES

Source A:
stale DR Secondary at 16:20.

Potential data loss:
1 hour 40 minutes.

Fails 5-minute RPO.

Source B:
full backup at 12:00 + PITR through 17:57.

Potential data loss:
3 minutes.

Potentially satisfies RPO.

Therefore PITR is the stronger recovery source if validated.

PHASE 4 — VERIFY RECOVERY CHAIN

Check:

• base backup validity
• PITR continuity
• no capture gaps
• required keys
• recovery tooling.

PHASE 5 — BUILD/ACTIVATE RECOVERY ENVIRONMENT

Provision or activate appropriately sized infrastructure.

PHASE 6 — RESTORE

Restore base.

Replay supported recovery history through:

17:57.

PHASE 7 — VALIDATE

Verify:

• critical collections
• latest expected business transactions
• indexes
• users/roles
• security
• exact recovery timestamp.

PHASE 8 — REBUILD HIGH AVAILABILITY

Establish healthy replica-set topology in Region B.

Do not count a single recovered mongod as complete HA.

PHASE 9 — APPLICATION CUTOVER

Restore:

• secrets
• TLS
• networking
• service discovery/DNS
• application connectivity.

PHASE 10 — VERIFY RPO

Failure:
18:00.

Recovery point:
17:57.

Achieved RPO:
approximately 3 minutes.

PHASE 11 — VERIFY RTO

If service returns at:

19:12

then:

RTO:
72 minutes.

Requirement:
90 minutes.

Satisfied.

PHASE 12 — HANDLE RETURNING REGION

When Region A returns:

do not immediately reconnect its old nodes.

They may contain divergent or obsolete history.

Preserve evidence and rebuild/reintegrate according to the approved topology.

PHASE 13 — RCA

Investigate:

• original region failure
• stale DR member
• why it fell behind
• PITR reliability
• fencing time
• restore performance
• application cutover delays.`,

      internalWorking: `18:00 failure

Recovery choices:

DR Secondary:
16:20
=> 100 min loss
=> FAIL RPO

PITR:
17:57
=> 3 min loss
=> PASS RPO

Choose:
validated PITR

Then measure total service recovery
against 90-minute RTO.`,

      architecture: `                 REGION A
                 production
                     |
                     X
               outage/partition
                     |
                  fencing
                     |
                     v

                 REGION B
        +------------+------------+
        |                         |
        v                         v
   stale member               backup/PITR
     16:20                      17:57
        |                         |
        +------------+------------+
                     |
                     v
             recovery decision
                     |
                     v
             restored cluster
                     |
                     v
               validation
                     |
                     v
               application
                     |
                     v
                customers`,

      examples: [
        `Do not choose a stale running member merely because it appears faster.`,
        `A three-minute-old PITR point can satisfy a five-minute RPO while a 100-minute-stale Secondary cannot.`,
        `The final RTO includes application restoration and cutover.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Used where connectivity exists to inspect replica-set state and later validate the recovered topology.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps evaluate available oplog history on surviving valid members.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Helps quantify member lag when assessing whether a DR member is sufficiently current.'
        }
      ],

      productionScenario: `At 18:00 a financial platform loses its primary region.

The DR replica is discovered to be 100 minutes behind.

The team initially wants to promote it because it is already online.

The DBA compares it with PITR coverage through 17:57.

Because the business RPO is five minutes, promoting the stale member would violate the SLA.

After fencing the uncertain old region, the team restores from the validated PITR chain to 17:57, validates financial transactions, establishes a healthy Region B replica set, redirects the application, and restores service at 19:12.

Achieved:

RPO ≈ 3 minutes

RTO = 72 minutes.

Both requirements are met.`,

      troubleshootingApproach: `1. Declare incident and record T0.

2. Identify last known Primary.

3. Determine whether old region is dead or partitioned.

4. Fence old environment if necessary.

5. Determine stale DR member last-applied time.

6. Inventory full backups.

7. Inventory PITR recovery points.

8. Verify PITR continuity.

9. Compare each option against RPO.

10. Select newest validated authoritative point.

11. Activate recovery infrastructure.

12. Restore base.

13. Apply changes to target.

14. Validate recovery boundary.

15. Validate business-critical data.

16. Validate indexes.

17. Validate users/roles/security.

18. Establish replica-set HA.

19. Restore application secrets/TLS.

20. Validate networking.

21. Cut application traffic over.

22. Record service-restoration time.

23. Calculate achieved RPO.

24. Calculate achieved RTO.

25. Monitor recovered environment.

26. Preserve old-region evidence.

27. Rebuild/reintegrate old region safely.

28. Complete RCA.

29. Correct DR-member lag problem.

30. Repeat DR exercise after remediation.`,

      commonMistakes: [
        'Promoting the stale DR member without comparing recovery freshness.',
        'Forcing failover before fencing an uncertain old Primary.',
        'Assuming PITR coverage without checking for gaps.',
        'Declaring recovery complete before application cutover.',
        'Rejoining old-region nodes automatically.',
        'Failing to calculate actual RPO and RTO.'
      ],

      bestPractices: [
        'Compare every recovery source objectively.',
        'Choose the newest validated authoritative point.',
        'Fence before unsafe forced recovery.',
        'Validate data before traffic cutover.',
        'Measure end-to-end RPO and RTO.',
        'Treat returning sites as potentially divergent.',
        'Convert every DR failure into remediation work.'
      ],

      interviewAnswer: `In a combined regional DR incident, I first determine whether the old Primary is truly lost or merely partitioned and fence it before any forced independent recovery.

I then compare the freshness of surviving replicas, full backups, and PITR. If the DR member is 100 minutes stale but PITR is available to three minutes before failure and the RPO is five minutes, I choose the validated PITR path.

I restore, validate the exact recovery point and business data, rebuild replica-set HA, restore application dependencies, cut traffic over, and measure the actual RPO and service-level RTO. Returning old-region nodes are treated as potentially divergent and reintegrated only through a controlled procedure.`,

      keyTakeaways: [
        'DR is a recovery-source selection problem as well as a failover problem.',
        'Stale replicas may violate RPO.',
        'PITR continuity must be proven.',
        'Fencing protects against divergent histories.',
        'RTO ends when the service is usable.',
        'Returning regions require controlled reintegration.'
      ]
    }
  }

];

/* =========================================================
   SEED EXECUTION
========================================================= */

async function seedPitrDisasterRecovery() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'pitr_disaster_recovery'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous pitr_disaster_recovery documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} PITR & Disaster Recovery questions`
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
        category: 'pitr_disaster_recovery'
      });

    console.log(
      `Topic 12 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 12 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 12 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 12 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedPitrDisasterRecovery();
