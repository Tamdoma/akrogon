# Plan: fresh-test-proof

Text-only leaf. Debate off (`debate: "no"`): planned directly from brief and design.
Locked design: proof-owner 1a (skill steps only, no command code) and proof-rule 1a
(reviewer-only freshness rule, no run count, no rerun campaign, no check-schedule change).

## Decisions

- D1. The freshness rule replaces the phrase `reuse unchanged evidence` at
  `skills/implement-issue/SKILL.md:65` (implement proof step) and `:86` (check.fix proof
  step): earlier evidence for a test is reused only when it ran after the latest change
  to that test and to every helper or fixture it uses, where a helper or fixture is a
  file the test imports or reads that is not the product under test.
- D2. In the same `:65` paragraph the report-contents clause gains, for each proof
  result: the command, the commit it ran on and the result (extends the existing
  "base and committed head" record, not a new artifact).
- D3. `skills/check-issue/SKILL.md:55` (B checks the report ran the planned tests)
  gains: B rejects proof for an added or changed test that ran before the latest change
  to that test or a helper or fixture it uses, and asks for the missing current run,
  with the brief's example (green file runs before a new case existed do not prove it).
- D4. `docs/guide/phases.md:94` (implementation paragraph) describes the rule in
  guide voice without restating it in full; the review paragraph (~:104) describes B's
  rejection of stale proof. One rule per place: reuse rule and report fields live in
  implement-issue, rejection in check-issue.
- D5. No new test: the standing design states this leaf changes text only and bars
  tests asserting skill/guide prose. No run count, rerun count, new phase step,
  command code, or change to `checks`/`merge_checks` scheduling, the rejected-command
  replay, the unattributed-red retry or `Test-Change:` trailer rules.
- D6. plan-issue is not edited: the planner side of proof-owner 1a already exists via
  `skills/plan-issue/SKILL.md`'s criterion-to-proof mapping and implement-issue :59's
  bug-reproduction report link (design, "Leaf architecture").

## Read-first

- `skills/implement-issue/SKILL.md` — proof steps at :65 and :86, report contents clause.
- `skills/check-issue/SKILL.md` — report-check paragraph at :55.
- `docs/guide/phases.md` — implementation paragraph :94 and review paragraph :104.
- `docs/reference-index.md` — doc map.
- `learnings/LESSONS.md` — lessons; two relevant mechanisms below.
- `/home/ivan/Work/infra/tamdoma/framework/issues/closed/merge-flow/probe-waits/review-B.md`
  :143,:162-173 — the #86 case this rule fixes (evidence only if cited).

Lessons applied: 2026-09-11 lock-vs-criterion (wording stays inside owned text, no
criterion-colliding verbatim), 2026-09-11 stale-rule-in-docs and
2026-09-14 ambiguous-prose-after-rename (swept repo markdown for `unchanged
evidence`/`earlier evidence`/`stale` — hits only at the owned lines plus
`skills/AREA.md:24`, which summarizes evidence order without the freshness term and
does not need the rule restated; report it if a worker disagrees).

## Interfaces needed

None. No code, env, credentials or live resources. `akrogon status` shows no
`Missing:` lines; `env_names` is empty.

## Units and waves

Implement config is `subagents`; one wave of three disjoint-path units.

### Wave 1

- U1 `skills/implement-issue/SKILL.md` — apply D1 at both proof steps and D2 in the
  report clause. Owns only that file. No prerequisite.
- U2 `skills/check-issue/SKILL.md` — apply D3 at :55. Owns only that file.
  No prerequisite.
- U3 `docs/guide/phases.md` — apply D4 in both paragraphs. Owns only that file.
  No prerequisite.

No shared test resource; units hold disjoint paths.

### Docs affected

- `skills/implement-issue/SKILL.md` (agent doc) — rule + report fields.
- `skills/check-issue/SKILL.md` (agent doc) — rejection rule.
- `docs/guide/phases.md` (human doc) — rule description in both paragraphs.
- `skills/AREA.md` — checked, no change needed (summarizes order, not freshness).
- `docs/guide/merge.md` — checked, no change needed (describes rejected-command
  replay, which stays).

## Done-criteria proof map

| # | Criterion | Proof command | Failure caught | Size | Rerun trigger |
|---|-----------|---------------|----------------|------|---------------|
| 1 | Freshness rule in both implement and check.fix proof steps | `grep -n "latest change" skills/implement-issue/SKILL.md` plus `akrogon run-check --name 'format' -- sh -c 'bun run format'` (from config `checks.format`) | Edit missed or garbled a proof step; prettier drift | seconds | rerun when U1's file changes |
| 2 | Report records command, commit it ran on, result per proof | `grep -n "commit it ran on" skills/implement-issue/SKILL.md` | Report clause missing the commit field | seconds | rerun when U1's file changes |
| 3 | B rejects pre-latest-change proof and asks for current run | `grep -n "ran before the latest change" skills/check-issue/SKILL.md` | Rejection rule absent from B's check | seconds | rerun when U2's file changes |
| 4 | phases.md describes the rule in implementation and review paragraphs | `grep -n "latest change" docs/guide/phases.md` returning hits in both paragraphs | Guide missing or one-sided description | seconds | rerun when U3's file changes |
| 5 | No code, run count, phase step or scheduling change | `git diff --name-only "$AKROGON_BASE"..HEAD` lists only the three owned files, plus all `checks` commands pass (`format`, `test`, `typecheck`, `test_changed` per config) | Scope creep or a broken build/test | minutes (bun test) | rerun on any branch change |

Planned-test reds at planning time (recorded on base `fe7d558`):

- `grep -n "latest change" skills/implement-issue/SKILL.md` → exit 1 (C1).
- `grep -n "commit it ran on" skills/implement-issue/SKILL.md` → exit 1 (C2).
- `grep -n "ran before the latest change" skills/check-issue/SKILL.md` → exit 1 (C3).
- `grep -n "latest change" docs/guide/phases.md` → exit 1 (C4).

These greps are the plan's intended-red proofs: they fail on base because the rule
does not exist yet and pass only when the edits land. No test files are added, so no
`Test-Change:` trailer applies. No slow run; no restart boundaries needed.
