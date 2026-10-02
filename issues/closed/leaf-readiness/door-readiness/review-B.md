# Review B: door-readiness

Date: 2026-10-02
Phase: check.review (initial, blind)
Base: `7c1567dbed492608e8cc104999c401b85d6db408`
Reviewed head: `c34f0354d5203c99f2366a184c7943aabebcf925`
Verdict: **nits**

## Scope and criteria

Read plan.md, design.md, implementation/report.md and the check-issue ponytail reference before reviewing the full three-file diff. Debate is disabled, so positions/rebuttal artifacts are not expected. No peer review was read.

- Criterion 1: the readiness example has all five schema sections, env/file inputs, producer save metadata, nested grant fixtures, retention metadata and a fork proof record. Both agreement and draft-gap tests pass against the actual schema and configuration reader.
- Criterion 2: both handoff-tree leaf listings include readiness.yaml. Preflight writes it before state.yaml and explains schema validation by status. The live status implementation calls readReadiness and gaps for leaves, consistent with this claim.
- Criterion 3: the key sheet, operator key batch and produced dependencies, scoped grant and renewal conditions, fixture cleanup/retention agreement, and producer save proof are present in the planned order. The old credential-list sentence is replaced. The operation-proof paragraph otherwise retains its behavior. Handoff confirms grants and supplies the planned draft presence command.
- Criterion 4: report maps the changed rules to binding decisions and accounts for the old-wording sweep. Independently repeated the six-term docs/skills sweep. Remaining guide, setup, seat and test hits are covered by the report and do not retain the replaced door rule.

Opened docs/guide/chart.md, docs/reference-index.md and the linked skills/tests area pages. The guide's credentials-by-name claim remains correct. Its abbreviated leaf diagram is not an exhaustive file contract. No AREA.md changed, so no changed-area path audit is required.

Live layout evidence: `readlink -f $(command -v akrogon)` returns `/home/ivan/Work/infra/akrogon/src/akrogon.ts`, matching the design's source installation assumption. The documented command uses the actual exported readGlobal, readReadiness and gaps interfaces. No live provider calls or credentials are required by this leaf.

## Fixes

None.

## Nits

N1 — `skills/chart-issues/SKILL.md:55,61`: the generic producer procedure does not explicitly repeat key-creation's requirement to revoke a newly issued key when saving fails. It proves revocation and specifies cleanup on failure, but does not directly connect save failure to key revocation. Deferred because the planned D4.2/D4.5 changes are present, shapes.md still requires copying every affected binding decision into the leaf design, and no reviewed producer implementation or emitted contract demonstrates lost revocation behavior. Promote to a Fix if a real producer contract or execution traced through this door omits that obligation and can leave an issued key active after a failed save.

## Verification

Reran checks because the diff introduces executable test code and a documentation/schema agreement test:

| Command | Result |
| --- | --- |
| `bun test tests/chart-shapes.test.ts --timeout=30000` | 2 pass, 0 fail |
| `bun test --changed=7c1567dbed492608e8cc104999c401b85d6db408 --timeout=30000` | 2 pass, 0 fail, 1 changed test file |
| `bun test --timeout=30000` | 385 pass, 0 fail, 18 files, 11.69 s |
| `bun run typecheck` | Exit 0 |
| `bun run format` | Exit 0, all files unchanged |

Worktree is clean after verification. No missing criterion proof, blocking check failure, operator action or repair is identified. No merge checks were run.

## Merge verification: 2026-10-02

Fetched origin and rebased without conflicts onto `origin/main` at `8e10eef6733eb7974f590a37c69234c54295ca63`. Prior reviewed head: `c34f0354d5203c99f2366a184c7943aabebcf925`. Rebased head: `ebc98c98ca4684ff4b799a62093a47267b4c0bc9`. Refreshed AKROGON_BASE from akrogon config to that rebase target.

`git range-diff 7c1567dbed492608e8cc104999c401b85d6db408..c34f0354d5203c99f2366a184c7943aabebcf925 8e10eef6733eb7974f590a37c69234c54295ca63..ebc98c98ca4684ff4b799a62093a47267b4c0bc9` shows all three patches unchanged:

```text
1: 578e4fb = 1: 7c612ef docs: add readiness.yaml example to chart handoff shapes
2: d338c7f = 2: 97435f1 docs: replace credential list with readiness contract rules in chart-issues
3: c34f035 = 3: ebc98c9 test: agree shapes.md readiness example with readiness schema
```

Post-rebase checks: format exit 0 with no changes; full test suite 395 pass / 0 fail across 18 files (16.87 s); typecheck exit 0; test_changed with refreshed AKROGON_BASE 2 pass / 0 fail. An initial changed-test invocation inherited the old base and also passed (387 tests); reran with the explicitly refreshed base for the actual merge evidence. No configured merge_checks or advisory commands.

Gathered all five completion-owner briefs before completion. N1 remains nonblocking, and seat-input-rules' brief explicitly owns revocation after save failure. This leaf-specific wording concern adds no reusable mechanism lesson.

Push confirmed: `git push origin HEAD:main` advanced remote main from `8e10eef` to `ebc98c9` successfully, fast-forward only.
