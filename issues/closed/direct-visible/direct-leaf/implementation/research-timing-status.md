# Research: timing, status, seats, cgroups — direct-leaf implementation support

Worktree: /home/ivan/.akrogon/worktrees/akrogon/direct-leaf (branch for the direct-leaf leaf).
Design source: /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/design.md (read in full).
Real leaf state read: /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/state.yaml.

Key upfront facts:

- `stateSchema` (src/state.ts:124-157) is `z.strictObject` and has **no `direct` field today**. Any state.yaml carrying `direct: true` currently fails to parse. The schema addition is mandatory, not optional.
- No akrogon code writes a fresh leaf `state.yaml` today. Lifecycle leaf states are written by the chart door (agent-authored) at handoff. `saveState` (src/state.ts:214-218) only rewrites existing states.

---

## Q1. src/timing-report.ts — visitGaps, callers, threading the direct flag

### visitGaps (src/timing-report.ts:166-199), verbatim

```ts
166  function visitGaps(events: TimingEvent[], slug: string, visit: Visit): string[] {
167    if (visit.end === null || visit.failed) return [];
168    const missing: string[] = [];
169    const slots: readonly Slot[] = visit.seatless ? [] : historicalSlots(visit.phase, visit.rounds);
170    const present: Slot[] = slots.filter((slot) => delivered(events, slug, visit, slot));
171    if (slots.length > 0 && present.length === 0) missing.push('prompt');
172    else for (const slot of slots.filter((slot) => !present.includes(slot))) missing.push(`prompt:${slot}`);
173    if (
174      visit.phase === 'check.review' &&
175      visit.rounds === 0 &&
176      !events.some(
177        (event) =>
178          event.kind === 'seat_done' &&
179          event.slug === slug &&
180          event.phase === visit.phase &&
181          event.visit === visit.visit &&
182          ms(event.ts) >= visit.start &&
183          (visit.end === null || ms(event.ts) <= visit.end),
184      )
185    )
186      missing.push('seat_done');
187    const paired: Set<TimingEvent> = new Set(checkPairs(events, slug, visit).map((pair) => pair.start));
188    for (const event of events)
189      if (
190        event.kind === 'check_start' &&
191        event.slug === slug &&
192        event.phase === visit.phase &&
193        ms(event.ts) >= visit.start &&
194        ms(event.ts) < visit.end &&
195        !paired.has(event)
196      )
197        missing.push(`check_end ${event.name}`);
198    return missing;
199  }
```

How it computes the two gap kinds:

- **Missing-prompt gaps** (lines 169-172): `slots` come from `historicalSlots(visit.phase, visit.rounds)` unless the visit is `seatless` (a command-run merge close, computed in `visitsOf` line 73: `close.slot === null && (close.to === 'merged' || event.phase === 'merge')`). If no required slot had any `prompt` event with `outcome === 'delivered'` inside the visit window (`delivered`, lines 129-141), one `prompt` gap; otherwise one `prompt:<slot>` gap per undelivered slot.
- **seat_done gap** (lines 173-186): only for `check.review` visits with `rounds === 0` (the two-slot round 0: A and B both review, and the first finisher records `seat_done` — written in src/phase.ts:532-538 only `if (required.length > 1)`). If no `seat_done` timing event exists in the window, `seat_done` is pushed.
- Line 187-197: `check_end` gaps for unpaired check starts — unrelated to seats, keep for direct leaves (direct runs DO write check rows; see Q5).

### The two callers

1. **Single-slug report** — `slugReport` (lines 233-241): reads timings + log, builds `visitsOf(slug, timings, log)`, and per visit `visitLines` (lines 213-231) which calls `visitGaps` at line 229: `for (const name of visitGaps(events, slug, visit)) lines.push(`  incomplete ${name}`)`.
2. **Cohort report** — `cohortReport` (lines 330-360) → `memberOf` (lines 263-288): `gaps: visits.flatMap((visit) => visitGaps(timings, slug, visit).map((name) => `${visit.phase}#${visit.visit} ${name}`))` at lines 284-286.

Entry point `timingCommand` (lines 535-543): `slug` → slugReport, `flow` → flowReport, else cohortReport.

### Where the direct flag must be threaded

Neither report path reads leaf states today — both build visits purely from `timings.jsonl` + `log.jsonl`. `flowReport` (line 431) already demonstrates the access pattern: `const inv: Inventory = repoInventory(repo, ['open', 'closed', 'parked'])` then `leaf.state` per leaf. Direct leaves end in `issues/closed` (or the chart's `direct/` folder after a drop — note: the drop target is `<chart folder>/direct/<owner>`, outside open/closed/parked; if dropped leaves must keep accurate reports the inventory areas may need attention).

Threading points:

- `visitGaps` itself (line 166): needs a `direct` parameter (or the flag on the `Visit`). Suppression: the prompt-slot block (169-172) and the seat_done block (173-186) both skip when direct. The `check_end` pairing (187-197) must NOT be suppressed — direct leaf runs are real runs.
- `slugReport` (line 233): look up the leaf state by slug (open or closed) once, pass the flag down through `visitLines` (line 229 callsite).
- `cohortReport`/`memberOf` (lines 263-288): look up each member slug's state once, pass into `visitGaps` at line 285.
- `visitsOf` (lines 53-76) alternatively carries the flag per visit since `direct` is immutable per leaf (set once at creation, never cleared).

### requiredSlots / historicalSlots — every caller in src/

src/routing.ts:49-60, verbatim:

```ts
49  export function requiredSlots(phase: Phase, rounds: number): readonly Slot[] {
50    return phase === 'check.review' && rounds > 0 ? ['B'] : routing[phase].slots;
51  }
...
58  export function historicalSlots(phase: HistoricalPhase, rounds: number): readonly Slot[] {
59    return phase === 'plan.positions' || phase === 'plan.rebuttal' ? retiredSlots[phase] : requiredSlots(phase, rounds);
60  }
```

Design decision 9: for a direct leaf `check.review` requires only B **at every round** (today round 0 is `['A','B']`) and `check.repair` requires A (today `['B']`). All callers:

1. **src/next.ts:1087** — `for (const slot of requiredSlots(allocated.state.phase, allocated.state.fix_rounds))` inside dispatchLeaf's delivery loop. Access: `allocated.state.direct` — the state object is right there. (For direct leaves this loop should never dispatch anyway per design decision 4, but the slots function must still be correct because of the repair/review phase rules the door follows.)
2. **src/phase.ts:192** — `slot: slot ?? requiredSlots(recorded.phase, recorded.fix_rounds)[0]` in `refuseEnclosingCompletion`, picking the failure record's slot. Access: `recorded.direct` — `recorded` is the state passed in.
3. **src/phase.ts:482** — `const required: readonly Slot[] = requiredSlots(state.phase, state.fix_rounds)` in `transition`, the seat-phase validation (which slots may/must call). Access: `state.direct` — read at line 469 (`const state: State = readState(leaf.path)`).
4. **src/status.ts:622** — `waits_on: requiredSlots(state.phase, state.fix_rounds).filter(...)` in `leafJson`. Access: `state.direct` — `state` is `leaf.state` at line 607.
5. **src/timing-report.ts:169** — via `historicalSlots` inside `visitGaps` (see above). Access: NOT currently available — this is the one caller without leaf state in hand; it must be threaded per the suppression design. Both functions need the flag because historicalSlots delegates to requiredSlots for non-retired phases.

No other callers exist (grep over src/: `requiredSlots` appears at next.ts:49(import)/1087, phase.ts:36(import)/192/482, routing.ts:49-50, status.ts:42(import)/622, timing-report.ts:8(import)/169).

---

## Q2. src/status.ts starts() / TIME / first_prompt / total_ms

### starts() (src/status.ts:154-163), verbatim

```ts
154  // Each slug's first delivered seat prompt, when work on the leaf began.
155  function starts(timings: TimingEvent[]): Map<string, number> {
156    return timings.reduce(
157      (map, event) =>
158        event.kind === 'prompt' && event.outcome === 'delivered'
159          ? map.set(event.slug, Math.min(map.get(event.slug) ?? Infinity, Date.parse(event.ts)))
160          : map,
161      new Map<string, number>(),
162    );
163  }
```

Pure timing-event derivation: the minimum `ts` over all `prompt` events with `outcome === 'delivered'` for the slug. A direct leaf never writes `prompt` rows (design decision 6: "No prompt timing row is written"), so `started.get(slug)` is `undefined` for a direct leaf.

### The three consumption points

1. **TIME column** — `rows()` line 256: `const started: Map<string, number> = starts(scan.timings)`, passed into `cells(...)` at line 270 as `started.get(leaf.state.slug)`. In `cells` (lines 217-252): `end` is `now` for unfinished leaves or the phase-entry timestamp for merged/failed; line 235: `const time: string = start === undefined || end === undefined || end < start ? '-' : clock(end - start)`. With no prompt rows a direct leaf shows `-`.
2. **JSON first_prompt** — `jsonRepo` line 676: `const started: Map<string, number> = starts(scan.timings)`, passed to `leafJson` line 703, used at line 618: `first_prompt: started.get(state.slug) ?? null`. Null for a direct leaf.
3. **Merges table total_ms** — in the JSON envelope assembly (lines 790-808): per scan, line 793 `const started: Map<string, number> = starts(scan.timings)`; merged leaves only; line 801 `const first: number | undefined = started.get(leaf.state.slug)`; line 806: `total_ms: merged === null || first === undefined ? null : merged - first`. Null for a merged direct leaf.

### What must change for a direct leaf

One shared start-value resolver: for a leaf with `state.direct === true`, `Date.parse(state.created)`; otherwise the timing-derived value. All three points consume a `started.get(slug)` lookup, so the minimal correct change is to make the map construction leaf-aware — each of the three sites already has the leaf list in scope (`scan.leaves`; the merges table also includes `scan.closed` at line 794, so the resolver must cover closed leaves too). A direct leaf merged the same day would otherwise report `total_ms: null` and TIME `-`.

### state.created format — verified against the real state.yaml

/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/state.yaml:

```yaml
slug: direct-leaf
phase: plan.synthesis
created: 2026-11-25
repo: akrogon
...
busy_since:
  A: 2026-11-25T15:07:08.804Z
```

- `created` for lifecycle leaves is **date-only**: `2026-11-25`. `Date.parse('2026-11-25')` is UTC midnight of that day — day-precision only, and up to ~24h short of the real start.
- The design requires `created` = **full ISO timestamp** for direct leaves (like `busy_since` shows: `2026-11-25T15:07:08.804Z`).
- The schema is `created: z.string()` (src/state.ts:128) — no format constraint, both shapes parse.
- Other readers of `created`: `flowReport` line 444 `leaf.state.created.slice(0, 10)` — slicing the first 10 chars of a full ISO timestamp yields the same date, so flowReport is compatible with either format.

---

## Q3. akrogon status <slug> detail view — the next-start recipe

src/status.ts:766-778, inside `statusCommand`'s slug branch (lines 740-778), verbatim:

```ts
766      console.log('History:');
767      console.log(log.length === 0 ? 'unavailable' : log.map((entry) => entry.text).join('\n'));
768      console.log(resolve(leaf.path, 'plan.md'));
769      const resolved: { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } } = seats(global, repo, leaf.path);
770      console.log('Seats for the next agent start:');
771      console.log(
772        Bun.YAML.stringify(
773          { a: { ...resolved.a, source: resolved.source.a }, b: { ...resolved.b, source: resolved.source.b } },
774          null,
775          2,
776        ).trimEnd(),
777      );
778      return;
```

This is the block the design calls the next-start recipe: harness/model/effort/permission config plus the source file of each seat config, printed as YAML. For a direct leaf there IS no next agent start akrogon performs — the seats are the door (A) and the reviewer consultant (B), recorded in `state.seat.A`/`state.seat.B` as `{ session, address }` (seatRefSchema, src/state.ts:48).

Replacement point: exactly lines 769-777. For a direct leaf, print the recorded seat terminals (session + address per slot) in place of this block. The full state YAML dump at line 754 already prints the raw `seat:` record; the replacement block is the human-facing rendering of it. Note the detail view needs no new data fetch — `leaf.state` is in hand; resolving whether those terminals are live would be new behavior (design says "shows the recorded seat terminals", i.e. the refs, not a liveness probe).

---

## Q4. src/status.ts seats() / seatSources — seat resolution for display

`seats` is imported from src/config.ts (status.ts line 11). config.ts:221-248, verbatim:

```ts
221  export function seats(
222    global: GlobalConfig,
223    repo: Repo,
224    leafPath?: string,
225  ): { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } } {
226    const index: { a?: IndexedSeat; b?: IndexedSeat } = indexSlots(leafPath, repo);
227    const fallback = (key: 'a' | 'b'): string =>
228      repo.config.slots?.[key] === undefined
229        ? resolve(globalHome(), 'config.yaml')
230        : resolve(repo.root, 'issues/config.yaml');
231    const source: { a: string; b: string } = {
232      a: index.a?.file ?? fallback('a'),
233      b: index.b?.file ?? fallback('b'),
234    };
235    const resolved: { a: SlotConfig; b: SlotConfig } = {
236      a: index.a?.seat ?? repo.config.slots?.a ?? global.slots.a,
237      b: index.b?.seat ?? repo.config.slots?.b ?? global.slots.b,
238    };
239    for (const seat of ['a', 'b'] as const) {
240      const harness: string = resolved[seat].harness;
241      if (!Object.hasOwn(global.harnesses, harness)) {
242        if (index[seat] !== undefined)
243          throw new SeatIndexError(source[seat], `Missing harness template "${harness}" for seat ${seat}`);
244        throw new Error(`Missing harness template "${harness}" for seat ${seat} in repo ${repo.name}`);
245      }
246    }
247    return { ...resolved, source };
248  }
```

Resolution precedence per seat: (1) ISSUE.md/EPIC.md front-matter slots nearest the leaf (`indexSlots`, config.ts:199-219 — leaf at depth 2 reads the owner's ISSUE.md; depth 3 reads the issue's ISSUE.md then the epic's EPIC.md, first hit wins), (2) repo `issues/config.yaml` slots, (3) global config slots. `source` records which file each seat came from.

Uses in status.ts:

- `scanRepo` line 94-99: every scanned leaf carries `seatSources: seat.source` and `resolved: { a: seat.a, b: seat.b }`.
- `note()` lines 187-190: seat source basenames ISSUE.md/EPIC.md surface in the NOTE column as `seats ISSUE.md`.
- `leafJson` lines 641-644: JSON `seats.a/b` = harness, command (first token of the harness template), source.
- Detail view lines 769-777 (Q3).

A direct leaf's owner folder has an ISSUE.md **with no seat index lines** (design decision 1: "ISSUE.md (no seat index lines)"), so resolution falls through to repo/global config — harmless but meaningless for a direct leaf, since nothing starts seats from it. This is display-only; no functional dependency.

---

## Q5. src/run-check.ts leafTarget and src/verify.ts verifyCaller — tab independence

### leafTarget (src/run-check.ts:188-224), verbatim

```ts
188  export async function leafTarget(
189    repo: Repo,
190    cwd: string,
191    leafOverride: string | undefined,
192    holder: string | undefined,
193  ): Promise<LeafTarget> {
194    if (holder !== undefined && !isAbsolute(holder)) throw new Error(`--holder takes an absolute path, got ${holder}`);
195    if (leafOverride !== undefined) {
196      const state: State = readState(resolve(cwd, leafOverride));
197      return { ...leafFields(state, 'leaf'), target: resolve(cwd, leafOverride, 'implementation') };
198    }
199    const top: string = realpathSync(await command(['git', 'rev-parse', '--show-toplevel'], cwd));
200    const inv: Inventory = repoInventory(repo);
201    const leaf: Leaf | undefined = inv.leaves.find(
202      (item) =>
203        item.state.worktree !== undefined && existsSync(item.state.worktree) && realpathSync(item.state.worktree) === top,
204    );
205    if (leaf !== undefined) return { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') };
206    const worker: RegExpMatchArray | null = basename(top).match(/-u(\d+)$/);
207    if (worker !== null) {
208      const owner: Leaf | undefined = inv.leaves.find(
209        (item) => item.state.slug === basename(top).slice(0, -worker[0].length),
210      );
211      if (owner !== undefined)
212        return {
213          ...leafFields(owner.state, 'worker', `u${worker[1]}`),
214          target: resolve(owner.path, 'implementation'),
215        };
216    }
217    const failure = [
218      ...inv.unreadable,
219      ...inv.foreign.map((f) => ({ path: f.path, error: new RepoMismatchError(f.path, f.stored, repo.name).message })),
220    ].find((f) => basename(f.path) === basename(top));
221    if (failure !== undefined) throw new Error(`Invalid state ${resolve(failure.path, 'state.yaml')}: ${failure.error}`);
222    if (holder === undefined) throw new Error('No leaf worktree matches cwd; pass --leaf or --holder');
223    return { slug: 'checkout', target: resolve(holder), scope: 'leaf' };
224  }
```

`leafFields` (lines 178-186) copies `slug`, `scope`, `phase`, optional `unit`, optional `attempt` (from `state.batch?.attempt`). Publication: the `target` is `<leaf folder>/implementation` (line 205); `checkedRun` writes captures and the kept `check-<name>-<ts>-<pid>.log` under it (lines 431-432, 506-510), and `check_start`/`check_end` timing rows carry the leaf slug (lines 448-452, 511-517).

### verifyCaller (src/verify.ts:671-686), verbatim

```ts
671  async function verifyCaller(
672    repo: Repo,
673    cwd: string,
674    attempt: string | undefined,
675    holder: string | undefined,
676  ): Promise<{ caller: LeafTarget; cwd: string }> {
677    if (attempt === undefined) return { caller: await leafTarget(repo, cwd, undefined, holder), cwd };
678    const leaf: Leaf | undefined = allLeaves(repo).find(
679      (item) => item.state.batch?.attempt === attempt && item.state.phase === 'merge',
680    );
681    if (leaf === undefined) throw new Error(`No merge leaf for attempt: ${attempt}`);
682    return {
683      caller: { ...leafFields(leaf.state, 'leaf'), target: resolve(leaf.path, 'implementation') },
684      cwd: leaf.state.worktree ?? cwd,
685    };
686  }
```

### Tab / lifecycle dependence: none

- Attribution is by **worktree path identity** (lines 201-205: the git toplevel realpath-matches a leaf's recorded `state.worktree`) or the `-u<N>` worker suffix (206-216) or explicit `--leaf`. Nothing reads `state.tab`, nothing checks seat presence, nothing requires the leaf to be a lifecycle leaf.
- The attempt path in verifyCaller requires only `state.batch?.attempt === attempt && state.phase === 'merge'` — again no tab.
- Confirming design decision 12: a run from a direct leaf's worktree attributes to the leaf slug and publishes under its `implementation/` folder unchanged, because the create verb records `worktree` in state exactly as `ensureWorktree` does for lifecycle leaves.
- One adjacent behavior: `failedRefusal` (run-check.ts:274-296) refuses runs while the leaf's live phase is `failed` — phase-driven, not tab-driven; applies to direct leaves identically and correctly.
- Slice placement: `checkedRun` line 389 `runSlice(slug === 'checkout' ? 'akrogon.slice' : leafSlice(repo, slug, homePath()))` — a held run for a direct leaf IS placed in the direct leaf's slice (relevant to Q7).

---

## Q6. src/seat.ts startSeat — labels, scope, sub-cgroups

### Launch and labels (src/seat.ts:294-373)

`startSeat(global, repo, leaf, slot, task, space)` (line 294). Key facts:

- Line 303-304: `const worktree: string = z.string().parse(state.worktree); const tab: string = z.string().parse(state.tab)` — startSeat **requires** state.worktree and state.tab; a direct leaf (never a tab) cannot even enter this function without throwing.
- Line 308-310: the leaf slice and the seat scope unit:

```ts
308    const slice: string = leafSlice(repo, state.slug, homePath());
309    const unit: string = `${slice.replace(/\.slice$/, '')}-${name}-${randomBytes(4).toString('hex')}.scope`;
310    const scopeCgroup: string = `${sliceCgroup(slice)}/${unit}`;
```

- Line 330: the seat's own labels: `const own: Record<string, string> = { 'akrogon.repo': repo.name, 'akrogon.leaf': state.slug, 'akrogon.seat': seat }`
- Lines 333-342, the full label set a seat carries at creation:

```ts
333      const launched: Seen = await run(space.session, {
334        name,
335        cwd: worktree,
336        parent: a?.state === 'live' ? { address: a.address, outlive: true } : null,
337        labels: {
338          akrogon: '1',
339          ...own,
340          'herdr.space': space.space,
341          'herdr.tab': tab,
342        },
```

So a seat carries exactly: `akrogon=1`, `akrogon.repo=<repo>`, `akrogon.leaf=<slug>`, `akrogon.seat=<a|b>`, `herdr.space=<space>`, `herdr.tab=<tab id>`. Comment at line 329: "The seat's own labels: hc sets them at creation and herdr-app never changes them."

- Lines 343-372: argv is `systemd-run --user --scope ... --unit=<unit> --slice=<slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed -p SendSIGHUP=yes -p Delegate=yes -- env ...` with `AKROGON_SEAT_CGROUP=${scopeCgroup}` at line 367, `TMPDIR=leafTemp(repo, slug)` line 365, the per-kind tool-entry wiring (lines 318-327: claude's `CLAUDE_CODE_SHELL`, agy's PATH wrapper, others' `BASH_ENV`).

### The three-outcome scope probe and sub-cgroup creation (lines 195-210, 380-409)

```ts
197  // systemd-run moves the seat into its leaf scope before it execs the harness, late when the manager is
198  // slow, so the start-proof window opens only after scope entry. Three outcomes: entered once the
199  // the seat's cgroup ends with the scope path, exited once its /proc entry is gone (firstTask then reports
200  // the end), outside when PANE_WAIT_MS passes with the seat still elsewhere.
201  async function scopeEntry(pid: number, scope: string): Promise<ScopeEntry> {
202    const deadline: number = Date.now() + PANE_WAIT_MS;
203    for (;;) {
204      const cgroup: string | null = cgroupOf(pid);
205      if (cgroup === null) return { outcome: 'exited' };
206      if (cgroup.endsWith(scope)) return { outcome: 'entered' };
207      if (Date.now() >= deadline) return { outcome: 'outside', cgroup };
208      await Bun.sleep(50);
209      }
210  }
```

```ts
392      // The scope's three sub-cgroups: tools/ minted by the entry, akrogon/ the relocation target,
393      // helpers/ the deferred-kill waiters. A creation failure refuses the start like the outside
394      // refusal; an exited seat never bootstraps — firstTask reports its end.
395      if (entry.outcome === 'entered') {
396        try {
397          for (const dir of ['tools', 'akrogon', 'helpers']) mkdirSync(resolve(scopeCgroup, dir), { recursive: true });
398        } catch (error) {
399          await end(space.session, launched.address);
400          throw new Error(
401            JSON.stringify({
402              seat: launched.address,
403              error: 'seat scope bootstrap failed',
404              expected: unit,
405              cause: error instanceof Error ? error.message : String(error),
406            }),
407          );
408        }
409      }
```

So startSeat itself creates `tools/`, `akrogon/`, `helpers/` inside the seat scope after the entered probe; the shell entry scripts (Q7) then self-mint `tools/t-<pid>-<start>` per shell.

### Does anything in startSeat run for direct leaves? No — and it cannot.

Design decision 4: "Never tab, never akrogon.leaf labels. For a direct leaf the command never allocates, starts, ends or prompts a seat." All startSeat callers are dispatch paths and the seat verb: `dispatchSlot` (next.ts:825, 867) and `seatCommand` (next.ts:1573). `allocate` (next.ts:727) is what mints `tab` — `const state: State = worktree.tab === undefined ? { ...worktree, tab: leafTab(repo.name, worktree.slug) } : worktree`. For a direct leaf the create verb writes state directly and no allocation ever runs, so no tab is ever minted and startSeat's line 304 parse would throw regardless. The door/reviewer seats are launched by `launch()` (seat.ts:443-482) — the consultant path — which runs NO systemd-run, NO leaf slice, NO scope, NO `akrogon.leaf` label: its labels are `akrogon=1`, `akrogon.repo`, plus the caller-supplied spec labels (`akrogon.seat=<letter>` for consultants, seat.ts:500) and herdr labels following the caller's tab.

---

## Q7. src/tool-cgroup.ts sweepToolCgroups — can a direct seat ever hold tools/ in the leaf slice?

### sweepToolCgroups (src/tool-cgroup.ts:326-343), verbatim

```ts
326  // After the move is committed: every seat scope of the leaf's slice that holds
327  // a tools/ directory is swept, each yielding one tool_kill row. A missing
328  // slice or a scope without tools/ yields nothing and no warning. The sweep
329  // never throws: it warns and leaves the committed move untouched.
330  export function sweepToolCgroups(repo: Repo, slug: string): void {
331    try {
332      const slice: string = sliceCgroup(leafSlice(repo, slug, homePath()));
333      if (!isDirectory(slice)) return;
334      for (const unit of readdirSync(slice)) {
335        if (!unit.endsWith('.scope')) continue;
336        const scopeDir: string = resolve(slice, unit);
337        if (!isDirectory(scopeDir) || !isDirectory(resolve(scopeDir, 'tools'))) continue;
338        sweepScope(repo, slug, scopeDir, unit);
339      }
340    } catch (error) {
341      warn(slug, '', '', error);
342    }
343  }
```

Slice derivation — leafSlice (src/scope.ts:8-12), verbatim:

```ts
8   export function leafSlice(repo: Pick<Repo, 'name'>, slug: string, home: string): string {
9     const key: string =
10      resolve(home) === resolve(homedir(), '.akrogon') ? `${repo.name}/${slug}` : `${resolve(home)}:${repo.name}/${slug}`;
11    return `akrogon-l${createHash('sha256').update(key).digest('hex').slice(0, 12)}.slice`;
12  }
```

`sliceCgroup` (scope.ts:146-154) maps the slice name onto `/sys/fs/cgroup/user.slice/user-<uid>.slice/user@<uid>.service/<prefix-chain>/<slice>`. So the sweep enumerates **exactly one directory**: the cgroup dir of the moved leaf's own slice, iterating `*.scope` children that hold a `tools/` subdir. Per scope, `sweepScope` (lines 277-324): every `t-*` dir in `tools/` whose sibling `akrogon/<t>` is unpopulated gets `cgroup.kill` written + rmdir; populated ones defer to a `tool-kill-helper` written into `helpers/<t>`.

The sweep is invoked from exactly one place: `commitMove`'s innermost finally, src/phase.ts:301-305: `sweepToolCgroups(repo, recorded.slug)` — the **moved leaf's** slug.

### Answer to the re-chart question: can a direct seat hold tools/ inside the leaf slice? No.

Two independent reasons, either sufficient:

1. **A direct seat never enters the leaf slice at all.** Scopes land in a leaf slice only through `systemd-run --scope --slice=<leafSlice>`. That argv is built in exactly two places: `startSeat` (seat.ts:343-372, never called for direct leaves — Q6) and `runUnitArgv` (scope.ts:48-81, used by run-check/verify — which are runs, not seats). The door's own terminal and consultants are plain `hc run` children (seat.ts:458-471, argv `['env', ...UNSET, ...harness.argv, ...]`) with no systemd-run; they live in the terminal scope or wherever their parent terminal's cgroup is — structurally outside every leaf slice.
2. **Even a process inside the slice cannot mint tools/ without the seat-only marker.** The t- minting happens in the shell entry scripts (`placementShell`, tool-cgroup.ts:27-50), gated by `AKROGON_SEAT_CGROUP`:

```
32    '  [ -n "${AKROGON_SEAT_CGROUP:-}" ] || return 0',
34    "  cur=$(sed -n 's/^0:://p' /proc/self/cgroup 2>/dev/null) || return 0",
35    '  [ "${root}$cur" = "$AKROGON_SEAT_CGROUP" ] || return 0',
36    '  mkdir -p "$AKROGON_SEAT_CGROUP/tools" || return 0',
```

The shell must sit **exactly at the scope root** named by the marker (equality check line 35). `AKROGON_SEAT_CGROUP` is set only in startSeat's argv (seat.ts:367) — grep confirms no other setter in src/. It is deliberately stripped from helpers (tool-cgroup.ts:235) and is absent from run-check's `copied` env list (run-check.ts:57-70), so even a nested shell inside a run scope in the direct leaf's slice either lacks the marker or holds a mismatched one (the equality check fails) — nothing is minted. Additionally run scopes are launched **without `-p Delegate=yes`** (runUnitArgv, scope.ts:55-81), so cgroup sub-directories cannot even be created inside them by unprivileged writes; only startSeat seats carry `Delegate=yes` (seat.ts:357-359) which is what makes `tools/`, `akrogon/`, `helpers/` creatable at all.

Conclusion: the sweep of a **direct** leaf's slice can only ever encounter run-check/verify scopes (line 337 skips them: no `tools/` inside). The door's and reviewer's shells are never in the direct leaf's slice. The design's blocking concern — "the shell sweep at phase advance ... never runs on a direct leaf's seats, since it would end the door's and reviewer's own shells" — is structurally impossible **for the direct leaf's own sweep**: the direct leaf's slice contains nothing that can hold tools/. (The door's shells DO sit in the chart leaf's slice when the door is itself a lifecycle seat of the chart leaf — but that sweep is the chart leaf's own, keyed by the chart leaf's slug, and is unaffected by anything direct.) The explicit `direct` check the design proposes at the shell-sweep site is therefore defense against a case that cannot occur; if added anyway it is one line in commitMove or sweepToolCgroups, but the honest finding is: not needed. Worth noting the design's own test plan ("the break is removing the explicit direct check") would then test nothing — a red test there is impossible to produce.

One more precise observation: `sweepToolCgroups` looks at the leaf slice only (line 332-334). It does not scan terminals, sessions, or labels. A "direct seat" can therefore never be affected by it, in either direction.

---

## Q8. src/preflight.ts checkBase and src/config.ts leafTemp/ensureLeafTemp — create-verb reuse candidates

### checkBase (src/preflight.ts:65-76), verbatim

```ts
65  export async function checkBase(repo: Repo, remoteRequired: boolean): Promise<string> {
66    await ensureRemote(repo);
67    try {
68      const sha: string = await localBase(repo);
69      if (remoteRequired) await remoteBase(repo);
70      return sha;
71    } catch (error) {
72      if (!(error instanceof PreflightError) || error.code !== 'C3') throw error;
73      await remoteBase(repo);
74      throw error;
75    }
76  }
```

Verifies the configured remote exists (C1), the remote branch exists (C2), the tracking ref is local (C3); returns the local tracking sha. `dispatchLeaf` calls it as `checkBase(repo, mustCreate)` (next.ts:1075) — remote proof only when the worktree must be created. The create verb always creates, so `checkBase(repo, true)`.

### leafTemp / ensureLeafTemp (src/config.ts:422-433), verbatim

```ts
422  export function leafTemp(repo: Repo, slug: string): string {
423    const root: string = leafTempRoot();
424    const hex = (text: string): string => createHash('sha256').update(text).digest('hex');
425    return resolve(root, hex(repo.root).slice(0, 4), hex(repo.root + '\n' + slug).slice(0, 8));
426  }
427
428  export function ensureLeafTemp(repo: Repo, slug: string): string {
429    const leaf: string = leafTemp(repo, slug);
430    const repoTemp: string = dirname(leaf);
431    for (const path of [dirname(repoTemp), repoTemp, leaf]) ensurePrivateDir(path);
432    return leaf;
433  }
```

Hash-stable per repo+slug under `/var/tmp/akr-<uid>` (leafTempRoot, config.ts:407-412), private-dir hardened (0700, uid-checked, symlink-refusing, config.ts:442-460).

### Reuse verdict for the create verb (the design's open question)

The design asks: reuse `allocate`'s prelude or call `checkBase` and `ensureLeafTemp` directly. `allocate` (next.ts:702-730) is inseparable from seat machinery: it resolves the hc `place` (line 709), reads live seats (712), enforces capacity caps (722), and mints the tab (727). None of that applies to a direct leaf — pulling it apart would mean re-plumbing allocate with flags, the opposite of the design's "fewest moving parts". The create verb should call the pieces directly: `checkBase(repo, true)`, `createSparseWorktree(repo, path, trackingRef(repo), { branch: slug })` (next.ts:282-314 — note ensureWorktree passes the tracking ref and `-b <slug>` when no branch exists, exactly the first-run case), `emitEnvFile(repo, path, repo.config.env)` (next.ts:561-607; or `writeLeafEnv` next.ts:544 if the live-seat distinction matters — it does not, a fresh direct leaf has no seats), and `ensureLeafTemp(repo, slug)`. One caveat: `ensureWorktree` also runs the repo's configured `setup` step with its marker (next.ts:497-532); the design says "creates the unlocked sparse worktree at worktree_store/<slug> with the leaf env" and names only "the leaf base check and leaf temp setup" — whether the configured setup step runs at creation is a question the plan must settle from the design text (it is not named; the setup would otherwise run never, since allocate never runs for the leaf).

Also relevant: `createSparseWorktree` does not pass `--lock` to `git worktree add`; "unlocked" in the design matches the default.

---

## Q9. src/listen.ts — how the listener triggers engine passes

Full read (187 lines). Mechanism:

- Pass kinds (line 12): `'pull --all' | 'next --resume' | 'next --wake'`, run as `akrogon <pass>` child processes, one at a time, single-flight queued (lines 36-61), each with a 20-minute deadline then SIGKILL to the whole process group (line 51).
- The listener subscribes to every live hc session with `follow(session, ['--label', 'akrogon=1'], onLine)` (line 99) — the label filter means only terminals labelled `akrogon=1` produce events.
- Event routing in `onLine` (lines 84-96): the first snapshot enqueues `next --resume`; per-terminal events: `turn`, `blocked` status, `finished`, or `lost` enqueue `next --wake`.
- Socket discovery is fs.watch over `$XDG_RUNTIME_DIR/herdr-core` (lines 128-140), plus probing of sockets present but not yet listening (147-162). Failures retry once after RETRY_MS with a scan + resume (lines 66-76).

Direct-leaf relevance:

1. Door and reviewer terminals launched through `launch()` DO carry `akrogon=1` (seat.ts:463). Their turn/blocked/finished events therefore wake engine passes exactly like lifecycle seats — no listener change needed.
2. What those passes do for a direct leaf is a `next.ts` question, not a listener question: today `resumeRepos` (next.ts:1151-1160) only sweeps leaves that are merged or hold `state.tab`/`state.worktree`. A direct leaf DOES hold `state.worktree` (the create verb records it), so it IS swept by passes — the sweep then hits the seat-dispatch paths the design gates off, plus merge-turn handling and owner completion which the design keeps. No listener-side gap.
3. Nothing in the listener reads leaf state at all; it is purely hc-event-driven. No direct flag needed here.

---

## Q10. src/turn.ts mergeQueue — tab/seat dependence

mergeQueue (src/turn.ts:99-125), verbatim:

```ts
99   export function mergeQueue(global: GlobalConfig, repo: Repo, leaves: Leaf[], log: () => LogRecord[]): QueueEntry[] {
100    const eligible: Leaf[] = leaves.filter(
101      (leaf) =>
102        leaf.state.phase === 'merge' &&
103        eligibility(global, repo, leaf, leaves) === null &&
104        (leaf.state.batch !== undefined || !isStopped(leaf.state.repo, leaf.state.slug)),
105    );
106    const stamp: Map<string, string> = new Map();
107    if (eligible.some((leaf) => leaf.state.merge_stamp === undefined))
108      for (const entry of log()) if (entry.record.to === 'merge') stamp.set(entry.record.slug, entry.record.ts);
109    const counts: Map<string, number> = dependentCounts(leaves);
110    return eligible
111      .map((leaf) => ({ leaf, time: leaf.state.merge_stamp ?? stamp.get(leaf.state.slug) }))
112      .sort(
113        (a, b) =>
114          Number(b.leaf.state.batch !== undefined) - Number(a.leaf.state.batch !== undefined) ||
115          (counts.get(b.leaf.state.slug) ?? 0) - (counts.get(a.leaf.state.slug) ?? 0) ||
116          (a.time === undefined && b.time === undefined
117            ? a.leaf.state.slug.localeCompare(b.leaf.state.slug)
118            : a.time === undefined
119              ? 1
120              : b.time === undefined
121                ? -1
122                : a.time.localeCompare(b.time) || a.leaf.state.slug.localeCompare(b.leaf.state.slug)),
123      )
124      .map(({ leaf, time }, index) => ({ leaf, place: index + 1, noRecord: time === undefined }));
125  }
```

Eligibility rests on exactly three conditions: phase is `merge`; `eligibility()` (lines 59-69) is null — itself only twin-folder conflict, unmerged deps, and readiness gaps; and not stopped unless a batch already exists. Ordering: batch holders first, then dependent count, then merge-stamp time. **Nothing reads `state.tab`, `state.seat`, or anything seat-related** — the words tab/seat do not appear in turn.ts at all (grep confirms). Confirms design decision 8: "The merge queue and land run land a direct leaf unchanged" requires zero mergeQueue changes.

The only indirect seat coupling anywhere in the merge path is upstream: entering `merge` at all is a phase transition the door performs, and the `land` run (src/land.ts) launches its units with `--slice=${leafSlice(...)}` (land.ts:35) — the leaf slice, which exists regardless of seats.

---

## Cross-cutting facts useful for the plan

- `seat_done` timing rows are written only when `required.length > 1` (src/phase.ts:531-538). Under design decision 9 a direct leaf's check.review is single-slot (B only) at every round, so no seat_done row can ever exist for it — consistent with suppressing the gap rather than writing the row.
- `commitMove` clears `prompted`, `prompted_at`, `delivery_error`, `attempts`, `lost` on every move (phase.ts:240-244) and carries `busy_since` except into failed/merged (line 246).
- `allocate` line 727 is the only place `tab` is minted: `leafTab(repo.name, worktree.slug)` (hc.ts:762-764, `'ak' + sha256(...).slice(0, 30)`). A state written without `tab` that never passes through allocate stays tabless forever — the direct leaf's structural guarantee.
- `leafSeats` (reconcile.ts) resolves seats by the recorded refs; `observeBusy` in next.ts drives busy_since. For direct leaves the design reads seats by recorded refs across sessions, never the repo session terminal list.
- `activeCount` (next.ts:615-655): the label branch counts leaves whose slug appears on live terminals' `akrogon.leaf` labels (lines 629-637) — direct seats never carry it, already excluded. The fallback branch (no session, lines 639-643) counts any `seated` leaf where `seated` = unfinished AND (tab OR worktree present) (lines 622-623) — a direct leaf holds a worktree, so it WOULD count toward max_active in the no-session fallback; this is the branch the design says needs the explicit check.
- `repoInventory` areas: `repoInventory(repo, ['open', 'closed'])` in status; flowReport uses `['open', 'closed', 'parked']`. `validateLeafDepth` (state.ts:220-225) requires depth 2 or 3 under the area root — relevant if dropped direct leaves land at `issues/chart/<chart>/direct/<owner>/<leaf>` (different tree, not an inventory area).
