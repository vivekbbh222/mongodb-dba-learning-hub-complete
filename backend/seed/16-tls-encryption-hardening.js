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
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 1,
    question:
      'What is TLS in MongoDB, what security problem does it solve, and how is transport encryption different from authentication and authorization?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `TLS protects data while it is moving across the network.

Without TLS, traffic between:

• application and MongoDB
• MongoDB replica-set members
• mongos and shards/config servers

may be exposed to network interception risks.

TLS provides transport security.

It is different from authentication and authorization.`,

      coreConcept: `TLS:
Protect data in transit

Authentication:
Who are you?

Authorization:
What can you do?

All three solve different security problems.`,

      detailedExplanation: `A production MongoDB deployment should be viewed as multiple security layers.

TLS protects network communication.

It helps provide:

• encryption in transit
• server identity verification
• optionally client identity verification
• protection against network interception and tampering.

AUTHENTICATION

Authentication verifies the identity of the user or system connecting.

Examples:

• SCRAM
• X.509
• OIDC or enterprise mechanisms where supported.

AUTHORIZATION

Authorization determines what an authenticated identity is allowed to do.

Example:

A user authenticates successfully but may only have:

read on reports.

TLS alone does not tell MongoDB:

which collections the user may access.

Likewise, authentication alone does not encrypt the network connection.

A secure design typically combines:

network restriction
+
TLS
+
authentication
+
authorization
+
least privilege.

For replica sets and sharded clusters, TLS may also protect internal member-to-member traffic.

Production systems should not think of TLS as an optional application-side feature only.

It is part of the complete MongoDB transport-security architecture.`,

      internalWorking: `Client
  |
  | TLS encrypted channel
  v
MongoDB
  |
  | authenticate identity
  v
User
  |
  | authorize actions
  v
Database operation`,

      architecture: `              APPLICATION
                    |
                 TLS channel
                    |
                    v
                 MONGOD
                    |
              Authentication
                    |
                    v
               Authorization
                    |
                    v
                  DATA`,

      examples: [
        `SCRAM can authenticate a user while TLS protects the network traffic carrying the session.`,
        `A TLS-encrypted connection can still be denied by authorization.`,
        `Internal replica-set traffic can also be protected with TLS.`
      ],

      commands: [
        {
          command:
            'mongosh "mongodb://<host>:<port>/?tls=true" --tlsCAFile <ca.pem>',
          explanation:
            'Conceptual example of establishing a TLS-protected MongoDB connection. Exact options depend on the deployment.'
        }
      ],

      productionScenario: `An application uses valid MongoDB username/password authentication but connects over an unprotected network path without TLS.

The credentials may be authenticated correctly, yet the database traffic itself is not adequately protected in transit.

The DBA enables TLS and validates certificate trust while retaining authentication and least-privilege authorization.`,

      troubleshootingApproach: `1. Determine whether TLS is enabled.

2. Identify client-to-server path.

3. Identify internal cluster paths.

4. Verify certificate trust.

5. Verify hostname/SAN matching.

6. Verify authentication separately.

7. Verify authorization separately.

8. Check network restrictions.

9. Test application connectivity.

10. Review logs for TLS failures.`,

      commonMistakes: [
        'Thinking TLS replaces authentication.',
        'Thinking authentication automatically encrypts traffic.',
        'Protecting only application traffic but ignoring internal MongoDB traffic.',
        'Disabling certificate validation to make a connection work.',
        'Using plaintext MongoDB traffic over untrusted networks.'
      ],

      bestPractices: [
        'Use TLS for production transport security.',
        'Keep authentication and authorization enabled separately.',
        'Validate certificate trust properly.',
        'Protect internal cluster communication.',
        'Combine TLS with network restrictions.'
      ],

      interviewAnswer: `TLS protects MongoDB traffic in transit by creating an encrypted and authenticated transport channel. Authentication answers who the client is, while authorization determines what that identity may do.

A production deployment should combine TLS, authentication, authorization, least privilege, and network controls rather than treating any one of them as sufficient by itself.`,

      keyTakeaways: [
        'TLS protects data in transit.',
        'Authentication proves identity.',
        'Authorization controls permissions.',
        'TLS can protect both client and internal cluster traffic.',
        'Security requires multiple layers.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 2,
    question:
      'What are a server certificate, private key, Certificate Authority, certificate chain, and trust store in a MongoDB TLS deployment?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `TLS depends on certificates and cryptographic keys.

The major pieces are:

• server certificate
• private key
• Certificate Authority
• certificate chain
• trusted CA store.

The certificate identifies a server.

The private key proves ownership of that certificate identity.`,

      coreConcept: `CA
 |
 signs
 |
 v
Server Certificate
 |
 paired with
 |
 v
Private Key

Client trusts CA
      |
      v
Client can validate
server certificate.`,

      detailedExplanation: `SERVER CERTIFICATE

Contains information such as:

• public key
• identity information
• validity dates
• issuer
• Subject Alternative Names.

PRIVATE KEY

The private key is secret.

It must be protected strongly and normally readable only by the MongoDB operating-system account or controlled deployment process.

The private key should never be shared casually.

CERTIFICATE AUTHORITY

A CA signs certificates.

Clients that trust that CA can validate certificates issued by it.

CERTIFICATE CHAIN

A certificate may be signed by an intermediate CA, which is itself signed by a root CA.

Conceptually:

Root CA
→ Intermediate CA
→ MongoDB server certificate.

Clients need enough trusted chain information to verify the server certificate.

TRUST STORE / CA FILE

The client needs trusted CA certificates.

If the issuing CA is not trusted, TLS validation fails even if the MongoDB server certificate itself is otherwise valid.

This creates two separate concepts:

IDENTITY CERTIFICATE:
Who the server claims to be.

TRUST:
Why the client believes that identity.

A DBA troubleshooting TLS should verify both.`,

      internalWorking: `MongoDB presents certificate
      |
      v
Client checks:

Is certificate valid?
Is issuer trusted?
Is chain valid?
Does hostname match SAN?
Is certificate expired?
      |
      v
Accept / Reject`,

      architecture: `           ROOT CA
              |
              v
        INTERMEDIATE CA
              |
              v
       SERVER CERTIFICATE
              |
         PRIVATE KEY
              |
              v
            MONGOD

Client trusts CA chain`,

      examples: [
        `A valid certificate from an unknown CA can still fail client validation.`,
        `A correct certificate with the wrong private key cannot be used successfully.`,
        `An expired certificate should fail proper validation.`
      ],

      commands: [
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -subject -issuer -dates -ext subjectAltName',
          explanation:
            'Useful for inspecting certificate identity, issuer, validity and SAN information.'
        }
      ],

      productionScenario: `MongoDB starts correctly with a certificate, but clients reject the connection.

The DBA finds the server certificate was issued by a private enterprise CA that was never distributed to the application trust store.

The server certificate is valid, but client trust is incomplete.`,

      troubleshootingApproach: `1. Inspect certificate subject/SAN.

2. Inspect issuer.

3. Check validity dates.

4. Verify certificate chain.

5. Verify client trusts issuing CA.

6. Confirm private key corresponds to certificate.

7. Verify file ownership/permissions.

8. Retest TLS handshake.`,

      commonMistakes: [
        'Sharing private keys as if they were certificates.',
        'Trusting any certificate without CA validation.',
        'Ignoring intermediate certificates.',
        'Ignoring expiration.',
        'Assuming a valid certificate automatically matches the hostname.'
      ],

      bestPractices: [
        'Protect private keys strictly.',
        'Use managed PKI where possible.',
        'Track certificate expiration.',
        'Deploy complete certificate chains.',
        'Maintain trusted CA stores consistently.'
      ],

      interviewAnswer: `The server certificate contains the server's public identity, while the private key proves ownership and must remain secret. The Certificate Authority signs the certificate, and the client trusts the CA or its chain to validate the server.

A correct MongoDB TLS setup therefore requires both a valid certificate/key pair and a valid trust chain.`,

      keyTakeaways: [
        'Certificates are public identity material.',
        'Private keys are secret.',
        'CAs establish trust.',
        'Chains may include intermediates.',
        'Client trust must be configured.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 3,
    question:
      'Why does hostname verification matter in MongoDB TLS, and how do certificate Subject Alternative Names affect client connections?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `A client should not only verify:

"This certificate was signed by a trusted CA."

It should also verify:

"This certificate belongs to the MongoDB server I intended to connect to."

Hostname verification performs that identity check.`,

      coreConcept: `Client connects to:

db01.example.com

Certificate SAN contains:

db01.example.com

=> identity matches

Certificate SAN contains only:

db02.example.com

=> mismatch`,

      detailedExplanation: `Modern certificate validation relies heavily on Subject Alternative Name, or SAN.

SAN entries may contain identities such as:

DNS names
and, depending on certificate design, IP addresses.

Suppose the application connects to:

mongo-prod.company.local

The server certificate should contain an appropriate SAN matching that name.

If the certificate instead identifies:

mongo-test.company.local

a properly validating client should reject it.

WHY THIS MATTERS

Without hostname verification, an attacker could potentially present a trusted certificate for a different identity.

TLS security requires both:

trusted issuer

and:

correct intended identity.

IP-BASED CONNECTIONS

If applications connect using an IP address, the certificate needs an appropriate identity that validates for that connection style.

Using certificates designed only for DNS names while connecting by IP commonly causes TLS errors.

REPLICA SETS

MongoDB drivers may connect to multiple members.

Each member's advertised hostname and certificate identity must be compatible with the TLS design.

Therefore replica-set configuration, DNS, and certificate SAN strategy should be planned together.

The DBA should not solve hostname mismatch errors by permanently disabling hostname validation.`,

      internalWorking: `Client target:
db01.company.com

Server cert:
SAN:
db01.company.com

Trusted CA?
YES

Hostname match?
YES

=> TLS accepted`,

      architecture: `           APPLICATION
               |
        connects using DNS
               |
               v
       db01.company.com
               |
        presents certificate
               |
       SAN identity checked
               |
            MATCH?
           /     \
         YES      NO
         |         |
      continue   reject`,

      examples: [
        `Connecting by IP can fail when the certificate contains only DNS SANs.`,
        `Replica-set members need certificate identities compatible with the hostnames clients discover.`,
        `A trusted certificate can still fail because of hostname mismatch.`
      ],

      commands: [
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -ext subjectAltName',
          explanation:
            'Displays SAN entries used during hostname validation.'
        }
      ],

      productionScenario: `The DBA replaces replica-set member IPs in the connection string with DNS names.

TLS immediately starts working.

The existing certificates had SAN entries for the DNS names but not for the raw IP addresses.

The original issue was identity mismatch, not authentication failure.`,

      troubleshootingApproach: `1. Record exact hostname/IP used by client.

2. Inspect certificate SAN.

3. Compare connection target with SAN.

4. Check replica-set advertised member names.

5. Check DNS resolution.

6. Verify CA trust.

7. Verify certificate validity.

8. Correct certificate or hostnames.

9. Retest without insecure validation bypasses.`,

      commonMistakes: [
        'Disabling hostname validation permanently.',
        'Assuming CN alone solves all modern hostname validation.',
        'Using IP addresses with DNS-only certificates.',
        'Ignoring replica-set discovered hostnames.',
        'Confusing hostname mismatch with authentication failure.'
      ],

      bestPractices: [
        'Design DNS and certificates together.',
        'Use SANs matching production connection names.',
        'Keep replica-set member names consistent.',
        'Use stable DNS identities.',
        'Do not bypass hostname validation as a permanent fix.'
      ],

      interviewAnswer: `Hostname verification confirms that the certificate presented by MongoDB belongs to the specific host the client intended to reach. The certificate SAN must match the DNS name or other identity used by the connection.

A certificate may be trusted by the CA and still fail because the SAN does not match. I fix the certificate or connection identity rather than disabling verification.`,

      keyTakeaways: [
        'Trusted issuer is not enough.',
        'Server identity must match.',
        'SAN is central to hostname verification.',
        'IP and DNS connection styles affect certificate design.',
        'Do not disable validation permanently.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 4,
    question:
      'How should TLS be designed for a MongoDB replica set so that both applications and replica-set members communicate securely?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `A replica-set TLS design has at least two communication paths:

1. application to MongoDB

2. MongoDB member to MongoDB member.

Both should be considered when designing transport security.`,

      coreConcept: `Application
    |
   TLS
    |
    v
 Primary
 /     \
TLS   TLS
/       \
v       v
Secondary Secondary`,

      detailedExplanation: `A replica-set member participates in several network relationships.

CLIENT CONNECTIONS

Applications and administrative tools connect to replica members through TLS.

INTERNAL CONNECTIONS

Replica members communicate for:

• heartbeats
• replication
• election-related communication
• internal commands.

A secure design should ensure:

• each member has a valid certificate
• certificates have correct SAN identities
• members trust the appropriate CA
• applications trust the CA
• private keys are protected
• replica-set advertised hostnames match certificate identities.

TLS is separate from member authentication.

A deployment may use TLS to encrypt internal communication while keyfile or X.509-based mechanisms provide member authentication depending on the security design.

Certificate deployment should be planned as a rolling operation in production where supported.

Restarting every replica member simultaneously simply to enable TLS would unnecessarily create downtime.

The DBA should also validate that:

• election remains healthy
• replication continues
• application drivers can discover and connect to all members
• monitoring and backup tools trust the new CA.`,

      internalWorking: `Application validates:
member certificate

Member A validates:
Member B TLS identity

Member B validates:
Member C TLS identity

All endpoints need:
correct trust
+
correct identity`,

      architecture: `                    APP
                      |
                     TLS
                      |
                      v
                   PRIMARY
                 /         \
              TLS           TLS
               /             \
              v               v
         SECONDARY        SECONDARY
              \              /
               \---- TLS ---/

         CA trust shared appropriately`,

      examples: [
        `A client may connect to the Primary initially but later discover a Secondary whose certificate SAN is wrong.`,
        `Monitoring tools also need CA trust after TLS is enabled.`,
        `Internal member traffic and application traffic should both be part of the rollout plan.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Used after each rollout step to validate replica-set health.'
        },
        {
          command:
            'mongosh "mongodb://<replica-set-hosts>/?replicaSet=<rs>&tls=true" --tlsCAFile <ca.pem>',
          explanation:
            'Conceptual TLS replica-set client test.'
        }
      ],

      productionScenario: `TLS is enabled successfully on the Primary and one Secondary.

The application still fails intermittently because the third member advertises a hostname not present in its certificate SAN.

The DBA corrects the certificate identity and validates every member rather than testing only the Primary.`,

      troubleshootingApproach: `1. Inventory all replica members.

2. Record advertised hostnames.

3. Validate SAN for every member.

4. Validate CA trust.

5. Validate private-key permissions.

6. Roll changes member by member.

7. Check rs.status().

8. Check replication lag.

9. Test client discovery.

10. Test monitoring/backup clients.`,

      commonMistakes: [
        'Testing TLS only against the Primary.',
        'Ignoring internal member communication.',
        'Restarting the whole replica set simultaneously.',
        'Forgetting monitoring and backup clients.',
        'Using certificates whose SANs do not match replica-set hostnames.'
      ],

      bestPractices: [
        'Plan TLS for every communication path.',
        'Use consistent PKI.',
        'Roll changes carefully.',
        'Validate all members.',
        'Test every production client class.'
      ],

      interviewAnswer: `For a replica set, I secure both application-to-MongoDB and member-to-member communication. Each node needs valid certificate identity and trust, and replica-set hostnames should align with SANs.

I roll the change carefully, validate replication and elections after each step, and test not only the application but also monitoring, backup, and administration tools.`,

      keyTakeaways: [
        'Replica-set TLS has multiple communication paths.',
        'Every member certificate matters.',
        'SANs must match advertised names.',
        'Rollout should preserve availability.',
        'All clients must trust the CA.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 5,
    question:
      'What is the difference between encryption in transit and encryption at rest in MongoDB?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `Encryption in transit protects data while it travels across the network.

Encryption at rest protects stored data on persistent media.

They protect against different threats.`,

      coreConcept: `Application
    |
   TLS
    |
    v
 MongoDB
    |
    v
encrypted storage
    |
    v
 Disk

TLS = in transit
Storage encryption = at rest`,

      detailedExplanation: `ENCRYPTION IN TRANSIT

Protects communication such as:

• application → MongoDB
• MongoDB → MongoDB
• administration tools → MongoDB.

TLS is the primary transport-security mechanism.

ENCRYPTION AT REST

Protects data when stored on:

• database volumes
• snapshots
• backups
• disks
• object storage.

Encryption at rest may be provided by different layers depending on environment and MongoDB edition/product.

Examples conceptually include:

• storage-volume encryption
• cloud disk encryption
• database-level encryption capabilities
• encrypted backup repositories.

The important question is:

Where does encryption occur?

Suppose the database volume is encrypted by the cloud provider.

If the mounted operating system is already authorized to access that volume, mongod sees usable decrypted blocks.

This protects primarily against certain storage-media exposure scenarios.

It does not automatically protect against:

• a compromised MongoDB administrator
• a compromised application account
• SQL/NoSQL-style application abuse
• unauthorized reads through a running database.

Therefore encryption is not a replacement for authorization.

A secure deployment commonly uses:

TLS
+
storage encryption
+
authentication
+
least privilege.`,

      internalWorking: `Network attacker
      |
   TLS protects
      |
      X

Stolen disk/snapshot
      |
at-rest encryption
      |
      X

Valid compromised DB user:
encryption alone does not
replace authorization.`,

      architecture: `          DATA LIFECYCLE

Application
    |
 [TLS]
    |
 MongoDB
    |
 [storage encryption]
    |
 Disk / Snapshot / Backup`,

      examples: [
        `TLS protects a query travelling from the application to MongoDB.`,
        `Encrypted cloud volumes protect underlying stored blocks.`,
        `An authenticated privileged database user can still read data regardless of disk encryption.`
      ],

      commands: [
        {
          command:
            'db.serverStatus().security',
          explanation:
            'Some security-related runtime information may be available depending on MongoDB version and configuration; exact fields are version-dependent.'
        }
      ],

      productionScenario: `A team says their MongoDB environment is fully secure because the cloud disk is encrypted.

The DBA explains that disk encryption does not protect traffic between the application and database.

TLS is added for transport security while access control remains enforced.`,

      troubleshootingApproach: `1. Identify network encryption.

2. Identify disk encryption.

3. Identify snapshot encryption.

4. Identify backup encryption.

5. Identify key ownership.

6. Review authentication.

7. Review authorization.

8. Identify threat model gaps.

9. Test recovery with required keys.`,

      commonMistakes: [
        'Treating disk encryption as network encryption.',
        'Treating TLS as backup encryption.',
        'Thinking encryption replaces authorization.',
        'Ignoring backup/snapshot encryption.',
        'Failing to protect encryption keys.'
      ],

      bestPractices: [
        'Encrypt data in transit and at rest.',
        'Protect backups as well as live storage.',
        'Manage keys securely.',
        'Use least privilege.',
        'Design encryption around the threat model.'
      ],

      interviewAnswer: `Encryption in transit protects MongoDB network communication, usually through TLS. Encryption at rest protects persisted data such as disks, snapshots, and backups.

They address different threats, and neither replaces authentication or authorization. A strong deployment uses both forms of encryption together with access control and secure key management.`,

      keyTakeaways: [
        'Transit encryption protects network traffic.',
        'At-rest encryption protects persistent storage.',
        'They solve different problems.',
        'Backups need encryption too.',
        'Encryption does not replace access control.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 6,
    question:
      'What is X.509 authentication in MongoDB, how is it related to TLS certificates, and how is it different from SCRAM?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `X.509 authentication uses certificates to authenticate identities.

SCRAM uses username/password-derived credentials.

TLS may provide the secure certificate-based connection layer, while X.509 uses certificate identity as an authentication mechanism.`,

      coreConcept: `SCRAM:

username + password
      |
      v
authentication


X.509:

client certificate
      |
      v
certificate identity
      |
      v
authentication`,

      detailedExplanation: `TLS and X.509 authentication are related but not identical.

TLS can be used simply to encrypt a connection and validate the server.

X.509 authentication goes further by using certificate identity to authenticate the connecting client or MongoDB member.

SCRAM

Authentication material is based on:

• username
• password-derived credentials.

X.509

Authentication is based on:

• certificate
• private key
• trusted CA relationship
• certificate subject identity.

X.509 can also be used for internal MongoDB member authentication in supported configurations.

Advantages can include:

• no reusable password for the client
• integration with enterprise PKI
• strong certificate lifecycle management.

Operational complexity includes:

• certificate issuance
• private key security
• revocation/rotation
• certificate expiration
• subject identity mapping
• trust distribution.

A certificate is not secure if its private key is stolen.

Therefore private-key management is as important as password management.

The exact X.509 configuration syntax and supported combinations should always be validated for the deployed MongoDB version.`,

      internalWorking: `Client certificate
      |
      v
TLS handshake
      |
      v
Certificate trusted?
      |
      v
Identity extracted
      |
      v
MongoDB user mapping
      |
      v
Authorization roles`,

      architecture: `               CLIENT
                  |
          certificate + key
                  |
                 TLS
                  |
                  v
               MONGOD
                  |
           X.509 identity
                  |
                  v
             MongoDB roles`,

      examples: [
        `A client certificate may provide both TLS client identity and MongoDB X.509 authentication.`,
        `SCRAM users depend on passwords rather than client certificates.`,
        `Certificate expiration can cause an X.509-authenticated application outage.`
      ],

      commands: [
        {
          command:
            'mongosh "mongodb://<host>/?authMechanism=MONGODB-X509&tls=true" --tlsCertificateKeyFile <client.pem> --tlsCAFile <ca.pem>',
          explanation:
            'Conceptual example of X.509 authentication. Exact connection options depend on deployment/version.'
        }
      ],

      productionScenario: `An organization wants database services to authenticate without distributing static application passwords.

The security team already operates enterprise PKI.

The MongoDB team evaluates X.509 authentication, certificate rotation procedures, private-key storage, and operational compatibility before rollout.`,

      troubleshootingApproach: `1. Verify TLS handshake.

2. Verify client certificate.

3. Check issuer trust.

4. Check certificate validity.

5. Check subject identity.

6. Check MongoDB X.509 user mapping.

7. Check assigned roles.

8. Verify private-key permissions.

9. Check server logs.

10. Compare with exact version requirements.`,

      commonMistakes: [
        'Thinking every TLS connection automatically uses X.509 authentication.',
        'Ignoring certificate expiration.',
        'Exposing client private keys.',
        'Assuming CA trust automatically grants database roles.',
        'Confusing certificate authentication with authorization.'
      ],

      bestPractices: [
        'Use managed PKI.',
        'Protect private keys.',
        'Monitor certificate expiration.',
        'Use least-privilege roles.',
        'Test certificate rotation procedures.'
      ],

      interviewAnswer: `SCRAM authenticates using username/password-derived credentials, while X.509 uses certificate identity. TLS is the encrypted transport mechanism, and X.509 can use certificates on that TLS connection to authenticate clients or cluster members.

After X.509 authentication, MongoDB authorization still determines what the identity may do.`,

      keyTakeaways: [
        'X.509 is certificate-based authentication.',
        'SCRAM is password-based.',
        'TLS and X.509 are related but different.',
        'Authorization is still required.',
        'Certificate lifecycle management is critical.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 7,
    question:
      'How should a MongoDB DBA manage certificate expiration and certificate rotation without causing a production outage?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `Certificates expire.

If a production MongoDB certificate expires and clients enforce validation correctly, connections can fail.

Certificate rotation must therefore be planned before expiration.`,

      coreConcept: `Monitor expiry
    |
    v
Issue replacement
    |
    v
Validate SAN/chain
    |
    v
Deploy carefully
    |
    v
Verify clients/members
    |
    v
Retire old certificate`,

      detailedExplanation: `CERTIFICATE ROTATION SHOULD START BEFORE EXPIRATION

A DBA should know:

• certificate expiration date
• issuing CA
• certificate SANs
• affected services
• key location
• restart/reload behavior for the deployed MongoDB version.

STEP 1 — GENERATE/ISSUE REPLACEMENT

Ensure:

• correct hostnames
• correct SANs
• appropriate key usage
• correct CA chain.

STEP 2 — VALIDATE BEFORE DEPLOYMENT

Use certificate inspection tools.

STEP 3 — TEST CLIENT TRUST

If the issuing CA changes, clients may require the new CA before the server certificate is switched.

This often requires a trust-overlap period.

STEP 4 — ROLL MEMBERS

For replica sets, rotate one member at a time using an availability-safe procedure appropriate to the MongoDB version and certificate-change behavior.

STEP 5 — TEST

Validate:

• client connections
• replica-set health
• monitoring
• backups
• application failover/discovery.

STEP 6 — RETIRE OLD MATERIAL

Remove obsolete private keys/certificates according to policy.

CA ROTATION IS MORE COMPLEX

Replacing only a leaf certificate under the same trusted CA is simpler than replacing the CA itself.

CA rotation may require:

old trust
+
new trust

during a migration period.

Certificate lifecycle must be monitored automatically rather than relying on someone remembering the expiration date.`,

      internalWorking: `Old cert valid
      |
New cert issued
      |
Clients trust new chain
      |
Members rotated
      |
All validated
      |
Old cert retired`,

      architecture: `             CERTIFICATE CA
                 |
          replacement cert
                 |
      +----------+----------+
      |          |          |
      v          v          v
    Node A     Node B     Node C
      |
  rolling validation
      |
      v
 applications/tools`,

      examples: [
        `A CA change can require client trust-store updates before server certificate replacement.`,
        `One missed monitoring agent may fail after rotation even when the main application works.`,
        `Certificate expiry monitoring should alert well before the expiration date.`
      ],

      commands: [
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -dates -issuer -subject -ext subjectAltName',
          explanation:
            'Checks validity dates and identity before deployment.'
        }
      ],

      productionScenario: `The MongoDB certificate expires in three days.

A replacement is ready, but it is signed by a new CA.

Instead of changing the server certificate immediately, the DBA first ensures application and monitoring clients trust the new CA, then rotates replica members carefully and validates the cluster.`,

      troubleshootingApproach: `1. Check expiration date.

2. Identify affected nodes.

3. Validate replacement certificate.

4. Validate SANs.

5. Validate CA chain.

6. Determine whether CA changes.

7. Update client trust if needed.

8. Roll certificates safely.

9. Check rs.status().

10. Test applications/tools.

11. Monitor TLS errors.

12. Retire old material.`,

      commonMistakes: [
        'Waiting until certificate expiration day.',
        'Replacing the CA without client trust preparation.',
        'Testing only one MongoDB node.',
        'Forgetting backup and monitoring tools.',
        'Leaving old private keys unmanaged.'
      ],

      bestPractices: [
        'Automate expiration monitoring.',
        'Rotate well before expiry.',
        'Maintain trust overlap for CA changes.',
        'Roll production changes safely.',
        'Test all client types.'
      ],

      interviewAnswer: `I treat certificate rotation as a planned lifecycle operation. I monitor expiration early, issue and validate the replacement certificate, ensure SANs and trust chains are correct, prepare client trust especially if the CA changes, and then rotate MongoDB members carefully while validating replication and application connectivity.

I never wait until the certificate has already expired.`,

      keyTakeaways: [
        'Certificates have operational lifecycles.',
        'Expiry must be monitored.',
        'CA rotation is more complex than leaf rotation.',
        'Client trust may need preparation.',
        'Validation must include all MongoDB clients.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 8,
    question:
      'What network-hardening controls should be used around MongoDB in addition to authentication and TLS?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `MongoDB should not be exposed to every network simply because authentication and TLS are enabled.

Network access should be restricted to systems that actually need database connectivity.`,

      coreConcept: `Internet
   X

Trusted app subnet
    |
    v
Firewall / Security Group
    |
    v
MongoDB

Only required sources
and ports allowed.`,

      detailedExplanation: `Database security follows defense in depth.

Even with strong credentials and TLS, limiting network reachability reduces attack surface.

Controls may include:

• host firewall
• cloud security groups
• network ACLs
• private subnets
• routing controls
• VPN/private connectivity
• bastion/jump hosts
• segmentation between environments.

BIND ADDRESS

MongoDB should listen only on interfaces required for the deployment.

Binding broadly is not automatically unsafe if external firewalls are correct, but unnecessarily broad exposure increases risk.

PORT ACCESS

Only systems that require MongoDB connectivity should reach the MongoDB service port.

Examples:

Allowed:
• application servers
• replica-set peers
• monitoring system
• approved administration hosts.

Not automatically allowed:
• entire corporate network
• every cloud subnet
• public Internet.

ENVIRONMENT SEGMENTATION

Development should not automatically have network access to production databases.

REPLICA SETS

Member-to-member connectivity must still work after hardening.

SHARDED CLUSTERS

mongos, shards, and config-server communication paths must be included.

Network hardening should be tested before removing broad firewall rules.`,

      internalWorking: `Source request
     |
     v
Firewall policy
   /       \
allow      deny
 |           |
 v           X
MongoDB

Then TLS/auth
still apply.`,

      architecture: `             TRUSTED CLIENTS
                  |
                  v
          FIREWALL / SG / ACL
                  |
                  v
             PRIVATE NETWORK
                  |
                  v
                MONGODB`,

      examples: [
        `MongoDB can use TLS and strong passwords yet still be unnecessarily exposed to the Internet.`,
        `A monitoring server needs database access but unrelated office desktops usually do not.`,
        `Replica-set members require network connectivity between each other.`
      ],

      commands: [
        {
          command:
            'ss -lntp | grep mongod',
          explanation:
            'Example OS-level check showing which address/port mongod is listening on, subject to permissions.'
        }
      ],

      productionScenario: `Security discovers production MongoDB is reachable from every subnet in the cloud account.

Authentication and TLS are enabled, but this still represents unnecessary exposure.

The DBA and network team restrict access to application, monitoring, backup, and replica-member networks only.`,

      troubleshootingApproach: `1. Identify listening interfaces.

2. Inventory legitimate clients.

3. Inventory member-to-member paths.

4. Inspect firewall/security-group rules.

5. Check public exposure.

6. Check environment segmentation.

7. Tighten rules gradually.

8. Test application access.

9. Test replication.

10. Test monitoring/backup access.`,

      commonMistakes: [
        'Assuming TLS makes broad network exposure harmless.',
        'Allowing 0.0.0.0/0 to MongoDB unnecessarily.',
        'Blocking replica-set member communication accidentally.',
        'Forgetting monitoring/backup clients.',
        'Using shared flat networks for all environments.'
      ],

      bestPractices: [
        'Use private networking where possible.',
        'Allow only required source networks.',
        'Segment environments.',
        'Review firewall rules periodically.',
        'Combine network controls with TLS and authentication.'
      ],

      interviewAnswer: `MongoDB should be protected with defense in depth. In addition to TLS and access control, I restrict network connectivity using private subnets, firewalls or security groups, segmentation, and controlled administration paths.

Only application servers, cluster members, monitoring, backup systems, and approved administration hosts should normally reach the database port.`,

      keyTakeaways: [
        'Network restriction reduces attack surface.',
        'TLS is not a substitute for firewalling.',
        'Only required clients should connect.',
        'Cluster communication must remain allowed.',
        'Environment segmentation matters.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 9,
    question:
      'How should MongoDB private keys, keyfiles, passwords, and encryption keys be stored and handled securely?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `Security secrets should not live in:

• source code
• Git repositories
• shell history
• tickets
• chat messages
• world-readable files.

Different secret types include:

• MongoDB passwords
• TLS private keys
• replica-set keyfiles
• encryption keys.`,

      coreConcept: `Secret
  |
  v
Approved secret system
  |
  +--> access controlled
  +--> audited
  +--> encrypted
  +--> rotated
  +--> minimum exposure
  |
  v
Authorized service only`,

      detailedExplanation: `PASSWORDS

Application and administrative passwords should be stored through approved secret-management systems.

Examples conceptually include:

• cloud secret managers
• enterprise vault systems
• protected orchestration secrets.

TLS PRIVATE KEYS

Private keys should have:

• restrictive filesystem permissions
• controlled ownership
• secure deployment
• rotation procedures.

REPLICA-SET KEYFILES

These are authentication secrets and must be protected like credentials.

They should not be copied casually by email or chat.

ENCRYPTION KEYS

At-rest encryption keys require even stronger lifecycle control because losing the key can make encrypted data unrecoverable.

KEY MANAGEMENT SHOULD ADDRESS

• creation
• storage
• access control
• rotation
• backup/recovery
• revocation
• audit.

SEPARATION OF DUTIES

Where practical, database administrators should not automatically have unrestricted access to every encryption key and security secret.

BACKUPS

If backups are encrypted, recovery tests must verify that required keys can actually be retrieved during a disaster.

An encrypted backup without recoverable keys is effectively unusable.

Logging systems should also be checked to ensure secrets are not accidentally captured.`,

      internalWorking: `Application
    |
 requests secret
    |
    v
Secret Manager
    |
 authorized access
    |
    v
credential used
without storing in source code`,

      architecture: `             SECRET SYSTEM
          +---------+---------+
          |         |         |
          v         v         v
      DB creds   TLS keys  encryption keys
          |         |         |
          +---------+---------+
                    |
                    v
              controlled use`,

      examples: [
        `A TLS certificate can be public, but its private key must remain protected.`,
        `Encrypted backups are useless if the recovery team cannot obtain the decryption key.`,
        `A connection string containing a password should not be committed to source control.`
      ],

      commands: [
        {
          command:
            'ls -l <key-or-certificate-path>',
          explanation:
            'Example check of file ownership and permissions without displaying secret contents.'
        }
      ],

      productionScenario: `A replica-set keyfile is found inside an automation repository.

Even though the repository is private, the DBA treats the secret as exposed to more identities than intended.

The team rotates the key material using a controlled procedure and moves secret delivery into the approved secret-management platform.`,

      troubleshootingApproach: `1. Inventory secret types.

2. Identify storage locations.

3. Review permissions.

4. Check repository exposure.

5. Check logging exposure.

6. Review secret owners.

7. Review rotation process.

8. Review recovery procedure.

9. Rotate compromised secrets.

10. Remove insecure copies.`,

      commonMistakes: [
        'Treating private Git repositories as secret stores.',
        'Printing private keys during troubleshooting.',
        'Storing passwords in scripts.',
        'Encrypting backups without preserving key recovery.',
        'Never rotating long-lived secrets.'
      ],

      bestPractices: [
        'Use approved secret managers.',
        'Restrict file permissions.',
        'Rotate secrets.',
        'Audit access.',
        'Test key recovery during DR drills.'
      ],

      interviewAnswer: `MongoDB passwords, internal keyfiles, TLS private keys, and encryption keys are security-sensitive secrets. I keep them out of source control, logs, shell history, tickets, and chat, and store them in controlled secret-management systems with least-privilege access and rotation.

For encryption keys, recovery is especially important because losing the key can make valid backups unusable.`,

      keyTakeaways: [
        'Secrets require controlled storage.',
        'Private keys must never be casually exposed.',
        'Source control is not a secret manager.',
        'Rotation is part of secret lifecycle.',
        'Recovery keys must be tested.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 10,
    question:
      'How would you perform a practical MongoDB production hardening review across TLS, network exposure, access control, secrets, operating system, and monitoring?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `MongoDB hardening means reducing unnecessary attack surface and ensuring every security layer is deliberately configured.

A hardening review should not look only at MongoDB users.

It should cover the entire environment.`,

      coreConcept: `MongoDB Hardening

TLS
 |
Network
 |
Authentication
 |
Authorization
 |
Secrets
 |
OS
 |
Backups
 |
Monitoring
 |
Change control`,

      detailedExplanation: `A production hardening review should cover several layers.

1. TRANSPORT SECURITY

Verify:

• TLS enabled where required
• valid certificates
• correct SANs
• trusted CA chain
• expiration monitoring.

2. NETWORK

Verify:

• no unnecessary public exposure
• restricted security groups/firewalls
• private connectivity where appropriate
• environment segmentation.

3. AUTHENTICATION

Verify:

• authentication enabled
• approved mechanisms
• no unnecessary shared accounts
• internal member authentication configured.

4. AUTHORIZATION

Verify:

• least privilege
• no unnecessary root accounts
• application roles scoped correctly
• stale users removed.

5. SECRETS

Verify:

• passwords in secret manager
• keyfiles protected
• TLS private keys protected
• no secrets in source code.

6. OPERATING SYSTEM

Review:

• mongod OS user
• file ownership
• permissions
• service management
• unnecessary interactive access
• patching responsibilities.

7. STORAGE

Verify:

• storage encryption where required
• secure mount/access controls
• backup/snapshot encryption.

8. BACKUP SECURITY

Backups can contain the entire production dataset.

Protect:

• backup credentials
• backup storage
• encryption keys
• retention/deletion permissions.

9. LOGGING AND MONITORING

Monitor:

• authentication failures
• unexpected user changes
• TLS/certificate problems
• abnormal network patterns
• security configuration changes where observable.

10. CHANGE MANAGEMENT

Security changes should be:

• documented
• tested
• rolled safely
• reversible.

11. EMERGENCY ACCESS

Ensure break-glass procedures exist and are controlled.

12. PERIODIC REVIEW

Hardening is not a one-time installation task.

It should be reviewed as:

applications
networks
users
versions

change.`,

      internalWorking: `Review
  |
  +--> Is TLS strong?
  +--> Is network narrow?
  +--> Are users minimal?
  +--> Are secrets protected?
  +--> Is OS controlled?
  +--> Are backups protected?
  +--> Are alerts present?
  |
  v
Remediation plan`,

      architecture: `                   MONGODB
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
      TLS          Access          Network
       |              |              |
       +--------------+--------------+
                      |
                   Secrets
                      |
                      v
                     OS
                      |
                      v
              Storage / Backups
                      |
                      v
                 Monitoring`,

      examples: [
        `A fully patched MongoDB server is still poorly hardened if it is publicly reachable with broad credentials.`,
        `An encrypted database is still exposed if backups are stored unencrypted.`,
        `Strong TLS is insufficient when application users have root privileges.`
      ],

      commands: [
        {
          command:
            'db.runCommand({ connectionStatus: 1, showPrivileges: true })',
          explanation:
            'Useful for checking the current authenticated identity and privileges.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Confirms replica-set health after hardening changes.'
        },
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -dates -issuer -subject -ext subjectAltName',
          explanation:
            'Useful for certificate review without exposing private key contents.'
        }
      ],

      productionScenario: `A security review initially focuses only on MongoDB users.

The DBA expands the review and finds:

• production port reachable from unnecessary subnets
• one certificate nearing expiry
• an old migration user still enabled
• a keyfile stored in an automation repository
• backups not covered by the same encryption policy.

The final remediation closes all of these gaps rather than treating hardening as only RBAC.`,

      troubleshootingApproach: `1. Inventory topology.

2. Review TLS.

3. Review certificates.

4. Review network exposure.

5. Review authentication.

6. Review user roles.

7. Review internal authentication.

8. Review secret storage.

9. Review OS permissions.

10. Review encryption at rest.

11. Review backup security.

12. Review monitoring.

13. Review break-glass access.

14. Build prioritized remediation.

15. Retest after changes.`,

      commonMistakes: [
        'Treating security as only user/password configuration.',
        'Ignoring backups.',
        'Ignoring certificate expiration.',
        'Ignoring network exposure.',
        'Allowing old privileged accounts indefinitely.'
      ],

      bestPractices: [
        'Use defense in depth.',
        'Review security periodically.',
        'Protect every copy of production data.',
        'Monitor security-relevant events.',
        'Prioritize fixes by risk and blast radius.'
      ],

      interviewAnswer: `I perform MongoDB hardening as a layered review across TLS, certificates, network exposure, authentication, authorization, internal member security, secret management, OS permissions, storage encryption, backup protection, monitoring, and emergency access.

The objective is defense in depth: if one control fails, another control should still limit the attack surface or blast radius.`,

      keyTakeaways: [
        'Hardening is multi-layered.',
        'Backups are part of the security boundary.',
        'TLS and RBAC are only part of the picture.',
        'Secrets and OS controls matter.',
        'Hardening should be reviewed continuously.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 11,
    question:
      'A MongoDB client suddenly reports TLS handshake failures. How would you perform an L3 investigation to identify whether the problem is certificate trust, hostname validation, protocol compatibility, certificate expiry, or connectivity?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `A TLS handshake happens before normal MongoDB database operations can proceed.

Therefore a TLS handshake failure should first be investigated as a transport-security problem rather than immediately treating it as a MongoDB username/password problem.

The investigation should separate:

• TCP connectivity
• TLS negotiation
• certificate trust
• certificate identity
• certificate validity
• protocol/cipher compatibility
• MongoDB authentication.`,

      coreConcept: `Troubleshoot in layers:

DNS
 ↓
TCP
 ↓
TLS handshake
 ↓
Certificate validation
 ↓
MongoDB authentication
 ↓
Authorization

Find the first layer that fails.`,

      detailedExplanation: `An L3 investigation should avoid randomly changing TLS options.

STEP 1 — DEFINE THE FAILURE

Determine:

• which clients fail
• which MongoDB members fail
• when failure started
• whether every connection fails
• whether only one application or node is affected.

STEP 2 — TEST NETWORK CONNECTIVITY

Before debugging certificates, confirm the target host and port are reachable.

A timeout caused by a firewall is different from a certificate rejection.

STEP 3 — INSPECT SERVER CERTIFICATE

Check:

• validity dates
• issuer
• SAN
• certificate chain.

STEP 4 — CHECK TRUST

Determine which CA the client trusts.

A newly rotated server certificate may have been signed by a CA missing from the client's trust configuration.

STEP 5 — CHECK HOSTNAME VALIDATION

Compare the exact hostname or IP used by the client with the certificate SAN.

STEP 6 — CHECK TLS NEGOTIATION

Client and server must have compatible TLS capabilities.

Protocol/cipher behavior depends on:

• MongoDB version
• operating system
• crypto libraries
• client/driver version
• security policy.

Do not solve negotiation failures by permanently weakening TLS policy without understanding the cause.

STEP 7 — CHECK CERTIFICATE CHAIN

A server may have the correct leaf certificate but an incomplete chain.

STEP 8 — CHECK TIME

Certificate validation depends on validity periods.

Incorrect system time can make a valid certificate appear expired or not yet valid.

STEP 9 — CHECK MONGODB LOGS

Correlate server-side TLS messages with client-side errors.

STEP 10 — ONLY THEN INVESTIGATE AUTHENTICATION

If TLS succeeds but MongoDB rejects credentials, the problem has moved to the authentication layer.`,

      internalWorking: `Client
  |
  | TCP connect
  v
Server
  |
  | TLS negotiation
  v
Certificate presented
  |
  +--> trusted CA?
  +--> valid dates?
  +--> SAN matches?
  +--> compatible protocol?
  |
  v
TLS established
  |
  v
MongoDB authentication`,

      architecture: `              APPLICATION
                   |
                  DNS
                   |
                   v
               NETWORK
                   |
                   v
              TCP :27017
                   |
                   v
             TLS HANDSHAKE
             /    |     \
          Trust  SAN   Validity
             \    |     /
                   v
            AUTHENTICATION
                   |
                   v
              AUTHORIZATION`,

      examples: [
        `All clients failing immediately after certificate rotation strongly suggests checking certificate/trust changes.`,
        `Only clients connecting by IP failing can indicate SAN mismatch.`,
        `A TCP timeout should not be diagnosed as a CA problem.`,
        `TLS succeeding followed by AuthenticationFailed indicates a different layer.`
      ],

      commands: [
        {
          command:
            'openssl s_client -connect <host>:<port> -servername <hostname> -CAfile <ca.pem>',
          explanation:
            'Useful diagnostic for inspecting the TLS handshake and certificate chain. Do not expose private-key material in troubleshooting output.'
        },
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -subject -issuer -dates -ext subjectAltName',
          explanation:
            'Checks certificate identity, issuer, validity and SAN.'
        },
        {
          command:
            'mongosh "mongodb://<host>:<port>/?tls=true" --tlsCAFile <ca.pem>',
          explanation:
            'Tests MongoDB connectivity using TLS after the lower-level handshake has been investigated.'
        }
      ],

      productionScenario: `After a weekend certificate change, Java applications fail while an administrator can connect from one Linux server.

The DBA compares trust stores rather than concluding MongoDB TLS is universally broken.

The new certificate chain is trusted on the administration server but not in the application runtime trust configuration.

Updating the appropriate trust chain resolves the issue without disabling certificate validation.`,

      troubleshootingApproach: `1. Capture exact error.

2. Identify affected clients/nodes.

3. Verify DNS.

4. Verify TCP connectivity.

5. Inspect server certificate.

6. Check expiration/not-before dates.

7. Inspect SAN.

8. Verify CA chain.

9. Verify client trust.

10. Check TLS compatibility.

11. Check system time.

12. Correlate MongoDB logs.

13. Test with a controlled client.

14. Investigate authentication only after TLS succeeds.`,

      commonMistakes: [
        'Resetting MongoDB passwords for a TLS handshake failure.',
        'Using insecure TLS options as the permanent fix.',
        'Ignoring SAN mismatch.',
        'Ignoring incomplete certificate chains.',
        'Testing only from one client host.'
      ],

      bestPractices: [
        'Troubleshoot layer by layer.',
        'Preserve certificate validation.',
        'Compare working and failing clients.',
        'Correlate client and server logs.',
        'Document certificate changes.'
      ],

      interviewAnswer: `For TLS handshake failures, I separate network connectivity from TLS and MongoDB authentication. I first verify DNS and TCP connectivity, then inspect certificate validity, SAN, CA trust, chain completeness, system time, and TLS compatibility.

I correlate client errors with MongoDB logs and compare working versus failing clients. I do not disable certificate or hostname validation simply to make the error disappear.`,

      keyTakeaways: [
        'TLS failures occur before normal MongoDB authentication.',
        'Network and TLS failures must be separated.',
        'Trust and hostname identity are different checks.',
        'Client differences can reveal trust-store problems.',
        'Never weaken TLS blindly.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 12,
    question:
      'A MongoDB certificate is valid and signed by your organization, but clients report certificate-chain or unknown-CA errors. How would you troubleshoot the trust chain?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `A valid server certificate is not enough.

The client must be able to build a trusted path from the server certificate to a CA it trusts.

Conceptually:

Server certificate
      ↓
Intermediate CA
      ↓
Root CA

If part of that chain is missing or untrusted, validation may fail.`,

      coreConcept: `Identity and trust are separate.

Correct server certificate
        +
complete certificate chain
        +
trusted CA
        =
successful trust validation.`,

      detailedExplanation: `Start by identifying the complete certificate hierarchy.

STEP 1 — INSPECT THE LEAF CERTIFICATE

Record:

• subject
• issuer
• validity
• SAN.

STEP 2 — IDENTIFY INTERMEDIATE CA

If the leaf certificate was issued by an intermediate CA, the validating side needs the required chain information.

STEP 3 — IDENTIFY TRUST ANCHOR

Determine which root CA the client actually trusts.

Do not assume every operating system, container, JVM, driver environment, or application uses the same trust store.

STEP 4 — COMPARE WORKING AND FAILING CLIENTS

This is particularly useful.

For example:

Linux mongosh works
Java application fails.

That can indicate different trust stores rather than different MongoDB server behavior.

STEP 5 — VERIFY CHAIN

Use certificate tools to validate the chain using the intended CA material.

STEP 6 — CHECK RECENT CA ROTATION

A new server certificate may have been signed by:

new intermediate
or
new root CA.

Some clients may still trust only the old hierarchy.

STEP 7 — CHECK SERVER CONFIGURATION

Ensure the certificate/key material and chain are assembled according to the requirements of the MongoDB version and deployment.

Do not simply concatenate random certificates until the error disappears.

Understand the expected chain order and trust configuration.

STEP 8 — CHECK EXPIRATION THROUGHOUT THE CHAIN

The leaf certificate may be valid while an intermediate certificate is expired.

Every relevant part of the validation path matters.`,

      internalWorking: `Server certificate
      |
      v
Intermediate CA
      |
      v
Root CA
      |
      v
Client trust store

Any broken trust link
      |
      v
TLS validation failure`,

      architecture: `               ROOT CA
                  |
             trusts/signs
                  |
                  v
           INTERMEDIATE CA
                  |
                  v
           SERVER CERT
                  |
                  v
               MONGOD

Client must validate path
to trusted CA.`,

      examples: [
        `The server leaf certificate can be unexpired while the intermediate CA has expired.`,
        `A container image may contain an older CA bundle than the host operating system.`,
        `A JVM may use a different trust store from command-line OpenSSL tools.`
      ],

      commands: [
        {
          command:
            'openssl verify -CAfile <ca-bundle.pem> <server-certificate.pem>',
          explanation:
            'Conceptual certificate-chain validation. Intermediate handling depends on how the chain is supplied.'
        },
        {
          command:
            'openssl s_client -connect <host>:<port> -servername <hostname> -showcerts',
          explanation:
            'Displays certificates presented during the TLS handshake for diagnostic purposes.'
        }
      ],

      productionScenario: `The MongoDB certificate was renewed through the corporate PKI.

Linux administrative clients work, but application containers fail with an unknown-CA error.

The new certificate uses a recently introduced intermediate CA.

The container trust bundle was never updated.

The DBA coordinates the trust-store update rather than disabling TLS verification.`,

      troubleshootingApproach: `1. Inspect leaf certificate.

2. Identify issuer.

3. Identify intermediate CA.

4. Identify root CA.

5. Inspect certificates presented by server.

6. Inspect client trust store.

7. Compare working/failing clients.

8. Check all certificate validity periods.

9. Check recent CA changes.

10. Correct chain/trust configuration.

11. Retest strict validation.`,

      commonMistakes: [
        'Assuming server certificate validity proves trust.',
        'Ignoring intermediate CAs.',
        'Assuming every client uses the OS trust store.',
        'Disabling CA verification.',
        'Ignoring CA/intermediate expiration.'
      ],

      bestPractices: [
        'Maintain documented PKI chains.',
        'Keep client trust stores current.',
        'Test CA changes before production rollout.',
        'Monitor CA as well as leaf expiration.',
        'Preserve strict certificate verification.'
      ],

      interviewAnswer: `For an unknown-CA or chain error, I inspect the entire trust path rather than only the MongoDB leaf certificate. I identify the leaf issuer, intermediate CAs, root CA, certificates presented by the server, and the actual trust store used by the failing client.

I also compare working and failing clients because runtimes such as Java or containers may maintain different trust stores.`,

      keyTakeaways: [
        'Leaf validity does not guarantee chain validity.',
        'Intermediate certificates matter.',
        'Clients can use different trust stores.',
        'CA rotation must be coordinated.',
        'Strict verification should remain enabled.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 13,
    question:
      'MongoDB TLS works when clients connect using DNS names but fails when they connect using IP addresses. How would you investigate and correct the issue?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `This pattern strongly suggests certificate identity validation should be investigated.

A certificate issued for:

db01.example.com

does not automatically prove identity for:

10.10.20.15.

DNS names and IP addresses must be represented appropriately in certificate identity.`,

      coreConcept: `Connection target:

db01.example.com
        |
SAN contains DNS identity
        |
       PASS


Connection target:

10.10.20.15
        |
No matching IP identity
        |
       FAIL`,

      detailedExplanation: `STEP 1 — RECORD EXACT CONNECTION TARGET

Determine whether the client uses:

• DNS name
• short hostname
• FQDN
• IP address.

STEP 2 — INSPECT SAN

Inspect the certificate Subject Alternative Names.

STEP 3 — COMPARE TARGET WITH CERTIFICATE

If the client connects by IP, proper validation requires the certificate identity to support that connection form.

A DNS SAN should not simply be treated as an IP identity.

STEP 4 — CHECK REPLICA-SET CONFIGURATION

This is critical.

Drivers discover replica-set members from the topology advertised by MongoDB.

Suppose the initial URI uses:

db01.example.com

but rs.conf() advertises:

10.10.20.15:27017.

The driver may later attempt to connect to the IP address and encounter certificate mismatch.

Therefore the seed-list URI alone does not define every hostname the driver will use.

STEP 5 — CHOOSE A STABLE IDENTITY STRATEGY

In most managed production environments, stable DNS names are easier to maintain than certificates tied to changing IP addresses.

STEP 6 — CORRECT CERTIFICATES OR HOST CONFIGURATION

Do not permanently bypass hostname validation.

Fix:

• certificate SAN
or
• advertised hostnames
or
• client connection identity

according to the intended architecture.`,

      internalWorking: `Driver connects:
db01.example.com
       |
       v
discovers replica set
       |
       v
10.10.20.16
       |
       v
certificate SAN mismatch
       |
       v
connection failure`,

      architecture: `              DRIVER
                 |
                 v
          db01.example.com
                 |
              works
                 |
        topology discovery
                 |
                 v
          10.10.20.16
                 |
          SAN mismatch
                 |
                 X`,

      examples: [
        `A seed-list DNS name can work while discovered replica-set IP addresses fail.`,
        `Stable DNS names generally simplify certificate lifecycle management.`,
        `Hostname-verification bypasses hide rather than solve identity problems.`
      ],

      commands: [
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -ext subjectAltName',
          explanation:
            'Shows the identities contained in the certificate.'
        },
        {
          command:
            'rs.conf().members.map(m => m.host)',
          explanation:
            'Shows hostnames MongoDB advertises for replica-set members.'
        }
      ],

      productionScenario: `An application initially connects successfully to the replica set using an FQDN.

Seconds later, the driver logs TLS hostname errors.

The replica configuration contains raw IP addresses.

The DBA aligns replica-set member identities with the production DNS/certificate design and validates driver discovery across every member.`,

      troubleshootingApproach: `1. Capture connection target.

2. Inspect SAN.

3. Inspect rs.conf() member names.

4. Check driver-discovered hosts.

5. Check DNS resolution.

6. Determine desired identity model.

7. Correct certificates or topology names safely.

8. Test every replica member.

9. Test failover.

10. Keep hostname verification enabled.`,

      commonMistakes: [
        'Checking only the initial URI.',
        'Ignoring replica-set discovery.',
        'Assuming DNS SAN validates an IP.',
        'Disabling hostname verification.',
        'Changing replica-set hostnames without a safe operational plan.'
      ],

      bestPractices: [
        'Use stable production DNS identities.',
        'Align certificates and replica-set hostnames.',
        'Test every member.',
        'Test failover after certificate changes.',
        'Preserve identity verification.'
      ],

      interviewAnswer: `If DNS connections work but IP connections fail, I inspect the certificate SAN and the exact identity used by the client. I also check rs.conf() because MongoDB drivers discover the member addresses advertised by the replica set.

I align DNS, replica-set hostnames, and certificate SANs rather than disabling hostname validation.`,

      keyTakeaways: [
        'DNS and IP certificate identities are different.',
        'Replica-set discovery affects TLS.',
        'The seed URI is not the entire topology.',
        'Stable DNS simplifies TLS design.',
        'Fix identity rather than bypassing validation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 14,
    question:
      'A production MongoDB certificate has expired and applications can no longer connect. How would you recover safely while minimizing downtime and avoiding insecure emergency workarounds?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `An expired certificate is an operational security incident.

The goal is:

restore a valid trust relationship quickly

without turning off the security controls that detected the problem.`,

      coreConcept: `Expired certificate
       |
       v
Confirm scope
       |
       v
Issue valid replacement
       |
       v
Validate chain/SAN
       |
       v
Roll safely
       |
       v
Restore clients
       |
       v
Post-incident fix`,

      detailedExplanation: `STEP 1 — CONFIRM THE FAILURE

Check certificate validity and confirm the error is actually expiration.

Also verify system clocks.

STEP 2 — DETERMINE SCOPE

Is the expired certificate:

• one replica member
• all members
• mongos
• a client certificate
• an intermediate CA
• root CA?

The recovery strategy depends on scope.

STEP 3 — ISSUE REPLACEMENT

Use the approved PKI process.

Validate:

• SAN
• issuer
• chain
• validity
• private-key relationship.

STEP 4 — DETERMINE RELOAD/RESTART REQUIREMENTS

Certificate reload behavior and supported operational procedures vary with MongoDB version and configuration.

Use the documented method for that exact deployment.

STEP 5 — PRESERVE AVAILABILITY

For a replica set, avoid taking all members down simultaneously.

If some members remain operational, preserve majority and replication while rolling the repair.

STEP 6 — VALIDATE EACH MEMBER

After changing a member:

• check logs
• check TLS connection
• check replica status
• check replication.

STEP 7 — VALIDATE APPLICATION

Test actual application drivers rather than only mongosh.

STEP 8 — DO NOT NORMALIZE INSECURE BYPASSES

Options that suppress certificate validation may seem attractive during an outage.

They reduce security exactly when the environment is already in an abnormal state.

Use an approved emergency procedure rather than silently making insecure settings permanent.

STEP 9 — PERFORM RCA

Certificate expiration is usually preventable.

Determine why:

• monitoring failed
• ownership unclear
• renewal automation failed
• change ticket delayed
• CA process failed.`,

      internalWorking: `Failure
 |
 v
Check dates/time
 |
 v
Replace certificate
 |
 v
Validate trust + SAN
 |
 v
Restore securely
 |
 v
Prevent recurrence`,

      architecture: `           APPLICATIONS
                 X
          expired cert
                 |
                 v
              MONGODB
                 |
          replacement cert
                 |
                 v
          secure connectivity
              restored`,

      examples: [
        `If only one Secondary certificate expired, the whole replica set may not need downtime.`,
        `If an intermediate CA expired, replacing only the leaf certificate may not solve the issue.`,
        `Incorrect server time can produce misleading validity errors.`
      ],

      commands: [
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -dates -subject -issuer',
          explanation:
            'Confirms certificate validity and identity.'
        },
        {
          command:
            'date',
          explanation:
            'Basic check of host time; actual time synchronization investigation may require OS-team privileges.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Validate replica-set health during recovery.'
        }
      ],

      productionScenario: `All applications begin rejecting the MongoDB certificate at midnight.

The DBA confirms the leaf certificate expired.

A replacement had been issued but never deployed.

The team validates the replacement, rolls it according to the supported procedure, confirms replica health and application connectivity, then adds automated expiration alerts and clear certificate ownership.`,

      troubleshootingApproach: `1. Confirm expiry error.

2. Check system time.

3. Determine affected certificate.

4. Determine cluster impact.

5. Obtain replacement.

6. Validate SAN/chain/key.

7. Plan availability-safe rollout.

8. Validate each member.

9. Test applications.

10. Remove any temporary emergency changes.

11. Perform RCA.

12. Implement expiry monitoring.`,

      commonMistakes: [
        'Disabling TLS globally during the incident.',
        'Disabling certificate validation permanently.',
        'Restarting every replica member together.',
        'Replacing the wrong certificate in the chain.',
        'Skipping RCA after service restoration.'
      ],

      bestPractices: [
        'Monitor expiry well in advance.',
        'Maintain certificate ownership.',
        'Keep tested rotation procedures.',
        'Preserve replica-set availability.',
        'Use approved emergency security procedures.'
      ],

      interviewAnswer: `I first confirm the expiration and determine whether the affected certificate is the leaf, intermediate, CA, server, or client certificate. I obtain and validate the replacement, then restore it using the supported availability-safe procedure for that MongoDB version.

I avoid permanently weakening certificate validation and follow the recovery with RCA and automated expiration monitoring.`,

      keyTakeaways: [
        'Expired certificates are preventable incidents.',
        'Determine which certificate expired.',
        'Preserve security during recovery.',
        'Roll replica-set changes safely.',
        'Expiry monitoring is mandatory.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 15,
    question:
      'How would you perform a Certificate Authority rotation for MongoDB without breaking applications, monitoring tools, backup systems, or replica-set communication?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Changing the CA is more complex than renewing a server certificate.

A CA defines trust.

If the server starts using certificates signed by a new CA before clients trust that CA, those clients can stop connecting.`,

      coreConcept: `Old state:

Clients trust CA-A
Servers use CA-A


Transition:

Clients trust CA-A + CA-B
        ↓
Servers move to CA-B
        ↓
Validate everything
        ↓
Remove CA-A trust`,

      detailedExplanation: `A safe CA rotation normally requires a planned trust transition.

PHASE 1 — INVENTORY

Identify every TLS participant:

• applications
• MongoDB nodes
• mongos
• config servers
• monitoring
• backup
• automation
• administrative tools.

PHASE 2 — PREPARE NEW CA

Issue replacement certificates with:

• correct SANs
• correct usage
• appropriate validity.

PHASE 3 — ESTABLISH TRUST OVERLAP

Where supported and appropriate, clients and servers should temporarily be able to validate the required old and new trust chains during migration.

The exact mechanism depends on MongoDB, driver, OS and application configuration.

PHASE 4 — UPDATE CLIENT TRUST

Applications should trust the new CA before MongoDB endpoints depend exclusively on it.

PHASE 5 — ROTATE DATABASE ENDPOINTS

Roll MongoDB components according to topology and supported procedures.

PHASE 6 — VALIDATE

Test:

• every replica member
• application connections
• elections/failover
• monitoring
• backup
• administrative tools.

PHASE 7 — REMOVE OLD TRUST

Only after all participants have migrated should the old CA be retired according to security policy.

This process becomes more complicated if:

• internal member authentication uses X.509
• multiple environments share PKI
• old applications have embedded trust stores
• containers use stale CA bundles.

CA rotation is therefore a coordinated infrastructure change, not simply replacing one PEM file.`,

      internalWorking: `           CA-A
            |
       old trust

Introduce CA-B
     |
     v
Trust A + B
     |
     v
Move endpoints to B
     |
     v
Validate
     |
     v
Retire A`,

      architecture: `              NEW CA
                 |
       +---------+---------+
       |         |         |
       v         v         v
     DB nodes   Apps     Tooling
       |         |         |
       +---------+---------+
                 |
            migration
                 |
                 v
             OLD CA
              retired`,

      examples: [
        `Monitoring can fail after CA rotation even when the main application works.`,
        `A Java service may have a private trust store that must be updated separately.`,
        `X.509 internal authentication makes certificate identity and trust especially important.`
      ],

      commands: [
        {
          command:
            'openssl verify -CAfile <new-ca-bundle.pem> <replacement-certificate.pem>',
          explanation:
            'Validates the replacement certificate against intended trust material.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health throughout the controlled rollout.'
        }
      ],

      productionScenario: `The enterprise security team retires an old root CA.

Before the deadline, the MongoDB team inventories applications and discovers an old backup agent with its own trust bundle.

Updating only application servers would have caused backup failure after rotation.

The team updates trust everywhere, rotates MongoDB certificates, validates all clients, and then removes the old CA.`,

      troubleshootingApproach: `1. Inventory TLS participants.

2. Identify current CA.

3. Identify new CA.

4. Issue replacement certificates.

5. Validate SAN/chain.

6. Plan trust overlap.

7. Update client trust.

8. Roll database components.

9. Validate replica health.

10. Validate applications.

11. Validate monitoring/backups.

12. Retire old CA only after confirmation.`,

      commonMistakes: [
        'Replacing server certificates before clients trust the new CA.',
        'Forgetting monitoring and backup systems.',
        'Assuming every client shares one trust store.',
        'Removing old CA too early.',
        'Treating CA rotation as a single-server change.'
      ],

      bestPractices: [
        'Maintain a TLS dependency inventory.',
        'Use staged trust migration.',
        'Test CA rotation in lower environments.',
        'Validate every client category.',
        'Document rollback criteria.'
      ],

      interviewAnswer: `For CA rotation, I first inventory every TLS participant. I establish the new trust chain before endpoints depend on it, then rotate MongoDB components carefully and validate applications, replica communication, monitoring, backups, and administration tools.

Only after the environment is fully migrated do I retire the old CA.`,

      keyTakeaways: [
        'CA rotation changes trust.',
        'Trust should move before dependency.',
        'Every client must be inventoried.',
        'Overlap prevents abrupt trust failure.',
        'Old trust is removed only after validation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 16,
    question:
      'A TLS rollout causes MongoDB replica-set members to stop communicating and the Primary loses majority. How would you investigate and recover the cluster safely?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 16,

    answer: {
      groundZero: `This is now both:

a TLS incident

and

a replica-set availability incident.

The DBA must protect data consistency while restoring trusted member-to-member communication.`,

      coreConcept: `TLS rollout
    |
members cannot authenticate/connect
    |
heartbeats fail
    |
majority unavailable
    |
Primary may step down
    |
restore communication safely`,

      detailedExplanation: `STEP 1 — STOP THE ROLLOUT

Do not continue applying the same change to additional members.

STEP 2 — DETERMINE CURRENT TOPOLOGY

Identify:

• which members are reachable
• which member was Primary
• which members can communicate
• whether majority exists.

STEP 3 — CHECK TLS LOGS

Look for:

• unknown CA
• certificate mismatch
• SAN problems
• certificate/key errors
• internal authentication failures.

STEP 4 — COMPARE WORKING AND FAILED MEMBERS

Determine what changed:

• certificate
• CA file
• key permissions
• hostname
• TLS mode
• internal-auth configuration.

STEP 5 — PROTECT CONSISTENCY

Do not use forced replica-set reconfiguration merely to get a Primary quickly.

Forced reconfiguration can create serious data-consistency risk and should only be considered in specific recovery circumstances with full understanding of surviving data.

STEP 6 — RESTORE COMPATIBLE COMMUNICATION

Use the approved rollback or forward-fix plan.

For example, if a newly rotated Secondary cannot trust the old members, correct the trust configuration rather than modifying replica-set metadata unnecessarily.

STEP 7 — REESTABLISH MAJORITY

Once enough voting members communicate again, normal election behavior can restore a writable Primary.

STEP 8 — VERIFY REPLICATION

Check:

• member states
• replication lag
• last applied data
• election behavior.

STEP 9 — RESUME ROLLOUT ONLY AFTER RCA

Determine why pre-change validation failed.`,

      internalWorking: `Member A
   X
 TLS failure
   X
Member B
   |
   X
Member C

No majority
    |
    v
No stable writable Primary

Fix trust/identity
    |
    v
Heartbeats restored
    |
    v
Majority restored`,

      architecture: `          BEFORE

        PRIMARY
        /     \
      TLS     TLS
      /         \
    SEC         SEC


          AFTER BAD CHANGE

        MEMBER
        X     X
      TLS     TLS
      X         X
    MEMBER     MEMBER


          RECOVERY

        MEMBER
        /     \
      TLS     TLS
      /         \
    MEMBER     MEMBER
          |
       majority`,

      examples: [
        `A member may have a valid certificate but fail because peers do not trust its new CA.`,
        `Wrong certificate SANs can break member identity validation.`,
        `Private-key file permission errors can prevent a member from starting correctly.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Use from a reachable member to understand replica-set state.'
        },
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -subject -issuer -dates -ext subjectAltName',
          explanation:
            'Inspect certificate differences without exposing private keys.'
        }
      ],

      productionScenario: `During a three-member replica-set TLS rotation, two nodes receive certificates from a new CA while the remaining member does not trust that CA.

Member communication breaks and majority is lost.

The DBA stops the rollout, restores compatible trust, confirms member communication and replication, allows normal election behavior to recover the Primary, and only then redesigns the CA migration with trust overlap.`,

      troubleshootingApproach: `1. Stop further changes.

2. Establish current topology.

3. Preserve logs.

4. Compare TLS configurations.

5. Check CA trust.

6. Check SAN identities.

7. Check key permissions.

8. Avoid unnecessary forced reconfig.

9. Restore member communication.

10. Reestablish majority.

11. Validate replication.

12. Validate application writes.

13. Perform RCA.

14. Redesign rollout.`,

      commonMistakes: [
        'Continuing the rollout after the first failure.',
        'Forcing reconfiguration immediately.',
        'Restarting all members together.',
        'Assuming the problem is replication rather than TLS.',
        'Ignoring potential data divergence.'
      ],

      bestPractices: [
        'Roll one controlled step at a time.',
        'Define rollback criteria.',
        'Preserve majority whenever possible.',
        'Test member-to-member trust before production.',
        'Validate replication after every step.'
      ],

      interviewAnswer: `If a TLS rollout causes majority loss, I stop the rollout and treat it as both a security and availability incident. I identify surviving members and compare certificate, CA, SAN, key permission, and internal-auth configuration.

My priority is restoring compatible member communication without unsafe forced reconfiguration. Once majority returns, I validate election state and replication before resuming any change.`,

      keyTakeaways: [
        'TLS failures can cause replica-set outages.',
        'Stop a failing rollout early.',
        'Preserve majority and consistency.',
        'Forced reconfiguration is not a routine fix.',
        'Validate replication after recovery.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 17,
    question:
      'An application using MongoDB X.509 authentication suddenly receives authentication failures even though the TLS handshake succeeds. How would you troubleshoot the problem?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 17,

    answer: {
      groundZero: `If the TLS handshake succeeds, basic encrypted transport and server trust may already be working.

X.509 authentication can still fail afterward.

This means:

TLS connection success
does not equal
MongoDB X.509 authentication success.`,

      coreConcept: `TLS succeeds
    |
    v
Client certificate accepted
    |
    v
X.509 identity determined
    |
    v
MongoDB identity mapping
    |
    v
Authentication
    |
    v
Authorization`,

      detailedExplanation: `STEP 1 — SEPARATE TLS FROM AUTHENTICATION

Confirm the error occurs after TLS establishment.

STEP 2 — INSPECT CLIENT CERTIFICATE

Check:

• subject
• issuer
• validity
• intended usage.

STEP 3 — CHECK WHETHER CERTIFICATE CHANGED

Certificate renewal can sometimes introduce identity changes.

The replacement may have:

• different subject
• different organizational attributes
• different CA hierarchy.

STEP 4 — CHECK MONGODB X.509 IDENTITY

MongoDB's X.509 authentication model uses certificate identity according to its supported configuration.

Verify the corresponding MongoDB user/identity exists as required.

STEP 5 — CHECK AUTHENTICATION DATABASE/MECHANISM

Ensure the client is actually using the intended X.509 authentication mechanism and correct connection configuration.

STEP 6 — CHECK ROLES

Authentication and authorization remain different.

If authentication succeeds but the operation is unauthorized, investigate roles instead.

STEP 7 — COMPARE WORKING CERTIFICATE

If possible, compare metadata from the previous working certificate with the new one.

Do not compare or expose private keys.

STEP 8 — CHECK SERVER LOGS

Server-side messages can help distinguish:

• TLS certificate acceptance
• X.509 authentication failure
• authorization denial.

STEP 9 — CORRECT IDENTITY OR MAPPING

Do not weaken certificate validation or create broad privileges just to restore service.`,

      internalWorking: `TLS handshake
    |
   PASS
    |
Client cert identity
    |
MongoDB X.509 mapping
    |
   FAIL
    |
Authentication rejected`,

      architecture: `             APPLICATION
                  |
             client cert
                  |
                  v
              TLS PASS
                  |
                  v
          X.509 AUTHENTICATION
                  |
             PASS / FAIL
                  |
                  v
             AUTHORIZATION`,

      examples: [
        `A renewed certificate can be trusted for TLS while presenting a different subject identity for authentication.`,
        `Authentication can succeed while a later operation fails because the user lacks privileges.`,
        `Changing passwords is irrelevant to an application using X.509 authentication.`
      ],

      commands: [
        {
          command:
            'openssl x509 -in <client-certificate.pem> -noout -subject -issuer -dates',
          explanation:
            'Inspect the client certificate identity and validity without exposing its private key.'
        },
        {
          command:
            'db.runCommand({ connectionStatus: 1, showPrivileges: true })',
          explanation:
            'When authenticated, helps verify current identity and privileges.'
        }
      ],

      productionScenario: `An application certificate is renewed.

TLS continues to work, but MongoDB X.509 authentication fails.

The new certificate contains a changed subject identity due to a PKI template modification.

The DBA compares the old and new certificate subjects, corrects the intended identity mapping, and restores access without creating an unnecessary high-privilege user.`,

      troubleshootingApproach: `1. Confirm TLS succeeds.

2. Capture authentication error.

3. Inspect client certificate.

4. Compare old/new subject.

5. Check issuer and validity.

6. Verify X.509 mechanism.

7. Verify MongoDB identity mapping.

8. Check roles separately.

9. Review server logs.

10. Correct identity safely.

11. Retest application.`,

      commonMistakes: [
        'Treating successful TLS as successful X.509 authentication.',
        'Resetting passwords for an X.509 user.',
        'Ignoring certificate subject changes.',
        'Granting root to bypass authorization problems.',
        'Exposing client private keys during troubleshooting.'
      ],

      bestPractices: [
        'Preserve certificate identity during renewal.',
        'Test X.509 renewal before production.',
        'Separate authentication from authorization.',
        'Protect client private keys.',
        'Monitor certificate lifecycle.'
      ],

      interviewAnswer: `If TLS succeeds but X.509 authentication fails, I investigate the client certificate identity and MongoDB X.509 mapping rather than the network encryption layer. I compare the old and new certificate subject, issuer, validity and authentication configuration.

I also distinguish an authentication failure from an authorization failure because successful X.509 authentication does not automatically grant privileges.`,

      keyTakeaways: [
        'TLS success does not prove X.509 authentication success.',
        'Certificate subject identity matters.',
        'Renewal can accidentally change identity.',
        'Authentication and authorization remain separate.',
        'Private keys should never be exposed.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 18,
    question:
      'A MongoDB TLS private key or internal authentication secret is suspected to be compromised. How would you contain, rotate, investigate, and recover from the incident?',
    level: 'L3+',
    difficulty: 'Expert',
    order: 18,

    answer: {
      groundZero: `A suspected secret compromise must be treated differently from normal certificate expiration.

The question is no longer only:

"Does the certificate work?"

It becomes:

"Could an unauthorized party use the stolen secret?"`,

      coreConcept: `Suspected compromise
       |
       v
Contain
       |
       v
Assess exposure
       |
       v
Issue new secret
       |
       v
Rotate safely
       |
       v
Revoke old trust
       |
       v
Investigate
       |
       v
Monitor`,

      detailedExplanation: `STEP 1 — TREAT THE SECRET AS COMPROMISED

Do not wait for proof of malicious use before planning rotation.

STEP 2 — DETERMINE WHAT WAS EXPOSED

Examples:

• TLS server private key
• TLS client private key
• replica-set keyfile
• administrative password
• encryption key.

Each has a different blast radius.

STEP 3 — PRESERVE EVIDENCE

Record:

• where secret existed
• who had access
• relevant audit/security logs
• repository history
• host access history where available.

Do not destroy useful evidence while cleaning up.

STEP 4 — CONTAIN ACCESS

Restrict the suspected exposure path.

For example:

• revoke unauthorized repository access
• isolate compromised host
• disable affected identity when safe.

STEP 5 — GENERATE NEW SECRET MATERIAL

Do not simply copy the compromised secret to another location.

STEP 6 — ROTATE SAFELY

For replica-set internal authentication or TLS material, use the supported transition procedure for the exact MongoDB version and topology.

The objective is to avoid:

• majority loss
• application outage
• incompatible member authentication.

STEP 7 — REVOKE/RETIRE OLD MATERIAL

Where PKI supports revocation and the deployment relies on the relevant revocation mechanisms, follow organizational PKI procedures.

Do not assume certificate revocation behavior without validating the actual MongoDB/client environment.

STEP 8 — ROTATE RELATED SECRETS IF NECESSARY

If the host or repository containing one secret also contained others, assume broader exposure may be possible.

STEP 9 — INVESTIGATE USE

Review:

• unusual authentication
• unexpected user changes
• configuration changes
• suspicious connections
• data access.

STEP 10 — FIX ROOT CAUSE

Examples:

• secrets committed to Git
• broad filesystem permissions
• insecure automation
• excessive administrative access.`,

      internalWorking: `Secret exposed
     |
     v
Potential impersonation
     |
     v
Contain source
     |
     v
Replace secret
     |
     v
Invalidate old access
     |
     v
Investigate activity`,

      architecture: `         COMPROMISED SECRET
                 |
        +--------+--------+
        |                 |
        v                 v
  unauthorized use    lateral exposure
        |                 |
        +--------+--------+
                 |
                 v
          INCIDENT RESPONSE
                 |
      rotate + investigate`,

      examples: [
        `A private Git repository should not be considered an acceptable long-term location for a replica-set keyfile.`,
        `A compromised TLS private key requires different analysis from an exposed public certificate.`,
        `If a compromised host contained multiple secrets, rotating only one may be insufficient.`
      ],

      commands: [
        {
          command:
            'ls -l <secret-path>',
          explanation:
            'Checks metadata/permissions without printing secret contents.'
        },
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -serial -subject -issuer -dates',
          explanation:
            'Useful for identifying a certificate during incident investigation without displaying private-key material.'
        }
      ],

      productionScenario: `A repository scan finds a replica-set keyfile committed months earlier.

The team does not merely delete the file from the latest branch.

They treat the secret as compromised, review repository history and access, generate new material, perform a controlled internal-auth rotation, investigate suspicious database access, and migrate secret delivery to an approved vault.`,

      troubleshootingApproach: `1. Identify secret type.

2. Determine exposure scope.

3. Preserve evidence.

4. Contain access.

5. Inventory related secrets.

6. Generate replacement.

7. Plan safe rotation.

8. Rotate.

9. Revoke/retire old material.

10. Review database activity.

11. Review host/repository access.

12. Fix secret-management process.

13. Monitor for recurrence.`,

      commonMistakes: [
        'Deleting the exposed file and considering the incident closed.',
        'Reusing the same secret.',
        'Rotating every replica member simultaneously.',
        'Destroying logs before investigation.',
        'Assuming a private repository means no compromise occurred.'
      ],

      bestPractices: [
        'Use dedicated secret-management systems.',
        'Rotate suspected compromised secrets promptly.',
        'Preserve forensic evidence.',
        'Minimize secret distribution.',
        'Audit secret access.'
      ],

      interviewAnswer: `If a MongoDB private key or internal authentication secret is suspected to be compromised, I treat it as an incident. I determine the blast radius, preserve evidence, contain the exposure path, generate new secret material and rotate it using a topology-safe procedure.

I then retire the old material, investigate suspicious access, rotate related secrets if necessary, and fix the secret-management weakness that caused the exposure.`,

      keyTakeaways: [
        'Compromise requires incident response.',
        'Deletion alone does not revoke exposure.',
        'New secret material must be generated.',
        'Rotation must preserve cluster availability.',
        'Root cause must be fixed.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 19,
    question:
      'MongoDB data and backups are encrypted, but the encryption key or external key-management service becomes unavailable during a disaster. How would you investigate the real recoverability of the environment?',
    level: 'L3+',
    difficulty: 'Expert',
    order: 19,

    answer: {
      groundZero: `Encrypted data is only recoverable when the required keys are also recoverable.

Therefore:

Backup exists

does not automatically mean

Backup is recoverable.

Key availability is part of the disaster-recovery design.`,

      coreConcept: `Encrypted backup
      +
required key
      +
working key access
      =
recoverable data


Encrypted backup
      +
missing key
      =
unusable backup`,

      detailedExplanation: `STEP 1 — IDENTIFY ENCRYPTION LAYER

Determine where encryption occurs:

• database-level capability
• filesystem/storage volume
• cloud disk
• backup product
• object storage.

Different layers use different key mechanisms.

STEP 2 — IDENTIFY REQUIRED KEY

Determine:

• key identifier
• key-management system
• access policy
• region/account dependency.

STEP 3 — DETERMINE WHY KEY ACCESS FAILED

Possible causes:

• KMS outage
• network failure
• IAM/access-policy problem
• deleted/disabled key
• expired credential
• regional outage
• DNS problem
• firewall restriction.

STEP 4 — CHECK KEY REDUNDANCY/DR DESIGN

The key-management architecture should not have exactly the same failure domain as the database if the business requires recovery from that failure domain.

STEP 5 — CHECK BACKUP DEPENDENCY

Determine whether older backups depend on:

• old key versions
• retired keys
• external metadata
• backup-system credentials.

STEP 6 — DO NOT DESTROY OLD KEYS CASUALLY

Key rotation and key deletion are very different.

Historical encrypted data may still require previous key material depending on the encryption design.

STEP 7 — TEST RECOVERY

A DR exercise should prove:

• backup can be accessed
• required keys can be accessed
• decryption works
• MongoDB can start/restore
• application data is valid.

STEP 8 — INCLUDE KMS IN RTO

If MongoDB is restored in 30 minutes but obtaining the encryption key takes four hours, the service RTO is not 30 minutes.`,

      internalWorking: `Backup storage
     |
 encrypted data
     |
     v
needs key
     |
     v
KMS / key store
     |
   available?
   /      \
 yes       no
 |          |
restore    blocked`,

      architecture: `              DR SITE
                 |
       +---------+---------+
       |                   |
       v                   v
    BACKUP               KMS
       |                   |
 encrypted data         key access
       |                   |
       +---------+---------+
                 |
                 v
             RESTORE
                 |
                 v
              MONGODB`,

      examples: [
        `Cross-region backups provide incomplete DR if their keys are accessible only through the failed region.`,
        `Deleting an old encryption key can make retained historical backups unusable.`,
        `An IAM failure can appear operationally similar to a missing key.`
      ],

      commands: [
        {
          command:
            '<approved KMS or backup-platform diagnostic command>',
          explanation:
            'The exact command depends on the cloud/KMS/backup product. Do not expose key material while testing access.'
        }
      ],

      productionScenario: `The primary region is unavailable and the backup exists in another region.

The restore fails because the recovery account cannot access the encryption key.

The DBA works with the security/cloud team to distinguish KMS availability from IAM policy failure and includes key-access restoration in the actual DR timeline.

Future DR tests explicitly validate key access from the recovery environment.`,

      troubleshootingApproach: `1. Identify encryption layer.

2. Identify required key.

3. Identify KMS/key store.

4. Test authorized key access.

5. Check IAM/permissions.

6. Check network/DNS.

7. Check key state.

8. Check regional dependencies.

9. Validate historical key requirements.

10. Perform controlled restore test.

11. Measure real RTO.

12. Correct DR architecture.`,

      commonMistakes: [
        'Testing backups without testing decryption keys.',
        'Deleting old keys without dependency analysis.',
        'Keeping backup and keys in the same failure domain.',
        'Confusing permission failure with data corruption.',
        'Reporting restore RTO without key-access time.'
      ],

      bestPractices: [
        'Include key management in DR design.',
        'Test key recovery regularly.',
        'Protect keys separately from data.',
        'Document historical key dependencies.',
        'Measure end-to-end RTO.'
      ],

      interviewAnswer: `Encrypted MongoDB backups are recoverable only if the required encryption keys and access paths survive the disaster. I identify the encryption layer, required key, KMS dependency, permissions, network path and failure domain.

DR testing must prove both backup access and key access. I include KMS recovery time in the real RTO because a perfectly healthy backup is useless if it cannot be decrypted.`,

      keyTakeaways: [
        'Encryption keys are part of recoverability.',
        'Backup availability alone is insufficient.',
        'KMS has its own failure domains.',
        'Historical backups may need historical keys.',
        'DR must test decryption.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'tls_encryption_hardening',
    topicId: 'tls-encryption-hardening',
    topicNumber: 16,
    topicName: 'TLS, Encryption & Hardening',
    questionNumber: 20,
    question:
      'How would you perform an end-to-end L3 MongoDB security incident investigation where applications cannot connect after certificate rotation, replica-set communication is unstable, one private key may have been exposed, and management wants service restored immediately?',
    level: 'L3+',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `This incident combines:

• production outage
• TLS failure
• replica-set instability
• possible credential compromise
• pressure for rapid recovery.

The DBA must restore service without sacrificing data consistency or silently disabling security controls.`,

      coreConcept: `INCIDENT

Application TLS failure
        +
Replica instability
        +
Secret compromise
        |
        v
Contain change
        |
        v
Protect cluster consistency
        |
        v
Diagnose trust/identity
        |
        v
Rotate compromised material
        |
        v
Restore securely
        |
        v
Validate
        |
        v
RCA`,

      detailedExplanation: `PHASE 1 — DECLARE AND STABILIZE

Stop the certificate rollout.

Freeze unrelated changes.

Record:

• timeline
• affected applications
• current replica topology
• certificate changes
• suspected secret exposure.

PHASE 2 — DETERMINE DATABASE AVAILABILITY

Check:

• reachable members
• current Primary
• majority
• replication state
• application write availability.

Do not force topology changes simply because management wants a Primary immediately.

Data consistency remains a priority.

PHASE 3 — ISOLATE TLS FAILURE

For affected paths determine:

• TCP connectivity
• certificate presented
• CA chain
• SAN identity
• expiration
• TLS compatibility
• internal member trust.

PHASE 4 — COMPARE CONFIGURATIONS

Compare:

working member
versus
failing member.

Look for:

• different CA files
• different certificate issuer
• incorrect SAN
• private-key permission
• wrong certificate/key pair
• changed internal-auth configuration.

PHASE 5 — HANDLE POSSIBLE KEY COMPROMISE

If a private key may have been exposed, do not restore long-term service by simply returning to the compromised key.

Contain the exposure and prepare fresh key material.

Preserve evidence before cleanup.

PHASE 6 — CHOOSE RECOVERY PATH

Possible high-level choices:

ROLL BACK:
Return to a known secure configuration if the previous key material is not compromised and rollback is approved.

FORWARD FIX:
Correct the new CA/certificate/trust configuration and continue.

SECURITY ROTATION:
If previous material is compromised, generate new material and migrate safely.

The exact choice depends on evidence.

PHASE 7 — RESTORE MAJORITY

Restore trusted member communication.

Allow normal election behavior where possible.

Avoid unnecessary forced reconfiguration.

PHASE 8 — VALIDATE DATABASE

Check:

• Primary
• member states
• replication lag
• write/read operations
• logs.

PHASE 9 — VALIDATE CLIENTS

Test:

• applications
• monitoring
• backups
• administrative tools.

PHASE 10 — VALIDATE SECURITY

Ensure emergency troubleshooting did not leave:

• disabled certificate verification
• open firewall rules
• temporary root users
• exposed private keys
• weakened TLS configuration.

PHASE 11 — INCIDENT INVESTIGATION

Determine whether the exposed private key was actually accessed or used.

Review available:

• database logs
• security logs
• repository access
• host access
• user/configuration changes.

PHASE 12 — RCA

Document:

• triggering change
• why testing missed it
• why rollout continued
• certificate inventory gaps
• secret-management weakness
• monitoring gaps.

PHASE 13 — PREVENTION

Implement:

• certificate expiration monitoring
• staged PKI rotation
• trust-overlap planning
• secret manager
• TLS dependency inventory
• rollback criteria
• pre-production testing
• security incident runbook.`,

      internalWorking: `                INCIDENT
                   |
        +----------+----------+
        |                     |
        v                     v
   Availability           Security
        |                     |
 majority/replication    key compromise
        |                     |
        +----------+----------+
                   |
                   v
          controlled recovery
                   |
                   v
             validation
                   |
                   v
             investigation
                   |
                   v
                 RCA`,

      architecture: `                    USERS
                      |
                      X
                 TLS FAILURE
                      |
                      v
                 APPLICATION
                      |
                      X
                  MONGODB
               /      |      \
              X       |       X
             TLS   PRIMARY    TLS
              X       |       X
            MEMBER  MEMBER  MEMBER
                      |
                secret exposure?
                      |
                      v
             INCIDENT RESPONSE
                      |
             +--------+--------+
             |                 |
             v                 v
        restore HA        rotate secrets
             |                 |
             +--------+--------+
                      |
                      v
               SECURE SERVICE`,

      examples: [
        `Management pressure does not justify an unsafe forced replica-set reconfiguration.`,
        `Rolling back to an exposed private key may restore connectivity but leave a security compromise unresolved.`,
        `Testing only mongosh is insufficient if production applications use different trust stores.`,
        `Emergency firewall or TLS exceptions must be removed after recovery.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Establish current replica-set state and validate recovery.'
        },
        {
          command:
            'rs.conf().members.map(m => m.host)',
          explanation:
            'Helps compare advertised replica member identities with certificate SANs.'
        },
        {
          command:
            'openssl s_client -connect <host>:<port> -servername <hostname> -CAfile <ca.pem>',
          explanation:
            'Tests TLS handshake and trust for a specific endpoint.'
        },
        {
          command:
            'openssl x509 -in <certificate.pem> -noout -subject -issuer -dates -serial -ext subjectAltName',
          explanation:
            'Inspects certificate metadata without exposing the private key.'
        }
      ],

      productionScenario: `During a Friday-night CA rotation, two replica members stop trusting the third, application containers reject the new CA, and the old private key is discovered in an automation repository.

The DBA stops the rollout and preserves logs.

The team restores compatible member trust using fresh approved certificate material rather than relying indefinitely on the potentially compromised key.

After majority and replication recover, application trust stores are corrected.

The team verifies applications, monitoring and backups, removes temporary incident changes, rotates exposed material, and completes a formal RCA.`,

      troubleshootingApproach: `1. Stop rollout.

2. Freeze unrelated changes.

3. Build incident timeline.

4. Determine current replica topology.

5. Protect data consistency.

6. Capture TLS errors.

7. Compare certificates and CA files.

8. Verify SANs.

9. Verify key permissions.

10. Determine compromise scope.

11. Preserve evidence.

12. Choose rollback/forward-fix/rotation path.

13. Restore member communication.

14. Restore majority.

15. Validate replication.

16. Validate applications.

17. Validate monitoring/backups.

18. Remove temporary exceptions.

19. Investigate unauthorized access.

20. Complete RCA and prevention actions.`,

      commonMistakes: [
        'Prioritizing immediate Primary election over data consistency.',
        'Disabling TLS validation globally.',
        'Returning permanently to compromised key material.',
        'Continuing the rollout while failures accumulate.',
        'Ignoring monitoring and backup clients after application recovery.',
        'Closing the incident without investigating possible secret misuse.'
      ],

      bestPractices: [
        'Use staged certificate rollouts.',
        'Define explicit rollback criteria.',
        'Preserve replica-set majority.',
        'Use centralized secret management.',
        'Maintain TLS dependency inventory.',
        'Test certificate and CA rotation.',
        'Maintain security incident runbooks.',
        'Perform RCA after restoration.'
      ],

      interviewAnswer: `I treat this as both an availability and security incident. I stop the rollout, establish the current replica-set state and protect consistency before making topology changes. I then isolate TLS failures across network, trust chain, SAN, certificate and internal member communication.

Because a private key may be compromised, I preserve evidence and rotate affected material rather than simply restoring long-term service with the exposed key. After secure member communication and majority are restored, I validate replication, applications, monitoring and backups, remove emergency exceptions, investigate possible misuse and complete RCA.`,

      keyTakeaways: [
        'Security and availability must be handled together.',
        'Data consistency remains critical during outages.',
        'Compromised keys require rotation and investigation.',
        'Do not disable security controls under pressure.',
        'Recovery is incomplete until every client is validated.',
        'A full RCA should prevent recurrence.'
      ]
    }
  }

];

/* =========================================================
   SEED EXECUTION
========================================================= */

async function seedTlsEncryptionHardening() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'tls_encryption_hardening'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous tls_encryption_hardening documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} TLS, Encryption & Hardening questions`
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
        category: 'tls_encryption_hardening'
      });

    console.log(
      `Topic 16 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 16 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 16 seed completed successfully.'
    );

  } catch (error) {
    console.error(
      'Topic 16 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

seedTlsEncryptionHardening();
