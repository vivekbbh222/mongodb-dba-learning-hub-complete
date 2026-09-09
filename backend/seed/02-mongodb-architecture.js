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
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 1,
    question:
      'What is the overall architecture of MongoDB and what are its major components?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `MongoDB is not just a program that saves JSON-like documents to disk.

A production MongoDB system contains multiple layers that work together.

At a high level, an application communicates with MongoDB through a MongoDB driver.

The driver sends database operations to a MongoDB server process.

The server authenticates the connection, understands the requested operation, determines how to execute it, interacts with indexes and the storage engine, and returns the result.

For production high availability, multiple mongod processes are normally combined into a replica set.

For horizontal scaling, multiple replica sets can be organized as shards inside a sharded cluster.`,

      coreConcept: `The major MongoDB architectural components can be viewed as:

Application
    ↓
MongoDB Driver
    ↓
Network / Connection Layer
    ↓
mongod or mongos
    ↓
Authentication / Authorization
    ↓
Command / Query Processing
    ↓
Query Planner
    ↓
Execution Engine
    ↓
Indexes / Collections
    ↓
WiredTiger Storage Engine
    ↓
Filesystem
    ↓
Disk

Production deployments may additionally include:

• Replica sets
• Oplog replication
• Elections
• Sharding
• mongos routers
• Config server replica sets
• Monitoring
• Backup systems`,

      detailedExplanation: `The exact architecture depends on the deployment type.

A standalone deployment contains one mongod process.

It is useful for development or specific non-high-availability workloads, but it does not provide replica-set failover.

A replica set contains multiple mongod processes.

Normally one member is PRIMARY and the remaining data-bearing members are SECONDARY members.

Applications send normal writes to the primary.

Secondaries replicate changes using the replica-set replication mechanism.

If the primary becomes unavailable, eligible voting members can participate in an election.

A sharded cluster introduces another layer.

Applications normally connect to mongos processes.

mongos acts as a query router.

The cluster contains:

• One or more mongos routers
• A config server replica set
• Multiple shards

Each production shard is normally itself a replica set.

The config servers maintain important sharding metadata.

mongos uses metadata and the shard key to determine which shard or shards should receive an operation.

At the storage level, MongoDB uses a storage engine.

For modern MongoDB deployments, WiredTiger is the standard storage engine.

WiredTiger handles important storage responsibilities such as:

• Cache management
• Compression
• Checkpoints
• Concurrency
• Persistence of collection and index data

MongoDB therefore consists of several cooperating layers rather than one simple storage process.`,

      internalWorking: `Consider a simple query:

db.users.find({
  email: "vivek@example.com"
})

A simplified request path is:

1. The application calls the MongoDB driver.

2. The driver selects an appropriate MongoDB server according to topology, read preference, and server-selection rules.

3. The operation travels over an established connection.

4. mongod receives the command.

5. Authentication and authorization rules are applied.

6. MongoDB parses the query.

7. The query planner evaluates possible execution plans.

8. An appropriate index may be selected.

9. The execution engine retrieves matching records.

10. WiredTiger supplies required data from cache or storage.

11. MongoDB constructs the result.

12. The driver receives the response.

13. The application receives the final objects.

For a write in a replica set, additional replication behaviour is involved.

The primary applies the write and records replication information in the oplog.

Secondary members continuously replicate operations.

The acknowledgement returned to the application depends partly on the configured write concern.`,

      architecture: `SINGLE SERVER

Application
    |
    v
MongoDB Driver
    |
    v
mongod
    |
    +-- Authentication
    |
    +-- Query Processing
    |
    +-- Query Planner
    |
    +-- Execution Engine
    |
    +-- Indexes
    |
    v
WiredTiger
    |
    v
Filesystem / Disk


REPLICA SET

                Application
                    |
                    v
                  Driver
                    |
                    v
                 PRIMARY
                /       \\
               /         \\
              v           v
        SECONDARY     SECONDARY


SHARDED CLUSTER

Application
    |
    v
Driver
    |
    v
mongos
    |
    +--------> Shard 1 Replica Set
    |
    +--------> Shard 2 Replica Set
    |
    +--------> Shard 3 Replica Set
    |
    v
Config Server Replica Set
(metadata)`,

      examples: [
        `Development architecture:

Application → Driver → Standalone mongod`,

        `Typical production high-availability architecture:

Application → Driver → 3-member replica set`,

        `Large horizontally scaled architecture:

Application → mongos → multiple shards

with a config server replica set maintaining sharding metadata.`
      ],

      commands: [
        {
          command: 'db.version()',
          explanation:
            'Displays the MongoDB server version for the current connection.'
        },
        {
          command: 'db.serverStatus().storageEngine',
          explanation:
            'Displays information about the configured MongoDB storage engine.'
        },
        {
          command: 'rs.status()',
          explanation:
            'Shows replica-set member states and replication-related status when connected to a replica set.'
        },
        {
          command: 'rs.conf()',
          explanation:
            'Displays the replica-set configuration document.'
        },
        {
          command: 'db.adminCommand({ hello: 1 })',
          explanation:
            'Returns topology and server-role information useful for understanding the connected MongoDB member.'
        }
      ],

      productionScenario: `An application team reports:

"MongoDB is down."

An L3 DBA should not treat MongoDB as one single component.

The investigation should determine which architectural layer has failed.

For example:

Is the application unable to resolve the MongoDB hostname?

Is network connectivity failing?

Are all connection-pool connections exhausted?

Is mongod running?

Is the server PRIMARY or SECONDARY?

Was there an election?

Can a majority of replica-set voting members communicate?

Is authentication failing?

Is disk full?

Is WiredTiger unable to start?

Is the application connected through mongos?

Are config servers healthy?

Is only one shard unavailable?

Understanding architecture allows the DBA to isolate the failing layer rather than immediately restarting services.`,

      troubleshootingApproach: `For a broad MongoDB availability incident:

1. Identify the deployment type.

Standalone, replica set, or sharded cluster.

2. Verify process availability.

3. Verify network connectivity.

4. Check db.adminCommand({ hello: 1 }).

5. For replica sets, check rs.status().

6. Review MongoDB logs.

7. Check CPU, memory, disk capacity, and disk latency.

8. Verify authentication and TLS where configured.

9. Check application connection-string configuration.

10. For sharded clusters, inspect mongos, config-server, and shard health separately.

11. Identify the exact architectural layer that is failing.

12. Avoid restarting components until the failure mechanism is understood.

Architecture knowledge turns a vague incident into a structured investigation.`,

      commonMistakes: [
        'Thinking MongoDB consists only of mongod and disk.',
        'Restarting mongod before understanding which layer failed.',
        'Ignoring the driver and connection layer during troubleshooting.',
        'Treating replica-set and sharded-cluster architecture as the same thing.',
        'Assuming a healthy operating system automatically means MongoDB is healthy.'
      ],

      bestPractices: [
        'Understand the complete request path from application to storage.',
        'Use replica sets for production high availability.',
        'Monitor database and infrastructure layers separately.',
        'Know the role of every process in the deployment.',
        'Troubleshoot the failing architectural layer rather than restarting blindly.'
      ],

      interviewAnswer: `MongoDB architecture consists of multiple layers.

Applications normally communicate through MongoDB drivers with mongod processes or mongos routers.

mongod contains command processing, query planning and execution components and uses the WiredTiger storage engine for persistence.

Production high availability is provided through replica sets, while horizontal scaling is provided through sharded clusters consisting of mongos routers, a config server replica set, and shards that are normally replica sets.

As a DBA, understanding the complete application-to-storage request path is essential for troubleshooting.`,

      keyTakeaways: [
        'MongoDB has multiple architectural layers.',
        'mongod is the core database server process.',
        'WiredTiger is responsible for major storage-engine functions.',
        'Replica sets provide high availability and replication.',
        'Sharding provides horizontal scale.',
        'L3 troubleshooting requires isolating the failing architectural layer.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 2,
    question:
      'What is the mongod process and what responsibilities does it have?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `mongod is the main MongoDB database server process.

When people say:

"MongoDB service is running"

they are commonly referring to a running mongod process.

mongod listens for client connections, processes database operations, manages data, interacts with the storage engine, and participates in replication when configured as a replica-set member.`,

      coreConcept: `mongod is responsible for major server-side database functions including:

• Accepting client connections
• Authentication
• Authorization
• Command processing
• Query processing
• Query planning
• CRUD operations
• Aggregation
• Index management
• Storage-engine interaction
• Replication
• Transactions
• Logging
• Background database activity
• Server metrics`,

      detailedExplanation: `mongod starts using configuration supplied through command-line options or a configuration file such as:

/etc/mongod.conf

The configuration can define settings including:

storage.dbPath

systemLog.path

net.port

net.bindIp

security.authorization

replication.replSetName

processManagement options

TLS settings

Once mongod starts, it initializes the configured storage engine and opens the database files located under dbPath.

It then starts listening on the configured network interfaces and port.

In a replica set, mongod also performs replica-set responsibilities such as:

• Heartbeats
• Member-state management
• Oplog replication
• Election participation
• Initial sync
• Rollback handling
• Majority commit tracking

The same mongod binary can therefore act as:

• A standalone server
• A replica-set primary
• A replica-set secondary
• A config server member
• A shard member

depending on configuration.`,

      internalWorking: `Simplified mongod startup:

Operating System
      |
      v
Start mongod
      |
      v
Read Configuration
      |
      v
Initialize Logging
      |
      v
Open dbPath
      |
      v
Initialize WiredTiger
      |
      v
Initialize Replication
(if configured)
      |
      v
Open Network Listener
      |
      v
Accept Client Operations

During normal operation:

Client Request
      |
      v
mongod
      |
      +-- Security
      +-- Command handling
      +-- Query planning
      +-- Execution
      +-- Replication
      |
      v
WiredTiger`,

      architecture: `                mongod
                  |
      +-----------+-----------+
      |           |           |
      v           v           v
   Network      Query     Replication
      |         Engine       Layer
      |           |           |
      +-----------+-----------+
                  |
                  v
              WiredTiger
                  |
                  v
               dbPath`,

      examples: [
        `Standalone:

mongod

operates as one independent database server.`,

        `Replica set:

mongod PRIMARY
mongod SECONDARY
mongod SECONDARY

All three are mongod processes with different replica-set states.`,

        `A mongos process is not the same as mongod.

mongos routes sharded-cluster operations while mongod stores and processes database data.`
      ],

      commands: [
        {
          command: 'ps -ef | grep [m]ongod',
          explanation:
            'Shows running mongod processes and their startup arguments on Linux.'
        },
        {
          command: 'systemctl status mongod',
          explanation:
            'Shows systemd service state where MongoDB is managed as the mongod service.'
        },
        {
          command: 'db.adminCommand({ getCmdLineOpts: 1 })',
          explanation:
            'Displays parsed MongoDB startup options and configuration visible through the server.'
        },
        {
          command: 'db.serverStatus().process',
          explanation:
            'Displays the server process type reported by MongoDB.'
        }
      ],

      productionScenario: `A monitoring system reports that TCP port 27017 is unavailable.

The wrong response is immediately:

restart mongod.

The DBA should first determine:

Is the mongod process running?

Is it listening on the expected port?

Is bindIp correct?

Did mongod fail during startup?

Is another process using the port?

Is the filesystem containing dbPath mounted?

Is the disk full?

Did WiredTiger report a startup error?

Is TLS configuration invalid?

Did the service receive SIGTERM?

Was the entire server rebooted?

The process state is only one piece of the incident.`,

      troubleshootingApproach: `For mongod process problems:

1. Check the process.

ps -ef | grep [m]ongod

2. Check service state.

systemctl status mongod

3. Check configured port and bind address.

4. Review the MongoDB log.

5. Check recent SIGTERM or shutdown messages.

6. Check operating-system reboot history.

7. Check dbPath availability.

8. Check filesystem capacity.

9. Check permissions.

10. Check WiredTiger startup messages.

11. Check replica-set state after startup.

12. Verify application connectivity.

A clean mongod restart does not explain why it stopped.

An L3 RCA must identify the cause of the stop.`,

      commonMistakes: [
        'Assuming mongod and mongos are the same process.',
        'Restarting mongod before collecting evidence.',
        'Checking only systemctl without checking MongoDB logs.',
        'Ignoring dbPath permissions and filesystem availability.',
        'Assuming a stopped mongod proves MongoDB itself crashed.'
      ],

      bestPractices: [
        'Collect logs before restarting when possible.',
        'Know the mongod configuration file and dbPath.',
        'Monitor process, port, disk, and replication state.',
        'Use graceful shutdown procedures.',
        'Correlate MongoDB events with operating-system events during RCA.'
      ],

      interviewAnswer: `mongod is MongoDB's primary database server process.

It accepts client connections, performs authentication and authorization, processes queries and writes, manages indexes and transactions, interacts with WiredTiger, and participates in replica-set replication when configured.

During troubleshooting I check not only whether mongod is running but also its configuration, logs, dbPath, network listener, storage-engine state, and replica-set state.`,

      keyTakeaways: [
        'mongod is the main MongoDB server process.',
        'Its responsibilities extend far beyond accepting connections.',
        'Replica-set members are mongod processes.',
        'Configuration controls the role and behaviour of mongod.',
        'Process failure investigation requires logs and OS correlation.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 3,
    question:
      'How does a request travel from an application through the MongoDB driver to the database server?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `Applications normally do not communicate with MongoDB by manually constructing network packets.

They use a MongoDB driver.

Examples include drivers for:

Node.js
Java
Python
C#
Go

The driver manages communication between the application and MongoDB.`,

      coreConcept: `A simplified request flow is:

Application
    ↓
MongoDB Driver
    ↓
Connection Pool
    ↓
Server Selection
    ↓
Network
    ↓
mongod / mongos
    ↓
Command Processing
    ↓
Query Execution
    ↓
Response
    ↓
Driver
    ↓
Application

The driver is therefore an important part of MongoDB architecture.`,

      detailedExplanation: `When an application starts, it normally creates a MongoDB client using a connection string.

For a replica set, that connection string may contain multiple hosts and the replica-set name.

The driver discovers the topology.

It monitors MongoDB servers and maintains information about which member is primary, which members are secondaries, and which servers are suitable for different operations.

The driver also maintains connection pools.

Instead of creating a brand-new TCP connection for every query, applications normally reuse pooled connections.

When an operation is issued, the driver performs server selection according to factors such as:

• Deployment topology
• Server state
• Read preference
• Latency information
• Operation requirements

The operation is encoded using the MongoDB wire protocol and transmitted to the selected server.

The server processes the command and sends a response.

The driver decodes BSON results into objects appropriate for the programming language.

This means an application error such as:

server selection timeout

does not necessarily mean MongoDB is down.

It may indicate:

• DNS failure
• Network failure
• Incorrect connection string
• Replica-set name mismatch
• No suitable primary
• TLS failure
• Authentication issue
• Topology discovery problem`,

      internalWorking: `Application starts:

MongoClient
    |
    v
Parse connection string
    |
    v
Discover topology
    |
    v
Monitor servers
    |
    v
Maintain connection pools

Application sends operation:

find()
    |
    v
Driver selects server
    |
    v
Checkout pooled connection
    |
    v
Encode command
    |
    v
Send over network
    |
    v
MongoDB processes request
    |
    v
Return BSON response
    |
    v
Driver decodes result
    |
    v
Application`,

      architecture: `Application
    |
    v
MongoDB Driver
    |
    +-- Topology Discovery
    |
    +-- Server Selection
    |
    +-- Connection Pool
    |
    +-- BSON Encoding
    |
    +-- Retry Behaviour
    |
    v
Network
    |
    v
MongoDB Server
    |
    v
Execution
    |
    v
Response`,

      examples: [
        `Replica-set URI concept:

mongodb://host1:27017,host2:27017,host3:27017/appdb?replicaSet=myReplicaSet

The driver can discover the replica-set topology from the supplied seed hosts.`,

        `If the primary changes after an election, a properly configured driver can discover the new topology rather than requiring the application to permanently connect to one fixed primary IP.`,

        `Connection pooling prevents the application from creating a new network connection for every database operation.`
      ],

      commands: [
        {
          command: 'db.adminCommand({ hello: 1 })',
          explanation:
            'Shows topology-related information returned by the connected MongoDB server.'
        },
        {
          command: 'db.serverStatus().connections',
          explanation:
            'Displays server-side connection statistics.'
        },
        {
          command: 'db.currentOp()',
          explanation:
            'Can help inspect operations currently executing on the MongoDB server, subject to permissions.'
        }
      ],

      productionScenario: `An application reports:

MongoServerSelectionError: Server selection timed out.

The DBA checks mongod and finds all three replica-set members running.

The DBA should not stop there.

Possible causes include:

• Application cannot reach the MongoDB network
• Security group or firewall issue
• Wrong ports
• Wrong replicaSet name
• TLS mismatch
• DNS problem
• Driver discovers internal addresses that the client cannot reach
• No writable primary for a write operation
• Connection-string configuration issue

Understanding driver topology discovery is essential for diagnosing these incidents.`,

      troubleshootingApproach: `For application connectivity problems:

1. Capture the exact driver error.

2. Identify driver version.

3. Inspect the connection-string structure without exposing credentials.

4. Verify DNS resolution.

5. Verify network reachability to all required replica-set members.

6. Verify ports.

7. Verify replicaSet name.

8. Run rs.status() from the database side.

9. Run hello against members.

10. Check TLS configuration.

11. Check authentication separately.

12. Review driver server-selection timeout and connection-pool metrics.

13. Determine whether the problem occurs during topology discovery, authentication, connection checkout, or operation execution.

Do not assume every application timeout is a slow query.`,

      commonMistakes: [
        'Hard-coding only the current primary in application configuration.',
        'Ignoring replica-set topology discovery.',
        'Treating server-selection timeout as proof of high database CPU.',
        'Creating a new MongoClient for every application request.',
        'Ignoring driver versions during troubleshooting.'
      ],

      bestPractices: [
        'Use supported MongoDB drivers.',
        'Configure replica-set connection strings correctly.',
        'Reuse MongoClient and connection pools.',
        'Monitor application-side pool behaviour.',
        'Test application behaviour during replica-set elections.'
      ],

      interviewAnswer: `Applications communicate with MongoDB through a driver.

The driver discovers the deployment topology, monitors servers, manages connection pools, performs server selection, encodes commands using the MongoDB wire protocol, and converts BSON responses back into application objects.

Therefore connectivity troubleshooting must include the driver, network, topology discovery, connection pool, and MongoDB server rather than checking mongod alone.`,

      keyTakeaways: [
        'The MongoDB driver is part of the database architecture.',
        'Drivers perform topology discovery and server selection.',
        'Connections are normally pooled.',
        'Replica-set applications should not depend permanently on one primary IP.',
        'Server-selection errors require topology and network investigation.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 4,
    question:
      'What is the WiredTiger storage engine and what role does it play in MongoDB?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `MongoDB needs a component that manages how collection and index data is stored and retrieved.

That component is called the storage engine.

In modern MongoDB deployments, WiredTiger is the standard storage engine.

MongoDB's higher layers understand documents, queries, replication, authentication, and database commands.

WiredTiger focuses on storage-related responsibilities.`,

      coreConcept: `WiredTiger is responsible for major storage functions including:

• Reading and writing persisted data
• Cache management
• Compression
• Checkpoints
• Concurrency control
• Collection storage
• Index storage
• Interaction with filesystem persistence

MongoDB and WiredTiger work together, but they are not the same layer.`,

      detailedExplanation: `When MongoDB executes a query, the query layer determines what data is required.

If the required collection or index pages are already available in the WiredTiger cache, they can be accessed from memory.

If they are not resident, WiredTiger may need to read them from storage.

For writes, MongoDB modifies data through the storage engine.

WiredTiger maintains in-memory state and periodically creates checkpoints representing durable points of the data files.

MongoDB also uses journaling as part of crash-recovery durability.

WiredTiger supports compression.

Collection and index data can therefore consume less physical disk space than their logical uncompressed representation.

WiredTiger also supports concurrent access using fine-grained concurrency mechanisms rather than relying on one global database lock for ordinary operations.

From a DBA perspective, WiredTiger is critical when investigating:

• High disk read activity
• Cache pressure
• Eviction
• Dirty cache
• Checkpoint behaviour
• Compression
• Storage latency
• Recovery after unclean shutdown`,

      internalWorking: `Simplified read:

Query Engine
    |
    v
WiredTiger
    |
    +--> Is required page in cache?
           |
           +-- YES --> Read from cache
           |
           +-- NO --> Read from storage
                        |
                        v
                       Cache
                        |
                        v
                      Query

Simplified write:

MongoDB Write
    |
    v
WiredTiger Cache
    |
    +--> Modified pages
    |
    +--> Journal / durability mechanisms
    |
    +--> Checkpoint
    |
    v
Data Files`,

      architecture: `MongoDB Server Layer
        |
        +-- Queries
        +-- Updates
        +-- Index operations
        |
        v
    WiredTiger
        |
        +-- Cache
        |
        +-- Eviction
        |
        +-- Compression
        |
        +-- Checkpoints
        |
        +-- Concurrency
        |
        v
 Filesystem / Disk`,

      examples: [
        `If frequently accessed index pages fit in cache, many operations can avoid physical disk reads.`,

        `If the working set greatly exceeds available memory, WiredTiger may need to bring pages from storage more frequently, increasing sensitivity to disk latency.`,

        `Compression can reduce disk consumption but does not mean logical database size and physical filesystem usage will be identical.`
      ],

      commands: [
        {
          command: 'db.serverStatus().storageEngine',
          explanation:
            'Displays information about the active MongoDB storage engine.'
        },
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Displays detailed WiredTiger cache metrics.'
        },
        {
          command: 'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Displays WiredTiger transaction-related metrics useful for deeper diagnostics.'
        },
        {
          command: 'db.serverStatus().wiredTiger',
          explanation:
            'Returns the broader WiredTiger serverStatus metrics tree.'
        }
      ],

      productionScenario: `A server has high disk read latency and MongoDB queries suddenly become slow.

The DBA sees that the workload's active data and indexes are larger than available memory.

Cache pressure increases and more data must be read from storage.

The correct investigation includes:

• WiredTiger cache metrics
• Eviction behaviour
• Page read activity
• Query plans
• Index working set
• Operating-system memory
• Disk latency
• Application workload change

Simply saying:

"MongoDB uses RAM, so high memory is bad"

would be incorrect.

MongoDB intentionally uses memory for caching.

The important question is whether memory pressure and storage behaviour are harming the workload.`,

      troubleshootingApproach: `For suspected WiredTiger issues:

1. Capture db.serverStatus().wiredTiger.cache.

2. Check bytes currently in cache.

3. Check dirty cache behaviour.

4. Check pages read into cache.

5. Check pages written from cache.

6. Review eviction metrics.

7. Check operating-system memory pressure.

8. Check disk latency and throughput.

9. Correlate with query workload.

10. Check whether a collection scan or index change increased the working set.

11. Review checkpoint behaviour where relevant.

12. Avoid changing cache configuration without understanding total server memory and workload.

WiredTiger metrics should be interpreted as trends and in workload context rather than from one isolated number.`,

      commonMistakes: [
        'Treating all MongoDB memory usage as a memory leak.',
        'Assuming WiredTiger cache is the same as total mongod memory.',
        'Changing cache size without capacity analysis.',
        'Ignoring disk latency when cache misses increase.',
        'Looking at storage-engine metrics without correlating them with queries.'
      ],

      bestPractices: [
        'Monitor WiredTiger cache trends.',
        'Monitor storage latency alongside cache behaviour.',
        'Keep the important working set appropriately sized for the infrastructure.',
        'Use efficient indexes to reduce unnecessary data access.',
        'Understand storage-engine behaviour before changing cache settings.'
      ],

      interviewAnswer: `WiredTiger is MongoDB's standard storage engine.

It manages persisted collection and index data and provides functionality including cache management, compression, checkpoints, concurrency control, and storage interaction.

For performance troubleshooting I correlate WiredTiger cache and eviction metrics with query plans, operating-system memory, working-set size, and disk latency rather than treating high MongoDB memory usage by itself as a problem.`,

      keyTakeaways: [
        'WiredTiger is MongoDB\'s storage engine.',
        'It manages cache, compression, checkpoints, and persistence.',
        'WiredTiger cache is not identical to total mongod memory.',
        'Cache misses make storage latency increasingly important.',
        'Storage-engine troubleshooting must be correlated with workload behaviour.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 5,
    question:
      'How does MongoDB use memory and what is the relationship between WiredTiger cache and operating-system filesystem cache?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `MongoDB uses memory because reading frequently accessed data from RAM is much faster than repeatedly reading it from disk.

Seeing mongod use a large amount of memory does not automatically mean something is wrong.

MongoDB and the operating system intentionally use available memory to improve database performance.`,

      coreConcept: `Two important caching layers are:

1. WiredTiger internal cache

2. Operating-system filesystem cache

They are related to database performance but are not the same thing.

mongod also uses memory outside the WiredTiger cache for other responsibilities.

Therefore:

mongod memory usage ≠ WiredTiger cache size.`,

      detailedExplanation: `WiredTiger maintains an internal cache containing database pages being actively used.

MongoDB also relies on the operating system and filesystem for memory-related caching and I/O behaviour.

In addition to WiredTiger cache, mongod needs memory for things such as:

• Connections
• Query execution
• Aggregation
• Sort operations
• Internal metadata
• Replication
• Sessions
• Transactions
• Compression/decompression work
• Process overhead

This means a server with:

32 GB RAM

does not simply have:

32 GB WiredTiger cache.

The database process and operating system both need memory.

MongoDB automatically calculates a default WiredTiger cache size according to its supported sizing rules, but DBAs should always verify the actual configuration for the MongoDB version and environment they operate.

Container memory limits and virtualization can also affect available memory calculations.

High memory usage can be healthy.

The more important warning signs are:

• Sustained swapping
• OOM kills
• Severe cache eviction pressure
• Increasing disk reads
• Query latency
• Memory exhaustion
• Operating-system reclaim pressure`,

      internalWorking: `Simplified read path:

Application Query
      |
      v
MongoDB
      |
      v
WiredTiger Cache
      |
      +-- Page present?
      |      |
      |      +-- YES --> use cached page
      |
      +-- NO
             |
             v
      Filesystem / Storage path
             |
             v
        Load required data
             |
             v
      WiredTiger Cache

The operating system also manages memory for filesystem and process needs.

The exact physical I/O behaviour depends on the operating system, filesystem, workload, and MongoDB/WiredTiger implementation.`,

      architecture: `Physical RAM
|
+-- mongod process
|     |
|     +-- WiredTiger cache
|     |
|     +-- Connections
|     |
|     +-- Query execution
|     |
|     +-- Replication
|     |
|     +-- Other process memory
|
+-- Operating System
      |
      +-- Filesystem cache
      |
      +-- Kernel
      |
      +-- Other processes`,

      examples: [
        `A MongoDB server using 70% of RAM can still be completely healthy if there is no harmful memory pressure and performance is stable.`,

        `A server showing constant swap activity and increasing disk latency may have a genuine memory-capacity problem even if mongod itself has not crashed.`,

        `A newly introduced collection scan can dramatically increase data touched by the workload and create cache pressure without any MongoDB configuration change.`
      ],

      commands: [
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows WiredTiger internal cache statistics.'
        },
        {
          command: 'db.serverStatus().mem',
          explanation:
            'Displays MongoDB process memory-related information exposed through serverStatus.'
        },
        {
          command: 'free -h',
          explanation:
            'Displays Linux memory and swap information in human-readable form.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Provides a live Linux view of memory, run queue, swapping, and CPU activity. Interpretation should consider the complete workload.'
        },
        {
          command: 'ps -o pid,rss,vsz,cmd -C mongod',
          explanation:
            'Displays mongod process RSS and virtual memory values on Linux.'
        }
      ],

      productionScenario: `An alert reports:

MongoDB memory utilization = 80%.

A junior administrator immediately proposes restarting MongoDB.

That would be the wrong first response.

The L3 investigation should determine:

Is the server swapping?

Is the operating system under memory pressure?

What is WiredTiger cache occupancy?

Is eviction pressure abnormal?

Did query latency increase?

Did disk reads increase?

Did the application workload change?

Was a new index build started?

Is an aggregation processing large amounts of data?

Did connection count increase dramatically?

Is another process consuming memory?

High memory utilization by itself is not enough to justify restarting mongod.`,

      troubleshootingApproach: `For high-memory incidents:

1. Check total server RAM.

2. Check free -h.

3. Check swap configuration and active swapping.

4. Check mongod RSS.

5. Check db.serverStatus().mem.

6. Check WiredTiger cache metrics.

7. Check eviction behaviour.

8. Check disk read latency.

9. Check active operations.

10. Look for collection scans.

11. Check large aggregations or sorts.

12. Check connection count.

13. Check transaction activity.

14. Check other operating-system processes.

15. Correlate memory behaviour with application latency.

Only after identifying the actual pressure should configuration or capacity changes be considered.`,

      commonMistakes: [
        'Restarting MongoDB simply because RAM usage is high.',
        'Treating Linux free memory as the only useful memory metric.',
        'Assuming WiredTiger cache equals total mongod RSS.',
        'Ignoring swap activity.',
        'Increasing WiredTiger cache without leaving memory for the operating system and other MongoDB requirements.'
      ],

      bestPractices: [
        'Monitor memory trends rather than one isolated percentage.',
        'Monitor swap and OOM events.',
        'Correlate cache behaviour with disk latency and query workload.',
        'Leave sufficient memory for the operating system.',
        'Capacity-plan using realistic working-set behaviour.'
      ],

      interviewAnswer: `MongoDB uses memory through several layers.

WiredTiger maintains its own internal cache for database pages, while the operating system also manages filesystem caching and other memory.

mongod additionally requires memory for connections, query execution, replication, transactions, and process overhead.

Therefore high MongoDB memory usage is not automatically a problem. I investigate cache pressure, swapping, disk reads, workload changes, and query latency before considering configuration or capacity changes.`,

      keyTakeaways: [
        'MongoDB is expected to use memory aggressively for performance.',
        'WiredTiger cache and total mongod memory are different.',
        'The operating system also needs memory.',
        'High RAM usage alone does not prove a problem.',
        'Swapping, eviction pressure, disk activity, and latency provide more useful troubleshooting context.'
      ]
    }
  },
  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 6,
    question:
      'What is dbPath, what files does MongoDB store there, and why is the storage layout important?',
    level: 'L1-L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `MongoDB needs a directory on disk where it stores its persistent database files.

This directory is configured using:

storage.dbPath

It is commonly referred to simply as:

dbPath

The exact contents depend on MongoDB version, storage engine, and configuration, but for WiredTiger deployments the directory contains WiredTiger metadata and data files used to persist collections, indexes, and internal database state.`,

      coreConcept: `dbPath is the filesystem location used by mongod for persistent database storage.

Typical WiredTiger-related files can include items such as:

• WiredTiger
• WiredTiger.wt
• WiredTiger.turtle
• WiredTiger.lock
• WiredTigerLog.*
• collection-*.wt
• index-*.wt
• sizeStorer.wt
• diagnostic.data

The exact file set should not be treated as a stable application interface.

DBAs should manage MongoDB through supported database and backup tools rather than manually modifying storage files.`,

      detailedExplanation: `The dbPath is critical because mongod expects its storage-engine files to be available, writable, and internally consistent.

For WiredTiger, individual collections and indexes are represented by storage-engine tables.

On disk, these commonly appear as .wt files.

The relationship is not intended to be managed manually by filename.

MongoDB maintains catalog metadata that maps logical namespaces and indexes to storage-engine identifiers.

Other files support WiredTiger metadata, logging, crash recovery, and diagnostics.

A DBA must understand several important operational points.

First, dbPath must exist and have correct ownership and permissions.

Second, the underlying filesystem must have sufficient free space.

Third, the filesystem and storage device must provide appropriate reliability and latency.

Fourth, copying random .wt files while mongod is running is not a valid logical backup strategy.

Fifth, deleting individual files from dbPath can permanently corrupt the deployment.

The correct storage-management method depends on the task:

Logical backup:
mongodump

Filesystem-level backup:
supported snapshots or backup procedures

Replica-set maintenance:
replication-aware procedures

Storage migration:
planned filesystem/data movement with mongod stopped or using supported methods`,

      internalWorking: `Logical view:

Database
   |
   +-- Collection A
   |
   +-- Collection B
   |
   +-- Indexes

       |
       v

MongoDB Catalog
       |
       v

WiredTiger Tables
       |
       v

dbPath files
       |
       +-- collection-*.wt
       +-- index-*.wt
       +-- WiredTiger metadata
       +-- journal/log files

The filenames are storage-engine implementation details.

Applications should use logical database namespaces rather than physical filenames.`,

      architecture: `mongod
  |
  v
MongoDB Catalog
  |
  v
WiredTiger
  |
  v
storage.dbPath
  |
  +-- collection storage
  +-- index storage
  +-- metadata
  +-- journal/log data
  +-- diagnostics`,

      examples: [
        `Typical configuration:

storage:
  dbPath: /var/lib/mongo`,

        `Changing dbPath in configuration without moving the corresponding data can cause mongod to start against an empty location or fail depending on the environment.`,

        `Removing a collection-*.wt file manually is not equivalent to dropping a collection through MongoDB.`
      ],

      commands: [
        {
          command: 'db.adminCommand({ getCmdLineOpts: 1 })',
          explanation:
            'Shows parsed startup configuration, including storage settings such as dbPath where exposed.'
        },
        {
          command: 'ls -lh /var/lib/mongo',
          explanation:
            'Shows files in a common MongoDB dbPath. Replace the path with the actual configured dbPath.'
        },
        {
          command: 'df -h /var/lib/mongo',
          explanation:
            'Shows filesystem capacity for the filesystem containing dbPath.'
        },
        {
          command: 'du -sh /var/lib/mongo',
          explanation:
            'Shows approximate filesystem space consumed under dbPath, subject to permissions and filesystem behaviour.'
        }
      ],

      productionScenario: `A MongoDB server fails to start after an operating-system maintenance activity.

The mongod log reports that files under dbPath cannot be opened.

The DBA investigates and discovers that the storage mount was not mounted after reboot.

The directory:

/var/lib/mongo

still exists, but it is now only the empty mount-point directory on the root filesystem.

Starting mongod in this condition could create new files in the wrong location.

Therefore before starting MongoDB after storage incidents, verify:

• The expected filesystem is mounted
• The expected data files exist
• Ownership is correct
• Free space is available
• The configured dbPath matches the mounted location`,

      troubleshootingApproach: `For dbPath problems:

1. Determine the configured dbPath.

2. Verify the filesystem is mounted.

3. Check expected storage files exist.

4. Check owner and group.

5. Check permissions.

6. Check free space and inode availability.

7. Check filesystem read-only state.

8. Review MongoDB logs.

9. Check operating-system storage errors.

10. Do not manually delete WiredTiger files.

11. If storage corruption is suspected, preserve evidence and follow supported recovery procedures.

12. Verify replica-set recovery options before attempting risky local repair.

A healthy replica-set secondary or backup may be safer than low-level file manipulation.`,

      commonMistakes: [
        'Deleting .wt files manually to free disk space.',
        'Assuming every file in dbPath maps directly to a human-readable collection name.',
        'Starting mongod before verifying a failed storage mount.',
        'Taking an inconsistent backup by randomly copying live WiredTiger files.',
        'Changing dbPath without planning data movement and permissions.'
      ],

      bestPractices: [
        'Know the configured dbPath for every MongoDB node.',
        'Monitor filesystem capacity and latency.',
        'Use supported backup methods.',
        'Verify storage mounts before mongod startup after OS maintenance.',
        'Never modify WiredTiger data files manually unless following an explicit supported recovery procedure.'
      ],

      interviewAnswer: `dbPath is the filesystem directory where mongod stores persistent storage-engine files.

With WiredTiger this includes collection and index tables, metadata, journal-related files, and other internal files.

The physical filenames are implementation details and should not be manipulated manually.

During incidents I verify the configured dbPath, filesystem mount, permissions, capacity, storage errors, and MongoDB logs before starting or modifying the database.`,

      keyTakeaways: [
        'dbPath contains MongoDB persistent storage files.',
        'Logical collections do not map cleanly to manually manageable filenames.',
        'Filesystem availability is critical to mongod startup.',
        'Manual deletion of WiredTiger files is dangerous.',
        'Backups should use supported MongoDB or snapshot procedures.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 7,
    question:
      'What happens internally when MongoDB performs a read operation?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `When an application asks MongoDB to read data, MongoDB does much more than simply open a file and return a document.

It must understand the query, determine the best available access path, retrieve index and document data, apply filters, and return the requested result.`,

      coreConcept: `A simplified MongoDB read path is:

Application
    ↓
Driver
    ↓
mongod
    ↓
Query parsing
    ↓
Query planner
    ↓
Execution plan
    ↓
Index and/or collection access
    ↓
WiredTiger cache
    ↓
Storage if needed
    ↓
Result
    ↓
Application`,

      detailedExplanation: `Consider:

db.orders.find({
  customerId: 1001,
  status: "ACTIVE"
})

MongoDB first receives the query command.

The query layer interprets the filter and other options such as:

Projection
Sort
Limit
Collation
Hint

The query planner evaluates possible ways to satisfy the query.

Potential access paths may include:

Collection scan

Single index scan

Compound index scan

Index intersection in supported situations

If an index is selected, MongoDB examines index keys and may fetch corresponding documents.

If the query can be satisfied completely using index information, document fetch work can sometimes be reduced.

The execution engine requests required pages from WiredTiger.

If those pages are already resident in the WiredTiger cache, they can be accessed from memory.

If they are not resident, storage I/O may be required.

After candidate records are found, MongoDB applies any remaining filters, projection, sorting, limit, or pipeline work.

The final BSON response is sent back through the driver.

This explains why query performance depends on several layers:

• Query shape
• Index design
• Data distribution
• Cache residency
• Disk latency
• Result size
• Network latency`,

      internalWorking: `Example read:

find({ customerId: 1001 })

        |
        v
Query Parser
        |
        v
Query Planner
        |
        +--> IXSCAN candidate
        |
        +--> COLLSCAN candidate
        |
        v
Winning Plan
        |
        v
Execution Engine
        |
        v
WiredTiger
        |
        +--> Cache hit
        |
        +--> Cache miss --> Disk read
        |
        v
Documents
        |
        v
Projection / Sort / Limit
        |
        v
Client`,

      architecture: `READ PATH

Client
 |
 v
Driver
 |
 v
mongod
 |
 v
Query Layer
 |
 v
Planner
 |
 v
Execution Engine
 |
 +----------+
 |          |
 v          v
Index    Collection
 |          |
 +-----+----+
       |
       v
WiredTiger Cache
       |
       +--> memory
       |
       +--> storage
       |
       v
Result`,

      examples: [
        `Indexed lookup:

db.users.find({
  email: "vivek@example.com"
})

with an appropriate email index can examine a small number of index keys and documents.`,

        `Unindexed lookup:

db.users.find({
  rarelyIndexedField: "value"
})

may require a collection scan.`,

        `Returning 100,000 matching documents can still be expensive even when the lookup uses an index because result processing and network transfer remain significant.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows the execution plan and runtime statistics for the read.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Displays indexes available to support read queries.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides cache metrics that can help correlate query behaviour with memory and storage access.'
        }
      ],

      productionScenario: `A query normally completes in 50 ms.

After a large reporting workload begins, the same query takes 2 seconds.

The query plan has not changed.

The DBA investigates and discovers the reporting job scans a very large collection.

That workload pushes frequently accessed pages out of cache.

The transactional query now causes more storage reads.

Disk latency increases and query response time rises.

This demonstrates an important principle:

A stable explain plan does not guarantee stable performance.

The execution environment can change even when the logical query plan does not.`,

      troubleshootingApproach: `For a slow read:

1. Capture the exact query.

2. Run explain("executionStats").

3. Check winningPlan.

4. Check totalDocsExamined.

5. Check totalKeysExamined.

6. Check nReturned.

7. Check sort stages.

8. Check result size.

9. Check WiredTiger cache activity.

10. Check disk read latency.

11. Check concurrent workload.

12. Check CPU.

13. Check network latency.

14. Compare against a previously healthy baseline.

A read incident should be analysed across both the query layer and storage layer.`,

      commonMistakes: [
        'Assuming an index automatically guarantees fast reads.',
        'Looking only at executionTimeMillis.',
        'Ignoring result-set size.',
        'Ignoring cache eviction caused by unrelated workloads.',
        'Assuming stable query plans guarantee stable latency.'
      ],

      bestPractices: [
        'Use explain for important query patterns.',
        'Keep high-value working sets cache-friendly where practical.',
        'Monitor disk latency and query latency together.',
        'Avoid unnecessary collection scans.',
        'Limit returned fields and documents where appropriate.'
      ],

      interviewAnswer: `A MongoDB read passes through query parsing, planning, and execution.

The planner selects an access path such as an index scan or collection scan.

The execution engine retrieves required index and document pages through WiredTiger, using cache when possible and storage when necessary.

Performance therefore depends on query shape, indexes, cache residency, disk latency, result size, and concurrent workload.`,

      keyTakeaways: [
        'Reads pass through parsing, planning, and execution.',
        'Indexes determine access paths but are not the only performance factor.',
        'WiredTiger cache can avoid physical reads.',
        'Cache misses increase dependence on disk latency.',
        'Slow-read analysis should combine explain and infrastructure metrics.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 8,
    question:
      'What happens internally when MongoDB performs a write operation?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `A MongoDB write is not simply a direct overwrite of a file on disk.

MongoDB must identify the target document, apply the requested change, update affected indexes, interact with WiredTiger, handle durability, and in replica sets replicate the operation to other members.`,

      coreConcept: `A simplified write path is:

Application
    ↓
Driver
    ↓
Primary mongod
    ↓
Authorization
    ↓
Locate target document
    ↓
Apply modification
    ↓
Update indexes
    ↓
WiredTiger
    ↓
Journal / durability mechanisms
    ↓
Oplog
    ↓
Replication
    ↓
Write concern acknowledgement`,

      detailedExplanation: `Consider:

db.accounts.updateOne(
  { accountId: 1001 },
  {
    $inc: {
      balance: 500
    }
  }
)

MongoDB must first locate the matching document.

If the filter has an appropriate index, that index can help locate the target efficiently.

The document modification is then applied through the storage engine.

Any indexes affected by the changed values must also be updated.

For a replica-set primary, the write is represented in the replication oplog.

Secondaries replicate oplog entries and apply corresponding changes locally.

The client acknowledgement depends on the requested write concern.

For example, w:1 and w:"majority" request different acknowledgement conditions.

Durability and visibility also involve journaling, checkpoints, and replica-set commit semantics.

The complete write latency can therefore be influenced by:

• Query/filter efficiency
• Number of indexes
• Storage latency
• Journal latency
• Replication health
• Write concern
• Network latency
• Concurrency
• Document size`,

      internalWorking: `Write request

updateOne(...)
      |
      v
Find matching document
      |
      v
Apply document change
      |
      +--> Update affected indexes
      |
      v
WiredTiger cache
      |
      +--> dirty data
      |
      +--> journal durability
      |
      v
Replica-set oplog
      |
      +--> Secondary
      |
      +--> Secondary
      |
      v
Required write concern reached
      |
      v
Client acknowledgement`,

      architecture: `CLIENT
  |
  v
PRIMARY
  |
  +-- Query target
  |
  +-- Update document
  |
  +-- Update indexes
  |
  v
WiredTiger
  |
  +-- Cache
  +-- Journal
  +-- Checkpoint
  |
  v
Oplog
  |
  +------> SECONDARY
  |
  +------> SECONDARY
  |
  v
Write Concern
  |
  v
Success to Client`,

      examples: [
        `Updating a non-indexed field may modify the document without changing secondary indexes.`,

        `Updating a field included in five indexes can require maintenance of those index entries in addition to the document change.`,

        `A majority write may experience increased latency when replication health or storage latency deteriorates.`
      ],

      commands: [
        {
          command:
            'db.orders.updateOne({ orderId: 1001 }, { $set: { status: "SHIPPED" } })',
          explanation:
            'Performs a targeted document update.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows indexes whose maintenance may contribute to write cost.'
        },
        {
          command: 'rs.status()',
          explanation:
            'Provides replica-set health information relevant to replicated writes.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Provides operation latency metrics useful for identifying read/write latency trends.'
        }
      ],

      productionScenario: `An application experiences slower writes immediately after several new indexes are added.

CPU is moderate and replication is healthy.

The DBA reviews the schema and finds every inserted document must now update eight additional indexes.

Read performance improved for one report, but write cost increased across the application.

This is expected database behaviour.

Indexes are not free.

Every relevant write can require additional index maintenance.

The DBA should determine:

• Which indexes are actually used
• Whether any indexes are redundant
• Whether one compound index can replace multiple low-value indexes
• Whether the reporting workload should be handled differently`,

      troubleshootingApproach: `For slow writes:

1. Capture the exact write operation.

2. Determine whether the filter is indexed.

3. Check number and size of indexes.

4. Determine whether indexed fields are being updated.

5. Check write concern.

6. Check replica-set health.

7. Check replication lag.

8. Check disk and journal latency.

9. Check WiredTiger cache and dirty data.

10. Check concurrent write workload.

11. Check document size and array growth.

12. Compare latency before and after recent index or application changes.

Do not diagnose all write latency as replication lag.

Local storage and index maintenance may be the actual cause.`,

      commonMistakes: [
        'Assuming indexes affect only reads.',
        'Adding many indexes without measuring write overhead.',
        'Ignoring the filter used to locate update targets.',
        'Blaming replication for every slow write.',
        'Weakening write concern before identifying the actual bottleneck.'
      ],

      bestPractices: [
        'Maintain only useful indexes.',
        'Index important update filters where appropriate.',
        'Monitor write latency and replication together.',
        'Understand durability requirements before changing write concern.',
        'Measure index cost before and after schema changes.'
      ],

      interviewAnswer: `A MongoDB write must locate the target document, modify it, maintain affected indexes, persist changes through WiredTiger durability mechanisms, and on a replica-set primary record the operation for replication through the oplog.

The client acknowledgement depends on write concern.

Write performance can therefore be affected by index count, storage latency, journaling, replication, document size, concurrency, and the efficiency of the write filter.`,

      keyTakeaways: [
        'Writes affect documents and potentially indexes.',
        'Replica-set writes also involve the oplog and secondaries.',
        'Write concern influences acknowledgement latency.',
        'More indexes increase write maintenance cost.',
        'Slow writes require storage, index, and replication analysis.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 9,
    question:
      'What is the MongoDB journal and how does journaling help with durability and crash recovery?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Imagine MongoDB has accepted a write but the server suddenly loses power before all changed database pages are written into their normal data-file locations.

MongoDB needs a mechanism that helps recover durable changes after an unexpected shutdown.

Journaling is part of that mechanism.`,

      coreConcept: `MongoDB with WiredTiger uses a write-ahead logging mechanism commonly referred to as the journal.

The journal records information needed for crash recovery before modified data is fully incorporated into persistent data files through checkpoints.

After an unclean shutdown, MongoDB can use the journal together with the most recent checkpoint to recover the database to a consistent durable state.`,

      detailedExplanation: `WiredTiger does not synchronously rewrite every modified database page to its final data file for every individual write.

That would be inefficient.

Instead, data is modified in memory and persistence is coordinated through mechanisms including:

• Journal records
• Checkpoints
• Filesystem writes

A checkpoint creates a consistent durable representation of database data at a point in time.

Between checkpoints, additional durable changes may exist in the journal.

After an unexpected shutdown, WiredTiger can start from a valid checkpoint and replay required journal information to recover later durable changes.

This is different from replication.

Journal:

Local storage durability and crash recovery.

Oplog:

Replica-set replication history.

These two are related to writes but serve different purposes.

A DBA must not confuse:

journal
oplog
checkpoint
backup

They are four different concepts.`,

      internalWorking: `Normal operation:

Write
  |
  v
WiredTiger Cache
  |
  +--> Journal record
  |
  +--> Dirty page
  |
  v
Periodic checkpoint
  |
  v
Data files


Unexpected crash:

Last checkpoint
      |
      v
Journal replay
      |
      v
Recover later durable changes
      |
      v
Consistent database state`,

      architecture: `WRITE

Application
   |
   v
mongod
   |
   v
WiredTiger Cache
   |
   +--------> Journal
   |
   +--------> Checkpoint
                  |
                  v
              Data Files


CRASH RECOVERY

Checkpoint
    +
Journal
    |
    v
Recovery
    |
    v
Consistent Storage`,

      examples: [
        `Journal is not the same as the replica-set oplog.`,

        `A server can require journal recovery after power loss even if it is a standalone deployment with no replication.`,

        `A clean shutdown allows MongoDB to close storage cleanly, while an unclean shutdown may require recovery during startup.`
      ],

      commands: [
        {
          command: 'db.serverStatus().wiredTiger.log',
          explanation:
            'Shows WiredTiger logging metrics related to journal/log activity.'
        },
        {
          command:
            'grep -iE "recover|recovery|WiredTiger" /var/log/mongodb/mongod.log',
          explanation:
            'Searches a typical MongoDB log path for recovery-related startup messages. Actual log path may differ.'
        },
        {
          command: 'db.adminCommand({ getCmdLineOpts: 1 })',
          explanation:
            'Shows startup configuration relevant to storage and journaling behaviour.'
        }
      ],

      productionScenario: `An Azure or AWS VM unexpectedly reboots.

MongoDB did not receive a graceful SIGTERM shutdown.

When mongod starts again, startup takes longer than usual.

The log contains WiredTiger recovery messages.

This does not automatically mean the database is corrupted.

WiredTiger may be performing normal crash recovery using its checkpoint and journal information.

The DBA should:

• Preserve startup logs
• Confirm recovery completes successfully
• Check replica-set state
• Verify application connectivity
• Check storage health
• Determine why the VM rebooted

The RCA should distinguish:

MongoDB crash

from:

Operating-system or VM crash followed by normal MongoDB recovery.`,

      troubleshootingApproach: `For journal/recovery incidents:

1. Determine whether the previous shutdown was clean.

2. Search MongoDB logs for SIGTERM and shutdown-complete messages.

3. Check OS reboot history.

4. Review WiredTiger recovery messages.

5. Measure recovery duration.

6. Check disk latency.

7. Verify filesystem health and available space.

8. After startup, verify replica-set state.

9. Check replication lag.

10. Confirm application writes and reads.

11. Investigate the original host failure separately.

Do not delete journal files because startup recovery appears slow.`,

      commonMistakes: [
        'Confusing the journal with the oplog.',
        'Deleting journal files to speed startup.',
        'Calling every recovery startup a corruption event.',
        'Ignoring the original OS or VM failure.',
        'Assuming journal alone is a backup strategy.'
      ],

      bestPractices: [
        'Use graceful MongoDB shutdown whenever possible.',
        'Preserve logs during crash-recovery incidents.',
        'Monitor storage latency.',
        'Understand the difference between journal, checkpoint, oplog, and backup.',
        'Investigate the system-level cause of unexpected shutdowns.'
      ],

      interviewAnswer: `The MongoDB journal is part of WiredTiger's write-ahead logging and crash-recovery mechanism.

Writes can be recorded durably in journal information before all modified pages are incorporated into the data files through checkpoints.

After an unclean shutdown, WiredTiger can recover from the latest valid checkpoint and replay required journal records.

The journal provides local durability and crash recovery, whereas the oplog is used for replica-set replication.`,

      keyTakeaways: [
        'Journal supports local durability and crash recovery.',
        'Checkpoint and journal work together during recovery.',
        'Journal and oplog serve different purposes.',
        'Unclean shutdown can trigger normal WiredTiger recovery.',
        'Journal files should not be manually removed during troubleshooting.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 10,
    question:
      'What is a WiredTiger checkpoint and how does it differ from journaling?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `MongoDB changes data continuously.

It would be inefficient to rewrite every database page into its final persistent form after every small change.

WiredTiger therefore periodically creates checkpoints.

A checkpoint represents a consistent durable view of the database files at a particular point.`,

      coreConcept: `Checkpoint and journal have complementary purposes.

Checkpoint:

Creates a consistent durable point in the WiredTiger data files.

Journal:

Records more recent durable changes that may not yet be represented in the latest checkpoint.

During crash recovery:

Latest checkpoint
+
Required journal records
=
Recovered durable state`,

      detailedExplanation: `A WiredTiger checkpoint makes persistent versions of modified data pages available as a consistent storage state.

MongoDB/WiredTiger performs checkpoints periodically according to its internal behaviour.

Dirty pages accumulate in the WiredTiger cache as writes occur.

Checkpoint processing writes required modified information to storage.

Journal records provide durability between checkpoint points.

This is why neither concept should be viewed in isolation.

Consider:

Checkpoint at 10:00:00

Additional writes occur at:

10:00:10
10:00:20
10:00:30

Server crashes at 10:00:35.

The latest checkpoint alone would not necessarily contain all later durable modifications.

During restart, WiredTiger uses the checkpoint and required log records to recover.

Checkpoint activity can also affect storage workload.

On heavily written systems, a DBA may observe periodic increases in write I/O.

However, high disk activity should not automatically be blamed on checkpoints.

Other sources include:

• Application writes
• Index builds
• Initial sync
• Backup
• Compaction
• Large migrations
• Page eviction`,

      internalWorking: `Continuous writes

      |
      v

WiredTiger Cache
      |
      +-- clean pages
      |
      +-- dirty pages
      |
      v

Checkpoint process
      |
      v

Persist consistent state
      |
      v

Data Files


Between checkpoints:

New writes
   |
   v
Journal records
   |
   v
Crash-recovery coverage`,

      architecture: `TIME -------------------------------------->

Checkpoint A
    |
    +-- writes
    +-- writes
    +-- writes
    |
Checkpoint B
    |
    +-- writes
    +-- writes
    |
    X Crash


Recovery:

Checkpoint B
     +
Journal after Checkpoint B
     |
     v
Recovered State`,

      examples: [
        `Checkpoint is not a full external backup.

It is an internal storage-engine consistency mechanism.`,

        `Journal records can protect durable changes that occurred after the most recent checkpoint.`,

        `Heavy write workloads can create substantial dirty data that the storage engine must eventually persist.`
      ],

      commands: [
        {
          command: 'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Includes WiredTiger transaction/checkpoint-related metrics depending on MongoDB version.'
        },
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides dirty-cache and eviction-related metrics that can help contextualize checkpoint activity.'
        },
        {
          command:
            'grep -i checkpoint /var/log/mongodb/mongod.log',
          explanation:
            'Searches the MongoDB log for checkpoint-related messages where present. Actual logging frequency and path depend on configuration and version.'
        }
      ],

      productionScenario: `A server shows a repeating pattern:

Every few minutes disk write latency rises.

Application write latency increases during the same periods.

A DBA suspects checkpoints.

An L3 investigation should not stop at that assumption.

Check:

• Dirty cache percentage
• Checkpoint duration
• Disk latency
• Storage throughput limits
• Application write rate
• Eviction activity
• Background index operations
• Backup jobs
• Replica-set sync activity

The real issue may be that the storage device cannot sustain the workload.

Checkpoint timing may merely expose the underlying storage-capacity limitation.`,

      troubleshootingApproach: `For checkpoint-related performance concerns:

1. Establish the timing pattern.

2. Check WiredTiger checkpoint metrics.

3. Check dirty cache.

4. Check eviction activity.

5. Check disk write latency.

6. Check storage throughput and IOPS limits.

7. Check application write rate.

8. Check concurrent maintenance activity.

9. Compare with a healthy baseline.

10. Determine whether the bottleneck is actually checkpoint processing or the underlying disk.

11. Avoid attempting unsupported checkpoint tuning.

12. Capacity-plan the storage system based on sustained write workload.`,

      commonMistakes: [
        'Treating checkpoints as external backups.',
        'Confusing checkpoint with journal.',
        'Blaming every periodic I/O spike on checkpoints.',
        'Ignoring underlying storage limits.',
        'Deleting files because checkpoint activity appears high.'
      ],

      bestPractices: [
        'Monitor checkpoint duration and storage latency together.',
        'Monitor dirty cache on write-heavy systems.',
        'Provision storage for sustained database writes.',
        'Correlate checkpoint behaviour with application latency.',
        'Use supported MongoDB configuration rather than attempting low-level storage manipulation.'
      ],

      interviewAnswer: `A WiredTiger checkpoint creates a consistent durable state in the database data files.

The journal complements checkpoints by preserving information about durable changes that may have occurred after the latest checkpoint.

After an unclean shutdown, WiredTiger can recover from the checkpoint and replay required journal records.

For performance analysis, I correlate checkpoint duration, dirty cache, eviction, and disk latency rather than assuming checkpoint activity itself is the root cause.`,

      keyTakeaways: [
        'Checkpoints create consistent durable storage points.',
        'Journal covers durable changes between checkpoints.',
        'Checkpoint is not the same as backup.',
        'Checkpoint behaviour can increase storage activity.',
        'Storage capacity must be analysed before blaming checkpoints.'
      ]
    }
  },
  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 11,
    question:
      'How does MongoDB handle concurrency and locking internally?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A production database usually serves many users and application requests at the same time.

MongoDB therefore needs mechanisms that allow many reads and writes to proceed concurrently while still protecting database consistency.

Modern MongoDB does not depend on one giant global lock for every normal operation.

Concurrency is handled across several layers, including MongoDB locking mechanisms and WiredTiger storage-engine concurrency.`,

      coreConcept: `MongoDB uses fine-grained concurrency controls.

Important concepts include:

• Intent locks
• Database-level locks
• Collection-level locks
• Document-level concurrency through WiredTiger
• Internal latches and mutexes
• Transaction conflicts
• Yielding during long-running operations

The exact locking behaviour depends on the operation and MongoDB version.`,

      detailedExplanation: `At the MongoDB server layer, operations acquire locks representing the resources they intend to access.

Intent locks communicate that an operation intends to acquire more specific locks lower in the hierarchy.

Conceptually, the hierarchy can be viewed as:

Global
  ↓
Database
  ↓
Collection
  ↓
Document/storage-engine concurrency

WiredTiger provides document-level write concurrency for normal CRUD workloads.

This means two updates modifying different documents in the same collection can generally proceed concurrently.

However, concurrency does not mean operations can never block each other.

Blocking or waiting can occur because of:

• Conflicting operations
• DDL operations
• Index operations
• Transactions
• Metadata changes
• Resource contention
• Storage-engine write conflicts
• Flow control
• Ticket/concurrency limits depending on version and workload

MongoDB may also yield during long-running operations so other work can proceed.

Therefore, a DBA investigating latency should not simply ask:

"Is MongoDB locked?"

The better questions are:

Which operation is waiting?

What resource is it waiting for?

How long has it waited?

Which other operation owns or conflicts with that resource?

Is the real bottleneck locking, storage, CPU, cache, or application concurrency?`,

      internalWorking: `Simplified hierarchy:

Operation
   |
   v
Intent Lock
   |
   v
Database / Collection Resource
   |
   v
WiredTiger concurrency
   |
   v
Document access


Two independent writes:

Update Document A
        |
        +-------- can often proceed concurrently

Update Document B
        |
        +-------- can often proceed concurrently


Conflicting work:

Operation 1
   |
   +--> resource

Operation 2
   |
   +--> waits / retries / conflicts
        depending on operation type`,

      architecture: `MongoDB Concurrency

Global
  |
  v
Database
  |
  v
Collection
  |
  v
WiredTiger
  |
  +-- Document A write
  |
  +-- Document B write
  |
  +-- Document C read

Multiple operations can execute concurrently
when resource conflicts do not require waiting.`,

      examples: [
        `Two application requests updating different user documents can usually execute concurrently.`,

        `A metadata or schema-level operation may require stronger locking than a normal document update.`,

        `A transaction updating the same document as another transaction may encounter a write conflict and require retry handling.`
      ],

      commands: [
        {
          command: 'db.currentOp({ active: true })',
          explanation:
            'Displays active operations and can expose waiting, lock, transaction, and runtime information subject to privileges.'
        },
        {
          command: 'db.serverStatus().locks',
          explanation:
            'Displays server lock metrics that can help identify lock acquisition and wait patterns.'
        },
        {
          command: 'db.serverStatus().globalLock',
          explanation:
            'Provides global lock/concurrency-related server statistics.'
        },
        {
          command:
            'db.currentOp({ secs_running: { $gte: 5 } })',
          explanation:
            'Helps identify operations that have been running for several seconds and may warrant deeper analysis.'
        }
      ],

      productionScenario: `An application reports that updates to an orders collection are suddenly taking several seconds.

The DBA sees many concurrent operations.

A junior engineer assumes MongoDB has a collection lock problem.

An L3 investigation should instead determine:

• Are operations actually waiting for locks?
• Are many requests updating the same documents?
• Are long transactions involved?
• Is disk latency high?
• Is the WiredTiger cache under pressure?
• Is CPU saturated?
• Are index builds or DDL operations running?
• Are application retries creating extra contention?

The presence of many concurrent operations does not prove lock contention.`,

      troubleshootingApproach: `For suspected concurrency issues:

1. Inspect current operations.

2. Identify long-running operations.

3. Check waitingForLock or equivalent operation information where available.

4. Check server lock metrics.

5. Identify transactions.

6. Determine whether multiple writers target the same documents.

7. Review write-conflict behaviour.

8. Check disk latency.

9. Check CPU saturation.

10. Check WiredTiger cache and eviction.

11. Check recent index or DDL operations.

12. Review application concurrency and retry patterns.

13. Compare against normal baseline behaviour.

Locking should be proven with evidence rather than assumed.`,

      commonMistakes: [
        'Assuming MongoDB uses one global lock for all operations.',
        'Blaming locks without checking actual wait information.',
        'Ignoring same-document write contention.',
        'Ignoring transactions when investigating concurrency.',
        'Ignoring CPU or storage bottlenecks that look like lock waits.'
      ],

      bestPractices: [
        'Use currentOp and server metrics to prove contention.',
        'Keep transactions short.',
        'Avoid unnecessary hot-document designs.',
        'Distribute workload where application design permits.',
        'Correlate lock metrics with CPU, storage, and query behaviour.'
      ],

      interviewAnswer: `MongoDB uses fine-grained concurrency control rather than one global lock for ordinary operations.

At the server layer it uses hierarchical and intent locking, while WiredTiger provides document-level write concurrency.

Operations can still wait because of conflicting access, transactions, DDL, metadata changes, or resource pressure.

For troubleshooting I inspect current operations, lock metrics, transactions, write conflicts, and infrastructure metrics before concluding that locking is the root cause.`,

      keyTakeaways: [
        'MongoDB supports concurrent reads and writes.',
        'WiredTiger provides document-level write concurrency.',
        'Some operations can still block or conflict.',
        'Lock contention must be demonstrated with metrics.',
        'Hot documents and long transactions can increase contention.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 12,
    question:
      'What is MVCC in WiredTiger and how do snapshots allow readers and writers to work concurrently?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `A database must often allow one operation to read data while another operation is modifying it.

If every reader had to wait for every writer, concurrency would be poor.

WiredTiger uses a multi-version concurrency approach that allows operations to work with appropriate versions of data.`,

      coreConcept: `MVCC means Multi-Version Concurrency Control.

The basic idea is that multiple versions of data can exist logically so readers can observe a consistent view while writers continue making changes.

A read operation works from a snapshot of visible data according to its transactional and read-concern context.`,

      detailedExplanation: `Suppose a document contains:

balance = 5000

Reader A begins an operation.

Writer B changes:

balance = 4500

Depending on the read and transaction context, Reader A may continue seeing the version that belongs to its snapshot while later operations can see the newer committed value.

This reduces the need for readers and writers to block one another unnecessarily.

MongoDB builds its higher-level transaction and read semantics on top of storage-engine mechanisms including snapshots and timestamped visibility.

Snapshots are particularly important for:

• Transactions
• Consistent reads
• Read concern semantics
• Long-running operations

However, retaining access to older versions has a cost.

A long-running transaction or snapshot can prevent older versions from being discarded as quickly.

This can contribute to:

• Cache pressure
• History-store growth
• Additional storage-engine work
• Transaction aborts in extreme resource-pressure situations

Therefore MVCC improves concurrency, but very old snapshots are not free.`,

      internalWorking: `Conceptual timeline:

T1:
Document value = 5000

Reader A starts
    |
    +--> Snapshot sees 5000

T2:
Writer B updates value to 4500
    |
    +--> New committed version

Reader A
    |
    +--> continues with its valid snapshot

New Reader C
    |
    +--> may see 4500


Conceptually:

Older Version
      |
      +--> visible to older snapshot

Newer Version
      |
      +--> visible to newer operation`,

      architecture: `WiredTiger Version Visibility

Document
  |
  +-- Version A
  |      |
  |      +--> Older snapshot
  |
  +-- Version B
         |
         +--> Newer snapshot


Reader A ------> Version A

Writer B ------> creates newer version

Reader C ------> Version B`,

      examples: [
        `A transaction can perform multiple reads against a consistent snapshot rather than seeing unrelated intermediate states from concurrent writes.`,

        `A long-running transaction can retain an old snapshot for much longer than ordinary short operations.`,

        `Reader/writer concurrency does not mean every read always sees the latest wall-clock write. Visibility depends on commit and read semantics.`
      ],

      commands: [
        {
          command: 'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Displays WiredTiger transaction and timestamp-related metrics useful for advanced visibility diagnostics.'
        },
        {
          command: 'db.currentOp({ active: true })',
          explanation:
            'Can help identify long-running operations and transactions.'
        },
        {
          command:
            'db.currentOp({ "transaction.timeActiveMicros": { $exists: true } })',
          explanation:
            'May help locate active transaction information depending on version and privilege level.'
        }
      ],

      productionScenario: `A service starts a transaction and accidentally leaves it open for a long time while waiting on external application logic.

The database continues processing other writes.

Over time, WiredTiger must preserve history needed by the old transaction snapshot.

The DBA observes:

• Increasing cache pressure
• History-store activity
• A long-running transaction in currentOp
• Growing transaction age

The correct solution is not simply to increase cache size.

The application should keep transactions short and avoid holding database transactions open while performing unrelated external work.`,

      troubleshootingApproach: `For snapshot/MVCC-related concerns:

1. Check for long-running transactions.

2. Identify transaction age.

3. Inspect WiredTiger transaction metrics.

4. Check history-store behaviour where relevant.

5. Check cache pressure.

6. Check eviction behaviour.

7. Determine whether transactions wait on application-side processing.

8. Check transaction retry or abort errors.

9. Correlate with write volume.

10. Work with developers to shorten transaction scope.

11. Confirm read concern requirements.

12. Avoid changing storage-engine parameters without understanding the underlying workload.`,

      commonMistakes: [
        'Assuming readers always block writers.',
        'Assuming MVCC has no resource cost.',
        'Keeping transactions open while making external API calls.',
        'Ignoring old snapshots during cache-pressure incidents.',
        'Confusing snapshot visibility with replication lag.'
      ],

      bestPractices: [
        'Keep transactions short.',
        'Perform external work outside the transaction when possible.',
        'Monitor long-running transactions.',
        'Understand read concern and snapshot requirements.',
        'Correlate transaction age with cache and history-store pressure.'
      ],

      interviewAnswer: `WiredTiger uses MVCC, or Multi-Version Concurrency Control, so readers can operate against consistent snapshots while writers continue creating newer committed versions.

This improves concurrency by reducing unnecessary reader-writer blocking.

However, long-running snapshots or transactions can force the storage engine to retain older versions longer, increasing history and cache pressure, so production transactions should remain short.`,

      keyTakeaways: [
        'MVCC allows multiple logical versions of data.',
        'Readers can use consistent snapshots.',
        'Readers and writers do not always block each other.',
        'Long-running snapshots have storage-engine cost.',
        'Transaction duration is important for WiredTiger health.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 13,
    question:
      'How does WiredTiger compression work and what are the trade-offs of compression?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `Database records can occupy a large amount of disk space.

WiredTiger can compress data before storing it on disk.

Compression reduces physical storage consumption and can also reduce the amount of data that must be read from or written to storage.

However, compression requires CPU work.`,

      coreConcept: `WiredTiger supports compression for collection and index storage.

Important concepts include:

• Block compression
• Prefix compression for indexes
• Reduced disk usage
• Reduced physical I/O
• CPU cost for compression and decompression

The exact compression behaviour and defaults depend on MongoDB version and configuration.`,

      detailedExplanation: `Imagine 1 TB of logical document data.

If the data compresses well, the physical database files may consume substantially less than 1 TB.

This can be beneficial because:

• Less disk capacity is required.
• Fewer bytes may need to be read from storage.
• Fewer bytes may need to be written.
• More useful data may fit within storage and cache hierarchies.

Compression effectiveness depends heavily on the data.

Repeated text and similar structures can compress well.

Already compressed or encrypted-looking binary data may compress poorly.

Indexes also use compression techniques.

Prefix compression can reduce storage when neighbouring keys share common prefixes.

Compression is therefore not simply a disk-space feature.

It can influence I/O performance.

But there is a CPU trade-off.

Data must be compressed when written and decompressed when read.

On modern systems this trade-off is often beneficial, but a DBA should measure the actual workload rather than assuming maximum compression is always best.`,

      internalWorking: `Write:

Logical BSON
    |
    v
WiredTiger
    |
    v
Compression
    |
    v
Compressed storage block
    |
    v
Disk


Read:

Disk
    |
    v
Compressed block
    |
    v
WiredTiger
    |
    v
Decompression
    |
    v
Usable data page`,

      architecture: `Application Data
      |
      v
MongoDB
      |
      v
WiredTiger
      |
      +-- Compress
      |
      v
Smaller Physical Storage


Read path:

Storage
   |
   v
Compressed Block
   |
   v
Decompress
   |
   v
Cache / Query`,

      examples: [
        `A collection containing repetitive JSON-like business documents can often compress significantly.`,

        `A collection containing already compressed media files may show little additional compression benefit.`,

        `An index with similar neighbouring string prefixes may benefit from index prefix compression.`
      ],

      commands: [
        {
          command: 'db.collection.stats()',
          explanation:
            'Shows collection statistics including logical and physical storage-related information useful for evaluating compression.'
        },
        {
          command:
            'db.orders.stats().wiredTiger',
          explanation:
            'Displays WiredTiger statistics for the collection where available.'
        },
        {
          command:
            'db.adminCommand({ getCmdLineOpts: 1 })',
          explanation:
            'Shows startup configuration and can help verify storage-engine configuration.'
        }
      ],

      productionScenario: `A DBA sees:

Logical data size: 800 GB

Physical storage size: 350 GB

They assume 450 GB of data is missing.

In reality, WiredTiger compression may explain much of the difference.

Conversely, another workload stores encrypted binary payloads and compression provides very little reduction.

The DBA should compare:

• dataSize
• storageSize
• indexSize
• filesystem usage
• compression characteristics

rather than assuming logical and physical sizes should match.`,

      troubleshootingApproach: `For compression/storage questions:

1. Check collection statistics.

2. Compare logical data size with storage size.

3. Check index size separately.

4. Identify the data type stored.

5. Determine whether content is already compressed.

6. Check CPU utilization.

7. Check disk throughput and latency.

8. Compare storage behaviour across collections.

9. Review compression configuration if explicitly customized.

10. Benchmark before changing compression settings.

A compression change should be justified by measured CPU and I/O behaviour.`,

      commonMistakes: [
        'Assuming logical data size equals disk usage.',
        'Interpreting compression savings as missing data.',
        'Changing compression algorithms without benchmarking.',
        'Ignoring index storage.',
        'Ignoring CPU cost when evaluating compression.'
      ],

      bestPractices: [
        'Measure dataSize, storageSize, and index size independently.',
        'Keep default compression unless workload evidence supports a change.',
        'Capacity-plan using physical storage growth.',
        'Consider both CPU and I/O when evaluating compression.',
        'Benchmark unusual workloads.'
      ],

      interviewAnswer: `WiredTiger compresses collection and index storage to reduce physical disk usage and I/O.

Compression can improve storage efficiency and reduce bytes read or written, but it consumes CPU for compression and decompression.

The benefit depends on the data, so I compare logical size, physical storage, CPU, and I/O before considering any change from the supported defaults.`,

      keyTakeaways: [
        'WiredTiger stores compressed data.',
        'Logical and physical database sizes can differ significantly.',
        'Compression can reduce disk I/O.',
        'Compression consumes CPU.',
        'Actual workload measurements should drive tuning decisions.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 14,
    question:
      'What is WiredTiger eviction and what happens when the cache comes under pressure?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `The WiredTiger cache has limited space.

MongoDB cannot keep every page of a very large database in WiredTiger cache forever.

When space is needed, WiredTiger must remove less useful pages from cache.

This process is called eviction.`,

      coreConcept: `Eviction moves or removes pages from the WiredTiger cache so space becomes available for new work.

Clean pages can generally be discarded from cache because they already have a valid persistent representation.

Dirty pages may need additional processing and writing before they can be fully evicted.

Healthy eviction is normal.

Sustained eviction pressure can indicate that the workload is touching more data than the available cache and storage system can comfortably support.`,

      detailedExplanation: `Suppose the active working set is larger than the WiredTiger cache.

The application repeatedly accesses data that is not resident.

WiredTiger brings pages into cache.

To make room, other pages must be evicted.

If the evicted pages are soon needed again, they may have to be read back from storage.

This creates a cycle:

Read from disk
→ cache
→ evict
→ read again
→ cache

This is sometimes described as cache churn.

Write-heavy workloads introduce dirty pages.

If dirty data accumulates faster than the storage system can persist it, dirty-cache pressure can increase.

WiredTiger has eviction worker activity, and application threads may also be drawn into eviction work under pressure.

At that point application latency can increase.

This is why high eviction activity must be interpreted together with:

• Working-set size
• Page reads
• Dirty cache
• Disk latency
• Storage throughput
• Query plans
• Collection scans
• Large indexes
• Checkpoint behaviour`,

      internalWorking: `Cache nearly full
      |
      v
Need space
      |
      v
Choose page for eviction
      |
      +-- Clean page
      |      |
      |      +--> discard from cache
      |
      +-- Dirty page
             |
             +--> reconcile / write as required
             |
             +--> evict
      |
      v
Space available


If evicted page is needed again:

Disk
 |
 v
Read page
 |
 v
Cache`,

      architecture: `WiredTiger Cache

+--------------------------+
| Hot Page                 |
| Hot Page                 |
| Dirty Page               |
| Cold Page <--- candidate |
+--------------------------+

             |
             v

          Eviction

             |
             v

        Free Cache Space


If page needed again:

Disk --> Cache`,

      examples: [
        `Normal eviction occurs even on healthy MongoDB servers.`,

        `A large unindexed analytical scan can pull a huge number of pages into cache and displace frequently used transactional pages.`,

        `Slow storage can make dirty-page eviction more expensive and increase application latency.`
      ],

      commands: [
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides detailed cache and eviction metrics.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache["pages read into cache"]',
          explanation:
            'Shows a cumulative metric for pages read into cache where this exact metric name exists.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache["pages evicted by application threads"]',
          explanation:
            'Can indicate application threads participating in eviction work. Exact metric names may vary by MongoDB/WiredTiger version.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Helps correlate storage and CPU symptoms at the operating-system level.'
        }
      ],

      productionScenario: `A transactional application is stable throughout the day.

At midnight, a reporting job executes a full scan of a multi-terabyte collection.

Shortly afterward:

• Disk reads spike
• WiredTiger page reads rise
• Eviction activity rises
• Transaction query latency rises
• CPU may remain moderate

The reporting job has disturbed the transactional working set.

The correct solution may involve:

• Better report indexes
• Query redesign
• Running analytics elsewhere
• Using a suitable secondary if consistency and workload requirements permit
• Capacity changes
• Scheduling changes

Increasing the cache alone may not solve the architectural problem.`,

      troubleshootingApproach: `For eviction pressure:

1. Capture WiredTiger cache metrics.

2. Check cache occupancy.

3. Check dirty bytes.

4. Check pages read into cache.

5. Check eviction activity.

6. Check application-thread eviction metrics where available.

7. Check disk read/write latency.

8. Identify large collection scans.

9. Check active aggregations.

10. Check recent index builds.

11. Check working-set growth.

12. Compare against healthy baseline values.

13. Determine which workload displaced the normal cache working set.

14. Fix the access pattern before blindly increasing memory.`,

      commonMistakes: [
        'Treating all eviction as an error.',
        'Looking at cache percentage without looking at page reads.',
        'Increasing cache size without accounting for OS memory.',
        'Ignoring reporting workloads that destroy cache locality.',
        'Ignoring slow disks during dirty eviction pressure.'
      ],

      bestPractices: [
        'Monitor eviction as a trend.',
        'Correlate eviction with page reads and disk latency.',
        'Protect critical transactional working sets.',
        'Avoid uncontrolled full collection scans.',
        'Capacity-plan memory and storage together.'
      ],

      interviewAnswer: `WiredTiger eviction removes pages from its cache to make room for new pages.

Clean pages can generally be discarded, while dirty pages may need reconciliation and persistence.

Eviction is normal, but sustained eviction pressure, high page reads, dirty-cache pressure, or application threads participating heavily in eviction can indicate a working-set or storage bottleneck.

I correlate eviction metrics with query plans, disk latency, and workload changes before tuning memory.`,

      keyTakeaways: [
        'Eviction is normal cache management.',
        'Cache churn can cause repeated disk reads.',
        'Dirty eviction depends on storage performance.',
        'Large scans can disrupt the working set.',
        'Eviction must be analysed with query and storage metrics.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 15,
    question:
      'How does MongoDB handle client connections and connection pooling, and what happens when connection counts become excessive?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Applications need network connections to communicate with MongoDB.

Creating a brand-new connection for every database operation would be inefficient.

MongoDB drivers therefore normally maintain connection pools.

A pool keeps reusable connections available for application operations.`,

      coreConcept: `The connection architecture is:

Application
    ↓
MongoClient
    ↓
Connection Pool
    ↓
MongoDB Server

A MongoClient should normally be reused for the lifetime of the application process.

The pool grows and reuses connections according to driver configuration and workload.

Excessive connections can consume resources on both the application and database server.`,

      detailedExplanation: `A MongoDB driver typically maintains a pool of connections for each relevant server in the discovered topology.

When the application needs to perform an operation:

1. It requests a connection from the pool.

2. If an idle suitable connection exists, it is reused.

3. If pool capacity allows, a new connection may be established.

4. The operation runs.

5. The connection is returned to the pool.

The pool can be controlled with driver options such as concepts equivalent to:

maxPoolSize
minPoolSize
maxIdleTimeMS
waitQueueTimeoutMS

The exact option set depends on the driver.

A serious anti-pattern is creating a new MongoClient for every HTTP request.

For example:

Incoming API request
    |
    v
new MongoClient()
    |
    v
Connect
    |
    v
Run one query
    |
    v
Close

Repeated thousands of times.

This creates unnecessary:

• TCP connection setup
• TLS negotiation
• Authentication
• Server topology discovery
• Socket usage
• Memory usage
• CPU overhead

Connection count problems can also occur when many application instances each maintain large pools.`,

      internalWorking: `Healthy pattern:

Application Process
      |
      v
One MongoClient
      |
      v
Connection Pool
      |
      +-- Connection 1
      +-- Connection 2
      +-- Connection 3
      |
      v
MongoDB


Operation:
Request connection
      |
      v
Checkout
      |
      v
Use connection
      |
      v
Return to pool


Bad pattern:

HTTP Request 1 --> New MongoClient
HTTP Request 2 --> New MongoClient
HTTP Request 3 --> New MongoClient
HTTP Request 4 --> New MongoClient
...
      |
      v
Connection explosion`,

      architecture: `Application Instances

App 1 --> Pool ----+
App 2 --> Pool ----+----> MongoDB
App 3 --> Pool ----+
App 4 --> Pool ----+

Total connections depend on:

Number of app instances
×
Pool behaviour
×
Replica-set topology
×
Workload`,

      examples: [
        `If 100 application containers each permit very large pools, the aggregate MongoDB connection count can become much larger than developers expect.`,

        `A connection pool wait timeout can occur even when MongoDB CPU is low if all pool connections are busy with slow operations.`,

        `A sudden connection spike after an application deployment can indicate that MongoClient reuse was accidentally removed.`
      ],

      commands: [
        {
          command: 'db.serverStatus().connections',
          explanation:
            'Shows server-side connection metrics such as current and available connections.'
        },
        {
          command: 'db.currentOp({ active: true })',
          explanation:
            'Helps correlate active database operations with connection-related workload.'
        },
        {
          command:
            'ss -antp | grep mongod',
          explanation:
            'On Linux, can help inspect TCP connections associated with mongod subject to permissions.'
        },
        {
          command:
            'db.serverStatus().network',
          explanation:
            'Shows MongoDB network traffic metrics that can help correlate connection and traffic behaviour.'
        }
      ],

      productionScenario: `After a new application release, MongoDB current connections rise from 300 to 8,000.

CPU also rises and application latency increases.

The DBA initially suspects a traffic spike.

Application traffic, however, is almost unchanged.

Code review reveals the new release creates a MongoClient inside every request handler.

The root cause is application connection management.

The corrective action is to:

• Reuse MongoClient
• Use driver connection pooling
• Set sensible pool limits
• Redeploy the application
• Monitor connections returning to baseline

Increasing MongoDB's connection limit alone would only hide the design problem.`,

      troubleshootingApproach: `For excessive connections:

1. Check db.serverStatus().connections.

2. Compare current connections with historical baseline.

3. Identify recent application deployments.

4. Count application instances.

5. Inspect pool configuration.

6. Determine whether MongoClient is reused.

7. Check connection churn.

8. Check active operations.

9. Check slow queries occupying pooled connections.

10. Check authentication and TLS overhead.

11. Check operating-system file-descriptor limits where relevant.

12. Check application wait-queue errors.

13. Calculate aggregate pool capacity across all application instances.

14. Fix connection lifecycle or slow operations before simply raising limits.`,

      commonMistakes: [
        'Creating MongoClient per request.',
        'Setting huge pool sizes on every application instance.',
        'Looking only at database connection limits.',
        'Ignoring slow queries that keep pool connections busy.',
        'Increasing limits without calculating total application pool capacity.'
      ],

      bestPractices: [
        'Reuse MongoClient.',
        'Use the official driver pool implementation.',
        'Set pool sizes based on workload rather than arbitrary large values.',
        'Monitor current connections and pool wait time.',
        'Capacity-plan total connections across every application instance.'
      ],

      interviewAnswer: `MongoDB drivers use connection pools so applications can reuse established connections instead of reconnecting for every operation.

A MongoClient should normally be long-lived and reused.

Excessive connection counts can result from oversized pools, too many application instances, slow operations, or creating clients per request.

I compare server connection metrics with application instance count, pool settings, slow queries, and deployment changes before increasing connection limits.`,

      keyTakeaways: [
        'MongoDB drivers use connection pools.',
        'MongoClient should normally be reused.',
        'Total connections are the sum of many application pools.',
        'Slow queries can exhaust pools even without huge connection counts.',
        'Connection explosions often originate in application design.'
      ]
    }
  },
  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 16,
    question:
      'MongoDB is using a high percentage of RAM. How would you determine whether this is healthy cache usage or real memory pressure?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 16,

    answer: {
      groundZero: `High RAM usage by MongoDB is not automatically a problem.

Databases are designed to use memory aggressively because memory access is much faster than disk access.

The real question is not:

"How much RAM is MongoDB using?"

The real question is:

"Is the server under harmful memory pressure?"`,

      coreConcept: `Healthy memory use may include:

• WiredTiger cache
• Operating-system filesystem cache
• Connections
• Query execution
• Replication
• Process overhead

Real memory pressure may show symptoms such as:

• Active swapping
• OOM kills
• Severe eviction pressure
• Increased disk reads
• Query latency
• Cache churn
• System reclaim pressure`,

      detailedExplanation: `MongoDB memory troubleshooting requires distinguishing normal cache use from resource exhaustion.

For example, if a server has 32 GB RAM and mongod uses 22 GB, that alone does not prove a problem.

If:

• swap usage is zero
• query latency is stable
• eviction is healthy
• disk latency is normal
• no OOM events occur

then the system may be healthy.

Now consider the same 22 GB usage combined with:

• sustained swap-in and swap-out
• rising WiredTiger eviction
• increased page reads
• slow disk
• query latency spikes
• Linux memory pressure

That indicates a very different situation.

The DBA should evaluate memory as a complete system.

WiredTiger cache is only one part of mongod memory.

The operating system also needs memory.

Application agents, monitoring software, backup tools, and other processes also compete for RAM.`,

      internalWorking: `Healthy:

RAM
 |
 +-- WiredTiger cache
 |
 +-- OS cache
 |
 +-- mongod overhead
 |
 +-- other processes

No harmful swapping
Stable latency
Stable eviction


Pressure:

Working set > effective memory
        |
        v
More cache misses
        |
        v
More page reads
        |
        v
Eviction pressure
        |
        v
Disk dependency
        |
        v
Higher latency

If OS memory becomes critically constrained:

Memory reclaim
    |
    v
Swap / OOM risk`,

      architecture: `Physical RAM

+-----------------------------+
| WiredTiger Cache            |
| MongoDB Process Memory      |
| OS Filesystem Cache         |
| Kernel Memory               |
| Other Processes             |
+-----------------------------+

Healthy:
Enough headroom and stable latency

Unhealthy:
Reclaim + swap + eviction + I/O pressure`,

      examples: [
        `80% RAM usage with no swap and stable latency may be healthy.`,

        `65% RAM usage with heavy swapping can still indicate a serious problem.`,

        `A sudden full collection scan can create cache churn without changing the configured WiredTiger cache size.`
      ],

      commands: [
        {
          command: 'free -h',
          explanation:
            'Shows total, used, available memory and swap on Linux.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Helps observe swapping, CPU, and run-queue behaviour over time.'
        },
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows WiredTiger cache, eviction, dirty-page, and page-read metrics.'
        },
        {
          command: 'db.serverStatus().mem',
          explanation:
            'Shows MongoDB process memory metrics exposed by serverStatus.'
        },
        {
          command: 'ps -eo pid,comm,rss,%mem --sort=-rss | head',
          explanation:
            'Displays the largest memory-consuming processes on Linux.'
        }
      ],

      productionScenario: `Monitoring reports:

MongoDB memory usage = 85%.

The application is still healthy.

The DBA checks:

• No swap activity
• No OOM events
• Stable query latency
• Normal disk latency
• WiredTiger eviction within normal historical range

This is likely expected database caching behaviour.

Later, a reporting job starts.

Now:

• pages read into cache increase rapidly
• eviction rises
• disk reads spike
• query latency increases
• swap begins

At that point the system is experiencing real pressure.

The important distinction came from workload and system behaviour, not from the memory percentage alone.`,

      troubleshootingApproach: `A practical investigation is:

1. Check free -h.

2. Check available memory rather than only free memory.

3. Check swap usage.

4. Use vmstat to detect active swapping.

5. Check OOM-killer events if permitted.

6. Check mongod RSS.

7. Inspect WiredTiger cache metrics.

8. Check eviction activity.

9. Check pages read into cache.

10. Check disk latency.

11. Identify large queries or scans.

12. Check connection count.

13. Check other processes.

14. Compare all values to a healthy baseline.

15. Decide whether the issue is workload design, memory capacity, storage performance, or another process.

Do not restart mongod simply to reduce the displayed memory percentage.`,

      commonMistakes: [
        'Calling high RAM usage a memory leak without evidence.',
        'Restarting MongoDB to free cache.',
        'Ignoring active swapping.',
        'Looking only at free memory instead of available memory.',
        'Increasing WiredTiger cache without leaving room for the OS.'
      ],

      bestPractices: [
        'Monitor memory as a trend.',
        'Correlate memory with query latency and disk I/O.',
        'Avoid sustained swapping.',
        'Protect memory for the operating system.',
        'Use workload evidence before changing cache settings.'
      ],

      interviewAnswer: `I do not treat high MongoDB RAM utilization by itself as a problem.

I check available memory, swap activity, OOM events, mongod RSS, WiredTiger cache and eviction metrics, page reads, disk latency, current workload, and application response time.

If memory is being used as healthy cache and the system is not swapping or experiencing latency, high utilization can be normal.

If it is causing eviction churn, disk pressure, swapping, or OOM risk, then it is real memory pressure.`,

      keyTakeaways: [
        'High memory utilization can be healthy.',
        'Swap and OOM behaviour are more important warning signs.',
        'WiredTiger cache is only part of mongod memory.',
        'Cache pressure should be correlated with page reads and disk latency.',
        'Memory troubleshooting requires a system-wide view.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 17,
    question:
      'MongoDB query latency suddenly increases and disk latency is high. How would you determine whether storage is the root cause?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 17,

    answer: {
      groundZero: `High disk latency and slow MongoDB queries occurring at the same time do not automatically prove the disk is the root cause.

The database may be generating excessive disk I/O because of a bad query, collection scan, index build, cache churn, backup, or other workload.

The DBA must determine both:

Why disk latency is high

and:

Why MongoDB is performing that amount of I/O.`,

      coreConcept: `Storage troubleshooting requires correlation between:

• Query plans
• Working-set behaviour
• WiredTiger cache
• Page reads
• Disk latency
• Disk throughput
• IOPS
• Queue depth
• Background database activity

Storage may be:

The root cause

or:

A victim of inefficient database workload.`,

      detailedExplanation: `Consider a slow query.

If explain shows:

nReturned = 10

totalDocsExamined = 20,000,000

then MongoDB is doing enormous unnecessary work.

If the required pages are not cached, this can generate heavy disk reads.

The storage device may then show high latency.

In this case the query/index design is the primary problem.

Now consider another case:

The same efficient indexed query normally examines 10 keys and 10 documents.

No query plan changed.

But the storage volume suddenly shows:

• very high read latency
• I/O timeouts
• throughput throttling
• infrastructure warnings

Many unrelated MongoDB operations become slow at the same time.

That is stronger evidence that the storage layer itself may be the root cause.

An L3 DBA therefore compares database workload against infrastructure behaviour.`,

      internalWorking: `Case A:

Bad Query
   |
   v
Huge Scan
   |
   v
Cache Misses
   |
   v
Massive Disk I/O
   |
   v
Disk Latency
   |
   v
Slow MongoDB

Root cause:
Query / Index design


Case B:

Normal Query
   |
   v
Normal I/O request
   |
   v
Slow Storage
   |
   v
Long page-read wait
   |
   v
Slow MongoDB

Root cause:
Storage layer`,

      architecture: `MongoDB Latency
      |
      v
Determine source
      |
      +--> Query inefficiency?
      |
      +--> Cache churn?
      |
      +--> Index build?
      |
      +--> Backup?
      |
      +--> Initial sync?
      |
      +--> Storage degradation?
      |
      v
Correlate DB + OS + Cloud metrics`,

      examples: [
        `A COLLSCAN over hundreds of GB can generate high disk activity even when the storage hardware is healthy.`,

        `A cloud volume hitting a throughput or IOPS ceiling can slow otherwise efficient indexed queries.`,

        `An initial sync can generate substantial read and write I/O and affect foreground latency.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows whether the query is examining an excessive number of keys or documents.'
        },
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Helps determine whether cache misses and page reads are increasing.'
        },
        {
          command: 'iostat -x 1',
          explanation:
            'When available, provides extended block-device utilization and latency metrics.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Provides additional system-level CPU and I/O context.'
        }
      ],

      productionScenario: `An application reports all important queries are 5x slower.

The DBA confirms:

• Same application release
• Same query shapes
• Same indexes
• No increase in documents examined
• No unusual collection scans
• No backup
• No index build
• WiredTiger cache behaviour is normal

At the same time:

• Disk await has increased sharply
• Cloud storage reports throttling
• Multiple unrelated database operations are slow

This is strong evidence of a storage bottleneck.

The DBA can provide the infrastructure team with correlated timestamps and metrics rather than simply stating:

"MongoDB is slow."`,

      troubleshootingApproach: `Use this sequence:

1. Identify when latency started.

2. Capture slow operations.

3. Run explain on representative queries.

4. Compare docsExamined and keysExamined with historical behaviour.

5. Check page reads and cache eviction.

6. Check for collection scans.

7. Check index builds.

8. Check backup activity.

9. Check initial sync or resync.

10. Check checkpoint/dirty-cache behaviour.

11. Check OS disk latency.

12. Check storage IOPS and throughput limits.

13. Check cloud-provider volume metrics if available.

14. Compare all symptoms on the same timeline.

15. Separate workload-generated I/O from infrastructure-generated latency.`,

      commonMistakes: [
        'Blaming the disk only because disk latency is high.',
        'Ignoring query plans during storage incidents.',
        'Ignoring storage limits on cloud volumes.',
        'Checking only MongoDB metrics or only OS metrics.',
        'Failing to correlate events by timestamp.'
      ],

      bestPractices: [
        'Maintain query-performance baselines.',
        'Monitor storage latency continuously.',
        'Know provisioned IOPS and throughput limits.',
        'Correlate MongoDB and infrastructure metrics.',
        'Identify whether storage is the cause or the victim.'
      ],

      interviewAnswer: `I correlate MongoDB and storage metrics.

First I verify whether query plans, documents examined, collection scans, cache misses, index builds, backups, or initial sync are generating abnormal I/O.

Then I compare that with disk latency, IOPS, throughput, and queue behaviour.

If efficient queries and normal database workload become slow while storage latency rises across unrelated operations, storage is likely the root cause.

If an inefficient query generates huge I/O, the disk may only be the victim.`,

      keyTakeaways: [
        'High disk latency does not automatically mean disk is the root cause.',
        'Bad queries can create storage pressure.',
        'Efficient queries becoming slow together can point toward infrastructure.',
        'Database and OS metrics must be correlated.',
        'Timeline correlation is critical for RCA.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 18,
    question:
      'MongoDB shows periodic write-latency spikes. How would you investigate checkpoints, dirty cache, and storage I/O?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 18,

    answer: {
      groundZero: `Periodic latency spikes can be difficult because the system may look healthy most of the time.

If write latency repeatedly increases at similar intervals, one possibility is storage-engine background work such as checkpoints.

But a DBA should not assume checkpoints are the cause without evidence.`,

      coreConcept: `The investigation should correlate:

• Application write latency
• WiredTiger dirty cache
• Checkpoint duration
• Eviction
• Disk write latency
• Storage throughput
• Backup jobs
• Index operations
• Batch workloads
• Replication activity

Periodic timing is a clue, not a diagnosis.`,

      detailedExplanation: `Write-heavy workloads create modified or dirty pages in WiredTiger cache.

Those changes eventually need to become persistent.

Checkpoint activity writes a consistent storage state.

If the underlying storage device is near its performance limit, checkpoint-related writes can coincide with higher application latency.

However, periodic I/O can also come from:

• Scheduled batch jobs
• Backups
• Monitoring scans
• Log rotation
• Cloud snapshots
• Index maintenance
• Data import
• Application cron jobs

Therefore the DBA should build a timeline.

For example:

10:00:00 latency spike
10:01:00 normal
10:02:00 normal
10:03:00 latency spike

Then correlate:

MongoDB metrics
Linux metrics
Application metrics
Cloud storage metrics
Scheduled jobs

If checkpoint duration increases exactly when disk await increases and no other workload changed, the disk may be unable to flush the dirty workload efficiently.

But if a batch job begins at the same time, that job may be the actual trigger.`,

      internalWorking: `Writes
  |
  v
Dirty Pages
  |
  v
WiredTiger Cache
  |
  +--> Eviction
  |
  +--> Checkpoint
  |
  v
Storage Writes
  |
  v
Disk latency / throughput
  |
  v
Application write latency


Important:
Correlation does not automatically prove causation.

Other workloads must be checked.`,

      architecture: `Application Writes
       |
       v
WiredTiger Dirty Cache
       |
       +------> Eviction
       |
       +------> Checkpoint
                    |
                    v
               Storage I/O
                    |
                    v
             Latency observed

Parallel workloads:
Backup / Index / Batch / Snapshot
                    |
                    +--> same storage`,

      examples: [
        `Checkpoint duration rising together with disk latency can indicate storage pressure.`,

        `A backup starting every 15 minutes can create a periodic pattern that appears checkpoint-related.`,

        `High dirty-cache pressure can make foreground writes more sensitive to storage speed.`
      ],

      commands: [
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows dirty-cache and eviction metrics.'
        },
        {
          command: 'db.serverStatus().wiredTiger.transaction',
          explanation:
            'Contains checkpoint and transaction metrics depending on the MongoDB version.'
        },
        {
          command: 'db.serverStatus().opLatencies',
          explanation:
            'Helps compare operation latency trends.'
        },
        {
          command: 'iostat -x 1',
          explanation:
            'Shows device utilization and latency when sysstat tools are installed.'
        }
      ],

      productionScenario: `A production cluster experiences a 2-second write spike approximately every minute.

The DBA collects metrics over 30 minutes.

They discover:

• Checkpoint duration rises during each spike
• Dirty cache builds up beforehand
• Disk write latency rises sharply
• Storage throughput reaches its provisioned limit
• No application batch job is running

The root cause is not that checkpoints are abnormal.

Checkpoint activity is normal.

The storage layer cannot persist the workload efficiently enough.

Possible solutions may include:

• Faster storage
• Higher provisioned throughput
• Workload/index optimization
• Reducing unnecessary writes
• Capacity scaling

Disabling normal durability mechanisms would not be an appropriate fix.`,

      troubleshootingApproach: `For periodic write spikes:

1. Record exact timestamps.

2. Check application write latency.

3. Check dirty cache before and during spikes.

4. Check checkpoint duration.

5. Check eviction activity.

6. Check disk write latency.

7. Check storage IOPS and throughput.

8. Check backup schedules.

9. Check index operations.

10. Check batch jobs.

11. Check cloud snapshots.

12. Check replication/initial sync activity.

13. Compare with healthy periods.

14. Determine whether checkpoint is the cause, trigger, or merely correlated activity.

15. Fix the underlying storage or workload bottleneck.`,

      commonMistakes: [
        'Blaming checkpoints because the spikes are periodic.',
        'Trying to disable durability to reduce latency.',
        'Ignoring scheduled workloads.',
        'Ignoring storage throughput ceilings.',
        'Looking at only one metric during the spike.'
      ],

      bestPractices: [
        'Build a timestamped incident timeline.',
        'Monitor checkpoint and dirty-cache metrics.',
        'Provision storage for sustained writes.',
        'Check scheduled background activity.',
        'Treat checkpoints as normal storage-engine behaviour unless evidence proves otherwise.'
      ],

      interviewAnswer: `For periodic write spikes I correlate write latency with WiredTiger dirty cache, checkpoint duration, eviction, and disk latency.

I also check scheduled jobs, backups, index operations, snapshots, and replication activity.

If checkpoints are taking longer because the storage device is saturated, then the root cause is typically storage capacity or excessive write workload rather than the existence of checkpoints themselves.`,

      keyTakeaways: [
        'Periodic behaviour is only a diagnostic clue.',
        'Checkpoints are normal.',
        'Dirty-cache growth can expose slow storage.',
        'Scheduled jobs can mimic checkpoint problems.',
        'Fix the underlying bottleneck rather than disabling durability.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 19,
    question:
      'How would you isolate whether a MongoDB performance problem is caused by CPU, memory, storage, query design, or connection pressure?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 19,

    answer: {
      groundZero: `When somebody says:

"MongoDB is slow"

the DBA should not immediately choose one resource to blame.

A database request passes through multiple layers.

The goal is to identify where time is being spent.`,

      coreConcept: `A structured performance investigation should evaluate:

1. Query behaviour
2. CPU
3. Memory
4. WiredTiger cache
5. Disk
6. Network
7. Connections
8. Replication
9. Application behaviour

The symptoms must be correlated rather than checked independently.`,

      detailedExplanation: `QUERY BOTTLENECK

Signs can include:

• COLLSCAN
• Huge totalDocsExamined
• Huge totalKeysExamined
• Blocking sorts
• Poor index choice
• Returning excessive documents

CPU BOTTLENECK

Signs can include:

• Sustained high CPU
• High run queue
• Expensive aggregation
• Excessive compression or query work
• Many concurrent operations

MEMORY/CACHE BOTTLENECK

Signs can include:

• High cache churn
• Increasing page reads
• Eviction pressure
• Swap activity
• OOM pressure

STORAGE BOTTLENECK

Signs can include:

• High await
• High service time
• Throughput saturation
• IOPS throttling
• Many unrelated operations slowing simultaneously

CONNECTION BOTTLENECK

Signs can include:

• Connection-pool wait errors
• Very high connection counts
• Client creation per request
• Slow operations occupying pool connections

NETWORK BOTTLENECK

Signs can include:

• Increased application-to-database round-trip time
• Packet loss
• Cross-region traffic
• Connection resets

An L3 DBA combines these signals into one causal chain.`,

      internalWorking: `Slow Request
     |
     v
Check Query Plan
     |
     +-- inefficient? --> query/index issue
     |
     v
Check CPU
     |
     +-- saturated? --> CPU/workload issue
     |
     v
Check Memory/Cache
     |
     +-- pressure? --> memory/working-set issue
     |
     v
Check Disk
     |
     +-- latency? --> storage or I/O workload issue
     |
     v
Check Connections
     |
     +-- pool wait? --> connection/application issue
     |
     v
Check Network/Replication
     |
     v
Root-cause hypothesis`,

      architecture: `Application
    |
    v
Connection Pool
    |
    v
MongoDB Query Layer
    |
    v
CPU
    |
    v
WiredTiger Cache
    |
    v
Storage
    |
    v
Replication / Network

Any layer can dominate latency.`,

      examples: [
        `CPU 95% plus an aggregation scanning millions of documents suggests workload-driven CPU pressure.`,

        `CPU 20%, but disk await is extremely high and efficient indexed queries are slow, suggesting storage.`,

        `Database is healthy, but application pool wait time is high because only a few connections are allowed and requests are long-running.`
      ],

      commands: [
        {
          command: 'db.currentOp({ active: true })',
          explanation:
            'Shows active database operations.'
        },
        {
          command: 'db.serverStatus().opLatencies',
          explanation:
            'Provides operation latency metrics.'
        },
        {
          command: 'db.serverStatus().connections',
          explanation:
            'Shows connection counts.'
        },
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows cache and eviction metrics.'
        },
        {
          command: 'top',
          explanation:
            'Provides a live Linux view of CPU and process activity.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Shows CPU, memory, run queue, and swap activity.'
        },
        {
          command: 'iostat -x 1',
          explanation:
            'Provides storage utilization and latency metrics when installed.'
        }
      ],

      productionScenario: `An API latency alert fires.

The DBA finds:

CPU = 35%

RAM usage = 78%

No swap

Disk latency = normal

MongoDB connection count = normal

One query now examines 12 million documents and returns 25.

The query plan changed after an index was removed during cleanup.

The infrastructure is healthy.

The problem is query/index design.

This is why resource percentages should never replace explain analysis.`,

      troubleshootingApproach: `Use a top-down process:

1. Define the exact slow operation.

2. Compare current latency with baseline.

3. Run explain.

4. Inspect active operations.

5. Check CPU and run queue.

6. Check memory and swap.

7. Check WiredTiger cache and eviction.

8. Check disk latency.

9. Check connections and pool behaviour.

10. Check network.

11. Check replica-set health.

12. Check recent deployments and index changes.

13. Correlate timestamps.

14. Build a specific root-cause hypothesis.

15. Test the hypothesis before making production changes.

A good DBA narrows the problem with evidence instead of changing multiple settings at once.`,

      commonMistakes: [
        'Changing multiple configuration settings simultaneously.',
        'Blaming high RAM usage.',
        'Ignoring explain plans.',
        'Assuming high CPU always means insufficient hardware.',
        'Ignoring application connection pools.'
      ],

      bestPractices: [
        'Use a repeatable troubleshooting sequence.',
        'Maintain performance baselines.',
        'Change one thing at a time.',
        'Correlate database, OS, and application metrics.',
        'Prove the bottleneck before scaling hardware.'
      ],

      interviewAnswer: `I isolate MongoDB performance issues layer by layer.

I begin with the exact slow query and explain statistics, then check current operations, CPU, memory and swap, WiredTiger cache and eviction, disk latency, connections, network, and replication.

I compare the incident against a healthy baseline and recent changes.

The objective is to prove where the latency is introduced before changing indexes, configuration, or hardware.`,

      keyTakeaways: [
        'MongoDB performance is multi-layered.',
        'Query analysis should come early.',
        'High resource usage is a symptom, not automatically a root cause.',
        'Application connection behaviour matters.',
        'Evidence-based isolation prevents unnecessary changes.'
      ]
    }
  },

  {
    category: 'mongodb_architecture',
    topicId: 'mongodb-architecture',
    topicNumber: 2,
    topicName: 'MongoDB Architecture & Internals',
    questionNumber: 20,
    question:
      'A production MongoDB application is slow, replica-set lag is increasing, memory is high, and disk latency is elevated. How would you perform an end-to-end L3 investigation?',
    level: 'L3+ Scenario',
    difficulty: 'Advanced',
    order: 20,

    answer: {
      groundZero: `Real production incidents often contain several symptoms at once.

For example:

• Application is slow
• Replication lag is increasing
• Memory usage is high
• Disk latency is high

The DBA must determine which symptom came first and which symptoms are consequences.

Restarting servers or changing settings without establishing that sequence can destroy useful evidence and make the incident worse.`,

      coreConcept: `An L3 investigation should build a causal timeline across:

Application
Driver
Queries
Connections
Primary
Secondaries
WiredTiger
Operating system
Storage
Network
Recent changes

The main objective is:

Find the earliest abnormal event and determine how it propagated through the architecture.`,

      detailedExplanation: `Imagine the following incident:

09:55
System healthy.

10:00
A reporting query starts.

10:01
Primary disk reads increase.

10:02
WiredTiger eviction increases.

10:03
Application query latency rises.

10:04
Primary write latency rises.

10:05
Secondary apply rate falls behind.

10:06
Replication lag increases.

10:07
Connection pool wait time increases because requests are completing slowly.

At 10:08 someone sees:

High memory
High disk latency
Replication lag
High connection count

and assumes:

"Replication caused the outage."

But the timeline suggests the original trigger was a large reporting workload causing cache churn and storage pressure.

This is why causal ordering matters.

The investigation should determine:

What changed first?

Which metrics changed immediately afterward?

What workload was active?

Did query plans change?

Did an index disappear?

Did a backup begin?

Did an initial sync start?

Was there a storage event?

Was there an application deployment?

Was there an election?

Was one secondary unhealthy before the incident?

Every layer must be considered.`,

      internalWorking: `Possible causal chain:

Large Query
   |
   v
Collection Scan
   |
   v
Cache Churn
   |
   v
Disk Reads
   |
   v
Storage Latency
   |
   +--> Slow Reads
   |
   +--> Slow Writes
   |
   v
Replication Apply Slows
   |
   v
Replication Lag
   |
   v
Application Requests Stay Open
   |
   v
Pool Pressure / Connection Growth


Visible symptoms:
Memory high
Disk high
Lag high
App slow

Original trigger:
Query workload`,

      architecture: `APPLICATION
    |
    v
DRIVER / POOL
    |
    v
PRIMARY
    |
    +-- Query Layer
    |
    +-- WiredTiger
    |      |
    |      +-- Cache
    |      +-- Eviction
    |      +-- Journal
    |      +-- Checkpoint
    |
    +-- Oplog
           |
     +-----+-----+
     |           |
     v           v
SECONDARY     SECONDARY
     |           |
     v           v
Local Storage  Local Storage


All depend on:

CPU
RAM
Disk
Network`,

      examples: [
        `Replication lag can be a consequence of slow secondary disks rather than a replication configuration problem.`,

        `High memory can be a consequence of an oversized active working set rather than the root cause.`,

        `Connection growth can occur because slow database requests stay open longer, even if the application did not change pool settings.`
      ],

      commands: [
        {
          command: 'rs.status()',
          explanation:
            'Shows replica-set member state and health.'
        },
        {
          command: 'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides secondary replication timing information useful during lag analysis.'
        },
        {
          command: 'db.currentOp({ active: true })',
          explanation:
            'Shows active database operations and long-running work.'
        },
        {
          command: 'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows cache, page-read, dirty-data, and eviction metrics.'
        },
        {
          command: 'db.serverStatus().connections',
          explanation:
            'Shows server-side connection statistics.'
        },
        {
          command: 'db.serverStatus().opLatencies',
          explanation:
            'Shows operation latency metrics.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Provides CPU, memory, run queue, and swap context.'
        },
        {
          command: 'iostat -x 1',
          explanation:
            'Provides disk latency and utilization metrics when available.'
        }
      ],

      productionScenario: `A 3-member replica set supports a critical application.

Symptoms:

• Application response time increased from 100 ms to 4 seconds.
• Primary memory usage is 85%.
• Secondary replication lag reaches 90 seconds.
• Disk read latency rises above normal.
• Connection count doubles.

The DBA performs the investigation in this order:

1. Establish the incident start time.

2. Check recent deployment, index, backup, and maintenance changes.

3. Inspect currentOp for large scans or long operations.

4. Run explain on top slow queries.

5. Inspect WiredTiger cache and eviction.

6. Check disk latency.

7. Compare primary and secondary storage performance.

8. Check oplog window.

9. Determine whether secondaries are receiving operations normally but applying slowly.

10. Check connection-pool behaviour.

The DBA discovers one new reporting query performs a full collection scan over 800 GB.

It causes cache churn and storage saturation.

Foreground write latency increases.

Secondaries also experience storage pressure while applying replicated writes.

Replication lag grows.

Application calls remain open longer, increasing connection usage.

The root cause is therefore the reporting access pattern and its storage impact, not MongoDB replication itself.

Corrective action may involve:

• Kill or stop the harmful reporting workload if operationally justified.
• Create or redesign an appropriate index after testing.
• Isolate reporting workload.
• Review scheduling.
• Validate storage capacity.
• Monitor replica recovery.
• Document the causal chain in the RCA.`,

      troubleshootingApproach: `Use a disciplined end-to-end process:

1. Record exact incident timestamps.

2. Preserve MongoDB and system logs.

3. Identify recent changes.

4. Verify replica-set topology.

5. Check elections and member state.

6. Measure replication lag.

7. Check oplog window.

8. Inspect active and slow operations.

9. Analyse explain plans.

10. Check connections.

11. Check CPU.

12. Check memory and swap.

13. Inspect WiredTiger cache.

14. Check eviction and dirty cache.

15. Check disk latency.

16. Check network latency.

17. Compare primary and secondaries.

18. Determine which metric changed first.

19. Build a causal chain.

20. Apply the smallest justified corrective action.

21. Monitor recovery.

22. Produce RCA containing:

Trigger
Timeline
Impact
Root cause
Contributing factors
Corrective action
Preventive action

An L3 DBA should be able to explain why each symptom occurred, not only list the symptoms.`,

      commonMistakes: [
        'Restarting the primary before collecting evidence.',
        'Assuming replication lag is always the root cause.',
        'Changing cache size during an active incident without analysis.',
        'Ignoring application-side changes.',
        'Checking only the primary and not the secondaries.',
        'Writing an RCA that lists symptoms instead of the causal chain.'
      ],

      bestPractices: [
        'Build a timestamped timeline first.',
        'Preserve logs and metrics.',
        'Check all architecture layers.',
        'Distinguish root cause from downstream symptoms.',
        'Use the smallest corrective change necessary.',
        'Document preventive actions after recovery.'
      ],

      interviewAnswer: `For a complex MongoDB incident I first establish a timeline and preserve evidence.

I check recent changes, active queries, explain plans, WiredTiger cache and eviction, disk latency, CPU, memory, connections, replica-set state, replication lag, oplog window, and secondary health.

Then I determine which abnormal event occurred first and build the causal chain.

For example, a large collection scan may cause cache churn and storage saturation, which then increases write latency, replication lag, and connection-pool pressure.

The key L3 skill is separating the original trigger from downstream symptoms.`,

      keyTakeaways: [
        'Complex incidents usually contain multiple dependent symptoms.',
        'Timeline order helps reveal causality.',
        'Replication lag can be a downstream symptom.',
        'Database and infrastructure metrics must be correlated.',
        'A strong RCA explains the complete causal chain.'
      ]
    }
  }
];


/* =========================================================
   SEED FUNCTION
========================================================= */

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db =
      client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );


    /* =====================================================
       REMOVE ONLY PREVIOUS TOPIC 2 RECORDS
    ===================================================== */

    const deleteResult =
      await collection.deleteMany({
        category: 'mongodb_architecture'
      });

    console.log(
      `Removed ${deleteResult.deletedCount} previous mongodb_architecture documents`
    );


    /* =====================================================
       INSERT ALL 20 TOPIC 2 QUESTIONS
    ===================================================== */

    const insertResult =
      await collection.insertMany(
        questions,
        {
          ordered: true
        }
      );

    console.log(
      `Inserted ${insertResult.insertedCount} MongoDB Architecture & Internals questions`
    );


    /* =====================================================
       SAFE PARTIAL UNIQUE INDEX

       Topic 1 may already have created this index.
       createIndex is safe to call again with the same
       definition and name.
    ===================================================== */

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


    /* =====================================================
       VALIDATE TOPIC COUNT
    ===================================================== */

    const count =
      await collection.countDocuments({
        category:
          'mongodb_architecture'
      });

    console.log(
      `Topic 2 count: ${count}`
    );

    if (count !== 20) {
      throw new Error(
        `Validation failed: expected 20 questions, found ${count}`
      );
    }


    /* =====================================================
       VALIDATE ALL NEW CURRICULUM QUESTIONS SO FAR

       Topic 1 = 20
       Topic 2 = 20
       Expected new total = 40
    ===================================================== */

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
      'Topic 2 seed completed successfully.'
    );

  } finally {

    await client.close();

  }
}


/* =========================================================
   RUN
========================================================= */

seed().catch((error) => {

  console.error(
    'Topic 2 seed failed:'
  );

  console.error(error);

  process.exit(1);
});
