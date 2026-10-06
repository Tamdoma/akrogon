# Brief 5: merge-issue skill and docs for command-owned batching (plan U4, wave 3)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u5

## 1. Goal

Update `skills/merge-issue/SKILL.md`, `README.md` and the affected guide pages so the text matches the shipped batch behavior (plan D11 + the `git show 7f6c051 41cab48` diffs you can read in the worktree). Seats never push; the command builds the stack, checks the top once, pushes, moves members, restacks and reconciles.

## 2. Acceptance criteria

1. `skills/merge-issue/SKILL.md` describes the actual prompt forms: `merge-issue <slug> slot=B phase=merge leaf=<folder> attempt=<id> top=<sha>` (applied stack, holder on top) or `attempt=<id> solo` (B rebases itself, e.g. holder conflict or solo-marked holder). Every batch call carries `--attempt <id>`; stale ids are refused by the command. For `top=<sha>`: the worktree is already at the applied top — B commits nothing, does not fetch/rebase, runs every `checks` then `merge_checks` once on `HEAD` with `AKROGON_BASE` refreshed from `akrogon config`, then `akrogon phase <slug> merged --slot B --check --attempt <id>`, then gathers the completion owners' briefs (every brief under the issue/epic the batch can close — the batch may complete more than the holder's own issue) and calls `akrogon phase <slug> merged --slot B --attempt <id>`. B never runs `git push`. `fresh checks required <sha>` means the push was refused, the stack was restacked to `<sha>` and B reruns checks, `--check`, `merged`. `batch dissolved, merge solo` ends the pass; a fresh prompt follows. Red checks call `akrogon phase <slug> check.fix --slot B --attempt <id>`. For `solo`: B fetches, rebases its worktree onto `<remote>/<default_branch>` resolving conflicts as today, runs checks, `--check --attempt`, briefs, `merged --attempt` — still no `git push`. One completion line per completed standalone issue or whole epic triggers one broadcast-issue run, exactly as today.
2. `README.md` phase row mentions `--attempt <id>` for merge batch calls (one clause, the existing table row, no new column).
3. `docs/guide/merge.md`: batching — waiting leaves keep their tab/panes and land with the holder after one check run; member conflicts drop solo; red dissolves to solo; refused push restacks; failed-holder reconcile (fetch → ancestry → members finish; or restore, record cleared, no solo marks; failed fetch reports only); member tabs close when the holder finishes; `fresh checks required` and `batch dissolved, merge solo` lines explained. The `solo`/waiting-leaf paragraphs are updated, not duplicated — remove text the batch behavior contradicts (e.g. "If another leaf lands first, B fetches, rebases and checks again" → that is now the command's restack).
4. `docs/guide/phases.md`: merge row gains "the command carries waiting leaves in one stack; seats never push" in one line; the diagram stays if accurate (check it).
5. `docs/guide/state.md`: document `batch` (holder record: `attempt`, `built_on`, `members[].slug/base/head/tip`, `top`, `tested_top`, `candidate`, `applied`, `solo`) and leaf `solo` in the state-key section, one short block each.
6. `docs/guide/next.md`: one or two sentences — the merge pass writes the batch record, builds and applies the stack outside the global lock, prompts only the holder.
7. `tests/command-reference.test.ts` and `tests/docs-links.test.ts` stay green (update fixtures only if the README table change requires it; docs-links if an anchor changed).
8. No claim the code does not keep: verify every printed string you document against `src/phase.ts`/`src/next.ts` output (`fresh checks required <sha>`, `batch dissolved, merge solo`, `issue complete`, `epic complete`, the merge prompt shape in `dispatchSlot`).

## 3. Read-first list

- `skills/merge-issue/SKILL.md` (rewrite target), `docs/guide/merge.md`, `docs/guide/phases.md`, `docs/guide/state.md`, `docs/guide/next.md`, `README.md` command table.
- Source of truth: `src/phase.ts` batchCheck/batchPush/restack/dissolve output strings; `src/next.ts` `mergePass`, `dispatchSlot` prompt construction, `mergeNotice`, `closeMergedTab`/`cleanupMerged` member skip; `src/batch.ts` semantics; `src/turn.ts` queue.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owned: `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/merge.md`, `docs/guide/phases.md`, `docs/guide/state.md`, `docs/guide/next.md`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts` (only if a change requires). Not owned: anything under `src/`, other test files, other skills — mismatch if needed.

Style: match existing guide voice (second person, CSV-export example in merge.md stays where still accurate). Guide sections document behavior, not internals: `docs/guide/state.md` may name state keys because it already does; merge.md describes what B observes and does.

## 5. Do-not

- Do not document mechanisms that do not exist: no merge_checks-per-member, no member prompts, no `git push` by B in any batch path, no clocks/timeouts for hangs (operator judges `akrogon status`), no broadcast per inner issue of an unfinished epic.
- Keep the existing operator-recovery text (move back to `merge` finishes by ancestry without a run).
- `Test-Change:` trailer on any commit touching `tests/command-reference.test.ts`/`docs-links.test.ts`; README/docs/skill commits need none.
- Return a mismatch with evidence instead of documenting behavior the code does not have.

## 6. Ordered steps

Advisory: 5-7 files, under 30 turns.

1. Read the source files; diff `git show` is allowed reading.
2. Rewrite `skills/merge-issue/SKILL.md` merge section; keep the file's frontmatter, shared context and footer blocks, updating only what the protocol changed (prompt text, attempt flag, no push, fresh-checks/dissolve handling, solo path, briefs before `merged`).
3. Update README row, merge.md, phases.md, state.md, next.md.
4. `AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed=$AKROGON_BASE --timeout=30000`.

## 7. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

(Run `bun install` in the worker worktree first.)

## 8. Done-when, evidence and report

Green changed-tests run; the skill and docs match the shipped output strings. Commit on the worker HEAD, return commit id(s).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
