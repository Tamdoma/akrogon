# Brief 3: docs-links test + area docs

## 1. Goal

Add `tests/docs-links.test.ts` checking every relative link and heading anchor in README.md and `docs/guide/*.md`; update `tests/AREA.md` and `docs/reference-index.md` to describe the markdown guide. Plan decisions D7, D8.

## 2. Acceptance criteria

1. The test collects `README.md` + `docs/guide/*.md`, parses `[text](target)` links, skips `http(s)://` and `mailto:`, resolves relative targets against the linking file, requires the target file to exist, and for `#anchor` (with or without a path part) requires a heading in the target whose GitHub slug matches (lowercase, spaces→hyphens, strip punctuation that isn't alphanumeric/hyphen/underscore).
2. The checker is a function over markdown strings + resolver, so a fixture string with a dead link makes it return/fail — a negative test proves a broken relative link and a missing anchor are each reported.
3. The positive test passes on the delivered tree.
4. `tests/AREA.md`: drop the three browser lines (playwright command, `tests/browser/playwright.config.ts` key file, browser non-obvious patterns), name `tests/docs-links.test.ts` under Key files, keep the four `##` sections (Commands, Key files, Non-obvious patterns, See also) and stay ≤40 lines.
5. `docs/reference-index.md` line 7 `- [Documentation](guide/): project documentation.` → describe it as the markdown guide (e.g. `the markdown operator guide`); keep the one-line format.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `tests/command-reference.test.ts` (existing test style: bun:test, readFileSync, import.meta.dir)
- `tests/AREA.md`, `docs/reference-index.md`, `bunfig.toml` (`[test] root = "tests"` auto-discovers the new file)

## 4. Change list

- Create `tests/docs-links.test.ts`.
- Edit `tests/AREA.md`, `docs/reference-index.md`.

## 5. Do-not

- No new dependencies; use `node:fs`/`node:path` and bun:test only.
- Do not check external URLs (no network).
- Do not test prose, wording or ordering — links and anchors only.
- Do not edit README or guide pages; if a real broken link exists, return a mismatch naming it.
- Mismatch → return with evidence. Exception: revised brief from B.
- Restating: exclusions stand because scope is the test plus two index lines; only a revised brief from B overrides.

## 6. Ordered steps

1. Write the checker + tests (criteria 1,2,3). Red first: run the negative case, then positive against the tree.
2. Update `tests/AREA.md` (criterion 4).
3. Update `docs/reference-index.md` (criterion 5).
4. Run the changed-tests command and `bun test tests/docs-links.test.ts`.

Advisory: 3 files, under ~20 turns.

## 7. Commands

`AKROGON_BASE=b1bdde3105a673cf57f350b8e3c636ce3b9eee6b && bun test --changed="$AKROGON_BASE"` and `bun test tests/docs-links.test.ts`

## 8. Done-when

New test file green including both negative cases; AREA.md and reference-index updated; changed-tests pass.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
