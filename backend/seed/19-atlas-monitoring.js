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
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 1,
    question:
      'What is MongoDB Atlas, and how is administering an Atlas deployment different from administering self-managed MongoDB?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `MongoDB Atlas is MongoDB's managed cloud database platform.

With self-managed MongoDB, your team is responsible for much of the underlying infrastructure and database lifecycle.

With Atlas, MongoDB manages significant portions of infrastructure orchestration while the customer still remains responsible for important database, application, security, access, performance and data-governance decisions.`,

      coreConcept: `SELF-MANAGED

Your team
   |
   +--> VM/OS
   +--> MongoDB installation
   +--> patching
   +--> topology
   +--> backup infrastructure
   +--> monitoring
   +--> security configuration


ATLAS

MongoDB Atlas platform
   |
   +--> managed infrastructure
   +--> cluster orchestration
   +--> managed backup capabilities
   +--> monitoring
   +--> automated maintenance capabilities

Customer
   |
   +--> data model
   +--> queries/indexes
   +--> DB users
   +--> network access
   +--> application configuration
   +--> security/governance decisions`,

      detailedExplanation: `Atlas removes much of the operational work involved in maintaining MongoDB infrastructure, but it does not remove the DBA role.

A self-managed DBA may directly perform tasks such as:

• installing mongod
• configuring systemd
• editing mongod.conf
• managing operating-system packages
• creating storage volumes
• configuring replica-set members
• building backup infrastructure
• performing server patching.

In Atlas, many infrastructure-level tasks are performed through the Atlas control plane.

The DBA instead spends more time on:

• cluster architecture
• sizing
• database users
• project access
• network access
• private connectivity
• backup policies
• monitoring
• alerts
• performance analysis
• query optimization
• scaling
• cost
• application connectivity.

SHARED RESPONSIBILITY

Managed does not mean that MongoDB automatically fixes poor application design.

For example, Atlas cannot make an unindexed high-volume query efficient simply because the deployment is managed.

Similarly, customers still need to protect:

• credentials
• API keys/service accounts
• network configuration
• database privileges
• application secrets.

The exact Atlas features available depend on the deployment type, cloud provider, region, service tier and current Atlas product capabilities.`,

      internalWorking: `Application
     |
     v
Atlas database deployment
     |
     +--> MongoDB-managed platform operations
     |
     +--> customer-controlled database/application decisions
     |
     v
Cloud infrastructure`,

      architecture: `        ATLAS ORGANIZATION
               |
            PROJECT
               |
       DATABASE DEPLOYMENT
          /     |      \
       nodes  backup  metrics
          |
       application`,

      examples: [
        'On a self-managed EC2 deployment, the DBA may patch the mongod package directly. In Atlas, maintenance is managed through Atlas capabilities and policies.',
        'Atlas can provide managed monitoring, but the DBA still has to interpret high CPU, slow queries or connection growth.',
        'A database user and an Atlas control-plane user are different identities.'
      ],

      commands: [
        {
          command:
            'mongosh "<Atlas connection string>"',
          explanation:
            'Applications and DBAs can connect using a supported Atlas connection string. Never hard-code or expose real credentials in scripts.'
        }
      ],

      productionScenario: `A company migrates from self-managed MongoDB to Atlas and assumes that DBAs are no longer needed.

After migration, application latency increases because several high-volume queries perform excessive document examination.

Atlas infrastructure is healthy.

The DBA uses Atlas monitoring and query-analysis capabilities to identify the inefficient workload and works with developers on indexing and query design.

Managed infrastructure did not remove database performance engineering.`,

      troubleshootingApproach: `1. Identify whether the issue belongs to the Atlas control plane, MongoDB database layer, application or network.

2. Check deployment health.

3. Check metrics.

4. Check alerts.

5. Check application errors.

6. Review queries/indexes.

7. Review connectivity.

8. Review database users and privileges.

9. Review recent Atlas configuration changes.

10. Escalate platform-specific problems through the appropriate support path when required.`,

      commonMistakes: [
        'Assuming Atlas removes all DBA responsibilities.',
        'Confusing Atlas users with MongoDB database users.',
        'Ignoring application query design because infrastructure is managed.',
        'Giving applications excessive database privileges.',
        'Assuming every Atlas capability exists on every deployment tier.'
      ],

      bestPractices: [
        'Understand the shared-responsibility boundary.',
        'Use least privilege.',
        'Monitor workload as well as infrastructure.',
        'Understand the Atlas organization/project model.',
        'Verify feature availability for the actual deployment type.'
      ],

      interviewAnswer: `MongoDB Atlas is MongoDB's managed cloud database platform. Compared with self-managed MongoDB, Atlas handles much of the infrastructure orchestration, deployment lifecycle, monitoring and managed backup capabilities.

However, the DBA still owns important areas such as data modeling, query and index performance, database users, network access, backup policy decisions, monitoring, scaling and application connectivity. Managed MongoDB reduces infrastructure administration; it does not eliminate database administration.`,

      keyTakeaways: [
        'Atlas is managed MongoDB.',
        'Infrastructure responsibility is reduced.',
        'Database and application responsibility remains.',
        'Atlas users and database users are different.',
        'DBA performance skills remain important.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 2,
    question:
      'What are MongoDB Atlas organizations, projects, database deployments, Atlas users, and database users, and how do they relate to each other?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `Atlas has multiple administrative layers.

A useful simplified hierarchy is:

Organization
    |
Project
    |
Database deployment
    |
Databases and collections

Atlas control-plane identities manage Atlas resources.

MongoDB database users authenticate to MongoDB database deployments.

These are separate concepts.`,

      coreConcept: `ORGANIZATION
     |
     +--> PROJECT A
     |      |
     |      +--> deployment
     |
     +--> PROJECT B
            |
            +--> deployment

Atlas access:
controls Atlas resources

Database users:
authenticate to MongoDB`,

      detailedExplanation: `ORGANIZATION

An Atlas organization is a high-level administrative boundary that can contain projects.

It can be used to organize teams, billing and administrative access.

PROJECT

A project groups related Atlas resources.

A project can contain database deployments and associated configuration such as networking, access and monitoring resources.

DATABASE DEPLOYMENT

This is the MongoDB database environment applications connect to.

Depending on Atlas offerings, deployment architecture and terminology can vary.

ATLAS USERS / CONTROL-PLANE IDENTITIES

These identities access Atlas itself.

Their roles determine what they can do in an organization or project.

Examples conceptually include:

• viewing projects
• managing deployments
• managing access
• viewing billing
• administering organization resources.

DATABASE USERS

Database users authenticate to MongoDB.

They receive MongoDB database privileges.

An application might have:

readWrite on appdb

without having any ability to log into the Atlas web interface.

Likewise, a person with Atlas project permissions does not automatically become a MongoDB database user with arbitrary database privileges.

WHY THIS MATTERS

When troubleshooting access, first determine which access layer is failing.

Examples:

Cannot log into Atlas UI
→ control-plane identity issue.

Application receives AuthenticationFailed from MongoDB
→ database authentication issue.

User can open Atlas project but cannot query database
→ Atlas access alone does not prove database credentials exist.`,

      internalWorking: `Human/admin
   |
Atlas identity
   |
Organization/Project
   |
manage deployment


Application
   |
Database user
   |
MongoDB authentication
   |
database operations`,

      architecture: `              ORGANIZATION
                    |
                 PROJECT
                    |
          +---------+---------+
          |                   |
      Atlas access        Deployment
                              |
                         Database user
                              |
                         DB privileges`,

      examples: [
        'A developer may be allowed to view Atlas metrics without having a database user.',
        'An application database user does not need Atlas console access.',
        'Removing a person from an Atlas project is conceptually different from dropping a MongoDB database user.'
      ],

      commands: [
        {
          command:
            'db.runCommand({ connectionStatus: 1 })',
          explanation:
            'Can show authenticated database identities and privileges for the current MongoDB connection, subject to version and authorization.'
        }
      ],

      productionScenario: `A developer says:

"I have Atlas access, but mongosh says Authentication failed."

The DBA verifies that the developer has project-level Atlas access but no corresponding MongoDB database user for the deployment.

The issue is therefore database authentication, not Atlas console authorization.`,

      troubleshootingApproach: `1. Identify whether access is Atlas control-plane access or database access.

2. Identify organization.

3. Identify project.

4. Identify deployment.

5. Check Atlas role if the problem is control-plane access.

6. Check database user if MongoDB authentication fails.

7. Check authSource/auth mechanism where relevant.

8. Check network access.

9. Apply least privilege.

10. Retest.`,

      commonMistakes: [
        'Treating Atlas users and database users as identical.',
        'Giving database privileges to solve an Atlas UI issue.',
        'Giving broad Atlas permissions to solve database authentication.',
        'Not identifying the project boundary.',
        'Using shared human credentials.'
      ],

      bestPractices: [
        'Separate control-plane and data-plane access.',
        'Use least privilege at both layers.',
        'Use dedicated application database users.',
        'Organize projects deliberately.',
        'Audit both Atlas and database access.'
      ],

      interviewAnswer: `Atlas is organized hierarchically around organizations and projects, with database deployments inside projects. Atlas control-plane identities receive organization or project permissions to manage Atlas resources.

MongoDB database users are separate identities used to authenticate to the database itself. When troubleshooting access, I first identify whether the failure is at the Atlas control-plane layer or the MongoDB database-authentication layer.`,

      keyTakeaways: [
        'Organization is a high-level Atlas boundary.',
        'Projects group Atlas resources.',
        'Deployments live within projects.',
        'Atlas access differs from database access.',
        'Troubleshoot the correct identity layer.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 3,
    question:
      'How does network access to a MongoDB Atlas deployment work, and what are IP access lists, VPC/VNet peering, and private endpoints?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `Authentication answers:

Who are you?

Network access answers:

Can your network reach the database endpoint?

Atlas provides multiple connectivity models.

Common concepts include:

• public connectivity controlled by IP access rules
• cloud network peering
• private endpoint technologies.`,

      coreConcept: `APPLICATION
     |
     +--> public route + allowed source
     |
     OR
     |
     +--> private connectivity
             |
             +--> peering
             +--> private endpoint
     |
     v
ATLAS`,

      detailedExplanation: `IP ACCESS LIST

For supported public-access configurations, Atlas network access rules can restrict which source IP addresses or CIDR ranges are allowed to connect.

Authentication is still required.

Allowing an IP does not grant database privileges.

PEERING

Network peering can connect the application's cloud network with the Atlas network using cloud-provider networking.

Routing and DNS architecture must still be correct.

PRIVATE ENDPOINT

Private endpoint technologies allow connectivity through cloud-provider private networking mechanisms rather than exposing the database connection path through a normal public route.

Exact implementation differs across AWS, Azure and Google Cloud.

NETWORK SECURITY IS LAYERED

A secure connection may require:

1. DNS resolution
2. correct route
3. firewall/security rules
4. Atlas network configuration
5. TLS
6. database authentication
7. authorization.

Therefore:

AuthenticationFailed

and:

connection timeout

are very different troubleshooting paths.

0.0.0.0/0

Broad network access may be useful only in tightly controlled temporary circumstances, but it is generally inappropriate as a normal production access policy.

Private connectivity is often preferred for workloads with strict network-security requirements, but the correct design depends on architecture and Atlas capabilities.`,

      internalWorking: `Client
  |
DNS
  |
network route
  |
Atlas network policy
  |
TLS
  |
MongoDB authentication
  |
authorization`,

      architecture: `PUBLIC MODEL

App --> Internet/network --> Atlas endpoint
           |
       source allowed


PRIVATE MODEL

App VPC/VNet
     |
private connectivity
     |
Atlas network`,

      examples: [
        'A valid MongoDB password cannot solve a TCP timeout caused by missing network access.',
        'An IP access-list entry permits network reachability but does not grant readWrite privileges.',
        'Private endpoint configuration can fail because of DNS or cloud-side routing even when MongoDB itself is healthy.'
      ],

      commands: [
        {
          command:
            'mongosh "<Atlas connection string>"',
          explanation:
            'A connection test can expose DNS, network, TLS or authentication errors. Use placeholders rather than exposing credentials.'
        },
        {
          command:
            'nslookup <Atlas-hostname>',
          explanation:
            'Can help inspect DNS resolution from the application environment.'
        }
      ],

      productionScenario: `An application suddenly cannot connect to Atlas after moving to a new NAT gateway.

MongoDB credentials have not changed.

The application now exits through a different public IP that is not permitted by the current Atlas network access configuration.

The DBA updates the network design appropriately rather than resetting the database password.`,

      troubleshootingApproach: `1. Capture exact connection error.

2. Resolve Atlas hostname.

3. Check route/connectivity.

4. Identify client source network/IP.

5. Review Atlas network access.

6. Review peering/private endpoint state where applicable.

7. Validate TLS.

8. Validate database authentication.

9. Validate authorization.

10. Retest from the actual application host.`,

      commonMistakes: [
        'Resetting passwords for a network timeout.',
        'Using unrestricted public access permanently.',
        'Assuming peering automatically fixes DNS.',
        'Ignoring client source-IP changes.',
        'Treating network access as database authorization.'
      ],

      bestPractices: [
        'Prefer least network exposure.',
        'Use private connectivity when architecture requires it.',
        'Document application source networks.',
        'Troubleshoot connectivity layer by layer.',
        'Do not expose credentials while testing.'
      ],

      interviewAnswer: `Atlas network access controls whether clients can reach a deployment. Public connectivity can be restricted using Atlas network access rules, while cloud peering and private endpoints provide private-network connectivity patterns.

I troubleshoot Atlas connectivity in layers: DNS, routing, network policy, TLS, database authentication and finally authorization. An allowed IP provides reachability; it does not provide MongoDB privileges.`,

      keyTakeaways: [
        'Network access and authentication are separate.',
        'IP access lists control allowed network sources.',
        'Peering provides cloud-network connectivity.',
        'Private endpoints provide private connectivity patterns.',
        'Troubleshoot DNS through authorization sequentially.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 4,
    question:
      'What should a MongoDB DBA monitor in Atlas to determine whether a database deployment is healthy?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `There is no single MongoDB health metric.

A DBA should correlate multiple signals.

Important categories include:

• CPU
• memory/cache
• disk/storage
• connections
• operations
• replication
• query latency
• queues/tickets where relevant
• network
• alerts.`,

      coreConcept: `HEALTH

CPU
+
MEMORY
+
DISK
+
CONNECTIONS
+
OPS
+
REPLICATION
+
QUERY LATENCY
+
NETWORK

One metric alone
does not explain the system.`,

      detailedExplanation: `CPU

High CPU can result from:

• inefficient queries
• high operation volume
• aggregation
• index builds
• compression
• background work.

MEMORY

MongoDB relies heavily on memory and WiredTiger cache.

Look for workload pressure rather than simply assuming high memory usage is bad.

DISK

Monitor:

• latency
• IOPS
• throughput
• capacity.

High storage latency can directly affect database response time.

CONNECTIONS

Track:

• current connections
• connection trends
• spikes
• application pool behavior.

OPERATIONS

Understand workload rates:

• reads
• writes
• commands
• deletes
• updates.

REPLICATION

Monitor:

• member health
• lag
• elections
• replication behavior.

QUERY PERFORMANCE

Look for:

• slow operations
• excessive document examination
• inefficient plans
• workload changes.

NETWORK

Network throughput can identify application or data-transfer patterns.

ALERTS

Alerts should provide actionable detection rather than generating constant noise.

CORRELATION

Suppose CPU rises from 30% to 90%.

Do not conclude:

increase cluster size.

First ask:

Did operation rate increase?
Did a query regress?
Did an index disappear?
Did a batch job start?

Monitoring should lead to diagnosis, not automatic scaling.`,

      internalWorking: `Metric
  |
trend
  |
correlate with workload
  |
identify bottleneck
  |
query/infrastructure/application
  |
action`,

      architecture: `             ATLAS METRICS
          /       |        \
        CPU     STORAGE   CONNECTIONS
         |         |          |
         +---- WORKLOAD -------+
                   |
              PERFORMANCE`,

      examples: [
        '90% CPU with a sudden query-volume increase has a different cause from 90% CPU at unchanged traffic.',
        'High memory consumption alone is not proof of a memory problem.',
        'Storage latency can make application queries slow even when CPU is low.'
      ],

      commands: [
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server metrics for deeper database analysis. Many values are cumulative and should be interpreted as rates or deltas.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Provides replica-set state when direct database-level investigation is needed.'
        }
      ],

      productionScenario: `Atlas reports sustained high CPU.

Instead of immediately scaling the deployment, the DBA correlates the CPU graph with operation rates and slow-query information.

A newly deployed application query performs a large scan repeatedly.

After query/index correction, CPU returns to normal without increasing infrastructure size.`,

      troubleshootingApproach: `1. Define incident time.

2. Check CPU.

3. Check memory/cache.

4. Check disk latency.

5. Check connections.

6. Check operation rates.

7. Check replication.

8. Check query performance.

9. Check recent deployments/jobs.

10. Correlate all metrics on the same timeline.`,

      commonMistakes: [
        'Looking at one metric in isolation.',
        'Treating high memory usage as automatically bad.',
        'Scaling before identifying query problems.',
        'Ignoring storage latency.',
        'Ignoring workload-rate changes.'
      ],

      bestPractices: [
        'Use baselines.',
        'Correlate metrics by timestamp.',
        'Monitor workload and infrastructure together.',
        'Investigate trends rather than isolated values.',
        'Make alerts actionable.'
      ],

      interviewAnswer: `In Atlas I monitor CPU, memory and WiredTiger pressure, storage latency and capacity, connections, operation rates, replication, query latency and network behavior.

I correlate these signals rather than diagnosing from one graph. For example, high CPU may indicate legitimate workload growth or an inefficient query, so I compare it with operation rate and query behavior before deciding whether tuning or scaling is appropriate.`,

      keyTakeaways: [
        'MongoDB health is multi-dimensional.',
        'CPU alone is not root cause.',
        'Disk latency matters.',
        'Connections reveal application behavior.',
        'Monitoring requires correlation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 5,
    question:
      'How should MongoDB Atlas alerts be designed, and what makes an alert useful instead of noisy?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `An alert should tell the operations team that something requires attention.

If an alert fires constantly during normal workload, engineers eventually ignore it.

That is alert fatigue.`,

      coreConcept: `Metric
  |
threshold
  |
duration
  |
condition
  |
notification
  |
action

Good alert =
meaningful + actionable`,

      detailedExplanation: `ALERT DESIGN SHOULD CONSIDER:

1. SIGNAL

What condition actually matters?

Examples:

• replication lag
• disk capacity
• CPU pressure
• connection growth
• member unavailable
• backup failure.

2. THRESHOLD

Thresholds should reflect the actual environment.

A threshold appropriate for one deployment may be meaningless for another.

3. DURATION

A one-second spike may not justify an incident.

Sustained abnormal behavior may be more meaningful.

4. SEVERITY

Not every event should wake an on-call engineer.

Separate:

• informational
• warning
• critical

according to operational policy.

5. ROUTING

Send the alert to the team that can act on it.

6. RUNBOOK

The engineer receiving the alert should know:

• what it means
• what to check
• when to escalate.

7. BASELINE

Thresholds should be informed by normal workload patterns.

8. BUSINESS CONTEXT

A temporary CPU spike during an approved batch process may be normal.

The same CPU spike during ordinary traffic may indicate an incident.

Atlas alert options and available conditions evolve, so the exact configuration should be verified against the current Atlas interface/documentation.`,

      internalWorking: `normal baseline
      |
threshold design
      |
alert fires
      |
operator investigates
      |
action/escalation`,

      architecture: `ATLAS METRIC
     |
ALERT RULE
     |
NOTIFICATION
     |
ON-CALL
     |
RUNBOOK
     |
RESPONSE`,

      examples: [
        'A disk-capacity alert should provide enough lead time to act before the volume reaches a critical condition.',
        'An alert that fires every day during a known normal batch window should be redesigned.',
        'Replication-lag alerts should reflect the workload and recovery requirements of the deployment.'
      ],

      commands: [],

      productionScenario: `A team receives high-CPU alerts every night during an approved reporting batch.

Because the alert is considered normal, engineers stop paying attention to it.

Later, a real CPU incident occurs and the alert is initially ignored.

The DBA redesigns thresholds, durations and routing so alerts represent actionable abnormal behavior.`,

      troubleshootingApproach: `1. Identify noisy alerts.

2. Compare with workload baseline.

3. Check threshold.

4. Check duration.

5. Check severity.

6. Check routing.

7. Define runbook.

8. Tune the rule.

9. Observe false-positive rate.

10. Revisit periodically.`,

      commonMistakes: [
        'Using the same thresholds for every deployment.',
        'Alerting on every short spike.',
        'Sending every alert as critical.',
        'Creating alerts without runbooks.',
        'Ignoring alert fatigue.'
      ],

      bestPractices: [
        'Use environment-specific baselines.',
        'Make alerts actionable.',
        'Use appropriate duration.',
        'Define severity and ownership.',
        'Review alert quality regularly.'
      ],

      interviewAnswer: `A useful Atlas alert is actionable, appropriately severe and based on the normal workload of that deployment. I consider the metric, threshold, duration, routing and business context.

I also attach or document a runbook. If an alert fires continuously during healthy operation, I tune it because alert fatigue makes the monitoring system less effective during a real incident.`,

      keyTakeaways: [
        'Alerts must be actionable.',
        'Thresholds should reflect baselines.',
        'Duration prevents transient noise.',
        'Severity and routing matter.',
        'Alert fatigue is an operational risk.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 6,
    question:
      'What is MongoDB Atlas Performance Advisor, and how should a DBA use its index recommendations safely?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `Performance Advisor helps identify inefficient query patterns and can provide index recommendations based on observed workload.

A recommendation is evidence.

It is not an instruction to create every suggested index automatically.`,

      coreConcept: `Observed queries
      |
Performance Advisor
      |
index recommendation
      |
DBA analysis
      |
test
      |
create only if justified`,

      detailedExplanation: `WHY INDEX RECOMMENDATIONS HELP

MongoDB can observe query patterns and identify situations where an index may reduce work.

However, index design has trade-offs.

Every additional index can consume:

• disk
• memory/cache
• write I/O
• maintenance work.

Therefore a DBA should evaluate:

1. QUERY FREQUENCY

Is this query important enough to optimize?

2. LATENCY

Is it actually causing a user-visible or operational problem?

3. DOCUMENTS EXAMINED

Does the query scan far more documents than it returns?

4. EXISTING INDEXES

Could an existing index already support the query?

5. REDUNDANCY

Would the suggested index duplicate or overlap an existing index?

6. WRITE COST

Is the collection write-heavy?

7. SORT

Does the query also need index-supported sorting?

8. SELECTIVITY

How selective are the predicates?

9. ESR

For many compound-index designs, consider equality, sort and range behavior, while remembering real query planning should be validated with explain.

10. TESTING

Use explain and representative workloads.

Do not blindly create indexes in production from recommendations.

Likewise, do not blindly remove an index merely because it does not appear important in a limited observation window.`,

      internalWorking: `Query telemetry
     |
     v
Recommendation
     |
     v
Existing indexes?
     |
Workload?
     |
Write cost?
     |
Explain?
     |
     v
DBA decision`,

      architecture: `APPLICATION QUERY
       |
       v
    MONGODB
       |
query telemetry
       |
       v
PERFORMANCE ADVISOR
       |
 recommendation
       |
       v
 DBA VALIDATION`,

      examples: [
        'Two suggested compound indexes may overlap enough that one carefully designed index can serve both workloads.',
        'A rarely used reporting query may not justify a large index on a write-heavy collection.',
        'A recommendation should be compared with getIndexes() before implementation.'
      ],

      commands: [
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Shows current indexes for comparison with recommendations.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Validates actual execution behavior for the query.'
        }
      ],

      productionScenario: `Performance Advisor recommends a new compound index.

The DBA checks the collection and discovers an existing compound index with nearly the same key pattern.

Instead of immediately creating another index, the DBA analyzes both query shapes and determines whether the existing index can be adjusted or whether the new index is truly justified.

This prevents unnecessary index bloat.`,

      troubleshootingApproach: `1. Identify recommended query.

2. Determine business importance.

3. Check frequency and latency.

4. Examine query shape.

5. Check existing indexes.

6. Check docs/keys examined.

7. Consider sort/range behavior.

8. Estimate write/storage cost.

9. Test with explain.

10. Implement only when justified.

11. Monitor after change.`,

      commonMistakes: [
        'Creating every recommended index.',
        'Ignoring existing indexes.',
        'Ignoring write overhead.',
        'Optimizing rare queries at large storage cost.',
        'Not validating performance afterward.'
      ],

      bestPractices: [
        'Treat recommendations as evidence.',
        'Review query shape.',
        'Check index overlap.',
        'Validate with explain.',
        'Measure after implementation.'
      ],

      interviewAnswer: `Atlas Performance Advisor analyzes observed query behavior and can recommend indexes for inefficient query patterns. I use those recommendations as a starting point, not an automatic change request.

I compare the recommendation with existing indexes, query frequency, documents examined, sorting requirements and write overhead, then validate the proposed design with explain and post-change monitoring.`,

      keyTakeaways: [
        'Performance Advisor can recommend indexes.',
        'Recommendations require DBA review.',
        'Indexes have write and storage cost.',
        'Check existing indexes first.',
        'Validate with explain.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 7,
    question:
      'How should a DBA investigate high CPU in MongoDB Atlas before deciding to scale the deployment?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `High CPU is a symptom.

It does not automatically mean:

the cluster is too small.

First determine what work is consuming CPU.`,

      coreConcept: `HIGH CPU
   |
   +--> workload increased?
   +--> query regression?
   +--> missing index?
   +--> aggregation?
   +--> connection storm?
   +--> maintenance?
   +--> background activity?
   |
   v
optimize OR scale`,

      detailedExplanation: `STEP 1 — TIME WINDOW

Identify exactly when CPU became abnormal.

STEP 2 — WORKLOAD RATE

Check whether:

• reads increased
• writes increased
• command rate increased
• traffic increased.

If workload doubled, higher CPU may be expected.

STEP 3 — QUERY PERFORMANCE

Look for:

• slow queries
• high documents examined
• expensive aggregations
• inefficient sorts
• changed query shapes.

STEP 4 — INDEXES

Check whether:

• expected index exists
• an index was dropped
• a query is performing COLLSCAN
• compound index order is inappropriate.

STEP 5 — APPLICATION RELEASES

Did a new application version deploy at the same time?

STEP 6 — CONNECTION BEHAVIOR

A connection storm can increase work.

STEP 7 — OTHER RESOURCES

Correlate CPU with:

• disk latency
• memory pressure
• network
• operation rate.

STEP 8 — SCALING

Scale when workload legitimately requires more resources or when optimization alone cannot meet requirements.

Scaling can be a correct production action.

The mistake is using it as the first diagnosis for every CPU alert.

Atlas deployment types can expose different metrics and scaling options, so use the capabilities available for the actual deployment.`,

      internalWorking: `CPU graph
   |
same timestamp
   |
   +--> ops graph
   +--> query telemetry
   +--> connections
   +--> disk
   +--> deployment changes
   |
   v
cause`,

      architecture: `          HIGH CPU
             |
       +-----+-----+
       |           |
    workload     inefficient
     growth        work
       |           |
     scale       optimize
       \           /
        \         /
         capacity plan`,

      examples: [
        'CPU rising with unchanged traffic can indicate a query regression.',
        'CPU rising with doubled legitimate workload may indicate a genuine capacity requirement.',
        'Scaling can hide an inefficient query temporarily without fixing its underlying cost.'
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help identify active operations, subject to privileges and version.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Provides evidence about representative query execution.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server counters useful when analyzed as trends or deltas.'
        }
      ],

      productionScenario: `Atlas CPU rises above the team's critical threshold immediately after an application release.

Traffic volume is unchanged.

Performance analysis identifies a new query that repeatedly scans a large collection.

The query is corrected and an appropriate index is introduced after validation.

CPU falls without scaling the deployment.`,

      troubleshootingApproach: `1. Establish incident timestamp.

2. Compare workload rate.

3. Check application deployments.

4. Identify slow/high-work queries.

5. Review indexes.

6. Check connections.

7. Check disk and memory.

8. Determine whether workload growth is legitimate.

9. Optimize where possible.

10. Scale when capacity genuinely requires it.

11. Monitor result.`,

      commonMistakes: [
        'Scaling immediately.',
        'Looking only at CPU percentage.',
        'Ignoring recent application releases.',
        'Creating indexes without identifying query shapes.',
        'Assuming high CPU is always MongoDB infrastructure.'
      ],

      bestPractices: [
        'Correlate metrics by timestamp.',
        'Capture workload baseline.',
        'Optimize inefficient work first where practical.',
        'Scale for legitimate capacity needs.',
        'Validate after remediation.'
      ],

      interviewAnswer: `For high CPU in Atlas, I first identify the time window and correlate CPU with operation rate, application releases, slow-query patterns, indexes, connections, disk and memory.

If workload has legitimately grown beyond capacity, scaling is appropriate. If workload volume is unchanged but a query is scanning far more data, I address the query/index problem first. Scaling is a capacity tool, not a substitute for diagnosis.`,

      keyTakeaways: [
        'High CPU is a symptom.',
        'Correlate CPU with workload.',
        'Check query regressions.',
        'Scaling can be correct but should be evidence-driven.',
        'Baseline comparison is essential.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 8,
    question:
      'How should a DBA investigate high connection counts or sudden connection spikes in MongoDB Atlas?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `Applications normally use MongoDB driver connection pools.

A sudden connection spike may indicate:

• traffic growth
• application restart
• bad pool configuration
• connection leak
• serverless/container scaling
• repeated reconnects
• network instability.`,

      coreConcept: `CONNECTION SPIKE
      |
      +--> more app instances?
      +--> pool too large?
      +--> reconnect storm?
      +--> leak?
      +--> traffic increase?
      +--> network issue?
      |
      v
application + database correlation`,

      detailedExplanation: `CONNECTION POOLING

MongoDB drivers maintain pools so applications do not need to establish a brand-new connection for every request.

TOTAL CONNECTIONS CAN GROW WITH:

application instances
×
pool behavior.

For example, if a deployment suddenly scales from 10 application instances to 100, database connections can rise substantially even if each individual instance behaves correctly.

INVESTIGATION

1. Identify when connections increased.

2. Check application scaling events.

3. Check deployments/restarts.

4. Review driver pool configuration.

5. Look for repeated server-selection or network errors.

6. Determine whether old connections are being released.

7. Check database resource impact.

8. Check whether connection growth coincides with traffic.

9. Verify driver compatibility.

10. Check DNS/network events.

Do not solve every connection spike by simply increasing limits or scaling MongoDB.

The application connection lifecycle should be understood first.`,

      internalWorking: `App instance
    |
driver pool
    |
multiple sockets
    |
MongoDB

More app instances
      x
pool behavior
      =
more connections`,

      architecture: `APP 1 --\
APP 2 ----> connection pools ---> ATLAS
APP 3 --/

Autoscaling apps can multiply
connection pools quickly.`,

      examples: [
        'A Kubernetes deployment scaling from 20 to 200 pods can multiply MongoDB pools.',
        'Creating a new MongoClient for every request can cause excessive connection churn.',
        'A network incident can produce reconnect storms even without traffic growth.'
      ],

      commands: [
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Can provide connection-related server counters, subject to version and privileges.'
        }
      ],

      productionScenario: `Atlas reports a sudden connection increase while request volume changes only slightly.

The DBA correlates the timestamp with an application autoscaling event.

Each new application instance creates its own driver pool.

The application team adjusts pool and autoscaling behavior rather than treating the database as the sole problem.`,

      troubleshootingApproach: `1. Establish spike time.

2. Compare application traffic.

3. Check application instance count.

4. Check restarts/deployments.

5. Review pool configuration.

6. Check network errors.

7. Check reconnect behavior.

8. Check database resource impact.

9. Correct application/network cause.

10. Monitor connection trend.`,

      commonMistakes: [
        'Increasing capacity without checking application pools.',
        'Creating MongoClient per request.',
        'Ignoring autoscaling.',
        'Ignoring reconnect storms.',
        'Looking only at MongoDB and not application metrics.'
      ],

      bestPractices: [
        'Reuse driver clients/pools correctly.',
        'Monitor application instance count.',
        'Correlate connections with traffic.',
        'Use sensible pool configuration.',
        'Investigate sudden changes rather than only absolute values.'
      ],

      interviewAnswer: `For a connection spike in Atlas, I correlate the connection graph with traffic, application instance count, deployments, restarts and network errors. Because each application instance can maintain its own driver pool, autoscaling or poor client lifecycle management can multiply connections quickly.

I review pool settings and reconnect behavior before simply increasing database capacity.`,

      keyTakeaways: [
        'Drivers use connection pools.',
        'Application scaling multiplies pools.',
        'Reconnect storms can create spikes.',
        'Database and application metrics must be correlated.',
        'Do not create a client per request.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 9,
    question:
      'How do MongoDB Atlas backups and point-in-time recovery work conceptually, and what should a DBA validate before depending on them for production recovery?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Atlas provides managed backup capabilities for supported deployment configurations.

Depending on the deployment and backup configuration, recovery capabilities can include snapshots and point-in-time recovery.

A backup feature is useful only if the organization understands how to restore from it.`,

      coreConcept: `Production data
      |
managed backup
      |
snapshots
      |
continuous recovery history
where configured/supported
      |
restore
      |
validation`,

      detailedExplanation: `SNAPSHOT

A snapshot represents recoverable database state associated with a point in time according to the backup system.

POINT-IN-TIME RECOVERY

PITR aims to recover to a more precise point within the available recovery window rather than only to a scheduled snapshot boundary.

Exact Atlas backup architecture, retention, supported restore targets and PITR behavior depend on current Atlas product capabilities and deployment type.

DBA RESPONSIBILITY

Even with managed backup, the DBA should define:

• retention requirements
• RPO
• RTO
• restore ownership
• restore testing
• security/access
• regional considerations
• cost.

RESTORE TEST

A backup should be periodically restored into an isolated or approved recovery environment.

Then validate:

• databases
• collections
• indexes
• critical records
• application compatibility.

DO NOT CONFUSE

Backup success

with:

recovery success.

A green backup status proves that a backup operation completed according to the service.

It does not prove your team can meet its business RTO until restoration is tested.

PITR also does not automatically determine the correct business recovery timestamp.

The DBA must identify the desired recovery point based on incident evidence.`,

      internalWorking: `Live cluster
    |
    +--> snapshot history
    |
    +--> PITR history
         where supported/configured
    |
    v
restore request
    |
    v
recovered environment
    |
    v
validation`,

      architecture: `         ATLAS DEPLOYMENT
               |
          BACKUP SYSTEM
          /          \
     snapshots      PITR
                      |
                 restore point
          \          /
           \        /
             RESTORE`,

      examples: [
        'A restore drill can reveal that the backup exists but the team does not know the application cutover procedure.',
        'The required recovery timestamp should be chosen before destructive corruption, not simply the latest possible timestamp.',
        'Backup retention should be aligned with business requirements.'
      ],

      commands: [],

      productionScenario: `An application accidentally deletes important production data.

The team has Atlas backup and PITR capabilities configured.

The DBA determines the last known good point before the deletion, restores to an isolated target, validates the recovered data and then follows the approved data/application recovery procedure.

The production cluster is not blindly overwritten without validation.`,

      troubleshootingApproach: `1. Determine incident timestamp.

2. Determine desired recovery point.

3. Check available backup/PITR window.

4. Choose restore method.

5. Restore safely.

6. Validate recovered data.

7. Validate indexes.

8. Validate application behavior.

9. Plan production cutover/reconciliation.

10. Document actual RPO/RTO achieved.`,

      commonMistakes: [
        'Never testing restore.',
        'Assuming backup success proves RTO.',
        'Selecting a recovery timestamp without incident analysis.',
        'Restoring directly over production without a safe plan.',
        'Ignoring retention requirements.'
      ],

      bestPractices: [
        'Perform regular restore drills.',
        'Define RPO and RTO.',
        'Validate restored data.',
        'Document recovery runbooks.',
        'Review retention periodically.'
      ],

      interviewAnswer: `Atlas provides managed backup capabilities, including snapshot and point-in-time recovery options for supported configurations. I treat them as recovery tools, not as a replacement for DR planning.

I define retention, RPO and RTO, perform restore drills, validate the restored data and application, and ensure the team knows how to select the correct recovery point and cut the application over safely.`,

      keyTakeaways: [
        'Managed backup still requires recovery planning.',
        'PITR provides finer recovery points where supported.',
        'Restore testing is essential.',
        'RPO/RTO must be defined.',
        'Validate before production recovery.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 10,
    question:
      'How should a DBA approach MongoDB Atlas scaling, and what is the difference between solving a performance problem by optimization versus adding capacity?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `Scaling adds capacity.

Optimization reduces unnecessary work.

Sometimes you need one.

Sometimes you need both.`,

      coreConcept: `PERFORMANCE ISSUE
       |
       v
Is work inefficient?
    /       \
  yes        no
   |          |
optimize   Is capacity
           exhausted?
              |
             yes
              |
            scale

Real systems may require both.`,

      detailedExplanation: `VERTICAL CAPACITY

Increasing deployment resources can provide more CPU, memory or storage capability depending on Atlas deployment options.

HORIZONTAL SCALE

For workloads that require it, MongoDB sharding can distribute data and workload across shards.

Atlas can manage sharded deployments, but shard-key and workload design remain important DBA responsibilities.

OPTIMIZATION

Before scaling, investigate whether the workload performs unnecessary work.

Examples:

• COLLSCAN
• poor compound index
• inefficient aggregation
• excessive returned data
• connection misuse.

CAPACITY

Optimization cannot remove legitimate workload growth.

Suppose a well-indexed workload grows from:

10,000 operations/sec

to:

100,000 operations/sec.

Even efficient operations require CPU, memory, storage and network resources.

Scaling may therefore be correct.

COST

Atlas scaling decisions also have financial impact.

A DBA should understand whether additional resources solve a genuine capacity requirement or simply hide inefficient workload behavior.

AUTO-SCALING

Atlas provides automated scaling capabilities for supported deployment configurations.

Exact behavior and options vary by Atlas deployment type and current service features.

Even with automation, workload monitoring remains necessary.`,

      internalWorking: `Demand
  |
  +--> unnecessary work
  |       |
  |    optimize
  |
  +--> legitimate growth
          |
        scale
          |
     monitor cost/performance`,

      architecture: `         APPLICATION
              |
           WORKLOAD
              |
       +------+------+
       |             |
 inefficient      legitimate
    work           demand
       |             |
   optimize        capacity
                     |
                   scale`,

      examples: [
        'Adding CPU can temporarily hide an expensive collection scan.',
        'A well-indexed workload can still outgrow its current hardware.',
        'Sharding should not be introduced merely to compensate for a missing index.'
      ],

      commands: [
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Helps distinguish query inefficiency from pure capacity pressure.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides database metrics that can complement Atlas monitoring when interpreted correctly.'
        }
      ],

      productionScenario: `An Atlas deployment repeatedly reaches high CPU during peak hours.

Analysis shows the major queries are appropriately indexed and operation volume has grown several times over the original capacity plan.

The DBA concludes that this is genuine workload growth and scales the deployment.

In another environment, high CPU is caused by one repeated collection scan, so query optimization is performed instead.

The same symptom can require different solutions.`,

      troubleshootingApproach: `1. Establish baseline.

2. Measure workload growth.

3. Identify high-cost queries.

4. Review indexes.

5. Check CPU.

6. Check memory/cache.

7. Check storage.

8. Check connections.

9. Determine inefficiency versus capacity.

10. Optimize, scale or do both.

11. Measure performance afterward.

12. Review cost impact.`,

      commonMistakes: [
        'Scaling every performance issue.',
        'Refusing to scale even when workload genuinely grows.',
        'Introducing sharding before understanding the workload.',
        'Ignoring cost.',
        'Assuming auto-scaling removes capacity planning.'
      ],

      bestPractices: [
        'Optimize unnecessary work.',
        'Scale for legitimate demand.',
        'Use workload baselines.',
        'Measure after scaling.',
        'Include cost in capacity planning.'
      ],

      interviewAnswer: `I separate optimization from capacity planning. Optimization removes unnecessary work such as scans, inefficient indexes or poor application behavior. Scaling adds resources when an efficient workload legitimately exceeds current capacity.

In Atlas I correlate query behavior with CPU, memory, storage, connections and workload growth before scaling. If the workload is inefficient, adding capacity may only hide the problem. If the workload is already efficient and demand has grown, scaling is the correct solution.`,

      keyTakeaways: [
        'Optimization and scaling solve different problems.',
        'Efficient workloads can still outgrow capacity.',
        'Scaling can hide inefficient queries.',
        'Sharding requires workload design.',
        'Capacity decisions should include cost.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 11,
    question:
      'How should an L3 DBA investigate replication lag, elections, and replica-set instability in MongoDB Atlas?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `Atlas manages much of the replica-set infrastructure, but the DBA still needs to understand MongoDB replication.

Three important symptoms are:

• replication lag
• elections
• unhealthy or unavailable members.

Replication lag means a secondary is behind the primary.

An election means the replica set selected a primary.

Neither event should be analyzed in isolation.`,

      coreConcept: `PRIMARY
   |
   | oplog
   v
SECONDARY
   |
apply operations

If secondary cannot keep up:

PRIMARY -----> SECONDARY
 latest         behind

Possible causes:

• heavy writes
• storage latency
• resource pressure
• network problems
• long operations
• maintenance/events`,

      detailedExplanation: `REPLICATION LAG

A secondary continuously processes replication operations originating from the primary.

Lag can develop when the secondary cannot apply operations fast enough.

Possible causes include:

• unusually high write workload
• storage latency
• CPU pressure
• resource contention
• network issues
• long-running operations
• maintenance activity
• member-specific problems.

ELECTIONS

An election is not automatically an incident.

MongoDB elections are part of normal high-availability behavior.

However, repeated unexpected elections require investigation.

The DBA should correlate:

• election timestamps
• member state
• application errors
• resource metrics
• maintenance events
• connectivity events.

APPLICATION IMPACT

During primary transitions, applications should use supported MongoDB drivers and appropriate connection strings so they can discover the new primary.

Applications that incorrectly connect to one hard-coded host can experience unnecessary outages.

ATLAS CONTEXT

Atlas manages deployment orchestration, but database-level replication concepts still apply.

The exact metrics, event names and operational controls exposed by Atlas depend on the deployment type and current Atlas capabilities.`,

      internalWorking: `Write
  |
PRIMARY
  |
oplog
  |
SECONDARY fetch/apply
  |
lag metric

Election:
PRIMARY unavailable/change
        |
eligible members vote
        |
new PRIMARY`,

      architecture: `              APPLICATION
                   |
             Replica Set
          /        |        \
      PRIMARY   SECONDARY  SECONDARY
         |
       oplog
         |
    replication

Monitor:
lag + state + elections + resources`,

      examples: [
        'A temporary election during planned maintenance may be expected.',
        'Repeated elections every few minutes are not normal and require investigation.',
        'Replication lag that correlates with storage latency points toward a different cause than lag caused by a sudden write spike.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows replica-set member states and topology information when available to the connected user.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Can provide a convenient view of secondary replication delay from mongosh, subject to version and topology.'
        },
        {
          command:
            'db.serverStatus().repl',
          explanation:
            'Provides replication-related server information where available.'
        }
      ],

      productionScenario: `Atlas reports replication lag followed by an election.

The DBA establishes the incident timeline and sees that storage latency increased sharply on the affected period while write volume also rose.

Instead of concluding that "replication is broken," the DBA correlates storage, workload and member events.

After the underlying pressure subsides or capacity is corrected, replication catches up and topology stabilizes.`,

      troubleshootingApproach: `1. Establish exact incident timestamp.

2. Identify current primary.

3. Check member health.

4. Measure replication lag.

5. Check election/event history.

6. Check write workload.

7. Check CPU.

8. Check storage latency.

9. Check network-related events.

10. Check application errors.

11. Check maintenance or configuration events.

12. Determine whether the event was expected, transient or recurring.

13. Escalate Atlas infrastructure-specific issues when evidence indicates a managed-platform problem.`,

      commonMistakes: [
        'Treating every election as a failure.',
        'Looking only at replication lag without checking storage.',
        'Ignoring application connection behavior.',
        'Assuming Atlas means replication knowledge is unnecessary.',
        'Changing application settings before establishing the timeline.'
      ],

      bestPractices: [
        'Correlate lag with workload and infrastructure metrics.',
        'Track election frequency.',
        'Use replica-set-aware drivers.',
        'Maintain an incident timeline.',
        'Distinguish expected maintenance events from instability.'
      ],

      interviewAnswer: `For Atlas replication issues, I first establish the timeline and inspect member health, lag and elections. Then I correlate them with write volume, CPU, storage latency, network events, maintenance and application errors.

An election itself is a normal MongoDB HA mechanism. My concern is unexpected frequency or business impact. For lag, I determine why a secondary cannot apply operations fast enough rather than treating the lag value itself as the root cause.`,

      keyTakeaways: [
        'Replication lag is a symptom.',
        'Elections are part of MongoDB HA.',
        'Repeated unexpected elections require investigation.',
        'Storage and workload must be correlated.',
        'Applications should be replica-set aware.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 12,
    question:
      'How should an L3 DBA investigate storage pressure, disk latency, and rapidly growing storage in MongoDB Atlas?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Storage problems are not limited to:

"disk is almost full."

A MongoDB storage investigation should consider:

• capacity
• latency
• IOPS
• throughput
• data growth
• index growth
• temporary workload
• backup/operational requirements.

A disk can have plenty of free space and still be a performance bottleneck because of latency.`,

      coreConcept: `STORAGE HEALTH

Capacity
   +
Latency
   +
IOPS
   +
Throughput
   +
Growth rate

          |
          v

MongoDB performance`,

      detailedExplanation: `CAPACITY

Determine:

• current storage usage
• historical growth rate
• projected exhaustion date.

DATA VS INDEXES

Collection growth and index growth should be investigated separately.

A workload may create:

• rapidly increasing documents
• oversized documents
• unnecessary indexes
• temporary collections
• retained historical data.

LATENCY

Storage latency can directly increase query and write response times.

High latency can also contribute to:

• checkpoint pressure
• replication lag
• slower index builds
• increased operation latency.

IOPS AND THROUGHPUT

A workload may reach storage performance limits before reaching capacity limits.

This is why:

50% disk used

does not mean:

storage is healthy.

GROWTH ANALYSIS

Ask:

What changed?

Examples:

• application release
• new logging/audit workload
• TTL failure
• retention-policy change
• bulk import
• index creation
• document-size increase.

ATLAS

Atlas storage behavior and scaling options depend on deployment configuration, provider and current product capabilities.

Do not assume every Atlas deployment has identical storage limits or auto-scaling behavior.`,

      internalWorking: `Application workload
        |
     MongoDB
        |
 WiredTiger/storage
        |
 cloud storage
        |
 latency/IOPS/throughput

Pressure can propagate upward
to application latency.`,

      architecture: `             MONGODB
          /             \
       DATA             INDEXES
          \             /
             STORAGE
          /    |     \
      capacity IOPS latency
               |
          performance`,

      examples: [
        'A collection can grow rapidly because a TTL index is missing or ineffective.',
        'A deployment can have 40% free storage but still suffer from high disk latency.',
        'Several large redundant indexes can materially increase storage usage.'
      ],

      commands: [
        {
          command:
            'db.collection.stats()',
          explanation:
            'Provides collection and storage statistics; exact fields and behavior vary by MongoDB version.'
        },
        {
          command:
            'db.stats()',
          explanation:
            'Provides database-level statistics useful for capacity analysis.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Shows indexes so index footprint and redundancy can be investigated.'
        }
      ],

      productionScenario: `Atlas storage grows much faster than its historical baseline.

The DBA compares collection statistics and discovers that a high-volume event collection has stopped expiring old records because the expected retention mechanism is no longer functioning as designed.

Instead of merely increasing storage indefinitely, the DBA fixes the retention issue, validates data requirements and then reassesses capacity.`,

      troubleshootingApproach: `1. Determine current capacity usage.

2. Calculate growth trend.

3. Identify largest databases/collections.

4. Check index footprint.

5. Review recent data-volume changes.

6. Review retention/TTL behavior.

7. Check disk latency.

8. Check IOPS/throughput.

9. Correlate with query and replication latency.

10. Review recent imports/index builds.

11. Determine whether scaling, cleanup, schema correction or workload tuning is required.

12. Monitor after remediation.`,

      commonMistakes: [
        'Looking only at percentage free.',
        'Deleting data without business approval.',
        'Dropping indexes solely because they are large.',
        'Ignoring storage latency.',
        'Waiting until storage is nearly exhausted before capacity planning.'
      ],

      bestPractices: [
        'Track growth trends.',
        'Forecast capacity.',
        'Monitor latency as well as space.',
        'Review index footprint.',
        'Validate retention policies.'
      ],

      interviewAnswer: `For Atlas storage issues I separate capacity from performance. I check storage usage and growth rate, then identify which collections and indexes are consuming space. I also correlate disk latency, IOPS and throughput with query latency and replication.

If storage growth is abnormal, I look for application changes, retention failures, bulk loads or index growth. The solution may be scaling, but it may instead be retention correction, index cleanup or workload optimization.`,

      keyTakeaways: [
        'Storage health is more than free space.',
        'Latency can be critical.',
        'Track data and index growth.',
        'Forecast exhaustion before it becomes urgent.',
        'Find the cause of abnormal growth.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 13,
    question:
      'Atlas shows increased query latency, but CPU and memory do not appear saturated. How would an L3 DBA investigate the problem?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `Slow queries do not require high CPU.

Latency can come from many places:

• storage
• query plan
• locks/contention
• network
• application behavior
• large result sets
• replication/read preference
• external dependencies.

Therefore:

low CPU

does not prove:

MongoDB is fast.`,

      coreConcept: `HIGH LATENCY
     |
     +--> query plan
     +--> storage latency
     +--> contention
     +--> network
     +--> large results
     +--> app pool
     +--> topology/read preference
     |
     v
correlation`,

      detailedExplanation: `QUERY PLAN

Check whether the query:

• uses an appropriate index
• performs COLLSCAN
• examines excessive keys/documents
• performs expensive sort
• returns excessive data.

STORAGE

A query may spend significant time waiting for storage even when CPU remains moderate.

NETWORK

Application-observed latency includes more than server execution time.

The path may include:

application
→ DNS
→ network
→ TLS
→ MongoDB
→ network
→ application.

RESULT SIZE

A query that returns a very large result may spend time transferring and decoding data.

CONNECTION POOL

Application requests may wait for a connection from the driver pool.

This can look like database latency from the application's perspective.

TOPOLOGY

Read preference and replica health can affect where operations are routed.

TIMELINE

Compare:

• Atlas query metrics
• application latency
• storage latency
• operation rates
• deployment changes.

The important L3 skill is separating:

server execution latency

from:

end-to-end application latency.`,

      internalWorking: `Application request
       |
pool wait?
       |
network
       |
MongoDB query
       |
storage/query plan
       |
result transfer
       |
application

Total latency =
multiple components`,

      architecture: `APP
 |
 | network
 v
DRIVER POOL
 |
 v
ATLAS
 |
 +--> query planner
 +--> indexes
 +--> storage
 |
 v
RESULT`,

      examples: [
        'A query can be slow because storage latency increased while CPU remains low.',
        'Application latency can rise because requests wait for a connection pool even when MongoDB execution time is healthy.',
        'Returning tens of thousands of documents can create network and deserialization latency.'
      ],

      commands: [
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Used to inspect representative query execution and plan behavior.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect active operations and waiting behavior, subject to privileges and version.'
        }
      ],

      productionScenario: `Application response time doubles.

Atlas CPU remains around its normal baseline.

The DBA checks storage metrics and finds a large increase in disk latency during the same period.

Query plans have not changed.

The root cause is therefore storage-side latency rather than CPU saturation.`,

      troubleshootingApproach: `1. Establish exact slow period.

2. Compare application and database latency.

3. Identify affected query shapes.

4. Run explain on representative queries.

5. Check docs/keys examined.

6. Check storage latency.

7. Check connection behavior.

8. Check network path.

9. Check result sizes.

10. Check read preference/topology.

11. Check recent deployments.

12. Correlate before deciding remediation.`,

      commonMistakes: [
        'Assuming low CPU means no database issue.',
        'Looking only at application response time.',
        'Ignoring result-set size.',
        'Ignoring driver pool wait time.',
        'Creating indexes without checking execution plans.'
      ],

      bestPractices: [
        'Separate server latency from end-to-end latency.',
        'Use explain.',
        'Correlate storage metrics.',
        'Monitor application pools.',
        'Compare metrics on one timeline.'
      ],

      interviewAnswer: `If Atlas query latency increases without CPU or memory saturation, I investigate other latency sources. I identify affected query shapes and check explain output, storage latency, connection-pool behavior, network latency, result size and topology/read preference.

I specifically separate MongoDB execution time from total application response time because the bottleneck may be outside CPU entirely.`,

      keyTakeaways: [
        'Slow queries do not require high CPU.',
        'Storage latency matters.',
        'Application latency includes pool and network time.',
        'Explain is essential.',
        'Use timeline correlation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 14,
    question:
      'How would an L3 DBA validate a MongoDB Atlas Performance Advisor recommendation before creating a production index?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `Performance Advisor can identify useful index opportunities.

But an L3 DBA asks:

Will this index improve the important workload enough to justify its cost?`,

      coreConcept: `Recommendation
      |
query shape
      |
existing indexes
      |
selectivity/sort/range
      |
read benefit
      |
write/storage cost
      |
test
      |
decision`,

      detailedExplanation: `STEP 1 — IDENTIFY QUERY SHAPE

Understand:

• filter
• sort
• projection
• frequency
• latency.

STEP 2 — CHECK EXISTING INDEXES

Use getIndexes().

Look for:

• exact duplicate
• prefix overlap
• similar compound indexes
• obsolete indexes.

STEP 3 — EXPLAIN CURRENT QUERY

Inspect:

• winning plan
• execution time
• totalDocsExamined
• totalKeysExamined
• nReturned.

STEP 4 — COMPOUND KEY DESIGN

Consider equality, sort and range characteristics.

ESR is a useful design guideline, not a substitute for testing.

STEP 5 — WRITE COST

Every additional index must be maintained during writes.

STEP 6 — STORAGE/CACHE COST

Indexes consume disk and can compete for cache.

STEP 7 — WORKLOAD IMPORTANCE

A query executed once per month may not justify the same optimization cost as a query executed thousands of times per minute.

STEP 8 — TEST

Where operationally appropriate, validate using representative data/workload and MongoDB-supported index testing approaches for the actual version.

STEP 9 — CHANGE CONTROL

Production index creation should follow operational procedures.

STEP 10 — POST-CHANGE VALIDATION

Confirm that the intended query uses the index and that overall workload improves.`,

      internalWorking: `PA recommendation
      |
      v
Current plan
      |
existing indexes
      |
workload frequency
      |
cost/benefit
      |
test
      |
production change
      |
monitor`,

      architecture: `QUERY
  |
PERFORMANCE ADVISOR
  |
suggestion
  |
DBA
 / | \
plan indexes workload
 \ | /
decision
  |
production`,

      examples: [
        'A recommendation may overlap heavily with an existing compound index.',
        'A read optimization may hurt a write-heavy workload if too many indexes are added.',
        'An index that improves one query can still be unjustified if the query is extremely rare.'
      ],

      commands: [
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Review existing indexes before adding another.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Measure current execution behavior.'
        },
        {
          command:
            'db.collection.createIndex({ fieldA: 1, fieldB: 1 })',
          explanation:
            'Generic example only. Production key order must be based on the actual query workload and tested before implementation.'
        }
      ],

      productionScenario: `Performance Advisor recommends:

{ customerId: 1, createdAt: -1 }

The DBA finds an existing index:

{ customerId: 1, createdAt: -1, status: 1 }

Before creating another index, the DBA tests whether the existing index adequately serves the important query shapes.

This avoids blindly creating overlapping indexes.`,

      troubleshootingApproach: `1. Capture query shape.

2. Check frequency.

3. Check current latency.

4. Run explain.

5. Review existing indexes.

6. Evaluate compound ordering.

7. Evaluate write impact.

8. Evaluate storage impact.

9. Test.

10. Implement through change control.

11. Re-run explain.

12. Monitor workload after change.`,

      commonMistakes: [
        'Treating recommendations as mandatory.',
        'Creating overlapping indexes.',
        'Ignoring write cost.',
        'Ignoring query frequency.',
        'Not validating after creation.'
      ],

      bestPractices: [
        'Measure before and after.',
        'Review the entire index portfolio.',
        'Optimize important workload.',
        'Use explain evidence.',
        'Control index growth.'
      ],

      interviewAnswer: `I validate a Performance Advisor recommendation by examining the query shape, frequency and current execution plan, then comparing the suggested key pattern with existing indexes.

I evaluate read benefit against write, storage and cache cost. After testing, I create the index through normal change control and confirm with explain and monitoring that it actually improves the intended workload.`,

      keyTakeaways: [
        'Recommendations require validation.',
        'Check overlap first.',
        'Measure query importance.',
        'Indexes have operational cost.',
        'Validate after implementation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 15,
    question:
      'How should an L3 DBA design an end-to-end MongoDB Atlas monitoring and operational-readiness strategy for production?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Monitoring is not simply enabling alerts.

A production monitoring strategy should answer:

Is the service available?

Is it fast?

Is data protected?

Is capacity sufficient?

Is replication healthy?

Can we recover?

Are security controls functioning?`,

      coreConcept: `MONITORING STRATEGY

Availability
Performance
Capacity
Replication
Backup
Security
Application
Cost

      |
      v
Alerts + dashboards + runbooks
      |
      v
Operational response`,

      detailedExplanation: `AVAILABILITY

Monitor deployment/member availability and application connectivity.

PERFORMANCE

Monitor:

• latency
• CPU
• memory/cache
• disk latency
• query behavior.

CAPACITY

Monitor:

• storage growth
• connection growth
• workload growth
• scaling trends.

REPLICATION

Monitor:

• lag
• member health
• unexpected elections.

BACKUP

Monitor:

• backup status
• retention
• restore readiness.

SECURITY

Monitor relevant access and security events according to the capabilities and policies available in the deployment.

APPLICATION

Database metrics without application metrics provide only half the picture.

Correlate:

• API latency
• errors
• connection pools
• deployments
• traffic.

RUNBOOKS

Every important alert should answer:

What should the on-call engineer check first?

BASELINES

Understand:

normal CPU
normal latency
normal connections
normal operation rate
normal storage growth.

Without a baseline, an engineer cannot reliably distinguish unusual behavior from normal peaks.

RECOVERY DRILLS

Monitoring should include operational readiness:

Can the team restore?

Can the team respond to an election?

Can the team troubleshoot connectivity?

Monitoring is ultimately a production operations discipline, not merely a dashboard.`,

      internalWorking: `Metrics/events
      |
dashboards
      |
alert rules
      |
on-call
      |
runbook
      |
diagnosis
      |
remediation
      |
post-incident improvement`,

      architecture: `       APPLICATION METRICS
               |
               v
          ATLAS METRICS
       /    |    |     \
     CPU  DISK  REPL  QUERY
       \    |    |     /
          ALERTING
             |
          ON-CALL
             |
          RUNBOOK`,

      examples: [
        'A high-CPU alert without a query-analysis runbook provides limited operational value.',
        'Storage alerts should fire early enough for capacity action.',
        'Backup monitoring should be complemented by actual restore testing.'
      ],

      commands: [
        {
          command:
            'db.serverStatus()',
          explanation:
            'Useful for deeper server-level investigation alongside Atlas metrics.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Useful for active-operation investigation when authorized.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Useful when investigating replica-set state.'
        }
      ],

      productionScenario: `A company has many Atlas dashboards but no defined alert ownership or recovery procedures.

During an incident, several teams see the alerts but nobody knows who should act.

The DBA redesigns monitoring around service objectives, alert ownership, escalation paths and runbooks.

The monitoring platform becomes operationally useful rather than merely visually impressive.`,

      troubleshootingApproach: `1. Define critical services.

2. Define availability objectives.

3. Establish baselines.

4. Define performance metrics.

5. Define capacity metrics.

6. Define replication metrics.

7. Define backup/recovery monitoring.

8. Define security monitoring.

9. Correlate application telemetry.

10. Configure actionable alerts.

11. Assign ownership.

12. Create runbooks.

13. Test incident procedures.

14. Review continuously.`,

      commonMistakes: [
        'Building dashboards without runbooks.',
        'Monitoring MongoDB but not applications.',
        'Using identical thresholds everywhere.',
        'Ignoring backup recovery readiness.',
        'Having alerts without ownership.'
      ],

      bestPractices: [
        'Monitor service outcomes and database internals.',
        'Maintain baselines.',
        'Use actionable alerts.',
        'Document ownership.',
        'Test recovery and incident procedures.'
      ],

      interviewAnswer: `My Atlas monitoring strategy covers availability, performance, capacity, replication, backups, security and application behavior. I establish normal baselines, create actionable alerts and correlate Atlas metrics with application telemetry.

Every critical alert should have ownership and a runbook. I also include restore drills and incident exercises because operational readiness is part of monitoring, not separate from it.`,

      keyTakeaways: [
        'Monitoring is an operational system.',
        'Baselines are essential.',
        'Application correlation matters.',
        'Alerts need ownership and runbooks.',
        'Recovery readiness must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 16,
    question:
      'An application suddenly cannot connect to MongoDB Atlas through a private endpoint even though the database deployment appears healthy. How would you troubleshoot it?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `A healthy MongoDB deployment does not prove that an application can reach it.

Private connectivity introduces several layers:

• DNS
• cloud networking
• private endpoint
• routing
• firewall/security controls
• TLS
• MongoDB authentication.`,

      coreConcept: `APP
 |
DNS
 |
PRIVATE ENDPOINT
 |
CLOUD NETWORK
 |
ATLAS
 |
TLS
 |
AUTH

Failure can occur
at any layer.`,

      detailedExplanation: `FIRST — CAPTURE THE ERROR

Different errors suggest different layers.

Examples:

timeout
→ network/routing/firewall.

hostname resolution failure
→ DNS.

certificate validation error
→ TLS.

AuthenticationFailed
→ MongoDB credentials/authentication.

Unauthorized
→ authentication succeeded but privilege is insufficient.

DNS

Private endpoint architectures often depend on specific DNS behavior.

Check resolution from the actual application environment.

NETWORK

Check:

• route
• security rules
• firewall
• endpoint state
• cloud-side configuration.

ATLAS

Check private endpoint configuration and associated project/deployment state.

TLS

Ensure the application connects using the expected hostname and validates the appropriate certificate chain.

AUTHENTICATION

Only after transport connectivity succeeds should database authentication become the primary focus.

CHANGE CORRELATION

Ask whether anything changed:

• DNS
• VPC/VNet
• endpoint
• route tables
• firewall
• application environment
• Atlas configuration.

Do not rotate database passwords simply because the application cannot establish a network connection.`,

      internalWorking: `Error
 |
classify
 |
 +--> DNS
 +--> TCP/network
 +--> TLS
 +--> authentication
 +--> authorization
 |
test layer
 |
identify failure`,

      architecture: `APPLICATION NETWORK
        |
        v
PRIVATE DNS
        |
        v
PRIVATE ENDPOINT
        |
        v
ATLAS NETWORK
        |
        v
MONGODB`,

      examples: [
        'A DNS change can break private endpoint resolution while Atlas remains healthy.',
        'A TCP timeout should not initially be treated as a password issue.',
        'A certificate hostname error indicates that network connectivity may already be working.'
      ],

      commands: [
        {
          command:
            'nslookup <Atlas-hostname>',
          explanation:
            'Check DNS resolution from the affected environment.'
        },
        {
          command:
            'mongosh "<Atlas connection string>"',
          explanation:
            'Test connectivity from the affected host using protected credentials and the supported connection string.'
        }
      ],

      productionScenario: `Applications in one cloud subnet stop connecting to Atlas while applications in another subnet remain healthy.

Atlas deployment health is normal.

DNS investigation shows the affected subnet is no longer using the expected private DNS configuration.

The DBA and cloud-network team correct the DNS path instead of making unnecessary MongoDB user changes.`,

      troubleshootingApproach: `1. Capture exact application error.

2. Test from affected host/container.

3. Resolve Atlas hostname.

4. Check private DNS behavior.

5. Check endpoint status.

6. Check routes.

7. Check firewall/security rules.

8. Validate TLS.

9. Validate database authentication.

10. Validate authorization.

11. Compare working and failing environments.

12. Review recent network/configuration changes.`,

      commonMistakes: [
        'Resetting credentials for a timeout.',
        'Testing only from a DBA laptop instead of the application environment.',
        'Ignoring DNS.',
        'Assuming healthy Atlas metrics prove network connectivity.',
        'Bypassing TLS validation to hide a network/certificate design problem.'
      ],

      bestPractices: [
        'Troubleshoot layer by layer.',
        'Test from the real application environment.',
        'Document private DNS architecture.',
        'Avoid insecure TLS bypasses.',
        'Correlate with network changes.'
      ],

      interviewAnswer: `For a private-endpoint connectivity failure, I classify the exact error first and troubleshoot sequentially through DNS, endpoint state, routing, firewall/security rules, TLS, authentication and authorization.

I test from the actual application environment because a successful connection from another network does not prove the application's private path works. I also compare recent network and Atlas configuration changes around the incident time.`,

      keyTakeaways: [
        'Healthy database does not prove healthy network.',
        'DNS is critical for private connectivity.',
        'Classify the error first.',
        'Test from the affected environment.',
        'Do not confuse network and authentication failures.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 17,
    question:
      'A production Atlas deployment experiences a sudden latency spike immediately after an application release. How would you investigate and determine whether the release caused the database problem?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `Timing creates a hypothesis.

It does not automatically prove causation.

If latency increases immediately after a release, the release is a strong suspect, but the DBA should prove the relationship using workload evidence.`,

      coreConcept: `APP RELEASE
    |
    v
latency spike
    |
compare before/after
    |
query shapes
ops rate
connections
CPU
disk
    |
    v
causal evidence`,

      detailedExplanation: `BUILD THE TIMELINE

Record:

T0 = application release
T1 = database metric change
T2 = user-visible impact.

COMPARE BEFORE AND AFTER

Check:

• operation rate
• query shapes
• query latency
• documents examined
• connections
• CPU
• storage latency.

NEW QUERY SHAPE

A release may introduce:

• missing-index query
• new aggregation
• larger result set
• unbounded query
• N+1 query pattern.

CONNECTION BEHAVIOR

The release may also change:

• pool size
• MongoClient lifecycle
• retry behavior
• application instance count.

DATA CHANGE

A new application version may begin writing significantly larger documents or additional records.

ROLLBACK

If business procedures allow and evidence strongly points to the release, application rollback can be an effective mitigation.

However, preserve enough evidence for root-cause analysis.

DO NOT ASSUME

The release may coincide with:

• cloud/network issue
• workload peak
• maintenance
• unrelated batch process.

Correlation should be tested.`,

      internalWorking: `Before release
baseline
   |
release
   |
After release
   |
compare:
queries
ops
connections
resources
   |
root cause`,

      architecture: `APPLICATION
   |
 release
   |
 changed workload
   |
ATLAS
   |
metrics + query behavior
   |
DBA correlation`,

      examples: [
        'A release may introduce a query missing the tenantId predicate and dramatically increase documents examined.',
        'A new client initialization pattern can create a connection storm.',
        'A release can coincide with an unrelated storage event, so timestamps alone are not proof.'
      ],

      commands: [
        {
          command:
            'db.collection.explain("executionStats").find(<new-query>)',
          explanation:
            'Analyze a newly introduced or changed query shape.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect active operations during the incident when authorized.'
        }
      ],

      productionScenario: `At 14:00 a new API release goes live.

At 14:03 Atlas CPU and query latency increase sharply.

Traffic remains unchanged.

Query analysis shows a newly introduced endpoint executing a collection scan hundreds of times per second.

The release is rolled back according to the application change procedure, immediately reducing database load.

The query is later redesigned and tested before redeployment.`,

      troubleshootingApproach: `1. Record release timestamp.

2. Record incident timestamp.

3. Compare traffic before/after.

4. Compare operation rates.

5. Identify new query shapes.

6. Compare execution behavior.

7. Check connections.

8. Check CPU/storage.

9. Check unrelated events.

10. Mitigate through rollback/tuning/scaling as appropriate.

11. Preserve evidence.

12. Perform root-cause analysis.`,

      commonMistakes: [
        'Blaming the release solely because timestamps are close.',
        'Ignoring query-shape changes.',
        'Ignoring connection behavior.',
        'Scaling immediately without investigating the release.',
        'Rolling back without preserving diagnostic evidence.'
      ],

      bestPractices: [
        'Record deployment markers.',
        'Maintain workload baselines.',
        'Compare before and after.',
        'Coordinate DBA and application teams.',
        'Validate database impact during release testing.'
      ],

      interviewAnswer: `I treat the application release as a strong hypothesis and build a before-and-after timeline. I compare query shapes, operation rates, documents examined, connections, CPU, storage and traffic.

If a new query or connection pattern appears immediately after the release and explains the resource increase, I have causal evidence. Depending on severity, I coordinate rollback or mitigation and then complete root-cause analysis.`,

      keyTakeaways: [
        'Correlation is not automatically causation.',
        'Compare before and after.',
        'Application releases can change queries and pools.',
        'Deployment timestamps are valuable.',
        'Preserve evidence during mitigation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 18,
    question:
      'A production collection was accidentally deleted in MongoDB Atlas. How would you perform an L3 recovery investigation using backups or point-in-time recovery?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `The first recovery question is not:

Which backup should I restore?

It is:

What is the last known good point before the destructive event?

Recovery requires:

• incident timestamp
• available recovery window
• safe restore target
• validation
• production reconciliation/cutover.`,

      coreConcept: `Accidental deletion
       |
identify T-delete
       |
choose T-good
       |
backup/PITR
       |
restore safely
       |
validate
       |
recover production`,

      detailedExplanation: `STEP 1 — IDENTIFY THE EVENT

Determine:

• what was deleted
• when it was deleted
• who/application performed it
• whether writes continued afterward.

STEP 2 — STOP FURTHER DAMAGE

If an application defect is continuing destructive operations, contain it using approved incident procedures.

STEP 3 — IDENTIFY RECOVERY POINT

Choose a timestamp before the destructive operation.

STEP 4 — CHECK AVAILABLE RECOVERY OPTIONS

Determine whether the required point exists within configured Atlas backup/PITR retention.

Exact restore capabilities depend on Atlas deployment and backup configuration.

STEP 5 — RESTORE SAFELY

Where possible, restore into an isolated recovery target rather than blindly replacing the active production environment.

STEP 6 — VALIDATE

Check:

• expected collection
• document count
• critical records
• indexes
• consistency.

STEP 7 — RECONCILE

If production continued receiving legitimate writes after the deletion, restoring the entire database to an older point may discard those later writes.

Therefore recovery may require selective data extraction or a controlled application/database reconciliation process.

STEP 8 — ROOT CAUSE

Determine why deletion was possible.

Examples:

• excessive application privilege
• human error
• bad deployment
• missing approval/control.`,

      internalWorking: `Production
    |
 destructive event T1
    |
 current data

Backup history
    |
 choose T0 < T1
    |
 restore T0
    |
 validate
    |
 selective/full recovery`,

      architecture: `          PRODUCTION
              |
       accidental delete
              |
       incident response
              |
        BACKUP / PITR
              |
       isolated restore
              |
          validation
              |
       recovery strategy`,

      examples: [
        'If only one collection was deleted, selective recovery may avoid rolling back unrelated newer data.',
        'The newest available recovery point is not useful if it is after the deletion.',
        'A successful restore should still be validated before application use.'
      ],

      commands: [
        {
          command:
            'db.collection.countDocuments({})',
          explanation:
            'Can be one validation input after restore, but counts alone do not prove data correctness.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Validate expected indexes in the recovered environment.'
        }
      ],

      productionScenario: `At 10:32 an application deployment accidentally drops a critical collection.

The DBA determines that 10:31 is a safe recovery point within the configured PITR window.

A recovery environment is restored and validated.

Because production received legitimate writes to other collections after 10:32, the team avoids blindly rolling the entire production database backward.

The required collection data is recovered through the approved reconciliation process.`,

      troubleshootingApproach: `1. Determine destructive-event timestamp.

2. Contain ongoing damage.

3. Identify affected scope.

4. Determine last known good point.

5. Check backup/PITR availability.

6. Restore to safe target.

7. Validate documents.

8. Validate indexes.

9. Identify post-incident legitimate writes.

10. Choose selective or full recovery strategy.

11. Recover through approved procedure.

12. Perform RCA and access-control review.`,

      commonMistakes: [
        'Restoring the latest point even if it is after deletion.',
        'Overwriting production immediately.',
        'Ignoring valid writes after the incident.',
        'Assuming document count proves correctness.',
        'Recovering data without investigating why deletion occurred.'
      ],

      bestPractices: [
        'Maintain precise incident timestamps.',
        'Perform isolated restores when possible.',
        'Validate before cutover.',
        'Test recovery procedures regularly.',
        'Apply least privilege to destructive operations.'
      ],

      interviewAnswer: `For accidental deletion in Atlas, I first identify the destructive timestamp and contain any continuing damage. Then I select the last known good recovery point within the configured backup or PITR window.

I prefer restoring into an isolated target, validate the data and indexes, and then determine whether selective recovery or full rollback is appropriate. This matters because production may contain legitimate writes created after the deletion that must not be lost.`,

      keyTakeaways: [
        'Identify the last known good point.',
        'Contain ongoing damage first.',
        'Restore safely.',
        'Account for later legitimate writes.',
        'Validate before recovery.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 19,
    question:
      'Atlas automatically scales a production deployment, but application latency remains high. How would an L3 DBA determine why adding capacity did not solve the problem?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `More resources only solve problems caused by insufficient resources.

Scaling may not fix:

• bad query plans
• missing indexes
• network latency
• connection-pool waits
• lock/contention patterns
• oversized result sets
• application bottlenecks.`,

      coreConcept: `LATENCY
   |
scale occurred
   |
latency remains
   |
capacity was not
the only bottleneck
   |
find actual wait`,

      detailedExplanation: `STEP 1 — VERIFY SCALING EFFECT

Check what resource changed and when.

STEP 2 — COMPARE RESOURCE PRESSURE

Did CPU or memory pressure improve?

If yes but application latency did not, the bottleneck may be elsewhere.

STEP 3 — QUERY PLANS

Check expensive queries.

More CPU does not transform a collection scan into an indexed query.

STEP 4 — STORAGE

Check disk latency and throughput.

STEP 5 — APPLICATION

Check:

• connection pool wait
• thread/event-loop pressure
• downstream services
• retries.

STEP 6 — NETWORK

Check end-to-end network latency.

STEP 7 — RESULT SIZE

Large responses can remain slow even with more database CPU.

STEP 8 — CONTENTION

Some workload patterns are limited by serialization/contention rather than raw compute.

STEP 9 — SHARDING/DATA DISTRIBUTION

For sharded workloads, poor shard-key distribution or scatter-gather behavior may require architectural analysis rather than simple vertical scaling.

STEP 10 — MEASURE

Compare:

before scaling
vs
after scaling.

The L3 principle is:

Find the limiting resource or wait state.

Do not assume capacity is always the limiting factor.`,

      internalWorking: `Scale
 |
CPU improves?
 |
yes
 |
latency unchanged
 |
look elsewhere:
query
storage
network
pool
contention
architecture`,

      architecture: `APPLICATION
    |
 NETWORK
    |
 DRIVER
    |
 MONGODB
 /   |    \
CPU QUERY STORAGE
     |
   indexes

Scaling one component
does not fix every layer.`,

      examples: [
        'Doubling CPU does not fix a query that scans millions of unnecessary documents.',
        'Database execution may improve while application requests still wait in the connection pool.',
        'A scatter-gather sharded query may remain expensive despite increasing individual node capacity.'
      ],

      commands: [
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Determine whether query execution remains inefficient after scaling.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect active database operations when appropriate and authorized.'
        }
      ],

      productionScenario: `Atlas scales a deployment after sustained CPU pressure.

CPU falls substantially, but customer latency remains almost unchanged.

The DBA discovers that the slow endpoint returns an extremely large dataset and the application spends significant time transferring and processing it.

The database scale-up reduced one resource constraint but did not address the actual end-to-end bottleneck.`,

      troubleshootingApproach: `1. Record scaling timestamp.

2. Compare before/after metrics.

3. Check whether saturated resource improved.

4. Compare database latency with application latency.

5. Analyze query plans.

6. Check storage.

7. Check network.

8. Check pool wait.

9. Check result size.

10. Check contention.

11. Check sharding/data distribution if relevant.

12. Correct the actual bottleneck.`,

      commonMistakes: [
        'Assuming scaling guarantees lower latency.',
        'Ignoring application telemetry.',
        'Ignoring query plans after scaling.',
        'Continuing to scale repeatedly without diagnosis.',
        'Confusing database execution time with total request time.'
      ],

      bestPractices: [
        'Measure before and after scaling.',
        'Find the limiting resource.',
        'Correlate application and database metrics.',
        'Optimize workload where necessary.',
        'Use scaling as part of capacity engineering, not blind troubleshooting.'
      ],

      interviewAnswer: `If Atlas scales but latency remains high, I compare metrics before and after scaling to determine which constraint actually changed. If CPU pressure falls but latency remains, I investigate query plans, storage, connection-pool waits, network, result size, contention and application behavior.

Scaling only helps when insufficient capacity is the bottleneck. My goal is to identify the actual limiting resource or wait state.`,

      keyTakeaways: [
        'Scaling solves capacity constraints.',
        'It does not fix every latency source.',
        'Compare before and after.',
        'Application telemetry matters.',
        'Find the actual bottleneck.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'atlas_monitoring',
    topicId: 'atlas-monitoring',
    topicNumber: 19,
    topicName: 'MongoDB Atlas & Monitoring',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 investigation of a major MongoDB Atlas production incident involving high latency, CPU spikes, connection growth, replication lag, and application errors?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `A major incident often produces many symptoms simultaneously.

For example:

high CPU
+
connection spike
+
replication lag
+
application errors.

The biggest mistake is treating every alert as an independent problem.

An L3 DBA builds one timeline and looks for the causal chain.`,

      coreConcept: `INCIDENT

App errors
CPU
connections
lag
latency

     |
     v

ONE TIMELINE

     |
     v

trigger
  |
primary effect
  |
secondary effects
  |
business impact`,

      detailedExplanation: `PHASE 1 — STABILIZE

Determine:

• severity
• affected applications
• data-safety risk
• availability impact.

Use approved incident procedures to reduce ongoing damage.

PHASE 2 — BUILD TIMELINE

Record:

• first application error
• CPU increase
• connection increase
• replication lag
• elections
• deployments
• scaling events
• maintenance
• network events.

PHASE 3 — IDENTIFY TRIGGER

Potential triggers include:

• application deployment
• traffic surge
• expensive query
• connection storm
• storage problem
• network issue
• maintenance event.

PHASE 4 — QUERY ANALYSIS

Identify:

• slow query shapes
• COLLSCAN
• docs examined
• aggregation cost
• large results.

PHASE 5 — CONNECTION ANALYSIS

Determine:

• application instance count
• pool behavior
• reconnect storms
• network failures.

PHASE 6 — INFRASTRUCTURE

Correlate:

• CPU
• memory/cache
• storage latency
• network
• capacity.

PHASE 7 — REPLICATION

Determine whether lag is:

root cause

or:

secondary effect of resource pressure.

For example:

bad query
→ CPU/storage pressure
→ replication falls behind.

PHASE 8 — MITIGATION

Depending on evidence:

• rollback application
• stop problematic batch
• optimize query
• add justified index
• correct pool behavior
• scale
• repair network path.

PHASE 9 — VALIDATE

Confirm:

• latency normalized
• CPU normalized
• connections stabilized
• replication caught up
• application errors stopped.

PHASE 10 — RCA

Document:

• trigger
• contributing factors
• detection
• impact
• mitigation
• permanent fix
• prevention.`,

      internalWorking: `Trigger
   |
   v
Workload/network change
   |
   +--> CPU pressure
   |
   +--> connection growth
   |
   +--> storage pressure
   |
   +--> replication lag
   |
   v
application latency/errors

Find causal chain,
not isolated alerts.`,

      architecture: `                 APPLICATION
                     |
          +----------+----------+
          |                     |
       queries              connections
          |                     |
          +----------+----------+
                     |
                   ATLAS
          +----------+----------+
          |          |          |
         CPU       STORAGE     REPL
          |          |          |
          +----------+----------+
                     |
                 USER IMPACT`,

      examples: [
        'A bad release can create expensive queries, increase CPU, cause replication lag and produce application timeouts.',
        'A network incident can cause reconnect storms, increasing connections while the database itself remains comparatively healthy.',
        'Storage latency can slow writes and replication while also increasing application response time.'
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Inspect active operations during investigation, subject to privileges.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides server-level metrics that can complement Atlas graphs.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Inspect replica-set topology and member states.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Inspect secondary lag where appropriate.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<suspect-query>)',
          explanation:
            'Analyze suspect query execution with representative parameters.'
        }
      ],

      productionScenario: `At 19:05 application latency increases.

At 19:06 Atlas CPU rises sharply.

At 19:07 connections begin increasing.

At 19:10 replication lag appears.

The team initially treats replication as the root cause.

The DBA builds a timeline and discovers that an application deployment at 19:04 introduced an expensive unindexed query.

The query saturates database resources.

Application requests begin timing out and retrying, which increases connection pressure.

Secondaries then struggle to keep up, producing replication lag.

The actual causal chain is:

bad release
→ expensive workload
→ CPU/storage pressure
→ application retries
→ connection growth
→ replication lag.

The application is rolled back according to incident procedure.

Metrics normalize.

A proper index/query fix is tested before redeployment.`,

      troubleshootingApproach: `1. Declare severity and establish ownership.

2. Record exact incident start.

3. Preserve evidence.

4. Check Atlas deployment health.

5. Check application errors.

6. Check recent releases.

7. Check traffic/operation rate.

8. Check CPU.

9. Check memory/cache.

10. Check storage latency.

11. Check connections.

12. Check slow-query patterns.

13. Check execution plans.

14. Check replication lag and elections.

15. Check network events.

16. Construct causal chain.

17. Apply lowest-risk effective mitigation.

18. Validate recovery across every affected metric.

19. Monitor for recurrence.

20. Complete RCA and preventive actions.`,

      commonMistakes: [
        'Treating every alert independently.',
        'Making several configuration changes simultaneously.',
        'Restarting systems without evidence.',
        'Assuming replication lag is always the root cause.',
        'Scaling before checking query behavior.',
        'Ignoring application releases.',
        'Failing to preserve incident timestamps and evidence.'
      ],

      bestPractices: [
        'Build one incident timeline.',
        'Correlate application and Atlas metrics.',
        'Change one controlled variable where possible.',
        'Mitigate based on evidence.',
        'Validate every affected subsystem afterward.',
        'Convert the incident into monitoring and runbook improvements.'
      ],

      interviewAnswer: `For a major Atlas incident, I do not troubleshoot CPU, connections, replication and latency as unrelated alerts. I establish severity, build a single timeline and correlate application releases, traffic, query behavior, connections, CPU, storage, network and replication.

Then I determine the causal chain. For example, an expensive query may create CPU and storage pressure, application retries may increase connections, and secondaries may subsequently develop lag.

I apply the lowest-risk mitigation supported by evidence, validate that all metrics recover, and then complete an RCA covering trigger, contributing factors, detection gaps and preventive actions.`,

      keyTakeaways: [
        'Build a single timeline.',
        'Find the causal chain.',
        'Replication lag may be secondary.',
        'Correlate application and database telemetry.',
        'Mitigate with evidence.',
        'Finish with RCA and prevention.'
      ]
    }
  }

];

/* =========================================================
   SEED FUNCTION
========================================================= */

async function seedAtlasMonitoring() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'atlas_monitoring'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous atlas_monitoring documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} MongoDB Atlas & Monitoring questions`
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

    const topicCount =
      await collection.countDocuments({
        category: 'atlas_monitoring'
      });

    console.log(`Topic 19 count: ${topicCount}`);

    if (topicCount !== 20) {
      throw new Error(
        `Topic 19 validation failed. Expected 20 questions but found ${topicCount}.`
      );
    }

    const curriculumCount =
      await collection.countDocuments({
        topicId: { $exists: true }
      });

    console.log(
      `New curriculum question count: ${curriculumCount}`
    );

    console.log(
      'Topic 19 seed completed successfully.'
    );
  } catch (error) {
    console.error('Topic 19 seed failed:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedAtlasMonitoring();
