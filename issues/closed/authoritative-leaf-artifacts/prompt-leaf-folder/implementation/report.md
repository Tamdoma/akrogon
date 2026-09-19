# Implementation report: prompt-leaf-folder

Base: e624357e825e21b38a15c07a435b1ff066c6ba38
Head: 609f93d dispatch prompt carries leaf= authoritative folder

## Changed files and reasons

- `src/next.ts` — `dispatchSlot` prompt now ends with ` leaf=${leaf.path}`; `leaf.path` is the absolute authoritative folder from `discover()` (criterion 1).
- `tests/next.test.ts` — 13 exact-text prompt assertions updated with the ` leaf=<path>` suffix; ends-with and not-`issues/worktrees` assertions added at the plan.synthesis test and the merge test (criteria 1, 2); new spaced-repo-root test asserting the complete spaced `leaf=` value as one recorded prompt argument (criterion 6).
- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` — prompt lines state `leaf=<folder>`; each gains the pass-artifacts/worktree/manual-fallback sentence (implement-issue keeps the standalone no-config note beside it); bare-filename write lines qualified with the leaf folder; footer `Next:` templates and merge's repair-move prompt updated (criteria 3, 4).
- `docs/guide/next.html` — "four words" sentence now names five fields with a `leaf=` example (criterion 5).

`README.md` and `tests/command-reference.test.ts` contain no dispatched-prompt-shape mention (verified by grep for `slot=`/`phase=`/`prompt`); per criterion 5 that is stated here instead of edited.

## Commands run

- `AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38 bun test --changed=e624357e825e21b38a15c07a435b1ff066c6ba38` → 81 pass, 0 fail (worker 1).
- `bun test tests/next.test.ts -t 'spaced repo root'` → 1 pass (worker 1).
- `grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/*/SKILL.md` → no unqualified write instruction; remaining bare hits are read instructions (worker 2).
- `bun run format` → clean.
- `bun run typecheck` (`tsc --noEmit`) → clean.
- `bun test` → 219 pass, 0 fail, 2881 expect() calls, 12 files, 52.30s.

## Artifacts

- Plan: `issues/open/authoritative-leaf-artifacts/prompt-leaf-folder/plan.md`
- Sub-briefs: `implementation/brief-1.md`, `implementation/brief-2.md` (same folder)

## Known limitations

- `leaf=` value runs to end of the prompt line; a path containing a newline is unsupported, same as any path today. Recorded in plan.md.
- Worker 1 found 4 additional exact-text assertions beyond the 9 listed in the plan (lines ~877, 994, 1144, 1211); all updated, same criterion.

## Unverified criteria

None. All 7 done-criteria verified.
