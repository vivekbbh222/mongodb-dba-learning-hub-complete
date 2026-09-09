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
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 1,
    question:
      'What is MongoDB sharding, why is it used, and what problem does horizontal scaling solve?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `Sharding is MongoDB's method of distributing data across multiple servers or replica sets.

It is used when a single server is no longer sufficient for:

• data size
• write throughput
• read throughput
• storage capacity
• workload scalability

Instead of keeping the entire dataset on one server, MongoDB divides the data across multiple shards.`,

      coreConcept: `Without sharding:

Application
    |
    v
Single MongoDB server
    |
    v
All data
All reads
All writes

Capacity is limited by one server.

With sharding:

Application
    |
    v
mongos
    |
    +--> Shard 1
    |
    +--> Shard 2
    |
    +--> Shard 3

Data and workload can be distributed across multiple shards.`,

      detailedExplanation: `There are two broad ways to scale a database.

VERTICAL SCALING

Increase resources on one server:

• more CPU
• more RAM
• faster disk
• larger disk

Example:

8 CPU
→ 32 CPU

64 GB RAM
→ 256 GB RAM

Vertical scaling is simple, but eventually reaches:

• hardware limits
• cost limits
• operational limits

HORIZONTAL SCALING

Add more database servers and distribute data across them.

This is what sharding provides.

Example:

Dataset:
6 TB

Instead of storing all 6 TB on one replica set, MongoDB may distribute portions across:

Shard 1
Shard 2
Shard 3

Each shard manages only part of the sharded data.

This can increase aggregate storage and workload capacity.

However, sharding introduces additional complexity:

• shard-key design
• routing
• balancing
• distributed queries
• chunk/range management
• cross-shard operations
• operational monitoring

Therefore sharding should not be introduced simply because it sounds more scalable.

A well-designed replica set may be enough for many workloads.

Sharding becomes appropriate when there is a clear scaling requirement that a single replica set cannot meet economically or technically.`,

      internalWorking: `Dataset

A B C D E F G H I J

Possible distribution:

Shard 1:
A B C

Shard 2:
D E F

Shard 3:
G H I J

The application does not need to manually decide
which shard contains every document.

mongos performs routing using sharding metadata.`,

      architecture: `             APPLICATION
                  |
                  v
               MONGOS
                  |
        +---------+---------+
        |         |         |
        v         v         v
      SHARD 1   SHARD 2   SHARD 3
        |         |         |
      subset    subset    subset
      of data   of data   of data`,

      examples: [
        `Example:

10 TB customer dataset distributed across several shards.`,

        `High write workload distributed using an appropriate shard key.`,

        `Each shard is normally deployed as a replica set for high availability.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Displays an overview of sharded-cluster topology, databases, collections, and distribution information.'
        }
      ],

      productionScenario: `A MongoDB replica set grows to several terabytes.

The Primary experiences:

• high write load
• storage growth
• limited ability to scale vertically

Adding larger hardware temporarily helps, but future growth will exceed the capacity of one replica set.

The architecture team introduces sharding so the dataset and workload can be distributed across multiple replica-set shards.

The main scaling gain comes from distributing work, not simply from adding mongos routers.`,

      troubleshootingApproach: `Before recommending sharding:

1. Measure dataset growth.

2. Measure read/write throughput.

3. Check CPU.

4. Check memory/cache.

5. Check storage capacity.

6. Check query efficiency.

7. Check indexing.

8. Confirm the bottleneck cannot be solved more simply.

9. Identify candidate shard keys.

10. Evaluate data distribution.

11. Evaluate workload distribution.

12. Estimate operational complexity.

13. Design high availability for each shard.

14. Test before production deployment.`,

      commonMistakes: [
        'Using sharding before fixing bad queries.',
        'Thinking sharding automatically makes every query faster.',
        'Sharding with a poor shard key.',
        'Treating shards as standalone servers without HA.',
        'Ignoring the operational complexity of distributed data.'
      ],

      bestPractices: [
        'Shard only when there is a clear scaling need.',
        'Fix query and index problems first.',
        'Design the shard key from real workload patterns.',
        'Deploy shards as replica sets.',
        'Test distribution before production.'
      ],

      interviewAnswer: `MongoDB sharding provides horizontal scaling by distributing a dataset and workload across multiple shards.

It is useful when one replica set cannot economically or technically handle required storage or throughput.

Applications usually connect through mongos, which routes requests using sharding metadata. Sharding increases scalability but also adds operational complexity, so shard-key design and workload analysis are critical.`,

      keyTakeaways: [
        'Sharding is horizontal scaling.',
        'It distributes data across multiple shards.',
        'It can increase aggregate capacity.',
        'Shard-key design determines distribution quality.',
        'Sharding should solve a real scaling problem.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 2,
    question:
      'What are the main components of a MongoDB sharded cluster, and what role does mongos, the config server replica set, and each shard perform?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `A MongoDB sharded cluster has three major component types:

1. mongos
2. config server replica set
3. shards

Each has a different responsibility.`,

      coreConcept: `APPLICATION
     |
     v
   MONGOS
     |
     | uses cluster metadata
     v
CONFIG SERVER REPLICA SET
     |
     v
Routing information

MONGOS
     |
     +--> SHARD 1
     |
     +--> SHARD 2
     |
     +--> SHARD 3`,

      detailedExplanation: `MONGOS

mongos is the query router.

Applications normally connect to one or more mongos processes rather than directly to shard members for sharded operations.

mongos determines which shard or shards should receive a request.

CONFIG SERVER REPLICA SET

The config servers store critical cluster metadata.

This includes information required to understand:

• which databases/collections are sharded
• shard identities
• chunk/range placement
• sharding configuration metadata

Config servers are deployed as a replica set for high availability.

They are not general-purpose application data servers.

SHARDS

Shards store actual application data.

Each shard is normally a replica set.

Example:

Shard 1:
rsShard1

Shard 2:
rsShard2

Shard 3:
rsShard3

Each shard can therefore provide:

• Primary
• Secondaries
• replication
• failover

inside that shard.

A sharded cluster is essentially a distributed system made from several replica sets plus routing and metadata infrastructure.`,

      internalWorking: `Client query
    |
    v
mongos
    |
    v
Read metadata
    |
    v
Determine target shard(s)
    |
    +--> Shard A
    |
    +--> Shard B
    |
    +--> Shard C
    |
    v
Merge result if needed
    |
    v
Client`,

      architecture: `                    APPLICATION
                         |
                         v
                      MONGOS
                         |
             +-----------+-----------+
             |                       |
             v                       v
       CONFIG SERVERS             SHARDS
       metadata only          application data
                                 |
                      +----------+----------+
                      |          |          |
                      v          v          v
                   Shard 1    Shard 2    Shard 3
                     RS         RS         RS`,

      examples: [
        `Typical topology:

2+ mongos routers

3-member config server replica set

3 shards, each a 3-member replica set`,

        `Application URI typically points to mongos endpoints.`,

        `Each shard has independent replication and failover.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Displays cluster topology and sharding metadata overview.'
        },
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Lists configured shards in the cluster.'
        }
      ],

      productionScenario: `A client connects directly to one shard Primary and queries a sharded collection.

That shard contains only part of the dataset.

The client therefore does not have a complete cluster-level view.

The correct application path is through mongos, which knows how the collection is distributed and routes the request appropriately.`,

      troubleshootingApproach: `When checking cluster architecture:

1. Identify all mongos instances.

2. Verify config server replica set health.

3. List all shards.

4. Verify each shard replica set.

5. Confirm applications connect through mongos.

6. Check routing metadata.

7. Check shard connectivity from mongos.

8. Verify cluster authentication/TLS consistently.

9. Check high availability at each component layer.`,

      commonMistakes: [
        'Connecting applications directly to one shard for normal sharded access.',
        'Thinking mongos stores application data.',
        'Thinking config servers contain the full dataset.',
        'Deploying a shard without replica-set HA.',
        'Monitoring only mongos and ignoring underlying shards.'
      ],

      bestPractices: [
        'Use multiple mongos routers for availability.',
        'Keep config servers healthy and protected.',
        'Deploy each shard as a replica set.',
        'Monitor each component independently.',
        'Use consistent security configuration across the cluster.'
      ],

      interviewAnswer: `A sharded cluster consists of mongos routers, a config server replica set, and one or more shards.

mongos routes application requests, config servers store sharding metadata, and shards store the actual application data. Each shard is normally a replica set, so sharding provides distribution while replica sets provide high availability within each shard.`,

      keyTakeaways: [
        'mongos routes requests.',
        'Config servers store cluster metadata.',
        'Shards store application data.',
        'Each shard is normally a replica set.',
        'All layers require HA and monitoring.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 3,
    question:
      'What is mongos in MongoDB, how does it route queries, and why is mongos considered stateless from an application-data perspective?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `mongos is the routing process used by applications to access a MongoDB sharded cluster.

It does not store the application's collection data.

Its main job is:

Receive request
→ determine target shard or shards
→ forward request
→ return or merge result.`,

      coreConcept: `Application
    |
    v
 mongos
    |
    +--> Check routing metadata
    |
    +--> Determine target
    |
    +--> Send query to shard(s)
    |
    +--> Merge response when necessary
    |
    v
Application`,

      detailedExplanation: `Suppose a collection is sharded by:

customerId

and a query is:

{ customerId: 1001 }

If routing metadata allows mongos to determine exactly which shard owns the relevant shard-key range, mongos can target that shard.

This is a targeted query.

Now consider:

{ status: "OPEN" }

If status is not sufficient to identify the shard based on the shard key, mongos may need to send the query to multiple shards.

This is a scatter-gather query.

Therefore mongos performance depends heavily on:

• shard-key design
• query predicates
• routing metadata
• shard response time

STATELESS CONCEPT

mongos does not own the persistent application dataset.

Cluster metadata is maintained in the config server infrastructure and cached by routers as needed.

Because mongos does not store the business dataset itself, multiple mongos routers can be deployed for application availability and scaling.

However, calling mongos stateless does not mean:

it has no memory

or:

it performs no caching.

It maintains runtime routing information and connections.

The important distinction is that it does not persist the application collections as a shard does.`,

      internalWorking: `Query:

{ customerId: 1001 }

mongos
  |
  v
Routing metadata
  |
  v
customerId range belongs to Shard B
  |
  v
Send only to Shard B
  |
  v
Return result`,

      architecture: `            APP SERVERS
           /         \
          v           v
      MONGOS 1     MONGOS 2
          \           /
           \         /
            v       v
          CONFIG METADATA
                |
        +-------+-------+
        |               |
        v               v
     SHARD A         SHARD B`,

      examples: [
        `Targeted query:

db.orders.find({
  customerId: 1001
})`,

        `Potential scatter-gather query when shard key is customerId:

db.orders.find({
  status: "OPEN"
})`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'From mongos, lists shards known to the cluster.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Displays routing and sharding topology information.'
        }
      ],

      productionScenario: `A team adds several mongos routers behind a load balancer.

This improves router availability and allows application connections to be distributed.

But query latency remains high.

Investigation shows many queries do not contain the shard key and therefore hit all shards.

Adding mongos did not solve the underlying query-routing problem.

The root cause is poor query targeting.`,

      troubleshootingApproach: `For mongos/query-routing problems:

1. Confirm application is using mongos.

2. Identify query shape.

3. Identify shard key.

4. Determine whether query contains usable shard-key predicates.

5. Check whether query is targeted or scatter-gather.

6. Check mongos logs.

7. Check shard response times.

8. Check config-server health.

9. Check connection counts.

10. Do not assume adding more mongos will fix bad shard targeting.`,

      commonMistakes: [
        'Thinking mongos stores collection data.',
        'Assuming more mongos makes scatter-gather queries efficient.',
        'Connecting applications directly to shard members.',
        'Ignoring router connection usage.',
        'Thinking stateless means mongos has no runtime state at all.'
      ],

      bestPractices: [
        'Deploy multiple mongos routers.',
        'Keep applications replica/shard topology aware through mongos.',
        'Design queries to target shards where possible.',
        'Monitor mongos and shard latency separately.',
        'Avoid unnecessary scatter-gather operations.'
      ],

      interviewAnswer: `mongos is the query router for a MongoDB sharded cluster. It receives application operations, uses sharding metadata to determine the target shard or shards, forwards the operation, and merges results when required.

It is stateless in the sense that it does not store the persistent application dataset, which allows multiple mongos routers to be deployed for availability and scale.`,

      keyTakeaways: [
        'mongos routes cluster operations.',
        'It does not store application collections.',
        'Queries can be targeted or scatter-gather.',
        'Multiple mongos routers improve availability.',
        'Shard-key-aware query patterns are important.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 4,
    question:
      'What is the config server replica set in MongoDB, what metadata does it store, and why is it critical to the sharded cluster?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `Config servers store the metadata that describes the sharded cluster.

They help answer questions such as:

• What shards exist?
• Which collections are sharded?
• What shard key is used?
• Which chunk/range belongs to which shard?

Without correct cluster metadata, mongos cannot route operations properly.`,

      coreConcept: `Config server metadata
        |
        +--> shards
        +--> databases
        +--> sharded collections
        +--> shard keys
        +--> chunk/range placement
        +--> balancing metadata
        |
        v
mongos uses metadata
        |
        v
correct routing`,

      detailedExplanation: `Config servers do not store the entire business dataset.

Instead, they maintain authoritative cluster configuration metadata.

This metadata is essential because data is distributed.

For example:

Shard A owns:

customerId values 1–100000

Shard B owns:

100001–200000

Shard C owns:

200001 onward

mongos needs metadata describing these ownership ranges in order to route requests.

The config server layer is deployed as a replica set so that metadata itself is highly available.

If the config server replica set becomes unhealthy, cluster metadata operations and certain sharded-cluster functions can be affected.

Because config servers are critical infrastructure:

• do not use them as application database servers
• do not casually modify their internal metadata collections
• monitor replication and disk
• protect backups
• maintain correct security

Direct manual modification of config metadata is dangerous because MongoDB expects consistency across internal sharding state.`,

      internalWorking: `Shard metadata:

Collection:
shop.orders

Shard key:
{ customerId: 1 }

Ranges:

Min -> 100000 = Shard A
100000 -> 200000 = Shard B
200000 -> Max = Shard C

Stored as cluster metadata
        |
        v
mongos routing decisions`,

      architecture: `                CONFIG SERVER RS
                  /      |      \
                 v       v       v
                C1      C2      C3
                  \      |      /
                   \     |     /
                        |
                        v
                    metadata
                        |
                        v
                     mongos
                        |
               +--------+--------+
               |                 |
               v                 v
            Shard A           Shard B`,

      examples: [
        `Config servers are normally deployed as a dedicated replica set.`,

        `mongos obtains routing information from the config server infrastructure.`,

        `Internal metadata should not be manually modified casually.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Displays a higher-level view of sharding metadata.'
        }
      ],

      productionScenario: `A DBA sees metadata collections under the config database and considers manually changing a chunk ownership document.

That is extremely risky.

Cluster metadata is maintained by MongoDB's sharding subsystem.

Manual unsupported modification can make metadata inconsistent with actual cluster state.

The DBA should use supported sharding commands and procedures instead.`,

      troubleshootingApproach: `For config-server issues:

1. Check config server replica-set health.

2. Verify Primary and Secondaries.

3. Check replication lag.

4. Check disk free space.

5. Check disk latency.

6. Check network from mongos to config servers.

7. Check authentication/TLS.

8. Review mongod logs.

9. Avoid manual metadata modification.

10. Use supported cluster administration commands.`,

      commonMistakes: [
        'Thinking config servers store all application data.',
        'Using config servers for normal application workloads.',
        'Manually modifying sharding metadata.',
        'Ignoring config-server backups.',
        'Monitoring shards but not config servers.'
      ],

      bestPractices: [
        'Keep config servers dedicated.',
        'Deploy them as a healthy replica set.',
        'Back up sharding metadata appropriately.',
        'Monitor them like critical infrastructure.',
        'Use supported commands for cluster changes.'
      ],

      interviewAnswer: `The config server replica set stores authoritative metadata for the sharded cluster, including shard definitions, sharded collection configuration, shard keys, and range/chunk placement.

mongos depends on this metadata for correct routing, so config servers are critical cluster infrastructure and should be dedicated, highly available, monitored, and never manually modified through unsupported metadata edits.`,

      keyTakeaways: [
        'Config servers store cluster metadata.',
        'They do not store the entire application dataset.',
        'mongos depends on them for routing.',
        'They require replica-set HA.',
        'Manual metadata changes are dangerous.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 5,
    question:
      'What is a shard in MongoDB, why is each shard normally a replica set, and how do sharding and replication solve different problems?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `A shard stores part of the sharded dataset.

In production, a shard is normally implemented as a replica set.

This combines two different capabilities:

Sharding:
scalability

Replication:
high availability.`,

      coreConcept: `Sharding answers:

How do we distribute data and workload?

Replication answers:

How do we keep a shard available if one server fails?

Together:

Sharded cluster
   |
   +--> Shard A replica set
   |
   +--> Shard B replica set
   |
   +--> Shard C replica set`,

      detailedExplanation: `Suppose a collection contains:

300 million documents.

MongoDB distributes them:

Shard A:
100 million

Shard B:
100 million

Shard C:
100 million

If Shard A were a single standalone mongod and that server failed, every document assigned to that shard would become unavailable.

Therefore production shards are normally replica sets.

Example:

Shard A:
A1 Primary
A2 Secondary
A3 Secondary

Shard B:
B1 Primary
B2 Secondary
B3 Secondary

Shard C:
C1 Primary
C2 Secondary
C3 Secondary

Now:

Sharding provides horizontal distribution.

Replica sets provide redundancy within each distributed partition.

A useful interview distinction is:

Replica set:
same dataset replicated across members.

Sharding:
different portions of data distributed across shards.

In a sharded cluster, both exist together.`,

      internalWorking: `Collection

Documents 1-300M
      |
      v
Sharding
      |
 +----+----+
 |    |    |
 v    v    v
A     B    C

Each shard:

Primary
 |
 +--> Secondary
 |
 +--> Secondary`,

      architecture: `                    SHARDED CLUSTER

          +---------------+---------------+
          |               |               |
          v               v               v
       SHARD A          SHARD B          SHARD C
      Replica Set      Replica Set      Replica Set

        A1 P              B1 P             C1 P
       /   \             /   \            /   \
     A2     A3         B2     B3        C2     C3
     SEC    SEC        SEC    SEC       SEC    SEC`,

      examples: [
        `Shard = horizontal data partition.`,

        `Replica set inside shard = availability.`,

        `A production cluster can have several shards, each containing several replica-set members.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Lists shards configured in the cluster.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Shows cluster and shard distribution information.'
        }
      ],

      productionScenario: `A cluster contains four shards.

Shard 2's Primary fails.

Because Shard 2 is a replica set, one of its eligible Secondaries can be elected Primary.

Only that shard experiences failover.

The other shards continue operating normally.

This demonstrates that high availability exists independently inside each shard.`,

      troubleshootingApproach: `When one shard is unhealthy:

1. Identify affected shard.

2. Check its replica-set status.

3. Identify Primary.

4. Check Secondary health.

5. Check majority.

6. Check replication lag.

7. Check mongos connectivity to that shard.

8. Determine which application requests depend on data owned by that shard.

9. Do not assume the entire sharded cluster has failed because one shard has an issue.`,

      commonMistakes: [
        'Thinking sharding itself replaces replication.',
        'Using standalone mongod as a production shard.',
        'Thinking every shard stores the entire dataset.',
        'Troubleshooting shard failover only through mongos.',
        'Ignoring individual shard replica-set health.'
      ],

      bestPractices: [
        'Deploy every production shard as a replica set.',
        'Monitor shard replica sets separately.',
        'Understand data ownership per shard.',
        'Plan HA independently for each shard.',
        'Test shard-level failover.'
      ],

      interviewAnswer: `A shard stores a portion of the sharded dataset. In production, each shard is normally a replica set.

Sharding distributes data and workload across shards for scalability, while replication provides redundancy and failover within each shard. They solve different problems and are typically used together.`,

      keyTakeaways: [
        'A shard stores only part of sharded data.',
        'Shards are normally replica sets.',
        'Sharding provides scale.',
        'Replication provides HA.',
        'Each shard can fail over independently.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 6,
    question:
      'What is a shard key in MongoDB, and why is shard-key selection one of the most important decisions in a sharded-cluster design?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `The shard key is the field or fields MongoDB uses to determine how documents in a sharded collection are distributed.

Example:

{ customerId: 1 }

MongoDB uses values from customerId to divide the collection into shard-key ranges or hashed distribution units depending on strategy.`,

      coreConcept: `Document:

{
  customerId: 5001,
  status: "OPEN"
}

Shard key:

{ customerId: 1 }

MongoDB uses:

customerId = 5001

to determine the document's shard placement and routing behavior.`,

      detailedExplanation: `The shard key influences:

• data distribution
• write distribution
• query targeting
• chunk/range distribution
• hotspot risk
• scalability

This is why shard-key selection is extremely important.

A bad shard key can create:

1. UNEVEN DATA DISTRIBUTION

One shard holds far more data than others.

2. WRITE HOTSPOTS

Most inserts go to one shard.

3. SCATTER-GATHER QUERIES

Queries do not include the shard key, so mongos contacts many shards.

4. POOR CARDINALITY

Too few distinct shard-key values limit distribution.

Three important shard-key characteristics are:

CARDINALITY

How many distinct values exist?

FREQUENCY

Are some values extremely common?

MONOTONICITY

Do values continuously increase, such as timestamps or sequential IDs?

Example:

createdAt

may be highly monotonic.

Depending on shard-key strategy, new writes can concentrate in a narrow portion of key space.

The correct key depends on actual workload patterns, not simply on choosing a field with an index.`,

      internalWorking: `Shard key:

customerId

Documents:

100 -> Shard A
200 -> Shard A
500 -> Shard B
900 -> Shard C

Routing and placement both depend
on the shard-key value.`,

      architecture: `Collection
   |
   v
Shard Key
   |
   +--> Data distribution
   |
   +--> Write distribution
   |
   +--> Query routing
   |
   +--> Balancing behavior
   |
   v
Cluster scalability`,

      examples: [
        `Possible key:

{ customerId: 1 }`,

        `Compound key:

{ region: 1, customerId: 1 }`,

        `Hashed key:

{ customerId: "hashed" }`
      ],

      commands: [
        {
          command:
            'sh.shardCollection("shop.orders", { customerId: 1 })',
          explanation:
            'Conceptually shards the collection using customerId as a ranged shard key.'
        }
      ],

      productionScenario: `A company chooses:

status

as shard key.

Values are only:

OPEN
CLOSED
FAILED

That is extremely low cardinality.

The cluster cannot distribute the workload effectively across many shards.

The DBA realizes shard-key design must consider cardinality and workload distribution, not simply whether the field is frequently queried.`,

      troubleshootingApproach: `Before choosing a shard key:

1. Measure cardinality.

2. Measure value frequency.

3. Identify monotonic behavior.

4. Review insert patterns.

5. Review top queries.

6. Determine how many queries include the candidate key.

7. Model data distribution.

8. Model write distribution.

9. Identify hotspot risk.

10. Test with production-like data volume.

11. Evaluate ranged vs hashed strategy.

12. Consider future growth.`,

      commonMistakes: [
        'Choosing shard key only because it is indexed.',
        'Using a very low-cardinality field.',
        'Ignoring write distribution.',
        'Ignoring query patterns.',
        'Choosing a key without testing production-like data.'
      ],

      bestPractices: [
        'Analyze real workload before selecting a shard key.',
        'Prefer sufficient cardinality.',
        'Avoid concentrated hot values.',
        'Support common targeted queries where practical.',
        'Test distribution before production.'
      ],

      interviewAnswer: `The shard key determines how MongoDB partitions a sharded collection and how mongos targets operations.

It strongly affects data distribution, write distribution, query targeting, and hotspot risk. I evaluate cardinality, frequency, monotonicity, and actual query/write patterns before selecting a shard key.`,

      keyTakeaways: [
        'Shard key determines data placement.',
        'It also affects query routing.',
        'Cardinality matters.',
        'Hot values can create hotspots.',
        'Shard-key choice is a major architectural decision.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 7,
    question:
      'What is the difference between ranged sharding and hashed sharding in MongoDB?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `MongoDB can distribute shard-key values using different strategies.

Two fundamental approaches are:

• ranged sharding
• hashed sharding

Ranged sharding keeps nearby shard-key values together.

Hashed sharding distributes values based on a hash of the shard-key value.`,

      coreConcept: `RANGED:

1-100     -> Shard A
101-200   -> Shard B
201-300   -> Shard C

Nearby values stay near each other.


HASHED:

hash(1)   -> Shard C
hash(2)   -> Shard A
hash(3)   -> Shard B

Original value order is not preserved for distribution.`,

      detailedExplanation: `RANGED SHARDING

Example key:

{ customerId: 1 }

MongoDB can distribute contiguous ranges of customerId values.

Advantages:

• efficient targeting for shard-key range queries
• preserves locality of adjacent key values

Risk:

If writes always move toward one end of the key range, they can create a hotspot.

Example:

timestamp increasing continuously.

HASHED SHARDING

Example:

{ customerId: "hashed" }

MongoDB hashes the shard-key value before distribution.

This tends to distribute values more evenly across the hash space.

Advantages:

• often better write distribution
• useful for monotonically increasing source values

Trade-off:

Range queries on the original field do not preserve physical/routing locality in the same way as ranged sharding.

Example query:

customerId between 1000 and 2000

With ranged distribution, those values may map to a limited shard-key range.

With hashed distribution, their hashes may be spread widely.

Therefore:

ranged sharding favors range locality.

hashed sharding favors distribution uniformity.

Neither is always better.`,

      internalWorking: `RANGED

Values:
1 2 3 4 5 6 7 8 9

Distribution:

Shard A: 1 2 3
Shard B: 4 5 6
Shard C: 7 8 9


HASHED

Values are transformed:

hash(1)
hash(2)
hash(3)...

Then distributed by hash ranges.`,

      architecture: `Shard Key Strategy
       |
       +----------------+
       |                |
       v                v
     RANGED           HASHED
       |                |
       v                v
value locality      uniform spread
       |                |
       v                v
range queries       write distribution`,

      examples: [
        `Ranged:

sh.shardCollection(
  "shop.orders",
  { customerId: 1 }
)`,

        `Hashed:

sh.shardCollection(
  "shop.orders",
  { customerId: "hashed" }
)`
      ],

      commands: [
        {
          command:
            'sh.shardCollection("shop.orders", { customerId: 1 })',
          explanation:
            'Illustrates ranged shard-key distribution.'
        },
        {
          command:
            'sh.shardCollection("shop.orders", { customerId: "hashed" })',
          explanation:
            'Illustrates hashed shard-key distribution.'
        }
      ],

      productionScenario: `An IoT system uses a continuously increasing device event identifier.

With a simple ranged key based on the increasing identifier, new inserts repeatedly target the highest range.

That can create a hot shard.

A hashed strategy may distribute those new values more evenly.

However, if the application relies heavily on range scans over the original identifier, the trade-off must be evaluated carefully.`,

      troubleshootingApproach: `When choosing ranged vs hashed:

1. Review insert pattern.

2. Check whether key is monotonic.

3. Review range queries.

4. Review point lookups.

5. Evaluate write distribution.

6. Evaluate query targeting.

7. Test candidate strategy.

8. Inspect distribution under realistic load.

9. Do not choose hashed automatically just for uniformity.

10. Do not choose ranged automatically just for range queries.`,

      commonMistakes: [
        'Thinking hashed sharding encrypts shard-key values.',
        'Assuming hashed is always better.',
        'Using a monotonic ranged key without hotspot analysis.',
        'Ignoring range-query requirements.',
        'Choosing distribution strategy without workload testing.'
      ],

      bestPractices: [
        'Choose strategy from workload behavior.',
        'Use hashed keys when uniform distribution is more important.',
        'Use ranged keys when range locality matters.',
        'Analyze monotonicity.',
        'Test under realistic write patterns.'
      ],

      interviewAnswer: `Ranged sharding distributes contiguous shard-key ranges, which is useful for targeted range queries but can create hotspots with monotonically increasing values.

Hashed sharding distributes hashes of shard-key values, generally improving distribution but reducing locality for range queries on the original field. The choice depends on query and write patterns.`,

      keyTakeaways: [
        'Ranged keeps adjacent values together.',
        'Hashed spreads values through hash space.',
        'Ranged supports locality.',
        'Hashed often improves distribution.',
        'Workload determines the correct strategy.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 8,
    question:
      'What is a chunk or shard-key range in MongoDB sharding, and how does MongoDB use ranges to distribute data between shards?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `MongoDB divides a sharded collection's shard-key space into logical ranges.

Historically these ranges are commonly referred to as chunks.

Each range is assigned to a shard.

Documents whose shard-key values fall inside that range belong to the shard that owns the range.`,

      coreConcept: `Shard key:

customerId

Ranges:

Min -> 1000
owned by Shard A

1000 -> 2000
owned by Shard B

2000 -> Max
owned by Shard C`,

      detailedExplanation: `Suppose the shard key is:

{ customerId: 1 }

Logical ranges might look like:

[MinKey, 100000)

[100000, 200000)

[200000, MaxKey)

Each range is associated with a shard.

mongos uses routing metadata to determine which shard owns the range containing a requested shard-key value.

Example:

customerId = 150000

falls into:

[100000, 200000)

If that range belongs to Shard B, mongos can target Shard B.

Ranges can move between shards as MongoDB balances distribution.

Therefore:

document ownership is not permanently tied to a physical shard forever.

The metadata determines current ownership.

This is also why the shard key is essential.

Without it, mongos may not be able to determine one precise range and may need to contact multiple shards.`,

      internalWorking: `Key space:

Min
 |
 | Range 1
 v
100000
 |
 | Range 2
 v
200000
 |
 | Range 3
 v
Max


Ownership:

Range 1 -> Shard A
Range 2 -> Shard B
Range 3 -> Shard C`,

      architecture: `Shard-key space

MinKey ---------------------------- MaxKey

 |----------|----------|----------|
     R1          R2         R3
     |           |          |
     v           v          v
  Shard A     Shard B    Shard C`,

      examples: [
        `customerId 50000:

Shard A`,

        `customerId 150000:

Shard B`,

        `customerId 900000:

Shard C`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Can show collection distribution and range/chunk information depending on cluster/version/output.'
        }
      ],

      productionScenario: `A DBA notices Shard A contains much more data than Shard B.

The correct investigation is not simply:

"Move random collections."

The DBA reviews shard-key ranges and data distribution to understand whether:

• range ownership is unbalanced
• one range contains disproportionately many documents
• the shard key itself has skewed values

Uneven shard sizes can come from data skew, not only from insufficient balancing.`,

      troubleshootingApproach: `1. Identify shard key.

2. Inspect current data distribution.

3. Inspect range/chunk ownership.

4. Check whether one shard owns more ranges.

5. Check whether one range contains unusually high data volume.

6. Check shard-key value distribution.

7. Check balancer state.

8. Check migration activity.

9. Distinguish range-count imbalance from actual data-size imbalance.

10. Review shard-key design if skew persists.`,

      commonMistakes: [
        'Thinking chunks are copies of data.',
        'Thinking every range contains equal numbers of documents.',
        'Assuming equal range counts mean equal disk usage.',
        'Ignoring skewed shard-key values.',
        'Manually manipulating metadata.'
      ],

      bestPractices: [
        'Understand logical range ownership.',
        'Monitor actual data distribution.',
        'Review skew as well as chunk counts.',
        'Use supported balancing mechanisms.',
        'Avoid manual metadata edits.'
      ],

      interviewAnswer: `MongoDB partitions a sharded collection's shard-key space into logical ranges, historically called chunks. Each range is owned by a shard, and documents whose shard-key values fall in that range are stored there.

mongos uses this metadata to route targeted operations, and ranges can move between shards during balancing.`,

      keyTakeaways: [
        'Sharded collections are divided by shard-key range.',
        'Each range belongs to a shard.',
        'mongos routes using range ownership.',
        'Ranges can migrate.',
        'Equal range counts do not guarantee equal data size.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 9,
    question:
      'What is the MongoDB balancer, why does it move shard-key ranges between shards, and what problem is it trying to solve?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `The balancer is the sharded-cluster mechanism responsible for helping redistribute data ranges between shards when needed.

Its goal is to keep sharded data reasonably distributed according to cluster balancing rules.`,

      coreConcept: `Before balancing:

Shard A:
many ranges

Shard B:
few ranges

Shard C:
few ranges

Balancer
   |
   v
Move ranges
   |
   v

More balanced placement.`,

      detailedExplanation: `As data grows, one shard may end up owning more data or more ranges than another.

MongoDB can migrate ranges between shards.

Conceptually:

Shard A owns Range X

Migration begins

Range X is transferred to Shard B

Metadata ownership changes

Shard B becomes owner

The balancing process exists to prevent long-term concentration of data on only part of the cluster.

However, the balancer cannot fix every poor shard-key design.

Example:

All current writes target one hot shard-key value.

Even if historical ranges are balanced, the active write workload may still concentrate on one shard.

Similarly:

A low-cardinality key may provide too little useful distribution.

Therefore:

Balancer solves placement imbalance.

Shard-key design solves distribution potential.

They are related but not interchangeable.

Migrations themselves consume resources:

• network
• reads
• writes
• disk I/O
• replication activity

Therefore DBAs should monitor balancing and migration activity in busy production systems.`,

      internalWorking: `Shard A
Range 1
Range 2
Range 3
Range 4

Shard B
Range 5

Balancer detects imbalance
       |
       v
Migrate Range 4
A -> B
       |
       v

Shard A:
R1 R2 R3

Shard B:
R4 R5`,

      architecture: `              BALANCER
                  |
          +-------+-------+
          |               |
          v               v
       SHARD A         SHARD B
       R1 R2 R3 R4      R5

                  |
             Migration
                  |
                  v

       SHARD A         SHARD B
       R1 R2 R3        R4 R5`,

      examples: [
        `Check cluster status:

sh.status()`,

        `Check balancer state with supported shell/admin helpers for the deployed MongoDB version.`,

        `Monitor migrations during periods of heavy workload.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Shows sharded collection distribution and cluster information useful during balancing analysis.'
        },
        {
          command:
            'sh.getBalancerState()',
          explanation:
            'Returns whether balancing is enabled, where supported.'
        }
      ],

      productionScenario: `Shard A contains substantially more data than the other shards.

The balancer starts moving ranges to Shard B and C.

During migration, network and storage usage increase.

The DBA sees higher I/O and assumes there is a storage problem.

After correlating the timeline, the load is identified as migration activity.

The DBA still checks whether the imbalance itself is due to normal growth or poor shard-key distribution.`,

      troubleshootingApproach: `1. Check balancer state.

2. Check active migrations.

3. Check shard distribution.

4. Check disk usage per shard.

5. Check network utilization.

6. Check migration errors.

7. Check shard health.

8. Check whether one shard is overloaded.

9. Determine whether imbalance is temporary or persistent.

10. Evaluate shard-key skew.

11. Avoid disabling balancing permanently as a shortcut.`,

      commonMistakes: [
        'Thinking the balancer fixes a bad shard key.',
        'Disabling balancing permanently without root-cause analysis.',
        'Ignoring migration resource consumption.',
        'Assuming every unequal shard size is a balancer failure.',
        'Manually moving metadata instead of using supported operations.'
      ],

      bestPractices: [
        'Monitor balancing and migrations.',
        'Capacity-plan migration traffic.',
        'Investigate persistent skew.',
        'Keep all shards healthy enough to participate.',
        'Treat shard-key design separately from balancing.'
      ],

      interviewAnswer: `The balancer helps redistribute shard-key ranges between shards so data placement does not remain unnecessarily concentrated.

It performs range migrations, which consume network and storage resources. The balancer can improve placement imbalance, but it cannot fix a fundamentally poor shard key or a hot-key workload.`,

      keyTakeaways: [
        'Balancer redistributes ranges.',
        'Migrations move ownership between shards.',
        'Balancing consumes resources.',
        'Balancer cannot fix poor shard-key design.',
        'Persistent skew requires deeper analysis.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 10,
    question:
      'What is the difference between a targeted query and a scatter-gather query in MongoDB sharding, and why does query targeting matter for performance?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A targeted query can be routed to only the shard or limited set of shards that may contain the requested data.

A scatter-gather query must be sent to many or all shards because mongos cannot narrow the request sufficiently using the shard key.

Targeted queries are generally more scalable.`,

      coreConcept: `Targeted:

Query includes usable shard key
        |
        v
mongos
        |
        v
Shard B only


Scatter-gather:

Query does not identify shard
        |
        v
mongos
        |
   +----+----+
   |    |    |
   v    v    v
   A    B    C
        |
        v
merge results`,

      detailedExplanation: `Suppose shard key is:

{ customerId: 1 }

QUERY 1

db.orders.find({
  customerId: 5001
})

mongos can use customerId to identify the relevant shard-key range.

This can become a targeted operation.

QUERY 2

db.orders.find({
  status: "OPEN"
})

If status does not contain enough shard-key information, mongos may need to contact multiple shards.

Each shard performs work.

mongos then combines the results.

As shard count grows:

3 shards
→ 10 shards
→ 50 shards

scatter-gather cost can grow because more servers participate.

This affects:

• network traffic
• CPU
• query latency
• mongos merge work
• total cluster resource consumption

However, scatter-gather queries are not automatically forbidden.

Some workloads naturally require cross-shard queries.

The DBA's job is to understand:

• how frequent they are
• how expensive they are
• whether the shard key supports critical query patterns

A common mistake is designing the shard key only for write distribution while ignoring read routing.`,

      internalWorking: `Targeted query:

customerId = 5001

mongos
   |
routing table
   |
Shard B

One shard participates.


Scatter-gather:

status = OPEN

mongos
  |
  +--> A
  +--> B
  +--> C
  |
merge
  |
client`,

      architecture: `TARGETED

Application
   |
   v
 mongos
   |
   v
Shard B


SCATTER-GATHER

Application
   |
   v
 mongos
   |
 +---+---+
 |   |   |
 v   v   v
 A   B   C
  \  |  /
   \ | /
   merge`,

      examples: [
        `Shard key:

{ customerId: 1 }`,

        `Targeted:

db.orders.find({
  customerId: 1001
})`,

        `Potential scatter-gather:

db.orders.find({
  status: "OPEN"
})`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Can be used to inspect execution behavior; in a sharded environment explain output also helps identify shard participation.'
        },
        {
          command:
            'db.orders.find({ status: "OPEN" }).explain("executionStats")',
          explanation:
            'Useful for comparing broader shard participation when the shard key is absent.'
        }
      ],

      productionScenario: `A collection is sharded by:

customerId

The application performs most reads by:

emailAddress

without customerId.

Those queries repeatedly contact many shards.

As the cluster grows from three to twelve shards, latency rises significantly.

The cluster has more hardware, but the query pattern scales poorly because routing is scatter-gather.

The DBA reviews shard-key strategy and application query patterns rather than simply adding more shards.`,

      troubleshootingApproach: `For slow queries in a sharded cluster:

1. Identify shard key.

2. Capture query predicate.

3. Check whether shard key is included.

4. Run explain.

5. Identify participating shards.

6. Check per-shard execution statistics.

7. Check indexes on every relevant shard.

8. Check mongos merge work.

9. Check network latency.

10. Measure frequency of scatter-gather queries.

11. Determine whether application query design can improve targeting.

12. Re-evaluate shard key if critical workloads cannot target effectively.`,

      commonMistakes: [
        'Assuming sharding automatically makes every query faster.',
        'Ignoring shard-key predicates in application queries.',
        'Adding shards to solve scatter-gather inefficiency.',
        'Checking explain only on one shard.',
        'Designing shard key only for write distribution.'
      ],

      bestPractices: [
        'Favor targeted access for high-frequency queries.',
        'Include shard-key predicates where practical.',
        'Use explain in the sharded environment.',
        'Monitor number of shards touched per query.',
        'Balance read targeting and write distribution during shard-key design.'
      ],

      interviewAnswer: `A targeted query contains enough shard-key information for mongos to send it only to the relevant shard or subset of shards.

A scatter-gather query must be sent to many or all shards and its results merged. Scatter-gather can become increasingly expensive as shard count grows, so I analyze shard targeting when designing both the shard key and application queries.`,

      keyTakeaways: [
        'Targeted queries touch fewer shards.',
        'Scatter-gather queries touch many or all shards.',
        'Shard-key predicates enable routing.',
        'More shards can increase scatter-gather cost.',
        'Query targeting is central to sharding performance.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 11,
    question:
      'How do you enable sharding for a collection and what prerequisites should a DBA verify before sharding production data?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `Sharding a collection means telling MongoDB to distribute that collection according to a selected shard key.

A DBA should never treat this as only a command-execution task.

Before sharding production data, validate:

• cluster health
• shard health
• shard-key design
• query patterns
• data distribution
• indexes
• capacity
• application compatibility
• backup/recovery readiness.`,

      coreConcept: `Production sharding should follow:

Workload analysis
      |
      v
Shard-key selection
      |
      v
Index/design validation
      |
      v
Cluster health validation
      |
      v
Shard collection
      |
      v
Monitor distribution
      |
      v
Validate application behavior`,

      detailedExplanation: `A common administrative operation is conceptually:

sh.shardCollection(
  "shop.orders",
  { customerId: 1 }
)

But the command is the easy part.

The difficult part is choosing a shard key that supports the workload.

Before sharding, investigate:

1. DATA SIZE

How large is the collection now?

How quickly is it growing?

2. WRITE PATTERN

Are writes random or sequential?

Could one shard become the write hotspot?

3. READ PATTERN

Do important queries contain the proposed shard key?

4. CARDINALITY

Does the shard key contain enough distinct values?

5. FREQUENCY

Are a few shard-key values responsible for most documents?

6. MONOTONICITY

Does the value continuously increase?

7. INDEXING

Verify required indexes and query-supporting indexes.

8. CLUSTER CAPACITY

Every shard needs enough:

• disk
• CPU
• RAM
• I/O
• network capacity

9. HIGH AVAILABILITY

Each production shard should normally be a replica set.

10. BACKUP/RECOVERY

The backup strategy must account for the distributed cluster.

The exact administration workflow and some prerequisites can vary by MongoDB version, so production changes should always be checked against documentation for the deployed version.`,

      internalWorking: `Collection before sharding:

orders
 |
 +--> one placement

After sharding:

orders
 |
 v
Shard-key space
 |
 +--> Range A -> Shard 1
 +--> Range B -> Shard 2
 +--> Range C -> Shard 3

mongos then routes operations according
to cluster metadata.`,

      architecture: `                 APPLICATION
                      |
                      v
                   MONGOS
                      |
                      v
               Sharding metadata
                      |
           +----------+----------+
           |          |          |
           v          v          v
        Shard 1    Shard 2    Shard 3`,

      examples: [
        `Example ranged shard key:

{ customerId: 1 }`,

        `Example hashed shard key:

{ customerId: "hashed" }`,

        `Compound shard key example:

{ region: 1, customerId: 1 }`
      ],

      commands: [
        {
          command:
            'sh.shardCollection("shop.orders", { customerId: 1 })',
          explanation:
            'Illustrates sharding a collection with a ranged shard key. Validate requirements for the deployed MongoDB version before production use.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Reviews sharded-cluster and collection distribution information.'
        }
      ],

      productionScenario: `A 2 TB orders collection is approaching the practical capacity of its current replica set.

The team proposes sharding by:

status

because almost every order has that field.

But status contains only a few values:

NEW
PROCESSING
COMPLETED
FAILED

The DBA rejects this as an insufficient design because the low cardinality and skew can severely restrict useful distribution.

The team instead analyzes customer identifiers, regional distribution, write patterns, and critical query shapes before selecting the shard key.`,

      troubleshootingApproach: `Before sharding:

1. Confirm cluster health.

2. Confirm config server health.

3. Confirm all shard replica sets are healthy.

4. Measure collection size and growth.

5. Analyze candidate shard-key cardinality.

6. Analyze value frequency.

7. Analyze monotonicity.

8. Analyze read/write query patterns.

9. Verify required indexes.

10. Check disk headroom.

11. Check network capacity.

12. Check backup strategy.

13. Test using production-like data.

14. Execute the supported sharding procedure.

15. Monitor data and workload distribution afterward.`,

      commonMistakes: [
        'Choosing a shard key immediately before running the command.',
        'Sharding without analyzing production queries.',
        'Ignoring low-cardinality shard keys.',
        'Ignoring disk and network headroom.',
        'Assuming sharding automatically redistributes every workload evenly.'
      ],

      bestPractices: [
        'Treat shard-key selection as architecture work.',
        'Test with production-like data.',
        'Verify cluster health before changes.',
        'Monitor distribution after sharding.',
        'Check version-specific requirements before production execution.'
      ],

      interviewAnswer: `Before sharding a production collection, I validate cluster health, collection growth, shard-key cardinality, frequency, monotonicity, query targeting, write distribution, indexes, capacity, and backup readiness.

Then I use the supported shardCollection procedure for the deployed MongoDB version and monitor data distribution, migrations, query targeting, and shard resource utilization afterward.`,

      keyTakeaways: [
        'The command is easier than the design.',
        'Shard-key analysis comes first.',
        'Capacity and HA must be validated.',
        'Production-like testing is important.',
        'Post-change monitoring is mandatory.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 12,
    question:
      'What index relationship does a shard key have in MongoDB, and what should a DBA verify about shard-key and query indexes?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Shard keys and indexes are closely related, but they solve different problems.

Shard key:
determines distribution and routing.

Index:
helps MongoDB efficiently locate documents.

A good shard key does not automatically mean every application query is efficiently indexed.`,

      coreConcept: `Shard Key
   |
   +--> Distribution
   +--> Routing

Indexes
   |
   +--> Efficient lookup
   +--> Filtering
   +--> Sorting
   +--> Coverage

Both designs must work together.`,

      detailedExplanation: `When designing a sharded collection, the DBA must evaluate both:

SHARD-KEY REQUIREMENTS

and

APPLICATION QUERY INDEXES.

For example:

Shard key:

{ customerId: 1 }

A query may be:

{
  customerId: 1001,
  status: "OPEN",
  createdAt: { $gte: someDate }
}

The shard key helps mongos determine where to route the query.

But an index such as:

{ customerId: 1, status: 1, createdAt: -1 }

may be needed to efficiently execute the query on the target shard.

This demonstrates an important distinction:

Correct routing does not guarantee efficient execution.

Similarly:

A query may have an excellent local index but omit the shard key.

Each shard might execute the query efficiently, yet mongos may still need to contact many shards.

Therefore sharded-query performance has two major layers:

1. ROUTING EFFICIENCY

How many shards are contacted?

2. LOCAL EXECUTION EFFICIENCY

How efficiently does each participating shard execute the query?

Index requirements and shard-key constraints can vary depending on whether the collection is empty, existing, unique, ranged, hashed, and on MongoDB version.

For production administration, verify exact requirements for the deployed release instead of memorizing one universal rule.`,

      internalWorking: `Query
  |
  v
mongos routing
  |
  | shard key determines target
  v
Shard B
  |
  | local index determines efficiency
  v
IXSCAN / FETCH
  |
  v
Result`,

      architecture: `           QUERY
             |
             v
          MONGOS
             |
      shard-key routing
             |
             v
          SHARD B
             |
       local indexes
             |
             v
       query execution`,

      examples: [
        `Shard key:

{ customerId: 1 }`,

        `Query-supporting compound index:

{ customerId: 1, status: 1, createdAt: -1 }`,

        `A query can be targeted but still slow if its local execution is inefficient.`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Lists indexes so the DBA can verify shard-key-related and workload-supporting indexes.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).explain("executionStats")',
          explanation:
            'Helps evaluate both shard participation and local query execution.'
        }
      ],

      productionScenario: `An application query contains customerId and therefore reaches only one shard.

The team expects it to be fast.

However, explain shows that the target shard examines hundreds of thousands of documents because the local index does not support the remaining filter and sort.

The query is correctly targeted but poorly indexed.

The DBA fixes local execution rather than changing the shard architecture.`,

      troubleshootingApproach: `1. Identify shard key.

2. Determine number of shards targeted.

3. Inspect indexes.

4. Run explain through mongos.

5. Inspect each participating shard's execution.

6. Compare nReturned.

7. Compare totalKeysExamined.

8. Compare totalDocsExamined.

9. Check sorting.

10. Check residual filtering.

11. Design workload-specific compound indexes.

12. Avoid assuming shard-key index alone solves query performance.`,

      commonMistakes: [
        'Confusing routing with indexing.',
        'Assuming targeted query means fast query.',
        'Assuming a local index prevents scatter-gather.',
        'Creating excessive indexes on every shard.',
        'Ignoring version-specific shard-key requirements.'
      ],

      bestPractices: [
        'Analyze routing and local execution separately.',
        'Design indexes for actual query shapes.',
        'Use explain through mongos.',
        'Keep index sets deliberate.',
        'Verify version-specific sharding requirements.'
      ],

      interviewAnswer: `The shard key primarily controls data distribution and query routing, while indexes control efficient execution within participating shards.

For a slow sharded query, I separately verify whether mongos targets the correct shard set and whether each shard has an efficient execution plan. A targeted query can still be slow, and a well-indexed query can still scatter across shards.`,

      keyTakeaways: [
        'Shard key controls routing.',
        'Indexes control local execution.',
        'Both must be designed together.',
        'Targeted does not automatically mean efficient.',
        'Explain should be analyzed at the sharded-cluster level.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 13,
    question:
      'How do cardinality, frequency, and monotonicity influence shard-key quality in MongoDB?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `Three important properties for evaluating a shard-key candidate are:

Cardinality:
How many distinct values exist?

Frequency:
How often does each value occur?

Monotonicity:
Do new values continually increase or decrease?

These properties strongly affect how well MongoDB can distribute data and workload.`,

      coreConcept: `Good shard-key analysis:

             SHARD KEY
                |
       +--------+--------+
       |        |        |
       v        v        v
 Cardinality Frequency Monotonicity
       |        |        |
       +--------+--------+
                |
                v
        Distribution quality`,

      detailedExplanation: `CARDINALITY

Suppose a collection has 500 million documents.

Candidate:

status

Possible values:

NEW
OPEN
CLOSED

Only three distinct values means extremely low cardinality.

This provides poor distribution flexibility.

FREQUENCY

High cardinality alone is not enough.

Suppose:

tenantId has 1 million distinct values.

But one tenant owns:

60% of all data and writes.

That single hot value can dominate one portion of the workload.

This is frequency skew.

MONOTONICITY

Consider:

createdAt

New values continuously increase.

With certain ranged shard-key designs, new inserts repeatedly arrive at the current highest range.

That can concentrate writes.

A hashed strategy can sometimes improve distribution for monotonic source values, but may sacrifice useful range locality.

Therefore a DBA should not ask only:

"Does this field have many values?"

The DBA should ask:

• How many distinct values?
• How evenly are documents distributed?
• How evenly are writes distributed?
• Are values monotonic?
• Do queries contain the key?
• Are there hot tenants/customers/devices?
• How will behavior change as the cluster grows?`,

      internalWorking: `Candidate A:

status
3 values
-> poor cardinality


Candidate B:

customerId
millions of values
but one customer = 70% traffic
-> frequency problem


Candidate C:

timestamp
many values
always increasing
-> monotonicity risk`,

      architecture: `                 SHARD KEY
                    |
        +-----------+-----------+
        |           |           |
   Cardinality   Frequency   Monotonicity
        |           |           |
        v           v           v
 distribution   hot values   hot ranges
        \           |           /
         \          |          /
          +---------+---------+
                    |
                    v
              Cluster behavior`,

      examples: [
        `Low cardinality:

status = OPEN/CLOSED`,

        `Frequency skew:

one tenant owns most documents`,

        `Monotonic value:

createdAt or sequential sequence number`
      ],

      commands: [
        {
          command:
            'db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }])',
          explanation:
            'Simple example for examining value frequency. On very large production collections, use a carefully planned analysis method rather than blindly running expensive aggregation.'
        }
      ],

      productionScenario: `A SaaS system has thousands of tenants.

The team chooses tenantId because it has high cardinality.

After deployment, one enterprise tenant generates 45% of writes.

That tenant becomes disproportionately expensive.

The original cardinality check was technically correct but incomplete because frequency distribution was ignored.`,

      troubleshootingApproach: `1. Identify candidate keys.

2. Measure distinct-value cardinality.

3. Measure frequency distribution.

4. Identify top values.

5. Measure write frequency by key.

6. Determine monotonicity.

7. Analyze critical queries.

8. Model future growth.

9. Test ranged and hashed alternatives where appropriate.

10. Test compound candidates.

11. Simulate hot tenants or hot values.

12. Select based on workload, not one metric.`,

      commonMistakes: [
        'Looking only at cardinality.',
        'Ignoring hot values.',
        'Ignoring monotonic writes.',
        'Choosing timestamp automatically.',
        'Assuming hashed distribution is always the answer.'
      ],

      bestPractices: [
        'Evaluate cardinality, frequency, and monotonicity together.',
        'Use production-like distributions.',
        'Analyze writes separately from stored-data distribution.',
        'Include query-targeting requirements.',
        'Plan for future growth.'
      ],

      interviewAnswer: `For shard-key evaluation, I examine cardinality, frequency, and monotonicity. High cardinality provides distribution possibilities, but skewed frequency can create hot values, while monotonic keys can concentrate new writes under ranged distribution.

I combine these measurements with actual query and write patterns before selecting a key.`,

      keyTakeaways: [
        'High cardinality alone is insufficient.',
        'Frequency identifies hot values.',
        'Monotonicity can create hot ranges.',
        'Read and write patterns both matter.',
        'Shard-key analysis must use real data characteristics.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 14,
    question:
      'What are jumbo or unusually large shard-key ranges, why can they become difficult to balance, and how should a DBA investigate them?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `MongoDB distributes data by shard-key ranges.

Sometimes a range becomes unusually large or difficult to divide or migrate effectively.

Historically, the term jumbo chunk has been used for ranges that cannot be split or moved normally under particular conditions.

The exact behavior has evolved across MongoDB versions, so DBAs should focus on the underlying issue:

A range contains too much data or cannot be distributed effectively.`,

      coreConcept: `Large range
     |
     +--> many documents
     +--> same/similar shard-key values
     +--> difficult distribution
     |
     v
One shard retains excessive data/work
     |
     v
Possible imbalance`,

      detailedExplanation: `A common root cause is poor shard-key granularity.

Example:

Shard key:

{ country: 1 }

Suppose:

India = 500 GB
USA = 400 GB
UK = 50 GB

If a huge number of documents share the same shard-key value, MongoDB has limited ability to divide that exact value across independent shard-key ranges using that key alone.

This can result in large indivisible logical areas of the key space.

Possible symptoms:

• one shard remains much larger
• migrations do not achieve expected balance
• repeated migration problems
• hot shard
• balancer activity without desired improvement

The DBA should investigate:

• shard-key cardinality
• duplicate-value frequency
• range distribution
• actual data sizes
• migration logs
• balancer state

Do not immediately attempt unsupported metadata modifications.

Modern MongoDB releases have changed chunk-management and balancing behavior over time. Use version-specific supported procedures when dealing with jumbo-range conditions.`,

      internalWorking: `Shard key:

country

Huge value:

country = "IN"

Millions of documents
       |
       v
same shard-key value
       |
       v
limited ability to divide
by that key value
       |
       v
large concentrated range/workload`,

      architecture: `Shard A
+-----------------------------+
| very large key range/value  |
+-----------------------------+

Shard B
+--------+
| small  |
+--------+

Shard C
+--------+
| small  |
+--------+

Balancer cannot compensate for
fundamental shard-key granularity.`,

      examples: [
        `Poor granularity example:

{ status: 1 }`,

        `Potentially better compound design may add a sufficiently distributed field, depending on workload.`,

        `Large range investigation must use the behavior of the deployed MongoDB version.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Provides distribution information useful as a starting point.'
        }
      ],

      productionScenario: `A cluster remains heavily imbalanced even though balancing is enabled.

The DBA discovers that a huge percentage of documents share one shard-key value.

Adding another shard does not solve the problem because the existing key cannot distribute that hot value effectively.

The fundamental problem is shard-key granularity, not the number of servers.`,

      troubleshootingApproach: `1. Confirm actual shard imbalance.

2. Identify large ranges.

3. Analyze shard-key frequency.

4. Look for dominant values.

5. Check balancer activity.

6. Review migration failures.

7. Check shard logs.

8. Check disk/network pressure.

9. Verify MongoDB version behavior.

10. Use supported remediation procedures.

11. Reconsider shard-key design if the key fundamentally prevents distribution.`,

      commonMistakes: [
        'Assuming more shards automatically solve large ranges.',
        'Manually editing config metadata.',
        'Ignoring duplicate shard-key values.',
        'Treating every imbalance as a balancer bug.',
        'Using obsolete chunk-management advice without checking MongoDB version.'
      ],

      bestPractices: [
        'Design sufficient shard-key granularity.',
        'Monitor data skew.',
        'Use supported version-specific procedures.',
        'Investigate migration failures before intervention.',
        'Treat persistent indivisible hotspots as a shard-key design problem.'
      ],

      interviewAnswer: `A jumbo or unusually large shard-key range can occur when too much data is concentrated in a range that MongoDB cannot distribute effectively, often because many documents share insufficiently granular shard-key values.

I investigate key frequency, range size, balancer and migration behavior, and version-specific sharding behavior before remediation. I never directly manipulate sharding metadata as a shortcut.`,

      keyTakeaways: [
        'Large ranges can prevent effective balancing.',
        'Poor shard-key granularity is a common cause.',
        'Adding shards alone may not help.',
        'Behavior varies across MongoDB versions.',
        'Use supported remediation procedures.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 15,
    question:
      'How do you add a new shard to an existing MongoDB sharded cluster, and what should you monitor after adding it?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Adding a shard increases the cluster's potential storage and workload capacity.

But adding the shard does not mean all existing data instantly becomes evenly distributed.

MongoDB may need time and migration activity to redistribute ranges.`,

      coreConcept: `Existing:

Shard A
Shard B

Add:

Shard C
   |
   v
Cluster metadata updated
   |
   v
Balancer/migrations
   |
   v
Data gradually redistributed`,

      detailedExplanation: `In production, the new shard should normally already be a properly configured replica set.

Before adding it, verify:

• replica-set health
• member connectivity
• authentication
• TLS
• DNS/hostname resolution
• disk capacity
• filesystem configuration
• resource sizing
• time synchronization
• monitoring
• backups

A conceptual command is:

sh.addShard("rsShard3/host1:27017,host2:27017,host3:27017")

After adding it, the cluster knows about the new shard.

Existing data is not magically redistributed instantly.

The balancer may migrate ranges to the new shard over time.

This can increase:

• network traffic
• disk reads
• disk writes
• replication traffic
• I/O latency

The DBA should therefore monitor the cluster throughout redistribution.

Also remember:

Adding a shard does not fix a bad shard key.

If one hot value cannot be distributed effectively, the new shard may remain underutilized.`,

      internalWorking: `Before:

A = 50%
B = 50%

Add C:

A = 50%
B = 50%
C = 0%

Migrations occur

Possible later state:

A ~33%
B ~33%
C ~34%

Actual distribution depends on
data and shard-key characteristics.`,

      architecture: `        MONGOS
          |
    +-----+-----+
    |           |
    v           v
 Shard A     Shard B

      ADD SHARD C
          |
          v

        MONGOS
          |
   +------+------+
   |      |      |
   v      v      v
   A      B      C

Balancer can redistribute ranges.`,

      examples: [
        `New shard replica set:

rsShard3`,

        `All members should be healthy before adding the replica set as a shard.`,

        `Monitor migration impact after addition.`
      ],

      commands: [
        {
          command:
            'sh.addShard("rsShard3/host1:27017,host2:27017,host3:27017")',
          explanation:
            'Conceptual example of adding a replica set as a shard. Use actual resolvable hostnames and deployed-version requirements.'
        },
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Confirms shards registered in the cluster.'
        },
        {
          command:
            'sh.status()',
          explanation:
            'Reviews cluster distribution after the shard is added.'
        }
      ],

      productionScenario: `A cluster reaches 80% disk utilization on two shards.

A third shard is added.

Immediately afterward, the new shard has very little data.

This is expected because existing data must be redistributed through migrations.

The DBA monitors migration progress and disk headroom on the old shards rather than assuming addShard failed.`,

      troubleshootingApproach: `1. Verify new replica set health.

2. Verify network connectivity.

3. Verify authentication/TLS.

4. Add shard using supported command.

5. Confirm listShards output.

6. Check balancer state.

7. Monitor migrations.

8. Monitor disk utilization.

9. Monitor I/O latency.

10. Monitor network.

11. Monitor replication lag.

12. Verify data distribution over time.

13. Investigate shard-key skew if new shard remains underutilized.`,

      commonMistakes: [
        'Expecting immediate equal distribution.',
        'Adding an unhealthy replica set.',
        'Ignoring migration resource consumption.',
        'Adding shards without disk headroom on existing shards.',
        'Assuming a new shard fixes a hot key.'
      ],

      bestPractices: [
        'Validate the new replica set before adding it.',
        'Capacity-plan redistribution.',
        'Monitor migration impact.',
        'Add capacity before existing shards become critically full.',
        'Validate workload distribution after expansion.'
      ],

      interviewAnswer: `I first build and validate the new shard replica set, including security, connectivity, storage, monitoring, and replication health. Then I add the replica set to the cluster with the supported addShard operation.

Afterward I monitor balancing, migrations, network, disk I/O, replication lag, and actual data distribution because redistribution is gradual rather than instantaneous.`,

      keyTakeaways: [
        'A new shard should be a healthy replica set.',
        'Data redistribution takes time.',
        'Migrations consume resources.',
        'Capacity should be added before emergency conditions.',
        'Shard-key quality still determines scalability.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 16,
    question:
      'You need to remove a shard from a production MongoDB cluster. How would you approach shard draining and removal safely?',
    level: 'L3+',
    difficulty: 'Scenario / Expert',
    order: 16,

    answer: {
      groundZero: `Removing a shard is not the same as shutting down its servers.

The cluster must first stop using that shard for owned sharded data and complete the supported draining/removal workflow.

The exact procedure has changed across MongoDB releases, so the DBA must follow the procedure for the deployed version.`,

      coreConcept: `WRONG:

Stop shard
   |
   v
Data becomes unavailable


CORRECT:

Initiate supported shard removal
       |
       v
Drain/move owned data
       |
       v
Monitor progress
       |
       v
Confirm completion
       |
       v
Decommission infrastructure`,

      detailedExplanation: `A production shard may own substantial portions of the cluster's data.

Simply stopping its replica set can make those ranges unavailable.

Safe removal requires planning.

Before removal:

• verify remaining shards have sufficient disk
• verify remaining shards have CPU/RAM capacity
• verify network capacity
• verify balancer/migration health
• verify backups
• verify the shard itself is healthy enough to participate in draining

During removal, data and ownership must move away from the shard through supported cluster mechanisms.

This may create substantial:

• network traffic
• disk reads
• disk writes
• replication activity
• migration load

The DBA should continuously monitor:

• remaining data
• migration progress
• disk headroom
• replication lag
• application latency
• errors

Only after MongoDB reports the supported removal workflow complete should the underlying shard infrastructure be decommissioned.

Do not use an old memorized command sequence without checking the exact MongoDB version.`,

      internalWorking: `Initial:

Shard A = data
Shard B = data
Shard C = data

Remove C:

C data/ranges
   |
   +--> A
   +--> B
   |
   v
C eventually owns no required data
   |
   v
Removal completes
   |
   v
Decommission C`,

      architecture: `Before:

 A      B      C
 |      |      |
data   data   data

Drain C:

       C
      / \
     v   v
     A   B

After supported completion:

 A      B
 |      |
data   data`,

      examples: [
        `Always check available capacity on destination shards before draining.`,

        `A large shard removal can take significant time.`,

        `Removal should be treated as a controlled migration project, not a server shutdown.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ removeShard: "shardName" })',
          explanation:
            'Historically/commonly used as part of shard-removal workflows. Exact behavior and required follow-up steps must be verified for the deployed MongoDB version.'
        },
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Useful for confirming current cluster shard membership.'
        }
      ],

      productionScenario: `A five-shard cluster needs to be reduced to four shards.

The shard being removed stores 1.5 TB.

The remaining shards have only 200 GB free each.

The DBA refuses to start removal because there is insufficient destination capacity.

Capacity is expanded first.

This prevents a removal operation from pushing the remaining shards into critical disk pressure.`,

      troubleshootingApproach: `1. Identify MongoDB version.

2. Review supported removal procedure.

3. Measure data on shard.

4. Measure free capacity elsewhere.

5. Verify cluster health.

6. Verify balancing/migration health.

7. Confirm backups.

8. Initiate supported removal.

9. Monitor progress.

10. Monitor disk.

11. Monitor I/O/network.

12. Monitor replication lag.

13. Monitor application latency.

14. Confirm MongoDB reports completion.

15. Only then decommission servers.`,

      commonMistakes: [
        'Stopping the shard before draining.',
        'Ignoring destination capacity.',
        'Assuming removal is instantaneous.',
        'Using obsolete removal procedures.',
        'Decommissioning servers before cluster removal completes.'
      ],

      bestPractices: [
        'Treat shard removal as a planned migration.',
        'Check destination capacity first.',
        'Maintain backups.',
        'Monitor throughout the drain.',
        'Verify version-specific procedures.'
      ],

      interviewAnswer: `I never remove a production shard by simply shutting down its replica set. I first verify remaining capacity and cluster health, then use the supported shard-removal workflow for the deployed MongoDB version.

I monitor draining, migrations, disk, network, replication lag, and application latency and decommission the infrastructure only after MongoDB confirms removal is complete.`,

      keyTakeaways: [
        'Shard removal requires draining.',
        'Destination capacity must be sufficient.',
        'Removal can be resource intensive.',
        'Procedures are version-sensitive.',
        'Decommission only after confirmed completion.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 17,
    question:
      'One shard is receiving most writes while the other shards are mostly idle. How would you investigate a hot-shard problem?',
    level: 'L3+',
    difficulty: 'Scenario / Expert',
    order: 17,

    answer: {
      groundZero: `A hot shard means workload is distributed unevenly.

The first question should not be:

"How do I move some data?"

The first question should be:

"Why is the workload targeting this shard?"`,

      coreConcept: `Hot shard investigation:

Shard key
   |
   +--> cardinality
   +--> frequency
   +--> monotonicity
   +--> write pattern
   +--> range ownership
   +--> application behavior
   |
   v
Root cause`,

      detailedExplanation: `Suppose:

Shard A = 80% write load
Shard B = 10%
Shard C = 10%

Possible causes include:

1. MONOTONIC RANGED SHARD KEY

New writes continuously target the newest key range.

2. HOT SHARD-KEY VALUE

One tenant/customer/device produces most traffic.

3. LOW CARDINALITY

There are not enough values for effective distribution.

4. DATA SKEW

The active data happens to reside primarily on one shard.

5. APPLICATION ACCESS PATTERN

Queries intentionally target one tenant or region.

6. BALANCING/MIGRATION ISSUES

Distribution may not have caught up with growth.

The DBA should compare both:

DATA DISTRIBUTION

and

WORKLOAD DISTRIBUTION.

A cluster can have approximately equal disk usage while still having a hot shard because the active workload is concentrated on a subset of data.

Similarly, moving old cold data does not necessarily fix a hot write range.

The root cause may require shard-key redesign or application-level changes rather than more hardware.`,

      internalWorking: `Disk:

A 33%
B 33%
C 34%

Looks balanced.

Writes:

A 85%
B 8%
C 7%

Not balanced.

Therefore:

Data balance != workload balance.`,

      architecture: `Application writes
      |
      v
    mongos
      |
      |
      +===========> Shard A  HOT
      |
      +--> Shard B
      |
      +--> Shard C

Investigate why routing
concentrates on A.`,

      examples: [
        `Monotonic key:

{ createdAt: 1 }`,

        `Hot tenant:

tenantId = enterpriseCustomer1`,

        `Low-cardinality key:

status`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Starting point for reviewing data distribution and sharding configuration.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect active operations when used carefully and with appropriate privileges.'
        }
      ],

      productionScenario: `A three-shard cluster has equal disk utilization.

Yet Shard 3 runs at 90% CPU while Shards 1 and 2 run at 25%.

Investigation finds the latest timestamp range belongs to Shard 3 and nearly all new inserts target that range.

The problem is a write hotspot caused by the ranged monotonic shard-key pattern, not disk imbalance.`,

      troubleshootingApproach: `1. Compare per-shard CPU.

2. Compare writes/sec.

3. Compare reads/sec.

4. Compare disk latency.

5. Compare network.

6. Identify shard key.

7. Analyze cardinality.

8. Analyze frequency.

9. Analyze monotonicity.

10. Identify hot ranges.

11. Check balancer/migrations.

12. Identify top application operations.

13. Correlate hot queries with shard ownership.

14. Determine whether shard-key redesign is required.`,

      commonMistakes: [
        'Looking only at disk distribution.',
        'Adding shards before understanding routing.',
        'Assuming balancer fixes hot writes.',
        'Ignoring monotonic keys.',
        'Ignoring hot tenants.'
      ],

      bestPractices: [
        'Monitor workload per shard.',
        'Analyze active data separately from total data.',
        'Design against hot values.',
        'Test peak-write patterns.',
        'Fix the distribution cause rather than masking it with hardware.'
      ],

      interviewAnswer: `For a hot shard, I compare per-shard workload and data distribution, then analyze the shard key for cardinality, frequency, monotonicity, hot values, and active range ownership.

I also correlate application operations and balancing activity. Equal disk distribution does not mean equal workload, so I identify why routing concentrates traffic before deciding whether the fix is balancing, query changes, capacity, or shard-key redesign.`,

      keyTakeaways: [
        'Hot shard is a workload-distribution problem.',
        'Data balance and workload balance differ.',
        'Monotonic keys can hotspot writes.',
        'Hot values can dominate a shard.',
        'Root cause must be identified before scaling.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 18,
    question:
      'What happens when one shard becomes unavailable in a MongoDB sharded cluster, and how would you troubleshoot the incident?',
    level: 'L3+',
    difficulty: 'Scenario / Expert',
    order: 18,

    answer: {
      groundZero: `A sharded cluster distributes different portions of data across shards.

Therefore if one entire shard becomes unavailable, operations requiring data owned by that shard can fail or become unavailable.

This is why each shard is normally a replica set.`,

      coreConcept: `Cluster:

Shard A = healthy
Shard B = unavailable
Shard C = healthy

Data on A/C may still be reachable for operations
that can be satisfied without B.

Operations requiring B can fail.

Exact application behavior depends on
operation type and routing.`,

      detailedExplanation: `First distinguish:

SHARD MEMBER FAILURE

from

ENTIRE SHARD FAILURE.

If one member of a shard replica set fails:

the shard may remain available because another member can continue or be elected Primary.

If the entire shard replica set loses availability:

the cluster loses access to the data owned by that shard for operations requiring it.

A targeted query to another healthy shard may still be serviceable.

A scatter-gather operation that requires responses from all relevant shards may fail if one required shard cannot respond.

The DBA should investigate the failing shard as a replica-set incident:

• member states
• Primary availability
• majority
• network
• authentication/TLS
• disk
• process state
• replication

At the same time, investigate mongos logs and application errors to understand cluster-level impact.

Do not immediately change sharding metadata to point the failed shard's ranges at another shard.

The other shards do not automatically contain copies of that shard's data.`,

      internalWorking: `mongos
 |
 +--> Shard A OK
 |
 +--> Shard B DOWN
 |
 +--> Shard C OK

Query needing only A:
may succeed

Query requiring B:
fails

Query requiring A+B+C:
can fail because B is unavailable`,

      architecture: `                  MONGOS
                    |
          +---------+---------+
          |         |         |
          v         v         v
       Shard A   Shard B   Shard C
         OK        DOWN       OK
                   |
             Replica-set
               incident`,

      examples: [
        `Single Secondary failure does not necessarily make a shard unavailable.`,

        `Loss of replica-set majority can affect write availability for that shard.`,

        `A full shard outage is different from a mongos outage.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Confirms configured shards from cluster perspective.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Run in the affected shard replica-set context to inspect member state and election/replication health.'
        }
      ],

      productionScenario: `Applications report failures for some customer requests while others continue working.

The DBA initially expects a full cluster outage.

Investigation finds Shard B has lost its Primary and cannot elect another because a majority of its voting members are unreachable.

Customers whose data is on Shards A and C may still see some successful targeted operations, while operations requiring Shard B fail.

The root cause is a shard-level replica-set availability failure.`,

      troubleshootingApproach: `1. Identify affected shard.

2. Determine whether one member or entire shard is affected.

3. Check rs.status() on that shard.

4. Check Primary availability.

5. Check voting majority.

6. Check network.

7. Check mongod processes.

8. Check disk capacity.

9. Check logs.

10. Check authentication/TLS.

11. Check mongos logs.

12. Identify affected query patterns.

13. Restore shard replica-set availability.

14. Verify routing and application recovery.

15. Avoid unsupported metadata manipulation.`,

      commonMistakes: [
        'Assuming one shard outage always means every operation fails.',
        'Assuming other shards contain the failed shard data.',
        'Changing metadata to another shard.',
        'Ignoring replica-set majority.',
        'Troubleshooting only mongos.'
      ],

      bestPractices: [
        'Deploy each shard as a resilient replica set.',
        'Distribute replica-set members across failure domains.',
        'Monitor each shard independently.',
        'Test shard-level failures.',
        'Maintain documented recovery procedures.'
      ],

      interviewAnswer: `If an entire shard becomes unavailable, operations requiring data owned by that shard can fail. Other targeted operations may still work if they depend only on healthy shards.

I first determine whether this is a single-member failure or loss of the entire shard replica set, then investigate Primary availability, majority, member states, network, disk, process health, logs, and mongos impact. I restore the shard rather than manipulating ownership metadata.`,

      keyTakeaways: [
        'Each shard owns unique portions of sharded data.',
        'Replica sets protect shard availability.',
        'One member failure differs from full shard failure.',
        'Impact depends on query routing.',
        'Recover the shard, not the metadata.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 19,
    question:
      'A sharded cluster has highly uneven disk usage and the balancer is enabled. How would you investigate why data is not distributing evenly?',
    level: 'L3+',
    difficulty: 'Scenario / Expert',
    order: 19,

    answer: {
      groundZero: `Balancer enabled does not guarantee perfectly equal disk usage.

Uneven distribution can result from:

• shard-key skew
• large ranges
• migration failures
• capacity constraints
• active balancing
• different unsharded data
• indexes
• other per-shard storage differences.`,

      coreConcept: `Uneven disk
    |
    +--> Data distribution?
    +--> Workload?
    +--> Large ranges?
    +--> Migration failure?
    +--> Shard-key skew?
    +--> Unsharded data?
    +--> Index/storage differences?
    |
    v
Root cause`,

      detailedExplanation: `Suppose:

Shard A = 85% disk
Shard B = 50%
Shard C = 45%

Do not conclude:

"The balancer is broken."

First determine what is consuming disk.

Possible causes:

1. SHARDED COLLECTION DISTRIBUTION

One shard may own more data.

2. SHARD-KEY FREQUENCY SKEW

Some ranges may contain much more data.

3. LARGE OR DIFFICULT-TO-MOVE RANGES

Distribution may be constrained by shard-key granularity.

4. MIGRATION FAILURES

Network, storage, or cluster-health issues may prevent successful migrations.

5. UNBALANCED UNRELATED DATA

Not every byte on a shard necessarily comes from the sharded collection being investigated.

6. INDEX SIZE

Different data volumes produce different index footprints.

7. BALANCING STILL IN PROGRESS

Redistribution can take substantial time.

8. STORAGE HISTORY

Deleted space and storage-engine allocation can make filesystem usage differ from logical data size.

Therefore compare:

• filesystem usage
• db/collection size
• index size
• logical data distribution
• range ownership
• migration history
• balancer state

These are related but not identical metrics.`,

      internalWorking: `Disk usage:

A = 850 GB
B = 500 GB
C = 450 GB

Possible explanation:

A:
500 GB sharded data
200 GB unsharded data
150 GB indexes/other

Therefore:

Filesystem utilization alone
does not prove balancer failure.`,

      architecture: `               HIGH DISK
                   |
        +----------+----------+
        |          |          |
        v          v          v
    logical     indexes    unrelated
     data                    data
        |
        v
 shard ranges
        |
   +----+----+
   |         |
   v         v
 skew?    migration
          failure?`,

      examples: [
        `Check whether the imbalance exists at collection level, not just filesystem level.`,

        `Check whether migrations are actively running or failing.`,

        `Check whether a few shard-key values contain disproportionate data.`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Starting point for reviewing sharded collection placement and cluster state.'
        },
        {
          command:
            'db.stats()',
          explanation:
            'Provides database-level storage statistics in the context where it is executed; interpretation in a sharded environment requires care.'
        }
      ],

      productionScenario: `Shard A reaches 90% filesystem usage while other shards remain near 55%.

Balancer is enabled.

Investigation finds that Shard A also contains a large amount of unrelated unsharded data plus larger index footprint.

The sharded collection itself is much closer to expected distribution.

The apparent balancer failure was caused by comparing total filesystem utilization rather than the relevant logical data.`,

      troubleshootingApproach: `1. Measure filesystem usage.

2. Measure logical collection sizes.

3. Measure index sizes.

4. Identify unsharded data.

5. Inspect range distribution.

6. Analyze shard-key frequency.

7. Identify large ranges.

8. Check balancer state.

9. Check migration activity.

10. Review migration errors.

11. Check disk/network pressure.

12. Check replication health.

13. Determine whether balancing is still progressing.

14. Compare logical and physical storage metrics separately.`,

      commonMistakes: [
        'Equating filesystem usage directly with range balance.',
        'Assuming enabled balancer means instant equality.',
        'Ignoring index sizes.',
        'Ignoring unsharded data.',
        'Ignoring shard-key skew.'
      ],

      bestPractices: [
        'Compare logical and physical storage separately.',
        'Monitor migration history.',
        'Track per-collection distribution.',
        'Maintain sufficient disk headroom.',
        'Investigate persistent skew at the shard-key level.'
      ],

      interviewAnswer: `If disk usage is uneven despite balancing, I first separate filesystem utilization from logical sharded-data distribution.

I check collection and index sizes, unsharded data, range ownership, shard-key skew, large ranges, migration activity and failures, disk/network pressure, and replication health. An enabled balancer does not guarantee identical filesystem utilization.`,

      keyTakeaways: [
        'Uneven disk does not prove balancer failure.',
        'Logical and physical size differ.',
        'Indexes and unsharded data matter.',
        'Migration failures can block redistribution.',
        'Shard-key skew remains a major cause.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'sharding_fundamentals',
    topicId: 'sharding-fundamentals',
    topicNumber: 9,
    topicName: 'Sharding Fundamentals',
    questionNumber: 20,
    question:
      'A production sharded cluster suddenly has high latency, one hot shard, increasing disk usage, scatter-gather queries, and active migrations. How would you perform an end-to-end L3 investigation?',
    level: 'L3+',
    difficulty: 'Scenario / Expert',
    order: 20,

    answer: {
      groundZero: `This is a multi-layer production incident.

Do not immediately:

• restart mongos
• disable balancer
• add indexes blindly
• add shards blindly
• move ranges manually
• clear caches

First determine which layer is causing the pressure.`,

      coreConcept: `End-to-end investigation:

Application
    |
    v
mongos routing
    |
    v
Shard targeting
    |
    v
Query plans
    |
    v
Shard-key distribution
    |
    v
Balancer/migrations
    |
    v
Replica-set health
    |
    v
CPU / RAM / Disk / Network
    |
    v
Root cause`,

      detailedExplanation: `A strong L3 investigation should correlate multiple layers.

STEP 1 — ESTABLISH TIMELINE

Determine:

• when latency increased
• when migrations started
• when disk growth accelerated
• whether deployment occurred
• whether workload changed
• whether a shard was added/removed

STEP 2 — CHECK CLUSTER TOPOLOGY

Verify:

• mongos availability
• config server replica set
• all shards
• shard replica-set Primaries
• replication health

STEP 3 — IDENTIFY HOT SHARD

Compare per shard:

• CPU
• memory
• read/write rate
• connections
• disk latency
• disk throughput
• network
• replication lag

STEP 4 — ANALYZE SHARD KEY

Check:

• cardinality
• frequency
• monotonicity
• hot values
• active ranges

STEP 5 — ANALYZE QUERY TARGETING

Determine which critical queries are:

• targeted
• multi-shard
• scatter-gather

STEP 6 — ANALYZE QUERY PLANS

Use explain.

Compare:

• nReturned
• totalKeysExamined
• totalDocsExamined
• IXSCAN/COLLSCAN
• FETCH filtering
• SORT
• shard participation

STEP 7 — ANALYZE MIGRATIONS

Determine:

• why migrations are occurring
• whether they correlate with latency
• whether they are succeeding
• network/disk impact

STEP 8 — ANALYZE DISK

Separate:

• logical data growth
• index growth
• filesystem growth
• migration overhead
• storage-engine behavior

STEP 9 — DETERMINE CAUSAL CHAIN

Example:

monotonic shard key
→ hot write range
→ one shard overloaded
→ balancer migrations
→ extra disk/network I/O
→ disk latency increases
→ queries slow
→ scatter-gather waits on slow shard
→ application latency increases

This is much stronger than simply saying:

"Disk is slow."

STEP 10 — APPLY LOWEST-RISK FIX

Immediate mitigation may differ from long-term remediation.

Long-term solution may involve:

• query changes
• index changes
• shard-key strategy changes
• capacity expansion
• application routing changes
• workload redesign

The correct action depends on evidence.`,

      internalWorking: `Application latency
        |
        v
Scatter-gather
        |
        v
All shards contacted
        |
        +--> A fast
        +--> B HOT/SLOW
        +--> C fast
        |
        v
Query waits on B
        |
        v
B also handling migrations
        |
        v
Disk/network pressure
        |
        v
Higher cluster latency`,

      architecture: `                  APPLICATION
                       |
                       v
                    MONGOS
                       |
              scatter-gather
                       |
          +------------+------------+
          |            |            |
          v            v            v
       SHARD A      SHARD B      SHARD C
        normal        HOT         normal
                       |
                 +-----+-----+
                 |           |
                 v           v
              writes     migrations
                 \           /
                  \         /
                   v       v
                  DISK / NETWORK
                     PRESSURE
                        |
                        v
                     LATENCY`,

      examples: [
        `Possible chain:

poor shard key -> hot shard -> migrations -> I/O pressure -> latency`,

        `Alternative chain:

application deployment -> scatter-gather explosion -> all shards overloaded`,

        `Alternative chain:

storage latency -> slow shard -> cluster-wide scatter-gather latency`
      ],

      commands: [
        {
          command:
            'sh.status()',
          explanation:
            'Reviews cluster topology and sharding distribution.'
        },
        {
          command:
            'db.adminCommand({ listShards: 1 })',
          explanation:
            'Confirms configured shards.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Example for examining shard participation and query execution.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect currently active operations when used carefully.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Used within an individual shard replica-set context to verify replication and member health.'
        }
      ],

      productionScenario: `A twelve-shard production cluster suddenly reports 8-second API latency.

Monitoring shows:

• Shard 7 CPU = 95%
• Shard 7 disk latency is elevated
• balancing migrations involve Shard 7
• application deployment increased queries without shard-key predicates
• many queries now contact all twelve shards

The DBA identifies two interacting problems:

1. Shard 7 is under migration and write pressure.

2. A new application query pattern creates widespread scatter-gather.

Because scatter-gather requests depend on responses from all participating shards, the slow shard increases end-to-end latency.

Immediate mitigation focuses on the application regression and cluster pressure.

Long-term work reviews shard-key and workload distribution.

The DBA does not blindly restart the cluster.`,

      troubleshootingApproach: `1. Establish incident timeline.

2. Check mongos health.

3. Check config server replica set.

4. Check every shard replica set.

5. Compare per-shard resource metrics.

6. Identify hot shard.

7. Analyze shard-key distribution.

8. Identify hot values/ranges.

9. Identify top queries.

10. Determine shard targeting.

11. Run explain.

12. Check index efficiency.

13. Review active migrations.

14. Check migration errors.

15. Correlate migration timing with latency.

16. Check disk latency and throughput.

17. Check network saturation.

18. Check replication lag.

19. Check recent deployments/config changes.

20. Build a causal chain from evidence.

21. Apply lowest-risk mitigation.

22. Validate recovery.

23. Document root cause.

24. Implement permanent remediation.`,

      commonMistakes: [
        'Restarting components before collecting evidence.',
        'Disabling the balancer without understanding migration cause.',
        'Adding shards blindly.',
        'Adding indexes blindly.',
        'Looking only at average cluster metrics.',
        'Ignoring per-shard workload.',
        'Ignoring scatter-gather behavior.',
        'Treating correlation as proof of causation.'
      ],

      bestPractices: [
        'Troubleshoot layer by layer.',
        'Compare metrics per shard.',
        'Correlate application and database timelines.',
        'Analyze routing and local execution separately.',
        'Separate immediate mitigation from permanent design changes.',
        'Document evidence and causal chain.'
      ],

      interviewAnswer: `For an L3 sharded-cluster incident, I first establish the timeline and validate mongos, config servers, and every shard replica set.

Then I compare per-shard CPU, memory, disk, network, connections, and replication lag to identify hotspots. I analyze shard-key cardinality, frequency and monotonicity, inspect query targeting and explain plans, and correlate balancer migrations with resource pressure.

The goal is to build an evidence-based causal chain—for example, a hot shard plus migration I/O causing a slow shard that increases scatter-gather latency—before applying the lowest-risk mitigation and then designing the permanent fix.`,

      keyTakeaways: [
        'Sharded-cluster incidents are multi-layer problems.',
        'Per-shard metrics are essential.',
        'Routing and local query execution must both be analyzed.',
        'Migrations can amplify existing pressure.',
        'The goal is an evidence-based causal chain.',
        'Immediate mitigation and permanent remediation may differ.'
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

    console.log('Connected to webapp.questions');

    const deleteResult = await collection.deleteMany({
      category: 'sharding_fundamentals'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous sharding_fundamentals documents`
    );

    const insertResult = await collection.insertMany(questions);

    console.log(
      `Inserted ${insertResult.insertedCount} Sharding Fundamentals questions`
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
      category: 'sharding_fundamentals'
    });

    const curriculumCount = await collection.countDocuments({
      topicId: { $exists: true }
    });

    console.log(`Topic 9 count: ${topicCount}`);
    console.log(
      `New curriculum question count: ${curriculumCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 9 validation failed. Expected 20 questions but found ${topicCount}.`
      );
    }

    console.log(
      'Topic 9 seed completed successfully.'
    );
  } catch (error) {
    console.error(
      'Topic 9 seed failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
