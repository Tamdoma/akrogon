# Brief U1: preflight module, verb, CLI tests, docs

## 1. Goal

Implement plan decisions D1, D2, D3, D5, D6 (module half), D8: new `src/preflight.ts`, `base()` on the tracking ref, `akrogon preflight` verb, command-reference contract, `tests/preflight.test.ts`, README row, shapes.md sentence.

## 2. Numbered acceptance criteria

1. `akrogon preflight` exits 0 and prints `<remote>/<branch> <sha>` when the remote branch and tracking ref both resolve. Verified by a new CLI test with a bare remote plus push.
2. C1 (no configured remote) exits non-zero; stderr names `C1`, the remote, and the fix (`git remote add` or `remote` in `issues/config.yaml`). Verified by CLI test.
3. C2 (remote branch absent) exits non-zero; stderr names `C2` and making plus pushing a first commit. Verified by CLI test against an empty bare remote.
4. C3 (branch on remote, tracking ref absent) exits non-zero; stderr names `C3` and `git fetch <remote> <branch>`. Verified by CLI test that pushes then deletes the tracking ref.
5. Transport failure (unreachable URL) exits non-zero; stderr names `unproven` with git's command, exit status, and stderr, and contains no C2 text. Verified by CLI test.
6. A same-named local branch and tag (`<remote>/<branch>`) never satisfy the check: tracking ref deleted still refuses; tracking ref present resolves to the tracking commit, not the impostor. Verified by CLI tests.
7. Unregistered cwd and non-repo cwd refuse non-zero without writes; a registered repo with zero leaves works. Verified by CLI tests asserting `git status --porcelain` empty and no new files.
8. `base()` resolves `refs/remotes/<remote>/<branch>` so `AKROGON_BASE` ignores a divergent same-named local branch. Verified by a CLI test through `akrogon config` in a worktree.
9. `tests/command-reference.test.ts` passes with the new `preflight: ''` contract and README row. Verified by the suite.
10. `shapes.md` preflight sentence present. Verified by inspection (prose, no test).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/shell.ts` (run/command/CommandError), `src/config.ts:119-145`, `src/akrogon.ts`, `tests/helpers.ts`, `tests/command-reference.test.ts`, `tests/config.test.ts`
- Pattern to copy: `src/next.ts` show-ref handling (`run`, check `code`, throw `CommandError` otherwise) for classified git exits; `tests/config.test.ts` for fixture-plus-CLI test shape.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Owns: `src/preflight.ts` (new), `src/config.ts`, `src/akrogon.ts`, `tests/command-reference.test.ts`, `tests/preflight.test.ts` (new), `README.md`, `skills/chart-issues/assets/shapes.md`. Nothing else. No prerequisites; U2 lands after this unit and consumes its exports.

```ts
// src/preflight.ts
trackingRef(repo: Repo): string; // `refs/remotes/${remote}/${branch}`
class PreflightError extends Error {
  code: 'C1' | 'C2' | 'C3' | 'unproven';
  argv: string[]; cwd: string; exit: number; stderr: string;
}
localBase(repo: Repo): Promise<string>; // rev-parse SHA; code 1 throws PreflightError C3; other non-zero throws CommandError
remoteBase(repo: Repo): Promise<void>; // ensureRemote + ls-remote classify; 0 ok, 2 throws C2, else unproven
checkBase(repo: Repo, remoteRequired: boolean): Promise<string>; // ensureRemote, local, classify-on-C3 via remoteBase, conditional remoteBase; returns SHA
preflightCommand(cwd: string): Promise<void>; // requireRepo + checkBase(repo, true) + console.log `<remote>/<branch> <sha>`
```

Commands: `git remote get-url <remote>` (C1 on any non-zero); `git rev-parse --verify --quiet <tracking>^{commit}`; `git ls-remote --exit-code <remote> refs/heads/<branch>`. All in `repo.root` via `run()`. `checkBase` catches only `PreflightError` with `code === 'C3'` for the classify path and rethrows everything else. The classify and required paths may re-run `get-url`; that redundant local call is accepted.

Exact message formats (use verbatim; tests assert `contains`, never full equality):
- `C1: no configured remote "<remote>"; add it (git remote add <remote> <url>) or fix remote in issues/config.yaml.`
- `C2: remote branch <remote>/<branch> absent; make and push a first commit on <branch>.`
- `C3: tracking ref <tracking> absent locally; run: git fetch <remote> <branch>.`
- `Unproven: cannot verify remote branch <remote>/<branch>: <argv> exited <code>: <stderr>.`

`src/config.ts`: `base()` runs `git merge-base HEAD <trackingRef(repo)>` (import from `./preflight`). `target()` untouched.
`src/akrogon.ts`: `case 'preflight'` with `z.tuple([])` positionals, lazy `import('./preflight')`, any position in the usage string (order-insensitive tests).
`tests/command-reference.test.ts`: add `preflight: ''` to `contracts`.
`README.md`: add `` `akrogon preflight` `` row with effect `Verify the configured base remote branch and local tracking ref.`
`shapes.md` `## Preflight and validation`, first paragraph, append: run `akrogon preflight` at the registered root before any handoff write and refuse the handoff on non-zero exit, handing the printed remediation to the operator.

Shared-resource warning: U2 later gives `tests/helpers.ts fixture()` a real remote. Every test here must establish its own remote state explicitly (C1 runs guarded `git remote remove origin`; others use `remote add`/`set-url` plus a bare `remote.git` under `home`), so they pass both before and after that change.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/phase.ts`, `src/sync.ts`, `src/log.ts`, or `tests/helpers.ts`; the gate, fixture, and adaptations belong to U2, and `phase.ts`/`sync.ts` are locked out of scope. Exception: none.
- Do not add a catch-and-reformat around the verb; errors propagate like every other verb (D5). Exception: none.
- Do not classify C1 from `ls-remote` stderr; missing and unreachable remotes both exit 128 there. Exception: none.
- Do not change `target()` or any locked decision; return a mismatch with evidence instead. Exception: a revised brief from B authorizing the change.
- Restated: stay inside the owned paths because U2 owns the rest; propagate errors because repo style does; use `get-url` for C1 because `ls-remote` cannot distinguish it; never widen scope without a revised brief.

## 6. Ordered steps

1. `tests/command-reference.test.ts` + `tests/preflight.test.ts` (criteria 1-9): write the contract entry and all CLI tests first, establishing own remote state per case. Run the changed-test command for red evidence (verb missing).
2. `src/preflight.ts` (criteria 1-7): probes, error, orchestrator, command. Keep every function single-purpose, strict types on all returns and variables.
3. `src/config.ts` (criterion 8): `base()` on `trackingRef()`.
4. `src/akrogon.ts` (criteria 1, 9): verb plus usage line. Run changed tests for green.
5. `README.md`, `shapes.md` (criteria 9-10): prose edits, then grep `docs/` for base-related prose touching this rule and report hits.
6. Run `bun run typecheck` in the worktree; fix only own-path errors. Commit only this unit's chunk.

Advisory size: about 7 files, under 28 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff. Start with `bun install` in the worktree before any test run.

## 7. Commands

Run in the worker worktree only:

```sh
export AKROGON_BASE=1607ee7fbf4a2362340c2d6b8de4257d72684ec6
bun test --changed="$AKROGON_BASE"
```

If that command selects no tests, fall back once to the named files directly (`bun test tests/preflight.test.ts tests/command-reference.test.ts`) and note it. Do not run the full suite; B runs it.

## 8. Done-when, evidence and report

Done when criteria 1-10 hold with red then green pasted output for the new tests. Return the commit ID, the changed-test output, and any required artifact path. Limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
