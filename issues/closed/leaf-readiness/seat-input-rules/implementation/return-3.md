# U3 return report — check-issue + merge-issue SKILL.md

Commit: 8b5d4f7 docs: take seat-input rules in check-issue and merge-issue

## Changed files and reasons

- skills/check-issue/SKILL.md — seat-input rules in Shared context: presence check now uses Missing: lines of akrogon status <slug>; operator stop sentence extended with name/ID, operation, identity, error, owner, next action, never a value; added grant-reuse and fixture-cleanup sentences beside the env paragraph.
- skills/merge-issue/SKILL.md — same three edits, adapted to B/review-B.md, keeping the .env.example exception clause verbatim.

## Tests run

AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408; : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000

Output:

    bun test v1.4.2 (744846f84)
    --changed: 2 changed files, but no test files are affected

     0 pass
     0 fail
    Ran 0 tests across 0 files. [10.00ms]

Markdown-only diff; zero tests ran as the brief allows. bun install ran once first (node_modules was absent).

Verification greps (brief step 4):
- grep 'akrogon status|absence_check|retained|grants[]' — hits on lines 31, 33 (check-issue) and 29, 31 (merge-issue).
- grep 'present`/`absent' on both files — no matches (exit 1).
- grep 'required live runs' skills/check-issue/SKILL.md — line 71, routing sentence intact.
- grep 'env.example' skills/merge-issue/SKILL.md — line 29, exception clause verbatim.

## Known limitations

None known. The grant-reuse operations list kept the brief canonical wording (probes, implementation, repairs, reruns, merge checks and cleanup) in check-issue for cross-file consistency even though review seats do not run every listed operation; the for-of scope limits it to what each seat does.

## Unverified criteria

None. All seven criteria verified by the step-4 greps plus full diff review; check.repair routing paragraph untouched (criterion 6).
