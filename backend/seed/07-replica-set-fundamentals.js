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
    'MongoDB URI not found. Set SEED_MONGODB_URI, MONGODB_URI, or MONGO_URI before running this seed.'
  );
  process.exit(1);
}

const DATABASE_NAME = 'webapp';
const COLLECTION_NAME = 'questions';

const questions = [
  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 1,
    question:
      'What is a MongoDB replica set, why is it used, and what problem does replication solve?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `A MongoDB replica set is a group of mongod instances that maintain copies of the same logical dataset.

Its main purpose is to provide:

• High availability
• Data redundancy
• Automatic failover
• Replicated copies of data

A typical production replica set contains:

1 Primary

and:

2 or more Secondary members.

Applications normally write to the Primary.

Secondaries continuously replicate changes from the replica set oplog.`,

      coreConcept: `The simplest architecture is:

Application
    |
    v
PRIMARY
    |
    +--> SECONDARY
    |
    +--> SECONDARY

The Primary accepts writes.

Each committed write creates replication information in the oplog.

Secondaries read oplog entries and apply the same operations locally.

If the Primary becomes unavailable, eligible members can hold an election and elect a new Primary.`,

      detailedExplanation: `Without replication, a standalone MongoDB server is a single point of failure.

Suppose:

Application
    |
    v
MongoDB Standalone

If that server fails:

• writes stop
• reads may stop
• application becomes unavailable
• recovery depends on restarting or restoring that server

With a replica set:

Application
    |
    v
Primary
   / \
  v   v
Secondary Secondary

If the Primary fails, the remaining voting members can detect the failure.

If a majority of voting members can communicate and an eligible Secondary is available, an election can occur.

One Secondary becomes the new Primary.

This provides automatic failover.

Replication also provides multiple copies of data.

However, replica sets should not be confused with backup.

Why?

Because destructive logical operations are also replicated.

Example:

db.users.deleteMany({})

If that command succeeds on the Primary, the delete operation is replicated to Secondaries.

Therefore:

Replication protects primarily against node/server failure.

Backups protect against scenarios such as:

• accidental deletion
• application corruption
• ransomware
• bad deployment
• logical data corruption
• disaster requiring historical recovery

A production design normally needs both:

replication

and:

backup.`,

      internalWorking: `Client Write
    |
    v
PRIMARY
    |
    +--> Modify local data
    |
    +--> Record operation in oplog
    |
    v
Oplog replication stream
    |
    +------------+
    |            |
    v            v
SECONDARY 1   SECONDARY 2
    |            |
    v            v
Apply oplog   Apply oplog
    |            |
    v            v
Local copy    Local copy`,

      architecture: `                 APPLICATION
                     |
                     v
                  PRIMARY
                 /       \
                /         \
               v           v
        SECONDARY 1   SECONDARY 2

Writes:
Application -> Primary

Replication:
Primary/Oplog -> Secondaries

Failure:
Primary unavailable
        |
        v
Election
        |
        v
Eligible Secondary becomes Primary`,

      examples: [
        `Three-member replica set:

rs0

node1:27017
PRIMARY

node2:27017
SECONDARY

node3:27017
SECONDARY`,

        `Check status:

rs.status()`,

        `Check replica-set configuration:

rs.conf()`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Displays replica-set member states, health, election information, replication timestamps, and other status information.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Displays the current replica-set configuration including members, priorities, votes, and configuration version.'
        },
        {
          command:
            'db.hello()',
          explanation:
            'Shows information about the current member, including whether it is writable primary and replica-set topology details.'
        }
      ],

      productionScenario: `A financial application runs on a single standalone MongoDB server.

The VM fails unexpectedly.

Even though storage can eventually be recovered, the application remains unavailable until the server is restored.

The DBA redesigns the environment as a three-member replica set across independent failure domains.

Later one Primary VM fails.

The other members detect the failure, hold an election, and an eligible Secondary becomes Primary.

The application reconnects through a properly configured replica-set connection string.

The system experiences a temporary interruption instead of a long outage.`,

      troubleshootingApproach: `When evaluating replica-set availability:

1. Check rs.status().

2. Identify current Primary.

3. Verify all members are healthy.

4. Verify member states.

5. Check voting configuration.

6. Check majority availability.

7. Check replication lag.

8. Check network connectivity between members.

9. Check application connection string.

10. Verify the driver uses the replica-set topology correctly.

11. Check mongod logs for elections or heartbeats.

12. Remember replication is not a replacement for backup.`,

      commonMistakes: [
        'Using a standalone server for critical production workloads.',
        'Thinking replica set means backup.',
        'Connecting the application to only one host without proper replica-set discovery.',
        'Ignoring failure-domain placement.',
        'Assuming a Secondary can always become Primary.'
      ],

      bestPractices: [
        'Use replica sets for production high availability.',
        'Use at least three voting members for normal production designs.',
        'Distribute members across independent failure domains where possible.',
        'Use replica-set-aware driver connection strings.',
        'Maintain independent backups in addition to replication.'
      ],

      interviewAnswer: `A MongoDB replica set is a group of mongod instances that maintain copies of the same dataset.

One member is normally Primary and accepts writes, while Secondary members replicate operations from the oplog.

Replica sets provide redundancy and automatic failover because, when the Primary becomes unavailable and a voting majority remains, eligible members can elect a new Primary.

Replication is for availability and redundancy; it is not a replacement for backup.`,

      keyTakeaways: [
        'Replica sets provide high availability.',
        'Primary normally accepts writes.',
        'Secondaries replicate through the oplog.',
        'Elections provide automatic failover.',
        'Replication and backup solve different problems.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 2,
    question:
      'What are Primary, Secondary, and Arbiter members in a MongoDB replica set, and what are their responsibilities?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `MongoDB replica-set members can have different roles.

The most important are:

PRIMARY

SECONDARY

ARBITER

The Primary normally handles application writes.

Secondaries maintain copies of the data.

An Arbiter participates in voting but does not store the user dataset.`,

      coreConcept: `PRIMARY

• Accepts normal writes
• Creates oplog entries
• Can serve reads
• Participates in elections

SECONDARY

• Replicates oplog operations
• Maintains a data copy
• Can potentially become Primary if eligible
• Can serve reads depending on read preference

ARBITER

• Stores no user data
• Does not replicate the dataset
• Participates in elections
• Can vote
• Cannot become Primary`,

      detailedExplanation: `PRIMARY

A healthy replica set normally has one Primary.

When the application executes:

db.orders.insertOne(...)

the write is directed to the Primary.

The Primary updates its data and records replication information in the oplog.

SECONDARY

Secondaries continually replicate operations.

Conceptually:

Primary oplog
     |
     v
Secondary fetches operations
     |
     v
Secondary applies operations
     |
     v
Secondary data converges with Primary

An eligible Secondary can participate as an election candidate.

ARBITER

An Arbiter exists mainly to contribute a vote without maintaining a complete copy of the data.

Example legacy-style topology:

Primary
Secondary
Arbiter

This provides three voting members but only two data-bearing copies.

For many production environments, three data-bearing members are preferable because:

• more redundancy
• more failover options
• better durability options
• easier maintenance
• avoids a non-data-bearing voter

Arbiters still exist for specific constrained architectures, but they should not be chosen automatically.

Another important point:

A Secondary is not simply a backup server.

It is an actively replicating member whose data can change continuously as operations are applied.`,

      internalWorking: `PRIMARY
  |
  +--> user data
  |
  +--> oplog
  |
  +---------------------+
  |                     |
  v                     v
SECONDARY           SECONDARY
  |                     |
  +--> user data        +--> user data
  +--> oplog            +--> oplog


ARBITER

Votes in election

No user dataset
No replicated data copy
Cannot become Primary`,

      architecture: `Three data-bearing members:

          PRIMARY
         /       \
        v         v
  SECONDARY   SECONDARY


Alternative with arbiter:

          PRIMARY
         /       \
        v         v
  SECONDARY     ARBITER

Data copies:
2

Voting members:
3`,

      examples: [
        `Check member roles:

rs.status()`,

        `Configuration:

rs.conf()`,

        `Typical member state values:

PRIMARY
SECONDARY
ARBITER`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows each member state such as PRIMARY, SECONDARY, or ARBITER.'
        },
        {
          command:
            'rs.conf().members',
          explanation:
            'Displays configured members and options including priority, votes, and arbiterOnly.'
        }
      ],

      productionScenario: `A company has:

Primary
Secondary
Arbiter

The Primary server suffers complete storage failure.

Only one data-bearing Secondary remains.

The Arbiter cannot provide another copy of data because it stores no dataset.

The architecture technically has three voting members but only two data-bearing members.

The DBA later redesigns the topology with three data-bearing members so that infrastructure redundancy matches business durability requirements.`,

      troubleshootingApproach: `When reviewing member roles:

1. Run rs.status().

2. Identify Primary.

3. Identify all Secondaries.

4. Check whether any member is an Arbiter.

5. Check which members contain data.

6. Review votes.

7. Review priority.

8. Determine which Secondaries are electable.

9. Check failure-domain placement.

10. Determine how many data-bearing copies remain during one-node failure.

11. Verify architecture matches RPO/RTO requirements.`,

      commonMistakes: [
        'Thinking an Arbiter stores a data copy.',
        'Assuming every Secondary is electable.',
        'Using an Arbiter automatically just to make the member count odd.',
        'Counting an Arbiter as data redundancy.',
        'Treating a Secondary as an offline backup.'
      ],

      bestPractices: [
        'Prefer data-bearing members when resources allow.',
        'Understand voting and electability separately.',
        'Count actual data-bearing copies when evaluating durability.',
        'Use Arbiters only with a clear architectural reason.',
        'Monitor every replica-set member.'
      ],

      interviewAnswer: `The Primary normally accepts writes and records changes in the oplog.

Secondaries replicate and apply those oplog operations, maintain copies of the data, and eligible Secondaries can become Primary after an election.

An Arbiter participates in voting but stores no user dataset and can never become Primary.

For most production systems I prefer three data-bearing members unless there is a specific reason to use an Arbiter.`,

      keyTakeaways: [
        'Primary is the normal write leader.',
        'Secondaries replicate data.',
        'Eligible Secondaries can become Primary.',
        'Arbiters vote but store no dataset.',
        'Voting redundancy and data redundancy are not the same.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 3,
    question:
      'What is the MongoDB oplog, where is it stored, and how does it support replica-set replication?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `The oplog is the replication operation log used by MongoDB replica sets.

Its full logical name is:

operations log.

It records database changes in a form that Secondary members can replay.

The oplog is stored in the:

local

database, in the collection:

local.oplog.rs`,

      coreConcept: `Simplified flow:

Application Write
      |
      v
Primary
      |
      v
Data modified
      |
      v
Operation represented in oplog
      |
      v
Secondaries replicate oplog entries
      |
      v
Apply operations locally

The oplog is ordered by replication timestamps and is designed so operations can be replayed on replica-set members.`,

      detailedExplanation: `The oplog is a special capped collection.

Example namespace:

local.oplog.rs

The local database is not replicated as normal user data.

Each replica-set member has its own local database containing member-specific information.

A simplified oplog entry can contain information such as:

• timestamp
• operation type
• namespace
• operation data
• session/transaction-related metadata where applicable

Common operation types conceptually include:

i = insert

u = update

d = delete

c = command

n = no-op

Example conceptual entry:

{
  ts: Timestamp(...),
  op: "i",
  ns: "shop.orders",
  o: {
    _id: 101,
    status: "OPEN"
  }
}

Secondaries continuously follow the oplog.

They determine:

What operations have occurred after the last operation I applied?

Then they fetch and apply newer operations.

The oplog has a finite size.

Because it is capped, old entries are eventually overwritten as new entries arrive.

This creates the concept of:

oplog window.

The oplog window is approximately the amount of historical time currently represented in the oplog.

Example:

Oldest oplog entry:
Monday 10:00

Newest oplog entry:
Wednesday 10:00

Approximate oplog window:

48 hours.

If a Secondary becomes disconnected longer than the available oplog history and the required older operations are no longer present, it cannot simply catch up incrementally from those missing operations.

It may require resynchronization/initial sync.

Therefore oplog capacity is important for:

• replication resilience
• maintenance windows
• network outages
• backup/PITR-related workflows
• large bulk operations`,

      internalWorking: `PRIMARY

User Write
   |
   v
Storage engine update
   |
   v
Oplog entry
   |
   v
local.oplog.rs
   |
   +---------------------+
   |                     |
   v                     v
SECONDARY A          SECONDARY B
   |                     |
   v                     v
Fetch newer ops       Fetch newer ops
   |                     |
   v                     v
Apply locally         Apply locally`,

      architecture: `PRIMARY

Database:
shop.orders

Replication log:
local.oplog.rs
      |
      v
Timestamp ordered operations
      |
      +------------------+
      |                  |
      v                  v
SECONDARY 1        SECONDARY 2
      |                  |
      v                  v
Apply changes       Apply changes`,

      examples: [
        `View recent oplog entries:

use local

db.oplog.rs.find().sort({
  $natural: -1
}).limit(5)`,

        `Check oplog statistics:

db.getSiblingDB("local").oplog.rs.stats()`,

        `Check replication information:

rs.printReplicationInfo()`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows oplog size, configured log length, oldest/newest oplog times, and approximate oplog time window.'
        },
        {
          command:
            'db.getSiblingDB("local").oplog.rs.stats()',
          explanation:
            'Shows statistics for the local.oplog.rs capped collection.'
        },
        {
          command:
            'db.getSiblingDB("local").oplog.rs.find().sort({ $natural: -1 }).limit(5)',
          explanation:
            'Displays recent oplog entries for learning or troubleshooting when privileges allow.'
        }
      ],

      productionScenario: `A Secondary goes offline for hardware maintenance.

Expected downtime:
3 hours.

Oplog window:
36 hours.

The Secondary returns after 3 hours and can fetch the missing oplog entries and catch up.

In another incident:

Secondary is offline for 4 days.

Oplog window:
18 hours.

The operations required to bridge the gap are already overwritten.

The member can no longer catch up using normal incremental replication.

An initial sync may be required.

The DBA therefore monitors not only replication lag but also oplog-window capacity.`,

      troubleshootingApproach: `For oplog-related troubleshooting:

1. Run rs.printReplicationInfo().

2. Record oplog size.

3. Record oldest oplog timestamp.

4. Record newest oplog timestamp.

5. Calculate/observe oplog window.

6. Check Secondary last applied timestamp.

7. Compare lag duration to oplog window.

8. Check write volume.

9. Look for bulk loads or large update/delete workloads.

10. Determine whether oplog growth rate changed.

11. Verify disk capacity before resizing.

12. Monitor after workload changes.`,

      commonMistakes: [
        'Thinking oplog stores complete copies of documents forever.',
        'Assuming oplog history is unlimited.',
        'Ignoring oplog window during maintenance.',
        'Confusing local.oplog.rs with a normal replicated collection.',
        'Checking lag without considering available oplog history.'
      ],

      bestPractices: [
        'Monitor oplog window regularly.',
        'Size oplog for expected outages and write bursts.',
        'Consider maintenance duration when evaluating oplog capacity.',
        'Investigate sudden reductions in oplog window.',
        'Understand oplog requirements before large bulk operations.'
      ],

      interviewAnswer: `The oplog is a capped replication log stored in local.oplog.rs on each replica-set member.

The Primary records replicated write operations there, and Secondaries fetch and apply newer oplog entries to maintain their copies.

Because the oplog has finite capacity, old operations are overwritten, creating an oplog window. If a Secondary needs operations older than that window, it may require initial sync rather than normal catch-up.`,

      keyTakeaways: [
        'Oplog drives replica-set replication.',
        'It is stored in local.oplog.rs.',
        'It is a capped collection.',
        'Finite oplog size creates an oplog window.',
        'A Secondary can fall outside the oplog window.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 4,
    question:
      'How does a Secondary replicate data from another replica-set member, and what does it mean to apply oplog operations?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `A Secondary does not repeatedly copy the entire database from the Primary.

After it has a synchronized dataset, it normally stays current by replicating newer oplog operations.

The process is conceptually:

Fetch operations

then:

Apply operations.`,

      coreConcept: `Suppose Secondary A has applied through:

Timestamp 100

The sync source has oplog entries:

101
102
103
104

Secondary A fetches those newer entries and stores/processes them for replication.

It then applies the operations in a way that maintains the required replication ordering and consistency.

After applying through timestamp 104, it has caught up to that point.`,

      detailedExplanation: `There are two broad ideas:

OPLOG FETCHING

The Secondary obtains operations from an appropriate sync source.

The sync source is often another replica-set member that has the required oplog history.

It does not always have to be the Primary.

OPLOG APPLICATION

The Secondary applies those operations to its local copy of the user data.

Example Primary operations:

Insert order A

Update order B

Delete order C

The Secondary replays equivalent replicated operations so its logical dataset converges with the Primary.

Replication is asynchronous from the perspective of ordinary writes unless the client uses write concern that waits for acknowledgements from additional members.

That means:

Primary may acknowledge a write

before:

every Secondary has applied it.

This is why replication lag can exist.

Another important concept:

Secondaries choose sync sources according to MongoDB's replication rules and topology conditions.

A Secondary can potentially sync from another Secondary.

This allows chained replication in appropriate circumstances.

However, the basic mental model remains:

A Secondary follows a source's oplog and applies operations locally.`,

      internalWorking: `SYNC SOURCE

local.oplog.rs

100
101
102
103
104
105
   |
   v
SECONDARY

Last applied:
100
   |
   v
Fetch:
101-105
   |
   v
Apply operations
   |
   v
Last applied:
105`,

      architecture: `           PRIMARY
              |
              v
          Oplog Stream
              |
       +------+------+
       |             |
       v             v
  SECONDARY A   SECONDARY B
       |
       |
       +--> May act as sync source
            for another Secondary
            depending on topology`,

      examples: [
        `Replica status:

rs.status()`,

        `Replication summary:

rs.printSecondaryReplicationInfo()`,

        `Modern alternatives may include inspecting optime and wall-clock replication fields directly from rs.status().`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows each member replication state and optime-related information.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a human-readable view of Secondary replication delay in mongosh where supported.'
        }
      ],

      productionScenario: `A Primary is healthy but one Secondary becomes 20 minutes behind.

The DBA checks:

• Secondary CPU
• disk latency
• network
• sync source
• oplog application progress
• workload write rate

They discover the Secondary storage is much slower than the other members.

It continues fetching operations but cannot apply them quickly enough.

Replication lag grows.

The issue is not that MongoDB copies the entire collection too slowly.

The Secondary is falling behind in processing the continuous replication operation stream.`,

      troubleshootingApproach: `For Secondary replication:

1. Check rs.status().

2. Identify Primary and Secondaries.

3. Compare member optimes.

4. Check replication lag.

5. Identify sync source if needed.

6. Check network between members.

7. Check Secondary CPU.

8. Check disk latency.

9. Check cache pressure.

10. Check large write bursts.

11. Check long-running operations.

12. Check oplog window.

13. Verify the member has not fallen too far behind to catch up normally.`,

      commonMistakes: [
        'Thinking Secondaries copy the entire database continuously.',
        'Assuming replication is always synchronous.',
        'Assuming every Secondary must sync directly from Primary.',
        'Ignoring Secondary storage performance.',
        'Looking only at Primary health when lag occurs.'
      ],

      bestPractices: [
        'Monitor replication lag for every Secondary.',
        'Provide comparable infrastructure for electable members.',
        'Monitor member-specific CPU, memory, and disk.',
        'Maintain sufficient oplog window.',
        'Investigate persistent rather than momentary lag.'
      ],

      interviewAnswer: `After initial synchronization, a Secondary normally stays current by fetching newer oplog entries from an eligible sync source and applying those operations to its local dataset.

Replication is generally asynchronous, so the Primary can be ahead of a Secondary and replication lag can exist.

When troubleshooting lag, I compare optimes and then check sync-source connectivity, disk, CPU, cache, write rate, and oplog-window capacity.`,

      keyTakeaways: [
        'Secondaries replicate operations, not full databases continuously.',
        'Replication involves fetching and applying oplog entries.',
        'Replication can be asynchronous.',
        'Secondaries may use another member as a sync source.',
        'Lag indicates the Secondary is behind the latest replication progress.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 5,
    question:
      'What are heartbeats in a MongoDB replica set, and how do members detect that another member is unavailable?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `Replica-set members need to know whether the other members are alive and reachable.

They do this through periodic communication commonly referred to as:

heartbeats.

Heartbeats allow members to exchange topology and health information.`,

      coreConcept: `Conceptually:

Node A
 |
 | heartbeat
 v
Node B

Node B
 |
 | heartbeat
 v
Node A

Members continuously monitor one another.

If the Primary stops responding for long enough according to election and timeout rules, eligible members can begin the process that may lead to an election.`,

      detailedExplanation: `Heartbeats help replica-set members learn information such as:

• member availability
• replica-set state
• election-related information
• replication progress
• topology changes

Suppose the Primary crashes.

The Secondaries do not immediately know the exact instant the process dies.

Instead, repeated heartbeat communication begins failing.

Once the replica-set failure-detection and election conditions are met, an election can be triggered.

This introduces an important concept:

Failover is not instantaneous.

There is a detection interval plus:

• election processing
• driver topology discovery
• new Primary readiness
• application retry/reconnection behavior

Therefore an application can experience a short write interruption during failover even though replica-set failover is automatic.

Heartbeats can also fail because of:

• mongod process failure
• server shutdown
• network partition
• firewall/security-group problem
• DNS problem
• severe resource saturation
• host becoming unresponsive

So a heartbeat failure means:

the member cannot communicate successfully with another member.

It does not automatically prove the mongod process crashed.`,

      internalWorking: `SECONDARY A
     |
     | heartbeat
     v
   PRIMARY

SECONDARY B
     |
     | heartbeat
     v
   PRIMARY


Primary unreachable
     |
     v
Heartbeat failures
     |
     v
Failure detection
     |
     v
Election conditions evaluated`,

      architecture: `          MEMBER A
          /      \
         /        \
 heartbeat      heartbeat
       /          \
      v            v
 MEMBER B <----> MEMBER C
          heartbeat


Every member maintains
topology awareness through
periodic communication.`,

      examples: [
        `Check health:

rs.status()`,

        `Member health typically appears in status information with fields such as:

health
state
stateStr`,

        `Check mongod logs for heartbeat or election-related messages during an incident.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows current view of member health and replica-set states.'
        },
        {
          command:
            'db.hello()',
          explanation:
            'Shows the current member topology view and whether it is writable primary.'
        }
      ],

      productionScenario: `The Primary server remains powered on, but a network security change blocks communication between replica-set members.

Secondaries stop receiving successful heartbeat responses from the Primary.

From their perspective, the Primary is unavailable.

Depending on which members can still communicate and whether a majority exists, an election may occur.

The root cause is networking, not mongod failure.

This is why the DBA must correlate heartbeat symptoms with:

network

OS

MongoDB logs

and:

replica-set status.`,

      troubleshootingApproach: `For heartbeat/member-unreachable incidents:

1. Run rs.status() from reachable members.

2. Identify which members can see each other.

3. Check health/state values.

4. Check mongod logs.

5. Test hostname resolution.

6. Test member-to-member port connectivity.

7. Check firewall/security-group changes.

8. Check CPU/memory saturation.

9. Check server responsiveness.

10. Check system restart/shutdown history.

11. Determine whether a network partition exists.

12. Verify majority connectivity.`,

      commonMistakes: [
        'Assuming every heartbeat failure means mongod crashed.',
        'Ignoring network partitions.',
        'Expecting failover to be literally instantaneous.',
        'Checking only application connectivity and not member-to-member connectivity.',
        'Ignoring DNS/hostname configuration.'
      ],

      bestPractices: [
        'Ensure reliable low-latency networking between members.',
        'Monitor member health continuously.',
        'Use resolvable stable hostnames where appropriate.',
        'Test failover behavior before production incidents.',
        'Correlate MongoDB and infrastructure logs.'
      ],

      interviewAnswer: `Heartbeats are periodic communications replica-set members use to monitor one another and exchange topology and health information.

If a Primary becomes unreachable long enough for the replica set to consider it unavailable, eligible voting members can initiate an election if majority conditions are satisfied.

A heartbeat failure can be caused by process failure, host failure, or networking, so I correlate rs.status, logs, and infrastructure connectivity.`,

      keyTakeaways: [
        'Heartbeats provide member health awareness.',
        'Heartbeat failure can trigger failover logic.',
        'Network failure can look like server failure.',
        'Failover requires detection plus election time.',
        'Member-to-member connectivity is critical.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 6,
    question:
      'How does a MongoDB replica-set election work, and under what conditions can a Secondary become Primary?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `An election is the process MongoDB uses to choose a Primary.

An election can happen when:

• the current Primary becomes unavailable
• the Primary steps down
• replica-set configuration changes affect leadership
• an eligible member becomes a better election candidate under certain conditions

The important rule is:

A Primary must have the support required by replica-set voting majority rules.`,

      coreConcept: `Example three-voter replica set:

Node A
Node B
Node C

Majority:

2 votes.

If Node A Primary fails:

B and C can still communicate.

They have:

2 of 3 votes.

An eligible candidate can be elected Primary.

If only Node B remains reachable:

1 of 3 votes.

No majority.

Node B cannot become Primary.`,

      detailedExplanation: `A Secondary must satisfy election eligibility conditions before becoming Primary.

Important considerations include:

• member must be data-bearing
• member must be electable
• priority must allow election
• member must be sufficiently up to date
• member must be able to participate in majority voting
• topology/election rules must permit it

PRIORITY

A member with:

priority: 0

cannot become Primary.

It can still replicate and, depending on votes configuration, may vote.

VOTES

Voting and priority are different concepts.

Example:

priority: 0

means:

not electable.

votes: 1

can still mean:

participates in elections.

A member can therefore vote without being eligible to become Primary.

ELECTION TERM

MongoDB uses election terms to distinguish leadership generations.

A newer election creates a newer term.

This helps members recognize which Primary/election information is current.

When a new Primary is elected, applications may briefly receive errors or experience write interruption.

Replica-set-aware drivers discover the new topology and direct writes to the new Primary.

Applications should therefore be designed with proper:

• replica-set URI
• retry behavior
• timeouts
• error handling

Election behavior is tightly connected to write concern.

For majority durability, MongoDB tracks which writes are majority committed according to replication state.`,

      internalWorking: `PRIMARY A fails

A: DOWN
B: SECONDARY
C: SECONDARY

Remaining votes:

B + C = majority
      |
      v
Election starts
      |
      v
Eligible candidate requests votes
      |
      v
Majority support
      |
      v
B becomes PRIMARY


If only B survives:

B = 1 vote

No majority

No Primary`,

      architecture: `Before failure:

A PRIMARY
B SECONDARY
C SECONDARY


A unavailable:

       B
      / \
     /   \
Election  C
     \   /
      \ /
   Majority
      |
      v
New PRIMARY`,

      examples: [
        `Check current election state:

rs.status()`,

        `Inspect priorities and votes:

rs.conf().members`,

        `Voluntary stepdown:

rs.stepDown()`
      ],

      commands: [
        {
          command:
            'rs.conf().members.forEach(m => print(m.host, "priority:", m.priority, "votes:", m.votes))',
          explanation:
            'Displays member priority and voting configuration for election analysis.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Shows the current Primary, terms, member states, and election-related information.'
        }
      ],

      productionScenario: `Replica set:

Node A:
priority 2
votes 1

Node B:
priority 1
votes 1

Node C:
priority 0
votes 1

A fails.

B and C remain connected.

They still have majority:

2 of 3.

C cannot become Primary because its priority is 0.

B is eligible and can become Primary.

Later both A and C are unavailable.

Only B remains.

Even though B is healthy and electable, it only has one vote out of three configured voters.

It cannot maintain majority and therefore cannot operate as Primary.`,

      troubleshootingApproach: `For election problems:

1. Run rs.status().

2. Count configured voting members.

3. Determine majority.

4. Identify reachable voters.

5. Check member priority.

6. Check votes.

7. Check member state.

8. Check replication freshness.

9. Check network partitions.

10. Check logs for election messages.

11. Check whether a member stepped down.

12. Verify application reconnect behavior.

13. Avoid manually forcing unsafe topology changes during an incident without understanding majority implications.`,

      commonMistakes: [
        'Thinking any surviving Secondary can become Primary.',
        'Confusing priority with votes.',
        'Ignoring majority requirements.',
        'Setting too many members to priority 0 without understanding failover capacity.',
        'Forcing configuration changes during an outage without understanding data safety.'
      ],

      bestPractices: [
        'Design replica sets so normal single-member failure preserves majority.',
        'Keep appropriate electable members available.',
        'Understand votes and priority separately.',
        'Test failover with production-like drivers.',
        'Monitor election frequency and causes.'
      ],

      interviewAnswer: `A MongoDB election selects a new Primary when leadership is needed.

An eligible Secondary requests votes, and it must obtain the required majority support according to the configured voting members.

Electability depends on factors such as member state, priority, data freshness, and replica-set rules.

Priority controls whether a member can become Primary, while votes control election participation, so those settings should not be confused.`,

      keyTakeaways: [
        'Elections choose the Primary.',
        'Majority is required.',
        'Priority affects electability.',
        'Votes affect election participation.',
        'A healthy Secondary may still be unable to become Primary.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 7,
    question:
      'What are member priority and votes in a MongoDB replica set, and how do they affect elections?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `Two important replica-set member settings are:

priority

and:

votes.

They control different things.

PRIORITY answers:

Can this member become Primary, and how strongly is it preferred?

VOTES answers:

Does this member participate as a voter in elections?`,

      coreConcept: `Example:

{
  host: "node1:27017",
  priority: 2,
  votes: 1
}

This member:

• can vote
• is electable
• has stronger Primary preference than a member with lower positive priority

Example:

{
  host: "node3:27017",
  priority: 0,
  votes: 1
}

This member:

• can vote
• cannot become Primary`,

      detailedExplanation: `PRIORITY

Typical concepts:

priority > 0

member can potentially become Primary.

priority = 0

member cannot become Primary.

Priority can influence preferred leadership.

Example:

Node A:
priority 2

Node B:
priority 1

Node C:
priority 0

A is preferred over B when topology and freshness conditions permit.

C can never become Primary.

VOTES

A voting member contributes to election majority calculations.

MongoDB replica sets support a limited number of voting members, and production configuration should be designed intentionally.

Important principle:

The majority is based on configured voting members, not simply the number of currently healthy data-bearing members.

Example:

5 configured voters.

Majority:
3.

If only 2 voters can communicate:

No Primary can be elected or maintained under majority requirements.

WHY PRIORITY 0?

Common reasons can include:

• delayed/special-purpose member
• geographically remote member
• reporting member
• hardware that should never become Primary
• operational design requiring non-electable replica

But priority 0 should not be used casually.

Too many non-electable members can reduce failover options.

Another important rule:

Votes and data storage are separate.

An Arbiter may have:

votes = 1

but:

no user data.

Therefore when reviewing availability, DBAs should consider:

• number of voters
• number of electable members
• number of data-bearing members

separately.`,

      internalWorking: `MEMBER SETTINGS

Node A
priority = 2
votes = 1
 |
 +--> can vote
 +--> can become Primary


Node B
priority = 1
votes = 1
 |
 +--> can vote
 +--> can become Primary


Node C
priority = 0
votes = 1
 |
 +--> can vote
 +--> cannot become Primary`,

      architecture: `Replica Set Configuration
        |
        +--> Votes
        |      |
        |      v
        |   Majority
        |
        +--> Priority
               |
               v
           Electability
               |
               v
        Primary preference`,

      examples: [
        `Inspect configuration:

rs.conf().members`,

        `Display:

rs.conf().members.forEach(m => {
  print(
    m.host,
    "priority:",
    m.priority,
    "votes:",
    m.votes
  )
})`
      ],

      commands: [
        {
          command:
            'rs.conf().members.forEach(m => print(m.host, "priority:", m.priority, "votes:", m.votes))',
          explanation:
            'Displays election-related member configuration clearly.'
        }
      ],

      productionScenario: `A five-member replica set has:

Node A:
priority 2

Node B:
priority 1

Node C:
priority 0

Node D:
priority 0

Node E:
priority 0

All have votes.

The DBA expects any four surviving servers to provide broad failover options.

But only A and B are electable.

If A and B both become unavailable, the remaining three voters may form a voting majority but none is eligible to become Primary because all have priority 0.

The replica set can therefore remain without a Primary.

This shows why majority availability and Primary electability must both be considered.`,

      troubleshootingApproach: `For priority/vote troubleshooting:

1. Run rs.conf().

2. List all members.

3. Record priority.

4. Record votes.

5. Identify arbiters.

6. Identify data-bearing members.

7. Identify electable members.

8. Calculate voting majority.

9. Simulate one-node failure.

10. Simulate maintenance scenarios.

11. Confirm an electable member remains with majority.

12. Review whether special priority settings are still justified.`,

      commonMistakes: [
        'Thinking priority controls whether a member votes.',
        'Thinking votes control how strongly a member is preferred as Primary.',
        'Creating too many priority-0 members.',
        'Counting arbiters as data redundancy.',
        'Changing votes/priority without modelling failure scenarios.'
      ],

      bestPractices: [
        'Keep enough electable members for required failover scenarios.',
        'Use priority 0 only with a clear reason.',
        'Calculate majority from configured voters.',
        'Review votes, electability, and data copies separately.',
        'Test topology behavior during maintenance planning.'
      ],

      interviewAnswer: `Votes determine election participation and majority calculation, while priority determines whether a data-bearing member is eligible to become Primary and influences Primary preference.

A priority-0 member can still vote but cannot become Primary.

When designing a replica set I separately verify voting majority, number of data-bearing copies, and number of electable members so failover works as intended.`,

      keyTakeaways: [
        'Votes and priority are different.',
        'Priority 0 means non-electable.',
        'Voting majority is based on configured voters.',
        'A voter does not necessarily store data.',
        'Failover design must include enough electable members.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 8,
    question:
      'What is replication lag in MongoDB, how is it measured, and why does it matter?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `Replication lag means a Secondary is behind the latest replication progress.

Example:

Primary has applied writes through:

10:30:00

Secondary has applied through:

10:29:40

Approximate lag:

20 seconds.

A small temporary difference may be normal.

Persistent or increasing lag is a production problem.`,

      coreConcept: `Replication lag can result when:

Write generation rate
        >
Secondary apply capacity

or when replication communication is interrupted.

Common causes include:

• slow disk
• CPU pressure
• network latency/loss
• large write bursts
• bulk updates/deletes
• index maintenance cost
• cache pressure
• overloaded Secondary
• long-running operations
• infrastructure imbalance`,

      detailedExplanation: `WHY LAG MATTERS

1. READ STALENESS

Applications reading from Secondaries may see older data depending on read preference and consistency settings.

2. FAILOVER RISK

A heavily lagged Secondary may not be the preferred candidate for election.

3. OPLOG-WINDOW RISK

If lag continues growing until the Secondary needs oplog entries that have already rolled over, the member can no longer catch up through normal replication.

4. MAINTENANCE RISK

A lagged member reduces confidence in redundancy during maintenance.

5. BACKUP/REPORTING IMPACT

Backups or reporting jobs against a lagging Secondary may operate on stale data.

HOW TO MEASURE

Compare replication progress between members.

Useful information can come from:

rs.status()

and:

rs.printSecondaryReplicationInfo()

depending on version and shell.

Example:

Primary optime:
T1000

Secondary optime:
T990

The time difference between those positions gives an approximation of lag.

However, a DBA should not investigate lag only as a number.

The key question is:

Why is the Secondary falling behind?`,

      internalWorking: `Writes generated:

PRIMARY
100 ops/sec

Secondary capacity:
100 ops/sec

Lag stable


Writes generated:

PRIMARY
5000 ops/sec

Secondary apply:
2500 ops/sec

Difference accumulates
      |
      v
Replication lag increases`,

      architecture: `PRIMARY
Latest optime
10:30:00
    |
    | oplog
    v
SECONDARY
Applied optime
10:29:40

Lag:
~20 seconds`,

      examples: [
        `Check replica-set state:

rs.status()`,

        `Human-readable lag:

rs.printSecondaryReplicationInfo()`,

        `Check oplog capacity:

rs.printReplicationInfo()`
      ],

      commands: [
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Shows replication delay for Secondary members in a convenient form where supported.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Provides member optime and state information for direct replication analysis.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows the available oplog history so lag can be compared with the oplog window.'
        }
      ],

      productionScenario: `A Secondary begins lagging by:

5 minutes

then:

20 minutes

then:

1 hour.

The Primary is healthy.

The Secondary server has:

CPU 40%

but disk latency has increased dramatically.

Replication application cannot keep pace with incoming writes.

The DBA identifies a degraded storage volume.

The important clue is:

lag is continuously increasing.

If the workload were only temporarily bursty, lag would increase briefly and then recover.

Persistent increasing lag indicates the Secondary cannot currently keep up.`,

      troubleshootingApproach: `For replication lag:

1. Measure lag for each Secondary.

2. Determine whether lag is stable, increasing, or recovering.

3. Check Primary write rate.

4. Check Secondary CPU.

5. Check Secondary disk latency.

6. Check cache/eviction pressure.

7. Check network latency.

8. Check member logs.

9. Check sync source.

10. Check long-running operations.

11. Check large bulk writes.

12. Check index count/write overhead.

13. Check oplog window.

14. Compare hardware between members.

15. Fix the bottleneck and confirm lag decreases.`,

      commonMistakes: [
        'Treating every small momentary lag as an incident.',
        'Ignoring steadily increasing lag.',
        'Checking only Primary performance.',
        'Ignoring oplog-window risk.',
        'Assuming lag is always caused by network latency.'
      ],

      bestPractices: [
        'Monitor lag continuously.',
        'Alert on sustained or growing lag.',
        'Compare lag to oplog window.',
        'Use comparable infrastructure for electable members.',
        'Correlate lag with storage and write-rate metrics.'
      ],

      interviewAnswer: `Replication lag is the time difference between the replication progress of the Primary and a Secondary.

I measure it using member optime information from rs.status or replication helper commands.

Persistent growing lag matters because reads can become stale, failover options weaken, and the Secondary can eventually fall outside the oplog window.

I troubleshoot disk, CPU, network, write rate, cache, sync source, and large write workloads.`,

      keyTakeaways: [
        'Lag means a Secondary is behind.',
        'Persistent increasing lag is more serious than a brief spike.',
        'Disk is a common replication bottleneck.',
        'Lag must be compared with oplog window.',
        'Lag can affect failover and read freshness.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 9,
    question:
      'What happens when the Primary goes down in a MongoDB replica set, from failure detection through application recovery?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `When the Primary becomes unavailable, MongoDB does not immediately redirect writes to a random Secondary.

The replica set must first:

1. Detect Primary unavailability.
2. Confirm election conditions.
3. Elect an eligible new Primary.
4. Allow drivers to discover the topology change.
5. Resume writes to the new Primary.`,

      coreConcept: `Simplified failover:

PRIMARY fails
    |
    v
Heartbeat failures
    |
    v
Replica set detects loss
    |
    v
Election
    |
    v
New Primary
    |
    v
Driver discovers new Primary
    |
    v
Application resumes writes`,

      detailedExplanation: `STEP 1 — PRIMARY FAILURE

Possible causes:

• mongod process stops
• VM crashes
• host reboot
• network isolation
• disk/system failure

STEP 2 — FAILURE DETECTION

Other members stop receiving expected successful heartbeat communication.

STEP 3 — MAJORITY CHECK

The surviving voting members must be able to form the required majority.

Example:

Three voters.

Primary fails.

Two Secondaries survive.

Majority remains.

Election possible.

STEP 4 — ELECTION

Eligible candidates participate in the election.

A sufficiently up-to-date electable Secondary obtains the necessary votes and becomes Primary.

STEP 5 — DRIVER DISCOVERY

A replica-set-aware MongoDB driver maintains topology awareness.

The application may temporarily receive errors such as:

not primary

connection interruption

server-selection delays

depending on the exact failure timing.

The driver discovers the new Primary.

STEP 6 — RETRY / APPLICATION RECOVERY

Supported retryable operations may be retried according to driver/application configuration.

Applications should still handle transient failures correctly.

IMPORTANT:

Automatic failover does not mean:

zero interruption.

There is always some detection and election time.

Also:

If majority does not exist, no new Primary can be elected.

Example:

3 voters

2 unavailable

1 survivor

The survivor cannot become Primary by itself.`,

      internalWorking: `Before:

App
 |
 v
A PRIMARY
|       |
v       v
B SEC   C SEC


A fails

B + C
  |
  v
Majority available
  |
  v
Election
  |
  v
B PRIMARY


Driver:
old topology
    |
    v
discover B
    |
    v
writes resume`,

      architecture: `Failure Path

Primary failure
     |
     v
Heartbeat timeout
     |
     v
Election
     |
     v
New Primary
     |
     v
Driver topology update
     |
     v
Application recovery`,

      examples: [
        `Check current Primary:

db.hello()`,

        `Check all members:

rs.status()`,

        `Controlled test:

rs.stepDown()`
      ],

      commands: [
        {
          command:
            'db.hello()',
          explanation:
            'Shows whether the current member is writable Primary and provides replica-set topology information.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Shows election result and member states after failover.'
        },
        {
          command:
            'rs.stepDown()',
          explanation:
            'Can be used in a controlled maintenance/test context to cause the current Primary to step down. Use carefully in production.'
        }
      ],

      productionScenario: `A Primary VM crashes during business hours.

Replica set:

A Primary
B Secondary
C Secondary

B and C remain reachable.

They maintain majority.

An election occurs and B becomes Primary.

The application connection string contains all replica-set seed hosts and the replica-set name.

The driver discovers B and resumes writes.

Total user impact is a short transient interruption.

If the application had been configured as though MongoDB were a standalone server pointing only to A, automatic topology recovery would be much worse or fail completely from the application's perspective.`,

      troubleshootingApproach: `For Primary-down incidents:

1. Record exact outage time.

2. Check rs.status().

3. Identify new Primary.

4. Check election time.

5. Check mongod logs.

6. Determine why old Primary became unavailable.

7. Check member heartbeat/network state.

8. Confirm majority existed.

9. Check application driver logs.

10. Check connection string.

11. Check server-selection errors.

12. Check retry behavior.

13. Check replication lag before and after election.

14. Check whether old Primary returned as Secondary.

15. Verify cluster stability before closing incident.`,

      commonMistakes: [
        'Expecting zero-second failover.',
        'Assuming any single surviving node can become Primary.',
        'Using a standalone-style application connection string.',
        'Restarting every member during an election incident.',
        'Stopping investigation after a new Primary appears.'
      ],

      bestPractices: [
        'Use replica-set-aware connection strings.',
        'Test application failover behavior.',
        'Keep majority across failure domains.',
        'Monitor elections and their causes.',
        'Perform RCA on unexpected Primary loss.'
      ],

      interviewAnswer: `When the Primary goes down, other replica-set members detect the loss through failed topology communication.

If a voting majority remains and an eligible Secondary is available, an election occurs and a new Primary is chosen.

Replica-set-aware drivers discover the new Primary and application writes resume after a temporary interruption.

If majority is lost, no new Primary can be elected.`,

      keyTakeaways: [
        'Failover involves detection, election, and driver recovery.',
        'Automatic failover is not zero downtime.',
        'Voting majority is required.',
        'Replica-set-aware drivers are essential.',
        'Unexpected Primary loss still requires RCA.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 10,
    question:
      'How should a DBA perform a structured replica-set health check in production?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A production replica-set health check should answer more than:

"Is there a Primary?"

A healthy replica set requires:

• correct member states
• replication progress
• adequate oplog window
• stable elections
• correct voting/electability design
• healthy infrastructure
• working member-to-member connectivity`,

      coreConcept: `A structured health check can follow:

Topology
   |
   v
Member states
   |
   v
Replication lag
   |
   v
Oplog window
   |
   v
Election configuration
   |
   v
Infrastructure
   |
   v
Application connectivity`,

      detailedExplanation: `STEP 1 — CHECK CURRENT PRIMARY

Use:

db.hello()

or:

rs.status()

Verify exactly one writable Primary exists.

STEP 2 — CHECK MEMBER STATES

Expected normal states usually include:

PRIMARY

SECONDARY

Look for problematic states such as members that are:

DOWN

RECOVERING

STARTUP2

UNKNOWN

or otherwise not in expected production state.

STEP 3 — CHECK HEALTH

Review member health and heartbeat information.

STEP 4 — CHECK REPLICATION LAG

Compare Primary and Secondary optimes.

Identify:

• stable small lag
• growing lag
• one member much worse than others

STEP 5 — CHECK OPLOG WINDOW

Use:

rs.printReplicationInfo()

Ask:

Can the oplog safely cover expected maintenance and outage periods?

STEP 6 — CHECK CONFIGURATION

Use:

rs.conf()

Review:

• member hosts
• priorities
• votes
• arbiters
• hidden members
• delayed members where applicable

STEP 7 — CHECK MAJORITY DESIGN

Ask:

If one node fails right now, do we still have majority?

If one availability zone fails, what happens?

STEP 8 — CHECK ELECTION HISTORY

Unexpected frequent elections indicate instability.

STEP 9 — CHECK INFRASTRUCTURE

For every member inspect:

• CPU
• memory
• WiredTiger cache
• disk latency
• disk free space
• network
• system restarts

STEP 10 — CHECK APPLICATION CONNECTION

Ensure the driver uses:

• replica-set topology
• correct replicaSet name
• appropriate seed hosts
• suitable read/write concerns
• proper timeout and retry behavior

A replica set can show a Primary while still having serious hidden risk.

Example:

Primary healthy

Secondary 1 lagging 8 hours

Secondary 2 offline

Technically there is a Primary.

Operationally the cluster is unhealthy.`,

      internalWorking: `Replica Set Health

        |
        +--> Primary exists?
        |
        +--> Secondaries healthy?
        |
        +--> Lag acceptable?
        |
        +--> Oplog window safe?
        |
        +--> Majority intact?
        |
        +--> Elections stable?
        |
        +--> Disk/CPU healthy?
        |
        +--> App topology correct?
        |
        v
Production readiness`,

      architecture: `                   HEALTH CHECK
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
     Topology       Replication      Resources
        |               |               |
        v               v               v
 Primary/State       Lag/Oplog      CPU/Disk/Memory
        |               |               |
        +---------------+---------------+
                        |
                        v
                   Availability
                        |
                        v
                  Application`,

      examples: [
        `Primary/topology:

db.hello()`,

        `Full status:

rs.status()`,

        `Configuration:

rs.conf()`,

        `Oplog:

rs.printReplicationInfo()`,

        `Secondary lag:

rs.printSecondaryReplicationInfo()`
      ],

      commands: [
        {
          command:
            'db.hello()',
          explanation:
            'Quickly identifies whether the connected member is writable Primary and returns topology details.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Provides the central replica-set health view.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Shows replica-set member configuration, priorities, votes, and special member settings.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows oplog size and approximate oplog history window.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Shows Secondary replication delay in a readable form where supported.'
        }
      ],

      productionScenario: `Operations report:

"MongoDB is green because the Primary is up."

The DBA performs a complete health check.

Findings:

Primary:
healthy

Secondary 1:
3 hours lag

Secondary 2:
DOWN

Oplog window:
4 hours

Disk usage on Secondary 1:
96%

This is a serious availability risk.

If Secondary 1 falls another hour behind, it approaches the oplog boundary.

If the Primary then fails, failover and recovery options are severely reduced.

The structured health check detects risk before complete outage occurs.`,

      troubleshootingApproach: `Production replica-set checklist:

1. Identify Primary.

2. Count healthy members.

3. Check states.

4. Check health.

5. Check optimes.

6. Check replication lag.

7. Compare lag trend.

8. Check oplog window.

9. Check member configuration.

10. Review priority.

11. Review votes.

12. Identify non-electable members.

13. Identify arbiters.

14. Verify majority.

15. Review election history.

16. Check mongod logs.

17. Check CPU.

18. Check memory/cache.

19. Check disk latency.

20. Check free disk.

21. Check network.

22. Check host reboot history.

23. Check application connection string.

24. Check read/write concerns.

25. Record findings and risks.`,

      commonMistakes: [
        'Checking only whether a Primary exists.',
        'Ignoring one unhealthy Secondary.',
        'Ignoring oplog window.',
        'Ignoring disk capacity on Secondaries.',
        'Failing to test majority during planned failures.'
      ],

      bestPractices: [
        'Use a repeatable health-check checklist.',
        'Monitor every member individually.',
        'Track lag and oplog window together.',
        'Review election configuration before incidents.',
        'Treat degraded redundancy as a production issue.'
      ],

      interviewAnswer: `For a replica-set health check I verify the current Primary, all member states, health, replication optimes and lag, oplog window, votes, priorities, electability, and majority availability.

I also review elections, logs, CPU, memory, disk, network, and application connection settings.

A replica set is not healthy merely because one Primary is currently available; redundancy and catch-up capacity must also be healthy.`,

      keyTakeaways: [
        'Replica-set health is more than Primary availability.',
        'Lag and oplog window must be checked together.',
        'Votes and priorities determine failure behavior.',
        'Every member requires infrastructure monitoring.',
        'Degraded redundancy should be treated proactively.'
      ]
    }
  },
  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 11,
    question:
      'How do you initialize a new MongoDB replica set, and what happens internally when rs.initiate() is executed?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A MongoDB replica set is not created simply by starting multiple mongod processes.

Every member must first be started with the same replica-set name, for example:

replication:
  replSetName: grafanatest

After the mongod processes are running, one member is used to initialize the replica-set configuration.

The command commonly used is:

rs.initiate()

That creates the initial replica-set configuration and begins the process of establishing the first Primary.`,

      coreConcept: `The high-level sequence is:

Start mongod with replSetName
        |
        v
Connect to one member
        |
        v
rs.initiate()
        |
        v
Initial replica-set configuration created
        |
        v
Member enters replica-set state machine
        |
        v
Election/Primary establishment
        |
        v
Add additional members
        |
        v
Secondaries synchronize data`,

      detailedExplanation: `Before rs.initiate(), a mongod started with a replica-set name is aware that it is intended to participate in replication, but there is not yet an initialized replica-set configuration.

A typical initial configuration can be as simple as:

rs.initiate()

MongoDB creates an initial configuration containing the current member.

A more explicit configuration can also be supplied:

rs.initiate({
  _id: "grafanatest",
  members: [
    {
      _id: 0,
      host: "mongo1.example.com:27017"
    }
  ]
})

The _id of the configuration must match the configured replica-set name.

After initialization, the member begins replica-set coordination.

With a single-member initial configuration, that member can become Primary because it is the only configured voter and therefore has voting majority by itself.

Additional members are then commonly added with:

rs.add()

Those new members do not instantly contain all existing data.

They generally need to perform initial synchronization before becoming healthy Secondaries.

IMPORTANT DBA POINT:

Member hostnames in the replica-set configuration are not cosmetic.

Clients and replica-set members use the configured addresses for topology discovery and member-to-member communication.

If you initiate a replica set using addresses that:

• are not resolvable
• point to the wrong network
• are unreachable from application hosts
• use public addresses where private networking should be used

you can create connectivity problems later.

Initialization should therefore be planned with stable hostnames/IPs and network reachability.`,

      internalWorking: `mongod starts:

replSetName = grafanatest
       |
       v
Not yet initialized
       |
       v
rs.initiate()
       |
       v
Replica-set config stored
       |
       v
Election state established
       |
       v
Writable Primary
       |
       v
Additional members added
       |
       v
Initial sync / replication`,

      architecture: `Step 1

mongo1
mongod --replSet grafanatest


Step 2

rs.initiate()


Step 3

mongo1
PRIMARY


Step 4

rs.add("mongo2:27017")
rs.add("mongo3:27017")


Final:

             mongo1
             PRIMARY
            /       \
           v         v
       mongo2      mongo3
      SECONDARY   SECONDARY`,

      examples: [
        `Initialize with default configuration:

rs.initiate()`,

        `Initialize explicitly:

rs.initiate({
  _id: "grafanatest",
  members: [
    {
      _id: 0,
      host: "mongo1:27017"
    }
  ]
})`,

        `Check initialization:

rs.status()`
      ],

      commands: [
        {
          command:
            'rs.initiate()',
          explanation:
            'Initializes the replica set using the current member as the first configured member.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Verifies replica-set initialization and member state.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Displays the configuration created during initialization.'
        }
      ],

      productionScenario: `A DBA starts three mongod services with:

replSetName: prodRS

but forgets to initialize the replica set.

The processes are running, but application replication functionality is not established.

The DBA connects to the intended first member and runs rs.initiate().

After it becomes Primary, the remaining members are added.

The DBA then monitors initial synchronization until both members reach SECONDARY.

This illustrates that:

starting mongod with replSetName

and:

initializing the replica set

are separate operations.`,

      troubleshootingApproach: `If replica-set initialization fails:

1. Verify mongod is running.

2. Verify replSetName in mongod configuration.

3. Verify all intended members use the same replica-set name.

4. Check rs.status().

5. Check db.hello().

6. Verify hostname resolution.

7. Verify ports.

8. Test member-to-member connectivity.

9. Check mongod logs.

10. Verify security/TLS configuration if enabled.

11. Verify the replica-set name in rs.initiate() matches mongod configuration.

12. Do not repeatedly run arbitrary reconfiguration commands until the actual state is understood.`,

      commonMistakes: [
        'Assuming replSetName alone initializes replication.',
        'Using unreachable member addresses.',
        'Using different replica-set names on different members.',
        'Adding members before verifying the initial Primary is healthy.',
        'Ignoring security and hostname requirements.'
      ],

      bestPractices: [
        'Plan member hostnames before initialization.',
        'Use stable addresses reachable by all members.',
        'Initialize one controlled member first.',
        'Add members one at a time and monitor synchronization.',
        'Validate rs.status() after every topology change.'
      ],

      interviewAnswer: `To initialize a replica set, I first start each mongod with the same replSetName. I connect to the intended first member and run rs.initiate(), optionally with an explicit configuration.

That creates the replica-set configuration and allows the first member to establish Primary state. I then add the remaining members and monitor their initial synchronization until they become healthy Secondaries.`,

      keyTakeaways: [
        'replSetName enables replica-set mode.',
        'rs.initiate() creates the initial configuration.',
        'Initialization and adding members are separate steps.',
        'Configured hostnames must be reachable.',
        'Always validate replica-set state after initialization.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 12,
    question:
      'How do you safely add or remove a member from a MongoDB replica set, and what operational checks should be performed?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Replica-set membership is controlled by the replica-set configuration.

Common helper commands are:

rs.add()

and:

rs.remove()

Adding or removing a member changes the topology and can affect:

• voting majority
• failover capability
• replication
• application availability
• data redundancy

Therefore these commands should be treated as production topology changes, not simple server-registration commands.`,

      coreConcept: `Adding:

Current replica set
      |
      v
rs.add(newMember)
      |
      v
Configuration updated
      |
      v
New member starts synchronization
      |
      v
SECONDARY


Removing:

Replica set
      |
      v
Evaluate majority
      |
      v
rs.remove(member)
      |
      v
Configuration updated
      |
      v
Member no longer participates`,

      detailedExplanation: `ADDING A MEMBER

Before running rs.add(), ensure:

• mongod is installed and running
• correct MongoDB version compatibility
• same replica-set name
• correct authentication/keyFile/TLS settings
• sufficient disk
• member is reachable from existing members
• existing members are reachable from the new server
• intended data path is correct
• system time is synchronized
• required port is open

Example:

rs.add("mongo4.example.com:27017")

After configuration changes, the new member generally needs initial synchronization if it does not already possess a valid synchronized replica-set dataset.

Monitor:

rs.status()

until the member reaches:

SECONDARY

REMOVING A MEMBER

Before:

rs.remove("mongo4.example.com:27017")

consider:

• voting majority
• number of remaining data-bearing members
• number of electable members
• ongoing maintenance
• replication lag
• application connections
• backups

Example:

Three voting members:

A
B
C

Removing C changes the configured voting topology to two members.

A two-voter configuration has important availability characteristics because both votes are needed for majority.

Therefore a DBA should not casually convert a healthy three-voter replica set into a two-voter production topology.

Another common operational workflow is:

1. Add replacement member.
2. Wait until fully synchronized.
3. Validate health.
4. Then remove old member.

This preserves redundancy better than removing first and adding later.`,

      internalWorking: `ADD:

rs.add(D)
   |
   v
Config version increments
   |
   v
D joins topology
   |
   v
Initial sync
   |
   v
D SECONDARY


REMOVE:

Check majority
   |
   v
rs.remove(D)
   |
   v
Config version increments
   |
   v
D no longer member`,

      architecture: `Before replacement:

A PRIMARY
B SECONDARY
C SECONDARY


Safe replacement:

Add D
 |
 v
D initial sync
 |
 v
D SECONDARY
 |
 v
Remove C


Final:

A PRIMARY
B SECONDARY
D SECONDARY`,

      examples: [
        `Add:

rs.add("mongo4:27017")`,

        `Remove:

rs.remove("mongo4:27017")`,

        `Verify:

rs.status()

rs.conf()`
      ],

      commands: [
        {
          command:
            'rs.add("mongo4:27017")',
          explanation:
            'Adds a new member using default member configuration.'
        },
        {
          command:
            'rs.remove("mongo4:27017")',
          explanation:
            'Removes the specified member from the replica-set configuration.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used after topology changes to verify member state and replication.'
        }
      ],

      productionScenario: `A three-member replica set requires migration of one Secondary to new hardware.

Unsafe method:

1. Remove old Secondary.
2. Shut it down.
3. Build replacement.
4. Add replacement hours later.

During that period the replica set has reduced redundancy.

Safer method when infrastructure allows:

1. Build new member.
2. Add it.
3. Let initial sync complete.
4. Confirm it reaches SECONDARY.
5. Verify replication lag.
6. Remove old member.

This minimizes the period of reduced protection.`,

      troubleshootingApproach: `Before adding/removing:

1. Check rs.status().

2. Check rs.conf().

3. Calculate current majority.

4. Identify electable members.

5. Check replication lag.

6. Verify oplog window.

7. Verify disk capacity.

8. Check network connectivity.

9. Verify authentication/TLS.

10. Perform one topology change at a time.

11. Wait for stabilization.

12. Recheck rs.status().

13. Document the final configuration.`,

      commonMistakes: [
        'Removing a member before calculating voting majority.',
        'Adding a server that cannot resolve existing replica-set hostnames.',
        'Removing and adding several members simultaneously.',
        'Assuming a new member is usable immediately.',
        'Ignoring initial-sync resource impact.'
      ],

      bestPractices: [
        'Change topology one member at a time.',
        'Prefer add-sync-remove for hardware replacement.',
        'Validate majority before every change.',
        'Wait for SECONDARY state before proceeding.',
        'Monitor Primary load during initial sync.'
      ],

      interviewAnswer: `I treat rs.add and rs.remove as topology changes.

Before adding a member I validate replica-set name, network, security, disk, version compatibility, and reachability. After adding it, I monitor initial sync until it reaches SECONDARY.

Before removing a member I calculate majority and make sure redundancy and failover remain acceptable. For replacements I normally add and synchronize the new member before removing the old one.`,

      keyTakeaways: [
        'Adding/removing members changes replica-set topology.',
        'Majority must be considered before removal.',
        'New members may require initial sync.',
        'Add-sync-remove is safer for replacement.',
        'Validate state after every topology change.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 13,
    question:
      'What is rs.reconfig(), when is it required, and why can replica-set reconfiguration be dangerous in production?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `rs.reconfig() changes the replica-set configuration.

It can modify settings such as:

• member hostnames
• priorities
• votes
• hidden status
• delayed replication configuration
• other member properties

Because the replica-set configuration controls elections and membership, a bad reconfiguration can reduce availability or create a serious outage.`,

      coreConcept: `Typical workflow:

cfg = rs.conf()

Modify intended field

Example:

cfg.members[1].priority = 0

Then:

rs.reconfig(cfg)

MongoDB creates a new replica-set configuration version.

Members then adopt that configuration.`,

      detailedExplanation: `A replica-set configuration includes values such as:

{
  _id: "rs0",
  version: ...,
  term: ...,
  members: [...]
}

A DBA may use rs.reconfig() when:

• changing member priority
• changing votes
• changing hostnames
• configuring hidden members
• changing special member attributes

Example:

cfg = rs.conf()

cfg.members[2].priority = 0

rs.reconfig(cfg)

The risk is that a configuration mistake can change election behavior immediately.

Example:

Three members:

A priority 1
B priority 1
C priority 1

A careless reconfiguration sets:

B priority 0
C priority 0

Now only A is electable.

If A later becomes unavailable, B and C may still communicate and vote, but neither can become Primary.

Another dangerous area is voting configuration.

Changing the number or distribution of voting members affects majority calculations.

FORCE RECONFIGURATION

MongoDB also supports forced reconfiguration in recovery situations.

This is not a normal maintenance shortcut.

Forced reconfiguration can be dangerous because it is used when normal majority-based configuration change is not possible.

Incorrect use can lead to inconsistent topology and may increase the risk of losing acknowledged data or creating conflicting histories.

Therefore:

force should be reserved for carefully analyzed disaster-recovery situations.`,

      internalWorking: `rs.conf()
   |
   v
Current config
version N
   |
   v
Modify configuration
   |
   v
rs.reconfig()
   |
   v
New config
version N+1
   |
   v
Members adopt new topology
   |
   v
Election behavior may change`,

      architecture: `Replica-set Config
        |
        +--> Members
        |
        +--> Votes
        |
        +--> Priority
        |
        +--> Hidden
        |
        +--> Delay
        |
        v
Election + Replication Behaviour`,

      examples: [
        `Read configuration:

cfg = rs.conf()`,

        `Set member priority:

cfg.members[1].priority = 0

rs.reconfig(cfg)`,

        `Always verify:

rs.conf()

rs.status()`
      ],

      commands: [
        {
          command:
            'cfg = rs.conf()',
          explanation:
            'Loads the existing configuration so a controlled change can be prepared.'
        },
        {
          command:
            'cfg.members[1].priority = 0',
          explanation:
            'Example modification that makes a member non-electable.'
        },
        {
          command:
            'rs.reconfig(cfg)',
          explanation:
            'Applies the modified replica-set configuration.'
        }
      ],

      productionScenario: `A DBA wants a reporting Secondary to never become Primary.

They correctly identify the member and change:

priority: 1

to:

priority: 0.

Before applying the change they verify that two other healthy data-bearing members remain electable.

After rs.reconfig(), they verify:

• configuration version
• member states
• voting majority
• Primary stability

This is controlled reconfiguration.

By contrast, changing multiple votes and priorities during an active outage without understanding majority can turn a recoverable incident into a larger outage.`,

      troubleshootingApproach: `Before rs.reconfig():

1. Save current rs.conf() output.

2. Identify exact member _id.

3. Calculate voting majority.

4. Identify electable members.

5. Understand effect of the proposed setting.

6. Check member health.

7. Check lag.

8. Make the smallest possible change.

9. Apply reconfiguration.

10. Immediately check rs.status().

11. Check rs.conf().

12. Watch logs/elections.

13. Avoid force unless normal majority recovery is impossible and the recovery procedure is understood.`,

      commonMistakes: [
        'Editing the wrong member index.',
        'Changing multiple election properties simultaneously.',
        'Using force during routine maintenance.',
        'Changing votes without recalculating majority.',
        'Failing to save the old configuration.'
      ],

      bestPractices: [
        'Make minimal configuration changes.',
        'Back up the existing configuration text.',
        'Review election implications before execution.',
        'Validate after reconfiguration.',
        'Treat force reconfiguration as disaster recovery.'
      ],

      interviewAnswer: `rs.reconfig() updates the replica-set configuration and is used for changes such as priority, votes, hostnames, hidden members, and other member properties.

Because configuration directly controls membership and elections, I first review majority and electability, make the smallest possible change, apply it, and immediately validate rs.status and rs.conf.

I do not use forced reconfiguration as a routine maintenance technique.`,

      keyTakeaways: [
        'rs.reconfig changes topology behavior.',
        'Priority and vote changes can affect availability.',
        'Small controlled changes are safer.',
        'Always verify the resulting configuration.',
        'Forced reconfiguration is a recovery tool.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 14,
    question:
      'What does Primary stepdown mean in MongoDB, when is rs.stepDown() used, and what should a DBA expect during planned maintenance?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `Primary stepdown means the current Primary voluntarily stops being Primary.

A DBA can trigger this during controlled maintenance using:

rs.stepDown()

The purpose is usually to move write leadership away from a server before maintenance such as:

• patching
• rebooting
• hardware work
• MongoDB upgrade
• OS maintenance`,

      coreConcept: `Before:

A PRIMARY
B SECONDARY
C SECONDARY

Run on A:

rs.stepDown()

Then:

A steps down
      |
      v
Election
      |
      v
B or C becomes PRIMARY

A becomes SECONDARY when healthy and eligible to rejoin.`,

      detailedExplanation: `A controlled stepdown is preferable to simply killing a Primary during planned maintenance because it allows the replica set to transition leadership intentionally.

Typical workflow:

1. Verify all members healthy.
2. Verify Secondaries caught up.
3. Verify voting majority.
4. Check which member is likely/eligible to become Primary.
5. Trigger stepdown.
6. Verify new Primary.
7. Confirm application recovery.
8. Perform maintenance on old Primary.

When the Primary steps down:

• writes to that node stop
• an election may occur
• drivers detect topology change
• application may see a short transient interruption
• a new eligible Primary becomes writable

The old Primary generally transitions to SECONDARY.

IMPORTANT:

Do not perform a stepdown blindly while other members are unhealthy.

Example:

A PRIMARY
B SECONDARY
C DOWN

If you intentionally take A out without understanding topology, availability may be affected depending on the exact state and voting configuration.

Maintenance should preserve majority throughout the operation.`,

      internalWorking: `A PRIMARY
   |
   | rs.stepDown()
   v
A SECONDARY
   |
   v
Election
   |
   +----------+
   |          |
   v          v
B candidate  C candidate
   |
   v
New PRIMARY`,

      architecture: `Planned maintenance:

Health check
     |
     v
Secondaries caught up
     |
     v
Step down Primary
     |
     v
Verify new Primary
     |
     v
Patch old Primary
     |
     v
Start old member
     |
     v
Verify SECONDARY
     |
     v
Proceed to next member`,

      examples: [
        `Controlled stepdown:

rs.stepDown()`,

        `Verify Primary afterward:

db.hello()`,

        `Check all members:

rs.status()`
      ],

      commands: [
        {
          command:
            'rs.stepDown()',
          explanation:
            'Requests the current Primary to relinquish Primary state for a period.'
        },
        {
          command:
            'db.hello()',
          explanation:
            'Used to identify the currently writable Primary after the election.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used to verify the old and new member states after stepdown.'
        }
      ],

      productionScenario: `A three-node replica set requires MongoDB patching.

Correct sequence:

1. Patch one Secondary.
2. Start it.
3. Wait until SECONDARY and caught up.
4. Patch the other Secondary.
5. Wait until healthy.
6. Step down the Primary.
7. Verify another member becomes Primary.
8. Patch the old Primary.
9. Start it.
10. Verify it rejoins as SECONDARY.

At each stage the DBA avoids taking multiple voting members down simultaneously.`,

      troubleshootingApproach: `Before stepdown:

1. Check rs.status().

2. Ensure both Secondaries are healthy.

3. Check replication lag.

4. Check oplog window.

5. Check priority.

6. Verify majority.

7. Confirm application is replica-set aware.

After stepdown:

8. Identify new Primary.

9. Check election logs.

10. Verify application write recovery.

11. Verify old Primary becomes SECONDARY.

12. Continue maintenance only after topology stabilizes.`,

      commonMistakes: [
        'Stopping the Primary first during planned maintenance.',
        'Stepping down while Secondaries are unhealthy.',
        'Ignoring application failover behavior.',
        'Patching multiple members simultaneously.',
        'Proceeding before the restarted member catches up.'
      ],

      bestPractices: [
        'Patch Secondaries before the Primary.',
        'Keep majority available throughout maintenance.',
        'Use controlled stepdown for Primary maintenance.',
        'Validate topology after every restart.',
        'Wait for replication catch-up before continuing.'
      ],

      interviewAnswer: `Primary stepdown is a controlled transition where the current Primary relinquishes leadership.

I use it during planned maintenance after verifying that healthy, caught-up, electable Secondaries and voting majority are available.

After rs.stepDown(), I verify the new Primary and application recovery before taking the old Primary down for maintenance.`,

      keyTakeaways: [
        'Stepdown is useful for planned failover.',
        'Health must be checked before stepdown.',
        'Applications may see a short interruption.',
        'Majority must remain available.',
        'Maintenance should proceed one member at a time.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 15,
    question:
      'What is initial sync in MongoDB, when does it occur, and what should a DBA monitor while a member is synchronizing?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Initial sync is the process used to build a replica-set member that does not already have a valid synchronized copy of the replica-set dataset.

It commonly occurs when:

• a brand-new member is added
• a member has lost its data
• a Secondary can no longer catch up normally
• a member is intentionally resynchronized`,

      coreConcept: `Conceptual initial sync:

New Secondary
     |
     v
Choose sync source
     |
     v
Copy databases/collections
     |
     v
Build indexes
     |
     v
Track oplog changes during copy
     |
     v
Apply outstanding operations
     |
     v
Catch up
     |
     v
SECONDARY`,

      detailedExplanation: `Initial sync is different from ordinary steady-state replication.

STEADY-STATE REPLICATION

A healthy Secondary already has the dataset and only needs newer oplog operations.

INITIAL SYNC

The member must construct the dataset and then catch up with writes that occurred while copying was taking place.

The process can be resource intensive.

Potential impact includes:

• network traffic
• source-member read load
• disk writes on the syncing member
• index creation
• cache activity
• replication traffic
• longer synchronization time for large datasets

A crucial dependency is oplog history.

While the new member is copying data, writes continue happening on the source replica set.

The member needs enough oplog history to bridge changes that occurred during its synchronization process.

If the required operations roll out of the available oplog before synchronization can catch up, initial synchronization may fail and restart.

Therefore large databases with high write rates require careful attention to:

• oplog window
• synchronization duration
• network throughput
• storage throughput

For a multi-terabyte database, initial sync is an infrastructure operation, not merely a MongoDB command.`,

      internalWorking: `New member
   |
   v
STARTUP2
   |
   v
Select source
   |
   v
Copy data
   |
   +--> writes continue on Primary
   |
   v
Build indexes
   |
   v
Apply accumulated oplog
   |
   v
Catch up
   |
   v
SECONDARY`,

      architecture: `                 PRIMARY
                    |
          +---------+---------+
          |                   |
          v                   v
Existing Secondary       New Member
                              |
                              v
                         Initial Sync
                              |
                   +----------+----------+
                   |                     |
                   v                     v
               Copy Data            Build Indexes
                   |
                   v
             Apply Oplog Gap
                   |
                   v
               SECONDARY`,

      examples: [
        `Monitor:

rs.status()`,

        `Check oplog capacity:

rs.printReplicationInfo()`,

        `Check source and target system metrics:

CPU
disk latency
network
free space`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows member state and progress indicators useful while initial synchronization is occurring.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps determine whether the oplog window is large enough to support the synchronization period.'
        }
      ],

      productionScenario: `A 2 TB replica set adds a new member.

Copy speed:
100 GB/hour.

Approximate copy time:
20 hours plus index and catch-up overhead.

Oplog window:
6 hours.

Write volume is high.

There is a serious risk that required oplog history will roll over before initial sync can finish.

The DBA should address capacity before assuming repeated initial-sync attempts will succeed.

Possible actions include reviewing oplog size, synchronization throughput, network, disk, and maintenance timing.`,

      troubleshootingApproach: `For initial-sync problems:

1. Check rs.status().

2. Inspect mongod logs.

3. Identify sync source.

4. Check source member health.

5. Check target disk free space.

6. Check target disk latency.

7. Check network throughput.

8. Check Primary write rate.

9. Check oplog window.

10. Estimate synchronization duration.

11. Determine whether oplog history is rolling over too quickly.

12. Check for repeated initial-sync restart messages.

13. Avoid repeatedly deleting data and restarting without identifying the cause.`,

      commonMistakes: [
        'Assuming initial sync is instantaneous.',
        'Ignoring oplog-window requirements.',
        'Adding a new member without enough disk.',
        'Ignoring network throughput.',
        'Performing multiple large initial syncs simultaneously without capacity planning.'
      ],

      bestPractices: [
        'Estimate initial-sync duration before starting.',
        'Ensure ample disk headroom.',
        'Maintain sufficient oplog window.',
        'Monitor source and target resources.',
        'Add large members during controlled periods when possible.'
      ],

      interviewAnswer: `Initial sync is how a new or resynchronized replica-set member builds a complete dataset.

It selects a sync source, copies data, builds indexes, and applies oplog operations generated during the copy until it catches up and becomes SECONDARY.

For large environments I monitor disk, network, source load, write rate, sync duration, and especially whether the oplog window is large enough to cover the entire process.`,

      keyTakeaways: [
        'Initial sync builds a complete replica.',
        'It differs from normal oplog catch-up.',
        'It can be resource intensive.',
        'Oplog window is critical.',
        'Large initial sync requires capacity planning.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 16,
    question:
      'A MongoDB Primary goes down but no new Primary is elected. How would you troubleshoot this production incident?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 16,

    answer: {
      groundZero: `When a Primary goes down and no new Primary appears, the first question should not be:

"How do I force a new Primary?"

The first question is:

"Why can the replica set not elect one?"

Common causes include:

• voting majority unavailable
• network partition
• all remaining members non-electable
• members too unhealthy to participate
• configuration issue
• severe replication state problem`,

      coreConcept: `Troubleshooting decision tree:

No Primary
   |
   v
Do we have voting majority?
   |
   +-- NO --> Restore voter/network
   |
   +-- YES
         |
         v
Are healthy members electable?
         |
         +-- NO --> Review priority/state
         |
         +-- YES
               |
               v
Check election logs, freshness,
connectivity and member state`,

      detailedExplanation: `STEP 1 — CAPTURE STATUS

Run on reachable members:

rs.status()

Do not rely on one member's view if a network partition is suspected.

STEP 2 — CALCULATE MAJORITY

Example:

5 configured voters

Required majority:

3.

If only two can communicate:

No Primary.

STEP 3 — CHECK MEMBER STATES

Are surviving members:

SECONDARY

or are they:

RECOVERING
STARTUP2
UNKNOWN
DOWN

STEP 4 — CHECK PRIORITY

A member with:

priority: 0

cannot become Primary.

If every surviving data-bearing member has priority 0, majority alone does not provide an electable Primary.

STEP 5 — CHECK NETWORK PARTITION

Example:

A isolated from B/C.

B and C can communicate.

Depending on votes, one side may have majority and the other may not.

Test member-to-member connectivity, not only application-to-member connectivity.

STEP 6 — CHECK REPLICATION FRESHNESS

Election candidates need appropriate replication state.

STEP 7 — CHECK LOGS

Election logs can show reasons such as:

• insufficient votes
• heartbeat failure
• candidate not electable
• term changes
• topology changes

STEP 8 — DO NOT FORCE RECONFIGURE EARLY

Forced reconfiguration may look like a quick solution but can create data-safety risk if another portion of the original replica set is still active.

First establish the real topology.`,

      internalWorking: `No Primary
    |
    v
Check configured voters
    |
    v
Count reachable voters
    |
    +--> no majority
    |       |
    |       v
    |   restore connectivity
    |
    +--> majority exists
            |
            v
      Check electability
            |
            v
      Check member states
            |
            v
       Check election logs`,

      architecture: `Possible partition:

A PRIMARY?      B SECONDARY
   |                |
   X                |
network             |
partition           |
                    v
                 C SECONDARY

Question:

Which side has majority?

Only the majority side can
successfully establish Primary.`,

      examples: [
        `Status:

rs.status()`,

        `Configuration:

rs.conf()`,

        `Check:

priority
votes
health
stateStr`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Primary command for identifying states, health, and current replica-set view.'
        },
        {
          command:
            'rs.conf().members.forEach(m => print(m.host, m.priority, m.votes))',
          explanation:
            'Helps determine whether surviving members are voters and electable.'
        },
        {
          command:
            'db.hello()',
          explanation:
            'Shows topology information from the member being queried.'
        }
      ],

      productionScenario: `Three members:

A:
Primary
priority 2
votes 1

B:
Secondary
priority 0
votes 1

C:
Secondary
priority 0
votes 1

A crashes.

B and C still have voting majority:

2 of 3.

But neither B nor C is electable because both have priority 0.

Result:

No Primary.

This incident demonstrates that:

majority availability

and:

Primary electability

are separate requirements.`,

      troubleshootingApproach: `L3 sequence:

1. Freeze unnecessary changes.

2. Capture rs.status().

3. Capture rs.conf().

4. Count voters.

5. Calculate majority.

6. Test connectivity among surviving voters.

7. Identify electable members.

8. Check priority.

9. Check member states.

10. Check replication optimes.

11. Inspect election logs.

12. Check host/network failures.

13. Restore the safest missing dependency first.

14. Avoid forced reconfiguration until split-brain/data-risk implications are understood.

15. After Primary returns, validate all members and perform RCA.`,

      commonMistakes: [
        'Immediately using force reconfiguration.',
        'Assuming voting majority guarantees an electable candidate.',
        'Checking only server process status.',
        'Ignoring network partitions.',
        'Restarting all members simultaneously.'
      ],

      bestPractices: [
        'Know majority requirements before incidents.',
        'Maintain multiple electable members.',
        'Monitor member-to-member connectivity.',
        'Preserve evidence before restarting services.',
        'Restore safe topology before making drastic configuration changes.'
      ],

      interviewAnswer: `If the Primary is down and no election occurs, I first capture rs.status and rs.conf, calculate the voting majority, and determine whether the remaining voters can communicate.

If majority exists, I check whether surviving data-bearing members are electable, their priorities and states, replication freshness, and election logs.

I would not begin with forced reconfiguration because that can create data-safety risk during a partition.`,

      keyTakeaways: [
        'No Primary usually has a specific election blocker.',
        'Majority must exist.',
        'At least one appropriate member must be electable.',
        'Network partitions must be ruled out.',
        'Force is not the first troubleshooting step.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 17,
    question:
      'A Secondary is continuously falling further behind the Primary. How would you troubleshoot increasing replication lag at L3 level?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 17,

    answer: {
      groundZero: `A Secondary that is continuously falling further behind means:

Incoming replication work
>
The member's ability to fetch/apply it.

The key difference is:

Temporary lag:
increases and then recovers.

Persistent lag:
keeps increasing.

Persistent increasing lag requires root-cause investigation.`,

      coreConcept: `Investigate four major areas:

1. Write workload

2. Secondary resources

3. Replication transport

4. Oplog safety

Then correlate the timeline.`,

      detailedExplanation: `STEP 1 — MEASURE THE TREND

Do not record one lag value only.

Example:

10:00 = 20 sec
10:10 = 2 min
10:20 = 8 min
10:30 = 20 min

That is clearly worsening.

STEP 2 — CHECK PRIMARY WRITE RATE

Look for:

• bulk imports
• mass updates
• delete jobs
• index-heavy writes
• application release
• batch processing

STEP 3 — CHECK SECONDARY STORAGE

Replication application writes data and indexes.

High disk latency can make a Secondary unable to keep up even when CPU appears normal.

STEP 4 — CHECK CPU

High CPU may indicate:

• replication application work
• compression
• index maintenance
• application reads against Secondary
• unrelated workload

STEP 5 — CHECK WIREDTIGER CACHE

Look for severe eviction or cache pressure.

STEP 6 — CHECK NETWORK

Determine whether the member is receiving operations efficiently.

STEP 7 — CHECK SYNC SOURCE

A poor sync source or network path may contribute to lag.

STEP 8 — CHECK OTHER WORKLOAD ON SECONDARY

Examples:

• analytics
• backup reads
• aggregation
• large scans

Secondaries are not free reporting servers.

STEP 9 — CHECK OPLOG WINDOW

If:

lag = 10 hours

oplog window = 12 hours

the member is approaching a critical boundary.

STEP 10 — COMPARE MEMBERS

If only one Secondary lags:

likely member-specific issue.

If all Secondaries lag:

likely Primary/write-volume/common infrastructure issue.`,

      internalWorking: `Primary write rate
      |
      v
Oplog production
      |
      v
Network fetch
      |
      v
Secondary apply
      |
      v
Data + indexes


If:

production rate > apply rate

backlog grows continuously.`,

      architecture: `                PRIMARY
                   |
              High writes
                   |
                   v
                OPLOG
                   |
          +--------+--------+
          |                 |
          v                 v
     Secondary A       Secondary B
     Healthy           Lagging
                           |
                 +---------+---------+
                 |         |         |
                 v         v         v
               Disk       CPU     Network`,

      examples: [
        `Check lag:

rs.printSecondaryReplicationInfo()`,

        `Check status:

rs.status()`,

        `Check window:

rs.printReplicationInfo()`
      ],

      commands: [
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a quick view of Secondary replication delay.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows how much oplog history remains available.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Allows direct comparison of member states and replication optimes.'
        }
      ],

      productionScenario: `A Secondary lag progresses:

10 minutes
30 minutes
90 minutes
3 hours

Primary CPU:
45%

Lagging Secondary CPU:
35%

At first glance CPU looks healthy.

However:

disk write latency on Secondary:
120 ms

Other members:
5 ms

The storage layer is the bottleneck.

Because replication application depends heavily on storage writes and index maintenance, CPU percentage alone would have led to the wrong conclusion.`,

      troubleshootingApproach: `L3 checklist:

1. Graph lag over time.

2. Compare all Secondaries.

3. Check Primary operation/write rate.

4. Check disk latency on lagging member.

5. Check disk queue/utilization.

6. Check CPU.

7. Check memory.

8. Check WiredTiger cache pressure.

9. Check network latency/loss.

10. Check sync source.

11. Check Secondary read workload.

12. Check backup activity.

13. Check bulk operations.

14. Check index count and write amplification.

15. Check system logs.

16. Check mongod logs.

17. Check oplog window.

18. Estimate time until oplog boundary.

19. Fix underlying resource/workload issue.

20. Confirm lag begins shrinking.`,

      commonMistakes: [
        'Looking only at CPU.',
        'Restarting the Secondary before identifying the bottleneck.',
        'Ignoring application reads on the Secondary.',
        'Ignoring oplog-window exhaustion.',
        'Assuming all lag is network related.'
      ],

      bestPractices: [
        'Trend lag rather than checking snapshots.',
        'Compare one member against peers.',
        'Monitor storage latency closely.',
        'Protect Secondaries from uncontrolled reporting workloads.',
        'Alert well before lag approaches oplog window.'
      ],

      interviewAnswer: `For continuously increasing replication lag, I first determine whether the problem affects one Secondary or all of them and graph the lag trend.

Then I correlate Primary write rate with Secondary disk latency, CPU, WiredTiger cache, network, sync source, and any reporting or backup workload.

Finally I compare the lag with the oplog window because a member that falls beyond available oplog history may require resynchronization.`,

      keyTakeaways: [
        'Growing lag means apply capacity is losing ground.',
        'Disk latency is a major cause.',
        'Compare affected member with healthy peers.',
        'Check workload running on the Secondary.',
        'Oplog-window exhaustion is the critical risk.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 18,
    question:
      'What happens when a Secondary falls outside the oplog window, how do you identify it, and how should recovery be handled?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 18,

    answer: {
      groundZero: `A Secondary falls outside the oplog window when the oldest operation it still needs is no longer available in the sync source's oplog.

Example:

Secondary last applied:
Monday 10:00

Oldest available oplog operation:
Tuesday 08:00

The Secondary needs operations from Monday, but they have already rolled out.

It cannot bridge the missing history through ordinary incremental replication.`,

      coreConcept: `Healthy catch-up:

Secondary position
      |
      v
Required operations still in oplog
      |
      v
Fetch + apply
      |
      v
Catch up


Outside window:

Secondary position
      |
      X
Required oplog entries gone
      |
      v
Normal catch-up impossible
      |
      v
Resynchronization / initial sync required`,

      detailedExplanation: `The oplog is finite.

As new operations arrive, older entries are eventually removed from the capped collection.

Suppose:

Oplog window:
24 hours.

Secondary outage:
4 hours.

Normally safe.

But suppose:

Oplog window:
24 hours.

Secondary outage:
72 hours.

When the member returns, operations required from two days earlier may no longer exist.

Another case is continuous lag.

The Secondary remains online but gets progressively further behind until its required oplog position is older than the oldest available operation.

Symptoms may include replica-set state changes and log messages indicating the member cannot find required oplog history.

RECOVERY

The normal recovery path is generally to resynchronize the member so it obtains a valid copy of the current dataset again.

This can involve initial sync.

Before doing that, determine WHY it fell outside the window.

Otherwise the new initial sync can fail again.

Root causes may include:

• insufficient oplog size
• very high write volume
• slow disk
• long outage
• network failure
• prolonged maintenance

A resync fixes the member state.

It does not fix the original capacity problem.`,

      internalWorking: `OPLOG

Oldest ---------------------- Newest
T500                         T1000

Secondary last applied:
T300

Required:
T301

But T301-T499 no longer exist.

Therefore:

Incremental replication impossible.`,

      architecture: `Secondary
last applied
T300
   |
   v
Needs T301
   |
   X
Oplog begins at T500
   |
   v
Missing replication history
   |
   v
Initial sync / resynchronization`,

      examples: [
        `Check oplog history:

rs.printReplicationInfo()`,

        `Check member replication:

rs.status()`,

        `Inspect mongod logs for replication history / stale member messages.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows the approximate oldest and newest oplog timestamps and time window.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used to identify member state and replication position.'
        }
      ],

      productionScenario: `A Secondary is offline for five days because of a storage replacement.

Oplog window:
18 hours.

When it returns, its last replication point is several days older than the oldest oplog entry.

Normal catch-up is impossible.

The DBA rebuilds/resynchronizes the member.

But before doing so, the DBA also reviews whether an 18-hour oplog window is appropriate for:

• expected maintenance
• network outages
• initial sync duration
• operational recovery requirements.`,

      troubleshootingApproach: `1. Check Secondary last applied position.

2. Check oldest available oplog entry.

3. Compare the timestamps.

4. Confirm the required operations are no longer available.

5. Review logs.

6. Determine why the Secondary fell behind.

7. Check disk and network.

8. Check write volume.

9. Review oplog sizing.

10. Estimate initial-sync duration.

11. Ensure sufficient disk space.

12. Resynchronize safely.

13. Monitor initial sync.

14. Verify SECONDARY state.

15. Confirm oplog window is adequate afterward.`,

      commonMistakes: [
        'Repeatedly restarting a stale Secondary expecting it to catch up.',
        'Rebuilding the member without fixing the cause.',
        'Ignoring oplog sizing.',
        'Assuming oplog window equals a fixed number of hours forever.',
        'Deleting the data directory before confirming recovery procedure.'
      ],

      bestPractices: [
        'Monitor oplog window continuously.',
        'Plan for expected outage duration.',
        'Investigate shrinking oplog window.',
        'Fix resource problems before resynchronizing.',
        'Verify full health after initial sync.'
      ],

      interviewAnswer: `A Secondary is outside the oplog window when the operations it needs to catch up have already rolled out of the oplog.

I compare the Secondary's last applied position with the oldest available oplog entry and check the logs.

Because incremental catch-up is no longer possible, the member generally needs resynchronization or initial sync. I also fix the underlying reason, such as insufficient oplog window, prolonged outage, or storage performance.`,

      keyTakeaways: [
        'A Secondary requires continuous oplog history to catch up.',
        'Missing history prevents incremental replication.',
        'Initial sync may be required.',
        'Oplog window changes with workload.',
        'Root cause must be corrected before rebuild.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 19,
    question:
      'What is rollback in a MongoDB replica set, why can it happen after failover, and how should a DBA understand the data-consistency implications?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 19,

    answer: {
      groundZero: `Rollback can occur when a former Primary contains writes that are not part of the replica set's new authoritative history after failover.

When that old Primary rejoins, MongoDB must reconcile its history with the current Primary.

Operations that exist only on the old branch may need to be rolled back.`,

      coreConcept: `Conceptual example:

A is Primary.

Write X occurs on A.

Before X becomes sufficiently replicated, A becomes isolated.

B and C elect B as new Primary.

New writes occur on B.

Later A rejoins.

A's history:

... -> X

Current replica-set history:

... -> Y -> Z

A must synchronize to the authoritative branch.

The divergent operation X may be rolled back.`,

      detailedExplanation: `Rollback is closely related to distributed-system failover.

Suppose a client uses weak write acknowledgement such as a write acknowledged only by the old Primary.

Sequence:

1. A Primary accepts write X.

2. X has not yet reached enough other members.

3. A loses contact with the majority.

4. B and C elect B as Primary.

5. The new replica-set history proceeds without X.

6. A eventually rejoins.

A cannot continue acting as if its divergent local history were authoritative.

MongoDB must reconcile A to the current Primary's history.

This is why:

write acknowledgement

and:

replication durability

must be understood together.

Majority write concern provides stronger protection for acknowledged writes across normal failover scenarios because the application waits for majority replication semantics before receiving success.

However, rollback is not something a DBA should treat as a normal daily operation.

Unexpected rollback indications should be investigated carefully.

The DBA should determine:

• why topology diverged
• what writes were involved
• what application guarantees were used
• whether clients need reconciliation
• whether network instability exists

Rollback mechanics are explored more deeply in the Advanced Replication topic, but at fundamentals level the key concept is:

a former Primary may contain writes that do not survive if they were not part of the replica set's authoritative committed history.`,

      internalWorking: `Initial history:

T1 -> T2 -> T3

A Primary:
T1 -> T2 -> T3 -> X

Partition

B becomes Primary:
T1 -> T2 -> T3 -> Y -> Z

A returns

Divergence detected
       |
       v
Rollback X
       |
       v
A synchronizes Y -> Z
       |
       v
A becomes SECONDARY`,

      architecture: `            NETWORK PARTITION

A old Primary             B new Primary
     |                          |
     v                          v
    X                        Y -> Z
     |                          |
     +----------rejoin----------+
                  |
                  v
          History reconciliation
                  |
                  v
            A rolls back X
                  |
                  v
              A catches up`,

      examples: [
        `Review replica-set status:

rs.status()`,

        `Review mongod logs around:

election
stepdown
rollback
network partition`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Helps reconstruct topology and member states around failover.'
        }
      ],

      productionScenario: `An application writes with acknowledgement that does not wait for replication to a majority.

The Primary becomes isolated immediately after acknowledging several writes.

Two remaining members elect a new Primary.

When the old Primary rejoins, some writes that existed only on that old Primary are not part of the new authoritative history.

A rollback is required on that member.

The DBA then reviews whether the application's durability requirement should use majority write concern for those critical operations.`,

      troubleshootingApproach: `For rollback investigation:

1. Preserve logs.

2. Establish exact election timeline.

3. Identify old and new Primary.

4. Determine whether a network partition occurred.

5. Check replication lag before failover.

6. Review write concern used by affected application.

7. Identify rollback-related log messages.

8. Determine which operations may have diverged.

9. Verify current replica-set consistency.

10. Engage application owners if business reconciliation is required.

11. Correct network/topology root cause.

12. Review durability settings.`,

      commonMistakes: [
        'Assuming every acknowledged write must exist on every Secondary.',
        'Confusing rollback with restoring from backup.',
        'Ignoring application write concern.',
        'Deleting rollback evidence before analysis.',
        'Treating repeated rollback events as normal.'
      ],

      bestPractices: [
        'Use durability settings appropriate to business criticality.',
        'Monitor replication lag and elections.',
        'Investigate network partitions.',
        'Preserve incident logs.',
        'Test failover behavior with application write concerns.'
      ],

      interviewAnswer: `Rollback occurs when a former Primary rejoins with operations that are not part of the replica set's current authoritative history.

This can happen if writes existed only on the old Primary before a failover and a different Primary was elected.

MongoDB reconciles the old member to the current history, which can require rolling back divergent writes. This is one reason majority write concern is important for critical durability requirements.`,

      keyTakeaways: [
        'Rollback resolves divergent replica-set history.',
        'Unreplicated old-Primary writes can be affected.',
        'Write concern influences durability guarantees.',
        'Network partitions are a common context.',
        'Rollback events require investigation.'
      ]
    }
  },

  {
    category: 'replica_set_fundamentals',
    topicId: 'replica-set-fundamentals',
    topicNumber: 7,
    topicName: 'Replica Set Fundamentals',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 investigation of a MongoDB replica-set production outage involving elections, replication lag, and unstable members?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 20,

    answer: {
      groundZero: `In an L3 replica-set outage, the objective is not merely to make one server Primary again.

The DBA must establish:

1. What failed.
2. Which members can communicate.
3. Whether majority exists.
4. Which member is authoritative.
5. Whether data is safely replicated.
6. Whether the application can reconnect.
7. Why the incident happened.
8. Whether it can happen again.`,

      coreConcept: `A strong investigation follows:

Timeline
   |
   v
Topology
   |
   v
Majority
   |
   v
Election
   |
   v
Replication
   |
   v
Infrastructure
   |
   v
Application
   |
   v
Recovery
   |
   v
RCA + prevention`,

      detailedExplanation: `PHASE 1 — PRESERVE EVIDENCE

Before unnecessary restarts:

• capture rs.status()
• capture rs.conf()
• capture db.hello()
• save mongod logs
• record host uptime/reboot information
• record monitoring graphs

PHASE 2 — BUILD TIMELINE

Example:

12:20 Primary heartbeat failures begin

12:21 Secondary lag increases

12:22 Primary steps down

12:23 election starts

12:24 new Primary elected

12:26 old Primary unreachable

12:35 server rebooted

A timeline prevents random troubleshooting.

PHASE 3 — CHECK TOPOLOGY

Identify:

• current Primary
• all Secondaries
• DOWN/UNKNOWN members
• priority
• votes
• arbiters
• hidden/non-electable members

PHASE 4 — VERIFY MAJORITY

Count configured voters.

Determine which voters can communicate.

Do not assume:

"three servers running"

means:

"three voters communicating."

PHASE 5 — ANALYZE ELECTIONS

Check:

• why election began
• election frequency
• terms
• heartbeat failures
• stepdown reason

Frequent elections are often a symptom of:

• network instability
• server stalls
• storage latency
• resource exhaustion
• maintenance problems

PHASE 6 — ANALYZE REPLICATION

For each Secondary:

• state
• optime
• lag
• sync source
• oplog window
• catch-up direction

Determine whether lag existed before the outage or was caused by it.

PHASE 7 — CHECK INFRASTRUCTURE

CPU alone is insufficient.

Review:

• CPU
• RAM
• swapping
• WiredTiger cache
• disk read/write latency
• disk free space
• network latency/loss
• VM reboot
• filesystem/storage errors

PHASE 8 — CHECK APPLICATION

Review:

• replica-set URI
• replicaSet parameter
• driver behavior
• server-selection errors
• retryable writes
• write concern
• read preference
• timeout behavior

PHASE 9 — RECOVER SAFELY

Restore:

• majority
• healthy Primary
• synchronized Secondaries
• application connectivity

Do not introduce unnecessary topology changes while recovery is in progress.

PHASE 10 — RCA

Final RCA should identify:

Event

Impact

Timeline

Root cause

Contributing factors

Recovery

Preventive actions.`,

      internalWorking: `Incident
   |
   v
Capture evidence
   |
   v
Map topology
   |
   v
Check majority
   |
   v
Analyze election
   |
   v
Analyze replication
   |
   v
Analyze resources
   |
   v
Analyze application
   |
   v
Restore stable state
   |
   v
Root cause
   |
   v
Prevent recurrence`,

      architecture: `                 APPLICATION
                      |
                      v
                 DRIVER LAYER
                      |
                      v
              REPLICA SET TOPOLOGY
             /          |          \
            v           v           v
        PRIMARY     SECONDARY   SECONDARY
            |           |           |
            +-----------+-----------+
                        |
                        v
                  REPLICATION
                        |
                        v
                     OPLOG
                        |
                        v
               INFRASTRUCTURE
          CPU / RAM / DISK / NETWORK`,

      examples: [
        `Core MongoDB commands:

db.hello()

rs.status()

rs.conf()

rs.printReplicationInfo()

rs.printSecondaryReplicationInfo()`,

        `Correlate MongoDB timestamps with:

OS logs

cloud VM events

disk metrics

network monitoring

application logs`
      ],

      commands: [
        {
          command:
            'db.hello()',
          explanation:
            'Quick topology view and writable-Primary identification.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Primary replica-set health and election investigation command.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Used to analyze votes, priorities, and topology design.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Used to assess oplog window and replication safety.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Used to assess Secondary replication lag.'
        }
      ],

      productionScenario: `A production replica set reports:

• application timeouts
• Primary changed twice
• Secondary A is 45 minutes behind
• Secondary B briefly becomes UNKNOWN
• disk latency spikes
• one VM becomes difficult to access

A weak response would be:

Restart MongoDB.

An L3 investigation instead correlates:

1. disk latency spike
2. mongod responsiveness
3. heartbeat failures
4. election timestamps
5. Secondary lag
6. VM host issue
7. driver failover behavior

The RCA may determine that underlying storage latency caused mongod stalls, which caused heartbeat failures, which triggered elections, while the same storage issue prevented one Secondary from applying replication fast enough.

That is a causal chain, not five separate problems.`,

      troubleshootingApproach: `End-to-end checklist:

1. Record incident start time.

2. Preserve rs.status().

3. Preserve rs.conf().

4. Preserve logs.

5. Identify Primary.

6. Identify all member states.

7. Calculate majority.

8. Check priority and votes.

9. Check heartbeat failures.

10. Check election timestamps.

11. Check replication optimes.

12. Check lag trend.

13. Check oplog window.

14. Check sync sources.

15. Check Primary write rate.

16. Check CPU on every member.

17. Check RAM and swap.

18. Check WiredTiger cache.

19. Check disk latency.

20. Check disk free space.

21. Check network connectivity.

22. Check VM/system events.

23. Check application driver errors.

24. Verify replica-set connection string.

25. Verify write concern.

26. Restore healthy majority.

27. Restore healthy Secondary count.

28. Validate application.

29. Monitor stability.

30. Produce RCA and preventive actions.`,

      commonMistakes: [
        'Restarting everything before collecting evidence.',
        'Treating election as the root cause instead of a symptom.',
        'Checking only the current Primary.',
        'Ignoring infrastructure metrics.',
        'Using forced reconfiguration without confirming topology.',
        'Closing the incident when application traffic resumes without RCA.'
      ],

      bestPractices: [
        'Build a timeline before making conclusions.',
        'Correlate MongoDB and infrastructure metrics.',
        'Preserve evidence before restarts.',
        'Restore majority and redundancy safely.',
        'Investigate the trigger behind every unexpected election.',
        'Create preventive alerts for lag, disk, election, and member-health conditions.'
      ],

      interviewAnswer: `For an L3 replica-set outage, I first preserve evidence and build a timeline. I capture rs.status, rs.conf, logs, election events, lag, and oplog information.

Then I verify voting majority and electability, determine why elections occurred, analyze replication lag and member states, and correlate them with CPU, memory, WiredTiger cache, disk, network, and VM events.

I also verify driver topology and application errors. Recovery focuses on restoring a healthy majority, stable Primary, synchronized Secondaries, and application connectivity. Finally I produce an RCA identifying the root cause rather than treating elections or lag as isolated symptoms.`,

      keyTakeaways: [
        'An election is often a symptom, not the root cause.',
        'Timeline correlation is essential.',
        'Replica-set and infrastructure evidence must be analyzed together.',
        'Recovery must preserve majority and data safety.',
        'L3 troubleshooting ends with RCA and prevention.'
      ]
    }
  }
];


/* =========================================================
   SEED
========================================================= */

async function seedReplicaSetFundamentals() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult =
      await collection.deleteMany({
        category: 'replica_set_fundamentals'
      });

    console.log(
      `Removed ${deleteResult.deletedCount} previous replica_set_fundamentals documents`
    );

    const insertResult =
      await collection.insertMany(questions);

    console.log(
      `Inserted ${insertResult.insertedCount} Replica Set Fundamentals questions`
    );


    /* -------------------------------------------------------
       SAFE UNIQUE INDEX
    ------------------------------------------------------- */

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


    /* -------------------------------------------------------
       VALIDATE TOPIC COUNT
    ------------------------------------------------------- */

    const topicCount =
      await collection.countDocuments({
        category:
          'replica_set_fundamentals'
      });

    console.log(
      `Topic 7 count: ${topicCount}`
    );


    if (topicCount !== 20) {
      throw new Error(
        `Topic 7 validation failed. Expected 20 questions but found ${topicCount}.`
      );
    }


    /* -------------------------------------------------------
       TOTAL CURRICULUM COUNT
    ------------------------------------------------------- */

    const totalCount =
      await collection.countDocuments({
        topicId: {
          $exists: true
        }
      });

    console.log(
      `New curriculum question count: ${totalCount}`
    );

    console.log(
      'Topic 7 seed completed successfully.'
    );

  } catch (error) {

    console.error(
      'Topic 7 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {

    await client.close();
  }
}


seedReplicaSetFundamentals();
