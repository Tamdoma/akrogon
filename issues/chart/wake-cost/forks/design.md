# Design: wake-cost

## Question

Final shape: timings.jsonl out of the wake path, inventory open-only where closed is not needed, residue deletion with old rows still parsing.

## Findings

slots/design-B.md, slots/design-C.md.

- The wake reads timings.jsonl at three places: capacity waiters (src/next.ts:840), recordWait's last reason (src/timing.ts:142), any visit_start (src/next.ts:703). Measured per wake: 22 reads 2.4 s and 155 inventory walks 1.9 s of 7.0-9.3 s; two plain wakes took 18-22 s, not traced (B). Framework readTimings 189-212 ms, full inventory 55-83 ms, open only 1 ms (B,C).
- readTimings returns empty on one bad row (src/timing.ts:101-104), which empties the capacity queue and repeats visit_start (B F1).
- Every wake inventory caller needs open leaves only, except reconcileHost slices (src/reconcile.ts:1307), status and timing-report, and a blocked-by slug not in open (src/turn.ts:26-35). (B,C)
- stateSchema is strict: a release that writes a new state key breaks rollback to the release before (C F1). The 2026-11-22 signpost answer 5 (state readable by the previous and the new release) still holds.
- Residue: Batch.decision, attempt members (loose schema), outcome split (0 rows), issues/red-records.jsonl have no reader; held/reuse/ejected, timing batch members and verify reused have old rows under strict schemas and stay. The reused filters' flaky window is unchecked. (B,C)

## Taken

A's picks (full autopilot), 2026-11-23:

1. One optional state field `wait: { reason, since }` (src/state.ts). recordWait compares and writes it on the leaf; capacity waiters come from open leaves with wait.reason capacity sorted by since; "first visit" is wait absent. The field keeps reason none rather than being removed, so absent means never visited. capacityWaits, RepoWaits and the three wake reads go. (B Q1 O1; C's separate visited key not needed)
2. Two releases (C F1 a): release 1 accepts the optional field and writes nothing; release 2 writes and reads it. Each lands separately.
3. repoInventory default becomes open only; closed is named at reconcileHost, status, park and timing-report. A blocked-by slug not in open is looked up by slug folder only when blocked-by is non-empty; eligibility reuses unmergedDeps; the closed-dependents wake block (src/next.ts:884-898) goes and the wake filter gains "a blocked-by slug that is no open leaf". (B I1-I3, C F2 a)
4. Residue: delete Batch.decision (+ fixture), attempt members, outcome split (+ test), and git rm issues/red-records.jsonl in akrogon and framework. Keep held/reuse/ejected, timing batch members, verify reused and its filters. (B D1-D4; C on reused)
5. Accept: one extra visit_start per open leaf at upgrade (B Q2 O1); duplicate slug in open and closed is refused by findLeaf for phase commands (B Q3 O1). The 18-22 s plain wakes are measured again after release 2.

Figure: next --wake wall time and readTimings calls per wake (0 after), run-check inventory ms.

### Final shape corrections (A, 2026-11-23, from slots/final-C.md)

- [1] state.wait is set to { reason: none, since } at the first visit_start (src/next.ts:703) and whenever a seat is prompted (src/next.ts:478, :1263), with no wait(none) row appended there, matching today's rule that a prompt clears a capacity wait (src/timing.ts:121-138). (C1)
- [3] The wake filter wakes an unstarted leaf for a blocked-by slug missing from open only when that slug's folder exists in issues/closed/ (one slug-folder check per wake), not for parked or missing dependencies. (C2)
- [3] broadcastPass (src/next.ts:1165) and reconcileRepos (src/next.ts:1439) name closed: leaves with a pending broadcast and merged leaves whose tab and worktree reconcile removes sit in closed. About 0.4 s of closed walks per pass remain (today 1.9 s). (B1, B2, slots/final-B.md)
- [1] At src/next.ts:727-728 the wait is recorded before completeOwner moves the folder. recordWait re-reads and writes the state under the global lock (src/next.ts:1023 takes it), and dispatchLeaf's local state takes the written value so the save at :737 keeps it. (B3, B4)
- Release split: release 1 = schema accepts the optional wait field, plus picks 3 and 4; release 2 = writes and reads wait (pick 1). (A)
- [1,2] Wait carry, replacing carryWaits and its marker (A, from slots/carry-redesign-brief.md, carry-redesign-B.md, carry-redesign-C.md; D round 2 F5-F7):
  - state.wait.since becomes optional in release 1's schema. Absent wait = unknown; { reason: none } without since = known, never visited; first visit = since absent. (B1; C1's separate visited key not taken, one key fewer)
  - Import: at resumeRepos top, before the sweep filter, every open leaf of the repo without wait is imported (one read per repo, only when such leaves exist); recordWait imports a leaf without wait for typed commands. The import reads timings.jsonl as text, keeps lines naming the slug, parses only those; last wait/prompt row gives the reason and time (prompt = none), no rows gives { reason: none }. An I/O error or a bad line of that leaf writes nothing and skips the leaf for that wake. (B1, B2, C2, C4)
  - promptEndsWait sets { reason: none, since } whenever the wait is not none. (C2)
  - Release 1 deletes state.wait wherever it changes a wait: recordWait, the dispatch prompt, seatCommand, park; the merge_turn record takes the global lock with a fresh read; the merged leaf records before completeOwner. (B3, B4, C3)

## One truth: timings.jsonl, read cheaply (A, 2026-11-23, after D round 4; B and C both picked S3)

D rounds 2-4 found 10 holes, all at the seam between state.wait and timings.jsonl across two releases. The state cache was picked on a 212 ms figure that was mostly strict schema checks on rows the wake never uses; a plain parse of all 12 repos' files is ~55 ms (B).
- No state.wait, no visited key, no import, no forgetWait, no release pair: one release. The release keeps picks 3 and 4 and the F2 (lock), F3 and F4 fixes. (B,C)
- A wake reader in src/timing.ts parses each line as JSON, keeps only wait, prompt and visit_start, checks the schema on those, and skips a bad line with a structured warning (no other leaf affected). (B,C)
- One read per file per process: remember the byte offset and kept rows; later calls read only bytes added since, up to the last newline; a shorter file is read again from the start. In memory only, no index file. (B; C's disk index not taken: one more stored thing to invalidate)
- A manual seat appends a prompt row so its wait ends in the history. (C)
- Destination restated: the wake's timings read costs under 0.1 s per pass, figure recorded at landing. (B Q1 O1)
- Figure at e214179c (A accepts, 2026-11-23): fresh-process first pass over all 11 unpaused repos' logs (41.4 MB) 98-134 ms, median 110 ms; later passes 0.16-0.36 ms; base readTimings path ~2.4 s per day of wakes. The 0.1 s line was A's own restatement; it is not worth dropping the kept-row schema check or adding a cache file for ~10 ms. Destination recorded as "first pass ~0.1 s, later passes under 1 ms".
