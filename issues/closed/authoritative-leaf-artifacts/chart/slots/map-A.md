# Territory map (A) 2026-09-18

## Seed #15 status --charts held/closed
Resolved on the live surface. Commit 2edea9c (closed leaf chart-terminal-stage/terminal-stage-marker, sources: []) changed src/status.ts:247-251 to match `^(Handed off|Closed|Held)\b` with last line winning. Live run in framework repo: legacy-lifecycle-residue reads `closed`, skill-lane-argument-kind reads `held`. Nothing to build. Off route: the closed leaf does not carry #15 in sources; closing the GitHub issue is an operator step outside this door.

## Seed #17 foreign issues tree in consumer repo
Partially resolved by the consumer: clinique commit e9a9a388 removed the 96 foreign leaves, so the flood is gone today. Root mechanism: git merge of the framework repo into the consumer (clinique merge 19cd1bb0 "Merge clinique-la-roya project history into framework checkout"), which carries every tracked file including issues/. Residue still in clinique: issues/chart/ (8 framework charts), log.jsonl (488 repo:framework lines), continuity/, history/, token-ledger.yaml. These do not trip `next` (discover walks open/closed only) but the charts do enter chart-issues duplicate detection there.
Forks:
- F17a Does akrogon collapse the per-leaf error into one message per repo? Today discover() (src/next.ts:98-107) reports each leaf and counts unreadable; status (src/status.ts:58,72-74) reports `unreadable` once and stops. next --all is event-driven so 96 lines per herdr event.
- F17b Should a foreign tree be a registration-time refusal (`akrogon init`/register) rather than a walk-time report? Registration is outside this door's tool but inside the repo.
- F17c Is the copy mechanism (framework merge) in scope? No: it is the framework repo's update process, not akrogon. Off route with named owner.
Pitfalls: collapsing errors hides a real single-leaf corruption; a repo-level refusal makes `next` skip the consumer's own future leaves until cleaned, which is arguably the right behavior (seed expectation says "detected once with a single actionable message").
Recommend: one aggregated line per repo per pass when all mismatches share one stored key, naming the count and the stored key; keep per-leaf lines when keys differ. Tier 3 (inspected code). Practitioner search not run: purely repo-internal mechanism.

## Seed #18 debate artifacts in worktree
Workaround applied (leaf now `implement`, four files copied). Defect remains for every future debate leaf. Causes on the live surface:
- Panes are created with --cwd worktree (src/next.ts:298-299), so agents' cwd is the worktree copy of issues/open.
- The prompt is `plan-issue <slug> slot=B phase=plan.positions` (src/next.ts:411), no path.
- transition() runs requireCodeOnly only for check.review (src/phase.ts:118); implement-issue SKILL.md:39 already claims phase refuses issues/ at every move, so skill text and code contradict.
- plan-issue SKILL.md:33 says "write only positions-<slot>.md" without restating the authoritative path.
Forks:
- F18a Enforce requireCodeOnly at every transition that has a worktree (fail at write time, message names the authoritative path). Cost: an already-dirty branch (like worker-scaffold) is stuck until the operator drops the commits; existing test at tests/phase.test.ts:140-146 covers only review.
- F18b Put the absolute authoritative leaf path in the dispatch prompt. Cost: prompt grows, skills already say to read akrogon config; the prompt is also what implement and check receive.
- F18c Skill text only. Cost: already failed once; the text at :14 says it and agents still wrote relative to cwd.
Recommend a + b together: the gate prevents the wrong state, the path removes the reason to guess. Not c alone.
Pitfall: requireCodeOnly also refuses an empty branch (`Empty leaf branch`), which is wrong for plan phases where no code exists yet; the every-phase check must only refuse issues/ files, not require changes. This splits requireCodeOnly into two checks.
Pitfall: the error message must name repo.root/issues/open/<...>, and the recovery is `git rm` on the branch plus copying the files, which is an operator step.

## Split
- #15: off route, already shipped. No chart, or a one-line closed chart for provenance so #15 is not re-imported. Recommend a closed chart folder (records provenance, keeps dedup).
- #17 and #18 are different destinations (mismatch reporting vs debate artifacts placement). Two charts, two independent issues, no dependency.
