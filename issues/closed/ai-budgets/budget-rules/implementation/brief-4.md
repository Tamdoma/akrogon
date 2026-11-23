# Worker brief 4 — human docs (U4, D6 docs half)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/budget-rules-u4

## 1. Goal

Update the six human-facing docs pages to the new paid-session rules (plan decision D6):
`paid_budget` is the only paid-session budget, seats and the door reserve with
`akrogon run-check --sessions`, and no doc still describes per-leaf paid session counts or
per-launch approvals. Done-criterion 2.

## 2. Acceptance criteria

1. `docs/reference/limits.md`: the operator's paid-budget duty is supplying `paid_budget` once
   in the machine `~/.akrogon/config.yaml` (sessions per day and session minutes); paid
   launches on the logged-in harness accounts run under it without per-leaf approval, and a
   launch outside that standing scope still needs an operator grant.
2. `docs/reference/checks.md`: the run-check environment paragraph (:50 area, "The command
   runs with a clean environment...") states that a run made with `--sessions <n>` also exports
   `AKROGON_SESSIONS=<n>` and `AKROGON_SESSION_MINUTES=<m>` to the command (pointing at the
   `--sessions` reference if the page names it, else `commands.md`'s entry).
3. `docs/reference/files.md`: one line each for `~/.akrogon/budget.jsonl` (the paid-session
   reservation ledger, one `{at, repo, slug, run, sessions}` row per reservation, kept whatever
   the outcome) and `~/.akrogon/budget.lock` (the exclusive lock the reservation takes) in the
   state-files table, sourced `src/run-check.ts`/`src/state-home.ts`.
4. `docs/use/autopilot.md`: the needs-sheet description (:21) drops paid-launch grant approvals
   from the list (paid launches are standing under `paid_budget`); the waits list (:37) keeps
   live-account grants, fixture retention, secret-save, and adds that a refused `paid_budget`
   reservation waits on its needs row.
5. `docs/use/plan-work.md`: the needs-sheet sentence (:32) drops per-launch approvals the same
   way.
6. `docs/use/watch-while-away.md`: the stop list (:30) stays accurate — a stop for "a
   credential, login, grant or permission" still covers live changes and out-of-scope paid
   launches; adjust wording only if it implies per-launch paid approval.
7. `docs/use/quick-fix.md` (:17): the live-account grant clause stays; add nothing unless the
   sentence implies paid-launch approval is asked per leaf.
8. No page keeps a count-line, renewal, warn-past-bound, or per-launch paid approval rule.

## 3. Read-first list

- `docs/reference/limits.md` lines 20-30; `docs/reference/checks.md` lines 44-56;
  `docs/reference/files.md` (state-file tables, ~40-60 and the akrogon-home table if present).
- `docs/use/autopilot.md` lines 19-40; `docs/use/plan-work.md` lines 28-36;
  `docs/use/watch-while-away.md` lines 28-33; `docs/use/quick-fix.md` lines 14-20.
- `docs/reference/commands.md` line 51 — the `--sessions` contract already documented
  (reference, do not edit).
- `docs/reference/config.md` line 33 — the `paid_budget` key doc (reference, do not edit).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Apply the §2 wording in the docs' own terse style — one sentence where the old text claimed a
per-launch approval; a doc line is changed only because a rule it states changed. Keep the
pages' existing structure and heading sets.

Chunks that must land first: wave 1 (U1-U3) — cite `## Grant reuse and paid sessions` in
`skills/lifecycle-rules.md` and `paid_budget`/`--sessions` as landed mechanics; do not wait for
review of wording, the decisions are locked. Owned paths: the seven docs files. No shared test
resource. Creation commit: filled by A.

## 5. Do-not, reasons and exceptions

- Do not edit `docs/reference/commands.md`, `docs/reference/config.md`, or any skills file —
  out of scope.
- Do not add new doc structure or reword paragraphs unaffected by the rule change — the
  criterion bans leftover removed-rule terms, not style.
- `docs/use/watch-while-away.md` and `quick-fix.md` may need zero edits; if so say so in the
  report — verifying no stale claim is itself the work.
- Return a mismatch with evidence if a named paragraph is absent or already rewritten; the
  exception is a revised brief from A.
- Standing exclusions: never `git stash`; commit WIP then `git reset --soft <creation commit>`
  and make the unit's one returned commit. Restated: one commit, up to seven files, no stash,
  no test edits.

## 6. Ordered steps

1. Read the cited lines; list which actually state a changed rule. (AC8)
2. Edit limits.md, checks.md, files.md. (AC1-3)
3. Edit autopilot.md, plan-work.md; verify watch-while-away.md and quick-fix.md. (AC4-7)
4. Run §7; commit once.

Advisory size: 7 files, under 28 turns.

## 7. Commands

```
akrogon run-check --name u4-links -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && bun test ./tests/docs-links.test.ts'
akrogon run-check --name u4-format -- sh -c 'bunx prettier --check docs'
```

Expected: `seat texts` fails `Expected: 5, Received: 4` if the wave-1 link commit has not
landed in your worktree — that is planned, not your scope. Everything else green.

## 8. Done-when, evidence and report

Done when AC1-8 hold and the commit exists. Cite `check` lines. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
