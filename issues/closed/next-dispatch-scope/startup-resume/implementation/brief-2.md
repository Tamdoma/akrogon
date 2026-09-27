# Brief 2: resume code (green)

## 1. Goal

Implement `akrogon next --resume` per plan D1 to D6, D11 and acceptance A1 to A4, turning the brief-1 tests green. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`. Leaf: `startup-resume`.

Binding facts: `--resume` always covers all registered repos regardless of cwd. The resume set per repo is one `discover` filtered to merged phase or tab or worktree set, dispatched with `explicit: false` through `sweep`, ignoring `completed` outcomes, then `cleanupRepos` over all registered repos. Target, `--all` and `--resume` are mutually exclusive under `Use a target, --all or --resume, not combined`. `nextCommand` receives `'--resume'` like `'--all'`. Failed and hand-built leaves need no special case. `--all` semantics, completion-site behavior outside `--resume` and `pull.sh --all` are unchanged.

## 2. Numbered acceptance criteria

1. `akrogon next --resume` parses and dispatches; with a target or `--all` it exits non-zero with the D4 error.
2. `nextCommand` bypasses leaf selection for `'--resume'` and runs the resume branch: per-repo filtered sweep plus global cleanup, with no follow-up sweep on completion.
3. `plugin/herdr-plugin.toml` startup is pull `--all` then next `--resume`.
4. The README `next` row reads `[<slug>|<path>|--all|--resume]`.
5. The changed-test command passes, including the brief-1 resume, manifest and contract tests.

## 3. Read-first list

- `src/akrogon.ts`: the `next` options ternary, the `Use a target or --all, not both` guard and the `nextCommand(...)` call.
- `src/next.ts`: the selection-bypass condition, the `input === '--all'` branch, `sweep`, `sweepAll`, `cleanupRepos`, `discover`, `registeredRepos`, `dispatchLeaf` and its `explicit` flag.
- `plugin/herdr-plugin.toml`, `plugin/next.sh` (argv forwarder, read to confirm no edit), the README command section.
- This skill folder's `ponytail.md`.
- Open the index only for a gap in this list.

Pattern to copy: the `--all` branch in `nextCommand` for structure; the resume branch differs only in its filter, its always-global scope and no completion follow-up.

## 4. Change list and needed interfaces

- `src/akrogon.ts`: `next`-only options become `{ all, resume }` (pull, park, unpark keep `{ all }`); one mutual-exclusion guard for target plus both flags with the section 1 error; pass `'--resume'` to `nextCommand` ahead of `'--all'`.
- `src/next.ts`: extend the bypass to `input !== '--resume'`; add the resume branch after the `--all` branch using `registeredRepos(global, invocation).repos`, one `discover(repo, invocation).leaves` per repo filtered to `state.phase === 'merged' || state.tab !== undefined || state.worktree !== undefined`, `sweep(global, repo, filtered, invocation)`, then `cleanupRepos(registeredRepos(global, invocation).repos, invocation)`.
- `plugin/herdr-plugin.toml`: second startup entry only.
- `README.md`: the `next` row only; escaped pipes stay escaped.

Needed shapes: `sweep(global: GlobalConfig, repo: Repo, leaves: Leaf[], invocation: Invocation): Promise<void>`; `discover(repo, invocation): Inventory` with `leaves: Leaf[]`; `Leaf` is `{ path: string; state: State }`; `State` carries `phase`, `tab?`, `worktree?`; `cleanupRepos(repos: Repo[], invocation: Invocation): Promise<void>`; `registeredRepos(global, invocation)` returns `{ repos: Repo[]; unknown: boolean }`.

## 5. Do-not, reasons and exceptions

- Do not change `--all` semantics, completion-site behavior outside `--resume`, or the pull startup entry. They belong to other scopes; touching them widens review.
- Do not edit tests. Brief 1 owns them; code changes to fit tests, not the reverse.
- Do not edit `docs/` or skills. Brief 3 owns docs.
- Do not add helpers, abstractions or options beyond `{ all, resume }`. The existing `sweep` and `cleanupRepos` already do the work.
- On any conflict between this brief and the plan or live code, return a mismatch naming the conflict, the evidence and the smallest brief correction instead of changing scope. The exception is a revised brief from B authorizing that change.

Reasons restated: untouched scopes keep the diff reviewable; tests stay fixed so green means the code fits; docs stay with brief 3; no new abstraction keeps the change minimal; mismatch returns keep scope with B, whose revised brief is the only exception.

## 6. Ordered steps

1. In `src/akrogon.ts`, add the `resume` option, the D4 guard and the `'--resume'` pass-through (criterion 1).
2. In `src/next.ts`, extend the selection bypass and add the resume branch (criterion 2).
3. In `plugin/herdr-plugin.toml`, switch the second startup entry (criterion 3).
4. In `README.md`, update the `next` row (criterion 4).
5. Run the section 7 command and paste the green output (criterion 5).

Advisory size: 4 files, under 18 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`, this command only:

```sh
AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed=1a21e22e0056a7e9d6b5e35a5a395b867847a844
```

## 8. Done-when, evidence and report

Done when criteria 1 to 5 hold with the green run pasted. Report limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
