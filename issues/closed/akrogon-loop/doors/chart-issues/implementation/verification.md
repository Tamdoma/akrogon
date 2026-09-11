# Verification: chart-issues

## Before rewrite

The original SKILL.md is 418 lines and 6,074 tokens using gpt-tokenizer 3.4.0 (default o200k_base). Both exceed the brief's limits. The tokenizer is installed with a manifest and lockfile in a temporary verification project, not the repo or a global environment.

The original materialization-contract state example, supplied to live stateSchema.safeParse, fails on phase=consult-position, missing debate and missing blocked-by. This is a concrete invalid handoff, not a wording test.

## After rewrite

The rewritten SKILL.md is 62 lines and 1,120 tokens using the same tokenizer (gpt-tokenizer 3.4.0, o200k_base). Only SKILL.md and assets/questions.md, assets/shapes.md, assets/standing-design.md remain in the chart skill. The original standing block is retained with a current interpretation. The writer checked literal example YAML against live stateSchema and all owned local links.

Blocking commands, run by B after writer completion:

- `bun run format`: exit 0, all src/tests files unchanged.
- `bun test`: exit 0, 46 pass, 0 fail, 487 assertions across 7 files, 13.42 seconds.
- `bun run typecheck`: exit 0.
- `git diff --check`: exit 0.

The writer's targeted CLI test also passed (1 test, 11 assertions) and printed `plan-issue build slot=B phase=plan.synthesis`.

Independent reader and real handoff evidence is recorded in fresh-reader.md. The reader counted 17 coherent behavioral constraints, with exact granularity acknowledged as a judgment. Real status and next succeeded, producing synthesis B and positions A/B prompts. Source ownership, both index levels, retained chart, original report and sentinel bytes were checked. Reader preflight refused missing dependencies and occupied partial folders without changing the issues snapshot. A separate malformed-state CLI invocation exited 1 with `Missing leaf: missing`.

B inspected the actual emitted files and copied status-before.json, dispatch.json, refusals.json and missing-dispatch.json beside this report before deleting both temporary directories. The tokenizer's temporary package manifest, lockfile, dependency and all helper scripts were removed. No new permanent test/fixture machinery was added.

## Scope

Only skills/chart-issues and deletion of skills/create-issue, skills/braindump-issues and skills/consolidate-issues are changed. Old-name references outside ownership remain in README.md, docs/guide.html, new-beginning/SESSION-SUMMARY.md, new-beginning/README-jul28.md, reference/akrogon-config.yaml and reference/lessons/2026-09-05-up-duplicate-panes.md. No surviving skill references the deleted names. Historical lesson matches were not treated as implementation guidance or edited.

## Known limitation

L1: The locked standing block retains its historical human-dispatch sentence. The plan prioritizes verbatim preservation and requires the current interpretation alongside it. Brief criterion 5 cannot be claimed as literally satisfied for that quotation.

The fresh reader also noted that general mixed per-issue debate choices are not expressly defined. This is outside the tested behavior: the exercised mix follows the explicit tiny-issue no exemption plus one non-tiny yes election. No new configurability was added.
