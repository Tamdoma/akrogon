# Sub-brief 3: chart guide Off route paragraph

## 1. Goal

Update `docs/guide/chart.md` line ~128 paragraph so the operator guide matches the new chart-issues rules (plan D1, D2, D3) in plain guide language, in the worktree `/home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u3`. Prose edit only.

## 2. Acceptance criteria

The Off route paragraph (the one beginning "Ruled-out work goes under Off route with its reason.") covers:

1. A step on main that a taken decision needs is never Off-route work; when its precondition exists the door makes it during the pass and verifies the result.
2. When such an edit can only follow a leaf's merge, the report is withheld from the `sources` of every leaf whose completion could close it, stays open, and the door closes it with `akrogon close <id> --by <text>` after making and verifying the edit.
3. An unsourced chart lists each waiting edit in CHART.md as a pending operator step with the exact edit, owner, prerequisite leaf and the check that proves it done.
4. The existing sentences stay intact in meaning: ruled-out work is recorded, not silently treated as agreed; delivered/duplicate reports are closed with `akrogon close`; the fully-covered-but-undelivered exception stays in `sources` until its completion owner delivers.

## 3. Read-first list

- `docs/guide/chart.md` — paragraph at ~line 128, plus lines 120-160 for the surrounding voice.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

All edits in the detached worktree `/home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u3` (detached at commit 013f7c3). One file: `docs/guide/chart.md`.

Extend the paragraph at line ~128 to cover criteria 1-3 while keeping criterion 4. Guide voice: short sentences, "you"-neutral, no jargon beyond what the guide already uses (`sources`, `akrogon close`, `akrogon pull`, CHART.md all appear elsewhere in the guide). Suggested shape — adjust wording, keep the facts:

- After "It is not silently treated as agreed scope." add that a step on main a taken decision needs is never Off-route work; when its precondition exists the door makes it during the pass and verifies the result.
- After the existing "The exception is a report confirmed fully covered..." sentence, add the second exception (criterion 2) and the unsourced-chart record (criterion 3).

Keep the paragraph under ~6 sentences total; split into a second short paragraph if it reads better.

Commit message: `guide: chart Off route rules for needed main steps` (or similar). Commit only this file.

## 5. Do-not, reasons and exceptions

- Do not edit any file other than `docs/guide/chart.md` — sibling units own skills/.
- Do not touch the ASCII diagram or any other section of the guide, and do not touch `src/`, `tests/`, `issues/` or any skill file — prose-only leaf.
- Do not restate the skill's exact wording — the guide describes the same rules in operator-facing language. Exception: `akrogon close <owner/repo#n> --by <text>` and `sources` keep their literal forms.

Reasons restated: disjoint owned paths keep the wave parallel; guide voice keeps the doc readable; prose-only scope is the leaf's done-criterion 7. Exception: only a revised brief from A authorizes anything beyond this.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree.
2. Read the paragraph and surroundings.
3. Make the edit (criteria 1-4).
4. Run the section-7 command.
5. Commit and return the commit ID.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```sh
cd /home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u3
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && akrogon guard own-modules && bun test --changed=013f7c369f245d58e47aea814f69322bed39d21a --timeout=30000
```

## 8. Done-when, evidence and report

All four acceptance criteria readable in the committed diff; section-7 command exits 0; commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
