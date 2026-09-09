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
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 1,
    question:
      'What is the MongoDB query planner, and what happens internally when MongoDB receives a query?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `The MongoDB query planner is the component responsible for deciding how MongoDB should execute a query.

A query tells MongoDB what data is required.

Example:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
})

But MongoDB still needs to decide:

• Should I scan the entire collection?
• Should I use the customerId index?
• Should I use the status index?
• Should I use a compound index?
• Can an index also satisfy the sort?
• Will documents need to be fetched after scanning index keys?

That decision is the job of the query planner.`,

      coreConcept: `The simplified flow is:

Application sends query
        |
        v
MongoDB parses query
        |
        v
Query planner identifies possible plans
        |
        v
Candidate plans are evaluated
        |
        v
Winning plan selected
        |
        v
Query executes
        |
        v
Results returned

The planner attempts to choose an access path that performs the required work efficiently while preserving correct query semantics.`,

      detailedExplanation: `Suppose a collection contains 100 million orders.

Indexes:

{
  customerId: 1
}

{
  status: 1
}

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

Query:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
})

MongoDB can potentially consider multiple strategies.

PLAN A

Use customerId index.

Then fetch matching documents.

Then filter status.

Then sort by createdAt if needed.

PLAN B

Use status index.

Then fetch matching documents.

Then filter customerId.

Then sort.

PLAN C

Use the compound index:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

This may support:

• customerId equality
• status equality
• createdAt ordering

PLAN D

Depending on indexes and planner eligibility, another combined strategy may exist.

The planner evaluates candidate plans and chooses a winner.

The planner is important because two logically identical queries can have very different performance depending on:

• available indexes
• data distribution
• selectivity
• sort requirements
• query predicates
• collection size
• query shape
• cached planning state

A DBA does not optimize MongoDB only by creating indexes.

A DBA must understand how the planner actually uses those indexes.`,

      internalWorking: `Client Query
     |
     v
Parse / Canonicalize
     |
     v
Identify candidate access paths
     |
     +--> COLLSCAN
     |
     +--> IXSCAN index A
     |
     +--> IXSCAN index B
     |
     +--> IXSCAN compound index
     |
     v
Candidate evaluation
     |
     v
Winning plan
     |
     v
Execution stages
     |
     v
Return results`,

      architecture: `             APPLICATION
                  |
                  v
              MongoDB
                  |
                  v
            Query Planner
                  |
        +---------+---------+
        |         |         |
        v         v         v
    COLLSCAN    IXSCAN    IXSCAN
                 A          B
        \         |         /
         \        |        /
          +-------+-------+
                  |
                  v
             Winning Plan
                  |
                  v
              Execution`,

      examples: [
        `Simple query:

db.users.find({
  email: "user@example.com"
})`,

        `Query with filter and sort:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
})`,

        `Inspect planner decision:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("queryPlanner")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("queryPlanner")',
          explanation:
            'Shows the planner-selected winning plan and relevant candidate planning information without executing the query in the same way as executionStats.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Lists indexes that may be considered as candidate access paths.'
        }
      ],

      productionScenario: `An application query becomes slow after the collection grows from 5 million to 200 million documents.

Developers say:

"The query has an index."

The DBA checks explain and discovers MongoDB is not using the expected compound index.

Instead, the winning plan scans a broader single-field index and filters a large number of documents.

The DBA investigates:

• why the planner preferred that plan
• whether index bounds are poor
• whether selectivity changed
• whether the query shape changed
• whether the compound index still aligns with the workload

Understanding the query planner turns the investigation from guesswork into evidence-based troubleshooting.`,

      troubleshootingApproach: `When investigating planner behavior:

1. Capture the exact application query.

2. Capture filter, sort, projection, limit, and collation.

3. Run explain("queryPlanner").

4. Identify winningPlan.

5. Identify the index used.

6. Review rejected plans if available.

7. Check compound index order.

8. Check data selectivity.

9. Run executionStats for actual work metrics.

10. Compare keys and documents examined.

11. Check whether a SORT or FETCH is required.

12. Test alternate indexes carefully.

13. Avoid forcing a plan until the planner choice is understood.`,

      commonMistakes: [
        'Assuming MongoDB always chooses the index a DBA expects.',
        'Assuming every indexed query is efficient.',
        'Creating more indexes without checking the winning plan.',
        'Ignoring sort and projection requirements.',
        'Using hint before understanding planner behavior.'
      ],

      bestPractices: [
        'Use explain for important query tuning.',
        'Understand both query shape and available indexes.',
        'Validate planner choices using execution statistics.',
        'Consider data distribution when evaluating plans.',
        'Tune around the complete workload rather than isolated fields.'
      ],

      interviewAnswer: `The MongoDB query planner evaluates possible access paths for a query and chooses a winning plan.

It can consider collection scans, one or more index-based plans, sort requirements, fetches, and other execution strategies.

As a DBA, I use explain to inspect the winning plan and execution statistics rather than assuming that the presence of an index guarantees efficient execution.`,

      keyTakeaways: [
        'The query planner chooses how a query executes.',
        'Multiple plans may be possible.',
        'Available indexes are only candidates, not guarantees.',
        'Planner behavior depends on query shape and data.',
        'Explain is the primary tool for understanding the decision.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 2,
    question:
      'What is explain() in MongoDB, and what is the difference between queryPlanner, executionStats, and allPlansExecution verbosity modes?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `explain() is one of the most important tools for MongoDB performance troubleshooting.

It shows how MongoDB plans or executes a query.

Three commonly used verbosity modes are:

queryPlanner

executionStats

allPlansExecution`,

      coreConcept: `The modes provide increasing levels of execution detail.

queryPlanner

Shows planning information and winning plan.

executionStats

Executes the selected plan and returns execution metrics.

allPlansExecution

Provides execution information for the winning plan plus additional information about candidate-plan evaluation.`,

      detailedExplanation: `QUERYPLANNER

Example:

db.orders.find({
  customerId: 1001
}).explain("queryPlanner")

Useful for:

• winning plan
• index selected
• plan structure
• rejected plans
• query shape information

It does not provide the same full actual execution statistics as executionStats.

EXECUTIONSTATS

Example:

db.orders.find({
  customerId: 1001
}).explain("executionStats")

This runs the query plan and provides actual execution metrics such as:

• nReturned
• executionTimeMillis
• totalKeysExamined
• totalDocsExamined

This is usually the most useful mode for practical query tuning.

ALLPLANSEXECUTION

Example:

db.orders.find({
  customerId: 1001
}).explain("allPlansExecution")

This provides additional information about the candidate plans during plan selection.

It is especially useful when:

• multiple indexes are competing
• planner choice is surprising
• you want deeper visibility into candidate performance

However, a DBA should not automatically use allPlansExecution for every query.

executionStats is often sufficient for normal analysis.

Another important point:

explain output structure can differ across MongoDB versions and execution engines.

Therefore DBAs should focus on the meaning of fields and stages rather than expecting every version to print identical JSON structures.`,

      internalWorking: `queryPlanner
     |
     v
Planning information
Winning plan
Rejected plans


executionStats
     |
     v
Winning plan executes
     |
     v
Actual metrics


allPlansExecution
     |
     v
Winning plan metrics
+
candidate-plan trial information`,

      architecture: `explain()

       |
       +--> queryPlanner
       |      |
       |      v
       |   Plan choice
       |
       +--> executionStats
       |      |
       |      v
       |   Actual winning-plan work
       |
       +--> allPlansExecution
              |
              v
        Deeper candidate-plan details`,

      examples: [
        `Planner only:

db.orders.find({
  customerId: 1001
}).explain("queryPlanner")`,

        `Actual execution:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Candidate plan detail:

db.orders.find({
  customerId: 1001
}).explain("allPlansExecution")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("queryPlanner")',
          explanation:
            'Shows query-planning information and the selected winning plan.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Executes the winning plan and shows actual execution work.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("allPlansExecution")',
          explanation:
            'Provides deeper information about candidate-plan trial execution.'
        }
      ],

      productionScenario: `A DBA investigates a query that uses the expected index but still takes two seconds.

queryPlanner shows:

IXSCAN

The developer concludes the index is correct.

The DBA runs:

executionStats

and sees:

nReturned: 20

totalKeysExamined: 3,500,000

totalDocsExamined: 800,000

The index is being used, but inefficiently.

queryPlanner answered:

Which plan?

executionStats answered:

How much work?

That distinction is fundamental.`,

      troubleshootingApproach: `Use explain modes progressively:

1. Start with queryPlanner when checking basic plan choice.

2. Use executionStats for actual performance analysis.

3. Record nReturned.

4. Record totalKeysExamined.

5. Record totalDocsExamined.

6. Inspect execution stages.

7. Inspect indexBounds.

8. If planner choice is surprising, use allPlansExecution.

9. Compare candidate indexes.

10. Interpret version-specific output carefully.

11. Do not base tuning only on executionTimeMillis.

12. Re-test with realistic predicates.`,

      commonMistakes: [
        'Using only queryPlanner for performance tuning.',
        'Confusing plan selection with execution efficiency.',
        'Using allPlansExecution without understanding the output.',
        'Relying only on executionTimeMillis.',
        'Expecting identical explain output across all MongoDB versions.'
      ],

      bestPractices: [
        'Use executionStats for real tuning.',
        'Use queryPlanner for quick plan inspection.',
        'Use allPlansExecution for deeper plan competition analysis.',
        'Focus on work metrics, not only latency.',
        'Interpret explain in the context of the server version.'
      ],

      interviewAnswer: `explain() shows how MongoDB plans and executes a query.

queryPlanner shows planning information and the winning plan.

executionStats executes the winning plan and adds metrics such as nReturned, totalKeysExamined, and totalDocsExamined.

allPlansExecution provides additional candidate-plan trial information and is useful when investigating why the planner selected one plan over another.`,

      keyTakeaways: [
        'queryPlanner explains plan choice.',
        'executionStats explains actual work.',
        'allPlansExecution provides deeper candidate information.',
        'executionStats is central to performance tuning.',
        'Explain output can vary by MongoDB version.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 3,
    question:
      'What do COLLSCAN, IXSCAN, and FETCH mean in MongoDB explain output, and how should a DBA interpret them?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `Three explain stages that MongoDB DBAs see frequently are:

COLLSCAN

IXSCAN

FETCH

Understanding them is essential for query troubleshooting.`,

      coreConcept: `COLLSCAN

MongoDB scans collection documents.

IXSCAN

MongoDB scans an index.

FETCH

MongoDB fetches full documents from the collection after obtaining candidate record references, often from an index.`,

      detailedExplanation: `COLLSCAN

Example:

db.orders.find({
  customerId: 1001
})

If there is no useful index, MongoDB may inspect collection documents one by one.

Conceptually:

Document 1
Document 2
Document 3
...
Document N

This can be expensive on a large collection.

But COLLSCAN is not always automatically wrong.

Examples where it may be reasonable:

• tiny collection
• query returns most of collection
• administrative scan
• analytical workload intentionally reading all records

IXSCAN

With an index:

{
  customerId: 1
}

MongoDB can search the ordered index structure.

But IXSCAN alone does not mean the query is efficient.

An IXSCAN might examine:

10 keys

or:

10 million keys.

FETCH

An index generally contains indexed key information plus references needed to locate records.

If the query needs:

• non-indexed fields
• document validation
• residual filtering
• complete document output

MongoDB may FETCH the underlying documents.

Typical plan:

FETCH
  |
  v
IXSCAN

Conceptually MongoDB scans index keys, locates candidate documents, then retrieves them.

A covered query can sometimes avoid FETCH entirely.`,

      internalWorking: `COLLSCAN

Collection
 |
 v
Document
Document
Document
Document


IXSCAN + FETCH

Index
 |
 v
Matching keys
 |
 v
Document references
 |
 v
FETCH
 |
 v
Full documents`,

      architecture: `Possible plan:

FETCH
  |
  v
IXSCAN
  |
  v
Index


Alternative:

COLLSCAN
   |
   v
Collection`,

      examples: [
        `Possible COLLSCAN:

db.orders.find({
  unindexedField: "X"
}).explain("executionStats")`,

        `Possible IXSCAN + FETCH:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Potential covered plan:

db.orders.find(
  { customerId: 1001 },
  { _id: 0, customerId: 1 }
).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows whether the query uses COLLSCAN, IXSCAN, FETCH, or another plan structure.'
        }
      ],

      productionScenario: `A monitoring alert says a query is using COLLSCAN.

The team immediately requests a new index.

The DBA checks:

Collection size:
1,500 documents

Query frequency:
once every six hours

Query returns:
1,400 documents

Creating another index may provide little value and would add write/storage overhead.

In another case:

Collection:
500 million documents

Query returns:
10 documents

COLLSCAN is clearly a serious issue.

The DBA interprets explain stages in workload context rather than treating every stage name as good or bad by itself.`,

      troubleshootingApproach: `When reading these stages:

1. Identify the top-level winning plan.

2. Find COLLSCAN or IXSCAN.

3. If IXSCAN exists, identify index name.

4. Check whether FETCH exists.

5. Check filter inside FETCH.

6. Record totalKeysExamined.

7. Record totalDocsExamined.

8. Compare with nReturned.

9. Determine whether document fetch is unavoidable.

10. Determine whether coverage is useful.

11. Evaluate collection size and query frequency.

12. Do not judge performance from stage name alone.`,

      commonMistakes: [
        'Assuming every COLLSCAN is unacceptable.',
        'Assuming every IXSCAN is efficient.',
        'Treating FETCH as an error.',
        'Ignoring residual filters in FETCH.',
        'Ignoring collection and result size.'
      ],

      bestPractices: [
        'Interpret stages with execution metrics.',
        'Check FETCH filters.',
        'Compare examined counts to returned count.',
        'Use coverage only when useful.',
        'Prioritize high-impact scans.'
      ],

      interviewAnswer: `COLLSCAN means MongoDB scans collection documents, IXSCAN means it scans an index, and FETCH means it retrieves full collection documents after identifying candidate records.

I do not classify a query as good simply because it has IXSCAN. I also check keys examined, documents examined, returned count, FETCH filtering, and the workload context.`,

      keyTakeaways: [
        'COLLSCAN scans documents.',
        'IXSCAN scans index entries.',
        'FETCH retrieves collection documents.',
        'IXSCAN can still be inefficient.',
        'Stage names must be combined with execution metrics.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 4,
    question:
      'What do nReturned, totalKeysExamined, totalDocsExamined, executionTimeMillis, and works tell you in an explain plan?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `Execution statistics tell a DBA how much work MongoDB performed.

Important metrics commonly include:

nReturned

totalKeysExamined

totalDocsExamined

executionTimeMillis

and, depending on plan/explain representation, internal work counters such as works.`,

      coreConcept: `nReturned

Number of documents returned to the query result.

totalKeysExamined

Number of index keys examined.

totalDocsExamined

Number of collection documents examined.

executionTimeMillis

Approximate execution duration reported for the explain execution.

works

An internal work-related counter visible in some plan statistics that helps describe how often an execution stage was asked to perform work.`,

      detailedExplanation: `Consider:

nReturned: 10
totalKeysExamined: 10
totalDocsExamined: 10

This suggests a very tight indexed lookup.

Now:

nReturned: 10
totalKeysExamined: 2,000,000
totalDocsExamined: 500,000

MongoDB performs huge work to return ten documents.

That indicates:

• poor index bounds
• residual filtering
• bad compound index order
• low selectivity
• broad range
• other query design issues

EXECUTIONTIMEMILLIS

Useful, but should not be used alone.

A query might report:

20 ms

today because data is cached.

The same plan may take:

400 ms

under disk pressure.

Likewise a slow explain execution can be influenced by current server load.

Therefore work metrics are often more stable indicators of plan efficiency than one latency measurement.

WORKS

In planner-stage statistics, works can represent how many times an execution stage was asked to advance or do work.

It can help understand candidate-plan trial efficiency.

However, most day-to-day DBA tuning should begin with:

• nReturned
• totalKeysExamined
• totalDocsExamined
• execution stages
• bounds

and only then move deeper into stage-specific counters.`,

      internalWorking: `Index scan

Keys examined = 100000
       |
       v
Fetch documents

Docs examined = 10000
       |
       v
Filter
       |
       v
nReturned = 100


Useful work:
100 results

Total work:
100000 index keys
10000 documents`,

      architecture: `Execution Metrics

        |
        +--> nReturned
        |
        +--> totalKeysExamined
        |
        +--> totalDocsExamined
        |
        +--> executionTimeMillis
        |
        +--> stage-level counters
               |
               v
           Work analysis`,

      examples: [
        `Excellent selective lookup:

nReturned: 1
totalKeysExamined: 1
totalDocsExamined: 1`,

        `Poor index scan:

nReturned: 10
totalKeysExamined: 1000000
totalDocsExamined: 250000`,

        `Potentially covered:

nReturned: 20
totalKeysExamined: 20
totalDocsExamined: 0`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Provides the main execution statistics for the query.'
        }
      ],

      productionScenario: `Two queries both take approximately 100 ms during a test.

Query A:

nReturned = 100
keysExamined = 100
docsExamined = 100

Query B:

nReturned = 100
keysExamined = 900000
docsExamined = 250000

At low load, latency looks similar.

Under heavy concurrency, Query B consumes far more CPU and cache resources.

The DBA prioritizes Query B even though one isolated timing test did not look catastrophic.`,

      troubleshootingApproach: `For execution metrics:

1. Record nReturned.

2. Record totalKeysExamined.

3. Record totalDocsExamined.

4. Compare them.

5. Check executionTimeMillis.

6. Identify where documents are filtered.

7. Check indexBounds.

8. Check sort.

9. Check query frequency.

10. Compare different parameter values.

11. Re-run during realistic workload.

12. Avoid relying on one timing sample.

13. Use deeper stage counters when necessary.`,

      commonMistakes: [
        'Using only executionTimeMillis.',
        'Ignoring examined counts.',
        'Assuming a 1:1 ratio is mandatory for every range query.',
        'Ignoring query frequency.',
        'Comparing timings from very different cache states.'
      ],

      bestPractices: [
        'Prioritize work metrics.',
        'Use latency together with examined counts.',
        'Compare representative parameter values.',
        'Measure at realistic workload levels.',
        'Investigate large gaps between examined and returned counts.'
      ],

      interviewAnswer: `nReturned shows useful result output, totalKeysExamined shows index work, and totalDocsExamined shows collection-document work.

executionTimeMillis is useful but can vary with system state, so I do not rely on it alone.

A large gap between examined counts and returned documents usually indicates inefficient filtering or index bounds and deserves further investigation.`,

      keyTakeaways: [
        'nReturned measures useful results.',
        'Keys examined measures index work.',
        'Docs examined measures document work.',
        'Latency alone can be misleading.',
        'Large work-to-result gaps indicate inefficiency.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 5,
    question:
      'How do you read the winningPlan and rejectedPlans sections in MongoDB explain output?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `When MongoDB has multiple possible ways to execute a query, it can select one as the winning plan.

Other candidate plans may appear as rejected plans.

Rejected does not necessarily mean:

"bad index."

It means that candidate was not selected as the winner for that planning decision.`,

      coreConcept: `Example concept:

winningPlan:
  compound index

rejectedPlans:
  customerId index
  status index
  collection scan

The DBA should ask:

Why did the winner require less or more useful work than the alternatives?`,

      detailedExplanation: `Suppose indexes are:

A:

{
  customerId: 1
}

B:

{
  status: 1
}

C:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001,
  status: "OPEN"
}

sort:

{
  createdAt: -1
}

The winning plan might use C.

Rejected plans could include:

A + FETCH + SORT

B + FETCH + SORT

The winning compound index may:

• produce tighter bounds
• examine fewer keys
• fetch fewer documents
• avoid explicit sorting

Therefore it wins.

But a rejected plan should not automatically be deleted from the database.

Index A may still be extremely valuable for another query:

{
  customerId: 1001
}

Likewise, planner decisions are query-shape specific.

The DBA must distinguish:

This index lost for this query

from:

This index is useless globally.

Another subtle point:

Explain formatting and rejected-plan visibility differ across MongoDB versions and execution engines.

The logical interpretation remains:

winner = selected strategy

rejected = alternatives not selected for that planning event.`,

      internalWorking: `Candidate Plans

Plan A
 |
 +--> 5000 work

Plan B
 |
 +--> 500 work

Plan C
 |
 +--> 50 work

Planner selects:
Plan C


winningPlan:
Plan C

rejectedPlans:
Plan A
Plan B`,

      architecture: `                 Query
                   |
                   v
              Candidates
                   |
        +----------+----------+
        |          |          |
        v          v          v
      Plan A     Plan B     Plan C
        |          |          |
        +----------+----------+
                   |
                   v
             Planner decision
                   |
            +------+------+
            |             |
            v             v
         Winner        Rejected`,

      examples: [
        `Inspect:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("queryPlanner")`,

        `Deeper comparison:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("allPlansExecution")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("queryPlanner")',
          explanation:
            'Shows the selected winning plan and candidate plans rejected during planning where exposed.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("allPlansExecution")',
          explanation:
            'Provides deeper candidate-plan execution information.'
        }
      ],

      productionScenario: `A DBA sees an important index listed under rejectedPlans and assumes MongoDB is not using it anywhere.

They plan to drop it.

Before doing so, workload analysis shows another API depends heavily on that index.

The index lost only for one query shape.

It remains essential for another.

Rejected plans must therefore be interpreted locally to the query being explained.`,

      troubleshootingApproach: `When comparing winner and rejected plans:

1. Identify the winning plan.

2. Identify its index.

3. Identify rejected indexes.

4. Compare stage structures.

5. Look for SORT differences.

6. Look for FETCH differences.

7. Use allPlansExecution if deeper evidence is needed.

8. Compare indexes against the query shape.

9. Check other workloads before judging an index unnecessary.

10. Check data selectivity.

11. Check whether the winning plan is stable across important parameters.

12. Never drop an index merely because it appears under rejectedPlans.`,

      commonMistakes: [
        'Treating rejectedPlans as globally useless indexes.',
        'Ignoring sort differences between plans.',
        'Dropping an index because it lost one planner competition.',
        'Assuming winner always means perfect plan.',
        'Ignoring parameter-dependent behavior.'
      ],

      bestPractices: [
        'Interpret plans per query shape.',
        'Use rejected plans to understand alternatives.',
        'Use allPlansExecution for deeper comparisons.',
        'Validate indexes against all important workloads.',
        'Measure the winning plan, not just trust its label.'
      ],

      interviewAnswer: `winningPlan is the execution strategy MongoDB selected for the query, while rejectedPlans are alternative candidates that were considered but not chosen.

A rejected index is not necessarily a bad or unused index globally.

I compare the candidate plan structures and work, then evaluate each index across the full workload before making any index changes.`,

      keyTakeaways: [
        'Winning plan is query-specific.',
        'Rejected plans are alternatives, not globally bad indexes.',
        'Sort and FETCH differences matter.',
        'allPlansExecution helps deeper comparison.',
        'Never drop an index based only on rejectedPlans.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 6,
    question:
      'How do you interpret indexBounds in an explain plan, including equality, range, $in, and unbounded intervals?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `indexBounds show which index key ranges MongoDB intends to scan.

They help answer:

How tightly is this index restricting the search?

Tight bounds usually mean less index work.

Broad bounds can mean many keys must be examined.`,

      coreConcept: `Common conceptual patterns are:

Equality:

[1001, 1001]

Range:

[500, Infinity]

Unbounded:

[MinKey, MaxKey]

Multiple $in values:

several separate intervals

The exact explain syntax can vary, but the idea is the same.`,

      detailedExplanation: `Consider:

Index:

{
  customerId: 1,
  status: 1,
  amount: 1
}

Query:

{
  customerId: 1001,
  status: "OPEN",
  amount: {
    $gte: 500
  }
}

Conceptually:

customerId:
[1001,1001]

status:
["OPEN","OPEN"]

amount:
[500,MaxKey]

This is a tight compound prefix followed by a range.

Now consider:

Query:

{
  amount: {
    $gte: 500
  }
}

using the same index.

customerId and status are not constrained.

Conceptually, those fields may span:

MinKey to MaxKey

This is a much broader access path.

$IN

For:

{
  status: {
    $in: [
      "OPEN",
      "PENDING",
      "FAILED"
    ]
  }
}

the planner may create multiple intervals corresponding to the requested values.

The DBA should connect:

indexBounds

with:

totalKeysExamined.

Tight-looking bounds with huge keys examined can still occur if each interval contains large amounts of data.

Conversely, a broad-looking range may still be acceptable if the collection is small or the query legitimately returns many records.`,

      internalWorking: `Index:

customerId | status | amount

Query:

customerId = 1001
status = OPEN
amount >= 500

Bounds:

customerId
[1001,1001]

status
[OPEN,OPEN]

amount
[500,MaxKey]

Result:

Targeted prefix
+
range scan`,

      architecture: `Predicate
    |
    v
Index Bounds
    |
    +--> Exact
    |
    +--> Range
    |
    +--> Multiple intervals
    |
    +--> Unbounded
    |
    v
Keys Examined`,

      examples: [
        `Equality:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Range:

db.orders.find({
  amount: {
    $gte: 500
  }
}).explain("executionStats")`,

        `$in:

db.orders.find({
  status: {
    $in: ["OPEN", "PENDING"]
  }
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN", amount: { $gte: 500 } }).explain("executionStats")',
          explanation:
            'Shows compound index bounds for equality plus range predicates.'
        }
      ],

      productionScenario: `A query returns 30 records but examines 6 million keys.

The index is:

{
  region: 1,
  status: 1,
  customerId: 1
}

The query filters only:

customerId = 1001

Explain shows broad bounds for region and status.

customerId is present in the index, but leading fields are unconstrained.

The DBA redesigns the access path around the real query shape.

The key insight came from indexBounds, not simply the existence of IXSCAN.`,

      troubleshootingApproach: `For indexBounds:

1. Identify IXSCAN.

2. Identify keyPattern.

3. Read bounds field by field.

4. Mark equality intervals.

5. Mark range intervals.

6. Mark multiple $in intervals.

7. Mark unbounded leading fields.

8. Compare bounds with query predicates.

9. Record keys examined.

10. Compare keys examined with nReturned.

11. Check whether field order can be improved.

12. Test an alternative index.

13. Re-run explain.`,

      commonMistakes: [
        'Ignoring indexBounds.',
        'Assuming an indexed field is automatically tightly bounded.',
        'Ignoring unconstrained leading fields.',
        'Assuming tight syntax always means low row count.',
        'Not correlating bounds with keys examined.'
      ],

      bestPractices: [
        'Read bounds field by field.',
        'Prefer tight equality prefixes for selective queries.',
        'Use bounds to validate compound index order.',
        'Correlate bounds with actual work.',
        'Compare alternate indexes using real data.'
      ],

      interviewAnswer: `indexBounds show the key intervals scanned by an index.

Equality predicates produce tight intervals, ranges produce wider intervals, $in can produce multiple intervals, and unconstrained fields may span MinKey to MaxKey.

I use indexBounds with totalKeysExamined to determine whether the index is genuinely narrowing the query efficiently.`,

      keyTakeaways: [
        'Index bounds show scan ranges.',
        'Equality produces tight bounds.',
        'Ranges broaden scanning.',
        '$in can create multiple intervals.',
        'Unbounded leading fields are a warning sign.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 7,
    question:
      'What is a SORT stage in MongoDB explain output, and how do you determine whether sorting is being satisfied by an index?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `A query may request ordered results.

Example:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})

MongoDB can either:

• read the required order directly from an index

or:

• collect matching results and perform an explicit sort.

An explicit sort often appears as a SORT stage or equivalent sort-related execution structure.`,

      coreConcept: `Ideal case:

Index:

{
  customerId: 1,
  createdAt: -1
}

Query:

customerId = 1001

sort:

createdAt descending

The index already stores createdAt in the required order within the customerId prefix.

No blocking sort may be needed.`,

      detailedExplanation: `Consider:

Index A:

{
  customerId: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001
}

Sort:

{
  createdAt: -1
}

The leading customerId field is fixed by equality.

Within that equality prefix, createdAt is ordered descending.

MongoDB can scan in the correct sequence.

Now consider:

Index B:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

Same query:

{
  customerId: 1001
}

Sort:

{
  createdAt: -1
}

status is not constrained.

Records are grouped by status before createdAt.

createdAt ordering is therefore not globally preserved across status values for the requested customer.

MongoDB may require sorting.

A SORT stage can become expensive when:

• many documents enter the sort
• sort result is large
• query runs frequently
• memory pressure is high
• sorting spills or competes with other workload

But an explicit sort is not automatically unacceptable.

Sorting 20 documents is usually trivial.

Sorting 20 million documents is very different.

Again, workload size matters.`,

      internalWorking: `Index supports order:

customerId = 1001
      |
      v
Index entries already sorted
by createdAt
      |
      v
Return results


Index does not support order:

Filter results
      |
      v
Unordered candidate stream
      |
      v
SORT
      |
      v
Return results`,

      architecture: `Query
 |
 v
Index scan
 |
 v
Required order preserved?
 |
 +----+----+
 |         |
YES       NO
 |         |
 v         v
Return    SORT
           |
           v
        Return`,

      examples: [
        `Potentially index-supported sort:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})`,

        `Candidate index:

db.orders.createIndex({
  customerId: 1,
  createdAt: -1
})`,

        `Verify:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Shows whether the plan requires an explicit sort or can preserve index order.'
        }
      ],

      productionScenario: `A dashboard query takes 5 seconds for customers with millions of historical orders.

Explain shows:

IXSCAN

FETCH

SORT

Developers say:

"The query uses an index."

The DBA checks the index:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

But the query does not constrain status.

The sort cannot be efficiently preserved using the current index order.

A workload-specific index:

{
  customerId: 1,
  createdAt: -1
}

is tested and removes the expensive sort.

The DBA then evaluates whether the additional index cost is justified.`,

      troubleshootingApproach: `For SORT analysis:

1. Capture full sort specification.

2. Capture filter.

3. Inspect current index order.

4. Identify equality-constrained prefix fields.

5. Check whether variable fields interrupt sort order.

6. Run explain.

7. Look for SORT.

8. Measure number of documents entering sort.

9. Check result limit.

10. Check sort directions.

11. Test alternate compound index.

12. Re-run executionStats.

13. Measure overall read/write trade-off.`,

      commonMistakes: [
        'Assuming IXSCAN means sorting is index-supported.',
        'Ignoring unconstrained fields between filter and sort keys.',
        'Optimizing a tiny sort unnecessarily.',
        'Ignoring pagination/limit.',
        'Adding redundant sort indexes without measuring value.'
      ],

      bestPractices: [
        'Align important sorts with compound index order.',
        'Check whether equality prefixes preserve sort.',
        'Use explain to verify the absence or presence of explicit sort.',
        'Prioritize large frequent sorts.',
        'Keep result sets bounded where possible.'
      ],

      interviewAnswer: `A SORT stage means MongoDB must explicitly order candidate results rather than reading them directly in the required order from an index.

I compare filter equality fields with compound index order and check whether any unconstrained field breaks sort ordering.

Then I use executionStats to determine how much data is being sorted and whether an index change is justified.`,

      keyTakeaways: [
        'Indexes can satisfy sort directly.',
        'Equality prefixes can preserve later sort order.',
        'Unconstrained index fields may break sort support.',
        'SORT cost depends on result size and frequency.',
        'Explain verifies whether sorting is index-backed.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 8,
    question:
      'What is residual filtering in a FETCH stage, and how can it reveal that a compound index is not filtering efficiently?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `An index may identify candidate documents, but MongoDB can still need to fetch those documents and apply additional filters.

This is often called residual filtering.

Conceptually:

IXSCAN finds candidates

then:

FETCH reads documents

then:

filter removes documents that do not satisfy all predicates.`,

      coreConcept: `Example:

Index:

{
  customerId: 1
}

Query:

{
  customerId: 1001,
  status: "OPEN"
}

The index can find customerId 1001.

But status is not in that index.

MongoDB may fetch all documents for customerId 1001 and then filter:

status = OPEN.`,

      detailedExplanation: `Suppose customerId 1001 has:

1,000,000 orders.

Only:

100

are OPEN.

Using:

{
  customerId: 1
}

MongoDB can perform:

IXSCAN customerId = 1001

Keys examined:
1,000,000

FETCH documents:
1,000,000

Filter status = OPEN

Return:
100

The index is useful compared with scanning the entire collection, but it is still inefficient for this query.

A compound index:

{
  customerId: 1,
  status: 1
}

could potentially narrow the scan directly to:

customerId = 1001
status = OPEN

Now:

keys examined

and:

documents examined

may drop dramatically.

Residual filters can often be found within FETCH or related filtering stages in explain output.

The DBA should ask:

Why is this predicate not being handled more efficiently by the index?

Possible reasons:

• field missing from index
• field positioned after an inefficient range
• incompatible index semantics
• multikey limitations
• collation differences
• expression not efficiently indexable

Not every residual filter should be moved into an index.

If the additional predicate is rarely used, adding another index field may not be worthwhile.

Again, workload value matters.`,

      internalWorking: `Index:

customerId

Query:

customerId = 1001
status = OPEN


IXSCAN
customerId = 1001
      |
      v
1,000,000 candidates
      |
      v
FETCH
      |
      v
Filter status = OPEN
      |
      v
100 returned`,

      architecture: `IXSCAN
   |
   v
Candidate record IDs
   |
   v
FETCH
   |
   v
Residual Filter
   |
   v
Returned Documents`,

      examples: [
        `Existing index:

db.orders.createIndex({
  customerId: 1
})`,

        `Query:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
})`,

        `Potential compound index:

db.orders.createIndex({
  customerId: 1,
  status: 1
})`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).explain("executionStats")',
          explanation:
            'Shows whether status is handled in index bounds or remains as a post-index document filter.'
        }
      ],

      productionScenario: `A query returns 40 documents.

Explain shows:

totalKeysExamined:
850000

totalDocsExamined:
850000

nReturned:
40

The winning plan uses customerId_1.

Inside FETCH, MongoDB filters:

status = FAILED

The DBA discovers failed orders are extremely rare.

A compound index:

{
  customerId: 1,
  status: 1
}

allows MongoDB to eliminate almost all unnecessary candidate documents before FETCH.

This dramatically reduces CPU and cache work.`,

      troubleshootingApproach: `For residual filtering:

1. Find IXSCAN.

2. Find FETCH.

3. Inspect filters associated with FETCH.

4. Identify which predicates are not represented in useful bounds.

5. Record docs examined.

6. Compare with nReturned.

7. Check predicate selectivity.

8. Check compound index possibilities.

9. Check range-field ordering.

10. Evaluate whether coverage is useful.

11. Test candidate index.

12. Measure write/index-size impact before deployment.`,

      commonMistakes: [
        'Ignoring the filter inside FETCH.',
        'Assuming IXSCAN handles every query predicate.',
        'Adding every residual field to an index.',
        'Ignoring predicate selectivity.',
        'Looking only at keys examined and not docs examined.'
      ],

      bestPractices: [
        'Inspect FETCH filters.',
        'Move highly selective common predicates into useful compound indexes.',
        'Avoid widening indexes for rare predicates.',
        'Compare docs examined with nReturned.',
        'Balance filtering benefit against index cost.'
      ],

      interviewAnswer: `Residual filtering occurs when an index identifies candidate records but MongoDB must fetch documents and evaluate additional predicates afterward.

If totalDocsExamined is much larger than nReturned, I inspect FETCH filters to see which predicates were not efficiently handled by index bounds.

For important selective predicates, a better compound index may eliminate much of that document work.`,

      keyTakeaways: [
        'FETCH can contain residual filtering.',
        'Residual filtering increases document work.',
        'Docs examined versus returned is important.',
        'Compound indexes can move filtering earlier.',
        'Not every residual predicate deserves an index.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 9,
    question:
      'How do LIMIT, SKIP, and projection appear in query execution behavior, and how can they change the amount of work MongoDB performs?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Filter and index choice are only part of a query.

Operations such as:

limit()

skip()

projection

can significantly change execution work.

Two queries with the same filter may therefore have very different performance.`,

      coreConcept: `LIMIT

Can allow MongoDB to stop after enough results are produced.

SKIP

Requires MongoDB to advance past a number of matching entries before returning results.

PROJECTION

Controls which fields are returned and can sometimes allow a covered query.`,

      detailedExplanation: `LIMIT

Example:

db.orders.find({
  status: "OPEN"
}).limit(20)

If MongoDB can produce matching results efficiently, it may stop once 20 qualifying documents are found.

This can dramatically reduce work compared with returning every OPEN order.

However, limit cannot always save a bad plan.

If MongoDB must examine 1 million keys to find 20 qualifying documents, the query can still be expensive.

SKIP

Example:

skip(1000000).limit(20)

MongoDB may need to advance through a huge number of earlier results.

Deep skip pagination can therefore show:

high keys examined

despite returning only 20 records.

PROJECTION

Example:

{
  _id: 0,
  customerId: 1,
  status: 1
}

Projection reduces returned fields.

If all required filter and projection fields are in an index, the query may avoid document FETCH and become covered.

Projection also reduces:

• network transfer
• application deserialization
• unnecessary large-field retrieval

even when the query is not completely covered.

A DBA should therefore reproduce the exact application query, including:

filter

sort

projection

limit

skip

rather than explaining only the filter portion.`,

      internalWorking: `LIMIT

Query
 |
 v
Produce result 1
Produce result 2
...
Produce result 20
 |
 v
Stop


SKIP

Query
 |
 v
Walk 1,000,000 matches
 |
 v
Return next 20


PROJECTION

Document
 |
 v
Return selected fields only

or possibly:

Index
 |
 v
Covered result`,

      architecture: `Complete Query Shape

Filter
  |
Sort
  |
Projection
  |
Skip
  |
Limit
  |
  v
Actual work performed`,

      examples: [
        `Limit:

db.orders.find({
  status: "OPEN"
}).limit(20)`,

        `Deep skip:

db.orders.find({})
  .sort({ createdAt: -1 })
  .skip(1000000)
  .limit(20)`,

        `Projection:

db.orders.find(
  { customerId: 1001 },
  {
    _id: 0,
    customerId: 1,
    status: 1
  }
)`
      ],

      commands: [
        {
          command:
            'db.orders.find({ status: "OPEN" }).limit(20).explain("executionStats")',
          explanation:
            'Shows execution work when the query can stop after producing a limited number of results.'
        },
        {
          command:
            'db.orders.find({}).sort({ createdAt: -1 }).skip(1000000).limit(20).explain("executionStats")',
          explanation:
            'Shows the work associated with deep skip pagination.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }, { _id: 0, customerId: 1, status: 1 }).explain("executionStats")',
          explanation:
            'Helps determine whether projection reduces FETCH work or enables a covered query.'
        }
      ],

      productionScenario: `A developer reports:

"Page 1 loads quickly but page 50,000 takes 8 seconds."

The filter and index are identical.

The DBA reproduces the exact query and sees:

skip:
999980

limit:
20

The index is efficient for ordering, but MongoDB still has to advance through almost one million entries.

The root cause is pagination design, not a missing index.

The API is redesigned using range-based continuation keys.`,

      troubleshootingApproach: `For limit/skip/projection issues:

1. Capture the exact query.

2. Include limit.

3. Include skip.

4. Include projection.

5. Include sort.

6. Run executionStats.

7. Compare shallow and deep pagination.

8. Check nReturned.

9. Check totalKeysExamined.

10. Check totalDocsExamined.

11. Determine whether limit stops execution early.

12. Determine whether skip causes growing work.

13. Check for coverage.

14. Consider seek pagination.

15. Keep API projections narrow.`,

      commonMistakes: [
        'Explaining only the filter and not the full application query.',
        'Ignoring deep skip values.',
        'Assuming limit automatically makes any query cheap.',
        'Returning full documents unnecessarily.',
        'Ignoring projection-based coverage opportunities.'
      ],

      bestPractices: [
        'Reproduce the complete application query.',
        'Use limits for bounded APIs.',
        'Avoid large skip values for deep pagination.',
        'Use narrow projections.',
        'Consider seek pagination for large ordered datasets.'
      ],

      interviewAnswer: `LIMIT can reduce work by allowing execution to stop after enough results are found, while SKIP can increase work because MongoDB must advance past skipped entries.

Projection reduces returned data and may enable covered queries.

I always analyze the exact application query including filter, sort, limit, skip, and projection because each can materially change execution behavior.`,

      keyTakeaways: [
        'LIMIT can stop work early.',
        'Deep SKIP can be expensive.',
        'Projection can reduce fetch and network cost.',
        'Query shape includes more than the filter.',
        'Pagination design is part of query optimization.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 10,
    question:
      'How should a DBA perform a structured explain-plan review for a slow query from start to finish?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A DBA should not read an explain plan randomly.

A repeatable sequence makes query troubleshooting faster and more reliable.

The goal is to answer:

1. What did MongoDB do?
2. How much work did it perform?
3. Why did it perform that work?
4. What change can reduce unnecessary work?`,

      coreConcept: `A practical explain review can follow this order:

Query shape
    |
    v
Winning plan
    |
    v
Access stage
    |
    v
Index used
    |
    v
Index bounds
    |
    v
FETCH / filters
    |
    v
SORT
    |
    v
nReturned
    |
    v
Keys examined
    |
    v
Docs examined
    |
    v
Candidate fix`,

      detailedExplanation: `STEP 1 — CAPTURE THE EXACT QUERY

Include:

• filter
• sort
• projection
• limit
• skip
• collation

Do not simplify the query before analysis.

STEP 2 — RUN EXECUTIONSTATS

Example:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).limit(50).explain("executionStats")

STEP 3 — CHECK WINNING PLAN

Identify:

COLLSCAN?

IXSCAN?

Other relevant execution stages?

STEP 4 — IDENTIFY THE INDEX

If IXSCAN:

Which index?

What is its keyPattern?

STEP 5 — INSPECT INDEX BOUNDS

Are leading fields tightly constrained?

Are fields unbounded?

Is a large range scanned?

STEP 6 — INSPECT FETCH

Does FETCH contain residual filtering?

How many documents are examined?

STEP 7 — CHECK SORT

Is there an explicit SORT?

Can index order satisfy it?

STEP 8 — RECORD EXECUTION METRICS

nReturned

totalKeysExamined

totalDocsExamined

executionTimeMillis

STEP 9 — CALCULATE WORK EFFICIENCY

Example:

returned:
50

keys examined:
2,000,000

docs examined:
500,000

This is clearly inefficient.

STEP 10 — CHECK QUERY FREQUENCY

A 200 ms query running once per hour may not be urgent.

A 20 ms query running 50,000 times per second may be one of the largest CPU consumers.

STEP 11 — IDENTIFY ROOT CAUSE

Possibilities:

• missing index
• wrong compound order
• bad range position
• low selectivity
• deep skip
• expensive regex
• residual FETCH filtering
• blocking sort
• multikey expansion
• query shape changed

STEP 12 — DESIGN ONE CONTROLLED CHANGE

Example:

Current:

{
  status: 1,
  customerId: 1
}

Candidate:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

STEP 13 — RE-RUN EXPLAIN

Compare before and after.

STEP 14 — CHECK WRITE COST

An index improvement must still be justified by its impact on:

• insert cost
• update cost
• disk
• cache
• replication

This produces a complete DBA-level analysis rather than simply saying:

"Create an index."`,

      internalWorking: `Slow Query
    |
    v
Exact Query Shape
    |
    v
executionStats
    |
    v
Winning Plan
    |
    +--> COLLSCAN?
    |
    +--> IXSCAN?
    |
    v
Index Bounds
    |
    v
FETCH / SORT
    |
    v
Work Metrics
    |
    v
Root Cause
    |
    v
Candidate Change
    |
    v
Measure Again`,

      architecture: `                EXPLAIN REVIEW
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
    Access Path     Filtering       Sorting
       |              |              |
       v              v              v
 COLLSCAN/IXSCAN    FETCH          SORT
       |              |              |
       +--------------+--------------+
                      |
                      v
                Work Metrics
                      |
            +---------+---------+
            |         |         |
            v         v         v
          Keys       Docs     Returned
                      |
                      v
                 Root Cause`,

      examples: [
        `Full query review:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).limit(50).explain("executionStats")`,

        `Index inventory:

db.orders.getIndexes()`,

        `Deeper planner review:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).limit(50).explain("allPlansExecution")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).limit(50).explain("executionStats")',
          explanation:
            'Provides the main evidence required for structured slow-query analysis.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Provides index definitions for comparing the query with current access paths.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).limit(50).explain("allPlansExecution")',
          explanation:
            'Provides deeper candidate-plan information if normal executionStats does not fully explain planner choice.'
        }
      ],

      productionScenario: `An API query takes four seconds.

The DBA performs a structured review.

Query:

{
  customerId: 1001,
  status: "FAILED",
  amount: {
    $gte: 500
  }
}

Sort:

{
  createdAt: -1
}

Current index:

{
  customerId: 1,
  amount: 1,
  status: 1,
  createdAt: -1
}

Explain shows:

IXSCAN

keys examined:
3,800,000

docs examined:
600,000

returned:
42

SORT:
present

Analysis:

customerId equality is good.

But amount range occurs before:

status equality

and:

createdAt sort.

The broad range causes massive scanning and prevents useful ordering for createdAt.

The DBA tests:

{
  customerId: 1,
  status: 1,
  createdAt: -1,
  amount: 1
}

Now the equality prefix is tighter and sort can be preserved.

After validation:

keys examined:
55

docs examined:
42

returned:
42

SORT:
removed

This is an explain-driven optimization rather than guesswork.`,

      troubleshootingApproach: `Structured DBA checklist:

1. Capture exact application query.

2. Capture parameters and BSON types.

3. Include projection.

4. Include sort.

5. Include limit.

6. Include skip.

7. Run executionStats.

8. Identify winning plan.

9. Identify access stage.

10. Identify index.

11. Inspect keyPattern.

12. Inspect indexBounds.

13. Inspect FETCH.

14. Inspect residual filters.

15. Inspect SORT.

16. Record nReturned.

17. Record totalKeysExamined.

18. Record totalDocsExamined.

19. Record latency.

20. Check query frequency.

21. Check existing indexes.

22. Identify root cause.

23. Design one candidate fix.

24. Test it.

25. Compare before/after work.

26. Check write overhead.

27. Deploy carefully.

28. Monitor production.

29. Keep rollback path.

30. Document final result.`,

      commonMistakes: [
        'Looking at only one explain field.',
        'Stopping when IXSCAN is found.',
        'Ignoring sort and residual filtering.',
        'Changing indexes before identifying the root cause.',
        'Testing with unrealistic query parameters.'
      ],

      bestPractices: [
        'Use a consistent explain-analysis checklist.',
        'Capture the complete application query.',
        'Prioritize work metrics over assumptions.',
        'Change one thing at a time.',
        'Compare before and after execution statistics.'
      ],

      interviewAnswer: `For a slow MongoDB query I first reproduce the exact application query and run explain("executionStats").

I inspect the winning plan, access stage, index name, key pattern, index bounds, FETCH filters, SORT stages, nReturned, totalKeysExamined, and totalDocsExamined.

Then I identify the root cause, test one targeted index or query change, compare before-and-after execution work, and finally consider the write and operational cost before production deployment.`,

      keyTakeaways: [
        'Explain review should follow a repeatable process.',
        'Access path alone is not enough.',
        'Bounds, FETCH, SORT, and work metrics all matter.',
        'Root cause should be identified before changing indexes.',
        'Before-and-after comparison proves whether optimization worked.'
      ]
    }
  },
  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 11,
    question:
      'How should a DBA use allPlansExecution to compare competing query plans and understand why one plan won?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `When multiple indexes can potentially satisfy a query, MongoDB may evaluate more than one candidate plan before selecting a winner.

The allPlansExecution explain verbosity gives deeper visibility into this plan-selection process.

It is useful when a DBA asks:

"Why did MongoDB choose this index instead of the other one?"`,

      coreConcept: `Example:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).explain("allPlansExecution")

The output can include information about:

• the winning plan
• rejected candidate plans
• trial execution behavior
• stage-level work during plan selection

The goal is not simply to count how many plans exist.

The goal is to compare how efficiently candidate plans produce useful results.`,

      detailedExplanation: `Suppose the collection has:

Index A:

{
  customerId: 1
}

Index B:

{
  status: 1
}

Index C:

{
  customerId: 1,
  status: 1
}

The query is:

{
  customerId: 1001,
  status: "OPEN"
}

MongoDB may consider several possible plans.

Candidate A:

IXSCAN customerId

then:

FETCH

then filter:

status = OPEN

Candidate B:

IXSCAN status

then:

FETCH

then filter:

customerId = 1001

Candidate C:

compound IXSCAN

customerId + status

Candidate C may produce useful results with much less work.

allPlansExecution can help expose how candidate plans behaved during the planner's evaluation period.

A DBA should be careful when reading trial metrics.

The candidate plans do not necessarily run to full completion during plan competition.

Therefore numbers shown for rejected candidates are not always directly equivalent to a complete executionStats run of each candidate.

If exact full-plan comparisons are needed, a DBA may use hint() in a controlled environment to execute each candidate access path separately.

The correct interpretation is:

allPlansExecution helps explain plan competition.

It is not automatically a full benchmark of every candidate plan.`,

      internalWorking: `Query
  |
  v
Candidate Plan Trial
  |
  +--> Plan A
  |     produces few useful results
  |     after significant work
  |
  +--> Plan B
  |     moderate work
  |
  +--> Plan C
        produces results efficiently
  |
  v
Planner chooses winner
  |
  v
Winning plan continues`,

      architecture: `                 Query
                   |
                   v
             Candidate Trial
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
    Plan A      Plan B      Plan C
       |           |           |
       +-----------+-----------+
                   |
                   v
             Compare progress
                   |
                   v
               Winner`,

      examples: [
        `Deep plan inspection:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).explain("allPlansExecution")`,

        `Normal execution metrics:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).explain("executionStats")`,

        `Controlled candidate comparison:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).hint({
  customerId: 1
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).explain("allPlansExecution")',
          explanation:
            'Shows the winning plan and additional trial information for candidate plans considered during plan selection.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).hint({ customerId: 1 }).explain("executionStats")',
          explanation:
            'Forces one candidate index for a controlled full execution comparison when diagnostic testing is required.'
        }
      ],

      productionScenario: `MongoDB chooses:

{
  customerId: 1,
  status: 1
}

instead of:

{
  status: 1,
  customerId: 1
}

Developers believe both indexes are identical because both contain the same fields.

The DBA uses allPlansExecution and examines data distribution.

For the workload:

customerId = 1001

is highly selective.

status = OPEN

matches most of the collection.

The customerId-leading index produces useful results much faster during plan competition.

The planner's decision is therefore consistent with the workload.`,

      troubleshootingApproach: `For plan competition:

1. Capture exact query shape.

2. List candidate indexes.

3. Run executionStats.

4. If planner choice remains unclear, run allPlansExecution.

5. Identify winning plan.

6. Identify rejected plans.

7. Compare stage structure.

8. Examine trial work carefully.

9. Review index bounds.

10. Review data selectivity.

11. Check sort requirements.

12. Use hint only for controlled comparison if necessary.

13. Run full executionStats for hinted candidates.

14. Compare multiple representative parameter values.

15. Avoid permanently forcing a plan based only on one test.`,

      commonMistakes: [
        'Treating candidate trial statistics as full-query benchmarks.',
        'Assuming rejected plans are globally bad.',
        'Ignoring data distribution.',
        'Using hint immediately in application code.',
        'Comparing plans using only executionTimeMillis.'
      ],

      bestPractices: [
        'Use allPlansExecution when planner choice needs deeper explanation.',
        'Understand that candidate evaluation is a trial.',
        'Use hint only for controlled testing.',
        'Compare multiple realistic values.',
        'Interpret planner decisions in workload context.'
      ],

      interviewAnswer: `allPlansExecution helps me understand how MongoDB evaluated competing candidate plans during plan selection.

I inspect the winner, rejected plans, stage structure, index bounds, and trial work.

Because rejected candidates may only execute during a limited trial period, I do not treat those metrics as full benchmarks. If necessary, I use hint in a controlled environment to execute candidate plans fully and compare executionStats.`,

      keyTakeaways: [
        'allPlansExecution exposes deeper candidate-plan information.',
        'Candidate trials are not always full executions.',
        'Data selectivity strongly affects plan competition.',
        'hint can help controlled benchmarking.',
        'Planner choices should be validated with real workload data.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 12,
    question:
      'What is query plan caching and replanning in MongoDB, and how would you investigate a query whose performance changes over time?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `Running full plan competition for every repeated query would add unnecessary planning overhead.

MongoDB can therefore cache planning information for recurring query shapes.

If the cached plan later performs poorly enough under changed conditions, MongoDB can also re-evaluate planning according to the behavior supported by that server version and execution engine.`,

      coreConcept: `Conceptually:

First query
    |
    v
Plan competition
    |
    v
Winning plan
    |
    v
Plan-cache entry


Later similar query
    |
    v
Use cached planning information


If conditions change
    |
    v
Plan may become inefficient
    |
    v
Replanning / cache state can change`,

      detailedExplanation: `Consider a query shape:

{
  status: ?
}

Initially:

FAILED = 0.1% of documents

An index on status is extremely selective.

Months later:

FAILED = 40%

The same logical query shape now behaves very differently.

Other causes of changing plan behavior include:

• collection growth
• new indexes
• dropped indexes
• hidden indexes
• application query changes
• parameter-value skew
• data distribution changes
• server restart
• plan cache invalidation
• upgrade-related planner behavior

A DBA may observe symptoms such as:

• fast immediately after restart, slower later
• slow immediately after an index deployment
• one parameter is fast while another is slow
• execution plan changes unexpectedly
• latency changes without application-code changes

The correct approach is not:

clear the plan cache every night.

That hides the symptom.

Instead determine:

1. Which query shape is unstable?
2. Which data values cause different cost?
3. Which index is selected?
4. Is one index robust across the workload?
5. Has data distribution changed?
6. Is query design too parameter-sensitive?

Plan-cache behavior is one part of the investigation, not the entire diagnosis.`,

      internalWorking: `Query Shape
    |
    v
Plan Selection
    |
    v
Cached Planning State
    |
    v
Repeated Executions
    |
    v
Data / workload changes
    |
    v
Plan no longer ideal?
    |
    v
Potential re-evaluation`,

      architecture: `Application
    |
    v
Query Shape
    |
    v
Planner / Cache
    |
    v
Execution Plan
    |
    v
Performance


Changes:

Data
Indexes
Parameters
Restart
Upgrade
    |
    v
Potential plan change`,

      examples: [
        `Compare parameter values:

db.orders.find({
  status: "FAILED"
}).explain("executionStats")

db.orders.find({
  status: "SUCCESS"
}).explain("executionStats")`,

        `Inspect plan cache where supported:

db.orders.getPlanCache().list()`,

        `Clear only when justified:

db.orders.getPlanCache().clear()`
      ],

      commands: [
        {
          command:
            'db.orders.getPlanCache().list()',
          explanation:
            'Lists plan-cache information exposed by the current MongoDB version and shell.'
        },
        {
          command:
            'db.orders.getPlanCache().clear()',
          explanation:
            'Clears collection plan-cache entries. This should be used only as a deliberate diagnostic or corrective action.'
        }
      ],

      productionScenario: `A query runs in 30 ms after a primary restart.

Several hours later it takes 1.5 seconds.

The team proposes a scheduled restart every night.

The DBA instead investigates:

• query shape
• plan selected over time
• parameter distribution
• competing indexes
• plan-cache state

They discover one query shape serves both highly selective and extremely broad parameter values.

A new workload-specific access strategy provides stable performance across important values.

The restart was only resetting planning state and masking the real issue.`,

      troubleshootingApproach: `For time-varying plan performance:

1. Identify exact query shape.

2. Capture fast parameter values.

3. Capture slow parameter values.

4. Run executionStats for both.

5. Compare indexes used.

6. Compare bounds.

7. Compare keys examined.

8. Compare docs examined.

9. Check data distribution.

10. Check recent index changes.

11. Check restart timeline.

12. Inspect plan-cache information if relevant.

13. Avoid repeated cache clearing as a permanent solution.

14. Test a more stable index/query design.

15. Monitor over a representative business cycle.`,

      commonMistakes: [
        'Scheduling restarts to fix query planning.',
        'Clearing plan cache without evidence.',
        'Ignoring parameter skew.',
        'Assuming a cached plan can never change.',
        'Ignoring server-version differences.'
      ],

      bestPractices: [
        'Treat plan cache as part of the diagnosis.',
        'Compare fast and slow parameter values.',
        'Design indexes for realistic data distributions.',
        'Prefer stable workload solutions.',
        'Document performance before and after planner changes.'
      ],

      interviewAnswer: `MongoDB can cache planning information for recurring query shapes to avoid repeating full candidate-plan evaluation.

If data distribution, parameters, or indexes change, a previously good access plan may become less suitable and replanning behavior can become relevant.

I compare fast and slow values, plans, bounds, examined counts, and plan-cache state, but I do not use cache clearing or restarts as a permanent tuning strategy.`,

      keyTakeaways: [
        'Plan caching reduces repeated planning overhead.',
        'Workload changes can alter plan suitability.',
        'Parameter skew matters.',
        'Replanning behavior is version-dependent.',
        'Fix the workload or index design rather than repeatedly clearing cache.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 13,
    question:
      'What should a DBA understand about MongoDB classic execution plans versus the Slot-Based Execution engine when reading explain output?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `MongoDB has evolved its query execution architecture over time.

Historically, many explain examples were based on the classic query execution engine.

Modern MongoDB versions can execute eligible query shapes using the Slot-Based Execution engine, commonly called SBE.

A DBA may therefore see explain output that looks different from older documentation or examples.`,

      coreConcept: `The most important rule is:

Do not memorize only one JSON layout.

Understand the meaning of the plan.

Regardless of execution engine, the DBA still needs to answer:

• Was a collection scan used?
• Was an index used?
• Which index?
• How many keys were examined?
• How many documents were examined?
• Was sorting required?
• Where was filtering performed?
• How many results were returned?`,

      detailedExplanation: `The classic engine traditionally exposes familiar stages such as:

COLLSCAN

IXSCAN

FETCH

SORT

LIMIT

MongoDB's Slot-Based Execution architecture uses a different internal execution model.

Depending on MongoDB version and query shape, explain output may include:

• queryPlanner information
• winningPlan
• queryPlan
• slotBasedPlan
• executionStages with engine-specific representation

Not every query uses SBE.

Eligibility and coverage have expanded over MongoDB releases and can vary by operation.

A DBA should therefore avoid statements such as:

"MongoDB 7 or 8 always uses SBE for every query."

That is too broad.

The practical DBA workflow remains stable:

1. Identify the logical winning access path.
2. Identify index usage.
3. Inspect bounds.
4. Review execution statistics.
5. Look for document fetch/filter work.
6. Look for sort.
7. Compare examined work against returned results.

Execution-engine knowledge becomes especially valuable when:

• explain structure differs from expected output
• interpreting newer plan details
• comparing behavior before/after version upgrades
• working with advanced performance investigations

But a slow query is not automatically caused by SBE or classic execution.

The first question remains:

How much unnecessary work is the query doing?`,

      internalWorking: `MongoDB Query
      |
      v
Planner
      |
      v
Eligible execution strategy
      |
  +---+---+
  |       |
  v       v
Classic   SBE
Engine    Engine
  |       |
  +---+---+
      |
      v
Execution metrics
      |
      v
DBA analysis`,

      architecture: `                Query
                  |
                  v
               Planner
                  |
                  v
         Execution Engine
             /        \
            /          \
       Classic          SBE
          |              |
          +------+-------+
                 |
                 v
          Explain Output
                 |
                 v
          Logical Analysis`,

      examples: [
        `Basic explain:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Inspect the logical plan even if additional slot-based details are present.`,

        `Compare explain output before and after a major MongoDB upgrade in a staging environment.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows the actual explain representation used for the query on the current MongoDB version and execution engine.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Confirms the MongoDB server version when interpreting version-dependent explain structures.'
        }
      ],

      productionScenario: `A DBA upgrades a staging environment and notices explain output now contains fields that were not present in an older production version.

They initially believe the query plan is broken because the JSON structure is different.

Instead, they identify:

• the same compound index is still selected
• keys examined are comparable
• docs examined are comparable
• nReturned is identical
• latency improves

The explain representation changed because planner/execution internals evolved.

The DBA evaluates logical behavior and metrics instead of comparing JSON line-for-line.`,

      troubleshootingApproach: `When explain output differs across versions:

1. Confirm MongoDB version.

2. Capture the complete explain.

3. Identify logical winning plan.

4. Find index name/key pattern.

5. Find bounds.

6. Find nReturned.

7. Find keys examined.

8. Find docs examined.

9. Identify sort/filter work.

10. Note engine-specific plan representation.

11. Compare workload behavior, not only JSON structure.

12. Test upgrades with representative queries.

13. Review release-specific documentation if interpreting an unfamiliar engine field.`,

      commonMistakes: [
        'Assuming all MongoDB queries always use SBE.',
        'Treating different explain JSON as a regression by itself.',
        'Memorizing field locations instead of plan semantics.',
        'Blaming the execution engine before checking scan volume.',
        'Comparing plans across versions without workload metrics.'
      ],

      bestPractices: [
        'Understand logical stages and work metrics.',
        'Expect explain structure to evolve.',
        'Validate important queries during upgrades.',
        'Use the server version when interpreting advanced details.',
        'Focus on total work and results.'
      ],

      interviewAnswer: `MongoDB can use the classic query execution engine or the newer Slot-Based Execution engine for eligible query shapes, depending on version and operation.

Explain output can therefore differ across versions.

I focus first on logical access path, index usage, bounds, sort/filter behavior, nReturned, keys examined, and documents examined rather than assuming one fixed explain JSON structure.`,

      keyTakeaways: [
        'Modern MongoDB may use SBE for eligible queries.',
        'Not every query necessarily uses the same engine.',
        'Explain structure can change by version.',
        'Logical plan interpretation remains essential.',
        'Upgrade testing should include representative query plans.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 14,
    question:
      'How do you analyze explain output for aggregation pipelines, especially when $match, $sort, $project, $group, and $lookup are involved?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `Aggregation pipelines can perform much more than a normal find query.

Example:

db.orders.aggregate([
  {
    $match: {
      customerId: 1001
    }
  },
  {
    $sort: {
      createdAt: -1
    }
  },
  {
    $limit: 100
  }
])

A DBA must determine which parts of the pipeline can use indexes and which parts require in-memory or blocking work.`,

      coreConcept: `For aggregation tuning, stage order is extremely important.

A common efficient pattern is:

$match
   |
   v
$sort
   |
   v
$limit
   |
   v
later transformation

when the filter and sort can use an appropriate index.

Expensive stages should ideally process as little data as possible.`,

      detailedExplanation: `$MATCH

A selective $match near the beginning can reduce the number of documents entering later stages.

If supported by an index and optimizer behavior, it can produce an indexed access path.

$SORT

If an index provides the required ordering, MongoDB can avoid an expensive blocking sort.

If the sort occurs after a transformation that destroys useful index ordering, the index may no longer help.

$PROJECT

Projection can reduce document shape and data carried forward.

However, blindly placing $project first does not automatically improve performance because MongoDB can perform projection optimization internally in many cases.

$GROUP

$group is often a blocking or memory-intensive operation because documents must be aggregated into groups.

The key optimization is usually:

reduce data before the group.

$LOOKUP

$lookup performs join-like work.

Performance depends on factors such as:

• number of input documents
• foreign collection indexing
• join predicate
• pipeline form
• result fan-out

Example:

orders.customerId

joins:

customers._id

The foreign field should usually have an appropriate index.

A very common production problem is:

$lookup against an unindexed foreign field.

This can multiply work dramatically.

Explain for aggregation can contain:

• queryPlanner/execution statistics for cursor access
• pipeline stage statistics
• execution details for optimized stages
• engine-specific structures

The DBA should follow the data volume through the pipeline:

How many documents enter each expensive stage?

How many leave it?`,

      internalWorking: `Bad:

All documents
    |
    v
$lookup
    |
    v
$group
    |
    v
$match
    |
    v
Result


Better when semantics allow:

Selective $match
    |
    v
Indexed $sort
    |
    v
$limit
    |
    v
$lookup / $group
    |
    v
Result`,

      architecture: `Aggregation Pipeline

Input
 |
 v
$match
 |
 v
$sort
 |
 v
$limit
 |
 v
$lookup
 |
 v
$group
 |
 v
Output


DBA asks at every stage:

How many documents?
Index supported?
Blocking?
Memory intensive?`,

      examples: [
        `Explain aggregation:

db.orders.explain("executionStats").aggregate([
  {
    $match: {
      customerId: 1001
    }
  },
  {
    $sort: {
      createdAt: -1
    }
  },
  {
    $limit: 100
  }
])`,

        `Lookup example:

db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  }
])`,

        `Supporting index:

db.orders.createIndex({
  customerId: 1,
  createdAt: -1
})`
      ],

      commands: [
        {
          command:
            'db.orders.explain("executionStats").aggregate([{ $match: { customerId: 1001 } }, { $sort: { createdAt: -1 } }, { $limit: 100 }])',
          explanation:
            'Shows execution details for an aggregation pipeline including initial indexed access where applicable.'
        },
        {
          command:
            'db.customers.getIndexes()',
          explanation:
            'Helps verify that fields used by $lookup on the foreign collection are appropriately indexed.'
        }
      ],

      productionScenario: `A reporting aggregation takes 45 seconds.

Pipeline:

$lookup
$unwind
$match
$group

The collection contains 200 million orders.

The final filter returns only one customer's data.

The DBA redesigns the pipeline where semantics allow:

$match customer first

then:

$lookup

then:

$group

Now the expensive join and grouping stages process thousands of records instead of hundreds of millions.

Additionally, the join field on the foreign collection is indexed.

The major improvement came from reducing input early, not from increasing server memory.`,

      troubleshootingApproach: `For aggregation explain:

1. Capture full pipeline.

2. Identify early $match stages.

3. Check whether $match is indexed.

4. Check $sort and supporting indexes.

5. Check how many documents enter $group.

6. Check how many enter $lookup.

7. Verify foreign join indexes.

8. Inspect $unwind fan-out.

9. Inspect $limit placement.

10. Check blocking stages.

11. Check spill/disk-related symptoms where applicable.

12. Compare documents entering and leaving stages.

13. Move selective filtering earlier when semantics allow.

14. Test one pipeline change at a time.

15. Re-run explain and measure.`,

      commonMistakes: [
        'Looking only at the first pipeline stage.',
        'Ignoring $lookup foreign indexes.',
        'Grouping huge datasets before filtering.',
        'Assuming $project first always improves performance.',
        'Ignoring fan-out from $unwind and $lookup.'
      ],

      bestPractices: [
        'Reduce data early.',
        'Index important initial matches and sorts.',
        'Index foreign lookup fields.',
        'Track cardinality through the pipeline.',
        'Treat blocking stages as capacity-sensitive.'
      ],

      interviewAnswer: `For aggregation explain analysis I track how much data enters each stage and determine which stages can use indexes.

I focus on early selective $match, index-supported $sort, limiting data before expensive $group or $lookup stages, and ensuring foreign lookup fields are indexed.

The key is to minimize the number of documents reaching expensive blocking or join stages.`,

      keyTakeaways: [
        'Aggregation tuning is stage-order sensitive.',
        'Reduce input before expensive stages.',
        '$lookup indexing is critical.',
        '$group can be memory-intensive.',
        'Explain should be read across the whole pipeline.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 15,
    question:
      'How do data skew and parameter selectivity affect query plans, and why can the same query shape be fast for one value and slow for another?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Two queries can look structurally identical but return completely different amounts of data.

Example:

{
  status: "FAILED"
}

and:

{
  status: "SUCCESS"
}

The query shape is very similar.

But if:

FAILED = 0.1%

and:

SUCCESS = 95%

the amount of work can be dramatically different.`,

      coreConcept: `This is called data skew or uneven value distribution.

A field may have high cardinality overall but still contain very common values.

Query optimization must therefore consider:

not only the field

but also:

how values are distributed inside that field.`,

      detailedExplanation: `Suppose there are 500 million transactions.

Distribution:

SUCCESS:
450 million

FAILED:
500,000

PENDING:
2 million

OTHER:
remaining records

Index:

{
  status: 1
}

Query:

status = FAILED

The index is highly selective.

Query:

status = SUCCESS

The same index may need to traverse hundreds of millions of entries and fetch huge numbers of documents.

Now add:

customerId.

Query:

{
  customerId: 1001,
  status: "SUCCESS"
}

Compound index:

{
  customerId: 1,
  status: 1
}

may become highly selective because customerId narrows the dataset first.

This demonstrates why performance should be tested using representative values.

Another skew example:

tenantId.

Tenant A:
10,000 documents

Tenant B:
500 million documents

A query that performs well for Tenant A may become disastrous for Tenant B despite having the same query shape.

L3 troubleshooting must therefore ask:

Which values are slow?

Not just:

Which query is slow?`,

      internalWorking: `Same field:

status

       |
 +-----+-----------+
 |                 |
 v                 v
FAILED           SUCCESS
0.1%              95%
 |                 |
 v                 v
small scan       huge scan


Same query structure
Different work`,

      architecture: `Query Shape
    |
    v
Parameter Value
    |
    v
Data Distribution
    |
    v
Selectivity
    |
    v
Keys / Docs Examined
    |
    v
Latency`,

      examples: [
        `Selective:

db.orders.find({
  status: "FAILED"
}).explain("executionStats")`,

        `Broad:

db.orders.find({
  status: "SUCCESS"
}).explain("executionStats")`,

        `More selective compound predicate:

db.orders.find({
  customerId: 1001,
  status: "SUCCESS"
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ status: "FAILED" }).explain("executionStats")',
          explanation:
            'Shows execution behavior for a rare value.'
        },
        {
          command:
            'db.orders.find({ status: "SUCCESS" }).explain("executionStats")',
          explanation:
            'Shows execution behavior for a common value using the same field.'
        }
      ],

      productionScenario: `A query passes QA because test data contains only small tenants.

After production deployment, one large tenant sees 15-second response time.

Query:

{
  tenantId: X,
  createdAt: {
    $gte: ...
  }
}

The index is valid.

But the largest tenant owns 40% of the entire collection.

A one-year date range for that tenant scans hundreds of millions of entries.

The DBA recognizes that the issue is not simply:

"index missing."

The request itself is extremely broad for the large tenant.

The solution may include:

• tighter date ranges
• pagination
• archival strategy
• workload-specific index design
• pre-aggregation
• product/API limits`,

      troubleshootingApproach: `For data skew:

1. Identify slow parameter values.

2. Identify fast values.

3. Compare executionStats.

4. Compare nReturned.

5. Compare keys examined.

6. Compare docs examined.

7. Check value distribution.

8. Check tenant/data skew.

9. Check range breadth.

10. Check whether one index serves all parameter values well.

11. Review API limits.

12. Test realistic production-like data.

13. Avoid benchmarking with only tiny sample values.`,

      commonMistakes: [
        'Testing only one parameter value.',
        'Assuming high-cardinality means every value is selective.',
        'Ignoring large tenants.',
        'Blaming query planner for legitimately broad requests.',
        'Using unrealistic QA datasets.'
      ],

      bestPractices: [
        'Benchmark representative values.',
        'Include worst-case tenants and ranges.',
        'Monitor per-query-shape and parameter behavior where possible.',
        'Use workload-aware API limits.',
        'Design for skew rather than averages.'
      ],

      interviewAnswer: `The same query shape can have very different performance when parameter values have different selectivity.

For example, status FAILED may match 0.1% while SUCCESS matches 95%.

I compare executionStats across representative values and examine keys examined, docs examined, range size, and tenant/data distribution before deciding whether the problem is the index, query design, or simply a very broad request.`,

      keyTakeaways: [
        'Selectivity depends on values, not only fields.',
        'Data skew causes parameter-dependent performance.',
        'Large tenants need worst-case testing.',
        'Broad requests can be expensive even with indexes.',
        'Use representative production data.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 16,
    question:
      'A production query suddenly changes from IXSCAN to COLLSCAN after a deployment. How would you investigate the root cause?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 16,

    answer: {
      groundZero: `When an important query suddenly changes from IXSCAN to COLLSCAN, the first question is:

What changed?

The index itself is only one possibility.

The application query may have changed in a way that makes the existing index unsuitable.`,

      coreConcept: `Possible causes include:

• index dropped
• index hidden
• query field changed
• BSON type changed
• collation changed
• partial-index condition no longer satisfied
• regex semantics changed
• expression changed
• compound prefix changed
• new query shape
• data distribution changed enough to alter cost
• deployment introduced a new endpoint behavior`,

      detailedExplanation: `Suppose before deployment:

Query:

{
  customerId: 1001
}

Index:

{
  customerId: 1
}

After deployment:

Query:

{
  customer: {
    id: 1001
  }
}

The logical application meaning may appear similar, but the indexed path is now different.

Another example:

Before:

{
  customerId: 1001
}

After:

{
  customerId: "1001"
}

BSON types changed.

Another example:

Before:

{
  username: {
    $regex: "^vivek"
  }
}

After:

{
  username: {
    $regex: "vivek"
  }
}

The prefix anchor was removed.

Another example:

Partial index:

{
  customerId: 1
}

partial condition:

{
  active: true
}

Old query:

{
  customerId: 1001,
  active: true
}

New query:

{
  customerId: 1001
}

The new query cannot safely rely on an index containing only active documents because it requests both active and inactive matches.

The DBA should compare exact before/after query representations rather than starting by rebuilding indexes.`,

      internalWorking: `Before deployment

Query Shape A
     |
     v
Index compatible
     |
     v
IXSCAN


After deployment

Query Shape B
     |
     v
Index incompatible / unattractive
     |
     v
COLLSCAN`,

      architecture: `Deployment
    |
    v
Query Changed?
    |
    +--> Field
    +--> Type
    +--> Regex
    +--> Collation
    +--> Partial condition
    +--> Sort
    +--> Range
    |
    v
Planner decision
    |
    v
COLLSCAN`,

      examples: [
        `Current query:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Check indexes:

db.orders.getIndexes()`,

        `Compare with application logs or previous release query shape.`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Confirms whether the expected index still exists, is hidden, or has different options.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows the current production-style query plan and actual work.'
        }
      ],

      productionScenario: `A payment API normally uses:

{
  merchantId: 12345,
  active: true
}

with a partial index.

After deployment the application removes:

active: true

because developers assume active is always true.

MongoDB begins scanning much more data and does not use the partial index for the broader query.

The DBA identifies the query change in application logs.

No index corruption occurred.

The index was designed for different semantics.`,

      troubleshootingApproach: `For sudden IXSCAN-to-COLLSCAN regression:

1. Establish exact deployment timestamp.

2. Capture current query.

3. Retrieve previous query shape.

4. Compare fields.

5. Compare BSON types.

6. Compare regex.

7. Compare collation.

8. Compare sort.

9. Compare projection.

10. Compare partial-index predicates.

11. Check existing indexes.

12. Check hidden status.

13. Run executionStats.

14. Inspect rejected plans.

15. Check data distribution.

16. Correlate with application release.

17. Reproduce in staging.

18. Fix the actual changed condition.

19. Avoid rebuilding the index unless evidence supports it.`,

      commonMistakes: [
        'Rebuilding indexes immediately.',
        'Ignoring application query changes.',
        'Ignoring BSON type changes.',
        'Ignoring partial-index semantics.',
        'Assuming deployment timing is irrelevant.'
      ],

      bestPractices: [
        'Capture query shapes during deployments.',
        'Compare exact BSON query structures.',
        'Record index definitions.',
        'Use explain before modifying indexes.',
        'Correlate application and database timelines.'
      ],

      interviewAnswer: `If a production query changes from IXSCAN to COLLSCAN, I first compare the exact query before and after the deployment.

I check field paths, BSON types, regex, collation, partial-index predicates, sort, index existence and hidden state, then inspect executionStats and rejected plans.

I fix the changed cause instead of automatically rebuilding the index.`,

      keyTakeaways: [
        'Query changes are common causes of planner changes.',
        'BSON type and semantics matter.',
        'Partial indexes require compatible predicates.',
        'Deployment correlation is important.',
        'Index rebuild is not a generic solution.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 17,
    question:
      'A query returns only 50 documents but examines 10 million keys and 2 million documents. How would you use explain to isolate exactly where the wasted work occurs?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 17,

    answer: {
      groundZero: `The numbers already tell us the query is doing far more work than the useful output requires:

nReturned:
50

totalKeysExamined:
10,000,000

totalDocsExamined:
2,000,000

But an L3 DBA must go further.

The question is:

Where are those candidates being eliminated?`,

      coreConcept: `There are two major waste points:

INDEX WASTE

Millions of keys are scanned before candidates are identified.

DOCUMENT WASTE

Millions of documents are fetched but later rejected by filters.

Explain can help separate these two problems.`,

      detailedExplanation: `STEP 1 — ANALYSE IXSCAN

Check:

keyPattern

indexName

indexBounds

If bounds are broad:

the index itself is generating too many candidates.

Example:

Index:

{
  status: 1,
  customerId: 1,
  amount: 1
}

Query:

{
  customerId: 1001,
  amount: {
    $gte: 500
  }
}

status is unconstrained.

The planner may scan a very broad index region.

STEP 2 — ANALYSE FETCH

Suppose:

10 million keys

become:

2 million fetched documents.

Then FETCH applies:

region = "INDIA"

and returns:

50.

That means the region predicate eliminates almost all fetched documents.

A better compound index may move region into index filtering.

STEP 3 — ANALYSE SORT

A SORT stage after 2 million documents could add enormous additional cost.

STEP 4 — ANALYSE RANGE POSITION

Suppose index:

{
  customerId: 1,
  amount: 1,
  region: 1
}

and query:

customerId equality

region equality

amount range

Placing amount before region may cause a huge range scan before region can effectively narrow the candidate set.

A candidate:

{
  customerId: 1,
  region: 1,
  amount: 1
}

may create tighter bounds.

STEP 5 — ANALYSE MULTIKEY

If an indexed array produces many keys per document, keys examined can greatly exceed documents examined.

The DBA should determine whether multikey expansion contributes to the 10-million-key scan.

The root cause therefore comes from stage-by-stage elimination.`,

      internalWorking: `IXSCAN
10,000,000 keys
      |
      v
Candidate records
      |
      v
FETCH
2,000,000 docs
      |
      v
Residual filter
      |
      v
50 documents
      |
      v
SORT?
      |
      v
Return`,

      architecture: `10M Keys
   |
   v
Where did they come from?
   |
   +--> broad bounds
   +--> bad compound order
   +--> multikey expansion
   |
   v
2M Docs
   |
   v
Why were 1,999,950 rejected?
   |
   +--> FETCH filter
   +--> residual predicates
   |
   v
50 Results`,

      examples: [
        `Run:

db.orders.find({
  customerId: 1001,
  region: "INDIA",
  amount: {
    $gte: 500
  }
}).explain("executionStats")`,

        `Inspect:

indexBounds

FETCH filter

SORT stage

isMultiKey / multikey-related plan details where exposed`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, region: "INDIA", amount: { $gte: 500 } }).explain("executionStats")',
          explanation:
            'Provides the stage-by-stage evidence required to locate index-scan and document-filter waste.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows current compound order and whether an alternative index can produce tighter bounds.'
        }
      ],

      productionScenario: `A query returns:

50 documents

but:

keysExamined = 10 million

docsExamined = 2 million

Current index:

{
  customerId: 1,
  amount: 1,
  region: 1
}

Query:

{
  customerId: 1001,
  region: "INDIA",
  amount: {
    $gte: 100
  }
}

amount >= 100 includes almost every transaction for the customer.

region is highly selective but comes after the broad amount range.

The DBA tests:

{
  customerId: 1,
  region: 1,
  amount: 1
}

Now the equality prefix becomes:

customerId + region

before the amount range.

Keys examined and documents fetched collapse dramatically.`,

      troubleshootingApproach: `For huge examined-to-returned gaps:

1. Record nReturned.

2. Record totalKeysExamined.

3. Record totalDocsExamined.

4. Identify IXSCAN.

5. Inspect indexBounds.

6. Identify broad/unbounded keys.

7. Check range placement.

8. Check multikey status.

9. Identify FETCH.

10. Inspect residual filters.

11. Identify SORT.

12. Check amount of data reaching SORT.

13. Compare equality predicates with index order.

14. Test a tighter index.

15. Re-run explain.

16. Confirm reduced keys examined.

17. Confirm reduced docs examined.

18. Measure production frequency and CPU impact.`,

      commonMistakes: [
        'Saying the query is optimized because it uses IXSCAN.',
        'Looking only at totalDocsExamined.',
        'Ignoring key explosion from multikey indexes.',
        'Ignoring FETCH filters.',
        'Adding another index without identifying the waste stage.'
      ],

      bestPractices: [
        'Follow candidate elimination stage by stage.',
        'Inspect both index and document work.',
        'Use bounds to diagnose key-scan waste.',
        'Use FETCH filters to diagnose document waste.',
        'Validate improvements with before-and-after metrics.'
      ],

      interviewAnswer: `I isolate the waste in stages.

First I inspect IXSCAN, keyPattern, and indexBounds to understand why 10 million keys are scanned.

Then I inspect FETCH and residual filters to understand why 2 million documents are fetched but only 50 survive.

I also check sort, range placement, and multikey expansion. The fix should target the stage where unnecessary work is introduced.`,

      keyTakeaways: [
        'Keys examined identify index work.',
        'Docs examined identify fetch work.',
        'FETCH filters reveal document rejection.',
        'Bounds reveal scan breadth.',
        'Stage-by-stage elimination finds the root cause.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 18,
    question:
      'How would you analyze an explain plan for a query that performs an expensive blocking sort even though a compound index already exists?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 18,

    answer: {
      groundZero: `A field merely appearing inside a compound index does not mean MongoDB can use that index to satisfy sorting.

Index ordering must line up with:

• equality predicates
• sort fields
• range predicates
• compound field sequence`,

      coreConcept: `Example:

Index:

{
  customerId: 1,
  amount: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001
}

Sort:

{
  createdAt: -1
}

amount is not fixed by equality.

Therefore createdAt is ordered inside each amount group, not globally across the entire customerId range.

MongoDB may require an explicit SORT.`,

      detailedExplanation: `Consider the logical index ordering:

customerId | amount | createdAt

1001 | 10  | Sep 10
1001 | 10  | Sep 09
1001 | 20  | Sep 15
1001 | 20  | Sep 08

Within each amount value, createdAt is ordered.

But across all amount values, createdAt is not globally ordered.

So:

sort({
  createdAt: -1
})

cannot simply read straight through the index and guarantee correct global ordering.

Now suppose query also includes:

amount = 10

Then both preceding keys:

customerId

and:

amount

are fixed by equality.

createdAt ordering becomes usable.

Another problem occurs when a range appears before the sort field.

Index:

{
  customerId: 1,
  amount: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001,
  amount: {
    $gte: 100
  }
}

Sort:

{
  createdAt: -1
}

The amount range spans many amount values.

Again, global createdAt ordering may not be preserved.

The DBA should inspect:

• filter
• exact compound index order
• equality predicates
• ranges
• sort pattern
• sort direction
• SORT stage
• amount of data entering sort

A common candidate design may be:

{
  customerId: 1,
  createdAt: -1,
  amount: 1
}

if sorting is more important than range filtering for the actual workload.

But this is a trade-off.

If amount range is extremely selective, a different ERS-style order may perform better.

Always validate with executionStats.`,

      internalWorking: `Index:

customerId | amount | createdAt

Query:

customerId = 1001
sort createdAt DESC

Index stream:

amount 10:
  Sep 10
  Sep 09

amount 20:
  Sep 15
  Sep 08

Not globally sorted by createdAt

        |
        v
      SORT`,

      architecture: `Compound Index
      |
      v
Leading fields before sort
      |
   +--+--+
   |     |
Equality  Variable/Range
   |     |
   v     v
Sort may  Sort ordering
be used   broken
          |
          v
         SORT`,

      examples: [
        `Current plan:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
}).explain("executionStats")`,

        `Current index:

{
  customerId: 1,
  amount: 1,
  createdAt: -1
}`,

        `Possible alternative:

{
  customerId: 1,
  createdAt: -1,
  amount: 1
}`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Shows whether an explicit SORT remains despite the existing compound index.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows the exact compound field order and sort directions.'
        }
      ],

      productionScenario: `A customer-history API returns the latest 50 transactions.

Index:

{
  customerId: 1,
  transactionType: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001
}

sort:

createdAt descending

limit:
50

transactionType is not filtered.

Explain shows a large SORT.

The DBA tests:

{
  customerId: 1,
  createdAt: -1
}

Now MongoDB can navigate directly to the newest transactions and stop after 50.

The workload improves significantly.

The previous compound index was not wrong globally; it was simply designed for a different query shape.`,

      troubleshootingApproach: `For blocking sort despite an index:

1. Capture exact filter.

2. Capture exact sort.

3. Inspect compound index order.

4. Identify fields before sort key.

5. Determine which are equality-constrained.

6. Identify ranges.

7. Check sort direction.

8. Run executionStats.

9. Look for SORT.

10. Determine number of records entering sort.

11. Check limit.

12. Test alternate compound order.

13. Compare keys examined.

14. Compare docs examined.

15. Confirm SORT disappears if expected.

16. Check write and storage impact before deployment.`,

      commonMistakes: [
        'Assuming sort field presence is enough.',
        'Ignoring unconstrained fields before the sort key.',
        'Ignoring range predicates before sort.',
        'Ignoring limit optimization opportunities.',
        'Applying ESR mechanically without testing selectivity.'
      ],

      bestPractices: [
        'Understand compound ordering.',
        'Use equality prefixes before sort where appropriate.',
        'Check ranges carefully.',
        'Use explain to prove sort elimination.',
        'Design indexes for actual query patterns.'
      ],

      interviewAnswer: `If a query performs a blocking sort despite a compound index, I inspect the fields preceding the sort key.

Those preceding fields generally need to be constrained in a way that preserves the required order.

An unconstrained or range field before the sort key can break global sort ordering.

I validate alternative index orders with executionStats rather than assuming that simply including the sort field is sufficient.`,

      keyTakeaways: [
        'Sort support depends on index order.',
        'Unconstrained fields can break ordering.',
        'Range before sort can be problematic.',
        'LIMIT can make sort-optimized indexes especially valuable.',
        'Explain must prove sort elimination.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 19,
    question:
      'A query suddenly becomes slow while CPU and disk latency also increase. How would you determine whether the query plan is the cause or only a victim of system pressure?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 19,

    answer: {
      groundZero: `A slow query does not automatically mean the query plan became worse.

The same plan can become slower because:

• CPU is saturated
• disk is slow
• cache pressure increased
• concurrent workload increased
• replication or checkpoints are competing for storage

An L3 DBA must separate:

query-plan inefficiency

from:

infrastructure or workload pressure.`,

      coreConcept: `Compare two categories of evidence:

PLAN EFFICIENCY

• stage structure
• keys examined
• docs examined
• nReturned
• bounds
• sort/filter behavior

SYSTEM STATE

• CPU
• disk latency
• cache pressure
• concurrent operations
• replication lag
• workload volume

If plan work is unchanged but latency rises, the query may be a victim.

If keys/docs examined also explode, the plan or query likely changed.`,

      detailedExplanation: `CASE A — SAME PLAN, SAME WORK, HIGHER LATENCY

Before:

nReturned = 100
keysExamined = 100
docsExamined = 100
latency = 10 ms

During incident:

nReturned = 100
keysExamined = 100
docsExamined = 100
latency = 800 ms

This suggests the plan remains efficient.

Investigate:

• disk I/O
• CPU
• cache misses
• concurrent load
• host pressure

CASE B — SAME QUERY, MUCH MORE WORK

Before:

keysExamined = 100

During incident:

keysExamined = 5,000,000

Now query-plan or data-distribution behavior changed.

CASE C — PLAN UNCHANGED BUT DATA GREW

Index:

{
  tenantId: 1,
  createdAt: 1
}

Query requests:

one year of data.

The tenant's records grew from:

1 million

to:

100 million.

Plan is technically the same, but request size became much broader.

CASE D — SYSTEM PRESSURE MAKES A BAD QUERY VISIBLE

A query was always inefficient:

keysExamined = 1 million

but server had spare CPU.

Traffic doubles.

The same bad query now saturates the host.

In this case both are true:

the query is inefficient

and:

increased workload exposed it.

This is why RCA must distinguish trigger from underlying weakness.`,

      internalWorking: `Slow Query
    |
    v
Compare work metrics
    |
 +--+----------------+
 |                   |
Same work        More work
 |                   |
 v                   v
System pressure   Query/plan/data
likely important changed
 |
 v
CPU / Disk / Cache`,

      architecture: `             Query Latency
                  |
        +---------+---------+
        |                   |
        v                   v
   Query Work          System Capacity
        |                   |
        v                   v
Keys / Docs           CPU / Disk / Cache
Bounds / Sort         Concurrency
        |                   |
        +---------+---------+
                  |
                  v
              Root Cause`,

      examples: [
        `Current query:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Operation latency:

db.serverStatus().opLatencies`,

        `Cache:

db.serverStatus().wiredTiger.cache`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows whether query work itself increased.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Shows server-level operation latency behavior.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides cache metrics useful for identifying memory and eviction pressure.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Helps identify concurrent workload and long-running operations when privileges allow.'
        }
      ],

      productionScenario: `An API query rises from 20 ms to 600 ms.

The application blames MongoDB query planning.

The DBA compares explain:

Before:
keysExamined = 30
docsExamined = 30

During incident:
keysExamined = 30
docsExamined = 30

The plan is unchanged.

At the same time:

• disk read latency increased sharply
• WiredTiger cache eviction increased
• another batch workload began scanning millions of documents

The customer query is a victim of resource contention.

The DBA fixes the batch workload and storage pressure rather than modifying a healthy customer index.`,

      troubleshootingApproach: `For slow query plus resource pressure:

1. Establish baseline plan metrics.

2. Run current executionStats.

3. Compare keys examined.

4. Compare docs examined.

5. Compare nReturned.

6. Compare plan stages.

7. Compare index name.

8. Check CPU.

9. Check storage latency.

10. Check WiredTiger cache.

11. Check current operations.

12. Check concurrent batch jobs.

13. Check replication lag.

14. Check checkpoint/backup timing.

15. Determine whether plan work increased.

16. Determine whether infrastructure capacity decreased.

17. Identify trigger and underlying weakness separately.

18. Fix the correct layer.`,

      commonMistakes: [
        'Blaming the planner whenever latency increases.',
        'Ignoring system metrics.',
        'Changing indexes during a storage incident.',
        'Assuming unchanged plans guarantee unchanged workload size.',
        'Failing to separate trigger from root cause.'
      ],

      bestPractices: [
        'Compare work metrics across time.',
        'Correlate database and infrastructure metrics.',
        'Maintain query-performance baselines.',
        'Identify both trigger and underlying inefficiency.',
        'Avoid unnecessary index changes during unrelated incidents.'
      ],

      interviewAnswer: `I compare query work and system state separately.

If keys examined, docs examined, nReturned, and the plan remain similar but latency rises, I investigate CPU, disk, cache, and concurrency.

If examined work or the plan changes significantly, the query itself is more likely responsible.

Often an inefficient query exists already and higher load simply exposes it, so I distinguish the trigger from the underlying weakness.`,

      keyTakeaways: [
        'Latency and plan efficiency are different concepts.',
        'Same work with higher latency points toward system pressure.',
        'More examined work points toward query/plan/data changes.',
        'Bad queries can be exposed by traffic growth.',
        'RCA should separate trigger and root cause.'
      ]
    }
  },

  {
    category: 'query_planner_explain',
    topicId: 'query-planner-explain',
    topicNumber: 6,
    topicName: 'Query Planner & Explain Analysis',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 explain-plan investigation for a critical production query that suddenly takes 10 seconds?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `For a critical query that suddenly takes 10 seconds, an L3 DBA should avoid random changes.

The investigation must answer:

What changed?

Where is MongoDB spending work?

Is the problem:

• query
• plan
• index
• data
• application
• system resources
• concurrency

The process should be evidence-driven from start to finish.`,

      coreConcept: `The investigation flow is:

Incident timeline
      |
      v
Exact query
      |
      v
ExecutionStats
      |
      v
Plan structure
      |
      v
Bounds / FETCH / SORT
      |
      v
Work metrics
      |
      v
Compare historical behavior
      |
      v
System metrics
      |
      v
Root cause
      |
      v
Controlled fix
      |
      v
Validate`,

      detailedExplanation: `PHASE 1 — ESTABLISH TIMELINE

Ask:

• When did latency increase?
• Was there an application deployment?
• Was an index added, removed, or hidden?
• Did traffic increase?
• Did a backup start?
• Did disk latency increase?
• Did a primary election occur?
• Did data distribution change?

PHASE 2 — CAPTURE EXACT QUERY

Do not test a simplified version.

Capture:

• filter
• BSON types
• sort
• projection
• limit
• skip
• collation
• read preference if relevant
• aggregation stages if applicable

PHASE 3 — RUN EXPLAIN

Use:

executionStats

Record:

winning plan
index
bounds
FETCH
SORT
nReturned
totalKeysExamined
totalDocsExamined
executionTimeMillis

PHASE 4 — CLASSIFY ACCESS PATH

COLLSCAN?

If yes:

Why?

IXSCAN?

If yes:

Is the scan tight or huge?

PHASE 5 — READ BOUNDS

Check:

• equality fields
• unbounded fields
• ranges
• $in intervals
• prefix mismatch

PHASE 6 — READ FETCH

Check:

• residual filters
• docs examined
• predicates not handled efficiently by index

PHASE 7 — CHECK SORT

If SORT exists:

• how much data enters it?
• can index ordering satisfy it?
• does a range/unconstrained field break order?

PHASE 8 — CHECK DATA SKEW

Compare:

fast value

versus:

slow value.

PHASE 9 — CHECK PLAN COMPETITION

If planner choice is suspicious:

allPlansExecution

Use hint only for controlled comparison.

PHASE 10 — CHECK PLAN CACHE

Only if evidence suggests planning state is relevant.

Do not clear cache blindly.

PHASE 11 — CHECK SYSTEM STATE

Review:

CPU

disk latency

WiredTiger cache

connections/concurrency

current operations

replication lag

PHASE 12 — IDENTIFY ROOT CAUSE

Examples:

• application removed selective predicate
• compound index range field positioned too early
• data distribution became skewed
• deep skip increased
• index was hidden
• unanchored regex introduced
• query is healthy but storage latency degraded

PHASE 13 — DESIGN MINIMAL FIX

Examples:

• query correction
• compound index reorder
• pagination redesign
• API range restriction
• removal of bad hint
• workload rescheduling
• storage remediation

PHASE 14 — VALIDATE BEFORE/AFTER

Compare:

latency

keys examined

docs examined

SORT

CPU

disk

replication lag

PHASE 15 — DOCUMENT

Record:

symptoms

timeline

root cause

fix

validation

rollback

This turns query troubleshooting into a reproducible production process.`,

      internalWorking: `10-second Query
      |
      v
Exact Query Shape
      |
      v
executionStats
      |
      v
Winning Plan
      |
      +--> COLLSCAN?
      +--> IXSCAN?
      |
      v
Bounds
      |
      v
FETCH
      |
      v
SORT
      |
      v
Keys / Docs / Returned
      |
      v
Compare Before / After
      |
      v
CPU / Disk / Cache
      |
      v
Root Cause
      |
      v
Controlled Fix
      |
      v
Validate`,

      architecture: `                  INCIDENT
                      |
      +---------------+---------------+
      |                               |
      v                               v
 Query / Planner                  System State
      |                               |
      v                               v
Access Path                      CPU / Disk
Bounds                           Cache
FETCH                            Concurrency
SORT                             Replication
      |                               |
      +---------------+---------------+
                      |
                      v
                  Root Cause
                      |
                      v
                Targeted Fix
                      |
                      v
                 Validation`,

      examples: [
        `Main explain:

db.orders.find({
  customerId: 1001,
  status: "FAILED",
  amount: {
    $gte: 500
  }
}).sort({
  createdAt: -1
}).limit(100).explain("executionStats")`,

        `Deeper planner review:

db.orders.find({
  customerId: 1001,
  status: "FAILED",
  amount: {
    $gte: 500
  }
}).sort({
  createdAt: -1
}).limit(100).explain("allPlansExecution")`,

        `Index inventory:

db.orders.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "FAILED", amount: { $gte: 500 } }).sort({ createdAt: -1 }).limit(100).explain("executionStats")',
          explanation:
            'Provides the primary execution evidence for the incident query.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "FAILED", amount: { $gte: 500 } }).sort({ createdAt: -1 }).limit(100).explain("allPlansExecution")',
          explanation:
            'Provides deeper candidate-plan information if planner choice is part of the investigation.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Confirms exact index definitions and options.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Provides operation-latency context for the overall server.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides WiredTiger cache information relevant to system pressure.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Helps identify concurrent operations and long-running workloads when privileges allow.'
        }
      ],

      productionScenario: `A transaction query normally runs in:

80 ms

but suddenly takes:

10 seconds.

The DBA finds:

nReturned:
60

totalKeysExamined:
12,000,000

totalDocsExamined:
3,000,000

SORT:
present

Current index:

{
  customerId: 1,
  amount: 1,
  status: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001,
  status: "FAILED",
  amount: {
    $gte: 100
  }
}

sort:

createdAt descending

Investigation shows:

• amount >= 100 matches almost all customer transactions
• FAILED is extremely selective
• amount range appears before status
• createdAt sort occurs after the broad range
• most documents are discarded during later filtering
• CPU spikes because the query runs thousands of times per minute

The DBA tests:

{
  customerId: 1,
  status: 1,
  createdAt: -1,
  amount: 1
}

After validation:

nReturned:
60

totalKeysExamined:
approximately the relevant candidate set

totalDocsExamined:
close to returned results

SORT:
removed

latency:
tens of milliseconds

CPU:
drops significantly

The final RCA states that the existing compound index no longer matched the evolved query/data distribution.

The fix was not:

more hardware.

It was:

reduce unnecessary database work.`,

      troubleshootingApproach: `Complete L3 checklist:

1. Establish incident start time.

2. Correlate deployment/change timeline.

3. Capture exact query.

4. Verify BSON types.

5. Include sort.

6. Include projection.

7. Include limit.

8. Include skip.

9. Run executionStats.

10. Identify winning plan.

11. Identify COLLSCAN/IXSCAN.

12. Identify index.

13. Inspect keyPattern.

14. Inspect indexBounds.

15. Inspect FETCH.

16. Inspect residual filters.

17. Inspect SORT.

18. Record nReturned.

19. Record totalKeysExamined.

20. Record totalDocsExamined.

21. Compare fast and slow values.

22. Check data distribution.

23. Inspect allPlansExecution if necessary.

24. Inspect plan-cache state only when relevant.

25. Check CPU.

26. Check disk latency.

27. Check WiredTiger cache.

28. Check current operations.

29. Check replication lag.

30. Identify root cause.

31. Design one targeted fix.

32. Test in representative environment.

33. Compare before/after executionStats.

34. Deploy carefully.

35. Monitor application latency.

36. Monitor CPU and disk.

37. Monitor replication.

38. Preserve rollback path.

39. Document RCA.

40. Continue monitoring after change.`,

      commonMistakes: [
        'Creating an index before understanding the plan.',
        'Blaming hardware without measuring query work.',
        'Blaming the query planner without checking system pressure.',
        'Changing multiple indexes simultaneously.',
        'Failing to compare before-and-after execution statistics.'
      ],

      bestPractices: [
        'Follow a repeatable incident workflow.',
        'Use exact production query shapes.',
        'Combine explain with infrastructure metrics.',
        'Make minimal controlled changes.',
        'Document root cause and validation evidence.'
      ],

      interviewAnswer: `For a critical 10-second MongoDB query, I start with the incident timeline and exact application query.

I run executionStats and inspect the winning plan, index, bounds, FETCH filters, SORT, nReturned, totalKeysExamined, and totalDocsExamined.

If planner choice is unclear I use allPlansExecution and controlled hints. I also compare data skew and system metrics such as CPU, disk, cache, concurrency, and replication.

I identify the exact source of unnecessary work, apply one targeted change, and prove the result using before-and-after metrics.`,

      keyTakeaways: [
        'Start with timeline and exact query.',
        'Read explain stage by stage.',
        'Correlate query work with system pressure.',
        'Identify root cause before changing indexes.',
        'Before-and-after evidence completes the investigation.'
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

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );


    /* =====================================================
       REMOVE ONLY PREVIOUS TOPIC 6 RECORDS
    ===================================================== */

    const deleteResult = await collection.deleteMany({
      category: 'query_planner_explain'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous query_planner_explain documents`
    );


    /* =====================================================
       INSERT ALL 20 TOPIC 6 QUESTIONS
    ===================================================== */

    const insertResult = await collection.insertMany(
      questions,
      {
        ordered: true
      }
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Query Planner & Explain Analysis questions`
    );


    /* =====================================================
       SAFE PARTIAL UNIQUE INDEX
    ===================================================== */

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


    /* =====================================================
       VALIDATE TOPIC 6 COUNT
    ===================================================== */

    const count = await collection.countDocuments({
      category: 'query_planner_explain'
    });

    console.log(
      `Topic 6 count: ${count}`
    );

    if (count !== 20) {
      throw new Error(
        `Validation failed: expected 20 Topic 6 questions, found ${count}`
      );
    }


    /* =====================================================
       CURRICULUM TOTAL

       Topic 1 = 20
       Topic 2 = 20
       Topic 3 = 20
       Topic 4 = 20
       Topic 5 = 20
       Topic 6 = 20

       Expected total = 120
       if all previous topics are present.
    ===================================================== */

    const curriculumCount = await collection.countDocuments({
      topicId: {
        $exists: true
      }
    });

    console.log(
      `New curriculum question count: ${curriculumCount}`
    );

    console.log(
      'Topic 6 seed completed successfully.'
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
    'Topic 6 seed failed:'
  );

  console.error(error);

  process.exit(1);
});
