# Brief-3: allocation tests at the `akrogon next` boundary (U3)

## 1. Goal

Prove done-criteria C1-C4 with `akrogon next` CLI tests against the fake herdr, asserting rects and focus rather than command strings. Covers plan U3, Wave 2.

## 2. Numbered acceptance criteria

1. `missing A beside surviving B puts A left` (C1): after `next`, layout shows `A.x + A.w <= B.x`, B keeps pane ID and agent; test fails on pre-fix allocate where A lands right of B.
2. `restores operator tab focus` (C2): prev tab in another workspace is focused again after repair; prev already in the leaf tab stays there with B as focused pane.
3. `swap failure keeps A recorded` (C3): scripted swap failure makes `next` exit nonzero with stderr naming the leaf slug and the herdr failure, exactly one swap call, no `tab close`/`pane close`, recorded A ID kept, and a second `next` starts no new pane.
4. `allocation paths unchanged` (C4): new tab, bootstrap, B-only replacement, both-present, manually reversed, and extra-pane cases run with no swap and no focus call; extra panes keep IDs and rects; an extra-pane missing-A tab still gets the C1-C3 repair.
5. No existing test expectation is changed; all existing `tests/next.test.ts` tests still pass.

## 3. Read-first list

- `tests/next.test.ts` allocation cases (copy the `dispatchFixture`/`leaf`/`database`/`calls` pattern)
- `tests/helpers.ts` (`fakeHerdr`, DB and call-log helpers)
- `tests/fake-herdr.ts` as landed by U1 (rect, layout, swap, tab focus, `failSwapOnce`)
- `src/next.ts` allocate as landed by U2, read-only (trigger and sequence)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owns: `tests/next.test.ts` only.
- Needs first: U1, U2 (both landed before this wave). Shared test resource: none. Consumes: U1 fake shapes (`pane layout --pane`, `tab list` focused, `failSwapOnce`), U2 trigger (missing-A/surviving-B non-bootstrap) and single-swap plus conditional-focus sequence.
- Assert positions by invoking the fake binary (`herdr pane layout --pane <id>` with `FAKE_HERDR` set) or by reading `rect` from the fake DB, and focus from `tab list` focused flags plus the `tab focus` call log; assert B agent from the DB and error text from `next` stderr. Keep the four `-t` filter strings in criterion titles verbatim so plan verification matches.

## 5. Do-not, reasons and exceptions

- Do not touch `src/*` or `tests/fake-herdr.ts`: U1/U2 own them and already landed. Exception: none.
- Do not change or delete an existing assertion, fixture, or recorded output: criterion 5 needs them intact. Exception: a cited brief outcome or real source the old text contradicts, returned as mismatch first.
- Do not assert only command strings for positions or focus: the design needs rect and focus state. Exception: none.
- Do not add edge cases beyond C1-C4 without a named concrete consequence on a realistic path. Exception: none.
- On any conflict with this brief or the landed U1/U2 interface, return a mismatch with evidence instead of changing scope or the interface. Exception: a revised brief from A authorizing that change.
- Restated: stay in one test file, keep old expectations, assert state not strings, no extra cases, mismatch over scope change.

## 6. Ordered steps

1. Read the allocation cases and helpers plus landed U1/U2 behavior for criteria 1-5.
2. Add the C1 test first and show one red proof: a deliberate break (for example flipped inequality) turns it red, then restore green.
3. Add the C2 focus tests for criterion 2.
4. Add the C3 swap-failure test with `failSwapOnce` plus the second-`next` no-new-pane check for criterion 3.
5. Add the C4 unchanged-paths tests for criterion 4.
6. Run the four `-t` filters then the section 7 command for criteria 1-5.
7. Commit only `tests/next.test.ts` with a `Test-Change:` trailer naming the file, the added cases, and that no existing expectation changed.

Advisory size: 1 file, under 10 turns.

## 7. Commands

Run only this, with the supplied base value (install deps first with `bun install` in this worktree if needed):

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
bun test --changed="$AKROGON_BASE" --timeout=30000
```

The four `-t` filter runs in step 6 use `bun test tests/next.test.ts --timeout=30000 -t "<filter>"`.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold, the `-t` runs and the section 7 command pass with the red proof pasted, and the commit carries the trailer. Paste command results. Link each done-criterion to its test name. Name limits and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
