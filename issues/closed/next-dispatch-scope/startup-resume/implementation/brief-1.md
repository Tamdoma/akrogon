# Brief 1: resume tests first (red)

## 1. Goal

Write the failing tests for `akrogon next --resume` before the code exists. Covers plan D7 (test side), D8, D10 and acceptance A1 (rejection part), A2 (manifest test), A3, A4. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`. Leaf: `startup-resume`.

Binding facts: `--resume` dispatches only leaves that are allocated (`state.tab` or `state.worktree` set) or merged, across all registered repos, then runs cleanup. It never allocates. It rejects combination with a target or `--all`. `plan.synthesis` needs slot B only. Tests run the real CLI through `tests/helpers.ts` and `tests/fake-herdr.ts`. No new mocks.

## 2. Numbered acceptance criteria

1. `tests/next.test.ts` has a two-repo resume test: each repo holds one allocated idle leaf and one unallocated ready leaf; `next --resume` from outside any repo delivers exactly the 2 allocated prompts, creates no new tabs, and both unallocated leaves gain no tab or worktree with attempts still 0.
2. `tests/next.test.ts` has a merged-plus-dependent test: a merged leaf still in `issues/open` under `--resume` gets owner completion plus worktree, branch and tab cleanup, while its unallocated dependent (blocked by the merged leaf) gains no tab, worktree or prompt.
3. `tests/next.test.ts` asserts `next --resume <target>` and `next --resume --all` each exit non-zero.
4. The `startup retains completed issue resources while an epic sibling remains unfinished` test runs its sweep as `--resume`; the `startup retries closure before cleanup` test keeps `--all`.
5. `tests/pull.test.ts` startup test expects manifest `[['sh','pull.sh','--all'],['sh','next.sh','--resume']]` and is retitled to name next resume.
6. `tests/command-reference.test.ts`: `contracts.next` is `[<slug>|<path>|--all|--resume]`, the escaped-alternatives override is `[--all | <path> | <slug> | --resume]`, and the invalid list gains `['next', '[<slug>|<path>|--all]']`.
7. The changed-test run shows the touched tests failing (red) with `src/`, `plugin/` and `README.md` untouched, and the report names which reds are real versus vacuous (criterion 3 may pass pre-change for the wrong reason: strict arg parsing rejects unknown `--resume`).

## 3. Read-first list

- `tests/helpers.ts`: `fixture`, `cli`, `leaf(f, slug, phase, extra, container)`, `fakeHerdr`. `leaf` writes `state.yaml` with `repo: 'repo'`, `debate: 'no'`, `blocked-by: []` plus `extra`, under `issues/open/<container>/<slug>`.
- `tests/next.test.ts`: copy the `dispatchFixture`/`database`/`calls`/`next`/`configure`/`resetPrompts`/`skips` helpers, the two-fixture multi-repo pattern (second fixture `g` with `{ repo: 'other' }` extra plus `configure(f, { repos: { repo: f.root, other: g.root } })`), the epic-sibling test, and a merged-cleanup test for assertion shapes.
- `tests/pull.test.ts` startup test, `tests/command-reference.test.ts` contracts.
- This skill folder's `ponytail.md`.
- Open the index only for a gap in this list.

Pattern to copy: allocate with explicit `next(f, [slug])`, then `resetPrompts(f, path)` for an idle pending seat, then run the sweep from `f.home` to model startup.

## 4. Change list and needed interfaces

- `tests/next.test.ts` only: add the two tests plus rejection asserts (new test or asserts inside the resume test; keep it in one new test each for the two scenarios and put rejection asserts in the first).
- `tests/pull.test.ts` only: title plus one manifest entry. The wrapper-forwarding loop is unchanged.
- `tests/command-reference.test.ts` only: contract string, override string, one invalid row.

Needed shapes: `next(f, args, env, cwd)` runs `akrogon next ...` with `cwd` default `f.root`; pass `f.home` for startup. `database(f).prompts` is `{pane, text}[]`; `database(f).tabs` is tabs. `readState(path)` / `saveState(path, state)` from `../src/state`. Merge flow: allocate via explicit next, `saveState(path, {...readState(path), phase: 'merge'})`, then `cli(f, ['phase', slug, 'merged'], f.root, f.env)` with no `--slot` (single required slot defaults). Keep the merged leaf alone in its issue container (for example `'solo'`) and the dependent in another container with `{ 'blocked-by': ['done'] }` so the owner completes. Cleanup asserts: `existsSync(worktree)` false, `run(['git','show-ref','--verify','--quiet','refs/heads/done'], f.root)` code 1, `database(f).tabs` empty, `existsSync(resolve(f.root,'issues/closed/solo'))` true.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `plugin/`, `README.md` or `docs/`. Brief 2 and 3 own them; this brief must end red against untouched code.
- Do not add mocks or fixtures. Standing design requires the real CLI plus existing helpers and fake-herdr; a new mock would test itself.
- Do not change unrelated tests. Only the epic-sibling `--all` call switches to `--resume`; every other existing call stays.
- Do not weaken an assertion to get green. A test that cannot fail is not evidence.
- On any conflict between this brief and the plan or live code, return a mismatch naming the conflict, the evidence and the smallest brief correction instead of changing scope. The exception is a revised brief from B authorizing that change.

Reasons restated: untouched code keeps red honest; no mocks keeps the suite real; unrelated tests stay green so failures point here; mismatch returns keep scope with B, whose revised brief is the only exception.

## 6. Ordered steps

1. In `tests/next.test.ts`, add the two-repo resume test (criterion 1): two fixtures, explicit allocate each old leaf, `resetPrompts` each, add each new leaf, run `next --resume` from `f.home`, assert 2 prompts to the old leaves, tab count unchanged at 2, new leaves without tab/worktree and attempts 0.
2. In `tests/next.test.ts`, add the merged-plus-dependent test (criterion 2) per section 4, asserting owner completion, cleanup and the dependent untouched.
3. In `tests/next.test.ts`, add the rejection asserts (criterion 3) and switch the epic-sibling sweep to `--resume` (criterion 4).
4. In `tests/pull.test.ts`, update the title and manifest entry (criterion 5).
5. In `tests/command-reference.test.ts`, update the contract, override and invalid list (criterion 6).
6. Run the section 7 command and paste the red output (criterion 7).

Advisory size: 3 files, under 16 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`, this command only:

```sh
AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed=1a21e22e0056a7e9d6b5e35a5a395b867847a844
```

## 8. Done-when, evidence and report

Done when criteria 1 to 7 hold: new and updated tests exist, untouched code, red output pasted naming real versus vacuous failures. Report limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
