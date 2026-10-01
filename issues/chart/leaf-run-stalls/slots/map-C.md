# Map C: emdash-conversion seeds 45, 46, 47

Paths: `AK` = /home/ivan/Work/infra/akrogon, `FW` = /home/ivan/Work/infra/tamdoma/framework, `PI` = /home/ivan/.pi/agent/extensions/tamdoma-subagents, `LEAF` = FW/issues/open/emdash-cms/emdash-build/emdash-conversion.

## Verdict: one cause or three

Three mechanisms, one shared gap. Charting never measures a leaf against the live destination before handoff. The handoff audit is a read ("Read the briefs as an implementer", `AK/skills/chart-issues/assets/shapes.md:170`). It runs nothing and counts nothing. So an oversized leaf (45) and a criterion that is red on base (47) both pass it. Seed 46 is separate (pi harness), but leaf size multiplies its cost: 11 long workers at `max` effort give 11 chances to hit a 503.

Smallest change that removes the class: extend the existing handoff audit with two facts taken from the live destination (F1, F4 below), and make a provider failure resumable in pi (F7). No new phase, command, state field or clock.

## Seed 45: leaf too big

Findings
- F1. No size rule exists. The split rule is by destination and independence only (`AK/skills/chart-issues/SKILL.md:41`, `shapes.md:118`). Seed framing is right.
- F2. The size was visible at handoff. `LEAF/brief.md` has 11 criteria, 9 scripts, edits in 3 skills. `LEAF/design.md` is 381 lines. Merged siblings: emdash-kit 8 criteria/278 lines, access-gate 6/139. `emdash-launch` is next with 16 criteria, so this will repeat.
- F3. The brief template already has a unit size rule (about N files, M turns, `AK/skills/implement-issue/brief-template.md:33`). It applies to worker units, never to the leaf.
- F3b. The spine rule pulls toward big leaves: one stage owner per leaf (`shapes.md:172`), and stage 1 here is six scripts (`FW/issues/chart/emdash-cms/CHART.md:50`).
- F3c. Correction to the seed: the 8h28m is mostly worker deaths, an operator stop (`LEAF/implementation/stop-note.md`) and U11 parity work. Size alone did not cause it. Review itself took 9 minutes.

Forks
- Q1. Where does the size rule live? O1 (recommended): one sentence in chart-issues Drain plus the handoff audit. A leaf is one independently checkable outcome. The audit splits a leaf whose criteria prove separable outcomes into chained leaves (blocked-by). O2: a hard numeric cap in `akrogon preflight`. Reject: it is a format check on prose and conflicts with the operator's function-over-form rule. O3: plan.synthesis fails an oversized leaf. Reject: detection comes after handoff and costs a failed pass.
- Q2. What is the size signal? Recommend a judgment trigger with a stated number as a prompt, not a gate: more than about 8 criteria, or more than one new script group plus cross-skill edits, forces the split question in the handoff review. The operator sees the answer.
- Q3. Does a spine stage have to be one leaf? Recommend no: a stage can be built by chained leaves, and the last one owns the spine criterion.

Pitfall: splitting adds a plan/review/merge cycle per leaf (kit took 8h for 8 criteria with 2 fix rounds). The split only pays when parts are independently checkable and dependents can start on the first part. Here `emdash-content-fixes` and `emdash-offer-join` need only parts of conversion.

## Seed 46: workers die on 503 with no report

Findings
- F5. The parent does get a result: `failed`, the 503 text and a transcript path (`PI/completion.ts:200-205`, `PI/manager.ts:845-850`). It gets no report and cannot continue that child.
- F6. pi core retries a retryable error 3 times with 2s base delay (`PI/node_modules/@earendil-works/pi-coding-agent/dist/core/settings-manager.js:592-597`, `agent-session.js:430,2287`). Children use default settings (`PI/child-session.ts:583`). That is about 14 seconds of cover. An overload lasting longer kills the child. Not verified: that the meta 503 text matches the core's retryable pattern.
- F7. No resume exists. The tools are spawn, wait, cancel, check, list, reply (`PI/tools.ts:140-242`). Reply only answers a child question. A failed child is terminal, so its whole context is lost.
- F8. akrogon then prescribes the expensive path: A inspects the worktree and writes a new remainder brief (`AK/skills/implement-issue/worker-protocol.md:17`). This rule merges three different stops: turn budget, output limit, provider failure. For a provider failure the original brief is still correct and the child transcript still holds the context.
- F9. Seed framing mixes two things. U5, U7, U11, U11r are provider deaths (3 of them confirmed in the seat session log, sa-5, sa-9, sa-14). U6r and U8r are missed criteria, which is the normal mismatch path (`worker-protocol.md:13-15`) and is not a defect.
- F10. Workers commit only at the end (`worker-protocol.md:11`). U7 lost 1,270 uncommitted lines of state certainty when it died.

Forks
- Q4. Who owns recovery? O1 (recommended): pi-extensions adds resume of a failed child from its transcript in its retained worktree (a `subagent_resume`, or spawn with a prior transcript). akrogon changes one sentence in `worker-protocol.md:17`: a provider-failed worker is continued in the same worktree with the same brief, and a remainder brief stays only for turn-budget and output-limit stops. O2: akrogon only, re-delegate the same brief in the retained worktree with one line "continue from `git status`". Works on every harness today, loses child context. Take O2 now if O1 is slow to land. O3: raise pi retry count and backoff for children. Cheap, do it too, but it only stretches the window.
- Q5. Wait out an overload? A longer provider backoff inside pi is a retry of an external API, not an akrogon clock, so I read it as outside the no-watchdog lock. Saying so because it is close to that lock.
- Q6. Should A stop the wave after repeated provider failures? Recommend: the second provider failure of the same unit ends the pass `failed` with the provider named (existing mechanism, `AK/skills/implement-issue/SKILL.md:31`). U11 died, U11r died, and a third run was started.
- Q7. Should workers commit as steps land? Recommend yes, one sentence in `worker-protocol.md:11`. A dead worker then leaves commits, not a dirty tree to audit.

Pitfalls: a resumed child can replay a half-applied edit, so resume must start with `git status` in the worktree. Pi keeps at most 128 child records per parent (PI/README.md:64).

## Seed 47: handoff with C1 red on base

Findings
- F11. Root cause is at charting, not at implement. `LEAF/brief.md:26` requires `bun run framework:verify` to pass. That command is not in the framework `checks` config (parity, contracts, test, test_changed, selftest). The merge gate runs only `checks` (`AK/skills/merge-issue/SKILL.md:33`). So base can be red on lint and `skills:typecheck` forever, and it is (`LEAF/implementation/report.md:27-29`).
- F12. The criterion is outside the leaf's ownership, which the brief shape forbids ("concrete check executable inside this leaf's ownership", `shapes.md:132`). The audit that should catch it only reads (`shapes.md:170`).
- F13. This is the third recorded case. FW lesson dated 2026-09-13 (`FW/learnings/LESSONS.md:38`) names the exact class. emdash-kit hit it on AC8, B refused the lesson as a waiver, the leaf went `failed`, and the operator ruled by hand (`FW/issues/open/emdash-cms/emdash-build/emdash-kit/review-A.md:43`, `review-B.md:201`). Lessons are observations, not rules (`AK/skills/plan-issue/SKILL.md:27`), so nothing carried the ruling forward. `emdash-launch/brief.md:84` has the same criterion and will fail the same way.
- F14. Implement has no rule for a criterion it cannot meet. It is told to report "unverified criteria" (`AK/skills/implement-issue/SKILL.md:46`), and A wrote "None" plus "modulo base red" (`report.md:69`). Review B was correct to block under the fix-bar lock (`AK/skills/check-issue/SKILL.md:49`). In check.fix A wrote "Documented, not repaired" (`LEAF/plan.md:133-136`), which guarantees B blocks again.
- F15. Part of F1 was real and owned by the leaf: test residue in a fixture `node_modules` broke the mojibake scan (`LEAF/review-B.md` Verification). So "all base" was wrong.

Forks
- Q8. How does charting stop this? O1 (recommended): extend the Take operation-proof rule (`AK/skills/chart-issues/SKILL.md:53`) to done-criteria. Every command a criterion names is run once on the destination base before handoff, and the result is recorded. Red on base gives two allowed outcomes: a prerequisite leaf that greens the base (blocked-by), or the criterion is rewritten to a check the leaf owns. O2: allow "no new failures versus base" criteria. Reject as a default: it needs a baseline diff, a judgment every review, and it is how emdash-kit looped.
- Q9. What does implement do when a criterion is unmeetable anyway? Recommend: it ends the pass `failed` naming the locked criterion (`implement-issue/SKILL.md:32` already covers "a fix that needs a locked decision changed"). One sentence makes it apply at implement, before handoff. This keeps the fix-bar lock intact and costs zero review rounds.
- Q10. Framework repo: put `framework:verify` in `checks`, or stop citing it in briefs? Recommend green the base once, then add it to `checks`. Then merge keeps base green and the class cannot recur there. Owner: framework.

Pitfall: a base check run at handoff goes stale if another leaf merges red before this leaf starts. Q10 closes that. Plan-issue already maps each criterion to a proof command (`AK/skills/plan-issue/SKILL.md:57`), so a second cheap catch point is plan.synthesis running that command on base, if the operator wants it.

## Owners

- akrogon: Q1-Q3 (chart-issues SKILL.md, shapes.md), Q4 protocol sentence, Q6, Q7 (worker-protocol.md), Q8 (chart-issues Take and audit), Q9 (implement-issue). All are wording changes in skills. No `src/` change.
- pi-extensions: Q4 O1 resume of a failed child, Q4 O3 child retry settings.
- framework: Q10 green base plus `checks`, and re-chart `emdash-launch` (16 criteria, same C10 `framework:verify` criterion, `FW/.../emdash-launch/brief.md:84`).

## Practitioner questions

- PQ1. What is the usual unit of independently mergeable work? Trunk-based practice says small batches that merge in about a day. Source to fetch before the Q2 round: DORA "working in small batches", Google eng-practices "Small CLs".
- PQ2. How do agent harnesses recover a worker after a provider error: resume the session or restart from repo state? Check the pi core docs for session resume, and how the codex and claude harnesses do it, before the Q4 round.
- PQ3. Is a red main ever acceptable as a merge base? Standard practice is no (green-main rule). That supports Q10.

## Live leaf: what to do now (outside this chart)

State read 2026-10-01: phase `check.fix`, round 1 of 3, A busy since 03:00Z. Lane head `d0979559c` has fix-A, fix-B, fix-C. Worktree `emdash-conversion-ufix-d` is still open for fix-D.

- A1. Let fix-D finish. Do not split this leaf now: 193 files and 12,795 lines are already written and reviewed once, and 8 of 9 findings are real repairs in progress.
- A2. Settle C1 before A hands back to B. Otherwise B blocks on F1 again and burns round 2. Options: (a) the operator greens `lint` and the 2 `skills:typecheck` errors on framework main, then the leaf rebases. This is the only option consistent with the fix-bar lock. (b) The operator edits `LEAF/brief.md` criterion 1 on main to drop `framework:verify` or scope it, as was done by hand for emdash-kit. Recommend (a): it also unblocks `emdash-launch` and is Q10.
- A3. If A reaches check.review with C1 still red, expect `failed` or another fix round. The failed-leaf-routing lock sends it to the operator. Decide A2 first.
- A4. Before `emdash-launch` leaves plan.synthesis, re-chart it under Q1 and Q8. It is larger than this leaf by criteria count and carries the same base-red criterion.
