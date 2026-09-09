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
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 1,
    question:
      'What are CRUD operations in MongoDB and what does each operation represent?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `CRUD stands for:

Create
Read
Update
Delete

These are the four basic categories of operations used by applications to work with data.

For example, in an employee application:

Create:
Add a new employee.

Read:
Find an employee.

Update:
Change the employee's department.

Delete:
Remove the employee record.

Almost every database application is built using combinations of these four operations.`,

      coreConcept: `MongoDB provides several methods for CRUD operations.

CREATE

insertOne()
insertMany()

READ

findOne()
find()

UPDATE

updateOne()
updateMany()
replaceOne()

DELETE

deleteOne()
deleteMany()

These commands operate on documents inside collections.`,

      detailedExplanation: `Suppose we have a collection:

employees

A document may look like:

{
  name: "Vivek",
  department: "Database",
  experience: 4,
  active: true
}

To create the document:

db.employees.insertOne({
  name: "Vivek",
  department: "Database",
  experience: 4,
  active: true
})

To read it:

db.employees.findOne({
  name: "Vivek"
})

To update it:

db.employees.updateOne(
  { name: "Vivek" },
  {
    $set: {
      experience: 5
    }
  }
)

To delete it:

db.employees.deleteOne({
  name: "Vivek"
})

MongoDB CRUD operations normally use query filters.

The filter determines which documents qualify for an operation.

For example:

{ department: "Database" }

means:

Find documents whose department field equals "Database".

Understanding filters is therefore fundamental to MongoDB CRUD.

One of the most important production concepts is that the same filter syntax used for reads is often also used for updates and deletes.

That means a poorly written filter can have serious consequences.

For example:

db.users.deleteMany({})

matches every document in the collection.

Similarly:

db.users.updateMany(
  {},
  { $set: { active: false } }
)

updates every document.

A DBA or developer must always understand the scope of the filter before running destructive commands.`,

      internalWorking: `CRUD flow:

Application
    |
    v
MongoDB Driver
    |
    v
CRUD Command
    |
    v
Query Filter
    |
    v
MongoDB Query Layer
    |
    v
Matching Documents
    |
    +--> Create
    |
    +--> Read
    |
    +--> Update
    |
    +--> Delete
    |
    v
WiredTiger Storage Engine`,

      architecture: `Collection: employees

+----------------------------------+
| Document 1                       |
| name: Vivek                      |
| department: Database             |
+----------------------------------+

+----------------------------------+
| Document 2                       |
| name: Arun                       |
| department: Linux                |
+----------------------------------+


CRUD

INSERT ---> New document

FIND -----> Existing document

UPDATE ---> Modify existing document

DELETE ---> Remove existing document`,

      examples: [
        `Create one employee:

db.employees.insertOne({
  name: "Vivek",
  role: "MongoDB DBA"
})`,

        `Read all Database employees:

db.employees.find({
  department: "Database"
})`,

        `Update one employee:

db.employees.updateOne(
  { name: "Vivek" },
  { $set: { experience: 5 } }
)`,

        `Delete one employee:

db.employees.deleteOne({
  name: "Vivek"
})`
      ],

      commands: [
        {
          command:
            'db.employees.insertOne({ name: "Vivek", department: "Database" })',
          explanation:
            'Creates one new document in the employees collection.'
        },
        {
          command:
            'db.employees.find({ department: "Database" })',
          explanation:
            'Reads all documents whose department field equals Database.'
        },
        {
          command:
            'db.employees.updateOne({ name: "Vivek" }, { $set: { active: true } })',
          explanation:
            'Updates the first document matching the filter.'
        },
        {
          command:
            'db.employees.deleteOne({ name: "Vivek" })',
          explanation:
            'Deletes one document matching the filter.'
        }
      ],

      productionScenario: `A developer needs to disable one user.

They intend to execute:

db.users.updateOne(
  { userId: 1001 },
  {
    $set: {
      active: false
    }
  }
)

But they accidentally execute:

db.users.updateMany(
  {},
  {
    $set: {
      active: false
    }
  }
)

Every user account becomes inactive.

This demonstrates why production CRUD commands must be reviewed carefully.

Before an UPDATE or DELETE, a safe DBA practice is to test the filter using find() first.

For example:

db.users.find({
  userId: 1001
})

Only after confirming the expected document should the write be executed.`,

      troubleshootingApproach: `Before running important CRUD operations:

1. Identify the target database.

2. Identify the target collection.

3. Validate the query filter.

4. Run find() using the same filter.

5. Check how many documents match.

6. Determine whether updateOne, updateMany, deleteOne, or deleteMany is appropriate.

7. Confirm the required write concern.

8. Check whether the operation affects indexed fields.

9. For large changes, consider batching and monitoring.

10. Verify the result after execution.

For production destructive operations, never assume the filter is correct simply because the command is syntactically valid.`,

      commonMistakes: [
        'Using an empty filter accidentally.',
        'Using updateMany when updateOne was intended.',
        'Using deleteMany without validating document count.',
        'Running commands against the wrong database.',
        'Not checking the result after a write.'
      ],

      bestPractices: [
        'Test important write filters with find first.',
        'Use specific unique identifiers where possible.',
        'Use the least broad write operation needed.',
        'Validate matched and modified counts.',
        'Take extra care with production deletes and bulk updates.'
      ],

      interviewAnswer: `CRUD stands for Create, Read, Update, and Delete.

MongoDB provides methods such as insertOne and insertMany for creates, find and findOne for reads, updateOne, updateMany, and replaceOne for updates, and deleteOne and deleteMany for deletes.

The query filter is critical because it determines which documents are affected, so in production I validate important update and delete filters with a read before executing the write.`,

      keyTakeaways: [
        'CRUD represents the four fundamental data operations.',
        'MongoDB CRUD methods operate on documents.',
        'Filters determine the documents affected.',
        'An empty filter can affect an entire collection.',
        'Production writes should be validated before execution.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 2,
    question:
      'How do insertOne() and insertMany() work, and what should a DBA understand about insert operations?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `An insert operation adds a new document to a MongoDB collection.

MongoDB provides two commonly used insert methods:

insertOne()

and:

insertMany()

insertOne() adds one document.

insertMany() adds multiple documents in a single operation.`,

      coreConcept: `Examples:

Insert one:

db.users.insertOne({
  name: "Vivek",
  city: "Bengaluru"
})

Insert many:

db.users.insertMany([
  {
    name: "Vivek"
  },
  {
    name: "Arun"
  },
  {
    name: "Ravi"
  }
])

If the application does not explicitly provide an _id value, MongoDB drivers commonly generate an ObjectId for the document.`,

      detailedExplanation: `MongoDB requires every document in a normal collection to have a unique _id field.

If an application inserts:

{
  name: "Vivek"
}

MongoDB will store a document containing an _id as well.

Conceptually:

{
  _id: ObjectId(...),
  name: "Vivek"
}

The _id field has a unique index by default.

Therefore two documents cannot have the same _id value.

An insert can fail for several reasons, including:

• Duplicate _id
• Duplicate value on another unique index
• Schema validation failure
• Document exceeding supported maximum BSON size
• Authorization failure
• Write concern failure
• Storage or replication problem

insertMany() can operate in ordered or unordered mode.

Ordered behaviour:

MongoDB processes the batch in order and generally stops processing remaining operations after an error.

Unordered behaviour:

MongoDB can continue attempting other documents even if individual documents fail.

This distinction is important when performing large data loads.

Insert performance is also affected by indexes.

Every inserted document must create entries in all applicable indexes.

Therefore a collection with many indexes generally has more write overhead than a collection with fewer indexes.`,

      internalWorking: `insertOne()

Application
    |
    v
New Document
    |
    v
Generate / Validate _id
    |
    v
Validate document
    |
    v
Insert record
    |
    +--> Update _id index
    |
    +--> Update secondary indexes
    |
    v
WiredTiger
    |
    v
Replication / Write Concern


insertMany()

Document 1
Document 2
Document 3
    |
    v
Batch processing
    |
    v
Insert + Index maintenance`,

      architecture: `INSERT

Document
  |
  v
Collection
  |
  +-- Data storage
  |
  +-- _id index
  |
  +-- Secondary indexes
  |
  v
WiredTiger
  |
  v
Persistent Storage`,

      examples: [
        `Insert with generated _id:

db.users.insertOne({
  name: "Vivek"
})`,

        `Insert with manually defined _id:

db.users.insertOne({
  _id: 1001,
  name: "Vivek"
})`,

        `Unordered insert example:

db.users.insertMany(
  [
    { _id: 1, name: "A" },
    { _id: 2, name: "B" },
    { _id: 3, name: "C" }
  ],
  {
    ordered: false
  }
)`
      ],

      commands: [
        {
          command:
            'db.users.insertOne({ name: "Vivek", role: "DBA" })',
          explanation:
            'Inserts one document and returns information including the inserted _id.'
        },
        {
          command:
            'db.users.insertMany([{ name: "A" }, { name: "B" }])',
          explanation:
            'Inserts multiple documents.'
        },
        {
          command:
            'db.users.insertMany([{ _id: 1 }, { _id: 2 }], { ordered: false })',
          explanation:
            'Runs an unordered insertMany operation so later documents can still be attempted after certain individual write errors.'
        }
      ],

      productionScenario: `A bulk import of one million documents stops after encountering a duplicate-key error near the beginning of the batch.

The DBA discovers the application used ordered inserts.

Because the use case allows independent records to be inserted even when some records are duplicates, unordered bulk insertion may be more appropriate.

However, this decision depends on application requirements.

The DBA should also investigate why duplicates exist rather than simply ignoring the errors.`,

      troubleshootingApproach: `For failed inserts:

1. Capture the exact error.

2. Check whether the error is duplicate key.

3. Identify which unique index caused the failure.

4. Check schema validation rules.

5. Check document size.

6. Check authorization.

7. Check write concern errors.

8. Check replica-set health.

9. Check disk/storage errors.

10. For bulk inserts, determine whether ordered or unordered behaviour is appropriate.

11. Verify how many documents actually succeeded.

12. Avoid blindly retrying the complete batch if some documents already committed.`,

      commonMistakes: [
        'Assuming every insert failure is caused by _id.',
        'Ignoring unique secondary indexes.',
        'Blindly retrying a partially successful bulk insert.',
        'Using ordered insertion without understanding failure behaviour.',
        'Adding excessive indexes to high-write collections.'
      ],

      bestPractices: [
        'Use appropriate unique constraints.',
        'Understand ordered versus unordered bulk inserts.',
        'Validate insert results.',
        'Keep only useful indexes.',
        'Design retries to avoid accidental duplicates.'
      ],

      interviewAnswer: `insertOne inserts one document and insertMany inserts multiple documents.

MongoDB requires a unique _id, and if one is not provided it is typically generated by the driver.

Insert operations also update all relevant indexes and participate in storage durability and replication.

For bulk inserts I pay attention to ordered versus unordered behaviour, duplicate-key errors, partial success, index overhead, and write concern.`,

      keyTakeaways: [
        'Every normal MongoDB document has a unique _id.',
        'insertMany can be ordered or unordered.',
        'Indexes add insert overhead.',
        'Bulk operations can partially succeed.',
        'Insert errors should be diagnosed by exact error type.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 3,
    question:
      'How do find() and findOne() work, and what is the role of a query filter?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `MongoDB uses find operations to read documents.

findOne() returns one matching document.

find() represents a query that can return multiple matching documents.

The most important part of a read operation is usually the query filter.`,

      coreConcept: `A filter is a BSON document describing the conditions a stored document must satisfy.

Example:

db.users.find({
  city: "Bengaluru"
})

The filter:

{
  city: "Bengaluru"
}

means:

Return documents where city equals Bengaluru.`,

      detailedExplanation: `MongoDB queries use a document-shaped query language.

For example:

db.employees.find({
  department: "Database",
  active: true
})

This means both conditions must match.

Conceptually this is an implicit logical AND:

department = Database

AND

active = true

If find() is called with an empty filter:

db.employees.find({})

all documents are eligible to match.

findOne() is useful when only one matching document is required.

However, unless the filter uniquely identifies a record or ordering is otherwise controlled by the API being used, developers should not assume an arbitrary matching document has business meaning.

Query filters can contain:

• Direct equality
• Comparison operators
• Logical operators
• Array conditions
• Nested-field conditions
• Regular expressions
• Element operators

The filter is passed to MongoDB's query planner.

MongoDB evaluates possible execution plans using available indexes and other planner information.

The efficiency of the filter and supporting indexes directly affects performance.`,

      internalWorking: `find(filter)

Client
  |
  v
Query Filter
  |
  v
Query Parser
  |
  v
Query Planner
  |
  +--> Index Scan
  |
  +--> Collection Scan
  |
  v
Winning Plan
  |
  v
Matching Documents
  |
  v
Cursor
  |
  v
Client`,

      architecture: `Collection

Document 1:
{
  department: "Database",
  active: true
}

Document 2:
{
  department: "Linux",
  active: true
}


Filter:

{
  department: "Database"
}

          |
          v

Matches Document 1`,

      examples: [
        `Find all active employees:

db.employees.find({
  active: true
})`,

        `Find one employee by employeeId:

db.employees.findOne({
  employeeId: 1001
})`,

        `Find all documents:

db.employees.find({})`,

        `Multiple equality conditions:

db.employees.find({
  department: "Database",
  city: "Bengaluru"
})`
      ],

      commands: [
        {
          command:
            'db.employees.find({ department: "Database" })',
          explanation:
            'Returns documents matching the department condition.'
        },
        {
          command:
            'db.employees.findOne({ employeeId: 1001 })',
          explanation:
            'Returns one document matching the supplied employeeId.'
        },
        {
          command:
            'db.employees.find({}).limit(10)',
          explanation:
            'Returns up to ten documents from the collection.'
        }
      ],

      productionScenario: `A collection contains 200 million documents.

An application executes:

db.transactions.find({
  customerId: 1001
})

The query suddenly becomes slow after its customerId index is removed.

The query itself is valid.

But MongoDB may now need to scan a large portion of the collection.

This demonstrates the difference between:

Query correctness

and:

Query efficiency.

A syntactically correct find can still be disastrous in production if it lacks an appropriate access path.`,

      troubleshootingApproach: `For slow find operations:

1. Capture the exact filter.

2. Check returned document count.

3. Run explain("executionStats").

4. Identify IXSCAN or COLLSCAN.

5. Check totalDocsExamined.

6. Check totalKeysExamined.

7. Check nReturned.

8. Review available indexes.

9. Check sort and projection.

10. Check cache and disk activity.

11. Compare query shape against historical behaviour.

12. Determine whether the problem is filter design, indexing, data distribution, or infrastructure.`,

      commonMistakes: [
        'Assuming valid queries are automatically efficient.',
        'Using find({}) accidentally on huge collections.',
        'Ignoring indexes.',
        'Returning far more documents than the application needs.',
        'Using findOne with a non-unique condition and assuming deterministic business selection.'
      ],

      bestPractices: [
        'Use selective filters.',
        'Index important query patterns.',
        'Limit unnecessary result sizes.',
        'Use explain for critical queries.',
        'Use unique identifiers when retrieving a specific business record.'
      ],

      interviewAnswer: `find and findOne read MongoDB documents using a BSON query filter.

The filter defines which documents match.

MongoDB passes the query through its planner and may use indexes or perform a collection scan.

For performance I evaluate the filter, available indexes, documents and keys examined, returned count, sorting, and result size.`,

      keyTakeaways: [
        'Filters define matching documents.',
        'Multiple simple fields normally imply AND logic.',
        'find can return multiple documents.',
        'findOne returns one matching document.',
        'Query correctness and query performance are different concerns.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 4,
    question:
      'How do comparison operators such as $eq, $ne, $gt, $gte, $lt, $lte, $in, and $nin work?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `Sometimes we do not want to search for one exact value.

For example:

Find employees with more than 5 years experience.

Find orders worth at least 10,000.

Find users whose country is India or Singapore.

MongoDB provides comparison operators for these conditions.`,

      coreConcept: `Common comparison operators are:

$eq
Equal to

$ne
Not equal to

$gt
Greater than

$gte
Greater than or equal to

$lt
Less than

$lte
Less than or equal to

$in
Matches one of several supplied values

$nin
Does not match the supplied values`,

      detailedExplanation: `Examples:

Greater than:

db.employees.find({
  experience: {
    $gt: 5
  }
})

Greater than or equal:

db.orders.find({
  amount: {
    $gte: 10000
  }
})

Range:

db.orders.find({
  amount: {
    $gte: 1000,
    $lte: 5000
  }
})

Multiple allowed values:

db.users.find({
  city: {
    $in: [
      "Bengaluru",
      "Hyderabad",
      "Pune"
    ]
  }
})

Excluded values:

db.users.find({
  status: {
    $nin: [
      "BLOCKED",
      "DELETED"
    ]
  }
})

One important DBA concept is BSON type sensitivity.

For example:

{
  age: 30
}

and:

{
  age: "30"
}

contain different BSON types.

Poor schema consistency can therefore produce unexpected query results and index behaviour.

Another important point is selectivity.

A condition such as:

status: { $ne: "ACTIVE" }

may match a very large proportion of a collection.

An index existing on status does not necessarily mean the query will always be efficient.

Query performance depends on how selective the condition is and how MongoDB's planner evaluates the available access paths.`,

      internalWorking: `Example:

{
  amount: {
    $gte: 1000,
    $lt: 5000
  }
}

MongoDB evaluates:

amount >= 1000
AND
amount < 5000


With suitable index:

amount index
    |
    v
Relevant index range
    |
    v
Candidate documents


Without suitable index:

Collection
    |
    v
Examine documents
    |
    v
Evaluate condition`,

      architecture: `Comparison Filter

amount
  |
  +---- less than
  |
  +---- greater than
  |
  +---- range
  |
  +---- membership

        |
        v

Query Planner

        |
        +--> Index range scan
        |
        +--> Collection scan`,

      examples: [
        `Exact equality using explicit operator:

db.users.find({
  age: {
    $eq: 30
  }
})`,

        `More commonly, equality can be written directly:

db.users.find({
  age: 30
})`,

        `Range query:

db.products.find({
  price: {
    $gte: 500,
    $lte: 2000
  }
})`,

        `Membership:

db.users.find({
  role: {
    $in: [
      "DBA",
      "Developer"
    ]
  }
})`
      ],

      commands: [
        {
          command:
            'db.orders.find({ amount: { $gt: 10000 } })',
          explanation:
            'Finds documents whose amount is greater than 10000.'
        },
        {
          command:
            'db.orders.find({ amount: { $gte: 1000, $lte: 5000 } })',
          explanation:
            'Finds documents whose amount is within the inclusive range.'
        },
        {
          command:
            'db.users.find({ city: { $in: ["Bengaluru", "Pune"] } })',
          explanation:
            'Finds users whose city matches one of the supplied values.'
        }
      ],

      productionScenario: `A developer writes:

db.transactions.find({
  status: {
    $ne: "SUCCESS"
  }
})

The transactions collection contains 500 million documents, and 80% of the records are not SUCCESS.

Even though status has an index, this query can still touch a huge amount of data because the filter is not selective.

The DBA should not simply say:

"There is an index, so the query is optimized."

Instead, examine:

• nReturned
• totalKeysExamined
• totalDocsExamined
• query selectivity
• actual execution plan`,

      troubleshootingApproach: `For comparison-query issues:

1. Verify the stored BSON type.

2. Check query operator semantics.

3. Confirm expected match count.

4. Check selectivity.

5. Run explain("executionStats").

6. Review index order.

7. Check totalKeysExamined.

8. Check totalDocsExamined.

9. Check nReturned.

10. Review whether $ne or $nin matches most of the collection.

11. Check whether application schema inconsistencies affect comparisons.

12. Validate range boundaries carefully.`,

      commonMistakes: [
        'Confusing $gt with $gte.',
        'Confusing $lt with $lte.',
        'Ignoring BSON type differences.',
        'Assuming $ne queries are selective.',
        'Assuming an index guarantees efficient execution.'
      ],

      bestPractices: [
        'Use consistent BSON data types.',
        'Understand query selectivity.',
        'Use explain for large range queries.',
        'Validate inclusive and exclusive boundaries.',
        'Design indexes around real query patterns.'
      ],

      interviewAnswer: `MongoDB comparison operators include $eq, $ne, $gt, $gte, $lt, $lte, $in, and $nin.

They allow equality, range, exclusion, and membership conditions.

Performance depends not only on whether an index exists but also on BSON types, selectivity, index ordering, and the number of keys and documents examined.`,

      keyTakeaways: [
        'Comparison operators support equality and range conditions.',
        '$in matches one of several values.',
        '$nin excludes supplied values.',
        'BSON type consistency matters.',
        'Selectivity strongly affects query performance.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 5,
    question:
      'How do logical operators such as $and, $or, $nor, and $not work in MongoDB queries?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `Logical operators combine query conditions.

For example:

Find users who are active AND live in Bengaluru.

Find users who are DBAs OR developers.

Find records that do NOT satisfy a condition.

MongoDB provides logical operators for these cases.`,

      coreConcept: `$and

All supplied expressions must match.

$or

At least one supplied expression must match.

$nor

None of the supplied expressions may match.

$not

Negates the effect of another operator expression associated with a field.`,

      detailedExplanation: `MongoDB often provides implicit AND behaviour.

For example:

db.users.find({
  city: "Bengaluru",
  active: true
})

means:

city = Bengaluru

AND

active = true

Explicit $and can also be used:

db.users.find({
  $and: [
    {
      city: "Bengaluru"
    },
    {
      active: true
    }
  ]
})

$or example:

db.users.find({
  $or: [
    {
      role: "DBA"
    },
    {
      role: "Developer"
    }
  ]
})

$nor example:

db.users.find({
  $nor: [
    {
      status: "BLOCKED"
    },
    {
      status: "DELETED"
    }
  ]
})

$not is generally applied to another operator expression on a field.

For example:

db.products.find({
  price: {
    $not: {
      $gt: 1000
    }
  }
})

Logical query design matters greatly for indexing.

For $or queries, MongoDB can potentially use indexes for the individual branches when suitable indexes exist.

But complex logical conditions can still become expensive.

A query containing many broad $or branches may inspect a large amount of data even though each branch is syntactically valid.`,

      internalWorking: `AND

Condition A ----+
                |
Condition B ----+--> Both must match


OR

Condition A ----+
                |
Condition B ----+--> At least one matches


NOR

Condition A ----+
                |
Condition B ----+--> Neither may match


Logical query
      |
      v
Query Planner
      |
      v
Evaluate available indexes
      |
      v
Execution plan`,

      architecture: `Example:

{
  $or: [
    { department: "Database" },
    { department: "Linux" }
  ]
}

        |
        v

Query Planner

   +----------+
   |          |
   v          v
Branch 1    Branch 2
   |          |
   +-----+----+
         |
         v
   Combined Results`,

      examples: [
        `Implicit AND:

db.employees.find({
  department: "Database",
  active: true
})`,

        `Explicit AND:

db.employees.find({
  $and: [
    { experience: { $gte: 3 } },
    { active: true }
  ]
})`,

        `OR:

db.employees.find({
  $or: [
    { department: "Database" },
    { department: "Linux" }
  ]
})`,

        `NOR:

db.users.find({
  $nor: [
    { status: "BLOCKED" },
    { status: "DELETED" }
  ]
})`
      ],

      commands: [
        {
          command:
            'db.users.find({ $or: [{ city: "Bengaluru" }, { city: "Pune" }] })',
          explanation:
            'Returns documents matching either city condition.'
        },
        {
          command:
            'db.users.find({ $and: [{ age: { $gte: 18 } }, { active: true }] })',
          explanation:
            'Returns documents satisfying both expressions.'
        },
        {
          command:
            'db.users.find({ status: { $not: { $eq: "BLOCKED" } } })',
          explanation:
            'Uses $not to negate the field expression. Negation semantics should be tested carefully, especially when fields may be missing.'
        }
      ],

      productionScenario: `An application uses:

db.orders.find({
  $or: [
    { customerId: 1001 },
    { email: "user@example.com" },
    { phone: "9999999999" }
  ]
})

The query is slow.

The DBA checks and finds:

customerId has an index.

email has an index.

phone does not have an index.

Depending on the query and available indexes, the unindexed branch can prevent the overall access pattern from being as efficient as expected.

The DBA should evaluate the complete $or query using explain rather than checking only one condition.`,

      troubleshootingApproach: `For logical-query performance:

1. Capture the complete query.

2. Separate each logical branch.

3. Check how selective each branch is.

4. Check supporting indexes.

5. Run explain("executionStats") on the full query.

6. Review totalKeysExamined and totalDocsExamined.

7. Check whether any $or branch lacks a suitable index.

8. Check missing-field semantics with negative conditions.

9. Simplify redundant predicates.

10. Compare alternate query/index designs.

Logical correctness should be validated separately from performance.`,

      commonMistakes: [
        'Using explicit $and when simple implicit AND would be clearer.',
        'Assuming one indexed $or branch makes the entire query efficient.',
        'Misunderstanding $not.',
        'Ignoring missing fields when using negative conditions.',
        'Creating very broad $or queries without checking selectivity.'
      ],

      bestPractices: [
        'Keep logical predicates readable.',
        'Index important $or branches appropriately.',
        'Use explain on the complete logical query.',
        'Test negative-query behaviour with missing fields.',
        'Avoid redundant conditions.'
      ],

      interviewAnswer: `$and requires all expressions to match, $or requires at least one, $nor requires none of the expressions to match, and $not negates another field-level operator expression.

MongoDB also supports implicit AND when multiple field conditions appear in the same filter.

For performance, I evaluate the complete logical query because each branch and its supporting indexes can affect the final execution plan.`,

      keyTakeaways: [
        '$and combines mandatory conditions.',
        '$or matches alternative conditions.',
        '$nor rejects all listed conditions.',
        '$not negates another operator expression.',
        'Logical queries should be analysed as complete query shapes.'
      ]
    }
  },
  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 6,
    question:
      'How do projection, sort(), limit(), and skip() work in MongoDB queries?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `A MongoDB query does not always need to return every field from every matching document.

You may also need results in a particular order or only a limited number of documents.

MongoDB provides:

Projection
To control which fields are returned.

sort()
To order results.

limit()
To restrict how many documents are returned.

skip()
To ignore a number of documents before returning results.`,

      coreConcept: `Example:

db.users.find(
  { active: true },
  { name: 1, email: 1, _id: 0 }
)
.sort({ createdAt: -1 })
.limit(10)

This means:

1. Match active users.
2. Return only name and email.
3. Exclude _id.
4. Sort newest first.
5. Return only 10 documents.`,

      detailedExplanation: `PROJECTION

A projection controls which fields MongoDB returns.

In an inclusion projection:

{
  name: 1,
  email: 1
}

MongoDB returns those fields plus _id by default unless _id is explicitly excluded.

Example:

db.users.find(
  { active: true },
  {
    name: 1,
    email: 1,
    _id: 0
  }
)

MongoDB generally does not allow mixing inclusion and exclusion fields in the same projection, except for special cases such as excluding _id.

SORT

sort() orders results.

Ascending:

{ createdAt: 1 }

Descending:

{ createdAt: -1 }

Sorting can be very efficient when an appropriate index supports both filtering and ordering.

Without suitable index support, MongoDB may need to perform an in-memory or blocking sort.

LIMIT

limit(10)

returns at most 10 documents.

This can greatly reduce application/network work, but a limit does not automatically make the underlying scan efficient.

For example, MongoDB may still inspect many records before finding 10 matching documents if the filter is poorly indexed.

SKIP

skip(100)

tells MongoDB to discard the first 100 results.

This is simple for small offsets.

However, very large skip values can become inefficient because MongoDB must advance past earlier results before returning the desired page.

For deep pagination, range-based pagination using a stable indexed value such as _id or createdAt is often more scalable.`,

      internalWorking: `Query:

find(filter, projection)
   |
   v
Locate matching records
   |
   v
Apply sort
   |
   v
Skip N results
   |
   v
Limit result count
   |
   v
Apply / produce projection
   |
   v
Return results

Exact execution details depend on the winning query plan.

If an index provides the required order:

Index
  |
  v
Already ordered results

Otherwise:

Matching data
   |
   v
Sort stage
   |
   v
Ordered results`,

      architecture: `Filter
  |
  v
Query Planner
  |
  +--> Suitable Index
  |       |
  |       +--> Filter
  |       +--> Sort order
  |
  +--> Other access path
          |
          +--> possible blocking sort
  |
  v
Projection
  |
  v
Limit / Pagination
  |
  v
Client`,

      examples: [
        `Projection:

db.employees.find(
  { department: "Database" },
  { name: 1, role: 1, _id: 0 }
)`,

        `Sort ascending:

db.orders.find({}).sort({
  amount: 1
})`,

        `Sort descending and limit:

db.orders.find({})
  .sort({ createdAt: -1 })
  .limit(20)`,

        `Simple pagination:

db.orders.find({})
  .sort({ _id: 1 })
  .skip(100)
  .limit(20)`
      ],

      commands: [
        {
          command:
            'db.users.find({ active: true }, { name: 1, email: 1, _id: 0 })',
          explanation:
            'Returns only selected fields from matching documents.'
        },
        {
          command:
            'db.orders.find({ status: "OPEN" }).sort({ createdAt: -1 }).limit(20)',
          explanation:
            'Returns the 20 newest matching orders.'
        },
        {
          command:
            'db.orders.find({}).sort({ _id: 1 }).skip(1000).limit(50)',
          explanation:
            'Shows offset-based pagination. Large skip values can become inefficient.'
        }
      ],

      productionScenario: `An API displays transaction history using:

skip(pageNumber * 100)

As customers accumulate millions of transactions, deep pages become slower.

The filter and sort are indexed, but the application requests:

skip(500000)

MongoDB still needs to advance through a large number of index entries before returning the requested page.

The DBA recommends cursor/range-based pagination.

For example:

db.transactions.find({
  customerId: 1001,
  _id: {
    $gt: lastSeenId
  }
})
.sort({
  _id: 1
})
.limit(100)

This avoids repeatedly traversing enormous offsets.`,

      troubleshootingApproach: `For projection/sort/pagination issues:

1. Capture filter, projection, sort, skip, and limit.

2. Run explain("executionStats").

3. Check whether sort is supported by an index.

4. Look for a SORT stage.

5. Check totalKeysExamined and totalDocsExamined.

6. Compare nReturned.

7. Check skip size.

8. Check result document size.

9. Verify whether the application actually needs every returned field.

10. For deep pagination, evaluate range-based pagination.

11. Ensure ordering is stable if pagination correctness matters.

12. Test the complete query rather than evaluating filter and sort separately.`,

      commonMistakes: [
        'Assuming projection automatically means MongoDB reads less data from storage in every plan.',
        'Using large skip values for deep pagination.',
        'Sorting large result sets without index support.',
        'Forgetting that _id is included by default in inclusion projections.',
        'Using limit and assuming the underlying query is automatically efficient.'
      ],

      bestPractices: [
        'Return only fields the application needs.',
        'Design indexes to support common filter-plus-sort patterns.',
        'Use limit for bounded result sets.',
        'Prefer range-based pagination for deep datasets.',
        'Use explain to verify sort and scan behaviour.'
      ],

      interviewAnswer: `Projection controls returned fields, sort controls result order, limit restricts the number of returned documents, and skip discards a number of results before returning data.

For production performance I verify whether indexes support the filter and sort, avoid unnecessary fields, and avoid large skip-based pagination because large offsets can require MongoDB to advance through many records or index entries.`,

      keyTakeaways: [
        'Projection reduces returned fields.',
        'Indexes can support sorting efficiently.',
        'limit bounds result count.',
        'Large skip values can be expensive.',
        'Pagination design matters at scale.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 7,
    question:
      'How do queries work with nested documents and dot notation in MongoDB?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `MongoDB documents can contain documents inside other documents.

These are called embedded or nested documents.

To query a field inside a nested document, MongoDB commonly uses dot notation.`,

      coreConcept: `Example document:

{
  name: "Vivek",
  address: {
    city: "Bengaluru",
    state: "Karnataka",
    pincode: 560001
  }
}

To query city:

db.users.find({
  "address.city": "Bengaluru"
})

The dot means:

Look inside address and then inspect city.`,

      detailedExplanation: `Dot notation is fundamental when working with embedded MongoDB documents.

Suppose a document contains:

{
  employeeId: 1001,
  profile: {
    department: "Database",
    experience: {
      mongodb: 4,
      linux: 5
    }
  }
}

You can query:

db.employees.find({
  "profile.department": "Database"
})

Or deeper:

db.employees.find({
  "profile.experience.mongodb": {
    $gte: 3
  }
})

Dot notation is also used in:

• Updates
• Index definitions
• Projections
• Sorts
• Aggregation expressions

For example, an index can be created on:

{
  "profile.department": 1
}

A major distinction exists between querying a complete embedded document and querying one nested field.

Example:

db.users.find({
  address: {
    city: "Bengaluru",
    state: "Karnataka"
  }
})

This is an equality match against the embedded document structure and can depend on exact content and field ordering semantics.

It is different from:

db.users.find({
  "address.city": "Bengaluru",
  "address.state": "Karnataka"
})

The second form independently matches the nested fields and is normally clearer for this requirement.`,

      internalWorking: `Document:

{
  profile: {
    experience: {
      mongodb: 4
    }
  }
}

Path:

profile.experience.mongodb

MongoDB traverses:

profile
   |
   v
experience
   |
   v
mongodb
   |
   v
4

Then evaluates:

4 >= requested condition`,

      architecture: `Document
 |
 +-- profile
      |
      +-- department
      |
      +-- experience
            |
            +-- mongodb
            |
            +-- linux


Query path:

"profile.experience.mongodb"`,

      examples: [
        `Nested equality:

db.users.find({
  "address.city": "Bengaluru"
})`,

        `Nested range:

db.employees.find({
  "profile.experience.mongodb": {
    $gte: 3
  }
})`,

        `Nested projection:

db.users.find(
  {},
  {
    "address.city": 1,
    _id: 0
  }
)`,

        `Nested index:

db.users.createIndex({
  "address.city": 1
})`
      ],

      commands: [
        {
          command:
            'db.users.find({ "address.city": "Bengaluru" })',
          explanation:
            'Queries a nested field using dot notation.'
        },
        {
          command:
            'db.users.createIndex({ "address.city": 1 })',
          explanation:
            'Creates an index on a nested field.'
        },
        {
          command:
            'db.users.updateOne({ _id: 1 }, { $set: { "address.city": "Pune" } })',
          explanation:
            'Updates one nested field without replacing the entire address document.'
        }
      ],

      productionScenario: `A collection stores customer information as:

{
  customerId: 1001,
  contact: {
    email: "a@example.com",
    phone: "9999999999"
  }
}

The application frequently searches by:

"contact.email"

but the collection has only an index on customerId.

As data grows, email lookups become expensive.

The DBA identifies the query pattern and evaluates creating:

{
  "contact.email": 1
}

This demonstrates that embedded fields are fully queryable and indexable, but index design still needs to match workload patterns.`,

      troubleshootingApproach: `For nested-field query problems:

1. Inspect the actual stored document shape.

2. Confirm the field path.

3. Check capitalization and spelling.

4. Check whether documents have inconsistent nesting.

5. Check BSON types.

6. Run explain.

7. Verify indexes on the correct dotted path.

8. Distinguish full embedded-document equality from individual nested-field predicates.

9. Check whether arrays exist in the path, because that can affect multikey behaviour.

10. Validate results against representative documents.`,

      commonMistakes: [
        'Using the wrong dotted field path.',
        'Assuming an index on the parent object indexes every nested field automatically.',
        'Comparing the complete embedded document when only one nested field was intended.',
        'Ignoring arrays inside nested structures.',
        'Having inconsistent document shapes across the collection.'
      ],

      bestPractices: [
        'Use clear and consistent embedded-document schemas.',
        'Index nested fields according to real query patterns.',
        'Prefer precise dot-notation predicates.',
        'Verify nested BSON types.',
        'Consider array/multikey implications when indexing nested paths.'
      ],

      interviewAnswer: `MongoDB uses dot notation to access fields inside embedded documents.

For example, "address.city" queries the city field inside address.

The same dotted paths can be used in queries, updates, projections, sorts, and indexes.

For performance I ensure the exact nested query path has appropriate index support and verify whether arrays in that path introduce multikey behaviour.`,

      keyTakeaways: [
        'Dot notation accesses nested fields.',
        'Nested fields can be indexed.',
        'Full embedded-document equality differs from nested-field predicates.',
        'Schema consistency matters.',
        'Arrays in dotted paths can change index behaviour.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 8,
    question:
      'How does MongoDB query arrays, and what is the difference between matching an array value and using $elemMatch?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `MongoDB documents can contain arrays.

Example:

{
  name: "Vivek",
  skills: [
    "MongoDB",
    "Linux",
    "AWS"
  ]
}

MongoDB can search inside arrays directly.

For example:

db.users.find({
  skills: "MongoDB"
})

matches documents whose skills array contains MongoDB.`,

      coreConcept: `Simple array membership can often be queried using normal equality.

For arrays of embedded documents or when multiple conditions must apply to the same array element, $elemMatch becomes important.

Example:

{
  scores: [
    { subject: "MongoDB", score: 90 },
    { subject: "Linux", score: 75 }
  ]
}

Query:

{
  scores: {
    $elemMatch: {
      subject: "MongoDB",
      score: { $gte: 80 }
    }
  }
}

requires both conditions to match the same array element.`,

      detailedExplanation: `There are several important array-query patterns.

SIMPLE ARRAY MEMBERSHIP

Document:

{
  tags: [
    "prod",
    "mongodb",
    "critical"
  ]
}

Query:

db.servers.find({
  tags: "mongodb"
})

matches the document.

EXACT ARRAY MATCH

Query:

db.servers.find({
  tags: [
    "prod",
    "mongodb",
    "critical"
  ]
})

is different.

It attempts to match the array as a whole, including element order.

ARRAY OF EMBEDDED DOCUMENTS

Consider:

{
  results: [
    {
      subject: "MongoDB",
      score: 95
    },
    {
      subject: "Linux",
      score: 60
    }
  ]
}

Now consider:

db.students.find({
  "results.subject": "MongoDB",
  "results.score": {
    $gte: 90
  }
})

Without $elemMatch, separate array elements may satisfy different conditions.

If the business requirement is:

The SAME result element must have subject MongoDB AND score >= 90

use:

db.students.find({
  results: {
    $elemMatch: {
      subject: "MongoDB",
      score: {
        $gte: 90
      }
    }
  }
})

This distinction is extremely important in production because a query can return logically incorrect results while still being syntactically valid.`,

      internalWorking: `Array:

results = [
  { subject: "MongoDB", score: 70 },
  { subject: "Linux", score: 95 }
]


Without $elemMatch:

subject = MongoDB
       |
       +--> element 1 matches

score >= 90
       |
       +--> element 2 matches

Document may satisfy separate dotted predicates.


With $elemMatch:

Find ONE element where:

subject = MongoDB
AND
score >= 90

No single element qualifies.

Therefore:
No match.`,

      architecture: `Document
 |
 +-- results[]
       |
       +-- Element 1
       |     subject
       |     score
       |
       +-- Element 2
             subject
             score


$elemMatch

       |
       v

Apply all predicates
to one array element`,

      examples: [
        `Array membership:

db.users.find({
  skills: "MongoDB"
})`,

        `Exact array equality:

db.users.find({
  skills: [
    "MongoDB",
    "Linux"
  ]
})`,

        `$elemMatch:

db.students.find({
  results: {
    $elemMatch: {
      subject: "MongoDB",
      score: {
        $gte: 80
      }
    }
  }
})`
      ],

      commands: [
        {
          command:
            'db.users.find({ skills: "MongoDB" })',
          explanation:
            'Matches documents where the skills array contains MongoDB.'
        },
        {
          command:
            'db.students.find({ results: { $elemMatch: { subject: "MongoDB", score: { $gte: 80 } } } })',
          explanation:
            'Requires subject and score conditions to be satisfied by the same array element.'
        },
        {
          command:
            'db.users.createIndex({ skills: 1 })',
          explanation:
            'Creates an index on an array field, which becomes a multikey index.'
        }
      ],

      productionScenario: `An e-commerce document contains:

{
  offers: [
    {
      seller: "A",
      price: 1000
    },
    {
      seller: "B",
      price: 500
    }
  ]
}

The application wants products where seller A offers price below 700.

It queries:

{
  "offers.seller": "A",
  "offers.price": {
    $lt: 700
  }
}

The seller condition matches the first element.

The price condition matches the second.

The document can therefore match even though seller A does not offer a price below 700.

The correct business query is:

{
  offers: {
    $elemMatch: {
      seller: "A",
      price: {
        $lt: 700
      }
    }
  }
}

This is a classic MongoDB array-query correctness issue.`,

      troubleshootingApproach: `For array-query issues:

1. Inspect actual array contents.

2. Determine whether the query wants membership, exact array equality, or same-element matching.

3. Check whether multiple dotted predicates may match separate elements.

4. Use $elemMatch where same-element semantics are required.

5. Run test queries against carefully designed sample documents.

6. Check indexes.

7. Understand multikey index behaviour.

8. Check array size.

9. Check whether arrays are unbounded.

10. Validate business correctness before optimizing performance.`,

      commonMistakes: [
        'Confusing array membership with exact array equality.',
        'Forgetting that multiple dotted predicates may match different array elements.',
        'Using $elemMatch unnecessarily for simple membership.',
        'Ignoring multikey-index behaviour.',
        'Allowing unbounded arrays to grow indefinitely.'
      ],

      bestPractices: [
        'Use $elemMatch when predicates must apply to one array element.',
        'Keep array schemas predictable.',
        'Understand multikey indexes.',
        'Avoid uncontrolled array growth.',
        'Test array queries using cases where different elements satisfy different conditions.'
      ],

      interviewAnswer: `MongoDB can match a scalar value directly against an array field to test membership.

For multiple conditions on an array of embedded documents, $elemMatch is important when all conditions must apply to the same array element.

Without $elemMatch, separate array elements can sometimes satisfy separate dotted predicates, which can produce logically incorrect results.`,

      keyTakeaways: [
        'MongoDB supports direct array membership queries.',
        'Exact array equality has different semantics.',
        '$elemMatch enforces same-element matching.',
        'Array indexes become multikey indexes.',
        'Query correctness is especially important with arrays.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 9,
    question:
      'How do $exists, $type, and null queries work, and how do you distinguish missing fields from fields containing null?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `MongoDB has a flexible document model.

That means one document may contain a field while another document may not.

A field may also explicitly contain the value null.

These are different states:

Field exists with a value.

Field exists with null.

Field does not exist.`,

      coreConcept: `$exists checks whether a field is present.

Example:

{
  email: {
    $exists: true
  }
}

$type checks the BSON type.

Example:

{
  age: {
    $type: "int"
  }
}

A query such as:

{
  middleName: null
}

has special semantics and can match documents where middleName is null as well as documents where the field is missing.

Therefore $exists is important when the distinction matters.`,

      detailedExplanation: `Consider three documents:

Document A:

{
  name: "A",
  phone: "9999"
}

Document B:

{
  name: "B",
  phone: null
}

Document C:

{
  name: "C"
}

Query:

db.users.find({
  phone: {
    $exists: true
  }
})

matches A and B.

Query:

db.users.find({
  phone: {
    $exists: false
  }
})

matches C.

Query:

db.users.find({
  phone: null
})

can match both:

phone explicitly equals null

and:

phone is missing

If the requirement is specifically:

phone exists and is null

you can combine conditions such as:

{
  phone: {
    $type: 10
  }
}

or use an appropriate exists/type combination depending on the requirement and MongoDB version.

$type is particularly useful when schema inconsistency exists.

For example:

age: 30

and:

age: "30"

are different BSON types.

A DBA can use $type queries to discover inconsistent stored types before correcting the application schema.`,

      internalWorking: `Possible field states:

Document A:
phone = "9999"
   |
   +--> exists = true
   +--> type = string

Document B:
phone = null
   |
   +--> exists = true
   +--> type = null

Document C:
phone absent
   |
   +--> exists = false


Query:

{ phone: null }

can include:
explicit null
+
missing field`,

      architecture: `Flexible Schema

Document 1 --> field exists, string
Document 2 --> field exists, null
Document 3 --> field missing
Document 4 --> field exists, number

                |
                v

$exists / $type

                |
                v

Schema investigation`,

      examples: [
        `Field exists:

db.users.find({
  email: {
    $exists: true
  }
})`,

        `Field missing:

db.users.find({
  email: {
    $exists: false
  }
})`,

        `Find string values:

db.users.find({
  age: {
    $type: "string"
  }
})`,

        `Null-style query:

db.users.find({
  middleName: null
})`
      ],

      commands: [
        {
          command:
            'db.users.find({ email: { $exists: false } })',
          explanation:
            'Finds documents where the email field is absent.'
        },
        {
          command:
            'db.users.find({ age: { $type: "string" } })',
          explanation:
            'Finds documents where age is stored as a BSON string.'
        },
        {
          command:
            'db.users.find({ phone: { $type: "null" } })',
          explanation:
            'Finds documents whose phone field explicitly contains BSON null on supported versions.'
        }
      ],

      productionScenario: `An application assumes every customer has:

createdAt: BSON Date

A migration accidentally inserted millions of documents with:

createdAt: "2026-08-01"

as strings.

Queries using date ranges begin returning incomplete results and indexes behave differently from expectations.

The DBA investigates with type-based queries:

db.customers.find({
  createdAt: {
    $type: "string"
  }
})

This confirms schema inconsistency.

The fix requires more than changing the query.

The DBA should:

• identify affected documents
• correct the application writer
• plan safe data conversion
• validate indexes and queries afterward`,

      troubleshootingApproach: `For missing/null/type issues:

1. Inspect representative documents.

2. Determine whether the field is missing, null, or another BSON type.

3. Use $exists.

4. Use $type.

5. Check schema validation.

6. Check application serialization.

7. Check whether historical documents follow a different schema.

8. Verify indexes.

9. Estimate affected document count.

10. Correct the application before bulk-fixing historical data.

11. Test query semantics on missing fields.

12. Avoid assuming null and missing mean the same business state.`,

      commonMistakes: [
        'Assuming field: null means only explicit null values.',
        'Ignoring missing fields.',
        'Ignoring mixed BSON types.',
        'Repairing historical documents while the application continues writing bad data.',
        'Treating flexible schema as permission for uncontrolled type inconsistency.'
      ],

      bestPractices: [
        'Define expected field types.',
        'Use schema validation where appropriate.',
        'Use $exists and $type during data-quality investigations.',
        'Correct the writer before repairing old data.',
        'Define clear application semantics for null versus missing.'
      ],

      interviewAnswer: `$exists checks whether a field is present and $type checks its BSON type.

A query such as { field: null } can match explicit null values as well as missing fields, so when the distinction matters I use $exists or type-aware predicates.

These operators are also very useful for detecting schema drift and mixed BSON types in production collections.`,

      keyTakeaways: [
        'Missing and null are different document states.',
        '$exists checks field presence.',
        '$type checks BSON type.',
        'A null equality query can include missing fields.',
        'Type queries are useful for detecting schema inconsistencies.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 10,
    question:
      'How do regular-expression queries work in MongoDB, and why can regex queries become expensive?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A regular expression, or regex, searches text using a pattern instead of one exact value.

For example:

Find usernames beginning with "viv".

MongoDB supports regular-expression queries on string fields.`,

      coreConcept: `Example:

db.users.find({
  username: {
    $regex: "^viv"
  }
})

The caret:

^

means the value should begin with the supplied pattern.

Regex flexibility is useful, but query performance can vary dramatically depending on the pattern, index, collation, and workload.`,

      detailedExplanation: `A regular-expression query can be written in different supported forms.

Example:

db.users.find({
  username: /^viv/
})

or:

db.users.find({
  username: {
    $regex: "^viv"
  }
})

A prefix-anchored regex can sometimes make useful use of an index.

For example:

^vivek

provides a known starting prefix.

By contrast:

.*vivek

or an unanchored pattern such as:

vivek

may require MongoDB to inspect a much broader range of values.

Case-insensitive regex also has important performance and collation considerations.

Regex queries are not a replacement for a dedicated search system for every text-search use case.

For example, substring search across very large text fields may be better addressed with purpose-built search functionality depending on requirements.

A DBA should evaluate regex using explain rather than assuming that an index on the string field guarantees efficient execution.`,

      internalWorking: `Prefix pattern:

^vivek

Possible index behaviour:

Index keys
   |
   v
Relevant prefix range
   |
   v
Pattern validation
   |
   v
Matches


Unanchored pattern:

vivek

Index or collection
   |
   v
Potentially broad examination
   |
   v
Regex evaluation
   |
   v
Matches`,

      architecture: `Regex Query
   |
   v
Pattern shape
   |
   +--> Anchored prefix
   |       |
   |       +--> potentially efficient index range
   |
   +--> Unanchored / complex
           |
           +--> potentially broad scan
   |
   v
Query execution`,

      examples: [
        `Prefix:

db.users.find({
  username: /^viv/
})`,

        `Case-insensitive example:

db.users.find({
  username: {
    $regex: "^vivek",
    $options: "i"
  }
})`,

        `Potentially expensive substring-style query:

db.users.find({
  username: {
    $regex: "ive"
  }
})`
      ],

      commands: [
        {
          command:
            'db.users.find({ username: { $regex: "^viv" } })',
          explanation:
            'Performs a prefix-style regex query.'
        },
        {
          command:
            'db.users.find({ username: { $regex: "vivek", $options: "i" } })',
          explanation:
            'Performs a case-insensitive regex query.'
        },
        {
          command:
            'db.users.find({ username: /^viv/ }).explain("executionStats")',
          explanation:
            'Shows how MongoDB executes the regex query and whether the index meaningfully narrows the scan.'
        }
      ],

      productionScenario: `An application's customer-search API executes:

{
  name: {
    $regex: searchText,
    $options: "i"
  }
}

against 100 million customers.

Users can supply arbitrary substrings.

As traffic grows:

• CPU increases
• keys examined increases
• documents examined increases
• latency becomes unpredictable

The DBA discovers the application expects Google-like substring search from a normal B-tree indexed field.

The problem is architectural.

The team needs to define actual search requirements and evaluate a suitable indexed/query or dedicated search design instead of relying on arbitrary regex at scale.`,

      troubleshootingApproach: `For slow regex queries:

1. Capture the exact pattern.

2. Determine whether it is prefix anchored.

3. Check case-sensitivity requirements.

4. Run explain("executionStats").

5. Check IXSCAN versus COLLSCAN.

6. Check totalKeysExamined.

7. Check totalDocsExamined.

8. Check nReturned.

9. Check CPU utilization.

10. Check how much user input can expand the pattern.

11. Determine whether the requirement is exact lookup, prefix search, text search, or arbitrary substring search.

12. Redesign the search mechanism if a normal indexed regex is not appropriate.`,

      commonMistakes: [
        'Assuming every regex can efficiently use an index.',
        'Using leading wildcards on huge collections.',
        'Using case-insensitive regex without testing actual execution.',
        'Allowing arbitrary user regex patterns without considering cost.',
        'Using regex as a general-purpose search engine.'
      ],

      bestPractices: [
        'Prefer exact queries when possible.',
        'Use prefix patterns where they meet requirements.',
        'Always explain important regex queries.',
        'Control application search patterns.',
        'Use an appropriate search technology for complex full-text or substring requirements.'
      ],

      interviewAnswer: `MongoDB supports regex queries on string fields.

Prefix-anchored regex patterns can sometimes use indexes effectively because MongoDB can narrow the index range.

Unanchored, complex, or case-insensitive patterns may examine much larger portions of an index or collection.

I always check explain statistics and determine whether the application really needs exact lookup, prefix search, or a dedicated text-search solution.`,

      keyTakeaways: [
        'Regex enables pattern matching.',
        'Pattern structure strongly affects performance.',
        'Prefix anchoring can be much more index-friendly.',
        'An index does not guarantee every regex is efficient.',
        'Arbitrary substring search may require a different search architecture.'
      ]
    }
  },
  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 11,
    question:
      'How do updateOne() and updateMany() work, and what is the difference between matchedCount and modifiedCount?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `MongoDB update operations modify documents that already exist.

The two common methods are:

updateOne()
Updates at most one matching document.

updateMany()
Updates every document matching the filter.

Both normally contain two important parts:

1. Filter
2. Update specification`,

      coreConcept: `Example:

db.employees.updateOne(
  {
    employeeId: 1001
  },
  {
    $set: {
      department: "Database"
    }
  }
)

The first document is the filter.

The second document describes the change.

For multiple documents:

db.employees.updateMany(
  {
    department: "Database"
  },
  {
    $set: {
      active: true
    }
  }
)`,

      detailedExplanation: `The result of an update operation contains useful information.

Conceptually, important fields include:

matchedCount

How many documents matched the filter.

modifiedCount

How many documents were actually changed.

For example, suppose:

100 documents match:

{
  active: true
}

but all 100 already contain:

{
  status: "ACTIVE"
}

If you execute:

db.users.updateMany(
  {
    active: true
  },
  {
    $set: {
      status: "ACTIVE"
    }
  }
)

MongoDB may report:

matchedCount: 100

modifiedCount: 0

because the documents matched but the requested value was already present.

This distinction is extremely useful during troubleshooting.

matchedCount = 0

usually indicates that the filter did not match a document.

matchedCount > 0 and modifiedCount = 0

can indicate that the requested modification did not result in a change.

Another critical distinction is updateOne versus updateMany.

If multiple documents match an updateOne filter, only one matching document is updated.

Therefore, if the business requirement identifies one unique entity, the filter should ideally use a unique identifier rather than depending on updateOne to protect against ambiguous data.`,

      internalWorking: `updateOne(filter, update)

        |
        v

Evaluate filter

        |
        v

Find matching document

        |
        v

Apply update operators

        |
        v

Update affected indexes if necessary

        |
        v

Storage / durability / replication


updateMany(filter, update)

        |
        v

Find matching documents

        |
        v

Apply update to each match

        |
        v

Return matchedCount / modifiedCount`,

      architecture: `Example:

Collection

Document A ---> matches
Document B ---> matches
Document C ---> no match

updateOne()

One matching document changed


updateMany()

Document A changed
Document B changed`,

      examples: [
        `Update one:

db.users.updateOne(
  { userId: 1001 },
  { $set: { active: false } }
)`,

        `Update many:

db.users.updateMany(
  { department: "Database" },
  { $set: { location: "Bengaluru" } }
)`,

        `Validate filter before update:

db.users.find({
  userId: 1001
})`
      ],

      commands: [
        {
          command:
            'db.users.updateOne({ userId: 1001 }, { $set: { active: false } })',
          explanation:
            'Updates at most one document matching userId 1001.'
        },
        {
          command:
            'db.users.updateMany({ status: "PENDING" }, { $set: { reviewed: false } })',
          explanation:
            'Updates all documents matching the PENDING status filter.'
        },
        {
          command:
            'db.users.countDocuments({ status: "PENDING" })',
          explanation:
            'Can be used to understand the scope of a filter before a planned multi-document update.'
        }
      ],

      productionScenario: `A production change is expected to modify 50,000 documents.

The command completes successfully but reports:

matchedCount: 50000
modifiedCount: 0

The DBA should not immediately assume MongoDB failed.

Possible explanation:

All 50,000 documents already contain the requested value.

The DBA should inspect representative documents and verify the update specification.

In another case:

matchedCount: 0

could indicate:

• incorrect filter
• wrong BSON type
• wrong database
• wrong collection
• unexpected field name
• data not present

The result metadata therefore provides important troubleshooting evidence.`,

      troubleshootingApproach: `For update problems:

1. Confirm the database and collection.

2. Run find() with the same filter.

3. Check how many documents match.

4. Verify BSON types.

5. Check whether updateOne or updateMany is appropriate.

6. Inspect matchedCount.

7. Inspect modifiedCount.

8. Check write errors and write concern errors.

9. Determine whether indexed fields are being changed.

10. Monitor performance for large updates.

11. Verify representative documents after completion.

12. Check replication health when production writes behave unexpectedly.`,

      commonMistakes: [
        'Confusing matchedCount with modifiedCount.',
        'Using updateMany when only one document should change.',
        'Using a broad or empty filter.',
        'Assuming modifiedCount zero means the command failed.',
        'Not validating the target documents before a large update.'
      ],

      bestPractices: [
        'Validate important filters with find first.',
        'Use unique identifiers for single-entity updates.',
        'Inspect matchedCount and modifiedCount.',
        'Batch very large maintenance updates when appropriate.',
        'Verify the final state after production changes.'
      ],

      interviewAnswer: `updateOne modifies at most one matching document while updateMany modifies all matching documents.

matchedCount tells me how many documents satisfied the filter, while modifiedCount tells me how many were actually changed.

A modifiedCount of zero does not necessarily mean failure because the matching documents may already contain the requested values.`,

      keyTakeaways: [
        'The filter controls update scope.',
        'updateOne affects at most one match.',
        'updateMany affects all matches.',
        'matchedCount and modifiedCount have different meanings.',
        'Large production updates require scope validation and monitoring.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 12,
    question:
      'How do MongoDB update operators such as $set, $unset, $inc, $mul, $min, $max, and $rename work?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `MongoDB normally does not require you to replace an entire document just to change one field.

Update operators describe exactly what should change.

Common operators include:

$set
Set or replace a field value.

$unset
Remove a field.

$inc
Increase or decrease a numeric value.

$mul
Multiply a numeric value.

$min
Update only when the supplied value is lower according to BSON comparison semantics.

$max
Update only when the supplied value is higher.

$rename
Rename a field.`,

      coreConcept: `Example:

db.accounts.updateOne(
  {
    accountId: 1001
  },
  {
    $inc: {
      loginCount: 1
    },
    $set: {
      lastLogin: new Date()
    }
  }
)

This performs multiple field changes in one update operation on the selected document.`,

      detailedExplanation: `$set

Changes a field or creates it if it does not exist.

Example:

{
  $set: {
    status: "ACTIVE"
  }
}

$unset

Removes a field.

Example:

{
  $unset: {
    temporaryField: ""
  }
}

$inc

Changes a numeric field by a specified amount.

Increment:

{
  $inc: {
    attempts: 1
  }
}

Decrement:

{
  $inc: {
    balance: -100
  }
}

$mul

Multiplies a numeric field.

Example:

{
  $mul: {
    price: 1.05
  }
}

$min

Changes the field only if the specified value compares lower than the current value.

$max

Changes the field only if the specified value compares higher.

$rename

Changes a field name.

For example:

{
  $rename: {
    mobile: "phone"
  }
}

Update operators are important because they allow targeted modifications.

They also help avoid application-side read-modify-write patterns for operations such as counters.

For example, this application pattern can create concurrency problems:

1. Read counter = 10
2. Application calculates 11
3. Write counter = 11

If multiple clients do this concurrently, updates can overwrite each other.

Using:

{
  $inc: {
    counter: 1
  }
}

allows MongoDB to perform the increment as part of the atomic single-document update.`,

      internalWorking: `Target document:

{
  userId: 1001,
  loginCount: 10,
  status: "PENDING"
}

Update:

{
  $inc: { loginCount: 1 },
  $set: { status: "ACTIVE" }
}

            |
            v

MongoDB applies operators

            |
            v

{
  userId: 1001,
  loginCount: 11,
  status: "ACTIVE"
}`,

      architecture: `Application
    |
    v
Update Filter
    |
    v
Matching Document
    |
    +--> $set
    +--> $inc
    +--> $unset
    +--> other operators
    |
    v
Updated Document
    |
    v
Index maintenance if indexed values changed
    |
    v
Storage / Replication`,

      examples: [
        `Set a field:

db.users.updateOne(
  { userId: 1001 },
  { $set: { city: "Bengaluru" } }
)`,

        `Increment a counter:

db.users.updateOne(
  { userId: 1001 },
  { $inc: { loginCount: 1 } }
)`,

        `Remove a field:

db.users.updateOne(
  { userId: 1001 },
  { $unset: { temporaryFlag: "" } }
)`,

        `Rename a field:

db.users.updateMany(
  {},
  { $rename: { mobile: "phone" } }
)`
      ],

      commands: [
        {
          command:
            'db.accounts.updateOne({ accountId: 1001 }, { $inc: { attempts: 1 } })',
          explanation:
            'Atomically increments attempts within the matched document.'
        },
        {
          command:
            'db.users.updateOne({ userId: 1001 }, { $unset: { oldField: "" } })',
          explanation:
            'Removes oldField from the matched document.'
        },
        {
          command:
            'db.metrics.updateOne({ name: "peak" }, { $max: { value: 500 } })',
          explanation:
            'Updates value only when the supplied value compares greater than the existing value.'
        }
      ],

      productionScenario: `An application maintains a request counter.

The developers originally implement:

document = findOne(...)
document.count = document.count + 1
updateOne(..., { $set: { count: document.count } })

Under concurrency, multiple application threads can read the same old value and overwrite each other's changes.

The DBA recommends:

db.metrics.updateOne(
  { _id: metricId },
  {
    $inc: {
      count: 1
    }
  }
)

The increment occurs as part of the atomic update to that document, avoiding the application's separate read-modify-write race for this counter.`,

      troubleshootingApproach: `For update-operator issues:

1. Inspect the existing field value.

2. Check the BSON type.

3. Verify the operator supports that type.

4. Confirm the filter.

5. Check whether the field exists.

6. Check schema validation.

7. Check whether the field participates in indexes.

8. Review matchedCount and modifiedCount.

9. Test the update on representative non-production data where possible.

10. For counters, check whether application-side read-modify-write logic should be replaced with atomic operators.

11. For large $rename or migration operations, estimate the production impact.

12. Verify the resulting schema after the update.`,

      commonMistakes: [
        'Using $inc on incompatible field types.',
        'Performing application-side counter updates unnecessarily.',
        'Using $unset without understanding that the field is removed rather than set to null.',
        'Running broad $rename operations without planning.',
        'Ignoring index maintenance caused by field changes.'
      ],

      bestPractices: [
        'Use targeted update operators.',
        'Use $inc for atomic counters.',
        'Validate field types before bulk changes.',
        'Test schema-changing operations carefully.',
        'Monitor large update workloads.'
      ],

      interviewAnswer: `MongoDB update operators modify specific parts of a document.

$set changes a value, $unset removes a field, $inc changes a numeric value, $mul multiplies it, $min and $max conditionally replace values, and $rename changes a field name.

Operators such as $inc are particularly useful because they avoid unnecessary application-side read-modify-write logic for single-document counters.`,

      keyTakeaways: [
        'Update operators target specific fields.',
        '$unset removes a field.',
        '$inc is useful for counters.',
        'Single-document updates are atomic.',
        'Field type and index impact should be considered.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 13,
    question:
      'How do MongoDB array update operators such as $push, $addToSet, $pull, $pop, and positional operators work?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `MongoDB can modify individual array contents without replacing the entire document.

Common array update operators include:

$push
Append a value.

$addToSet
Add a value only when it is not already present according to MongoDB's equality semantics.

$pull
Remove matching values.

$pop
Remove the first or last array element.

MongoDB also provides positional update mechanisms for modifying specific array elements.`,

      coreConcept: `Example:

{
  userId: 1001,
  skills: [
    "Linux",
    "MongoDB"
  ]
}

Add another skill:

db.users.updateOne(
  { userId: 1001 },
  {
    $push: {
      skills: "AWS"
    }
  }
)

Prevent duplicate skill:

db.users.updateOne(
  { userId: 1001 },
  {
    $addToSet: {
      skills: "MongoDB"
    }
  }
)`,

      detailedExplanation: `$push

Appends a value to an array.

$addToSet

Adds a value only if an equal value is not already present in the array.

$pull

Removes array elements that match a specified condition.

Example:

{
  $pull: {
    skills: "OldTechnology"
  }
}

$pop

Removes one array element.

{
  $pop: {
    skills: 1
  }
}

removes the last element.

{
  $pop: {
    skills: -1
  }
}

removes the first element.

POSITIONAL $

The positional $ operator can update the first array element matched by the query.

Example document:

{
  studentId: 1,
  scores: [
    {
      subject: "MongoDB",
      score: 70
    },
    {
      subject: "Linux",
      score: 80
    }
  ]
}

Example:

db.students.updateOne(
  {
    studentId: 1,
    "scores.subject": "MongoDB"
  },
  {
    $set: {
      "scores.$.score": 90
    }
  }
)

$[]

The all-positional operator can target all elements of an array.

$[identifier]

Filtered positional updates can target array elements satisfying arrayFilters.

These features are powerful but must be used carefully because array query semantics and update targeting can become complex.`,

      internalWorking: `Document:

skills = [
  "Linux",
  "MongoDB"
]

$push AWS

       |
       v

[
  "Linux",
  "MongoDB",
  "AWS"
]


$pull Linux

       |
       v

[
  "MongoDB",
  "AWS"
]


Filtered positional update:

Array
 |
 +--> Element 1 -- condition false
 |
 +--> Element 2 -- condition true --> update
 |
 +--> Element 3 -- condition true --> update`,

      architecture: `Array Update
    |
    +--> $push
    |
    +--> $addToSet
    |
    +--> $pull
    |
    +--> $pop
    |
    +--> $
    |
    +--> $[]
    |
    +--> $[identifier]
             |
             v
       arrayFilters`,

      examples: [
        `Append:

db.users.updateOne(
  { userId: 1 },
  { $push: { skills: "AWS" } }
)`,

        `Avoid duplicate scalar value:

db.users.updateOne(
  { userId: 1 },
  { $addToSet: { skills: "MongoDB" } }
)`,

        `Remove matching values:

db.users.updateOne(
  { userId: 1 },
  { $pull: { skills: "OldSkill" } }
)`,

        `Filtered positional update:

db.students.updateOne(
  { studentId: 1 },
  {
    $set: {
      "scores.$[item].status": "PASS"
    }
  },
  {
    arrayFilters: [
      {
        "item.score": {
          $gte: 40
        }
      }
    ]
  }
)`
      ],

      commands: [
        {
          command:
            'db.users.updateOne({ userId: 1 }, { $push: { skills: "AWS" } })',
          explanation:
            'Appends AWS to the skills array.'
        },
        {
          command:
            'db.users.updateOne({ userId: 1 }, { $addToSet: { skills: "MongoDB" } })',
          explanation:
            'Adds MongoDB only if an equal value is not already present.'
        },
        {
          command:
            'db.users.updateOne({ userId: 1 }, { $pull: { skills: "Linux" } })',
          explanation:
            'Removes array elements equal to Linux.'
        }
      ],

      productionScenario: `An application stores every login event inside the user's main document:

{
  userId: 1001,
  loginHistory: [
    ...
  ]
}

Every login performs:

$push

After several years, some users have extremely large arrays.

Consequences can include:

• growing document size
• increased read cost
• increased update cost
• larger multikey indexes if the array is indexed
• eventual risk of approaching MongoDB's document size limit

The problem is not $push itself.

The problem is an unbounded data model.

For indefinitely growing event history, a separate collection is often a better design.`,

      troubleshootingApproach: `For array-update problems:

1. Inspect the array structure.

2. Check current array size.

3. Confirm whether duplicates are allowed.

4. Choose $push versus $addToSet appropriately.

5. Verify positional matching.

6. Inspect arrayFilters carefully.

7. Check whether the array is indexed.

8. Check document growth.

9. Check BSON document size.

10. Determine whether the array is bounded.

11. Test multi-element updates before production use.

12. Consider redesigning unbounded historical arrays into separate documents or collections.`,

      commonMistakes: [
        'Using $push when duplicates are not allowed.',
        'Assuming $addToSet performs application-specific deduplication beyond MongoDB equality semantics.',
        'Using positional operators without validating which elements match.',
        'Keeping indefinitely growing event history in one document.',
        'Ignoring multikey-index cost on growing arrays.'
      ],

      bestPractices: [
        'Keep arrays bounded when possible.',
        'Use $addToSet when set-like semantics are appropriate.',
        'Use arrayFilters carefully for targeted updates.',
        'Monitor document growth.',
        'Use separate collections for large unbounded event histories.'
      ],

      interviewAnswer: `$push appends array elements, $addToSet adds values while preventing equal duplicates, $pull removes matching values, and $pop removes the first or last element.

MongoDB also supports positional operators such as $, $[], and $[identifier] for targeted array updates.

From a production perspective, I also watch for unbounded arrays because they can cause document growth, multikey-index overhead, and eventually document-size problems.`,

      keyTakeaways: [
        '$push appends array values.',
        '$addToSet provides set-like insertion.',
        '$pull removes matching elements.',
        'Positional operators support targeted array updates.',
        'Unbounded arrays are an important production design risk.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 14,
    question:
      'What are replaceOne() and upsert, and how are they different from normal update operations?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `Sometimes an application wants to replace almost the entire document rather than change individual fields.

MongoDB provides:

replaceOne()

MongoDB also provides an option called:

upsert

Upsert means:

Update a matching document if one exists.

Otherwise insert a new document.`,

      coreConcept: `Normal targeted update:

db.users.updateOne(
  { userId: 1001 },
  {
    $set: {
      city: "Bengaluru"
    }
  }
)

Only city changes.

Replacement:

db.users.replaceOne(
  { userId: 1001 },
  {
    userId: 1001,
    name: "Vivek",
    city: "Bengaluru"
  }
)

The matched document's contents are replaced by the replacement document, while _id cannot simply be changed to a different value.

Any fields omitted from the replacement document are no longer present afterward.`,

      detailedExplanation: `replaceOne is fundamentally different from an operator-based update.

Suppose the original document is:

{
  _id: 1,
  name: "Vivek",
  city: "Bidar",
  role: "DBA",
  active: true
}

Now execute:

db.users.replaceOne(
  { _id: 1 },
  {
    name: "Vivek",
    city: "Bengaluru"
  }
)

The resulting document conceptually becomes:

{
  _id: 1,
  name: "Vivek",
  city: "Bengaluru"
}

Fields such as:

role

and:

active

are gone because this was a replacement.

UPSERT

Example:

db.settings.updateOne(
  {
    key: "applicationMode"
  },
  {
    $set: {
      value: "production"
    }
  },
  {
    upsert: true
  }
)

If a matching document exists:

update it.

If no matching document exists:

MongoDB constructs and inserts a document based on the update/upsert semantics.

Upsert is useful for:

• configuration
• counters
• idempotent initialization
• synchronization workflows

But poorly designed upsert filters can create unexpected duplicate business records unless uniqueness is enforced appropriately.`,

      internalWorking: `Normal update:

Existing Document
       |
       v
Modify selected fields
       |
       v
Other fields remain


replaceOne:

Existing Document
       |
       v
Replace document body
       |
       v
Omitted fields disappear


upsert:

Filter
 |
 +--> Match found?
       |
       +--> YES --> Update
       |
       +--> NO ---> Insert`,

      architecture: `               WRITE
                 |
       +---------+---------+
       |                   |
       v                   v
     Update              Replace
       |                   |
Modify fields        Replace document


UPsert decision:

Filter
  |
  v
Document exists?
  |
  +-- Yes --> Update
  |
  +-- No ---> Insert`,

      examples: [
        `Replacement:

db.users.replaceOne(
  { userId: 1001 },
  {
    userId: 1001,
    name: "Vivek",
    active: true
  }
)`,

        `Upsert:

db.config.updateOne(
  { key: "maintenanceMode" },
  {
    $set: {
      value: false
    }
  },
  {
    upsert: true
  }
)`
      ],

      commands: [
        {
          command:
            'db.users.replaceOne({ userId: 1001 }, { userId: 1001, name: "Vivek", active: true })',
          explanation:
            'Replaces one matching document. Fields not included in the replacement are removed, except the existing immutable _id remains when not supplied.'
        },
        {
          command:
            'db.config.updateOne({ key: "mode" }, { $set: { value: "production" } }, { upsert: true })',
          explanation:
            'Updates the matching configuration document or inserts one when no match exists.'
        }
      ],

      productionScenario: `A developer intends to change only a customer's city.

Instead of:

$set

the application constructs a partial object and uses replaceOne:

{
  customerId: 1001,
  city: "Bengaluru"
}

The original document also contained:

email
phone
preferences
status
createdAt

After replacement, those omitted fields disappear.

This can become a serious data-loss incident.

The DBA must understand whether an application operation is:

a partial field update

or:

a complete document replacement.

In another scenario, concurrent upserts using a non-unique business filter can create multiple logical records.

A unique index on the appropriate business key is often essential.`,

      troubleshootingApproach: `For replacement/upsert issues:

1. Determine whether the operation was replaceOne or updateOne.

2. Inspect the replacement document.

3. Identify omitted fields.

4. Check application logs.

5. Review backup or historical data if recovery is required.

6. For upsert, inspect upsertedId when available.

7. Check the upsert filter.

8. Check unique indexes.

9. Investigate duplicate business records.

10. Verify retry behaviour.

11. Test concurrent application behaviour.

12. Prefer targeted update operators when full replacement is unnecessary.`,

      commonMistakes: [
        'Using replaceOne when only one field should change.',
        'Forgetting that omitted fields disappear during replacement.',
        'Using broad upsert filters.',
        'Assuming upsert automatically prevents logical duplicates.',
        'Not enforcing business uniqueness with appropriate indexes.'
      ],

      bestPractices: [
        'Use $set for targeted field changes.',
        'Use replaceOne only when replacement is intentional.',
        'Use precise upsert filters.',
        'Enforce required uniqueness with unique indexes.',
        'Test retry and concurrency behaviour for upserts.'
      ],

      interviewAnswer: `replaceOne replaces the matched document rather than applying individual update operators, so omitted fields are removed.

Upsert means update if a matching document exists or insert if no match exists.

For production systems I use replaceOne only when full replacement is intentional, and for upserts I use precise filters plus appropriate unique indexes to prevent duplicate logical records.`,

      keyTakeaways: [
        'replaceOne is a document replacement.',
        'Omitted replacement fields disappear.',
        'Upsert combines update and conditional insert behaviour.',
        'Upsert does not replace proper uniqueness constraints.',
        'Choose replacement versus partial update deliberately.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 15,
    question:
      'What are bulkWrite operations, ordered versus unordered execution, and how should DBAs handle partial failures?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Applications sometimes need to perform many writes together.

Sending thousands of individual database requests can create unnecessary network and command overhead.

MongoDB provides bulk-write functionality so multiple write models can be submitted together.

A bulk can contain operations such as:

insertOne
updateOne
updateMany
replaceOne
deleteOne
deleteMany`,

      coreConcept: `Example:

db.users.bulkWrite([
  {
    insertOne: {
      document: {
        userId: 1001,
        name: "Vivek"
      }
    }
  },
  {
    updateOne: {
      filter: {
        userId: 1002
      },
      update: {
        $set: {
          active: true
        }
      }
    }
  },
  {
    deleteOne: {
      filter: {
        userId: 1003
      }
    }
  }
])

Bulk operations reduce repeated client/server command overhead and provide structured results for multiple writes.`,

      detailedExplanation: `Bulk writes can generally be executed in ordered or unordered mode.

ORDERED

Example:

{
  ordered: true
}

Operations are processed according to ordered semantics.

When an error occurs, later operations in the ordered bulk are not processed.

This is useful when operation order matters.

UNORDERED

Example:

{
  ordered: false
}

MongoDB can continue attempting other operations even when one write fails.

This is useful when individual operations are independent.

However, unordered does not mean:

ignore errors.

The application must still inspect the bulk result and errors.

PARTIAL SUCCESS

Suppose a bulk contains:

1000 operations.

Operation 500 fails because of a duplicate-key violation.

Some earlier operations may already have succeeded.

With unordered execution, other operations may also succeed after that failure.

Therefore blindly retrying all 1000 operations can cause additional errors or duplicate effects depending on operation design.

Bulk retry logic must understand:

• which operations succeeded
• which failed
• whether operations are idempotent
• whether retries are safe

A bulk write is also not automatically equivalent to a multi-document transaction.

Individual write operations can succeed or fail independently according to the bulk semantics unless the workload is explicitly executed within an appropriate transaction.`,

      internalWorking: `Application

Operation 1
Operation 2
Operation 3
Operation 4
     |
     v
bulkWrite()
     |
     +------------------------+
     |                        |
     v                        v
 ordered                  unordered
     |                        |
process sequence          attempt operations
stop on write error      despite individual
according to semantics   write errors
     |                        |
     +-----------+------------+
                 |
                 v
          Bulk result/errors`,

      architecture: `Without batching:

Client --> Write 1 --> Server
Client --> Write 2 --> Server
Client --> Write 3 --> Server


Bulk:

Client
  |
  +-- Write 1
  +-- Write 2
  +-- Write 3
  |
  v
Bulk command
  |
  v
MongoDB`,

      examples: [
        `Ordered bulk:

db.users.bulkWrite(
  [
    {
      insertOne: {
        document: {
          _id: 1,
          name: "A"
        }
      }
    },
    {
      insertOne: {
        document: {
          _id: 2,
          name: "B"
        }
      }
    }
  ],
  {
    ordered: true
  }
)`,

        `Unordered bulk:

db.users.bulkWrite(
  [
    {
      updateOne: {
        filter: { userId: 1 },
        update: { $set: { active: true } }
      }
    },
    {
      updateOne: {
        filter: { userId: 2 },
        update: { $set: { active: true } }
      }
    }
  ],
  {
    ordered: false
  }
)`
      ],

      commands: [
        {
          command:
            'db.users.bulkWrite([{ insertOne: { document: { _id: 1, name: "A" } } }, { insertOne: { document: { _id: 2, name: "B" } } }], { ordered: true })',
          explanation:
            'Runs an ordered bulk where a write error can prevent later operations from being attempted.'
        },
        {
          command:
            'db.users.bulkWrite([{ updateOne: { filter: { userId: 1 }, update: { $set: { active: true } } } }, { updateOne: { filter: { userId: 2 }, update: { $set: { active: true } } } }], { ordered: false })',
          explanation:
            'Runs an unordered bulk so independent operations can continue despite individual write errors.'
        }
      ],

      productionScenario: `A migration performs a bulk update of millions of customer records.

One batch contains 1000 operations.

Several operations fail because of duplicate-key constraints.

The migration program catches the exception and simply retries the entire batch.

This creates repeated work and makes it difficult to understand which records were already modified.

The DBA recommends capturing detailed bulk-write errors and designing the migration around safe retry behaviour.

The team should track:

• batch identifier
• operation identifier
• successful operations
• failed operations
• exact error codes
• retry count

For very large migrations, smaller controlled batches also make progress and operational impact easier to observe.`,

      troubleshootingApproach: `For bulk-write failures:

1. Capture the complete bulk error.

2. Identify ordered versus unordered mode.

3. Determine which operation indexes failed.

4. Check duplicate-key errors.

5. Check validation failures.

6. Check matched and modified counts where applicable.

7. Determine which operations already succeeded.

8. Do not blindly retry the entire batch.

9. Check whether each operation is idempotent.

10. Review unique indexes.

11. Check write concern and replica-set health.

12. Monitor CPU, disk, cache, replication lag, and latency during large bulk workloads.

13. Reduce batch pressure if necessary.

14. Maintain migration progress tracking.`,

      commonMistakes: [
        'Assuming a bulk is automatically all-or-nothing.',
        'Blindly retrying a partially successful batch.',
        'Ignoring individual bulk write errors.',
        'Using ordered mode when operations are independent without considering the impact of early failures.',
        'Running enormous migrations without batching and monitoring.'
      ],

      bestPractices: [
        'Choose ordered or unordered mode based on business requirements.',
        'Capture detailed per-operation errors.',
        'Design writes to be safely retryable where possible.',
        'Use controlled batch sizes for large migrations.',
        'Monitor MongoDB resource and replication impact during bulk workloads.'
      ],

      interviewAnswer: `bulkWrite allows multiple insert, update, replace, and delete models to be submitted together.

Ordered bulks follow ordered execution semantics and stop processing later operations after a write error, while unordered bulks can continue attempting independent operations.

A bulk is not automatically an all-or-nothing transaction, so during failures I identify which operations succeeded and failed before deciding what is safe to retry.`,

      keyTakeaways: [
        'bulkWrite groups multiple write models.',
        'Ordered and unordered modes have different failure behaviour.',
        'Bulk operations can partially succeed.',
        'Retry logic must understand partial success.',
        'Large production bulk workloads should be batched and monitored.'
      ]
    }
  },
  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 16,
    question:
      'A production update accidentally affects far more documents than expected. How would you contain the incident and investigate the root cause?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 16,

    answer: {
      groundZero: `An accidental mass update is a serious production incident because data may be modified correctly from MongoDB's point of view even though the application or operator intended a much smaller scope.

For example, someone intended:

db.users.updateOne(
  { userId: 1001 },
  { $set: { active: false } }
)

but executed:

db.users.updateMany(
  {},
  { $set: { active: false } }
)

MongoDB will correctly apply the update to every matching document.

The problem is therefore not necessarily a database failure.

It is usually an application, filter, operational-control, or change-management failure.`,

      coreConcept: `The immediate priorities are:

1. Stop further harmful writes.
2. Preserve evidence.
3. Determine exactly what changed.
4. Determine whether data can be repaired safely.
5. Identify the causal chain.
6. Prevent recurrence.

The DBA must avoid making additional uncontrolled writes while trying to fix the first mistake.`,

      detailedExplanation: `Suppose a production update was expected to modify:

500 documents

but modified:

5,000,000 documents.

The DBA should first determine:

• Which command was executed?
• Which filter was used?
• Was it updateOne or updateMany?
• Which fields changed?
• When did it start?
• When did it finish?
• Was the write issued manually or by an application?
• Was the same command retried?
• Did the application continue overwriting data after the incident?

Recovery options depend on what evidence exists.

Possible sources include:

• Application audit data
• MongoDB logs
• Oplog entries
• Backups
• Point-in-time recovery capability
• Historical copies
• Change streams or audit logs if configured
• Business source-of-truth systems

For a simple deterministic change, a reverse update may be possible.

For example, if every affected record was changed from:

status: "ACTIVE"

to:

status: "DISABLED"

and the original population is known precisely, the team may be able to reverse the modification.

But if the update overwrote unique values:

{
  email: "same@example.com"
}

across millions of documents, the original individual values cannot be reconstructed from the current collection alone.

A restore, PITR workflow, or historical source may be required.`,

      internalWorking: `Intended:

Specific Filter
     |
     v
500 documents
     |
     v
Update


Actual:

Broad / Empty Filter
     |
     v
5,000,000 documents
     |
     v
Update
     |
     v
Indexes modified
     |
     v
Oplog generated
     |
     v
Replicated to secondaries


Important:

Replication copies the bad write too.

A secondary is not automatically a clean backup.`,

      architecture: `Operator / Application
        |
        v
Bad Update Filter
        |
        v
PRIMARY
        |
        +--> Data changed
        |
        +--> Oplog entry
                 |
          +------+------+
          |             |
          v             v
      Secondary     Secondary
          |             |
          v             v
      Same change    Same change


Recovery source may need:

Backup / PITR / audit / business source`,

      examples: [
        `Accidental full collection update:

db.users.updateMany(
  {},
  {
    $set: {
      active: false
    }
  }
)`,

        `Safer pre-validation:

db.users.countDocuments({
  status: "PENDING"
})`,

        `Inspect sample before write:

db.users.find({
  status: "PENDING"
}).limit(10)`
      ],

      commands: [
        {
          command:
            'db.users.countDocuments({ status: "PENDING" })',
          explanation:
            'Estimates the intended scope before executing a multi-document change.'
        },
        {
          command:
            'db.currentOp({ active: true })',
          explanation:
            'Can help identify whether a harmful long-running operation is still active.'
        },
        {
          command:
            'db.getSiblingDB("local").oplog.rs.find().sort({ $natural: -1 }).limit(20)',
          explanation:
            'On a replica-set member and with appropriate privileges, can help inspect recent oplog activity. Oplog analysis should be performed carefully.'
        }
      ],

      productionScenario: `A DBA runs a maintenance update to disable expired accounts.

Expected:

50,000 accounts

Actual:

8 million accounts

The filter accidentally omitted the expiration condition.

The application immediately begins failing authentication.

The DBA should:

• stop the maintenance script
• stop any automatic retry loop
• preserve logs and timestamps
• identify the exact update
• quantify affected records
• determine whether the original active state can be reconstructed
• evaluate backup/PITR if required
• coordinate application recovery
• validate repaired data before reopening traffic

The worst response would be to execute another broad update without first proving which documents should be restored.`,

      troubleshootingApproach: `Use this incident sequence:

1. Stop the offending job or application path.

2. Check whether the operation is still running.

3. Record exact timestamps.

4. Save the exact command/filter if available.

5. Record matchedCount and modifiedCount.

6. Determine affected database and collection.

7. Identify fields modified.

8. Check whether affected fields were indexed.

9. Inspect recent oplog activity if appropriate.

10. Check backup and PITR availability.

11. Identify whether previous values can be reconstructed.

12. Design recovery on a test copy first where possible.

13. Validate document counts and sample records.

14. Apply the smallest safe repair.

15. Monitor replication and application recovery.

16. Produce an RCA.

17. Add preventive controls such as peer review, scripts, dry runs, and safer filters.`,

      commonMistakes: [
        'Assuming secondaries still contain the old data after the write replicated.',
        'Executing a reverse update without knowing the original values.',
        'Restarting nodes hoping the data change disappears.',
        'Failing to preserve timestamps and logs.',
        'Running destructive maintenance directly without validating the filter.'
      ],

      bestPractices: [
        'Validate filters with find and countDocuments.',
        'Use peer review for high-impact production writes.',
        'Use tested scripts instead of ad-hoc commands for large changes.',
        'Maintain usable backups and PITR where business requirements justify it.',
        'Record before/after counts for production maintenance.'
      ],

      interviewAnswer: `For an accidental mass update I first stop further harmful writes and preserve evidence.

I identify the exact command, filter, matched and modified counts, affected fields, timeline, and whether the bad change replicated.

Then I determine whether the original values can be reconstructed or whether backup/PITR is required.

I test the recovery path before making another large production change and document preventive controls in the RCA.`,

      keyTakeaways: [
        'MongoDB can correctly execute an incorrectly scoped command.',
        'Secondaries replicate bad writes too.',
        'Recovery depends on whether original values are reconstructable.',
        'Preserving evidence is critical.',
        'Large production updates should be validated before execution.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 17,
    question:
      'An updateOne() operation is slow even though it modifies only one document. How would you troubleshoot it?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 17,

    answer: {
      groundZero: `updateOne() means MongoDB modifies at most one matching document.

It does not mean MongoDB can always find that document quickly.

If the filter is not indexed, MongoDB may examine millions of documents before locating the one document to update.`,

      coreConcept: `Update latency can come from multiple stages:

• Finding the document
• Evaluating the filter
• Updating the document
• Maintaining indexes
• Waiting for storage
• Waiting for replication/write concern
• Write conflicts
• Lock or transaction contention

Therefore the DBA must separate:

document lookup time

from:

write execution time.`,

      detailedExplanation: `Consider:

db.customers.updateOne(
  {
    email: "user@example.com"
  },
  {
    $set: {
      active: false
    }
  }
)

Suppose customers contains 200 million documents.

If email is not indexed, MongoDB may perform a collection scan.

Only one document is modified, but millions may be examined.

Another case:

The lookup is efficient using _id.

However, the updated field participates in several indexes.

MongoDB must update the document and associated index entries.

Another case:

The update completes locally quickly, but the application requests a strong write concern and a secondary is slow.

The client can experience higher latency while waiting for write concern acknowledgement.

Another case:

Many application threads repeatedly update the same document, creating a hot-document concurrency problem.

Therefore updateOne performance cannot be diagnosed from the number of modified documents alone.`,

      internalWorking: `updateOne()

Filter
  |
  v
Find document
  |
  +--> IXSCAN --> efficient lookup
  |
  +--> COLLSCAN --> potentially expensive
  |
  v
Modify document
  |
  v
Update affected indexes
  |
  v
WiredTiger
  |
  v
Replication / Write Concern
  |
  v
Client acknowledgement`,

      architecture: `Slow updateOne

       |
       +--> Slow lookup?
       |
       +--> Many index changes?
       |
       +--> Storage latency?
       |
       +--> Write conflict?
       |
       +--> Hot document?
       |
       +--> Slow write concern?
       |
       v
Root cause`,

      examples: [
        `Slow lookup:

db.users.updateOne(
  { unindexedField: "ABC" },
  { $set: { active: true } }
)`,

        `Efficient lookup:

db.users.updateOne(
  { _id: ObjectId("...") },
  { $set: { active: true } }
)`,

        `Potential index-maintenance overhead:

Updating a field that is included in multiple secondary indexes.`
      ],

      commands: [
        {
          command:
            'db.users.find({ email: "user@example.com" }).explain("executionStats")',
          explanation:
            'Helps analyse the lookup portion of an update filter using an equivalent read query.'
        },
        {
          command:
            'db.users.getIndexes()',
          explanation:
            'Shows indexes that may support the filter or need maintenance during the update.'
        },
        {
          command:
            'db.currentOp({ active: true })',
          explanation:
            'Helps inspect long-running or waiting operations.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Shows operation-latency metrics at server level.'
        }
      ],

      productionScenario: `An application reports:

updateOne takes 8 seconds.

The DBA sees:

modifiedCount = 1

and initially assumes the write itself is slow.

An equivalent find query with explain shows:

totalDocsExamined = 18,000,000
nReturned = 1
stage = COLLSCAN

The update modifies one document, but locating it requires scanning millions.

Creating the correct index after analysing workload and index impact can reduce the lookup dramatically.

The key insight is:

number of modified documents is not the same as amount of work performed.`,

      troubleshootingApproach: `For a slow updateOne:

1. Capture the exact filter.

2. Run an equivalent find with explain.

3. Check IXSCAN versus COLLSCAN.

4. Check totalDocsExamined.

5. Check totalKeysExamined.

6. Check indexes.

7. Identify which fields are being modified.

8. Determine whether those fields are indexed.

9. Check currentOp.

10. Check write conflicts or contention.

11. Check disk latency.

12. Check WiredTiger cache pressure.

13. Check write concern.

14. Check replication lag.

15. Check whether many clients update the same document.

16. Compare against a healthy baseline.`,

      commonMistakes: [
        'Assuming updateOne is always cheap.',
        'Looking only at modifiedCount.',
        'Ignoring filter indexing.',
        'Ignoring write concern latency.',
        'Ignoring hot-document contention.'
      ],

      bestPractices: [
        'Index important update filters.',
        'Use unique identifiers when appropriate.',
        'Avoid unnecessary indexes on frequently changed fields.',
        'Monitor write concern latency.',
        'Avoid hot-document designs where possible.'
      ],

      interviewAnswer: `A slow updateOne can still examine millions of documents if its filter is not indexed.

I analyse the lookup using an equivalent find with executionStats, then check index maintenance, storage latency, write conflicts, hot-document contention, write concern, and replication lag.

The fact that only one document is modified does not mean only one document was examined.`,

      keyTakeaways: [
        'updateOne limits modifications, not necessarily scan work.',
        'The filter access path is critical.',
        'Indexes also add write-maintenance cost.',
        'Write concern can contribute to latency.',
        'Hot documents can create contention.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 18,
    question:
      'How can concurrent application updates cause lost-update problems, and how can MongoDB filters and atomic operators prevent them?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 18,

    answer: {
      groundZero: `MongoDB makes a write to a single document atomic.

However, application logic can still create race conditions when it performs separate reads and writes.

A common problem is:

Read
Modify in application
Write

Two clients can read the same original value and overwrite one another.`,

      coreConcept: `Example:

Current:

counter = 10

Client A reads 10.

Client B reads 10.

Client A writes 11.

Client B writes 11.

Expected after two increments:

12

Actual:

11

One logical update was lost.

Atomic operators such as $inc can avoid this pattern.`,

      detailedExplanation: `A better counter operation is:

db.metrics.updateOne(
  { _id: 1 },
  {
    $inc: {
      counter: 1
    }
  }
)

Each update modifies the document atomically.

Another important technique is including the expected current state in the filter.

Suppose:

{
  _id: 1,
  status: "PENDING"
}

The application wants to move it to PROCESSING only if it is still PENDING.

Use:

db.jobs.updateOne(
  {
    _id: 1,
    status: "PENDING"
  },
  {
    $set: {
      status: "PROCESSING"
    }
  }
)

If another worker already changed the status, matchedCount becomes zero.

This is a form of optimistic concurrency control.

A version field can also be used:

{
  _id: 1,
  version: 5,
  balance: 100
}

Update only if version is still 5:

db.accounts.updateOne(
  {
    _id: 1,
    version: 5
  },
  {
    $set: {
      balance: 90
    },
    $inc: {
      version: 1
    }
  }
)

If another writer already changed the record and incremented version, the update will not match.

This allows the application to detect concurrent modification rather than silently overwrite it.`,

      internalWorking: `Bad pattern:

Client A ---- read value 10
Client B ---- read value 10

Client A ---- write 11
Client B ---- write 11

Result = 11


Atomic pattern:

Client A ---- $inc +1
Client B ---- $inc +1

MongoDB serializes atomic document modifications

Result = 12


Optimistic concurrency:

Filter:
{
  _id: 1,
  version: 5
}

If version still 5:
update succeeds

If version changed:
matchedCount = 0`,

      architecture: `Application concurrency

       |
       +--> Read-modify-write
       |       |
       |       +--> race risk
       |
       +--> Atomic operator
       |       |
       |       +--> safer single-document modification
       |
       +--> Expected-state filter
               |
               +--> detect competing modification`,

      examples: [
        `Counter:

db.metrics.updateOne(
  { _id: 1 },
  { $inc: { counter: 1 } }
)`,

        `State transition:

db.jobs.updateOne(
  {
    _id: 1,
    status: "PENDING"
  },
  {
    $set: {
      status: "PROCESSING"
    }
  }
)`,

        `Versioned update:

db.accounts.updateOne(
  {
    _id: 1,
    version: 5
  },
  {
    $set: {
      balance: 90
    },
    $inc: {
      version: 1
    }
  }
)`
      ],

      commands: [
        {
          command:
            'db.metrics.updateOne({ _id: 1 }, { $inc: { counter: 1 } })',
          explanation:
            'Performs the increment atomically within the matched document.'
        },
        {
          command:
            'db.jobs.updateOne({ _id: 1, status: "PENDING" }, { $set: { status: "PROCESSING" } })',
          explanation:
            'Changes the job only if it is still in the expected PENDING state.'
        },
        {
          command:
            'db.accounts.updateOne({ _id: 1, version: 5 }, { $set: { balance: 90 }, $inc: { version: 1 } })',
          explanation:
            'Uses a version field to detect concurrent modification.'
        }
      ],

      productionScenario: `Two workers process the same job.

Both first execute:

findOne({ _id: 123 })

Both see:

status = "PENDING"

Both start external processing.

Both later write:

status = "COMPLETED"

The document ends in a valid-looking state, but the business operation happened twice.

The safer claim operation is:

db.jobs.updateOne(
  {
    _id: 123,
    status: "PENDING"
  },
  {
    $set: {
      status: "PROCESSING",
      worker: "worker-A"
    }
  }
)

Only the worker whose update matches should proceed.

The other worker receives matchedCount 0 and should not process the job.

Database atomicity must therefore be combined with correct application concurrency logic.`,

      troubleshootingApproach: `For suspected lost updates:

1. Identify whether the application performs separate read and write calls.

2. Determine which fields can change concurrently.

3. Check whether $inc or another atomic operator can replace application-side calculation.

4. Include expected current state in write filters.

5. Consider a version field.

6. Check matchedCount after conditional updates.

7. Review retry logic.

8. Review duplicate processing.

9. Check whether transactions are actually required.

10. Reproduce concurrency using multiple clients in a test environment.

11. Add logging for state transitions.

12. Make business operations idempotent where practical.`,

      commonMistakes: [
        'Assuming single-document atomicity automatically solves all application races.',
        'Ignoring matchedCount after conditional updates.',
        'Reading a value, changing it in application code, and writing it back unnecessarily.',
        'Using transactions for simple counters that $inc can handle.',
        'Allowing multiple workers to process the same logical job.'
      ],

      bestPractices: [
        'Use atomic update operators.',
        'Use expected-state filters for state transitions.',
        'Use version fields when optimistic concurrency is useful.',
        'Check write results.',
        'Design retryable and idempotent application workflows.'
      ],

      interviewAnswer: `Single-document MongoDB writes are atomic, but separate application read-modify-write sequences can still suffer lost updates.

I avoid this using atomic operators such as $inc and by including the expected current value or version in the update filter.

If another writer changes the document first, matchedCount becomes zero and the application can detect the conflict rather than silently overwrite the newer state.`,

      keyTakeaways: [
        'Atomic writes do not eliminate application race conditions.',
        '$inc avoids common counter races.',
        'Expected-state filters provide optimistic concurrency.',
        'matchedCount can detect concurrent changes.',
        'Application business logic must handle conflicts correctly.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 19,
    question:
      'You must correct millions of malformed documents in production. How would you design a safe large-scale CRUD data-fix operation?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 19,

    answer: {
      groundZero: `Correcting a few documents manually is simple.

Correcting millions of production documents is a migration.

A large data-fix operation can affect:

• CPU
• Disk
• WiredTiger cache
• Replication lag
• Oplog volume
• Application latency
• Backup windows
• Recovery procedures

It must therefore be treated as a controlled production change.`,

      coreConcept: `A safe data-fix process should include:

Discovery
Validation
Dry run
Index review
Batching
Rate control
Monitoring
Progress tracking
Retry logic
Post-validation
Rollback/recovery planning`,

      detailedExplanation: `Suppose 20 million documents incorrectly store:

createdAt: "2026-01-01T10:00:00Z"

as strings instead of BSON Date values.

A dangerous approach would be:

Run one enormous update against all affected documents during peak traffic.

A safer workflow is:

1. Fix the application writer first.

Otherwise new malformed documents continue to appear.

2. Identify affected population.

For example:

db.orders.countDocuments({
  createdAt: {
    $type: "string"
  }
})

3. Validate samples.

4. Determine whether the filter has appropriate index support.

5. Test conversion logic outside production.

6. Estimate batch size and runtime.

7. Process bounded batches.

8. Record progress.

9. Monitor resource impact.

10. Pause if production latency or replication lag exceeds thresholds.

11. Validate converted records.

12. Confirm malformed-document count approaches zero.

Large migrations should also account for oplog window.

A massive write workload can generate a large amount of oplog data.

If secondaries fall behind and the oplog window becomes too small, replication risk increases.

Data migration therefore affects more than the target collection.`,

      internalWorking: `Application Writer
      |
      +--> Fix first
      |
      v
No new bad data


Existing bad data
      |
      v
Identify population
      |
      v
Batch 1
Batch 2
Batch 3
...
      |
      v
Each batch
      |
      +--> Update documents
      +--> Maintain indexes
      +--> Generate oplog
      +--> Replicate
      |
      v
Validate progress`,

      architecture: `Migration Script
      |
      v
PRIMARY
      |
      +--> Collection updates
      |
      +--> Index maintenance
      |
      +--> WiredTiger
      |
      +--> Oplog
             |
      +------+------+
      |             |
      v             v
Secondary       Secondary

Monitor:

CPU
Disk
Cache
Lag
Oplog window
App latency`,

      examples: [
        `Identify malformed types:

db.orders.countDocuments({
  createdAt: {
    $type: "string"
  }
})`,

        `Inspect samples:

db.orders.find({
  createdAt: {
    $type: "string"
  }
}).limit(20)`,

        `Verify remaining bad records after migration:

db.orders.countDocuments({
  createdAt: {
    $type: "string"
  }
})`
      ],

      commands: [
        {
          command:
            'db.orders.countDocuments({ createdAt: { $type: "string" } })',
          explanation:
            'Counts documents containing the malformed BSON type.'
        },
        {
          command:
            'db.orders.find({ createdAt: { $type: "string" } }).limit(20)',
          explanation:
            'Provides representative documents for validating migration assumptions.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Helps monitor secondary replication timing while a large migration is running.'
        },
        {
          command:
            'db.getReplicationInfo()',
          explanation:
            'Provides oplog sizing/time-range information useful for understanding oplog window.'
        }
      ],

      productionScenario: `A financial application contains 50 million records with a field stored using the wrong BSON type.

The team proposes running one updateMany during business hours.

The DBA instead performs:

• application fix first
• count and sample validation
• test-environment conversion
• index review
• staged batches
• monitoring of CPU/disk/cache
• replication-lag thresholds
• oplog-window monitoring
• batch progress logging
• post-migration validation

During testing, one batch size causes replication lag to rise quickly.

The batch size is reduced and a small delay is introduced between batches.

The migration takes longer but avoids a customer-facing outage.

Production safety is more important than completing a bulk correction as quickly as possible.`,

      troubleshootingApproach: `For large data corrections:

1. Fix the producer of bad data.

2. Count affected documents.

3. Validate representative samples.

4. Verify conversion logic.

5. Check indexes.

6. Estimate document and index changes.

7. Review backup/PITR readiness.

8. Define batch strategy.

9. Track last processed identifier or another reliable checkpoint.

10. Monitor primary CPU.

11. Monitor WiredTiger cache.

12. Monitor disk latency.

13. Monitor replication lag.

14. Monitor oplog window.

15. Monitor application latency.

16. Pause or throttle if thresholds are exceeded.

17. Handle failed batches explicitly.

18. Verify completed data.

19. Confirm no new malformed documents are appearing.

20. Document final counts and change outcome.`,

      commonMistakes: [
        'Fixing old data before fixing the application writer.',
        'Running one enormous update without monitoring.',
        'Ignoring replication lag.',
        'Ignoring oplog-window consumption.',
        'Not tracking progress for resumability.'
      ],

      bestPractices: [
        'Treat large data fixes as migrations.',
        'Use resumable controlled batches.',
        'Monitor production impact continuously.',
        'Define stop thresholds before starting.',
        'Perform final data-quality validation.'
      ],

      interviewAnswer: `For a multi-million-document production correction, I first stop new bad data by fixing the application.

Then I identify and validate the affected population, test the conversion, review indexes, process data in resumable controlled batches, and monitor CPU, disk, WiredTiger cache, replication lag, oplog window, and application latency.

I define pause thresholds and perform post-migration validation rather than running one uncontrolled updateMany.`,

      keyTakeaways: [
        'Large CRUD fixes are production migrations.',
        'Fix the application writer first.',
        'Batching improves control and recoverability.',
        'Replication and oplog impact must be monitored.',
        'Migration progress should be resumable and measurable.'
      ]
    }
  },

  {
    category: 'crud_query_language',
    topicId: 'crud-query-language',
    topicNumber: 3,
    topicName: 'CRUD & Query Language',
    questionNumber: 20,
    question:
      'CPU and application latency suddenly increase because of CRUD workload. How would you perform an end-to-end L3 query investigation?',
    level: 'L3+ Scenario',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `When MongoDB CPU and application latency rise together, the DBA should not immediately scale the server.

The first question is:

What new work is MongoDB performing?

A single bad query shape, missing index, regex search, broad update, or application deployment can create enormous CPU demand.`,

      coreConcept: `An L3 CRUD investigation connects:

Application request
        ↓
Driver operation
        ↓
Query filter
        ↓
Query plan
        ↓
Keys/documents examined
        ↓
CPU/cache/storage work
        ↓
Latency

The goal is to identify which operation shape caused the abnormal workload.`,

      detailedExplanation: `Suppose CPU normally runs at:

35%

After an application release it rises to:

95%

Application latency increases from:

150 ms

to:

4 seconds.

The DBA should investigate:

CURRENT OPERATIONS

What queries are actively running?

QUERY SHAPES

Did a new filter or sort appear?

EXECUTION PLANS

Are important queries using IXSCAN or COLLSCAN?

EFFICIENCY

Compare:

nReturned

totalDocsExamined

totalKeysExamined

REGEX

Did an application introduce broad case-insensitive searches?

SORT

Did an index stop supporting sort?

UPDATES

Did broad updateMany operations begin?

CONNECTIONS

Did the new application create excessive MongoClient instances?

INDEX CHANGE

Was an index removed or changed?

DATA GROWTH

Did a once-cheap query become expensive because the collection grew dramatically?

CPU can therefore be caused by inefficient query work rather than insufficient hardware.`,

      internalWorking: `Application request
       |
       v
Query shape
       |
       v
Query Planner
       |
       +--> Efficient plan
       |       |
       |       +--> few keys/docs
       |
       +--> Inefficient plan
               |
               +--> huge scan
                       |
                       v
                     CPU
                       |
                       v
                   Latency
                       |
                       v
                More open requests
                       |
                       v
                Connection pressure`,

      architecture: `Application
    |
    v
Driver / Pool
    |
    v
MongoDB CRUD Layer
    |
    +--> Filter
    +--> Sort
    +--> Projection
    +--> Update
    +--> Delete
    |
    v
Query Planner
    |
    v
Execution
    |
    +--> CPU
    +--> WiredTiger Cache
    +--> Disk
    |
    v
Response`,

      examples: [
        `A missing index causes a frequently executed find query to move from an efficient index scan to a collection scan.`,

        `A new search endpoint runs unanchored case-insensitive regex across millions of documents.`,

        `An application deployment creates a new MongoClient per HTTP request and increases connection-management overhead.`
      ],

      commands: [
        {
          command:
            'db.currentOp({ active: true })',
          explanation:
            'Shows currently active operations and can reveal long-running CRUD requests.'
        },
        {
          command:
            'db.orders.find({ customerId: 1001 }).explain("executionStats")',
          explanation:
            'Shows execution efficiency for a representative query.'
        },
        {
          command:
            'db.serverStatus().opLatencies',
          explanation:
            'Shows operation latency metrics.'
        },
        {
          command:
            'db.serverStatus().connections',
          explanation:
            'Shows connection metrics.'
        },
        {
          command:
            'top',
          explanation:
            'Shows real-time process CPU usage at the OS level.'
        },
        {
          command:
            'vmstat 1',
          explanation:
            'Helps distinguish CPU saturation from I/O wait and other system behaviour.'
        }
      ],

      productionScenario: `At 14:00 an application release goes live.

At 14:05:

CPU rises from 30% to 90%.

API latency increases.

MongoDB connection count also increases.

The DBA establishes the timeline and identifies a new endpoint:

GET /customers/search

It executes:

{
  name: {
    $regex: userInput,
    $options: "i"
  }
}

against a collection containing 150 million customers.

Explain shows a very large number of keys/documents examined for common searches.

Requests remain open longer.

The application's pool becomes busy.

More requests queue.

The visible incident includes:

• high CPU
• high latency
• connection pressure

but the original trigger is the inefficient search pattern introduced by the deployment.

The resolution should address the search design rather than merely increasing CPU capacity.`,

      troubleshootingApproach: `Use this end-to-end process:

1. Record exact incident start time.

2. Check recent application and database changes.

3. Inspect currentOp.

4. Identify dominant query shapes.

5. Run explain on representative queries.

6. Compare nReturned with totalDocsExamined.

7. Compare totalKeysExamined.

8. Check COLLSCAN.

9. Check blocking sorts.

10. Check regex patterns.

11. Check broad updates/deletes.

12. Check indexes.

13. Check connection count and pool behaviour.

14. Check CPU and run queue.

15. Check WiredTiger cache.

16. Check disk latency.

17. Compare metrics with the pre-incident baseline.

18. Identify which behaviour changed first.

19. Test the likely root cause.

20. Apply the smallest corrective action.

21. Monitor recovery.

22. Document the causal chain in the RCA.`,

      commonMistakes: [
        'Scaling CPU before identifying the workload.',
        'Looking only at server resource graphs.',
        'Ignoring application deployments.',
        'Checking indexes without checking actual executionStats.',
        'Treating connection growth as the root cause when it may be a downstream symptom.'
      ],

      bestPractices: [
        'Maintain query-performance baselines.',
        'Use explain on critical CRUD operations.',
        'Correlate application and MongoDB changes.',
        'Treat CPU usage as evidence of work, not automatically insufficient hardware.',
        'Identify the first abnormal event in the incident timeline.'
      ],

      interviewAnswer: `For a CRUD-related CPU incident I first establish the timeline and check recent application or index changes.

I inspect current operations, identify the dominant query shapes, run executionStats, and compare nReturned with keys and documents examined.

I also check sorts, regex, indexes, connection pools, WiredTiger cache, disk latency, and CPU.

The objective is to identify the workload generating the CPU rather than immediately scaling hardware.`,

      keyTakeaways: [
        'High CPU is usually generated by work.',
        'Query shape changes can cause major incidents.',
        'executionStats is critical for query diagnosis.',
        'Connection pressure can be a downstream symptom.',
        'Application and database timelines must be correlated.'
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
       REMOVE ONLY PREVIOUS TOPIC 3 RECORDS
    ===================================================== */

    const deleteResult =
      await collection.deleteMany({
        category: 'crud_query_language'
      });

    console.log(
      `Removed ${deleteResult.deletedCount} previous crud_query_language documents`
    );


    /* =====================================================
       INSERT ALL 20 TOPIC 3 QUESTIONS
    ===================================================== */

    const insertResult =
      await collection.insertMany(
        questions,
        {
          ordered: true
        }
      );

    console.log(
      `Inserted ${insertResult.insertedCount} CRUD & Query Language questions`
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
       VALIDATE TOPIC 3 COUNT
    ===================================================== */

    const count =
      await collection.countDocuments({
        category:
          'crud_query_language'
      });

    console.log(
      `Topic 3 count: ${count}`
    );

    if (count !== 20) {
      throw new Error(
        `Validation failed: expected 20 Topic 3 questions, found ${count}`
      );
    }


    /* =====================================================
       VALIDATE NEW CURRICULUM TOTAL

       Topic 1 = 20
       Topic 2 = 20
       Topic 3 = 20

       Expected total = 60
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
      'Topic 3 seed completed successfully.'
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
    'Topic 3 seed failed:'
  );

  console.error(error);

  process.exit(1);
});
