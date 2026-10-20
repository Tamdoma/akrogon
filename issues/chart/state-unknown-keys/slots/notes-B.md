# Blind fork notes: unknown-keys (slot B)

## Pick, reason and cost

**D1: Pick O2, strict parsing with one shared inventory.** Replace the competing state walks with one inventory that retains readable leaves and path-specific failures. Commands targeting a healthy leaf can proceed. Commands targeting an invalid leaf return its original error. Overview commands show healthy leaves alongside diagnostics and may still exit nonzero to report incomplete results.

The destination covers unreadable state as well as extra keys. Removing top-level strictness addresses only extra keys. Sharing the existing isolation behavior removes duplicated discovery and validation instead of adding a fourth error-handling path. Keep `readState` as the strict boundary and keep existing retired-field compatibility, without adding more exceptions for seat notes.

Cost: more caller changes than stripping keys. Consumers must distinguish an incomplete inventory from a complete list. This includes `allLeaves`/`findLeaf`, status, dispatch refreshes, config/check worktree lookup, completion and cleanup. A valid-leaves-only wrapper that discards failures would lose the safety needed by the last two consumers. No new persisted quarantine state or automatic phase change is needed.

## Rejected options

- **O1: Ignore unknown top-level keys and delete the skip list.** Smallest change for `reported`/`notes`, but malformed YAML, missing required fields and invalid known values still stop the strict scans. Unknown optional-field typos become accepted, and extra data disappears on the next ordinary read/save cycle. This does not satisfy the whole destination.
- **O3: Keep adding permitted extra keys.** Each new seat-written key repeats the incident. It preserves both the exception list and duplicated scans.
- **O4: Catch errors independently in each command, or return only valid leaves.** Repeats the current divergence and lets consumers mistake missing records for absent work. One shared inventory must preserve failures for consumers to interpret.

## Evidence

- **F1, operator, 2026-10-18:** `issues/chart/state-unknown-keys/INTAKE.md`, source Tamdoma/akrogon#102, records two disruptions from `reported` and `notes`. The operator's carry prefers removing redundant code before stacking new code. This favors consolidating scans over expanding the exception list.
- **F2, better-than-training, inspected 2026-10-19 at HEAD `abfee125b4ab68bec34bd73325c077c12c74fc47`:** `src/state.ts`, `stateSchema`, `readState`, `leavesUnder`, `allLeaves`, `findLeaf`. The top-level schema is strict. `readState` filters four retired keys and separately normalizes empty legacy `batch.members`. `leavesUnder` propagates read errors, and `findLeaf` first reads every open and closed leaf. A different leaf's invalid record therefore blocks targeted lookup.
- **F3, better-than-training, same date/HEAD:** `src/next.ts`, `discover`, already collects valid leaves, unreadable counts, unknown-directory state and foreign records, excluding duplicate identities. `src/status.ts`, `scanRepo`, instead catches at repository scope, hiding healthy leaves in that repo. `src/config.ts`, `effectiveConfig`, and `src/run-check.ts`, `leafTarget`, use strict `allLeaves`. Dispatch also returns to `allLeaves` during merge refreshes. Isolation at initial dispatch alone is insufficient.
- **F4, better-than-training, same date/HEAD:** `src/reconcile.ts`, `collectSlugs`, ignores unreadable records when building ownership. `completeOwner` in `src/phase.ts` uses `leavesUnder(...).every(merged)`. Dropping invalid entries could allow destructive cleanup or premature completion. This changes the required inventory result from merely valid leaves to valid leaves plus retained failures and paths.
- **F5, better-than-training, measured 2026-10-19:** In-memory checks using the locally installed schema reproduced `unrecognized_keys` for `reported`/`notes`. `stateSchema.strip()` accepted them but removed both, accepted misspelled optional `worktre`, and still rejected invalid `phase`, missing `repo` and null input. Malformed YAML still threw before schema validation. No files were changed by these checks.
- **F6, better-than-training, live inspection 2026-10-19:** `akrogon config` listed 11 registered repos. Read-only traversal of their open, closed and parked areas checked 799 state files through HEAD's `readState`; all parsed. Counts: akrogon 201, framework 530, pi-extensions 21, mdcny-ghl-data-pulls 8, boulevard-automation 18, clinique-la-roya 0, lens 4, Himne 4, lingua-relay 0, blepsis 9, varhop 4. This confirms the present surface, not a live recurrence or runtime proof of command isolation.
- **F7, better-than-training, inspected 2026-10-19:** Framework artifact `issues/closed/test-paths-with-spaces/upgrade-replay/upgrade-replay/review-B.md`, section `Lifecycle command failure` dated 2026-10-18, records config, run-check and phase failing on the same keys. Existing `tests/state.test.ts` pins unknown-key rejection, `tests/status.test.ts` pins repository-level isolation, and `tests/next.test.ts` pins unreadable-leaf capacity reservation. Tests were inspected, not run, because their fixtures write outside this return file.

## Pitfalls and what removes them

- **R1: An invalid leaf becomes invisible to cleanup.** Retain its discovered path as evidence of ownership. Preserve associated work until ownership and inactivity are established. When directory traversal itself fails, retain that uncertainty rather than claiming the subtree is empty.
- **R2: A skipped sibling makes an owner appear fully merged.** Require a complete inventory for the specific owner before closing or packing it. An unreadable sibling blocks that owner's completion, while unrelated owners continue. Preserve dependency blocking for unreadable prerequisites.
- **R3: An explicitly requested invalid leaf becomes “missing,” or duplicates select an arbitrary leaf.** Resolve target failures from retained paths and errors. Keep duplicate-slug and repo-identity checks in the shared inventory and exclude ambiguous records from dispatch.
- **R4: Initial dispatch survives, then a refresh or worktree lookup aborts.** Migrate every strict inventory consumer involved in the affected commands. Verify a healthy target beside extra-key, malformed-YAML and invalid-value siblings in both open and closed areas. Include a healthy sibling in the same repo, rather than only another repo.
- **R5: “Other leaves continue” is interpreted as bypassing the capacity limit.** Preserve the current capacity policy unless explicitly changed. `activeCount` reserves capacity for unreadable leaves, and the existing max_active=1 test intentionally prevents new allocation. Isolation can preserve ongoing handoffs and reads without promising unlimited dispatch.

## Question missing from the fork

**Q1:** Does the destination require new dispatch when an unreadable leaf consumes the last capacity slot, or does the current reservation remain? My recommendation preserves it. Changing it is a separate scheduling decision, not an automatic consequence of isolating parse failures.
