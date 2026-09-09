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
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 1,
    question:
      'What is the difference between authentication and authorization in MongoDB, and why must a DBA understand both separately?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

A MongoDB user may successfully authenticate but still receive an authorization error when trying to perform an operation that its assigned roles do not permit.`,

      coreConcept: `Client
  |
  v
Authentication
"Who are you?"
  |
success
  |
  v
Authorization
"What can you do?"
  |
  v
Allowed or denied operation`,

      detailedExplanation: `MongoDB security separates identity verification from permission evaluation.

AUTHENTICATION

Authentication verifies the identity of a user or service.

Examples of authentication mechanisms can include:

• SCRAM
• X.509
• LDAP-related enterprise integrations
• OIDC in supported deployments/products
• internal cluster authentication mechanisms.

AUTHORIZATION

After identity is established, MongoDB evaluates privileges granted through roles.

A role can permit actions such as:

• find
• insert
• update
• remove
• createCollection
• createIndex
• user administration
• replication/cluster administration.

Example:

User:
appUser

Role:
readWrite on applicationDB

Authentication:
SUCCESS

Attempt:
db.adminCommand(...)

Authorization:
DENIED

This is expected because authentication does not grant unlimited privileges.

A DBA troubleshooting a login problem should first determine whether the error occurs during:

authentication

or:

authorization.

This distinction immediately narrows the investigation.

Authentication failures may involve:

• wrong username/password
• wrong authentication database
• unsupported mechanism
• TLS/X.509 issue
• user does not exist.

Authorization failures usually mean:

• user authenticated successfully
• required privilege is missing
• role was assigned against the wrong database
• custom-role privilege is incomplete.`,

      internalWorking: `Username/password
      |
      v
Identity validated?
   /       \
  NO       YES
  |         |
auth      check role
error       |
            v
       privilege exists?
         /       \
        NO       YES
        |         |
     unauthorized operation runs`,

      architecture: `             APPLICATION
                  |
                  v
            AUTHENTICATION
                  |
                  v
              USER IDENTITY
                  |
                  v
             AUTHORIZATION
                  |
             role privileges
                  |
                  v
             MongoDB action`,

      examples: [
        `A user can authenticate successfully but still lack permission to create indexes.`,
        `Wrong authSource can cause authentication failure even if the username/password are correct.`,
        `Granting root privileges to solve an authorization issue violates least privilege.`
      ],

      commands: [
        {
          command:
            'db.runCommand({ connectionStatus: 1, showPrivileges: true })',
          explanation:
            'Shows authenticated users and privilege information available to the current connection, subject to version and privileges.'
        }
      ],

      productionScenario: `An application reports:

Unauthorized: not authorized on sales to execute command find

The DBA confirms the connection itself succeeded.

This means authentication worked.

The investigation moves to:

• roles
• target database
• required find privilege.

The DBA fixes the missing role instead of resetting the password unnecessarily.`,

      troubleshootingApproach: `1. Capture the exact error.

2. Determine authentication or authorization stage.

3. Verify username.

4. Verify authentication database.

5. Verify authentication mechanism.

6. If login succeeds, inspect assigned roles.

7. Identify required action/resource.

8. Compare required privilege with current roles.

9. Grant only the minimum missing privilege.

10. Retest using the same client context.`,

      commonMistakes: [
        'Treating authentication and authorization as the same thing.',
        'Resetting passwords for authorization failures.',
        'Granting root to solve a narrow privilege issue.',
        'Ignoring authentication database.',
        'Testing with a different privileged account and assuming the application user is fixed.'
      ],

      bestPractices: [
        'Classify security errors correctly.',
        'Use least privilege.',
        'Document application roles.',
        'Test using the actual application identity.',
        'Separate identity management from privilege management.'
      ],

      interviewAnswer: `Authentication verifies who the MongoDB client is, while authorization determines what that authenticated identity is allowed to do.

When troubleshooting, I first separate login failures from privilege failures. If authentication succeeds but the operation is denied, I inspect roles and required actions rather than changing credentials or granting broad administrative access.`,

      keyTakeaways: [
        'Authentication proves identity.',
        'Authorization controls actions.',
        'A successful login does not imply full access.',
        'Auth failures and privilege failures require different troubleshooting.',
        'Least privilege is the correct design principle.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 2,
    question:
      'How does SCRAM authentication work conceptually in MongoDB, and why does MongoDB not need to store a user password in plain text?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `SCRAM is a username/password-based authentication mechanism.

The password itself does not need to be stored in MongoDB as plain text.

Instead, MongoDB stores credential material derived from the password and uses a challenge-response exchange to prove that the client knows the password.`,

      coreConcept: `User password
    |
    v
derived credential
stored securely

Login:

client <---- challenge ----> MongoDB
       proof of password knowledge

Plain password does not need
to be stored as readable text.`,

      detailedExplanation: `SCRAM stands for:

Salted Challenge Response Authentication Mechanism.

Conceptually:

1. USER CREATION

A password is supplied when creating the user.

MongoDB derives authentication credential information using cryptographic processing.

2. CLIENT CONNECTS

The client provides:

• username
• authentication database
• authentication mechanism or negotiates supported behavior.

3. CHALLENGE/RESPONSE

The client and server exchange values that allow the client to prove knowledge of the password without simply transmitting a reusable plain-text password representation as the authentication proof.

4. SERVER VALIDATES

MongoDB verifies the proof against stored credential material.

Modern MongoDB commonly uses SCRAM-SHA-256 where supported and configured.

Older deployments may also contain SCRAM-SHA-1 credentials depending on version/history.

The DBA should not manually modify the underlying user credential documents.

User administration should be performed through MongoDB commands.

SCRAM protects password verification, but it does not replace TLS.

Without TLS, other connection metadata and database traffic may still be exposed to network risks.

Therefore production security generally combines:

authentication
+
authorization
+
TLS
+
network controls.`,

      internalWorking: `Password
   |
   v
credential derivation
   |
   v
stored verifier material

During login:

server challenge
      |
      v
client proof
      |
      v
server verifies
      |
      v
authenticated`,

      architecture: `               CLIENT
                  |
             SCRAM exchange
                  |
                  v
                MONGOD
                  |
              credential
              verification
                  |
                  v
                user
             authenticated`,

      examples: [
        `SCRAM-SHA-256 is commonly used for password authentication in modern MongoDB deployments.`,
        `SCRAM authentication still benefits from TLS because database traffic needs transport protection.`,
        `Changing a user password regenerates the relevant credential material through supported commands.`
      ],

      commands: [
        {
          command:
            'db.createUser({ user: "<user>", pwd: passwordPrompt(), roles: [{ role: "readWrite", db: "<database>" }] })',
          explanation:
            'Creates a user securely without embedding a password directly in command history when passwordPrompt() is supported in mongosh.'
        }
      ],

      productionScenario: `A developer asks whether MongoDB stores the application password as readable text.

The DBA explains that SCRAM uses derived credential information and challenge-response verification.

The team still enables TLS because authentication protection alone does not encrypt all application traffic.`,

      troubleshootingApproach: `1. Verify username.

2. Verify authSource.

3. Verify mechanism compatibility.

4. Check server logs for authentication failure.

5. Verify the user exists in the expected authentication database.

6. Reset credentials through supported user commands if required.

7. Verify TLS connectivity separately.

8. Never inspect or edit internal credential data manually.`,

      commonMistakes: [
        'Assuming SCRAM encrypts all MongoDB traffic.',
        'Embedding passwords directly in scripts and shell history.',
        'Editing system user documents manually.',
        'Using outdated mechanisms without a compatibility reason.',
        'Ignoring authSource.'
      ],

      bestPractices: [
        'Prefer current supported authentication mechanisms.',
        'Use TLS with password authentication.',
        'Avoid credentials in command history.',
        'Rotate credentials securely.',
        'Use supported user-management commands.'
      ],

      interviewAnswer: `SCRAM is a salted challenge-response authentication mechanism. MongoDB stores derived credential material rather than needing the readable password itself, and the client proves knowledge of the password during authentication.

I still use TLS because SCRAM authenticates identity but does not replace transport encryption.`,

      keyTakeaways: [
        'SCRAM is password-based authentication.',
        'Passwords are not stored as plain text.',
        'Authentication uses challenge-response.',
        'SCRAM and TLS solve different problems.',
        'Credentials should be managed through supported commands.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 3,
    question:
      'What is the authentication database in MongoDB, what does authSource mean, and why can a user authenticate against admin while accessing another database?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `A MongoDB user is created in a specific database.

That database stores the user's identity definition and is called the authentication database for that user.

It does not necessarily limit which databases the user can access.`,

      coreConcept: `User created in:

admin

Roles:
readWrite on appdb

Login:

username
password
authSource=admin

After authentication:
user can access appdb
according to assigned role.`,

      detailedExplanation: `Suppose a DBA creates:

user:
appUser

in:

admin

and grants:

readWrite on sales.

The identity belongs to the admin authentication database.

Therefore the client must authenticate using:

authSource=admin

But authorization can allow the user to access:

sales

because privileges are determined by assigned roles.

This distinction is extremely important.

AUTHENTICATION DATABASE

Where the user's credential definition lives.

TARGET DATABASE

The database the application wants to use.

They may be different.

Connection example concept:

mongodb://appUser@host/sales?authSource=admin

The application is targeting sales but authenticating the identity stored in admin.

A common failure occurs when the user is created in admin but the client defaults to authenticating against the database in the URI path.

The DBA then sees:

Authentication failed

even though the username/password are correct.

Another important detail:

A user with the same username can potentially exist in different authentication databases as distinct user identities.

Conceptually:

admin.appUser

and:

sales.appUser

are different identities.

Therefore always identify a MongoDB user as:

username + authentication database.`,

      internalWorking: `Identity:

admin.appUser
     |
     v
authSource=admin
     |
     v
authentication success
     |
     v
roles evaluated
     |
     +--> readWrite sales
     +--> maybe other DB roles`,

      architecture: `            USER IDENTITY
              admin.appUser
                   |
             authentication
                   |
                   v
                ROLES
              /       \
             v         v
          sales      reports
         access       access`,

      examples: [
        `A user created in admin can have readWrite on a completely different database.`,
        `Wrong authSource can cause authentication failure.`,
        `The same username in two authentication databases represents different user identities.`
      ],

      commands: [
        {
          command:
            'use admin',
          explanation:
            'Switches to the admin database before inspecting or managing users created there.'
        },
        {
          command:
            'db.getUser("<user>")',
          explanation:
            'Shows user information for a user defined in the current database, subject to privileges.'
        }
      ],

      productionScenario: `A client connects using:

mongodb://appUser@host/sales

The user was created in:

admin.

The driver attempts authentication against the wrong database and login fails.

Adding the correct:

authSource=admin

resolves authentication.

No password change was required.`,

      troubleshootingApproach: `1. Identify username.

2. Determine where user was created.

3. Verify authSource.

4. Verify target database.

5. Inspect assigned roles.

6. Test connection using explicit authSource.

7. Verify mechanism.

8. Avoid recreating duplicate users unnecessarily.`,

      commonMistakes: [
        'Assuming target database is always authentication database.',
        'Resetting password before checking authSource.',
        'Creating duplicate usernames in multiple databases accidentally.',
        'Thinking a user stored in admin automatically has admin privileges.',
        'Confusing authentication location with authorization scope.'
      ],

      bestPractices: [
        'Document each user’s authentication database.',
        'Use explicit authSource in controlled connection configurations.',
        'Treat username plus auth database as the full identity.',
        'Separate identity location from role scope.',
        'Avoid duplicate user definitions unless intentional.'
      ],

      interviewAnswer: `The authentication database is the database where the MongoDB user identity is defined. authSource tells the client where to authenticate that user.

A user created in admin can still have readWrite on another database because privileges come from roles, not from the location of the user definition. Wrong authSource is therefore a common cause of authentication failures.`,

      keyTakeaways: [
        'Users belong to an authentication database.',
        'authSource selects that database.',
        'Role scope can cover other databases.',
        'Target DB and auth DB can differ.',
        'Username alone does not fully identify the MongoDB user.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 4,
    question:
      'How do MongoDB users and roles work, and what is the difference between built-in roles and custom roles?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `A MongoDB user is an identity.

A role is a collection of privileges.

Instead of assigning every privilege individually to every user, DBAs normally assign roles to users.`,

      coreConcept: `User
 |
 +--> Role A
 |      |
 |      +--> privilege
 |      +--> privilege
 |
 +--> Role B
        |
        +--> privilege

Permissions come
through roles.`,

      detailedExplanation: `MongoDB provides built-in roles for common use cases.

Examples include roles such as:

• read
• readWrite
• dbAdmin
• userAdmin
• clusterMonitor
• backup
• restore
• broader administrative roles.

Exact role behavior should be verified for the deployed MongoDB version.

BUILT-IN ROLE

MongoDB defines and maintains the privilege set.

Example:

readWrite on appdb.

CUSTOM ROLE

The DBA defines a specific set of:

• privileges
• resources
• inherited roles.

Custom roles are useful when built-in roles grant too much or too little.

Example requirement:

A support user must:

• read orders
• update ticketStatus

but must not:

• delete orders
• create indexes
• administer users.

A custom role can be designed around exactly those requirements.

ROLE INHERITANCE

Roles can inherit other roles.

This simplifies management but can also accidentally broaden privileges.

Therefore the DBA must inspect the effective privilege set, not only the directly assigned role name.

Security should follow:

user
→ role
→ privilege
→ resource.`,

      internalWorking: `supportUser
     |
     v
supportRole
     |
 +---+---+
 |       |
find   update
orders ticketStatus

No delete
No userAdmin
No clusterAdmin`,

      architecture: `                USER
                    |
               assigned roles
               /            \
              v              v
        built-in role    custom role
              |              |
              v              v
          privileges      privileges
              \              /
               \            /
                   resources`,

      examples: [
        `readWrite is easier than manually defining common CRUD privileges.`,
        `A custom role can grant only find and update on selected resources.`,
        `Role inheritance can unintentionally broaden access if not reviewed.`
      ],

      commands: [
        {
          command:
            'db.getUser("<user>", { showPrivileges: true })',
          explanation:
            'Displays user roles and effective privilege information where supported and authorized.'
        },
        {
          command:
            'db.getRole("<role>", { showPrivileges: true })',
          explanation:
            'Displays a role and its privileges in the current database.'
        }
      ],

      productionScenario: `A support team needs limited production access.

The easiest shortcut would be:

readWrite on the entire database.

But support should not modify most collections.

The DBA creates a custom role that grants only the required actions on the specific collection resources.

This reduces the blast radius of mistakes or credential compromise.`,

      troubleshootingApproach: `1. Identify required business actions.

2. Map actions to MongoDB privileges.

3. Identify target resources.

4. Check whether a built-in role fits.

5. If not, create a minimal custom role.

6. Review inherited roles.

7. Test with the actual user.

8. Remove obsolete privileges.

9. Document role purpose.`,

      commonMistakes: [
        'Assigning broad roles because they are easier.',
        'Ignoring inherited privileges.',
        'Creating custom roles without documenting purpose.',
        'Using userAdmin roles for application data access.',
        'Testing privileges only with an administrator account.'
      ],

      bestPractices: [
        'Prefer least privilege.',
        'Use built-in roles when they fit exactly.',
        'Use custom roles for narrower access.',
        'Review inherited permissions.',
        'Periodically remove obsolete access.'
      ],

      interviewAnswer: `MongoDB users are identities and roles are collections of privileges over resources. Built-in roles provide standard permission sets, while custom roles let the DBA define narrower privileges when built-in roles are too broad.

I choose the smallest role that satisfies the business requirement and review effective privileges, including inherited roles.`,

      keyTakeaways: [
        'Users receive privileges through roles.',
        'Built-in roles cover common patterns.',
        'Custom roles provide finer control.',
        'Inheritance affects effective privileges.',
        'Least privilege should drive role design.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 5,
    question:
      'What is the principle of least privilege in MongoDB, and how should it be applied to application, DBA, monitoring, backup, and support accounts?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `Least privilege means:

Give an identity only the permissions required to perform its job.

Do not give:

root

when:

read

is enough.`,

      coreConcept: `Business need
     |
     v
Required actions
     |
     v
Required resources
     |
     v
Minimum MongoDB role
     |
     v
User/service account`,

      detailedExplanation: `Different account types should normally have different privilege profiles.

APPLICATION ACCOUNT

Usually needs only the data actions required by the application.

Example:

readWrite on specific application databases.

It normally should not have:

• user administration
• replication administration
• shutdown
• unrestricted cluster administration.

MONITORING ACCOUNT

Needs monitoring-related access.

It usually should not modify business data.

BACKUP ACCOUNT

Needs privileges required by the selected backup method.

It should not automatically be an unrestricted application administrator.

DBA ACCOUNT

DBAs need elevated privileges, but daily work may still benefit from separating:

• normal operational identity
• emergency/high-privilege identity.

SUPPORT ACCOUNT

Should usually be narrow and often read-only unless a specific write action is necessary.

WHY LEAST PRIVILEGE MATTERS

If credentials are:

• stolen
• accidentally misused
• placed in a script
• leaked through logs

the potential damage is limited by the account's privileges.

A root application account turns one compromised web application into a full database-cluster compromise.

Least privilege also improves auditability because access reflects business responsibilities.`,

      internalWorking: `App compromise

If app account = root
       |
       v
cluster-wide damage possible

If app account = limited readWrite
       |
       v
blast radius significantly smaller`,

      architecture: `              MongoDB ACCESS
                    |
       +------------+------------+
       |            |            |
       v            v            v
      App        Monitoring    Backup
       |            |            |
       v            v            v
     CRUD       metrics only   backup
   required                    actions

Separate DBA/admin access`,

      examples: [
        `Monitoring accounts should not normally modify application documents.`,
        `Application accounts should not manage MongoDB users.`,
        `Emergency admin privileges can be separated from routine operational access.`
      ],

      commands: [
        {
          command:
            'db.getUser("<user>", { showPrivileges: true })',
          explanation:
            'Useful for reviewing whether a user has broader privileges than intended.'
        }
      ],

      productionScenario: `An application's credentials are exposed in an application log.

The account has only readWrite on one application database.

The incident is serious, but the attacker cannot directly:

• create cluster admins
• reconfigure the replica set
• access unrelated databases through that identity.

Least privilege reduces the blast radius.`,

      troubleshootingApproach: `1. Identify account purpose.

2. List required operations.

3. List required databases/resources.

4. Review current roles.

5. Remove unnecessary privileges.

6. Separate human and service identities.

7. Rotate credentials when required.

8. Test application functionality.

9. Review access periodically.`,

      commonMistakes: [
        'Giving every technical user root.',
        'Sharing one admin account across teams.',
        'Using DBA credentials inside applications.',
        'Keeping old privileges forever.',
        'Granting broad roles temporarily and never removing them.'
      ],

      bestPractices: [
        'Use separate identities per function.',
        'Grant minimum permissions.',
        'Use emergency elevation only when needed.',
        'Review access regularly.',
        'Rotate exposed credentials immediately.'
      ],

      interviewAnswer: `Least privilege means granting only the actions and resources an identity needs. Application, monitoring, backup, support, and DBA accounts should therefore have separate role profiles.

This reduces blast radius if credentials are compromised and improves auditability. I avoid using root or shared DBA credentials for routine application access.`,

      keyTakeaways: [
        'Least privilege limits damage.',
        'Different functions need different accounts.',
        'Applications should not use DBA identities.',
        'Privileges should be reviewed periodically.',
        'Temporary access must be removed.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 6,
    question:
      'What is internal authentication between MongoDB replica-set or sharded-cluster members, and why is it different from application-user authentication?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `MongoDB servers in a replica set or sharded cluster must authenticate each other.

This is called internal or member authentication.

It is different from an application user authenticating to MongoDB.`,

      coreConcept: `Application authentication:

App -> mongod

Internal authentication:

mongod <-> mongod

or

mongos/config/shard components
authenticate within cluster topology.`,

      detailedExplanation: `Consider a replica set with:

Node A
Node B
Node C.

These nodes exchange:

• replication data
• heartbeats
• election-related communication
• internal commands.

When internal authentication is enabled, members must prove they belong to the trusted deployment.

Common internal authentication approaches include:

• keyfile-based authentication
• X.509 certificate-based authentication.

KEYFILE

Members share secret material.

The keyfile must be protected carefully with appropriate filesystem permissions.

X.509

Cluster members can authenticate using certificates under supported TLS/X.509 configuration.

APPLICATION AUTHENTICATION

An application user such as:

ordersApp

is a logical database user with roles such as:

readWrite on orders.

That identity is not the same as MongoDB server-to-server membership authentication.

A replica-set member failing internal authentication can appear:

• unhealthy
• unable to replicate
• unable to join
• rejected by other members.

Therefore after enabling access control on a replica set, the DBA must consider both:

client authentication

and:

member authentication.`,

      internalWorking: `Application:
appUser + SCRAM
       |
       v
      mongod

Replica set:
mongod A
   |
member authentication
   |
mongod B
   |
mongod C`,

      architecture: `               APPLICATION
                     |
               user auth
                     |
                     v
                 PRIMARY
                /       \
               /         \
      internal auth   internal auth
             /             \
            v               v
       SECONDARY        SECONDARY`,

      examples: [
        `SCRAM application users are separate from member keyfile authentication.`,
        `A wrong keyfile can prevent replica members from authenticating to each other.`,
        `Certificate-based internal authentication requires correct trust and identity configuration.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Useful for identifying members failing to participate normally after internal-authentication changes.'
        }
      ],

      productionScenario: `A DBA enables authorization and restarts the replica set.

Clients can authenticate to the Primary, but the Secondaries do not replicate.

Logs show member authentication failures.

The issue is not application users.

The keyfile configuration differs between members.`,

      troubleshootingApproach: `1. Determine whether failure is client or member authentication.

2. Check mongod logs.

3. Verify keyfile/certificate configuration.

4. Verify file permissions.

5. Verify all members use compatible internal-auth settings.

6. Verify clocks/certificates when TLS/X.509 is involved.

7. Check rs.status().

8. Restore replication before declaring security rollout complete.`,

      commonMistakes: [
        'Enabling user authentication without planning member authentication.',
        'Using different keyfile secrets on replica members.',
        'Ignoring keyfile filesystem permissions.',
        'Confusing application SCRAM users with cluster member identity.',
        'Restarting every member simultaneously during a security change.'
      ],

      bestPractices: [
        'Plan member authentication before enabling authorization.',
        'Roll out security changes carefully.',
        'Protect keyfiles strongly.',
        'Use consistent configuration across members.',
        'Validate replication after every member restart.'
      ],

      interviewAnswer: `Internal authentication is how MongoDB nodes trust each other for replication and cluster communication. It is separate from application-user authentication.

Replica-set members can use mechanisms such as keyfiles or X.509 for member authentication, while applications may use SCRAM or other supported mechanisms with database roles. I validate both layers during security rollouts.`,

      keyTakeaways: [
        'Cluster members authenticate each other.',
        'Internal auth differs from application auth.',
        'Keyfile and X.509 are common approaches.',
        'Bad member auth can break replication.',
        'Both layers must be validated.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 7,
    question:
      'How does keyfile authentication work for MongoDB replica-set members, and what operational mistakes commonly break replication after enabling it?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `With keyfile authentication, MongoDB members use shared secret material to authenticate internal cluster communication.

Every member must have compatible key material and must be able to read the configured keyfile securely.`,

      coreConcept: `Node A ----\
Node B ----- shared trusted key material
Node C ----/

If one node has wrong key:
internal authentication fails.`,

      detailedExplanation: `A keyfile is used for internal MongoDB authentication in deployments where this mechanism is selected.

Operational requirements include:

1. CONSISTENT SECRET MATERIAL

Replica-set members must use compatible key material.

2. FILE PERMISSIONS

The mongod operating-system account must be able to read the keyfile.

At the same time, permissions should be restrictive enough to prevent unauthorized users from reading it.

3. CONFIGURATION PATH

security.keyFile must reference the correct path.

4. RESTART REQUIREMENT

Authentication configuration changes generally require controlled process restart.

5. ROLLING CHANGE

In production replica sets, security configuration should be introduced using a documented rolling procedure appropriate for the current starting state and MongoDB version.

The DBA should avoid stopping all members simultaneously unless downtime is explicitly planned.

Typical failures include:

• copied wrong keyfile
• newline/content corruption
• wrong ownership
• permissions too open or too restrictive
• wrong path
• one member not updated
• startup configuration syntax error.

A member with invalid keyfile configuration may:

• fail startup
• start but fail cluster authentication depending on configuration
• remain unhealthy in replica-set status.

Logs are critical for distinguishing filesystem errors from authentication mismatch.`,

      internalWorking: `Node A:
key = SECRET1

Node B:
key = SECRET1

Node C:
key = SECRET2

A <-> B works

C authentication fails`,

      architecture: `           REPLICA SET
        +----------+----------+
        |          |          |
        v          v          v
      Node A     Node B     Node C
        |          |          |
      keyfile    keyfile    keyfile
        \          |          /
         \         |         /
          trusted shared
          member identity`,

      examples: [
        `Incorrect keyfile ownership can prevent mongod startup.`,
        `One member with different key material can fail internal authentication.`,
        `Rolling configuration reduces availability risk compared with simultaneous restart.`
      ],

      commands: [
        {
          command:
            'grep -n "keyFile" /etc/mongod.conf',
          explanation:
            'Example OS-level check for configured keyfile path. Actual config location may differ.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Confirms replica-set state after security changes.'
        }
      ],

      productionScenario: `After patching one Secondary, it no longer rejoins the replica set.

The server starts, but logs contain internal authentication errors.

The DBA compares checksums/configuration and discovers that the node received an older keyfile.

Correcting the key material restores member communication.`,

      troubleshootingApproach: `1. Check mongod startup status.

2. Read exact authentication error.

3. Verify configured keyfile path.

4. Verify ownership.

5. Verify permissions.

6. Verify key material matches expected deployment secret.

7. Compare configuration with healthy members.

8. Restart only the affected member.

9. Verify rs.status().

10. Confirm replication catches up.`,

      commonMistakes: [
        'Sending different keyfiles to different members.',
        'Using insecure keyfile permissions.',
        'Changing all replica members at once.',
        'Ignoring mongod user ownership.',
        'Troubleshooting application credentials when the failure is internal auth.'
      ],

      bestPractices: [
        'Protect keyfiles as secrets.',
        'Distribute them securely.',
        'Validate checksums or controlled secret deployment.',
        'Use rolling changes.',
        'Verify replica health after every restart.'
      ],

      interviewAnswer: `Keyfile authentication uses shared secret material for MongoDB member-to-member trust. All replica-set members need compatible key material and secure readable file permissions.

Common failures are mismatched keys, wrong ownership, permissions, or path configuration. I roll changes carefully and validate member authentication and replication after each restart.`,

      keyTakeaways: [
        'Keyfiles secure internal authentication.',
        'Members need compatible secret material.',
        'Filesystem permissions matter.',
        'Misconfiguration can break replication.',
        'Rollout should be controlled.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 8,
    question:
      'What is the MongoDB localhost exception, when does it apply, and why should a DBA not rely on it as a normal administrative access method?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `The localhost exception is a bootstrap mechanism.

It can allow initial administrative user creation under specific conditions when access control is enabled but no users have yet been created.

It is not a permanent bypass for authentication.`,

      coreConcept: `Fresh secured deployment

No users exist
      |
      v
localhost bootstrap exception
      |
      v
create first admin user
      |
      v
exception no longer usable
for normal unauthenticated admin access`,

      detailedExplanation: `MongoDB needs a way to bootstrap the first administrative identity when authentication is enabled.

The localhost exception provides narrowly scoped initial access under specific conditions.

Conceptually:

1. authorization/access control enabled

2. no MongoDB users exist yet

3. DBA connects from localhost

4. bootstrap actions allow creation of the first administrative user.

Once an appropriate user exists, normal authentication should be used.

The DBA should not design production operations around:

"we can always SSH to the box and use localhost without a password."

That is not the intended security model.

The localhost exception also has important topology/version-specific behavior.

Therefore exact bootstrap procedures should be validated against the MongoDB version being deployed.

In replica sets, production rollouts need extra care because authentication and member authentication must be coordinated.

The secure operational objective is:

bootstrap once
→ create controlled administrative identity
→ use authenticated administration thereafter.`,

      internalWorking: `No users
   |
localhost
   |
bootstrap
   |
create admin
   |
   v
normal secured state
   |
authentication required`,

      architecture: `             NEW MONGODB
                  |
            access control
                  |
           no users exist
                  |
                  v
          localhost bootstrap
                  |
                  v
          first admin created
                  |
                  v
           normal auth model`,

      examples: [
        `The exception is useful for first-user bootstrap.`,
        `It should not be confused with permanent localhost trust.`,
        `Production replica-set security enablement requires more planning than a standalone bootstrap example.`
      ],

      commands: [
        {
          command:
            'db.createUser({ user: "<adminUser>", pwd: passwordPrompt(), roles: [{ role: "userAdminAnyDatabase", db: "admin" }] })',
          explanation:
            'Conceptual example of creating an initial administrative identity; exact bootstrap role design depends on operational requirements.'
        }
      ],

      productionScenario: `A server team assumes local shell users can always manage MongoDB without database credentials.

After the initial admin user is created, their unauthenticated commands fail.

The DBA explains that the localhost exception was only a bootstrap mechanism, not permanent administrative access.`,

      troubleshootingApproach: `1. Determine whether any users already exist.

2. Determine whether access control is enabled.

3. Confirm whether this is an initial bootstrap situation.

4. Follow version-specific bootstrap procedure.

5. Create controlled admin identity.

6. Test authenticated login.

7. Store credentials securely.

8. Do not rely on localhost exception afterward.`,

      commonMistakes: [
        'Treating localhost exception as permanent.',
        'Using it as a backdoor expectation.',
        'Creating overly broad first-user credentials without planning.',
        'Ignoring replica-set security rollout considerations.',
        'Assuming OS root automatically equals MongoDB root.'
      ],

      bestPractices: [
        'Use localhost exception only for bootstrap.',
        'Create controlled administrative identities.',
        'Securely store admin credentials.',
        'Test authenticated administration immediately.',
        'Follow version-specific documentation.'
      ],

      interviewAnswer: `The localhost exception is MongoDB's initial bootstrap mechanism that can permit creation of the first administrative user under specific conditions when no users exist.

It is not a permanent authentication bypass. Once users are configured, normal authenticated administration should be used.`,

      keyTakeaways: [
        'Localhost exception is for bootstrap.',
        'It is conditional.',
        'It is not a permanent bypass.',
        'OS privilege and MongoDB privilege are separate.',
        'Production security should use authenticated identities.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 9,
    question:
      'How should a MongoDB DBA rotate application credentials safely without causing application downtime?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Credential rotation means replacing an existing secret with a new one.

The dangerous approach is:

change MongoDB password first
then hope all application instances update instantly.

A safe rotation needs coordination between the database and application.`,

      coreConcept: `Old credential
      |
      v
prepare new credential
      |
      v
deploy app change
      |
      v
verify new connections
      |
      v
remove old credential

Overlap reduces downtime risk.`,

      detailedExplanation: `The safest exact rotation method depends on application architecture and secret-management platform.

A common strategy is dual-credential rotation.

STEP 1 — CREATE NEW IDENTITY OR CREDENTIAL PATH

Instead of immediately invalidating the old credential, create a second controlled identity with equivalent required privileges where operationally appropriate.

Example:

appUser_old

appUser_new

STEP 2 — UPDATE SECRET STORE

Place the new credential in the approved secret-management system.

STEP 3 — ROLL APPLICATION

Update application instances gradually.

Existing connections using the old user may continue temporarily while new connections use the new identity.

STEP 4 — VERIFY

Check:

• authentication success
• error rate
• connection behavior
• application transactions.

STEP 5 — REMOVE OLD ACCESS

After all clients are confirmed migrated:

disable/drop/revoke the old identity.

Alternative environments may support rotating the password on one identity, but that creates more risk when applications cannot update atomically.

Never expose the password in:

• shell history
• tickets
• source code
• Git
• monitoring logs.

Rotation should also account for:

• connection pools
• long-lived processes
• replicas/shards
• disaster-recovery secrets.

The DBA should know whether applications reconnect automatically after credential changes.`,

      internalWorking: `Phase 1:
old credential works

Phase 2:
old + new available

Phase 3:
apps migrate to new

Phase 4:
verify zero old clients

Phase 5:
remove old credential`,

      architecture: `            SECRET MANAGER
             /          \
            v            v
        OLD USER      NEW USER
            \            /
             \          /
             APPLICATION
                  |
            rolling migration
                  |
                  v
               MongoDB`,

      examples: [
        `Dual identities can provide a controlled overlap window.`,
        `Connection pools may continue using existing authenticated connections until reconnect.`,
        `Secrets should never be placed directly in Git repositories.`
      ],

      commands: [
        {
          command:
            'db.createUser({ user: "<newUser>", pwd: passwordPrompt(), roles: [<requiredRoles>] })',
          explanation:
            'Creates a replacement identity without exposing the password directly in command history.'
        },
        {
          command:
            'db.dropUser("<oldUser>")',
          explanation:
            'Removes the old identity only after application migration has been validated.'
        }
      ],

      productionScenario: `A production application has 60 instances.

The DBA changes the only application's password immediately.

Half of the instances still use the old secret and begin failing authentication.

A better rotation uses a new identity, rolls the secret through application instances, validates connectivity, and removes the old user after migration.`,

      troubleshootingApproach: `1. Inventory applications using the credential.

2. Confirm required roles.

3. Choose rotation method.

4. Create replacement identity where appropriate.

5. Update secure secret store.

6. Roll application instances.

7. Monitor authentication failures.

8. Verify all workloads use new credentials.

9. Remove old access.

10. Audit for exposed old secrets.`,

      commonMistakes: [
        'Changing the only password before applications are ready.',
        'Hardcoding credentials.',
        'Forgetting long-lived background workers.',
        'Leaving old credentials active indefinitely.',
        'Using broader permissions on the replacement user.'
      ],

      bestPractices: [
        'Use secret-management systems.',
        'Plan overlap where appropriate.',
        'Maintain equivalent least-privilege roles.',
        'Monitor authentication during rotation.',
        'Retire old credentials promptly after verification.'
      ],

      interviewAnswer: `For zero-downtime credential rotation, I coordinate database and application changes. Where appropriate I create a replacement identity with the same least-privilege roles, deploy the new secret gradually, validate that all clients have migrated, then remove the old identity.

I also account for connection pools and long-lived processes and ensure credentials never appear in source code or shell history.`,

      keyTakeaways: [
        'Credential rotation is a coordinated change.',
        'Abrupt password changes can cause outages.',
        'Dual identity can reduce risk.',
        'Connection pools matter.',
        'Old credentials must eventually be removed.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 10,
    question:
      'How would you perform a practical MongoDB access-control review for a production environment?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `An access-control review asks:

Who can connect?

How do they authenticate?

What can each identity do?

Does each privilege still have a valid business reason?

The goal is to identify unnecessary or risky access before an incident happens.`,

      coreConcept: `Access review

Users
  |
Roles
  |
Privileges
  |
Resources
  |
Business need
  |
Keep / reduce / remove`,

      detailedExplanation: `A practical review should cover several categories.

1. USER INVENTORY

Identify:

• application users
• DBA users
• monitoring users
• backup users
• service users
• support users
• old/test accounts.

2. AUTHENTICATION DATABASE

Document where each user identity is defined.

3. AUTHENTICATION MECHANISM

Determine whether identities use:

• SCRAM
• X.509
• other supported enterprise mechanisms.

4. ROLE ASSIGNMENTS

Inspect both direct and inherited roles.

5. PRIVILEGE SCOPE

Check:

• database
• collection
• cluster-wide actions.

6. LEAST PRIVILEGE

Ask whether:

readWriteAnyDatabase

is really required,

or whether:

readWrite on one DB

would be enough.

7. SHARED ACCOUNTS

Shared human accounts weaken auditability.

Prefer individual identities where operationally appropriate.

8. DORMANT USERS

Old project users and former service identities should be removed.

9. CREDENTIAL ROTATION

Review age and rotation procedures.

10. APPLICATION SECRETS

Verify secrets are not embedded in:

• code
• scripts
• configuration repositories
• tickets.

11. INTERNAL AUTH

Review member authentication separately.

12. NETWORK ACCESS

Database authentication is stronger when combined with restricted network exposure.

13. AUDITABILITY

Where auditing capability is available and required, ensure critical access and administrative actions can be traced.

The output should be an actionable remediation list, not just an exported user list.`,

      internalWorking: `User inventory
    |
    v
Role inventory
    |
    v
Effective privileges
    |
    v
Business justification
   /      \
valid    unnecessary
 |          |
keep      remove/
          reduce`,

      architecture: `             SECURITY REVIEW
                    |
       +------------+------------+
       |            |            |
       v            v            v
     Users        Roles      Credentials
       |            |            |
       +------------+------------+
                    |
                    v
              least privilege
                    |
                    v
              remediation`,

      examples: [
        `An old migration account may still have broad privileges months after the project ended.`,
        `A monitoring account with readWrite access indicates excessive privilege.`,
        `A service account shared across unrelated applications creates unnecessary blast radius.`
      ],

      commands: [
        {
          command:
            'db.getUsers({ showPrivileges: true })',
          explanation:
            'Reviews users in the current database and their privilege information, subject to version and authorization.'
        },
        {
          command:
            'db.getRoles({ rolesInfo: 1, showPrivileges: true, showBuiltinRoles: false })',
          explanation:
            'Conceptual role-review command pattern; exact shell syntax/options should be validated for the deployed version.'
        }
      ],

      productionScenario: `A quarterly access review finds:

• one former migration user with administrative access
• a monitoring account with readWrite
• two shared DBA accounts
• an application user with readWriteAnyDatabase.

The DBA creates a remediation plan:

remove obsolete account
reduce monitoring to monitoring privileges
move DBAs to individual identities
scope the application user to its actual database.`,

      troubleshootingApproach: `1. Inventory all users.

2. Map authentication databases.

3. Record assigned roles.

4. Expand inherited privileges.

5. Map users to owners.

6. Confirm business purpose.

7. Identify dormant accounts.

8. Identify broad privileges.

9. Review credential handling.

10. Review member authentication.

11. Review network exposure.

12. Create remediation list.

13. Test privilege reductions.

14. Remove obsolete access.

15. Repeat review periodically.`,

      commonMistakes: [
        'Reviewing only usernames and not privileges.',
        'Ignoring inherited roles.',
        'Keeping obsolete accounts.',
        'Allowing shared administrator identities.',
        'Reducing privileges without testing application requirements.'
      ],

      bestPractices: [
        'Perform periodic access reviews.',
        'Assign an owner to every account.',
        'Document business purpose.',
        'Remove dormant access.',
        'Test least-privilege reductions safely.'
      ],

      interviewAnswer: `For a production access review, I inventory users, authentication databases, mechanisms, direct and inherited roles, effective privileges, account owners, credential handling, and internal member authentication.

I compare each privilege with the current business requirement, remove dormant identities, reduce broad roles, and document remediation. The review should produce real access changes, not just a user listing.`,

      keyTakeaways: [
        'Access reviews must examine effective privileges.',
        'Every account needs a valid owner and purpose.',
        'Dormant access should be removed.',
        'Shared broad accounts reduce auditability.',
        'Least-privilege remediation should be tested.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 11,
    question:
      'How do MongoDB custom roles work, and how would you design and troubleshoot a least-privilege custom role for a production application?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A custom role allows a DBA to define a precise set of permissions when MongoDB built-in roles are either too broad or do not match the application's requirement.

The design process should start from business operations, not from MongoDB role names.

Ask:

What exactly must this application do?

Then map those operations to MongoDB actions and resources.`,

      coreConcept: `Application requirement
        |
        v
Required operations
        |
        v
MongoDB actions
        |
        v
Resources
(database / collection)
        |
        v
Custom role
        |
        v
Application user`,

      detailedExplanation: `A MongoDB privilege conceptually contains:

RESOURCE
+
ACTIONS

For example:

Resource:
orders.orders

Actions:
find
insert
update

A custom role can therefore grant access to a specific database or collection without giving the user broad administrative capabilities.

Suppose an application must:

• read orders
• insert orders
• update orders

but must not:

• delete orders
• create indexes
• create users
• access other databases.

Using an unnecessarily broad role would violate least privilege.

Instead, the DBA can create a custom role containing only the required actions.

CUSTOM ROLE DESIGN PROCESS

1. Identify the workload.

2. Capture operations actually performed.

3. Determine affected databases and collections.

4. Map operations to MongoDB privilege actions.

5. Check whether an existing built-in role already fits.

6. If not, create a custom role.

7. Assign the role to a test identity.

8. Run application tests.

9. Review effective privileges.

10. Promote the role through controlled change management.

Custom roles may also inherit other roles.

Inheritance can simplify administration but can accidentally introduce additional privileges.

Therefore an L3 DBA must examine effective permissions rather than only the custom role's directly declared privileges.`,

      internalWorking: `Application request:

update orders

      |
      v

Authenticated user
      |
      v
assigned custom role
      |
      v
resource match?
orders.orders
      |
      v
action allowed?
update
   /      \
 YES      NO
  |        |
execute   Unauthorized`,

      architecture: `             APPLICATION
                   |
                   v
                appUser
                   |
                   v
              customRole
                   |
           +-------+-------+
           |               |
           v               v
       Resources         Actions
       orders.orders     find
                         insert
                         update`,

      examples: [
        `A reporting service may require find on selected collections but no write privileges.`,
        `A support tool may need update on a specific operational collection without delete permission.`,
        `A custom role can inherit another role, so inherited privileges must also be reviewed.`
      ],

      commands: [
        {
          command:
            'db.createRole({ role: "<customRole>", privileges: [{ resource: { db: "<db>", collection: "<collection>" }, actions: ["find", "insert", "update"] }], roles: [] })',
          explanation:
            'Conceptual example of a least-privilege custom role. Exact actions should match the application requirement.'
        },
        {
          command:
            'db.getRole("<customRole>", { showPrivileges: true })',
          explanation:
            'Displays role information and effective privileges for troubleshooting and review.'
        }
      ],

      productionScenario: `An application receives permission to read and update customer cases.

Security policy prohibits deletion.

Instead of assigning readWrite across the entire database, the DBA creates a custom role containing only the required actions against the required collection.

During testing, one application operation fails.

The DBA captures the exact unauthorized action and adds only the missing legitimate privilege rather than replacing the custom role with root or readWriteAnyDatabase.`,

      troubleshootingApproach: `1. Capture the exact unauthorized operation.

2. Confirm the authenticated identity.

3. Inspect directly assigned roles.

4. Inspect inherited roles.

5. Determine the requested resource.

6. Determine the required MongoDB action.

7. Compare it with effective privileges.

8. Add only the legitimate missing privilege.

9. Retest the application.

10. Document the reason for the privilege.`,

      commonMistakes: [
        'Creating a custom role without understanding application operations.',
        'Granting broad privileges after the first authorization failure.',
        'Ignoring inherited roles.',
        'Using cluster-wide resources when collection-level access is sufficient.',
        'Never reviewing custom roles after applications change.'
      ],

      bestPractices: [
        'Design roles from business requirements.',
        'Use the narrowest practical resource scope.',
        'Document every non-obvious privilege.',
        'Review inherited privileges.',
        'Regression-test applications after privilege changes.'
      ],

      interviewAnswer: `I use custom roles when built-in roles are too broad for the workload. I first identify the exact operations and resources required, map those operations to MongoDB actions, create the smallest privilege set, and test it with the actual application.

If an authorization failure occurs, I identify the missing action and resource rather than granting a broad role such as root.`,

      keyTakeaways: [
        'Custom roles enable fine-grained authorization.',
        'Privileges consist of resources and actions.',
        'Role inheritance affects effective permissions.',
        'Application testing is essential.',
        'Never solve narrow authorization failures with excessive privilege.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 12,
    question:
      'An application can connect to MongoDB but receives Unauthorized errors for some operations. How would you troubleshoot the problem at L3 level?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `If the application successfully connects and authenticates but MongoDB rejects a specific operation as unauthorized, the primary investigation area is authorization.

Do not immediately reset the password.

Authentication has probably already succeeded.`,

      coreConcept: `Connection succeeds
       |
       v
Authentication succeeds
       |
       v
Operation submitted
       |
       v
Authorization check
       |
       v
Unauthorized

Investigate:
user + roles + privileges + resource`,

      detailedExplanation: `An L3 investigation should establish exactly which identity MongoDB authenticated and exactly which operation was denied.

STEP 1 — CAPTURE THE EXACT ERROR

Do not work from:

"MongoDB permission issue."

Capture:

• database
• command
• collection
• action
• error code/message.

STEP 2 — VERIFY AUTHENTICATED USER

Applications may use a different credential than expected because of:

• old environment variables
• stale secrets
• different Kubernetes secret
• different application instance configuration
• connection-string differences.

STEP 3 — VERIFY AUTHENTICATION DATABASE

Identify the full user identity:

username
+
authentication database.

STEP 4 — INSPECT ROLES

Review directly assigned and inherited roles.

STEP 5 — IDENTIFY REQUIRED ACTION

Examples:

find operation may require read-related privileges.

createIndex requires index-related authorization.

collMod, listCollections, aggregate, renameCollection, or administrative operations may require permissions that simple CRUD roles do not provide.

STEP 6 — CHECK RESOURCE SCOPE

The user may have the correct action but on the wrong:

• database
• collection
• cluster resource.

STEP 7 — CHECK APPLICATION CHANGE

A deployment may have introduced a new database operation that the original role was never designed to support.

STEP 8 — REMEDIATE MINIMALLY

Add only the required legitimate privilege.

Do not escalate directly to root.`,

      internalWorking: `Operation fails
      |
      v
Which user?
      |
      v
Which command/action?
      |
      v
Which resource?
      |
      v
Effective privilege exists?
     / \
   NO   YES
   |     |
role   investigate
gap    different cause`,

      architecture: `           APPLICATION
                 |
                 v
           authenticated
               identity
                 |
                 v
              roles
                 |
                 v
        effective privileges
                 |
                 v
        requested operation
                 |
          allow / deny`,

      examples: [
        `An application can perform CRUD but fail when a new release starts creating indexes.`,
        `A user may have readWrite on dbA but the application accidentally accesses dbB.`,
        `One application instance may still use an older account with fewer privileges.`
      ],

      commands: [
        {
          command:
            'db.runCommand({ connectionStatus: 1, showPrivileges: true })',
          explanation:
            'Useful from the affected connection context for identifying authenticated users and privilege information.'
        },
        {
          command:
            'db.getUser("<user>", { showPrivileges: true })',
          explanation:
            'Reviews the user and effective privileges from the appropriate authentication database.'
        }
      ],

      productionScenario: `After an application deployment, normal inserts work but a startup operation fails with Unauthorized.

The DBA identifies that the new release attempts to create an index automatically.

The application account intentionally did not have index-management privileges.

The DBA works with the application team to decide whether index creation belongs in a controlled deployment process instead of permanently broadening the runtime account.`,

      troubleshootingApproach: `1. Capture exact error.

2. Confirm authentication succeeded.

3. Identify actual user/authSource.

4. Identify command and resource.

5. Inspect roles.

6. Expand inherited privileges.

7. Compare privileges with required action.

8. Check recent application changes.

9. Apply least-privilege remediation.

10. Retest with the actual application account.`,

      commonMistakes: [
        'Resetting passwords for authorization failures.',
        'Granting root immediately.',
        'Testing only with a DBA account.',
        'Ignoring different application instances.',
        'Ignoring newly introduced application operations.'
      ],

      bestPractices: [
        'Capture exact authorization errors.',
        'Test with the affected identity.',
        'Map commands to required privileges.',
        'Keep runtime application privileges narrow.',
        'Separate deployment privileges from runtime privileges where practical.'
      ],

      interviewAnswer: `If connectivity succeeds but an operation returns Unauthorized, I treat it as an authorization investigation. I identify the actual authenticated identity, authSource, command, resource, assigned roles, inherited roles, and effective privileges.

Then I add only a legitimate missing privilege or redesign the operation rather than granting broad administrative access.`,

      keyTakeaways: [
        'Unauthorized usually means authentication already succeeded.',
        'Find the exact denied operation.',
        'Verify the actual application identity.',
        'Check action and resource scope.',
        'Remediate with least privilege.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 13,
    question:
      'MongoDB authentication suddenly starts failing after a credential rotation even though the new password appears correct. How would you investigate it?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `A post-rotation authentication failure is not automatically a bad-password problem.

The DBA must validate the entire authentication context:

username
authSource
mechanism
secret version
URI encoding
application deployment
connection pools
and server logs.`,

      coreConcept: `Authentication failure
        |
        +--> wrong secret
        +--> old secret still deployed
        +--> wrong authSource
        +--> URI encoding
        +--> mechanism mismatch
        +--> wrong user
        +--> wrong environment
        +--> TLS/connectivity issue`,

      detailedExplanation: `Credential rotation touches multiple systems.

MongoDB may contain the correct new credential while the application is still consuming an older secret.

COMMON CAUSES

1. SECRET PROPAGATION

Some application instances received the new secret while others did not.

2. AUTHENTICATION DATABASE

The new connection string may omit or change authSource.

3. SPECIAL CHARACTERS

Credentials embedded in a URI may require percent-encoding of reserved characters.

The safest approach is generally to avoid manually constructing credentials into connection strings when the platform provides secure configuration mechanisms.

4. WRONG ENVIRONMENT

Production application may point to a different cluster or secret than expected.

5. CONNECTION POOLS

Some processes may retain existing connections while new connections fail.

This can create intermittent symptoms.

6. USER WAS MODIFIED IN WRONG DATABASE

A DBA may update a similarly named user in another authentication database.

7. AUTHENTICATION MECHANISM

Client/server mechanism configuration must be compatible.

8. APPLICATION RESTART/RELOAD

Some applications do not dynamically reload secret changes.

9. TLS OR NETWORK ERROR MISCLASSIFIED

Capture the exact error rather than assuming every connection failure is authentication.

SERVER LOGS

MongoDB logs can help correlate:

• client address
• username
• authentication database
• mechanism
• failure timing

subject to version and configured log detail.

Do not log or paste actual passwords while troubleshooting.`,

      internalWorking: `Secret rotated
     |
     v
MongoDB has NEW
     |
     +--> App A has NEW -> works
     |
     +--> App B has OLD -> fails
     |
     +--> App C wrong authSource -> fails

Result:
apparently intermittent auth issue`,

      architecture: `             SECRET STORE
             /      |      \
            v       v       v
          App A   App B   App C
            \       |       /
             \      |      /
                  MongoDB
                     |
              authentication logs`,

      examples: [
        `Only newly restarted application pods may fail if they retrieve an incorrect secret version.`,
        `A password containing reserved URI characters can break a manually constructed connection string if not encoded correctly.`,
        `Updating admin.appUser does not update another distinct user with the same name created in a different database.`
      ],

      commands: [
        {
          command:
            'db.runCommand({ connectionStatus: 1 })',
          explanation:
            'Can confirm authentication context from a connection that still succeeds.'
        }
      ],

      productionScenario: `After rotation, approximately 30% of application requests fail.

The DBA correlates failures with three application instances.

Those instances are using an old secret revision while the remaining instances use the new credential.

The database password itself is correct.

Updating the secret deployment resolves the issue.`,

      troubleshootingApproach: `1. Capture exact error.

2. Check MongoDB logs.

3. Verify username and authentication database.

4. Confirm the intended user was rotated.

5. Validate secret version used by each application instance.

6. Check URI encoding.

7. Verify mechanism.

8. Compare working and failing clients.

9. Restart/reload clients where required.

10. Confirm old credentials are retired after successful migration.`,

      commonMistakes: [
        'Repeatedly resetting a correct password.',
        'Printing production passwords during troubleshooting.',
        'Ignoring authSource.',
        'Ignoring partial secret rollout.',
        'Assuming all application instances use identical configuration.'
      ],

      bestPractices: [
        'Use managed secret distribution.',
        'Monitor authentication errors during rotation.',
        'Use controlled overlap where appropriate.',
        'Avoid credentials in logs and tickets.',
        'Validate every workload before retiring old access.'
      ],

      interviewAnswer: `After credential rotation I verify much more than the password. I check the exact authenticated identity, authSource, mechanism, URI encoding, secret revision on each application instance, connection-pool behavior, and MongoDB authentication logs.

Intermittent failures often indicate partial secret propagation rather than a MongoDB password problem.`,

      keyTakeaways: [
        'Credential rotation is distributed-system change.',
        'Secret propagation failures are common.',
        'authSource remains critical.',
        'URI handling can matter.',
        'Never expose credentials during troubleshooting.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 14,
    question:
      'One replica-set member fails to rejoin after enabling or changing keyfile authentication. How would you perform an L3 investigation?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `When one replica-set member fails after a keyfile change, determine whether the problem is:

process startup
network connectivity
replica-set configuration
or internal authentication.

Do not immediately reconfigure the replica set.`,

      coreConcept: `Member unhealthy
      |
      v
mongod running?
   /      \
 NO       YES
 |         |
startup   network?
logs       |
           v
      internal auth?
           |
           v
      replication state`,

      detailedExplanation: `An L3 DBA should preserve evidence before making topology changes.

STEP 1 — PROCESS STATE

Determine whether mongod is actually running.

If it failed startup, inspect configuration and filesystem errors first.

STEP 2 — LOGS

Look for:

• keyfile read failures
• permission errors
• authentication failures
• TLS errors
• network errors
• replica-set configuration errors.

STEP 3 — KEYFILE PATH

Confirm security.keyFile points to the intended file.

STEP 4 — OWNERSHIP AND PERMISSIONS

The mongod OS user must be able to read the file.

MongoDB also expects secure permissions appropriate to the platform.

STEP 5 — KEY MATERIAL

Verify the member received the intended secret through an approved comparison mechanism.

Do not print secret contents into tickets or chat.

STEP 6 — CONFIGURATION CONSISTENCY

Compare relevant security configuration with healthy members.

STEP 7 — NETWORK

Confirm required replica-set member-to-member connectivity.

STEP 8 — REPLICA STATUS

From a healthy member, inspect rs.status().

STEP 9 — RESTART AFFECTED NODE

After correcting the root cause, restart only the affected member.

STEP 10 — CATCH-UP

Verify that it transitions through the expected state and catches up.

Avoid:

• rs.remove()
• forced reconfiguration
• rebuilding the node

until simpler authentication/configuration causes have been eliminated.`,

      internalWorking: `Healthy members:

A [KEY-X] <----> B [KEY-X]

Affected member:

C [KEY-Y]
    |
    X
authentication rejected

Correct C secret
    |
    v
C rejoins and catches up`,

      architecture: `             PRIMARY
             /       \
            /         \
      SECONDARY     SECONDARY
       healthy       affected
                        |
                 keyfile/config
                 investigation`,

      examples: [
        `Wrong ownership can prevent mongod from reading the keyfile.`,
        `A stale keyfile copied from another environment can cause member-authentication failure.`,
        `A member should not be rebuilt merely because its keyfile path is wrong.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Shows the replica-set view of the affected member from a healthy authenticated node.'
        },
        {
          command:
            'grep -n "keyFile" /etc/mongod.conf',
          explanation:
            'Example check for the configured keyfile path; actual configuration path may differ.'
        }
      ],

      productionScenario: `A Secondary is patched and restarted but remains unhealthy.

The DBA initially suspects replication corruption.

Logs instead show authentication failure.

The deployment automation had installed a keyfile belonging to a test environment.

After securely correcting the keyfile and restarting the Secondary, it rejoins without resyncing.`,

      troubleshootingApproach: `1. Verify mongod process.

2. Inspect logs.

3. Check security configuration.

4. Check keyfile path.

5. Check ownership/permissions.

6. Verify correct secret distribution.

7. Check network connectivity.

8. Check rs.status().

9. Correct root cause.

10. Restart affected node.

11. Verify replication catch-up.

12. Rebuild only if independently required.`,

      commonMistakes: [
        'Removing the member immediately.',
        'Running forced reconfiguration unnecessarily.',
        'Printing the keyfile secret.',
        'Rebuilding a healthy data directory for an authentication problem.',
        'Changing multiple members simultaneously.'
      ],

      bestPractices: [
        'Preserve logs before changing topology.',
        'Use controlled secret distribution.',
        'Roll security changes member by member.',
        'Validate replication after every change.',
        'Treat forced reconfiguration as exceptional.'
      ],

      interviewAnswer: `I first determine whether the member failed startup or is running but cannot authenticate internally. I inspect logs, keyfile path, ownership, permissions, secret consistency, network connectivity, and replica-set status.

I avoid removing or rebuilding the member until authentication and configuration causes are eliminated.`,

      keyTakeaways: [
        'Member-auth failure can look like replication failure.',
        'Logs are critical.',
        'Keyfile path, permissions and secret consistency matter.',
        'Avoid unnecessary replica-set reconfiguration.',
        'Correct authentication before considering rebuild.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 15,
    question:
      'A DBA has lost access to all MongoDB administrative accounts in a secured production deployment. How should recovery be approached without creating an unsafe authentication bypass?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Losing all administrative credentials is a serious access-recovery incident.

The correct response is not to improvise an undocumented production bypass.

Recovery should follow a controlled, version-appropriate procedure with authorization, backups, change records, and a clear rollback plan.`,

      coreConcept: `Admin access lost
      |
      v
Confirm scope
      |
      v
Preserve service/data
      |
      v
Approved recovery plan
      |
      v
Version-specific supported procedure
      |
      v
Create/restore controlled admin
      |
      v
Re-secure + audit`,

      detailedExplanation: `The first objective is to distinguish:

credential loss

from:

authentication-system failure.

Questions include:

• Are all admin identities inaccessible?
• Is the problem only one account?
• Is authSource wrong?
• Is the secret manager unavailable?
• Is TLS preventing connection?
• Is the database actually healthy?

If administrative credentials are genuinely unavailable:

1. ESCALATE

Treat this as a security and availability incident.

2. VERIFY AUTHORIZATION

Any recovery procedure that changes authentication controls must be explicitly approved.

3. PRESERVE DATA

Confirm backups and replica-set health.

4. DOCUMENT CURRENT CONFIGURATION

Capture security and topology state without exposing secrets.

5. CONSULT EXACT VERSION PROCEDURE

Authentication recovery details are sensitive to deployment architecture and MongoDB version.

6. CONTROL NETWORK EXPOSURE

If a recovery procedure temporarily changes access-control behavior, the server must not become broadly reachable.

7. RECOVER ADMINISTRATIVE IDENTITY

Create or restore only the required controlled administrative access.

8. RESTORE NORMAL SECURITY

Ensure normal authentication and member authentication are active.

9. ROTATE AFFECTED CREDENTIALS

If credential loss may involve compromise, rotate relevant secrets.

10. AUDIT

Determine why recovery access was unavailable.

The localhost exception should not be assumed to provide a permanent escape path once users already exist.

A production DBA should maintain a tested emergency-access procedure before this incident occurs.`,

      internalWorking: `Admin login fails
      |
      v
Configuration error?
secret manager?
credential loss?
      |
      v
controlled recovery
      |
      v
admin restored
      |
      v
security validated
      |
      v
incident review`,

      architecture: `        PRODUCTION MONGODB
                |
        access unavailable
                |
        incident control
                |
       approved recovery
                |
                v
        restored admin
                |
         security checks
                |
             audit`,

      examples: [
        `A secret-manager outage can appear to be lost MongoDB credentials even when the database account is valid.`,
        `Wrong authSource should be ruled out before attempting emergency recovery.`,
        `Emergency access procedures should be tested before a real outage.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'If an authorized working identity remains available, verify replica-set health before making security changes.'
        }
      ],

      productionScenario: `The team believes the MongoDB admin password is lost and proposes restarting the Primary with authentication disabled.

Before doing so, the DBA discovers that the password is still valid but the production secret-management path was changed.

Correcting secret retrieval restores access without weakening database security.

This demonstrates why diagnosis must precede emergency bypass procedures.`,

      troubleshootingApproach: `1. Confirm exact login errors.

2. Test known authorized identities.

3. Verify authSource/mechanism/TLS.

4. Verify secret-management availability.

5. Confirm deployment health.

6. Escalate if all admin access is genuinely lost.

7. Prepare approved recovery and rollback plan.

8. Follow exact supported procedure.

9. Restore secure administrative access.

10. Validate authentication and replication.

11. Rotate credentials if required.

12. Perform incident review.`,

      commonMistakes: [
        'Immediately disabling authentication.',
        'Exposing the server while access control is weakened.',
        'Assuming localhost exception will always rescue the deployment.',
        'Changing replica-set topology unnecessarily.',
        'Failing to investigate why emergency credentials were unavailable.'
      ],

      bestPractices: [
        'Maintain tested emergency-access procedures.',
        'Protect break-glass credentials appropriately.',
        'Require controlled authorization for security recovery.',
        'Keep reliable backups.',
        'Audit every emergency access event.'
      ],

      interviewAnswer: `If all administrative access is lost, I first rule out authSource, TLS, secret-manager, and configuration issues. If credentials are genuinely unavailable, I treat it as a controlled security incident.

I preserve data and topology, obtain approval, follow the exact MongoDB-version recovery procedure, tightly control network exposure, restore a controlled admin identity, revalidate security, and audit the incident. I would not casually disable authentication on a production server.`,

      keyTakeaways: [
        'Lost admin access is a security incident.',
        'Diagnose before weakening controls.',
        'Recovery must be version-appropriate.',
        'Network exposure must remain controlled.',
        'Emergency access should be planned in advance.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 16,
    question:
      'An application MongoDB credential has been exposed in source code, logs, or a public repository. What immediate actions should an L3 DBA take?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 16,

    answer: {
      groundZero: `Once a production credential is exposed, assume it may have been copied.

Deleting the password from the visible file is not enough.

The credential must be treated as compromised.`,

      coreConcept: `Credential exposed
      |
      v
Contain
      |
      v
Rotate/revoke
      |
      v
Investigate usage
      |
      v
Assess data impact
      |
      v
Remediate source
      |
      v
Monitor + incident review`,

      detailedExplanation: `An exposed credential creates both a security and operational problem.

IMMEDIATE PRIORITIES

1. PRESERVE EVIDENCE

Record:

• when exposure occurred
• where it occurred
• which identity was exposed
• its privileges
• affected environments.

Do not spread the secret further while documenting it.

2. DETERMINE BLAST RADIUS

Identify:

• databases accessible
• collections accessible
• write privileges
• administrative privileges
• network locations from which MongoDB is reachable.

3. ROTATE OR REVOKE

Replace the compromised credential quickly using a controlled procedure.

If zero-downtime rotation is required, migrate applications to replacement credentials and revoke the old identity as soon as safely possible.

4. INVESTIGATE DATABASE ACTIVITY

Look for suspicious:

• authentication
• connections
• user administration
• data reads/writes
• collection drops
• index changes
• configuration changes.

Available evidence depends on deployment logging/auditing configuration.

5. FIX THE SOURCE

Removing a secret from the latest Git commit does not necessarily remove it from repository history or clones.

Repository remediation belongs with the source-control/security team.

6. REVIEW NETWORK CONTROLS

A leaked credential is less useful to an attacker if MongoDB is not reachable from untrusted networks.

7. REVIEW PRIVILEGES

Determine whether excessive privileges increased impact.

8. MONITOR

Continue watching for attempts using the revoked identity.

Credential exposure should result in incident documentation and preventive action.`,

      internalWorking: `Leaked credential
      |
      +--> attacker may copy
      |
      v
Deleting visible secret
does NOT invalidate copy
      |
      v
Credential must be
rotated/revoked`,

      architecture: `            EXPOSED SECRET
             /          \
            v            v
      Application     Potential
        owner          attacker
            \            /
             \          /
                MongoDB
                   |
          access determined by
          network + privileges`,

      examples: [
        `Removing a password from a Git file does not make the old password safe again.`,
        `A leaked read-only credential has a different blast radius from a leaked root credential.`,
        `Network restrictions can significantly reduce exploitability of a leaked database credential.`
      ],

      commands: [
        {
          command:
            'db.getUser("<compromisedUser>", { showPrivileges: true })',
          explanation:
            'Helps determine the potential database privilege blast radius without displaying the password.'
        }
      ],

      productionScenario: `A developer accidentally commits a production MongoDB URI to a public repository.

The security team removes the repository content.

The DBA still treats the credential as compromised, rotates it, identifies its privileges, checks relevant database evidence for suspicious access, validates network exposure, and monitors for continued attempts using the old identity.`,

      troubleshootingApproach: `1. Declare credential exposure.

2. Preserve non-secret evidence.

3. Identify identity and privileges.

4. Determine network exposure.

5. Rotate/revoke credential.

6. Verify applications use replacement credentials.

7. Investigate authentication and database activity.

8. Review administrative changes.

9. Remediate repository/log exposure.

10. Monitor revoked credential attempts.

11. Document root cause and prevention.`,

      commonMistakes: [
        'Only deleting the secret from the visible file.',
        'Posting the exposed credential into an incident ticket.',
        'Delaying rotation because no suspicious activity is obvious.',
        'Ignoring the account privilege scope.',
        'Leaving old credentials enabled after application migration.'
      ],

      bestPractices: [
        'Treat exposed credentials as compromised.',
        'Rotate quickly but safely.',
        'Use secret scanners and secret managers.',
        'Restrict MongoDB network exposure.',
        'Keep application privileges minimal.'
      ],

      interviewAnswer: `If a MongoDB credential is exposed, I assume it may have been copied. I identify the account's privileges and network blast radius, rotate or revoke it, migrate applications safely, investigate authentication and database activity, and remediate the source of exposure.

Deleting the visible secret is not sufficient because copies and repository history may still exist.`,

      keyTakeaways: [
        'Exposure means compromise should be assumed.',
        'Rotation is mandatory.',
        'Privilege scope determines blast radius.',
        'Investigate database activity.',
        'Fix the secret-management process that allowed exposure.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 17,
    question:
      'How would you investigate suspected MongoDB privilege escalation where a user appears to have more access than expected?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 17,

    answer: {
      groundZero: `Unexpected access does not necessarily mean MongoDB ignored authorization.

The user may have gained privileges through:

• another directly assigned role
• role inheritance
• a custom role change
• duplicate identities
• application credential confusion
• an unauthorized administrative change.

The DBA must reconstruct effective authorization.`,

      coreConcept: `Unexpected privilege
       |
       v
Identify exact user
       |
       v
Direct roles
       |
       v
Inherited roles
       |
       v
Effective privileges
       |
       v
Role/user change history
       |
       v
Authorized or suspicious?`,

      detailedExplanation: `STEP 1 — IDENTIFY THE EXACT IDENTITY

Remember:

username + authentication database

defines the MongoDB user identity.

Do not investigate only by username.

STEP 2 — REPRODUCE CAREFULLY

Determine exactly what unexpected operation succeeded.

STEP 3 — INSPECT DIRECT ROLES

List roles assigned directly to the user.

STEP 4 — INSPECT INHERITANCE

A seemingly harmless custom role may inherit a broad built-in or administrative role.

STEP 5 — EXPAND EFFECTIVE PRIVILEGES

Determine what actions/resources are actually permitted.

STEP 6 — REVIEW CUSTOM ROLE DEFINITIONS

Check whether someone recently modified a role.

Changing a role can affect multiple users simultaneously.

STEP 7 — LOOK FOR DUPLICATE IDENTITIES

For example:

admin.supportUser

and:

support.supportUser

are separate identities.

The wrong identity may be used during testing.

STEP 8 — INVESTIGATE ADMINISTRATIVE CHANGES

Where logs/auditing/change records permit, investigate:

• role grants
• role updates
• user creation
• password changes
• administrative access.

STEP 9 — CONTAIN IF SUSPICIOUS

If unauthorized privilege escalation is suspected:

• restrict/revoke affected access
• preserve evidence
• rotate relevant credentials
• involve security response.

STEP 10 — DETERMINE ROOT CAUSE

Was it:

misconfiguration
change-management failure
shared account
credential compromise
malicious administrative activity?`,

      internalWorking: `User
 |
 +--> directRoleA
 |
 +--> customRoleB
        |
        +--> inheritedRoleC
                 |
                 +--> broad privilege

Unexpected access may originate
several levels away.`,

      architecture: `               USER
                 |
        +--------+--------+
        |                 |
    direct role       custom role
                          |
                     inherited role
                          |
                          v
                  effective privilege`,

      examples: [
        `A custom support role may accidentally inherit readWriteAnyDatabase.`,
        `A user may be tested against the wrong authentication database.`,
        `Changing one shared custom role can expand access for many users.`
      ],

      commands: [
        {
          command:
            'db.getUser("<user>", { showPrivileges: true })',
          explanation:
            'Reviews the user and effective privileges from the appropriate authentication database.'
        },
        {
          command:
            'db.getRole("<role>", { showPrivileges: true })',
          explanation:
            'Helps inspect custom-role privileges and inheritance.'
        }
      ],

      productionScenario: `A support engineer unexpectedly updates production data despite supposedly having read-only access.

The DBA finds that the user's custom role inherits another role that was modified during a previous project.

The privilege was therefore real but unintended.

The DBA removes the inheritance, reviews every user assigned to the affected role, and audits the original change.`,

      troubleshootingApproach: `1. Identify exact identity.

2. Confirm unexpected operation.

3. Inspect direct roles.

4. Inspect inherited roles.

5. Expand effective privileges.

6. Inspect custom role changes.

7. Check duplicate user identities.

8. Review change records/audit evidence.

9. Contain suspicious access.

10. Assess all users affected by shared roles.

11. Correct root cause.

12. Retest authorization.`,

      commonMistakes: [
        'Looking only at directly assigned roles.',
        'Ignoring custom-role inheritance.',
        'Assuming same username means same identity.',
        'Changing a shared role without checking other users.',
        'Destroying evidence before investigating suspicious access.'
      ],

      bestPractices: [
        'Review effective privileges.',
        'Control custom-role changes.',
        'Audit privileged administration where required.',
        'Use individual identities.',
        'Treat unexplained privilege expansion as a security event.'
      ],

      interviewAnswer: `For suspected privilege escalation, I identify the exact user including authSource, reproduce the unexpected action, inspect direct and inherited roles, expand effective privileges, and review custom-role definitions and recent administrative changes.

If the access cannot be explained by an authorized change, I contain the account, preserve evidence, rotate relevant credentials, and involve the security incident process.`,

      keyTakeaways: [
        'Effective privilege matters more than role name.',
        'Inheritance can hide broad access.',
        'Custom-role changes affect multiple users.',
        'Exact identity includes authentication database.',
        'Unexplained escalation requires incident handling.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 18,
    question:
      'A new MongoDB administrative user appears in production and nobody on the DBA team recognizes it. How would you investigate and contain the incident?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 18,

    answer: {
      groundZero: `An unexplained privileged account must be treated seriously.

Do not assume it is harmless.

But do not immediately destroy all evidence either.

The DBA should verify the account, determine its privileges, contain risk, and reconstruct how it was created.`,

      coreConcept: `Unknown admin user
      |
      v
Verify
      |
      v
Determine privileges
      |
      v
Preserve evidence
      |
      v
Contain
      |
      v
Investigate creation
      |
      v
Assess impact
      |
      v
Recover + harden`,

      detailedExplanation: `STEP 1 — VERIFY THE ACCOUNT

Confirm:

• exact username
• authentication database
• roles
• effective privileges.

STEP 2 — CHECK CHANGE MANAGEMENT

Determine whether the user came from:

• approved automation
• infrastructure deployment
• migration
• vendor support
• emergency change.

STEP 3 — PRESERVE EVIDENCE

Collect relevant:

• MongoDB logs
• audit records if configured
• OS access logs
• configuration-management records
• secret-manager activity
• deployment logs.

STEP 4 — DETERMINE ACCOUNT CAPABILITY

An unknown read-only account and an unknown root-equivalent account have different urgency, although both require investigation.

STEP 5 — CONTAIN

For a suspicious privileged identity, revoke or otherwise contain access according to incident-response procedure.

Before destructive changes, preserve the evidence needed to understand the incident.

STEP 6 — IDENTIFY CREATION PATH

Investigate which existing identity had permission to create or grant the account.

STEP 7 — INVESTIGATE OTHER CHANGES

Look for:

• additional users
• role changes
• data modification
• collection deletion
• configuration changes
• credential changes.

STEP 8 — ROTATE CREDENTIALS

If an existing administrative credential may have been compromised, rotate affected credentials.

STEP 9 — CHECK NETWORK/OS ACCESS

Database compromise may originate from:

• exposed MongoDB network access
• compromised application host
• stolen DBA credential
• compromised OS account
• CI/CD secret leakage.

STEP 10 — RECOVERY AND HARDENING

Remove unauthorized access, validate cluster integrity, and close the original attack path.`,

      internalWorking: `Unknown user found
      |
      v
Was creation approved?
    /       \
 YES        NO/unknown
 |             |
document    security incident
               |
          preserve evidence
               |
            contain
               |
          find origin`,

      architecture: `          POSSIBLE ENTRY PATHS
          /       |        \
         v        v         v
      DBA cred   App host   OS/CI secret
          \       |        /
           \      |       /
               MongoDB
                  |
           unauthorized user`,

      examples: [
        `An automation account may explain the user, but this must be verified from change records.`,
        `An unknown root-equivalent user may indicate compromised administrative credentials.`,
        `Deleting the account immediately without collecting evidence can make root-cause analysis harder.`
      ],

      commands: [
        {
          command:
            'db.getUser("<unknownUser>", { showPrivileges: true })',
          explanation:
            'Determines the unknown identity’s roles and effective privilege scope.'
        }
      ],

      productionScenario: `During a routine review, the DBA finds an unfamiliar administrative user created in admin.

No change ticket exists.

The DBA preserves relevant logs and audit evidence, contains the account, identifies another administrator credential used around the creation time, rotates that credential, searches for additional security changes, and escalates the incident.`,

      troubleshootingApproach: `1. Verify exact account.

2. Inspect effective privileges.

3. Check approved changes.

4. Preserve logs/audit evidence.

5. Contain suspicious account.

6. Identify creation time where evidence permits.

7. Identify likely creator/session.

8. Review other user/role changes.

9. Review data/configuration changes.

10. Rotate potentially compromised credentials.

11. Review network and OS entry paths.

12. Validate cluster integrity.

13. Document incident.`,

      commonMistakes: [
        'Assuming an unknown account is harmless.',
        'Deleting evidence before investigation.',
        'Checking only the unknown user and not other security changes.',
        'Failing to rotate potentially compromised administrator credentials.',
        'Ignoring host and network compromise.'
      ],

      bestPractices: [
        'Maintain user inventory.',
        'Audit privileged changes where required.',
        'Review administrative users regularly.',
        'Use individual DBA identities.',
        'Integrate MongoDB incidents with organizational security response.'
      ],

      interviewAnswer: `An unexplained administrative user is a potential security incident. I verify its exact identity and privileges, check change records, preserve logs and audit evidence, contain the suspicious account, identify how it was created, and investigate other user, role, data, and configuration changes.

If an existing admin credential may be compromised, I rotate it and investigate the broader entry path rather than treating this as only a MongoDB user-management issue.`,

      keyTakeaways: [
        'Unknown privileged users require immediate investigation.',
        'Preserve evidence before destructive cleanup.',
        'Investigate the creator and other changes.',
        'Rotate compromised administrative credentials.',
        'Look beyond MongoDB for the original entry path.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 19,
    question:
      'How would you respond to a MongoDB security incident where a compromised application account may have modified or deleted production data?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 19,

    answer: {
      groundZero: `This incident has two parallel objectives:

SECURITY:
stop further unauthorized access.

DATA RECOVERY:
determine what changed and recover safely.

Do not restore blindly before understanding the incident timeline.`,

      coreConcept: `Compromised account
       |
       +------------------+
       |                  |
       v                  v
   CONTAINMENT        DATA ANALYSIS
       |                  |
 revoke/rotate        what changed?
 network control      when?
       |                  |
       +--------+---------+
                |
                v
             RECOVERY
                |
                v
            VALIDATION`,

      detailedExplanation: `PHASE 1 — DECLARE INCIDENT

Coordinate with:

• security
• application
• infrastructure
• business owners
• DBA team.

PHASE 2 — CONTAIN

Depending on circumstances:

• revoke/rotate compromised credentials
• stop affected application components
• restrict network access
• preserve unaffected database availability.

PHASE 3 — PRESERVE EVIDENCE

Before unnecessary destructive actions, preserve:

• database logs
• audit data if available
• application logs
• OS/network evidence
• backup state
• relevant oplog/PITR recovery data.

PHASE 4 — ESTABLISH TIMELINE

Determine:

T1 = likely compromise
T2 = first suspicious activity
T3 = destructive operation
T4 = containment.

PHASE 5 — DETERMINE DATA IMPACT

Identify:

• databases
• collections
• documents
• operations
• user/role changes.

PHASE 6 — SELECT RECOVERY STRATEGY

Possible strategies include:

• selective data reconstruction
• isolated backup restore and reconciliation
• point-in-time recovery
• broader environment recovery.

The correct choice depends on:

RPO
RTO
scope of corruption
available backups/PITR
business requirements.

PHASE 7 — RECOVER IN ISOLATION WHERE PRACTICAL

For selective recovery, restoring a known-good state into an isolated environment allows comparison without immediately overwriting production.

PHASE 8 — VALIDATE

Check:

• document/business correctness
• indexes
• application behavior
• replication
• security configuration.

PHASE 9 — REMOVE ATTACK PATH

Recovery is incomplete if the compromised identity or vulnerability remains usable.`,

      internalWorking: `Incident timeline

T1 compromise
 |
T2 suspicious access
 |
T3 delete/update
 |
T4 containment
 |
 v
Choose recovery point
and reconciliation strategy`,

      architecture: `            SECURITY INCIDENT
             /             \
            v               v
       Containment       Evidence
            \               /
             \             /
                Timeline
                   |
                   v
              Data impact
                   |
                   v
               Recovery
                   |
                   v
              Validation`,

      examples: [
        `A compromised read-only user may expose data without modifying it.`,
        `A readWrite account may corrupt application data but still lack cluster-administration capability.`,
        `An isolated PITR recovery can help reconstruct deleted data without rolling the whole production cluster backward.`
      ],

      commands: [
        {
          command:
            'db.getUser("<compromisedUser>", { showPrivileges: true })',
          explanation:
            'Helps establish the maximum database actions the compromised identity could perform.'
        }
      ],

      productionScenario: `An application's credential is stolen and thousands of documents are deleted.

The DBA revokes the credential and preserves recovery evidence.

Instead of immediately restoring the entire production cluster to an earlier time, the team restores a recoverable point into an isolated environment, identifies the missing records, validates them with the business, and reconciles the required data into production.

The application secret and original exposure path are remediated before service is considered fully recovered.`,

      troubleshootingApproach: `1. Declare incident.

2. Contain compromised identity.

3. Preserve evidence.

4. Determine account privileges.

5. Build incident timeline.

6. Identify affected data.

7. Verify backup/PITR availability.

8. Choose recovery strategy.

9. Recover safely, preferably isolated where appropriate.

10. Validate data.

11. Validate cluster security.

12. Remove attack path.

13. Monitor for recurrence.

14. Complete incident RCA.`,

      commonMistakes: [
        'Restoring production immediately without understanding the timeline.',
        'Destroying oplog/log evidence.',
        'Focusing only on data recovery and leaving compromised access active.',
        'Assuming all data is affected without measuring scope.',
        'Returning service before validating security.'
      ],

      bestPractices: [
        'Coordinate security and recovery workstreams.',
        'Preserve evidence.',
        'Maintain tested PITR capability.',
        'Use least privilege to limit compromise impact.',
        'Validate security before incident closure.'
      ],

      interviewAnswer: `For a compromised MongoDB application account with possible data modification, I run containment and data-recovery workstreams in parallel. I revoke the compromised access, preserve logs and recovery evidence, establish the incident timeline, determine the privilege and data blast radius, and choose recovery based on RPO/RTO and corruption scope.

Where practical I recover into an isolated environment first, reconcile validated data, close the attack path, and only then consider the incident recovered.`,

      keyTakeaways: [
        'Containment and recovery must happen together.',
        'Preserve evidence before destructive actions.',
        'Build an accurate incident timeline.',
        'Recovery method depends on data scope and RPO/RTO.',
        'Security validation is part of recovery.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'security_access_control',
    topicId: 'security-access-control',
    topicNumber: 15,
    topicName: 'Security & Access Control',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 MongoDB security investigation if production shows suspicious logins, unexpected user creation, unauthorized data changes, and possible administrative credential compromise?',
    level: 'L3+',
    difficulty: 'Scenario/Expert',
    order: 20,

    answer: {
      groundZero: `This is no longer a simple MongoDB login problem.

Multiple indicators suggest a possible security compromise:

• suspicious authentication
• unknown user creation
• unauthorized data changes
• possible admin credential theft.

The response must combine incident containment, evidence preservation, MongoDB analysis, infrastructure investigation, data recovery, credential rotation, and security hardening.`,

      coreConcept: `DETECT
  |
  v
CONTAIN
  |
  v
PRESERVE EVIDENCE
  |
  v
BUILD TIMELINE
  |
  +--> Identity impact
  +--> Data impact
  +--> Cluster impact
  +--> Host/network impact
  |
  v
ERADICATE
  |
  v
RECOVER
  |
  v
VALIDATE
  |
  v
HARDEN + RCA`,

      detailedExplanation: `PHASE 1 — INCIDENT DECLARATION

Establish:

• incident owner
• DBA lead
• security lead
• application owner
• infrastructure owner
• communication channel.

Avoid uncontrolled troubleshooting by many administrators simultaneously.

PHASE 2 — CONTAINMENT

Depending on severity:

• revoke suspicious accounts
• rotate compromised credentials
• restrict network access
• isolate affected application hosts
• stop malicious workload.

Containment should minimize further damage while preserving required business service where possible.

PHASE 3 — EVIDENCE PRESERVATION

Collect and protect:

• mongod/mongos logs
• audit records if available
• application logs
• OS authentication records
• cloud/network logs
• secret-manager records
• deployment/change history
• backup/PITR state.

Do not copy secrets into investigation notes.

PHASE 4 — IDENTITY ANALYSIS

Inventory:

• all users
• authentication databases
• assigned roles
• custom roles
• inherited privileges
• recently added identities
• recently changed roles.

Determine whether the compromised administrator created persistence through additional users.

PHASE 5 — ACCESS ANALYSIS

Investigate suspicious authentication by:

• time
• client address
• identity
• mechanism
• affected node

where available evidence permits.

PHASE 6 — DATA IMPACT

Determine whether attackers:

• read sensitive data
• inserted documents
• updated documents
• deleted documents
• dropped collections/databases
• changed indexes.

PHASE 7 — CLUSTER IMPACT

Check for unauthorized changes to:

• users
• roles
• replica-set configuration
• sharding configuration
• security configuration
• operational settings.

PHASE 8 — HOST AND NETWORK INVESTIGATION

MongoDB may only be one component of the compromise.

Investigate:

• application hosts
• DBA workstations
• bastion servers
• CI/CD systems
• secret managers
• cloud IAM
• network exposure.

PHASE 9 — CREDENTIAL ROTATION

Rotate affected:

• application credentials
• administrative credentials
• internal secrets where compromise scope requires it
• related infrastructure secrets.

Rotation order must avoid unnecessary outage.

PHASE 10 — DATA RECOVERY

Use:

• backups
• snapshots
• PITR
• isolated restore
• reconciliation

according to the established incident timeline.

PHASE 11 — VALIDATION

Before returning to normal operations verify:

DATABASE:
• expected data
• indexes
• users/roles
• replication/sharding health.

APPLICATION:
• critical transactions
• authentication
• expected functionality.

SECURITY:
• unauthorized identities removed
• compromised secrets revoked
• attack path closed
• network exposure corrected.

PHASE 12 — HARDENING

Possible improvements include:

• least privilege
• stronger secret management
• restricted network access
• TLS
• improved administrative separation
• auditing where appropriate
• alerting on user/role changes
• tested incident recovery.

PHASE 13 — RCA

Document:

what happened
when
how
blast radius
containment
recovery
root cause
preventive actions.`,

      internalWorking: `Suspicious login
      |
      v
Admin compromised?
      |
      +--> creates new user
      |
      +--> changes privileges
      |
      +--> modifies data
      |
      v
Contain access
      |
      v
Preserve evidence
      |
      v
Reconstruct timeline
      |
      v
Recover + harden`,

      architecture: `                  INCIDENT
                     |
        +------------+------------+
        |            |            |
        v            v            v
      MongoDB      Hosts        Network
        |            |            |
        v            v            v
   users/roles    OS access    exposure
   data changes   processes    traffic
        \            |            /
         \           |           /
          +----------+----------+
                     |
                     v
                ROOT CAUSE
                     |
                     v
              RECOVERY/HARDENING`,

      examples: [
        `A stolen DBA credential may allow an attacker to create additional users for persistence.`,
        `Removing one suspicious account is insufficient if another compromised administrative identity remains active.`,
        `Database recovery is incomplete if the application host that leaked the credential remains compromised.`
      ],

      commands: [
        {
          command:
            'db.getUsers({ showPrivileges: true })',
          explanation:
            'Useful as part of an authorized user and privilege inventory from the appropriate database.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health while investigating whether topology remains intact.'
        },
        {
          command:
            'db.runCommand({ connectionStatus: 1, showPrivileges: true })',
          explanation:
            'Shows the current connection identity and privilege context.'
        }
      ],

      productionScenario: `Monitoring reports repeated unusual authentication activity.

Minutes later, an unfamiliar administrative user appears and business records are modified.

The DBA team does not simply delete the user and restart MongoDB.

They declare an incident, contain suspicious access, preserve database and infrastructure evidence, inventory users and roles, reconstruct the timeline, investigate data and topology changes, rotate potentially compromised credentials, inspect the host/network entry path, recover affected data from a validated recovery point, and verify both application and security integrity.

The incident closes only after the original attack path is removed and preventive actions are assigned.`,

      troubleshootingApproach: `1. Declare security incident.

2. Establish controlled responders.

3. Contain suspicious access.

4. Preserve MongoDB and infrastructure evidence.

5. Inventory users and roles.

6. Expand effective privileges.

7. Identify suspicious authentication.

8. Build timeline.

9. Determine data impact.

10. Determine topology/configuration impact.

11. Investigate hosts/network/secrets.

12. Rotate compromised credentials.

13. Remove unauthorized persistence.

14. Recover affected data.

15. Validate replication/sharding health.

16. Validate application functionality.

17. Validate security controls.

18. Increase monitoring.

19. Complete RCA.

20. Track preventive actions to closure.`,

      commonMistakes: [
        'Treating a multi-indicator compromise as a normal login issue.',
        'Deleting evidence before investigation.',
        'Rotating only one credential when broader compromise is possible.',
        'Recovering data while leaving the attack path open.',
        'Ignoring application hosts and infrastructure.',
        'Returning to service without security validation.'
      ],

      bestPractices: [
        'Maintain a documented security incident procedure.',
        'Use least privilege everywhere.',
        'Separate human and service identities.',
        'Protect secrets centrally.',
        'Restrict network exposure.',
        'Monitor privileged user and role changes.',
        'Maintain tested backup and PITR procedures.',
        'Perform post-incident hardening.'
      ],

      interviewAnswer: `For a suspected MongoDB compromise involving suspicious logins, unexpected users and data changes, I treat it as an end-to-end security incident rather than an isolated database error.

I contain suspicious access, preserve evidence, reconstruct the timeline, inventory users and effective privileges, assess data and cluster changes, investigate the host and network entry path, rotate compromised credentials, remove unauthorized persistence, recover affected data from validated backups or PITR, and verify database, application and security integrity.

Finally, I complete RCA and harden the environment so the same attack path cannot be reused.`,

      keyTakeaways: [
        'Security incidents require coordinated response.',
        'Containment comes before uncontrolled cleanup.',
        'Evidence preservation is essential.',
        'Investigate identities, data, topology, hosts and network.',
        'Credential rotation alone is not complete recovery.',
        'Data recovery and security recovery must both succeed.',
        'RCA and hardening complete the incident lifecycle.'
      ]
    }
  }

];


/* ============================================================
   SEED FUNCTION
============================================================ */

async function seedSecurityAccessControl() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'security_access_control'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous security_access_control documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Security & Access Control questions`
    );

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

    const topicCount =
      await collection.countDocuments({
        category: 'security_access_control'
      });

    console.log(
      `Topic 15 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 15 validation failed. Expected 20 questions but found ${topicCount}.`
      );
    }

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
      'Topic 15 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 15 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedSecurityAccessControl();
