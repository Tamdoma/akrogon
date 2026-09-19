# Review B: docs-impact-rule

Base: f537143aeb0b126fb5d71a89120cb7c52eade382
Reviewed head: f11f6ae

## Verification evidence

- `git status --porcelain` empty; `f11f6ae` is the only commit and base is its ancestor.
- Full suite run by B during implementation after the format rewrite: 279 pass, 0 fail, 13 files. `bun run typecheck` clean, `bun run format` applied and committed.
- AREA.md path check (single command over `src/AREA.md`, the only area file in the diff): every named path exists; the only non-match was a command string, not a path.
- All `repoSchema.parse` call sites inspected: `readRepo` (persisted config, correctly fails without grounding), `effectiveConfig` and `initialize` fallbacks both parse `{ grounding: 'none' }`.
- Commit contains no `issues/` files.

## Criteria check

- C1 plan-issue: checklist names each affected doc one line each from index/AREA/README, or one line that none are affected. Met.
- C2 implement-issue: updates every plan-named doc plus any the diff makes stale before review; AREA.md shape rule kept verbatim. Met.
- C3 check-issue: doc-review rule sits in its own seat-neutral paragraph covering both reviewers; "Open no area file outside that diff" is gone; the AREA.md path check keeps its single-command form. Met.
- C4 init-issues: completion gated on a real top index, needed AREA files and `grounding.index` naming it; `grounding: none` only when the operator chose it. Met.
- C5 init.ts: `checkGrounding` reads the resolved index before `writeRepoConfig`, mkdir, `.gitignore` or registration; error names the resolved path and points to init-issues; read, not stat. Met.
- C6 config.ts: `.default('none')` removed; explicit `none` parses; omission fails; unregistered `effectiveConfig` prints `grounding: none`. Met.
- C7 tests: missing/directory/empty/whitespace refusal with byte-identical snapshots, non-empty success, repeat init for index and explicit `none`, bare init, omission-fails and explicit-parses cases; all keep-parsing fixtures carry `grounding: 'none'`, deliberate negatives untouched. Met.
- C8 human docs: README, setup.md and cheat.md describe the refusal and the index-or-explicit-none requirement; stale default-none claim fixed; index and AREA rows still match. Met.
- C9 report lists each doc opened with the claim checked. Met.

## Findings

None.

## Verdict

ready
