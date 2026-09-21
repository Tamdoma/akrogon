# Brief 1: replace the "Merged still under open" Judge bullet

## 1. Goal

Replace the one "Merged still under open" bullet in the watch-issues Judge section with the sibling-aware rule. Plan decisions D1–D6. This is the only unit; after it B runs the full suite and hands off.

Binding facts: worktree root is `/home/ivan/Work/infra/akrogon/issues/worktrees/merged-siblings-rule`, branch `merged-siblings-rule`, base `20926c68f7664015b23ea0224147f69059d5b881`. All commands run with cwd set to the worktree root.

## 2. Numbered acceptance criteria

- B1: `skills/watch-issues/SKILL.md` Judge section holds a "Merged still under open" bullet containing, in this order: (a) read the state files beneath the leaf's top-level owner folder under `issues/open`, an issue or an epic; (b) if any is not merged, report waiting on siblings and run no `next` for this leaf; (c) if all are merged, run `akrogon next <slug>` once this fire, then re-observe, a failed command follows the command-error rule, and remaining under open alone is not an error; (d) if sibling state cannot be read, report that gap rather than assume completion.
- B2: The wording names the top-level folder as the owner, so an epic's leaf groups with leaves of sibling issues, not only its immediate issue.
- B3: No other file differs from base; no new heading, field, command or file; the Never list is byte-identical.
- B4: The changed-test command in section 7 runs and passes (a no-tests-selected result is a pass here, reported verbatim).

Trivial one-bullet prose change: no new test is derived (plan D7).

## 3. Read-first list

- `skills/watch-issues/SKILL.md` — owned surface; the target bullet is line 37, Judge section; also read the Never list.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — fewest files, shortest working diff.
- Copy this existing pattern: single-bullet plain prose in the same Judge list (e.g. the "Command error from `next` or `phase`" bullet). Match its tone and backtick use.
- Open the repo index only if this list leaves a gap.

## 4. Change list and needed interfaces

- Edit exactly one file: `skills/watch-issues/SKILL.md`, the line `- Merged still under open: run \`akrogon next <slug>\` once; if the leaf stays, report the completion error and keep the watch.`
- Replacement bullet (use verbatim; it already satisfies B1–B2):
  `- Merged still under open: read the state files beneath the leaf's top-level owner folder under \`issues/open\`, an issue or an epic. If any is not merged, report waiting on siblings and run no \`next\` for this leaf. If all are merged, run \`akrogon next <slug>\` once this fire, then re-observe; a failed command follows the command-error rule, and remaining under open alone is not an error. If sibling state cannot be read, report that gap rather than assume completion.`
- No other interface exists for this unit. No preceding worker output.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/watch-issues/scripts/observe.ts` or its test: the observe line format is frozen by the brief (reason: downstream watch parsing; exception: none — return a mismatch instead).
- Do not touch `src/`, `tests/`, `docs/`, or any other skill: locked exclusions (reason: prose-only leaf; exception: none — return a mismatch instead).
- Do not add a heading, field, command or file, and do not alter the Never list: done-criteria forbid them (reason: review rejects scope widening; exception: none).
- Do not run the full suite: it belongs to B after the final worker (reason: ownership split; exception: none).
- Do not change the bullet's content order or drop any of the four elements: the design locks order and content (reason: locked scope; exception: a revised brief from B authorizing that change).
- If any instruction here conflicts with the live checkout, return a mismatch naming the conflicting requirement, the actual code, and the smallest brief correction instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.
- Restated: exclusions hold because the leaf is prose-only and review rejects widening; the only way past one is a revised brief from B, otherwise return a mismatch with evidence.

## 6. Ordered steps

1. Read `skills/watch-issues/SKILL.md` (Judge bullet, Never list) → B1, B2.
2. Replace the one bullet with the verbatim text from section 4 → B1, B2.
3. Run `git status --porcelain` and `git diff --stat`; confirm exactly `M skills/watch-issues/SKILL.md`. Run `grep -rn "Merged still under open" docs/ skills/ --include='*.md'` excluding the edited file context to confirm no other doc states the rule → B3.
4. Run the section 7 command → B4.

Advisory size: 1 file, under 6 turns (one file costs a read, an edit and a test run). Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

The changed-test command only, from the worktree root:

```sh
AKROGON_BASE=20926c68f7664015b23ea0224147f69059d5b881 bun test --changed="20926c68f7664015b23ea0224147f69059d5b881"
```

## 8. Done-when, evidence and report

Done when B1–B4 hold. Report the edited bullet, the pasted `git status` / `git diff --stat` / `grep` results, and the pasted changed-test output. No end-to-end artifact applies. Name limitations and unverified criteria explicitly, or state none.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
