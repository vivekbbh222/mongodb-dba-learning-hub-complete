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
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 1,
    question:
      'How does a MongoDB replica-set election work internally, and what conditions must be satisfied before a member can become Primary?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `A MongoDB election is the process by which replica-set members choose a new Primary.

An election may happen when:

• the current Primary becomes unavailable
• the Primary steps down
• the replica set is initialized
• topology changes make another election necessary
• a higher-priority member becomes eligible under appropriate conditions

The most important concept is:

A server does not become Primary simply because it is running.

It must participate successfully in the replica-set election process.`,

      coreConcept: `Conceptually:

Primary unavailable
        |
        v
Members detect topology change
        |
        v
Eligible member becomes candidate
        |
        v
Requests votes
        |
        v
Voting majority obtained?
       / \
     NO   YES
     |     |
     v     v
 No      Candidate
Primary  becomes
        PRIMARY`,

      detailedExplanation: `Suppose a replica set contains:

A
B
C

All three are voting data-bearing members.

The current Primary is A.

If B and C stop receiving successful heartbeats from A and determine that an election is required, an eligible member can become an election candidate.

The candidate requests votes from voting members.

With three voting members:

majority = 2.

Therefore a candidate must obtain enough votes to satisfy the majority requirement.

But voting majority alone is not the only consideration.

A member must also be suitable for Primary state.

Important factors include:

• member state
• priority
• voting configuration
• replication freshness
• whether the member is configured as an arbiter
• whether the member is otherwise electable

For example:

A = DOWN
B = SECONDARY, priority 1
C = SECONDARY, priority 0

B can potentially become Primary.

C cannot become Primary because priority 0 makes it non-electable.

MongoDB elections also use terms.

A term represents an election generation.

When a new Primary is elected, the replica set moves into a newer election term.

This helps MongoDB reason about leadership changes and reject stale leadership assumptions.

An important DBA principle is:

Elections are a normal HA mechanism.

Repeated or unexpected elections are not normal and should be investigated as symptoms of network, resource, storage, or topology instability.`,

      internalWorking: `Normal:

A PRIMARY
B SECONDARY
C SECONDARY

A becomes unavailable

        |
        v

Heartbeat failure detected

        |
        v

Election required

        |
        v

B becomes candidate

        |
        v

Votes requested

        |
        v

Majority obtained

        |
        v

B PRIMARY


Election term increases as leadership changes.`,

      architecture: `Before:

           A
        PRIMARY
        /     \
       v       v
      B         C
 SECONDARY  SECONDARY


Failure:

           A
          DOWN

      B <-----> C
        election


After:

           B
        PRIMARY
           |
           v
           C
       SECONDARY`,

      examples: [
        `Three voters:

A = 1 vote
B = 1 vote
C = 1 vote

Majority = 2.`,

        `Five voters:

Majority = 3.`,

        `A member configured with priority: 0 may vote but cannot become Primary.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows current member states and election-related replica-set information.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Shows votes and priorities that influence election behavior.'
        },
        {
          command:
            'db.hello()',
          explanation:
            'Shows the member view of the current Primary and replica-set topology.'
        }
      ],

      productionScenario: `A three-node production replica set loses its Primary.

The remaining two Secondaries can communicate.

One has:

priority: 1

and the other:

priority: 0.

The priority-1 member can become a candidate and obtain the votes needed for majority.

It becomes Primary.

The priority-0 member participates in voting but cannot itself become Primary.

This is why DBAs must understand both:

voting eligibility

and:

Primary electability.`,

      troubleshootingApproach: `For an unexpected election:

1. Record the exact election timestamp.

2. Check rs.status().

3. Check rs.conf().

4. Identify the previous Primary.

5. Identify the new Primary.

6. Review member priorities and votes.

7. Check heartbeat failures.

8. Review mongod logs around the election.

9. Check network latency/loss.

10. Check CPU stalls.

11. Check disk latency.

12. Check VM or OS events.

13. Check replication lag.

14. Determine why the election was triggered rather than treating the election itself as the root cause.`,

      commonMistakes: [
        'Assuming the highest-priority member always instantly becomes Primary.',
        'Confusing a voting member with an electable member.',
        'Treating every election as a MongoDB failure.',
        'Ignoring the network when elections repeat.',
        'Restarting members before preserving election evidence.'
      ],

      bestPractices: [
        'Maintain an odd number of voting members where appropriate.',
        'Keep multiple healthy electable data-bearing members.',
        'Monitor election frequency.',
        'Monitor heartbeat and network failures.',
        'Investigate every unexpected production election.'
      ],

      interviewAnswer: `A MongoDB election occurs when the replica set needs a Primary. An eligible member becomes a candidate and requests votes from voting members. It must obtain voting majority and satisfy Primary electability requirements such as member state and priority.

I also distinguish between a normal failover election and repeated unexpected elections. Repeated elections usually indicate an underlying network, storage, resource, or topology problem that needs investigation.`,

      keyTakeaways: [
        'Elections select the replica-set Primary.',
        'Voting majority is required.',
        'Not every voter is electable.',
        'Priority affects Primary eligibility and preference.',
        'Repeated elections require root-cause analysis.'
      ]
    }
  },


  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 2,
    question:
      'What are election terms in MongoDB, and why are terms important for maintaining a consistent replica-set leadership history?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `A term is a logical election generation.

You can think of it as a leadership era.

Example:

Term 10:
A is Primary.

A fails.

Election occurs.

Term 11:
B becomes Primary.

The newer term tells replica-set members that leadership has moved forward.`,

      coreConcept: `Timeline:

Term 10
A PRIMARY

      |
      | failure
      v

Election

      |
      v

Term 11
B PRIMARY

      |
      | another election
      v

Term 12
C PRIMARY


Higher term = newer election generation.`,

      detailedExplanation: `Distributed systems need a way to distinguish current leadership from stale leadership.

Imagine:

A was Primary.

A becomes isolated because of a network problem.

Meanwhile the majority side of the replica set elects B as the new Primary.

If A later reconnects, it must recognize that a newer leadership generation exists.

Election terms help represent that progression.

Conceptually:

term 20:
A was Primary.

term 21:
B became Primary.

A member observing term 21 knows that leadership information associated with term 20 is older.

Terms therefore help MongoDB maintain ordering across elections.

You may encounter term-related information in:

• replica-set status
• oplog entries
• election diagnostics
• mongod logs

For a DBA, terms become particularly useful during incident reconstruction.

Suppose monitoring reports:

Primary changed three times.

By examining:

• election timestamps
• terms
• logs
• member states

you can reconstruct the leadership sequence.

Terms should not be manually manipulated.

They are part of MongoDB's internal replication/election coordination.`,

      internalWorking: `Term 5
A PRIMARY
   |
   X
failure

Election

Term 6
B PRIMARY

A returns
   |
   v
Observes newer term
   |
   v
Cannot continue using stale
Primary assumption from term 5.`,

      architecture: `Replica-set leadership history:

Term 100
   |
   +--> A Primary
   |
   v
Term 101
   |
   +--> B Primary
   |
   v
Term 102
   |
   +--> C Primary

Each election advances leadership history.`,

      examples: [
        `Election timeline example:

10:00 - A Primary - term 30

10:15 - election

10:16 - B Primary - term 31`,

        `A later election may move the set to term 32.`,

        `Terms are useful when correlating election events in mongod logs.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Can expose election and term-related information useful during troubleshooting.'
        },
        {
          command:
            'db.hello()',
          explanation:
            'Shows the current topology view from the connected member.'
        }
      ],

      productionScenario: `A network incident causes several Primary transitions within ten minutes.

Instead of only saying:

"The Primary changed several times,"

the DBA correlates:

• election timestamps
• election terms
• heartbeat failures
• network alerts
• Primary identities

This establishes the exact leadership sequence and helps determine whether the event was one clean failover or repeated topology instability.`,

      troubleshootingApproach: `During election analysis:

1. Capture rs.status().

2. Identify current Primary.

3. Record election timestamp.

4. Inspect mongod logs.

5. Track term changes.

6. Map each term to the corresponding Primary.

7. Correlate term changes with heartbeat/network/resource events.

8. Determine why each election occurred.

Do not attempt to manually alter term values.`,

      commonMistakes: [
        'Thinking term means MongoDB version.',
        'Thinking term is a timer.',
        'Ignoring terms when reconstructing multiple elections.',
        'Trying to manually modify replication terms.'
      ],

      bestPractices: [
        'Use terms as part of election timeline analysis.',
        'Correlate terms with Primary changes.',
        'Preserve logs during HA incidents.',
        'Focus on why elections occurred.'
      ],

      interviewAnswer: `A term represents an election generation in a MongoDB replica set. When leadership changes through an election, the replica set moves to a newer term.

Terms help distinguish newer leadership from stale leadership and are useful when reconstructing failover timelines and understanding which Primary belonged to which election generation.`,

      keyTakeaways: [
        'Terms represent election generations.',
        'Newer terms represent newer leadership history.',
        'Terms help prevent stale leadership assumptions.',
        'They are useful for incident analysis.',
        'MongoDB manages terms internally.'
      ]
    }
  },


  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 3,
    question:
      'What is the majority commit point in MongoDB replication, and how is it different from simply writing data on the Primary?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `A write existing on the Primary and a write being majority committed are not the same concept.

Primary-local write:

The Primary has accepted and applied the operation.

Majority committed:

The operation has progressed far enough through the replica set to satisfy MongoDB's majority commit semantics.

This distinction is fundamental to durability and failover behavior.`,

      coreConcept: `Conceptually:

Client write
     |
     v
PRIMARY
applies write
     |
     v
Oplog entry
     |
     +----------+
     |          |
     v          v
Secondary B  Secondary C
     |
     v
Majority replication progress
     |
     v
Majority commit point advances`,

      detailedExplanation: `Suppose a three-voting-member replica set contains:

A Primary
B Secondary
C Secondary

A accepts operation X.

At this point:

A has X.

That alone does not mean X has reached the replica set's majority commit point.

As replication progresses, another voting data-bearing member acknowledges durable progress for the relevant operation.

Once the required majority conditions are satisfied, the majority commit point can advance.

The majority commit point therefore represents a boundary in replication history that has stronger durability characteristics than operations existing only on one member.

This becomes especially important during failover.

Example:

Operation X exists only on old Primary A.

A fails before X becomes sufficiently replicated.

B and C elect a new Primary whose history does not include X.

X may not survive the topology change.

Compare that with an operation that has reached majority commit semantics.

It has stronger protection because the authoritative replica-set history has progressed beyond that operation across the required members.

DBAs should therefore avoid describing:

"write completed on Primary"

as equivalent to:

"write is safely replicated according to majority semantics."

They are different milestones.`,

      internalWorking: `Operation sequence:

X1
X2
X3
X4
X5

Primary:
X1 X2 X3 X4 X5

Secondary B:
X1 X2 X3 X4

Secondary C:
X1 X2 X3

Conceptually, the replica set determines
how far the majority has safely progressed.

That boundary is the majority commit point.`,

      architecture: `             PRIMARY A
          X1 X2 X3 X4 X5
                |
        +-------+-------+
        |               |
        v               v
 SECONDARY B       SECONDARY C
 X1 X2 X3 X4       X1 X2 X3

        \               /
         \             /
          v           v

      Majority progress
             |
             v
      Commit point advances`,

      examples: [
        `A write present only on the Primary has weaker failover durability than a majority-committed write.`,

        `The majority commit point moves as voting data-bearing members make durable replication progress.`,

        `Majority commit semantics are central to majority read/write guarantees.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Provides replication optime information that helps DBAs understand member replication progress.'
        }
      ],

      productionScenario: `A financial application reports that several writes were acknowledged shortly before a Primary failure.

The DBA cannot determine durability merely by checking whether the old Primary had accepted them.

The investigation must consider:

• write concern
• replication state
• failover timeline
• whether operations were majority committed

This distinction determines whether the application had requested a durability guarantee capable of surviving the failover scenario.`,

      troubleshootingApproach: `For suspected write loss around failover:

1. Establish exact write timestamps.

2. Establish election/failure timestamp.

3. Determine application write concern.

4. Check replication lag before failure.

5. Review mongod logs.

6. Identify old and new Primary.

7. Determine whether divergent history/rollback occurred.

8. Distinguish Primary-local acknowledgement from majority durability.

9. Validate current authoritative data.

10. Coordinate application reconciliation if required.`,

      commonMistakes: [
        'Assuming a Primary-local write is automatically majority committed.',
        'Assuming replication means all members are always identical at every instant.',
        'Ignoring write concern during failover analysis.',
        'Confusing acknowledgement with the strongest possible durability.'
      ],

      bestPractices: [
        'Match write concern to business durability requirements.',
        'Monitor replication lag.',
        'Understand majority commit semantics before designing HA guarantees.',
        'Include write concern in failover testing.'
      ],

      interviewAnswer: `The majority commit point represents how far the replica set's operation history has progressed according to majority replication semantics.

A write being applied on the Primary is an earlier milestone. It may still exist only on that member. This distinction matters during failover because operations that have not achieved sufficient replication can have weaker durability than majority-committed operations.`,

      keyTakeaways: [
        'Primary-local and majority-committed are different states.',
        'The commit point reflects majority replication progress.',
        'It is important for failover durability.',
        'Write concern determines what the client waits for.',
        'DBAs must understand this when analyzing write-loss incidents.'
      ]
    }
  },


  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 4,
    question:
      'How does writeConcern: "majority" work in a MongoDB replica set, and what availability and latency trade-offs does it introduce?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `Write concern tells MongoDB what acknowledgement condition must be satisfied before a write is reported as successful.

Example:

{ w: "majority" }

means the application requests acknowledgement according to majority write concern semantics.

The purpose is stronger durability across replica-set failover.`,

      coreConcept: `Client
   |
   | write
   v
Primary
   |
   | replicate
   v
Replica-set members
   |
   | majority condition satisfied
   v
Acknowledgement
   |
   v
Client receives success`,

      detailedExplanation: `Compare two conceptual cases.

CASE 1 — weaker acknowledgement

The client receives success after the Primary accepts the operation according to the selected write concern.

If the Primary fails before the operation is sufficiently replicated, durability may be weaker.

CASE 2 — majority write concern

The client waits for the majority write concern requirement.

This provides stronger protection against acknowledged writes disappearing during normal replica-set failover scenarios.

But stronger durability has trade-offs.

LATENCY

The client may need to wait for replication-related progress beyond the local Primary operation.

If replica-set members or storage are slow, write latency may increase.

AVAILABILITY

Suppose a three-voting-member replica set loses enough members that majority acknowledgement can no longer be satisfied.

The Primary might still be temporarily visible during topology transitions, but majority writes cannot simply ignore the missing majority.

This is intentional.

MongoDB prefers not to claim the requested durability guarantee when the topology cannot provide it.

TIMEOUTS

Applications commonly combine write concern with appropriate timeout behavior so they do not wait indefinitely for an unavailable acknowledgement condition.

The exact durability/acknowledgement behavior also depends on options such as journaling and MongoDB version/configuration, so production guarantees should be designed from the documented behavior of the deployed version rather than oversimplified rules.`,

      internalWorking: `Client
  |
  v
Primary writes X
  |
  +-------> Secondary B
  |
  +-------> Secondary C

Required majority condition
satisfied
  |
  v
Client receives acknowledgement


If required members cannot make progress:

Client waits / eventually receives
write concern timeout or failure
according to configuration.`,

      architecture: `                 CLIENT
                    |
                    v
                 PRIMARY
                    |
            +-------+-------+
            |               |
            v               v
       SECONDARY       SECONDARY

       Majority acknowledgement
               |
               v
             CLIENT`,

      examples: [
        `Example write concern:

db.orders.insertOne(
  { orderId: 1001 },
  {
    writeConcern: {
      w: "majority"
    }
  }
)`,

        `A timeout can be used so the client does not wait indefinitely for the requested write concern.`,

        `Critical business writes often require stronger durability than disposable telemetry data.`
      ],

      commands: [
        {
          command:
            'db.orders.insertOne({orderId:1001}, {writeConcern:{w:"majority", wtimeout:5000}})',
          explanation:
            'Illustrates a majority write concern with a bounded wait for acknowledgement.'
        },
        {
          command:
            'db.adminCommand({ getDefaultRWConcern: 1 })',
          explanation:
            'Can be used where supported/appropriate to inspect configured default read/write concern behavior.'
        }
      ],

      productionScenario: `A payment service previously used a weak acknowledgement policy.

During a failover, business owners discover that acknowledging a write only at the old Primary does not match their durability requirement.

They move critical payment-state changes to majority write concern.

Afterward write latency increases slightly because acknowledgement now requires stronger replica-set progress.

The business accepts the latency cost because durability is more important for that workload.`,

      troubleshootingApproach: `If majority writes become slow:

1. Check replication lag.

2. Check member health.

3. Check voting topology.

4. Check disk latency on replica-set members.

5. Check network latency.

6. Check Primary write rate.

7. Check WiredTiger pressure.

8. Check flow control.

9. Check write concern timeout errors.

10. Determine whether the issue is application latency or inability to satisfy majority.

11. Do not weaken write concern blindly just to hide infrastructure problems.`,

      commonMistakes: [
        'Assuming majority means every replica-set member.',
        'Using majority without understanding latency requirements.',
        'Weakening write concern during incidents without assessing durability impact.',
        'Ignoring Secondary storage/network performance.',
        'Treating wtimeout as a rollback of the write itself.'
      ],

      bestPractices: [
        'Choose write concern from business durability requirements.',
        'Test majority-write latency under realistic load.',
        'Monitor replication health.',
        'Use appropriate timeout handling.',
        'Do not trade away durability merely to hide performance issues.'
      ],

      interviewAnswer: `With writeConcern majority, the client waits for acknowledgement according to the replica set's majority write concern semantics rather than relying only on the Primary-local write.

This improves failover durability, but it can increase latency and depends on sufficient replica-set health to satisfy the requested acknowledgement. If majority progress is impaired, writes may wait or return write-concern errors depending on timeout configuration.`,

      keyTakeaways: [
        'Majority write concern improves durability.',
        'Majority does not mean every member.',
        'Stronger acknowledgement can increase latency.',
        'Replica-set health affects majority-write performance.',
        'Durability should not be weakened casually.'
      ]
    }
  },


  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 5,
    question:
      'What is readConcern "majority", and how does it relate to the majority commit point and consistent reads during failover?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `Read concern controls the consistency/isolation characteristics requested by a read.

readConcern:

{ level: "majority" }

requests data from the majority-committed view rather than simply reading the newest locally visible state without that guarantee.`,

      coreConcept: `Writes progress:

Primary local state
       |
       v
Replication
       |
       v
Majority commit point
       |
       v
Majority-committed view
       |
       v
readConcern: "majority"`,

      detailedExplanation: `The important relationship is:

majority commit point

defines a durable replication boundary.

readConcern "majority"

uses majority-committed data visibility semantics.

Why does this matter?

Imagine an operation exists on a Primary but has not yet reached the majority-committed history.

If a client reads purely local state, it may observe data whose durability across a subsequent failover is weaker.

A majority read is designed around the majority-committed view.

This is useful for applications that do not want to observe certain data and then have that data disappear from the authoritative history after a normal failover.

However, read concern should not be taught as:

"majority means read from the majority of servers."

That is incorrect.

The read is still served by a selected member.

The term majority refers to the consistency semantics of the data being read, not to the client querying multiple servers and comparing their answers.

Read concern also interacts with:

• read preference
• write concern
• transactions
• causally consistent sessions
• workload latency requirements

Those interactions should be evaluated according to the application's consistency model.`,

      internalWorking: `Primary operations:

A B C D E

Majority commit point:

A B C D

Local newest state:
A B C D E

Majority-committed view:
A B C D

readConcern majority
operates against the appropriate
majority-committed visibility.`,

      architecture: `             REPLICA SET
                  |
                  v
          Replication progress
                  |
                  v
        Majority commit point
                  |
                  v
       Majority-visible history
                  |
                  v
        readConcern: majority`,

      examples: [
        `Example:

db.orders.find(
  { status: "PAID" }
).readConcern("majority")`,

        `Conceptually, majority read concern is about committed visibility, not querying multiple servers.`,

        `Read preference determines which eligible member is selected; read concern determines requested read consistency semantics.`
      ],

      commands: [
        {
          command:
            'db.orders.find({status:"PAID"}).readConcern("majority")',
          explanation:
            'Illustrates requesting majority read concern for a query.'
        }
      ],

      productionScenario: `An application reads a business-state transition immediately after writes and relies on that observed state for downstream processing.

The architecture team wants the observed state to have stronger protection against disappearing after normal failover.

The DBA evaluates:

• majority write concern
• majority read concern
• session/transaction requirements

rather than simply routing reads to a Secondary and calling that "consistent."`,

      troubleshootingApproach: `For consistency complaints:

1. Determine read concern.

2. Determine write concern.

3. Determine read preference.

4. Determine which member served the read.

5. Check replication lag.

6. Check failover timeline.

7. Determine whether the original write was majority committed.

8. Check transaction/session behavior if relevant.

9. Reconstruct the application's expected consistency guarantee.

10. Avoid using vague terms such as "replication issue" without identifying the exact guarantee that was expected.`,

      commonMistakes: [
        'Thinking majority reads query most members.',
        'Confusing read concern with read preference.',
        'Assuming Secondary reads are automatically strongly consistent.',
        'Ignoring the write concern of the data being read.'
      ],

      bestPractices: [
        'Design read and write concerns together.',
        'Document application consistency requirements.',
        'Understand read preference separately from read concern.',
        'Test consistency behavior during failover.'
      ],

      interviewAnswer: `readConcern majority requests a majority-committed view of data. It is tied to the replica set's majority commit point.

It does not mean MongoDB sends the read to multiple servers and compares results. Read preference selects the member, while read concern defines the requested consistency semantics of the data returned.`,

      keyTakeaways: [
        'Majority read concern uses majority-committed visibility.',
        'It does not query a majority of servers.',
        'Read concern and read preference are different.',
        'Read and write concerns should be designed together.',
        'Failover behavior depends on the requested consistency model.'
      ]
    }
  },


  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 6,
    question:
      'How do member priority and votes work together in MongoDB, and how should a DBA design them for high availability?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `Priority and votes control different things.

votes:

Does the member participate in replica-set voting?

priority:

Can the member become Primary, and how strongly is it preferred relative to other eligible members?

They should never be treated as the same setting.`,

      coreConcept: `Member configuration:

votes
 |
 +--> Election voting participation
 |
 +--> Majority calculation


priority
 |
 +--> Primary electability
 |
 +--> Relative Primary preference


Important:

priority = 0
means non-electable.

A priority-0 member may still have a vote.`,

      detailedExplanation: `Example:

A:
votes 1
priority 2

B:
votes 1
priority 1

C:
votes 1
priority 0

All three can participate in voting.

But only:

A
B

are electable.

C cannot become Primary because priority is zero.

PRIORITY

Higher priority makes a member more preferred for Primary state, but it should not be described as a permanent guarantee.

Replication state and election conditions still matter.

VOTES

Votes determine participation in elections and contribute to majority calculations.

A poor voting design can reduce availability.

Example:

A
B

both voting members.

Total votes:
2

Majority:
2.

If either member is unavailable, the remaining single member cannot obtain majority by itself.

This is why production replica sets commonly use an odd number of voting members.

NON-VOTING MEMBERS

Special-purpose members may sometimes be configured without a vote.

However, voting design must respect MongoDB's supported configuration rules and should be based on availability requirements rather than arbitrary preference.

DBAs should ask:

• Which members should be able to become Primary?
• Which failure domains contain voters?
• What happens if one site fails?
• Does the remaining topology retain majority?
• Are enough electable members still available?`,

      internalWorking: `                 Member
                   |
          +--------+--------+
          |                 |
          v                 v
        votes            priority
          |                 |
          v                 v
     Can vote?        Can become Primary?
          |                 |
          v                 v
 Majority math      Election preference`,

      architecture: `Example:

A
votes:1
priority:2
   |
   +---- electable


B
votes:1
priority:1
   |
   +---- electable


C
votes:1
priority:0
   |
   +---- voter
   |
   +---- NOT electable`,

      examples: [
        `Inspect:

rs.conf().members`,

        `Example member:

{
  _id: 2,
  host: "mongo3:27017",
  priority: 0,
  votes: 1
}`,

        `This member votes but cannot become Primary.`
      ],

      commands: [
        {
          command:
            'rs.conf().members.forEach(m => printjson({host:m.host, priority:m.priority, votes:m.votes}))',
          explanation:
            'Provides a concise view of voting and Primary eligibility configuration.'
        }
      ],

      productionScenario: `A company has:

Primary-capable servers in Site A

and:

a reporting Secondary in Site B.

The reporting member should never become Primary.

It may be configured with:

priority: 0.

But the DBA must still analyze whether it should vote because votes affect majority and site-failure behavior.

Changing priority solves electability.

It does not automatically solve voting topology.`,

      troubleshootingApproach: `For election-design review:

1. List all members.

2. Record votes.

3. Record priorities.

4. Identify priority-0 members.

5. Count total voters.

6. Calculate majority.

7. Identify electable members.

8. Model loss of each member.

9. Model loss of each availability zone/site.

10. Verify surviving voters retain majority.

11. Verify surviving topology contains an electable member.

12. Review application connectivity to possible Primaries.`,

      commonMistakes: [
        'Thinking priority 0 means votes 0.',
        'Thinking votes 0 automatically means priority 0.',
        'Using two voting members for HA without understanding majority.',
        'Assigning high priority without considering failure domains.',
        'Changing votes during an outage without calculating majority.'
      ],

      bestPractices: [
        'Design votes around failure domains.',
        'Maintain sufficient electable members.',
        'Use priority 0 intentionally.',
        'Model failures before production deployment.',
        'Keep voting configuration simple unless there is a clear requirement.'
      ],

      interviewAnswer: `Votes and priority solve different problems. Votes determine election participation and majority calculations, while priority determines Primary electability and relative preference.

For HA design, I calculate majority under member and site failures and separately confirm that the surviving majority side contains at least one healthy electable member.`,

      keyTakeaways: [
        'Votes affect majority.',
        'Priority affects electability.',
        'Priority 0 members cannot become Primary.',
        'A voter can still have priority 0.',
        'HA design must consider both majority and electability.'
      ]
    }
  },


  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 7,
    question:
      'What are hidden replica-set members, when should they be used, and what operational limitations should a DBA understand?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `A hidden member is a replica-set member configured so normal client discovery does not select it for ordinary application reads.

Hidden members are commonly used for special operational workloads such as:

• dedicated backup workloads
• reporting or analytics isolation
• special-purpose replicated copies

A hidden member must also be non-electable.`,

      coreConcept: `Normal members:

Application
   |
   +--> Primary
   |
   +--> eligible Secondaries


Hidden member:

Application normal discovery
          X
          |
          v
      HIDDEN MEMBER

Still receives replication
from replica set.`,

      detailedExplanation: `A hidden member remains part of replication.

It maintains a copy of the dataset and continues following the replica-set history.

But it is hidden from normal client selection.

A typical hidden member configuration includes:

hidden: true
priority: 0

Priority must be zero because a hidden member should not become Primary.

Possible use cases:

1. BACKUP

A backup workload can be isolated from normal application-serving members.

2. ANALYTICS

Heavy reporting can be directed intentionally to a dedicated member rather than impacting application-facing Secondaries.

3. SPECIAL OPERATIONAL COPY

A hidden member can serve specialized administrative requirements.

However, hidden does NOT mean:

• free
• isolated from replication
• zero impact
• automatically safe for any workload

It still:

• stores the full dataset
• maintains indexes
• consumes disk
• consumes CPU
• consumes memory
• receives replication traffic
• can develop replication lag

If a backup or reporting query overloads the hidden member, it may fall behind.

Depending on whether it is voting and on the broader configuration, lagging special-purpose members can also have implications for replica-set behavior.

Therefore hidden members should be monitored like any other production database server.`,

      internalWorking: `Primary
   |
   +----------+
   |          |
   v          v
Secondary   Hidden
              |
              +--> replication continues
              |
              +--> full data copy
              |
              +--> indexes maintained
              |
              X
       normal client selection`,

      architecture: `             PRIMARY
                |
        +-------+-------+
        |               |
        v               v
   SECONDARY         HIDDEN
                        |
                 priority: 0
                        |
                backup/reporting
                    workload`,

      examples: [
        `Conceptual configuration:

{
  _id: 3,
  host: "backup-db:27017",
  priority: 0,
  hidden: true
}`,

        `Hidden members remain visible to replica-set administration even though normal application discovery does not select them.`,

        `They still require monitoring for lag and resource saturation.`
      ],

      commands: [
        {
          command:
            'cfg = rs.conf()',
          explanation:
            'Loads the current replica-set configuration before modifying a special-purpose member.'
        },
        {
          command:
            'cfg.members[3].priority = 0; cfg.members[3].hidden = true; rs.reconfig(cfg)',
          explanation:
            'Illustrates the configuration concept. The exact member index must be verified before any production change.'
        }
      ],

      productionScenario: `A company runs a large nightly backup from a normal Secondary.

During the backup:

• disk latency increases
• replication lag increases
• application reads using secondaryPreferred become slower

The company adds a dedicated hidden member for the backup workload.

This isolates the application-facing Secondary from backup reads.

However, the hidden member is still monitored for:

• lag
• disk
• CPU
• memory
• backup duration

because hidden does not mean resource-free.`,

      troubleshootingApproach: `For a lagging hidden member:

1. Check rs.status().

2. Measure lag.

3. Check backup/reporting activity.

4. Check disk latency.

5. Check CPU.

6. Check memory/cache.

7. Check network.

8. Check oplog window.

9. Determine whether workload should be throttled/rescheduled.

10. Review whether the member's voting configuration is appropriate.

11. Do not ignore the server simply because applications do not normally read from it.`,

      commonMistakes: [
        'Thinking hidden members do not replicate.',
        'Forgetting priority must be zero.',
        'Running unlimited reporting workloads on them.',
        'Ignoring their replication lag.',
        'Assuming hidden automatically means non-voting.'
      ],

      bestPractices: [
        'Use hidden members for clearly defined workloads.',
        'Set priority correctly.',
        'Monitor them like production members.',
        'Protect their oplog catch-up capability.',
        'Review whether voting is appropriate for their role.'
      ],

      interviewAnswer: `A hidden member is a special-purpose replica-set member that continues replicating but is hidden from normal client discovery and selection. It must be non-electable, so its priority is zero.

I use hidden members for workloads such as backup or dedicated reporting, but I still monitor disk, CPU, memory, and replication lag because they maintain the complete dataset and can fall behind.`,

      keyTakeaways: [
        'Hidden members still replicate.',
        'They must have priority 0.',
        'They are useful for special workloads.',
        'They still consume full resources.',
        'Hidden does not automatically mean non-voting.'
      ]
    }
  },


  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 8,
    question:
      'What is a delayed replica-set member, how does secondaryDelaySecs work, and when can delayed replication help with operational recovery?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `A delayed member intentionally applies replicated operations later than normal.

Example:

secondaryDelaySecs: 3600

means the member intentionally remains approximately one hour behind in applying operations.

The goal is not high availability for normal reads.

The goal is to preserve an older logical view of data for a limited recovery window.`,

      coreConcept: `Primary:

10:00
10:30
11:00
11:30


Delayed member:

configured delay = 1 hour

At 11:30,
it may be applying operations
from around 10:30.


This creates an intentional time gap.`,

      detailedExplanation: `Consider an accidental command:

db.customers.deleteMany({})

executed at:

11:00.

Normal Secondaries may replicate that delete quickly.

A delayed member configured with a one-hour delay may not apply the delete until approximately:

12:00.

That gives the DBA a limited opportunity to intervene before the destructive operation reaches the delayed member.

However, delayed replication is NOT a replacement for:

• backups
• snapshots
• point-in-time recovery
• access controls
• change management

There are several operational considerations.

1. THE DELAY IS INTENTIONAL LAG

Monitoring must distinguish configured delay from unhealthy replication lag.

2. THE MEMBER SHOULD NOT BECOME PRIMARY

A delayed member is normally configured non-electable.

3. APPLICATIONS SHOULD NOT USE IT AS A NORMAL READ REPLICA

Its data is intentionally old.

4. RECOVERY REQUIRES PROCEDURE

If destructive operations occur, the DBA must prevent the delayed member from eventually applying them before using it for recovery.

5. DELAY WINDOW IS LIMITED

If the problem is discovered after the delay period has passed, the destructive operation may already have been applied.

A delayed member is therefore an additional recovery mechanism, not a complete DR strategy.`,

      internalWorking: `Primary oplog:

T1 T2 T3 T4 T5 T6

Normal Secondary:

applies through T6


Delayed Secondary:

receives/retains replication history
but intentionally applies only
through an older point according
to configured delay.`,

      architecture: `              PRIMARY
                 |
        +--------+--------+
        |                 |
        v                 v
 NORMAL SECONDARY    DELAYED MEMBER
 current-ish data      older view
                           |
                     delay = 1 hour
                           |
                     recovery option`,

      examples: [
        `Conceptual member configuration:

{
  _id: 3,
  host: "delayed:27017",
  priority: 0,
  hidden: true,
  secondaryDelaySecs: 3600
}`,

        `One-hour delay:

secondaryDelaySecs: 3600`,

        `Six-hour delay:

secondaryDelaySecs: 21600`
      ],

      commands: [
        {
          command:
            'rs.conf()',
          explanation:
            'Used to inspect delayed-member configuration.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used to monitor the member state and replication position.'
        }
      ],

      productionScenario: `At 14:05, an administrator accidentally deletes critical records.

Normal Secondaries apply the operation almost immediately.

A hidden delayed member is configured with:

secondaryDelaySecs: 7200

so it has not yet applied the 14:05 operation.

The DBA follows the documented recovery procedure to preserve the delayed copy before the destructive operation reaches it.

The delayed member provides an additional recovery source.

But the organization still maintains normal backups and PITR because delayed replication alone cannot protect against every failure mode.`,

      troubleshootingApproach: `For delayed-member operations:

1. Confirm configured secondaryDelaySecs.

2. Distinguish expected delay from additional unhealthy lag.

3. Monitor oplog window.

4. Monitor disk/network.

5. Keep the member non-electable.

6. Keep it away from normal application reads.

7. Document emergency recovery procedure.

8. If destructive activity occurs, act before the delay expires.

9. Preserve the recovery copy before allowing further replication.

10. Validate recovered data separately.`,

      commonMistakes: [
        'Treating delayed members as backups.',
        'Allowing them to become Primary.',
        'Serving normal application reads from intentionally stale data.',
        'Ignoring extra lag beyond the configured delay.',
        'Discovering the incident after the delay window expires.'
      ],

      bestPractices: [
        'Use delayed replication only as an additional recovery layer.',
        'Keep delayed members hidden and non-electable where appropriate.',
        'Maintain independent backups/PITR.',
        'Alert separately on unexpected lag beyond configured delay.',
        'Document recovery procedures before an incident.'
      ],

      interviewAnswer: `A delayed member intentionally applies replication operations later using secondaryDelaySecs. It can provide a temporary older copy of the dataset, which may help recover from accidental logical changes such as mass deletion.

I treat it only as an additional recovery mechanism. It should generally be non-electable, isolated from normal application reads, monitored carefully, and used alongside proper backup and PITR.`,

      keyTakeaways: [
        'Delayed members intentionally maintain older data.',
        'secondaryDelaySecs controls the delay.',
        'They can help with logical-error recovery.',
        'They are not substitutes for backups or PITR.',
        'Recovery must occur before the destructive operation is applied.'
      ]
    }
  },


  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 9,
    question:
      'How does MongoDB choose a replication sync source, what is chaining, and how can sync-source selection affect replication lag?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `A Secondary needs another replica-set member from which it can obtain replication data.

That member is its sync source.

A Secondary does not necessarily fetch directly from the Primary at all times.

It may synchronize through another suitable Secondary.

This behavior is commonly called chaining.`,

      coreConcept: `Without chaining:

           PRIMARY
          /       \
         v         v
       SEC B     SEC C


With chaining:

PRIMARY
   |
   v
 SEC B
   |
   v
 SEC C


C obtains replication data
through B.`,

      detailedExplanation: `MongoDB automatically evaluates potential sync sources according to replication rules and member conditions.

The exact selection behavior is version-dependent and should not be reduced to a single simplistic ranking formula.

Important factors can include:

• member reachability
• replication freshness
• topology
• ping/network characteristics
• whether a potential source has the required oplog history
• configuration such as chaining behavior

WHY CHAINING CAN HELP

Consider geographically distributed members.

Primary:
Mumbai

Secondary B:
Singapore

Secondary C:
Singapore

It may be more efficient for C to synchronize through B rather than independently fetching everything across the longer network path from Mumbai.

WHY IT CAN HURT

Suppose:

C syncs from B.

B itself becomes heavily lagged.

C can then be affected because its upstream source is unhealthy or behind.

Therefore, when troubleshooting lag, checking only:

Primary -> Secondary

may miss the actual replication path.

The DBA should identify:

Who is this member syncing from?

and:

Is that source healthy?

MongoDB can change sync sources automatically as conditions change.

DBAs should therefore monitor behavior and root causes rather than assuming a permanently fixed source.`,

      internalWorking: `Primary A
   |
   v
Secondary B
   |
   v
Secondary C


If B slows:

A current
|
B 10 min behind
|
C may also lag because its
upstream path depends on B.


C may later select another
suitable source depending on
replica-set conditions.`,

      architecture: `Region 1                     Region 2

PRIMARY A  -----------------> SECONDARY B
                                  |
                                  |
                                  v
                             SECONDARY C


Chaining can reduce
cross-region replication paths,
but source health matters.`,

      examples: [
        `Check status:

rs.status()`,

        `Review member sync-source information where exposed by status/logs.`,

        `Check whether a lagging member is syncing from another lagging Secondary.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Provides replica-set state information and may expose sync-source-related information depending on version/output.'
        },
        {
          command:
            'rs.conf().settings',
          explanation:
            'Can be reviewed for replica-set settings such as chaining configuration.'
        }
      ],

      productionScenario: `A replica set has:

A Primary
B Secondary
C Secondary

C develops 40 minutes of lag.

Network from C to A looks healthy.

The DBA discovers that C has been synchronizing through B.

B has 35 minutes of lag because its storage is saturated.

Therefore C's lag is not caused by its direct path to the Primary.

The upstream sync source B is the real dependency.

This is why L3 replication troubleshooting includes sync-source analysis.`,

      troubleshootingApproach: `For suspicious sync-source behavior:

1. Check rs.status().

2. Identify lag on every member.

3. Determine the current sync source where available.

4. Check whether the source itself is lagging.

5. Check source disk latency.

6. Check source CPU/memory.

7. Check network path between target and source.

8. Check oplog availability.

9. Review chaining configuration.

10. Inspect mongod logs for sync-source changes.

11. Determine why MongoDB selected or abandoned sources.

12. Fix the unhealthy dependency rather than repeatedly forcing topology changes.`,

      commonMistakes: [
        'Assuming every Secondary always syncs directly from Primary.',
        'Ignoring the health of upstream Secondaries.',
        'Forcing sync-source changes without understanding why lag exists.',
        'Ignoring network topology.',
        'Assuming sync source never changes.'
      ],

      bestPractices: [
        'Understand actual replication paths.',
        'Monitor all members, not just Primary.',
        'Consider network topology in multi-region designs.',
        'Investigate source health during lag incidents.',
        'Allow automatic selection unless there is a justified operational reason to intervene.'
      ],

      interviewAnswer: `A Secondary obtains oplog data from a suitable sync source, which is not necessarily always the Primary. MongoDB can chain replication through another Secondary.

Chaining can be beneficial for network topology, especially across regions, but it also means a lagging or unhealthy upstream Secondary can influence downstream members. During lag troubleshooting I therefore identify the actual sync source and evaluate its health.`,

      keyTakeaways: [
        'Secondaries do not always sync directly from Primary.',
        'Chaining allows Secondary-to-Secondary replication paths.',
        'Upstream lag can affect downstream members.',
        'Sync-source choice can change automatically.',
        'L3 lag analysis includes the complete replication path.'
      ]
    }
  },


  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 10,
    question:
      'What is MongoDB replication flow control, why does it activate, and how can it affect write latency when Secondaries are falling behind?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `Replication flow control is a mechanism that can limit the rate at which the Primary accepts writes when replication is falling too far behind the desired majority-commit progress.

Its purpose is to prevent the Primary from running far ahead of the replica set's ability to replicate operations.`,

      coreConcept: `Without control:

Primary writes very fast
       |
       v
Oplog grows rapidly
       |
       v
Secondaries cannot keep up
       |
       v
Majority commit point falls behind


With flow control:

Replication lag increases
       |
       v
Flow control pressure
       |
       v
Primary write throughput moderated
       |
       v
Secondaries get opportunity
to reduce the gap`,

      detailedExplanation: `Suppose the Primary can process:

20,000 writes/sec.

But due to storage problems the relevant Secondaries can effectively keep up with only:

8,000 writes/sec.

Without any limiting mechanism, the gap between:

Primary latest operation

and:

majority replication progress

can increase rapidly.

MongoDB flow control is designed to moderate Primary write admission when majority-commit lag exceeds the configured target behavior.

This can appear to the application as:

• increased write latency
• lower write throughput
• waits associated with flow control

A common troubleshooting mistake is:

"Primary write latency is high, therefore the Primary is slow."

But the actual causal chain may be:

Secondary disk latency
        |
        v
Secondary replication slows
        |
        v
Majority commit lag increases
        |
        v
Flow control becomes active
        |
        v
Primary writes experience additional waiting

Therefore a slow-write incident can originate from a Secondary.

This is a critical L3 concept.

Flow control should not be disabled casually.

If it is active, investigate why replication cannot maintain the desired progress.

Potential causes:

• slow Secondary disk
• network problems
• CPU saturation
• high write workload
• cache pressure
• overloaded special-purpose member depending on topology
• infrastructure degradation

Exact flow-control metrics and behavior can vary by MongoDB version, so the deployed version's serverStatus output and documentation should be used during production analysis.`,

      internalWorking: `Application
    |
    v
Primary write load
    |
    v
Oplog generation
    |
    v
Secondaries
    |
    | slow apply
    v
Majority commit lag
    |
    v
Flow control
    |
    v
Primary write waits increase`,

      architecture: `                 CLIENT
                    |
                    v
                 PRIMARY
                    |
              Flow Control
                    |
                    v
                  OPLOG
                    |
           +--------+--------+
           |                 |
           v                 v
      SECONDARY B       SECONDARY C
       slow disk          healthy
           |
           v
     replication lag
           |
           v
   majority progress slows`,

      examples: [
        `Inspect server metrics:

db.serverStatus()`,

        `Inspect flow-control-related fields where available:

db.serverStatus().flowControl`,

        `Correlate with:

rs.status()

replication lag

disk latency

write latency`
      ],

      commands: [
        {
          command:
            'db.serverStatus().flowControl',
          explanation:
            'Shows flow-control-related metrics on versions where these fields are exposed.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used to correlate flow-control symptoms with member replication progress.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a quick view of Secondary lag for correlation with write-latency increases.'
        }
      ],

      productionScenario: `An application reports that insert latency increased from:

8 ms

to:

120 ms.

Primary CPU:
40%.

Primary disk latency:
normal.

The DBA initially finds no bottleneck on the Primary.

However:

Secondary B disk latency:
150 ms.

Secondary B replication lag:
rapidly increasing.

Flow-control metrics show increasing pressure.

The causal chain is:

slow Secondary storage
→ replication lag
→ majority commit lag
→ flow control
→ increased Primary write latency.

Restarting the Primary would not solve the root cause.`,

      troubleshootingApproach: `When flow control is suspected:

1. Measure application write latency.

2. Check Primary CPU.

3. Check Primary disk.

4. Check replication lag.

5. Check majority-relevant members.

6. Inspect flow-control metrics.

7. Check Secondary disk latency.

8. Check Secondary CPU.

9. Check Secondary WiredTiger cache.

10. Check network.

11. Check recent workload changes.

12. Check bulk operations.

13. Check oplog generation rate.

14. Correlate timestamps.

15. Fix the replication bottleneck.

16. Confirm lag decreases.

17. Confirm flow-control pressure decreases.

18. Confirm application write latency returns to normal.`,

      commonMistakes: [
        'Blaming only the Primary for slow writes.',
        'Disabling flow control before investigating lag.',
        'Ignoring Secondary storage performance.',
        'Looking at one lag snapshot instead of the trend.',
        'Treating flow control as the root cause instead of a protective response.'
      ],

      bestPractices: [
        'Monitor flow-control metrics with replication lag.',
        'Monitor disk latency on every member.',
        'Capacity-plan Secondaries for the Primary write workload.',
        'Investigate the replication bottleneck before changing flow-control behavior.',
        'Correlate write latency with majority-commit health.'
      ],

      interviewAnswer: `MongoDB flow control can moderate Primary write admission when majority-commit replication progress falls too far behind its target.

This means slow Primary writes can actually originate from Secondary replication problems. I correlate flow-control metrics with replication lag, Secondary disk/CPU/network performance, and Primary write rate. I fix the replication bottleneck rather than simply disabling flow control.`,

      keyTakeaways: [
        'Flow control protects replication progress.',
        'It can increase Primary write latency.',
        'Secondary problems can therefore affect Primary writes.',
        'Flow control is usually a symptom/protective response, not the underlying root cause.',
        'L3 troubleshooting must correlate all replica-set members.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 11,
    question:
      'How does rollback work internally in MongoDB after a divergent Primary rejoins the replica set?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `Rollback happens when a former Primary has operations that are not part of the replica set's current authoritative history.

Example:

A was Primary.

A becomes isolated.

A accepts write X.

Meanwhile B and C elect B as the new Primary.

B accepts writes Y and Z.

When A rejoins, MongoDB discovers:

A history:
... -> X

Current replica-set history:
... -> Y -> Z

A must discard or reconcile its divergent branch and synchronize with the current Primary.`,

      coreConcept: `Conceptually:

Common history
     |
     v
    T100
    /  \
   /    \
  v      v
Old A    New Primary B
 X       Y -> Z
  \      /
   \    /
    v  v
History reconciliation
     |
     v
A rolls back divergent operations
     |
     v
A catches up from current Primary`,

      detailedExplanation: `Rollback is a consequence of distributed-system failover.

Suppose:

A = Primary
B = Secondary
C = Secondary

A becomes partitioned from B and C.

If A temporarily continues with operations that are not sufficiently replicated before losing Primary authority, those operations may exist only on A's branch.

Meanwhile:

B and C still have voting majority.

They elect B.

B continues the authoritative history.

When A reconnects, MongoDB compares replication history to identify a common point.

Operations after that common point that exist only on A are divergent.

A must move back to the common history and then replicate the current authoritative operations.

The DBA should understand three important ideas.

1. ROLLBACK IS NOT BACKUP RESTORE

MongoDB is reconciling replica-set history.

2. WRITE CONCERN MATTERS

Writes acknowledged with weaker durability guarantees can have greater exposure around failover than majority-acknowledged writes.

3. REPEATED ROLLBACK IS A SERIOUS SIGNAL

Rollback may be expected in some failure scenarios, but repeated rollback incidents usually point to:

• network partitions
• unstable infrastructure
• inappropriate topology
• severe replication lag
• operational mistakes.`,

      internalWorking: `Common history:

T1 -> T2 -> T3

Old Primary A:

T1 -> T2 -> T3 -> X -> X2

New Primary B:

T1 -> T2 -> T3 -> Y -> Z

A rejoins
    |
    v
Find common point T3
    |
    v
Rollback divergent X/X2
    |
    v
Apply Y/Z
    |
    v
A becomes consistent Secondary`,

      architecture: `            NETWORK PARTITION

A old Primary                B new Primary
     |                            |
     v                            v
  X -> X2                      Y -> Z
     |                            |
     +----------- rejoin --------+
                  |
                  v
            Common history
                  |
                  v
              Rollback
                  |
                  v
             Catch-up`,

      examples: [
        `Review status:

rs.status()`,

        `Review mongod logs around:

rollback
election
stepdown
heartbeat
network partition`,

        `Reconstruct application writes around the failover window.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Used to inspect current topology and member states after a failover or rollback event.'
        }
      ],

      productionScenario: `A Primary is isolated by a network issue.

Several writes are acknowledged with weak write concern.

The majority side elects a new Primary.

When the isolated member reconnects, it discovers that some of its local writes are not part of the new authoritative history.

Rollback occurs.

The DBA reconstructs:

• exact failover time
• write concern used
• affected operations
• network partition timeline

and works with the application team if business reconciliation is required.`,

      troubleshootingApproach: `1. Preserve logs immediately.

2. Identify old Primary.

3. Identify new Primary.

4. Determine the common failure/election timeline.

5. Check whether network partition occurred.

6. Check replication lag before failover.

7. Review application write concern.

8. Inspect rollback-related log events.

9. Identify potentially divergent operations.

10. Verify current replica-set health.

11. Correct the network/infrastructure cause.

12. Review durability requirements for critical writes.`,

      commonMistakes: [
        'Confusing rollback with restoring from backup.',
        'Assuming every acknowledged write is equally durable.',
        'Deleting logs before analysis.',
        'Ignoring the network partition that caused divergence.',
        'Treating repeated rollbacks as normal.'
      ],

      bestPractices: [
        'Use suitable write concern for critical data.',
        'Monitor network partitions and election frequency.',
        'Preserve incident evidence.',
        'Investigate rollback root cause.',
        'Test failover behavior before production incidents.'
      ],

      interviewAnswer: `Rollback occurs when a former Primary rejoins with operations that are not part of the current authoritative replica-set history.

MongoDB identifies the common history point, removes or reconciles divergent operations on the returning member, and then synchronizes it with the current Primary.

I investigate the election timeline, network partition, replication lag, affected writes, and the write concern used by the application.`,

      keyTakeaways: [
        'Rollback reconciles divergent replica-set history.',
        'It commonly follows failover or partition scenarios.',
        'Write concern influences durability exposure.',
        'Rollback is not backup restore.',
        'Repeated rollback requires RCA.'
      ]
    }
  },


  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 12,
    question:
      'Why can MongoDB initial sync fail repeatedly, and how would you troubleshoot a large initial synchronization in production?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Initial sync can fail when the new member cannot complete the process of:

• copying data
• building indexes
• tracking concurrent changes
• applying required oplog history

within the available resource and replication constraints.

A repeated failure usually means there is an underlying capacity or connectivity problem.`,

      coreConcept: `Initial sync success depends on:

Data size
     +
Network throughput
     +
Disk throughput
     +
Index build time
     +
Write rate
     +
Oplog window
     |
     v
Can sync finish and catch up?`,

      detailedExplanation: `Common causes of repeated initial-sync failure include:

1. OPLOG WINDOW TOO SHORT

Suppose:

Dataset = 3 TB

Copy time = 30 hours

Oplog window = 8 hours

If the member cannot bridge the changes generated while copying, synchronization can fail or restart.

2. SLOW TARGET STORAGE

The target member may not write data and indexes fast enough.

3. NETWORK BOTTLENECK

Low throughput, packet loss, or unstable connectivity can extend synchronization time dramatically.

4. SOURCE MEMBER PRESSURE

The chosen sync source may be overloaded.

5. HIGH WRITE RATE

Large bulk writes can generate oplog history faster than expected.

6. INSUFFICIENT DISK

Initial sync needs sufficient capacity for the dataset and operational overhead.

7. PROCESS RESTART / HOST FAILURE

Any infrastructure instability during a long sync can cause failure.

A DBA should calculate whether the environment is capable of completing initial sync before repeatedly retrying it.

A useful mental model:

Required time to complete sync

must be compatible with:

available replication history

and:

available infrastructure capacity.`,

      internalWorking: `Initial sync begins
      |
      v
Copy dataset
      |
      +--> Primary keeps receiving writes
      |
      v
Build indexes
      |
      v
Apply accumulated oplog
      |
      v
Catch up?
     / \
   NO   YES
   |     |
   v     v
restart  SECONDARY
or fail`,

      architecture: `              SOURCE MEMBER
                    |
            +-------+-------+
            |               |
            v               v
        Data copy       Oplog changes
            |               |
            +-------+-------+
                    |
                    v
               NEW MEMBER
                    |
             Build indexes
                    |
                    v
              Catch up gap
                    |
                    v
                SECONDARY`,

      examples: [
        `Dataset:
2 TB

Sync speed:
100 GB/hour

Base copy:
~20 hours

Oplog window:
6 hours

This is a clear risk.`,

        `Check:

rs.status()

rs.printReplicationInfo()

mongod logs`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows state and progress indicators for the syncing member.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows oplog history window, which is critical during long initial sync.'
        }
      ],

      productionScenario: `A 4 TB Secondary fails initial sync three times.

Each attempt runs for many hours.

The DBA sees:

• no major CPU issue
• target disk throughput is low
• oplog window is only 10 hours
• synchronization requires more than 24 hours

The correct response is not simply:

"restart initial sync again."

The DBA must address:

• storage throughput
• oplog capacity
• write load
• synchronization timing

before retrying.`,

      troubleshootingApproach: `1. Measure dataset size.

2. Measure actual copy rate.

3. Estimate completion time.

4. Check oplog window.

5. Compare estimated sync time with oplog coverage.

6. Check target free disk.

7. Check target disk latency.

8. Check network throughput.

9. Check source member load.

10. Check write rate on Primary.

11. Inspect initial-sync logs.

12. Look for repeated reset/restart patterns.

13. Fix capacity limitation.

14. Retry once conditions are adequate.

15. Monitor until SECONDARY state.`,

      commonMistakes: [
        'Repeatedly retrying without root-cause analysis.',
        'Ignoring oplog window.',
        'Underestimating index build time.',
        'Ignoring source-member pressure.',
        'Starting multiple heavy initial syncs simultaneously.'
      ],

      bestPractices: [
        'Estimate initial-sync duration before starting.',
        'Maintain sufficient oplog history.',
        'Use adequate disk and network throughput.',
        'Monitor source and target resources.',
        'Schedule large syncs carefully.'
      ],

      interviewAnswer: `Repeated initial-sync failure usually indicates the member cannot complete data copy, index creation, and oplog catch-up within available capacity.

I measure dataset size, actual copy speed, disk and network throughput, Primary write rate, source load, and especially the oplog window. I fix the limiting factor before retrying rather than repeatedly restarting the sync.`,

      keyTakeaways: [
        'Initial sync is capacity-sensitive.',
        'Oplog window is a critical dependency.',
        'Disk and network matter heavily.',
        'Large syncs must be estimated in advance.',
        'Repeated retries without diagnosis are ineffective.'
      ]
    }
  },


  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 13,
    question:
      'How should a DBA size and monitor the oplog for a high-write MongoDB replica set?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `Oplog sizing should be based on how much replication history the business and operations team need.

The important metric is not only:

oplog size in GB.

The more useful operational measure is:

oplog time window.

The same 50 GB oplog might represent:

3 days

on one workload

but only:

2 hours

on another workload.`,

      coreConcept: `Oplog window approximately depends on:

Oplog capacity
       /
Oplog generation rate

Higher write volume
     |
     v
Faster oplog turnover
     |
     v
Shorter time window`,

      detailedExplanation: `Important factors affecting oplog consumption include:

• write rate
• update patterns
• bulk imports
• mass deletes
• large transactions
• application bursts
• operational workloads

A DBA should size oplog to cover scenarios such as:

• planned maintenance
• expected host outage
• network outage
• Secondary catch-up
• initial-sync support
• operational recovery requirements

Example:

Normal environment:

Oplog size:
100 GB

Normal window:
72 hours

Bulk migration begins.

Oplog generation increases dramatically.

New window:
9 hours

The oplog did not shrink in bytes.

The workload consumed history faster.

This is why monitoring only configured oplog size is insufficient.

DBAs should also watch:

• oldest oplog timestamp
• newest oplog timestamp
• window duration
• trend during peak workloads
• Secondary lag relative to the window

A useful operational safety comparison is:

Secondary lag
versus
Oplog window.

Example:

Secondary lag:
8 hours

Oplog window:
10 hours

That is a critical risk even if replication is technically still functioning.`,

      internalWorking: `Oplog size fixed:
100 GB

Low write rate:
1 GB/hour
   |
   v
~100 hour window


High write rate:
10 GB/hour
   |
   v
~10 hour window


Same size,
very different recovery capacity.`,

      architecture: `Writes
  |
  v
Primary
  |
  v
Oplog generation rate
  |
  +-------------------+
  |                   |
  v                   v
Oplog size        Window duration
                      |
                      v
          Replication recovery capacity`,

      examples: [
        `Check:

rs.printReplicationInfo()`,

        `Compare with:

rs.printSecondaryReplicationInfo()`,

        `Track window before and during major bulk operations.`
      ],

      commands: [
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Shows configured oplog size and approximate time range currently retained.'
        },
        {
          command:
            'db.getSiblingDB("local").oplog.rs.stats()',
          explanation:
            'Shows statistics for the oplog collection.'
        }
      ],

      productionScenario: `A replica set normally has a 48-hour oplog window.

A data migration performs millions of updates.

Within several hours the window drops to:

7 hours.

One Secondary is already:

5 hours behind.

The DBA now has only a small safety margin before that member risks falling outside available history.

The correct response includes:

• investigating the lagging member
• controlling migration rate if possible
• evaluating oplog capacity
• monitoring the remaining window continuously.`,

      troubleshootingApproach: `1. Record oplog size.

2. Record current window.

3. Measure window trend.

4. Check write-rate changes.

5. Check bulk jobs.

6. Measure Secondary lag.

7. Compare lag to window.

8. Estimate safety margin.

9. Check disk capacity before resizing.

10. Review maintenance requirements.

11. Review initial-sync duration.

12. Continue monitoring after workload changes.`,

      commonMistakes: [
        'Sizing oplog only by percentage of disk.',
        'Assuming the time window is constant.',
        'Ignoring bulk-operation impact.',
        'Monitoring lag without comparing it to oplog history.',
        'Increasing oplog blindly without checking disk headroom.'
      ],

      bestPractices: [
        'Monitor time window, not only GB.',
        'Track window during peak writes.',
        'Maintain operational safety margin.',
        'Compare lag against the window.',
        'Capacity-plan oplog for maintenance and recovery scenarios.'
      ],

      interviewAnswer: `I size the oplog based on required time coverage, not just bytes. I monitor the oldest and newest oplog timestamps to determine the actual time window and compare that against Secondary lag, expected maintenance duration, outage scenarios, and initial-sync requirements.

High write volume can reduce the window dramatically even when oplog size remains unchanged.`,

      keyTakeaways: [
        'Oplog size and oplog window are different concepts.',
        'Write rate controls how quickly history rolls over.',
        'Lag must be compared with the window.',
        'Bulk workloads can sharply reduce safety margin.',
        'Sizing should reflect recovery requirements.'
      ]
    }
  },


  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 14,
    question:
      'How would you troubleshoot high latency specifically on majority writes when ordinary Primary-local writes appear faster?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `If majority writes are much slower than weaker acknowledgement writes, the extra latency is likely related to the replica set's ability to satisfy the majority acknowledgement condition.

That means the investigation must include Secondary members, not only the Primary.`,

      coreConcept: `Majority write latency:

Primary execution time
      +
Replication progress
      +
Secondary durability/apply delay
      +
Network delay
      +
Flow-control effects

Therefore:

Slow majority writes
can originate outside the Primary.`,

      detailedExplanation: `Suppose:

w:1 latency:
10 ms

w:"majority" latency:
250 ms

This suggests the local Primary operation is relatively fast, but the stronger acknowledgement path is slow.

Investigate:

1. SECONDARY LAG

Are majority-relevant data-bearing members behind?

2. SECONDARY DISK LATENCY

Slow storage delays durable replication progress.

3. NETWORK LATENCY

High network round-trip time can affect replication acknowledgement behavior.

4. FLOW CONTROL

If majority progress lags, flow control can increase Primary write wait time.

5. WRITE BURSTS

A large write spike may temporarily overwhelm replication capacity.

6. MAINTENANCE

One voting member may be restarting or recovering.

7. CACHE/CPU PRESSURE

Secondaries may be slower than usual.

A useful test is to correlate timestamps:

application write latency spike

with:

Secondary lag spike

with:

disk latency

with:

flow-control metrics.

This converts symptoms into a causal chain.`,

      internalWorking: `Client
  |
  v
Primary write complete quickly
  |
  v
Wait for majority requirement
  |
  +--> Secondary B slow disk
  |
  +--> Secondary C healthy
  |
  v
Acknowledgement delayed
  |
  v
Client sees high latency`,

      architecture: `             CLIENT
                |
                v
             PRIMARY
                |
          local write fast
                |
       +--------+--------+
       |                 |
       v                 v
 Secondary B        Secondary C
 slow disk           healthy
       |
       v
 majority progress delayed
       |
       v
 client latency rises`,

      examples: [
        `Compare application latency by write concern.`,

        `Check:

rs.status()

db.serverStatus().flowControl`,

        `Correlate with disk latency on Secondaries.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows replication state and member progress.'
        },
        {
          command:
            'db.serverStatus().flowControl',
          explanation:
            'Shows flow-control metrics where available.'
        }
      ],

      productionScenario: `Payment writes using majority suddenly take:

300 ms.

Other low-criticality writes using weaker acknowledgement remain near:

15 ms.

Primary storage is healthy.

Secondary B disk latency has jumped to:

180 ms.

Replication lag increases.

The majority acknowledgement path is waiting on replica-set progress.

The correct fix is the Secondary/storage problem, not changing the payment service to weaker write concern.`,

      troubleshootingApproach: `1. Compare latency by write concern.

2. Check Primary disk/CPU.

3. Check Secondary lag.

4. Check Secondary disk latency.

5. Check network.

6. Check flow control.

7. Check write rate.

8. Check member state.

9. Check maintenance/restarts.

10. Correlate timeline.

11. Fix replication bottleneck.

12. Re-test majority latency.`,

      commonMistakes: [
        'Looking only at the Primary.',
        'Weakening write concern to hide latency.',
        'Ignoring Secondary storage.',
        'Ignoring network conditions.',
        'Ignoring flow control.'
      ],

      bestPractices: [
        'Monitor majority write latency separately.',
        'Monitor all replica-set members.',
        'Protect Secondary storage performance.',
        'Correlate replication and application metrics.',
        'Preserve durability requirements.'
      ],

      interviewAnswer: `If majority writes are slow while Primary-local writes are fast, I treat the difference as replication-path latency.

I check Secondary lag, Secondary disk and CPU, network, member health, write rate, and flow-control metrics. The root cause is often a lagging or slow replica-set member rather than the Primary itself.`,

      keyTakeaways: [
        'Majority latency includes replication progress.',
        'Secondary performance affects client writes.',
        'Flow control may amplify symptoms.',
        'Do not weaken durability blindly.',
        'Correlation across members is essential.'
      ]
    }
  },


  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 15,
    question:
      'What is an election storm in MongoDB, what usually causes repeated Primary changes, and how should an L3 DBA investigate it?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `An election storm is an operational description for repeated or frequent elections and Primary changes over a short period.

It is not a normal healthy state.

The election mechanism itself is usually reacting to instability elsewhere.`,

      coreConcept: `Repeated elections
      |
      v
Ask what repeatedly makes
Primary membership unstable

Possible causes:

Network
Storage stalls
CPU stalls
Host instability
VM pauses
Replication problems
Misconfiguration
Aggressive maintenance`,

      detailedExplanation: `Common causes include:

1. NETWORK INSTABILITY

Packet loss, routing issues, firewall changes, unstable DNS, or cross-zone connectivity problems.

2. STORAGE STALLS

A severely stalled mongod may fail to respond to heartbeats even if the process technically remains running.

3. CPU / SYSTEM PAUSES

Severe saturation can delay internal work enough to affect topology communication.

4. HOST/VM INSTABILITY

Reboots, hypervisor issues, infrastructure freezes.

5. REPLICA-SET CONFIGURATION

Poor priority or voting design may cause unnecessary leadership transitions.

6. MAINTENANCE

Repeated manual stepdowns or restarting members too quickly can generate many elections.

The important DBA principle is:

Election is often the visible symptom.

The root cause is frequently below MongoDB's election layer.`,

      internalWorking: `Primary A
   |
heartbeat loss
   v
Election -> B

B
 |
system stall
 v
Election -> C

C
 |
network issue
 v
Election -> A

Repeated leadership change
      |
      v
Investigate underlying instability`,

      architecture: `         APPLICATION
              |
              v
     Primary changes repeatedly
        A -> B -> C -> A
              |
              v
       Election symptoms
              |
    +---------+----------+
    |         |          |
    v         v          v
 Network    Storage     Host
 instability stalls    instability`,

      examples: [
        `Correlate:

rs.status()

mongod logs

disk latency

network metrics

VM events`,

        `Build an election timeline before restarting members.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows current topology and election-related information.'
        }
      ],

      productionScenario: `A replica set changes Primary five times within 20 minutes.

MongoDB logs show repeated heartbeat failures.

Infrastructure monitoring shows:

disk latency spikes to 400 ms

on whichever VM becomes Primary.

The problem is not:

"MongoDB election is broken."

The underlying storage platform is intermittently stalling database servers.

The elections are the HA system reacting to that instability.`,

      troubleshootingApproach: `1. Preserve all member logs.

2. Build exact Primary-change timeline.

3. Identify each election term/time.

4. Check heartbeat failures.

5. Check network metrics.

6. Check disk latency.

7. Check CPU and system load.

8. Check VM/cloud events.

9. Check member restarts.

10. Check votes/priority.

11. Check replication lag.

12. Check scheduled jobs.

13. Identify the common trigger.

14. Stabilize infrastructure.

15. Verify elections stop.

16. Complete RCA.`,

      commonMistakes: [
        'Treating elections themselves as root cause.',
        'Restarting every node.',
        'Ignoring infrastructure telemetry.',
        'Failing to correlate exact timestamps.',
        'Changing priority randomly.'
      ],

      bestPractices: [
        'Alert on unexpected election frequency.',
        'Preserve election logs.',
        'Monitor host and storage latency.',
        'Use stable networking.',
        'Perform RCA after repeated leadership changes.'
      ],

      interviewAnswer: `An election storm is repeated Primary turnover over a short period. I treat elections as symptoms and reconstruct the timeline using replica-set logs and election data, then correlate heartbeat failures with network, storage, CPU, host, maintenance, and configuration events.

The objective is to remove the instability triggering elections, not to suppress the election mechanism.`,

      keyTakeaways: [
        'Repeated elections are abnormal.',
        'Election is often a symptom.',
        'Storage and network are common causes.',
        'Timeline correlation is critical.',
        'Infrastructure stability is part of MongoDB HA.'
      ]
    }
  },


  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 16,
    question:
      'A five-member MongoDB replica set is split by a network partition. How do majority rules determine which side can have a Primary, and how would you troubleshoot safely?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 16,

    answer: {
      groundZero: `A network partition divides members into groups that can communicate internally but not across the partition.

MongoDB majority rules are designed so only the side that retains the required voting majority can establish or maintain Primary authority.`,

      coreConcept: `Five voters:

A B C D E

Majority:
3

Partition:

Side 1:
A B C
= 3 votes
= majority

Side 2:
D E
= 2 votes
= no majority

Only Side 1 can sustain Primary authority.`,

      detailedExplanation: `This is one of the core safety properties of replica-set elections.

Example:

Before partition:

A Primary
B Secondary
C Secondary
D Secondary
E Secondary

Network splits:

Group 1:
A B

Group 2:
C D E

Group 1 has:

2 of 5 votes

No majority.

A cannot safely continue Primary authority indefinitely according to majority rules.

Group 2 has:

3 of 5 votes

It contains majority.

If an eligible candidate exists there, that side can elect a Primary.

This is how the topology avoids two independent writable Primaries under normal replica-set election rules.

The DBA must troubleshoot very carefully.

Do not immediately:

• force reconfigure
• remove unreachable members
• restart everything

because the "unreachable" members may still be alive on the other side of the partition.

The first objective is to determine:

Who can communicate with whom?

and:

Which side has majority?`,

      internalWorking: `5 voters

Partition:

A ---- B

X      X

C ---- D ---- E


A/B:
2 votes
NO majority


C/D/E:
3 votes
HAS majority
     |
     v
Eligible candidate can
become Primary`,

      architecture: `              BEFORE

      A - B - C - D - E


             PARTITION

      A - B      X      C - D - E

      2 votes           3 votes
      no majority       majority

                         |
                         v
                    Primary side`,

      examples: [
        `Check status from more than one surviving member.`,

        `Map member-to-member connectivity.`,

        `Calculate majority from configured voters in rs.conf().`
      ],

      commands: [
        {
          command:
            'rs.conf()',
          explanation:
            'Shows configured voting topology needed for majority calculations.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Shows the current member view of reachability and replica-set state.'
        }
      ],

      productionScenario: `A five-node replica set spans two sites.

A WAN failure splits the set:

Site A:
2 voters

Site B:
3 voters

Site B retains majority and elects a Primary.

Site A cannot maintain Primary authority.

An engineer on Site A considers using forced reconfiguration to make its two nodes writable.

That would be dangerous because Site B is already operating as the legitimate majority side.

The correct action is to restore connectivity and preserve the authoritative majority history.`,

      troubleshootingApproach: `1. Freeze topology changes.

2. Capture rs.status() from multiple members.

3. Capture rs.conf().

4. Count configured voters.

5. Calculate majority.

6. Map connectivity between every member.

7. Identify which side has majority.

8. Identify current authoritative Primary.

9. Check election terms.

10. Check application connectivity.

11. Restore network safely.

12. Allow minority-side members to rejoin.

13. Monitor rollback/catch-up if needed.

14. Avoid forced reconfiguration unless doing a deliberate disaster-recovery procedure with full understanding of the other side's state.`,

      commonMistakes: [
        'Force-reconfiguring the minority side.',
        'Assuming unreachable means powered off.',
        'Removing partitioned members prematurely.',
        'Checking topology from only one node.',
        'Ignoring election terms and current authoritative Primary.'
      ],

      bestPractices: [
        'Design voters across failure domains carefully.',
        'Document partition recovery procedures.',
        'Always identify the majority side first.',
        'Avoid emergency config changes without full topology visibility.',
        'Restore network before altering logical topology when possible.'
      ],

      interviewAnswer: `In a five-voter replica set, three votes form majority. During a network partition only the partition that retains three or more voting members can establish or maintain Primary authority.

I first map connectivity and majority from multiple members, identify the authoritative Primary, and avoid forced reconfiguration on the minority side because those unreachable members may still be active on the majority side.`,

      keyTakeaways: [
        'Majority prevents normal dual-Primary operation.',
        'Five voters require three for majority.',
        'Partition troubleshooting starts with connectivity mapping.',
        'Minority-side forced changes are dangerous.',
        'The majority side defines authoritative leadership.'
      ]
    }
  },


  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 17,
    question:
      'How would you design a MongoDB replica set across multiple availability zones for high availability and failure-domain resilience?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 17,

    answer: {
      groundZero: `High availability is not only about having three MongoDB servers.

Those servers must be distributed so that one infrastructure failure does not remove voting majority.

The DBA must think in terms of:

failure domains.`,

      coreConcept: `Example good three-AZ design:

AZ-A:
Member A

AZ-B:
Member B

AZ-C:
Member C

Total voters:
3

Loss of one AZ:
2 voters remain

Majority:
2

Election still possible.`,

      detailedExplanation: `Consider two designs.

DESIGN 1

All three members in one availability zone.

A zone failure removes:

all members.

Replica set is unavailable.

DESIGN 2

One member in each of three independent zones.

Loss of one zone leaves:

2 of 3 voting members.

Majority remains.

This is substantially better for HA.

However, there are trade-offs:

• inter-zone network latency
• storage performance
• cost
• placement policies
• application latency

For multi-region deployments, the design becomes more complex.

If voters are spread incorrectly across regions, losing one region can remove majority.

Example:

Region A:
2 voters

Region B:
1 voter

If Region A fails:

only 1/3 remains.

No Primary.

That design favors Region A as the majority region.

This may be intentional, but it must match business requirements.

DBAs should model:

• one-node loss
• one-AZ loss
• one-region loss
• maintenance
• network partition

and verify both:

majority availability

and:

electable-member availability.`,

      internalWorking: `Three-zone layout:

AZ-A
 |
 A

AZ-B
 |
 B

AZ-C
 |
 C


Loss of AZ-A:

B + C remain
  |
  v
2/3 majority
  |
  v
Primary possible`,

      architecture: `             REGION

       +---------+---------+
       |         |         |
       v         v         v
      AZ-A      AZ-B      AZ-C
       |         |         |
       v         v         v
       A         B         C

      voter      voter     voter

Loss of any one AZ
still leaves majority.`,

      examples: [
        `Three voting data-bearing members across three AZs is a common simple HA pattern.`,

        `Model region failures separately from node failures.`,

        `Keep application connectivity compatible with every possible Primary location.`
      ],

      commands: [
        {
          command:
            'rs.conf()',
          explanation:
            'Used to review member voting, priorities, and configured hostnames while validating failure-domain design.'
        }
      ],

      productionScenario: `A business runs MongoDB across three availability zones.

Each zone hosts one voting data-bearing member.

AZ-B fails completely.

Members A and C remain connected.

They still have:

2 of 3 votes.

If necessary, a new Primary can be elected.

The application connection string includes multiple seed hosts and is able to discover the new Primary.

The outage impact is limited to failover time rather than total database loss.`,

      troubleshootingApproach: `Design review:

1. List all voting members.

2. Map each member to AZ/region.

3. Calculate majority.

4. Simulate each member loss.

5. Simulate each AZ loss.

6. Simulate region loss if applicable.

7. Verify remaining majority.

8. Verify remaining electable members.

9. Verify application can reach all candidate Primaries.

10. Review cross-zone latency.

11. Review storage characteristics.

12. Test failover before production.`,

      commonMistakes: [
        'Putting all members in one AZ.',
        'Counting servers without considering failure domains.',
        'Ignoring application network access to alternate Primaries.',
        'Designing votes without modeling region loss.',
        'Using asymmetric hardware for electable members without understanding consequences.'
      ],

      bestPractices: [
        'Distribute voters across independent failure domains.',
        'Model failure scenarios explicitly.',
        'Use comparable resources for electable members.',
        'Test AZ failover.',
        'Align topology with RTO and availability requirements.'
      ],

      interviewAnswer: `For multi-AZ HA, I distribute voting data-bearing members so loss of one availability zone still leaves voting majority and at least one electable member.

A common simple design is three voters across three AZs. I also test application connectivity, network latency, storage behavior, and explicitly model node, AZ, and region failures rather than only counting servers.`,

      keyTakeaways: [
        'Failure-domain placement matters.',
        'Three servers in one AZ is not strong HA.',
        'Loss scenarios must preserve majority.',
        'Electability and application connectivity also matter.',
        'HA topology must be tested.'
      ]
    }
  },


  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 18,
    question:
      'How would you perform a production MongoDB replica-set patching or upgrade with minimum downtime and controlled failover?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 18,

    answer: {
      groundZero: `Replica-set maintenance should be performed one member at a time.

The main objective is:

Preserve a healthy majority and at least one Primary throughout the maintenance window.

A typical sequence is:

Secondary
→ Secondary
→ Primary last.`,

      coreConcept: `For a 3-node replica set:

1. Health check
2. Patch Secondary B
3. Wait for B to return healthy
4. Patch Secondary C
5. Wait for C to return healthy
6. Step down Primary A
7. New Primary elected
8. Patch old Primary A
9. Verify full health`,

      detailedExplanation: `Before maintenance:

• verify rs.status()
• verify replication lag
• verify oplog window
• verify backups
• verify disk
• verify package/version compatibility
• verify rollback plan
• verify application failover behavior

Then process one Secondary.

Example:

B Secondary
      |
      v
Stop mongod
      |
      v
Patch/upgrade
      |
      v
Start mongod
      |
      v
Wait for SECONDARY
      |
      v
Wait for catch-up

Only then move to C.

When all Secondaries are healthy, step down the Primary if required.

A controlled election moves Primary role to another member.

Then patch the former Primary.

IMPORTANT:

For version upgrades, MongoDB's supported upgrade path and FCV requirements must be followed for the exact versions involved.

Do not assume all major versions can be skipped directly.

Patching within a release series and major-version upgrades are operationally different.

Also avoid changing FCV prematurely during a major upgrade because FCV affects feature compatibility and downgrade options.`,

      internalWorking: `Healthy set:

A PRIMARY
B SECONDARY
C SECONDARY


Patch B
 |
B returns SECONDARY


Patch C
 |
C returns SECONDARY


Step down A
 |
B or C PRIMARY


Patch A
 |
A returns SECONDARY


Final:
All healthy`,

      architecture: `Maintenance flow:

Pre-check
   |
   v
Secondary 1
   |
   v
Validate
   |
   v
Secondary 2
   |
   v
Validate
   |
   v
Primary stepdown
   |
   v
Validate new Primary
   |
   v
Old Primary maintenance
   |
   v
Full validation`,

      examples: [
        `Before each member:

rs.status()

rs.printSecondaryReplicationInfo()

rs.printReplicationInfo()`,

        `Controlled stepdown:

rs.stepDown()`,

        `Always follow MongoDB's supported upgrade sequence for the exact source/target versions.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Used before and after each maintenance step.'
        },
        {
          command:
            'rs.stepDown()',
          explanation:
            'Used for controlled Primary transition where appropriate.'
        }
      ],

      productionScenario: `A three-node replica set requires a patch update.

The DBA patches B first.

After restart:

B reaches SECONDARY and lag returns to zero.

Then C is patched and validated.

Only after both are healthy does the DBA step down A.

B becomes Primary.

A is patched and rejoins as Secondary.

The application experiences only the brief election window rather than a prolonged outage.`,

      troubleshootingApproach: `Before maintenance:

1. Validate full health.

2. Confirm backups.

3. Check lag.

4. Check oplog window.

5. Check disk headroom.

6. Confirm version path.

During maintenance:

7. Work on one member only.

8. Wait for SECONDARY.

9. Wait for catch-up.

10. Do not proceed if topology is degraded.

Primary phase:

11. Step down intentionally.

12. Verify new Primary.

13. Check application writes.

14. Patch old Primary.

15. Verify it rejoins.

16. Complete final rs.status() review.`,

      commonMistakes: [
        'Patching multiple voters simultaneously.',
        'Patching the Primary first.',
        'Proceeding while a Secondary is still lagging.',
        'Skipping supported version-path checks.',
        'Changing FCV without understanding downgrade implications.'
      ],

      bestPractices: [
        'One member at a time.',
        'Secondaries first.',
        'Primary last.',
        'Validate after every step.',
        'Follow exact MongoDB upgrade documentation for the deployed versions.'
      ],

      interviewAnswer: `I patch or upgrade a replica set one member at a time, starting with Secondaries. After each restart I wait for SECONDARY state and full catch-up.

Once all Secondaries are healthy, I perform a controlled Primary stepdown, verify the new Primary, then patch the old Primary. For major upgrades I also follow the exact supported version path and FCV procedure.`,

      keyTakeaways: [
        'Rolling maintenance preserves availability.',
        'Secondaries are handled first.',
        'Primary is handled last.',
        'Every step requires health validation.',
        'Major upgrades require version-specific planning.'
      ]
    }
  },


  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 19,
    question:
      'A production system has high write latency, replication lag, and active flow control at the same time. How would you isolate the real root cause?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 19,

    answer: {
      groundZero: `These three symptoms are often connected:

Replication lag
      |
      v
Majority progress slows
      |
      v
Flow control increases pressure
      |
      v
Primary write latency rises

The key question is:

What caused replication to fall behind in the first place?`,

      coreConcept: `Do not stop at:

"flow control is high."

Investigate upstream cause:

Write volume?
Secondary disk?
Secondary CPU?
Network?
Cache pressure?
Backup/reporting workload?
Infrastructure degradation?`,

      detailedExplanation: `A structured investigation should determine direction of causality.

STEP 1 — TIMELINE

Which changed first?

Example:

10:00 Secondary disk latency rises

10:02 replication lag starts increasing

10:04 flow-control waits rise

10:05 application write latency rises

This strongly suggests:

Secondary storage problem

is the original trigger.

STEP 2 — COMPARE MEMBERS

If only one Secondary is lagging:

member-specific issue.

If all Secondaries lag simultaneously:

common write-load or network/infrastructure issue.

STEP 3 — PRIMARY WRITE RATE

Was there a deployment or bulk job?

STEP 4 — SECONDARY RESOURCES

Check:

• disk latency
• disk queue
• CPU
• memory
• WiredTiger cache
• filesystem
• network

STEP 5 — SPECIAL WORKLOADS

Backup or analytics jobs may be overwhelming a Secondary.

STEP 6 — FLOW CONTROL

Use it as evidence that majority progress is struggling.

Do not automatically disable it.

STEP 7 — RECOVERY

Fix the limiting replication resource.

Then verify sequence reverses:

Secondary catches up
→ lag decreases
→ flow-control pressure decreases
→ write latency improves.`,

      internalWorking: `Root cause:

Secondary disk latency
        |
        v
Replication apply slows
        |
        v
Lag increases
        |
        v
Majority commit gap increases
        |
        v
Flow control activates
        |
        v
Primary write latency rises`,

      architecture: `                 APPLICATION
                     |
                     v
               HIGH WRITE LATENCY
                     |
                     v
                FLOW CONTROL
                     |
                     v
             REPLICATION LAG
                     |
            +--------+--------+
            |                 |
            v                 v
         Network           Secondary
                            resources
                               |
                         +-----+-----+
                         |           |
                         v           v
                        Disk        CPU`,

      examples: [
        `Correlate:

db.serverStatus().flowControl

rs.status()

disk metrics

application write latency`,

        `The earliest abnormal metric often provides the strongest root-cause clue.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().flowControl',
          explanation:
            'Shows flow-control-related metrics where available.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used to compare replication progress across members.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a convenient lag view.'
        }
      ],

      productionScenario: `Application write latency rises from:

12 ms

to:

180 ms.

Flow-control counters increase.

Secondary B lag reaches:

25 minutes.

Primary disk latency remains normal.

Secondary B disk latency reaches:

200 ms.

The causal chain is clear:

Secondary storage degradation
→ replication lag
→ flow control
→ Primary write latency.

The correct fix is the Secondary/storage path.`,

      troubleshootingApproach: `1. Build metric timeline.

2. Compare all members.

3. Check Primary write rate.

4. Check Secondary lag.

5. Check disk latency per member.

6. Check CPU per member.

7. Check memory/cache.

8. Check network.

9. Check flow-control metrics.

10. Check backup/reporting jobs.

11. Check recent deployments.

12. Identify earliest anomaly.

13. Fix underlying bottleneck.

14. Verify lag shrinks.

15. Verify flow-control pressure falls.

16. Verify write latency normalizes.`,

      commonMistakes: [
        'Disabling flow control first.',
        'Blaming Primary CPU without evidence.',
        'Ignoring Secondary disk.',
        'Looking only at current values instead of the timeline.',
        'Restarting nodes before finding causality.'
      ],

      bestPractices: [
        'Use timeline-based troubleshooting.',
        'Monitor every replica-set member.',
        'Treat flow control as a signal.',
        'Correlate database and infrastructure telemetry.',
        'Fix root cause rather than downstream symptoms.'
      ],

      interviewAnswer: `When write latency, replication lag, and flow control all rise together, I reconstruct the timeline and determine which metric moved first.

I compare all members and check Primary write rate, Secondary disk/CPU/cache/network, and special workloads. If Secondary storage degrades first, followed by lag and then flow control, the storage issue is the real root cause. I fix that rather than disabling flow control.`,

      keyTakeaways: [
        'The symptoms are often causally linked.',
        'Timeline establishes direction.',
        'Secondary problems can slow Primary writes.',
        'Flow control is usually downstream of lag.',
        'Root-cause isolation requires cross-member metrics.'
      ]
    }
  },


  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'advanced_replication',
    topicId: 'advanced-replication-ha',
    topicNumber: 8,
    topicName: 'Advanced Replication & High Availability',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 investigation of a MongoDB high-availability incident involving repeated elections, write concern failures, lagging Secondaries, and network instability?',
    level: 'L3+',
    difficulty: 'Expert Scenario',
    order: 20,

    answer: {
      groundZero: `An L3 HA incident must be investigated as one connected distributed-system event.

Do not treat:

• election
• replication lag
• write concern timeout
• heartbeat failure
• network error

as unrelated problems.

The goal is to establish one causal timeline.`,

      coreConcept: `Investigation flow:

Preserve evidence
      |
      v
Build timeline
      |
      v
Map topology
      |
      v
Verify majority
      |
      v
Analyze elections
      |
      v
Analyze replication
      |
      v
Analyze write concern
      |
      v
Analyze infrastructure
      |
      v
Restore safely
      |
      v
RCA`,

      detailedExplanation: `PHASE 1 — PRESERVE EVIDENCE

Capture:

• rs.status()
• rs.conf()
• db.hello()
• mongod logs
• application errors
• monitoring graphs
• OS/cloud events

Do this before unnecessary restarts.

PHASE 2 — BUILD TIMELINE

Example:

14:00 network packet loss begins

14:01 Secondary C heartbeat failures

14:02 replication lag increases

14:03 majority writes slow

14:04 Primary election starts

14:05 B becomes Primary

14:06 writeConcern timeouts increase

14:10 network stabilizes

14:12 Secondary catch-up begins

This sequence is far more useful than isolated screenshots.

PHASE 3 — MAP TOPOLOGY

Determine:

• configured voters
• reachable voters
• electable members
• current Primary
• old Primary
• priority
• votes
• member states

PHASE 4 — MAJORITY ANALYSIS

Ask:

Was voting majority available during every stage?

PHASE 5 — ELECTION ANALYSIS

For every election:

• timestamp
• old Primary
• new Primary
• term
• heartbeat reason
• member availability

PHASE 6 — REPLICATION ANALYSIS

Check:

• lag per member
• sync sources
• oplog window
• disk latency
• write rate
• flow control

PHASE 7 — WRITE CONCERN ANALYSIS

If applications report:

writeConcern timeout

determine whether the requested acknowledgement could be satisfied during the degraded topology.

Do not assume a write concern timeout automatically means the write operation itself was rolled back.

The exact operation outcome must be verified.

PHASE 8 — INFRASTRUCTURE ANALYSIS

Check:

• network packet loss
• DNS
• firewall
• CPU
• memory
• disk
• VM pause/reboot
• cloud infrastructure events

PHASE 9 — SAFE RECOVERY

Restore:

• stable networking
• voting majority
• stable Primary
• Secondary replication
• application connectivity

PHASE 10 — RCA

Document:

Trigger

Impact

Timeline

Root cause

Contributing factors

Recovery actions

Preventive controls.`,

      internalWorking: `Network instability
       |
       v
Heartbeat failures
       |
       v
Election
       |
       +----------------+
       |                |
       v                v
Replication lag    Majority progress
       |                |
       +--------+-------+
                |
                v
       writeConcern delays
                |
                v
        application impact`,

      architecture: `                   APPLICATION
                        |
                        v
                 Write Concern
                        |
                        v
                  REPLICA SET
             +----------+----------+
             |          |          |
             v          v          v
          PRIMARY    SECONDARY  SECONDARY
             |          |          |
             +----------+----------+
                        |
                        v
                  NETWORK LAYER
                        |
                        v
              INFRASTRUCTURE LAYER`,

      examples: [
        `MongoDB:

rs.status()

rs.conf()

db.hello()

rs.printReplicationInfo()

rs.printSecondaryReplicationInfo()`,

        `Correlate with:

application logs

network monitoring

disk metrics

VM events

OS logs`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Central status source for member health and election investigation.'
        },
        {
          command:
            'rs.conf()',
          explanation:
            'Used to calculate voting majority and electability.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Used to understand available oplog history.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Used to review Secondary lag.'
        },
        {
          command:
            'db.serverStatus().flowControl',
          explanation:
            'Useful when replication lag is affecting Primary write throughput.'
        }
      ],

      productionScenario: `A five-member replica set experiences:

• packet loss between zones
• two elections
• one Secondary 30 minutes behind
• majority write latency spikes
• writeConcern timeout errors
• temporary application failures

The DBA finds the following sequence:

1. Network packet loss begins.
2. Heartbeat communication becomes unstable.
3. One Secondary falls behind.
4. Majority replication progress slows.
5. Majority writes become slower.
6. Election occurs.
7. Another connectivity drop triggers a second election.
8. Application sees write concern and server-selection errors.

Root cause:

cross-zone network instability.

MongoDB elections, lag, and write concern failures are downstream symptoms of the same event.`,

      troubleshootingApproach: `L3 checklist:

1. Preserve logs.

2. Capture rs.status().

3. Capture rs.conf().

4. Capture application errors.

5. Build exact timeline.

6. Identify all Primary transitions.

7. Record terms.

8. Calculate majority.

9. Map member reachability.

10. Check priority and votes.

11. Check replication lag.

12. Check sync sources.

13. Check oplog window.

14. Check flow control.

15. Check write concern settings.

16. Check write concern timeout timing.

17. Check network packet loss.

18. Check DNS/firewall.

19. Check disk latency.

20. Check CPU/memory.

21. Check VM events.

22. Restore network stability.

23. Confirm stable Primary.

24. Confirm all Secondaries catch up.

25. Confirm application writes succeed.

26. Monitor for repeated elections.

27. Perform RCA.

28. Add preventive alerts.`,

      commonMistakes: [
        'Restarting every node immediately.',
        'Treating writeConcern timeout as proof the write did not execute.',
        'Treating elections as independent incidents.',
        'Ignoring network metrics.',
        'Force-reconfiguring during an unresolved partition.',
        'Closing the incident once the application reconnects.'
      ],

      bestPractices: [
        'Use one unified incident timeline.',
        'Preserve evidence.',
        'Correlate MongoDB with infrastructure.',
        'Understand write concern semantics.',
        'Restore topology safely before making configuration changes.',
        'Finish every major HA incident with RCA and preventive controls.'
      ],

      interviewAnswer: `For an L3 HA incident I first preserve rs.status, rs.conf, logs, application errors, and infrastructure metrics, then build a single timeline.

I verify majority and electability, reconstruct each election, analyze Secondary lag, sync sources, oplog window, flow control, and write concern behavior, and correlate these with network, disk, CPU, and VM events.

I restore stable majority and replication first, then perform RCA to identify the trigger rather than treating elections, lag, and write concern failures as separate problems.`,

      keyTakeaways: [
        'HA incidents must be analyzed end-to-end.',
        'One underlying problem can create many MongoDB symptoms.',
        'Majority and election state must be reconstructed precisely.',
        'Write concern failures require careful interpretation.',
        'L3 troubleshooting ends with prevention.'
      ]
    }
  }

];


/* =========================================================
   SEED FUNCTION
========================================================= */

async function seedAdvancedReplication() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db =
      client.db(DATABASE_NAME);

    const collection =
      db.collection(
        COLLECTION_NAME
      );

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );


    /* -------------------------------------------------------
       REMOVE ONLY TOPIC 8
    ------------------------------------------------------- */

    const deleteResult =
      await collection.deleteMany({
        category:
          'advanced_replication'
      });

    console.log(
      `Removed ${deleteResult.deletedCount} previous advanced_replication documents`
    );


    /* -------------------------------------------------------
       INSERT TOPIC 8
    ------------------------------------------------------- */

    const insertResult =
      await collection.insertMany(
        questions
      );

    console.log(
      `Inserted ${insertResult.insertedCount} Advanced Replication & High Availability questions`
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

        name:
          'topicId_order_unique',

        partialFilterExpression: {
          topicId: {
            $exists: true
          }
        }
      }
    );


    /* -------------------------------------------------------
       VALIDATE TOPIC
    ------------------------------------------------------- */

    const topicCount =
      await collection.countDocuments({
        category:
          'advanced_replication'
      });

    console.log(
      `Topic 8 count: ${topicCount}`
    );


    if (topicCount !== 20) {
      throw new Error(
        `Topic 8 validation failed. Expected 20 questions but found ${topicCount}.`
      );
    }


    /* -------------------------------------------------------
       CURRICULUM TOTAL
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
      'Topic 8 seed completed successfully.'
    );

  } catch (error) {

    console.error(
      'Topic 8 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {

    await client.close();
  }
}


seedAdvancedReplication();
