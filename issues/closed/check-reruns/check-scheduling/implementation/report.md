# Implementation report: check-scheduling

Base: `9ea5dd0ae720970b37e0175d7b109c913d29a242`
Head: `af8d3639047a5ee0ddf0bba9019248744639cc9a` (3 wave commits, no extra lane commit, worktree clean)
Mode: delegated, one wave of 3 independent units (disjoint paths), cherry-picked serially.

## Changed files and reasons

- `skills/implement-issue/SKILL.md` (U1, worker `a81edbde` → lane `67b8ccf`): implement-end and `check.fix` state the Q2 2a obligation (criterion proof, changed tests with affected consumers, every `checks` command, unchanged evidence reused, `merge_checks` only at merge unless a criterion needs a whole run); line-52 repair-rerun clause deleted; :42 delegation and :34 red-sub-brief rewritten.
- `skills/implement-issue/worker-protocol.md` + `skills/implement-issue/brief-template.md` (U2, worker `a6eef752` → lane `a9b0cb4`): workers get only the changed-test command; A owns criterion proof plus every `checks` command; red proof becomes a repair sub-brief; `brief-template.md:39` kept.
- `skills/chart-issues/assets/shapes.md` + `skills/AREA.md` + `docs/guide/phases.md` + `docs/guide/merge.md` (U3, worker `8ce83bb0` → lane `af8d363`): chart audit refuses `merge_checks` / repo-health criteria and gates repo-wide `checks` on a named property; `added to checks first` sentence deleted; mirrors state `checks` before review and after repair, `checks` then `merge_checks` at merge.

No `src/`, `tests/`, or `issues/` changes. No new tests (D9 vanity-test ban).

## Done-criteria evidence

1. Full-suite grep (judgment below): `grep -rn "full suite\\|full-suite" skills docs/guide` returns only the two allowed hits. Proof: pasted output in this report. No test file proves prose; the grep plus diff read is the evidence.
2. 2a at implement end and `check.fix`, line-52 gone: `git --no-pager diff 9ea5dd0..HEAD -- skills/implement-issue/` read for all six 2a parts at both sites; `grep -F "a full-suite rerun follows a repair" skills/implement-issue/SKILL.md` exits 1 (gone).
3. Chart audit: `git --no-pager diff -- skills/chart-issues/assets/shapes.md` read for refusal plus named-property gate; `grep -F "gets it added to" skills/chart-issues/assets/shapes.md` exits 1 (gone).
4. Mirrors plus exclusions: `git --no-pager diff -- skills/AREA.md docs/guide/phases.md docs/guide/merge.md` read for the same schedule; `git --no-pager diff 9ea5dd0..HEAD -- skills/merge-issue/SKILL.md skills/check-issue/SKILL.md skills/init-akrogon/SKILL.md` empty (unchanged).
5. Blocking checks: `bun run format`, `bun test` (342 pass, 0 fail), `bun run typecheck`, `bun test tests/docs-links.test.ts tests/command-reference.test.ts` (7 pass) all green.

## Commands run with pasted results

`grep -rn "full suite\\|full-suite" skills docs/guide` (criterion 1, seconds):
```text
skills/implement-issue/brief-template.md:39:If the checkout has no changed-test runner, name the actual targeted check derived from its tools rather than substituting the full suite or inventing a command.
skills/init-akrogon/SKILL.md:20:Propose every repo key below, using inspected values or these defaults, including only real check commands and placing only deliberately nonblocking commands in `advisory` because every `checks` command blocks, and slow full-suite commands in `merge_checks`, which block only at merge:
```
Judgment: match 1 forbids substituting a full suite for targeted tests (correct, allowed by the brief); match 2 places slow full-suite commands in `merge_checks` (correct, allowed). Neither requires an undefined full suite or `merge_checks` after implement or a repair. No other matches exist.

`grep -rn "full suite\\|full-suite" docs/` → no matches, exit 1. `grep -rn "gets it added" docs/ skills/` → no matches, exit 1.

Lane changed tests after each pick (seconds each, all pass):
- after U1 pick: `--changed: 1 changed file, but no test files are affected`, 0 pass 0 fail.
- after U2 pick: `--changed: 3 changed files, but no test files are affected`, 0 pass 0 fail.
- after U3 pick: `--changed: 7 changed files, but no test files are affected`, 0 pass 0 fail.
- Command: `AKROGON_BASE=9ea5dd0ae720970b37e0175d7b109c913d29a242 bun test --changed="$AKROGON_BASE"`.

`bun run format` (seconds): all files unchanged, exit 0. Worktree stayed clean.
`bun test` (wall time 77s): `342 pass, 0 fail, 3971 expect() calls, Ran 342 tests across 15 files. [77.12s]`.
`bun run typecheck` (seconds): `tsc --noEmit`, exit 0.
`bun test tests/docs-links.test.ts tests/command-reference.test.ts` (seconds): `7 pass, 0 fail`.

Worker changed-test runs (each after `bun install`, 9 packages): all `0 pass, 0 fail, no test files affected`, exit 0, expected for prose-only.

Artifact paths: U1 evidence survives at `/tmp/u1-evidence/` (`grep.txt`, `diff.txt`, `show-head.diff`, `changed-test.txt`, `bun-install.txt`, `commit.txt`, `commit-id.txt`). U2/U3 evidence lived in their worktrees (removed per protocol after clean picks); their full outputs were pasted in the worker returns. Lane proof is the committed diff `9ea5dd0..af8d363`.

## Known limitations

- Plan open limitation holds: the schedule and audit are prose the seats and door apply; no automated check refuses a `merge_checks` run before merge or a repo-health criterion.
- Already-written repo-health criteria (framework `emdash-conversion` C1) stay a framework operator decision, outside this leaf.
- Minor style variance (no meaning change): `SKILL.md:34` and `worker-protocol.md:11` use plain `checks` where sibling lines use backticked `` `checks` ``. Left as landed; a reviewer may Nit it.

## Unverified criteria

None. All five done-criteria verified by the evidence above.
