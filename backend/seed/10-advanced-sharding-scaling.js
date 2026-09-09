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
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 1,
    question:
      'What makes a compound shard key useful in MongoDB, and how do the individual fields influence routing and distribution?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `A compound shard key contains more than one field.

Example:

{
  region: 1,
  customerId: 1
}

MongoDB uses the complete ordered key to partition the collection.

A compound shard key can help balance multiple requirements such as:

• query targeting
• data distribution
• write distribution
• grouping related data.`,

      coreConcept: `Single-field key:

{ customerId: 1 }

Compound key:

{ region: 1, customerId: 1 }

Ordered key space becomes conceptually:

(region, customerId)

Examples:

("APAC", 100)
("APAC", 200)
("EU", 100)
("US", 500)

MongoDB distributes ranges across this combined key space.`,

      detailedExplanation: `Compound shard keys are useful when one field alone cannot provide both good distribution and good routing.

Example workload:

Most queries contain:

region

and:

customerId.

A compound key such as:

{ region: 1, customerId: 1 }

may allow MongoDB to organize data first by region and then customerId.

However, field order matters.

Consider:

{ region: 1, customerId: 1 }

versus:

{ customerId: 1, region: 1 }

These create different shard-key spaces and different routing behavior.

Queries containing the prefix:

region

may be able to narrow routing with the first design.

A query containing only customerId may not receive the same routing benefit because it does not specify the leading shard-key field.

Therefore shard-key design has a prefix concept similar in spirit to compound indexes, although shard routing and index execution are separate mechanisms.

A compound shard key can also improve cardinality.

Suppose:

region

has only 5 values.

That alone is low cardinality.

But:

region + customerId

may provide millions of combinations.

This can create much better distribution potential.

The key should still be evaluated for:

• hot prefixes
• skew
• monotonic fields
• query patterns
• write patterns.`,

      internalWorking: `Compound key:

{ region: 1, customerId: 1 }

Logical order:

APAC,100
APAC,101
APAC,102
EU,100
EU,101
US,100
US,101

Ranges are created over
this combined ordered key space.`,

      architecture: `                    SHARD KEY
            { region, customerId }
                      |
            +---------+---------+
            |                   |
            v                   v
        Routing             Distribution
            |                   |
            v                   v
      prefix fields       combined cardinality`,

      examples: [
        `Example:

{ region: 1, customerId: 1 }`,

        `A query containing both region and customerId may be highly targetable.`,

        `A low-cardinality prefix can still influence placement and routing behavior.`
      ],

      commands: [
        {
          command:
            'sh.shardCollection("sales.orders", { region: 1, customerId: 1 })',
          explanation:
            'Illustrates sharding using a compound ranged shard key.'
        }
      ],

      productionScenario: `A SaaS platform initially considers:

{ region: 1 }

as the shard key.

There are only four regions.

That provides poor distribution flexibility.

The team evaluates:

{ region: 1, tenantId: 1 }

The combination provides many more distinct values while still supporting region-aware routing.

The DBA then checks whether any single region or tenant dominates the workload before approving the design.`,

      troubleshootingApproach: `For compound shard-key evaluation:

1. List top query patterns.

2. Identify fields present in those queries.

3. Measure cardinality of each field.

4. Measure combined cardinality.

5. Measure value frequency.

6. Identify hot prefixes.

7. Analyze monotonicity.

8. Test field-order alternatives.

9. Model targeted queries.

10. Model write distribution.

11. Test with realistic data.`,

      commonMistakes: [
        'Choosing field order arbitrarily.',
        'Assuming compound key automatically fixes skew.',
        'Ignoring leading-field routing behavior.',
        'Using low-cardinality prefixes without analysis.',
        'Confusing shard-key routing with index execution.'
      ],

      bestPractices: [
        'Choose compound order from workload patterns.',
        'Measure combined cardinality.',
        'Evaluate hot prefixes.',
        'Balance query targeting and write distribution.',
        'Test alternatives with representative data.'
      ],

      interviewAnswer: `A compound shard key combines multiple fields to create a richer distribution and routing key. It can improve cardinality and allow common query prefixes to narrow shard targeting.

Field order matters because the shard-key space is ordered by the compound definition. I evaluate cardinality, frequency, monotonicity, query prefixes, and write patterns before selecting the order.`,

      keyTakeaways: [
        'Compound shard keys use multiple ordered fields.',
        'Field order affects routing.',
        'Combined cardinality can improve distribution.',
        'Hot prefixes can still create imbalance.',
        'Shard-key and index design must both be considered.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 2,
    question:
      'What is shard-key refinement in MongoDB, and how is refining a shard key different from completely resharding a collection?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `Shard-key refinement means extending an existing shard key by adding additional field or fields to the end of the current key.

Example:

Existing:

{ customerId: 1 }

Refined:

{ customerId: 1, orderId: 1 }

Refinement does not replace the existing prefix.

It adds more granularity.

Resharding is different because it can change the shard key more fundamentally.`,

      coreConcept: `REFINEMENT

Old:
{ A: 1 }

New:
{ A: 1, B: 1 }

Existing key stays as prefix.


RESHARDING

Old:
{ A: 1 }

New:
{ C: 1 }

or another substantially different key.`,

      detailedExplanation: `Refinement is useful when the current shard key has a useful leading component but needs greater granularity.

Example:

Current:

{ tenantId: 1 }

Problem:

One tenant has millions of documents and creates very large key ranges.

Potential refinement:

{ tenantId: 1, documentId: 1 }

Now documents within each tenant can be distinguished more precisely in the shard-key space.

However, refinement does not eliminate the original leading field.

If the original prefix itself causes undesirable routing behavior, refinement may not solve the architectural issue.

RESHARDING

Resharding creates a new distribution based on a new shard key.

It is a much more substantial redistribution operation.

Example:

Old:

{ createdAt: 1 }

New:

{ customerId: "hashed" }

This fundamentally changes data placement.

Therefore:

Refinement:
increase granularity while preserving existing prefix.

Resharding:
replace the distribution key.

Both are operationally significant and require version-specific planning.`,

      internalWorking: `Refinement:

Old range key:

tenantId

          |
          v

New range key:

tenantId + documentId

Existing tenantId values remain
the leading dimension.


Resharding:

Old key space
     |
     v
Build new key space
     |
     v
Redistribute collection`,

      architecture: `               EXISTING SHARD KEY
                       |
             +---------+---------+
             |                   |
             v                   v
         REFINE              RESHARD
             |                   |
             v                   v
       add suffix fields     new shard key
             |                   |
             v                   v
      preserve prefix      redistribute data`,

      examples: [
        `Existing:

{ tenantId: 1 }`,

        `Refined:

{ tenantId: 1, recordId: 1 }`,

        `Possible resharded key:

{ recordId: "hashed" }`
      ],

      commands: [
        {
          command:
            'sh.refineCollectionShardKey("app.events", { tenantId: 1, eventId: 1 })',
          explanation:
            'Illustrates refining an existing shard key where the deployed MongoDB version supports the required operation and prerequisites.'
        }
      ],

      productionScenario: `A multi-tenant cluster uses:

{ tenantId: 1 }

Most tenants are small, but one tenant has hundreds of millions of documents.

The DBA evaluates refining the key with a second field to increase granularity within tenantId.

However, if the real goal is to distribute one tenant's workload independently of tenantId as the leading key, the team may need a more fundamental shard-key redesign or resharding strategy.`,

      troubleshootingApproach: `Before refinement:

1. Identify current shard key.

2. Determine why it is insufficient.

3. Check whether existing prefix remains useful.

4. Analyze candidate suffix fields.

5. Verify supporting indexes.

6. Check version-specific prerequisites.

7. Estimate redistribution implications.

8. Validate query targeting afterward.

For resharding:

9. Treat as a larger migration operation.

10. Capacity-plan network, disk, CPU, and temporary overhead.`,

      commonMistakes: [
        'Thinking refinement replaces the old shard key.',
        'Expecting refinement to remove a bad prefix.',
        'Treating resharding as a metadata-only change.',
        'Ignoring index prerequisites.',
        'Ignoring version-specific support.'
      ],

      bestPractices: [
        'Use refinement when the prefix is still valuable.',
        'Use resharding when the distribution model must change.',
        'Test query routing after changes.',
        'Plan resource requirements.',
        'Verify exact MongoDB-version procedures.'
      ],

      interviewAnswer: `Shard-key refinement extends the existing shard key by appending fields while keeping the original key as the prefix. It is useful when the existing key is conceptually correct but needs greater granularity.

Resharding is more fundamental because it can redistribute the collection using a different shard key. I treat resharding as a major data-movement operation rather than a simple metadata update.`,

      keyTakeaways: [
        'Refinement appends fields.',
        'The existing key remains the prefix.',
        'Resharding can replace the key.',
        'Refinement cannot remove a bad leading field.',
        'Both require careful production planning.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 3,
    question:
      'What is resharding in MongoDB, why might it be required, and what operational resources can it consume?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `Resharding means redistributing an already sharded collection using a new shard key.

It may be required when the original shard key causes problems such as:

• hotspots
• poor query targeting
• severe data skew
• poor write distribution
• changing application access patterns.`,

      coreConcept: `Existing distribution

Shard key A
     |
     v
Data spread using A

Need new strategy

     |
     v

New shard key B
     |
     v
Data redistributed
     |
     v
New ownership map`,

      detailedExplanation: `A shard key that worked when the application had:

100 GB

may become poor when the system reaches:

10 TB

or when the query pattern changes significantly.

Example:

Original key:

{ createdAt: 1 }

Problem:

new writes concentrate in the newest range.

The team may evaluate a new key based on customer or hashed distribution.

Resharding is operationally expensive because MongoDB must create a new distribution of the collection.

Potential resource consumption includes:

• reading large amounts of collection data
• writing redistributed data
• network transfer
• temporary storage
• index work
• replication traffic
• config metadata activity
• increased CPU
• cache pressure

Application writes may also continue during supported online resharding workflows, which creates additional synchronization requirements.

Therefore the DBA must capacity-plan:

• disk headroom
• I/O
• network
• oplog
• replication lag
• operation duration

Exact resharding behavior and supported controls vary by MongoDB version.`,

      internalWorking: `Old:

Shard A -> data based on old key
Shard B -> data based on old key
Shard C -> data based on old key

Reshard:

Read existing documents
        |
        v
Calculate new shard-key values
        |
        v
Transfer to new owners
        |
        v
Synchronize changes
        |
        v
Commit new distribution`,

      architecture: `          OLD DISTRIBUTION
                  |
                  v
             RESHARDING
          /       |       \
         v        v        v
       CPU      DISK    NETWORK
         \        |        /
          \       |       /
                  v
           NEW DISTRIBUTION`,

      examples: [
        `Old:

{ createdAt: 1 }`,

        `New candidate:

{ customerId: "hashed" }`,

        `A resharding operation may touch the entire collection.`
      ],

      commands: [
        {
          command:
            'sh.reshardCollection("app.events", { customerId: "hashed" })',
          explanation:
            'Illustrates the resharding concept. Exact syntax/options and prerequisites should be verified for the deployed version before use.'
        }
      ],

      productionScenario: `A 6 TB collection uses a monotonic ranged shard key.

One shard repeatedly receives most inserts.

The team chooses a new key that distributes writes better.

The DBA estimates:

• data movement
• network throughput
• temporary disk requirements
• replication impact
• runtime

before initiating resharding.

Starting such an operation without resource headroom could create a much larger production incident.`,

      troubleshootingApproach: `Before resharding:

1. Prove the existing shard key is the problem.

2. Analyze new candidate key.

3. Test distribution.

4. Verify indexes.

5. Estimate collection size.

6. Estimate data movement.

7. Check disk headroom on every shard.

8. Check network capacity.

9. Check replication lag.

10. Check oplog window.

11. Check cluster health.

12. Review version-specific restrictions.

13. Monitor operation continuously.`,

      commonMistakes: [
        'Resharding before proving shard-key root cause.',
        'Underestimating temporary disk usage.',
        'Ignoring network load.',
        'Starting while shards are already degraded.',
        'Selecting a new shard key without workload testing.'
      ],

      bestPractices: [
        'Treat resharding as a major production migration.',
        'Test the new key first.',
        'Maintain large resource headroom.',
        'Monitor all shards and config servers.',
        'Have rollback/abort planning based on supported version behavior.'
      ],

      interviewAnswer: `Resharding redistributes an existing sharded collection using a new shard key. It is useful when the original key produces hotspots, skew, or poor query targeting.

Because it can require large-scale reads, writes, network transfer, temporary storage, and replication work, I capacity-plan it as a major migration and verify the exact supported workflow for the MongoDB version.`,

      keyTakeaways: [
        'Resharding changes data distribution.',
        'It can address a fundamentally poor shard key.',
        'It may touch the entire collection.',
        'Disk and network headroom are critical.',
        'It must be planned like a production migration.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 4,
    question:
      'What is zone sharding in MongoDB, and how can zones control where particular ranges of data are stored?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `Zones allow a DBA to associate shards with logical locations or roles and then associate shard-key ranges with those zones.

This can be used to influence where particular data is placed.

Typical reasons include:

• geographic locality
• regulatory requirements
• hardware tiers
• tenant placement.`,

      coreConcept: `Example:

Shard A
tag/zone = INDIA

Shard B
zone = EUROPE

Shard-key ranges:

India customers
   |
   v
INDIA zone

European customers
   |
   v
EUROPE zone`,

      detailedExplanation: `Suppose a global application shards data using:

{ country: 1, customerId: 1 }

The organization requires Indian customer data to remain on shards located in India.

The DBA can associate specific shards with an India zone and define appropriate shard-key ranges for that zone.

MongoDB's balancing system then uses those placement constraints when distributing ranges.

Zones can support:

1. GEOGRAPHIC DATA PLACEMENT

2. DATA SOVEREIGNTY

3. TENANT ISOLATION

4. HARDWARE TIERS

Example:

premium customers

may be placed on faster hardware.

However, zones do not automatically solve availability.

If all shards for one zone exist in a single failure domain, a site failure may still make that zone's data unavailable.

Zone design must therefore be combined with:

• replica-set HA
• failure-domain planning
• capacity planning
• correct shard-key ranges.

A poorly chosen shard key may also make zone boundaries awkward or impossible to express efficiently.`,

      internalWorking: `Shard ranges
     |
     v
Zone assignment
     |
     v
Balancer considers:
range belongs to Zone X
     |
     v
Move/place range only on
shards assigned to Zone X`,

      architecture: `             SHARDED COLLECTION
                     |
             shard-key ranges
              /             \
             v               v
        INDIA ZONE       EUROPE ZONE
             |               |
       +-----+-----+     +---+---+
       |           |     |       |
       v           v     v       v
    Shard A     Shard B Shard C Shard D`,

      examples: [
        `Geography:

country = IN -> India zone`,

        `Tenant tier:

premium tenants -> SSD-heavy shards`,

        `Zone design should still preserve replica-set HA.`
      ],

      commands: [
        {
          command:
            'sh.addShardToZone("shard01", "INDIA")',
          explanation:
            'Associates a shard with a logical zone.'
        },
        {
          command:
            'sh.updateZoneKeyRange("app.customers", { country: "IN", customerId: MinKey }, { country: "IN", customerId: MaxKey }, "INDIA")',
          explanation:
            'Illustrates assigning a shard-key range to a zone. Exact boundaries must match the actual shard key and deployed-version requirements.'
        }
      ],

      productionScenario: `A banking platform operates India and Europe environments inside one sharded architecture.

Regulatory requirements require certain customer data to remain in approved locations.

The DBA uses zones to constrain appropriate shard-key ranges to approved shards.

The team also deploys each zone's shards as resilient replica sets so data locality does not come at the cost of availability.`,

      troubleshootingApproach: `1. Identify shard key.

2. List required placement rules.

3. Verify zone membership.

4. Verify range definitions.

5. Check overlap/gaps.

6. Check capacity in each zone.

7. Check balancer activity.

8. Check migration failures.

9. Check replica-set HA within each zone.

10. Verify actual placement matches policy.`,

      commonMistakes: [
        'Thinking zones replicate data across regions.',
        'Ignoring capacity inside a zone.',
        'Defining incorrect shard-key range boundaries.',
        'Putting all zone members in one failure domain.',
        'Assuming zones fix poor shard-key design.'
      ],

      bestPractices: [
        'Design zone ranges from actual shard keys.',
        'Capacity-plan each zone independently.',
        'Maintain HA within zones.',
        'Monitor zone migrations.',
        'Document regulatory placement requirements.'
      ],

      interviewAnswer: `Zone sharding lets MongoDB associate shard-key ranges with logical zones and restrict those ranges to shards assigned to the corresponding zone.

I use zones for geographic placement, regulatory locality, or hardware-tier requirements, while still designing replica-set HA and enough capacity inside every zone.`,

      keyTakeaways: [
        'Zones control placement by shard-key range.',
        'Shards are assigned to logical zones.',
        'Useful for geography and compliance.',
        'Zones do not replace replication.',
        'Capacity and HA must be designed per zone.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 5,
    question:
      'How do targeted operations behave with compound shard keys, and what happens when a query contains only part of the shard key?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `With a compound shard key, query targeting depends on which shard-key fields are included and whether those fields allow mongos to narrow the relevant key ranges.

Example key:

{ region: 1, customerId: 1 }`,

      coreConcept: `Query:

{ region: "IN", customerId: 1001 }

Highly specific shard-key information.


Query:

{ region: "IN" }

May narrow to a subset of ranges.


Query:

{ customerId: 1001 }

Missing leading region field.

Routing may need to contact more shards.`,

      detailedExplanation: `Consider:

Shard key:

{ region: 1, customerId: 1 }

QUERY A

{
  region: "IN",
  customerId: 1001
}

mongos has the full shard key and can normally route very precisely.

QUERY B

{
  region: "IN"
}

The query contains the leading shard-key prefix.

MongoDB may be able to target only the ranges associated with that region rather than every shard.

QUERY C

{
  customerId: 1001
}

The query does not specify the leading region value.

customerId alone does not define one contiguous prefix of the compound key space.

As a result, mongos may need broader shard participation.

This is why field order matters.

If most application lookups contain customerId but not region, then:

{ region: 1, customerId: 1 }

may be poor for those lookups even though it appears logically organized.

The shard key should reflect real query predicates.`,

      internalWorking: `Shard key:

(region, customerId)

Query:
region = IN
customerId = 10

Exact coordinate in key space.

Query:
region = IN

Range over:
(IN, MinKey)
to
(IN, MaxKey)

Query:
customerId = 10

Potentially many region prefixes.`,

      architecture: `Query predicate
      |
      v
Does it contain leading
shard-key information?
      |
   +--+--+
   |     |
  YES    NO
   |     |
   v     v
Narrow  broader
routing targeting`,

      examples: [
        `Full key:

{ region: "IN", customerId: 1001 }`,

        `Prefix:

{ region: "IN" }`,

        `Non-prefix:

{ customerId: 1001 }`
      ],

      commands: [
        {
          command:
            'db.orders.find({ region: "IN", customerId: 1001 }).explain("executionStats")',
          explanation:
            'Helps analyze shard participation and local execution for a full shard-key query.'
        }
      ],

      productionScenario: `A cluster uses:

{ region: 1, customerId: 1 }

Most application APIs search only by customerId.

As shard count grows, those lookups contact many shards.

The shard key distributes data acceptably but performs poorly for the most important read path.

This is a shard-key/query-alignment problem.`,

      troubleshootingApproach: `1. Capture top query shapes.

2. Identify shard-key fields.

3. Determine which queries contain full key.

4. Determine which contain prefix only.

5. Determine which contain non-prefix fields.

6. Run explain through mongos.

7. Count participating shards.

8. Measure query frequency.

9. Compare routing cost with business importance.

10. Reconsider shard-key strategy if critical queries consistently scatter.`,

      commonMistakes: [
        'Assuming any shard-key field makes a query targeted.',
        'Ignoring shard-key field order.',
        'Testing only full-key lookups.',
        'Confusing local index use with routing efficiency.'
      ],

      bestPractices: [
        'Design key order from actual query predicates.',
        'Measure shard participation.',
        'Favor targeted behavior for high-frequency queries.',
        'Test partial-key queries explicitly.'
      ],

      interviewAnswer: `With a compound shard key, full-key queries can route very precisely, while queries using the leading prefix may still narrow routing to a subset of ranges.

Queries containing only non-prefix shard-key fields may require broader shard participation. That is why compound shard-key field order must be chosen from actual application query patterns.`,

      keyTakeaways: [
        'Compound shard-key prefixes matter.',
        'Full keys provide precise routing.',
        'Leading prefixes may narrow routing.',
        'Non-prefix predicates may scatter.',
        'Field order must match workload.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 6,
    question:
      'How does a range migration work conceptually in MongoDB, and what stages and resources should a DBA understand?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `A range migration moves ownership of a shard-key range from one shard to another.

Conceptually:

Source shard
      |
      v
Transfer range data
      |
      v
Synchronize changes
      |
      v
Update ownership
      |
      v
Destination shard owns range.`,

      coreConcept: `Source
  |
  | copy range
  v
Destination
  |
  | keep up with changes
  v
Commit ownership
  |
  v
Metadata updated
  |
  v
Cleanup old data later`,

      detailedExplanation: `A migration is not simply:

copy files from Shard A to Shard B.

MongoDB must maintain a consistent distributed view while applications continue operating.

Conceptually the process includes:

1. IDENTIFY SOURCE AND DESTINATION

2. COPY DOCUMENTS FOR THE RANGE

3. TRACK CHANGES DURING MIGRATION

4. SYNCHRONIZE THE DESTINATION

5. COMMIT OWNERSHIP CHANGE

6. UPDATE ROUTING METADATA

7. CLEAN UP OLD RANGE DATA

Exact internal implementation details can change across MongoDB versions, so the DBA should focus on the operational implications.

Migrations consume:

• source reads
• destination writes
• network bandwidth
• index maintenance
• replication resources
• disk I/O

A heavily loaded cluster may therefore see latency increases during major redistribution.

Cleanup can also continue after ownership has moved, meaning disk-space recovery may not be instantaneous.

This is particularly important during emergency disk-capacity situations.`,

      internalWorking: `Shard A owns Range X
        |
        v
Copy X to Shard B
        |
        v
Sync modifications
        |
        v
Commit migration
        |
        v
Metadata says B owns X
        |
        v
Old data cleanup on A`,

      architecture: `       SOURCE SHARD A
              |
       range documents
              |
              v
       NETWORK TRANSFER
              |
              v
      DESTINATION SHARD B
              |
              v
        ownership commit
              |
              v
        metadata update`,

      examples: [
        `Migrations may increase both source and destination I/O.`,

        `Application traffic continues while supported migration mechanisms maintain correctness.`,

        `Source disk may not fall immediately after ownership moves because cleanup can lag.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Useful for reviewing range distribution and cluster state while investigating balancing activity.'
        }
      ],

      productionScenario: `A new shard is added to a busy cluster.

Hundreds of ranges begin migrating.

The team notices:

• increased disk reads on source shards
• increased writes on destination
• high network utilization
• increased replication lag

This is expected migration resource consumption, although the DBA must ensure it remains within safe limits.`,

      troubleshootingApproach: `1. Identify active migrations.

2. Identify source shards.

3. Identify destination shards.

4. Monitor source disk latency.

5. Monitor destination disk latency.

6. Monitor network.

7. Monitor replication lag.

8. Check application latency.

9. Check migration failures.

10. Check destination disk capacity.

11. Monitor cleanup behavior.

12. Determine whether balancing pressure is amplifying existing resource problems.`,

      commonMistakes: [
        'Thinking migration is metadata-only.',
        'Ignoring destination index-write cost.',
        'Expecting source disk space to drop instantly.',
        'Running large redistribution during an existing storage incident.',
        'Disabling balancing without understanding why migrations exist.'
      ],

      bestPractices: [
        'Capacity-plan migration traffic.',
        'Monitor source and destination shards.',
        'Maintain disk headroom.',
        'Correlate migration timing with application latency.',
        'Use version-specific diagnostic tools.'
      ],

      interviewAnswer: `A range migration conceptually copies the range to a destination shard, synchronizes changes occurring during the migration, commits the new ownership, updates routing metadata, and later cleans up obsolete source data.

It consumes network, disk, CPU, indexes, and replication capacity, so I monitor both source and destination shards during large balancing activity.`,

      keyTakeaways: [
        'Migrations physically move data.',
        'Writes may continue during the process.',
        'Metadata ownership changes at commit.',
        'Cleanup may happen afterward.',
        'Migrations consume significant resources.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 7,
    question:
      'What is stale routing metadata in a MongoDB sharded cluster, how can it occur, and how does MongoDB recover from it?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `mongos and shard processes maintain routing information about which shard owns which data ranges.

Because ranges can migrate, cached routing information can temporarily become outdated.

This is called stale routing metadata.`,

      coreConcept: `Before migration:

Range X -> Shard A

mongos cache:
X -> A


Migration:

Range X -> Shard B


Old mongos cache temporarily:
X -> A

Cluster metadata:
X -> B

MongoDB detects stale routing
and refreshes metadata.`,

      detailedExplanation: `A sharded cluster is dynamic.

Range ownership can change because of:

• balancing
• manual supported movement
• resharding
• topology operations

mongos caches routing metadata to avoid contacting config servers for every operation.

Suppose mongos believes:

Range X belongs to Shard A.

But a migration has completed and ownership is now:

Shard B.

When the stale router sends an operation according to the old placement, MongoDB's sharding protocol can detect that the routing information is stale.

The router refreshes metadata and retries appropriately according to operation semantics and driver/server behavior.

This is expected distributed-system behavior.

However, persistent routing problems may indicate:

• connectivity issues with config servers
• repeated metadata refresh failures
• unstable migrations
• version/cluster problems
• overloaded routers or infrastructure

A DBA should not manually edit cached or config metadata to fix normal stale-config behavior.`,

      internalWorking: `mongos cache:
Range 1 -> A

Actual metadata:
Range 1 -> B

Operation sent to A
      |
      v
stale-version detected
      |
      v
routing refresh
      |
      v
Range 1 -> B
      |
      v
operation routed correctly`,

      architecture: `                MONGOS
              cached metadata
                    |
                    v
                 Shard A
                    |
               stale detected
                    |
                    v
             CONFIG SERVERS
                    |
                    v
             refreshed metadata
                    |
                    v
                 Shard B`,

      examples: [
        `Stale routing can occur naturally after migrations.`,

        `Transient stale metadata does not automatically mean cluster corruption.`,

        `Persistent refresh failures require deeper investigation.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Provides the current administrative view of sharding placement.'
        }
      ],

      productionScenario: `During heavy balancing, application logs show a small number of transient routing retries.

The DBA sees that ranges are actively migrating.

If MongoDB refreshes metadata successfully and latency remains acceptable, this may be expected transient behavior.

If stale-routing errors persist continuously, the DBA investigates config-server connectivity and router health.`,

      troubleshootingApproach: `1. Determine whether migrations are active.

2. Check mongos logs.

3. Check config server health.

4. Check network between mongos and config servers.

5. Check shard connectivity.

6. Identify repeated stale-routing errors.

7. Determine whether retries recover automatically.

8. Check metadata operation latency.

9. Check version compatibility.

10. Avoid unsupported metadata edits.`,

      commonMistakes: [
        'Treating every stale-routing event as corruption.',
        'Restarting all mongos routers immediately.',
        'Editing config metadata manually.',
        'Ignoring config-server connectivity.',
        'Ignoring concurrent migrations.'
      ],

      bestPractices: [
        'Understand stale routing as a normal possibility in dynamic clusters.',
        'Monitor persistent rather than isolated events.',
        'Keep config servers highly available.',
        'Use supported diagnostics.',
        'Avoid direct metadata manipulation.'
      ],

      interviewAnswer: `mongos caches routing metadata, so after range movement it can temporarily hold an outdated view. MongoDB detects stale routing versions, refreshes metadata, and reroutes or retries according to operation semantics.

Occasional stale metadata during migrations can be normal, but persistent refresh failures require checking mongos, config servers, networking, and migration stability.`,

      keyTakeaways: [
        'Routing metadata is cached.',
        'Range migrations can make caches temporarily stale.',
        'MongoDB can refresh stale metadata.',
        'Persistent failures are abnormal.',
        'Manual metadata editing is not the fix.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 8,
    question:
      'How do scatter-gather queries scale as shard count increases, and why can adding more shards sometimes make a poorly targeted workload slower?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `More shards do not automatically make every query faster.

For a scatter-gather query, mongos may send work to many or all shards.

As shard count increases, one logical request can involve more servers.`,

      coreConcept: `3 shards:

Query
 |
 +--> A
 +--> B
 +--> C


30 shards:

Query
 |
 +--> 30 participating shards

More:
• network requests
• shard execution
• result merging
• tail-latency exposure`,

      detailedExplanation: `Consider a query that cannot be targeted using the shard key.

With:

3 shards

mongos sends the query to 3 shards.

Later the cluster grows to:

20 shards.

The same query may now involve 20 shards.

Even if every shard is individually faster because each stores less data, distributed overhead can increase.

Potential costs include:

• more network fan-out
• more query execution processes
• more result streams
• more mongos merge work
• more connections
• greater sensitivity to slowest-shard latency

TAIL LATENCY

Suppose:

19 shards respond in 20 ms.

One shard responds in 500 ms.

If the query requires results from all shards, total latency may be dominated by the slowest participant.

Therefore adding shards can expose a poor query-routing design.

This is a key scaling principle:

Horizontal scale works best when workload can also be partitioned.

If every request still touches every shard, scaling efficiency is limited.`,

      internalWorking: `Query latency conceptually:

mongos sends to:

A = 20 ms
B = 22 ms
C = 25 ms
D = 400 ms

If all responses are required:

overall query may wait on D.

More shards =
more opportunities for a slow participant.`,

      architecture: `               MONGOS
                 |
        scatter-gather
    +------+-----+-----+------+
    |      |     |     |      |
    v      v     v     v      v
    A      B     C     D ...  N
                         |
                      slowest
                       shard
                         |
                         v
                  overall latency`,

      examples: [
        `Targeted query touching one shard can scale differently from a query touching all shards.`,

        `Shard count growth should be accompanied by query-routing review.`,

        `Tail latency matters in distributed queries.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ status: "OPEN" }).explain("executionStats")',
          explanation:
            'In a sharded cluster, explain helps show participating shards and their individual execution behavior.'
        }
      ],

      productionScenario: `A cluster grows from:

4 shards

to:

16 shards.

The application expects all queries to become faster.

Instead, a reporting endpoint gets slower.

The query does not contain the shard key and now fans out to all sixteen shards.

One consistently slow shard causes the entire distributed operation to wait.

The problem is query targeting, not insufficient shard count.`,

      troubleshootingApproach: `1. Identify shard key.

2. Capture slow query.

3. Run explain through mongos.

4. Count participating shards.

5. Compare per-shard execution time.

6. Identify slowest participants.

7. Check result volume.

8. Check mongos merge work.

9. Check network latency.

10. Compare behavior before and after shard-count increase.

11. Determine whether the query can become targeted.

12. Review shard key if critical queries cannot scale.`,

      commonMistakes: [
        'Assuming more shards always reduce latency.',
        'Ignoring fan-out cost.',
        'Looking only at average shard latency.',
        'Ignoring slowest-shard behavior.',
        'Adding capacity before fixing routing.'
      ],

      bestPractices: [
        'Measure shards touched per query.',
        'Keep high-frequency queries targeted where possible.',
        'Monitor tail latency per shard.',
        'Scale workload partitioning along with hardware.',
        'Use explain after major shard-count changes.'
      ],

      interviewAnswer: `Scatter-gather queries can become more expensive as shard count grows because mongos must fan out to more servers and merge more responses.

The overall latency can also be dominated by the slowest participating shard. Therefore adding shards can actually expose or worsen a poorly targeted query pattern even though total cluster capacity increases.`,

      keyTakeaways: [
        'More shards mean greater scatter-gather fan-out.',
        'Distributed merge cost grows.',
        'Tail latency matters.',
        'Adding shards does not fix poor routing.',
        'Workload partitioning is critical to horizontal scaling.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 9,
    question:
      'What should a DBA understand about unique indexes and uniqueness constraints in a sharded MongoDB collection?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Uniqueness in a sharded collection is more complicated than in a single replica set because different shards own different portions of data.

MongoDB must be able to enforce the requested uniqueness correctly across the distributed dataset.

Therefore unique-index rules interact with the shard key.`,

      coreConcept: `Single replica set:

One logical data placement
     |
     v
Unique index checked locally


Sharded collection:

Shard A
Shard B
Shard C

Global uniqueness must be
compatible with shard routing
and shard-key design.`,

      detailedExplanation: `Suppose a collection is sharded by:

{ tenantId: 1 }

The application wants a unique index on:

{ email: 1 }

Imagine:

Shard A contains:

email = user@example.com

Shard B also contains:

email = user@example.com

If routing and index structure do not allow global uniqueness enforcement, independent shard-local uniqueness checks are not enough to guarantee one value cluster-wide.

For this reason MongoDB imposes constraints on unique indexes for sharded collections.

A common design pattern is for the shard key to be the prefix of the unique index where required.

Example:

Shard key:

{ tenantId: 1 }

Unique index:

{ tenantId: 1, email: 1 }

This enforces uniqueness for email within each tenant rather than globally across unrelated tenantId values.

Exact permitted unique-index combinations and rules should be verified for the deployed MongoDB version.

The architectural question is:

What uniqueness does the business really require?

• globally unique email?
• unique per tenant?
• unique per region?

That requirement should influence shard-key and index design.`,

      internalWorking: `Business rule:

email unique per tenant

Shard key:
tenantId

Unique index:
tenantId + email

Logical constraint:

Tenant A:
email X only once

Tenant B:
email X can exist separately`,

      architecture: `           SHARD KEY DESIGN
                   |
                   v
             UNIQUE INDEX
                   |
                   v
       What uniqueness scope?
          /        |        \
         v         v         v
      global    tenant    region
                scoped     scoped`,

      examples: [
        `Per-tenant uniqueness:

{ tenantId: 1, email: 1 }`,

        `Global uniqueness requirements can strongly constrain shard-key design.`,

        `Do not assume a shard-local unique index automatically enforces global uniqueness.`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true })',
          explanation:
            'Illustrates a compound uniqueness rule compatible with a tenant-scoped design. Validate against actual shard key and MongoDB version.'
        }
      ],

      productionScenario: `A multi-tenant application shards users by tenantId.

Business requirement:

Email must be unique within each tenant.

A compound unique index:

{ tenantId: 1, email: 1 }

matches that business rule.

Later the business changes the requirement to:

Email must be globally unique.

That is no longer merely an index change—it may affect shard-key and application architecture.`,

      troubleshootingApproach: `1. Identify shard key.

2. Identify required uniqueness scope.

3. List existing unique indexes.

4. Check whether uniqueness must be global or scoped.

5. Review MongoDB version-specific restrictions.

6. Check existing duplicate data.

7. Evaluate application-generated unique IDs where appropriate.

8. Test index creation in staging.

9. Never assume single-node uniqueness rules transfer unchanged to sharding.`,

      commonMistakes: [
        'Assuming uniqueness is automatically global.',
        'Ignoring shard-key relationship.',
        'Creating a unique index without checking existing duplicates.',
        'Confusing tenant-scoped uniqueness with global uniqueness.',
        'Ignoring version-specific rules.'
      ],

      bestPractices: [
        'Define business uniqueness clearly.',
        'Design shard key and unique index together.',
        'Validate data before creating constraints.',
        'Test in a sharded environment.',
        'Verify exact rules for deployed MongoDB version.'
      ],

      interviewAnswer: `Unique constraints in a sharded collection must be compatible with the shard-key design because data is distributed across multiple shards.

I first determine whether the business requires global uniqueness or scoped uniqueness such as per tenant, then design the shard key and unique index together and verify the exact MongoDB-version restrictions before implementation.`,

      keyTakeaways: [
        'Distributed uniqueness is more complex.',
        'Shard key and unique index are related.',
        'Uniqueness scope must be defined.',
        'Per-tenant and global uniqueness differ.',
        'Version-specific rules must be verified.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 10,
    question:
      'How should a DBA decide whether to scale a MongoDB workload vertically, add replica-set capacity, or introduce additional shards?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `Not every performance problem needs another shard.

A DBA should first identify what resource is actually limiting the workload.

Possible strategies include:

• query/index optimization
• vertical scaling
• replica-set read scaling
• adding shards
• application redesign.`,

      coreConcept: `Start with bottleneck:

CPU?
Memory?
Disk?
Storage capacity?
Reads?
Writes?
Hot key?
Bad queries?

Then choose scaling method.

Do not start with:

"add shards."`,

      detailedExplanation: `VERTICAL SCALING

Useful when one server can still economically handle the workload with:

• more CPU
• more RAM
• faster disk
• more storage

Advantages:

• simpler architecture
• fewer distributed operations

Limit:

eventually one server reaches practical limits.

REPLICA-SET READ SCALING

Some read workloads may be distributed to Secondaries using appropriate read preference and consistency requirements.

But adding Secondaries does not distribute Primary writes.

SHARDING

Useful when:

• dataset exceeds practical single-replica-set capacity
• write throughput must be distributed
• storage must scale horizontally
• workload naturally partitions

But sharding introduces:

• shard keys
• routing
• balancing
• migration
• distributed-query complexity

QUERY OPTIMIZATION

A query examining:

100 million documents

should not automatically trigger sharding.

An appropriate index may reduce work to:

hundreds of keys.

Therefore a disciplined decision process is:

1. optimize inefficient queries
2. identify actual resource ceiling
3. determine whether vertical growth is sufficient
4. determine whether reads can be distributed safely
5. use sharding when horizontal partitioning is genuinely required.`,

      internalWorking: `Performance problem
       |
       v
Can query/index fix it?
    /      \
  YES      NO
  |         |
  v         v
fix      identify bottleneck
            |
     +------+------+
     |      |      |
     v      v      v
vertical  reads  horizontal
 scale    via RS   shards`,

      architecture: `                WORKLOAD
                    |
                    v
              Bottleneck analysis
        +-----------+-----------+
        |           |           |
        v           v           v
      QUERY       SERVER      CLUSTER
    efficiency   capacity      limits
        |           |           |
        v           v           v
     indexes     vertical      sharding
                 scaling`,

      examples: [
        `CPU high due to COLLSCAN:
fix query/index first.`,

        `Storage nearing hardware maximum:
evaluate horizontal partitioning.`,

        `Read-heavy reporting:
evaluate suitable Secondary reads before sharding solely for reads.`
      ],

      commands: [
        {
          command:
            'db.collection.find(query).explain("executionStats")',
          explanation:
            'Used to determine whether query inefficiency is the real scaling problem.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server-level metrics useful when identifying resource constraints.'
        }
      ],

      productionScenario: `A 1 TB replica set experiences 90% CPU.

Management recommends adding three shards.

The DBA analyzes the workload and finds one unindexed query responsible for most CPU.

After adding the correct compound index:

CPU falls to 35%.

Sharding would have introduced major architectural complexity without fixing the real problem.

Six months later storage and write throughput genuinely approach single-replica-set limits.

At that point the DBA evaluates sharding based on actual horizontal-scaling requirements.`,

      troubleshootingApproach: `Before scaling architecture:

1. Measure CPU.

2. Measure memory/cache.

3. Measure disk latency.

4. Measure storage growth.

5. Measure read/write throughput.

6. Identify top queries.

7. Run explain.

8. Fix inefficient indexes/queries.

9. Determine read/write split.

10. Determine whether vertical scaling remains viable.

11. Determine whether Secondary reads are appropriate.

12. Determine whether workload can partition by a good shard key.

13. Model future growth.

14. Choose the simplest architecture that meets the requirement.`,

      commonMistakes: [
        'Using sharding as the first performance fix.',
        'Ignoring bad queries.',
        'Thinking Secondaries distribute Primary writes.',
        'Scaling vertically forever without growth planning.',
        'Adding shards without a viable shard key.'
      ],

      bestPractices: [
        'Optimize before scaling.',
        'Measure the actual bottleneck.',
        'Prefer simpler architecture when it meets requirements.',
        'Shard when horizontal distribution is truly needed.',
        'Plan for future workload growth.'
      ],

      interviewAnswer: `I first identify whether the bottleneck is query efficiency, CPU, memory, disk, storage capacity, reads, or writes.

I fix inefficient queries before changing architecture. If a stronger single replica set can still meet the workload, vertical scaling may be simpler. Read-heavy workloads may use suitable Secondary reads. I introduce sharding when storage or throughput genuinely needs horizontal partitioning and a good shard key exists.`,

      keyTakeaways: [
        'Sharding is not the first fix for every problem.',
        'Query optimization comes first.',
        'Vertical scaling is simpler when sufficient.',
        'Secondaries can help some read workloads.',
        'Sharding is for genuine horizontal-scaling needs.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 11,
    question:
      'How would you plan and monitor a large production resharding operation without overwhelming the MongoDB cluster?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `Resharding can redistribute a very large portion of a collection.

For a multi-terabyte collection, this can create significant:

• disk reads
• disk writes
• network traffic
• CPU consumption
• cache pressure
• replication traffic
• temporary storage requirements.

Therefore resharding should be treated as a controlled production migration, not as a routine metadata change.`,

      coreConcept: `Safe resharding:

Prove shard-key problem
        |
        v
Design new key
        |
        v
Validate distribution
        |
        v
Capacity planning
        |
        v
Cluster health check
        |
        v
Start resharding
        |
        v
Continuous monitoring
        |
        v
Commit / validate`,

      detailedExplanation: `Before resharding, the DBA should answer four major questions.

1. WHY ARE WE RESHARDING?

Examples:

• hot shard
• monotonic shard key
• poor query targeting
• extreme tenant skew
• changed application access pattern

Do not perform resharding when an index or application change would solve the actual problem.

2. IS THE NEW SHARD KEY BETTER?

Measure:

• cardinality
• frequency
• monotonicity
• query targeting
• write distribution
• hot values
• future growth

3. DOES THE CLUSTER HAVE ENOUGH HEADROOM?

Review every shard for:

• free disk
• CPU
• WiredTiger cache pressure
• disk latency
• disk throughput
• network capacity
• replication lag
• oplog window

Also validate config server health.

4. CAN WE OBSERVE THE OPERATION?

Monitoring should include:

• application latency
• per-shard CPU
• disk latency
• network throughput
• replication lag
• storage growth
• resharding progress
• errors and warnings

Exact resharding phases, controls, abort behavior, and temporary storage requirements depend on MongoDB version.

Always use documentation for the deployed release when planning the actual production procedure.`,

      internalWorking: `Existing collection
        |
        v
Old shard-key distribution
        |
        v
Read/copy documents
        |
        v
Calculate new ownership
        |
        v
Transfer data
        |
        v
Synchronize ongoing changes
        |
        v
Commit
        |
        v
New shard-key distribution`,

      architecture: `                APPLICATION
                     |
                     v
                   MONGOS
                     |
              RESHARDING WORK
          +----------+----------+
          |          |          |
          v          v          v
       Shard A    Shard B    Shard C
          |          |          |
          +----- data movement --+
                     |
                     v
              CONFIG SERVERS
                     |
                     v
                new metadata`,

      examples: [
        `A 5 TB collection requires much more planning than a 5 GB test collection.`,
        `A healthy cluster can become unhealthy if resharding consumes remaining disk or I/O headroom.`,
        `A technically valid new shard key can still be operationally poor if it creates hot tenants.`
      ],

      commands: [
        {
          command:
            'sh.reshardCollection("app.events", { tenantId: 1, eventId: "hashed" })',
          explanation:
            'Illustrative resharding command. Exact supported syntax and options must be checked for the deployed MongoDB version.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Useful for validating cluster and collection distribution before and after the operation.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Run against each shard replica set to verify replication health.'
        }
      ],

      productionScenario: `A 7 TB events collection uses createdAt as a ranged shard key.

The newest range receives most writes and one shard is constantly overloaded.

A new compound strategy is tested successfully.

Before resharding, the DBA discovers one destination shard has only 600 GB free space and already experiences high disk latency.

Instead of starting the operation, capacity is increased first.

This prevents resharding from converting a shard-key problem into a storage outage.`,

      troubleshootingApproach: `1. Establish why resharding is required.

2. Validate the new shard key.

3. Measure collection and index size.

4. Measure free disk on every shard.

5. Check CPU and memory.

6. Check disk latency and throughput.

7. Check network capacity.

8. Check replication lag.

9. Check oplog window.

10. Verify config server health.

11. Verify backups and recovery plan.

12. Choose a suitable workload window.

13. Start using the supported procedure.

14. Monitor progress continuously.

15. Correlate application latency with resharding activity.

16. Validate final distribution and routing.`,

      commonMistakes: [
        'Starting resharding on an already overloaded cluster.',
        'Choosing the new key without production-like testing.',
        'Ignoring temporary storage requirements.',
        'Ignoring network saturation.',
        'Treating resharding as an instant metadata operation.'
      ],

      bestPractices: [
        'Treat resharding as a migration project.',
        'Maintain substantial resource headroom.',
        'Test the new shard key before production.',
        'Monitor every shard individually.',
        'Use version-specific operational documentation.'
      ],

      interviewAnswer: `For production resharding, I first prove that the existing shard key is the root cause and validate the replacement using cardinality, frequency, monotonicity, routing, and write distribution.

Then I capacity-plan disk, CPU, network, cache, replication, and oplog headroom. During the operation I monitor resharding progress, every shard, config servers, and application latency. I treat multi-terabyte resharding as a major production migration.`,

      keyTakeaways: [
        'Resharding can be resource intensive.',
        'New shard-key quality must be proven first.',
        'Disk and network headroom are critical.',
        'Cluster health must be monitored continuously.',
        'Version-specific behavior matters.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 12,
    question:
      'How would you troubleshoot zone-sharding data that is not being placed on the expected shards?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Zone sharding depends on several pieces matching correctly:

• shard zone membership
• shard-key definition
• zone key ranges
• balancer activity
• destination capacity
• healthy migrations.

If data remains on unexpected shards, investigate these layers instead of manually modifying metadata.`,

      coreConcept: `Expected placement
       |
       v
Check shard zones
       |
       v
Check zone ranges
       |
       v
Check shard key
       |
       v
Check balancer
       |
       v
Check migrations
       |
       v
Check capacity/errors`,

      detailedExplanation: `Suppose:

Shard A and B belong to INDIA.

Shard C and D belong to EUROPE.

The DBA expects Indian data to reside only on A/B.

But some expected ranges remain elsewhere.

Possible reasons include:

1. INCORRECT ZONE MEMBERSHIP

The expected destination shard may not actually belong to the zone.

2. INCORRECT RANGE BOUNDARIES

For compound shard keys, boundaries must match the shard-key structure correctly.

3. BALANCING HAS NOT COMPLETED

Zone configuration establishes placement constraints, but required migrations may take time.

4. MIGRATION FAILURE

Disk, network, replication, or cluster-health problems may block movement.

5. INSUFFICIENT CAPACITY

Zone shards may not have enough storage or resources.

6. WRONG ASSUMPTION ABOUT SHARD KEY

Application geography may not map cleanly to the selected shard key.

The DBA should compare:

desired policy

versus:

actual metadata

versus:

actual physical placement.

Direct modifications to config database metadata should not be used as a shortcut.`,

      internalWorking: `Policy:

Range X -> INDIA

       |
       v

Zone metadata
       |
       v
Eligible shards:
A, B
       |
       v
Balancer migration
       |
       v
Actual placement

If placement differs:
inspect each stage.`,

      architecture: `                 RANGE X
                    |
                    v
                INDIA ZONE
                    |
              +-----+-----+
              |           |
              v           v
           Shard A     Shard B

Unexpected Shard C ownership
          |
          v
Check migration/balancer/
range configuration.`,

      examples: [
        `Compound shard-key boundaries must include the appropriate fields.`,
        `Correct zone metadata does not mean migration completes instantly.`,
        `Insufficient capacity inside a zone can create operational problems.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Starting point for reviewing zone and sharded collection placement.'
        }
      ],

      productionScenario: `A compliance rule requires Indian customer ranges to move onto India-zone shards.

Configuration appears correct, but movement stops.

Investigation finds destination shards are near their disk-capacity threshold and migration attempts are failing.

The problem is not the zone definition itself; the zone lacks sufficient capacity.`,

      troubleshootingApproach: `1. Confirm actual shard key.

2. Confirm shard zone membership.

3. Inspect zone ranges.

4. Validate lower and upper boundaries.

5. Check actual range ownership.

6. Check balancer activity.

7. Check migration failures.

8. Check destination disk.

9. Check destination I/O.

10. Check network.

11. Check replication health.

12. Verify final placement after migrations complete.`,

      commonMistakes: [
        'Assuming zone assignment immediately moves all data.',
        'Defining incorrect compound boundaries.',
        'Ignoring capacity within the zone.',
        'Ignoring failed migrations.',
        'Editing config metadata manually.'
      ],

      bestPractices: [
        'Validate zone ranges carefully.',
        'Capacity-plan each zone.',
        'Monitor migration completion.',
        'Maintain HA within every zone.',
        'Audit actual placement against policy.'
      ],

      interviewAnswer: `If zone placement is incorrect, I verify shard-zone membership, zone key ranges, shard-key boundaries, balancer state, migration activity, destination capacity, and replica-set health.

I separate configuration correctness from migration completion and never directly manipulate config metadata as a shortcut.`,

      keyTakeaways: [
        'Zone placement depends on correct metadata and successful migrations.',
        'Compound boundaries require care.',
        'Capacity is required inside each zone.',
        'Placement changes are not instantaneous.',
        'Use supported administrative procedures.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 13,
    question:
      'How do aggregation pipelines behave in a sharded MongoDB cluster, and what should a DBA analyze when an aggregation becomes slow?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `An aggregation in a sharded cluster may execute work across multiple shards.

Some stages can execute on shards, while results may later need to be merged.

Performance depends on:

• shard targeting
• indexes
• stage ordering
• data reduction
• network transfer
• merge work.`,

      coreConcept: `Aggregation
     |
     v
mongos determines targets
     |
 +---+---+
 |       |
 v       v
Shard A Shard B ...
 |       |
 +---+---+
     |
     v
Merge/final processing
     |
     v
Result`,

      detailedExplanation: `Consider:

[
  { $match: ... },
  { $sort: ... },
  { $group: ... }
]

If the $match contains a useful shard-key predicate, fewer shards may participate.

If it does not, the pipeline may fan out.

A selective early $match can reduce data significantly.

Indexes may support:

• $match
• some sorting patterns
• other eligible early pipeline work.

Stages such as grouping or sorting may require substantial processing depending on pipeline shape.

The DBA should ask:

1. HOW MANY SHARDS PARTICIPATE?

2. HOW MANY DOCUMENTS ENTER THE PIPELINE?

3. HOW EARLY IS DATA REDUCED?

4. ARE INDEXES USED?

5. HOW MUCH DATA MOVES BETWEEN COMPONENTS?

6. WHERE DOES MERGE WORK OCCUR?

7. ARE BLOCKING STAGES PROCESSING LARGE DATA VOLUMES?

Exact split/merge execution behavior depends on pipeline stages and MongoDB version.

Use explain rather than assuming where every stage executes.`,

      internalWorking: `Bad:

10 million docs
      |
      v
$group
      |
      v
large distributed work


Better where semantically possible:

10 million docs
      |
      v
selective indexed $match
      |
      v
20,000 docs
      |
      v
$group`,

      architecture: `                 MONGOS
                    |
             pipeline routing
          +---------+---------+
          |                   |
          v                   v
       Shard A             Shard B
       partial              partial
        work                 work
          \                   /
           \                 /
            v               v
              merge processing
                    |
                    v
                  result`,

      examples: [
        `An early selective $match can dramatically reduce downstream work.`,
        `A pipeline without shard-key targeting may involve many shards.`,
        `Large distributed sorts/groups can consume significant resources.`
      ],

      commands: [
        {
          command:
            'db.orders.explain("executionStats").aggregate([{ $match: { tenantId: 1001 } }, { $group: { _id: "$status", count: { $sum: 1 } } }])',
          explanation:
            'Illustrates examining aggregation execution and shard participation.'
        }
      ],

      productionScenario: `A reporting aggregation suddenly takes 40 seconds.

Explain shows every shard participates.

The initial $match filters on a non-shard-key field and does not efficiently reduce the dataset.

Millions of documents flow into later grouping work.

The DBA evaluates query targeting, indexes, pipeline ordering, and whether the reporting workload should be redesigned.`,

      troubleshootingApproach: `1. Capture exact pipeline.

2. Run explain.

3. Count participating shards.

4. Inspect early $match.

5. Check index usage.

6. Track document counts between stages.

7. Identify blocking stages.

8. Inspect sort behavior.

9. Inspect grouping volume.

10. Inspect network impact.

11. Compare per-shard performance.

12. Identify merge bottleneck.

13. Optimize pipeline and indexes.

14. Reconsider data model if necessary.`,

      commonMistakes: [
        'Treating aggregation as a single-server operation.',
        'Ignoring shard targeting.',
        'Looking only at final execution time.',
        'Allowing huge intermediate datasets unnecessarily.',
        'Assuming every stage executes on mongos.'
      ],

      bestPractices: [
        'Use explain for aggregation.',
        'Reduce data early when semantically valid.',
        'Support early filters with indexes.',
        'Monitor per-shard execution.',
        'Minimize unnecessary distributed data movement.'
      ],

      interviewAnswer: `In a sharded cluster, aggregation work can be distributed across shards and later merged. I analyze shard targeting, index use, stage cardinality, early filtering, blocking stages, network transfer, per-shard execution, and merge work.

I use explain because exact pipeline splitting depends on the stages and MongoDB version.`,

      keyTakeaways: [
        'Aggregation can be distributed.',
        'Shard targeting matters.',
        'Early data reduction is valuable.',
        'Blocking stages can become expensive.',
        'Explain reveals actual execution.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 14,
    question:
      'What should a DBA understand about $lookup and cross-shard joins when designing a scalable MongoDB sharded workload?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `$lookup allows aggregation pipelines to combine documents from collections.

In a sharded environment, this can become more expensive because the required data may exist across different shards.

A DBA should evaluate both:

• logical join cardinality
• distributed execution cost.`,

      coreConcept: `Local documents
      |
      v
$lookup
      |
      v
Foreign collection
      |
      +--> index?
      +--> targeted?
      +--> many shards?
      +--> how many matches?
      |
      v
Join cost`,

      detailedExplanation: `A poorly designed $lookup can create substantial work even on a non-sharded database.

Sharding adds another dimension.

Important questions include:

1. HOW MANY LOCAL DOCUMENTS ENTER $lookup?

If 1 million documents reach the join stage, even individually inexpensive lookups can become costly.

2. IS THE FOREIGN JOIN FIELD INDEXED?

Without an appropriate foreign-side index, repeated lookups can become expensive.

3. IS THE FOREIGN COLLECTION SHARDED?

Modern MongoDB versions support increasingly capable $lookup behavior with sharded collections, but execution details depend on version and pipeline shape.

4. CAN FOREIGN OPERATIONS BE TARGETED?

Poor targeting can increase distributed work.

5. HOW MANY MATCHES EXIST PER LOCAL DOCUMENT?

One-to-many explosions can create huge intermediate results.

The DBA should not automatically conclude:

"$lookup is bad."

Instead evaluate:

• cardinality
• indexes
• targeting
• stage placement
• intermediate result size
• network and CPU.

Sometimes embedding or precomputed data is better for extremely frequent joins, but that is a data-model decision based on workload.`,

      internalWorking: `100 local docs
      |
      v
$lookup
      |
100 indexed targeted lookups
      |
      v
manageable


1,000,000 local docs
      |
      v
poorly indexed distributed lookup
      |
      v
potentially huge workload`,

      architecture: `             PIPELINE
                |
                v
             $lookup
          /      |      \
         v       v       v
      Shard A Shard B Shard C
         \       |       /
          \      |      /
             results
                |
                v
          pipeline continues`,

      examples: [
        `Filter local documents before $lookup when logically possible.`,
        `Index the foreign join field where appropriate.`,
        `Watch for one-to-many result explosions.`
      ],

      commands: [
        {
          command:
            'db.orders.explain("executionStats").aggregate([{ $match: { tenantId: 1001 } }, { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } }])',
          explanation:
            'Illustrates inspecting an aggregation containing $lookup.'
        }
      ],

      productionScenario: `An API joins orders to customer metadata.

A deployment accidentally removes an early tenant filter.

Instead of 200 orders entering $lookup, hundreds of thousands do.

CPU and network usage increase across the sharded cluster.

The root cause is not simply "$lookup"; it is the massive increase in join input cardinality.`,

      troubleshootingApproach: `1. Run explain.

2. Count local documents reaching $lookup.

3. Inspect foreign indexes.

4. Determine foreign collection sharding.

5. Inspect shard participation.

6. Measure matches per local document.

7. Inspect intermediate result size.

8. Check CPU/network.

9. Move selective filters earlier when valid.

10. Consider data-model alternatives for high-frequency joins.`,

      commonMistakes: [
        'Calling every $lookup inherently bad.',
        'Ignoring input cardinality.',
        'Ignoring foreign indexes.',
        'Ignoring distributed targeting.',
        'Ignoring one-to-many explosion.'
      ],

      bestPractices: [
        'Reduce join input early.',
        'Index foreign lookup fields appropriately.',
        'Measure distributed execution.',
        'Avoid unnecessarily large intermediate results.',
        'Use data modeling to reduce pathological joins where appropriate.'
      ],

      interviewAnswer: `For $lookup in a sharded workload, I analyze how many local documents enter the join, whether the foreign side is indexed, whether the foreign operations are distributed or targeted, and how many matches are produced.

The main risks are excessive join cardinality, poor indexing, and unnecessary cross-shard work rather than $lookup itself.`,

      keyTakeaways: [
        '$lookup cost depends heavily on cardinality.',
        'Foreign indexes matter.',
        'Sharding can add distributed cost.',
        'Early filtering can be critical.',
        'Data modeling may sometimes be a better long-term solution.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 15,
    question:
      'How would you design a sharding strategy for a multi-tenant application where one tenant is dramatically larger and busier than all others?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Multi-tenant systems often appear easy to shard by:

tenantId.

But a very large tenant can break that assumption.

If one tenant generates 50% of all writes, tenantId alone may create a hot tenant problem.`,

      coreConcept: `Tenants:

A = 1%
B = 2%
C = 1%
...
BIG = 60%

Shard only by tenantId:

BIG
 |
 v
one logical key value
 |
 v
potential hotspot`,

      detailedExplanation: `Suppose:

10,000 tenants exist.

At first glance:

tenantId

has excellent cardinality.

But frequency analysis shows:

Tenant BIG:
40% of documents
60% of writes

This demonstrates why cardinality alone is insufficient.

Possible designs depend on workload.

OPTION 1

Compound key:

{ tenantId: 1, entityId: 1 }

This increases granularity within each tenant.

OPTION 2

A hashed component may improve distribution depending on query and locality requirements.

OPTION 3

Use zones or dedicated placement for exceptional tenants where business architecture justifies it.

OPTION 4

Separate very large tenants operationally or architecturally if isolation requirements are strong.

But every option has tradeoffs.

If most queries require:

tenantId + entityId

a compound key may provide excellent targeting.

If queries frequently request:

all records for one tenant

spreading that tenant across many shards may convert those operations into multi-shard queries.

Therefore the DBA must balance:

• tenant isolation
• write distribution
• query locality
• scaling
• operational complexity.`,

      internalWorking: `Small tenants
    |
    +--> moderate workload

Large tenant
    |
    v
subdivide using additional
shard-key dimension
    |
 +--+--+--+
 |  |  |  |
 v  v  v  v
multiple ranges/shards

But tenant-wide queries
may become distributed.`,

      architecture: `                 TENANT WORKLOAD
                       |
             +---------+---------+
             |                   |
             v                   v
       normal tenants        huge tenant
             |                   |
             v                   v
       simple placement     needs finer
                             distribution`,

      examples: [
        `{ tenantId: 1, entityId: 1 } can increase granularity.`,
        `A hashed component may improve distribution but affect locality.`,
        `Dedicated placement can be considered for exceptional workloads.`
      ],

      commands: [
        {
          command:
            'db.events.aggregate([{ $group: { _id: "$tenantId", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }])',
          explanation:
            'Conceptual frequency analysis. On very large production data, use a carefully planned method to avoid creating additional load.'
        }
      ],

      productionScenario: `A SaaS platform has 50,000 customers.

One banking customer generates more traffic than the next 10,000 tenants combined.

A tenantId-only shard key would logically isolate that customer's data but could concentrate its workload.

The DBA models compound alternatives that subdivide the large tenant while preserving acceptable routing for normal APIs.`,

      troubleshootingApproach: `1. Measure tenant cardinality.

2. Measure data size per tenant.

3. Measure reads/writes per tenant.

4. Identify outliers.

5. Capture tenant query patterns.

6. Determine tenant-wide operations.

7. Test compound shard keys.

8. Test distribution of the largest tenant.

9. Measure routing implications.

10. Consider zones/isolation if justified.

11. Model future tenant growth.`,

      commonMistakes: [
        'Choosing tenantId based only on cardinality.',
        'Ignoring the largest tenant.',
        'Distributing a tenant without considering tenant-wide queries.',
        'Assuming every tenant has similar workload.',
        'Overengineering all tenants because of one exception.'
      ],

      bestPractices: [
        'Measure tenant frequency and workload.',
        'Design explicitly for outliers.',
        'Balance distribution with query locality.',
        'Use representative large-tenant testing.',
        'Revisit architecture as tenant sizes evolve.'
      ],

      interviewAnswer: `For multi-tenant sharding, I do not evaluate tenantId only by cardinality. I measure data size and read/write frequency per tenant to identify outliers.

If one tenant dominates, I evaluate a compound key that subdivides data within that tenant while considering the cost to tenant-wide queries. Depending on requirements, zones or dedicated isolation may also be appropriate.`,

      keyTakeaways: [
        'Tenant cardinality can hide severe skew.',
        'Large tenants require explicit design.',
        'Compound keys can subdivide tenants.',
        'Distribution and locality trade off.',
        'Workload frequency matters as much as data size.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 16,
    question:
      'A sharded production cluster is approaching critical disk usage. How would you safely add capacity and redistribute data without causing an outage?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `Critical disk usage in a sharded cluster requires controlled action.

Adding a shard can provide capacity, but redistribution itself consumes:

• disk I/O
• network
• replication
• temporary operational headroom.

Waiting until disks are completely full can make recovery much harder.`,

      coreConcept: `Disk pressure
     |
     v
Measure remaining headroom
     |
     v
Reduce avoidable growth
     |
     v
Prepare healthy new shard
     |
     v
Add shard
     |
     v
Controlled redistribution
     |
     v
Monitor old + new shards`,

      detailedExplanation: `Suppose three shards are:

Shard A = 91%
Shard B = 88%
Shard C = 90%

The DBA must first determine:

• growth rate
• time to exhaustion
• which collections consume space
• whether one shard is disproportionately full
• whether temporary files/logs/backups share the mount
• whether data can be safely cleaned up

Adding a new shard may be appropriate, but the new shard should first be built as a healthy replica set.

After adding it, migrations redistribute ranges.

However, migrations require source reads and destination writes.

The source shard may not immediately release filesystem space because cleanup and storage-engine reuse behavior are separate from ownership movement.

Therefore capacity expansion should ideally occur before emergency thresholds.

Possible immediate actions depend on evidence:

• expand existing storage
• add a new shard
• stop unnecessary data growth
• remove obsolete data using approved retention processes
• manage balancing/migration pressure

Never manually delete MongoDB data files to create space.`,

      internalWorking: `Existing:

A 91%
B 88%
C 90%

Add D:

D 5%

Migration:
A/B/C -> D

But:

source I/O rises
network rises
destination writes rise

Therefore headroom is still required.`,

      architecture: `             HIGH-DISK CLUSTER
             /       |       \
            A        B        C
           91%      88%      90%
                     |
                ADD SHARD D
                     |
                     v
             controlled migration
              /      |      \
             v       v       v
             A       B       C
               \     |     /
                     v
                     D`,

      examples: [
        `Adding capacity at 70–75% utilization is safer than waiting for 98%.`,
        `A new shard does not instantly reduce old shard disk usage.`,
        `Storage expansion and shard addition solve different aspects of capacity.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Confirms configured shards.'
        },
        {
          command:
            'sh.addShard("newShardRS/host1:27017,host2:27017,host3:27017")',
          explanation:
            'Illustrates adding a healthy replica set as a shard.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Reviews redistribution and cluster state.'
        }
      ],

      productionScenario: `A 12 TB cluster grows 300 GB per day and reaches 92% disk.

The DBA calculates only a few days of remaining headroom.

Instead of waiting for automatic balancing to save the environment, the team expands storage immediately and adds another properly sized shard.

Redistribution is monitored for I/O and replication impact.

Long-term alert thresholds are lowered so future capacity is added much earlier.`,

      troubleshootingApproach: `1. Measure disk utilization per shard.

2. Measure growth rate.

3. Calculate time to exhaustion.

4. Identify largest collections/indexes.

5. Check unrelated filesystem consumers.

6. Check current balancing.

7. Verify backup/retention jobs.

8. Determine whether storage can be expanded immediately.

9. Prepare healthy new shard.

10. Add it.

11. Monitor migrations.

12. Monitor source I/O.

13. Monitor destination I/O.

14. Monitor network.

15. Monitor replication lag.

16. Verify disk trend improves.

17. Correct capacity-alert thresholds.`,

      commonMistakes: [
        'Waiting until 99–100% disk.',
        'Assuming addShard instantly frees space.',
        'Deleting MongoDB files manually.',
        'Ignoring migration I/O.',
        'Adding an unhealthy shard during an emergency.'
      ],

      bestPractices: [
        'Capacity-plan early.',
        'Alert on both utilization and growth rate.',
        'Maintain migration headroom.',
        'Use healthy replica sets as new shards.',
        'Validate redistribution after expansion.'
      ],

      interviewAnswer: `For critical sharded-cluster disk pressure, I first calculate growth rate and time to exhaustion and identify what consumes the space. If necessary I expand existing storage for immediate safety while preparing a healthy new shard.

After adding capacity I monitor migrations, disk I/O, network, replication lag, and application latency because redistribution itself consumes resources and does not instantly release source filesystem space.`,

      keyTakeaways: [
        'Disk emergencies require growth-rate analysis.',
        'Add capacity before exhaustion.',
        'Redistribution consumes resources.',
        'New shards do not instantly free old disk.',
        'Capacity planning is better than emergency recovery.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 17,
    question:
      'A sharded cluster has high write latency only during balancing activity. How would you prove whether migrations are the cause and decide what to do?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `Balancer activity and high latency occurring at the same time does not automatically prove that balancing caused the latency.

The DBA must correlate:

• migration timing
• source/destination resource usage
• application latency
• replication lag
• disk/network saturation.`,

      coreConcept: `Latency spike
     |
     v
Migration active?
     |
     v
Which source/destination?
     |
     v
Resource saturation?
     |
     v
Timeline correlation
     |
     v
Controlled comparison
     |
     v
Causation assessment`,

      detailedExplanation: `Suppose write latency increases from:

10 ms

to:

200 ms

whenever migrations appear.

Possible causal chain:

migration
→ source reads
→ destination writes
→ replication writes
→ disk queue increases
→ application writes wait longer.

But another possibility is:

traffic spike
→ cluster imbalance
→ balancer starts migrations
→ application latency rises from traffic

In that case both are consequences of the workload increase.

Evidence should include:

• migration start/end timestamps
• disk latency
• IOPS
• throughput
• CPU
• network
• replication lag
• application write latency
• source/destination shard identity

If supported operational controls are used to temporarily adjust balancing for diagnosis, do so carefully and understand the capacity consequences.

Do not permanently disable balancing merely because it correlates with load.`,

      internalWorking: `Possible causal chain:

Migration
   |
   +--> source reads
   +--> destination writes
   +--> network
   +--> replication
             |
             v
        disk saturation
             |
             v
       write latency


But correlation must be proven.`,

      architecture: `           SOURCE SHARD
                |
                | migration
                v
          DESTINATION SHARD
                |
         replication work
                |
                v
        STORAGE / NETWORK
              pressure
                |
                v
        application latency`,

      examples: [
        `Check whether latency occurs specifically on migration source/destination shards.`,
        `Compare periods with similar traffic but different migration activity.`,
        `A balancer can be a contributor without being the original root cause.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Provides cluster distribution context while investigating migration activity.'
        }
      ],

      productionScenario: `Write latency spikes every night.

The team blames the balancer.

The DBA correlates timestamps and finds nightly batch traffic doubles writes first.

That growth creates imbalance, migrations begin shortly afterward, and migration I/O further amplifies storage pressure.

The real causal chain is:

batch workload → disk pressure + imbalance → migrations → additional pressure.

The permanent fix therefore addresses capacity and batch workload, not simply disabling balancing.`,

      troubleshootingApproach: `1. Capture latency timeline.

2. Capture migration timeline.

3. Identify source/destination shards.

4. Compare their disk latency.

5. Compare IOPS/throughput.

6. Compare CPU.

7. Compare network.

8. Compare replication lag.

9. Compare application traffic.

10. Check whether pressure starts before migrations.

11. Compare similar non-migration periods.

12. Determine whether migrations cause or amplify pressure.

13. Apply lowest-risk supported mitigation.

14. Fix underlying capacity/distribution issue.`,

      commonMistakes: [
        'Assuming correlation proves causation.',
        'Permanently disabling balancing immediately.',
        'Ignoring workload spikes.',
        'Ignoring replication overhead.',
        'Looking only at cluster averages.'
      ],

      bestPractices: [
        'Use timestamp correlation.',
        'Measure source and destination separately.',
        'Distinguish cause from amplifier.',
        'Preserve long-term data balance.',
        'Fix underlying capacity problems.'
      ],

      interviewAnswer: `I prove migration impact by correlating migration start/end times with source and destination disk, network, CPU, replication lag, and application write latency.

I also check whether workload pressure began before migrations. The balancer may be the cause, an amplifier, or simply another consequence of imbalance. I avoid permanently disabling it without proving the causal chain.`,

      keyTakeaways: [
        'Correlation is not causation.',
        'Migration source and destination must be measured.',
        'Replication adds destination cost.',
        'Balancer may amplify another bottleneck.',
        'Permanent fixes should address the root cause.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 18,
    question:
      'A sharded cluster has healthy shards but mongos reports repeated routing and metadata errors. How would you investigate config-server and metadata-path problems?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `A sharded cluster depends on the config server replica set for authoritative sharding metadata.

Healthy data shards alone are not enough.

If mongos cannot reliably access or use cluster metadata, routing and administrative operations can be affected.`,

      coreConcept: `Application
     |
     v
mongos
     |
     v
routing metadata
     |
     v
Config Server Replica Set
     |
     v
Shard ownership information

Problem anywhere in this path
can affect routing.`,

      detailedExplanation: `Repeated metadata-related errors require a structured investigation.

1. CONFIG SERVER REPLICA-SET HEALTH

Check:

• Primary
• Secondary states
• majority
• replication lag
• elections
• disk
• CPU
• process health

2. MONGOS CONNECTIVITY

Check network paths from mongos to config server members.

3. DNS/HOSTNAME RESOLUTION

All configured addresses must resolve consistently.

4. AUTHENTICATION/TLS

Certificate, hostname, authentication, or configuration problems can break connectivity.

5. VERSION COMPATIBILITY

Cluster components must follow supported compatibility requirements.

6. RESOURCE PRESSURE

Slow config servers or network latency can delay metadata operations.

7. ACTIVE TOPOLOGY OPERATIONS

Balancing, resharding, and other changes may generate metadata activity.

The config database is internal cluster state.

A DBA should inspect it only through supported diagnostics and must not directly modify metadata documents as a normal troubleshooting technique.`,

      internalWorking: `mongos
  |
  v
cached metadata
  |
  | refresh required
  v
config servers
  |
  X connectivity/health problem
  |
  v
refresh fails/retries
  |
  v
routing/admin errors`,

      architecture: `             MONGOS 1
                |
             MONGOS 2
                |
                v
       CONFIG SERVER REPLICA SET
        +-------+-------+
        |       |       |
        v       v       v
       C1      C2      C3
                |
                v
          authoritative
             metadata`,

      examples: [
        `Healthy shards do not prove the entire sharded cluster is healthy.`,
        `DNS/TLS problems can appear as metadata connectivity failures.`,
        `Direct config-database edits can corrupt cluster state and should not be used as routine fixes.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Run against the config server replica-set context to inspect member health.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Reviews sharding state from the administrative cluster perspective.'
        }
      ],

      productionScenario: `All shard replica sets show healthy Primaries.

Applications still receive intermittent routing failures.

The DBA checks mongos logs and sees metadata refresh failures.

Config server members are healthy locally, but a firewall change prevents mongos hosts from reaching one portion of the config server replica set.

The problem is the metadata communication path, not the data shards.`,

      troubleshootingApproach: `1. Capture exact mongos errors.

2. Check config server rs.status().

3. Verify config server Primary.

4. Check replication lag.

5. Check elections.

6. Check config server disk/CPU.

7. Test mongos-to-config connectivity.

8. Verify DNS.

9. Verify TLS/certificates.

10. Verify authentication.

11. Check recent firewall/network changes.

12. Check component compatibility.

13. Correlate with migrations/resharding.

14. Restore supported connectivity/health.

15. Never directly rewrite metadata as a shortcut.`,

      commonMistakes: [
        'Checking only shard replica sets.',
        'Restarting all mongos instances blindly.',
        'Ignoring config server health.',
        'Ignoring DNS/TLS/network changes.',
        'Directly editing config metadata.'
      ],

      bestPractices: [
        'Monitor config servers as critical infrastructure.',
        'Maintain resilient network paths.',
        'Monitor mongos metadata errors.',
        'Use supported diagnostics.',
        'Protect internal metadata from manual modification.'
      ],

      interviewAnswer: `For repeated routing or metadata errors with healthy shards, I investigate the config server replica set and the full mongos-to-config-server communication path.

I check config-server majority, replication, resource health, network, DNS, TLS, authentication, component compatibility, and concurrent topology activity. I do not directly edit config metadata.`,

      keyTakeaways: [
        'Config servers are critical to sharding.',
        'Healthy shards are only one layer.',
        'Metadata refresh depends on connectivity.',
        'Network/TLS issues can mimic metadata problems.',
        'Manual metadata editing is dangerous.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 19,
    question:
      'How would you scale a MongoDB cluster from a few shards to dozens of shards while preventing routing, balancing, and operational complexity from becoming the new bottleneck?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `Scaling from 3 shards to 30 shards is not simply repeating addShard twenty-seven times.

As shard count increases, the architecture becomes more distributed.

The DBA must scale:

• capacity
• routing
• monitoring
• automation
• operational procedures
• query targeting
• failure management.`,

      coreConcept: `More shards
   |
   +--> more capacity
   |
   +--> more replica sets
   +--> more migrations
   +--> more network paths
   +--> more monitoring
   +--> more failure possibilities
   +--> more scatter-gather cost

Therefore architecture must mature
as shard count grows.`,

      detailedExplanation: `A large sharded cluster requires several design disciplines.

1. SHARD-KEY QUALITY

A poor key becomes more painful as shard count grows.

Scatter-gather across 3 shards may be tolerable.

Scatter-gather across 50 shards can be expensive.

2. MONGOS CAPACITY

Application routing infrastructure must scale with connection and query volume.

3. CONFIG SERVER HEALTH

Config servers remain critical metadata infrastructure.

4. BALANCING

More shards can mean larger redistribution activity during growth and topology changes.

5. MONITORING

Metrics must be visible:

• per shard
• per replica-set member
• per mongos
• config server
• cluster aggregate

6. STANDARDIZATION

Every shard should use consistent:

• configuration
• security
• monitoring
• backup
• patching procedures.

7. AUTOMATION

Manual SSH-based administration becomes increasingly error-prone.

8. FAILURE DOMAINS

Replica-set placement must protect against infrastructure failures.

9. QUERY GOVERNANCE

Applications should be monitored for increasing scatter-gather behavior.

10. CAPACITY PLANNING

Do not wait for dozens of shards to simultaneously reach emergency thresholds.`,

      internalWorking: `3 shards:

manageable manually

30 shards:

30 replica sets
x multiple members
+ mongos
+ config servers

Potentially 100+ processes/nodes.

Operational discipline becomes
a scalability requirement itself.`,

      architecture: `                   APPLICATIONS
                         |
                 +-------+-------+
                 |               |
                 v               v
              mongos          mongos
                 \               /
                  \             /
                 CONFIG SERVERS
                       |
       +---------------+---------------+
       |       |       |       |       |
       v       v       v       v       v
      S1      S2      S3 ...  S20 ... S30
       |       |                       |
    replica  replica                 replica
      set      set                     set`,

      examples: [
        `Monitor scatter-gather percentage as shard count grows.`,
        `Standardize shard provisioning and patching.`,
        `Use automation for repeatable operational tasks.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Lists registered shards and is useful for inventory validation.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Provides a high-level administrative view of sharding state.'
        }
      ],

      productionScenario: `A platform grows from 4 shards to 24.

Storage capacity improves, but application latency begins increasing.

Investigation finds many legacy queries do not contain the shard key.

At four shards the fan-out was acceptable.

At twenty-four shards, the same workload generates much more distributed work.

The DBA introduces query-routing metrics and works with developers to reduce high-frequency scatter-gather operations.`,

      troubleshootingApproach: `1. Review shard-key scalability.

2. Measure targeted vs scatter-gather queries.

3. Capacity-plan mongos.

4. Monitor config servers.

5. Standardize shard sizing.

6. Standardize security.

7. Standardize backups.

8. Standardize monitoring.

9. Automate provisioning.

10. Automate health checks.

11. Monitor balancing volume.

12. Monitor network topology.

13. Review failure domains.

14. Test shard failures.

15. Review operational runbooks.

16. Forecast capacity before expansion.`,

      commonMistakes: [
        'Thinking node count alone equals scalability.',
        'Keeping manual administration as the cluster grows.',
        'Ignoring scatter-gather amplification.',
        'Monitoring only cluster averages.',
        'Using inconsistent shard configurations.'
      ],

      bestPractices: [
        'Standardize infrastructure.',
        'Automate repeatable operations.',
        'Track query targeting.',
        'Monitor every cluster layer.',
        'Design failure handling before scale requires it.'
      ],

      interviewAnswer: `When scaling from a few shards to dozens, I treat operational complexity as a scaling dimension.

I validate shard-key quality, control scatter-gather growth, scale mongos capacity, protect config servers, standardize shard configurations, automate provisioning and maintenance, monitor per-shard metrics, and continuously capacity-plan. Otherwise the distributed architecture itself becomes the bottleneck.`,

      keyTakeaways: [
        'Operational complexity grows with shard count.',
        'Poor routing becomes more expensive at scale.',
        'Automation becomes essential.',
        'Monitoring must remain per-shard and cluster-wide.',
        'Architecture must scale operationally as well as technically.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'advanced_sharding',
    topicId: 'advanced-sharding-scaling',
    topicNumber: 10,
    topicName: 'Advanced Sharding & Scaling',
    questionNumber: 20,
    question:
      'A large production MongoDB sharded cluster has rising latency, hot shards, heavy migrations, replication lag, scatter-gather queries, and uneven storage growth. How would you perform an end-to-end L3+ scaling investigation and create both an immediate and long-term remediation plan?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `This is not one MongoDB problem.

It is a distributed-system incident involving:

• application queries
• mongos routing
• shard-key design
• indexes
• balancing
• migrations
• replication
• storage
• network
• capacity.

The DBA's job is to identify the causal chain rather than independently reacting to every symptom.`,

      coreConcept: `APPLICATION
     |
     v
QUERY PATTERNS
     |
     v
MONGOS ROUTING
     |
     v
SHARD KEY
     |
     v
WORKLOAD DISTRIBUTION
     |
     v
BALANCER / MIGRATIONS
     |
     v
REPLICA SETS
     |
     v
CPU / CACHE / DISK / NETWORK
     |
     v
ROOT CAUSE
     |
 +---+---+
 |       |
 v       v
Immediate Long-term
mitigation redesign`,

      detailedExplanation: `STEP 1 — BUILD THE TIMELINE

Identify:

• when latency increased
• application deployments
• traffic growth
• shard additions
• balancing changes
• resharding activity
• hardware/network events

STEP 2 — VERIFY TOPOLOGY

Check:

• mongos instances
• config server replica set
• every shard replica set
• Primary availability
• replication lag
• member health

STEP 3 — COMPARE SHARDS

For every shard compare:

• CPU
• WiredTiger cache
• read/write throughput
• disk utilization
• disk latency
• network
• connections
• replication lag

Do not rely on averages.

STEP 4 — IDENTIFY HOT SHARDS

Determine whether the hotspot comes from:

• hot tenant
• monotonic key
• low cardinality
• skewed frequency
• active range
• application query concentration

STEP 5 — ANALYZE QUERY ROUTING

Identify high-frequency queries.

Classify them:

• single-shard targeted
• subset targeted
• scatter-gather.

STEP 6 — ANALYZE QUERY EXECUTION

Use explain.

Check:

• IXSCAN/COLLSCAN
• totalKeysExamined
• totalDocsExamined
• SORT
• FETCH filtering
• shard participation
• per-shard differences.

STEP 7 — ANALYZE MIGRATIONS

Determine:

• why they are happening
• source/destination
• success/failure
• network impact
• disk impact
• replication impact.

STEP 8 — ANALYZE REPLICATION LAG

Determine whether lag is caused by:

• destination migration writes
• disk latency
• CPU
• network
• write volume
• other shard-level pressure.

STEP 9 — ANALYZE STORAGE

Separate:

• logical data growth
• index growth
• filesystem growth
• uneven tenant growth
• migration effects
• unrelated data.

STEP 10 — BUILD CAUSAL CHAIN

Example:

new application query
→ no shard-key predicate
→ scatter-gather increases
→ all shards receive more reads
→ hot shard reaches storage saturation
→ migrations compete for I/O
→ replication lag rises
→ slow shard becomes tail-latency bottleneck
→ API latency increases.

STEP 11 — IMMEDIATE MITIGATION

Depending on evidence:

• roll back bad application query
• reduce unnecessary workload
• expand storage
• add capacity
• correct severe query/index issue
• carefully manage migration pressure using supported controls.

STEP 12 — LONG-TERM REMEDIATION

Potentially:

• redesign shard key
• reshard collection
• refine shard key
• redesign queries
• improve indexes
• isolate hot tenants
• add shards
• improve mongos capacity
• improve monitoring
• improve capacity thresholds.

The important distinction is:

Immediate mitigation stabilizes production.

Long-term remediation removes the architectural cause.`,

      internalWorking: `Example causal chain:

Application deployment
        |
        v
Scatter-gather queries
        |
        v
All shards receive more work
        |
        v
Shard B already hot
        |
        v
Disk latency rises
        |
        v
Replication lag
        |
        v
Balancer migration also uses disk/network
        |
        v
Shard B gets slower
        |
        v
Distributed queries wait on B
        |
        v
Cluster-wide latency`,

      architecture: `                     APPLICATION
                          |
                          v
                       MONGOS
                          |
                 scatter-gather
             +------------+------------+
             |            |            |
             v            v            v
          Shard A      Shard B      Shard C
           normal        HOT          normal
                          |
                +---------+---------+
                |         |         |
                v         v         v
              writes   migration   reads
                \         |         /
                 \        |        /
                    STORAGE
                    PRESSURE
                       |
                       v
                REPLICATION LAG
                       |
                       v
                  SLOW RESPONSE
                       |
                       v
                CLUSTER LATENCY`,

      examples: [
        `Do not treat hot shard, migration, lag, and latency as four unrelated incidents.`,
        `One application change can create a distributed causal chain.`,
        `Immediate stabilization may be completely different from the permanent architectural fix.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Reviews sharding topology and distribution.'
        },
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Validates shard inventory.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used on each shard/config replica-set context to inspect member and replication health.'
        },
        {
          command:
            'db.orders.find({ tenantId: 1001 }).explain("executionStats")',
          explanation:
            'Example of analyzing routing and local execution for a critical query.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server metrics that can help correlate database behavior with resource pressure.'
        }
      ],

      productionScenario: `A 20-shard cluster begins experiencing 6–10 second API latency.

Evidence shows:

• a new release introduced several queries without shard-key predicates
• scatter-gather volume increased sharply
• two shards host disproportionately active tenants
• their disk latency rises
• balancing attempts to redistribute growing data
• migration traffic adds disk and network pressure
• Secondaries on the hot shards begin lagging
• distributed queries wait on those slow shards.

Immediate action:

The problematic application query path is rolled back and storage headroom is increased.

The cluster stabilizes.

Long-term action:

The team redesigns affected queries, evaluates the tenant distribution and shard key, reviews indexes, adds capacity, and introduces alerts for:

• scatter-gather percentage
• per-shard workload skew
• disk growth rate
• migration activity
• replication lag.

The RCA describes one connected causal chain rather than blaming the balancer alone.`,

      troubleshootingApproach: `1. Establish timeline.

2. Identify recent changes.

3. Validate mongos.

4. Validate config servers.

5. Validate all shard replica sets.

6. Compare per-shard CPU.

7. Compare cache pressure.

8. Compare disk latency.

9. Compare network.

10. Compare replication lag.

11. Identify hot shards.

12. Analyze shard-key cardinality.

13. Analyze frequency/skew.

14. Analyze monotonicity.

15. Identify hot tenants/ranges.

16. Capture top queries.

17. Measure targeted vs scatter-gather behavior.

18. Run explain.

19. Review index efficiency.

20. Review migrations.

21. Correlate migration and latency timelines.

22. Analyze logical/physical storage growth.

23. Build causal chain.

24. Select lowest-risk immediate mitigation.

25. Validate stabilization.

26. Design permanent remediation.

27. Test changes.

28. Document RCA.

29. Improve monitoring.

30. Improve capacity planning.`,

      commonMistakes: [
        'Restarting the cluster before collecting evidence.',
        'Blaming the balancer immediately.',
        'Adding shards without analyzing shard-key quality.',
        'Looking only at average CPU.',
        'Ignoring application deployments.',
        'Ignoring scatter-gather amplification.',
        'Treating replication lag as an isolated problem.',
        'Changing several things simultaneously and losing causality.'
      ],

      bestPractices: [
        'Troubleshoot from application to storage.',
        'Use per-shard evidence.',
        'Correlate all metrics on one timeline.',
        'Separate symptoms from causes.',
        'Separate immediate mitigation from permanent remediation.',
        'Document the causal chain in the RCA.',
        'Continuously measure workload skew and query targeting.'
      ],

      interviewAnswer: `For a complex sharded-cluster incident, I establish a timeline and validate mongos, config servers, and every shard replica set. I compare CPU, cache, disk, network, storage growth, and replication lag per shard.

Then I identify hot ranges or tenants, analyze shard-key characteristics, classify critical queries as targeted or scatter-gather, inspect explain plans, and correlate migrations with resource pressure.

I build one evidence-based causal chain. Immediate actions stabilize production, while long-term remediation may involve query/index changes, shard-key refinement or resharding, tenant isolation, capacity expansion, and improved monitoring.`,

      keyTakeaways: [
        'Complex sharding incidents require end-to-end analysis.',
        'Symptoms often share one causal chain.',
        'Per-shard metrics matter more than averages.',
        'Application behavior must be included in DBA analysis.',
        'Immediate and permanent fixes are different.',
        'A strong L3 RCA proves causality with evidence.'
      ]
    }
  }

];

/* =========================================================
   SEED EXECUTION
========================================================= */

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(`Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`);

    const deleteResult = await collection.deleteMany({
      category: 'advanced_sharding'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous advanced_sharding documents`
    );

    const insertResult = await collection.insertMany(questions);

    console.log(
      `Inserted ${insertResult.insertedCount} Advanced Sharding & Scaling questions`
    );

    await collection.createIndex(
      { topicId: 1, order: 1 },
      {
        unique: true,
        name: 'topicId_order_unique',
        partialFilterExpression: {
          topicId: { $exists: true }
        }
      }
    );

    const topicCount = await collection.countDocuments({
      category: 'advanced_sharding'
    });

    console.log(`Topic 10 count: ${topicCount}`);

    if (topicCount !== 20) {
      throw new Error(
        `Topic 10 validation failed. Expected 20 questions, found ${topicCount}.`
      );
    }

    const curriculumCount = await collection.countDocuments({
      topicId: { $exists: true }
    });

    console.log(
      `New curriculum question count: ${curriculumCount}`
    );

    console.log(
      'Topic 10 seed completed successfully.'
    );
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error('Topic 10 seed failed.');
  console.error(error);
  process.exit(1);
});
