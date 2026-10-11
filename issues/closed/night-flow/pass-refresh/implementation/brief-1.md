# Brief 1: implement-issue SKILL.md shared refresh rule

## 1. Goal

Add the named Shared context refresh rule and its call sites in `skills/implement-issue/SKILL.md` so A's `implement` and `check.fix` passes refresh the leaf branch onto current main at start and before final proof (plan D1, D2, D3).

## 2. Numbered acceptance criteria

1. Shared context contains one paragraph stating verbatim `A refreshes the leaf branch onto current main: it fetches the configured remote, rebases the leaf branch onto the current `<remote>/<default_branch>` and refreshes `AKROGON_BASE` from `akrogon config`.` plus its sub-rules.
2. `## implement` runs the Shared context refresh before the `Before coding` step (one leading sentence).
3. `## check.fix` runs the Shared context refresh before `Read the recorded findings` (one leading sentence).
4. In the paragraph holding `passing proof for every done-criterion` in both `## implement` and `## check.fix`, the word `commit` appears before `refresh`, which appears before `passing proof` (commit → refresh → proof order).
5. The `A repair requested from merge` paragraph keeps `replays the recorded commands`, `green replay`, `base-run rule`, `verbatim`, `the rejected run`, `check.review`, and `refresh`, and contains none of `fetches the configured remote`, `rebases onto`, `rebases the repaired head`.
6. `fetches the configured remote` appears only in the Shared context refresh paragraph, not in `## implement` or `## check.fix`.

Proof: `bun test tests/skill-refresh.test.ts` — the failing tests under `shared refresh rule in implement-issue` (all 5) and `merge-origin check.fix` (test `uses the shared refresh...`) go green; every other currently-passing test stays green.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` — the edit target. Shared context ends around `:48`; `:38` is the comparison paragraph, `:40` Proof order; `## implement` `:53-70`; `## check.fix` `:72-84`.
- `skills/merge-issue/SKILL.md:53` — the solo conflict rule named for wording ("keeping both true sides").
- `tests/skill-refresh.test.ts` — the red test pinning the vocabulary; read it before editing.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/implement-issue/SKILL.md` only. Nothing must land first; no shared test resource.

Edits:

a. Insert one new paragraph in `## Shared context` after the comparison paragraph (`:38`, ends `...no base-defect claim.`) and before `Proof order applies` (`:40`). Contents: the named rule from criterion 1, then these sub-rules, each stated once:
   - before every refresh A commits outstanding scoped work, never stashing or discarding it;
   - conflicts resolve inside the rebase keeping both true sides under the merge-issue solo rule; when resolution needs a plan correction A makes it under the `check.fix` plan-correction rule and resolves by it; `plan.md` lives in the registered checkout so the rebase stays in progress meanwhile; such a conflict never ends the pass `failed`;
   - a fetch failure or another refresh error with no conflict to resolve is recorded with its original error in `implementation/report.md`; A aborts a rebase only if one is in progress and the pass ends with no phase move; the re-prompted pass resumes at the refresh instead of redoing committed work and compares any red check again; A never proceeds on an old tip;
   - a comparison record holds only for the head and pass it was written in; after a refresh or a later commit a red check is rerun and compared on the new head, never carried over;
   - `implementation/report.md` records each refresh that moves the branch with prior and new base and prior and new head; a report handed off from `check.fix` also records the prior reviewed base and head and the handed-off base and head.

b. `## implement` first line: add one leading sentence before `Before coding`, e.g. `Run the Shared context refresh before the first unit.` (wording yours as long as `refresh` precedes `Before coding` and no fetch/rebase vocabulary is restated).

c. `## check.fix` first line `:74`: same — one leading sentence running the Shared context refresh before `Read the recorded findings`. The current exception `except in a repair requested from merge, which refreshes its base first as below` becomes redundant; the merge-origin case refreshes through the same shared rule. Drop it or fold it, keeping the paragraph meaning.

d. `:63` (handoff paragraph): resequence so commit → refresh → proof: move `commit any remaining edits` before the refresh+proof so `commit` precedes `refresh` precedes `passing proof`. Keep the merge_checks clause, the replay exception, the `akrogon phase` refusal, dirty-worktree and `issues/` rules, report contents, `Test-Change` trailer paragraph (`:64`), wall-time and slow-run sentences (`:65-66`) unchanged.

e. `:84` (check.fix close): same resequence — `commit` before `refresh` before `passing proof`. Keep trailer, merge_checks, replay exception, docs/index update, report append, finish line.

f. `:78` (merge-origin paragraph): replace both fetch/rebase spans with invocations of the Shared context refresh. Target shape: `A repair requested from merge starts at the rebased head recorded in `review-B.md` and treats the failing output as the finding. Before judging the failure, the pass runs the Shared context refresh and replays the recorded commands; a green replay needs no repair and goes on to the record below, and only a red replay takes the base-run rule, against the refreshed base. After the repair commits, the pass runs the Shared context refresh again, then their normal proof (done-criteria proof, changed tests, `checks`) and replays every exact command the red ending recorded verbatim, same command, arguments and scope, in the leaf worktree.` Keep verbatim: the `implementation/report.md` replay-evidence record sentence, `A red rerun takes the same repair path again inside this pass and the replay repeats`, and `a red rerun is never handed to `check.review`, which only a green replay reaches`. The words `fetches the configured remote`, `rebases onto`, `rebases the repaired head` must not survive anywhere in this paragraph.

## 5. Do-not, reasons and exceptions

- Do not edit any other file: other skills, docs, tests and src are owned by sibling units or out of scope; concurrent workers will collide. Exception: none — return a mismatch instead.
- Do not touch `tests/skill-refresh.test.ts`: planned tests are A's; a wrong or persistently red test returns a mismatch. Exception: revised brief from A.
- Do not restate `fetches the configured remote`/`rebases...` in `## implement`, `## check.fix` or the merge-origin paragraph: the rule is stated once in Shared context; duplication is the defect this leaf fixes. Exception: none.
- Do not weaken or drop the replay, green-replay, base-run, replay-evidence, red-rerun or Test-Change rules: they are unchanged behavior moved under the shared rule. Exception: none.
- Do not restate the locked-decision stop or add a general resume rule: design limits the resume sentence to a pass re-prompted after a refresh error. Exception: none.
- Do not reorder, delete or rename headings or other paragraphs: minimal diff. Exception: none.

Reasons restated: single-source wording, minimal diff, no scope growth, planned tests stay A's. Exceptions restated: only a revised brief from A.

## 6. Ordered steps

1. Read `tests/skill-refresh.test.ts` and the target file; note every anchor (criteria 1-6).
2. Edit Shared context: insert the rule paragraph (step a).
3. Edit `## implement` opening, `## check.fix` opening, `:63`, `:84` (steps b-e).
4. Rewrite `:78` (step f).
5. `cd` to the worktree, `bun install --frozen-lockfile` (already-installed deps may be absent in the worktree), run `bun test tests/skill-refresh.test.ts`; iterate until the five `shared refresh rule` tests and both `merge-origin check.fix` tests pass.
6. Commit only `skills/implement-issue/SKILL.md` with a message like `skills: shared pass refresh rule for implement and check.fix`; return the commit id.

Advisory size: 1 file, under 12 turns.

## 7. Commands

`bun test tests/skill-refresh.test.ts` from the worktree after `bun install --frozen-lockfile`. AKROGON_BASE=22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192 (not needed by this file-based test).

## 8. Done-when, evidence and report

Done when criteria 1-6 hold and the named tests pass while no previously-green test regresses in this file. Commit the file; paste the commit id and the bun test summary.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
