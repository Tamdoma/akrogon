# Worker brief 3 — lifecycle skill surfaces (U3, D2 + D6 skill half)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/budget-rules-u3

## 1. Goal

Update the three seat skills and three supporting skill files so every reference matches the
renamed `## Grant reuse and paid sessions` rules (plan decisions D2, D6). Done-criterion 2.

## 2. Acceptance criteria

1. `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`,
   `skills/plan-issue/SKILL.md` name "grant reuse and paid sessions" at their
   lifecycle-rules link lines, and "record file for grant count lines" becomes "record file".
2. check-issue `## check.review` count paragraph (:69) becomes the ledger audit; check-issue
   `## check.repair` (:79, :91) recorded-output citations split replay vs trigger; the
   `## Shared context` operator-only paragraph (:31) notes paid launches inside the standing
   scope are covered operations, never `Operator actions`.
3. implement-issue's worker count-line sentence (:52) becomes the reservation sentence;
   recorded-output citations (:62, :77, :83) split replay vs fresh-call trigger.
4. `skills/AREA.md` :18 names the new section and adds chart-issues to the readers.
5. `skills/watch-issues/consultant-brief.md` `## Limits` keeps the operator-stop list but
   words "grant or permission" so a paid launch inside the leaf's standing grant is not an
   operator stop; out-of-scope stays a stop.
6. `skills/mine-issues/SKILL.md` `## Sources` step 4 drops "count lines" for the reservation
   record (reservations n and reasons in reports, ledger rows in `budget.jsonl`).
7. No file keeps a count-line, renewal, warn-past-bound or per-launch operator-approval rule.

## 3. Read-first list

- `skills/check-issue/SKILL.md` lines 20, 31, 69, 79, 91.
- `skills/implement-issue/SKILL.md` lines 27, 52, 62, 77, 83.
- `skills/plan-issue/SKILL.md` line 31.
- `skills/AREA.md` line 18; `skills/watch-issues/consultant-brief.md` lines 25-31;
  `skills/mine-issues/SKILL.md` line 30.
- `skills/chart-issues/assets/standing-design.md` line 16 — the replay half stays there; the
  fresh-call trigger now lives in `skills/lifecycle-rules.md` `## Grant reuse and paid
  sessions` (another worker edits that file; cite it by name).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

**check-issue/SKILL.md**:
- :20 — "grant reuse and count lines" → "grant reuse and paid sessions"; nothing else.
- :31 — the operator-only paragraph: add that paid launches inside the standing scope (paid
  sessions on the logged-in harness accounts under `run-check --sessions`) are covered
  operations recorded by reservation, not operator actions; a paid launch outside the grant or
  the ceiling stays an operator blocker under its own rule. The `Operator actions` example list
  ("a permission, a token scope, a live-mutation authorization") stays.
- :69 — replace the count paragraph with the ledger audit, keeping the surrounding rules:
  "`check.review` launches no covered operation: live proofs run in implement and
  `check.repair` as today, and a needed live proof missing from the plan is a Fix for
  `check.repair`. The review audits paid launches against the reservation record: each paid
  launch names its `run-check --sessions` n and reason in the leaf's artifacts and matches a
  `budget.jsonl` row; paid activity the artifacts do not explain, or a paid launch with no
  reservation row, is a Fix."
- :79 — "for a product model that means changing its instructions and re-recording only under
  standing-design's recorded-output fresh-call rule and its grant" → "... under the fresh-call
  trigger in lifecycle-rules' `## Grant reuse and paid sessions` and its grant, replaying under
  standing-design's recorded-output rule".
- :91 — "with model and outside stages following standing-design's recorded-output rule" →
  "...following standing-design's recorded-output rule, with fresh calls under the trigger in
  lifecycle-rules' `## Grant reuse and paid sessions`".

**implement-issue/SKILL.md**:
- :27 — "grant reuse and count lines" → "grant reuse and paid sessions"; "A's record file for
  grant count lines and kept output" → "A's record file for kept output and launch
  reservations".
- :52 — "A worker command that can reach a paid session counts against the grant bound by its
  unit, and A writes its count line in `implementation/report.md`." → a worker command that can
  reach a paid session runs through `akrogon run-check --sessions <n>` reserving n for the
  unit, and A writes n and its reason in `implementation/report.md`.
- :62, :77, :83 — "following standing-design's recorded-output rule" → "...rule, with fresh
  calls under the trigger in lifecycle-rules' `## Grant reuse and paid sessions`" (three sites).

**plan-issue/SKILL.md**:
- :31 — "grant reuse and count lines" → "grant reuse and paid sessions"; "record file for
  grant count lines and kept output" → "record file for kept output and launch reservations".

**AREA.md** :18 — "...the rules plan-issue, implement-issue and check-issue share: grant reuse
and count lines," → "...share, read also by the chart door: grant reuse and paid sessions,".

**consultant-brief.md** `## Limits` (:27) — the stop list keeps credential/login/permission,
live-mutation grant, decided locks etc.; adjust "a credential, login, grant or permission;
spend past a recorded grant" so a paid consultant launch inside the leaf's standing grant and
the `paid_budget` ceiling is not an operator stop, while spend outside the recorded grant
stays one.

**mine-issues/SKILL.md** :30 — "the implementation report (attempts, what failed, count lines,
costs)" → "(attempts, what failed, session reservations and their reasons, costs)".

Chunks that must land first: none. Owned paths: the seven files above. No shared test
resource. Creation commit: filled by A.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/lifecycle-rules.md` or `skills/chart-issues/**` — other workers own them;
  cite the new section name, do not quote its text.
- Do not edit `docs/` — a later wave owns human docs.
- Do not keep a count-line, renewal, warn-past-bound or per-launch approval sentence; their
  absence is the criterion.
- Return a mismatch with evidence if a cited line is absent or already changed; the exception
  is a revised brief from A.
- Standing exclusions: never `git stash`; commit WIP then `git reset --soft <creation commit>`
  and make the unit's one returned commit. Restated: one commit, seven files, no stash, no
  test edits.

## 6. Ordered steps

1. Read the cited lines; confirm they match this brief. (AC7)
2. Edit check-issue (4 sites), implement-issue (5 sites), plan-issue (1 site). (AC1-3)
3. Edit AREA.md, consultant-brief.md, mine-issues SKILL.md. (AC4-6)
4. Run §7; commit once.

Advisory size: 7 files, under 30 turns.

## 7. Commands

```
akrogon run-check --name u3-links -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && bun test ./tests/docs-links.test.ts'
akrogon run-check --name u3-format -- sh -c 'bunx prettier --check skills/check-issue skills/implement-issue skills/plan-issue skills/AREA.md skills/watch-issues skills/mine-issues'
```

Expected: `seat texts` test fails `Expected: 5, Received: 4` (planned fail-first; another
worker adds the link) and everything else green. `u3-format` fully green.

## 8. Done-when, evidence and report

Done when AC1-7 hold and the commit exists. Cite `check` lines. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
