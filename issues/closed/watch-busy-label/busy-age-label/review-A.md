# Review A: busy-age-label

Base: `ccea397163b8fda774916f2f6a4a60b10506f7d3`
Reviewed head: `17b322dadf6068099e6277d3a3bd952d4e4eed5d` (1 commit, 3 files, +47/-4, worktree clean)

No debate artifacts exist (`debate: no`, direct synthesis). Judged diff against plan decisions D1-D4, criteria 1-5, checklist, design exclusions, report, and live contracts.

## Findings

None.

## Verification evidence

- D1/criterion 1: `observe.ts:215` `ageSuffix` returns `` ` busy=${h}h${String(m).padStart(2, '0')}m` ``; `formatLeaf` concatenates `/${status}${age}` unchanged, yielding `A=pane/working busy=1h40m`.
- D2/criterion 2: undefined returns `''`; NaN date returns `''`; negative diff clamps to 0 yielding ` busy=0h00m`. Edge behavior identical to prior `+0h00m` with only the label changed.
- D3/criterion 3: `skills/watch-issues/SKILL.md:28` shows `[ busy=HhMMm]` in both A and B tokens. `grep -rn "busy=\|0h00m\|HhMMm"` over skills/src/docs/tests finds no remaining old format and no other consumer parsing the observe line; `tests/status.test.ts` `busy B 0h00m` refers to a different `akrogon status` surface.
- Criterion 4: e2e artifacts exist and contain the new line: `/tmp/observe-busy-1790591622.txt` and `/tmp/observe-busy-lane-1790591675.txt`, both `A=<pane>/working busy=1h40m B=-/- notified=`. Reproduced report claims.
- Tests: two `+0h00m` expectations updated to ` busy=0h00m`; new `unparsable busy_since prints no suffix` and `future busy_since prints busy=0h00m` tests assert printed lines, matching acceptance criteria, no mocks of the unit under test (real subprocess).
- Doc claims: opened `skills/watch-issues/SKILL.md` (changed behavior page); the `[ busy=HhMMm]` claim is accurate against the code. AREA.md path claims verified with existence checks: all named paths in skills/src/tests AREA.md exist; `skills/AREA.md` still describes `observe.ts` correctly. No AREA.md in the diff.
- Exclusions: `src/next.ts`, `busy_since`, `busy_notified` untouched; diff is the three planned files only.
- Checks rerun in worktree: `bun test ./skills/watch-issues/scripts/observe.test.ts` 22 pass/0 fail (bunfig root `tests/` requires explicit path, plan D4 confirmed); `bun test` 306 pass/0 fail; `bun run typecheck` exit 0; `bun run format` no-op, worktree clean; `git diff --check` exit 0.
- Learnings: 2026-09-11 stale-rule-in-docs applied (doc line grepped and updated); 2026-09-10 review-by-reading applied (script run end-to-end, artifact saved). No new lesson found.

## Verdict

ready
