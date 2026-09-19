# Brief 2: remove HTML guide, browser tests, @playwright/test

## 1. Goal

Delete the old guide surface and its test tooling. Plan decision D6.

## 2. Acceptance criteria

1. `docs/guide/` contains no `.html` and no `.css` files (the 17 `.md` files from brief 1 remain).
2. `tests/browser/` is gone entirely (4 `.pw.ts` specs, `playwright.config.ts`, 3 per-spec configs).
3. `@playwright/test` is absent from `package.json` devDependencies and from `bun.lock` after `bun install`.
4. No other dependency or file changes.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `package.json`, `docs/guide/`, `tests/browser/`

## 4. Change list

- `git rm` (or rm) `docs/guide/*.html`, `docs/guide/style.css`, `tests/browser/` recursively.
- Remove the `@playwright/test` line from `package.json` devDependencies; run `bun install` to update `bun.lock`.

## 5. Do-not

- Do not touch `tests/AREA.md`, `docs/reference-index.md`, `tests/docs-links.test.ts` (brief 3 owns them).
- Do not remove any other devDependency.
- Do not touch the new `.md` pages.
- Mismatch → return it with evidence. Exception: revised brief from B.
- Restating: exclusions stand because later units own those files; only a revised brief from B overrides.

## 6. Ordered steps

1. Delete the HTML/CSS and `tests/browser/` (criteria 1,2).
2. Edit `package.json`, run `bun install`, confirm lockfile updated (criterion 3).
3. Run the changed-tests command.

Advisory: ~25 deleted files + 2 edited, under ~15 turns.

## 7. Commands

`AKROGON_BASE=b1bdde3105a673cf57f350b8e3c636ce3b9eee6b && bun test --changed="$AKROGON_BASE"`

## 8. Done-when

`ls docs/guide/` shows only `.md`; `tests/browser` does not exist; `grep -i playwright package.json bun.lock` is empty; changed-tests pass or run zero affected files.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
