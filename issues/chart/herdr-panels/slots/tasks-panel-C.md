# Tasks panel (A4) — seat C notes

Facts verified 2026-11-03 against src/status.ts (584 lines, read), src/turn.ts, src/verify.ts decideSlow, src/state.ts schema, `akrogon status` + `akrogon config` live output, shipped mods/tabs/main.js:15-98, live layouts/flat.json tree.

## Q1 — What one row shows, and how rows are grouped

**Pick.** Mirror `akrogon status`'s own structure, compressed for 368px:
- Top block, global alerts (one line each, in the CLI's order): `deploy failed`, `Failed:` leaves, `Missing:` gaps, `Unpacked:` folders, `Slow merge`. Each gets its own accent word color (t.blocked for failed/missing/slow, t.muted for unpacked), because in the CLI these are plain lines the operator scrolls for.
- Per repo: a repo header (name + `(paused)` mark, like the CLI's bold underline). Under it, the chart-folder hierarchy as one indent level per folder (rows() already prints group headers with `indent(depth)`, status.ts:225-247). Leaf rows two lines: line 1 `slug`, `phase`, `time`; line 2 dim: `blocked-by`, the `note()` detail string (busy seats, attempts, fix rounds, verdict, done, delivery errors, `land`, `broadcast pending`), `stopped`. Parked slugs at the repo's end, dimmed, exactly as the CLI does (status.ts:573).
- Merge queue is not a column to read but the last CLI column (`holder`/`N`/`no merge record`, status.ts:209-216): show it on the row as a small `2nd`/`holder` tag, and give phase=merge rows the t.idle/green accent the CLI uses (`phaseColor` merge='32').
Reason: the lock says the panel shows everything `akrogon status` shows so the command is never needed. The CLI's visual grammar (repo headers, folder indents, parked dim, alert lines first) is already what the operator reads; re-skinning it as a kanban or attention-sorted list invents a second language for the same data.
Cost: two lines per leaf is taller; with ~10-20 open leaves it still fits the panel's scroll.

**Rejected.**
- R1 Group by attention (stuck first): reorders what the CLI presents per repo; the operator's muscle memory is repo-then-phase. Attention is already visible via alert block + colors.
- R2 One line per leaf: `note()` detail (busy A 42m · verdict B:fix · land) doesn't fit 368px; dropping it loses the "where is it stuck" answer, which is the panel's purpose.
- R3 Group by phase across repos: breaks `blocked-by` readability (deps live in the same repo) and differs from the CLI.

**Pitfalls.** Row heights unbounded when many repos have leaves — fine, panel scrolls. Keep the group-header indent to ≤2 levels; deeper hierarchies wrap (done-criterion: shot with a real nested chart).

## Q2 — When is a job "taking too long", and who computes it

**Pick.** akrogon computes it inside `status --json`; the panel only paints. Rule: reuse the existing accepted convention — median of the last 20 eligible samples, flag at `ms > 1.5×normal && ms - normal ≥ 120s`, minimum 5 samples — applied per repo per phase using `visit_start`/`prompt` timings (decideSlow, verify.ts:369-385; visits already recorded per phase in timings.jsonl, verified today). Emit `phase_age_ms` + `slow: bool` + `normal_ms` per leaf; merge-phase slow stays the existing verify-run signal (Slow merge alert) untouched.
Reason: decideSlow is the operator-reviewed slow rule (it survived the verify pipeline); cloning its shape for phase age keeps one definition of "normal" in the codebase that owns the ledger, and `--json` is the settled contract (round 1, 2a). A self-calibrating median beats fixed thresholds across 11 repos with wildly different phase lengths.
Cost: akrogon gains a visits aggregation (timing-report.ts already computes per-leaf visits — `visitsOf`, timing-report.ts:53 — so this is reuse, not new machinery). Repos with <5 phase visits get `slow: null` → no color, age still shown.

**Rejected.**
- R1 Panel computes from raw timings: the mod would ship the median/episode logic in JS and diverge from akrogon the first time the rule changes; also re-reads MBs of jsonl over exec.
- R2 Fixed per-phase operator thresholds: numbers guessed once go stale per repo; operator already said don't complicate interfaces — another settings surface is complication.
- R3 `busy_since` age only: measures seat busy, not phase age; a leaf waiting in queue looks fine while already slow.

**Pitfalls.** `slow` painted when the median is thin → gated by min-5-samples in the rule itself. Clock skew: emit `generated_at` and compute ages server-side; panel renders `clock(age)` strings akrogon sends, or computes from `phase_age_ms` + elapsed render time.

## Q3 — What clicking a row does

**Pick.** Click focuses the seat's pane inside this session; no cross-session and no fake targets.
- Today (old-herdr seats): heuristic match — `panes()`/`terminals()` in this session whose `cwd` is inside the leaf's `state.worktree`; prefer the pane whose title/app looks like an agent over a shell. If none matches, the row shows no affordance (dimmed, click does nothing or a toast "no live pane in this session"). `state.tab`/`state.pane` hold old-herdr ids — useless for herdr-app, don't even try matching them.
- After the port: deterministic — akrogon labels each seat terminal `akrogon.leaf=<repo>/<slug>` and `akrogon.seat=A|B`; click maps label → terminal → `agent.focus`/`pane.focus`. This label contract is not in the current herdr-app epic intake (checked: issues/chart/herdr-app/INTAKE.md) — it must be added there as a requirement, or the post-port jump is no better than today's heuristic.
Reason/cost: worktree-cwd works today with zero akrogon change and is honest about misses; labels remove the ambiguity when two seats share a worktree. Cost: an epic intake line someone must own.

**Rejected.** R1 Jump to the repo root always: focuses nothing useful. R2 Match on tab label/slug name: depends on naming discipline, breaks on renames. R3 Open `state.worktree` in a new Files pane: `pane.split {mod, props}` pinning isn't built yet (that's A3), and a Files pane doesn't reach the seat.

**Pitfalls.** A/B both running in one worktree → ambiguous match; prefer `pane` whose `program.agent` is true, else first; after labels this disappears. Rows for other sessions legitimately have no target — the contract says "this session's terminals" (round 1).

## Q4 — Is Tasks the default panel?

**Pick.** Yes for spaces with no stored choice — and that is the only sense "default" can have without violating the operator's lock. `tabs` remembers a panel per space in localStorage (tabs/main.js:20-43: `stored = this.panels[space.id]`, restores `want` on space switch). So: clone `tabs` (unavoidable — buttons are hardcoded at main.js:97-98 to files/changes only) with two changes: add `tasks` and `needs-you` buttons, and set the no-memory fallback to `tasks` where today it falls back to null (closed). Stored per-space choices are never overridden.
Reason/cost: "shown by default" then means: fresh windows/spaces open with Tasks; spaces where the operator last used Files or closed the panel keep exactly that — honoring "I don't want to be complicating the existing interfaces." Cost: one clone (tabs also owns panel memory, the riskiest clone; keep the diff to the two named lines so cloned_from diffs stay readable).
Note: `workspace.panels` must also gain `tasks` (and `needs-you`) in shared.json per session — buttons are gated by it (tabs/main.js:80); without it the clone has a button that never renders.

**Rejected.** R1 Force `layout.select` to tasks on every space switch: overrides stored memory — contradicts the lock, and fights the operator mid-click. R2 Prefix key only, no button: round 2 settled buttons beside Files and Changes. R3 First child in `panel-body` stack as "default": stack `active` is click-state, not a reliable default, and doesn't put the button highlight anywhere.

**Pitfalls.** `layouts/.state` saved panel choices mask "default" behavior in testing — done-criterion: fresh `.state` shot shows Tasks open; second shot after clicking Files then switching space away and back shows Files (memory preserved). Existing sessions need their shared.json edited once (operator step or install script note).

## Q5 — Which repos, and the `--json` field list

**Pick.** All registered repos, always. The question the panel answers ("is anything stuck anywhere") spans the fleet; the current space's repo has no special status in `akrogon status` when run outside a repo (it scans all, status.ts:510-514). No repo filter UI in v1 — "don't complicate" — but if a cheap ordering exists, put the focused pane's repo first.
`--json` output (single object):
```
generated_at, schema_version
repos: [{ name, root, ok, error?, paused,
  failures: [{path, error}],
  leaves: [{ slug, path(rel groups), phase, phase_since, first_prompt_at,
             phase_age_ms, slow|null|{normal_ms},
             busy_since:{A?,B?}, attempts:{A,B}, fix_rounds, verdict:{A?,B?},
             done:[], delivery_error:{A?,B?}, blocked_by:[{slug,label}],
             missing:[{kind,name,holder,steps}], twin:{open,conflict}|null,
             stopped, merge_stamp?, batch?, merge_queue:{place,noRecord}|null,
             broadcast_pending, land:{owner,alive?,unit}? ,
             worktree?, tab?, pane:{A?,B?}, seat_sources:{a,b} }],
  parked: [slug],
  slow_merge: {first:{leaf,run}, ms, normal_ms}|null,
  unpacked: [rel] }]
alerts: [{kind: deploy_failed|failed|missing|unpacked|slow_merge, text, repo?}]
run_line: [{repo, leaf, check, state, age_ms, run}]
charts (optional, only with flag or when cheap): [{name, taken, fog, stage, age_ms}]
```
Every field maps to something the CLI already prints (status.ts:460-584); `label` on `blocked_by` carries `phase`/`parked`/`missing`/`unreadable` from `unmergedDeps` (turn.ts:25-34), which the CLI flattens into the queue/block logic — the panel should not re-derive it.
Reason/cost: raw-ish fields keep the mod a renderer; schema_version lets akrogon evolve it. Cost: akrogon's scan work already exists (statusCommand does it); `--json` is a serialization of Scan, not new collection.

**Rejected.** R1 Current space's repo only: misses the fleet. R2 Panel reads state.yaml/log.jsonl itself: re-settles round 1's rejected option (schema drift, 1MiB read cap, YAML parsing in JS). R3 Text-output parsing: `akrogon status` text is human-formatted; guaranteed to rot.

**Pitfalls.** `exitCode` semantics: status exits 1 on unreadable scans — the mod must still render ok repos and surface per-repo errors, not treat nonzero as dead. Repo named keys vs paths: rows need `name` (short) not `root` for display; `root` only for cwd matching.

## Probes before build

- P1 `akrogon status --json` emitted and stable for one week of real leaves — done-criterion on the akrogon leaf, not the mod: panel can't start until the contract exists.
- P2 `exec hc` + `exec git`-free check: mod can `exec("akrogon", ["status","--json"])` from within a herdr-app session — verify PATH resolves `akrogon` from a mod exec context (mod `exec` runs under the app's environment, not a login shell; `akrogon` lives at ~/.local/bin or bun-installed path). One line: `exec("which",["akrogon"])` in a scratch mod.
- P3 tabs-clone default behavior: confirm `this.panels` in localStorage is per-window and that injecting `"tasks"` into a fresh space's restore produces an open Tasks panel without a stored choice — 15-minute probe on the real clone before the leaf writes the full diff.

## Questions this fork doesn't ask

- Refresh cadence: `status --json` does a full scan of every repo (state.yaml reads, timings, log). On 11 repos that's not free; don't exec it on a timer <30s and cache the last good payload with its `generated_at` shown, so a failed scan doesn't blank the board. Suggest: exec on panel-show + a 60s timer while visible, off when hidden (hidden mods still run timers — AGENTS.md "Keep in mind").
- Does `--json` cover `akrogon status <slug>`'s leaf view (state dump, history, seat resolution)? Panel v1 needs only the list; leaf click could later exec `status <slug>` into the detail view — flag as out of scope now, one line in the contract.
- `herdr.space`/`herdr.tab` labels already exist on app-spawned terminals (verified live: t3 labels, hc get 2026-11-03): the port should reuse that label namespace convention for `akrogon.leaf` — same question the epic intake must answer anyway.
