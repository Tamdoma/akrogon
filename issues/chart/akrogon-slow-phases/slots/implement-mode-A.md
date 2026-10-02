# Implement mode, slot A (blind)

## Surface
- `src/config.ts:34`: `implement: subagents | inline`, default subagents, one repo-wide value. akrogon sets `subagents` (`issues/config.yaml:6`). Switching is a one-line operator edit on main, no code.
- `skills/implement-issue/SKILL.md:49`: subagents mode writes a sub-brief per unit even for one unit, then up to 3 workers per wave, each in its own worktree. Inline: A implements in wave order itself.
- `:51` inline has no worker, sub-briefs or mismatch returns. Both modes run changed tests as work lands.
- `:42` overlap with slow runs only in delegated mode. With a 10 s suite there is little to overlap.
- `:71` repair: workers before the final round, inline on the final round or in inline mode.

## Measured
- Claude-seat implement passes for akrogon: 2 (wave-table, proof-order, 2026-10-01), both went to failed and were recovered. Too few to decide from Claude-seat data alone.
- Leaf size, 30 akrogon leaves merged since 09-25 (`issues/log.jsonl` diff at merge): 20 under 60 changed lines, 27 under 250, 3 large (role-swap 717, leaf-temp-dir 491, base-preflight 445).
- Old pi setup (from map round, B and C): workers 57-59% of implement time.

## View
- Recommend repo-wide `implement: inline` for akrogon. Most leaves are a few files; worker setup (sub-brief, worktree, cherry-pick, worker re-reading context) costs more than the work. No new mechanism needed.
- Not a per-leaf mode: new routing/config surface for 3 large leaves in 30, YAGNI. The operator can flip back to subagents for a known large batch.
- Pitfalls: inline loses the fresh-context worker that keeps a large leaf out of A's context; review independence is unaffected because B and A review blind after implement anyway; any required fresh-agent acceptance proof (realistic-review-bar spent about 11 min on one) stays a proof step, not an implement-mode choice.
