# Review A: seats-never-wait

Base `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`. Reviewed head `eac614fd8cdee30c91f1671135d6e18b40969700`. Blind initial review.

## Criteria

1. Met. `skills/lifecycle-rules.md` `## Unattended commands` binds lifecycle seats and implement workers and states (a) no command that waits on a human, (b) no poll or sleep loop, foreground run with a timeout above the expected time, wait inside the turn, (c) denial re-expressed inside the same grant and identity, never around a secret, `.env` or grant rule, failed stop only when nothing permitted answers, denial text verbatim, and (d) no env file path, with values from `run-check`'s declared `env`/`pass_env` or the worktree `.env`, and an undeclared value treated as a `Missing:` input. This matches all three bullets of `forks/approval-decision.md`: no human approval, harness-neutral wording, no new machinery.
2. Met. Item 3 is now a pointer. All 7 clauses of the old text appear in the section's second bullet, which I checked line by line against the base text.
3. Met. The plan-issue, implement-issue and check-issue seat-stop paragraphs each send a harness denial through the section before the `failed` stop.
4. Met. `brief-template.md` § 5 adds a standing exclusion after the `git stash` paragraph, gives its reason and states there is no exception. A worker returns a mismatch instead of taking a `failed` stop.
5. Met. `check c5-no-env-file: 1`, empty output (report). At planning the same command exited 0 with 2 hits.
6. Met. `check c6-name-status: 0`, six `M` rows, all `.md` under `skills/`.

Checks: `akrogon verify` is green on `eac614fd` (setup, format, typecheck, test). The regression proof-command correction (adding `--timeout=120000` to match the configured `test` check) meets the equivalence guard: the same 43 tests ran, and a deliberate break turned `seat skills name the known-red command` red.

AREA.md: I listed every path in `skills/AREA.md` with one shell command. Six are reported missing (`assets/`, `scripts/`, `scripts/*.ts`, `materials/<repository>/`). All are relative to a skill folder or the state home, sit on lines this diff does not touch, and existed before it. Not a finding.

Docs: no documented behavior changed. `docs/start/install.md:54` ("Seats run unattended") and `docs/reference/limits.md:17` remain true.

No test was added or changed, and no `Test-Change:` trailer is needed. No paid or live run happened.

## Nits

- N1. The added seat-stop clause sits inside the `When ...` conditional: "When a step physically requires the operator (...), and a harness denial of a command reaches this stop only when ... sends it here, the seat writes ...". The intent reads through, but the sentence parses as a joint condition. Deferred because each paragraph still names the section and the section itself states when the stop applies. It would become a Fix if a seat transcript showed a denial taken straight to `failed` while citing this paragraph.
- N2. Each seat skill's summary line "The rules this seat shares ... — grant reuse ..., `.env` ..., kept command output and the red-check judgment — live in lifecycle-rules.md" (plan-issue line 31 and the matching lines in implement-issue and check-issue) still lists four topics and leaves out unattended commands. Deferred because the seat-stop paragraphs and the lifecycle-rules header both reach the section. It would become a Fix if a seat skipped the section because of the list.

## Verdict

nits
