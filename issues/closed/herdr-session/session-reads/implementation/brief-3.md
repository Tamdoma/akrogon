# Brief U3: reconcile() gains the cross-session union for cwd vetoes

## 1. Goal

Plan D3: `src/reconcile.ts` `reconcile(repo, leaves, live, union = live, failures?)` — `live` stays the resolved session's panes for every tab judgement; `union` (cross-session panes, `null` when any running session is unreadable) drives every pane-cwd veto and gates pane-dependent removals. Plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/plan.md`.

## 2. Acceptance criteria

1. Signature: `reconcile(repo, leaves, live: Pane[] | null, union: Pane[] | null = live, failures?)` — `union` inserted as the 4th parameter, defaulting to `live` so the two direct test callers (`tests/reconcile.test.ts`, `tests/store-sweep-safety.test.ts`) keep working unmodified.
2. Tab-identity judgements keep reading `live` only: `tabLive`, `seatTabs`/`closeTab` membership, `broadcastInProgress`, `sliceKeepReason`, `repoRunning`.
3. Every cwd veto reads `union`: all `livePaneInside`/`foreignPaneInside` call sites and the pane checks inside `dropChecked`, `dropUnowned` paths, retired-lock and leaf-temp drops.
4. Every place that currently keeps on `live === null` keeps on `live === null || union === null` — including `endedAgentWorktree`, `mergedWorktree`, the failed-leaf branch, old-root migration, leaf-owned junk, `.owner` orphans, scratch dirs, lock drops.
5. `mergedWorktree` and the failed-leaf branch keep the whole entry (no tab close, no worktree removal) when `union === null`; a recorded tab that is live in `live` may still close when `union === null`. A worktree-less leaf's `closeTab` call keeps its own-session-only rule.
6. Use a distinct keep reason `pane union unavailable` (clears text mirroring the existing `pane list unavailable`) wherever `union === null` is the deciding cause and `live` was readable, so reports distinguish the two.

## 3. Read-first list

- `src/reconcile.ts` — the whole file; key sites: `endedAgentWorktree` (~line 678), `mergedWorktree` (~line 720), the leaf loop (~770-830), `dropChecked`/`dropUnowned`/`repoRunning` (~840-880), the candidate loop (~890-1000), the scratch section (~1000-1120), the retired-lock tail (~1200).
- `tests/reconcile.test.ts` line ~1048 and `tests/store-sweep-safety.test.ts` line ~135 — the two direct callers; confirm their arg counts stay valid.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files: `src/reconcile.ts` only.

The body currently does `const panes: Pane[] = live ?? [];` — keep `panes` as the own-session view and add a second `const panesUnion: Pane[] = union ?? [];` (or equivalent name). Sweep these sites:

- `livePaneInside(panes, path)` → `livePaneInside(panesUnion, path)` everywhere.
- `foreignPaneInside(panes, ...)` → `foreignPaneInside(panesUnion, ...)` everywhere.
- `if (live === null)` keeps → `if (live === null || union === null)` keeps.
- `closeTab` internals unchanged (reads `panes`, `seatTabs`).
- `tabLive(panes, ...)` unchanged.
- `broadcastInProgress(state, live)` unchanged (takes `live`/`null`).
- `sliceKeepReason(..., live, ...)` unchanged.
- `reconcileHost` unchanged (its `panesOnce`/`panesForRepo` split already models this).
- `closeMergedTab` unchanged (self-resolves).
- `reconcileNeedsPanes` unchanged.

## 5. Do-not, reasons and exceptions

- Do not change `next.ts` call sites — U4 owns them. The default `union = live` makes this unit landable alone.
- Do not weaken any keep into a removal or vice versa beyond the parameter swap.
- Do not edit tests or `src/AREA.md`.
- A site where `live` vs `union` is genuinely ambiguous (e.g. a mixed check): return a mismatch naming it. Exception: revised brief from A.

Restated: `src/reconcile.ts` only; `live` for tabs, `union` for cwd/presence; default arg keeps old callers; mismatch on ambiguity.

## 6. Ordered steps

1. Read the whole file and list every use of `live`, `panes`, `tabLive`, `livePaneInside`, `foreignPaneInside`, `dropChecked`, `dropUnowned`.
2. Add the `union` parameter and `panesUnion`.
3. Re-route each cwd-veto call site to `panesUnion`; add `union === null` to each `live === null` keep site; in `mergedWorktree` and the failed-leaf branch, return the keep before `closeTab`/`removeWorktree` when `union === null`.
4. Distinct `pane union unavailable` reasons per criterion 6 where `live` alone was readable.
5. Run the targeted checks, commit.

Size: 1 file, ~20 sites, under 15 turns.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/session-reads-u3 && bun install --frozen-lockfile`
- `akrogon run-check --name u3-reconcile -- bun test tests/reconcile.test.ts tests/store-sweep-safety.test.ts tests/keep-rule.test.ts` (`keep-rule` exercises `tab_closed` reconcile; its hook calls may need no socket to run its own asserts — run it as-is and report any failure verbatim; the leaf's `tests/session-reads.test.ts` is A's and partly red, do not run it).

## 8. Done-when, evidence and report

All criteria 1-6 hold; the targeted checks are green or any red is quoted verbatim with your judgment of its cause; one commit on the worktree HEAD. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
