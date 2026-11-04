# Design: status-attention-facts

## Binding decisions, verbatim

### direction

Question: Seven high-level questions asked before A answers later rounds under autopilot: board purpose, row density, producer changes, colors, width, who starts the next seat, must keep / must go.

Answer and reason:

Operator 2026-11-04, reply verbatim: "1a | 2a | 3 - what do you want to change exactly? | 4a | 5c | 6a |"

- 1a: the board is for spotting problems; problems loud, the rest calm.
- 2a: little text per row: name, state word, one short reason; more on click.
- 3a (operator 2026-11-04, after A's explanation, reply verbatim: "3a"): change akrogon status too. (1) Two more problem cases in the producer's red flag: a task waiting on something that will never finish (dependency parked, missing or unreadable) and a merge whose background job died. (2) Report which seat a task waits for. The waiting-run warning stays a short line; fields for it are skipped. One small akrogon leaf before the board leaf.
- 4a: grey and white, color only for problems (like the sidebar). Overrides D19's colored status pills for Tasks.
- 5c: works narrow first, wide must not look empty.
- 6a: something automatic starts the next seat; between seats shows as calm Waiting.
- 7: not answered; treated as no extra must-keep or must-go beyond existing locks.

## Round 2 (angles from slot C, slots/direction-C.md)

Operator 2026-11-04, reply verbatim: "For questions for this issue: 1b | 2b | 3a | 4c | 5a | 6c | 7a"

- 1b: the board points; one short phrase, a click jumps to the agent's pane or log where the problem is read.
- 2b: opened when the red dot lights; opens on Needs you first, other sections may fold.
- 3a: age never turns a row red; time is shown, only recorded problems are loud.
- 4c: within a section, the row blocking the most other tasks first (each row shows how many wait on it).
- 5a: Needs you holds tasks only; charts stay off the board.
- 6c: the board is a draft for herdr-app's own version; follow how herdr-app's own panels work so decisions carry over.
- 7a: chart the direction-round idea (Tamdoma/akrogon#128) right after this chart in the same autopilot run.

### sections

Question: With the board grouped by state (list-shape 1a), which states go in which section: what counts as "Needs attention", where does a task between seats go (live phase, no blocker, its next seat not running), where do stopped tasks and merged tasks under a still-open epic go, and what does the header count?

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words. Steered by direction 1a, 2a, 3a, 2b, 4c, 6c and the values simplicity, removing over adding.

1. Sections in order: Needs you, Working, Waiting, Paused. Empty ones hidden. No fold controls (2b is met by Needs you on top; removing over adding). Name "Needs you" from the Agents list (6c, direction 2b) (A,B,C after rebuttals).
2. One section per row, first match in this order: Needs you fact; clean merged leaf hidden; hold (Paused); recorded activity (Working); else Waiting. A hold is checked before activity because stop keeps `busy_since`. A spinner and hold word still show inside a Needs you row (B,C).
3. Needs you facts, all set in the producer's `leafRed` so `akrogon status`, the dot and the board agree (direction 3a): failed; recorded missing artifact; delivery error on a seat with no busy timestamp; a dependency labelled parked, missing or unreadable; a merge whose land job stopped with no recorded handoff (not `is-active` alone, so a finished land awaiting reconciliation never flashes red) (C pitfall, B qualification: the row says "merge job stopped", not "push failed"). Dependents of a readable failed owner are not promoted; they wait naming it (B).
4. Waiting reasons: "waiting on <repo/slug>"; "merge queue #N"; "next: A", "next: B" or "next: A+B" from a producer field listing the unfinished required seats that are not busy, computed from `src/routing.ts` beside `leafRed`; the mod never names a phase rule (B R3, A, C).
5. Paused: stopped, paused repo, parked, with that word. An attention fact beats a hold (B). Parked entries carry no seats or Files target (B,C).
6. Merged leaves under an open epic: hidden. A merged leaf with `broadcast_pending` stays in Waiting as "broadcast pending" (B). Rejected: Done section with "3 merged, 2 open" (A,C): an extra surface the problem-spotting board does not need (1a, 2a, removing over adding). Standing dissent: C keeps the Done line, folded.
7. Order inside a section: most direct unmerged dependents first (distinct leaves in the same repo whose unresolved `blocked_by` names this one), ties oldest first, stable (B,C; direction 4c). The row shows "blocks N" only when N > 0. Computed in the mod from `blocked_by`. Overrides the current-repo-first test (Test-Change citation).
8. Header: `env.red` labelled as problems ("2 problems"), red, shown only when above zero, so the dot and the number agree; non-task problems are always drawn in the machine block above Needs you (C; B's labelling condition met). Rejected: task-only count (B): a lit dot beside "0" sends the operator opened on the dot to an empty section (2b). Standing dissent: B prefers the task-only count.

Carries to other forks: the pane or log target for a click (direction 1b) goes into the producer leaf's scope (B R4, C) and is settled in the row fork; the waiting-run warning stays a short line (direction 3a, B R2) and is placed in the machine-lines fork.

Exclusions: list-shape, machine-lines, row, open-row, type-and-color, scale and width bind the Tasks mod (owner: tasks-sections-board) and the panel bar (owner: tasks-side-open), not this leaf. From sections, only items 3 and 4 (the Needs you facts, owned by the producer's predicate, and the waiting seats from a producer field) and the header's use of `env.red` (item 8) bind here; section order, merged hiding, ordering and labels are the board's.

Standing design: /home/ivan/.akrogon/releases/7f697eee16682629d75754ef90d74686ecabc565/skills/chart-issues/assets/standing-design.md
Interpretation: no auth, secrets or backend mutations are involved. Each criterion is proven by the cheapest test at the real boundary: `akrogon status --json` over fixture repos with the existing `tests/status-fixture.ts` helper; no new machinery. The land-alive check is a systemd query (`landAlive`); tests use the seam the status tests already use for it, or the plan names one. A deliberate break (removing a new fact from the predicate) must turn its test red.

## Leaf architecture

Owned surfaces: `src/status.ts` (leafRed, undelivered, blockedBy, leafJson, the JSON leaf type; the text view (`cells`, `note`) is unchanged (C)), `src/routing.ts` read only, `tests/status-json.test.ts` and `tests/status.test.ts` (or a new status test file).

Interfaces (literal):
- JSON leaf gains `attention: string[]` and `waits_on: ("A" | "B")[]`. `red` stays and equals `attention.length > 0`.
- Attention entries are short stable phrases the board shows as written: `failed: <cause>: <reason>`, or `failed` when the state has no failure record (permitted by `stateSchema`, handled today by `note`) (B), `missing <kind> <name>`, `<seat> prompt <code>`, `waiting on <slug> (<label>)` for labels parked, missing, unreadable, and `merge job stopped`.
- `waits_on` order is A then B.

States this changes and their consumers:
- `leaf.red` and envelope `red`: consumed by herdr-setup panel-bar `redDot` (`routine.js` envelope/redDot: `red > 0`), and by the Tasks mod `model.js` (leafRow `red`, alerts). The dot lights for the two new facts; that is the decision (direction 3a).
- Merged dependencies stay non-obstructing: `blocked_by` lists merged dependencies too (label merged); only parked, missing and unreadable labels are attention facts; live non-merged dependencies are waiting, not attention.
- Land: `landAttempt` returns an attempt only while `batch.owner === 'command'`; `handOff` (src/land.ts) sets owner to `seat` before the land process exits, so "attempt present and `landAlive` false" means the job stopped before handing off. One exception: `src/phase.ts` batchPush saves `recorded: true` and `candidate` right after a successful push, before the merge move; a job that stops after that is a pushed land awaiting reconciliation (`src/next.ts` reconcileBatch finishes it), so the fact requires `batch.recorded !== true` (B). The phrase says the job stopped, not that the push failed (B).
- The watch skill does not read `akrogon status` (`skills/watch-issues/scripts/observe.ts` reads `akrogon config`, `herdr agent list` and state files), so it is not a consumer (C).

Exclusions: the Tasks board's sections, phrase layout and colors (owner tasks-sections-board); pane or log targets for a row click (recorded for the herdr-app chart, not here); the waiting-run table stays as `env.run` text (direction 3a).
