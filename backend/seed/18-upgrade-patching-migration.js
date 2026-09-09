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
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 1,
    question:
      'What is the difference between MongoDB patching, minor-version upgrade, major-version upgrade, and migration?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {
      groundZero: `These terms are related but not identical.

PATCHING

Usually means moving to a newer maintenance release within the same release family.

Example conceptually:

8.0.x
→
newer 8.0.x

MAJOR-VERSION UPGRADE

Moves between major MongoDB release families.

Example:

7.0
→
8.0

MIGRATION

Moves data or workload between environments.

Examples:

• old servers to new servers
• on-premises to cloud
• self-managed MongoDB to Atlas
• one topology to another
• one hardware platform to another.`,

      coreConcept: `Patching:
same release family
    |
    v
bug/security fixes


Major upgrade:
release family changes
    |
    v
new compatibility requirements


Migration:
environment/topology moves
    |
    v
data + application transition`,

      detailedExplanation: `A DBA should distinguish these activities because their risk and preparation requirements differ.

PATCHING

A maintenance patch normally stays within the same major/minor release family.

Typical goals include:

• bug fixes
• security fixes
• reliability improvements.

Even patch upgrades still require:

• release-note review
• compatibility checks
• backup validation
• rolling procedure
• rollback thinking.

MAJOR VERSION UPGRADE

A major upgrade can introduce:

• feature changes
• removed behavior
• new defaults
• compatibility requirements
• Feature Compatibility Version transitions.

A major upgrade requires much deeper planning than simply replacing binaries.

MIGRATION

Migration changes where or how the workload runs.

Migration planning commonly includes:

• source and target compatibility
• initial data transfer
• synchronization
• cutover
• application connection changes
• rollback/fallback
• validation.

Examples:

VERSION UPGRADE:
MongoDB 7.0 replica set
→
MongoDB 8.0 replica set.

SERVER MIGRATION:
MongoDB 8.0 on old VMs
→
MongoDB 8.0 on new VMs.

Both may happen together, but combining too many changes in one maintenance window increases troubleshooting complexity.

An L3 DBA generally prefers to isolate major variables when possible.`,

      internalWorking: `Change request
     |
     +--> same release family?
     |        |
     |       patch
     |
     +--> new release family?
     |        |
     |       upgrade
     |
     +--> new environment?
              |
            migration`,

      architecture: `             CHANGE TYPES
        +----------+----------+
        |          |          |
        v          v          v
      Patch      Upgrade    Migration
        |          |          |
      binary     binary +   environment +
      update      compatibility data/cutover`,

      examples: [
        `Moving from one 7.0 maintenance release to a newer 7.0 maintenance release is different from moving from 7.0 to 8.0.`,
        `Moving to new servers without changing MongoDB version is still a migration.`,
        `Combining OS migration, major MongoDB upgrade and TLS redesign in one change increases risk.`
      ],

      commands: [
        {
          command:
            'db.version()',
          explanation:
            'Shows the MongoDB server version for the current connection.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Shows the installed/executed mongod binary version.'
        }
      ],

      productionScenario: `A team says they are performing "MongoDB patching."

The actual plan moves from MongoDB 7.0 to 8.0 and also replaces the servers.

The DBA separates this into:

major-version upgrade considerations

and:

infrastructure migration considerations.

This prevents the team from treating a complex change as a simple patch.`,

      troubleshootingApproach: `1. Identify source version.

2. Identify target version.

3. Determine whether release family changes.

4. Determine whether infrastructure changes.

5. Determine whether topology changes.

6. Identify application impact.

7. Review compatibility.

8. Define rollback separately for each change type.`,

      commonMistakes: [
        'Calling every version change patching.',
        'Treating a major upgrade like a maintenance patch.',
        'Combining multiple major infrastructure changes unnecessarily.',
        'Ignoring application compatibility.',
        'Planning rollback only at the server level.'
      ],

      bestPractices: [
        'Classify the change correctly.',
        'Separate variables where practical.',
        'Review release-specific requirements.',
        'Validate backups before changes.',
        'Document cutover and rollback.'
      ],

      interviewAnswer: `Patching usually means moving to a newer maintenance release within the same MongoDB release family, while a major upgrade moves between release families and has broader compatibility implications.

Migration means moving the workload or data to another environment or topology. I classify these separately because the validation, rollback and application impact can be very different.`,

      keyTakeaways: [
        'Patch, upgrade and migration are different operations.',
        'Major upgrades need deeper compatibility planning.',
        'Migration includes data and application cutover.',
        'Multiple changes increase troubleshooting complexity.',
        'Classify the change before designing the runbook.'
      ]
    }
  },

  /* =========================================================
     QUESTION 2
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 2,
    question:
      'What pre-checks should a MongoDB DBA perform before starting a rolling patch or version upgrade on a production replica set?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {
      groundZero: `A version change should begin only when the replica set is already healthy.

Do not start patching a degraded cluster and hope the upgrade will fix it.`,

      coreConcept: `Before upgrade:

Topology healthy
      |
Replication caught up
      |
Oplog safe
      |
Disk sufficient
      |
Backup validated
      |
Compatibility checked
      |
Packages staged
      |
Rollback ready`,

      detailedExplanation: `A production upgrade pre-check should include several categories.

1. REPLICA-SET HEALTH

Verify:

• one healthy Primary
• expected Secondaries
• no unexpected RECOVERING/STARTUP2/DOWN states.

2. REPLICATION LAG

Secondaries should be appropriately caught up before maintenance.

3. OPLOG WINDOW

The available oplog window should safely exceed the expected outage or maintenance period for each member.

4. DISK

Verify:

• sufficient free space
• no disk alerts
• no abnormal growth
• enough headroom for upgrade/recovery activities.

5. BACKUP

Confirm:

• recent backup completed
• recovery process is known
• required backup/KMS access exists.

6. VERSION PATH

Confirm that the target version is supported from the source version.

Major-version upgrades may require sequential release-family upgrades rather than skipping arbitrary versions.

7. FEATURE COMPATIBILITY

Understand current Feature Compatibility Version and required transition sequence.

8. APPLICATION/DRIVER COMPATIBILITY

Validate application driver and tooling compatibility with the target MongoDB version.

9. OPERATING SYSTEM

Confirm the target MongoDB version supports the current OS/platform.

10. CONFIGURATION

Review deprecated or removed configuration options.

11. PACKAGE/BINARY

Stage the correct package/repository/binary before maintenance.

12. SECURITY

Validate:

• TLS
• keyfile
• certificate paths
• file permissions.

13. MONITORING

Make sure alerts and monitoring are functioning before change starts.

14. CHANGE PLAN

Have:

• exact commands
• validation
• rollback
• stop criteria.

The first failed Secondary is a reason to stop and investigate, not to continue upgrading the remaining members.`,

      internalWorking: `Health check
    |
    v
Compatible?
    |
    v
Recoverable?
    |
    v
Capacity safe?
    |
    v
Runbook ready?
    |
    v
BEGIN CHANGE`,

      architecture: `            PRE-UPGRADE GATE
         +----------+----------+
         |          |          |
         v          v          v
      Replica     Backup    Compatibility
      health                  checks
         |          |          |
         +----------+----------+
                    |
                    v
                 APPROVE`,

      examples: [
        `A Secondary with significant lag should be fixed before the upgrade begins.`,
        `A major upgrade should not start before confirming the supported version path.`,
        `An old driver may create application issues even when mongod itself upgrades successfully.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Validates member health.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps evaluate oplog coverage.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Confirms current server version.'
        }
      ],

      productionScenario: `A patch window begins and the DBA discovers one Secondary is already hours behind.

Instead of continuing, the DBA stops the change and resolves replication lag first.

This preserves redundancy and avoids introducing version changes into an already unhealthy topology.`,

      troubleshootingApproach: `1. Check replica health.

2. Check lag.

3. Check oplog window.

4. Check disk.

5. Confirm backup.

6. Confirm source/target versions.

7. Confirm supported upgrade path.

8. Check FCV.

9. Check driver compatibility.

10. Check OS compatibility.

11. Review configuration options.

12. Stage binaries/packages.

13. Validate rollback.

14. Start only when healthy.`,

      commonMistakes: [
        'Upgrading a degraded replica set.',
        'Skipping version-path checks.',
        'Ignoring driver compatibility.',
        'Ignoring FCV.',
        'Starting without rollback criteria.'
      ],

      bestPractices: [
        'Treat pre-checks as a hard gate.',
        'Resolve existing incidents first.',
        'Validate backup and recovery.',
        'Review exact version documentation.',
        'Stage and test packages before the window.'
      ],

      interviewAnswer: `Before a rolling upgrade I verify replica-set health, lag, oplog window, disk capacity, recent recoverable backups, source and target version compatibility, FCV state, driver compatibility, OS support and configuration-option changes.

I also stage the correct package and define rollback and stop criteria. I would not begin a version change on an already degraded replica set.`,

      keyTakeaways: [
        'Healthy topology is a prerequisite.',
        'Version path must be supported.',
        'FCV matters in major upgrades.',
        'Drivers and OS must be compatible.',
        'Rollback must exist before execution.'
      ]
    }
  },

  /* =========================================================
     QUESTION 3
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 3,
    question:
      'How does a rolling MongoDB replica-set upgrade work, and why are Secondaries normally upgraded before the Primary?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {
      groundZero: `A rolling upgrade changes one replica-set member at a time.

The objective is to preserve availability while members temporarily run a supported mixed-version combination.

Secondaries are normally upgraded first so the current Primary can continue serving the application.`,

      coreConcept: `Start:

P old
S old
S old

Upgrade S1
   |
P old
S new
S old

Upgrade S2
   |
P old
S new
S new

Step down P
   |
new-version member becomes Primary

Upgrade old P`,

      detailedExplanation: `A typical rolling sequence is:

1. PRE-CHECK

Confirm replica health and upgrade compatibility.

2. FIRST SECONDARY

Stop one Secondary cleanly.

Replace/install the target binary or package.

Start it.

Verify:

• process starts
• member becomes SECONDARY
• replication catches up
• logs are clean.

3. SECOND SECONDARY

Repeat only after the first member is fully healthy.

4. PRIMARY TRANSITION

Once eligible upgraded Secondaries are healthy, perform a controlled Primary transition when required.

5. OLD PRIMARY

Upgrade the former Primary.

6. FINAL VALIDATION

Confirm all members run the intended binary version.

WHY SECONDARIES FIRST?

Because the existing Primary can continue serving application writes while a Secondary is unavailable for maintenance.

If the Primary were upgraded first unnecessarily, an election would be introduced earlier.

MIXED VERSIONS

Rolling upgrades rely on specific supported mixed-version states.

Do not assume arbitrary MongoDB versions can coexist in one replica set.

Exact allowed upgrade combinations must be verified from the documentation for the source and target releases.

PRIMARY SELECTION

An upgraded Secondary may become Primary during the process when the supported upgrade procedure permits it.

The exact timing and FCV sequence depend on the major-version transition.

VALIDATION

After each member:

• rs.status()
• db.version()
• replication lag
• logs
• application health where relevant.`,

      internalWorking: `One member out
      |
majority remains
      |
member upgraded
      |
member returns
      |
replication catches up
      |
next member`,

      architecture: `Stage A:
 P(vOld)
 S(vOld)
 S(vOld)

Stage B:
 P(vOld)
 S(vNew)
 S(vOld)

Stage C:
 P(vOld)
 S(vNew)
 S(vNew)

Stage D:
 P(vNew)
 S(vNew)
 S(vNew)`,

      examples: [
        `Do not proceed to Secondary 2 until Secondary 1 has rejoined and caught up.`,
        `Mixed-version support is specific to the documented upgrade path.`,
        `Primary maintenance is normally delayed until upgraded Secondaries are ready.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Checks member state throughout rolling maintenance.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Confirms the server version of the node currently connected to.'
        }
      ],

      productionScenario: `A three-member replica set is being upgraded.

The first Secondary is upgraded but remains in RECOVERING.

The DBA stops the rollout rather than upgrading the second Secondary.

Only after the first node becomes a healthy caught-up Secondary does the upgrade continue.`,

      troubleshootingApproach: `1. Verify supported mixed-version path.

2. Upgrade one Secondary.

3. Validate startup.

4. Validate SECONDARY state.

5. Validate catch-up.

6. Upgrade next Secondary.

7. Validate again.

8. Transition Primary.

9. Upgrade old Primary.

10. Perform final cluster/application checks.`,

      commonMistakes: [
        'Upgrading several members simultaneously.',
        'Upgrading the Primary first without reason.',
        'Continuing after one upgraded Secondary is unhealthy.',
        'Assuming arbitrary versions can coexist.',
        'Skipping application validation.'
      ],

      bestPractices: [
        'Upgrade one member at a time.',
        'Follow exact version documentation.',
        'Validate after every node.',
        'Keep a working majority.',
        'Handle the Primary last in normal rolling workflows.'
      ],

      interviewAnswer: `In a rolling replica-set upgrade, I upgrade one Secondary at a time, verify it starts, returns to SECONDARY and fully catches up, then move to the next member. Once upgraded eligible Secondaries are healthy, I perform the controlled Primary transition and upgrade the old Primary.

Secondaries come first because this preserves the serving Primary and minimizes availability impact. I also verify that the temporary mixed-version state is explicitly supported.`,

      keyTakeaways: [
        'Rolling upgrade means one member at a time.',
        'Secondaries normally come first.',
        'Each member must be healthy before continuing.',
        'Mixed-version combinations must be supported.',
        'Primary is normally handled after Secondaries.'
      ]
    }
  },

  /* =========================================================
     QUESTION 4
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 4,
    question:
      'What is MongoDB Feature Compatibility Version, and why is FCV different from the mongod binary version?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {
      groundZero: `MongoDB binary version tells you which mongod software is running.

Feature Compatibility Version, or FCV, controls compatibility behavior related to features and persistent-format semantics for a release transition.

They are not the same thing.`,

      coreConcept: `Binary version:
Which MongoDB executable is running?

FCV:
Which release-level feature compatibility
state is enabled?

Example conceptually:

Binary = new version
FCV = previous compatibility level

during an upgrade transition.`,

      detailedExplanation: `Suppose a replica set has been upgraded to a newer MongoDB major version.

The binaries may already be new while FCV remains at the previous supported compatibility state during the controlled upgrade procedure.

WHY THIS EXISTS

FCV provides a transition boundary between:

installing/running new binaries

and:

enabling newer release-specific feature compatibility.

This is important because once newer persistent features or metadata changes are fully enabled, downgrade options can become more constrained.

UPGRADE CONCEPT

Conceptually:

1. Upgrade binaries according to supported rolling procedure.

2. Validate cluster/application behavior.

3. Change FCV according to the official upgrade procedure.

The exact sequence, commands, available FCV values and downgrade implications depend on the MongoDB version.

Therefore do not memorize one FCV workflow and apply it to every release.

DBA VIEW

Always distinguish:

mongod binary version

from:

FCV.

You can inspect both separately.

FCV should not be changed casually just because all binaries now report the new version.

It is a deliberate release-transition step.`,

      internalWorking: `Old state:

binary old
FCV old

Upgrade binaries:

binary new
FCV old

After validation:

binary new
FCV new`,

      architecture: `             MONGOD BINARY
                  |
             software code
                  |
                  v
               MongoDB
                  |
                  v
                  FCV
                  |
         feature compatibility
            transition state`,

      examples: [
        `All mongod processes can run the target binary while FCV has not yet been moved to the target release state.`,
        `Changing FCV can affect downgrade flexibility.`,
        `FCV is not an operating-system package version.`
      ],

      commands: [
        {
          command:
            'db.version()',
          explanation:
            'Shows the server binary version for the current connection.'
        },
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Retrieves FCV state in supported MongoDB versions; exact output varies by release.'
        }
      ],

      productionScenario: `After upgrading every replica member, an engineer says:

"We are fully on the new release because db.version() shows the new version."

The DBA checks FCV separately and confirms that feature compatibility has not yet been transitioned.

Application validation is completed before the FCV step is performed according to the documented upgrade procedure.`,

      troubleshootingApproach: `1. Check member binary versions.

2. Check FCV.

3. Verify upgrade stage.

4. Review official source-target upgrade procedure.

5. Validate application.

6. Change FCV only at the documented stage.

7. Confirm FCV afterward.

8. Document downgrade implications.`,

      commonMistakes: [
        'Assuming binary version and FCV are identical.',
        'Changing FCV prematurely.',
        'Forgetting FCV after binary upgrade.',
        'Assuming FCV behavior is identical across every release.',
        'Ignoring downgrade implications.'
      ],

      bestPractices: [
        'Track binary and FCV separately.',
        'Follow release-specific upgrade order.',
        'Validate before FCV transition.',
        'Document FCV in change evidence.',
        'Understand downgrade consequences first.'
      ],

      interviewAnswer: `The binary version identifies the MongoDB software executable running on a node, while FCV represents the release-level feature compatibility state.

During a major upgrade, it can be valid for the nodes to run newer binaries while FCV remains at the previous supported level until the cluster is validated. I change FCV only at the documented stage because it can affect feature behavior and downgrade options.`,

      keyTakeaways: [
        'Binary version and FCV are different.',
        'FCV is a deliberate upgrade stage.',
        'New binaries may temporarily run with older compatibility state.',
        'FCV affects downgrade planning.',
        'Exact procedures are release-specific.'
      ]
    }
  },

  /* =========================================================
     QUESTION 5
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 5,
    question:
      'Why must a MongoDB DBA review release notes, compatibility changes, deprecated features, and driver support before upgrading?',
    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {
      groundZero: `An upgrade can succeed at the process level while still breaking the application.

mongod starting successfully does not prove:

• queries behave the same
• configuration is valid
• drivers are supported
• removed features are not used.`,

      coreConcept: `Upgrade compatibility:

Server
 +
Driver
 +
Application
 +
Configuration
 +
OS
 +
Tools
 =
successful change`,

      detailedExplanation: `A production upgrade should review multiple compatibility layers.

1. SERVER RELEASE NOTES

Look for:

• behavior changes
• bug fixes
• known issues
• removed/deprecated functionality.

2. CONFIGURATION OPTIONS

A configuration option may:

• be renamed
• become unnecessary
• be removed
• change default behavior.

3. DRIVER COMPATIBILITY

Application drivers have supported server-version ranges.

Check the actual driver version used by applications.

4. DATABASE TOOLS

mongodump, mongorestore, mongoimport and related Database Tools are versioned independently from the MongoDB server.

Do not assume the server package automatically upgrades them.

5. MONGOSH

mongosh is also independently versioned.

6. OPERATING SYSTEM

Newer MongoDB releases may have different supported OS distributions or library requirements.

7. APPLICATION QUERIES

Behavior or planner changes can expose application assumptions.

8. AUTHENTICATION/TLS

Security defaults, TLS behavior or supported mechanisms can evolve.

9. INDEX/FEATURE USAGE

Applications may depend on features whose behavior changes between versions.

10. DOWNGRADE

Review downgrade restrictions before starting the upgrade, not after something goes wrong.

A change plan should record the exact versions of:

• mongod
• drivers
• Database Tools
• mongosh

where they matter.`,

      internalWorking: `Target MongoDB
     |
     +--> OS supported?
     +--> Driver supported?
     +--> Config valid?
     +--> Tools compatible?
     +--> Features supported?
     +--> Downgrade possible?
     |
     v
upgrade approval`,

      architecture: `             APPLICATION
                  |
               DRIVER
                  |
                  v
               MONGODB
             /    |    \
          config tools   OS
             \    |    /
              compatibility`,

      examples: [
        `An old application driver can remain unsupported even when mongod itself starts normally.`,
        `Database Tools have their own release versions.`,
        `A removed configuration option can cause startup failure after binary replacement.`
      ],

      commands: [
        {
          command:
            'mongod --version',
          explanation:
            'Shows server binary version.'
        },
        {
          command:
            'mongosh --version',
          explanation:
            'Shows mongosh version.'
        },
        {
          command:
            'mongorestore --version',
          explanation:
            'Shows Database Tools version for mongorestore.'
        }
      ],

      productionScenario: `MongoDB is upgraded successfully, but the backup job fails afterward.

The server itself is healthy.

The DBA discovers that the environment uses a separately installed Database Tools package whose compatibility and bug fixes were not reviewed as part of the change.

The upgrade runbook is updated to inventory tools independently.`,

      troubleshootingApproach: `1. Inventory MongoDB server version.

2. Inventory drivers.

3. Inventory mongosh.

4. Inventory Database Tools.

5. Review release notes.

6. Review removed/deprecated options.

7. Review OS support.

8. Review security changes.

9. Review feature compatibility.

10. Test representative application workloads.`,

      commonMistakes: [
        'Checking only mongod.',
        'Assuming Database Tools match server version.',
        'Ignoring drivers.',
        'Ignoring removed configuration options.',
        'Reviewing downgrade only after failure.'
      ],

      bestPractices: [
        'Maintain a complete software inventory.',
        'Read source and target release notes.',
        'Test representative application behavior.',
        'Track driver versions.',
        'Review downgrade restrictions before execution.'
      ],

      interviewAnswer: `A MongoDB upgrade is an ecosystem change, not just a mongod binary replacement. I review server release notes, deprecated and removed configuration, OS support, application drivers, mongosh and Database Tools independently.

I also test representative workloads because a server that starts successfully can still expose application or tooling incompatibilities.`,

      keyTakeaways: [
        'mongod startup does not prove application compatibility.',
        'Drivers matter.',
        'Database Tools are independently versioned.',
        'Configuration compatibility must be checked.',
        'Downgrade planning starts before the upgrade.'
      ]
    }
  },

  /* =========================================================
     QUESTION 6
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 6,
    question:
      'How should an L2/L3 DBA design rollback for a MongoDB patch or upgrade, and why is rollback not always as simple as reinstalling the old binary?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {
      groundZero: `Rollback means returning to a known working state.

For MongoDB, rollback planning must consider more than the binary package.

It may involve:

• FCV
• storage/data format behavior
• configuration
• application changes
• package repositories
• security files
• backups.`,

      coreConcept: `Upgrade
  |
  +--> binary changes
  +--> FCV changes
  +--> configuration changes
  +--> application changes
  +--> data/feature usage

Rollback must reverse
all relevant dependencies safely.`,

      detailedExplanation: `PATCH ROLLBACK

For a maintenance patch within the same release family, rollback may sometimes be simpler, but it still requires release-specific support verification.

MAJOR-VERSION ROLLBACK

Major upgrades are more complex.

After certain upgrade stages, especially after changing FCV or using new features, simply replacing the binary with an older version may not be supported.

ROLLBACK PLAN SHOULD DEFINE:

1. DECISION POINT

At what stage can the change still be rolled back safely?

2. STOP CRITERIA

Examples:

• upgraded Secondary fails to start
• application error rate increases
• replication fails
• unsupported configuration discovered.

3. PACKAGE AVAILABILITY

Keep approved previous binaries/packages available.

4. CONFIGURATION

Preserve the last known working mongod.conf.

5. FCV STATE

Know whether FCV has changed.

6. FEATURE USAGE

Determine whether features specific to the target version have been enabled or used.

7. DATA RECOVERY

If in-place downgrade is not supported, recovery may require restoring from backup or another planned recovery method.

8. APPLICATION

If application drivers/configuration were changed, those changes may also need rollback.

9. TLS/AUTH

Security material must remain compatible.

10. TESTING

Rollback should be tested in lower environments where possible.

A good upgrade plan may deliberately delay irreversible or downgrade-constraining steps until application validation succeeds.`,

      internalWorking: `Upgrade stages:

A: binary not changed
B: some binaries new
C: all binaries new
D: FCV/new features enabled

Rollback flexibility
usually becomes more constrained
as the transition advances.`,

      architecture: `             CHANGE
               |
       +-------+-------+
       |               |
       v               v
   Upgrade path    Rollback path
       |               |
       +-------+-------+
               |
         decision gates`,

      examples: [
        `Keeping the old RPM does not guarantee downgrade is supported after a major-version compatibility transition.`,
        `A configuration file changed for the new version may not work with the old version.`,
        `Application driver changes may need their own rollback.`
      ],

      commands: [
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Checks FCV state when evaluating rollback stage.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms binary version.'
        }
      ],

      productionScenario: `All members have new binaries, but FCV has not yet been transitioned.

An application compatibility issue appears.

Because the team deliberately validated before the FCV step and had preserved the previous packages/configuration, the rollback options are clearer than they would have been after enabling new release-specific behavior.`,

      troubleshootingApproach: `1. Determine current upgrade stage.

2. Check binary versions.

3. Check FCV.

4. Check whether new features were used.

5. Review supported downgrade documentation.

6. Identify config changes.

7. Identify application changes.

8. Select supported rollback path.

9. Validate member by member.

10. Confirm application recovery.`,

      commonMistakes: [
        'Assuming reinstalling old binaries always works.',
        'Changing FCV without understanding rollback.',
        'Not preserving old configuration.',
        'Ignoring application rollback.',
        'Waiting until the incident to design rollback.'
      ],

      bestPractices: [
        'Define rollback before the change.',
        'Use decision gates.',
        'Preserve previous packages/config.',
        'Understand FCV implications.',
        'Test rollback procedures.'
      ],

      interviewAnswer: `MongoDB rollback is stage-dependent. For a major upgrade, reverting the binary may not be sufficient or supported after FCV changes or new release-specific features are used.

I define rollback decision points before the change, preserve the previous packages and configuration, track FCV and application changes, and follow the exact supported downgrade path for that source/target release.`,

      keyTakeaways: [
        'Rollback is more than binary replacement.',
        'FCV affects rollback options.',
        'Rollback flexibility changes during upgrade stages.',
        'Application changes also need reversal planning.',
        'Design rollback before execution.'
      ]
    }
  },

  /* =========================================================
     QUESTION 7
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 7,
    question:
      'How should a MongoDB DBA patch the operating system of replica-set servers while minimizing database downtime?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {
      groundZero: `OS patching of MongoDB servers should generally follow the same high-availability principle as MongoDB binary maintenance:

one replica member at a time.

The database should remain available through the remaining healthy members.`,

      coreConcept: `Secondary 1
    |
clean stop
    |
OS patch/reboot
    |
MongoDB start
    |
catch up
    |
Secondary 2
    |
repeat
    |
Primary transition
    |
patch old Primary`,

      detailedExplanation: `PRE-CHECK

Verify:

• replica-set health
• replication lag
• oplog window
• disk capacity
• backup status
• maintenance duration.

FIRST SECONDARY

1. Confirm the member can be removed temporarily without losing majority.

2. Stop mongod cleanly.

3. Apply OS patch.

4. Reboot if required.

5. Verify:

• filesystem mounted
• network available
• system time healthy
• mongod starts
• member rejoins
• replication catches up.

SECOND SECONDARY

Repeat only after the first is healthy.

PRIMARY

Once Secondaries are healthy:

• perform controlled Primary transition
• patch the former Primary
• restart
• verify catch-up.

IMPORTANT POST-REBOOT CHECKS

OS patching can change or expose problems with:

• mounts
• firewall rules
• SELinux/security policy
• service enablement
• ulimits
• time sync
• kernel settings
• transparent huge pages behavior
• network interfaces.

Do not assume:

server ping works

means:

MongoDB environment is correct.

OPLOG WINDOW

The member must normally return before the required oplog history rolls off, otherwise resynchronization may be needed.

APPLICATION

A proper replica-set-aware driver should handle Primary transition according to its retry/topology behavior, but application validation remains necessary.`,

      internalWorking: `S1 offline
  |
P + S2 remain
  |
S1 rebooted
  |
S1 catches up
  |
repeat safely`,

      architecture: `          P
        /   \
      S1     S2

Take S1 down
     |
 P ------ S2
 majority remains

S1 returns
     |
 P -- S1 -- S2`,

      examples: [
        `A server can reboot successfully while the MongoDB data mount remains missing.`,
        `crond/systemd/service enablement should be checked if maintenance depends on them.`,
        `A Secondary that stays down beyond the oplog window may require initial sync.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set state before and after OS maintenance.'
        },
        {
          command:
            'systemctl status mongod',
          explanation:
            'Checks service state on systemd-managed hosts where permissions allow.'
        },
        {
          command:
            'df -h',
          explanation:
            'Confirms expected filesystems are mounted and capacity is visible after reboot.'
        }
      ],

      productionScenario: `A Secondary is rebooted after OS patching.

The VM comes back and responds to SSH, but mongod fails.

The DBA checks the server and finds the MongoDB data volume was not mounted.

The filesystem is corrected before starting MongoDB, preventing an accidental startup against the wrong storage path.`,

      troubleshootingApproach: `1. Check cluster health.

2. Patch one Secondary.

3. Reboot.

4. Verify mounts.

5. Verify network/time.

6. Start/check mongod.

7. Validate SECONDARY.

8. Validate catch-up.

9. Repeat.

10. Transition Primary.

11. Patch old Primary.

12. Final application validation.`,

      commonMistakes: [
        'Rebooting multiple members together.',
        'Starting mongod before checking mounts.',
        'Ignoring oplog window.',
        'Patching the Primary first unnecessarily.',
        'Assuming OS health equals MongoDB health.'
      ],

      bestPractices: [
        'Use rolling OS maintenance.',
        'Check mounts after reboot.',
        'Validate each member fully.',
        'Preserve majority.',
        'Include application smoke tests.'
      ],

      interviewAnswer: `For OS patching I handle one replica member at a time. I patch Secondaries first, verify the host, mounts and mongod service after reboot, and wait for full replication catch-up before continuing.

Once the Secondaries are healthy, I perform a controlled Primary transition and patch the old Primary. I also compare maintenance duration against the oplog window so a node does not become stale.`,

      keyTakeaways: [
        'OS patching should be rolling.',
        'Mount validation after reboot is critical.',
        'Oplog coverage matters.',
        'Primary comes after healthy Secondaries.',
        'Application validation completes the change.'
      ]
    }
  },

  /* =========================================================
     QUESTION 8
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 8,
    question:
      'What are the main differences between in-place MongoDB upgrade and side-by-side migration to a new environment?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {
      groundZero: `IN-PLACE UPGRADE

Changes the existing MongoDB environment.

SIDE-BY-SIDE MIGRATION

Builds a new environment and moves data/workload to it.

Both approaches have different risk and rollback characteristics.`,

      coreConcept: `In-place:

Existing cluster
    |
upgrade binaries
    |
same environment


Side-by-side:

Old cluster
     |
data sync/copy
     |
New cluster
     |
cutover`,

      detailedExplanation: `IN-PLACE ADVANTAGES

• less infrastructure duplication
• simpler endpoint continuity
• can use rolling replica-set upgrade procedures.

IN-PLACE RISKS

• production environment itself is being changed
• rollback may become constrained as upgrade progresses
• application and database transition happen against live infrastructure.

SIDE-BY-SIDE ADVANTAGES

• source environment remains available during build/testing
• target can be validated independently
• fallback may be clearer before cutover.

SIDE-BY-SIDE RISKS

• requires extra infrastructure
• requires data synchronization strategy
• cutover planning can be complex
• write synchronization/fallback requires careful design.

DATA TRANSFER OPTIONS

Depending on topology/product/version, migration might use:

• backup/restore
• initial sync/replacement-member strategies
• managed migration tooling
• application-level dual-write/change capture solutions where appropriate.

Do not assume one generic migration method fits all environments.

CUTOVER

A side-by-side migration must define:

• final synchronization
• application stop/write freeze if required
• connection-string change
• smoke testing
• fallback window.

RPO/RTO

In-place and side-by-side approaches should be compared against business recovery requirements.

MIGRATION SHOULD NOT BLINDLY MIX VERSION CHANGES

Sometimes it is safer to migrate infrastructure first at the same MongoDB version, validate, then perform the major version upgrade separately.`,

      internalWorking: `IN PLACE:
production -> changed production


SIDE BY SIDE:
source production
      |
   sync/copy
      |
      v
target
      |
   validate
      |
      v
cutover`,

      architecture: `IN PLACE

[Current cluster]
      |
   upgrade
      |
[Same cluster]


SIDE BY SIDE

[Source] ---> [Target]
                |
             validate
                |
             application
              cutover`,

      examples: [
        `A side-by-side migration can allow the target OS/storage layout to be tested before application cutover.`,
        `In-place rolling upgrades can avoid maintaining two full clusters.`,
        `A side-by-side target may still require a well-defined final synchronization strategy.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Useful for validating either source or target replica-set health.'
        }
      ],

      productionScenario: `A company must move from old VMs to new OS-supported infrastructure and also upgrade MongoDB major version.

Instead of changing OS, hardware and database major version simultaneously, the DBA proposes migrating to new servers at the current MongoDB version first, validating the environment, then upgrading MongoDB separately.

This makes failures easier to isolate.`,

      troubleshootingApproach: `1. Define source/target.

2. Define version changes.

3. Compare downtime tolerance.

4. Compare infrastructure capacity.

5. Define synchronization method.

6. Define cutover.

7. Define fallback.

8. Test target.

9. Validate application.

10. Choose least-risk design.`,

      commonMistakes: [
        'Assuming side-by-side has zero complexity.',
        'Combining too many changes at once.',
        'Ignoring final synchronization.',
        'Ignoring fallback after writes begin on target.',
        'Choosing architecture without RPO/RTO input.'
      ],

      bestPractices: [
        'Separate major variables where practical.',
        'Validate target before cutover.',
        'Define final synchronization explicitly.',
        'Define fallback window.',
        'Choose based on business risk, not convenience alone.'
      ],

      interviewAnswer: `An in-place upgrade changes the existing production cluster, while a side-by-side migration builds a separate target and later cuts the application over.

In-place can be operationally simpler, but rollback may become constrained as the upgrade progresses. Side-by-side provides stronger pre-cutover validation but requires synchronization, extra capacity and a carefully designed cutover/fallback strategy.`,

      keyTakeaways: [
        'In-place changes the live environment.',
        'Side-by-side creates a new target.',
        'Side-by-side requires synchronization planning.',
        'Rollback characteristics differ.',
        'RPO/RTO should drive the choice.'
      ]
    }
  },

  /* =========================================================
     QUESTION 9
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 9,
    question:
      'How should a DBA validate MongoDB after a patch, major upgrade, or migration before declaring the change successful?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {
      groundZero: `A successful service start is only one validation step.

A MongoDB change is complete only after validating:

• process
• topology
• data
• application
• performance
• backup
• monitoring.`,

      coreConcept: `Validation layers:

mongod starts
    |
replica healthy
    |
data accessible
    |
application works
    |
performance normal
    |
backup/monitoring healthy
    |
change complete`,

      detailedExplanation: `POST-CHANGE VALIDATION SHOULD INCLUDE:

1. PROCESS

Confirm expected mongod processes are running.

2. VERSION

Confirm the intended binary version on every member.

3. REPLICA SET

Check:

• Primary
• Secondaries
• member health
• lag
• elections.

4. FCV

For major upgrade, verify FCV matches the intended stage.

5. LOGS

Review startup and post-change errors/warnings.

6. DATA

Perform appropriate checks such as:

• important collection access
• representative counts where meaningful
• critical records
• schema/business checks.

Do not rely only on total document count for correctness.

7. INDEXES

Confirm required indexes exist.

8. APPLICATION

Perform:

• read smoke test
• write smoke test
• critical transaction path
• application health.

9. PERFORMANCE

Compare:

• latency
• CPU
• disk
• cache behavior
• connection patterns

against baseline.

10. BACKUP

Verify backup jobs continue working with the new environment/version.

11. MONITORING

Confirm monitoring agents/alerts are still collecting expected data.

12. SECURITY

Confirm:

• authentication
• TLS
• application credentials
• member authentication.

13. MIGRATION-SPECIFIC

Validate application points to the intended target.

14. OBSERVATION PERIOD

Some issues appear only under normal business workload, so maintain heightened monitoring after the change.`,

      internalWorking: `Technical success
   |
   v
Topology success
   |
   v
Application success
   |
   v
Operational success
   |
   v
CHANGE CLOSED`,

      architecture: `               VALIDATION
        +-----------+-----------+
        |           |           |
        v           v           v
     MongoDB      App        Operations
      health      tests      backup/alerts
        |           |           |
        +-----------+-----------+
                    |
                    v
                 SUCCESS`,

      examples: [
        `A replica set may be healthy while the application still fails because its driver is incompatible.`,
        `Backups can fail after a migration because credentials or paths changed.`,
        `Monitoring may silently stop after host replacement if the new server was not onboarded.`
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Checks server version.'
        },
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Checks FCV stage for major-version transitions.'
        }
      ],

      productionScenario: `MongoDB patching completes and all three members are healthy.

The change team wants to close the ticket.

The DBA discovers the nightly backup job now fails because its tool path changed during package maintenance.

The change remains open until backup functionality is restored and validated.`,

      troubleshootingApproach: `1. Verify process.

2. Verify version.

3. Verify replica health.

4. Verify lag.

5. Verify FCV.

6. Review logs.

7. Validate data.

8. Validate indexes.

9. Run application smoke tests.

10. Compare performance baseline.

11. Validate backup.

12. Validate monitoring.

13. Validate security.

14. Observe before closure.`,

      commonMistakes: [
        'Closing the change because mongod started.',
        'Checking only the Primary.',
        'Skipping application writes.',
        'Ignoring backup jobs.',
        'Ignoring post-change performance.'
      ],

      bestPractices: [
        'Use a fixed validation checklist.',
        'Validate every member.',
        'Include business transactions.',
        'Compare against baseline.',
        'Keep heightened monitoring after change.'
      ],

      interviewAnswer: `After a MongoDB patch, upgrade or migration, I validate the binary version, replica-set state, lag, FCV stage, logs, representative data and indexes, application reads/writes, performance, backups, monitoring and security.

I do not declare success merely because mongod starts. The database, application and operational ecosystem all need to be healthy.`,

      keyTakeaways: [
        'Startup is only the first check.',
        'Application validation is mandatory.',
        'Backup and monitoring must continue working.',
        'Performance should be compared with baseline.',
        'All members must be checked.'
      ]
    }
  },

  /* =========================================================
     QUESTION 10
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 10,
    question:
      'How should a MongoDB DBA plan a major-version upgrade from MongoDB 7.x to MongoDB 8.x at a high level?',
    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {
      groundZero: `A 7.x to 8.x upgrade should be treated as a major-version change.

The DBA should not begin with:

install MongoDB 8 on every node.

The process starts with compatibility and health validation.`,

      coreConcept: `7.x environment
      |
      v
Health + backup
      |
      v
8.x compatibility review
      |
      v
Driver/OS/config checks
      |
      v
Rolling binary upgrade
      |
      v
Application validation
      |
      v
FCV transition
      |
      v
Final validation`,

      detailedExplanation: `HIGH-LEVEL PHASE 1 — INVENTORY

Record:

• exact MongoDB 7.x patch level
• FCV
• topology
• drivers
• Database Tools
• mongosh
• OS
• configuration
• security.

PHASE 2 — REVIEW OFFICIAL 8.x UPGRADE REQUIREMENTS

Verify:

• supported source version
• required source patch level if any
• unsupported/deprecated features
• configuration changes
• platform support
• downgrade requirements.

Exact requirements can change across releases, so this must be based on the documentation for the actual target 8.x release.

PHASE 3 — APPLICATION COMPATIBILITY

Validate application drivers and representative workloads.

PHASE 4 — BACKUP/RECOVERY

Confirm recent backup and recovery readiness.

PHASE 5 — PRE-UPGRADE HEALTH

Require:

• healthy Primary
• healthy Secondaries
• low/acceptable lag
• sufficient oplog window
• disk headroom.

PHASE 6 — ROLLING BINARY UPGRADE

Upgrade supported Secondaries one at a time.

After each:

• startup
• SECONDARY
• catch-up
• logs.

Then perform controlled Primary transition and upgrade the old Primary.

PHASE 7 — VALIDATE WITH NEW BINARIES

Before final compatibility transition, validate:

• application
• queries
• replication
• backup
• monitoring.

PHASE 8 — FCV

Change Feature Compatibility Version only according to the documented 7.x → 8.x upgrade procedure and after the required validation.

PHASE 9 — POST-UPGRADE

Validate:

• version on all nodes
• FCV
• application
• performance
• backups
• monitoring.

PHASE 10 — OBSERVATION

Maintain heightened monitoring before closing the change.

IMPORTANT

Do not assume that every 7.x patch can upgrade directly to every 8.x patch.

The exact minimum source level, upgrade sequence, downgrade behavior and FCV procedure must be checked against the official documentation for the chosen target release.`,

      internalWorking: `MongoDB 7.x
    |
compatibility gate
    |
rolling binaries
    |
MongoDB 8.x binaries
FCV transition stage
    |
validate
    |
MongoDB 8.x completed`,

      architecture: `START

P 7.x
S 7.x
S 7.x

ROLLING

P 7.x
S 8.x
S 8.x

TRANSITION

P 8.x
S 8.x
S 8.x

Then documented FCV stage
and final validation.`,

      examples: [
        `A healthy three-node 7.x replica set can typically be approached with rolling major-version procedures when the exact documented prerequisites are satisfied.`,
        `Driver compatibility should be verified before the server upgrade.`,
        `FCV should be treated as a separate controlled step from binary replacement.`
      ],

      commands: [
        {
          command:
            'db.version()',
          explanation:
            'Confirms server version.'
        },
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Checks FCV state.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica health throughout the process.'
        }
      ],

      productionScenario: `A company wants to upgrade a production three-node replica set from MongoDB 7.x to 8.x.

The DBA first verifies the exact source patch level, target release requirements, application drivers, OS support and backup readiness.

Secondaries are upgraded sequentially and validated.

After a controlled Primary transition, the old Primary is upgraded.

Application and operational validation is performed before completing the documented FCV transition.`,

      troubleshootingApproach: `1. Inventory exact versions.

2. Check current FCV.

3. Review target 8.x requirements.

4. Check source patch prerequisite.

5. Check OS.

6. Check drivers/tools.

7. Check configuration changes.

8. Validate backup.

9. Validate replica health.

10. Roll binaries one member at a time.

11. Validate application.

12. Perform documented FCV transition.

13. Run final validation.

14. Monitor after change.`,

      commonMistakes: [
        'Treating 7.x to 8.x as simple patching.',
        'Skipping source-version prerequisites.',
        'Changing FCV before validation.',
        'Ignoring drivers and OS support.',
        'Upgrading multiple members at once.'
      ],

      bestPractices: [
        'Use release-specific documentation.',
        'Inventory exact versions.',
        'Upgrade one member at a time.',
        'Validate before FCV transition.',
        'Keep rollback boundaries clear.'
      ],

      interviewAnswer: `For a MongoDB 7.x to 8.x upgrade, I first inventory the exact source patch, FCV, topology, drivers, tools, OS and configuration. I verify the official prerequisites for the chosen MongoDB 8.x target release, validate backups and cluster health, and then perform a supported rolling binary upgrade with Secondaries first.

After all binaries are upgraded, I validate the application and operational ecosystem before performing the documented FCV transition. I do not assume every 7.x patch can upgrade directly to every 8.x release without checking the exact upgrade documentation.`,

      keyTakeaways: [
        '7.x to 8.x is a major upgrade.',
        'Exact source and target versions matter.',
        'Secondaries are upgraded first.',
        'Binary upgrade and FCV transition are separate stages.',
        'Application validation comes before finalizing the upgrade.'
      ]
    }
  },
  /* =========================================================
     QUESTION 11
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 11,
    question:
      'What should a DBA do when an upgraded MongoDB Secondary fails to start after a binary or package upgrade?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {
      groundZero: `If the first upgraded Secondary fails to start, stop the rollout.

Do not continue upgrading the remaining members.

The failed Secondary is your warning that something in the new binary, configuration, operating system, permissions, storage, or upgrade path is incorrect.`,

      coreConcept: `Secondary upgraded
       |
       v
mongod fails
       |
       v
STOP ROLLOUT
       |
       +--> logs
       +--> config
       +--> binary
       +--> permissions
       +--> storage
       +--> compatibility
       |
       v
repair or supported rollback`,

      detailedExplanation: `The first objective is preserving the healthy majority.

If:

Primary = healthy
Secondary 1 = upgrade failed
Secondary 2 = healthy

do not touch Primary or Secondary 2 until Secondary 1 is understood.

INVESTIGATION AREAS

1. MONGOD LOG

The MongoDB log normally provides the strongest starting evidence.

Look for:

• unsupported configuration parameters
• permission failures
• storage errors
• TLS/keyfile errors
• incompatible data state
• startup assertions
• port conflicts.

2. SERVICE MANAGER

Check whether systemd attempted to start mongod and why it failed.

3. BINARY

Confirm the actual executable being launched.

A package installation may succeed while the service still references an unexpected binary or configuration.

4. CONFIGURATION

Validate:

• config file path
• YAML syntax
• removed/deprecated parameters
• dbPath
• logPath
• keyfile
• TLS files.

5. FILESYSTEM

Check:

• dbPath exists
• expected volume is mounted
• ownership
• permissions
• free disk.

6. VERSION PATH

Confirm the source-to-target upgrade is actually supported.

7. SECURITY

Check:

• keyfile permissions
• certificate access
• certificate validity
• configured paths.

8. ROLLBACK

If the problem cannot be safely resolved within the maintenance window, use the documented rollback procedure appropriate to the current upgrade stage.

Do not randomly manipulate WiredTiger files, journal files, lock files, or internal metadata to force startup.`,

      internalWorking: `Healthy cluster

P old
S1 old
S2 old

        |
upgrade S1
        v

P old
S1 FAIL
S2 old

        |
        v

FREEZE CHANGE

Investigate S1 only.`,

      architecture: `          PRIMARY
             |
      +------+------+
      |             |
 healthy S2     failed S1
                    |
               startup logs
                    |
          config/storage/version
                    |
               resolution`,

      examples: [
        'A removed configuration option can prevent the new mongod binary from starting.',
        'A data filesystem that did not mount after reboot can make the configured dbPath unavailable.',
        'The wrong binary path can make the DBA believe one version is running while systemd launches another.'
      ],

      commands: [
        {
          command:
            'systemctl status mongod',
          explanation:
            'Shows service status on systemd hosts where the DBA has appropriate permissions.'
        },
        {
          command:
            'journalctl -u mongod',
          explanation:
            'Can provide service startup evidence when systemd journal access is available.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms the executable version being invoked.'
        },
        {
          command:
            'df -h',
          explanation:
            'Helps confirm filesystem capacity and expected mounted storage.'
        }
      ],

      productionScenario: `A Secondary is upgraded during a rolling change.

The package installation succeeds, but mongod fails immediately.

The DBA stops the rollout and reviews the MongoDB log.

The target release no longer accepts a configuration option present in mongod.conf.

The configuration is corrected according to the target release documentation, the Secondary starts, reaches SECONDARY and catches up.

Only then does the rollout continue.`,

      troubleshootingApproach: `1. Stop the rollout.

2. Confirm remaining members are healthy.

3. Capture the exact startup error.

4. Check MongoDB logs.

5. Check service-manager logs.

6. Confirm binary version/path.

7. Validate configuration.

8. Validate dbPath and mounts.

9. Check permissions.

10. Check disk.

11. Check security files.

12. Reconfirm upgrade compatibility.

13. Correct the root cause or use supported rollback.

14. Require the member to become healthy and caught up before continuing.`,

      commonMistakes: [
        'Continuing to upgrade the second Secondary.',
        'Repeatedly restarting mongod without reading the error.',
        'Deleting WiredTiger or journal files.',
        'Assuming package installation success means mongod compatibility.',
        'Ignoring filesystem mounts after reboot.'
      ],

      bestPractices: [
        'Treat the first failed member as a rollout stop condition.',
        'Preserve the healthy majority.',
        'Use logs as primary evidence.',
        'Verify actual binary and configuration.',
        'Resume only after full replication recovery.'
      ],

      interviewAnswer: `If an upgraded Secondary fails to start, I stop the rolling upgrade immediately and preserve the remaining healthy majority. I investigate the mongod and service logs, actual binary version, configuration compatibility, dbPath and mounts, permissions, disk, security files and the supported upgrade path.

I would not upgrade another member until the failed node has returned as a healthy caught-up Secondary or I have executed the documented rollback procedure.`,

      keyTakeaways: [
        'One failed upgraded Secondary stops the rollout.',
        'Preserve majority first.',
        'Logs provide the starting evidence.',
        'Never manipulate storage-engine files randomly.',
        'Recover completely before continuing.'
      ]
    }
  },

  /* =========================================================
     QUESTION 12
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 12,
    question:
      'How should a DBA troubleshoot a MongoDB replica set that becomes unhealthy while temporarily running mixed binary versions during a supported rolling upgrade?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {
      groundZero: `A mixed-version state during a rolling major upgrade is temporary and must be explicitly supported.

If replication or elections become unhealthy during that state, first determine whether the problem is:

• version compatibility
• replication
• configuration
• network
• storage
• election behavior
• an unrelated pre-existing issue.`,

      coreConcept: `Mixed-version issue
       |
       +--> supported combination?
       +--> member state?
       +--> replication?
       +--> election?
       +--> network?
       +--> logs?
       |
       v
root cause before next node`,

      detailedExplanation: `Start with topology state.

Identify:

• current Primary
• each Secondary state
• binary version of each member
• replication lag
• recent elections
• member reachability.

SUPPORTED MIXED VERSION

Never assume that because two versions start, their coexistence is supported.

The source and target release documentation defines the supported rolling-upgrade state.

REPLICATION

Check whether upgraded members are:

• receiving oplog entries
• applying them
• falling behind
• repeatedly reconnecting.

ELECTIONS

Look for:

• unexpected Primary transitions
• heartbeat failures
• election messages
• members losing connectivity.

CONFIGURATION

Ensure replica-set configuration was not unnecessarily modified during the binary upgrade.

NETWORK

Check member-to-member connectivity.

STORAGE

An upgraded member may appear unhealthy because its disk is saturated while catching up.

LOG CORRELATION

Compare timestamps across members rather than analyzing only one node.

APPLICATION

If the replica set remains available but application errors increase, also verify driver/server compatibility and connection behavior.

Do not respond to mixed-version trouble by forcing elections, changing priorities, reconfiguring the replica set, or disabling safety mechanisms without identifying the root cause.`,

      internalWorking: `P old/new
   |
heartbeats
   |
S new
   |
oplog replication
   |
S old/new

Mixed version is temporary,
not a permanent topology design.`,

      architecture: `       MEMBER A
       version X
          |
      heartbeat/oplog
       /         \
      v           v
 MEMBER B      MEMBER C
 version Y     version X/Y

All combinations must match
the documented upgrade path.`,

      examples: [
        'An upgraded Secondary may lag because of disk saturation rather than because the binary versions differ.',
        'Repeated elections can result from network instability that happens to coincide with the maintenance window.',
        'An unsupported source-target combination should not be normalized as a valid mixed-version deployment.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Provides member state, health and election-related information.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Provides a quick view of Secondary replication delay in mongosh environments where the helper is available.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Confirms the server version of the member being queried.'
        }
      ],

      productionScenario: `During a rolling major upgrade, an upgraded Secondary begins falling behind.

The DBA initially suspects mixed-version incompatibility.

Disk metrics show the node is experiencing very high storage latency after reboot.

The version combination is confirmed as supported.

The storage issue is corrected, replication catches up, and the upgrade proceeds.

This avoids an unnecessary replica-set reconfiguration.`,

      troubleshootingApproach: `1. Freeze the rollout.

2. Map every member and binary version.

3. Confirm the combination is supported.

4. Check replica-set state.

5. Check lag.

6. Review election history.

7. Review member logs.

8. Test network connectivity.

9. Check disk and CPU pressure.

10. Check application errors.

11. Identify root cause.

12. Restore a stable healthy state.

13. Continue only after validation.`,

      commonMistakes: [
        'Assuming every mixed-version problem is caused by MongoDB compatibility.',
        'Assuming every version combination is supported.',
        'Changing replica-set priorities as a first response.',
        'Forcing reconfiguration unnecessarily.',
        'Ignoring infrastructure metrics.'
      ],

      bestPractices: [
        'Keep mixed-version duration short.',
        'Follow the exact supported path.',
        'Freeze rollout when topology health changes.',
        'Correlate MongoDB and OS evidence.',
        'Restore stability before continuing.'
      ],

      interviewAnswer: `During a supported mixed-version rolling upgrade, if the replica set becomes unhealthy I stop the rollout and map the binary version and state of every member. I verify that the temporary version combination is supported, then investigate replication, elections, logs, network and storage.

I avoid changing priorities or forcing reconfiguration until I know whether the problem is actually version-related or an infrastructure issue that happened during maintenance.`,

      keyTakeaways: [
        'Mixed-version operation is temporary.',
        'The combination must be documented as supported.',
        'Freeze upgrades when cluster health changes.',
        'Investigate infrastructure as well as MongoDB.',
        'Do not reconfigure blindly.'
      ]
    }
  },

  /* =========================================================
     QUESTION 13
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 13,
    question:
      'What should a DBA investigate if the Feature Compatibility Version transition fails after all MongoDB binaries have been upgraded?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {
      groundZero: `An FCV transition failure should not be treated as a reason to repeatedly rerun the command.

FCV is a significant major-upgrade stage.

Capture the exact error and determine which prerequisite has not been satisfied.`,

      coreConcept: `New binaries installed
        |
        v
FCV transition
        |
      FAILURE
        |
        +--> exact error
        +--> topology health
        +--> version state
        +--> prerequisites
        +--> incompatible feature/state
        |
        v
resolve before retry`,

      detailedExplanation: `Possible investigation areas include:

1. MEMBER VERSIONS

Confirm every required member is running the intended compatible binary version.

2. REPLICA HEALTH

The cluster should be healthy before attempting a compatibility transition.

3. CURRENT FCV

Determine the exact current FCV state.

Some releases can expose transitional FCV state details.

Exact output varies by version.

4. TARGET VERSION REQUIREMENTS

Review the official upgrade procedure for the exact source and target releases.

5. INCOMPATIBLE FEATURES OR METADATA

Certain release transitions can require specific preconditions before FCV changes.

6. SHARDED CLUSTER CONSIDERATIONS

FCV changes in sharded deployments involve cluster-wide coordination and require the documented procedure.

Do not independently manipulate FCV-related metadata.

7. LOGS

Review the Primary and relevant component logs for the exact failure.

8. COMMAND OPTIONS

FCV command syntax and confirmation requirements have changed across MongoDB releases.

Do not copy a command from an unrelated version without checking documentation.

MOST IMPORTANT

Do not manually update system metadata to force FCV.

Do not directly edit internal collections that store compatibility information.

Resolve the documented prerequisite instead.`,

      internalWorking: `Binary upgrade complete
        |
        v
Preconditions satisfied?
       / \
     no   yes
     |     |
 investigate
           |
           v
       FCV transition`,

      architecture: `         ALL MEMBERS
        target binary
             |
             v
        healthy cluster
             |
             v
      documented FCV step
             |
             v
      target compatibility`,

      examples: [
        'One member still running an unexpected binary should be identified before FCV completion.',
        'FCV command syntax from an older MongoDB release may not exactly match the target release procedure.',
        'Internal FCV metadata should never be manually edited as a shortcut.'
      ],

      commands: [
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Inspects FCV state; exact returned structure depends on MongoDB version.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Checks replica-set health before further FCV actions.'
        }
      ],

      productionScenario: `All replica members appear to have been upgraded, but the FCV command fails.

The DBA does not attempt to modify internal metadata.

They inventory every member version, check topology health and inspect the exact command error against the documentation for the target release.

A missed prerequisite is corrected and the FCV transition is retried through the supported command path.`,

      troubleshootingApproach: `1. Capture exact FCV error.

2. Do not repeatedly retry blindly.

3. Check current FCV.

4. Verify every member version.

5. Verify topology health.

6. Review logs.

7. Review exact source-target documentation.

8. Identify unmet prerequisite.

9. Correct it safely.

10. Retry using documented procedure.

11. Verify final FCV.

12. Run application validation.`,

      commonMistakes: [
        'Manually editing FCV metadata.',
        'Copying FCV commands from another MongoDB release.',
        'Ignoring an unhealthy member.',
        'Repeatedly issuing the command without investigating.',
        'Assuming binary completion guarantees FCV completion.'
      ],

      bestPractices: [
        'Treat FCV as a controlled change stage.',
        'Capture the exact failure first.',
        'Use release-specific documentation.',
        'Keep the topology healthy.',
        'Never modify internal compatibility metadata manually.'
      ],

      interviewAnswer: `If FCV transition fails after the binary upgrade, I capture the exact error, verify every member's binary version and topology health, inspect the current FCV state and review the exact source-to-target upgrade prerequisites.

I never manually edit FCV metadata. FCV procedures and command requirements can change by MongoDB release, so I resolve the documented prerequisite and then retry through the supported command path.`,

      keyTakeaways: [
        'FCV failure requires investigation.',
        'Check all member versions.',
        'Exact release procedure matters.',
        'Never edit internal FCV metadata.',
        'Validate again after successful transition.'
      ]
    }
  },

  /* =========================================================
     QUESTION 14
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 14,
    question:
      'Why can a MongoDB downgrade or rollback fail after a major-version upgrade, and how should an L3 DBA respond?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {
      groundZero: `Major-version downgrade is not guaranteed simply because the old installation package is available.

The supported downgrade path depends on:

• current binary state
• FCV
• release-specific restrictions
• features used
• persistent metadata/state.`,

      coreConcept: `Upgrade advances state

old binary
   |
new binary
   |
FCV transition
   |
new features/state

As state advances,
downgrade requirements can increase.`,

      detailedExplanation: `A rollback can fail because the environment is no longer in a state supported by the old binary.

POSSIBLE REASONS

1. FCV

The compatibility state may have advanced.

2. NEW FEATURES

New release-specific functionality may have been used.

3. METADATA/FORMAT CHANGES

The target release may have changed persistent metadata or behavior subject to documented downgrade restrictions.

4. CONFIGURATION

The old binary may not accept the configuration now in use.

5. APPLICATION CHANGES

The application or drivers may also have been upgraded.

6. DOWNGRADE PROCEDURE

MongoDB releases can require specific steps before running older binaries.

L3 RESPONSE

First:

STOP.

Do not repeatedly start different binaries against the same dbPath without understanding compatibility.

Then determine:

• exact versions
• current FCV
• what upgrade steps completed
• whether target-only features were used
• official downgrade requirements
• backup/recovery options.

If in-place downgrade is no longer supported, recovery may require a different documented approach such as restoration or rebuilding from a valid source.

The exact path is release-specific.`,

      internalWorking: `Current data state
      |
      v
Old binary compatible?
      |
   +--+--+
   |     |
  yes    no
   |     |
documented  restore/rebuild/
downgrade   supported recovery`,

      architecture: `     UPGRADE STATE
           |
    +------+------+
    |             |
 binary        persistent
 changes         state
    |             |
    +------+------+
           |
      downgrade gate`,

      examples: [
        'An old binary package being present on disk does not prove that the current data state supports that binary.',
        'FCV and new-feature usage must be considered before downgrade.',
        'Repeatedly swapping binaries against the same dbPath can make troubleshooting more dangerous.'
      ],

      commands: [
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Helps determine the compatibility stage before planning downgrade.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms the binary currently being invoked.'
        }
      ],

      productionScenario: `An application regression appears after a major upgrade.

An engineer proposes immediately reinstalling the old mongod RPM.

The DBA blocks the action until the current FCV, completed upgrade stages and official downgrade restrictions are reviewed.

This prevents an unsupported older binary from being started against a potentially incompatible data state.`,

      troubleshootingApproach: `1. Stop uncontrolled version changes.

2. Record current binary versions.

3. Record FCV.

4. Identify completed upgrade stages.

5. Identify target-only feature usage.

6. Review downgrade documentation.

7. Determine whether in-place downgrade is supported.

8. If supported, follow exact sequence.

9. If unsupported, invoke backup/rebuild recovery design.

10. Validate data and application afterward.`,

      commonMistakes: [
        'Assuming old RPM equals rollback.',
        'Ignoring FCV.',
        'Starting random binary versions against the same dbPath.',
        'Ignoring new-feature usage.',
        'Having no recovery alternative to downgrade.'
      ],

      bestPractices: [
        'Define downgrade boundaries before upgrade.',
        'Track FCV carefully.',
        'Preserve known-good backups.',
        'Use exact release documentation.',
        'Stop uncontrolled experimentation during incidents.'
      ],

      interviewAnswer: `A major-version rollback can fail because the persistent state, FCV or features in use may no longer be supported by the old binary. Therefore I never treat reinstalling the previous package as an automatic rollback.

I determine the exact upgrade stage, current FCV and feature usage, review the release-specific downgrade procedure, and if in-place downgrade is not supported I move to the documented backup, rebuild or recovery strategy.`,

      keyTakeaways: [
        'Old package availability does not guarantee downgrade.',
        'FCV and persistent state matter.',
        'Downgrade rules are release-specific.',
        'Do not swap binaries randomly.',
        'Backups provide an alternative recovery path.'
      ]
    }
  },

  /* =========================================================
     QUESTION 15
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 15,
    question:
      'How should a DBA troubleshoot MongoDB package, repository, dependency, or binary-path problems during patching?',
    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {
      groundZero: `Not every MongoDB patching failure is a database problem.

The package manager, repository configuration, operating-system dependencies, service unit and executable path can all prevent a successful patch.`,

      coreConcept: `Patch failure
   |
   +--> repository?
   +--> package?
   +--> dependency?
   +--> architecture?
   +--> binary path?
   +--> service unit?
   +--> config?
   |
   v
correct software layer`,

      detailedExplanation: `REPOSITORY

Check:

• correct MongoDB release repository
• supported OS release
• package metadata
• repository accessibility.

PACKAGE

Confirm the exact package version intended for installation.

DEPENDENCIES

A newer MongoDB package can have different operating-system/library requirements.

Do not force dependency replacement without understanding system impact.

ARCHITECTURE

Verify the package matches the server architecture.

BINARY PATH

After installation, confirm:

• which mongod executable is found
• which executable systemd launches.

PATH confusion is especially common when tarball/zip and package-manager installations have both existed on the server.

SERVICE UNIT

Inspect the service definition where appropriate.

CONFIGURATION PATH

Ensure the service points to the expected mongod.conf.

PACKAGE VS DATA

Package installation errors and MongoDB data compatibility errors are different layers.

Solve them separately.

MANUAL EXTRACTION

Replacing files manually inside an existing package-managed installation can create inconsistent package state.

Use the organization's approved installation method and MongoDB-supported packaging approach.`,

      internalWorking: `OS
 |
repository
 |
package manager
 |
MongoDB package
 |
binary
 |
service
 |
mongod.conf
 |
dbPath`,

      architecture: `       PACKAGE LAYER
             |
       executable layer
             |
       service-manager
             |
       configuration
             |
          mongod
             |
           data`,

      examples: [
        'A new package can be installed while PATH still resolves to an older manually extracted mongod.',
        'A repository configured for the wrong OS release can cause dependency failures.',
        'Replacing package-managed binaries manually can make future patching difficult to audit.'
      ],

      commands: [
        {
          command:
            'which mongod',
          explanation:
            'Shows which mongod executable the current shell resolves through PATH.'
        },
        {
          command:
            'mongod --version',
          explanation:
            'Confirms the version of that executable.'
        },
        {
          command:
            'systemctl cat mongod',
          explanation:
            'Can show the service definition and executable/configuration path on systemd systems where permitted.'
        }
      ],

      productionScenario: `A DBA installs a newer MongoDB package and confirms package-manager success.

However, running mongod --version still reports the previous release.

Investigation shows an older manually extracted mongod appears earlier in PATH.

The DBA identifies both installations and standardizes the service and administrative environment on the approved package-managed binary.`,

      troubleshootingApproach: `1. Capture package-manager error.

2. Confirm OS release.

3. Confirm architecture.

4. Confirm repository.

5. Confirm target package.

6. Review dependency error.

7. Check executable path.

8. Check actual binary version.

9. Check systemd executable/config path.

10. Avoid manual file replacement.

11. Correct the packaging layer.

12. Validate mongod startup and replication.`,

      commonMistakes: [
        'Using force options without understanding dependency failures.',
        'Assuming PATH and systemd use the same binary.',
        'Mixing tarball and package installations carelessly.',
        'Manually overwriting package-managed binaries.',
        'Ignoring OS support.'
      ],

      bestPractices: [
        'Standardize installation method.',
        'Verify exact executable after patching.',
        'Use repositories appropriate to OS/version.',
        'Keep package evidence in the change record.',
        'Separate package failures from database failures.'
      ],

      interviewAnswer: `For package-related patch failures, I troubleshoot from the software stack downward: OS and architecture, repository, exact package version, dependencies, executable path, service definition and configuration path.

I also verify which mongod the shell and systemd actually use. I avoid manually overwriting package-managed binaries because that creates an inconsistent and difficult-to-support installation state.`,

      keyTakeaways: [
        'Package problems are not always MongoDB data problems.',
        'PATH can hide the actual installed binary.',
        'OS and repository compatibility matter.',
        'Avoid mixing installation methods.',
        'Verify the binary used by the service.'
      ]
    }
  },

  /* =========================================================
     QUESTION 16
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 16,
    question:
      'After a MongoDB upgrade, the replica set is healthy but application latency and errors increase. How would you investigate?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 16,

    answer: {
      groundZero: `A healthy replica set does not prove the application is healthy.

The upgrade may expose:

• driver compatibility problems
• query-plan changes
• connection behavior changes
• resource regressions
• configuration differences
• application assumptions.`,

      coreConcept: `MongoDB healthy
      |
Application unhealthy
      |
      +--> driver
      +--> connection
      +--> query plans
      +--> latency
      +--> CPU/disk
      +--> errors/logs
      |
      v
compare before vs after`,

      detailedExplanation: `FIRST ESTABLISH THE SYMPTOM

Determine:

• which APIs are slow
• which operations fail
• when the regression began
• whether all application instances are affected.

DRIVER

Inventory:

• driver name
• exact driver version
• server compatibility.

CONNECTIONS

Look for:

• connection storms
• topology discovery problems
• repeated reconnects
• server-selection errors.

QUERY PERFORMANCE

Compare representative slow operations.

Check:

• execution plan
• docs examined
• keys examined
• returned documents
• execution time.

A server upgrade can change planner behavior or expose a latent query/index weakness.

RESOURCE BASELINE

Compare before and after:

• CPU
• storage latency
• IOPS
• memory/cache
• network
• connections.

LOGS

Correlate application errors with MongoDB logs.

CONFIGURATION

Check whether configuration changed during the upgrade.

FCV STAGE

Know whether the problem started:

• after binary replacement
or
• after FCV transition.

This distinction can narrow the investigation.

ROLLBACK DECISION

Do not immediately downgrade because latency increased.

First establish whether the regression is:

• application
• query
• infrastructure
• configuration
• release-related.

If the impact is severe, use the predefined stop/rollback criteria.`,

      internalWorking: `Before baseline
      |
      v
Upgrade
      |
      v
After baseline
      |
      +--> query delta
      +--> resource delta
      +--> driver delta
      +--> config delta
      |
      v
root cause`,

      architecture: `APPLICATION
     |
   DRIVER
     |
   NETWORK
     |
   MONGOD
   /   \
query storage

Any layer can regress
while rs.status() looks healthy.`,

      examples: [
        'A query may start examining substantially more documents after the change even though replication is perfect.',
        'An unsupported old driver can cause server-selection or protocol-related application errors.',
        'Storage latency introduced during simultaneous OS maintenance can be mistaken for a MongoDB version regression.'
      ],

      commands: [
        {
          command:
            'db.currentOp()',
          explanation:
            'Can help inspect currently running operations; exact preferred diagnostic method depends on MongoDB version and workload.'
        },
        {
          command:
            'db.collection.explain("executionStats").find(<query>)',
          explanation:
            'Compares actual query execution behavior for a representative operation.'
        },
        {
          command:
            'db.serverStatus()',
          explanation:
            'Provides cumulative server metrics that should be interpreted as rates/deltas against a baseline rather than isolated counters.'
        }
      ],

      productionScenario: `After a major upgrade, application response time doubles.

Replica health and lag are normal.

The DBA identifies one high-volume query whose execution plan now performs far more work than the pre-change baseline.

The query/index design is corrected and application latency returns to normal without an unnecessary database downgrade.`,

      troubleshootingApproach: `1. Define affected application paths.

2. Capture exact errors.

3. Check driver version.

4. Check connection behavior.

5. Identify slow operations.

6. Compare explain output.

7. Compare resource baseline.

8. Review MongoDB logs.

9. Review configuration changes.

10. Correlate with binary/FCV stage.

11. Determine root cause.

12. Tune/fix or invoke rollback criteria.

13. Revalidate application.`,

      commonMistakes: [
        'Assuming healthy replication means successful upgrade.',
        'Immediately blaming MongoDB version.',
        'Immediately creating indexes without evidence.',
        'Ignoring driver compatibility.',
        'Ignoring simultaneous infrastructure changes.'
      ],

      bestPractices: [
        'Capture pre-upgrade baseline.',
        'Test representative workloads.',
        'Track driver versions.',
        'Separate binary and FCV validation stages.',
        'Use evidence before rollback.'
      ],

      interviewAnswer: `If the replica set is healthy but the application regresses after an upgrade, I investigate the full application-to-storage path. I compare driver compatibility, connection behavior, query plans, slow operations, CPU, memory, storage and network against the pre-upgrade baseline.

I also determine whether the regression began after binary replacement or after the FCV transition. I only attribute it to the release after eliminating query, driver, configuration and infrastructure causes.`,

      keyTakeaways: [
        'Replica health is not application health.',
        'Compare against baseline.',
        'Driver compatibility is important.',
        'Query plans can expose regressions.',
        'Correlate the issue with the exact upgrade stage.'
      ]
    }
  },

  /* =========================================================
     QUESTION 17
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 17,
    question:
      'How would you design the cutover for a side-by-side MongoDB migration while minimizing data loss and application downtime?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 17,

    answer: {
      groundZero: `A migration cutover is the point where the application stops using the source and starts using the target.

The critical questions are:

• how is the target kept current?
• when are source writes stopped?
• how is final synchronization verified?
• how is the application switched?
• how can fallback occur safely?`,

      coreConcept: `SOURCE
   |
continuous sync/copy
   |
   v
TARGET
   |
pre-validation
   |
write freeze/final sync
   |
application cutover
   |
smoke test
   |
business validation`,

      detailedExplanation: `PHASE 1 — BUILD TARGET

Create and validate:

• topology
• storage
• security
• monitoring
• backups
• users/roles
• indexes.

PHASE 2 — INITIAL DATA TRANSFER

Transfer the bulk dataset using the migration mechanism appropriate to the environment.

PHASE 3 — INCREMENTAL SYNCHRONIZATION

If the migration design supports ongoing synchronization, keep the target close to source.

The exact mechanism depends on topology, MongoDB product, version and migration tooling.

PHASE 4 — PRE-CUTOVER VALIDATION

Before downtime:

• validate target health
• validate data
• validate indexes
• validate application connectivity
• validate performance.

PHASE 5 — WRITE CONTROL

At cutover, prevent uncontrolled divergence.

Depending on architecture this may involve:

• application maintenance mode
• write freeze
• stopping writers
• a migration tool's coordinated cutover.

PHASE 6 — FINAL SYNCHRONIZATION

Confirm the target has received the required final source changes.

PHASE 7 — APPLICATION SWITCH

Update the application connection configuration.

PHASE 8 — SMOKE TEST

Validate:

• reads
• writes
• transactions
• critical business flows.

PHASE 9 — FALLBACK DECISION

Fallback becomes much more complex after the target accepts new writes.

You cannot blindly point the application back to a stale source because target-only writes may be lost.

Therefore define the fallback window and reverse-data strategy before cutover.

PHASE 10 — OBSERVATION

Monitor target intensely before decommissioning source.`,

      internalWorking: `Source writes
     |
     v
replication/sync
     |
     v
Target almost current
     |
freeze
     |
final sync
     |
cutover
     |
new writes on target`,

      architecture: `       BEFORE CUTOVER

APP ---> SOURCE =====> TARGET
           writes       sync

       DURING CUTOVER

APP --X SOURCE
        |
     final sync
        v
      TARGET

       AFTER CUTOVER

APP ------------> TARGET`,

      examples: [
        'Stopping synchronization before stopping application writes can leave the target behind.',
        'Once new writes occur on target, fallback is a data-reconciliation problem rather than only a DNS or connection-string change.',
        'Target validation should happen before the downtime window wherever possible.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Validates replica-set health on the target where applicable.'
        },
        {
          command:
            'db.getCollectionNames()',
          explanation:
            'Can assist with namespace-level inventory checks, though migration validation should be more comprehensive than this alone.'
        }
      ],

      productionScenario: `A large production database is migrated to new infrastructure.

The bulk copy is completed days before cutover while incremental synchronization continues.

During the final window, application writes are stopped, synchronization is allowed to reach the agreed recovery point, the target is validated and the application is switched.

The source is retained according to the fallback plan rather than immediately destroyed.`,

      troubleshootingApproach: `1. Define RPO/RTO.

2. Build target.

3. Transfer initial data.

4. Establish incremental synchronization.

5. Validate target.

6. Define write-stop procedure.

7. Define final sync criteria.

8. Cut application over.

9. Run smoke tests.

10. Monitor.

11. Invoke fallback only through documented data-consistency plan.

12. Decommission source later.`,

      commonMistakes: [
        'Treating cutover as only a connection-string change.',
        'Not controlling source writes.',
        'Not defining final synchronization.',
        'Assuming fallback remains simple after target writes begin.',
        'Decommissioning source immediately.'
      ],

      bestPractices: [
        'Move validation outside the downtime window.',
        'Define exact final-sync criteria.',
        'Control writes during cutover.',
        'Plan fallback before target accepts writes.',
        'Retain source according to approved rollback policy.'
      ],

      interviewAnswer: `For a side-by-side migration, I build and validate the target first, perform bulk transfer and then keep it synchronized using the supported migration mechanism. During cutover I control source writes, complete and validate the final synchronization, switch the application and run critical read/write smoke tests.

The key point is fallback: once the target accepts unique new writes, returning to the old source can lose data, so the fallback and reconciliation strategy must be designed before cutover.`,

      keyTakeaways: [
        'Cutover requires write coordination.',
        'Final synchronization must be explicit.',
        'Validate target before downtime.',
        'Fallback becomes harder after target writes.',
        'Do not immediately destroy the source.'
      ]
    }
  },

  /* =========================================================
     QUESTION 18
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 18,
    question:
      'How would an L3 DBA prove that data and operational behavior are correct after migrating MongoDB from a source cluster to a target cluster?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 18,

    answer: {
      groundZero: `Migration validation is not:

source count = target count, therefore success.

A production migration must validate both data correctness and operational behavior.`,

      coreConcept: `Migration validation

DATA
+
INDEXES
+
USERS/SECURITY
+
TOPOLOGY
+
APPLICATION
+
PERFORMANCE
+
BACKUP
+
MONITORING`,

      detailedExplanation: `1. DATABASE/NAMESPACE INVENTORY

Compare expected databases and collections.

2. DOCUMENT VALIDATION

Use validation appropriate to the workload:

• counts where meaningful
• business-key sampling
• critical records
• aggregate totals
• migration-tool validation
• application-level reconciliation.

Counts alone can miss:

• wrong field values
• duplicate/missing subsets
• changes that preserve total count.

3. INDEXES

Compare required indexes and their properties.

4. USERS/ROLES

Confirm required application and operational identities exist where migration design requires them.

5. SECURITY

Validate:

• authentication
• authorization
• TLS
• internal authentication.

6. REPLICA HEALTH

Target topology should be healthy.

7. APPLICATION

Test critical workflows.

8. PERFORMANCE

Compare representative queries and application latency.

9. BACKUP

Run or validate the target backup process.

10. MONITORING

Confirm dashboards and alerts observe the new target.

11. AUTOMATION

Check:

• backup scripts
• housekeeping
• maintenance jobs
• monitoring agents.

12. EXTERNAL DEPENDENCIES

Confirm DNS, firewall, allow lists, secrets and connection strings point to the intended environment.

13. BUSINESS VALIDATION

For critical systems, application/business owners should validate meaningful transactions.

The goal is proving that the target is not merely populated, but production-ready.`,

      internalWorking: `Source
  |
  +--> inventory
  +--> data semantics
  +--> indexes
  +--> security
  +--> behavior
  |
compare
  |
Target
  |
production acceptance`,

      architecture: `        MIGRATION ACCEPTANCE
          /            \
         v              v
    Data correctness  Operational readiness
       |                   |
   records/indexes      app/backup/
                       monitoring/security
          \             /
           \           /
              PASS`,

      examples: [
        'Equal document counts do not prove that the same documents exist.',
        'A target can contain all data but still be unusable because application roles were not migrated.',
        'A successful application test does not prove backup and monitoring are configured.'
      ],

      commands: [
        {
          command:
            'db.collection.countDocuments({})',
          explanation:
            'Can be one component of validation, but counts alone are insufficient and can be expensive on large collections.'
        },
        {
          command:
            'db.collection.getIndexes()',
          explanation:
            'Returns index definitions for comparison.'
        },
        {
          command:
            'rs.status()',
          explanation:
            'Validates target replica-set topology where applicable.'
        }
      ],

      productionScenario: `A source and target collection both contain 200 million documents.

The migration team wants to declare success based on equal counts.

The DBA additionally validates indexes, business aggregates, sampled business keys, application reads/writes, replica health, backup and monitoring.

A missing unique index is discovered before production cutover and corrected.`,

      troubleshootingApproach: `1. Inventory namespaces.

2. Compare meaningful counts.

3. Validate business records.

4. Validate aggregates/checks where appropriate.

5. Compare indexes.

6. Validate users/security.

7. Validate target topology.

8. Run application smoke tests.

9. Compare performance.

10. Validate backups.

11. Validate monitoring/automation.

12. Obtain production acceptance.`,

      commonMistakes: [
        'Using only document counts.',
        'Ignoring indexes.',
        'Ignoring users and roles.',
        'Ignoring backup after migration.',
        'Skipping business-level validation.'
      ],

      bestPractices: [
        'Use layered validation.',
        'Validate semantics, not only quantities.',
        'Include operational tooling.',
        'Run representative application transactions.',
        'Document acceptance evidence.'
      ],

      interviewAnswer: `I validate a MongoDB migration at several layers. I compare namespaces, meaningful counts, business-key samples or aggregates, required indexes, users and security, and then validate replica health, application reads/writes, performance, backups, monitoring and automation.

Equal document counts alone are not sufficient because they do not prove that the correct documents, values, indexes or operational configuration exist on the target.`,

      keyTakeaways: [
        'Counts alone do not prove correctness.',
        'Indexes are part of migration validation.',
        'Security and users matter.',
        'Backup and monitoring must work on target.',
        'Business-level checks complete validation.'
      ]
    }
  },

  /* =========================================================
     QUESTION 19
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 19,
    question:
      'A production MongoDB 7.x to 8.x rolling upgrade fails midway. How would you manage the incident and decide whether to continue, rollback, or recover?',
    level: 'L3+',
    difficulty: 'Scenario',
    order: 19,

    answer: {
      groundZero: `The first goal is not finishing the upgrade.

The first goal is protecting production availability and data.

A failed upgrade should move immediately from execution mode into incident-control mode.`,

      coreConcept: `Upgrade failure
      |
      v
STOP CHANGE
      |
      v
Protect healthy majority
      |
      v
Determine exact stage
      |
      +--> recover member
      +--> continue safely
      +--> supported rollback
      +--> backup/rebuild recovery`,

      detailedExplanation: `STEP 1 — FREEZE

Stop upgrading additional members.

STEP 2 — ESTABLISH TOPOLOGY

Record:

• current Primary
• healthy Secondaries
• failed members
• binary version per member
• FCV
• replication lag.

STEP 3 — PROTECT AVAILABILITY

Do not take another voting data-bearing member offline if doing so threatens majority.

STEP 4 — IDENTIFY FAILURE

Determine whether failure is:

• package
• startup
• replication
• election
• application
• storage
• configuration
• compatibility.

STEP 5 — CHECK UPGRADE STAGE

The decision differs if:

A. only one Secondary was upgraded

versus:

B. all binaries were upgraded but FCV not changed

versus:

C. FCV transition completed and target-only features are in use.

STEP 6 — DETERMINE SUPPORTED OPTIONS

Option A:
fix the failed member and continue.

Option B:
use supported binary downgrade procedure.

Option C:
stop at a stable supported mixed-version stage while escalating according to the documented procedure.

Option D:
restore/rebuild using a valid recovery source if required.

STEP 7 — APPLICATION IMPACT

If application availability is affected, coordinate incident communications and business priorities.

STEP 8 — NO UNSAFE SHORTCUTS

Do not:

• force replica-set reconfig casually
• delete storage files
• manipulate FCV metadata
• start arbitrary old/new binaries
• upgrade additional nodes hoping the issue disappears.

STEP 9 — VALIDATE

Whichever path is chosen, return the cluster to a fully understood healthy state before closing the incident.`,

      internalWorking: `FAILED CHANGE
     |
     v
STABILIZE
     |
     v
IDENTIFY STAGE
     |
 +---+----+---------+
 |        |         |
fix    rollback   recover
 |        |         |
 +--------+---------+
          |
       validate`,

      architecture: `            INCIDENT
               |
       +-------+-------+
       |               |
    topology         upgrade
     health           stage
       |               |
       +-------+-------+
               |
         decision gate
        /      |      \
    continue rollback recover`,

      examples: [
        'Failure on the first Secondary usually leaves more rollback flexibility than failure after later compatibility transitions.',
        'A healthy majority should not be sacrificed merely to stay on the maintenance schedule.',
        'FCV state is essential evidence when deciding downgrade options.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Establishes current replica-set state.'
        },
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Helps identify compatibility stage.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Confirms the version of the server currently queried.'
        }
      ],

      productionScenario: `During a three-node 7.x to 8.x upgrade, the first upgraded Secondary repeatedly crashes during startup.

The Primary and second Secondary remain healthy.

The DBA stops the upgrade, preserves the two healthy members, collects startup evidence and confirms FCV has not changed.

The exact failure is resolved or the documented rollback is used on the affected Secondary.

The team does not touch the remaining healthy members until redundancy has been restored.`,

      troubleshootingApproach: `1. Freeze change.

2. Establish Primary and member states.

3. Record version per member.

4. Record FCV.

5. Check lag/oplog safety.

6. Capture failure evidence.

7. Classify root cause.

8. Review supported upgrade/downgrade path.

9. Select continue, rollback or recovery.

10. Restore redundancy.

11. Validate application.

12. Validate backups/monitoring.

13. Document incident and change outcome.`,

      commonMistakes: [
        'Prioritizing change completion over availability.',
        'Upgrading another member after failure.',
        'Forcing elections/reconfigs without need.',
        'Ignoring FCV when choosing rollback.',
        'Experimenting directly on production data files.'
      ],

      bestPractices: [
        'Freeze immediately when a stop condition occurs.',
        'Protect majority.',
        'Record exact upgrade stage.',
        'Use documented recovery paths.',
        'Restore redundancy before resuming maintenance.'
      ],

      interviewAnswer: `If a 7.x to 8.x rolling upgrade fails midway, I stop the rollout and first protect the healthy majority. I record the version and state of every member, FCV, replication state and the exact failure.

Then I determine the upgrade stage because rollback flexibility differs before and after FCV or new-feature activation. Based on the documented source-target procedures, I either fix and continue, perform a supported rollback, or move to backup/rebuild recovery. I never sacrifice cluster health simply to finish the change window.`,

      keyTakeaways: [
        'Stability comes before upgrade completion.',
        'Freeze the rollout.',
        'Protect majority.',
        'Upgrade stage determines recovery options.',
        'Use supported procedures only.'
      ]
    }
  },

  /* =========================================================
     QUESTION 20
  ========================================================= */

  {
    category: 'upgrade_patching_migration',
    topicId: 'upgrade-patching-migration',
    topicNumber: 18,
    topicName: 'Upgrade, Patching & Migration',
    questionNumber: 20,
    question:
      'How would you design and execute an end-to-end L3 production MongoDB upgrade and patching strategy covering planning, rolling execution, FCV, rollback, application validation, and post-change monitoring?',
    level: 'L3+',
    difficulty: 'Expert',
    order: 20,

    answer: {
      groundZero: `An L3 MongoDB upgrade is a controlled lifecycle:

ASSESS
→ PLAN
→ TEST
→ BACKUP
→ PRE-CHECK
→ ROLL
→ VALIDATE
→ FCV
→ OBSERVE
→ CLOSE.

The commands are only a small part of the job.`,

      coreConcept: `ASSESS
   |
PLAN
   |
TEST
   |
BACKUP
   |
PRE-CHECK
   |
ROLL SECONDARIES
   |
PRIMARY TRANSITION
   |
OLD PRIMARY
   |
APPLICATION VALIDATION
   |
FCV
   |
FINAL VALIDATION
   |
OBSERVE`,

      detailedExplanation: `PHASE 1 — INVENTORY

Document:

• topology
• MongoDB versions
• FCV
• OS
• drivers
• Database Tools
• mongosh
• configuration
• TLS/auth
• storage
• backup
• monitoring.

PHASE 2 — COMPATIBILITY

Review exact source/target documentation.

Check:

• supported upgrade path
• source patch prerequisite
• OS support
• driver support
• removed/deprecated options
• downgrade restrictions
• known issues.

PHASE 3 — RISK

Define:

• business impact
• RTO
• RPO
• maintenance window
• stop conditions
• rollback decision points.

PHASE 4 — TEST

Rehearse representative upgrade and rollback paths in a lower environment where practical.

Test application workflows.

PHASE 5 — BACKUP

Confirm a recent recoverable backup and access to everything needed for recovery, including encryption/KMS material where applicable.

PHASE 6 — BASELINE

Capture:

• query latency
• CPU
• memory
• disk latency
• connections
• replication lag
• application health.

PHASE 7 — PRE-CHECK

Require:

• healthy topology
• caught-up Secondaries
• safe oplog coverage
• sufficient disk
• working monitoring.

PHASE 8 — ROLLING EXECUTION

For each Secondary:

1. cleanly stop
2. upgrade
3. start
4. confirm version
5. confirm SECONDARY
6. confirm catch-up
7. review logs.

Do not move forward until healthy.

PHASE 9 — PRIMARY

After eligible upgraded Secondaries are ready:

• perform controlled Primary transition
• validate application failover
• upgrade former Primary
• verify it rejoins.

PHASE 10 — BINARY VALIDATION

Confirm all members use the intended version.

Run application smoke tests.

PHASE 11 — FCV

For a major upgrade, perform the exact documented FCV transition only at the appropriate stage.

PHASE 12 — APPLICATION VALIDATION

Test:

• reads
• writes
• transactions
• critical business APIs.

PHASE 13 — PERFORMANCE

Compare against baseline.

PHASE 14 — OPERATIONS

Verify:

• backups
• monitoring
• alerts
• automation
• security.

PHASE 15 — OBSERVATION

Keep heightened monitoring for a defined period.

PHASE 16 — CLOSURE

Document:

• final versions
• FCV
• election/cutover events
• issues
• validation evidence
• rollback status.

The most important L3 behavior is controlled decision-making.

A senior DBA knows when not to continue.`,

      internalWorking: `Preparation
     |
     v
Healthy baseline
     |
     v
One-node change
     |
     v
Validate
     |
     v
Next node
     |
     v
Primary transition
     |
     v
Cluster validation
     |
     v
FCV
     |
     v
Business validation`,

      architecture: `                APPLICATION
                     |
                     v
                 PRIMARY
                /       \
               v         v
          SECONDARY   SECONDARY

During rolling maintenance:

only one planned member
is unavailable at a time.

After every stage:

MongoDB health
+
application health
+
operational health
must be validated.`,

      examples: [
        'If the first upgraded Secondary fails, the upgrade stops.',
        'If the cluster is healthy but application latency doubles, the change is not yet successful.',
        'If backup jobs fail after the upgrade, operational validation has failed.',
        'If FCV has not reached the intended final state, the major-version transition may not be complete.'
      ],

      commands: [
        {
          command:
            'rs.status()',
          explanation:
            'Core replica-set health validation throughout the change.'
        },
        {
          command:
            'rs.printSecondaryReplicationInfo()',
          explanation:
            'Useful quick replication-lag check where the mongosh helper is available.'
        },
        {
          command:
            'rs.printReplicationInfo()',
          explanation:
            'Helps inspect oplog information and coverage.'
        },
        {
          command:
            'db.version()',
          explanation:
            'Confirms server version.'
        },
        {
          command:
            'db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 })',
          explanation:
            'Checks FCV state; exact output and transition procedure depend on MongoDB release.'
        }
      ],

      productionScenario: `A financial application uses a three-member MongoDB replica set and requires a major-version upgrade.

Before the window, the DBA verifies exact source/target compatibility, driver support, backups, oplog coverage and performance baseline.

One Secondary is upgraded and validated completely before the second Secondary is touched.

A controlled Primary transition is then performed and the old Primary is upgraded.

All binaries are validated.

Application read/write tests and performance comparisons are completed.

The documented FCV transition is performed only after the environment is stable.

Backups, monitoring and application behavior are observed before the change is formally closed.`,

      troubleshootingApproach: `1. Inventory.

2. Review compatibility.

3. Define risk.

4. Define rollback.

5. Test.

6. Validate backup.

7. Capture baseline.

8. Run pre-check.

9. Upgrade Secondary 1.

10. Validate.

11. Upgrade Secondary 2.

12. Validate.

13. Transition Primary.

14. Upgrade former Primary.

15. Validate all binaries.

16. Validate application.

17. Perform documented FCV transition.

18. Compare performance.

19. Validate backup/monitoring/security.

20. Observe and close.`,

      commonMistakes: [
        'Treating an upgrade as only package installation.',
        'Changing multiple nodes simultaneously.',
        'Starting with an unhealthy replica set.',
        'Changing FCV prematurely.',
        'Having no rollback decision point.',
        'Skipping application validation.',
        'Ignoring backups and monitoring after change.',
        'Continuing despite failed stop criteria.'
      ],

      bestPractices: [
        'Use a written runbook.',
        'Upgrade one member at a time.',
        'Validate after every stage.',
        'Separate binary upgrade from FCV transition.',
        'Capture pre-change baseline.',
        'Define stop and rollback criteria.',
        'Validate the complete application ecosystem.',
        'Maintain heightened post-change monitoring.'
      ],

      interviewAnswer: `For an L3 production MongoDB upgrade, I start with an inventory of topology, exact server versions, FCV, OS, drivers, tools, configuration and security. I verify the supported source-to-target path, test the change, validate recovery and define explicit stop and rollback criteria.

During execution I upgrade one Secondary at a time and require it to return healthy and caught up before continuing. After upgraded Secondaries are ready, I perform a controlled Primary transition and upgrade the former Primary.

I validate all binaries and application behavior before completing the documented FCV transition. Finally I compare performance with baseline and validate backups, monitoring, security and critical business transactions. The change is successful only when the entire service is healthy, not merely when mongod starts.`,

      keyTakeaways: [
        'Planning is part of the upgrade.',
        'One member at a time protects availability.',
        'Stop conditions must be respected.',
        'Binary version and FCV are separate stages.',
        'Application and operational validation are mandatory.',
        'L3 execution is evidence-driven and reversible wherever possible.'
      ]
    }
  }

];

/* =========================================================
   SEED FUNCTION
========================================================= */

async function seedUpgradePatchingMigration() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );

    const deleteResult = await collection.deleteMany({
      category: 'upgrade_patching_migration'
    });

    console.log(
      `Removed ${deleteResult.deletedCount} previous upgrade_patching_migration documents`
    );

    const insertResult = await collection.insertMany(
      questions
    );

    console.log(
      `Inserted ${insertResult.insertedCount} Upgrade, Patching & Migration questions`
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
        category: 'upgrade_patching_migration'
      });

    console.log(
      `Topic 18 count: ${topicCount}`
    );

    if (topicCount !== 20) {
      throw new Error(
        `Topic 18 validation failed. Expected 20 questions but found ${topicCount}.`
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
      'Topic 18 seed completed successfully.'
    );
  } catch (error) {
    console.error(
      'Topic 18 seed failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedUpgradePatchingMigration();
