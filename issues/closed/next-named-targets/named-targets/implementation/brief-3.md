# Brief U3: document named targets

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/named-targets-u3` (detached HEAD, commit here).
Leaf docs (read-only, absolute): `/home/ivan/Work/infra/akrogon/issues/open/next-named-targets/named-targets/`.

## 1. Goal

Document the epic, issue and leaf name target forms, the ambiguity refusal, and the folder path to use
when an issue and its leaf share a name (plan D9, acceptance A7). This leaf owns target forms and the
same-name path example only; report and automatic-silence text belongs to sibling `blocked-report`.

## 2. Numbered acceptance criteria

1. The target section of `docs/guide/next.md` describes epic names, issue names (top-level and nested), and leaf slugs as `akrogon next` targets, with one `next <name>` example each for an epic and an issue.
2. The same section states that a name matching two or more candidates is refused before anything starts, with each match listed by kind and path.
3. The same section states that an input existing as a folder from cwd keeps path meaning, and shows the folder path form to use when an issue and its leaf share a name.
4. `docs/guide/parts.md` shows the path form for same-name pairs next to the folder diagram (a leaf sharing its issue's name is selected by its folder path).
5. No report text and no automatic-silence text is added to either file.
6. Existing heading anchors touched by these edits keep working (`docs-links` stays green; A proves it finally).

## 3. Read-first list

- `<leaf>/plan.md` D9 and A7; `<leaf>/brief.md` criterion 7; `<leaf>/design.md` Leaf split docs line.
- Worktree `docs/guide/next.md:1-60` (target forms section to extend).
- Worktree `docs/guide/parts.md` (folder diagram plus same-name note site).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Pattern to copy: the `next.md` "The four forms" section style (short prose, one `sh` block per form).
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `docs/guide/parts.md`, `docs/guide/next.md` only. Lands first: none. Shared test resource: none. Wave 1 of 1, parallel with U1 (src) and U2 (tests). Preceding worker output: none.
- `next.md`: extend the target-forms section in place (name forms, refusal, shadow-plus-path note). Keep the page's voice and heading structure; do not renumber or rename existing headings.
- `parts.md`: add the same-name path example beside the folder diagram without restructuring the page.
- No code interface is consumed; kind words are `epic`, `issue`, `leaf`, paths are repo-relative.

## 5. Do-not, reasons and exceptions

1. Do not touch code, tests, `issues/`, `README.md`, or any guide page but the two owned. Reason: U1/U2 own their paths and the rest is frozen. Exception: none; return a mismatch instead.
2. Do not write report or automatic-silence text. Reason: sibling `blocked-report` owns it. Exception: none.
3. Do not rename headings or add cross-page links beyond plain relative ones already in use. Reason: heading anchors feed `docs-links`. Exception: none.
4. Return a mismatch naming the conflicting requirement, the actual page content with evidence, and the smallest brief correction instead of widening scope. Reason: the plan author owns scope. Exception: a revised brief from A authorizing the change.

Reasons restated: 1 keeps waves disjoint, 2 respects the sibling split, 3 keeps links green, 4 keeps scope with A; every exception is none except a revised brief from A.

## 6. Ordered steps

1. Read the section 3 files (files `docs/guide/next.md`, `docs/guide/parts.md`, all criteria).
2. Edit `docs/guide/next.md` first (criteria 1-3, 5-6), then `docs/guide/parts.md` (criteria 4-6).
3. Run `bun install` once in the worktree, then the section 7 command, then the affected-consumer check `bun test tests/docs-links.test.ts --timeout=30000`, which must pass.
4. Commit on the detached HEAD with message `named-targets U3: document named targets and same-name path form` (no `Test-Change` trailer: no test file touched). Return the commit id plus the section 8 report.

Advisory size: 2 files, under 8 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/named-targets-u3 && AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed="$AKROGON_BASE" --timeout=30000
```

This is the only required suite command. Expect it to select the two guides and run 0 tests; the section 6 consumer check is this unit's link signal. A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold, the consumer check in step 3 passes, and the section 7 output is recorded. The report links each criterion to its lines in each file and pastes both command results. Limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
