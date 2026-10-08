# Slot B independent territory map

Inspected all three intake files verbatim, repository code/tests/guide and installed Herdr CLI on 2026-10-08. No other slot map read. No repository edits. References below are relative to /home/ivan/Work/infra/akrogon.

## F1 — #59: named owners and dependency errors

Evidence: `src/next.ts:1167` resolves repository identity through the shared Git directory, then `src/next.ts:1191` selects only leaf slugs for nonexistent paths. Existing paths take precedence. Discovery includes open and closed leaves (`src/next.ts:147`). One selected leaf is explicit regardless of target kind (`src/next.ts:1247`), while multiple leaves use sweep (`src/next.ts:710`). Eligibility returns only `{kind: 'deps'}` (`src/turn.ts:6`), losing which blockers failed. Existing error reporting already continues per leaf and produces nonzero exit (`src/next.ts:664`, `src/next.ts:1341`).

Material forks:
- D1 — Bare-name namespace. Reject all multiple matches, including two nested issues with the same basename, as the report requests. Decide whether owner names cover open only or also closed owners, and whether an existing cwd directory named like an owner counts as a conflicting match or preserves current path precedence. Open-only owners keep dispatch intent clear but differ from existing closed-leaf/path handling. Searching both stores can make a previously usable name ambiguous after archival. Recommend explicit paths retain their meaning, with all bare-name owner/leaf candidates collected before dispatch.
- D2 — Error scope. Report explicitly requests errors for every selected dependency-blocked leaf. Apply this only to manual selected/sweep passes, or also automatic hooks/dependent sweeps? Uniform errors simplify implementation but create repeated expected-wait errors during normal progression. Manual errors with automatic waiting require invocation intent independent of selected count. Recommend manual reporting and automatic waiting, subject to operator choice. Do not widen this into errors for capacity, busy seats, missing inputs or merge-turn waits.

Practitioner questions: Q1 — Which owner stores and path/name collisions must count? Q2 — Should a manual repo-wide `next`/`--all` also fail for dependency waits, and should automatic events stay quiet? Q3 — If a leaf is failed as well as dependency-blocked, must its dependencies still be listed? Current failed handling precedes eligibility (`src/next.ts:622`).

Lifetime pitfalls: R1 — Resolve ambiguity before any allocation. Keep targeting from worktree/subdirectory tied to the registered root. Preserve partial discovery errors instead of disguising them as missing owners. R2 — List all unmerged dependencies, distinguishing valid phases, parked, absent and unreadable records. Parked detection can inspect names without parsing invalid parked state (`src/state.ts:146`, `tests/next.test.ts:2356`). Never treat a merged closed dependency as missing. Ready siblings must still run even when blockers produce exit 1.

Report correction: park/unpark do not resolve nested issue basenames. `issueFolders` enumerates only immediate children (`src/park.ts:13`), and park validates names against top-level owners (`src/park.ts:52`). Also, missing dependencies in multi-leaf sweeps already report an error (`src/next.ts:629`), unlike valid but unmerged dependencies, which wait silently.

## F2 — #60: replacement A appears right of B

Evidence: a missing A splits right of recorded B (`src/next.ts:417`); B then remains the recorded pane (`src/next.ts:427`). Installed `herdr 0.9.3`, `herdr pane split --help` permits right/down only. `herdr pane swap --help` accepts explicit source/target IDs. Existing regression covers identity, split parent and TMPDIR, not geometry (`tests/next.test.ts:1851`). Fake split appends a pane without layout information (`tests/fake-herdr.ts:123`), and swap is unsupported, reaching the final error (`tests/fake-herdr.ts:202`).

Material fork D3 — Restore ordering only when replacing A beside surviving B, or enforce left/right on every allocation, including user-rearranged tabs and extra panes? Recommend the local split-then-swap repair. Global normalization requires real geometry and could move operator panes or undo intentional layouts. Literal “always left/right” is a broader contract than this reproduction.

Practitioner question Q4 — Is the invariant relative A-before-B after replacement, or global tab layout even after manual movement? Agree this before choosing the repair.

Lifetime pitfalls R3 — Keep recorded seat IDs authoritative and leave surviving sessions intact. A swap failure after splitting must remain an error and must not leave an unrecorded replacement that retries multiply. Validate retry/re-entry after partial allocation. Fake behavior must prove resulting order or the swap effect, not just repeat the implementation's command string. Probe split/swap and cleanup on a disposable tab before handoff if the leaf contract names these operations. Help output confirms available arguments, not geometry, focus, ratio or failure behavior. No live panes were mutated in this map.

## F3 — #61: pause automatic dispatch per repo

Evidence: four events call next.sh, which execs next unchanged (`plugin/herdr-plugin.toml:13`, `plugin/next.sh:3`), with startup `--resume` separately (`plugin/herdr-plugin.toml:10`). No pause field exists (`src/config.ts:38`). Hooks resolve the owning tab/pane, rather than sweep every repository (`src/next.ts:1286`, `src/next.ts:1305`). Completion can dispatch dependents (`src/next.ts:1151`), each next pass subsequently invokes mergePass (`src/next.ts:1332`), and committed phase moves independently call mergeWake (`src/akrogon.ts:75`, `src/next.ts:1141`). Park correctly refuses tab/worktree allocations (`src/park.ts:22`, `docs/guide/next.md:64`).

Material forks:
- D4 — Persistence/operation. A shared repo-config boolean is simple but a transient local pause can propagate through sync and needs config edits. Machine-local state keyed by registered repo is operational but needs a narrow control/read path. Choose the storage, command or edit interface, default and status visibility. Neither requires changing existing `issues/` records in a leaf branch.
- D5 — Automatic boundary. Event-only pause solves the reported close/relaunch race, but startup resume or phase-triggered mergeWake could restart work while paused. Recommend pause applies to events, startup resume and implicit merge/dependent wakeups, while deliberate manual next commands remain permitted. Decide whether manual dispatch's cascading dependent/merge work also counts as authorized manual work. Plugin-only provenance is insufficient because phase commands have their own wake path.
- D6 — Resume meaning. Removing pause may merely permit future dispatch or immediately perform an automatic pass. Recommend permit-only plus an explicit manual next when desired. Immediate resume risks starting unrelated unallocated leaves unless constrained to existing allocations and eligible dependents.

Practitioner questions: Q5 — Is pause local to this machine or shared by every operator of the repo? Q6 — Which automatic paths stop, and is cleanup of already merged work still allowed? Q7 — Must successful pause wait for an in-flight dispatch to finish? For model replacement, it must prevent new launches after acknowledgement, not stop existing agents.

Lifetime pitfalls R4 — Check pause inside the same coordination boundary used for dispatch, accounting for merge preparation outside the global lock, so a close event or pending merge cannot launch after pause succeeds. Preserve cleanup separately if chosen. R5 — Do not put pause in dependency eligibility: manual commands must bypass it, and paused leaves should retain merge queue order and capacity semantics. Test two repos, inherited hook environment on a manual command, startup resume, phase wake and queued close events. Clearing pause alone does not replace existing sessions. Seat overrides apply at the next start (`docs/guide/files.md:32`).

## Proposed destinations and split

A1 — All work belongs in registered destination `akrogon`, lifecycle route (`direct: false`). Three independent issues preserve independent delivery/source closure.
A2 — #59 can use two parallel leaves: owner-name selection/ambiguity, and complete dependency diagnostics/manual exit behavior. Neither needs the other's implementation. Lock target/reporting intent first. #60 needs one narrow allocation/test leaf. #61 needs one integrated control-and-enforcement leaf, since a pause control without coverage of agreed dispatch paths would falsely promise safety.
A3 — No delivery dependencies between the three reports. Shared next.ts changes are merge coordination, not blocked-by edges. #61 is the operational priority, #60 the quickest settlement, #59 needs namespace/reporting choices. Each leaf keeps schema/code/tests and relevant operator docs together, never touches `issues/`, and uses configured format, test, typecheck and test_changed checks. Test fixtures may create temporary issue records outside the branch.
