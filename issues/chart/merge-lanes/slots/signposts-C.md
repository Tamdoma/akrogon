# Signposts critique — Slot C

## History check (correction to brief)

The brief states `host-run-load` (`861d0e4e`) keeps full suites one-at-a-time host-wide. That was **reverted the same day** (`20455420`, 2026-10-24) and removed from framework (`framework` `22bd7438b2`) because akrogon runs queued behind framework's verify; `6a29a6db` (`issues/chart/akrogon-test-line/CHART.md`) restored `full:` **per-repo on akrogon only** (`issues/config.yaml`). Framework has no `full:` line (`framework/issues/config.yaml`); only `mergeTurn` serializes its merges. Host protection is `~/.config/systemd/user/akrogon.slice` (`CPUWeight=20`, `MemoryHigh=64G`, `MemoryMax=96G`, `MemorySwapMax=0`) after `permit-bypass` (`81196b3b`, 2026-10-14) dropped start-time memory/spacing caps (`src/admission.ts`).

## Draft questions (1–6)

1. **Change** — Replace "shorter merge wait" with **merge throughput (merges/hour)** (operator's stated metric in `framework/issues/chart/verify-core-waves/forks/overlap-limit.md`, 2026-10-26) and distinguish **pre-push green** from **revert-on-red** (`issues/chart/base-red/CHART.md` already allows known-red merges). Ask for a strict rank plus which limits are hard.
2. **Change** — Drop the numeric choice (`1 / 2 / dynamic`): concurrency depth is an empirical knob already gated on measurement (`issues/chart/merge-stacks/forks/stack-fate.md` 4a; `overlap-limit.md` measured 2 parallel `verify:core` runs slowing ~1.6x with 5s timeouts), and "1 (today)" misstates `host-run-load`. Reframe as the **host-policy signpost**: keep `akrogon.slice` as the sole ceiling, or reopen host-wide/cross-repo admission limits (reopening `81196b3b` and `20455420`)?
3. **Change** — Tell the operator this directly reopens **two settled choices**: `stack-fate.md` 1a (`6e7a33ff`, deleted stacking after 72/77 stacks went red, wasting 480m) and `issues/chart/merge-turn/forks/merge-order.md` Q3 2a (foreclosed split-in-half). Framework's merge verify is still **46% red per run** (166/360 since 2026-11-14, `framework/issues/verify-runs.jsonl`), so batching fails the same math without splitting. Reframe as **proof granularity**: every landed commit proved green on its exact base (preserves `merge-stacks/CHART.md` precision; allows speculative pipelines) vs batch-tip proof only.
4. **Keep (sharpen)** — Real scope boundary, but add a middle option: **akrogon machinery + optional repo-config opt-ins** (recommended). `merge-stacks` 3a and `verify-core-waves` already hit framework suite limits (`rest-d` is 73% of core); pure akrogon-only rules out repo-declared stages or shardable verify commands.
5. **Drop** — Rollout proof bar does not steer design picks, and the operator already requires measured throughput proof (`stack-fate.md` 4a; `overlap-limit.md` 2026-10-26).
6. **Keep** — Useful complexity/reversibility limit given past churn (`6e7a33ff`, `20455420`, `81196b3b`); clarify whether drain-before-deploy (`stack-fate.md` 5a) remains acceptable.

## Missed signposts

**M1. Full suite before push vs lighter/async gate** (reopens `framework/issues/chart/verify-speed/forks/verify-shape.md` round 3 1a; `merge-stacks/CHART.md` Off route).
- Options: (a) Full merge suite before every push; (b) Risk-tiered pre-push gate; (c) Cheap gate pre-push + async full verify on `main` with auto-revert.
- **Recommend (a)** unless the operator explicitly accepts brief red-`main` windows; otherwise every other pick shifts.

**M2. Lane eviction and stall clock on red/hung holders** (reopens `issues/chart/merge-turn/forks/turn-release.md` Q2 2a no-clock rule).
Since 2026-11-14, 65 of 198 eventually-merged framework attempts hit a red verify and kept holding the lane for **31.8h of 73.5h total (43%)**, including 45 same-SHA flake retries and a 152.9m stall (`status-page-schema-graph`, 123.6m non-verify) (`framework/issues/merge-attempts.jsonl`, `verify-runs.jsonl`).
- Options: (a) Keep holder on-lane, no clock (today); (b) Evict holder on red or stall timeout so queued leaves pass; (c) One automated retry on-lane, then evict.
- **Recommend (b)** (evict immediately on red/stall; retry off-lane).

**M3. Merge-queue backpressure vs cross-repo starvation** (reopens `merge-order.md` Q2 2a).
Waiting merge leaves keep live tabs counted in host-wide `max_active: 12` (`src/next.ts` `activeCount`, `issues/config.yaml`), so 10 queued framework leaves throttle every other repo.
- Options: (a) Global `max_active` backpressure (today); (b) Per-repo WIP/merge cap so a clogged repo throttles only itself; (c) Exclude waiting merge leaves from `max_active`.
- **Recommend (b)**.
