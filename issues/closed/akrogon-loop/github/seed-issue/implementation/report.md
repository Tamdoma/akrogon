# Implementation result: seed-issue

Replaced only `skills/seed-issue/SKILL.md` with standalone GitHub intake implementing D1–D4: root-file/origin routing, unverified five-section reports, literal stdin submission and observed-result footer.

The previous implementation report did not match the current checkout and its evidence was absent. This pass implemented and verified the current skill from base `f281241901d0f1c8a2bfd5943be838fb14f5eb9c`. The sequential worker report is in `implementation/brief.md`; fresh baseline, fixture inputs, actual command/argv/stdin captures and safe boundary replay are in `verification/seed-issue.md` and linked artifacts in this authoritative leaf.

V1–V8 passed across 23 scenarios: seven successful substituted submissions, fifteen routing stops before submission and one controlled command failure without retry. Shell-sensitive text remained literal. B reviewed the skill and evidence against the plan. The skill is 68 lines and 3,539 UTF-8 bytes, below all caps, with no retired names or lifecycle commands. No grounding index is configured, and unrelated documentation is outside the plan scope.

Blocking checks on 2026-09-11:

| Command | Result |
| --- | --- |
| `bun run format` | Exit 0, all source/test files unchanged. |
| `bun test` | Exit 0, 34 passed, 0 failed, 364 assertions. |
| `bun run typecheck` | Exit 0. |
| `AKROGON_BASE=f281241901d0f1c8a2bfd5943be838fb14f5eb9c git diff --check` | Exit 0. |

Locked project dependencies were installed with `bun install --frozen-lockfile` (exit 0), with no manifest or lockfile changes. The worktree implementation diff is confined to the owned skill. Authoritative leaf artifacts are retained separately from that implementation diff. Temporary fixtures and helpers were removed.

Known limitations: routing validation was agent-followed against real fixtures, not a runtime parser. Live GitHub authentication/service behavior and independent cross-harness execution were not tested. Unreadable-file and missing-root behavior were reviewed in the text, not separately exercised. No C1–C5 criterion remains pending within the planned semantic/substituted verification method.
