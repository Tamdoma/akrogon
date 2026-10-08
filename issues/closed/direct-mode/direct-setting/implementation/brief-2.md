# Brief 2: setup guide entry for direct

## 1. Goal
Document the repo setting `direct` in the operator guide. Plan decision D5.

## 2. Numbered acceptance criteria
1. docs/guide/setup.md has exactly one new bullet in the "Check these choices" list, placed after **rebuttal**. It says `direct` defaults to false, and that when true the chart door may offer the direct route at the handoff review while the operator still chooses per chart.
2. `bun test tests/docs-links.test.ts` passes.
This is a doc line, so it gets no new test.

## 3. Read-first list
- docs/guide/setup.md:45-60 (copy the existing bullet style: `- **key** sentence.`)
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces
- docs/guide/setup.md: one bullet, e.g. `- **direct** (default false) lets the chart door offer the direct route at the handoff review. The operator still chooses per chart.`
- Key name `direct`, boolean, default false.
- Owns: docs/guide/setup.md. Prerequisites: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions
- Edit no other file. The schema and tests belong to unit 1, and the design excludes skills.
- Do not describe automatic direct routing. The design forecloses it (offer only).
- Scope conflict: return a mismatch. Exception: a revised brief from A.
Reasons and exceptions restated: other files belong to other units or are excluded, and automatic routing is foreclosed. The only exception is a revised brief from A.

## 6. Ordered steps
1. Add the bullet. 2. Run the commands. 3. Commit with a plain message (no trailer, since this is not a test file).
Advisory size: 1 file, under 5 turns.

## 7. Commands
`AKROGON_BASE=f57bb356c149ed6b9d87a5e122a79d1b54de15ad bun test --changed="$AKROGON_BASE" --timeout=30000`
(Run `bun install --frozen-lockfile` first if node_modules is missing.)

## 8. Done-when, evidence and report
Bullet present, tests green, one commit. Return the commit ID.
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
