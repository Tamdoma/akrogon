# Plan: tasks-sections-board

Synthesis 2026-11-04, slot A. Brief and locked design govern; design wins where they differ (none found).

## Decisions

- **D1 Board shape.** `board(env, ctx)` returns `{ problems: number, machine: MachineLine[], sections: { name, rows: RowModel[] }[] }`, `MachineLine = { text: string, tone: "red" | "dim", detail: string | null }`. Sections emitted in fixed order Needs you, Working, Waiting, Paused; a section with zero rows is omitted. `env.red` is carried as `problems` so the header needs no env access. Replaces `{ alerts, repos, quiet }`; `repoSection`, `alertLine`, `pill`, `pillFor`, `withAlpha`, `tags`, `line2`, group heading rows all go.
- **D2 Section assignment, one `sectionFor(repo, leaf)` function, first match wins:**
  1. `attention.length > 0` → Needs you
  2. `phase === "merged"` → hidden, unless `broadcast_pending` → Waiting
  3. `stopped || repo.paused` → Paused
  4. `busy_since.a|b !== null || land?.alive === true` → Working
  5. else → Waiting
  Hold is checked before activity because stop keeps `busy_since` (design sections 2). Attention beats a hold (design sections 5). Answers the open fork question inside "section assignment, one function, first match".
- **D3 Waiting reason, one `reason(repo, leaf)` function, first match:** `broadcast_pending` → "broadcast pending"; first `blocked_by` entry whose label is not `merged` → `waiting on <repo>/<dep.slug>`; `queue` place → `merge queue #N`; `waits_on` non-empty → `next: <seats joined "+">`; else `""`. Needs you rows show `attention[0]` instead; Paused rows show "stopped" / "paused" / "parked". Needs you keeps the busy spinner (D7).
- **D4 Row time.** Busy seat → `since(now − min(busy_since))`; otherwise phase age `since(now − phase_since)`; `phase_since === null` → `""`. Covers the Working-row-held-by-land case (criterion 3).
- **D5 `blocks N` and section order.** `depCount(repo, slug)` = distinct leaves in the same repo with `phase !== "merged"` and no `blocked_by` entry `{slug, label: "merged"}`, whose `blocked_by` names this slug. Sort inside a section: `depCount` desc, then `phase_since` asc (oldest phase age first; `null` sorts newest), stable. Row shows `blocks N` only when N > 0.
- **D6 RowModel.** `{ repo, slug, phase, section, time, reason, reasonRed: section === "Needs you", blocks, seats: {a,b: SeatCell}, folder: string | null (dirname(plan)), worktree: string | null, parked: boolean, detail: { reasons: string[], blockedBy: string[], missing: string[], moves: string[], kept: {path,reason}[] } }`. Parked repo entries become `RowModel`s with `slug` = entry text, `parked: true`, `folder/worktree/seats` empty, `reason: "parked"`, no click, no chevron. `detail.reasons` = `attention` (or `[reason]` when non-empty) so the expansion shows it in full. `moves` = last 3 history lines as `<age> ago  <from> → <to>`. `missing` entries keep `<kind> <name> in <holder>: <steps>`. No `pill`, `tags`, `line2`, `done`, `attempts`, `verdict`, `seats` strings, `plan`/`worktree` path lines in detail.
- **D7 Seat icons.** `seatProgram` kept. `icon()` mirrors herdr-setup `mods/agents-by-tab/main.js`: `tint` → `svg(icon).text_color("#ffffffb3")`; else `image("mono/" + basename(icon, .svg→.png))`. Busy seat → `svg(SPINNER).text_color(t.muted).spin(900)`. No fallback branch for a missing mono file (design: host draws nothing).
- **D8 Click and pin.** `pinIntent(spaceId, folder, view, existingPin, seq)` takes the folder string. Row body click → `pin(row.folder, "files")` via `worktree.pin` + `panel.request` (shared pin, so Changes roots there too). Chevron (full row height × 24 px, `stop_propagation`) toggles `expanded` — no pin. Files/Changes buttons in the expansion `stop_propagation` and pin `row.worktree`. `pin <slug> <view>` command unchanged: pins the worktree. Parked rows: no click.
- **D9 Machine block.** `board()` builds lines in order: deploy failed → `deploy failed at <step>: <error>` red (no sha); `repo.unreadable` entries → `<repo> · <file> unreadable: <error>` red; `repo.error` with `unreadable` empty → `<repo> · <error>` red; `env.run` → `{ text: "run waiting", tone: "dim", detail: env.run }`. No slow-merge line, no per-leaf Failed/Missing lines, no `quiet`. Scan failures are host state, not env: `main.js` prepends `Tasks unavailable — <first line>` (env null) or `refresh failed · rows from <since(stamp)> ago` (env stale) as a red line above the env lines.
- **D10 Type and color.** No stage pills; phase word on line 2. Red (`ansi1`) only: header "N problems", the "Needs you" section label, Needs you reasons, machine red lines. Slug: `t.foreground` normal weight always. Repo prefix, phase word, time, blocks, section labels (except Needs you): `t.dim`. Reason: `t.muted` (`t.ansi1` when `reasonRed`). Spinner `t.muted`. Hover `t.hover`; no selected fill — `props().fill === "selected"` support removed, `fill === "hover"` and `props().expand` kept for screenshots.
- **D11 Sizing.** `S()` only on row text (slug 13, line 2 11), expansion text (11), seat icon size (18) and row-driven heights. Fixed: header 42 with 13 px title, section labels 11, paddings, gaps, radii, chevron 11.
- **D12 Width.** The `max_w(S(880))` cap is deleted; the list fills the panel; header `px(14)` and list padding keep one left edge. `on_size_change` threshold: none added.
- **D13 model.d.ts.** `LeafJson` gains `attention: string[]` and `waits_on: ('A'|'B')[]`; `Board`, `RepoModel`, `RowModel`, `AlertLine`, `Pill`, `LeafDetail`, `GroupModel` are replaced by the D1/D6 shapes; `pinIntent` signature per D8; `leafRows(board)` flattens `sections[].rows` excluding parked rows (test helper only).

## Read-first

- `herdr-app/tasks/model.js`, `herdr-app/tasks/main.js`, `herdr-app/tasks/model.d.ts`, `herdr-app/tasks/schedule.js` — owned surfaces.
- `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`, `tests/fixtures/status-envelope.json` — owned tests and shared fixture.
- `src/status.ts` (JsonLeaf/JsonRepo, `leafAttention`, `waits_on`) — producer contract; `src/AREA.md` non-obvious patterns (pure-model boundary).
- `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js` (`icon()`, TONE, chevron usage), `mods/files-view/main.js` + `mods/changes-view/main.js` (`worktree.pin` consumers), `mods/panel-bar/main.js` (`panel.request`, red dot) — read-only neighbors.
- `learnings/LESSONS.md` — Test-Change/trailer mechanics live in `src/phase.ts` (`frozenRecord`, `requireFrozenCitations`, `testFile`).

## Interfaces consumed (never re-derived)

`leaf.attention`, `leaf.red` (= `attention.length > 0`), `leaf.waits_on`, `leaf.blocked_by[{slug,label}]`, `leaf.busy_since`, `leaf.phase_since`, `leaf.stopped`, `leaf.broadcast_pending`, `leaf.land.alive`, `leaf.missing`, `leaf.history`, `leaf.plan` (dirname = issue folder), `leaf.worktree`, `leaf.seats`; `repo.paused`, `repo.parked`, `repo.queue`, `repo.kept`, `repo.unreadable`, `repo.error`; `env.red`, `env.deploy`, `env.run`, `env.watch`.

## Waves — serial-solo

Every unit owns paths shared with the other unit's tests, so each wave holds one unit; A implements the plan itself.

| Wave | Unit | Owns | Depends on |
|------|------|------|------------|
| 1 | U1 view model | `herdr-app/tasks/model.js` (+ `model.d.ts` boundary landed with tests) | tests committed at planning |
| 2 | U2 host render | `herdr-app/tasks/main.js` | U1 (host tests import `board`/`leafRows` results) |

Test side (committed at planning, before product code): `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`, `tests/fixtures/status-envelope.json`, `herdr-app/tasks/model.d.ts`. Fixture gains `attention`/`waits_on` on every leaf; derived envelopes add the failed/stopped/parked/merged-broadcast cases.

## Doc checklist

No doc changes: `docs/start/install.md` says only "the shipped Tasks board" and `src/AREA.md` describes the host/pure-module split — both still accurate.

## Credentials

`env: []` in `akrogon config`; `akrogon status tasks-sections-board` shows no `Missing:` lines. No blockers.

## Criteria → proofs

All proofs run through `akrogon run-check --name <label> -- <cmd>`; each is the smallest real boundary (mocked gpui-kit element tree over real mod code, or `board()` directly). Size: seconds each. Rerun trigger: any edit to the named files or their helpers/fixture. Commands use the repo's configured runner (`bun test`) so `akrogon verify` reproduces them.

1. **Sections, hidden merged/empty, no heading rows** — `tests/tasks-mod.test.ts`: `board()` on the fixture plus a derived envelope (failed leaf, working leaf, blocked leaf, stopped leaf, merged leaf, merged+broadcast_pending leaf, parked entry, paused repo) returns sections exactly `["Needs you","Working","Waiting","Paused"]` in order with each leaf in its section, the merged leaf absent, broadcast-pending leaf in Waiting with reason "broadcast pending", parked row present with `parked: true`; a `sections` entry with no rows is omitted (empty-board derived envelope → `sections` excludes all-empty names; parked entry under Paused). Host: rendered `tasks-list` text contains no group/heading ids (`repo-`, `group` nodes absent). `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts`.
2. **Attention beats busy; stopped+busy → Paused; first attention phrase** — derived leaf `attention:["failed: x"]` + busy → Needs you with `reason` = that phrase and `seats.a.busy` still true; `stopped:true` + `busy_since` + `attention:[]` → Paused, reason "stopped".
3. **Waiting reasons and time source** — leaf blocked on a live leaf → `waiting on repo/slug`; `queue` entry → `merge queue #N`; `waits_on:["A"]` → `next: A`, `["A","B"]` → `next: A+B`; busy row `time` = `since(now−busy_since)`; land-alive leaf with no busy → `since(now−phase_since)`; `phase_since:null` → `""`.
4. **blocks N ordering** — derived repo with three Waiting leaves where leaf X has 2 unmerged dependents and Y has 1: X before Y before the zero-dependent leaf; two equal-count leaves order oldest `phase_since` first; `blocks` = the count, omitted at 0.
5. **Header and machine lines** — `env.red:3` → host header text `3 problems` on a node with `t.ansi1`; `red:0` → absent. `board()` machine lines: deploy.failed → `deploy failed at links: conflict` red; `unreadable` → `repo · /x/state.yaml unreadable: zod…` red; `error` alone → `repo · …`; `env.run` → one dim `run waiting` line with `detail` = the run text. No machine line mentions `Slow merge`, `Failed:`, `Missing:` for a leaf. Host: env-null error → `Tasks unavailable`; env stale + error → `refresh failed · rows from Nm ago`; clicking the dim line reveals `detail`.
6. **Row click pins leaf folder; chevron toggles; parked no target; buttons pin worktree** — host: row body click sets `worktree.pin[space].folder` = `dirname(plan)` and `panel.request.view === "files"`; same shared pin feeds Changes (single `worktree.pin` write — asserted as the pin value both views read); chevron click leaves `worktree.pin` unset and adds the expand key; parked row has no click handler; Files button pins `row.worktree`.
7. **Expansion contents and exclusions** — host: expanded row text contains the full attention string, `blocked_by` entries with labels, `missing` entries with steps, at most 3 move lines each with `ago`, `Files`/`Changes`, kept path+reason; and contains none of: seat command/source text, `plan`/`worktree` path strings, `attempts`, `verdict`, `done` words; open row has no `bg === t.selected` node.
8. **No pills; red placement; slug never red; muted spinner; one-color icons** — host: no `pillFor` export used / rendered node with pill-style `font_semibold` stage word — asserted as: no node with `text_color` in the old stage slots except the four allowed red uses; slug node `text_color === t.foreground` even when `reasonRed`; busy seat renders spinner svg with `t.muted`; tinted seat → `svg(icon)` with `#ffffffb3`; colored seat → `image("mono/<name>.png")`; Needs you label `t.ansi1`.
9. **Scaling and width** — host with `settings().font_size: 26` (K=2): slug node `text_size` 26, line-2 22, expansion 22, seat icon size 36; header `h` attr 42 and title 13; section label 11; `tasks-list` node has no `max_w` attr; header and list left edges (`px`/`p`) both fixed numbers.

## Conditions checked per decision (cases that fail on the violation)

- **D2 order** — stopped+busy → Paused (case in criterion 2; a check ordering busy-before-hold puts it in Working). merged+attention → Needs you not hidden: derived leaf `phase:"merged", attention:["x"]` stays visible in Needs you (covers "attention first"). Parked entry under `repo.paused` repo: still one Paused row each (parked rows don't merge into leaf rows).
- **D3 precedence** — leaf with both a live dep and a queue entry → `waiting on` wins (derived case: dep beats queue). `waits_on` only consulted when nothing else matches.
- **D5 stability** — equal depCount, equal `phase_since` → input order kept (Array.prototype.sort is stable in V8; asserted implicitly by the oldest-first case with a third tied row).
- **D6 parked** — parked `RowModel` carries `slug` text but `folder === null`: criterion-6 host case asserts no click handler exists.
- **D9 staleness** — `stamp` resets only on a successful env load: host sets `view.stamp`, injects error, asserts `Nm` matches `since(now−stamp)` (a rebuild-on-error that reset `stamp` would print `0m` … `since` floors at 0 — the case uses a stamp far enough back to distinguish).
- **D8 shared pin** — one `worktree.pin` write: no separate key is created (`sharedState` keys asserted to contain only `worktree.pin` and `panel.request` after a body click).

## Test plan at planning

Tests above are rewritten/added in `tests/tasks-mod.test.ts` (board/model) and `tests/tasks-mod-host.test.ts` (rendered tree), fixture extended with `attention`/`waits_on`, `model.d.ts` updated to the new boundary. Every new test is run red against the unmodified product code with the failing output recorded below, then committed with `Test-Change` trailers (each touched test-matched path, per `requireTestChangeCitations`/`frozenRecord`).

## Limitations carried

- B's standing dissent (task-only problem count, diagnostic live target, colored icons, header scaling) and C's folded Done line are recorded dissent, not scope.
- The pane-jump click target is deferred to the herdr-app chart (recorded in `issues/chart/herdr-app/INTAKE.md`); the leaf folder is the problem record akrogon writes today.
- `waits_on`/`attention` correctness is the producer leaf's; this board trusts the fields.

## Planned red evidence

Run against the unmodified product code on the leaf branch base `f96367e6`.

- `check tasks-mod: 1` → `implementation/check-tasks-mod-1793749754149-3226362.log`: 8 of 12 tests fail against the `{ alerts, repos, quiet }` board (`out.sections.map` undefined, `row.section`/`row.reason`/`out.machine`/`row.detail.reasons` undefined, `pinIntent` writes `folder: undefined`). Kept tests pass: unknown-program seat cell, `since`, `filesChanged`, `next`.
- `check tasks-mod-host: 1` → `implementation/check-tasks-mod-host-1793749755843-3227259.log`: 11 of 13 tests fail against the repo/pill renderer (no `section-*` nodes, no `3 problems`, no `run waiting`/`refresh failed` lines, no `chev-` chevron, `worktree.pin` folder is the worktree not `dirname(plan)`). Kept tests pass: failed-scan retry, panel-request seq.
