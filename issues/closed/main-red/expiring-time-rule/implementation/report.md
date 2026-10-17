# Implementation report: expiring-time-rule

Base: `c55432b7c93b9e6269f4748d6b36b80af9248688` (origin/main; branch already at tip, rebase a no-op)
Head: `483c693771e83aa46aa074c7576bc3e3b5beb1b3`

Run mode: serial-solo (single unit, single file; implement-issue's serial-solo rule). No workers, no sub-briefs.

## Changed files

- `skills/plan-issue/SKILL.md` — criterion-test paragraph (line 69): added the locked rule sentence `A test expectation that would stop holding as calendar time advances injects the time or computes its expected value from the time observed in the same run; deliberate elapsed-time and deadline bounds are unaffected.` after "…a case may extend an existing test file." (D1), and removed `, since main is green by the receipt gate,` from the `run-check` sentence in the same paragraph (D2). Commit `483c693`.

No test file changed or added (D3: no vanity tests; proof is reading the paragraph). No `Test-Change:` trailer needed. No docs affected (plan.md: none; no other file restates either text).

## Criterion proofs

| Criterion | Command | Commit | Result |
| --- | --- | --- | --- |
| 1: rule stated once in the criterion-test paragraph, no other skill restates it | `grep -c "injects the time or computes its expected value" skills/plan-issue/SKILL.md` | `483c693` | `1` — sits inside the paragraph beginning "With `plan.md` written" |
| 1 (sweep) | `grep -rn "as calendar time advances\|injects the time\|computes its expected value" skills/ docs/ \| grep -v "plan-issue/SKILL.md"` | `483c693` | empty (exit 1) |
| 2: clause removed | `grep -n "green by the receipt gate" skills/plan-issue/SKILL.md` | `483c693` | empty (exit 1); sentence reads `… -- <cmd>\`, and each new test is shown red …` |

## Checks

- `akrogon verify` on `483c693` (fresh checkout, all three `checks` commands): green — format, 994 tests pass, typecheck exit 0. `verify leaf 483c693…: green`. Logs: `implementation/check-test-1792228431662-697459.log`, `implementation/check-typecheck-1792228433734-697459.log`. Wall time ~146s for the test stage.

## Refresh record

- Post-commit refresh: `origin/main` still `c55432b`; branch unchanged, no moved head.

## Known limitations

None. Both done-criteria proven on the committed head; no unverified criteria.
