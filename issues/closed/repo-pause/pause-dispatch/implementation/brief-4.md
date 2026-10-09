# Brief-4: operator guide (U4, wave 3)

## 1. Goal

Document pause and unpause for operators. Plan D10 context, AC9.

## 2. Numbered acceptance criteria

1. `docs/guide/next.md` documents `akrogon pause` and `akrogon unpause`, what they stop, that typed `next` commands still run, what unpause does, and how pause differs from `park`.
2. `docs/guide/cheat.md` lists `pause` and `unpause` entries.
3. `docs/guide/state.md` notes pause versus park for keeping work away from agents.
4. `docs/guide/problems.md` adds a paused-repo check to dispatch troubleshooting.
5. `bun test tests/docs-links.test.ts` passes with no broken guide links.

Smallest doc change proving 1-5. No behavior change. New prose needs no cited source.

## 3. Read-first list

- `docs/guide/next.md` park section to extend, `docs/guide/cheat.md` command entries, `docs/guide/state.md` and `docs/guide/problems.md` park mentions.
- `README.md` pause rows from U1 for wording, `src/pause.ts` plus `src/next.ts` behavior from U1 and U2 for accuracy.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Wave 3, must land first: U2, U3. Paths owned: `docs/guide/next.md`, `docs/guide/cheat.md`, `docs/guide/state.md`, `docs/guide/problems.md`. Shared test resource: none. Consumed output: U1 plus U2 behavior for accurate wording.

Changes:

- `docs/guide/next.md`: add a pause section with stop scope, manual bypass, unpause resume pass and pause versus park.
- `docs/guide/cheat.md`: add `pause` and `unpause` entries.
- `docs/guide/state.md`: one pause versus park note.
- `docs/guide/problems.md`: one paused-repo troubleshooting check.

## 5. Do-not, reasons and exceptions

- Do not touch code, tests or `README.md`. Other units own them.
- Do not touch `limits.md`, `in-practice.md` or `parts.md`. The plan marks them inspected with no change.
- Do not restate the full dispatch contract. Point at `next.md`.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons stay attached: wave safety and minimal docs. The only exception is a revised brief from A.

## 6. Ordered steps

1. Edit `docs/guide/next.md` for criterion 1.
2. Edit `docs/guide/cheat.md` for criterion 2.
3. Edit `docs/guide/state.md` for criterion 3 and `docs/guide/problems.md` for criterion 4.
4. Run the brief changed-test command for criterion 5. Commit only owned paths.

Advisory size: about 4 files and under 12 turns.

## 7. Commands

Run only this changed-test command, with the supplied base:

`AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed=3e034dee43f0853446c2ba8f97bb72668ab213dc --timeout=30000`

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-5 pass with pasted results, and the commit contains only owned paths. Link each criterion to its file. Name limits and unverified criteria or say none.

A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file. This unit touches docs only, so no trailer is expected.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
