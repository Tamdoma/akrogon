# Review B: dead-fields

Verdict: ready.

Base: `2a759dd9daf3c8f917b5723eabfd50bbca5f670e`.
Reviewed head: `093ee084d4652925f3acc723379ba9e05d117723`.

## Findings

No Fixes or Nits. Reviewed the complete eight-file diff against plan D1–D5, criteria C1–C6, the implementation brief and report. HEAD is one commit ahead of the configured base, and `git status --porcelain` is empty. No branch changes under issues/.

The state boundary removes exactly the two legacy top-level keys. Other keys reach strict validation unchanged, and null, scalars and arrays remain invalid. The boundary shape discrimination is required for untrusted YAML and does not duplicate a validated invariant. Normal reads do not write. All production state reads use this boundary, and the removed dispatch property was the remaining production writer. Status detail naturally serializes canonical state while retaining log slot in History.

Tests exercise real files and CLI subprocesses using existing temporary-repository helpers. They do not mock the state reader or status implementation. Raw saved YAML assertions catch a writer reintroducing either field. Migration cases cover either/both keys, arbitrary legacy values, open/closed/parked paths, stable saves and preservation of supported per-seat data. Negative cases retain rejection of unknown keys, missing fields, invalid values, duplicate done slots and non-object YAML. Assertions added to output concern literal state keys and structured log fields, not prose wording.

Chart handoff guidance and its state template consistently omit the retired fields. The plan's explicit lazy-migration architecture governs the older copied bulk-rewrite resolution. Required migration references explain why literal zero-hit grep is not a functional criterion. No strings were obscured to satisfy it.

## Verification evidence

- **V1 — Commit and scope.** Inspected full base-to-head diff, caller/writer references, chart template and status serialization. `git diff <base>..HEAD --check` passed. Clean committed worktree confirmed.
- **V2 — Fail-first and changed tests.** Inspected `/tmp/akrogon-dead-fields-evidence/worker-red.txt` and `worker-green.txt`: red exit 1 with 58 pass / 14 fail, then configured changed-test exit 0 with 155 pass / 0 fail and 1478 assertions.
- **V3 — Blocking gates.** Inspected full-suite, formatting and typecheck artifacts in `/tmp/akrogon-dead-fields-evidence/`. `bun test` passed 160 tests with 1506 assertions. `bun run format` and `bun run typecheck` completed successfully during implementation. These checks apply to the unchanged reviewed code, so no redundant rerun was needed. No advisory checks are configured.
- **V4 — CLI behavior.** Inspected `/tmp/akrogon-dead-fields-evidence/detail.txt` and existing overview evidence. Implementation's edited CLI invocations against the registered repository exited zero. Detail state omits both legacy fields and preserves History's slot. Fixture CLI tests also confirm status leaves files unchanged and dispatch does not write retired fields.

## Accepted limitations

R1 remains intentional: untouched legacy files retain keys until their next normal save. R2 remains outside ownership: docs/state.html, docs/create.html and docs/next.html have stale examples or metadata wording. Both limitations were declared before implementation and do not block this bounded change.
