# U1 return report — skills/plan-issue/SKILL.md

Commit: 13b2197b78ca8599b4fd30c621df44e9b9db7812

Changed files and reasons:
- skills/plan-issue/SKILL.md — replaced the env presence check with the akrogon status Missing: rule (criterion 1), replaced the bun -e credential one-liner in plan.synthesis with the Missing:-line check (criterion 2), added the produces[].save producer-save sentence and the grants[] reuse sentence in Shared context (criteria 3-4), extended both operator-blocker stop sentences with the artifact fields name or ID, attempted operation, identity reference, error, owner and next action, never a value (criterion 5). Frontmatter, plan.positions, plan.rebuttal and the printed footer untouched (criterion 6).

Tests run:
- `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'`
  Output:
  ```
  bun test v1.4.2 (744846f84)
  --changed: 1 changed file, but no test files are affected

   0 pass
   0 fail
  Ran 0 tests across 0 files. [10.00ms]
  ```
  Markdown-only diff ran zero tests; brief section 7 marks this acceptable.
- Verification greps: `grep -n 'env-file=.env -e\|bun -e'` printed nothing (exit 1); `grep -n 'akrogon status\|produces\[\].save\|grants\[\]'` showed the four new lines (31, 33, 35, 67).

Known limitations: none known.

Unverified criteria: none.
