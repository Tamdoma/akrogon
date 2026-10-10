# Review A: seed-owner-routing

Base `3d223c8` · Reviewed head `e5b68d6` · One commit, 6 files, +32/−14.

## Verification evidence

- `git diff 3d223c8..e5b68d6` inspected in full. Diff = exactly the plan's W1 checklist; nothing outside owned surfaces.
- `bun test tests/docs-links.test.ts` rerun at reviewed head: 3 pass, 0 fail — README, guide and all 11 `skills/*/SKILL.md` pages' relative links resolve (criterion 6, mechanical half).
- Owner rule traced line-by-line to brief/design: consumer `issues_repo`/origin resolution unchanged; owner test only reached by a failure-location path absent under the consumer root; akrogon-owned = exists under akrogon root or resolves under it via `readlink -f` (covers `~/.claude/skills/*` links); absent under both roots → no reroute; `command -v akrogon` empty after the test is reached → visible stop with path and reason, no fallback (brief criteria 1–2, design interface).
- Report ordering: inspection of failure-named files now explicitly precedes destination resolution (implementation note IN1, required because the owner test consumes the named paths). Consistent: lookups still run "before authoring" against the now-resolved routed repo (criterion 3 first clause).
- Covering-report rule: mechanism/defect judged by body, posts nothing, `Last operation` prints the found URL, applies every run; related-different still posts with the related line; failed lookup still posts "search failed" (criterion 3, draft-review-repairs 2a).
- Body template: `Origin repo:` always, `Lesson history:` only when a lesson triggered (criterion 4).
- Criterion 5: `implementation/fresh-agent-cases.md` verified — subagent read only the shipped SKILL.md (session shows no `issues/` reads), ran real resolution and both read-only lookups incl. `gh issue view 73`, emitted all six expected verdicts, 0 mutating calls out of 55. Independent (not the W1 writer).
- Meaning sweep cross-checked `docs/` + README.md: `cheat.md`, `create.md`, `learn.md`, README intake lines now state owner routing + found-report outcome; no surviving line promises current-repo-only routing or always-create.
- `Test-Change:` trailer on `e5b68d6` cites the leaf brief's criterion 7 for the `tests/docs-links.test.ts` change — correct form (rule in `src/test-files.ts`; trailer judged here by content: accurate source and no existing expectation changed).
- No AREA.md in the diff; docs claims opened (`learn.md`/`create.md`/README) — none assert a wrong path or stale behavior after the edits.
- Worker worktree removed; lane clean; nothing under `issues/` committed.

## Findings

None. No Fix, no Nit held.

Checks: worker ran format/typecheck/full suite at its head; lane `bun test --timeout=30000` 642/642 and `tsc --noEmit` clean after the pick; `src/status.ts` prettier drift reverted (known base condition, not a leaf defect).

## Verdict

ready
