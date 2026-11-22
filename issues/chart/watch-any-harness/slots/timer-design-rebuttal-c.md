# Rebuttal: timer-design (slot C)

1. **Q2 delivery race — `hc send --if idle` (A) breaks on `done` and misses agent replacement:**
   - Fact/evidence: `hc send --help` restricts `--if` to `idle|working` (not `done`), whereas `tests/e2e/watch-check.e2e.ts` (`idle`) and `skills/chart-issues/scripts/door-reset.ts` (`idle`) treat `idle` and `done` as ready, and `src/hc.ts` (`send`) does not pass `--if`. Also `--if idle` checks status only, not process identity, so another idle agent launched in the same shell still passes it.
   - Consequence: `--if idle` can exit 10 (`status_mismatch`) and starve a harness reporting `done`, while still delivering a stray tick to a replacement agent after a draft hold. Use `hc events --terminal <watcher>` (`src/hc.ts` `follow`) to abort in-flight sends on `finished`/`lost`/`status:null`/`foreground` changes rather than relying on `--if idle`.

2. **Q4 busy — counting and replaying every due tick (B's Q4d) adds failure modes without value:**
   - Fact/evidence: Charting probe (merged notes) shows sends while working merge into the running turn on all four harnesses; `skills/watch-issues/SKILL.md` § Observe re-reads current repo state fresh each check.
   - Consequence: Replaying N accumulated dues sequentially after a busy span runs N redundant passes over the same live state, burns quota, risks colliding with operator chat, and adds turn-receipt complexity for zero observational gain. Keep Q4a (collapse dues into one post-idle catch-up check) and note the change from `tests/e2e/watch-check.e2e.ts`'s two-queued-ticks assertion explicitly.

3. **Q3 reset — `codex /new` + intervening prompt is unprobed, not equivalent to `pi`:**
   - Fact/evidence: Charting probe tested `codex /new` only before any prompt ("unchanged after codex /new"); `src/transcript.ts` (`rollouts`, `fromProcess`) selects the newest open `rollout-*.jsonl` fd, whereas `pi` (`piStart`) never exposes `/new` in `/proc` even after later turns.
   - Consequence: Do not classify `codex` alongside `pi` as permanently uncatchable after an intervening prompt without probing `codex /new` + one prompt; if the new rollout opens on that prompt, Q3b catches it and narrows the lock-2a stated limit to `pi` only.

4. **Q7 agy — discovery already failed in the probe, so B's conditional deferral is moot, but lock 5a needs explicit framing:**
   - Fact/evidence: Charting probe proved `agy` did not load `watch-issues` from `~/.agents/skills` and did load it from `~/.gemini/config/skills`; `src/install.ts` (`planSkillLinks`) links every skill in `skills/` into every listed root.
   - Consequence: Deferring Q7a leaves `agy` broken in normal repos (failing lock 6a), while taking Q7a edits `src/install.ts` outside the skill folder and exposes all akrogon skills to `agy`; record it as an explicit lock-5a exception rather than deferring or silently widening install links.
