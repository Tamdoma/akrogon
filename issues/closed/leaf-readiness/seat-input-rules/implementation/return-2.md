# U2 return — skills/implement-issue/SKILL.md

Commit: 7c5d1874bfe020b4d9b7cc478d0c0cc7dab9b368

## 8. Done-when, evidence and report

Changed files and reasons:
- `skills/implement-issue/SKILL.md` — criteria 1–3: replaced the presence-check clause of the env paragraph with the `Missing:` lines of `akrogon status <slug>` (kept tool ban and `bun --env-file=<holder file>` consumption clause); added the `produces[].save` producer-save paragraph and the `grants[]` reuse paragraph in Shared context. Criterion 4: the implement credential paragraph's absence source is now `akrogon status <slug>`'s `Missing:` lines. Criterion 5: extended the Shared-context operator stop sentence with artifact fields (name or ID, attempted operation, identity reference, error, owner, next action, never a value) and referenced the same blocker fields from the locked-decision and `"<criterion> red: <cause>"` stop variants.

Tests run:
- `bun install` — 9 packages installed (node_modules was absent).
- `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'` — output:
  ```
  bun test v1.4.2 (744846f84)
  --changed: 1 changed file, but no test files are affected

   0 pass
   0 fail
  Ran 0 tests across 0 files. [10.00ms]
  ```
  Markdown-only diff; zero tests is expected.
- Step-4 greps: `grep -n 'akrogon status\|produces\[\].save\|grants\[\]'` shows the new lines at 45, 47, 49, 59; `grep -n 'present`/`absent'` prints nothing (exit 1).

Known limitations: none known.

Unverified criteria: none — prose has no executable test; criteria 1–6 verified by grep, reread and the committed diff.
