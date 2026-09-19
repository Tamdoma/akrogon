# Review A: skills-never-ask

Base: f91cea968ac46f5a30119e4ce03eac611cc66abd
Reviewed head: b35ed0427eccdd05c29efd2e8fdca00167e3dc70 (branch skills-never-ask)
Debate: no (positions-A.md/rebuttal-A.md absent as expected)

## Findings

None.

## Verification evidence

- `grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/` — sole hit is `skills/chart-issues/assets/questions.md:29`, an attended-skill asset excluded by design (D9). No ask/wait instruction remains in any lifecycle skill. Done-criterion 1 met.
- `grep -ln "akrogon phase <slug> failed --reason"` on the four phase skills — all four listed; each stop instruction also names `--slot` (plan-issue `<its seat from the dispatch prompt>`, implement-issue `B`, check-issue `<A|B>`, merge-issue `A`). Done-criterion 2 met.
- `grep -n "failed" skills/broadcast-issue/SKILL.md` — only the pre-existing line 41; no stop command added. The no-questions rule is present ("directs no questions elsewhere"), and Standalone implement states it without a stop ("sends no questions back").
- AREA.md check: one shell loop over every path named in `skills/AREA.md` — all 10 exist from the worktree root. The added rule line sits under Non-obvious patterns (D8).
- Interface check: `src/routing.ts:27-33` makes `failed` legal from every active phase; `src/phase.ts:116` requires `--reason`; `src/phase.ts:131-138` records cause `blocked` and skips `requireClean` on the return move. Prose matches the live contract.
- `bun test` — 239 pass, 0 fail, 3035 expect() calls, 12 files. Done-criterion 3 met.
- Diff scope: only the six owned files changed; D9 exclusions untouched.

## Decision check

- D1: no forbidden substring in lifecycle skills; negated phrasing avoided. Met.
- D2: each phase skill's stop names its pass artifact (plan.md via "current pass artifact" plus the explicit operator-actions flow, implementation/report.md, review-<slot>.md, review-A.md), `--reason`, `--slot`, and ends the pass. Met.
- D3: conflict rule reworded to "the design wins" without the forbidden substring; operator-actions flow replaced with blocker-plus-stop `failed --slot B`. Met.
- D4: credential line rewritten to record in report.md and stop `failed --slot B`; wait and proceed-without-it paths removed; Standalone rule added without a stop. Met.
- D5/D6: stop instructions present with correct artifacts and slots; merge-issue explicitly preserves conflict/check/push paths. Met.
- D7: broadcast rule without stop. Met.

## Verdict

ready

## Merge record (slot A)

- Rebase: no-op; `origin/main` (f91cea9) already ancestor of reviewed head b35ed04.
- AKROGON_BASE after refresh: f91cea968ac46f5a30119e4ce03eac611cc66abd (unchanged).
- Checks: `bun run format` clean (all files unchanged); `bun run typecheck` clean; `bun test --changed` 0/0 (6 prose files, no tests affected); `bun test` 239 pass, 0 fail, 3035 expect() calls, 12 files.
- Push: `git push origin HEAD:main` fast-forward f91cea9..b35ed04; confirmed `b35ed04` ancestor of `origin/main`.
