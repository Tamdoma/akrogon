# Worker brief 2 — chart door surfaces (U2, D3 + D4 + D5 + D7)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/budget-rules-u2

## 1. Goal

Update the chart-issues skill and its three assets for the budget-rules leaf (plan decisions
D3, D4, D5, D7): the door budgets paid sessions under `paid_budget` via `run-check --sessions`,
per-leaf paid approvals/count-lines/renewals leave the rules, and chart-issues gains the fifth
`lifecycle-rules.md` link. Done-criteria 2 and 3.

## 2. Acceptance criteria

1. `skills/chart-issues/lifecycle-rules.md` exists as a symlink to `../lifecycle-rules.md`
   (`git update-index --add` picks it up as mode 120000 — create with `ln -s`).
2. `skills/chart-issues/SKILL.md` carries a `lifecycle-rules.md` link paragraph like the seat
   skills', naming the door's record file (the fork's `## Charting proofs` record) and its stop
   (the Needs wait), and its `## Open`/`## Take`/`## Handoff` paragraphs match §4.
3. `assets/standing-design.md` keeps the replay half of the recorded-output line and points the
   fresh-call trigger at `skills/lifecycle-rules.md`; chain-trigger and slow-run lines repoint.
4. `assets/shapes.md`: `### readiness.yaml` example gains a `by: standing` grant entry as its
   SECOND grants entry; `## Preflight and validation` states a `by: standing` entry is the
   door's to write and claims no operator approval while every other approval stays
   operator-only.
5. `assets/autopilot.md` waits paragraph: a mutating or paid proof call still waits, but a paid
   charting probe waits on the `paid_budget` Needs row when its reservation is refused, never on
   per-call operator approval.
6. No surface keeps: a per-leaf paid session count, a renewal entry, a count line, or an
   operator approval for a paid launch inside the standing scope.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` lines 43-47 (seat/needs paragraphs), 69-75 (Take grant/proof
  paragraphs), 81 (Handoff).
- `skills/chart-issues/assets/standing-design.md` lines 10-18 (recorded-output line 16, chain
  17, slow-run 18).
- `skills/chart-issues/assets/shapes.md` lines 344-369 (grants example), 408-412 (Preflight).
- `skills/chart-issues/assets/autopilot.md` line 9 (waits paragraph).
- `skills/plan-issue/SKILL.md` line ~31 — the seat link-paragraph pattern to copy (do not edit).
- `skills/check-issue/lifecycle-rules.md` — an existing symlink, the gitlink shape to copy.
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

**SKILL.md**:
- Add, near the top context area (before or after the `## Shared context` content, matching the
  four seat skills' convention): a sentence that the lifecycle rules shared with the other
  seats live in `[lifecycle-rules.md](lifecycle-rules.md)`, that the door's record file for its
  reservation (n and its reason) is the fork's `## Charting proofs` record, and that its stop
  for a refused reservation is the Needs wait (the chart waits on the `paid_budget` row like
  any pending row).
- `## Open` needs paragraph (:47): drop "grants for ... paid or nested launches" from the
  sheet rows (paid launches on logged-in harness accounts are standing under `paid_budget`);
  keep live-change grants, fixture retention, secret-save, keys, `paid budget`. Add: the door
  reserves a paid charting probe with `akrogon run-check --sessions <n>` and records n and its
  reason in the fork's `## Charting proofs` section; a reservation refused for a missing or
  exhausted ceiling waits on the Needs row like any pending row.
- `## Take` proof paragraph (:69): replace "within the one operator-approved paid test budget"
  with the `--sessions <n>` reservation under the `paid_budget` ceiling, n and reason in the
  fork's `## Charting proofs` record.
- `## Take` grant paragraph (:73): a leaf whose live proof uses paid launches carries one grant
  entry with `approved: {by: standing, date: <paid_budget.approved.date>, answer:
  "~/.akrogon/config.yaml paid_budget"}`, its `bounds` holding non-count limits or "sessions
  under paid_budget" when none — the entry never claims operator words for this leaf. Outside
  live changes, destructive, public, billing, DNS, new identity or target keep an operator
  `approved` entry as today; a leaf needing both carries two entries. A session count in an old
  entry is information only. Keep the grant-field list that is not count/renewal mechanics
  (approval provenance, principal/account, targets, fixtures with cleanup and absence_check,
  operations, effects, stop line, lifetime). Remove the repeat-bound unit example, the renewal
  sentence, the count-line sentence and "the door itself never warns and runs: every paid proof
  call still waits for operator approval" — replace with the standing/reservation rule above.
- `## Handoff` (:81): "each leaf's recorded grant, paid model launches included, confirmed"
  stays but note that `by: standing` entries are door-written and need no operator approval;
  keep the live-run estimate line unchanged (it is information only).

**standing-design.md** (lines 16-18):
- Line :16 keeps everything about replay (recording source/revision/date, committed fixture or
  preserved path, real consumers, re-record never hand-patched, machinery distinction) and
  replaces the fresh-call trigger with: the fresh-call trigger — when a fresh paid run is
  needed — lives in `skills/lifecycle-rules.md` under `## Grant reuse and paid sessions`.
- Lines :17 and :18 replace "the recorded-output rule above" citations where they mean the
  trigger with "the recorded-output rule above and lifecycle-rules' fresh-call trigger" (replay
  stays here; the trigger lives there).

**shapes.md**:
- `### readiness.yaml` example: after the existing operator grant entry, add a second grants
  entry: `approved: {by: standing, date: <YYYY-MM-DD of the paid_budget approval>, answer:
  "~/.akrogon/config.yaml paid_budget"}`, `principal: <agent identity>`, `account: <logged-in
  harness account>`, `credential: {name: <harness login>, holder: <holder>}`, `targets:
  [<harness sessions>]`, `fixtures: []`, `operations: [<paid launch operations>]`, `effects:
  <paid model sessions on the logged-in account>`, `bounds: sessions under paid_budget`,
  `stop_line: <never-cross condition>`. Keep `grants[0]` unchanged — a test asserts its
  fixtures are non-empty.
- The `bounds:` comment loses the repeat-unit example; state `bounds` holds non-count limits,
  or "sessions under paid_budget" for a standing entry.
- `## Preflight and validation` (:410): change "grant approval, fixture retention and
  secret-save approval stay operator-only" so a `by: standing` grant entry is the door's to
  write and claims no operator approval; every other approval (live-change grants, fixture
  retention, secret-save) stays operator-only.

**autopilot.md** (:9): keep the waits list; change the mutating/paid proof clause so a paid
  charting probe waits only on the `paid_budget` Needs row when `run-check --sessions` is
  refused — never on per-call operator approval — and add that a `by: standing` grant entry is
  the door's to write, no operator approval.

**New symlink**: `ln -s ../lifecycle-rules.md skills/chart-issues/lifecycle-rules.md`.

Chunks that must land first: none. Owned paths: `skills/chart-issues/**`. No shared test
resource. Creation commit: filled by A.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/lifecycle-rules.md` itself — worker 1 owns it; you only link to it.
- Do not edit `assets/{questions,direct-route,handover}.md` — no removed-rule term lives there.
- Do not keep renewal/count-line/warn-and-run sentences anywhere in your files.
- The live-run handoff estimate line keeps the session count — it reports a plan, it does not
  require approval; changing it is out of scope.
- Return a mismatch with evidence if a named paragraph is absent or already rewritten; the
  exception is a revised brief from A.
- Standing exclusions: never `git stash`; commit WIP then `git reset --soft <creation commit>`
  and make the unit's one returned commit. Restated: one commit, all paths above including the
  symlink, no stash, no test edits.

## 6. Ordered steps

1. Read each named section; confirm the text matches this brief. (AC6)
2. Edit SKILL.md paragraphs; add the lifecycle-rules link line; create the symlink. (AC1, AC2)
3. Edit standing-design :16-18. (AC3)
4. Edit shapes example and preflight. (AC4)
5. Edit autopilot :9. (AC5)
6. Run §7 commands; commit once.

Advisory size: 6 files, under 24 turns.

## 7. Commands

```
akrogon run-check --name u2-links -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && bun test ./tests/docs-links.test.ts'
akrogon run-check --name u2-shapes -- bun test ./tests/chart-shapes.test.ts
akrogon run-check --name u2-format -- sh -c 'bunx prettier --check skills/chart-issues'
```

Expected green: all three, including the previously-red `seat texts` and `grants.some(standing)`
cases — your diff turns them green. Report any other failure verbatim.

## 8. Done-when, evidence and report

Done when AC1-6 hold, the symlink is committed as a gitlink, and §7 is green. Cite `check`
lines for kept output. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
