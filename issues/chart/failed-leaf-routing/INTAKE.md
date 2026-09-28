# Intake: failed-leaf-routing

Provenance: Tamdoma/akrogon#33, imported 2026-09-28 from issues/seeds/33-watch-issues-idles-on-a-failed-leaf.md. Verbatim below.

## watch-issues idles on a failed leaf whose blocker names a fixable owner leaf, and never stops

Source: Tamdoma/akrogon#33
URL: https://github.com/Tamdoma/akrogon/issues/33

Unverified intake.

### Observation
In the framework repo, leaf `live-replay` (epic satellite-network-simplify) went to `phase=failed`. The failure was `failed=blocked@implement delivery=shown`, with the reason "live run blocked at content-prep by pre-existing pool-smell-vs-recorded-pools defect; owning leaf (content-batch or research-pools) must reopen first; see implementation/report.md".

The seat's report gave exact evidence:
- 4 `POOL_SMELL_FAILED` lines: 3 `^top-[0-9]+` slug bans on `topn_list` pools, and qa-questions repetition of 0.074 against a 0.05 limit.
- A reproduction that does not depend on live-replay.
- The offending data at `.claude/workspaces/seo/satellite-network/test/fixture-network/00-network/pool-observations.json`, from research-pools commit bded79384.
- An "Exact operator action": reopen the owning leaf, then resume live-replay implement.

The watcher took no action for 5 ticks, about 1h40m. Each tick reported "unchanged, needs operator". The dependent leaf `update-replay` sat blocked the whole time. The operator expected the watcher to route the fix and keep the work moving.

Reporter notes, verbatim: "reopen it yourself according to the plan and keep it moving. Why didn't you do that?" and "you didn't do anything about this, when you should have. Is this a systemic issue with watch-issues skill?"

Contributing facts seen during the watch:
- The watch-issues Judge rule "Failed on a human prerequisite" puts any reason naming an "operator decision" in notify-only. It has no path for a blocker that names an owning leaf and a concrete defect.
- The Never list forbids editing `issues/`, so the watcher cannot open a fix leaf.
- akrogon has no reopen verb. `src/phase.ts:186` throws `Merged is terminal`, and the CLI verbs are install|init|config|phase|next|pull|close|park|unpark|sync|status. The design line "The run fails, and the owning leaf reopens" has no command behind it.
- The Stop rule never fires. The dependent leaf is blocked, not failed, so the cron keeps ticking with nothing to act on.
- The "shown" delivery on the failure record was the only signal to the operator. The watcher did not raise the stall again.

### Location
- akrogon `skills/watch-issues/SKILL.md`: the Judge rules for failed leaves, the Never list and the Stop rule.
- akrogon `src/phase.ts:186`: merged is terminal, with no reopen path.
- The framework repo leaf `issues/open/satellite-network-simplify/satellite-route/live-replay/`.

### Reproduction
1. A leaf's implement run finds a defect owned by an already-merged sibling leaf. The seat ends with `phase failed --reason "... owning leaf ... must reopen first"`.
2. `/watch-issues tick` classifies it as a human prerequisite. Delivery is already `shown`, so it does nothing.
3. Every later tick repeats "no change". Dependent leaves stay blocked, and the watch never stops.

This was observed once, on 2026-09-28 from 06:07 to 07:47 CEST.

### Expected behavior
When a failure names an owning leaf and concrete evidence, the watcher should move the work forward rather than idle. It should either open a fix leaf through the sanctioned door or tell the operator plainly that routing is impossible and why. A watch whose remaining leaves can only wait on such a stall should not tick indefinitely without escalating.

### Urgency
The epic stalls until the operator notices by hand. Here, 1h40m of idle ticks passed with a dependent leaf blocked.

Workaround: the operator manually charts or reopens the owning fix, then resumes the failed leaf at implement.

## Agent findings

See slots/map-merged.md and its rebuttals. live-replay failed a second time at 10:25Z on a content-batch provenance defect after a manual resume at 09:47Z.
