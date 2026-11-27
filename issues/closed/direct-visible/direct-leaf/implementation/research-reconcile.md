# Research: src/reconcile.ts and src/stop.ts — teardown, slice stops, seat resolution

Worktree: /home/ivan/.akrogon/worktrees/akrogon/direct-leaf
Line numbers verified against the files in this worktree. All quotes are verbatim.

Files covered: src/reconcile.ts (1465 lines), src/stop.ts (132 lines), plus the imported functions they depend on in src/hc.ts, src/scope.ts, src/admission.ts, src/state.ts, src/verify-pass.ts, src/config.ts, and the call-site wiring in src/next.ts.

---

## Q1. Every function that starts/ends/kills/renames/labels/closes terminals or processes, or stops systemd slices/units

### In src/reconcile.ts

| Function | Lines | What it does | How it finds targets |
|---|---|---|---|
| `leafSeats(session, repo, state)` | 405-419 | read-only resolution of seat terminals | label query `{ akrogon: '1', 'akrogon.repo': repo.name, 'akrogon.leaf': state.slug }` via `terminals(session, labels, all=true)`, then cross-checked against `state.seat.A/B` refs (session + address + `akrogon.seat` label). See Q7. |
| `endSeats(session, repo, state)` | 422-425 | kills+removes both seat terminals | whatever `leafSeats` returns; calls `end(session, t.address)` per seat |
| `closeLeaf(session, repo, state, tab)` | 428-431 | seats end, then tab close | `endSeats` + `closeTab(session, tab)` gated on `windowOpen(session)` |
| `closeMergedTab(repo, leaf, live)` | 435-446 | ends seats and closes tab of a merged leaf | tab from `leaf.state.tab`; seats via `leafSeats`; session via `repoSpace(repo)`; tab-liveness via `tabLive(live, tab)` which matches label `herdr.tab` |
| `closeTabOf(worktree, tab, leaf)` | 735-749 | wrapper: `closeLeaf` inside the repo's resolved session, errors become keeps | `repoSpace(repo)` session; private to `reconcile()` |
| `endFinishedSeats(path, leaf)` | 752-767 | ends seats of a merged leaf whose tab is already gone | `endSeats` in `repoSpace(repo)` session; private to `reconcile()` |
| `stopSlice(slice)` | 225-231 | `systemctl --user stop <slice>` | slice name passed in; re-checks `liveRuns()` record slices under `admission.lock` before stopping |
| slice-stop loop inside `reconcile()` | 574-593 | stops loaded leaf slices | `leafSlice(repo, leaf.state.slug, homePath())` per leaf, filtered by `sliceKeepReason` |
| slice-stop loop inside `reconcileHost()` | 1306-1331 | host-wide stop of loaded `akrogon-l*.slice` | slice-to-leaf map built from `repoInventory(repo, ['open','closed'])` across all registered repos |
| `systemctl(...args)` | 127-137 | primitive: spawn `systemctl --user` with pinned bus env, failure is Result not throw | — |
| `loadedUnits(pattern)` / `loadedLeafSlices()` | 139-153 | lists loaded units matching a pattern; null means "manager unreachable" | pattern `akrogon-l*.slice` with `--all` |

Nothing in reconcile.ts starts, renames, or labels terminals. Tab rename exists only in src/next.ts `renameTabs` (lines 1600-1626) using hc.ts `renameTab`.

### In src/stop.ts

| Function | Lines | What it does | How it finds targets |
|---|---|---|---|
| `stopLeaf(repo, leaf)` | 64-80 | the full stop sequence (see Q2) | seats: `endSeats` (labels + seat refs); slice: `leafSlice(repo, leaf.state.slug, homePath())`; run records: `cancelLeafRuns(repo.name, leaf.state.slug)` matched by record fields `repo`/`leaf`; passes: `listPassRecords()` filtered by `record.repo` + `record.caller.slug` |
| `stopCommand(target, all, cwd)` | 82-119 | CLI entry; selects leaves, writes stopped.yaml, calls `stopLeaf` | selection: see Q3 |

Nothing in stop.ts starts, renames, or labels terminals. No label queries appear in stop.ts at all; all terminal targeting goes through `endSeats` in reconcile.ts.

### Imported primitives that do the actual work

src/hc.ts:
```
366: // `hc kill` of an already finished terminal exits 0, so kill then rm needs no special case.
367: export async function end(session: string, address: string): Promise<void> {
368:   await hc(session, ['kill', address]);
369:   await hc(session, ['rm', address]);
370: }
```
```
285: export async function terminals(
286:   session: string,
287:   labels: Record<string, string>,
288:   all: boolean = false,
289: ): Promise<Seen[]> {
290:   const listed = await rpc(session, 'terminal.list', { all, labels }, z.object({ terminals: z.array(terminalSchema) }));
291:   return listed.terminals.map((t: Terminal) => seen(session, t));
292: }
```
```
723: export async function windowOpen(session: string): Promise<boolean> {
724:   const result: SpawnResult = await app(session, ['ls']);
725:   if (result.code === 0) return true;
726:   if (result.stderr.includes('no Herdr window')) return false;
727:   throw new CommandError(['herdr-app', 'ls'], process.cwd(), result);
728: }
```
```
735: export function renameTab(session: string, tab: string, name: string): Promise<void> {
736:   return appDo(session, ['tab.rename', '--id', tab, '--name', name]);
737: }
739: export function closeTab(session: string, tab: string): Promise<void> {
740:   return appDo(session, ['tab.close', '--id', tab]);
741: }
```
Also `label(session, address, labels)` at hc.ts:361-363 and `run(session, spec)` at hc.ts:319-353 (terminal start primitive) — neither is called from reconcile.ts or stop.ts.

src/scope.ts:
```
8: export function leafSlice(repo: Pick<Repo, 'name'>, slug: string, home: string): string {
9:   const key: string =
10:     resolve(home) === resolve(homedir(), '.akrogon') ? `${repo.name}/${slug}` : `${resolve(home)}:${repo.name}/${slug}`;
11:   return `akrogon-l${createHash('sha256').update(key).digest('hex').slice(0, 12)}.slice`;
12: }
```
```
125: // A unit to stop, with the read that tells a refused stop from a unit already gone.
126: export type RunUnit = { unit: string; gone: () => boolean };
128: // One call per unit: a single stop job fails whole when a unit name is not loaded.
129: // Callers may run under a check whose bus is cut, so the address is pinned. Every
130: // unit is tried; a failed stop is excused only when the unit's gone read says so.
131: // Otherwise the first stop error throws once all units were tried.
132: export async function stopRunUnits(...units: RunUnit[]): Promise<void> {
133:   const env: NodeJS.ProcessEnv = sessionBusEnv();
134:   const failed: CommandError[] = [];
135:   for (const { unit, gone } of units) {
136:     const argv: string[] = ['systemctl', '--user', 'stop', unit];
137:     const result: SpawnResult = await spawnCaptured(argv, { env });
138:     if (result.code !== 0 && !gone()) failed.push(new CommandError(argv, process.cwd(), result));
139:   }
140:   if (failed.length > 0) throw failed[0];
141: }
```
```
169: // A unit inside a slice, gone once its cgroup holds no process.
170: export const sliceUnit = (slice: string, unit: string): RunUnit => ({
171:   unit,
172:   gone: (): boolean => !unitPopulated(slice, unit),
173: });
```

src/admission.ts:
```
286: export const recordUnits = (record: RunRecord): RunUnit[] => [
287:   sliceUnit(record.slice, record.unit),
288:   sliceUnit(record.slice, `${runUnitBase(record.run)}-guard.service`),
289: ];
```

---

## Q2. How stopLeaf stops live runs — exact sequence and reusable signatures

stop.ts:53-80, verbatim:

```
55: // The leaf's seat terminals end before its slice stops (plan D19). A refused session is never called
56: // (L2); the slice stop still ends the seat processes, which run inside it. The slice stop goes first
57: // and a refused one throws before any record is touched, so a live land never reads a cancelled run as
58: // a red verify. A land's verify pass and its check runs sit outside the leaf slice, so they are
59: // stopped after it; the land hold keeps the repo line while they run (admission live()). Every run
60: // record of the leaf is cancelled before that, so a waiting run or a live one yet to launch never
61: // launches, and a run of the leaf that arrives later is refused. The run scopes stop before the
62: // passes: a pass's checks carry its PID, so the live pass keeps the hold while their scopes drain,
63: // and a failed scope stop throws with the pass, and so the hold, left for the retry.
64: async function stopLeaf(repo: Repo, leaf: Leaf): Promise<void> {
65:   const space: SpaceResolution = await repoSpace(repo);
66:   if (space.ok) await endSeats(space.session, repo, leaf.state);
67:   // A refused leaf-slice stop is never excused.
68:   await stopRunUnits({ unit: leafSlice(repo, leaf.state.slug, homePath()), gone: (): boolean => false });
69:   const live: RunRecord[] = await cancelLeafRuns(repo.name, leaf.state.slug);
70:   // A pass holds the line through its own process, so that is what its stop must end.
71:   const passes: RunUnit[] = listPassRecords()
72:     .filter(
73:       (entry) =>
74:         entry.record.repo === repo.name && entry.record.caller.slug === leaf.state.slug && passLive(entry.record),
75:     )
76:     .map((entry) => ({ unit: entry.record.unit_name, gone: (): boolean => !passLive(entry.record) }));
77:   await stopRunUnits(...live.filter((record: RunRecord) => record.land !== true).flatMap(recordUnits));
78:   await stopRunUnits(...passes);
79:   console.log(`stopped: ${repo.name}/${leaf.state.slug}`);
80: }
```

Exact order:
1. `repoSpace(repo)` — resolve the hc session holding the repo space. If refused (`!space.ok`), seat teardown is skipped entirely (no throw); the slice stop below still kills the seat processes.
2. `endSeats(space.session, repo, leaf.state)` — kill+rm seat terminals A and B (label+ref resolution, Q7).
3. `stopRunUnits({ unit: leafSlice(repo, leaf.state.slug, homePath()), gone: () => false })` — stop the leaf slice FIRST, before touching any run record. `gone` is hard-coded false, so a refused slice stop always throws (`CommandError`); nothing after it runs on failure.
4. `cancelLeafRuns(repo.name, leaf.state.slug)` — returns `RunRecord[]` of the leaf's live records. Semantics (admission.ts:262-276): waiting records become `state: 'cancelled'` and leave the line; live records only get a `cancel: true` mark (they stay in `liveRuns()` so a stop retry still finds their units; a live run not yet launched reads the mark via `runCancelled` and never launches).
5. `listPassRecords()` filtered to `record.repo === repo.name && record.caller.slug === leaf.state.slug && passLive(record)`, mapped to `RunUnit`s of `record.unit_name` with `gone: () => !passLive(record)`.
6. `stopRunUnits(...live.filter(r => r.land !== true).flatMap(recordUnits))` — stop non-land run scopes and their guards. `recordUnits` yields two `RunUnit`s per record: the scope (`record.unit`) and `akrogon-run-<run>-guard.service`, both with cgroup-populated `gone` reads. Land records are excluded: a land hold never starts units, so there is nothing to stop (admission.ts:294-295).
7. `stopRunUnits(...passes)` — verify-pass units stop after run scopes, because a pass's check runs carry its PID and the pass keeps the repo line while they drain. A failed scope stop throws before this, leaving passes (and the line hold) for the retry.

RunRecord fields (admission.ts:28-45): `token_hash, pid, start_time, boot_id, repo, leaf, check, state: 'waiting'|'live'|'ended'|'cancelled', run, slice, scope, unit, full, attempt?, land?: true, cancel?: true, since`.

Signatures a drop verb could reuse verbatim:
- `endSeats(session: string, repo: Repo, state: State): Promise<void>` — exported from reconcile.ts:422.
- `stopRunUnits(...units: RunUnit[]): Promise<void>` — exported from scope.ts:132; `RunUnit = { unit: string; gone: () => boolean }` (scope.ts:126).
- `sliceUnit(slice: string, unit: string): RunUnit` — exported from scope.ts:170, cgroup-population-based gone read.
- `leafSlice(repo: Pick<Repo,'name'>, slug: string, home: string): string` — exported from scope.ts:8.
- `cancelLeafRuns(repo: string, leaf: string): Promise<RunRecord[]>` — exported from admission.ts:267.
- `recordUnits(record: RunRecord): RunUnit[]` — exported from admission.ts:286.
- `listPassRecords(): { dir: string; record: PassRecord }[]` — verify-pass.ts:72; `passLive(record: PassRecord): boolean` — verify-pass.ts:102 (pending records: live if younger than 30 s; otherwise boot-id match + pid alive).
- `repoSpace(repo): Promise<SpaceResolution>` — hc.ts:231, memoized per repo name; `SpaceResolution = { ok: true; session; space } | { ok: false; scope: 'repo'|'invocation'; reason }` (hc.ts:226-228).

`stopLeaf` itself is NOT exported (private, stop.ts:64). Its only caller is `stopCommand`.

---

## Q3. How stop --all selects leaves — and whether a tab-less leaf with live runs is included

stop.ts:82-105:

```
82: export async function stopCommand(target: string | undefined, all: boolean, cwd: string): Promise<void> {
83:   const repo: Repo = await requireRepo(readGlobal(), cwd);
84:   const inv: Inventory | null = all ? repoInventory(repo, ['open']) : null;
...
99:   const leaves: Leaf[] =
100:     inv !== null
101:       ? inv.leaves.filter(
102:           (leaf: Leaf) =>
103:             (leaf.state.tab !== undefined || leaf.state.batch !== undefined) && leaf.state.phase !== 'merged',
104:         )
105:       : [findLeaf(repo, z.string().parse(target))];
```

Selection for `--all`: inventory covers only `issues/open` (`repoInventory(repo, ['open'])`). A leaf is selected iff:
- `state.tab !== undefined` OR `state.batch !== undefined`, AND
- `state.phase !== 'merged'`.

Answer: NO. A leaf with no recorded tab and no batch is excluded from `stop --all` even if it has live runs. Live runs play no part in the filter at all. `state.worktree` is also irrelevant to the filter. Merged leaves are always excluded. (Single-target stop has no such filter: it uses `findLeaf(repo, target)` directly.)

Note: the stopped.yaml write at lines 106-108 records every selected leaf BEFORE any `stopLeaf` runs, and for `--all` each leaf's failure is caught per leaf (lines 110-118, `CommandError`/`HcError` only).

---

## Q4. broadcastInProgress — exact logic

reconcile.ts:190-200, verbatim:

```
190: function broadcastInProgress(state: State, live: Seen[] | null): boolean {
191:   return (
192:     broadcastPending(state) ||
193:     (state.phase === 'merged' &&
194:       state.broadcast !== undefined &&
195:       (live === null ||
196:         live.some(
197:           (t: Seen) => t.address === state.seat.B?.address && t.status?.state !== 'idle' && t.status?.state !== 'done',
198:         )))
199:   );
200: }
```

Supporting, state.ts:175-178:

```
175: // commitMove clears `prompted`, so on a merged leaf only the broadcast dispatch sets prompted.B.
176: export function broadcastPending(state: State): boolean {
177:   return state.phase === 'merged' && state.broadcast !== undefined && state.prompted.B === undefined;
178: }
```

Logic, exactly:
- True if `broadcastPending(state)`: phase merged, `state.broadcast` defined, and `state.prompted.B` undefined (broadcast seat B not yet dispatched/prompted).
- Otherwise true only when phase is merged AND `state.broadcast` is defined AND either:
  - `live === null` (the terminal list is unavailable — conservative hold), or
  - some terminal in `live` has `t.address === state.seat.B?.address` AND `t.status?.state` is neither `'idle'` nor `'done'`.

How it reads B's terminal: by exact address match against the recorded seat ref `state.seat.B?.address`. There is NO session comparison at this site (unlike `leafSeats`, which checks `ref.session === session`). The `live` list is already session-scoped by the callers:
- For `reconcile()`: next.ts:1768 `const live: Seen[] | null = needsPanes ? await repoTerminals(repo) : [];` where `repoTerminals` (next.ts:261-268) lists every terminal in the repo's resolved session, unfiltered labels, default `all=false` (live terminals only, finished excluded):

```
259: // Reconcile's view of the repo's session: every live terminal in it, labelled or not (plan D20). A
260: // refused session or a failed listing is unknown (null), which keeps every terminal-dependent item.
261: async function repoTerminals(repo: Repo): Promise<Seen[] | null> {
262:   const resolution: SpaceResolution = await repoSpace(repo);
263:   if (!resolution.ok) return null;
264:   return terminals(resolution.session, {}).catch((error: unknown): null => {
265:     if (error instanceof HcError) return null;
266:     throw error;
267:   });
268: }
```

- For `closeMergedTab` in next.ts:1638 the same `repoTerminals(repo)` is passed.
- For `reconcileHost()`: `panesForRepo` is `repoTerminals` too (next.ts:1776). Caveat: for a leaf with NO recorded tab, reconcileHost passes the raw `panes` variable which is initialized to the `live` argument — and next.ts:1776 passes `null` for it, so `view` is `null` for tab-less leaves in the host pass (see Q6).

Consequence for a merged leaf's cleanup hold: cleanup stays held while the broadcast seat B is unprompted, or while B's terminal is visible in the repo session with a working status. It releases when B's terminal disappears from the live list (ended/removed) or reports status idle/done. If the pane list cannot be read at all, the hold never releases. The `status.state` strings are free-form (`z.string()`, hc.ts:13-17); only 'idle' and 'done' count as finished here.

---

## Q5. leafTemp keep/remove decision, including the 'unit list unavailable' keep

reconcile.ts:1194-1228, verbatim (inside the scratch-root sweep; `dir` is the leaf's temp dir, `leaf` the owning leaf record):

```
1194:         if (leaf !== undefined) {
1195:           // A leaf's temp lives only while its seat or a check uses it. Only
1196:           // finished leaves report what stays; a finished leaf's temp also
1197:           // stays while its slice still holds a running unit (D2).
1198:           const done: boolean = finished(leaf);
1199:           if (broadcastInProgress(leaf.state, live))
1200:             keep(dir, 'broadcast in progress', 'removed once the broadcast seat finishes');
1201:           else if (live === null) {
1202:             if (done) keep(dir, 'pane list unavailable', 'restore hc terminal reads and retry cleanup');
1203:           } else if (union === null) {
1204:             if (done) keep(dir, 'pane union unavailable', 'restore hc terminal reads and retry cleanup');
1205:           } else if (tabLive(live, leaf.state.tab) || livePaneInside(panesUnion, dir)) {
1206:             if (done) keep(dir, 'live pane inside', 'removed once the pane closes or leaves this path');
1207:           } else if (kept.length === keptBefore) {
1208:             // An unreadable unit inventory is no proof of a busy slice, so the
1209:             // temp is kept for every phase instead of falling to dropChecked.
1210:             if (loadedSlices === null) {
1211:               keep(dir, 'unit list unavailable', 'restore the systemd unit inventory and retry cleanup');
1212:               continue;
1213:             }
1214:             const slice: string = leafSlice(repo, leaf.state.slug, homePath());
1215:             if (
1216:               loadedSlices !== null &&
1217:               loadedSlices.has(slice) &&
1218:               !stoppedSlices.has(slice) &&
1219:               (await sliceHasProcess(slice))
1220:             )
1221:               keep(dir, 'slice holds a running unit', 'removed once the unit exits');
1222:             else {
1223:               dropChecked(dir);
1224:               continue;
1225:             }
1226:           }
1227:           continue;
1228:         }
```

Decision chain, in order:
1. If `broadcastInProgress(leaf.state, live)` — keep, unconditionally (any phase).
2. `live === null` (pane list unavailable): keep only if the leaf is finished (`merged`/`failed`); an unfinished leaf falls through to `continue` and is simply not reported — the dir survives unreported either way, since nothing drops it in this branch.
3. `union === null`: same, keyed on the cross-session union.
4. Tab still live (`herdr.tab` label match) or a pane cwd inside the dir: keep only if finished.
5. Otherwise, if no run-* child of the temp dir already recorded a keep (`kept.length === keptBefore` — a kept live run inside the temp means the whole dir stays implicitly, without a dir-level keep entry):
   - **'unit list unavailable' keep (lines 1210-1213): if the systemd unit inventory could not be read (`loadedSlices === null`, i.e. `systemctl list-units` failed), the temp is kept for EVERY phase — including unfinished leaves. The comment: an unreadable unit inventory is no proof of a busy slice, so the temp is kept rather than falling through to `dropChecked` which would delete it.**
   - Else, if the leaf's slice is loaded, was not already stopped this pass, and still holds a process (`sliceHasProcess` reads cgroup.procs recursively, scope cgroup tree): keep 'slice holds a running unit'.
   - Else `dropChecked(dir)` — delete after pane-cwd, process-inside, and owner vetoes.

Also relevant: `leafTemp(repo, slug)` is a hash path — config.ts:422-426:

```
422: export function leafTemp(repo: Repo, slug: string): string {
423:   const root: string = leafTempRoot();
424:   const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
425:   return resolve(root, hex(repo.root).slice(0, 4), hex(repo.root + '\n' + slug).slice(0, 8));
426: }
```
Root default `/var/tmp/akr-<uid>` (config.ts:407-412). Dirs are matched back to leaves by basename at reconcile.ts:1148-1150 (`scratchByDir`).

---

## Q6. reconcileHost slice keep for a merged leaf

reconcile.ts:1306-1331:

```
1306:   const loaded: Set<string> | null = await loadedLeafSlices();
1307:   if (loaded !== null) {
1308:     const leafOf: Map<string, { repo: Repo; leaf: Leaf }> = new Map();
1309:     for (const repo of repos)
1310:       for (const leaf of repoInventory(repo, ['open', 'closed']).leaves)
1311:         leafOf.set(leafSlice(repo, leaf.state.slug, homePath()), { repo, leaf });
1312:     const own: Set<string> = ownSlices();
1313:     const runs: Set<string> = new Set(liveRuns().map((record) => record.slice));
1314:     for (const slice of [...loaded].sort()) {
1315:       const match: { repo: Repo; leaf: Leaf } | undefined = leafOf.get(slice);
1316:       if (match !== undefined) {
1317:         const view: Seen[] | null = match.leaf.state.tab === undefined ? panes : await repoView(match.repo);
1318:         const reason: string | null = sliceKeepReason(slice, match.leaf, view, own, runs);
1319:         if (reason !== null) {
1320:           keep(slice, reason, 'removed once the pass, recorded run or live tab ends and pane inventory is available');
1321:           continue;
1322:         }
1323:         if (!acting.has(match.repo.name)) {
1324:           keep(slice, 'repo not reconciled by this pass', 'removed by a pass for that repo from its own hc session');
1325:           continue;
1326:         }
1327:         const error: string | null = await stopSlice(slice);
1328:         if (error !== null) keep(slice, error, 'resolve the systemd stop error and retry cleanup');
1329:       }
1330:     }
1331:   }
```

The keep/stop decision is entirely `sliceKeepReason` (reconcile.ts:203-223, quoted in Q10) plus the `acting` gate. For a merged leaf the effective chain is:
1. 'own slice' — the pass's own cgroup contains the slice.
2. 'live run record' — any live run record names the slice.
3. 'broadcast in progress' — `broadcastInProgress(leaf.state, view)` (see Q4).
4. 'merge batch' — only for phase 'merge' with batch, so never for a merged leaf.
5. 'unfinished leaf' — requires tab undefined AND not finished; a merged leaf is finished, so never.
6. 'state predates hc' — pre-hc records always keep.
7. If a tab is recorded: `view === null` → keep 'pane list unavailable'; tab live in view → keep 'live tab'.
8. Otherwise null → STOP, but only if the leaf's repo is in `acting` (reconciled by this pass). Not in acting → keep 'repo not reconciled by this pass'.

View selection subtlety (line 1317): for a leaf WITH a recorded tab, `view` is the per-repo session pane list `repoView(repo)` (which is `repoTerminals`, i.e. the repo's own hc session — a tab is only visible there). For a leaf with NO recorded tab, `view` is the `panes` variable — which at this point is still the raw `live` argument passed to `reconcileHost` (next.ts:1776 passes `null`; the lazy `panesOnce()` fetch only happens inside `livePanes()`, which the slice loop never calls). So for a tab-less merged leaf in the host pass, `view` is `null`. Consequences:
- `broadcastInProgress` with `view === null` returns true whenever `state.broadcast` is defined → keep 'broadcast in progress'.
- A tab-less merged leaf with NO broadcast: sliceKeepReason hits none of branches 1-7 (branch 7 requires tab defined) → returns null → slice stops, provided the repo is in `acting`.
- A slice matching NO leaf in any registered repo (`leafOf`, open+closed areas) is left completely alone — no stop, no keep entry (comment lines 1268-1270: it may belong to another akrogon home, #151).

---

## Q7. leafSeats — labels, refs, or both

BOTH: a label-filtered listing cross-checked against the recorded refs. reconcile.ts:401-419 verbatim:

```
401: export type Seats = { A: Seen | undefined; B: Seen | undefined };
403: // A terminal is the leaf's seat only when its labels name the repo, leaf and seat and its address is
404: // the one state recorded (plan D4); finished seats are listed too.
405: export async function leafSeats(session: string, repo: Repo, state: State): Promise<Seats> {
406:   if (state.seat.A === undefined && state.seat.B === undefined) return { A: undefined, B: undefined };
407:   const listed: Seen[] = await terminals(
408:     session,
409:     { akrogon: '1', 'akrogon.repo': repo.name, 'akrogon.leaf': state.slug },
410:     true,
411:   );
412:   const owned = (slot: 'A' | 'B'): Seen | undefined => {
413:     const ref: SeatRef | undefined = state.seat[slot];
414:     return ref === undefined || ref.session !== session
415:       ? undefined
416:       : listed.find((t: Seen) => t.address === ref.address && t.labels['akrogon.seat'] === slot.toLowerCase());
417:   };
418:   return { A: owned('A'), B: owned('B') };
419: }
```

Precisely:
- Listing: `terminals(session, { akrogon: '1', 'akrogon.repo': repo.name, 'akrogon.leaf': state.slug }, true)` — the `all=true` third argument includes finished terminals.
- A seat counts only if ALL hold: the ref exists in `state.seat[slot]`; `ref.session === session` (the session passed in, which callers always set to the repo's resolved session); the terminal's address equals `ref.address`; AND the terminal carries label `akrogon.seat` = `'a'`/`'b'`.
- Labels alone are never sufficient, and the ref alone is never sufficient — a terminal needs both the label-set membership and the recorded address+session.
- `SeatRef` shape (state.ts:48-50): `z.strictObject({ session: text, address: text })`.

---

## Q8. Sites reading state.seat refs directly (not labels)

In src/reconcile.ts — exactly three code sites (plus one type import):
1. **reconcile.ts:197** — `broadcastInProgress`: `(t: Seen) => t.address === state.seat.B?.address && ...`. Uses the B seat's recorded ADDRESS only. No session check.
2. **reconcile.ts:406** — `leafSeats` early return: `if (state.seat.A === undefined && state.seat.B === undefined) return { A: undefined, B: undefined };`.
3. **reconcile.ts:413-414** — `leafSeats` owned(): `const ref: SeatRef | undefined = state.seat[slot]; return ref === undefined || ref.session !== session ? undefined : listed.find(... t.address === ref.address ...)`. Uses both session and address.
4. **reconcile.ts:753** — `endFinishedSeats`: `if (leaf.state.seat.A === undefined && leaf.state.seat.B === undefined) return true;` (presence check only).
5. reconcile.ts:41 — `type SeatRef` import (not a read).

In src/stop.ts: NONE. stop.ts never reads `state.seat` directly; seat access goes through `endSeats` imported from reconcile.ts.

---

## Q9. How endSeats/closeLeaf/closeMergedTab/endFinishedSeats find seats

All four funnel through `leafSeats` (Q7). So yes: seat terminals are found by the `akrogon`/`akrogon.repo`/`akrogon.leaf` label query, but a terminal only counts as a seat when its address and session match the recorded `state.seat` ref AND it carries the matching `akrogon.seat` label. Kill targets are addresses, never labels.

```
421: // Teardown (plan D19): each recorded seat terminal is killed and removed.
422: export async function endSeats(session: string, repo: Repo, state: State): Promise<void> {
423:   const found: Seats = await leafSeats(session, repo, state);
424:   for (const t of [found.A, found.B]) if (t !== undefined) await end(session, t.address);
425: }
```
```
427: // A finished leaf's close: its seats end, then its tab closes when a window shows it.
428: async function closeLeaf(session: string, repo: Repo, state: State, tab: string): Promise<void> {
429:   await endSeats(session, repo, state);
430:   if (await windowOpen(session)) await closeTab(session, tab);
431: }
```
```
433: // The close runs only in the session holding the repo space: every recorded seat terminal, live or
434: // finished, is killed and removed, then a tab a live terminal still held closes when a window shows it.
435: export async function closeMergedTab(repo: Repo, leaf: Leaf, live: Seen[] | null): Promise<boolean> {
436:   const tab: string | undefined = leaf.state.tab;
437:   if (tab === undefined || live === null || broadcastInProgress(leaf.state, live)) return false;
438:   const resolved: SpaceResolution = await repoSpace(repo);
439:   if (!resolved.ok) return false;
440:   const seats: Seats = await leafSeats(resolved.session, repo, leaf.state);
441:   const open: boolean = tabLive(live, tab);
442:   if (!open && seats.A === undefined && seats.B === undefined) return false;
443:   for (const t of [seats.A, seats.B]) if (t !== undefined) await end(resolved.session, t.address);
444:   if (open && (await windowOpen(resolved.session))) await closeTab(resolved.session, tab);
445:   return true;
446: }
```
```
751:   // A merged leaf whose tab no live terminal holds may still have finished seat terminals: remove them.
752:   async function endFinishedSeats(path: string, leaf: Leaf): Promise<boolean> {
753:     if (leaf.state.seat.A === undefined && leaf.state.seat.B === undefined) return true;
754:     const resolved: SpaceResolution = await repoSpace(repo);
755:     if (!resolved.ok) {
756:       keep(path, 'repo session unavailable', 'resolve the repo session refusal and retry cleanup');
757:       return false;
758:     }
759:     try {
760:       await endSeats(resolved.session, repo, leaf.state);
761:     } catch (error) {
762:       if (!(error instanceof HcError || error instanceof CommandError)) throw error;
763:       keep(path, error.message, 'resolve the seat teardown error and retry cleanup');
764:       return false;
765:     }
766:     return true;
767:   }
```

Tab targeting is separate: tabs are matched by the `herdr.tab` label, not seats. reconcile.ts:272-275:

```
272: // A live tab is a live terminal labelled with it (plan D20).
273: function tabLive(live: Seen[], tab: string | undefined): boolean {
274:   return tab !== undefined && live.some((t: Seen) => t.labels['herdr.tab'] === tab);
275: }
```
`closeTab(session, tab)` itself takes the tab id recorded in `state.tab` and issues `herdr-app do tab.close --id <tab>`.

Additional detail on `closeMergedTab`: it no-ops (returns false) when tab is undefined, panes unavailable, or a broadcast is in progress; also when nothing is open and no seats exist (line 442). Note the tab close is gated on `windowOpen` everywhere — no window, no close, but seats still end.

---

## Q10. Where a leaf's tab being gone leads to slice stopping — and the tab-less case

Two places.

First, inside `reconcile()` — the per-repo slice step, reconcile.ts:570-593:

```
570:   // The slice step runs before leaf temp and unowned-item checks so a later
571:   // sweep in the same pass already sees stopped slices. A loaded leaf slice is
572:   // stopped outright — killing leftovers is the point — unless it is the
573:   // pass's own, a live run names it, or its tab cannot be proven gone.
574:   const loadedSlices: Set<string> | null = await loadedLeafSlices();
575:   const stoppedSlices: Set<string> = new Set();
576:   {
577:     const own: Set<string> = ownSlices();
578:     const runs: Set<string> = new Set(liveRuns().map((record) => record.slice));
579:     for (const leaf of leaves) {
580:       const slice: string = leafSlice(repo, leaf.state.slug, homePath());
581:       if (loadedSlices === null || !loadedSlices.has(slice)) continue;
582:       const reason: string | null = sliceKeepReason(slice, leaf, live, own, runs);
583:       if (reason !== null) {
584:         keep(slice, reason, 'removed once the pass, recorded run or live tab ends and pane inventory is available');
585:         continue;
586:       }
587:       const error: string | null = await stopSlice(slice);
588:       if (error === null) {
589:         removed.push(slice);
590:         stoppedSlices.add(slice);
591:       } else keep(slice, error, 'resolve the systemd stop error and retry cleanup');
592:     }
593:   }
```

The keep oracle, reconcile.ts:202-223:

```
202: // Why a leaf-matched slice survives this pass, or null when it may stop.
203: function sliceKeepReason(
204:   slice: string,
205:   leaf: Leaf,
206:   live: Seen[] | null,
207:   own: Set<string>,
208:   runs: Set<string>,
209: ): string | null {
210:   if (own.has(slice)) return 'own slice';
211:   if (runs.has(slice)) return 'live run record';
212:   if (broadcastInProgress(leaf.state, live)) return 'broadcast in progress';
213:   // A merge batch can hold a running land unit inside the slice even with every seat gone.
214:   if (leaf.state.phase === 'merge' && leaf.state.batch !== undefined) return 'merge batch';
215:   if (leaf.state.tab === undefined && !finished(leaf)) return 'unfinished leaf';
216:   // An old herdr tab cannot be seen from hc, so a pre-hc leaf's seat may still run in its slice.
217:   if (predatesHc(leaf.state)) return 'state predates hc';
218:   if (leaf.state.tab !== undefined) {
219:     if (live === null) return 'pane list unavailable';
220:     if (tabLive(live, leaf.state.tab)) return 'live tab';
221:   }
222:   return null;
223: }
```

Second, the host-wide pass `reconcileHost` (quoted in Q6), which applies the same `sliceKeepReason` to every loaded `akrogon-l*.slice` matching any leaf record in any registered repo (open and closed areas), gated on `acting`.

"Tab proven gone" means: `tabLive(live, state.tab)` is false — no live terminal in the repo's session carries label `herdr.tab === state.tab` — with `live !== null` (the pane list itself must be readable; `live === null` keeps the slice as 'pane list unavailable').

What happens for a leaf with NO recorded tab (`state.tab === undefined`):
- If the leaf is NOT finished (phase other than merged/failed): line 215 keeps the slice as 'unfinished leaf'. Its slice is never stopped while unfinished.
- If the leaf IS finished (merged or failed) and has no tab: line 215 does not fire, line 218-220 does not fire (tab undefined). Unless branches 210-212 or 217 catch it (own slice, live run record, broadcast in progress, predates-hc), `sliceKeepReason` returns null and the slice is STOPPED. For a merged leaf with a broadcast, see Q4/Q6: `broadcastInProgress` with `live === null` counts as in-progress. Note `finished` is defined at reconcile.ts:233: `leaf.state.phase === 'merged' || leaf.state.phase === 'failed'`.

Also note line 581: when the unit inventory is unreadable (`loadedSlices === null`), the per-repo step skips every leaf — nothing is stopped, and no keep entries are recorded for slices in this step (the leafTemp step separately keeps temps with 'unit list unavailable', Q5).

---

## Cross-cutting reference notes

- `broadcastInProgress` is called from four places: sliceKeepReason (212), closeMergedTab (437), the worktree loop for worktree-less merged leaves (818) and worktree-holding leaves (854), and the leafTemp sweep (1199).
- `stopSlice` (225-231) double-checks `liveRuns()` under `admission.lock` immediately before `systemctl stop`; a live record appearing between `sliceKeepReason` and the stop vetoes it with 'live run record'.
- `ownSlices()` (scope.ts:191-196) reads the caller's own cgroup path so a pass running inside a leaf slice never stops its own slice.
- `sliceHasProcess` (reconcile.ts:184-188) treats an unreadable cgroup subtree as OCCUPIED — an unprovable slice is never treated as empty.
- `reconcileNeedsPanes` (453-509): pane listing is only fetched when a terminal-dependent candidate exists. Relevant slice-related conditions: any leaf temp existing (465), finished leaf with worktree (469), or — lines 498-508 — any finished-or-tabbed leaf whose slice is actually loaded (checked via `loadedLeafSlices()`; an unreadable unit inventory forces the conservative pane fetch).
- hc.ts `Seen` type (46-63): `status: { state: string; kind; msg } | null`; `labels: Record<string,string>`; `state: 'live'|'finished'`. `seen()` (65-67) overrides `cwd` with the foreground process cwd when present.
- The labels used for seat terminals at creation time are not visible in these two files; the query side only requires `akrogon=1`, `akrogon.repo=<repo>`, `akrogon.leaf=<slug>`, and per-slot `akrogon.seat=a|b` (verified at reconcile.ts:409 and 416).
- `end` on an already-finished terminal is safe: `hc kill` of a finished terminal exits 0 (hc.ts:366 comment).
