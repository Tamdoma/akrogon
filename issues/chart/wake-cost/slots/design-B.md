# Design B: wake-cost

Code read on main at 814a2387. (H) marks what I measured on this host on 2026-11-23. To measure I ran `akrogon next --wake` five times, the command the brief names. Three runs had call counters added at load time from a scratch file. Nothing in the repo changed.

## Short answer

- One new `state.yaml` field, `wait`, replaces all three timings reads in the wake. The inventory default becomes open leaves only.
- Per wake (H): 22 timings reads cost 2.4 s and 155 inventory walks cost 1.9 s, of 7.0 to 9.3 s. After: 0 reads and about 0.15 s of walks.
- Residue: four things can go. The rest must stay in the schemas because old rows hold them.

## 1. Readers

Timings, wake path:
- T1. `src/next.ts:840`: per unpaused repo, which leaves wait on capacity and since when (`capacityWaits`, `src/timing.ts:128-139`). 12 reads per pass, one per repo.
- T2. `src/timing.ts:142`: the leaf's last wait reason, so the same reason is not appended twice. Called from `src/next.ts:674, :728, :765, :772, :1023`.
- T3. `src/next.ts:703`: does this leaf have any `visit_start` row. It only matters before the leaf's first phase move, since every move writes one (`src/phase.ts:288`).
- Place for all three: one optional field `wait: { reason, since }` in the state schema (`src/state.ts:125`). `recordWait` takes the leaf, compares `state.wait.reason`, appends the row and saves the state. T1 becomes the open leaves with `wait.reason` capacity, sorted by `since`. T3 becomes `state.wait === undefined`.
- Not on the wake path, unchanged: `src/status.ts:116`, `src/timing-report.ts:234, :331`.
- F1. A failure class goes too. `readTimings` returns an empty list on one bad row (`src/timing.ts:101-104`). Today that empties the capacity queue and writes a new `visit_start` on every dispatch.

Inventory:
- I1. `src/state.ts:268`: the default `areas` becomes `['open']`.
- Open is enough for every caller in the wake: `discover` (`src/next.ts:109`, 20 call sites), `allLeaves` at `src/next.ts:962, :984, :988, :1042, :1074, :1116` (the holder is in `merge`), `src/phase.ts:319, :432, :975`, `src/reconcile.ts:281` (an open owner), `src/verify.ts:641`, `src/run-check.ts:187`, `src/config.ts:511`.
- Closed is needed, named at the call: `src/reconcile.ts:1307` (slices of closed leaves, once per pass), `src/status.ts:88, :742`. `src/park.ts:70` and `src/timing-report.ts:431` name it already.
- I2. Dependencies. `src/turn.ts:26-35`: a `blocked-by` slug that is no open leaf is looked up by slug with the walk `slugFolders` already does (`src/state.ts:329-346`, no parsing, 12 ms for 1,112 closed leaves (H)) and one `readState`. `eligibility` (`src/turn.ts:62-68`) calls `unmergedDeps` in place of its own copy.
- F2. That lookup is rare. Leaves of one owner stay in open until the owner closes. 0 of the framework's 4 open leaves have a dependency outside open (H).
- I3. `src/next.ts:884-898`, the block that wakes dependents of closed leaves, goes. The wake filter at `:846-848` gains one term: a `blocked-by` slug that is no open leaf.

## 2. Residue

- D1. `Batch.decision` (`src/state.ts:83`): no reader, no writer, in no state file. Delete, with the fixture line `tests/green-merge.test.ts:485`.
- D2. Attempt `members` (`src/attempts.ts:35`): no reader, no writer. The schema is loose, so the 197 old rows still parse. Delete.
- D3. Outcome `split` (`src/attempts.ts:8`): 0 stored rows. Delete, with `tests/merge-attempts.test.ts:539`.
- D4. `issues/red-records.jsonl`: no code names it. Tracked in both repos (239 and 18 lines). `git rm`, one commit per repo.
- K1. Outcomes `held`, `reuse`, `ejected`: nothing writes them, but 21 old rows hold them (10-10 to 10-14) and `src/timing-report.ts:354` counts `ejected`. Removing an enum value fails those rows. Keep.
- K2. `members` on the timing `batch` event (`src/timing.ts:69`): no reader, no writer, 158 old rows, strict object. Removing it makes the whole file read as empty (F1). Keep.
- K3. `reused` (`src/verify.ts:79`): no writer, 22 old rows (10-26 to 10-29), strict schema, so the key stays. Its 7 reader branches (`src/verify.ts:226, :333, :364, :459, :470`, `src/flaky.ts:120, :158`) can go: the rows are far outside the last-20 windows (`src/verify.ts:494, :533, :553`). I did not check the flaky window.
- K4. Repo key `fix_rounds`: read by the door (`skills/chart-issues/assets/direct-route.md:23`). Keep, as the map says.

## 3. Cost per wake (H)

- 12 registered repos. The framework has 4 open and 1,112 closed leaves and a 30.3 MB `timings.jsonl` of 102,537 rows. One read there: `readTimings` 212 ms (39 ms without the schema check), inventory 83 ms with closed, 1 ms open only.
- Three counted wakes: 22 reads (2.36, 2.37, 2.84 s) and 155 walks (1.82, 1.84, 2.03 s) in 7.0, 7.7 and 9.3 s. Two plain wakes took 18.0 and 21.6 s. I did not trace the extra time. The brief's 38 reads and 25 walks do not match today's count.
- After: 0 reads. 155 open walks plus one closed walk per repo in reconcile, about 0.15 s. A wake drops by about 4.2 s, and stops growing with the file. `run-check` drops 82 ms per run.

## 4. Final shape

- A1. The `wait` field, and `recordWait` on the leaf. Gone: `capacityWaits`, the `RepoWaits` type, three reads. A3. D1 to D4.
- A2. The default flip, three named callers, I2 and I3. Gone: 15 lines at `src/next.ts:884-898` and the copy in `eligibility`.
- R1. Duplicate slugs. `repoInventory` hides a slug that exists in both open and closed (`src/state.ts:280-288`). Open only, the wake no longer sees that. `findLeaf` still refuses it for every phase command (`src/state.ts:360`).
- R2. `akrogon next <closed slug>` reaches `src/next.ts:677` and would report a missing leaf. I did not trace `selectLeaves` (`:1417, :1439`).
- R3. A check run from a closed leaf's worktree stops at `src/run-check.ts:209`. Today it finds the leaf.
- R4. An unreadable closed leaf no longer takes a capacity slot (`src/next.ts:398`). R5. `akrogon seat` on a capacity waiter leaves `wait` set until the next pass clears it (`src/next.ts:803`).

Forks:
- Q1. Where the wake's facts live. O1 one `wait` field (pick). O2 read timings once per pass and keep it in memory: still 212 ms per pass and per phase move, and growing.
- Q2. Upgrade. Open leaves have no `wait` yet, so each gets one extra `visit_start`, and one extra visit in the report. O1 accept, 4 leaves today (pick). O2 skip the row when the leaf has a log row.
- Q3. R1. O1 accept, the phase commands refuse (pick). O2 the dependency walk in I2 also flags a slug found twice.
- Q4. K3. O1 delete the 7 `reused` branches (pick, after a look at the flaky window). O2 keep them.
