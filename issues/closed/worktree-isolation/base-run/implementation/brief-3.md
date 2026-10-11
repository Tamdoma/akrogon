# Brief 3: skill prose — hand-made base checkouts become `akrogon base-run`

## 1. Goal

Plan D8. Three skills still tell seats to build a base checkout by hand (`mktemp -d` + `git worktree add --detach` + `git worktree remove`). Replace only that mechanics clause with the verb; keep every judgment sentence. Prose-only change.

## 2. Acceptance criteria

1. `tests/base-run.test.ts` test "no skill text instructs a seat to create a base checkout by hand" passes: each of `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md` contains `akrogon base-run --base` and none contains `base_worktree=$(mktemp -d)`, `git worktree add --detach "$base_worktree"`, or `git worktree remove --force "$base_worktree"`.
2. Surrounding judgment text (red-on-base endings, incomplete-run handling, log evidence) is unchanged — only the checkout mechanics clause is rewritten.
3. `skills/implement-issue/worker-protocol.md` is untouched (its `git worktree add --detach` is the worker worktree, not a base checkout).

## 3. Read-first

- `skills/check-issue/SKILL.md` ~:65 — the check.review paragraph starting "During check.review, a red test or check".
- `skills/implement-issue/SKILL.md` ~:38 — the Shared-context paragraph starting "During implement end and check.fix".
- `skills/merge-issue/SKILL.md` — the Shared-endings sentence "On red checks, judge the base first" (~:69).
- `tests/base-run.test.ts` last test for the exact forbidden strings.
- `skills/implement-issue/ponytail.md`.

## 4. Change list

Owns: the three SKILL.md files. Wave 3, parallel with brief 4 (disjoint paths). Reference wording for the replacement (adapt minimally to each sentence's grammar, do not restructure the paragraph):

- check-issue :65 and implement-issue :38: replace the clause `allocated with ` + backtick + `base_worktree=$(mktemp -d)` ... through `then ` + backtick + `git worktree remove --force "$base_worktree"` + backtick + ` before any outcome` with the single-run form: `... scope, as one ` + backtick + `akrogon base-run --base "$AKROGON_BASE" -- <command> <args>` + backtick + ` run from the leaf worktree (add --cwd <rel> when the corresponding directory is not the caller's own relative cwd); the verb allocates the detached base checkout in the store, runs setup and the command under the constructed check env, logs into the leaf's implementation folder and prints the log path and exit status before removing the checkout; the seat keeps each run's own exit status and terminal result before any reporting pipeline such as ` + backtick + `echo` + backtick + `, ` + backtick + `grep` + backtick + ` or ` + backtick + `head` + backtick + ` and captures both log paths and failing names and tails from both runs`. The phrase "the base-run rule" used by merge-issue keeps working.
- merge-issue :69: in "reruns that same command once, same args and scope, in a detached worktree at `AKROGON_BASE` under the base-run rule from check-issue", change to "... under the base-run rule from check-issue, run as one `akrogon base-run --base "$AKROGON_BASE" --attempt <id> -- <command> <args>` call".

## 5. Do-not

- Do not edit tests, src files, or other skills.
- Do not change verdict endings, failed-stop wording, or any non-mechanics sentence.
- Do not reformat or reflow untouched sentences.
- A test expectation that looks wrong is a mismatch to A, never a test edit.
Restated: prose-only, mechanics-clause-only, three files; anything else returns as a mismatch.

## 6. Ordered steps

1. Read the three paragraphs and the test.
2. Edit check-issue, implement-issue, merge-issue.
3. Run section 7. Commit with a `docs:` or `refactor:`-style message consistent with repo history.

Advisory size: 3 files, under 10 turns.

## 7. Commands

```sh
bun test tests/base-run.test.ts --timeout=30000 -t "no skill text"
bun run typecheck
```

## 8. Done-when, evidence and report

The skill-text test is green; grep of the three files shows the verb and none of the forbidden strings; commit on the detached HEAD.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
