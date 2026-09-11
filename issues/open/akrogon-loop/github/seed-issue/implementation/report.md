# Implementation result: seed-issue

Changed only `skills/seed-issue/SKILL.md`: replaced local intake and retired submission/import machinery with standalone GitHub intake, root-file/origin routing, literal stdin submission and the standalone footer. D1–D4 and C1–C5 are satisfied within the prescribed agent-followed verification method.

The sequential worker's completed report is in `implementation/brief.md`; detailed scenario evidence, actual argv/stdin and runnable boundary replay are in `verification/seed-issue.md` and its linked files. The baseline demonstrated the old local-file behavior. V1–V8 produced seven successful substituted creations, one controlled gh failure and 19 invalid routes stopped before submission. Shell-sensitive text was preserved literally. Temporary fixtures and helpers were deleted.

B reviewed the final skill, scope and evidence. Blocking checks on 2026-09-11:

| Command | Result |
| --- | --- |
| `bun run format` | Exit 0, all source/test files unchanged. |
| `bun test` | Exit 0, 30 passed, 0 failed, 337 assertions. |
| `bun run typecheck` | Exit 0. |
| `git diff --check` | Exit 0. |

Final scope check showed only the owned skill modified. Search found no retired names or lifecycle commands in that skill. It is 70 lines and 3,775 UTF-8 bytes, with 14 prose sentences by semantic review.

Known limitations: no real GitHub posting/authentication or independent cross-harness execution was tested. Routing scenarios were followed by an agent against real fixture contents, not enforced by a runtime parser. Unreadable routing used a directory rather than permission denial; missing-root handling was reviewed but not separately exercised. Framework routing-file shipping and stale material outside this skill remain outside scope. No implementation criterion remains unverified within the planned method.
