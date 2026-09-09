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
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 1,
    question:
      'What is an index in MongoDB, why is it required, and how does it improve query performance?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `Imagine a book containing 1,000 pages.

If you want to find the page discussing MongoDB replication and there is no index at the back of the book, you may need to check page after page.

A database collection works similarly.

Without an appropriate index, MongoDB may need to examine many documents to find the required records.

An index provides an organized structure that helps MongoDB locate matching documents more efficiently.`,

      coreConcept: `An index is a separate data structure maintained by MongoDB that stores selected field values together with references to the corresponding documents.

For example, suppose the collection contains:

{
  employeeId: 1001,
  name: "Vivek",
  department: "Database"
}

If we create:

db.employees.createIndex({
  employeeId: 1
})

MongoDB builds an ordered index on employeeId.

A query:

db.employees.find({
  employeeId: 1001
})

can potentially use the index instead of scanning every document in the collection.`,

      detailedExplanation: `Without a useful index, MongoDB may perform a:

COLLSCAN

which means collection scan.

Conceptually:

Document 1
Document 2
Document 3
Document 4
...
Document 10,000,000

MongoDB examines documents until it determines which ones satisfy the filter.

With an index, MongoDB may perform an:

IXSCAN

which means index scan.

Instead of searching the entire collection, MongoDB navigates the index to locate relevant index keys and then fetches required documents.

Indexes are especially important for:

• Equality queries
• Range queries
• Sorting
• Uniqueness enforcement
• Certain covered queries
• Compound query patterns

However, indexes are not free.

Every index consumes:

• Disk space
• Memory/cache
• Write processing
• Maintenance during inserts
• Maintenance during updates
• Maintenance during deletes

Therefore the objective is not:

Create indexes on every field.

The objective is:

Create the smallest useful set of indexes that supports important application query patterns.`,

      internalWorking: `Without index:

Query
  |
  v
Collection
  |
  +--> Document 1
  +--> Document 2
  +--> Document 3
  +--> ...
  +--> Document N
  |
  v
Matching documents


With index:

Query
  |
  v
Index
  |
  v
Relevant key range
  |
  v
Record references
  |
  v
Matching documents`,

      architecture: `Collection:

+-------------------------+
| Document A              |
| employeeId: 1001        |
+-------------------------+

+-------------------------+
| Document B              |
| employeeId: 1002        |
+-------------------------+

+-------------------------+
| Document C              |
| employeeId: 1003        |
+-------------------------+


Index:

employeeId

1001 ---> Document A
1002 ---> Document B
1003 ---> Document C`,

      examples: [
        `Create an ascending index:

db.employees.createIndex({
  employeeId: 1
})`,

        `Query using the indexed field:

db.employees.find({
  employeeId: 1001
})`,

        `Inspect execution:

db.employees.find({
  employeeId: 1001
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.employees.createIndex({ employeeId: 1 })',
          explanation:
            'Creates an ascending single-field index on employeeId.'
        },
        {
          command:
            'db.employees.getIndexes()',
          explanation:
            'Lists indexes defined on the collection.'
        },
        {
          command:
            'db.employees.find({ employeeId: 1001 }).explain("executionStats")',
          explanation:
            'Shows whether MongoDB used the index and how much work was performed.'
        }
      ],

      productionScenario: `A collection contains 100 million customer documents.

The application frequently executes:

db.customers.find({
  customerId: 987654
})

There is no index on customerId.

MongoDB repeatedly scans a huge collection for a query that returns one document.

As request volume grows:

• CPU increases
• disk reads can increase
• cache is polluted by unnecessary scans
• application latency increases

After analysing the workload, the DBA creates an appropriate index on customerId.

The query can now locate the required key through the index rather than examining millions of unrelated documents.

This is one of the most common examples of indexing improving MongoDB performance.`,

      troubleshootingApproach: `For a suspected missing-index problem:

1. Capture the exact query.

2. Run explain("executionStats").

3. Check the winning plan.

4. Look for COLLSCAN versus IXSCAN.

5. Check nReturned.

6. Check totalDocsExamined.

7. Check totalKeysExamined.

8. Review existing indexes.

9. Determine query frequency.

10. Check whether the proposed index also supports other important operations.

11. Estimate index size and write impact.

12. Test before introducing the index in production.`,

      commonMistakes: [
        'Creating indexes on every field.',
        'Assuming every slow query needs a new index.',
        'Ignoring write overhead.',
        'Checking only whether IXSCAN exists without checking execution efficiency.',
        'Keeping unused indexes indefinitely.'
      ],

      bestPractices: [
        'Design indexes around real query patterns.',
        'Use explain to verify index effectiveness.',
        'Keep the useful index set as small as practical.',
        'Consider read benefit versus write cost.',
        'Review indexes periodically.'
      ],

      interviewAnswer: `A MongoDB index is a separate ordered data structure that stores indexed field values and references to documents.

It helps MongoDB locate relevant records without scanning the complete collection.

Indexes can dramatically improve reads and sorts, but they consume disk and memory and increase write overhead, so I create indexes based on real query patterns and validate them using explain execution statistics.`,

      keyTakeaways: [
        'Indexes improve data access efficiency.',
        'COLLSCAN examines collection documents.',
        'IXSCAN examines index keys.',
        'Indexes consume resources and add write cost.',
        'Good indexing is workload-driven.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 2,
    question:
      'What is a B-tree style index structure, and how does MongoDB organize index keys internally?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `An index is useful because its values are organized.

MongoDB's WiredTiger storage engine uses B-tree style structures for indexes.

The important beginner concept is that index keys are maintained in sorted order.

Because the values are ordered, MongoDB does not need to inspect every index entry sequentially for many query patterns.`,

      coreConcept: `Suppose an index exists on:

age

and stored values include:

18
20
25
30
35
40
45

MongoDB maintains index entries in logical key order.

A query:

{
  age: 35
}

can navigate toward the relevant part of the index.

A range query:

{
  age: {
    $gte: 30,
    $lte: 40
  }
}

can locate the start of the relevant range and then scan the required keys.`,

      detailedExplanation: `A B-tree style structure is organized into pages/nodes that allow efficient navigation through sorted keys.

Conceptually:

                [30]
              /      \\
             /        \\
      values <30      values >=30

Real MongoDB/WiredTiger structures are more sophisticated, but this model explains the important property:

Index keys are ordered.

This ordering makes indexes useful not only for equality lookups but also for:

• Range queries
• Sorting
• Prefix scans
• Minimum/maximum-style access patterns

Each index entry conceptually contains:

Indexed key value
+
Record reference

For example:

Index:

name: 1

might logically contain:

"Amit"  ---> Record A
"Arun"  ---> Record B
"Vivek" ---> Record C

If multiple documents contain the same indexed value, multiple index entries can exist for that value unless the index is unique.

MongoDB indexes are separate from the collection's document data.

This means when a document changes, affected indexes must also be maintained.`,

      internalWorking: `Simplified B-tree idea:

              [50]
            /      \\
           /        \\
       [20,30]     [70,90]
       /    \\      /    \\

Keys remain ordered.

Query:

value = 70

MongoDB navigates toward the relevant branch
rather than checking every key from the beginning.`,

      architecture: `INDEX

Root page
    |
    +--> Internal pages
            |
            +--> Leaf pages
                    |
                    +--> Sorted keys
                    +--> Record references


COLLECTION

Record references
      |
      v
Actual documents`,

      examples: [
        `Equality query:

db.users.find({
  age: 30
})`,

        `Range query:

db.users.find({
  age: {
    $gte: 30,
    $lte: 40
  }
})`,

        `Sorted result:

db.users.find({}).sort({
  age: 1
})`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ age: 1 })',
          explanation:
            'Creates an ordered index on age.'
        },
        {
          command:
            'db.users.find({ age: { $gte: 30, $lte: 40 } }).explain("executionStats")',
          explanation:
            'Shows how MongoDB uses an index range when an appropriate index exists.'
        }
      ],

      productionScenario: `A transaction collection contains hundreds of millions of records.

The application frequently asks:

Find transactions between two timestamps.

An index exists:

{
  createdAt: 1
}

Because index values are ordered by createdAt, MongoDB can identify the start of the requested time range and scan the relevant portion rather than examining the entire collection.

This is one reason B-tree-style indexes work well for range conditions.`,

      troubleshootingApproach: `When reasoning about index structure:

1. Identify indexed key order.

2. Identify query equality conditions.

3. Identify range conditions.

4. Identify requested sort order.

5. Determine whether the index can navigate directly to a useful starting point.

6. Inspect explain indexBounds.

7. Check totalKeysExamined.

8. Compare keys examined with documents returned.

9. Determine whether the query is scanning an unnecessarily large index range.

10. Review data distribution.`,

      commonMistakes: [
        'Thinking an index is just a copy of the collection.',
        'Assuming index keys are stored randomly.',
        'Ignoring key ordering for range queries.',
        'Assuming an index scan examining millions of keys is automatically efficient.',
        'Ignoring duplicate indexed values.'
      ],

      bestPractices: [
        'Understand ordered-key behaviour.',
        'Use indexBounds during explain analysis.',
        'Design range indexes carefully.',
        'Consider data distribution.',
        'Measure keys examined rather than looking only for IXSCAN.'
      ],

      interviewAnswer: `MongoDB indexes are implemented using ordered B-tree style structures in WiredTiger.

The ordered keys let MongoDB efficiently navigate to equality values or the start of a range and then scan relevant keys.

Index entries contain indexed values plus references to underlying records, which is why indexes must also be maintained whenever indexed document values change.`,

      keyTakeaways: [
        'MongoDB indexes maintain ordered keys.',
        'B-tree-style ordering supports equality and range access.',
        'Indexes reference underlying records.',
        'Index order is important for query and sort behaviour.',
        'IXSCAN can still be expensive if a large key range is scanned.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 3,
    question:
      'What is the default _id index in MongoDB, and what properties does it provide?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `Every normal MongoDB collection requires documents to have an _id field.

MongoDB automatically creates an index on _id for a standard collection.

This index is fundamental because _id uniquely identifies a document.`,

      coreConcept: `When a collection is created, MongoDB provides an index conceptually like:

{
  _id: 1
}

It is unique.

Therefore two documents in the same collection cannot have the same _id value.

Example:

{
  _id: 1001,
  name: "Vivek"
}

Another document cannot be inserted with:

{
  _id: 1001
}

because the unique _id index would reject it.`,

      detailedExplanation: `The _id field is the primary document identifier in MongoDB.

If the application does not supply an _id value, MongoDB drivers commonly generate an ObjectId.

Example:

{
  _id: ObjectId("..."),
  name: "Vivek"
}

The _id index supports efficient document lookup.

For example:

db.users.find({
  _id: ObjectId("...")
})

Because the index is unique, at most one document can have that exact _id.

The _id field is immutable.

After the document is created, its _id cannot simply be changed to another value.

The _id index also means that every insert has at least one index-maintenance operation even if the collection has no secondary indexes.

Secondary indexes are any additional indexes created beyond the default _id index.`,

      internalWorking: `Insert document:

{
  _id: 1001,
  name: "Vivek"
}

       |
       v

Check _id uniqueness

       |
       +--> Existing 1001?
       |       |
       |       +--> YES --> Duplicate key error
       |
       +--> NO
               |
               v
          Insert document
               |
               v
          Add _id index entry`,

      architecture: `Collection:

Document A
_id: 1001

Document B
_id: 1002


_id Index:

1001 ---> Document A
1002 ---> Document B


Property:

UNIQUE`,

      examples: [
        `Lookup by numeric _id:

db.users.findOne({
  _id: 1001
})`,

        `Lookup by ObjectId:

db.users.findOne({
  _id: ObjectId("64f000000000000000000001")
})`,

        `View indexes:

db.users.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.users.getIndexes()',
          explanation:
            'Shows the default _id index and any secondary indexes.'
        },
        {
          command:
            'db.users.find({ _id: ObjectId("64f000000000000000000001") }).explain("executionStats")',
          explanation:
            'Shows execution behaviour for a lookup using the _id index.'
        }
      ],

      productionScenario: `An application frequently retrieves users using:

email

but the developers assume MongoDB's automatic index will handle it.

The only automatic standard index is:

_id

An _id index does not automatically optimize:

{
  email: "user@example.com"
}

The DBA must evaluate whether a separate index on email is required.

This is a common misunderstanding among developers who assume every field automatically receives an index.`,

      troubleshootingApproach: `When analysing _id behaviour:

1. Check the _id value type.

2. Verify the application sends the correct BSON type.

3. Check whether the requested lookup is actually on _id.

4. Use getIndexes.

5. Check duplicate-key errors.

6. Confirm whether the application manually assigns _id.

7. Ensure generated identifiers provide required uniqueness.

8. Do not assume the _id index supports other fields.

9. Use explain if lookup performance appears abnormal.`,

      commonMistakes: [
        'Assuming every field is automatically indexed.',
        'Querying an ObjectId field using a string.',
        'Trying to modify _id.',
        'Assuming _id must always be an ObjectId.',
        'Ignoring duplicate-key errors on manually assigned _id values.'
      ],

      bestPractices: [
        'Use stable unique _id values.',
        'Use the correct BSON type when querying _id.',
        'Understand that secondary query fields need their own index strategy.',
        'Avoid unnecessary custom _id designs.',
        'Investigate duplicate-key errors instead of blindly retrying inserts.'
      ],

      interviewAnswer: `MongoDB automatically creates a unique ascending index on the _id field for normal collections.

The _id uniquely identifies each document and is immutable.

If the application does not provide one, drivers commonly generate ObjectId values.

The _id index provides efficient lookups by _id, but it does not automatically index other fields such as email or customerId.`,

      keyTakeaways: [
        '_id uniquely identifies a document.',
        'MongoDB automatically indexes _id.',
        'The _id index is unique.',
        '_id is immutable.',
        'Other fields require separate index design.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 4,
    question:
      'What is a single-field index, and what is the difference between ascending and descending index order?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `A single-field index contains one indexed field.

Example:

db.users.createIndex({
  age: 1
})

This creates an index only on:

age

The value:

1

means ascending order.

The value:

-1

means descending order.`,

      coreConcept: `Examples:

Ascending:

{
  age: 1
}

Descending:

{
  age: -1
}

For a single-field index, MongoDB can generally traverse the index in either direction.

Therefore:

{
  age: 1
}

can support sorting by:

age ascending

and often also:

age descending

by scanning the same single-field index backwards.`,

      detailedExplanation: `Suppose we create:

db.employees.createIndex({
  experience: 1
})

Logical key order:

1
2
3
4
5
6
7

A query:

db.employees.find({
  experience: {
    $gte: 3
  }
})

can scan the relevant range.

A sort:

db.employees.find({}).sort({
  experience: 1
})

can traverse the index forward.

A descending sort:

db.employees.find({}).sort({
  experience: -1
})

can usually traverse the same single-field index backward.

This is why ascending versus descending direction is less significant for a single-field index than it becomes for compound indexes containing mixed sort directions.

Single-field indexes are useful when queries frequently filter or sort using one field.

But creating single-field indexes blindly on every frequently mentioned field is not good index design.

Queries involving multiple fields often benefit more from appropriately designed compound indexes.`,

      internalWorking: `Ascending index:

1
2
3
4
5
6

Forward scan:

1 --> 2 --> 3 --> 4 --> 5 --> 6

Backward scan:

6 --> 5 --> 4 --> 3 --> 2 --> 1


Same single-field index
can support traversal in either direction.`,

      architecture: `Single-field index:

Field: experience

Index key
   |
   +--> 1
   +--> 2
   +--> 3
   +--> 4
   +--> 5

Each key
   |
   v
Document reference`,

      examples: [
        `Ascending:

db.users.createIndex({
  age: 1
})`,

        `Descending:

db.orders.createIndex({
  createdAt: -1
})`,

        `Range query:

db.users.find({
  age: {
    $gte: 18
  }
})`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ age: 1 })',
          explanation:
            'Creates an ascending single-field index on age.'
        },
        {
          command:
            'db.orders.createIndex({ createdAt: -1 })',
          explanation:
            'Creates a descending single-field index on createdAt.'
        },
        {
          command:
            'db.users.find({ age: { $gte: 18 } }).sort({ age: -1 }).explain("executionStats")',
          explanation:
            'Can demonstrate reverse traversal of a suitable single-field index.'
        }
      ],

      productionScenario: `A developer asks for two indexes:

{
  createdAt: 1
}

and:

{
  createdAt: -1
}

because the application sometimes sorts newest-first and sometimes oldest-first.

For a single-field index, maintaining both is usually unnecessary because MongoDB can traverse the same index in reverse.

Keeping redundant indexes would increase:

• disk usage
• memory pressure
• insert cost
• update cost
• delete cost

The DBA should verify the actual query plans before maintaining duplicate index structures.`,

      troubleshootingApproach: `For single-field index decisions:

1. Identify filter patterns.

2. Identify sort patterns.

3. Check existing indexes.

4. Determine whether an existing index can be scanned in reverse.

5. Run explain.

6. Check sort stages.

7. Check keys examined.

8. Check whether a compound index is actually more appropriate.

9. Identify redundant indexes.

10. Consider write overhead before adding another index.`,

      commonMistakes: [
        'Creating both ascending and descending single-field indexes unnecessarily.',
        'Assuming single-field indexes solve multi-field query patterns optimally.',
        'Ignoring index redundancy.',
        'Ignoring write cost.',
        'Choosing direction without considering actual query patterns.'
      ],

      bestPractices: [
        'Use single-field indexes for genuine single-field access patterns.',
        'Remember indexes can be scanned backward.',
        'Avoid redundant indexes.',
        'Use explain before adding another index.',
        'Consider compound indexes when queries involve multiple fields.'
      ],

      interviewAnswer: `A single-field index indexes one field, for example { age: 1 }.

The 1 means ascending and -1 means descending.

For a single-field index, MongoDB can normally scan the index in either direction, so creating both ascending and descending versions is usually unnecessary.

Direction becomes more important with compound indexes and mixed sort patterns.`,

      keyTakeaways: [
        'Single-field indexes contain one indexed field.',
        '1 means ascending.',
        '-1 means descending.',
        'Single-field indexes can normally be scanned in reverse.',
        'Avoid redundant duplicate-direction indexes.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 5,
    question:
      'What is index selectivity, and why does cardinality affect whether an index is useful?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `Not every indexed field is equally useful.

Suppose a collection has 100 million documents.

Field A:

customerId

contains almost 100 million different values.

Field B:

active

contains only:

true
false

A query using customerId may identify one document.

A query using active may match tens of millions.

This difference is called selectivity.`,

      coreConcept: `A selective predicate matches a relatively small portion of the collection.

Example:

{
  customerId: 123456
}

may return one document.

A low-selectivity predicate matches a large portion.

Example:

{
  active: true
}

may return 95% of all documents.

Indexes tend to provide the greatest benefit when they significantly reduce the amount of data MongoDB must examine.`,

      detailedExplanation: `CARDINALITY

Cardinality refers to the number of distinct values in a field.

High-cardinality field:

customerId

Example:

1000001
1000002
1000003
...

Low-cardinality field:

status

Example:

ACTIVE
INACTIVE

High cardinality does not automatically guarantee good selectivity for every query, but unique or near-unique values often provide highly selective equality lookups.

Suppose:

Collection size = 100 million

Query A:

{
  customerId: 1001
}

Returns:

1 document

Query B:

{
  active: true
}

Returns:

95 million documents

Even if both fields are indexed, Query B still needs to process an enormous result set.

The presence of an index does not eliminate the cost of returning 95 million records.

Selectivity also affects the query planner.

When a predicate matches a very large portion of a collection, MongoDB may determine that another access plan is more appropriate than an index that provides little filtering benefit.

The correct way to judge usefulness is not:

Does an index exist?

It is:

How much work does the winning plan perform?`,

      internalWorking: `High selectivity:

100,000,000 documents
        |
        v
Index filter
        |
        v
1 matching key
        |
        v
1 document


Low selectivity:

100,000,000 documents
        |
        v
Index filter
        |
        v
95,000,000 matching keys
        |
        v
Huge amount of work`,

      architecture: `Field cardinality:

customerId
 |
 +--> 1001
 +--> 1002
 +--> 1003
 +--> 1004
 +--> ...
High cardinality


active
 |
 +--> true
 +--> false
Low cardinality


Query usefulness depends on:

Predicate
   |
   v
How much of collection matches?`,

      examples: [
        `Highly selective equality:

db.customers.find({
  customerId: 987654
})`,

        `Potentially low-selectivity query:

db.customers.find({
  active: true
})`,

        `Measure actual work:

db.customers.find({
  active: true
}).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.customers.find({ customerId: 987654 }).explain("executionStats")',
          explanation:
            'Shows execution statistics for a potentially highly selective lookup.'
        },
        {
          command:
            'db.customers.find({ active: true }).explain("executionStats")',
          explanation:
            'Shows how much work a low-selectivity predicate actually requires.'
        },
        {
          command:
            'db.customers.distinct("status")',
          explanation:
            'Can help inspect distinct values, though it should not be used casually on very large production datasets merely to estimate cardinality.'
        }
      ],

      productionScenario: `A DBA sees a slow query:

db.transactions.find({
  status: "SUCCESS"
})

There is an index on:

{
  status: 1
}

The DBA assumes something is wrong because MongoDB still performs substantial work.

Investigation shows:

98% of transactions have status SUCCESS.

The query returns millions of documents.

The index cannot magically make processing millions of matches cheap.

The team may need to:

• narrow the query
• add another selective predicate
• redesign the API
• use pagination
• design an appropriate compound index
• reconsider whether this result set should be queried interactively at all

The lesson is that index usefulness depends heavily on selectivity.`,

      troubleshootingApproach: `For suspected selectivity issues:

1. Identify collection size.

2. Identify nReturned.

3. Run explain("executionStats").

4. Check totalKeysExamined.

5. Check totalDocsExamined.

6. Compare examined counts with nReturned.

7. Determine how common the queried value is.

8. Check whether additional selective predicates exist.

9. Evaluate compound-index opportunities.

10. Check whether the application is requesting too much data.

11. Review pagination.

12. Do not create redundant indexes for fundamentally non-selective workloads.`,

      commonMistakes: [
        'Assuming every indexed equality predicate is selective.',
        'Confusing cardinality with guaranteed query performance.',
        'Ignoring huge nReturned values.',
        'Adding more indexes without changing a broad query.',
        'Treating a low-selectivity field as a strong standalone access pattern.'
      ],

      bestPractices: [
        'Prefer indexes that significantly narrow important queries.',
        'Measure selectivity using actual workload statistics.',
        'Combine predicates intelligently when appropriate.',
        'Avoid returning massive interactive result sets.',
        'Judge indexes by execution work, not simply their existence.'
      ],

      interviewAnswer: `Selectivity describes how strongly a query predicate narrows the data set.

A high-selectivity condition such as a unique customerId may match one document, while a low-selectivity field such as active:true may match most of the collection.

Cardinality describes how many distinct values a field contains.

Indexes are generally most valuable when they reduce the number of keys and documents MongoDB must examine, so I evaluate selectivity using execution statistics rather than assuming an index is useful simply because it exists.`,

      keyTakeaways: [
        'Selective predicates match a small portion of data.',
        'Low-cardinality fields often have low selectivity.',
        'An index cannot make a huge result set free.',
        'nReturned is important when analysing performance.',
        'Index effectiveness must be measured with execution statistics.'
      ]
    }
  },
  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 6,
    question:
      'What is a unique index in MongoDB, and how does it enforce data integrity?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `A unique index prevents multiple documents from having the same indexed key value.

For example, if every user must have a unique email address, MongoDB can enforce that rule using a unique index.

Without the unique index, the application might accidentally insert duplicate email addresses.`,

      coreConcept: `Example:

db.users.createIndex(
  {
    email: 1
  },
  {
    unique: true
  }
)

Now MongoDB prevents two documents from storing the same indexed email value.

For example:

{
  email: "vivek@example.com"
}

can exist only once according to the unique index semantics.`,

      detailedExplanation: `A unique index is both:

an access structure

and:

a data-integrity constraint.

Suppose the collection contains:

{
  _id: 1,
  email: "a@example.com"
}

Now another insert attempts:

{
  _id: 2,
  email: "a@example.com"
}

MongoDB detects that the unique index key already exists and rejects the write with a duplicate-key error.

A common error looks conceptually like:

E11000 duplicate key error

Unique indexes can be:

• Single-field
• Compound

Example compound unique index:

db.users.createIndex(
  {
    tenantId: 1,
    username: 1
  },
  {
    unique: true
  }
)

This does not mean username is globally unique.

It means the combination:

tenantId + username

must be unique.

So these may both be allowed:

{
  tenantId: 1,
  username: "vivek"
}

{
  tenantId: 2,
  username: "vivek"
}

because the compound key differs.

A DBA should also understand that building a unique index on existing dirty data can fail if duplicate keys already exist.

Therefore data quality must be checked before introducing a new uniqueness constraint.`,

      internalWorking: `Insert:

{
  email: "a@example.com"
}

       |
       v

Unique index lookup

       |
       +--> key exists?
       |       |
       |       +--> YES
       |              |
       |              v
       |        Reject write
       |
       +--> NO
              |
              v
        Insert document
              |
              v
       Add index entry`,

      architecture: `Unique Index

"a@example.com" ---> Document 1
"b@example.com" ---> Document 2
"c@example.com" ---> Document 3

Attempt:

"a@example.com" ---> Document 4

Result:

Duplicate key rejection`,

      examples: [
        `Unique email:

db.users.createIndex(
  { email: 1 },
  { unique: true }
)`,

        `Compound uniqueness:

db.users.createIndex(
  {
    tenantId: 1,
    username: 1
  },
  {
    unique: true
  }
)`,

        `Inspect indexes:

db.users.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ email: 1 }, { unique: true })',
          explanation:
            'Creates a unique index so duplicate email index keys are rejected.'
        },
        {
          command:
            'db.users.createIndex({ tenantId: 1, username: 1 }, { unique: true })',
          explanation:
            'Enforces uniqueness for the combination of tenantId and username.'
        },
        {
          command:
            'db.users.getIndexes()',
          explanation:
            'Shows index definitions including the unique option.'
        }
      ],

      productionScenario: `An application relies only on application code to prevent duplicate account numbers.

Two requests arrive at nearly the same time.

Both perform:

Check whether account exists.

Both see no account.

Both insert the same account number.

Without a database uniqueness constraint, both writes may succeed.

A unique index on the business key provides database-level protection.

Example:

db.accounts.createIndex(
  {
    accountNumber: 1
  },
  {
    unique: true
  }
)

Now concurrent inserts cannot create duplicate indexed account numbers.`,

      troubleshootingApproach: `For unique-index problems:

1. Capture the duplicate-key error.

2. Identify the index named in the error.

3. Identify the conflicting key.

4. Check whether the duplicate is legitimate or bad data.

5. Review application concurrency.

6. Check whether the uniqueness requirement is single-field or compound.

7. Before creating a new unique index, identify existing duplicates.

8. Clean duplicate data safely.

9. Retry index creation.

10. Ensure application code correctly handles duplicate-key errors.

11. Do not blindly retry a duplicate insert indefinitely.`,

      commonMistakes: [
        'Relying only on application-side uniqueness checks.',
        'Creating the wrong compound unique key.',
        'Trying to build a unique index before cleaning duplicate data.',
        'Ignoring duplicate-key errors.',
        'Assuming unique means each individual field in a compound index is unique.'
      ],

      bestPractices: [
        'Enforce important business uniqueness in the database where appropriate.',
        'Use compound unique indexes for scoped uniqueness.',
        'Clean existing duplicates before adding constraints.',
        'Handle E11000 errors correctly.',
        'Review index definitions during schema design.'
      ],

      interviewAnswer: `A unique index prevents duplicate indexed key values and provides a database-level integrity constraint.

It can be single-field or compound.

For a compound unique index, the complete indexed key combination must be unique.

Before creating one on an existing collection, I first check for duplicate data because the index build will fail if conflicting keys already exist.`,

      keyTakeaways: [
        'Unique indexes enforce indexed-key uniqueness.',
        'They protect against concurrent duplicate inserts.',
        'Compound uniqueness applies to the complete key combination.',
        'Existing duplicates can prevent index creation.',
        'Applications should handle duplicate-key errors correctly.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 7,
    question:
      'What is a sparse index, how does it treat missing fields, and when can it change query results?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `A normal index usually contains index entries for documents according to MongoDB's indexing rules even when field presence varies.

A sparse index is different.

A sparse index only includes documents that contain the indexed field.

Documents where the field is missing are omitted from that index.`,

      coreConcept: `Example:

db.users.createIndex(
  {
    phone: 1
  },
  {
    sparse: true
  }
)

Suppose:

Document A:

{
  name: "A",
  phone: "9999"
}

Document B:

{
  name: "B"
}

Document A receives a phone index entry.

Document B does not because phone is missing.`,

      detailedExplanation: `Sparse indexes can reduce index entries when many documents do not contain the indexed field.

However, they also affect query-planning correctness.

Suppose a collection has:

{
  _id: 1,
  phone: "1111"
}

{
  _id: 2
}

{
  _id: 3,
  phone: "3333"
}

Sparse index:

{
  phone: 1
}

contains entries for documents 1 and 3.

Document 2 is absent.

Now consider a query whose correct result needs documents where phone is missing.

A sparse index alone cannot represent all those documents.

MongoDB avoids using an index when doing so would produce incomplete results, unless the operation is explicitly forced in ways that can alter completeness.

This is why sparse indexes must be understood semantically, not simply as smaller indexes.

Sparse indexes are also relevant to uniqueness.

A unique sparse index can allow multiple documents with the indexed field missing because those missing-field documents do not participate in that sparse index.

Historically this has been used for optional unique fields.

Partial indexes often provide more precise control and are generally more flexible.`,

      internalWorking: `Documents:

A: { phone: "1111" }
B: { no phone }
C: { phone: "3333" }

Sparse index:

"1111" ---> A
"3333" ---> C

Document B:

No index entry`,

      architecture: `Collection

Document A
phone exists
   |
   v
Sparse index entry

Document B
phone missing
   |
   v
No sparse index entry

Document C
phone exists
   |
   v
Sparse index entry`,

      examples: [
        `Create sparse index:

db.users.createIndex(
  { phone: 1 },
  { sparse: true }
)`,

        `Unique sparse index:

db.users.createIndex(
  { employeeCode: 1 },
  {
    unique: true,
    sparse: true
  }
)`,

        `Inspect definition:

db.users.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ phone: 1 }, { sparse: true })',
          explanation:
            'Indexes only documents that contain the phone field.'
        },
        {
          command:
            'db.users.createIndex({ employeeCode: 1 }, { unique: true, sparse: true })',
          explanation:
            'Creates a unique sparse index for documents where employeeCode is present.'
        },
        {
          command:
            'db.users.getIndexes()',
          explanation:
            'Shows whether an index is configured as sparse.'
        }
      ],

      productionScenario: `A collection contains 100 million customer documents.

Only 5 million customers have:

loyaltyCardNumber

A sparse index on that optional field can avoid indexing documents where the field is absent.

However, later a reporting query needs:

all customers where loyaltyCardNumber is missing.

The sparse index cannot directly represent those missing-field documents.

The DBA must understand that an index designed for one query pattern may be unsuitable for another query pattern involving absence semantics.`,

      troubleshootingApproach: `For sparse-index issues:

1. Inspect the index definition.

2. Determine whether sparse:true is enabled.

3. Check how many documents lack the indexed field.

4. Understand the query's missing/null semantics.

5. Run explain.

6. Verify that the chosen plan returns complete results.

7. Review whether uniqueness behaviour is intentional.

8. Consider whether a partial index expresses the business rule more precisely.

9. Avoid forcing a sparse index without understanding result completeness.

10. Test representative missing-field cases.`,

      commonMistakes: [
        'Assuming sparse indexes contain every document.',
        'Confusing missing fields with null values.',
        'Forcing a sparse index and accidentally changing result completeness.',
        'Using sparse when a partial index would express the requirement better.',
        'Misunderstanding unique sparse semantics.'
      ],

      bestPractices: [
        'Use sparse indexes only when missing-field exclusion is intentional.',
        'Test queries involving missing fields.',
        'Prefer partial indexes when more precise filtering is required.',
        'Review uniqueness behaviour carefully.',
        'Validate with explain rather than assuming planner behaviour.'
      ],

      interviewAnswer: `A sparse index contains entries only for documents where the indexed field exists.

Documents missing the field are not represented in the index.

This can reduce index size for optional fields, but it also means the index cannot safely satisfy every query involving missing-field semantics.

A unique sparse index can also allow multiple documents where the field is absent because those documents are not indexed.`,

      keyTakeaways: [
        'Sparse indexes exclude documents missing the indexed field.',
        'They can reduce index size.',
        'Missing-field queries require careful analysis.',
        'Sparse indexes can affect uniqueness semantics.',
        'Partial indexes are often more flexible.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 8,
    question:
      'What is a partial index, how does partialFilterExpression work, and why is it often more flexible than a sparse index?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `A partial index does not index every document in a collection.

Instead, you define a condition.

Only documents satisfying that condition are included in the index.

This gives the DBA more control than simply checking whether a field exists.`,

      coreConcept: `Example:

db.orders.createIndex(
  {
    customerId: 1
  },
  {
    partialFilterExpression: {
      status: "OPEN"
    }
  }
)

Only documents where:

status = OPEN

are included in this index.`,

      detailedExplanation: `Partial indexes are useful when a query workload repeatedly targets a specific subset of data.

For example, suppose an orders collection contains:

500 million historical orders.

Only:

5 million

are currently OPEN.

The application frequently executes:

db.orders.find({
  status: "OPEN",
  customerId: 1001
})

Instead of indexing customerId for all 500 million documents, a partial index can contain only OPEN orders.

Example:

db.orders.createIndex(
  {
    customerId: 1
  },
  {
    partialFilterExpression: {
      status: "OPEN"
    }
  }
)

Benefits can include:

• Smaller index
• Reduced memory footprint
• Reduced index maintenance for excluded documents
• More targeted access structure

However, the query must logically satisfy the partial filter condition for MongoDB to safely use the index.

For example, a query looking for:

status: "CLOSED"

cannot use an index containing only OPEN records to obtain complete results.

Partial indexes can also be combined with unique indexes.

Example:

db.users.createIndex(
  {
    email: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      email: {
        $type: "string"
      }
    }
  }
)

This can enforce uniqueness only for documents satisfying the partial condition.

The exact filter must be designed carefully according to supported partial-index expressions and business requirements.`,

      internalWorking: `Collection:

Document A
status = OPEN
       |
       v
Included in partial index

Document B
status = CLOSED
       |
       v
Excluded

Document C
status = OPEN
       |
       v
Included


Partial index condition:

status = OPEN`,

      architecture: `All Documents
      |
      v
partialFilterExpression
      |
      +--> condition true
      |       |
      |       v
      |    Index entry
      |
      +--> condition false
              |
              v
          No index entry`,

      examples: [
        `Index only active users:

db.users.createIndex(
  { email: 1 },
  {
    partialFilterExpression: {
      active: true
    }
  }
)`,

        `Index only OPEN orders:

db.orders.createIndex(
  { customerId: 1, createdAt: -1 },
  {
    partialFilterExpression: {
      status: "OPEN"
    }
  }
)`,

        `Unique partial index:

db.users.createIndex(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: {
        $type: "string"
      }
    }
  }
)`
      ],

      commands: [
        {
          command:
            'db.orders.createIndex({ customerId: 1 }, { partialFilterExpression: { status: "OPEN" } })',
          explanation:
            'Creates an index containing only documents whose status is OPEN.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows the partialFilterExpression stored in the index definition.'
        },
        {
          command:
            'db.orders.find({ status: "OPEN", customerId: 1001 }).explain("executionStats")',
          explanation:
            'Helps verify whether MongoDB can use the partial index for a query that satisfies its filter.'
        }
      ],

      productionScenario: `A ticketing system contains:

300 million tickets.

Only:

2 million

have:

status = "OPEN"

Support staff frequently search:

{
  status: "OPEN",
  assignedTo: employeeId
}

A full index:

{
  assignedTo: 1
}

would contain entries for the entire historical collection.

Instead the DBA evaluates:

db.tickets.createIndex(
  {
    assignedTo: 1
  },
  {
    partialFilterExpression: {
      status: "OPEN"
    }
  }
)

The index becomes substantially smaller because closed historical tickets are excluded.

This can reduce both storage and maintenance overhead for the targeted workload.`,

      troubleshootingApproach: `For partial-index issues:

1. Inspect partialFilterExpression.

2. Compare the query predicate with the partial condition.

3. Determine whether the query logically guarantees the indexed subset.

4. Run explain.

5. Check whether the index is considered by the planner.

6. Check totalKeysExamined and totalDocsExamined.

7. Confirm that documents outside the partial condition must not be returned.

8. Review write patterns for documents moving into or out of the indexed subset.

9. Review uniqueness semantics if unique:true is combined with partial indexing.

10. Test query variations, not just one exact query.`,

      commonMistakes: [
        'Creating a partial index but running queries that do not include or imply its filter.',
        'Assuming a partial index covers all collection documents.',
        'Designing an overly broad partial condition.',
        'Ignoring documents transitioning into or out of the indexed subset.',
        'Misunderstanding partial unique constraints.'
      ],

      bestPractices: [
        'Use partial indexes for well-defined hot subsets.',
        'Align the partial condition with real query predicates.',
        'Verify planner use with explain.',
        'Use partial uniqueness only when it matches business rules.',
        'Prefer a clear, stable partial condition.'
      ],

      interviewAnswer: `A partial index contains only documents that satisfy a partialFilterExpression.

It is more flexible than a sparse index because the inclusion rule can be based on conditions such as status, type, or other supported predicates rather than only field presence.

It is useful for indexing a frequently queried subset, but MongoDB can safely use it only when the query is compatible with that partial condition.`,

      keyTakeaways: [
        'Partial indexes index a defined subset.',
        'partialFilterExpression controls inclusion.',
        'They can significantly reduce index size.',
        'Queries must be compatible with the partial condition.',
        'Partial indexes can also enforce conditional uniqueness.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 9,
    question:
      'What is a TTL index, how does automatic document expiration work, and what limitations should a DBA understand?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `TTL means:

Time To Live.

A TTL index allows MongoDB to automatically remove documents after a configured amount of time.

It is commonly used for data that naturally expires.

Examples:

• Session records
• Temporary tokens
• Short-lived logs
• Cache records
• Temporary application state`,

      coreConcept: `Example document:

{
  sessionId: "ABC123",
  createdAt: ISODate("2026-09-01T10:00:00Z")
}

TTL index:

db.sessions.createIndex(
  {
    createdAt: 1
  },
  {
    expireAfterSeconds: 3600
  }
)

The document becomes eligible for deletion approximately one hour after its createdAt value.`,

      detailedExplanation: `TTL indexes use a date field.

MongoDB has a background TTL mechanism that periodically identifies expired documents and removes them.

This is important:

TTL expiration is not guaranteed to occur at the exact second the document reaches its expiration time.

Deletion happens asynchronously.

Therefore TTL should not be treated as an exact real-time scheduler.

TTL deletion is a normal database write activity.

That means expired-document cleanup can cause:

• Deletes
• Index maintenance
• Storage work
• Oplog entries on replica sets
• Replication activity

If a huge number of documents expire at approximately the same time, TTL cleanup can produce a noticeable workload.

TTL indexes are generally single-field indexes.

For per-document expiration, an application can store an absolute expiration date and use:

expireAfterSeconds: 0

Example:

{
  expiresAt: ISODate("2026-09-05T15:00:00Z")
}

Index:

db.tokens.createIndex(
  {
    expiresAt: 1
  },
  {
    expireAfterSeconds: 0
  }
)

MongoDB treats the field value as the expiration point.

The indexed field must use appropriate BSON date semantics for standard TTL behaviour.

If an application mistakenly stores dates as strings, the expected TTL expiration will not work as intended.`,

      internalWorking: `Document:

{
  createdAt: Date
}

       |
       v

TTL Index

       |
       v

Background TTL processing

       |
       v

Expired?

   +---+---+
   |       |
  NO      YES
   |       |
 keep      v
        delete
           |
           v
       replication`,

      architecture: `Application
    |
    v
Insert temporary document
    |
    v
TTL indexed Date field
    |
    v
MongoDB TTL monitor
    |
    v
Expiration condition met
    |
    v
Delete document
    |
    v
Oplog / Replica-set replication`,

      examples: [
        `Expire one hour after createdAt:

db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)`,

        `Expire at an absolute date:

db.tokens.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)`,

        `Check indexes:

db.sessions.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })',
          explanation:
            'Creates a TTL index that makes documents eligible for deletion one hour after their createdAt value.'
        },
        {
          command:
            'db.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })',
          explanation:
            'Uses each document expiresAt value as its expiration timestamp.'
        },
        {
          command:
            'db.sessions.getIndexes()',
          explanation:
            'Displays the TTL index and expireAfterSeconds setting.'
        }
      ],

      productionScenario: `A logging collection receives millions of documents every day.

The business requires only seven days of history.

Instead of running a custom deleteMany script every night, the DBA evaluates a TTL index on a BSON Date field.

This simplifies retention.

However, traffic has a daily spike and most documents are inserted within the same two-hour window.

Seven days later, large groups of documents become eligible for expiration around the same period.

The DBA monitors whether TTL deletes create:

• disk pressure
• replication lag
• increased delete load

TTL solves retention management, but the deletion workload still consumes database resources.`,

      troubleshootingApproach: `If TTL documents are not disappearing:

1. Check that the TTL index exists.

2. Check expireAfterSeconds.

3. Inspect the indexed field.

4. Verify the field uses BSON Date values where required.

5. Check whether documents are actually old enough.

6. Remember TTL deletion is asynchronous.

7. Check MongoDB logs and server health.

8. Check whether high workload is delaying cleanup.

9. Check replication behaviour.

10. Estimate how many documents become eligible simultaneously.

11. Verify the application is not writing malformed date values.

12. Do not expect millisecond-precise deletion.`,

      commonMistakes: [
        'Expecting TTL deletion at the exact expiration second.',
        'Using strings instead of BSON Date values.',
        'Ignoring TTL delete workload.',
        'Treating TTL as an exact scheduling mechanism.',
        'Creating retention logic without testing the expiration field.'
      ],

      bestPractices: [
        'Use BSON Date fields for TTL expiration.',
        'Monitor large expiration workloads.',
        'Use TTL for naturally expiring data.',
        'Validate retention requirements carefully.',
        'Do not depend on exact deletion timing.'
      ],

      interviewAnswer: `A TTL index automatically removes expired documents based on a date field and expireAfterSeconds.

MongoDB uses a background TTL process, so expiration is asynchronous rather than exact to the second.

TTL deletions still generate normal delete, storage, index, and replication workload.

I also verify the indexed field is a proper BSON Date and monitor large expiration waves in production.`,

      keyTakeaways: [
        'TTL indexes automate data expiration.',
        'Deletion is asynchronous.',
        'TTL requires correct date semantics.',
        'TTL cleanup creates normal database workload.',
        'Large expiration waves should be monitored.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 10,
    question:
      'What is a multikey index, how does MongoDB index array fields, and what limitations should a DBA know?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `When MongoDB creates an index on a field containing an array, the index becomes a multikey index.

MongoDB creates index keys for array values so queries can efficiently search array elements.`,

      coreConcept: `Example:

{
  name: "Vivek",
  skills: [
    "MongoDB",
    "Linux",
    "AWS"
  ]
}

Create:

db.users.createIndex({
  skills: 1
})

MongoDB indexes the values from the skills array.

Conceptually:

MongoDB ---> Document
Linux   ---> Document
AWS     ---> Document

The index is marked as multikey.`,

      detailedExplanation: `Multikey indexes allow normal MongoDB indexes to support array fields.

Suppose:

Document A:

{
  _id: 1,
  tags: [
    "mongodb",
    "database",
    "production"
  ]
}

Index:

{
  tags: 1
}

MongoDB can create index entries corresponding to the array elements.

This allows:

db.articles.find({
  tags: "mongodb"
})

to use the index.

Multikey behaviour also applies to indexed paths that traverse arrays of embedded documents.

Example:

{
  results: [
    {
      subject: "MongoDB",
      score: 90
    },
    {
      subject: "Linux",
      score: 80
    }
  ]
}

An index on:

{
  "results.subject": 1
}

is multikey because results is an array.

Multikey indexes have important design constraints.

A particularly important compound-index rule is that a compound multikey index cannot index multiple array fields in the same document in an unrestricted way.

For example, if a compound index contains:

{
  tags: 1,
  categories: 1
}

and both tags and categories are arrays in the same document, index creation or writes can violate multikey restrictions.

The reason is combinatorial explosion.

If one array has 100 values and another has 100 values, blindly generating every pair could produce 10,000 index key combinations for one document.

MongoDB prevents problematic forms of parallel-array indexing.

Arrays can also create many index entries for one document.

Therefore very large indexed arrays increase:

• index size
• write cost
• cache consumption
• index maintenance overhead`,

      internalWorking: `Document:

{
  _id: 1,
  skills: [
    "MongoDB",
    "Linux",
    "AWS"
  ]
}

Index entries:

"MongoDB" ---> _id 1
"Linux"   ---> _id 1
"AWS"     ---> _id 1


One document
     |
     v
Multiple index keys

Therefore:

MULTIKEY`,

      architecture: `Array Document
     |
     v
[ A, B, C ]
 |  |  |
 v  v  v
Index keys

A ---> Document
B ---> Document
C ---> Document`,

      examples: [
        `Array index:

db.users.createIndex({
  skills: 1
})`,

        `Query array value:

db.users.find({
  skills: "MongoDB"
})`,

        `Nested array path:

db.students.createIndex({
  "results.subject": 1
})`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ skills: 1 })',
          explanation:
            'Creates an index that becomes multikey when skills contains arrays.'
        },
        {
          command:
            'db.users.find({ skills: "MongoDB" }).explain("executionStats")',
          explanation:
            'Shows how the multikey index is used for an array membership query.'
        },
        {
          command:
            'db.users.getIndexes()',
          explanation:
            'Shows the index definition. Explain output can expose multikey-related execution details.'
        }
      ],

      productionScenario: `A social-media collection stores:

{
  userId: 1001,
  followers: [
    ... hundreds of thousands of IDs ...
  ]
}

The followers array is indexed.

As the array grows:

• each document can generate a large number of index entries
• updating followers becomes increasingly expensive
• document size grows
• index size increases
• cache pressure increases

The issue is not merely whether MongoDB supports a multikey index.

The underlying data model itself may be unsuitable for an unbounded relationship.

For very large many-to-many relationships, separate documents or collections may be a better architecture.`,

      troubleshootingApproach: `For multikey-index issues:

1. Inspect the indexed field.

2. Determine whether it contains arrays.

3. Check average and maximum array size.

4. Run explain.

5. Check whether the index is multikey.

6. Review keys examined.

7. Review index size.

8. Check write latency.

9. Check whether compound index fields contain multiple arrays.

10. Look for parallel-array restriction errors.

11. Evaluate whether arrays are bounded.

12. Reconsider the data model if indexed arrays grow without limit.`,

      commonMistakes: [
        'Treating array indexes exactly like scalar indexes.',
        'Ignoring how many index keys one document can create.',
        'Attempting compound indexing across multiple array fields without understanding multikey restrictions.',
        'Indexing unbounded arrays.',
        'Ignoring document growth.'
      ],

      bestPractices: [
        'Keep indexed arrays reasonably bounded.',
        'Understand multikey restrictions before designing compound indexes.',
        'Monitor index size and write cost.',
        'Use explain to verify multikey behaviour.',
        'Redesign unbounded many-to-many data when necessary.'
      ],

      interviewAnswer: `A multikey index is created when an indexed field contains an array.

MongoDB generates index entries for array elements, allowing efficient membership and nested-array queries.

Because one document can generate multiple index keys, large arrays increase index size and write cost.

Compound indexes also have restrictions around multiple array fields, so I check array cardinality and data-model design carefully.`,

      keyTakeaways: [
        'Array indexes become multikey.',
        'One document can generate multiple index keys.',
        'Large arrays increase index and write cost.',
        'Compound multikey indexes have array-related restrictions.',
        'Unbounded indexed arrays are a production risk.'
      ]
    }
  },
  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 11,
    question:
      'What is a compound index in MongoDB, and why does field order matter?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A compound index contains more than one field.

Example:

db.orders.createIndex({
  customerId: 1,
  createdAt: -1
})

This index is ordered first by customerId and then by createdAt within each customerId value.

Field order matters because MongoDB organizes the index according to the sequence defined in the index specification.`,

      coreConcept: `Consider:

{
  customerId: 1,
  createdAt: -1
}

The logical order is:

customerId
then
createdAt

This means the index is especially useful for queries that begin with customerId and may then use createdAt for sorting or filtering.

It is not equivalent to:

{
  createdAt: -1,
  customerId: 1
}

These two indexes have different key ordering and can support different query patterns.`,

      detailedExplanation: `Suppose the collection stores:

{
  customerId: 1001,
  status: "OPEN",
  createdAt: ISODate(...)
}

and the application frequently executes:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})

A compound index:

{
  customerId: 1,
  createdAt: -1
}

can support both:

• equality filtering on customerId
• sorting by createdAt

The logical index layout is similar to:

customerId 1001
    createdAt newest
    createdAt older
    createdAt older

customerId 1002
    createdAt newest
    createdAt older

Field order matters because MongoDB can efficiently use contiguous portions of the ordered index.

Another query:

{
  createdAt: {
    $gte: someDate
  }
}

without customerId may not be able to use the compound index as effectively because createdAt is not the leading field.

Compound index design should therefore begin with actual query shapes rather than selecting fields independently.`,

      internalWorking: `Compound index:

{
  customerId: 1,
  createdAt: -1
}

Logical keys:

1001 | 2026-09-05
1001 | 2026-09-04
1001 | 2026-09-03
1002 | 2026-09-05
1002 | 2026-09-01

MongoDB first navigates by:

customerId

Then within that prefix:

createdAt ordering`,

      architecture: `Compound Index

Field 1
customerId
    |
    v
Field 2
createdAt

Example:

1001
 |
 +--> 2026-09-05
 +--> 2026-09-04
 +--> 2026-09-03

1002
 |
 +--> 2026-09-05
 +--> 2026-09-01`,

      examples: [
        `Common compound index:

db.orders.createIndex({
  customerId: 1,
  createdAt: -1
})`,

        `Query supported by leading field:

db.orders.find({
  customerId: 1001
})`,

        `Filter plus sort:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})`
      ],

      commands: [
        {
          command:
            'db.orders.createIndex({ customerId: 1, createdAt: -1 })',
          explanation:
            'Creates a compound index ordered first by customerId and then by createdAt descending.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Shows whether the compound index supports both the filter and requested sort.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows the exact field order of all index definitions.'
        }
      ],

      productionScenario: `A developer creates:

{
  createdAt: -1,
  customerId: 1
}

because the query contains both fields.

The actual workload is:

db.orders.find({
  customerId: 1001
}).sort({
  createdAt: -1
})

The index exists, but its order is not aligned with the dominant query pattern.

The DBA evaluates:

{
  customerId: 1,
  createdAt: -1
}

which groups records by customerId and maintains the desired timestamp order within that customer prefix.

The lesson is:

Having the same fields in an index does not mean the index is equally effective.

Field order is fundamental.`,

      troubleshootingApproach: `For compound-index issues:

1. Capture the complete query filter.

2. Capture the requested sort.

3. List existing compound indexes.

4. Compare query field order with index field order.

5. Check the leading index field.

6. Run explain("executionStats").

7. Inspect indexBounds.

8. Check totalKeysExamined.

9. Check totalDocsExamined.

10. Look for blocking SORT stages.

11. Compare alternate index orders using controlled testing.

12. Avoid creating multiple near-duplicate indexes without proving their value.`,

      commonMistakes: [
        'Assuming compound field order does not matter.',
        'Creating indexes based only on fields present in the query.',
        'Ignoring sort requirements.',
        'Creating several permutations of the same index without analysis.',
        'Looking only for IXSCAN instead of checking how much of the index is scanned.'
      ],

      bestPractices: [
        'Design compound indexes from real query shapes.',
        'Consider equality, sort, and range requirements.',
        'Check indexBounds and execution statistics.',
        'Avoid redundant compound indexes.',
        'Test index order before production rollout.'
      ],

      interviewAnswer: `A compound index contains multiple fields, and the order of those fields defines the ordering of index keys.

For example, { customerId: 1, createdAt: -1 } is ordered first by customerId and then by createdAt within each customer.

It can efficiently support query patterns beginning with customerId and can often satisfy the createdAt sort.

The reverse field order is not equivalent, so compound indexes must be designed around actual filters and sorts.`,

      keyTakeaways: [
        'Compound indexes contain multiple ordered fields.',
        'Field order directly affects usability.',
        'Filter and sort patterns should drive index design.',
        'The same fields in a different order form a different index.',
        'Execution statistics should confirm effectiveness.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 12,
    question:
      'What is the compound index prefix rule, and which queries can use prefixes of a compound index?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `A compound index has a field sequence.

Example:

{
  a: 1,
  b: 1,
  c: 1
}

Its prefixes are:

{ a: 1 }

{ a: 1, b: 1 }

{ a: 1, b: 1, c: 1 }

These are called index prefixes.`,

      coreConcept: `For:

{
  a: 1,
  b: 1,
  c: 1
}

MongoDB can often use the index efficiently for query patterns beginning with:

a

or:

a + b

or:

a + b + c

A query only on:

b

does not use the leading prefix in the same way because the index is primarily ordered by a first.`,

      detailedExplanation: `Suppose we create:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  createdAt: -1
})

The compound index prefixes are:

{
  customerId: 1
}

{
  customerId: 1,
  status: 1
}

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

This index can be useful for:

db.orders.find({
  customerId: 1001
})

and:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
})

and potentially:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
})

Now consider:

db.orders.find({
  status: "OPEN"
})

The index begins with customerId, not status.

MongoDB cannot navigate directly to a single contiguous status range without considering customerId values.

Depending on the version, data distribution, planner capabilities, and workload, MongoDB may still derive some benefit from a non-prefix portion in certain situations, but a DBA should not design an index assuming arbitrary suffix fields are equivalent to prefixes.

The core design rule remains:

Leading fields matter.`,

      internalWorking: `Index:

A | B | C

Ordered as:

A1 | B1 | C1
A1 | B1 | C2
A1 | B2 | C1
A2 | B1 | C1
A2 | B2 | C1


Query:

A = A1

MongoDB can isolate a contiguous section.


Query:

B = B1

Matches exist across many A groups.

This is less directly navigable.`,

      architecture: `Index:

{ A, B, C }

Valid prefixes:

A
A+B
A+B+C


Not a prefix:

B
C
B+C`,

      examples: [
        `Index:

db.orders.createIndex({
  customerId: 1,
  status: 1,
  createdAt: -1
})`,

        `Uses leading prefix:

db.orders.find({
  customerId: 1001
})`,

        `Uses longer prefix:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
})`,

        `Does not begin with index prefix:

db.orders.find({
  status: "OPEN"
})`
      ],

      commands: [
        {
          command:
            'db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 })',
          explanation:
            'Creates a three-field compound index with customerId as the leading prefix.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).explain("executionStats")',
          explanation:
            'Analyses a query using the first two fields of the compound index.'
        },
        {
          command:
            'db.orders.find({ status: "OPEN" }).explain("executionStats")',
          explanation:
            'Shows how the planner handles a query that does not constrain the leading field.'
        }
      ],

      productionScenario: `A collection has one compound index:

{
  tenantId: 1,
  customerId: 1,
  createdAt: -1
}

The application introduces a global lookup:

{
  customerId: 1001
}

Developers expect the existing compound index to provide the same performance because customerId is included.

However, tenantId is the leading field.

The global customerId lookup does not align with the main index prefix.

The DBA must determine whether:

• the query should include tenantId
• a separate index is required
• the API design should change
• the query is frequent enough to justify another index

An index containing a field is not automatically an ideal index for that field.`,

      troubleshootingApproach: `For prefix-related issues:

1. Write down the exact compound index field order.

2. Identify all valid prefixes.

3. Compare the query filter to those prefixes.

4. Check which leading fields are constrained.

5. Run explain.

6. Inspect indexBounds.

7. Measure keys examined.

8. Check whether suffix predicates reduce FETCH results but not index navigation enough.

9. Determine whether a separate index is justified.

10. Review whether application queries can include the intended leading key.`,

      commonMistakes: [
        'Assuming any field inside a compound index behaves like a standalone index.',
        'Ignoring the leading field.',
        'Creating giant compound indexes to cover unrelated queries.',
        'Assuming index prefixes are arbitrary combinations.',
        'Not checking indexBounds.'
      ],

      bestPractices: [
        'Memorize the compound prefix concept.',
        'Design leading fields around dominant access patterns.',
        'Use explain to validate suffix-only queries.',
        'Avoid overloading one compound index with unrelated needs.',
        'Consider workload frequency before adding separate indexes.'
      ],

      interviewAnswer: `For a compound index { a: 1, b: 1, c: 1 }, the main prefixes are a, a+b, and a+b+c.

Queries beginning with those leading fields can efficiently use the index ordering.

A query only on b or c does not use the same leading prefix, even though those fields exist in the index.

That is why compound index field order and prefix design are critical.`,

      keyTakeaways: [
        'Compound indexes have ordered prefixes.',
        'Leading fields drive efficient navigation.',
        'Suffix fields are not equivalent to standalone indexes.',
        'Index inclusion does not guarantee optimal usage.',
        'Use indexBounds to understand actual scanning.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 13,
    question:
      'What is the ESR rule for compound indexes, and how do Equality, Sort, and Range influence index field order?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `ESR is a common MongoDB index-design guideline.

It stands for:

E = Equality

S = Sort

R = Range

It helps DBAs reason about the order of fields in a compound index.`,

      coreConcept: `Suppose a query is:

db.orders.find({
  customerId: 1001,
  amount: {
    $gte: 500
  }
}).sort({
  createdAt: -1
})

We have:

Equality:
customerId = 1001

Sort:
createdAt descending

Range:
amount >= 500

An ESR-style candidate might be:

{
  customerId: 1,
  createdAt: -1,
  amount: 1
}`,

      detailedExplanation: `EQUALITY

Equality fields usually come first because they narrow MongoDB to specific index prefixes.

Example:

{
  tenantId: 10
}

SORT

After equality fields, placing sort fields can allow MongoDB to read results directly in the requested order.

RANGE

Range predicates include operators such as:

$gt
$gte
$lt
$lte

Once an index traversal enters a broad range, fields after that range may become less useful for some forms of index ordering and narrowing.

Example:

Query:

{
  tenantId: 1,
  age: {
    $gte: 18
  }
}

Sort:

{
  createdAt: -1
}

Candidate A:

{
  tenantId: 1,
  createdAt: -1,
  age: 1
}

Candidate B:

{
  tenantId: 1,
  age: 1,
  createdAt: -1
}

Candidate A follows ESR.

It may preserve the desired createdAt ordering after the equality prefix.

Candidate B may narrow age earlier but could lose the ability to satisfy the createdAt sort directly because the index is ordered by age before createdAt.

However, ESR is a guideline, not a commandment.

Sometimes the range condition is extremely selective and avoiding a sort is less important.

For example:

A range matches 10 documents

while the sort result is tiny.

In such a workload, ERS-style ordering may be competitive or better.

Therefore an experienced DBA uses ESR as a starting point and then validates candidates using real execution statistics and workload characteristics.`,

      internalWorking: `Query:

Equality:
tenantId = 1

Sort:
createdAt DESC

Range:
amount > 500


ESR index:

tenantId | createdAt | amount

Step 1:
Navigate to tenantId = 1

Step 2:
Traverse in createdAt order

Step 3:
Apply amount range condition


Alternative:

tenantId | amount | createdAt

Step 1:
tenantId = 1

Step 2:
amount range

Step 3:
createdAt ordering fragmented across amount values`,

      architecture: `ESR

Equality
   |
   v
Sort
   |
   v
Range


Example:

{
  customerId: 1,
  createdAt: -1,
  amount: 1
}`,

      examples: [
        `Query:

db.orders.find({
  customerId: 1001,
  amount: {
    $gte: 500
  }
}).sort({
  createdAt: -1
})`,

        `ESR candidate:

db.orders.createIndex({
  customerId: 1,
  createdAt: -1,
  amount: 1
})`,

        `Alternative candidate requiring measurement:

db.orders.createIndex({
  customerId: 1,
  amount: 1,
  createdAt: -1
})`
      ],

      commands: [
        {
          command:
            'db.orders.createIndex({ customerId: 1, createdAt: -1, amount: 1 })',
          explanation:
            'Creates a compound index following Equality-Sort-Range ordering for the example workload.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, amount: { $gte: 500 } }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Verifies whether the index avoids an explicit sort and how many keys/documents are examined.'
        }
      ],

      productionScenario: `A DBA sees:

{
  customerId: 1001,
  status: "PAID",
  amount: {
    $gte: 500
  }
}

with:

sort({ createdAt: -1 })

The current index is:

{
  customerId: 1,
  amount: 1,
  createdAt: -1,
  status: 1
}

The query has:

Equality:
customerId
status

Sort:
createdAt

Range:
amount

The DBA evaluates an ESR-oriented index such as:

{
  customerId: 1,
  status: 1,
  createdAt: -1,
  amount: 1
}

But before adding it, they test both designs against realistic data.

This is important because distribution and selectivity can make theoretical rules insufficient on their own.`,

      troubleshootingApproach: `For ESR analysis:

1. Separate predicates into equality, sort, and range.

2. Identify multiple equality fields.

3. Identify requested sort direction.

4. Identify range predicates.

5. Write candidate index orders.

6. Check whether sort can be satisfied by index order.

7. Run explain("executionStats").

8. Check for SORT stages.

9. Compare totalKeysExamined.

10. Compare totalDocsExamined.

11. Compare execution time under representative load.

12. Consider query frequency.

13. Consider write overhead.

14. Do not use ESR mechanically when workload evidence says otherwise.`,

      commonMistakes: [
        'Treating ESR as an absolute law.',
        'Putting range before sort without evaluating the consequence.',
        'Ignoring data selectivity.',
        'Optimizing one query while harming major write workloads.',
        'Comparing indexes only by executionTimeMillis from a single cold or warm run.'
      ],

      bestPractices: [
        'Use ESR as a strong starting guideline.',
        'Test alternative index orders.',
        'Consider selectivity and result size.',
        'Check both sort elimination and scan volume.',
        'Validate against real production-like data.'
      ],

      interviewAnswer: `ESR stands for Equality, Sort, Range and is a common guideline for compound index design.

Equality fields generally come first, followed by sort fields and then range fields.

This often lets MongoDB narrow to an equality prefix and preserve index ordering for the sort before entering a range.

But ESR is a guideline, so I still compare execution statistics because a highly selective range can justify a different order.`,

      keyTakeaways: [
        'ESR means Equality, Sort, Range.',
        'Equality predicates usually form the leading prefix.',
        'Sort position can eliminate blocking sorts.',
        'Range fields can affect the usefulness of later index fields.',
        'ESR should always be validated with workload evidence.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 14,
    question:
      'What is a covered query in MongoDB, and how can an index satisfy a query without fetching the full document?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `Normally an index helps MongoDB find a document.

MongoDB then fetches the full document from the collection.

A covered query is different.

If all fields needed for:

• filtering
• returning results

are available from the index itself, MongoDB may answer the query without fetching the underlying document.`,

      coreConcept: `Example index:

db.users.createIndex({
  email: 1,
  name: 1
})

Query:

db.users.find(
  {
    email: "vivek@example.com"
  },
  {
    _id: 0,
    email: 1,
    name: 1
  }
)

The filter uses email.

The returned fields are email and name.

All of them exist in the index.

MongoDB may satisfy the query from the index alone.`,

      detailedExplanation: `A normal indexed query often looks like:

IXSCAN
   |
   v
FETCH
   |
   v
Document

FETCH means MongoDB needs the collection document after locating an index entry.

A covered query can potentially look conceptually like:

IXSCAN
   |
   v
Return fields directly

without a document FETCH.

For a query to be covered, the index must contain everything required by the query.

Suppose the index is:

{
  customerId: 1,
  status: 1
}

Query:

db.orders.find(
  {
    customerId: 1001
  },
  {
    customerId: 1,
    status: 1,
    _id: 0
  }
)

This can potentially be covered.

But if the projection includes:

amount

and amount is not in the index, MongoDB must fetch the document.

The _id field also matters.

MongoDB includes _id in normal query output by default.

If _id is not part of the supporting index and the query otherwise could be covered, explicitly excluding _id can matter:

{
  _id: 0
}

A covered query can reduce document fetches and lower I/O/cache work.

However, creating extremely wide indexes only to achieve coverage can increase index size and write cost.

Coverage is therefore an optimization, not a reason to index every projected field.`,

      internalWorking: `Normal:

Query
 |
 v
IXSCAN
 |
 v
Record reference
 |
 v
FETCH document
 |
 v
Return result


Covered:

Query
 |
 v
IXSCAN
 |
 v
Index already contains requested fields
 |
 v
Return result

No document fetch required`,

      architecture: `Index:

customerId
status
createdAt

      |
      v

Filter fields available?
      |
      +--> YES

Projection fields available?
      |
      +--> YES
              |
              v
         Covered query


If any required field missing:
              |
              v
             FETCH`,

      examples: [
        `Index:

db.users.createIndex({
  email: 1,
  name: 1
})`,

        `Potential covered query:

db.users.find(
  {
    email: "vivek@example.com"
  },
  {
    email: 1,
    name: 1,
    _id: 0
  }
)`,

        `Inspect execution:

db.users.find(
  { email: "vivek@example.com" },
  { email: 1, name: 1, _id: 0 }
).explain("executionStats")`
      ],

      commands: [
        {
          command:
            'db.users.createIndex({ email: 1, name: 1 })',
          explanation:
            'Creates an index containing both filter and projected fields for the example.'
        },
        {
          command:
            'db.users.find({ email: "vivek@example.com" }, { email: 1, name: 1, _id: 0 }).explain("executionStats")',
          explanation:
            'Helps verify whether MongoDB can return the result without fetching collection documents.'
        }
      ],

      productionScenario: `A dashboard executes the same lightweight query thousands of times per second.

It needs only:

accountId
status

The existing index contains:

{
  accountId: 1
}

MongoDB uses the index to find records but still fetches each full account document, which is relatively large.

The DBA evaluates:

{
  accountId: 1,
  status: 1
}

The dashboard query projects only those fields and excludes _id where appropriate.

The query can potentially become covered, reducing FETCH work.

However, the DBA first checks whether the additional index width is justified by the very high query frequency.`,

      troubleshootingApproach: `To determine whether a query is covered:

1. Capture the filter.

2. Capture the projection.

3. Identify all required fields.

4. Compare those fields with the candidate index.

5. Check whether _id is requested implicitly.

6. Run explain.

7. Look for FETCH.

8. Check totalDocsExamined.

9. A covered query can show zero documents examined in appropriate execution statistics.

10. Measure index size impact.

11. Consider write overhead.

12. Do not widen indexes solely for low-value coverage.`,

      commonMistakes: [
        'Assuming every IXSCAN is covered.',
        'Forgetting the implicit _id projection.',
        'Adding many fields just to remove FETCH.',
        'Ignoring index size.',
        'Optimizing coverage for an infrequent query.'
      ],

      bestPractices: [
        'Use coverage for high-value query patterns.',
        'Keep projections narrow.',
        'Check FETCH stages in explain.',
        'Balance coverage against index width.',
        'Measure real workload benefit.'
      ],

      interviewAnswer: `A covered query can be answered entirely from an index because all fields used by the filter and returned by the projection are present in that index.

In that case MongoDB can avoid fetching the full collection document.

I verify this using explain by checking for the absence of a FETCH stage and appropriate documents-examined statistics.

I do not make indexes excessively wide just to achieve coverage unless the workload benefit justifies it.`,

      keyTakeaways: [
        'Covered queries can avoid document fetches.',
        'Filter and projected fields must be available from the index.',
        '_id can affect coverage.',
        'FETCH indicates document access.',
        'Coverage must be balanced against wider index cost.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 15,
    question:
      'What is index intersection in MongoDB, and when is a dedicated compound index usually preferable?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Suppose MongoDB has:

Index A:

{
  customerId: 1
}

Index B:

{
  status: 1
}

and the query is:

{
  customerId: 1001,
  status: "OPEN"
}

MongoDB may, for some query shapes and planner decisions, combine information from more than one index.

This is known as index intersection.`,

      coreConcept: `Instead of using only:

customerId index

or only:

status index

MongoDB may combine candidate record information from both indexes.

Conceptually:

customerId index matches
        |
        v
Set A

status index matches
        |
        v
Set B

Intersection:

A ∩ B

        |
        v
Documents satisfying both`,

      detailedExplanation: `Index intersection can provide flexibility when separate indexes already exist.

However, it does not mean DBAs should create only single-field indexes and expect MongoDB to combine them optimally for every query.

A dedicated compound index:

{
  customerId: 1,
  status: 1
}

often provides better ordering and more direct access for a frequent query using both fields.

Why?

With separate indexes:

Index A may return many customerId matches.

Index B may return many status matches.

MongoDB must combine candidate information.

With a compound index:

customerId and status are stored together in ordered compound keys.

MongoDB can often navigate directly to:

customerId = 1001
AND
status = OPEN

Compound indexes can also support:

• sort requirements
• index prefixes
• covered queries
• tighter bounds

Index intersection therefore should be considered a planner capability, not a replacement for workload-driven compound index design.`,

      internalWorking: `Separate indexes:

Index A
customerId = 1001
   |
   v
Record IDs:
1,2,3,4,5


Index B
status = OPEN
   |
   v
Record IDs:
2,4,8,9


Intersection:

2,4


Compound index:

customerId | status

1001 | OPEN
      |
      v
Direct compound range`,

      architecture: `             Query
               |
        +------+------+
        |             |
        v             v
    Index A       Index B
        |             |
        +------+------+
               |
               v
         Intersection
               |
               v
          Candidate docs


Versus:

Query
  |
  v
Compound Index
  |
  v
Tight key range`,

      examples: [
        `Separate indexes:

db.orders.createIndex({
  customerId: 1
})

db.orders.createIndex({
  status: 1
})`,

        `Query:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
})`,

        `Dedicated compound alternative:

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
            'Shows the planner strategy and whether one index, an intersection, or another plan is selected.'
        },
        {
          command:
            'db.orders.createIndex({ customerId: 1, status: 1 })',
          explanation:
            'Creates a dedicated compound index for the combined query pattern.'
        }
      ],

      productionScenario: `A collection has:

{
  customerId: 1
}

and:

{
  status: 1
}

A high-volume endpoint queries:

{
  customerId: 1001,
  status: "OPEN"
}

Developers say:

"MongoDB can intersect indexes, so we do not need a compound index."

The DBA checks execution statistics and sees the query examines significantly more keys than expected.

Because this endpoint executes thousands of times per second, the DBA tests:

{
  customerId: 1,
  status: 1
}

The dedicated compound index performs much less work.

The existing individual indexes may still be required by other queries, but intersection is not assumed to be the optimal plan for this important combined workload.`,

      troubleshootingApproach: `For intersection-related tuning:

1. Identify all predicates.

2. List available single-field indexes.

3. Run explain.

4. Check the winning plan structure.

5. Determine whether multiple indexes are being combined.

6. Check totalKeysExamined.

7. Check totalDocsExamined.

8. Compare against a candidate compound index in testing.

9. Check sort requirements.

10. Check coverage opportunities.

11. Consider query frequency.

12. Consider whether individual indexes are still needed separately.

13. Avoid adding a compound index unless measured benefit justifies its write/storage cost.`,

      commonMistakes: [
        'Assuming index intersection is always as good as a compound index.',
        'Creating only single-field indexes for every query field.',
        'Ignoring sort support.',
        'Ignoring keys examined.',
        'Removing useful standalone indexes solely because a compound index exists.'
      ],

      bestPractices: [
        'Treat intersection as a planner capability, not an index strategy by itself.',
        'Use compound indexes for important stable multi-field query patterns.',
        'Measure candidate plans.',
        'Consider sort and coverage needs.',
        'Keep only indexes justified by actual workloads.'
      ],

      interviewAnswer: `Index intersection is MongoDB's ability to combine information from multiple indexes for a query.

For example, it may combine customerId and status indexes.

However, a dedicated compound index often performs better for a frequent multi-field query because the fields are stored together in one ordered key structure and can provide tighter bounds, sort support, and possible coverage.

I verify the choice using explain rather than assuming intersection is sufficient.`,

      keyTakeaways: [
        'MongoDB can sometimes combine multiple indexes.',
        'Intersection is not always the optimal plan.',
        'Compound indexes provide tighter ordered keys.',
        'Sort and coverage often favour compound indexes.',
        'Execution statistics should determine the final design.'
      ]
    }
  },
  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 16,
    question:
      'A critical query is performing a COLLSCAN instead of using an expected index. How would you investigate why?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 16,

    answer: {
      groundZero: `A COLLSCAN means MongoDB is scanning collection documents instead of using an index as the primary access path.

If an index exists but MongoDB still chooses COLLSCAN, the correct response is not:

"MongoDB ignored the index."

The DBA must determine why the query planner considered another plan better or why the existing index was not usable for the query.`,

      coreConcept: `Common reasons include:

• No suitable index exists
• Compound index leading field does not match
• Query BSON type differs from stored/indexed type
• Query predicate is not selective
• Partial index condition is not satisfied
• Sparse index cannot safely return complete results
• Collation differs
• Sort requirements do not align
• Query shape changed
• Index was hidden or removed
• Planner estimated another plan to be cheaper

The investigation should always begin with explain.`,

      detailedExplanation: `Suppose the query is:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
})

An index exists:

{
  status: 1,
  createdAt: -1
}

This is not necessarily a suitable index for customerId.

Another index exists:

{
  tenantId: 1,
  customerId: 1
}

but the query does not include tenantId.

The customerId field is present in the index, but it is not the leading field.

Another possibility is mixed types.

Stored documents:

{
  customerId: 1001
}

but the application sends:

{
  customerId: "1001"
}

The query may be logically different because BSON number and BSON string are different types.

Another possibility is low selectivity.

If:

status = "OPEN"

matches 95% of the collection, using a status index may require examining almost the entire index plus fetching a huge number of documents.

The planner may consider a collection scan competitive.

Partial indexes are another common cause.

If an index is:

{
  customerId: 1
}

with:

partialFilterExpression: {
  active: true
}

then a query only containing:

{
  customerId: 1001
}

does not guarantee that active is true.

MongoDB cannot safely use the partial index if doing so could omit valid results.

Collation can also matter.

An index created with one collation may not support a query requiring incompatible string comparison semantics.

The key lesson is:

Index existence is not enough.

Index compatibility, selectivity, query shape, and planner cost all matter.`,

      internalWorking: `Query
  |
  v
Query Planner
  |
  +--> Candidate Index A
  |
  +--> Candidate Index B
  |
  +--> COLLSCAN
  |
  v
Evaluate candidate plans
  |
  v
Winning plan


If index cannot satisfy query semantics:

Index excluded


If index is usable but expensive:

Planner may choose another plan`,

      architecture: `Why COLLSCAN?

        |
        +--> Missing index
        |
        +--> Wrong compound prefix
        |
        +--> Low selectivity
        |
        +--> Type mismatch
        |
        +--> Partial/sparse semantics
        |
        +--> Collation mismatch
        |
        +--> Query shape changed
        |
        +--> Planner cost decision`,

      examples: [
        `Expected indexed query:

db.orders.find({
  customerId: 1001
}).explain("executionStats")`,

        `Possible prefix mismatch:

Index:
{
  tenantId: 1,
  customerId: 1
}

Query:
{
  customerId: 1001
}`,

        `Possible type mismatch:

Stored:
customerId: 1001

Query:
customerId: "1001"`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows the winning plan, rejected plans, keys examined, documents examined, and returned count.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows the exact index definitions, field order, partial options, sparse options, and collations.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("queryPlanner")',
          explanation:
            'Provides query-planner information useful for understanding candidate plan selection.'
        }
      ],

      productionScenario: `A query historically used:

{
  customerId: 1
}

After a deployment, explain shows COLLSCAN.

The DBA checks the query and discovers the application now sends:

customerId: "1001"

instead of:

customerId: 1001

The collection stores customerId as a number.

The index itself was never broken.

The application changed the query's BSON type.

This is why an L3 DBA verifies:

• application query shape
• BSON types
• index definition
• explain output

rather than immediately rebuilding the index.`,

      troubleshootingApproach: `For unexpected COLLSCAN:

1. Capture the exact query from the application.

2. Run explain("executionStats").

3. Confirm the winning plan.

4. Check existing indexes.

5. Compare compound field order.

6. Check BSON types.

7. Check partialFilterExpression.

8. Check sparse semantics.

9. Check collation.

10. Check query selectivity.

11. Check sort requirements.

12. Check whether the index is hidden or recently changed.

13. Compare with the previously working query shape.

14. Test candidate indexes in a controlled environment.

15. Avoid rebuilding an index until the actual reason is known.`,

      commonMistakes: [
        'Assuming an existing index must be used.',
        'Immediately rebuilding indexes.',
        'Ignoring BSON type changes.',
        'Ignoring partial-index conditions.',
        'Looking only at the final stage name without execution statistics.'
      ],

      bestPractices: [
        'Start with the exact application query.',
        'Use explain before changing indexes.',
        'Check both semantics and selectivity.',
        'Compare current query shape with historical behaviour.',
        'Treat index rebuilding as a specific fix, not a generic troubleshooting step.'
      ],

      interviewAnswer: `If MongoDB performs COLLSCAN despite an expected index, I capture the exact query and inspect explain execution statistics.

I verify the index definition, leading compound fields, BSON types, selectivity, partial or sparse conditions, collation, sorting, and recent query changes.

An index can exist but still be unusable or more expensive than another plan, so I identify the planner reason before changing anything.`,

      keyTakeaways: [
        'Index existence does not guarantee index use.',
        'Compound prefixes and BSON types matter.',
        'Low selectivity can reduce index benefit.',
        'Partial and sparse indexes have semantic restrictions.',
        'Explain should drive the investigation.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 17,
    question:
      'How do redundant and overlapping indexes affect MongoDB, and how would you identify indexes that may no longer be needed?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 17,

    answer: {
      groundZero: `More indexes do not automatically mean better performance.

Every additional index must be maintained when documents are inserted, updated, or deleted.

Redundant indexes consume resources without providing enough additional value.`,

      coreConcept: `Consider:

Index A:

{
  customerId: 1
}

Index B:

{
  customerId: 1,
  status: 1
}

Because customerId is a prefix of Index B, Index A may be redundant for some workloads.

But it is not automatically safe to drop Index A.

The shorter index may:

• be smaller
• use less cache
• support certain query patterns efficiently
• have different options
• have different uniqueness or collation semantics

Redundancy must be measured, not assumed.`,

      detailedExplanation: `Common overlapping patterns include:

{
  a: 1
}

{
  a: 1,
  b: 1
}

{
  a: 1,
  b: 1,
  c: 1
}

If the longest index handles all relevant queries efficiently, shorter indexes may be candidates for removal.

But the DBA must inspect:

• Query usage
• Sort patterns
• Projection patterns
• Index size
• Unique options
• Sparse/partial options
• Collation
• Write workload
• Planner behaviour

Another redundancy example is duplicate direction for a single field:

{
  createdAt: 1
}

and:

{
  createdAt: -1
}

Because a single-field index can normally be traversed in either direction, maintaining both is often unnecessary.

Redundant indexes impose costs.

INSERT

Every new document requires index entries.

UPDATE

If indexed values change, affected indexes must be updated.

DELETE

Corresponding index entries must be removed.

CACHE

More indexes compete for memory.

DISK

Every index occupies storage.

BACKUP

Indexes and index metadata also affect database storage and operational footprint.

A safe index-removal process should not begin with dropIndex.

A DBA should first gather usage and workload evidence and, where supported and appropriate, can use index hiding to test planner behaviour before actually removing the index.`,

      internalWorking: `One document insert

       |
       v
Collection write

       |
       +--> _id index
       |
       +--> Index A
       |
       +--> Index B
       |
       +--> Index C
       |
       +--> Index D

More indexes
     |
     v
More write maintenance`,

      architecture: `Query Benefit
      ^
      |
      |
Indexes
      |
      v
Write Cost
Disk Cost
Cache Cost
Maintenance Cost


Goal:

Useful indexes only`,

      examples: [
        `Potential overlap:

{ customerId: 1 }

{ customerId: 1, createdAt: -1 }`,

        `Potentially redundant single-field directions:

{ createdAt: 1 }

{ createdAt: -1 }`,

        `List indexes:

db.orders.getIndexes()`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Displays all index definitions for manual overlap analysis.'
        },
        {
          command:
            'db.orders.aggregate([{ $indexStats: {} }])',
          explanation:
            'Provides index usage statistics since the relevant server/process statistics were reset or restarted. Usage counts alone should not be the only removal criterion.'
        },
        {
          command:
            'db.orders.hideIndex("candidate_index_name")',
          explanation:
            'Where supported and appropriate, hides an index from the query planner to test workload behaviour before permanently dropping it.'
        },
        {
          command:
            'db.orders.unhideIndex("candidate_index_name")',
          explanation:
            'Makes a hidden index available to the query planner again.'
        }
      ],

      productionScenario: `A high-write collection contains 18 secondary indexes.

Insert latency has gradually increased.

The DBA finds several overlapping structures:

{
  customerId: 1
}

{
  customerId: 1,
  status: 1
}

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

and multiple legacy indexes unused by the current application.

Instead of dropping them immediately, the DBA:

• captures index definitions
• checks index usage
• maps indexes to application queries
• verifies unique/partial/collation differences
• tests candidate removal
• monitors query latency
• then removes only proven redundant indexes

The result is lower write overhead without damaging important reads.`,

      troubleshootingApproach: `For index cleanup:

1. Export or record all index definitions.

2. Identify exact duplicates.

3. Identify prefix overlaps.

4. Check index options.

5. Check $indexStats.

6. Map indexes to important query shapes.

7. Check slow-query evidence.

8. Compare index sizes.

9. Review application releases and legacy workloads.

10. Consider hiding a candidate index first where appropriate.

11. Monitor latency and planner behaviour.

12. Confirm rollback/recreation procedure.

13. Drop only after sufficient validation.

14. Continue monitoring after removal.`,

      commonMistakes: [
        'Dropping an index only because $indexStats shows zero accesses.',
        'Assuming every prefix index is redundant.',
        'Ignoring unique or partial-index semantics.',
        'Keeping every historical index forever.',
        'Adding new indexes without cleaning obsolete ones.'
      ],

      bestPractices: [
        'Review indexes periodically.',
        'Map indexes to actual workloads.',
        'Use index hiding when appropriate for safer testing.',
        'Keep a record of index definitions before removal.',
        'Balance read benefit against write and cache cost.'
      ],

      interviewAnswer: `Redundant indexes increase disk, cache, and write-maintenance overhead.

I identify exact duplicates and overlapping compound prefixes, then review query usage, index options, sizes, and actual application patterns.

I do not drop an index just because usage statistics are zero; I validate whether the observation window is representative and can hide a candidate index first before permanent removal.`,

      keyTakeaways: [
        'Every index has write and storage cost.',
        'Prefix overlap can indicate redundancy.',
        'Usage counters require context.',
        'Index hiding can support safer testing.',
        'Index cleanup should be evidence-driven.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 18,
    question:
      'MongoDB read performance improved after adding indexes, but write latency became significantly worse. How would you diagnose index write overhead?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 18,

    answer: {
      groundZero: `An index speeds up many reads because MongoDB can search an ordered structure.

But every write may also need to update those index structures.

Therefore adding indexes can improve reads while making inserts, updates, and deletes more expensive.`,

      coreConcept: `For an insert:

Document write

plus:

_id index update

plus:

every applicable secondary index update.

For an update:

If an indexed field changes, MongoDB may need to remove an old index key and insert a new one.

For a delete:

Index entries must also be removed.

The more indexes a write touches, the more work MongoDB performs.`,

      detailedExplanation: `Suppose a collection has:

1 _id index

plus:

15 secondary indexes.

A new insert can require maintenance across all applicable indexes.

Now suppose the application performs:

20,000 inserts per second.

Even small per-index overhead becomes significant at that rate.

Updates can be especially expensive when they modify fields appearing in multiple indexes.

Example indexes:

{
  status: 1
}

{
  customerId: 1,
  status: 1
}

{
  status: 1,
  createdAt: -1
}

An update changing:

status: "OPEN"

to:

status: "CLOSED"

affects all three secondary indexes.

Array indexes can increase the cost further because one document may generate many multikey entries.

The DBA should investigate whether the regression began after:

• new index creation
• schema change
• workload increase
• update pattern change
• new multikey array
• larger documents
• storage degradation

Correlation with the index change is important, but the DBA should still measure rather than assume.`,

      internalWorking: `INSERT

Document
   |
   v
Collection
   |
   +--> _id index
   |
   +--> Index 1
   |
   +--> Index 2
   |
   +--> Index 3
   |
   +--> ...
   |
   v
Write acknowledgement


UPDATE indexed field

Old key
   |
   v
Remove index entry

New value
   |
   v
Insert new index entry`,

      architecture: `More indexes

     |
     v

More write work

     |
     +--> CPU
     |
     +--> Cache
     |
     +--> Storage I/O
     |
     +--> Larger working set
     |
     v

Higher write latency`,

      examples: [
        `Inspect indexes:

db.orders.getIndexes()`,

        `Inspect index sizes:

db.orders.stats()`,

        `Inspect operation latency:

db.serverStatus().opLatencies`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows how many indexes exist and which fields are indexed.'
        },
        {
          command:
            'db.orders.aggregate([{ $indexStats: {} }])',
          explanation:
            'Helps identify index access patterns, with the limitation that statistics are tied to the server observation window.'
        },
        {
          command:
            'db.orders.stats()',
          explanation:
            'Provides collection and total index size information.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Shows server-level read/write operation latency metrics.'
        }
      ],

      productionScenario: `A payment collection originally had five indexes.

Developers add eight more indexes to improve reporting queries.

Read latency improves.

Two days later the application team reports:

• slower inserts
• slower updates
• increased CPU
• increased disk activity

The DBA compares the timeline and finds the new indexes are maintained by every payment write.

Several reporting indexes are also almost never used by the transactional application.

The DBA evaluates whether those reports should use a smaller set of better compound indexes or a separate analytical design.

The objective is not simply:

drop indexes.

It is:

find the smallest index set that supports critical reads without unnecessarily penalizing writes.`,

      troubleshootingApproach: `For write regression after indexing:

1. Establish the latency-change timeline.

2. Check recent index creation.

3. Count indexes.

4. Review index sizes.

5. Identify fields modified by frequent writes.

6. Map those fields to indexes.

7. Look for overlapping indexes.

8. Look for large multikey indexes.

9. Check CPU.

10. Check disk latency.

11. Check WiredTiger cache pressure.

12. Check replication lag.

13. Review index usage.

14. Test candidate index removal/hiding.

15. Measure read impact.

16. Remove only indexes whose cost exceeds their value.`,

      commonMistakes: [
        'Optimizing reads without measuring write impact.',
        'Adding one index for every individual query.',
        'Ignoring indexed fields that are frequently updated.',
        'Ignoring multikey index expansion.',
        'Dropping indexes without validating read workloads.'
      ],

      bestPractices: [
        'Treat every index as a read-versus-write trade-off.',
        'Prefer multipurpose compound indexes where appropriate.',
        'Avoid indexing fields with little workload value.',
        'Measure after every major indexing change.',
        'Review index footprint on high-write collections.'
      ],

      interviewAnswer: `Indexes improve reads but every applicable index adds write-maintenance overhead.

For a write-latency regression I compare the change timeline, review new indexes, identify which frequently modified fields they contain, inspect overlap, index size, multikey expansion, CPU, disk, cache, and replication lag.

Then I test whether low-value indexes can be removed while preserving important read performance.`,

      keyTakeaways: [
        'Indexes increase write work.',
        'Frequently updated indexed fields are expensive.',
        'Multikey indexes can amplify index entries.',
        'Read and write performance must be balanced.',
        'Index changes should be measured after deployment.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 19,
    question:
      'A query used an index for months but suddenly becomes slow after application or data changes. How would you investigate the regression?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 19,

    answer: {
      groundZero: `A query becoming slow does not always mean the index disappeared.

The query may have changed.

The data may have changed.

The result size may have changed.

The selectivity may have changed.

The index may still be used but perform much more work than before.`,

      coreConcept: `A regression investigation should compare:

Before

versus:

After

across:

• Query shape
• Query parameters
• BSON types
• Execution plan
• Index definitions
• Data volume
• Data distribution
• nReturned
• keys examined
• documents examined
• sort behaviour
• application release
• infrastructure behaviour`,

      detailedExplanation: `Suppose a query historically was:

{
  customerId: 1001,
  status: "OPEN"
}

and had an index:

{
  customerId: 1,
  status: 1
}

Later the application changes to:

{
  status: "OPEN"
}

The index still exists, but the query no longer supplies the leading customerId predicate.

Another possibility:

status OPEN historically represented:

2% of records.

After a business change it now represents:

70%.

The query shape is identical, but its selectivity changed dramatically.

Another possibility:

The application previously requested:

limit(50)

and now requests:

limit(100000)

The index works, but the result workload is fundamentally larger.

Another example:

A sort was added:

sort({
  createdAt: -1
})

but the existing index does not support that ordering.

Another possibility is plan-cache behaviour or planner reevaluation after data/index changes.

The DBA should compare actual execution statistics rather than concluding:

"The index stopped working."

An IXSCAN can still be slow if it examines millions of keys.`,

      internalWorking: `Same query name
      |
      v
But what changed?

      |
      +--> Filter?
      +--> Type?
      +--> Sort?
      +--> Limit?
      +--> Data size?
      +--> Distribution?
      +--> Index?
      +--> Plan?
      |
      v
More work
      |
      v
Higher latency`,

      architecture: `Regression Timeline

Before
 |
 +--> Query shape A
 +--> Data distribution A
 +--> Index plan A
 +--> 10 ms

After
 |
 +--> Query shape B?
 +--> Data distribution B?
 +--> Index change?
 +--> More results?
 |
 v
2 seconds`,

      examples: [
        `Before:

{
  customerId: 1001,
  status: "OPEN"
}`,

        `After:

{
  status: "OPEN"
}`,

        `Same query but changed distribution:

OPEN from 2% to 70% of collection.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).explain("executionStats")',
          explanation:
            'Captures current query execution behaviour.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Confirms whether index definitions changed.'
        },
        {
          command:
            'db.orders.aggregate([{ $indexStats: {} }])',
          explanation:
            'Provides supporting index-usage information for the current observation window.'
        }
      ],

      productionScenario: `An endpoint normally responds in 40 ms.

After a release it takes 3 seconds.

MongoDB CPU rises.

The index still exists.

The DBA compares application logs and discovers a new requirement caused the endpoint to remove customerId from the filter and search all OPEN orders globally.

The existing index is:

{
  customerId: 1,
  status: 1,
  createdAt: -1
}

The previous query matched the compound prefix.

The new query does not.

The root cause is not index corruption.

The access pattern changed.

The DBA now evaluates whether:

• the new API requirement is valid
• a separate index is justified
• result pagination needs redesign
• the global query should move to another workload architecture`,

      troubleshootingApproach: `For a query regression:

1. Establish when latency changed.

2. Capture the current query.

3. Obtain the previous query shape if available.

4. Compare parameters and BSON types.

5. Compare filter fields.

6. Compare sort.

7. Compare projection.

8. Compare limit/skip.

9. Check indexes.

10. Run explain.

11. Compare nReturned.

12. Compare keys examined.

13. Compare documents examined.

14. Check data growth.

15. Check data distribution.

16. Check recent index changes.

17. Check application deployments.

18. Check system resource changes.

19. Identify the first meaningful difference.

20. Fix the changed cause rather than assuming index corruption.`,

      commonMistakes: [
        'Rebuilding indexes automatically.',
        'Assuming IXSCAN means the query is efficient.',
        'Ignoring changed query parameters.',
        'Ignoring changed data distribution.',
        'Comparing only execution time without comparing work performed.'
      ],

      bestPractices: [
        'Keep historical query-performance baselines.',
        'Capture query shapes during releases.',
        'Compare execution statistics before and after changes.',
        'Monitor data distribution changes.',
        'Correlate application and database timelines.'
      ],

      interviewAnswer: `If an indexed query suddenly becomes slow, I compare before and after rather than assuming index corruption.

I check query shape, BSON types, sort, limit, data volume, selectivity, index definitions, and execution statistics such as keys examined, documents examined, and nReturned.

The index may still be used but the workload may have changed enough to make the plan expensive.`,

      keyTakeaways: [
        'Query regressions often come from workload changes.',
        'IXSCAN can still be expensive.',
        'Selectivity can change over time.',
        'Application releases must be correlated with DB metrics.',
        'Compare work performed, not just latency.'
      ]
    }
  },

  {
    category: 'indexing_fundamentals',
    topicId: 'indexing-fundamentals',
    topicNumber: 4,
    topicName: 'Indexing Fundamentals',
    questionNumber: 20,
    question:
      'A production MongoDB system has slow queries, high CPU, increased write latency, and many indexes. How would you perform an end-to-end L3 index review?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `An L3 index review is not simply:

Find slow query.
Create index.

A production MongoDB system may have competing requirements.

More indexes may improve reads but damage writes.

Fewer indexes may improve writes but create expensive scans.

The DBA must evaluate the complete workload.`,

      coreConcept: `A full review should connect:

Application queries
        |
        v
Query shapes
        |
        v
Existing indexes
        |
        v
Execution plans
        |
        v
Read efficiency
        |
        v
Write/index maintenance
        |
        v
CPU / cache / disk
        |
        v
Replication
        |
        v
Application latency`,

      detailedExplanation: `Assume the environment has:

• 1 billion documents
• 20 secondary indexes
• CPU at 90%
• slow inserts
• multiple slow reads
• replication lag increasing

The DBA should avoid changing indexes randomly.

STEP 1 — BUILD THE WORKLOAD PICTURE

Identify:

• highest-frequency queries
• highest-latency queries
• highest-total-cost queries
• common updates
• common inserts
• common deletes

A query running once per day for 10 seconds may be less important than a 100 ms query running 20,000 times per second.

STEP 2 — ANALYSE QUERY PLANS

For important reads check:

• IXSCAN
• COLLSCAN
• FETCH
• SORT
• indexBounds
• totalKeysExamined
• totalDocsExamined
• nReturned

STEP 3 — MAP QUERIES TO INDEXES

For each important query determine:

• equality fields
• sort fields
• range fields
• projection
• candidate compound index
• prefix behaviour
• coverage opportunities

STEP 4 — REVIEW REDUNDANCY

Check:

• exact duplicates
• overlapping prefixes
• opposite-direction duplicate single-field indexes
• legacy indexes
• unused candidates
• redundant reporting indexes

STEP 5 — REVIEW WRITE COST

Identify:

• frequently updated indexed fields
• multikey indexes
• large arrays
• high insert rate
• index count
• total index footprint

STEP 6 — REVIEW MEMORY AND STORAGE

Large indexes compete for cache and filesystem resources.

If important index working sets do not remain hot, the database may perform more disk I/O.

STEP 7 — REVIEW REPLICATION IMPACT

Heavy writes caused by application activity and index maintenance can contribute to:

• storage pressure
• secondary lag
• larger replication workload

STEP 8 — TEST CHANGES

Do not add and remove several indexes simultaneously if you want to understand causality.

Make controlled changes.

Measure.

Then continue.`,

      internalWorking: `Application Workload
        |
        v
Query Inventory
        |
        v
Explain Analysis
        |
        v
Index Mapping
        |
   +----+----+
   |         |
   v         v
Missing   Redundant
Indexes   Indexes
   |         |
   +----+----+
        |
        v
Read/Write Trade-off
        |
        v
Test Change
        |
        v
Measure
        |
        v
Production Validation`,

      architecture: `                 INDEX REVIEW
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
     Reads           Writes         Resources
       |               |               |
   COLLSCAN          inserts           CPU
   IXSCAN            updates           cache
   FETCH             deletes           disk
   SORT                 |               |
       |                v               |
       |         index maintenance      |
       +---------------+---------------+
                       |
                       v
                 Overall latency`,

      examples: [
        `Read investigation:

db.orders.find({
  customerId: 1001,
  status: "OPEN"
}).sort({
  createdAt: -1
}).explain("executionStats")`,

        `Index inventory:

db.orders.getIndexes()`,

        `Usage evidence:

db.orders.aggregate([
  {
    $indexStats: {}
  }
])`
      ],

      commands: [
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Provides the complete index inventory for the collection.'
        },
        {
          command:
            'db.orders.aggregate([{ $indexStats: {} }])',
          explanation:
            'Provides index access statistics for the current server observation period.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001, status: "OPEN" }).sort({ createdAt: -1 }).explain("executionStats")',
          explanation:
            'Shows actual work performed by an important query.'
        },
        {
          command:
            'db.orders.stats()',
          explanation:
            'Shows collection and index footprint information.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Provides server-level operation latency statistics.'
        },
        {
          command:
            'db.serverStatus().wiredTiger.cache',
          explanation:
            'Shows WiredTiger cache metrics relevant to memory pressure and workload efficiency.'
        }
      ],

      productionScenario: `A production cluster experiences:

Reads:
Several customer APIs take 2–5 seconds.

Writes:
Insert latency doubled.

CPU:
90–95%.

Replication:
Secondaries are falling behind.

Indexes:
The main collection has 24 indexes.

The DBA finds:

• two major queries performing COLLSCAN
• several compound indexes with poor field ordering
• six old unused reporting indexes
• three overlapping prefix indexes
• a large multikey index on an unbounded array
• frequent updates touching four different status-related indexes

The solution is not:

create indexes for the COLLSCAN queries immediately.

The DBA designs a controlled plan:

1. Create/test the two truly required compound indexes.

2. Validate read improvement.

3. Hide redundant candidates one at a time.

4. Monitor workload.

5. Remove proven obsolete indexes.

6. Redesign the unbounded array.

7. Reduce unnecessary status-index overlap.

8. Monitor CPU, cache, disk, write latency, and replication lag.

The final index count may become smaller while both read and write performance improve.

That is the goal of mature index engineering.`,

      troubleshootingApproach: `End-to-end L3 index review:

1. Establish baseline metrics.

2. Capture slow and frequent query shapes.

3. Rank queries by total workload impact.

4. Run executionStats for representative queries.

5. Identify COLLSCAN.

6. Identify inefficient IXSCAN.

7. Check blocking SORT.

8. Check FETCH and coverage opportunities.

9. Review equality/sort/range patterns.

10. Review compound prefixes.

11. Review indexBounds.

12. Inventory all indexes.

13. Identify duplicates and overlaps.

14. Check partial, sparse, TTL, unique, and multikey semantics.

15. Review index usage.

16. Review total index sizes.

17. Identify frequently updated indexed fields.

18. Check CPU.

19. Check WiredTiger cache.

20. Check disk latency.

21. Check replication lag.

22. Create a change plan.

23. Test candidate indexes.

24. Hide removal candidates where appropriate.

25. Make controlled production changes.

26. Measure after every change.

27. Keep rollback/recreation commands.

28. Document the final index strategy.`,

      commonMistakes: [
        'Creating an index for every slow query independently.',
        'Judging indexes only by whether they are used.',
        'Ignoring write-heavy workloads.',
        'Dropping several indexes simultaneously.',
        'Ignoring application frequency and total workload cost.'
      ],

      bestPractices: [
        'Design indexes at workload level, not query-by-query in isolation.',
        'Measure reads and writes together.',
        'Use controlled incremental changes.',
        'Maintain an index inventory and ownership rationale.',
        'Periodically repeat index reviews as workloads evolve.'
      ],

      interviewAnswer: `For an L3 index review I first identify the highest-impact read and write query shapes, not just the slowest individual operation.

I use executionStats to analyse scans, bounds, sorts, fetches, and examined counts, then map those queries to compound indexes using prefix and ESR concepts.

I also identify redundant indexes, multikey growth, frequently updated indexed fields, index sizes, cache and disk pressure, and replication impact.

I make controlled changes and measure after each one because the goal is the smallest useful index set that supports the complete production workload.`,

      keyTakeaways: [
        'Index tuning is a workload-level activity.',
        'Both missing and excessive indexes can hurt performance.',
        'Execution statistics are central to diagnosis.',
        'Write cost, cache, storage, and replication matter.',
        'The best index strategy is the smallest effective set.'
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
       REMOVE ONLY PREVIOUS TOPIC 4 RECORDS
    ===================================================== */

    const deleteResult = await collection.deleteMany({
      category: 'indexing_fundamentals'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous indexing_fundamentals documents`
    );


    /* =====================================================
       INSERT ALL 20 TOPIC 4 QUESTIONS
    ===================================================== */

    const insertResult = await collection.insertMany(
      questions,
      {
        ordered: true
      }
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Indexing Fundamentals questions`
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
       VALIDATE TOPIC 4 COUNT
    ===================================================== */

    const count = await collection.countDocuments({
      category: 'indexing_fundamentals'
    });

    console.log(
      `Topic 4 count: ${count}`
    );

    if (count !== 20) {
      throw new Error(
        `Validation failed: expected 20 Topic 4 questions, found ${count}`
      );
    }


    /* =====================================================
       VALIDATE NEW CURRICULUM TOTAL

       Topic 1 = 20
       Topic 2 = 20
       Topic 3 = 20
       Topic 4 = 20

       Expected total = 80
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
      'Topic 4 seed completed successfully.'
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
    'Topic 4 seed failed:'
  );

  console.error(error);

  process.exit(1);
});
