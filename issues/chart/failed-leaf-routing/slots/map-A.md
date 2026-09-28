# Map A: #33 and #34

Read 2026-09-28. akrogon main at 2e99927.

## #33 watch idles on a failed leaf that names a fixable owner

Cause:
- `skills/watch-issues/SKILL.md:38` sends any failure naming an operator decision or external step to notify-only. A failure that names an owning leaf and a concrete defect matches it, so the watch never recovers it.
- `SKILL.md:45` stops only when every remaining leaf is failed on a human prerequisite. A dependent leaf that is only blocked (`blocked-by` a failed leaf) keeps the cron ticking with nothing to do.
- `SKILL.md:53` forbids editing `issues/`, and `src/phase.ts:186` makes merged terminal. The watch has no way to open a fix. Fixing a merged leaf's defect needs a new leaf, which today only the attended chart door writes.
- It recurs. framework `live-replay` failed again at 10:25Z today, now naming a content-batch provenance defect (`failure.reason`, state.yaml). Same shape: a merged sibling's defect found one at a time by the live run.

Forks:
- K1 Who fixes a defect owned by a merged sibling leaf.
  - O1 (A recommends) The failing leaf fixes it in its own branch when the fix is small and inside the brief's live-run goal. Its brief then owns "make the live run pass". No new leaf, no watch change. Pitfall: widens leaf ownership, and review must accept cross-surface diffs.
  - O2 The watch notifies once with the exact action ("chart a fix for <owner>, then resume <slug> at <phase>"), and the operator charts it. Today's behavior plus a clear message.
  - O3 The watch writes a fix leaf itself. It would run an attended door unattended and break the `issues/` Never rule.
  - O4 An `akrogon reopen` verb on merged leaves. Contradicts `phase.ts:186` and the closed-leaf history.
- K2 Stop rule for leaves that can only wait on a failed leaf.
  - O1 (A recommends) Treat a leaf whose unmerged `blocked-by` all lead to leaves failed on a human prerequisite as waiting on that prerequisite, so the Stop rule fires after the notice is shown.
  - O2 Keep ticking and re-notify each fire. Noise without progress.
- K3 Resume after the fix merges.
  - The failed leaf stays failed until someone runs `akrogon phase <slug> <failure.phase>`. A fix leaf listed in the failed leaf's `blocked-by` would let the watch resume it once that fix merges. This needs a state edit, which only the operator or chart door may make.

Sources: SKILL.md:38,45,53, src/phase.ts:186, src/next.ts:536,598, framework live-replay state.yaml and log.jsonl. Practitioner search not done yet.

## #34 consultant panes B and C layout

Cause: nothing creates the panes. `skills/chart-issues/SKILL.md:23` and `assets/questions.md:44` say the operator supplies them.

Live surface: `herdr pane split <pane> --direction right|down --ratio <f> --cwd <p> --no-focus`. Split A right gives the right half. Splitting that new pane down gives B top and C bottom. No move is needed.

Fork:
- K4 Should the door create the panes.
  - O1 (A recommends) Keep operator-supplied panes. Add one layout line the operator (or A on request) follows: split A right for B, then split B down for C.
  - O2 The door creates and starts B and C itself when the operator asks for slots. Adds harness choice and startup handling to an attended door.

One destination each. #34 is a small skill-text leaf with one fork.
