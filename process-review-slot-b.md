# Process review: slot B (reconstructed)

Slot B (codex, gpt-6-astra xhigh, session 01a09e97) ran the review in `process-review-prompt.md`, made 34 tool calls over 30 minutes, then got stuck compacting at 94% context before writing this file. This is a reconstruction from its session transcript at `~/.codex/sessions/2026/09/14/rollout-2026-09-14T08-25-22-01a09e97-...jsonl`. Its reasoning is encrypted in the log. What is here is its five progress notes quoted verbatim, the numbers its scripts printed, and the findings those two together support. Anything marked "inferred" is my reading of its data, not its words.

## Slot B's own notes, in order

1. "I'll read the review instructions, inspect the permitted evidence, and write only the requested report."
2. "The guide and current rules already disagree on `sync` and direct handoff. I'll use the command to establish enforced behavior, then check completed work for evidence that the extra rules helped."
3. "The logs contain 132 leaves. A and B differed on whether a fix was needed in 20 initial reviews, so the second review has measurable value. Phase durations include idle time and interruptions, which I'll separate from claims about model effort."
4. "B's chart review caught concrete contract problems, including a missing dependency and an impossible acceptance check. I also found completed leaves with blank report fields and charts marked handed off while still listing fog. I'm tracing which checks caught defects and which only added ceremony."
5. "I found a stronger problem with the stand-in pane: one session recorded B's repair, then A's approval of that repair. The same recovery rule also lets one session submit both initial reviews. I'll make that the main finding because it undermines the reason for having two slots."

## What it read

The prompt, all AGENTS.md files on the path, the guide pages (idea, parts, state, chart, next, files, merge, in-practice), `routing.ts`, every skill and asset, `next.ts`, `phase.ts`, `shell.ts`, `install.ts`, `init.ts`, `config.ts`, `status.ts`, the plugin, all three `log.jsonl` files, every closed `state.yaml`, the pull-close leaf end to end, one pi-extensions leaf end to end, `LESSONS.md` and `learnings/history`, and the git history of `chart-issues/SKILL.md` back to the versions with the fork cap and tiers.

## Numbers it computed

| Measure | akrogon | framework | pi-extensions |
|---|---|---|---|
| Log records / leaves | 181 / 33 | 484 / 95 | small / 4 |
| Implement median / worst | 6.6 min / 26 min | 15.4 min / 7.3 h (portal-activation) | |
| check.review median / worst | 1.7 min / 16 min | 4.0 min / 7.5 h (resume-state-retention) | |
| Merge median | 1.0 min | 2.1 min | |
| Paired initial reviews, exact agreement | 20 of 33 | 48 of 95 | 1 of 4 |
| Pairs where only one slot said fix | 2 | 17 | 1 |
| check.fix entered from merge vs from review | 10 vs 4 | 15 vs 24 | 0 vs 1 |
| Attempts at 3 | 3 records | 8 records | 0 |
| Failed | 1 (pull-close, plan.positions) | 2 (migrate-charts implement, unit-specs-lane plan.synthesis) | 0 |
| fix_rounds max distribution | 0:25 1:3 2:4 3:1 | 0:62 1:27 2:6 | |
| debate yes | 2 | 6 | 0 |
| hand_built | 2 (both bootstrap) | 0 | 0 |

Stand-in candidates it isolated (attempts reached 3 and the move was recorded by the other slot's pane): akrogon `status`, `pull-close`, `init-issues`; framework `run-trace-and-advance`, `batch-skills` (twice, review and fix), `retire-issue-scripts`, `migrate-charts`, `frontmatter-evidence-inputs`, `extension-schema-reuse`, `unit-specs-lane`.

Every debate leaf it checked had all four position and rebuttal files present (chart-issues, pull-close, test-runner-and-prune, batch-skills, injector-and-routes). Three framework leaves with `debate: yes` in state had none (browser-core-launch, objective-coverage-line, handoff-contract-slim), meaning the flag was set and the phase produced no files or the files were not kept.

## Findings

**F-B1 Stand-in seat (its stated main finding).** One session recorded B's fix and then A's approval of that fix in `batch-skills` (log lines 70 and 71, both A:1 B:3, same session `d450`). The same rule let one session submit both initial reviews in `run-trace-and-advance`. Its words: "undermines the reason for having two slots". Inferred verdict: drop.

**F-B2 Second review has measurable value.** 20 of 33 akrogon pairs and 47 of 95 framework pairs disagreed, and in 2 plus 17 of them only one slot saw a needed fix. Inferred verdict: keep two blind reviewers.

**F-B3 Guide and rules disagree on `sync` and direct handoff.** Its second note. It resolved the disagreement by reading the command as the truth. Inferred: guide text about `sync` and the old direct-handoff wording is stale against `requireCodeOnly` and the current chart skill.

**F-B4 Completed leaves with blank report fields.** `pi-extensions/issues/closed/tool-output-display/bash-row-renderer/implementation/report` lines 92 to 95 still read `Changed files and reasons: <paths and why>`, `Tests run: <commands and results>`, `Known limitations: <limitations or none known>`, `Unverified criteria: <criterion and why, or none>`. The leaf passed review and merged. Inferred: no gate checks that a phase artifact is filled in.

**F-B5 Charts marked handed off while still listing fog.** Its fourth note. Same observation as the fog gate finding in the claude report.

**F-B6 B's chart review catches contract defects.** "a missing dependency and an impossible acceptance check". Inferred verdict: keep B leaf review.

**F-B7 Merge is a larger source of fix rounds than review in akrogon.** 10 of 14 check.fix entries came from merge. It printed this as `REPAIR ENTRY SOURCES` in its last script and had not yet written a conclusion.

**F-B8 Phase durations include idle time.** Its third note. It separated wall clock from effort before making cost claims, and its worst-case intervals (7.3 h implement, 7.5 h review) are the stalled seats, not model work.

## Not reached

Slot B was still "tracing which checks caught defects and which only added ceremony" when it stalled. It had loaded the fork-cap and tier versions of the chart skill (`765905a`, `f89b8fa`) but recorded no conclusion on them. No keep-as-is list, no holes section, no numbered answers.

## Where it lines up with the claude report

Agrees: stand-in seat is the main defect (F1), two reviewers stay, fog at handoff needs a gate (F7), merge conflicts drive fix rounds (F2), artifacts with placeholders pass every gate (H2), stalled seats are the wall-clock cost (H1).

Adds: three `debate: yes` leaves with no debate files, and the guide versus rules gap on `sync`.

Differs on nothing it wrote down.
