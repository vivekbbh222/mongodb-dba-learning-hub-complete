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
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 1,
    question:
      'What is MongoDB, and how does it differ from a traditional relational database?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `A database is software used to store information so that an application can save it, retrieve it later, update it, and protect it from being lost.

MongoDB is a database that stores application records as documents rather than forcing every record into a fixed row-and-column table structure.

For example, an employee record in MongoDB can contain simple fields such as name and salary, but it can also contain an embedded address document and an array of skills in the same record.

This makes MongoDB natural for application data that is hierarchical or changes over time.`,

      coreConcept: `MongoDB is a document-oriented NoSQL database.

Its primary data unit is a BSON document.

Documents are grouped into collections, and collections belong to databases.

A rough comparison with relational databases is:

Relational Database → MongoDB

Database → Database
Table → Collection
Row → Document
Column → Field

However, these mappings are only approximate.

A MongoDB collection is not simply a SQL table with different syntax because MongoDB documents can contain embedded documents, arrays, and different combinations of fields.`,

      detailedExplanation: `Traditional relational databases normally model data using tables, rows, columns, primary keys, foreign keys, and relationships.

Data is commonly normalized into multiple tables so that repeated information is minimized.

Applications then reconstruct related information using joins.

MongoDB encourages a different modelling mindset.

Instead of beginning with:

"What tables should I create?"

MongoDB design normally begins with:

"How will my application read and write this data?"

If related information naturally belongs together and is normally retrieved together, embedding that information in one document can be efficient.

If data has an independent lifecycle, is shared by many records, or can grow without reasonable bounds, referencing may be better.

MongoDB also provides capabilities required by production database systems, including:

• Indexes
• Replica sets
• Transactions
• Authentication
• Authorization
• TLS
• Backup and restore
• Aggregation
• Monitoring
• Horizontal scaling using sharding

Another important concept is flexible schema.

MongoDB does not require every document in a collection to contain exactly the same fields by default.

However:

Flexible schema does NOT mean careless schema design.

Production applications should still define expected fields, BSON types, relationships, validation rules, indexing strategy, and document growth behaviour.`,

      internalWorking: `At a high level, an application normally communicates with MongoDB through an official MongoDB driver.

The request flow looks approximately like:

Application
    ↓
MongoDB Driver
    ↓
MongoDB Server
    ↓
Authentication / Authorization
    ↓
Query Parser
    ↓
Query Planner
    ↓
Indexes / Collection Scan
    ↓
WiredTiger Storage Engine
    ↓
Disk / Memory

For a write operation in a replica set, the primary accepts the write.

The operation is then represented in the replication oplog.

Secondary members continuously replicate oplog operations.

If the primary becomes unavailable, eligible replica-set members can participate in an election and another member can become primary.

In a sharded cluster, applications normally connect through mongos.

mongos uses cluster metadata and the shard key to determine which shard or shards should receive the operation.`,

      architecture: `Standalone:

Application
    |
    v
MongoDB Driver
    |
    v
mongod
    |
    v
Query / Index Layer
    |
    v
WiredTiger
    |
    v
Disk


Replica Set:

Application
    |
    v
PRIMARY
    |
    +---- Oplog ----> SECONDARY
    |
    +---- Oplog ----> SECONDARY


Sharded Cluster:

Application
    |
    v
mongos
    |
    +--------> Shard 1
    |
    +--------> Shard 2
    |
    +--------> Shard 3

mongos also uses metadata maintained by the config server replica set.`,

      examples: [
        `A relational employee design might store employee information in one table and department information in another table.`,

        `A MongoDB employee document can contain:

{
  name: "Vivek",
  salary: 70000,
  address: {
    city: "Bengaluru",
    state: "Karnataka"
  },
  skills: [
    "MongoDB",
    "Linux",
    "AWS"
  ]
}

The nested address and skills array are part of the same BSON document.`,

        `MongoDB does not require every employee document to contain exactly the same optional fields unless validation rules are configured.`
      ],

      commands: [
        {
          command: 'db.version()',
          explanation:
            'Displays the MongoDB server version for the current connection.'
        },
        {
          command: 'show dbs',
          explanation:
            'Lists databases visible to the currently authenticated user.'
        },
        {
          command: 'use webapp',
          explanation:
            'Changes the current mongosh database context to webapp.'
        },
        {
          command: 'db.getCollectionNames()',
          explanation:
            'Lists collections available in the current database.'
        }
      ],

      productionScenario: `Suppose an application team migrates an existing SQL application to MongoDB.

They create one MongoDB collection for every SQL table.

The application then performs many separate queries to reconstruct every business object.

Technically the application works.

However, it may now suffer from:

• Too many database round trips
• Excessive application-side joins
• More transactions than necessary
• More indexes
• Higher latency
• More complicated application logic

A MongoDB DBA should not immediately solve this problem by increasing RAM or CPU.

The first investigation should include:

• Application access patterns
• Document model
• Query patterns
• Indexes
• Relationship cardinality
• Whether embedding would reduce unnecessary lookups`,

      troubleshootingApproach: `When somebody reports:

"MongoDB is slow"

that statement is not yet a diagnosis.

A DBA should identify the exact slow operation.

For example:

db.orders.find({
  customerId: 12345
}).explain("executionStats")

Important values include:

winningPlan

executionTimeMillis

totalDocsExamined

totalKeysExamined

nReturned

If MongoDB returns 10 documents but examines 5 million documents, that immediately suggests an inefficient access path.

But query tuning is only one layer.

A complete investigation can include:

1. Query shape
2. Index availability
3. Query execution plan
4. BSON field types
5. Document design
6. Connection pool
7. CPU
8. Memory
9. WiredTiger cache
10. Disk latency
11. Replication lag
12. Network latency
13. Lock/contention behaviour
14. Application timeouts

The DBA's objective is to determine the actual bottleneck before changing infrastructure.`,

      commonMistakes: [
        'Treating MongoDB as only a JSON version of a relational database.',
        'Assuming flexible schema means schema design is unnecessary.',
        'Creating an index for every field without considering write and memory cost.',
        'Using transactions everywhere simply because the previous SQL application used transactions.',
        'Choosing sharding before understanding workload growth and shard-key requirements.'
      ],

      bestPractices: [
        'Design documents around real application read and write patterns.',
        'Use embedding and referencing deliberately.',
        'Use schema validation for important production structures.',
        'Use replica sets for production high availability.',
        'Measure query behaviour using explain and monitoring data before tuning.'
      ],

      interviewAnswer: `MongoDB is a document-oriented database that stores records as BSON documents in collections.

Unlike the fixed row-and-column model commonly associated with relational databases, MongoDB supports nested documents, arrays, and flexible document structures.

It provides production capabilities including indexing, replica sets, transactions, security, backup and restore, aggregation, and horizontal scaling through sharding.

MongoDB data modelling is generally driven by application access patterns rather than simply reproducing normalized relational schemas.`,

      keyTakeaways: [
        'MongoDB is a document database, not merely SQL with JSON syntax.',
        'BSON documents are the fundamental storage model.',
        'MongoDB includes indexing, replication, transactions, security, and sharding.',
        'Flexible schema still requires disciplined schema design.',
        'Application access patterns should drive MongoDB data modelling.',
        'Performance troubleshooting should identify the actual bottleneck before infrastructure is changed.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 2,
    question:
      'What are databases, collections, and documents in MongoDB?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `MongoDB organizes information into three important logical levels:

Database
Collection
Document

A database is a logical container.

A collection groups related records.

A document is the individual record containing the actual application data.`,

      coreConcept: `The basic MongoDB hierarchy is:

MongoDB Deployment
    ↓
Database
    ↓
Collection
    ↓
Document

Documents contain fields and values and are represented internally using BSON.`,

      detailedExplanation: `A single MongoDB deployment can host multiple databases.

Each database can contain multiple collections.

Each collection can contain many documents.

For example:

webapp
    |
    +-- users
    |
    +-- questions
    |
    +-- progress

Here webapp is the database.

questions is a collection.

Each individual learning question is stored as a document.

A collection normally represents records belonging to the same logical workload or entity.

Examples include:

customers
orders
payments
auditEvents
devices
questions

Documents inside collections can contain:

Strings
Numbers
Booleans
Dates
ObjectIds
Arrays
Embedded documents
Decimal values
Binary data

Collections can be created automatically when the first document is inserted.

They can also be created explicitly using db.createCollection() when special options such as validation, capped collections, or time-series configuration are required.`,

      internalWorking: `When an application inserts a document, MongoDB identifies the target database and collection.

MongoDB then:

1. Validates the request.
2. Performs authorization checks.
3. Applies collection validation if configured.
4. Ensures the document contains an _id.
5. Updates required indexes.
6. Sends the write through the storage engine.
7. Handles replication according to the deployment and write concern.

The combination of database and collection forms a namespace.

For example:

webapp.questions`,

      architecture: `MongoDB Deployment
|
+-- webapp
|   |
|   +-- questions
|   |   |
|   |   +-- Document 1
|   |   +-- Document 2
|   |   +-- Document 3
|   |
|   +-- users
|
+-- admin
|
+-- config`,

      examples: [
        `Database:

webapp`,

        `Collection:

questions`,

        `Document:

{
  _id: ObjectId("..."),
  category: "mongodb_fundamentals",
  question: "What is MongoDB?",
  difficulty: "Beginner"
}`
      ],

      commands: [
        {
          command: 'show dbs',
          explanation:
            'Displays databases accessible to the current authenticated user.'
        },
        {
          command: 'use webapp',
          explanation:
            'Selects the webapp database.'
        },
        {
          command: 'show collections',
          explanation:
            'Lists collections in the current database.'
        },
        {
          command: 'db.questions.findOne()',
          explanation:
            'Returns one document from the questions collection.'
        },
        {
          command: 'db.questions.countDocuments({})',
          explanation:
            'Counts documents in the questions collection.'
        }
      ],

      productionScenario: `Suppose a production application stores operational records, audit events, temporary imports, and application configuration in one giant collection.

The collection becomes difficult to manage because these records have different:

Retention requirements
Indexes
Query patterns
Security requirements
Backup importance
Growth behaviour

Separating logically different workloads into appropriate collections makes operations easier.

However, creating thousands of tiny collections unnecessarily can also increase management complexity.

Collection boundaries should therefore be intentional.`,

      troubleshootingApproach: `When an application claims that data is missing, verify the namespace first.

Check:

1. Which MongoDB deployment is the application connected to?
2. Which database is selected?
3. Which collection is being queried?
4. Is the collection name spelled correctly?
5. Is case correct?
6. Does the authenticated user have permission?
7. Is the application using a different environment?

A surprisingly common incident is inspecting the correct MongoDB cluster but the wrong database or collection.`,

      commonMistakes: [
        'Looking in the wrong database.',
        'Using inconsistent collection naming.',
        'Assuming a collection is exactly equivalent to a SQL table.',
        'Putting unrelated workloads into one collection.',
        'Creating excessive numbers of collections without an operational reason.'
      ],

      bestPractices: [
        'Use clear database and collection names.',
        'Group documents according to ownership, lifecycle, and access pattern.',
        'Keep production naming conventions consistent.',
        'Always verify the complete namespace during troubleshooting.'
      ],

      interviewAnswer: `A MongoDB database is a logical container for collections.

A collection groups related BSON documents.

A document is the individual record containing fields and values.

The complete collection namespace is represented as database.collection, for example webapp.questions.`,

      keyTakeaways: [
        'Databases contain collections.',
        'Collections contain documents.',
        'Documents contain fields and values.',
        'Documents are stored using BSON.',
        'database.collection forms the namespace.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 3,
    question:
      'What is BSON, and why does MongoDB use BSON instead of plain JSON?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `JSON is a human-readable text format commonly used by applications.

BSON means Binary JSON.

MongoDB uses BSON as its native document representation because databases need richer data types than plain JSON provides.`,

      coreConcept: `BSON is a binary serialization format.

It supports JSON-like documents while adding important database-oriented types such as:

ObjectId
Date
Decimal128
Binary data
32-bit integers
64-bit integers
Timestamps`,

      detailedExplanation: `MongoDB shells and drivers frequently display documents in JSON-like syntax.

Internally, however, MongoDB uses BSON.

Plain JSON has a limited type system.

For database operations, MongoDB needs to distinguish between values such as:

"100"

and

100

and

NumberLong(100)

and

NumberDecimal("100.00")

Similarly:

"2026-09-05"

is a string.

ISODate("2026-09-05T00:00:00Z")

is a BSON Date.

These distinctions affect:

Queries
Comparisons
Sorting
Indexes
Aggregation
Arithmetic
TTL behaviour
Application serialization

BSON stores type information together with each element.

MongoDB Extended JSON is used when BSON-specific values need a JSON-compatible textual representation.`,

      internalWorking: `The MongoDB driver converts application-language objects into BSON before transmitting them to MongoDB.

For example:

JavaScript Date
    ↓
MongoDB Node.js Driver
    ↓
BSON Date
    ↓
MongoDB

When MongoDB returns the result:

MongoDB BSON
    ↓
Driver
    ↓
Application-language value

Because type information is preserved, MongoDB can apply correct comparison, indexing, and aggregation behaviour.`,

      architecture: `Application Object
       |
       v
MongoDB Driver
       |
       | BSON encoding
       v
MongoDB Server
       |
       v
BSON Document
       |
       v
WiredTiger


Result path:

WiredTiger
   |
   v
MongoDB
   |
   v
BSON
   |
   v
Driver
   |
   v
Application Object`,

      examples: [
        `String:

{
  age: "25"
}`,

        `Integer:

{
  age: 25
}`,

        `Date:

{
  createdAt: ISODate("2026-09-05T10:00:00Z")
}`,

        `Decimal:

{
  amount: NumberDecimal("10.25")
}`
      ],

      commands: [
        {
          command:
            'db.types.insertOne({ createdAt: new Date(), amount: NumberDecimal("10.25"), count: NumberLong("100") })',
          explanation:
            'Inserts a document containing explicit BSON-aware values.'
        },
        {
          command: 'db.types.findOne()',
          explanation:
            'Displays a stored BSON document using mongosh representations.'
        },
        {
          command:
            'db.types.aggregate([{ $project: { createdAtType: { $type: "$createdAt" } } }])',
          explanation:
            'Uses $type to determine the BSON type of createdAt.'
        }
      ],

      productionScenario: `Suppose customerId is stored as an ObjectId in older documents but as a string in newer documents.

The values may visually contain the same hexadecimal characters.

However:

ObjectId("...")
and
"..."

are different BSON types.

Queries using an ObjectId will not automatically match the string representation.

This can produce application incidents where some customer records are found and others appear missing.`,

      troubleshootingApproach: `When inconsistent values are suspected:

1. Inspect actual BSON types using $type.
2. Group records by BSON type.
3. Determine when the type changed.
4. Identify which application version or service produced the incorrect type.
5. Define the canonical type.
6. Fix the writer.
7. Correct historical data safely.
8. Add validation if appropriate.`,

      commonMistakes: [
        'Assuming JSON-looking output means MongoDB stores plain JSON.',
        'Storing dates as strings.',
        'Mixing numeric BSON types without understanding precision.',
        'Converting ObjectIds to strings unnecessarily.',
        'Ignoring BSON type when troubleshooting query mismatches.'
      ],

      bestPractices: [
        'Choose BSON types based on the meaning of the data.',
        'Keep types consistent across documents.',
        'Use schema validation for critical fields.',
        'Use Decimal128 when exact decimal semantics are required.',
        'Use BSON Date for real timestamps.'
      ],

      interviewAnswer: `BSON is MongoDB's binary document representation.

It extends JSON with additional data types such as ObjectId, Date, Decimal128, binary data, timestamps, and multiple numeric types.

MongoDB uses BSON because database operations require richer and more precise type information than plain JSON provides.`,

      keyTakeaways: [
        'MongoDB stores BSON rather than plain JSON.',
        'BSON provides database-specific data types.',
        'BSON type affects querying, sorting, aggregation, and indexing.',
        'Drivers encode application values into BSON.',
        'Consistent BSON types are essential in production.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 4,
    question: 'What is the _id field and ObjectId?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `Every MongoDB document requires a unique identity inside its collection.

MongoDB uses the _id field for this purpose.

If an application does not provide an _id value, the MongoDB driver normally generates one automatically.`,

      coreConcept: `_id is the mandatory unique identifier for a MongoDB document.

MongoDB automatically creates a unique index on _id for normal collections.

ObjectId is the most common default BSON type used for _id.

However, MongoDB does not require _id to be an ObjectId.`,

      detailedExplanation: `ObjectId is a 12-byte BSON value designed to provide identifiers that are highly likely to be unique without requiring a central sequence generator.

Modern ObjectId values contain components including a timestamp portion, random/process-specific information, and a counter.

Because the timestamp forms part of an ObjectId, the creation time can be derived from a standard ObjectId.

The _id field is immutable after the document has been created.

Applications can provide another type for _id, such as:

String
UUID
Number
Business identifier

But the value must remain unique within the collection.

The _id design affects:

Index size
Insertion pattern
Application interoperability
Storage
Query behaviour`,

      internalWorking: `When a document is inserted, MongoDB requires an _id value.

If the application does not supply one, the driver commonly generates an ObjectId before sending the insert.

MongoDB maintains the mandatory unique _id index.

Therefore:

db.users.find({
  _id: ObjectId("...")
})

can efficiently locate a document through the _id index.`,

      architecture: `Document:

{
  _id: ObjectId("..."),
  name: "Vivek"
}

       |
       v

_id Unique Index

       |
       v

Matching Document`,

      examples: [
        `Default ObjectId:

{
  _id: ObjectId("..."),
  name: "Vivek"
}`,

        `Application-defined identifier:

{
  _id: "EMP-1001",
  name: "Vivek"
}`
      ],

      commands: [
        {
          command:
            'db.users.insertOne({ name: "Vivek" })',
          explanation:
            'Inserts a document and allows the shell/driver to generate _id.'
        },
        {
          command:
            'db.users.findOne({ _id: ObjectId("64f000000000000000000001") })',
          explanation:
            'Queries using an ObjectId value.'
        },
        {
          command: 'db.users.getIndexes()',
          explanation:
            'Displays indexes including the automatically created _id index.'
        }
      ],

      productionScenario: `An API receives an identifier through a URL.

The URL parameter is a string.

MongoDB stores the _id as ObjectId.

The application performs:

{ _id: req.params.id }

This sends a string query.

MongoDB does not match the ObjectId document.

The correct application logic converts a valid hexadecimal identifier to ObjectId before querying.

This is a very common application-side MongoDB issue.`,

      troubleshootingApproach: `When an _id query unexpectedly returns nothing:

1. Inspect the stored _id value.
2. Inspect its BSON type.
3. Inspect the application query type.
4. Verify ObjectId conversion.
5. Check for malformed IDs.
6. Test the exact query directly in mongosh.
7. Review driver serialization.`,

      commonMistakes: [
        'Querying an ObjectId using a string.',
        'Attempting to update _id.',
        'Assuming ObjectId is the only permitted _id type.',
        'Using unnecessarily large custom _id values.',
        'Duplicating the same identifier in multiple fields without a reason.'
      ],

      bestPractices: [
        'Keep _id stable.',
        'Preserve identifier BSON types between services.',
        'Use custom identifiers only when there is a clear design requirement.',
        'Use the existing _id index for identifier lookups.'
      ],

      interviewAnswer: `_id is MongoDB's mandatory unique identifier for every document.

MongoDB automatically creates a unique index on _id.

ObjectId is the common default BSON type used for _id, although applications may provide another unique value.

A frequent troubleshooting issue is querying an ObjectId using a string instead of the ObjectId BSON type.`,

      keyTakeaways: [
        '_id uniquely identifies a document.',
        'MongoDB automatically indexes _id uniquely.',
        'ObjectId is common but not mandatory.',
        '_id is immutable.',
        'The BSON type must match when querying identifiers.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 5,
    question:
      'What BSON data types does MongoDB support, and why does choosing the correct type matter?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `A data type tells MongoDB what a value represents.

For example:

"100"

100

100.00

may look similar to a person, but they can represent different BSON values.

Using the correct type is important because MongoDB queries, indexes, comparisons, and calculations are type-aware.`,

      coreConcept: `Important BSON types include:

String
Object / embedded document
Array
Boolean
Null
ObjectId
Date
Timestamp
Binary data
Regular expression
32-bit integer
64-bit integer
Double
Decimal128
MinKey
MaxKey`,

      detailedExplanation: `Correct BSON types affect how MongoDB understands and processes data.

For example, a date should normally be stored as BSON Date when the application needs:

Date range queries
Date arithmetic
Chronological sorting
TTL indexes
Aggregation date operators

Numbers should normally be numeric when arithmetic is required.

Financial or other exact decimal workloads may require Decimal128.

A production collection that contains:

"42"

42

NumberLong(42)

for the same logical field becomes more difficult to:

Query
Sort
Aggregate
Validate
Index
Migrate
Maintain

MongoDB does not automatically normalize these different values into one universal type.`,

      internalWorking: `Every BSON element includes type information.

MongoDB's query system evaluates the stored type together with the value.

Indexes are also created from BSON values.

Therefore inconsistent types become part of the index data as well.

This is why fixing only the query without fixing inconsistent stored data may not solve the underlying design problem.`,

      architecture: `Application Value
       |
       v
Driver Type Mapping
       |
       v
BSON Type
       |
       +------> Query semantics
       |
       +------> Index semantics
       |
       +------> Aggregation semantics
       |
       v
Storage`,

      examples: [
        `Correct date:

{
  createdAt: ISODate("2026-09-05T10:00:00Z")
}`,

        `String pretending to be a date:

{
  createdAt: "2026-09-05T10:00:00Z"
}`,

        `Decimal:

{
  price: NumberDecimal("19.99")
}`
      ],

      commands: [
        {
          command:
            'db.items.aggregate([{ $project: { valueType: { $type: "$value" } } }])',
          explanation:
            'Displays the BSON type of value for each result.'
        },
        {
          command:
            'db.items.find({ value: { $type: "string" } })',
          explanation:
            'Finds documents where value is stored as a BSON string.'
        }
      ],

      productionScenario: `Suppose accountNumber was historically stored as a number.

A new application version begins storing it as a string.

Queries may start returning inconsistent results.

Reports may sort differently.

Application deserialization can also behave differently.

The DBA must identify:

When the change started
Which application produced it
How many documents are affected
Which type should become canonical`,

      troubleshootingApproach: `A good investigation is:

1. Use $type to determine the existing types.
2. Count each type.
3. Sample documents from each type.
4. Identify the application version responsible.
5. Stop additional incorrect writes.
6. Decide the canonical BSON type.
7. Test conversion.
8. Back up data or confirm recoverability.
9. Migrate in batches.
10. Add schema validation.`,

      commonMistakes: [
        'Using strings for numbers because they are easy to display.',
        'Using strings for timestamps.',
        'Mixing int, long, double, and Decimal128 without understanding their differences.',
        'Ignoring missing fields versus null.',
        'Assuming indexes automatically normalize values.'
      ],

      bestPractices: [
        'Define expected BSON types during schema design.',
        'Use validation for critical production fields.',
        'Fix the application writer before historical cleanup.',
        'Choose types according to the operations performed on the value.',
        'Monitor unexpected schema/type changes.'
      ],

      interviewAnswer: `MongoDB supports a rich BSON type system including strings, numeric types, dates, ObjectIds, arrays, embedded documents, booleans, binary data, timestamps, and Decimal128.

Correct type selection matters because MongoDB queries, comparisons, sorting, aggregation, indexes, and driver behaviour are type-aware.

Production schemas should keep the BSON type of each logical field consistent.`,

      keyTakeaways: [
        'BSON type is part of the stored value.',
        'Wrong types can produce logically incorrect query behaviour.',
        'Indexes also contain BSON type information.',
        'Consistent types simplify operations and troubleshooting.',
        'Schema validation can enforce expected types.'
      ]
    }
  },
  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 6,
    question:
      'How does MongoDB store documents, and what are embedded documents and arrays?',
    level: 'L1-L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `MongoDB stores each record as a BSON document.

Unlike a relational row, a MongoDB document does not have to contain only simple values.

A field can itself contain another document.

A field can also contain an array containing multiple values or even multiple embedded documents.

For example, instead of storing an employee's address in a completely separate structure, we can store the address directly inside the employee document.

That nested structure is called an embedded document.`,

      coreConcept: `MongoDB documents support hierarchical data.

A document can contain:

• Scalar fields
• Embedded documents
• Arrays of scalar values
• Arrays of embedded documents
• Multiple levels of nesting

Example:

{
  name: "Vivek",

  address: {
    city: "Bengaluru",
    state: "Karnataka"
  },

  skills: [
    "MongoDB",
    "Linux",
    "AWS"
  ]
}

Here:

address is an embedded document.

skills is an array.`,

      detailedExplanation: `One of MongoDB's major differences from the traditional relational model is its ability to naturally represent hierarchical application objects.

Consider an order.

A relational design might use:

orders
order_items
shipping_addresses

and join those tables when the complete order is required.

MongoDB can potentially model the complete business object as:

{
  orderId: "ORD1001",

  customerId: 12345,

  shippingAddress: {
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001"
  },

  items: [
    {
      productId: "P100",
      quantity: 2,
      price: 500
    },
    {
      productId: "P200",
      quantity: 1,
      price: 700
    }
  ]
}

This does not mean everything should always be embedded.

Embedding works particularly well when:

• Child data belongs strongly to the parent.
• Child data is normally read with the parent.
• Child data does not grow without reasonable bounds.
• The child does not need an independent lifecycle.

Referencing may be more appropriate when:

• Data is shared by many documents.
• Data has an independent lifecycle.
• The relationship has very high cardinality.
• Embedding would cause unbounded document growth.

MongoDB has a maximum BSON document size of 16 MiB.

Therefore, an indefinitely growing array inside one document is an important production design risk.`,

      internalWorking: `Embedded documents and arrays remain part of the parent BSON document.

Conceptually:

Document
   |
   +-- Scalar fields
   |
   +-- Embedded document
   |      |
   |      +-- Nested fields
   |
   +-- Array
          |
          +-- Element
          +-- Element
          +-- Element

When MongoDB reads the parent document, the embedded data is part of that document.

MongoDB supports dot notation for querying nested fields.

For example:

{
  "address.city": "Bengaluru"
}

MongoDB can also create indexes on fields inside embedded documents.

Arrays have special indexing behaviour.

When an indexed field contains an array, MongoDB can create a multikey index so array elements can participate in indexed queries.`,

      architecture: `Application Object
       |
       v
BSON Document
       |
       +-- name
       |
       +-- address
       |     |
       |     +-- city
       |     +-- state
       |
       +-- skills[]
             |
             +-- MongoDB
             +-- Linux
             +-- AWS
       |
       v
MongoDB Collection`,

      examples: [
        `Embedded document:

{
  name: "Vivek",
  address: {
    city: "Bengaluru",
    state: "Karnataka"
  }
}`,

        `Array of values:

{
  name: "Vivek",
  skills: [
    "MongoDB",
    "Linux",
    "AWS"
  ]
}`,

        `Array of embedded documents:

{
  orderId: "ORD1001",
  items: [
    {
      product: "Laptop",
      quantity: 1
    },
    {
      product: "Mouse",
      quantity: 2
    }
  ]
}`
      ],

      commands: [
        {
          command:
            'db.users.find({ "address.city": "Bengaluru" })',
          explanation:
            'Queries a field inside an embedded document using dot notation.'
        },
        {
          command:
            'db.users.find({ skills: "MongoDB" })',
          explanation:
            'Matches documents whose skills array contains MongoDB.'
        },
        {
          command:
            'db.orders.find({ items: { $elemMatch: { product: "Laptop", quantity: { $gte: 1 } } } })',
          explanation:
            '$elemMatch requires the specified conditions to be satisfied by the same array element.'
        },
        {
          command:
            'db.users.createIndex({ "address.city": 1 })',
          explanation:
            'Creates an index on a nested field inside the embedded address document.'
        }
      ],

      productionScenario: `Suppose an application stores every event generated by a customer inside:

{
  customerId: 1001,
  events: [...]
}

The application continuously appends new elements to events.

Initially this appears convenient because all events are available in one document.

After several months, however, some customers have extremely large documents.

Possible consequences include:

• Larger reads
• Larger network payloads
• Increased update cost
• Large multikey indexes if array fields are indexed
• Working-set pressure
• Document growth
• Eventually reaching the 16 MiB BSON document limit

The DBA should recognize this as a data-model issue rather than simply a storage-capacity issue.`,

      troubleshootingApproach: `When embedded data or arrays appear to be causing problems:

1. Inspect representative documents.
2. Measure document sizes.
3. Determine whether arrays are bounded or unbounded.
4. Check whether array fields are indexed.
5. Review the application access pattern.
6. Determine whether all embedded data is actually read together.
7. Check document growth over time.
8. Consider separating unbounded child records into another collection.

Useful investigation:

db.collection.aggregate([
  {
    $project: {
      size: { $bsonSize: "$$ROOT" }
    }
  },
  {
    $sort: {
      size: -1
    }
  },
  {
    $limit: 10
  }
])

This can help identify unusually large documents.`,

      commonMistakes: [
        'Embedding an unbounded array inside a document.',
        'Assuming embedding is always faster than referencing.',
        'Creating large multikey indexes without understanding array behaviour.',
        'Returning a huge embedded document when the application needs only a few fields.',
        'Ignoring the 16 MiB BSON document limit.'
      ],

      bestPractices: [
        'Embed data that belongs together and is normally accessed together.',
        'Keep embedded arrays reasonably bounded.',
        'Use referencing for independent or unbounded child data.',
        'Monitor document growth for high-volume workloads.',
        'Design around application access patterns rather than blindly normalizing or embedding everything.'
      ],

      interviewAnswer: `MongoDB documents can contain embedded documents and arrays because BSON supports hierarchical structures.

Embedding is useful when related data belongs to the parent and is commonly accessed together.

However, unbounded arrays and uncontrolled document growth should be avoided because MongoDB documents have a 16 MiB maximum size and large documents can increase read, update, index, and memory costs.`,

      keyTakeaways: [
        'MongoDB documents can naturally represent hierarchical data.',
        'Embedded documents are stored inside the parent document.',
        'Arrays can contain values or embedded documents.',
        'Nested fields can be queried using dot notation.',
        'Indexed arrays can create multikey indexes.',
        'Unbounded arrays are an important production anti-pattern.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 7,
    question:
      'What is MongoDB\'s flexible schema, and does "schema-less" mean there is no schema?',
    level: 'L1-L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `MongoDB is often described as a schema-less database.

That phrase can be misleading.

MongoDB does not normally force every document in a collection to contain exactly the same fields.

But your application data still has a structure.

That structure is your schema.

Therefore, a better description is:

MongoDB has a flexible schema.`,

      coreConcept: `Flexible schema means documents in the same collection can have different fields or structures unless rules are explicitly enforced.

For example:

{
  name: "Vivek",
  age: 26
}

and:

{
  name: "Rahul",
  age: 30,
  city: "Bengaluru",
  skills: ["MongoDB", "Linux"]
}

can exist in the same collection.

This flexibility is useful, but uncontrolled variation can become a production problem.`,

      detailedExplanation: `Relational databases commonly define columns and their data types before rows are inserted.

MongoDB normally allows documents to evolve more flexibly.

This is useful when:

• Applications evolve rapidly.
• Optional attributes exist.
• Different subtypes need different fields.
• Historical records use older schema versions.
• Data naturally has hierarchical structures.

However, flexible schema does not remove the need for data modelling.

A production MongoDB schema should still answer questions such as:

What fields should exist?

Which fields are mandatory?

What BSON type should each field use?

Which fields can be null?

Which arrays are bounded?

What fields are indexed?

Which values should be embedded?

Which values should be referenced?

How will the schema evolve?

MongoDB supports collection-level schema validation.

Validators can enforce requirements using operators such as $jsonSchema.

This provides a useful balance:

Flexible document model + controlled production data quality.`,

      internalWorking: `Without a validator:

Application
    |
    v
Insert / Update
    |
    v
MongoDB
    |
    v
Document accepted if otherwise valid

With a validator:

Application
    |
    v
Insert / Update
    |
    v
Collection Validator
    |
    +-- Valid ----> Write continues
    |
    +-- Invalid --> Reject / warn depending on configuration

Validation can therefore catch incorrect application writes before bad data spreads through the collection.`,

      architecture: `Application v1
     |
     +--> { name, email }

Application v2
     |
     +--> { name, email, phone }

Application v3
     |
     +--> { name, email, phone, preferences }

              |
              v

        MongoDB Collection

              |
              v

       Optional Validator`,

      examples: [
        `Different document shapes:

{
  type: "individual",
  name: "Vivek"
}

{
  type: "company",
  companyName: "Example Pvt Ltd",
  gstNumber: "..."
}`,

        `Schema validation can require important fields even while allowing optional fields to evolve.`
      ],

      commands: [
        {
          command:
            `db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "salary"],
      properties: {
        name: {
          bsonType: "string"
        },
        salary: {
          bsonType: ["int", "long", "double", "decimal"]
        }
      }
    }
  }
})`,
          explanation:
            'Creates a collection with a JSON Schema-style validator requiring name and salary with expected BSON types.'
        },
        {
          command:
            'db.runCommand({ collMod: "employees", validationLevel: "strict" })',
          explanation:
            'Modifies collection validation configuration. Production changes should be tested carefully before enforcement.'
        }
      ],

      productionScenario: `Suppose three microservices write to the same collection.

Service A stores:

customerId: ObjectId(...)

Service B stores:

customerId: "..."

Service C occasionally omits customerId.

The collection is technically accepting all three document shapes.

Months later, reports and queries behave inconsistently.

The problem is not that MongoDB has failed.

The application architecture allowed uncontrolled schema variation.

A production solution may include:

• Defining an agreed document contract
• Fixing application writers
• Cleaning historical data
• Adding schema validation
• Monitoring validation failures`,

      troubleshootingApproach: `For suspected schema inconsistency:

1. Identify important fields.
2. Use $type to inspect BSON types.
3. Count missing fields.
4. Sample abnormal documents.
5. Identify the application/service producing them.
6. Establish the intended schema.
7. Correct application writes first.
8. Clean historical documents carefully.
9. Introduce validation after compatibility testing.

Do not enable a strict validator blindly on a large legacy collection before understanding existing data.`,

      commonMistakes: [
        'Believing schema-less means schema design is unnecessary.',
        'Allowing multiple services to write incompatible field types.',
        'Adding strict validation without analysing legacy documents.',
        'Using flexible schema as a substitute for application governance.',
        'Ignoring schema evolution during application upgrades.'
      ],

      bestPractices: [
        'Treat production collections as having an intentional schema.',
        'Document expected BSON types.',
        'Use validation for critical fields.',
        'Plan schema evolution between application versions.',
        'Audit existing data before enforcing strict validation.'
      ],

      interviewAnswer: `MongoDB is better described as having a flexible schema rather than no schema.

Documents in a collection can have different fields by default, but production applications still need an intentional data model and consistent BSON types.

MongoDB also supports schema validation, including $jsonSchema-based validators, to enforce important structural and type requirements.`,

      keyTakeaways: [
        'Schema-less does not mean structure-less.',
        'MongoDB provides schema flexibility.',
        'Applications still need an intentional schema.',
        'MongoDB supports collection validation.',
        'Uncontrolled schema variation can become a serious production problem.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 8,
    question:
      'What are CRUD operations in MongoDB?',
    level: 'L1-L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `CRUD represents the four basic operations applications perform on stored data.

C = Create
R = Read
U = Update
D = Delete

Almost every database-backed application performs these operations.`,

      coreConcept: `Common MongoDB CRUD methods include:

Create:

insertOne()
insertMany()

Read:

find()
findOne()

Update:

updateOne()
updateMany()
replaceOne()

Delete:

deleteOne()
deleteMany()

CRUD operations operate on MongoDB documents inside collections.`,

      detailedExplanation: `CREATE

Create operations add new documents.

Example:

db.users.insertOne({
  name: "Vivek",
  role: "DBA"
})

READ

Read operations retrieve documents.

Example:

db.users.find({
  role: "DBA"
})

UPDATE

Update operations modify existing documents.

MongoDB supports update operators such as:

$set
$unset
$inc
$push
$pull
$addToSet

Example:

db.users.updateOne(
  { name: "Vivek" },
  {
    $set: {
      role: "Senior DBA"
    }
  }
)

DELETE

Delete operations remove matching documents.

Example:

db.users.deleteOne({
  name: "Vivek"
})

The filter used by update and delete operations is extremely important.

A broad or incorrect filter can modify or remove many documents.

This becomes a major production DBA concern.`,

      internalWorking: `A simplified CRUD request path is:

Application
    |
    v
MongoDB Driver
    |
    v
Authentication / Authorization
    |
    v
Command Processing
    |
    v
Query Planner
    |
    +--> Index Scan
    |
    +--> Collection Scan
    |
    v
Matching Document(s)
    |
    v
Read / Update / Delete

For writes:

Matching document
    |
    v
Storage Engine
    |
    v
Index updates
    |
    v
Replication behaviour
    |
    v
Acknowledgement according to write concern`,

      architecture: `CREATE
Application --> insert --> MongoDB

READ
Application --> query --> MongoDB --> result

UPDATE
Application --> filter + change --> MongoDB

DELETE
Application --> filter --> MongoDB --> remove`,

      examples: [
        `Create:

db.employees.insertOne({
  employeeId: 1001,
  name: "Vivek",
  department: "Database"
})`,

        `Read:

db.employees.find({
  department: "Database"
})`,

        `Update:

db.employees.updateOne(
  { employeeId: 1001 },
  {
    $set: {
      department: "Database Engineering"
    }
  }
)`,

        `Delete:

db.employees.deleteOne({
  employeeId: 1001
})`
      ],

      commands: [
        {
          command:
            'db.users.insertMany([{ name: "A" }, { name: "B" }])',
          explanation:
            'Inserts multiple documents.'
        },
        {
          command:
            'db.users.find({ status: "ACTIVE" })',
          explanation:
            'Returns documents matching the specified filter.'
        },
        {
          command:
            'db.users.updateMany({ status: "OLD" }, { $set: { archived: true } })',
          explanation:
            'Updates every document matching the filter.'
        },
        {
          command:
            'db.users.deleteMany({ temporary: true })',
          explanation:
            'Deletes every document matching the filter and therefore requires careful production validation.'
        }
      ],

      productionScenario: `A developer intends to update one customer's status.

The expected command is:

db.customers.updateOne(
  { customerId: 1001 },
  { $set: { status: "ACTIVE" } }
)

Instead, an operational script uses:

db.customers.updateMany(
  {},
  { $set: { status: "ACTIVE" } }
)

Every document is modified.

This is why production change procedures should validate:

• Exact namespace
• Exact filter
• Expected matching count
• Whether updateOne or updateMany is intended
• Backup/recovery strategy
• Change approval where required`,

      troubleshootingApproach: `Before executing a risky update or delete in production:

1. Run the filter using find().
2. Run countDocuments() with the exact same filter.
3. Sample matching documents.
4. Confirm the expected namespace.
5. Confirm updateOne versus updateMany.
6. Review the update operators.
7. Ensure recoverability.
8. Execute during the approved change window if required.
9. Verify modifiedCount/deletedCount.
10. Validate application behaviour afterward.

For example:

db.customers.countDocuments({
  status: "OLD"
})

should be checked before:

db.customers.deleteMany({
  status: "OLD"
})`,

      commonMistakes: [
        'Running updateMany or deleteMany with an empty filter.',
        'Using replaceOne when only one field needed to change.',
        'Ignoring matchedCount and modifiedCount.',
        'Updating indexed fields unnecessarily.',
        'Executing production data changes without validating the filter first.'
      ],

      bestPractices: [
        'Test filters with find and countDocuments before destructive operations.',
        'Use the narrowest possible filter.',
        'Prefer targeted update operators such as $set.',
        'Verify operation results.',
        'Ensure important production changes have a recovery plan.'
      ],

      interviewAnswer: `CRUD stands for Create, Read, Update, and Delete.

MongoDB provides methods such as insertOne, find, updateOne, updateMany, deleteOne, and deleteMany.

For production administration, the important point is not only knowing the commands but validating filters, understanding indexes and write behaviour, and ensuring potentially destructive updates or deletes are recoverable.`,

      keyTakeaways: [
        'CRUD means Create, Read, Update, and Delete.',
        'MongoDB provides dedicated methods for each operation.',
        'Filters determine which documents are affected.',
        'Update operators can modify specific fields without replacing the whole document.',
        'Production update and delete operations require careful validation.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 9,
    question:
      'How do MongoDB query filters, comparison operators, and logical operators work?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `A query filter tells MongoDB which documents you want.

For example:

db.users.find({
  city: "Bengaluru"
})

means:

Return documents where city equals Bengaluru.

Filters can become more powerful by using comparison and logical operators.`,

      coreConcept: `Important comparison operators include:

$eq   equal
$ne   not equal
$gt   greater than
$gte  greater than or equal
$lt   less than
$lte  less than or equal
$in   matches one of several values
$nin  does not match listed values

Important logical operators include:

$and
$or
$nor
$not`,

      detailedExplanation: `MongoDB filters are BSON documents describing matching conditions.

Simple equality:

{
  status: "ACTIVE"
}

Range condition:

{
  age: {
    $gte: 18,
    $lt: 60
  }
}

Multiple fields normally imply logical AND.

For example:

{
  status: "ACTIVE",
  city: "Bengaluru"
}

means:

status = ACTIVE
AND
city = Bengaluru

Explicit $or:

{
  $or: [
    { city: "Bengaluru" },
    { city: "Hyderabad" }
  ]
}

$in is often useful when the same field can match several acceptable values:

{
  status: {
    $in: [
      "ACTIVE",
      "PENDING"
    ]
  }
}

Filters also work with:

Nested fields
Arrays
Regular expressions
Existence checks
BSON type checks
Element matching

From an L3 DBA perspective, understanding query syntax is only the beginning.

The DBA must also understand how a filter interacts with available indexes and the query planner.`,

      internalWorking: `When MongoDB receives a query:

Filter
   |
   v
Query Parsing
   |
   v
Canonical Query Shape
   |
   v
Query Planner
   |
   +--> Candidate index plan
   |
   +--> Another index plan
   |
   +--> Collection scan possibility
   |
   v
Winning Plan
   |
   v
Execution
   |
   v
Documents returned

The same logical query can perform very differently depending on:

• Available indexes
• Selectivity
• Data distribution
• Sort requirements
• Query shape
• BSON types`,

      architecture: `Application Filter
       |
       v
MongoDB Query Layer
       |
       v
Query Planner
       |
       +------ IXSCAN
       |
       +------ COLLSCAN
       |
       v
FETCH / FILTER
       |
       v
Results`,

      examples: [
        `Comparison:

db.orders.find({
  amount: {
    $gte: 1000
  }
})`,

        `Range:

db.orders.find({
  amount: {
    $gte: 1000,
    $lte: 5000
  }
})`,

        `Logical OR:

db.users.find({
  $or: [
    { role: "DBA" },
    { role: "Developer" }
  ]
})`,

        `$in:

db.users.find({
  city: {
    $in: [
      "Bengaluru",
      "Hyderabad",
      "Pune"
    ]
  }
})`
      ],

      commands: [
        {
          command:
            'db.orders.find({ amount: { $gt: 1000 } })',
          explanation:
            'Returns orders where amount is greater than 1000.'
        },
        {
          command:
            'db.orders.find({ status: { $in: ["NEW", "PROCESSING"] } })',
          explanation:
            'Returns documents whose status matches either listed value.'
        },
        {
          command:
            'db.orders.find({ $or: [{ priority: "HIGH" }, { amount: { $gte: 100000 } }] })',
          explanation:
            'Matches documents satisfying either branch of the $or expression.'
        },
        {
          command:
            'db.orders.find({ status: "ACTIVE", amount: { $gte: 1000 } }).explain("executionStats")',
          explanation:
            'Examines how MongoDB executes the filtered query and exposes execution statistics.'
        }
      ],

      productionScenario: `An application performs:

db.transactions.find({
  status: "SUCCESS",
  createdAt: {
    $gte: startDate,
    $lt: endDate
  }
})

The collection contains hundreds of millions of documents.

Without an appropriate index, MongoDB may examine a very large number of documents.

The DBA should evaluate:

• Query frequency
• Number of documents returned
• Selectivity of status
• Selectivity of createdAt
• Existing indexes
• Sort requirements
• explain("executionStats")

An appropriate compound index may be required, but index design must be based on the actual workload rather than guessing.`,

      troubleshootingApproach: `For a slow filter:

1. Capture the exact query shape.
2. Confirm parameter BSON types.
3. Run explain("executionStats").
4. Check winningPlan.
5. Check totalDocsExamined.
6. Check totalKeysExamined.
7. Check nReturned.
8. Compare examined documents with returned documents.
9. Review existing indexes.
10. Check whether sorting is also involved.
11. Determine whether the query itself can be made more selective.
12. Test index changes safely.

A COLLSCAN is not automatically wrong.

For a tiny collection or a query returning most of the collection, a collection scan may be reasonable.

Context matters.`,

      commonMistakes: [
        'Assuming every COLLSCAN is automatically a problem.',
        'Creating indexes without examining real query shapes.',
        'Using the wrong BSON type in filters.',
        'Using very broad $or expressions without considering indexes.',
        'Looking only at executionTimeMillis while ignoring documents examined.'
      ],

      bestPractices: [
        'Use selective filters whenever possible.',
        'Keep filter BSON types consistent with stored fields.',
        'Use explain("executionStats") for important slow queries.',
        'Design indexes around real query patterns.',
        'Evaluate nReturned against documents and keys examined.'
      ],

      interviewAnswer: `MongoDB query filters are BSON expressions used to select documents.

Comparison operators such as $gt, $gte, $lt, $lte, and $in define value conditions, while logical operators such as $and and $or combine conditions.

From a DBA perspective, the filter must also be evaluated with explain because index availability, selectivity, BSON types, and data distribution determine the actual execution cost.`,

      keyTakeaways: [
        'Filters determine which documents match.',
        'Multiple ordinary field predicates imply AND.',
        'Comparison operators define ranges and alternatives.',
        'Logical operators combine conditions.',
        'Query syntax and query performance are different concerns.',
        'Explain analysis is required to understand the execution path.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 10,
    question:
      'What are projections, sorting, limiting, and skipping?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `Finding the correct documents is only one part of a database query.

Applications often also need to control:

Which fields are returned
What order records appear in
How many records are returned
Which records are skipped

MongoDB provides projection, sort, limit, and skip for these purposes.`,

      coreConcept: `Projection controls fields returned.

sort() controls result ordering.

limit() restricts the number of returned documents.

skip() ignores a specified number of matching documents before returning results.

Example:

db.users
  .find(
    { status: "ACTIVE" },
    { name: 1, email: 1 }
  )
  .sort({ createdAt: -1 })
  .limit(20)`,

      detailedExplanation: `PROJECTION

Projection can reduce the fields returned by a query.

Example:

db.users.find(
  { status: "ACTIVE" },
  {
    name: 1,
    email: 1
  }
)

MongoDB normally includes _id unless it is explicitly excluded.

SORT

Sort controls result order.

1 means ascending.

-1 means descending.

Example:

.sort({
  createdAt: -1
})

LIMIT

Limit restricts how many documents are returned.

Example:

.limit(10)

SKIP

Skip discards a number of results before returning the next records.

Example:

.skip(100)

This is frequently used for simple pagination.

However, very large skip values can become inefficient because MongoDB still has to advance past preceding results.

For large datasets, range-based or cursor-based pagination using an indexed field is often more scalable.`,

      internalWorking: `A simplified execution path is:

Filter
   |
   v
Index / Collection Scan
   |
   v
Matching records
   |
   v
Sort
   |
   v
Skip
   |
   v
Limit
   |
   v
Projection / Result
   |
   v
Application

The actual execution engine can optimize or reorder parts of this process.

If an appropriate index provides the requested sort order, MongoDB may avoid an expensive blocking in-memory sort.

This is one reason compound index design must consider both filtering and sorting.`,

      architecture: `Query:

Filter
  |
  v
Index
  |
  v
Ordered Keys
  |
  v
Fetch
  |
  v
Projection
  |
  v
Limit
  |
  v
Application

Ideal case:
Index supports filter + sort.

Less efficient case:
Filter results --> blocking SORT --> results`,

      examples: [
        `Projection:

db.employees.find(
  {},
  {
    name: 1,
    department: 1,
    _id: 0
  }
)`,

        `Sorting:

db.orders.find({}).sort({
  createdAt: -1
})`,

        `Limiting:

db.orders.find({}).limit(10)`,

        `Simple pagination:

db.orders
  .find({})
  .sort({ _id: 1 })
  .skip(100)
  .limit(20)`
      ],

      commands: [
        {
          command:
            'db.users.find({ status: "ACTIVE" }, { name: 1, email: 1, _id: 0 })',
          explanation:
            'Returns only name and email from matching documents while excluding _id.'
        },
        {
          command:
            'db.orders.find({ status: "SUCCESS" }).sort({ createdAt: -1 }).limit(20)',
          explanation:
            'Returns the newest 20 successful orders according to createdAt.'
        },
        {
          command:
            'db.orders.find({ status: "SUCCESS" }).sort({ createdAt: -1 }).limit(20).explain("executionStats")',
          explanation:
            'Shows whether the query uses an index effectively and whether sorting introduces additional work.'
        }
      ],

      productionScenario: `An API implements pagination using:

.skip(pageNumber * 100)
.limit(100)

For page 2 this may be inexpensive.

For page 50,000 the application asks MongoDB to skip millions of results before returning only 100.

Latency increases as users request deeper pages.

A better design may use an indexed continuation value.

For example, if _id ordering is suitable:

db.orders.find({
  _id: {
    $gt: lastSeenId
  }
})
.sort({
  _id: 1
})
.limit(100)

This avoids repeatedly walking through all earlier pages.

The exact pagination key must match the application's ordering and uniqueness requirements.`,

      troubleshootingApproach: `For slow sorted or paginated queries:

1. Capture the exact filter.
2. Capture the exact sort.
3. Check skip and limit values.
4. Run explain("executionStats").
5. Look for a SORT stage.
6. Determine whether an index provides the required ordering.
7. Check totalKeysExamined and totalDocsExamined.
8. Determine whether deep skip is being used.
9. Evaluate range-based pagination.
10. Check whether projection can reduce unnecessary returned data.

Do not create an index only for sort without considering the filter and the overall workload.`,

      commonMistakes: [
        'Returning entire large documents when only two fields are required.',
        'Using deep skip-based pagination on very large result sets.',
        'Sorting large result sets without a suitable index.',
        'Forgetting that _id is included in inclusion projections unless excluded.',
        'Designing sort indexes without considering query predicates.'
      ],

      bestPractices: [
        'Project only fields the application actually needs when appropriate.',
        'Use indexes that support important filter and sort patterns.',
        'Use limit for bounded result sets.',
        'Avoid deep skip pagination for high-volume workloads.',
        'Use explain to identify blocking sort and excessive scanning.'
      ],

      interviewAnswer: `Projection controls which fields MongoDB returns, sort controls result ordering, limit restricts the number of returned documents, and skip advances past a number of matching results.

For production workloads, an important concern is whether indexes support both filtering and sorting.

Deep skip-based pagination can become inefficient, so range-based pagination using an indexed continuation key is often preferable for large datasets.`,

      keyTakeaways: [
        'Projection controls returned fields.',
        'Sort controls ordering.',
        'Limit bounds the result count.',
        'Skip is useful but can become expensive for deep pagination.',
        'Indexes can provide sort order and avoid expensive sorting.',
        'Pagination strategy matters at production scale.'
      ]
    }
  },
  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 11,
    question:
      'What is the difference between embedding and referencing data?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 11,

    answer: {
      groundZero: `When two pieces of data are related, MongoDB gives us two major ways to model that relationship.

The first is embedding.

Embedding means storing related information inside the same document.

The second is referencing.

Referencing means storing related information in separate documents and keeping an identifier that connects them.

Neither approach is automatically better.

The correct choice depends mainly on how the application reads, writes, and grows the data.`,

      coreConcept: `Embedding:

{
  customerId: 1001,
  name: "Vivek",
  address: {
    city: "Bengaluru",
    state: "Karnataka"
  }
}

The address exists inside the customer document.

Referencing:

Customer:

{
  _id: 1001,
  name: "Vivek"
}

Order:

{
  orderId: 5001,
  customerId: 1001
}

The order stores a reference to the customer.

MongoDB modelling is normally driven by access patterns, relationship cardinality, ownership, lifecycle, and expected growth.`,

      detailedExplanation: `Embedding is useful when related data:

• Belongs strongly to the parent
• Is normally retrieved with the parent
• Has a bounded size
• Has a similar lifecycle
• Benefits from being updated atomically with the parent

For example, an order's shipping address may be embedded because the address used for that particular order belongs to the order history.

Referencing is useful when related data:

• Has an independent lifecycle
• Is shared by many documents
• Can grow without reasonable bounds
• Is frequently queried independently
• Would cause excessive duplication if embedded

Consider products and orders.

The product catalog may contain the current product information.

An order may still embed selected historical product information such as:

productName
purchasePrice
quantity

while referencing productId.

This hybrid design can preserve the state of the order while still connecting it to the product catalog.

Therefore, MongoDB modelling is not simply:

embed everything

or:

reference everything.

Good designs frequently use both techniques.`,

      internalWorking: `Embedding:

Application
    |
    v
One query
    |
    v
Parent BSON document
    |
    +-- Parent fields
    |
    +-- Embedded child data

The application may obtain the complete business object with one document read.

Referencing:

Application
    |
    v
Parent document
    |
    +-- referencedId
             |
             v
      Related document

Resolving references may require:

• Another application query
• $lookup in an aggregation pipeline
• Application-side caching
• Another architectural strategy

Embedding can reduce round trips, but referencing can prevent uncontrolled duplication and document growth.`,

      architecture: `EMBEDDING

Customer
|
+-- name
|
+-- address
    |
    +-- city
    +-- state


REFERENCING

Customer
|
+-- _id: 1001

       ^
       |
       | customerId: 1001
       |
Order
|
+-- orderId: 5001`,

      examples: [
        `Embedding example:

{
  orderId: 1001,
  shippingAddress: {
    city: "Bengaluru",
    pincode: "560001"
  }
}`,

        `Referencing example:

{
  orderId: 1001,
  customerId: ObjectId("...")
}`,

        `Hybrid example:

{
  orderId: 1001,
  productId: ObjectId("..."),
  productSnapshot: {
    name: "Laptop",
    purchasePrice: 50000
  }
}`
      ],

      commands: [
        {
          command:
            'db.orders.find({ "shippingAddress.city": "Bengaluru" })',
          explanation:
            'Queries a field embedded directly inside the order document.'
        },
        {
          command:
            `db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  }
])`,
          explanation:
            '$lookup can combine documents from collections when a referenced relationship must be resolved in MongoDB.'
        }
      ],

      productionScenario: `Suppose an SQL application is migrated to MongoDB.

The development team creates:

customers
orders
orderItems
addresses
payments

as separate collections because they were separate SQL tables.

Displaying one order now requires multiple database operations or several $lookup stages.

The application experiences increased latency.

The DBA and development team should review whether some data belongs naturally inside the order document.

For example:

Order
|
+-- shippingAddress
+-- billingAddress
+-- items[]
+-- paymentSummary

could potentially represent the business object more naturally.

However, blindly embedding every payment event or every customer order into one customer document could create unbounded growth.

The correct design depends on the workload.`,

      troubleshootingApproach: `When investigating a possible modelling problem:

1. Identify the application's most important read operations.
2. Identify the most important write operations.
3. Determine which data is normally retrieved together.
4. Determine relationship cardinality.
5. Determine whether child data can grow indefinitely.
6. Determine whether child data has an independent lifecycle.
7. Measure query frequency and latency.
8. Check whether excessive $lookup or application round trips are occurring.
9. Check document sizes and growth.
10. Evaluate a hybrid model if appropriate.

Do not redesign the schema solely because one query appears inconvenient.

Consider the complete workload.`,

      commonMistakes: [
        'Copying relational normalization directly into MongoDB.',
        'Embedding every related record regardless of growth.',
        'Referencing everything because that feels familiar from SQL.',
        'Ignoring relationship cardinality.',
        'Ignoring the lifecycle of embedded child data.'
      ],

      bestPractices: [
        'Design around application access patterns.',
        'Embed data that belongs together and remains bounded.',
        'Reference independently managed or unbounded data.',
        'Use hybrid models where they provide the best operational behaviour.',
        'Consider document growth before finalizing the schema.'
      ],

      interviewAnswer: `Embedding stores related data inside the same MongoDB document, while referencing stores related data separately and connects documents using identifiers.

Embedding can reduce joins and round trips and provides document-level atomicity, while referencing is often better for independently managed, shared, or unbounded data.

The choice should be based on access patterns, cardinality, lifecycle, duplication, and document growth.`,

      keyTakeaways: [
        'Embedding and referencing solve different modelling problems.',
        'Embedding can reduce database round trips.',
        'Referencing helps manage independent or unbounded data.',
        'Relationship cardinality matters.',
        'MongoDB designs can combine both approaches.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 12,
    question:
      'What is document atomicity in MongoDB?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 12,

    answer: {
      groundZero: `Atomicity means an operation is treated as one indivisible unit.

For a single-document MongoDB write, either the document modification succeeds as an operation or it does not leave the document partially updated.

This is an important reason MongoDB data modelling often places related information that must change together inside one document.`,

      coreConcept: `MongoDB provides atomicity at the single-document level.

Even if one update modifies several fields inside the same document, those changes are applied atomically to that document.

For example:

db.accounts.updateOne(
  { accountId: 1001 },
  {
    $inc: {
      balance: -500
    },
    $set: {
      lastUpdated: new Date()
    }
  }
)

The changes to that matching document are part of one atomic document update.`,

      detailedExplanation: `Atomicity should not be confused with durability or replication acknowledgement.

These are related but different concepts.

Atomicity answers:

Can an operation leave part of a single document modification applied while another part of that same modification is not applied?

For a normal single-document write, MongoDB provides atomic behaviour.

Write concern answers a different question:

What acknowledgement is required before MongoDB reports the write as successful?

Durability concerns whether acknowledged data survives failures under the selected configuration.

MongoDB also supports multi-document transactions when atomicity must span multiple documents or collections.

However, transactions should not automatically replace good document modelling.

If information naturally belongs in one bounded business object and must change together, embedding can allow MongoDB's native single-document atomicity to handle the operation without a multi-document transaction.`,

      internalWorking: `Consider:

db.inventory.updateOne(
  { sku: "A100" },
  {
    $inc: {
      available: -1,
      reserved: 1
    }
  }
)

Conceptually:

Document before:

available: 10
reserved: 2

       |
       v

Atomic document update

       |
       v

Document after:

available: 9
reserved: 3

The application should not observe a committed state where only one part of this particular document update has been applied.`,

      architecture: `Single Document

{
  accountId: 1001,
  balance: 5000,
  status: "ACTIVE"
}

        |
        | one update operation
        v

{
  accountId: 1001,
  balance: 4500,
  status: "ACTIVE"
}

Single-document atomic boundary`,

      examples: [
        `Multiple field update:

db.users.updateOne(
  { userId: 1001 },
  {
    $set: {
      status: "ACTIVE",
      verified: true
    },
    $inc: {
      loginCount: 1
    }
  }
)`,

        `Conditional atomic update:

db.inventory.updateOne(
  {
    sku: "A100",
    quantity: {
      $gte: 1
    }
  },
  {
    $inc: {
      quantity: -1
    }
  }
)

The condition and modification are evaluated as part of the operation against the targeted document.`
      ],

      commands: [
        {
          command:
            'db.accounts.updateOne({ accountId: 1001 }, { $inc: { balance: -500 }, $set: { lastUpdated: new Date() } })',
          explanation:
            'Atomically updates multiple fields within one matching document.'
        },
        {
          command:
            'db.inventory.updateOne({ sku: "A100", quantity: { $gte: 1 } }, { $inc: { quantity: -1 } })',
          explanation:
            'Uses a condition in the update filter so the decrement occurs only when sufficient quantity exists.'
        }
      ],

      productionScenario: `Suppose an inventory application first reads:

quantity = 1

Two application requests arrive at nearly the same time.

A poor implementation performs:

1. Read quantity
2. Application decides stock exists
3. Update quantity later

Both application requests may make a decision based on stale information.

A better approach can make the condition part of the update:

db.inventory.updateOne(
  {
    sku: "A100",
    quantity: {
      $gte: 1
    }
  },
  {
    $inc: {
      quantity: -1
    }
  }
)

The application then checks matchedCount or modifiedCount.

This uses MongoDB's atomic single-document operation instead of separating the decision and update unnecessarily.`,

      troubleshootingApproach: `When investigating consistency problems:

1. Identify whether the affected fields are in one document or multiple documents.
2. Capture the exact application sequence.
3. Determine whether the application performs read-then-write logic.
4. Check whether conditions can be included directly in the update filter.
5. Determine whether concurrent writers exist.
6. Check retry behaviour.
7. Check write concern separately from atomicity.
8. Determine whether a transaction is genuinely required.
9. Review whether the data model could place tightly coupled state in one document.

Do not diagnose a consistency problem simply by saying "MongoDB is eventually consistent."

The exact operation, read concern, write concern, topology, and application sequence matter.`,

      commonMistakes: [
        'Confusing atomicity with write concern.',
        'Assuming multiple independent documents are automatically one atomic unit.',
        'Performing unnecessary application-side read-then-write sequences.',
        'Using transactions for operations that naturally fit inside one document.',
        'Ignoring concurrent application writers.'
      ],

      bestPractices: [
        'Use atomic update operators for single-document state changes.',
        'Put important conditions into the update filter when appropriate.',
        'Model tightly coupled bounded data together when it makes architectural sense.',
        'Check matchedCount and modifiedCount.',
        'Use multi-document transactions only when the business operation genuinely requires them.'
      ],

      interviewAnswer: `MongoDB guarantees atomicity for writes to a single document.

An update can modify multiple fields in that document atomically.

This is one reason embedding related bounded data can be powerful.

When atomicity must span multiple documents or collections, MongoDB supports transactions, but transactions should be used only when the business operation requires a multi-document atomic boundary.`,

      keyTakeaways: [
        'Single-document writes are atomic.',
        'Multiple fields in one document can be changed atomically.',
        'Atomicity and write concern are different concepts.',
        'Conditional updates can reduce unsafe read-then-write logic.',
        'Multi-document atomicity may require a transaction.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 13,
    question:
      'What are MongoDB read concern and write concern at a conceptual level?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 13,

    answer: {
      groundZero: `Applications need to answer two important questions when interacting with a distributed database.

For writes:

How much acknowledgement do I require before I consider this write successful?

For reads:

What consistency or isolation guarantees do I require for the data I am reading?

MongoDB uses write concern and read concern to control these behaviours.`,

      coreConcept: `Write concern controls the acknowledgement requested for write operations.

Read concern controls the consistency and isolation properties of read operations.

These settings allow applications to choose behaviour appropriate to the importance and requirements of the workload.`,

      detailedExplanation: `WRITE CONCERN

A common production write concern is:

{ w: "majority" }

This requests acknowledgement after the write satisfies MongoDB's majority acknowledgement semantics for the replica set.

The journal option can also participate in write concern behaviour.

For example:

{
  w: "majority",
  j: true
}

The exact guarantees and defaults depend on MongoDB version and deployment configuration.

READ CONCERN

Common read concern levels include concepts such as:

local
available
majority
linearizable
snapshot

They provide different consistency and isolation semantics and are not interchangeable.

For example, majority read concern is associated with data that has satisfied the replica set's majority commit semantics.

Snapshot read concern is important for obtaining a consistent snapshot in supported contexts such as transactions.

A DBA should not blindly change these settings globally.

Application requirements determine the appropriate balance between:

Consistency
Durability
Latency
Availability`,

      internalWorking: `Simplified replica-set write:

Application
    |
    v
PRIMARY
    |
    | write
    v
Local data
    |
    v
Oplog
    |
    +------> Secondary
    |
    +------> Secondary

Write concern determines what acknowledgement condition must be satisfied before the client receives success.

For reads:

Application
    |
    v
Selected MongoDB member
    |
    v
Read concern rules
    |
    v
Data returned

Read preference and read concern are different.

Read preference primarily controls where reads may be routed.

Read concern controls consistency/isolation semantics.`,

      architecture: `WRITE PATH

Client
  |
  v
Primary
  |
  +----> Secondary
  |
  +----> Secondary
  |
  v
Required acknowledgement reached
  |
  v
Client receives success


READ PATH

Client
  |
  v
Read Preference
  |
  v
Selected Member
  |
  v
Read Concern
  |
  v
Result`,

      examples: [
        `Write concern concept:

db.orders.insertOne(
  {
    orderId: 1001,
    status: "NEW"
  },
  {
    writeConcern: {
      w: "majority"
    }
  }
)`,

        `Read concern can be configured through driver/database/session APIs depending on the application architecture.`,

        `readPreference: secondaryPreferred does not mean the same thing as readConcern: majority.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ getDefaultRWConcern: 1 })',
          explanation:
            'Displays default read/write concern configuration where supported and permitted.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Provides replica-set state information that is useful when investigating replication and acknowledgement issues.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a view of secondary replication progress and can help when investigating lag-related behaviour.'
        }
      ],

      productionScenario: `An application reports that write latency has suddenly increased.

The DBA discovers the application uses majority write concern.

One secondary has severe disk latency and another replica-set member is unavailable.

Instead of immediately changing the application to a weaker write concern, the DBA should investigate:

• Replica-set member health
• Majority availability
• Replication lag
• Disk latency
• Network latency
• Flow control behaviour where relevant
• Recent maintenance
• Elections
• Application timeout configuration

Reducing durability or acknowledgement requirements merely to hide an infrastructure problem can create greater risk.`,

      troubleshootingApproach: `For write-concern problems:

1. Capture the exact write concern.
2. Check replica-set health.
3. Check member states.
4. Check replication lag.
5. Check network connectivity.
6. Check disk latency.
7. Check server logs for write concern timeout or replication messages.
8. Check whether a member is down or recovering.
9. Check application timeout values.
10. Understand the business durability requirement before changing anything.

For read-consistency problems:

1. Capture read concern.
2. Capture read preference.
3. Identify which member served the read.
4. Check replication state and lag.
5. Determine whether sessions/transactions are involved.
6. Reproduce with the exact application semantics.`,

      commonMistakes: [
        'Confusing read concern with read preference.',
        'Assuming w:1 and w:"majority" provide identical acknowledgement semantics.',
        'Weakening write concern only to reduce latency without understanding the risk.',
        'Ignoring replication health when write concern timeouts occur.',
        'Using stronger consistency settings everywhere without understanding workload requirements.'
      ],

      bestPractices: [
        'Choose read and write concerns based on business requirements.',
        'Understand the durability and latency trade-offs.',
        'Monitor replica-set health.',
        'Investigate infrastructure issues before weakening guarantees.',
        'Test concern settings under failure conditions before production adoption.'
      ],

      interviewAnswer: `Write concern defines the acknowledgement required for MongoDB writes, while read concern defines consistency and isolation properties for reads.

For replica sets, majority write concern is commonly used when stronger acknowledgement is required.

Read concern is separate from read preference: read preference controls where reads are routed, while read concern controls the consistency semantics of those reads.`,

      keyTakeaways: [
        'Write concern controls write acknowledgement.',
        'Read concern controls read consistency/isolation semantics.',
        'Read preference and read concern are different.',
        'Stronger guarantees can affect latency and availability characteristics.',
        'Concern settings should reflect business requirements rather than being changed blindly.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 14,
    question:
      'What are MongoDB sessions and transactions, and when are transactions actually necessary?',
    level: 'L2-L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `MongoDB already provides atomicity for operations on a single document.

Sometimes, however, one business operation must modify multiple documents or collections and all of those changes must succeed or fail together.

MongoDB supports transactions for these cases.

Sessions provide the context used for features such as transactions and causal consistency.`,

      coreConcept: `A session represents a sequence of operations associated with a client context.

A transaction groups multiple supported operations into one transactional unit.

The intended outcome is:

COMMIT

All transaction changes become committed.

or:

ABORT

The transaction's changes are not committed.

Transactions are powerful, but they are not a substitute for good MongoDB data modelling.`,

      detailedExplanation: `Suppose money is transferred between two accounts stored as separate documents.

Business requirements may require:

1. Debit Account A.
2. Credit Account B.
3. Create a transfer record.

If these operations must behave as one atomic business unit, a transaction may be appropriate.

MongoDB transactions provide ACID transaction capabilities for supported deployments and operations.

However, MongoDB's document model often allows related bounded information to be represented in one document.

If a business operation can naturally and safely be represented as one document update, using a transaction merely because the old relational implementation used one can add unnecessary complexity.

Transactions have operational cost.

Long-running or unnecessarily large transactions can increase resource consumption and interact with:

• WiredTiger cache pressure
• Locks and concurrency
• Snapshot history
• Replication
• Transaction lifetime limits
• Application retry logic

Therefore the correct question is not:

"Does MongoDB support transactions?"

It does.

The better production question is:

"Does this business operation genuinely require a multi-document transactional boundary?"`,

      internalWorking: `Simplified transaction:

Client
   |
   v
Session
   |
   v
Start Transaction
   |
   +--> Operation 1
   |
   +--> Operation 2
   |
   +--> Operation 3
   |
   v
Commit Transaction
   |
   +--> Success
   |
   +--> Retry handling if required

or:

Abort Transaction

MongoDB drivers provide transaction APIs and applications must correctly handle retryable transaction error conditions according to driver guidance.`,

      architecture: `Application
    |
    v
Client Session
    |
    v
Transaction
    |
    +-- Update Account A
    |
    +-- Update Account B
    |
    +-- Insert Transfer
    |
    v
COMMIT
    |
    v
Business operation complete

Failure before successful commit
    |
    v
ABORT / retry handling`,

      examples: [
        `Possible transaction use case:

Transfer money between two separately stored account documents where the business requires both balance changes to commit together.`,

        `Possible non-transaction use case:

Updating name, email, and status fields inside one user document.

Single-document atomicity already covers the document update.`
      ],

      commands: [
        {
          command:
            `const session = db.getMongo().startSession()

const accounts =
  session.getDatabase("bank").accounts

session.startTransaction()

try {
  accounts.updateOne(
    { accountId: "A" },
    { $inc: { balance: -500 } }
  )

  accounts.updateOne(
    { accountId: "B" },
    { $inc: { balance: 500 } }
  )

  session.commitTransaction()
} catch (error) {
  session.abortTransaction()
  throw error
} finally {
  session.endSession()
}`,
          explanation:
            'Illustrates the transaction lifecycle concept in mongosh. Production application code should use the transaction APIs and retry patterns recommended by its MongoDB driver.'
        }
      ],

      productionScenario: `An application team migrates from SQL.

Every API request is wrapped inside a MongoDB transaction because every SQL service method previously used a transaction.

The production system then experiences unnecessary transaction overhead.

The DBA should work with developers to classify operations:

Single-document operation?

Use MongoDB's document atomicity where appropriate.

Multiple documents but eventual consistency acceptable?

A transaction may not be necessary.

Multiple documents that must commit as one business unit?

A transaction may be justified.

This is a modelling and application-design decision, not merely a database command decision.`,

      troubleshootingApproach: `For transaction problems:

1. Capture the exact transaction operations.
2. Determine transaction duration.
3. Determine number and size of modified documents.
4. Check MongoDB logs.
5. Capture driver error labels and error messages.
6. Check whether application retry logic is implemented correctly.
7. Check for stepdowns or elections.
8. Check network interruptions.
9. Check transaction lifetime behaviour.
10. Check WiredTiger/cache pressure.
11. Determine whether the transaction can be simplified or eliminated through better modelling.

Never troubleshoot only the commit command.

Understand the complete transaction lifecycle.`,

      commonMistakes: [
        'Using transactions for every MongoDB write.',
        'Using transactions to compensate for a relational-style MongoDB schema.',
        'Keeping transactions open unnecessarily long.',
        'Ignoring driver retry requirements.',
        'Assuming transactions eliminate the need for correct write concern and error handling.'
      ],

      bestPractices: [
        'Prefer single-document atomicity when the model naturally supports it.',
        'Use transactions when the business operation genuinely spans multiple documents atomically.',
        'Keep transactions short and focused.',
        'Use official driver transaction APIs.',
        'Test application behaviour during elections and transient failures.'
      ],

      interviewAnswer: `MongoDB sessions provide a client operation context and are used by features including transactions.

Transactions provide ACID semantics when a business operation must atomically modify multiple documents or collections.

MongoDB already provides single-document atomicity, so transactions should not be used automatically for every operation.

Good MongoDB modelling can often reduce the need for multi-document transactions.`,

      keyTakeaways: [
        'MongoDB supports transactions.',
        'Sessions provide transaction context.',
        'Single-document writes are already atomic.',
        'Transactions are appropriate for genuine multi-document atomic business operations.',
        'Long or unnecessary transactions create additional operational cost.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 15,
    question:
      'What are MongoDB namespaces and the important database/collection naming considerations?',
    level: 'L2',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `MongoDB needs a precise way to identify where a collection exists.

A collection does not exist only by its collection name.

It belongs to a particular database.

The combination of database name and collection name is called a namespace.`,

      coreConcept: `A MongoDB namespace is generally represented as:

database.collection

For example:

webapp.questions

Here:

webapp = database

questions = collection

Together:

webapp.questions

is the collection namespace.`,

      detailedExplanation: `Namespaces are important because the same collection name can exist in different databases.

For example:

production.users

staging.users

development.users

These are different namespaces.

This becomes extremely important during DBA operations.

A command executed against the wrong database can affect a completely different collection even if the collection name appears correct.

Naming also affects operational clarity.

Good names should help administrators understand:

• Application ownership
• Environment
• Data purpose
• Lifecycle
• Operational importance

MongoDB also has restrictions and special behaviours associated with certain names and characters.

Applications and DBAs should follow MongoDB's supported database and collection naming rules for their deployed version.

Certain system collections use reserved system-related naming conventions.

Rather than relying on unusual characters or ambiguous naming, production systems should use simple, consistent naming standards.`,

      internalWorking: `When an application accesses:

db.questions.find({})

the meaning of db depends on the current database context.

If the current database is:

webapp

the namespace is:

webapp.questions

If the current database is:

test

the namespace becomes:

test.questions

This is why checking only the collection name during an incident is insufficient.`,

      architecture: `MongoDB Deployment
|
+-- Database: webapp
|      |
|      +-- Collection: questions
|              |
|              +-- Namespace:
|                  webapp.questions
|
+-- Database: test
       |
       +-- Collection: questions
               |
               +-- Namespace:
                   test.questions`,

      examples: [
        `Database:

webapp

Collection:

questions

Namespace:

webapp.questions`,

        `These are different namespaces:

production.orders

staging.orders`
      ],

      commands: [
        {
          command: 'db.getName()',
          explanation:
            'Shows the current database context in mongosh.'
        },
        {
          command: 'db.getCollectionNames()',
          explanation:
            'Lists collections in the current database.'
        },
        {
          command: 'db.questions.getFullName()',
          explanation:
            'Returns the full namespace of the questions collection.'
        },
        {
          command: 'show dbs',
          explanation:
            'Lists databases visible to the authenticated user.'
        }
      ],

      productionScenario: `A DBA receives a request:

"Delete old records from audit collection."

The DBA connects to the server and runs:

db.audit.deleteMany(...)

But the shell is currently using the wrong database.

The filter is correct.

The collection name is correct.

The environment is correct.

But the database context is wrong.

This can become a serious production incident.

Before destructive operations, always verify:

• Host / cluster
• Replica set
• Current primary where relevant
• Database
• Collection
• Filter
• Expected document count

The namespace should be part of every production change review.`,

      troubleshootingApproach: `When data appears missing or commands appear to affect unexpected records:

1. Run db.getName().
2. Verify the collection name.
3. Confirm the full namespace.
4. Confirm the MongoDB host or cluster.
5. Confirm the replica set.
6. Confirm the application connection string.
7. Confirm environment variables.
8. Check whether similarly named databases exist.
9. Verify user privileges on the namespace.
10. Only then investigate deeper storage or replication possibilities.

Namespace mistakes are much simpler than storage-engine corruption and should be ruled out early.`,

      commonMistakes: [
        'Checking the collection name but not the database.',
        'Using ambiguous production and staging database names.',
        'Running destructive commands without confirming the full namespace.',
        'Assuming the shell is still using the database selected earlier.',
        'Using inconsistent naming standards across environments.'
      ],

      bestPractices: [
        'Use simple and consistent database and collection names.',
        'Always verify the current database before production changes.',
        'Include the full namespace in operational procedures.',
        'Keep environment naming clearly distinguishable.',
        'Verify the exact cluster and namespace before destructive operations.'
      ],

      interviewAnswer: `A MongoDB namespace identifies a collection using its database and collection name, such as webapp.questions.

Namespaces matter operationally because identical collection names can exist in different databases.

A DBA should always verify the complete namespace, cluster, and filter before performing production updates, deletes, restores, or maintenance operations.`,

      keyTakeaways: [
        'Namespace normally means database.collection.',
        'Collection name alone does not uniquely describe its location.',
        'The current database context matters in mongosh.',
        'Namespace verification is critical before production changes.',
        'Consistent naming reduces operational mistakes.'
      ]
    }
  },
  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 16,
    question:
      'A collection contains millions of documents with inconsistent field types. What problems can this cause and how would you investigate it?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 16,

    answer: {
      groundZero: `Suppose the same field is stored differently across documents.

For example:

{
  customerId: ObjectId("...")
}

in some documents,

but:

{
  customerId: "..."
}

in other documents.

Even though both values may look similar to a human, MongoDB treats them as different BSON types.

At small scale this may go unnoticed.

At millions of documents, it becomes a serious production data-quality problem.`,

      coreConcept: `MongoDB is type-aware.

Different BSON types affect:

• Equality matching
• Range queries
• Sorting
• Index entries
• Aggregation
• Application deserialization
• Schema validation
• Data migrations

Inconsistent field types can therefore create both correctness and performance problems.`,

      detailedExplanation: `Consider a field named:

customerId

Suppose the collection contains:

70% ObjectId

25% String

5% Integer

An application using:

{
  customerId: ObjectId("...")
}

will not automatically match string values.

Similarly, a report that groups or sorts by customerId may produce unexpected results because the BSON type is part of the stored value.

Other examples include:

createdAt stored as Date and String

amount stored as Double, Decimal128, and String

status stored as String and Integer

phoneNumber stored as Number and String

This can affect indexes too.

If customerId is indexed, the index contains entries corresponding to the actual stored BSON values.

Therefore the problem is not only application formatting.

It exists in the persisted data and its indexes.

A production DBA should first quantify the problem before modifying anything.`,

      internalWorking: `Conceptually:

Application A
    |
    +--> ObjectId customerId

Application B
    |
    +--> String customerId

Application C
    |
    +--> Integer customerId

            |
            v

MongoDB Collection

customerId:
ObjectId
String
Integer

            |
            v

Index on customerId

            |
            v

Index also contains differently typed values

MongoDB does not automatically normalize all of these representations into one logical type.`,

      architecture: `Multiple Writers
       |
       +----------+
       |          |
       v          v
   ObjectId     String
       |          |
       +-----+----+
             |
             v
        Collection
             |
             v
       Mixed BSON Types
             |
      +------+------+
      |             |
      v             v
   Queries        Indexes
      |             |
      v             v
Inconsistent behaviour`,

      examples: [
        `Mixed customerId:

{
  customerId: ObjectId("...")
}

{
  customerId: "64f..."
}`,

        `Mixed date:

{
  createdAt: ISODate("2026-09-05T10:00:00Z")
}

{
  createdAt: "2026-09-05T10:00:00Z"
}`,

        `Mixed amount:

{
  amount: NumberDecimal("1000.00")
}

{
  amount: "1000.00"
}`
      ],

      commands: [
        {
          command:
            `db.customers.aggregate([
  {
    $group: {
      _id: {
        $type: "$customerId"
      },
      count: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      count: -1
    }
  }
])`,
          explanation:
            'Counts documents grouped by the BSON type of customerId.'
        },
        {
          command:
            'db.customers.find({ customerId: { $type: "string" } }).limit(20)',
          explanation:
            'Samples documents where customerId is stored as a string.'
        },
        {
          command:
            'db.customers.countDocuments({ customerId: { $type: "objectId" } })',
          explanation:
            'Counts documents where customerId is stored as ObjectId.'
        },
        {
          command:
            `db.customers.aggregate([
  {
    $project: {
      customerId: 1,
      type: {
        $type: "$customerId"
      }
    }
  },
  {
    $limit: 50
  }
])`,
          explanation:
            'Shows sample values together with their BSON types.'
        }
      ],

      productionScenario: `Suppose an application has been running for three years.

Historically, customerId was stored as ObjectId.

Six months ago, a new microservice started writing customerId as String.

Now some customer lookups succeed and others return no results.

The application team reports:

"MongoDB randomly cannot find customers."

MongoDB is not randomly losing records.

The application is querying using one BSON type while some documents contain another type.

The DBA should identify:

• Which BSON types exist
• When the change started
• Which writer introduced it
• How many documents are affected
• Whether affected values can be safely converted
• Whether indexes are involved
• How a cleanup will affect replication and system load`,

      troubleshootingApproach: `A production-safe approach is:

1. Fix the writer first.

Do not begin historical cleanup while new invalid records are still being created.

2. Quantify the problem.

Use $type and aggregation to count each type.

3. Determine the affected time range.

Use createdAt, updatedAt, application version, source system, or audit information.

4. Define the canonical type.

For example:

customerId must be ObjectId.

5. Validate convertibility.

Not every string is necessarily a valid ObjectId.

6. Test the conversion on a small sample.

7. Ensure recoverability.

Use backup, snapshots, or an appropriate recovery strategy.

8. Perform migration in controlled batches.

Do not rewrite millions of production documents blindly in one huge operation.

9. Monitor:

CPU
Disk latency
Replication lag
Oplog window
WiredTiger cache
Write latency

10. Add schema validation after compatibility is confirmed.

The objective is not only to repair the current data but also to prevent recurrence.`,

      commonMistakes: [
        'Starting a massive update before fixing the application writer.',
        'Assuming every string can safely be converted.',
        'Ignoring replication lag during large data corrections.',
        'Ignoring the effect of updating indexed fields.',
        'Adding strict validation before cleaning or understanding historical data.',
        'Treating inconsistent BSON types as only an application display issue.'
      ],

      bestPractices: [
        'Profile BSON types before migration.',
        'Fix the source of bad data first.',
        'Migrate large collections in controlled batches.',
        'Monitor replica-set health during the cleanup.',
        'Use schema validation to enforce the final type.',
        'Test the conversion and rollback strategy before production execution.'
      ],

      interviewAnswer: `Inconsistent BSON types can cause equality queries, sorting, aggregation, indexing, and application behaviour to become inconsistent.

I would first identify and stop the application producing incorrect types.

Then I would use $type and aggregation to quantify each representation, determine the intended canonical BSON type, test conversions, migrate affected documents in controlled batches, monitor replication and storage impact, and finally add schema validation to prevent recurrence.`,

      keyTakeaways: [
        'BSON type is part of the value.',
        'Mixed types can create both correctness and performance problems.',
        'Fix the bad writer before historical cleanup.',
        'Large corrections must be capacity planned.',
        'Schema validation helps prevent recurrence.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 17,
    question:
      'An application accidentally stores dates as strings instead of BSON Date values. What are the consequences and how would you correct the design?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 17,

    answer: {
      groundZero: `A value that looks like a date is not necessarily stored as a date.

For example:

{
  createdAt: "2026-09-05T10:00:00Z"
}

contains a string.

But:

{
  createdAt: ISODate("2026-09-05T10:00:00Z")
}

contains a BSON Date.

These two values behave differently inside MongoDB.`,

      coreConcept: `Dates should normally be stored using BSON Date when the field represents an actual point in time.

Storing dates as strings can complicate:

• Date comparisons
• Range queries
• Aggregation
• TTL indexes
• Sorting
• Date arithmetic
• Timezone handling
• Schema consistency`,

      detailedExplanation: `A string contains characters.

A BSON Date represents a time value.

If all date strings are formatted perfectly using the same ISO-8601 format, lexical string sorting may appear to work in certain situations.

However, this is fragile.

For example:

2026-09-05T10:00:00Z

2026-09-05 10:00:00

05-09-2026

09/05/2026

are all strings with different formats.

MongoDB cannot safely treat arbitrary string formats as equivalent date values.

BSON Date allows native operators and expressions such as:

$dateAdd

$dateSubtract

$dateDiff

$year

$month

$dayOfMonth

$dateTrunc

TTL indexes also require appropriate date-valued fields.

Therefore a string-based date design can eventually affect both functionality and performance.`,

      internalWorking: `Incorrect design:

Application
    |
    v
"2026-09-05T10:00:00Z"
    |
    v
BSON String
    |
    v
MongoDB

Correct design:

Application
    |
    v
Date object
    |
    v
MongoDB Driver
    |
    v
BSON Date
    |
    v
MongoDB

The BSON type is stored as part of the field value.

MongoDB does not automatically convert every date-looking string to Date.`,

      architecture: `STRING DATE

"2026-09-05..."
      |
      v
BSON String
      |
      +--> String semantics
      |
      +--> No native TTL date behaviour


BSON DATE

ISODate(...)
      |
      v
BSON Date
      |
      +--> Date comparisons
      +--> Date expressions
      +--> TTL compatibility
      +--> Consistent chronological semantics`,

      examples: [
        `Wrong:

{
  createdAt: "2026-09-05T10:00:00Z"
}`,

        `Preferred:

{
  createdAt: ISODate("2026-09-05T10:00:00Z")
}`,

        `Potentially dangerous mixed collection:

{
  createdAt: ISODate("2026-09-05T10:00:00Z")
}

{
  createdAt: "2026-09-05T10:00:00Z"
}`
      ],

      commands: [
        {
          command:
            `db.events.aggregate([
  {
    $group: {
      _id: {
        $type: "$createdAt"
      },
      count: {
        $sum: 1
      }
    }
  }
])`,
          explanation:
            'Shows how many documents contain each BSON type for createdAt.'
        },
        {
          command:
            'db.events.find({ createdAt: { $type: "string" } }).limit(20)',
          explanation:
            'Samples documents where createdAt is incorrectly stored as String.'
        },
        {
          command:
            `db.events.aggregate([
  {
    $project: {
      createdAt: 1,
      convertedDate: {
        $convert: {
          input: "$createdAt",
          to: "date",
          onError: null,
          onNull: null
        }
      }
    }
  }
])`,
          explanation:
            'Tests whether existing string values can be converted to dates without immediately modifying source documents.'
        }
      ],

      productionScenario: `Suppose an application stores:

expireAt: "2026-09-05T10:00:00Z"

The team later wants automatic cleanup using a TTL index.

They create an index on expireAt but records do not expire as expected because the application did not store proper BSON Date values.

The correct sequence should be:

1. Fix the application writer.
2. Determine existing date formats.
3. Test conversion.
4. Correct historical data safely.
5. Validate the stored BSON types.
6. Configure the TTL index correctly.
7. Monitor actual expiration behaviour.`,

      troubleshootingApproach: `For date-type issues:

1. Use $type to determine whether the field is Date or String.
2. Group documents by type.
3. Sample string formats.
4. Identify multiple timezone representations.
5. Identify malformed values.
6. Determine the desired canonical timezone policy.
7. Fix the application writer.
8. Test $convert or $dateFromString.
9. Migrate historical data in controlled batches.
10. Validate application queries.
11. Add schema validation.
12. Only then depend on date-specific features such as TTL.

Do not bulk-convert millions of values before testing invalid formats.`,

      commonMistakes: [
        'Assuming an ISO-looking string is equivalent to a BSON Date.',
        'Using mixed date formats.',
        'Ignoring timezone conversion.',
        'Creating a TTL design while dates remain strings.',
        'Converting large collections without handling invalid data.'
      ],

      bestPractices: [
        'Store actual timestamps as BSON Date.',
        'Use a consistent timezone policy, commonly UTC for persisted timestamps.',
        'Convert dates at application ingestion boundaries.',
        'Validate important timestamp fields.',
        'Test historical conversion before bulk updates.'
      ],

      interviewAnswer: `A date stored as a string does not have BSON Date semantics.

This can affect range queries, sorting consistency, date aggregation operators, and TTL expiration.

I would fix the application to write BSON Date values, inspect existing formats and timezones, test conversion using $convert or $dateFromString, migrate historical documents safely in batches, verify queries and indexes, and add schema validation.`,

      keyTakeaways: [
        'Date-looking strings are still strings.',
        'BSON Date provides native date semantics.',
        'TTL designs require proper date values.',
        'Timezone and invalid formats must be handled during migration.',
        'The writer should be corrected before historical cleanup.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 18,
    question:
      'A document keeps growing because an application continuously appends elements to an array. What risks does this create?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 18,

    answer: {
      groundZero: `Arrays are useful in MongoDB.

But an array should not normally grow forever.

If an application continuously appends new values into the same document, that document can become extremely large.

Eventually it can approach MongoDB's maximum BSON document size of 16 MiB.`,

      coreConcept: `An unbounded array is a common MongoDB schema anti-pattern.

Problems can include:

• Document growth
• Larger reads
• Larger network payloads
• More working-set memory usage
• Expensive updates
• Multikey index growth
• Replication overhead
• Backup/restore overhead
• Eventually reaching the 16 MiB document limit`,

      detailedExplanation: `Consider:

{
  deviceId: "SERVER01",
  events: [
    ...
  ]
}

Every minute the application performs:

$push

to append another event.

One day this document contains thousands of events.

Later it contains hundreds of thousands.

The array is therefore unbounded.

Even before reaching 16 MiB, the design can become inefficient.

If normal queries return the complete document, unnecessary historical information travels across the network.

If an indexed path exists inside the array, the corresponding multikey index can grow significantly.

Large documents can also occupy more of the working set.

The underlying storage engine can compress data and manage physical records efficiently, but storage-engine behaviour does not eliminate the logical modelling issue.`,

      internalWorking: `Repeated design:

Document
|
+-- deviceId
|
+-- events[]
      |
      +-- event 1
      +-- event 2
      +-- event 3
      +-- ...
      +-- event 1,000,000

Every new event changes the same logical document.

Alternative:

devices
|
+-- one bounded device record

events
|
+-- event document
+-- event document
+-- event document
+-- ...

or:

bucket documents containing bounded groups of events.`,

      architecture: `BAD DESIGN

Device Document
|
+-- metadata
|
+-- events[]
      |
      +-- grows
      +-- grows
      +-- grows
      +-- grows forever


BETTER DESIGN

Device Document
|
+-- metadata
+-- current summary

Separate Events
|
+-- Event
+-- Event
+-- Event

or

Time Buckets
|
+-- Bucket 1
+-- Bucket 2
+-- Bucket 3`,

      examples: [
        `Bad:

{
  userId: 1001,
  loginHistory: [
    ...every login since account creation...
  ]
}`,

        `Better approach:

users collection stores current user information.

loginEvents collection stores individual historical login events.`,

        `For telemetry workloads, a time-series collection may be more suitable depending on requirements.`
      ],

      commands: [
        {
          command:
            `db.users.aggregate([
  {
    $project: {
      _id: 1,
      sizeBytes: {
        $bsonSize: "$$ROOT"
      },
      eventCount: {
        $size: {
          $ifNull: [
            "$events",
            []
          ]
        }
      }
    }
  },
  {
    $sort: {
      sizeBytes: -1
    }
  },
  {
    $limit: 20
  }
])`,
          explanation:
            'Helps identify large documents and the number of elements in the events array.'
        },
        {
          command:
            'db.users.findOne({ _id: userId }, { events: { $slice: -20 } })',
          explanation:
            'Returns only the last 20 array elements for a read, but does not solve the underlying storage-growth problem.'
        }
      ],

      productionScenario: `A monitoring application stores every heartbeat event inside one server document.

After one year, documents become very large.

The application reports slower reads and growing memory usage.

The DBA finds:

• Very large BSON documents
• Huge arrays
• Large network responses
• A multikey index on an array field
• Continuous $push operations

The correct fix is not simply:

Increase RAM.

The schema should be reviewed.

A separate events collection, time-series collection, bucket pattern, or explicit retention strategy may be more appropriate.`,

      troubleshootingApproach: `For growing-document incidents:

1. Measure document sizes using $bsonSize.
2. Measure array lengths.
3. Identify fastest-growing documents.
4. Determine the append rate.
5. Estimate future size.
6. Review query projections.
7. Check indexes on the array.
8. Measure network response size.
9. Review WiredTiger cache pressure.
10. Review replication impact.
11. Determine whether historical data requires a separate collection.
12. Define retention.

Do not wait until the document reaches 16 MiB.

That is the hard maximum, not a recommended operating size.`,

      commonMistakes: [
        'Using a MongoDB document as an unlimited event log.',
        'Waiting until the 16 MiB limit is reached.',
        'Assuming projection alone solves underlying document growth.',
        'Creating multikey indexes on massive arrays without measuring index size.',
        'Increasing hardware instead of correcting an unbounded schema.'
      ],

      bestPractices: [
        'Keep arrays bounded.',
        'Store unlimited history separately.',
        'Consider bucketing or time-series modelling for event workloads.',
        'Monitor document-size growth.',
        'Define retention policies early.',
        'Design history and current-state data separately where appropriate.'
      ],

      interviewAnswer: `Continuously appending to an array creates an unbounded document.

This can lead to larger reads and writes, increased cache and network usage, larger multikey indexes, replication overhead, and eventually the 16 MiB BSON document limit.

I would measure document and array growth, identify the access pattern, and redesign historical data using separate documents, bucketing, or time-series modelling while keeping the parent document bounded.`,

      keyTakeaways: [
        'Arrays should generally have a predictable bound.',
        '16 MiB is a hard document limit.',
        'Large documents cause problems before reaching that limit.',
        'Historical event data often belongs in separate or bucketed documents.',
        'Schema redesign is usually better than simply adding hardware.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 19,
    question:
      'How would you design a MongoDB data model for a real application starting from requirements?',
    level: 'L3 Scenario',
    difficulty: 'Advanced',
    order: 19,

    answer: {
      groundZero: `Good MongoDB schema design does not start with:

"How many collections should I create?"

It starts with:

"How does the application use the data?"

You first understand the business requirements.

Then you design documents and indexes around the important access patterns.`,

      coreConcept: `A MongoDB data-model design should evaluate:

• Business entities
• Read patterns
• Write patterns
• Relationship cardinality
• Data ownership
• Document growth
• Atomicity requirements
• Retention requirements
• Query sorting
• Index requirements
• Expected data volume
• Throughput
• Sharding requirements if scale eventually demands it`,

      detailedExplanation: `A practical design process begins by identifying the most important operations.

For example:

1. Find a customer by customerId.
2. Display the customer's latest 20 orders.
3. Display one complete order.
4. Update an order status.
5. Search orders by date.
6. Delete operational logs older than 90 days.

Then ask:

Which data is always read together?

Which data changes together?

Which relationships are one-to-one?

Which are one-to-many?

Can that many relationship grow forever?

Which information is shared between many parent records?

Which state must be historically preserved?

Which operations require atomic consistency?

From those answers, determine:

• Document boundaries
• Embedding
• Referencing
• Arrays
• BSON types
• Validation
• Indexes
• Retention

Index design should follow query design.

For example, if a critical query is:

{
  customerId: 1001
}

sorted by:

{
  createdAt: -1
}

then an index strategy should be evaluated for that actual query shape rather than simply indexing every field individually.`,

      internalWorking: `Schema design influences:

Document size
    |
    +--> Working set
    +--> Network transfer
    +--> Update behaviour

Document boundaries
    |
    +--> Atomicity
    +--> Transaction requirements

Field design
    |
    +--> BSON types
    +--> Query behaviour

Indexes
    |
    +--> Read performance
    +--> RAM usage
    +--> Write overhead

Shard key
    |
    +--> Distribution
    +--> Routing
    +--> Scalability

Therefore schema design is directly related to performance and operations.`,

      architecture: `Requirements
     |
     v
Access Patterns
     |
     v
Read / Write Analysis
     |
     v
Cardinality + Growth
     |
     v
Document Boundaries
     |
     +--> Embed
     |
     +--> Reference
     |
     v
BSON Types
     |
     v
Validation
     |
     v
Index Design
     |
     v
Capacity Testing
     |
     v
Production Monitoring`,

      examples: [
        `E-commerce:

Order items are normally read together with the order and should preserve purchase-time values.

Embedding item snapshots inside the order may be appropriate.`,

        `Product catalogue:

Products are shared by many orders and have an independent lifecycle.

A productId reference may be appropriate.`,

        `Telemetry:

Millions of measurements should not normally be appended forever into one device document.

Time-series or bucketed modelling should be evaluated.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).limit(20).explain("executionStats")',
          explanation:
            'Tests whether an important access pattern is efficient.'
        },
        {
          command:
            'db.orders.getIndexes()',
          explanation:
            'Shows indexes that support the collection workload.'
        },
        {
          command:
            'db.orders.stats()',
          explanation:
            'Provides collection statistics useful during capacity and storage analysis.'
        }
      ],

      productionScenario: `Suppose you are designing an e-commerce system.

Requirements:

A customer can place many orders.

Each order can contain up to 50 items.

An order should preserve the product name and price as they existed at purchase time.

The product catalogue changes independently.

Customers frequently view their latest orders.

Payment events can grow over time.

A reasonable model might be:

orders:

{
  _id,
  customerId,
  createdAt,
  status,
  shippingAddress,
  items: [
    {
      productId,
      productName,
      purchasePrice,
      quantity
    }
  ],
  paymentSummary
}

The items are bounded and belong to the order.

ProductId still references the independent product catalogue.

Detailed payment event history can live in another collection if it grows independently.

This design follows the business access pattern rather than copying relational tables directly.`,

      troubleshootingApproach: `When reviewing an existing schema:

1. Capture the top business operations.
2. Count database calls required for each operation.
3. Identify expensive $lookup operations.
4. Identify oversized documents.
5. Identify unbounded arrays.
6. Check schema/type inconsistency.
7. Identify transactions.
8. Run explain for critical queries.
9. Check index sizes.
10. Compare current design against actual access patterns.
11. Prototype an improved document model.
12. Benchmark it using realistic data volume.

A schema should be validated with workload testing, not only diagrams.`,

      commonMistakes: [
        'Starting from SQL tables rather than application access patterns.',
        'Embedding without considering cardinality and growth.',
        'Referencing everything automatically.',
        'Creating indexes before defining important queries.',
        'Ignoring retention and data lifecycle.',
        'Designing only for current tiny data volume.'
      ],

      bestPractices: [
        'Document important read and write patterns first.',
        'Design for realistic future growth.',
        'Keep embedded relationships bounded.',
        'Use consistent BSON types.',
        'Design indexes around query shapes.',
        'Benchmark with realistic data volume.',
        'Revisit the model as application access patterns evolve.'
      ],

      interviewAnswer: `I start MongoDB data modelling from application access patterns rather than tables.

I identify major reads and writes, entity relationships, cardinality, ownership, growth, atomicity requirements, retention, and expected scale.

Then I decide document boundaries, embedding versus referencing, BSON types, validation, and indexes.

Finally, I test important queries with realistic data and explain plans before production.`,

      keyTakeaways: [
        'MongoDB schema design starts with application requirements.',
        'Access patterns drive document boundaries.',
        'Cardinality and growth determine embedding decisions.',
        'Schema and index design must be considered together.',
        'Production modelling requires realistic workload testing.'
      ]
    }
  },

  {
    category: 'mongodb_fundamentals',
    topicId: 'mongodb-fundamentals',
    topicNumber: 1,
    topicName: 'MongoDB Fundamentals',
    questionNumber: 20,
    question:
      'An application migrated from SQL to MongoDB but copied the relational table design directly. Why can this perform badly and how would you redesign it?',
    level: 'L3+ Scenario',
    difficulty: 'Advanced',
    order: 20,

    answer: {
      groundZero: `Moving data from SQL to MongoDB does not automatically make the application use MongoDB efficiently.

If every SQL table simply becomes one MongoDB collection, the application may preserve the exact relational design and continue requiring many joins or multiple database calls.

MongoDB's document model is intended to let related data be modelled according to application access patterns.`,

      coreConcept: `A one-table-to-one-collection migration can cause:

• Excessive database round trips
• Heavy use of $lookup
• Application-side joins
• More transactions
• More indexes
• Higher latency
• More complex application logic

The redesign should begin with real application read/write patterns rather than blindly denormalizing everything.`,

      detailedExplanation: `Suppose the relational system has:

customers
orders
order_items
addresses
payments
shipments

The migration creates:

customers collection
orders collection
order_items collection
addresses collection
payments collection
shipments collection

Now displaying one order requires retrieving data from all six collections.

MongoDB can perform joins using $lookup, but the existence of $lookup does not mean a highly normalized relational design should always be copied directly.

If certain data belongs strongly to an order and is always retrieved with it, that data may be a good embedding candidate.

For example:

Order
|
+-- shippingAddress
|
+-- items[]
|
+-- paymentSummary
|
+-- shipmentSummary

Some independent entities may still remain referenced.

For example:

customer
product catalogue
large payment event history

The goal is not:

"Put everything into one document."

The goal is:

"Create document boundaries that match business access patterns while remaining bounded and maintainable."`,

      internalWorking: `Relational-style MongoDB:

Application Request
       |
       +--> Query orders
       |
       +--> Query order_items
       |
       +--> Query address
       |
       +--> Query payment
       |
       +--> Query shipment
       |
       v
Application assembles result

Every query introduces additional:

Network work
Query planning
Connection usage
Server execution
Latency

Document-oriented model:

Application Request
       |
       v
Order Document
       |
       +--> Items
       +--> Shipping snapshot
       +--> Payment summary
       +--> Shipment summary

       |
       v
Fewer database round trips

while references remain where independently managed data requires them.`,

      architecture: `COPIED SQL DESIGN

Request
 |
 +--> Orders
 |
 +--> Order Items
 |
 +--> Address
 |
 +--> Payment
 |
 +--> Shipment
 |
 v
Assemble in Application


MONGODB-ORIENTED DESIGN

Request
 |
 v
Order Aggregate
 |
 +-- Order fields
 +-- Items[]
 +-- Address snapshot
 +-- Payment summary
 +-- Shipment summary
 |
 +--> Targeted references only
 |
 v
Response`,

      examples: [
        `Relational:

orders
order_items

Possible MongoDB redesign:

{
  orderId: 1001,
  items: [
    {
      productId: "...",
      name: "Laptop",
      quantity: 1,
      purchasePrice: 50000
    }
  ]
}`,

        `A shared product catalogue can remain referenced because products exist independently and are used by many orders.`,

        `A shipping address used at purchase time can be embedded as a historical snapshot even if the customer later changes their current address.`
      ],

      commands: [
        {
          command:
            'db.orders.find({ customerId: 1001 }).sort({ createdAt: -1 }).limit(20).explain("executionStats")',
          explanation:
            'Measures an important redesigned order access pattern.'
        },
        {
          command:
            `db.orders.aggregate([
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
    $limit: 20
  }
])`,
          explanation:
            'Illustrates retrieving recent orders directly from the redesigned order collection.'
        }
      ],

      productionScenario: `An order-detail API performs seven database queries.

Query 1: order

Query 2: customer

Query 3: address

Query 4: order items

Query 5: products

Query 6: payment

Query 7: shipment

At low traffic this appears acceptable.

After production traffic increases:

• API latency increases
• Connection pool usage increases
• Database operations per request increase
• Transaction complexity increases
• More indexes are required
• Application logic becomes difficult to maintain

The redesign process should determine which pieces belong to the order aggregate.

For example, order items, shipping snapshot, price-at-purchase information, and summary state may be embedded.

Shared or unbounded information can remain referenced.

The new model should then be benchmarked against the old model before migration.`,

      troubleshootingApproach: `A systematic redesign process:

1. Trace one slow business request end-to-end.

2. Count how many MongoDB operations it performs.

3. List the collections involved.

4. Identify which data is always retrieved together.

5. Identify which data changes independently.

6. Calculate relationship cardinality.

7. Identify unbounded relationships.

8. Identify transaction boundaries.

9. Identify historical snapshot requirements.

10. Propose a bounded aggregate document.

11. Design indexes for the new query shapes.

12. Create realistic test data.

13. Benchmark:

Latency
Throughput
Documents examined
Keys examined
CPU
Memory
Network
Storage

14. Plan migration.

15. Define rollback.

A redesign should be evidence-based rather than based only on theoretical schema preferences.`,

      commonMistakes: [
        'Mapping every relational table to one MongoDB collection.',
        'Replacing SQL joins with many application-side queries.',
        'Using $lookup everywhere to recreate a relational application.',
        'Reacting by embedding everything into one giant document.',
        'Ignoring historical snapshot requirements.',
        'Migrating without benchmarking the redesigned workload.'
      ],

      bestPractices: [
        'Treat SQL-to-MongoDB migration as a data-model redesign.',
        'Use actual application access patterns.',
        'Embed bounded owned data.',
        'Reference shared or independently growing data.',
        'Minimize unnecessary multi-document transactions.',
        'Benchmark before production cutover.',
        'Maintain a tested rollback plan.'
      ],

      interviewAnswer: `A direct table-to-collection migration can perform poorly because it preserves a normalized relational access pattern that may require many queries, lookups, and transactions.

I would analyse actual application reads and writes, identify data that belongs together, embed bounded owned information, retain references for shared or unbounded entities, redesign indexes around the new query shapes, and benchmark the model with realistic data before migration.`,

      keyTakeaways: [
        'SQL-to-MongoDB migration is not only a data-copy exercise.',
        'Relational normalization should not be reproduced mechanically.',
        'Document boundaries should match application access patterns.',
        'Embedding and referencing should be used intentionally.',
        'A successful redesign must be benchmarked before production cutover.'
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
       REMOVE ONLY PREVIOUS TOPIC 1 V2 RECORDS

       Your old categories such as:
       mongodb_basics
       linux_basics
       replication
       atlas

       are NOT touched.
    ===================================================== */

    const deleteResult =
      await collection.deleteMany({
        category: 'mongodb_fundamentals'
      });

    console.log(
      `Removed ${deleteResult.deletedCount} previous mongodb_fundamentals documents`
    );


    /* =====================================================
       INSERT ALL 20 TOPIC 1 QUESTIONS
    ===================================================== */

    const insertResult =
      await collection.insertMany(
        questions,
        {
          ordered: true
        }
      );

    console.log(
      `Inserted ${insertResult.insertedCount} MongoDB Fundamentals questions`
    );


    /* =====================================================
       CREATE INDEX

       We intentionally use a PARTIAL unique index.

       This means only documents containing the new topicId
       field participate in this uniqueness rule.

       Your old 40 documents are therefore unaffected.
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
          'mongodb_fundamentals'
      });

    console.log(
      `Topic 1 count: ${count}`
    );


    if (count !== 20) {
      throw new Error(
        `Validation failed: expected 20 questions, found ${count}`
      );
    }


    console.log(
      'Topic 1 seed completed successfully.'
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
    'Topic 1 seed failed:'
  );

  console.error(error);

  process.exit(1);
});
