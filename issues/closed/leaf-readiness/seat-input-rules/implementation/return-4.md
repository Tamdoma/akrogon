# U4 return — skills/AREA.md invariant line

Commit: a09e9d37b8aec13ebae59cb3ab32629f96e16780 (`docs: update skills env invariant for seat-input rules`)

Changed files and reasons: `skills/AREA.md` — the only owned file; replaced the env-file rule line in `## Non-obvious patterns` with the new invariant naming `akrogon status <slug>` `Missing:` presence checks and `bun --env-file=<holder file> <script>` process consumption, removing the `present`/`absent` one-liner wording (criterion 1).

Tests run:
- `grep -n 'akrogon status' skills/AREA.md` → line 24 shows the new invariant line.
- `wc -l skills/AREA.md` → 31 (under the 40-line cap).
- `grep -c '^## ' skills/AREA.md` → 4 (Commands, Key files, Non-obvious patterns, See also unchanged).
- `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408 bun test --changed="$AKROGON_BASE" --timeout=30000` → "5 changed files, but no test files are affected. 0 pass 0 fail. Ran 0 tests across 0 files." Markdown-only diff ran zero tests, as the brief allows.
- `git --no-pager diff skills/AREA.md` (pre-commit) → exactly one line replaced, no other line touched (criterion 2).

Known limitations: none known.

Unverified criteria: none. Both criteria verified in the committed file.
