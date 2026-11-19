# Plan: installed-step-transfer

Slot A plan.synthesis, 2026-11-17. Serial-solo: the leaf is one coherent prose change across three owned surfaces plus one test case; splitting it buys nothing, so one unit.

## Read-first

- `skills/lesson-rule.md` — Transfer bullet (owned, single source the five `skills/<skill>/lesson-rule.md` symlinks serve).
- `skills/learn-issues/SKILL.md` — `## Sort` Transfer bullet, `## Apply` Transfer bullet, `## Printed footer` (owned).
- `docs/use/learn-from-work.md` — the "sorts the line into one outcome" Transfer bullet (owned).
- `tests/docs-links.test.ts` — existing link checker; gains the criterion-2 symlink-mode case (committed at planning).
- `src/release.ts`, `src/config.ts` — the design's classification correction: releases live under `globalHome()/releases`, `current` may point at an akrogon checkout (`toolRoot`), `AKROGON_HOME` overrides `~/.akrogon`.
- `/home/ivan/.akrogon/releases/39e203a79c5c4ebeef51d1e76a3d8ea43389debc/skills/chart-issues/assets/standing-design.md` — the installed standing-design text installed-step lessons cite.
- `/home/ivan/Work/infra/tamdoma/framework/learnings/LESSONS.md` and the ten named `learnings/history/` files — criterion 1's cases.
- `learnings/LESSONS.md` (this repo) — lesson-rule consumers; no lines change here.

## Decisions

- **D1.** `skills/lesson-rule.md` Transfer bullet becomes: a judgment lesson moves to a live review step reached for its case, only through the root `/learn-issues` pass; the step's file is classified by `realpath`, where inside the consumer's registered repo the diff adds the lesson to the step, removes the line and appends `Transferred <YYYY-MM-DD> to <file:line>, approved by <who>` to its history file, and outside it the step is an installed akrogon step — a plan-issue or check-issue step, or a standing-design line those apply, reached on the leaf path where the case happened — where the pass adds nothing at the step, and when the installed step already states the lesson's rule the diff deletes the line and appends `Transferred <YYYY-MM-DD> to <installed akrogon file> § <section> "<line's opening words>" at <citation>, approved by <who>` where `<citation>` is `release <sha>` when the file resolves under `<akrogon home>/releases/<sha>/` (akrogon home is `$AKROGON_HOME`, else `~/.akrogon`) else `HEAD <sha>` of that akrogon checkout, and when the installed step contradicts or only partly covers the lesson the same uncommitted diff proposes a rewrite of the line with `<YYYY-MM-DD>: rewritten against <installed citation>, approved by <who>: <reason>` appended to its history file, the rewritten line counted as "stay" in the footer; a kept lesson that recommends a script check on model output with no named one-right-answer source is such a contradiction. Operator approval of the diff completes a transfer or a rewrite; a decline reverts. A transfer is never recorded as `Applied`. A leaf never transfers, a checkable lesson never transfers, and a lesson whose step is not reached for its case stays.

  Brief/design note (recorded for review): the brief's history template literally reads `at release <sha>`, but its own B,C clause cites the non-release case with the checkout's git HEAD. D1's `<citation>` spells both forms so the template never prints "release" for a HEAD sha; the implementer keeps the brief's `at release <sha>` string verbatim for the release case.
- **D2.** `skills/learn-issues/SKILL.md` `## Sort` Transfer bullet becomes: a judgment lesson whose case is reached by a live review step in this repo, or by an installed akrogon step — a plan-issue or check-issue step, or a standing-design line those apply, reached on the leaf path where the case happened — with the installed step's file named and its covering sentence quoted in the sort output; a judgment lesson whose step is not reached stays and names the repo or install where its step would live.
- **D3.** `skills/learn-issues/SKILL.md` `## Apply` Transfer bullet becomes: `realpath` the step's file; inside the registered repo, add the lesson as one instruction at that step, delete the line and append `Transferred <YYYY-MM-DD> to <file:line>, approved by <who>` to its history file; outside it, nothing is added at the installed step — when it already states the lesson's rule, delete the line and append the D1 `Transferred` line with the installed `§` citation, and when it contradicts or only partly covers the lesson, propose the rewritten line in the same diff and append `<YYYY-MM-DD>: rewritten against <installed citation>, approved by <who>: <reason>` to its history file; every history append leaves the case untouched and `<who>` is the registered checkout's `git config user.name`; approval of the diff completes a transfer or a rewrite and a decline reverts it.
- **D4.** `docs/use/learn-from-work.md` Transfer bullet becomes: a judgment lesson a live review step in this repo reaches, or a judgment lesson an installed akrogon step — a plan-issue or check-issue step, or a standing-design line those apply — covers, where the installed step gets no added text; its line is deleted with the installed file cited in history, and a lesson it contradicts or only partly covers is rewritten instead, which counts as a stay.
- **D5.** Citation style. `AKROGON_HOME` is written as `$AKROGON_HOME`/env name, not a link. `standing-design.md` is named as plain text in `skills/learn-issues/SKILL.md` (never a `../chart-issues/...` link): the docs-links bound confines a `SKILL.md`'s relative links to its own skill folder. `docs/use/learn-from-work.md` may name it the same way for symmetry.
- **D6.** Criterion-1 candidate mapping (the sorting model's reading, verified at implementation, judged by the reviewing seat — no script check decides it):
  - `2026-09-30-resolver-guidance-prose-tests`, `2026-09-30-offer-analytics-guide-checks`, `2026-10-01-discovery-prose-assertions`, `2026-10-03-prefix-regex-does-not-prove-meaning`, `2026-10-05-analytics-guard-proof`, `2026-10-08-residue-triage-prose-proof-layout` — review-B Nits about exact-prose assertions on model/agent output. Candidate step: the standing-design line beginning "A script decides only what has one right answer" in `skills/chart-issues/assets/standing-design.md` (release `39e203a...` citation); its "text that runs literally" clause and "a proxy for a model's choice" wording state each lesson's rule → transfer candidates; a lesson whose line carries a rule the installed text only partly covers (e.g. residue-triage's "one real recording does not establish a presentation contract", analytics-guard's outcome-probe requirement) is a rewrite candidate.
  - `2026-10-17-noop-step-commit-proof` — judge completion against the operation's permitted outcomes. Candidate step: plan-issue's proof-command correction rule (wrong proof command replaced by one that observes the same result) in `skills/plan-issue/SKILL.md`, or keep with a stated reason if the sorting model finds no sentence states it.
  - `2026-09-12-injector-and-routes` — name each criterion-enumerated item verbatim in the record. Candidate keep-with-reason unless the sorting model quotes a covering sentence in an installed step.
  - `2026-10-29-cross-site-repeat-fix-layer` — deterministic floor vs model judge layer choice; framework machinery, no reachable akrogon step → keep with stated reason.
  - `2026-10-16-stash-shared-across-worker-worktrees` — checkable (a fixed `git stash` pattern in worker briefs); never transfers, unchanged.
- **D7.** Proof commands: criterion 2 adds one case to `tests/docs-links.test.ts` (done at planning, below). Criterion 3 is proven by the existing `test` check (`docs-links.test.ts` resolves all links in README, `docs/` and every tracked `skills/*.md`). Criterion 4 is report text judged by the reviewing seat. No `merge_checks` or whole-suite requirement added; the brief names the `test` check only.

## Needed interfaces

None. Prose only; the five `skills/<skill>/lesson-rule.md` files stay tracked symlinks.

## Wave 1 (serial-solo, single unit — implement A does it, no workers)

**U1 — prose and consistency.** Owns `skills/lesson-rule.md`, `skills/learn-issues/SKILL.md`, `docs/use/learn-from-work.md`. Applies D1–D5; verifies each surface states the same Transfer (same-repo add-at-step unchanged; installed step adds nothing, deletes line with `§` history citation, or proposes rewrite counted as stay); confirms the Sort order, "a checkable lesson never transfers", Retire and the printed footer are untouched.

Doc checklist (one line each):
- `skills/lesson-rule.md` — Transfer bullet rewritten per D1.
- `skills/learn-issues/SKILL.md` — Sort Transfer bullet per D2; Apply Transfer bullet per D3; footer unchanged.
- `docs/use/learn-from-work.md` — Transfer bullet per D4.
- `docs/reference/skills.md` — the `/learn-issues` result line already says "transfers are prepared for your approval"; still true (installed transfers are also prepared for approval); no edit required.
- `tests/AREA.md` — the `docs-links.test.ts` description already omits its non-link assertions (precedent); no edit required.
- Agent docs beyond the three owned files: none affected.

## Done-criterion proofs

**C1 — sort would offer each named framework case a Transfer or a rewrite with the installed step cited, or keep it with a stated reason (model-choice criterion).** No test, case or deliberate break holds an expected outcome for the sorting model's choice (standing-design model-choice line; design interpretation). What the reviewing seat reads: this plan's D6 mapping, `implementation/report.md`'s per-case walk naming the deciding sentence in the new text, and the changed files themselves. What stays unproven: the real framework `/learn-issues` sort — the framework lines leave only in a later pass with operator approval (Tamdoma/tamdoma-framework#650), which criterion 4 requires the report to state. Function checks that stay planned: changed files exist, the cited sentence the report names must actually appear in the changed file (reviewing seat reads), links resolve (C3).

**C2 — five skill-local lesson-rule.md files are git mode 120000, and the four surfaces state the same Transfer.** Symlink mode is mechanical: new test `lesson-rule files stay symlinks to the shared rule` in `tests/docs-links.test.ts` reads `git ls-files -s -- 'skills/*/lesson-rule.md'` (the index, where the mode lives) and asserts 5 rows all `120000`. Red shown at planning by `git update-index --cacheinfo 100644` on one entry, index restored in the same command:
- red: `check criterion2-symlink-red: 1 .../check-criterion2-symlink-red-1794955981054-1592422.log` — `Received: "100644 ... skills/plan-issue/lesson-rule.md"`, 1 fail.
- green: `check criterion2-3-docs-links: 0 .../check-criterion2-3-docs-links-1794955984999-1597959.log` — 13 pass, 0 fail.
The "same Transfer" half is prose consistency; the design's interpretation names symlink mode and links as the only mechanical checks, so wording sameness is the reviewing seat's read of the three files, not a script assertion (a phrase-presence check would be the exact-prose coupling this leaf retires). Proof command: `akrogon run-check --name criterion2-3-docs-links -- bun test tests/docs-links.test.ts`; size: seconds; rerun trigger: any edit to the three prose files or the index.

**C3 — links in the changed files resolve on the leaf head.** Existing `docs-links.test.ts` first test under the configured `test` check; D5's no-out-of-folder-link rule is what keeps it green. Proof command: `akrogon run-check --name criterion2-3-docs-links -- bun test tests/docs-links.test.ts` (same run as C2) plus the configured `test` check at implement end; size: seconds.

**C4 — report states the three limits.** Report text, judged by the reviewing seat: framework lines leave only in a later framework `/learn-issues` pass with operator approval (Tamdoma/tamdoma-framework#650); naming a one-right-answer source in kept lessons' histories stays framework work (design Q5 5b); an orphaned transfer after a later akrogon edit goes undetected (accepted cost). No mechanical proof; the reviewing seat reads `implementation/report.md`.

## Condition check (done-criterion conditions the decisions could break)

- C2's "still symlinks on the leaf head": D1 edits `skills/lesson-rule.md` content only and never touches the five symlinks; the new test's red run above is the deliberate-break evidence. Recorded beside C2.
- C3's "links resolve": D5 names rather than links `standing-design.md` inside `SKILL.md` because the folder bound would report `../chart-issues/...` as broken; `AKROGON_HOME` written as an env name is not a link. The green docs-links run above is on the unchanged tree; implement end reruns it on the leaf head.
- "checkable never transfers / Sort order / Retire unchanged": D1–D4 touch only the Transfer bullets; U1's checklist verifies those clauses and the footer text are byte-untouched.
- Footer count semantics: D1/D3 define the rewrite as "stay" so the footer's `<n> stay` needs no wording change; no condition a decision can violate remains reachable.

## Environment / credentials

Design names no credential variables. `akrogon status` shows no `Missing:` lines for this leaf. No paid or live operations.

## Implementation notes

- 2026-11-18 (check.fix, B F1): D6's `2026-10-03-prefix-regex-does-not-prove-meaning` reading corrected from transfer candidate to rewrite candidate. The history's final instruction — seed a break of the claimed meaning plus a harmless wording change — is a deliberate break holding an expected value over prose meaning, which the installed standing-design model-choice line forbids; that makes the lesson contradicted, not fully carried. The report's case walk carries the redone reading and reason; the criterion-1 outcome the sort would offer stays inside D6's enumerated options.
