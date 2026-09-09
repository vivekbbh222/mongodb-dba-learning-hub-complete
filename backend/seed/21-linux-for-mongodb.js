require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const DATABASE_NAME = 'webapp';
const COLLECTION_NAME = 'questions';

const questions = [

  // ============================================================
  // QUESTION 1
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 1,

    question:
      'Why is Linux knowledge important for a MongoDB DBA, and which operating-system areas should a MongoDB administrator understand?',

    level: 'Foundation',
    difficulty: 'Beginner',
    order: 1,

    answer: {

      groundZero:
        'MongoDB does not operate independently from the operating system. Every MongoDB process uses Linux CPU, memory, filesystem, disks, networking, processes, file descriptors and kernel settings. Therefore, a MongoDB DBA must understand Linux sufficiently to determine whether a problem originates inside MongoDB or underneath MongoDB at the operating-system level.',

      coreConcept:
        'MongoDB performance and availability depend heavily on the Linux operating system. A DBA should understand process management, CPU, memory, storage, disk I/O, networking, filesystems, permissions, kernel parameters, systemd, logs and resource limits.',

      detailedExplanation:
        `A MongoDB DBA frequently receives incidents described as "MongoDB is slow", "MongoDB CPU is high", "replication is lagging", "MongoDB is not starting", or "connections are failing".

However, MongoDB may only be the component where the problem becomes visible.

Examples:

1. MongoDB queries may become slow because disk latency increased.
2. Replication lag may occur because the secondary storage cannot keep up with writes.
3. MongoDB may fail to start because the data directory is owned by the wrong Linux user.
4. Applications may fail to connect because the port is not listening or a firewall/network path is blocked.
5. MongoDB may experience performance problems because the server is swapping.
6. The mongod process may fail because file descriptor limits are too low.
7. A filesystem may reach 100% usage even when MongoDB itself is still running.

An experienced MongoDB DBA therefore investigates both MongoDB metrics and Linux metrics before concluding the root cause.`,

      internalWorking:
        `MongoDB runs as a Linux process, normally named mongod.

Linux is responsible for scheduling mongod on CPU cores, allocating memory pages, handling filesystem operations, providing sockets, managing TCP connections and communicating with storage devices.

The flow is roughly:

Application
    |
    v
Linux TCP/IP stack
    |
    v
mongod process
    |
    v
WiredTiger
    |
    v
Linux filesystem/page cache
    |
    v
Storage device

A bottleneck at any layer can affect MongoDB.`,

      architecture:
        `Application
     |
     v
Linux Network Stack
     |
     v
mongod
     |
     +--> CPU Scheduler
     |
     +--> Memory
     |
     +--> File Descriptors
     |
     +--> Filesystem
     |
     +--> Disk I/O
     |
     +--> Kernel
     |
     v
Physical / Virtual Infrastructure`,

      examples: [
        'High MongoDB latency combined with high iowait may indicate storage latency.',
        'Replication lag on only one secondary may indicate a host-specific CPU, disk or network problem.',
        'mongod startup failure after maintenance may be caused by incorrect ownership of the dbPath.',
        'A server with low free memory is not automatically unhealthy because Linux intentionally uses available RAM for caching.'
      ],

      commands: [
        {
          command: 'ps -ef | grep mongod',
          explanation:
            'Checks whether the mongod process is running and shows the command used to start it.'
        },
        {
          command: 'top',
          explanation:
            'Displays real-time CPU, memory, process and system load information.'
        },
        {
          command: 'free -h',
          explanation:
            'Displays Linux memory and swap utilization in human-readable format.'
        },
        {
          command: 'df -h',
          explanation:
            'Displays filesystem capacity and available disk space.'
        },
        {
          command: 'iostat -xz 1',
          explanation:
            'Shows detailed disk I/O utilization, throughput and latency.'
        },
        {
          command: 'ss -lntp',
          explanation:
            'Shows listening TCP ports and associated processes where permissions allow.'
        },
        {
          command: 'systemctl status mongod',
          explanation:
            'Displays MongoDB systemd service status on systems where mongod is managed by systemd.'
        }
      ],

      productionScenario:
        `An application team reports that MongoDB response time suddenly increased.

MongoDB slow-query logs show several operations taking longer than usual.

Instead of immediately creating indexes, the DBA checks:

top
vmstat
iostat
df
MongoDB serverStatus
currentOp
replication status

The DBA discovers disk await has increased dramatically across the server.

The incident is therefore investigated as a storage latency problem rather than blindly changing indexes.`,

      troubleshootingApproach:
        `1. Confirm the MongoDB symptom.
2. Determine the affected node or nodes.
3. Check CPU utilization.
4. Check memory and swap.
5. Check disk capacity.
6. Check disk latency and utilization.
7. Check network/listening ports where relevant.
8. Check MongoDB logs.
9. Check MongoDB internal metrics.
10. Correlate timestamps before determining root cause.`,

      commonMistakes: [
        'Assuming every MongoDB performance incident is caused by MongoDB configuration.',
        'Restarting mongod before collecting Linux and MongoDB evidence.',
        'Looking only at CPU percentage.',
        'Treating low Linux free memory as proof of memory exhaustion.',
        'Ignoring disk latency during replication or query-performance incidents.'
      ],

      bestPractices: [
        'Always correlate MongoDB metrics with Linux metrics.',
        'Capture evidence before restarting services.',
        'Know the normal baseline of CPU, memory, disk latency and network usage.',
        'Use multiple metrics rather than relying on a single command.',
        'Distinguish symptoms from root causes.'
      ],

      interviewAnswer:
        'Linux knowledge is essential for a MongoDB DBA because mongod depends on operating-system CPU, memory, storage, networking, filesystems and kernel resources. During production troubleshooting I correlate MongoDB metrics such as slow queries, replication lag and WiredTiger activity with Linux tools such as top, vmstat, iostat, free, df and ss before identifying root cause.',

      keyTakeaways: [
        'MongoDB performance depends strongly on Linux.',
        'A MongoDB symptom may originate from the operating system.',
        'CPU, memory, disk, network and filesystem analysis are core DBA skills.',
        'Production troubleshooting should correlate MongoDB and Linux evidence.'
      ]
    }
  },

  // ============================================================
  // QUESTION 2
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 2,

    question:
      'How do you identify and analyze the MongoDB mongod process on a Linux server using ps, pgrep, pidof and /proc?',

    level: 'Foundation',
    difficulty: 'Beginner',
    order: 2,

    answer: {

      groundZero:
        'MongoDB runs as a Linux process called mongod. Before troubleshooting CPU, memory, files or ports, a DBA should know how to find the process ID and inspect the process.',

      coreConcept:
        'Linux assigns every running process a Process ID, or PID. Once the mongod PID is known, a DBA can inspect its command line, open files, memory statistics, limits and other process information.',

      detailedExplanation:
        `Several Linux commands can identify MongoDB processes.

ps provides a process snapshot.

pgrep searches processes by name.

pidof returns the PID associated with a program.

The /proc filesystem provides detailed kernel information about each process.

For example, if the mongod PID is 1842:

/proc/1842/

contains information about that process.

Useful files include:

/proc/1842/cmdline
/proc/1842/status
/proc/1842/limits
/proc/1842/fd

These allow a DBA to inspect exactly how mongod was started and what operating-system limits apply.`,

      internalWorking:
        `Every Linux process receives a PID.

Linux exposes process information through the virtual /proc filesystem.

Example:

mongod
  |
  +-- PID 1842
        |
        +-- /proc/1842/status
        +-- /proc/1842/limits
        +-- /proc/1842/fd
        +-- /proc/1842/cmdline

The /proc files are generated dynamically by the kernel rather than stored as normal files on disk.`,

      architecture:
        `Linux Kernel
     |
     v
Process Table
     |
     v
mongod PID
     |
     +--> status
     +--> limits
     +--> file descriptors
     +--> command line`,

      examples: [
        'Finding whether multiple mongod instances are running on the same server.',
        'Determining which configuration file was supplied to mongod.',
        'Checking the Linux user that owns the mongod process.',
        'Checking process-level file descriptor limits.'
      ],

      commands: [
        {
          command: 'ps -ef | grep [m]ongod',
          explanation:
            'Displays mongod processes while avoiding matching the grep process itself.'
        },
        {
          command: 'pgrep -a mongod',
          explanation:
            'Returns mongod process IDs together with their command lines.'
        },
        {
          command: 'pidof mongod',
          explanation:
            'Returns the PID or PIDs of running mongod processes.'
        },
        {
          command: 'ps -p $(pidof mongod) -o pid,ppid,user,%cpu,%mem,etime,cmd',
          explanation:
            'Shows PID, parent PID, owner, CPU, memory, elapsed runtime and command line for mongod.'
        },
        {
          command: 'cat /proc/$(pidof mongod)/status',
          explanation:
            'Displays process status including memory and thread information.'
        },
        {
          command: 'cat /proc/$(pidof mongod)/limits',
          explanation:
            'Displays operating-system resource limits applied to the mongod process.'
        },
        {
          command: 'tr "\\0" " " < /proc/$(pidof mongod)/cmdline',
          explanation:
            'Displays the exact command line used to start mongod.'
        }
      ],

      productionScenario:
        `After OS patching, the DBA finds that the mongod service appears active but MongoDB is using a different configuration than expected.

Running:

pgrep -a mongod

reveals that mongod was started with an unexpected --config path.

The DBA then investigates the systemd unit and configuration rather than treating the issue as a database problem.`,

      troubleshootingApproach:
        `1. Find the mongod PID.
2. Confirm the Linux user running mongod.
3. Inspect the process command line.
4. Check how long the process has been running.
5. Inspect process limits.
6. Check open file descriptors if necessary.
7. Compare with the expected systemd configuration.`,

      commonMistakes: [
        'Using only grep output without confirming the actual PID.',
        'Assuming the configuration file path without inspecting the running process.',
        'Looking at shell ulimit values rather than limits applied to the mongod process.',
        'Killing a mongod PID without understanding replica-set impact.'
      ],

      bestPractices: [
        'Use pgrep or ps to identify the exact mongod process.',
        'Inspect /proc when investigating process-specific operating-system behavior.',
        'Confirm service topology before terminating any mongod process.',
        'Capture the process command line during incident investigation.'
      ],

      interviewAnswer:
        'I normally identify mongod using pgrep -a mongod or ps. Once I have the PID I inspect /proc/PID/status, /proc/PID/limits and /proc/PID/cmdline. This helps confirm how MongoDB was started, which user owns the process, what limits apply and whether the running configuration matches the expected configuration.',

      keyTakeaways: [
        'Every mongod process has a Linux PID.',
        '/proc provides detailed process information.',
        'Process-level limits may differ from interactive-shell limits.',
        'Always confirm the exact running mongod command.'
      ]
    }
  },

  // ============================================================
  // QUESTION 3
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 3,

    question:
      'How do you troubleshoot high CPU utilization on a MongoDB Linux server using top, mpstat, sar and MongoDB diagnostics?',

    level: 'Foundation',
    difficulty: 'Beginner',
    order: 3,

    answer: {

      groundZero:
        'High CPU means processors are spending significant time executing work. High CPU itself is not automatically a problem. The DBA must determine which process is using the CPU, whether all CPUs are affected, and what MongoDB workload is responsible.',

      coreConcept:
        'Linux tools identify where CPU time is being consumed while MongoDB tools identify which operations or workload patterns are producing that consumption.',

      detailedExplanation:
        `CPU troubleshooting should answer several questions:

Is CPU actually saturated?

Is mongod the main consumer?

Is one core saturated or all cores?

Is the CPU usage user time, system time or iowait?

Did the workload change?

Are expensive MongoDB queries currently running?

A common mistake is seeing 90% CPU and immediately restarting MongoDB.

Instead, correlate Linux CPU metrics with:

db.currentOp()
serverStatus()
slow query logs
explain("executionStats")
application workload changes.`,

      internalWorking:
        `Linux schedules mongod threads across available logical CPUs.

MongoDB uses multiple threads for:

client operations
WiredTiger work
replication
checkpointing
background activities
network operations

High CPU may therefore originate from a legitimate workload increase, inefficient queries, excessive connection activity or operating-system overhead.`,

      architecture:
        `MongoDB Workload
      |
      v
mongod Threads
      |
      v
Linux Scheduler
      |
      v
CPU Cores
      |
      +--> user %
      +--> system %
      +--> idle %
      +--> iowait %`,

      examples: [
        'A COLLSCAN over millions of documents can consume significant CPU.',
        'A sudden application traffic increase may increase CPU without any MongoDB fault.',
        'One CPU core may become heavily utilized while overall CPU appears moderate.',
        'High system CPU may indicate kernel/network/storage overhead rather than query execution alone.'
      ],

      commands: [
        {
          command: 'top',
          explanation:
            'Displays real-time overall CPU and per-process CPU utilization.'
        },
        {
          command: 'top -H -p $(pidof mongod)',
          explanation:
            'Shows individual threads belonging to the mongod process.'
        },
        {
          command: 'mpstat -P ALL 1',
          explanation:
            'Displays utilization for each CPU core at one-second intervals.'
        },
        {
          command: 'sar -u 1 10',
          explanation:
            'Collects CPU utilization samples and separates user, system, iowait and idle time.'
        },
        {
          command: 'ps -p $(pidof mongod) -o pid,%cpu,%mem,etime,cmd',
          explanation:
            'Shows current CPU and memory usage for mongod.'
        },
        {
          command: 'mongosh --eval "db.adminCommand({serverStatus:1}).opcounters"',
          explanation:
            'Provides MongoDB operation counters when authentication and connection options are supplied appropriately.'
        }
      ],

      productionScenario:
        `CPU rises from a normal 35% to 95%.

The DBA verifies mongod is the main CPU consumer.

mpstat shows all CPUs are busy.

MongoDB current operations reveal multiple long-running queries.

explain execution statistics show very high documents examined relative to returned documents.

The root cause is an inefficient workload rather than a Linux CPU failure.`,

      troubleshootingApproach:
        `1. Check overall CPU.
2. Identify top CPU-consuming processes.
3. Determine whether mongod is responsible.
4. Check per-core utilization.
5. Separate user, system and iowait CPU.
6. Inspect current MongoDB operations.
7. Review slow-query logs.
8. Analyze suspicious queries with explain.
9. Check whether workload volume recently changed.
10. Fix the actual query/index/workload issue rather than merely restarting.`,

      commonMistakes: [
        'Restarting MongoDB just because CPU reaches 90%.',
        'Looking only at total CPU rather than per-core CPU.',
        'Confusing iowait with CPU-intensive query execution.',
        'Creating indexes without examining query patterns.'
      ],

      bestPractices: [
        'Establish normal CPU baseline.',
        'Correlate Linux CPU utilization with MongoDB workload.',
        'Use mpstat for per-core analysis.',
        'Investigate sustained high CPU rather than isolated spikes.'
      ],

      interviewAnswer:
        'For high CPU I first use top or ps to confirm whether mongod is the main consumer. Then I use mpstat and sar to determine whether all CPUs are saturated and whether the time is user, system or iowait. I correlate that with currentOp, slow logs, operation rates and explain execution statistics to determine which MongoDB workload is responsible.',

      keyTakeaways: [
        'High CPU is a symptom, not the root cause.',
        'Check per-process and per-core utilization.',
        'Differentiate user CPU, system CPU and iowait.',
        'Correlate Linux metrics with MongoDB operations.'
      ]
    }
  },

  // ============================================================
  // QUESTION 4
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 4,

    question:
      'How do you analyze memory utilization and swap on a MongoDB Linux server using free, vmstat and /proc/meminfo?',

    level: 'Foundation',
    difficulty: 'Beginner',
    order: 4,

    answer: {

      groundZero:
        'Linux intentionally uses unused RAM for caches. Therefore, low values in the free memory column do not automatically mean the server is out of memory.',

      coreConcept:
        'MongoDB memory analysis should focus on available memory, swap activity, memory pressure and WiredTiger cache behavior rather than only the free-memory number.',

      detailedExplanation:
        `Linux memory is used for processes, kernel structures, filesystem cache and other purposes.

The free command typically reports:

total
used
free
shared
buff/cache
available

The most useful general indicator is often available memory rather than free memory alone.

For MongoDB, the DBA should also understand WiredTiger cache.

MongoDB's WiredTiger cache and Linux filesystem cache are separate layers.

Heavy swapping is generally undesirable for database workloads because accessing swapped memory is much slower than accessing RAM.`,

      internalWorking:
        `MongoDB
   |
   +--> WiredTiger cache
   |
Linux
   |
   +--> process memory
   +--> page cache
   +--> kernel memory
   |
   +--> swap if memory pressure occurs

When Linux must repeatedly move memory pages between RAM and swap, database latency can increase significantly.`,

      architecture:
        `Physical RAM
     |
     +--> mongod memory
     |      |
     |      +--> WiredTiger cache
     |
     +--> Linux filesystem cache
     |
     +--> other processes
     |
     +--> kernel memory

Memory pressure
     |
     v
Swap activity`,

      examples: [
        'A server may show only 200 MB free memory but several GB available due to reclaimable cache.',
        'Continuous swap-in and swap-out activity can severely affect database latency.',
        'A large non-MongoDB process can create memory pressure affecting mongod.',
        'WiredTiger cache pressure can exist even when the operating system itself is not out of memory.'
      ],

      commands: [
        {
          command: 'free -h',
          explanation:
            'Shows total, used, free, cache, available memory and swap utilization.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Shows memory, runnable processes, swap-in, swap-out, I/O and CPU activity every second.'
        },
        {
          command: 'cat /proc/meminfo',
          explanation:
            'Provides detailed Linux memory statistics.'
        },
        {
          command: 'grep -E "MemTotal|MemAvailable|SwapTotal|SwapFree" /proc/meminfo',
          explanation:
            'Displays the most important high-level memory and swap values.'
        },
        {
          command: 'ps -eo pid,user,%mem,rss,vsz,cmd --sort=-%mem | head',
          explanation:
            'Shows the processes consuming the most memory.'
        }
      ],

      productionScenario:
        `Monitoring reports 95% memory utilization.

The application team believes MongoDB has a memory leak.

The DBA checks free -h and sees that available memory is still healthy and swap activity is zero.

vmstat also shows si=0 and so=0.

The high utilization is largely expected Linux caching behavior rather than evidence of a memory leak.`,

      troubleshootingApproach:
        `1. Check free -h.
2. Focus on available memory, not only free memory.
3. Check swap usage.
4. Use vmstat to look for active swapping.
5. Identify memory-heavy processes.
6. Check MongoDB WiredTiger cache statistics.
7. Look for OOM events if processes were terminated.
8. Correlate memory pressure with latency.`,

      commonMistakes: [
        'Treating low free memory as an emergency.',
        'Looking at swap allocation but not swap activity.',
        'Assuming all mongod resident memory is WiredTiger cache.',
        'Disabling swap without understanding organizational and operating-system policy.'
      ],

      bestPractices: [
        'Monitor available memory.',
        'Monitor swap-in and swap-out rates.',
        'Correlate OS memory with WiredTiger metrics.',
        'Maintain enough memory headroom for the operating system and other processes.'
      ],

      interviewAnswer:
        'For MongoDB memory troubleshooting I use free -h, vmstat and /proc/meminfo. I focus on MemAvailable and active swap-in/swap-out rather than free memory alone. I also correlate Linux memory pressure with WiredTiger cache statistics because WiredTiger cache and OS filesystem cache are separate memory consumers.',

      keyTakeaways: [
        'Low free memory alone is not proof of a problem.',
        'Available memory is more informative.',
        'Active swapping can significantly impact MongoDB latency.',
        'OS memory and WiredTiger cache should be investigated together.'
      ]
    }
  },

  // ============================================================
  // QUESTION 5
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 5,

    question:
      'How do you check filesystem capacity, MongoDB disk consumption and large files using df and du?',

    level: 'Foundation',
    difficulty: 'Beginner',
    order: 5,

    answer: {

      groundZero:
        'df and du answer different questions. df shows filesystem capacity while du estimates space consumed by directories and files.',

      coreConcept:
        'A MongoDB DBA should use df to determine whether the filesystem is becoming full and du to determine which directories or files are consuming space.',

      detailedExplanation:
        `Disk-full incidents are common and potentially serious.

df reports filesystem-level usage.

du reports file and directory usage.

For example:

df -h /data/db

may show:

Filesystem    Size Used Avail Use%
/dev/xvdb     1T   950G  50G  95%

The DBA can then use du to identify large paths.

MongoDB files may include collection data, indexes, WiredTiger metadata, journal files, diagnostic data and logs depending on configuration.

Deleting documents from MongoDB does not necessarily mean the filesystem immediately returns the same amount of space to the operating system.`,

      internalWorking:
        `Filesystem
    |
    +--> MongoDB dbPath
    |       |
    |       +--> collection/index files
    |       +--> journal
    |       +--> WiredTiger metadata
    |
    +--> MongoDB logs
    |
    +--> OS/application files

df measures filesystem allocation.

du walks directory entries and estimates file usage.`,

      architecture:
        `Disk
 |
 +--> Filesystem
       |
       +--> /data/db
       +--> /var/log/mongodb
       +--> backups
       +--> other files`,

      examples: [
        'df reports 96% usage while du identifies an old backup directory consuming hundreds of GB.',
        'MongoDB data files remain large even after many documents are deleted.',
        'Logs can consume the root filesystem even when MongoDB data is stored on a different mount.'
      ],

      commands: [
        {
          command: 'df -h',
          explanation:
            'Shows filesystem usage in human-readable units.'
        },
        {
          command: 'df -h /data/db',
          explanation:
            'Shows usage of the filesystem containing the MongoDB data directory.'
        },
        {
          command: 'du -sh /data/db',
          explanation:
            'Shows approximate total disk usage under the MongoDB data directory.'
        },
        {
          command: 'du -xhd1 /data 2>/dev/null | sort -h',
          explanation:
            'Shows first-level directory usage on the same filesystem and sorts it by size.'
        },
        {
          command: 'find /data -xdev -type f -size +1G -ls 2>/dev/null',
          explanation:
            'Finds files larger than 1 GB on the specified filesystem.'
        },
        {
          command: 'df -i',
          explanation:
            'Checks inode utilization, which can cause allocation failures even when byte capacity remains.'
        }
      ],

      productionScenario:
        `Monitoring reports the MongoDB filesystem at 96%.

The DBA first confirms the correct mount with df.

du reveals MongoDB occupies 700 GB but an abandoned backup directory consumes another 220 GB.

Instead of deleting MongoDB data, the team safely removes or relocates the obsolete backup after validation.`,

      troubleshootingApproach:
        `1. Determine which filesystem is full.
2. Check byte utilization using df -h.
3. Check inode utilization using df -i.
4. Identify large directories using du.
5. Identify unexpectedly large files.
6. Separate MongoDB data, MongoDB logs and backup consumption.
7. Never delete WiredTiger data files manually.
8. Resolve the correct consumer of disk space.`,

      commonMistakes: [
        'Deleting files from dbPath manually.',
        'Assuming MongoDB is responsible for all filesystem usage.',
        'Ignoring inode exhaustion.',
        'Expecting document deletion to immediately shrink physical files.'
      ],

      bestPractices: [
        'Monitor disk capacity before it becomes critical.',
        'Keep MongoDB data and logs on appropriately sized filesystems.',
        'Use retention policies for backups and logs.',
        'Never manually delete WiredTiger files.'
      ],

      interviewAnswer:
        'I use df -h to identify filesystem utilization and du to identify which directories consume the space. I also check df -i for inode exhaustion. If the MongoDB filesystem is nearly full, I separate dbPath usage, logs and backup files before taking action, and I never manually delete WiredTiger files.',

      keyTakeaways: [
        'df and du measure different things.',
        'Check both capacity and inode usage.',
        'Identify the actual disk consumer before deleting anything.',
        'Never manually remove MongoDB data files.'
      ]
    }
  },

  // ============================================================
  // QUESTION 6
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 6,

    question:
      'How do you analyze MongoDB disk I/O performance using iostat, and which metrics are important during production troubleshooting?',

    level: 'L2',
    difficulty: 'Intermediate',
    order: 6,

    answer: {

      groundZero:
        'MongoDB relies heavily on storage. Even when CPU and memory appear healthy, high storage latency can slow queries, checkpoints, replication and writes.',

      coreConcept:
        'iostat provides device-level I/O statistics. A MongoDB DBA should correlate latency, utilization, queueing and throughput rather than interpreting one metric in isolation.',

      detailedExplanation:
        `The commonly used command is:

iostat -xz 1

Important metrics vary somewhat by sysstat version but typically include:

r/s
w/s
rkB/s
wkB/s
r_await
w_await
aqu-sz
%util

await represents average I/O completion time from the operating system perspective.

High latency can affect MongoDB even when throughput does not appear exceptionally high.

%util can indicate device activity but must be interpreted carefully, especially with modern storage, RAID, cloud block storage and parallel devices.`,

      internalWorking:
        `MongoDB
   |
WiredTiger
   |
Filesystem
   |
Linux Block Layer
   |
Storage Device

iostat measures activity primarily around the Linux block-device layer.

This does not replace MongoDB metrics but helps determine whether storage is contributing to latency.`,

      architecture:
        `mongod
   |
   v
Filesystem
   |
   v
Linux Block I/O
   |
   v
EBS / SAN / SSD / Disk`,

      examples: [
        'A secondary falls behind because disk write latency is much higher than on other members.',
        'Checkpoint activity coincides with increased write latency.',
        'A backup operation increases storage throughput and affects production latency.',
        'High disk queue depth can indicate the storage subsystem is unable to service I/O promptly.'
      ],

      commands: [
        {
          command: 'iostat -xz 1',
          explanation:
            'Displays extended per-device I/O statistics every second.'
        },
        {
          command: 'iostat -xz 1 10',
          explanation:
            'Captures ten samples for comparison rather than relying on one instantaneous measurement.'
        },
        {
          command: 'lsblk',
          explanation:
            'Maps Linux block devices and mount relationships.'
        },
        {
          command: 'findmnt /data/db',
          explanation:
            'Identifies the filesystem and backing device used by the MongoDB data directory.'
        }
      ],

      productionScenario:
        `A secondary accumulates 2,000 seconds of replication lag.

CPU is moderate and network connectivity is healthy.

iostat shows substantially higher write latency on that secondary compared with the other members.

The DBA investigates the underlying storage rather than manipulating replica-set priorities as the first response.`,

      troubleshootingApproach:
        `1. Identify the device backing dbPath.
2. Run iostat with repeated samples.
3. Examine read/write latency.
4. Examine throughput.
5. Examine queue depth.
6. Examine device utilization.
7. Correlate timestamps with MongoDB latency and replication lag.
8. Compare against healthy replica-set members.
9. Investigate infrastructure or workload causes.`,

      commonMistakes: [
        'Using only %util to declare the disk saturated.',
        'Looking at a single iostat sample.',
        'Ignoring differences between cloud storage and local disks.',
        'Assuming replication lag is always caused by the network.'
      ],

      bestPractices: [
        'Collect multiple samples.',
        'Know storage-performance baseline.',
        'Compare replica-set members.',
        'Correlate disk metrics with MongoDB checkpoints, writes and replication.'
      ],

      interviewAnswer:
        'I use iostat -xz with repeated samples and correlate r_await, w_await, queue depth, throughput and device utilization with MongoDB metrics. If only one replica-set member has high latency and replication lag, I compare its storage metrics with the healthy members before deciding whether the cause is MongoDB or infrastructure.',

      keyTakeaways: [
        'Disk latency can directly affect MongoDB.',
        'iostat should be interpreted using multiple metrics.',
        'Repeated samples are more useful than snapshots.',
        'Compare affected and healthy replica-set members.'
      ]
    }
  },

  // ============================================================
  // QUESTION 7
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 7,

    question:
      'How do you identify the filesystem and mount used by MongoDB using lsblk, findmnt, mount and blkid?',

    level: 'L2',
    difficulty: 'Intermediate',
    order: 7,

    answer: {

      groundZero:
        'The MongoDB dbPath is a directory, but that directory ultimately resides on a Linux filesystem backed by one or more storage devices.',

      coreConcept:
        'A DBA should know how the MongoDB dbPath maps to the filesystem and block device so that disk capacity, mount configuration and storage incidents can be investigated correctly.',

      detailedExplanation:
        `Suppose MongoDB uses:

/data/db

The DBA should determine:

Which filesystem contains /data/db?

Which block device backs that filesystem?

What filesystem type is being used?

What mount options are applied?

Is the filesystem actually mounted after reboot?

Commands such as findmnt and lsblk make this relationship easier to understand.`,

      internalWorking:
        `MongoDB dbPath
    |
    v
/data/db
    |
    v
Filesystem mount
    |
    v
Block device
    |
    v
Physical/cloud storage`,

      architecture:
        `/data/db
   |
findmnt
   |
/data
   |
lsblk
   |
/dev/xvdb1
   |
Storage`,

      examples: [
        'After reboot, MongoDB starts before the expected data volume is mounted.',
        'The DBA accidentally checks root filesystem capacity instead of the MongoDB data filesystem.',
        'A filesystem becomes read-only after an infrastructure problem.',
        'A newly attached disk exists but is not mounted at the expected path.'
      ],

      commands: [
        {
          command: 'lsblk -f',
          explanation:
            'Shows block devices together with filesystem type, UUID and mount points.'
        },
        {
          command: 'findmnt /data/db',
          explanation:
            'Identifies the filesystem containing the MongoDB data directory.'
        },
        {
          command: 'findmnt',
          explanation:
            'Displays currently mounted filesystems in a structured tree.'
        },
        {
          command: 'mount | column -t',
          explanation:
            'Displays active mounts and mount options.'
        },
        {
          command: 'blkid',
          explanation:
            'Displays filesystem UUID and type information where permissions permit.'
        },
        {
          command: 'cat /etc/fstab',
          explanation:
            'Shows filesystems configured to mount automatically at boot.'
        }
      ],

      productionScenario:
        `After an OS reboot MongoDB fails to start.

The DBA checks /data/db and notices it exists but the expected data volume is not mounted.

findmnt shows /data/db is currently part of the root filesystem.

The DBA stops further startup attempts and coordinates mounting the correct data volume before MongoDB is started.`,

      troubleshootingApproach:
        `1. Identify configured MongoDB dbPath.
2. Check the mount containing dbPath.
3. Verify the expected block device.
4. Verify filesystem type.
5. Review mount options.
6. Compare against /etc/fstab.
7. Confirm expected volume mounted after reboot.
8. Only then start mongod if appropriate.`,

      commonMistakes: [
        'Assuming a directory existing means the expected disk is mounted.',
        'Starting MongoDB on an empty underlying mount point.',
        'Changing fstab without validation.',
        'Mounting storage while mongod is actively using an unexpected path.'
      ],

      bestPractices: [
        'Document dbPath-to-device mapping.',
        'Verify mounts after infrastructure maintenance.',
        'Use stable UUID-based mount configuration where appropriate.',
        'Coordinate filesystem changes with the Linux/storage team.'
      ],

      interviewAnswer:
        'I use findmnt on the MongoDB dbPath to identify the filesystem and then lsblk -f to map that filesystem to its block device. I check mount options and /etc/fstab when troubleshooting reboot or mounting problems. I never assume that because /data/db exists, the intended MongoDB volume is actually mounted.',

      keyTakeaways: [
        'Directory existence does not prove the correct filesystem is mounted.',
        'findmnt maps paths to filesystems.',
        'lsblk maps filesystems to block devices.',
        'Mount verification is important after reboots and maintenance.'
      ]
    }
  },

  // ============================================================
  // QUESTION 8
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 8,

    question:
      'How should MongoDB dbPath and log-directory ownership and permissions be configured on Linux, and how do you troubleshoot Permission denied errors?',

    level: 'L2',
    difficulty: 'Intermediate',
    order: 8,

    answer: {

      groundZero:
        'The Linux account running mongod must have appropriate access to MongoDB data, journal and log paths. Incorrect ownership or permissions can prevent MongoDB from starting or writing data.',

      coreConcept:
        'MongoDB filesystem permissions should follow least privilege while ensuring the mongod service account can read and write the required paths.',

      detailedExplanation:
        `A typical package installation runs MongoDB as a dedicated account such as mongodb or mongod depending on distribution and packaging.

The exact account must be verified rather than assumed.

If dbPath is:

/data/db

and mongod runs as user mongod, that user must be able to traverse parent directories and read/write the MongoDB data directory.

Similarly, if logs are written to:

/var/log/mongodb/mongod.log

the service account requires appropriate access.

Permission failures can occur after:

manual file copies
restore operations
OS migrations
storage remounts
running commands as root
changing directories
patching or automation mistakes.`,

      internalWorking:
        `Linux permission check:

mongod process
     |
     v
UID / GID
     |
     v
directory ownership
     |
     v
mode bits / ACL / security controls
     |
     v
allow or deny access`,

      architecture:
        `mongod user
    |
    +--> dbPath
    |
    +--> journal
    |
    +--> logPath
    |
    +--> keyFile / certificate paths`,

      examples: [
        'A restore performed as root leaves files owned by root and mongod later cannot access them.',
        'A newly created /data/db belongs to ec2-user instead of the MongoDB service user.',
        'The log directory is writable but the existing log file itself has incorrect ownership.'
      ],

      commands: [
        {
          command: 'ps -ef | grep [m]ongod',
          explanation:
            'Identifies the Linux account currently running mongod.'
        },
        {
          command: 'ls -ld /data /data/db',
          explanation:
            'Displays directory ownership and permission bits.'
        },
        {
          command: 'ls -l /var/log/mongodb/',
          explanation:
            'Displays MongoDB log file ownership and permissions.'
        },
        {
          command: 'namei -l /data/db',
          explanation:
            'Shows permissions for every component of the path, useful when a parent directory prevents traversal.'
        },
        {
          command: 'sudo chown -R mongod:mongod /data/db',
          explanation:
            'Example ownership correction only when mongod:mongod is confirmed to be the correct service account. Never run blindly.'
        }
      ],

      productionScenario:
        `After copying MongoDB files during maintenance, mongod fails with Permission denied.

The DBA checks the service user and compares it with ownership under dbPath.

Several files are owned by root.

After verifying that these files should belong to the MongoDB service account, ownership is corrected and mongod starts normally.`,

      troubleshootingApproach:
        `1. Read the exact MongoDB startup error.
2. Identify the mongod Linux user.
3. Check dbPath ownership.
4. Check each parent directory.
5. Check logPath.
6. Check security files such as keyFiles/certificates if relevant.
7. Check SELinux/AppArmor where applicable.
8. Correct only the required permissions.
9. Start MongoDB and verify logs.`,

      commonMistakes: [
        'Using chmod 777 as a generic fix.',
        'Recursively changing ownership without confirming the correct service account.',
        'Ignoring parent-directory traversal permissions.',
        'Running administrative file operations as root and leaving ownership inconsistent.'
      ],

      bestPractices: [
        'Use a dedicated MongoDB service account.',
        'Apply least-privilege permissions.',
        'Verify ownership after restore or filesystem operations.',
        'Avoid world-writable MongoDB directories.'
      ],

      interviewAnswer:
        'I first identify the user running mongod, then check dbPath, logPath and every parent directory using ls and namei. I avoid chmod 777. If ownership is incorrect, I correct it only after confirming the expected MongoDB service user and then validate the MongoDB logs after restart.',

      keyTakeaways: [
        'mongod needs appropriate filesystem permissions.',
        'Check ownership and parent-directory permissions.',
        'Avoid insecure chmod 777 fixes.',
        'Restore and maintenance operations often cause ownership problems.'
      ]
    }
  },

  // ============================================================
  // QUESTION 9
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 9,

    question:
      'What are Linux ulimits and file descriptors, why are they important for MongoDB, and how do you check the limits applied to mongod?',

    level: 'L2',
    difficulty: 'Intermediate',
    order: 9,

    answer: {

      groundZero:
        'Linux limits how many resources a process can use. One important resource is the number of open file descriptors.',

      coreConcept:
        'MongoDB opens files and network sockets. If the operating-system resource limits applied to mongod are too restrictive, MongoDB can experience failures even when hardware capacity remains available.',

      detailedExplanation:
        `A file descriptor is an integer handle used by Linux processes for open resources such as:

files
network sockets
pipes
devices

MongoDB may require many file descriptors depending on workload and connection count.

Linux exposes soft and hard resource limits.

A common mistake is running:

ulimit -n

from an interactive shell and assuming the same value applies to mongod.

If MongoDB is started by systemd, the actual service limits should be checked through systemd or /proc/PID/limits.`,

      internalWorking:
        `mongod
  |
  +--> data files
  +--> index files
  +--> network sockets
  +--> log files
  +--> internal descriptors
          |
          v
      File Descriptor Table
          |
          v
      OS process limit`,

      architecture:
        `Linux resource limits
        |
        v
mongod process
        |
        +--> open files
        +--> sockets
        +--> other descriptors`,

      examples: [
        'A large connection count consumes many socket file descriptors.',
        'An interactive shell can have a different nofile limit from the mongod systemd service.',
        'A service restart may apply a new limit even when the current process still has the old limit.'
      ],

      commands: [
        {
          command: 'ulimit -n',
          explanation:
            'Displays the current shell soft limit for open files; it does not necessarily represent the mongod service limit.'
        },
        {
          command: 'cat /proc/$(pidof mongod)/limits',
          explanation:
            'Displays the limits actually applied to the running mongod process.'
        },
        {
          command: 'ls /proc/$(pidof mongod)/fd | wc -l',
          explanation:
            'Counts currently open file descriptors for mongod.'
        },
        {
          command: 'systemctl show mongod | grep -i LimitNOFILE',
          explanation:
            'Shows the file-descriptor limit configured or applied through systemd.'
        },
        {
          command: 'systemctl cat mongod',
          explanation:
            'Displays the service definition and drop-in configuration.'
        }
      ],

      productionScenario:
        `An application begins opening many connections and MongoDB eventually reports resource-related failures.

The DBA checks:

/proc/PID/limits

and current descriptor usage.

The process limit is unexpectedly low due to an incorrect systemd override introduced during an OS change.

The service configuration is corrected following change procedure.`,

      troubleshootingApproach:
        `1. Identify mongod PID.
2. Inspect /proc/PID/limits.
3. Count current open descriptors.
4. Check connection count.
5. Inspect systemd service limits.
6. Compare configuration to organizational/MongoDB recommendations.
7. Modify using controlled configuration management if required.
8. Restart only when necessary for the new limit to apply.`,

      commonMistakes: [
        'Checking only shell ulimit values.',
        'Increasing limits without understanding current usage.',
        'Changing system limits without change control.',
        'Ignoring abnormal connection growth that caused descriptor consumption.'
      ],

      bestPractices: [
        'Check limits on the actual mongod process.',
        'Monitor both current connections and resource limits.',
        'Configure persistent limits through the service management mechanism.',
        'Investigate why resource usage increased instead of only increasing limits.'
      ],

      interviewAnswer:
        'Linux file descriptors represent open resources such as files and network sockets. MongoDB can consume many descriptors, especially with many connections. I check the actual mongod limits in /proc/PID/limits and systemd rather than relying only on ulimit -n from my login shell.',

      keyTakeaways: [
        'File descriptors are process resources.',
        'mongod limits may differ from shell limits.',
        '/proc/PID/limits shows the actual running-process limits.',
        'Resource exhaustion should trigger both limit and workload analysis.'
      ]
    }
  },

  // ============================================================
  // QUESTION 10
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 10,

    question:
      'What is Transparent Huge Pages (THP), why is it relevant to MongoDB, and how do you verify its configuration on Linux?',

    level: 'L2',
    difficulty: 'Intermediate',
    order: 10,

    answer: {

      groundZero:
        'Linux normally manages memory in pages. Transparent Huge Pages is a Linux mechanism that can automatically use larger memory pages for applications.',

      coreConcept:
        'THP behavior can affect database workload latency and should be configured according to the recommendations for the MongoDB version and operating-system environment being used.',

      detailedExplanation:
        `Transparent Huge Pages attempts to improve some workloads by using larger memory pages automatically.

Historically, databases including MongoDB have had important THP configuration considerations because page compaction and memory-management behavior can affect latency.

MongoDB recommendations around THP have changed across versions and platforms, so an experienced DBA should not blindly copy an old command from an outdated runbook.

The first step is always to determine:

MongoDB version
Linux distribution/version
current THP state
MongoDB's applicable recommendation

THP state is commonly exposed under:

/sys/kernel/mm/transparent_hugepage/

Depending on the kernel, files may include:

enabled
defrag

The active option is normally shown inside square brackets.`,

      internalWorking:
        `Normal memory pages
       |
       v
Linux memory manager
       |
       +--> standard pages
       |
       +--> huge pages / THP behavior
               |
               v
          application memory

THP can affect allocation, compaction and memory-management behavior.`,

      architecture:
        `mongod
   |
   v
Linux Virtual Memory
   |
   v
Transparent Huge Pages settings
   |
   v
Physical RAM`,

      examples: [
        'A DBA verifies THP configuration after OS patching because kernel settings may have changed.',
        'A server rebuild uses different THP defaults from the previous Linux version.',
        'An old operational document recommends a setting that may no longer match the MongoDB version currently deployed.'
      ],

      commands: [
        {
          command: 'cat /sys/kernel/mm/transparent_hugepage/enabled',
          explanation:
            'Displays the current THP enabled policy where this kernel interface exists.'
        },
        {
          command: 'cat /sys/kernel/mm/transparent_hugepage/defrag',
          explanation:
            'Displays THP defragmentation policy where available.'
        },
        {
          command: 'grep -i huge /proc/meminfo',
          explanation:
            'Displays huge-page related kernel memory statistics.'
        },
        {
          command: 'uname -r',
          explanation:
            'Displays the running Linux kernel version.'
        },
        {
          command: 'mongod --version',
          explanation:
            'Displays MongoDB server version so recommendations can be matched to the deployed release.'
        }
      ],

      productionScenario:
        `Following an operating-system upgrade, MongoDB latency behavior changes.

Rather than immediately modifying THP, the DBA compares:

old OS/kernel
new OS/kernel
MongoDB version
current THP state
MongoDB's recommendation for that version

Any required change is then implemented persistently through the approved operating-system configuration mechanism.`,

      troubleshootingApproach:
        `1. Check MongoDB version.
2. Check Linux distribution and kernel.
3. Inspect current THP settings.
4. Check whether settings changed after maintenance.
5. Compare against the recommendation appropriate for the deployed MongoDB version.
6. Avoid making runtime changes without understanding persistence.
7. Validate after reboot if the change is intended to survive reboot.`,

      commonMistakes: [
        'Blindly applying old THP commands from older MongoDB documentation.',
        'Changing THP without verifying MongoDB version.',
        'Making a runtime change but forgetting persistent configuration.',
        'Attributing every latency incident to THP without evidence.'
      ],

      bestPractices: [
        'Treat THP as a version-dependent operating-system tuning consideration.',
        'Verify after OS patching or server rebuild.',
        'Document persistent configuration.',
        'Validate the current MongoDB recommendation before modifying production.'
      ],

      interviewAnswer:
        'Transparent Huge Pages is a Linux memory-management feature that automatically uses larger memory pages. It has historically been important for MongoDB latency behavior. I verify its current state under /sys/kernel/mm/transparent_hugepage and always check the recommendation for the exact MongoDB and OS version rather than blindly applying an old tuning command.',

      keyTakeaways: [
        'THP is controlled by the Linux memory subsystem.',
        'MongoDB THP guidance is version dependent.',
        'Check the actual current state before changing anything.',
        'Persistent configuration must survive reboot.'
      ]
    }
  },
  // ============================================================
  // QUESTION 11
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 11,

    question:
      'What is vm.swappiness, how does Linux swap behavior affect MongoDB, and how should a DBA evaluate it in production?',

    level: 'L3',
    difficulty: 'Advanced',
    order: 11,

    answer: {

      groundZero:
        'Swap allows Linux to move memory pages from RAM to disk-backed swap space. Because disk is much slower than RAM, heavy swap activity can significantly increase MongoDB latency.',

      coreConcept:
        'vm.swappiness influences how aggressively Linux considers swap. A MongoDB DBA should evaluate actual memory pressure and swap activity instead of changing swappiness blindly.',

      detailedExplanation:
        `vm.swappiness is a Linux virtual-memory parameter.

It influences how strongly the kernel prefers reclaiming anonymous memory through swap compared with reclaiming filesystem cache.

The value alone does not tell you whether MongoDB is suffering.

A DBA should examine:

MemAvailable
swap usage
swap-in rate
swap-out rate
page faults
WiredTiger cache pressure
application latency
other memory-consuming processes

Commands such as vmstat are particularly useful because the si and so columns indicate active swap-in and swap-out activity.

A system may have some swap allocated but currently perform no swapping.

That is very different from continuous swap activity during a production incident.`,

      internalWorking:
        `RAM pressure
    |
    v
Linux memory reclaim
    |
    +--> reclaim filesystem cache
    |
    +--> move eligible pages to swap
              |
              v
          Disk I/O

If pages required by mongod must later be read from swap, access latency can become much higher than RAM access.`,

      architecture:
        `mongod
   |
   v
Virtual Memory
   |
   +--> RAM
   |
   +--> Swap
          |
          v
         Disk`,

      examples: [
        'Swap space may be partially used from an older pressure event while current si/so values remain zero.',
        'A large backup or unrelated process may create memory pressure that indirectly affects MongoDB.',
        'High swap-in and swap-out activity can coincide with severe query latency.'
      ],

      commands: [
        {
          command: 'sysctl vm.swappiness',
          explanation:
            'Displays the current vm.swappiness setting.'
        },
        {
          command: 'cat /proc/sys/vm/swappiness',
          explanation:
            'Reads the same kernel parameter directly from procfs.'
        },
        {
          command: 'free -h',
          explanation:
            'Displays RAM and swap capacity and usage.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Shows active swap-in and swap-out using the si and so columns.'
        },
        {
          command: 'sar -W 1 10',
          explanation:
            'Displays swap paging activity on systems with sysstat installed.'
        }
      ],

      productionScenario:
        `MongoDB latency increases and monitoring shows swap space in use.

The DBA does not immediately assume current swapping.

vmstat shows si and so continuously above zero while MemAvailable is very low.

A newly started analytics process is consuming several GB of RAM.

The actual cause is system-wide memory pressure, not MongoDB alone.`,

      troubleshootingApproach:
        `1. Check available RAM.
2. Check total swap usage.
3. Check active swap-in and swap-out.
4. Identify top memory consumers.
5. Check WiredTiger cache pressure.
6. Check whether workload changed.
7. Review current swappiness.
8. Follow MongoDB and OS recommendations appropriate to the environment.
9. Fix the underlying memory-pressure cause.`,

      commonMistakes: [
        'Assuming any non-zero swap usage means active swapping.',
        'Setting swappiness without understanding system workload.',
        'Disabling swap in production without operational review.',
        'Ignoring other memory-consuming applications.'
      ],

      bestPractices: [
        'Monitor active swap rates rather than only swap capacity.',
        'Keep adequate memory headroom.',
        'Correlate Linux memory pressure with WiredTiger metrics.',
        'Treat kernel tuning as controlled infrastructure configuration.'
      ],

      interviewAnswer:
        'vm.swappiness influences Linux swap behavior, but I do not troubleshoot MongoDB based on that value alone. I check MemAvailable, free -h, vmstat si/so, process memory and WiredTiger cache statistics. Continuous swapping is much more important than simply seeing some swap space allocated.',

      keyTakeaways: [
        'Swap is much slower than RAM.',
        'Swap usage and active swapping are different.',
        'vmstat si/so are important production indicators.',
        'Tune only after identifying actual memory pressure.'
      ]
    }
  },

  // ============================================================
  // QUESTION 12
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 12,

    question:
      'How do you manage MongoDB using systemd, and which systemctl commands should a DBA know for production administration?',

    level: 'L3',
    difficulty: 'Advanced',
    order: 12,

    answer: {

      groundZero:
        'On many modern Linux distributions, MongoDB is managed as a systemd service. systemd controls service startup, shutdown, restart behavior and boot-time enablement.',

      coreConcept:
        'A MongoDB DBA should understand the difference between starting a service now, enabling it at boot, checking its state and inspecting the effective service configuration.',

      detailedExplanation:
        `Typical MongoDB packages install a systemd unit such as:

mongod.service

Important operations include:

start
stop
restart
status
enable
disable
is-active
is-enabled

Starting a service affects the current operating session.

Enabling a service configures it to start automatically according to systemd dependencies during future boots.

A production DBA should avoid unnecessary restarts because a restart affects replica-set state, application connectivity and possibly elections.`,

      internalWorking:
        `systemd
   |
   v
mongod.service
   |
   +--> ExecStart
   +--> service user
   +--> resource limits
   +--> environment
   +--> restart behavior
   |
   v
mongod process`,

      architecture:
        `Linux boot
   |
systemd
   |
mongod.service
   |
mongod process
   |
MongoDB replica set`,

      examples: [
        'A secondary is patched and mongod must be restarted in a controlled maintenance sequence.',
        'mongod starts manually but does not return after reboot because the service is disabled.',
        'A systemd override changes the file descriptor limit applied to MongoDB.'
      ],

      commands: [
        {
          command: 'sudo systemctl status mongod',
          explanation:
            'Displays the current MongoDB service status and recent service messages.'
        },
        {
          command: 'sudo systemctl start mongod',
          explanation:
            'Starts the MongoDB service.'
        },
        {
          command: 'sudo systemctl stop mongod',
          explanation:
            'Stops the MongoDB service using systemd.'
        },
        {
          command: 'sudo systemctl restart mongod',
          explanation:
            'Stops and starts MongoDB. Use carefully in replica-set production environments.'
        },
        {
          command: 'sudo systemctl enable mongod',
          explanation:
            'Configures MongoDB to start automatically at boot.'
        },
        {
          command: 'systemctl is-active mongod',
          explanation:
            'Checks whether the service is currently active.'
        },
        {
          command: 'systemctl is-enabled mongod',
          explanation:
            'Checks whether the service is enabled for automatic startup.'
        },
        {
          command: 'systemctl cat mongod',
          explanation:
            'Displays the unit file and any systemd drop-in overrides.'
        }
      ],

      productionScenario:
        `After a server reboot, MongoDB remains down.

systemctl status shows the service is inactive.

systemctl is-enabled shows disabled.

The DBA confirms that the service should start automatically and enables it through the approved change process.`,

      troubleshootingApproach:
        `1. Check systemctl status.
2. Check whether the service is active.
3. Check whether it is enabled.
4. Inspect journal messages.
5. Inspect the MongoDB log.
6. Review the systemd unit and overrides.
7. Confirm permissions and paths.
8. Start the service only after understanding startup failure.`,

      commonMistakes: [
        'Repeatedly restarting MongoDB without reading the startup error.',
        'Confusing enabled with currently running.',
        'Restarting the primary without checking replica-set health.',
        'Editing vendor unit files directly instead of using supported overrides.'
      ],

      bestPractices: [
        'Check replica-set health before planned restarts.',
        'Use systemctl status and journalctl together.',
        'Use controlled systemd overrides when required.',
        'Verify automatic startup after maintenance.'
      ],

      interviewAnswer:
        'I manage MongoDB services with systemctl. I distinguish between start, which affects the current state, and enable, which controls boot-time startup. Before restarting a replica-set member I verify replication health and role, and when startup fails I inspect systemctl status, journalctl and the MongoDB log before retrying.',

      keyTakeaways: [
        'systemd commonly manages mongod.',
        'start and enable are different.',
        'Do not restart production members blindly.',
        'Service logs are critical during startup troubleshooting.'
      ]
    }
  },

  // ============================================================
  // QUESTION 13
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 13,

    question:
      'How do you use journalctl and MongoDB logs together to troubleshoot mongod startup or unexpected shutdown events?',

    level: 'L3',
    difficulty: 'Advanced',
    order: 13,

    answer: {

      groundZero:
        'MongoDB logs describe database-level events while journalctl can provide systemd and operating-system service events. Both sources may be required to understand why mongod stopped or failed to start.',

      coreConcept:
        'A strong incident investigation correlates the MongoDB log, systemd journal and Linux system events by timestamp.',

      detailedExplanation:
        `When mongod fails to start, systemctl may only report that the service exited.

The MongoDB log may provide the actual reason, such as:

Permission denied
address already in use
invalid configuration
data directory problem
certificate problem
keyFile permission problem
storage issue

journalctl can show:

service start attempts
exit codes
systemd actions
process termination
boot events

For unexpected shutdowns, the DBA should also distinguish between:

clean shutdown
service stop
SIGTERM
process crash
OOM kill
server reboot
infrastructure shutdown.`,

      internalWorking:
        `systemd
   |
   +--> starts/stops mongod
   |
   +--> records service events in journal
             |
             v
          journalctl

mongod
   |
   +--> writes MongoDB operational logs
             |
             v
         mongod.log

Timeline correlation
       |
       v
Root-cause investigation`,

      architecture:
        `Linux / systemd events
          |
          +--> journalctl
          |
MongoDB events
          |
          +--> mongod.log
          |
          v
Combined timeline`,

      examples: [
        'journalctl shows systemd sent SIGTERM before mongod logged a clean shutdown.',
        'mongod.log shows Permission denied while systemd reports exit status 1.',
        'The server rebooted shortly after MongoDB stopped, indicating a host-level maintenance event.'
      ],

      commands: [
        {
          command: 'journalctl -u mongod',
          explanation:
            'Displays systemd journal messages for the MongoDB service.'
        },
        {
          command: 'journalctl -u mongod --since "1 hour ago"',
          explanation:
            'Limits MongoDB service journal output to a recent period.'
        },
        {
          command: 'journalctl -u mongod -n 100 --no-pager',
          explanation:
            'Shows the most recent service journal entries.'
        },
        {
          command: 'journalctl -b',
          explanation:
            'Displays logs from the current boot.'
        },
        {
          command: 'journalctl -b -1',
          explanation:
            'Displays logs from the previous boot if journal persistence is available.'
        },
        {
          command: 'tail -100 /var/log/mongodb/mongod.log',
          explanation:
            'Displays the latest MongoDB log lines when this is the configured log path.'
        }
      ],

      productionScenario:
        `MongoDB is found down at 12:25.

mongod.log shows SIGTERM at 12:20.

journalctl shows the service was stopped by systemd.

System boot history shows the VM rebooted around 12:30.

The evidence indicates that MongoDB shutdown was part of a host-level shutdown or reboot sequence rather than an unexplained MongoDB crash.`,

      troubleshootingApproach:
        `1. Record the incident time.
2. Read mongod.log around that timestamp.
3. Read journalctl for mongod.
4. Check current and previous boot logs.
5. Check whether a SIGTERM was received.
6. Check for OOM or kernel events.
7. Check reboot/shutdown history.
8. Build a timeline before writing the RCA.`,

      commonMistakes: [
        'Looking only at the MongoDB log.',
        'Calling every shutdown a MongoDB crash.',
        'Ignoring timezone differences between systems.',
        'Restarting before preserving relevant logs.'
      ],

      bestPractices: [
        'Correlate multiple logs by exact timestamp.',
        'Document timezone used in RCA evidence.',
        'Distinguish graceful shutdown from crash.',
        'Preserve logs before rotation or restart.'
      ],

      interviewAnswer:
        'For startup or shutdown incidents I correlate mongod.log with journalctl -u mongod and host boot events. I look for exit codes, SIGTERM, permission errors, configuration failures, OOM events or reboots. I build a timestamped timeline before deciding whether the cause was MongoDB, systemd or the operating system.',

      keyTakeaways: [
        'MongoDB logs and journalctl provide different layers of evidence.',
        'SIGTERM may indicate an intentional service or host shutdown.',
        'Timeline correlation is essential for RCA.',
        'Do not label an incident a crash without evidence.'
      ]
    }
  },

  // ============================================================
  // QUESTION 14
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 14,

    question:
      'How do you troubleshoot MongoDB network connectivity on Linux using ss, nc, curl and related tools?',

    level: 'L3',
    difficulty: 'Advanced',
    order: 14,

    answer: {

      groundZero:
        'A MongoDB connection failure can occur because mongod is not listening, the wrong IP or port is used, DNS resolves incorrectly, routing fails or a firewall/security rule blocks traffic.',

      coreConcept:
        'Network troubleshooting should validate each layer from the MongoDB listener to remote TCP reachability rather than assuming authentication is the first problem.',

      detailedExplanation:
        `A practical troubleshooting sequence is:

1. Is mongod running?
2. Is the expected port listening?
3. Which IP address is it bound to?
4. Can the port be reached locally?
5. Can the port be reached remotely?
6. Does DNS resolve correctly?
7. Are firewall/security-group rules correct?
8. Does mongosh connect after TCP connectivity succeeds?

A TCP connection failure and an authentication failure are different classes of issue.`,

      internalWorking:
        `Client
  |
DNS
  |
Routing
  |
Firewall / Security Group
  |
Linux TCP stack
  |
Listening socket
  |
mongod`,

      architecture:
        `Application
    |
    v
DNS resolution
    |
    v
Network path
    |
    v
Firewall
    |
    v
Host:port
    |
    v
mongod`,

      examples: [
        'mongod is healthy but listening only on localhost.',
        'The application uses the wrong MongoDB port.',
        'A security group blocks access from the application subnet.',
        'TCP connectivity works but authentication fails afterward.'
      ],

      commands: [
        {
          command: 'ss -lntp | grep 27017',
          explanation:
            'Checks whether a process is listening on TCP port 27017.'
        },
        {
          command: 'ss -ant | grep 27017',
          explanation:
            'Shows TCP connections involving MongoDB port 27017.'
        },
        {
          command: 'nc -vz <host> <port>',
          explanation:
            'Tests whether a TCP connection can be established to the target host and port.'
        },
        {
          command: 'curl -v telnet://<host>:<port>',
          explanation:
            'Can be used for a basic TCP connectivity test when curl supports the telnet scheme.'
        },
        {
          command: 'ip addr',
          explanation:
            'Displays local network interfaces and IP addresses.'
        },
        {
          command: 'ip route',
          explanation:
            'Displays the Linux routing table.'
        }
      ],

      productionScenario:
        `A client cannot connect to MongoDB Compass, but the DBA can connect locally.

ss shows MongoDB listening correctly.

The DBA then tests TCP connectivity from the client-side network.

The remote port test fails before authentication occurs.

This directs investigation toward routing/firewall/security-group configuration instead of resetting MongoDB credentials.`,

      troubleshootingApproach:
        `1. Confirm mongod is running.
2. Confirm expected port.
3. Confirm bind IP.
4. Test localhost connectivity.
5. Test remote TCP connectivity.
6. Verify routing.
7. Verify firewall/security rules.
8. Verify DNS.
9. Only after connectivity succeeds, troubleshoot TLS or authentication.`,

      commonMistakes: [
        'Resetting passwords when the TCP connection cannot even be established.',
        'Assuming a listening service is reachable remotely.',
        'Ignoring bindIp configuration.',
        'Using ping success as proof that the MongoDB port is open.'
      ],

      bestPractices: [
        'Troubleshoot layer by layer.',
        'Separate network connectivity from authentication.',
        'Validate from the actual application/client network.',
        'Document ports and network paths.'
      ],

      interviewAnswer:
        'I first confirm mongod is running and listening using ss. Then I test the MongoDB port locally and from the client network using nc or an equivalent TCP test. I verify bind IP, routing and firewall or security-group rules. Only after TCP connectivity succeeds do I troubleshoot TLS, authentication or MongoDB authorization.',

      keyTakeaways: [
        'Listening locally does not guarantee remote reachability.',
        'TCP connectivity and authentication are separate.',
        'ss and nc are important DBA tools.',
        'Troubleshoot networking in layers.'
      ]
    }
  },

  // ============================================================
  // QUESTION 15
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 15,

    question:
      'How do you troubleshoot DNS resolution problems that affect MongoDB replica sets, applications or MongoDB Atlas connections?',

    level: 'L3',
    difficulty: 'Advanced',
    order: 15,

    answer: {

      groundZero:
        'MongoDB environments frequently use hostnames rather than hardcoded IP addresses. If DNS is incorrect or unavailable, clients and replica-set members may fail to connect even though mongod itself is healthy.',

      coreConcept:
        'A DBA should verify hostname resolution from the exact affected server or client, because DNS behavior can differ across machines and networks.',

      detailedExplanation:
        `DNS issues can affect:

replica-set hostnames
application connection strings
MongoDB Atlas SRV records
TLS hostname validation
monitoring systems
backup tools

Useful checks include:

getent hosts
dig
nslookup
/etc/resolv.conf

For Atlas, mongodb+srv connection strings depend on DNS SRV and TXT lookups.

Therefore DNS problems can prevent an otherwise valid Atlas connection string from working.`,

      internalWorking:
        `MongoDB hostname
      |
      v
Resolver configuration
      |
      v
DNS server
      |
      v
A / AAAA / SRV / TXT result
      |
      v
TCP connection`,

      architecture:
        `Client
   |
Resolver
   |
DNS
   |
Resolved MongoDB hosts
   |
TCP/TLS
   |
MongoDB`,

      examples: [
        'A hostname resolves differently from two application servers.',
        'An Atlas mongodb+srv URI fails because SRV lookup is blocked.',
        'TLS fails because the client connects using an IP while the certificate expects a hostname.'
      ],

      commands: [
        {
          command: 'getent hosts <hostname>',
          explanation:
            'Tests hostname resolution using the system resolver configuration.'
        },
        {
          command: 'dig <hostname>',
          explanation:
            'Queries DNS records and displays detailed resolver information.'
        },
        {
          command: 'nslookup <hostname>',
          explanation:
            'Performs a basic DNS lookup.'
        },
        {
          command: 'dig SRV _mongodb._tcp.<atlas-hostname>',
          explanation:
            'Queries an SRV record used by mongodb+srv-style connections.'
        },
        {
          command: 'cat /etc/resolv.conf',
          explanation:
            'Shows configured DNS resolver settings.'
        }
      ],

      productionScenario:
        `An application can reach MongoDB by IP but fails using the hostname in its connection string.

getent hosts returns no result from the application server.

The MongoDB service is healthy.

The issue is escalated as DNS resolution rather than changing MongoDB authentication or replica-set configuration.`,

      troubleshootingApproach:
        `1. Identify the exact hostname being used.
2. Test getent hosts.
3. Test dig or nslookup.
4. Compare healthy and unhealthy clients.
5. Check resolver configuration.
6. Check SRV/TXT records if using Atlas.
7. Validate TCP connectivity after resolution succeeds.
8. Validate TLS hostname matching if TLS is enabled.`,

      commonMistakes: [
        'Testing DNS only from the MongoDB server rather than the affected client.',
        'Hardcoding IP addresses as a permanent workaround.',
        'Ignoring SRV requirements for Atlas.',
        'Changing replica-set hostnames without understanding replication impact.'
      ],

      bestPractices: [
        'Use stable resolvable hostnames.',
        'Validate DNS from every relevant network zone.',
        'Monitor DNS dependencies for Atlas environments.',
        'Avoid unnecessary IP hardcoding.'
      ],

      interviewAnswer:
        'I test DNS from the exact affected host using getent, dig and nslookup. For Atlas I also validate SRV and TXT resolution because mongodb+srv depends on DNS. Once hostname resolution succeeds I continue with TCP and TLS validation.',

      keyTakeaways: [
        'DNS can break MongoDB connectivity even when mongod is healthy.',
        'Always test from the affected client.',
        'Atlas SRV connections depend on DNS.',
        'DNS, TCP and TLS should be tested separately.'
      ]
    }
  },

  // ============================================================
  // QUESTION 16
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 16,

    question:
      'How do you automate MongoDB backup and maintenance tasks using cron, and what production precautions should be taken?',

    level: 'L3+',
    difficulty: 'Scenario',
    order: 16,

    answer: {

      groundZero:
        'cron is a Linux scheduler commonly used to run recurring commands or scripts at specified times.',

      coreConcept:
        'Backup automation should include scheduling, logging, error handling, authentication security, retention and validation rather than simply placing mongodump in crontab.',

      detailedExplanation:
        `A cron entry consists of:

minute
hour
day of month
month
day of week
command

For example:

15 4 * * * /opt/scripts/mongodb_backup.sh

runs every day at 04:15.

However, a production-grade MongoDB backup script should also handle:

correct MongoDB credentials
backup destination
timestamps
exit codes
logging
retention
available disk space
optional compression
replica-set consistency
backup verification
alerting

Credentials should not be exposed directly in world-readable scripts or crontabs.`,

      internalWorking:
        `crond
   |
   v
crontab schedule
   |
   v
backup script
   |
   +--> mongodump
   +--> logging
   +--> validation
   +--> retention
   |
   v
Backup destination`,

      architecture:
        `Linux cron
    |
backup script
    |
MongoDB
    |
backup files
    |
validation / retention`,

      examples: [
        'A daily backup runs at 04:15 and writes stdout/stderr to a dedicated log.',
        'A script checks available disk space before starting a large dump.',
        'Backup retention deletes only validated old backup directories rather than arbitrary files.'
      ],

      commands: [
        {
          command: 'crontab -l',
          explanation:
            'Displays cron entries for the current user.'
        },
        {
          command: 'crontab -e',
          explanation:
            'Edits cron entries for the current user.'
        },
        {
          command: 'systemctl status crond',
          explanation:
            'Checks the cron daemon on RHEL/Amazon Linux-style systems.'
        },
        {
          command: 'sudo systemctl enable --now crond',
          explanation:
            'Enables and starts crond where appropriate and authorized.'
        },
        {
          command: '15 4 * * * /opt/scripts/mongodb_backup.sh >> /var/log/mongodb_backup.log 2>&1',
          explanation:
            'Example cron schedule running a script every day at 04:15 with output redirected to a log.'
        }
      ],

      productionScenario:
        `A scheduled MongoDB backup suddenly stops appearing.

The DBA checks crond status, user crontab, backup-script permissions and backup logs.

The script is failing because the destination filesystem is full.

The root cause is storage capacity, not cron itself.`,

      troubleshootingApproach:
        `1. Confirm crond is active.
2. Verify the correct user's crontab.
3. Confirm schedule syntax.
4. Run the script manually as the same user.
5. Check permissions and environment variables.
6. Check disk space.
7. Check backup logs and exit codes.
8. Validate generated backup data.
9. Monitor future runs.`,

      commonMistakes: [
        'Putting plaintext passwords directly in crontab.',
        'Assuming cron has the same PATH as an interactive shell.',
        'Not logging stdout and stderr.',
        'Creating backups without testing restore.'
      ],

      bestPractices: [
        'Use scripts rather than long crontab commands.',
        'Use secure credential handling.',
        'Log every backup run.',
        'Check backup exit codes.',
        'Test restoration regularly.',
        'Maintain retention policies.'
      ],

      interviewAnswer:
        'I use cron only as the scheduler. The actual MongoDB backup logic goes into a controlled script that handles credentials securely, logs execution, checks exit status, verifies available space, applies retention and supports restore validation. I also ensure crond is enabled so schedules survive reboot.',

      keyTakeaways: [
        'cron schedules tasks but does not make them production-safe automatically.',
        'Backups require logging and validation.',
        'Cron environments may differ from login shells.',
        'Restore testing is part of backup strategy.'
      ]
    }
  },

  // ============================================================
  // QUESTION 17
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 17,

    question:
      'How should MongoDB logs be rotated on Linux, and what is the role of logrotate and MongoDB log rotation mechanisms?',

    level: 'L3+',
    difficulty: 'Scenario',
    order: 17,

    answer: {

      groundZero:
        'MongoDB logs can grow continuously. Without rotation and retention, the log filesystem can eventually become full.',

      coreConcept:
        'Log rotation must safely move or reopen log files without causing mongod to lose logging capability or creating disk-space incidents.',

      detailedExplanation:
        `Linux commonly provides logrotate for rotating application logs.

MongoDB also supports log rotation behavior through its own logging configuration and administrative commands.

The exact implementation should match how MongoDB was installed and configured.

A typical rotation strategy considers:

maximum age
number of retained files
compression
ownership
permissions
disk capacity
MongoDB reopen/rename behavior

The DBA should never simply delete the active mongod.log while assuming mongod will immediately recreate it correctly.`,

      internalWorking:
        `mongod
   |
   v
mongod.log
   |
rotation mechanism
   |
   +--> archived logs
   +--> compressed logs
   +--> new active log`,

      architecture:
        `MongoDB logging
      |
      v
Active log
      |
      v
Rotation
      |
      +--> mongod.log.1
      +--> mongod.log.2.gz
      +--> retention policy`,

      examples: [
        'MongoDB log growth fills the root filesystem even though dbPath is on a separate disk.',
        'A rotation configuration keeps only seven days of compressed logs.',
        'An incorrect logrotate rule changes ownership and prevents MongoDB from reopening the log.'
      ],

      commands: [
        {
          command: 'ls -lh /var/log/mongodb/',
          explanation:
            'Shows MongoDB log files and sizes.'
        },
        {
          command: 'du -sh /var/log/mongodb',
          explanation:
            'Shows total disk usage of the MongoDB log directory.'
        },
        {
          command: 'cat /etc/logrotate.d/mongod',
          explanation:
            'Displays a MongoDB logrotate configuration if present at that path.'
        },
        {
          command: 'logrotate -d /etc/logrotate.conf',
          explanation:
            'Debugs logrotate configuration without performing rotation.'
        },
        {
          command: 'db.adminCommand({ logRotate: 1 })',
          explanation:
            'MongoDB administrative log rotation command, run from mongosh with appropriate privileges.'
        }
      ],

      productionScenario:
        `The root filesystem reaches 92% while MongoDB dbPath usage is stable.

du shows mongod.log has grown extremely large.

The DBA validates current log rotation policy, safely performs rotation using the supported mechanism and implements retention monitoring.`,

      troubleshootingApproach:
        `1. Identify logPath.
2. Check log file size.
3. Check filesystem utilization.
4. Review MongoDB logging configuration.
5. Review logrotate configuration if used.
6. Validate permissions.
7. Test rotation safely.
8. Confirm MongoDB continues writing to the new active log.
9. Verify retention.`,

      commonMistakes: [
        'Deleting the active log blindly.',
        'Using copytruncate without understanding implications.',
        'Ignoring ownership after rotation.',
        'Keeping unlimited historical logs.'
      ],

      bestPractices: [
        'Configure predictable log retention.',
        'Monitor log filesystem capacity.',
        'Use MongoDB-supported rotation behavior.',
        'Test rotation after configuration changes.'
      ],

      interviewAnswer:
        'I monitor MongoDB log growth and use a supported rotation strategy, either MongoDB log rotation behavior integrated with the environment or validated logrotate configuration. After rotation I verify mongod is writing to the new active log and that ownership, compression and retention behave as expected.',

      keyTakeaways: [
        'Logs can cause filesystem exhaustion.',
        'Rotation must preserve MongoDB logging.',
        'Ownership matters after rotation.',
        'Retention should be monitored and tested.'
      ]
    }
  },

  // ============================================================
  // QUESTION 18
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 18,

    question:
      'After an OS reboot or patching activity, MongoDB does not return to PRIMARY or SECONDARY. How do you troubleshoot the problem from Linux and MongoDB layers?',

    level: 'L3+',
    difficulty: 'Scenario',
    order: 18,

    answer: {

      groundZero:
        'A post-reboot MongoDB failure can come from service startup, mounts, permissions, network, DNS, resource limits, configuration or replica-set synchronization.',

      coreConcept:
        'The DBA should first confirm the Linux host is healthy and MongoDB started correctly, then move upward into replica-set troubleshooting.',

      detailedExplanation:
        `After reboot or patching, common problems include:

MongoDB service disabled
expected data disk not mounted
wrong ownership
new firewall state
DNS failure
TLS certificate access issue
keyFile permission issue
configuration error
changed kernel settings
storage latency
large replication gap

The correct investigation proceeds from the operating system upward rather than immediately attempting rs.reconfig or resync.`,

      internalWorking:
        `Server reboot
   |
   v
filesystem mounts
   |
   v
systemd
   |
   v
mongod startup
   |
   v
network connectivity
   |
   v
replica-set heartbeat
   |
   v
SECONDARY / PRIMARY state`,

      architecture:
        `Linux boot
   |
Mounts
   |
systemd
   |
mongod
   |
Network
   |
Replica Set`,

      examples: [
        'MongoDB remains down because the data volume failed to mount.',
        'mongod starts but cannot read the keyFile after permission changes.',
        'The member is reachable but remains RECOVERING due to replication state.',
        'A node has severe disk latency after storage maintenance.'
      ],

      commands: [
        {
          command: 'uptime',
          explanation:
            'Confirms server uptime and whether a recent reboot occurred.'
        },
        {
          command: 'findmnt /data/db',
          explanation:
            'Confirms the expected MongoDB filesystem is mounted.'
        },
        {
          command: 'systemctl status mongod',
          explanation:
            'Checks MongoDB service state.'
        },
        {
          command: 'journalctl -u mongod -b --no-pager | tail -100',
          explanation:
            'Shows MongoDB service journal entries from the current boot.'
        },
        {
          command: 'ss -lntp | grep mongod',
          explanation:
            'Helps verify MongoDB is listening when process information is available.'
        },
        {
          command: 'iostat -xz 1 5',
          explanation:
            'Checks whether storage performance is abnormal after maintenance.'
        }
      ],

      productionScenario:
        `A secondary was patched and rebooted.

The service starts, but the member does not become SECONDARY.

The DBA verifies mounts, service status, logs, network connectivity and then checks replica-set state.

Logs reveal the member has fallen outside its practical synchronization window and requires controlled recovery.

The DBA reaches that conclusion only after eliminating Linux-layer problems.`,

      troubleshootingApproach:
        `1. Verify server uptime.
2. Verify MongoDB filesystem mounts.
3. Verify ownership and permissions.
4. Verify mongod service status.
5. Review journal and mongod logs.
6. Verify listening port.
7. Verify peer connectivity and DNS.
8. Check rs.status().
9. Check replication lag and oplog coverage.
10. Decide whether catch-up, restart or resynchronization is appropriate.`,

      commonMistakes: [
        'Running rs.reconfig before checking the host.',
        'Starting mongod before confirming the correct mount.',
        'Immediately deleting dbPath for resync.',
        'Ignoring storage degradation after OS patching.'
      ],

      bestPractices: [
        'Use a secondary-first patching sequence.',
        'Verify each member returns healthy before continuing.',
        'Check mounts after reboot.',
        'Preserve logs during failed startup investigation.'
      ],

      interviewAnswer:
        'After OS patching I troubleshoot from the bottom up: host health, mounts, permissions, systemd, mongod logs, listening ports, DNS and network, and then replica-set status and lag. I avoid reconfiguring or resyncing until I have confirmed the failure is actually at the MongoDB replication layer.',

      keyTakeaways: [
        'Post-patch failure may originate below MongoDB.',
        'Verify mounts before starting mongod.',
        'Check OS and MongoDB layers in order.',
        'Do not resync without evidence.'
      ]
    }
  },

  // ============================================================
  // QUESTION 19
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 19,

    question:
      'How do you perform an end-to-end Linux and MongoDB performance investigation when users report that the database is slow?',

    level: 'L3+',
    difficulty: 'Expert',
    order: 19,

    answer: {

      groundZero:
        'Database slowness is a symptom. The root cause may be workload, indexing, CPU, memory, storage, network, replication, checkpoint activity or application behavior.',

      coreConcept:
        'An L3 DBA should combine MongoDB and Linux evidence into one timeline rather than troubleshooting each metric independently.',

      detailedExplanation:
        `A strong investigation begins by defining impact:

Which application?
Which operations?
Which nodes?
When did it begin?
Is it continuous or intermittent?

Then capture Linux evidence:

top
mpstat
vmstat
free
iostat
df
ss

Then capture MongoDB evidence:

currentOp
serverStatus
replication state
slow-query logs
explain execution statistics
WiredTiger metrics
connection counts

The important skill is correlation.

For example:

High query latency
+
high w_await
+
checkpoint activity
+
replication lag

may indicate storage pressure.

Whereas:

High CPU
+
very high docsExamined
+
COLLSCAN
+
normal storage latency

points toward inefficient queries.`,

      internalWorking:
        `Application workload
       |
       v
MongoDB query engine
       |
       v
WiredTiger
       |
       v
Linux CPU / Memory / I/O / Network
       |
       v
Infrastructure

Evidence from all layers
       |
       v
Root-cause hypothesis
       |
       v
Validation`,

      architecture:
        `Application
    |
MongoDB
    |
WiredTiger
    |
Linux
    |
Storage / Network / VM`,

      examples: [
        'A slow query incident is actually caused by a storage latency spike.',
        'High CPU is caused by an unindexed query introduced in a new release.',
        'Connection growth creates extra load and amplifies an existing latency incident.',
        'Replication lag appears only on one member due to host-specific disk problems.'
      ],

      commands: [
        {
          command: 'top',
          explanation:
            'Provides an immediate system and process view.'
        },
        {
          command: 'mpstat -P ALL 1',
          explanation:
            'Shows per-CPU utilization.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Shows run queue, memory pressure, swap, I/O and CPU.'
        },
        {
          command: 'iostat -xz 1',
          explanation:
            'Shows storage latency, throughput and queueing.'
        },
        {
          command: 'free -h',
          explanation:
            'Shows memory availability and swap.'
        },
        {
          command: 'df -h',
          explanation:
            'Checks filesystem capacity.'
        },
        {
          command: 'ss -s',
          explanation:
            'Shows a summary of socket usage.'
        }
      ],

      productionScenario:
        `Application latency increases sharply.

CPU is 85%, connections are increasing and a secondary begins lagging.

The DBA initially has several symptoms.

iostat shows write latency increased dramatically at the same time.

currentOp shows many operations waiting longer.

Application retries then increase connection volume.

The likely chain is:

storage latency
→ MongoDB operations slow
→ application retries
→ more connections
→ additional CPU
→ replication lag

Treating these as five unrelated incidents would miss the primary bottleneck.`,

      troubleshootingApproach:
        `1. Define business impact.
2. Establish incident start time.
3. Identify affected nodes.
4. Check CPU and load.
5. Check memory and swap.
6. Check disk capacity.
7. Check disk latency.
8. Check network/socket state.
9. Inspect current MongoDB operations.
10. Check replication.
11. Review slow queries.
12. Check WiredTiger metrics.
13. Review recent changes.
14. Form a root-cause hypothesis.
15. Validate it with evidence before remediation.`,

      commonMistakes: [
        'Treating every alert independently.',
        'Restarting before collecting evidence.',
        'Assuming the highest metric is automatically the root cause.',
        'Making several configuration changes simultaneously.'
      ],

      bestPractices: [
        'Build one incident timeline.',
        'Compare with historical baseline.',
        'Correlate cause and effect.',
        'Change one thing at a time when possible.',
        'Continue RCA even if temporary mitigation restores service.'
      ],

      interviewAnswer:
        'For a general MongoDB slowness incident I first define impact and timeline. I collect Linux CPU, memory, disk and network evidence and correlate it with MongoDB currentOp, serverStatus, replication, WiredTiger and slow-query data. I then form and validate a root-cause hypothesis rather than reacting independently to every alert.',

      keyTakeaways: [
        'Slowness is a symptom.',
        'Correlation is more important than individual metrics.',
        'One bottleneck can generate many secondary symptoms.',
        'Evidence-driven troubleshooting is an L3 DBA skill.'
      ]
    }
  },

  // ============================================================
  // QUESTION 20
  // ============================================================

  {
    category: 'linux_for_mongodb',
    topicId: 'linux-for-mongodb',
    topicNumber: 21,
    topicName: 'Linux for MongoDB',

    questionNumber: 20,

    question:
      'You are leading a MongoDB Linux production incident where disk is 96% full, CPU is 90%, swap activity is present, application latency is severe and a secondary has 2,500 seconds of replication lag. How would you lead the incident end to end?',

    level: 'L3+',
    difficulty: 'Expert',
    order: 20,

    answer: {

      groundZero:
        'During a major production incident, the objective is not to fix every alert separately. The DBA must protect data and availability, identify the primary bottleneck, apply the safest mitigation and preserve evidence for root-cause analysis.',

      coreConcept:
        'War-room troubleshooting requires prioritization, evidence collection, communication and controlled recovery across Linux and MongoDB layers.',

      detailedExplanation:
        `The first actions should establish:

Is the PRIMARY available?
Are writes succeeding?
How many replica-set members are healthy?
Is the filesystem still writable?
Is disk usage still increasing?
Is swap activity continuous?
Is CPU caused by mongod or another process?
Is replication lag growing?

The DBA should avoid destructive actions.

Do not:

delete WiredTiger files
force replica-set reconfiguration casually
restart all members
drop collections merely to free filesystem space
kill operations randomly

Instead, identify the dominant pressure.

If disk usage is critical, determine what is consuming space.

If logs or obsolete backups are responsible, validate and safely remove or relocate them.

If MongoDB data itself is responsible, capacity expansion may be the safest immediate mitigation.

Then investigate CPU, swap and replication as part of the same incident timeline.`,

      internalWorking:
        `Primary bottleneck
      |
      v
MongoDB latency
      |
      +--> app retries
      |
      +--> CPU growth
      |
      +--> connection growth
      |
      +--> replication lag
      |
      v
secondary symptoms

War-room task:
identify the first meaningful constraint.`,

      architecture:
        `Application
   |
   v
MongoDB PRIMARY
   |
   +--> CPU
   +--> Memory
   +--> Disk
   +--> Network
   |
   v
Oplog
   |
   v
SECONDARY
   |
Replication lag`,

      examples: [
        'Disk fills because of old backup files, creating I/O and filesystem pressure.',
        'A query surge causes CPU and replication lag while disk capacity is only a separate warning.',
        'Memory pressure causes swapping, which increases disk I/O and MongoDB latency.'
      ],

      commands: [
        {
          command: 'df -h',
          explanation:
            'Determines which filesystem is critically full.'
        },
        {
          command: 'df -i',
          explanation:
            'Checks inode exhaustion.'
        },
        {
          command: 'du -xhd1 /data 2>/dev/null | sort -h',
          explanation:
            'Identifies large top-level consumers on the data filesystem.'
        },
        {
          command: 'top',
          explanation:
            'Identifies CPU-consuming processes.'
        },
        {
          command: 'vmstat 1',
          explanation:
            'Shows run queue, swap activity, I/O and CPU behavior.'
        },
        {
          command: 'iostat -xz 1',
          explanation:
            'Shows disk latency and queueing.'
        },
        {
          command: 'free -h',
          explanation:
            'Checks memory availability and swap utilization.'
        },
        {
          command: 'ss -s',
          explanation:
            'Provides a summary of socket and connection state.'
        },
        {
          command: 'journalctl -u mongod -n 100 --no-pager',
          explanation:
            'Shows recent service-level MongoDB messages.'
        }
      ],

      productionScenario:
        `Monitoring reports:

disk 96%
CPU 90%
swap activity
application latency
secondary lag 2,500 seconds

The DBA first confirms the PRIMARY remains available and the filesystem is writable.

df and du reveal that an old backup directory is consuming a large amount of space.

At the same time, vmstat shows active swapping because another process is consuming memory.

iostat shows elevated latency caused by memory pressure and disk activity.

The DBA coordinates safe cleanup of validated obsolete backup files and stops or limits the unrelated memory-heavy workload.

Disk headroom improves, swap activity falls, storage latency drops and replication begins catching up.

The secondary lag was therefore largely a downstream symptom rather than a separate replication defect.`,

      troubleshootingApproach:
        `1. Declare incident severity and business impact.
2. Confirm PRIMARY and write availability.
3. Preserve logs and timestamps.
4. Check disk capacity and inode usage.
5. Identify disk consumers.
6. Check CPU owner.
7. Check available memory and active swapping.
8. Check disk latency.
9. Check connection/socket growth.
10. Check MongoDB current operations.
11. Check replica-set status and lag.
12. Compare affected and healthy members.
13. Identify the dominant bottleneck.
14. Apply the least-risk mitigation.
15. Verify metrics improve.
16. Allow replication to recover if safe.
17. Continue monitoring.
18. Produce an RCA separating root cause, trigger and contributing factors.`,

      commonMistakes: [
        'Restarting all MongoDB nodes simultaneously.',
        'Deleting MongoDB data files to create free space.',
        'Force-reconfiguring the replica set while majority is healthy.',
        'Treating replication lag as an independent root cause.',
        'Stopping investigation as soon as application latency improves.'
      ],

      bestPractices: [
        'Protect availability and data first.',
        'Preserve evidence before remediation.',
        'Identify the dominant resource bottleneck.',
        'Use reversible mitigations when possible.',
        'Communicate impact and next actions during the incident.',
        'Complete a root-cause analysis after recovery.'
      ],

      interviewAnswer:
        'In a multi-symptom MongoDB Linux incident I first confirm availability and data safety, then establish a timeline. I check disk, memory, swap, CPU, I/O and network together with MongoDB current operations and replication. I identify which condition is causing the others, apply the safest mitigation, verify recovery and only then complete an RCA. I never delete WiredTiger files or force topology changes simply to remove alerts.',

      keyTakeaways: [
        'Multiple alerts may share one root cause.',
        'Protect data and availability before optimization.',
        'Linux and MongoDB evidence must be correlated.',
        'Replication lag is often a downstream symptom.',
        'Recovery and RCA are separate phases.'
      ]
    }
  }

];


// ============================================================
// SEED FUNCTION
// ============================================================

async function seedLinuxForMongoDB() {

  const client = new MongoClient(uri);

  try {

    await client.connect();

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    console.log(
      `Connected to ${DATABASE_NAME}.${COLLECTION_NAME}`
    );


    // ----------------------------------------------------------
    // Remove previous Topic 21 documents
    // ----------------------------------------------------------

    const deleteResult =
      await collection.deleteMany({
        category: 'linux_for_mongodb'
      });

    console.log(
      `Removed ${deleteResult.deletedCount} previous linux_for_mongodb documents`
    );


    // ----------------------------------------------------------
    // Insert Topic 21
    // ----------------------------------------------------------

    const insertResult =
      await collection.insertMany(
        questions
      );

    console.log(
      `Inserted ${insertResult.insertedCount} Linux for MongoDB questions`
    );


    // ----------------------------------------------------------
    // Ensure curriculum unique index exists
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // Validate Topic 21 count
    // ----------------------------------------------------------

    const topicCount =
      await collection.countDocuments({
        category: 'linux_for_mongodb'
      });

    console.log(
      `Topic 21 count: ${topicCount}`
    );

    if (topicCount !== 20) {

      throw new Error(
        `Topic 21 validation failed. Expected 20 questions but found ${topicCount}.`
      );

    }


    // ----------------------------------------------------------
    // Validate complete curriculum count
    // ----------------------------------------------------------

    const curriculumCount =
      await collection.countDocuments({
        topicId: {
          $exists: true
        }
      });

    console.log(
      `New curriculum question count: ${curriculumCount}`
    );


    if (curriculumCount !== 420) {

      console.warn(
        `WARNING: Expected 420 curriculum questions after Topic 21, but found ${curriculumCount}.`
      );

    }


    console.log(
      'Topic 21 seed completed successfully.'
    );

  } catch (error) {

    console.error(
      'Topic 21 seed failed:',
      error
    );

    process.exitCode = 1;

  } finally {

    await client.close();

  }

}


seedLinuxForMongoDB();
