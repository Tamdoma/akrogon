# Brief: seed-slug-cut

## What
`akrogon pull` names each seed file `<number>-<slug>.md`. The slug is the lowercased, hyphenated title cut to at most 40 characters at a hyphen boundary, never mid word. A single word longer than 40 characters is hard cut at 40. The number stays first. The empty-slug fallback `issue` is unchanged. Only `slug()` in `src/pull.ts` and `tests/pull.test.ts` change.

## Why
Slugs up to 100 characters wrap onto two lines in a directory listing. The number identifies the seed and nothing reads the words, so shortening them loses nothing.

## Done-criteria
1. `slug()` in `src/pull.ts` returns at most 40 characters, cuts at the last hyphen at or before position 40 when the hyphenated form is longer than 40, and never ends with a hyphen.
2. The existing `tests/pull.test.ts` assertion that a 150-character title yields a 100-character slug is rewritten to expect exactly 40 `x` characters.
3. A new test case pulls an issue whose title is several words exceeding 40 characters when hyphenated and asserts the file name is `<number>-<slug cut at a hyphen boundary>.md` with the slug at most 40 characters and no trailing hyphen.
4. A new test case pulls an issue whose title is a single 41-character word and asserts a 40-character slug.
5. The existing file-name regex assertion in `tests/pull.test.ts` stays green.
6. `bun test`, `bun run typecheck` and `bun run format` pass.
