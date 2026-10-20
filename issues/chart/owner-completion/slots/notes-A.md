# Seat A blind notes: owner-reuse, close-witness

Code at akrogon HEAD e522c186, read 2026-10-19. Live state: framework repo, read 2026-10-19.

## owner-reuse

Pick: single lifetime per owner name. A name that sits in `issues/closed` (or `issues/parked`) never takes new leaves under `issues/open`; a follow-up group gets a fresh name (`satellite-plan-fit-2`). akrogon refuses a twin in code at the first point it reads the open owner for work (dispatch in `next`, shown by `status`), not after every leaf has merged. The `completeOwner` throw (`src/phase.ts:201`) stays as the last guard and becomes unreachable through the normal path.

Reason: the owner name is already the identity everywhere. `locate` maps a recorded log path to `open|closed|parked/<owner>` (`src/evidence.ts:49`) and `readLog` reads the first existing dir only (`:71-78`), so an open twin hides the closed archive. `completeOwner` renames the whole folder to `closed/<basename>` (`:199-226`). Keeping the name unique removes the problem class instead of teaching three places to handle two folders. Cost: a small guard and one flipped test (`tests/next.test.ts:5700` "closed owner name does not block an open same-name owner" pins today's twin-friendly dispatch). The stuck twin still needs a one-time repair (fork stuck-repair).

Rejected:
- Append into the closed owner on completion. Needs new merge code for two index files (`EPIC.md` exists in both twins, different text), a change to `readLog` to search every existing owner dir during the open window, and a rule for `.closing` and `packFolder` (`src/pack.ts:12`, which does union an existing archive). Adds code the operator asked us to avoid, and keeps a window where first-wave logs are unreadable. Gain: the live twin heals on retry without a manual step.
- Leave it to the door's prose. `shapes.md` Preflight already refuses an existing `issues/closed/<owner>` before handoff writes, yet the twin was written (both EPIC.md files first appear in framework commit ec649c713, 2026-10-18). Prose did not hold.

Evidence:
- better-than-training · src/phase.ts:191-226, src/evidence.ts:30-79, src/pack.ts:12-60, tests/next.test.ts:5700-5719 · 2026-10-19 · above.
- better-than-training · framework `issues/closed/satellite-plan-fit` (EPIC.md, brand-override, page-draw-preview, evidence.tar.zst) and `issues/open/satellite-plan-fit` (EPIC.md + 6 merged leaves) · 2026-10-19 · the twin is real and live.
- model-knowledge · no outside search run; this is the repo's own naming invariant.

Pitfalls:
- Twin detected only at completion, after all work merged (today). Removed by refusing at dispatch, so the door or operator renames before any work runs.
- Renaming an owner that already has run logs breaks the recorded paths in `log.jsonl` (owner name is part of every path, `src/evidence.ts:49`). Removed because the guard fires before the first dispatch, when no log exists; the live twin is handled in stuck-repair, where renaming is exactly this trap.
- Parked twins: `parked/<owner>` and `open/<owner>` hit the same lookup. The guard covers all three areas.

Question the fork does not ask: should the guard block the whole repo's `next --all`, or only the twin owner's leaves? I would block only the twin's leaves, loudly, so one bad folder does not stop unrelated work.

## close-witness

Pick: cite the leaf slug. `closeSources` closes each source with `delivered by <slug>`, the same text `closeCommand` already uses (`src/pull.ts:211`). The worktree guard and the `git rev-parse HEAD` call (`src/pull.ts:186-190`) are deleted.

Reason: removes the only reason completion needs a worktree, so #103 disappears for every stuck leaf with no backfill. The slug is durable: it names the folder in `issues/closed/<owner>/.../<slug>`, and git history finds the landed commit from it. `closeSource` is already idempotent on `CLOSED` (`src/pull.ts:~140`), and a deterministic comment text keeps the duplicate-comment check (`body === comment`) working across retries. Cost: the GitHub comment shows a slug, not a commit hash, so a reader looks up the commit in the repo.

Rejected:
- Save the landed commit in `state.yaml` at merge (new field). Adds a field, a write on two merge paths (holder push `src/phase.ts:626-640` and batch members via `commitMove`), and leaves the 20+ stuck leaves without the field, so it needs a backfill or a fallback. Stacks code.
- Read the commit from `issues/log.jsonl` at close time. The log is not durable evidence (map pitfall, B) and is rewritten or trimmed outside the leaf.
- Keep the worktree until completion. Already tried: reconcile keeps it only when `ownerCompletes` (`src/reconcile.ts:691`), which does not help an owner that completes later through a sibling, and keeps worktrees forever when completion keeps failing (#108).

Evidence:
- better-than-training · src/pull.ts:120-212, src/phase.ts:505-512, 584-640, src/reconcile.ts:237-246, 584-597, 691 · 2026-10-19.
- better-than-training · framework live: 6 merged leaves under `open/satellite-plan-fit`, 5 with no worktree, 1 (pool-parity) with one · 2026-10-19.
- Today's hash is already imprecise: for an epic's shared sources (`remaining`, `src/phase.ts:216-221`) the hash is the completing leaf's HEAD, not the leaf that delivered that source.

Pitfalls:
- Old comments say `merged <sha>`, new ones `delivered by <slug>`. Only the format differs; nothing parses it except the duplicate check, which compares the current call's own text.
- With the worktree no longer needed, the `ownerCompletes` mirror in reconcile (`src/reconcile.ts:237-246`, duplicated logic of `completeOwner`) may become removable. Not claimed: it also keeps the tab (`:711`) and may serve the broadcast step in the merge slot's tab. Needs a check, not an assumption.

Question the fork does not ask: should shared epic sources cite the epic name instead of the completing leaf's slug, since no single leaf delivered them?
