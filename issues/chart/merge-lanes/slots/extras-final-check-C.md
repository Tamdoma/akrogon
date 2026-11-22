# Final-shape check: extras (slot C)

Checked `slots/extras-final-shape.md` against `src/verify.ts` and the chart's `## Taken` sections (2026-11-21). No lock violations and no misstatements of slot C's positions or dissents. Three concrete defects in **item 2 (D3)**:

1. **Item 2b (`"median of its own eligible runs (at least 5)"`) traps recovery after a multi-day episode and falsely trips `accepted` on day 14**:
   - In `framework` (47–87 eligible merge runs/day), an episode open for 10 days accumulates ~500 slow runs. If a fix (like `suite-regrowth`) drops the suite back to normal on day 10, the cumulative median of *all* eligible runs in the episode stays above threshold until >500 fast runs land (~10 more days). Meanwhile day 14 arrives while the last 20 runs are all fast (and still inside the unclosed episode), so **item 2c closes the already-recovered episode as `accepted`** (and sends a spurious accepted notice) instead of `recovered`.
   - **Fix**: bound the recovery window to the **trailing** eligible runs inside the episode (e.g., median of the last 5 — or last 5..20 — eligible runs in the episode, minimum 5), not the unbounded cumulative set from episode start.

2. **Item 2a + 2c carried normal after an `accepted` close**:
   - Today `decideSlow` (`src/verify.ts:365,407`) writes the *old* `open.normal_ms` onto the `close: 'accepted'` row (so the printed line shows old normal vs measured). Under 2a ("the normal is the carried normal... it never rises except at an `accepted` close"), reading `latest.slow.normal_ms` on the run after `accepted` would carry the *old* normal again instead of the new 20-run median unless the `accepted` row records the new normal (or the next run recomputes the 20-run median from the `accepted` row when `latest.slow.close === 'accepted'`).

3. **Item 2c notice-id collision on the `accepted` close notice**:
   - Today `src/verify.ts:264,390,610` keys the `merge-slow` notice on `noticeId(repo.name, 'merge-slow', first.run)` and suppresses sending when an earlier row with the same `first.run` already has a covering notice (`:387-391`). Sending a second notice at `accepted` close needs its own notice id (e.g., `merge-slow-accepted` with `first.run`) and matching `foldShown` (`:263-266`) handling so it neither collides with a still-pending open notice nor gets suppressed by `:387-391`.
