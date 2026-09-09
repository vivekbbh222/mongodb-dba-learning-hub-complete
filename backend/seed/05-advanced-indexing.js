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
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 1,
    question:
      'How should a MongoDB DBA design indexes from real application query patterns instead of indexing fields individually?',
    level: 'Foundation-to-L3',
    difficulty: 'Advanced',
    order: 1,

    answer: {
      groundZero: `Index design should begin with the queries the application actually runs.

A beginner may think:

"The application queries customerId, status, createdAt, amount and city, so I should create five indexes."

That approach often creates too many indexes without optimally supporting the actual queries.

A better approach is:

Understand the complete query shape first.

For example:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).limit(20)

This is one query pattern.

The DBA should design an index around that pattern rather than treating customerId, status, and createdAt independently.`,

      coreConcept: `A query shape usually includes:

• Equality predicates
• Range predicates
• Sort
• Projection
• Limit
• Sometimes collation
• Sometimes partial-filter requirements

For:

{
  customerId: 1001,
  status: "OPEN"
}

with:

sort({
  createdAt: -1
})

a candidate index might be:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

This one compound index may support the query much better than three independent indexes.`,

      detailedExplanation: `Production index design should answer four questions:

1. WHAT QUERY IS IMPORTANT?

Not every query deserves optimization.

A query executed:

once per day

is very different from a query executed:

10,000 times per second.

2. WHAT DOES THE QUERY FILTER?

Identify:

Equality

Example:

customerId = 1001

Range

Example:

amount >= 500

3. WHAT DOES THE QUERY SORT BY?

Example:

createdAt descending

A correct index can eliminate an expensive in-memory or blocking sort.

4. WHAT DOES THE QUERY RETURN?

If the query returns only a small set of indexed fields, a covered query may be possible.

Example workload:

db.orders.find(
  {
    customerId: 1001,
    status: "OPEN"
  },
  {
    _id: 0,
    orderId: 1,
    createdAt: 1
  }
).sort({
  createdAt: -1
})

A DBA might test:

{
  customerId: 1,
  status: 1,
  createdAt: -1,
  orderId: 1
}

But this index is wider.

The DBA must decide whether potential coverage justifies:

• larger index size
• more memory
• more write maintenance

The correct index is therefore not determined only by fields.

It is determined by:

query frequency + query structure + data distribution + read/write balance.`,

      internalWorking: `Poor approach:

Field A --> Index A
Field B --> Index B
Field C --> Index C

Application query:

A + B + sort C

MongoDB may still perform:
extra key scans
FETCH
SORT
or index intersection


Workload-driven approach:

Query shape
    |
    v
A equality
B equality
C sort
    |
    v
Compound index:

A | B | C`,

      architecture: `Application Workload
        |
        v
Query Inventory
        |
        v
Classify Query Shape
        |
        +--> Equality
        +--> Sort
        +--> Range
        +--> Projection
        |
        v
Candidate Index
        |
        v
explain("executionStats")
        |
        v
Measure
        |
        v
Keep / Modify / Reject`,

      examples: [
        `Query:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).limit(20)`,

        `Candidate index:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  createdAt: -1
})`,

        `Validate:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).limit(20).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows existing indexes before designing new ones.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).limit(20).explain("executionStats")',
          explanation:
            'Measures the actual execution plan for the target query shape.'
        },
        {
          command:
            'db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 })',
          explanation:
            'Creates one candidate compound index aligned with the example query pattern.'
        }
      ],

      productionScenario: `A production collection contains 300 million transactions.

Developers request separate indexes on:

customerId
status
createdAt
amount
merchantId
channel

because each field appears in different places in application code.

The DBA instead analyses the highest-volume query shapes.

They discover that 80% of reads are:

{
  customerId: X,
  status: "SUCCESS"
}

sorted by:

createdAt descending

Another 15% are:

{
  merchantId: X,
  createdAt: {
    $gte: ...
  }
}

Instead of six arbitrary single-field indexes, the DBA designs a smaller set of compound indexes around the real access patterns.

The result is:

• fewer indexes
• better query performance
• lower write overhead
• easier operational management.`,

      troubleshootingApproach: `For workload-based index design:

1. Collect important query shapes.

2. Rank by frequency and total impact.

3. Record filters.

4. Record sort requirements.

5. Record ranges.

6. Record projections.

7. Record limits.

8. Check existing indexes.

9. Identify overlaps.

10. Build candidate compound indexes.

11. Use explain("executionStats").

12. Compare keys examined.

13. Compare documents examined.

14. Check SORT/FETCH stages.

15. Measure read improvement.

16. Estimate write cost.

17. Avoid adding indexes for rare low-value queries.

18. Monitor after deployment.`,

      commonMistakes: [
        'Creating one index for every field.',
        'Designing indexes without looking at actual query shapes.',
        'Ignoring query frequency.',
        'Ignoring sort.',
        'Optimizing a rare query while increasing write cost globally.'
      ],

      bestPractices: [
        'Index query patterns, not individual fields.',
        'Rank workloads by business impact and frequency.',
        'Use compound indexes intentionally.',
        'Measure with execution statistics.',
        'Keep the smallest effective index set.'
      ],

      interviewAnswer: `I design MongoDB indexes from real query patterns rather than creating one index per field.

I identify equality, sort, range, projection, and query frequency, then build compound index candidates and validate them using executionStats.

The goal is not maximum index count; it is the smallest set of indexes that efficiently supports the important workload without excessive write overhead.`,

      keyTakeaways: [
        'Query shape should drive index design.',
        'Frequency matters as much as latency.',
        'Compound indexes are often better than many single-field indexes.',
        'Every new index must justify its write cost.',
        'explain validates the design.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 2,
    question:
      'How do equality predicates behave in compound indexes, and does the order of multiple equality fields matter?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 2,

    answer: {
      groundZero: `Equality predicates are conditions where a field must match a specific value.

Examples:

{
  tenantId: 10
}

{
  status: "OPEN"
}

When a query contains multiple equality conditions, they often make excellent leading fields in a compound index because MongoDB can narrow the search to a specific key prefix.`,

      coreConcept: `Example query:

{
  tenantId: 10,
  status: "OPEN",
  region: "INDIA"
}

Potential index:

{
  tenantId: 1,
  status: 1,
  region: 1
}

All three are equality fields.

MongoDB can narrow the index to the exact combination:

10 | OPEN | INDIA

The order among equality fields may be less critical for that exact full equality query than the position relative to sort and range fields, but workload reuse and index prefixes still make equality-field ordering important.`,

      detailedExplanation: `Consider two indexes:

A:

{
  tenantId: 1,
  status: 1,
  region: 1
}

B:

{
  status: 1,
  tenantId: 1,
  region: 1
}

For a query specifying equality on all three:

{
  tenantId: 10,
  status: "OPEN",
  region: "INDIA"
}

both can potentially form tight bounds around the exact combination.

However, suppose another frequent query uses only:

{
  tenantId: 10
}

Index A has tenantId as a prefix.

Index B does not.

Therefore equality-field order must consider:

• Other query shapes
• Prefix reuse
• Sort requirements
• Range fields
• Tenant isolation
• Cardinality
• Data distribution

Another common misconception is:

"Put the most selective equality field first no matter what."

That can be overly simplistic.

If all relevant equality predicates are specified in the main query, MongoDB can often use them effectively regardless of which equality comes first inside the equality group.

The bigger concern is how the index supports other workloads and how equality fields interact with later sort/range keys.

So an L3 index strategy does not blindly sort equality fields by cardinality.

It considers the entire workload.`,

      internalWorking: `Query:

tenantId = 10
status = OPEN
region = INDIA

Index:

tenantId | status | region

MongoDB can navigate to:

10 | OPEN | INDIA

This creates a tight equality prefix.


But query:

tenantId = 10

can naturally use:

tenantId | status | region

because tenantId is the leading prefix.`,

      architecture: `Multiple equality fields

tenantId
   |
   v
status
   |
   v
region
   |
   v
Exact compound key prefix


Index order decision also depends on:

+ other queries
+ prefix reuse
+ sort
+ range`,

      examples: [
        `Query:

db.orders.find({
  tenantId: 10,
  status: "OPEN",
  region: "INDIA"
})`,

        `Candidate:

db.orders.createIndex({
  tenantId: 1,
  status: 1,
  region: 1
})`,

        `Prefix reuse:

db.orders.find({
  tenantId: 10
})`
      ],

      commands: [
        {
          command:
            'db.orders.createIndex({ tenantId: 1, status: 1, region: 1 })',
          explanation:
            'Creates a compound index containing three equality-oriented fields.'
        },
        {
          command:
            'db.orders.find({ tenantId: 10, status: "OPEN", region: "INDIA" }).explain("executionStats")',
          explanation:
            'Shows how tightly MongoDB bounds the equality combination.'
        }
      ],

      productionScenario: `A multi-tenant application always includes:

tenantId

in customer-facing queries.

Developers suggest putting status first because OPEN is more selective than tenantId for one sample query.

The DBA examines the full workload and finds:

• almost every query contains tenantId
• many queries contain tenantId without status
• tenantId is also important for workload isolation
• multiple compound indexes can reuse tenantId as the leading prefix

The DBA therefore keeps tenantId first in several workload-specific indexes.

The decision is made from query reuse and access patterns, not from a single selectivity number.`,

      troubleshootingApproach: `For multiple equality fields:

1. List all equality predicates.

2. Identify which appear in every query.

3. Identify standalone/prefix query patterns.

4. Check tenant or ownership keys.

5. Identify sort requirements.

6. Identify range requirements.

7. Build candidate orders.

8. Run executionStats.

9. Compare indexBounds.

10. Check whether shorter-prefix queries benefit.

11. Avoid blindly applying "most selective first."

12. Choose the order that supports the broader workload.`,

      commonMistakes: [
        'Always putting the most selective equality field first.',
        'Ignoring prefix reuse.',
        'Designing for one query only.',
        'Ignoring tenant/access patterns.',
        'Confusing equality-field order with ESR placement of equality versus range.'
      ],

      bestPractices: [
        'Group equality fields before sort/range when appropriate.',
        'Order equality fields based on workload reuse.',
        'Consider leading-prefix value.',
        'Validate with explain.',
        'Use real query frequency when choosing between equivalent candidates.'
      ],

      interviewAnswer: `Multiple equality predicates can usually form a tight compound index prefix.

The exact order among equality fields is often less important for a query that specifies all of them, but it matters for prefix reuse and other query shapes.

I therefore do not blindly put the most selective equality field first; I evaluate workload patterns, prefix usage, sort, and range requirements.`,

      keyTakeaways: [
        'Equality predicates can tightly bound compound indexes.',
        'Equality ordering should consider workload reuse.',
        'Most selective first is not an absolute rule.',
        'Prefix queries influence field order.',
        'Sort and range placement still matter.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 3,
    question:
      'How do range predicates affect compound index efficiency and the usefulness of fields that come after the range field?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 3,

    answer: {
      groundZero: `A range predicate asks MongoDB to find values across an interval rather than one exact value.

Examples:

{
  age: {
    $gte: 18
  }
}

{
  price: {
    $gte: 100,
    $lte: 500
  }
}

Range conditions behave differently from equality conditions inside a compound index.`,

      coreConcept: `Suppose we have:

{
  customerId: 1,
  amount: 1,
  status: 1
}

Query:

{
  customerId: 1001,
  amount: {
    $gte: 500
  },
  status: "PAID"
}

MongoDB can use customerId equality and then enter an amount range.

Once scanning across the amount range, status values are distributed within each amount key.

The status field may still help with filtering or bounds in some circumstances, but it is generally less powerful for direct index narrowing than if equality conditions were positioned before the range.`,

      detailedExplanation: `Conceptually, consider these index keys:

1001 | 500 | PAID
1001 | 500 | FAILED
1001 | 600 | PAID
1001 | 600 | FAILED
1001 | 700 | PAID
1001 | 700 | FAILED

Query:

customerId = 1001
amount >= 500
status = PAID

The index first restricts:

customerId = 1001

Then traverses:

amount >= 500

Within that range, multiple status values occur.

If the index were instead:

{
  customerId: 1,
  status: 1,
  amount: 1
}

then the query can first constrain:

customerId = 1001
status = PAID

and then scan only the amount range for that equality prefix.

This often produces tighter bounds.

This principle explains why equality fields are generally placed before range fields.

However, sort requirements can complicate the choice.

A field placed before the range may support sort ordering.

A highly selective range may make ERS-style ordering competitive.

Therefore the DBA should examine:

• indexBounds
• totalKeysExamined
• nReturned
• SORT stages

rather than relying only on memorized field order.`,

      internalWorking: `Index:

customerId | amount | status

Query:

customerId = 1001
amount >= 500
status = PAID

Navigate:

customerId = 1001
      |
      v
amount range 500 -> infinity
      |
      v
many status values encountered


Alternative:

customerId | status | amount

Navigate:

1001 | PAID
      |
      v
amount 500 -> infinity

Tighter range`,

      architecture: `Equality
    |
    v
Equality
    |
    v
Range
    |
    v
Scan interval


After broad range:
later fields may have reduced
ability to narrow traversal.`,

      examples: [
        `Less ideal for the example:

db.orders.createIndex({
  customerId: 1,
  amount: 1,
  status: 1
})`,

        `Potentially tighter:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  amount: 1
})`,

        `Analyse:

db.orders.find({
  customerId: 1001,
  status: "PAID",
  amount: {
    $gte: 500
  }
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "PAID", amount: { $gte: 500 } }).explain("executionStats")',
          explanation:
            'Shows index bounds and how much key scanning the range predicate creates.'
        }
      ],

      productionScenario: `A transaction query returns only:

100 documents

but explain shows:

2 million keys examined.

Index:

{
  accountId: 1,
  transactionDate: 1,
  status: 1
}

Query:

{
  accountId: 1001,
  transactionDate: {
    $gte: startOfYear
  },
  status: "FAILED"
}

The yearly date range is huge.

FAILED transactions are rare.

The DBA evaluates:

{
  accountId: 1,
  status: 1,
  transactionDate: 1
}

Now MongoDB can isolate:

accountId + FAILED

before scanning the date range.

The number of keys examined drops dramatically.

The problem was not a missing index.

It was a poorly ordered compound index.`,

      troubleshootingApproach: `For range-heavy queries:

1. Identify all equality fields.

2. Identify all range predicates.

3. Check where the range appears in the index.

4. Inspect indexBounds.

5. Check totalKeysExamined.

6. Compare nReturned.

7. Determine whether later equality fields are filtering many scanned keys.

8. Test moving equality fields before the range.

9. Check sort requirements.

10. Compare ESR and ERS candidates.

11. Use realistic data distribution.

12. Measure before deployment.`,

      commonMistakes: [
        'Putting range fields too early without considering later equality predicates.',
        'Assuming an IXSCAN is automatically efficient.',
        'Ignoring millions of keys examined.',
        'Applying ESR without considering highly selective ranges.',
        'Ignoring sort requirements.'
      ],

      bestPractices: [
        'Prefer tight equality prefixes.',
        'Inspect indexBounds.',
        'Measure keys examined relative to returned documents.',
        'Test range placement against sort requirements.',
        'Use production-like data distributions.'
      ],

      interviewAnswer: `A range predicate causes MongoDB to scan an interval of the index.

Fields after that range may provide less effective narrowing because values are distributed throughout the scanned range.

That is why equality fields are normally placed before range fields.

I verify the design using indexBounds and keys examined because selectivity and sort requirements can justify alternate orders.`,

      keyTakeaways: [
        'Range predicates scan intervals.',
        'Early range fields can increase keys examined.',
        'Equality-before-range often creates tighter bounds.',
        'Fields after a range can become less useful for narrowing.',
        'Measure indexBounds and scan volume.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 4,
    question:
      'How can MongoDB use compound indexes to support sorting, and when does a query require an explicit SORT stage?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 4,

    answer: {
      groundZero: `Sorting means returning documents in a specific order.

Example:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})

MongoDB can either:

1. Read documents in the required order directly from an index.

or:

2. Retrieve matching data and perform an explicit sort operation.`,

      coreConcept: `Candidate index:

{
  customerId: 1,
  createdAt: -1
}

Because customerId is fixed by equality and createdAt follows it in descending order, MongoDB can scan the relevant index range in the required createdAt order.

This can avoid an explicit SORT stage.`,

      detailedExplanation: `Suppose the index is:

{
  customerId: 1,
  createdAt: -1
}

Logical entries:

1001 | 2026-09-05
1001 | 2026-09-04
1001 | 2026-09-03
1002 | 2026-09-05

For:

customerId = 1001

MongoDB enters the 1001 prefix.

The records are already arranged by createdAt descending inside that prefix.

Therefore:

sort({
  createdAt: -1
})

can be satisfied directly.

Now consider an index:

{
  customerId: 1,
  amount: 1,
  createdAt: -1
}

and query:

{
  customerId: 1001
}

sort:

{
  createdAt: -1
}

Because amount varies between customerId and createdAt, the index is primarily ordered by amount before createdAt.

The requested createdAt ordering is not globally preserved across all amount values.

MongoDB may require a SORT stage.

Equality predicates can effectively collapse preceding index fields.

For example:

Index:

{
  tenantId: 1,
  status: 1,
  createdAt: -1
}

Query:

{
  tenantId: 10,
  status: "OPEN"
}

Sort:

{
  createdAt: -1
}

Both preceding fields are fixed by equality, leaving createdAt in usable index order.

Sort direction also matters for compound indexes.

An index:

{
  score: 1,
  username: -1
}

can support that ordering and the complete reverse:

{
  score: -1,
  username: 1
}

but not arbitrary direction combinations.`,

      internalWorking: `Index:

customerId | createdAt DESC

1001 | newest
1001 | older
1001 | oldest

Query:

customerId = 1001

MongoDB already reads:

newest -> oldest

No explicit sort required.


Bad ordering:

customerId | amount | createdAt

createdAt values are grouped
inside amount values

Explicit SORT may be required.`,

      architecture: `Query Filter
    |
    v
Equality Prefix
    |
    v
Index ordering matches sort?
    |
 +--+--+
 |     |
YES    NO
 |     |
 v     v
Index   SORT
order   stage`,

      examples: [
        `Index:

db.orders.createIndex({
  customerId: 1,
  createdAt: -1
})`,

        `Query:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})`,

        `Explain:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.createIndex({ customerId: 1, createdAt: -1 })',
          explanation:
            'Creates a compound index capable of supporting customer-specific timestamp ordering.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Shows whether the sort is satisfied through index traversal or an explicit SORT stage.'
        }
      ],

      productionScenario: `A dashboard query is fast for small customers but becomes very slow for large customers.

Query:

{
  customerId: X
}

Sort:

{
  createdAt: -1
}

Current index:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

The query does not filter status.

Because status varies between customerId and createdAt, MongoDB cannot simply treat createdAt as globally sorted within the customerId prefix.

The DBA tests:

{
  customerId: 1,
  createdAt: -1
}

for this workload.

The new index may eliminate a costly sort.

The DBA then determines whether the additional index is justified or whether the existing application query can include status.`,

      troubleshootingApproach: `For sort optimization:

1. Capture filter.

2. Capture complete sort specification.

3. List index field order.

4. Determine which preceding fields are equality predicates.

5. Determine whether variable fields interrupt sort ordering.

6. Check sort directions.

7. Run explain.

8. Look for SORT.

9. Check returned document count.

10. Check memory/disk sort symptoms if applicable.

11. Test alternate compound indexes.

12. Balance sort benefit against additional index cost.`,

      commonMistakes: [
        'Assuming a field is sortable because it appears somewhere in the index.',
        'Ignoring variable fields between equality prefix and sort fields.',
        'Ignoring compound sort directions.',
        'Adding indexes without checking whether sort is the real bottleneck.',
        'Optimizing huge result sets without pagination.'
      ],

      bestPractices: [
        'Place sort fields appropriately after equality fields.',
        'Use explain to check for SORT.',
        'Keep query results bounded where possible.',
        'Consider complete compound sort direction.',
        'Validate with real customer/data distributions.'
      ],

      interviewAnswer: `MongoDB can satisfy a sort directly from a compound index when the index ordering matches the query after equality-constrained prefix fields.

For example, { customerId: 1, createdAt: -1 } can support a query filtering customerId and sorting createdAt descending.

If variable index fields interrupt that ordering, MongoDB may need an explicit SORT stage.`,

      keyTakeaways: [
        'Indexes can eliminate explicit sorting.',
        'Equality prefixes can collapse preceding fields.',
        'Variable fields can break usable sort order.',
        'Compound direction matters.',
        'Explain reveals whether SORT remains.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 5,
    question:
      'How should a DBA analyse totalKeysExamined, totalDocsExamined, and nReturned to determine whether an index is truly efficient?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 5,

    answer: {
      groundZero: `Seeing IXSCAN in explain does not prove that a query is efficient.

MongoDB may use an index and still examine millions of index keys to return only a few documents.

The DBA must look at how much work was performed.`,

      coreConcept: `Three critical execution statistics are:

nReturned

How many documents were returned.

totalKeysExamined

How many index keys were examined.

totalDocsExamined

How many collection documents were examined.

Example:

nReturned = 10
totalKeysExamined = 10
totalDocsExamined = 10

This looks efficient.

Another query:

nReturned = 10
totalKeysExamined = 2,000,000
totalDocsExamined = 500,000

This is highly inefficient despite using an index.`,

      detailedExplanation: `Consider:

Query A:

nReturned: 100

totalKeysExamined: 100

totalDocsExamined: 100

This is close to a one-to-one access pattern.

Query B:

nReturned: 100

totalKeysExamined: 5,000,000

totalDocsExamined: 1,000,000

MongoDB is performing enormous work to return 100 results.

Possible reasons include:

• poorly ordered compound index
• low-selectivity leading field
• range placed too early
• residual filtering during FETCH
• query pattern does not align with index
• broad multikey bounds
• large result candidate set

Another useful case:

nReturned: 100

totalKeysExamined: 100

totalDocsExamined: 0

This can indicate a covered query.

But there is no universal ratio that defines good performance.

Returning:

1 million documents

may legitimately require substantial work.

The DBA should compare examined counts to:

• result count
• query frequency
• latency
• business requirement
• expected selectivity

The best metric is:

How much unnecessary work is MongoDB doing?`,

      internalWorking: `Query
 |
 v
IXSCAN

Keys examined:
1,000,000
 |
 v
FETCH

Docs examined:
100,000
 |
 v
Filter
 |
 v
Returned:
10


Efficiency problem:

1,000,000 keys
for
10 results`,

      architecture: `            Query Work
                |
      +---------+---------+
      |                   |
      v                   v
Keys Examined        Docs Examined
      |                   |
      +---------+---------+
                |
                v
            nReturned
                |
                v
        Efficiency analysis`,

      examples: [
        `Efficient:

Returned = 20
Keys examined = 20
Docs examined = 20`,

        `Potentially inefficient:

Returned = 20
Keys examined = 500000
Docs examined = 100000`,

        `Potential covered query:

Returned = 20
Keys examined = 20
Docs examined = 0`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Provides keys examined, documents examined, returned count, and winning plan.'
        }
      ],

      productionScenario: `A developer says:

"The query uses IXSCAN, so the database is optimized."

The DBA checks explain:

nReturned: 25

totalKeysExamined: 7,800,000

totalDocsExamined: 2,100,000

The index is technically being used, but it is not selective enough for the query.

Further analysis shows:

Index:

{
  status: 1,
  customerId: 1
}

Query:

{
  customerId: 1001,
  status: {
    $in: [
      "OPEN",
      "PENDING",
      "PROCESSING"
    ]
  }
}

The leading status predicate matches a huge part of the collection.

A better index order dramatically reduces examined keys.

The real lesson is:

IXSCAN is a stage name.

Efficiency is measured by work.`,

      troubleshootingApproach: `When analysing explain:

1. Record nReturned.

2. Record totalKeysExamined.

3. Record totalDocsExamined.

4. Check winningPlan.

5. Check indexBounds.

6. Check FETCH filters.

7. Check SORT.

8. Compare examined counts to returned count.

9. Identify where candidate rows are being discarded.

10. Check predicate selectivity.

11. Check compound field order.

12. Test alternate index.

13. Measure under representative data.

14. Consider query frequency when prioritizing.`,

      commonMistakes: [
        'Stopping analysis once IXSCAN appears.',
        'Looking only at executionTimeMillis.',
        'Ignoring documents examined.',
        'Ignoring keys examined.',
        'Demanding a 1:1 ratio for every legitimate range query.'
      ],

      bestPractices: [
        'Measure work, not just plan names.',
        'Compare examined counts with returned results.',
        'Use indexBounds to understand scanning.',
        'Check FETCH filtering.',
        'Interpret metrics in workload context.'
      ],

      interviewAnswer: `I do not consider a query efficient just because it uses IXSCAN.

I compare nReturned with totalKeysExamined and totalDocsExamined.

If MongoDB examines millions of keys or documents to return a few results, the access path is inefficient.

I then inspect index bounds, compound field order, selectivity, FETCH filtering, and sort behaviour to understand where the unnecessary work occurs.`,

      keyTakeaways: [
        'IXSCAN does not guarantee efficiency.',
        'nReturned measures useful result output.',
        'Keys examined show index work.',
        'Docs examined show collection fetch work.',
        'Large examined-to-returned gaps deserve investigation.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 6,
    question:
      'How do index bounds work in MongoDB explain plans, and how can they reveal poor compound index design?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 6,

    answer: {
      groundZero: `Index bounds tell you which portion of an index MongoDB intends to scan.

They are one of the most useful pieces of information in an explain plan.

A good index often produces tight bounds.

A poor index can produce very broad bounds.`,

      coreConcept: `Suppose the index is:

{
  customerId: 1,
  status: 1
}

Query:

{
  customerId: 1001,
  status: "OPEN"
}

Conceptually, index bounds can narrow to:

customerId:
[1001, 1001]

status:
["OPEN", "OPEN"]

This is a tight index range.`,

      detailedExplanation: `Now consider:

Index:

{
  status: 1,
  customerId: 1
}

Query:

{
  customerId: 1001
}

The leading status field is not constrained.

Conceptually, status may need bounds covering:

MinKey to MaxKey

while MongoDB attempts to use later customerId information.

That indicates a much broader portion of the index may need to be considered.

Index bounds are especially useful for understanding:

• Equality constraints
• Range scans
• $in predicates
• Compound prefix quality
• Multikey behaviour
• Unbounded fields

Examples:

Equality:

customerId = 1001

Tight:

[1001, 1001]

Range:

amount >= 500

Conceptually:

[500, Infinity]

Unbounded:

[MinKey, MaxKey]

If a supposedly selective query shows broad bounds on important leading fields, the compound index may not align with the query.

The DBA should connect indexBounds with totalKeysExamined.

Broad bounds + high keys examined usually indicate expensive scanning.`,

      internalWorking: `Index:

A | B | C


Query:

A = 10
B = OPEN
C >= 100


Bounds:

A:
[10,10]

B:
[OPEN,OPEN]

C:
[100,MaxKey]


MongoDB scans only
that compound region.`,

      architecture: `Query Predicate
       |
       v
Index Bounds
       |
       +--> Exact equality
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
        `Run:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).explain("executionStats")`,

        `Inspect winningPlan for:

indexBounds`,

        `Compare broad versus tight candidate compound indexes.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).explain("executionStats")',
          explanation:
            'Displays winning plan details including relevant IXSCAN index bounds.'
        }
      ],

      productionScenario: `A query returns:

50 documents

but examines:

4 million index keys.

Index:

{
  status: 1,
  region: 1,
  customerId: 1
}

Query:

{
  customerId: 1001
}

Explain shows broad bounds across leading fields.

The index contains customerId, but customerId is deep in the compound key after fields the query does not constrain.

The DBA tests:

{
  customerId: 1
}

or a workload-appropriate compound index beginning with customerId.

Keys examined falls dramatically.

Index bounds exposed the true problem.`,

      troubleshootingApproach: `For indexBounds analysis:

1. Find IXSCAN in explain.

2. Identify index name.

3. Inspect keyPattern.

4. Inspect indexBounds.

5. Identify exact equality intervals.

6. Identify ranges.

7. Identify unbounded leading fields.

8. Compare with the query filter.

9. Check totalKeysExamined.

10. Check FETCH filtering.

11. Compare candidate index orders.

12. Choose tighter bounds when workload trade-offs support it.`,

      commonMistakes: [
        'Ignoring indexBounds.',
        'Assuming field presence in an index is sufficient.',
        'Not noticing MinKey-to-MaxKey scans.',
        'Looking only at totalDocsExamined.',
        'Changing indexes without identifying which field causes broad scanning.'
      ],

      bestPractices: [
        'Inspect indexBounds for important queries.',
        'Prefer tight equality prefixes where appropriate.',
        'Correlate bounds with keys examined.',
        'Compare candidate compound index orders.',
        'Use bounds to understand why an IXSCAN is expensive.'
      ],

      interviewAnswer: `Index bounds show the intervals MongoDB scans within an index.

Equality conditions usually create tight bounds, range predicates create intervals, and unconstrained fields can produce broad MinKey-to-MaxKey bounds.

I use indexBounds together with totalKeysExamined to determine whether a compound index is actually narrowing the query efficiently.`,

      keyTakeaways: [
        'Index bounds describe scanned key ranges.',
        'Tight bounds generally mean less index work.',
        'Unbounded leading fields can cause expensive scans.',
        'Bounds explain many inefficient IXSCAN plans.',
        'Always correlate bounds with keys examined.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 7,
    question:
      'How do $in, $ne, $nin, and other non-equality predicates affect index efficiency?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 7,

    answer: {
      groundZero: `Not all query operators behave like simple equality.

For example:

{
  status: {
    $in: ["OPEN", "PENDING"]
  }
}

asks MongoDB to search multiple values.

Operators such as:

$ne
$nin

often match a very large portion of a collection.

Their index behaviour must be analysed carefully.`,

      coreConcept: `$in can often create multiple index intervals.

Example:

status IN:

OPEN
PENDING
FAILED

MongoDB can search several relevant index ranges.

By contrast:

{
  status: {
    $ne: "DELETED"
  }
}

may match almost every document.

If 99% of documents are not DELETED, an index on status alone provides little selectivity.`,

      detailedExplanation: `$IN

Example:

{
  status: {
    $in: [
      "OPEN",
      "PENDING"
    ]
  }
}

MongoDB can potentially use separate equality-style bounds for each value.

However, a very large $in list can become expensive because many intervals must be processed.

$NE

Example:

{
  status: {
    $ne: "CLOSED"
  }
}

This means:

everything except CLOSED.

If CLOSED represents only 1% of the collection, the query matches 99%.

That is low selectivity.

$NIN

Similarly:

{
  region: {
    $nin: [
      "US",
      "UK"
    ]
  }
}

may match most records.

Indexes often provide limited benefit for highly non-selective exclusion predicates.

The DBA should not assume:

"Operator uses an indexed field, therefore query will be fast."

The actual questions are:

How many index intervals?

How many keys examined?

How many documents returned?

How much of the collection qualifies?

$in also interacts with sorting and compound indexes.

A small $in list may behave much like several equality values.

A very large list can behave more like a broad scan from a workload perspective.

Therefore the size and distribution of the list matter.`,

      internalWorking: `$in:

status IN [A,B,C]

Index:
A range
B range
C range

MongoDB combines
multiple intervals.


$ne:

status != X

Index may scan:

MinKey -> X
and
X -> MaxKey

Potentially most of index.`,

      architecture: `Predicate Type

Equality
   |
   v
tight key


$in
   |
   v
multiple key intervals


$ne / $nin
   |
   v
broad exclusion
   |
   v
potentially huge scan`,

      examples: [
        `Small $in:

db.orders.find({
  status: {
    $in: ["OPEN", "PENDING"]
  }
})`,

        `Potentially broad $ne:

db.orders.find({
  status: {
    $ne: "DELETED"
  }
})`,

        `Potentially broad $nin:

db.orders.find({
  region: {
    $nin: ["US", "UK"]
  }
})`
      ],

      commands: [
        {
          command:
            'db.orders.find({ status: { $in: ["OPEN", "PENDING"] } }).explain("executionStats")',
          explanation:
            'Shows the index intervals and work for an $in query.'
        },
        {
          command:
            'db.orders.find({ status: { $ne: "DELETED" } }).explain("executionStats")',
          explanation:
            'Shows whether the non-equality predicate results in a broad scan.'
        }
      ],

      productionScenario: `An application replaces:

{
  status: "FAILED"
}

with:

{
  status: {
    $ne: "SUCCESS"
  }
}

Developers consider the queries logically similar.

But data distribution is:

SUCCESS = 97%

FAILED = 1%
PENDING = 1%
CANCELLED = 1%

The old query matched 1%.

The new query matches 3%.

That may still be manageable.

In another environment:

SUCCESS = 20%

The same $ne query now matches 80%.

Performance changes dramatically.

This demonstrates why operator semantics must be combined with data distribution.`,

      troubleshootingApproach: `For $in/$ne/$nin queries:

1. Identify the operator.

2. Determine result selectivity.

3. Count or estimate value distribution.

4. Inspect indexBounds.

5. For $in, count the number of list values.

6. Check keys examined.

7. Check documents examined.

8. Check nReturned.

9. Determine whether exclusion semantics match most of the collection.

10. Consider positive predicates when business logic allows.

11. Test compound index alternatives.

12. Avoid massive $in lists when a different data model or query strategy is more appropriate.`,

      commonMistakes: [
        'Treating $ne as highly selective.',
        'Using huge $in arrays without measurement.',
        'Assuming all operators use indexes equally.',
        'Ignoring data distribution.',
        'Looking only at the indexed field name.'
      ],

      bestPractices: [
        'Measure exclusion predicates carefully.',
        'Keep $in lists reasonable where possible.',
        'Use positive selective predicates when suitable.',
        'Check index intervals.',
        'Design around actual data distribution.'
      ],

      interviewAnswer: `$in can use multiple index intervals and is often efficient for a reasonable number of selective values.

$ne and $nin are frequently low-selectivity because they may match most of the collection.

I therefore inspect index bounds, keys examined, result count, and data distribution rather than assuming any predicate on an indexed field is efficient.`,

      keyTakeaways: [
        '$in can produce multiple index ranges.',
        '$ne and $nin are often broad.',
        'Data distribution determines real selectivity.',
        'Large $in lists can become expensive.',
        'Operator semantics affect index design.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 8,
    question:
      'How do regex queries interact with indexes, and why are anchored and unanchored regular expressions very different for performance?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 8,

    answer: {
      groundZero: `Regex allows pattern matching on strings.

Example:

{
  name: {
    $regex: "^Viv"
  }
}

means:

find names starting with "Viv".

Some regex queries can use indexes effectively.

Others may require scanning a large part of an index or collection.`,

      coreConcept: `Anchored prefix regex:

^Viv

has a known starting prefix.

MongoDB can often derive a bounded index range around strings beginning with:

Viv

Unanchored regex:

Viv

could match:

Vivek
MrVivek
ABC-Vivek-XYZ

There is no fixed starting prefix.

This makes efficient index navigation much harder.`,

      detailedExplanation: `Consider an index:

{
  username: 1
}

Query A:

{
  username: {
    $regex: "^vivek"
  }
}

Because the pattern starts at the beginning of the string, MongoDB may be able to restrict scanning to values beginning with:

vivek

Query B:

{
  username: {
    $regex: "vivek"
  }
}

Now the substring may appear anywhere.

MongoDB may need to examine far more candidate keys.

Query C:

{
  username: {
    $regex: "^vivek",
    $options: "i"
  }
}

Case-insensitive matching introduces additional considerations.

Developers often assume a normal case-sensitive index automatically optimizes all case-insensitive regex searches.

That assumption can be incorrect.

Search requirements involving:

• arbitrary substring search
• language-aware search
• typo tolerance
• fuzzy matching
• text ranking

may need a different search architecture rather than conventional B-tree indexing.

For ordinary MongoDB indexes, prefix-oriented patterns are generally more index-friendly than arbitrary contains searches.`,

      internalWorking: `Index values:

ABC
ABD
VIKAS
VIVEK
VIVEK123
XYZ


Regex:

^VIVEK

MongoDB can focus near:

VIVEK...


Regex:

IVEK

Could occur anywhere:

VIVEK
XIVEK
ABCIVEKXYZ

No simple leading prefix.`,

      architecture: `Regex

  |
  +--> Anchored prefix
  |       |
  |       v
  |   bounded scan possible
  |
  +--> Unanchored
          |
          v
      broad scan likely`,

      examples: [
        `Prefix:

db.users.find({
  username: {
    $regex: "^viv"
  }
})`,

        `Unanchored:

db.users.find({
  username: {
    $regex: "viv"
  }
})`,

        `Case-insensitive:

db.users.find({
  username: {
    $regex: "^viv",
    $options: "i"
  }
})`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ username: 1 })',
          explanation:
            'Creates a normal string index used for testing regex access patterns.'
        },
        {
          command:
            'db.users.find({ username: { $regex: "^viv" } }).explain("executionStats")',
          explanation:
            'Shows execution behaviour for an anchored prefix regex.'
        },
        {
          command:
            'db.users.find({ username: { $regex: "viv" } }).explain("executionStats")',
          explanation:
            'Shows the typically broader work associated with an unanchored regex.'
        }
      ],

      productionScenario: `A customer search API originally requires:

username starts with text.

The query uses:

^prefix

and performs acceptably.

A product change modifies the requirement to:

username contains text anywhere.

The application removes the ^ anchor.

Traffic is high and the user collection contains hundreds of millions of records.

CPU rises dramatically.

The index still exists.

The query still references username.

But the search semantics changed from:

prefix

to:

substring.

The DBA identifies this application-level change as the root cause and recommends redesigning the search requirement rather than continuously adding B-tree indexes.`,

      troubleshootingApproach: `For regex problems:

1. Capture exact regex.

2. Determine whether it is anchored.

3. Check case sensitivity.

4. Check query frequency.

5. Run explain.

6. Inspect indexBounds.

7. Check keys examined.

8. Check documents examined.

9. Check result count.

10. Determine whether arbitrary substring search is truly required.

11. Evaluate purpose-built search features/architecture where appropriate.

12. Add API restrictions if unrestricted regex can overload the database.`,

      commonMistakes: [
        'Assuming every regex query uses an index efficiently.',
        'Removing ^ from prefix searches without understanding cost.',
        'Ignoring case-insensitive behaviour.',
        'Allowing arbitrary user regex patterns in high-volume endpoints.',
        'Trying to solve full search requirements with ordinary B-tree indexes alone.'
      ],

      bestPractices: [
        'Prefer anchored prefix matching when business requirements allow.',
        'Measure regex queries using executionStats.',
        'Limit expensive user-supplied patterns.',
        'Use the correct search technology for substring/fuzzy search requirements.',
        'Monitor regex query frequency and scan volume.'
      ],

      interviewAnswer: `Regex performance depends heavily on whether MongoDB can derive a useful index prefix.

An anchored pattern such as ^vivek can often restrict scanning to values starting with that prefix.

An unanchored pattern such as vivek can match anywhere in the string and usually requires much broader scanning.

I verify this using indexBounds and execution statistics.`,

      keyTakeaways: [
        'Anchored prefix regex is more index-friendly.',
        'Unanchored regex can scan large ranges.',
        'Case-insensitive searches require care.',
        'Search semantics can change query cost dramatically.',
        'Explain is required to verify behaviour.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 9,
    question:
      'How do multikey indexes affect advanced query optimization for arrays, $elemMatch, and compound predicates?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 9,

    answer: {
      groundZero: `Multikey indexes are created when an indexed field contains arrays.

At the advanced level, the important challenge is not simply:

"Can MongoDB index an array?"

The challenge is:

"Can MongoDB safely combine the intended array predicates into efficient index bounds?"`,

      coreConcept: `Consider:

{
  scores: [
    {
      subject: "MongoDB",
      score: 90
    },
    {
      subject: "Linux",
      score: 40
    }
  ]
}

Suppose the query wants:

the SAME array element where:

subject = MongoDB

AND:

score >= 80

$elemMatch expresses this relationship explicitly.`,

      detailedExplanation: `Without $elemMatch, consider:

{
  "scores.subject": "MongoDB",
  "scores.score": {
    $gte: 80
  }
}

These predicates can potentially be satisfied by different array elements.

Example:

{
  scores: [
    {
      subject: "MongoDB",
      score: 40
    },
    {
      subject: "Linux",
      score: 90
    }
  ]
}

This document contains:

subject MongoDB

and:

score 90

but not in the same array element.

If the business requirement means same element, use:

{
  scores: {
    $elemMatch: {
      subject: "MongoDB",
      score: {
        $gte: 80
      }
    }
  }
}

This semantic distinction can also influence how MongoDB combines multikey index bounds.

Multikey indexes have more complex rules because each document can generate multiple keys.

The planner must avoid incorrectly combining bounds in ways that could imply relationships between separate array elements.

For arrays of embedded documents, using $elemMatch can allow MongoDB to understand that multiple constraints apply to the same array element.

Advanced multikey optimization therefore requires understanding both:

query correctness

and:

index efficiency.`,

      internalWorking: `Document:

scores[0]
subject = MongoDB
score = 40

scores[1]
subject = Linux
score = 90


Independent predicates:

subject = MongoDB
score >= 80

Both exist somewhere
in array

Document may match.


$elemMatch:

Same element must satisfy:

subject = MongoDB
AND
score >= 80

No element satisfies both.`,

      architecture: `Array
 |
 +--> Element 1
 |      subject
 |      score
 |
 +--> Element 2
        subject
        score


$elemMatch
     |
     v
Conditions bound to
same array element`,

      examples: [
        `Same-element query:

db.students.find({
  scores: {
    $elemMatch: {
      subject: "MongoDB",
      score: {
        $gte: 80
      }
    }
  }
})`,

        `Possible compound multikey index:

db.students.createIndex({
  "scores.subject": 1,
  "scores.score": 1
})`
      ],

      commands: [
        {
          command:
            'db.students.find({ scores: { $elemMatch: { subject: "MongoDB", score: { $gte: 80 } } } }).explain("executionStats")',
          explanation:
            'Shows execution details for predicates that must match the same array element.'
        },
        {
          command:
            'db.students.createIndex({ "scores.subject": 1, "scores.score": 1 })',
          explanation:
            'Creates a compound index across paths within the same array-of-documents structure, subject to MongoDB multikey rules.'
        }
      ],

      productionScenario: `An application searches products where the same variant must have:

color = RED

and:

stock > 0

Data:

variants: [
  {
    color: "RED",
    stock: 0
  },
  {
    color: "BLUE",
    stock: 100
  }
]

The developers use independent dotted predicates.

The query can logically match because RED exists in one element and stock > 0 exists in another.

The issue initially appears to be an indexing problem.

It is actually a query-semantic problem.

The DBA identifies the correct requirement and recommends $elemMatch.

After correctness is fixed, the DBA then evaluates a suitable compound multikey index and execution plan.`,

      troubleshootingApproach: `For advanced array queries:

1. Inspect the document array structure.

2. Identify whether predicates must apply to the same element.

3. Check whether $elemMatch is required.

4. Inspect existing multikey indexes.

5. Run explain.

6. Check multikey fields.

7. Inspect index bounds.

8. Check keys examined.

9. Check documents examined.

10. Measure array size.

11. Check compound multikey restrictions.

12. Validate query correctness before tuning performance.`,

      commonMistakes: [
        'Tuning an array query before confirming its semantics.',
        'Assuming independent dotted predicates apply to the same array element.',
        'Ignoring multikey index expansion.',
        'Ignoring large arrays.',
        'Creating compound array indexes without understanding restrictions.'
      ],

      bestPractices: [
        'Get array semantics correct first.',
        'Use $elemMatch when predicates target the same element.',
        'Inspect multikey explain information.',
        'Keep indexed arrays bounded where possible.',
        'Validate both correctness and performance.'
      ],

      interviewAnswer: `With multikey indexes, each array document can generate multiple index keys.

For arrays of embedded documents, $elemMatch is important when multiple predicates must apply to the same array element.

Without it, predicates can match different elements.

At L3 level I first verify query correctness, then inspect multikey bounds, keys examined, array size, and compound multikey restrictions.`,

      keyTakeaways: [
        'Array query semantics come before performance tuning.',
        '$elemMatch binds predicates to the same element.',
        'Multikey bounds require special care.',
        'Large arrays increase index work.',
        'Explain should confirm both plan and scan efficiency.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 10,
    question:
      'How can projection and covered-query design reduce document fetches, and when does making an index wider become counterproductive?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 10,

    answer: {
      groundZero: `An indexed query often follows this path:

Index lookup
      |
      v
Find record reference
      |
      v
Fetch full document
      |
      v
Return selected fields

If the application needs only a few fields, fetching a very large document can be unnecessary work.

A covered query can sometimes return everything directly from the index.`,

      coreConcept: `Suppose:

Index:

{
  accountId: 1,
  status: 1,
  updatedAt: -1
}

Query:

db.accounts.find(
  {
    accountId: 1001
  },
  {
    _id: 0,
    status: 1,
    updatedAt: 1
  }
)

If all required fields are in the index, MongoDB may avoid FETCH.

But adding many projected fields to an index purely to create coverage can make the index excessively wide.`,

      detailedExplanation: `Consider documents of size:

50 KB

but the API returns only:

accountId
status
updatedAt

If the query performs:

1 million document FETCH operations

the storage/cache work can be substantial.

A covered index may reduce that work.

However, suppose developers request coverage for:

20 additional fields.

The index becomes:

{
  accountId: 1,
  status: 1,
  updatedAt: -1,
  name: 1,
  email: 1,
  phone: 1,
  city: 1,
  address: 1,
  ...
}

Now the index itself becomes large.

Consequences:

• More disk space
• Larger cache footprint
• More write maintenance
• More index pages
• Higher backup/storage footprint
• Increased cost when projected fields change

Therefore covered-query optimization has diminishing returns.

A narrow high-frequency API may strongly benefit from coverage.

A rare administrative query may not justify a wide index.

Projection itself also matters.

If an application issues:

find({ ... })

without a projection, MongoDB may fetch and return large fields that the application never uses.

Adding an appropriate projection can reduce:

• server work
• network transfer
• application deserialization

Even when a query is not fully covered.`,

      internalWorking: `Non-covered:

IXSCAN
   |
   v
Record ID
   |
   v
FETCH 50 KB document
   |
   v
Return 3 fields


Covered:

IXSCAN
   |
   v
3 required fields
already in index
   |
   v
Return


Trade-off:

Wider index
   |
   +--> more storage
   +--> more cache
   +--> more write cost`,

      architecture: `Query
 |
 v
Index
 |
 +--> All fields available?
       |
    +--+--+
    |     |
   YES    NO
    |     |
    v     v
Covered  FETCH
    |
    v
Less document I/O


But:

More index fields
      |
      v
Larger index footprint`,

      examples: [
        `Narrow projection:

db.accounts.find(
  {
    accountId: 1001
  },
  {
    _id: 0,
    status: 1,
    updatedAt: 1
  }
)`,

        `Candidate covering index:

db.accounts.createIndex({
  accountId: 1,
  status: 1,
  updatedAt: -1
})`,

        `Verify:

db.accounts.find(
  { accountId: 1001 },
  { _id: 0, status: 1, updatedAt: 1 }
).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.accounts.find({ accountId: 1001 }, { _id: 0, status: 1, updatedAt: 1 }).explain("executionStats")',
          explanation:
            'Helps determine whether the query avoids document FETCH operations.'
        },
        {
          command:
            'db.accounts.stats()',
          explanation:
            'Provides collection and index-size information for evaluating index footprint.'
        }
      ],

      productionScenario: `A high-throughput API executes:

50,000 queries per second.

Each source document averages:

30 KB.

The API needs only:

deviceId
status
lastSeen

Current index:

{
  deviceId: 1
}

Every query performs a document FETCH.

The DBA evaluates:

{
  deviceId: 1,
  status: 1,
  lastSeen: 1
}

The query becomes covered and read load drops substantially.

Later developers request adding fifteen more response fields.

The DBA refuses to blindly widen the same index.

Instead they evaluate:

• whether those fields are really required
• whether request frequency remains high
• index size
• update frequency of those fields
• whether document FETCH may now be acceptable

The optimal index is a workload trade-off, not a goal of covering every query.`,

      troubleshootingApproach: `For coverage optimization:

1. Capture query filter.

2. Capture exact projection.

3. Check whether _id is implicitly returned.

4. List fields available in candidate index.

5. Run explain.

6. Check for FETCH.

7. Check totalDocsExamined.

8. Measure document size.

9. Measure query frequency.

10. Estimate index-width increase.

11. Identify how often projected indexed fields change.

12. Compare read benefit with write/cache cost.

13. Keep coverage focused on high-value workloads.`,

      commonMistakes: [
        'Trying to cover every query.',
        'Creating extremely wide indexes.',
        'Ignoring projection entirely.',
        'Ignoring the write frequency of projected indexed fields.',
        'Assuming FETCH is always bad.'
      ],

      bestPractices: [
        'Use narrow projections.',
        'Target coverage at high-value workloads.',
        'Keep covering indexes reasonably narrow.',
        'Measure index footprint.',
        'Balance FETCH reduction against write/cache cost.'
      ],

      interviewAnswer: `Projection can reduce returned data, and a covered query can eliminate document FETCH when all filter and projected fields are available in the index.

This can be very valuable for high-frequency reads on large documents.

But I do not keep adding fields indefinitely because wider indexes consume more disk, cache, and write resources.

Coverage is justified only when the workload benefit exceeds that cost.`,

      keyTakeaways: [
        'Projection reduces unnecessary returned data.',
        'Covered queries can avoid FETCH.',
        'Large source documents can make coverage valuable.',
        'Wide indexes have significant cost.',
        'Coverage should target high-value query patterns.'
      ]
    }
  },
  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 11,
    question:
      'How does MongoDB choose between multiple candidate indexes for the same query, and what should a DBA understand about query plan competition?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A collection can have multiple indexes that are technically usable for the same query.

MongoDB therefore needs to decide:

Which access plan should I use?

The query planner evaluates candidate plans and selects a winning plan based on expected and observed execution efficiency.`,

      coreConcept: `Suppose a collection has:

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
  status: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001,
  status: "OPEN"
}

with:

sort({
  createdAt: -1
})

Several indexes may be relevant.

MongoDB's query planner evaluates possible access paths and selects one as the winning plan.`,

      detailedExplanation: `The planner does not simply choose:

• the newest index
• the largest index
• the index with the most fields
• the index whose name appears first

It evaluates candidate plans.

A candidate plan may involve:

• collection scan
• one index scan
• another index scan
• index intersection in eligible cases
• index scan plus FETCH
• index scan plus SORT

The winning plan is influenced by how much work is required to return results.

An index that appears logically attractive may perform poorly because:

• its leading field is low-selectivity
• its bounds are broad
• it requires many FETCH operations
• it cannot satisfy the requested sort
• another index produces fewer reads
• data distribution has changed

The planner may cache a selected plan for a query shape, depending on the planner and server behavior.

This avoids repeatedly performing full candidate-plan competition for every execution of the same shape.

A DBA should understand two concepts:

QUERY SHAPE

Queries that have the same structural form may belong to the same general planning pattern.

PLAN SELECTION

MongoDB chooses an execution strategy considered efficient for that workload.

If a query becomes slow, the DBA should inspect both:

the winning plan

and:

whether better alternatives exist.

Rejected plans in explain output can help show what alternatives the planner considered.`,

      internalWorking: `Query
  |
  v
Query Planner
  |
  +--> Candidate A
  |      IXSCAN index_A
  |
  +--> Candidate B
  |      IXSCAN index_B
  |
  +--> Candidate C
  |      IXSCAN compound_index
  |
  +--> COLLSCAN
  |
  v
Plan evaluation
  |
  v
Winning plan
  |
  v
Execution`,

      architecture: `                 Query
                   |
                   v
              Query Planner
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
    Index A     Index B     Index C
       |           |           |
       +-----------+-----------+
                   |
                   v
              Compare work
                   |
                   v
              Winning Plan`,

      examples: [
        `Check query plan:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("executionStats")`,

        `Existing indexes:

db.orders.getIndexes()`,

        `Potential compound index:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  createdAt: -1
})`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("allPlansExecution")',
          explanation:
            'Provides information about the winning plan and candidate plan execution behavior for the query.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows the available indexes that may participate in query planning.'
        }
      ],

      productionScenario: `A query has three potentially relevant indexes.

Developers assume MongoDB should use:

{
  customerId: 1,
  status: 1
}

because both filter fields are present.

Explain instead shows MongoDB using:

{
  customerId: 1,
  createdAt: -1
}

Investigation shows:

status = OPEN

matches 98% of that customer's records.

The alternative index provides little additional filtering, while the selected index also satisfies the requested sort.

The planner's choice is therefore reasonable.

The DBA does not force the expected index merely because it looks more intuitive.`,

      troubleshootingApproach: `For candidate-plan investigation:

1. Capture the exact query.

2. Run explain("executionStats").

3. If necessary, use allPlansExecution.

4. Identify winningPlan.

5. Identify rejected candidate plans.

6. Compare keyPattern.

7. Compare indexBounds.

8. Compare keys examined.

9. Compare documents examined.

10. Check sort stages.

11. Check nReturned.

12. Review current data distribution.

13. Compare with previous behavior.

14. Test alternative indexes only in a controlled manner.

15. Avoid forcing plans before understanding why the planner chose its winner.`,

      commonMistakes: [
        'Assuming MongoDB chooses the index with the most fields.',
        'Assuming the DBA can identify the best index by name alone.',
        'Ignoring rejected plans.',
        'Using hint before understanding planner behavior.',
        'Ignoring data distribution changes.'
      ],

      bestPractices: [
        'Use explain to understand planner decisions.',
        'Compare actual work performed by candidate plans.',
        'Use allPlansExecution when deeper analysis is required.',
        'Consider sort as well as filtering.',
        'Let measurements drive manual intervention.'
      ],

      interviewAnswer: `When multiple indexes are eligible, MongoDB's query planner evaluates candidate access plans and selects a winning plan based on execution efficiency.

I inspect winningPlan, rejected plans, indexBounds, keys examined, documents examined, sort behavior, and data distribution.

I do not assume the most obvious compound index is automatically best, and I avoid forcing plans until I understand the planner's decision.`,

      keyTakeaways: [
        'Multiple usable indexes can compete.',
        'The planner selects a winning plan.',
        'Rejected plans can provide useful evidence.',
        'Data distribution influences which plan is best.',
        'Manual plan forcing should be a last resort.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 12,
    question:
      'What is the MongoDB plan cache, why does it exist, and how can plan-cache behavior contribute to query performance regressions?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `MongoDB does not want to repeat expensive query-plan selection for every execution of the same query pattern.

For recurring query shapes, MongoDB can reuse previously selected planning information.

This behavior is associated with the query plan cache.`,

      coreConcept: `The plan cache helps reduce repeated planning overhead.

Conceptually:

First execution:

Query
 |
 v
Evaluate candidate plans
 |
 v
Choose winner
 |
 v
Remember planning result

Later similar query:

Query
 |
 v
Reuse cached planning choice
 |
 v
Execute

This can improve efficiency, but workload changes can make an old planning choice less appropriate.`,

      detailedExplanation: `Suppose a query shape is:

{
  status: ?
}

At one point:

status = "FAILED"

is rare.

An index on status performs very well.

Later the same structural query frequently searches:

status = "SUCCESS"

and SUCCESS represents most of the collection.

The same broad query shape can encounter very different selectivity characteristics depending on parameter values.

MongoDB's modern planner has mechanisms for replanning and plan-cache management, but a DBA should still understand that cached planning behavior may be relevant when investigating sudden or parameter-dependent regressions.

Plan-cache related symptoms can include:

• query performance changing after restart
• performance changing after index creation or removal
• one parameter value performing much worse than another
• a previously fast query becoming slow after data distribution changes
• explain behavior differing from application runtime observations

The DBA should not immediately clear the plan cache as a generic fix.

That may temporarily change behavior without resolving:

• bad index design
• unstable query selectivity
• changed application query shape
• skewed data distribution

Plan cache clearing is therefore a diagnostic or corrective action only when there is evidence that cached planning is relevant.`,

      internalWorking: `First execution

Query Shape
    |
    v
Planner
    |
    v
Candidate Plans
    |
    v
Winner
    |
    v
Plan Cache


Subsequent execution

Query Shape
    |
    v
Plan Cache
    |
    v
Selected execution strategy`,

      architecture: `Application Query
       |
       v
Query Shape
       |
       v
Plan Cache lookup
       |
    +--+--+
    |     |
   Hit   Miss
    |     |
    v     v
Reuse   Plan competition
          |
          v
      Cache result`,

      examples: [
        `Inspect query execution:

db.orders.find({
  status: "FAILED"
}).explain("executionStats")`,

        `Compare another value:

db.orders.find({
  status: "SUCCESS"
}).explain("executionStats")`,

        `Inspect available plan-cache information using supported plan cache methods for the server version.`
      ],

      commands: [
        {
          command:
            'db.orders.getPlanCache().list()',
          explanation:
            'Lists plan-cache entries where supported by the shell/server version.'
        },
        {
          command:
            'db.orders.getPlanCache().clear()',
          explanation:
            'Clears cached query plans for the collection. This should be used carefully and only when justified by diagnosis.'
        }
      ],

      productionScenario: `A query suddenly improves immediately after a mongod restart.

A few hours later it becomes slow again.

The DBA sees the query has multiple candidate indexes and highly skewed parameter distributions.

Instead of scheduling periodic restarts, the DBA investigates:

• which query shapes are affected
• which plans are selected
• whether indexes are stable across parameter values
• whether the query pattern should be redesigned
• whether a better compound index can reduce plan sensitivity

The restart changed planning state, but it was not the root-cause fix.`,

      troubleshootingApproach: `For suspected plan-cache issues:

1. Confirm query shape.

2. Reproduce the slow parameter value.

3. Reproduce a fast parameter value.

4. Compare explain output.

5. Check available indexes.

6. Review plan-cache information.

7. Correlate behavior with restart/index changes.

8. Check data skew.

9. Check whether a single index performs consistently across parameter values.

10. Avoid clearing plan cache repeatedly as a workaround.

11. Correct the underlying index/query design where possible.

12. Monitor after any planner-related change.`,

      commonMistakes: [
        'Clearing the plan cache for every slow query.',
        'Treating a restart as a permanent query fix.',
        'Ignoring parameter selectivity.',
        'Ignoring data skew.',
        'Assuming plan cache means MongoDB never replans.'
      ],

      bestPractices: [
        'Investigate plan-cache behavior only with evidence.',
        'Compare different parameter values.',
        'Prefer stable index designs.',
        'Fix root causes instead of repeatedly clearing cache.',
        'Understand server-version-specific planner behavior.'
      ],

      interviewAnswer: `MongoDB uses plan caching to avoid repeating full candidate-plan evaluation for recurring query shapes.

If data distribution, parameters, indexes, or workload characteristics change, cached planning behavior can become relevant to performance regressions.

I compare query shapes, parameters, execution plans, data skew, and plan-cache information, but I do not treat clearing the plan cache as a generic solution.`,

      keyTakeaways: [
        'Plan caching reduces repeated planning work.',
        'Parameter selectivity can affect plan suitability.',
        'Data distribution changes matter.',
        'Cache clearing is not a permanent tuning strategy.',
        'Root-cause index and query design remain primary.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 13,
    question:
      'What does hint() do in MongoDB, when is it useful, and why can forcing an index be dangerous in production?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `hint() tells MongoDB to use a specific index or access path for a query instead of allowing the normal planner to choose freely.

Example:

db.orders.find({
  customerId: 1001
}).hint({
  customerId: 1
})

This forces that index for the query.`,

      coreConcept: `hint() is useful mainly for:

• controlled testing
• comparing candidate indexes
• troubleshooting planner behavior
• specialized application cases where plan forcing is deliberately designed

It should not be the default response to every query-plan disagreement.`,

      detailedExplanation: `Suppose there are two indexes:

A:

{
  customerId: 1
}

B:

{
  customerId: 1,
  createdAt: -1
}

Query:

{
  customerId: 1001
}

sort:

{
  createdAt: -1
}

The planner selects B.

A DBA can test A using:

.hint({
  customerId: 1
})

and compare execution statistics.

This is valuable during investigation.

But consider hard-coding a hint in production.

Today:

Index A may be best.

Six months later:

• collection size changes
• data distribution changes
• query shape changes
• a better index is created
• the hinted index is dropped
• workload characteristics shift

A forced plan can prevent the query planner from adapting.

If a required hinted index no longer exists, the query can also fail rather than simply falling back to another suitable access path.

Therefore hints introduce operational coupling between application code and physical index design.

That coupling must be intentional.`,

      internalWorking: `Normal:

Query
  |
  v
Planner
  |
  +--> Index A
  +--> Index B
  +--> Index C
  |
  v
Choose best


With hint:

Query
  |
  v
hint(Index B)
  |
  v
Use Index B

Planner choice constrained`,

      architecture: `Application
    |
    v
Query + hint
    |
    v
Specified index
    |
    v
Execution


Risk:

Index/data/workload changes
        |
        v
Forced plan remains
        |
        v
Potential regression`,

      examples: [
        `Hint by key pattern:

db.orders.find({
  customerId: 1001
}).hint({
  customerId: 1
})`,

        `Hint by index name:

db.orders.find({
  customerId: 1001
}).hint("customerId_1")`,

        `Compare:

db.orders.find({
  customerId: 1001
}).hint({
  customerId: 1
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).hint({ customerId: 1 }).explain("executionStats")',
          explanation:
            'Forces the customerId index for controlled performance comparison.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Allows the normal planner to choose a plan for comparison.'
        }
      ],

      productionScenario: `An application developer hard-codes a hint for:

{
  status: 1
}

because it improved one test query.

Months later status becomes extremely low-selectivity.

A new index:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

would be much better.

But the application continues forcing status_1.

MongoDB cannot choose the better index.

The hint has turned an old optimization into a performance problem.

The DBA removes the unnecessary hint after validating the planner's current choice.`,

      troubleshootingApproach: `Before using hint:

1. Run query without hint.

2. Record winning plan.

3. Record keys/docs examined.

4. Test candidate index using hint.

5. Compare real work.

6. Verify sort behavior.

7. Test several parameter values.

8. Test realistic data distributions.

9. Determine whether the benefit is stable.

10. Prefer fixing index design over permanent hints.

11. Document any production hint.

12. Review hints during index changes and upgrades.`,

      commonMistakes: [
        'Using hint as the first tuning action.',
        'Hard-coding hints based on one test case.',
        'Forgetting application hints during index removal.',
        'Using hints to hide poor index design.',
        'Assuming a hinted plan will stay optimal forever.'
      ],

      bestPractices: [
        'Use hint primarily as a diagnostic tool.',
        'Compare hinted and planner-selected plans.',
        'Avoid unnecessary application-plan coupling.',
        'Document mandatory production hints.',
        'Revalidate hints as data and workloads change.'
      ],

      interviewAnswer: `hint() forces MongoDB to use a specified index or access path.

I commonly use it during diagnostics to compare candidate index performance.

I avoid permanent hints unless there is a strong, measured reason because hints prevent the planner from adapting to data and index changes and create application dependency on a specific physical index.`,

      keyTakeaways: [
        'hint forces an access path.',
        'It is very useful for testing.',
        'Permanent hints reduce planner flexibility.',
        'Hinted indexes create application coupling.',
        'Measure multiple parameter values before forcing plans.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 14,
    question:
      'What are hidden indexes, how do they differ from dropped indexes, and how can a DBA use them for safer production index cleanup?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `A hidden index still exists, but MongoDB's query planner normally does not consider it when choosing plans.

This lets a DBA simulate:

"What happens if this index is unavailable to queries?"

without immediately deleting the index.`,

      coreConcept: `Example:

db.orders.hideIndex(
  "customerId_1_status_1"
)

The index remains:

• stored
• maintained on writes
• available to be unhidden

but is excluded from normal planner consideration.

This makes hiding useful for testing whether an index can be safely removed.`,

      detailedExplanation: `Suppose a collection has an old index:

{
  customerId: 1,
  status: 1
}

The DBA suspects it is redundant.

Immediate drop:

db.orders.dropIndex(...)

removes the structure.

If query performance later suffers, rebuilding a large index may take significant time and resources.

Instead:

Step 1:

Hide the index.

Step 2:

Observe workload behavior.

Step 3:

Check:

• query latency
• CPU
• keys examined
• COLLSCAN
• alternative planner choices
• application errors

Step 4:

If problems appear:

unhide it.

Step 5:

If workload remains healthy over a representative period:

consider dropping it.

Important limitation:

A hidden index is still maintained on writes.

Therefore hiding does NOT test the write-performance benefit of actually removing the index.

It mainly tests:

query planner dependency.

If the index is eventually dropped, write overhead and disk usage may reduce further.

A hidden index also continues consuming storage.

Therefore hiding is a temporary evaluation state, not a cleanup endpoint.`,

      internalWorking: `Normal index:

Index exists
   |
   +--> Planner can use
   |
   +--> Writes maintain


Hidden index:

Index exists
   |
   +--> Planner does not normally use
   |
   +--> Writes still maintain


Dropped index:

Index removed
   |
   +--> Planner cannot use
   |
   +--> No future maintenance`,

      architecture: `Candidate Index
      |
      v
Hide
      |
      v
Observe workload
      |
   +--+--+
   |     |
Problem  Healthy
   |     |
   v     v
Unhide  Consider drop`,

      examples: [
        `Hide:

db.orders.hideIndex(
  "customerId_1_status_1"
)`,

        `Unhide:

db.orders.unhideIndex(
  "customerId_1_status_1"
)`,

        `Inspect indexes:

db.orders.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.orders.hideIndex("customerId_1_status_1")',
          explanation:
            'Hides the index from normal query planner consideration without deleting the index.'
        },
        {
          command:
            'db.orders.unhideIndex("customerId_1_status_1")',
          explanation:
            'Restores the index to planner visibility.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows current index definitions including hidden state.'
        }
      ],

      productionScenario: `A 2 TB collection has a 300 GB compound index that appears unused.

Dropping it immediately would create risk because rebuilding it could be operationally expensive.

The DBA:

1. records its definition
2. checks usage evidence
3. maps dependent query shapes
4. hides the index
5. monitors through a representative business cycle
6. verifies no critical query regression
7. then schedules permanent removal

This provides a much safer path than blind deletion.`,

      troubleshootingApproach: `For index-removal testing:

1. Record full index definition.

2. Check whether it is unique.

3. Check whether it supports business constraints.

4. Check partial/sparse/collation options.

5. Check usage statistics.

6. Identify dependent query shapes.

7. Hide candidate index.

8. Monitor application latency.

9. Monitor query plans.

10. Monitor CPU and scans.

11. Keep a clear rollback step.

12. Unhide immediately if regression occurs.

13. Observe for a representative workload window.

14. Drop only after sufficient validation.`,

      commonMistakes: [
        'Assuming hidden indexes reduce write overhead.',
        'Leaving unused indexes hidden forever.',
        'Hiding a constraint-related index without understanding semantics.',
        'Monitoring for only a few minutes.',
        'Dropping an index without preserving its definition.'
      ],

      bestPractices: [
        'Hide before drop when practical.',
        'Use a representative observation period.',
        'Preserve index definitions.',
        'Remember hidden indexes still cost writes and storage.',
        'Have an immediate unhide rollback procedure.'
      ],

      interviewAnswer: `A hidden index remains physically present and continues to be maintained, but the query planner does not normally consider it.

I use hidden indexes to test whether production queries depend on an index before permanently dropping it.

If performance regresses I can quickly unhide it, which is much safer than rebuilding a large dropped index.`,

      keyTakeaways: [
        'Hidden is not the same as dropped.',
        'Hidden indexes still consume storage.',
        'Hidden indexes still receive write maintenance.',
        'They are excellent for dependency testing.',
        'A hidden-index test should precede risky index removal.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 15,
    question:
      'How should a DBA plan and monitor an index build on a very large production collection?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Creating an index on a small test collection may finish quickly.

Creating an index on hundreds of millions or billions of documents is an operational event.

The DBA must consider:

• CPU
• disk
• memory
• replication
• available space
• workload impact
• build duration
• failure handling`,

      coreConcept: `An index build must read collection data, generate index keys, sort/process those keys, and persist the resulting index structure.

On a replica set, modern MongoDB coordinates index builds across replica-set members using supported index-build coordination and commit behavior.

Therefore the build can affect the whole production topology, not just one shell session.`,

      detailedExplanation: `Before building an index, a DBA should estimate:

1. INDEX SIZE

Look at comparable indexes and source data.

2. FREE DISK SPACE

Index creation needs persistent space for the completed index and may require temporary working space during the build.

Running a nearly full filesystem is dangerous.

3. DISK I/O

Scanning a large collection and writing index pages generates significant storage activity.

4. CPU

Key generation and sorting consume CPU.

5. MEMORY

Index builds use memory within MongoDB's index-build limits and can spill/work with temporary disk structures as required.

6. REPLICATION

On replica sets, index builds are coordinated.

The DBA should check:

• replica health
• lag
• voting members
• commit quorum considerations
• planned maintenance/failover activities

7. ACTIVE APPLICATION WORKLOAD

Even optimized modern index builds can compete with normal workload for CPU and I/O.

8. BUILD DURATION

Large collections can take substantial time.

9. ROLLBACK / ABORT PLAN

Know what to do if:

• disk becomes critical
• latency exceeds threshold
• replication degrades
• build fails
• business impact becomes unacceptable

Modern MongoDB should not be managed using outdated assumptions such as simply choosing old foreground versus background index build options.

Version-specific behavior matters.`,

      internalWorking: `Create Index
    |
    v
Scan Collection
    |
    v
Generate Keys
    |
    v
Sort / Build Structure
    |
    v
Persist Index
    |
    v
Replica-set coordinated commit
    |
    v
Index ready`,

      architecture: `                  Index Build
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
      CPU            Disk          Memory
       |              |              |
       +--------------+--------------+
                      |
                      v
                Replica Set
                      |
              +-------+-------+
              |       |       |
              v       v       v
           Primary Secondary Secondary`,

      examples: [
        `Create:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  createdAt: -1
})`,

        `Check current indexes:

db.orders.getIndexes()`,

        `Check replica state before a major build:

rs.status()`
      ],

      commands: [
        {
          command:
            'db.orders.stats()',
          explanation:
            'Provides collection and existing index size information useful for capacity planning.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Confirms whether an equivalent or overlapping index already exists.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health before starting a large production index build.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect active operations, including long-running work, depending on privileges and server behavior.'
        }
      ],

      productionScenario: `A 1.5 TB collection needs a new compound index.

The filesystem has only 120 GB free.

The DBA refuses to start immediately.

They first:

• estimate expected index size
• review historical index sizes
• arrange additional disk capacity
• verify all replica-set members are healthy
• confirm no secondary is lagging
• choose a lower-traffic window
• define latency and disk stop thresholds
• monitor during the build

This prevents an index optimization from becoming a storage incident.`,

      troubleshootingApproach: `Before and during a major build:

1. Verify exact index requirement.

2. Check existing overlaps.

3. Estimate index size.

4. Check free disk on every relevant member.

5. Check CPU baseline.

6. Check disk latency baseline.

7. Check cache health.

8. Check replica-set health.

9. Check replication lag.

10. Check maintenance/failover plans.

11. Select an appropriate workload window.

12. Start build.

13. Monitor CPU.

14. Monitor disk latency.

15. Monitor disk usage.

16. Monitor query latency.

17. Monitor replication lag.

18. Watch logs.

19. Validate final index.

20. Run explain against intended queries.

21. Document build duration and impact.`,

      commonMistakes: [
        'Starting a huge build without checking disk space.',
        'Ignoring secondary capacity.',
        'Using obsolete foreground/background assumptions.',
        'Building duplicate indexes.',
        'Failing to monitor application latency during the build.'
      ],

      bestPractices: [
        'Treat large index builds as planned production changes.',
        'Capacity-plan every member.',
        'Check replica health first.',
        'Monitor throughout the operation.',
        'Validate target queries after completion.'
      ],

      interviewAnswer: `For a large production index build I first verify the index is genuinely required and not redundant.

Then I check expected index size, free disk, CPU, I/O, cache, replica-set health, lag, and workload timing.

Modern MongoDB coordinates index builds across replica-set members, so I monitor the complete topology and validate the intended query plans after the build.`,

      keyTakeaways: [
        'Large index builds are production changes.',
        'Disk capacity must be checked first.',
        'Replica-set health matters.',
        'Modern index builds are coordinated operations.',
        'Validate query benefit after the build.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 16,
    question:
      'A query is using IXSCAN but CPU remains very high and latency is poor. How would you determine whether the index scan itself is inefficient?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 16,

    answer: {
      groundZero: `IXSCAN only means MongoDB is scanning an index.

It does not mean the scan is small.

MongoDB can scan millions of index entries and still report IXSCAN.

Therefore a high-CPU query can absolutely be caused by an inefficient index scan.`,

      coreConcept: `The DBA should inspect:

nReturned

totalKeysExamined

totalDocsExamined

indexBounds

FETCH filters

sort behavior

Example:

nReturned:
100

totalKeysExamined:
8,000,000

totalDocsExamined:
1,200,000

This is an inefficient indexed query.`,

      detailedExplanation: `High CPU can come from repeatedly processing:

• index keys
• filter predicates
• FETCH operations
• sorts
• expression evaluation
• many concurrent instances of the same query

Suppose:

Index:

{
  status: 1,
  customerId: 1,
  createdAt: -1
}

Query:

{
  customerId: 5001,
  status: {
    $ne: "DELETED"
  }
}

The leading status condition may span most status values.

MongoDB may examine huge portions of the index.

Even though customerId exists later in the index, the access path can still be inefficient.

Another case:

A query individually costs only 20 ms.

But it runs:

25,000 times per second.

Total CPU impact becomes enormous.

Therefore L3 analysis must evaluate both:

cost per execution

and:

execution frequency.

CPU problems are often workload multiplication problems.`,

      internalWorking: `Query
 |
 v
IXSCAN
 |
 v
5,000,000 keys
 |
 v
FETCH
 |
 v
500,000 documents
 |
 v
Return 100

Repeated 5,000 times/sec
 |
 v
High CPU`,

      architecture: `CPU Cost
   |
   +--> Keys examined
   |
   +--> Docs examined
   |
   +--> Filters
   |
   +--> Sort
   |
   +--> Query frequency
   |
   v
Total workload cost`,

      examples: [
        `Analyse:

db.orders.find({
  customerId: 5001,
  status: {
    $ne: "DELETED"
  }
}).explain("executionStats")`,

        `Check server operations:

db.currentOp()`,

        `Review operation latency:

db.serverStatus().opLatencies`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 5001, status: { $ne: "DELETED" } }).explain("executionStats")',
          explanation:
            'Shows how many index keys and documents are examined.'
        },
        {
          command:
            'db.currentOp()',
          explanation:
            'Helps identify currently active and repeatedly executing operations when privileges allow.'
        }
      ],

      productionScenario: `CPU reaches 95%.

The team says:

"All queries are indexed."

The DBA analyses the top query:

IXSCAN

nReturned:
20

totalKeysExamined:
1,800,000

totalDocsExamined:
350,000

Frequency:
6,000 executions per second.

A poorly ordered compound index causes massive key scanning.

The DBA tests a tighter index and reduces totalKeysExamined close to the returned candidate set.

CPU falls dramatically.

The problem was not lack of index usage.

It was excessive indexed work.`,

      troubleshootingApproach: `For high-CPU IXSCAN:

1. Identify top query shapes.

2. Determine execution frequency.

3. Run executionStats.

4. Compare keys examined with returned count.

5. Compare docs examined with returned count.

6. Inspect indexBounds.

7. Inspect FETCH filters.

8. Check range/non-equality predicates.

9. Check compound order.

10. Check sort.

11. Check multikey expansion.

12. Test tighter index.

13. Measure per-query improvement.

14. Multiply by workload frequency.

15. Monitor CPU after change.`,

      commonMistakes: [
        'Assuming indexed means low CPU.',
        'Ignoring query frequency.',
        'Ignoring keys examined.',
        'Looking only at slowest query duration.',
        'Adding more CPU before correcting bad query work.'
      ],

      bestPractices: [
        'Rank queries by total resource consumption.',
        'Measure keys examined.',
        'Optimize high-frequency inefficient IXSCANs.',
        'Use tighter compound bounds.',
        'Verify CPU reduction after query tuning.'
      ],

      interviewAnswer: `If CPU is high even though a query uses IXSCAN, I check how much work that IXSCAN performs.

I compare nReturned, totalKeysExamined, totalDocsExamined, indexBounds, FETCH filters, sort stages, and execution frequency.

An index scan examining millions of keys thousands of times per second can consume far more CPU than a single obvious collection scan.`,

      keyTakeaways: [
        'IXSCAN can still be CPU-expensive.',
        'Keys examined is a critical metric.',
        'Frequency multiplies per-query cost.',
        'Tighter compound bounds can reduce CPU.',
        'Workload impact matters more than stage names.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 17,
    question:
      'How should pagination queries be indexed, and why can large skip() values become inefficient compared with range-based pagination?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 17,

    answer: {
      groundZero: `Pagination means returning data in pages.

A common implementation is:

skip()
+
limit()

Example:

db.orders.find({})
  .sort({
    createdAt: -1
  })
  .skip(1000000)
  .limit(20)

This works functionally, but very large skip values can become expensive.`,

      coreConcept: `skip does not magically jump to page one million without work.

MongoDB still needs to advance past the skipped results according to the selected access path.

As offset grows, work can grow.

Range-based or seek-based pagination uses the last seen indexed key instead.`,

      detailedExplanation: `OFFSET PAGINATION

Page 1:

skip(0)
limit(20)

Page 2:

skip(20)
limit(20)

Page 50,000:

skip(999980)
limit(20)

The database may need to traverse nearly a million earlier entries before returning the next 20.

RANGE PAGINATION

Suppose index:

{
  createdAt: -1,
  _id: -1
}

After returning:

createdAt = T
_id = X

the next request can ask for records after that key position.

The combination of:

createdAt + _id

provides deterministic ordering when many records share the same timestamp.

Conceptually:

{
  $or: [
    {
      createdAt: {
        $lt: lastCreatedAt
      }
    },
    {
      createdAt: lastCreatedAt,
      _id: {
        $lt: lastId
      }
    }
  ]
}

with matching sort:

{
  createdAt: -1,
  _id: -1
}

Now MongoDB can seek into the index near the continuation point instead of walking past a huge offset.

Range pagination is especially useful for:

• feeds
• event histories
• large tables
• APIs with deep pagination

Offset pagination is still reasonable for:

• small result sets
• shallow pages
• simple administrative interfaces

The correct design depends on requirements.`,

      internalWorking: `skip(1,000,000)

Index start
   |
   v
skip entry 1
skip entry 2
...
skip entry 1,000,000
   |
   v
return next 20


Range pagination:

Last key
   |
   v
Seek to position
   |
   v
Return next 20`,

      architecture: `Offset Pagination

Start
 |
 v
Walk N records
 |
 v
Return page


Seek Pagination

Last Seen Key
 |
 v
Index Seek
 |
 v
Return page`,

      examples: [
        `Large offset:

db.orders.find({})
  .sort({ createdAt: -1 })
  .skip(1000000)
  .limit(20)`,

        `Candidate index:

db.orders.createIndex({
  createdAt: -1,
  _id: -1
})`,

        `Seek-style next page:

db.orders.find({
  $or: [
    {
      createdAt: {
        $lt: lastCreatedAt
      }
    },
    {
      createdAt: lastCreatedAt,
      _id: {
        $lt: lastId
      }
    }
  ]
}).sort({
  createdAt: -1,
  _id: -1
}).limit(20)`
      ],

      commands: [
        {
          command:
            'db.orders.find({}).sort({ createdAt: -1 }).skip(1000000).limit(20).explain("executionStats")',
          explanation:
            'Shows the work required for deep offset pagination.'
        },
        {
          command:
            'db.orders.createIndex({ createdAt: -1, _id: -1 })',
          explanation:
            'Creates deterministic ordered keys suitable for seek-style pagination.'
        }
      ],

      productionScenario: `An API becomes progressively slower as users move deeper into historical pages.

Page 1:
20 ms

Page 100:
35 ms

Page 10,000:
2 seconds

Page 100,000:
12 seconds

The query uses:

skip(offset)

The DBA confirms execution work rises with offset.

The API is redesigned to return a continuation token based on:

createdAt + _id

The next page starts from the previous last record instead of skipping all earlier results.

Latency becomes much more stable.`,

      troubleshootingApproach: `For pagination issues:

1. Check skip values.

2. Check requested page depth.

3. Run explain at shallow offset.

4. Run explain at deep offset.

5. Compare keys examined.

6. Check sort index.

7. Identify stable ordering fields.

8. Add unique tie-breaker such as _id.

9. Design seek pagination.

10. Test duplicate timestamp cases.

11. Test inserts occurring between pages.

12. Keep API continuation tokens opaque where appropriate.

13. Compare latency across page depth.`,

      commonMistakes: [
        'Using huge skip values for internet-scale collections.',
        'Using non-deterministic sort keys.',
        'Using createdAt alone when many records share the same timestamp.',
        'Designing pagination without an index.',
        'Assuming page 1 performance represents page 100000.'
      ],

      bestPractices: [
        'Use range/seek pagination for deep result sets.',
        'Use deterministic compound sorting.',
        'Include a tie-breaker such as _id.',
        'Align pagination filter and sort with the index.',
        'Benchmark deep pages.'
      ],

      interviewAnswer: `Large skip values become expensive because MongoDB still has to advance past the skipped entries.

For deep pagination I prefer range or seek pagination based on the last seen indexed key, typically using a deterministic compound order such as createdAt plus _id.

This allows the next query to seek into the index rather than repeatedly walking from the beginning.`,

      keyTakeaways: [
        'Deep skip pagination scales poorly.',
        'Seek pagination uses the previous key position.',
        'Stable ordering is essential.',
        '_id can serve as a tie-breaker.',
        'Pagination index and sort must align.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 18,
    question:
      'A new index is created for one slow query, but several previously fast queries become slower. How would you investigate whether the index change caused a query-plan regression?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 18,

    answer: {
      groundZero: `Creating an index does not change only one query.

A new index becomes another candidate available to the query planner.

Other query shapes may start considering or selecting that index.

Therefore a new index can improve one query while changing plans for others.`,

      coreConcept: `The DBA should compare:

Before index creation

versus:

After index creation

for affected query shapes.

Important evidence includes:

• winning plan
• rejected plans
• keys examined
• documents examined
• sort stages
• latency
• plan-cache behavior
• resource usage`,

      detailedExplanation: `Suppose the original indexes are:

A:

{
  customerId: 1,
  createdAt: -1
}

B:

{
  status: 1
}

A new index is added:

C:

{
  status: 1,
  customerId: 1
}

It solves a reporting query.

Another application query previously used A efficiently:

{
  customerId: 1001
}

sort:

{
  createdAt: -1
}

After index creation, planner behavior or cached plans may change for some related query shapes.

The DBA should determine whether:

• the affected query actually selected the new index
• plan-cache state changed
• the regression coincided exactly with index deployment
• resource pressure from building or maintaining the new index is the actual cause
• write latency increased rather than read planning changing
• larger index working set created cache pressure

This distinction matters.

A regression after index creation does not prove:

"MongoDB picked the wrong index."

The new index can hurt through multiple mechanisms:

1. Planner change
2. Plan-cache change
3. Write overhead
4. Cache footprint
5. Disk footprint
6. Index-build resource consumption

The investigation must isolate which mechanism occurred.`,

      internalWorking: `New Index Added
     |
     +--> New planner candidate
     |
     +--> More write maintenance
     |
     +--> Larger index working set
     |
     +--> More disk footprint
     |
     v
Possible regression`,

      architecture: `Deployment Timeline
       |
       v
Index Creation
       |
       +--> Query Plan Change?
       |
       +--> CPU Change?
       |
       +--> Write Cost?
       |
       +--> Cache Pressure?
       |
       +--> Disk Pressure?
       |
       v
Root cause isolation`,

      examples: [
        `Affected query:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
}).explain("executionStats")`,

        `Check indexes:

db.orders.getIndexes()`,

        `Check index size:

db.orders.stats()`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).explain("allPlansExecution")',
          explanation:
            'Shows whether the new index is involved in candidate planning or selected as the winner.'
        },
        {
          command:
            'db.orders.aggregate([{ $indexStats: {} }])',
          explanation:
            'Provides additional evidence about index usage.'
        },
        {
          command:
            'db.orders.stats()',
          explanation:
            'Shows index footprint and collection statistics.'
        }
      ],

      productionScenario: `A new compound index improves one report from 40 seconds to 300 ms.

Soon after, transactional latency increases by 25%.

The DBA checks query plans and finds they are unchanged.

However:

• collection writes are extremely high
• the new index contains frequently updated fields
• total index footprint increased significantly
• disk write latency rose

The regression came from index-maintenance overhead, not planner regression.

The team decides whether the reporting benefit justifies the transactional cost or whether reporting should use a different architecture.`,

      troubleshootingApproach: `For post-index regression:

1. Establish exact deployment timestamp.

2. Identify affected queries.

3. Compare before/after plans.

4. Check whether new index is selected.

5. Check rejected plans.

6. Check plan-cache behavior.

7. Check keys/docs examined.

8. Check CPU.

9. Check write latency.

10. Check disk latency.

11. Check cache pressure.

12. Check index size growth.

13. Check replication lag.

14. Hide the new index if planner dependency needs testing.

15. Remember hiding does not remove write overhead.

16. In a controlled window, determine whether permanent removal is required.

17. Validate after rollback/change.`,

      commonMistakes: [
        'Assuming every post-index regression is a planner issue.',
        'Ignoring write overhead.',
        'Ignoring cache footprint.',
        'Dropping the index without comparing plans.',
        'Changing several indexes simultaneously.'
      ],

      bestPractices: [
        'Baseline important queries before index deployment.',
        'Monitor reads and writes after creation.',
        'Correlate changes with deployment time.',
        'Use controlled rollback/testing.',
        'Treat indexing changes as production changes.'
      ],

      interviewAnswer: `If queries regress after a new index, I compare before-and-after plans and determine whether the new index changed planner selection.

I also investigate non-planner effects such as write-maintenance cost, cache footprint, disk I/O, and replication lag.

I isolate the mechanism before removing the index because temporal correlation alone does not prove the planner chose it incorrectly.`,

      keyTakeaways: [
        'New indexes can affect more than one query.',
        'Planner change is only one possible cause.',
        'Write and cache overhead can create regressions.',
        'Before/after baselines are valuable.',
        'Index deployments need post-change monitoring.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 19,
    question:
      'How would you safely deploy a new compound index to a critical production replica set with strict latency requirements?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 19,

    answer: {
      groundZero: `A production index deployment should be treated like a controlled infrastructure change.

The objective is not only:

Create the index successfully.

The objective is:

Create it without causing unacceptable customer impact.`,

      coreConcept: `A safe deployment has four phases:

Before
  |
  v
Validate

During
  |
  v
Monitor

After
  |
  v
Verify

Rollback
  |
  v
Recover safely if impact is unacceptable`,

      detailedExplanation: `BEFORE THE CHANGE

Confirm:

• exact query problem
• executionStats evidence
• candidate index field order
• existing overlap
• expected index size
• free disk
• CPU headroom
• disk latency
• replica-set health
• replication lag
• backup status
• business change window

Define stop thresholds.

Example:

Abort/escalate if:

• disk reaches critical threshold
• p95 application latency exceeds agreed value
• replication lag exceeds defined limit
• CPU remains saturated
• storage latency exceeds agreed threshold

DURING THE BUILD

Monitor:

• mongod logs
• CPU
• disk I/O
• disk free space
• query latency
• write latency
• replication lag
• member health

AFTER THE BUILD

Do not assume success because createIndex returned successfully.

Validate:

• index exists on expected topology
• intended query uses it
• keys examined decreased
• docs examined decreased
• blocking sort removed if expected
• application latency improved
• write latency remains acceptable

ROLLBACK

If the new index causes planner regression, hiding may be useful for query-plan isolation.

If ongoing write/storage overhead is unacceptable, permanent removal may be required after appropriate change approval.

The complete index definition should be retained so the index can be recreated if necessary.`,

      internalWorking: `Pre-check
   |
   v
Capacity
   |
   v
Replica health
   |
   v
Build
   |
   v
Continuous monitoring
   |
   +--> Healthy
   |      |
   |      v
   |    Validate benefit
   |
   +--> Impact unacceptable
          |
          v
      Stop / rollback plan`,

      architecture: `Production Change

+------------------+
| Pre-validation   |
+------------------+
         |
         v
+------------------+
| Index Build      |
+------------------+
         |
         v
+------------------+
| Live Monitoring  |
+------------------+
         |
         v
+------------------+
| Query Validation |
+------------------+
         |
         v
+------------------+
| Post-check       |
+------------------+`,

      examples: [
        `Before:

db.orders.getIndexes()`,

        `Replica health:

rs.status()`,

        `Build:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  createdAt: -1
})`,

        `After:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.orders.stats()',
          explanation:
            'Helps assess collection/index footprint before the change.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Verifies replica-set state and member health before the build.'
        },
        {
          command:
            'db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 })',
          explanation:
            'Creates the intended compound index.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Validates whether the intended query benefits after deployment.'
        }
      ],

      productionScenario: `A banking workload has strict latency requirements.

A query currently performs:

COLLSCAN

on a large transaction collection.

The DBA has proven a compound index reduces the query from seconds to milliseconds in staging.

But production storage is already moderately busy.

Instead of running createIndex immediately during peak traffic, the DBA:

• schedules the change during lower traffic
• verifies disk and replica health
• sets clear latency and lag thresholds
• starts the build
• monitors continuously
• validates the target query
• monitors transactional writes afterward

The successful index deployment is judged by business workload health, not only technical completion.`,

      troubleshootingApproach: `Production deployment checklist:

1. Verify query evidence.

2. Validate index design.

3. Check duplicates/overlap.

4. Estimate index size.

5. Verify free disk.

6. Verify CPU headroom.

7. Verify storage latency.

8. Verify replica health.

9. Verify lag.

10. Confirm backups.

11. Define change window.

12. Define stop thresholds.

13. Start build.

14. Monitor all members.

15. Monitor application latency.

16. Monitor write latency.

17. Monitor disk growth.

18. Validate index creation.

19. Run explain.

20. Compare before/after metrics.

21. Keep rollback procedure.

22. Document results.`,

      commonMistakes: [
        'Treating createIndex as a harmless command.',
        'Building during peak load without capacity checks.',
        'Having no stop threshold.',
        'Ignoring secondaries.',
        'Not validating the target query afterward.'
      ],

      bestPractices: [
        'Use a formal production change process.',
        'Set measurable rollback thresholds.',
        'Monitor the full replica set.',
        'Compare before and after metrics.',
        'Document the index rationale and outcome.'
      ],

      interviewAnswer: `For a critical production index deployment I first validate the query and index in a representative environment, then check disk, CPU, storage latency, replica health, lag, backup state, and index size.

I define stop thresholds, run during an appropriate window, monitor all members, and validate both query improvement and write impact afterward.

The change is successful only if the overall workload remains healthy.`,

      keyTakeaways: [
        'Index creation is a production change.',
        'Capacity and replica health must be checked first.',
        'Stop thresholds should be predefined.',
        'Monitoring must continue during and after the build.',
        'Business latency is part of success criteria.'
      ]
    }
  },

  {
    category: 'advanced_indexing',
    topicId: 'advanced-indexing',
    topicNumber: 5,
    topicName: 'Advanced Indexing & Query Optimization',
    questionNumber: 20,
    question:
      'A production MongoDB application has high CPU, slow reads, expensive sorts, large indexes, and increasing write latency. How would you perform an end-to-end L3 query and index optimization exercise?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `A mature MongoDB performance investigation should not begin with:

"Create more indexes."

It begins with:

"What work is MongoDB actually doing?"

The DBA must connect:

queries

indexes

CPU

memory

disk

writes

replication

and application behavior.`,

      coreConcept: `The end-to-end flow is:

Observe
   |
   v
Identify expensive workload
   |
   v
Analyse query plans
   |
   v
Analyse index design
   |
   v
Measure system impact
   |
   v
Design minimal changes
   |
   v
Test
   |
   v
Deploy gradually
   |
   v
Measure again`,

      detailedExplanation: `STEP 1 — ESTABLISH THE INCIDENT WINDOW

Determine:

• when latency increased
• whether CPU increased first
• whether a deployment occurred
• whether an index changed
• whether traffic increased
• whether data distribution changed

STEP 2 — IDENTIFY HIGH-IMPACT QUERY SHAPES

Do not focus only on the single longest query.

Prioritize:

• high frequency
• high latency
• high keys examined
• high documents examined
• expensive sorts
• broad writes

STEP 3 — ANALYSE EXECUTION PLANS

For each important query inspect:

• COLLSCAN
• IXSCAN
• indexBounds
• FETCH
• SORT
• nReturned
• totalKeysExamined
• totalDocsExamined

STEP 4 — CLASSIFY PREDICATES

Identify:

Equality

Sort

Range

$in

$ne

$nin

regex

array predicates

STEP 5 — REVIEW COMPOUND INDEX ORDER

Check:

• equality prefix
• ESR
• range placement
• sort alignment
• index prefixes
• suffix-only use
• coverage opportunities

STEP 6 — REVIEW SPECIAL INDEX CHARACTERISTICS

Check:

• partial indexes
• sparse indexes
• TTL indexes
• multikey indexes
• unique indexes
• hidden indexes

STEP 7 — REVIEW INDEX PORTFOLIO

Look for:

• duplicates
• overlapping prefixes
• legacy indexes
• unnecessary single-field indexes
• unused candidates
• extremely wide covering indexes

STEP 8 — REVIEW WRITE IMPACT

Determine:

• insert rate
• update rate
• delete rate
• frequently updated indexed fields
• multikey expansion
• total index count

STEP 9 — REVIEW CPU

High CPU can come from:

• massive key scans
• document filtering
• sorting
• high query frequency
• broad updates
• too many concurrent operations

STEP 10 — REVIEW MEMORY

Large indexes increase the working set.

If hot index pages compete heavily with document pages, cache efficiency may decline.

STEP 11 — REVIEW DISK

Check:

• read latency
• write latency
• queueing
• capacity
• available free space

STEP 12 — REVIEW REPLICATION

High write load and storage pressure may increase secondary lag.

STEP 13 — DESIGN MINIMAL CHANGES

Examples:

• reorder one compound index
• create one missing workload-critical index
• remove one unnecessary sort
• replace deep skip pagination
• rewrite unanchored regex requirement
• redesign unbounded arrays
• remove several proven redundant indexes

STEP 14 — CHANGE ONE THING AT A TIME

Otherwise causality becomes difficult.

STEP 15 — VALIDATE

Compare:

Before vs After

for:

• p95/p99 latency
• CPU
• keys examined
• docs examined
• disk latency
• write latency
• replication lag

That is a complete L3 optimization cycle.`,

      internalWorking: `Application
    |
    v
Query Shapes
    |
    v
Query Planner
    |
    v
Indexes
    |
    +--> Keys examined
    +--> FETCH
    +--> SORT
    |
    v
CPU / Memory / Disk
    |
    v
Write / Replication impact
    |
    v
Application latency


Optimization:

Measure
  |
  v
Fix root cause
  |
  v
Measure again`,

      architecture: `                   PRODUCTION
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
     Queries         Indexes        Writes
        |              |              |
        +--------------+--------------+
                       |
                       v
                  Resources
                       |
          +------------+------------+
          |            |            |
          v            v            v
         CPU         Memory        Disk
          |            |            |
          +------------+------------+
                       |
                       v
                  Replication
                       |
                       v
               Application latency`,

      examples: [
        `Query analysis:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("executionStats")`,

        `Index inventory:

db.orders.getIndexes()`,

        `Index usage:

db.orders.aggregate([
  {
    $indexStats: {}
  }
])`,

        `Collection/index footprint:

db.orders.stats()`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Provides the current index inventory.'
        },
        {
          command:
            'db.orders.aggregate([{ $indexStats: {} }])',
          explanation:
            'Provides supporting index usage evidence.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Shows the actual work performed for an important query shape.'
        },
        {
          command:
            'db.orders.stats()',
          explanation:
            'Shows collection and index footprint.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Shows server-level operation latency information.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Provides WiredTiger cache metrics that can help identify memory pressure.'
        }
      ],

      productionScenario: `A production cluster shows:

CPU:
92%

Read latency:
2–4 seconds

Write latency:
3x normal

Replication lag:
increasing

Main collection:
600 million documents

Secondary indexes:
21

Analysis finds:

• one API doing unanchored regex searches
• one query using IXSCAN but examining 4 million keys
• deep skip pagination
• three overlapping compound indexes
• two huge covering indexes
• one unbounded multikey array
• a reporting query performing an expensive blocking sort
• several status indexes updated by every write

The DBA does not add ten more indexes.

Instead they create a controlled optimization plan:

1. Correct the worst compound index order.

2. Replace deep skip pagination with seek pagination.

3. Change search architecture for arbitrary substring search.

4. Remove one blocking sort through a better index.

5. Hide and validate redundant indexes.

6. Remove proven obsolete indexes.

7. Redesign the unbounded array relationship.

8. Measure CPU, cache, disk, write latency, and lag after each change.

The final system has fewer indexes than before and performs better.

That is successful query optimization.`,

      troubleshootingApproach: `End-to-end L3 process:

1. Establish timeline.

2. Capture application metrics.

3. Identify highest-impact query shapes.

4. Rank by frequency and cost.

5. Run explain.

6. Record nReturned.

7. Record keys examined.

8. Record documents examined.

9. Inspect indexBounds.

10. Inspect FETCH.

11. Inspect SORT.

12. Classify equality/sort/range.

13. Review $in/$ne/$nin.

14. Review regex.

15. Review arrays and multikey behavior.

16. Review compound prefixes.

17. Review ESR.

18. Check coverage.

19. Check existing index overlap.

20. Check hidden/partial/sparse/TTL indexes.

21. Review index sizes.

22. Review write-heavy indexed fields.

23. Review query frequency.

24. Check CPU.

25. Check WiredTiger cache.

26. Check disk latency.

27. Check replication lag.

28. Design minimal corrective changes.

29. Test one change at a time.

30. Deploy gradually.

31. Compare before/after metrics.

32. Document final index rationale.`,

      commonMistakes: [
        'Creating indexes without ranking workload impact.',
        'Optimizing only reads.',
        'Ignoring query frequency.',
        'Ignoring resource-level symptoms.',
        'Making many simultaneous changes and losing causality.'
      ],

      bestPractices: [
        'Optimize total workload, not isolated queries.',
        'Use execution statistics as primary evidence.',
        'Keep index count controlled.',
        'Treat query design and index design together.',
        'Measure every production change.'
      ],

      interviewAnswer: `For end-to-end query optimization I first identify high-impact query shapes using latency and frequency, then analyse execution plans using keys examined, documents examined, index bounds, FETCH, SORT, and nReturned.

I review compound index order, ESR, pagination, regex, multikey behavior, coverage, redundant indexes, and write overhead.

I then correlate query work with CPU, cache, disk, and replication lag and make controlled changes one at a time.

The goal is the smallest efficient index set and the lowest total workload cost, not simply more IXSCAN plans.`,

      keyTakeaways: [
        'Performance tuning must connect queries and infrastructure.',
        'High CPU often comes from unnecessary query work.',
        'Too many indexes can be as harmful as too few.',
        'Query design can matter as much as index design.',
        'Measure before and after every optimization.'
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
       REMOVE ONLY PREVIOUS TOPIC 5 RECORDS
    ===================================================== */

    const deleteResult = await collection.deleteMany({
      category: 'advanced_indexing'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous advanced_indexing documents`
    );


    /* =====================================================
       INSERT ALL 20 TOPIC 5 QUESTIONS
    ===================================================== */

    const insertResult = await collection.insertMany(
      questions,
      {
        ordered: true
      }
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Advanced Indexing & Query Optimization questions`
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
       VALIDATE TOPIC 5 COUNT
    ===================================================== */

    const count = await collection.countDocuments({
      category: 'advanced_indexing'
    });

    console.log(
      `Topic 5 count: ${count}`
    );

    if (count !== 20) {
      throw new Error(
        `Validation failed: expected 20 Topic 5 questions, found ${count}`
      );
    }


    /* =====================================================
       CURRICULUM TOTAL

       Topic 1 = 20
       Topic 2 = 20
       Topic 3 = 20
       Topic 4 = 20
       Topic 5 = 20

       Expected = 100 if all previous topics exist.
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
      'Topic 5 seed completed successfully.'
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
    'Topic 5 seed failed:'
  );

  console.error(error);

  process.exit(1);
});
