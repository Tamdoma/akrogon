# Docs word choices (slot C)

Drop the word **manual** from both categories: the operator used it for direct builds while `chart-issues` (`## Autopilot`) uses it for no-autopilot charting, so keeping it anywhere guarantees cross-talk.

## Category X: Charting mode (short: mode)
- **Why:** Matches `## Mode record` in `CHART.md` and `chart-issues` (`## Autopilot`); operators already know "mode" as a session setting. Prefixing "Charting" on first use ties it to planning, not execution.
- **Avoids:** Treating autopilot as a build/merge setting (autopilot only charts and hands off).
- **Rejected:** *Autonomy level / human-in-the-loop* (marketing jargon, no standard meaning, never printed); *supervision* (sounds like watch/pause, misses `Mode record`).

### Values for Charting mode
- **`No autopilot`** (note once that the door's opening line prints `manual`): Plainest default; matches the operator's own phrasing and the absence of `## Autopilot` in `CHART.md`. Avoids colliding with the direct build route or implying the reader codes by hand. **Rejected:** *Manual* (collides with direct builds and hand-coding); *Attended* (internal log term from `shapes.md`, stiff RPA jargon); *Guided* (ambiguous who guides whom).
- **`Autopilot`**: Matches the exact word typed to switch it on (`autopilot`) and `## Autopilot` in `CHART.md`. Like flight autopilot, you set the direction (signposts) and the agent handles the forks. Avoids a prompt/docs mismatch. **Rejected:** *Semi-autopilot* (never printed or typed; makes typing `autopilot` feel wrong).
- **`Full autopilot`**: Matches `chart-issues` (`## Autopilot`, triggered by `autopilot signposts`) and signals immediately that signposts are delegated too. Avoids readers assuming plain `Autopilot` skips signposts. **Rejected:** *Autonomous / Hands-off* (hype wording, hides what changed from `Autopilot`, never printed).

## Category Y: Build route (short: route)
- **Why:** Matches `Route:` in `CHART.md` and the handoff review prompt; ops leaders already know "route" as the delivery path after a decision point. Prefixing "Build" separates it cleanly from planning.
- **Avoids:** Blurring how a chart is *decided* (mode) with how it gets *built* (route).
- **Rejected:** *Execution mode* (reuses "mode"); *Pipeline / Track* (DevOps jargon or invented term; never printed in `CHART.md`).

### Values for Build route
- **`Direct`** (in prose: `Direct route`): Exact match for `Route: direct`, `akrogon direct`, and `## Direct attempt`. Describes skipping the handoff to fresh seats, so it fits small features as cleanly as bug fixes. Avoids limiting it to bugs or implying hand-coding. **Rejected:** *Quick fix* (excludes fast features, already rejected); *Manual route* (collides with X and hides that the agent builds, B reviews, and the merge queue lands it); *Fast track* (marketing tone, misses `akrogon direct`).
- **`Lifecycle`** (in prose: `Lifecycle route`): Exact match for `Route: lifecycle` and the operator's own term; signals the full multi-stage contract -> Slot A/B -> review -> merge process. Avoids implying `Direct` skips review or merge. **Rejected:** *Full route* (collides with `Full autopilot`); *Queue / Pipeline* (both routes use the merge queue; mismatches `Route: lifecycle`).

## One-sentence contrast for the docs
- **Charting mode:** **Charting mode** sets who answers the planning questions while you scope the work — you (`No autopilot`), the agent after you set the signposts (`Autopilot`), or the agent for everything (`Full autopilot`).
- **Build route:** **Build route** sets how the settled work gets built and shipped — straight through the planning agent for one small change (`Direct`), or handed off as written contracts to fresh Slot A and Slot B seats (`Lifecycle`).
