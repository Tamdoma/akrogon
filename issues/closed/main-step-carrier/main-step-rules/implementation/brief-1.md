# Sub-brief 1: chart-issues main-step rules

## 1. Goal

Write the plan's D1, D2, D3 into `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/SKILL.md` in the worktree `/home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u1`. Prose edits only, no code.

D1: a step on main that a taken chart decision needs is never recorded under Off route. When its precondition exists, the door makes it during the pass and verifies the effective result (a config edit through `akrogon config` at the registered root).

D2: when such an edit can only follow a leaf's merge, the GitHub identity is withheld from `sources` of every leaf whose completion could close it — a stated exception to the one-completion-owner rule. The identity stays open, mirrored by `akrogon pull`; the door later makes and verifies the edit and runs `akrogon close <id> --by <text>` naming what delivered it.

D3: an unsourced chart records each waiting edit in CHART.md as a pending operator step with the exact edit, owner, prerequisite leaf and the check that proves it done.

## 2. Acceptance criteria

1. shapes.md states a needed main step is never an Off-route entry, and the door makes and verifies it during the pass when its precondition exists (config via `akrogon config` at the registered root).
2. shapes.md gains a `## Pending steps` section in the CHART.md template recording each waiting step with exact edit, owner, prerequisite leaf and proving check.
3. shapes.md's one-completion-owner paragraph carries a stated exception per D2: withheld from `sources` of every leaf whose completion could close it; stays open and mirrored; door later makes, verifies, and runs `akrogon close <id> --by <text>` naming what delivered it.
4. shapes.md's `issues/` refusal tail keeps its meaning but routes main-step work per D1/D3 instead of bare "operator step on main".
5. SKILL.md's source-close paragraph (:35) names the D2 exception: a report whose close depends on a merge-blocked main edit is withheld from closing `sources` and is closed by the door after the edit, not by completion.
6. SKILL.md `## Handoff` states the door makes and verifies a needed main step during the pass when its precondition exists, and a merge-blocked or unsourced waiting edit follows the shapes.md records.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` — CHART.md template around line 35 (`## Off route` / `## Direct attempt`), fork-rules paragraph around line 92, "A GitHub report has exactly one completion owner" paragraph around line 286, `## Preflight and validation` `issues/` refusal around line 293.
- `skills/chart-issues/SKILL.md` — the paragraph beginning "At open, name each skipped GitHub identity" around line 35, and the `## Handoff` section.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

All edits in the detached worktree `/home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u1` (branch detached at commit 013f7c3).

1. `skills/chart-issues/assets/shapes.md`, CHART.md template: after `## Off route` / `<excluded work and reasons>` add:
   ```
   ## Pending steps
   <none, or each waiting main step: the exact edit, its owner, the prerequisite leaf it waits on and the check that proves it done>
   ```
   and extend the `<excluded work and reasons>` comment so it states a step on main a taken decision needs is never recorded under Off route — the door makes and verifies it during the pass when its precondition exists (config verified through `akrogon config` at the registered root), otherwise it is a Pending steps entry. Keep the template's existing terse comment style; one comment line, not a paragraph.
2. `skills/chart-issues/assets/shapes.md`, the paragraph "A GitHub report has exactly one completion owner...": append the stated exception per acceptance criterion 3, one or two sentences, naming `sources`, `akrogon pull` and `akrogon close <id> --by <text>` naming what delivered it.
3. `skills/chart-issues/assets/shapes.md`, the `issues/` refusal sentence ending "such work is an operator step on main, not a leaf": extend the tail so such work is a step on main the door makes and verifies during the pass when its precondition exists, otherwise a Pending steps record — never an Off-route entry.
4. `skills/chart-issues/assets/shapes.md` line ~92 "Ruling work out records the reason in Off route instead of pretending a fork was taken": leave unchanged. It describes excluded work only; a waiting main step is not ruled out. Note in your report that you checked it.
5. `skills/chart-issues/SKILL.md`, paragraph ending "...stays open as `sources` until its completion owner delivers.": append one or two sentences for the D2 exception per acceptance criterion 5.
6. `skills/chart-issues/SKILL.md`, `## Handoff` section: append one sentence at the end of the paragraph "On the direct route no leaf files or `state.yaml` are written, ... ends at the printed footer without dispatch." — or wherever it reads most naturally within that section — covering acceptance criterion 6. One sentence, pointing to shapes.md for the record forms, not duplicating them.

Commit message: `chart-issues: route needed main steps through the door, never Off route` (or similar content equivalent). Commit only these two files.

## 5. Do-not, reasons and exceptions

- Do not edit any file other than `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/SKILL.md` — other files belong to sibling units.
- Do not add, delete or edit any test, or anything under `src/`, `tests/`, `issues/` — this leaf is prose-only and `akrogon phase` rejects `issues/` diffs.
- Do not duplicate a rule in two places within a file — each rule gets one home (shapes.md for record rules), other text points at it. Exception: the SKILL.md Handoff pointer sentence, which is required.
- Do not renumber or reformat unrelated lines — minimal diff.
- If a criterion cannot be met by editing these two files, return a mismatch with evidence; do not expand scope.

Reasons restated: disjoint owned paths keep the wave parallel; prose-only scope is the leaf's done-criterion 7; single-home rules prevent contradictory copies. Exception: only a revised brief from A authorizes anything beyond this.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree (flock not needed for you; the check command handles it).
2. Read the listed passages in both files.
3. Make edits 1-4 in shapes.md (criteria 1-4), then edits 5-6 in SKILL.md (criteria 5-6).
4. Run the section-7 command.
5. Commit the two files, return the commit ID.

Advisory size: 2 files, under 10 turns.

## 7. Commands

```sh
cd /home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u1
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && akrogon guard own-modules && bun test --changed=013f7c369f245d58e47aea814f69322bed39d21a --timeout=30000
```

## 8. Done-when, evidence and report

All six acceptance criteria readable in the committed diff; section-7 command exits 0; commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
