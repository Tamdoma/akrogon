# Intake: night-flow

## Scope
Destination: work keeps moving overnight in every registered repo; a leaf ends in `failed` only when a human is genuinely needed, and no repo-wide stop exists. One chart in akrogon, one issue, parallel leaves (proposed 2026-10-11, no objection): hold-retire, plan-not-cap, guard-at-creation, pre-merge-red, seat-retry, locked-setting-proof, plus the keep-running fork's leaves.

## Provenance
- GitHub: Tamdoma/akrogon#79
- GitHub: Tamdoma/akrogon#80
- GitHub: Tamdoma/akrogon#81
- GitHub: Tamdoma/akrogon#82
- GitHub: Tamdoma/akrogon#83
- GitHub: Tamdoma/akrogon#84
- GitHub: Tamdoma/akrogon#85
- Operator: chart-issues open note, 2026-10-11 ~05:37Z
- Operator: mid-pass note on leaf-env-file, 2026-10-11
- Operator: forwarded analysis from the watch-akrogon session, 2026-10-11

## Source: Tamdoma/akrogon#79
# A leaf's live proof rig needs no fast tests before it runs live: formspark-build-wiring spent about 12h in check.fix on rig bugs

Source: Tamdoma/akrogon#79
URL: https://github.com/Tamdoma/akrogon/issues/79

Unverified intake.

## Observation
`formspark-build-wiring` (Tamdoma framework repo, 2026-10-10) proves its done-criteria with a new proof rig: about 2,000 lines in `.claude/workflow/scripts/run-formspark-build-wiring-proof.ts` plus `lib/blueprint-run.ts` and `lib/blueprint-fixture.ts`. Each case starts a real `claude -p` build, `validation/form-integration` and a headless browser submit to Formspark. One case takes about 15 to 30 minutes.
Review B found rig bugs one live round at a time: F7 (proof accepts transcript text instead of the declaration artifact), F8 (pending proof cannot clean up its form), F9 (direct Playwright import against the browser policy), F10 (synchronous browser commands block the rig's own HTTP server), F11 (fill ignores the supplied label and email), F12 (submission evidence invents provider status). B repaired F10 and F11 locally with fail-first tests in seconds (`implementation/repair-B-F10-*.log`, `repair-B-F11-*.log`), but nobody could confirm them until A reran a live case.
Time in `issues/log.jsonl`: check.fix 10:21 to 14:44 (4h23m), 15:03 to 18:53 (3h50m), and a third round from 19:02 that was still running after 4h. Phase history shows 3 check.repair to check.fix trips. Across the 357 leaves in the log (2026-09-11 to 2026-10-10), 187 had a check.fix phase totalling 176h, median 0.39h, and 9 leaves spent 4h or more there totalling 70h. Whether those 9 all built live rigs was not checked.

## Location
akrogon check.repair and check.fix phases and the chart rules for slow or live-run leaves: `skills/check-issue/SKILL.md` (check.repair), `skills/implement-issue/SKILL.md` (proof order), `skills/chart-issues/assets/standing-design.md`.

## Reproduction
Not provided as a minimal case. Seen on `formspark-build-wiring`; frequency across other leaves not verified.

## Expected behavior
A leaf that builds its own live proof rig gets fast tests for the rig's own parts (server, fill, request capture, cleanup, evidence parsing) passing before any live run, so rig bugs are caught in seconds and not by 15 to 30 minute rounds plus a B re-review.

## Urgency
Costs seat A hours per slow leaf, and B re-review rounds follow each new rig bug. Rough estimate, not measured: 2 to 4h saved on each slow live-rig leaf, little for a typical leaf. Workaround: the operator steers seat A to test rig parts locally first.

## Suspected cause
Agent hypothesis: no rule requires tests for the proof rig itself. #75's fix (`975139d`) added chart-time rules: cheapest sufficient proof per criterion, a live run names what no smaller test could prove, and a slow or live-run leaf fixes another leaf's bug with a fail-first test in the owning code's own tests. Those rules govern charting and apply to leaves charted after that change. `formspark-build-wiring` was planned at 11:41 before it. Contributing: check.repair hands required live runs to A (`skills/check-issue/SKILL.md` check.repair; design in `issues/closed/reviewer-repair/b-repair-phase`), and the leaf's Formspark grant names the leaf implementer as principal, so B's local repair cannot be confirmed live until A reruns it. Reporter and agent view.
Files read: `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/chart-issues/assets/standing-design.md`, `skills/chart-issues/assets/shapes.md`, `issues/closed/reviewer-repair/b-repair-phase/{brief,design}.md`, and in the framework repo `issues/open/formspark-api/formspark-build-wiring/{review-B.md,implementation/report.md,readiness.yaml}` and `issues/log.jsonl`. The framework repo files are the leaf's own state, not akrogon source.
Not inspected: the other 8 leaves with 4h or more in check.fix, and whether a rule on rig tests would conflict with the standing-design proof order. Would disprove: slow leaves whose time went to something other than rig bugs.
Related reports: Tamdoma/akrogon#75 (closed, chart-time live-run budget, does not cover the rig itself), Tamdoma/akrogon#77 (re-entering check.review reuses base-red evidence, same leaf), Tamdoma/akrogon#78 (busy-seat duration noticed only in `next`, same leaf).

## Source: Tamdoma/akrogon#80
# Self-update skips with "diverged from origin/main; 26 behind" after a local-only handoff commit, so the akrogon checkout stops deploying until the operator runs akrogon sync by hand

Source: Tamdoma/akrogon#80
URL: https://github.com/Tamdoma/akrogon/issues/80

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation
2026-10-11, in the akrogon checkout (`/home/ivan/Work/infra/akrogon`), `akrogon next leaf-env-file` printed `self-update skipped: diverged from origin/main; 26 behind origin/main; run akrogon sync` and nothing else changed. Local main had one commit that origin/main lacked, `c2fb9a9 worktree-isolation: hand off 5 akrogon leaves; hold main-health-from-framework`. `git rev-list --left-right --count HEAD...origin/main` gave `1 26`. The checkout is the program the operator runs, so the 26 landed commits (including skill changes) were not deployed. The operator's reaction: "This should be automated."

## Location
`src/self-update.ts:47` (the `ahead > 0` skip), `src/sync.ts`, `docs/guide/install.md:40` ("You still act when the line reports the checkout is ... ahead of or diverged from the remote (run `akrogon sync`)"). Workflow: chart handoff, then `akrogon next` / `next --all` / `next --resume` / merge wake.

## Reproduction
1. Hand off leaves from a chart so the akrogon checkout gets a local commit under `issues/`.
2. Let other work merge to origin/main so the checkout is also behind.
3. Run `akrogon next <slug>` for a leaf in the akrogon repo.
Seen once. Frequency otherwise not provided, but step 1 happens on every chart handoff, so it should recur whenever origin/main moves before the local commit is pushed.

## Expected behavior
Deploying landed work to the akrogon checkout needs no operator step. A local-only commit of issue records should not stop the checkout from picking up origin/main. The operator asked for this to be automated.

## Urgency
Medium. While diverged, every trigger skips the deploy and prints the same line, so new skills and code that landed on main are not in use, and a seat can run against stale skills. Workaround: run `akrogon sync` by hand.

## Suspected cause
Agent view. `selfUpdate` only fast-forwards (`git merge --ff-only`) and treats any `ahead > 0` as a skip, even when the ahead commits are only issue records that `akrogon sync` already knows how to commit, rebase onto the fetched branch and push. Handoff leaves the checkout ahead, so divergence returns after each chart handoff while origin/main moves. The skip is documented as intended in `docs/guide/install.md:40`, so this is a design gap, not a regression.
Files read: `src/self-update.ts`, `src/sync.ts`, `docs/guide/install.md`. In the skip path the code still runs `bun install --frozen-lockfile` and the link reconciliation against the stale tree (read, not run).
Not verified: whether `c2fb9a9` was pushed or why it stayed local, whether `sync` is safe to run from inside the self-update lock, and what happens when the local-only commits touch non-issue paths.
Related reports: none found (searched `Tamdoma/akrogon`, all states, keywords "self-update diverged", limit 10; the filing account's reports since 2026-10-09 were also checked).

## Source: Tamdoma/akrogon#81
# copyfile-install failed at check.fix because locked decision install-sharing 1a names a bunfig key that bun 1.4.2 ignores; the charted proofs only ran the CLI flag

Source: Tamdoma/akrogon#81
URL: https://github.com/Tamdoma/akrogon/issues/81

Unverified intake.

## Observation
Leaf `copyfile-install` (repo framework, worktree-isolation) moved to `failed` at `check.fix` (cause `blocked`, fix round 1) and stayed failed about 7 hours (akrogon status AGE 432m). Seat A's stop note says locked decision install-sharing 1a ("repo `bunfig.toml` sets `[install] backend = \"copyfile\"`") cannot work: bun 1.4.2 has no such key. A flagless `bun install` with that key produced files with link count above 1 (134 files in a scratch root, 55,006 in the worktree), `backend = "bogus-nonsense"` installed identically with no parse error, and only `--backend=copyfile` produced link count 1. The operator reconciled the design, brief and `setup` to the flag form by hand on 2026-10-11 and resumed the leaf with `akrogon phase copyfile-install check.fix`.

## Location
Framework repo chart `issues/chart/worktree-isolation` (fork `forks/install-sharing.md`, decision 1a), leaf `issues/open/worktree-isolation/copyfile-install` (design.md, brief.md criterion 1, plan.md D1, implementation/report.md "check.fix stop"). Skills involved: chart-issues (decision lock) and plan-issue.

## Reproduction
Not provided as a command beyond the seat's finding. The chart's proof table (`forks/proofs.md`) shows P5 ran `bun install --backend=copyfile` and P7 ran `bun install --frozen-lockfile --backend=copyfile`, both with the CLI flag. Decision 1a then locked the bunfig form, and the plan (D1) and brief criterion 1 ("no backend flag") followed it.

## Expected behavior
A locked decision whose mechanism is a third-party tool setting is exercised in the exact form the decision names before it is locked, so an unsupported setting is found at chart or plan time.

## Urgency
One leaf failed and sat about 7 hours until an operator edited the design and config by hand. The same leaf used a review and fix round before the gap surfaced. Workaround: the operator reworded the decision to the flag form.

## Suspected cause
Agent view: the chart proved the capability (copyfile reflinks, link count 1) with the CLI flag, then locked a different mechanism (a bunfig key) without a proof of that mechanism. No step in the chart or plan phases requires the exact configuration form of a locked decision to be run once and recorded, so the unproven form passed through chart, plan, implement and review until check.fix tried it.
Files read: chart `CHART.md`, `forks/install-sharing.md`, `forks/proofs.md`, leaf `design.md`, `brief.md`, `implementation/report.md`; akrogon `skills/plan-issue/SKILL.md` and `skills/chart-issues/assets/standing-design.md` (grep for verify/probe wording only, no such step found there). These are the destination sources for the skill text; the chart and leaf files are framework-repo artifacts.
Not inspected: the full text of `skills/chart-issues/SKILL.md` and its other assets, which may already contain a related step that was missed by the grep; whether bun later versions honor the key.
Related reports: none found. Searched Tamdoma/akrogon, all states, with the filing account's reports from the last two days (limit 30, #73 to #80 listed, none about this) and keyword searches "locked decision verify" and "plan tool config assumption" (both returned `[]`).

## Source: Tamdoma/akrogon#82
# Fix-round cap sends a leaf to failed with no cap decision asked: leaf-env-file went F1, F2, F3 across 3 repair rounds and sat failed about 6.4 hours

Source: Tamdoma/akrogon#82
URL: https://github.com/Tamdoma/akrogon/issues/82

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation
Leaf `leaf-env-file` (issue `worktree-isolation`, repo akrogon) went `implement`, then three `check.review` -> `check.repair` -> `check.fix` rounds (`issues/log.jsonl`, 2026-10-10 22:27Z to 22:56Z). Each round B found one more defect in the same area (F1, F2, then F3). At `fix_rounds` 3, `check.repair` -> `failed` with `cause: attempts`, reason "fix rounds exhausted", at 22:56:46Z. It stayed failed until an operator recovery at 05:19:36Z and four dependent leaves waited. Head at failure: `a7f589b506be3c9ab24b9465a526b61bf074e56d`; F3 was the only open Fix and B's report spells the repair out.

## Location
`fix_rounds` in `issues/config.yaml`, the `check.repair` -> `check.fix` cap, `docs/guide/phases.md:108`, leaf `issues/open/worktree-isolation/leaf-env-file/review-B.md`.

## Reproduction
Seen once. A leaf whose reviewer finds a new defect in each repair round reaches the cap with a small, concrete Fix still open. Frequency otherwise not provided.

## Expected behavior
Reaching the cap with a concrete Fix still open asks the operator for a cap decision (raise it, accept the head, or stop) and says so, instead of ending in `failed` that looks like any other failure.

## Urgency
Medium. About 6.4 hours of idle wall time and four blocked leaves. Workaround: raise `fix_rounds` in `issues/config.yaml` and run `akrogon phase <slug> check.repair`.

## Suspected cause
Agent view. The cap is a fixed count of A repair handoffs, so a leaf that is converging by one finding per round is treated the same as a leaf that is looping. `failed` is the only terminal state the cap can reach, and nothing in the failure record says the remaining work is one named Fix. Related condition: the plan rule behind the defects was itself wrong (see the filed report on plan-level defects in check.repair).
Files read: `issues/log.jsonl` (leaf-env-file records), `review-B.md`, `docs/guide/phases.md:76,108`, `issues/config.yaml`.
Not inspected: `src/phase.ts` cap enforcement, whether the open Fix count is available at the cap.
Related reports: Tamdoma/akrogon#72 (closed; merge bounces now count toward the cap), none found that cover a cap reached while converging.

## Source: Tamdoma/akrogon#83
# A check.repair finding that rests on a false plan rule is patched in code three rounds in a row: leaf-env-file D3 claimed double quote plus carriage return is unwritable, and only B found it in the last round

Source: Tamdoma/akrogon#83
URL: https://github.com/Tamdoma/akrogon/issues/83

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation
Leaf `leaf-env-file` (repo akrogon, 2026-10-10/11). B's last `check.review` (head `a7f589b`) showed that plan rule D3 is false: a source with a double quote plus a carriage return can be written as a double-quoted dotenv assignment and `parseEnv` reads it back identically (B ran a probe: `candidateEqual: true`). The repair had turned the old refusal into a replacement refusal fixture that asserts the false rule. Plan changes belong to A in `check.repair`, so each earlier round patched the encoder and tests against D3 instead of correcting it. The leaf then hit the fix-round cap with D3 still wrong.

## Location
`issues/open/worktree-isolation/leaf-env-file/plan.md` (D3), `review-B.md`, the `check-issue` and `implement-issue` skills (check.repair handoff to A).

## Reproduction
Seen once. Frequency otherwise not provided.

## Expected behavior
When a finding contradicts a plan rule or a locked decision, the first handoff to A names the plan rule as the thing to correct, with the evidence, so the plan and the code are repaired together in one round.

## Urgency
Medium. It consumed the whole fix-round budget of the leaf. Workaround: operator or A edits the plan rule by hand before the next repair.

## Suspected cause
Agent view. The round-1 and round-2 findings were about behaviors the plan rule produced, so the review treated them as code defects, and the plan rule was only questioned once B built a probe against the real emitter in round 3. No step asks whether a repeated finding in the same area points at the plan. Related condition in another repo: Tamdoma/akrogon#81, where a locked decision named a setting the tool ignores and the leaf failed.
Files read: `review-B.md` (final sections), `issues/log.jsonl`.
Not inspected: `plan.md` D3 text itself, rounds 1-2 reviews in full.
Related reports: Tamdoma/akrogon#81 (open, a locked decision that cannot work), none found for plan rules contradicted during repair.

## Source: Tamdoma/akrogon#84
# A failed leaf sits unnoticed overnight: the failure notice is one desktop notification and the operator watch is session-only, so leaf-env-file waited 6.4 hours with four leaves behind it

Source: Tamdoma/akrogon#84
URL: https://github.com/Tamdoma/akrogon/issues/84

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation
`leaf-env-file` failed at 2026-10-10 22:56:46Z (`delivery: shown`) and was only recovered at 2026-10-11 05:19:36Z, about 6.4 hours later, after the operator asked. `base-run` and `worktree-reconciler` were blocked on it throughout. The only operator signal was the single `shown` notification at failure time. The operator watch (a Claude Code cron job running `/watch-issues tick`) was not running: it is session-only, was deleted when the open tree read empty, and the `worktree-isolation` leaves were handed off after that, with nothing re-arming it.

## Location
Failure delivery (`failure.delivery`, `herdr notification show`), the `watch-issues` skill (stop rule, session-only cron), `akrogon status`.

## Reproduction
1. Let a leaf fail while the operator is away.
2. Do not have a live watch (session ended, or the watch stopped on an empty tree and new leaves were handed off after).
3. Check `akrogon status` hours later.
Seen once. Frequency otherwise not provided.

## Expected behavior
A failed leaf that needs the operator keeps asking until acknowledged, or the next `akrogon next`, `status` or handoff surfaces it prominently, and a charted handoff in a repo with no live watch says so.

## Urgency
Medium. Hours of idle time per occurrence, and every dependent leaf waits. Workaround: run `/watch-issues` again or read `akrogon status` by hand.

## Suspected cause
Agent view. Delivery is recorded as done once the notification is `shown`, which counts as handled even if nobody saw it, and the only recurring check lives outside akrogon in a session-scoped job. Contributing condition: the watch's stop rule can delete the job right before new leaves arrive.
Files read: `issues/log.jsonl`, `akrogon status` output, `observe.ts` output; the `watch-issues` skill text.
Not inspected: `src/status.ts` and the notification code path.
Related reports: Tamdoma/akrogon#19 (closed, blocked question stalls silently), #11 (closed, notification dedup), #25 (closed, watch-issues skill), none found for a failed leaf with no live watch.

## Source: Tamdoma/akrogon#85
# Recovering a leaf at the fix-round cap does not grant the extra repair the docs promise: check.fix was refused 28 seconds after akrogon phase leaf-env-file check.repair

Source: Tamdoma/akrogon#85
URL: https://github.com/Tamdoma/akrogon/issues/85

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation
`docs/guide/phases.md:76` says recovery keeps `fix_rounds`, "so a leaf failed at the cap gets one more A repair and a B-only re-check on each recovery". On 2026-10-11 05:19:36Z `akrogon phase leaf-env-file check.repair` moved the leaf out of `failed` (`fix_rounds` 3, head `a7f589b`). B read the state, handed F3 to A, and ran `akrogon phase leaf-env-file check.fix --slot B`, which returned `moved failed` at 05:20:04Z, 28 seconds later. B's report says "the command enforced the configured repair cap" and "the required check.fix request is therefore still subject to the exhausted cap". Raising `fix_rounds` to 4 in `issues/config.yaml` and resuming moved the leaf to `check.repair` again with seat B working.

## Location
`docs/guide/phases.md:76,108`, the `check.repair` -> `check.fix` transition and its cap check (probably `src/phase.ts`), `issues/log.jsonl` records at 05:19:36Z and 05:20:04Z.

## Reproduction
1. A leaf fails with `fix_rounds` equal to the configured cap at `check.repair`.
2. Run `akrogon phase <slug> check.repair`.
3. Seat B hands the open Fix to A with `akrogon phase <slug> check.fix --slot B`.
Seen once, in this leaf. Frequency otherwise not provided.

## Expected behavior
Either recovery allows one repair handoff past the cap as the docs say, or the docs say recovery needs a higher cap and `akrogon phase <slug> check.repair` on a capped leaf refuses with that message.

## Urgency
Low-medium. One recovery cycle wasted, and an automated watch counts it as an unproductive cycle toward its two-cycle limit. Workaround: raise `fix_rounds` first.

## Suspected cause
Agent view and reporter view: the cap check at the `check.repair` -> `check.fix` move compares `fix_rounds` with the configured cap and has no recovery allowance, so the documented behavior is not implemented or the doc is out of date.
Files read: `docs/guide/phases.md`, `issues/log.jsonl`, `review-B.md`.
Not inspected: the code that enforces the cap, tests covering recovery at the cap.
Related reports: none found (searched Tamdoma/akrogon, all states, "recovery fix_rounds", "fix_rounds cap failed"; #72 concerns merge bounces).

## Source: operator chart-issues open note, 2026-10-11
I just pulled more issues from the repos that made this night miserable when it comes to merging. Why were all these things stalled, blocked and failed. Please do a deep systems thinking analysis (stock and flow problems, reinforcing and balancing feedback loop problems, sensor and target problems, etc) along with slot b and slot c which are active panes in your herdr tab. We need to make sure things are moving and are automated without having failed issues or stopped processes for me in the morning. I only need the most elegant solutions that are holistic, that will simplify things and make them move much faster. Has anything we have merged in the last 48 hours worsen the whole situation?

## Source: operator mid-pass note, 2026-10-11
Look at the leaf-env-file. It's consistently failing as well. That's also probably systemic, so include it into your analysis for simplification.

## Source: operator-forwarded watch-akrogon analysis, 2026-10-11
# Forwarded at the operator's request by session watch-akrogon, 2026-10-11 (verbatim)

Systemic analysis from watch-akrogon: why leaf-env-file failed twice at the fix-round cap, and what in akrogon could be simplified. The operator asked me to send this to you. Evidence is from issues/log.jsonl, leaf-env-file review-B.md, plan.md D3 and git history in issues/worktrees/leaf-env-file. Filed seeds: Tamdoma/akrogon#80 (self-update skips on a diverged checkout), #82 (cap ends the leaf in failed), #83 (repairs patch code against a false plan rule), #84 (failed leaf unnoticed overnight), #85 (recovery at the cap grants no repair, unlike docs/guide/phases.md:76).

WHAT HAPPENED
Brief criterion 1 needs every declared value copied exactly. Plan rule D3 met it with hand-written rules about which characters each dotenv quote style allows. Each of 4 repair rounds: B probed and found one value the rules got wrong, A patched that case and often added a new refusal, and next round B proved the new rule wrong too (F1, F2, F3, F4 with S6-S8). D3 grew to about 10 exceptions. It failed at fix_rounds 3, sat about 6.4h overnight, failed again at 4. I replaced D3 with a parser-checked rule: try fixed candidate encodings, keep the first one that parseEnv reads back exactly in an adversarial context, then check the whole file. Measured over 41,371 values: zero mismatches, 11.4% refused. I raised fix_rounds to 6 and resumed it.

STOCKS
- S1 Plan error (wrong rules in plan.md). Inflow: synthesis and repairs that add rules. Outflow: none in the lifecycle. Only a human or a lucky A edit drains it.
- S2 Open Fix findings. Outflow: one per round, because B finds one counterexample at a time.
- S3 Repair budget (fix_rounds).
- S4 Failed leaves waiting on a human, plus blocked dependents.
- S5 Checkout divergence (local handoff commits against origin/main).

LOOPS
- R1, reinforcing, bad (patch-adds-rules): a Fix that rests on a wrong plan rule gets fixed in code by adding a rule or refusal. That adds surface for the next counterexample, so each repair grows S1, which feeds S2. The loop grows the stock it should drain.
- B1, balancing on the wrong variable (cap): fix_rounds limits the count of handoffs, not convergence. It stops a converging leaf the same as a looping one, and its only output is failed, which moves the problem into S4. So it balances work spent, not correctness.
- Missing B2 (plan correction): nothing routes "this finding contradicts a plan rule" back to re-planning. check.repair says plan changes belong to A, but check.fix is a code pass. S1 has no outflow.
- Oracle gap: for a criterion that covers every input ("exactly the values"), the reviewer's case hunt is the only test. That fixes S2's drain rate at 1 defect per round no matter how big the defect space is. A has no executable check to run before handing back.
- B3 notification measures the wrong thing: delivery=shown counts as handled whether or not anyone saw it. The watch is session-only, and its stop rule can delete the job right before a new chart handoff arrives. S4 drains only by luck.
- R2 divergence (#80): each chart handoff commit adds to S5, self-update only fast-forwards, so the checkout stops deploying until someone runs akrogon sync by hand.

SIMPLIFICATIONS THAT REMOVE THE PROBLEM CLASS (my view, not verified against the akrogon code)
1. Replace the cap's meaning: a second Fix in the same area, or any Fix whose evidence contradicts a plan decision, moves the leaf to re-plan that decision (plan.synthesis on the named D) instead of check.fix. This gives S1 an outflow, cuts R1 at round 2, and makes the cap a backstop instead of the main stop. It may let the cap logic shrink.
2. Universal criteria need an oracle: plan-issue requires a self-checking test for any criterion that covers every input (round-trip, property, or the real parser as oracle), and A runs it before handoff. check-issue then judges the oracle and the plan, not just new cases. This raises S2's drain from 1 per round to bulk.
3. A failed leaf that needs the operator stays loud until acknowledged (or status and next list it first), instead of one shown notice.
4. Chart handoff pushes its commit, or self-update rebases issue-record-only commits the way sync does, so S5 cannot build up.

One related fact: Bun's own .env loader expands $NAME in every quote style, so any parseEnv-based fidelity rule differs from what Bun processes see for values containing $. All 2,293 Bun mismatches in my measurement contained $, zero without. I recorded it in plan.md as an out-of-scope limitation. Check-env and readiness both use parseEnv, so this may deserve its own seed.

The operator may want you to chart some of this. Pick whatever you think is the smallest set of changes.

## Source: operator note with framework session screenshots, 2026-10-11
"look at this situation in framework. This is a problem, probably a big one. Are we addressing that as well?"

Then: "I approve that, but see if can chart these off as well, and put them in as systemic fixes. Talk to slot b and c. This is not good."

Screenshot text from the framework session, transcribed (images: scratchpad images/9.png, 10.png):

> Both were blamed for red merges and failed because they used up their fix rounds (3 of 3). Reading why each one was red.
> Both failures are genuine conflicts with recently merged code: check-scratch's fixtures now get rejected by the newly merged root-influence check, and formspark-build-wiring hits a typecheck error from a new required dispose method plus its own lint issues. Both exhausted their 3 fix rounds and landed in failed, so I'll check how akrogon allows recovery from that state.
> Recovering both into check.fix, which is what each merge seat asked for. Their findings (F9, F15 to F17) are already in review-B.md for the A seat to fix.
> $ akrogon phase check-scratch check.fix 2>&1 | tail -3; akrogon phase formspark-build-wiring check.fix 2>&1 | tail -3; akrogon next --all 2>&1 | tail -4
>
> All three leaves (check-scratch, formspark-build-wiring, copyfile-install) are being fixed again, but they are on their last fix round. If one more check goes red, it fails again.
> Why they failed:
> - check-scratch: root-influence merged first, and main now correctly refuses test setups that point at a separate git checkout. check-scratch's new tests do exactly that, so 18 selftests failed.
> - formspark-build-wiring: main added a required dispose method, and its new code lacks it (a typecheck error). It also has 2 lint errors in its own code.
> - Fix-round limit: both bounced out of merge on round 3 of 3, so akrogon marked them failed instead of sending them back for a fix.
> What I did: moved both back to check.fix and dispatched them. All three A seats are working now: check-scratch and formspark-build-wiring just started, and copyfile-install is 14 minutes into its fix.
> Underlying problem: in akrogon, being bounced out of merge counts against the same 3-round limit as review fixes (src/phase.ts:308-313). Every sibling that lands changes main, and the next leaf can break on it through no fault of its own. Each of these three has now used all 3 rounds, so the next red check fails it.
> Decision needed:
> - O1 (recommended): give merge bounces their own counter in akrogon, separate from the review fix limit. A leaf broken by a sibling's merge then doesn't lose review rounds. It's a small change to phase.ts, plus a test.
> - O2: raise fix_rounds from 3 to 5 in the framework issues/config.yaml. It's one line and takes effect at once, but the same limit will hit again later.
> - O3: change nothing. I recover each one by hand when it fails.

## Source: operator-forwarded chart-framework notes, 2026-10-11
Operator message 1: "Note from chart-framework (operator asked to send now): merge ejections caused by main moving under waiting leaves, which the operator calls systemic. Read the last section of issues/chart/red-base-wait/slots/from-chart-framework.md (F1-F4, recommendation O3)."

Operator message 2: "Second note from chart-framework, operator asked to send it now: cheap merge checks (typecheck, lint) never run in a framework leaf's own check, only at merge. formspark-build-wiring passed its selftest, then was ejected at merge for typecheck and lint errors in its own code. This is not covered by night-flow sibling-breaks. Read the last section of issues/chart/red-base-wait/slots/from-chart-framework.md (F5-F7)."

Forwarded text, verbatim from `issues/chart/red-base-wait/slots/from-chart-framework.md:26-46`:

> ## Note from framework chart, 2026-10-11: merge ejections from a moving main
>
> The operator calls this systemic and asked for it to go to the akrogon chart now. Evidence is from framework, 2026-10-11.
>
> - F1: A leaf's checks run on the base it started from. It is rebased onto current main only inside the merge attempt (src/batch.ts:106).
> - F2: So conflicts with newly landed code first show up in a 10-minute merge run. root-influence merged at 07:25 (attempt 0fd25f81). check-scratch (56737d2e, F9: root-influence's new repo-root guard rejects its scratch git roots, 18 selftest fails) and formspark-build-wiring (662d9a76, F15: TS2741, the `dispose` method main added is missing) were both built on ee8255d and both ejected by 07:44.
> - F3: An ejection to check.fix uses the same fix_rounds counter as review fixes. At the cap the leaf goes to failed (src/phase.ts:308-313). Both leaves went to failed this way and were recovered by hand.
> - F4: Load makes it worse. 4 of the last 9 framework attempts were ejected.
> - O1: Before joining a merge, rebase the leaf onto current main and re-run its check in its own lane.
> - O2: Don't count ejections caused by main moving against fix_rounds.
> - Recommendation: O3, both. O1 does most of the work, and O2 stops a leaf from dying for a conflict it did not cause.
> - Unknown: whether formspark's lint errors F16/F17 (runner :1735, :1804) also come from F1 or are misses in the leaf's own check.
>
> ## Note from framework chart, 2026-10-11: cheap checks run only at merge
>
> The operator, verbatim in substance: the testing for these should come first, not wait till the end. Send to chart-akrogon slot A now.
>
> - F5: A framework leaf's own check runs only parity, contracts and selftest (framework issues/config.yaml `checks`). typecheck and lint run only at merge, inside framework:verify:cheap (framework package.json:163).
> - F6: formspark-build-wiring passed all 3540 selftest tests in its own check. It was then ejected at merge for one typecheck error (F15) and two lint errors in its own code (F16 runner :1735, F17 runner :1804, review-B.md:481-483). These took seconds to find, but only after review and a merge run.
> - F7: night-flow's sibling-breaks fork covers main moving under a leaf. It does not cover a leaf whose own check never runs the cheap merge checks. F16/F17 would have failed even on an unchanged main.
> - Ask: the leaf's own check should run every cheap merge check before review, so only slow or integration failures can reach merge. The framework fix may just be a `checks` entry for framework:verify:cheap. If akrogon should enforce "every merge check either runs in the leaf check or is declared slow", that belongs to your chart.

## Source: operator-run `akrogon sync` in framework, 2026-10-11
Operator ran `cd /home/ivan/Work/infra/tamdoma/framework && akrogon sync`. Output, verbatim:

```
error: {"command":["git","add","-A","--",":(top,literal)issues",":(top,exclude,literal)issues/seeds",":(top,exclude,glob)**/.lock"],"cwd":"/home/ivan/Work/infra/tamdoma/framework","code":1,"stdout":"","stderr":"The following paths are ignored by one of your .gitignore files:\nissues/seeds"}
      at command (/home/ivan/Work/infra/akrogon/src/shell.ts:110:32)
      at async <anonymous> (/home/ivan/Work/infra/akrogon/src/sync.ts:116:13)
      at async withLock (/home/ivan/Work/infra/akrogon/src/state.ts:216:18)
      at async syncCommand (/home/ivan/Work/infra/akrogon/src/sync.ts:9:9)
```

Operator, verbatim: "Why not use gacp then, fix akrogon sync now."

## Source: operator-forwarded chart-framework decision, 2026-10-11
Operator message: "Operator decision from chart-framework: cheap merge checks (typecheck, lint) in the leaf's own check should be an akrogon rule for every repo, not only a framework config line. See the last section of issues/chart/red-base-wait/slots/from-chart-framework.md."

Forwarded text, verbatim from `issues/chart/red-base-wait/slots/from-chart-framework.md:48-50`:

> ## Operator decision, 2026-10-11: cheap checks in the leaf check as an akrogon rule
>
> Operator, verbatim: "that should be akrogon rule too". Framework adds framework:verify:cheap to its `checks` as leaf L9. The operator also wants akrogon to require this for every repo: a merge check cheap enough to run in the leaf's own check must run there, before review.

## Agent findings
Territory map: slots/map-merged.md (A: slots/map-A.md, B: slots/map-B.md, C: slots/map-C.md; rebuttals slots/rebuttal-B.md, slots/rebuttal-C.md). Failure ledger since 2026-10-08: slots/failed-exits.tsv (43 transitions: 21 base-red, 5 round cap, 5 seat delivery, 11 human boundary, 1 seat misreading). Night findings F1-F7 and the 48h verdict are in the map; #79 is covered by test-proof-rules `732c896` (A,B,C).

`akrogon sync` failed in every repo with an `issues/seeds` folder since `fec7bc6` (2026-09-14): git refuses an exclude pathspec naming an ignored path. Fixed directly at the operator's request in `b5a8d11` (sync stages eligible records by path through `eligibleRecord`, `src/sync.ts:6-13`), pushed in `ec08dec`; framework synced in `c45d6693f`, carrying `fix_rounds: 8`. The records-sync draft's references to `src/sync.ts:22-31` now mean `eligibleRecord` (A).
