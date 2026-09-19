# Brief 1: dispatch prompt carries leaf=, tests updated

## 1. Goal

`akrogon next` dispatches `<skill> <slug> slot=<S> phase=<P> leaf=<absolute authoritative leaf folder>` where the folder is the leaf's `leaf.path` under the registered root's `issues/open/`. Implements plan decisions D1-D4 of `plan.md` (leaf folder: `/home/ivan/Work/infra/akrogon/issues/open/authoritative-leaf-artifacts/prompt-leaf-folder`).

## 2. Numbered acceptance criteria

1. The prompt string built in `dispatchSlot` (`src/next.ts:411`) ends with ` leaf=${leaf.path}`.
2. Every existing exact-text prompt assertion in `tests/next.test.ts` expects the ` leaf=<path>` suffix; `toContain` assertions unchanged.
3. One planning-phase test and one non-planning-phase test assert the prompt ends with ` leaf=${f.root}/issues/open/<container>/<slug>` and that the `leaf=` value contains no `issues/worktrees` segment (worktree allocated in the same run).
4. New test: a fixture whose registered repo root path contains a space dispatches one prompt whose `leaf=` value is the complete spaced authoritative folder, asserted against `database(f).prompts` text.
5. `AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38 bun test --changed=e624357e825e21b38a15c07a435b1ff066c6ba38` passes.

## 3. Read-first list

- `src/next.ts` lines 355-445 (`dispatchSlot`; prompt construction at 411) and lines 86-127 (`discover` sets `leaf.path` to the absolute folder under `issues/open|closed`).
- `src/state.ts:40` (`Leaf = { path: string; state: State }`).
- `tests/next.test.ts` lines 1-60 (`dispatchFixture`, `database`, `saveDatabase`, `next` helpers) and assertion sites at approximately lines 120, 172, 678, 721, 775, 1315, 1407, 1721, 1746.
- `tests/helpers.ts` (`fixture()` creates `f.home` via `mkdtempSync`, `f.root = f.home/repo`, writes `f.home/config.yaml` with `repos: { repo: root }`; `leaf(f, slug, phase, extra, container)` returns `resolve(f.root, 'issues/open', container, slug)`; `cli(f, args, cwd, env)`).
- `tests/fake-herdr.ts` lines 104-127 (`agent prompt` records `args[3]` verbatim as `prompts[].text`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/next.ts` line 411: change the template literal to append ` leaf=${leaf.path}`. `leaf` is the function parameter of type `Leaf`; `leaf.path` is already absolute. No quoting or escaping.
- `tests/next.test.ts`:
  - Update the nine exact-text assertions listed above to append ` leaf=${path}` (the variable holding the leaf folder in each test; at ~678 the leaf path variable may differ — use whatever names the test already has).
  - At the test asserting `'plan-issue build slot=B phase=plan.synthesis'` (~line 120): change to assert the text ends with ` leaf=${path}` and add `expect(db.prompts[0].text.split(' leaf=')[1]).not.toContain('issues/worktrees')` or equivalent.
  - At the merge test asserting `'merge-issue landed slot=A phase=merge'` (~line 678): same two additions (ends-with leaf path, no worktrees segment). The leaf path there is the `path` variable from `leaf(f, 'landed', ...)`.
  - New test for the spaced root: create `dispatchFixture()`, then move the repo: `renameSync(f.root, spaced)` where `spaced = resolve(f.home, 'repo root')`; rewrite `f.home/config.yaml` via `yaml(...)` with `repos: { repo: spaced }` (read the existing yaml first or rewrite the full object — `fixture()` writes `slots`, `harnesses`, `repos`; simplest is to re-read with `Bun.YAML.parse(readFileSync(...))`, replace `repos.repo`, and `yaml()` it back). Build `const f2 = { ...f, root: spaced }`, call `leaf(f2, 'spaced', 'plan.synthesis')`, run `next(f2, ['spaced'])`, assert `database(f).prompts` has length 1 and `prompts[0].text` equals `plan-issue spaced slot=B phase=plan.synthesis leaf=${spaced}/issues/open/issue/spaced`. `renameSync` is already imported in the test file.
  - Note: `cli`/`next` take `cwd = f.root`; pass the spaced root or rely on the default from `f2`. `cli` uses `f.home` for `AKROGON_HOME`, so `{ ...f, root: spaced }` is sufficient.
  - `readRepo` calls `realpathSync` on the configured path; on Linux tmpdirs this resolves to the same spaced path. If the assertion sees a symlink-resolved path differing from `spaced`, compare against `realpathSync(spaced)` instead — check once, use what the code produces.

## 5. Do-not, reasons and exceptions

- Do not touch `src/phase.ts`, the debate gate, `learnings/`, or any skill file — out of this brief's scope; skills are brief 2.
- Do not add quoting, escaping, or a parser for `leaf=` — the prompt is one argv element; the criterion-6 test proves spaces survive.
- Do not change `toContain('healthy')` or other substring assertions — they still pass and are not exact-text.
- Do not add tests beyond criteria 3 and 4 — plan scope.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: scope is `src/next.ts` line 411 plus `tests/next.test.ts` only; no new abstractions; mismatches come back to B with evidence.

## 6. Ordered steps

1. Edit `src/next.ts:411` to append ` leaf=${leaf.path}` (criterion 1).
2. Update the nine exact-text assertions (criterion 2).
3. Add the ends-with and not-worktrees assertions at the plan.synthesis test and the merge test (criterion 3).
4. Add the spaced-root test (criterion 4).
5. Run the changed-tests command below; repair failures within this brief (criterion 5).

Advisory size: 2 files, under 12 turns.

## 7. Commands

```
cd /home/ivan/Work/infra/akrogon/issues/worktrees/prompt-leaf-folder && AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38 bun test --changed=e624357e825e21b38a15c07a435b1ff066c6ba38
```

If `--changed` selects nothing useful mid-edit, `bun test tests/next.test.ts` is the targeted equivalent for this brief.

## 8. Done-when, evidence and report

All five criteria hold with pasted command output. Tests use temporary repos with herdr faked at the binary boundary; no real panes or sockets.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
