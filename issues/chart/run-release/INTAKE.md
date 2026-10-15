# Intake: run-release

## Scope
The installed `akrogon` command stops running from the akrogon workspace checkout. It runs a release built from merged main, so workspace edits never go live and never block or undo a deploy. Source repo and destination: akrogon.

## Provenance
- Operator: 2026-10-16, chat in the chart-akrogon door session (messages quoted below).

## Source: operator 2026-10-16
"p1a, but this must not be happening in hte future"

"[Image #8] <- this shouldn't be the case. It was working till a couple of minutes ago, not it reverted back."

"Who knows how much else was reverted back, check it. Find the systemic issue."

"but this seems like a systemic issue, it shouldn't be happening."

"is there a more elegant solution without the copy? maybe consult with b and c"

"but I can still run everything from the main folder, like what we're doing here?"

"ok, then whatever you recommend, let's go"

"hopefully that doesn't break anything else systemically."

## Agent findings
- 2026-10-15/16: the door edited code uncommitted in the root checkout `/home/ivan/Work/infra/akrogon`. `~/.local/bin/akrogon` links to `src/akrogon.ts` there, so the edit ran live. self-update then refused to move the checkout: "checkout pending: error: Entry 'README.md' not uptodate. Cannot merge.; 44 behind origin/main; commit or finish the overlapping edit" (src/self-update.ts:246). Restoring the files unblocked deploy and removed the unmerged feature, which the operator saw as a revert. Check 2026-10-16: every akrogon tip merged 2026-10-15 in issues/merge-attempts.jsonl is an ancestor of origin/main; nothing on main was reverted.
- The rule "the door never edits code in the root" already existed (chart-issues direct route requires a worktree) and was broken. A rule does not remove the class.
- Coupling found by the opening maps (slots/map-{A,B,C}.md): `globalHome()` defaults to `toolRoot` (src/config.ts:195-198), so config.yaml, held.yaml, admission.lock, runs/last-start (tracked) and .lock, paused.yaml, stopped.yaml, run.lock, reconcile/ (ignored) live in the running tree; selfUpdate detects "own repo" by path equality (src/self-update.ts:208-212) and gates install on it; gitStage skips detached HEAD (src/self-update.ts:31-41); skill, systemd and herdr plugin links point into toolRoot (src/install.ts:14-25, :66); some skill steps import src/*.ts through the resolved `akrogon` path (skills/chart-issues/SKILL.md presence check, skills/merge-issue/SKILL.md:64) or run `git rev-parse` on it (skills/seed-issue/SKILL.md:26).
