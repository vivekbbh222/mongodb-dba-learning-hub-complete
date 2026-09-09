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
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 1,
    question:
      'What is a MongoDB backup, why is backup different from replication, and what failure scenarios should a backup strategy protect against?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `A backup is an independent recoverable copy of data that can be used after data loss, corruption, operator error, infrastructure failure, or disaster.

Replication is not the same as backup.

Replication keeps multiple MongoDB members synchronized.

If an application accidentally deletes documents, that delete normally replicates to the Secondaries.

A backup can preserve an earlier recoverable state.`,

      coreConcept: `Replication:

Primary
   |
   +--> Secondary
   |
   +--> Secondary

Changes replicate quickly.

Accidental delete:
   |
   v
also replicated.


Backup:

Production
   |
   v
Independent recovery copy
   |
   v
Restore when required.`,

      detailedExplanation: `A production MongoDB protection strategy usually needs both:

HIGH AVAILABILITY

and

DATA RECOVERY.

Replica sets mainly provide high availability.

Backups provide historical recoverability.

Consider several incidents.

1. SERVER FAILURE

If one replica-set member fails, replication may protect availability.

A backup may not even be required for immediate recovery.

2. ACCIDENTAL DELETE

An administrator runs:

db.orders.deleteMany({})

The delete is valid MongoDB activity.

Replication reproduces that delete on the Secondaries.

A historical backup may be needed.

3. APPLICATION BUG

A release modifies millions of documents incorrectly.

Again, the incorrect writes may replicate successfully.

4. LOGICAL CORRUPTION

Bad application data can be distributed across all replica-set members.

5. COMPLETE CLUSTER LOSS

A major infrastructure event may remove multiple members.

6. SECURITY INCIDENT

Attackers with sufficient database privileges may modify or delete data.

An independent backup stored with separate protection can be critical.

Therefore the DBA should ask:

What failures does replication solve?

What failures require restoration?

What RPO and RTO does the business require?

A mature design combines:

• replica-set high availability
• backups
• point-in-time recovery where required
• off-system or independent backup storage
• regular restore testing.`,

      internalWorking: `Production failure types:

Member failure
     |
     v
Replica set may fail over


Logical deletion
     |
     v
Replication copies deletion
     |
     v
Historical backup required


Complete disaster
     |
     v
Independent backup required`,

      architecture: `             PRODUCTION
                  |
          +-------+-------+
          |               |
          v               v
     REPLICATION        BACKUP
          |               |
          v               v
   High Availability   Recovery copy
          |               |
          v               v
    member failure    logical/disaster
       protection        recovery`,

      examples: [
        `Replication protects availability but not automatically against accidental logical changes.`,
        `A backup from yesterday may be useful if bad data was written today.`,
        `A recovery strategy should be tested by actually restoring data.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health. This validates replication but does not validate that a usable backup exists.'
        }
      ],

      productionScenario: `A developer accidentally deletes 30 million records from a production collection.

The replica set is perfectly healthy.

Within seconds, the delete replicates to the Secondaries.

The team discovers that:

"three copies of the current state"

did not provide:

"a historical copy before the delete."

The DBA restores data from the backup/PITR system.

This demonstrates why replication and backup solve different problems.`,

      troubleshootingApproach: `When reviewing protection:

1. Identify replica-set topology.

2. Identify backup method.

3. Identify backup frequency.

4. Identify RPO.

5. Identify RTO.

6. Identify backup retention.

7. Check backup storage independence.

8. Check encryption/access controls.

9. Check whether oplog/PITR is available.

10. Check restore procedures.

11. Perform restore tests.

12. Document failure scenarios.

13. Confirm business requirements are actually achievable.`,

      commonMistakes: [
        'Calling a replica set a backup.',
        'Assuming Secondaries protect against logical deletion.',
        'Keeping the only backup on the same server.',
        'Never testing restore.',
        'Choosing backup frequency without RPO requirements.'
      ],

      bestPractices: [
        'Use replication and backup together.',
        'Keep backup storage independent.',
        'Define RPO and RTO.',
        'Protect backup credentials separately.',
        'Test restores regularly.'
      ],

      interviewAnswer: `Replication and backup solve different problems. A replica set keeps current copies synchronized and provides high availability, but logical errors such as delete or bad update operations also replicate.

A backup provides an independent recoverable state. I design backups around RPO, RTO, retention, disaster scenarios, security, and regular restore validation.`,

      keyTakeaways: [
        'Replication is not backup.',
        'Logical errors can replicate.',
        'Backups provide historical recovery.',
        'RPO and RTO drive design.',
        'A backup is only useful if restore is proven.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 2,
    question:
      'What are RPO and RTO in MongoDB disaster recovery, and how do they influence backup frequency and restore design?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `RPO means:

Recovery Point Objective.

It answers:

How much data loss can the business tolerate?


RTO means:

Recovery Time Objective.

It answers:

How long can the service remain unavailable before recovery must be completed?`,

      coreConcept: `RPO:

Failure at 4:00 PM

Latest recoverable point:
3:55 PM

Potential loss:
5 minutes


RTO:

Failure at 4:00 PM

Service must recover by:
4:30 PM

Allowed recovery time:
30 minutes`,

      detailedExplanation: `Suppose a company takes one backup every 24 hours.

If the database fails just before the next backup, restoring only the last full backup may potentially lose nearly one day of changes.

That may be acceptable for a test environment.

It may be unacceptable for:

• payments
• banking
• orders
• healthcare
• inventory

If the required RPO is:

5 minutes

then one full backup per day is not sufficient by itself.

The strategy may require continuous or frequent change capture, such as point-in-time recovery mechanisms.

RTO is separate.

Suppose the company has:

RPO = 5 minutes

but the backup is:

10 TB

and the restore procedure takes:

14 hours.

If the business RTO is:

1 hour

the recovery design fails even though the backup contains sufficiently recent data.

Therefore backup design must consider:

• backup generation time
• storage throughput
• restore throughput
• network speed
• index rebuild requirements
• data validation
• DNS/application failover
• cluster reconstruction

The DBA should never report:

"We have daily backups, so DR is covered"

without mapping the solution to RPO and RTO.`,

      internalWorking: `Business requirement
       |
   +---+---+
   |       |
   v       v
  RPO     RTO
   |       |
   v       v
How much How long
data loss recovery
allowed?  may take?
   |       |
   +---+---+
       |
       v
Backup/restore architecture`,

      architecture: `Failure occurs
      |
      +-------------------+
      |                   |
      v                   v
Recovery Point         Recovery Time
     RPO                   RTO
      |                   |
      v                   v
backup frequency      restore design
PITR capability       infrastructure
retention             throughput`,

      examples: [
        `RPO = 24 hours can potentially be satisfied by daily recovery points, depending on the system.`,
        `RPO = 5 minutes typically requires more frequent change capture than one daily dump.`,
        `RTO = 30 minutes may be impossible if restore of the dataset takes several hours.`
      ],

      commands: [
        {
          command:
            'time mongorestore <restore-options>',
          explanation:
            'In a controlled restore test, measuring actual restore duration helps validate whether the designed RTO is realistic.'
        }
      ],

      productionScenario: `A 4 TB production database has:

daily backup

Business RPO:
15 minutes

Business RTO:
2 hours.

The DBA identifies two gaps.

Daily backup alone cannot satisfy the 15-minute recovery point.

The tested restore also takes 7 hours.

The organization must redesign both:

recovery-point capture

and:

restore infrastructure/performance.`,

      troubleshootingApproach: `1. Obtain business RPO.

2. Obtain business RTO.

3. Document current backup frequency.

4. Determine maximum recoverable point gap.

5. Measure backup duration.

6. Measure restore duration.

7. Include cluster reconstruction time.

8. Include validation time.

9. Include application cutover time.

10. Identify RPO gap.

11. Identify RTO gap.

12. Redesign and retest.`,

      commonMistakes: [
        'Confusing RPO with RTO.',
        'Defining RPO from DBA preference instead of business requirement.',
        'Ignoring actual restore duration.',
        'Measuring only data copy time.',
        'Claiming DR readiness without testing.'
      ],

      bestPractices: [
        'Document RPO and RTO formally.',
        'Measure real restore times.',
        'Test large-scale recovery.',
        'Include validation and application cutover.',
        'Review requirements as data size grows.'
      ],

      interviewAnswer: `RPO defines how much data loss the business can tolerate, while RTO defines how quickly service must be restored.

RPO drives recovery-point frequency and PITR requirements. RTO drives restore throughput, infrastructure readiness, automation, validation, and cutover design. I validate both using real restore tests rather than assumptions.`,

      keyTakeaways: [
        'RPO measures acceptable data-loss window.',
        'RTO measures acceptable recovery time.',
        'They are independent requirements.',
        'Backup frequency alone does not determine RTO.',
        'Both must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 3,
    question:
      'What is mongodump, what does it back up, and when is a logical MongoDB backup appropriate?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `mongodump is a MongoDB Database Tools utility used to create a logical BSON backup of MongoDB data.

It reads documents from MongoDB and writes them into BSON dump files, along with metadata required for restore where applicable.

It is commonly paired with:

mongorestore.`,

      coreConcept: `MongoDB
   |
   v
mongodump
   |
   v
BSON backup
   |
   v
mongorestore
   |
   v
MongoDB`,

      detailedExplanation: `mongodump is a logical backup.

That means it backs up MongoDB-level data rather than simply copying WiredTiger storage files.

Typical output includes:

database directories

collection BSON files

metadata files.

Example:

dump/
  sales/
    orders.bson
    orders.metadata.json
    users.bson
    users.metadata.json

Logical backup has several advantages.

1. FLEXIBILITY

You can back up:

• entire deployment
• database
• collection
• selected namespaces, depending on options.

2. PORTABILITY

Logical BSON data can often be restored into another compatible MongoDB deployment.

3. GRANULAR RESTORE

Individual databases or collections can be restored.

But there are important limitations.

Logical backups can be slower for very large datasets because documents must be read and serialized.

A restore must write data back through MongoDB and recreate indexes, which can take substantial time.

For very large production environments, physical snapshots or managed continuous-backup systems may provide better RTO.

Therefore mongodump is particularly useful for:

• smaller/medium datasets
• migrations
• selected databases
• selected collections
• development/test copies
• logical export-style recovery workflows

It should not automatically be assumed to be the best method for every multi-terabyte production environment.`,

      internalWorking: `mongodump:

MongoDB documents
      |
      v
Read through MongoDB
      |
      v
Serialize BSON
      |
      v
Write dump files


mongorestore:

BSON
 |
 v
Send documents to MongoDB
 |
 v
Build/restore metadata/indexes`,

      architecture: `        SOURCE MONGODB
              |
              v
          mongodump
              |
              v
         BSON BACKUP
              |
              v
         backup storage
              |
              v
         mongorestore
              |
              v
        TARGET MONGODB`,

      examples: [
        `Full logical backup:

mongodump --uri="<URI>" --out=/backup/dump`,

        `Single database:

mongodump --uri="<URI>" --db=webapp --out=/backup/dump`,

        `Use authentication/TLS options appropriate to the environment.`
      ],

      commands: [
        {
          command:
            'mongodump --uri="<URI>" --out=/backup/dump',
          explanation:
            'Creates a logical BSON dump. Never expose credentials in shell history in production; use secure credential handling.'
        },
        {
          command:
            'mongodump --version',
          explanation:
            'Checks the Database Tools version, which should be validated for compatibility with the source deployment.'
        }
      ],

      productionScenario: `A DBA needs to migrate one 80 GB database from a production replica set into a staging environment.

A full storage-level snapshot of the entire multi-terabyte cluster would be excessive.

mongodump allows a database-level logical backup that can later be restored into staging.

For a 15 TB disaster-recovery backup, however, the DBA evaluates faster physical or managed backup methods because logical restore time could violate RTO.`,

      troubleshootingApproach: `Before using mongodump:

1. Check database size.

2. Estimate backup duration.

3. Estimate restore duration.

4. Verify Database Tools compatibility.

5. Check destination disk space.

6. Check source read impact.

7. Check network throughput.

8. Determine consistency requirements.

9. Determine whether oplog capture is required.

10. Test restore.

11. Validate counts/indexes afterward.`,

      commonMistakes: [
        'Calling mongodump a filesystem backup.',
        'Using it for massive production datasets without measuring RTO.',
        'Ignoring source read load.',
        'Assuming a successful dump guarantees a successful restore.',
        'Using incompatible or untested Database Tools versions.'
      ],

      bestPractices: [
        'Match the backup method to data size and RTO.',
        'Use secure authentication handling.',
        'Record Database Tools versions.',
        'Monitor source impact.',
        'Test mongorestore before relying on the dump.'
      ],

      interviewAnswer: `mongodump creates a logical BSON backup using MongoDB Database Tools. It can back up databases or collections and is useful for granular recovery, migration, staging copies, and many small-to-medium logical backup use cases.

For very large production datasets I compare its backup and restore duration against physical snapshot or continuous-backup approaches because logical restoration can become the RTO bottleneck.`,

      keyTakeaways: [
        'mongodump is a logical backup tool.',
        'It produces BSON.',
        'mongorestore restores the data.',
        'It supports granular backup workflows.',
        'Very large datasets may need a different backup strategy.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 4,
    question:
      'What is mongorestore, how does it restore BSON backups, and what should a DBA validate before restoring data?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `mongorestore is the MongoDB Database Tools utility used to restore BSON data created by mongodump.

It reads backup BSON files and inserts the documents into the target MongoDB deployment.

It can also restore collection metadata and indexes depending on how the dump was created and restore options used.`,

      coreConcept: `Backup files
    |
    v
mongorestore
    |
    v
Connect to target
    |
    v
Restore documents
    |
    v
Restore/create indexes
    |
    v
Validate data`,

      detailedExplanation: `A restore is not simply:

"run mongorestore and wait."

The DBA must first determine the restore objective.

Questions include:

• restore into original database?
• restore into another database?
• restore only one collection?
• overwrite existing data?
• preserve existing documents?
• restore users/roles?
• restore into same MongoDB version?
• restore into a later compatible version?

Important restore behaviors include:

DATA ALREADY EXISTS

mongorestore does not automatically mean:

replace everything.

If the target collection already contains documents with the same _id, duplicate-key failures can occur unless an appropriate restore strategy is used.

--drop

A common option is:

--drop

This tells mongorestore to drop target collections before restoring them.

This is destructive and must be used carefully.

INDEXES

Restoring large numbers of indexes can consume significant CPU, memory, and disk I/O.

NAMESPACE MAPPING

mongorestore supports namespace include/exclude and namespace mapping capabilities that can be useful for restoring into different database/collection names.

VALIDATION

A restore completing with exit code 0 is only the first validation point.

The DBA should verify:

• expected databases/collections
• document counts where meaningful
• indexes
• users/roles where applicable
• application queries
• data samples/business checks
• replica-set health after restore.`,

      internalWorking: `dump/orders.bson
       |
       v
mongorestore
       |
       +--> decode BSON
       |
       +--> insert batches
       |
       +--> recreate indexes
       |
       v
target.orders`,

      architecture: `             BACKUP STORAGE
                    |
                    v
               mongorestore
                    |
                    v
              TARGET MONGODB
             /      |      \
            v       v       v
         data     indexes   metadata
                    |
                    v
                 validation`,

      examples: [
        `Restore dump directory:

mongorestore --uri="<TARGET_URI>" /backup/dump`,

        `Drop target collections first:

mongorestore --drop --uri="<TARGET_URI>" /backup/dump`,

        `Use --drop only when the intended recovery procedure requires replacement of existing collections.`
      ],

      commands: [
        {
          command:
            'mongorestore --uri="<TARGET_URI>" /backup/dump',
          explanation:
            'Restores a dump into the target deployment.'
        },
        {
          command:
            'mongorestore --drop --uri="<TARGET_URI>" /backup/dump',
          explanation:
            'Drops target collections before restore. This is destructive and should only be used deliberately.'
        },
        {
          command:
            'mongorestore --version',
          explanation:
            'Checks Database Tools version for compatibility troubleshooting.'
        }
      ],

      productionScenario: `A collection was corrupted by an application bug.

The DBA has a valid logical backup.

Instead of immediately using:

--drop

against production, the DBA first restores the collection into an isolated recovery namespace.

The recovered data is validated.

Only then does the team perform the approved production reconciliation.

This lowers the risk of replacing valid current data with an incorrect restore.`,

      troubleshootingApproach: `Before restore:

1. Identify exact recovery target.

2. Verify backup source.

3. Verify backup timestamp.

4. Verify MongoDB and tools compatibility.

5. Check target disk.

6. Decide whether existing data should remain.

7. Decide whether --drop is appropriate.

8. Identify namespace mapping.

9. Estimate index build cost.

10. Test restore in isolation.

After restore:

11. Check command exit status.

12. Review restore log/errors.

13. Validate collections.

14. Validate document counts.

15. Validate indexes.

16. Perform application/business checks.`,

      commonMistakes: [
        'Using --drop without understanding its effect.',
        'Restoring directly into production before testing.',
        'Ignoring duplicate-key errors.',
        'Ignoring index creation failures.',
        'Treating command completion as complete recovery validation.'
      ],

      bestPractices: [
        'Restore to an isolated environment first when possible.',
        'Capture restore logs.',
        'Validate counts and indexes.',
        'Measure restore time.',
        'Use destructive options only through an approved recovery procedure.'
      ],

      interviewAnswer: `mongorestore reads BSON generated by mongodump and writes it into a target MongoDB deployment, restoring metadata and indexes where appropriate.

Before restoring I verify backup timestamp, compatibility, disk space, namespace mapping, existing target data, and whether destructive options such as --drop are actually intended. Afterward I validate documents, indexes, errors, application behavior, and restore duration.`,

      keyTakeaways: [
        'mongorestore restores BSON logical backups.',
        'Existing target data matters.',
        '--drop is destructive.',
        'Indexes can make restore expensive.',
        'Restore completion must be followed by validation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 5,
    question:
      'What is the difference between mongodump directory output, --archive, and --gzip, and when would you use each?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `mongodump can write backups in different forms.

Common options include:

directory output

--archive

--gzip

They affect how the backup is packaged and stored.`,

      coreConcept: `Option 1:

mongodump --out=/backup/dump

Creates directory/file structure.


Option 2:

mongodump --archive=backup.archive

Creates archive stream/file.


Option 3:

--gzip

Compresses supported dump output.`,

      detailedExplanation: `DIRECTORY OUTPUT

Example:

mongodump --out=/backup/dump

Produces files such as:

dump/
  db1/
    coll1.bson
    coll1.metadata.json

Advantages:

• easy to inspect file structure
• convenient for individual namespace handling
• simple local backup layout

ARCHIVE

Example:

mongodump --archive=/backup/full.archive

Packages the dump into an archive format designed for Database Tools.

Useful when:

• one backup file is easier to transfer
• piping/streaming is useful
• filesystem file-count overhead is undesirable

GZIP

Example:

mongodump --gzip --archive=/backup/full.archive.gz

Compression can reduce storage and network usage.

Trade-offs:

• more CPU during compression/decompression
• compression ratio depends on data
• backup/restore throughput may become CPU-bound

Important distinction:

--archive is packaging.

--gzip is compression.

They are not the same feature.

For large backups, a DBA should benchmark:

without compression

versus:

with compression

because storage/network savings may or may not justify additional CPU time.`,

      internalWorking: `Directory:

MongoDB
  |
  v
many BSON/metadata files


Archive:

MongoDB
  |
  v
single archive stream/file


Archive + gzip:

MongoDB
  |
  v
archive
  |
  v
compressed archive`,

      architecture: `             mongodump
                 |
        +--------+--------+
        |                 |
        v                 v
    directory          archive
     output             output
        |                 |
        +--------+--------+
                 |
              optional
               gzip
                 |
                 v
           compressed data`,

      examples: [
        `Directory:

mongodump --out=/backup/dump`,

        `Archive:

mongodump --archive=/backup/full.archive`,

        `Archive with gzip:

mongodump --archive=/backup/full.archive.gz --gzip`
      ],

      commands: [
        {
          command:
            'mongodump --uri="<URI>" --out=/backup/dump',
          explanation:
            'Creates directory-style dump output.'
        },
        {
          command:
            'mongodump --uri="<URI>" --archive=/backup/full.archive',
          explanation:
            'Creates archive-format backup output.'
        },
        {
          command:
            'mongodump --uri="<URI>" --archive=/backup/full.archive.gz --gzip',
          explanation:
            'Creates a gzip-compressed archive.'
        }
      ],

      productionScenario: `A remote backup server has limited network bandwidth.

An uncompressed logical backup produces:

800 GB

and takes many hours to transfer.

The DBA tests gzip.

Backup CPU rises, but archive size drops enough that total backup transfer time improves significantly.

On another environment with extremely fast local storage but limited CPU, compression actually increases total duration.

The correct choice depends on the bottleneck.`,

      troubleshootingApproach: `1. Measure source data size.

2. Measure backup output size.

3. Measure CPU during backup.

4. Measure disk throughput.

5. Measure network throughput.

6. Test compression ratio.

7. Test backup duration.

8. Test restore duration.

9. Choose packaging based on operational requirements.

10. Do not assume compression is always faster.`,

      commonMistakes: [
        'Thinking --archive means compression.',
        'Thinking --gzip is free.',
        'Selecting compression without benchmarking.',
        'Naming an uncompressed archive .gz and assuming it is compressed.',
        'Testing backup speed but not restore speed.'
      ],

      bestPractices: [
        'Benchmark backup and restore.',
        'Use archive for convenient packaging/streaming.',
        'Use gzip when storage or network savings justify CPU cost.',
        'Keep naming conventions clear.',
        'Record the exact options used with each backup.'
      ],

      interviewAnswer: `Directory output creates separate BSON and metadata files. --archive packages a logical dump into an archive stream or file, while --gzip compresses supported dump output.

I choose between them based on operational handling, file count, network, storage, CPU, and tested restore performance rather than assuming compression is always beneficial.`,

      keyTakeaways: [
        'Directory and archive are packaging choices.',
        'gzip is compression.',
        'Compression trades CPU for smaller output.',
        'Archive can simplify transfer.',
        'Benchmark both backup and restore.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 6,
    question:
      'How do you take a consistent mongodump from a MongoDB replica set while writes are continuing, and what is the role of the oplog option?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `When an application continues writing during mongodump, different collections may be read at slightly different times.

For supported replica-set backup workflows, mongodump can capture oplog activity occurring during the dump.

This helps provide a restore point that can be replayed to improve consistency across the logical backup.`,

      coreConcept: `Backup begins
   |
   v
Dump collections
   |
   +--> application writes continue
   |
   +--> oplog changes captured
   |
   v
Backup ends

Restore:
dump data
   |
   v
apply captured oplog
   |
   v
consistent recovery point`,

      detailedExplanation: `Consider:

10:00:00 backup begins.

Collection A is dumped at:

10:05.

Collection B is dumped at:

10:20.

Meanwhile the application continues updating both collections.

Without additional change capture, the resulting logical backup may represent data observed across a time interval rather than one clean logical endpoint.

For supported replica-set mongodump workflows, the:

--oplog

option captures oplog entries that occur while the dump is running.

mongorestore can later use:

--oplogReplay

to replay those captured operations.

This is important for backup consistency when writes continue.

However, there are constraints.

The dump must satisfy the Database Tools requirements for oplog capture.

The oplog history needed for the dump must remain available.

Heavy write rates and a small oplog window create risk.

For example:

Backup duration:
8 hours

Available oplog history:
3 hours

That is an obvious warning sign for any backup workflow depending on the relevant oplog interval.

Also remember:

--oplog is not equivalent to a complete enterprise PITR architecture.

It provides consistency/change capture around a mongodump operation.

Continuous point-in-time recovery is a broader system.`,

      internalWorking: `10:00 dump starts
      |
      +---- collections read ----+
      |                          |
      +---- oplog capture -------+
                                 |
                              12:00
                              dump ends


Restore:

Base dump
   +
captured oplog
   |
   v
replayed recovery state`,

      architecture: `             PRIMARY / REPLICA SET
                      |
          +-----------+-----------+
          |                       |
          v                       v
    logical collection         oplog
          dump                 changes
          |                       |
          +-----------+-----------+
                      |
                      v
                  BACKUP SET
                      |
                      v
                  RESTORE
                      |
                      v
                oplog replay`,

      examples: [
        `Conceptual:

mongodump --uri="<URI>" --oplog --out=/backup/dump`,

        `Restore:

mongorestore --oplogReplay /backup/dump`,

        `Always verify exact Database Tools requirements and compatibility before production use.`
      ],

      commands: [
        {
          command:
            'mongodump --uri="<URI>" --oplog --out=/backup/dump',
          explanation:
            'Captures oplog changes during a supported full logical dump workflow.'
        },
        {
          command:
            'mongorestore --uri="<TARGET_URI>" --oplogReplay /backup/dump',
          explanation:
            'Replays captured oplog entries after restoring the dump.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Provides a quick view of the replica set oplog time window.'
        }
      ],

      productionScenario: `A production replica set receives writes 24x7.

A full logical dump requires six hours.

The DBA cannot stop the application.

The backup process uses a supported oplog-aware mongodump workflow.

Before starting, the DBA checks:

• replica-set health
• oplog window
• write volume
• free storage

and confirms that the oplog history provides a comfortable safety margin.

The restore process is tested with oplog replay.`,

      troubleshootingApproach: `1. Confirm source is a supported replica-set deployment.

2. Check mongodump Database Tools version.

3. Check replica-set health.

4. Check oplog size.

5. Check oplog time window.

6. Estimate backup duration.

7. Measure write rate.

8. Ensure sufficient oplog safety margin.

9. Run supported --oplog dump.

10. Capture logs.

11. Restore in test environment.

12. Use oplog replay.

13. Validate recovered state.`,

      commonMistakes: [
        'Assuming individual collection dumps automatically represent one instant.',
        'Ignoring oplog window.',
        'Calling --oplog a complete PITR solution.',
        'Using oplog-related options without checking tool restrictions.',
        'Never testing oplog replay.'
      ],

      bestPractices: [
        'Check oplog window before long dumps.',
        'Maintain safety margin beyond expected dump time.',
        'Test restore with oplog replay.',
        'Monitor write rate during backup.',
        'Use continuous backup/PITR systems where very small RPO is required.'
      ],

      interviewAnswer: `For a supported replica-set mongodump while writes continue, I can use --oplog so the dump captures oplog operations that occur during the backup interval. During restore, --oplogReplay can apply those changes to produce a consistent logical recovery state.

Before relying on this, I verify replica-set health, tools compatibility, dump duration, write rate, and especially whether the oplog window comfortably covers the operation.`,

      keyTakeaways: [
        'Live logical dumps span time.',
        '--oplog captures changes during supported dumps.',
        '--oplogReplay applies those changes.',
        'Oplog window is important.',
        'This is not the same as continuous PITR.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 7,
    question:
      'Should mongodump be run from the Primary or a Secondary, and what trade-offs should a DBA consider?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `Running a backup consumes database resources.

A common goal is to reduce backup impact on the Primary by reading from a suitable Secondary.

But a Secondary is not automatically the correct backup source.

Its health, lag, hardware, consistency requirements, and read preference must be considered.`,

      coreConcept: `Backup from Primary:

+ freshest local state
- adds read load to Primary


Backup from Secondary:

+ can offload Primary
- Secondary may lag
- can increase Secondary resource pressure
- source must remain healthy`,

      detailedExplanation: `PRIMARY BACKUP

Advantages:

• direct access to current Primary data
• avoids intentional Secondary staleness

Disadvantages:

• competes with production reads/writes
• may affect cache
• may increase disk I/O
• can increase latency under heavy load

SECONDARY BACKUP

Advantages:

• can isolate much of the backup read workload from the Primary
• useful with a dedicated backup member

Disadvantages:

• Secondary may be behind
• backup workload can increase replication lag
• slow disk can affect catch-up
• a voting backup member may influence HA behavior if it becomes unhealthy
• hidden/dedicated member design may require operational planning

A robust production pattern may use:

a dedicated hidden Secondary

with:

priority: 0

for backup workloads.

But even that member must be monitored.

The DBA should check:

• replication lag
• oplog window
• disk
• CPU
• cache
• network
• whether the member is caught up enough for the intended recovery point

Backup consistency requirements and the chosen mongodump/read-preference options must also be compatible with the tools version and desired backup semantics.`,

      internalWorking: `Option A:

Application
   |
   v
Primary
   |
   +--> writes
   +--> queries
   +--> backup reads


Option B:

Application -> Primary

Backup -> Dedicated Secondary

Better isolation,
but Secondary health
must be monitored.`,

      architecture: `                  PRIMARY
                     |
             replication
                     |
             +-------+-------+
             |               |
             v               v
        SECONDARY      BACKUP SECONDARY
                            |
                            v
                       mongodump`,

      examples: [
        `A hidden priority-0 member can be useful for backup isolation.`,
        `Do not run a heavy backup on a lagging Secondary just because it is not Primary.`,
        `Check read preference and tool behavior for the exact backup command being used.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Verifies candidate backup member health and replication state.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a quick lag view before selecting a Secondary for backup.'
        }
      ],

      productionScenario: `A nightly mongodump runs against the Primary.

During the backup:

Primary disk latency rises

application reads slow down.

The DBA moves the workload to a dedicated hidden Secondary.

Primary latency improves.

Later the DBA notices the backup member accumulates substantial replication lag during the dump.

The backup schedule and hardware are adjusted so the member remains safely within the oplog window.`,

      troubleshootingApproach: `Before selecting backup source:

1. Check Primary load.

2. Check Secondary health.

3. Check lag.

4. Check disk latency.

5. Check CPU.

6. Check cache pressure.

7. Check network.

8. Check oplog window.

9. Determine backup consistency requirements.

10. Validate read preference/tool support.

11. Monitor lag during backup.

12. Confirm member catches up afterward.`,

      commonMistakes: [
        'Always backing up Primary without measuring impact.',
        'Assuming every Secondary is safe for backup.',
        'Ignoring Secondary lag.',
        'Overloading a backup Secondary until it falls outside the oplog window.',
        'Using a dedicated member without monitoring it.'
      ],

      bestPractices: [
        'Use a dedicated backup member where justified.',
        'Monitor backup-member lag continuously.',
        'Keep sufficient oplog history.',
        'Benchmark backup impact.',
        'Choose source based on recovery and workload requirements.'
      ],

      interviewAnswer: `mongodump can create significant read and I/O load, so I often prefer a healthy dedicated Secondary when the backup semantics support it. This can reduce Primary impact.

But I first verify lag, oplog window, disk, CPU, cache, and read-preference/tool behavior because a lagging or overloaded Secondary can produce an unsuitable recovery point or fall further behind during backup.`,

      keyTakeaways: [
        'Backup source selection affects production load.',
        'Secondary backups can reduce Primary pressure.',
        'Secondary lag must be considered.',
        'Dedicated backup members still need monitoring.',
        'Recovery semantics matter more than simply choosing Primary vs Secondary.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 8,
    question:
      'What is a filesystem or storage snapshot backup in MongoDB, and how is it different from mongodump?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `A storage snapshot captures MongoDB's underlying data volume at the storage layer.

Examples can include:

• cloud block-storage snapshots
• LVM/storage snapshots
• enterprise backup platform snapshots.

This differs from mongodump, which reads MongoDB documents logically and writes BSON.`,

      coreConcept: `mongodump:

MongoDB documents
      |
      v
logical BSON


Snapshot:

MongoDB data files
      |
      v
storage/block-level image`,

      detailedExplanation: `LOGICAL BACKUP

mongodump:

• reads documents
• produces BSON
• allows granular logical restore
• can be slower for huge datasets

PHYSICAL/STORAGE SNAPSHOT

A snapshot captures storage containing MongoDB data files.

Advantages can include:

• very fast snapshot creation
• efficient handling of large datasets
• potentially faster recovery for large systems
• storage-native incremental capabilities depending on platform

But snapshot correctness requires understanding storage consistency.

MongoDB uses:

• WiredTiger data files
• journal
• checkpoints

A snapshot should represent a recoverable storage state.

For replica sets, production snapshot procedures are normally designed using documented filesystem/storage-level backup guidance for the MongoDB version and storage system.

If MongoDB files span multiple volumes, the snapshot mechanism may need atomic consistency across those volumes.

Simply copying random WiredTiger files from a running server is not equivalent to a valid storage snapshot.

Similarly:

cp -r /data/db

while mongod is actively writing

is not automatically a supported consistent backup workflow.

The snapshot strategy must also include:

• config files
• certificates/keys where operationally needed
• cluster topology records
• encryption-key recovery
• restore procedures.`,

      internalWorking: `Logical:

MongoDB
  |
documents
  |
mongodump
  |
BSON


Physical:

WiredTiger files
journal
metadata
  |
storage snapshot
  |
volume image`,

      architecture: `                 MONGODB
                    |
          +---------+---------+
          |                   |
          v                   v
       Logical             Physical
       backup               backup
          |                   |
          v                   v
        BSON            storage blocks
          |                   |
          v                   v
    mongorestore        volume recovery`,

      examples: [
        `Cloud block-volume snapshot of the MongoDB dbPath volume using a documented consistent procedure.`,
        `LVM snapshot of a consistent MongoDB data volume.`,
        `Do not treat an ordinary recursive copy of live WiredTiger files as automatically valid.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ fsync: 1 })',
          explanation:
            'MongoDB supports administrative storage-flush operations, but exact snapshot procedures, locking requirements, and recommended mechanisms depend on deployment and version. Follow the documented workflow rather than improvising.'
        }
      ],

      productionScenario: `A 20 TB MongoDB deployment has an RTO of two hours.

mongorestore of a logical backup takes much longer than the RTO.

The architecture team evaluates storage snapshots that can provision a recoverable copy much faster.

The team tests:

• snapshot consistency
• volume attachment
• MongoDB startup
• replica-set reconfiguration where needed
• application validation

before declaring the snapshot strategy production-ready.`,

      troubleshootingApproach: `For snapshot design:

1. Identify storage technology.

2. Identify all MongoDB data volumes.

3. Determine whether snapshots are atomic across volumes.

4. Review MongoDB-version backup guidance.

5. Understand journal/checkpoint behavior.

6. Check encryption-key requirements.

7. Test snapshot creation.

8. Restore into isolated hosts.

9. Start MongoDB.

10. Review recovery logs.

11. Validate data.

12. Measure RTO.`,

      commonMistakes: [
        'Equating cp of live dbPath with a valid snapshot.',
        'Ignoring multiple-volume consistency.',
        'Backing up encrypted files without key-recovery planning.',
        'Assuming fast snapshot creation means fast complete recovery.',
        'Never testing restored snapshots.'
      ],

      bestPractices: [
        'Use documented storage-consistent procedures.',
        'Keep MongoDB data layout simple for snapshots.',
        'Protect encryption keys separately.',
        'Test full recovery.',
        'Measure end-to-end RTO.'
      ],

      interviewAnswer: `mongodump is a logical BSON backup, while a filesystem or storage snapshot captures MongoDB's physical storage state.

Snapshots can be much faster for large datasets and may improve RTO, but the snapshot must be storage-consistent and follow MongoDB's documented procedure. I also test journal recovery, multi-volume consistency, encryption-key availability, startup, and data validation.`,

      keyTakeaways: [
        'Snapshots are physical/storage-level backups.',
        'mongodump is logical.',
        'Snapshots can improve large-dataset RTO.',
        'Consistency requirements are critical.',
        'Random copies of live data files are not a backup strategy.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 9,
    question:
      'How do you verify whether a MongoDB backup is actually valid and restorable?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `A successful backup command does not prove that recovery will succeed.

The strongest validation is:

restore the backup into an isolated environment and verify the recovered database.`,

      coreConcept: `Backup job says SUCCESS
        |
        v
Only first check
        |
        v
Restore test
        |
        v
Data validation
        |
        v
Index validation
        |
        v
Application validation
        |
        v
Backup proven usable`,

      detailedExplanation: `Backup validation has several levels.

LEVEL 1 — JOB VALIDATION

Check:

• exit code
• logs
• backup file existence
• expected size
• storage upload success

This is necessary but weak.

LEVEL 2 — STRUCTURAL VALIDATION

For logical backup:

• expected databases
• expected BSON files
• metadata files
• archive readability

For snapshot:

• snapshot exists
• volumes can be provisioned
• permissions are correct

LEVEL 3 — RESTORE VALIDATION

Actually restore.

This proves far more than checking backup file existence.

LEVEL 4 — DATABASE VALIDATION

Check:

• collection counts
• indexes
• sample records
• schema/business expectations
• users/roles where applicable

LEVEL 5 — APPLICATION VALIDATION

Run representative application queries or smoke tests.

LEVEL 6 — RECOVERY-TIME VALIDATION

Measure how long the entire operation took.

A restore that works but takes:

12 hours

does not satisfy:

RTO = 2 hours.

Therefore a DBA should report:

"backup job successful"

separately from:

"backup recovery tested successfully."`,

      internalWorking: `Backup created
    |
    v
Verify files
    |
    v
Restore
    |
    v
Check MongoDB
    |
    v
Check application
    |
    v
Measure duration
    |
    v
Recovery validated`,

      architecture: `           BACKUP SYSTEM
                |
                v
          Backup artifact
                |
                v
        ISOLATED RESTORE
                |
          +-----+-----+
          |           |
          v           v
       database    application
      validation     testing
          \           /
           \         /
             v     v
          RECOVERY PROOF`,

      examples: [
        `Restore one recent backup every week into an isolated environment.`,
        `Periodically perform full DR restoration.`,
        `Compare expected collection/index inventory.`
      ],

      commands: [
        {
          command:
            'mongorestore --uri="<TEST_URI>" /backup/dump',
          explanation:
            'Actual restoration into a test environment is one of the strongest checks for logical backup usability.'
        },
        {
          command:
            'db.getCollectionNames()',
          explanation:
            'Useful as one basic inventory check after restore.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Validates that expected indexes exist after restore.'
        }
      ],

      productionScenario: `Backups have shown green status for six months.

During a real incident, mongorestore fails because several backup files were never copied correctly to long-term storage.

The organization had monitored:

backup creation

but never:

restore completion.

After the incident, automated restore testing becomes part of backup validation.`,

      troubleshootingApproach: `1. Check backup job status.

2. Check backup logs.

3. Check artifact size.

4. Check storage integrity where supported.

5. Restore into isolated environment.

6. Check restore errors.

7. Validate collections.

8. Validate document counts.

9. Validate indexes.

10. Validate permissions/users if relevant.

11. Run application smoke test.

12. Measure restore duration.

13. Record result.

14. Alert if validation fails.`,

      commonMistakes: [
        'Trusting a green backup job alone.',
        'Checking only file size.',
        'Never restoring backups.',
        'Validating documents but not indexes.',
        'Ignoring RTO during testing.'
      ],

      bestPractices: [
        'Automate restore testing where possible.',
        'Perform periodic full DR exercises.',
        'Validate business-critical data.',
        'Measure recovery time.',
        'Keep evidence of backup validation.'
      ],

      interviewAnswer: `I do not consider a backup validated merely because the backup command succeeded. I restore it into an isolated environment, check restore logs, collections, document counts, indexes, users/roles where relevant, and run application-level smoke tests.

I also measure total recovery duration so I can prove both recoverability and RTO compliance.`,

      keyTakeaways: [
        'Backup success does not prove restore success.',
        'Actual restore testing is essential.',
        'Indexes and metadata must be validated.',
        'Application checks add confidence.',
        'Recovery time must also be measured.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 10,
    question:
      'How would you design a practical MongoDB backup strategy for a production replica set from requirement gathering through restore testing?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A production backup strategy should not start with a command.

It should start with business recovery requirements.

The process is:

Requirements
     |
     v
Choose backup method
     |
     v
Choose frequency/retention
     |
     v
Protect backup storage
     |
     v
Automate
     |
     v
Monitor
     |
     v
Restore test.`,

      coreConcept: `Backup design:

RPO
RTO
Data size
Write rate
Retention
Security
Compliance
     |
     v
Backup architecture
     |
     v
Recovery procedure
     |
     v
Tested restore`,

      detailedExplanation: `STEP 1 — DEFINE REQUIREMENTS

Collect:

• RPO
• RTO
• retention
• legal/compliance requirements
• recovery scenarios

STEP 2 — MEASURE ENVIRONMENT

Record:

• total data size
• index size
• growth rate
• write rate
• oplog window
• network bandwidth
• storage throughput

STEP 3 — SELECT BACKUP METHOD

Possibilities include:

• mongodump logical backup
• storage snapshot
• managed backup platform
• continuous/PITR solution

The best choice depends on scale and requirements.

STEP 4 — SELECT SOURCE

For replica-set backups, determine whether:

• Primary
• Secondary
• dedicated hidden Secondary

best fits the workload and recovery semantics.

STEP 5 — DESIGN STORAGE

Backup storage should consider:

• independent failure domain
• encryption
• access controls
• retention
• immutability where required
• off-site/regional protection

STEP 6 — AUTOMATION

Automate:

• execution
• naming
• timestamps
• retention
• uploads
• monitoring
• alerting

STEP 7 — MONITOR

Track:

• backup duration
• backup size
• errors
• storage consumption
• replication lag
• source resource impact

STEP 8 — RESTORE PROCEDURE

Document exact steps.

STEP 9 — TEST

Restore into a controlled environment.

STEP 10 — PERIODIC DR EXERCISE

Test whether the complete organization—not merely the backup tool—can meet RPO and RTO.

A backup strategy is therefore an operational lifecycle, not a shell command.`,

      internalWorking: `Business requirements
        |
        v
Data characteristics
        |
        v
Backup method
        |
        v
Automation
        |
        v
Secure storage
        |
        v
Monitoring
        |
        v
Restore test
        |
        v
DR validation`,

      architecture: `                   PRODUCTION
                       |
                       v
                 BACKUP SOURCE
                       |
                       v
                BACKUP PROCESS
                       |
                       v
                 SECURE STORAGE
                  /           \
                 v             v
             retention      off-system
                 \             /
                  \           /
                       v
                  RESTORE TEST
                       |
                       v
                 RECOVERY PLAN`,

      examples: [
        `Small environment:

nightly logical backup + periodic restore tests.`,

        `Large environment:

storage snapshots plus continuous change capture where RPO requires it.`,

        `Critical production:

backup copies protected independently from normal database administrator credentials where possible.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Useful when backup or PITR design depends on understanding oplog history.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Useful when selecting a Secondary as a backup source.'
        },
        {
          command:
            'mongodump --version && mongorestore --version',
          explanation:
            'Records Database Tools versions used in logical backup and restore workflows.'
        }
      ],

      productionScenario: `A 2 TB MongoDB production environment has:

RPO:
15 minutes

RTO:
3 hours

Retention:
30 days.

A daily mongodump alone cannot meet the RPO.

The DBA designs a system combining an appropriate full-backup method with continuous change capture/PITR capabilities.

Backups are copied to independent encrypted storage.

Every month a recovery test restores production-like data and records:

• recoverable timestamp
• restore duration
• validation result.

This gives the organization evidence that the recovery design actually works.`,

      troubleshootingApproach: `Backup-strategy review:

1. Confirm RPO.

2. Confirm RTO.

3. Confirm retention.

4. Measure dataset size.

5. Measure growth.

6. Measure write rate.

7. Check oplog window.

8. Choose backup method.

9. Choose backup source.

10. Protect credentials.

11. Choose independent storage.

12. Automate backups.

13. Monitor failures.

14. Monitor source impact.

15. Test restore.

16. Validate data.

17. Measure recovery time.

18. Perform periodic DR drills.

19. Review design as the dataset grows.`,

      commonMistakes: [
        'Starting with mongodump before defining requirements.',
        'Keeping backups in the same failure domain.',
        'Ignoring retention/storage growth.',
        'Not monitoring failed backup jobs.',
        'Never performing end-to-end DR tests.'
      ],

      bestPractices: [
        'Design from RPO and RTO.',
        'Use independent secure backup storage.',
        'Automate and monitor everything.',
        'Test restores regularly.',
        'Review backup architecture as data size and workload change.'
      ],

      interviewAnswer: `I design MongoDB backups from business RPO, RTO, retention, security, and disaster scenarios. Then I measure dataset size, growth, write rate, oplog window, network, and storage capacity before choosing between logical backup, snapshots, managed backup, or PITR.

I automate backup execution and retention, store copies independently, monitor backup impact and failures, and regularly perform real restores to prove both data recoverability and RTO.`,

      keyTakeaways: [
        'Backup strategy starts with business requirements.',
        'Method depends on data size and RPO/RTO.',
        'Backup storage must be protected independently.',
        'Automation and monitoring are mandatory.',
        'Restore testing completes the backup lifecycle.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 11,
    question:
      'How would you design a backup and restore strategy for a multi-terabyte MongoDB deployment where mongodump takes too long to satisfy the business RTO?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `For a multi-terabyte MongoDB deployment, logical backup and restore may become too slow.

The problem is often not:

"Can mongodump create a backup?"

The real question is:

"Can the complete recovery process meet the required RTO?"

For very large datasets, storage snapshots, managed continuous backup, or other physical backup approaches may be more suitable.`,

      coreConcept: `Large database

10 TB+
   |
   v
Logical restore takes many hours
   |
   v
RTO violated
   |
   v
Evaluate:

• storage snapshots
• continuous backup
• PITR
• pre-provisioned recovery infrastructure
• faster storage/network
• automation`,

      detailedExplanation: `Consider:

Dataset:
12 TB

Business RTO:
2 hours

Tested mongorestore time:
14 hours

The logical backup is valid, but the recovery architecture does not satisfy the business requirement.

A DBA should evaluate several layers.

1. BACKUP METHOD

Logical backup may be appropriate for granular recovery, but not necessarily for full-cluster DR at this scale.

Physical snapshots can often capture large volumes much faster.

2. RESTORE INFRASTRUCTURE

Recovery speed depends on:

• storage throughput
• disk IOPS
• CPU
• network
• target host capacity
• index recreation
• replication setup

3. RECOVERY ARCHITECTURE

A fast recovery design may include:

• pre-created infrastructure
• automated volume attachment
• tested startup procedures
• automated replica-set reconfiguration
• application cutover automation

4. RPO

Fast recovery alone does not guarantee a sufficiently recent recovery point.

The system may need:

snapshot
+
continuous oplog/PITR capture.

5. VALIDATION

Recovery must include:

• database startup
• replication health
• data validation
• application smoke testing

Therefore a multi-terabyte backup design often becomes a DR architecture rather than simply a backup command.`,

      internalWorking: `Large production cluster
        |
        v
Full logical backup
        |
        v
Logical restore too slow
        |
        v
Evaluate physical recovery
        |
        +--> snapshots
        +--> continuous changes
        +--> automation
        +--> pre-sized target
        |
        v
Meet RPO + RTO`,

      architecture: `                PRODUCTION
                     |
           +---------+---------+
           |                   |
           v                   v
        Snapshot            PITR/change
        recovery             capture
           |                   |
           +---------+---------+
                     |
                     v
             RECOVERY ENVIRONMENT
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Storage    MongoDB     Validation
       restore     startup
                     |
                     v
                Application`,

      examples: [
        `10 TB database with 1-hour RTO may require physical restore rather than full logical reconstruction.`,
        `A daily snapshot alone may not satisfy a 5-minute RPO.`,
        `Recovery automation can materially reduce RTO even when the backup technology is unchanged.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Useful for evaluating available oplog history when continuous recovery or catch-up design depends on oplog retention.'
        }
      ],

      productionScenario: `A 15 TB MongoDB deployment has:

RPO:
15 minutes

RTO:
90 minutes.

A full mongorestore test takes 18 hours.

The DBA designs:

• frequent storage snapshots
• continuous change capture
• automated volume provisioning
• documented replica-set recovery
• pre-tested application cutover.

Quarterly DR tests prove recovery can complete within the required window.`,

      troubleshootingApproach: `1. Measure total data size.

2. Measure logical restore throughput.

3. Compare restore time against RTO.

4. Measure snapshot restore/provisioning time.

5. Evaluate RPO requirements.

6. Determine whether PITR is required.

7. Check recovery storage throughput.

8. Check recovery compute capacity.

9. Automate infrastructure creation.

10. Automate MongoDB startup/configuration.

11. Test application cutover.

12. Run full-scale DR exercise.

13. Record actual RPO and RTO.

14. Redesign if either target is missed.`,

      commonMistakes: [
        'Assuming a valid backup automatically satisfies RTO.',
        'Using mongodump for huge DR recovery without timing it.',
        'Ignoring infrastructure provisioning time.',
        'Ignoring index restore/rebuild duration.',
        'Testing only a small subset instead of production-scale recovery.'
      ],

      bestPractices: [
        'Choose backup method based on recovery requirements.',
        'Benchmark at realistic data scale.',
        'Automate recovery infrastructure.',
        'Combine fast base recovery with PITR when required.',
        'Run periodic full DR exercises.'
      ],

      interviewAnswer: `For a multi-terabyte MongoDB environment, I first measure actual logical restore time against the RTO. If mongorestore cannot meet the requirement, I evaluate storage-level snapshots or managed physical backup combined with continuous change capture for the required RPO.

I also include infrastructure provisioning, MongoDB startup, replica-set recovery, validation, and application cutover in the measured RTO.`,

      keyTakeaways: [
        'Large-scale backup design is driven by recovery time.',
        'Logical backup may not meet multi-TB RTO.',
        'Physical snapshots can improve recovery speed.',
        'RPO may still require continuous change capture.',
        'Full recovery testing is mandatory.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 12,
    question:
      'How do namespace include, exclude, and namespace mapping options help with selective MongoDB backup and restore operations?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `A logical backup or restore does not always need to include every database and collection.

MongoDB Database Tools support namespace filtering and mapping capabilities.

A namespace means:

database.collection

Example:

sales.orders`,

      coreConcept: `Backup contains:

sales.orders
sales.users
sales.audit
inventory.products

Need only:

sales.orders

or restore as:

recovery.orders_restore

Namespace filtering/mapping allows
granular control.`,

      detailedExplanation: `Common use cases include:

1. BACK UP ONLY SPECIFIC COLLECTIONS

For example:

sales.orders
sales.customers

2. EXCLUDE LARGE OR UNNEEDED COLLECTIONS

Example:

audit.logs

3. RESTORE INTO ANOTHER DATABASE

Example:

production.orders

into:

recovery.orders

4. RESTORE MULTIPLE NAMESPACES USING PATTERNS

Database Tools provide namespace include/exclude and namespace mapping options for archive/dump workflows.

Conceptually:

--nsInclude

limits included namespaces.

--nsExclude

excludes matching namespaces.

During restore:

--nsFrom
and
--nsTo

can map one namespace pattern to another.

Example concept:

source:
prod.orders

target:
recovery.orders

This is particularly useful for recovery analysis because data can be restored into an isolated namespace without destroying current production data.

The exact wildcard and namespace-mapping syntax should be verified against the installed Database Tools version.`,

      internalWorking: `Backup namespaces:

prod.orders
prod.users
prod.audit

Filter:
prod.orders

       |
       v

Backup only:
prod.orders


Restore mapping:

prod.orders
     |
     v
recovery.orders`,

      architecture: `              LOGICAL BACKUP
                    |
            namespace filters
             /            \
            v              v
        include          exclude
            \              /
             \            /
                selected
               namespaces
                    |
                    v
            namespace mapping
                    |
                    v
             target database`,

      examples: [
        `Backup only selected namespaces using supported nsInclude options.`,
        `Restore production data into a recovery database before reconciling it.`,
        `Exclude disposable audit collections when the recovery requirement permits it.`
      ],

      commands: [
        {
          command:
            'mongodump --uri="<URI>" --archive=/backup/prod.archive --nsInclude="prod.orders"',
          explanation:
            'Illustrates selecting a specific namespace for logical backup.'
        },
        {
          command:
            'mongorestore --uri="<TARGET_URI>" --archive=/backup/prod.archive --nsFrom="prod.*" --nsTo="recovery.*"',
          explanation:
            'Illustrates namespace mapping during restore. Verify pattern syntax against the Database Tools version in use.'
        }
      ],

      productionScenario: `Only the orders collection was corrupted.

The current production users and inventory data are healthy.

Instead of restoring the entire database with --drop, the DBA restores:

prod.orders

into:

recovery.orders

The recovered data is compared against current production data and only the required records are reconciled.

This significantly reduces recovery risk.`,

      troubleshootingApproach: `1. Identify exact recovery scope.

2. List source namespaces.

3. Identify include/exclude requirements.

4. Verify backup contains required namespace.

5. Decide target namespace.

6. Verify namespace mapping syntax.

7. Restore into isolated namespace.

8. Validate document counts.

9. Validate indexes.

10. Reconcile with production using an approved process.`,

      commonMistakes: [
        'Restoring an entire database when one collection is required.',
        'Using --drop broadly for selective recovery.',
        'Mapping namespaces incorrectly.',
        'Assuming wildcard syntax without checking tool version.',
        'Forgetting index/metadata validation after selective restore.'
      ],

      bestPractices: [
        'Use the smallest recovery scope that satisfies the incident.',
        'Restore into isolated namespaces first where practical.',
        'Validate namespace mappings before production execution.',
        'Keep restore commands in documented runbooks.',
        'Verify restored metadata and indexes.'
      ],

      interviewAnswer: `Namespace filtering lets mongodump or mongorestore include or exclude selected database.collection namespaces, while namespace mapping can restore a source namespace under a different database or collection name.

I commonly use this for safe recovery by restoring affected production data into an isolated recovery namespace first, validating it, and then reconciling only what is required.`,

      keyTakeaways: [
        'Namespaces are database.collection identifiers.',
        'Selective restore reduces recovery scope.',
        'Namespace mapping supports isolated recovery.',
        'Exact syntax is tools-version dependent.',
        'Granular recovery is often safer than full replacement.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 13,
    question:
      'Why can index creation make mongorestore slow, and how would you troubleshoot restore performance when data loads quickly but indexes take hours?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `A restore has two major types of work:

1. Restore documents.
2. Recreate indexes.

For large collections, index creation can consume more time than inserting the BSON data itself.`,

      coreConcept: `mongorestore

Data phase
   |
   v
documents inserted
   |
   v
Index build phase
   |
   +--> scan data
   +--> sort keys
   +--> write index pages
   +--> consume CPU
   +--> consume disk I/O
   |
   v
restore complete`,

      detailedExplanation: `Suppose a collection contains:

500 million documents

and:

12 secondary indexes.

Loading documents may proceed at high throughput.

Afterward MongoDB must construct the indexes.

Index construction requires work such as:

• reading collection data
• extracting index keys
• sorting/building structures
• writing index data
• handling multikey entries
• checking uniqueness where applicable

This can produce:

• high CPU
• high disk throughput
• high disk latency
• cache pressure
• temporary storage usage

Restore performance therefore depends not just on:

BSON size.

It also depends on:

• number of indexes
• index key size
• collection size
• document structure
• hardware
• uniqueness
• multikey behavior
• concurrent restore activity

A DBA should compare:

data restore duration

versus:

index build duration.

If the RTO is dominated by indexes, possible architecture decisions may include:

• faster recovery hardware
• reducing redundant indexes before backup/design
• restoring only required namespaces
• alternative physical backup strategy for full DR.

Do not drop necessary production indexes merely to make recovery faster without understanding application impact.`,

      internalWorking: `Restore:

100 GB BSON
   |
   v
Data load = 1 hour

Then:

10 indexes
   |
   v
Index construction = 5 hours

Total RTO:
6 hours

Index phase is real recovery cost.`,

      architecture: `             RESTORE TARGET
                  |
          +-------+-------+
          |               |
          v               v
      documents        indexes
          |               |
          v               v
      data writes    scans/sorts/writes
                          |
                          v
                     heavy CPU/I/O`,

      examples: [
        `A collection with only _id index may restore much faster than one with 20 large secondary indexes.`,
        `Unique index creation can fail if restored data violates uniqueness.`,
        `Multikey indexes can generate many index entries per document.`
      ],

      commands: [
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Lists indexes so the DBA can compare expected index inventory with restore behavior.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect active long-running operations during troubleshooting, depending on privileges and MongoDB version.'
        }
      ],

      productionScenario: `A 1 TB restore loads BSON in two hours.

The team expects recovery to finish shortly.

Instead, index creation runs for another seven hours.

Investigation finds:

• 18 indexes
• several large compound indexes
• high target disk latency.

The recovery architecture is adjusted with faster storage and index cleanup during normal design reviews.

Future DR tests include index-build duration explicitly.`,

      troubleshootingApproach: `1. Separate data-load and index-build times.

2. List expected indexes.

3. Identify largest collections.

4. Check target CPU.

5. Check disk latency.

6. Check disk throughput.

7. Check free disk.

8. Check unique-index failures.

9. Check multikey-heavy indexes.

10. Check concurrent restore activity.

11. Compare recovery hardware with production.

12. Measure total end-to-end RTO.`,

      commonMistakes: [
        'Measuring only BSON import time.',
        'Assuming indexes are negligible.',
        'Dropping required indexes permanently for speed.',
        'Ignoring uniqueness failures.',
        'Testing restores on much faster hardware than the actual DR environment without documenting the difference.'
      ],

      bestPractices: [
        'Include index build time in RTO.',
        'Remove genuinely redundant indexes from normal schema design.',
        'Use appropriately sized recovery hardware.',
        'Monitor storage latency during restore.',
        'Validate all indexes after recovery.'
      ],

      interviewAnswer: `mongorestore performance can be dominated by index creation. MongoDB may need to scan restored data, generate and sort index keys, write index structures, and validate unique constraints.

I separate document-load time from index-build time and correlate the index phase with CPU, disk latency, throughput, index count, multikey behavior, and collection size. Index build time must be included in the real RTO.`,

      keyTakeaways: [
        'Restore is not only document loading.',
        'Index builds can dominate RTO.',
        'Disk and CPU strongly affect index creation.',
        'Unique and multikey indexes can add complexity.',
        'DR tests must measure complete restore time.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 14,
    question:
      'A mongorestore fails partway through with duplicate-key, BSON, network, or batch-related errors. How would you determine whether the restore is safely resumable or must be restarted?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `A partial restore must be handled carefully.

mongorestore may already have successfully inserted some documents before the failure.

Simply rerunning the same command can therefore create:

• duplicate-key errors
• partially restored namespaces
• uncertain validation state.

The DBA must first determine exactly what completed.`,

      coreConcept: `Restore starts
    |
    v
50% data inserted
    |
    X
failure
    |
    v
Do NOT blindly rerun

First:
• inspect logs
• identify affected namespace
• identify inserted data
• understand restore options
• decide cleanup/resume strategy`,

      detailedExplanation: `Common failure categories include:

1. DUPLICATE KEY

Potential causes:

• target already contained data
• previous partial restore
• unique-index conflict
• duplicate data in source/target combination

2. BSON / BACKUP CORRUPTION

Possible causes:

• incomplete backup file
• storage corruption
• wrong file
• incompatible handling

3. NETWORK FAILURE

The target may become unreachable temporarily.

4. AUTHENTICATION/TLS FAILURE

Credentials or certificates may fail after reconnect.

5. SERVER RESOURCE FAILURE

Examples:

• disk full
• out-of-memory pressure
• target restart

6. BATCH / DATABASE TOOLS ISSUES

Tool bugs or compatibility problems can appear only at particular data sizes or batches.

The DBA should preserve:

• exact mongorestore version
• MongoDB server version
• command options
• full restore log
• failure percentage/namespace
• target collection counts.

Then decide whether to:

A. CLEAN THE AFFECTED TARGET AND RESTART

Often the safest option when the restore is intended to fully replace the target.

B. RESUME AT SELECTED NAMESPACE LEVEL

Possible when the completed namespace boundaries are clearly known and the restore design supports selective execution.

C. RESTORE INTO A CLEAN NEW TARGET

Often safer when the current partial state is uncertain.

The decision depends on recovery objective, not merely convenience.`,

      internalWorking: `Restore:

DB1.collectionA = complete
DB1.collectionB = 60%
DB1.collectionC = not started

Failure
   |
   v
Need exact state
   |
   +--> clean B and continue carefully?
   |
   +--> restart complete DB?
   |
   +--> restore into clean target?

Depends on recovery plan.`,

      architecture: `               RESTORE FAILURE
                     |
          +----------+----------+
          |          |          |
          v          v          v
        logs       target      tools
                  state      versions
          \          |          /
           \         |         /
                root cause
                     |
                     v
             recovery decision`,

      examples: [
        `A restore failing at 64% may already have written millions of documents.`,
        `A rerun without cleanup can generate large numbers of duplicate _id errors.`,
        `Restoring into a fresh isolated environment can be safer than trying to reason about an uncertain partial state.`
      ],

      commands: [
        {
          command:
            'mongorestore --version',
          explanation:
            'Records the exact Database Tools version involved in the failure.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Records the MongoDB server version for compatibility analysis.'
        },
        {
          command:
            'db.collection.countDocuments({})',
          explanation:
            'Can help determine how much data exists in an affected target collection, though counts alone do not prove restore completeness.'
        }
      ],

      productionScenario: `A 3 TB restore repeatedly fails around the same point.

The DBA records:

• server version
• mongorestore version
• exact namespace
• exact error
• restore percentage.

The failure reproduces consistently with one Database Tools version.

After reviewing compatibility and known behavior, the tool version is corrected and the restore is repeated into a clean target.

The DBA does not continue layering retries onto a partially restored production namespace.`,

      troubleshootingApproach: `1. Stop blind retries.

2. Preserve full restore log.

3. Record mongorestore version.

4. Record MongoDB version.

5. Record failure namespace.

6. Record percentage/timestamp.

7. Check target disk.

8. Check target server logs.

9. Check network.

10. Check duplicate-key details.

11. Check backup file integrity.

12. Check tool/server compatibility.

13. Determine target partial state.

14. Decide clean restart vs controlled selective continuation.

15. Restore again.

16. Validate full dataset and indexes.`,

      commonMistakes: [
        'Blindly rerunning after partial failure.',
        'Ignoring duplicate-key errors.',
        'Changing multiple variables at once.',
        'Assuming failure percentage identifies exact recovery state.',
        'Treating a partially restored database as production-ready.'
      ],

      bestPractices: [
        'Capture complete restore logs.',
        'Record exact tool/server versions.',
        'Prefer clean deterministic restore states.',
        'Validate backup integrity.',
        'Reproduce persistent restore failures methodically.'
      ],

      interviewAnswer: `When mongorestore fails partway through, I first determine what was already written and preserve the exact error, namespace, tool version, server version, and logs.

I classify whether the issue is duplicate data, backup corruption, network, resource exhaustion, or a tool/version problem. If the target state is uncertain, I prefer restoring into a clean target rather than blindly rerunning and creating duplicate or mixed data.`,

      keyTakeaways: [
        'Partial restore means partial target state.',
        'Blind reruns can create duplicate conflicts.',
        'Exact versions and logs are essential.',
        'Clean restart is often safer when state is uncertain.',
        'Completion must be followed by full validation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 15,
    question:
      'How should a DBA handle MongoDB Database Tools version compatibility for mongodump and mongorestore during backup, restore, migration, and upgrade activities?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `mongodump and mongorestore are distributed as MongoDB Database Tools.

Their version is separate from the MongoDB server version.

Example:

MongoDB server:
7.x

Database Tools:
100.x

The DBA should record and validate both.`,

      coreConcept: `Backup/restore compatibility depends on:

Source server version
       +
mongodump tools version
       +
dump format/options
       +
mongorestore tools version
       +
target server version

All must be validated.`,

      detailedExplanation: `A common production mistake is to assume:

"If mongodump connected successfully, every future mongorestore version will behave identically."

Database Tools evolve independently.

Changes can include:

• bug fixes
• new options
• archive behavior
• namespace behavior
• performance improvements
• compatibility changes.

For migration:

Source MongoDB version

may differ from:

Target MongoDB version.

The DBA should verify whether the selected Database Tools version supports the required source and target versions and workflow.

A safe process includes:

1. RECORD SOURCE SERVER VERSION

2. RECORD TARGET SERVER VERSION

3. RECORD MONGODUMP VERSION

4. RECORD MONGORESTORE VERSION

5. REVIEW COMPATIBILITY DOCUMENTATION

6. TEST USING REPRESENTATIVE DATA

7. TEST FULL RESTORE BEFORE PRODUCTION CUTOVER

A restore bug can appear only at very large sizes or specific document patterns.

Therefore testing a tiny 10 MB sample does not prove a 3 TB restore will succeed.

For critical migrations, keep:

• commands
• tool binaries/version details
• checksums where appropriate
• logs
• timing
• validation results

as part of the runbook.`,

      internalWorking: `Source
MongoDB 7.x
    |
    v
mongodump
Tools 100.x
    |
    v
backup
    |
    v
mongorestore
Tools 100.y
    |
    v
Target
MongoDB 8.x

Compatibility must be verified
across the complete path.`,

      architecture: `             SOURCE SERVER
                    |
                    v
             mongodump tool
                    |
                    v
                BACKUP
                    |
                    v
            mongorestore tool
                    |
                    v
             TARGET SERVER

Record version at every stage.`,

      examples: [
        `Check:

mongodump --version`,

        `Check:

mongorestore --version`,

        `Check server:

db.version()`
      ],

      commands: [
        {
          command:
            'mongodump --version',
          explanation:
            'Records the dump utility version.'
        },
        {
          command:
            'mongorestore --version',
          explanation:
            'Records the restore utility version.'
        },
        {
          command:
            'mongosh --quiet --eval "db.version()"',
          explanation:
            'Can be used against an authenticated/appropriate connection context to record server version.'
        }
      ],

      productionScenario: `A backup was created with one Database Tools release and restore repeatedly fails at a large batch boundary with another release.

The DBA verifies the exact tool versions instead of assuming the operating system is the cause.

A later Database Tools release contains a relevant fix.

The corrected tool is tested with the same backup in a clean environment before the production migration continues.`,

      troubleshootingApproach: `1. Record source MongoDB version.

2. Record target MongoDB version.

3. Record mongodump version.

4. Record mongorestore version.

5. Record OS/architecture where relevant.

6. Capture exact error.

7. Check official compatibility/release notes.

8. Reproduce using same backup.

9. Change one variable at a time.

10. Test corrected tools.

11. Validate restored data.

12. Update runbook with known-good versions.`,

      commonMistakes: [
        'Assuming server and Database Tools versions are the same.',
        'Changing OS, tools, and commands simultaneously.',
        'Testing only tiny datasets.',
        'Ignoring release-note bug fixes.',
        'Not recording the exact utility version used for backup.'
      ],

      bestPractices: [
        'Record Database Tools versions with every critical backup.',
        'Use supported, tested combinations.',
        'Test full-size restores before major migrations.',
        'Keep tool-version evidence in runbooks.',
        'Change one variable at a time during troubleshooting.'
      ],

      interviewAnswer: `MongoDB Database Tools are versioned separately from the database server. For critical backup or migration work I record the source server, target server, mongodump, and mongorestore versions and validate the supported combination.

If a restore fails consistently, I include tool-version compatibility and known tool bugs in the investigation rather than assuming the server or OS is the cause.`,

      keyTakeaways: [
        'Database Tools have independent versions.',
        'Source and target server versions both matter.',
        'Compatibility must be tested.',
        'Large-scale bugs may not appear in small tests.',
        'Known-good tool versions should be documented.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 16,
    question:
      'A nightly MongoDB backup is causing production latency, high disk reads, cache pressure, and replication lag. How would you troubleshoot and reduce backup impact?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `A backup is a read-intensive workload.

If it runs against a busy MongoDB member, it can compete with the application for:

• disk
• memory/cache
• CPU
• network.

The DBA must determine exactly where the backup pressure originates.`,

      coreConcept: `Backup begins
    |
    v
Large collection scans
    |
    +--> disk reads
    +--> cache eviction
    +--> CPU
    +--> network
    |
    v
Database workload affected
    |
    v
latency / lag`,

      detailedExplanation: `Suppose nightly at 01:00:

• mongodump starts
• disk read throughput jumps
• WiredTiger cache churn increases
• application latency rises
• Secondary lag increases.

The DBA should first identify the backup source.

CASE 1 — BACKUP ON PRIMARY

Heavy reads may directly compete with production writes and reads.

Possible mitigation:

use a suitable dedicated Secondary.

CASE 2 — BACKUP ON SECONDARY

The backup can still saturate that member's disk.

If the Secondary cannot apply oplog quickly enough:

replication lag increases.

If it falls near the oplog-window limit, the backup creates a resilience risk.

Other possible causes:

• gzip CPU consumption
• backup destination network bottleneck
• backup storage on same disk as dbPath
• multiple backups running simultaneously
• large read tickets/connection pressure
• slow backup target causing prolonged dump duration.

The solution may include:

• dedicated hidden Secondary
• faster backup disk/network
• schedule adjustment
• compression tuning
• backup throttling where supported by the environment
• snapshot-based backup instead of full logical scans
• increased hardware capacity.

Do not simply renice or kill MongoDB processes without understanding the backup architecture.`,

      internalWorking: `Backup
  |
  v
Read large dataset
  |
  +--> storage pressure
  +--> cache churn
  +--> CPU
  +--> network
  |
  v
Secondary applies oplog slower
  |
  v
replication lag
  |
  v
reduced HA margin`,

      architecture: `             PRODUCTION PRIMARY
                     |
                replication
                     |
                     v
              BACKUP SECONDARY
                 /    |    \
                v     v     v
              disk   CPU   cache
                \     |     /
                 \    |    /
                  backup job
                     |
                     v
              backup storage`,

      examples: [
        `Backup source and backup destination can both become bottlenecks.`,
        `Compression may reduce network but increase CPU.`,
        `Backup-induced Secondary lag must be compared with oplog window.`
      ],

      commands: [
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a quick lag view during backup.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps compare backup-induced lag with oplog history.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Useful for correlating MongoDB server metrics with backup activity.'
        }
      ],

      productionScenario: `Every night at 02:00, a mongodump on a Secondary causes:

lag:
0 minutes -> 45 minutes

oplog window:
3 hours

disk latency:
10 ms -> 120 ms.

The member catches up eventually, but the risk margin is too small.

The DBA moves backup to better hardware, increases oplog headroom, and evaluates snapshot backup to reduce large logical scans.

After changes, the backup member remains within a safe lag window.`,

      troubleshootingApproach: `1. Confirm backup start/end time.

2. Identify source member.

3. Measure application latency.

4. Measure source disk read latency.

5. Measure CPU.

6. Measure cache pressure.

7. Measure network.

8. Measure replication lag.

9. Compare lag to oplog window.

10. Check compression overhead.

11. Check backup destination speed.

12. Check for overlapping jobs.

13. Evaluate dedicated backup Secondary.

14. Evaluate snapshot-based method.

15. Retest under production-like load.`,

      commonMistakes: [
        'Assuming backups have zero performance cost.',
        'Running heavy backup on Primary during peak traffic.',
        'Ignoring backup Secondary lag.',
        'Ignoring cache churn.',
        'Moving the job without measuring the new bottleneck.'
      ],

      bestPractices: [
        'Monitor backup impact explicitly.',
        'Use dedicated backup capacity where justified.',
        'Maintain oplog safety margin.',
        'Schedule and benchmark backup windows.',
        'Choose backup technology appropriate to data scale.'
      ],

      interviewAnswer: `For backup-induced latency, I correlate the backup timeline with disk reads, cache pressure, CPU, network, and replication lag on the source member.

If the Primary is affected, I consider a healthy dedicated Secondary. If a Secondary is lagging, I compare that lag with the oplog window and investigate disk, cache, compression, and backup-target throughput. For very large environments I may move from repeated logical scans to a snapshot or managed backup design.`,

      keyTakeaways: [
        'Backups are production workloads.',
        'Disk and cache are common bottlenecks.',
        'Secondary backups can still threaten replication health.',
        'Oplog window defines safety margin.',
        'Backup architecture should scale with dataset size.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 17,
    question:
      'How would you restore a full MongoDB backup into a new replica set, and why should you normally restore data before building out the final replica-set topology?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `When rebuilding a replica set from backup, a common safe approach is:

1. Restore the data onto one MongoDB node.
2. Validate the data.
3. Initialize or configure the replica set.
4. Add additional members.
5. Allow them to initial sync.

The exact sequence depends on backup type and recovery architecture.`,

      coreConcept: `Backup
  |
  v
Restore to one clean target
  |
  v
Validate data
  |
  v
Configure replica set
  |
  v
Add Secondaries
  |
  v
Initial sync
  |
  v
Healthy replica set`,

      detailedExplanation: `For a logical backup, the target MongoDB server receives documents through mongorestore.

It is generally unnecessary to restore the same logical backup independently into every future replica-set member.

Instead:

Node A
receives restored dataset.

Then the replica set is configured.

Nodes B and C can obtain the dataset using MongoDB replication/initial sync.

Benefits include:

• one authoritative restore operation
• simpler validation
• avoids repeated large restore operations
• replication creates consistent Secondary copies.

Important considerations:

1. LOCAL DATABASE

Replica-set internal state lives in the local database.

Do not casually restore old local replica-set metadata as though it were application data.

2. REPLICA-SET CONFIG

Configure the new topology intentionally.

3. SECURITY

Authentication/TLS must be established correctly.

4. APPLICATION USERS

Restore user/role data according to the backup scope and recovery plan.

5. INDEXES

Validate all indexes before production use.

6. APPLICATION CUTOVER

Do not point applications at the cluster until:

• Primary exists
• Secondaries are healthy
• replication lag is normal
• data validation passes.

Physical snapshot recovery may follow a different documented pattern because the restored files may already represent a member's physical database state.

Always use the procedure appropriate to the backup type.`,

      internalWorking: `Backup
 |
 v
Node A
restored
 |
 v
validate
 |
 v
rs.initiate()
 |
 +--> add B
 |
 +--> add C
 |
 v
B/C initial sync
 |
 v
3-node replica set`,

      architecture: `                 RESTORED NODE A
                         |
                      PRIMARY
                    /         \
                   v           v
             SECONDARY B   SECONDARY C
                   ^           ^
                   |           |
              initial sync   initial sync`,

      examples: [
        `Logical restore into one clean target can be followed by replica-set initialization.`,
        `Additional members can obtain data through initial sync.`,
        `Do not automatically restore old local database contents into a new topology.`
      ],

      commands: [
        {
          command:
            'mongorestore --uri="<TARGET_URI>" /backup/dump',
          explanation:
            'Restores the logical backup onto the chosen target member.'
        },
        {
          command:
            'rs.initiate()',
          explanation:
            'Initializes the replica set when appropriate after restoration and configuration.'
        },
        {
          command:
            'rs.add("mongo2:27017")',
          explanation:
            'Adds an additional member after the restored Primary is healthy and the target topology is ready.'
        }
      ],

      productionScenario: `A disaster destroys a three-member replica set.

The latest validated backup is restored to a new server.

The DBA validates:

• expected databases
• collection counts
• indexes
• application data.

Then a new replica set is initialized.

Two additional members are added and complete initial sync.

Only after all members are healthy does the application connection string move to the recovered cluster.`,

      troubleshootingApproach: `1. Provision clean recovery server.

2. Install compatible MongoDB version.

3. Configure storage/security.

4. Restore backup.

5. Review restore logs.

6. Validate collections.

7. Validate indexes.

8. Validate users/roles.

9. Configure replica-set identity/topology.

10. Initialize replica set.

11. Add one Secondary at a time.

12. Monitor initial sync.

13. Check oplog window.

14. Verify healthy Primary/Secondaries.

15. Run application validation.

16. Perform controlled cutover.`,

      commonMistakes: [
        'Restoring the same dump independently onto every member.',
        'Restoring old local database metadata blindly.',
        'Adding all nodes before validating the restored data.',
        'Cutting application traffic over before Secondaries are healthy.',
        'Ignoring security configuration during DR.'
      ],

      bestPractices: [
        'Create one validated authoritative restored node first.',
        'Build replica-set redundancy afterward.',
        'Validate before application cutover.',
        'Monitor initial sync.',
        'Use documented procedures appropriate to the backup type.'
      ],

      interviewAnswer: `For a logical full-cluster recovery, I normally restore the dataset to one clean MongoDB node, validate data and indexes, initialize the intended replica set, and then add Secondaries so they initial-sync from the restored Primary.

This avoids independently restoring multiple copies and gives me one validated authoritative recovery state before rebuilding HA.`,

      keyTakeaways: [
        'Restore one authoritative copy first.',
        'Validate before building redundancy.',
        'Secondaries can initial-sync afterward.',
        'Do not blindly restore old local replica metadata.',
        'Cut over applications only after full health validation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 18,
    question:
      'A MongoDB backup completed successfully, but during a disaster the restore is much slower than expected. How would you perform an L3 restore-performance investigation?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `A slow restore is an RTO incident.

The DBA should identify which stage is slow:

• reading backup
• network transfer
• document insertion
• index creation
• storage writes
• replication
• validation.

Do not simply conclude:

"mongorestore is slow."`,

      coreConcept: `Restore path:

Backup storage
      |
      v
Network/read
      |
      v
mongorestore
      |
      v
MongoDB writes
      |
      v
Indexes
      |
      v
Replica-set rebuild
      |
      v
Validation

Find the slowest stage.`,

      detailedExplanation: `Suppose expected restore time:

3 hours

Actual:
11 hours.

The DBA should break recovery into components.

1. BACKUP READ SPEED

Is backup storage slow?

Object storage download may be the bottleneck.

2. NETWORK

Is the restore host receiving data fast enough?

3. COMPRESSION

gzip may be CPU-bound.

4. TARGET CPU

BSON decoding and index creation require CPU.

5. TARGET STORAGE

High disk latency can severely reduce insert and index throughput.

6. INDEX CREATION

The data may restore quickly but index creation may dominate.

7. PARALLELISM

Database Tools options and workload characteristics influence restore concurrency.

Too little parallelism can underutilize hardware.

Too much can overload storage.

8. SERVER CONFIGURATION

Resource constraints may differ from production.

9. REPLICA-SET REBUILD

If DR timing includes adding Secondaries and initial sync, that also counts toward complete RTO.

10. VALIDATION

Business validation must be included.

A strong DBA has restore benchmarks before the disaster.

During the incident, compare current metrics against those benchmarks.`,

      internalWorking: `Expected throughput:
500 MB/s

Actual:
80 MB/s

Check:

backup source
   |
network
   |
CPU
   |
decompression
   |
MongoDB
   |
disk
   |
indexes

Locate bottleneck.`,

      architecture: `           BACKUP STORAGE
                  |
                  v
               NETWORK
                  |
                  v
            RESTORE HOST
          +-------+-------+
          |               |
          v               v
         CPU             DISK
          |               |
          +-------+-------+
                  |
                  v
               MongoDB
                  |
                  v
               INDEXES`,

      examples: [
        `Backup download 50 MB/s can limit restore regardless of target disk speed.`,
        `CPU at 100% during gzip decompression suggests compression bottleneck.`,
        `Disk latency of 150 ms during index build can dominate recovery time.`
      ],

      commands: [
        {
          command:
            'time mongorestore --uri="<TARGET_URI>" /backup/dump',
          explanation:
            'A controlled test can measure total restore duration.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Useful for observing server behavior during restore.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect ongoing operations during long restore phases.'
        }
      ],

      productionScenario: `A 5 TB DR restore was expected to finish in six hours.

After four hours, only 25% is complete.

The DBA finds:

backup storage read throughput:
900 MB/s

network:
healthy

CPU:
45%

target disk latency:
180 ms

The restore environment was provisioned with slower storage than the tested DR environment.

The bottleneck is target storage, not mongorestore itself.`,

      troubleshootingApproach: `1. Record expected RTO.

2. Identify current restore phase.

3. Measure backup read throughput.

4. Measure network throughput.

5. Measure CPU.

6. Check decompression overhead.

7. Measure target disk latency.

8. Measure disk throughput/IOPS.

9. Identify index build phase.

10. Check server logs.

11. Check restore errors/retries.

12. Check target capacity.

13. Compare with previous restore benchmarks.

14. Correct the bottleneck.

15. Recalculate remaining recovery time.`,

      commonMistakes: [
        'Calling mongorestore the bottleneck without measurement.',
        'Ignoring backup storage speed.',
        'Ignoring decompression CPU.',
        'Ignoring index creation.',
        'Provisioning weaker DR storage than tested.'
      ],

      bestPractices: [
        'Benchmark full restores before disasters.',
        'Track stage-level recovery time.',
        'Provision recovery infrastructure intentionally.',
        'Include index and validation phases in RTO.',
        'Keep DR test results for comparison.'
      ],

      interviewAnswer: `For a slow restore, I break the path into backup read, network, decompression, BSON insertion, storage writes, index creation, replica-set rebuild, and validation.

I measure throughput and latency at each layer and compare them with previous DR benchmarks. The real bottleneck may be object storage, network, CPU, target disk, or index builds rather than mongorestore itself.`,

      keyTakeaways: [
        'Restore performance is a pipeline.',
        'RTO includes every recovery stage.',
        'Target storage is often critical.',
        'Index builds must be measured separately.',
        'Pre-disaster benchmarks are extremely valuable.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 19,
    question:
      'A backup is available, but document counts after restore do not match production expectations. How would you determine whether this indicates backup corruption, timing differences, filtering, or application writes?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `A document-count mismatch does not automatically mean the backup is corrupt.

Counts depend on:

• backup timestamp
• ongoing writes
• included namespaces
• filters
• deletions
• oplog replay
• restore errors
• target pre-existing data.

The DBA must reconstruct the expected recovery point.`,

      coreConcept: `Count mismatch
     |
     +--> wrong comparison time?
     +--> backup filter?
     +--> partial backup?
     +--> restore errors?
     +--> oplog replay?
     +--> duplicate keys?
     +--> application writes?
     |
     v
Determine expected state first`,

      detailedExplanation: `Example:

Production count today:
105 million

Backup timestamp:
yesterday 23:00

Backup count:
100 million

The 5 million difference may simply represent legitimate writes after the backup.

Another example:

mongodump used:

--query

or:

namespace filtering.

Then the dump intentionally contains only a subset.

Possible reasons for count mismatch include:

1. RECOVERY-POINT DIFFERENCE

Compare restored data with the expected timestamp, not current production.

2. BACKUP FILTERING

Was --query or namespace selection used?

3. ONGOING WRITES DURING DUMP

Without an appropriate consistency strategy, logical backups can reflect activity over the backup interval.

4. OPLOG REPLAY

Was captured oplog actually replayed?

5. RESTORE ERRORS

Duplicate keys or failed batches can reduce restored count.

6. TARGET PRE-EXISTING DATA

Counts can also be higher than expected.

7. BACKUP DAMAGE

Missing or truncated BSON files are possible.

A DBA should use more than counts.

Validation may include:

• minimum/maximum timestamps
• business-key samples
• hashes/checksums where appropriate
• index validation
• application-level reconciliation.

Document count is evidence, not the entire validation model.`,

      internalWorking: `Production at 12:00:
105M docs

Backup point:
10:00
100M docs

Restore:
100M docs

This can be correct.

Question is:

What should have existed
at the recovery point?`,

      architecture: `              RESTORED DATA
                    |
           validation comparison
                    |
          +---------+---------+
          |                   |
          v                   v
    recovery timestamp    backup scope
          |                   |
          v                   v
   expected records      included records
          \                   /
           \                 /
               actual gap`,

      examples: [
        `Current production count is usually the wrong reference for an older backup.`,
        `A selective --query dump intentionally produces fewer documents.`,
        `Duplicate-key restore errors can cause missing restored documents.`
      ],

      commands: [
        {
          command:
            'db.collection.countDocuments({})',
          explanation:
            'Provides a count, but the result must be compared with the expected recovery point.'
        },
        {
          command:
            'db.collection.find().sort({_id:1}).limit(5)',
          explanation:
            'Simple sampling can complement count validation, though business-specific validation is stronger.'
        }
      ],

      productionScenario: `A restored orders collection has:

98 million documents.

Current production has:

103 million.

The team claims five million records are missing.

The DBA checks the backup timestamp and finds the backup was taken before a large import of five million new orders.

The restore is correct for its recovery point.

The validation error came from comparing against the wrong timestamp.`,

      troubleshootingApproach: `1. Record backup start/end time.

2. Determine intended recovery point.

3. Identify dump filters/options.

4. Check namespace inclusion.

5. Check oplog capture/replay.

6. Review restore logs.

7. Check duplicate-key errors.

8. Check failed batches.

9. Check backup file sizes.

10. Compare expected count at recovery timestamp.

11. Validate key business records.

12. Validate indexes.

13. Determine whether discrepancy is expected or genuine.`,

      commonMistakes: [
        'Comparing an old backup directly with current production.',
        'Using document count as the only validation.',
        'Ignoring dump filters.',
        'Ignoring oplog replay.',
        'Ignoring restore warnings.'
      ],

      bestPractices: [
        'Validate against the intended recovery point.',
        'Store backup metadata and command options.',
        'Capture restore logs.',
        'Use business-level validation.',
        'Keep automated recovery validation where possible.'
      ],

      interviewAnswer: `If restored counts differ, I first determine the intended recovery timestamp and backup scope. I check whether filters, namespace selection, ongoing writes, oplog replay, duplicate-key errors, or partial restore failures explain the difference.

I compare the restore with the expected state at the recovery point rather than current production and validate business-critical records in addition to counts.`,

      keyTakeaways: [
        'Count mismatch does not automatically mean corruption.',
        'Recovery timestamp matters.',
        'Filters and oplog replay matter.',
        'Restore errors must be reviewed.',
        'Business validation is stronger than counts alone.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'backup_restore',
    topicId: 'backup-restore',
    topicNumber: 11,
    topicName: 'Backup & Restore',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 investigation and recovery for a MongoDB disaster where the primary cluster is unavailable, the latest full backup is several hours old, and the business requires minimal data loss and rapid recovery?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `A major MongoDB disaster requires two parallel objectives:

1. Restore service quickly.
2. Recover to the most recent safe point possible.

The DBA must combine:

• backup state
• available oplog/PITR data
• infrastructure readiness
• validation
• business RPO/RTO.`,

      coreConcept: `Disaster
   |
   v
Preserve evidence
   |
   v
Determine last good recovery point
   |
   +--> full backup
   +--> oplog/PITR
   |
   v
Build recovery environment
   |
   v
Restore base data
   |
   v
Apply incremental changes
   |
   v
Validate
   |
   v
Build HA
   |
   v
Application cutover`,

      detailedExplanation: `PHASE 1 — DECLARE RECOVERY OBJECTIVE

Determine:

• required RPO
• required RTO
• incident timestamp
• whether original cluster can still contribute any safe data.

PHASE 2 — IDENTIFY AVAILABLE RECOVERY MATERIAL

Inventory:

• latest full backup
• snapshot timestamp
• oplog archives
• continuous backup/PITR
• backup logs
• encryption keys
• config/security files.

PHASE 3 — CHOOSE RECOVERY POINT

Example:

Failure:
18:00

Full backup:
12:00

Continuous oplog available through:
17:58

Possible recovery point:
17:58

Without change capture, recovery may be limited to 12:00.

PHASE 4 — BUILD CLEAN RECOVERY ENVIRONMENT

Provision:

• supported MongoDB version
• adequate storage
• network
• TLS/authentication
• sufficient disk headroom.

PHASE 5 — RESTORE BASE

Restore:

full logical backup

or:

physical snapshot.

PHASE 6 — APPLY CHANGES

If supported PITR/oplog recovery data exists, replay through the selected recovery timestamp.

PHASE 7 — VALIDATE

Check:

• collections
• indexes
• users/roles
• critical transactions
• business data
• restore logs.

PHASE 8 — REBUILD HA

If recovery began with one node:

initialize/configure replica set

and:

add Secondaries.

PHASE 9 — APPLICATION CUTOVER

Verify:

• Primary
• replication health
• connection strings
• authentication
• application smoke tests.

PHASE 10 — POST-RECOVERY RCA

Determine:

• why original cluster failed
• why recovery took as long as it did
• whether RPO/RTO were achieved
• what backup/control improvements are required.

The worst time to discover that a backup is unusable is during this incident.

That is why restore testing must already exist.`,

      internalWorking: `12:00
Full backup
   |
   +--> changes
   +--> changes
   +--> changes
   |
17:58
last available PITR
   |
18:00
disaster

Recovery:

12:00 base
   +
changes through 17:58
   |
   v
recover near failure point`,

      architecture: `              DISASTER
                  |
                  v
            BACKUP CATALOG
          +-------+-------+
          |               |
          v               v
       FULL BASE       PITR/OPLOG
          \               /
           \             /
               RECOVERY
               ENVIRONMENT
                   |
                   v
                VALIDATE
                   |
                   v
              REPLICA SET
                   |
                   v
              APPLICATION`,

      examples: [
        `Full backup from six hours earlier plus oplog/PITR through two minutes before failure can provide a much better RPO than the full backup alone.`,
        `If backup encryption keys are unavailable, otherwise valid backup files may be unusable.`,
        `Recovery is incomplete until application-level validation passes.`
      ],

      commands: [
        {
          command:
            'mongorestore --uri="<TARGET_URI>" /backup/dump',
          explanation:
            'Illustrates restoring the full logical base.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used after replica-set reconstruction to verify topology and replication health.'
        },
        {
          command:
            'db.getCollectionNames()',
          explanation:
            'Provides a basic restored collection inventory as one validation step.'
        }
      ],

      productionScenario: `A financial MongoDB cluster becomes unavailable at:

20:00.

Latest validated full backup:
14:00.

Continuous oplog/PITR data:
available through 19:57.

Business requirements:

RPO:
5 minutes

RTO:
2 hours.

The DBA provisions the tested recovery environment, restores the 14:00 base snapshot, replays changes through 19:57, validates critical financial records, builds out replica-set redundancy, and cuts application traffic over.

Achieved:

RPO:
3 minutes

RTO:
1 hour 42 minutes.

The incident then proceeds to RCA rather than ending at application recovery.`,

      troubleshootingApproach: `1. Record failure time.

2. Confirm business RPO/RTO.

3. Preserve original-cluster evidence.

4. Identify latest validated full backup.

5. Identify latest available oplog/PITR point.

6. Verify backup integrity.

7. Verify encryption keys.

8. Provision recovery infrastructure.

9. Restore base.

10. Replay changes to selected timestamp.

11. Review restore errors.

12. Validate collections.

13. Validate counts against recovery point.

14. Validate indexes.

15. Validate users/roles.

16. Validate critical business records.

17. Configure replica set.

18. Add Secondaries.

19. Verify replication.

20. Run application smoke tests.

21. Cut traffic over.

22. Monitor closely.

23. Document achieved RPO/RTO.

24. Perform RCA.

25. Improve backup/recovery controls.`,

      commonMistakes: [
        'Starting restore before choosing the recovery point.',
        'Using an unvalidated backup under pressure.',
        'Ignoring available oplog/PITR data.',
        'Cutting over before data validation.',
        'Rebuilding HA before proving the restored base is correct.',
        'Closing the incident without measuring achieved RPO/RTO.'
      ],

      bestPractices: [
        'Maintain a tested recovery runbook.',
        'Catalog every recovery point.',
        'Protect backup encryption keys separately.',
        'Validate before application cutover.',
        'Record achieved RPO and RTO.',
        'Use the incident to improve future DR readiness.'
      ],

      interviewAnswer: `For a major MongoDB disaster, I first establish the required RPO/RTO and inventory the latest validated full backup plus any oplog or PITR data.

I build a clean recovery environment, restore the base, replay changes to the selected recovery timestamp, validate data and indexes, rebuild replica-set HA, perform application smoke tests, and only then cut traffic over.

After recovery I record the actual RPO/RTO and complete an RCA covering both the primary failure and the recovery process.`,

      keyTakeaways: [
        'Disaster recovery combines base backup and incremental recovery.',
        'Recovery point must be chosen explicitly.',
        'Validation comes before cutover.',
        'HA should be rebuilt after the base is proven.',
        'RPO and RTO must be measured after every major recovery.'
      ]
    }
  }

];

/* =========================================================
   SEED EXECUTION
========================================================= */

async function seedBackupRestore() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'backup_restore'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous backup_restore documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Backup & Restore questions`
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
        category: 'backup_restore'
      });

    console.log(
      `Topic 11 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 11 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 11 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 11 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedBackupRestore();
