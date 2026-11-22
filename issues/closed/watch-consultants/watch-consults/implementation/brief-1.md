# Brief U1: timer coalescing, timer consultant sweep, stop consultant sweep

## 1. Goal

Implement plan decisions D4–D6 for leaf `watch-consults`: the timer's due queue coalesces unsent dues to the latest boundary; the timer's exit path and `watch-issues stop` kill and remove the watch's own verified consultant; `start.ts` passes `--prefix` so the timer can verify it. Plan: `/home/ivan/Work/infra/akrogon/issues/open/watch-consultants/watch-consults/plan.md`; design items: consult-loop item 10, fix-and-config items 8 and 8'.

## 2. Acceptance criteria

1. `poll` boundary handling: `dueCount += 1` per crossed boundary; if `dues` holds an entry with `sent === null` it is updated to the new `dueCount`, else a new due is pushed. The queue keeps any sent due plus at most one unsent due, always the latest number. All send/resend/drop bookkeeping downstream is unchanged.
2. `timer.ts` gains `--prefix` (required flag like `--watcher`/`--root`/`--repo`); `start.ts` appends `'--prefix', target.prefix` to the timer `hc run` argv.
3. `timer.ts` exit path: after the loop breaks (`poll` returned `'exit'`), before `console.log('[watch-timer] exited')`, sweep the watch's own consultant: `terminals(args.session, {})` filtered to verified consultants (below), then `hc kill` + `hc rm` per hit tolerating `not_found`; other errors noted, exit still happens. A `Seen` row has `{name, state, labels, parent, address, argv}`.
4. `stop.ts`: after the timer is verified and before it is killed, resolve the watch's consultant candidate; a live terminal that names itself `<prefix>-watch-consult` or carries `akrogon.watch-consult=<repo>` but fails the verified predicate is `conflict <details>` exit 2, touching nothing (same shape as the timer conflicts). After the verified timer kill+rm, the verified consultant gets kill+rm tolerating `not_found`, and the script prints `stopped <timer>` then `stopped consultant <address>` only when one closed; with no consultant it prints `stopped <timer>` alone; the `stopped` (nothing running) path is unchanged.
5. Verified-consultant predicate, shared helper in `scripts/hc.ts` beside `isVerifiedTimer`: terminal is live, `name === `<prefix>-watch-consult``, `labels['akrogon.watch-consult'] === repo`, `labels['akrogon.repo'] === repo`, and `parent === <watcher address>`. The watcher address comes from the timer's verified `--watcher` argv value in `stop.ts` (tests strip `HC_TERMINAL_ID`, so `timer.term.parent` can be `null` while the argv always carries it) and from `args.watcher` in `timer.ts`. Type the parameter structurally so both `Term` and `Seen` fit (`{ name: string | null; labels: Record<string,string>; parent: string | null; state: string }`).
6. Planned tests already committed in `tests/watch-timer.test.ts` go green and no existing case changes: `coalesces unsent dues`, `stop closes the watch consultant after the timer, tolerating none and foreign`, `a dying watcher makes the timer exit sweep its consultant`. Write and edit no test; a wrong or still-red planned test is a mismatch return.

## 3. Read-first list

- `skills/watch-issues/scripts/timer.ts` (due loop and exit), `scripts/start.ts` (timer launch argv ~line 119), `scripts/stop.ts`, `scripts/hc.ts` (`isVerifiedTimer`, `hcCall`, `getTerm`, `Term`), `src/hc.ts` (`Seen`, `terminals`).
- `tests/watch-timer.test.ts` lines 1030–1145 (`consultTerm` helper and the three new tests) — the exact expected argv shape, labels, names and output lines.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

Owns: `skills/watch-issues/scripts/timer.ts`, `skills/watch-issues/scripts/start.ts`, `skills/watch-issues/scripts/stop.ts`, `skills/watch-issues/scripts/hc.ts`. Reads only: `tests/watch-timer.test.ts` (frozen, worker edits no test). No prerequisites; worktree created at leaf HEAD `7ca2387c75ed54dddb3df952c8fc1871ae483860`. New test helpers already exist; you add product code only.

`hcCall(session, argv)` returns `{ok: true, stdout}` or `{ok: false, kind, ...}`; `terminals(session, labels)` returns `Seen[]` (live and finished — filter `state === 'live'`). `stop.ts` derives the watcher from the verified timer `Term.argv`: find index of `'--watcher'`, take the next element.

## 5. Do-not

- No `git stash` — every worktree shares one stash. To set work aside: WIP commit, then `git reset --soft <creation commit>` and make the returned commit once.
- Edit no file under `tests/` — planned tests are frozen; a red or wrong planned test is a mismatch return with evidence, never a test fix.
- Sweep only the verified consultant — never touch a foreign-repo `akrogon.watch-consult=<other>` terminal or a named terminal that fails the predicate (conflict or ignore, never kill).
- Do not change `tick.ts` (it accepts a higher due; consult-loop item 10).
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worker worktree.
2. `hc.ts`: add `isVerifiedConsultant(prefix, repo, watcher, term)` per AC5.
3. `timer.ts`: parse `--prefix`; coalesce per AC1; sweep per AC3 on every `'exit'` from the loop.
4. `start.ts`: add `'--prefix', target.prefix` to the timer argv.
5. `stop.ts`: consultant candidate resolution, conflict rules, post-timer sweep and `stopped consultant` line per AC4.
6. Run the section-7 commands; iterate until green.

Advisory size: 4 files, ~25 turns.

## 7. Commands

```
akrogon run-check --name u1-timer -- bun test --timeout=30000 ./tests/watch-timer.test.ts --test-name-pattern "coalesce|consultant after|sweep"
akrogon run-check --name u1-timer-all -- bun test --timeout=30000 ./tests/watch-timer.test.ts
cd skills/watch-issues && bun run typecheck
```
The second command is the whole timer file — it must stay green (existing expectations unchanged). Cite each `check <label>:` line.

## 8. Done-when, evidence and report

All three new tests pass, the whole `watch-timer.test.ts` file passes, the skill typecheck passes, commits carry the unit's work. Commit on the leaf branch in the worker worktree; return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
