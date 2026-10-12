# Sub-brief 2: init-akrogon check entry points and verified test_changed

## 1. Goal

Write the plan's D4 and D5 into `skills/init-akrogon/SKILL.md`, in the worktree `/home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u2`. Prose edits only, no code.

D4: each proposed check names a repo-owned entry point — a package script, or a repo file run by its native tool — when one exists, otherwise the runner command it would propose today. Existing stored entries are not migrated; the generated setup/flock/run-check wrapping stays.

D5: a verified `checks.test_changed` is a real run against a base with changes in which a changed test was seen to be selected and ran, or the full existing test suite ran. A clean exit alone does not count. The base may be read inside the entry-point script.

## 2. Acceptance criteria

1. `## Inspect and propose` states that each check is proposed as a repo-owned entry point when one exists, otherwise the runner command, and that existing stored entries are not migrated.
2. The sentence at ~line 82 ("run proposed checks with a real fixture or leaf base for `test_changed`") defines verified per D5: changed test seen selected and run against a base with changes, or the full suite ran; clean exit alone does not count; the base may be read inside the entry-point script.
3. No other paragraph gains a second copy of either rule.

## 3. Read-first list

- `skills/init-akrogon/SKILL.md` — the paragraph starting "Propose every repo key below" around line 20 (the `checks:`/`merge_checks:` placement rule), `## Tests and grounding` around line 46, and `## Initialize and verify` around line 82.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

All edits in the detached worktree `/home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u2` (detached at commit 013f7c3). One file: `skills/init-akrogon/SKILL.md`.

1. In the long proposal paragraph of `## Inspect and propose` (the one ending with "a merge command may rerun cheap checks on the integrated candidate but is never the only place they run"), append one or two sentences stating D4 verbatim-ish: propose each check as a repo-owned entry point (a package script, or a repo file run by its native tool) when one exists, otherwise the runner command it would propose today; existing stored entries are not migrated; the generated setup/flock/run-check wrapping stays.
2. In `## Initialize and verify`, extend the sentence "run proposed checks with a real fixture or leaf base for `test_changed`" so verified is defined per D5. Keep it one sentence or two short ones; the existing clause order stays readable.

Commit message: `init-akrogon: propose repo-owned check entry points, define verified test_changed` (or similar). Commit only this file.

## 5. Do-not, reasons and exceptions

- Do not edit any file other than `skills/init-akrogon/SKILL.md` — sibling units own the other files.
- Do not touch `src/`, `tests/`, `issues/` or any other skill — prose-only leaf, `akrogon phase` rejects `issues/` diffs.
- Do not change the YAML proposal shape, the `setup` lockfile mapping, or the verification command text — the rules attach to existing prose only.
- Do not define "verified" twice — one home at the verification sentence; line ~47's mention keeps pointing at it. Exception: if :47 reads as contradicting D5 after your edit, one short clause there is allowed, explained in your report.

Reasons restated: disjoint owned paths keep the wave parallel; single-home keeps rules from drifting; the proposal shape is outside this leaf's scope. Exception: only a revised brief from A authorizes anything beyond this.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree.
2. Read the three listed regions.
3. Make edit 1 (criterion 1), then edit 2 (criterion 2).
4. Run the section-7 command.
5. Commit and return the commit ID.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```sh
cd /home/ivan/.akrogon/worktrees/akrogon/main-step-rules-u2
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && akrogon guard own-modules && bun test --changed=013f7c369f245d58e47aea814f69322bed39d21a --timeout=30000
```

## 8. Done-when, evidence and report

Both acceptance criteria readable in the committed diff; section-7 command exits 0; commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
