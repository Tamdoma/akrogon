# Brief 2: remove hand_built from skill and guide prose

## 1. Goal

Remove every mention of `hand_built` from the chart-issues skill and the operator guide, and point the guide to `akrogon park` for keeping work away from agents. Plan decision D5.

## 2. Numbered acceptance criteria

1. `grep -n "hand_built" skills/chart-issues/SKILL.md skills/chart-issues/assets/shapes.md docs/guide/state.md docs/guide/problems.md` prints nothing.
2. `grep -n "akrogon park" docs/guide/state.md` prints a line.
3. No other sentence in those files changes meaning.

No test is needed. These are prose edits.

## 3. Read-first list

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- `skills/chart-issues/SKILL.md:59`
- `skills/chart-issues/assets/shapes.md:167`, `:259`
- `docs/guide/state.md:25-60`
- `docs/guide/problems.md:12`
- `docs/guide/next.md:42-55` (existing park wording: "Park a whole issue to remove it from the open queue", `akrogon park export-csv`)

## 4. Change list and needed interfaces

Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/state.md`, `docs/guide/problems.md`. No prerequisite units. No shared test resource.

- `SKILL.md:59`: delete the clause "; the distinct operator choice `hand_built` cannot replace completing known prerequisites". The sentence ends "...and record completion before opening a leaf." Keep the rest of the line unchanged.
- `shapes.md:167`: delete ", separately from any `hand_built` choice". The sentence ends "...recorded completion before handoff."
- `shapes.md:259`: delete the sentence "Emit `hand_built: true` only for that explicit operator choice, otherwise omit the field."
- `docs/guide/state.md`: delete the bullet "- **hand_built** keeps a leaf out of automatic dispatch." Replace the paragraph "Use hand_built when you intend to handle the leaf yourself:", its YAML example and the line "That prevents later dispatch. It does not stop an agent already working." with a short paragraph: to keep work away from agents, park its issue with `akrogon park <issue>`. Parking removes the whole issue from the open queue (see [next.md](next.md)). It does not stop an agent already working. Park acts on issues, not single leaves, so do not imply per-leaf parking. Check that `akrogon park` does not stop running agents before keeping that last sentence (read `src/park.ts`); drop it if unsure.
- `docs/guide/problems.md:12`: "Confirm the leaf is not parked or marked hand_built." becomes "Confirm the leaf's issue is not parked."

## 5. Do-not, reasons and exceptions

- Do not edit `src/` or `tests/`. Unit 1 owns them in parallel. Exception: none.
- Do not rewrite surrounding prose. Diffs stay minimal. Exception: none.
- Do not touch `issues/`. Exception: none.
- Leaf direct-route also edits SKILL.md:59 and shapes.md:259 later, so keep edits to the exact clauses above. Exception: a revised brief from A.

Reasons restated: parallel ownership, minimal diffs, `issues/` blocks the phase move, and a later leaf edits the same lines.

## 6. Ordered steps

1. Edit the four files as in section 4.
2. Run the criteria greps in section 2.
3. `bun install` then `bun run format` if it touches markdown, and keep only its changes to these four files.
4. Commit with message "docs: remove hand_built from chart-issues and the guide". No co-author line. No Test-Change trailer is needed (no test files).

Advisory size: 4 files, under 16 turns.

## 7. Commands

```sh
AKROGON_BASE=f57bb356c149ed6b9d87a5e122a79d1b54de15ad bun test --changed="$AKROGON_BASE" --timeout=30000
```

It should report no changed tests. The greps in section 2 are the real check.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold and one commit is made in the worktree. Return the commit ID and fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
