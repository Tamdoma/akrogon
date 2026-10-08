# Brief U1: seat schema, front matter reader, resolver, effectiveConfig

## 1. Goal

Implement plan D1-D4 and D7 of `index-seats`: a seat may be declared in `ISSUE.md`/`EPIC.md` YAML front matter and `seats()` resolves per seat nearest-index-first with source reporting; `akrogon config` inside a managed leaf worktree prints that leaf's slots. Repo `akrogon` (bun + TypeScript + zod v4).

## 2. Numbered acceptance criteria

1. `seats(global, repo, leafPath?)` returns `{ a: SlotConfig; b: SlotConfig; source: { a: string; b: string } }`. For `leafPath` under `<root>/issues/open` or `closed` at depth 2 (`<owner>/<leaf>`) it reads `<owner>/ISSUE.md`; at depth 3 (`<epic>/<issue>/<leaf>`) it reads `<epic>/<issue>/ISSUE.md` then `<epic>/EPIC.md`, nearest present seat winning per seat; a missing file contributes nothing. With no index seat, `source` is `resolve(repo.root, 'issues/config.yaml')` when `repo.config.slots` supplies the seat, else `resolve(globalHome(), 'config.yaml')`. Called without `leafPath` it behaves as before for both seats.
2. Front matter is a file whose first line is `---`, ending at the next line `---`; the text between is `Bun.YAML.parse`d and validated by `z.strictObject({ slots: z.strictObject({ a: seat.optional(), b: seat.optional() }) })`. A file not starting `---` has no front matter. A first `---` with no closing `---` is a parse failure.
3. A malformed index — YAML parse failure, a key other than `slots`, a seat other than `a`/`b`, a missing field, a value blank after trim, a decoded value containing `'` or `"`, or a resolved harness absent from `global.harnesses` — throws `SeatIndexError` (exported class) whose message contains the absolute file path, the parse or schema reason, and the seat key when the failure sits under `a`/`b`; the missing-harness throw names the source path and the seat.
4. Seat fields in `slotConfigSchema` are `z.string().trim().min(1).regex(/^[^'"]*$/)`; the same object validates `globalSchema`, `repoSchema` and the front matter schema, so `model: 'x'` at machine or repo level with a quote or blank value fails schema parse.
5. `akrogon config` run with cwd inside a managed leaf worktree (toplevel realpath equal to a `state.worktree` recorded for a leaf of that repo) prints `slots` resolved for that leaf without a `source` key; at the registered root, in an unrelated linked worktree and outside any repo it prints exactly what it prints today. A malformed index in that leaf's chain makes `config` exit non-zero naming the index path.

## 3. Read-first list

- `src/config.ts` — whole file; `slotConfigSchema` (line 10), `seats()` (line 60), `effectiveConfig()` (line 177).
- `src/state.ts` lines 114-145 — `validateLeafDepth`, `leavesUnder`, `allLeaves`.
- `src/init.ts` line 44 — existing two-arg `seats` caller that must keep compiling unchanged.
- `tests/helpers.ts` — `fixture`, `leaf(f, slug, phase, extra, container)`, `yaml`, `cli`.
- `tests/config.test.ts` line 130 — `config rejects invalid slots shapes` test to extend.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `src/config.ts` and `tests/config.test.ts`. No prerequisite units; `tests/helpers.ts` unchanged (shared fixture resource). Downstream units U3/U4 consume `SeatIndexError`, the new `seats` signature and `seats(...).source`.

Changes:

- Tighten the slot object to the `seat` shape above (keep `const text` for other fields).
- `export class SeatIndexError extends Error` carrying `file`; message format e.g. `Invalid slots front matter in <file>: <reason>`; wrap `Bun.YAML.parse` and schema failures; derive reason for schema failures from `error.issues` so a seat path like `slots.a.model` appears.
- Private `indexSlots(leafPath, repo)` helper returning the per-seat index candidates `{ a?: {seat, file}, b?: {...} }` after reading the ancestor index files; a leaf path not within either issues area contributes no index. Use `relative(areaRoot, leafPath)` and skip when it starts with `..`; prefer `issues/open` over `issues/closed` when both contain the path.
- `seats(global, repo, leafPath?)` returns `{a, b, source}`; harness-template check on the resolved seats throws `SeatIndexError` naming source and seat only when the resolved seat came from an index; keep the existing `Missing harness template "<h>" for seat <seat> in repo <name>` wording for machine/repo sources.
- `effectiveConfig`: import `allLeaves` dynamically inside the function via `await import('./state')` (avoid `config → state → park → config` import cycle); find the leaf whose `state.worktree` exists and whose realpath equals `realpathSync(top)`; `slots: seats(global, repo, matched?.path)` minus `source` (strip via destructure, keeping the printed `{a, b}` shape). `AKROGON_BASE` and all other printed keys unchanged.

Tests to write first in `tests/config.test.ts` (extend the line-130 test for criterion 4 blanks/quotes at both machine `config.yaml` and repo `issues/config.yaml` levels; new test(s) for criteria 1, 3 and 5, plus malformed-index `config` exit). Build a leaf worktree with `leaf(f, slug, phase, { worktree: resolve(f.root, 'issues/worktrees/<slug>') }, 'issue')` plus `git worktree add -b <slug> <that path>` from `f.root`; write index files with `writeFileSync` containing `---\nslots:\n  a:\n    harness: fake\n    model: index-a\n    effort: low\n---\n# Title\n`. Assert `Bun.YAML.parse(cli config stdout).slots` equals index values for a managed worktree cwd (also from a subdirectory of it) and today's values at root/linked/outside. One malformed index (e.g. `slots: {a: {harness: fake, model: 'x}}` parse garbage or a `foo:` key) → `cli(f,['config'],worktree).code !== 0` and stderr/stdout names the index path. An `ISSUE.md` with no `---` first line resolves repo/machine as before.

## 5. Do-not, reasons and exceptions

- Do not edit `src/state.ts`, `src/next.ts`, `src/status.ts`, `tests/helpers.ts` or any other test file — owned by A or other units; a needed change there is a mismatch returned with evidence.
- Do not add fields to `state.yaml`, create files in issue folders, or change harness templates — excluded by locked design.
- Do not catch-and-continue on front matter errors, and do not print secret values — `SeatIndexError` must propagate.
- Do not change `init.ts` or existing two-arg `seats` behavior.
- Mismatch return, not scope drift: reply with the conflicting requirement, evidence, and smallest brief correction; exception is a revised brief from A.

## 6. Ordered steps

1. Read the read-first files; write the new/changed tests red (deliberate break: revert schema tightening, confirm the blank/quote cases fail).
2. Implement `src/config.ts` changes.
3. `bun install` in your worktree, then run the commands below.
4. Commit `src/config.ts` and `tests/config.test.ts` separately or together with a `feat:` message and the `Test-Change:` trailer for `tests/config.test.ts` (new cases added, no existing expectation changed).

Advisory size: 2 files, under 40 turns.

## 7. Commands

```sh
export AKROGON_BASE=2645d97ed1682185eea4788844f882a541885d24
bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/config.test.ts --timeout=30000
bun run typecheck
```

`typecheck` is required because U3/U4 consume your signatures.

## 8. Done-when, evidence and report

All criteria 1-5 proven green by the tests above; typecheck passes; commit id returned. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
