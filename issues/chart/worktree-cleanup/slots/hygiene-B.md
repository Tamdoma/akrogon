# Slot B: store hygiene

Blind notes, 2026-10-15. Inspected akrogon `f3557d8dc8a74459eefcc63dacb419332df1659e`. Read-only investigation. No cleanup, code changes, lifecycle commands or process termination performed.

Sizes below are logical bytes from file `lstat`, without following symlinks, not allocated disk usage. Counts are observations during a changing live session, not an atomic snapshot. “Candidate” does not mean deletion is already proven safe. Directory inode overhead is excluded. Source paths without a prefix are relative to the akrogon checkout. Framework means `/home/ivan/Work/infra/tamdoma/framework`.

## Q1. Scope and inventory

### Pick, reason and cost

D1. Clean disposable outputs by their producer and lifetime, including legacy stores and scratch roots. Preserve configuration, installed links, Git metadata, source, dependencies still in use, and required evidence. A directory's location or unfamiliar name does not make its contents junk. Cost: each producer needs an explicit lifetime and output classification, and old unowned material needs a bounded migration decision.

The path model matters: `globalHome()` defaults to the installed checkout, currently `/home/ivan/Work/infra/akrogon`, or `AKROGON_HOME`, not `~/.akrogon` (`src/config.ts:197`). Current leaf scratch defaults to `/var/tmp/akr-1000`, or `AKROGON_LEAF_TEMP_ROOT`, not `/tmp` (`src/config.ts:266`). Repo stores can override the default. Never recursively clean “the akrogon folder” as one disposable root.

### Write-location inventory

| Location | Writer and contents | Host size and count | Leftovers / treatment |
|---|---|---|---|
| Effective repo worktree stores, listed below | `src/next.ts:279` leaf copies, `src/verify.ts:126` verify copies, `src/batch.ts:115` batch copies, worker tools create worker copies | Eight empty stores, three absent | Zero entries in effective stores at inspection. Apply already-taken worktree rules |
| Old `akrogon/issues/worktrees` | Historical store location, current reconcile includes old stores | Three dangling symlinks, 150 link bytes | Three migration candidates. Unlink the links only after confirming obsolete aliases, never their targets |
| Old `framework/issues/worktrees` | Historical store plus tool outputs described below | Three directories, 18,660,887 file bytes, 187 files. Five dangling links, 284 link bytes | Three directories require producer-specific decisions. Five obsolete-link candidates |
| `/var/tmp/akr-1000/<repo-hash>/<leaf-hash>` | `src/config.ts:266-300` creates private directories. Seat/check tools use them | About 406 MB at later scan. 49 repo buckets, 45 empty, five leaf directories | One populated leaf bucket. Four empty leaf directories. Empty buckets are infrastructure, not equivalent to abandoned runs |
| Current `6855/58898f27` scratch bucket | Hash maps to framework `shared-test-browser`, whose state is under `issues/closed/test-cost/browser-cost/shared-test-browser/state.yaml` | 406,024,837 bytes, 22,287 files, 4,277 descendant directories | One `run-RewR23` with no `.owner` and four `.tmp*` directories. Their individual creators/lifetimes remain unresolved |
| Legacy `/tmp/akr-1000` | Previous leaf-temp root, tools and capture helper | 1,719,800 bytes, 53 files, 121 descendant directories, 93 repo buckets of which 90 empty, 14 leaf directories | No `run-*` directories or `.owner` records. Six `akrogon-io-*` captures, browser files and empty scaffolding. Requires legacy ownership mapping, not current-root-only sweep |
| `<leaf-temp>/run-*` | `src/run-check.ts:154-165` creates `.owner`, `out.log`, supplies constructed temp environment. `:220` removes in finally | Included in current scratch row | One observed ownerless run. Current reconcile retains missing/invalid owner records (`src/reconcile.ts:410-425`) |
| `<captureRoot or os.tmpdir()>/akrogon-io-*` | `src/shell.ts:35-65` creates out/err, reads after child exits, then removes | Six old captures included above. No top-level `/tmp/akrogon*` entries found | Abrupt death or failed output read can leave captures. No owner record in this helper today |
| `<globalHome>/runs` | `src/admission.ts:39,57-63,133` admission YAML and atomic temporary files | One 13-byte `last-start`, no admission YAML or atomic temp files | One retired spacing file. Historical writer `81196b3^:src/admission.ts:86,298`, removed by `81196b3` on 2026-10-14 |
| `<globalHome>/reconcile/<repo>.json` | `src/reconcile.ts:22-40,447` latest kept-path report, replaced atomically | Eleven files, 3,242 bytes | Latest reports are operational state, not accumulating junk. Some entries name paths now absent. Status must filter existence as already taken |
| `<globalHome>/config.yaml`, `paused.yaml`, `stopped.yaml`, `.lock` | `src/init.ts:85-89`, `src/pause.ts:20,50`, `src/stop.ts:18,48`, `src/state.ts:203-218` | 1,201 / 2 / 2 / 0 bytes respectively | Zero established junk. Configuration and control state must remain. Lock inode must remain while its protocol exists |
| Atomic `<path>.<pid>.tmp` siblings | `src/shell.ts:143-147`, `src/admission.ts:57-63`, `src/reconcile.ts:38-40`, `src/verify.ts:186-187` | None observed in relevant global state or registered issue trees | Remove only abandoned writer temporaries. Suffix alone is insufficient. A directory named `.tmp` is not this file format |
| Registered repo `issues/` | `src/state.ts:132` state YAML, `src/log.ts:47` log JSONL, `src/timing.ts:73` timing JSONL, `src/attempts.ts:113` merge attempts, `src/verify.ts:36,146,186` verification records, `src/pull.ts:75` seeds, `src/init.ts:17,63` config/open, `src/phase.ts:223` close, `src/park.ts:61,68` park/unpark | Per-repo totals below, excluding legacy stores | Durable lifecycle data. File count is not leftover count. Evidence retention is the separate check-evidence chart |
| Check holder `implementation/check-*.log` or explicit holder target | `src/run-check.ts:207-209`, verification target creation `src/verify.ts:129` | Included in issue-tree totals when held there. Arbitrary holder paths have no fixed enumerable host root | Evidence, not automatically disposable when a check ends |
| Repo `learnings/LESSONS.md`, initial `.gitignore`, `.gitattributes` | `src/init.ts:64-81`, lesson removal `src/lessons.ts:94` | Akrogon LESSONS 6,680 bytes, ignore 147, attributes 33. Framework 55,593 / 1,345 / 101 | Maintained repository content, zero established junk. Full learnings trees: 234,238 bytes/81 files and 247,649/158 |
| Worktree `.env` and Git-dir `akrogon-env-<pid>` temporary | `src/next.ts:409-410` writes privately, then renames | No managed worktrees currently in effective stores. No managed-worktree env leftovers established | Credentials input/copy must not be printed. Abandoned intermediate needs writer-lifetime check |
| Git common directory and worktree metadata | `src/next.ts:279`, Git calls in batch, verify, sync, phase and self-update. `src/self-update.ts:253-255` install lock | Akrogon `.git` 35,686,670 bytes/3,648 files, framework 459,793,534/7,664. Akrogon install lock 0 bytes | Git owns metadata. Use Git removal/prune for worktrees. Never recursively sweep `.git` |
| Installed checkout files and dependency/setup output | `src/self-update.ts` Git update and configured setup, verification/build setup runs | Akrogon root `node_modules` 63,822,936 bytes/1,732 files, framework 965,049,240/55,073 | Reusable dependencies, not proven junk. Arbitrary setup commands can write outside these paths. No honest finite list of all transitive writes exists from akrogon source alone |
| `~/{.claude/skills,.agents/skills,.codex/skills,.pi/agent/skills}` | `src/install.ts:9-24,48-52` skill links | Ten akrogon links per root, 490 link bytes per root, all valid | Forty live links, zero broken akrogon links. Do not run `planSkillLinks` as an audit: it unlinks obsolete links at `:28-35` |
| `~/.local/bin/akrogon`, `~/.config/systemd/user/akrogon.slice` | Same installer | Two valid links, 44 and 51 link bytes | Live installation, zero established leftovers |
| Herdr installation/integration state | `src/install.ts:65-66` delegates `integration install` and `plugin link` | External producer-owned destinations and byte count not established by this audit | Not a license to sweep Herdr state. Resolve its producer contract if expanded into this cleanup |
| systemd user transient scopes/guard services | `src/scope.ts:43-83` via systemd-run, guard removes admission record and stops scope | Runtime state managed by systemd. A live akrogon-scoped process was observed, detailed under Q2 | Scope shutdown must precede deletion of its required resources. Do not delete runtime unit files by hand |
| `~/.akrogon` outside stores | No current writer found for two old lock files | `framework-tests.lock` and `run.lock`, both zero bytes | `run.lock` belongs to retired admission machinery. Exact creator of framework-tests lock unconfirmed. Zero bytes does not prove obsolete synchronization |
| `~/.config/akrogon/env` | User-provided configuration input. `src/init.ts:90-91` checks/prints instructions, does not write it | One file, 439 bytes. Values not read or printed | Credentials, not junk |
| `~/.local/state` | No direct akrogon source writer found | No akrogon-named child found. Contains other tools' state | Do not sweep the parent. External tools own their outputs |

Effective store paths from configuration:

| Repo | Effective path | Entries |
|---|---|---:|
| akrogon | `~/.akrogon/worktrees/akrogon` | 0 |
| framework | `~/.akrogon/worktrees/framework` | 0 |
| pi-extensions | `~/.pi/agent/extensions/issues/worktrees` | 0 |
| mdcny-ghl-data-pulls | `~/Work/personal/MDConsultingNY/mdcny-ghl-data-pulls/issues/worktrees` | 0 |
| boulevard-automation | `~/Work/personal/MDConsultingNY/boulevard-automation/issues/worktrees` | 0 |
| clinique-la-roya | `~/Work/personal/MDConsultingNY/clinique-la-roya/issues/worktrees` | absent |
| lens | `~/Work/infra/tamdoma/lens/issues/worktrees` | 0 |
| Himne | `~/Work/personal/Himne/issues/worktrees` | 0 |
| lingua-relay | `~/Work/personal/lingua-relay/issues/worktrees` | absent |
| blepsis | `~/Work/infra/blepsis/issues/worktrees` | 0 |
| varhop | `~/.akrogon/worktrees/varhop` | absent |

Issue-tree inventory, excluding legacy worktree stores and without interpreting evidence as junk:

| Repo | Bytes | Files | Established disposable atomic temp files |
|---|---:|---:|---:|
| akrogon | 49,346,069 | 4,888 | 0 |
| framework | 1,108,568,148 | 14,859 | 0 |
| pi-extensions | 117,044,827 | 10,352 | 0 |
| mdcny-ghl-data-pulls | 660,428 | 125 | 0 |
| boulevard-automation | 2,361,853 | 397 | 0 |
| clinique-la-roya | 1,936,715 | 229 | 0 |
| lens | 629,018 | 127 | 0 |
| Himne | 628,394 | 116 | 0 |
| lingua-relay | 192 | 1 | 0 |
| blepsis | 657,004 | 151 | 0 |
| varhop | 2,162,880 | 344 | 0 |

### The three unknown directories in framework's old store

F1. `.dcf16a3f00401334-1.node-gyp`: 118 bytes, one executable named `node-gyp`. This is a Bun temporary command shim, not a Node headers cache. Its contents choose `bun x --silent node-gyp` or `$npm_config_node_gyp`. The exact shell text matches Bun's installer implementation. That implementation creates a random temporary directory and adds it to the install process's PATH. Deletion can break a later node-gyp lookup by an already-running installer even when no file is open. Once the entire creating install lifetime has ended, a future independent Bun install creates its own shim. Exact historical Bun invocation/version was not recovered.

F2. `.temp`: 18,605,887 bytes, 182 files, 43 descendant directories. Its only immediate child is `formspark-build-wiring-proof`, containing `submission-screenshot.png` and `submit-stage` with a script, package files and Playwright dependencies. Framework's `.claude/workflow/scripts/run-formspark-build-wiring-proof.ts:1271,1308,1322` names the proof screenshot and derives its root. Historical `issues/closed/formspark-api/formspark-build-wiring/review-B.md:286` describes the earlier Playwright submit script and `:380` treats absent proof evidence as unverified. The exact invocation that placed the stage beneath this old store was not recovered. Deleting the stage can break a pending import/browser run. Deleting the screenshot can destroy retained proof after every process exits. Do not classify the whole directory as disposable. Separate reproducible staging from required evidence, establish the evidence's canonical retained location, then remove the obsolete original. This is a concrete cross-chart evidence decision, not indefinite retention of junk.

F3. `emdash-conversion-ufix-b`: 54,882 bytes, four files, three descendant directories. It holds only `.fix-b-evidence/chrome-profile/{Variations,Local State,Default/Network Persistent State,Default/Preferences}`, with no `.git` pointer. Framework's `issues/closed/emdash-cms/emdash-build/emdash-conversion/implementation/fix-B.md:39-42` names this exact detached fix worktree. `implementation/report.md:77` records its landed fix, while `:40` records a stale Chrome process holding a shared profile and using an adapter from a removed worktree. Attribution to the fix seat is supported. The exact profile-creation command was not found. Deletion can break a running browser's later writes or an intended profile reuse. The remaining files look like a test profile, not source changes. Confirm the test profile has no retained purpose and its browser scope has ended, then remove the remainder. Do not generalize this unusual name into the accepted `<slug>-u<N>` matcher.

Eight broken migration-looking aliases also remain: akrogon `check-env`, `leaf-env-file`, `worktree-store`, and framework `check-scratch`, `copyfile-install`, `formspark-build-wiring`, `recording-consumers`, `root-influence`. Each points to the corresponding currently absent directory in the newer store. Exact original link creator was not proven. Removing these links cannot remove target contents, but could remove an alias someone expects to use after recreating its target. Confirm retirement of that migration alias scheme before removing them.

### Rejected options

O1. Sweep all of `~/.akrogon`, the installed checkout, `~/.config/akrogon`, or `~/.local/state`: mixes disposable output with configuration, source, locks, installation and unrelated applications.

O2. Sweep only effective worktree stores: misses all three current unknown directories, eight old links and legacy `/tmp` scratch.

O3. Treat all `.temp`, `.tmp*`, `.node-gyp` and Chrome files as caches: the live examples include executable shims and proof evidence with different consumers.

### Evidence, tier and date

Operator-placed material: intake, current Q1–Q3 and carries, and both related Taken sections, read 2026-10-15. Their deletion intent and existing worktree rules are binding.

Primary code and host evidence: cited source locations, configuration-derived store paths, read-only directory inventories, file-type inspection and framework proof/fix records, 2026-10-15. Sizes do not establish disposability.

Primary external implementation: [Bun PackageManager.rs](https://raw.githubusercontent.com/oven-sh/bun/main/src/install/PackageManager.rs), checked 2026-10-15, `ensure_temp_node_gyp_script_run`, lines 1062–1157. Exact shim content and PATH insertion match the local artifact. Upstream main is not proof of the precise version that created this historical file.

### Pitfalls and their removal

R1. “Everything clean” becomes deletion of useful inputs. Remove this ambiguity with producer-specific disposable output boundaries, not broad directory-name matching.

R2. Evidence lands in a directory called temp. Resolve the retained evidence destination before removing staging. Do not use this fork to invent a retention policy for all issue logs.

R3. Setup commands and agents can write arbitrary paths. Give their temporary output an owned run directory and fix observed writers that escape it. Do not claim an audit of direct filesystem calls exhausts all transitive tool behavior.

### Additional question

Q1a. For the Formspark screenshot, which retained artifact is authoritative, and has its required content been preserved there? This determines whether that specific file is junk. Process liveness cannot answer it.

## Q2. What proves deletion safe?

### Pick, reason and cost

D2. Require positive ownership and disposability evidence, plus an ended consumer lifetime. No combination of age, unregistered status and a negative open-file scan proves safety for arbitrary contents.

For newly produced scratch, the check is: the exact path/type belongs to a producer's declared disposable output, its owner and all relevant descendants/scopes have ended, it is not retained evidence or a resumable workspace, and it cannot be claimed again between the check and deletion. Use the existing lifecycle boundaries and ownership records. Publish ownership before exposing a directory that a competing cleanup can collect. Once those conditions hold, remove it and verify absence. Preserve the already-taken special rules for verify, batch, workers and dirty leaf worktrees.

For the existing unknown directories, establish those facts through a one-time path-specific migration inventory. Check Git registration, live panes, process cwd/fds and relevant scopes as additional vetoes. Then resolve each remaining producer or retention question. This investigation has identified candidates, but has NOT established safe deletion for all of them.

Cost: unknown historical material needs investigation or an explicit owner decision. “Never break something a person needs later” cannot be inferred from the filesystem. The required evidence is a retention/disposability decision, not another process-scanning flag.

### How the check fails

F4. An empty process scan is incomplete evidence. This audit examined own-UID process cwd/root/fd links: 301 processes, 129 permission-denied reads. No visible references to the three old-store directories appeared. The denied reads prevent treating that result as exhaustive. [fuser's restrictions](https://man7.org/linux/man-pages/man1/fuser.1.html), checked 2026-10-15, also document incomplete results without sufficient permissions. A process can later open a pathname it currently holds only in PATH or memory, as F1 demonstrates.

F5. Parent death is not descendant death. PID 3243524, `awk`, had cwd `~/.akrogon/worktrees/framework/browser-socket-runtime (deleted)` and fd 1 `/var/tmp/akr-1000/6855/6d613a31/bsr-crit6/banner-minted.txt (deleted)`. Its cgroup was an `akrogon-l59cce9a60bec-…scope`. The deleted directories did not end their user. The process was observed only, not stopped. For scoped scratch, prove the relevant scope empty after its normal teardown before deleting resources descendants may reopen.

F6. Current owner records have different guarantees. `src/admission.ts:74-75` checks PID, boot and process start time. `src/reconcile.ts:109-111` checks PID/boot only. A PID reused in the same boot can conservatively keep stale output. `started` in run-check's JSON is an ISO timestamp, not admission's proc start-time identity. Do not silently equate them. The accepted batch rule remains binding, including ownership publication before creation.

F7. Missing ownership is not generally proof of abandonment. Current run-check makes the directory at `src/run-check.ts:154`, then writes `.owner` at `:159`. A concurrent collector could see a live owner's publication gap. Generic captures have no owner marker at all. The taken “batch with no owner can be removed” rule relies on its new producer ordering and must not be copied unchanged to these producers.

### Rejected options

O4. No open fd/cwd + no pane: misses future opens, process visibility restrictions and retained evidence.

O5. Age or merged owner alone for arbitrary outputs: old processes and deliberately retained artifacts exist. The accepted merged-worker rule is a specific disposal policy, not a universal rule.

O6. Missing Git registration: identifies neither producer nor purpose. All three investigated unknowns have useful explanations outside current Git registration.

O7. Move uncertain files to quarantine and call cleanup complete: moves the leftovers and can still break pathname consumers. It does not satisfy deletion or prove safety.

### Evidence, tier and date

Primary source: `src/admission.ts:57-75,98-111`, `src/run-check.ts:154-162`, `src/shell.ts:35-65`, `src/reconcile.ts:90-111,410-425`, `src/scope.ts:64-83`, plus `/proc` observations above, 2026-10-15. Primary outside documentation: fuser restrictions linked above. Operator-placed locks: accepted batch publication rule and existing pane vetoes. No destructive probe performed in this read-only brief.

### Pitfalls and their removal

R4. TOCTOU between classification and deletion. Remove future legitimate reuse through the producer lifetime, publish ownership before exposure, and verify exact owned path/type at removal. A generic filesystem snapshot cannot replace this protocol.

R5. Removing zero-byte lock files can split synchronization across old and new inodes. Preserve current `.lock` and install lock. Retire old locks only after confirming no current or supported old producer uses that protocol.

R6. An inaccessible process or invalid owner is mistaken for “dead”. Return a specific unresolved reason and the next check needed. Do not turn permission failures into successful liveness checks.

### Additional question

Q2a. Does producer completion include its descendants, and who ends that scope? The observed surviving `awk` makes that a real ownership gap. This fork should not become a general process killer, but scratch deletion needs a valid lifetime boundary.

## Q3. Timing and unresolved items

### Pick, reason and cost

D3. Delete disposable outputs at producer completion, including failure paths, and use existing reconcile entry points for crash recovery. Add one bounded migration of the identified legacy roots and retired state. Keep plain status read-only as already taken. Do not add a periodic scanner merely to compensate for undefined ownership.

Normal paths already remove verify/batch copies and check-run folders in finally, and remove captures after reading output (`src/verify.ts:189`, `src/batch.ts:154`, `src/run-check.ts:220`, `src/shell.ts:65`). Reconcile already runs at `src/next.ts:1327,1441`. Extend the responsible producer/recovery paths where the inventory demonstrates a gap. An always-running daemon is unnecessary for this decision. Cost: if every owning process is killed and nobody next invokes recovery, leftovers persist until that recovery runs. Do not promise literal instantaneous cleanliness under SIGKILL.

For an uncertain item, record the exact path, missing fact and action that resolves it. Do not label known junk permanently “unknown”. Concrete pending work from this audit:

- A1. Finish producer/scope and retention checks for the Bun shim and EmDash test profile, then delete them if those checks establish disposal.
- A2. Resolve the Formspark screenshot's retained destination, then remove its obsolete stage and original only when the evidence decision allows it.
- A3. Establish the missing owner/lifetime of `shared-test-browser/run-RewR23` and the four sibling temporary directories. Map remaining legacy scratch to former producers. Current missing-owner retention is not a terminal cleanup policy.
- A4. Confirm old migration links and retired spacing/lock protocols are unused, then remove only the obsolete entries. Preserve live configuration, credentials, installation and locks.

These are unresolved checks, not requests for permission to run deletion in this read-only slot. Failed checks leave the item in place with its specific cause until resolved. Already-confirmed disposable leftovers should be removed without making the operator approve each file.

### Rejected options

O8. Cleanup only on successful merge: misses crashed checks, failed setup, global captures and old files outside worktrees.

O9. Recursive cleanup from status: violates the taken read-only status decision and makes observation destructive.

O10. Automatic age-based cron sweep: repeats the same ownership uncertainty more frequently and can interrupt active consumers.

O11. Permanent keep-and-report for every unknown: violates the operator's instruction. Investigation must end in either justified retention or verified removal, not an unexplained indefinite exemption.

### Evidence, tier and date

Operator-placed source: after-merge Taken, read 2026-10-15, explicitly requires deletion of junk and read-only status. Primary code: normal cleanup and reconcile call sites above, current kept-report writer `src/reconcile.ts:22-40`, existing admission stale-record recovery `src/admission.ts:98-111`, inspected 2026-10-15. Live evidence: active effective stores are empty while old roots and ownerless scratch persist, so effective-store-only recovery is insufficient.

### Pitfalls and their removal

R7. Migration cleanup becomes a broad permanent scavenger. Use the enumerated legacy roots and evidence-backed retired entries, with narrowly defined producer rules for future outputs.

R8. Reported success despite removal failure. Preserve the error/path, leave recovery pending, and verify actual absence after successful deletion. Status should show existing unresolved paths from the last cleanup, as already taken.

R9. Empty parent directories are counted as dangerous junk. Empty roots can be intentional infrastructure. If removal is desired after all consumers release them, use empty-directory removal, never recursive deletion of a supposedly empty parent that can receive new children.

### Additional question

Q3a. Is cleanup on producer release plus the next normal recovery invocation sufficient after a crash, or is a maximum elapsed cleanup delay required? No such time bound is present in the intake. Do not invent a daemon or schedule without that requirement.
