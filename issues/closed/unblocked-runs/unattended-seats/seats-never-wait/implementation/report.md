# Implementation report: seats-never-wait

Mode: serial-solo (plan D9, one unit). No workers or sub-briefs.
Base: `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`. Committed head: `eac614fd8cdee30c91f1671135d6e18b40969700`. Refresh: fetched `origin`, `origin/main` = base, branch not moved.

## Changed files

- `skills/lifecycle-rules.md`: new `## Unattended commands` section with (a)-(d) (D1). Header now says six rules and that the section reaches workers through `brief-template.md` § 5 (D2). The env section points to the new section instead of `bun --env-file=<file> <script>` (D3).
- `skills/implement-issue/SKILL.md`: item 3 now points to the section (D4). The seat-stop paragraph sends a harness denial to the section first (D5).
- `skills/plan-issue/SKILL.md`, `skills/check-issue/SKILL.md`: the same seat-stop sentence (D5).
- `skills/implement-issue/brief-template.md` § 5: a second standing exclusion carrying the rule for workers, with a mismatch return instead of a `failed` stop (D6).
- `skills/AREA.md`: lifecycle-rules topic list adds unattended commands, and the `.env` line drops the `bun --env-file` example (D7). 36 lines.

D4 clause check: all 7 clauses of the old item 3 appear in the section's second bullet (wait on exit and status, wait again on early return, no fixed sleep then log read, exit status is the result and never a quiet log, exact printed command once, foreground, timeout above expected run time).

## Proofs (all on `eac614fd`)

| # | Command | Result |
|---|---|---|
| 1-4 | Reviewing seat reads the texts (plan) | for review |
| 5 | `akrogon run-check --name c5-no-env-file -- git grep -n -- '--env-file' -- skills` | exit 1, empty. `check c5-no-env-file: 1 .../implementation/check-c5-no-env-file-1795648216741-2072025.log`. At planning it was exit 0 with 2 hits. |
| 6 | `akrogon run-check --name c6-name-status -- sh -c 'git diff --name-status "$AKROGON_BASE"...HEAD'` | exit 0, six `M` rows, all `.md` under `skills/`. `check c6-name-status: 0 .../implementation/check-c6-name-status-1795648216865-2072175.log` |
| reg | `akrogon run-check --name docs-links -- bun test --timeout=120000 tests/docs-links.test.ts tests/run-units.test.ts` | 43 pass, 0 fail. `check docs-links: 0 .../implementation/check-docs-links-1795648279203-2102639.log` |
| all | `akrogon verify` | `verify leaf eac614fd...: green` (setup, format, typecheck, test all 0). Wall time 131 s. |

## Proof-command correction (reg)

- Old: `bun test tests/docs-links.test.ts tests/run-units.test.ts`. On `eac614fd` it was red: two `run-units` tests hit bun's default 5000 ms timeout (`check docs-links: 1 .../implementation/check-docs-links-1795648243205-2072350.log`). Neither test reads skill text.
- New: the same files with `--timeout=120000`.
- Reason: the old command departed from the configured `test` check, which runs with `--timeout=120000`.
- Equivalence guard: the same 43 tests across the same 2 files ran. As a deliberate break, `akrogon verify --known-red` was changed to `--known-RED` in `skills/lifecycle-rules.md` and the corrected runner failed `seat skills name the known-red command` (`check docs-links-break: 1 .../implementation/check-docs-links-break-1795648284170-2141321.log`). The edit was then restored with `git checkout`.

## Limits and unverified

- Criteria 1-4 are model-choice behaviour of future seats. No run proves a seat follows the text. The reviewing seat reads it.
- The text reaches seats only after the next akrogon release is installed. Worker briefs written before then keep their old text.
- Held disagreement (C, F4): the claude deny-rule match on the wrangler command is a hypothesis.
- No paid or live run. No grant used. No test added or changed. `learnings/LESSONS.md` line 57 stays (D10).
