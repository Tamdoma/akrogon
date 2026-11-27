# Slot B review

Base `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`. Reviewed head `eac614fd8cdee30c91f1671135d6e18b40969700`. Verdict `fix`.

## Fix

**F1. `Missing:` cannot report an undeclared variable.** In `skills/lifecycle-rules.md:32`, an undeclared variable is sent to the `Missing:` rule, which tells seats to check presence through `akrogon status` at line 15. `skills/AREA.md:29` repeats that status guidance. The real Himne `wrangler-remote-bindings` proof used `CLOUDFLARE_API_TOKEN` through `.env.local` (its `plan.md:107` and `implementation/report.md:33`). Its `readiness.yaml` declares the file only. `src/status.ts:73–76,775–776` and `src/readiness.ts:103–120` show that status emits gaps only for readiness inputs. `check review-b-himne-missing: 0 implementation/check-review-b-himne-missing-1795648544883-2875952.log`, read back with `akrogon log`, returned `No Missing: lines` on that leaf. A seat following the documented presence check gets no name or missing-input action for the required variable. This leaves criterion 1(d)'s Himne case without a working instruction. State that the seat records the undeclared variable by name and follows the existing missing-input stop even when status has no line for it. Keep the status check for declared readiness inputs. The fix fits the Markdown scope.

## Criteria and verification

- C1. Read the shared section against `forks/approval-decision.md`, the corrected `forks/seat-unattended.md` decision and the brief. The no-prompt, no-loop and permitted-reformulation instructions cover the operator decision across the stated harness profiles. The two sources for environment values agree with `docs/reference/config.md:73–74`, `constructedEnv` and `emitEnvFile`. See F1 for the undeclared-input route.
- C2. The implement pointer preserves the original wait clauses in the shared rule. It runs the exact command once in the foreground with a sufficient timeout, waits for exit and status, waits again on early return, skips fixed-sleep log checks and uses the exit status. The new rule also keeps the turn open until exit.
- C3. All three seat-stop paragraphs refer denials to the shared rule before `failed`. The recorded Himne denial would first take the permitted-reformulation path within the same grant and identity. The start of that path and the stop condition are both in the shared text.
- C4. Worker template § 5 carries the unattended rule as a standing exclusion and directs a worker with no permitted equivalent to return a mismatch to A with the denial verbatim. The actual chord-tap-editor worker's fixed-interval sleep loop is forbidden by the text. The instruction reaches new briefs after release.
- C5. `check c5-no-env-file: 1 implementation/check-c5-no-env-file-1795648216741-2072025.log` was empty on head. The planning log `check-c5-no-env-file-1795648114065-1900176.log` contained the two old examples.
- C6. `check c6-name-status: 0 implementation/check-c6-name-status-1795648216865-2072175.log` lists six modified Markdown files under `skills/`. The tracked diff and symlinks agree. Repository-root checks resolved the named `skills/AREA.md` paths, including the nested chart and watch files and the three seat links. The reference index still reaches the area.
- Regression. Accepted the reported timeout correction under the plan-synthesis equivalence rule. Both commands exercised 43 cases in the same two files. Two `run-units` cases exceeded the old default 5 seconds and passed at 6.37 and 6.60 seconds with the configured 120-second limit. The corrected proof was green (`check docs-links: 0 implementation/check-docs-links-1795648279203-2102639.log`). The separate deliberate break was scoped to the 13 docs-link cases and turned the retained literal known-red command assertion red (`check docs-links-break: 1 implementation/check-docs-links-break-1795648284170-2141321.log`). No planned case was skipped or disabled by the correction.
- Configured verification. Completed leaf receipt `5f340b54-010a-40ef-95e6-90f66893028a` matches the reviewed SHA and tree `718594ac7aec1db07b29eb33c38a9169e8d049da`. Setup, format, typecheck and test all exited 0. Read the kept logs through `akrogon log`. The full suite reported 1,544 passing tests across 106 files. No paid or live proof ran. Future seat behavior remains unobserved until release.

## Test-Change trailers

`origin/main..HEAD` contains one commit, `eac614fd8cdee30c91f1671135d6e18b40969700`, with no `Test-Change:` trailer. None is required under `src/test-files.ts` because the six changed skill Markdown paths fall outside its rule.

## 2026-11-26 check.repair

**F1 repaired in `4b1f113089cf29ed53d00e5f0a58faae9ba32f7b`.** On the reviewed head the rule called an undeclared variable “a missing input under the `Missing:` rule,” and the presence check pointed to status. The Himne status log above returned `No Missing: lines`. The repaired text explicitly directs the seat to record the variable name and the declaration needed, then stop “even if `akrogon status <slug>` has no `Missing:` line for it.” The environment section and area summary limit the status lookup to declared readiness inputs. The worker sends the same gap to A as a mismatch, as § 5 already directs.

Read criteria 1 and 2 again on the repaired head. For the Himne scenario, a seat can now record `CLOUDFLARE_API_TOKEN` and the required declaration without a status line or a secret value. The wait and denial clauses remain intact. The seat-stop and worker-template criteria 3 and 4 retain their reviewed inputs. This is a docs repair proved by reading the instructions against the recorded case, as planned for criteria 1–4. No test or live action was needed for the missing-input instruction.

- C5. `check c5-no-env-file: 1 implementation/check-c5-no-env-file-1795648646949-2952478.log`. Empty output, as expected.
- C6. `check c6-name-status: 0 implementation/check-c6-name-status-1795648646949-2952479.log`. Six modified Markdown files under `skills/`.
- Regression. `check docs-links: 0 implementation/check-docs-links-1795648673212-2952527.log`. The previously accepted 120-second command reran both files on the repair. All 43 tests passed.
- Configured verification. `akrogon verify` returned green on the committed repair. Leaf receipt `be8b8237-e23b-43d5-8bd7-39fbfe856db3` records exit 0 for setup, format, typecheck and test. The test log `implementation/check-test-1795648803121-2971298.log` reports 1,544 passing tests across 106 files. The repair changes two Markdown files under `skills/` and needs no `Test-Change:` trailer.
